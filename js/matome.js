// まとめ: 概念の解説(文章 + 図解) + 他分野への応用 + 適用クイズ。
// 旧 suiri(推理ゲーム) + lens(モデル解説) を統合したもの。
// 冒頭に超軽量の仮説ステップ(一文入力・記録)を置き、仮説思考と「1ヶ月前のあなた」機能を保つ。
import { esc } from "./home.js";
import { diagrams } from "./diagrams.js";

export function renderMatome(el, app) {
  const ep = app.episode;
  if (!ep?.summary) { el.innerHTML = `<p class="small">今日のまとめを読み込めませんでした。</p>`; return; }
  const s = ep.summary;
  const epKey = app.episodeKey();
  const log = app.store.dayLog(epKey) || {};
  // suiri.done = 「今日の一文仮説を出した(=まとめを開いた)」の互換フラグ。立っていれば本文を開示
  if (log.suiri?.done) { renderBody(el, app, s, epKey); return; }
  renderHook(el, app, s, epKey);
}

// --- 超軽量の仮説ステップ(出来事 + 問い + 選択式の仮説。スキップ可) ---
function renderHook(el, app, s, epKey) {
  const draft = (renderMatome._draft?.epKey === epKey) ? renderMatome._draft : { epKey, pick: -1 };
  renderMatome._draft = draft;
  const h = s.hook || {};
  const choices = h.choices || [];
  el.innerHTML = `
    <div class="eyebrow">CASE FILE — ${esc(s.genre || "")}</div>
    <h1 class="view-title">${esc(s.title)}</h1>
    ${h.event ? `<div class="card"><p>${esc(h.event)}</p></div>` : ""}
    ${h.question ? `<p class="q-line">${esc(h.question)}</p>` : ""}
    <p class="small">答えを見る前に、あなたの読みに一番近いものを選んでください(どれも一理あります)。選ぶと記録に残り、後で答え合わせできます。</p>
    <div class="choices" id="hooks">
      ${choices.map((c, i) => `<button class="choice ${draft.pick === i ? "is-selected" : ""}" data-i="${i}">${esc(c)}</button>`).join("")}
    </div>
    <button class="btn" id="open">めくる — 解説を読む</button>`;
  el.querySelectorAll("#hooks .choice").forEach(btn => btn.onclick = () => {
    draft.pick = Number(btn.dataset.i);
    el.querySelectorAll("#hooks .choice").forEach(b => b.classList.toggle("is-selected", b === btn));
  });
  el.querySelector("#open").onclick = () => {
    const picked = draft.pick >= 0 ? (choices[draft.pick] ?? "") : "";
    app.store.setDayLog(epKey, { suiri: { done: true, freeText: picked }, title: s.title });
    app.store.recordActivity();
    renderMatome._draft = null;
    renderBody(el, app, s, epKey);
  };
}

// --- 本文: 定義 → メカニズム → 図解 → 応用 → 使いどころ/限界 → 適用クイズ ---
function renderBody(el, app, s, epKey) {
  const log = app.store.dayLog(epKey) || {};
  const model = app.modelById(s.modelId);
  const freeText = log.suiri?.freeText;

  el.innerHTML = `
    <div class="eyebrow">SUMMARY — ${esc(model?.category || s.genre || "")}</div>
    <h1 class="view-title">${esc(s.title)}</h1>

    <div class="card key-insight">
      <div class="eyebrow">この回のレンズ</div>
      <p>${esc(model?.name ? model.name + "：" : "")}${esc(s.definition || "")}</p>
    </div>

    ${freeText ? `<p class="small your-hypo">あなたの仮説:「${esc(freeText)}」</p>` : ""}

    ${section("なぜそうなるのか", listBlock(s.mechanism))}

    ${diagrams[epKey] ? `<div class="sec"><div class="sec-h">図解</div><div class="figbox">${diagrams[epKey]}</div>${s.diagramNote ? `<p class="dgm-note">${richText(s.diagramNote)}</p>` : ""}</div>` : ""}

    ${section("他ではどう応用されるか", applicationsBlock(s.applications))}

    <div class="sec two-col">
      ${s.usage?.length ? `<div class="mini-card"><div class="mini-h">使いどころ</div>${listBlock(s.usage)}</div>` : ""}
      ${s.limits?.length ? `<div class="mini-card lim"><div class="mini-h">効かない条件</div>${listBlock(s.limits)}</div>` : ""}
    </div>

    ${s.quiz ? quizBlock(s.quiz) : ""}

    <button class="btn btn-ghost" id="goRadio" style="margin-top:16px">📻 ラジオで聴く</button>`;

  wireQuiz(el, app, s, epKey);
  el.querySelector("#goRadio").onclick = () => app.navigate("radio");
}

function section(title, inner) {
  return `<div class="sec"><div class="sec-h">${esc(title)}</div>${inner}</div>`;
}
function listBlock(items) {
  if (!items?.length) return "";
  return `<ul class="dot-list">${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
}
function applicationsBlock(apps) {
  if (!apps?.length) return "";
  return apps.map(a => `
    <div class="app-card">
      <span class="app-domain">${esc(a.domain)}</span>
      <p>${esc(a.text)}</p>
    </div>`).join("");
}

// --- 図解の核心テキスト用の簡易リッチテキスト(**強調** に対応) ---
function richText(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}

// --- 適用クイズ(正解で図鑑の★が育つ。旧 lens.miniQuiz と同じ仕組み) ---
function quizBlock(q) {
  return `
    <div class="sec"><div class="sec-h">適用クイズ</div>
      <div class="card" id="quizCard">
        <p>${esc(q.q)}</p>
        <div class="choices" id="quiz">
          ${q.choices.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join("")}
        </div>
        <p class="small" id="quizWhy" hidden></p>
      </div>
    </div>`;
}

function wireQuiz(el, app, s, epKey) {
  const q = s.quiz;
  if (!q) return;
  const whyEl = el.querySelector("#quizWhy");
  const buttons = el.querySelectorAll("#quiz .choice");
  const answered = app.store.dayLog(epKey)?.quiz;

  const reveal = (picked) => {
    buttons.forEach(b => {
      const i = Number(b.dataset.i);
      b.disabled = true;
      if (i === q.answerIndex) b.classList.add("is-correct");
      else if (i === picked) b.classList.add("is-wrong");
    });
    whyEl.hidden = false;
    whyEl.innerHTML = `<strong>${picked === q.answerIndex ? "正解! ★が育ちました" : "惜しい"}</strong> — ${esc(q.why)}`;
  };

  if (answered) { reveal(answered.picked); return; }

  buttons.forEach(b => b.onclick = () => {
    const picked = Number(b.dataset.i);
    const correct = picked === q.answerIndex;
    app.store.setDayLog(epKey, { quiz: { picked, correct, modelId: s.modelId } });
    if (correct) app.store.starUp(s.modelId);
    else app.store.update(st => { if (!st.models[s.modelId]) st.models[s.modelId] = { stars: 0 }; });
    app.store.recordActivity();
    reveal(picked);
  });
}
