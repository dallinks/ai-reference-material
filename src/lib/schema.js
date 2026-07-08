// Course validation — the contract every course (hand-written or AI-generated)
// must satisfy before the app will trust it. Keeping this strict is what lets
// generation stay fast without silently breaking the runtime.
//
// Used by scripts/validate-course.mjs and can be run in-app on load.

export const BLOCK_TYPES = ["text", "example", "code", "callout", "decision", "checklist", "diagram", "theorem", "exercises"];
// `diagram` renders to SVG (see components/Diagram.jsx). Three kinds, each with a
// structured shape the renderer transcribes faithfully — so the shape is validated.
export const DIAGRAM_KINDS = ["recursion", "graph", "sequence"];
// `theorem` carries a statement + inline proof (the spine of a rigorous text).
// Non-definition kinds MUST prove what they state.
export const THEOREM_KINDS = ["theorem", "lemma", "corollary", "proposition", "definition"];
// `proof` and `open` are both AI-graded free-response (see lib/grader.js): proof
// for math/derivations, open for judgment/analysis. Same shape, same grading.
export const QUESTION_TYPES = ["mcq", "multi", "numeric", "short", "proof", "open"];

// Depth floors — what separates a textbook section from lecture notes. These are
// hard errors: a lesson that states a 20-minute estimate must carry 20 minutes of
// study material, at an effective pace of STUDY_WPM (reading dense prose + working
// the examples). Exercise items count as EXERCISE_WORD_EQUIV words each, since
// attempting a problem takes far longer than reading it.
export const DEPTH = {
  MIN_LESSON_WORDS: 1200, // absolute floor for any lesson's content
  STUDY_WPM: 90, // claimed estMinutes must be backed by estMinutes × this in study-words
  EXERCISE_WORD_EQUIV: 250, // study-word credit per exercise item
  MAX_IMPLIED_WPM: 300, // words/estMinutes above this ⇒ the estimate undersells the lesson
  MIN_BLOCKS: 8, // "8–14 content blocks" per AUTHORING.md
  MIN_TEXT_BLOCK_WORDS: 40, // a `text` block below this is a bullet point, not exposition
  MIN_THEOREM_BLOCKS: 1, // every lesson formalizes something (a `definition` counts)
  MIN_WORKED_INSTANCES: 2, // `example` + `code` blocks
  MIN_EXERCISE_ITEMS: 3, // per exercises block
  MIN_REVIEW_ITEMS: 3,
  MAX_REVIEW_ITEMS: 6,
  MIN_GATE_QUESTIONS: 4,
  MAX_MCQ_FRACTION: 0.5, // more than half `mcq` ⇒ the gate is guessable
  MIN_RUBRIC_CRITERIA: 3, // for `proof`/`open` questions
  MIN_MASTERY_THRESHOLD: 0.8,
};

// Words across every string field of a value, recursively — bodies, headings,
// statements, proofs, code, prompts, solutions, diagram labels.
export function countWords(v) {
  if (v == null) return 0;
  if (typeof v === "string") return v.split(/\s+/).filter(Boolean).length;
  if (Array.isArray(v)) return v.reduce((s, x) => s + countWords(x), 0);
  if (typeof v === "object") return Object.values(v).reduce((s, x) => s + countWords(x), 0);
  return 0;
}

function err(errors, path, msg) {
  errors.push(`${path}: ${msg}`);
}

function validateDiagram(b, path, errors) {
  if (!DIAGRAM_KINDS.includes(b.kind)) {
    err(errors, path, `diagram has bad kind "${b.kind}" (expected ${DIAGRAM_KINDS.join("|")})`);
    return;
  }
  if (b.kind === "recursion") {
    if (!Array.isArray(b.levels) || !b.levels.length) err(errors, path, "recursion diagram needs a non-empty levels[]");
    (b.levels || []).forEach((lv, i) => {
      if (!lv.ellipsis && lv.row == null) err(errors, `${path}.levels[${i}]`, "a drawn level needs a `row` (its total work)");
    });
  } else if (b.kind === "graph") {
    if (!Array.isArray(b.nodes) || !b.nodes.length) {
      err(errors, path, "graph diagram needs a non-empty nodes[]");
      return;
    }
    const ids = new Set();
    b.nodes.forEach((n, i) => {
      if (!n.id) err(errors, `${path}.nodes[${i}]`, "node needs an id");
      if (typeof n.x !== "number" || typeof n.y !== "number") err(errors, `${path}.nodes[${i}]`, "node needs numeric x,y in 0..100");
      ids.add(n.id);
    });
    (b.edges || []).forEach((e, i) => {
      if (!ids.has(e.from) || !ids.has(e.to)) err(errors, `${path}.edges[${i}]`, `edge references unknown node ("${e.from}"→"${e.to}")`);
    });
  } else if (b.kind === "sequence") {
    if (!Array.isArray(b.actors) || b.actors.length < 2) err(errors, path, "sequence diagram needs >=2 actors");
    if (!Array.isArray(b.messages) || !b.messages.length) err(errors, path, "sequence diagram needs a non-empty messages[]");
    const set = new Set(b.actors || []);
    (b.messages || []).forEach((m, i) => {
      if (m.note) return;
      if (!set.has(m.from) || !set.has(m.to)) err(errors, `${path}.messages[${i}]`, `message references an actor not in actors[] ("${m.from}"→"${m.to}")`);
    });
  }
}

function validateTheorem(b, path, errors) {
  if (!THEOREM_KINDS.includes(b.kind)) err(errors, path, `theorem has bad kind "${b.kind}" (expected ${THEOREM_KINDS.join("|")})`);
  if (!b.statement) err(errors, path, "theorem needs a statement");
  if (b.kind !== "definition" && !b.proof) err(errors, path, `a ${b.kind || "theorem"} must include an inline proof (only 'definition' may omit it)`);
}

function validateExercises(b, path, errors) {
  if (!Array.isArray(b.items) || !b.items.length) {
    err(errors, path, "exercises needs a non-empty items[]");
    return;
  }
  if (b.items.length < DEPTH.MIN_EXERCISE_ITEMS)
    err(errors, path, `only ${b.items.length} exercise(s) — a problem set needs >=${DEPTH.MIN_EXERCISE_ITEMS}`);
  b.items.forEach((it, i) => {
    if (!it.prompt) err(errors, `${path}.items[${i}]`, "exercise needs a prompt");
    if (!it.solution) err(errors, `${path}.items[${i}]`, "exercise needs a worked solution");
  });
}

// The depth gate: is this lesson actually the "full textbook section" that
// AUTHORING.md promises, and is its estMinutes claim honest?
function validateLessonDepth(lesson, path, errors, warnings) {
  const blocks = lesson.content || [];
  const words = countWords(blocks);
  const exerciseItems = blocks
    .filter((b) => b.type === "exercises")
    .reduce((s, b) => s + (b.items?.length || 0), 0);
  const studyWords = words + exerciseItems * DEPTH.EXERCISE_WORD_EQUIV;
  const theorems = blocks.filter((b) => b.type === "theorem").length;
  const worked = blocks.filter((b) => b.type === "example" || b.type === "code").length;

  if (typeof lesson.estMinutes !== "number" || lesson.estMinutes < 1) {
    err(errors, path, "needs a numeric estMinutes >= 1");
  } else {
    const required = Math.round(lesson.estMinutes * DEPTH.STUDY_WPM);
    if (studyWords < required)
      err(errors, path,
        `claims ${lesson.estMinutes} min but carries only ${studyWords} study-words (${words} words + ${exerciseItems} exercises) — needs >=${required}; deepen the content or lower estMinutes`);
    if (words / lesson.estMinutes > DEPTH.MAX_IMPLIED_WPM)
      warnings.push(`${path}: ${words} words for ${lesson.estMinutes} min implies >${DEPTH.MAX_IMPLIED_WPM} wpm — estMinutes undersells this lesson`);
  }
  if (words < DEPTH.MIN_LESSON_WORDS)
    err(errors, path, `${words} words of content — a textbook section needs >=${DEPTH.MIN_LESSON_WORDS}`);
  if (blocks.length < DEPTH.MIN_BLOCKS)
    err(errors, path, `${blocks.length} content block(s) — needs >=${DEPTH.MIN_BLOCKS} (motivation, definitions, theorems, worked examples, exercises)`);
  if (theorems < DEPTH.MIN_THEOREM_BLOCKS)
    err(errors, path, "no theorem/definition block — every lesson must formalize what it teaches");
  if (worked < DEPTH.MIN_WORKED_INSTANCES)
    err(errors, path, `${worked} worked instance(s) (example/code blocks) — needs >=${DEPTH.MIN_WORKED_INSTANCES}`);
  if (!blocks.some((b) => b.type === "exercises"))
    err(errors, path, "no exercises block — a section the reader never works is a summary, not a lesson");
  blocks.forEach((b, bi) => {
    if (b.type === "text" && countWords(b.body) < DEPTH.MIN_TEXT_BLOCK_WORDS)
      err(errors, `${path}.content[${bi}]`, `text block has ${countWords(b.body)} words (<${DEPTH.MIN_TEXT_BLOCK_WORDS}) — merge it into real exposition`);
  });
}

function validateQuestion(q, path, errors) {
  if (!q.id) err(errors, path, "missing id");
  if (!QUESTION_TYPES.includes(q.type)) err(errors, path, `bad type "${q.type}"`);
  if (!q.prompt) err(errors, path, "missing prompt");
  if (q.type === "mcq") {
    if (!Array.isArray(q.options) || q.options.length < 2) err(errors, path, "mcq needs >=2 options");
    if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= (q.options?.length ?? 0))
      err(errors, path, "mcq answer must index into options");
  }
  if (q.type === "multi" && !Array.isArray(q.answer)) err(errors, path, "multi answer must be an array");
  if (q.type === "numeric" && typeof q.answer !== "number") err(errors, path, "numeric answer must be a number");
  if (q.type === "short" && (!Array.isArray(q.accept) || !q.accept.length))
    err(errors, path, "short needs a non-empty accept[]");
  if (q.type === "proof" || q.type === "open") {
    if (!Array.isArray(q.rubric) || !q.rubric.length) err(errors, path, `${q.type} needs a non-empty rubric[]`);
    else if (q.rubric.length < DEPTH.MIN_RUBRIC_CRITERIA)
      err(errors, path, `${q.type} rubric has ${q.rubric.length} criteria — needs >=${DEPTH.MIN_RUBRIC_CRITERIA} independently checkable steps`);
    if (!q.solution) err(errors, path, `${q.type} needs a reference answer for the grader`);
  }
  if (!q.explanation) err(errors, path, "missing explanation — every question teaches after it grades");
}

export function validateCourse(course) {
  const errors = [];
  const warnings = [];
  const ids = new Set();
  const seeId = (id, path) => {
    if (!id) return;
    if (ids.has(id)) err(errors, path, `duplicate id "${id}"`);
    ids.add(id);
  };

  if (!course || typeof course !== "object") return { ok: false, errors: ["course is not an object"], warnings };
  if (!course.id) err(errors, "course", "missing id");
  if (!course.title) err(errors, "course", "missing title");
  if (!Array.isArray(course.units) || !course.units.length) err(errors, "course", "needs at least one unit");
  if (!Array.isArray(course.sources) || !course.sources.length)
    warnings.push("course: no sources[] — no provenance trail for the material");

  (course.units || []).forEach((unit, ui) => {
    const up = `units[${ui}]`;
    seeId(unit.id, up);
    if (!unit.title) err(errors, up, "missing title");
    if (!Array.isArray(unit.lessons) || !unit.lessons.length) err(errors, up, "needs at least one lesson");

    (unit.lessons || []).forEach((lesson, li) => {
      const lp = `${up}.lessons[${li}]`;
      seeId(lesson.id, lp);
      if (!lesson.title) err(errors, lp, "missing title");
      if (!Array.isArray(lesson.content) || !lesson.content.length) err(errors, lp, "empty content");
      (lesson.content || []).forEach((b, bi) => {
        if (!BLOCK_TYPES.includes(b.type)) err(errors, `${lp}.content[${bi}]`, `bad block type "${b.type}"`);
        else if (b.type === "diagram") validateDiagram(b, `${lp}.content[${bi}]`, errors);
        else if (b.type === "theorem") validateTheorem(b, `${lp}.content[${bi}]`, errors);
        else if (b.type === "exercises") validateExercises(b, `${lp}.content[${bi}]`, errors);
      });
      validateLessonDepth(lesson, lp, errors, warnings);
      const cards = lesson.reviewItems || [];
      if (cards.length < DEPTH.MIN_REVIEW_ITEMS)
        err(errors, lp, `${cards.length} review card(s) — spaced repetition needs >=${DEPTH.MIN_REVIEW_ITEMS} atomic cards per lesson`);
      if (cards.length > DEPTH.MAX_REVIEW_ITEMS)
        warnings.push(`${lp}: ${cards.length} review cards — more than ${DEPTH.MAX_REVIEW_ITEMS} per lesson bloats the review queue; keep them atomic but few`);
      cards.forEach((it, ii) => {
        seeId(it.id, `${lp}.reviewItems[${ii}]`);
        if (!it.front || !it.back) err(errors, `${lp}.reviewItems[${ii}]`, "needs front and back");
      });
    });

    if (unit.masteryThreshold != null && unit.masteryThreshold < DEPTH.MIN_MASTERY_THRESHOLD)
      err(errors, up, `masteryThreshold ${unit.masteryThreshold} < ${DEPTH.MIN_MASTERY_THRESHOLD} — that isn't a gate`);

    const check = unit.masteryCheck;
    if (!check || !Array.isArray(check.questions) || !check.questions.length) {
      err(errors, `${up}.masteryCheck`, "a gated unit needs a mastery check with questions");
    } else {
      check.questions.forEach((q, qi) => {
        seeId(q.id, `${up}.masteryCheck.questions[${qi}]`);
        validateQuestion(q, `${up}.masteryCheck.questions[${qi}]`, errors);
      });
      if (check.questions.length < DEPTH.MIN_GATE_QUESTIONS)
        err(errors, `${up}.masteryCheck`, `only ${check.questions.length} questions — a real gate needs >=${DEPTH.MIN_GATE_QUESTIONS}`);
      const mcq = check.questions.filter((q) => q.type === "mcq").length;
      if (mcq / check.questions.length > DEPTH.MAX_MCQ_FRACTION)
        err(errors, `${up}.masteryCheck`, `${mcq}/${check.questions.length} questions are mcq — more than half multiple-choice is guessable; convert some to numeric/short/proof`);
    }

    (unit.prerequisites || []).forEach((p) => {
      if (!course.units.some((u) => u.id === p)) err(errors, up, `prerequisite "${p}" is not a unit id`);
    });
  });

  return { ok: errors.length === 0, errors, warnings };
}
