# -*- coding: utf-8 -*-
"""VOICEVOX が台本を「実際にどう読むか」を洗い出す読み検査ツール。

漢字の誤読(同形異音語・固有名詞・数字+助数詞など)を、耳ではなく機械的に特定するための道具。
エンジンの /audio_query が返す読み仮名(カタカナ)を抽出し、台本の各行と並べて出力する。
音声は生成しない(合成前の g2p 結果だけを見る)。lameenc 不要。

使い方:
  1. VOICEVOX エンジンを起動しておく(run.exe --host 127.0.0.1 --port 50021)
  2. エピソード検査:
       python scripts/check_readings.py            # content/ の ep-*.json すべて
       python scripts/check_readings.py ep-3 ep-4   # 指定した回だけ
     → audio_out/readings.md に「行テキスト → 読み仮名」を書き出す(UTF-8)
  3. 単語プローブ(覚えている誤読例の確認・辞書登録の当たり判定):
       python scripts/check_readings.py --word 資源 規格 渋滞
     → 各単語の現在の読みを audio_out/word-readings.md に書き出す

読みが想定と違う語が見つかったら、VOICEVOX ユーザー辞書に登録して直す(make_audio.py 側で読み込む想定)。
コンソールは日本語が化ける環境があるため、結果は必ずファイルへ書く。
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from vv_dict import apply_user_dict

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


def reading_of(text, style_id):
    """text を g2p した読み仮名(カタカナ)を返す。アクセント句境界は半角スペース、休止は読点。"""
    q = api("/audio_query", query={"text": text, "speaker": style_id})
    parts = []
    for ap in q["accent_phrases"]:
        kana = "".join(m["text"] for m in ap["moras"])
        # アクセント核の位置を [n] で添える(0=平板)。イントネーションの不自然さの手掛かり
        parts.append(f"{kana}[{ap['accent']}]")
        if ap.get("pause_mora"):
            parts.append("、")
    return " ".join(p for p in parts if p)


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
            reading = reading_of(line["text"], style)
            lines_out.append(f"**L{n} [{line['speaker']}]** {line['text']}")
            lines_out.append(f"→ {reading}")
            lines_out.append("")
            print(f"  {ep_id} {n}/{len(script)}", end="\r")
        print()
    OUT_DIR.mkdir(exist_ok=True)
    out = OUT_DIR / "readings.md"
    out.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    print(f"→ {out.relative_to(ROOT)} に書き出した({len(ep_ids)}話)")


def check_words(words, style_ids):
    style = style_ids["fei"]  # 読みは話者に依らないので代表で1つ
    lines_out = ["# 単語プローブ(現在の読み)", ""]
    for w in words:
        reading = reading_of(w, style)
        lines_out.append(f"- `{w}` → {reading}")
    OUT_DIR.mkdir(exist_ok=True)
    out = OUT_DIR / "word-readings.md"
    out.write_text("\n".join(lines_out) + "\n", encoding="utf-8")
    print(f"→ {out.relative_to(ROOT)} に {len(words)} 語ぶん書き出した")


def main():
    args = sys.argv[1:]
    style_ids = resolve_style_ids()
    n = apply_user_dict(api)  # 本番と同じ辞書を反映してから読みを見る
    print(f"ユーザー辞書を反映: {n}語")
    if args and args[0] == "--word":
        words = args[1:]
        if not words:
            sys.exit("usage: python scripts/check_readings.py --word 語1 語2 ...")
        check_words(words, style_ids)
    else:
        if args and any(not re.fullmatch(r"ep-\d+", a) for a in args):
            sys.exit("usage: python scripts/check_readings.py [ep-N ...] | --word 語1 語2 ...")
        check_episodes(args, style_ids)


if __name__ == "__main__":
    main()
