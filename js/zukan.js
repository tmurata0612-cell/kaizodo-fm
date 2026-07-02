// 図鑑: メンタルモデルのコレクション。タップで詳細画面に遷移(戻るボタンつき)
import { esc } from "./home.js";

export function renderZukan(el, app) {
  renderGrid(el, app);
}

function renderGrid(el, app) {
  const models = app.data.models.models;
  const evergreenIds = new Set((app.data.index?.evergreen || []).map(e => e.modelId));
  const isOpen = m => !!m.deliveredOn || evergreenIds.has(m.id);
  const opened = models.filter(isOpen);
  const cats = [...new Set(models.map(m => m.category))];

  el.innerHTML = `
    <h1 class="view-title">レンズ図鑑</h1>
    <p class="small">開放 <span class="zukan-count">${opened.length} / ${models.length}</span>
      — 毎日1つずつ、世界を見る道具が増えていきます(リスト自体も成長します)</p>
    ${cats.map(cat => {
      const items = models.filter(m => m.category === cat);
      return `<div class="zukan-cat">${esc(cat)} (${items.filter(isOpen).length}/${items.length})</div>
      <div class="zukan-grid">
        ${items.map(m => isOpen(m) ? `
          <button class="zukan-item" data-id="${m.id}">
            <div class="zname"><strong>${esc(m.name)}</strong></div>
            <div class="stars">${"★".repeat(app.store.modelState(m.id).stars)}${"☆".repeat(Math.max(0, 3 - app.store.modelState(m.id).stars))}</div>
          </button>` : `
          <div class="zukan-item is-locked"><div class="zname">？？？</div>
            <div class="small">未開放</div></div>`).join("")}
      </div>`;
    }).join("")}`;

  el.querySelectorAll(".zukan-item[data-id]").forEach(btn =>
    btn.onclick = () => renderDetail(el, app, btn.dataset.id));
}

function renderDetail(el, app, modelId) {
  const m = app.modelById(modelId);
  const st = app.store.modelState(m.id);
  // このモデルを扱ったエピソードを探す(おかわり導線)
  const fromDaily = (app.data.index?.episodes || []).find(e => e.modelId === m.id);
  const fromEv = (app.data.index?.evergreen || []).find(e => e.modelId === m.id);
  const src = fromDaily ? { key: fromDaily.date, topic: fromDaily.topic } :
              fromEv ? { key: fromEv.key, topic: fromEv.topic } : null;

  el.innerHTML = `
    <button class="btn btn-ghost" id="backToGrid" style="width:auto;padding:8px 18px;margin-bottom:14px">← 図鑑にもどる</button>
    <div class="eyebrow">${esc(m.category)} — ${esc(m.deliveredOn || "evergreen")} 開放</div>
    <h1 class="view-title">${esc(m.name)}</h1>
    <div class="card key-insight">
      <p>${esc(m.oneLiner)}</p>
    </div>
    <div class="card">
      <p><strong>習得度</strong> <span style="color:var(--amber);letter-spacing:0.15em">${"★".repeat(st.stars)}${"☆".repeat(Math.max(0, 3 - st.stars))}</span></p>
      <p class="small">クイズや週末の復習(記録タブ)に正解すると ★ が育ちます。</p>
    </div>
    ${src ? `
    <div class="card">
      <p><strong>このレンズを学んだ回</strong></p>
      <p class="small">${esc(src.topic)}</p>
      <button class="btn btn-ghost" id="replayEp">この回をもう一度ひらく</button>
    </div>` : ""}`;

  el.querySelector("#backToGrid").onclick = () => renderGrid(el, app);
  el.querySelector("#replayEp")?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    await app.setEpisode(src.key, { go: "home" });
  });
}
