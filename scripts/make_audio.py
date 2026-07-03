# -*- coding: utf-8 -*-
"""ラジオ本編の音声を VOICEVOX で生成し、エピソードJSONに radio.audio を書き戻す。

使い方:
  1. VOICEVOX エンジンを起動しておく(run.exe --host 127.0.0.1 --port 50021)
  2. python scripts/make_audio.py ep-1 [ep-2 ...]
  3. 出力: audio_out/ep-N.mp3(git管理外)。アップロードは
     gh release upload audio-v1 audio_out/ep-N.mp3 --clobber

依存: pip install lameenc(このPCでは --trusted-host pypi.org --trusted-host files.pythonhosted.org が必要)
声のキャスティングは GENERATION.md「音声生成」の固定値。勝手に変えない。
"""
import json
import re
import struct
import sys
import urllib.parse
import urllib.request
from pathlib import Path

import lameenc

from vv_dict import apply_user_dict

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "audio_out"
ENGINE = "http://127.0.0.1:50021"
RELEASE_URL = "https://github.com/tmurata0612-cell/kaizodo-fm/releases/download/audio-v1/{ep}.mp3"
SAMPLE_RATE = 24000
BIT_RATE = 48

# 固定キャスティング(ユーザー決定事項)。style id は実行時に名前から解決する
CAST = {
    "fei":    {"speaker": "青山龍星", "style": "ノーマル", "speedScale": 1.0},
    "hinata": {"speaker": "雨晴はう", "style": "ノーマル", "speedScale": 1.1},
}


def api(path, method="POST", body=None, query=None):
    url = f"{ENGINE}{path}"
    if query:
        url += "?" + urllib.parse.urlencode(query)
    req = urllib.request.Request(url, method=method)
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, data=data, timeout=300) as r:
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


def synth_pcm(text, style_id, speed):
    """1行を合成し、16bit PCM(ヘッダなし)を返す。"""
    q = api("/audio_query", query={"text": text, "speaker": style_id})
    q["speedScale"] = speed
    q["outputSamplingRate"] = SAMPLE_RATE
    q["outputStereo"] = False
    wav = api("/synthesis", query={"speaker": style_id}, body=q)
    i = 12  # RIFFヘッダの後から data チャンクを探す
    while i + 8 <= len(wav):
        cid, size = wav[i:i + 4], struct.unpack("<I", wav[i + 4:i + 8])[0]
        if cid == b"data":
            return wav[i + 8:i + 8 + size]
        i += 8 + size + (size % 2)
    raise ValueError("WAVに data チャンクがない")


def make_episode(ep_id, style_ids):
    path = ROOT / "content" / f"{ep_id}.json"
    ep = json.loads(path.read_text(encoding="utf-8"))
    script = ep["radio"]["script"]
    if any(re.search(r"\{\{\w+\}\}", l["text"]) for l in script):
        sys.exit(f"{ep_id}: 台本に変数枠({{{{...}}}})が残っている。音声化できないので台本を修正すること")

    line_start = []
    pcm_total = b""
    for n, line in enumerate(script, 1):
        cast = CAST[line["speaker"]]
        line_start.append(round(len(pcm_total) / 2 / SAMPLE_RATE, 2))
        pcm_total += synth_pcm(line["text"], style_ids[line["speaker"]], cast["speedScale"])
        print(f"  {ep_id} {n}/{len(script)} 行目", end="\r")
    duration = round(len(pcm_total) / 2 / SAMPLE_RATE, 2)

    enc = lameenc.Encoder()
    enc.set_bit_rate(BIT_RATE)
    enc.set_in_sample_rate(SAMPLE_RATE)
    enc.set_channels(1)
    enc.set_quality(2)
    mp3 = bytes(enc.encode(pcm_total)) + bytes(enc.flush())

    OUT_DIR.mkdir(exist_ok=True)
    out = OUT_DIR / f"{ep_id}.mp3"
    out.write_bytes(mp3)

    ep["radio"]["audio"] = {
        "url": RELEASE_URL.format(ep=ep_id),
        "durationSec": duration,
        "lineStartSec": line_start,
    }
    # script より前に audio が来るようキーを並べ直す(既存ファイルの見た目に合わせる)
    radio = ep["radio"]
    ep["radio"] = {k: radio[k] for k in ("title", "audio", "script") if k in radio}
    path.write_text(json.dumps(ep, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"\n{ep_id}: {duration/60:.1f}分 / {len(mp3)//1024}KB → {out.relative_to(ROOT)}(radio.audio 書き戻し済み)")


def main():
    ep_ids = sys.argv[1:]
    if not ep_ids or any(not re.fullmatch(r"ep-\d+", e) for e in ep_ids):
        sys.exit("usage: python scripts/make_audio.py ep-N [ep-M ...]")
    style_ids = resolve_style_ids()
    n = apply_user_dict(api)
    print(f"ユーザー辞書を反映: {n}語")
    for ep_id in ep_ids:
        make_episode(ep_id, style_ids)


if __name__ == "__main__":
    main()
