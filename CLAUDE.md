# 解像度FM — リポジトリガイド

ユーザーの思考力(仮説思考・世界の解像度)を高める日刊ラジオ型PWA。**作り置きエピソードプール**(content/ep-N.json、初期50本目標)を日替わりローテーションで配信 → GitHub Pagesで配信 → スマホPWAで消費する。ラジオ本編はVOICEVOXで事前生成したMP3(GitHub Releases配信)、日次バッチはゼロ。個人データはユーザー端末のlocalStorageのみ。

- **コンテンツ生成の唯一の正**: `GENERATION.md`(キャラ設定・品質基準・スキーマ・手順)。エピソード追加は必ずこれに従う
- **検証**: `node scripts/validate.mjs content/<file>.json` を commit 前に必ず通す
- **設計の全記録**: 承認済みプラン `C:\Users\PC_User\.claude\plans\typed-sniffing-reef.md`(ローカルPC)
- **構成**: ビルド工程なしの vanilla JS (ES modules)。`js/app.js`が起動と画面切替、`js/store.js`がlocalStorage層、各タブは`js/{suiri,lens,radio,zukan,kiroku,settings,home}.js`
- **キャラ**: フェイ(MC/fei)とヒナタ(hinata)。`data/characters.json` + GENERATION.mdのキャラバイブル参照

## 現在のステータス (2026-07-03 時点)

完了:
- コンテンツ基盤(data/models.json 100個、data/lenses.json 16本、characters、validate.mjs、GENERATION.md)
- PWAアプリ全実装(index.html, css, js/全モジュール, manifest, sw.js, icon.svg)
- 初期コンテンツ3本(content/2026-07-02.json + evergreen/ev-1,ev-2)— **validate全通過済み**
- ユーザーフィードバック第1弾を全反映(グローバル再生 `js/player.js`・ミニプレイヤー・シークバー/行タップ再生・速度6段階・自然音声の自動選択・設定保存で元画面復帰・図鑑詳細・アーカイブおかわり・キャラ雑談オープニング・モバイルレイアウト)
- ヘッドレスChrome(モバイル390px viewport)で全17項目の動作検証PASS。アーカイブ行タップ時の navigate(undefined) バグを修正済み
- 初回 git commit 済み(b0edb9b)。git identity はリポジトリローカルに設定済み
- 設計スペックを `docs/superpowers/specs/2026-07-02-kaizodo-fm-design.md` に保存済み(個人情報は削除済み)
- **公開リポジトリ作成・push済み**: https://github.com/tmurata0612-cell/kaizodo-fm
- **GitHub Pages 公開済み**(main / root): https://tmurata0612-cell.github.io/kaizodo-fm/
- **作り置きプール+事前生成音声方式への全面移行を決定**(2026-07-03): 設計は `docs/superpowers/specs/2026-07-03-pregenerated-audio-and-content-pool.md` が唯一の正。決定事項: 音声はGitHub Releases(タグ `audio-v1`)、ラジオ本編のみ音声化、TTS=VOICEVOX(**フェイ=青山龍星ノーマル、ヒナタ=雨晴はう speed1.1** — ユーザーが聴き比べで選定、変更禁止)、MP3 48kbps mono、初期50本→以降は依頼ベースで追加。GENERATION.mdも改訂済み
- 日次生成ルーティン(`trig_01GnFp8mf86GeQMGjQc2fAWd`)は**無効化済み**(APIでは削除不可。完全削除はユーザーが https://claude.ai/code/routines から)
- 声の聴き比べサンプル生成環境がスクラッチパッドにある(VOICEVOX 0.25.2 windows-cpu、edge-tts、lameenc)。ただしスクラッチパッドはセッション毎に変わるため、次セッションではVOICEVOXエンジンの再取得が必要になりうる(`gh release download -R VOICEVOX/voicevox_engine` — このPCはcurl/pipがSSL検証で失敗するためghを使う。pipは`--trusted-host`で回避可)

## 次のセッションでやること(この順で)

設計スペック `2026-07-03-pregenerated-audio-and-content-pool.md` の「実装順序」に従う:

1. スキーマ改訂+`scripts/make_audio.py`+試作1本(ep-1 = 旧ev-1を音声化しReleasesへ)
2. アプリ改修(player.js の `<audio>` エンジン・app.js のプールローテーション・VOICEVOXクレジット表記・sw.js VERSION・validate.mjs拡張)→ ヘッドレス検証
3. **実機でバックグラウンド再生を確認**(方式の成否がここで確定。台本量産より先にやる)
4. 台本49本のバッチ生成(数セッションに分割)→ 音声一括生成+アップロード
5. スマホ実機でユーザーフィードバック第2弾を回収

## 注意点

- `sw.js` のキャッシュバージョン(`VERSION`)はアプリのファイルを変更したら上げる
- エピソード追加時は `content/index.json`(pool)への追記と `data/models.json` の `deliveredOn` 記入を忘れない(GENERATION.md生成手順の9-10)
- app.js の evergreen ローテーション(`EV_COUNT`)はプール方式への改修で廃止予定。改修まで既存動作を壊さない
- GitHub Pages は公開リポジトリ。個人情報・仮説ログは絶対にリポジトリへ入れない
- VOICEVOXクレジット表記(「VOICEVOX:青山龍星」「VOICEVOX:雨晴はう」)は利用規約上の必須条件。アプリから消さない
