# 解像度FM — リポジトリガイド

ユーザーの思考力(仮説思考・世界の解像度)を高める日刊ラジオ型PWA。毎朝クラウドエージェントが番組JSONを生成しcommit → GitHub Pagesで配信 → スマホPWAで消費する。個人データはユーザー端末のlocalStorageのみ。

- **コンテンツ生成の唯一の正**: `GENERATION.md`(キャラ設定・品質基準・スキーマ・手順)。日次生成は必ずこれに従う
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
- **日次生成ルーティン作成済み**(claude.ai routine): 毎朝 JST 05:30(UTC 20:30、cron `30 20 * * *`)にGENERATION.mdに従い当日エピソード生成→validate→commit/pushを実行。routine id `trig_01GnFp8mf86GeQMGjQc2fAWd`。管理: https://claude.ai/code/routines/trig_01GnFp8mf86GeQMGjQc2fAWd

## 次のセッションでやること(この順で)

1. 日次ルーティンが実際に翌朝正しく動いたか確認(content/配下に新しい日付ファイルが増え、index.jsonが更新されているか、GitHub Pagesに反映されているか)
2. スマホ実機でユーザーに触ってもらいフィードバック第2弾を回収(特に音声の自然さは実機の音声エンジン依存のため実機でしか確認できない)
3. モデルリストが残り30個を切ったらエージェントが拡張する運用になっているか、しばらく運用して確認

## 注意点

- `sw.js` のキャッシュバージョン(`VERSION`)はアプリのファイルを変更したら上げる
- `content/index.json` の `latest` とエピソード追記、`data/models.json` の `deliveredOn` 記入を日次生成で忘れない(GENERATION.md手順の7-8)
- app.js の `resolveEpisode()` 内 `evCount = 2` — evergreenを増やしたらここも更新
- GitHub Pages は公開リポジトリ。個人情報・仮説ログは絶対にリポジトリへ入れない
