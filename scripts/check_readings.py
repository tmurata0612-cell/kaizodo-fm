# -*- coding: utf-8 -*-
"""VOICEVOX が台本を「実際にどう読むか」を洗い出す読み検査ツール。

漢字の誤読(同形異音語・固有名詞・数字+助数詞など)を、耳ではなく機械的に特定するための道具。
エンジンの /audio_query が返す読み仮名(カタカナ)を抽出し、台本の各行と並べて出力する。
音声は生成しない(合成前の g2p 結果だけを見る)。lameenc 不要。

読みゲート(--gate)は誤読を機械的に落とす本命。純ロジックは _shared/reading-gate/ に集約
(世界の名著と共用)。各回は誤読申告 content/ep-N.readings.json が必須(=ゲートの入力)。

使い方:
  1. VOICEVOX エンジンを起動しておく(run.exe --host 127.0.0.1 --port 50021)
  2. 読みゲート(合成前・MISMATCHがあれば exit 1):
       python scripts/check_readings.py --gate           # content/ の全 ep
       python scripts/check_readings.py --gate ep-11      # 指定回だけ
     → audio_out/gate-report.md に MISMATCH(要修正)/SUSPECT(申告漏れ警告)を書く
  3. 詳細ダンプ(申告カナを決める時・目視確認):
       python scripts/check_readings.py            # content/ の ep-*.json すべて
       python scripts/check_readings.py ep-3 ep-4   # 指定した回だけ
     → audio_out/readings.md に「行テキスト → 読み仮名」を書き出す(UTF-8)
  4. 単語プローブ(覚えている誤読例の確認・辞書登録の当たり判定):
       python scripts/check_readings.py --word 資源 規格 渋滞
     → 各単語の現在の読みを audio_out/word-readings.md に書き出す

MISMATCHが出たら VOICEVOX ユーザー辞書(data/voicevox_dict.json)に登録するか台本を言い換える。
申告カナ(readings.json の kana)はVOICEVOXが出す綴りで書く(長音は ー でなくオ/ウのまま。
readings.md の確認読みをそのまま写す)。コンソールは日本語が化ける環境があるため結果は必ずファイルへ。
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# 読みゲートの共有コアは _shared/reading-gate/ にある（世界の名著とkaizodo-fmで共用）
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "_shared" / "reading-gate"))

from vv_dict import apply_user_dict
from reading_core import reading_of, reading_rows, reading_fingerprint
from reading_gate import find_mismatches, find_suspects
from readings_manifest import load_manifest

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "audio_out"
ENGINE = "http://127.0.0.1:50021"

# make_audio.py と同じ固定キャスティング(読みの検査だけなので speaker はどれでも大差ないが、
# 本番と同じ話者スタイルで確認するために揃える)
CAST = {
    "fei":    {"speaker": "青山龍星", "style": "ノーマル"},
    "hinata": {"speaker": "雨晴はう", "style": "ノーマル"},
}

KANJI_RE = re.compile(r"[一-鿿㐀-䶿]")


def api(path, method="POST", body=None, query=None):
    url = f"{ENGINE}{path}"
    if query:
        url += "?" + urllib.parse.urlencode(query)
    req = urllib.request.Request(url, method=method)
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=data, timeout=120) as r:
        raw = r.read()
        ct = r.headers.get("Content-Type", "")
    if not raw:
        return None  # DELETE 等の 204 No Content
    return json.loads(raw) if "json" in ct else raw


def resolve_style_ids():
    try:
        speakers = api("/speakers", method="GET")
    except OSError as e:
        sys.exit(f"VOICEVOXエンジンに接続できない({ENGINE})。run.exe を起動してから再実行: {e}")
    ids = {}
    for char, cast in CAST.items():
        for sp in speakers:
            if cast["speaker"] in sp["name"]:
                for st in sp["styles"]:
                    if st["name"] == cast["style"]:
                        ids[char] = st["id"]
                        break
                break
        if char not in ids:
            sys.exit(f"話者「{cast['speaker']}({cast['style']})」がエンジンに見つからない")
    return ids


def check_episodes(ep_ids, style_ids):
    if not ep_ids:
        ep_ids = sorted(
            (p.stem for p in (ROOT / "content").glob("ep-*.json")),
            key=lambda s: int(s.split("-")[1]),
        )
    lines_out = ["# 読み検査(台本 → VOICEVOX の読み仮名)", ""]
    lines_out.append("各行: `原文` の下に `→ 読み仮名[アクセント核]`。読みが想定と違う語を探す。")
    lines_out.append("アクセント核 [n]: n番目のモーラでピッチが下がる(0=平板)。")
    lines_out.append("")
    readings_map = {}
    for ep_id in ep_ids:
        path = ROOT / "content" / f"{ep_id}.json"
        if not path.exists():
            print(f"skip {ep_id}: not found")
            continue
        script = json.loads(path.read_text(encoding="utf-8"))["radio"]["script"]
        lines_out.append(f"## {ep_id}  ({len(script)}行)")
        lines_out.append("")
        for n, line in enumerate(script, 1):
            style = style_ids[line["speaker"]]
            reading = reading_of(line["text"], style, api)
            readings_map[f"{ep_id}::L{n}"] = reading
            lines_out.append(f"**L{n} [{line['speaker']}]** {line['text']}")
            lines_out.append(f"→ {reading}")
            lines_out.append("")
            print(f"  {ep_id} {n}/{len(script)}", end="\r")
        print()
    OUT_DIR.mkdir(exist_ok=True)
    out = OUT_DIR / "readings.md"
    out.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    print(f"→ {out.relative_to(ROOT)} に書き出した({len(ep_ids)}話)")
    return readings_map


# --- 無回帰確認用のベースライン/差分（辞書編集の前後で「変化した読みだけ」を見る。世界の名著と共通の型） ---
BASELINE = OUT_DIR / "readings.baseline.json"


def save_baseline(readings_map):
    OUT_DIR.mkdir(exist_ok=True)
    BASELINE.write_text(json.dumps(readings_map, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"→ ベースライン保存: {BASELINE.relative_to(ROOT)}（{len(readings_map)}行）。"
          f"以後の実行は、この読みからの変化行だけを readings.diff.md に出す")


def write_diff(readings_map):
    """ベースラインがあれば、読みが変化した行だけを readings.diff.md に書く（無回帰確認）。"""
    if not BASELINE.exists():
        print("（ベースライン未保存。辞書を編集する前に `--save-baseline` で現状を保存すると、"
              "以後は変化行だけを readings.diff.md で確認できる＝全文を読み直さずに無回帰確認できる）")
        return
    base = json.loads(BASELINE.read_text(encoding="utf-8"))
    changed = [(k, base[k], v) for k, v in readings_map.items() if k in base and base[k] != v]
    lines = ["# 読み差分（ベースライン → 現在）", "",
             "ベースライン保存後に読みが変わった行だけ。辞書編集の無回帰確認に使う"
             "（狙った語だけが変化していればOK。想定外の行が出たら複合語への波及＝回帰を疑う）。", ""]
    if not changed:
        lines.append("**差分なし**。ベースラインから読みは1行も変わっていない。")
    else:
        for k, before, after in changed:
            lines += [f"**{k}**", f"- 旧: {before}", f"- 新: {after}", ""]
    out = OUT_DIR / "readings.diff.md"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"→ 変化 {len(changed)}行 を {out.relative_to(ROOT)} に書き出した")


def check_words(words, style_ids):
    style = style_ids["fei"]  # 読みは話者に依らないので代表で1つ
    lines_out = ["# 単語プローブ(現在の読み)", ""]
    for w in words:
        reading = reading_of(w, style, api)
        lines_out.append(f"- `{w}` → {reading}")
    OUT_DIR.mkdir(exist_ok=True)
    out = OUT_DIR / "word-readings.md"
    out.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    print(f"→ {out.relative_to(ROOT)} に {len(words)} 語ぶん書き出した")


# --- 読みゲート（合成せずに誤読を機械的に落とす。_shared/reading-gate のコアを使う） ---

def _load_dict_words():
    from vv_dict import DICT_PATH
    if not DICT_PATH.exists():
        return []
    return json.loads(DICT_PATH.read_text(encoding="utf-8")).get("words", [])


def _load_traps():
    """既知の同形異音トラップ表（申告漏れ検出=SUSPECT用）。無ければ空。"""
    p = ROOT / "data" / "reading_traps.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


def _ep_paths(ep_ids):
    if not ep_ids:
        ep_ids = sorted(
            (p.stem for p in (ROOT / "content").glob("ep-*.json")),
            key=lambda s: int(s.split("-")[1]),
        )
    return [ROOT / "content" / f"{ep_id}.json" for ep_id in ep_ids]


def run_gate(paths, style_ids, api, dict_words, trap_surfaces):
    """合成せずに誤読ゲートを実行。未解決MISMATCH（＋マニフェスト未作成/不正）の総数を返す。
    0 なら合格。副作用として audio_out/gate-report.md を書く。SUSPECTは警告どまり（非ブロック）。"""
    lines = ["# 読みゲート結果", "",
             "MISMATCH=申告カナと実読みの不一致（要辞書修正 or 台本言い換え）。"
             "SUSPECT=申告漏れの疑い（要確認・非ブロック）。", ""]
    fail = 0
    for path in paths:
        ep_id = path.stem
        if not path.exists():
            print(f"skip {ep_id}: not found")
            continue
        script = json.loads(path.read_text(encoding="utf-8"))["radio"]["script"]
        rows = reading_rows(script, style_ids, api)
        fp = reading_fingerprint(rows)
        lines.append(f"## {ep_id}  (fp={fp[:8]})")
        try:
            manifest = load_manifest(path)  # content/ep-N.readings.json
        except (ValueError, json.JSONDecodeError) as e:
            fail += 1
            lines += [f"- ❌ MANIFEST不正: {e}", ""]
            continue
        if manifest is None:
            fail += 1
            lines += [f"- ❌ MANIFEST未作成（content/{ep_id}.readings.json が必要）", ""]
            continue
        mism = find_mismatches(rows, manifest)
        susp = find_suspects(script, manifest, dict_words, trap_surfaces)
        fail += len(mism)
        if not mism and not susp:
            lines.append("- ✅ 合格（MISMATCH 0 / SUSPECT 0）")
        for m in mism:
            lines.append(f"- ❌ MISMATCH `{m['surface']}` 期待={m['kana']} / 実={m['line_reading']}")
            lines.append(f"      行: {m['line_text']}")
        for s in susp:
            lines.append(f"- ⚠ SUSPECT `{s['surface']}`（{s['why']}）")
        lines.append("")
    OUT_DIR.mkdir(exist_ok=True)
    (OUT_DIR / "gate-report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"→ audio_out/gate-report.md（未解決 {fail} 件）")
    return fail


def main():
    args = sys.argv[1:]
    style_ids = resolve_style_ids()
    n = apply_user_dict(api)  # 本番と同じ辞書を反映してから読みを見る
    print(f"ユーザー辞書を反映: {n}語")
    if args and args[0] == "--gate":
        rest = args[1:]
        if any(not re.fullmatch(r"ep-\d+", a) for a in rest):
            sys.exit("usage: python scripts/check_readings.py --gate [ep-N ...]")
        fail = run_gate(_ep_paths(rest), style_ids, api, _load_dict_words(), _load_traps())
        sys.exit(1 if fail else 0)
    elif args and args[0] == "--word":
        words = args[1:]
        if not words:
            sys.exit("usage: python scripts/check_readings.py --word 語1 語2 ...")
        check_words(words, style_ids)
    else:
        # `--save-baseline`: 現在の読みを無回帰確認のベースラインとして保存（辞書編集の直前に打つ）
        save_baseline_flag = "--save-baseline" in args
        args = [a for a in args if a != "--save-baseline"]
        if args and any(not re.fullmatch(r"ep-\d+", a) for a in args):
            sys.exit("usage: python scripts/check_readings.py [ep-N ...] [--save-baseline] | --word 語1 語2 ...")
        readings_map = check_episodes(args, style_ids)
        if save_baseline_flag:
            save_baseline(readings_map)
        else:
            write_diff(readings_map)  # ベースラインがあれば変化行だけを readings.diff.md に


if __name__ == "__main__":
    main()
