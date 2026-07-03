// グローバル再生エンジン。画面遷移しても再生が続く唯一の場所。
// UI(radio.js / ミニプレイヤー)は subscribe で状態を受け取って描画するだけ。
import { store } from "./store.js";

const MEDIA_SESSION_SUPPORTED = typeof navigator !== "undefined" && "mediaSession" in navigator;

export const RATES = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

const listeners = new Set();
let gen = 0; // 世代カウンタ: cancel後に届く古いonendを無視する

const state = {
  key: null,          // エピソードキー(日付 or ev-N)
  title: "",
  script: [],         // [{speaker, text}] 変数置換済み
  chars: {},          // characters.json の characters
  voiceOverrides: {}, // settings.voices
  lineIndex: 0,
  playing: false,
  finished: false,
  rate: store.get().settings.playRate || 1.0,
  onComplete: null,
};

function emit() { syncMediaSession(); listeners.forEach(cb => { try { cb(state); } catch { /* UI側の例外は無視 */ } }); }

// --- 声の自動選択: 最も自然な日本語音声を優先する ---
function voiceScore(v) {
  const n = (v.name || "").toLowerCase();
  let s = 0;
  if (/natural|ニューラル|neural/.test(n)) s += 400;   // Edgeのオンライン自然音声
  if (/google/.test(n)) s += 250;                       // Google TTS
  if (/enhanced|premium|拡張/.test(n)) s += 200;        // iOSの拡張音声
  if (/siri/.test(n)) s += 180;
  if (/kyoko|otoya|o-ren|hattori/.test(n)) s += 150;    // iOS標準のまともな声
  if (/haruka|ichiro|ayumi|sayaka|desktop/.test(n)) s -= 100; // Windowsの旧SAPI声
  return s;
}

function rankedJaVoices() {
  return speechSynthesis.getVoices()
    .filter(v => v.lang?.toLowerCase().startsWith("ja"))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}

function pickVoice(charId) {
  const saved = state.voiceOverrides[charId]?.voiceURI;
  const voices = speechSynthesis.getVoices();
  if (saved) {
    const v = voices.find(v => v.voiceURI === saved);
    if (v) return v;
  }
  const ranked = rankedJaVoices();
  if (!ranked.length) return null;
  // キャラごとに上位から別の声を割り当てる(2つ以上あれば)
  const order = Object.keys(state.chars);
  return ranked[Math.min(order.indexOf(charId), ranked.length - 1)] || ranked[0];
}

function speakFrom(i) {
  if (!state.playing) return;
  if (i >= state.script.length) { finish(); return; }
  const myGen = ++gen;
  state.lineIndex = i;
  emit();
  const line = state.script[i];
  const conf = state.chars[line.speaker]?.voice || {};
  const u = new SpeechSynthesisUtterance(line.text);
  const v = pickVoice(line.speaker);
  if (v) u.voice = v;
  u.lang = "ja-JP";
  u.pitch = state.voiceOverrides[line.speaker]?.pitch ?? conf.pitch ?? 1;
  u.rate = Math.min(10, (conf.rate ?? 1) * state.rate);
  const advance = () => {
    if (myGen !== gen || !state.playing) return;
    speakFrom(i + 1);
  };
  u.onend = advance;
  u.onerror = advance;
  speechSynthesis.speak(u);
}

function finish() {
  state.playing = false;
  state.finished = true;
  document.body.classList.remove("is-playing");
  const cb = state.onComplete;
  state.onComplete = null; // 完了は1回だけ
  emit();
  if (cb) cb(state.key);
}

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

export const player = {
  state,
  supported: typeof window !== "undefined" && "speechSynthesis" in window,
  subscribe(cb) { listeners.add(cb); cb(state); return () => listeners.delete(cb); },

  // 同じエピソードなら位置を保持、別エピソードならロードし直す
  load({ key, title, script, chars, voiceOverrides, onComplete }) {
    state.chars = chars;
    state.voiceOverrides = voiceOverrides || {};
    if (state.key === key) { state.onComplete = state.onComplete || onComplete; emit(); return; }
    this.pause();
    state.key = key;
    state.title = title;
    state.script = script;
    state.lineIndex = 0;
    state.finished = false;
    state.onComplete = onComplete;
    emit();
  },

  play() {
    if (!this.supported || !state.script.length) return;
    if (state.finished) { state.finished = false; state.lineIndex = 0; }
    state.playing = true;
    document.body.classList.add("is-playing");
    emit();
    const start = () => speakFrom(state.lineIndex);
    if (!speechSynthesis.getVoices().length) {
      speechSynthesis.addEventListener("voiceschanged", start, { once: true });
      setTimeout(() => { if (state.playing && !speechSynthesis.speaking) start(); }, 400);
    } else {
      start();
    }
  },

  pause() {
    state.playing = false;
    gen++;
    if (this.supported) speechSynthesis.cancel();
    document.body.classList.remove("is-playing");
    emit();
  },

  toggle() { state.playing ? this.pause() : this.play(); },

  seekTo(i) {
    const idx = Math.max(0, Math.min(state.script.length - 1, i));
    state.finished = false;
    if (state.playing) {
      gen++;
      speechSynthesis.cancel();
      state.playing = true;
      speakFrom(idx);
    } else {
      state.lineIndex = idx;
      emit();
    }
  },

  next() { this.seekTo(state.lineIndex + 1); },
  prev() { this.seekTo(state.lineIndex - 1); },

  setRate(r) {
    state.rate = r;
    store.update(s => { s.settings.playRate = r; });
    if (state.playing) this.seekTo(state.lineIndex); // 現在の行から新しい速度で読み直す
    else emit();
  },

  cycleRate(dir) {
    const i = RATES.indexOf(state.rate);
    const base = i === -1 ? RATES.indexOf(1.0) : i;
    const next = RATES[Math.max(0, Math.min(RATES.length - 1, base + dir))];
    this.setRate(next);
    return next;
  },
};

initMediaSession();
