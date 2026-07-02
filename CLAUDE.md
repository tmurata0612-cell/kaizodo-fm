# 解像度FM — リポジトリガイド

ユーザーの思考力(仮説思考・世界の解像度)を高める日刊ラジオ型PWA。毎朝クラウドエージェントが番組JSONを生成しcommit → GitHub Pagesで配信 → スマホPWAで消費する。個人データはユーザー端末のlocalStorageのみ。

- **コンテンツ生成の唯一の正**: `GENERATION.md`(キャラ設定・品質基準・スキーマ・手順)。日次生成は必ずこれに従う
- **検証**: `node scripts/validate.mjs content/<file>.json` を commit 前に必ず通す
- **設計の全記録**: 承認済みプラン `C:\Users\PC_User\.claude\plans\typed-sniffing-reef.md`(ローカルPC)
- **構成**: ビルド工程なしの vanilla JS (ES modules)。`js/app.js`が起動と画面切替、`js/store.js`がlocalStorage層、各タブは`js/{suiri,lens,radio,zukan,kiroku,settings,home}.js`
- **キャラ**: フェイ(MC/fei)とヒナタ(hinata)。`data/characters.json` + GENERATION.mdのキャラバイブル参照

## 現在のステータス (2026-07-02 時点)

完了:
- コンテンツ基盤(data/models.json 100個、data/lenses.json 16本、characters、validate.mjs、GENERATION.md)
- PWAアプリ全実装(index.html, css, js/全モジュール, manifest, sw.js, icon.svg)
- 初期コンテンツ3本(content/2026-07-02.json + evergreen/ev-1,ev-2)— **validate全通過済み**
- git init 済み(まだ一度もcommitしていない)

## 次のセッションでやること(この順で)

1. `node --check` で js/*.js と sw.js の構文確認 → ローカルHTTPサーバ(`python -m http.server`)で全タブの動作確認(推理フロー完走・クイズ・ラジオ再生・図鑑・記録・設定・エクスポート)
2. 初回 git commit
3. `gh` CLI が未インストール → `winget install GitHub.cli` → `gh auth login` → `gh repo create kaizodo-fm --public` → push → GitHub Pages有効化(main / root)。ユーザーにPages URLを渡しスマホで「ホーム画面に追加」してもらう
4. /schedule スキルで毎朝 JST 05:30 頃の日次生成ルーティン作成。プロンプトは「このリポジトリのGENERATION.mdに従い当日エピソードを生成→validate→commit/push」のみ。※ユーザーのサブスク使用量を消費する旨を伝える
5. 設計スペックを docs/superpowers/specs/2026-07-02-kaizodo-fm-design.md に保存
6. ローカルPCのメモリーファイル(`~/.claude/projects/.../memory/`)のステータスを更新

## 注意点

- `sw.js` のキャッシュバージョン(`VERSION`)はアプリのファイルを変更したら上げる
- `content/index.json` の `latest` とエピソード追記、`data/models.json` の `deliveredOn` 記入を日次生成で忘れない(GENERATION.md手順の7-8)
- app.js の `resolveEpisode()` 内 `evCount = 2` — evergreenを増やしたらここも更新
- GitHub Pages は公開リポジトリ。個人情報・仮説ログは絶対にリポジトリへ入れない
