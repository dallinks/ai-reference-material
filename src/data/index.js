import m1 from "./modules/m1-foundations.js";
import m2 from "./modules/m2-llms.js";
import m3 from "./modules/m3-prompting.js";
import m4 from "./modules/m4-rag.js";
import m5 from "./modules/m5-agents.js";
import m6 from "./modules/m6-enterprise.js";
import m7 from "./modules/m7-production.js";
import m8 from "./modules/m8-multimodal.js";
import m9 from "./modules/m9-strategy.js";

export const COURSE = {
  title: "AI Implementation Reference",
  subtitle: "Build. Deploy. Reference. Repeat.",
  modules: [m1, m2, m3, m4, m5, m6, m7, m8, m9],
};

export const totalLessons = COURSE.modules.reduce(
  (sum, m) => sum + m.lessons.length,
  0
);

export const allTags = [
  ...new Set(COURSE.modules.flatMap((m) => m.lessons.flatMap((l) => l.tags))),
].sort();

export const allLessonsFlat = COURSE.modules.flatMap((m) =>
  m.lessons.map((l) => ({ ...l, mod: m }))
);
