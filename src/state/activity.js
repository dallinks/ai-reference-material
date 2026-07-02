// The one place study actions become streak fuel. Views never call this —
// the state layer does, at the same moments it persists real progress
// (lesson completed, review graded, gate attempted), so the streak can't be
// farmed by clicking around.

import { loadActivity, saveActivity } from "../lib/store.js";
import { recordActivity } from "../lib/streak.js";
import { todayStr } from "../lib/srs.js";

export function logActivity(kind, today = todayStr()) {
  saveActivity(recordActivity(loadActivity(), kind, today));
}
