# 解像度FM — リポジトリガイド

ユーザーの思考力(仮説思考・世界の解像度)を高める日刊ラジオ型PWA。**作り置きエピソードプール**(content/ep-N.json、初期50本目標)を日替わりローテーションで配信 → GitHub Pagesで配信 → スマホPWAで消費する。ラジオ本編はVOICEVOXで事前生成したMP3(GitHub Releases配信)、日次バッチはゼロ。個人データはユーザー端末のlocalStorageのみ。

- **コンテンツ生成の唯一の正**: `GENERATION.md`(キャラ設定・品質基準・スキーマ・手順)。エピソード追加は必ずこれに従う
- **検証**: `node scripts/validate.mjs content/<file>.json` を commit 前に必ず通す
- **設計の全記録**: 承認済みプラン `C:\Users\PC_User\.claude\plans\typed-sniffing-reef.md`(ローカルPC)
- **構成**: ビルド工程なしの vanilla JS (ES modules)。`js/app.js`が起動と画面切替、`js/store.js`がlocalStorage層、各タブは`js/{suiri,lens,radio,zukan,kiroku,settings,home}.js`
- **キャラ**: フェイ(MC/fei)とヒナタ(hinata)。`data/characters.json` + GENERATION.mdのキャラバイブル参照

## 現在のステータス (2026-07-08 更新)

**2026-07-08 セッションの成果(2件・デプロイ済み):**

- **iPhone音声再生バグを修正(同一オリジンPages配信へ切替)**: 原因は GitHub Releases 直リンクが `Content-Type: application/octet-stream`＋`attachment` で返り、iOS Safari が音声と認識せず再生拒否していたこと(Android/PCは中身推測で再生でき露見せず。CORSも無くblob回避不可)。修正=MP3の実体はReleasesに置いたまま、Pagesデプロイ時に `.github/workflows/pages.yml` の `Fetch audio from Release` ステップが `gh release download` で `audio/` に取り込み**同一オリジン配信**(Pagesは`.mp3`を`audio/mp3`で返すのでiOS再生可)。`content/ep-1..10.json` の `radio.audio.url` を相対 `audio/ep-N.mp3` に、`sw.js` は`.mp3`/Rangeを素通し(SW横取りがiOS再生を壊すため)v5、make_audio.py/validate.mjs も追随。**HTTPレベルで検証済み(206/audio/mp3/Accept-Ranges)。実機iPhoneでの最終確認だけユーザー待ち**。`audio/` は .gitignore 済み(リポ肥大化なし)
- **コンテンツ2本化: suiri+lens を summary(まとめ)に統合(commit `a5578b7`)**: 1テーマ内で同じ概念を三重説明していた重複(suiri 4レンズ + lens 解説 + radio)を解消。1テーマ=**ラジオ + まとめ の2本**。まとめ=文章+図解で概念を説明し**他分野への応用**まで示す(世界の名著方式)。新規 `js/matome.js`(hook=超軽量の一文仮説 → 定義/メカニズム/図解/応用/使いどころ・限界/適用クイズ)。図解は **flow/loop/compare の3種を HTML/CSSでレスポンシブ描画**(スマホ縦で崩れない)。`js/suiri.js`・`js/lens.js` 削除(強めの仮説ゲーム=ガイド質問/レンズ予想/自己採点は retire。仮説思考は hook の一文入力に軽量化して存続)。**radioは一切不変=音声再生成不要**。互換維持: 図鑑★(適用クイズ)・ストリーク・「1ヶ月前のあなた」・localStorage。タブ 推理+レンズ→まとめ(sw v6)、home進捗3→2、validate.mjs/GENERATION.md 全面改訂。**全10話 validate通過＋stub DOM描画テスト全話PASS、デプロイ→ライブ反映確認済み**。設計は `docs/superpowers/specs/2026-07-08-summary-page-and-content-consolidation-design.md`
- **UX改善3件(同2026-07-08・commit `503be7b`・デプロイ済み)**: ①**まとめ冒頭の仮説を選択式に**(自由記述を廃止。`summary.hook.choices`=3択を全10話に執筆。選択が「1ヶ月前のあなた」に残る)。②**用語を「レンズ」に一本化**(混乱の主因だった旧「16分析レンズ」`data/lenses.json` を完全撤去=`app.lensById`・SHELL登録も除去。図鑑に「レンズ=世界を見る道具(=その回のメンタルモデル)」と明記、「過去の放送(おかわり)」を図鑑と別物と分かる文言に。**ラジオ音声も「今日のメンタルモデル」→「今日のレンズ」に全10話書き換え→VOICEVOXで音声再生成→Release再アップロード→デプロイ→ライブで audio/mp3・新サイズ確認済み**)。③**ラジオの再生/速度/シークを `position:sticky` で常時最上部に固定**。sw.js v7。validate.mjs に hook.choices 必須化。注: ラジオ台本内の「○○のレンズ(心理/地理/統計…分析視点)」は掛け合いの一部として残存=「4つのレンズで見て今日のレンズを持ち帰る」で用語的に一貫
- **図解を v2 方式に刷新(同2026-07-08・commit `355b995`・デプロイ済み)**: 図解の質が低かったため、`世界の名著` の「図解v2」方式(`app/js/episode.js` の `diagramHTML` + `app/css/style.css` の `.dgm-*`)を **kaizodo に移植し深夜FM配色(濃紺+琥珀+明朝)に翻案**。プレーンなノード羅列 → **構造化スペックDSL6種**(flow/cycle/branch/compare/matrix/pairs)＋ tone(pos緑/neg赤/warn橙)・sub(補足)・note(核心)・mark・`**強調**`。`js/matome.js` の `diagramHTML()` を刷新、`css/style.css` に約90行の `.dgm-*`(色は kaizodo 変数に写像)、全10話の図解を最適 type で再設計(行列=cycle/店の密集=compare/規格戦争=cycle/渋滞=flow/資源の呪い=branch/縁起担ぎ=matrix4マス/レモン市場=flow/善意支援=pairs/リスク補償=cycle/イノベのジレンマ=compare)、validate.mjs は型別検証に、GENERATION.md も改訂。**全10話 validate 通過＋stub DOM 描画テスト全PASS、デプロイ→ライブ確認済み**。プレビュー(全10話を実CSSで描画)を Artifact 公開済み。**次に新規回を書くときは GENERATION.md「図解の作り方」の DSL に必ず従う(プレーンなノード羅列に戻さない)**
- **残(このセッションから申し送り)**: ①iPhone実機で音声再生を最終確認 ②まとめページの実機UX確認(図解v2の見映え・応用の刺さり・選択式仮説・操作バー固定)。プールは 10/50本

---

**以下は 2026-07-03〜04 時点の記録(音声パイプライン・プール移行・読み対策)。上記2本化で suiri/lens スキーマは summary に置換された点に注意:**

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
- **台本量産バッチ①(2026-07-03〜04)**: ep-3(規格戦争/network-effects/テクノロジー)・ep-4(自然渋滞/emergence/科学)・ep-5(資源の呪い/rent-seeking/国際)を生成。**validate 全通過**、index.json pool と models.json deliveredOn 更新済み。**音声生成→Release `audio-v1` へアップロード済み・gh で疎通確認済み**(ep-3=6.2分、ep-4=6.1分、ep-5=6.0分、各約2.1〜2.2MB。`radio.audio` 書き戻し済み=audioモード再生)。sw.js は content/ が network-first のため VERSION 据え置きでOK。プールは現在 **5/50本**、残り45本
- **Pages を GitHub Actions デプロイに移行(項目A完了・2026-07-04)**: `.github/workflows/pages.yml` を追加(`actions/upload-pages-artifact@v3` で `path: .` = ルート全体を静的配信 → `actions/deploy-pages@v4`。push[main] と workflow_dispatch でトリガ、`concurrency: pages`)。Pages ソースを **legacy → workflow に切替済み**(`gh api -X PUT repos/.../pages -f build_type=workflow`)。commit `fa38af8`。**ライブサイトが最新(ep-1〜5)を配信していることを WebFetch で確認済み**。移行時の落とし穴2つ(次回のため記録): ①build_type 切替を run 実行中にやるとその run はレースで deploy 失敗する→切替後に**新規 run を出し直す**。②失敗しても `gh run rerun --failed` は使わない(単一ジョブなので Upload artifact も再実行され「github-pages アーティファクトが2つ」で deploy が拒否)。正しい再実行は `gh workflow run pages.yml --ref main`
- **台本量産バッチ②(2026-07-04)**: ep-6(縁起担ぎ/confirmation-bias/**文化**)・ep-7(レモン市場/information-asymmetry/経済)・ep-8(善意支援の逆効果/second-order/社会)・ep-9(リスク補償/moral-hazard/科学)・ep-10(イノベのジレンマ/creative-destruction/テクノロジー)を生成。**validate 全通過**、index.json pool と models.json deliveredOn=2026-07-04 更新済み。**読み検査 → 音声生成 → Release `audio-v1` アップロード → radio.audio 書き戻し → commit(`a5ae644`)→ push → Actions 自動デプロイ成功 → ライブ反映を WebFetch 確認済み**。各5.8〜6.4分/約2.1〜2.3MB。**懸案だった文化ジャンルの空白を解消**。読み検査での誤読は ep-10「必要十分で」→ジュップン(10分)の1語のみ = 辞書ではなく台本の言い換え(「必要な性能を満たした」)で回避(将来の「10分」回への副作用を避けるため)。**プールは現在 10/50本、残り40本**。ジャンル分布: 社会×2・経済×2・テクノロジー×2・科学×2・国際×1・文化×1
- **音声の漢字読み対策(次セッション項目B)を実装(2026-07-04)**: (1) **読み検査ツール `scripts/check_readings.py`** — 全台本を `/audio_query` に流し「原文→読み仮名[アクセント核]」を `audio_out/readings.md` に出力(耳でなく機械的に誤読特定)。`--word 語…` で単語プローブも。(2) **リポ管理ユーザー辞書 `data/voicevox_dict.json`** ＋ 冪等な流し込み `scripts/vv_dict.py`。make_audio.py / check_readings.py が合成前に自動反映。台本は漢字のまま矯正できるのが利点。**priority=10** でシステム辞書の既存短語(一言・新店など)に勝てる。(3) 全5話検査で**確定誤読5語を修正**: 一言(誤:イチゲン)・この前(誤:コノゼン)・乱高下(誤:ランダカ/クダシ)・新店(シンミセ→シンテン採用)・レントシーキング(分割解消)。**ep-1/2/3/5 の音声を再生成→validate全通過→Release再アップロード済み**(ep-4は対象語なしで未変更)。GENERATION.md に辞書運用と読み検査(手順7)を追記。**残: アクセントは accent_type で単語単位のみ矯正可(文全体の抑揚は audio_query 行編集が必要=未着手)。実機フィードバック第2弾で耳確認しつつ辞書を育てる運用**

## 次のセッションでやること(この順で)

**過去の最優先(いずれも対応済み。履歴として残す):**

- ~~**A. GitHub Pages を GitHub Actions ベースのデプロイに切り替える**~~: **2026-07-04 に対応済み**(上の「Pages を GitHub Actions デプロイに移行」参照)。legacy ビルド停止の恒久対策として `.github/workflows/pages.yml` を追加し、ソースを workflow に切替。以後は push[main] で自動デプロイ、`gh run watch` で確認できる
- ~~**B. 音声の読み上げ品質の相談**~~: **2026-07-04 に対応済み**(上の「音声の漢字読み対策」参照)。読み検査ツール＋ユーザー辞書の仕組みを構築し、既知の誤読5語を修正・再生成・再アップロード済み。今後は新エピソード生成時に手順7(`check_readings.py`)を必ず通し、誤読を見つけたら `data/voicevox_dict.json` に追加する運用。**未了はアクセント(文全体の抑揚)の矯正**と、実機での耳確認

設計スペック `2026-07-03-pregenerated-audio-and-content-pool.md` の「実装順序」の続き(フェーズ1・2・実機検証まで完了):

0. **(2026-07-08 追加) 実機確認2件**: ①iPhoneで今日の放送の音声が鳴るか(PWAを再読み込み=SW v6更新後) ②まとめタブの図解・応用の見映え。両方OKなら iOS対応と2本化は完了
1. **台本の続きを量産**(GENERATION.mdに従う。**ep-1〜10 済み=10/50本、残り40本**。数セッションに分割、1本ごとに`node scripts/validate.mjs`必須)。**2026-07-08以降は新スキーマ=`summary`(まとめ)＋`radio`の2本立て**(旧 suiri/lens は廃止済み)。題材は「10年後に読んでも思考訓練として成立する」実在の出来事/現象に限定。ジャンルの偏りに注意(既出: 社会×2・経済×2・テクノロジー×2・科学×2・国際×1・文化×1。**現状バランス良好**。次は国際・文化を厚めに)。重複回避は`content/index.json`のpool台帳と`data/models.json`の`deliveredOn`で管理
2. 音声一括生成+アップロード: 各回 `python scripts/make_audio.py ep-N`(要VOICEVOXエンジン起動) → `gh release upload audio-v1 audio_out/ep-N.mp3 --clobber` → index.jsonのpoolへ追記(**ep-1〜10 は処理済み**。ep-11以降ぶんが対象)
3. スマホ実機でユーザーフィードバック第2弾を回収
4. **想起トリガーの設計(2026-07-04 自己理解セッションからの申し送り)**: ユーザーの習慣の死因は「やること自体を忘れる」(トリガー欠如死。`../_shared/user-profile.md`「挫折履歴」参照)。**ユーザーは育休中で2026-09-01復帰＝通勤(電車30分)再開が運用本番**。それまでに ①毎朝固定時刻のリマインド手段(PWA通知の可否検証を含む、無料手段を優先) ②起動摩擦の最小化(開いたら1タップで今日の放送再生)を設計・実装する。隙間時間はX・ショート動画の手癖と競合する前提(quality-standards §8)

## 注意点

- `sw.js` のキャッシュバージョン(`VERSION`)はアプリのファイルを変更したら上げる
- エピソード追加時は `content/index.json`(pool)への追記と `data/models.json` の `deliveredOn` 記入を忘れない(GENERATION.md生成手順の9-10)
- 番組の日替わりは `app.js` の `poolKeyForToday()`(dayNum % pool.length)。`app.todayKey` が「本日の放送」の唯一の基準(home.js もこれを参照)
- 音声メタ `radio.audio`(url/durationSec/lineStartSec)があれば player.js は audioモード、なければ ttsモード。過去のアーカイブ回(2026-07-02 等)は audioなし=speechSynthesis のまま
- GitHub Pages は公開リポジトリ。個人情報・仮説ログは絶対にリポジトリへ入れない
- **Pages は GitHub Actions デプロイ(2026-07-04 移行済み)**。push[main] で `.github/workflows/pages.yml` が自動デプロイする。確認: `gh run list --workflow=pages.yml --limit 1` / `gh run watch <id> --exit-status`。手動デプロイは `gh workflow run pages.yml --ref main`。**デプロイが失敗しても `gh run rerun --failed` は使わない**(単一ジョブで Upload artifact が再実行され「github-pages アーティファクト2つ」で拒否される)→ 必ず `gh workflow run` で新規 run を出す。content と data/models.json は network-first なので、デプロイ完了後はアプリを開き直せば反映される(アプリ本体JSを変えた場合のみ sw.js VERSION も上げる)。curl はこのPCのSSL事情で使えないので疎通確認は WebFetch か gh を使う
- VOICEVOXクレジット表記(「VOICEVOX:青山龍星」「VOICEVOX:雨晴はう」)は利用規約上の必須条件。アプリから消さない
