// 今日の推理: 出来事 → ガイド質問 → 自由仮説 → レンズ予想 → 開封(分析) → 自己採点
import { esc } from "./home.js";

export function renderSuiri(el, app) {
  const { store } = app;
  const ep = app.episode;
  if (!ep?.suiri) { el.innerHTML = `<p class="small">今日の推理を読み込めませんでした。</p>`; return; }

  const epKey = app.episodeKey();
  const saved = store.dayLog(epKey)?.suiri;
  if (saved?.done) { renderResult(el, app, saved, true); return; }

  // 進行中の下書き(タブ移動しても消えないようにメモリ保持)
  const draft = (renderSuiri._draft?.epKey === epKey) ? renderSuiri._draft : {
    epKey, step: 0, guideAnswers: {}, freeText: "", lensPrediction: [],
  };
  renderSuiri._draft = draft;
  renderStep(el, app, draft);
}

function renderStep(el, app, draft) {
  const s = app.episode.suiri;
  const steps = ["お題", "ガイド質問", "自由仮説", "レンズ予想", "開封"];
  const bar = `<div class="steps">${steps.map((_, i) => `<i class="${i <= draft.step ? "on" : ""}"></i>`).join("")}</div>`;

  if (draft.step === 0) {
    el.innerHTML = `${bar}
      <div class="eyebrow">CASE FILE — ${esc(s.genre || "")}</div>
      <h1 class="view-title">${esc(s.title)}</h1>
      <div class="card"><p>${esc(s.event)}</p>
        <p class="small">出典: ${esc(s.sourceNote)}</p></div>
      <p class="small">なぜこれが起きたのか。答えを見る前に、あなたの仮説を組み立てます。</p>
      <button class="btn" id="next">仮説を組み立てる</button>`;
    el.querySelector("#next").onclick = () => { draft.step = 1; renderStep(el, app, draft); };
    return;
  }

  if (draft.step === 1) {
    el.innerHTML = `${bar}
      <h1 class="view-title">手がかりを選ぶ</h1>
      <p class="small">どれも「一理ある」選択肢です。あなたの読みに一番近いものを。</p>
      ${s.guideQuestions.map((g, gi) => `
        <div class="card"><p><strong>${esc(g.q)}</strong></p>
          <div class="choices" data-gi="${gi}">
            ${g.choices.map((c, ci) => `<button class="choice ${draft.guideAnswers[gi] === ci ? "is-selected" : ""}" data-ci="${ci}">${esc(c)}</button>`).join("")}
          </div></div>`).join("")}
      <button class="btn" id="next">次へ</button>`;
    el.querySelectorAll(".choices").forEach(box => {
      box.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
        draft.guideAnswers[box.dataset.gi] = Number(btn.dataset.ci);
        box.querySelectorAll(".choice").forEach(b => b.classList.toggle("is-selected", b === btn));
      });
    });
    el.querySelector("#next").onclick = () => { draft.step = 2; renderStep(el, app, draft); };
    return;
  }

  if (draft.step === 2) {
    el.innerHTML = `${bar}
      <h1 class="view-title">あなたの仮説</h1>
      <div class="card"><p><strong>${esc(s.title)}</strong></p><p class="small">${esc(s.event)}</p></div>
      <p class="small">一文でOK。「たぶん◯◯だから、◯◯なんだと思う」。書くと思考が固定され、答え合わせが効きます(スキップも可)。</p>
      <textarea class="input" id="free" placeholder="この出来事の背景には…">${esc(draft.freeText)}</textarea>
      <button class="btn" id="next">次へ</button>`;
    el.querySelector("#next").onclick = () => {
      draft.freeText = el.querySelector("#free").value.trim();
      draft.step = 3; renderStep(el, app, draft);
    };
    return;
  }

  if (draft.step === 3) {
    el.innerHTML = `${bar}
      <h1 class="view-title">どのレンズが効きそう?</h1>
      <p class="small">この出来事を深く説明できそうな視点を最大3つ予想してください。番組の選択と答え合わせします。</p>
      <div class="chipgrid" id="picks">
        ${app.data.lenses.lenses.map(l => `<button class="chippick ${draft.lensPrediction.includes(l.id) ? "is-selected" : ""}" data-id="${l.id}">${l.icon} ${esc(l.name)}</button>`).join("")}
      </div>
      <button class="btn" id="open">開封する — 番組の分析を見る</button>`;
    el.querySelectorAll(".chippick").forEach(btn => btn.onclick = () => {
      const id = btn.dataset.id;
      if (draft.lensPrediction.includes(id)) draft.lensPrediction = draft.lensPrediction.filter(x => x !== id);
      else if (draft.lensPrediction.length < 3) draft.lensPrediction.push(id);
      else return;
      btn.classList.toggle("is-selected");
    });
    el.querySelector("#open").onclick = () => { draft.step = 4; renderStep(el, app, draft); };
    return;
  }

  // step 4: 開封 → 分析表示 + 自己採点
  const chosen = s.lensAnalyses.map(a => a.lensId);
  const hits = draft.lensPrediction.filter(id => chosen.includes(id));
  el.innerHTML = `${bar}
    <h1 class="view-title">番組の分析</h1>
    <p class="small">レンズ予想: ${draft.lensPrediction.length ? `${hits.length} / ${draft.lensPrediction.length} 的中` : "(予想なし)"}
      — 的中したレンズには印がつきます</p>
    ${s.lensAnalyses.map(a => {
      const lens = app.lensById(a.lensId);
      const hit = draft.lensPrediction.includes(a.lensId);
      return `<div class="card analysis">
        <div class="lens-head">${lens?.icon || ""} ${esc(lens?.name || a.lensId)} ${hit ? '<span class="hit">✓ 予想的中</span>' : ""}</div>
        <p>${esc(a.analysis)}</p></div>`;
    }).join("")}
    <div class="card key-insight"><div class="eyebrow">KEY INSIGHT</div><p>${esc(s.keyInsight)}</p></div>
    <div class="card">
      <p><strong>自己採点</strong> — 開封前から持てていた視点をタップ</p>
      <div class="chipgrid" id="tags">
        ${s.viewpointTags.map(t => `<button class="chippick" data-t="${esc(t)}">${esc(t)}</button>`).join("")}
      </div>
      <button class="btn" id="finish">記録して完了</button>
    </div>`;
  const had = new Set();
  el.querySelectorAll("#tags .chippick").forEach(btn => btn.onclick = () => {
    const t = btn.dataset.t;
    had.has(t) ? had.delete(t) : had.add(t);
    btn.classList.toggle("is-selected");
  });
  el.querySelector("#finish").onclick = () => {
    const result = {
      done: true,
      guideAnswers: draft.guideAnswers,
      freeText: draft.freeText,
      lensPrediction: draft.lensPrediction,
      lensHits: hits,
      hadTags: [...had],
      missedTags: s.viewpointTags.filter(t => !had.has(t)),
      score: s.viewpointTags.length ? Math.round(([...had].length / s.viewpointTags.length) * 100) : 0,
    };
    app.store.setDayLog(app.episodeKey(), {
      suiri: result,
      title: s.title,
      isEvergreen: app.episodeMeta.isEvergreen,
    });
    app.store.recordActivity();
    renderSuiri._draft = null;
    renderResult(el, app, result, false);
  };
}

function renderResult(el, app, saved, revisit) {
  const s = app.episode.suiri;
  el.innerHTML = `
    <div class="eyebrow">CASE CLOSED</div>
    <h1 class="view-title">${esc(s.title)}</h1>
    <div class="card">
      <p><strong>視点カバー率 ${saved.score}%</strong>
        ${saved.lensPrediction?.length ? ` / レンズ予想 ${saved.lensHits?.length ?? 0}/${saved.lensPrediction.length} 的中` : ""}</p>
      ${saved.freeText ? `<p class="small">あなたの仮説: 「${esc(saved.freeText)}」</p>` : ""}
      ${saved.missedTags?.length ? `<p class="small">次に持ちたい視点: ${saved.missedTags.map(esc).join(" / ")}</p>` : `<p class="small">全視点カバー。お見事です。</p>`}
    </div>
    ${revisit ? `<p class="small">今日の推理は完了済み。分析を読み返せます。</p>` : `<p class="small">${esc(app.charName("fei"))}「お疲れさまでした。この続きはラジオでも話しています」</p>`}
    ${s.lensAnalyses.map(a => {
      const lens = app.lensById(a.lensId);
      return `<div class="card analysis"><div class="lens-head">${lens?.icon || ""} ${esc(lens?.name || a.lensId)}</div><p>${esc(a.analysis)}</p></div>`;
    }).join("")}
    <div class="card key-insight"><div class="eyebrow">KEY INSIGHT</div><p>${esc(s.keyInsight)}</p></div>
    <button class="btn btn-ghost" id="goRadio">📻 ラジオで聴く</button>`;
  el.querySelector("#goRadio").onclick = () => app.navigate("radio");
}
