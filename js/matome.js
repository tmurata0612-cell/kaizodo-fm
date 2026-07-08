// まとめ: 概念の解説(文章 + 図解) + 他分野への応用 + 適用クイズ。
// 旧 suiri(推理ゲーム) + lens(モデル解説) を統合したもの。
// 冒頭に超軽量の仮説ステップ(一文入力・記録)を置き、仮説思考と「1ヶ月前のあなた」機能を保つ。
import { esc } from "./home.js";

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

    ${s.diagram ? `<div class="sec"><div class="sec-h">図解</div>${diagramHTML(s.diagram)}</div>` : ""}

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

// --- 図解: 構造化スペック → 本物の視覚図解(「世界の名著」v2方式を移植) ---
// type: flow(縦の流れ+軸) / branch(親→子) / compare(横並び+関係/結論/連鎖) /
//       matrix(2×2) / cycle(循環) / pairs(対応づけ+条件)。node/col は tone(pos/neg/warn)・
//       mark(warn/bad/good/emph)・sub を持てる。richText は **強調** に対応。
function richText(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}
function dgmNote(spec) {
  return spec.note ? `<p class="dgm-note">${richText(spec.note)}</p>` : "";
}
function nodeBox(n, cls) {
  const sub = n.sub ? `<span class="nb-sub">${richText(n.sub)}</span>` : "";
  return `<span class="${cls}${n.mark ? " m-" + n.mark : ""}${n.tone ? " t-" + n.tone : ""}">` +
    `<span class="nb-t">${richText(n.t)}</span>${sub}</span>`;
}
function colBox(c) {
  const sub = c.sub ? `<span class="cb-sub">${richText(c.sub)}</span>` : "";
  const items = (c.items || []).map(x => `<li>${richText(x)}</li>`).join("");
  return `<div class="dgm-col${c.tone ? " t-" + c.tone : ""}">` +
    `<span class="cb-t">${richText(c.t)}</span>${sub}${items ? `<ul>${items}</ul>` : ""}</div>`;
}
function diagramHTML(spec) {
  let b = "";
  switch (spec.type) {
    case "flow": {
      const arrow = spec.dir === "up" ? "↑" : "↓";
      const parts = spec.steps.map((s, i) =>
        (i ? `<span class="fl-arrow" aria-hidden="true">${arrow}</span>` : "") + nodeBox(s, "fl-step")).join("");
      const ax = spec.axis ? `<span class="fl-axis top">${esc(spec.axis.top)}</span>` : "";
      const axb = spec.axis ? `<span class="fl-axis bottom">${esc(spec.axis.bottom)}</span>` : "";
      b = `<div class="dgm dgm-flow">${ax}${parts}${axb}</div>`;
      break;
    }
    case "branch": {
      b = `<div class="dgm dgm-branch">${nodeBox(spec.root, "br-root")}` +
        `<span class="br-stem" aria-hidden="true"></span>` +
        `<div class="dgm-cols n${spec.cols.length}">${spec.cols.map(colBox).join("")}</div></div>`;
      break;
    }
    case "compare": {
      const head = spec.head ? `<div class="cmp-head">${richText(spec.head)}</div>` : "";
      const cols = spec.cols.map(colBox).join(
        spec.rel && spec.cols.length === 2 ? `<span class="cmp-rel" aria-hidden="true">${esc(spec.rel)}</span>` : "");
      const outcome = spec.outcome
        ? `<span class="cmp-down" aria-hidden="true">↓</span>${nodeBox(spec.outcome, "cmp-outcome")}` : "";
      const cascade = spec.cascade
        ? `<div class="cmp-cascade">` + spec.cascade.map((s, i) =>
            (i ? `<span class="fl-arrow" aria-hidden="true">↓</span>` : "") +
            `<span class="casc-step">${richText(s)}</span>`).join("") + `</div>`
        : "";
      b = `<div class="dgm dgm-compare">${head}<div class="dgm-cols n${spec.cols.length}">${cols}</div>${outcome}${cascade}</div>`;
      break;
    }
    case "matrix": {
      const [r0, r1] = spec.rows, [c0, c1] = spec.cols;
      const cell = (x) => `<div class="mx-cell${x.tone ? " t-" + x.tone : ""}">` +
        `<span class="mx-t">${richText(x.t)}</span>${x.sub ? `<span class="mx-sub">${richText(x.sub)}</span>` : ""}</div>`;
      b = `<div class="dgm dgm-matrix"><span class="mx-collabel">${esc(spec.colLabel)} →</span>` +
        `<div class="mx-body"><span class="mx-rowlabel">${esc(spec.rowLabel)} ↓</span>` +
        `<div class="mx-grid"><div class="mx-corner"></div>` +
        `<div class="mx-hd">${esc(c0)}</div><div class="mx-hd">${esc(c1)}</div>` +
        `<div class="mx-rh">${esc(r0)}</div>${cell(spec.cells[0][0])}${cell(spec.cells[0][1])}` +
        `<div class="mx-rh">${esc(r1)}</div>${cell(spec.cells[1][0])}${cell(spec.cells[1][1])}` +
        `</div></div></div>`;
      break;
    }
    case "cycle": {
      const parts = spec.nodes.map((n, i) =>
        (i ? `<span class="fl-arrow" aria-hidden="true">↓</span>` : "") + nodeBox(n, "cyc-node")).join("");
      const loop = spec.loop || "⟲ 最初に戻り、ループが自己増幅する";
      b = `<div class="dgm dgm-cycle">${parts}<span class="cyc-loop" aria-hidden="true">${esc(loop)}</span></div>`;
      break;
    }
    case "pairs": {
      const rows = spec.rows.map(r => `<div class="pr-row">` +
        `<span class="pr-l">${richText(r.l)}</span>` +
        `<span class="pr-rel" aria-hidden="true">${esc(r.rel || "")}<span class="pr-arw">→</span></span>` +
        `<span class="pr-r">${richText(r.r)}</span></div>`).join("");
      const conds = spec.conds
        ? `<div class="pr-conds">` + spec.conds.map(c => `<div class="pr-cond">` +
            `<span class="pc-if">${richText(c.if)}</span><span class="pc-arw" aria-hidden="true">→</span>` +
            `<span class="pc-then">${richText(c.then)}</span></div>`).join("") + `</div>`
        : "";
      b = `<div class="dgm dgm-pairs"><div class="pr-rows">${rows}</div>${conds}</div>`;
      break;
    }
    default:
      return "";
  }
  return b + dgmNote(spec);
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
