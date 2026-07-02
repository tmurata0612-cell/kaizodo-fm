// localStorage ラッパ。個人データはすべてここを通す(公開リポジトリには一切載らない)。
const KEY = "kaizodo.v1";

const DEFAULTS = {
  settings: {
    listenerName: "あなた",
    charNames: {},          // {fei: "フェイ", ...} 上書き用
    voices: {},             // {fei: {voiceURI, pitch, rate}}
    playRate: 1.0,
  },
  activity: {},             // {"2026-07-02": true} ストリーク台帳
  log: {},                  // {"2026-07-02": {suiri:{...}, quiz:{...}, radioDone:true, title, isEvergreen}}
  models: {},               // {modelId: {stars: 0-3}}
  totalActions: 0,
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULTS), ...parsed, settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

export const store = {
  get: () => state,

  update(fn) { fn(state); save(); },

  // ---- 日付(JST基準) ----
  today() {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
  },
  addDays(dateStr, n) {
    const d = new Date(dateStr + "T00:00:00+09:00");
    d.setDate(d.getDate() + n);
    return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(d);
  },

  // ---- アクティビティ / ストリーク ----
  recordActivity() {
    const d = this.today();
    if (!state.activity[d]) state.activity[d] = true;
    state.totalActions++;
    save();
  },
  // 「2日連続で空けたときだけ途切れる」猶予つきストリーク
  streak() {
    const today = this.today();
    let miss = 0, count = 0;
    for (let i = 0; i < 730; i++) {
      const day = this.addDays(today, -i);
      if (state.activity[day]) { count++; miss = 0; }
      else { miss++; if (miss >= 2) break; }
    }
    return count;
  },
  todayDone() { return !!state.activity[this.today()]; },

  // ---- 日次ログ ----
  dayLog(date) { return state.log[date]; },
  setDayLog(date, patch) {
    state.log[date] = { ...(state.log[date] || {}), ...patch };
    save();
  },
  // 約1ヶ月前(28〜35日前で最も近いもの)のログ → 「過去の自分」カード
  monthAgoEntry() {
    const today = this.today();
    for (const offset of [30, 31, 29, 32, 28, 33, 34, 35]) {
      const d = this.addDays(today, -offset);
      if (state.log[d]?.suiri?.done) return { date: d, entry: state.log[d] };
    }
    return null;
  },

  // ---- 図鑑 ----
  modelState(id) { return state.models[id] || { stars: 0 }; },
  starUp(id, max = 3) {
    const m = state.models[id] || { stars: 0 };
    m.stars = Math.min(max, m.stars + 1);
    state.models[id] = m;
    save();
  },

  // ---- バックアップ ----
  exportJson() { return JSON.stringify(state, null, 2); },
  importJson(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || !("activity" in parsed)) {
      throw new Error("解像度FMのバックアップファイルではないようです");
    }
    state = { ...structuredClone(DEFAULTS), ...parsed, settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) } };
    save();
  },
  resetAll() { state = structuredClone(DEFAULTS); save(); },
};
