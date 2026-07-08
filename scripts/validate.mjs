// エピソードJSONの検証スクリプト。
// 使い方: node scripts/validate.mjs content/ep-1.json [他のファイル...]
// プール回(content/ep-N.json)と過去のアーカイブ回(日付・evergreen)の両方に対応。
// すべての生成コンテンツは commit 前にこれを通すこと(GENERATION.md参照)。
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modelIds = new Set(JSON.parse(readFileSync(join(root, "data/models.json"), "utf8")).models.map(m => m.id));
const speakerIds = new Set(Object.keys(JSON.parse(readFileSync(join(root, "data/characters.json"), "utf8")).characters));

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/validate.mjs <episode.json> [...]");
  process.exit(2);
}

let failed = false;

for (const file of files) {
  const errors = [];
  const err = (msg) => errors.push(msg);
  let ep;
  try {
    ep = JSON.parse(readFileSync(join(root, file), "utf8"));
  } catch (e) {
    console.error(`NG ${file}: JSONとして読めない: ${e.message}`);
    failed = true;
    continue;
  }

  const poolMatch = file.match(/(ep-\d+)\.json$/);
  const isEvergreen = /evergreen/.test(file);
  if (poolMatch) {
    if (ep.id !== poolMatch[1]) err(`id "${ep.id}" がファイル名(${poolMatch[1]})と一致しない`);
    if ("date" in ep) err("プール回に date フィールドは置かない(id 方式)");
  } else if (isEvergreen) {
    if (ep.date !== "evergreen") err('evergreen回は date を "evergreen" にする');
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ep.date ?? "")) err("date が YYYY-MM-DD 形式でない");
  }

  // --- summary (まとめ: 概念解説 + 図解 + 応用 + 適用クイズ。旧 suiri + lens を統合) ---
  const DIAGRAM_TYPES = new Set(["flow", "loop", "compare"]);
  const s = ep.summary;
  if (!s) err("summary がない");
  else {
    if (!s.title) err("summary.title がない");
    if (!s.genre) err("summary.genre がない");
    if (!modelIds.has(s.modelId)) err(`summary.modelId "${s.modelId}" が data/models.json に存在しない`);

    // hook(超軽量の仮説ステップ。選択式)
    const h = s.hook;
    if (!h || !h.event || !h.question) err("summary.hook.event / hook.question がない");
    else {
      if (h.event.length < 60 || h.event.length > 400) err(`summary.hook.event は60〜400字(現在${h.event.length})`);
      if (!Array.isArray(h.choices) || h.choices.length < 2 || h.choices.length > 4) err("summary.hook.choices は2〜4個(選択式の仮説)");
    }

    if (!s.definition || s.definition.length < 60) err("summary.definition が短すぎる(60字以上)");
    if (!Array.isArray(s.mechanism) || s.mechanism.length < 2) err("summary.mechanism は2項目以上");

    // diagram(HTML/CSS レスポンシブ描画。type で形が変わる)
    const d = s.diagram;
    if (!d) err("summary.diagram がない");
    else if (!DIAGRAM_TYPES.has(d.type)) err(`summary.diagram.type は ${[...DIAGRAM_TYPES].join("/")} のいずれか(現在 "${d.type}")`);
    else if (d.type === "compare") {
      if (!Array.isArray(d.columns) || d.columns.length < 2) err("compare図解は columns を2列以上");
      else for (const [i, c] of d.columns.entries()) {
        if (!c.title) err(`diagram.columns[${i}].title がない`);
        if (!Array.isArray(c.items) || !c.items.length) err(`diagram.columns[${i}].items が空`);
      }
    } else { // flow / loop
      if (!Array.isArray(d.nodes) || d.nodes.length < 2) err("flow/loop図解は nodes を2つ以上");
    }

    // applications(他分野への応用。この設計の目玉)
    if (!Array.isArray(s.applications) || s.applications.length < 2) err("summary.applications は2つ以上");
    else for (const [i, a] of s.applications.entries()) {
      if (!a.domain) err(`applications[${i}].domain がない`);
      if (!a.text || a.text.length < 40) err(`applications[${i}].text が短すぎる(40字以上)`);
    }

    if (!Array.isArray(s.usage) || !s.usage.length) err("summary.usage が空");
    if (!Array.isArray(s.limits) || !s.limits.length) err("summary.limits が空");

    // 適用クイズ(正解で図鑑の★が育つ)
    const q = s.quiz;
    if (!q || !q.q || !Array.isArray(q.choices) || q.choices.length < 2) err("summary.quiz が不正");
    else {
      if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.choices.length) err("quiz.answerIndex が範囲外");
      if (!q.why) err("quiz.why(解説)がない");
    }
  }

  // --- radio ---
  const r = ep.radio;
  if (!r) err("radio がない");
  else {
    if (!r.title) err("radio.title がない");
    if (!Array.isArray(r.script) || r.script.length < 30) err(`radio.script は30行以上(現在${r.script?.length ?? 0}行)`);
    else {
      let total = 0;
      const speakers = new Set();
      for (const [i, line] of r.script.entries()) {
        if (!speakerIds.has(line.speaker)) err(`script[${i}].speaker "${line.speaker}" が data/characters.json に存在しない`);
        if (!line.text) err(`script[${i}].text がない`);
        total += line.text?.length ?? 0;
        speakers.add(line.speaker);
      }
      if (total < 2200 || total > 4500) err(`台本の総文字数は2200〜4500字(8〜12分想定、現在${total}字)`);
      if (speakers.size < 2) err("台本に2人以上の話者が必要(掛け合い形式)");
      if (poolMatch && r.script.some(line => /\{\{\w+\}\}/.test(line.text ?? ""))) {
        err("プール回の台本に変数枠({{listener}}等)は使えない(音声を事前生成するため)");
      }
    }
    // radio.audio(scripts/make_audio.py が書き戻す。プール回は音声付きで公開するのが原則)
    const a = r.audio;
    if (a) {
      // 音声は同一オリジンの相対パス audio/ep-N.mp3(Pagesが audio/mpeg で配信 → iOS Safari で再生可)。
      // 実体は Release audio-v1 に置き、Pages デプロイ時に workflow が audio/ へ取り込む。
      if (!/^audio\/.+\.mp3$/.test(a.url ?? "")) err("radio.audio.url が相対パス audio/*.mp3 でない");
      if (!(typeof a.durationSec === "number" && a.durationSec > 0)) err("radio.audio.durationSec が正の数でない");
      if (!Array.isArray(a.lineStartSec) || a.lineStartSec.length !== (r.script?.length ?? 0)) {
        err(`radio.audio.lineStartSec の要素数が台本の行数と一致しない(${a.lineStartSec?.length ?? 0} vs ${r.script?.length ?? 0})`);
      } else {
        if (a.lineStartSec[0] !== 0) err("radio.audio.lineStartSec は 0 から始める");
        for (let i = 1; i < a.lineStartSec.length; i++) {
          if (!(a.lineStartSec[i] > a.lineStartSec[i - 1])) { err(`radio.audio.lineStartSec が単調増加でない(index ${i})`); break; }
        }
        if (a.lineStartSec[a.lineStartSec.length - 1] >= a.durationSec) err("lineStartSec の最終値が durationSec 以上");
      }
    }
  }

  if (errors.length) {
    console.error(`NG ${file}`);
    for (const e of errors) console.error(`  - ${e}`);
    failed = true;
  } else {
    console.log(`OK ${file}`);
  }
}

process.exit(failed ? 1 : 0);
