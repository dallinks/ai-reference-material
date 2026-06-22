// Lightweight SM-2 spaced repetition, day-granularity.
//
// Pure and testable: every function takes `today` as a 'YYYY-MM-DD' string, so
// scheduling never reads the wall clock itself. The React layer passes
// todayStr() in; tests pass fixed dates.
//
// A card's lifecycle: newCard() -> due immediately -> schedule() on each review
// pushes `due` further out the better you grade it (the forgetting curve).

export const GRADES = ["again", "hard", "good", "easy"];
const MIN_EASE = 1.3;

export function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function newCard(today) {
  return { due: today, interval: 0, ease: 2.5, reps: 0, lapses: 0, last: null };
}

export function isDue(card, today) {
  return !card || card.due <= today;
}

// Returns a NEW card; never mutates the input.
export function schedule(card, grade, today) {
  const c = { ...card, last: today };

  if (grade === "again") {
    c.lapses += 1;
    c.reps = 0;
    c.ease = Math.max(MIN_EASE, c.ease - 0.2);
    c.interval = 0;
    c.due = today; // stays in today's queue until you get it right
    return c;
  }

  c.reps += 1;
  if (grade === "hard") c.ease = Math.max(MIN_EASE, c.ease - 0.15);
  if (grade === "easy") c.ease += 0.15;

  let interval;
  if (c.reps === 1) interval = grade === "easy" ? 3 : 1;
  else if (c.reps === 2) interval = grade === "hard" ? 3 : grade === "easy" ? 9 : 6;
  else {
    const mult = grade === "hard" ? 1.2 : c.ease * (grade === "easy" ? 1.3 : 1);
    interval = Math.max(1, Math.round(c.interval * mult));
  }

  c.interval = interval;
  c.due = addDays(today, interval);
  return c;
}
