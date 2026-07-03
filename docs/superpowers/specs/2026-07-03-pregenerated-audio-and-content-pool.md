# 作り置きコンテンツ+事前生成音声への全面移行 — 設計

- 日付: 2026-07-03
- 対象: コンテンツ運用全体、`js/player.js` `js/app.js` `js/radio.js` `sw.js` `content/` スキーマ、生成パイプライン
- 本スペックは `2026-07-03-background-playback-design.md`(Media Session + speechSynthesis 案)を**置き換える**

## 背景・目的

speechSynthesis はブラウザ・OS のバックグラウンド制限で再生が停止する根本限界があり、Media Session を足しても解決しない。事前生成した音声ファイルを `<audio>` で再生する方式に切り替える。

あわせてコンテンツ運用も見直す。毎朝のクラウド日次生成(claude.ai ルーティン)は「壊れる場所」になるため全廃し、**作り置きプール方式**に移行する。日次で動くバッチはゼロになる。

## 確定した意思決定(2026-07-03 のセッションで決定)

| 論点 | 決定 | 理由 |
|---|---|---|
| 再生方式 | 事前生成 MP3 + `<audio>` + Media Session | speechSynthesis のバックグラウンド停止は回避不能 |
| 音声の置き場 | GitHub Releases(固定タグ `audio-v1` に資産として追加) | リポジトリ・Pages の 1GB 制限の外。容量/帯域は実質無制限(1ファイル2GiB未満のみ)。過去回の音声も永続 |
| 音声化の範囲 | **ラジオ本編のみ**。推理・レンズの行タップ読み上げは speechSynthesis 維持 | バックグラウンド再生が必要なのはラジオだけ。ファイル数と生成コストを最小化 |
| TTS エンジン | VOICEVOX(ローカルPCで生成)。**フェイ=青山龍星(ノーマル)、ヒナタ=雨晴はう(speedScale 1.1)** | 聴き比べ4+6パターンからユーザー選定(パターンC-7)。無料・商用可 |
| クレジット | アプリ内に「VOICEVOX:青山龍星」「VOICEVOX:雨晴はう」を表示 | VOICEVOX 利用規約の必須条件 |
| 音声フォーマット | MP3 48kbps mono 24kHz(lameenc でエンコード) | 1話約8分 ≈ 3MB。サンプル生成で品質確認済み |
| コンテンツ運用 | 日次生成を全廃。**初期50本の作り置きプール**を日替わりローテーション。以降はユーザーがこのプロジェクトで頼んだときに追加 | 日次バッチを減らして運用不安を消す(ユーザー意向) |
| 日次ルーティン | claude.ai ルーティン `trig_01GnFp8mf86GeQMGjQc2fAWd` を削除 | 不要になるため |

## コンテンツ構造の変更

### エピソードプール

- `content/ep-N.json`(N=1..50)。スキーマは現行の日次エピソードと同じだが、`date` フィールドは廃止し `"id": "ep-N"` に置き換える
- 題材は「10年後に読んでも思考訓練として成立する」実在の出来事・現象に限定(GENERATION.md の題材基準を改訂)
- 既存の evergreen 2本(`content/evergreen/ev-1,ev-2.json`)は `ep-1`, `ep-2` に改名してプールへ編入。`content/evergreen/` フォルダは廃止
- 既存の日次回 `content/2026-07-02.json` はアーカイブとしてそのまま残す(推理の題材が時事のため、プールには入れない)

### 音声メタデータ(radio.audio)

ラジオ台本を持つエピソード JSON に追記する:

```json
"radio": {
  "title": "…",
  "audio": {
    "url": "https://github.com/tmurata0612-cell/kaizodo-fm/releases/download/audio-v1/ep-1.mp3",
    "durationSec": 492.3,
    "lineStartSec": [0, 6.8, 14.2]
  },
  "script": [ … ]
}
```

- `lineStartSec[i]` = `script[i]` の開始秒。生成パイプラインが行ごとの PCM 長から算出する(行数と必ず一致)
- `audio` が無いエピソード(2026-07-02 等の過去回)は従来どおり speechSynthesis で再生(後方互換)

### content/index.json

```json
{
  "pool": [
    { "id": "ep-1", "topic": "…", "genre": "…", "lensIds": […], "modelId": "…" }
  ],
  "archive": [
    { "date": "2026-07-02", "topic": "…", "genre": "…", "lensIds": […], "modelId": "…" }
  ]
}
```

`latest` / `episodes` / `evergreen` は廃止。`pool` の `modelId`/`topic` 一覧が重複回避の台帳を兼ねる。

## アプリの変更

### js/app.js

- `EV_COUNT` 定数と evergreen ローテーションを廃止
- 当日番組の解決: `dayNum % pool.length` で決める(同じ日は必ず同じ回。既存 `resolveInitialEpisode()` の evergreen ロジックの一般化)
- `setEpisode(key)`: `ep-N` は `content/ep-N.json`、`YYYY-MM-DD` は従来パス(アーカイブ互換)
- `catalog()`: `pool` + `archive` を返す

### js/player.js — 二段構えの再生エンジン

- エピソードに `radio.audio` があればラジオ再生は `<audio>` エンジン、なければ従来の speechSynthesis エンジン。**公開 API(play/pause/prev/next/seek/rate)と状態イベントは現行のまま**にし、UI 側(radio.js/ミニプレイヤー)の変更を最小化する
- `<audio>` エンジン:
  - 行タップ/prev/next → `audio.currentTime = lineStartSec[i]`
  - 現在行のハイライト → `timeupdate` で `lineStartSec` を二分探索
  - 再生速度 → `audio.playbackRate`(既存の6段階をそのまま適用)
  - Media Session: metadata(番組タイトル・現在行・アートワーク)と play/pause/previoustrack/nexttrack ハンドラを設定(旧スペックの設計をそのまま `<audio>` に適用)
- 推理・レンズの行タップ読み上げは speechSynthesis 経路を維持

### その他

- `js/settings.js` または `index.html` フッター: VOICEVOX クレジット表記を追加
- `sw.js`: `VERSION` を上げる。音声はプリキャッシュせず、再生時にランタイムキャッシュ(cross-origin、当日分のみ保持)
- `scripts/validate.mjs`: `id` 形式、`radio.audio` の整合(`lineStartSec.length === script.length`、単調増加、`url` の形式)を検証項目に追加

## 生成パイプライン(ローカルPC、リポジトリに同梱)

`scripts/make_audio.py`(新規):

1. VOICEVOX エンジン(`http://127.0.0.1:50021`)の起動を確認(スピーカー名→style id は実行時に `/speakers` から解決)
2. `content/ep-N.json` の `radio.script` を行ごとに `audio_query` → `synthesis`(24kHz mono)
3. 行ごとの PCM 長から `lineStartSec` を算出し、PCM を連結して lameenc で MP3 化(48kbps)
4. `radio.audio` を JSON に書き戻す
5. 出力: `audio_out/ep-N.mp3`

アップロード: `gh release upload audio-v1 audio_out/ep-N.mp3 --clobber`(初回のみ `gh release create audio-v1`)。

エンジンの入手: GitHub `VOICEVOX/voicevox_engine` の Releases から windows-cpu 版を取得(このPCでは 0.25.2 で動作確認済み。`gh release download` を使う — このPCは curl/pip が SSL 検証で失敗する環境のため)。

## 運用フロー(エピソード追加時 — 依頼ベース)

1. このプロジェクトのセッションで台本を生成(改訂版 GENERATION.md に従う)
2. `node scripts/validate.mjs content/ep-N.json`
3. `python scripts/make_audio.py ep-N` → mp3 生成 + JSON 書き戻し
4. `gh release upload audio-v1 audio_out/ep-N.mp3`
5. `index.json` の `pool` に追記、`data/models.json` の `deliveredOn` に作成日を記入
6. commit / push

## 既知の制約

- 一部 Android メーカーのバッテリー最適化がタブ/PWA を強制終了しうる(旧スペックから引き継ぎ。Webアプリの範囲外)
- VOICEVOX の声はローカル生成のため、台本の微修正でも音声の再生成+再アップロードが必要
- Releases の音声 URL はリポジトリ名に依存する。リポジトリ改名時は全 JSON の `url` を書き換える

## テスト方針

- `validate.mjs` 全件パス(スキーマ変更後)
- ヘッドレスChrome(モバイル390px): `<audio>` 経路の再生/行タップ/速度変更/ミニプレイヤー、`audio` なしエピソードの speechSynthesis フォールバック
- 実機(Android Chrome): 画面ロック・アプリ切替で再生継続、ロック画面コントロール、Bluetooth操作

## 実装順序

1. スキーマ改訂 + `make_audio.py` + 試作1本(ep-1 = 旧 ev-1 を音声化し Releases に置く)
2. アプリ改修(player/app/radio/settings/sw/validate)→ ヘッドレス検証
3. 実機でバックグラウンド再生を確認(ここで初めて方式の成否が確定する。**以降の台本量産より先にやる**)
4. 台本49本のバッチ生成(数セッションに分割、validate 必須)
5. 音声49本の一括生成 + アップロード
6. CLAUDE.md・メモリ更新
