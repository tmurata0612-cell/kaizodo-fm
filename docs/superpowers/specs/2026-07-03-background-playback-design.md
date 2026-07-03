# バックグラウンド再生対応 — 設計

> **廃止(2026-07-03)**: 本スペックは同日中に `2026-07-03-pregenerated-audio-and-content-pool.md` に置き換えられた。speechSynthesis はブラウザのバックグラウンド制限で停止する根本限界があり、Media Session の追加では解決しないため、事前生成音声ファイル方式へ全面移行する。Media Session の設計(メタデータ・ハンドラ構成)は新スペックの `<audio>` エンジンに引き継がれている。

- 日付: 2026-07-03
- 対象: `js/player.js`
- 対象端末: Android Chrome(ホーム画面追加PWA含む)

## 背景・目的

現在の再生エンジン(`js/player.js`)は Web Speech API (`speechSynthesis`) でエピソード本文をリアルタイム音声合成している。画面ロック中・他アプリ切替中も再生を継続し、ロック画面/Bluetoothイヤホンのメディアコントロールから再生操作をできるようにしたい。

## 想定シーン

- 画面ロック中も再生継続
- 他アプリに切り替えても再生継続
- ロック画面・Bluetoothイヤホンのメディアコントロールに再生/一時停止・前の行/次の行を表示

対象は Android Chrome(ホーム画面追加PWA含む)。iOS Safari/PWA はバックグラウンドでのJS実行制限が厳しく speechSynthesis がほぼ確実に停止するため対象外とする。

## 採用方針

Media Session API を `js/player.js` に統合する。Android Chrome には「音声を出しているタブをバックグラウンドで凍結しない」仕様があり、TTS再生 + Media Session 設定の組み合わせだけで画面ロック中・アプリ切替後の再生継続とロック画面コントロールの両方が実現できる(Web版TTS読み上げアプリで広く使われている定番パターン)。

検討した代替案として、TTSの行間の無音区間での凍結リスクに備えた無音オーディオループの追加(方針B)があったが、YAGNIの観点で見送り、実機テストで途切れが確認された場合にのみ追加する。

## アーキテクチャ

既存の一元管理された再生エンジン `js/player.js` の内部に完結させる。UI側(`app.js`, `radio.js`)の変更は不要。

## コンポーネント

### `initMediaSession()`

モジュール読み込み時に一度だけ実行する初期化関数。

- `'mediaSession' in navigator` で機能検出。非対応なら即 return(既存動作に影響なし)。
- `navigator.mediaSession.setActionHandler('play', () => player.play())`
- `navigator.mediaSession.setActionHandler('pause', () => player.pause())`
- `navigator.mediaSession.setActionHandler('previoustrack', () => player.prev())`
- `navigator.mediaSession.setActionHandler('nexttrack', () => player.next())`

### `syncMediaSession()`

既存の `emit()` 内から呼ぶ。`mediaSession` 非対応環境では何もしない。状態が変わるたびに以下を更新する:

- `mediaSession.metadata` を `new MediaMetadata({...})` で再生成:
  - `title`: エピソードタイトル(`state.title`)
  - `artist`: 現在の発話者名 + 行テキスト(先頭40文字程度)。`state.chars[line.speaker]?.name || line.speaker` で発話者名を解決
  - `album`: `"解像度FM"` 固定
  - `artwork`: `[{ src: "icon.svg", sizes: "512x512", type: "image/svg+xml" }]`
- `mediaSession.playbackState`:
  - `state.playing` が true → `"playing"`
  - `state.playing` が false かつ `state.key` あり → `"paused"`
  - `state.key` が null(未読込) → `"none"`

`state.script` が空、または `state.lineIndex` が範囲外の場合は `artist` を空文字にフォールバックする。

## データフロー

1. `speakFrom()` が行を進める → `emit()` が呼ばれる → `syncMediaSession()` がタイトル・現在の発話行・再生状態をロック画面/Bluetoothコントロールに反映する。
2. ロック画面で play/pause/前の行/次の行ボタンを押す → `setActionHandler` に登録した既存の `player.play()/pause()/prev()/next()` が呼ばれる → 通常のUI操作(ミニプレイヤーのボタン)と全く同じ経路で状態が変わる。二重実装は発生しない。

## エラー処理

- `mediaSession` 非対応のブラウザ・環境では `initMediaSession()` の先頭で return し、以降 `syncMediaSession()` も何もしない。既存動作に一切影響しない。
- `MediaMetadata` の生成やプロパティ代入で例外が起きても再生自体を止めないよう、`syncMediaSession()` 内の処理は try/catch で囲む(UIの他コールバック例外を無視する既存の `emit()` の方針に合わせる)。

## 変更ファイル

- `js/player.js` — 本実装
- `sw.js` — キャッシュバージョン(`VERSION`)を上げる(プロジェクト既存ルール)
- `kaizodo-fm/CLAUDE.md` — 既知の制約(一部Androidメーカーのバッテリー最適化がブラウザ設定を超えてタブを強制終了しうる旨)を「注意点」に追記

## 既知の制約(実装では解決しない)

- Xiaomi/Samsung等一部Androidメーカーのアグレッシブなバッテリー最適化は、ブラウザ側の設定を超えてタブ・PWAを強制終了することがある。これはWebアプリの範囲外であり、発生する場合はユーザー側でブラウザ/PWAをバッテリー最適化の対象外に設定する必要がある。
- ロック画面での継続性は自動テストできないため、実機テストで検証する(次セッションTODOの実機フィードバック収集と合流)。

## テスト方針

- 自動テストなし(Media Session / バックグラウンド動作はヘッドレス環境で検証不可)。
- 実装後、既存の `node scripts/validate.mjs` は対象外(コンテンツJSONに変更なし)。
- 実機(Android Chrome)で以下を手動確認する:
  1. 再生中に画面を消灯・ロック → 音声が止まらないこと
  2. 再生中に別アプリに切り替える → 音声が止まらないこと
  3. ロック画面に曲名・現在の行・再生/一時停止・前後ボタンが表示され、操作がアプリ内の状態と同期すること
