// ホーム: フェイの一言 → 今日の番組 → 進捗チェックリスト → ストリーク → 過去の自分
export function renderHome(el, app) {
  const { store } = app;
  const today = store.today();
  const epKey = app.episodeKey();
  const log = store.dayLog(epKey) || {};
  const ep = app.episode;
  const streak = store.streak();
  const doneCount = [log.suiri?.done, log.radioDone].filter(Boolean).length;

  const feiLine = pickFeiLine({ streak, doneCount, todayDone: store.todayDone(), isPool: app.episodeMeta.isPool, isToday: app.episodeMeta.isToday, name: app.charName("fei") });

  el.innerHTML = `
    <div class="date-line"><span class="d">${today.replaceAll("-", ".")}</span>
      <span class="ep">${app.episodeMeta.isToday ? "本日の放送" : app.episodeMeta.isPool ? "プール回" : `${epKey.replaceAll("-", ".")} の回`}</span></div>

    <div class="fei-line">
      <div class="face">${app.charIcon("fei")}</div>
      <div class="bubble">${esc(feiLine)}</div>
    </div>

    ${ep ? `
    <div class="card">
      <div class="eyebrow">TODAY'S PROGRAM</div>
      <h2>${esc(ep.radio?.title || ep.summary?.title || "今日の番組")}</h2>
      <p class="small"><span class="chip">${esc(ep.summary?.genre || "特集")}</span>
        ${esc(app.modelById(ep.summary?.modelId)?.name || "")}</p>
      <hr class="hr">
      <div class="progress-list">
        ${progressItem("matome", "📝 今日のまとめ", "約4分", log.suiri?.done)}
        ${progressItem("radio", "📻 ラジオを聴く", "約10分", !!log.radioDone)}
      </div>
      ${doneCount === 2 ? `<hr class="hr"><p class="small">この回はコンプリート! 下のアーカイブからおかわりできます 🎉</p>` : ""}
    </div>` : `
    <div class="card"><h2>番組を取得できませんでした</h2>
      <p class="small">通信環境を確認して再読み込みしてください。オフラインでも一度読み込んだ番組は開けます。</p></div>`}

    <button class="card card-tappable" id="streakCard">
      <div class="eyebrow">KEEP ON AIR</div>
      <p><span class="mono" style="font-size:26px;color:var(--amber)">${streak}</span>
         <span class="small">日連続 / 累計 ${store.get().totalActions} 思考</span></p>
      <p class="small">記録を見る →</p>
    </button>

    ${monthAgoCard(app)}
    ${archiveCard(app, epKey)}
  `;

  el.querySelectorAll(".progress-item[data-go]").forEach(b =>
    b.addEventListener("click", () => app.navigate(b.dataset.go)));
  el.querySelector("#streakCard")?.addEventListener("click", () => app.navigate("kiroku"));
  el.querySelector("#monthAgoCard")?.addEventListener("click", () => app.navigate("kiroku"));
  el.querySelectorAll("[data-ep]").forEach(b =>
    b.addEventListener("click", async () => {
      b.disabled = true;
      const ok = await app.setEpisode(b.dataset.ep, { go: "home" });
      if (!ok) { b.disabled = false; b.querySelector(".go").textContent = "読込失敗"; }
    }));
}

// アーカイブ一覧: 別のエピソードに切り替えて「おかわり」できる
function archiveCard(app, currentKey) {
  const items = app.catalog().filter(e => e.key !== currentKey);
  const todayKey = app.todayKey;
  if (currentKey !== todayKey && app.catalog().some(e => e.key === todayKey)) {
    // 別回を開いている時は「今日の放送に戻る」を先頭に
    items.sort((a, b) => (a.key === todayKey ? -1 : b.key === todayKey ? 1 : 0));
  }
  if (!items.length) return "";
  const rows = items.slice(0, 8).map(e => {
    const done = app.episodeDone(e.key);
    const isToday = e.key === todayKey;
    return `<button class="progress-item ${done ? "done" : ""}" data-ep="${e.key}">
      <span class="tick" style="${done ? "" : "border-style:dashed"}">✓</span>
      <span class="label">${isToday ? "📅 今日の放送に戻る — " : ""}${esc(e.topic)}</span>
      <span class="go small">${e.label}${done ? " 済" : ""} →</span>
    </button>`;
  }).join("");
  return `<div class="card">
    <div class="eyebrow">過去の放送 — おかわり</div>
    <p class="small">別の回を聴き直せます(図鑑＝集めたレンズ、とは別物)。</p>
    <div class="progress-list">${rows}</div>
  </div>`;
}

function progressItem(view, label, time, done) {
  return `<button class="progress-item ${done ? "done" : ""}" data-go="${view}">
    <span class="tick">✓</span><span class="label">${label}</span>
    <span class="go small">${done ? "済" : time + " →"}</span></button>`;
}

function monthAgoCard(app) {
  const past = app.store.monthAgoEntry();
  if (!past) return "";
  const s = past.entry.suiri;
  const text = s?.freeText ? `「${s.freeText.slice(0, 60)}${s.freeText.length > 60 ? "…" : ""}」` : "仮説を立てた日";
  return `<button class="card card-tappable" id="monthAgoCard">
    <div class="eyebrow">1ヶ月前のあなた</div>
    <p class="small">${past.date.replaceAll("-", ".")} 「${esc(past.entry.title || "推理")}」</p>
    <p>${esc(text)}</p>
    <p class="small">いま読み返すと、どう見えますか? →</p>
  </button>`;
}

function pickFeiLine({ streak, doneCount, todayDone, isPool, isToday, name }) {
  if (isPool && !isToday) return "アーカイブから一本、おかわりですね。時事に縛られない普遍的な問いです、じっくりどうぞ。";
  if (doneCount === 2) return "今日の放送は全部聴いてくれたんですね。また明日、いい問いを用意しておきます。";
  if (todayDone) return "続きはお好きな時間にどうぞ。世界は逃げませんから。";
  if (streak >= 30) return `連続${streak}日。もう習慣というより、生き方ですね。今日の題材もなかなかですよ。`;
  if (streak >= 7) return `連続${streak}日目。世界の見え方、少し変わってきた実感はありますか?`;
  if (streak >= 2) return `今日で${streak}日目ですね。さて、今日の「なぜ」はこちらです。`;
  return "ようこそ、解像度FMへ。まずは今日の出来事から、一緒に考えてみましょう。";
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
