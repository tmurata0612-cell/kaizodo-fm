// 起動・タブ切替(履歴つき)・エピソード解決と切替・ミニプレイヤー
import { store } from "./store.js";
import { player } from "./player.js";
import { renderHome } from "./home.js";
import { renderSuiri } from "./suiri.js";
import { renderLens } from "./lens.js";
import { renderRadio } from "./radio.js";
import { renderZukan } from "./zukan.js";
import { renderKiroku } from "./kiroku.js";
import { renderSettings } from "./settings.js";

const EV_COUNT = 2; // content/evergreen/ev-1..N (増やしたら index.json の evergreen も更新)

const app = {
  store,
  player,
  data: { lenses: null, models: null, characters: null, index: null },
  episode: null,
  episodeMeta: { key: null, isEvergreen: false, isToday: false },
  navigate,
  goBack,
  episodeKey() { return this.episodeMeta.key; },
  charName(id) {
    const custom = store.get().settings.charNames[id];
    return custom || app.data.characters.characters[id]?.displayName || id;
  },
  charIcon(id) { return app.data.characters.characters[id]?.icon || "🎙"; },
  lensById(id) { return app.data.lenses.lenses.find(l => l.id === id); },
  modelById(id) { return app.data.models.models.find(m => m.id === id); },
  fillVars(text) {
    const s = store.get().settings;
    return text
      .replaceAll("{{streak}}", `連続${Math.max(1, store.streak())}日目`)
      .replaceAll("{{listener}}", s.listenerName || "あなた");
  },

  // エピソードのカタログ(アーカイブ一覧用)
  catalog() {
    const daily = (this.data.index?.episodes || []).map(e => ({
      key: e.date, label: e.date.replaceAll("-", "."), topic: e.topic, genre: e.genre,
    }));
    const ev = (this.data.index?.evergreen || []).map(e => ({
      key: e.key, label: "アーカイブ", topic: e.topic, genre: e.genre,
    }));
    return [...daily, ...ev];
  },
  episodeDone(key) {
    const log = store.dayLog(key);
    return !!(log?.suiri?.done && log?.quiz && log?.radioDone);
  },

  // key: "YYYY-MM-DD" または "ev-N"
  async setEpisode(key, { go = "home" } = {}) {
    const path = /^\d{4}-\d{2}-\d{2}$/.test(key) ? `content/${key}.json` : `content/evergreen/${key}.json`;
    const ep = await fetchJson(path, { fresh: true });
    if (!ep) return false;
    this.episode = ep;
    this.episodeMeta = { key, isEvergreen: !/^\d{4}/.test(key), isToday: key === store.today() };
    loadIntoPlayer(this);
    if (go) navigate(go);
    return true;
  },
};

// 現在のエピソードをプレイヤーに読み込む(再生はしない。同一キーなら位置維持)
function loadIntoPlayer(app) {
  const ep = app.episode;
  if (!ep?.radio) return;
  player.load({
    key: app.episodeMeta.key,
    title: ep.radio.title,
    script: ep.radio.script.map(l => ({ ...l, text: app.fillVars(l.text) })),
    chars: app.data.characters.characters,
    voiceOverrides: store.get().settings.voices,
    onComplete: (key) => {
      if (!store.dayLog(key)?.radioDone) {
        store.setDayLog(key, { radioDone: true, title: ep.suiri?.title });
        store.recordActivity();
      }
      if (current === "home" || current === "radio") navigate(current, { replace: true });
    },
  });
}

const views = {
  home: renderHome, suiri: renderSuiri, lens: renderLens, radio: renderRadio,
  zukan: renderZukan, kiroku: renderKiroku, settings: renderSettings,
};

let current = "home";
let history = [];

function navigate(name, { replace = false } = {}) {
  if (!replace && current && current !== name) history = [...history.slice(-8), current];
  current = name;
  document.querySelectorAll(".tab").forEach(t =>
    t.classList.toggle("is-active", t.dataset.view === name));
  document.body.classList.toggle("on-radio-view", name === "radio");
  const el = document.getElementById("view");
  el.innerHTML = "";
  el.classList.remove("fade-in");
  void el.offsetWidth;
  el.classList.add("fade-in");
  views[name](el, app);
  window.scrollTo(0, 0);
  updateMiniPlayer(player.state);
}

function goBack() {
  navigate(history.pop() || "home", { replace: true });
}

async function fetchJson(url, { fresh = false } = {}) {
  try {
    const res = await fetch(url, fresh ? { cache: "no-cache" } : {});
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// 当日 → evergreen ローテーション の順で初期番組を解決
async function resolveInitialEpisode() {
  const today = store.today();
  if (await app.setEpisode(today, { go: null })) return;
  const dayNum = Math.floor(new Date(today + "T00:00:00+09:00").getTime() / 86400000);
  for (let i = 0; i < EV_COUNT; i++) {
    const key = `ev-${((dayNum + i) % EV_COUNT) + 1}`;
    if (await app.setEpisode(key, { go: null })) return;
  }
  app.episode = null;
  app.episodeMeta = { key: today, isEvergreen: false, isToday: true };
}

// ---------- ミニプレイヤー(全画面共通の再生コントロール) ----------
function updateMiniPlayer(ps) {
  const bar = document.getElementById("miniPlayer");
  if (!bar) return;
  const started = ps.key && (ps.playing || ps.lineIndex > 0 || ps.finished);
  const show = started && current !== "radio";
  bar.hidden = !show;
  if (!show) return;
  bar.querySelector("#mpToggle").textContent = ps.playing ? "⏸" : "▶";
  bar.querySelector("#mpRate").textContent = `×${ps.rate}`;
  const line = ps.script[ps.lineIndex];
  bar.querySelector("#mpTitle").textContent = ps.finished
    ? `▸ ${ps.title}(再生済み)`
    : line ? `${app.charName(line.speaker)}: ${line.text.slice(0, 26)}…` : ps.title;
}

function setupMiniPlayer() {
  const bar = document.getElementById("miniPlayer");
  bar.querySelector("#mpToggle").addEventListener("click", () => player.toggle());
  bar.querySelector("#mpPrev").addEventListener("click", () => player.prev());
  bar.querySelector("#mpNext").addEventListener("click", () => player.next());
  bar.querySelector("#mpSlower").addEventListener("click", () => player.cycleRate(-1));
  bar.querySelector("#mpFaster").addEventListener("click", () => player.cycleRate(1));
  bar.querySelector("#mpTitle").addEventListener("click", () => navigate("radio"));
  player.subscribe(updateMiniPlayer);
}

function setupChrome() {
  const today = store.today();
  const start = new Date(today.slice(0, 4) + "-01-01T00:00:00+09:00");
  const now = new Date(today + "T00:00:00+09:00");
  const frac = Math.min(0.96, Math.max(0.04, (now - start) / (366 * 86400000)));
  const needle = document.getElementById("dialNeedle");
  requestAnimationFrame(() => { needle.style.left = `${(frac * 100).toFixed(1)}%`; });

  const [y, m, d] = today.split("-");
  document.getElementById("freqLabel").textContent = `${y}.${m}.${d}`;

  document.querySelectorAll(".tab").forEach(t =>
    t.addEventListener("click", () => navigate(t.dataset.view)));
  document.getElementById("btnSettings").addEventListener("click", () => navigate("settings"));
  setupMiniPlayer();
}

async function boot() {
  setupChrome();
  const [lenses, models, characters, index] = await Promise.all([
    fetchJson("data/lenses.json"),
    fetchJson("data/models.json", { fresh: true }),
    fetchJson("data/characters.json"),
    fetchJson("content/index.json", { fresh: true }),
  ]);
  app.data = { lenses, models, characters, index };
  await resolveInitialEpisode();
  navigate("home", { replace: true });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

boot();
