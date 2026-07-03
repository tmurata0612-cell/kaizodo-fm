# -*- coding: utf-8 -*-
"""VOICEVOX ユーザー辞書(読み・アクセント矯正)をエンジンへ反映する共有モジュール。

data/voicevox_dict.json を唯一の正とし、make_audio.py / check_readings.py の
合成前に apply_user_dict() を呼ぶ。冪等: 管理下の surface と同じ既存エントリは
一度削除してから登録し直すので、何度呼んでも重複しない。ユーザーが手で足した
辞書エントリ(管理外の surface)には触らない。
"""
import json
from pathlib import Path

DICT_PATH = Path(__file__).resolve().parent.parent / "data" / "voicevox_dict.json"


def apply_user_dict(api):
    """辞書を反映し、登録語数を返す。api は呼び出し側と同じシグネチャの関数
    (api(path, method=..., body=..., query=...))。DELETE は空レスポンスを返すため
    api 側で空ボディを None にできること。"""
    if not DICT_PATH.exists():
        return 0
    words = json.loads(DICT_PATH.read_text(encoding="utf-8")).get("words", [])
    managed = {w["surface"] for w in words}
    existing = api("/user_dict", method="GET") or {}
    for uid, w in existing.items():
        if w.get("surface") in managed:
            api(f"/user_dict_word/{uid}", method="DELETE")
    for w in words:
        api("/user_dict_word", query={
            "surface": w["surface"],
            "pronunciation": w["pronunciation"],
            "accent_type": w["accent_type"],
            "word_type": w.get("word_type", "COMMON_NOUN"),
            "priority": w.get("priority", 8),
        })
    return len(words)
