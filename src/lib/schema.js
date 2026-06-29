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
  b.items.forEach((it, i) => {
    if (!it.prompt) err(errors, `${path}.items[${i}]`, "exercise needs a prompt");
    if (!it.solution) err(errors, `${path}.items[${i}]`, "exercise needs a worked solution");
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
    if (!q.solution) err(errors, path, `${q.type} needs a reference answer for the grader`);
  }
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
      if (!Array.isArray(lesson.reviewItems) || !lesson.reviewItems.length)
        warnings.push(`${lp}: no reviewItems — nothing will enter spaced repetition`);
      (lesson.reviewItems || []).forEach((it, ii) => {
        seeId(it.id, `${lp}.reviewItems[${ii}]`);
        if (!it.front || !it.back) err(errors, `${lp}.reviewItems[${ii}]`, "needs front and back");
      });
    });

    const check = unit.masteryCheck;
    if (!check || !Array.isArray(check.questions) || !check.questions.length) {
      err(errors, `${up}.masteryCheck`, "a gated unit needs a mastery check with questions");
    } else {
      check.questions.forEach((q, qi) => {
        seeId(q.id, `${up}.masteryCheck.questions[${qi}]`);
        validateQuestion(q, `${up}.masteryCheck.questions[${qi}]`, errors);
      });
      if (check.questions.length < 3)
        warnings.push(`${up}.masteryCheck: only ${check.questions.length} questions — a weak gate`);
    }

    (unit.prerequisites || []).forEach((p) => {
      if (!course.units.some((u) => u.id === p)) err(errors, up, `prerequisite "${p}" is not a unit id`);
    });
  });

  return { ok: errors.length === 0, errors, warnings };
}
