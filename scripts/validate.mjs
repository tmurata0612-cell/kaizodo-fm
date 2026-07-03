// エピソードJSONの検証スクリプト。
// 使い方: node scripts/validate.mjs content/ep-1.json [他のファイル...]
// プール回(content/ep-N.json)と過去のアーカイブ回(日付・evergreen)の両方に対応。
// すべての生成コンテンツは commit 前にこれを通すこと(GENERATION.md参照)。
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const lensIds = new Set(JSON.parse(readFileSync(join(root, "data/lenses.json"), "utf8")).lenses.map(l => l.id));
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

  // --- suiri ---
  const s = ep.suiri;
  if (!s) err("suiri がない");
  else {
    if (!s.title) err("suiri.title がない");
    if (!s.event || s.event.length < 100 || s.event.length > 400) err(`suiri.event は100〜400字(現在${s.event?.length ?? 0})`);
    if (!s.sourceNote) err("suiri.sourceNote がない");
    if (!Array.isArray(s.guideQuestions) || s.guideQuestions.length < 2 || s.guideQuestions.length > 4) err("suiri.guideQuestions は2〜4問");
    else for (const [i, g] of s.guideQuestions.entries()) {
      if (!g.q) err(`guideQuestions[${i}].q がない`);
      if (!Array.isArray(g.choices) || g.choices.length < 2) err(`guideQuestions[${i}].choices は2つ以上`);
    }
    if (!Array.isArray(s.lensAnalyses) || s.lensAnalyses.length < 3 || s.lensAnalyses.length > 5) err("suiri.lensAnalyses は3〜5本");
    else for (const [i, a] of s.lensAnalyses.entries()) {
      if (!lensIds.has(a.lensId)) err(`lensAnalyses[${i}].lensId "${a.lensId}" が data/lenses.json に存在しない`);
      if (!a.analysis || a.analysis.length < 120) err(`lensAnalyses[${i}].analysis が短すぎる(120字以上)`);
    }
    if (!s.keyInsight || s.keyInsight.length < 40) err("suiri.keyInsight がないか短すぎる(40字以上)");
    if (!Array.isArray(s.viewpointTags) || s.viewpointTags.length < 3) err("suiri.viewpointTags は3つ以上");
  }

  // --- lens (今日のメンタルモデル) ---
  const l = ep.lens;
  if (!l) err("lens がない");
  else {
    if (!modelIds.has(l.modelId)) err(`lens.modelId "${l.modelId}" が data/models.json に存在しない`);
    if (!l.explanation || l.explanation.length < 200) err("lens.explanation が短すぎる(200字以上)");
    if (!l.example || l.example.length < 80) err("lens.example が短すぎる(80字以上)");
    const q = l.miniQuiz;
    if (!q || !q.q || !Array.isArray(q.choices) || q.choices.length < 2) err("lens.miniQuiz が不正");
    else {
      if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.choices.length) err("miniQuiz.answerIndex が範囲外");
      if (!q.why) err("miniQuiz.why(解説)がない");
    }
    if (!l.connection) err("lens.connection(今日の推理との接続)がない");
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
      if (!/^https:\/\/github\.com\/.+\/releases\/download\/.+\.mp3$/.test(a.url ?? "")) err("radio.audio.url がReleasesのmp3 URLでない");
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
