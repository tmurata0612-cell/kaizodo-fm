# -*- coding: utf-8 -*-
"""kaizodo-fm の読みゲート・ドライバ(JSON台本用の run_gate)のテスト。
純ロジックは _shared/reading-gate/tests でテスト済み。ここは JSON への適応部分を見る。"""
import json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))  # scripts/ を import path に
import check_readings as cr

EP = {
    "id": "ep-99",
    "summary": {},
    "radio": {"title": "t", "script": [{"speaker": "fei", "text": "身銭を切る"}]},
}


def _api_with(reading_for_migeni):
    """身銭 を reading_for_migeni に置換して返す偽エンジン(1文字1モーラの簡易g2p)。"""
    def api(path, method="POST", body=None, query=None):
        kana = query["text"].replace("身銭", reading_for_migeni)
        return {"accent_phrases": [{"moras": [{"text": c} for c in kana], "accent": 0}]}
    return api


class TestGateDriver(unittest.TestCase):
    def _episode(self, d, manifest):
        content = Path(d) / "content"
        content.mkdir(parents=True)
        p = content / "ep-99.json"
        p.write_text(json.dumps(EP, ensure_ascii=False), encoding="utf-8")
        if manifest is not None:
            (content / "ep-99.readings.json").write_text(
                json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
        return p

    def test_pass_when_reading_correct(self):
        with tempfile.TemporaryDirectory() as d:
            p = self._episode(d, [{"surface": "身銭", "kana": "ミゼニ"}])
            cr.OUT_DIR = Path(d) / "audio_out"
            n = cr.run_gate([p], {"fei": 3}, _api_with("ミゼニ"), [], [])
            self.assertEqual(n, 0)
            self.assertTrue((cr.OUT_DIR / "gate-report.md").exists())

    def test_mismatch_makes_gate_fail(self):
        with tempfile.TemporaryDirectory() as d:
            p = self._episode(d, [{"surface": "身銭", "kana": "ミゼニ"}])
            cr.OUT_DIR = Path(d) / "audio_out"
            n = cr.run_gate([p], {"fei": 3}, _api_with("シンセン"), [], [])
            self.assertGreaterEqual(n, 1)  # 誤読(シンセン)を捕まえる

    def test_missing_manifest_makes_gate_fail(self):
        with tempfile.TemporaryDirectory() as d:
            p = self._episode(d, None)
            cr.OUT_DIR = Path(d) / "audio_out"
            n = cr.run_gate([p], {"fei": 3}, _api_with("ミゼニ"), [], [])
            self.assertGreaterEqual(n, 1)  # マニフェスト未作成で不合格

    def test_malformed_manifest_makes_gate_fail(self):
        with tempfile.TemporaryDirectory() as d:
            p = self._episode(d, None)
            (p.with_name("ep-99.readings.json")).write_text("{ not valid json", encoding="utf-8")
            cr.OUT_DIR = Path(d) / "audio_out"
            n = cr.run_gate([p], {"fei": 3}, _api_with("ミゼニ"), [], [])
            self.assertGreaterEqual(n, 1)  # 不正JSONはクラッシュせず不合格


if __name__ == "__main__":
    unittest.main()
