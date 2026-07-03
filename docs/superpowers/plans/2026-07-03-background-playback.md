# バックグラウンド再生対応 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Android Chrome(ホーム画面追加PWA含む)で、画面ロック中・他アプリ切替中も解像度FMのラジオ再生が止まらないようにし、ロック画面/Bluetoothイヤホンのメディアコントロールから再生/一時停止・前後の行送りを操作できるようにする。

**Architecture:** 既存の一元管理された再生エンジン `js/player.js` の内部に Media Session API 統合を完結させる。UI側(`app.js`, `radio.js`)は無変更。`emit()` から呼ばれる `syncMediaSession()` がタイトル・現在の発話行・再生状態をロック画面コントロールに反映し、`setActionHandler` で登録したハンドラは既存の `player.play()/pause()/prev()/next()` をそのまま呼ぶ(二重実装なし)。

**Tech Stack:** Vanilla JS (ES modules)、Web Speech API (`speechSynthesis`)、Media Session API。ビルド工程なし。

## Global Constraints

- 対象端末は Android Chrome(ホーム画面追加PWA含む)。iOS Safari/PWA は対象外(バックグラウンドJS実行制限が厳しく speechSynthesis がほぼ確実に停止するため)。
- `mediaSession` 非対応環境では機能を無効化するのみで、既存の再生動作に一切影響を与えないこと。
- `js/player.js` の変更は既存の公開インターフェース(`player.load/play/pause/toggle/seekTo/next/prev/setRate/cycleRate/subscribe/state/supported`)を変えないこと。
- ファイル変更を伴う場合は `sw.js` の `VERSION` を上げる(プロジェクト既存ルール、`kaizodo-fm/CLAUDE.md` 記載)。
- 参照設計スペック: `docs/superpowers/specs/2026-07-03-background-playback-design.md`

---

### Task 1: Media Session 統合を `js/player.js` に実装する

**Files:**
- Modify: `js/player.js`(全168行。関数追加とファイル末尾の初期化呼び出しを追加)
- Create(使い捨て・最終ステップで削除): `.verify-tmp/verify-media-session.mjs`

**Interfaces:**
- Consumes: `js/player.js` 内の既存 `state`(`key, title, script, chars, lineIndex, playing`)と既存の `player.play()/pause()/prev()/next()`(いずれも変更なし)
- Produces: モジュール内部関数 `initMediaSession()`・`syncMediaSession()`(他ファイルからは呼ばれない、`player.js` 内で完結)。`emit()` の先頭で `syncMediaSession()` を呼ぶよう変更。

- [ ] **Step 1: 検証用の使い捨てpuppeteerスクリプトを一時ディレクトリに作成する**

リポジトリ直下に `.verify-tmp/` を作り、その中に以下のファイルを作成する。このスクリプトは実装の前後で「まだ動かない→動く」を確認するための一時的なものであり、最終ステップ(Step 6)で削除しコミットしない。

`.verify-tmp/verify-media-session.mjs`:

```js
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const PORT = 8791;
const CHROME_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe";

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

const server = spawn("python", ["-m", "http.server", String(PORT)], { cwd: process.cwd(), stdio: "ignore" });
await wait(1000);

const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });

  await page.click('[data-view="radio"]');
  await page.waitForSelector("#play");

  const before = await page.evaluate(() => ({
    playbackState: navigator.mediaSession.playbackState,
    metadata: navigator.mediaSession.metadata ? {
      title: navigator.mediaSession.metadata.title,
      artist: navigator.mediaSession.metadata.artist,
    } : null,
  }));
  console.log("読込直後:", JSON.stringify(before));
  if (before.playbackState !== "paused") throw new Error(`期待値 paused, 実際 ${before.playbackState}`);
  if (!before.metadata || !before.metadata.title) throw new Error("metadata.title が設定されていない");

  await page.click("#play");
  await wait(300);
  const playing = await page.evaluate(() => navigator.mediaSession.playbackState);
  console.log("再生後:", playing);
  if (playing !== "playing") throw new Error(`期待値 playing, 実際 ${playing}`);

  const artistBefore = await page.evaluate(() => navigator.mediaSession.metadata.artist);
  await page.click("#nextLine");
  await wait(200);
  const artistAfter = await page.evaluate(() => navigator.mediaSession.metadata.artist);
  console.log("行送り前後:", artistBefore, "->", artistAfter);
  if (artistBefore === artistAfter) throw new Error("次の行に進んでも metadata.artist が変わらない");

  await page.click("#play");
  await wait(200);
  const paused = await page.evaluate(() => navigator.mediaSession.playbackState);
  console.log("一時停止後:", paused);
  if (paused !== "paused") throw new Error(`期待値 paused, 実際 ${paused}`);

  console.log("PASS: Media Session 検証すべて成功");
} finally {
  await browser.close();
  server.kill();
}
```

- [ ] **Step 2: puppeteer-core を一時インストールし、検証スクリプトが失敗することを確認する**

Run:
```bash
npm install --no-save puppeteer-core
node .verify-tmp/verify-media-session.mjs
```

Expected: FAIL。`before.playbackState` が `undefined`(`mediaSession.playbackState` が更新されていない)、または `metadata.title が設定されていない` のエラーで停止する。これは Media Session 統合がまだ実装されていないため正しい。

- [ ] **Step 3: `js/player.js` に Media Session 統合を実装する**

`js/player.js` の3行目(`import { store } from "./store.js";`)の直後に以下を追加する:

```js

const MEDIA_SESSION_SUPPORTED = typeof navigator !== "undefined" && "mediaSession" in navigator;
```

`finish()` 関数の直後(91行目の `export const player = {` の直前)に以下の2関数を追加する:

```js
function initMediaSession() {
  if (!MEDIA_SESSION_SUPPORTED) return;
  navigator.mediaSession.setActionHandler("play", () => player.play());
  navigator.mediaSession.setActionHandler("pause", () => player.pause());
  navigator.mediaSession.setActionHandler("previoustrack", () => player.prev());
  navigator.mediaSession.setActionHandler("nexttrack", () => player.next());
}

function syncMediaSession() {
  if (!MEDIA_SESSION_SUPPORTED) return;
  try {
    if (!state.key) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
      return;
    }
    const line = state.script[state.lineIndex];
    const speakerName = line ? (state.chars[line.speaker]?.name || line.speaker) : "";
    const lineText = line ? line.text.slice(0, 40) : "";
    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.title,
      artist: line ? `${speakerName}: ${lineText}` : "",
      album: "解像度FM",
      artwork: [{ src: "icon.svg", sizes: "512x512", type: "image/svg+xml" }],
    });
    navigator.mediaSession.playbackState = state.playing ? "playing" : "paused";
  } catch { /* Media Session更新の失敗で再生自体は止めない */ }
}
```

既存の `emit()` 関数(23行目)を以下のように変更する:

```js
function emit() { syncMediaSession(); listeners.forEach(cb => { try { cb(state); } catch { /* UI側の例外は無視 */ } }); }
```

ファイル末尾(現在の最終行、`export const player = {...};` の閉じ `};` の直後)に以下を追加する:

```js

initMediaSession();
```

- [ ] **Step 4: 検証スクリプトを再実行し、成功することを確認する**

Run:
```bash
node .verify-tmp/verify-media-session.mjs
```

Expected:
```
読込直後: {"playbackState":"paused","metadata":{"title":"...","artist":"..."}}
再生後: playing
行送り前後: ... -> ...
一時停止後: paused
PASS: Media Session 検証すべて成功
```
(`...` 部分は実際のエピソードタイトル・行テキストが入る。エラーなく `PASS` が出力されればOK。)

- [ ] **Step 5: 既存の動作確認(既存機能を壊していないこと)**

Run:
```bash
node scripts/validate.mjs content/2026-07-02.json content/evergreen/ev-1.json content/evergreen/ev-2.json
```

Expected: 3ファイルとも `OK`(この変更はコンテンツJSONに触れていないため、既存と同じ結果になるはず)。

注意: `content/*.json` のようにグロブで `content/index.json` まで含めると、`index.json` はエピソード形式ではないため常に `NG` になる(この変更と無関係の既知の挙動)。個別ファイルを指定すること。

- [ ] **Step 6: 使い捨て検証環境を削除する**

Run(PowerShell):
```powershell
Remove-Item -Recurse -Force .verify-tmp
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
```

`npm install --no-save` は `package.json` を書き換えないため差分に影響しないが、`node_modules` と(生成されていれば)`package-lock.json` はリポジトリに残さない。`git status` で `js/player.js` 以外に差分が出ていないことを確認する。

- [ ] **Step 7: コミット**

```bash
git add js/player.js
git commit -m "$(cat <<'EOF'
feat: Media Session API統合でバックグラウンド再生に対応

画面ロック中・アプリ切替中もAndroid Chromeで再生が止まらないよう、
ロック画面/Bluetoothコントロールに再生状態と現在の行を反映する。
EOF
)"
```

---

### Task 2: Service Workerのキャッシュバージョンを上げる

**Files:**
- Modify: `sw.js:2`

**Interfaces:**
- Consumes: なし
- Produces: なし(プロジェクト既存ルールへの追従のみ)

- [ ] **Step 1: `VERSION` を上げる**

`sw.js` の2行目:

```js
const VERSION = "kaizodo-v3";
```

を以下に変更する:

```js
const VERSION = "kaizodo-v4";
```

- [ ] **Step 2: 変更を確認する**

Run:
```bash
git diff sw.js
```

Expected: `-const VERSION = "kaizodo-v3";` / `+const VERSION = "kaizodo-v4";` の1行差分のみ。

- [ ] **Step 3: コミット**

```bash
git add sw.js
git commit -m "sw.js: キャッシュバージョンをv4に更新(player.jsのMedia Session対応を反映するため)"
```

---

### Task 3: CLAUDE.mdに既知の制約を追記する

**Files:**
- Modify: `CLAUDE.md`(kaizodo-fmリポジトリ直下)

**Interfaces:**
- Consumes: なし
- Produces: なし(ドキュメントのみ)

- [ ] **Step 1: 「注意点」セクションに1行追記する**

`CLAUDE.md` の `## 注意点` セクション末尾(`- GitHub Pages は公開リポジトリ...` の行の後)に以下を追記する:

```markdown
- バックグラウンド再生はAndroid Chrome前提(Media Session API)。一部Androidメーカー(Xiaomi/Samsung等)のアグレッシブなバッテリー最適化はブラウザ設定を超えてタブを強制終了することがあり、その場合はユーザー側でブラウザ/PWAをバッテリー最適化の対象外に設定する必要がある(設計: `docs/superpowers/specs/2026-07-03-background-playback-design.md`)
```

- [ ] **Step 2: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: バックグラウンド再生の既知の制約をCLAUDE.mdに追記"
```

---

### Task 4: 実機での手動確認(次セッション・実機到達時に実施)

自動テストできないため、ここはコード変更ではなく実機QAのチェックリストとして扱う。Android実機で以下を確認し、問題があれば `docs/superpowers/specs/2026-07-03-background-playback-design.md` の「既知の制約」に追記して方針B(無音オーディオループ)の要否を判断する。

- [ ] ラジオタブでエピソードを再生開始し、画面を消灯・ロックしても音声が止まらないことを確認する
- [ ] 再生中に別アプリ(LINE等)に切り替えても音声が止まらないことを確認する
- [ ] ロック画面に曲名(エピソードタイトル)・現在の行(発話者+テキスト)・再生/一時停止・前後の行送りボタンが表示され、操作するとアプリ内の状態と同期することを確認する
- [ ] Bluetoothイヤホンを接続している場合、イヤホンの再生/一時停止ボタンでも同様に操作できることを確認する

このタスクはコード変更を伴わないため、コミット不要。`kaizodo-fm/CLAUDE.md` の「次のセッションでやること」に既にある実機フィードバック収集と合流させてよい。
