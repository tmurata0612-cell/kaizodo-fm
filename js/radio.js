// ラジオ画面: グローバルプレイヤー(player.js)のUI。
// 再生・シークバー・速度(◀ ×1.5 ▶)・行タップ再生。画面を離れても再生は続く。
import { esc } from "./home.js";
import { player, RATES } from "./player.js";

export function renderRadio(el, app) {
  const ep = app.episode;
  if (!ep?.radio) { el.innerHTML = `<p class="small">今日の放送を読み込めませんでした。</p>`; return; }

  const ps = player.state;

  el.innerHTML = `
    <div class="eyebrow">ON AIR SCRIPT</div>
    <h1 class="view-title">${esc(ep.radio.title)}</h1>
    <div class="radio-controls">
      <button class="iconbtn skipbtn" id="prevLine" aria-label="ひとつ戻る">⏮</button>
      <button class="playbtn" id="play" aria-label="再生/停止">▶</button>
      <button class="iconbtn skipbtn" id="nextLine" aria-label="ひとつ進む">⏭</button>
      <div class="rate-ctrl" role="group" aria-label="再生速度">
        <button class="iconbtn" id="rateDown" aria-label="遅くする">◀</button>
        <span class="mono" id="rateLabel">×${ps.rate}</span>
        <button class="iconbtn" id="rateUp" aria-label="速くする">▶</button>
      </div>
    </div>
    <div class="seek-row">
      <input type="range" id="seek" min="0" max="${ps.script.length - 1}" step="1" value="${ps.lineIndex}" aria-label="シーク">
      <span class="mono small" id="seekLabel">${ps.lineIndex + 1}/${ps.script.length}</span>
    </div>
    <div class="eq" aria-hidden="true">${"<i></i>".repeat(20)}</div>
    <p class="small" id="voiceNote">${player.supported ? "台本の行をタップすると、そこから再生します。" : "このブラウザは読み上げに未対応です。台本をお楽しみください。"}</p>
    <div id="scriptBox">
      ${ps.script.map((line, i) => `
        <div class="script-line ${line.speaker}" data-i="${i}" role="button" tabindex="0">
          <div class="who">${app.charIcon(line.speaker)}</div>
          <div><div class="name">${esc(app.charName(line.speaker))}</div>
          <div class="text">${esc(line.text)}</div></div>
        </div>`).join("")}
    </div>`;

  const playBtn = el.querySelector("#play");
  const seek = el.querySelector("#seek");
  const seekLabel = el.querySelector("#seekLabel");
  const rateLabel = el.querySelector("#rateLabel");
  let seeking = false;

  const sync = (ps) => {
    if (!el.isConnected) { unsub(); return; }
    playBtn.textContent = ps.playing ? "■" : "▶";
    rateLabel.textContent = `×${ps.rate}`;
    if (!seeking) seek.value = ps.lineIndex;
    seekLabel.textContent = `${ps.lineIndex + 1}/${ps.script.length}`;
    el.querySelectorAll(".script-line").forEach(n =>
      n.classList.toggle("is-now", Number(n.dataset.i) === ps.lineIndex));
    if (ps.playing) {
      el.querySelector(`.script-line[data-i="${ps.lineIndex}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };
  const unsub = player.subscribe(sync);

  playBtn.onclick = () => player.toggle();
  el.querySelector("#prevLine").onclick = () => player.prev();
  el.querySelector("#nextLine").onclick = () => player.next();
  el.querySelector("#rateDown").onclick = () => player.cycleRate(-1);
  el.querySelector("#rateUp").onclick = () => player.cycleRate(1);

  seek.addEventListener("input", () => {
    seeking = true;
    seekLabel.textContent = `${Number(seek.value) + 1}/${player.state.script.length}`;
  });
  seek.addEventListener("change", () => {
    seeking = false;
    player.seekTo(Number(seek.value));
  });

  el.querySelectorAll(".script-line").forEach(n => {
    const go = () => {
      player.seekTo(Number(n.dataset.i));
      if (!player.state.playing) player.play();
    };
    n.addEventListener("click", go);
    n.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  if (!player.supported) {
    playBtn.disabled = true;
    el.querySelector("#prevLine").disabled = true;
    el.querySelector("#nextLine").disabled = true;
  }
}
