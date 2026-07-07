# まとめページ導入とコンテンツ2本化 — 設計

> 2026-07-08 承認済み（ユーザーが「retire でいい」「そのまま実装、デプロイまで」）。
> 目的: 1テーマ内の重複（`suiri` の4レンズ分析＋`lens` 解説＋`radio` 台本が同じ概念を三重説明）を解消し、
> 1テーマ = **2コンテンツ（ラジオ＋まとめページ）** に集約する。まとめページは「世界の名著」のまとめノートと同じ体験
> （文章＋図解で概念を説明し、他分野への応用も示す）。

## 決定事項

- **ラジオは一切変更しない**（`radio.title` / `radio.audio` / `radio.script`）。音声の再生成も不要。
- **`suiri` と `lens` を廃止し、`summary` に統合**する。強めの仮説ゲーム（ガイド質問・レンズ予想の的中・視点カバー率の
  自己採点）は **retire**。仮説思考は「まとめページ冒頭の一文仮説」に軽量化して残す。
- **図解は HTML/CSS のレスポンシブ描画**（データは構造化JSON。スマホ縦画面で崩れない）。ASCIIアートやSVGは使わない。
- **互換維持**: 図鑑（`data/models.json`＋★）、ストリーク、「1ヶ月前のあなたの仮説」、localStorage スキーマ。

## `ep-N.json` 新スキーマ（`radio` は現状のまま）

```jsonc
"summary": {
  "modelId": "social-proof",        // data/models.json のID（図鑑と接続）
  "genre": "社会",
  "title": "行列は、人気の『結果』ではなく『装置』",
  "hook": {                          // 超軽量の仮説ステップ
    "event": "…出来事の要約（旧 suiri.event を短く）…",
    "question": "なぜ行列は消えないのか?"
  },
  "definition": "…一言定義（この概念は何か）…",
  "mechanism": ["…", "…", "…"],       // なぜそうなるか（箇条書き）
  "diagram": {                        // 1枚。type で描画テンプレを選ぶ
    "type": "loop",                   // "flow" | "loop" | "compare"
    "caption": "行列が行列を呼ぶ自己強化ループ",
    "nodes": ["行列ができる", "注目が集まる", "新規客が並ぶ", "行列が伸びる"]
    // compare の場合: "columns": [{ "title": "…", "items": ["…"] }, …]
  },
  "applications": [                   // ★この回の概念が他でどう応用されるか（新規執筆）
    { "domain": "EC・レビュー", "text": "…" },
    { "domain": "防災・避難",   "text": "…" },
    { "domain": "金融・バブル", "text": "…" }
  ],
  "usage": ["…使いどころ…"],
  "limits": ["…限界・効かない条件…"],
  "quiz": {                           // 適用クイズ（正解で図鑑の★が育つ。旧 lens.miniQuiz）
    "q": "…", "choices": ["…"], "answerIndex": 1, "why": "…"
  }
}
```

### 図解テンプレ（`diagram.type`）
- **flow**: `nodes[]` を矢印で連結（因果・手順）。スマホ縦では縦積み＋下向き矢印に自動整列。
- **loop**: flow の末尾から先頭へ戻る矢印を足した自己強化ループ。
- **compare**: `columns[]`（2〜3列）で対比（情報の非対称、before/after 等）。狭幅では縦積み。

## まとめページ UX（`js/matome.js`）
1. 未着手なら hook（出来事＋問い）＋一文入力（記録／スキップ可）→「めくる」。
   - 送信/スキップ時: `store.setDayLog(key, { suiri: { done:true, freeText } })`（`suiri` キーを再利用して
     「1ヶ月前」機能の互換を保つ）。`recordActivity()`。
2. 以降を開示: 一言定義 → メカニズム → 図解 → **応用（他分野）** → 使いどころ／限界 → 適用クイズ。
   - クイズ回答: `store.setDayLog(key, { quiz })` ＋ 正解で `store.starUp(modelId)`（旧 lens と同じ）。
3. 再訪時は保存済みを開いた状態で表示。

## 波及する変更
- **ナビ**: `index.html` タブ `推理`＋`レンズ` → `まとめ`（📝）1つ。`app.js` views/imports から suiri/lens を外し matome を追加。
- **home.js**: 進捗リスト 3→2（📝まとめ / 📻ラジオ）。`doneCount` は `suiri.done` と `radioDone` の2軸。
  TODAY'S PROGRAM のレンズアイコン行は廃止（`summary.genre` 表示に）。
- **sw.js**: SHELL から `js/suiri.js`/`js/lens.js` を外し `js/matome.js` を追加。`VERSION` を v6 に。
- **validate.mjs**: `suiri`/`lens` 検査を廃し `summary` 検査に。`radio.audio` 検査は現状維持。
- **js/suiri.js / js/lens.js**: 削除。
- **content/ep-1..10.json**: 新スキーマへ書き換え（重複解消の本体）。素材は既存の
  `suiri.lensAnalyses`/`keyInsight` と `lens.explanation`/`example`/`connection`/`miniQuiz` を再構成し、
  `applications`（他分野応用）を新規執筆。
- **GENERATION.md**: 2コンテンツ・新スキーマ・図解テンプレ・執筆手順に全面改訂。

## 品質・法務
- 概念は一般知識。解説・図解・応用はすべて番組の自作テキストで、既存出版物からの複製・翻案はしない。
- 応用の事例は実在・非誤導・「10年後も思考訓練として成立する」もののみ。
- 図鑑データ・localStorage・音声は破壊的変更なし（既存ユーザーの記録を壊さない）。

## 検証
- `node scripts/validate.mjs content/ep-N.json` 全通過。
- ヘッドレスChrome（モバイル390px）で まとめページ描画（hook→開示→図解→クイズ→★成長）・ナビ・ミニプレイヤーを確認。
- push[main] → Actions デプロイ → ライブ反映を WebFetch/gh で確認。
