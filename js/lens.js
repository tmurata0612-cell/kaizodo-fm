// 今日のレンズ: メンタルモデル解説 + 適用ミニクイズ(正解で図鑑の☆が育つ)
import { esc } from "./home.js";

export function renderLens(el, app) {
  const ep = app.episode;
  if (!ep?.lens) { el.innerHTML = `<p class="small">今日のレンズを読み込めませんでした。</p>`; return; }
  const model = app.modelById(ep.lens.modelId);
  const epKey = app.episodeKey();
  const answered = app.store.dayLog(epKey)?.quiz;

  el.innerHTML = `
    <div class="eyebrow">TODAY'S LENS — ${esc(model?.category || "")}</div>
    <h1 class="view-title">${esc(model?.name || ep.lens.modelId)}</h1>
    <div class="card"><p style="font-family:var(--serif);font-size:16px">${esc(model?.oneLiner || "")}</p></div>
    <div class="card">
      <p>${esc(ep.lens.explanation)}</p>
      <hr class="hr">
      <p class="small"><strong>例</strong> — ${esc(ep.lens.example)}</p>
    </div>
    <div class="card">
      <div class="eyebrow">今日の推理との接続</div>
      <p>${esc(ep.lens.connection)}</p>
    </div>
    <div class="card" id="quizCard">
      <p><strong>適用クイズ</strong></p>
      <p>${esc(ep.lens.miniQuiz.q)}</p>
      <div class="choices" id="quiz">
        ${ep.lens.miniQuiz.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join("")}
      </div>
      <p class="small" id="quizWhy" hidden></p>
    </div>`;

  const quiz = ep.lens.miniQuiz;
  const whyEl = el.querySelector("#quizWhy");
  const buttons = el.querySelectorAll("#quiz .choice");

  const reveal = (pickedIndex) => {
    buttons.forEach(b => {
      const i = Number(b.dataset.i);
      b.disabled = true;
      if (i === quiz.answerIndex) b.classList.add("is-correct");
      else if (i === pickedIndex) b.classList.add("is-wrong");
    });
    whyEl.hidden = false;
    whyEl.innerHTML = `<strong>${pickedIndex === quiz.answerIndex ? "正解! ☆が育ちました" : "惜しい"}</strong> — ${esc(quiz.why)}`;
  };

  if (answered) { reveal(answered.picked); return; }

  buttons.forEach(b => b.onclick = () => {
    const picked = Number(b.dataset.i);
    const correct = picked === quiz.answerIndex;
    app.store.setDayLog(epKey, { quiz: { picked, correct, modelId: ep.lens.modelId } });
    if (correct) app.store.starUp(ep.lens.modelId);
    else app.store.update(st => { if (!st.models[ep.lens.modelId]) st.models[ep.lens.modelId] = { stars: 0 }; });
    app.store.recordActivity();
    reveal(picked);
  });
}
