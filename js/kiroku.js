// 記録: ストリーク・活動ヒートマップ・仮説ログ・週末の復習クイズ
import { esc } from "./home.js";

export function renderKiroku(el, app) {
  const { store } = app;
  const st = store.get();
  const today = store.today();
  const streak = store.streak();

  // 直近8週(56日)のヒートマップ
  const cells = [];
  for (let i = 55; i >= 0; i--) {
    const d = store.addDays(today, -i);
    cells.push(`<i class="${st.activity[d] ? "on" : ""} ${d === today ? "today" : ""}" title="${d}"></i>`);
  }

  const logs = Object.entries(st.log)
    .filter(([, v]) => v.suiri?.done)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 60);

  const isWeekend = [0, 6].includes(new Date(today + "T12:00:00+09:00").getDay());

  el.innerHTML = `
    <h1 class="view-title">記録</h1>
    <div class="card streak-hero">
      <div class="num">${streak}</div>
      <div class="unit">日連続 ON AIR / 累計 ${st.totalActions} 思考</div>
      <div class="heat">${cells.join("")}</div>
      <p class="small" style="margin-top:10px">1日空けてもストリークは続きます。2日連続で空くとリセット。</p>
    </div>

    <div class="card">
      <p><strong>週末の復習</strong> ${isWeekend ? "" : '<span class="small">(いつでも挑戦できます)</span>'}</p>
      <p class="small">今週学んだレンズのクイズにもう一度正解すると ★ が育ちます。</p>
      <button class="btn btn-ghost" id="review">復習クイズに挑戦</button>
      <div id="reviewBox"></div>
    </div>

    <div class="card">
      <p><strong>仮説ログ</strong></p>
      ${logs.length ? logs.map(([d, v]) => `
        <div class="log-item">
          <div class="d">${d.startsWith("ev-") ? "アーカイブ回" : d.replaceAll("-", ".")}${!d.startsWith("ev-") && v.isEvergreen ? " (アーカイブ回)" : ""}</div>
          <div><strong>${esc(v.title || "推理")}</strong> — 視点カバー率 ${v.suiri.score}%</div>
          ${v.suiri.freeText ? `<div class="small">「${esc(v.suiri.freeText)}」</div>` : ""}
          ${v.suiri.missedTags?.length ? `<div class="small">抜けていた視点: ${v.suiri.missedTags.map(esc).join(" / ")}</div>` : ""}
        </div>`).join("") : `<p class="small">まだ記録がありません。今日の推理から始めましょう。</p>`}
    </div>`;

  el.querySelector("#review").onclick = () => startReview(el.querySelector("#reviewBox"), app);
}

// 直近7日のエピソードからクイズを引っ張ってきて再挑戦
async function startReview(box, app) {
  box.innerHTML = `<p class="small">読み込み中…</p>`;
  const today = app.store.today();
  const quizzes = [];
  for (let i = 1; i <= 7; i++) {
    const d = app.store.addDays(today, -i);
    try {
      const res = await fetch(`content/${d}.json`);
      if (!res.ok) continue;
      const ep = await res.json();
      if (ep?.lens?.miniQuiz) quizzes.push({ date: d, modelId: ep.lens.modelId, quiz: ep.lens.miniQuiz });
    } catch { /* オフライン等はスキップ */ }
  }
  if (!quizzes.length) {
    box.innerHTML = `<p class="small">復習できる過去回がまだありません。数日続けるとここに溜まります。</p>`;
    return;
  }
  let idx = 0, correct = 0;
  const show = () => {
    if (idx >= quizzes.length) {
      box.innerHTML = `<p><strong>復習おわり — ${correct}/${quizzes.length} 正解</strong></p>
        <p class="small">${correct === quizzes.length ? "完璧です。レンズが手に馴染んできましたね。" : "間違えたレンズは図鑑で見返しておきましょう。"}</p>`;
      if (quizzes.length) app.store.recordActivity();
      return;
    }
    const { modelId, quiz } = quizzes[idx];
    const model = app.modelById(modelId);
    box.innerHTML = `<hr class="hr">
      <p class="small">${idx + 1}/${quizzes.length} — ${esc(model?.name || modelId)}</p>
      <p>${esc(quiz.q)}</p>
      <div class="choices">${quiz.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join("")}</div>
      <p class="small" id="why" hidden></p>`;
    box.querySelectorAll(".choice").forEach(b => b.onclick = () => {
      const picked = Number(b.dataset.i);
      const ok = picked === quiz.answerIndex;
      if (ok) { correct++; app.store.starUp(modelId); }
      box.querySelectorAll(".choice").forEach(x => {
        x.disabled = true;
        const i = Number(x.dataset.i);
        if (i === quiz.answerIndex) x.classList.add("is-correct");
        else if (i === picked) x.classList.add("is-wrong");
      });
      const why = box.querySelector("#why");
      why.hidden = false;
      why.innerHTML = `${ok ? "<strong>正解!</strong>" : "<strong>惜しい</strong>"} — ${esc(quiz.why)} <button class="btn btn-ghost" id="nextQ" style="margin-top:10px">次へ</button>`;
      why.querySelector("#nextQ").onclick = () => { idx++; show(); };
    });
  };
  show();
}
