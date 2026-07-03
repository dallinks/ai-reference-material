// Technical Interviews — a rigorous, level-agnostic treatment of the technical
// hiring pipeline as an engineering problem. The organizing idea: an interview
// is a NOISY MEASUREMENT CHANNEL — the interviewer estimates your true
// competence from a short, high-variance sample under time and stress; your job
// is to maximize signal-of-competence emitted per minute. That reframing gives
// the course real spines to derive from: signal-detection & decision theory
// (the meta-game), algorithmic invariants & complexity (DS&A), capacity /
// availability math (system design), and expected-value / game theory
// (negotiation & offers).
//
// A capstone: it deliberately reuses and cross-links the platform's other
// courses — complexity/DP from `algorithms`, CAP/quorum/consistent-hashing/
// tail-at-scale from `cloud`, vesting/dilution from `entrepreneurship`.
//
// Rigor is provable where the material admits it (funnel probability, capacity
// estimation, complexity, offer EV, the arousal curve) and rubric-enforced
// where it is judgment (design critique, behavioral, negotiation) via AI-graded
// `open` questions under a demanding hiring-manager persona — not
// fake-mathematized soft skills. Units are inserted one at a time via
// scripts/insert-unit.mjs.

export const technicalInterviews = {
  id: "technical-interviews",
  title: "Technical Interviews",
  subject: "Career Engineering",
  difficulty: "Professional · level-agnostic",
  description:
    "The technical hiring pipeline as an engineering problem: the interview as a noisy measurement channel you learn to optimize. Algorithmic problem-solving, system design, behavioral signal, and the negotiation/offer meta-game — each with a quantitative spine, and gates graded by a demanding hiring-manager rubric rather than multiple choice.",
  sources: [
    "Gayle Laakmann McDowell — Cracking the Coding Interview, 6e (CareerCup, 2015)",
    "Aziz, Lee & Prakash — Elements of Programming Interviews (EPI), 2e",
    "Cormen, Leiserson, Rivest & Stein — Introduction to Algorithms (CLRS), 4e — complexity & algorithm design",
    "Martin Kleppmann — Designing Data-Intensive Applications (O'Reilly) — the system-design spine",
    "Alex Xu — System Design Interview, vols. 1–2 (ByteByteGo)",
    "Fisher, Ury & Patton — Getting to Yes (negotiation); Chris Voss — Never Split the Difference",
    "levels.fyi & Blind — compensation data; standard offer-modeling practice",
    "Green & Swets — Signal Detection Theory and Psychophysics (1966); Yerkes & Dodson (1908) — arousal/performance",
  ],
  grader:
    "You are a senior staff engineer and experienced hiring manager conducting a rigorous technical interview. Grade the candidate's ACTUAL reasoning: reward correct, specific, well-communicated problem-solving; stated and justified trade-offs; complexity or capacity claims that are DERIVED, not asserted; and quantified impact. Penalize hand-waving, buzzword-dropping, unproven complexity, ignoring edge cases / bottlenecks / failure modes, and generic answers that could be pasted into any interview. A confident but vague or unstructured answer earns little credit. Accept any valid approach that differs from the reference answer — grade the substance, not the similarity.",
  units: [
    {
      "id": "u1",
      "title": "Signal, Noise & the Hiring Decision",
      "summary": "The interview as a noisy measurement of true competence — why it is high-variance and asymmetric, and how to reverse-engineer what it scores.",
      "references": [
        "Green & Swets — Signal Detection Theory and Psychophysics (1966) — the hit/miss/false-alarm framing",
        "Classical test theory — reliability = true-score variance / observed-score variance; Spearman–Brown",
        "Laszlo Bock — Work Rules! (2015) — structured interviewing & interviewer variance at scale",
        "McDowell — Cracking the Coding Interview, 6e — 'behind the scenes' & how decisions are made"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u1l1",
          "title": "The Measurement Channel",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "One reframing that organizes everything",
              "body": "Almost everyone treats an interview as a *test they pass or fail*. That framing is both wrong and demoralizing. The accurate model: an interview is a **noisy measurement**. There is some true quantity — call it your competence **θ** for the role — that nobody can observe directly. The interviewer runs a few short probes and reads off a *signal*, then estimates θ from that signal. Every consequence in this course — why strong candidates get rejected, why you apply broadly, why you think aloud, why companies run five rounds — falls out of taking that model seriously."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The interview as an estimator",
              "statement": "Model an interview as producing an observed signal\n\n  S = θ + ε,\n\nwhere **θ** is your true role-competence (fixed for a given moment) and **ε** is *noise* — a zero-mean random error independent of θ, with variance σ²_ε. The interviewer never sees θ; they see S and form an estimate θ̂ = S. The **reliability** of the measurement is the fraction of the observed variance that is real signal:\n\n  r = σ²_θ / (σ²_θ + σ²_ε),   0 ≤ r ≤ 1,\n\nwhere σ²_θ is the spread of true competence across candidates. r = 1 is a perfect measurement; r = 0 is pure noise (a coin flip)."
            },
            {
              "type": "text",
              "heading": "Where the noise comes from",
              "body": "The error ε is not a metaphor; it decomposes into concrete, well-documented sources:\n\n• **Interviewer variance** — different interviewers score the same answer differently (severity, pet topics, mood). This is the largest source in unstructured interviews.\n• **Question variance** — you happen to get a question that lands in your strong area, or your one blind spot.\n• **Day-form** — sleep, stress, whether the earlier round rattled you.\n• **Rapport / halo** — irrelevant first impressions leak into the score.\n\nStructured interviewing (fixed questions, a shared rubric, calibrated interviewers) exists precisely to shrink σ²_ε. You cannot control most of these — but you *can* control the ones that are yours (preparation reduces question variance; managing arousal reduces day-form, Unit 13)."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Independent loops reduce error variance",
              "statement": "If n interviewers each measure S_i = θ + ε_i with independent errors of variance σ²_ε, then the pooled estimate θ̂ = (1/n)·Σ S_i satisfies\n\n  Var(θ̂ − θ) = σ²_ε / n,\n\nso its standard error falls as 1/√n, and the reliability of the pooled score rises to\n\n  r_n = σ²_θ / (σ²_θ + σ²_ε/n) → 1 as n → ∞.",
              "proof": "θ̂ − θ = (1/n)·Σ(S_i − θ) = (1/n)·Σ ε_i. The ε_i are independent with mean 0 and variance σ²_ε, so Var(Σ ε_i) = n·σ²_ε (variances of independent variables add), and Var((1/n)Σε_i) = (1/n²)(n σ²_ε) = σ²_ε/n. Substituting this pooled error variance into the reliability definition gives r_n = σ²_θ/(σ²_θ + σ²_ε/n), which increases monotonically to 1 as n grows. ∎\n\nThis is exactly why a serious onsite is 4–6 independent loops rather than one long conversation: one measurement of a noisy channel is untrustworthy, so they average several. It also tells you the company is trying to *de-noise you* — a single bad interviewer is diluted, not fatal."
            },
            {
              "type": "example",
              "heading": "A single interview can be a coin flip",
              "body": "Suppose true competence and noise are comparable: σ²_θ = 1 and σ²_ε = 1. Then a *single* loop has reliability r = 1/(1+1) = **0.5** — literally half signal, half noise. Run n = 4 independent loops and the pooled reliability is r₄ = 1/(1 + 1/4) = 1/1.25 = **0.8**; at n = 6, r₆ = 1/(1 + 1/6) ≈ **0.86**. The measurement only becomes trustworthy *because* it is repeated. Two lessons for the candidate: (1) don't over-update on one round — the channel is noisy in both directions; (2) consistency across rounds is what actually moves your estimate, so treat every loop as another independent draw you want above the bar."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**A bad round is not destiny, and a good round is not proof.** Because r for a single loop can be near 0.5, one data point is weak evidence about θ. This is liberating (recover from a rough start — the next loop is independent) and sobering (one brilliant answer won't carry a weak overall sample). Your job is to raise the *whole distribution* of your draws, not to bet on one."
            },
            {
              "type": "text",
              "heading": "What the model tells you to optimize",
              "body": "If the interviewer estimates θ̂ = S = θ + ε, you have exactly three levers:\n\n1. **Raise θ** — actually be more competent (the slow, real work: Arcs 1–3).\n2. **Emit more signal** — make your competence *observable* in the short sample. Silent correct work scores like no work; thinking aloud converts θ into S (Unit 7, Unit 11).\n3. **Reduce your own contribution to ε** — preparation, structure, and arousal control so a good θ isn't buried under self-inflicted noise.\n\nMost candidates obsess over lever 1 and neglect 2 and 3 — which is why strong engineers with poor signal-emission underperform their true θ. This course spends as much effort on 2 and 3 as on 1."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A one-loop interview has reliability r = 0.6. Assuming equal, independent error across loops, what pooled reliability do 5 loops achieve?",
                  "solution": "From r = σ²_θ/(σ²_θ+σ²_ε) = 0.6, set σ²_θ = 1; then 1/(1+σ²_ε) = 0.6 ⇒ σ²_ε = 1/0.6 − 1 = 0.667. With n = 5, pooled error is σ²_ε/5 = 0.1333, so r₅ = 1/(1 + 0.1333) = 1/1.1333 ≈ 0.88. Repetition turns a mediocre 0.6 channel into a solid 0.88 one.",
                  "hint": "Back out σ²_ε from r with σ²_θ normalized to 1, then divide the error variance by n and recompute r."
                },
                {
                  "prompt": "Two candidates have the same true θ. One thinks aloud and externalizes reasoning; the other works silently and only states final answers. In the S = θ + ε model, why do their expected scores differ even though θ is equal?",
                  "solution": "Thinking aloud doesn't change θ, but it changes what the interviewer can *measure*. Silent work means much of the correct reasoning is unobserved, so the interviewer must estimate from a sparse, ambiguous signal — effectively a smaller, noisier sample (higher σ²_ε for that candidate, and the interviewer may default to a conservative low estimate on missing evidence). The talker converts more of θ into observed S, lowering the effective error and raising the expected estimate. Signal you don't emit cannot be scored.",
                  "hint": "The interviewer scores S, not θ. What happens to the observable part when reasoning is hidden?"
                },
                {
                  "prompt": "A friend says: 'I bombed one round, so I'm clearly not good enough — I'll stop applying.' Identify the statistical error using this lesson.",
                  "solution": "They are over-updating on a single draw from a channel whose one-loop reliability may be ~0.5. A single low S is weak evidence about θ because ε is large; the rational response is more independent measurements (more loops, more companies), not a large downward revision of θ̂ and withdrawal. This is the individual-level version of why you apply broadly (Unit 2): the estimator only converges with repetition.",
                  "hint": "How much should one observation from an r ≈ 0.5 channel move your estimate of θ?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u1l1-i1",
              "front": "The interview-as-measurement model in one equation?",
              "back": "S = θ + ε: observed signal = true competence + independent zero-mean noise. The interviewer estimates θ from S."
            },
            {
              "id": "u1l1-i2",
              "front": "Definition of measurement reliability r?",
              "back": "r = σ²_θ / (σ²_θ + σ²_ε) — the fraction of observed-score variance that is true signal. 1 = perfect, 0 = coin flip."
            },
            {
              "id": "u1l1-i3",
              "front": "How does averaging n independent loops change error and reliability?",
              "back": "Error variance falls to σ²_ε/n (SE ∝ 1/√n), so pooled reliability r_n = σ²_θ/(σ²_θ+σ²_ε/n) rises toward 1. Why onsites use 4–6 loops."
            },
            {
              "id": "u1l1-i4",
              "front": "The three levers the S = θ + ε model gives a candidate?",
              "back": "Raise θ (be better), emit more signal (make competence observable — think aloud), and reduce your own noise (prep, structure, arousal control)."
            },
            {
              "id": "u1l1-i5",
              "front": "Why is one interview round weak evidence about you?",
              "back": "Single-loop reliability can be ~0.5, so a lone score is half noise; don't over-update in either direction — consistency across independent loops is what counts."
            }
          ]
        },
        {
          "id": "u1l2",
          "title": "The Decision Theory of Hiring",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Two ways to be wrong, and they are not symmetric",
              "body": "The interviewer turns the noisy signal S into a binary decision — pass or reject — by comparing it to a **bar** (threshold). Any such decision has two failure modes, and understanding their asymmetry explains almost all interviewer behavior.\n\n• **False positive (Type I): a bad candidate is passed** → a bad hire.\n• **False negative (Type II): a good candidate is rejected** → a missed hire.\n\nThe company bears the full cost of a false positive — a bad hire is months of salary, damaged projects, management overhead, and an awkward exit. The cost of a false negative is *mostly externalized to you, the candidate*; the company just interviews the next person. Rational cost-minimization by the company therefore sets a **strict bar**, which deliberately trades a high false-negative rate for a low false-positive rate."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The signal-detection quadrants",
              "statement": "Against ground truth (strong / not-strong) and decision (pass / reject), every outcome is one of four:\n\n            pass            reject\n strong    HIT            MISS (false neg)\n not-strong FALSE ALARM    CORRECT REJECT\n\nMoving the bar higher reduces false alarms (fewer bad hires) but increases misses (more good candidates rejected); moving it lower does the reverse. You cannot reduce both at a fixed signal quality — that trade is the ROC curve. The only way to beat the trade is a **more discriminating signal** (better questions, more loops), which is the interviewer's version of raising reliability."
            },
            {
              "type": "text",
              "heading": "Bayes: what a 'pass' actually implies",
              "body": "Let the base rate of strong candidates in the pipeline be **p = P(strong)**. Let the interview's **sensitivity** be a = P(pass | strong) and its **false-positive rate** be b = P(pass | not-strong). A pass is evidence, not proof; its strength is exactly the posterior probability the candidate is strong."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Posterior competence given a pass",
              "statement": "With base rate p, sensitivity a = P(pass|strong), and false-positive rate b = P(pass|¬strong),\n\n  P(strong | pass) = a·p / ( a·p + b·(1 − p) ).\n\nMoreover the probability the process *rejects a strong candidate* is the false-negative rate P(reject | strong) = 1 − a, independent of the base rate.",
              "proof": "By definition of conditional probability, P(strong|pass) = P(pass ∧ strong)/P(pass). The numerator is P(pass|strong)P(strong) = a·p. The denominator, by the law of total probability over {strong, ¬strong}, is P(pass|strong)P(strong) + P(pass|¬strong)P(¬strong) = a·p + b·(1−p). Dividing gives the stated formula. For the false-negative rate, P(reject|strong) = 1 − P(pass|strong) = 1 − a directly. ∎\n\nThe second fact is the important one for candidates: even a good interview (say a = 0.8) rejects 20% of genuinely strong candidates *by design*, and that rate does not depend on how many strong people are in the pool. Rejection is a weak and expected signal about your θ."
            },
            {
              "type": "example",
              "heading": "Running the numbers",
              "body": "Take p = 0.30 (30% of people who reach the onsite are truly above the bar), a = 0.80, b = 0.20.\n\n P(strong | pass) = (0.80·0.30) / (0.80·0.30 + 0.20·0.70) = 0.24 / (0.24 + 0.14) = 0.24/0.38 ≈ **0.63**.\n\nSo a single pass only makes it ~63% likely you were truly above the bar — which is why they run multiple loops and a hiring committee (each independent pass multiplies the evidence upward). Meanwhile the strong-candidate rejection rate is 1 − a = **20%**: one in five strong candidates is turned away at this stage regardless of p. Aggregate that across a 4-round onsite where you must clear several bars, and false negatives become common — not a sign of low θ."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Do not read a rejection as a measurement of your worth.** The process is engineered to reject strong candidates rather than risk a bad hire, so P(reject | strong) is structurally high. The correct inference from one rejection is a small downward nudge on θ̂ plus large residual uncertainty — which prescribes *more independent attempts*, not withdrawal. (The exact 'how many attempts' is Unit 2.)"
            },
            {
              "type": "decision",
              "heading": "What the strict-bar regime rewards",
              "rows": [
                [
                  "A strict bar penalizes ambiguity (silence reads as 'unknown' → reject)",
                  "Emit signal continuously; make correct reasoning observable"
                ],
                [
                  "A strict bar averages several loops",
                  "Optimize for consistency, not one heroic round"
                ],
                [
                  "False positives are the company's nightmare",
                  "Show correctness discipline — test your code, check edge cases, state assumptions"
                ],
                [
                  "Each loop is an independent draw",
                  "Reset after a bad round; the next interviewer starts fresh"
                ],
                [
                  "The signal must be discriminating to move the bar",
                  "Give unmistakable positive evidence, not merely 'no red flags'"
                ]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A phone screen has p = 0.5, sensitivity a = 0.9, false-positive rate b = 0.4. Compute P(strong | pass), and interpret why it is not higher.",
                  "solution": "P(strong|pass) = (0.9·0.5)/(0.9·0.5 + 0.4·0.5) = 0.45/(0.45+0.20) = 0.45/0.65 ≈ 0.69. Despite high sensitivity, the *high false-positive rate* (b = 0.4 — the screen passes 40% of weak candidates) dilutes the evidence a pass provides. A pass on a lax screen is weak evidence; discriminability (low b), not just sensitivity, is what makes a pass meaningful — the same reason a later, harder round carries more weight.",
                  "hint": "Plug into the posterior formula; then look at how b affects the denominator."
                },
                {
                  "prompt": "An onsite requires clearing 4 independent loops, each with P(pass | strong) = 0.85. What fraction of genuinely strong candidates clear all four, and what does that imply about false negatives?",
                  "solution": "Assuming independence, P(all 4 pass | strong) = 0.85⁴ ≈ 0.522. So even a truly strong candidate clears a 4-loop gauntlet only ~52% of the time; the aggregate false-negative rate for strong candidates is ~48%. Requiring unanimity across noisy loops makes rejecting strong candidates the *common* case — direct justification for applying to many companies rather than staking everything on one.",
                  "hint": "Independent loops multiply; compute 0.85⁴ and subtract from 1."
                },
                {
                  "prompt": "Explain, in decision-theoretic terms, why 'no red flags' is often not enough to get an offer.",
                  "solution": "A strict bar minimizes false positives, so the default action on insufficient positive evidence is *reject*. 'No red flags' means the interviewer lacks negative evidence but also lacks strong positive signal — an ambiguous S near the bar. Under an asymmetric loss that punishes bad hires, ambiguity resolves to reject. You must supply discriminating positive signal (clear correct reasoning, tested code, insightful trade-offs), not merely avoid mistakes.",
                  "hint": "Under asymmetric costs, which way does the decision fall when the signal is ambiguous?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u1l2-i1",
              "front": "False positive vs false negative in hiring, and who bears each cost?",
              "back": "FP = bad hire (company bears a large cost); FN = strong candidate rejected (cost externalized to the candidate). The asymmetry pushes interviewers to a strict bar."
            },
            {
              "id": "u1l2-i2",
              "front": "Posterior P(strong | pass)?",
              "back": "a·p / (a·p + b·(1−p)), with base rate p, sensitivity a = P(pass|strong), false-positive rate b = P(pass|¬strong)."
            },
            {
              "id": "u1l2-i3",
              "front": "False-negative rate for a strong candidate on one loop?",
              "back": "P(reject | strong) = 1 − a, independent of the base rate. Even a = 0.8 rejects 20% of strong candidates by design."
            },
            {
              "id": "u1l2-i4",
              "front": "Why does a strict bar reject strong candidates?",
              "back": "Minimizing costly false positives (bad hires) trades along the ROC toward more false negatives; ambiguous signal near the bar resolves to 'reject'."
            },
            {
              "id": "u1l2-i5",
              "front": "Why isn't 'no red flags' enough for an offer?",
              "back": "A strict bar defaults to reject on weak positive evidence; you must emit discriminating positive signal, not merely avoid mistakes."
            }
          ]
        },
        {
          "id": "u1l3",
          "title": "Reverse-Engineering the Rubric",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "Interviews are scored on a scorecard, not a feeling",
              "body": "At any company with a functioning process, the interviewer isn't holding a global 'did I like them' verdict — they fill a **scorecard**: a small set of named competencies, each rated, each with written justification, feeding a hire/no-hire recommendation and often a committee. Your first strategic move is to know what those competencies are, because *an unobserved competency scores as a gap*. You are not trying to be impressive in general; you are trying to leave clear positive evidence in each box the interviewer must fill."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The competency rubric",
              "statement": "A technical interview typically scores four-to-five roughly orthogonal dimensions:\n\n1. **Problem-solving** — clarifying, decomposing, choosing an approach, handling hints.\n2. **Coding & correctness** — translating an idea into clean, working, tested code (or, in design, into a sound architecture).\n3. **CS / domain fundamentals** — complexity, data structures, systems, the base knowledge the role assumes.\n4. **Communication** — thinking aloud, structure, responsiveness, collaboration.\n5. **Role / values fit** — behavioral signal on how you work with others (Unit 11).\n\nThe overall recommendation is a (roughly weighted) function of these, and a single dimension left blank or weak can sink an otherwise strong loop."
            },
            {
              "type": "text",
              "heading": "Signal density: evidence per minute",
              "body": "You have ~35 working minutes per round and five boxes to fill. Define **signal density** as competence-evidence emitted per minute. The failure mode of strong engineers is low density: long silent stretches (no communication signal), jumping to code without clarifying (no problem-solving signal), or solving without stating complexity (no fundamentals signal). High density means every phase of the round deposits evidence in a *different* box: clarifying → problem-solving; narrating trade-offs → communication + fundamentals; testing your code → correctness. Cover the rubric deliberately; don't spend all your signal in one box."
            },
            {
              "type": "example",
              "heading": "A coding round, mapped to the scorecard",
              "body": "Watch where the evidence lands:\n\n• *'Can inputs be negative? Is the array sorted? How large is n?'* → **problem-solving** (clarification) + **communication**.\n• *'Brute force is O(n²); the repeated work is the inner scan, which a hash map removes.'* → **problem-solving** (spotting the bottleneck) + **fundamentals** (complexity).\n• Clean, named variables, invariants as comments → **coding & correctness**.\n• *'Let me dry-run [2,7,11] and the empty case.'* → **correctness** (testing) + **communication**.\n• *'This is O(n) time, O(n) space; we could trade back to O(1) space if the input were sorted.'* → **fundamentals** + **problem-solving** (trade-off).\n\nSame problem, but a candidate who narrates like this fills all four technical boxes; a silent solver fills one or two and is scored 'unknown' on the rest."
            },
            {
              "type": "decision",
              "heading": "Behavior → rubric dimension it signals",
              "rows": [
                [
                  "Restating the problem and asking about constraints",
                  "Problem-solving + communication"
                ],
                [
                  "Stating and justifying time/space complexity",
                  "CS fundamentals"
                ],
                [
                  "Writing a brute force first, then optimizing the bottleneck",
                  "Problem-solving (structured approach)"
                ],
                [
                  "Dry-running code on an edge case unprompted",
                  "Coding & correctness"
                ],
                [
                  "Naming a trade-off and choosing with a reason",
                  "Fundamentals + communication"
                ],
                [
                  "Taking a hint gracefully and updating",
                  "Problem-solving + values (coachability)"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "The bar and calibration",
              "body": "Interviewers are calibrated to a consistent **bar** — 'would I want this person doing this job?' — and asked for a discrete lean (strong hire / hire / no hire / strong no hire) plus written evidence, not a fuzzy score. A hiring committee or bar-raiser then cross-checks calibration across interviewers to remove σ²_ε (Lesson 1). Consequence: your interviewer is writing down *specific evidence* to defend a lean. Hand them the evidence. Vague good vibes don't survive a committee; 'candidate derived the O(n) approach unprompted, tested two edge cases, and reasoned about the space trade-off' does."
            },
            {
              "type": "checklist",
              "heading": "Surfacing signal on every dimension",
              "items": [
                "Problem-solving: clarify constraints, state your approach before coding, and explain *why* this approach.",
                "Fundamentals: state complexity out loud, and name the data structure and why it fits.",
                "Correctness: write a brute force if stuck, keep invariants explicit, and test on edge cases unprompted.",
                "Communication: narrate continuously; when you go quiet to think, say 'give me a moment to think about X.'",
                "Coachability: treat a hint as evidence to update on, not a failure — say what it changes.",
                "Leave no box empty: near the end, volunteer the trade-off or the complexity if you haven't yet."
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A candidate solves the problem correctly and silently in 15 minutes, then waits. They receive a 'no hire.' Using the rubric and signal-density ideas, give the most likely reason.",
                  "solution": "Correctness was demonstrated, but the other boxes — communication (they were silent), problem-solving process (no visible clarification or approach reasoning), and fundamentals (no stated complexity or trade-off) — were left as gaps. The overall recommendation is a function of all dimensions; three weak/unknown boxes outweigh one strong one, and silence under a strict bar reads as 'unknown → reject.' High correctness, low signal density across the rest of the rubric.",
                  "hint": "Which scorecard boxes got evidence, and which were left blank?"
                },
                {
                  "prompt": "You realize with 5 minutes left that you never stated your solution's complexity or any trade-off. What should you do, and which dimensions does it serve?",
                  "solution": "Proactively close the gap: 'To summarize — this is O(n log n) time from the sort, O(1) extra space; if the input were already sorted we'd drop to O(n), and if memory were tight I'd prefer this over the hash-map version.' This deposits late evidence in **CS fundamentals** (complexity) and **problem-solving/communication** (trade-off reasoning), filling boxes that were otherwise empty. Leaving a dimension unobserved is a self-inflicted gap; volunteering the evidence is free signal.",
                  "hint": "An unobserved competency scores as a gap — can you still fill the box before time runs out?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u1l3-i1",
              "front": "The ~4–5 competencies a technical interview scores?",
              "back": "Problem-solving, coding & correctness, CS/domain fundamentals, communication, and role/values fit. The recommendation is a weighted function of all of them."
            },
            {
              "id": "u1l3-i2",
              "front": "What is 'signal density'?",
              "back": "Competence-evidence emitted per minute. Low density (silence, no stated complexity) leaves rubric boxes empty; high density deposits evidence in a different box at each phase."
            },
            {
              "id": "u1l3-i3",
              "front": "Why does an unobserved competency hurt you?",
              "back": "The scorecard has a box per dimension; a box with no positive evidence scores as a gap, and under a strict bar 'unknown' resolves toward 'no hire.'"
            },
            {
              "id": "u1l3-i4",
              "front": "What does an interviewer actually submit?",
              "back": "A discrete lean (strong hire → strong no-hire) plus written, specific evidence to defend it — cross-checked by a committee/bar-raiser to remove interviewer variance."
            },
            {
              "id": "u1l3-i5",
              "front": "One-line fix if you never stated complexity/trade-offs?",
              "back": "Volunteer them before time runs out — it deposits late evidence in the fundamentals and problem-solving boxes that were otherwise blank."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u1-check",
        "questions": [
          {
            "id": "u1q1",
            "type": "numeric",
            "prompt": "An onsite loop passes 80% of strong candidates and 25% of non-strong candidates. Among candidates reaching the loop, 40% are strong. Compute P(strong | pass) to two decimals.",
            "answer": 0.68,
            "tolerance": 0.02,
            "explanation": "P(strong|pass) = (0.80·0.40)/(0.80·0.40 + 0.25·0.60) = 0.32/(0.32+0.15) = 0.32/0.47 ≈ 0.68. A single pass is meaningful but far from certain — hence multiple loops."
          },
          {
            "id": "u1q2",
            "type": "numeric",
            "prompt": "An onsite requires passing 5 independent loops, each of which passes a genuinely strong candidate with probability 0.85. What fraction of strong candidates clear all five? (two decimals)",
            "answer": 0.44,
            "tolerance": 0.02,
            "explanation": "0.85⁵ ≈ 0.4437. About 56% of truly strong candidates are rejected by a unanimous 5-loop gauntlet — a quantitative reason false negatives are common and you should apply broadly."
          },
          {
            "id": "u1q3",
            "type": "numeric",
            "prompt": "A single interview loop has reliability r = 0.5 (equal signal and noise variance). Using independent loops, what pooled reliability do 4 loops give? (two decimals)",
            "answer": 0.8,
            "tolerance": 0.02,
            "explanation": "r = 0.5 with σ²_θ = 1 gives σ²_ε = 1. Four loops: pooled error 1/4, so r₄ = 1/(1+0.25) = 0.8. Repetition is what makes a noisy channel trustworthy."
          },
          {
            "id": "u1q4",
            "type": "short",
            "prompt": "Name the interview error type whose cost is mostly borne by the candidate rather than the company (two words).",
            "accept": [
              "false negative",
              "type ii",
              "type 2",
              "miss",
              "false negatives"
            ],
            "explanation": "The false negative (Type II) — a strong candidate rejected. Its cost is externalized to the candidate, which is why companies rationally tolerate a high false-negative rate to avoid costly false positives."
          },
          {
            "id": "u1q5",
            "type": "mcq",
            "prompt": "A candidate solves a problem correctly but works almost silently. Under the measurement-and-rubric model, the single best explanation for a resulting low score is:",
            "options": [
              "The interviewer was biased against quiet people",
              "Correct work that isn't externalized leaves most rubric dimensions unobserved, and a strict bar scores 'unknown' as a gap",
              "The problem was too easy to demonstrate skill",
              "Silent solving proves the answer was memorized"
            ],
            "answer": 1,
            "explanation": "The interviewer scores S (observed signal), not θ. Silence emits little signal on communication, problem-solving process, and fundamentals, leaving those boxes empty; a strict bar resolves the resulting ambiguity toward 'no hire.'"
          },
          {
            "id": "u1q6",
            "type": "open",
            "points": 3,
            "prompt": "You reached a 4-round onsite, felt you did well on 3 rounds and shakily on 1, and were rejected. Using the measurement-channel and decision-theory framing from this unit, explain precisely what you can and cannot infer about your true competence θ, and what the rational next action is. Be quantitative where you can.",
            "rubric": [
              "Frames the outcome as a noisy, thresholded measurement (S = θ + ε with a strict bar), not a definitive verdict on θ.",
              "Notes that unanimity across noisy loops makes rejecting strong candidates common (e.g., cites a false-negative computation like 1−a per loop or a^k across k loops), so a rejection is weak evidence of low θ.",
              "Distinguishes what IS informative (a consistent weak signal, e.g. the shaky round or a recurring gap) from what is noise (one bad draw), i.e. updates θ̂ only slightly with large residual uncertainty.",
              "Prescribes the rational action: more independent attempts (more loops/companies) plus targeted improvement on any recurring weakness — rather than withdrawing or over-updating.",
              "Reasoning is specific and uses the unit's concepts correctly, not generic encouragement."
            ],
            "solution": "The onsite is a strict-bar decision over a small number of noisy loops. A rejection is consistent with a genuinely strong θ: if each loop passes a strong candidate with probability a, unanimity requires a^k (e.g. 0.85⁴ ≈ 0.52), so ~half of strong candidates are rejected by design — the outcome is only weak evidence that θ is below the bar. What you can infer: a small downward nudge on θ̂ with large residual uncertainty. What you cannot infer: that you are 'not good enough' — one thresholded sample from an r≈0.5–0.8 channel does not support a large revision. The one round that felt shaky is worth attention only if it reflects a *recurring* gap (a consistent low draw across attempts is signal; a single low draw is noise). Rational action: treat each company as another independent measurement, apply broadly to accumulate draws (Unit 2 quantifies how many), and target improvement at any weakness that repeats — not withdrawal, and not a wholesale downgrade of θ̂.",
            "explanation": "The unit's whole point: a rejection is a noisy, asymmetric measurement, so the correct update is small and the correct action is more independent attempts plus targeted fixes — the exact opposite of the common 'I'm not good enough, I'll stop' overreaction."
          }
        ]
      }
    },
    {
      "id": "u2",
      "title": "The Funnel & the Numbers",
      "summary": "The job search as a pipeline of conditional probabilities: expected offers, how many applications a target requires, and why correlated failures change the math.",
      "references": [
        "Standard hiring-funnel analytics — stage conversion rates (apply → screen → onsite → offer)",
        "Geometric & binomial distributions — expected trials to first success, sum over n independent trials",
        "Rachel Thomas / careers literature — 'apply broadly' as variance management"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u2l1",
          "title": "The Pipeline as a Product of Probabilities",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "A funnel, stage by stage",
              "body": "A job search is a pipeline. A candidate enters at the top and must survive a sequence of stages to reach an offer: **application → recruiter screen → technical phone screen → onsite (several loops) → hiring committee → offer**. Each stage passes only a fraction of those who enter it. Unit 1 explained *why* each stage rejects strong candidates; this lesson does the bookkeeping of what that means in aggregate, because the aggregate is what determines whether your search succeeds — and where to spend effort."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Funnel conversion",
              "statement": "Let stage i pass a fraction pᵢ = P(reach stage i+1 | reached stage i) of those who enter it. For a single application, the probability of reaching an offer is the product\n\n  q = ∏ᵢ pᵢ = p₁·p₂·⋯·p_k.\n\nFrom N applications (treated as independent draws), the expected number of offers is\n\n  E[offers] = N·q.\n\nBecause q is a product of fractions, it is small and dominated by the *smallest* stage — the binding constraint of the funnel."
            },
            {
              "type": "example",
              "heading": "A concrete funnel",
              "body": "Say per application: recruiter screen passes 40% (p₁ = 0.40), phone screen 50% (p₂ = 0.50), onsite 30% (p₃ = 0.30). Then\n\n q = 0.40 × 0.50 × 0.30 = **0.06** — a 6% chance an application becomes an offer.\n\nFrom N = 20 applications, E[offers] = 20 × 0.06 = **1.2**. That is why 'I applied to 20 places' can still yield zero: an expectation of 1.2 with real variance (next lesson) frequently lands on 0. The number is small not because you are weak but because a product of survival probabilities is small."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 190,
              "caption": "The hiring funnel. Each edge passes a fraction of those who enter it, so the offer probability q = 0.40·0.50·0.30 = 0.06 is the PRODUCT of the stage rates — small, and dominated by the smallest (onsite) factor.",
              "nodes": [
                {
                  "id": "apply",
                  "label": "Apply",
                  "x": 5,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "screen",
                  "label": "Screen",
                  "x": 27,
                  "y": 50
                },
                {
                  "id": "phone",
                  "label": "Phone",
                  "x": 49,
                  "y": 50
                },
                {
                  "id": "onsite",
                  "label": "Onsite",
                  "x": 71,
                  "y": 50
                },
                {
                  "id": "offer",
                  "label": "Offer",
                  "x": 93,
                  "y": 50,
                  "tone": "gold"
                }
              ],
              "edges": [
                {
                  "from": "apply",
                  "to": "screen",
                  "directed": true
                },
                {
                  "from": "screen",
                  "to": "phone",
                  "label": "0.40",
                  "directed": true
                },
                {
                  "from": "phone",
                  "to": "onsite",
                  "label": "0.50",
                  "directed": true
                },
                {
                  "from": "onsite",
                  "to": "offer",
                  "label": "0.30",
                  "directed": true
                }
              ]
            },
            {
              "type": "text",
              "heading": "The binding stage dominates",
              "body": "Because q is multiplicative, its sensitivity to each stage is uneven. If p₃ (onsite) is your weakest at 0.30, raising it to 0.45 multiplies q by 1.5 (0.06 → 0.09) — a 50% increase in offers per application. Raising an already-strong stage barely moves the product. This is the funnel version of Amdahl's Law (cross-link the cloud course): attack the smallest factor, not a factor that is already near 1. Diagnose *which* stage leaks most (do you rarely get onsites, or get them and not convert?) before optimizing — the fix for 'few onsites' (resume, referrals, screen prep) is different from the fix for 'onsites don't convert' (Arcs 1–3)."
            },
            {
              "type": "decision",
              "heading": "Diagnose the leak before you optimize",
              "rows": [
                [
                  "Applications rarely become screens",
                  "Resume/keywords, referrals, and target-company fit — a top-of-funnel problem"
                ],
                [
                  "Screens rarely become onsites",
                  "Phone-screen technique and fundamentals under time pressure"
                ],
                [
                  "Onsites rarely become offers",
                  "The core technical/behavioral skill — Arcs 1–3 of this course"
                ],
                [
                  "Offers arrive but are weak/mistimed",
                  "Batching and negotiation — Unit 12"
                ],
                [
                  "Every rejection has the same cause",
                  "A systematic gap; fixing it lifts every stage (Lesson 3)"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Referrals act on the product multiplicatively.** A referral typically raises p₁ (and sometimes p₂) several-fold — often the cheapest large win, because it lifts a factor that for cold applicants is small. One warm referral can be worth more than ten extra cold applications."
            },
            {
              "type": "example",
              "heading": "The referral multiplier, quantified",
              "body": "Cold, suppose your apply→screen factor is p₁ = 0.15, and the remaining stages multiply to 0.40, so q = 0.15 × 0.40 = **0.06**. A referral raises that first factor to 0.50: q = 0.50 × 0.40 = **0.20**, a jump by the ratio 0.50/0.15 ≈ **3.3×**. Since E[offers] = N·q is linear in q, one *referred* application is worth ~3.3 cold ones — and it lifts a factor that was small, exactly where the product has the most slack. This is why 'spend an hour getting one referral' routinely beats 'send ten more cold applications.'"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A funnel has stage pass rates 0.5, 0.6, 0.4, 0.7. Compute q and the expected offers from 15 applications.",
                  "solution": "q = 0.5·0.6·0.4·0.7 = 0.084. E[offers] = 15 · 0.084 = 1.26. Again an expectation near 1 from a 'lot' of applications — the product of survival rates is inherently small.",
                  "hint": "Multiply the stage rates for q, then multiply by N."
                },
                {
                  "prompt": "In the funnel above (q = 0.084), you can either raise the 0.4 stage to 0.6 or the 0.7 stage to 0.9. Which raises q more, and state the principle.",
                  "solution": "Raising 0.4→0.6 multiplies q by 0.6/0.4 = 1.5 (q → 0.126). Raising 0.7→0.9 multiplies q by 0.9/0.7 ≈ 1.29 (q → 0.108). The weaker (smaller) stage gives more, and by a larger *relative* factor — attack the smallest factor in the product, the funnel's Amdahl bottleneck.",
                  "hint": "A multiplicative change to a factor scales the product by the ratio new/old."
                },
                {
                  "prompt": "Your funnel is p = [0.15, 0.60, 0.40] (q = 0.036). A referral would raise the first stage to 0.50. Compute the new q and how many cold applications one referral is worth (in E[offers] terms).",
                  "solution": "New q = 0.50 × 0.60 × 0.40 = 0.12. The ratio is 0.12/0.036 = 3.33, so — since E[offers] = N·q is linear in q — one referred application contributes as much expected offer as ~3.3 cold applications. The gain comes from multiplying the *smallest* factor (0.15→0.50), where the product had the most room.",
                  "hint": "Recompute the product with the raised factor; the worth is the ratio of the new to old q."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u2l1-i1",
              "front": "Single-application offer probability in terms of stage rates?",
              "back": "q = ∏ pᵢ — the product of per-stage pass probabilities. Small because it's a product of fractions."
            },
            {
              "id": "u2l1-i2",
              "front": "Expected offers from N applications?",
              "back": "E[offers] = N·q. E.g. N=20, q=0.06 → 1.2 expected offers — so zero is a common outcome."
            },
            {
              "id": "u2l1-i3",
              "front": "Which funnel stage should you optimize first?",
              "back": "The smallest factor (the binding stage) — a multiplicative change there scales q the most. The funnel's Amdahl bottleneck."
            },
            {
              "id": "u2l1-i4",
              "front": "Why are referrals disproportionately valuable?",
              "back": "They multiply the top-of-funnel factor p₁ (small for cold applicants) several-fold, so they lift the whole product cheaply."
            },
            {
              "id": "u2l1-i5",
              "front": "How much is a referral worth, quantitatively?",
              "back": "It multiplies q by (referred p₁)/(cold p₁); e.g. 0.50/0.15 ≈ 3.3×. Since E[offers]=N·q is linear in q, one referred application ≈ 3.3 cold ones."
            }
          ]
        },
        {
          "id": "u2l2",
          "title": "How Many Applications?",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "From expectation to a real target",
              "body": "E[offers] = N·q tells you the average, but you don't want an average — you want *at least one* offer with high confidence. That is a different question with a clean answer, and it converts 'apply broadly' from folklore into a number."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Applications for a target confidence",
              "statement": "If each of n applications independently yields an offer with probability q, then\n\n  P(at least one offer) = 1 − (1 − q)ⁿ.\n\nTo achieve confidence C (e.g. 0.90) of at least one offer,\n\n  n ≥ ln(1 − C) / ln(1 − q).",
              "proof": "The n applications are independent, each failing to produce an offer with probability (1 − q). The probability *all* fail is (1 − q)ⁿ, so the probability at least one succeeds is the complement 1 − (1 − q)ⁿ. Require 1 − (1 − q)ⁿ ≥ C ⇔ (1 − q)ⁿ ≤ 1 − C. Take natural logs; since ln(1 − q) < 0, dividing flips the inequality: n ≥ ln(1 − C)/ln(1 − q). ∎\n\nBoth logs are negative, so the ratio is positive. The formula is the honest replacement for 'just apply to a lot of places.'"
            },
            {
              "type": "example",
              "heading": "The number of applications, computed",
              "body": "With per-application offer probability q = 0.06 and target confidence C = 0.90:\n\n n ≥ ln(0.10)/ln(0.94) = (−2.3026)/(−0.0619) ≈ 37.2 → **38 applications**.\n\nFor 95% confidence: n ≥ ln(0.05)/ln(0.94) ≈ 48.4 → **49**. If you improve your onsite conversion so q rises to 0.10, the 90% target drops to n ≥ ln(0.10)/ln(0.90) ≈ 21.8 → **22**. Raising q both increases expected offers *and* slashes how many applications a given confidence needs — a recurring reason to invest in skill (raising q) over volume (raising n)."
            },
            {
              "type": "example",
              "heading": "How q collapses the applications you need",
              "body": "Fix the 90%-confidence target and vary q:\n\n  q = 0.03  →  n ≥ ln(0.10)/ln(0.97) ≈ 76\n  q = 0.06  →  n ≈ 38\n  q = 0.10  →  n ≈ 22\n  q = 0.15  →  n ≈ 15\n\nDoubling q from 0.03 to 0.06 halves the applications; reaching 0.15 cuts them ~5×. Because ln(1−q) ≈ −q for small q, n scales like 1/q — so every point of q you earn through skill removes a roughly proportional chunk of the grind. This is the quantitative case for prep over spray-and-pray."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Expected applications to the first offer",
              "statement": "If each application independently yields an offer with probability q, the number of applications K until (and including) the first offer is geometric, with\n\n  P(K = k) = (1 − q)^{k−1}·q,  and  E[K] = 1/q.",
              "proof": "The first offer occurs on application k exactly when the first k−1 fail (probability (1−q)^{k−1}) and the k-th succeeds (probability q); multiply by independence. For the mean, E[K] = Σ_{k≥1} k(1−q)^{k−1}q. Using Σ_{k≥1} k x^{k−1} = 1/(1−x)² for |x|<1 with x = 1−q gives E[K] = q · 1/(1−(1−q))² = q/q² = 1/q. ∎\n\nSo at q = 0.06 you expect 1/0.06 ≈ 17 applications per offer — but 'expected' hides heavy variance (Lesson 3), which is why you plan to a confidence target, not the mean."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The mean is not the plan.** E[K] = 1/q ≈ 17 applications per offer sounds comfortable, but the geometric distribution has a long tail — a substantial chance of needing far more. Plan to the confidence formula n ≥ ln(1−C)/ln(1−q) (≈ 38 for 90%), not to the average, or you will run out of applications at exactly the wrong time."
            },
            {
              "type": "text",
              "heading": "Why this vindicates applying broadly",
              "body": "Unit 1 showed the process rejects strong candidates at a high rate by design (large false-negative rate). This lesson is the strategic response: since each application is a noisy, independent draw with modest q, you accumulate draws until the probability of *zero* successes is small. Applying broadly is not desperation; it is variance management — the only way to convert a high-false-negative channel into a high-confidence outcome. The alternative (few applications, high stakes each) maximizes the chance the design's built-in false negatives sink your whole search."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Per-application offer probability is q = 0.08. How many applications give a 90% chance of at least one offer? How many for 99%?",
                  "solution": "n ≥ ln(1−C)/ln(1−q) with ln(0.92) = −0.0834. For C=0.90: ln(0.10)/−0.0834 = −2.3026/−0.0834 ≈ 27.6 → 28. For C=0.99: ln(0.01)/−0.0834 = −4.6052/−0.0834 ≈ 55.2 → 56. Doubling from 90%→99% confidence roughly doubles the applications, because you're chasing an exponentially shrinking failure probability.",
                  "hint": "Use n ≥ ln(1−C)/ln(1−q) with the two confidence levels."
                },
                {
                  "prompt": "Candidate A has q = 0.05; candidate B has q = 0.10. Compare expected applications to first offer, and the applications each needs for 90% confidence.",
                  "solution": "E[K] = 1/q: A needs ~20, B needs ~10 on average. For 90%: A: ln(0.10)/ln(0.95) ≈ 44.9 → 45; B: ln(0.10)/ln(0.90) ≈ 21.8 → 22. Doubling q roughly halves both the mean and the applications-to-confidence — skill improvements pay off super-linearly in effort saved.",
                  "hint": "1/q for the mean; the confidence formula for the targets."
                },
                {
                  "prompt": "You can realistically run at most 30 processes. What per-application offer probability q do you need for a 90% chance of at least one offer? Solve for q.",
                  "solution": "Require 1 − (1−q)³⁰ ≥ 0.90 ⇔ (1−q)³⁰ ≤ 0.10 ⇔ 1−q ≤ 0.10^(1/30) = e^(ln 0.10 / 30) = e^(−0.0768) ≈ 0.9261 ⇔ q ≥ 0.074. So you need q ≈ 7.4%. If your q is below that, 30 processes will not reach 90% confidence — either raise q (skill) or accept a lower confidence; 30 low-q applications is not a plan.",
                  "hint": "Set 1−(1−q)^30 = 0.90 and solve for q via the 30th root of 0.10."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u2l2-i1",
              "front": "P(at least one offer) from n independent applications?",
              "back": "1 − (1 − q)ⁿ, where q is the per-application offer probability."
            },
            {
              "id": "u2l2-i2",
              "front": "Applications needed for confidence C of ≥1 offer?",
              "back": "n ≥ ln(1 − C) / ln(1 − q). E.g. q=0.06, C=0.90 → ~38."
            },
            {
              "id": "u2l2-i3",
              "front": "Expected applications until the first offer?",
              "back": "E[K] = 1/q (geometric distribution). q=0.06 → ~17 — but the tail is long, so plan to a confidence target, not the mean."
            },
            {
              "id": "u2l2-i4",
              "front": "Why does applying broadly beat a few high-stakes applications?",
              "back": "Each app is a noisy independent draw with modest q; accumulating draws shrinks P(zero offers) = (1−q)ⁿ. It's variance management against a high-false-negative channel."
            },
            {
              "id": "u2l2-i5",
              "front": "How steeply does raising q reduce the applications needed?",
              "back": "n ≈ 1/q for small q (ln(1−q)≈−q), so n scales like 1/q: q 0.03→0.10 drops the 90%-confidence n from ~76 to ~22. Skill saves volume near-proportionally."
            }
          ]
        },
        {
          "id": "u2l3",
          "title": "Variance, Batching & Correlated Failure",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "The independence assumption is where people get hurt",
              "body": "The formulas 1 − (1 − q)ⁿ and E[K] = 1/q assume applications are *independent* draws with a *fixed* q. Two real-world violations of that assumption dominate the endgame of a search: outcomes cluster in time (which you can exploit), and failures share causes (which quietly breaks the math). Handling both is what separates a calm search from a frantic one."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Offer count is binomial",
              "statement": "The number of offers X from n independent applications with success probability q is Binomial(n, q): E[X] = nq and Var(X) = nq(1 − q). The standard deviation √(nq(1−q)) is large relative to the mean when nq is small — so a search with E[X] near 1 has high relative variance, and outcomes of 0 or 3 are both common."
            },
            {
              "type": "text",
              "heading": "Batching: make offers arrive together",
              "body": "Independent offers that arrive weeks apart are nearly worthless as leverage; two offers *live at the same time* are enormous leverage (Unit 12: competing offers create a bidding dynamic and a real BATNA). So you deliberately **batch**: start many processes in the same window so their onsites and offers cluster. Batching doesn't change q or E[X], but it changes the *joint timing* of the outcomes — turning the same number of offers into negotiating power and avoiding the trap of accepting an early exploding offer before others land. Timing is a decision variable even when probability isn't."
            },
            {
              "type": "example",
              "heading": "Same offers, different timing",
              "body": "You run 12 processes at q = 0.12, so E[X] ≈ 1.4 offers. **Sequential** (apply, wait, apply): the offers that land trickle in over three months, each expiring before the next arrives — you never hold two at once, so you have *zero* competing-offer leverage. **Batched** (all 12 launched in a 2–3 week window): the onsites and offers cluster, so 2–3 offers can be live simultaneously — each is now the other's BATNA (Unit 12), turning the same 1.4 expected offers into real negotiating power. Batching changed nothing about q or E[X]; it changed the *joint timing*, which is what creates leverage."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Correlated failure defeats brute-force volume",
              "statement": "If every application shares a common failure cause C (e.g., you reliably fail system-design rounds), then conditional on that weakness the per-application success events are positively correlated, and P(zero offers) > (1 − q)ⁿ. Increasing n cannot drive the failure probability to 0; only removing C (raising the underlying q) can.",
              "proof": "Suppose success on application i requires clearing the shared stage governed by C. In the extreme where C fully determines that stage, all applications fail together with some probability p_C > 0 regardless of n, so P(zero offers) ≥ p_C, a floor independent of n. More generally, positive correlation means the joint failure probability exceeds the independent product: P(all fail) = E[∏(1−qᵢ)] ≥ ∏E[1−qᵢ] is *not* what independence gives; with a common factor the failures co-occur, so P(all fail) > (1−q)ⁿ. Hence lim_{n→∞} P(zero offers) ≥ p_C > 0: applying more re-draws the *same* weakness rather than an independent one, and the 1−(1−q)ⁿ → 1 guarantee is lost. ∎\n\nThe practical form: if your rejections share a root cause, more applications is the wrong lever — you are buying more tickets to the same failure. Diagnose the recurring gap and fix it (which raises q for every future application at once)."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Same weakness, everywhere → fix the weakness, don't apply harder.** Correlated failure is the most common way a high-volume search stalls. If four rejections all died at system design, application #40 dies there too. The rational move is to leave the funnel, close the gap (Arc 2 here), and re-enter with a higher q — not to keep drawing the same losing ticket."
            },
            {
              "type": "text",
              "heading": "Marginal effort: raise q or raise n?",
              "body": "You have finite effort. Expected offers nq is symmetric in n and q — doubling either doubles it — but they are not equivalent. Raising **n** (more applications) is linear, exhausting, and does nothing about correlated failure. Raising **q** (skill: Arcs 1–3) is super-linear in payoff — it increases expected offers, *shrinks* the applications a confidence target needs (Lesson 2), converts correlated failures into successes, and compounds across every future search and the negotiation that follows (a stronger candidate gets stronger offers). When failures are correlated or q is low, invest in q; use n to manage the residual variance once q is healthy."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "From n = 25 applications at q = 0.06, give E[X], Var(X), and the standard deviation of the offer count. Comment on the relative variance.",
                  "solution": "E[X] = 25·0.06 = 1.5. Var(X) = 25·0.06·0.94 = 1.41; SD = √1.41 ≈ 1.19. The SD (1.19) is nearly as large as the mean (1.5), so outcomes of 0, 1, 2, or 3 are all quite likely — high relative variance is intrinsic when nq is small, which is exactly why you plan to a confidence level and batch for timing.",
                  "hint": "Binomial: mean nq, variance nq(1−q)."
                },
                {
                  "prompt": "You have been rejected at the onsite by 5 companies, each time in the system-design round. You're considering applying to 20 more. Critique this plan with the correlated-failure result and give the better plan.",
                  "solution": "The 5 failures share a cause (system design), so they are not independent draws — your effective q for that stage is near 0 and P(zero offers) has a floor no amount of n removes. Applying to 20 more mostly re-draws the same failure. Better plan: stop applying, close the system-design gap (Arc 2: estimation, the design procedure, worked designs) until you can clear that round, which raises q for *all* future applications at once; then resume applying, now with independent-ish draws and a real chance per company.",
                  "hint": "Are these five draws independent? What does the correlated-failure theorem say increasing n can and can't fix?"
                },
                {
                  "prompt": "From n = 40 applications at q = 0.05, compute E[X], the standard deviation, and P(zero offers). Does 40 reach 90% confidence of at least one offer?",
                  "solution": "E[X] = 40·0.05 = 2.0. Var = 40·0.05·0.95 = 1.9, SD = √1.9 ≈ 1.38. P(zero) = (0.95)⁴⁰ = e^(40·ln 0.95) = e^(−2.05) ≈ 0.129, so P(≥1) ≈ 0.871 — just short of 90%. To hit 90% you need n ≥ ln(0.10)/ln(0.95) ≈ 44.9 → 45, so five more processes clear the bar. The SD (1.38) on a mean of 2 also means 0–4 offers are all plausible — plan to the confidence target, not the mean.",
                  "hint": "Binomial mean/SD; P(zero)=(1−q)^n; compare P(≥1) to 0.90 and back out the needed n."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u2l3-i1",
              "front": "Distribution, mean, variance of offer count from n apps?",
              "back": "Binomial(n,q): E[X]=nq, Var(X)=nq(1−q). When nq is small the SD rivals the mean — high relative variance."
            },
            {
              "id": "u2l3-i2",
              "front": "Why batch applications in one window?",
              "back": "To make offers arrive together — concurrent offers are leverage (competing offers, a real BATNA) and avoid accepting an early exploding offer. Changes timing, not q."
            },
            {
              "id": "u2l3-i3",
              "front": "What does correlated failure (a shared weakness) do to the funnel math?",
              "back": "Failures co-occur, so P(zero offers) > (1−q)ⁿ and has a floor > 0 independent of n — applying more re-draws the same failure. Only fixing the weakness (raising q) helps."
            },
            {
              "id": "u2l3-i4",
              "front": "Raise q or raise n?",
              "back": "nq is symmetric, but raising q (skill) is super-linear: more offers, fewer apps needed per confidence, fixes correlated failures, and compounds into stronger offers. Use n for residual variance once q is healthy."
            },
            {
              "id": "u2l3-i5",
              "front": "What does batching change about funnel outcomes?",
              "back": "Not q or E[X] — the JOINT TIMING. Clustering processes makes offers co-arrive, so you hold competing offers at once (leverage/BATNA) instead of a trickle that expires singly."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u2-check",
        "questions": [
          {
            "id": "u2q1",
            "type": "numeric",
            "prompt": "A funnel passes 45% at the recruiter screen, 55% at the technical screen, and 35% at the onsite. What is the single-application offer probability q? (two decimals)",
            "answer": 0.09,
            "tolerance": 0.01,
            "explanation": "q = 0.45 × 0.55 × 0.35 = 0.0866 ≈ 0.09. A product of survival rates is small even when each stage is a coin-flip-ish pass."
          },
          {
            "id": "u2q2",
            "type": "numeric",
            "prompt": "With per-application offer probability q = 0.09, how many applications give at least a 90% chance of one or more offers? (round up to a whole number)",
            "answer": 25,
            "tolerance": 1,
            "explanation": "n ≥ ln(0.10)/ln(0.91) = (−2.3026)/(−0.0943) ≈ 24.4 → 25 applications. This is the honest version of 'apply broadly.'"
          },
          {
            "id": "u2q3",
            "type": "numeric",
            "prompt": "At q = 0.09, what is the expected number of applications until your first offer? (nearest whole number)",
            "answer": 11,
            "tolerance": 1,
            "explanation": "Geometric mean E[K] = 1/q = 1/0.09 ≈ 11.1 → ~11. But the tail is long, so plan to a confidence target rather than this mean."
          },
          {
            "id": "u2q4",
            "type": "numeric",
            "prompt": "From 30 applications at q = 0.09, what is the standard deviation of the number of offers? (two decimals)",
            "answer": 1.57,
            "tolerance": 0.1,
            "explanation": "Var = nq(1−q) = 30·0.09·0.91 = 2.457; SD = √2.457 ≈ 1.57. With mean nq = 2.7, an SD of 1.57 means 1–4 offers are all plausible — high relative variance."
          },
          {
            "id": "u2q5",
            "type": "short",
            "prompt": "One word: a shared root cause across your rejections makes the applications non-____ , so applying more doesn't help.",
            "accept": [
              "independent",
              "independent."
            ],
            "explanation": "Non-independent (correlated) failures share a cause, so P(zero offers) has a floor no amount of n removes. Fix the weakness (raise q) instead."
          },
          {
            "id": "u2q6",
            "type": "open",
            "points": 3,
            "prompt": "You have 6 weeks, can realistically run ~15 application processes, and want a strong (multiple-offer) outcome for negotiating leverage. Your last search stalled with three onsite rejections all in system design. Design an application-and-prep strategy and justify it quantitatively using this unit's results.",
            "rubric": [
              "Recognizes the three same-stage rejections as correlated failure — so raising n alone can't fix it; prescribes closing the system-design gap first to raise q (cites the correlated-failure result).",
              "Uses the funnel/confidence math to size the effort — e.g. estimates q, applies E[offers]=nq and/or n ≥ ln(1−C)/ln(1−q) to argue whether ~15 processes suffices for the desired confidence, and identifies the binding stage.",
              "Prescribes batching the processes into one window to make offers co-arrive for leverage (ties to negotiation), rather than sequential applications.",
              "Balances raise-q vs raise-n given the fixed time/'~15 processes' budget, with an explicit, reasoned allocation.",
              "Concrete and internally consistent — real numbers and a defensible plan, not generic advice."
            ],
            "solution": "First, diagnose: three onsite rejections all in system design is correlated failure, so my effective q is suppressed by one stage and more applications would re-draw the same loss (the correlated-failure floor). Priority one is to raise q by closing the system-design gap (Arc 2) before spending applications. Size it: with a healthy funnel my per-app q might be ~0.08–0.10; at q=0.09, E[offers] from 15 processes is 15·0.09 ≈ 1.35 and P(≥1) = 1−0.91¹⁵ ≈ 0.76 — below a confident multi-offer target. So 15 processes is thin for 'multiple offers,' which argues for (a) lifting q as high as prep allows and (b) using referrals to raise the top-of-funnel factor (multiplicative gain) so more of the 15 reach onsite. Batch all ~15 into the same 2–3 week window so onsites and offers cluster, producing concurrent offers for leverage and avoiding an early exploding offer. Allocation: spend the first ~2 weeks raising q (system-design drills to remove the correlated failure — the highest-leverage move since it lifts every application at once and compounds into offer quality), then launch the batched 15 with referrals where possible, holding a few in reserve to manage the residual binomial variance (SD ≈ 1.5 on a mean near 1.4, so zero is a real risk without the q fix).",
            "explanation": "The unit's synthesis: correlated failure means fix-the-weakness (raise q) comes before volume; the confidence/expectation formulas size whether the process budget is enough; and batching converts the same offers into leverage. A strong answer is numerate and prioritizes q over n given the shared-cause rejections."
          }
        ]
      }
    },
    {
      "id": "u3",
      "title": "The Solve Pipeline & Complexity On-Demand",
      "summary": "A deterministic procedure for attacking any coding problem, deriving its complexity live, and recognizing when a solution is provably optimal.",
      "references": [
        "CLRS 4e — asymptotic notation, the Master theorem, decision-tree lower bound for comparison sorting (cross-links the `algorithms` course, Arc 1 & Arc 3)",
        "McDowell — Cracking the Coding Interview: the 7-step approach & BUD optimization",
        "Aziz et al. — Elements of Programming Interviews: problem-solving patterns"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u3l1",
          "title": "The Solve Pipeline",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Jumping to code is the classic failure",
              "body": "The most common way strong engineers underperform their θ (Unit 1) in a coding round is skipping straight to code. It emits no problem-solving signal, risks solving the wrong problem, and — when it goes wrong — leaves nothing for the interviewer to score but a mess. The fix is to run the *same explicit procedure* every time. It is boring on purpose: a repeatable pipeline removes variance (your σ²_ε) and deposits evidence in every rubric box along the way."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The solve pipeline",
              "statement": "For any coding problem, execute these stages in order, out loud:\n\n1. **Clarify** — restate the problem; ask about input size, ranges, duplicates, sortedness, and the expected output on edge cases.\n2. **Examples** — hand-run a small example and at least one edge case to pin down the exact semantics.\n3. **Brute force** — state the obvious correct solution and its complexity, even if slow. This is your safety net and a scoring move, not a concession.\n4. **Bottleneck** — name the specific wasteful step in the brute force (repeated scan, recomputation, redundant sort).\n5. **Optimize** — pattern-match the bottleneck to a technique (Units 4–6) that removes it; state the new complexity before coding.\n6. **Verify** — check the idea against your examples and the edge cases *before* writing code.\n7. **Code** — implement the verified idea with clear names and explicit invariants.\n8. **Test** — dry-run on the examples and edge cases; fix bugs you find.\n9. **Analyze** — state final time and space complexity and any trade-off."
            },
            {
              "type": "text",
              "heading": "Why brute-force-first is a strength, not a weakness",
              "body": "Candidates skip the brute force because it feels like admitting defeat. Strategically it is the opposite. It (a) guarantees you have *a* correct solution banked if time runs out — partial credit beats nothing; (b) makes the bottleneck concrete, which is where the optimization comes from ('the inner loop rescans — replace it with a hash lookup'); and (c) shows structured problem-solving, a top rubric dimension. The optimization is almost always 'find the repeated/wasted work in the brute force and eliminate it' — you cannot see the waste until you have written the wasteful version down."
            },
            {
              "type": "example",
              "heading": "The pipeline on Two Sum",
              "body": "**Clarify:** integers, may be negative, exactly one answer? indices or values? **Examples:** [2,7,11], target 9 → (0,1). **Brute force:** check all pairs, O(n²) time, O(1) space. **Bottleneck:** for each x we linearly search for target−x. **Optimize:** a hash set/map answers 'have I seen target−x?' in O(1), so one pass suffices → O(n) time, O(n) space. **Verify:** walk [3,3], target 6 — the second 3 finds the first. **Code**, then **Test** the empty and no-solution cases, then **Analyze:** O(n)/O(n), trading space for time. Every stage produced rubric signal; the whole thing took two minutes of talking before a line of code."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The pipeline is also your recovery protocol.** Stuck at 'optimize'? Fall back a stage: re-read the brute force and stare at the bottleneck. Stuck at 'bottleneck'? Generate another example. The stages give you somewhere to go when your mind blanks under stress — which, per Unit 13, is when structure matters most."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 220,
              "caption": "The core of the pipeline is a loop, not a line: the brute force exposes the wasteful step, which suggests the optimization; if you stall, fall back a stage. Only code a verified idea.",
              "nodes": [
                {
                  "id": "clar",
                  "label": "Clarify",
                  "x": 10,
                  "y": 26,
                  "tone": "sage"
                },
                {
                  "id": "brute",
                  "label": "Brute",
                  "x": 37,
                  "y": 26
                },
                {
                  "id": "waste",
                  "label": "Waste",
                  "x": 63,
                  "y": 26,
                  "sub": "the bottleneck"
                },
                {
                  "id": "opt",
                  "label": "Optimize",
                  "x": 90,
                  "y": 26
                },
                {
                  "id": "code",
                  "label": "Code",
                  "x": 63,
                  "y": 78,
                  "tone": "gold",
                  "sub": "verified only"
                }
              ],
              "edges": [
                {
                  "from": "clar",
                  "to": "brute",
                  "directed": true
                },
                {
                  "from": "brute",
                  "to": "waste",
                  "directed": true
                },
                {
                  "from": "waste",
                  "to": "opt",
                  "directed": true
                },
                {
                  "from": "opt",
                  "to": "waste",
                  "label": "stuck? fall back",
                  "directed": true,
                  "dashed": true,
                  "tone": "ember"
                },
                {
                  "from": "opt",
                  "to": "code",
                  "label": "verified",
                  "directed": true
                }
              ]
            },
            {
              "type": "checklist",
              "heading": "Clarifying questions that pay off",
              "items": [
                "Input size n (sets the target complexity — Lesson 2) and value ranges (overflow, negative numbers).",
                "Is the input sorted? Are there duplicates? Can it be empty?",
                "What should happen on no valid answer / ties / invalid input?",
                "Return indices or values? In-place or a new structure? Memory limits?",
                "Is the array/stream mutable? One pass only, or random access allowed?"
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Apply stages 1–5 (through 'optimize', not code) to: 'Given an array, find whether any value appears at least twice.' Name the bottleneck and the technique that removes it.",
                  "solution": "Clarify: can it be empty (no dup), value range, is it sorted? Examples: [1,2,3,1]→true, [1,2,3]→false. Brute force: compare all pairs, O(n²). Bottleneck: for each element we rescan the rest to check membership. Optimize: a hash set gives O(1) membership; one pass, inserting and checking, is O(n) time, O(n) space — or, if sorted/allowed to sort, adjacent-equal check after an O(n log n) sort with O(1) extra space. State the space/time trade-off.",
                  "hint": "The repeated work is a membership test — what data structure makes membership O(1)?"
                },
                {
                  "prompt": "Why is stating 'brute force is O(n²), let me find the bottleneck' better interview behavior than silently thinking until you see the O(n) trick?",
                  "solution": "It banks a correct solution immediately (partial credit insurance), makes the wasteful step explicit so the optimization is discoverable rather than magical, and emits problem-solving and communication signal continuously (Unit 1's rubric). Silent thinking risks a long gap with no evidence and, if the trick doesn't come, nothing to show. The pipeline converts private cognition into observable signal.",
                  "hint": "Recall what the interviewer actually scores and what happens to unobserved work."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u3l1-i1",
              "front": "The nine stages of the solve pipeline?",
              "back": "Clarify → Examples → Brute force → Bottleneck → Optimize → Verify → Code → Test → Analyze. Run it out loud, every time."
            },
            {
              "id": "u3l1-i2",
              "front": "Why state a brute force first?",
              "back": "Banks a correct solution (partial credit), makes the bottleneck concrete (the source of the optimization), and emits problem-solving signal. Optimization = eliminate the brute force's wasted work."
            },
            {
              "id": "u3l1-i3",
              "front": "Where does the optimization usually come from?",
              "back": "Naming the specific wasted/repeated work in the brute force (a rescan, a recomputation) and applying a technique that removes it (hashing, sorting, a pointer, memoization)."
            },
            {
              "id": "u3l1-i4",
              "front": "Two clarifying questions that most shape the solution?",
              "back": "Input size n (sets the target complexity) and structure (sorted? duplicates? empty? value ranges/overflow?)."
            }
          ]
        },
        {
          "id": "u3l2",
          "title": "Complexity On-Demand",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "You must derive complexity live, fast, and correctly",
              "body": "Stating time and space complexity is a fundamentals-rubric requirement, and getting it wrong is a red flag. You need to derive it in seconds from code you're writing. This lesson is technique, not theory — the definitions of O/Θ/Ω live in the `algorithms` course; here we drill fast, correct derivation and the reverse trick every strong interviewee uses: inferring the *target* complexity from the input size."
            },
            {
              "type": "checklist",
              "heading": "Deriving time complexity in seconds",
              "items": [
                "Sequential blocks add: O(a) then O(b) is O(a + b) = O(max(a,b)).",
                "Nested loops multiply: a loop of n around a loop of m is O(n·m).",
                "A loop that halves the range each step is O(log n); one that does O(n) work per halving is O(n log n).",
                "Recursion: count nodes × work-per-node, or apply the Master theorem T(n)=aT(n/b)+f(n) (see the algorithms course).",
                "Amortized: a step that is occasionally expensive but cheap-on-average over a sequence (hash resize, stack pops) — charge the average, not the worst single step.",
                "Don't forget hidden costs: sorting is O(n log n); a substring/slice copy is O(k); a set/dict op is O(1) average but O(n) worst."
              ]
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Space complexity includes the call stack",
              "statement": "Space complexity counts all memory that grows with input: allocated structures **plus** the maximum depth of the recursion call stack. A recursion that descends d frames deep uses Ω(d) stack space even if it allocates nothing else — e.g. a naive DFS on a path graph is O(n) space, and a recursion that isn't tail-eliminated can overflow the stack where an iterative version wouldn't. Always state both the auxiliary structures and the stack depth."
            },
            {
              "type": "example",
              "heading": "Reading complexity off code",
              "body": "A double loop where the inner runs to i (0..n): total work Σ i = n(n−1)/2 = **Θ(n²)**, not Θ(n) — the inner loop's length grows. A divide-and-conquer that splits in half and does a linear merge: T(n) = 2T(n/2) + Θ(n) = **Θ(n log n)** by the Master theorem (case 2). A recursion that branches into 2 and does O(1) work with depth n (naive Fibonacci): Θ(2ⁿ) time, Θ(n) stack space. Memoizing it collapses the repeated subproblems to Θ(n) time (Unit 6). Say these out loud as you write — the derivation *is* the fundamentals signal."
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "The recursion tree for T(n) = 2T(n/2) + cn (e.g. merge sort). Every level does cn total work and there are lg n + 1 levels, so the sum is Θ(n log n) — the visual proof behind the Master-theorem case-2 bound, and the 'count nodes × work-per-node' rule made concrete.",
              "levels": [
                {
                  "n": 1,
                  "each": "cn",
                  "row": "cn"
                },
                {
                  "n": 2,
                  "each": "cn/2",
                  "row": "cn"
                },
                {
                  "n": 4,
                  "each": "cn/4",
                  "row": "cn"
                },
                {
                  "ellipsis": true,
                  "row": "cn"
                },
                {
                  "n": "n",
                  "each": "c",
                  "row": "cn",
                  "leaf": true,
                  "leafLabel": "n leaves"
                }
              ],
              "total": "cn·(lg n + 1) = Θ(n log n)"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Target complexity from the input size",
              "statement": "The constraint on n implies the intended complexity, because ~10⁸–10⁹ simple operations run in about a second. As a working heuristic for interview/contest limits:\n\n  n ≤ ~12       →  O(n!) permutations feasible\n  n ≤ ~20       →  O(2ⁿ) subsets / bitmask DP\n  n ≤ ~500      →  O(n³)\n  n ≤ ~5,000    →  O(n²)\n  n ≤ ~10⁶      →  O(n log n) or O(n)\n  n ≥ ~10⁸       →  O(log n) or O(1)\n\nRead the constraint backwards: it tells you the algorithm class to aim for before you've found the algorithm."
            },
            {
              "type": "text",
              "heading": "Using the target to steer the search",
              "body": "This heuristic is a search-space pruner. If n ≤ 20, the interviewer is signaling an exponential solution is acceptable — reach for backtracking or bitmask DP and stop hunting for a polynomial trick. If n = 10⁶, an O(n²) idea is a dead end no matter how clever; you need O(n log n) or O(n), which points you at sorting, hashing, a heap, or a single linear pass. Announcing 'n is up to a million, so I need at least O(n log n) — that rules out the pairwise approach and suggests sorting or a hash map' is high-density fundamentals *and* problem-solving signal in one sentence."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A function sorts an array (n elements), then for each element does a binary search over the array. Give tight time and space complexity.",
                  "solution": "Sort is Θ(n log n). The loop runs n times, each doing a Θ(log n) binary search: Θ(n log n). Total Θ(n log n) + Θ(n log n) = Θ(n log n) time. Space: Θ(1) auxiliary if sorting in place and iterating (or Θ(log n)–Θ(n) depending on the sort's stack/merge buffer — state the assumption). The two Θ(n log n) phases add, and max dominates.",
                  "hint": "Add the sequential phases; each is n log n."
                },
                {
                  "prompt": "You're told n ≤ 18 and the problem asks for the optimal assignment of n tasks to n workers. What algorithm class does the constraint point to, and why?",
                  "solution": "n ≤ 18 sits in the O(2ⁿ) band (2¹⁸ ≈ 262k, times a factor of n it's ~5M — fast). This signals **bitmask dynamic programming** over subsets of workers/tasks (assignment DP), rather than searching for a polynomial-time algorithm. The small n is the interviewer telling you exponential-in-a-bitmask is the intended solution; recognizing that from the constraint saves minutes of misdirected search.",
                  "hint": "Map n=18 to the target-complexity table; which band, and which technique lives there?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u3l2-i1",
              "front": "Sequential vs nested loops for complexity?",
              "back": "Sequential blocks add (O(a+b)=O(max(a,b))); nested loops multiply (O(n·m)). A halving loop is O(log n)."
            },
            {
              "id": "u3l2-i2",
              "front": "What must space complexity always include?",
              "back": "The recursion call-stack depth, not just allocated structures — a DFS d-deep is Ω(d) space even allocating nothing else."
            },
            {
              "id": "u3l2-i3",
              "front": "Target complexity from n (rough bands)?",
              "back": "n≤20→O(2ⁿ); n≤500→O(n³); n≤5k→O(n²); n≤10⁶→O(n log n)/O(n); n huge→O(log n)/O(1). ~10⁸ ops ≈ 1s."
            },
            {
              "id": "u3l2-i4",
              "front": "Why read the input constraint backwards?",
              "back": "It reveals the intended algorithm class before you've found the algorithm, pruning the search (n≤20 → exponential OK; n=10⁶ → O(n²) is a dead end)."
            },
            {
              "id": "u3l2-i5",
              "front": "How do you get a recursion's complexity from its tree?",
              "back": "Sum the work per level × number of levels: T(n)=2T(n/2)+cn is cn per level over lg n+1 levels = Θ(n log n). 'Count nodes × work-per-node,' or the Master theorem."
            }
          ]
        },
        {
          "id": "u3l3",
          "title": "Optimality & Lower Bounds",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Knowing when to stop",
              "body": "Two opposite mistakes: stopping at a suboptimal solution the interviewer wanted improved, or burning time gilding a solution that is already optimal. Both are avoided by knowing lower bounds — a proof that *no* algorithm can beat some bound. When your solution's complexity matches a lower bound, you are provably done, and saying so ('this is optimal — you can't do better than O(n log n) here, by the comparison lower bound') is strong fundamentals signal."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Upper bound vs lower bound",
              "statement": "An **upper bound** is a guarantee that a *specific* algorithm runs within some complexity (you prove it by exhibiting the algorithm). A **lower bound** is a guarantee that *every* algorithm for the problem needs at least some complexity (you prove it about the problem itself, often via an adversary or a counting argument). An algorithm is **asymptotically optimal** when its upper bound matches a known lower bound for the problem."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Comparison sorting is Ω(n log n)",
              "statement": "Any sorting algorithm that only compares pairs of elements (no assumptions on their values) must make Ω(n log n) comparisons in the worst case.",
              "proof": "Model such an algorithm as a binary **decision tree**: each internal node is a comparison a ≤ b with two outcomes (branches), and each leaf is a final permutation the algorithm outputs. To sort correctly, the tree must have a distinct reachable leaf for every one of the n! possible input orderings — otherwise two different orderings would follow the same comparisons and get the same output, and one would be wrong. A binary tree with at least n! leaves has height at least log₂(n!). By Stirling, log₂(n!) = Θ(n log n) (indeed log₂(n!) ≥ (n/2)log₂(n/2)). The height is the worst-case number of comparisons on some input, so that count is Ω(n log n). ∎\n\nThe consequence: merge sort and heap sort (O(n log n)) are asymptotically optimal *comparison* sorts. You only beat n log n by not comparing — counting/radix sort exploit bounded integer keys, sidestepping the model. Naming this in an interview ('we can't beat n log n by comparisons, so I won't try — unless the values are bounded, where counting sort gives O(n)') is exactly the fundamentals signal that separates levels."
            },
            {
              "type": "text",
              "heading": "The information-theoretic view",
              "body": "The decision-tree argument generalizes: if a correct algorithm must distinguish among M possible answers using yes/no probes, it needs at least log₂ M probes in the worst case (a binary tree separating M outcomes has height ≥ log₂ M). Sorting has M = n! outcomes → Ω(log n!) = Ω(n log n). Searching a sorted array of n has M = n possible positions → Ω(log n), which binary search achieves. Finding one bad coin among n with a balance has M = n outcomes and a *ternary* probe → Ω(log₃ n). This 'count the outcomes, take the log' move both proves optimality and often suggests the algorithm (log₂ n outcomes ⇒ think binary search)."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't over-optimize past the lower bound.** If you've reached O(n log n) on a comparison problem, or O(n) on a problem that must read all n inputs, you are done — pushing further wastes the round. State optimality and move to code/tests. Conversely, if you're at O(n²) but the input size (Lesson 2) or a lower bound says O(n log n) is expected, keep optimizing. Lower bounds tell you which of the two mistakes you're about to make."
            },
            {
              "type": "text",
              "heading": "The linear floor: you must read the input",
              "body": "A trivial but frequently useful lower bound: any algorithm that must examine every input element to be correct is Ω(n). So 'find the max of an unsorted array' is Θ(n) — optimal, don't look for sublinear magic. But 'find any element in a *sorted* array' is Ω(log n), not Ω(n), because you needn't read all of it. Knowing whether the problem forces you to touch all n inputs instantly tells you if O(n) is the floor or if sublinear is possible — a fast sanity check before you optimize."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You propose an O(n log n) solution to a problem that reduces to sorting arbitrary comparable items. The interviewer asks 'can you do better?' What is the correct response and why?",
                  "solution": "The honest, high-signal response: 'Not asymptotically, if we can only compare items — comparison sorting has an Ω(n log n) lower bound via the decision-tree argument (n! outcomes ⇒ height ≥ log₂ n! = Θ(n log n)). We could beat it only by exploiting structure in the keys — e.g. bounded integers allow counting/radix sort in O(n).' This demonstrates you know optimality rather than flailing for a nonexistent speedup, and it correctly conditions the answer on the input model.",
                  "hint": "Is there a lower bound that matches your upper bound? Under what model could you evade it?"
                },
                {
                  "prompt": "A problem: identify the single counterfeit (lighter) coin among n using a balance scale, minimizing weighings. Use the information-theoretic bound to state the minimum number of weighings and the intuition for the algorithm.",
                  "solution": "There are M = n possible answers (which coin), and each weighing has 3 outcomes (left lighter / right lighter / balanced), so you need at least ⌈log₃ n⌉ weighings — a ternary decision tree separating n outcomes has height ≥ log₃ n. The matching algorithm: split into three groups, weigh two equal groups; the result localizes the coin to one third, recursing — exactly ⌈log₃ n⌉ weighings. Counting outcomes and taking log₃ both bounds the problem and reveals the divide-by-three algorithm.",
                  "hint": "How many distinguishable outcomes per weighing, and how many answers must you separate?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u3l3-i1",
              "front": "Upper bound vs lower bound?",
              "back": "Upper: a specific algorithm runs within X (exhibit it). Lower: EVERY algorithm needs ≥ X (prove about the problem). Optimal = upper meets lower."
            },
            {
              "id": "u3l3-i2",
              "front": "Why is comparison sorting Ω(n log n)?",
              "back": "A comparison algorithm is a binary decision tree needing ≥ n! leaves (one per ordering); height ≥ log₂(n!) = Θ(n log n). Beat it only by not comparing (counting/radix on bounded keys)."
            },
            {
              "id": "u3l3-i3",
              "front": "Information-theoretic lower bound in one line?",
              "back": "Distinguishing M outcomes with binary probes needs ≥ log₂ M probes (≥ log_k M for k-ary probes). Count outcomes, take the log — bounds it and often suggests the algorithm."
            },
            {
              "id": "u3l3-i4",
              "front": "The linear floor?",
              "back": "If correctness requires examining every input, the problem is Ω(n) (e.g. max of unsorted array is Θ(n)); if not (sorted search), sublinear is possible (Ω(log n))."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u3-check",
        "questions": [
          {
            "id": "u3q1",
            "type": "short",
            "prompt": "In the solve pipeline, what is the single stage you state right after clarifying and giving examples — the correct-but-possibly-slow solution that banks partial credit and exposes the bottleneck? (two words)",
            "accept": [
              "brute force",
              "bruteforce",
              "brute-force"
            ],
            "explanation": "The brute force. It banks a correct solution, makes the wasted work concrete (the source of the optimization), and emits problem-solving signal."
          },
          {
            "id": "u3q2",
            "type": "short",
            "prompt": "An input constraint says n can be as large as 1,000,000. Name the slowest acceptable asymptotic time class (of the form O(...)).",
            "accept": [
              "o(n log n)",
              "n log n",
              "o(nlogn)",
              "nlogn",
              "o(n log(n))"
            ],
            "explanation": "At n = 10⁶, O(n²) is ~10¹² ops (too slow); O(n log n) ≈ 2×10⁷ is fine. So O(n log n) is the slowest acceptable class — read the constraint backwards to pick the algorithm family."
          },
          {
            "id": "u3q3",
            "type": "numeric",
            "prompt": "A loop runs i from 0 to n−1, and for each i an inner loop runs j from 0 to i−1. Exactly how many inner iterations execute, as a function of n? Give the coefficient of n² in the leading term. (e.g., for n²/2 enter 0.5)",
            "answer": 0.5,
            "tolerance": 0.01,
            "explanation": "Σ_{i=0}^{n−1} i = n(n−1)/2 = n²/2 − n/2, so the leading term is n²/2 → coefficient 0.5, i.e. Θ(n²). The inner loop's growing length is why it's quadratic, not linear."
          },
          {
            "id": "u3q4",
            "type": "mcq",
            "prompt": "You've written an O(n) solution to 'find the maximum of an unsorted array.' The interviewer asks 'can you make it faster?' The best answer is:",
            "options": [
              "Yes — sort first, then take the last element",
              "No — you must examine every element to be sure of the max, so Ω(n) is a lower bound and O(n) is optimal",
              "Yes — use binary search to find the max in O(log n)",
              "Yes — a hash map makes it O(1)"
            ],
            "answer": 1,
            "explanation": "Any correct max-finder must read all n elements (an unseen element could be the max), so the problem is Ω(n); O(n) is optimal. Sorting is slower (n log n); binary search needs sorted data; a hash map doesn't help. Recognizing the linear floor prevents wasted 'optimization.'"
          },
          {
            "id": "u3q5",
            "type": "proof",
            "points": 3,
            "prompt": "Prove that any comparison-based algorithm that sorts n distinct elements must perform Ω(n log n) comparisons in the worst case.",
            "rubric": [
              "Models a comparison algorithm as a binary decision tree: internal nodes are comparisons with two outcomes, leaves are output permutations.",
              "Argues the tree must have at least n! leaves — one reachable leaf per distinct input ordering — else two orderings share a path and one output is wrong.",
              "Bounds the worst-case comparisons by the tree height, and shows a binary tree with ≥ n! leaves has height ≥ log₂(n!).",
              "Concludes log₂(n!) = Θ(n log n) (e.g. via Stirling or log₂(n!) ≥ (n/2)log₂(n/2)), hence Ω(n log n) in the worst case."
            ],
            "solution": "Represent any comparison sort as a binary decision tree: each internal node performs one comparison aᵢ ≤ aⱼ with two child branches (the two outcomes), and each leaf is a permutation the algorithm outputs. Correctness requires a distinct reachable leaf for each of the n! orderings of distinct inputs: if two different orderings reached the same leaf, the algorithm would output the same permutation for both, and at most one can be correct. Thus the tree has ≥ n! leaves. A binary tree of height h has at most 2ʰ leaves, so 2ʰ ≥ n! ⇒ h ≥ log₂(n!). The worst-case number of comparisons is the longest root-to-leaf path, i.e. the height h. Finally log₂(n!) = Θ(n log n): the upper side by n! ≤ nⁿ; the lower side by n! ≥ (n/2)^{n/2}, so log₂(n!) ≥ (n/2)log₂(n/2) = Ω(n log n). Therefore any comparison sort makes Ω(n log n) comparisons in the worst case. ∎",
            "explanation": "The decision-tree / counting argument is the canonical comparison lower bound; the key steps are 'n! required leaves' and 'height ≥ log₂(#leaves) = Θ(n log n).' Beating it requires leaving the comparison model (counting/radix sort)."
          }
        ]
      }
    },
    {
      "id": "u4",
      "title": "Pattern Taxonomy I — Sequences & Search",
      "summary": "The array/string/search patterns as trigger → invariant → complexity, including the correctness theorem behind binary-search-on-the-answer.",
      "references": [
        "EPI & CTCI — arrays, strings, searching pattern chapters",
        "CLRS 4e — binary search invariants; amortized analysis (cross-links `algorithms` Arc 3, monotonic stack O(n))",
        "Competitive-programming canon — 'binary search on the answer' over a monotone predicate"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u4l1",
          "title": "Two Pointers & Sliding Window",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Pattern recognition is a trigger → technique map",
              "body": "Interview problems reuse a small set of techniques. The skill is a fast map from surface features of the problem (the *trigger predicate*) to the technique, plus knowing the *invariant* that makes the technique correct and the *complexity* it achieves. This unit and the next two build that map explicitly. Memorizing solutions doesn't transfer; memorizing 'sorted array + find a pair with a target → two pointers, because the discarded side can't hold a solution' does."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Two pointers",
              "statement": "**Trigger:** a *sorted* (or monotone) sequence where you seek a pair/triple meeting a condition, an in-place partition, or a fast/slow traversal (cycle detection, middle-finding). **Technique:** maintain two indices and move them toward each other (or at different speeds), using order to decide which to advance. **Invariant (converging case):** all pairs outside the current [lo, hi] window have already been correctly excluded. **Complexity:** O(n) time, O(1) space — each pointer moves monotonically, so total moves ≤ n."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Two-pointer pair-sum correctness",
              "statement": "Given a sorted array a and target t, the converging two-pointer scan (lo=0, hi=n−1; if a[lo]+a[hi] < t advance lo, if > t retreat hi, if = t report) finds a valid pair iff one exists.",
              "proof": "Loop invariant: no pair (i, j) with i < lo or j > hi sums to t and has been skipped incorrectly. Consider a step where a[lo] + a[hi] < t. For every j ≤ hi, a[lo] + a[j] ≤ a[lo] + a[hi] < t (sortedness), so a[lo] pairs with *nothing* in the remaining range to reach t; advancing lo discards only pairs that cannot be solutions, preserving the invariant. Symmetrically, if a[lo] + a[hi] > t, then a[hi] paired with any a[i], i ≥ lo, exceeds t, so retreating hi is safe. Each step discards one element that provably belongs to no solution, so if a solution exists the pointers meet it before crossing; if none exists the pointers cross having correctly excluded everything. ∎\n\nThe engine is the exchange argument: order guarantees the discarded pointer participates in no solution, which is exactly why the same idea fails on *unsorted* input."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Sliding window",
              "statement": "**Trigger:** a *contiguous* subarray/substring optimizing or counting under a constraint that is **monotone under shrinking** — i.e. if a window violates the constraint, every larger window containing it also violates it (so shrinking can restore feasibility). **Technique:** expand the right end one step at a time; whenever the window violates the constraint, advance the left end until it is feasible again; track the best feasible window seen. **Invariant:** [left, right] is the current candidate; all feasible windows ending at `right` are considered via the left boundary. **Complexity:** O(n) — each index enters the window once (right++) and leaves at most once (left++), so ≤ 2n pointer moves."
            },
            {
              "type": "example",
              "heading": "Longest substring without repeating characters",
              "body": "Constraint: the window has no duplicate character. It is shrink-monotone: adding a duplicate makes the window infeasible, and no larger window fixes it — you must shrink from the left past the earlier copy. Algorithm: expand right, keep a set/last-index map; when s[right] is already in the window, advance left past its previous position; record the max window length. Each character is added once and removed once → O(n) time, O(min(n, alphabet)) space. The trigger ('longest contiguous window with a shrink-monotone constraint') is what tells you 'sliding window' before you code."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Sliding window needs shrink-monotonicity.** It works for 'no duplicates,' 'sum ≤ K on non-negative numbers,' 'at most K distinct.' It breaks when shrinking doesn't restore feasibility — e.g. sums that can go negative (a shorter window isn't necessarily smaller), where you need prefix sums + a hash instead (Lesson 3). Check the monotonicity before reaching for the window."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Give the trigger that distinguishes a two-pointer solution from a sliding-window solution, and one problem for each.",
                  "solution": "Two pointers: a *sorted/monotone* sequence with a pair/partition/two-speed structure, pointers converging or moving at different rates (e.g. two-sum on a sorted array; detecting a linked-list cycle with fast/slow). Sliding window: a *contiguous* subarray/substring under a *shrink-monotone* constraint, one pointer trailing the other (e.g. longest substring without repeats; smallest subarray with sum ≥ S on positive numbers). Both are O(n)/O(1)-ish, but the trigger differs: order-exploiting pair search vs. contiguous-window optimization.",
                  "hint": "One exploits sortedness to discard a side; the other maintains a contiguous feasible window."
                },
                {
                  "prompt": "Why does the sliding-window approach to 'smallest subarray with sum ≥ S' require the array to be non-negative?",
                  "solution": "The window relies on shrink-monotonicity: once sum ≥ S, shrinking from the left reduces the sum monotonically, so you can safely contract to find the smallest feasible window ending at `right`. With negatives, shrinking can *increase* the sum (removing a negative), so a smaller window can still satisfy the constraint that the shrink step skipped — the monotone relationship breaks and the window misses solutions. Non-negativity is what guarantees 'shrinking only lowers the sum,' the invariant the technique needs. (For general values, use prefix sums.)",
                  "hint": "What does removing an element from the left do to the window sum when values can be negative?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u4l1-i1",
              "front": "Two-pointer trigger and why it needs order?",
              "back": "Sorted/monotone sequence + pair/partition/fast-slow. Order lets each step discard a pointer that provably belongs to no solution (exchange argument); fails on unsorted input."
            },
            {
              "id": "u4l1-i2",
              "front": "Sliding-window trigger and invariant?",
              "back": "Contiguous window under a shrink-monotone constraint. Expand right; shrink left to restore feasibility; each index enters and leaves once → O(n)."
            },
            {
              "id": "u4l1-i3",
              "front": "What property must the window constraint have?",
              "back": "Shrink-monotonicity: if a window violates the constraint, shrinking can restore it (larger windows stay infeasible). Holds for 'no dup', 'sum≤K on non-negatives'; fails with negatives."
            },
            {
              "id": "u4l1-i4",
              "front": "Why is sliding window O(n)?",
              "back": "left and right each advance monotonically across the array, so total pointer moves ≤ 2n — each element enters and exits the window at most once."
            }
          ]
        },
        {
          "id": "u4l2",
          "title": "Binary Search on the Answer",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Binary search is not about sorted arrays",
              "body": "Most people learn binary search as 'find a value in a sorted array.' That's a special case. The real idea is: **binary search finds the boundary of a monotone predicate.** If some yes/no property flips exactly once from false to true as you move along an ordered domain, you can locate the flip in O(log n) probes. This unlocks 'binary search on the answer' — one of the highest-yield interview patterns, where you binary-search over the *space of possible answers* rather than over the input."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Binary search on a monotone predicate",
              "statement": "Let P : {lo, …, hi} → {false, true} be **monotone**: there is a threshold τ with P(x) = false for x < τ and P(x) = true for x ≥ τ. Then the first-true boundary τ is found in ⌈log₂(hi − lo + 1)⌉ evaluations of P by the invariant search: keep a range [L, R] known to contain τ; probe m = ⌊(L+R)/2⌋; if P(m) set R = m, else set L = m+1; stop when L = R. 'Binary search on the answer' takes P(x) = 'is answer value x feasible?' and searches x over the answer range."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Validity of binary search on the answer",
              "statement": "The boundary search above returns the least x with P(x) = true if and only if P is monotone (false-then-true) over [lo, hi]. If P is not monotone, no comparison-based halving is guaranteed to find a/the true point.",
              "proof": "(⇐, correctness under monotonicity.) Maintain the invariant that τ ∈ [L, R], i.e. P(L−1)=false (or L=lo) and P(R)=true (or R=hi). Initially [lo, hi] satisfies it if any true point exists. At a probe m ∈ [L, R): if P(m)=true, then by monotonicity τ ≤ m, so setting R=m keeps τ ∈ [L, R]; if P(m)=false, then τ > m, so setting L=m+1 keeps it. Each step halves R−L, so after ⌈log₂(range)⌉ steps L=R, which by the invariant is τ, the least true x. (⇒, necessity.) Suppose P is not monotone: there exist a < b with P(a)=true and P(b)=false. A halving search that probes a midpoint sees a single boolean and must discard one half; whichever half it keeps, a witness (a true or the sought point) can lie in the discarded half, so it cannot guarantee finding the boundary. Monotonicity is exactly what makes 'the answer is on one side of the probe' a valid inference. ∎\n\nSo the entire job of applying this pattern is: define P(x) = 'is x a feasible answer?' and **prove P is monotone**. Everything else is the template."
            },
            {
              "type": "example",
              "heading": "Minimum ship capacity to deliver in D days",
              "body": "Given package weights in order and D days, find the least ship capacity c such that loading packages in order (never exceeding c/day) finishes within D days. Define P(c) = 'capacity c finishes in ≤ D days.' **Monotonicity:** if capacity c works, any capacity c' > c also works (a bigger ship never needs more days) — so P is false for small c and true for large c, a clean threshold. The feasible range is [max(weight), Σ weights]. Binary-search c over that range; evaluating P(c) is an O(n) greedy simulation (fill each day until the next package overflows c). Total O(n log(Σ weights)). The whole insight is the monotonicity proof; recognizing 'minimize/maximize a value subject to a monotone feasibility check' is the trigger."
            },
            {
              "type": "example",
              "heading": "Koko eating bananas",
              "body": "Piles of bananas, H hours; Koko eats at speed k bananas/hour (a pile per hour, leftovers wait). Find the minimum k to finish within H hours. P(k) = 'speed k finishes in ≤ H hours' = Σ ⌈pile/k⌉ ≤ H. Monotone: faster speed never takes more hours, so P flips false→true once. Binary-search k in [1, max(pile)]; each P(k) is O(n). Same template, same trigger: 'minimum value that makes a monotone condition hold.'"
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**The trap: binary-searching a non-monotone answer.** If feasibility isn't monotone in the search variable — e.g. an objective that first improves then worsens (unimodal, needs *ternary* search) or a predicate that toggles more than once — halving can silently return a wrong answer. Before coding the template, state the monotonicity claim and why it holds; if you can't, binary search on the answer is the wrong tool."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You must place k routers on a line of houses to minimize the maximum gap between adjacent chosen positions — no wait, restated: given sorted positions and k, maximize the minimum distance between any two of k chosen positions (aggressive cows). Formulate the binary-search-on-the-answer and prove monotonicity.",
                  "solution": "Search over d = the minimum allowed distance. P(d) = 'we can place all k items so every adjacent pair is ≥ d apart,' checked greedily (place at the first position, then the next position ≥ last+d; feasible iff we place ≥ k). Monotonicity: if distance d is achievable, any smaller d' < d is also achievable (the same placement has all gaps ≥ d ≥ d'), so P is true-then-false in d — we want the *largest* true d, the boundary. Binary-search d in [1, max−min]; each check is O(n greedy). Because we maximize, search for the last true instead of the first, but the monotone-boundary logic is identical.",
                  "hint": "Let d be the answer variable; is 'distance d is achievable' monotone in d? Which direction?"
                },
                {
                  "prompt": "Explain why 'find the peak of an array that increases then decreases' cannot use ordinary first-true binary search, and what it needs instead.",
                  "solution": "The property 'a[m] is the peak' is not monotone along the array — values rise then fall, so a single midpoint comparison against the boundary predicate isn't false-then-true. What *is* monotone is the *slope sign* (a[m] < a[m+1]): it is true on the increasing part and false on the decreasing part, flipping once. So you binary-search on that monotone slope predicate (go right while a[m] < a[m+1], else left) to find the peak in O(log n) — an instance of finding the right monotone predicate. Equivalently, a unimodal *value* would call for ternary search. The lesson: locate the monotone quantity, don't binary-search a non-monotone one directly.",
                  "hint": "Is the value monotone? Is the sign of the local slope monotone?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u4l2-i1",
              "front": "What does binary search actually search?",
              "back": "The boundary of a monotone (false-then-true) predicate over an ordered domain — 'sorted array lookup' is just the special case predicate a[x] ≥ target."
            },
            {
              "id": "u4l2-i2",
              "front": "Binary search on the answer — the required condition?",
              "back": "Feasibility P(x)='is x a valid answer?' must be MONOTONE in x. Then binary-search x over the answer range; each P(x) check is an inner simulation. Correct iff monotone."
            },
            {
              "id": "u4l2-i3",
              "front": "Trigger for binary-search-on-the-answer?",
              "back": "'Minimize/maximize a value subject to a monotone feasibility check' (min ship capacity for D days, min eating speed for H hours, max-min distance)."
            },
            {
              "id": "u4l2-i4",
              "front": "The failure mode to check for?",
              "back": "Non-monotone feasibility (toggles more than once) or a unimodal objective (needs ternary search). Always state/prove monotonicity before using the template."
            }
          ]
        },
        {
          "id": "u4l3",
          "title": "Monotonic Stack & Prefix/Difference Arrays",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Monotonic stack",
              "statement": "**Trigger:** for each element, find the nearest element to one side that is greater/smaller (next-greater-element, stock span, daily temperatures, largest rectangle in a histogram). **Technique:** scan once, maintaining a stack whose values are kept monotonic (e.g. strictly decreasing); before pushing x, pop all elements that x 'resolves' (those for which x is the answer). **Invariant:** the stack holds indices still waiting for their next greater/smaller element, in monotonic order. **Complexity:** O(n) amortized."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Monotonic stack runs in O(n)",
              "statement": "A single left-to-right scan that pushes each element once and pops elements that are resolved performs O(n) total work across n elements, despite the inner while-loop.",
              "proof": "Charge one credit to each element when it is pushed (n credits total). Each pop consumes the credit of the popped element; an element is pushed exactly once and therefore popped at most once, so the total number of pops over the whole scan is ≤ n. The outer loop runs n times (one push each) and the inner while-loop's total iterations across the entire run equal the total pops ≤ n. Hence total work is O(n) + O(n) = O(n), even though a single step's inner loop may pop many elements. ∎\n\nThis is the amortized 'aggregate method' (cross-link the algorithms course, Amortized Analysis): the occasional expensive multi-pop step is paid for by the many cheap pushes. Say 'each element is pushed and popped at most once, so it's O(n) amortized' — precise fundamentals signal."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Prefix sums and difference arrays (duals)",
              "statement": "**Prefix sums:** precompute P[i] = a[0]+…+a[i−1] in O(n); then any range sum a[l..r] = P[r+1] − P[l] in O(1). **Trigger:** many range-*sum* queries on a static array. **Difference array:** to apply many range *updates* 'add v to a[l..r]', keep D with D[l] += v, D[r+1] −= v in O(1) each; a single prefix-sum pass at the end reconstructs the final array in O(n). **Trigger:** many range updates, one final read. They are duals: prefix-sum turns point values into range answers; difference-array turns range updates into point deltas."
            },
            {
              "type": "example",
              "heading": "Subarray sum equals K (why the window fails, prefix sums save it)",
              "body": "Count subarrays summing to K, with possibly negative values. A sliding window fails (no shrink-monotonicity with negatives, Lesson 1). Instead: a subarray a[l..r] sums to K iff P[r+1] − P[l] = K iff P[l] = P[r+1] − K. Scan r, maintaining a hash map of prefix-sum → count seen so far; at each r add the count of P[r+1] − K. O(n) time, O(n) space. The pattern: a *range* condition (sum over a subarray) becomes a *point* condition on prefix sums (two prefix values differ by K), which a hash map answers in O(1). Recognizing 'range-sum condition + negatives → prefix sums + hash' is the trigger."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Range condition → prefix/difference transform is a reflex.** 'Many range-sum queries' ⇒ prefix sums. 'Many range-add updates, read once' ⇒ difference array. 'Count subarrays with property on a sum' ⇒ prefix sums + hash. These turn O(n) per query into O(1), the difference between O(nq) and O(n+q)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You must apply 10⁵ range-increment operations 'add v to a[l..r]' to an array of size 10⁵, then print the final array once. Give an O(n + q) method and its mechanism.",
                  "solution": "Use a difference array D of size n+1, all zero. For each update (l, r, v): D[l] += v and D[r+1] −= v — O(1) per update, O(q) total. After all updates, take the prefix sum of D: a[i] = a[i] + Σ_{j≤i} D[j], one O(n) pass, to reconstruct the final array. Total O(n + q) instead of O(n·q) for naive per-update range writes. Mechanism: each range-add is encoded as two point deltas (start adds v, past-the-end cancels it), and the prefix sum 'integrates' the deltas back into actual values.",
                  "hint": "Encode a range update as two endpoint deltas; recover values with one prefix-sum pass."
                },
                {
                  "prompt": "In 'daily temperatures' (for each day, how many days until a warmer temperature), justify the O(n) monotonic-stack complexity to an interviewer.",
                  "solution": "Maintain a stack of indices with *strictly decreasing* temperatures (still awaiting a warmer day). For each new day t, pop every index whose temperature < t[today] and set its answer to the gap, then push today. Each index is pushed once and popped at most once, so across the whole scan the total pushes and pops are each ≤ n; the inner while-loop's iterations sum to the total pops ≤ n. Therefore the algorithm is O(n) time (O(n) stack space), by the amortized aggregate argument — not O(n²), even though one day may resolve many earlier days.",
                  "hint": "Count total pushes and pops over the entire run, not the inner loop per step."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u4l3-i1",
              "front": "Monotonic stack trigger + complexity?",
              "back": "'Nearest greater/smaller to one side' (next-greater, spans, histogram rectangle). O(n) amortized — each element pushed and popped at most once."
            },
            {
              "id": "u4l3-i2",
              "front": "Why is a monotonic stack O(n) despite the inner while-loop?",
              "back": "Aggregate/amortized: total pops ≤ total pushes ≤ n (each element popped at most once), so the inner loop's iterations sum to ≤ n over the whole scan."
            },
            {
              "id": "u4l3-i3",
              "front": "Prefix sums vs difference arrays?",
              "back": "Prefix sums: O(n) prep → O(1) range-SUM queries. Difference array: O(1) range-UPDATE (D[l]+=v, D[r+1]−=v) → one prefix pass reconstructs. Duals."
            },
            {
              "id": "u4l3-i4",
              "front": "'Count subarrays summing to K' with negatives — technique?",
              "back": "Prefix sums + hash: a[l..r]=K iff P[l]=P[r+1]−K; scan r, look up P[r+1]−K in a running count map. O(n). Sliding window fails with negatives."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u4-check",
        "questions": [
          {
            "id": "u4q1",
            "type": "short",
            "prompt": "Binary-search-on-the-answer is valid exactly when the feasibility predicate P(x) has what property in x? (one word)",
            "accept": [
              "monotone",
              "monotonic",
              "monotonicity",
              "monotonicity."
            ],
            "explanation": "Monotone (false-then-true, a single threshold). Then 'the answer is on one side of the probe' is a valid inference. Non-monotone predicates can be missed by halving."
          },
          {
            "id": "u4q2",
            "type": "numeric",
            "prompt": "You binary-search the answer over the integer range [1, 1,000,000,000]. What is the maximum number of feasibility evaluations needed? (round up)",
            "answer": 30,
            "tolerance": 1,
            "explanation": "⌈log₂(10⁹)⌉ = ⌈29.9⌉ = 30. Each probe halves the range; ~30 checks cover a billion-wide answer space — the power of searching the answer, not the input."
          },
          {
            "id": "u4q3",
            "type": "mcq",
            "prompt": "Count subarrays of an array (which may contain negative numbers) whose sum equals K. The right technique is:",
            "options": [
              "Sliding window, expanding right and shrinking left",
              "Two pointers after sorting the array",
              "Prefix sums plus a hash map of prefix-sum counts",
              "Binary search on the answer"
            ],
            "answer": 2,
            "explanation": "Negatives break sliding-window shrink-monotonicity, and sorting destroys subarray contiguity. a[l..r]=K iff P[l]=P[r+1]−K, so a running hash map of prefix-sum counts answers it in O(n)."
          },
          {
            "id": "u4q4",
            "type": "short",
            "prompt": "One phrase: the amortized argument that makes a monotonic stack O(n) is 'each element is pushed and popped at most ____.'",
            "accept": [
              "once",
              "one time",
              "once.",
              "at most once"
            ],
            "explanation": "Once. Total pops ≤ total pushes ≤ n, so the inner while-loop's iterations sum to ≤ n across the whole scan — O(n) by the aggregate method."
          },
          {
            "id": "u4q5",
            "type": "proof",
            "points": 3,
            "prompt": "Consider finding the minimum ship capacity c that ships an ordered list of package weights within D days (each day, load packages in order without exceeding c). Prove that the feasibility predicate P(c) = 'capacity c finishes within D days' is monotone in c, and conclude that binary search on c is correct.",
            "rubric": [
              "States P(c) precisely and what monotone means here (false for small c, true for large c — a single threshold).",
              "Proves the key implication: if capacity c is feasible then any c' > c is feasible — e.g. by an exchange/greedy argument that a larger capacity needs no more days (the greedy day-count is non-increasing in c).",
              "Notes the boundary/range: P is false below max(weight) (a single package can't be loaded) and true at Σ weights (one day suffices), so a threshold exists in [max, sum].",
              "Concludes that monotonicity is exactly the condition the validity theorem requires, so first-true binary search over [max, sum] returns the least feasible c."
            ],
            "solution": "Let P(c) = true iff loading packages in order, starting a new day whenever the next package would exceed capacity c, uses ≤ D days. Claim: c' > c ⇒ (P(c) ⇒ P(c')). Feasibility is governed by days(c), the number of days the greedy fill uses at capacity c. Increasing capacity can only let more (or equal) weight fit before a day rolls over, so at every prefix the day index under c' is ≤ that under c; hence days(c') ≤ days(c). Therefore if days(c) ≤ D then days(c') ≤ D, i.e. P(c) ⇒ P(c'). So P is monotone: false for small c, true for large c. It is false for c < max(weight) (the heaviest package never fits, so it's infeasible for any D), and true for c ≥ Σ weights (everything ships in one day ≤ D for D ≥ 1), so the false→true threshold τ lies in [max(weight), Σ weights]. Monotonicity is precisely the hypothesis of the binary-search-on-the-answer validity theorem, so the first-true search over [max, Σ] evaluates P(c) (an O(n) greedy simulation) O(log(Σ)) times and returns the least feasible capacity. ∎",
            "explanation": "The crux is proving days(c) is non-increasing in c (a bigger ship never needs more days), which gives monotone feasibility; the validity theorem then licenses binary search. This 'define P, prove monotone, binary-search' is the whole pattern."
          }
        ]
      }
    },
    {
      "id": "u5",
      "title": "Pattern Taxonomy II — Graphs, Trees & Recursion",
      "summary": "Traversal, backtracking with pruning, and the structural patterns (union-find, topological sort, heaps) — each as trigger, invariant, and complexity.",
      "references": [
        "CLRS 4e — BFS/DFS, topological sort, disjoint-set forests with union-by-rank + path compression (α(n)); cross-links `algorithms` Arc 2 & Arc 3",
        "EPI & CTCI — graphs, trees, recursion, and backtracking chapters"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u5l1",
          "title": "Graph Traversal: BFS & DFS",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Most 'hard' problems are graph problems in disguise",
              "body": "A huge fraction of interview problems are graphs once you see the vertices and edges: a grid (cell = vertex, neighbor = edge), states of a puzzle (state = vertex, move = edge), dependencies (task = vertex, 'must precede' = edge), word ladders, network connectivity. The first move on anything relational is: 'what are the vertices and edges?' Then two traversals — BFS and DFS — cover most of the ground, and choosing correctly between them is a fundamentals signal."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "BFS and DFS: triggers",
              "statement": "**BFS** explores in rings of increasing distance from a source using a queue. **Trigger:** shortest path / fewest steps in an *unweighted* graph, level-order processing, or 'minimum number of moves.' **DFS** explores as deep as possible before backtracking, using recursion or a stack. **Trigger:** connectivity, path existence, cycle detection, topological order, enumerating structure (subtrees, components). Both run in **O(V + E)** with O(V) space; they visit every vertex and edge once."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "BFS finds shortest paths in unweighted graphs",
              "statement": "Run BFS from source s, recording dist[v] when v is first discovered. Then dist[v] equals the true shortest-path distance (fewest edges) from s to v for every reachable v, and BFS discovers vertices in non-decreasing order of distance.",
              "proof": "By induction on d that BFS discovers exactly the vertices at distance d, all before any vertex at distance d+1, and assigns them dist = d. Base: s is discovered first with dist 0. Inductive step: assume all vertices at distance ≤ d are discovered with correct dist and enqueued before any at distance d+1. A vertex u at distance d+1 has a neighbor w at distance d (take the shortest path's predecessor). w is dequeued (all distance-d vertices are in the queue ahead of any distance-(d+1) vertex by hypothesis), and when w is processed it discovers u, setting dist[u] = dist[w] + 1 = d+1 — unless u was already discovered earlier, which by the queue order could only have happened via another distance-d vertex, again giving d+1. No vertex at distance > d+1 can be discovered before u, because reaching it requires passing through a distance-(d+1) vertex still behind u in the FIFO queue. Hence every distance-(d+1) vertex gets dist d+1, completing the induction. ∎\n\nThe FIFO queue is load-bearing: it enforces the 'process all of level d before level d+1' order that makes first-discovery distance correct. This fails for weighted graphs (a longer-hop path can be cheaper) — there you need Dijkstra (the `cloud`/`algorithms` shortest-path material)."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 280,
              "caption": "BFS from s explores in rings of increasing distance (each node's sub-label is its dist). The FIFO queue finishes all of level d before level d+1, so a vertex's first-discovery level equals its shortest-path distance — here t is at distance 3.",
              "nodes": [
                {
                  "id": "s",
                  "label": "s",
                  "x": 7,
                  "y": 50,
                  "tone": "gold",
                  "sub": "0"
                },
                {
                  "id": "a",
                  "label": "a",
                  "x": 33,
                  "y": 28,
                  "sub": "1"
                },
                {
                  "id": "b",
                  "label": "b",
                  "x": 33,
                  "y": 72,
                  "sub": "1"
                },
                {
                  "id": "c",
                  "label": "c",
                  "x": 59,
                  "y": 20,
                  "sub": "2"
                },
                {
                  "id": "d",
                  "label": "d",
                  "x": 59,
                  "y": 50,
                  "sub": "2"
                },
                {
                  "id": "e",
                  "label": "e",
                  "x": 59,
                  "y": 80,
                  "sub": "2"
                },
                {
                  "id": "t",
                  "label": "t",
                  "x": 86,
                  "y": 50,
                  "tone": "sage",
                  "sub": "3"
                }
              ],
              "edges": [
                {
                  "from": "s",
                  "to": "a",
                  "directed": true
                },
                {
                  "from": "s",
                  "to": "b",
                  "directed": true
                },
                {
                  "from": "a",
                  "to": "c",
                  "directed": true
                },
                {
                  "from": "b",
                  "to": "d",
                  "directed": true
                },
                {
                  "from": "b",
                  "to": "e",
                  "directed": true
                },
                {
                  "from": "d",
                  "to": "t",
                  "directed": true
                },
                {
                  "from": "e",
                  "to": "t",
                  "directed": true
                }
              ]
            },
            {
              "type": "decision",
              "heading": "BFS or DFS?",
              "rows": [
                [
                  "Fewest steps / shortest path in an unweighted graph or grid",
                  "BFS (level order = distance)"
                ],
                [
                  "Does a path exist? Is the graph connected? Count components",
                  "DFS or BFS (either; DFS is simplest)"
                ],
                [
                  "Detect a cycle / produce a topological order (DAG)",
                  "DFS (back edges / finish order) or Kahn's BFS"
                ],
                [
                  "Enumerate all paths / explore combinatorial structure",
                  "DFS / backtracking (Lesson 2)"
                ],
                [
                  "Weighted shortest path",
                  "Neither raw — Dijkstra / Bellman-Ford (see algorithms/cloud)"
                ]
              ]
            },
            {
              "type": "example",
              "heading": "Grid as a graph: shortest path in a maze",
              "body": "A maze is a grid where each open cell is a vertex and edges connect the 4 orthogonal neighbors. 'Fewest steps from start to exit' is unweighted shortest path → **BFS** from the start, marking visited, expanding neighbors ring by ring; the level at which you reach the exit is the answer. O(V+E) = O(rows·cols) since each cell has ≤ 4 edges. The trigger sequence: 'grid + fewest moves' → 'unweighted shortest path' → 'BFS.' Using DFS here would find *a* path, not the shortest."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "'Rotting oranges': each minute, every rotten cell rots its 4 neighbors; return the minutes until none are fresh (or −1). Which traversal, and why is it multi-source?",
                  "solution": "BFS, seeded with *all* initially rotten cells at level 0 (multi-source BFS). Because rot spreads one ring per minute simultaneously from every rotten cell, the BFS level at which a fresh cell is reached equals the minute it rots; the last level processed is the answer. Multi-source BFS is just BFS with several starting vertices enqueued at distance 0 — the level = distance theorem still holds. If any fresh cell is never reached, return −1. DFS would not give the simultaneous minute-by-minute (distance) structure.",
                  "hint": "'Minutes until' = fewest steps = distance; how do you start BFS when many sources spread at once?"
                },
                {
                  "prompt": "Why does BFS's shortest-path guarantee break on a weighted graph? Give a two-vertex-path counterexample sketch.",
                  "solution": "BFS counts edges, not weights, so it returns the fewest-hop path, which need not be the cheapest. Example: s→t directly with weight 10, and s→u→t with weights 1 + 1 = 2. BFS reaches t in one hop (dist 1) and reports the 10-weight path as 'shortest,' missing the cheaper two-hop path of cost 2. The level = distance induction relied on every edge adding exactly 1; with arbitrary weights, a later-level vertex can have a smaller total cost, so you need Dijkstra (a priority queue by cumulative cost) instead.",
                  "hint": "BFS's induction assumes each edge adds the same unit of distance — what breaks when edges have different weights?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u5l1-i1",
              "front": "BFS vs DFS triggers?",
              "back": "BFS: fewest steps / shortest path in unweighted graphs, level order. DFS: connectivity, path existence, cycle detection, topological order, enumerating structure. Both O(V+E)."
            },
            {
              "id": "u5l1-i2",
              "front": "Why does BFS give shortest paths (unweighted)?",
              "back": "The FIFO queue processes all distance-d vertices before any distance-(d+1), so first-discovery distance = true shortest distance. Fails on weighted graphs → Dijkstra."
            },
            {
              "id": "u5l1-i3",
              "front": "How do you model a grid as a graph?",
              "back": "Cell = vertex, edge to each open neighbor (usually 4-directional). 'Grid + fewest moves' → unweighted shortest path → BFS; O(rows·cols)."
            },
            {
              "id": "u5l1-i4",
              "front": "Multi-source BFS?",
              "back": "Enqueue all sources at distance 0; the level = distance property still holds, giving simultaneous spread (e.g. rotting oranges, nearest-of-many)."
            }
          ]
        },
        {
          "id": "u5l2",
          "title": "Backtracking & Pruning",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Backtracking",
              "statement": "**Trigger:** enumerate, count, or find-one over a *combinatorial* space built by a sequence of choices — permutations, subsets, combinations, partitions, board placements (N-queens, Sudoku), word searches. **Technique (choose–explore–unchoose):** at each step, try each valid next choice, recurse, then undo the choice before trying the next. **Complexity:** proportional to the number of nodes in the search tree × work per node — often exponential, which the input-size heuristic (Unit 3: n ≤ ~20) tells you is expected. **Pruning** cuts subtrees that cannot yield a solution and is what makes it tractable."
            },
            {
              "type": "code",
              "heading": "The backtracking skeleton (Python-like pseudocode)",
              "lang": "python",
              "code": "def backtrack(state, choices):\n    if is_complete(state):\n        record(state)          # a full solution\n        return\n    for c in choices(state):\n        if not feasible(state, c):\n            continue           # PRUNE: c can't lead to a solution\n        make(state, c)         # choose\n        backtrack(state, choices)   # explore\n        undo(state, c)         # unchoose (restore state)\n\n# Every backtracking solution is this shape. The art is (1) the state\n# representation, (2) the choices() generator, and (3) feasible() — the\n# pruning test that removes doomed subtrees early."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Pruning preserves completeness",
              "statement": "If feasible(state, c) returns false only when no completion of state·c is a valid solution, then pruning those branches removes no solutions: the backtracking search still enumerates exactly the set of valid solutions.",
              "proof": "Every solution corresponds to a unique root-to-leaf path of choices in the full search tree. Suppose a valid solution σ were lost. Then some choice c on σ's path was pruned, i.e. feasible(state, c) returned false at that node. But σ is a completion of state·c that is valid — contradicting the hypothesis that feasible returns false only when *no* completion is valid. Hence no valid solution is pruned; and pruning only removes branches, never adds spurious ones, so the enumerated set is exactly the valid solutions. ∎\n\nThe hypothesis is the whole discipline: a prune must be *sound* — provably eliminating only dead branches. An overly aggressive feasible() that rejects a branch which could still complete will silently drop real solutions (a correctness bug), while a weak feasible() is merely slow. State the pruning invariant ('I skip a placement only if it already conflicts, which no later move can fix') as your correctness argument."
            },
            {
              "type": "example",
              "heading": "N-queens: pruning is the algorithm",
              "body": "Place n queens on an n×n board, none attacking. Choices proceed row by row; the state is the columns/diagonals already occupied. Without pruning you'd try nⁿ placements. feasible(row, col) = 'col, and both diagonals (row−col, row+col), are currently unused' — a placement that shares a column or diagonal with an existing queen can never complete to a valid board (attacks are permanent), so pruning it is sound (satisfies the theorem's hypothesis). With this prune the search explores only non-attacking partial boards, turning an astronomically large tree into a feasible one. The pruning test *is* where the performance and the correctness both live."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Undo exactly what you did.** The most common backtracking bug is asymmetric make/undo — mutating shared state (a visited set, the board, a running list) on 'choose' but not fully restoring it on 'unchoose.' The invariant: after backtrack(state) returns, `state` is byte-identical to before the call. Prefer immutable passing or a strict make/undo pair, and dry-run one full choose→explore→unchoose cycle in the interview to show the state restores."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For generating all subsets of n distinct elements, give the size of the search space, and explain why n ≤ 20 in the constraints hints at backtracking/bitmask.",
                  "solution": "There are 2ⁿ subsets (each element in or out), so any enumeration is Ω(2ⁿ) — you must produce all of them. Backtracking builds them by the include/exclude choice at each element (a binary tree of depth n with 2ⁿ leaves). n ≤ 20 puts 2ⁿ ≈ 10⁶ within the ~10⁸-ops/second budget (Unit 3's target-complexity table), so the constraint is the interviewer signaling that exponential enumeration — backtracking or bitmask iteration over 0..2ⁿ−1 — is the intended solution, not a hunt for a polynomial trick.",
                  "hint": "How many subsets exist, and which complexity band does n=20 sit in?"
                },
                {
                  "prompt": "You add a pruning rule that rejects some partial states. Later you notice a valid solution is missing from your output. Which property of the prune is violated, and is this a performance bug or a correctness bug?",
                  "solution": "The prune is *unsound*: it rejected a partial state that could still complete to a valid solution, violating the theorem's hypothesis (feasible returned false when a valid completion existed). This is a **correctness** bug — pruning too aggressively drops real solutions — not merely a performance issue. The fix is to weaken feasible() so it rejects a branch only when it can prove no completion is valid; a prune that's merely conservative (never rejects a live branch) is at worst slow, never wrong.",
                  "hint": "Recall the exact condition under which pruning preserves completeness."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u5l2-i1",
              "front": "Backtracking trigger and template?",
              "back": "Enumerate/count/find over a combinatorial choice space (permutations, subsets, placements). Choose → explore (recurse) → unchoose. Complexity = tree nodes × work/node."
            },
            {
              "id": "u5l2-i2",
              "front": "When does pruning preserve all solutions?",
              "back": "When feasible() returns false ONLY for partial states with no valid completion (a sound prune). Then no root-to-leaf solution path is cut."
            },
            {
              "id": "u5l2-i3",
              "front": "Over-aggressive pruning is which kind of bug?",
              "back": "A correctness bug — it drops real solutions. A merely conservative prune (never rejects a live branch) is at worst slow, never wrong."
            },
            {
              "id": "u5l2-i4",
              "front": "The most common backtracking implementation bug?",
              "back": "Asymmetric make/undo: mutating shared state on choose but not fully restoring on unchoose. Invariant: state is identical after backtrack() returns."
            }
          ]
        },
        {
          "id": "u5l3",
          "title": "Union-Find, Topological Sort & Heaps",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Union-Find (disjoint set union)",
              "statement": "Maintains a partition of elements into disjoint sets with two operations: **find(x)** (which set is x in?) and **union(x,y)** (merge the two sets). **Trigger:** dynamic connectivity ('are a and b connected?' with edges added over time), cycle detection in an *undirected* graph, connected components, Kruskal's MST. With **union by rank/size + path compression**, a sequence of m operations on n elements runs in O(m·α(n)), where α is the inverse Ackermann function — effectively constant (α(n) ≤ 4 for any n in the physical universe)."
            },
            {
              "type": "text",
              "heading": "Why union-find, not BFS, for dynamic connectivity",
              "body": "If edges arrive incrementally and you must answer 'connected?' after each, re-running BFS is O(V+E) *per query* — O(q·(V+E)) total. Union-find answers each in near-O(1) amortized by keeping only the merge structure (a forest of parent pointers), never traversing the graph. The α(n) bound comes from union-by-rank (attach the shorter tree under the taller) plus path compression (flatten the find path), proved in the amortized-analysis material of the `algorithms` course — in an interview, cite it: 'with rank + path compression it's O(α(n)) amortized, effectively constant.'"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Topological sort",
              "statement": "A **topological order** of a directed graph is a linear ordering of vertices such that every edge u→v has u before v. **It exists iff the graph is a DAG** (no directed cycle). **Trigger:** ordering under dependencies — build/task scheduling, course prerequisites, compilation order. **Kahn's algorithm (BFS):** repeatedly output a vertex with in-degree 0 and remove it (decrementing neighbors' in-degrees); if fewer than V vertices are output, a cycle exists. O(V + E)."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "A topological order exists iff the graph is acyclic",
              "statement": "A directed graph has a topological ordering if and only if it has no directed cycle.",
              "proof": "(⇒) If a cycle v₁→v₂→…→v_k→v₁ existed, a topological order would need v₁ before v₂ before … before v_k before v₁ — v₁ strictly before itself, impossible. So a topological order implies acyclicity. (⇐) If the graph is a DAG, some vertex has in-degree 0 (otherwise follow incoming edges backward forever, and finiteness forces a repeat = a cycle). Output such a vertex, remove it (and its out-edges); the remainder is still a DAG, so by induction it has a topological order, and prepending the removed vertex — which has no remaining predecessors — yields a valid order for the whole graph. This induction is exactly Kahn's algorithm, and its failure to output all V vertices certifies a cycle. ∎"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Heaps and top-k",
              "statement": "A **binary heap** gives O(log n) insert and extract-min/max and O(1) peek. **Trigger:** repeatedly needing the current best element — the *k* largest/smallest, a streaming median, merging *k* sorted lists, or any 'process items by priority.' **Top-k idiom:** keep a size-k min-heap of the largest-so-far; for each of n elements, push and, if the heap exceeds k, pop the smallest — O(n log k) time, O(k) space, versus O(n log n) for a full sort. Prefer the heap when k ≪ n or the data streams (you can't sort a stream)."
            },
            {
              "type": "example",
              "heading": "K largest in a stream",
              "body": "Given a stream (unknown length) and k, maintain the k largest seen. Keep a min-heap of size ≤ k. For each incoming x: push x; if size > k, pop the minimum. The heap's root is the k-th largest, and its contents are the top k — using only O(k) memory regardless of stream length, at O(log k) per element. A full sort is impossible on a stream and wasteful (O(n log n)) even offline when k ≪ n. Trigger: 'k largest/smallest' or 'streaming priority' → bounded heap."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Detecting a cycle: contrast the right tool for an *undirected* graph vs a *directed* graph, and the complexity.",
                  "solution": "Undirected: union-find — process each edge (u,v); if find(u) == find(v) before union, u and v are already connected, so this edge closes a cycle. O(E·α(n)) ≈ O(E). (DFS with a parent check also works.) Directed: topological sort / DFS — a directed cycle exists iff Kahn's algorithm outputs fewer than V vertices, or iff DFS encounters a back edge (an edge to a vertex currently on the recursion stack). O(V+E). The tools differ because union-find models undirected connectivity, while cycle detection with edge direction needs ordering/traversal state.",
                  "hint": "Union-find captures undirected connectivity; direction needs traversal/ordering."
                },
                {
                  "prompt": "You must return the 100 largest values from a stream of 10⁹ numbers. Give the method, time, and space, and compare to sorting.",
                  "solution": "Maintain a min-heap of size 100. For each of the 10⁹ numbers: push; if size > 100, pop the min. Time O(n log k) = 10⁹·log₂100 ≈ 10⁹·7 ≈ 7×10⁹ ops; space O(k) = 100. Sorting is impossible on a stream (can't hold 10⁹ if streaming) and, even offline, is O(n log n) time and O(n) space — vastly more memory. The bounded heap is the only viable approach: constant memory in k, one pass, log k per element.",
                  "hint": "k ≪ n and it's a stream — what bounded structure keeps only the current top k?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u5l3-i1",
              "front": "Union-find trigger and complexity?",
              "back": "Dynamic connectivity, undirected cycle detection, components, Kruskal. With union-by-rank + path compression: O(α(n)) amortized per op — effectively constant."
            },
            {
              "id": "u5l3-i2",
              "front": "When does a topological order exist, and how to build it?",
              "back": "Iff the graph is a DAG (no directed cycle). Kahn's algorithm: repeatedly emit an in-degree-0 vertex; if < V emitted, there's a cycle. O(V+E)."
            },
            {
              "id": "u5l3-i3",
              "front": "Top-k idiom with a heap?",
              "back": "Keep a size-k min-heap of the largest-so-far; push each element, pop if size > k. O(n log k) time, O(k) space — beats sorting when k ≪ n or data streams."
            },
            {
              "id": "u5l3-i4",
              "front": "Undirected vs directed cycle detection tool?",
              "back": "Undirected: union-find (edge joins already-connected pair) or DFS w/ parent. Directed: topological sort (< V emitted) or DFS back edge (to a vertex on the stack)."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u5-check",
        "questions": [
          {
            "id": "u5q1",
            "type": "short",
            "prompt": "You need the fewest moves to reach a target state in an unweighted state graph. Which traversal is correct? (one word)",
            "accept": [
              "bfs",
              "breadth-first search",
              "breadth first search",
              "breadth-first"
            ],
            "explanation": "BFS — the FIFO queue processes states in non-decreasing distance, so the level at which you reach the target is the fewest moves. DFS finds a path, not the shortest."
          },
          {
            "id": "u5q2",
            "type": "numeric",
            "prompt": "A size-k min-heap finds the k largest of n elements in O(n log k) time. For n = 10^6 and k = 10^3, evaluate log_2(k), rounded to the nearest integer.",
            "answer": 10,
            "tolerance": 0.5,
            "explanation": "log₂(1000) ≈ 9.97 ≈ 10. So the bounded-heap top-k is ~10⁶·10 = 10⁷ ops — versus ~10⁶·20 = 2×10⁷ for a full O(n log n) sort, and with only O(k) memory."
          },
          {
            "id": "u5q3",
            "type": "short",
            "prompt": "A topological ordering of a directed graph exists if and only if the graph has no directed ____ . (one word)",
            "accept": [
              "cycle",
              "cycles",
              "cycle."
            ],
            "explanation": "Cycle. A cycle would force a vertex before itself; conversely every DAG has an in-degree-0 vertex, and peeling it repeatedly (Kahn's algorithm) yields an order."
          },
          {
            "id": "u5q4",
            "type": "mcq",
            "prompt": "You add a pruning rule to a backtracking search and now some valid solutions are missing from the output. The rule is:",
            "options": [
              "Too slow — it evaluates feasibility too often",
              "Unsound — it rejects partial states that could still complete to a valid solution, which is a correctness bug",
              "Correct — missing solutions are expected with pruning",
              "Fine — you should switch to BFS instead"
            ],
            "answer": 1,
            "explanation": "Pruning preserves completeness only if it rejects a branch when NO completion is valid. Dropping real solutions means the prune fired on a branch with a valid completion — an unsound prune, a correctness bug. Conservative pruning is at worst slow."
          },
          {
            "id": "u5q5",
            "type": "proof",
            "points": 3,
            "prompt": "Prove that breadth-first search from a source s in an unweighted graph labels every reachable vertex v with dist[v] equal to its true shortest-path distance (minimum number of edges) from s.",
            "rubric": [
              "Sets up induction on distance d (or on discovery/queue order) with a clear inductive hypothesis about distance-d vertices.",
              "Uses the FIFO property: all distance-d vertices are dequeued before any distance-(d+1) vertex.",
              "Shows a distance-(d+1) vertex is first discovered from a distance-d neighbor and thus labeled d+1 (not smaller — no shorter path; not larger — discovered in time).",
              "Concludes correctness for all reachable vertices and (implicitly) that BFS fails on weighted graphs because the unit-edge assumption breaks."
            ],
            "solution": "Induct on the true distance d. Hypothesis H(d): every vertex at true distance d is discovered, assigned dist = d, and enqueued before any vertex of distance d+1. Base H(0): s is enqueued first with dist 0. Step: assume H(0..d). Let u have true distance d+1, via a shortest path whose predecessor w has true distance d. By H(d), w is discovered with dist d and is dequeued before any distance-(d+1) vertex (FIFO). When w is processed it examines u; if u is undiscovered it sets dist[u] = dist[w]+1 = d+1 and enqueues it. u cannot have been discovered with a smaller label: a label < d+1 would require an already-processed neighbor at distance < d, contradicting that u's true distance is d+1. u cannot be discovered after any distance-(d+2) vertex, since reaching such a vertex requires first dequeuing a distance-(d+1) vertex (like u) still ahead in the FIFO queue. Thus every distance-(d+1) vertex is labeled d+1 and enqueued before distance-(d+2) vertices, giving H(d+1). By induction dist[v] equals the true shortest distance for all reachable v. (The step used 'each edge adds exactly one to distance,' which is why BFS is wrong on weighted graphs — Dijkstra is needed there.) ∎",
            "explanation": "The proof hinges on the FIFO queue ordering vertices by distance; the inductive step shows first-discovery from a correctly-labeled distance-d neighbor yields the exact d+1 label. Unit edges are essential."
          }
        ]
      }
    },
    {
      "id": "u6",
      "title": "Dynamic Programming as a Discipline",
      "summary": "Recognizing DP, defining the subproblem precisely, the five canonical formulations, and reconstructing the actual solution — not just its value.",
      "references": [
        "CLRS 4e — dynamic programming: optimal substructure, overlapping subproblems, LCS, matrix-chain, 0/1 knapsack; cross-links `algorithms` Arc 2 (DP)",
        "Patience sorting / Schensted — longest increasing subsequence in O(n log n)",
        "EPI & CTCI — DP pattern chapters"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u6l1",
          "title": "Recognizing DP & Defining the Subproblem",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "DP is a discipline, not an insight you either have or don't",
              "body": "Dynamic programming feels like magic when watched and terror when attempted, because people try to intuit the recurrence directly. The reliable path is a fixed procedure: (1) recognize the problem is DP, (2) define the subproblem / state in one precise sentence, (3) write the transition (recurrence) between states, (4) set base cases, (5) choose an evaluation order (or memoize). The recurrence is the *fourth* step, not the first — most failures are an imprecise state (step 2), so that is where the rigor goes."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The two properties that make DP apply",
              "statement": "A problem admits dynamic programming when it has both:\n\n• **Optimal substructure** — an optimal solution is composed of optimal solutions to subproblems (so you can combine subproblem answers to build the whole).\n• **Overlapping subproblems** — the same subproblems recur many times in the naive recursion, so caching each answer once (memoization) converts exponential recomputation to polynomial work.\n\nWith optimal substructure but *no* overlap, use divide-and-conquer instead; with overlap but no clean substructure, DP won't have a correct recurrence. **Recognition triggers:** 'count the number of ways,' 'minimum/maximum cost over a sequence of choices,' 'can you reach/partition/make a target,' and problems on sequences, grids, or intervals where each step depends on earlier optimal results."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Memoization collapses the recursion tree",
              "statement": "If a recursive solution has D distinct subproblems, each combinable from already-solved subproblems in O(t) work, then memoized (top-down) evaluation runs in O(D·t) time and O(D) space — regardless of how exponentially many times the naive recursion would revisit those D subproblems.",
              "proof": "Memoization computes each distinct subproblem's answer at most once: the first call evaluates it (doing O(t) combining work over its already-memoized dependencies) and stores it; every later call returns the stored value in O(1). There are D distinct subproblems, so the total combining work is Σ over the D subproblems of O(t) = O(D·t), and the cache holds D entries → O(D) space. The naive un-memoized recursion instead re-solves shared subproblems, and its running time equals the number of *nodes* in the call tree, which can be exponential (e.g. naive Fibonacci has ~φⁿ nodes but only D = n distinct subproblems). Memoization pays for each of the D subproblems once instead of once per occurrence. ∎\n\nHence the complexity formula every DP answer should state: **time = (number of states) × (transition cost); space = number of states** (before rolling-array optimization, Lesson 3). Deriving D and t out loud is the fundamentals signal."
            },
            {
              "type": "text",
              "heading": "The subproblem-definition obligation",
              "body": "State your dp array in one precise, unambiguous English sentence before writing any transition. Ambiguity here is the root of most DP bugs. Compare, for 'house robber' (max sum of non-adjacent values):\n\n• *Vague:* 'dp[i] is the best answer up to i.' (Best answer that does what? Includes i or not?)\n• *Precise:* 'dp[i] = the maximum total from houses 0..i, where house i may or may not be robbed.'\n\nThe precise definition dictates the transition mechanically: dp[i] = max(dp[i−1] (skip i), dp[i−2] + a[i] (rob i, so i−1 was skipped)), base dp[0]=a[0], dp[1]=max(a[0],a[1]). A sloppy state makes the transition unwritable or wrong; a crisp state makes it fall out."
            },
            {
              "type": "example",
              "heading": "From recursion to DP: climbing stairs",
              "body": "Ways to climb n stairs taking 1 or 2 steps. Subproblem: ways(k) = number of distinct ways to reach step k. Transition: the last move was a 1-step (from k−1) or a 2-step (from k−2), so ways(k) = ways(k−1) + ways(k−2); base ways(0)=1, ways(1)=1. That's Fibonacci: D = n distinct states, O(1) transition each → O(n) time. Naive recursion recomputes ways(k) exponentially often (~2ⁿ nodes); memoizing the n distinct states collapses it to O(n). Same recurrence, exponential vs linear — the entire difference is caching the D = n subproblems."
            },
            {
              "type": "diagram",
              "kind": "recursion",
              "caption": "A branching recursion like T(n) = 2T(n−1) + O(1) (naive Fibonacci is similar, ~φⁿ): each call spawns two, so the tree holds ~2ⁿ calls. But there are only n DISTINCT subproblems — memoization pays for each once, collapsing Θ(2ⁿ) to Θ(n).",
              "levels": [
                {
                  "n": 1,
                  "each": "c",
                  "row": "c"
                },
                {
                  "n": 2,
                  "each": "c",
                  "row": "2c"
                },
                {
                  "n": 4,
                  "each": "c",
                  "row": "4c"
                },
                {
                  "ellipsis": true,
                  "row": "⋮"
                },
                {
                  "n": "2ⁿ",
                  "each": "c",
                  "row": "2ⁿc",
                  "leaf": true,
                  "leafLabel": "~2ⁿ calls"
                }
              ],
              "total": "Θ(2ⁿ) naive → Θ(n) memoized (n distinct states)"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For 'coin change: fewest coins to make amount A from denominations d[]', define the subproblem precisely, give the transition, and state the time complexity as states × transition.",
                  "solution": "Subproblem: dp[x] = the minimum number of coins that sum to exactly x (∞ if impossible), for x = 0..A. Transition: dp[x] = 1 + min over denominations d ≤ x of dp[x − d] (use one coin d, then optimally make x − d); base dp[0] = 0. Number of states D = A+1; each transition scans the |d| denominations → t = O(|d|). Time O(A·|d|), space O(A). (Note this is pseudo-polynomial — linear in the value A, not in its bit-length; Lesson 2.)",
                  "hint": "State = amount; the transition tries each coin as the last one added."
                },
                {
                  "prompt": "Naive recursive Fibonacci is O(2ⁿ) but memoized it is O(n). Explain the gap using the states-vs-tree-nodes distinction.",
                  "solution": "The naive recursion's running time is the number of nodes in its call tree, which grows like φⁿ (≈ 1.618ⁿ) because fib(k) is recomputed once for every path that reaches it. But there are only D = n *distinct* subproblems (fib(0)…fib(n)). Memoization solves each distinct subproblem once in O(1) combining work and returns the cache thereafter, so total work is O(D·t) = O(n·1) = O(n). The exponential term counts repeated *occurrences*; DP pays per distinct *state*. Overlapping subproblems are exactly the redundancy memoization removes.",
                  "hint": "Un-memoized time = tree nodes; memoized time = distinct states × transition cost."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l1-i1",
              "front": "The two properties a problem needs for DP?",
              "back": "Optimal substructure (optimal solution built from optimal subproblem solutions) + overlapping subproblems (same subproblems recur, so caching pays)."
            },
            {
              "id": "u6l1-i2",
              "front": "The DP complexity formula?",
              "back": "Time = (number of states) × (transition cost); space = number of states (before rolling-array optimization). Derive both out loud."
            },
            {
              "id": "u6l1-i3",
              "front": "Why does memoization turn exponential into polynomial?",
              "back": "Naive recursion time = call-tree nodes (exponential); memo solves each of D distinct states once → O(D·transition). It pays per distinct state, not per occurrence."
            },
            {
              "id": "u6l1-i4",
              "front": "The most important (and most-botched) DP step?",
              "back": "Defining the subproblem/state in one precise English sentence. A vague state makes the transition unwritable or wrong; a crisp state makes it fall out mechanically."
            },
            {
              "id": "u6l1-i5",
              "front": "Why does a branching recursion collapse from Θ(2ⁿ) to Θ(n) with memoization?",
              "back": "The naive tree has ~2ⁿ nodes but only n distinct subproblems; caching each state's answer once pays per distinct state, not per repeated occurrence."
            }
          ]
        },
        {
          "id": "u6l2",
          "title": "The Five Canonical Formulations",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Almost every DP is one of five shapes",
              "body": "You don't invent a new DP each time; you recognize which of a handful of *families* the problem belongs to, and the family hands you the state shape. Learn the five and most DP problems become 'which family is this, and what are the axes of the state?'"
            },
            {
              "type": "decision",
              "heading": "The DP families → state shape",
              "rows": [
                [
                  "Linear (choice at each position): house robber, climbing stairs, max subarray",
                  "dp[i] over one index; transition from dp[i−1], dp[i−2], … — O(n)"
                ],
                [
                  "Grid / 2-D path: unique paths, minimum path sum, dungeon",
                  "dp[i][j] over a cell; transition from up/left neighbors — O(mn)"
                ],
                [
                  "Two sequences: LCS, edit distance, sequence alignment",
                  "dp[i][j] over prefixes of both strings; transition on match/mismatch — O(mn)"
                ],
                [
                  "Interval: matrix-chain, burst balloons, palindrome partitioning",
                  "dp[i][j] over a subrange; transition splits at k in (i,j) — O(n³)"
                ],
                [
                  "Knapsack / subset: 0-1 knapsack, subset-sum, coin change, partition",
                  "dp[i][capacity] or dp[capacity]; include/exclude each item — O(n·W)"
                ]
              ]
            },
            {
              "type": "code",
              "heading": "0/1 knapsack — the include/exclude transition",
              "lang": "python",
              "code": "# Items with weight w[i], value v[i]; capacity W. Maximize value.\n# State: dp[i][c] = best value using items 0..i-1 within capacity c.\n# Transition for item i-1: EXCLUDE it (dp[i-1][c]) or, if it fits,\n#   INCLUDE it (v[i-1] + dp[i-1][c - w[i-1]]).\nfor i in range(1, n + 1):\n    for c in range(W + 1):\n        dp[i][c] = dp[i-1][c]                       # exclude item i-1\n        if w[i-1] <= c:\n            dp[i][c] = max(dp[i][c],\n                           v[i-1] + dp[i-1][c - w[i-1]])   # include\n# Answer dp[n][W]. States = n*(W+1), transition O(1) -> O(nW) time.\n# The 1-D rolling form (iterate c DOWNWARD) uses O(W) space (Lesson 3)."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Knapsack's O(nW) is *pseudo*-polynomial, not polynomial.** W is a numeric value, so O(nW) is exponential in the *bit-length* of W (W can be huge with a short encoding). Subset-sum/knapsack are NP-hard; the DP is efficient only when W is small. Say this if asked about scalability — it distinguishes 'polynomial in the input' from 'polynomial in a value,' a fundamentals subtlety interviewers probe."
            },
            {
              "type": "example",
              "heading": "Edit distance is the two-sequence family",
              "body": "Minimum single-character insert/delete/substitute edits to turn string A (len m) into B (len n). State: dp[i][j] = edit distance between the first i chars of A and the first j of B. Transition: if A[i−1] == B[j−1], dp[i][j] = dp[i−1][j−1] (no edit needed); else dp[i][j] = 1 + min(dp[i−1][j] (delete A[i−1]), dp[i][j−1] (insert B[j−1]), dp[i−1][j−1] (substitute)). Bases dp[i][0]=i, dp[0][j]=j (delete-all / insert-all). D = (m+1)(n+1) states, O(1) transition → O(mn) time. Recognizing 'transform one sequence into another, prefix by prefix' as the two-sequence family gives the dp[i][j] shape immediately."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Classify each into a DP family and give the state: (a) longest common subsequence of two strings; (b) minimum coins for amount A; (c) maximum value from bursting balloons where bursting i gives left·i·right.",
                  "solution": "(a) Two-sequence family: dp[i][j] = LCS length of prefixes A[0..i) and B[0..j); O(mn). (b) Knapsack/subset family (unbounded): dp[x] = min coins to make x; O(A·|coins|). (c) Interval family: dp[i][j] = max coins from bursting all balloons strictly inside (i,j), transition picks the *last* balloon k to burst in (i,j) giving a[i]·a[k]·a[j] + dp[i][k] + dp[k][j]; O(n³). The family tells you the state axes (one index / capacity / a subrange split) before any transition detail.",
                  "hint": "Two prefixes → dp[i][j]; a target value → dp[x]; a subrange with an internal split → dp[i][j] over (i,j)."
                },
                {
                  "prompt": "Why is it misleading to call the 0/1 knapsack DP a 'polynomial-time algorithm' for knapsack?",
                  "solution": "Its running time O(nW) is polynomial in n and in the *magnitude* W, but W is given in ~log₂W bits, so O(nW) is exponential in the input's bit-length. Knapsack is NP-hard, and the DP is only a *pseudo-polynomial* algorithm — fast when W is small, but blowing up when W is a large value with a compact encoding. Calling it polynomial conflates 'polynomial in a numeric value' with 'polynomial in input size.'",
                  "hint": "How many bits encode W, and how does O(nW) scale in that number of bits?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l2-i1",
              "front": "The five DP families?",
              "back": "Linear (dp[i]), grid (dp[i][j] over a cell), two-sequence (dp[i][j] over two prefixes), interval (dp[i][j] over a subrange split at k), knapsack/subset (dp[item][capacity])."
            },
            {
              "id": "u6l2-i2",
              "front": "0/1 knapsack state and transition?",
              "back": "dp[i][c] = best value from items 0..i-1 within capacity c; transition = max(exclude dp[i-1][c], include v+dp[i-1][c-w]). O(nW)."
            },
            {
              "id": "u6l2-i3",
              "front": "Why is knapsack's O(nW) only pseudo-polynomial?",
              "back": "W is a value encoded in ~log W bits, so O(nW) is exponential in input bit-length. Knapsack is NP-hard; the DP is efficient only when W is small."
            },
            {
              "id": "u6l2-i4",
              "front": "Edit-distance transition?",
              "back": "dp[i][j] = dp[i-1][j-1] if chars match; else 1 + min(delete dp[i-1][j], insert dp[i][j-1], substitute dp[i-1][j-1]). O(mn)."
            }
          ]
        },
        {
          "id": "u6l3",
          "title": "Transitions, Complexity & Reconstruction",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "From a correct DP to an efficient, complete answer",
              "body": "Three things separate a merely-correct DP from a strong interview answer: stating complexity as states × transition, shrinking space with a rolling array when the transition only reaches a few prior rows, and reconstructing the *actual* solution (the subsequence, the path, the items) — not just its numeric value. Interviewers frequently ask 'and can you return the actual sequence, not just its length?' — that's the reconstruction step, and many candidates freeze on it."
            },
            {
              "type": "text",
              "heading": "Space optimization: the rolling array",
              "body": "If dp[i] depends only on dp[i−1] (and maybe dp[i−2]), you never need the whole table — keep only the last row(s). House robber collapses to two variables; 0/1 knapsack's dp[i][c] depends only on row i−1, so a single 1-D array updated with c iterated *downward* (to avoid reusing item i within the same row) gives O(W) space instead of O(nW). The time is unchanged; only space drops. State it: 'since the transition reaches back only one row, I can roll to O(W) space.' Caveat: rolling away the table can forfeit reconstruction (below) unless you store back-pointers separately."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Longest increasing subsequence in O(n log n)",
              "statement": "The length of the longest strictly increasing subsequence of a₁…aₙ can be computed in O(n log n) time by maintaining an array `tails`, where tails[ℓ] holds the smallest possible tail value of an increasing subsequence of length ℓ+1; process each aᵢ by binary-searching its insertion point in `tails` and overwriting there (or appending). The LIS length is the final length of `tails`.",
              "proof": "Invariant: after processing a prefix, `tails` is strictly increasing and tails[ℓ] is the minimum tail over all increasing subsequences of length ℓ+1 seen so far. `tails` is increasing because a length-(ℓ+1) subsequence extends a length-ℓ one, so its minimal tail exceeds the shorter one's minimal tail. For a new value x, find the first index p with tails[p] ≥ x (binary search, valid since `tails` is sorted). If p is past the end, x extends the longest subsequence by one (append) — correct, since x exceeds every current tail. Otherwise overwrite tails[p] = x: x is a new, no-larger tail for length p+1, which can only help future extensions and preserves the minimal-tail invariant; lengths < p are unaffected and lengths > p already had smaller-or-equal tails. Each step is one O(log n) binary search over ≤ n entries, so total time is O(n log n). By the invariant, the final |tails| is the maximum achievable subsequence length. ∎\n\nThis is a direct payoff of Unit 4: the O(n²) DP (dp[i] = 1 + max dp[j] over j<i with aⱼ<aᵢ) becomes O(n log n) by replacing the inner linear scan with a binary search over a cleverly-maintained monotone array. Note `tails` gives the LIS *length*, not the subsequence itself — reconstruction needs stored indices (next)."
            },
            {
              "type": "text",
              "heading": "Reconstruction: recover the solution, not just its cost",
              "body": "The DP table holds optimal *values*; to return the optimal *object* you either (a) store a back-pointer at each state recording which choice was taken, then follow pointers from the final state to a base case, or (b) re-derive the choices by walking the finished table, at each cell asking 'which predecessor did this optimum come from?' For edit distance, trace from dp[m][n] back to dp[0][0], reading off match/insert/delete/substitute at each step (the operation whose transition achieved the min) to output the actual edit script. For 0/1 knapsack, at dp[i][c] compare with dp[i−1][c]: if they differ, item i−1 was taken, so subtract its weight and continue. Reconstruction is O(path length), typically O(n) or O(n+m). Practice it — 'return the actual subsequence/edits/items' is a standard follow-up that trips people who only computed the value."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You solved LCS with a dp[i][j] table of lengths. Describe how to reconstruct one actual longest common subsequence, and its complexity.",
                  "solution": "Walk backward from dp[m][n]. At (i, j): if A[i−1] == B[j−1], this character is in the LCS — prepend it and move to (i−1, j−1). Otherwise move to whichever of (i−1, j) or (i, j−1) has the larger dp value (the direction the optimum came from; break ties either way). Stop at i = 0 or j = 0. Reversing the collected characters gives an LCS. Each step decrements i or j (or both), so the trace is O(m + n) after the O(mn) table fill. This recovers the object from the value table via back-tracing the transitions.",
                  "hint": "At each cell, ask which transition produced dp[i][j]: a matched character, or a move to the better neighbor."
                },
                {
                  "prompt": "Give the state axes and the per-state transition cost that make the O(n²) LIS DP, and explain the single change that yields O(n log n).",
                  "solution": "O(n²) DP: state dp[i] = length of the LIS ending exactly at index i; transition dp[i] = 1 + max over j < i with a[j] < a[i] of dp[j] — that inner max scans up to i predecessors, so transition cost is O(n) and total O(n²). The single change: replace the linear inner scan with a binary search over the monotone `tails` array (tails[ℓ] = smallest tail of an increasing subsequence of length ℓ+1). Each element then costs O(log n) instead of O(n), giving O(n log n). It's the Unit 4 move: a monotone structure turns a linear scan into a binary search.",
                  "hint": "The inner 'max over earlier smaller elements' is a linear scan — what monotone structure lets you binary-search it?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l3-i1",
              "front": "When can you use a rolling array, and what does it save?",
              "back": "When dp[i] depends only on the last row(s) (e.g. dp[i-1]); keep only those rows → space drops (e.g. knapsack O(nW)→O(W)) with time unchanged. May forfeit reconstruction."
            },
            {
              "id": "u6l3-i2",
              "front": "LIS in O(n log n) — the idea?",
              "back": "Maintain `tails` (tails[ℓ]=smallest tail of an increasing subseq of length ℓ+1), monotone; binary-search each element's insertion point and overwrite/append. LIS length = |tails|."
            },
            {
              "id": "u6l3-i3",
              "front": "How do you reconstruct a DP's actual solution?",
              "back": "Store back-pointers (which choice each state took) or back-trace the finished table from the final state to a base, reading off the transition that achieved each optimum. O(path length)."
            },
            {
              "id": "u6l3-i4",
              "front": "Knapsack reconstruction rule?",
              "back": "At dp[i][c], if it differs from dp[i-1][c], item i-1 was taken → subtract its weight and continue at dp[i-1][c-w]; else skip to dp[i-1][c]."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u6-check",
        "questions": [
          {
            "id": "u6q1",
            "type": "short",
            "prompt": "DP applies when a problem has optimal substructure and ____ subproblems (the property that makes caching pay off). One word.",
            "accept": [
              "overlapping",
              "overlapping.",
              "overlap"
            ],
            "explanation": "Overlapping subproblems — the same subproblems recur, so memoizing each once turns exponential recomputation into polynomial work."
          },
          {
            "id": "u6q2",
            "type": "numeric",
            "prompt": "A 0/1 knapsack has n = 200 items and capacity W = 10,000, with an O(1) include/exclude transition. How many DP states are evaluated? (the table cell count)",
            "answer": 2000000,
            "tolerance": 100,
            "explanation": "States = n × (W+1) ≈ 200 × 10,001 ≈ 2.0×10⁶. Time = states × O(1) transition = O(nW). Stating time as states × transition is the fundamentals signal."
          },
          {
            "id": "u6q3",
            "type": "numeric",
            "prompt": "For the O(n log n) LIS algorithm on n = 65,536 elements, how many binary-search steps does each element cost in the worst case (i.e., log_2 n)?",
            "answer": 16,
            "tolerance": 0.5,
            "explanation": "log₂(65536) = 16. Each of the n elements costs one O(log n) binary search into `tails`, so total O(n log n) — the Unit 4 trick applied to the O(n²) LIS DP."
          },
          {
            "id": "u6q4",
            "type": "mcq",
            "prompt": "'Minimum edit distance between two strings' belongs to which DP family, and what is the state?",
            "options": [
              "Linear DP; dp[i] = distance using the first i characters",
              "Interval DP; dp[i][j] over a subrange split at k",
              "Two-sequence DP; dp[i][j] = edit distance between the first i chars of A and first j chars of B",
              "Knapsack DP; dp[i][c] over items and capacity"
            ],
            "answer": 2,
            "explanation": "Transforming one sequence into another prefix-by-prefix is the two-sequence family: dp[i][j] over prefixes of both strings, with match/insert/delete/substitute transitions. O(mn)."
          },
          {
            "id": "u6q5",
            "type": "proof",
            "points": 3,
            "prompt": "Prove the edit-distance recurrence is correct: for strings A (length m) and B (length n) with dp[i][j] = the minimum number of single-character insertions, deletions, and substitutions to turn A[0..i) into B[0..j), show that dp[i][j] = dp[i−1][j−1] if A[i−1]=B[j−1], else 1 + min(dp[i−1][j], dp[i][j−1], dp[i−1][j−1]).",
            "rubric": [
              "States correct base cases dp[i][0] = i and dp[0][j] = j and justifies them (delete-all / insert-all).",
              "Argues an optimal edit sequence's LAST operation on the final characters is one of a small set (match, delete A[i−1], insert B[j−1], substitute), covering all cases.",
              "Maps each last-operation case to the correct subproblem: match/substitute → dp[i−1][j−1], delete → dp[i−1][j], insert → dp[i][j−1], with the correct +0 or +1 cost.",
              "Concludes by optimal substructure that taking the min over these cases gives the optimum, and handles the equal-characters case (no edit needed) correctly."
            ],
            "solution": "Base cases: turning A[0..i) into the empty string needs i deletions, so dp[i][0] = i; turning the empty string into B[0..j) needs j insertions, so dp[0][j] = j. For i, j ≥ 1, consider an optimal edit sequence turning A[0..i) into B[0..j) and look at how it accounts for the last characters A[i−1] and B[j−1]. Exactly one of these holds for an optimal script: (1) A[i−1] is matched to B[j−1] with no edit — possible only if A[i−1]=B[j−1] — leaving the optimal transform of A[0..i−1) into B[0..j−1), cost dp[i−1][j−1] + 0; (2) A[i−1] is substituted to B[j−1], cost dp[i−1][j−1] + 1; (3) A[i−1] is deleted, cost dp[i−1][j] + 1; (4) B[j−1] is inserted, cost dp[i][j−1] + 1. These cases are exhaustive (the last character of A is either kept-as-match, substituted, or deleted, or B's last character is inserted) and each subproblem must itself be solved optimally (optimal substructure: any cheaper sub-transform would cheapen the whole, contradicting optimality). Therefore dp[i][j] is the minimum of the applicable case costs: if A[i−1]=B[j−1], case (1) gives dp[i−1][j−1] with no edit, which is never beaten by adding a +1, so dp[i][j] = dp[i−1][j−1]; otherwise dp[i][j] = 1 + min(dp[i−1][j−1], dp[i−1][j], dp[i][j−1]). ∎",
            "explanation": "The proof is a case analysis on the last operation applied to the final characters, plus optimal substructure to justify combining subproblem optima. The match case avoids the +1 and dominates when characters are equal."
          }
        ]
      }
    },
    {
      "id": "u7",
      "title": "Coding, Testing & Communicating Under Observation",
      "summary": "Turning a verified idea into clean, correct code; deriving tests systematically; and communicating — including treating a hint as evidence to update on.",
      "references": [
        "CLRS 4e — loop invariants (initialization / maintenance / termination) for correctness",
        "Boundary-value analysis & equivalence partitioning — standard software-testing method",
        "McDowell — CTCI: writing bug-free code, testing; the value of communication in scoring"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u7l1",
          "title": "Writing Code Under Observation",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Code is the last step, and it should be boring",
              "body": "By the time you type, the idea is already verified against examples (Unit 3's pipeline). Coding under observation is then an exercise in *not* introducing bugs and in making correctness visible: clear names, small helper functions, and explicit invariants. The failure mode is coding to discover the algorithm — thrashing, rewriting, and emitting confusion signal. Verify first; then the coding is a faithful transcription you can narrate calmly."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Loop invariant",
              "statement": "A **loop invariant** is a property that holds before the loop and after every iteration; establishing it proves the loop correct via three steps (CLRS): **Initialization** — it's true before the first iteration; **Maintenance** — if true before an iteration, it's true after; **Termination** — when the loop ends, the invariant plus the exit condition imply the desired result. Writing the invariant as a comment ('at the top of iteration i, `result` holds the answer for the prefix a[0..i)') both prevents off-by-one bugs and emits correctness signal."
            },
            {
              "type": "text",
              "heading": "Where the bugs actually are",
              "body": "The recurring interview bugs are mechanical, not conceptual: **off-by-one** (≤ vs <, loop bounds, inclusive/exclusive ranges), **boundary handling** (empty input, single element, first/last iteration), **mutation aliasing** (modifying a structure you're iterating; shared state in recursion — Unit 5's make/undo), and **integer overflow** (mid = (lo+hi)/2 overflowing; use lo + (hi−lo)/2). Guard against them by stating the invariant, choosing half-open ranges [lo, hi) consistently, and dry-running the first and last iterations (Lesson 2). Naming the risk aloud ('I'll use lo + (hi−lo)/2 to avoid overflow') is fundamentals signal."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Narrate the transcription.** As you write, say what each block does and why it preserves the invariant: 'this loop keeps `left` at the start of the current window…'. Silent typing wastes the communication and correctness boxes (Unit 1). If you must think, say 'let me think about the boundary for a second' rather than going dark — a labeled pause emits more signal than silence."
            },
            {
              "type": "checklist",
              "heading": "Clean-code habits that read as seniority",
              "items": [
                "Meaningful names (left/right, not i/j when roles differ); no magic numbers.",
                "Extract a helper for any non-trivial sub-step; a 40-line function is a smell.",
                "State the loop invariant as a comment before the loop.",
                "Use half-open ranges [lo, hi) consistently to kill off-by-one errors.",
                "Handle the empty/single-element case explicitly at the top.",
                "Compute midpoints as lo + (hi − lo)/2 to avoid overflow."
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "State a loop invariant for iterative binary search over a half-open range [lo, hi) searching for target in a sorted array, and use it to justify the loop's correctness at termination.",
                  "solution": "Invariant: 'target, if present, lies in a[lo..hi) — every index outside [lo, hi) has been excluded.' Initialization: lo=0, hi=n covers the whole array, trivially true. Maintenance: at mid = lo + (hi−lo)/2, if a[mid] < target then target (if present) is in a[mid+1..hi), so set lo=mid+1 preserving the invariant; if a[mid] > target it's in a[lo..mid), set hi=mid; if equal, return mid. Termination: the loop exits when lo == hi, an empty range; by the invariant target is not present, so return 'not found.' The half-open range makes the updates (mid+1, mid) and the exit condition consistent, avoiding off-by-one.",
                  "hint": "The invariant says where a present target must still be; check it holds initially, after each branch, and at lo==hi."
                },
                {
                  "prompt": "Why is mid = (lo + hi) / 2 a latent bug, and what is the fix?",
                  "solution": "For large lo and hi (near the max integer in a fixed-width type), lo + hi can overflow and become negative or wrap, producing an out-of-range or negative mid — a bug that only manifests on large inputs and is easy to miss. The fix mid = lo + (hi − lo) / 2 computes the same value without ever forming the oversized sum, since hi − lo ≤ hi is in range. In languages with arbitrary-precision integers (e.g. Python) it doesn't overflow, but stating the safe form still signals awareness of the classic defect.",
                  "hint": "What can lo + hi do near the integer maximum?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u7l1-i1",
              "front": "The three steps that prove a loop invariant?",
              "back": "Initialization (true before the loop), Maintenance (preserved by each iteration), Termination (invariant + exit condition imply the result). Write it as a comment."
            },
            {
              "id": "u7l1-i2",
              "front": "The four recurring interview bug classes?",
              "back": "Off-by-one (bounds, ≤ vs <), boundary cases (empty/single/first/last), mutation aliasing (modifying while iterating; recursion shared state), integer overflow."
            },
            {
              "id": "u7l1-i3",
              "front": "Overflow-safe midpoint?",
              "back": "mid = lo + (hi − lo)/2, not (lo + hi)/2 — the latter can overflow near the integer max on large ranges."
            },
            {
              "id": "u7l1-i4",
              "front": "Why verify the idea before coding?",
              "back": "Coding to discover the algorithm causes thrashing and emits confusion signal; a verified idea makes coding a calm, narratable transcription that fills the correctness box."
            }
          ]
        },
        {
          "id": "u7l2",
          "title": "Systematic Test Derivation",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "Testing is a method, and it scores",
              "body": "Testing your own code unprompted is a top correctness signal and catches the bugs that sink otherwise-correct solutions. But 'let me test it' means running a *systematic* set of cases derived from the input domain — not one happy-path example. Two classical techniques generate that set: **equivalence partitioning** (group inputs that the code treats the same, test one per group) and **boundary-value analysis** (test the edges of each group, where off-by-one and overflow bugs live)."
            },
            {
              "type": "checklist",
              "heading": "The edge-case catalog (derive tests from the input domain)",
              "items": [
                "Empty input (0 elements) and single element (1) — the most common crash cases.",
                "Two elements — the smallest case where order/pairs matter.",
                "All duplicates / all identical values.",
                "Already sorted and reverse sorted (for anything order-sensitive).",
                "Boundaries: minimum/maximum values, first and last index, target smaller/larger than everything.",
                "Overflow-prone sizes and value ranges (large sums, negative numbers).",
                "The 'no valid answer' / not-found case, and multiple valid answers (ties)."
              ]
            },
            {
              "type": "example",
              "heading": "Deriving tests for 'binary search returns an index or −1'",
              "body": "Equivalence groups: target present (once / multiple times), target absent (smaller than all / larger than all / in a gap). Boundaries: first element, last element, empty array, single-element array (present and absent). A systematic set: [] target 5 → −1; [3] target 3 → 0; [3] target 4 → −1; [1,3,5] target 1 → 0 (first); target 5 → 2 (last); target 4 → −1 (gap); target 0 → −1 (below); target 9 → −1 (above); [2,2,2] target 2 → any valid index (ties). Running this out loud finds off-by-one and empty-input bugs before the interviewer does — and demonstrates the *method*, which is itself the signal."
            },
            {
              "type": "text",
              "heading": "Dry-running: be the CPU",
              "body": "For the two or three most informative cases (usually an edge and one general case), *trace the code line by line*, tracking each variable's value, out loud. This is where you actually catch bugs — reading code rarely reveals an off-by-one, but watching `left` and `right` update through a two-element array does. When you find a bug mid-trace, say what it is and fix it: finding and fixing your own bug scores *higher* than never appearing to have one, because it demonstrates the debugging skill the job needs."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't declare victory at the first passing example.** A single happy-path run tests one equivalence class and no boundaries — it's the illusion of testing. The bugs are at the edges (empty, single, boundary, overflow), so a test that skips them provides false confidence and misses exactly what the correctness rubric is checking."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You wrote a function that returns the maximum subarray sum. Derive a systematic test set using equivalence partitioning and boundary analysis, and name the bug each unusual case targets.",
                  "solution": "Groups & boundaries: empty array (define behavior — 0 or error; targets unhandled-empty crash); single element (both positive and negative — targets 'assumed non-empty' and 'assumed a positive answer exists'); all negatives, e.g. [−3,−1,−2] → −1 (targets the classic bug of initializing max to 0 and returning 0 instead of the least-negative element); all positives → total sum (general case); mixed with the max spanning the middle, e.g. [−2,1,−3,4,−1,2,1,−5,4] → 6 (general Kadane case); large values (overflow of the running sum). Each unusual case pins a specific defect: empty→crash, single→boundary, all-negative→wrong initialization, large→overflow.",
                  "hint": "Partition by sign pattern and size; the all-negative case is the famous one."
                },
                {
                  "prompt": "Why does finding and fixing your own bug during a dry-run often score better than a solution that happened to be bug-free but was never tested?",
                  "solution": "The correctness rubric values the *debugging process*, not just the artifact. A candidate who traces, spots an off-by-one, states it, and fixes it demonstrates exactly the skill the job requires daily; the interviewer sees observable evidence of correctness discipline. An untested (even if correct) solution leaves that box only weakly filled — the interviewer can't distinguish 'careful' from 'lucky.' Emitting the debugging signal is worth more than the appearance of never erring.",
                  "hint": "What does the interviewer actually get to observe and score in each case?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u7l2-i1",
              "front": "Two classical test-derivation techniques?",
              "back": "Equivalence partitioning (group inputs treated the same, test one each) + boundary-value analysis (test the edges of each group, where off-by-one/overflow bugs live)."
            },
            {
              "id": "u7l2-i2",
              "front": "Core edge cases to always test?",
              "back": "Empty, single element, two elements, all duplicates, sorted/reverse, min/max boundaries, overflow ranges, no-valid-answer and ties."
            },
            {
              "id": "u7l2-i3",
              "front": "What is dry-running and why do it?",
              "back": "Trace the code line by line tracking each variable on an edge + a general case, out loud. Reading rarely catches off-by-one; watching pointers update through a 2-element case does."
            },
            {
              "id": "u7l2-i4",
              "front": "Why is finding your own bug good?",
              "back": "It demonstrates debugging skill (observable correctness signal), which scores higher than an untested solution the interviewer can't tell is careful vs lucky."
            }
          ]
        },
        {
          "id": "u7l3",
          "title": "Communicating & Handling Hints",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Thinking aloud is signal emission",
              "body": "Unit 1 established that the interviewer scores S = θ + ε, the *observed* signal. Thinking aloud is the act of converting your private competence θ into observable S. It is not decoration; it is the mechanism by which problem-solving, fundamentals, and communication get scored at all. Narrate your approach before coding, your trade-offs as you choose, and your complexity as you finish. The goal is that a transcript of your words alone would let the interviewer fill every rubric box."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "A hint is evidence — update on it",
              "statement": "A hint is information the interviewer injects to steer you toward the intended solution. The rational response is a **Bayesian update**: treat the hint as new evidence that shifts your posterior over the right approach, and *visibly incorporate it*. Ignoring or resisting a hint is a strong negative signal (it reads as uncoachable and is the single most damaging behavior); mechanically obeying a hint you don't understand is a weak signal (it shows no reasoning). The strong move: acknowledge the hint, state what it changes ('so you're suggesting the data is sorted — then I can binary search instead of scan'), and integrate it into your reasoning."
            },
            {
              "type": "decision",
              "heading": "Responding to interviewer signals",
              "rows": [
                [
                  "A hint or nudge ('what if the array were sorted?')",
                  "Update immediately and out loud: say what it changes and why"
                ],
                [
                  "Repeated hints on the same point",
                  "You're missing something — slow down and reason from the hint, don't push your original path"
                ],
                [
                  "A clarifying question back at you",
                  "Answer directly, then continue — don't spiral"
                ],
                [
                  "Silence after you propose an approach",
                  "Often assent; proceed, but invite correction ('I'll go with X unless you see an issue')"
                ],
                [
                  "You realize your approach is a dead end",
                  "Say so, state why, and fall back a pipeline stage — abandoning a wrong path is maturity, not failure"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "When to abandon a path",
              "body": "Sticking with a failing approach out of sunk cost is a common, costly error (the same discipline agents need — cross-link the AI-agents material on abandoning a losing trajectory). Set an internal budget: if a few minutes of pushing an approach isn't converging, name it and retreat. 'This greedy idea keeps hitting counterexamples; let me step back to the brute force and look for a different bottleneck.' Announcing the pivot is *positive* signal — it shows you evaluate your own progress and don't waste the round defending a wrong idea. The pipeline (Unit 3) gives you a concrete place to retreat *to*: drop back a stage."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Resisting a correct hint is often fatal to the loop.** Interviewers offer hints partly to test coachability — how you take input is a direct proxy for how you'll work on a team. Dismissing a hint, arguing over it, or ploughing ahead on your original path signals exactly the trait teams most want to avoid. Even if you think you're right, engage with the hint's content first; then, if you still disagree, disagree with reasons (next)."
            },
            {
              "type": "text",
              "heading": "Disagreeing well",
              "body": "Sometimes you *are* right and the interviewer is probing whether you'll cave or defend with reasoning. The move is neither capitulation nor stubbornness: engage the objection on its merits, restate your reasoning concretely, and offer to test the disputed case. 'I believe O(n) is correct here because each element is pushed and popped once — let me trace a worst case to check.' This demonstrates conviction backed by evidence (a senior trait) rather than ego. Disagreeing well and taking hints well are the same skill: respond to the *content*, not the fact of being challenged."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Mid-problem the interviewer asks, 'Does the input have any special structure you could exploit?' You'd been writing an O(n²) scan. What does this signal and what is the ideal response?",
                  "solution": "It is a hint that a property (likely sortedness, monotonicity, or bounded values) enables a faster approach — the interviewer is nudging you off the brute force. Ideal response: treat it as evidence and update out loud — 'Good point — if the array is sorted, I can use two pointers or binary search instead of the O(n²) scan; let me confirm it's sorted and switch.' This shows coachability (updating on the hint) and problem-solving (connecting the structure to a technique). Ignoring it and continuing the O(n²) scan would be the damaging move.",
                  "hint": "The question is a hint about exploitable structure — update, name the technique it unlocks, and pivot."
                },
                {
                  "prompt": "You've spent several minutes on a greedy approach that keeps failing counterexamples. Contrast the sunk-cost response with the mature response, and say why the mature one scores better.",
                  "solution": "Sunk-cost: keep patching the greedy to handle each new counterexample, defending it because you've invested time — burning the round and signaling poor self-assessment. Mature: explicitly name the failure ('greedy keeps breaking on these cases, which suggests it's not globally optimal here'), retreat a pipeline stage to the brute force, and look for a different structure (often DP once greedy fails). It scores better because evaluating your own progress and abandoning a dead end is exactly the engineering judgment the rubric rewards; interviewers see the pivot as maturity, and it frees time to reach a correct solution.",
                  "hint": "What does continuing to defend a failing idea signal versus naming it and retreating?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u7l3-i1",
              "front": "Why is thinking aloud essential (not optional)?",
              "back": "It converts private competence θ into the observed signal S the interviewer actually scores; without it, problem-solving/fundamentals/communication go unobserved and score as gaps."
            },
            {
              "id": "u7l3-i2",
              "front": "The rational way to handle a hint?",
              "back": "Treat it as evidence and update visibly: acknowledge it, state what it changes, integrate it. Ignoring/resisting a hint is the most damaging signal (uncoachable)."
            },
            {
              "id": "u7l3-i3",
              "front": "When and how to abandon an approach?",
              "back": "If pushing it for a few minutes isn't converging, name it and retreat a pipeline stage. Announcing the pivot is positive signal — self-evaluation, not failure."
            },
            {
              "id": "u7l3-i4",
              "front": "How to disagree with an interviewer well?",
              "back": "Engage the objection's content, restate your reasoning concretely, and offer to test the disputed case — conviction backed by evidence, neither caving nor stubborn ego."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u7-check",
        "questions": [
          {
            "id": "u7q1",
            "type": "short",
            "prompt": "Name the overflow-safe way to compute a midpoint between lo and hi (write the expression).",
            "accept": [
              "lo + (hi - lo)/2",
              "lo + (hi - lo) / 2",
              "lo+(hi-lo)/2",
              "lo + (hi-lo)/2",
              "low + (high - low)/2"
            ],
            "explanation": "mid = lo + (hi − lo)/2 avoids the overflow of (lo + hi)/2 near the integer maximum, while computing the same midpoint."
          },
          {
            "id": "u7q2",
            "type": "short",
            "prompt": "Testing technique: choosing inputs at the EDGES of each input group (first/last index, empty, min/max) is called ____ analysis. (one word for the blank before 'analysis')",
            "accept": [
              "boundary",
              "boundary-value",
              "boundary value",
              "boundary."
            ],
            "explanation": "Boundary-value analysis — the edges of equivalence groups are where off-by-one and overflow bugs concentrate, so they're the highest-value tests."
          },
          {
            "id": "u7q3",
            "type": "mcq",
            "prompt": "You've written an O(n²) scan. The interviewer asks, 'What if the array were sorted?' The best response is:",
            "options": [
              "Politely note you'll stick with your working O(n²) solution to save time",
              "Immediately switch to binary search / two pointers without explanation",
              "Recognize the hint, say what sortedness unlocks (two pointers / binary search), and pivot while explaining why",
              "Ask the interviewer to just tell you the optimal solution"
            ],
            "answer": 2,
            "explanation": "A hint is evidence to update on. Acknowledging it, naming the technique it unlocks, and pivoting with explanation shows coachability AND problem-solving. Ignoring it (option 1) is the most damaging signal; silently switching (2) shows no reasoning."
          },
          {
            "id": "u7q4",
            "type": "mcq",
            "prompt": "Which behavior most improves your CORRECTNESS score in a coding round?",
            "options": [
              "Running one happy-path example and declaring it works",
              "Systematically dry-running an edge case and a general case, finding and fixing a bug in the process",
              "Writing the shortest possible code with clever one-liners",
              "Avoiding comments to keep the code compact"
            ],
            "answer": 1,
            "explanation": "Systematic testing (edge + general), plus visibly finding and fixing a bug, is the correctness signal the rubric rewards — it demonstrates debugging discipline. One happy-path run tests one class and no boundaries; terseness and no comments hurt readability."
          },
          {
            "id": "u7q5",
            "type": "open",
            "points": 3,
            "prompt": "You're 25 minutes into a 40-minute coding round. Your greedy approach just failed a third counterexample the interviewer supplied, and you feel the sunk-cost pull to keep patching it. Describe exactly what you should do and say for the rest of the round, and justify each move using this unit's and the course's concepts.",
            "rubric": [
              "Explicitly abandons the failing greedy rather than patching it, and names WHY (repeated counterexamples signal it isn't globally optimal) — invoking the abandon-a-dead-path / sunk-cost idea.",
              "Retreats to a concrete fallback (a pipeline stage from Unit 3, e.g. restate the brute force / look for a new bottleneck) and reasons toward the likely correct family (often DP once greedy fails).",
              "Keeps emitting signal throughout — narrates the pivot out loud (converting θ into observed S) and treats the interviewer's counterexamples as evidence/hints to update on.",
              "Manages the remaining time realistically (banks a correct brute force for partial credit if time is short; states complexity) rather than gambling the whole round.",
              "Specific and sequenced, not generic 'stay calm' advice."
            ],
            "solution": "First, stop patching and say so: 'The greedy keeps failing these cases, which tells me it isn't globally optimal — let me step back rather than keep special-casing it.' Abandoning a repeatedly-falsified path is engineering judgment, not failure, and it frees the remaining ~15 minutes. Retreat a pipeline stage (Unit 3): restate the brute force out loud to re-bank a correct-but-slow solution (partial-credit insurance) and re-examine the bottleneck; the fact that greedy failed is itself evidence the problem likely needs DP (explore optimal substructure — can I define a subproblem?). Throughout, keep narrating — the interviewer scores observed signal, so my reasoning about *why* greedy fails and *how* I'm choosing the next approach is what fills the problem-solving box — and treat each counterexample they gave as a hint pinning down the structure (update on it: 'this case shows a locally-best choice hurts later, which is the hallmark of needing DP'). On time: if DP looks reachable, pursue it while stating its state and complexity; if the clock is tight, code the brute force cleanly so I leave a correct, tested solution and state the DP direction I'd take with more time. The worst move — the sunk-cost patching — would burn the round and signal poor self-assessment; the pivot signals maturity.",
            "explanation": "The unit's synthesis: abandon the dead path (don't sunk-cost), retreat to a pipeline fallback, read the counterexamples as evidence pointing at DP, keep emitting signal, and manage time to leave a correct tested solution. A strong answer is a concrete sequence tied to these concepts."
          }
        ]
      }
    },
    {
      "id": "u8",
      "title": "Estimation & Requirements",
      "summary": "Driving a system-design round: pin the requirements, then turn scale into arithmetic — QPS, storage, bandwidth, concurrency (Little's Law), and the latency numbers.",
      "references": [
        "Kleppmann — Designing Data-Intensive Applications: describing load, back-of-envelope reasoning (cross-links the `cloud` course, Scalability unit)",
        "Alex Xu — System Design Interview vol. 1: the framework & back-of-envelope estimation",
        "Jeff Dean — 'Latency numbers every programmer should know'; Little's Law (L = λW)"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u8l1",
          "title": "Requirements & Scoping",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "You are expected to drive the scope",
              "body": "A system-design prompt ('design Instagram') is deliberately under-specified. The interviewer is testing whether you *scope* — narrow a vast problem to a concrete, buildable system — rather than sprawl. The first 5 minutes are requirements: agree on what you're building and, crucially, the non-functional numbers that will drive every later decision. Skipping this and diving into boxes-and-arrows is the classic system-design failure: you design for the wrong scale and wrong properties."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Functional vs non-functional requirements",
              "statement": "**Functional requirements** are what the system *does* — the features and their behavior ('users post photos; followers see them in a feed'). **Non-functional requirements** are the qualities it must have under load — *scale* (users, QPS, data volume), *latency* targets, *availability* target, *consistency* needs, durability, and cost. Functional requirements shape the API and data model; non-functional requirements decide the architecture (caching, sharding, replication, sync vs async). The non-functional numbers are what let you *quantify* the design, so extract them explicitly."
            },
            {
              "type": "checklist",
              "heading": "The requirements checklist (first 5 minutes)",
              "items": [
                "Core features — pick 2–3 to design deeply; explicitly defer the rest ('let's focus on posting and the feed, and skip DMs').",
                "Scale — DAU/MAU, and the per-user action rates that set QPS.",
                "Read/write ratio — is it read-heavy (feed, search) or write-heavy (logging, IoT)? This drives caching vs partitioning.",
                "Latency targets — p99 for the interactive path (feed load < 200 ms?).",
                "Consistency — does the use case tolerate eventual consistency (a like count) or need strong (a bank balance)? (cross-link CAP, cloud course).",
                "Availability & durability targets — 99.9% vs 99.99%? Can data ever be lost?",
                "Constraints — global vs single-region, mobile clients, cost sensitivity."
              ]
            },
            {
              "type": "text",
              "heading": "Read-heavy vs write-heavy changes everything",
              "body": "The single most design-shaping question is the read/write ratio. A **read-heavy** system (social feed, ~100:1 reads:writes) is optimized with caching, read replicas, CDNs, and precomputation (fan-out on write). A **write-heavy** system (metrics ingestion, ~1:100) is optimized with partitioning, write-optimized stores (LSM-trees), batching, and queues to absorb bursts. Getting this ratio early tells you which half of the design toolkit to reach for — so ask it before drawing anything."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Scope down, out loud, on purpose.** 'Design YouTube' in 40 minutes means picking a slice (upload + playback, say) and stating what you're deferring (recommendations, comments, monetization). Trying to cover everything guarantees a shallow, unquantified design. Narrowing scope is a positive signal — it shows judgment about what matters — not a cop-out."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For 'design a URL shortener,' list two functional and three non-functional requirements you would establish, and note which non-functional one most shapes the architecture.",
                  "solution": "Functional: (1) create a short code for a long URL; (2) redirect a short code to its long URL (plus maybe custom aliases, expiry, analytics — deferred). Non-functional: (1) very read-heavy (redirects ≫ creations, often 100:1+); (2) low-latency redirect (p99 < ~50 ms — it's on the critical path of every click); (3) high availability (a dead shortener breaks every link) and effectively permanent durability. The read-heavy ratio most shapes the architecture: it pushes toward heavy caching / CDN of the code→URL mapping and read replicas, with creation being comparatively cheap.",
                  "hint": "Which requirement decides whether you reach for caches/replicas vs partitioning?"
                },
                {
                  "prompt": "Why is establishing the consistency requirement early more important than choosing a specific database?",
                  "solution": "The consistency requirement determines which databases and replication strategies are even admissible, so it must precede the technology choice. If eventual consistency is acceptable (a like count, a feed), you can use asynchronous replication, caching, and AP-leaning stores for availability and scale; if strong consistency is required (account balance, inventory), you need synchronous replication / consensus / transactions, accepting the CAP trade-off (availability or latency cost under partition — cloud course). Picking a database before knowing the consistency need risks choosing one that can't satisfy the requirement, or over-paying for consistency you don't need.",
                  "hint": "The consistency need constrains the set of valid databases and replication schemes — order matters."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u8l1-i1",
              "front": "Functional vs non-functional requirements?",
              "back": "Functional = what it does (features/behavior → API & data model). Non-functional = qualities under load (scale, latency, availability, consistency, cost → architecture)."
            },
            {
              "id": "u8l1-i2",
              "front": "The most design-shaping requirement question?",
              "back": "The read/write ratio. Read-heavy → caching, replicas, CDN, precompute. Write-heavy → partitioning, write-optimized stores, batching, queues."
            },
            {
              "id": "u8l1-i3",
              "front": "Why scope down explicitly?",
              "back": "The prompt is deliberately vast; picking 2–3 features to design deeply (and stating what you defer) shows judgment and lets you quantify — sprawl yields a shallow design."
            },
            {
              "id": "u8l1-i4",
              "front": "Why establish consistency needs before picking a DB?",
              "back": "The consistency requirement constrains which DBs/replication are valid (eventual → AP/async; strong → consensus/txns with CAP cost). Tech choice must follow the requirement."
            }
          ]
        },
        {
          "id": "u8l2",
          "title": "Back-of-the-Envelope Capacity Estimation",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Turn scale into numbers before you draw boxes",
              "body": "Estimation is the quantitative spine of system design and the fastest way to earn fundamentals signal. From a few inputs (DAU, actions per user, object sizes) you derive QPS, storage, bandwidth, and concurrency — and those numbers decide the architecture (one machine or a thousand? cache or not? shard or not?). The goal is order-of-magnitude correctness, not precision; round aggressively and show the arithmetic."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "QPS from usage",
              "statement": "Average queries per second for an action is\n\n  QPS_avg = (DAU × actions_per_user_per_day) / 86,400,\n\nsince a day has 86,400 s (round to ~10⁵). Traffic is not uniform, so size for **peak**:\n\n  QPS_peak = QPS_avg × peak_factor,   peak_factor ≈ 2–10 (often ~3).\n\nProvision for peak (plus headroom); the average only sets steady-state cost."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Storage, bandwidth, and concurrency",
              "statement": "**Storage growth:** bytes_per_day = write_QPS_avg × 86,400 × avg_object_size × replication_factor; multiply by retention (days) for the footprint. **Bandwidth:** throughput = QPS × payload_size (ingress for writes, egress for reads). **Concurrency (Little's Law):** the average number of requests in flight is\n\n  L = λ × W,\n\nwhere λ is arrival rate (QPS) and W is average time-in-system (latency). L sizes connection pools, threads, and in-flight buffers — e.g. 10,000 QPS × 50 ms = 500 concurrent requests. (Little's Law is derived in the `cloud` course.)"
            },
            {
              "type": "example",
              "heading": "Worked: a photo-sharing service",
              "body": "Inputs: 100 M DAU; each uploads ~2 photos/day; average photo 1.5 MB; reads (views) outnumber uploads ~100:1; keep photos ~5 years; replication 3×.\n\n**Upload QPS:** 100M × 2 / 86,400 ≈ 2.3M/86,400 ≈ **~2,300 QPS** avg; peak ×3 ≈ **~7,000 QPS**.\n**Read QPS:** 100:1 → ~230,000 QPS avg; peak ≈ **~700,000 QPS** — clearly needs a CDN + caching, not a database read per view.\n**Storage/day:** 200M photos × 1.5 MB × 3 (replication) ≈ **~900 TB/day**. Over 5 years ≈ 900 TB × 365 × 5 ≈ **~1.6 EB** — object storage, sharded; never a single DB.\n**Read bandwidth:** 230,000 QPS × 1.5 MB ≈ **~345 GB/s** egress — a CDN is mandatory; origin servers can't serve that.\n**Concurrency (uploads):** L = 7,000 QPS × 0.2 s ≈ **1,400** concurrent uploads in flight.\n\nEvery one of these numbers dictates a design choice: the read QPS and bandwidth force a CDN; the storage forces object stores + sharding; the write QPS is modest enough for a partitioned write path with a queue. The estimation *is* the argument for the architecture."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Round to powers of ten and keep units explicit.** 86,400 → ~10⁵; a day ≈ 10⁵ s; a month ≈ 2.5×10⁶ s; 1 KB×1 M = 1 GB; 1 KB×1 B = 1 TB. Carry units through every step (QPS × bytes = bytes/s) so a slipped factor of 1000 is caught. Interviewers grade the *method and the order of magnitude*, not the third significant figure."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A chat app has 50 M DAU sending 40 messages/day, each ~200 bytes, stored for 1 year with 3× replication. Estimate average write QPS and the yearly storage footprint.",
                  "solution": "Messages/day = 50M × 40 = 2×10⁹. Write QPS_avg = 2×10⁹ / 86,400 ≈ 2.3×10⁴ ≈ ~23,000 QPS (peak ×3 ≈ ~70,000). Storage/day = 2×10⁹ × 200 B × 3 = 1.2×10¹² B = 1.2 TB/day. Over a year: 1.2 TB × 365 ≈ ~440 TB. So a partitioned/sharded store sized for tens of thousands of writes/sec and ~half a petabyte/year — the numbers immediately rule out a single node and point at horizontal partitioning by user/conversation.",
                  "hint": "QPS = messages/day ÷ 86,400; storage = messages/day × size × replication × retention."
                },
                {
                  "prompt": "A service handles 20,000 QPS with an average request latency of 25 ms. Use Little's Law to find the average number of concurrent in-flight requests, and say what it sizes.",
                  "solution": "L = λ × W = 20,000 /s × 0.025 s = 500 concurrent requests in flight on average. This sizes the concurrency the system must support at once: thread-pool / worker count, open connection slots, and in-flight buffers. If each worker handles one request, you need on the order of 500 workers (plus headroom for peak and latency spikes) — and if latency rises to 100 ms at peak, L jumps to 2,000, showing why tail latency drives resource needs (cross-link tail-at-scale, cloud course).",
                  "hint": "Little's Law L = λW with λ = QPS and W = latency in seconds."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u8l2-i1",
              "front": "Average QPS from usage?",
              "back": "QPS_avg = DAU × actions_per_user_per_day / 86,400 (~10⁵ s/day). Size for peak = avg × peak_factor (≈2–10, often 3)."
            },
            {
              "id": "u8l2-i2",
              "front": "Storage-footprint estimate?",
              "back": "bytes/day = write_QPS × 86,400 × object_size × replication; × retention_days for the footprint. Bandwidth = QPS × payload."
            },
            {
              "id": "u8l2-i3",
              "front": "Little's Law and what it sizes?",
              "back": "L = λ × W (concurrency = arrival rate × time-in-system). Sizes thread pools, connections, in-flight buffers. E.g. 10k QPS × 50 ms = 500 in flight."
            },
            {
              "id": "u8l2-i4",
              "front": "How do estimates drive the design?",
              "back": "Read QPS/bandwidth → CDN + cache; storage volume → object store + sharding; concurrency → pool sizing. The arithmetic IS the argument for the architecture."
            }
          ]
        },
        {
          "id": "u8l3",
          "title": "The Latency Numbers & Reading the Estimates",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "Order-of-magnitude latency is a design tool",
              "body": "You can't reason about where time goes without knowing the relative cost of operations. The 'latency numbers every programmer should know' span ~9 orders of magnitude, from a nanosecond CPU-cache hit to a ~150 ms cross-continent round trip. Memorize them to one significant figure; they tell you what to cache, what to keep local, and why a chatty cross-region call is fatal to a latency budget."
            },
            {
              "type": "decision",
              "heading": "Latency numbers (order of magnitude)",
              "rows": [
                [
                  "L1 / L2 cache reference",
                  "~1 ns / ~4 ns"
                ],
                [
                  "Main memory (RAM) reference",
                  "~100 ns (0.1 µs)"
                ],
                [
                  "Read 1 MB sequentially from RAM",
                  "~10–25 µs"
                ],
                [
                  "SSD random read",
                  "~16–100 µs"
                ],
                [
                  "Round trip within a datacenter",
                  "~0.5 ms"
                ],
                [
                  "Read 1 MB from SSD / over 1 Gbps network",
                  "~1 ms / ~10 ms"
                ],
                [
                  "Disk (HDD) seek",
                  "~5–10 ms"
                ],
                [
                  "Round trip across continents (e.g. CA↔Netherlands)",
                  "~150 ms"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "What the numbers dictate",
              "body": "The gaps are the lesson: RAM is ~1000× faster than SSD, which is ~100× faster than a cross-DC hop, which is ~300× faster than a cross-continent round trip. Consequences you can state as design moves: (1) **cache in RAM** anything read often — a memory hit (~100 ns) versus a database/disk read (~ms) is a 10,000× win; (2) **avoid cross-region round trips on the critical path** — a single 150 ms hop blows a 200 ms p99 budget, so replicate data near users; (3) **batch and avoid chatty calls** — N sequential round trips cost N × RTT, so one call returning N items beats N calls (this is why N+1 query patterns are killers); (4) **sequential ≫ random** for disk — design for sequential access (log-structured writes)."
            },
            {
              "type": "example",
              "heading": "Reading an estimate into a decision",
              "body": "Suppose your feed endpoint must return in < 200 ms p99 and assembling a feed touches 10 pieces of data. If each is a separate cross-service call at ~1 ms in-DC, that's ~10 ms — fine. But if the data lives in another region at ~150 ms RTT and you make them sequentially, that's 1,500 ms — a 7× budget violation from network alone. The numbers force the design: co-locate/replicate the feed data in-region, precompute the feed (fan-out on write) so a read is one cache hit (~sub-ms) instead of 10 gathers, and never make the hot path cross a continent. The estimate didn't just size hardware — it rejected an entire architecture."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Tie every design choice back to a number.** 'I'll add a Redis cache' is weak; 'reads are ~230k QPS and a DB read is ~1 ms while a cache hit is ~100 µs, so I cache the hot 20% in RAM to keep the feed under the 200 ms p99 and take load off the DB' is the fundamentals signal that separates levels. The estimation from Lesson 2 plus these latency numbers is what makes a design *justified* rather than pattern-matched."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An API assembles a response from 20 downstream items. Compare doing 20 sequential in-datacenter calls vs 20 sequential cross-continent calls, and state the design fix.",
                  "solution": "In-DC: ~20 × 0.5 ms = ~10 ms — acceptable. Cross-continent: ~20 × 150 ms = ~3,000 ms — catastrophic, and it blows any interactive latency budget by an order of magnitude. Fixes: (1) never make the critical path cross continents — replicate the needed data in-region so calls are in-DC; (2) collapse the 20 calls into one batched call (or precompute/denormalize the assembled response) so you pay one round trip, not twenty (avoid the N+1 pattern). The latency numbers make cross-region chattiness an immediate reject.",
                  "hint": "Multiply the per-call RTT by 20 for each location; then reduce either the RTT or the number of calls."
                },
                {
                  "prompt": "Reads are 300,000 QPS. A database read costs ~1 ms and can do ~10,000 reads/sec per node; a RAM cache hit costs ~100 µs. Justify a caching layer with numbers, including how many DB nodes you'd avoid if the cache serves 90% of reads.",
                  "solution": "Without a cache, 300,000 QPS ÷ 10,000 reads/sec/node = 30 DB nodes just for reads (before headroom) — expensive and a scaling liability. A cache serving 90% of reads leaves 30,000 QPS to the DB = 3 nodes, a 10× reduction, while cache hits (~100 µs) are ~10× faster than DB reads (~1 ms), improving p99 too. So the cache is justified on both cost (27 fewer DB nodes) and latency (10× faster on the 90% hot path). This is the quantified version of 'add a cache.'",
                  "hint": "Divide QPS by per-node capacity for node count; recompute after the cache absorbs 90%."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u8l3-i1",
              "front": "Rough latency ladder (order of magnitude)?",
              "back": "RAM ~100 ns; SSD read ~10–100 µs; in-DC round trip ~0.5 ms; disk seek ~10 ms; cross-continent RTT ~150 ms. Each gap is ~100–1000×."
            },
            {
              "id": "u8l3-i2",
              "front": "Four design moves the latency numbers dictate?",
              "back": "Cache hot data in RAM (10,000× vs disk); avoid cross-region hops on the hot path (150 ms blows budgets); batch to avoid N round trips (kill N+1); prefer sequential disk access."
            },
            {
              "id": "u8l3-i3",
              "front": "Why is a cross-continent round trip design-critical?",
              "back": "~150 ms per hop — one hop can blow a 200 ms p99 budget, and N sequential hops cost N×150 ms. Replicate data near users; never make the hot path cross continents."
            },
            {
              "id": "u8l3-i4",
              "front": "How should you justify a cache in an interview?",
              "back": "With numbers: read QPS ÷ per-node capacity = nodes saved; cache hit (~100 µs) vs DB read (~1 ms) = ~10× latency win on the hot path. Not 'add Redis,' but the quantified reason."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u8-check",
        "questions": [
          {
            "id": "u8q1",
            "type": "numeric",
            "prompt": "A service has 40 million DAU, each performing 5 write actions per day. Estimate the average write QPS (nearest thousand).",
            "answer": 2315,
            "tolerance": 300,
            "explanation": "40M × 5 = 2×10⁸ writes/day ÷ 86,400 ≈ 2,315 QPS average. Size for peak (×3 ≈ ~7,000). Rounding 86,400 → 10⁵ gives ~2,000, the right order of magnitude."
          },
          {
            "id": "u8q2",
            "type": "numeric",
            "prompt": "Using Little's Law, how many requests are in flight on average at 8,000 QPS with an average latency of 40 ms?",
            "answer": 320,
            "tolerance": 10,
            "explanation": "L = λ × W = 8,000 × 0.040 = 320 concurrent requests. This sizes worker/thread pools and connection slots; if latency triples at peak, so does L."
          },
          {
            "id": "u8q3",
            "type": "numeric",
            "prompt": "200 million photos/day are stored, each 1.5 MB, with 3× replication. How many terabytes of storage does ONE day add? (nearest hundred TB)",
            "answer": 900,
            "tolerance": 100,
            "explanation": "200M × 1.5 MB × 3 = 9×10⁸ MB = 9×10⁵ GB = 900 TB/day. Over years this reaches exabytes — object storage + sharding, never a single DB."
          },
          {
            "id": "u8q4",
            "type": "short",
            "prompt": "Roughly how many milliseconds is a single cross-continent network round trip (order of magnitude, a number)?",
            "accept": [
              "150",
              "100",
              "150 ms",
              "100 ms",
              "~150",
              "100-150",
              "150ms"
            ],
            "explanation": "~150 ms (order of magnitude ~100 ms). One such hop can blow a 200 ms p99 budget, so critical paths must not cross continents — replicate near users."
          },
          {
            "id": "u8q5",
            "type": "open",
            "points": 3,
            "prompt": "You're asked to design a news feed for 200 M DAU. Before drawing any architecture, walk through the requirements and back-of-envelope estimates you'd establish, and show how at least three of those numbers force specific architectural choices.",
            "rubric": [
              "Separates functional (post, follow, view feed) from non-functional and explicitly scopes down to a deep slice; identifies the read/write ratio as read-heavy.",
              "Estimates the key numbers with visible arithmetic — read QPS and write QPS from DAU × actions / 86,400, storage growth, and read bandwidth — rounding to orders of magnitude.",
              "Derives at least THREE architectural forcings from the numbers: e.g. huge read QPS/bandwidth → CDN + caching + read replicas; feed assembly cost + latency budget → precompute/fan-out-on-write; storage volume → sharding/object store; concurrency (Little's Law) → pool sizing.",
              "Ties choices to latency numbers and a stated p99 budget (e.g. avoid cross-region hops, cache in RAM) rather than pattern-matching technologies.",
              "Quantitative and internally consistent — the design follows from the estimates, not from buzzwords."
            ],
            "solution": "Requirements: functional — post, follow, and load a home feed (scope down; defer DMs, notifications, ranking-ML). Non-functional — read-heavy (~100:1 views:posts), p99 feed load < ~200 ms, high availability, eventual consistency acceptable for feed contents. Estimates: with 200 M DAU, say 2 posts/user/day → write QPS = 4×10⁸/86,400 ≈ ~4,600 (peak ~14k); feed opens maybe 10/user/day → read QPS = 2×10⁹/86,400 ≈ ~23,000 avg, peak ~70,000 — and each feed read gathers ~100 items. Bandwidth and read QPS are the dominant terms. Forcings: (1) ~70k peak read QPS, each assembling 100 posts, cannot hit the DB per view — cache the feed and post metadata in RAM (a cache hit ~100 µs vs DB ~1 ms) and serve media via CDN; (2) the 200 ms p99 budget with 100-item assembly forbids gathering at read time across services (10–100 in-DC calls, worse cross-region), so precompute each user's feed on write (fan-out on write) into a per-user cache, turning a read into one lookup — accepting the write-amplification trade-off, and handling celebrity fan-out as a hybrid pull; (3) storage of posts + per-user feed lists over years → shard by user id and store media in an object store, not a single DB; (4) concurrency by Little's Law at 70k QPS × ~50 ms ≈ 3,500 in-flight, sizing the serving pools. Only after these numbers would I draw the boxes; each choice traces to a specific estimate rather than a named technology.",
            "explanation": "The unit's synthesis: scope + read/write ratio, then QPS/storage/bandwidth/concurrency arithmetic, then let those numbers (plus the latency ladder and a p99 budget) force CDN/cache, fan-out-on-write, sharding, and pool sizing. Strong answers quantify before architecting."
          }
        ]
      }
    },
    {
      "id": "u9",
      "title": "The Design Procedure & Tradeoff Catalog",
      "summary": "A repeatable procedure for the design round, plus the storage and delivery trade-offs — each as a triggering condition, grounded in the cloud course's theorems.",
      "references": [
        "Kleppmann — DDIA: replication, partitioning, transactions, consistency (cross-links the `cloud` course: CAP, quorums, consistent hashing, caching)",
        "Alex Xu — System Design Interview vol. 1–2: the step framework and component patterns"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u9l1",
          "title": "The Design Procedure",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "A structure that keeps you (and the interviewer) oriented",
              "body": "After requirements and estimation (Unit 8), a strong design round follows a visible procedure. The point is not ritual — it's that a shared structure lets you go deep without getting lost, lets the interviewer follow your reasoning (communication signal), and ensures you cover the parts that matter. Announce the structure ('I'll define the API, then the data model, then the high-level architecture, then deep-dive the feed path and its bottlenecks') so the interviewer can steer you toward what they want to probe."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The design procedure",
              "statement": "After scoping + estimating, proceed:\n\n1. **API** — the handful of endpoints the features require (signatures, key params). This pins down exactly what the system must do.\n2. **Data model** — the core entities, their relationships, and the access patterns (which queries must be fast).\n3. **High-level architecture** — the major components (clients, load balancer, services, stores, caches, queues, CDN) and the request flow between them.\n4. **Deep-dive** — pick the 1–2 components the interviewer cares about (usually the read or write hot path) and design them in detail.\n5. **Bottlenecks & scale** — identify what breaks first as load grows and address it (cache, shard, replicate, queue), tying each fix to the Unit 8 numbers.\n\nThe deep-dive and bottleneck steps are where senior signal lives; the earlier steps set them up."
            },
            {
              "type": "text",
              "heading": "Design the data model around access patterns",
              "body": "The most consequential early choice is the data model, and it should be driven by *how the data is read and written*, not by a clean abstract schema. Ask: what are the high-frequency queries (from the estimation), and what layout makes them O(1)-ish? A feed that must load fast argues for storing a *precomputed* per-user feed keyed by user id; a 'who follows whom' query argues for an adjacency list. The access patterns — especially the read-heavy hot path — dictate normalization vs denormalization, the partition key, and what to index (Lesson 2). Draw the data model to serve the dominant query, then justify."
            },
            {
              "type": "checklist",
              "heading": "Driving the whiteboard well",
              "items": [
                "Start from the request flow: trace a single read and a single write end to end.",
                "Name the component that is the bottleneck at the estimated scale, and design that.",
                "For each component, state its job in one sentence and why it's there (tie to a number).",
                "Make the data model serve the dominant access pattern; note the partition key explicitly.",
                "Call your own trade-offs before the interviewer does ('this denormalization speeds reads but complicates updates').",
                "Leave hooks for the follow-ups you know are coming (scale to 10×, a component fails, hot keys)."
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't boil the ocean; go deep where it counts.** A common failure is spreading thin — a shallow box for every possible component and depth nowhere. Spend your time on the hot path the estimation flagged (the 700k-QPS read path, not the admin dashboard). Breadth with no depth reads as pattern-matching; one component designed rigorously with numbers reads as engineering."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For a URL shortener, sketch the API and the core data model, and name the one access pattern the data model must optimize.",
                  "solution": "API: POST /shorten {longUrl} → {shortCode}; GET /{shortCode} → 301 redirect to longUrl (optionally with expiry/custom alias). Data model: a mapping shortCode → longUrl (plus created_at, expiry, owner). The dominant access pattern is the *redirect lookup* by shortCode — extremely read-heavy and latency-critical — so the store must make shortCode→longUrl an O(1) point lookup: hash/primary-key on shortCode, heavily cached (the mapping is small and immutable, ideal for caching/CDN). Creation is comparatively rare, so the model optimizes the read: index by shortCode, cache aggressively.",
                  "hint": "Which query runs 100× more often and sits on the click critical path?"
                },
                {
                  "prompt": "Why should the data model be designed around access patterns rather than around a clean normalized schema?",
                  "solution": "At scale, the read/write pattern determines performance, and a textbook-normalized schema often forces expensive joins or many round trips on the hot path. Designing around access patterns means laying out data so the dominant queries are cheap: denormalizing or precomputing for read-heavy paths (one lookup instead of a multi-table join), choosing a partition key that co-locates data read together, and indexing exactly the query fields. Normalization optimizes for write consistency and storage, but the interview (and production) usually cares about the latency of the high-frequency read — so let the access pattern, sized by the estimation, drive the model, and accept the denormalization trade-off deliberately.",
                  "hint": "What does a normalized schema cost on a high-QPS read path, and what does denormalization buy?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l1-i1",
              "front": "The design procedure after scoping/estimation?",
              "back": "API → data model → high-level architecture → deep-dive 1–2 hot components → bottlenecks & scale. Announce it so the interviewer can steer."
            },
            {
              "id": "u9l1-i2",
              "front": "What should drive the data model?",
              "back": "The access patterns (the high-frequency reads/writes from the estimation), not an abstract clean schema. Layout serves the dominant query; state the partition key."
            },
            {
              "id": "u9l1-i3",
              "front": "Where does senior signal live in a design round?",
              "back": "The deep-dive on the hot path and the bottleneck analysis — going deep where the numbers say it matters, not a shallow box for every component."
            },
            {
              "id": "u9l1-i4",
              "front": "Common design-round failure?",
              "back": "Boiling the ocean — shallow breadth everywhere, depth nowhere. Spend time on the estimation-flagged hot path; one rigorous component beats ten vague ones."
            }
          ]
        },
        {
          "id": "u9l2",
          "title": "Storage Trade-offs",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "The storage decisions and their triggers",
              "body": "Most design rounds hinge on a few storage choices: SQL vs NoSQL, normalize vs denormalize, which consistency level, how to partition, and how to replicate. Each is a *decision with a trigger* — a condition in the requirements that selects it — and the good ones are grounded in the distributed-systems results from the cloud course. Cargo-culting ('I'll use Cassandra') scores low; naming the trigger and the trade-off scores high."
            },
            {
              "type": "decision",
              "heading": "SQL vs NoSQL, normalize vs denormalize",
              "rows": [
                [
                  "Complex relationships, multi-row transactions, ad-hoc queries, strong consistency",
                  "Relational (SQL) — ACID transactions, joins, mature"
                ],
                [
                  "Massive scale, simple key-based access, flexible schema, high write throughput",
                  "NoSQL (key-value / wide-column / document)"
                ],
                [
                  "Read-heavy hot path with expensive joins",
                  "Denormalize / precompute — trade write complexity + storage for fast reads"
                ],
                [
                  "Write-heavy with strict integrity across entities",
                  "Normalize + transactions — trade read cost for consistency"
                ],
                [
                  "Graph-shaped queries (friends-of-friends)",
                  "Graph DB or adjacency lists with careful indexing"
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Consistency levels and the CAP trade-off",
              "statement": "**Strong consistency:** every read reflects the latest write (a single logical value). **Eventual consistency:** replicas converge over time; a read may see stale data briefly. The choice is constrained by **CAP** (Gilbert–Lynch, proved in the `cloud` course): under a network *partition*, a system must sacrifice either consistency (serve possibly-stale data → AP) or availability (refuse to serve → CP). So 'strong everywhere, always available, at global scale' is unattainable during partitions — pick per use case: a bank balance is CP (strong), a like count is AP (eventual)."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Quorum reads and writes give strong consistency",
              "statement": "In a replicated store with N replicas, if every write must be acknowledged by W replicas and every read must query R replicas, then choosing R + W > N guarantees that any read quorum overlaps every write quorum in at least one replica — so a read always sees the latest acknowledged write.",
              "proof": "A write is acknowledged only after being stored on some set A of W replicas; a read gathers responses from some set B of R replicas. Both A and B are subsets of the same N replicas, so by inclusion–exclusion |A ∩ B| ≥ |A| + |B| − N = W + R − N. If R + W > N then |A ∩ B| ≥ W + R − N ≥ 1, so the read set B contains at least one replica that acknowledged the latest write and holds its value (with version metadata to pick the newest). Hence the read observes the most recent acknowledged write — strong consistency for that value. ∎\n\nCommon tunings: W = N, R = 1 (fast reads, slow/less-available writes) or W = R = ⌈(N+1)/2⌉ (majority quorums, balanced). This is the Dynamo-style knob (cloud course, quorum unit); citing 'R + W > N for read-your-writes' is precise consistency signal."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Partitioning (sharding) schemes",
              "statement": "Splitting data across nodes by a **partition key**: **hash partitioning** (node = hash(key) mod n) spreads load evenly but reshuffles almost everything when n changes; **consistent hashing** places nodes and keys on a ring so adding/removing a node remaps only ~1/n of keys (proved in the `cloud` course), the standard fix for elastic clusters; **range partitioning** keeps keys ordered (good for range scans) but risks hot ranges. **Trigger:** any dataset too big for one node, or write throughput exceeding one node — choose the key to spread load and to co-locate data read together, and beware **hot keys** (a celebrity, a trending item) that overload one shard."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Hot keys and hot shards break naive partitioning.** If one key (a celebrity's posts, a viral item) gets a disproportionate share of traffic, its shard becomes the bottleneck no matter how many shards you have. Mitigations: replicate the hot key across replicas, add a per-key cache, or split the hot key's data (e.g., sub-shard by a secondary dimension). Naming the hot-key problem unprompted is strong senior signal — it's the failure mode of the obvious design."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You need read-your-writes consistency with N = 5 replicas but want reads as fast as possible. Give a valid (R, W) and one that fails, and justify with the quorum condition.",
                  "solution": "Need R + W > 5, i.e. R + W ≥ 6. For fast reads, minimize R: R = 1, W = 5 satisfies 1 + 5 = 6 > 5 — every read (from any single replica) overlaps the all-replica write set, so it sees the latest write; the cost is slow, less-available writes (all 5 must ack). A failing choice: R = 2, W = 3 gives 2 + 3 = 5, not > 5, so a read quorum can miss the write quorum entirely (disjoint sets of 2 and 3 among 5) and return stale data. (A balanced alternative is R = W = 3: 3 + 3 = 6 > 5, majority quorums.) The overlap |A∩B| ≥ R+W−N must be ≥ 1.",
                  "hint": "R + W > N is required; for fast reads push W up and R down."
                },
                {
                  "prompt": "Why is consistent hashing preferred over hash(key) mod n when the cluster must scale elastically?",
                  "solution": "With node = hash(key) mod n, changing n (adding/removing a node) changes the modulus, so almost every key maps to a different node — a near-total reshuffle that triggers massive data movement and cache invalidation, unacceptable for a live elastic cluster. Consistent hashing places nodes and keys on a ring and assigns each key to the next node clockwise; adding or removing a node only remaps the keys in that node's arc — about 1/n of keys (proved in the cloud course) — leaving the rest in place. So elastic scaling moves ~1/n of the data instead of ~all of it, which is why consistent hashing underlies elastic caches and databases (Dynamo, Cassandra).",
                  "hint": "What fraction of keys move when n changes, under mod-n vs consistent hashing?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l2-i1",
              "front": "SQL vs NoSQL trigger?",
              "back": "SQL: complex relationships, multi-row transactions, strong consistency, ad-hoc queries. NoSQL: massive scale, simple key access, flexible schema, high write throughput."
            },
            {
              "id": "u9l2-i2",
              "front": "Quorum condition for strong (read-your-writes) consistency?",
              "back": "R + W > N — read and write quorums overlap in ≥ 1 replica (|A∩B| ≥ R+W−N ≥ 1), so a read sees the latest acknowledged write."
            },
            {
              "id": "u9l2-i3",
              "front": "Why consistent hashing over hash mod n?",
              "back": "mod-n reshuffles ~all keys when n changes; consistent hashing (ring) remaps only ~1/n of keys when a node is added/removed — essential for elastic clusters."
            },
            {
              "id": "u9l2-i4",
              "front": "The hot-key problem?",
              "back": "One key (celebrity, viral item) gets disproportionate traffic and overloads its shard regardless of shard count. Fix: replicate the hot key, cache it, or sub-shard it."
            }
          ]
        },
        {
          "id": "u9l3",
          "title": "Compute & Delivery Trade-offs",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Caching strategies",
              "statement": "A **cache** stores hot data in fast memory to cut latency and offload the backing store (Unit 8: a RAM hit ~100 µs vs a DB read ~1 ms). **Cache-aside (lazy):** the app checks the cache, and on a miss reads the DB and populates the cache — simple, resilient, but the first read is slow and data can go stale. **Write-through:** writes go to cache and DB together — reads are fresh, writes are slower. **Write-back:** write to cache, flush to DB asynchronously — fast writes, risk of loss on crash. Every cache needs an **eviction policy** (LRU/LFU) and usually a **TTL** to bound staleness. **Trigger:** a read-heavy hot path with a skewed access distribution (the 80/20 rule — cache the hot 20%)."
            },
            {
              "type": "decision",
              "heading": "Delivery & compute decisions",
              "rows": [
                [
                  "Read-heavy, skewed access, latency-critical",
                  "Cache the hot set in RAM (cache-aside + TTL); CDN for static/media"
                ],
                [
                  "Static or media served globally",
                  "CDN — serve from an edge near the user, offload origin bandwidth"
                ],
                [
                  "Work can happen off the critical path (email, thumbnails, feeds)",
                  "Async via a queue — return fast, process in the background (smooths bursts)"
                ],
                [
                  "Feed/notification delivery, read-heavy consumers",
                  "Push (fan-out on write): precompute per-consumer so reads are cheap"
                ],
                [
                  "Consumers are rare or producers are hot (celebrity)",
                  "Pull (fan-out on read) or a hybrid — avoid write amplification to millions"
                ],
                [
                  "Protect a service from overload / abuse",
                  "Rate limiting (token bucket) + load shedding at the edge"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Sync vs async: the queue is a shock absorber",
              "body": "If a step doesn't need to finish before responding to the user, make it **asynchronous**: enqueue a job and return immediately, letting workers process it. This does two things — it cuts user-facing latency (the slow work happens later) and it **absorbs bursts** (the queue buffers a spike that would overwhelm synchronous processing, smoothing load to the workers' sustainable rate; cross-link the cloud course's load-leveling). The trade-off is eventual completion (the work isn't done when the user sees success) and added complexity (retries, idempotency, dead-letter queues). Use it for emails, image processing, feed fan-out, analytics — anything off the critical path."
            },
            {
              "type": "text",
              "heading": "Push vs pull: where you pay the cost",
              "body": "For feeds/notifications the core choice is *when* you assemble the result. **Fan-out on write (push):** when a user posts, immediately write the post into each follower's precomputed feed, so a feed *read* is one cheap lookup. Great for read-heavy systems — until a celebrity with 100 M followers posts, causing 100 M writes (write amplification). **Fan-out on read (pull):** assemble the feed at read time by gathering recent posts from followed accounts — cheap writes, expensive reads. The production answer is usually a **hybrid**: push for normal users, pull for celebrities, merging at read time. Naming this hybrid and the celebrity trigger is a hallmark senior answer."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Every optimization is a trade — say both sides.** Caching trades freshness for speed; denormalization trades write complexity for read speed; async trades immediacy for latency+resilience; fan-out-on-write trades write cost for read cost. The signal isn't knowing the technique — it's naming what you give up and why it's worth it *for these requirements*. 'I'll fan out on write because reads are 100× writes and a 200 ms feed budget rules out read-time assembly, accepting write amplification, which I'll bound with a hybrid for celebrities' — that's the answer."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A social feed is read 100× more than written, but some accounts have tens of millions of followers. Design the fan-out strategy and justify each part with a trade-off.",
                  "solution": "Hybrid fan-out. For ordinary users, fan-out on write (push): on each post, insert it into followers' precomputed feeds so the very frequent feed *read* is one O(1) cache lookup — justified because reads dominate 100:1 and the latency budget forbids read-time assembly; the cost is write amplification, acceptable for modest follower counts. For celebrity accounts (tens of millions of followers), push would cause tens of millions of writes per post (a write storm and hot shard), so switch to fan-out on read (pull) for those: don't pre-insert; instead, at feed read time, merge the (few) celebrity accounts a user follows into their otherwise-precomputed feed. This bounds write amplification while keeping normal reads cheap — trading a small extra read-time merge for avoiding the celebrity write explosion. The trigger for the switch is follower count crossing a threshold.",
                  "hint": "Push for the many, pull for the hot few — name the celebrity trigger and the write-amplification trade."
                },
                {
                  "prompt": "When would you choose cache-aside over write-through, and what staleness risk must you manage?",
                  "solution": "Choose cache-aside when reads dominate and you want simplicity and resilience: the app populates the cache only on a read miss, so the cache holds just what's actually read, and a cache failure degrades to DB reads rather than breaking writes. The staleness risk: after an underlying write, the cached copy is stale until it's invalidated or its TTL expires, so a read can return old data. Manage it by invalidating (or updating) the cache entry on writes and setting a TTL that bounds the worst-case staleness to what the use case tolerates (short TTL for volatile data, long for near-static). Write-through instead keeps reads fresh at the cost of slower writes and writing data that may never be read — preferable when staleness is unacceptable and writes are affordable.",
                  "hint": "Cache-aside is lazy and simple but stale-prone — how do you bound the staleness?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l3-i1",
              "front": "Cache-aside vs write-through?",
              "back": "Cache-aside: populate on read miss — simple, resilient, first read slow, can go stale (needs TTL/invalidation). Write-through: write cache+DB together — fresh reads, slower writes."
            },
            {
              "id": "u9l3-i2",
              "front": "Why make a step asynchronous (queue)?",
              "back": "Cuts user-facing latency (off the critical path) and absorbs bursts (load-leveling to workers' sustainable rate). Trade: eventual completion + retry/idempotency complexity."
            },
            {
              "id": "u9l3-i3",
              "front": "Fan-out on write vs read, and the hybrid?",
              "back": "Push (write): precompute each follower's feed → cheap reads, write amplification (celebrity storm). Pull (read): assemble at read → cheap writes, costly reads. Hybrid: push for normal users, pull for celebrities."
            },
            {
              "id": "u9l3-i4",
              "front": "What's the signal in stating an optimization?",
              "back": "Naming BOTH sides of the trade and why it's worth it for THESE requirements (cache: freshness for speed; async: immediacy for resilience) — not just knowing the technique."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u9-check",
        "questions": [
          {
            "id": "u9q1",
            "type": "short",
            "prompt": "With N replicas, the quorum condition R + W > N guarantees that read and write quorums ____ in at least one replica (one word), giving strong consistency.",
            "accept": [
              "overlap",
              "intersect",
              "overlap.",
              "intersect."
            ],
            "explanation": "Overlap/intersect: |A∩B| ≥ R+W−N ≥ 1 when R+W>N, so a read always hits a replica holding the latest acknowledged write."
          },
          {
            "id": "u9q2",
            "type": "numeric",
            "prompt": "A replicated store has N = 7 replicas. What is the minimum read quorum R that guarantees read-your-writes consistency when W = 4? (R + W > N)",
            "answer": 4,
            "tolerance": 0,
            "explanation": "Need R + W > 7, i.e. R + 4 ≥ 8, so R ≥ 4. R = 4 gives 4 + 4 = 8 > 7 — quorums overlap. R = 3 gives 7, which is not > 7 and can miss the write."
          },
          {
            "id": "u9q3",
            "type": "numeric",
            "prompt": "Using consistent hashing on a ring, adding one node to a cluster of n = 9 nodes (making 10) remaps approximately what fraction of keys? Give the fraction as a decimal (approximately 1/(n+1)).",
            "answer": 0.1,
            "tolerance": 0.03,
            "explanation": "Consistent hashing remaps ~1/(new n) ≈ 1/10 = 0.1 of keys — only the arc the new node takes over — versus nearly all keys under hash-mod-n. This is why it's used for elastic clusters."
          },
          {
            "id": "u9q4",
            "type": "mcq",
            "prompt": "A read-heavy social feed (100:1 reads:writes) with a 200 ms p99 budget, but some accounts have 50M followers. The best fan-out strategy is:",
            "options": [
              "Pure fan-out on read (assemble every feed at read time)",
              "Pure fan-out on write (push every post to all followers' feeds)",
              "Hybrid: push for normal users, pull for celebrities, merged at read time",
              "No precomputation — query the database on every feed load"
            ],
            "answer": 2,
            "explanation": "Pure push explodes on celebrities (50M writes/post, hot shards); pure pull makes the dominant read path expensive, blowing the 200 ms budget. The hybrid pushes for the many (cheap reads) and pulls the few celebrities (bounded writes), merging at read time."
          },
          {
            "id": "u9q5",
            "type": "open",
            "points": 3,
            "prompt": "Design the storage and delivery layer for a URL shortener at 100,000 redirect QPS (peak) and 100:1 read:write ratio. Justify the database choice, the consistency level, the caching strategy, and how you'd handle a single viral link — grounding each in a trade-off or a result from this unit.",
            "rubric": [
              "Chooses a store appropriate to the access pattern (simple key→value point lookups, huge read scale → key-value/NoSQL or a well-indexed relational table) and justifies via the SQL/NoSQL trigger.",
              "Reasons about consistency: the shortCode→URL mapping is immutable once created, so eventual consistency / caching is safe (a created code can propagate; ties to CAP/quorum reasoning that strong consistency isn't needed here).",
              "Specifies a caching strategy with numbers — cache-aside of the hot mapping in RAM (hit ~100 µs vs DB ~1 ms), TTL/immutability, and how many DB nodes the cache saves at 100k QPS.",
              "Handles the viral (hot-key) link explicitly: replicate/cache it widely or serve via CDN, invoking the hot-key/hot-shard failure mode and its mitigations.",
              "Quantitative and trade-off-aware, each choice tied to a requirement, not a named technology for its own sake."
            ],
            "solution": "Access pattern: overwhelmingly point lookups shortCode→longUrl, 100k read QPS, 100:1 read:write, and the mapping is immutable after creation. Store: a key-value store (or a relational table keyed/indexed on shortCode) — the SQL/NoSQL trigger favors simple key access at scale, so a KV store or a single indexed table both work; I'd pick a KV store for the read scale and simplicity, sharded by shortCode via consistent hashing so it scales elastically (remapping only ~1/n on growth). Consistency: because a mapping never changes once created, strong consistency is unnecessary on reads — eventual consistency is safe and lets me cache aggressively; the only ordering concern is read-your-writes right after creation, handled by writing to the store before returning the code (or briefly serving from the writer). Caching: cache-aside of shortCode→longUrl in RAM with a long TTL (safe, since immutable). At 100k QPS, if the cache serves 95% of reads, the DB sees 5k QPS — a handful of nodes instead of ~10 (100k ÷ ~10k/node), and hits are ~10× faster (~100 µs vs ~1 ms), keeping the redirect well under budget; static redirects can even be served at the CDN edge. Viral link (hot key): one code can dominate traffic and hot-shard its node regardless of shard count — mitigate by caching it at every layer (it's tiny and immutable, ideal to replicate), serving it from the CDN edge, and, if needed, replicating that key across nodes so no single shard is the bottleneck. Every choice traces to the read-heavy immutable access pattern and the estimation, not to a brand name.",
            "explanation": "Strong answers exploit the immutability (eventual consistency + heavy caching), quantify the cache's DB-node savings, pick a store from the access-pattern trigger, and name the hot-key mitigation for the viral link — the unit's storage + delivery + trade-off synthesis."
          }
        ]
      }
    },
    {
      "id": "u10",
      "title": "Canonical Designs, Worked End-to-End",
      "summary": "Two full designs (a rate limiter and a typeahead system) built with the procedure, then the skill of evaluating your own design — availability composition, SPOFs, and scaling.",
      "references": [
        "Alex Xu — System Design Interview: rate limiter, autocomplete/typeahead, chapters worked end to end",
        "Kleppmann — DDIA; Google SRE — availability composition, error budgets (cross-links the `cloud` course, Availability unit)"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u10l1",
          "title": "Worked: Design a Rate Limiter",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The procedure on a concrete, bounded problem",
              "body": "A rate limiter caps how many requests a client may make in a window — protecting a service from abuse and overload (a load-shedding guardrail). It's a favorite because it's small enough to design fully yet rich in trade-offs. **Requirements:** limit to X requests per client per window; low added latency (<~1 ms, it's on every request); work across many app servers; fail open or closed (a design decision). **Estimation:** at 100k QPS, the limiter does ~100k counter checks/sec — it must be an in-memory operation, not a DB write."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Token bucket",
              "statement": "A **token bucket** holds up to C tokens and refills at r tokens/second. Each request removes one token; if the bucket is empty the request is rejected (or delayed). This admits a **sustained rate of r** requests/second while allowing **bursts up to C** (the bucket size). Two parameters cleanly separate steady-state rate (r) from burst tolerance (C) — which is why it's the usual choice. State kept per client: token count + last-refill timestamp; on each request, add r × (now − last) tokens (capped at C), then try to consume one."
            },
            {
              "type": "decision",
              "heading": "Rate-limiting algorithms",
              "rows": [
                [
                  "Need burst tolerance + a clean sustained rate",
                  "Token bucket — bursts up to C, steady rate r"
                ],
                [
                  "Smooth, constant outflow (no bursts)",
                  "Leaky bucket — processes at a fixed rate, queues the rest"
                ],
                [
                  "Simplest possible, exact per-window count",
                  "Fixed window counter — but allows 2× burst at the window boundary"
                ],
                [
                  "Accurate rate without the boundary spike",
                  "Sliding window log/counter — more memory/compute, smoother"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The fixed-window boundary bug.** A fixed 'N per minute' counter that resets at each minute boundary lets a client send N at 11:59:59 and N more at 12:00:00 — 2N in one second, straddling the reset. Naming this failure and preferring a sliding window or token bucket to avoid it is exactly the trade-off signal a rate-limiter question is probing."
            },
            {
              "type": "text",
              "heading": "Making it distributed",
              "body": "With many app servers, a per-server counter under-counts a client hitting different servers, so the counter must be **shared** — typically in a fast in-memory store (Redis) keyed by client id. The check must be **atomic** (read-modify-write of the token count) or two concurrent requests can both see one token and both pass; use an atomic Redis operation or a Lua script. Trade-offs: the shared store adds a ~sub-ms network hop (still cheap) and is itself a dependency — decide **fail-open** (allow on limiter outage, favor availability) vs **fail-closed** (reject, favor protection). Shard the limiter store by client key so it scales, and cache/limit locally as a first tier to cut load on the shared store."
            },
            {
              "type": "example",
              "heading": "Putting it together",
              "body": "Design: limit 10 req/s per user with bursts to 20. Token bucket per user: C = 20, r = 10. State in Redis: {tokens, last_ts} keyed by user id, updated by an atomic Lua script that refills (min(C, tokens + r×Δt)) then consumes one if available, returning allow/deny. At 100k QPS this is 100k atomic Redis ops/sec — well within a small Redis cluster sharded by user id; each op is ~sub-ms, keeping added latency negligible. Fail-open on Redis outage (a down limiter shouldn't take down the API). Every choice — token bucket for bursts, Redis for shared atomic state, sharding for scale, fail-open for availability — traces to a requirement."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A client is allowed 100 requests/minute via a fixed-window counter. Show the maximum requests it can make in a 1-second interval, and which algorithm fixes it.",
                  "solution": "The fixed window resets on the minute. The client sends 100 requests in the last second of one window (e.g. 12:00:59.x) and 100 more in the first second of the next (12:01:00.x) — 200 requests within a ~1-second span straddling the boundary, double the intended rate. A sliding-window counter/log (which counts requests in the trailing 60 seconds from *now*, not a fixed bucket) or a token bucket (which enforces a smooth refill rate r with bounded burst C) removes the boundary spike by not resetting on a shared clock edge.",
                  "hint": "Send the full quota just before and just after the reset instant."
                },
                {
                  "prompt": "Why must the distributed rate-limiter's counter update be atomic, and what's the consequence of choosing fail-open vs fail-closed on limiter outage?",
                  "solution": "Without atomicity, two concurrent requests can both read the same token count, both see a token available, and both consume 'it' — a race that lets more requests through than the limit (a lost update). An atomic read-modify-write (Redis INCR/Lua script) serializes the check so only one succeeds per token. On limiter outage: fail-open allows requests when the limiter is unreachable — favoring availability (the API keeps serving) at the risk of unbounded traffic during the outage; fail-closed rejects requests — favoring protection (never exceed the limit) at the cost of an outage in the limiter taking down the API. The choice depends on whether over-admitting or under-serving is worse for the system.",
                  "hint": "What can two concurrent requests do to a non-atomic counter? Then weigh availability vs protection on outage."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u10l1-i1",
              "front": "Token bucket parameters and behavior?",
              "back": "Capacity C (max burst) + refill rate r (sustained rate). Each request consumes a token; empty → reject. Bursts up to C, steady rate r. State: token count + last-refill time."
            },
            {
              "id": "u10l1-i2",
              "front": "The fixed-window rate-limiter bug?",
              "back": "It resets on a clock boundary, so a client can send N just before and N just after → 2N in a moment. Fix with sliding window or token bucket."
            },
            {
              "id": "u10l1-i3",
              "front": "Why must a distributed rate limiter be atomic + shared?",
              "back": "Shared (Redis by client key) so counts aren't per-server; atomic read-modify-write so concurrent requests don't both consume the same token (lost update)."
            },
            {
              "id": "u10l1-i4",
              "front": "Fail-open vs fail-closed on limiter outage?",
              "back": "Fail-open: allow requests (favor availability, risk overload). Fail-closed: reject (favor protection, limiter outage breaks the API). Choose by which is worse."
            }
          ]
        },
        {
          "id": "u10l2",
          "title": "Worked: Design a Typeahead System",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Search autocomplete: read-heavy, latency-critical, mostly static",
              "body": "Typeahead returns the top-k completions for a prefix as the user types. **Requirements:** given a prefix, return the k most-popular matching queries; p99 < ~100 ms (it fires on every keystroke); enormous read QPS; suggestions update slowly (popularity shifts over hours, not milliseconds — so the index can be *precomputed*). This 'mostly static, hugely read-heavy' profile is the key insight: precompute aggressively and cache, because you can tolerate slightly stale suggestions."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Trie with precomputed top-k",
              "statement": "A **trie** (prefix tree) stores strings so that a prefix maps to the subtree of all completions, found by walking the prefix's characters in O(len(prefix)). To return the top-k completions *fast*, **precompute and store the top-k most-popular completions at each node** during an offline build. Then a query is: walk the prefix (O(len)), read the node's cached top-k (O(k)). This turns a per-query search-and-rank over potentially millions of matches into a constant-ish lookup — trading offline build cost and storage for O(prefix + k) online latency."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 260,
              "caption": "Typeahead request flow: reads hit the CDN/cache first; misses walk the precomputed trie. An offline pipeline rebuilds the trie's per-node top-k from query logs periodically.",
              "nodes": [
                {
                  "id": "c",
                  "label": "Client",
                  "x": 6,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "cache",
                  "label": "Cache",
                  "x": 30,
                  "y": 50,
                  "sub": "hot prefixes",
                  "tone": "sage"
                },
                {
                  "id": "svc",
                  "label": "Service",
                  "x": 54,
                  "y": 50
                },
                {
                  "id": "trie",
                  "label": "Trie",
                  "x": 78,
                  "y": 30,
                  "sub": "top-k/node"
                },
                {
                  "id": "build",
                  "label": "Builder",
                  "x": 78,
                  "y": 72,
                  "sub": "offline, from logs",
                  "tone": "ember"
                }
              ],
              "edges": [
                {
                  "from": "c",
                  "to": "cache",
                  "label": "prefix",
                  "directed": true
                },
                {
                  "from": "cache",
                  "to": "svc",
                  "label": "miss",
                  "directed": true,
                  "dashed": true
                },
                {
                  "from": "svc",
                  "to": "trie",
                  "label": "walk",
                  "directed": true
                },
                {
                  "from": "build",
                  "to": "trie",
                  "label": "rebuild",
                  "directed": true,
                  "tone": "ember",
                  "dashed": true
                }
              ]
            },
            {
              "type": "text",
              "heading": "Scaling the reads",
              "body": "The query volume is dominated by short, popular prefixes, so **cache the top-k for hot prefixes** in RAM / at a CDN edge — most keystrokes never reach the trie. The trie itself is large but partitionable by first character(s) / prefix range across shards. Because suggestions are only eventually fresh, the whole index is rebuilt periodically by an **offline pipeline** that aggregates query logs, recomputes popularity, and republishes the trie with updated per-node top-k — decoupling the expensive ranking from the latency-critical read path. Writes (new query events) go to logs, not the serving path."
            },
            {
              "type": "example",
              "heading": "The estimation drives the caching",
              "body": "Say 5 keystrokes per search, 100 M searches/day → ~500 M autocomplete requests/day → ~6,000 QPS avg, peak ~20,000. Each response is tiny (k≈5 short strings). The read volume plus the < 100 ms budget rules out ranking at query time, forcing the precomputed top-k design; the huge skew toward popular prefixes (a small set of prefixes covers most traffic) makes an in-memory/edge cache serve the vast majority of requests at sub-millisecond latency, leaving the trie shards lightly loaded. The 'mostly static' property is what licenses the offline rebuild — you couldn't do this if suggestions had to be real-time."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Why precompute the top-k at each trie node instead of collecting all completions under a prefix and ranking them per request?",
                  "solution": "Collecting all completions under a popular short prefix (e.g. 'a') could mean gathering and sorting millions of strings by popularity on every keystroke — far too slow for a <100 ms, high-QPS path. Precomputing the top-k at each node during an offline build turns the online query into 'walk the prefix (O(len)), return the node's stored k results (O(k))' — essentially constant time — at the cost of extra storage (k entries per node) and a periodic rebuild. Because suggestions only need to be eventually fresh, paying that cost offline is exactly the right trade: move the expensive ranking off the latency-critical path.",
                  "hint": "How much work is 'rank all completions of a short popular prefix' at query time, and can you afford it per keystroke?"
                },
                {
                  "prompt": "Suggestions can be a few hours stale without harm. Which two architectural choices does that fact license, and why?",
                  "solution": "(1) An offline batch rebuild of the trie/top-k from query logs — since freshness isn't real-time, you can aggregate popularity and republish the whole index periodically, decoupling expensive ranking from serving. (2) Aggressive caching (RAM/CDN) of hot-prefix results with generous TTLs — staleness tolerance means cached suggestions needn't be invalidated on every new query event, so the cache absorbs the vast majority of reads at sub-ms latency. Both trade freshness (which the requirements say is cheap here) for enormous read scalability and low latency — the opposite choices from a system that needed real-time updates.",
                  "hint": "What can you do offline and cache-long when you don't need real-time freshness?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u10l2-i1",
              "front": "Core structure for typeahead and the key optimization?",
              "back": "A trie (prefix → subtree of completions in O(len)) with the top-k most-popular completions PRECOMPUTED and stored at each node → query is O(prefix + k)."
            },
            {
              "id": "u10l2-i2",
              "front": "Why can typeahead precompute offline?",
              "back": "Suggestions only need to be eventually fresh (popularity shifts over hours), so an offline pipeline rebuilds the index from logs, keeping expensive ranking off the latency-critical read path."
            },
            {
              "id": "u10l2-i3",
              "front": "How does typeahead scale reads?",
              "back": "Cache hot prefixes' top-k in RAM/CDN (traffic is skewed to popular short prefixes), so most keystrokes never touch the trie; shard the trie by prefix range."
            },
            {
              "id": "u10l2-i4",
              "front": "What does 'mostly static + read-heavy' license generally?",
              "back": "Aggressive precomputation and long-TTL caching — trade eventual freshness (cheap here) for huge read scalability and low latency."
            }
          ]
        },
        {
          "id": "u10l3",
          "title": "Evaluating Your Own Design",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "The senior move: critique your own design before they do",
              "body": "The strongest design-round signal is turning the lens on your own architecture: 'here's what breaks first, here's the single point of failure, here's the cost.' Interviewers reliably ask the scaling and failure follow-ups; pre-empting them shows the judgment that separates senior from mid. This lesson is the checklist for self-critique — availability, SPOFs, bottleneck-at-10×, and cost."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Availability composes: series multiplies, redundancy complements",
              "statement": "If independent components have availabilities a₁, …, a_N, then a request that needs **all** of them (a series dependency) succeeds with availability ∏ aᵢ, which is ≤ min aᵢ. A component made **redundant** across k independent replicas of availability a is available with probability 1 − (1 − a)ᵏ, which is ≥ a and rises toward 1 as k grows.",
              "proof": "Series: the request succeeds iff every component is up; by independence the probability all are up is the product ∏ aᵢ. Since each aᵢ ≤ 1, multiplying more factors ≤ 1 can only shrink the product, so ∏ aᵢ ≤ min aᵢ — a chain is less available than its weakest link, and every added dependency lowers availability. Redundancy: k independent replicas of the component are all down with probability ∏ (1 − a) = (1 − a)ᵏ (independence), so at least one is up with probability 1 − (1 − a)ᵏ ≥ a, increasing toward 1 as k grows. ∎\n\nConsequences you can state: adding dependencies on the critical path erodes availability multiplicatively (five 99.9% services in series give 0.999⁵ ≈ 99.5%), so minimize serial hops; and eliminate single points of failure by replicating them (two 99% replicas give 1 − 0.01² = 99.99%). This is the `cloud` course's availability algebra applied to your own diagram."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The cost of nines",
              "statement": "Availability is quoted in 'nines': 99% ≈ 3.65 days/year of downtime, 99.9% ≈ 8.76 hours, 99.99% ≈ 52.6 minutes, 99.999% ≈ 5.26 minutes. Each additional nine cuts allowed downtime ~10× and costs disproportionately more (redundancy, failover, operational rigor). **Trigger:** match the target to the use case — a background analytics job doesn't need the five-nines a payments path does — because over-provisioning availability is real, wasted money."
            },
            {
              "type": "checklist",
              "heading": "Self-critique checklist",
              "items": [
                "Single point of failure: is any component un-replicated and on the critical path? (If it dies, does everything?)",
                "Bottleneck at 10×: which component saturates first as load grows 10×, and what's the fix (shard, cache, replicate, queue)?",
                "Hot keys / skew: does a celebrity or trending item overload one shard? (Unit 9)",
                "Availability math: multiply the series path; is it above the target? Redundate the weak links.",
                "Consistency correctness: does any path serve stale data where it must be strong? (CAP/quorum)",
                "Cost: are you paying for nines or capacity the requirements don't need?",
                "Failure modes: what happens on a dependency outage — degrade gracefully, fail open/closed?"
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Answer 'what breaks at 10× traffic?' before it's asked.** Trace the estimated load through your diagram and name the first component to saturate (often the database write path or a hot shard), then give the fix tied to a number. Volunteering this is the highest-leverage senior signal in a design round — it shows you think in load and failure, not just boxes."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A request path traverses a load balancer (99.99%), an app service (99.9%), and a database (99.9%), all in series. Compute the end-to-end availability, and show how replicating the database to two independent replicas changes it.",
                  "solution": "Series (all must be up): A = 0.9999 × 0.999 × 0.999 ≈ 0.9979, about 99.79% — worse than any single component, ~18 hours/year down, because dependencies multiply. Replicating the DB across two independent replicas raises the DB's availability to 1 − (1 − 0.999)² = 1 − 0.000001 = 0.999999 (six nines). The path becomes 0.9999 × 0.999 × 0.999999 ≈ 0.99989, about 99.89% — the DB is no longer the weak link; now the app service (99.9%) dominates and would be the next thing to replicate. This is the series-multiplies / redundancy-complements algebra: find the weakest serial link and add redundancy there.",
                  "hint": "Multiply the series; then replace the DB term with 1−(1−a)² and recompute."
                },
                {
                  "prompt": "Your design has a single Redis instance holding all session state on the critical path. Critique it and give the fix.",
                  "solution": "It's a single point of failure on the critical path: if that Redis dies, every request needing session state fails, so the system's availability is capped by one instance's availability (and its throughput/memory cap is a 10× bottleneck too). Fixes: replicate Redis (primary + replica with failover, or a clustered/sharded Redis) so a node loss doesn't take down sessions — redundancy turns availability a into 1−(1−a)ᵏ; shard by session key to scale throughput and memory; and design the app to degrade gracefully (e.g. re-auth or fall back to a token) if the session store is briefly unavailable. Naming the SPOF and quantifying the redundancy improvement is the self-critique signal.",
                  "hint": "Un-replicated + on the critical path = ? Apply the redundancy formula and add sharding."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u10l3-i1",
              "front": "How does availability compose in series vs with redundancy?",
              "back": "Series (need all): ∏ aᵢ ≤ min (weakest link; every dependency lowers it). Redundant k replicas: 1−(1−a)ᵏ ≥ a (rises toward 1). Minimize serial hops; replicate SPOFs."
            },
            {
              "id": "u10l3-i2",
              "front": "The 'nines' downtime budget?",
              "back": "99% ≈ 3.65 days/yr; 99.9% ≈ 8.8 hr; 99.99% ≈ 53 min; 99.999% ≈ 5 min. Each nine ~10× less downtime and disproportionately costlier — match to the use case."
            },
            {
              "id": "u10l3-i3",
              "front": "The two questions to pre-empt in a design round?",
              "back": "'What's the single point of failure?' and 'What breaks first at 10× load?' — answer both unprompted with fixes tied to numbers."
            },
            {
              "id": "u10l3-i4",
              "front": "How to fix a single point of failure?",
              "back": "Replicate it (redundancy: availability a → 1−(1−a)ᵏ) and shard for throughput; design the app to degrade gracefully if it's briefly unavailable."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u10-check",
        "questions": [
          {
            "id": "u10q1",
            "type": "short",
            "prompt": "Which rate-limiting algorithm allows bursts up to a capacity C while enforcing a sustained rate r? (two words)",
            "accept": [
              "token bucket",
              "token-bucket",
              "tokenbucket"
            ],
            "explanation": "Token bucket: capacity C caps the burst, refill rate r sets the sustained rate. Its two parameters cleanly separate burst tolerance from steady-state rate."
          },
          {
            "id": "u10q2",
            "type": "numeric",
            "prompt": "Three independent services on the critical path have availabilities 99.9%, 99.9%, and 99.95%. What is the end-to-end (series) availability, as a percentage to two decimals?",
            "answer": 99.75,
            "tolerance": 0.05,
            "explanation": "0.999 × 0.999 × 0.9995 ≈ 0.99750 = 99.75%. A series path is below its weakest link; every added dependency multiplies availability down."
          },
          {
            "id": "u10q3",
            "type": "numeric",
            "prompt": "A component with 99% availability is replicated across 2 independent replicas (available if at least one is up). What is the combined availability, as a percentage?",
            "answer": 99.99,
            "tolerance": 0.01,
            "explanation": "1 − (1 − 0.99)² = 1 − 0.0001 = 0.9999 = 99.99%. Redundancy complements: two nines become four. This is how you fix a single point of failure."
          },
          {
            "id": "u10q4",
            "type": "mcq",
            "prompt": "Autocomplete suggestions may be a few hours stale. The single most important architectural consequence is:",
            "options": [
              "You must use strong consistency and synchronous replication",
              "You can precompute the top-k per prefix offline and cache aggressively, keeping ranking off the read path",
              "You must rank all completions per keystroke for freshness",
              "You cannot use a trie because tries can't be updated"
            ],
            "answer": 1,
            "explanation": "Staleness tolerance licenses offline precomputation of per-node top-k and long-TTL caching, moving expensive ranking off the latency-critical read path — the key to serving huge QPS under a <100 ms budget."
          },
          {
            "id": "u10q5",
            "type": "open",
            "points": 3,
            "prompt": "You've sketched a design with: clients → load balancer → stateless app tier → a single primary SQL database, plus a Redis cache. Critique this design's reliability and scalability as an interviewer would probe it: identify the single point of failure, what breaks first at 10× traffic, and the availability implication — then give concrete fixes tied to the results in this unit.",
            "rubric": [
              "Identifies the single primary SQL database as the SPOF and the likely first bottleneck at 10× (write throughput / connections), reasoning about why the stateless app tier and LB scale but the single DB doesn't.",
              "Applies the availability algebra: the series path is capped by the single DB, and replicating it (1−(1−a)ᵏ) removes it as the weak link; notes the LB itself should be redundant.",
              "Gives concrete, correct fixes: read replicas + cache for read scale, sharding/partitioning for write scale, primary-replica failover for availability, and handling the cache as its own dependency (SPOF/failure mode).",
              "Reasons about consistency/failure trade-offs of the fixes (e.g. replica lag → stale reads; failover semantics) rather than just naming technologies.",
              "Structured self-critique tied to numbers and this unit's results, pre-empting the standard follow-ups."
            ],
            "solution": "The load balancer and the stateless app tier scale horizontally and can be made redundant, but the **single primary SQL database is both the SPOF and the first bottleneck**. Availability: the whole path is a series, so it's capped by that one DB (e.g. 99.9% → ~8.8 hr/yr, and if it dies everything does); by the composition theorem, replicating it to a primary + replicas raises its term to 1−(1−a)ᵏ so it stops being the weak link — and the LB must itself be redundant (active-active or failover) or it's a second SPOF. Scale at 10×: reads and writes both funnel to one DB; reads saturate it first, then write throughput/connections. Fixes, tied to the earlier units: (1) offload reads with the Redis cache (cache-aside, Unit 9) and **read replicas**, cutting DB read load by the cache hit ratio — but note replica lag means eventually-consistent reads, acceptable only where staleness is fine; (2) scale writes by **sharding/partitioning** the DB by a key chosen from the access pattern (consistent hashing for elasticity), watching for hot keys; (3) **primary-replica failover** so a node loss doesn't take the system down, accepting a brief failover window and defining its consistency semantics; (4) treat Redis as its own dependency — replicate/shard it and decide fail-open vs fail-closed, since an un-replicated cache is another SPOF. Net: the LB and app tier are fine, but the single DB must be replicated (availability), cached + read-replicated (read scale), and sharded (write scale), with the consistency trade-offs of each stated.",
            "explanation": "The unit's synthesis: find the SPOF and 10× bottleneck (the single DB), apply availability composition to justify redundancy, and give fixes (cache, read replicas, sharding, failover) with their consistency/failure trade-offs — pre-empting the standard reliability/scaling follow-ups."
          }
        ]
      }
    },
    {
      "id": "u11",
      "title": "The Competency Rubric & Narrative Construction",
      "summary": "Behavioral rounds as structured signal: the competency rubric, the STAR schema, a story bank that covers every competency, and the failure modes that sink strong engineers.",
      "references": [
        "Amazon Leadership Principles & the bar-raiser model — a public, explicit competency rubric",
        "STAR method (Situation, Task, Action, Result) — structured behavioral interviewing",
        "Laszlo Bock — Work Rules!: structured behavioral interviews predict performance better than unstructured"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u11l1",
          "title": "What Behavioral Rounds Actually Measure",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "Behavioral rounds are structured, not a chat",
              "body": "Engineers under-prepare behavioral rounds because they look like casual conversation. They aren't — they're a *structured measurement* of specific competencies, scored on a rubric exactly like a coding round (Unit 1). The premise: **past behavior predicts future behavior**, so the interviewer probes real past situations to estimate how you'll act as a teammate, under conflict, when you fail. The measurement model still holds — they score observed signal against named competencies — so the same discipline applies: know the rubric, emit dense, specific evidence, cover every box."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The behavioral competency rubric",
              "statement": "Behavioral rounds score a small set of named competencies — the exact list varies by company but clusters around: **ownership / drive** (do you take responsibility and push to done?), **collaboration / conflict** (how you work with and disagree with others), **dealing with ambiguity** (acting without complete information), **impact / results** (did your work matter, quantified?), **learning / growth** (how you handle failure and feedback), and **leadership / influence** (moving people without authority). Companies with explicit values (e.g. Amazon's Leadership Principles) publish this rubric — read it, because each question maps to one or two competencies the interviewer must score."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The STAR schema",
              "statement": "Structure every behavioral answer as **STAR**: **Situation** (brief context — where, when, your role), **Task** (the specific problem or goal you owned), **Action** (what *you* did — the decisions and steps, the bulk of the answer), **Result** (the outcome, *quantified*, plus what you learned). STAR is a schema with required slots; a good answer fills all four, weights Action heaviest, and lands a concrete Result. Rambling answers fail because they omit slots — no clear task, or (most commonly) no measurable result."
            },
            {
              "type": "text",
              "heading": "Signal density and the 'I' vs 'we' problem",
              "body": "As in Unit 1, you have limited time and specific boxes to fill, so **signal density** matters: a crisp STAR answer that clearly demonstrates two competencies with a quantified result beats a long meandering story. The single most common signal-killer in behavioral rounds is saying **'we'** when the interviewer needs to score **you**: 'we shipped it, we decided' hides your individual contribution, leaving the ownership/impact boxes empty. Set the team context ('we'), then be explicit about *your* actions and decisions ('I proposed…, I built…, I convinced…'). The interviewer is estimating *your* competence, not the team's."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**No metric, no result.** The Result slot is where behavioral answers most often collapse. 'It went well' is unscoreable. 'It cut deploy time from 45 to 8 minutes and the team adopted it across 6 services' is impact signal. Quantify outcomes wherever remotely possible — latency, revenue, time saved, adoption, incidents avoided. Unquantified impact reads, under a strict bar, as weak impact."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Map these questions to the competency each primarily probes: (a) 'Tell me about a time you disagreed with a teammate.' (b) 'Tell me about a project you drove end to end.' (c) 'Tell me about a time you had to act without enough information.'",
                  "solution": "(a) Collaboration / conflict (and how you disagree well — the same skill as Unit 7's disagreeing-with-an-interviewer). (b) Ownership / drive and impact/results — did you take responsibility and get it done, with a measurable outcome. (c) Dealing with ambiguity — making a reasoned decision under uncertainty. Recognizing the target competency tells you which story to retrieve and which behaviors to emphasize (e.g. for (a), show you engaged the disagreement on merits and reached a good outcome, not that you won).",
                  "hint": "Each question is engineered to elicit one or two rubric competencies — which?"
                },
                {
                  "prompt": "Rewrite this weak Result: 'We refactored the service and it was a lot better afterward.' Explain what makes the rewrite score higher.",
                  "solution": "Rewrite: 'I led the refactor of the payments service; afterward p99 latency dropped from 800 ms to 220 ms, on-call pages for that service fell ~70%, and two other teams reused the new module.' It scores higher because (1) it uses 'I led' — claiming individual ownership the interviewer can score, not a hidden 'we'; (2) it quantifies impact (latency, pages, reuse) rather than 'a lot better,' filling the impact/results box with evidence; and (3) the concrete numbers make the result verifiable and memorable, which survives a hiring committee (Unit 1) where vague claims don't.",
                  "hint": "Fix the 'we', and replace 'a lot better' with metrics the interviewer can write down."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u11l1-i1",
              "front": "What premise underlies behavioral interviews?",
              "back": "Past behavior predicts future behavior — they probe real past situations to estimate how you'll act as a teammate, under conflict, and when you fail. Scored on a competency rubric."
            },
            {
              "id": "u11l1-i2",
              "front": "The STAR schema?",
              "back": "Situation (context/role), Task (the goal you owned), Action (what YOU did — the bulk), Result (quantified outcome + what you learned). Fill all four slots; weight Action."
            },
            {
              "id": "u11l1-i3",
              "front": "The 'we' vs 'I' problem?",
              "back": "Saying 'we' hides your individual contribution, leaving ownership/impact boxes empty. Set team context with 'we,' then be explicit about YOUR actions/decisions with 'I.'"
            },
            {
              "id": "u11l1-i4",
              "front": "Why quantify the Result?",
              "back": "Unquantified impact ('it went well') is unscoreable and reads as weak under a strict bar. Metrics (latency, adoption, time saved) are the impact signal and survive committee review."
            }
          ]
        },
        {
          "id": "u11l2",
          "title": "The Story Bank",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Prepare stories, not answers",
              "body": "You cannot predict the exact behavioral questions, but the competency space is small and stable (Lesson 1). So don't rehearse answers to questions — build a **story bank**: a set of real experiences, each written in STAR form, each tagged with the competencies it demonstrates. At interview time you *retrieve and adapt* the best-covering story for the question asked. A well-built bank of 6–10 stories covers virtually any behavioral prompt, because most questions are competencies in disguise."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The story bank as a covering set",
              "statement": "Let the competencies be a set C (ownership, conflict, ambiguity, impact, failure/growth, leadership, …). Build stories s₁, …, s_m where each sᵢ demonstrates a *subset* of C. The bank is **adequate** when the union of its stories' competencies covers C — every competency is demonstrable by at least one story — and **efficient** when a small number of stories achieves that cover (each strong story credibly hits 2–3 competencies). This is a set-cover: maximize competency coverage per story, so 6–10 well-chosen stories span the space and you're never caught without a relevant one."
            },
            {
              "type": "text",
              "heading": "The reverse map: question → best-covering story",
              "body": "In the round, the move is a lookup: parse the question to its target competency (Lesson 1), then retrieve the story in your bank that most strongly demonstrates it — adjusting the emphasis to foreground that competency. Because good stories are multi-competency, the *same* project can answer 'a time you showed ownership,' 'a time you influenced others,' and 'a hard technical decision' — you just spotlight a different facet each time. Preparing the reverse map (for each competency, which story do I tell?) means you retrieve in seconds instead of freezing while you search your memory under stress."
            },
            {
              "type": "example",
              "heading": "One project, three questions",
              "body": "Story: 'I noticed our on-call load was unsustainable, proposed and built an automated alerting-triage system, convinced two skeptical senior engineers, and cut pages 70%.' This single story answers: **ownership** ('a time you saw a problem no one owned and drove it' — I noticed, proposed, built), **influence/leadership** ('a time you moved people without authority' — convinced skeptical seniors), and **impact** ('your most impactful project' — 70% fewer pages across the team). Same facts, different spotlight. A bank of stories like this — each hitting 2–3 competencies with a quantified result — is what 'preparing for behavioral' actually means."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Write the bank down and rehearse the delivery, not a script.** Draft each story in STAR, tag its competencies, and practice telling it out loud in ~2 minutes — but don't memorize verbatim (it sounds canned and breaks under follow-ups). The goal is fluent recall of the *structure and the numbers*, so you can adapt naturally to the exact question and handle the interviewer's probes into the details."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You have 6 stories. Auditing your bank, you find none of them demonstrates 'dealing with ambiguity' or 'handling failure.' What's the problem in set-cover terms and how do you fix it?",
                  "solution": "The bank's competency coverage has gaps: the union of your stories' tags does not cover C (ambiguity and failure/growth are uncovered), so certain questions have no strong story to retrieve — you'll be caught improvising under stress. Fix: deliberately add (or re-frame) stories to cover the gaps — recall a real situation where you acted decisively without full information (ambiguity) and one where something failed and you learned/recovered (failure/growth), each written in STAR with a quantified or concrete result. You don't necessarily need more stories total if an existing project can be re-told to foreground the missing competency; the goal is full coverage of C with as few, as strong, stories as possible.",
                  "hint": "Which competencies are in C but not in the union of your stories' tags, and how do you cover them?"
                },
                {
                  "prompt": "Why prepare a reverse map (competency → story) rather than rehearsing answers to a list of specific questions?",
                  "solution": "Specific questions are unpredictable and near-infinite in phrasing, but they collapse to a small, stable set of competencies (Lesson 1). Rehearsing answers to specific questions over-fits — a slightly different phrasing leaves you stranded — and encourages canned, verbatim delivery that breaks under follow-ups. A reverse map from the (few) competencies to your best-covering stories generalizes: whatever the exact wording, you parse it to a competency and retrieve the mapped story, adapting emphasis. It's the difference between memorizing outputs and building an index — the index handles inputs you didn't foresee.",
                  "hint": "Compare over-fitting to specific questions vs. indexing by the small, stable competency set."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u11l2-i1",
              "front": "What should you prepare for behavioral rounds?",
              "back": "A story bank — real experiences in STAR form, each tagged with the competencies it demonstrates — not rehearsed answers to specific questions. Retrieve and adapt at interview time."
            },
            {
              "id": "u11l2-i2",
              "front": "When is a story bank adequate and efficient (set-cover)?",
              "back": "Adequate: the union of its stories' competencies covers the whole competency set C. Efficient: few stories (6–10) achieve it, each strong story hitting 2–3 competencies."
            },
            {
              "id": "u11l2-i3",
              "front": "The reverse map?",
              "back": "For each competency, which story do I tell? In the round, parse the question → target competency → retrieve the best-covering story, foregrounding that facet. Fast recall under stress."
            },
            {
              "id": "u11l2-i4",
              "front": "Why not memorize behavioral answers verbatim?",
              "back": "It over-fits to phrasings, sounds canned, and breaks under follow-up probes. Rehearse the STAR structure and the numbers so you can adapt naturally."
            }
          ]
        },
        {
          "id": "u11l3",
          "title": "Failure Modes & Handling the Hard Questions",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "The recurring ways strong engineers lose behavioral rounds",
              "body": "Behavioral failures are patterned and avoidable. Knowing the failure modes lets you pre-empt them — the same 'know the rubric, fill every box' discipline, applied to the traps."
            },
            {
              "type": "decision",
              "heading": "Failure mode → fix",
              "rows": [
                [
                  "Rambling, no structure — the interviewer can't find the answer",
                  "Use STAR explicitly; signal the slots ('the situation was…, so my task was…')"
                ],
                [
                  "'We' everywhere — individual contribution invisible",
                  "Set team context once, then 'I' for your specific actions/decisions"
                ],
                [
                  "No quantified result",
                  "End every story with a metric or concrete outcome + what you learned"
                ],
                [
                  "No real failure/conflict story (or a fake-humble one)",
                  "Prepare a genuine failure with real stakes, real lessons, and real change"
                ],
                [
                  "Blaming others for a failure or conflict",
                  "Own your part; show what YOU learned and did differently"
                ],
                [
                  "Canned, verbatim delivery that breaks on follow-ups",
                  "Rehearse structure + numbers, not a script; expect and welcome probes"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "'Tell me about a failure' is a growth question",
              "body": "The failure/conflict questions trip people because they try to disguise a strength ('my weakness is I work too hard') — which reads as evasive and fails the round. The competency being scored is **growth**: can you take real responsibility, learn, and change? So tell a *genuine* failure with actual stakes, then spend most of the answer on the Action/Result: what you learned and what you concretely did differently afterward (which prevented a recurrence). The arc is failure → ownership → lesson → changed behavior → better outcome. A real failure honestly handled scores far higher than a sanitized non-failure, because it demonstrates the growth competency the question exists to measure."
            },
            {
              "type": "text",
              "heading": "Handling the conflict question well",
              "body": "Conflict questions score collaboration and how you disagree (the same skill as disagreeing with an interviewer, Unit 7). The trap is telling a story where you either steamrolled the other person ('I was right, they came around') or capitulated. The high-signal arc: a substantive disagreement, engaged on the *merits* (you sought to understand their view, brought data), reaching a good outcome — ideally where you either changed your mind on evidence or persuaded them with reasoning, and the relationship stayed intact. 'I disagreed with a senior engineer's design; I asked what constraints drove it, ran a benchmark on the disputed point, and we adopted a hybrid — I was partly wrong about X' demonstrates exactly the collaborative, evidence-driven maturity teams want."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Never blame others for a failure or conflict.** Assigning fault to teammates, managers, or 'the org' on a failure question is the single most damaging behavioral answer — it signals exactly the lack of ownership and poor collaboration teams most fear. Even when others contributed, focus on your part, what you controlled, and what you learned. Ownership of your slice of a bad outcome is the signal; blame is an instant red flag."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A candidate answers 'tell me about a failure' with 'I once cared too much about code quality and slowed a launch.' Why does this fail, and what would a strong answer look like structurally?",
                  "solution": "It fails because it's a disguised strength (a humblebrag), not a genuine failure — it dodges the growth competency the question measures and reads as evasive/lacking self-awareness. A strong answer picks a real failure with actual stakes (a decision that caused a real bad outcome you were responsible for), owns your part without blaming others, and spends the bulk on the lesson and the concrete behavior change that followed and prevented a recurrence: failure → ownership → specific lesson → changed behavior → improved later outcome. The willingness to show a real failure honestly is itself the positive signal.",
                  "hint": "What competency does the failure question score, and does a disguised strength demonstrate it?"
                },
                {
                  "prompt": "Give the arc of a strong 'disagreed with a teammate' answer and name what each part signals.",
                  "solution": "Arc: (1) a substantive technical disagreement (context) — shows you engage on real issues; (2) you sought to understand their reasoning and the constraints behind it (Action) — signals collaboration and intellectual humility, not ego; (3) you brought evidence/data to the disputed point (Action) — signals evidence-driven decision-making; (4) resolution: you either updated on the evidence or persuaded them with reasoning, ideally a hybrid, and the working relationship stayed intact (Result) — signals that you disagree well and prioritize the outcome over winning. Crucially it avoids both steamrolling and capitulating: the signal is mature, merit-based disagreement, the same skill as taking a hint well in a technical round.",
                  "hint": "Engage on merits, bring data, reach a good outcome without steamrolling or caving — what does each step signal?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u11l3-i1",
              "front": "Top behavioral failure modes?",
              "back": "Rambling (no STAR), 'we' hiding your role, no quantified result, no genuine failure story, blaming others, canned verbatim delivery. Each maps to a fix."
            },
            {
              "id": "u11l3-i2",
              "front": "What does 'tell me about a failure' actually score?",
              "back": "Growth — can you take real responsibility, learn, and change? Tell a genuine failure; arc = failure → ownership → lesson → changed behavior → better outcome. Not a disguised strength."
            },
            {
              "id": "u11l3-i3",
              "front": "Strong 'conflict' answer arc?",
              "back": "Substantive disagreement → seek to understand their view → bring data on the disputed point → good outcome (updated or persuaded, relationship intact). Neither steamroll nor capitulate."
            },
            {
              "id": "u11l3-i4",
              "front": "The single most damaging behavioral move?",
              "back": "Blaming others for a failure/conflict — it signals lack of ownership and poor collaboration. Own your part and what you learned, even when others contributed."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u11-check",
        "questions": [
          {
            "id": "u11q1",
            "type": "short",
            "prompt": "The four-slot schema for structuring a behavioral answer is the acronym ____ (Situation, Task, Action, Result).",
            "accept": [
              "star",
              "s.t.a.r",
              "s.t.a.r.",
              "star."
            ],
            "explanation": "STAR: Situation, Task, Action, Result. Fill all four slots, weight Action heaviest, and land a quantified Result."
          },
          {
            "id": "u11q2",
            "type": "short",
            "prompt": "One word: the most common signal-killer where candidates hide their individual contribution by describing team actions instead of their own is saying '____' throughout.",
            "accept": [
              "we",
              "we.",
              "'we'"
            ],
            "explanation": "'We' — it leaves the ownership/impact boxes empty because the interviewer must score YOU. Set team context once, then use 'I' for your actions."
          },
          {
            "id": "u11q3",
            "type": "mcq",
            "prompt": "Asked 'tell me about a time you failed,' the strongest response is to:",
            "options": [
              "Give a disguised strength ('I care too much about quality')",
              "Describe a real failure you owned, then focus on the lesson and the concrete behavior change that followed",
              "Describe a failure that was mostly caused by a teammate or bad management",
              "Say you can't think of a significant failure"
            ],
            "answer": 1,
            "explanation": "The question scores growth. A genuine owned failure with a clear lesson and changed behavior demonstrates it; a disguised strength is evasive, blame is a red flag, and 'no failures' signals no self-awareness."
          },
          {
            "id": "u11q4",
            "type": "mcq",
            "prompt": "Why build a tagged 'story bank' rather than rehearse answers to a list of likely questions?",
            "options": [
              "Because interviewers ask the exact same questions every time",
              "Because the competency space is small and stable, so a few multi-competency stories cover almost any question via a competency → story lookup",
              "Because stories don't need to be true if they're well-structured",
              "Because behavioral rounds aren't actually scored"
            ],
            "answer": 1,
            "explanation": "Questions are unpredictable in phrasing but collapse to a small set of competencies. A set-covering bank of 6–10 multi-competency stories, retrieved by competency, generalizes to unforeseen phrasings — unlike over-fit rehearsed answers."
          },
          {
            "id": "u11q5",
            "type": "open",
            "points": 3,
            "prompt": "Take a real project from your own experience and construct a STAR answer to 'Tell me about a time you drove a project through significant resistance.' Then state which OTHER two behavioral questions the same story could answer and how you'd shift the emphasis for each.",
            "rubric": [
              "The answer has all four STAR slots, with Action (what the candidate specifically did) as the bulk and a QUANTIFIED or concrete Result.",
              "Uses individual ownership language ('I') for the candidate's decisions/actions while setting team context, not a diffuse 'we.'",
              "Directly addresses the resistance/influence element (moving people without authority, overcoming pushback) — the competency the question targets.",
              "Identifies two other questions the same story answers (e.g. ownership, conflict, impact) and explains the shift in emphasis for each — demonstrating the multi-competency / reverse-map idea.",
              "Concrete and self-consistent (a real, specific situation with real numbers), not a generic template."
            ],
            "solution": "A strong answer names a specific project (e.g. 'migrating our monolith's auth to a shared service'), then: Situation — the context and the candidate's role and the resistance (e.g. two senior engineers preferred the status quo, and leadership was wary of migration risk); Task — the specific goal the candidate owned; Action (the bulk) — the candidate's own steps: understanding the objections, building a small proof-of-concept, running a benchmark or risk analysis to address the specific concern, and the interpersonal work of persuading skeptics with evidence and a phased rollout that de-risked it; Result — a quantified outcome (e.g. 'shipped in 6 weeks, cut auth-related incidents 60%, adopted by 4 teams') plus a lesson. The same story answers 'a time you influenced people without authority' (foreground the persuasion/evidence work and the skeptics) and 'your most impactful project' (foreground the quantified result and scope), and could also serve 'a time you disagreed with senior colleagues' (foreground engaging the objections on merits). The candidate should explicitly note the emphasis shift for the two chosen alternates. Individual ownership ('I proposed/built/convinced') must be clear throughout, with numbers in the Result.",
            "explanation": "This exercises the whole unit: STAR structure with quantified result and 'I' ownership, addressing the influence/resistance competency, plus the multi-competency reverse-map (one story, several questions). The grader rewards concreteness and coverage, not a template."
          }
        ]
      }
    },
    {
      "id": "u12",
      "title": "Negotiation as a Game",
      "summary": "Compensation negotiation via decision and game theory: BATNA/ZOPA, the positive expected value of negotiating, exploding offers as commitment devices, and modeling total comp with vesting and risk.",
      "references": [
        "Fisher, Ury & Patton — Getting to Yes: BATNA, interests vs positions, objective criteria",
        "Chris Voss — Never Split the Difference: anchoring, calibrated questions",
        "levels.fyi / standard offer-modeling — base + bonus + equity vesting; RSU vs options (cross-links the `entrepreneurship` course: vesting S·m/T, dilution)"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u12l1",
          "title": "BATNA, ZOPA & Why You Always Negotiate",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Negotiation is a game with analyzable structure",
              "body": "Compensation negotiation feels social and scary, but it has the structure of a game you can reason about: each side has a walk-away point, there's a range where a deal is possible, and information and alternatives determine who captures the value. Treating it analytically — rather than emotionally — is what lets you negotiate calmly and effectively. The single most valuable fact: for a professional, the *expected value of negotiating is almost always positive*, so not negotiating leaves money on the table by default."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "BATNA, reservation value, and ZOPA",
              "statement": "Your **BATNA** (Best Alternative To a Negotiated Agreement) is what you'll do if this deal fails — your other offer, your current job, or continuing to search. It sets your **reservation value**: the least you'll accept (roughly your BATNA's value). The employer has their own reservation value (the most they'll pay for the role). The **ZOPA** (Zone Of Possible Agreement) is the overlap between what you'll accept and what they'll pay; a deal exists iff the ZOPA is non-empty, and negotiation decides *where in the ZOPA* you land. Improving your BATNA (a competing offer) raises your reservation value and shifts the whole ZOPA in your favor."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The expected value of negotiating is positive",
              "statement": "Let a professional counter-offer succeed (yield a raise Δ > 0) with probability p, and let q be the probability the offer is *rescinded* for negotiating, with loss L. The expected value of negotiating is E = p·Δ − q·L. Because offers are essentially never rescinded for a polite, professional negotiation (q ≈ 0), E ≈ p·Δ > 0 whenever there is any chance of a raise.",
              "proof": "By definition of expectation over the two outcomes (success vs rescission), E = p·Δ − q·L (other outcomes — a flat 'no, the offer stands' — contribute 0 change and are absorbed into 1 − p − q). Empirically and by the employer's own incentives, q ≈ 0: a company that has decided to hire you, run the whole expensive funnel, and extended an offer will not throw that away because you professionally asked for more — doing so would be irrational (re-opening the search costs far more than the delta) and is essentially unheard of for normal, respectful negotiation. With q ≈ 0, E ≈ p·Δ, and since p > 0 and Δ > 0, E > 0. ∎\n\nThe asymmetry is the whole point: the downside of a professional ask is ~0, the upside is a real, compounding raise (it also lifts future raises and offers, which are often percentages of the current number). So the default action is to negotiate; declining to is the choice that has negative expected value relative to asking."
            },
            {
              "type": "text",
              "heading": "Information and the anchor",
              "body": "Two levers decide where in the ZOPA you land. **Information:** know the market range (levels.fyi, comparable offers) so you can anchor on a researched number and recognize a low offer; avoid volunteering your *current* salary or a specific number first when you can, since whoever anchors first shapes the range — and if forced, give a researched, ambitious-but-defensible range, not your reservation value. **The recruiter's incentives:** the recruiter wants to close you at a reasonable number, not the minimum — they're an ally with a band to work within, not an adversary, so framing your ask around objective criteria ('based on the market and my competing offer') gives them ammunition to advocate for you internally."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Negotiate professionally, always, and the downside stays ~0.** The rescission risk isn't from negotiating — it's from negotiating *badly* (aggressive ultimatums, dishonesty, reneging on a verbal accept). A warm, appreciative, evidence-based counter ('I'm excited to join; based on market data and another offer, could we get the base to X?') carries essentially no risk and routinely yields five figures. The professionalism is what keeps q ≈ 0."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You estimate a professional counter has a 60% chance of yielding a $15,000 raise, a 40% chance of no change, and (realistically) ~0% chance of rescission. Compute the expected value of negotiating and interpret it.",
                  "solution": "E = p·Δ − q·L = 0.60 × $15,000 − 0 × L = $9,000 expected gain, with essentially no downside. Even at a pessimistic p, the EV is strongly positive because the rescission term is ~0 — the asymmetry (large upside, ~zero downside) makes negotiating the default rational action. Declining to negotiate forfeits this $9,000 expected value, and since raises compound into future comp and offers, the true expected value is larger than the one-year figure.",
                  "hint": "E = p·Δ − q·L with q ≈ 0."
                },
                {
                  "prompt": "Explain, using BATNA and ZOPA, why obtaining a second offer typically increases your final compensation even if you never intended to take it.",
                  "solution": "A second offer raises your BATNA (your best alternative is now that offer, not unemployment or your old job), which raises your reservation value — the minimum you'll accept. Since the ZOPA is the overlap between what you'll accept and what the employer will pay, raising your reservation value shifts the ZOPA upward: deals below the competing offer's value now fall outside your acceptable range, so the settlement point moves up. Concretely, a credible competing offer both gives you a real walk-away (you can leave without disaster, so you can hold firm) and gives the recruiter objective justification to raise their offer internally. You capture more of the ZOPA even without intending to take the alternative — its value is as leverage, not as a destination.",
                  "hint": "What does a competing offer do to your reservation value, and hence to where you land in the ZOPA?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u12l1-i1",
              "front": "BATNA, reservation value, ZOPA?",
              "back": "BATNA = your best alternative if the deal fails; reservation value = least you'll accept (~BATNA). ZOPA = overlap of what you'll accept and they'll pay. Better BATNA shifts ZOPA your way."
            },
            {
              "id": "u12l1-i2",
              "front": "Why is the EV of negotiating positive?",
              "back": "E = p·Δ − q·L; offers are ~never rescinded for professional negotiation (q≈0), so E ≈ p·Δ > 0. Downside ~0, upside a real (compounding) raise."
            },
            {
              "id": "u12l1-i3",
              "front": "Who should anchor / say a number first?",
              "back": "Prefer not to volunteer your current salary or a first number; whoever anchors shapes the range. If forced, give a researched, ambitious-but-defensible range, not your reservation value."
            },
            {
              "id": "u12l1-i4",
              "front": "What keeps rescission risk ~0?",
              "back": "Negotiating PROFESSIONALLY — warm, appreciative, evidence-based. The risk comes from negotiating badly (ultimatums, dishonesty, reneging), not from asking."
            }
          ]
        },
        {
          "id": "u12l2",
          "title": "Competing Offers & Exploding Offers",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "Leverage is a credible alternative",
              "body": "Everything in negotiation reduces to your BATNA's credibility. A **competing offer** is the strongest BATNA — it's concrete, verifiable, and time-bound. It converts 'I'd like more' into 'I have $X elsewhere,' which reshapes the ZOPA (Lesson 1) and gives the recruiter objective grounds to raise their number. This is why Unit 2's *batching* matters: applications timed to produce concurrent offers create leverage that the same offers arriving sequentially never would."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The exploding offer as a commitment device",
              "statement": "An **exploding offer** comes with a short deadline ('decide in 72 hours') and its purpose is *strategic*: by forcing a decision before your other processes finish, it artificially shrinks your BATNA — you can't get competing offers if you must answer now. In game-theoretic terms it's a **commitment device**: the company commits to a deadline to deny you leverage, betting you'll accept rather than risk having nothing. Recognizing it as a tactic (not a genuine constraint) is the defense: the deadline is usually far softer than presented."
            },
            {
              "type": "decision",
              "heading": "Handling an exploding offer",
              "rows": [
                [
                  "Deadline is before your other processes finish",
                  "Ask for an extension, honestly ('I'm excited; I have processes closing in 2 weeks — can we align timelines?') — extensions are common"
                ],
                [
                  "They refuse any extension and pressure hard",
                  "Weigh it as a signal about the culture; a firm-but-fair employer usually accommodates a reasonable ask"
                ],
                [
                  "You have no other offers and the deadline is real for you",
                  "Your BATNA is weak — accept or negotiate within the offer; don't bluff a competing offer you don't have"
                ],
                [
                  "You do have (or can accelerate) another process",
                  "Tell the other company you have an offer with a deadline — this often accelerates their process, creating the competing offer"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "The option value of waiting",
              "body": "Accepting an exploding offer immediately forecloses the *option* to get a better one — and that option has value. If waiting two weeks gives a reasonable chance p of a competing offer worth Δ more, the expected value of waiting is roughly p·Δ minus any small risk-adjusted cost of the delay (which, given q ≈ 0 rescission risk, is small). Because good candidates frequently have p meaningfully above zero, the option to wait is usually worth more than the certainty of accepting now — which is exactly why the company tries to extinguish it with a deadline. Don't surrender a valuable option to manufactured urgency."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Never bluff a competing offer you don't have.** Leverage works because it's credible; a fabricated offer can be called (recruiters talk, and 'send it to us' ends the bluff), destroying trust and your position. Use real alternatives, or negotiate honestly on market data and your value. An honest 'I don't have another offer yet, but based on the market I was hoping for X' is stronger than a lie that can collapse."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You have an exploding offer due Friday, and two other onsites next week that you estimate give a 50% chance of a competing offer worth $20k more. Frame the expected value of asking for a deadline extension, and the action.",
                  "solution": "Asking for an extension preserves the option to obtain the competing offer. Its expected value is ~p·Δ = 0.50 × $20,000 = $10,000, against a near-zero downside (a professional extension request essentially never causes rescission — q ≈ 0). So the action is to ask, warmly and honestly, for the deadline to move ~2 weeks to align with your other processes; simultaneously tell the other companies you have an offer with a deadline (which often accelerates them into producing the competing offer). Accepting Friday forecloses a $10k-expected option for no good reason; the exploding deadline is a commitment device to make you do exactly that.",
                  "hint": "The extension buys the option worth ~p·Δ; what's the downside of asking?"
                },
                {
                  "prompt": "Why does batching applications (Unit 2) directly increase negotiating leverage, in BATNA terms?",
                  "solution": "Leverage is a credible BATNA, and the strongest BATNA is a concurrent competing offer. Batching times your applications so that onsites and offers arrive in the same window, making it likely you hold *two live offers at once* — each is then the other's BATNA, so you can credibly say 'I have $X from company B' to company A. Sequential offers can't do this: by the time the second arrives, the first has expired or been accepted, so neither serves as leverage for the other. Batching is thus not just variance management (Unit 2) but the mechanism that manufactures the competing-offer BATNA that reshapes the ZOPA in your favor.",
                  "hint": "Concurrent offers make each the other's BATNA; sequential offers don't overlap to do that."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u12l2-i1",
              "front": "Why is a competing offer the strongest leverage?",
              "back": "It's a concrete, credible BATNA — it raises your reservation value, shifts the ZOPA up, and gives the recruiter objective grounds to raise their number."
            },
            {
              "id": "u12l2-i2",
              "front": "What is an exploding offer, game-theoretically?",
              "back": "A commitment device: a short deadline that artificially shrinks your BATNA by forcing a decision before other offers land. Usually softer than presented — ask for an extension."
            },
            {
              "id": "u12l2-i3",
              "front": "The option value of waiting?",
              "back": "Accepting now forecloses the option of a better offer, worth ~p·Δ (chance × improvement). With ~zero rescission risk, the option usually beats accepting immediately — which is why deadlines exist."
            },
            {
              "id": "u12l2-i4",
              "front": "Rule about competing offers?",
              "back": "Never bluff one you don't have — it's callable ('send it over') and destroys trust. Use real alternatives or negotiate honestly on market data."
            }
          ]
        },
        {
          "id": "u12l3",
          "title": "Modeling the Offer",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Compare total comp, risk-adjusted — not base salary",
              "body": "Offers are multi-part and hard to compare by eye: base, bonus, sign-on, and equity that vests over years with very different risk. To choose rationally you need one model that converts each offer to a comparable annualized, risk-adjusted number. Comparing base salaries alone (or headline 'total comp' that front-loads a sign-on) leads to bad decisions."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Annualized total compensation",
              "statement": "Model annualized comp as\n\n  TC ≈ base + target_bonus + (equity_grant_value / vesting_years) + amortized_signon,\n\nwhere equity vesting is the same linear S·m/T schedule as in the `entrepreneurship` course (a grant S vesting evenly over T years is S/T per year, after any cliff). A **cliff** (commonly 1 year) means you get *nothing* if you leave before it, then a lump; sign-on bonuses are one-time, so amortize them over your expected tenure, not counted every year. Compare offers on this annualized TC, not on base or headline totals."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Risk-adjusting equity: RSUs vs options",
              "statement": "Equity value is uncertain and must be **risk-adjusted**. **Public RSUs**: value ≈ shares × current price, fairly liquid — a modest haircut for price volatility over the vest. **Private/startup equity**: multiply the paper value by a probability/illiquidity haircut P (the chance of a good outcome × discount for being locked up) — often a heavy discount, because most startups don't produce a large liquid exit. **Options** carry a strike K: value ≈ max(0, expected_price − K) × shares — they are *worthless if underwater* (price ≤ K) and dilute over future rounds (entrepreneurship: dilution ∏(1−fᵢ)). Rule: value public RSUs near face (small haircut); discount private equity hard; treat options' strike and dilution explicitly."
            },
            {
              "type": "example",
              "heading": "Two offers, modeled",
              "body": "Offer A (public co): base $180k, bonus 15% ($27k), RSUs $400k over 4 years. Annualized: 180 + 27 + 100 (400/4) = **$307k**, mostly liquid — light haircut, call it ~$300k risk-adjusted. Offer B (startup): base $170k, no bonus, options 'worth' $600k over 4 years at a $2 strike. Paper annualized: 170 + 150 = $320k. But risk-adjust the equity: apply, say, a 20% probability-of-good-outcome haircut (P = 0.2) to the $150k/yr option value → ~$30k/yr expected, and it's zero if the company doesn't exit above the strike. Risk-adjusted B ≈ 170 + 30 = **~$200k**. Headline B ($320k) looks bigger than A ($307k), but risk-adjusted, A (~$300k) beats B (~$200k) — unless you're explicitly betting on the startup's upside (and value the growth/learning). The model flips the naive comparison."
            },
            {
              "type": "text",
              "heading": "Beyond the number: COL, growth, and horizon",
              "body": "Two more adjustments before deciding. **Cost of living:** normalize by location — $300k in San Francisco is not $300k in Austin; compare *after* housing/tax/COL, not nominal. **Growth and trajectory:** early-career, the *rate of learning and the trajectory* (scope, mentorship, the brand's option value for the next job) can dominate a comp delta, because your future earnings are a function of skill and reputation compounding — a somewhat lower-paying role that accelerates you can have higher lifetime expected value. **Horizon:** weigh the 2-year expected value (liquid comp + skill gained) against the 10-year (trajectory, optionality). The right choice maximizes risk-adjusted lifetime value, of which the first-year number is only one term."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Model first, then let non-comp factors break ties.** Do the risk-adjusted annualized math so you know the real comp gap (often smaller or reversed vs headlines). Then weigh team, manager, scope, learning, and trajectory — which frequently *should* outweigh a modest comp difference early-career. The mistake is either ignoring the math (chasing a headline number) or ignoring everything but the math (taking the top number into a dead-end role)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Offer: base $160k, 10% target bonus, $240k RSUs vesting over 4 years (1-year cliff), $40k sign-on. You expect to stay ~4 years. Compute the annualized total comp (treat public RSUs near face).",
                  "solution": "Base $160k + bonus 0.10×160 = $16k + equity 240/4 = $60k/yr + sign-on amortized 40/4 = $10k/yr = $246k/year annualized. (The 1-year cliff affects *timing* — you get nothing if you leave in year 1, then the first year's tranche — but over the full 4-year expected tenure the average is $60k/yr of equity.) Public RSUs are treated near face with only a light volatility haircut. So ~$246k annualized, which is the number to compare against other offers on the same basis — not the $160k base or a headline that adds the whole $240k grant into year one.",
                  "hint": "base + bonus + grant/vesting_years + signon/tenure."
                },
                {
                  "prompt": "Why apply a heavy discount to startup option value but only a light one to public-company RSUs, and what does a strike price add?",
                  "solution": "Public RSUs are shares of a liquid, priced company: you can sell near the market price as they vest, so their value is close to face with only a modest haircut for price volatility over the vesting period. Startup options are illiquid and probabilistic: there's no market to sell into, most startups don't reach a large exit, and value depends on a future liquidity event — so you multiply the paper value by a probability-of-good-outcome × illiquidity haircut (often reducing it substantially). A strike price K adds a further condition: options only pay max(0, price − K) per share, so if the eventual price is at or below the strike they're worthless (underwater), and future funding rounds dilute your stake (∏(1−fᵢ), entrepreneurship course). So options must be discounted for probability, illiquidity, the strike, and dilution — whereas RSUs need only a light volatility haircut.",
                  "hint": "Liquidity + probability of exit + strike + dilution — which apply to options vs RSUs?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u12l3-i1",
              "front": "Annualized total comp model?",
              "back": "base + target_bonus + equity_grant/vesting_years + signon/tenure. Compare offers on this, not on base or a headline that front-loads the grant. Cliff affects timing."
            },
            {
              "id": "u12l3-i2",
              "front": "How to risk-adjust equity?",
              "back": "Public RSUs: near face, light volatility haircut (liquid). Startup equity: multiply by probability-of-good-outcome × illiquidity haircut (heavy). Options: max(0, price−strike), worthless if underwater, plus dilution."
            },
            {
              "id": "u12l3-i3",
              "front": "Adjustments beyond the raw number?",
              "back": "Cost-of-living normalization (SF ≠ Austin), and growth/trajectory (learning, scope, brand) which can dominate a comp delta early-career via compounding future earnings."
            },
            {
              "id": "u12l3-i4",
              "front": "The decision rule for choosing an offer?",
              "back": "Model risk-adjusted annualized comp first (headlines often mislead), then let non-comp factors (team, scope, trajectory) break ties. Maximize risk-adjusted lifetime value, not year-1 nominal."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u12-check",
        "questions": [
          {
            "id": "u12q1",
            "type": "short",
            "prompt": "The acronym for your best alternative if the negotiation fails — which sets your reservation value — is ____.",
            "accept": [
              "batna",
              "b.a.t.n.a",
              "batna.",
              "b.a.t.n.a."
            ],
            "explanation": "BATNA — Best Alternative To a Negotiated Agreement. A stronger BATNA (e.g. a competing offer) raises your reservation value and shifts the ZOPA your way."
          },
          {
            "id": "u12q2",
            "type": "numeric",
            "prompt": "A professional counter has a 50% chance of gaining $20,000, a 50% chance of no change, and ~0% chance of rescission. What is the expected value (in dollars) of negotiating?",
            "answer": 10000,
            "tolerance": 100,
            "explanation": "E = p·Δ − q·L = 0.5 × 20,000 − 0 = $10,000. The rescission term is ~0 for professional negotiation, so the EV is strongly positive — negotiating is the default rational action."
          },
          {
            "id": "u12q3",
            "type": "numeric",
            "prompt": "An offer is base $170k, 10% target bonus, and $200k of RSUs vesting evenly over 4 years. What is the annualized total compensation (public RSUs at face)? (dollars)",
            "answer": 237000,
            "tolerance": 1000,
            "explanation": "170,000 + 0.10×170,000 (17,000) + 200,000/4 (50,000) = $237,000/year. Compare offers on this annualized basis, not on base salary."
          },
          {
            "id": "u12q4",
            "type": "numeric",
            "prompt": "A startup grants options with paper value $120,000/year. You assess a 25% probability-weighted, illiquidity-discounted value. What is the risk-adjusted annual equity value? (dollars)",
            "answer": 30000,
            "tolerance": 500,
            "explanation": "0.25 × $120,000 = $30,000. Startup equity is heavily discounted for probability of a good exit and illiquidity (and is zero if options end up underwater) — very different from near-face public RSUs."
          },
          {
            "id": "u12q5",
            "type": "open",
            "points": 3,
            "prompt": "You hold two offers. A (public company): base $185k, 15% bonus, $360k RSUs over 4 years. B (Series-B startup): base $170k, no bonus, options with $520k paper value over 4 years, and you judge a ~20% probability-and-illiquidity-adjusted value, plus you believe the role offers faster growth. Model both, decide, and justify — including which factors you'd let override the raw comparison.",
            "rubric": [
              "Computes A's annualized comp correctly (base + bonus + RSUs/4, treated near face) and B's both at paper value AND risk-adjusted (applying the ~20% haircut to the option value, noting strike/underwater and dilution risk).",
              "Makes the correct comparison on a RISK-ADJUSTED annualized basis (not headline), showing A's real comp vs B's much-lower risk-adjusted comp.",
              "Weighs the non-comp factors deliberately — growth/trajectory, startup risk, liquidity, cost-of-living — rather than deciding on the number alone or ignoring the number.",
              "Reaches a defensible decision tied to the candidate's stated priorities and horizon (e.g. A for risk-adjusted comp + liquidity; B only if explicitly betting on upside/growth), and states what would change the decision.",
              "Quantitative, internally consistent, and uses the unit's concepts (annualized TC, risk-adjusting equity, growth vs comp)."
            ],
            "solution": "Model A: 185 + 0.15×185 (27.75) + 360/4 (90) = ~$303k/year, mostly liquid RSUs (light haircut) → risk-adjusted ~$295–300k. Model B at paper: 170 + 520/4 (130) = $300k/year — deceptively similar to A. But risk-adjust B's equity: 0.20 × 130 = ~$26k/year expected, and options carry strike/underwater risk and dilution, so risk-adjusted B ≈ 170 + 26 ≈ ~$196k/year, with far less liquidity and higher variance. So on risk-adjusted annualized comp, A (~$300k liquid) clearly beats B (~$196k, illiquid, high-variance) — the headline near-tie reverses once you discount the startup equity. Decision: if I'm optimizing risk-adjusted comp and want liquidity/stability, take A. I'd let B override only if I explicitly value its faster growth/scope and am willing to bet on the upside — early-career, a materially faster learning trajectory and larger scope can raise lifetime expected earnings enough to justify a lower, riskier near-term number, and startup options have a fat right tail. What would change it: a much larger or more-liquid B equity (later stage, secondary market), a strong signal the startup will exit well (raising my 20%), a big COL difference, or evidence the growth gap is smaller than I think. Net: A on the numbers; B is a deliberate upside/growth bet, not a comp-maximizing choice.",
            "explanation": "The synthesis: annualize both, risk-adjust the startup equity hard (the near-tie reverses), then let growth/risk/liquidity/horizon break the decision deliberately. Strong answers do the math AND weigh the non-comp factors, rather than either alone."
          }
        ]
      }
    },
    {
      "id": "u13",
      "title": "Prep as Optimization & Interview-Day Execution",
      "summary": "Treating preparation as an eval-driven loop, executing on the day under the arousal–performance curve, and making the final offer decision — the course's synthesis.",
      "references": [
        "Eval-driven development — build a failing-case set, fix, re-run, no regressions (cross-links the `ai-implementation` course, m3l4; and this app's own spaced-repetition engine)",
        "Yerkes & Dodson (1908) — the arousal/performance inverted-U; Ericsson — deliberate practice",
        "Fisher & Ury (Getting to Yes) & Unit 12 — the offer decision under uncertainty"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u13l1",
          "title": "Prep as an Eval-Driven Loop",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Prep is an optimization problem, and you know the objective",
              "body": "Units 1–2 defined the objective: raise q (your per-application offer probability) by raising θ and your signal-emission, and attack correlated weaknesses first. This lesson is the *method* — how to actually improve efficiently. Grinding random problems is the analogue of tuning on vibes; the disciplined alternative is an **eval-driven loop**, the same discipline the `ai-implementation` course applies to AI systems and that this very app applies to your knowledge via spaced repetition."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The eval-driven prep loop",
              "statement": "Prep as a closed loop: (1) **Build an eval set** — a representative list of problems/patterns and mock questions across the arcs. (2) **Attempt** under realistic conditions (timed, out loud). (3) **Log every failure** as a specific, labeled case ('failed to see the monotonic-predicate trigger,' 'blanked on the capacity estimation'). (4) **Turn each failure into a spaced-repetition card** so it resurfaces until mastered — the failure becomes a permanent test, exactly as in eval-driven development. (5) **Change one thing** (drill that pattern, re-derive that formula) and **re-attempt**, confirming the fix without regressions. Quality ratchets upward because fixed weaknesses can't silently return."
            },
            {
              "type": "text",
              "heading": "Allocate practice by marginal return",
              "body": "You have limited hours; spend each where it raises your pass probability most — the **marginal return** Δ(pass) per hour. That is almost always your *weakest, most-correlated* failure (Unit 2): if you reliably fail system design (arc at 0.5) while your coding is strong (0.9), an hour on system design buys far more than an hour on coding, because it lifts a binding stage of the funnel. Concretely, if 10 hours raises system design from 0.5→0.7 (0.02/hr) versus coding 0.9→0.95 (0.005/hr), system design has 4× the marginal return — and it fixes a *correlated* failure that was sinking every application. Diagnose your weakest arc from your eval-set failures, and pour hours there until its marginal return drops below another arc's."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Deliberate practice beats volume.** Ericsson's finding: improvement comes from focused work at the edge of your ability with immediate feedback and correction — not from repeating what you can already do. A hundred easy problems you can already solve raise θ far less than twenty hard problems in your weakest pattern, attempted, failed, corrected, and spaced-repeated. The eval-driven loop *is* deliberate practice: it forces you to the edge (your logged failures) and closes the feedback loop."
            },
            {
              "type": "text",
              "heading": "Mocks are your online eval",
              "body": "Solo practice is *offline* eval (you grade yourself, and you'll miss your own blind spots — especially signal-emission and communication, which you can't observe from inside). **Mock interviews** are the *online* eval: a realistic run against a human (or this app's AI-graded `open` questions) that surfaces the failures your self-grading hides — a nervous ramble, an unstated complexity, a hint you resisted. Just as production monitoring catches what offline tests missed (ai-implementation course), mocks catch what solo grinding missed. Fold every mock failure back into the eval set. The loop closes when your mock failures dry up across all arcs."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You have 40 prep hours. Your assessed pass probabilities: coding 0.85, system design 0.45, behavioral 0.70. Argue how to allocate, using marginal return and the correlated-failure idea.",
                  "solution": "System design (0.45) is both your weakest arc and — if it reliably fails — a correlated failure that sinks whole onsites (Unit 2), so it has the highest marginal return per hour: lifting 0.45→0.7 removes a binding constraint that every application hits. Allocate the bulk (say ~25 hrs) there first, until its marginal return falls toward the others'. Behavioral (0.70) is next — meaningful and cheap to improve (build the story bank, Unit 11) — allocate ~10 hrs. Coding (0.85) is already strong; a few hours (~5) of maintenance/spaced review suffices, since further gains there buy little (low marginal return). The rule: pour hours into the weakest, most-correlated arc until another arc's Δ(pass)/hr overtakes it — not evenly, and not into what's already strong.",
                  "hint": "Where is Δ(pass)/hour highest, and which weakness is correlated across applications?"
                },
                {
                  "prompt": "How is turning each practice failure into a spaced-repetition card the same discipline as eval-driven development?",
                  "solution": "In eval-driven development, every observed bug becomes a permanent labeled test case, so a fix is verified and the bug can never silently regress — quality ratchets upward. Turning each interview-prep failure into a spaced-repetition card does exactly this: the specific gap (a missed trigger, a forgotten formula) becomes a permanent 'test' that resurfaces on the forgetting curve until you reliably pass it, so a weakness you fixed can't quietly return before the interview. Both convert failures into a growing regression suite and close the loop with re-testing; the SRS is your eval harness for durable recall, and this app implements it directly.",
                  "hint": "What does eval-driven development do with every observed failure, and how does an SRS card mirror it?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u13l1-i1",
              "front": "The eval-driven prep loop?",
              "back": "Build an eval set of problems → attempt (timed, aloud) → log each failure as a labeled case → make it a spaced-repetition card → change one thing and re-attempt. Failures become permanent tests; quality ratchets up."
            },
            {
              "id": "u13l1-i2",
              "front": "How to allocate prep hours?",
              "back": "By marginal return Δ(pass)/hour — pour into your weakest, most-correlated arc (Unit 2) until its marginal return drops below another's. Not evenly; not into what's already strong."
            },
            {
              "id": "u13l1-i3",
              "front": "Mocks vs solo practice?",
              "back": "Solo = offline eval (misses your blind spots, esp. communication). Mocks (or AI-graded open questions) = online eval that surfaces the failures self-grading hides. Fold mock failures back into the eval set."
            },
            {
              "id": "u13l1-i4",
              "front": "Why deliberate practice over volume?",
              "back": "Improvement comes from working at the edge of ability with feedback and correction — 20 hard problems in your weakest pattern (failed, fixed, spaced) beat 100 easy ones you can already solve."
            }
          ]
        },
        {
          "id": "u13l2",
          "title": "Interview-Day Execution",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "On the day, execution variance is yours to reduce",
              "body": "Preparation raised θ; the day is about not letting self-inflicted noise (ε, Unit 1) bury it. Two failure modes are common and manageable: performing at the wrong arousal level, and mismanaging the clock within a round. Both are addressable with a model and a plan."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The Yerkes–Dodson arousal–performance curve",
              "statement": "Performance is an **inverted-U function of arousal** (Yerkes & Dodson, 1908): too little arousal → understimulation, carelessness, missing signal; too much → anxiety that impairs working memory (you 'blank' or 'choke'); performance peaks at a *moderate* arousal. The optimum is **lower for complex tasks** than simple ones — so hard reasoning under interview pressure suffers most from over-arousal. The goal is not zero nerves (that's the flat left tail) but the moderate middle: alert and focused, not panicked."
            },
            {
              "type": "text",
              "heading": "Moving yourself toward the optimum",
              "body": "You can shift your arousal toward the peak. **If over-aroused** (the common case — anxiety impairing the working memory that hard problems need): slow, deep breathing (down-regulates the stress response); **reframe** the anxiety as excitement (same physiology, better interpretation — 'I'm energized' outperforms 'I'm calm' under evaluative stress); and lean on *structure* — the pipeline (Unit 3) and STAR (Unit 11) give your depleted working memory an external scaffold so you're executing a known procedure, not improvising. **If under-aroused** (a late, easy-seeming round): raise the stakes internally, engage actively. Preparation itself lowers arousal by making the situation familiar — the best anxiety reducer is having done it before (mocks, Lesson 1)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "In-round time budgeting",
              "statement": "A ~40-minute coding round has a rough budget: **~5 min** clarify + examples, **~10 min** approach (brute force → optimize, verified before coding), **~15 min** code, **~5 min** test, **~5 min** buffer/analysis. The failure is spending 30 minutes silently searching for the optimal solution and leaving no time to code or test. Watch the clock: if you're not converging on the approach by the budgeted point, bank the brute force (Unit 3) and start coding *something* correct — a working suboptimal solution scores far more than an unfinished optimal one."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Reset between rounds — each loop is independent (Unit 1).** A rough round is one noisy draw; the next interviewer starts fresh and usually hasn't seen your last score. Ruminating on a bad round *raises arousal* into the choke zone for the next one, turning one bad draw into two. Take the break, breathe, reframe, and treat the next loop as the independent measurement it is. The candidate who recovers from a weak round outperforms the one who spirals."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A candidate reports 'blanking' — forgetting basic approaches — during hard onsite problems, despite solving them easily at home. Explain using Yerkes–Dodson and give two concrete interventions.",
                  "solution": "At home, arousal is low-to-moderate (near the optimum for complex reasoning); in the onsite, evaluative pressure pushes arousal past the peak into the right tail, where anxiety impairs the working memory that hard problem-solving requires — hence 'blanking' despite knowing the material. Since the optimum is lower for complex tasks, hard problems are exactly where over-arousal bites. Interventions: (1) down-regulate arousal in the moment — slow deep breathing before/while thinking, and reframe nerves as excitement — to move left toward the peak; (2) offload working memory onto external structure — run the explicit pipeline (clarify → examples → brute force → optimize) so you're following a known procedure rather than improvising under load; and (3) longer-term, do timed mock interviews so the situation becomes familiar and its baseline arousal drops. The fix is not 'try to be calm' (hard under pressure) but lowering arousal and scaffolding the depleted working memory.",
                  "hint": "Where on the inverted-U is the candidate at home vs onsite, and what impairs hard reasoning at high arousal?"
                },
                {
                  "prompt": "It's 20 minutes into a 40-minute coding round and you still haven't found the optimal approach, though you have a working O(n²) brute force. What does the time budget say to do, and why?",
                  "solution": "The budget allots ~10 min to settle the approach and ~15 to code; at 20 minutes with no optimal approach, continuing to search risks leaving no time to code or test anything — the classic failure. The move: bank the brute force — start coding the correct O(n²) solution now, narrating that it's the safe baseline while you keep an eye out for the optimization. A complete, tested, suboptimal solution scores far more than an unfinished optimal one (partial-credit reality, Unit 3), and having working code often frees the mind to spot the optimization. Time management here is a scoring decision: guarantee a correct submission, then improve if time allows.",
                  "hint": "What scores more — a finished suboptimal solution or an unfinished optimal one — and what does the clock demand?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u13l2-i1",
              "front": "The Yerkes–Dodson curve?",
              "back": "Performance is an inverted-U in arousal: too little → careless; too much → anxiety impairs working memory (choke); peak at moderate arousal. The optimum is LOWER for complex tasks."
            },
            {
              "id": "u13l2-i2",
              "front": "Interventions for over-arousal (choking)?",
              "back": "Deep breathing (down-regulate), reframe anxiety as excitement, and offload working memory onto external structure (the pipeline, STAR). Mocks lower baseline arousal via familiarity."
            },
            {
              "id": "u13l2-i3",
              "front": "Rough 40-min coding-round time budget?",
              "back": "~5 clarify, ~10 approach (verified brute→optimize), ~15 code, ~5 test, ~5 buffer. If not converging on the approach in time, bank the brute force and start coding."
            },
            {
              "id": "u13l2-i4",
              "front": "Why reset between rounds?",
              "back": "Each loop is an independent draw (Unit 1); ruminating on a bad round raises arousal into the choke zone for the next, turning one bad draw into two. Breathe, reframe, move on."
            }
          ]
        },
        {
          "id": "u13l3",
          "title": "The Offer Decision & Closing",
          "estMinutes": 18,
          "content": [
            {
              "type": "text",
              "heading": "The last decision: which offer, and how to close",
              "body": "You've run the funnel, cleared the gates, and negotiated (Unit 12). The final step is choosing well among offers and closing gracefully. This is a decision under uncertainty with both quantitative and qualitative inputs — the course's synthesis: model the numbers, weigh the non-numbers, and act in a way your future self (and your reputation) will endorse."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The offer-decision model",
              "statement": "Choose the offer maximizing **risk-adjusted expected lifetime value**, not year-one nominal comp. Inputs: (1) risk-adjusted annualized comp (Unit 12 — model equity, discount startup/option risk, normalize for cost of living); (2) growth/trajectory (learning rate, scope, mentorship, brand option-value for the next role — often dominant early-career via compounding); (3) fit (team, manager, the actual day-to-day work); (4) risk and your tolerance for it (a startup's fat-tailed upside vs a public company's stability). Compute the comp model first so you know the real gap, then let (2)–(4) decide when the gap is modest."
            },
            {
              "type": "text",
              "heading": "When to walk away",
              "body": "Your BATNA (Unit 12) also tells you when *no* offer here is the right choice. If every offer is below your reservation value — worse than your current role or continued search — walking away is rational, not a failure; accepting a bad-fit or under-market role has real opportunity cost (it forecloses better options and can stall your trajectory). Signs to walk: a role misaligned with your growth goals, a manager/team that felt wrong in the loop, comp far below market with no movement, or a process that treated you poorly (often a preview of the culture). A strong BATNA is what gives you the freedom to decline — which is why the whole funnel-and-negotiation apparatus exists."
            },
            {
              "type": "text",
              "heading": "Closing gracefully — the world is small",
              "body": "How you close matters beyond this deal. **Accept** clearly and warmly once decided; then *stop shopping* and honor it — reneging on a verbal or signed accept to chase a late offer burns the bridge badly and the industry is small (recruiters, managers, and teammates recur across a career). **Decline** the others promptly and graciously, thanking them — you may interview there again, or work with these people later. Keep every door you can: today's rejecting manager is tomorrow's colleague or referrer, and today's declined company may be your best option in three years. The reputational compounding is real, and it's cheap to protect."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Don't renege on an accepted offer.** Once you've genuinely accepted (especially in writing), continuing to shop and then backing out is the one closing move that does lasting damage — it burns the team that planned around you, spreads by word of mouth in a small industry, and can follow you. If you need more time to decide, get it *before* accepting (Unit 12's extension), not after. Decide, then commit."
            },
            {
              "type": "text",
              "heading": "The course in one line",
              "body": "An interview is a noisy, asymmetric measurement of your competence (Unit 1) sampled across a high-variance funnel (Unit 2). You raise your outcome by raising θ (Arcs 1–3: algorithms, system design, behavioral), emitting dense signal, reducing your own noise (Unit 13), and playing the meta-game well (Units 2, 12). Prep is an eval-driven loop; the day is arousal management and time budgeting; the finish is a modeled, values-aligned decision closed with your reputation intact. None of it is luck once you see the structure."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You verbally accepted Offer A last week. Today a better Offer B arrives. What should you do, and what principle governs it?",
                  "solution": "Honor the acceptance of A. A verbal accept is a commitment the team plans around; reneging to take B burns that bridge in a small industry where recruiters and managers recur, and the reputational cost can outlast any comp delta from B. The governing principle is that closing gracefully protects long-run reputational value, which compounds across a career and usually outweighs a one-time gain. The correct time to have preserved optionality was *before* accepting — asking A for more time (Unit 12's extension) while B's process finished. Having accepted, decide-then-commit: decline B politely (keeping that door open for the future) and join A. (The rare exception — a genuinely unacceptable change in A's terms — is a different situation from simply finding something better.)",
                  "hint": "What does reneging cost in a small, recurring industry, and when should optionality have been preserved?"
                },
                {
                  "prompt": "Give the decision rule for choosing among offers, and one example where the highest-comp offer is NOT the right choice.",
                  "solution": "Rule: choose the offer that maximizes risk-adjusted expected *lifetime* value — model risk-adjusted annualized comp first (Unit 12), then weigh growth/trajectory, fit, and risk vs your tolerance, letting those decide when the comp gap is modest. Example where the top-comp offer loses: early-career, Offer X pays ~15% more but is a maintenance role on a legacy system with little mentorship, while Offer Y pays less but offers fast growth, strong mentorship, and broad scope at a respected team. Because early-career earnings are dominated by skill and reputation compounding, Y's faster trajectory can raise lifetime expected value well above X's near-term comp edge — so Y is the rational choice despite the lower headline number. The highest first-year comp is only one term in the objective.",
                  "hint": "Maximize risk-adjusted lifetime value; when does trajectory outweigh a modest comp delta?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u13l3-i1",
              "front": "The offer-decision objective?",
              "back": "Maximize risk-adjusted expected LIFETIME value: risk-adjusted annualized comp (Unit 12) + growth/trajectory + fit + risk tolerance. Model comp first, then let non-comp factors decide modest gaps."
            },
            {
              "id": "u13l3-i2",
              "front": "When is walking away from all offers rational?",
              "back": "When every offer is below your reservation value (worse than your BATNA), or a role/team/process is a bad fit. A strong BATNA gives you the freedom to decline."
            },
            {
              "id": "u13l3-i3",
              "front": "The one closing move that does lasting damage?",
              "back": "Reneging on an accepted (esp. written) offer to take a later one — it burns the team and spreads in a small industry. Get more time BEFORE accepting; then decide-and-commit."
            },
            {
              "id": "u13l3-i4",
              "front": "The whole course in one line?",
              "back": "An interview is a noisy, asymmetric measurement over a high-variance funnel; you win by raising θ, emitting dense signal, cutting your own noise, and playing the meta-game — not by luck."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u13-check",
        "questions": [
          {
            "id": "u13q1",
            "type": "short",
            "prompt": "The relationship between arousal and performance is shaped like an inverted ____ (one letter): moderate arousal is optimal, too little or too much hurts.",
            "accept": [
              "u",
              "u.",
              "inverted u",
              "inverted-u"
            ],
            "explanation": "An inverted U (Yerkes–Dodson): performance peaks at moderate arousal and falls off at both low (careless) and high (anxiety/choke) arousal — and the peak is lower for complex tasks."
          },
          {
            "id": "u13q2",
            "type": "numeric",
            "prompt": "You can raise system design 0.45→0.65 with 10 hours, or coding 0.85→0.90 with 10 hours. What is the ratio of the marginal return (Δ pass per hour) of the system-design hours to the coding hours?",
            "answer": 4,
            "tolerance": 0.2,
            "explanation": "System design: 0.20/10 = 0.02/hr. Coding: 0.05/10 = 0.005/hr. Ratio 0.02/0.005 = 4×. Pour hours into the weakest, most-correlated arc — it has the highest marginal return."
          },
          {
            "id": "u13q3",
            "type": "short",
            "prompt": "Turning each practice failure into a permanent, resurfacing test case (a spaced-repetition card) is the same discipline as ____-driven development. (one word for the blank)",
            "accept": [
              "eval",
              "eval.",
              "evaluation",
              "test"
            ],
            "explanation": "Eval-driven (evaluation/test-driven) development: every failure becomes a permanent labeled test so fixes are verified and regressions can't return — which the app's SRS implements for recall."
          },
          {
            "id": "u13q4",
            "type": "mcq",
            "prompt": "You just had a rough coding round; you have two more loops today. The best move is to:",
            "options": [
              "Replay the mistakes in your head to make sure you don't repeat them",
              "Reset — treat the next loop as an independent draw; breathe and reframe, since ruminating raises arousal into the choke zone",
              "Assume you've failed the onsite and lower your effort",
              "Ask the recruiter to cancel the remaining rounds"
            ],
            "answer": 1,
            "explanation": "Each loop is an independent measurement (Unit 1). Ruminating raises arousal past the Yerkes–Dodson peak, hurting the next round — turning one bad draw into several. Reset, breathe, reframe, and give the next loop a clean start."
          },
          {
            "id": "u13q5",
            "type": "open",
            "points": 3,
            "prompt": "Design a concrete 6-week, ~10-hours/week prep plan for someone whose mock results show strong coding, weak system design, and untested behavioral. Use the eval-driven loop, marginal-return allocation, the arousal/time-budget ideas, and the funnel/correlated-failure results. Justify the allocation quantitatively.",
            "rubric": [
              "Allocates hours by marginal return — heaviest on the weakest, most-correlated arc (system design), lighter maintenance on the already-strong arc (coding), with a real behavioral block — and justifies with Δ(pass)/hour reasoning and the correlated-failure result (fixing the weak arc lifts every application).",
              "Structures practice as the eval-driven loop: build an eval set, timed attempts, log failures as spaced-repetition cards, change one thing, re-test — not undirected grinding.",
              "Includes mock interviews as online eval (or AI-graded open questions) to surface communication/signal-emission blind spots, and folds mock failures back into the set.",
              "Addresses day-of execution: timed practice to build the in-round time budget and lower baseline arousal (familiarity), and a plan to manage arousal.",
              "Concrete, week-by-week or block-by-block, internally consistent, and tied to the course's results — not generic 'study more.'"
            ],
            "solution": "Diagnosis: coding ~0.85 (strong), system design ~0.45 (weak and correlated — it sinks whole onsites, Unit 2), behavioral untested (~unknown, treat as a gap). Marginal return is highest on system design (e.g. 0.45→0.7 over the plan ≈ 0.25 gain vs a few points achievable in already-strong coding), and it fixes a correlated failure, so it gets the largest share. Allocation of ~60 hours: ~30 to system design, ~15 to behavioral, ~10 to coding maintenance, ~5 to full mocks. Method throughout is the eval-driven loop: build an eval set per arc (a list of design prompts, a spread of coding patterns, the behavioral competency list), attempt timed and out loud, log each failure as a specific spaced-repetition card (missed the monotone-predicate trigger; forgot the QPS formula; rambled with no metric), fix one thing, and re-attempt so weaknesses can't regress. Weeks 1–3: front-load system design — one design prompt end-to-end per session using the Unit 8–10 procedure (estimate, API, data model, deep-dive, self-critique), carding every gap; build the behavioral story bank (Unit 11) covering the competency set. Weeks 4–5: continue system design at declining volume as its marginal return falls, add coding maintenance via spaced review of your weak patterns, and start weekly full-length mock interviews (or this app's AI-graded open questions) as online eval to catch communication blind spots you can't self-grade. Week 6: taper to timed mocks across all arcs to rehearse the in-round time budget (Unit 13) and lower baseline arousal through familiarity, plus spaced review of all logged cards; manage arousal with breathing/reframing rehearsed in the mocks. Quantitative spine: the ~2:1:0.7 hour ratio follows Δ(pass)/hour (system design's ~0.008/hr vs coding's ~0.003/hr in this scenario), and lifting the correlated system-design failure raises q for every application (Unit 2's funnel), the highest-leverage move.",
            "explanation": "The capstone synthesis: allocate by marginal return to the weakest correlated arc, run the eval-driven loop with SRS, use mocks as online eval, and rehearse day-of execution (time budget, arousal) — quantitatively justified via the funnel/marginal-return results. Strong answers are concrete and prioritized, not even splits."
          }
        ]
      }
    },
  ],
};
