// 設定: 呼び名・キャラ名・声・バックアップ(エクスポート/インポート)・リセット
import { esc } from "./home.js";

export function renderSettings(el, app) {
  const s = app.store.get().settings;
  const chars = app.data.characters.characters;
  const jaVoices = ("speechSynthesis" in window)
    ? speechSynthesis.getVoices().filter(v => v.lang?.startsWith("ja")) : [];

  el.innerHTML = `
    <h1 class="view-title">設定</h1>
    <div class="card">
      <div class="field"><label>あなたの呼び名(番組内で使われます)</label>
        <input class="input" id="listenerName" value="${esc(s.listenerName)}"></div>
    </div>
    <div class="card">
      <p><strong>パーソナリティ</strong></p>
      ${Object.entries(chars).map(([id, c]) => `
        <div class="field"><label>${c.icon} ${esc(c.role)} の名前</label>
          <input class="input" data-char="${id}" value="${esc(s.charNames[id] || c.displayName)}"></div>
        ${jaVoices.length ? `
        <div class="field"><label>${esc(s.charNames[id] || c.displayName)} の声</label>
          <select class="input" data-voice="${id}">
            <option value="">自動</option>
            ${jaVoices.map(v => `<option value="${esc(v.voiceURI)}" ${s.voices[id]?.voiceURI === v.voiceURI ? "selected" : ""}>${esc(v.name)}</option>`).join("")}
          </select></div>` : ""}`).join("")}
      <p class="small">※ 使える声は端末によって異なります。スマホの設定で日本語音声を追加すると選択肢が増えます。</p>
      <button class="btn btn-ghost" id="testVoice">声をテスト</button>
    </div>
    <div class="card">
      <p><strong>バックアップ</strong></p>
      <p class="small">記録はこの端末のブラウザ内にだけ保存されます。ときどき書き出しておくと機種変更でも安心です。</p>
      <div class="btn-row">
        <button class="btn btn-ghost" id="exportBtn">書き出す</button>
        <button class="btn btn-ghost" id="importBtn">読み込む</button>
      </div>
      <input type="file" id="importFile" accept="application/json" hidden>
    </div>
    <div class="card">
      <button class="btn btn-ghost" id="resetBtn" style="color:var(--red)">すべての記録を消去</button>
    </div>
    <button class="btn" id="saveBtn">保存する</button>`;

  el.querySelector("#saveBtn").onclick = () => {
    app.store.update(st => {
      st.settings.listenerName = el.querySelector("#listenerName").value.trim() || "あなた";
      el.querySelectorAll("[data-char]").forEach(inp => {
        st.settings.charNames[inp.dataset.char] = inp.value.trim() || chars[inp.dataset.char].displayName;
      });
      el.querySelectorAll("[data-voice]").forEach(sel => {
        if (sel.value) st.settings.voices[sel.dataset.voice] = { ...(st.settings.voices[sel.dataset.voice] || {}), voiceURI: sel.value };
        else delete st.settings.voices[sel.dataset.voice];
      });
    });
    app.goBack(); // 開く前の画面(例: ラジオ)に戻る
  };

  el.querySelector("#testVoice").onclick = () => {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    Object.entries(chars).forEach(([id, c], i) => {
      const u = new SpeechSynthesisUtterance(`${app.charName(id)}です。よろしくお願いします。`);
      const uri = el.querySelector(`[data-voice="${id}"]`)?.value;
      const v = speechSynthesis.getVoices().find(v => v.voiceURI === uri);
      if (v) u.voice = v;
      u.lang = "ja-JP";
      u.pitch = c.voice?.pitch ?? 1;
      speechSynthesis.speak(u);
    });
  };

  el.querySelector("#exportBtn").onclick = () => {
    const blob = new Blob([app.store.exportJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kaizodo-fm-backup-${app.store.today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const fileInput = el.querySelector("#importFile");
  el.querySelector("#importBtn").onclick = () => fileInput.click();
  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      app.store.importJson(await file.text());
      alert("読み込みました。おかえりなさい。");
      app.navigate("home");
    } catch (e) {
      alert(`読み込めませんでした: ${e.message}`);
    }
  };

  el.querySelector("#resetBtn").onclick = () => {
    if (confirm("ストリーク・仮説ログ・図鑑の進捗がすべて消えます。本当に消去しますか?")) {
      app.store.resetAll();
      app.navigate("home");
    }
  };
}
