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
- **実装フェーズ1完了**(2026-07-03): `scripts/make_audio.py`(本番パイプライン)、ep-1/ep-2(音声付き・validate通過・Release `audio-v1` にアップロード済み・URL疎通確認済み)、validate.mjs拡張(id方式+radio.audio検証)、変数枠`{{listener}}`/`{{streak}}`は全廃(音声とテキストのズレ防止。GENERATION.mdに明記)
- **VOICEVOXエンジンはリポジトリ内 `.voicevox/`(git管理外、約2GB)に配置済み**。起動: `.voicevox\run.exe --host 127.0.0.1 --port 50021`(起動に1〜2分)。再取得する場合は `gh release download -R VOICEVOX/voicevox_engine`(このPCはcurl/pipがSSL検証で失敗するためghを使う。pipは`--trusted-host`で回避可。7z展開は7zr.exe)
- 音声生成の実測: 1話(約47行・6.5〜7分)のCPU合成に3〜5分。mp3は1話2.2〜2.4MB
- **実装フェーズ2完了**(2026-07-03): アプリをプール方式+audioエンジンに改修。`player.js`=二段構え(`radio.audio`があれば`<audio>`+Media Session、なければ従来speechSynthesis。公開APIは共通)、`app.js`=プールローテーション(`EV_COUNT`廃止、`poolKeyForToday()`=dayNum%pool.length、`app.todayKey`)、`content/index.json`=pool/archive形式、`content/evergreen/`削除(ep-1/ep-2へ編入済み)、VOICEVOXクレジットをradio.js(音声再生時)とsettings.jsに表示、`sw.js` VERSION=v4。**ヘッドレスChrome(390px)で14/14 PASS**(プール解決/audioモード/台本描画/クレジット/行タップseek/速度変更/ミニプレイヤー/tts後方互換)。validate 3本全通過。commit/push 済み(`a729b17`)
- **実機バックグラウンド再生の確認 成功**(2026-07-03): スマホ実機で画面ロック・アプリ切替・ロック画面コントロール・Bluetooth操作を確認済み。**事前生成音声方式の成否が確定 = 採用でGO**。以降は台本量産フェーズへ
- **台本量産バッチ①(2026-07-03)**: ep-3(規格戦争/network-effects/テクノロジー)・ep-4(自然渋滞/emergence/科学)・ep-5(資源の呪い/rent-seeking/国際)を生成。**validate 全通過**、index.json pool と models.json deliveredOn 更新済み。**音声は未生成**(=当面は ttsモード再生。バッチがまとまってから make_audio.py で一括生成→Releasesアップロード予定)。プールは現在 **5/50本**、残り45本

## 次のセッションでやること(この順で)

設計スペック `2026-07-03-pregenerated-audio-and-content-pool.md` の「実装順序」の続き(フェーズ1・2・実機検証まで完了):

1. **台本の続きを量産**(GENERATION.mdに従う。**ep-3〜5 済み=5/50本、残り45本**。数セッションに分割、1本ごとに`node scripts/validate.mjs`必須)。題材は「10年後に読んでも思考訓練として成立する」実在の出来事/現象に限定。ジャンルの偏りに注意(既出: 社会×1・経済×1・テクノロジー×1・科学×1・国際×1。文化がまだ無い)。重複回避は`content/index.json`のpool台帳と`data/models.json`の`deliveredOn`で管理
2. 音声一括生成+アップロード: 各回 `python scripts/make_audio.py ep-N`(要VOICEVOXエンジン起動) → `gh release upload audio-v1 audio_out/ep-N.mp3` → index.jsonのpoolへ追記(ep-3以降ぶんが未処理)
3. スマホ実機でユーザーフィードバック第2弾を回収

## 注意点

- `sw.js` のキャッシュバージョン(`VERSION`)はアプリのファイルを変更したら上げる
- エピソード追加時は `content/index.json`(pool)への追記と `data/models.json` の `deliveredOn` 記入を忘れない(GENERATION.md生成手順の9-10)
- 番組の日替わりは `app.js` の `poolKeyForToday()`(dayNum % pool.length)。`app.todayKey` が「本日の放送」の唯一の基準(home.js もこれを参照)
- 音声メタ `radio.audio`(url/durationSec/lineStartSec)があれば player.js は audioモード、なければ ttsモード。過去のアーカイブ回(2026-07-02 等)は audioなし=speechSynthesis のまま
- GitHub Pages は公開リポジトリ。個人情報・仮説ログは絶対にリポジトリへ入れない
- VOICEVOXクレジット表記(「VOICEVOX:青山龍星」「VOICEVOX:雨晴はう」)は利用規約上の必須条件。アプリから消さない
