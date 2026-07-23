// React — a rigorous, first-principles treatment of React as a RUNTIME FOR THE
// EQUATION UI = f(state): components are pure functions from props+state to
// immutable element trees; the runtime re-evaluates f on state changes,
// reconciles the new description against the old under an O(n) heuristic, and
// commits a minimal set of host mutations. Every unit derives consequences from
// that model rather than cataloguing APIs — and proves what is provable:
// the diff-complexity gap (Θ(n³) general tree edit distance vs React's O(n)
// heuristic), update-queue fold semantics, the stale-closure theorem, the
// positional-storage theorem behind the Rules of Hooks, memoization soundness,
// fetch-race interleavings, and tearing under interruptible rendering.
//
// Grounded in the canonical sources: react.dev (the current official docs),
// Abramov's effect/runtime essays, Clark's Fiber architecture notes, the Hooks
// and Server Components RFCs, and the tree-edit-distance literature for the
// reconciliation bounds. Where the course teaches judgment rather than
// derivation (state design, performance strategy, testing), gates use
// AI-graded `open` questions under a demanding reviewer persona.
//
// Units are inserted one at a time via scripts/insert-unit.mjs — never
// generated in one shot (see AUTHORING.md).
//
// Outline (10 units):
//   u1  The Rendering Model        — elements, components, render→commit, purity
//   u2  Reconciliation & Identity  — diffing bounds, keys, state lives in the tree
//   u3  State as a Snapshot        — snapshot semantics, update queue, immutability
//   u4  Designing State            — reducers/state machines, SSOT, context
//   u5  Hooks: Contract & Machinery— rules of hooks, build useState, custom hooks
//   u6  Effects & Synchronization  — effect model, deps/stale closures, refs/DOM
//   u7  Rendering Performance      — cost model, memoization correctness, composition
//   u8  Concurrent React           — Fiber, transitions, tearing & external stores
//   u9  Data, Suspense & the Server— fetch races, Suspense, SSR/hydration, RSC
//   u10 Robust React               — TypeScript, testing behavior, error boundaries

export const react = {
  id: "react",
  title: "React, From First Principles",
  subject: "Software Engineering",
  difficulty: "Professional",
  description:
    "React as a runtime for UI = f(state): pure components, immutable element trees, reconciliation, hooks as positional state, effects as synchronization, and concurrent rendering — derived from the model and proved where provable, not memorized as API folklore. Gates demand transfer: predict render behavior, diagnose stale closures, justify memoization soundness, and design state machines under a strict reviewer rubric.",
  sources: [
    "react.dev — official React documentation: Learn React + API Reference (Meta, 2023–2025)",
    "Dan Abramov — 'A Complete Guide to useEffect' (overreacted.io, 2019)",
    "Dan Abramov — 'React as a UI Runtime' (overreacted.io, 2019)",
    "Andrew Clark — 'React Fiber Architecture' (github.com/acdlite/react-fiber-architecture, 2016)",
    "React RFC #68 — Hooks (2018); React RFC #188 — Server Components (2020)",
    "Rodrigo Pombo — 'Build your own React' (pomb.us, 2019)",
    "facebook/react source — react-reconciler package (Fiber work loop, lanes)",
    "Zhang & Shasha (1989); Demaine, Mozes, Rossman & Weimann (2007) — tree edit distance bounds cited by the reconciliation docs",
    "React 18 announcement & Working Group discussions (automatic batching, concurrent features, useSyncExternalStore)",
    "Testing Library documentation & Kent C. Dodds — 'Testing Implementation Details' (testing philosophy)",
  ],
  grader:
    "You are a React core contributor and staff frontend engineer grading with the rendering model in hand. Reward answers DERIVED from React's actual semantics: elements as immutable descriptions, renders as pure snapshots over per-render closures, commit-phase mutation, positional hook storage, dependency-driven effect synchronization, and interruptible concurrent rendering. Penalize folklore ('re-renders are slow, wrap everything in memo'), API name-dropping without semantics, answers that mutate state or read refs during render, and reasoning that would break under StrictMode double-invocation or concurrent interruption. A confident answer that asserts behavior without deriving it from the model earns little credit. Accept any valid alternative argument — grade the substance, not similarity to the reference.",
  units: [
    {
      "id": "u1",
      "title": "The Rendering Model",
      "summary": "Elements as immutable descriptions, components as pure functions, and the trigger → render → commit pipeline that turns UI = f(state) into DOM mutations.",
      "references": [
        "react.dev — Describing the UI; Render and Commit; Keeping Components Pure",
        "Dan Abramov — 'React as a UI Runtime' (overreacted.io, 2019)",
        "Dan Abramov — 'Why Do React Elements Have a $$typeof Property?' (overreacted.io, 2018)",
        "react.dev — <StrictMode> API reference (double-invocation semantics)"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u1l1",
          "title": "The Central Equation: UI = f(state)",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Why imperative UI collapses under its own weight",
              "body": "Before React, the dominant model for browser UI was **imperative mutation**: when something happens, find the DOM nodes affected and edit them by hand. A login form might disable the submit button while a request is in flight, swap a spinner in, clear an error banner from the previous attempt, and re-enable the button on failure — each of those is a hand-written mutation, and each must be written *for every path that can reach it*. The trouble is combinatorial. A screen whose appearance depends on n independent boolean facts (loading? logged in? error present? cart empty?) has up to 2ⁿ visually distinct states, and an imperative program does not write states — it writes **transitions**. Every event handler must know how to convert *whatever the screen currently shows* into what it should show next. Miss one path — an error banner left up after a retry succeeds — and you get the classic stale-UI bug: not a crash, just a screen quietly lying about the state of the world. The core insight behind React is that the transition-writing burden is the thing to eliminate. If the programmer instead supplies a single function that maps *any* state to its correct appearance, transitions stop being the programmer's problem: the runtime computes them by comparing descriptions. That refactoring of responsibility — you own the states, the runtime owns the transitions — is the entire subject of this course, and it has a precise cost model."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "State coverage beats transition coverage",
              "statement": "Consider a UI whose appearance is determined by a state drawn from a finite set S. An **imperative** implementation must supply correct mutation code for every reachable ordered transition (s, s′) — up to |S|·(|S|−1) cases — because the code that runs on an event depends on both the current screen and the target state. A **declarative** implementation must supply a rendering function f defined on each state — exactly |S| cases — plus a generic differ that turns (f(s), f(s′)) into mutations. Hence the specification burden falls from O(|S|²) to O(|S|), and for a UI driven by n independent booleans, from O(4ⁿ) to O(2ⁿ).",
              "proof": "In the imperative model, the screen is a mutable data structure whose contents are the *accumulated result of past edits*. An event handler firing in state s must issue edits that transform the concrete DOM produced by s into the DOM required by s′; an edit sequence correct for (s₁, s′) is not in general correct for (s₂, s′), because the nodes present differ (the spinner exists in one, not the other). So correctness must be established per ordered pair of (reachable) states: up to |S|·(|S|−1) obligations. In the declarative model, f is a function of s alone; establishing f correct on each of the |S| states discharges every obligation, because for any transition the runtime computes the edit script from the two descriptions f(s) and f(s′) — a single generic algorithm written once (Unit 2). With n independent booleans, |S| = 2ⁿ, so the obligations fall from Θ(2ⁿ·2ⁿ) = Θ(4ⁿ) to Θ(2ⁿ). The exponential in |S| remains — declarative UI does not shrink your state space, it removes the *quadratic blowup on top of it*. ∎"
            },
            {
              "type": "text",
              "heading": "The declarative bet",
              "body": "React's bet is exactly that proposition: make the developer describe **every state's appearance once**, and make the runtime responsible for moving the screen between appearances. Concretely, you write components — plain functions — that accept the current data and return a *description* of what the UI should look like. You never tell React *what changed*; you tell it *what everything should be now*, and it works out the change. This is why experienced React code contains almost no verbs about the DOM — no `appendChild`, no `classList.toggle`, no `input.value =`. Those verbs still happen, but they are emitted by the runtime as the computed difference between two descriptions. The rest of this lesson pins down what that description is, because everything later — reconciliation, memoization, concurrency — is defined in terms of it."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "React element",
              "statement": "A **React element** is an immutable, plain JavaScript object describing one node of desired UI:\n\n  { type, props, key, ref }\n\nwhere **type** is either a string naming a host platform node ('div', 'input') or a reference to a component function; **props** is an object of named inputs, with nested elements under props.children; **key** is an optional identity hint used by reconciliation (Unit 2); and **ref** optionally requests access to the underlying host instance (Unit 6). An **element tree** is an element together with its descendants via children. Elements are *descriptions*: creating one performs no rendering, allocates no DOM, and runs no component — it is data, as inert as a JSON value. By contract they are immutable: React may retain, compare, and reuse them across renders, so code must never mutate an element after creating it."
            },
            {
              "type": "code",
              "heading": "JSX is syntax for element construction — nothing more",
              "lang": "jsx",
              "code": "// What you write:\nconst ui = (\n  <section className=\"cart\">\n    <h2>Your cart</h2>\n    <CartRow item={item} qty={2} />\n  </section>\n);\n\n// What the compiler emits (React 17+ automatic runtime):\nimport { jsx as _jsx, jsxs as _jsxs } from \"react/jsx-runtime\";\nconst ui2 = _jsxs(\"section\", {\n  className: \"cart\",\n  children: [\n    _jsx(\"h2\", { children: \"Your cart\" }),\n    _jsx(CartRow, { item: item, qty: 2 }),\n  ],\n});\n\n// Which evaluates to (conceptually) this plain object:\nconst ui3 = {\n  $$typeof: Symbol.for(\"react.element\"),\n  type: \"section\",\n  key: null,\n  ref: null,\n  props: {\n    className: \"cart\",\n    children: [\n      { $$typeof: Symbol.for(\"react.element\"), type: \"h2\", key: null, ref: null,\n        props: { children: \"Your cart\" } },\n      { $$typeof: Symbol.for(\"react.element\"), type: CartRow, key: null, ref: null,\n        props: { item: item, qty: 2 } },\n    ],\n  },\n};"
            },
            {
              "type": "text",
              "heading": "Elements, components, instances — three things people conflate",
              "body": "Three distinct nouns get collapsed into the word “component” in casual speech, and the collapse causes real bugs, so fix the vocabulary now. A **component** is the function itself — `CartRow` — a reusable recipe that, given props, returns an element tree. An **element** is one immutable description produced by that recipe’s *call site* — `<CartRow qty={2} />` — cheap, disposable, re-created on every render. An **instance** is the runtime's persistent bookkeeping for an element that has been rendered into the tree: its current state, its host DOM node, its position. You write components; render produces elements; React manages instances. Notice what this division implies: because elements are re-created every render, *element identity carries no information* — `<CartRow />` from this render and `<CartRow />` from the last one are different objects. Persistence lives entirely in instances, and React decides which old instance each new element corresponds to. That correspondence problem is reconciliation, and it is why `key` exists. Notice also that `CartRow` appears as a bare reference in `type` — React calls it, you never do. Writing `CartRow({ qty: 2 })` instead of `<CartRow qty={2} />` skips instance bookkeeping entirely and breaks hooks (Unit 5)."
            },
            {
              "type": "example",
              "heading": "Worked example: reading the tree a component returns",
              "body": "Take this component:\n\n`function Badge({ user }) { return <span className=\"badge\">{user.name}{user.pro && <Star />}</span>; }`\n\nCalled with `user = { name: \"Ada\", pro: true }`, the returned value is an element whose type is the string `'span'`, whose `props.className` is `'badge'`, and whose `props.children` is the array `['Ada', { type: Star, props: {} }]` (annotated with $$typeof, key, ref as always). Two observations do real work later. First, the `Star` element is a *description of a call React has not made yet* — `Badge` returned without `Star` running; React will call `Star` only if this subtree is actually rendered. Rendering is therefore **lazy, top-down evaluation**: each component unfolds one layer of the tree, and React drives the recursion. Second, with `pro: false` the children array is `['Ada', false]` — booleans, `null`, and `undefined` are legal children that render to nothing, which is exactly what makes the `cond && <X />` idiom well-defined rather than a special case."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why the $$typeof symbol?** Every element carries `$$typeof: Symbol.for('react.element')` (in current versions, `react.transitional.element`). It exists for security: if a server ever lets attacker-controlled JSON flow into JSX as a child, the attacker could shape an object that *looks* like an element — `{type: 'div', props: {dangerouslySetInnerHTML: …}}` — and get it rendered. But JSON cannot represent a Symbol, so React refuses any 'element' whose $$typeof is missing. The tag is a provenance check: only code that could call `Symbol.for` — real JavaScript, not smuggled data — can mint elements."
            },
            {
              "type": "text",
              "heading": "Descriptions are cheap; that's the point",
              "body": "A common first objection: “you re-create the *entire* element tree on every render — isn't that wasteful?” The answer is a cost asymmetry that the whole architecture leans on. Allocating plain objects is what JavaScript engines are optimized for — nursery allocation, cheap collection of short-lived garbage. Touching the DOM is orders of magnitude heavier: style recalculation, layout, paint, composite. React spends the cheap currency (object allocation, comparison) to conserve the expensive one (DOM mutation). Immutability is what makes the comparison side cheap: because an element can never change after creation, *reference equality is a complete proof of sameness* — if `oldChild === newChild`, React can skip that entire subtree without looking inside it, a bailout you will exploit deliberately in Unit 7. If elements were mutable, `===` would prove nothing, and every optimization built on it would be unsound. When you meet memo, transitions, or Server Components later, they are all spending the same two currencies with the same exchange rate."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Desugar by hand into nested element objects (type/props/children; omit $$typeof, key, ref):\n<ul className=\"list\">{items.map(i => <li key={i.id}>{i.label}</li>)}<Footer compact /></ul>",
                  "solution": "{ type: 'ul', props: { className: 'list', children: [ items.map(i => ({ type: 'li', key: i.id, props: { children: i.label } })), { type: Footer, props: { compact: true } } ] } }\n\nPoints that matter: the mapped array sits inside children as an array (React flattens nested arrays of children); each mapped element carries key at the element level, not inside props (key is consumed by React, never delivered to the component); the bare attribute compact desugars to compact: true; and Footer appears as a function reference in type — nothing has called it yet.",
                  "hint": "key is a sibling of props, not a member of it. What does an attribute with no value desugar to?"
                },
                {
                  "prompt": "A dashboard's appearance is fully determined by three independent booleans (loading, error, admin) and one enum with four values (tab). Using the state-coverage proposition: how many state-appearances must a declarative renderer define, and how many ordered transitions would an imperative implementation need to certify in the worst case?",
                  "solution": "|S| = 2³ × 4 = 32 states, so the declarative renderer defines f on 32 cases (in practice far fewer branches, since most state components affect the tree independently — f factors through composition). Worst-case ordered transitions: |S|·(|S|−1) = 32 × 31 = 992. The declarative implementation still has 32 obligations, but the 992 transition scripts are computed by the differ from pairs of descriptions rather than hand-written.",
                  "hint": "Count |S| first; transitions are ordered pairs of distinct states."
                },
                {
                  "prompt": "Explain precisely why element immutability makes `oldElement === newElement` a *sufficient* condition for React to skip re-rendering that subtree — and give the one-line reason the converse (=== false ⇒ something changed) does NOT hold.",
                  "solution": "Sufficiency: an element is an exhaustive description of its subtree's desired UI (type, props, children, recursively). If the reference is identical and elements are immutable, the description now is bit-for-bit the description before, so the desired UI is unchanged and re-rendering could not produce different output — skipping is sound. The converse fails because renders re-create elements: a parent re-rendering builds a *new* element object with equal contents, so === false usually means 'freshly allocated', not 'different'. Reference equality is a proof of sameness but not a test of difference — which is why React re-renders children by default and needs memo + explicit props comparison to bail out on equal-but-reallocated elements (Unit 7).",
                  "hint": "One direction is about immutability; the failed direction is about re-creation on every render."
                },
                {
                  "prompt": "Classify each as component, element, or instance, and justify in one clause: (a) the value of <App /> ; (b) App itself; (c) 'the App currently mounted at #root with its state'; (d) the value of App({}) called directly; (e) the string 'div' appearing in a type field.",
                  "solution": "(a) Element — an immutable description referencing App in type. (b) Component — the function/recipe. (c) Instance — React's persistent bookkeeping (state + host nodes) for a rendered element. (d) An element tree (whatever App returns) — but produced OUTSIDE React's rendering, so no instance is created and hooks inside App would associate with the caller's instance or crash; this is why you never call components directly. (e) Neither — it's the type field of a host element, naming a platform node kind for the renderer.",
                  "hint": "Ask: is it a recipe, a description, or the runtime's persistent record?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u1l1-i1",
              "front": "What exactly is a React element?",
              "back": "An immutable plain object { type, props, key, ref } describing one node of desired UI — data, not an instruction; creating one renders nothing."
            },
            {
              "id": "u1l1-i2",
              "front": "Component vs element vs instance — one line each.",
              "back": "Component = the function (recipe). Element = one immutable description from a call site. Instance = React's persistent bookkeeping (state, host node) for a rendered element."
            },
            {
              "id": "u1l1-i3",
              "front": "What does JSX compile to?",
              "back": "Calls to the jsx/createElement runtime that return element objects — JSX is object-construction syntax, nothing more."
            },
            {
              "id": "u1l1-i4",
              "front": "Why does element immutability make === a sound subtree-skip test?",
              "back": "An immutable element is a complete, unchangeable description — identical reference ⇒ identical description ⇒ identical UI, so skipping the subtree cannot be wrong."
            },
            {
              "id": "u1l1-i5",
              "front": "Declarative UI's complexity win over imperative, in one sentence?",
              "back": "It replaces up to |S|² hand-written transition scripts with |S| state descriptions plus one generic differ — you own states, the runtime owns transitions."
            }
          ]
        },
        {
          "id": "u1l2",
          "title": "Render and Commit",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "From description to pixels: the pipeline",
              "body": "Lesson 1 established what components produce — element trees. This lesson establishes when and how React turns those descriptions into a living DOM. React processes every UI update through a fixed pipeline with three phases it controls and one it hands off: **trigger** (a reason to render arises), **render** (React calls components to compute the new description), **commit** (React applies the minimal mutations to the host tree), and then the browser **paints**. The names are load-bearing and worth using precisely, because half of all React confusion is people using 'render' to mean 'the screen updated'. In React's vocabulary, *render is a pure computation* — calling your functions to obtain element trees. Nothing visible happens during render. The screen changes only in commit, and the user sees it only after paint. Keeping the phases separate in your head is what will later make batching (Unit 3), memoization (Unit 7), and interruptible rendering (Unit 8) feel inevitable instead of magical."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The three phases",
              "statement": "**Trigger.** A render is scheduled for exactly two kinds of reason: the initial mount (createRoot(...).render(<App />)), or a state update — setState on some component (batched with others, Unit 3) — marking that component as needing render.\n\n**Render phase.** React calls the triggering component function with its current props and state. The returned element tree names further components in type fields; React recurses into each child component (calling it in turn) until the tree bottoms out in host elements only. On the initial mount this visits the whole app; on updates React starts at the components whose state changed and descends from there. The phase is, by contract, side-effect free and produces one value: the next description of the UI.\n\n**Commit phase.** React compares the new description with the previous one (reconciliation, Unit 2) and applies the computed difference to the host tree — for the initial mount, that difference is 'create everything' (appendChild); for updates, the minimal mutation set. Refs are attached and effects run after this point (Unit 6). Then React yields; the browser paints on its own schedule."
            },
            {
              "type": "text",
              "heading": "Rendering is lazy recursion, driven by React",
              "body": "Watch the recursion carefully, because its laziness is a feature you will use. When React calls `App` and receives `<Layout><Feed /></Layout>`, only `App` has run. `Layout` and `Feed` are references sitting in type fields — un-called functions. React now calls `Layout` with `children` already set to the `Feed` *element*; if `Layout` returns `<main>{children}</main>`, then `Feed` still hasn't run — it was passed through as opaque data. Only when React reaches the `Feed` element in its traversal does `Feed` execute. Two consequences. First, a component cannot know or care what its children render — composition is opaque, which is what makes `children`-based APIs (and a key performance pattern in Unit 7) possible. Second, the unit of work is naturally a single component call, and the traversal between calls is bookkeeping the runtime owns — which is precisely the seam Fiber exploits to pause and resume rendering (Unit 8)."
            },
            {
              "type": "code",
              "heading": "Tracing one update, phase by phase",
              "lang": "jsx",
              "code": "function Clock({ time }) {\n  return (\n    <div id=\"clock\">\n      <h1>{time}</h1>\n      <input placeholder=\"Type here — I survive updates\" />\n    </div>\n  );\n}\n\n// Every second, the caller re-renders <Clock time={now} />.\n//\n// TRIGGER  setState in the parent (new `time` prop for Clock).\n// RENDER   React calls Clock(props). It returns a fresh element tree:\n//            div#clock ─ h1 ─ \"10:42:07\"   ← new text\n//                      └ input             ← same description as before\n//          Pure computation. The DOM has not been touched.\n// COMMIT   Diff vs previous tree: div matches div, h1 matches h1,\n//          input matches input. The ONLY difference is the h1's text.\n//          React executes exactly one mutation:\n//            h1TextNode.nodeValue = \"10:42:07\"\n//          The <input> DOM node is NOT recreated — which is why the\n//          text you typed into it survives every tick. React never\n//          cleared it; it never touched it.\n// PAINT    The browser repaints the changed text when it's ready."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Render idempotence",
              "statement": "Let f be the render phase over components satisfying the purity contract (same inputs ⇒ same returned elements; no side effects during render; no mutation of pre-existing values — Lesson 3). Then executing the render phase k ≥ 1 times on the same inputs before a single commit is observationally equivalent to executing it once: the committed host mutations, and every program-visible value, are identical.",
              "proof": "Two things could distinguish k renders from one: effects observable *during* the renders, or a difference in the tree that commit applies. (1) By the contract, a rendering component performs no I/O, no host mutation, and no writes to pre-existing memory; the only products of a render are freshly allocated elements unreachable by other code until React uses them. Discarded render output is therefore garbage, never observed. (2) By input-determinism, each of the k renders receives the same props and state and returns structurally identical trees; commit consumes only the final tree, and reconciliation is a deterministic function of (previous committed tree, new tree), so the mutation set is the same as in the single-render execution. Hence no observer — user, DOM, or program — can distinguish the two executions. ∎\n\nThis small theorem is the license for a remarkable amount of machinery: StrictMode can double-invoke components in development to *detect* contract violations (a pure component can't tell); concurrent React can start rendering, throw the work away, and start again (Unit 8); and React can render subtrees speculatively or on the server. Every one of those features is sound *only* for components where this theorem's hypothesis holds — which is why the contract is enforced culturally and tooled aggressively."
            },
            {
              "type": "example",
              "heading": "Worked example: mount vs update on the same component",
              "body": "Consider `<Counter />` rendering `<button onClick={…}>{count}</button>` with count in state.\n\n**Mount** (first render): trigger is `root.render`. Render phase calls Counter, obtaining the button element with text '0'. Commit has no previous tree, so the diff degenerates to creation: React creates the button node, sets its listeners and text, and appends it to the root container. Effects (if any) run; browser paints '0'.\n\n**Update** (user clicks): the click handler calls `setCount(1)` — the trigger. Render phase calls Counter again; *the entire function body re-executes* — a fresh handler closure, a fresh element — and returns a button element with text '1'. Commit diffs the two button descriptions: same type, same position, so the existing DOM button is kept, and the only mutation is the text node `0 → 1`. Note what did **not** happen: the button was not removed and re-added (it keeps focus — press Enter repeatedly and it stays focused), and nothing else in the document was touched. 'The component re-rendered' means *its function ran again*, not *its DOM was rebuilt* — the two are related only through the diff."
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "One state update through the pipeline. Render is pure computation (discardable, repeatable — the idempotence theorem); only commit touches the host tree; the browser paints afterwards on its own schedule.",
              "actors": [
                "Handler",
                "Scheduler",
                "Render",
                "Commit",
                "Browser"
              ],
              "messages": [
                {
                  "from": "Handler",
                  "to": "Scheduler",
                  "label": "setState(next) — enqueue update",
                  "tone": "gold"
                },
                {
                  "from": "Scheduler",
                  "to": "Scheduler",
                  "label": "batch updates from this event",
                  "dashed": true
                },
                {
                  "from": "Scheduler",
                  "to": "Render",
                  "label": "start render pass"
                },
                {
                  "from": "Render",
                  "to": "Render",
                  "label": "call components → new element tree (pure)",
                  "tone": "sage"
                },
                {
                  "from": "Render",
                  "to": "Commit",
                  "label": "hand off completed tree"
                },
                {
                  "from": "Commit",
                  "to": "Browser",
                  "label": "apply minimal DOM mutations",
                  "tone": "rust"
                },
                {
                  "note": "React yields — browser paints when ready"
                },
                {
                  "from": "Browser",
                  "to": "Browser",
                  "label": "style / layout / paint",
                  "dashed": true
                }
              ]
            },
            {
              "type": "text",
              "heading": "Commit is minimal; render is not",
              "body": "The example shows an asymmetry worth internalizing as a slogan: **render is wholesale, commit is retail**. During render, React re-executes every component it visits, top-down from the state change, and by default that includes *all* of a re-rendered component's children, memoized or not-yet-reached bailouts aside (Unit 7 treats the bailout rules exactly). During commit, React applies only the difference between descriptions — usually a tiny set of mutations. So 'unnecessary re-render' and 'unnecessary DOM work' are different diseases with different costs: the first burns JavaScript time computing a description that turns out equal (often acceptable — descriptions are cheap, per Lesson 1); the second almost never happens under React precisely because the diff filters it out. When you profile later, this is why the question is always 'is render time itself the bottleneck?' rather than 'is React thrashing the DOM?' — the pipeline design already spent the engineering budget to make the second question boring."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Render runs often — keep it cheap and keep it honest.** Anything you write in a component body executes on every render of that component: on mount, on every state change, on every parent re-render, twice in StrictMode. Two disciplines follow. (1) No expensive synchronous work inline in render without a care for frequency — that's what useMemo exists for (Unit 7), and even then, measure first. (2) Absolutely no side effects — a network request or subscription in a component body will fire on every render, and the idempotence theorem's guarantees evaporate the moment its hypothesis is violated. Rendering is a *description* step; treat any urge to 'do something' during it as a sign the code belongs in an event handler or an effect (Unit 6)."
            },
            {
              "type": "text",
              "heading": "Why the phase split is the architecture",
              "body": "It would be simpler to interleave: call a component, mutate the DOM, call the next. Early virtual-DOM libraries did roughly that, and React itself committed synchronously per-update for years. The strict phase separation earns its complexity three times over. First, **atomicity**: because no mutations happen until the whole new tree is computed, the user never observes a half-updated screen — commit applies one consistent description. Second, **discardability**: a render that has made no mutations can be abandoned at zero cost — the precondition for time-slicing, for prioritizing an urgent update over a half-finished slow one, and for StrictMode's diagnostic double render; the idempotence theorem is exactly the statement that abandonment is safe. Third, **batching**: multiple state updates can be coalesced into one render pass and one commit, because triggering doesn't render immediately (Unit 3 gives the queue semantics). Every 'advanced' React feature you will meet is a dividend of this one design decision — which is why this course teaches the pipeline before any API."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A component logs to the console in its body: `function Panel(){ console.log('render'); return <div/>; }`. In development under <StrictMode>, its parent mounts it and then updates state once. How many 'render' logs appear, and — separately — how many times is the DOM div created? Explain from the phases.",
                  "solution": "Four logs, one div creation. StrictMode double-invokes component functions per render pass in development: mount pass → 2 logs, update pass → 2 logs (some React versions dim the duplicate). The div is created once, at mount commit: render-phase invocations produce descriptions only, and the doubled render's discarded output makes no mutations (render idempotence). The update's commit diffs equal descriptions and touches nothing. Counting logs measures renders; counting DOM nodes measures commits — the exercise's entire point is that these are different numbers.",
                  "hint": "Which phase does console.log run in? Which phase creates nodes? StrictMode doubles only one of them."
                },
                {
                  "prompt": "In the Clock example, a colleague 'fixes flicker' by changing the parent to unmount and remount the clock each tick: {show && <Clock time={t}/>} with show toggled false→true. The typed text in the input now disappears every second. Explain the mechanism precisely, naming the phase where the input's DOM node dies.",
                  "solution": "Toggling show renders a tree where Clock's position holds nothing; commit for that pass REMOVES Clock's host nodes (the input among them) — deletion happens in commit, and with the DOM node goes the browser-held value the user typed. When show returns to true, React mounts a fresh Clock: new input node, empty value. Under the original code the input element description was identical across renders, so commit never touched the node and the browser state survived. Moral: unmounting is not a render-phase detail — it is a commit-phase destruction of instances and host state (and Unit 2 shows subtler ways to trigger it accidentally).",
                  "hint": "What does commit do when a position that had an element now has none?"
                },
                {
                  "prompt": "True or false, with a one-paragraph justification from the idempotence theorem: 'If a component works correctly in production but logs twice and misbehaves under StrictMode, StrictMode has a bug and can be turned off.'",
                  "solution": "False. StrictMode's double invocation is a *test of the idempotence theorem's hypothesis*: for a pure component, two renders are observationally equivalent to one, so no behavior difference is possible. A component that misbehaves when rendered twice is exhibiting a purity violation — a side effect or mutation during render — that production merely fails to surface deterministically (it will surface as heisenbugs under concurrent rendering, Suspense retries, or hot reload, where React legitimately renders without committing). Turning StrictMode off removes the smoke detector, not the fire.",
                  "hint": "For which components is double-render distinguishable from single-render at all?"
                },
                {
                  "prompt": "For each bug, name the phase whose contract is being violated or where the fault lives, and say why: (a) UI shows stale totals though state is correct in devtools; (b) an analytics beacon fires three times per pageview; (c) clicking feels laggy though the DOM mutation count is tiny; (d) a tooltip measures its own width as 0 on first display.",
                  "solution": "(a) Render: the description computed from state is wrong (e.g., reading a mutated-in-place object that defeats input-determinism, Unit 3) — commit faithfully applied a wrong tree. (b) Trigger/render: the beacon runs in a component body, so it fires per render, not per pageview — a side effect in the pure phase; belongs in an effect or handler. (c) Render cost: commit is small but the render pass re-executes an expensive subtree per keystroke — JavaScript time, not DOM time (the render-wholesale/commit-retail asymmetry). (d) Phase ordering: it reads layout before the browser has painted/laid out the committed nodes, or during render before commit exists — measurement belongs after commit (layout effects, Unit 6).",
                  "hint": "Ask of each: is the description wrong, is the pure phase impure, is the pure phase slow, or is code reading the host tree before commit finished?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u1l2-i1",
              "front": "Name React's phases for one update, and the one thing each is allowed to do.",
              "back": "Trigger (schedule a render — mount or setState), render (call components, pure, produce the new element tree), commit (apply minimal host mutations), then the browser paints."
            },
            {
              "id": "u1l2-i2",
              "front": "State the render idempotence theorem in one sentence.",
              "back": "For components honoring the purity contract, rendering k times before one commit is observationally identical to rendering once — discarded render output is unobservable."
            },
            {
              "id": "u1l2-i3",
              "front": "'The component re-rendered' — what did and did NOT necessarily happen?",
              "back": "Its function ran again producing a new description; its DOM was not necessarily touched — mutations happen only where the committed diff is non-empty."
            },
            {
              "id": "u1l2-i4",
              "front": "Why does typed text in an <input> survive a parent's re-render?",
              "back": "The input's description is unchanged across renders, so commit never touches its DOM node — browser-held state (value, focus) persists untouched."
            },
            {
              "id": "u1l2-i5",
              "front": "What three capabilities does the render/commit split purchase?",
              "back": "Atomic screen updates (no half-applied trees), discardable renders (StrictMode, time-slicing, speculation), and batching of multiple updates into one pass."
            }
          ]
        },
        {
          "id": "u1l3",
          "title": "Purity: The Contract That Makes It All Work",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "A contract, not a style preference",
              "body": "The previous lesson's idempotence theorem carried a hypothesis: *components satisfying the purity contract*. This lesson is about that hypothesis — what exactly it demands, what it deliberately permits, and why React stakes its most valuable features on it. Understand it as a genuine two-party contract. You promise that your components are pure computations over their inputs. In exchange, the runtime promises correct batching, safe re-execution (StrictMode, hot reload, Fast Refresh), interruptible and resumable rendering, server rendering, and subtree-skipping optimizations — every one of which silently assumes it may call your function extra times, at odd moments, or not at all, without anything observable happening. Purity is not React being precious about functional programming; it is the *load-bearing invariant* that makes calling your code a runtime-owned decision rather than a promise about when and how often."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The purity contract",
              "statement": "A component (and any hook it calls) is **pure** iff, during the render phase:\n\n1. **Input-determinism.** Its returned element tree is a function of its inputs alone — props, state, and context. Same inputs ⇒ structurally identical output, on any call, in any environment (client, server, test).\n2. **No external reads of changeable things.** It does not read values that vary outside React's knowledge — Date.now(), Math.random(), globals, the DOM — because those make (1) false even with equal inputs.\n3. **No pre-existing-value mutation.** It does not modify objects or variables that existed before this render call began: props, state, context values, module-level variables, values from other components. \n4. **No side effects.** It performs no I/O, subscriptions, timers, host mutations, or writes observable outside the call.\n\n**Deliberately permitted — local mutation:** values created *during* the current call are yours: build an array with push, fill a lookup object, mutate a local accumulator. Purity is judged at the call boundary; internal imperative code is invisible outside and therefore harmless."
            },
            {
              "type": "example",
              "heading": "Worked example: an impure component and its two honest fixes",
              "body": "`let guestCount = 0;`\n`function Cup() { guestCount = guestCount + 1; return <h2>Tea cup for guest #{guestCount}</h2>; }`\n\nRender `<Cup/><Cup/><Cup/>` and you *might* see guests 1, 2, 3 — today. The component violates clauses (2) and (3): it reads and writes a pre-existing module variable. Consequences cascade exactly as the theory predicts: under StrictMode the numbers double (2, 4, 6) because each render runs twice; under any future render that React discards and retries, the count silently inflates; on the server, one module instance is shared across *requests*, so users see each other's counts — a genuine data leak, not a cosmetic bug. The mechanical smell: rendering the same tree twice yields different screens, i.e. f is not a function.\n\n**Fix 1 — make it an input:** `function Cup({ guest }) { return <h2>Tea cup for guest #{guest}</h2>; }` and render `<Cup guest={1}/> <Cup guest={2}/>`… The parent owns the sequence; each Cup is deterministic.\n\n**Fix 2 — make it state:** if the number must change over time in response to events, it is state, owned by some component and updated through setState in a *handler* — never during render. Choosing between the fixes is choosing who owns the fact; that design question is Unit 4's subject."
            },
            {
              "type": "code",
              "heading": "Local mutation is not impurity",
              "lang": "jsx",
              "code": "function PriceTable({ items, taxRate }) {\n  // All three locals are created inside this call — mutating them\n  // freely is fine. No observer outside the call can tell.\n  const rows = [];                      // fresh array\n  let subtotal = 0;                     // fresh accumulator\n  for (const item of items) {           // reading props: fine\n    subtotal += item.price;             // mutating the LOCAL: fine\n    rows.push(                          // push into the LOCAL: fine\n      <tr key={item.id}>\n        <td>{item.name}</td><td>{item.price.toFixed(2)}</td>\n      </tr>\n    );\n  }\n  const total = subtotal * (1 + taxRate);\n\n  // What would NOT be fine, for contrast:\n  //   items.sort(byPrice)      — mutates the props array (pre-existing!)\n  //   cache[items.length] = …  — writes a module-level object\n  //   fetch('/log?total='+…)   — side effect during render\n  // The sort bug is vicious: it 'works', but silently reorders the\n  // parent's data for every OTHER component reading the same array.\n  // Pure alternative: const sorted = [...items].sort(byPrice)\n\n  return <table><tbody>{rows}</tbody><tfoot><td>{total.toFixed(2)}</td></tfoot></table>;\n}"
            },
            {
              "type": "text",
              "heading": "The three homes of code",
              "body": "If render must be pure, where does impure work live? React gives exactly three homes, and choosing the right one is most of day-to-day correctness. **The component body** (render): computation from inputs to description — transform, filter, format, compose. If you can express logic here as plain derivation, do; it needs no lifecycle management at all. **Event handlers**: code that runs because *the user did something* — submit the form, start the purchase, setState. Handlers are not called during render (they're attached, then invoked by real events later), so they may freely perform side effects; they are the *default* home for effects with a clear cause. **Effects** (useEffect, Unit 6): code that must run because *rendering happened* — synchronizing an external system (subscription, widget, document.title) with committed state. The classic mistake is promotion in the wrong direction: reaching for an effect for what is really event logic, or doing during render what belongs after commit. A useful interrogation for any impure line: *what is the actual cause of this work?* User action ⇒ handler. Being on screen in this state ⇒ effect. Neither ⇒ it is probably derivable, and belongs in render as a pure computation."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**StrictMode is a purity fuzzer, and 'it works without StrictMode' is a confession.** In development, StrictMode double-invokes render (and later, effect setup/cleanup — Unit 6) precisely because, by render idempotence, a contract-honoring component *cannot behave differently* under doubling. It converts a class of rare, timing-dependent production bugs — double-fired requests on interrupted renders, inflating counters, cross-request leaks on the server — into loud, deterministic development bugs. Note its limits, though: it detects impurity that doubling exposes; it cannot prove purity (a component reading Date.now() renders 'consistently' twice in the same millisecond), which is why the contract is a discipline, not a linted guarantee."
            },
            {
              "type": "text",
              "heading": "Props are read-only, and data flows one way",
              "body": "Clause (3) has an architectural face: **a component never modifies its props**, and more broadly, data in React flows *down* — parents pass values to children; children influence parents only by calling functions handed to them (callbacks as props). This is not modesty; each direction of the rule removes a class of unsoundness. Downward-only flow means any on-screen fact has a single authoritative owner, so debugging is tracing a value up to its owner rather than reconstructing a mutation history across the tree — the imperative stale-UI bug from Lesson 1 structurally cannot occur because nobody accumulates screen state by edits. Props immutability is also what makes *props comparison* meaningful: React.memo and every bailout check works by comparing previous and next props (Unit 7); if a child could mutate the object it received, 'previous props' would be corrupted retroactively and comparison would be garbage-in-garbage-out. When a child needs to change data, the pattern is always the same: the owner passes down the value *and a function that requests a change*; the child reports events upward, the owner decides, new props flow down. One direction for data, the opposite direction for requests."
            },
            {
              "type": "example",
              "heading": "Worked example: the shared-object mutation bug",
              "body": "A parent builds one options object and passes it to two charts:\n\n`const opts = { scale: 'linear', max: 100 };`\n`return <><Chart data={a} opts={opts} /><Chart data={b} opts={opts} /></>;`\n\nInside Chart, someone 'adjusts locally': `if (needsLog(data)) opts.scale = 'log'; …`. The first chart renders and flips scale to 'log' — *on the shared object*. The second chart, whose data did not need it, now renders logarithmic too: a spooky action-at-a-distance where chart A's data changes chart B's axes. Worse, the corruption is order-dependent — it depends on which chart renders first — and StrictMode's double render makes it appear and disappear. The honest versions: derive without mutating (`const scale = needsLog(data) ? 'log' : opts.scale;`) or copy at the boundary (`const local = { ...opts, scale: 'log' };`). The rule generalizes: **mutating shared inputs converts composition into coupling** — precisely the thing components exist to prevent. If a value arrived from outside the call, treat it as frozen; derive or copy, never edit."
            },
            {
              "type": "text",
              "heading": "What purity buys, itemized",
              "body": "Close the unit by cashing the contract out, because each payoff is a later chapter. **Batching** (Unit 3): because render is deferred computation with no observable effects, React may coalesce several state updates into one render without anyone detecting the 'skipped' intermediate frames. **Skipping** (Unit 7): a pure component with unchanged inputs must produce unchanged output, so memoization — skip the call, reuse the last tree — is sound by definition; for impure components it would be a behavior change. **Interruption and restart** (Unit 8): concurrent React abandons half-finished renders when urgent work arrives; idempotence says re-running later from scratch is undetectable. **Server rendering and streaming** (Unit 9): the same component must produce the same markup on a machine with no DOM, no window, no user — which is just input-determinism restated. Even **Fast Refresh** — editing code and keeping state — works by re-rendering with old state and new functions, trusting nothing exploded the last time it ran. One contract, five features. When a later unit says 'this works because renders are pure', this lesson is the IOU it is drawing on."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For each snippet, pure or impure during render? Cite the violated clause or the permitting rule. (a) const sorted = [...props.items].sort(cmp) (b) props.items.sort(cmp) (c) const id = useRef(null); if (!id.current) id.current = crypto.randomUUID() — read/written during render (d) let n = 0; for (const x of xs) n += x.qty (e) window.title = props.title",
                  "solution": "(a) Pure — sort mutates a fresh copy created this call (local-mutation permission). (b) Impure — mutates the props array, a pre-existing value (clause 3); silently reorders data for every other reader. (c) Impure as written — writes a persistent ref during render and reads a nondeterministic source (clauses 2/4); under double-render it happens to be idempotent-ish but the contract is violated; correct forms: useId for stable ids, or lazy state useState(() => crypto.randomUUID()). (d) Pure — n is a local accumulator born in this call. (e) Impure — a side effect on the host environment during render (clause 4); belongs in an effect keyed on props.title.",
                  "hint": "For each value touched, ask: did it exist before this render call began?"
                },
                {
                  "prompt": "Rewrite this component to honor the contract, preserving behavior: function Search({ query, all }){ results = all.filter(m => m.includes(query)); sessionStorage.setItem('lastQuery', query); return <List items={results}/>; } (results is accidentally global — no declaration.)",
                  "solution": "function Search({ query, all }) { const results = all.filter(m => m.includes(query)); useEffect(() => { sessionStorage.setItem('lastQuery', query); }, [query]); return <List items={results}/>; }\n\nTwo independent fixes: 'results' becomes a true local (the accidental global wrote to module/window scope — clause 3), and persisting the query is a side effect, moved to an effect that re-synchronizes exactly when query changes. The filter itself was always fine: deriving results during render is the *preferred* home for that logic — it needs no effect, no state.",
                  "hint": "One violation is a scoping accident; the other needs a different 'home' from the three."
                },
                {
                  "prompt": "A signup form component initializes state as useState(defaultProfile) where defaultProfile is a module-level object, then edits fields with profile.name = e.target.value; setProfile(profile). It 'mostly works' but resetting the form shows the previous user's edits. Explain both defects via the contract and give the correct update.",
                  "solution": "Defect 1: mutating profile — the object held in state (pre-existing) — violates clause 3; because setProfile receives the SAME reference, React's Object.is comparison may conclude nothing changed and skip re-rendering (Unit 3 formalizes this), producing the 'mostly' in mostly-works. Defect 2: since state was initialized with the module object itself (not a copy), those mutations write through into defaultProfile — so 'reset' restores a corrupted default containing the previous user's data. Correct: initialize from a copy or factory (useState(() => ({ ...defaultProfile }))) and update immutably: setProfile(p => ({ ...p, name: e.target.value })). The bug pair is the canonical demonstration that mutation + reference-comparison = lost updates, and mutation + shared defaults = data leaks.",
                  "hint": "Who else holds a reference to the object being edited? What does React compare to decide whether to re-render?"
                },
                {
                  "prompt": "Your team's component renders a countdown: it computes remaining = deadline - Date.now() in the body and displays it. It looks right in production. Argue from the contract and the render pipeline: what is wrong, under what circumstances does it misbehave, and what is the pure design?",
                  "solution": "Reading Date.now() during render violates input-determinism (clause 2): the output depends on WHEN React calls the function, which the runtime explicitly reserves the right to vary. Misbehaviors: SSR/hydration mismatch (server renders at time T, client hydrates at T+Δ and the text differs — Unit 9's matching invariant); concurrent renders that pause/resume can show a time inconsistent with the committed frame; StrictMode double render already shows two different values microseconds apart; memoization would freeze a stale time. Pure design: time-as-state — const [now, setNow] = useState(() => Date.now()) updated by an interval in an effect; render derives remaining = deadline - now. Now equal inputs give equal output, and 'time advancing' is an explicit state change with a clear trigger, not an ambient read.",
                  "hint": "The value changes without any React trigger. What phase re-runs at times you don't control?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u1l3-i1",
              "front": "The four clauses of the purity contract?",
              "back": "During render: (1) output determined by props/state/context alone; (2) no reads of outside-changeable values (Date.now, DOM, globals); (3) no mutation of pre-existing values; (4) no side effects."
            },
            {
              "id": "u1l3-i2",
              "front": "What mutation does the purity contract explicitly permit?",
              "back": "Local mutation — freely mutate values created during the current render call (accumulators, built-up arrays); purity is judged at the call boundary."
            },
            {
              "id": "u1l3-i3",
              "front": "The three homes of code, and the cause that assigns each?",
              "back": "Render body — pure derivation (no cause needed); event handler — 'user did something'; effect — 'component is on screen in this state, synchronize an external system'."
            },
            {
              "id": "u1l3-i4",
              "front": "Why does StrictMode double-invoke renders in development?",
              "back": "By render idempotence, pure components can't tell — so any observable difference under doubling is a purity violation surfaced deterministically instead of as a rare concurrency bug."
            },
            {
              "id": "u1l3-i5",
              "front": "Why must props be immutable for React.memo to make sense?",
              "back": "Bailouts compare previous vs next props; if children could mutate received props, 'previous props' would be corrupted and every comparison meaningless."
            },
            {
              "id": "u1l3-i6",
              "front": "Name the five features purchased by the purity contract.",
              "back": "Batching, memoized skipping, interruptible/restartable rendering, server rendering/streaming, and Fast Refresh — each assumes extra or skipped calls are unobservable."
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
            "prompt": "A screen's appearance is determined by four independent boolean flags and one enum of three values. How many state-appearances must a declarative rendering function be correct on (the |S| of the state-coverage proposition)?",
            "answer": 48,
            "explanation": "|S| = 2⁴ × 3 = 48. The proposition's point: a declarative implementation owes correctness on the 48 states, while a worst-case imperative one owes it on up to 48×47 = 2,256 ordered transitions — the quadratic factor is what the runtime's differ absorbs.",
            "points": 1
          },
          {
            "id": "u1q2",
            "type": "short",
            "prompt": "In which phase does React actually modify the DOM? (One word.)",
            "accept": [
              "commit",
              "commit phase",
              "the commit phase"
            ],
            "explanation": "Only commit touches the host tree. Trigger schedules, render purely computes the new element tree, commit applies the minimal diff, and the browser paints afterwards. Half of React debugging is remembering that 'rendered' ≠ 'touched the DOM'.",
            "points": 1
          },
          {
            "id": "u1q3",
            "type": "mcq",
            "prompt": "Which statement about React elements is TRUE?",
            "options": [
              "An element is a lightweight instance of a component that React keeps alive between renders",
              "An element is an immutable description object; a new one is created each render, and persistence lives in React's internal instance for it",
              "Elements are mutable so React can update them in place during commit for performance",
              "JSX elements are DOM nodes created eagerly and attached when commit runs"
            ],
            "answer": 1,
            "explanation": "Elements are immutable plain objects ({type, props, key, ref}) re-created every render — descriptions, not instances and not DOM. The distractors are the three canonical conflations: element-as-instance (persistence actually lives in React's bookkeeping), element-as-mutable (immutability is what makes === a sound skip test), and element-as-DOM (nodes exist only after commit creates them).",
            "points": 1
          },
          {
            "id": "u1q4",
            "type": "proof",
            "prompt": "Prove the render idempotence theorem: for components satisfying the purity contract, executing the render phase k times on the same inputs before a single commit is observationally equivalent to executing it once. State where each clause of the contract is used.",
            "rubric": [
              "States the claim precisely, including 'same inputs' and 'before a single commit', and defines observational equivalence (no program-visible or user-visible difference)",
              "Shows discarded renders are unobservable: no side effects and no mutation of pre-existing values (clauses 3–4) means render output is unreachable fresh allocation — garbage",
              "Shows the committed result is identical: input-determinism (clauses 1–2) gives structurally identical trees on every repetition, and commit/reconciliation is a deterministic function of (previous tree, final tree)",
              "Concludes equivalence and draws at least one correct consequence (StrictMode double-invocation safety, discardable concurrent renders, or speculative rendering)"
            ],
            "solution": "Claim: with purity holding, k renders + one commit ≡ one render + one commit, observationally. (i) During each render, clauses 3–4 forbid I/O, host mutation, and writes to pre-existing memory; every value a render creates is fresh and unreachable from outside until React consumes it. Hence the first k−1 outputs, being discarded, are garbage no observer can see — the executions differ only in unobservable allocations. (ii) Clauses 1–2 make the render function deterministic in (props, state, context), which are fixed across the k calls by hypothesis; so all k trees are structurally identical, and in particular the final tree equals the single-execution tree. (iii) Commit consumes only (previously committed tree, final tree) through deterministic reconciliation, so the mutation set — the only observable output of the pipeline — is identical in both executions. Therefore no observer distinguishes them. ∎ Consequence: StrictMode may double-invoke to detect contract violations (a violation is exactly what makes doubling observable), and concurrent React may discard and restart renders at will.",
            "explanation": "The theorem is the course's load-bearing wall: it converts 'React might call your function extra times' from a threat into a specification. The proof needs both halves — unobservability of discards AND determinism of the kept result — and students commonly supply only one.",
            "points": 3
          },
          {
            "id": "u1q5",
            "type": "open",
            "prompt": "A teammate ships a component that reads window.innerWidth directly in its body to choose a layout, and computes a session id with Math.random() in the body 'once, since it only mounts once'. It passes QA in production builds. Write the review comment: identify each contract violation, describe three concrete environments/features under which each will misbehave, and give the correct design for both.",
            "rubric": [
              "Identifies both violations precisely: reading an outside-changeable value (window.innerWidth) and a nondeterministic source (Math.random) during render — input-determinism broken, not merely 'side effects'",
              "Gives concrete failure environments with mechanisms: SSR (no window / mismatch at hydration), StrictMode or discarded concurrent renders (different random per invocation, layout flicker), memoization/bailouts freezing a stale width, resize not triggering any re-render at all",
              "Correct redesigns: viewport as subscribed external state (effect + resize listener setting state, or useSyncExternalStore / CSS media queries), and the id via lazy state initializer useState(() => …) or useId — with a one-line reason each",
              "Explains why QA passed anyway: single-render, client-only, no-resize happy path never exercises the varied call schedules the runtime reserves — 'works in production today' does not test the contract"
            ],
            "solution": "Both reads violate input-determinism: the returned tree depends on when React happens to call the function. innerWidth: on the server it throws or forces a fake default, and the hydrated client tree can mismatch the server markup (Unit 9's invariant); a resize changes nothing on screen because no state update triggers a render — the UI is stale by construction; under memoization the width freezes. Math.random 'once': the body runs on every render, StrictMode doubles it, and any discarded-and-restarted concurrent render mints a new id mid-session — 'mounts once' conflates the function running with the instance mounting. Redesign: treat viewport width as an external store — subscribe in an effect (resize → setWidth) or useSyncExternalStore(subscribe, () => window.innerWidth, serverSnapshot); often the honest fix is CSS media queries, removing the fact from JavaScript entirely. Session id: useState(() => crypto.randomUUID()) — the initializer runs once per instance, the value is stable state thereafter — or useId for hydration-safe identifiers. QA passed because the happy path exercises exactly one call per mount with no server, no doubling, no interruption: the contract exists to cover the schedules QA never runs.",
            "explanation": "The two bugs are the archetypes of clause-2 violations: an ambient mutable read (width) and a nondeterministic read (random). The transfer being tested is deriving concrete failure modes from the contract rather than reciting 'don't do side effects in render'.",
            "points": 3
          },
          {
            "id": "u1q6",
            "type": "mcq",
            "prompt": "During a parent's re-render, a child <input> that the user has typed into keeps its text. Which is the correct explanation?",
            "options": [
              "React saves and restores input values around every commit",
              "The input's element description was unchanged, so commit never touched its DOM node — the browser-held value was simply never disturbed",
              "Inputs are special-cased: React never updates form elements after mount",
              "The virtual DOM stores the typed text and re-injects it after diffing"
            ],
            "answer": 1,
            "explanation": "Nothing saves or restores anything: the diff between the previous and next descriptions is empty at that node, so commit performs no mutation there, and browser state (value, focus, scroll) survives because the node was never touched. The distractors attribute agency to React it doesn't have — no save/restore machinery, no form special-case (React updates inputs whenever their description changes), and the element tree stores descriptions, never DOM-held state.",
            "points": 1
          }
        ]
      }
    },
    {
      "id": "u2",
      "title": "Reconciliation and Identity",
      "summary": "How React turns two descriptions into a minimal edit script: the tree-diff complexity gap, the two heuristic assumptions, keys, and why state's identity is an address in the tree.",
      "references": [
        "react.dev — Preserving and Resetting State; Rendering Lists (key semantics); legacy reconciliation docs",
        "Zhang & Shasha (1989) — Simple fast algorithms for the editing distance between trees",
        "Demaine, Mozes, Rossman & Weimann (2007) — An optimal decomposition algorithm for tree edit distance, O(n³)",
        "Bringmann, Gawrychowski, Mozes & Weimann (2018) — Tree edit distance cannot be computed in strongly subcubic time (unless APSP can)",
        "Dan Abramov — 'React as a UI Runtime' (overreacted.io, 2019) — reconciliation & identity sections"
      ],
      "prerequisites": [
        "u1"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u2l1",
          "title": "The Diffing Problem",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The problem commit must solve",
              "body": "Unit 1 left a gap deliberately open. Render produces a new element tree; the DOM currently embodies the previous one; commit must transform the second into the first. *Which* sequence of mutations should it apply? Doing nothing is wrong; deleting everything and rebuilding from scratch is correct but catastrophic — it destroys focus, selection, scroll positions, video playback, and every piece of browser-held state, while paying the maximal DOM cost the whole architecture exists to avoid. What commit wants is an **edit script**: a sequence of insertions, deletions, and in-place updates that transforms the old tree into the new one, ideally a short one. This is a well-studied problem in its exact form — and the exact form turns out to be *unaffordable*, which is the single most important fact about React's reconciler. React does not compute the optimal edit script. It computes a good-enough script under two structural assumptions about UIs, in linear time, and exposes one escape hatch — `key` — for the only case where the assumptions need your help. This lesson establishes the gap between the exact problem and React's heuristic precisely, because every reconciliation behavior you will ever observe (state resets, list bugs, remount storms) is a direct consequence of which corners the heuristic cuts."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Tree edit distance",
              "statement": "Let T₁, T₂ be rooted, ordered, labeled trees (labels = element type + props; order = sibling order). An **edit script** is a sequence of operations transforming T₁ into T₂, drawn from: **delete** a node (its children are promoted to the parent), **insert** a node (capturing a contiguous run of siblings as its children), and **relabel** a node (change its label in place). Each operation has unit cost. The **tree edit distance** δ(T₁, T₂) is the minimum total cost over all edit scripts, and an optimal differ is one that outputs a script of cost δ(T₁, T₂). With n = |T₁| + |T₂|, the classical dynamic-programming algorithm of Zhang & Shasha runs in O(n⁴) in the worst case; the decomposition algorithm of Demaine, Mozes, Rossman & Weimann achieves O(n³) worst case and is optimal among its algorithm family; and Bringmann et al. (2018) showed no strongly subcubic algorithm exists unless the All-Pairs Shortest Paths conjecture fails."
            },
            {
              "type": "text",
              "heading": "Why the exact problem is unaffordable",
              "body": "Put numbers on it. A modest product page renders a few thousand host nodes; call it n = 5,000 across both trees. An O(n³) algorithm performs on the order of 10¹¹ elementary steps — minutes of CPU time — *per state update*, for a UI that must respond in 16 milliseconds to animate at 60 frames per second. Even the O(n²)-ish behavior Zhang–Shasha exhibits on shallow trees is 2.5 × 10⁷ steps per keystroke, spent before a single mutation is applied. And the conditional lower bound says this is not a failure of cleverness: cubic is essentially the price of *optimality*, full stop. The conclusion React's designers drew is the correct engineering response to a hardness result: **change the problem**. Give up minimality; demand linearity; and choose the corners to cut using domain knowledge about how real UIs actually change between frames. The domain knowledge crystallized into two assumptions, and the entire reconciler follows from them."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "React's heuristic diff is O(n), and no correct differ can beat Ω(n)",
              "statement": "(a) Any differ that is correct for arbitrary tree pairs must inspect Ω(n) of the input in the worst case. (b) React's reconciliation — compare roots; if types differ, replace the subtree wholesale; if types match, update the node in place and recurse on the children lists, matching siblings positionally or by key — performs O(n) node comparisons total.",
              "proof": "(a) Adversary argument: suppose a differ examines fewer than n/2 nodes on some input pair (T, T). An adversary runs the differ on (T, T′) where T′ equals T except at one unexamined node, whose label is changed. The differ's execution is identical on both pairs (it never reads the differing node), so it emits the same script for both — but the correct outputs differ (empty script vs at least one relabel). Contradiction; correctness forces reading essentially the whole input. (b) The heuristic touches each pair of matched nodes exactly once: root comparison is O(1); a type mismatch prunes the entire subtree pair with no further comparisons (replacement needs no inspection of descendants beyond construction, which is proportional to the new subtree's size — chargeable to output); a type match costs O(1) plus recursion into children, where positional matching is a single zip of the two child lists and keyed matching builds one hash map of old keys (O(children)) and probes it once per new child (O(1) amortized each). Every node of both trees is charged O(1), so total work is O(n). The heuristic therefore meets the lower bound: linear is not merely fast, it is optimal for any correct differ, once minimality of the script is abandoned. ∎"
            },
            {
              "type": "text",
              "heading": "The two assumptions, stated honestly",
              "body": "**Assumption 1 — different types mean different trees.** If a position held a `<div>` and now holds a `<span>`, or held a `ProfilePage` and now holds a `SettingsPage`, React does not look for salvageable structure inside; it unmounts the old subtree — destroying its instances and their state, detaching its DOM — and mounts the new one from scratch. The bet: in real UIs, when the type at a position changes, the subtrees are semantically unrelated, and hunting for coincidental structural overlap (which the optimal algorithm would do, at cubic price) buys nothing users care about. **Assumption 2 — the developer can mark identity across renders with `key`.** Within a sibling list, React cannot know whether you inserted at the head or relabeled every row: both hypotheses explain the observation. Rather than solve an alignment problem, React lets the *author* declare identity — `key` is the developer asserting 'this child is the same logical entity as the old child with the same key'. Between the two assumptions, matching becomes local and constant-time per node: types gate subtree reuse, keys resolve sibling alignment, and nothing else is ever compared. What is given up is real: a subtree *moved* to a different parent is never recognized as a move (it is deleted and rebuilt — state lost), and cross-level or cross-type overlap is invisible. These are precisely the behaviors the next two lessons turn from surprises into predictions."
            },
            {
              "type": "code",
              "heading": "The child-reconciliation loop, distilled",
              "lang": "jsx",
              "code": "// Pseudocode of one level of reconciliation (simplified from\n// react-reconciler). oldChildren: committed fibers; newChildren: fresh elements.\nfunction reconcileChildren(oldChildren, newChildren) {\n  const ops = [];\n  if (newChildren.some(c => c.key != null)) {\n    // KEYED PATH — identity is declared. Build old-key index once.\n    const byKey = new Map(oldChildren.map(c => [c.key, c]));\n    for (const next of newChildren) {\n      const prev = byKey.get(next.key);\n      if (prev && prev.type === next.type) {\n        ops.push(update(prev, next));      // same identity: update in place,\n        byKey.delete(next.key);            // recurse into its children\n      } else {\n        ops.push(mount(next));             // new identity (or type changed)\n      }\n    }\n    for (const orphan of byKey.values()) ops.push(unmount(orphan));\n    // (Real React also computes which retained nodes must MOVE in the\n    // DOM, minimizing moves against the longest stable subsequence.)\n  } else {\n    // POSITIONAL PATH — identity defaults to the index.\n    const len = Math.max(oldChildren.length, newChildren.length);\n    for (let i = 0; i < len; i++) {\n      const prev = oldChildren[i], next = newChildren[i];\n      if (prev == null)                 ops.push(mount(next));\n      else if (next == null)            ops.push(unmount(prev));\n      else if (prev.type === next.type) ops.push(update(prev, next));\n      else { ops.push(unmount(prev)); ops.push(mount(next)); } // Assumption 1\n    }\n  }\n  return ops;\n}"
            },
            {
              "type": "example",
              "heading": "Worked example: one diff, three fates",
              "body": "Previous render: `<section><Spinner /><p className=\"hint\">Loading…</p></section>`. Next render: `<section><Results items={data} /><p className=\"hint done\">Done</p></section>`.\n\nWalk the algorithm. The roots match (`section` = `section`): update in place, recurse into children positionally (no keys). **Child 0:** `Spinner` vs `Results` — types differ, Assumption 1 fires: Spinner's instance is unmounted (its state, timers via cleanup, and DOM are destroyed) and Results is mounted fresh. No attempt is made to notice that both might render a `<div>` — the optimal differ would have found that overlap; React, by design, does not look. **Child 1:** `p` vs `p` — types match, so the *same DOM node* is retained and only the changed props are patched: `className` gets one attribute write, and the text child `'Loading…'` vs `'Done'` differs, one text update. Total script: one unmount, one mount, two in-place writes — computed in a handful of comparisons. Note the asymmetry you should now expect everywhere: **matching types are cheap and preserving; mismatched types are wholesale and destructive.** The user-visible consequence of the wholesale branch — state loss below the mismatch — is Lesson 3's entire subject."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**What 'minimal DOM updates' really means.** React's marketing-level claim needs a precise reading: commit applies no mutation where descriptions are equal — but the *script* is minimal only relative to the heuristic's matching, not globally. Move a subtree across parents and React issues delete + recreate where an optimal differ would issue one move. Swap a wrapper `<div>` for a `<section>` and the entire inner tree is rebuilt though 99% was unchanged. These aren't bugs to report; they're the purchased trade — cubic-optimal scripts were the alternative. Engineering with the reconciler means arranging your trees so the heuristic's cheap cases are the common ones: stable types at stable positions, keys wherever siblings carry identity."
            },
            {
              "type": "text",
              "heading": "Reading the trade like an engineer",
              "body": "It is worth pausing on the shape of this design, because it recurs across systems engineering and this course will lean on it again (memoization in Unit 7 makes the same move: replace an expensive exact question — 'did anything relevant change?' — with a cheap conservative one — 'are the references equal?'). The exact problem has a hardness result; the engineering response is to identify which instances *actually occur* and solve those well. React's two assumptions encode an empirical claim about UI dynamics: between consecutive frames, trees mostly keep their shape; types at a position almost never change meaningfully; and the one genuinely dynamic region — lists — has identity information the author already possesses (database ids) and can surface for free. When the claim holds, the heuristic's script is near-optimal and computed three orders of magnitude faster. When it fails — you alternate types gratuitously, you wrap subtrees conditionally, you withhold keys — the reconciler silently degrades to rebuild-heavy scripts. The skill this unit builds is *seeing your JSX as the reconciler sees it*: not markup, but a stream of (position, type, key) triples whose stability you control."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "State the exact complexity picture for tree edit distance in three lines: the classic DP bound, the best known worst case, and the conditional lower bound — and then say in one sentence why React's problem statement escapes all three.",
                  "solution": "Zhang–Shasha: O(n⁴) worst case (O(n²) on shallow, balanced trees). Demaine–Mozes–Rossman–Weimann: O(n³) worst case, optimal for decomposition algorithms. Bringmann et al. 2018: no strongly subcubic algorithm unless APSP has one — cubic is essentially inherent. React escapes because it abandons *minimality*: it never computes δ(T₁,T₂), only a correct (not optimal) script under type-gated matching and author-declared identity, which the Ω(n)/O(n) proposition shows is then optimally fast.",
                  "hint": "Three named results, then: which requirement (correctness? minimality? speed?) did React drop?"
                },
                {
                  "prompt": "Using Assumption 1, predict precisely what happens to the DOM and to component state when a render changes <article><Comments postId={7}/></article> to <section><Comments postId={7}/></section> — and explain why an optimal differ would have done strictly less work.",
                  "solution": "The root types differ (article → section), so React replaces the subtree wholesale: the article node and EVERYTHING beneath it — including the Comments instance, its state (drafted reply text, pagination), and its DOM — is unmounted and destroyed; a fresh section mounts with a brand-new Comments that reinitializes from scratch (refetch, empty draft). An optimal differ would emit a single relabel of the root (cost 1) and reuse the entire inner tree, since the Comments subtree is identical. React's heuristic cannot see that: a type mismatch prunes all comparison below it by design — that pruning is exactly where the O(n) bound comes from.",
                  "hint": "The mismatch is at the top. What does the heuristic do with everything below a mismatch?"
                },
                {
                  "prompt": "Your teammate proposes 'smart reconciliation': when types mismatch, recursively check whether the old and new subtrees are 90% similar before deciding to replace. Argue from the complexity results why this reintroduces the problem React was designed to avoid, and identify the one mechanism React already provides for the legitimate version of this need.",
                  "solution": "'Check similarity' between two subtrees is itself a tree-comparison problem: done honestly it is edit-distance computation, and the lower bound says there is no cheap general answer — nesting it inside every mismatch turns the linear pass into a superlinear one (potentially cubic at the root, where a mismatch would trigger similarity analysis of the whole pair). The heuristic's entire value is that a mismatch costs O(1) decision time. The legitimate need — 'this subtree is the same logical thing even though it moved/changed context' — is what `key` expresses within a sibling list: identity declared by the author in O(1), no inference required. (Across parents, React deliberately offers nothing: cross-level identity would require the search being priced out.)",
                  "hint": "What problem is 'check if 90% similar' an instance of? What does its lower bound say?"
                },
                {
                  "prompt": "The Ω(n) adversary argument assumed the differ must be correct on ALL inputs. Real React skips entire subtrees without reading them when the element reference is identical (Unit 1's === bailout). Reconcile the two facts: why is that not a violation of the lower bound?",
                  "solution": "The bailout exploits an extra precondition the adversary model lacks: immutability plus reference identity. If oldChild === newChild, immutability guarantees the descriptions are equal without inspection — the input carries a certificate of equality, so 'reading' the one pointer comparison legitimately stands in for reading the subtree. The adversary's trees had no such certificates; it could tamper with any unread node. Formally, the Ω(n) bound applies to differs over arbitrary tree encodings; React's encoding (shared immutable substructure) lets equality be verified in O(1) per shared subtree. Same theorem, different input model — and it is exactly why immutability is load-bearing rather than stylistic (Units 3 and 7 build on this certificate repeatedly).",
                  "hint": "What does === prove under immutability that the adversary's model didn't allow?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u2l1-i1",
              "front": "What problem does reconciliation solve, and what does React give up to solve it fast?",
              "back": "Transform the committed tree into the new description via an edit script; React gives up script minimality (exact tree edit distance is ~Θ(n³)) for a correct O(n) heuristic."
            },
            {
              "id": "u2l1-i2",
              "front": "React's two reconciliation assumptions?",
              "back": "(1) Different types at a position ⇒ unrelated subtrees — replace wholesale; (2) authors declare sibling identity across renders with key."
            },
            {
              "id": "u2l1-i3",
              "front": "Complexity of exact tree edit distance vs React's diff?",
              "back": "Exact: O(n³) best known, no strongly subcubic unless APSP falls (Bringmann et al.). React: O(n) — which matches the Ω(n) bound any correct differ must pay."
            },
            {
              "id": "u2l1-i4",
              "front": "What happens to everything below a type mismatch?",
              "back": "Pruned without comparison: old subtree unmounted (instances, state, DOM destroyed), new subtree mounted fresh — mismatches are wholesale and destructive by design."
            },
            {
              "id": "u2l1-i5",
              "front": "Why doesn't React detect a subtree moved to a different parent?",
              "back": "Matching is local (per sibling list); cross-level identity would require the expensive search the heuristic exists to avoid — moves across parents become delete + recreate."
            }
          ]
        },
        {
          "id": "u2l2",
          "title": "Keys and List Identity",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The alignment problem keys exist to solve",
              "body": "Sibling lists are the one place reconciliation genuinely cannot proceed without help. Suppose the previous render produced rows [A, B, C] and the new render produces [X, A, B, C]. From the reconciler's seat these are just two element arrays; *nothing in the data distinguishes* 'X was prepended' from 'every row changed its content and a fourth appeared at the end'. Both hypotheses perfectly explain the before/after pair. Choosing wrongly is not a cosmetic error: under the second hypothesis React updates A-in-place-to-become-X, B-to-become-A, and so on — every row's props change, every row re-renders, and any state *inside* those rows (input text, expansion toggles, video position) stays glued to the position while the data slides underneath it. The information that resolves the ambiguity — which logical entity each row represents — exists, but it lives in your data model, not in the element structure. `key` is the channel for handing it over: a per-sibling identity token that lets the reconciler match rows by *who they are* instead of *where they sit*. This lesson makes the cost difference exact and then derives the usage rules from the mechanism, so they stop being lint folklore."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The cost of positional matching under insertion",
              "statement": "Let a sibling list of n rows be re-rendered with one new row inserted at the head (all other rows unchanged, in order). (a) Under **positional matching** (no keys), the diff updates all n retained rows' props and mounts one row: Θ(n) row updates, and every stateful retained row is now associated with the wrong logical entity. (b) Under **keyed matching** with stable unique keys, the diff mounts exactly the one new row and re-associates the n retained rows with zero prop changes: O(1) mutations beyond the insert, and every row keeps its correct state. Symmetrically, head-deletion costs Θ(n) positional updates vs a single keyed unmount, and a reversal costs Θ(n) content rewrites positionally vs pure moves keyed.",
              "proof": "(a) Positional matching pairs old index i with new index i. After a head insert, new index 0 is the inserted row and new index i (i ≥ 1) holds old row i−1's data. Old row i is compared against data of old row i−1: same type, so it is *updated in place* with different props — n such pairs, each a real prop-patch and re-render, hence Θ(n) work. State correctness: instance at position i keeps its state (the type matched), but its props now describe entity i−1 — every stateful row is misaligned by one. The last position pairs old row n−1 against nothing new... rather, new length n+1 exceeds old length n, so one mount occurs at the tail — the 'new row' React perceives is at the *end*, not the head, compounding the misalignment. (b) Keyed matching builds the old map {k₁…kₙ} and probes each new child: the head row's key is absent — one mount; each retained key hits, with props identical to before (same entity, same data), so the update is a no-op and, where element references are shared, subtrees bail out entirely. Instances follow their keys, so state stays with its entity. Mutations: one insert plus reposition bookkeeping, O(1) beyond the insert. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: watching the misalignment happen",
              "body": "Render a signup sheet where each row is `<li>{name} <input placeholder=\"note\"/></li>`, no keys, list = [Ada, Bo]. The user types 'bring cake' into **Bo's** input. Now prepend Zed: list = [Zed, Ada, Bo].\n\nPositional diff, step by step. Position 0: old (Ada) vs new (Zed) — `li` vs `li`, type match ⇒ update in place: text 'Ada' → 'Zed'. The *DOM input at position 0* is untouched (its description didn't change), keeping whatever it held. Position 1: old (Bo) vs new (Ada) — update text 'Bo' → 'Ada'; **the input that contains 'bring cake' stays at position 1**, now labeled Ada. Position 2: nothing old vs new (Bo) ⇒ mount a fresh `li` with an *empty* input. Net effect on screen: Zed, Ada — *with Bo's note now apparently Ada's* — and Bo with no note. No error was thrown; every step was 'correct' under positional identity. The browser-held input state (which React never tracks, Unit 1) stayed bolted to positions while the labels slid up. With `key={person.id}`, the same update is: mount Zed's row; Ada's and Bo's elements match by key with identical props — their inputs never move, never detach, and 'bring cake' stays with Bo."
            },
            {
              "type": "code",
              "heading": "Index-as-key is positional matching wearing a costume",
              "lang": "jsx",
              "code": "// BUG: key={index} — identical to no keys under insertion/removal/reorder,\n// because the 'identity' you declared IS the position.\n{people.map((p, i) => (\n  <li key={i}>\n    {p.name} <input placeholder=\"note\" />\n  </li>\n))}\n\n// After prepending Zed, the keyed matcher sees:\n//   old: key 0 → Ada,  key 1 → Bo\n//   new: key 0 → Zed,  key 1 → Ada,  key 2 → Bo\n// Key 0 'matches' — so Ada's instance is updated to Zed's data.\n// Exactly the misalignment positional matching produces, now with\n// extra confidence because you *asserted* the identities were stable.\n\n// CORRECT: identity from the data model.\n{people.map(p => (\n  <li key={p.id}>\n    {p.name} <input placeholder=\"note\" />\n  </li>\n))}\n\n// If the data truly has no id (rare — server rows, files, form fields\n// all do), mint one AT DATA-CREATION TIME, not at render time:\n//   newPerson = { id: crypto.randomUUID(), name }\n// Never key={Math.random()} in render: a fresh key EVERY render means\n// nothing ever matches — total remount of every row on every keystroke\n// (state wiped, focus lost, O(n) DOM churn each frame)."
            },
            {
              "type": "text",
              "heading": "The key rules, derived rather than memorized",
              "body": "Every rule the linter enforces about keys is a one-line corollary of the matching mechanism. **Stable**: a key that changes across renders (random, array index under mutation) severs the match — the old instance is unmounted, state destroyed, a fresh mount takes its place. Stability is what makes a key an *identity* rather than a label. **Unique among siblings**: the old-key map has one slot per key; duplicates make matching ambiguous (React warns and degrades to first-match — later duplicates behave unpredictably under reorder). Uniqueness is only required *within the sibling list* — two different lists can happily reuse the same keys, because matching is per-parent. **From the data, not the render**: the key must name the entity the row represents; the only party that knows the entity is your data model, so ids come from there. Generating in render violates stability; generating at data-creation is fine. And the negative space: **key is consumed by React** — it is not a prop, the child never receives it (reserve a separate prop if the child needs the id), and it participates in exactly one other behavior, refining a node's position-identity for state purposes, which is Lesson 3's lever for deliberate resets."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**When is index-as-key actually acceptable?** All three, simultaneously: the list is never reordered or filtered; items are never inserted or deleted except at the tail; and rows carry no state anywhere beneath them (no inputs, no selection, no animations, no memo). Under those conditions index and identity coincide forever, so the costume is harmless — a static menu qualifies. The moment ANY condition fails — a delete button appears, a sort control ships, a row grows an input — index keys convert to the misalignment bug, typically discovered in production as 'checkboxes jump to the wrong row when I filter'. The safe default is data ids; treat index keys as an optimization you must justify, not a fallback."
            },
            {
              "type": "example",
              "heading": "Worked example: the filtered-checklist bug, diagnosed end to end",
              "body": "A task list renders `<TaskRow key={index} task={t}/>` where TaskRow holds `const [done, setDone] = useState(false)` for its checkbox. Tasks: [Write, Review, Ship]. The user checks **Review** (index 1). Then they filter out completed-elsewhere task 'Write', so the list renders [Review, Ship].\n\nDiff under index keys: old keys {0: Write, 1: Review, 2: Ship}; new keys {0: Review, 1: Ship}. Key 0 matches — the instance that held *Write's* row (unchecked) is updated with Review's props: Review now shows **unchecked**. Key 1 matches — the instance that held *Review's* row (checked!) receives Ship's props: **Ship shows checked**. Key 2 is orphaned — unmounted. The user's report writes itself: 'I checked Review, filtered, and now Ship is checked instead.' Notice the two-layer failure: the *data* (props) realigned correctly because it flows from the parent each render, but the *state* (done) lives in instances, and instances followed keys — which followed positions. Fix: `key={t.id}`. Now filtering orphans Write's key (its instance unmounts, taking its unchecked state), and Review's/Ship's instances — with their state — follow their ids. One-line change; the class of bug is structurally gone. This is the single most common key bug in production React, and you can now derive it rather than pattern-match it."
            },
            {
              "type": "text",
              "heading": "Keys as a rendering tool beyond lists",
              "body": "Because a key refines identity wherever it appears, single children can use it too — and this turns a hazard into an instrument. Rendering `<ProfileForm key={userId} />` declares that forms for different users are *different instances*: switching users unmounts the old form (discarding half-typed edits, deliberately) and mounts a fresh one initialized from the new user — no manual 'reset all fields' effect, no stale-draft bug; the reconciler's destructive branch does the cleanup atomically. The same trick resets an animation (`key={photoId}` on an image that should re-fade per photo), restarts a video player per source, or forces a chart to re-initialize per dataset when its library resists prop-driven updates. The mental shift to internalize: keys are not 'list glue you add to silence a warning'; they are the *identity annotation of the reconciliation algebra* — you are telling the differ which nodes across renders denote the same entity, and every preservation/destruction behavior downstream follows mechanically from what you declare. Lesson 3 completes the picture by pinning down exactly what 'the same instance' preserves: state, and its address in the tree."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A list of n=200 chat messages re-renders after 10 new messages arrive at the HEAD (newest-first UI). Count the row-level operations (in-place updates + mounts) under (a) no keys, (b) key={message.id} — and state which version risks scroll/selection glitches and why.",
                  "solution": "(a) Positional: new positions 0–9 pair against old rows 0–9 (type match ⇒ in-place update with different message props), positions 10–209 pair old 0–199 shifted — every one of the 200 retained rows gets a prop-rewrite (Θ(n) = 200 updates) plus 10 mounts at the tail. All 210 rows re-render; text selection and any per-row state misalign by 10. (b) Keyed: 10 mounts (the new ids), 200 key-hits with identical props — no-op updates, and rows whose elements are reference-equal can bail out entirely. Version (a) risks the glitches: the browser sees 200 text/content mutations (selection anchors into mutated nodes collapse), while (b) mutates nothing in retained rows — it inserts 10 nodes above them.",
                  "hint": "Under positional matching, what does old row i get compared against after a 10-row head insert?"
                },
                {
                  "prompt": "Explain why key={Math.random()} in render is strictly WORSE than no key at all, quantifying the per-render cost for an n-row list of stateful rows.",
                  "solution": "No key degrades to positional matching: wrong identity on structural change, but at least rows match SOMETHING when the list is stable — a stable list re-renders with n cheap in-place updates and preserved state. Random keys mean the old-key map scores zero hits every render, even when nothing changed: all n old instances unmount (state, focus, subscriptions destroyed via cleanup) and n fresh instances mount — Θ(n) DOM node creation + destruction per render, per keystroke if a parent input drives renders. It converts the reconciler's cheapest case (nothing changed) into its most expensive (everything changed). Random keys are the only way to make React slower than rebuilding by hand, because you also pay diffing overhead to conclude 'rebuild everything'.",
                  "hint": "What fraction of keys match when every key is freshly minted? What happens to each unmatched old child?"
                },
                {
                  "prompt": "Design question: a table supports sorting by column and inline row editing (each row holds draft state). The backend returns rows WITHOUT ids (a legacy report endpoint returning arrays of values). Give a correct keying strategy, state where the identity must be minted, and explain why hashing the row's CONTENT as the key is subtly wrong here.",
                  "solution": "Mint identity at data-ingestion: when the response arrives, map rows to {id: crypto.randomUUID(), ...fields} once (in the fetch handler / cache layer), and key rows by that id for the lifetime of the dataset. Sorting then reorders keys — matched instances MOVE with their draft state intact, which is the requirement. Content-hash keys fail precisely because rows are EDITABLE: the draft edits the content, so committing an edit changes the hash ⇒ changes the key ⇒ severs the match ⇒ unmounts the row being edited, destroying the draft state and focus mid-edit (the bug fires exactly when the feature is used). Content-addressing gives identity-of-value; editing needs identity-of-entity — stable across value changes, which is why it must be minted independent of content, once, at creation.",
                  "hint": "What happens to a content-derived key at the exact moment the user edits the content?"
                },
                {
                  "prompt": "A teammate 'fixes' a state-reset bug by moving a component's key from key={userId} to a constant key=\"form\", and the bug (form clearing when switching users) disappears — but a worse one appears. Predict the new bug and adjudicate: which behavior was correct, and what determines the answer?",
                  "solution": "New bug: switching users now PRESERVES the form instance and its state — user B's screen shows user A's half-typed draft (name, address, possibly sensitive values) with B's userId about to submit them: a data-leak-shaped bug strictly worse than the reset. The constant key declares 'the form for every user is the same entity', so the reconciler correctly preserves state across the switch; key={userId} declares per-user identity, so switching unmounts and remounts — the 'bug' the teammate saw was the intended semantics. Which is right is a PRODUCT decision about identity: is the entity 'the form' (drafts survive switching, e.g. a comparison tool) or 'this user's form' (drafts are per-user, the usual case)? Keys are how you write that decision down; 'fixing' by weakening identity silently changes the product's data model.",
                  "hint": "State follows the instance; the key defines when it's 'the same' instance. Same for whom?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u2l2-i1",
              "front": "What ambiguity does key resolve that the reconciler cannot resolve alone?",
              "back": "Whether sibling changes are structural (insert/remove/reorder of entities) or content changes at fixed positions — key declares which rows across renders are the same entity."
            },
            {
              "id": "u2l2-i2",
              "front": "Cost of a head-insertion into an n-row list: positional vs keyed?",
              "back": "Positional: Θ(n) in-place prop rewrites (plus a tail mount) with all row state misaligned by one. Keyed: one mount, retained rows no-op — state stays with its entity."
            },
            {
              "id": "u2l2-i3",
              "front": "Why is key={index} equivalent to no key, and when is it acceptable?",
              "back": "The declared identity IS the position. Acceptable only when all hold: never reordered/filtered, append-only, and rows are stateless."
            },
            {
              "id": "u2l2-i4",
              "front": "Why is key={Math.random()} the worst possible key?",
              "back": "Zero matches every render: all n rows unmount and remount each pass — maximum DOM churn plus total state loss, even when nothing changed."
            },
            {
              "id": "u2l2-i5",
              "front": "The three derived key rules?",
              "back": "Stable across renders (else match severed ⇒ remount), unique among siblings (map has one slot per key), minted from the data model at creation (only it knows entity identity)."
            },
            {
              "id": "u2l2-i6",
              "front": "Non-list use of key?",
              "back": "Deliberate identity control: key={userId} on a form resets all its state atomically per user; changing key is the sanctioned 'remount this subtree' lever."
            }
          ]
        },
        {
          "id": "u2l3",
          "title": "State Lives in the Tree",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The question Unit 1 left dangling",
              "body": "A component function re-runs on every render — its locals die each time — yet `useState` hands back the *same* count, render after render. So where does state actually live? Not in the function (it has no persistence), not in the element (immutable, rebuilt each render), but in the third member of Lesson 1's trinity: the **instance** — React's per-position bookkeeping, the fiber. And here is the fact this whole lesson unpacks: React associates instance to component *by position in the render tree*, exactly the way reconciliation matches nodes. State does not belong to 'the Counter component' or to 'this JSX tag in the source code'; it belongs to *an address* — 'the Counter rendered as the second child of this section' (with key refining the address among siblings). When successive renders put the same type at the same address, reconciliation matches them, and the address's state persists. When they don't, the instance at that address is destroyed — state and all — and any 'new' appearance elsewhere is a fresh instance. Every state-preservation surprise in React — states that survive when you expected resets, resets when you expected survival — is this one addressing rule meeting an unexamined intuition."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The state-identity rule",
              "statement": "State (and all instance-held bookkeeping: hooks, refs, effect registrations) is preserved from one committed render to the next **iff** the element at the same position in the render tree has the same type — where *position* means the path of (parent, child-index) steps from the root as reconciliation walks it, and an explicit **key** replaces child-index in that path wherever present. Consequently: (1) same type, same position ⇒ same instance, state preserved — *even if the JSX came from a different source location or branch of a conditional*; (2) different type at a position ⇒ the old instance and its entire subtree's instances are destroyed, and state below the mismatch is lost — *even if deeper descendants are identical*; (3) a changed key at the same position ⇒ treated as a different address: old instance destroyed, new one mounted; (4) a subtree rendered at a different position (moved across parents, or re-parented by adding/removing a wrapper) ⇒ new address, fresh state."
            },
            {
              "type": "example",
              "heading": "Worked example: the conditional that preserves and the wrapper that destroys",
              "body": "**Case A — same position, same type, different branch.** `{isPlayerA ? <Counter person=\"A\"/> : <Counter person=\"B\"/>}` — toggling isPlayerA does NOT reset the counter. Both branches render type Counter at the same address (first child of the parent); reconciliation sees Counter → Counter, matches, updates props (person 'A' → 'B'), and the instance — with its count — survives. The two JSX expressions in your source are irrelevant: React never sees your source, only the returned element stream. If you *want* separate scores per player, that is an identity decision, and by Lesson 2 you write it as identity: `<Counter key={person} person={person}/>` — now the address differs per player and each has independent state.\n\n**Case B — same everything, one extra wrapper.** Changing `{fancy ? <div className=\"gold\"><Counter/></div> : <Counter/>}` — toggling fancy DOES reset the counter, both directions. With fancy true, Counter's address is root → div → child 0; with fancy false it is root → child 0. Different paths: at the old address, the div (or Counter) is gone — type mismatch or absence at that position — so the subtree unmounts. The instances' addresses changed, so their state died, even though 'the same `<Counter/>`' visibly appears in both branches. The addressing rule, applied cold, predicts both cases in seconds; intuition about 'the same component' predicts neither."
            },
            {
              "type": "code",
              "heading": "The addressing rule in four snapshots",
              "lang": "jsx",
              "code": "// 1) PRESERVED — type & position stable; only props change.\n{isMorning ? <Clock theme=\"light\"/> : <Clock theme=\"dark\"/>}\n// Clock → Clock at child 0: same instance, state kept, theme patched.\n\n// 2) RESET — type changes at the position.\n{loggedIn ? <Dashboard/> : <LoginForm/>}\n// Dashboard's whole subtree (every input, every child's state)\n// unmounts when loggedIn flips. Usually what you want here.\n\n// 3) RESET — position changes (conditional sibling shifts the index).\n{showBanner && <Banner/>}\n<Chat/>\n// Banner toggling changes Chat's child-index (1 ⇔ 0)… EXCEPT: false\n// occupies a slot in the element stream! {cond && <X/>} renders the\n// boolean `false` at that position, so Chat KEEPS index 1 either way\n// — state preserved. But rewrite it as {cond ? <><Banner/><Chat/></>\n// : <Chat/>} and Chat's address genuinely changes: reset. The\n// difference between the two refactors is invisible in the UI and\n// decisive for state — read the element stream, not the screen.\n\n// 4) RESET ON DEMAND — same type, same position, new key.\n<ProfileForm key={userId}/>\n// key edits the address itself: new user ⇒ new address ⇒ fresh form."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Nested component definitions force remounts every render",
              "statement": "If a component G is defined *inside* the body of a component F, then every re-render of F unmounts and remounts G's subtree, destroying all state within it. In particular, any input inside G loses its value and focus on each keystroke that re-renders F — the nested definition makes state retention impossible, regardless of keys or memoization.",
              "proof": "Reconciliation's type comparison is reference identity on the component function (types are compared with ===; two distinct function objects are different types even with identical code). Defining G inside F means each call of F evaluates the function expression anew, producing a fresh function object G_t on render t. The element <G_t/> at some position is compared against the previous render's <G_{t−1}/> at the same position: same source text, but G_t !== G_{t−1}, so the types differ. By the state-identity rule (clause 2), the old instance is destroyed and a new one mounted — on every render of F. No key can help (keys refine the address; the type test already failed) and memoizing G with useMemo merely stabilizes one render's function object until F's next render recreates it unless dependencies never change — at which point the code is a worse spelling of a top-level component. The only fix is structural: define components at module top level (or hoist G out and pass data via props), making the function object — and thus the type — stable across F's renders. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: the input that forgets every keystroke",
              "body": "A form author writes:\n\n`function Signup() {`\n`  const [email, setEmail] = useState('');`\n`  function EmailField() { return <input value={email} onChange={e => setEmail(e.target.value)} />; }`\n`  return <form><EmailField/></form>;`\n`}`\n\nSymptom: the field accepts exactly one character, then loses focus; autofill breaks; on some browsers the IME composition cancels. Mechanism, via the proposition: typing 'a' fires onChange → setEmail → Signup re-renders → a *new* EmailField function object is created → the element's type fails === against last render's → the input's DOM node is unmounted and a fresh one mounted, value 'a' (from state — the data survived; it lives in Signup) but **focus and caret die with the old node**, because they were browser-held state on the destroyed instance's DOM (Unit 1's survival rule requires the node to be *untouched*; here it was replaced). The user must click back into the field per keystroke. The fix is purely structural — hoist EmailField to module scope (passing email/setEmail as props), or inline the input directly. Nothing about the *data flow* was wrong; the bug is entirely a type-identity artifact. This failure mode is worth recognizing on sight: 'input loses focus on every keystroke' ⇒ some ancestor is re-creating a component type per render."
            },
            {
              "type": "text",
              "heading": "Reading the rule as a design tool",
              "body": "Once state's address-based identity is explicit, several daily decisions become derivations. **Two siblings of the same type have independent state** — `<Counter/><Counter/>` is two addresses — which is why you can stamp out lists of stateful rows at all (each key is its own address). **Lifting state up** (Unit 4) is, in address terms, moving a fact to an address that *outlives* the positions that display it: the child's address may be destroyed by a conditional, but the parent's survives, so the fact does. **Deliberate resets** are address edits: change the key. **Accidental resets** are almost always accidental address edits: a wrapper added in one branch of a conditional, a component definition nested so its type churns, a list without keys re-addressing every row on insert. And a subtle production rule follows for **conditional structure**: prefer conditionals that hold the surrounding addresses fixed — `{cond && <X/>}` keeps siblings' indices stable because the false occupies the slot; `style={{display: cond ? 'block' : 'none'}}` preserves even X's own instance (it never leaves the tree, at CSS cost); a ternary that restructures wrappers silently re-addresses everything beneath. The render tree, not the source tree, is the coordinate system — write conditionals with one eye on the coordinates they move."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why doesn't React key off source location instead?** It might seem friendlier to preserve state whenever 'the same JSX tag' renders — and React actually has the information (JSX transforms could emit source ids). The counterexample is the list: `items.map(p => <Row/>)` is ONE source location producing n instances — source identity cannot distinguish them, only position/key can. Position-based identity is the unique rule that handles single children, conditionals, and dynamic lists with the same mechanism, at zero bookkeeping cost, while leaving identity programmable exactly where programmability is needed (key). The cost is the counterintuitive cases this lesson taught you to predict; the React team judged — probably correctly — that a learnable rule beats an unimplementable intuition."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Predict state behavior (preserved or reset, for each stateful node) in each refactor, using the addressing rule: (a) {err ? <Field error/> : <Field/>} → toggling err; (b) {compact ? <aside><Nav/></aside> : <section><Nav/></section>} → toggling compact; (c) <ul>{show && <li>Pinned</li>}{items.map(i => <Item key={i.id}/>)}</ul> → toggling show; (d) swapping two keyed siblings' order in the returned array.",
                  "solution": "(a) Preserved: Field → Field at the same address; only props change. (b) Reset: Nav's parent type changes (aside vs section) at the wrapper's address — the type mismatch destroys the wrapper's subtree including Nav, even though Nav → Nav 'matches' in your head; reconciliation never gets there. (c) Preserved for the Items: the && leaves `false` in the child stream when show is off, so the mapped children keep their positions… but note the map produces a nested array occupying ONE slot with its own keyed sub-list — either way, Item addresses are (list-slot, key) and don't shift. The li itself mounts/unmounts with show (its own 'state' — none — is trivially fine). (d) Preserved and MOVED: keys re-address the match, so instances travel with their keys — state follows; the DOM nodes are reordered, not rebuilt.",
                  "hint": "For each, write the path (parent types + index-or-key) before and after; compare paths, not source code."
                },
                {
                  "prompt": "A tabbed settings page renders {tab === 'a' ? <PanelA/> : tab === 'b' ? <PanelB/> : <PanelC/>}, each panel full of form inputs. Product asks: 'drafts must survive tab switches'. A teammate proposes lifting every field into the parent. Give the alternative that uses the addressing rule with CSS, compare the two honestly (state correctness, mount cost, memory, accessibility), and say when lifting is still right.",
                  "solution": "Address-preserving alternative: render ALL panels always, hiding inactive ones — <div style={{display: tab==='a' ? '' : 'none'}}><PanelA/></div> etc. (or hidden attribute). No instance ever leaves the tree, so every draft survives at its own address with zero lifting. Trade-offs: mount cost — all three panels mount up front (slower first paint, all effects run) vs lazy per-tab mounting; memory — all instances resident; accessibility — display:none removes hidden panels from the a11y tree correctly (aria-hidden not needed), but any autofocus/measurement effects in hidden panels misfire (offsetWidth = 0). Lifting is still right when drafts must survive UNMOUNT-class events the address trick can't cover: full navigation away, panel lists too large to keep resident, or drafts that must persist (localStorage/server) — then state's owner should outlive the whole tab UI (Unit 4's lifting criteria). The addressing trick buys survival across HIDING; lifting buys survival across DESTRUCTION — pick by which event you must survive.",
                  "hint": "display:none keeps the address alive; conditionals destroy it. What events must the drafts outlive?"
                },
                {
                  "prompt": "Prove or refute with the nested-definition proposition: 'wrapping the nested component in useCallback — const EmailField = useCallback(() => <input …/>, []) — fixes the focus-loss bug legitimately.'",
                  "solution": "Refute as a fix, even though it can mask the symptom. With deps [], useCallback returns the same function object across Signup's re-renders, so the type test passes and the instance survives — focus stops dying. But: (1) the empty deps make the closure stale — it captures the first render's email/setEmail; setEmail happens to be stable, but email is frozen at '' inside the closure (the input 'works' only because value flows from the CURRENT render's JSX… except it doesn't — the JSX is produced by the stale closure too, so value is pinned to '' and the input goes uncontrolled-ish/buggy). (2) Add honest deps [email] and the function object changes per keystroke — the remount returns. The proposition's conclusion stands: identity-stable AND correctly-closing nested components are impossible when the closure must see changing state; the only correct fix is structural hoisting with props. useCallback here is a purity-adjacent trap: it trades an obvious bug for a stale-closure bug (Unit 6 formalizes why).",
                  "hint": "What does the [] closure capture? What happens with honest dependencies?"
                },
                {
                  "prompt": "Chat app: <MessageInput/> holds the draft; the recipient is chosen in a sidebar. Users report drafts 'leaking' to the wrong recipient when switching. As the reviewer: specify the correct identity semantics, the one-attribute implementation, and what additional change is needed if product ALSO wants drafts restored when switching back.",
                  "solution": "Semantics: the draft's entity is (conversation), not (the input widget) — switching recipients must not carry text across. Implementation: <MessageInput key={recipientId}/> — new recipient ⇒ new address ⇒ old draft state destroyed, fresh input mounted; the leak is structurally impossible. Restore-on-return requires persistence BEYOND the instance (the keyed unmount deliberately destroys it): lift drafts to an owner that survives switches — e.g. parent state/store drafts[recipientId], with MessageInput initialized from drafts[recipientId] (still keyed, so the initializer re-runs per recipient) and writing back on change/unmount. Key gives per-entity ISOLATION; lifting gives per-entity PERSISTENCE — the full feature needs both, and conflating them (trying to make one mechanism do both jobs) is the usual source of leaky-draft implementations.",
                  "hint": "Isolation and persistence are different requirements. Which does key give? Which needs an owner that outlives the instance?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u2l3-i1",
              "front": "Where does component state actually live, and what is its identity?",
              "back": "In React's per-instance bookkeeping (the fiber), addressed by position in the render tree — path of (parent, index-or-key) — plus component type. Same type at same address ⇒ same state."
            },
            {
              "id": "u2l3-i2",
              "front": "{isA ? <Counter person=\"A\"/> : <Counter person=\"B\"/>} — does toggling reset the counter?",
              "back": "No: same type at the same position matches, so the instance and state survive; only props change. Add key={person} if per-person state is wanted."
            },
            {
              "id": "u2l3-i3",
              "front": "Why does adding a wrapper div in one branch of a conditional reset state below it?",
              "back": "The wrapper changes every descendant's address (different path), and the type at the old position mismatches — the subtree unmounts even though the inner JSX looks identical."
            },
            {
              "id": "u2l3-i4",
              "front": "Why must components never be defined inside other components?",
              "back": "Each render creates a new function object; type comparison is ===, so the child's type 'changes' every render ⇒ full remount each time — inputs lose focus/state per keystroke."
            },
            {
              "id": "u2l3-i5",
              "front": "The sanctioned way to reset a subtree's state on demand?",
              "back": "Change its key (e.g. key={userId}): a new key is a new address, so React unmounts the old instance — state, effects and all — and mounts fresh, atomically."
            },
            {
              "id": "u2l3-i6",
              "front": "{cond && <X/>} before a sibling vs a ternary that restructures — why does it matter for the sibling's state?",
              "back": "false occupies the child slot, keeping later siblings' indices (addresses) stable; restructuring conditionals shift indices and silently re-address (reset) siblings."
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
            "prompt": "An unkeyed list of 50 rows re-renders after 1 row is inserted at the head. How many retained rows receive in-place prop updates under positional matching? (Number only.)",
            "answer": 50,
            "explanation": "Positional matching pairs new index i with old index i: after a head insert, all 50 old rows are compared against shifted data and every one gets a prop rewrite (plus one mount at the tail). With keys, the same update is one mount and 50 no-op key hits — the Θ(n) vs O(1) gap proved in the unit.",
            "points": 1
          },
          {
            "id": "u2q2",
            "type": "short",
            "prompt": "Complete the state-identity rule: state is preserved across renders iff the element at the same position has the same ______. (One word.)",
            "accept": [
              "type",
              "component type",
              "element type",
              "same type"
            ],
            "explanation": "Same type at the same tree address (with key refining the address among siblings) ⇒ same instance ⇒ preserved state. Either a type change or an address change (moved position, changed key, added wrapper) destroys the instance and its subtree's state.",
            "points": 1
          },
          {
            "id": "u2q3",
            "type": "multi",
            "prompt": "Which of these changes RESET the state of the affected component? (Select all that apply.)",
            "options": [
              "Toggling {cond ? <Panel mode=\"a\"/> : <Panel mode=\"b\"/>}",
              "Toggling {cond ? <div><Panel/></div> : <Panel/>}",
              "Changing <Panel key={userId}/> when userId changes",
              "A parent re-render that passes the same props to <Panel/>",
              "Moving <Panel/> from one parent <section> to a different <aside> in the same render"
            ],
            "answer": [
              1,
              2,
              4
            ],
            "explanation": "(b) resets: the wrapper changes Panel's address and the type at the old position mismatches. (c) resets by design: a new key is a new address — the sanctioned reset lever. (e) resets: matching is per-parent; a subtree 'moved' across parents is deleted and recreated. (a) preserves — same type, same position, props patched. (d) preserves — re-rendering alone never destroys the instance; commit sees equal descriptions.",
            "points": 2
          },
          {
            "id": "u2q4",
            "type": "proof",
            "prompt": "Prove both directions of the list-insertion cost claim: under a head-insertion into an n-row sibling list, positional matching performs Θ(n) in-place row updates and misaligns all row state by one, while keyed matching (stable unique keys) performs O(1) mutations beyond the single mount and preserves every row's state association.",
            "rubric": [
              "Positional direction: shows index-i-to-index-i pairing forces each retained row to be updated with the previous row's data (type match ⇒ in-place update), counting Θ(n) prop rewrites and locating the mount at the tail",
              "State misalignment: distinguishes instance-held state (stays at the position) from props (realigned by the parent), concluding every stateful row is associated with the wrong entity",
              "Keyed direction: describes the old-key map, one miss (head row ⇒ mount), n hits with identical props ⇒ no-op updates/bailouts, O(1) beyond insert + reposition bookkeeping",
              "State preservation: argues instances follow keys, so state stays with its entity; concludes the asymptotic gap and its user-visible meaning"
            ],
            "solution": "Positional: matching pairs old child i with new child i. After inserting X at the head, new position 0 holds X and new position i (i≥1) holds old entity i−1's data. For i≥1, old instance i is compared against entity i−1's element: types match (same row component), so reconciliation updates in place — the instance receives different props. That is n real prop-updates (Θ(n)), each triggering a row re-render. The length mismatch appears at the tail, so the single mount happens at position n — React believes a row was APPENDED. Instance-held state (input drafts, toggles) remains at its position while props shift by one: every stateful row now renders entity i−1's data against entity i's state — total misalignment. Keyed: build map {key→instance} of old rows (O(n) but no mutations); probe each new child: X's key misses ⇒ one mount; every retained key hits with props identical to last render (same entity, same data) ⇒ no-op update, and reference-equal elements bail out entirely. Instances follow keys, so each row's state stays bound to its entity; DOM work is one insertion plus move bookkeeping. Hence Θ(n) misaligned updates vs O(1) correct mutations. ∎",
            "explanation": "This is the load-bearing computation behind every 'checkbox jumped to the wrong row' bug and behind the key rules themselves — proving it once makes the rules derivable instead of memorized.",
            "points": 3
          },
          {
            "id": "u2q5",
            "type": "open",
            "prompt": "Production bug report: 'In our task list, I check a task's checkbox (row-local state), then delete a DIFFERENT task above it, and the check jumps to the wrong task. Also, our search-as-you-type field above the list loses focus on every keystroke since last week's refactor.' The list renders rows with key={index}; last week someone extracted the search field into a component defined inside the list component's body. Write the full diagnosis and fix for BOTH symptoms, deriving each from reconciliation rules.",
            "rubric": [
              "Diagnoses symptom 1 via index keys: deletion shifts indices, keyed matching by index re-associates instances (and their checkbox state) with the wrong entities — equivalent to positional matching; fix: key from stable data id, with a note on where identity is minted if ids are absent",
              "Diagnoses symptom 2 via type identity: a component defined in the parent's body is a fresh function object per render; === type comparison fails ⇒ the search field remounts per keystroke, destroying focus/caret — keys/memoization cannot fix it",
              "Gives both fixes structurally: stable data-derived keys; hoist the nested component to module scope (or inline it), passing state via props",
              "Demonstrates rule-level understanding: connects both bugs to the same underlying principle (state identity = type + tree address, with key refining address), not just two isolated patches"
            ],
            "solution": "Symptom 1: key={index} declares position as identity. Deleting a row above shifts every subsequent index down by one; the keyed matcher then matches old instance k to NEW entity at index k — instances (holding the checked state) stay put while entities slide underneath. The checkbox didn't move; the data did. Fix: key={task.id} — instances then follow entities; deleting a row orphans exactly its key (that instance unmounts, taking its state), and other rows are untouched. If the backend provides no id, mint one at data creation (not render). Symptom 2: the extracted SearchField is defined inside the list component's body, so each parent render evaluates a new function object; reconciliation compares types by reference, sees a 'different type' at the same address every render, and remounts the field — the DOM input is destroyed and recreated per keystroke, so browser-held focus/caret die (the data may survive if lifted, which is why 'only focus' breaks). useCallback/memo cannot make a per-render function a stable type without freezing its closure (stale state). Fix: hoist SearchField to module top level and pass value/onChange as props. Both bugs are the same theorem applied twice: state and DOM continuity attach to (type, address) identity — index keys corrupt the address half under structural change; nested definitions corrupt the type half under any re-render.",
            "explanation": "The two most common reconciliation bugs in production, presented as one incident. The grader looks for derivation from the identity rule — position/key addressing and === type comparison — rather than 'use ids and don't nest components' as received wisdom.",
            "points": 3
          },
          {
            "id": "u2q6",
            "type": "mcq",
            "prompt": "Why does React's reconciler run in O(n) instead of computing an optimal edit script?",
            "options": [
              "Optimal tree diffing is impossible to implement correctly in JavaScript",
              "Exact tree edit distance is essentially cubic (no strongly subcubic algorithm unless APSP falls), which is unaffordable per frame — so React trades script minimality for linear time under two domain assumptions",
              "The DOM API only supports append and remove operations, so minimal scripts wouldn't help",
              "React's diff is O(log n) due to Fiber's binary work-splitting"
            ],
            "answer": 1,
            "explanation": "The exact problem carries a conditional cubic lower bound (Bringmann et al. 2018) and O(n³) best-known algorithms — minutes of CPU per update at realistic tree sizes. React changes the problem: correctness without minimality, gated by type equality and author-declared keys, achieving O(n), which matches the Ω(n) bound any correct differ must pay. The distractors are category errors: implementability isn't the issue, the DOM supports moves and in-place updates, and no diff is sublinear — a correct differ must look at the input.",
            "points": 1
          }
        ]
      }
    },
    {
      "id": "u3",
      "title": "State as a Snapshot",
      "summary": "Why a render's state is a constant, how the update queue folds batched updates into the next snapshot, and why immutability is what makes change detectable at all.",
      "references": [
        "react.dev — State as a Snapshot; Queueing a Series of State Updates; Updating Objects/Arrays in State",
        "react.dev — Automatic batching in React 18 (Working Group discussion #21)",
        "Dan Abramov — 'A Complete Guide to useEffect' (overreacted.io) — 'each render has its own props and state'",
        "ECMA-262 — closures and lexical environments (the language semantics the snapshot model rests on)"
      ],
      "prerequisites": [
        "u2"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u3l1",
          "title": "Each Render Sees a Snapshot",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The mental model most bugs come from missing",
              "body": "Ask a working developer what `setCount(count + 1)` does and many will say 'it increments count'. It does no such thing, and the difference is the source of a whole genus of bugs — handlers that read stale values, intervals that never advance, async code that acts on a world that has moved on. What `setCount` actually does is *request a new render whose snapshot will differ*; it changes nothing at all in the render that called it. The precise model: every render of a component is a **snapshot** — React calls your function with the state values *as of that render*, your JSX closes over those values, and so do your event handlers and effects created during it. The variables `count`, `items`, `user` in a component body are not live views onto some mutable store; they are **per-render constants**, frozen at the moment React called your function. When the requested render happens, React calls your function *again*, producing a new snapshot with new constants — and, crucially, new closures. The old render's handlers still exist (the DOM may still fire them, timeouts may still call them) and they still see the old constants, forever. Once this model is explicit, the classic surprises stop being surprises and become one-line derivations, which is exactly what this lesson practices."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "State variables are per-render constants",
              "statement": "Let a component render at times t₁ < t₂ < …, with state value sₜ at render t. (1) Within render t, the state variable is a constant binding whose value is sₜ: no code running in render t — the body, JSX expressions, or any closure created during render t (event handlers, effect functions, timeout callbacks) — can ever observe a value other than sₜ through that variable. (2) Calling the setter during render t does not change the binding; it enqueues an update and (if the resulting state differs) schedules render t+1, which creates a *fresh* binding holding sₜ₊₁. Consequently, code from render t that runs *after* render t+1 committed still reads sₜ — by design, not by staleness accident.",
              "proof": "This is JavaScript closure semantics applied to React's calling convention, not a special React mechanism. Each render is one invocation of the component function; `const [count, setCount] = useState(…)` declares a local `const` initialized from React's stored state for this instance (Unit 5 shows the storage). A `const` local cannot be reassigned, and `setCount` does not attempt to — it writes to React's store and schedules work. Any function created during this invocation closes over this invocation's lexical environment (ECMA-262 lexical scoping): its references to `count` resolve to *this* binding, permanently — closures capture bindings, and this binding is never mutated. A later render is a new invocation with a new environment and a new `count` binding reading the updated store; nothing connects the two bindings. Hence (1) and (2), and the corollary: a callback from render t executing after later renders still resolves `count` to render t's binding, value sₜ. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: +3 that increments by 1",
              "body": "The canonical demonstration, worth executing by hand once in your life:\n\n`const [count, setCount] = useState(0);`\n`function handleClick() { setCount(count + 1); setCount(count + 1); setCount(count + 1); }`\n\nClick once (count is 0). Apply the proposition: within this render, `count` is the constant 0. The handler therefore executes `setCount(0 + 1)` three times — three requests to *replace* state with 1. The queue processes them (next lesson formalizes how): replace-with-1, replace-with-1, replace-with-1 → next snapshot is 1, not 3. There is no moment at which the first setCount 'takes effect' and makes the second one see 1 — that sentence is meaningless in the snapshot model, because `count` is not a variable that setCount writes to; it is a constant of the current invocation. The three calls were three identical instructions computed from the same frozen value. (If you *want* increment-by-three, you say 'increment' rather than 'replace with the value I computed from my snapshot': `setCount(c => c + 1)` three times — the updater form receives the in-progress value; Lesson 2 proves exactly why.)"
            },
            {
              "type": "code",
              "heading": "The snapshot outlives the render that made it",
              "lang": "jsx",
              "code": "function Messenger() {\n  const [to, setTo] = useState(\"Alice\");\n  const [text, setText] = useState(\"\");\n\n  function handleSend() {\n    setTimeout(() => {\n      // This closure was created in THIS render. Five seconds from\n      // now — after any number of re-renders — it still reads THIS\n      // render's constants:\n      alert(`Sent \"${text}\" to ${to}`);\n    }, 5000);\n  }\n\n  return (\n    <>\n      <select value={to} onChange={e => setTo(e.target.value)}>\n        <option>Alice</option><option>Bob</option>\n      </select>\n      <input value={text} onChange={e => setText(e.target.value)} />\n      <button onClick={handleSend}>Send</button>\n    </>\n  );\n}\n\n// User: types 'hi', presses Send, then IMMEDIATELY switches to Bob.\n// Five seconds later: alert says  Sent \"hi\" to Alice.\n//\n// Is that a bug? For a SEND it is exactly right — the user sent\n// while Alice was selected; the action should bind to the state at\n// the moment of the action. The snapshot model gives 'the world as\n// of the event' for free. (When you instead WANT 'latest value' in\n// a late-running closure — e.g. a live status readout — that is a\n// different requirement with different tools: refs, Unit 6.)"
            },
            {
              "type": "text",
              "heading": "Handlers belong to their render",
              "body": "A subtle point the code above smuggled in: it is not just *values* that are per-render — the **handlers themselves are re-created each render**, each closing over its own snapshot. When render t commits, React attaches render t's handler objects to the DOM (or rather, updates its internal mapping so events dispatch to the latest committed handlers). So by the time a user *can* click, the handler that will run is the newest committed one, reading the newest committed snapshot — which is why UIs feel 'live' despite all this freezing. The frozen-snapshot behavior surfaces only when a closure from render t *escapes* the render→commit cycle and runs later on its own schedule: timeouts, intervals, promise continuations, subscription callbacks, and — critically — effect functions (Unit 6). Those escaped closures are time capsules. The discipline that follows: when writing any callback that will run 'later', consciously decide which semantics the feature needs — *the world as of the triggering event* (snapshot: use the captured values, you have them already) or *the world as of execution time* (latest: you must arrange access explicitly — updater functions for state, refs for reads, Unit 6). Most async bugs in React are code that needed one and silently got the other."
            },
            {
              "type": "example",
              "heading": "Worked example: the interval that counts 0, 1, 1, 1…",
              "body": "`const [n, setN] = useState(0);`\n`useEffect(() => { const id = setInterval(() => setN(n + 1), 1000); return () => clearInterval(id); }, []);`\n\nPrediction from the model, before running it: the effect ran once (empty deps), so the interval callback is a closure from render 0, where `n` is the constant 0. Every tick executes `setN(0 + 1)`. Tick 1: state 0 → 1, re-render — but the *new* render's snapshot is irrelevant to the old closure, which keeps firing `setN(1)`. Ticks 2, 3, 4…: replace-1, replace-1 — and since the update leaves state unchanged (Object.is(1, 1)), React bails out and doesn't even re-render (Lesson 3 pins this down). Display: 0, then 1, forever. Two honest fixes, matching the two semantics: **updater form** — `setN(c => c + 1)` asks React for 'current + 1' at processing time, no snapshot involved; or **re-synchronize** — put `n` in the deps so each render tears down the old interval and starts one closing over the fresh snapshot (correct but churns the timer; Unit 6 weighs these). What is *not* a fix: 'use a ref to make n live' without understanding — that changes the semantics for every reader of the code. Derive first, then choose."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why freeze at all?** The snapshot model can feel like an obstacle until you see what it buys. (1) **Consistency within a render**: your JSX top and bottom read the same values — no torn frames where the header shows 5 items and the list shows 6 because state moved mid-render. (2) **Race-free event semantics**: an action binds to the state the user actually saw and acted on, not whatever the world mutated to milliseconds later. (3) **It is the purity contract, restated**: input-determinism (Unit 1) *requires* inputs frozen per call — a 'live' state variable would make f's output depend on when lines of f executed. Concurrent rendering (Unit 8) leans on this totally: React can pause mid-render precisely because nothing the render reads can change underneath it."
            },
            {
              "type": "text",
              "heading": "Reading code with snapshot glasses on",
              "body": "Practice the translation until it is reflex. Every `const [x, setX] = useState()` line: read x as 'the value of x *when this render started*'. Every `setX(expr)`: read as 'request a future render where x is expr' — and if expr mentions x, expand it mentally to the frozen value: `setX(x + 1)` is `setX(<frozen> + 1)`. Every callback: annotate it with its birth render — 'this closure sees render t's world'. Then bugs read themselves aloud: 'this retry closure was born before the token refreshed — it retries with the dead token'; 'this validation reads the items list from before the delete'. And a vocabulary note to prevent a common confusion downstream: people call escaped-closure reads 'stale closures' as if staleness were a defect of closures. The closure is doing exactly what the language and the proposition promise. *Staleness is a requirements mismatch* — code that needed execution-time values built from event-time values. Keep the phenomenon and the judgment separate: Unit 6 needs that precision when dependency arrays make the same physics load-bearing for effects."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Predict the alert and final rendered value, then justify each from the proposition: count starts at 0; handler runs setCount(count + 5); setTimeout(() => alert(count), 3000); setCount(count + 10). The user clicks once and waits.",
                  "solution": "Alert shows 0; final render shows 10. Within the click's render, count is the constant 0. setCount(0+5) enqueues replace-5; the timeout closure captures THIS render's binding (0); setCount(0+10) enqueues replace-10. The queue processes replace-5 then replace-10 → next snapshot 10 (last replace wins; formalized next lesson). Three seconds later the escaped closure resolves count to its birth render's constant: alert(0). Neither the intervening re-render nor the queue affects it — closures capture bindings, and that binding holds 0 forever.",
                  "hint": "Freeze count at its render-start value, then trace each line against the frozen value."
                },
                {
                  "prompt": "A checkout button's handler does: if (!submitting) { setSubmitting(true); await api.pay(); setSubmitting(false); } Users double-clicking within ~50ms still trigger two payments. Explain precisely why the guard fails, using the snapshot model — and give the correct guard (there are two honest designs).",
                  "solution": "Both clicks' handlers were created in (or dispatch against) the same committed render, where submitting is the constant false — setSubmitting(true) from click 1 changes no binding click 2 can see; the re-render carrying submitting=true hasn't committed (and even if it had, click 2's handler may already be queued from the old snapshot). So both pass the if. Fixes: (1) synchronous, render-independent guard — a ref: if (inFlightRef.current) return; inFlightRef.current = true; refs are mutable shared cells, not snapshots (Unit 6), so click 2 reads click 1's write immediately; also disable the button as defense-in-depth. (2) Make the transition atomic where atomicity exists — the server: idempotency key minted per checkout intent, so duplicate submits collapse server-side. State-as-snapshot is the wrong tool for mutual exclusion; it is by construction a delayed, batched view.",
                  "hint": "When does the second click's snapshot get created relative to the first click's setState?"
                },
                {
                  "prompt": "Refactor review: a teammate 'simplifies' let [query, setQuery] = useState(''); to use let and writes query = e.target.value; setQuery(query); in the change handler, arguing 'same thing, one less temp variable'. It renders correctly. List everything actually wrong, in order of severity.",
                  "solution": "(1) Contract violation: reassigning the destructured variable mutates a render-local binding — it does nothing to React's store, but it makes THIS render's subsequent reads inconsistent with the snapshot (any code after the handler's assignment — or in the same tick — sees a value React never rendered), reintroducing exactly the torn-frame inconsistency snapshots exist to prevent. (2) It only 'works' because setQuery(query) passes the same value the assignment held — the render is driven entirely by setQuery; the assignment is dead weight that will diverge the moment someone reads query between assignment and re-render (e.g. a second setState computing from it — it would silently compute from the mutated value, unbatchable and unreplayable). (3) let on a state variable defeats the reader's contract: every reviewer must now verify no reassignment exists anywhere. Correct form: const [query, setQuery], and pass e.target.value directly. Severity order: semantic inconsistency > fragile coupling > readability. The snapshot model isn't style — const is the enforcement of 'per-render constant'.",
                  "hint": "What does the reassignment change, and what does it NOT change? Who might read the binding in between?"
                },
                {
                  "prompt": "Decide for each 'later-running' closure which semantics the FEATURE needs — event-time snapshot or execution-time latest — and name the mechanism: (a) undo toast: 'Deleted 3 items — Undo' restoring exactly those items; (b) autosave every 30s saving the current draft; (c) analytics ping on click reporting which tab was active when clicked; (d) a warning shown if the form is still invalid 5s after the user stops typing.",
                  "solution": "(a) Snapshot — the undo must restore the items as-of the delete; capture the deleted array in the closure (the model gives this for free). (b) Latest — saving a 30s-old draft loses work; the interval callback must read current state: updater-style access, a ref holding the latest draft, or an effect re-synced on draft changes (Unit 6 trade-offs). (c) Snapshot — 'active when clicked' is event-time by definition; captured value is correct even if the user switches tabs before the ping sends. (d) Latest — validity must be judged against the CURRENT form, not the one from when the timer started; a stale-snapshot check would warn about text the user already fixed. The exercise's real content: the requirement decides, then the mechanism follows — never the reverse.",
                  "hint": "Ask of each: if the world changes between scheduling and firing, should the code see the old world or the new one?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u3l1-i1",
              "front": "What does setCount(count + 1) actually do — and not do?",
              "back": "Enqueues a replace-with-(snapshot+1) and schedules a render; it does NOT change count in the current render — state variables are per-render constants."
            },
            {
              "id": "u3l1-i2",
              "front": "Why do closures created during a render see old state when they run later?",
              "back": "JS closures capture bindings; each render is a fresh invocation with fresh constant bindings. A closure resolves state to its birth render's binding — forever."
            },
            {
              "id": "u3l1-i3",
              "front": "Three setCount(count+1) in one handler — result and reason?",
              "back": "+1 total: count is frozen for the render, so all three enqueue 'replace with same value'. Use setCount(c => c+1) to express increment."
            },
            {
              "id": "u3l1-i4",
              "front": "Event-time vs execution-time semantics — how do you choose?",
              "back": "From the requirement: actions binding to what the user saw ⇒ snapshot (free); code needing the current world at fire time ⇒ latest (updater fns, refs, or re-synced effects)."
            },
            {
              "id": "u3l1-i5",
              "front": "What does the snapshot model buy React?",
              "back": "In-render consistency (no torn frames), event semantics bound to the seen state, and the frozen inputs that purity and interruptible rendering require."
            }
          ]
        },
        {
          "id": "u3l2",
          "title": "The Update Queue",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Between the setter and the snapshot",
              "body": "Lesson 1 established that a setter call is a *request*. This lesson specifies the machinery that services requests, because its exact semantics are observable and exam-grade predictable. When you call a setter, React does not render immediately. It appends an **update** to a per-state-cell queue and schedules processing. All setter calls made synchronously within one event handler (and, since React 18, within timeouts, promises, and native handlers too) are **batched**: they accumulate in queues, and React processes everything in a single render pass when the handler completes. Two consequences before any formalism. First, calling a setter n times costs one re-render, not n — you may write natural code (set three pieces of state in a row) without performance guilt. Second, and less obviously: because processing is deferred, *what you enqueue matters*. React distinguishes two kinds of update — 'replace the value with v' (you passed a value) and 'transform the value by f' (you passed a function) — and they compose entirely differently once queued. The rest of the lesson is the algebra of that queue, which is small enough to state exactly and rich enough to explain every batching puzzle you will meet."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Update queue semantics",
              "statement": "For one state cell with committed value s (the base), a render pass processes its pending queue [u₁, u₂, …, uₖ] in order, producing the next snapshot value:\n\n  next = step(step(…step(s, u₁)…, uₖ₋₁), uₖ)  — a left fold,\n\nwhere step(acc, u) = v if u is a **replace** update carrying value v (the setter was passed a value), and step(acc, u) = f(acc) if u is an **updater** carrying function f (the setter was passed a function). Updater functions are applied to the *accumulated* value, not the render's snapshot; they must be pure (React may process queues more than once under StrictMode or interruption). After the fold, if Object.is(next, s) the update is a no-op and React may skip re-rendering; otherwise next becomes the new committed value and the new snapshot for the next render."
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "Replace absorbs history; updaters compose",
              "statement": "(1) A replace update erases the effect of every update before it in the queue: the fold's accumulator is overwritten with v regardless of prior steps. (2) k updater calls enqueued from one snapshot compose: for increments, k × setN(c => c+1) yields s + k, while k × setN(n + 1) (replaces computed from the frozen snapshot n = s) yields s + 1. (3) Mixed queues evaluate by the fold, e.g. from s = 0: [replace 6, f: c→c+1, replace 42] → 42; [f: c→c+1, replace 6, f: c→c+1] → 7.",
              "proof": "(1) step(acc, replace v) = v, independent of acc — the accumulator's history is discarded by definition of step. (2) With updaters: fold(s, [f,…,f]) = fᵏ(s) = s + k for f = (+1), by induction on k: base k=0 gives s; step applies f to the accumulator fᵏ⁻¹(s) giving fᵏ(s). With value calls: each setter call evaluated n + 1 in the handler's scope, where n is the frozen snapshot s (Lesson 1's proposition), so every enqueued update is replace(s+1); the fold ends at s + 1 whatever k ≥ 1 is. (3) Direct evaluation: fold(0, [replace 6, +1, replace 42]): 0→6→7→42. fold(0, [+1, replace 6, +1]): 0→1→6→7. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: three puzzles, one fold",
              "body": "Take `const [n, setN] = useState(0)` and evaluate each handler's effect by writing out the queue. **Puzzle 1:** `setN(n + 5); setN(n + 1);` → queue [replace 5, replace 1] (both computed from frozen n = 0) → fold: 0→5→1 → next snapshot **1**. The 'later call wins' intuition is really 'replace absorbs history'. **Puzzle 2:** `setN(n + 5); setN(c => c + 1);` → [replace 5, +1] → 0→5→**6**. The updater sees the accumulated 5, not the snapshot 0 — this is the precise sense in which updater functions read 'in-progress' state that the render's constants cannot show you. **Puzzle 3:** `setN(c => c + 1); setN(n + 5); setN(c => c + 1);` → [+1, replace 5, +1] → 0→1→5→**6** — the first updater's work is absorbed by the replace; only the second survives. The reliable procedure, immune to intuition: (i) freeze the snapshot; (ii) rewrite each setter call as replace(value-computed-from-frozen-snapshot) or updater(f); (iii) left-fold. Three mechanical steps, and every interview-grade batching puzzle dissolves."
            },
            {
              "type": "code",
              "heading": "Batching boundaries — one render per event, since React 18 one render per tick",
              "lang": "jsx",
              "code": "function Form() {\n  const [count, setCount] = useState(0);\n  const [flag, setFlag] = useState(false);\n\n  function handleClick() {\n    setCount(c => c + 1);   // queued on count's cell\n    setFlag(f => !f);       // queued on flag's cell\n    setCount(c => c + 1);   // queued on count's cell\n    // Handler ends → React processes ALL queues → ONE render pass\n    // sees count+2 and !flag together. Never a frame with one\n    // applied and not the other: batching is also an atomicity\n    // guarantee across cells.\n  }\n\n  async function handleSave() {\n    setStatus('saving');          // React 17: rendered immediately (unbatched\n    const r = await api.save();   //   in the continuation below!)\n    setStatus('done');            // React 17: another immediate render each call\n    setCount(c => c + 1);         // React 18+: the continuation's calls are\n                                  //   batched too — one render for both.\n  }\n\n  // Escape hatch, rare by design: force a synchronous commit mid-\n  // handler when an external API must read the updated DOM NOW —\n  //   flushSync(() => setCount(c => c + 1));\n  //   printWidget(divRef.current);   // sees the committed update\n  // flushSync defeats batching for that block; it is for interop\n  // (printing, imperative focus/measure), not a state-flow tool.\n}"
            },
            {
              "type": "text",
              "heading": "Why batching is correct, not just fast",
              "body": "It is tempting to file batching under 'performance optimization', but the model says more: batching is what makes multi-cell updates **atomic**. In the click handler above, there is provably no committed frame in which `count` advanced but `flag` did not — the queues are folded and committed in one pass, so the UI moves between consistent states only. Contrast the pre-18 async gap: with each `setStatus` rendering immediately inside the continuation, intermediate frames could expose half-updated combinations ('done' status while the count hadn't advanced), and code observing the DOM between them saw torn state. React 18's automatic batching closed the gap by making the batch boundary *the microtask*, not *the synthetic event*: everything enqueued in one synchronous run of JavaScript folds into one commit, wherever that run started (event, timeout, promise chain, native listener). The purity contract underwrites all of it — deferring and coalescing setter processing is only legal because enqueueing has no observable effect until commit (Unit 1's idempotence again). And the same reasoning explains the one legitimate exception: `flushSync` exists precisely for the boundary where React meets *non-React* observers of the DOM (printing, imperative measurement, third-party widgets) that cannot wait for the batch — you pay a synchronous commit to give an external system a consistent read point."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Updater functions must be pure, and the fold explains why.** React reserves the right to process queues more than once: StrictMode double-invokes updaters in development, and an interrupted concurrent render (Unit 8) throws away a fold and redoes it against a newer base. An updater that mutates (`c => { c.push(x); return c; }`) or performs I/O corrupts state or double-fires on refold — bugs that appear only under interruption timing, i.e. in production under load. Pure updaters make refolding free: fold(s, queue) is deterministic, so any number of speculative evaluations agree. Same theorem, third appearance: every 'React may redo work' feature is purchased with a purity obligation."
            },
            {
              "type": "example",
              "heading": "Worked example: choosing replace vs updater by requirement",
              "body": "The forms are not interchangeable styles; they encode different *meanings*. **'Set the tab to what was clicked'** — `setTab('billing')` — replace is the requirement: the next state is a function of the event, not the previous state; an updater here (`setTab(t => 'billing')`) is noise. **'Increment the retry count'** — `setRetries(r => r + 1)` — updater is the requirement: the next state is a function of the previous; the replace form `setRetries(retries + 1)` is a latent bug that miscounts the moment two increments share a batch (or the handler runs from a stale closure, Lesson 1's interval). **'Toggle'** — `setOpen(o => !o)` for the same reason: `setOpen(!open)` double-toggles to a no-op when batched twice. **'Reset'** — `setForm(initialForm)` — replace, by meaning. The code-review heuristic that falls out: *if the right-hand side mentions the state variable, it should almost certainly be an updater* — mentioning the snapshot inside a replace is the tell that you're computing next-from-previous with a frozen 'previous'. Reviewers who apply that one line catch the entire class before it ships."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Evaluate the final state from base s = 10 for each queue, showing the fold: (a) setN(n+1); setN(n+1); setN(c=>c*2); (b) setN(c=>c+5); setN(0); setN(c=>c+5); (c) setN(c=>c+1) called from a closure whose frozen n is 3 (an old render), current base 10.",
                  "solution": "(a) Frozen n = 10, so queue = [replace 11, replace 11, ×2]; fold: 10→11→11→22. Final 22. (b) [+5, replace 0, +5]; fold: 10→15→0→5. Final 5 — the replace absorbed the first updater. (c) Updaters never read their closure's snapshot — the +1 applies to the fold's accumulator starting at the CURRENT base: 10→11. Final 11. This is exactly why the updater form fixed Lesson 1's interval: the stale closure's frozen n is irrelevant to c => c+1.",
                  "hint": "Rewrite each call as replace(frozen-computed value) or updater(f), then left-fold from the base."
                },
                {
                  "prompt": "A progress bar advances with setPct(pct + step) from a WebSocket message handler. Under load, 40 messages arrive within one tick; the bar advances by one step. Diagnose with the fold, then fix — and explain why the fix ALSO makes the code robust to React 18's batching semantics without any further change.",
                  "solution": "All 40 handler invocations run within one batch against the same committed snapshot pct = p, each enqueueing replace(p + step); fold ends at p + step — 39 messages erased. Fix: setPct(c => c + step) — the queue becomes 40 composable updaters, folding to p + 40·step. Robustness: updaters are evaluated against the accumulator at processing time, so the result is independent of WHERE the batch boundary falls (per-event in 17, per-tick in 18, wherever future schedulers put it) and independent of how many handler invocations share a snapshot. Replace-form correctness depends on 'one setter call per committed render' — an assumption schedulers are free to break; updater-form correctness depends only on the fold, which is guaranteed semantics.",
                  "hint": "How many of the 40 enqueued updates survive the fold in each form?"
                },
                {
                  "prompt": "Someone proposes: 'updaters are always safer — lint should force setX(prev => …) everywhere'. Construct the counterexample class where the updater form is WRONG (not just verbose), and state the decision rule.",
                  "solution": "Where next state is a function of the EVENT, not the previous state, the updater form invites bugs by suggesting a dependency that doesn't exist — and materially misleads under batching: setSelected(s => item.id) in a multi-select handler, or 'set search text to input value' as setText(t => e.target.value) — harmless-looking, but reviewers now assume order-sensitivity, and refactors that reorder enqueues 'to be safe' churn code for nothing. The genuinely wrong cases: (i) reset semantics — setForm(f => initialForm) implies the reset depends on the draft; a later well-meaning 'merge' refactor (f => ({...f, ...initialForm})) reintroduces the stale fields the reset existed to clear; (ii) event-value capture where the updater's laziness bites: updaters run at processing time, so reading e.target.value INSIDE the updater reads a possibly-recycled synthetic event or a changed DOM — capture at event time, pass the value. Rule: updater iff next = g(previous); replace iff next = g(event/world). Purity of intent, not blanket style.",
                  "hint": "What does prev => … CLAIM about the computation? When is that claim false — and when does lazy evaluation of the updater actively hurt?"
                },
                {
                  "prompt": "Two cells: const [a] with base 1, const [b] with base 10. Handler: setA(x=>x+1); setB(y=>y+a); setA(x=>x+b). Give the committed (a, b) and justify — the subtle part is which values the closures read.",
                  "solution": "The updaters' PARAMETERS (x, y) are fold accumulators per cell; but free variables inside them (a, b) are ordinary closure reads of the FROZEN snapshot: a = 1, b = 10. Queues: a-cell [x→x+1, x→x+10(frozen b)], b-cell [y→y+1(frozen a)]. Folds: a: 1→2→12; b: 10→11. Committed (12, 11). The cross-cell reads do NOT see in-progress values — there is no cross-cell accumulator; each cell folds independently, and inter-cell consistency comes from both folds committing atomically in one pass. If b's update genuinely needed a's NEW value, that's a sign the two belong in one cell/reducer (Unit 4) — the queue algebra is telling you the state shape is wrong.",
                  "hint": "Updater parameter = this cell's accumulator. Free variables = frozen snapshot. Fold each cell separately."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u3l2-i1",
              "front": "State the update-queue semantics in one line.",
              "back": "next = left-fold of the pending queue over the committed base; replace(v) sets the accumulator to v, updater f maps it — then Object.is(next, base) short-circuits no-ops."
            },
            {
              "id": "u3l2-i2",
              "front": "Why does setN(n+1) three times give +1 but setN(c=>c+1) three times give +3?",
              "back": "Value calls enqueue replace(frozen+1) — three identical replaces; updaters compose on the accumulator: fᵏ(s). Replace absorbs history, updaters transform it."
            },
            {
              "id": "u3l2-i3",
              "front": "What changed about batching in React 18?",
              "back": "The batch boundary became the synchronous tick, not the synthetic event: updates in timeouts, promises, and native handlers now fold into one render too."
            },
            {
              "id": "u3l2-i4",
              "front": "Why must updater functions be pure?",
              "back": "React may refold queues (StrictMode, interrupted renders); pure updaters make refolds deterministic and free — impure ones double-fire or corrupt state under retry."
            },
            {
              "id": "u3l2-i5",
              "front": "Replace vs updater — the decision rule?",
              "back": "next = g(previous) ⇒ updater; next = g(event) ⇒ replace. Tell: a replace whose expression mentions the state variable is almost always a bug."
            },
            {
              "id": "u3l2-i6",
              "front": "What is flushSync for?",
              "back": "Forcing a synchronous commit so a NON-React observer (print, measure, imperative widget) reads updated DOM mid-handler — interop escape hatch, not a state-flow tool."
            }
          ]
        },
        {
          "id": "u3l3",
          "title": "Immutability and Structural Sharing",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The question that decides everything: how does React know state changed?",
              "body": "Every piece of machinery so far — scheduling a render, folding a queue, bailing out on no-ops — hangs on one primitive judgment: *did the state change?* React's answer is deliberately, radically cheap: **`Object.is(next, previous)`** — reference identity for objects, value identity for primitives. Not a deep comparison (cost proportional to the object graph, unbounded), not a dirty flag (requires observable mutation, i.e. proxies/instrumentation), not your equals method (doesn't exist in JS). One pointer comparison. This choice is the whole reason immutability is a *requirement* in React rather than a preference: if you mutate the object held in state and hand back the same reference, `Object.is` answers 'unchanged', React bails out, and the screen keeps showing the old world even though the data underneath moved. The bug is silent and maddening — the devtools show the mutated values (you're inspecting the same object!) while the UI disagrees. Once you accept the one-pointer-comparison premise, everything in this lesson is forced: updates must *replace* objects rather than edit them; replacement must be cheap, which structural sharing makes true; and the discipline pays for itself again downstream, because the same cheap comparison powers memoization (Unit 7) and concurrent snapshots (Unit 8)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Change detection and the immutability contract",
              "statement": "React deems a state update a **no-op** iff Object.is(next, prev) — in which case it may skip re-rendering entirely (after possibly one reconciling pass) — and deems props/deps unchanged under memoization iff each pair compares equal by Object.is (Units 6–7). The **immutability contract** for state follows: a value placed in state (or passed as props) must never be mutated thereafter; any update constructs a *new* value that shares unchanged substructure with the old. Equivalent operational phrasing: treat every object in state as frozen the moment a setter accepts it; 'change a field' always means 'build a replacement whose changed path is new and whose unchanged branches are the old references'."
            },
            {
              "type": "example",
              "heading": "Worked example: the mutation that renders nothing",
              "body": "`const [user, setUser] = useState({ name: 'Ada', tags: ['admin'] });`\n\n**Attempt 1 — mutate and set:** `user.tags.push('beta'); setUser(user);` — the push happened (inspect the object: tags has two entries), but setUser receives the same reference; Object.is(user, user) is true; React bails out. No render. The screen shows one tag; the store holds two; the next unrelated re-render (a parent update) suddenly 'reveals' the second tag — a bug that time-travels. **Attempt 2 — mutate then copy:** `user.tags.push('beta'); setUser({ ...user });` — now a render happens (new outer reference), and the screen updates… and this is the *worse* trap, because it works just well enough to ship. The state that PREVIOUS renders captured in their closures, and the previous props that memoized children compare against, were mutated in place: a memoized `<TagList tags={user.tags}/>` sees old-tags === new-tags (same array!) and refuses to re-render — screen tears, part new, part old. Mutation's damage isn't confined to the current update; it retroactively corrupts every holder of the old reference — queue refolds, memo comparisons, devtools history, concurrent snapshots. **Correct:** `setUser({ ...user, tags: [...user.tags, 'beta'] })` — new array on the changed path, new object above it, everything else shared. Every holder of the old value still holds the old world, consistently."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Structural sharing makes immutable updates O(depth), not O(size)",
              "statement": "Let state be a tree-shaped value (nested objects/arrays) with N nodes, and let an update change one leaf at depth d, where each node on the path has at most b children. An immutable update that rebuilds only the path — copying each of the d nodes on it (at O(b) per shallow copy) and sharing every off-path subtree by reference — allocates O(d·b) new cells and leaves the remaining N − d nodes shared. Change detection at any node then costs O(1): a node's reference changed iff the update touched its subtree.",
              "proof": "Construct bottom-up: replace the leaf with the new value (1 allocation). Its parent must reference the new leaf, and references are immutable, so build a shallow copy of the parent: O(b) cell copies, all other children copied *by reference* — their subtrees are untouched and shared wholesale. Repeat for each ancestor up to the root: exactly d shallow copies, O(d·b) total allocation, independent of N. Sharing soundness: an off-path subtree contains no changed node by hypothesis, and since values are never mutated (the contract), sharing it cannot leak future changes into the old version — both versions are permanently correct. Detection: the d path nodes have fresh references (each was rebuilt); every shared node keeps its old reference; hence reference inequality at a node ⇔ the change lies in its subtree — Object.is at any level answers 'did anything under here change?' in O(1), which is precisely the query memoized components and bailouts ask. ∎"
            },
            {
              "type": "code",
              "heading": "The update vocabulary — arrays, objects, nesting",
              "lang": "jsx",
              "code": "// ARRAYS — produce, don't edit:            avoid (mutates):\nsetItems([...items, newItem]);            // push\nsetItems(items.filter(i => i.id !== id)); // splice (delete)\nsetItems(items.map(i =>                   // arr[k] = v (replace)\n  i.id === id ? { ...i, done: true } : i));\nsetItems([...items].sort(cmp));           // sort in place — COPY first;\n                                          // sort/reverse mutate the receiver\n\n// NESTED OBJECT — rebuild the path, share the rest:\nsetOrder({\n  ...order,                        // path node 1 (new)\n  customer: {\n    ...order.customer,             // path node 2 (new)\n    address: {\n      ...order.customer.address,   // path node 3 (new)\n      zip,                         // the changed leaf\n    },\n  },\n  // order.items, order.payment … untouched → shared by reference\n});\n\n// The spread-per-level syntax is the proposition made visible:\n// d = 3 levels ⇒ 3 shallow copies, everything else shared.\n// When paths get deep/dynamic, Immer trades syntax for the same\n// semantics — you 'mutate' a draft Proxy; it RECORDS the path and\n// emits exactly this structurally-shared copy:\n//   setOrder(produce(o => { o.customer.address.zip = zip; }));"
            },
            {
              "type": "text",
              "heading": "Where the discipline pays rent",
              "body": "List the dividends explicitly, because 'immutability' is often taught as ideology when it is actually infrastructure. **(1) Change detection at every level is O(1)** — the proposition's last clause. A memoized child receiving `order.items` answers 'anything changed under here?' with one comparison; deep-equality alternatives pay O(subtree) per check, per child, per render. **(2) Old snapshots stay valid** — closures from previous renders (Lesson 1), the previous committed tree that reconciliation diffs against (Unit 2), interrupted concurrent renders holding pre-update state (Unit 8): all of them hold references into old versions, and structural sharing guarantees those versions are permanently self-consistent without copying the world. **(3) History is free** — undo/redo and time-travel debugging are 'keep the old root reference'; with mutation they require deep snapshots. **(4) The transport layer stays honest** — comparing, serializing, and logging state can't be corrupted by later edits. The costs are real but bounded: allocation churn (short-lived objects the GC nursery is built for), the spread-syntax tax on deep paths (Immer, or flatter state — Unit 4 argues flat normalization is better anyway), and one genuine sharp edge — **shared references mean accidental cross-version mutation is catastrophic**, which is why the contract says frozen-on-entry, and why dev-mode Object.freeze on state is a legitimate belt-and-suspenders tactic."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**The half-copy bug is the one that ships.** `{ ...state, list: state.list }` after pushing into state.list, copies-then-sorts like `[...items].sort()` written as `items.sort()`, a 'deep clone' that misses one nested Map — all of these produce SOME new references, so *something* renders, and the demo works. What breaks is whoever compares the untouched layer: a memoized row, an effect dep on `state.list`, a context consumer. The failure is nonlocal (a different component misbehaves), intermittent (only when memoization is present), and invisible in devtools (the values look right — they were mutated!). Review heuristic: for every setter call with an object, trace each CHANGED leaf and verify every node on its path to the root is freshly constructed. Path new, rest shared — nothing else is correct."
            },
            {
              "type": "example",
              "heading": "Worked example: diagnosing a tear from the references alone",
              "body": "Symptom: a kanban board's column header shows '4 cards' after a drag, but the column body still renders 3 cards until something else re-renders. Component shape: `<Column>` renders `<Header count={col.cards.length}/>` and `<CardList cards={col.cards}/>`, with CardList memoized. The drag handler did: `col.cards.push(card); setBoard({ ...board });`\n\nRead it with reference-tracing. setBoard got a new board object ⇒ Board re-renders; Column re-renders; Header re-renders reading `col.cards.length` — the mutated array says 4. CardList is memoized: its props comparison asks Object.is(prevCards, nextCards) — same array reference (it was pushed into, not replaced) ⇒ 'unchanged' ⇒ skip. Header and body now disagree — a torn frame caused not by concurrency but by a comparison lied to. Note *which* component broke: not the one whose handler was wrong, but the memoized one two levels away — mutation bugs are nonlocal by nature. Fix at the source: `setBoard(b => ({ ...b, columns: b.columns.map(c => c.id === colId ? { ...c, cards: [...c.cards, card] } : c) }))` — path rebuilt (board → columns → column → cards), siblings shared. CardList's comparison now honestly reports change; both children re-render from one consistent version. The general diagnostic: **when parts of the screen disagree, hunt for a reference that should have changed and didn't.**"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For state = { a: { x: 1, y: { z: 2 } }, b: { w: 3 } } and an update changing z to 5, write the minimal correct update expression, list exactly which nodes are newly allocated and which are shared, and give the allocation count the proposition predicts (d and b).",
                  "solution": "setState({ ...state, a: { ...state.a, y: { ...state.a.y, z: 5 } } }). Newly allocated: the root, a, y — the d = 3 path nodes (each a shallow copy, b ≤ 2 fields each ⇒ O(d·b) = ~6 cell copies). Shared by reference: state.b (and its subtree) and state.a.x (a primitive carried by the copy). Detection consequences: Object.is fails at root, a, y (subtree changed — correct) and holds at b (unchanged — correct); a memoized consumer of b skips, a consumer of a.y re-renders.",
                  "hint": "Rebuild exactly the root-to-changed-leaf path; everything off-path is spread-by-reference."
                },
                {
                  "prompt": "A reviewer sees setUser(u => { u.prefs.theme = dark ? 'dark' : 'light'; return { ...u }; }) and approves it because 'it returns a new object'. Write the rejection: enumerate every party that can observe the corruption, with the mechanism for each.",
                  "solution": "The updater mutates u — the CURRENT committed value (and possibly a fold accumulator) — before shallow-copying the top level only. Observers of the corruption: (1) previous renders' closures holding user — their 'snapshot' of prefs now shows the new theme: event-time semantics silently broken; (2) memoized children keyed on user.prefs — same prefs reference across 'versions' ⇒ bailout on a real change ⇒ torn UI; (3) the update queue itself — updaters must be pure; under StrictMode/interruption the refold mutates prefs TWICE (idempotent here by luck — theme assignment — but the pattern double-fires for pushes/counters); (4) anything diffing old vs new state (devtools, undo stacks, effects comparing prev deps) — old and new agree at the prefs layer, so the change is invisible exactly where it happened. Correct: u => ({ ...u, prefs: { ...u.prefs, theme: dark ? 'dark' : 'light' } }). 'Returns a new object' checks the root; the contract is per-path.",
                  "hint": "The top-level reference changed. Which references did NOT, and who compares those?"
                },
                {
                  "prompt": "Estimate honestly: state is a normalized map of 10,000 todo objects; one todo's `done` flips. Compare (a) immutable path rebuild, (b) full deep clone, (c) in-place mutation + forced render, on: allocation cost, change-detection cost for a memoized list of 10,000 rows, and correctness of old snapshots. Conclude which is viable at scale.",
                  "solution": "(a) Path rebuild: new todo object + new map/object shell (with 10,000 reference copies for the shell — O(N) pointer copies but no deep work; with a keyed-object spread { ...todos, [id]: newTodo } that's one shallow copy of the index, cheap in practice; persistent maps make it O(log N)). Detection: each memoized row compares its own todo by reference — 9,999 rows bail out in O(1) each; only the flipped row re-renders. Old snapshots: valid forever. (b) Deep clone: O(N) full object copies per keystroke — allocation storm; AND every row's reference changed, so all 10,000 memoized rows re-render: the clone defeats the very bailouts immutability exists to feed. (c) Mutation: zero allocation, but detection is impossible (references unchanged) — the forced render must abandon memoization entirely (all rows re-render every time) and every old snapshot/closure is corrupted. Conclusion: (a) uniquely scales — shallow-copy the changed path, share the rest; (b) is 'immutability' without sharing (worst of both); (c) is fast until correctness matters.",
                  "hint": "Separate three costs: building the new version, ANSWERING 'what changed' per consumer, and the validity of old references."
                },
                {
                  "prompt": "Undo/redo for a drawing app in 40 words of design: state shape, what push-on-change costs with structural sharing, and why the mutation-based alternative needs deep clones. Then: what user action breaks your undo stack if ANY code path mutates?",
                  "solution": "Shape: present canvas-state + past[] and future[] arrays of prior roots. Each change produces a structurally-shared new root; push the old root onto past — cost O(depth) per change, memory shared across versions. Undo = pop past into present. Mutation-based: the 'old root' would be the SAME object as the new one, so history requires deep-cloning per change, O(N) time/memory each. Breaking action: any mutation edits the object shared across every stack entry containing it — undo then 'restores' a past that already contains the future's edit (history silently rewritten). One impure path poisons all versions retroactively, which is why the contract must be total, not majority.",
                  "hint": "What do stack entries share under structural sharing? What does mutation do to shared things?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u3l3-i1",
              "front": "How does React decide whether a state update changed anything?",
              "back": "Object.is(next, prev) — one reference/value comparison. Equal ⇒ no-op, render may be skipped. This is why mutation makes changes invisible."
            },
            {
              "id": "u3l3-i2",
              "front": "The immutability contract in one line?",
              "back": "Values in state/props are frozen on entry; 'change a field' means construct a replacement — new nodes along the changed path, old references shared everywhere else."
            },
            {
              "id": "u3l3-i3",
              "front": "Cost of an immutable update at depth d in an N-node state tree?",
              "back": "O(d·b) — shallow-copy the d path nodes (b fields each), share all off-path subtrees. Independent of N; and reference-compare then answers 'changed under here?' in O(1) at every node."
            },
            {
              "id": "u3l3-i4",
              "front": "Why is mutate-then-shallow-copy ({...state} after editing a nested field) worse than plain mutation?",
              "back": "It renders (root changed) but corrupts every OTHER holder of the old references — memoized children bail out on real changes, old closures see edited 'snapshots': nonlocal, intermittent tears."
            },
            {
              "id": "u3l3-i5",
              "front": "Diagnostic when two parts of the screen disagree about the same data?",
              "back": "Hunt for a reference that should have changed but didn't — some update mutated a shared node instead of rebuilding its path, and a comparison (memo, deps, context) was lied to."
            },
            {
              "id": "u3l3-i6",
              "front": "sort(), reverse(), splice(), push() in state updates?",
              "back": "All mutate the receiver — copy first ([...arr].sort(cmp)) or use producing forms (filter, map, spread). Immer gives mutation syntax that records paths and emits shared copies."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u3-check",
        "questions": [
          {
            "id": "u3q1",
            "type": "numeric",
            "prompt": "Base state n = 0. One handler runs: setN(n + 6); setN(c => c + 1); setN(42); setN(c => c + 10). What is the committed value after the batch? (Number only.)",
            "answer": 52,
            "explanation": "Freeze the snapshot (n = 0), rewrite, fold: [replace 6, +1, replace 42, +10] → 0→6→7→42→52. Replaces absorb history; updaters transform the accumulator — the two-step procedure (freeze, fold) settles any such puzzle mechanically.",
            "points": 1
          },
          {
            "id": "u3q2",
            "type": "numeric",
            "prompt": "const [n, setN] = useState(0). An effect with empty deps starts setInterval(() => setN(n + 1), 1000). What value does the display show after 60 seconds? (Number only.)",
            "answer": 1,
            "explanation": "The interval closure is from render 0, where n is frozen at 0 — every tick enqueues replace(1). The first tick renders 0→1; every later tick folds to 1 with Object.is(1,1) ⇒ no-op bailout. Display: 1 forever. The updater form c => c+1 (or honest deps) is the fix — updaters ignore the stale snapshot and transform the current base.",
            "points": 1
          },
          {
            "id": "u3q3",
            "type": "mcq",
            "prompt": "user is state holding { profile: { name } }. Which update is fully correct under the immutability contract?",
            "options": [
              "user.profile.name = value; setUser(user)",
              "user.profile.name = value; setUser({ ...user })",
              "setUser({ ...user, profile: { ...user.profile, name: value } })",
              "setUser(structuredClone(user)) after assigning user.profile.name = value"
            ],
            "answer": 2,
            "explanation": "Correct: rebuild the changed path (root and profile are new), share the rest. (a) same reference ⇒ Object.is says unchanged ⇒ no render. (b) renders, but the mutation corrupted every old holder of profile — memoized consumers of user.profile bail out on a real change (the half-copy tear). (d) 'works' but mutates first (old snapshots already corrupted before the clone) and deep-copies the world — O(N) allocation AND every reference changes, defeating all downstream memoization.",
            "points": 1
          },
          {
            "id": "u3q4",
            "type": "short",
            "prompt": "Complete the review heuristic: a setter call whose value expression mentions the state variable itself (like setCount(count + 1)) should almost always be rewritten to use ______.",
            "accept": [
              "an updater function",
              "updater function",
              "the updater form",
              "updater form",
              "a function updater",
              "function updater",
              "the functional form",
              "functional updates",
              "a functional update"
            ],
            "explanation": "next-from-previous computations must use setCount(c => c + 1): the updater reads the fold's accumulator at processing time, making the code correct under batching, stale closures, and any future batch-boundary changes. Mentioning the frozen snapshot inside a replace is the reviewable tell of the whole bug class.",
            "points": 1
          },
          {
            "id": "u3q5",
            "type": "proof",
            "prompt": "Prove the corollary pair: from base s, k calls of setN(n + 1) in one handler commit s + 1, while k calls of setN(c => c + 1) commit s + k. Use the snapshot proposition and the queue-fold semantics, and state where each is invoked.",
            "rubric": [
              "Invokes the snapshot proposition: within the handler's render, n is a constant equal to s, so each value-form call evaluates its argument to s + 1 at call time",
              "Applies fold semantics to the replace queue: [replace s+1, …, replace s+1] folds to s + 1 regardless of k (replace overwrites the accumulator)",
              "Applies fold semantics to the updater queue: fold(s, [f,…,f]) = fᵏ(s), proved by induction on k for f = (+1), giving s + k",
              "Concludes with the semantic distinction: value form encodes next-from-snapshot (event semantics), updater form encodes next-from-accumulator (transform semantics), and identifies which requirement each serves"
            ],
            "solution": "Snapshot step: the handler executes within render t whose state binding n is a per-render constant with value s (state variables are per-render constants; setters never reassign the binding). Hence each of the k value-form calls computes its argument n + 1 = s + 1 at call time and enqueues replace(s+1). Fold step (replaces): step(acc, replace v) = v ignores acc, so fold(s, [replace(s+1)]ᵏ) = s + 1 for any k ≥ 1. Fold step (updaters): each call enqueues f = c ↦ c + 1; by induction, fold(s, [f]ᵏ) = fᵏ(s): trivial at k = 0; inductive step applies f to fᵏ⁻¹(s) = s + (k−1), giving s + k. Both folds commit atomically at the batch boundary. Interpretation: the value form is 'replace with what I computed from the world I saw' — correct when next state is a function of the event; the updater form is 'transform whatever the value is by then' — required when next state is a function of previous state. ∎",
            "explanation": "The proof forces the two semantic layers apart — closure-frozen snapshots at call time, accumulator folding at process time — which is exactly the separation that predicts every batching behavior, including the interval-stuck-at-1 bug and the WebSocket progress-bar bug.",
            "points": 3
          },
          {
            "id": "u3q6",
            "type": "open",
            "prompt": "Incident review: a settings page renders a memoized <NotificationList prefs={user.prefs.notifications}/> and a summary badge reading user.prefs.notifications.length. After the user adds a notification rule, the badge says 5 but the list shows 4 until they navigate away and back. The handler is: user.prefs.notifications.push(rule); setUser({ ...user }). Write the full incident analysis: the mechanism of the tear, why the bug is nonlocal and intermittent, the corrected handler, and the general review rule that would have caught it.",
            "rubric": [
              "Mechanism: push mutates the shared array (reference unchanged), spread creates a new root — so the parent re-renders (badge reads mutated length = 5) while the memoized list's Object.is(prevProps.prefs…, next) sees the SAME array reference and bails out, rendering stale content",
              "Nonlocality/intermittency: the defect is in the handler but the symptom appears in whichever consumer memoizes; without memo the bug is invisible (everything re-renders reading mutated data), so it appears/disappears as memoization or component structure changes",
              "Corrected handler rebuilds the full path with sharing: setUser(u => ({ ...u, prefs: { ...u.prefs, notifications: [...u.prefs.notifications, rule] } })) — plus notes the updater form and that old snapshots remain valid",
              "Review rule: for each changed leaf, every node on its path to the root must be freshly constructed (path-new, rest-shared); flags mutate-then-shallow-copy as the highest-risk pattern because it half-works"
            ],
            "solution": "Mechanism: the handler mutates notifications in place — its reference is unchanged — then replaces the root. The re-render reaches the badge, which reads .length through the NEW root into the MUTATED array: 5. NotificationList is memoized: its props check compares the old and new notifications references, finds them identical (the array was pushed into, never replaced), and skips rendering: the committed list DOM still reflects 4 items. One frame, two truths — a tear caused by lying to a comparison. Nonlocal: the incorrect line is in the handler, but the symptom manifests only in memoized consumers of the mutated layer — move the memo, move the bug. Intermittent: remove memoization (or add an unrelated state change that re-renders the list) and everything looks fine, which is why it survived review and QA. Fix: setUser(u => ({ ...u, prefs: { ...u.prefs, notifications: [...u.prefs.notifications, rule] } })) — path rebuilt root→prefs→notifications, all other branches shared; memo comparisons now truthfully report change, and prior snapshots/closures keep their uncorrupted 4-item world. Review rule: trace every changed leaf's path to the root and require fresh construction at each node; treat mutate-then-copy as worse than forget-to-copy, because it demos correctly and tears in production. (Defense in depth: dev-mode freezing of state, Immer for deep paths, lint bans on push/sort/splice against state.)",
            "explanation": "The half-copy tear is the most-shipped immutability bug in React codebases. The grader wants the causal chain — mutation preserves the compared reference while the spread forces a render — and the recognition that memoization turned a hidden corruption into a visible disagreement.",
            "points": 3
          }
        ]
      }
    },
    {
      "id": "u4",
      "title": "Designing State",
      "summary": "State as a data-modeling problem: make illegal states unrepresentable, keep one source of truth, choose owners by lifetime, and use reducers and context as the structuring tools.",
      "references": [
        "react.dev — Choosing the State Structure; Sharing State Between Components; Extracting State Logic into a Reducer; Passing Data Deeply with Context; Scaling Up with Reducer and Context",
        "Yaron Minsky — 'Effective ML' / 'Make illegal states unrepresentable' (the design principle, originally for OCaml)",
        "Harel (1987) — Statecharts: a visual formalism for complex systems (the FSM lineage behind status-driven UI)",
        "Redux docs — 'Normalizing State Shape' (the by-id normalization pattern, framework-independent)"
      ],
      "prerequisites": [
        "u3"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u4l1",
          "title": "Impossible States and Reducers as Machines",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Most state bugs are modeling bugs",
              "body": "Units 1–3 gave you the physics of state: snapshots, queues, immutability. This unit is about the part no runtime can do for you — *deciding what the state is*. Watch how a typical data-fetching component grows: it starts with `isLoading`; an error path adds `error`; a retry feature adds `isRetrying`; a success toast adds `isSuccess`. Four booleans, each added innocently, each individually reasonable. Now count what you have built: 2⁴ = 16 representable configurations, of which perhaps five mean anything — idle, loading, retrying, success, failure. The other eleven — `isLoading && isSuccess`, `isRetrying && !error`, all-four-true — are **impossible states**: configurations your UI can render (a spinner *and* a success toast), your logic must defend against (`if (isLoading && !error && !isSuccess)`), and your teammates will eventually reach through some interleaving of setters you never imagined. The deep point: those states were not created by buggy code; they were created by the *shape of the model*. Every representable-but-meaningless configuration is a bug that has not happened yet, and no amount of careful setter discipline removes it — only reshaping the state can. This lesson develops the two tools for that reshaping: sum-type thinking (make illegal states unrepresentable) and reducers (make transitions explicit and centralized)."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Independent flags overrepresent; sum types represent exactly",
              "statement": "Let a UI's legal condition set be L (its genuinely distinct situations). (1) Modeling with n independent boolean flags represents 2ⁿ configurations; if |L| < 2ⁿ, then 2ⁿ − |L| impossible configurations are representable, and every consumer of the state must either handle or provably exclude each — an obligation that grows with the representation, not the requirements. (2) Modeling with a single discriminated value status ∈ L (a sum type: one tag from a finite set, plus per-tag payload) represents exactly |L| configurations: impossible states are not defended against but *unconstructible*. (3) The minimum n for flags to distinguish |L| situations is ⌈log₂|L|⌉, at which point flag combinations are a dense encoding with no slack — but real flag models are never dense, because each feature adds a flag (n grows linearly with features while |L| grows slowly), so the impossible region 2ⁿ − |L| grows exponentially in practice.",
              "proof": "(1) n independent booleans span the full product space {T,F}ⁿ of size 2ⁿ by construction — nothing in the representation ties one flag's value to another's. Any configuration outside L is still a value of the type; code receiving the state cannot rely on its absence without external proof, so each consumer carries the exclusion obligation. Reachability in practice: each flag is written by separate setter calls at separate sites; an interleaving that sets one and fails to clear another (an early return between two setter calls, a race between two handlers, a forgotten cleanup on retry) lands in the illegal region — the representation offers no resistance. (2) A discriminated union's value is exactly one tag with its payload; a configuration mixing two situations (loading AND success) has no encoding, so no interleaving, race, or forgotten write can produce it — the proof obligation moved from every consumer to the single type definition. (3) Distinguishing |L| situations requires at least ⌈log₂|L|⌉ bits — information-theoretic minimum. The growth claim is empirical but structural: features add flags additively (n ← n+1 doubles the space) while typically adding O(1) new legal situations; hence the slack 2ⁿ − |L| compounds per feature. ∎"
            },
            {
              "type": "code",
              "heading": "The same component, before and after the reshape",
              "lang": "jsx",
              "code": "// BEFORE — 4 flags, 16 configurations, 5 meanings, 11 landmines\nconst [isLoading, setIsLoading] = useState(false);\nconst [isRetrying, setIsRetrying] = useState(false);\nconst [error, setError] = useState(null);\nconst [isSuccess, setIsSuccess] = useState(false);\n// Every consumer defends:  if (isLoading && !error && !isSuccess) …\n// Every writer must remember every other flag:\n//   setIsLoading(false); setError(e); setIsSuccess(false); // forgot isRetrying?\n\n// AFTER — one status, exactly the legal set, payload where it belongs\nconst [req, setReq] = useState({ status: 'idle' });\n// req is one of:\n//   { status: 'idle' }\n//   { status: 'loading', attempt: 1 }\n//   { status: 'retrying', attempt: n, lastError: e }\n//   { status: 'success', data }\n//   { status: 'failure', error: e }\n// Consumers SWITCH on status — no boolean algebra, no defense:\nswitch (req.status) {\n  case 'loading':\n  case 'retrying': return <Spinner attempt={req.attempt} />;\n  case 'failure':  return <ErrorPane error={req.error} onRetry={retry} />;\n  case 'success':  return <Results data={req.data} />;\n  default:         return <Idle onStart={start} />;\n}\n// Note the payload discipline: data exists ONLY under 'success',\n// error ONLY under 'failure'/'retrying' — you cannot even ASK for\n// data while loading; the illegal question has no grammar."
            },
            {
              "type": "text",
              "heading": "From status values to transitions: the reducer",
              "body": "The status enum fixes *representation*; a second failure class remains — **transition sprawl**. With bare setters, the rule 'you can only retry from failure' lives wherever someone calls `setReq`: in the retry button's handler, in the error pane, in an effect. Each site re-derives the legality of its transition from local knowledge, and sites drift apart as the app grows. The fix is the oldest idea in this course's lineage: a **finite state machine**. Declare the states; declare the *events* (not the mutations — the things that happen: `FETCH_STARTED`, `FETCH_FAILED`, `RETRY_CLICKED`); and centralize a single transition function that, given the current state and an event, returns the next state. React ships this as `useReducer`: `const [state, dispatch] = useReducer(reducer, initial)` where `reducer(state, action) → nextState`. Components stop deciding *what happens* and merely *report what occurred* — `dispatch({ type: 'RETRY_CLICKED' })` — while the reducer, in one auditable place, decides what that event means in the current state, including *ignoring it* when illegal (a retry click during `loading` returns the state unchanged). That last capability — centralized refusal — is what setter-scatter can never give you: with setters, every site can force any write; with a reducer, illegal transitions are dead code paths in one function you can read, test, and prove things about."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Reducer as a transition function",
              "statement": "A **reducer** is a pure function δ : S × A → S from (state, action) to next state — exactly a finite state machine's transition function, generalized to structured (possibly infinite) S carrying payload. `useReducer(δ, s₀)` holds current state s and, on dispatch(a), enqueues the update; React computes the next snapshot by folding the action queue: sₖ = δ(δ(…δ(s, a₁)…), aₖ) — the same left-fold semantics as Unit 3's updater queue, with δ(·, aᵢ) as the updater. Purity of δ is therefore load-bearing for the same reasons: refolds under StrictMode/interruption must be deterministic and unobservable. Dispatching an action whose transition is undefined for the current state should return s unchanged (self-loop), making illegal transitions inert by construction."
            },
            {
              "type": "example",
              "heading": "Worked example: the fetch machine, fully specified",
              "body": "Write the machine as a table before writing code — rows are states, columns are events, cells are next states (blank = self-loop, i.e. ignore):\n\n• **idle** × START → loading(attempt 1)\n• **loading** × RESOLVE(data) → success(data); × REJECT(e) → failure(e); × START → *(ignored — already in flight)*\n• **failure** × RETRY → retrying(attempt+1, lastError); × START → loading(1)\n• **retrying** × RESOLVE → success; × REJECT(e) → failure(e)\n• **success** × START → loading(1); × RESOLVE/REJECT → *(ignored — a late response from a superseded request must not clobber a fresh run; Unit 9 builds on exactly this cell)*\n\nThe blanks are the specification's teeth. 'RESOLVE while success is ignored' is the race-condition guard most flag-based implementations lack — with flags, a stale promise callback happily runs `setData(old)`. Here the reducer sees (success, RESOLVE) and returns state unchanged; the stale event *bounces off the machine*. Similarly 'START while loading is ignored' is double-click protection — Unit 3's checkout bug — solved in the model rather than with a ref-guard, because dispatches fold sequentially: two START dispatches in one batch fold as δ(δ(idle, START), START) = δ(loading, START) = loading. The second click is absorbed by a *table cell*, not by a timing trick. When the machine is drawn first, these cells are design decisions made deliberately; when flags accrete, each cell is a production incident discovered later."
            },
            {
              "type": "code",
              "heading": "The reducer implementing the table — one screen, every rule",
              "lang": "jsx",
              "code": "function fetchReducer(state, action) {\n  switch (state.status) {\n    case 'idle':\n      if (action.type === 'START')\n        return { status: 'loading', attempt: 1 };\n      return state;\n    case 'loading':\n    case 'retrying':\n      if (action.type === 'RESOLVE')\n        return { status: 'success', data: action.data };\n      if (action.type === 'REJECT')\n        return { status: 'failure', error: action.error };\n      return state;                    // START while in flight: absorbed\n    case 'failure':\n      if (action.type === 'RETRY')\n        return { status: 'retrying',\n                 attempt: state.attempt ?? 1, lastError: state.error };\n      if (action.type === 'START')\n        return { status: 'loading', attempt: 1 };\n      return state;\n    case 'success':\n      if (action.type === 'START')\n        return { status: 'loading', attempt: 1 };\n      return state;                    // stale RESOLVE/REJECT: absorbed\n    default:\n      return state;\n  }\n}\n// Structure to notice: the OUTER switch is on state.status, not\n// action.type — reading it top-to-bottom recites the machine's rows,\n// and each `return state` is a deliberate blank cell from the table.\n// The reducer is trivially unit-testable: assert δ(s, a) per cell,\n// no React, no mocks — expect(fetchReducer({status:'success',data},\n// {type:'REJECT'})).toEqual({status:'success', data})."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**useState or useReducer? A decision rule, not a taste.** Reach for a reducer when any of: (1) the next state depends on the current state *and* the event (transition logic exists); (2) two or more values must change together atomically (they are one machine's payload, not separate cells — Unit 3's cross-cell exercise was this smell); (3) the same event is dispatched from multiple places (centralize its meaning once); (4) you found yourself writing a status enum with rules about which statuses follow which. Stay with useState when state is a single independent value with replace/toggle semantics — a controlled input's text, an open flag with no transition rules. A reducer for `isOpen` is ceremony; four booleans for a fetch lifecycle is negligence."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An audio player uses five booleans: isPlaying, isPaused, isBuffering, isSeeking, hasEnded. Count the representable configurations; propose the legal set L as a status enum (with any needed payload); compute the impossible-state count you eliminated; and identify two concrete impossible configurations and the user-visible bug each would cause.",
                  "solution": "Representable: 2⁵ = 32. A defensible L: {stopped, playing, paused, buffering(resumeTo: playing|paused), seeking(from: playing|paused), ended} — 6 tags (payload distinguishes buffer-into-play vs buffer-into-pause without new tags). Eliminated: 32 − 6 = 26 configurations (the payload variants are constrained data, not free flags). Concrete impossibles: isPlaying && hasEnded — the UI shows a live progress bar and an 'ended' replay overlay simultaneously; isPlaying && isPaused — play/pause button renders both glyphs or flickers, and the tick-effect (running iff isPlaying) fights the pause overlay. With the enum, both are unconstructible: one tag at a time, by grammar.",
                  "hint": "L is what the PRODUCT distinguishes, not what the code currently tracks. Payload can absorb distinctions that would otherwise multiply tags."
                },
                {
                  "prompt": "Convert this transition prose into a reducer table, marking every deliberately-blank cell: 'A form starts editable. Submitting disables it and shows a spinner. Success shows a done screen — permanently. Failure re-enables the form with the error shown. Users may not submit while submitting; a failure's error clears the moment they edit any field.'",
                  "solution": "States: editing(draft, error?), submitting(draft), done. Events: EDIT(field), SUBMIT, RESOLVE, REJECT(e). Table: editing × EDIT → editing(draft′, error cleared — the spec's last sentence is a payload rule on this transition); editing × SUBMIT → submitting(draft); editing × RESOLVE/REJECT → blank (no request in flight; stale responses bounce). submitting × RESOLVE → done; submitting × REJECT(e) → editing(draft, error e); submitting × SUBMIT → blank (the no-double-submit rule is a CELL, not a disabled-button hope); submitting × EDIT → blank (form is disabled; a keystroke that leaks through changes nothing). done × anything → blank ('permanently' = absorbing state). The exercise's point: every sentence of the prose landed as exactly one cell or payload rule, and the blanks are enumerable — you can now ASK 'what should submitting × EDIT do?' in review, instead of discovering an answer in production.",
                  "hint": "States are nouns with payload; events are past-tense facts; every prose constraint is either a transition, a payload rule, or a blank."
                },
                {
                  "prompt": "A teammate argues: 'The reducer is indirection — my setters are fewer lines and I can see what each button does at the call site.' Steelman their position honestly, then give the two failure classes that decide against it for lifecycle-shaped state, with one concrete scenario each.",
                  "solution": "Steelman: for replace/toggle state, they're right — dispatch({type:'OPEN_MODAL'}) → reducer → setOpen(true) is a longer spelling of setOpen(true) with a level of indirection that hides, not reveals; call-site locality is a real readability asset, and reducers add boilerplate, action-type stringly-typing, and a second file. The two deciders: (1) **Transition legality** — with setters, every call site can force any write; the rule 'no RESOLVE after success' must be re-implemented (or forgotten) at each async callback: concrete: a slow request resolving after a newer one overwrites fresh data with stale (flags can't refuse; the reducer's blank cell absorbs it). (2) **Atomic multi-field transitions** — REJECT must set error AND flip status AND preserve attempt in one step; three setter calls at N sites eventually diverge (someone forgets attempt), and each partial interleaving is a new impossible state: concrete: the retry counter that resets on some failure paths but not others. Verdict: locality wins for independent values; centralization wins the moment transitions have RULES — and lifecycle state always does.",
                  "hint": "What can a call site do with setters that a reducer's table structurally forbids?"
                },
                {
                  "prompt": "Prove the double-dispatch absorption claim from the definition: if the user clicks Start twice within one batch (two START dispatches from snapshot state idle), the committed state is loading(attempt 1), not a double-started request — and state exactly which property of the fold and which table cell you used.",
                  "solution": "By the definition, useReducer folds the action queue with δ: committed = δ(δ(s_base, a₁), a₂). With s_base = idle: inner step δ(idle, START) = loading(1) (the idle × START cell). Outer step δ(loading(1), START) = loading(1) — the loading × START cell is a self-loop (blank). Fold result: loading(1). Properties used: sequential fold against the ACCUMULATOR (the second dispatch sees loading, not the frozen snapshot — unlike Unit 3's replace-form setters, which both would have computed from idle), and totality of δ with self-loops for undefined transitions. Note the contrast that makes this notable: two setter-form calls setReq({status:'loading'}) would both 'succeed' identically, but any side effect keyed to the transition (starting the fetch) would fire twice at the call sites; with the reducer, 'did we transition?' is answerable from the fold, and the effect layer can key off state change alone. ∎",
                  "hint": "Write the two-step fold explicitly; name the cell each step hits."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u4l1-i1",
              "front": "Why do n boolean flags breed bugs even before any code is wrong?",
              "back": "They represent 2ⁿ configurations while only |L| are legal — the 2ⁿ−|L| impossible states are constructible by interleavings and must be defended against by every consumer."
            },
            {
              "id": "u4l1-i2",
              "front": "What does 'make illegal states unrepresentable' mean operationally in React state?",
              "back": "Replace independent flags with one discriminated value — status tag + per-tag payload — so impossible combinations have no encoding and the proof obligation collapses into the type."
            },
            {
              "id": "u4l1-i3",
              "front": "What is a reducer, formally?",
              "back": "A pure transition function δ: S × A → S — an FSM generalized with payload; useReducer folds dispatched actions through δ (same fold semantics as the update queue)."
            },
            {
              "id": "u4l1-i4",
              "front": "How does a reducer neutralize stale async responses and double-clicks?",
              "back": "Illegal transitions are self-loop cells: (success, RESOLVE) → success and (loading, START) → loading return state unchanged — the events bounce off the table instead of clobbering state."
            },
            {
              "id": "u4l1-i5",
              "front": "The useState vs useReducer decision rule?",
              "back": "Reducer when next-state depends on current-state + event, multiple fields change atomically, or one event has many dispatch sites; useState for independent replace/toggle values."
            },
            {
              "id": "u4l1-i6",
              "front": "Best structure for a lifecycle reducer's switch?",
              "back": "Outer switch on state.status (rows of the machine), inner checks on action.type — reading it recites the transition table, and each `return state` is a deliberate blank cell."
            }
          ]
        },
        {
          "id": "u4l2",
          "title": "One Source of Truth",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "Redundancy is the other representational sin",
              "body": "Lesson 1 removed states that *shouldn't exist*. This lesson removes copies of states that *already exist elsewhere* — the second great modeling failure. It wears three costumes. **Derived state stored**: `const [fullName, setFullName]` alongside firstName and lastName, updated 'whenever either changes' — until one code path forgets. **Mirrored props**: `const [color, setColor] = useState(props.color)` — a component photocopying its input at mount, then drifting from it forever after (the initializer runs once; later prop changes never touch the copy). **Duplicated selection**: `selectedItem` stored as a full object alongside the `items` list it came from — edit the item in the list, and the stale copy in `selectedItem` still renders the old title. All three share one anatomy: a fact F is representable from two places in the state, and *nothing in the system ties them together*. React will not synchronize them — it faithfully renders whatever inconsistent pair you store. The design principle is the database community's oldest: **every fact gets exactly one authoritative home; everything else derives from it on demand**. In React the 'on demand' is free — render already re-runs on every change, so a derivation written in the component body is recomputed exactly when needed, with no invalidation logic at all."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Stored derivations require invalidation; rendered derivations are correct by construction",
              "statement": "Let fact D be a function of state S: D = g(S). (1) If D is *stored* as its own state cell, correctness requires that every update path that changes S also updates D — k update sites imply k synchronization obligations, and the failure of any one produces an observable inconsistency (a reachable snapshot where D ≠ g(S)). The obligations grow with update sites, and no local inspection of a single site can verify global correctness. (2) If D is *computed during render* — a const in the component body — then in every committed frame, D = g(S) holds by construction: render re-executes the derivation from the current snapshot, and the snapshot model (Unit 3) guarantees S is consistent within the frame. There is no invalidation problem because there is no cache. (3) Storing D is justified only when g is expensive enough to matter (then memoize the derivation — useMemo, Unit 7 — which is still not state) or when D must *diverge* from g(S) by requirement (at which point D is not derived — it is an independent fact, and naming it as such changes the design).",
              "proof": "(1) Suppose site i updates S from s to s′ with g(s) ≠ g(s′) but omits the D-write. The next committed snapshot holds (s′, D = g(s)) — inconsistent and rendered as such. Reachability requires only that site i executes, which is under user control. The verification claim: whether site i 'changes S in a way that affects D' depends on g and on all other sites' behavior; local review of site i cannot establish the global invariant — this is precisely the transition-sprawl argument of Lesson 1 applied to synchronization. (2) In the declarative pipeline, render t computes D_t = g(S_t) from the frozen snapshot S_t; the committed frame renders (S_t, D_t) together. Since D is recomputed in every render and never persisted, no frame can exhibit a stale D — the class of inconsistency is not handled but *absent*, the same move as Lesson 1's unrepresentability. (3) is definitional: memoization is a transparent cache with automatic invalidation by inputs (correct by Unit 7's soundness argument); and if requirements permit D ≠ g(S), D was never a derivation. ∎"
            },
            {
              "type": "code",
              "heading": "The three costumes, each with its correction",
              "lang": "jsx",
              "code": "// 1) DERIVED STATE STORED — delete the cell, compute in render\n// BAD:  const [visible, setVisible] = useState([]);  // 'kept in sync'\n//       …every setter of todos/filter must remember setVisible(…)\n// GOOD:\nconst [todos, setTodos] = useState([]);\nconst [filter, setFilter] = useState('all');\nconst visible = todos.filter(t => filter === 'all' || t.status === filter);\n// Recomputed per render, correct per frame, zero sync code.\n// (Expensive g? useMemo(() => …, [todos, filter]) — cache, not state.)\n\n// 2) MIRRORED PROP — the initializer runs ONCE; the copy then drifts\n// BAD:  function Row({ color }) { const [c] = useState(color); … }\n// GOOD (a): no local state — just use props.color; it's the parent's fact.\n// GOOD (b): the prop is genuinely only an INITIAL value — then say so,\n//           and let the parent reset identity when it must:\nfunction Draft({ initialText }) {\n  const [text, setText] = useState(initialText);   // honest name\n  …\n}\n// …and the parent renders <Draft key={docId} initialText={doc.text}/>\n// so a new doc remounts the editor (Unit 2's key-reset) instead of\n// the component trying to 'watch' the prop with sync effects.\n\n// 3) DUPLICATED SELECTION — store the ID, derive the object\n// BAD:  const [selected, setSelected] = useState(null); // holds a copy\n// GOOD:\nconst [selectedId, setSelectedId] = useState(null);\nconst selected = items.find(i => i.id === selectedId) ?? null;\n// Edits to items flow into `selected` automatically; a deleted item\n// derives to null (handle it once, here) instead of haunting the\n// detail pane as a stale ghost."
            },
            {
              "type": "text",
              "heading": "Choosing the owner: lifting state up",
              "body": "Single source of truth answers *how many* homes a fact has; the next question is *which component* is the home. React's answer follows from the tree: data flows down, so **a fact's owner must be a common ancestor of every component that reads or writes it** — and, by Unit 2's addressing rule, an ancestor whose own lifetime covers the fact's required lifetime (state dies with its instance). The procedure called *lifting state up* is the constructive version: when two siblings need the same fact (an accordion where only one panel opens; a filter input and the list it filters), the fact cannot live in either sibling — move it to their nearest common parent, pass the value down as props, and pass change-requests down as callbacks. Each lift trades locality for authority: the parent grows a concern, the children become *controlled* — stateless with respect to that fact, rendering whatever they are told. That trade has a direction rule worth making explicit: **lift as high as necessary, and no higher**. Every level too high couples an ancestor to a concern it doesn't need (and re-renders it on every change — Unit 7's colocation argument is this rule's performance face); every level too low forces the fact to be duplicated or threaded sideways. The nearest common ancestor of all readers/writers, adjusted upward only for lifetime requirements, is the unique correct answer — and 'adjusted upward for lifetime' is exactly the chat-draft exercise from Unit 2: drafts surviving tab switches must live above the tabs."
            },
            {
              "type": "example",
              "heading": "Worked example: the accordion, lifted",
              "body": "Requirement: a FAQ accordion where opening one panel closes the others. First attempt: each `<Panel>` owns `const [isOpen, setIsOpen]`. Each panel can open itself, but no panel can close its siblings — the fact 'which panel is open' is scattered across n cells, and the invariant 'at most one true' is exactly a Lesson-1 impossible-state problem (2ⁿ configurations, n+1 legal). The reshape and the lift are the same move: the fact is *one* value, `openIndex: number | null`, and its readers/writers are all panels — so it lives in the parent. `<Accordion>` holds `openIndex`; renders `<Panel isOpen={i === openIndex} onOpen={() => setOpenIndex(i)} />`. Count what improved: the invariant is structural (one cell can't hold two indices — unrepresentable), the panels became stateless and reusable (a Panel renders what it's told; the exclusive-open *policy* belongs to Accordion, and a different parent could implement always-open or multi-open with the same Panel), and the coordination code is zero — no panel knows siblings exist. The pattern generalizes to every 'exactly one of' UI: selected row, active tab, focused card. Whenever an invariant spans siblings, the fact it constrains belongs to the parent — invariants are facts about the *collection*, and the collection's owner is the ancestor."
            },
            {
              "type": "text",
              "heading": "Normalization: shape for lookup, not for display",
              "body": "The last structural tool concerns collections. UI data arrives shaped like the API response — nested arrays: a board containing columns containing cards. Stored that way, every update is a deep traversal (`board.columns.find(...).cards.find(...)`), every entity edit rewrites a path through unrelated structure (Unit 3's spread ladders), and the same entity appearing twice (a card in 'assigned to me' and in its column) is *stored* twice — reintroducing the duplication this lesson exists to kill. The database answer is **normalization**: store entities in flat maps keyed by id, and represent relationships as id references — `{ cards: { c1: {...} }, columns: { k1: { cardIds: ['c1'] } }, columnOrder: ['k1'] }`. Updating a card's title becomes a depth-1 immutable update regardless of where it displays; 'the card' has one home no matter how many views reference c1; moving a card between columns edits two id-arrays without touching any card object; and deletion is a single delete plus reference cleanup — no tree-hunt for copies. The costs: assembly at render (components join ids to entities — cheap map lookups, memoizable if hot) and discipline at ingestion (normalize once at the API boundary, denormalize never). Rule of thumb: **normalize state that is edited; leave read-only display data in response shape.** A settings screen's static option list needs no ceremony; a kanban board absolutely does — the moment two views can show the same editable entity, nesting is a duplication bug waiting for its interleaving."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The tell-tale smell is the word 'sync'.** Any comment, effect, or function whose job description contains 'keep X in sync with Y' is announcing that one fact has two homes — an invalidation problem someone volunteered to solve by hand, forever. The honest designs are: X derives from Y in render (delete X's cell); X is the truth and Y should derive (invert it); or X and Y are genuinely independent facts that happen to correlate (then divergence is legal — delete the sync). useEffect-that-setStates-from-props/state is this smell's most common uniform (react.dev's 'You Might Not Need an Effect' catalogs the variants — Unit 6 returns to it): a render-time derivation restated as a one-frame-late echo, adding a tearing window and an extra render per change. Before writing any synchronization, ask: which of these is the truth? Then make the other one a computation."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Audit this state for a product-list page and rewrite it minimally: items (array), searchText, visibleItems (filtered array kept in sync), selectedItem (full object copy), itemCount (number, updated on add/remove), isEmpty (boolean, updated alongside itemCount). For each cell you delete, name the costume it wore.",
                  "solution": "Keep: items, searchText, selectedId (converted from selectedItem). Delete: visibleItems — stored derivation; becomes const visibleItems = items.filter(i => i.name.includes(searchText)) in render. selectedItem — duplicated selection; becomes derived: items.find(i => i.id === selectedId) ?? null (deletion of the selected item now degrades gracefully to null in the same frame). itemCount — stored derivation of items.length (two update sites, add and remove, already means two chances to forget). isEmpty — a derivation OF A DERIVATION (itemCount === 0), the costume at its silliest. Final state: three cells, zero sync obligations; every deleted cell's consistency is now guaranteed per-frame by construction.",
                  "hint": "For each cell ask: can I compute this from the others? If yes, it is a costume — which one?"
                },
                {
                  "prompt": "This component loses user edits: function ProfileEditor({ user }) { const [draft, setDraft] = useState(user); … } — when the parent refetches and `user`'s reference changes (same data), nothing happens; when the user prop genuinely changes (route switch to another profile), the editor keeps showing the OLD draft. Diagnose both observations from the mirrored-prop mechanics, then give the correct design for: (a) 'editor of the profile currently routed to', (b) 'editor that must warn before discarding unsaved edits on route switch'.",
                  "solution": "Mechanics: useState's initializer runs only at MOUNT — user is photocopied once; later prop changes (refetch or route switch) never touch draft. Observation 1 is actually correct behavior by luck (same data), observation 2 is the drift made visible. (a) The entity 'draft of user X' has identity per-profile — say so with a key: <ProfileEditor key={user.id} user={user}/>; the route switch remounts the editor, re-running the initializer against the new profile (Unit 2's key-reset as the honest 'watch the prop'). Rename the prop initialUser for truth in advertising. (b) A warning requires the draft to SURVIVE the switch attempt — so the draft's lifetime exceeds the editor's; lift it: the route-level owner holds drafts[userId] (persistence) and the editor becomes controlled or key-mounted from the stored draft (Unit 2's chat exercise: key gives isolation, lifting gives persistence; the warning needs the latter). What is never correct: an effect syncing setDraft(user) on user change — it erases edits on every refetch, the exact bug class the smell-test names.",
                  "hint": "When does a useState initializer run? Then: what LIFETIME does each requirement demand of the draft?"
                },
                {
                  "prompt": "Normalize this API response into flat state and write the update for 'rename card c2', comparing its cost against the nested shape: { board: 'b1', columns: [{ id: 'k1', title: 'Todo', cards: [{ id: 'c1', title: 'A' }, { id: 'c2', title: 'B' }] }, { id: 'k2', title: 'Done', cards: [] }] }.",
                  "solution": "Normalized: { cards: { c1: {id:'c1',title:'A'}, c2: {id:'c2',title:'B'} }, columns: { k1: {id:'k1',title:'Todo',cardIds:['c1','c2']}, k2: {id:'k2',title:'Done',cardIds:[]} }, columnOrder: ['k1','k2'] }. Rename: setState(s => ({ ...s, cards: { ...s.cards, c2: { ...s.cards.c2, title: 'B2' } } })) — depth-2 path, independent of which/how many columns display c2; columns and columnOrder shared untouched, so memoized column components bail out (only c2's row re-renders). Nested shape: find the column containing c2, then map columns, map cards — a spread ladder through structurally unrelated nodes; every column's array gets a new reference, so ALL columns re-render; and if c2 also appeared in an 'assigned to me' nested view, that copy is silently stale — the duplication bug normalization exists to prevent.",
                  "hint": "Entities in maps by id; relationships as id arrays; then the update touches only the entity's own path."
                },
                {
                  "prompt": "Design decision with a wrinkle: a wizard's step-3 form shows a shipping-cost estimate derived from step-1's country and the cart. Deriving in render is correct but the estimate API call costs 300ms and money per call. Someone proposes const [estimate, setEstimate] = useState(null) updated by an effect watching [country, cart]. Adjudicate: is this stored-derivation heresy? What distinguishes it from the visibleItems case, and what invariant must the implementation still protect?",
                  "solution": "Not heresy — it is not a derivation in the proposition's sense: g is ASYNCHRONOUS and effectful (a network call), so it cannot be computed during render at all; 'estimate' is genuinely new state (a cached remote fact) whose home must be a cell. The distinguishing line: visibleItems = pure function of local state (render can compute it; storing it adds an invalidation problem with zero payoff); estimate = f(remote system, inputs) — the state cell is the only possible home, and the effect is synchronization with an external system (Unit 6's legitimate use). The invariant to protect: the cell must be tagged with the inputs it answers for — { for: {country, cartHash}, value } or a status machine — so a stale response can be detected and dropped (Lesson 1's success × RESOLVE blank cell; Unit 9's race protocol). Untagged, the cell silently shows Sweden's estimate over a cart that changed — the duplication bug returning through the async door.",
                  "hint": "Can render compute it synchronously? If not, it's not a stored derivation — but WHICH inputs the stored value answers for must be recorded."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u4l2-i1",
              "front": "The single-source-of-truth rule and its React-specific payoff?",
              "back": "Every fact has one authoritative cell; everything else derives in render. Render re-runs per change, so derivations are correct per frame by construction — no invalidation code exists."
            },
            {
              "id": "u4l2-i2",
              "front": "Why is const [c] = useState(props.color) almost always a bug?",
              "back": "The initializer runs once at mount — the copy never follows later prop changes and silently drifts. Either use the prop directly, or name it initialX and reset identity via key."
            },
            {
              "id": "u4l2-i3",
              "front": "Store the selected item or the selected id?",
              "back": "The id. Derive the object with find() so edits flow through automatically and deletion degrades to null in-frame — a stored copy goes stale on any list edit."
            },
            {
              "id": "u4l2-i4",
              "front": "Where must a fact shared by siblings live, and how high should you lift?",
              "back": "In a common ancestor of all readers/writers — the NEAREST one, adjusted upward only for lifetime requirements. Too high couples and over-re-renders; too low forces duplication."
            },
            {
              "id": "u4l2-i5",
              "front": "What is normalized state and when is it mandatory?",
              "back": "Entities in flat by-id maps, relationships as id arrays, order as id lists. Mandatory when editable entities appear in multiple views — nesting stores copies, and copies drift."
            },
            {
              "id": "u4l2-i6",
              "front": "The smell that reveals a two-homes fact?",
              "back": "Any code whose job is 'keep X in sync with Y' — especially effects calling setState from props/state. Decide which is the truth; make the other a render-time computation."
            }
          ]
        },
        {
          "id": "u4l3",
          "title": "Context: Scoped Injection, Not a Store",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The problem is threading, not sharing",
              "body": "Lifting state up has a cost the accordion hid: distance. When the owner is three levels above the reader, the value travels as props through every intermediate component — components that neither read nor care about it, yet must declare, accept, and forward it. This is **prop drilling**, and its damage is architectural, not aesthetic: every intermediary's signature now encodes its descendants' needs, so adding a consumer five levels down forces edits to four bystanders; refactoring the middle of the tree means re-plumbing pipes it never used. Note precisely what the problem is: not that many components need the value — props handle that fine — but that components which *don't* need it must carry it. React's answer is **context**: a mechanism letting an ancestor publish a value that any descendant can read directly, skipping the intermediaries. `createContext(default)` mints a channel; `<Ctx value={v}>` publishes onto it for a subtree; `useContext(Ctx)` reads *the nearest enclosing provider's* value. The right mental model is **scoped dependency injection** — 'the current theme', 'the logged-in user', 'this form's disabled flag' become ambient within a subtree — and emphatically *not* 'global state': a context has no store, no update protocol, and its scoping-by-subtree is its defining feature, not a limitation."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Context resolution and propagation semantics",
              "statement": "(1) **Resolution.** useContext(Ctx) in a component resolves to the value of the *nearest* ancestor provider of Ctx in the render tree at that position; if none exists, it yields the createContext default. Nesting providers shadows outer values for inner subtrees — resolution is lexical-by-tree, like variable scoping. (2) **Propagation.** When a re-render of the provider passes a value v′ with !Object.is(v, v′), every component that reads Ctx beneath that provider re-renders — *even components inside memoized or bailout subtrees*: context propagation punctures memo/bailout skips by design (a consumer must never render against a stale context). (3) **Granularity.** The unit of subscription is the whole context value: consumers re-render on any identity change of v, regardless of which part of v they use. There is no per-field subscription; splitting granularity requires splitting contexts."
            },
            {
              "type": "example",
              "heading": "Worked example: resolution and shadowing doing real work",
              "body": "Design a form library where disabling a `<Fieldset>` disables everything inside it, arbitrarily deep, without threading a prop. `const FormDisabledCtx = createContext(false)`. `Fieldset` publishes: `<FormDisabledCtx value={disabled || inherited}>` where `inherited = useContext(FormDisabledCtx)` — note it *reads* the outer scope and *publishes* the merged value, composing like nested lexical scopes. Every `<Input>` reads `useContext(FormDisabledCtx)` and disables itself. Now `<Fieldset disabled><section><Fieldset><Input/></Fieldset></section></Fieldset>`: the inner Fieldset isn't disabled itself, but inherits true from the outer, publishes true, and the Input — three levels and two components away from the cause — renders disabled. The section in the middle declares nothing, forwards nothing, knows nothing. Compare the drilled version: `disabled` in every intermediate signature, and the merge logic (`disabled || parentDisabled`) re-implemented at each level by hand. This is context's home turf: a *scoped ambient fact* with tree-shaped inheritance — themes, locale, reading direction, form state, the current route's params, 'depth' in a nested comment thread. The scoping is the feature: two Fieldsets can disagree, and each subtree gets its own truth."
            },
            {
              "type": "code",
              "heading": "Context + reducer: the standard architecture for shared owned state",
              "lang": "jsx",
              "code": "// One owner, one machine (Lesson 1), published on two channels.\nconst TasksCtx = createContext(null);          // the data\nconst TasksDispatchCtx = createContext(null);  // the change-request channel\n\nfunction TasksProvider({ children }) {\n  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);\n  return (\n    <TasksCtx value={tasks}>\n      <TasksDispatchCtx value={dispatch}>\n        {children}\n      </TasksDispatchCtx>\n    </TasksCtx>\n  );\n}\n\n// Consumers pick the channel they need:\nfunction TaskList() {\n  const tasks = useContext(TasksCtx);           // re-renders on data change\n  …\n}\nfunction AddTaskButton() {\n  const dispatch = useContext(TasksDispatchCtx); // does NOT re-render on\n  return <button onClick={() =>                  // data change: dispatch's\n    dispatch({ type: 'ADD', text: draft })} …/>; // identity is stable\n}\n\n// WHY TWO CONTEXTS: propagation is per-context by value identity.\n// dispatch is stable across renders (useReducer guarantees it), so\n// TasksDispatchCtx never propagates — write-only components like\n// AddTaskButton stop re-rendering on every keystroke in every task.\n// One merged context value ({ tasks, dispatch }) would re-render them\n// all: the object is rebuilt each render, and consumers subscribe to\n// the WHOLE value (granularity clause). Same reasoning ⇒ if a merged\n// value is unavoidable, memoize it:\n//   const value = useMemo(() => ({ user, logout }), [user]);\n// An inline {{…}} in the provider JSX is a fresh identity every\n// render — every consumer re-renders even when nothing changed."
            },
            {
              "type": "text",
              "heading": "The re-render economics of context",
              "body": "Clause (2) of the semantics — propagation punctures bailouts — is what makes context design a performance topic and not just an ergonomics one. Work the economics. A context carrying `{ user, theme, notifications }` re-propagates to *every* consumer whenever *any* field's update gives the value a new identity — the toast counter ticking re-renders the theme-only header. Worse, the standard provider mistake — `<Ctx value={{ user, theme }}>` with an inline object — mints a fresh identity on *every provider render*, converting 'propagate on change' into 'propagate always': every consumer re-renders whenever the provider's own parent re-renders, changed data or not. The mitigations follow mechanically from the semantics: **memoize provider values** (stable identity when contents are stable); **split contexts by change-frequency** (fast-changing data must not share a channel with slow — theme and user in one context means theme consumers pay for user churn); **split read from write** (dispatch/setters are stable — write-only consumers should never re-render for data); and **keep high-frequency state out of context entirely** — a keystroke-frequency value in a wide-fanout context is an app-wide re-render per keypress; that job belongs to component state near the input, or to an external store with per-subscriber selection (Unit 8's useSyncExternalStore). Context is a *broadcast* medium; design what you broadcast the way you'd design a schema, by consumer and by change-rate."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Before reaching for context, try surgery on the tree.** Half of apparent prop-drilling dissolves under composition: if a layout component only forwards `user` to a deep `<Avatar>`, stop forwarding — accept `children` (or a slot prop) and let the component that OWNS user render the Avatar itself: <Layout sidebar={<Profile user={user}/>}>. The intermediate never sees user; no context needed; and the technique doubles as a performance tool (Unit 7's children-as-props bailout). Context earns its complexity for genuinely ambient, wide-fanout, slow-changing facts — theme, locale, auth, form scope. If exactly one distant consumer needs the value, composition is the smaller hammer; if a dozen scattered consumers do, context is honest. 'I'm tired of typing this prop' is a reason to restructure, not to make a value ambient."
            },
            {
              "type": "example",
              "heading": "Worked example: diagnosing an app-wide keystroke re-render",
              "body": "Symptom: typing in a search box janks the whole app; the profiler shows every component re-rendering per keystroke. Structure: `<AppCtx value={{ user, theme, search, setSearch }}>` at the root; the search box reads/writes via context. Diagnose from the semantics, layer by layer. (1) `search` changes per keystroke → the provider re-renders → new inline value object → identity change → *every* AppCtx consumer re-renders (granularity: whole-value subscription), including components that only read theme. (2) Memoizing the value (`useMemo(..., [user, theme, search])`) helps nothing here — search *did* change; the propagation is 'legitimate' per the semantics. The disease is schema-level: keystroke-frequency state sharing a broadcast channel with app-wide slow state. The cure sequence: **colocate** — search text's readers are the box and the results list; it is not ambient truth, so move it to their common parent as plain state (Lesson 2's lifting rule: no higher than necessary), passed as props; keep `{ user, theme }` in context, memoized, now changing rarely; if other distant features truly need the *submitted* query (not each keystroke), publish the debounced/submitted value — different fact, different change-rate, honest channel. Result: keystrokes re-render two components; the context propagates on login and theme-toggle only. The general lesson: when a profiler shows broadcast-shaped damage, fix the *schema of what is broadcast*, not the subscribers."
            },
            {
              "type": "text",
              "heading": "Placing context in the toolbox",
              "body": "Close the unit by assembling the decision ladder for 'where does this fact live?', because the tools now compose. **Local state** (useState/useReducer in one component): the fact has one reader-writer — colocate; this is the default and should win ties. **Lifted state**: several components in one region share it — nearest common ancestor, props down, callbacks up; reshape into a reducer when transitions have rules (Lesson 1). **Lifted + context**: the sharing region is deep or wide enough that threading burdens bystanders — same owner, same reducer, but delivery via context (split read/write, memoized values); this changes *transport*, not *ownership* — the single source of truth still has one home. **External store + useSyncExternalStore** (Unit 8): the fact outlives the tree, is written outside React, or needs per-subscriber selection at high frequency. **Server cache** (Unit 9): the fact's truth lives on a server; what you hold is a cache with staleness rules, and pretending it is app state is how stale-data bugs are born. Note what is absent from the ladder: 'put it in a global store because several things read it' — reach for wider tools only when a *requirement* (lifetime, write-source, frequency, distance) forces the step. Every rung up trades locality and simplicity for reach; the craft is stopping at the lowest rung that satisfies the requirement."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Predict re-render behavior for each change, given: <UserCtx value={memoizedUser}> wrapping <ThemeCtx value={theme}> wrapping an app where Header reads both contexts, Sidebar reads UserCtx only, Editor (memoized with React.memo) reads ThemeCtx, and StatusBar reads neither. (a) theme toggles; (b) user updates; (c) the provider component's parent re-renders with nothing changed.",
                  "solution": "(a) ThemeCtx propagates: Header and Editor re-render — Editor DESPITE React.memo, because context propagation punctures memo bailouts (a consumer may never see stale context). Sidebar (UserCtx only) and StatusBar do not. (b) UserCtx propagates: Header and Sidebar re-render; Editor untouched (different channel); StatusBar no. (c) Both providers re-render as components, but their values keep identity (memoizedUser is memoized; theme unchanged): no propagation. StatusBar and other non-consumers re-render only if they are ordinary children of the re-rendering path WITHOUT bailouts — with children passed through as {children} from above the providers, the children elements are reference-equal and bail out (Unit 1's === skip). The exercise's point: context re-renders are computed per-channel from value identity, not from provider re-rendering.",
                  "hint": "Per change: which context's value changed identity? Consumers of that channel re-render — memo does not shield them."
                },
                {
                  "prompt": "A component library exposes <Tooltip> which needs the app's z-index scale, animation preferences, and portal target. The naive API takes all three as props on every Tooltip. Design the honest context architecture: how many contexts, what value shape, where memoized, and what the library does when no provider exists — justify each choice from the semantics.",
                  "solution": "One context, not three: the three facts change together (essentially never — a design-system configuration), so change-frequency splitting buys nothing; one ConfigCtx with value { zScale, motion, portalEl }. Provider: <UIConfigProvider value?> memoizes the merged config (useMemo keyed on the caller's overrides) so provider-parent re-renders don't propagate (identity stability). Default: createContext(DEFAULT_CONFIG) with sensible built-ins — the library works with zero setup because resolution falls back to the default when no provider encloses; document that the default portal target is document.body. Why not props: a dozen Tooltips across a deep tree with three drilled props each is the bystander-burden problem at its worst, and the config is genuinely ambient (subtree-scoped: a modal could publish a different portal target for its subtree — shadowing does the layering). The general rubric applied: ambient + wide-fanout + slow-changing + benefits-from-scoped-override = context's exact home turf.",
                  "hint": "Group facts by change-rate and consumer set, not by topic; defaults make the zero-config case work via resolution."
                },
                {
                  "prompt": "Your teammate replaces prop drilling of an onSelectRow callback (passed through Table → Body → Row) with a RowSelectCtx. Rows are memoized; there are 10,000 of them. The callback is recreated in the page component every render (inline arrow). Compare the two designs' re-render behavior per parent render, find the actual defect both share, and give the minimal fix.",
                  "solution": "Shared defect: the callback's identity changes every parent render (inline arrow). Drilled version: each Row's props include onSelectRow — new identity ⇒ all 10,000 memoized Rows fail their props comparison and re-render per parent render (memo defeated by an unstable prop, Unit 7's chain rule). Context version: the provider value (the arrow) changes identity every render ⇒ propagation to all 10,000 consumers — same damage through a different pipe, with the extra insult that memo can't even theoretically help (puncture rule). The transport was never the problem: the IDENTITY was. Minimal fix: stabilize the callback — useCallback (or better, a stable dispatch from useReducer, which is guaranteed-stable and makes the whole question vanish) — after which BOTH designs stop re-rendering rows, and the choice between them returns to ergonomics: context wins if many row-adjacent components need it; drilling through two well-known components is otherwise fine. Moral: identity stability is a prerequisite that transport choice cannot substitute for.",
                  "hint": "What changes identity per render in both designs? What do memo comparison and context propagation each do with that?"
                },
                {
                  "prompt": "Apply the placement ladder: for each fact, choose the rung (local / lifted / lifted+context / external store / server cache) and defend in one sentence: (a) which accordion panel is open on a settings page; (b) the current user's permissions, read by ~40 components; (c) unsent draft text in a chat composer; (d) live cursor positions of collaborators, 30 updates/sec, shown in 3 canvases; (e) the product catalog shown across routes.",
                  "solution": "(a) Lifted to the accordion parent — one region, few components, an exclusivity invariant owned by the collection's parent; context would be ceremony. (b) Lifted+context (auth provider, memoized, likely split from faster-changing session data) — ambient, wide-fanout, slow-changing: context's home case. (c) Local to the composer (or keyed local per conversation, Unit 2) — one reader-writer; lifting or storing it wider invites the leak/persistence confusion unless a requirement (drafts survive navigation) forces one rung up. (d) External store + useSyncExternalStore with per-subscriber selection — written by the network outside React at high frequency; context would broadcast 30×/sec to everything (the keystroke disease at 30Hz), while selective subscription re-renders only the 3 canvases. (e) Server cache (query library or equivalent) — the truth lives on the server; what the client holds is a cache with staleness/refetch policy, and modeling it as app state hides exactly the questions (stale-while-revalidate, invalidation) that matter.",
                  "hint": "For each: who writes it, who reads it, how fast does it change, and what must it outlive?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u4l3-i1",
              "front": "What is context, in one honest sentence — and what is it not?",
              "back": "Scoped dependency injection: an ancestor publishes a value, descendants read the NEAREST provider's copy (shadowing like lexical scope). It is not a store — no update protocol, no per-field subscription."
            },
            {
              "id": "u4l3-i2",
              "front": "When does a context propagate, and to whom?",
              "back": "When the provided value's identity changes (Object.is): every consumer beneath that provider re-renders — puncturing memo/bailouts by design."
            },
            {
              "id": "u4l3-i3",
              "front": "Why is an inline object in a provider's value slot a canonical bug?",
              "back": "Fresh identity every provider render ⇒ propagation on every parent re-render, changed or not — memoize the value or split contexts."
            },
            {
              "id": "u4l3-i4",
              "front": "Why split state and dispatch into separate contexts?",
              "back": "dispatch is identity-stable, so its channel never propagates — write-only consumers stop re-rendering on data changes; merged values re-render everyone (whole-value subscription)."
            },
            {
              "id": "u4l3-i5",
              "front": "What belongs in context, and what must be kept out?",
              "back": "Ambient, wide-fanout, slow-changing facts (theme, auth, locale, form scope). Keep out keystroke-frequency state — broadcast per keypress re-renders the world; colocate it or use a selective store."
            },
            {
              "id": "u4l3-i6",
              "front": "The state-placement ladder?",
              "back": "Local → lifted → lifted+context → external store (useSyncExternalStore) → server cache. Climb only when a requirement (distance, lifetime, write-source, frequency) forces it; stop at the lowest rung."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u4-check",
        "questions": [
          {
            "id": "u4q1",
            "type": "numeric",
            "prompt": "A checkout flow tracks state with 5 independent boolean flags. Its product spec distinguishes 7 legitimate situations. How many representable-but-impossible configurations does the flag model carry? (Number only.)",
            "answer": 25,
            "explanation": "2⁵ = 32 representable minus 7 legal = 25 impossible configurations — each constructible by some interleaving of setters and each an obligation on every consumer. A status enum of 7 tags (with payload) represents exactly the legal set; the 25 landmines become unconstructible.",
            "points": 1
          },
          {
            "id": "u4q2",
            "type": "short",
            "prompt": "Fill in the design principle: rather than defending against illegal state combinations in every consumer, reshape the state to make illegal states ______.",
            "accept": [
              "unrepresentable",
              "not representable",
              "impossible to represent",
              "unconstructible",
              "inexpressible"
            ],
            "explanation": "Minsky's principle: move the proof obligation from every consumer into the type/shape itself — one discriminated status value instead of independent flags. What cannot be constructed cannot be reached by any interleaving, race, or forgotten write.",
            "points": 1
          },
          {
            "id": "u4q3",
            "type": "mcq",
            "prompt": "A component stores const [selected, setSelected] = useState(null) holding a full copy of the selected row object from a list that users can edit. What is the defect class, and the canonical fix?",
            "options": [
              "Impossible state — fix with a reducer that guards illegal transitions",
              "Duplicated fact — store selectedId and derive the object from the list in render, so edits and deletions flow through automatically",
              "Prop mirroring — rename the state to initialSelected and reset with a key",
              "Missing memoization — wrap the selection in useMemo keyed on the list"
            ],
            "answer": 1,
            "explanation": "The selected entity now has two homes: the list and the copy — edit the list and the copy renders stale. Store the id (one home for the entity, one for the selection fact) and derive: items.find(i => i.id === selectedId) ?? null. The other options name real patterns that don't apply: no transition rules are violated, no prop is being mirrored, and memoization caches a derivation but this bug is about a STORED copy that no cache invalidates.",
            "points": 1
          },
          {
            "id": "u4q4",
            "type": "multi",
            "prompt": "Which statements about context semantics are TRUE? (Select all that apply.)",
            "options": [
              "useContext resolves to the nearest enclosing provider, falling back to the createContext default when none exists",
              "React.memo on a consumer prevents it from re-rendering when the context value changes",
              "A provider passing an inline object literal as value causes all consumers to re-render whenever the provider re-renders",
              "Consumers re-render only when the specific fields of the context value they read have changed",
              "A stable dispatch function published on its own context never causes propagation re-renders"
            ],
            "answer": [
              0,
              2,
              4
            ],
            "explanation": "(a) True — resolution is nearest-provider with default fallback, shadowing like lexical scope. (c) True — a fresh object identity per render makes propagation unconditional. (e) True — useReducer's dispatch is identity-stable, so its channel never propagates; that's exactly why read/write context splitting works. (b) False — context propagation punctures memo by design; a consumer must never render against stale context. (d) False — subscription granularity is the whole value; per-field subscription requires splitting contexts.",
            "points": 2
          },
          {
            "id": "u4q5",
            "type": "proof",
            "prompt": "Prove clause (1) of the stored-derivation proposition and its constructive counterpart: (i) if a derived fact D = g(S) is stored as its own state cell with k independent update sites for S, the omission of the D-write at any single site produces a reachable committed frame where the UI renders D ≠ g(S); (ii) if D is instead computed in the component body, no committed frame can render D ≠ g(S). Ground (ii) in the snapshot model.",
            "rubric": [
              "(i) constructs the failure: a site updates S from s to s′ with g(s) ≠ g(s′) while omitting the D-write, so the next snapshot commits (s′, g(s)) and renders inconsistently — noting reachability needs only that site to execute",
              "Argues the obligation is global: whether a site 'affects D' depends on g and all other sites, so no local review verifies the invariant — k sites = k standing obligations that grow with the code, not the requirements",
              "(ii) argues correctness by construction: render t computes D = g(S_t) from the frozen snapshot; since D is recomputed every render and never persisted, every committed frame renders (S_t, g(S_t)) — the inconsistency class is absent, not handled",
              "Invokes the snapshot model correctly (per-render constant S_t gives within-frame consistency) and states the legitimate exceptions: expensive g ⇒ memoize (cache, not state); async/effectful g ⇒ genuinely new state needing input-tagging"
            ],
            "solution": "(i) Let site i update S: setS(s′) with g(s) ≠ g(s′), omitting setD. The batch commits snapshot (S = s′, D = g(s)) — by Unit 3's queue semantics both cells fold independently and D's queue is empty, so its committed value is unchanged. The next render reads both cells and renders D's stale value beside S's new one: an observable inconsistency, reachable whenever site i runs. Globality: 'site i must also write D' is a property of g's dependence on the fields site i touches AND of every other site's compensating writes; verifying it requires whole-program knowledge, so each of the k sites carries a standing, unverifiable-locally obligation — the failure probability compounds with sites added over time. (ii) With D computed in the body, render t evaluates D_t = g(S_t) where S_t is the per-render constant snapshot (Unit 3's proposition): within the frame, S cannot change under the computation, so the committed frame renders the pair (S_t, g(S_t)) — consistency holds in every frame by construction, and there is no cache to invalidate because nothing persists between renders. Exceptions that prove the rule: if g is expensive, useMemo caches with automatic input-keyed invalidation (a transparent cache, not a second home for the fact); if g is asynchronous/effectful, D is not a derivation — it is new state (a cached remote fact) and must be tagged with the inputs it answers for so staleness is detectable. ∎",
            "explanation": "This is the unit's core economic argument: stored derivations convert a rendering computation into a distributed-systems invariant maintained by hand. The proof should make the asymmetry stark — k growing obligations versus zero, purchased by the declarative pipeline you already pay for.",
            "points": 3
          },
          {
            "id": "u4q6",
            "type": "open",
            "prompt": "Design review, full answer required: a collaborative document app currently has — (1) doc content in a root context whose value is rebuilt inline: <DocCtx value={{doc, setDoc, selection, setSelection}}>; selection updates on every cursor move; (2) each CommentThread stores a copy of its anchor text 'so it survives edits'; (3) presence (who's online) polled into component state in the toolbar AND independently in the sidebar; (4) a per-user draft comment box that loses its text when switching between threads. Deliver: the defect class and mechanism for each, the corrected architecture (state shape, owners, transport), and the placement-ladder justification for every fact.",
            "rubric": [
              "(1) Diagnoses broadcast-schema failure: cursor-frequency selection sharing a channel with slow doc data + inline value identity ⇒ app-wide re-render per cursor move; fixes by splitting channels (doc vs selection vs dispatch), memoizing values, and keeping selection near its consumers (or selective store) — justified by change-rate",
              "(2) Diagnoses duplicated fact: the anchor copy drifts from the edited doc; fix stores anchor as a position/id reference deriving text from the doc, with explicit handling of anchor invalidation (deleted range) — single source of truth with graceful degradation",
              "(3) Diagnoses two homes for one remote fact + duplicated polling; fix: one owner (provider or external store/server-cache layer) publishing presence, both consumers subscribing — one poll, one truth",
              "(4) Diagnoses state identity/lifetime mismatch (Unit 2): drafts keyed to a component instance that unmounts on thread switch; fix: key gives per-thread isolation, but persistence across switches requires lifting drafts[threadId] to an owner outliving the switcher; distinguishes isolation from persistence",
              "Applies the placement ladder explicitly per fact (local/lifted/context/store/server-cache) with requirement-based justification, not tool preference"
            ],
            "solution": "(1) Two compounding defects: schema (selection changes at cursor frequency, doc changes at edit frequency — different facts, different rates, one broadcast channel) and identity (inline object value ⇒ fresh identity per provider render ⇒ unconditional propagation). Corrected: DocCtx (doc only, memoized), DocDispatchCtx (stable dispatch from a doc reducer — read/write split), and selection OUT of context: its readers are the editor surface and maybe a status bar — colocate at their common parent, or an external store with selective subscription if canvases elsewhere need it. Ladder: doc = lifted+context (wide, slow); selection = lifted local (narrow, fast). (2) The anchor copy is a stored fact with two homes; edits to the doc leave the copy stale ('survives edits' is the bug described as a feature — it renders text the doc no longer contains). Store {threadId, anchorRange} (position reference), derive the anchor text from the doc in render; when the range is invalidated by an edit (deleted span), derive a tombstone state ('original text removed') — the degradation is designed once at the derivation, not scattered. Ladder: anchor ref = part of thread entities (server cache or doc store); anchor TEXT = derivation, no home at all. (3) Presence is one remote fact with two pollers — double network cost and disagreeing UIs (one polls faster). One owner: a PresenceProvider (context; presence is wide-fanout and slow, seconds-scale) or the app's server-cache layer with a shared query key — toolbar and sidebar both subscribe to the single subscription. Ladder: server-cache/external store (truth lives outside; written by network). (4) The draft dies because it lives in a component whose instance is destroyed on thread switch (address change, Unit 2). Per-thread isolation: key={threadId} on the composer (prevents leaks across threads). Persistence across switches: lift drafts to drafts[threadId] owned by the thread-switcher's ancestor, composer initialized from it and writing back — key for isolation, lifting for persistence; both, because the requirements name both. Ladder: lifted (region = the thread panel; no ambient consumers ⇒ no context).",
            "explanation": "Four archetypal misplacements in one app: broadcast-schema abuse, duplicated derived fact, twice-homed remote fact, and lifetime-mismatched local state. The grader wants mechanism-level diagnosis (identity, change-rate, addressing) and ladder-justified placement — not tool names.",
            "points": 4
          }
        ]
      }
    },
    {
      "id": "u5",
      "title": "Hooks: Contract and Machinery",
      "summary": "Why hooks are positional state cells, the theorem that makes the Rules of Hooks necessary rather than stylistic, a working useState built from scratch, and custom hooks as logic-sharing without state-sharing.",
      "references": [
        "React RFC #68 — Hooks (2018), including the motivation and 'why not keys' discussion",
        "react.dev — Rules of Hooks; Reusing Logic with Custom Hooks",
        "Dan Abramov — 'Why Do Hooks Rely on Call Order?' (overreacted.io, 2018)",
        "Rodrigo Pombo — 'Build your own React' (pomb.us, 2019) — the hooks/fiber reconstruction",
        "facebook/react source — ReactFiberHooks.js (memoizedState as a linked list of hook cells)"
      ],
      "prerequisites": [
        "u4"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u5l1",
          "title": "The Rules of Hooks Are a Theorem",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The puzzle hooks must solve",
              "body": "Units 1–4 used `useState` freely while deferring an obvious question: *how does React know which state you mean?* A component function calls `useState(0)` — a plain function call, carrying no name, no key, no identifier of any kind. Yet across thousands of renders, the first call always gets the count and the second always gets the flag; they never swap. The component function itself cannot be the storage (its locals die per invocation — Unit 3), so the state lives in the instance (the fiber, Unit 2). The association problem is therefore: given a bare call `useState(init)` executing inside some component invocation, which of the instance's stored cells does it bind to? React's answer is the simplest one that could possibly work: **call order**. The instance stores a sequence of cells; each render resets a cursor; the i-th hook call binds to the i-th cell. No names, no keys, no registration — and one obligation in exchange: *the sequence of hook calls must be identical on every render of the component*. That obligation is exactly the Rules of Hooks ('only call hooks at the top level; don't call hooks inside conditions, loops after early returns'), and this lesson's job is to show the rules are not style guidance but the *unique correctness condition* of positional storage — a theorem with a two-line proof and vivid counterexamples."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Positional hook storage",
              "statement": "For each component instance, React maintains an ordered sequence of **hook cells** ⟨c₁, c₂, …, cₘ⟩ (in the implementation, a linked list on the fiber's memoizedState). Each cell holds one hook's persistent data: a state value and its update queue (useState/useReducer), a memoized value and its deps (useMemo), an effect record (useEffect), a mutable box (useRef). During a render, a **cursor** starts at 1; the k-th hook call of that invocation reads and advances the cursor, binding to cell cₖ — on the mount render it *creates* cₖ (initializing from its arguments), on updates it *reuses* cₖ (and, for useState, ignores the initializer argument entirely). The binding is purely ordinal: nothing about the call — its variable name, source position, or hook type — participates in the association beyond a dev-mode type sanity check."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Stable call order is necessary and sufficient",
              "statement": "Under positional storage: (1) **Sufficiency** — if every render of a component performs the same sequence of hook calls (same length, same hook types, same order), then every call binds to the same cell on every render, and each hook's persistent identity is preserved for the instance's lifetime. (2) **Necessity** — if any render omits, adds, or reorders a hook call relative to the mount render, then some call binds to a cell created by a *different* hook call, and from that point every subsequent call in the render is misbound; state is silently read by the wrong hook (or the sequence length mismatches and React must fail). No implementation of anonymous positional storage can avoid this — the call sequence is the only identity information available.",
              "proof": "(1) By induction on call index k: the cursor is a deterministic function of the number of prior hook calls in the current invocation; if that count is equal across renders for every prefix (same sequence), call k lands on cursor value k and binds cₖ — the same cell each render. Cell contents evolve only through their own hook's operations, so identity persists. (2) Suppose render t performs the mount sequence except hook call j is skipped (a conditional went the other way). Calls 1…j−1 bind c₁…cⱼ₋₁ correctly. The call that was (j+1)-th at mount is j-th now: it binds cⱼ — a cell created by a different hook, holding that hook's state (and possibly a different hook type: useState reading an effect record). Every later call is likewise off by one. The corruption is *silent* where types coincide: a useState reads another useState's value — plausible garbage, no exception. React therefore prefers loud failure: it records the mount sequence's hook types in development and throws 'change in the order of Hooks' / 'Rendered fewer hooks than expected' on mismatch — turning a silent misbinding into a crash. The final clause: any scheme with no per-call identity (no names/keys) has exactly the call sequence as input; two different sequences over the same cells cannot be consistently aligned in general (a skipped call is indistinguishable from a shifted one) — misbinding is information-theoretically forced, not an implementation defect. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: one conditional hook, traced to the wreckage",
              "body": "`function Form({ isPro }) {`\n`  const [name, setName] = useState('');          // call 1 → c₁`\n`  if (isPro) { const [plan, setPlan] = useState('gold'); }  // call 2 → c₂ (mount had isPro=true)`\n`  const [email, setEmail] = useState('');        // call 3 → c₃`\n`  const theme = useContext(ThemeCtx);            // call 4 → c₄ …`\n\nMount with isPro=true: cells created ⟨name:'', plan:'gold', email:'', theme-record⟩. Now a re-render with isPro=false. Call 1 binds c₁ (name — fine). The `email` useState is now call 2: it binds **c₂ and reads 'gold'** — your email field renders a subscription plan. useContext is call 3: it binds c₃, a useState cell — different hook type; in development React throws the order-mismatch error naming both sequences; the render dies. Study which failure you got where: same-type misbinding (email←plan) is *silent* — the theorem's scariest branch, plausible values flowing to the wrong variables; cross-type misbinding is *loud* only because React deliberately records types to convert it to a crash. And note what did NOT cause the problem: nothing about isPro's value is illegal — the crime is that the *call sequence depends on it*. The mechanical fix is always the same shape: call the hook unconditionally, condition the *use* of its value — `const [plan, setPlan] = useState('gold'); const effectivePlan = isPro ? plan : null;` Hooks unconditional, logic conditional."
            },
            {
              "type": "code",
              "heading": "Every rule, derived from the cursor",
              "lang": "jsx",
              "code": "// RULE: top level only — each is a way to change the call sequence.\n\nif (cond) { useState(0); }        // ✗ sequence length varies with cond\nfor (const x of xs) useRef(x);     // ✗ length varies with xs.length\nif (loading) return <Spinner/>;    // ✗ early return SKIPS every hook\nconst [a] = useState(0);           //   below it — same crime, sneakier:\n                                   //   put ALL hooks above any return.\ncond && useEffect(fn);             // ✗ same as if\nconst use = cond ? useMemo : useRef; use(…) // ✗ type mismatch too\n\n// RULE: only from React functions (components / custom hooks) —\n// the cursor exists only while React renders an instance:\nsetTimeout(() => {\n  const [x] = useState(0);         // ✗ no current fiber, no cursor —\n}, 1000);                          //   throws 'invalid hook call'\nonClick={() => useState(0)}        // ✗ handlers run post-render\n\nclass Store { init() { useState(0) } } // ✗ not a render context\n\n// FINE — not violations, because the SEQUENCE is unchanged:\nconst [items] = useState([]);\nconst rows = items.map(i => <Row key={i.id}/>);  // loop over JSX, no hooks in it\nconst label = cond ? 'A' : 'B';                   // conditional VALUES, always fine\nuseEffect(() => { if (cond) doWork(); }, [cond]); // condition INSIDE the hook —\n                                                  // the call itself is unconditional\n// The invariant, one line: the number and order of use* calls must be\n// a constant of the component, independent of props, state, and time."
            },
            {
              "type": "text",
              "heading": "Why not names? The design space, honestly",
              "body": "The obvious alternative — `useState('count', 0)` with string keys — was considered and rejected in the Hooks RFC, and walking the rejection teaches more than the rule. **Keys reintroduce the collision problem**: two hooks in one component (or two copies of one custom hook! — Lesson 3's crux) using the key 'value' silently share a cell — the misbinding bug returns wearing a name badge, *and* it now crosses abstraction boundaries: a custom hook's internal key choices become its API, and composing two hooks written by strangers becomes unsafe. Positional storage makes each *call site* its own namespace for free — call `useToggle()` twice and the two invocations occupy disjoint cursor ranges; isolation is structural. **The diff-with-defaults idea** (keys with auto-generated fallbacks) founders on minification and code motion. **Compiler-assigned identity** (a build step stamping each call site) is workable — but it is just positional storage computed at build time, with a mandatory toolchain; React chose the runtime cursor plus a lint rule instead, keeping hooks a language-level pattern. The real cost of the choice is the rules' *unfamiliarity*: functions that must be called unconditionally are rare in JavaScript. The real payoff is that hook composition is **associative and anonymous**: any hook can call any hooks, nested arbitrarily, and the flattened call sequence — which is all React sees — remains a constant of the component. The rules are the entire price of that composability; the eslint-plugin-react-hooks rule enforces them statically, and you should treat its findings as type errors, not suggestions."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**How the linter proves what it proves.** eslint-plugin-react-hooks checks a syntactic overapproximation of the theorem's hypothesis: every use*-named call must be unconditionally reachable at the top level of a component or custom hook — no ifs, loops, nested functions, or code after early returns. Syntactic means conservative: a condition that is provably constant (if (true)) still errors, and dynamic violations the parser can't see (calling a hook via an alias not named use*) can slip through. The contract is honest: the linter certifies 'sequence is constant' for code it can see, shaped how it expects. Renaming hooks to dodge the plugin doesn't beat the theorem — it just removes your proof."
            },
            {
              "type": "example",
              "heading": "Worked example: the early return that corrupts nothing — until it does",
              "body": "A component reads: `const [user] = useState(null); if (!user) return <Login/>; const [tab, setTab] = useState('home'); …` On every render so far, user has been null — the second useState has *never executed*. The app works. Now login succeeds: user becomes non-null, the render proceeds past the guard, and the `tab` useState executes for the first time — as call 2 on a fiber whose mount sequence had length 1. React throws 'Rendered more hooks than during the previous render'. The bug was present from day one; it detonated only when the condition changed — which is the practical danger of sequence violations: they lurk behind the *untaken* branch, pass every test that doesn't cross the branch, and fire in production on the first user who does. This is also why the fix must be structural, not situational: move every hook above every return (`const [user] = useState(null); const [tab, setTab] = useState('home'); if (!user) return <Login/>; …`) — unconditionally paying the (trivial) cost of the tab cell even when logged out — or split components so the guard lives in a parent and the hooks live in a child that only mounts when rendered ({user ? <Home/> : <Login/>} — the child's sequence is constant *for its own instance*, and mounting/unmounting whole instances is always legal; Unit 2). The second form is the idiomatic one: conditional *rendering* of components is the sanctioned way to make hooks conditional."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Mount render executes: useState('a') [c₁], useState('b') [c₂], useRef(r) [c₃], useState('d') [c₄]. A later render skips the useRef (it was inside if (debug)). Trace exactly what each call binds to, what value each receives, and where (if anywhere) React detects the problem in development.",
                  "solution": "Call 1: useState → c₁, reads 'a' — correct. Call 2: useState → c₂, reads 'b' — correct. Call 3 is now useState('d') → binds c₃, which is a REF cell: hook-type mismatch — in development React compares the recorded mount types (useState, useState, useRef, useState) against the current sequence and throws the order-change error at this call, printing both lists. Had c₃ been a useState cell instead (same types), the call would silently read the WRONG state and the sequence would end one short — 'Rendered fewer hooks than expected' at the end of the render. Either way the render never commits; but note the silent variant only crashes at the LENGTH check — the misbound reads themselves produced no error.",
                  "hint": "Advance the cursor call by call; compare each cell's recorded hook type with the caller's type."
                },
                {
                  "prompt": "Explain why calling a component directly — {Header({user})} instead of <Header user={user}/> — breaks hooks, using the positional-storage definition. What exactly happens to Header's useState calls, and why does the same code work fine as JSX?",
                  "solution": "Direct invocation runs Header's body during the CALLER's render, with no fiber of its own: React's cursor is currently pointing at the caller's cell sequence, so Header's useState calls advance the CALLER's cursor and bind the caller's cells — Header's 'state' is spliced into the parent's sequence. Consequences: the parent's own subsequent hooks shift and misbind (order corruption), and Header's state has no independent identity — it resets or collides according to the parent's structure, and conditional rendering of Header({...}) varies the parent's sequence length (the theorem's necessity branch fires). As <Header/>, React creates a child fiber: Header renders with its OWN cursor over its OWN cells — the element/instance machinery of Units 1–2 is precisely what scopes positional storage per component. 'Components are called by React, not by you' is thus a hooks-correctness rule, not etiquette.",
                  "hint": "Whose cursor is active when the body runs? Where do the cells land?"
                },
                {
                  "prompt": "A code generator emits components whose hook count depends on a config file read at build time (stable at runtime). A reviewer flags 'hooks in a loop'. The author replies: 'the loop bounds are constant at runtime, so the sequence is stable.' Adjudicate with the theorem: is the code correct? Is it lintable? What would you require to approve it?",
                  "solution": "The theorem's hypothesis is 'same sequence on every render of the instance' — it does NOT require the sequence be syntactically loop-free. If the loop bound is genuinely constant for the component's lifetime (config frozen at build, not per-render data), every render performs identical calls: correct by sufficiency. But the linter cannot prove it (syntactic overapproximation — loops are categorically flagged), so approval requires replacing the linter's proof with a human/structural one: (1) demonstrate the bound cannot vary at runtime (const import, not props/state); (2) suppress the rule LOCALLY with a comment citing the invariant; (3) prefer restructuring that restores lintability — hoist the loop to generate an array of child components (<Cell key={i}/> each with its own fixed hooks), which moves variability from the hook sequence to the instance tree, where variability is legal. (3) is usually the right call: it converts a hand-maintained proof into a structural guarantee.",
                  "hint": "Separate 'violates the theorem' from 'violates the linter's approximation of it' — then ask which proof survives maintenance."
                },
                {
                  "prompt": "Design probe: propose an alternative hooks system where each call passes an explicit unique key — useState('form.email', ''). Give (a) the collision failure that returns, (b) the composition failure custom hooks develop, and (c) why positional storage gets call-site isolation for free.",
                  "solution": "(a) Two calls sharing 'form.email' (copy-paste, merge conflict) silently alias one cell — the misbinding bug without any conditional; and unlike order violations, no runtime check can distinguish intentional sharing from collision, so it can't even crash helpfully. (b) A custom hook's internal keys join the global namespace: two instances of useForm() in one component collide with EACH OTHER ('form.email' twice), so hook authors must namespace by instance — which requires callers to pass unique prefixes — which makes composition manual and leaks implementation details into every API (the RFC's core objection). (c) Positionally, each call occupies its own cursor slot: two useForm() calls consume disjoint index ranges automatically, because indices are allocated by execution order, not by author-chosen names — isolation is a structural consequence of counting, with zero API surface. The trade: names buy conditional freedom and cost collision/composition; positions buy free isolation and cost the Rules. React chose the side where the failure mode is a lintable crash rather than silent aliasing.",
                  "hint": "Who allocates identity in each scheme, and what happens when two allocations agree by accident?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u5l1-i1",
              "front": "How does React associate a useState call with its stored cell?",
              "back": "Positionally: the instance holds an ordered cell list; a cursor resets each render, and the k-th hook call binds the k-th cell. No names, no keys — call order is the only identity."
            },
            {
              "id": "u5l1-i2",
              "front": "State the Rules-of-Hooks theorem.",
              "back": "Stable call sequence (same length, types, order every render) is necessary AND sufficient for correct cell binding — any skip/add/reorder misbinds every subsequent hook, silently where types coincide."
            },
            {
              "id": "u5l1-i3",
              "front": "Why is an early return above hooks a violation, and the idiomatic fix?",
              "back": "It skips every hook below it, shortening the sequence. Fix: all hooks above all returns — or split the guarded branch into a child component (conditional mounting of instances is always legal)."
            },
            {
              "id": "u5l1-i4",
              "front": "Why did React reject string keys for hooks?",
              "back": "Keys reintroduce collisions and break custom-hook composition (internal keys become global API); positions give every call site free isolation — at the price of the Rules."
            },
            {
              "id": "u5l1-i5",
              "front": "Why does calling a component as a function — Header(props) — break hooks?",
              "back": "Its hooks execute against the CALLER's cursor and cells (no child fiber is created) — state splices into the parent's sequence, corrupting both components' bindings."
            },
            {
              "id": "u5l1-i6",
              "front": "What is conditional-but-legal with hooks?",
              "back": "Everything except the call itself: conditional values, conditions inside effect/memo bodies, conditional rendering of child components. The use* call count/order must be a constant of the component."
            }
          ]
        },
        {
          "id": "u5l2",
          "title": "Build useState From Scratch",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Sixty lines that demystify the magic",
              "body": "Nothing consolidates the last four units like building the machine. In this lesson we implement a miniature React — element rendering stripped to the bone, plus a faithful `useState` — in about sixty lines, and then watch every behavior you've learned *fall out of the implementation*: per-render snapshots, the update queue fold, positional binding, the order-violation crash, batching. The point is not to ship a framework; it is that afterwards, questions like 'why does the initializer only run once?' or 'what exactly does the setter close over?' stop being trivia and become things you can answer by pointing at a line. We make three simplifications that don't change the semantics under study: one component instance (a single global cell array instead of per-fiber lists), synchronous re-render on set (real React schedules; we call render directly at batch end), and no reconciliation (we redraw wholesale — Unit 2 taught what real commit does instead). Everything else — the cursor, the cells, the queue, the closure structure — mirrors the real ReactFiberHooks design closely enough that reading React's source afterwards feels like meeting an old friend wearing a bigger coat."
            },
            {
              "type": "code",
              "heading": "mini-react.js — cells, cursor, queue, render loop",
              "lang": "jsx",
              "code": "// ---- the instance's persistent storage (real React: per-fiber\n// linked list on fiber.memoizedState; ours: one global array) ----\nlet cells = [];        // cells[i] = { state, queue }  — one per hook call\nlet cursor = 0;        // resets every render; advances per hook call\nlet Component = null;  // the function we re-invoke\nlet rerenderScheduled = false;\n\nexport function useState(initial) {\n  const i = cursor++;                    // ← POSITIONAL BINDING: this call's\n  if (cells[i] === undefined) {          //   identity is 'I was call #i'\n    cells[i] = {                         // MOUNT: create the cell —\n      state: typeof initial === 'function' ? initial() : initial,\n      queue: [],                         //   initializer runs ONCE, here,\n    };                                   //   because this branch never\n  }                                      //   runs again for cell i\n  const cell = cells[i];\n\n  // UPDATE: fold the pending queue into the snapshot (Unit 3's fold)\n  for (const u of cell.queue) {\n    cell.state = typeof u === 'function' ? u(cell.state) : u;\n  }\n  cell.queue = [];\n\n  const setState = (update) => {         // the setter CLOSES OVER cell —\n    cell.queue.push(update);             // not over `state`! It enqueues\n    scheduleRerender();                  // and schedules; it never touches\n  };                                     // the current render's constants.\n  return [cell.state, setState];\n}\n\nfunction scheduleRerender() {\n  if (rerenderScheduled) return;         // ← BATCHING: n set calls in one\n  rerenderScheduled = true;              //   tick = one render, because the\n  queueMicrotask(() => {                 //   microtask runs after the whole\n    rerenderScheduled = false;           //   handler finished enqueueing\n    render(Component);\n  });\n}\n\nexport function render(Comp) {\n  Component = Comp;\n  cursor = 0;                            // ← the cursor reset that makes\n  const tree = Comp();                   //   'k-th call → k-th cell' true\n  draw(tree);                            // (real React: reconcile + commit)\n  return tree;\n}"
            },
            {
              "type": "example",
              "heading": "Worked example: running the machine by hand",
              "body": "`function Counter() { const [n, setN] = useState(0); const [label] = useState('clicks'); return `${label}: ${n}`; }`\n\n**render #1**: cursor←0. Call 1: i=0, cells[0] undefined → create {state:0, queue:[]}; fold empty; return [0, set₀] where set₀ closes over cells[0]. Call 2: i=1 → create {state:'clicks'}; return ['clicks', set₁]. Output 'clicks: 0'. **Handler fires** `setN(n+1); setN(n+1)` — n is this render's constant 0 (the setter never reads it), so two pushes of the *value* 1 land in cells[0].queue = [1, 1]; two schedule calls, one microtask (flag). **render #2**: cursor←0. Call 1: i=0, cell exists (initializer skipped — the `0` argument is dead weight now); fold [1,1]: state←1, ←1 → 1. Return [1, set₀′]. Call 2: i=1 → 'clicks'. Output 'clicks: 1'. Now re-run the handler as `setN(x => x+1); setN(x => x+1)`: queue holds two *functions*; the fold applies them cumulatively — 1→2→3. Every Unit-3 behavior just executed in front of you: the +1-not-+2 replace collapse, the updater composition, one render per batch. And notice *where the snapshot lives*: `n` is a plain const in Counter's stack frame, created from cell.state at call time — the 'per-render constant' is literally a local variable; the machinery never mutates it because nothing ever could."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The mini-machine is a faithful model",
              "statement": "The sixty-line implementation satisfies the three semantic laws established in Units 3 and 5 for any component honoring the Rules of Hooks: (1) **Snapshot law** — within one render, every state variable is a constant equal to its cell's post-fold value at cursor time, and no later setter call can alter it. (2) **Fold law** — the state delivered by render t+1 equals the left-fold of the updates enqueued since render t over the state delivered at render t, with values acting as replace and functions as updaters. (3) **Binding law** — under a stable call sequence, the k-th hook call of every render reads and writes the same cell cₖ.",
              "proof": "(1) The returned state is `cell.state` copied into the caller's local binding at cursor time; the only code paths that write `cell.state` are the fold loop (runs before the copy, within the same call) and nothing else — `setState` only pushes into `cell.queue`. A JavaScript local captured by value cannot be altered by subsequent pushes, so the binding is constant for the render. (2) `setState` appends each update to `cell.queue` in call order; the next render's fold loop iterates that queue in order, applying `u(cell.state)` for functions and assignment for values — literally the left-fold step function of Unit 3's definition, with the previous render's delivered state as the base (it was `cell.state` when the render copied it out, and no other writer intervenes). (3) `cursor` is reset to 0 at the top of `render` and incremented exactly once per hook call, so the k-th call computes index k−1 on every render; with a stable call sequence, index k−1 always addresses the same slot of `cells`, which is created once and never moved. Hence the toy differs from production React only in scope (one instance, no reconciliation, microtask scheduling) — not in the semantics under study. ∎"
            },
            {
              "type": "text",
              "heading": "Reading the implementation as a proof witness",
              "body": "Each mysterious rule from earlier units is now a visible line. **Why does the initializer run only once?** Because `cells[i] === undefined` is true exactly once per slot — the lazy-initializer feature (`useState(() => expensive())`) is one typeof check exploiting that branch; passing `expensive()` directly means *you* evaluate it every render and the machine discards it. **Why must call order be stable?** The binding `const i = cursor++` uses nothing but arrival order — run Lesson 1's conditional-hook example against this code and watch `label` read the count cell; the crash React adds is a type-tag check this mini version omits, which is precisely why *its* corruption is silent. **What does the setter capture?** `cell` — the persistent box — not the state value; that one closure choice is why setters from any render, however old, enqueue into the live cell (stale-closure bugs are about *reading* state variables, never about setters going stale — setter identity is stable across renders in real React for the same reason: it's pinned to the cell). **Where is batching?** The microtask flag: five setter calls in one synchronous handler schedule one render, and React 18's 'automatic batching' is this exact flag moved from per-event to per-tick. **Where do snapshots come from?** cursor-time reads: state is copied out of the cell *during* the render; mutations between renders (queue pushes) never touch delivered values. The sixty lines are, in effect, executable statements of Unit 3's propositions."
            },
            {
              "type": "code",
              "heading": "Extending the machine: useRef and useEffect in twelve lines each",
              "lang": "jsx",
              "code": "// useRef: a cell with NO queue and NO re-render — just a stable box.\nexport function useRef(initial) {\n  const i = cursor++;\n  if (cells[i] === undefined) cells[i] = { current: initial };\n  return cells[i];            // same object every render — identity IS\n}                             // the feature; writing .current renders\n                              // nothing because nothing is scheduled.\n\n// useEffect: record now, run later — AFTER the tree is drawn.\nlet pendingEffects = [];\nexport function useEffect(fn, deps) {\n  const i = cursor++;\n  const prev = cells[i];\n  const changed = !prev || !deps ||\n    deps.some((d, k) => !Object.is(d, prev.deps[k]));\n  cells[i] = { deps, cleanup: prev?.cleanup };\n  if (changed) pendingEffects.push({ i, fn });   // NOT executed in render —\n}                                                // the purity contract, kept\n                                                 // by construction.\n// render() gains two lines after draw(tree):\n//   for (const { i, fn } of pendingEffects) {\n//     cells[i].cleanup?.();                    // cleanup before re-run\n//     cells[i].cleanup = fn() || undefined;    // run, store next cleanup\n//   }\n//   pendingEffects = [];\n// Note what fn is: a closure from THIS render — when it runs later, it\n// sees this render's constants. Unit 6's stale-closure story is already\n// sitting in this line, waiting."
            },
            {
              "type": "text",
              "heading": "From the toy to the real thing",
              "body": "Map each simplification back to production React and the picture completes. **Per-instance storage**: our global `cells` becomes a linked list hanging off each fiber's `memoizedState`; the cursor is a module-local `workInProgressHook` pointer that walks the list; 'reset the cursor' is 'point at the list head when beginning this fiber's render'. That is why hooks isolate per component *and* per instance — each fiber carries its own list (two `<Counter/>`s, two lists — Unit 2's independent-siblings fact is a data-structure fact). **Scheduling**: our microtask is React's scheduler with priority lanes (Unit 8); 'synchronous render at batch end' becomes 'schedule work at the update's lane priority', but the enqueue-then-fold shape is identical — you can read `dispatchSetState` in ReactFiberHooks.js and recognize every move: it enqueues an update object into a circular queue on the hook cell, bails out early if the folded value is Object.is-equal (Unit 3's no-op skip, implemented exactly as described), and schedules the fiber. **Double buffering**: real cells are duplicated across current/work-in-progress fibers so an interrupted render can be discarded without corrupting committed state (Unit 8) — our toy has no interruption, so one array suffices. Nothing in the production source contradicts the toy; it only adds trees, priorities, and error handling. This is the payoff of building it: React's most magical-seeming API is a cursor, an array of boxes, and a queue — machinery you have now held in your hands."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Interview-grade one-liners this lesson arms you with.** 'useState is a cursor over per-fiber cells; the setter closes over the cell, not the value — that's why setters never go stale but reads do.' 'The initializer runs once because cell creation happens once; the function form just defers evaluation into that branch.' 'Batching is a scheduled-flag: enqueue everywhere, fold once.' 'The Rules of Hooks are the cursor's correctness condition.' Each is checkable against sixty lines you can rewrite from memory — which is the difference between knowing the words and knowing the machine."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "In the mini implementation, predict what this component does across two renders, then verify by hand-tracing cells[] and cursor: function App(){ const [a, setA] = useState(1); const [b, setB] = useState(() => a * 10); return `${a},${b}`; } — first render, then after setA(5).",
                  "solution": "Render 1: call 1 → cells[0] = {state:1}; a=1. Call 2 → initializer is a FUNCTION, so cell creation calls it: a*10 closes over THIS render's a (=1) → cells[1] = {state:10}; b=10. Output '1,10'. setA(5): queue [5] on cells[0]. Render 2: call 1 folds → a=5. Call 2: cells[1] EXISTS — the initializer (and its closure over the new a) is never invoked; b stays 10. Output '5,10'. Lesson: initializers are mount-only, so deriving one state from another this way bakes in the mount value — if b must track a, b is a stored derivation (Unit 4: derive in render or reset identity with key). The trace also shows WHY: the `cells[i] === undefined` branch is the only site that reads `initial`.",
                  "hint": "Which branch of useState reads the initial argument, and how many times does that branch run per slot?"
                },
                {
                  "prompt": "Modify the mini useState so the setter bails out (schedules nothing) when the folded new state would be Object.is-equal to the current state — real React's no-op optimization. Identify the subtlety: why must the bailout compare AFTER folding the whole queue at render time rather than comparing each enqueued value at set time — give a two-update counterexample.",
                  "solution": "Naive set-time check: setState(u) { if (Object.is(u, cell.state)) return; … } — wrong twice over. Counterexample: state 0; handler calls set(1) then set(0). Set-time comparison: 1≠0 enqueue, then 0≠? — comparing against cell.state (still 0, unfolded!) skips the second update; the queue folds to 1, but the correct final state is 0 — you dropped a real update by comparing against a stale base. Also updaters can't be compared at all (their result depends on the accumulator). Correct: enqueue always; at render-time fold, compute next; if Object.is(next, prevCommitted) skip drawing (and in real React, potentially skip re-rendering children). Real React does a hybrid: an EAGER computation when the queue is empty (it can safely fold the single update immediately and skip scheduling if equal) — legal precisely because with an empty queue the base is current; the general case must wait for the fold. The principle: equality of a fold is a property of the whole queue, not of its elements.",
                  "hint": "Construct a queue whose elements each 'look like a change' or 'look like a no-op' at enqueue time but whose fold says otherwise."
                },
                {
                  "prompt": "Our useEffect stores one cleanup per cell and runs cleanup-then-effect for changed deps. Trace the connect/disconnect lifecycle it produces for: useEffect(() => { conn = connect(room); return () => conn.close(); }, [room]) across renders with room = 'a', 'a', 'b', then unmount (assume render() runs cleanups for all cells on unmount). Confirm it matches the synchronize/desynchronize story Unit 6 will tell.",
                  "solution": "Render 1 (room 'a'): no prev → changed; after draw: no prior cleanup; run effect → connect('a'), store cleanup₁ (closes over conn-a). Render 2 (room 'a'): deps [a] vs [a] — Object.is equal → unchanged; nothing queued; connection untouched (re-rendering ≠ resynchronizing). Render 3 (room 'b'): deps differ → queued; after draw: run cleanup₁ (close a), run effect → connect('b'), store cleanup₂. Unmount: run cleanup₂ (close b). Net trace: connect a · close a · connect b · close b — each connect paired with exactly one close, ordering cleanup-before-next-setup guaranteed by the run loop's two lines. This is the entire 'effects synchronize with external systems' model executing in miniature: deps define WHEN the synchronization is stale; the cleanup/setup pair defines HOW to move between synchronized states.",
                  "hint": "Walk the changed-check per render, then the post-draw loop: cleanup slot, then fn, then store the returned closer."
                },
                {
                  "prompt": "A colleague inspects the mini code and objects: 'the setter pushes into cell.queue but render() reads cells by cursor — if a component's hook order changed between the enqueue and the next render, the queue would be applied to the wrong state.' Assess: is this a NEW hazard the toy introduces, or the same order-violation from Lesson 1 — and what does the answer teach about where update queues live in real React?",
                  "solution": "Same hazard, no new one — and the trace shows why: the setter closes over the CELL OBJECT (cell = cells[i] captured at bind time), not over the index. Enqueued updates go into that exact box regardless of later cursor behavior; what breaks under an order change is the NEXT render's BINDING — the (k)-th call reads a different box than the one 'its' variable read last render. The queue is faithfully attached to its cell; the component's variables detach from the cells. So the corruption is Lesson 1's misbinding, unchanged. The real-React lesson: update queues live ON the hook cell (fiber.memoizedState list node), pinned by object identity — which is why setters are stable and safe to call from anywhere, any time (old closures, timeouts, other components), and why the ONLY correctness obligation is the render-time cursor walk. Storage is identity-addressed; only BINDING is positional.",
                  "hint": "What exactly does the setter closure capture — an index or an object? Which of the two does an order change corrupt?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u5l2-i1",
              "front": "In the mini useState, why does the initializer run exactly once?",
              "back": "Cell creation is guarded by cells[i] === undefined — true once per slot. The lazy form useState(() => v) just defers evaluation into that one-shot branch."
            },
            {
              "id": "u5l2-i2",
              "front": "What does a useState setter close over, and why does it matter?",
              "back": "The cell object (the persistent box), never the state value — so setters from any render enqueue into the live cell: setters never go stale, only reads of the per-render constants do."
            },
            {
              "id": "u5l2-i3",
              "front": "Where does batching appear in the mini implementation?",
              "back": "A scheduled flag + microtask: n setter calls in one tick push n updates but schedule one render, which folds all queues — React 18's automatic batching is this flag at tick scope."
            },
            {
              "id": "u5l2-i4",
              "front": "How does the mini machine make snapshots real?",
              "back": "State is copied out of the cell into a local const at cursor time; later queue pushes touch the cell, never the delivered local — 'per-render constant' is literally a stack variable."
            },
            {
              "id": "u5l2-i5",
              "front": "How does the toy map to real React's storage?",
              "back": "Global cells[] → per-fiber linked list (fiber.memoizedState); cursor → workInProgressHook pointer; microtask → priority-lane scheduler; plus double-buffered cells so interrupted renders discard cleanly."
            },
            {
              "id": "u5l2-i6",
              "front": "Why must the no-op bailout compare after folding the queue?",
              "back": "Equality is a property of the fold, not its elements — set(1); set(0) from 0 must commit 0; per-element comparison against a stale base drops real updates. (Eager check is legal only when the queue is empty.)"
            }
          ]
        },
        {
          "id": "u5l3",
          "title": "Custom Hooks: Sharing Logic, Not State",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The abstraction hooks were designed to enable",
              "body": "The Hooks RFC's stated motivation was not `useState`'s ergonomics — it was that React had no good primitive for *reusing stateful logic*. The pre-hooks patterns — higher-order components and render props — both worked by adding components to the tree: wrappers that owned the state and passed it down. They composed poorly ('wrapper hell': five behaviors = five nested layers, each an indirection in devtools and a false positive in the addressing rules of Unit 2), collided on prop names, and hid which wrapper provided which prop. A **custom hook** solves the same problem in the dimension hooks opened: it is *just a function that calls hooks*, named `useSomething`, extracting a stateful behavior — the state, the transitions, the effects — behind an ordinary function API. No new component appears in the tree; the abstraction is invisible to reconciliation. And the composition rule could not be simpler: because React only ever sees the flattened call sequence (Lesson 1), a custom hook calling hooks — or other custom hooks, arbitrarily deep — is indistinguishable from the component having called them inline. Extraction is *identity-preserving refactoring*: cut hook calls, paste into a function, return what the JSX needs. That refactoring-neutrality is the design's masterstroke, and it has one precise semantic consequence this lesson must nail down, because its misreading is the most common custom-hook bug: **custom hooks share logic, never state**."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Call-site isolation: custom hooks share logic, not state",
              "statement": "Let useX be a custom hook whose body performs m hook calls. (1) Each *call site* of useX within a render contributes its own m consecutive cells to the calling component's sequence: two calls of useX in one component occupy disjoint cell ranges and are fully independent instances of the behavior. (2) Calls of useX in *different components* bind cells on different fibers and share nothing whatsoever. (3) Therefore no state, ref, or effect inside a custom hook is ever shared between call sites; the only sharing is the code itself. Sharing *values* across components requires an actual shared home — lifted state, context, or an external store (Unit 4's ladder) — and a custom hook may *wrap access* to such a home (e.g. useContext inside), but the hook mechanism itself contributes no sharing.",
              "proof": "(1) Within one render, the component's hook sequence is the concatenation of calls in execution order (Lesson 1's definition); a useX invocation appends its m calls at the cursor's current position. Two invocations append two disjoint runs of m; by positional binding, their cells never coincide, and cells evolve only via their own hooks' operations — independence follows. (2) Cell storage is per-fiber (Lesson 2's mapping); different components render on different fibers, so their cursors walk different lists — no shared slots exist. (3) is (1)+(2) plus the observation that a custom hook's closure state (locals) dies per call like any function locals; persistence lives only in cells. The wrapping clause: useContext inside useX reads a provider's value (Unit 4's semantics) — the sharing comes from the provider's ownership, and useX merely packages the read; substituting the hook for the provider is the classic error this proposition exists to prevent. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: the 'shared' hook that wasn't — and the fix",
              "body": "A team writes `useCart()`: `const [items, setItems] = useState([]); const add = (p) => setItems(s => [...s, p]); return { items, add };` The product page calls `useCart()` to add items; the nav badge calls `useCart()` to show the count. Bug report: 'badge always shows 0'. Diagnose with the proposition: two call sites in two components → two fibers → two independent `items` cells. The page's cart fills; the badge's cart is a different, forever-empty cart. Nothing is wrong with the hook's *code* — the error is ontological: the team believed naming it `useCart` created *a* cart, but a custom hook is a behavior template, not a store; every caller gets a fresh instance. The fix follows Unit 4's ladder, and the hook's *API can survive it*: create a real home — `<CartProvider>` owning the state via useReducer, publishing over split contexts — and reimplement `useCart()` as `{ const items = useContext(CartCtx); const dispatch = useContext(CartDispatchCtx); return { items, add: (p) => dispatch({type:'ADD', p}) }; }`. Call sites don't change at all: same name, same shape — but now the hook *wraps access to one shared home* instead of minting private ones. This before/after pair is the entire distinction: the custom hook is the doorway; whether there's one room or many behind it is decided by where the state lives, never by the hook."
            },
            {
              "type": "code",
              "heading": "Anatomy of a production-quality custom hook",
              "lang": "jsx",
              "code": "// useDebouncedValue: follow a fast-changing input at a delay.\n// Contract: returns the latest value that has been stable for `ms`.\nfunction useDebouncedValue(value, ms) {\n  const [debounced, setDebounced] = useState(value); // cell 1: the lagged copy\n  useEffect(() => {                                  // cell 2: the timer sync\n    const id = setTimeout(() => setDebounced(value), ms);\n    return () => clearTimeout(id);   // value changed before firing ⇒ cancel:\n  }, [value, ms]);                   // the cleanup IS the debounce logic\n  return debounced;\n}\n\n// Composition: hooks calling hooks — flattened into the caller's sequence.\nfunction useSearch(query) {\n  const debounced = useDebouncedValue(query, 300);   // cells 1–2\n  const [results, setResults] = useState([]);        // cell 3\n  useEffect(() => {                                  // cell 4\n    let alive = true;                                // (race guard — Unit 9\n    search(debounced).then(r => { if (alive) setResults(r); });\n    return () => { alive = false; };\n  }, [debounced]);\n  return results;\n}\n\n// Design notes worth stealing:\n// • Inputs as ARGUMENTS, outputs as RETURN — a custom hook's API is a\n//   function API; resist reaching into ambient globals.\n// • It must obey the Rules INTERNALLY (unconditional calls) and is,\n//   in exchange, composable anywhere a hook is legal — and nowhere else.\n// • The use* prefix is a lintable CONTRACT, not branding: it tells the\n//   linter 'my body contains hook calls — hold me to the Rules, and\n//   hold my callers to calling ME unconditionally too'. Naming a\n//   hook-calling helper `getSearch` doesn't relax the theorem; it\n//   just blinds the tool that proves you honor it.\n// • Return shape: [value, setter] tuples for useState-like pairs\n//   (positional, destructure-renameable), objects for 3+ fields."
            },
            {
              "type": "text",
              "heading": "When to extract — and when not to",
              "body": "Extraction has a cost — an indirection the next reader must open — so the bar should be real. Three signals justify a custom hook. **Duplication of stateful choreography**: the same state+effect dance (subscribe/unsubscribe, fetch/cancel, listen/cleanup) appearing in two components — extraction removes coordinated-edit risk, exactly Unit 4's argument against duplicated facts, applied to logic. **A nameable concept**: `useOnlineStatus`, `useUndoableList`, `useHotkey` — if the behavior has a domain name, the hook makes the component read as intent ('this component cares about online status') rather than mechanism (event listeners and cleanup). This is the deepest payoff: components become declarations of *what* they track, hooks encapsulate *how*. **Testability**: a hook can be tested in isolation (with a tiny host harness) once extraction separates the behavior from any particular UI. The anti-signals matter as much: a hook used once, wrapping a single useState with trivial handlers, is ceremony (inline it); a hook that returns JSX has crossed into being a component wearing the wrong name; a hook whose behavior differs per call site via a growing options bag is two hooks wearing one trench coat — split it. And the naming contract is binding in both directions: everything stateful gets `use` (so the linter can see it), and nothing *non*-stateful gets `use` (a pure formatter named useFormatMoney invites callers to treat it as unconditionally-callable-only, taxing every future refactor for nothing)."
            },
            {
              "type": "example",
              "heading": "Worked example: extracting until the component disappears into intent",
              "body": "Before — a ChatRoom component of seventy lines: two useStates for connection status and messages, an effect managing connect/disconnect with room and server deps, another debouncing typing indicators, a third syncing document.title to unread count, plus handlers. Reading it requires reconstructing which state belongs to which effect — the choreographies interleave in one namespace. After: `const { status, messages, send } = useChatConnection(server, room); const typing = useTypingIndicator(send, 400); useDocumentTitle(unread ? `(${unread}) ${room}` : room);` — three lines, three nameable concerns, each hook owning its cells and cleanup privately. Three observations make this more than aesthetics. (1) The refactor was *mechanical*: cut each state+effect cluster, paste into a function, parameterize the free variables as arguments — identity-preserving by the flattening rule, verifiable by the unchanged behavior. (2) The interleaving *risk* is gone structurally: useChatConnection's cells cannot be touched by useTypingIndicator's code — isolation by cursor ranges (the proposition), where before, any line could reach any state. (3) Each hook is now independently testable and independently *reusable* — the typing indicator moves to the DM view by import, not copy-paste. The component that remains is close to the ideal this course has been circling: a pure description of UI over named facts, with all synchronization machinery behind doors labeled with what, not how."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Custom hooks inherit every rule, at every level.** A component calling useSearch conditionally — `const results = ready ? useSearch(q) : []` — varies its call sequence by ready: the theorem fires exactly as if the four inner hooks were written inline (they effectively are). Likewise a custom hook may not call hooks in loops over dynamic data, after early returns, or in callbacks. The flattening that makes extraction free also means extraction NEVER launders a rules violation: if the inline version would be illegal, the extracted version is too, one stack frame deeper. When you need 'a hook per item in a dynamic list', the sanctioned move is Unit 2's: render a component per item (each instance carries its own sequence), not a hook per iteration."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Write useToggle(initial = false) returning [on, toggle] where toggle flips the value and is identity-stable across renders. Then explain: why should toggle use the updater form internally, and what breaks (subtle, not a crash) if it's written setOn(!on)?",
                  "solution": "function useToggle(initial = false) { const [on, setOn] = useState(initial); const toggle = useCallback(() => setOn(o => !o), []); return [on, toggle]; } The updater form is load-bearing twice: (1) correctness under batching — two toggle() calls in one handler must net to no-change (o→!o→o); with setOn(!on), both calls enqueue replace(!frozen-on) — same value twice — netting a SINGLE flip: double-click flips once instead of zero times (Unit 3's replace collapse). (2) It's what allows deps: [] — the closure never needs to read `on`, so the callback can be permanently stable without going stale; setOn(!on) with [] would freeze `on` at mount (toggle always sets !initial — works once, then sticks), and with [on] deps the 'stable' identity promise is broken every flip. The exercise in miniature: updater-form + empty deps is the standard recipe for stable action functions in custom hooks.",
                  "hint": "Trace two toggles in one batch under each form; then ask what the closure must read in each case."
                },
                {
                  "prompt": "A useLocalStorage(key, initial) hook is written like useState but persists: reads localStorage in its initializer, writes in an effect on [key, value]. Two components call useLocalStorage('theme', 'light'). Using the isolation proposition, describe the exact inconsistency users will see, why it's WORSE than the useCart bug, and the correct architecture.",
                  "solution": "Two call sites → two independent state cells, both initialized from the same storage key. They agree at mount, then diverge: component A toggles to 'dark' — A's cell updates and the effect writes storage; B's CELL never hears about it (no subscription connects them) and keeps rendering 'light'. Worse than useCart because: the shared backing store makes it LOOK shared (mount agreement, persistence across reloads), so the divergence is intermittent and order-dependent — whichever wrote last wins the stored value, and a reload 'fixes' the mismatch, making it unreproducible in bug reports. Correct architecture: localStorage is an external store — subscribe both call sites to ONE source of truth: useSyncExternalStore with a subscribe that listens to the 'storage' event plus a local emitter for same-tab writes (Unit 8), or lift to context if only your tree writes it. The hook API survives: useLocalStorage becomes a wrapper over the shared subscription — the doorway pattern again.",
                  "hint": "What synchronizes the two cells after mount? (Nothing.) What mechanism exists for 'many subscribers, one mutable source'?"
                },
                {
                  "prompt": "Review this hook and list every defect with its rule/proposition: function useItemHooks(items) { return items.map(item => { const [sel, setSel] = useState(false); return { item, sel, setSel }; }); }",
                  "solution": "(1) Hooks in a loop over dynamic data: the call sequence length is items.length — any add/remove/reorder between renders shifts the cursor and misbinds every later cell (Lesson 1's theorem, necessity branch); with same-type cells the corruption is SILENT — selections jump between items, the checklist-bug of Unit 2 reproduced at the hooks layer. (2) Even while length is stable, identity is positional, not entity-based: reordering items reassigns selections by index (there is no key mechanism for hooks — which is the tell that this belongs in the component tree, where keys exist). (3) Design smell: per-entity UI state wants either a Map in one cell (useState(new Map) keyed by item.id — one hook, entity-addressed) or, better, one CHILD COMPONENT per item (<ItemRow key={item.id}/> with its own useState) — instances are the sanctioned 'hook per item', with key-based identity for free. The general rule: when you want hooks to vary with data, you actually want components to vary with data.",
                  "hint": "Count the hook calls as a function of items; then ask what plays the role of `key` — and notice nothing does."
                },
                {
                  "prompt": "API design adjudication: your team's useForm() hook has grown options { validateOnBlur, persistDraft, wizardMode, analyticsPrefix } and 900 lines. Propose the refactoring using this lesson's principles, and state the litmus test that tells you where to split.",
                  "solution": "The options bag is the tell: four orthogonal behaviors share one trench coat, so every caller pays every behavior's complexity and the hook's cells interleave four concerns. Refactor by concern into composable hooks with the CORE as the seam: useForm() keeps only field state/registration (the nameable core); useFormValidation(form, rules) — subscribes to the form it's given; useDraftPersistence(form, key) — wraps storage sync; useFormAnalytics(form, prefix). Callers compose what they need — const form = useForm(); useDraftPersistence(form, 'signup') — and pay only for what they use; each hook is separately testable and its cells isolated by the proposition. Wizard mode, which changes NAVIGATION not field logic, likely isn't form logic at all — it's a component-structure concern (a Wizard component owning step state). Litmus test for a split: can you name each piece with a use-noun a product person would recognize, and can each be used without the others? If an option toggles whole subsystems on/off, it wanted to be composition; options should tune a behavior, not select which behavior exists.",
                  "hint": "Options that ENABLE subsystems vs options that TUNE one — which kind is each? What does 'composable' mean for hooks concretely?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u5l3-i1",
              "front": "What do custom hooks share between call sites?",
              "back": "Only the code. Each call site gets its own cells (disjoint cursor ranges; different fibers across components) — state, refs, and effects are never shared by the hook mechanism."
            },
            {
              "id": "u5l3-i2",
              "front": "Why is extracting hooks into a custom hook always behavior-preserving?",
              "back": "React sees only the flattened call sequence — inline hooks and extracted hooks produce identical sequences, so extraction is identity-preserving refactoring (and inherits every rule unchanged)."
            },
            {
              "id": "u5l3-i3",
              "front": "The useCart mistake and its fix?",
              "back": "Believing a custom hook creates shared state — two callers got two carts. Fix: give the state one real home (context/provider or store); keep the hook as a same-API wrapper over access to it."
            },
            {
              "id": "u5l3-i4",
              "front": "What does the use* prefix actually do?",
              "back": "It's a lintable contract: tells tooling this function contains hook calls, so the Rules apply to its body AND to its call sites. Never use it on non-hook helpers; never omit it on hook-callers."
            },
            {
              "id": "u5l3-i5",
              "front": "The three signals that justify extracting a custom hook?",
              "back": "Duplicated stateful choreography across components; a nameable domain concept (component reads as intent); the need to test the behavior in isolation."
            },
            {
              "id": "u5l3-i6",
              "front": "You want 'a hook per item' for a dynamic list — what's the sanctioned design?",
              "back": "A component per item (<Row key={id}/> holding its own hooks): instances give per-entity sequences with key-based identity — hooks in loops misbind because hooks have no keys."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u5-check",
        "questions": [
          {
            "id": "u5q1",
            "type": "numeric",
            "prompt": "A component's mount render performs 6 hook calls. On a later render, a conditional causes the 3rd call to be skipped (all others execute in order). Counting the calls of that render (there are now 5), what is the number of the FIRST call that binds to a wrong cell? (Number only.)",
            "answer": 3,
            "explanation": "Calls 1–2 bind c₁–c₂ correctly. The old 4th call is now the 3rd: it binds c₃ — the skipped hook's cell — and every subsequent call is off by one. Misbinding begins exactly at the skip point; with matching hook types it is silent, and React's dev-mode type recording plus the end-of-render length check are what convert it into a crash.",
            "points": 1
          },
          {
            "id": "u5q2",
            "type": "short",
            "prompt": "In React's implementation, what single piece of information associates a hook call with its stored cell? (One or two words.)",
            "accept": [
              "call order",
              "position",
              "call index",
              "order",
              "the call order",
              "positional index",
              "call position"
            ],
            "explanation": "Nothing but arrival order: a cursor walks the fiber's cell list and the k-th call binds the k-th cell. No names, keys, or source positions participate — which is why a stable call sequence is the one and only correctness condition (the Rules of Hooks).",
            "points": 1
          },
          {
            "id": "u5q3",
            "type": "mcq",
            "prompt": "Two components each call the same custom hook useCart() which contains useState([]). What is the relationship between their carts?",
            "options": [
              "They share one cart because the hook closes over module scope",
              "They share one cart because custom hooks deduplicate state by hook name",
              "They are fully independent: each call site binds cells on its own fiber — custom hooks share logic, never state",
              "They share state only if both components are under the same parent"
            ],
            "answer": 2,
            "explanation": "Cell storage is per-fiber and binding is positional per call site — the hook mechanism contributes zero sharing. Sharing values requires an actual shared home (context, lifted state, external store), which a custom hook may WRAP but cannot BE. The distractors encode the common misconceptions: hooks don't store state in module closures, names play no role in storage, and tree proximity is irrelevant.",
            "points": 1
          },
          {
            "id": "u5q4",
            "type": "proof",
            "prompt": "Prove the Rules-of-Hooks theorem: under positional storage, a stable hook-call sequence is both sufficient and necessary for correct cell binding. Include why same-type misbinding is silent, and why no keyless scheme can do better.",
            "rubric": [
              "Sufficiency by induction: with identical sequences, the cursor value at call k is k on every render, binding the same cell; cell contents evolve only via their own hook's operations, so identity persists",
              "Necessity by construction: exhibits a skipped/inserted call and shows every subsequent call binds a cell created by a different hook call (off-by-one), i.e. state read by the wrong hook",
              "Silent vs loud: same-type misbinding yields plausible wrong values (no exception possible from the read itself); React's dev-mode hook-type recording and length check deliberately convert mismatches into errors",
              "Information-theoretic closer: with no per-call identity, the call sequence is the only input to association; differing sequences over the same cells cannot be aligned in general (a skip is indistinguishable from a shift), so misbinding is forced, not an implementation choice"
            ],
            "solution": "Setup: the instance stores cells ⟨c₁…cₘ⟩; each render resets a cursor and the k-th hook call binds c_k (creating it on mount). Sufficiency: induct on k. The cursor value at any call equals the count of prior hook calls in this invocation; equal sequences make this count equal for every prefix across renders, so call k binds c_k always. Since only hook operations on c_k mutate c_k, each hook's persistent identity is preserved. Necessity: let render t skip mount-call j. Calls 1…j−1 bind correctly; the call that was (j+1)-th now arrives with cursor j and binds c_j — created by, and holding the data of, a different hook. Inductively all later calls are shifted. If the types coincide (useState reading useState), the read returns a well-formed but wrong value — no error can arise from the read, hence silence; if types differ, only React's recorded mount-type list (dev mode) or the terminal length check turns the corruption into a thrown error. Optimality of the rules: association must be computed from some identity signal; a keyless design's only signal is arrival order. Given two different sequences over one cell list, any alignment rule must decide whether a discrepancy is a skip, an insertion, or a reorder — these are indistinguishable from the sequence alone (e.g., ⟨A,B⟩ → ⟨B⟩ is 'A skipped' or 'B replaced A and old B removed'), so no such scheme can bind correctly in general. Stability of the sequence is therefore exactly the correctness condition. ∎",
            "explanation": "The theorem converts the Rules from folklore to necessity: they are the unique price of anonymous positional storage, paid in exchange for collision-free, composition-safe state cells. The silent-corruption clause is why the linter should be treated as a type checker.",
            "points": 3
          },
          {
            "id": "u5q5",
            "type": "open",
            "prompt": "Code review, full verdict required. A PR adds: function useRowSelection(rows) { const selections = rows.map(r => useState(false)); const anySelected = selections.some(([s]) => s); return { selections, anySelected }; } — used in a table whose rows are filtered by a search box. The author notes 'tests pass with our fixed 5-row fixture'. Identify every defect (there are at least three levels: legality, identity, design), explain the exact production failure the search box triggers, and prescribe the correct architecture.",
            "rubric": [
              "Legality: hooks in a loop over dynamic data makes the call sequence a function of rows.length — the Rules violation; explains why the fixed-length fixture hides it (sequence stable in tests)",
              "Identity: even at stable length, cells bind by position, not entity — filtering/reordering reassigns selection state to different rows (the Unit 2 checklist bug reproduced in hook cells); no key mechanism exists for hooks",
              "Production failure trace: typing in the search box changes rows.length between renders ⇒ cursor shift ⇒ misbound cells (silent, same-type) and/or 'rendered fewer/more hooks' crash — ties the symptom to the mechanism",
              "Architecture: either one cell holding entity-keyed data (useState(() => new Set()) of selected ids — selection addressed by id, survives filtering) or a component per row (<Row key={id}> with local state) when selection is genuinely row-local; justifies choosing between them (shared operations like 'anySelected'/'clear all' favor the lifted Set)"
            ],
            "solution": "Legality: the map runs useState once per row — the hook-call count IS rows.length, so any filter/add/remove changes the sequence between renders: a direct Rules-of-Hooks violation. The fixture's fixed 5 rows keeps the sequence accidentally stable, which is precisely why the tests prove nothing about this defect class (the violation lives on the untested branch — length change). Identity: even with stable length, binding is positional: sorting or replacing rows leaves selections attached to INDICES, not entities — row 3's checkmark stays at position 3 while a different row slides into it (same misalignment as Unit 2's index-keys bug, now in hook cells, where no key exists to fix it). Production trace: user types 'a' → filtered rows drop 5→2 → this render performs 2+2=4 hook calls against a 7-cell mount record (5 states + the others) → React throws 'Rendered fewer hooks than during the previous render' — or, in the reordering case without length change, silently swaps selections. Architecture: selection is per-ENTITY state with collection-level operations (anySelected, clear-all), so the honest home is one cell holding an id-keyed structure: const [selected, setSelected] = useState(() => new Set()); toggle = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); anySelected = selected.size > 0 — the hook count is constant (1), selection follows ids through any filter/sort, and the collection ops are trivial. If per-row behavior were rich and purely local, the alternative is a component per row (<Row key={r.id}/> owning its state) — instances are the legal 'hook per item'. Here the Set wins: anySelected and clear-all are collection facts, which per-row state would force the parent to aggregate anyway.",
            "explanation": "The question stacks the unit's three layers: the theorem (sequence stability), the identity model (cells bind positions, entities need keys — which hooks lack), and design judgment (entity-keyed state in one cell vs instance-per-item). A complete answer connects the search-box symptom to the cursor mechanics, not just 'you can't do that'.",
            "points": 4
          },
          {
            "id": "u5q6",
            "type": "mcq",
            "prompt": "In the mini-React implementation, the setter returned by useState pushes updates into cell.queue where cell was captured when the hook ran. Which statement correctly identifies what this design guarantees?",
            "options": [
              "Setters go stale like state variables do, so old setters must not be called after a re-render",
              "Setters are pinned to their cell by closure, so a setter from any render — however old — enqueues into the live cell; only READS of state variables are per-render snapshots",
              "The queue must be flushed synchronously inside the setter to avoid losing updates",
              "Capturing the cell means two components calling the same hook share the same queue"
            ],
            "answer": 1,
            "explanation": "The setter closes over the persistent cell object, not the state value — so setter identity is effectively stable and calls from timeouts, old closures, or other renders all reach the live queue. Staleness afflicts reads (per-render constants), never enqueues. The distractors invert this (a), contradict batching — the whole point is deferred folding (c), or confuse closure capture with cross-fiber sharing, which positional per-fiber storage precludes (d).",
            "points": 1
          }
        ]
      }
    },
    {
      "id": "u6",
      "title": "Effects and Synchronization",
      "summary": "Effects as synchronization with external systems — the setup/cleanup lifecycle, the stale-closure theorem behind dependency arrays, the you-might-not-need-an-effect catalog, and refs as the sanctioned mutable escape hatch.",
      "references": [
        "react.dev — Synchronizing with Effects; Lifecycle of Reactive Effects; Removing Effect Dependencies; You Might Not Need an Effect; Referencing Values with Refs; Manipulating the DOM with Refs",
        "Dan Abramov — 'A Complete Guide to useEffect' (overreacted.io, 2019)",
        "React RFC #220 — useEvent / useEffectEvent (the latest-value escape hatch)",
        "react.dev — useLayoutEffect and flushSync API references (paint-timing semantics)"
      ],
      "prerequisites": [
        "u5"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u6l1",
          "title": "Effects Synchronize, They Don't 'Happen'",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The wrong model everyone arrives with",
              "body": "Developers coming from class components — or from tutorials written by people who did — read `useEffect` as a lifecycle event system: 'empty deps = componentDidMount, deps = componentDidUpdate for those values, cleanup = componentWillUnmount'. The translation is seductive because it often produces working code, and it is the single most bug-generating misreading in React, because it frames effects around *the component's biography* (when it was born, when it changed) when the design frames them around *a synchronization obligation* (what external state must be kept in agreement with what rendered state). The honest model: after React commits a render, some systems **outside React's world** — a WebSocket, a subscription, a third-party widget, document.title, an analytics service — may need to be brought into agreement with what was just committed. An effect declares that obligation: *'when these rendered values hold, this external system should be set up like this'* — plus, symmetrically, how to undo it. React then runs setups and cleanups **as needed to maintain the agreement**, and how many times it does so is React's business, not a promise. StrictMode's deliberate extra setup/cleanup cycle in development is precisely a test that you wrote an obligation and not a biography — a correct synchronization survives being torn down and re-established at any moment; a 'run once on mount' ritual does not."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The effect lifecycle",
              "statement": "An effect is a pair (setup, cleanup) attached to a render, where setup runs **after commit** (never during render — the purity contract) and may return the cleanup. Its lifecycle per component instance:\n\n1. **Mount commit**: setup runs with the mounting render's snapshot.\n2. **Update commit**: if the effect's dependencies changed (any Object.is inequality vs the previous run's deps — Lesson 2), React first runs the *previous* setup's cleanup (closing the old synchronization, with the OLD snapshot's values), then runs the new setup (opening the new one, with the NEW snapshot). Unchanged deps ⇒ neither runs.\n3. **Unmount**: the last setup's cleanup runs.\n\nInvariant: setups and cleanups alternate strictly — every setup is eventually paired with exactly one cleanup (before the next setup or at unmount), so at any moment at most one synchronization per effect is live. The effect's frame of reference is *the values it synchronized on*, not time: an effect's life is a sequence of 'synchronize on snapshot A … desynchronize A, synchronize B …' episodes, and the component's mount/update/unmount biography is invisible to a well-written effect."
            },
            {
              "type": "example",
              "heading": "Worked example: the chat connection, read as episodes",
              "body": "`useEffect(() => { const conn = connect(server, room); conn.open(); return () => conn.close(); }, [server, room]);`\n\nUser journey: open room 'general', switch to 'travel', then close the panel. Read it as the lifecycle dictates. Commit 1 (room 'general'): setup — connect(general). Commit 2 (roomId unchanged, some unrelated re-render): deps [server,'general'] vs [server,'general'] equal — nothing runs; re-rendering is not resynchronizing. Commit 3 (room 'travel'): deps differ → cleanup of the *general* episode runs first (closing general — note it closes over the OLD snapshot, which is exactly what lets it name the right room), then setup for travel. Unmount: cleanup of travel. The trace — connect(general), close(general), connect(travel), close(travel) — contains no 'mount logic' and no 'update logic'; the same two functions handled every episode boundary. Now the StrictMode test: development remounts run setup, cleanup, setup at mount. Trace: connect, close, connect — net one live connection, indistinguishable to the user. A version that skipped the cleanup ('we only connect on mount, why bother') shows two live connections immediately in dev — the smoke detector firing on a real fire: without cleanup, *every* room switch in production leaks a connection, and messages arrive from ghost rooms. The lesson generalizes: **write the cleanup first**; an effect without one should be a conscious claim that the synchronization is idempotent and self-superseding (document.title is; a subscription never is)."
            },
            {
              "type": "code",
              "heading": "One concern per effect — the decomposition rule",
              "lang": "jsx",
              "code": "// SMELL: one effect, three unrelated obligations, tangled lifetimes\nuseEffect(() => {\n  const conn = connect(server, room);          // concern A: connection\n  logAnalytics('room_viewed', room);           // concern B: analytics\n  const id = setInterval(pollPresence, 5000);  // concern C: presence poll\n  return () => { conn.close(); clearInterval(id); };\n}, [server, room]);\n// Why it's wrong: a server change re-fires the ANALYTICS ping (a lie —\n// the user viewed nothing new), and any future concern-D dep added here\n// will churn the connection. Deps are per-EFFECT, so unrelated concerns\n// sharing an effect share each other's invalidation — false coupling.\n\n// RIGHT: three obligations, three effects, three dependency sets\nuseEffect(() => {\n  const conn = connect(server, room);\n  return () => conn.close();\n}, [server, room]);                    // synchronize connection ↔ (server, room)\n\nuseEffect(() => {\n  logAnalytics('room_viewed', room);\n}, [room]);                            // one ping per room actually viewed\n\nuseEffect(() => {\n  const id = setInterval(pollPresence, 5000);\n  return () => clearInterval(id);\n}, []);                                // presence poll ↔ (nothing rendered —\n                                       // lives with the instance)\n// The unit of decomposition is the SYNCHRONIZATION, not the event.\n// 'Does this effect keep ONE external thing in agreement with rendered\n// values?' — if describing it needs the word 'and', split it."
            },
            {
              "type": "text",
              "heading": "Where effects sit in the pipeline — and the two timing tiers",
              "body": "Placement in Unit 1's pipeline matters for correctness reasoning. Render computes the tree (pure); commit mutates the DOM; **then** effects run — so an effect always observes the DOM of *its own* committed render, and setState from an effect schedules a *new* render pass (it cannot alter the one that just committed; that ship has sailed — this is why state-echo effects always cost an extra full pass, Lesson 3). There are two timing tiers. `useEffect` runs **after paint** (asynchronously, so the user sees the frame first): correct for everything whose observer is not the user's retina this frame — subscriptions, network, logging, timers. `useLayoutEffect` runs **after commit but before the browser paints**, synchronously blocking the frame: it exists for exactly one job — *read layout, then mutate, without an intermediate frame escaping to the screen* (measure a tooltip, position it; the user must never see the unpositioned tooltip). The decision rule is observational: if running the code a frame late would be user-visible as flicker or jump, it is layout-tier; everything else belongs in the passive tier, because layout effects are a tax on every frame they run in — they serialize JavaScript into the paint path, the exact place jank lives. (Server rendering adds a wrinkle: layout effects cannot run at all during SSR — a warning you resolve by moving the work or gating on mount; Unit 9.)"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**'On mount' is almost always a requirements smell.** When you reach for empty deps to mean 'once, at the start', interrogate the requirement: analytics 'page viewed' is really *per URL displayed* (deps [url]); 'initialize the widget' is really *keep a widget in agreement with these options* (deps [options], with destroy in cleanup); 'fetch the data' is really *the displayed data should match these params* (deps [params], with race cleanup — Unit 9). Genuine once-per-instance obligations exist (starting an app-lifetime service), but they are rare — and genuine once-per-APP-LOAD obligations (initializing an SDK) don't belong in a component at all: module scope or the app entry point runs them exactly once without any effect machinery. The empty array should be a conclusion you defend, not a default you type."
            },
            {
              "type": "example",
              "heading": "Worked example: porting a class component's lifecycle tangle",
              "body": "A legacy class component: componentDidMount subscribes to a store AND starts a resize listener; componentDidUpdate re-subscribes if `sourceId` changed (with a hand-written prevProps comparison, and a bug: it forgets to remove the *old* resize listener when re-subscribing — harmless by luck since the listener doesn't depend on props); componentWillUnmount unsubscribes both. The hooks port is *not* a transliteration of the three methods — it is an inventory of obligations: (1) 'subscription ↔ sourceId' — one effect, deps [sourceId], setup subscribes, cleanup unsubscribes; the prevProps comparison **disappears into the deps mechanism** (that hand-rolled diff is what deps *are*); (2) 'resize listener ↔ nothing rendered' — separate effect, empty deps, add/remove listener. Notice what the port surfaced: the class version's structure — grouping by *when* (all mount code together, all update code together) — forced each lifecycle method to know about every concern, and the forgotten-listener bug lived exactly in that forced entanglement. The effect version groups by *what* (each obligation with its own lifetime), and the bug's habitat is gone: no site exists where 'resubscribe' could forget the listener, because they never shared a site. This is the deep reason hooks replaced lifecycles: **lifecycle methods scale by time and entangle concerns; effects scale by concern and let React manage time.**"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Write the full setup/cleanup trace (in order, with arguments) for this effect across: mount with videoId 'a' under StrictMode (dev), a re-render with videoId 'a', an update to videoId 'b', then unmount: useEffect(() => { player.load(videoId); return () => player.unload(videoId); }, [videoId]).",
                  "solution": "StrictMode mount: load(a), unload(a), load(a) — the dev-only probe cycle; net one live load. Re-render with 'a': deps equal → nothing. Update to 'b': unload(a) THEN load(b) — cleanup runs first, with the old closure's videoId. Unmount: unload(b). Full trace: load(a), unload(a), load(a), unload(b)… careful — the update step: unload(a), load(b); then unmount: unload(b). Sequence: load(a) · unload(a) · load(a) · unload(a) · load(b) · unload(b). Every load is paired with exactly one unload of the SAME id (the alternation invariant), which is the property that makes the effect correct under any schedule React chooses.",
                  "hint": "Setups and cleanups strictly alternate; each cleanup closes over the snapshot of ITS setup's render."
                },
                {
                  "prompt": "A teammate's effect: useEffect(() => { const h = () => setWidth(window.innerWidth); window.addEventListener('resize', h); }, []) — no cleanup, 'because the component never unmounts in our app'. Give three independent reasons this ships a real defect anyway, ranked by severity.",
                  "solution": "(1) StrictMode/dev remounting and Fast Refresh DO unmount-remount the instance even if the product never does: each cycle adds a listener without removing one — after n edits during development there are n listeners firing n setWidth calls per resize, and 'works in our app' quietly becomes 'dev is janky and nobody knows why'. (2) The claim is a lifecycle bet, not a code property: the moment the component is reused inside a route, modal, or list (or the app adds code-splitting boundaries), production leaks listeners on every unmount — the defect was always there, waiting for a caller the author didn't imagine. (3) Even never-unmounting, the missing cleanup breaks the alternation invariant that React's model assumes — future React features (offscreen/reusable state, Activity) explicitly unmount and remount effect pairs; code violating the pairing is forward-incompatible by construction. Fix costs one line: return () => window.removeEventListener('resize', h). An effect's correctness must be schedule-independent — 'my schedule happens to be benign' is not a property of the code.",
                  "hint": "Who besides the product unmounts components? What does the missing pair break structurally?"
                },
                {
                  "prompt": "Classify each into passive effect (useEffect), layout effect (useLayoutEffect), or 'not an effect at all', with the observational justification: (a) scrolling a newly-added chat message into view before the user sees the frame; (b) reporting a purchase to analytics after checkout success renders; (c) computing the filtered list the component displays; (d) positioning a dropdown menu under its trigger button after it opens; (e) persisting the current form draft to localStorage as it changes.",
                  "solution": "(a) Layout: if paint happens before the scroll, the user sees the list at the wrong position for a frame, then it jumps — the flicker test fails, so it must run pre-paint. (b) Passive: no retina involvement; a frame's delay is invisible and blocking paint for analytics would be paying the jank tax for nothing. (c) Not an effect: a derivation of rendered output from state — belongs in the render body (Unit 4's stored-derivation rule); an effect version adds a stale frame and an extra render (Lesson 3). (d) Layout: measure trigger, position menu, before paint — the archetypal read-layout-then-mutate job. (e) Passive: localStorage is an external system being synchronized with rendered state — a true effect — and the user cannot see storage, so post-paint is correct (plus it's the debounce candidate, keeping writes off the critical path).",
                  "hint": "Two questions per item: is any external system involved at all? If yes, would a one-frame delay be visible?"
                },
                {
                  "prompt": "Refactor this biography-shaped effect into obligation-shaped effects, and identify the bug the original structure was hiding: useEffect(() => { if (!mounted.current) { mounted.current = true; analytics.pageView(page); openSocket(user.id); } else { analytics.pageView(page); } return () => socket?.close(); }, [page, user.id]).",
                  "solution": "Inventory the obligations: (A) 'one pageView per page displayed' — effect with deps [page], body analytics.pageView(page), no cleanup (fire-and-forget is honest here). (B) 'a socket ↔ user.id' — effect with deps [user.id], setup const s = openSocket(user.id), cleanup s.close(). The original's hidden bug: because both concerns share one effect keyed [page, user.id], every PAGE change tears down and re-runs the effect — running the cleanup closes the socket, but the else-branch re-run never reopens it (openSocket lives in the mounted-guard branch): after the first navigation, the app has no socket, silently. The mounted-ref dance was an attempt to fake 'mount-only' semantics inside a multi-dep effect — i.e., to fight the synchronization model with a biography model — and the fight is precisely where the bug lived. Split by obligation and both lifetimes become trivially correct, with zero refs and zero branches.",
                  "hint": "List the external systems and what rendered value each must agree with; then check what the original does to the socket when only `page` changes."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l1-i1",
              "front": "The correct one-sentence model of useEffect?",
              "back": "A declared synchronization obligation: 'while these rendered values hold, this external system should be set up like this — and here is how to undo it.' Not a lifecycle event."
            },
            {
              "id": "u6l1-i2",
              "front": "The effect lifecycle on a deps change?",
              "back": "Cleanup of the previous episode runs first (with the OLD snapshot's values), then setup with the new — setups and cleanups strictly alternate, at most one live synchronization per effect."
            },
            {
              "id": "u6l1-i3",
              "front": "What is StrictMode's extra setup/cleanup cycle testing?",
              "back": "That the effect is a resilient synchronization, not a mount ritual — correct effects survive teardown/re-establishment at any moment; the dev cycle makes missing cleanups loud."
            },
            {
              "id": "u6l1-i4",
              "front": "useEffect vs useLayoutEffect — the decision rule?",
              "back": "Layout tier only when a one-frame delay is user-visible (measure-then-position, scroll before paint); it blocks painting. Everything else is passive, after paint."
            },
            {
              "id": "u6l1-i5",
              "front": "How do you decompose multiple effects correctly?",
              "back": "One synchronization per effect — each obligation gets its own deps and lifetime. Sharing an effect couples unrelated concerns to each other's invalidation."
            },
            {
              "id": "u6l1-i6",
              "front": "Why is 'run once on mount' usually a smell?",
              "back": "Most 'mount' work is really 'agree with these values' (per-URL, per-params, per-options) — deps say so; true once-per-app work belongs in module/entry scope, not an effect."
            }
          ]
        },
        {
          "id": "u6l2",
          "title": "Dependencies and the Stale-Closure Theorem",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Deps are not a re-run schedule — they are a staleness declaration",
              "body": "The dependency array is the most misused syntax in React because its surface reading — 'the effect re-runs when these change' — describes the mechanism while hiding the contract. Run the logic from first principles, with Unit 3's snapshot model in hand. An effect function is a closure created during a render; every state variable, prop, and derived value it mentions resolves to *that render's constants*, forever. If the effect runs at commit 5 and is not re-run until commit 40, then throughout commits 6–39 the live synchronization is operating on **the world of commit 5**. Sometimes that is fine (the value didn't change, or the effect doesn't care); when the value did change and the effect's behavior depends on it, the synchronization is now *wrong* — connected to the old room, filtering by the old query, posting to the old user. The dependency array is how you tell React which values make the synchronization stale: 'this episode is only valid while these specific values hold; when any changes, retire it and start a fresh episode with fresh closures'. That is why the rule is not 'list what you want to react to' but **'list every reactive value the effect reads'** — the array is an honesty declaration about the closure's inputs, and the theorem below says that omitting one is never a scheduling tweak: it is a correctness hole with an exactly predictable shape."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The stale-closure theorem",
              "statement": "Let an effect E read a reactive value v (state, prop, or anything derived from them) and declare a dependency array D with v ∉ D. Then for any render r₂ where v's value differs from its value at E's last run render r₁ — and where D's members are unchanged — the live synchronization executes with v's value from r₁. In particular: (1) the staleness is *silent* — no error, no warning at runtime; the effect simply operates on an old world; (2) it is *unbounded* — the gap between v's current value and the value E sees can grow for the instance's remaining lifetime; (3) it is *latent* — code paths that only run inside E's callbacks (timers, subscription handlers) carry the stale value into arbitrarily later moments. Conversely, with v ∈ D, every change to v retires the old episode and creates closures over the new snapshot: the effect can never observe a value of v older than its own current episode.",
              "proof": "By the snapshot proposition (Unit 3), the effect function created at render r₁ closes over r₁'s bindings; v resolves to v(r₁) in that closure permanently. React re-runs an effect iff some member of D changed by Object.is (the lifecycle definition, Lesson 1). With v ∉ D and D's members unchanged at r₂, no re-run is triggered: the setup from r₁ — including any callbacks it registered — remains the live synchronization, and every read of v within it yields v(r₁) while the committed world holds v(r₂) ≠ v(r₁). (1) follows because closure capture is the language working as specified — nothing anomalous exists to detect; (2) because subsequent changes to v likewise trigger nothing; (3) because callbacks registered by the setup are closures over the same environment and outlive the commit that created them. The converse: with v ∈ D, any Object.is change at commit r₂ runs cleanup(r₁) then setup(r₂), whose closure binds v(r₂); between episodes no code from r₁ survives (the alternation invariant), so reads of v within the live episode always see the episode's own snapshot. ∎"
            },
            {
              "type": "example",
              "heading": "Worked example: the search that filters by yesterday's query",
              "body": "`useEffect(() => { const sub = feed.subscribe(item => { if (item.text.includes(query)) addToResults(item); }); return () => sub.unsubscribe(); }, []); // 'subscribe once — subscriptions are expensive'`\n\nTrace it against the theorem. The subscription callback is registered at mount (r₁, query = ''); it closes over query = '' forever — clause (3): the staleness rides inside a callback that fires for the instance's whole life. The user types 'rust': commits happen, `query` is 'rust' in every render — and every arriving item is still tested against `''` (everything matches; results are unfiltered). No error anywhere — clause (1). The developer 'fixes' it by adding an if inside the callback reading a different state — same theorem, same hole. The honest fixes, in order of preference: **(a) put query in deps** — [query]; each keystroke retires the old subscription and opens one whose callback closes over the current query. Correct by the converse clause; cost: subscription churn per keystroke — if that cost is real, debounce the *value* (Unit 5's useDebouncedValue) so episodes turn over at human speed, which is a requirements fix, not a semantics dodge. **(b) restructure so the callback doesn't read reactive values**: subscribe once, deps [], callback does `setPending(p => [...p, item])` (updater form reads no snapshot — Unit 3), and filtering happens in render from current state: `pending.filter(i => i.text.includes(query))`. The reactive read moved from the closure (frozen) to render (always current) — often the best design: cheap subscription, always-fresh filtering. **(c) an effect-event/ref for the latest value** — coming below, for when neither restructuring applies. What is *never* a fix: lying to the array."
            },
            {
              "type": "text",
              "heading": "The linter is checking the theorem's hypothesis — work with it, not around it",
              "body": "`eslint-plugin-react-hooks/exhaustive-deps` computes the set of reactive values an effect's closure reads and demands the array match. Given the theorem, read its findings as *proofs of staleness holes*, not style nags. But the productive response to an unwelcome finding is rarely 'add the dep and let the effect churn' — it is to ask **why is this value in the closure at all?** The honest menu: (1) **Move it in**: a constant or function used only by the effect — define it inside the effect (or outside the component); it stops being a per-render value and leaves the closure's reactive set. (2) **Updater form**: setState(v => …) removes the state read entirely (the accumulator arrives as a parameter). (3) **Narrow the read**: depend on `user.id`, not `user` — read the field in render into a primitive const, and let the effect close over that; object identities churn per render (Unit 3), primitives compare stably. (4) **Split the effect**: two concerns with different reactive sets are two effects (Lesson 1's decomposition — half of 'this dep re-runs too much' is false coupling). (5) **Effect events** for the genuinely mixed case below. What is never on the menu: deleting a dep the closure still reads, or suppressing the rule — both convert a lint error into the theorem's silent, unbounded, latent staleness. The array is not configuration; it is a *description* that must match the code, and every legitimate technique works by *changing the code* until the honest description is the one you wanted."
            },
            {
              "type": "code",
              "heading": "The mixed case: reactive trigger, latest-value read — effect events",
              "lang": "jsx",
              "code": "// REQUIREMENT: reconnect the socket when roomId changes (reactive),\n// and on each connect, log the CURRENT theme (read-latest, but theme\n// changes must NOT reconnect the socket).\n\n// Naive honest version — correct but wrong lifetime:\nuseEffect(() => {\n  const conn = connect(roomId);\n  conn.on('connected', () => log('joined', roomId, theme));\n  return () => conn.close();\n}, [roomId, theme]);   // ✗ theme toggle tears down a healthy socket\n\n// Effect event (useEffectEvent / RFC #220): a stable-identity function\n// whose BODY always sees the latest snapshot — callable only from\n// effects, never a dependency itself:\nconst onConnected = useEffectEvent(() => {\n  log('joined', roomId, theme);      // reads are always-current\n});\nuseEffect(() => {\n  const conn = connect(roomId);\n  conn.on('connected', () => onConnected());\n  return () => conn.close();\n}, [roomId]);          // ✓ socket lifetime ↔ roomId only; theme reads live\n\n// Pre-useEffectEvent equivalent — the latest-ref pattern (same idea,\n// hand-built): a ref is a mutable box OUTSIDE the snapshot system, so\n// writing the newest value into it each render gives closures a\n// window to the present:\nconst themeRef = useRef(theme);\nuseEffect(() => { themeRef.current = theme; });   // every commit: box ← latest\nuseEffect(() => {\n  const conn = connect(roomId);\n  conn.on('connected', () => log('joined', roomId, themeRef.current));\n  return () => conn.close();\n}, [roomId]);\n// The pattern's meaning, stated precisely: the effect DEPENDS on what\n// defines its episode (roomId); it READS-LATEST what must not define\n// the episode (theme). Deps = episode definition. Refs/effect-events =\n// deliberate exits from snapshot semantics — use them for reads whose\n// staleness you have decided is wrong BY REQUIREMENT, not to silence\n// the linter."
            },
            {
              "type": "example",
              "heading": "Worked example: object and function deps — the churn disease and its cures",
              "body": "`const options = { serverUrl, roomId };`\n`useEffect(() => { const c = connect(options); return () => c.close(); }, [options]);`\n\nThe array is honest — and the effect reconnects on *every render*: `options` is a fresh object each pass (Unit 1's element lesson generalized — new literal, new identity), so Object.is fails always. The linter is satisfied; the *episode definition* is wrong: identity churn of a value whose contents are stable. This is the second disease of dependency arrays (the first was omission; this is over-triggering), and its cures are structural, in order of preference: **(1) depend on primitives** — build the object *inside* the effect from `serverUrl` and `roomId`, deps [serverUrl, roomId]; primitives have value semantics under Object.is; the object never enters the reactive set. **(2) Hoist true constants** out of the component (module scope — no longer per-render). **(3) useMemo the object** when it must cross a component boundary (deps of the memo become the real reactive set) — legitimate but weakest: memoization is a cache, not a semantic guarantee (Unit 7). The same trilogy handles function deps: a handler recreated per render churns any effect depending on it — move it into the effect, hoist it, or stabilize with useCallback (whose own deps then carry the honesty obligation). The unifying diagnosis: **deps compare identities; render recreates identities; therefore what you list should be the stable atoms a value is built from, with construction moved to where the atoms are.**"
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**The empty-array-plus-suppression pattern is the most expensive lie in React codebases.** `useEffect(() => { … }, []) // eslint-disable-line` reads as 'runs once, like componentDidMount, don't nag me'. What it actually asserts: 'no reactive value this closure reads will ever matter after mount'. Every value it reads is frozen at mount values — silently, unboundedly, latently (the theorem's three clauses) — and every future edit to the effect inherits the suppression: the next developer adds a read of `userId`, the linter is muzzled, and the bug ships with zero warnings. If an effect genuinely must run once AND read late-arriving values, that contradiction is the requirement telling you it wants effect-events/refs for the reads, or a different home (module init, a handler). Suppressions are code review's business: each one should carry a comment proving the closure reads nothing reactive — and almost none can."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Apply the theorem: useEffect(() => { const id = setInterval(() => { if (Date.now() - lastActivity > TIMEOUT) logout(user.id); }, 10_000); return () => clearInterval(id); }, []). State exactly which reads are stale, what user-visible behavior results, and give two structurally different correct designs (one deps-based, one latest-read-based), with the trade-off.",
                  "solution": "Stale reads: lastActivity and user.id (and logout if it's a per-render closure) — all frozen at mount values inside the interval callback (theorem clause 3: staleness riding a registered callback). Behavior: the idle check compares against the MOUNT-TIME activity stamp, so after TIMEOUT elapses from mount, it logs out the user regardless of activity — and logs out the mount-time user.id even if the session switched accounts. Deps-based fix: [lastActivity, user.id] — every activity event retires and restarts the interval; correct, and the churn is arguably semantic (the timer genuinely restarts per activity), though high-frequency activity makes it busywork. Latest-read fix: keep [], write lastActivityRef.current = lastActivity each render (or an effect event holding the check), interval reads the ref — stable timer, always-current reads. Trade-off: deps version keeps all logic in snapshot semantics (simplest to reason about, more churn); ref version trades churn for a deliberate exit from snapshots that reviewers must now track. Either is defensible; the [] with direct reads is not.",
                  "hint": "Which values does the callback read, and at which render were they frozen? Then: should activity changes restart the episode, or be read through?"
                },
                {
                  "prompt": "The linter demands `fetchUser` in deps: useEffect(() => { fetchUser(id).then(setUser); }, [id]) where fetchUser is defined in the component reading `apiBase` from props. Enumerate the four honest resolutions from the lesson menu, and rank them for this case with one-line justifications.",
                  "solution": "(1) Move it in: define the fetch inline in the effect using apiBase directly — deps become [id, apiBase]; best here: the function was single-use plumbing, and the real reactive atoms (id, apiBase) now appear honestly. (2) Hoist: move fetchUser(apiBase, id) to module scope taking apiBase as an argument — deps [id, apiBase] again; equally good, better if reused elsewhere. (3) useCallback(fetchUser, [apiBase]) and deps [id, fetchUser]; works, but adds a cache layer whose only job is repairing an identity you created unnecessarily — weakest of the correct options. (4) Suppress/omit: not on the menu — fetchUser closes over apiBase; omitting it freezes apiBase at mount (theorem), which is exactly the multi-environment bug (staging URL after env switch) that 'mysteriously requires a refresh'. Ranking: (1) ≈ (2) > (3) ≫ (4-is-a-bug. General rule executed: prefer moving construction to the atoms over stabilizing identities.",
                  "hint": "The function is a made-up identity wrapping two atoms. Where can the atoms appear directly?"
                },
                {
                  "prompt": "A code reviewer sees deps [user] on an effect that reads only user.id, and profiling shows the effect churns on every keystroke of an unrelated profile form (which setUser's a new object per keystroke). Explain the mechanism, the fix, and then the subtle follow-up: why does the fix ALSO protect the effect from a future refactor where user updates become more frequent?",
                  "solution": "Mechanism: deps compare by Object.is; the form's controlled updates produce a new user object per keystroke (immutable update — correct per Unit 3!), so [user] fails equality every render even though user.id never changed: episode churn from identity, not meaning. Fix: const id = user.id in render; effect reads/depends on [id] — a primitive with value semantics; keystrokes leave it Object.is-equal, so the effect is quiescent. Follow-up: the narrowed dep is a SEMANTIC declaration — 'this synchronization is defined by the id alone'. Any future increase in user-object update frequency (live presence fields, collaborative edits) is automatically irrelevant to this effect; with [user], every such feature would silently multiply reconnections, and the effect's behavior would degrade at a distance from the change that caused it. Narrowing deps to the atoms the effect truly reads makes its cost profile invariant under unrelated evolution — dependency hygiene is future-proofing, not just churn-fixing.",
                  "hint": "What does Object.is say about a correctly immutably-updated object? What does the effect actually READ from it?"
                },
                {
                  "prompt": "Prove or refute: 'wrapping every callback in useCallback and every object in useMemo, then listing them in deps, is semantically equivalent to depending on the underlying primitives.' Consider correctness AND failure modes under maintenance.",
                  "solution": "Refute equivalence, though the happy path coincides. Correctness today: useCallback/useMemo with honest inner deps produce identities that change exactly when their atoms change, so effects keyed on them fire when [atoms] would — equivalent behavior. Failure modes that break equivalence: (1) the stabilizers' own dep arrays carry the same honesty obligation, now one indirection away — an omitted atom in the useCallback's array freezes it inside the callback, and the effect sees stale values WHILE its deps 'correctly' never change: the theorem's hole, relocated where the linter's finding is easier to misread. (2) Memoization is a cache, not a contract (Unit 7): React may discard memoized values (and future compilers/modes make this explicit) — identity stability is best-effort, so treating it as a semantic key is building on sand; primitives' value equality is guaranteed by the language. (3) Maintenance: each layer of stabilization is a site where a refactor can silently widen or narrow the reactive set. Verdict: depending on primitives is strictly more robust; stabilizers are for values that must cross component boundaries as single things (props, context), not a general substitute for atom-level deps.",
                  "hint": "Where does the honesty obligation GO when you wrap? And what does React guarantee about a memoized identity?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l2-i1",
              "front": "What does the dependency array actually declare?",
              "back": "The staleness condition of the episode: every reactive value the effect's closure reads. It's an honesty description of the closure's inputs, not a re-run schedule you configure."
            },
            {
              "id": "u6l2-i2",
              "front": "State the stale-closure theorem's three clauses about an omitted dep.",
              "back": "The effect operates on the old snapshot silently (no error), unboundedly (gap grows forever), and latently (registered callbacks carry the stale value into arbitrarily later moments)."
            },
            {
              "id": "u6l2-i3",
              "front": "The honest menu when a dep 'causes too many re-runs'?",
              "back": "Move the value into the effect, use updater-form setState, narrow to primitive atoms (user.id not user), split falsely-coupled effects, or effect-events/latest-refs for read-latest requirements. Never delete the dep."
            },
            {
              "id": "u6l2-i4",
              "front": "Why do object/function deps churn effects, and the preferred cure?",
              "back": "Render recreates identities; Object.is fails every pass. Depend on the primitive atoms and build the object/function inside the effect (hoist constants; useMemo/useCallback only when it must cross a boundary)."
            },
            {
              "id": "u6l2-i5",
              "front": "What are effect events (useEffectEvent) / the latest-ref pattern for?",
              "back": "The mixed case: deps define the episode (reconnect on roomId); effect-events/refs give always-current reads for values that must NOT define the episode (log the current theme)."
            },
            {
              "id": "u6l2-i6",
              "front": "What does `[] // eslint-disable-line` actually assert, and why is it toxic?",
              "back": "'No reactive value this closure reads will ever matter after mount' — usually false, and the suppression muzzles the linter for every future edit: bugs ship silently."
            }
          ]
        },
        {
          "id": "u6l3",
          "title": "You Might Not Need an Effect",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The necessity test",
              "body": "Effects are the most powerful escape hatch in React, and for exactly that reason the react.dev docs dedicate their longest page to *not using them*. The failure pattern is always the same: an effect deployed where no external system exists — React talking to itself through the outside lane, paying latency and bug-surface for the detour. The necessity test comes straight from Lesson 1's model: **an effect is warranted iff you are synchronizing something outside React with rendered state — because the component is on screen.** Two clauses, both load-bearing. *Outside React*: if the code only reads React state and writes React state (setState in, setState out), no external system exists and the effect is a self-loop — the work belongs in render (derivation) or in the handler (event logic). *Because it's on screen*: if the work should happen because **the user did something**, its cause is the event, not the render — it belongs in the handler even if it touches external systems (posting a form is handler work; keeping a chat connected is effect work). Everything this lesson catalogs is one of those two misplacements, and each carries the same twin costs: an **extra render pass** (setState from an effect always schedules a second pass — the first committed frame is already on screen) and a **tearing window** (between the two commits, the screen shows mutually inconsistent state)."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The state-echo effect: one wasted pass and a visible inconsistency window",
              "statement": "Consider state s and a derived value d = g(s) stored as state and maintained by an effect: useEffect(() => setD(g(s)), [s]). For every change to s: (1) React completes a full render-and-commit pass in which the screen shows (s_new, d_old = g(s_old)) — an inconsistent frame observable by the user and by every effect and child of that commit; (2) the effect then schedules a second full pass to reach (s_new, g(s_new)) — doubling the render work of the update; (3) under any additional latency (concurrent interruption, layout effects, slow subtree) the inconsistency window is user-visible for its full duration. Computing d in render — const d = g(s) — produces (s_new, g(s_new)) in the *first* pass: zero extra work, zero window, by the snapshot model's within-frame consistency (Unit 3 / Unit 4's derivation proposition).",
              "proof": "(1) Effects run after commit (pipeline placement, Lesson 1): the pass triggered by setS commits and may paint before the effect executes; in that committed frame d still holds g(s_old) — both values are live state, so every consumer renders the mismatched pair. (2) setD schedules a new render (it cannot affect the committed one); this pass re-renders the component and its children again — the update's total cost is two full passes wherever one sufficed. (3) The window between the commits is bounded below by effect-scheduling latency and above by nothing in particular: any work interleaved between the passes extends it. The render-computed alternative reads s from the current snapshot; d = g(s) is evaluated within the same invocation, so no committed frame can exist where the pair disagrees (per-render constants, Unit 3). ∎"
            },
            {
              "type": "code",
              "heading": "The catalog: five effects that should not exist",
              "lang": "jsx",
              "code": "// 1) DERIVED STATE ECHO — the proposition's subject\n// ✗ const [fullName, setFullName] = useState('');\n//   useEffect(() => setFullName(first + ' ' + last), [first, last]);\n// ✓ const fullName = first + ' ' + last;            // render derivation\n// ✓ const visible = useMemo(() => expensiveFilter(items, q), [items, q]);\n\n// 2) EVENT LOGIC IN AN EFFECT — cause is the user, not the render\n// ✗ useEffect(() => { if (submitted) { post('/order', cart); toast('Sent!'); } }, [submitted]);\n// ✓ async function handleSubmit() { await post('/order', cart); toast('Sent!'); }\n// The ✗ version also fires on remount replays (StrictMode!) and needs a\n// flag-state to fake 'only once' — state whose only job is impersonating\n// an event. If you must set a flag to make an effect behave, it was a handler.\n\n// 3) RESET-ON-PROP-CHANGE — an effect impersonating identity\n// ✗ useEffect(() => { setDraft(''); setErrors(null); }, [conversationId]);\n// ✓ <Composer key={conversationId} …/>   // Unit 2: new address ⇒ fresh state,\n//                                        // atomically, with no torn frame\n\n// 4) PARENT NOTIFICATION ECHO — round-tripping data through an effect\n// ✗ useEffect(() => { onChange(value); }, [value]);   // child tells parent late\n// ✓ function handleChange(next) { setValue(next); onChange(next); } // same event,\n//   one pass: both updates batch together (Unit 3) — no lagging frame where\n//   parent and child disagree.\n\n// 5) CHAINED EFFECTS — a state machine laundered through commits\n// ✗ useEffect(() => { if (card) setGoldCount(c => c+1); }, [card]);\n//   useEffect(() => { if (goldCount > 3) setRound(r => r+1); }, [goldCount]);\n//   useEffect(() => { if (round > 5) setGameOver(true); }, [round]);\n//   — three extra full passes per play, each with a torn intermediate frame\n// ✓ One transition in the handler (or a reducer, Unit 4): compute the\n//   entire next state — new card, count, round, gameOver — in one place,\n//   one pass, atomically. Effects are not a control-flow mechanism."
            },
            {
              "type": "example",
              "heading": "Worked example: dissolving an effect chain into a transition",
              "body": "A quiz app ships this: answering updates `answers`; an effect watches answers and sets `score`; another watches score and sets `level`; a third watches level and, at the max level, fires confetti *and* posts completion to the server. Symptoms in production: a flash of the old level after the last answer (torn frames — the proposition's window, three deep), analytics showing intermittent double-posts (StrictMode replays plus the chain re-firing when an unrelated render slips between links), and profiler traces showing four render passes per answer. Apply the necessity test link by link. score = g(answers): derivation — delete the cell, compute in render (or useMemo). level = h(score): derivation of a derivation — same. The confetti and the POST: genuinely external (DOM particles, network) — but their *cause* is 'the user submitted the final answer', an event, not 'the component rendered with level == max', a state. Both belong in the answer handler, behind the same transition that computes the new answers: `const next = [...answers, a]; if (h(g(next)) === MAX) { fireConfetti(); postCompletion(next); } setAnswers(next);`. Final architecture: one state cell, two render derivations, one handler with the side effects at their cause — one pass per answer, no windows, no replays. The refactor deleted two state cells, three effects, and both bugs; nothing was added. That is the usual shape of this cleanup: **the correct version is smaller.**"
            },
            {
              "type": "text",
              "heading": "The legitimate residue — what still deserves an effect",
              "body": "After the purge, what remains? Exactly the synchronizations of Lesson 1, and it is worth naming them positively so the lesson doesn't read as 'effects considered harmful'. **Subscriptions** — event sources that push (sockets, stores, BroadcastChannel, media queries, resize/scroll): setup subscribes, cleanup unsubscribes; the external system is the point. (For subscribable *data stores* specifically, useSyncExternalStore is the sharper tool — Unit 8 — but the effect version is not wrong, just weaker under concurrency.) **Imperative third-party islands** — a map, chart, or video widget with its own API: an effect keeps its imperative state in agreement with your props (setOptions on change; destroy in cleanup). **Browser state that React doesn't own** — document.title, focus management after render, scroll restoration, localStorage mirroring (with the multi-tab caveat from Unit 5's exercise). **Network fetching driven by displayed params** — legitimately an effect in raw React (data must agree with the URL/params on screen), with the race-condition protocol Unit 9 formalizes; in production apps a query library or the framework's loader usually owns this synchronization, which is the same model at a better altitude. The discipline that keeps the residue healthy is Lesson 1's: per effect, name the external system and the rendered values it agrees with. If naming the system takes the word 'React', it isn't one."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The refactoring order that works.** When you find an effect-shaped bug, don't debug the effect — reclassify it. Ask, in order: (1) Is the written state computable from other state? → render derivation (delete the cell). (2) Is the cause a user action? → move to the handler (delete the effect). (3) Is it identity-reset logic? → key (delete the effect AND the reset code). (4) Is there a real external system? → keep the effect; now apply Lesson 2's dependency honesty to it. Teams that apply this checklist in review report the same experience: most effects marked 'flaky' never get fixed — they get *deleted*, and the bug leaves with them."
            },
            {
              "type": "example",
              "heading": "Worked example: the borderline cases that teach the boundary",
              "body": "Three cases that look alike and split three ways. **(A) 'Save the draft to localStorage as the user types.'** External system (storage), cause is 'this state is on screen and changing' — a true synchronization: effect with deps [draft], likely debounced. Handler placement would scatter the save across every mutation site; the effect centralizes agreement — correct as an effect. **(B) 'Send an analytics event when the user opens the accordion panel.'** The verb is the tell: *opens* is an event. Handler: `onClick={() => { setOpen(true); track('panel_opened'); }}`. An effect on [open] fires on any code path that opens the panel — including a future 'expand all' button, a deep-link restore, StrictMode replays — silently converting 'user opened' into 'was open at some commit': wrong *meaning*, not just wrong timing. **(C) 'Send an analytics event when the results of a search are visible.'** Now the requirement genuinely is about displayed state ('an impression'), not any single user action — several events (typing, filtering, back-navigation) can cause it. Effect on [resultsPageId] is honest; deduplication policy (once per id?) is part of the *requirement*, expressed in the effect. A and C look identical to B in code shape — state change, external call — but the *requirement's subject* differs: B is about an action; A and C are about a displayed condition. The boundary is semantic, and only the requirement, never the code shape, can place it."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Classify each and give the correct home (render / handler / key / keep-as-effect), with the failing scenario if misplaced: (a) filtering a product list by the search box value; (b) POSTing a signup when the form is submitted; (c) clearing form fields when the user chooses a different account to edit; (d) keeping a Leaflet map's center in agreement with a `center` prop; (e) setting a `hasError` state when `items.some(isInvalid)`.",
                  "solution": "(a) Render derivation — visible = items.filter(…); as an effect+state it's the echo proposition: extra pass plus a frame where the list disagrees with the box. (b) Handler — the cause is submission; as an effect on [submitted] it double-fires under StrictMode replays and needs a fake done-flag. (c) key={accountId} on the form — identity reset (Unit 2); the effect version leaves a torn frame with the old draft against the new account and must enumerate every field forever. (d) Keep as effect — external imperative system (the map instance) synchronized with rendered state: map.setView(center) on [center], with instance teardown in cleanup. (e) Render derivation — hasError isn't state at all: const hasError = items.some(isInvalid); the stored version is a stored derivation with an invalidation obligation (Unit 4) plus the echo costs.",
                  "hint": "Apply the two-clause test: is anything outside React involved, and is the cause an action or a displayed condition?"
                },
                {
                  "prompt": "Using the state-echo proposition, compute the pass count and describe every committed frame for one keystroke in this component: setFirst triggers it; useEffect(() => setFull(first+' '+last), [first, last]); useEffect(() => setInitials(initialsOf(full)), [full]). Then give the corrected component and its pass count.",
                  "solution": "Pass 1: commit (first', last, full_old, initials_old) — TWO stale derived values on screen. Effect 1 fires: setFull. Pass 2: commit (first', full', initials_old) — initials still stale (its effect keys on full, which just changed). Effect 2 fires: setInitials. Pass 3: commit fully consistent. Total: 3 full render passes and 2 inconsistent committed frames per keystroke — with the chain length as the multiplier (n chained echoes ⇒ n+1 passes, n torn frames). Corrected: const full = first+' '+last; const initials = initialsOf(full); — zero extra state, one pass, no inconsistent frame (within-render consistency of Unit 3). If initialsOf were genuinely expensive: useMemo(() => initialsOf(full), [full]) — still one pass; memoization caches within the pipeline instead of echoing through it.",
                  "hint": "Walk commit-by-commit; each effect's setState is a NEW pass. What does the screen show between them?"
                },
                {
                  "prompt": "A reviewer finds: useEffect(() => { if (justLoggedIn) { navigate('/dashboard'); setJustLoggedIn(false); } }, [justLoggedIn]) — with setJustLoggedIn(true) called in the login handler. Name the pattern, explain what the boolean actually is, and refactor. Then explain why the same-shaped code with `!user && navigate('/login')` on [user] IS legitimate.",
                  "solution": "Pattern: event smuggling — state whose only purpose is carrying a one-shot event across the render boundary into an effect, then un-setting itself (the tell: a flag that exists to be immediately cleared). The boolean is a hand-rolled event bus with worse semantics: replays under StrictMode, an extra pass, and a frame where 'logged in but still on /login' is committed. Refactor: the cause is the login success event — navigate in the handler: async function handleLogin() { await login(); navigate('/dashboard'); } — flag deleted, effect deleted. The !user redirect differs semantically: it guards a DISPLAYED CONDITION, not an action — 'this route must never be visible without a user' must hold on session expiry, deep links, token refresh failure, back-navigation: many causes, one invariant about what's on screen. Condition-shaped requirements are effect-shaped (or router-guard-shaped, the same logic at better altitude); action-shaped requirements are handler-shaped. Same code silhouette, opposite subjects — the requirement, not the shape, decides.",
                  "hint": "What does the flag exist to do? Compare: how many distinct causes can put each situation on screen?"
                },
                {
                  "prompt": "Your team inherits: const [width, setWidth] = useState(0); useEffect(() => { setWidth(ref.current.offsetWidth); }, [items]) — measuring a list after items change to size a virtualized viewport; users report a one-frame flash of mis-sized rows after every update. Explain the flash from pipeline placement, and fix it with the right tool (state the tier and why), noting what must be true for the fix not to regress performance.",
                  "solution": "Mechanism: useEffect runs AFTER paint — pass 1 commits and paints rows sized by the stale width (the flash), then the effect measures and setWidth triggers pass 2 with correct sizes. This is a legitimate synchronization (reading real DOM layout — an external fact) placed in the wrong TIER. Fix: useLayoutEffect — it runs after commit but BEFORE paint: measure, setWidth, and React re-renders synchronously before the browser ever paints, so no mis-sized frame is visible. Performance condition: the measure-and-rerender now sits inside the frame budget — the measured subtree's second render must be cheap (narrow the re-rendered scope; memoize rows) or the cure becomes jank of a different kind; and the effect must guard against loops (only setWidth when the measurement actually changed — Object.is check — else measure→set→layout-effect→measure ping-pongs). Layout effects are precisely for read-layout-then-adjust; they earn their paint-blocking cost only when a visible intermediate frame is the alternative.",
                  "hint": "Which tier runs before paint? What new cost does moving there introduce, and what guard prevents an infinite measure loop?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l3-i1",
              "front": "The effect-necessity test, both clauses?",
              "back": "An effect is warranted iff synchronizing something OUTSIDE React with rendered state BECAUSE it's on screen. No external system ⇒ derive or handle; cause is a user action ⇒ handler, even if external."
            },
            {
              "id": "u6l3-i2",
              "front": "What does a state-echo effect (setState-from-state) cost, exactly?",
              "back": "One extra full render pass per change, plus a committed inconsistent frame between the passes — chains multiply both (n echoes ⇒ n+1 passes, n torn frames)."
            },
            {
              "id": "u6l3-i3",
              "front": "The five catalog entries of effects-that-shouldn't-exist?",
              "back": "Derived-state echo, event logic in effects, reset-on-prop-change (use key), parent-notification echo, and chained effect state machines (use one transition/reducer)."
            },
            {
              "id": "u6l3-i4",
              "front": "Action-shaped vs condition-shaped requirements — why does it decide effect vs handler?",
              "back": "'User did X' has one cause: the handler. 'X must hold while displayed' has many causes (deep links, expiry, restores): an effect/guard on the condition. The requirement's subject decides, not code shape."
            },
            {
              "id": "u6l3-i5",
              "front": "The legitimate residue that stays effect-shaped?",
              "back": "Subscriptions, imperative third-party islands, browser state React doesn't own (title, focus, storage), and param-driven fetching (with race protocol — or a query library owning it)."
            },
            {
              "id": "u6l3-i6",
              "front": "The reclassification checklist for a flaky effect?",
              "back": "(1) Computable from state? → render. (2) Caused by an action? → handler. (3) Identity reset? → key. (4) Real external system? → keep, then fix deps honestly. Most flaky effects get deleted, not fixed."
            }
          ]
        },
        {
          "id": "u6l4",
          "title": "Refs and the DOM",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The deliberate hole in the snapshot system",
              "body": "Everything since Unit 3 has been about values that live *inside* render semantics: per-render constants, queued updates, deps compared per commit. This lesson is about the sanctioned hole in that system. `useRef(initial)` returns a box — `{ current }` — with three defining properties: it is **stable** (the same object every render, for the instance's lifetime — Unit 5's toy showed why: the cell stores the box itself), it is **mutable** (write `.current` any time), and it is **invisible to rendering** (writing it schedules nothing, and no comparison anywhere — deps, memo, Object.is bailouts — ever notices it change). A ref is precisely *instance-lifetime storage outside the reactive dataflow*: the escape hatch you use when you need persistence without participation. The two canonical needs: (1) **holding non-rendered machinery** — timer ids, connection objects, an in-flight flag (Unit 3's double-click guard), the previous value of something, latest-value mirrors (Lesson 2); (2) **reaching the DOM** — getting your hands on the actual host node that commit produced, for the small set of jobs that are irreducibly imperative: focus, scroll, measure, text selection, media playback. The discipline that keeps the hole safe is a single rule with a proof: refs may be read and written *only outside render* — in effects and handlers — never during the render computation itself."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Refs touched during render break the purity contract's guarantees",
              "statement": "Let a component read or write ref.current during its render (outside the sanctioned lazy-initialization idiom). Then: (1) **writes** during render make the render observably non-idempotent — StrictMode's double invocation and any discarded concurrent render (Unit 8) apply the mutation a different number of times than a single pass, so instance behavior depends on React's schedule; (2) **reads** during render make the output depend on a value invisible to every change-detection mechanism — the component renders differently for the same props/state/context, yet nothing (no deps, no memo comparison, no parent update) knows to re-render it when the ref changes, so the screen is stale by construction; (3) both violations are silent today and become bugs exactly when the runtime exercises its licensed freedoms (double-render, interruption, memoized skip). Conversely, confining ref access to effects and handlers preserves all Unit 1–3 guarantees: those sites run outside the render computation, where mutation is already the contract's business.",
              "proof": "(1) Render idempotence (Unit 1) requires k render invocations before a commit to be unobservable versus one; a ref write is an observable persistent mutation (the box outlives the call), so k invocations produce k applications — e.g. ref.current++ counts renders including discarded ones, and any logic keyed to it diverges under StrictMode versus production. (2) The rendered output becomes a function of (props, state, context, ref.current), but React's re-render triggers are exclusively state/props/context changes (Units 2–3); a ref mutation triggers nothing, and memoized ancestors legitimately skip re-renders assuming output is determined by compared inputs — the assumption clause (1) of the purity contract exists to protect. Hence frames where ref.current has changed but the screen renders its old consequence are reachable and unfixable-by-React. (3) follows from (1)+(2): the misbehaviors require only schedules React is licensed to use. The converse: effects and handlers run post-commit/post-event where the contract already permits arbitrary mutation; ref access there is ordinary imperative code, sequenced after the pure computation completes. ∎ (The one sanctioned render-time idiom — `if (ref.current === null) ref.current = expensiveInit()` — is idempotent by its guard and populates a value never read by render output; it is lazy initialization, not dataflow.)"
            },
            {
              "type": "code",
              "heading": "Ref or state? The decision is 'who must react?'",
              "lang": "jsx",
              "code": "// STATE: the screen must change when it changes.  REF: nothing renders it.\n\n// Interval id — machinery, never rendered → ref\nconst timerRef = useRef(null);\nfunction start() { timerRef.current = setInterval(tick, 1000); }\nfunction stop()  { clearInterval(timerRef.current); }\n\n// In-flight guard (Unit 3's double-click) — must be read/written\n// SYNCHRONOUSLY within one event, can't wait for a re-render → ref\nconst inFlight = useRef(false);\nasync function handlePay() {\n  if (inFlight.current) return;      // read in a HANDLER: sanctioned\n  inFlight.current = true;\n  try { await api.pay(); } finally { inFlight.current = false; }\n}\n\n// Elapsed seconds DISPLAYED to the user → state (screen must react)\nconst [seconds, setSeconds] = useState(0);\n\n// THE CLASSIC MISTAKE — a rendered value in a ref:\n// <span>{countRef.current}</span> with countRef.current++ in a handler\n// → the number on screen NEVER updates (no render is scheduled), until\n// some unrelated state change re-renders and it 'jumps'. Stale by\n// construction: proposition clause (2) live on screen.\n\n// DOM refs: React fills .current with the host node at commit\nconst inputRef = useRef(null);\n<input ref={inputRef} />\nuseEffect(() => { inputRef.current.focus(); }, []);  // after commit: node exists\n\n// Ref callbacks — for dynamic collections (a ref per list item):\nconst nodes = useRef(new Map());\n{items.map(it => (\n  <li key={it.id} ref={node => {\n    if (node) nodes.current.set(it.id, node);\n    else nodes.current.delete(it.id);        // null on unmount: cleanup\n  }}>…</li>\n))}\n// scrollTo(id): nodes.current.get(id)?.scrollIntoView() — a keyed map of\n// live nodes, maintained by the ref callbacks' attach/detach protocol."
            },
            {
              "type": "text",
              "heading": "DOM refs: timing, ownership, and the boundary of legitimacy",
              "body": "Two facts govern DOM refs. **Timing**: React assigns `ref.current` during commit — after the node exists, before effects run. Therefore effects (either tier) may safely use the node; render may not (it doesn't exist yet on mount, and reading it is a proposition-clause-2 violation anyway). Layout effects see the node before paint — the measure-then-position jobs of Lesson 3's exercise live there. **Ownership**: a DOM ref hands you the real node, and with it the ability to fight React. The legitimacy boundary: use the node for what React deliberately doesn't model — focus, scroll position, text selection, measurement, media play/pause, canvas drawing, integrating an imperative widget — and never for what it does model: mutating attributes, styles, or children that React renders (`node.style.display = 'none'` behind React's back will be silently reverted by the next commit that touches the node, or worse, won't be — divergence either way; the honest version is state). The test: *could a re-render legitimately overwrite what I just did?* If yes, you are writing to React's territory imperatively — move it into the description. If no (focus isn't in any JSX; scroll position isn't rendered), the imperative act is yours. For third-party imperative widgets, the pattern composes both facts: instantiate in an effect against the node, feed prop changes to the widget's API in effects keyed on those props, destroy in cleanup — an island of imperative code fenced by synchronization."
            },
            {
              "type": "example",
              "heading": "Worked example: exposing a handle — refs across component boundaries",
              "body": "A design-system `<SearchField>` wraps an input in decoration. Callers legitimately need focus control ('focus the search on `/` keypress') — but handing out the raw input node invites the whole imperative arsenal. The layered solution: **(1) Pass the ref through**: function components accept `ref` as a prop (React 19; earlier via forwardRef) — `<SearchField ref={fieldRef}/>` with the component attaching it to its inner input: full node access, maximal trust. **(2) Narrow the contract with useImperativeHandle**: `useImperativeHandle(ref, () => ({ focus: () => inputRef.current.focus(), clear: () => setValue('') }), [])` — the parent's ref.current is now a *curated API object*, not a DOM node: it can focus and clear, and nothing else; the input's node stays private, so the component is free to restructure its DOM without breaking callers. This is encapsulation applied to the escape hatch — the imperative surface becomes a designed API with the same review standards as props. **(3) Ask whether the handle is needed at all**: 'focus on mount' is `autoFocus`; 'focus when errored' can be an effect *inside* SearchField keyed on an `error` prop — the declarative route often dissolves the need. The ordering is the point: default declarative; expose a narrow handle when a genuinely imperative verb (focus, scrollTo, play) must cross a component boundary; expose raw nodes almost never."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**flushSync is the bridge between state and DOM timing — use it at interop boundaries only.** Sequence matters in imperative code: 'add the item, then scroll the list to it' fails if written as setItems(…); listRef.current.lastChild.scrollIntoView() — the setState is batched (Unit 3); the DOM at the next line still shows the old list, so you scroll to the previous last child. flushSync(() => setItems(…)) forces render-and-commit synchronously; the next line reads the updated DOM. It is the same tool as Unit 3's escape hatch, seen from the ref side, and the same warning applies: every flushSync is a batching defeat and a synchronous render on the event path — reach for it when an imperative API needs post-update DOM within the same event (scroll-to-new, print, focus-new-row), not as a 'make React synchronous' comfort blanket."
            },
            {
              "type": "example",
              "heading": "Worked example: the previous-value ref and what it teaches",
              "body": "A common need: show a delta — 'score went up by 12'. The pattern: `const prevScore = useRef(score); useEffect(() => { prevScore.current = score; });` (no deps array: runs after *every* commit). During render, `const delta = score - prevScore.current` — wait: that *reads a ref during render*, which the proposition forbids… or does it? Walk it precisely. The ref is written only in an effect (post-commit); during any single render, prevScore.current is constant (it changes between renders, not within), and — the crucial part — every write to it is paired with a render that already happened, so a read during the *next* render sees 'the value as of the last commit', a well-defined function of the render history. This idiom sits exactly on the boundary: it works, it is widespread, and clause (2)'s warning still applies in a precise form — if score is memoization-skipped or the component doesn't re-render after the effect writes, delta is stale. The honest assessments: for display logic, deriving the delta *upstream* (store both score and prevScore in state, updated together in the transition — Unit 4's atomicity) is strictly more principled: the delta becomes reactive data with snapshot semantics. The ref version is the pragmatic shortcut whose failure modes you now know how to enumerate. The meta-lesson is the real content: **you can reason about escape-hatch idioms** — the propositions tell you exactly which guarantee each one trades away, so 'is this ref pattern safe?' stops being folklore and becomes a checklist: who writes it, who reads it, in which phase, and which schedule freedoms would expose the difference."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Ref or state, with one-line justification from 'who must react': (a) the WebSocket instance; (b) whether the mobile nav drawer is open; (c) the id returned by requestAnimationFrame in a spring animation loop; (d) the number of unread messages shown in the tab badge; (e) which onboarding step the user is on; (f) the DOM node of the currently-highlighted row for scrollIntoView.",
                  "solution": "(a) Ref — machinery; nothing renders the socket object itself (its MESSAGES become state via handlers). (b) State — the screen is the subject. (c) Ref — bookkeeping for cancellation; rendering never shows it. (d) State — rendered in the badge (and the title effect reads it as a dep). (e) State — drives what's displayed. (f) Ref (a DOM ref, likely via a keyed ref-callback map) — the node is imperative territory; but WHICH row is highlighted is state (screen shows it), and the ref map is merely the state-to-node bridge for the scroll verb. The pattern in (f) generalizes: state decides, refs execute.",
                  "hint": "One question each: if this value changes, must the screen change because of it?"
                },
                {
                  "prompt": "Diagnose completely: function RenderCounter() { const renders = useRef(0); renders.current++; return <div>Rendered {renders.current} times</div>; } — it 'works' in production builds. List every guarantee it violates, what StrictMode shows, and write a correct version of the actual underlying requirement ('show how many times data X refreshed').",
                  "solution": "Violations: a ref WRITE during render (proposition clause 1 — non-idempotent: discarded/doubled renders increment it, so the number measures React's schedule, not anything semantic) and a ref READ during render feeding output (clause 2 — no mechanism re-renders when it changes; here it accidentally 'works' only because the write happens during the same render that reads it). StrictMode: counts by 2 (or shows dev/prod divergence) — the smoke detector correctly flagging that render count is not a well-defined application fact. The real requirement is about DATA refreshes, an event you own: const [refreshCount, setRefreshCount] = useState(0) incremented in the refresh handler (or derived from the query library's dataUpdatedAt). 'How many times did React render' is not an application-level fact at all — it's a profiling question, answered by the Profiler API/DevTools, not by application state. Half the fix is recognizing the requirement was miscast.",
                  "hint": "What does the number actually count under double-invocation? Then: what event does the product REALLY want counted?"
                },
                {
                  "prompt": "Implement 'after adding a todo via the form, scroll the new item into view and focus the input for the next entry' — correctly ordered. Show why the naive version scrolls to the wrong element, and where flushSync and refs each earn their place.",
                  "solution": "Naive: function handleAdd() { setTodos(t => [...t, next]); listRef.current.lastElementChild.scrollIntoView(); inputRef.current.focus(); } — setTodos is batched; the DOM still shows the OLD list, so lastElementChild is the previous last todo: scrolls one short. Correct: function handleAdd() { flushSync(() => setTodos(t => [...t, next])); listRef.current.lastElementChild.scrollIntoView({ block: 'nearest' }); inputRef.current.focus(); } — flushSync forces render+commit of the new item before the next statement, so the imperative reads see the updated DOM. Roles: refs are the bridges to real nodes (list container, input); flushSync is the ordering bridge (post-update DOM within the same event); focus/scroll are legitimately imperative verbs (React doesn't model them). Costs acknowledged: one synchronous render on the event path — acceptable per explicit user action; an alternative avoiding flushSync is an effect keyed on todos.length scrolling in the commit's aftermath, at the price of moving the logic away from its cause (defensible either way; the flushSync version keeps event logic in the event).",
                  "hint": "When does the batched commit happen relative to the next line? What forces it earlier?"
                },
                {
                  "prompt": "A team wraps a video player: <VideoPlayer ref={r} src url controls…/>. The exposed handle is the raw <video> node, and callers have started calling node.load(), mutating node.src, and toggling node.controls directly — with bugs whenever React re-renders the player. Prescribe the redesign: what the handle should expose, what must become props/state, and the rule that decides each item — then explain why the raw-node handle was the root cause rather than the callers' 'misuse'.",
                  "solution": "Redesign: useImperativeHandle exposing only the irreducibly imperative verbs — { play(), pause(), seek(t) } (media element commands with no declarative equivalent; even these could partially be props like `playing`, a design choice). Everything React can model becomes props: src, controls, muted, playbackRate — the component renders <video src={src} controls={controls}…/> and callers change them by re-rendering with new props. The deciding rule per item: 'could a re-render legitimately overwrite this?' — src/controls appear in the JSX description, so imperative writes to them fight commit (the observed bugs: React re-rendering reverts node.src, or diverges from it); play/pause/currentTime are NOT in the description — they're browser-held, imperatively-owned facts, safe to command. Root cause analysis: exposing the raw node made the entire imperative surface the de facto API — callers 'misused' nothing; they used exactly what the handle offered. An escape hatch's breadth IS its contract: narrow handles (curated verb objects) make the wrong thing inexpressible, which is Unit 4's unrepresentability principle applied to imperative APIs.",
                  "hint": "Sort every capability by the could-a-re-render-overwrite-it test; then ask what API the raw node implicitly promised."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u6l4-i1",
              "front": "The three defining properties of useRef's box?",
              "back": "Stable (same object every render for the instance's life), mutable (write .current anytime), invisible to rendering (writes schedule nothing; no comparison ever notices)."
            },
            {
              "id": "u6l4-i2",
              "front": "Why must refs not be read or written during render?",
              "back": "Writes break idempotence (doubled/discarded renders apply them differently); reads make output depend on a value no re-render trigger watches — stale screens by construction. Effects/handlers are the sanctioned sites."
            },
            {
              "id": "u6l4-i3",
              "front": "Ref vs state — the one-question decision?",
              "back": "'Must the screen react when this changes?' Yes → state. No (machinery: timer ids, connections, in-flight flags, DOM nodes) → ref. State decides, refs execute."
            },
            {
              "id": "u6l4-i4",
              "front": "When is touching the DOM through a ref legitimate?",
              "back": "Only for what React doesn't model: focus, scroll, selection, measurement, media commands, canvas, imperative widgets. Test: could a re-render legitimately overwrite it? Then it belongs in the description, not the node."
            },
            {
              "id": "u6l4-i5",
              "front": "What does useImperativeHandle change about an exposed ref?",
              "back": "ref.current becomes a curated API object (e.g. {focus, clear}) instead of a raw node — narrowing the imperative surface so the wrong operations are inexpressible and the internal DOM stays private."
            },
            {
              "id": "u6l4-i6",
              "front": "When do you need flushSync with refs?",
              "back": "When an imperative read/command needs the post-update DOM within the same event (scroll to the just-added row, print, focus the new field): it forces render+commit before the next statement — at the cost of defeating batching there."
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
            "prompt": "When an effect's dependency changes between commits, two functions run in a fixed order. Which runs first — and with which render's values? (Format: 'X, with the Y render's values')",
            "accept": [
              "cleanup, with the old render's values",
              "the cleanup, with the old render's values",
              "cleanup with the old render's values",
              "cleanup first, with the old render's values",
              "the previous cleanup, with the old snapshot",
              "cleanup, old render",
              "cleanup with old values"
            ],
            "explanation": "The previous episode's cleanup runs first, closing over ITS setup's (old) snapshot — which is what lets it name the right room/subscription to tear down — then the new setup runs with the new snapshot. Strict alternation: at most one live synchronization per effect.",
            "points": 1
          },
          {
            "id": "u6q2",
            "type": "mcq",
            "prompt": "A subscription callback registered in a mount-only effect ([]) tests incoming items against a `query` state variable. The user changes query from '' to 'rust'. What does the callback compare against, and why?",
            "options": [
              "'rust' — React re-binds effect closures to current state on each commit",
              "'rust' — state variables are live references shared across renders",
              "'' — the callback is a closure from the mount render; with query omitted from deps, no re-run ever replaces it, so it reads the mount snapshot forever",
              "It throws, because reading state inside a subscription callback is illegal"
            ],
            "answer": 2,
            "explanation": "The stale-closure theorem: the callback closes over the mount render's bindings; with query ∉ deps and [] never changing, the setup is never retired — clause (3): staleness rides registered callbacks indefinitely, silently. Fixes: put query in deps (episode per query), restructure so the callback doesn't read reactive values (accumulate via updater, filter in render), or an effect-event/latest-ref if the subscription must not churn.",
            "points": 1
          },
          {
            "id": "u6q3",
            "type": "numeric",
            "prompt": "A component has state a; effect E1 sets b = f(a) on [a]; effect E2 sets c = g(b) on [b]. The user triggers one change to a. How many full render-and-commit passes does React perform for this update in total? (Number only.)",
            "answer": 3,
            "explanation": "Pass 1 commits new a (with stale b, c on screen); E1 fires, setB → pass 2 (stale c still visible); E2 fires, setC → pass 3, finally consistent. The state-echo proposition: n chained echo effects cost n+1 passes with n torn intermediate frames. Render-time derivation (const b = f(a); const c = g(b)) does it in 1 pass with zero inconsistent frames.",
            "points": 1
          },
          {
            "id": "u6q4",
            "type": "multi",
            "prompt": "Which of these are legitimate uses of an effect, per the necessity test? (Select all that apply.)",
            "options": [
              "Keeping document.title equal to the unread-message count",
              "Setting fullName state whenever firstName or lastName change",
              "Subscribing to a WebSocket for the room shown on screen, with cleanup",
              "POSTing the order when the user clicks Buy",
              "Re-centering a Leaflet map instance when the center prop changes",
              "Clearing the form fields when the edited account's id changes"
            ],
            "answer": [
              0,
              2,
              4
            ],
            "explanation": "(a), (c), (e) synchronize genuine external systems (browser chrome, socket, imperative widget) with rendered state — the effect's exact job. (b) is a derived-state echo: compute in render. (d) is action-caused: handler work — an effect on [submitted] double-fires under replays and needs a fake flag. (f) is identity reset: key={accountId} does it atomically with no torn frame.",
            "points": 2
          },
          {
            "id": "u6q5",
            "type": "proof",
            "prompt": "Prove the stale-closure theorem: if an effect reads reactive value v but omits it from its deps array D, then whenever v changes while D's members do not, the live synchronization operates on v's old value — silently, unboundedly, and latently. Then prove the converse for v ∈ D. Ground every step in closure semantics and the effect lifecycle.",
            "rubric": [
              "Establishes the capture step: the effect function is a closure over its creating render's bindings (per-render constants), so its reads of v resolve to v(r₁) permanently",
              "Establishes the non-retirement step: re-runs are triggered only by Object.is changes among D's members; with v ∉ D and D unchanged, the old setup (and its registered callbacks) remains live",
              "Derives the three clauses: silent (closure capture is specified language behavior — nothing anomalous to detect), unbounded (later changes to v also trigger nothing), latent (callbacks registered by the setup outlive the commit and carry the stale binding)",
              "Proves the converse via the lifecycle: v ∈ D means any change runs cleanup(r₁) then setup(r₂) whose closure binds v(r₂); the alternation invariant ensures no code from the old episode survives, so reads never predate the live episode"
            ],
            "solution": "Capture: by Unit 3's snapshot proposition, each render is a function invocation with constant bindings; the effect function created at render r₁ closes over that environment, so every read of v inside it (or inside callbacks it registers) resolves to v(r₁) — permanently, since bindings are never mutated. Non-retirement: the lifecycle runs cleanup+setup iff some d ∈ D changed by Object.is since the last run. Under the hypothesis (v ∉ D, D unchanged at r₂ where v(r₂) ≠ v(r₁)), no re-run occurs: the r₁ setup remains the live synchronization. Clause 1 (silent): closure capture is correct JavaScript — no runtime anomaly exists; the effect simply computes with old data, indistinguishable at runtime from intended behavior. Clause 2 (unbounded): the argument applies at every subsequent render with the same D, so the divergence |v(now) − v(seen)| is limited by nothing in the system. Clause 3 (latent): any callback the setup registered (subscription handler, interval, event listener) is a closure over the same environment and executes arbitrarily later — the stale binding escapes the commit that created it. Converse: with v ∈ D, a change to v makes the deps comparison fail at r₂'s commit; the lifecycle runs cleanup with r₁'s closure (correctly naming the old resources), then setup whose closure binds v(r₂). By strict alternation, exactly one episode is live and all its code shares r₂'s snapshot; hence no read of v within the live episode can be older than the episode itself. ∎",
            "explanation": "This theorem is the entire theory of dependency arrays: deps are the retirement condition for closures. Once proved, 'exhaustive-deps' stops being a lint preference and becomes the linter checking the theorem's hypothesis for you.",
            "points": 3
          },
          {
            "id": "u6q6",
            "type": "open",
            "prompt": "Full review required. A PR contains: (1) an effect on [user] that reads only user.settings.locale and re-initializes a date-formatting library (currently churning on every profile keystroke); (2) an effect with empty deps and a lint suppression that registers a scroll listener calling trackScrollDepth(page.id); (3) a component that increments useRef(0).current during render to 'skip animation on first render'; (4) a form that clears its fields via an effect watching accountId; (5) a submit handler that does setSubmitted(true), with an effect on [submitted] that POSTs and shows a toast. For each: name the defect (with the governing theorem/proposition), the user-visible symptom, and the fix.",
            "rubric": [
              "(1) Identity-churn dep: [user] fails Object.is per keystroke though locale is unchanged — narrow to the primitive atom (const locale = user.settings.locale; deps [locale]); symptom: formatter re-init on every keystroke",
              "(2) Stale-closure hole behind a suppression: the listener captures mount-time page.id, so scroll depth is attributed to the first page forever after navigation; fix: deps [page.id] with listener re-registration (or effect-event for the read), and remove the suppression",
              "(3) Ref write during render: non-idempotent under StrictMode/discarded renders (the 'first render' flag flips at schedule-dependent times — animation skips or plays unpredictably in dev/concurrent); fix: derive the need from data (animate on item-added transitions), or set the flag in an effect (post-commit), where the write is sanctioned",
              "(4) Reset-by-effect: one committed torn frame showing old draft against new account plus an extra pass, and the effect must enumerate every field forever; fix: key={accountId} (identity reset, atomic)",
              "(5) Event smuggled through state: replay double-POST risk (StrictMode/remount), extra pass, and a committed frame inconsistent with the action; fix: POST and toast in the handler; delete the flag-effect pair"
            ],
            "solution": "(1) The effect's true reactive atom is user.settings.locale, a string; depending on [user] keys the episode to an object identity that immutable-update correctness REQUIRES to change per edit (Unit 3) — so the deps churn by design of the rest of the system. Symptom: date library re-initializes per keystroke (waste; possible flicker of formatted dates). Fix: read the atom in render, depend on [locale]; the effect becomes quiescent under profile edits and invariant to future user-object churn. (2) The suppressed [] freezes page.id at mount inside the scroll listener (stale-closure theorem, clause 3): after any client-side navigation, scroll analytics are attributed to the landing page — silently, forever (clauses 1–2). Fix: deps [page.id] so navigation retires and re-registers the listener closing over the current page — listener churn per navigation is trivial; alternatively an effect-event wrapping the track call if the listener must persist. Delete the suppression; it was hiding exactly this. (3) renders.current++ during render violates the ref-purity proposition (clause 1): StrictMode double-invocation and any discarded concurrent render advance the 'first render' flag without a corresponding commit, so the animation skip becomes schedule-dependent (skips in dev, plays in prod, or vice versa). Fix: the requirement 'don't animate initial content' is about DATA, not render count — key the animation to the transition that should animate (e.g. animate only items added after mount, tracked via state set in an effect), or set didMountRef in an effect (post-commit write is sanctioned) if the pragmatic flag is kept. (4) The clearing effect commits one frame pairing the new accountId with the old draft (state-echo proposition's window) and must be maintained field-by-field. Fix: <Form key={accountId}/> — Unit 2's identity reset destroys and remounts atomically; the effect and its field list are deleted. (5) setSubmitted(true) + effect is an event smuggled through state: StrictMode/remount replays can double-POST (the effect re-fires on remount with submitted still true), the toast lags a pass, and a frame commits where the UI claims submitted before the request exists. Fix: the cause is the click — async handler does the POST and toast directly; submitted state remains only if the UI renders it (button disabled), set in the same handler. Net effect of the review: three effects deleted, one narrowed, one re-keyed — the usual direction.",
            "explanation": "Five archetypes spanning the unit: identity-churned deps, suppression-hidden stale closures, render-phase ref abuse, effect-as-identity-reset, and event smuggling. The grader wants each tied to its governing result — the stale-closure theorem, the state-echo proposition, the ref-purity proposition — with the schedule-dependence (StrictMode/concurrent) failure modes named, not just 'move this code'.",
            "points": 4
          }
        ]
      }
    },
    {
      "id": "u7",
      "title": "Rendering Performance",
      "summary": "The re-render cost model and how to measure it, memoization as a soundness-conditional optimization built on referential equality, and the composition patterns that make memo unnecessary.",
      "references": [
        "react.dev — React.memo, useMemo, useCallback API references; React Developer Tools Profiler docs",
        "react.dev — React Compiler (automatic memoization) documentation",
        "Dan Abramov — 'Before You memo()' (overreacted.io, 2021) — the composition-first argument",
        "Kent C. Dodds — 'Fix the slow render before you fix the re-render'"
      ],
      "prerequisites": [
        "u6"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u7l1",
          "title": "The Cost Model: What Re-renders Actually Cost",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "Performance folklore and its antidote",
              "body": "React performance discourse is dominated by a folk theorem — 're-renders are bad; prevent them' — that is wrong in both directions: it sends engineers memoizing components that render in microseconds while the actual jank hides in one expensive subtree, a layout-effect waterfall, or 10,000 unkeyed DOM mutations. This unit replaces the folklore with a cost model you can compute with, and its first axiom comes straight from Unit 1: **render is wholesale, commit is retail**. A re-render re-executes component functions (JavaScript, cheap-per-node, but multiplied by subtree size), while commit touches the DOM only where descriptions differ (expensive-per-op, but usually few ops). The corollary that reframes everything: *an 'unnecessary' re-render is one that produces an identical description* — its entire cost is the wasted JavaScript of computing what you already had, plus the diffing to discover that. Whether that waste matters is pure arithmetic: (frequency of the trigger) × (cost of the re-rendered subtree). A settings panel re-rendering on submit: irrelevant at any size. A 2,000-row table re-rendering on every keystroke: 60 wasted full-table computations per second of typing — that is where budgets die. The discipline this lesson installs: **locate cost before spending effort** — profile, find the (frequency × size) products that are actually large, and only then reach for the tools of Lessons 2–3."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The re-render propagation rule and the update's cost",
              "statement": "When state changes in component C: (1) React re-renders C, and — by default — **every descendant of C reached by the traversal**, regardless of whether the descendant's props changed; propagation stops at a node only via an explicit **bailout**: the node's element is reference-identical to last render's (the === skip of Unit 1), or the node is memoized and its props compare equal (Lesson 2), (2) The cost of the update is:\n\n  T(update) = Σ over re-rendered components (render time) + T(reconcile visited subtree) + T(commit diffs) + T(effects fired by the commit),\n\nwhere the first two terms scale with the *visited* subtree's size (wholesale) and the last two with the *actual changes* (retail). (3) Therefore the levers, in order of leverage: reduce the visited subtree (move the state down / composition — Lesson 3), cut traversals at boundaries (memo — Lesson 2), make each visited render cheaper (useMemo on expensive computations), and reduce trigger frequency (debounce, transitions — Unit 8). Parent re-renders never *reset* child state (Unit 2's identity rule) — propagation re-executes functions, nothing more."
            },
            {
              "type": "example",
              "heading": "Worked example: computing an update's cost budget",
              "body": "A dashboard: `<App>` holds a search input's text in state; below it, `<Chart>` (renders 3,000 SVG elements from memo-less computation over 50k points, ~40ms), `<Table>` (500 rows, ~8ms), `<Toolbar>` (~0.1ms). The user types at 5 keystrokes/second. Apply the model. The state lives in App, so every keystroke re-renders App and — no bailouts anywhere — Chart, Table, and Toolbar: ~48ms of JavaScript per keystroke, 240ms of work per second, on a 16.7ms frame budget: guaranteed dropped frames; typing feels broken. Now compute where the money is: Chart is 83% of the cost and reads *nothing* from the search text. The cheapest fix is not memoization machinery — it is Lesson 3's first move: the search text's readers are the input and Table's filter; move that state into a `<SearchableTable>` component containing both. Now a keystroke re-renders SearchableTable (8.1ms) and *never visits* Chart — under budget with no memo anywhere, by making the visited subtree small. Compare the memo route: React.memo(Chart) also works (props unchanged ⇒ bailout) but leaves a landmine — the day Chart gains a prop built inline in App (`options={{…}}`), the bailout silently dies (Lesson 2's chain rule). The model's verdict is general: **structure beats annotation** — the update that never reaches a subtree needs no defense at that subtree."
            },
            {
              "type": "code",
              "heading": "Measuring before believing: the Profiler, in three forms",
              "lang": "jsx",
              "code": "// 1) DevTools Profiler (the primary tool): record an interaction,\n// read the flame graph per commit —\n//   • wide bars = expensive renders (WHY is it slow: this component)\n//   • many commits for one interaction = churn (WHY so often)\n//   • 'What caused this render?' (hooks/props/parent) per component\n//   • enable 'Highlight updates' to SEE re-render scope live\n\n// 2) <Profiler> API — production-grade numbers in code:\n<Profiler id=\"table\" onRender={(id, phase, actualMs, baseMs) => {\n  // actualMs: time THIS commit spent rendering the subtree (with bailouts)\n  // baseMs:   estimated full-render time (no bailouts) — their RATIO is\n  //           your memoization effectiveness; actual ≈ base means no\n  //           bailout is doing anything\n  metrics.record({ id, phase, actualMs, baseMs });\n}}>\n  <Table rows={rows} />\n</Profiler>\n\n// 3) The arithmetic sanity check before optimizing ANYTHING:\n//   cost/sec = trigger frequency × visited-subtree render time\n// Measure the second factor with the profiler; know the first from\n// the interaction (keystroke ≈ 5–15/s, resize/scroll ≈ 60/s, hover ≈\n// bursty, submit ≈ ~0). THEN rank. A 3ms render at 60/s (180ms/s)\n// outranks a 40ms render on submit (40ms once) — frequency dominates\n// intuition, which is anchored on single-render size.\n\n// Anti-patterns of measurement:\n//   • Profiling dev builds for absolute numbers (dev ≈ 2–4× slower,\n//     StrictMode double-renders): use dev for SHAPE, prod-profile\n//     builds for MAGNITUDE.\n//   • Optimizing without a before/after commit trace — you can't\n//     verify a fix you didn't measure."
            },
            {
              "type": "text",
              "heading": "The second axiom: slow renders before re-renders",
              "body": "The propagation rule locates *how often* components run; the other half of every cost product is *how expensive one run is* — and fixing that side is frequently both easier and more valuable, because a fast render makes extra re-renders harmless (the product stays small however often the trigger fires). The usual suspects inside a slow single render, in observed frequency order: **accidentally quadratic derivations** — `items.filter(i => other.find(o => o.id === i.id))` is O(n·m) per render; build a Set/Map once (O(n+m)) — this one line-level fix routinely beats a week of memo plumbing; **rendering what isn't visible** — a 10,000-row list where 30 rows fit on screen pays 300× the necessary cost every pass; windowing/virtualization (render the visible slice + overscan) converts list cost from O(items) to O(viewport), the single most effective structural optimization in UI engineering; **heavy leaf work** — date/number formatting with fresh Intl.*Format instances per row (hoist the formatter), deep clones in render, synchronous layout reads forcing reflow; **giant single components** — one 800-line component re-renders as one unit; splitting it creates bailout boundaries for free. The discipline mirrors Lesson 1's: the profiler's flame graph *width* tells you which of these you have; fix the widest bar first, re-measure, repeat. Only when single-render cost is honest and the (frequency × size) product is still too big do the tools of the next two lessons — skipping renders entirely — earn their complexity."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Dev-mode numbers will gaslight you.** Development builds run un-minified code with StrictMode double-rendering, extra invariant checks, and DevTools instrumentation — routinely 2–4× slower than production, with different relative costs (the double render makes render-phase work look twice as important as it is). The failure mode is real: teams 'fix' jank that doesn't exist in prod, or ship jank that dev's noise obscured. Rules: use development profiling to understand *shape* (what renders, how often, what caused it); use a production profiling build (react-dom/profiling) or field telemetry (the <Profiler> API, Web Vitals INP) to judge *magnitude*; and never quote a millisecond number without saying which build produced it."
            },
            {
              "type": "example",
              "heading": "Worked example: reading a flame graph to a verdict",
              "body": "Symptom: 'the editor janks when typing'. Profiler recording, 12 commits in 2 seconds, each commit's flame graph shows: `<EditorApp>` 0.4ms, `<Sidebar>` 22ms (wide bar every commit), `<TextArea>` 1.1ms, `<PreviewPane>` 3ms. First read: the trigger is per-keystroke (12 commits ≈ typing), and Sidebar — which displays the document *outline* — dominates at 22ms per keystroke. Second read: 'What caused this render?' on Sidebar says 'parent re-rendered'; its props show `outline` — an array *rebuilt in EditorApp's render* from the document (`doc.split('\\n').filter(isHeading)…`, measured inside EditorApp's 0.4ms? No — derivation cost attributes to Sidebar's props construction in EditorApp… the flame graph shows the 22ms *inside Sidebar*: it maps outline into a tree of `<OutlineNode>`s with per-node formatting). Diagnosis via the model: frequency = keystroke; visited size = all of Sidebar's 1,200 OutlineNodes; per-run cost = heavy leaf formatting. Now rank the levers by the statement's order: (1) does Sidebar need to be *visited* per keystroke? The outline changes only when headings change — rarely per keystroke; a memo boundary with stable props (derive `outline` with useMemo keyed on the doc's heading-relevant content, or debounce outline updates) cuts 22ms → 0 for most keystrokes. (2) Inside Sidebar, hoist the Intl formatter (1,200 fresh instances per pass → 1). (3) Only then consider windowing the outline. The verdict sequence — locate by width, explain by cause, fix by lever order, re-measure — is the whole method; the specific tools were incidental."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Rank these three situations by wasted milliseconds per second, showing the arithmetic, and state which you'd fix first and with which lever: (a) a 30ms settings panel re-rendering once on save; (b) a 4ms row-hover highlight re-rendering a 200-row table at ~40 events/sec during mouse movement; (c) an 18ms chart re-rendering on a 1/sec websocket tick it doesn't read.",
                  "solution": "(a) 30ms × ~0/sec ≈ 0 ms/s — ignore forever. (b) 4ms × 40/s = 160 ms/s — catastrophic (10× frame budget); fix FIRST. Lever: reduce visited subtree — hover state belongs in the row (colocation), so a hover re-renders one row (~0.02ms × 40 = 0.8 ms/s), not the table; memoizing 200 rows also works but is 200 annotations against one state move. (c) 18ms × 1/s = 18 ms/s — real but subcritical; lever: the chart doesn't read the tick, so either move the ticking state down/away (structure) or memo the chart with stable props. Order: b, c, a. The exercise's real content: frequency × size, not single-render size, ranks the work — the 30ms render FEELS heaviest and matters least.",
                  "hint": "Compute ms/sec for each; compare to the ~16.7ms frame budget; then pick the lever that shrinks the product most cheaply."
                },
                {
                  "prompt": "A teammate memoizes 40 components across a feature and reports 'no measurable improvement' — actualDuration ≈ baseDuration in the Profiler throughout. Using the propagation rule and the cost equation, list the three most likely explanations and the check for each.",
                  "solution": "(1) The bailouts never fire: some prop's identity changes every render (inline object/function/children — the chain rule, Lesson 2); check: DevTools 'why did this render' shows 'props changed' with the culprit prop; fix identity or remove the memo. (2) The bailouts fire but guard nothing: the memoized components were cheap leaves while the expensive subtree (the wide flame bar) is unmemoized or re-renders from its OWN state/context; check: compare the flame graph's wide bars against the memoized list — optimization applied where cost isn't. (3) The cost isn't render-phase at all: commits are cheap but effects/layout thrash after them, or the trigger frequency is the problem (60/s resize handler); check: the profiler's commit timings vs effect timings, and the interaction's event rate. Moral: memo is a lever on exactly one term (visited-subtree renders via bailouts) — if the dominant term is elsewhere, memo is decoration. Measure which term dominates BEFORE annotating.",
                  "hint": "actual ≈ base means bailouts do nothing — either they don't fire, or they fire where there was nothing to save."
                },
                {
                  "prompt": "A product list renders 8,000 <ProductRow> components; profiling shows 95ms renders on filter changes (every keystroke). Windowing is proposed but the PM worries about scroll fidelity. Give the honest cost analysis: what does windowing change in the cost equation, what does it NOT fix, what new costs does it introduce, and what cheaper measure should be evaluated first?",
                  "solution": "Windowing converts the visited-subtree term from O(8,000) to O(~40 visible + overscan): 95ms → ~0.5ms per keystroke — it attacks the size factor directly. NOT fixed: the filter derivation itself still runs over 8,000 items per keystroke (if it's the accidentally-quadratic kind, it may dominate after windowing — profile it separately); and commit cost for rows entering/leaving the window during scroll is new retail work. New costs: scroll fidelity (rows mount/unmount during scroll — needs stable row heights or measurement; fast flings can outrun rendering → blank gaps), lost in-page find (Ctrl+F only sees mounted rows), per-row state destruction on unmount (row-local state must be lifted or keyed storage — Unit 2's lifetime lesson), and accessibility review for virtualized lists. Cheaper first measure: debounce/transition the filter input (cut frequency: 15/s → ~3/s) and check whether the 95ms is really row rendering or the filter computation — a Set-based filter plus deferred value might land under budget WITHOUT windowing's complexity. If typing must stay 60fps against 8k rows, windowing is the right structural spend; adopt it knowing which term it buys down.",
                  "hint": "Which factor of frequency × size does each measure change? What does the viewport bound that the item count doesn't?"
                },
                {
                  "prompt": "Explain precisely why 'parent re-rendered' in the profiler's why-did-this-render is NOT evidence of a bug, and give the two conditions under which that same line becomes the signature of a real problem worth fixing.",
                  "solution": "By the propagation rule, descendants re-render with their ancestor BY DEFAULT — it is the designed wholesale behavior, sound because commit filters identical output to zero DOM work; for cheap subtrees this costs microseconds and warrants nothing. It becomes a real signal when the product is large: (1) the descendant subtree is expensive (wide flame bar) AND its props/context are unchanged across those renders — wasted wholesale work at scale; fix by structure (move the triggering state away, Lesson 3) or a memo boundary (Lesson 2); (2) the frequency is high (keystroke/scroll/tick triggers reaching a big subtree) — even moderate per-pass cost multiplies into budget violations. In both cases the evidence is the PRODUCT (frequency × subtree cost), never the mere fact of propagation. 'Component re-rendered with parent' is React working; 'expensive component re-rendered 60×/sec with unchanged inputs' is the bug.",
                  "hint": "Recall what default propagation is FOR, then attach the two factors of the cost product to it."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u7l1-i1",
              "front": "The re-render propagation rule?",
              "back": "State change in C re-renders C and, by default, every descendant the traversal reaches — stopping only at bailouts (reference-identical element, or memo with equal props). Props needn't change; propagation is wholesale."
            },
            {
              "id": "u7l1-i2",
              "front": "The cost equation for one update, and its four levers in leverage order?",
              "back": "Σ render times of visited components + reconcile + commit diffs + effects. Levers: shrink the visited subtree (structure), cut traversals (memo), cheapen each render (useMemo/algorithms), cut trigger frequency (debounce/transitions)."
            },
            {
              "id": "u7l1-i3",
              "front": "What does an 'unnecessary re-render' actually cost?",
              "back": "Only the JavaScript of recomputing an identical description plus diff time — commit is zero where output is unchanged. It matters iff frequency × subtree cost is large."
            },
            {
              "id": "u7l1-i4",
              "front": "actualDuration vs baseDuration in the Profiler API?",
              "back": "actual = this commit's real render time with bailouts; base = estimated no-bailout full render. actual ≈ base ⇒ your memoization is doing nothing."
            },
            {
              "id": "u7l1-i5",
              "front": "Why fix slow renders before re-renders?",
              "back": "A fast render makes any frequency harmless (small product); the usual wins — kill accidental O(n·m), hoist formatters, window long lists — beat memo plumbing and don't rot."
            },
            {
              "id": "u7l1-i6",
              "front": "Why not trust dev-build profiling numbers?",
              "back": "Dev is 2–4× slower with StrictMode double-renders and checks — use dev for shape (what/why/how often), production profiling builds or field INP for magnitude."
            }
          ]
        },
        {
          "id": "u7l2",
          "title": "Memoization: A Soundness-Conditional Optimization",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Skipping work is a claim about equality",
              "body": "Lesson 1 identified the lever: stop the traversal at a boundary. This lesson is about the machinery that does it — and the exact conditions under which it is *correct*, because memoization is that rare optimization that changes program behavior when its hypotheses fail. `React.memo(Component)` wraps a component with a gate: on a propagated re-render, compare the new props against the previous props — each field with Object.is, i.e. **shallow reference equality** — and if all are equal, *skip the render entirely*, reusing the last committed output for that subtree. Notice what the skip asserts: 'this component's output is fully determined by these compared inputs, and equal references imply equal outputs'. Both halves are load-bearing. The first is the purity contract (Unit 1) — an impure component (reading globals, Date.now, uncontracted mutable refs) can produce different output from equal props, and memo *freezes its bugs into the UI*. The second is the immutability contract (Unit 3) — Object.is on references certifies deep equality only because values are never mutated; a mutated-in-place prop compares equal while being semantically different, and memo converts that lie into a stale screen (Unit 3's tear, now caused deliberately). Memoization, in other words, is not a performance dial — it is a *theorem application*, and the theorem has hypotheses you are responsible for."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Memo soundness",
              "statement": "Let component C satisfy the purity contract (output a function of props/state/context only; no render-phase effects or mutation) and let all props obey the immutability contract (never mutated after creation). Then React.memo(C)'s bailout is **unobservable**: for any render where every prop compares Object.is-equal to the previous render's, skipping C's render and reusing its previous output yields exactly the committed UI and behavior of running it. Conversely, memo is **unsound** — can commit a UI different from the unmemoized program — if either hypothesis fails: (a) C impure (equal inputs, different intended output), or (b) props mutated in place (unequal semantics, equal references). The theorem extends verbatim to useMemo (skip recomputation when deps are Object.is-equal; requires the computation pure and its inputs immutable) and useCallback (identity-stable function when deps unchanged; requires the closure's reactive reads listed — Unit 6's honesty obligation relocated).",
              "proof": "Soundness: state and context participation is handled by React — a state update in C itself or a context C consumes punctures the bailout by design (Units 4–5 machinery track those on the fiber), so the skip occurs only when props are the sole possible source of difference. Under (immutability) each Object.is-equal prop is a reference to an unmutated value, hence deeply equal to what C rendered from before; under (purity) C's output on deeply-equal inputs is structurally identical to its previous output. Reusing the previous subtree therefore commits the same description the re-render would have produced — and since render is side-effect-free, skipping it also skips nothing observable. Unsoundness (a): let C read a module counter — the unmemoized program shows updated output on the parent's next render; memoized, equal props skip the read: divergent UIs. Unsoundness (b): let the parent mutate prop.list in place — references equal, bailout fires, C renders the old list contents nowhere (skip), while the unmemoized program would have re-read the mutated array: the memoized UI is stale relative to the unmemoized one. ∎"
            },
            {
              "type": "theorem",
              "kind": "corollary",
              "name": "The chain rule: one unstable prop voids the boundary",
              "statement": "A memo boundary bails out only if **every** prop compares equal. Since renders re-create locally-constructed values (Unit 1), any prop built inline in the parent's render — an object literal, array literal, arrow function, or JSX element — has fresh identity each pass and fails Object.is *always*. Hence: React.memo on a component receiving even one inline-constructed prop never bails out; its comparison runs every render as pure overhead. Effective memoization is therefore a whole-chain property: the component memoized, and every prop either primitive, state/reducer-provided (stable by construction), or explicitly stabilized (useMemo/useCallback) — with each stabilizer's own deps honest, recursively.",
              "proof": "The bailout condition is a conjunction over props; one false conjunct falsifies it. An inline literal or closure is a fresh allocation per render invocation (language semantics — evaluation of an expression that constructs a value); Object.is on two distinct allocations is false regardless of contents. The recursion claim: a useCallback-stabilized prop is itself keyed on deps compared by Object.is; an unstable or dishonestly-listed dep re-mints the callback identity (or freezes its closure — Unit 6's trade-off), so stability propagates only through a chain of honest, stable dependencies down to primitives/state atoms. ∎"
            },
            {
              "type": "code",
              "heading": "The three tools and the chain in practice",
              "lang": "jsx",
              "code": "// GOAL: <Row> is expensive; the 500-row list re-renders per keystroke\n// of an unrelated search box in the same parent.\n\nconst Row = React.memo(function Row({ item, onSelect, style }) {\n  /* expensive rendering */\n});\n\nfunction List({ items, query, setQuery }) {\n  // ✗ THE CHAIN BROKEN THREE WAYS — memo comparison runs, never bails:\n  return items.map(item => (\n    <Row\n      key={item.id}\n      item={item}\n      onSelect={() => select(item.id)}      // fresh closure per render\n      style={{ padding: 8 }}               // fresh object per render\n    />\n  ));\n}\n\nfunction ListFixed({ items, query, setQuery }) {\n  // ✓ REPAIR EACH LINK:\n  const onSelect = useCallback((id) => select(id), []);  // stable identity;\n                                                         // takes id as ARG\n                                                         // instead of closing\n                                                         // over item — one\n                                                         // callback serves all\n                                                         // rows\n  return items.map(item => (\n    <Row key={item.id} item={item} onSelect={onSelect} style={ROW_STYLE} />\n    // item: from state, stable unless THAT item changed (immutable\n    //   updates replace only edited items — untouched rows keep identity,\n    //   so exactly the edited row re-renders: structural sharing paying\n    //   its Unit-3 dividend here)\n    // style: hoisted to module const — never re-created\n  ));\n}\n\n// useMemo — same theorem, applied to a VALUE:\nconst stats = useMemo(() => summarize(items), [items]); // recompute iff\n// items' identity changed; sound because summarize is pure and items\n// immutable. ALSO an identity tool: stats keeps its reference between\n// renders, so it can feed a memoized child or a deps array without churn.\n\n// The mirror rule for useCallback deps (Unit 6 relocated): list what\n// the closure reads, or take it as an argument. A useCallback with\n// stale deps is a stale-closure bug wearing a performance costume."
            },
            {
              "type": "text",
              "heading": "When memo loses: the economics of the comparison",
              "body": "Memoization is never free: every memo boundary pays (props comparison per propagated render) + (retained previous props/output in memory) + (a real complexity tax: every future prop must preserve the chain, forever, or the boundary silently dies — a maintenance invariant no type checker enforces). The comparison is cheap — a few Object.is per prop — so the *runtime* downside is usually small; the failure mode is subtler: **boundaries that never fire**. Empirically (and per the chain rule), an unmaintained memo boundary trends toward dead: someone adds an inline prop, the bailout stops firing, the comparison keeps running, and the codebase accumulates annotations that assert optimizations which no longer exist — worse than nothing, because readers *believe* them. Hence the placement discipline: memoize **few, fat boundaries at cost cliffs** — the expensive chart, the 500-row list's rows, the editor's preview pane — where the profiler showed real (frequency × size) products, and where you will notice if the bailout dies; do not carpet-bomb leaves with memo 'for safety'. For useMemo, the same economics: wrap computations that are actually expensive (the profiler's wide bars, or allocation-heavy derivations feeding deps/memo chains), not every `.filter()` — a memo whose computation costs less than its bookkeeping is negative-value code. And the strategic footnote that reframes this whole lesson: the **React Compiler** (auto-memoizing build tool, stable since 2025) performs exactly this analysis mechanically — inferring stable identities and inserting bailouts with the chain rule handled by construction. Where it is enabled, hand-memoization becomes legacy plumbing; the *theorem* remains the part you must know, because the compiler's correctness rests on the same purity hypotheses, and code violating them breaks identically under both regimes."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Memoization is not a semantic guarantee — never build correctness on it.** React reserves the right to discard memoized state and re-render from scratch (it does so today under Fast Refresh, offscreen restoration, and error recovery, and future modes make shedding explicit). useMemo may re-run its computation; React.memo may re-render with equal props; useCallback may re-mint identity. Sound programs treat all three as *hints* whose removal changes only speed. The moment a program's correctness depends on a memo firing — a computation with a side effect inside useMemo, an effect keyed on a 'stable' callback identity that must not re-fire, a child that breaks if rendered twice — it is broken by specification, just not yet by schedule. The test is Unit 1's: delete every memo annotation mentally; if behavior (not speed) changes, the code is wrong today."
            },
            {
              "type": "example",
              "heading": "Worked example: diagnosing the dead boundary",
              "body": "A PR memoized `<DataGrid>` six months ago; today's profiler shows DataGrid rendering on every keystroke of the page's filter box anyway — actual ≈ base, the Lesson-1 signature. Autopsy with DevTools' 'why did this render': *props changed* → the diff panel lists `config`. Git archaeology: three months ago, a feature added `<DataGrid config={{ locale, density }} …/>` — an inline object; the boundary has been dead since that commit, its comparison running uselessly ~10 times per second, its annotation asserting an optimization that stopped existing. The repairs, in preference order (note how each maps to a link of the chain rule): (1) **flatten** — pass `locale` and `density` as two primitive props; primitives can't churn identity, and the chain shortens by one link that can never rot again; (2) **stabilize** — `const config = useMemo(() => ({locale, density}), [locale, density])` — correct, but adds a stabilizer whose own deps are now part of the maintenance surface; (3) **custom comparator** — `React.memo(DataGrid, (a, b) => shallowEqual(a.config, b.config) && …)` — a per-boundary equality theory: maximal power, maximal review burden (the comparator must stay conservative: returning true when props differ semantically *suppresses real updates* — unsoundness by comparator, the worst bug class in this space, presenting as 'grid ignores locale change'). The ranking is general: prefer making identity *unnecessary* (primitives) over making identity *stable* (memoization) over redefining *equality* (comparators). And schedule the lesson's meta-point: dead boundaries are found by *measurement*, not by reading code — the annotation looks identical alive or dead."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For each prop passed to a memoized child, state whether it preserves or breaks the bailout, with the identity argument: (a) count={items.length} (b) user={user} where user comes from useState and profile edits use immutable updates (c) onSave={() => save(id)} (d) columns={COLUMNS} module constant (e) footer={<Total items={items}/>} (f) validate={useCallback(v => v.length > min, [min])}.",
                  "solution": "(a) Preserves — a number; Object.is on equal primitives is true. (b) Preserves between edits to THAT user — immutable updates replace the reference only when the user object actually changes; that's the desired semantics (bail out until it changes). (c) Breaks — fresh arrow per parent render, always-new identity; stabilize with useCallback or pass id and a stable handler. (d) Preserves — module constant, one allocation ever. (e) Breaks — JSX is createElement: a fresh element object per render (Unit 1), so the footer prop churns identity every pass even when items didn't change; fix by hoisting when static, passing stable children from above (Lesson 3), or memoizing the element with useMemo keyed on items. (f) Preserves while min is stable — useCallback re-mints only when min changes, which is honest (the closure reads min). The scorecard's pattern: primitives and state-provided references are the reliable links; anything constructed inline in render is a broken link.",
                  "hint": "For each: is a new allocation created during the parent's render evaluation? JSX counts as construction."
                },
                {
                  "prompt": "Prove the unsoundness half of the memo theorem concretely: construct a minimal parent+child pair where React.memo makes the committed UI differ from the unmemoized program, for each hypothesis violation — (i) child impurity, (ii) prop mutation — and state what the user observes in each.",
                  "solution": "(i) Impurity: const Stamp = React.memo(() => <span>{Date.now()}</span>); parent re-renders on a timer with no props. Unmemoized: the stamp updates per parent render. Memoized: zero props always compare equal — the stamp freezes at mount time. Observed: a clock that stops; equal inputs did NOT imply equal intended output because the input set was a lie (time is an unlisted input — purity violation, Unit 1's clause 2). (ii) Mutation: parent holds const list = useRef([1,2]).current; handler does list.push(3); forceUpdate(). Child = React.memo(({list}) => <ul>{list.map(…)}</ul>). Unmemoized: after the push, the child re-renders and displays 3 items (reading the mutated array). Memoized: list's reference is unchanged ⇒ bailout ⇒ the UI shows 2 items while the data holds 3 — the stale-tear of Unit 3, now guaranteed by the boundary. Observed: 'the list doesn't update until something unrelated re-renders it'. Both constructions confirm the theorem's shape: memo doesn't CREATE these bugs — it takes programs already violating the contracts and converts latent inconsistency into committed UI divergence.",
                  "hint": "For (i) make output depend on a non-prop input; for (ii) make semantics change while identity doesn't."
                },
                {
                  "prompt": "A reviewer proposes the team rule: 'wrap every component in React.memo and every function/object in useCallback/useMemo — it can only help.' Write the rebuttal in four numbered points, each grounded in this lesson's results, and state the replacement rule.",
                  "solution": "(1) Chain-rule economics: memo on components receiving inline-constructed props never bails — the comparisons run per render as pure overhead, and blanket application guarantees thousands of dead boundaries (the annotations assert optimizations that don't exist, misleading every reader). (2) Bookkeeping cost is real at scale: per-boundary prop retention + comparison, per-useMemo deps arrays and cache slots — for microsecond leaves this EXCEEDS the render it might skip; negative-value code. (3) Maintenance invariant: every boundary adds a forever-obligation (all future props must preserve the chain) that no tool enforces; blanket memoization maximizes the surface on which that invariant silently rots. (4) It codifies the wrong reflex: the lesson-1 levers (state placement, composition, algorithmic fixes) are cheaper and rot-proof; a team habituated to annotation-first stops reaching for structure-first, and correctness risk rises (comparator misuse, reliance on memo firing — the danger callout). Replacement rule: 'memoize at measured cost cliffs — profiler-identified (frequency × size) products — with the full chain stabilized and a re-measure attached to the PR; elsewhere, prefer structure. Where the React Compiler is enabled, write plain code and let it place the boundaries.'",
                  "hint": "Dead boundaries, bookkeeping economics, the forever-invariant, and the habit it displaces."
                },
                {
                  "prompt": "The custom comparator escape hatch: React.memo(Chart, (prev, next) => prev.data.version === next.data.version). The team uses monotonically-increasing version numbers on the data object. Analyze: under what discipline is this sound, which failure is it one refactor away from, and why is 'comparator returns true' the dangerous direction rather than false?",
                  "solution": "Soundness condition: version must be a COMPLETE proxy for every input Chart reads — i.e., data (all of it that Chart uses) changes iff version changes, AND Chart reads no other props (the comparator ignores them!) — note the given comparator returns true even if a hypothetical `theme` prop changed: any added prop must be added to the comparator or the boundary suppresses its updates. That is the one-refactor-away failure: `<Chart data={d} highlight={sel}/>` ships, comparator still only checks version, highlight changes are eaten — 'chart ignores selection' with zero errors, and the code REVIEW looks innocent because the comparator sits in another file. Direction asymmetry: returning false when equal merely wastes a render (safe — the default behavior everywhere); returning true when different SUPPRESSES a real update — committed UI diverges from program state, the unsoundness class, presenting as data-dependent display bugs far from the cause. Hence comparators must be conservative (when unsure, false) and total (account for every prop), and the version-number discipline needs an enforcement story (who bumps it? is it derived in the update path or by hand?) — hand-bumped versions are Unit 4's stored-derivation sin feeding a correctness-critical comparison.",
                  "hint": "What does the comparator claim about props it doesn't mention? Which wrong answer wastes work vs suppresses truth?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u7l2-i1",
              "front": "What exactly does React.memo do, and what does its bailout assert?",
              "back": "Compares each prop to the previous render's with Object.is; all equal ⇒ skip rendering, reuse prior output. The skip asserts: output determined by compared inputs, and reference-equal ⇒ semantically equal — purity + immutability."
            },
            {
              "id": "u7l2-i2",
              "front": "The two ways memo becomes unsound?",
              "back": "Impure component (equal props, different intended output — memo freezes it) and mutated props (different semantics, equal reference — memo commits a stale screen). It converts contract violations into UI divergence."
            },
            {
              "id": "u7l2-i3",
              "front": "The chain rule of memoization?",
              "back": "Bailout is a conjunction over props: one inline-constructed prop (object/array/arrow/JSX) fails Object.is every render and kills the boundary — stability must hold along the whole chain, recursively down to primitives/state atoms."
            },
            {
              "id": "u7l2-i4",
              "front": "useMemo and useCallback in one line each?",
              "back": "useMemo: skip a pure recomputation while deps are Object.is-equal (also an identity stabilizer for values). useCallback: keep a function's identity while deps are unchanged — its deps carry Unit 6's honesty obligation."
            },
            {
              "id": "u7l2-i5",
              "front": "Where should memo boundaries go, and where not?",
              "back": "Few fat boundaries at measured cost cliffs (profiler-verified frequency × size), with the chain maintained. Not carpet-bombed on leaves — dead boundaries cost comparisons and lie to readers."
            },
            {
              "id": "u7l2-i6",
              "front": "Why must correctness never depend on memoization firing?",
              "back": "All three tools are hints: React may re-run useMemo, re-render memo'd components, re-mint callbacks (Fast Refresh, recovery, future modes). Mentally delete every memo — if behavior (not speed) changes, the code is already wrong."
            }
          ]
        },
        {
          "id": "u7l3",
          "title": "Composition Beats Memoization",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The optimizations that cannot rot",
              "body": "Lesson 2 closed with a maintenance warning: memo boundaries silently die. This lesson develops the alternative family — optimizations achieved by *arranging the tree* so expensive subtrees are never visited, which cannot rot because they are not annotations but structure: no comparison to break, no chain to maintain, no hypothesis to violate. All of them are applications of two facts you already own. **Fact 1 (Unit 1)**: if the element reference at a position is identical to last render's, React skips that subtree wholesale — the `===` bailout, requiring no memo, no comparison of props, nothing. **Fact 2 (Lesson 1)**: propagation starts at the component whose state changed — state placed lower reaches less. The compositional patterns are just ways of engineering those two facts into your tree: *push state down* so triggers start small; *pass content as children* so the churning component receives, rather than creates, the expensive elements; *split components at cost boundaries* so wholesale traversal has natural stopping points. Abramov's 'Before You memo()' argument, which this lesson follows, is worth stating as a slogan: **memo makes React check whether it can skip; composition makes skipping structural.** When a structure fix exists, it is almost always the better engineering — and when it doesn't, you'll know exactly why the memo boundary earns its keep."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The children bailout: elements created above the churn are immune to it",
              "statement": "Let P be a component with frequently-changing local state, and let E be an expensive subtree. (1) If P's JSX constructs E's elements (E appears literally in P's render), every state change in P re-creates E's elements (fresh identities) and the traversal visits E: E pays P's frequency. (2) If instead E's elements are created by P's *parent* and passed to P as props (children or any slot prop) — P rendering `{children}` — then P's re-renders receive the *same* children element references as last render (P's render didn't create them; the parent didn't re-render, so they were not re-created); by the reference-identity bailout, React skips E entirely. E pays only the *parent's* frequency, not P's. The restructure — 'lift the content, push the state' — thus changes E's effective trigger from the fast one to the slow one with zero annotations.",
              "proof": "(1) JSX evaluation constructs elements (Unit 1): each execution of P's render allocates fresh element objects for E; fresh identity fails the === check, so reconciliation recurses into E — by the propagation rule the whole subtree renders at each of P's state changes. (2) Under the restructure, the elements for E are allocated during the parent's render and delivered to P via props. A state change in P re-invokes P only (the parent is above the trigger, untouched — propagation flows down, never up); P's new render reads `children` from its (unchanged) props — the same element references the parent created. At E's position, old element === new element; by Unit 1's immutability argument, reference identity certifies an unchanged description, so React reuses the committed subtree without rendering it. E's elements are re-created only when the parent re-renders — hence E inherits the parent's (slow) trigger frequency. ∎ Note the theorem needs NO memo and NO purity hypothesis on E beyond what rendering already assumes: the skip is justified by identity of descriptions, not by comparison of inputs."
            },
            {
              "type": "code",
              "heading": "The pattern in its three costumes",
              "lang": "jsx",
              "code": "// COSTUME 1 — push state down (make the trigger's home small):\n// ✗ query lives in Page: keystrokes re-render Chart + Table + all\nfunction Page({ data }) {\n  const [query, setQuery] = useState('');\n  return <>\n    <SearchInput value={query} onChange={setQuery} />\n    <Results data={data} query={query} />\n    <ExpensiveChart data={data} />           {/* pays keystroke frequency */}\n  </>;\n}\n// ✓ query lives in SearchSection: keystrokes never reach Chart\nfunction PageFixed({ data }) {\n  return <>\n    <SearchSection data={data} />            {/* input + results inside */}\n    <ExpensiveChart data={data} />           {/* visited only when data changes */}\n  </>;\n}\n\n// COSTUME 2 — children as props (lift content above the churn):\n// A width-tracking layout wrapper that re-renders on every resize tick —\n// but its CONTENT was created by the parent, so it survives untouched:\nfunction ResizablePanel({ children }) {\n  const width = useResizeObserverWidth();    // fast-changing state\n  return <div className={width > 600 ? 'wide' : 'narrow'}>\n    {children}                                {/* same refs as last render */}\n  </div>;                                     {/* → === bailout: skipped   */}\n}\n// Parent: <ResizablePanel><HugeEditor doc={doc}/></ResizablePanel>\n// HugeEditor re-renders when the PARENT re-renders (doc changes),\n// not when width ticks at 60/s. Zero memo. Cannot rot.\n\n// COSTUME 3 — slots generalize it (any prop can carry elements):\nfunction SplitView({ left, right }) {\n  const [ratio, setRatio] = useState(0.5);   // drag updates at 60/s\n  return <div className=\"split\" onPointerMove={drag(setRatio)}>\n    <div style={{ flexBasis: ratio * 100 + '%' }}>{left}</div>\n    <div>{right}</div>\n  </div>;\n}\n// <SplitView left={<FileTree/>} right={<Editor/>}/> — dragging the\n// divider re-renders SplitView's two divs and NOTHING inside either\n// pane. The 60Hz state is quarantined in the component that owns it."
            },
            {
              "type": "example",
              "heading": "Worked example: the theme provider that re-rendered the world",
              "body": "An app top looks like: `function App() { const [theme, setTheme] = useState('light'); return <ThemeCtx value={theme}><Shell/></ThemeCtx>; }` — and the team observes that *any* state added to App (a modal flag, a toast queue) re-renders the entire application. Diagnose with the proposition: Shell's element is constructed in App's render, so every App state change re-creates it — fresh identity, full traversal (the context is innocent; this is costume-2 misapplied, or rather never applied). The fix is the children bailout, one level up: `function ThemeProvider({ children }) { const [theme, setTheme] = useState('light'); return <ThemeCtx value={theme}>{children}</ThemeCtx>; } function App() { return <ThemeProvider><Shell/></ThemeProvider>; }` — Shell's element is now created by App, whose render runs once; ThemeProvider's own state changes (theme toggles, or any future state it grows) re-render ThemeProvider *only*: children pass through reference-identical, Shell bails out at ===, and the context change reaches exactly its consumers through the context propagation channel (Unit 4) — which punctures bailouts *only at consumer positions*, not wholesale. Two deep facts surface here. First, this is why every context provider you have ever seen takes `children` — the pattern is not a styling convention but the *load-bearing performance structure* of provider design. Second, notice the division of labor: the === bailout skips the *tree*, while context targets the *consumers* — composition and context propagation are complementary halves of 'update exactly who cares'."
            },
            {
              "type": "text",
              "heading": "Choosing between structure and memo: a decision procedure",
              "body": "With both toolkits on the table, the choice is decidable rather than aesthetic. Ask in order: **(1) Can the state move down?** If the churning state's readers are a small cluster, colocate it (costume 1) — smallest change, no API impact, and the win is frequency-proportional. It fails when the state is genuinely wide-read (the query that filters three siblings). **(2) Can the content move up?** If an expensive subtree sits inside a churning component but doesn't *read* the churn, restructure to children/slots (costumes 2–3) — requires touching the API of one component, pays forever, cannot rot. It fails when the expensive subtree *reads* the fast state (the editor that must re-render per keystroke — no structure can skip a true data dependency). **(3) Only then, memo the boundary** — the expensive subtree genuinely reads *some* of the churning component's data but changes rarely: React.memo with a maintained chain (Lesson 2), placed at the measured cliff. **(4) If the dependency itself is the problem** — everything legitimately reads the fast value but most readers could tolerate lag — change the *scheduling*, not the tree: defer/transition the value (Unit 8), or debounce at the source. The procedure's shape mirrors the whole unit: structure first (rot-proof, hypothesis-free), annotation second (powerful, conditional), scheduling third (changes the requirement itself). Teams that internalize the order stop producing the codebase-wide memo carpets that Lesson 2 autopsied — most of those carpets are compensation for state parked too high, which is a Unit 4 design failure wearing a performance costume."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Colocation is also an architecture win, not just a performance one.** Pushing state to its readers (procedure step 1) is the same move as Unit 4's 'lift as high as necessary, no higher' — read from the other side. Its side effects are all positive: smaller re-render scopes (this lesson), narrower component APIs (fewer drilled props), better deletability (the feature's state dies with the feature's component), and clearer ownership (Unit 4's SSOT). When a performance profile says 'this state triggers too much', the first question is never 'how do I defend the subtree' but 'why does this state live where it lives' — the profiler is often just reporting an architecture smell in milliseconds."
            },
            {
              "type": "example",
              "heading": "Worked example: when composition cannot help — and what to do",
              "body": "A code editor renders `<TextArea>` (the input, fast state: the document text, per-keystroke) and `<PreviewPane doc={text}/>` (expensive markdown render, ~30ms). Apply the procedure honestly. Step 1 — move state down? The text's readers are TextArea *and* PreviewPane: colocating in TextArea orphans the preview; the state is genuinely shared — fail. Step 2 — content up? PreviewPane *reads* the churning value (doc={text}); children-passing cannot skip a true data dependency — fail. Step 3 — memo? PreviewPane's props change every keystroke (text is the prop!) — a memo boundary would never bail; also fail. The honest conclusion: every component that reads per-keystroke text must pay *some* cost per keystroke — the question becomes *which* cost, and step 4 (scheduling) is the real lever: `const deferredText = useDeferredValue(text); <PreviewPane doc={deferredText}/>` (+ React.memo on PreviewPane — required so the pane bails out during renders where the deferred value hasn't advanced) lets the input update at full speed while the preview re-renders at whatever rate the machine sustains, lagging gracefully under load (Unit 8 explains the machinery). Alternatively, debouncing the preview's input at the source (200ms) is the framework-free version with a fixed lag. The example's purpose is calibration: composition and memo are for skipping *false* dependencies; when the dependency is real, only scheduling — changing *when*, not *whether* — remains, and recognizing which case you're in is the skill this unit exists to build."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Apply the decision procedure to each scenario — name the step that fires and the concrete fix: (a) a modal-open boolean in the app root re-renders the whole app on every open/close; (b) an animation-frame counter in <Canvas> re-renders the sibling <Inspector> because both live in <Studio> which owns the frame state; (c) a live-price ticker (4 updates/sec) feeds a <PriceCell> inside each of 300 memoized rows whose other props are stable; (d) a tooltip-position state inside <DataTable> re-renders all rows on every mousemove.",
                  "solution": "(a) Step 1 — colocate: the boolean's readers are the trigger button and the modal; move both into a <ModalTrigger> leaf; the root stops owning per-interaction state. (b) Step 1 again — push the frame state INTO <Canvas> (its only reader); Studio and Inspector leave the blast radius. If Studio must display fps, pass a throttled callback up (slow channel) rather than owning the fast state. (c) The dependency is REAL (cells must show the price) — step 4: the rows' memo already isolates them; let PriceCell subscribe to the ticker directly (external store with per-cell selection, Unit 8) so updates re-render 300 tiny cells, not 300 rows — restructuring the SUBSCRIPTION, not the tree. (d) Step 2/1 hybrid: mousemove state belongs in a <TooltipLayer> overlay that renders above the table (colocate), with rows passed as children or siblings — never in the component that owns the rows; no row reads the tooltip position, so it's a false dependency structure can delete.",
                  "hint": "For each: who actually READS the fast value? False dependency ⇒ structure; true dependency ⇒ subscription/scheduling."
                },
                {
                  "prompt": "Prove the children-bailout proposition's clause (2) fails — E re-renders anyway — if the parent ALSO re-renders for its own reasons, and derive the practical rule about stacking this pattern with memo for the mixed-frequency case.",
                  "solution": "If the parent re-renders (its own state/props changed), its render re-executes the JSX that constructs E's elements: fresh identities. P then receives NEW children references; at E's position, old !== new, the === bailout fails, and E renders — correctly so if E's inputs changed, wastefully if the parent's re-render was for an unrelated reason. So the children pattern quarantines E from P's frequency but leaves E coupled to the PARENT's frequency (the proposition said exactly this: E inherits the parent's trigger). Practical rule: when the parent ALSO churns (mixed frequencies at two levels), stack the tools — children-passing handles P's fast trigger structurally, and React.memo(E) handles the parent's occasional unrelated re-renders via props comparison (E's props being stable data, the chain is short). The stack is principled, not redundant: each tool covers the frequency the other can't — structure for the fast axis (rot-proof where it matters most), memo for the slow axis (cheap to maintain where churn is rare).",
                  "hint": "Who creates E's elements, and on whose render schedule? Then: which residual trigger does memo cover?"
                },
                {
                  "prompt": "A design-system team wraps every provider like this: function AppProviders({ children }) { return <A><B><C>{children}</C></B></A>; } — but composes them in App as: <AppProviders>{useMemo(() => <Shell/>, [])}</AppProviders>, 'to be extra safe'. Evaluate: what does the useMemo add over the plain <AppProviders><Shell/></AppProviders>, when could it matter, and what does it cost?",
                  "solution": "In the plain version, Shell's element is created in App's render; it churns only when App re-renders. If App is the root with no state (typical), that's ~once — the children bailout already protects Shell from every provider's internal state changes, and the useMemo adds nothing. It could matter only if App itself re-renders for its own reasons (root-level state, HMR patterns, a parent above it): then plain JSX would re-mint Shell's element per App render, while the useMemo pins its identity, extending the bailout across App's own churn. Costs: a cache slot and deps array to maintain (empty deps = 'Shell never needs new props from here' — a claim that silently breaks if Shell ever takes a prop from App: the memo would freeze it, an actual correctness hazard per Lesson 2's danger callout), plus reader confusion — element-level useMemo is rare enough to demand a comment. Verdict: default to the plain form; reach for element memoization only with a measured App-level churn problem and a documented invariant that the element truly has no reactive inputs.",
                  "hint": "How often does App render? What does memoizing an ELEMENT freeze, and what claim do its empty deps make?"
                },
                {
                  "prompt": "Synthesis: your profiler shows a settings page where toggling any switch (state in <SettingsPage>) re-renders 14 sections including <BillingHistory> (expensive, reads nothing reactive except its own fetched data). Three engineers propose: (i) React.memo on all 14 sections; (ii) move each toggle's state into its own section component; (iii) keep page-level state but pass sections as children from a parent layout. Adjudicate with the full procedure: what does each cost/gain, which do you pick, and what hybrid is strictly best if some toggles genuinely affect multiple sections?",
                  "solution": "(i) Memo-carpet: works today IF all 14 chains stay stable (any inline prop kills one silently — Lesson 2's rot), costs 14 comparisons per toggle forever, and leaves the architecture smell (page-level state nobody needs page-wide) untreated. (ii) Colocation: each independent toggle lives with its section — toggles re-render one section; BillingHistory leaves every blast radius; APIs narrow; deletability improves. Fails only for genuinely cross-section settings. (iii) Children-passing: quarantines sections from the PAGE's state churn structurally — but the page still owns all toggle state, so section-INTERNAL propagation is fixed while the design smell remains; also requires reshaping the layout API. Adjudication: (ii) is the primary fix (procedure step 1; it's an architecture repair, not a defense), (iii) is the right structure for whatever state legitimately stays page-level, and (i) is reserved for measured residual cliffs. Best hybrid for mixed reality: colocate independent toggles (most of them); for cross-section settings, lift exactly those to the page and deliver via children-passing layout + a small context for the true cross-cutters — updates then reach exactly the affected consumers (Unit 4's channel semantics), and BillingHistory, reading nothing, is never visited: zero annotations on it, nothing to rot.",
                  "hint": "Which proposals treat the disease (state placement) vs the symptom (traversal)? What does each cost under maintenance?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u7l3-i1",
              "front": "The children-bailout proposition in one sentence?",
              "back": "Elements created ABOVE a churning component and passed in as children/slots keep reference identity across its re-renders — React skips them at === with zero memo; they inherit the parent's slow frequency."
            },
            {
              "id": "u7l3-i2",
              "front": "Why can't composition-based skips rot like memo boundaries?",
              "back": "They're structural: no comparison to break, no prop chain to maintain, no purity hypothesis — the skip follows from element identity, which the tree shape guarantees."
            },
            {
              "id": "u7l3-i3",
              "front": "The three costumes of the composition pattern?",
              "back": "Push state down (colocate with readers), pass content as children (lift elements above the churn), slots (any prop carrying elements — left/right panes, headers)."
            },
            {
              "id": "u7l3-i4",
              "front": "Why does every context provider take children?",
              "back": "It's the load-bearing structure: provider-internal state changes re-render only the provider; children pass through reference-identical and bail out, while context propagation targets exactly the consumers."
            },
            {
              "id": "u7l3-i5",
              "front": "The four-step decision procedure for a hot subtree?",
              "back": "(1) Move the state down; (2) move the content up (children); (3) memo the measured boundary with a maintained chain; (4) true dependency? — change scheduling (defer/transition/debounce), not the tree."
            },
            {
              "id": "u7l3-i6",
              "front": "When is a per-keystroke cost unavoidable, and what's the remaining lever?",
              "back": "When the subtree truly reads the fast value (real data dependency) — structure and memo can't skip truth. The lever is WHEN: useDeferredValue/transitions (+memo) or source debouncing let it lag gracefully."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u7-check",
        "questions": [
          {
            "id": "u7q1",
            "type": "numeric",
            "prompt": "A filter input re-renders its parent page at 12 keystrokes/sec. The page's subtree renders in 22ms, of which an <Analytics> panel that reads none of the filter state accounts for 19ms. After moving the filter state (and its results list) into a child component so keystrokes no longer visit the panel, how many milliseconds of render work per second do keystrokes now cost? (Round to the nearest whole number.)",
            "answer": 36,
            "explanation": "Before: 22ms × 12/s = 264 ms/s — 16× the frame budget. After colocation the visited subtree is 22 − 19 = 3ms; 3 × 12 = 36 ms/s. The lever was the visited-subtree size, changed structurally with zero memo annotations — the cost equation's highest-leverage term.",
            "points": 1
          },
          {
            "id": "u7q2",
            "type": "mcq",
            "prompt": "React.memo(Row) is applied, but the profiler shows Row re-rendering on every parent render with 'props changed: style'. The JSX reads <Row style={{width}} …/>. What is happening?",
            "options": [
              "React.memo doesn't compare object props, so style is ignored and something else causes the render",
              "The inline object literal allocates a fresh identity every parent render; Object.is fails, so the bailout never fires — the chain rule in action",
              "width changes every render, so the re-renders are all legitimate",
              "React.memo requires a custom comparator for non-primitive props"
            ],
            "answer": 1,
            "explanation": "memo compares each prop with Object.is; {{width}} is a new allocation per render, and two distinct objects are never Object.is-equal regardless of contents. One unstable prop voids the whole conjunction — the boundary is dead while its comparison still runs. Fixes: hoist a constant, pass width as a primitive and build the style inside Row, or useMemo the object keyed on [width].",
            "points": 1
          },
          {
            "id": "u7q3",
            "type": "short",
            "prompt": "Complete the placement discipline: memo boundaries belong at measured cost cliffs; everywhere else, prefer fixes based on ______. (One word.)",
            "accept": [
              "composition",
              "structure",
              "structural fixes",
              "tree structure",
              "restructuring"
            ],
            "explanation": "Structure first: colocate state, pass content as children, split at natural boundaries — skips that follow from element identity and state placement can't rot, need no hypotheses, and usually treat the underlying design smell. Memo is the conditional tool for measured residual cliffs.",
            "points": 1
          },
          {
            "id": "u7q4",
            "type": "proof",
            "prompt": "Prove the children-bailout proposition: if a fast-updating component P receives an expensive subtree E as children (constructed by P's parent) rather than constructing E in its own JSX, then P's state changes never re-render E. Identify exactly which fact certifies the skip, and why no memoization or purity assumption on E is needed.",
            "rubric": [
              "Establishes the construction fact: JSX evaluation allocates elements, so E-in-P's-JSX gets fresh identity per P render (traversal recurses), while E-as-children is allocated during the PARENT's render",
              "Traces the update path: P's state change re-invokes P only (propagation flows down from the trigger; the parent is untouched), so P reads the same children references from its unchanged props",
              "Applies the identity certificate: at E's position old === new; element immutability makes reference identity a complete proof of an unchanged description, so React reuses the committed subtree without rendering",
              "Explains the hypothesis-freeness: the skip is justified by identity of descriptions (Unit 1's immutability argument), not by comparing E's props or trusting E's purity — hence no memo chain to maintain and nothing to rot; notes E still re-renders when the PARENT re-renders (inherited slow frequency)"
            ],
            "solution": "Elements are created by JSX evaluation (Unit 1): whoever's render contains the JSX allocates the element. Case 1: E's JSX inside P — every P render (each state change) allocates fresh E elements; fresh identity fails the === check at E's position, reconciliation recurses, E's whole subtree renders at P's frequency. Case 2: the parent's render allocates E's elements and passes them to P as children. When P's state changes, React re-invokes P alone — propagation begins at the component owning the changed state and flows down; the parent, above the trigger, does not run, so no new E elements exist anywhere. P's render reads children from its props object, which is unchanged (the parent didn't re-render to produce new props), yielding the SAME element references as the previous render. At E's position, oldElement === newElement; since elements are immutable, reference identity entails the description is bit-for-bit unchanged, so skipping the subtree cannot alter committed output — React reuses it without invoking any component within E. The certificate is description identity, not input comparison: nothing about E's purity, props, or internals is consulted, which is why the pattern has no chain rule, no comparator, and no rot surface. E's residual trigger is the parent's own re-render (which re-allocates children) — E inherits the slow frequency, and if the parent also churns, React.memo on E covers that axis separately. ∎",
            "explanation": "This proposition is the theoretical core of 'composition beats memoization': the === skip needs only element immutability — a language-level fact — while memo needs purity + immutability + whole-chain stability, all maintained forever. Knowing exactly which certificate justifies which skip is what lets you choose tools instead of cargo-culting them.",
            "points": 3
          },
          {
            "id": "u7q5",
            "type": "open",
            "prompt": "Performance review, full method required. A trading dashboard janks while prices stream in (20 updates/sec). Structure: <Dashboard> holds prices in state (a Map, immutably replaced per tick) and renders <Watchlist> (300 memoized <TickerRow>s taking row data + an inline onClick={() => select(sym)}), <OrderPanel> (reads only the selected symbol's price), and <NewsFeed> (expensive, reads no prices). The profiler shows: every tick re-renders all 300 rows (why-did-this-render: 'props changed: onClick'), OrderPanel, and NewsFeed; commit times are small; renders total ~45ms/tick. Deliver: (1) the diagnosis chain for each of the three subtrees with the governing result; (2) the fix plan in decision-procedure order with expected effect on the cost equation; (3) what you would measure after; and (4) the one fix you must NOT lead with, and why.",
            "rubric": [
              "Watchlist diagnosis: chain rule — the inline onClick re-mints identity per Dashboard render, voiding all 300 memo boundaries (comparison runs, never bails); fix by stabilizing (single useCallback taking sym, or dispatch) so rows bail except those whose row data reference actually changed (structural sharing delivers per-row updates)",
              "NewsFeed diagnosis: false dependency — reads no prices but sits under the churning owner; fix structurally (children-passing or moving price state down into a PricesProvider/section) so ticks never visit it — the rot-proof fix preferred over memoizing it",
              "OrderPanel diagnosis: true dependency but over-broad — it reads ONE symbol's price yet re-renders per full-Map tick; fix by narrowing the subscription (per-symbol selector/store subscription or passing just the selected price) — scheduling/subscription granularity, not tree skipping",
              "Method discipline: fixes ordered by the decision procedure with predicted cost-equation effects (e.g., 45ms/tick → row-delta only), a post-fix measurement plan (profiler commit trace, actual vs base, ms/sec at 20Hz), and the anti-fix: do NOT lead with more/blanket memo — the boundaries exist and are dead; repairing identity and structure comes first"
            ],
            "solution": "(1) Diagnosis. Watchlist: 300 memo boundaries are DEAD by the chain rule — onClick={() => select(sym)} allocates per render, Object.is fails, every row re-renders per tick (the profiler's 'props changed: onClick' is the autopsy). The memoization was correctly placed (row = cost cliff) and silently voided. NewsFeed: no price dependency — it re-renders only because it lives under Dashboard, whose state churns at 20Hz: a false dependency, structure's home case. OrderPanel: genuine dependency on ONE price, but it receives the churn of the whole Map — over-broad subscription; every tick re-renders it even when its symbol didn't move. (2) Plan, in procedure order. (a) Repair the rows' chain (cheapest, biggest): one stable handler — const onSelect = useCallback(sym => select(sym), []) — passed to all rows (or dispatch from a reducer, stable by construction); rows then bail unless their own data reference changed, and the immutable per-tick Map replacement already gives per-row reference stability for unmoved symbols (structural sharing's dividend): expected 300-row wholesale → only rows whose price moved. (b) Quarantine NewsFeed structurally: move price state down into a <PriceSection> (or make Dashboard a layout receiving NewsFeed as children) so ticks never visit it — preferred over React.memo(NewsFeed), which would work but adds a chain to maintain on a component that shouldn't be in the blast radius at all. (c) Narrow OrderPanel's subscription: pass selectedPrice = prices.get(selected) (a primitive/stable ref) instead of the Map, or subscribe per-symbol via an external-store selector (Unit 8) — it then re-renders only when ITS symbol ticks. (3) Measure after: profiler trace at 20Hz — commits/sec unchanged (ticks are real) but per-commit actualDuration should drop from ~45ms to low single digits (moved rows only); check actual ≪ base on Watchlist (boundaries alive again); confirm NewsFeed absent from tick commits; field-check INP. (4) The anti-fix: do NOT respond with more memoization (memo on NewsFeed/OrderPanel, deeper row memo, custom comparators) as the lead — the existing boundaries were already defeated by identity churn; adding annotations atop a broken chain compounds the maintenance surface while the two structural repairs (stable handler, state placement) fix the causes and cannot rot. Memo is the residual tool here, not the primary one.",
            "explanation": "A complete performance investigation: dead-boundary autopsy (chain rule), false vs true vs over-broad dependencies routed to structure vs memo vs subscription granularity, cost-equation predictions, and measurement closure. The grader rewards the method — diagnose by governing result, fix in procedure order, verify by profile — over any particular tool choice.",
            "points": 4
          },
          {
            "id": "u7q6",
            "type": "mcq",
            "prompt": "Which change breaks a previously-working React.memo bailout WITHOUT any warning, error, or visual bug — only a silent performance regression?",
            "options": [
              "Mutating a prop object in place before passing it (same reference)",
              "Adding a new prop computed as an inline object literal in the parent's JSX",
              "Making the memoized component read a context value that changes",
              "Passing a state setter function from useState as a prop"
            ],
            "answer": 1,
            "explanation": "An inline-literal prop fails Object.is every render: the boundary silently stops bailing — no error, no wrong pixels (the re-renders are correct, just wasted), only a regression a profiler can see. (a) is the opposite failure: the bailout KEEPS firing on a real change — a visible stale-UI bug, not silent waste. (c) is by-design puncture (context must reach consumers), not breakage. (d) is harmless: useState setters are identity-stable across renders.",
            "points": 1
          }
        ]
      }
    },
    {
      "id": "u8",
      "title": "Concurrent React",
      "summary": "Fiber as the data structure that makes rendering pausable, transitions as the scheduling vocabulary for urgent vs deferrable updates, and the tearing problem that external stores create — with useSyncExternalStore as its contract-level solution.",
      "references": [
        "Andrew Clark — 'React Fiber Architecture' (github.com/acdlite/react-fiber-architecture, 2016)",
        "react.dev — useTransition, startTransition, useDeferredValue, useSyncExternalStore API references",
        "React 18 Working Group — 'What is tearing?' and 'Concurrent features' discussions (github.com/reactwg/react-18)",
        "facebook/react source — react-reconciler work loop (performUnitOfWork, workLoopConcurrent, lanes)"
      ],
      "prerequisites": [
        "u7"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u8l1",
          "title": "Fiber: Making Render Pausable",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The problem: rendering as an uninterruptible transaction",
              "body": "Through Unit 7 we treated render cost as something to *shrink*; this unit treats it as something to *schedule*. The motivating arithmetic: the browser main thread owns everything — your renders, event handling, painting — and a frame budget of ~16.7ms. A 200ms render (big tree, mid-tier phone) is not just slow, it is a **lock**: for 200ms no click handles, no input echoes, no animation advances, because JavaScript's run-to-completion semantics won't let anything else run until the render returns. Pre-Fiber React (the 'stack reconciler') made this structural: rendering was a recursive function walking the element tree — component calls component calls component — and **a recursion's state lives on the call stack**, which cannot be paused, saved, or resumed; the only exits are completion or abandonment-with-loss. So React's rendering was an all-or-nothing transaction, and long renders froze the world. The fix could not be 'make renders fast' (app size is the app's business) — it had to make renders **interruptible**: do a little work, check the clock, yield to the browser if a frame is due or something urgent arrived, come back and *continue where it left off*. That requires the one thing the call stack refuses: reifying the traversal's state as data you own. That reification is the **fiber** — and everything else in concurrent React (time-slicing, priorities, transitions, discarding stale renders) is machinery built on the simple fact that a paused traversal is now a saveable value."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Fiber, the work loop, and double buffering",
              "statement": "A **fiber** is a heap-allocated record representing one component instance (or host node) in the tree: it holds the component's type, its pending props, its hook cell list (memoizedState — Unit 5), effect flags, its **lanes** (a bitmask of pending-update priorities), and three pointers — child, sibling, return — that link fibers into a tree traversable *iteratively*. The **work loop** renders by repeatedly performing one *unit of work* (begin/complete one fiber) and advancing a `workInProgress` pointer along child → sibling → return order; between any two units it may check `shouldYield()` and return control to the browser, resuming later from the saved pointer — the traversal's entire state is the pointer plus the fiber graph, not a call stack. **Double buffering**: React keeps two fiber trees — `current` (the committed UI's source of truth) and `workInProgress` (the render under construction, each fiber an *alternate* of its current twin). Rendering mutates only the workInProgress tree; commit atomically swaps the root pointer, making workInProgress the new current. An interrupted or abandoned render therefore discards a half-built alternate tree while `current` — and the screen — remain untouched and consistent."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Reified traversal state is exactly what interruptibility requires",
              "statement": "(1) A recursive tree traversal cannot be suspended and resumed by the host: its progress state (which nodes are done, where to continue, pending siblings) is encoded in stack frames that JavaScript provides no way to persist. (2) The fiber traversal — an iterative loop over an explicit pointer into a linked structure — can pause after any unit of work with zero loss: the continuation is fully determined by (workInProgress pointer, fiber graph), both ordinary heap data. (3) Pausing mid-render is *safe* (no observer can detect a half-built render) precisely because of Unit 1's phase separation and purity contract: the render phase mutates only workInProgress fibers — private, unreachable data — while the committed tree and DOM stay untouched; hence interruption composes with correctness, not against it.",
              "proof": "(1) In a recursive walk, 'where am I?' is the stack: each frame holds a component mid-execution with its locals and its position in iterating children. JavaScript offers no first-class continuations — a function's frame cannot outlive a return or be re-entered — so the only way to 'pause' is to unwind (losing every frame's progress) or block (freezing the thread: the original problem). (2) The fiber loop's induction: before each iteration, the complete traversal state is the workInProgress pointer (next unit) plus per-fiber completion flags reachable from the graph; the loop body advances the pointer by pure pointer navigation (child if unvisited, else sibling, else return). Exiting the loop preserves this state trivially — it is heap data referenced from the fiber root — and re-entering resumes with the identical next step: pause/resume is just 'stop calling the loop / call it again'. (3) During the render phase, writes target only workInProgress fibers and freshly-allocated elements (purity forbids everything else — Unit 1); `current` is read, never written. The screen reflects `current`; program-visible state (committed hooks, DOM) lives on `current` or the host. Ergo an outside observer — user or code — sees exactly the pre-render world until commit swaps the trees atomically; a discarded workInProgress is unreachable garbage (render idempotence, Unit 1, guarantees a restart recomputes it faithfully). ∎"
            },
            {
              "type": "code",
              "heading": "The work loop, recognizably — and where the yield happens",
              "lang": "jsx",
              "code": "// Distilled from react-reconciler (names simplified, shape faithful):\n\nfunction workLoopSync() {                 // legacy/urgent path: no yielding\n  while (workInProgress !== null) {\n    workInProgress = performUnitOfWork(workInProgress);\n  }\n}\n\nfunction workLoopConcurrent() {           // time-sliced path\n  while (workInProgress !== null && !shouldYield()) {\n    workInProgress = performUnitOfWork(workInProgress);\n  }\n  // loop exited with work remaining? The scheduler re-queues a\n  // continuation task; the browser gets the thread back — paints,\n  // handles input — and we resume from the SAME pointer next slice.\n}\n\nfunction performUnitOfWork(fiber) {\n  // 'begin': render THIS component — call its function with pending\n  // props against its alternate; reconcile its children (Unit 2's\n  // per-level diff), creating/updating child fibers in workInProgress.\n  const next = beginWork(fiber.alternate, fiber);\n  if (next !== null) return next;         // descend: child first\n  // 'complete': no children left — finish this fiber (record host\n  // mutations into the effect list), then move across/up:\n  let f = fiber;\n  while (f !== null) {\n    completeWork(f);\n    if (f.sibling !== null) return f.sibling;   // across\n    f = f.return;                                // up (and complete parent)\n  }\n  return null;                            // reached the root: render done →\n}                                         // commitRoot(finishedWork): swap\n                                          // trees + apply mutations, SYNC\n\n// shouldYield(): 'has ~5ms elapsed this slice / is higher-priority\n// work or input pending?' — courtesy of the scheduler package.\n// THE asymmetry to internalize: RENDER is sliceable (pausable between\n// any two units); COMMIT is one synchronous, uninterruptible pass —\n// the DOM must never be observable half-mutated (atomicity, Unit 1)."
            },
            {
              "type": "text",
              "heading": "Lanes: priority as a first-class property of updates",
              "body": "Interruptibility is only useful if something decides *what deserves the thread*. React 18's answer is **lanes** — a 31-bit bitmask where each lane is a priority class: SyncLane (discrete user input: clicks, keypresses — must flush before yielding back), InputContinuous (drags, scrolls), DefaultLane (ordinary setStates), TransitionLanes (a block of lanes for updates marked as transitions — Lesson 2), plus retry/idle lanes. Every state update is *stamped* with a lane at dispatch time (by what kind of event context it fired in); every fiber accumulates the lanes of its pending updates; and each render pass is *for* a set of lanes — the scheduler picks the highest-priority pending set, and the work loop renders *only the updates in those lanes*, leaving lower-priority updates queued. The consequences compose into the headline behaviors: **preemption** — while a low-priority (transition) render is mid-flight, an urgent update arrives; the scheduler abandons the workInProgress tree (safe, by the proposition), synchronously renders the urgent lanes, commits, then *restarts* the transition render from scratch against the new current tree (restart, not resume — the abandoned tree was built against a stale base; idempotence makes the redo semantically free, though the CPU work is repaid); **batching by lane** — same-lane updates fold into one render (Unit 3's batching, now per-priority); and **entanglement rules** ensure related lanes commit together so no frame shows a torn combination of a multi-setState transition. You will almost never touch lanes directly — but every visible behavior of Lesson 2's APIs is this machinery, and debugging concurrency without the lane model is reading tea leaves."
            },
            {
              "type": "example",
              "heading": "Worked example: one interrupted render, frame by frame",
              "body": "Setup: a transition-marked filter change starts a big render — 4,000 fibers, ~80ms of work. Timeline with 5ms slices. **t=0**: scheduler starts workLoopConcurrent for TransitionLane; units process; at ~5ms shouldYield() → true; loop exits with workInProgress pointing at fiber #212. The browser paints (the *old* UI — current is untouched), handles a pointer move. **t≈8ms**: continuation task resumes the loop at #212. This repeats — the 80ms render is becoming ~16 slices interleaved with paints; the app remains responsive while 'working'. **t≈23ms**: the user *clicks a button* (SyncLane update on some component). The scheduler sees a higher-priority lane pending: the transition's workInProgress tree — 1,100 fibers built — is **abandoned wholesale** (proposition clause 3: nothing observable was ever produced by it). React renders the SyncLane update synchronously (small tree, 3ms), commits — the click's effect is on screen within a frame of the click. **t≈27ms**: the transition *restarts from the root* against the new current tree (which now includes the click's committed change — no stale base), re-slicing as before, and eventually commits the filtered UI. Total: the click cost the transition ~23ms of redone work; the user experienced zero blocking. Now re-read the timeline noticing what made each step legal: pausing (reified pointer), painting old UI mid-render (double buffering), abandoning (render-phase privacy), restarting (idempotence), ordering (lanes). Every guarantee purchased in Units 1–3 is being spent here — this timeline *is* the course's contracts, cashed."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Why commit can't be sliced.** Rendering computes descriptions (private, discardable — slice freely). Commit mutates the shared world: DOM nodes, refs, layout. Slicing commit would expose half-mutated frames — a list with three of seven rows moved, a form mid-teardown — to the user AND to layout-reading code: precisely the torn states the phase separation exists to forbid (and the tearing disease of Lesson 3, self-inflicted). So React's concurrency has an asymmetric spine: **interruptible render, atomic commit** — pause as long as you like before the transaction; never inside it. This is also why effects fire in defined phases around commit (Unit 6) rather than during rendering slices: their observable actions must sequence against a consistent committed world."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Explain, at the level of data structures, why the pre-Fiber stack reconciler could not implement 'pause rendering when the frame budget expires and resume next frame' — and identify the precise change Fiber made that converts the impossibility into a two-line loop condition.",
                  "solution": "The stack reconciler's traversal state — which component is mid-render, which children remain, where to go next — existed as live call-stack frames (each recursive call holding locals and iteration position). JavaScript cannot persist or re-enter a frame: returning unwinds (progress lost), not-returning blocks the thread (the original disease). So 'pause' had no representation: the traversal state wasn't DATA. Fiber reifies it: the traversal becomes an iterative loop over heap records linked child/sibling/return, whose complete continuation is one pointer (workInProgress) into a persistent graph. 'Pause' is now just exiting the while-loop (state survives trivially: it's heap data); 'resume' is re-entering it; the frame budget becomes a loop condition (!shouldYield()). The impossibility was representational, and the fix was the oldest trick in systems: convert control state into data.",
                  "hint": "Where does 'where am I in the tree?' live in each design, and what can JavaScript persist?"
                },
                {
                  "prompt": "Using double buffering and the safety proposition, explain exactly what the user sees during a 12-slice concurrent render — and why abandoning that render at slice 9 requires no cleanup, no rollback, and no compensation logic anywhere in your components.",
                  "solution": "Throughout all slices the screen shows `current` — the last committed tree — because paints between slices read the DOM, which only commit mutates: the user sees a fully consistent OLD frame the entire time (never a progress bar of half-new UI). Abandonment at slice 9 discards the workInProgress alternates: these fibers were written only by the render phase, are unreachable from `current`, and produced no observable effects (purity — no I/O, no host writes, no committed hook state; the alternate's hook writes live on the alternate). Dropping them is dropping garbage. No rollback exists because nothing rolled forward: the transaction never touched shared state. Component authors owe exactly one thing for this to hold — the purity contract; the machinery (privacy of workInProgress + atomic swap) does the rest. This is the payoff of designing state mutation OUT of the render phase from day one: 'cancel' is free at any point before commit.",
                  "hint": "What does paint read? Which tree did the abandoned work write to, and who else can reach it?"
                },
                {
                  "prompt": "An urgent (SyncLane) update arrives while a transition render is 80% complete. React abandons and later redoes ~all of that work. A colleague proposes 'resume the 80%-done tree after the urgent commit instead of restarting — big CPU win'. Identify the correctness hole, and explain what property would be violated if React resumed against the new current tree.",
                  "solution": "The 80%-built workInProgress tree was constructed as a description of 'the app given the PRE-urgent state': every rendered fiber's output closed over the old snapshot (props/state as of the transition's base). The urgent update committed new state that may change ANY of those components' inputs — the completed 80% is potentially stale in unknowable places (which components read the changed state is exactly what rendering discovers). Resuming would graft frames computed from base A onto a continuation computed from base B: the committed result could mix two snapshots — inter-component inconsistency, i.e., tearing manufactured by the scheduler itself (violating the 'one consistent snapshot per commit' guarantee that Lesson 3 defends). Restarting re-renders everything against the single new base — consistency by construction, purchased with redone CPU (bounded by bailouts: unchanged subtrees === -skip or memo-skip on the redo, so the 'redo' is cheaper than the original where nothing changed). React chooses consistency over salvage; the proposition's idempotence is what makes that choice merely a performance cost rather than a correctness dilemma.",
                  "hint": "What snapshot did the finished 80% encode? What might the urgent commit have changed about it?"
                },
                {
                  "prompt": "Map each observed behavior to the mechanism that produces it: (a) a click during a heavy transition responds immediately though the transition's render was mid-flight; (b) DevTools shows a component's render function running twice for one committed transition update with no StrictMode; (c) a setState inside a drag handler coalesces with other drag setStates but NOT with a simultaneous transition update; (d) the screen never shows the new filter results partially applied even though the render spanned 16 slices.",
                  "solution": "(a) Lane preemption + abandonability: SyncLane outranks TransitionLanes; the workInProgress is discarded (safe: private) and the urgent update renders/commits synchronously. (b) Restart-after-interruption: the first execution belonged to an abandoned pass; idempotence makes the re-execution invisible in output — the double run is the interruption's fingerprint (profilers show it; users don't). (c) Batching is per-lane: InputContinuous updates fold together in one render, but a transition's updates are a different lane set rendered in a separate pass — priority isolation prevents the urgent pass from waiting on transition work. (d) Atomic commit + double buffering: 16 slices built a PRIVATE tree; the DOM changed only in the single synchronous commit that swapped roots — intermediate states never existed in the shared world, so no frame could show them.",
                  "hint": "Four behaviors, four pillars: preemption, idempotent restart, per-lane batching, atomic swap."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u8l1-i1",
              "front": "What is a fiber, and what problem does its existence solve?",
              "back": "A heap record per component/host node (type, props, hooks, lanes, child/sibling/return pointers) — it reifies traversal state as data, making render pausable/resumable where a recursive stack walk could only complete or abandon."
            },
            {
              "id": "u8l1-i2",
              "front": "Double buffering in React — what and why?",
              "back": "Two fiber trees: current (committed truth) and workInProgress (render under construction). Render writes only the private alternate; commit atomically swaps roots — so pauses show consistent old UI and abandonment is free garbage collection."
            },
            {
              "id": "u8l1-i3",
              "front": "The concurrency spine: which phase is sliceable, which is atomic, and why?",
              "back": "Render: interruptible between any two units (private, discardable descriptions). Commit: one synchronous pass (mutates the shared DOM — half-applied frames must never be observable)."
            },
            {
              "id": "u8l1-i4",
              "front": "What are lanes?",
              "back": "A bitmask of update priorities (sync input > continuous input > default > transitions > idle). Updates are stamped at dispatch; each render pass serves a lane set; batching is per-lane; higher lanes preempt lower."
            },
            {
              "id": "u8l1-i5",
              "front": "Why does React restart (not resume) an interrupted render after an urgent commit?",
              "back": "The half-built tree encoded the old snapshot; resuming would graft two bases into one commit — scheduler-manufactured tearing. Restart re-renders against the single new base; bailouts make the redo cheap."
            },
            {
              "id": "u8l1-i6",
              "front": "Which course contracts does the interruption timeline spend?",
              "back": "Purity/idempotence (restarts and double runs unobservable), phase separation (render private, commit atomic), immutability (=== bailouts cheapen redos) — concurrency is those guarantees, cashed."
            }
          ]
        },
        {
          "id": "u8l2",
          "title": "Transitions: Urgent vs Deferrable",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The scheduling vocabulary your UI already speaks",
              "body": "Lesson 1 built the machine; this lesson is the steering wheel. Look at any real interaction and two kinds of update are visibly entangled: the user types a character into a filter box — the *character must appear now* (sub-frame, or typing feels broken), while the *filtered 10,000-row list may lag* (200ms of lag on results is fine; 200ms of lag on the keystroke is not). Pre-concurrent React had one lane: both updates rendered together, so the results' cost held the keystroke hostage — and the folk fixes (debounce, throttling) worked by *delaying the results update entirely*, trading staleness for responsiveness on a fixed timer with no knowledge of actual machine speed. React 18's **transitions** make the distinction first-class: `startTransition(() => setFilter(text))` stamps the wrapped updates with TransitionLanes — telling the scheduler 'this update may be rendered non-urgently: slice it, let urgent work preempt it, and if a newer transition supersedes it, abandon it'. The urgent update (the input's own value) stays in its high lane and commits immediately. The result is *both* behaviors at once: keystrokes at full fidelity, results arriving as fast as the machine allows — adaptively, not on a timer. The API is two hooks and one function; the semantics — what exactly you opted into — are this lesson's subject, because using transitions without knowing their three defining behaviors (interruptible, restartable, non-blocking-but-consistent) produces confusion the moment one fires."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Transition semantics",
              "statement": "`const [isPending, startTransition] = useTransition()`; calling startTransition(scope) runs scope synchronously, and every state update dispatched within it is stamped as a **transition update**. Semantics: (1) **Non-blocking**: transition updates render in a low-priority, time-sliced pass; urgent updates (clicks, keystrokes) preempt it at any yield point — the UI never waits on a transition. (2) **Restartable/supersedable**: an urgent commit mid-transition abandons and restarts the transition render against the new base; a *newer* transition on the same state supersedes the older one entirely (the stale render is abandoned, its result never shown — automatic 'latest wins'). (3) **Consistent**: a transition's updates commit atomically — no frame shows a partial combination — and until it commits, the screen keeps showing the *previous complete state* (with isPending = true, so you can render 'stale + updating' affordances like dimming). (4) `useDeferredValue(value)` is the same machinery driven from the *receiving* side: it returns the previous value while a background re-render with the new value proceeds at transition priority — for deferring expensive *consumers* when you don't control the update's dispatch site. What transitions do **not** do: speed anything up (same total CPU), debounce (no timer), or run off-thread (slices share the main thread)."
            },
            {
              "type": "example",
              "heading": "Worked example: the tab switch, with and without",
              "body": "Three tabs; 'Posts' renders a deliberately slow 500-item list. **Without transitions**: clicking Posts sets activeTab urgently; the render pass that includes the click's visual feedback (highlighting the tab) *also* builds the slow list — one lane, one pass — so the UI freezes ~300ms with the *old* tab still highlighted; the click appears dead. **With** `startTransition(() => setActiveTab('posts'))`: nothing urgent changed (the click's own event completes instantly), and the tab-content change renders in the background — but note what the user sees: the old tab's content stays until the transition commits, with `isPending` available to dim it or mark the clicked tab. Responsiveness is preserved; *latency to new content is not reduced* — it's the same 300ms of rendering, now interruptible and honest about being in progress. Two refinements complete the pattern. First, split the state: the tab *highlight* should be urgent (`setSelected(tab)` outside the transition — instant feedback), the *content* deferred (`startTransition(() => setActiveContent(tab))`) — the one-interaction-two-priorities decomposition is the idiom's full form. Second, rapid tab-clicking demonstrates supersession: click Posts, then immediately Contact — the Posts transition render, mid-flight, is abandoned (never commits, never flashes); only Contact's completes. Compare a debounce solution: it would delay *every* switch by the timer even when the machine is idle, and still block when it fires. The transition adapts: instant on fast machines, gracefully lagging on slow ones, always preemptible."
            },
            {
              "type": "code",
              "heading": "The two APIs, their division of labor, and the memo interaction",
              "lang": "jsx",
              "code": "// useTransition — YOU dispatch the update, so you can mark it:\nfunction SearchPage() {\n  const [query, setQuery] = useState('');       // urgent: the input echo\n  const [results, setResults] = useState([]);   // deferrable: the big list\n  const [isPending, startTransition] = useTransition();\n\n  function handleChange(e) {\n    const text = e.target.value;\n    setQuery(text);                             // high lane: commits this frame\n    startTransition(() => {                     // transition lane:\n      setResults(computeResults(text));         //   sliced, preemptible,\n    });                                         //   superseded by next keystroke\n  }\n  return <>\n    <input value={query} onChange={handleChange} />\n    <div style={{ opacity: isPending ? 0.6 : 1 }}>\n      <ResultsList results={results} />\n    </div>\n  </>;\n}\n\n// useDeferredValue — you DON'T control the dispatch (value arrives as\n// a prop / from above); defer at the consumption site instead:\nfunction Typeahead({ text }) {                  // text updates urgently above\n  const deferredText = useDeferredValue(text);  // lags behind under load\n  const stale = deferredText !== text;          // honest staleness indicator\n  return <div style={{ opacity: stale ? 0.6 : 1 }}>\n    <SlowSuggestions query={deferredText} />\n  </div>;\n}\n// ⚠ THE REQUIRED PAIRING: SlowSuggestions must be React.memo'd.\n// The deferring component re-renders TWICE per change (once urgent\n// with the old deferred value, once at transition priority with the\n// new). The first pass only helps if SlowSuggestions BAILS OUT when\n// deferredText hasn't advanced — no memo, no benefit: you'd render\n// the slow child urgently anyway. useDeferredValue without memo on\n// the expensive consumer is a no-op with extra steps.\n\n// NOT a transition: updates that must be reflected in the same frame\n// as the user's action (controlled input values, toggles, cursor\n// moves). Marking a controlled input's setValue as a transition makes\n// TYPING lag — the exact inversion of the feature's purpose."
            },
            {
              "type": "text",
              "heading": "What isPending is for — and designing the in-between",
              "body": "Transitions surface a UX state that synchronous rendering never had: *the app has accepted your intent and is working on it, while still showing the previous truth*. `isPending` (and the `deferredValue !== value` comparison) is the honest signal of that state, and using it well is a design skill, not just an API call. The good patterns: **dim or desaturate** the stale region (content still readable — better than a spinner replacing real data); **pin the affordance** (highlight the clicked tab urgently while its content transitions — the split-state idiom — so the user's action is acknowledged at the interaction site); **suppress spinners for fast transitions** (CSS transition-delay or a ~100ms threshold before showing pending UI: most transitions finish before a spinner would even be legible, and a flashing spinner is worse than none). The anti-patterns: replacing content with a skeleton on every pending flicker (the screen 'breathes' distractingly under fast typing); gating *input* on isPending (the entire point is that input never waits); and using isPending as a data-loading indicator for network requests — a transition tracks *rendering* work; a fetch's latency belongs to Suspense/query-state (Unit 9), and conflating them reports 'done' the moment rendering finishes while data is still in flight. One more consequence worth internalizing: because transitions keep showing the previous UI, they *change what 'slow' looks like* — from frozen screens to stale-but-live screens. That is strictly better, but it is not free: you now owe the user clarity about which truth they're looking at."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Transitions are a scheduling claim, and wrong claims are bugs.** Marking an update as a transition asserts: 'the UI showing the pre-update state for a while longer is acceptable and coherent'. That is false for: controlled input echoes (typing must track keys), anything the user directly manipulates (drag positions, toggle states, cursor selection), and updates whose OLD state is misleading once the action occurred (a 'Delete' click leaving the row visible-but-doomed during a transition invites a second click — either update urgently or pair the pending state with disabling). It is true for: navigation-scale re-renders, filtering/sorting big views, tab/content switches, chart re-draws. The test is user-semantic, not technical: after the action, is the previous screen still an honest thing to display? If yes, transition; if no, urgent — and if urgent is too slow, the fix is Unit 7 (make it cheaper), not a priority lie."
            },
            {
              "type": "example",
              "heading": "Worked example: diagnosing a transition that 'doesn't work'",
              "body": "A team wraps their search update in startTransition, but typing still stutters. Debug it with the semantics, not vibes. **Check 1 — is the urgent path actually cheap?** Profile the *urgent* pass: it should render only the input echo. Finding: the results list reads `query` (the urgent state) directly — so the slow list renders in the *urgent* pass; the transition wraps a `setResults` nobody reads. The split-state idiom was half-applied: the list must consume the *transition-updated* state (or a deferred value), not the urgent one. **Check 2 — does the expensive consumer bail out during urgent passes?** With useDeferredValue: no memo on the slow child ⇒ the urgent pass re-renders it anyway (the code-block warning) — add React.memo. **Check 3 — is the jank actually render-phase?** If the profiler shows cheap renders but long tasks elsewhere: `computeResults` running synchronously *inside* the handler (before any transition — startTransition's scope runs synchronously! it stamps updates; it does not defer *your computation*) is a classic — move the heavy computation into the render of the component consuming the transition state (where slicing can interrupt *between components*), or off-thread entirely (worker) if it's one indivisible 200ms function — **slicing yields between fibers, not inside your for-loop**; a single monolithic computation can't be time-sliced by React no matter what lane it's in. That last clause is the most misunderstood fact about transitions: they schedule *component renders*; they do not make your algorithms preemptible. Concurrent React buys you scheduling between units of *its* work — the units you give it must themselves be small."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Classify each update as urgent or transition, with the user-semantic justification (is the old screen still honest?): (a) the text in a controlled search input; (b) re-sorting a 5,000-row table when a column header is clicked; (c) the pressed/unpressed state of a Like button; (d) the route-level page change on a nav click; (e) live-region announcement text for a screen reader after form submission.",
                  "solution": "(a) Urgent — the input must echo keys in-frame; deferring it lags typing (the anti-purpose). (b) Transition — the old ordering remains honest content while the new one computes; pin the clicked header's active state urgently (split-state idiom). (c) Urgent — direct manipulation; a Like that visually lags invites double-taps and reads as broken (and the old state is dishonest the instant the user acted). (d) Transition — the classic case: old page stays interactive while the new one renders; pair with a pending affordance on the clicked link. (e) Urgent — assistive announcements must correspond to the action immediately; a deferred announcement can interleave with subsequent focus changes and mis-narrate the interface. Pattern: user's direct manipulations and feedback-at-the-interaction-site are urgent; large derived views are transitions.",
                  "hint": "For each: after the user's action, is showing the previous state for another 200ms honest? And is this the interaction site itself?"
                },
                {
                  "prompt": "Explain precisely why useDeferredValue requires React.memo on the expensive consumer to deliver any benefit — walk both render passes of the deferring component and identify where the work goes with and without memo.",
                  "solution": "On an urgent change to `value`, React renders the deferring component TWICE. Pass 1 (urgent lane): value is new, useDeferredValue returns the OLD value — the component's own (cheap) output updates urgently; the expensive child receives deferredText identical to last render. WITHOUT memo: 'receives identical props' is irrelevant — default propagation re-renders it anyway (Unit 7's rule), so the slow render happens in the URGENT pass: total behavior identical to no deferral, plus overhead. WITH memo: props Object.is-equal ⇒ bailout — the urgent pass skips the slow subtree entirely (this skip is the entire mechanism). Pass 2 (transition lane, background): useDeferredValue now returns the new value; the memo comparison fails (deferredText changed) and the slow child renders — sliced, preemptible, supersedable. So the deferral doesn't 'slow down' the child; it splits one render into urgent-with-old + deferred-with-new, and memo is the valve that routes the expensive work into the second. No valve, no routing.",
                  "hint": "Two passes, two deferredText values, one memo comparison per pass — trace where the slow render lands in each configuration."
                },
                {
                  "prompt": "A dashboard runs startTransition(() => { setFilter(f); setPage(0); setSelection(null); }). Mid-render, the user clicks an urgent toggle elsewhere; then types another filter character (a new transition on the same states). Describe every render/commit that occurs and every screen the user sees, invoking the specific semantics clauses.",
                  "solution": "Sequence: (1) Transition A renders in slices; screen shows the pre-A state throughout (clause 3: previous complete state stays up; isPending true). (2) Urgent click: A's workInProgress abandoned (clause 1 non-blocking / preemption); urgent update renders + commits immediately — the user sees the toggle flip on an otherwise pre-A screen (consistent: A's partial work never leaks, clause 3 atomicity). (3) The new keystroke starts transition B on the same state cells: A is SUPERSEDED (clause 2) — its render never resumes and its intermediate state (filter f, page 0…) is never committed or shown; B's updates (newer filter, page 0, null selection) render against the post-toggle base. (4) B commits atomically: the user sees pre-A-plus-toggle screen transform directly into B's complete result — never A's. Total screens: pre-A → pre-A+toggle → B. The three-setState group behaved atomically in both A and B (no frame with new filter but old page), and 'latest wins' required zero user code — the supersession semantics did the debouncing-by-abandonment.",
                  "hint": "Apply, in order: preemption+abandonment, atomic commit of the urgent lane, supersession of A by B, atomic commit of B."
                },
                {
                  "prompt": "A colleague benchmarks a transition-wrapped 400ms table re-sort and reports 'transitions are fake — total time to new content is still 400ms, and the main thread still did 400ms of work'. Write the correction: what transitions actually promise, what they explicitly don't, and the two cases where the same 400ms becomes a WORSE total under transitions — with why that trade is usually still right.",
                  "solution": "Promised: responsiveness (urgent input preempts at every yield — the app never freezes) and coherence (old content stays complete + pending affordance; the new state commits atomically). Explicitly NOT promised: reduced latency-to-content (same CPU work, now sliced — often slightly slower wall-clock due to yielding), off-thread execution (slices share the main thread), or fewer renders. The two worse-total cases: (a) interruptions force restarts — an urgent commit mid-transition redoes completed work, so under heavy urgent traffic (fast typing) a transition can restart repeatedly and land LATER than a blocking render would have (mitigated by supersession semantics: only the latest matters, and stale results were never wanted); (b) the yielding overhead itself — 80 slices × scheduling costs adds a few ms versus one straight pass. Why still right: the alternative spends the same 400ms FROZEN — dropped keystrokes, dead clicks, janked animations — which users experience as breakage, while a stale-but-live screen with honest pending UI is experienced as speed. Transitions optimize the interaction, not the throughput; benchmark INP/responsiveness during the work, not just time-to-completion.",
                  "hint": "Separate latency-to-content from responsiveness-during-work; then find where restarts and slice overhead land."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u8l2-i1",
              "front": "What does startTransition actually do to the updates in its scope?",
              "back": "Runs the scope synchronously and stamps its state updates as transition-lane: rendered in a sliced background pass, preempted by urgent work, superseded by newer transitions, committed atomically — with the previous UI shown until then."
            },
            {
              "id": "u8l2-i2",
              "front": "The three-part semantics of a transition?",
              "back": "Non-blocking (urgent work preempts at yield points), restartable/supersedable (abandoned on urgent commits; newest same-state transition wins), consistent (atomic commit; old complete state visible with isPending until then)."
            },
            {
              "id": "u8l2-i3",
              "front": "useTransition vs useDeferredValue — when each?",
              "back": "useTransition when you control the dispatch site (mark the update). useDeferredValue when the fast value arrives from elsewhere (defer at consumption) — and it REQUIRES memo on the expensive consumer to route work into the background pass."
            },
            {
              "id": "u8l2-i4",
              "front": "The split-state idiom for one interaction?",
              "back": "Decompose into urgent feedback (input echo, tab highlight — set outside the transition) + deferred consequence (results, content — set inside). One event, two priorities."
            },
            {
              "id": "u8l2-i5",
              "front": "What do transitions NOT do?",
              "back": "No speedup (same CPU, sliced), no debounce timer, no off-thread work, and no preemption INSIDE one function — slicing yields between fibers; monolithic computations need workers or decomposition."
            },
            {
              "id": "u8l2-i6",
              "front": "The user-semantic test for 'should this be a transition'?",
              "back": "After the action, is the previous screen still honest to display? Yes (filters, tabs, navigation) → transition. No (input echoes, direct manipulation, feedback at the interaction site) → urgent."
            }
          ]
        },
        {
          "id": "u8l3",
          "title": "Tearing and External Stores",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The consistency guarantee — and the values it doesn't cover",
              "body": "Concurrency's machinery (Lesson 1) was engineered to preserve a guarantee users never think about until it breaks: **within one committed frame, every component rendered from the same state snapshot**. For React-managed state the guarantee is structural — a render pass reads each hook cell's value once at the pass's base (Unit 5's cursor walk against a fixed tree), interrupted passes restart *entirely* against the new base rather than resuming (Lesson 1's restart-not-resume), and commits are atomic. No schedule can commit a frame where the header rendered count=5 and the footer count=6, because both read the same cell in the same pass. But one category of value escapes the machinery: **external mutable stores** — module-level objects, Redux-style stores, browser APIs (localStorage, location, matchMedia), anything living outside fiber state that render code reads directly. React cannot snapshot what it doesn't own: if the store mutates *between two slices* of a time-sliced render, components rendered before the yield saw the old value and components after it see the new one — and commit, unaware, publishes both in a single frame. That committed inconsistency is **tearing**, and it is concurrency's signature failure mode: impossible under synchronous rendering (no gap for the mutation to land in), latent in any concurrent app reading shared mutables during render, and — because it needs a mid-render write to manifest — brutally timing-dependent to reproduce. This lesson constructs it precisely, then presents the contract that eliminates it."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The tearing construction",
              "statement": "Let S be a mutable store outside React, read during render by components A and B (say both display S.value), and let a concurrent (time-sliced) render pass P visit A before a yield point and B after it. If S.value is mutated (v → v′) during the yield — by a timer, network callback, or urgent event handler that writes S — then P completes with A's output rendered from v and B's from v′, and commit publishes a frame in which two components display different values of the same datum. No purity violation by A or B is required (each read S honestly at its own execution time); the inconsistency is created entirely by the interleaving of slices with external writes. Under synchronous rendering the construction is impossible: the pass admits no yield, so no external write can land between A's read and B's read (run-to-completion), which is why the bug class arrived WITH concurrency.",
              "proof": "Timeline: P begins for some lane set; performUnitOfWork renders A, whose function executes `S.value` — the read returns v; A's fiber completes with output f(v). shouldYield() triggers; the loop exits; the browser runs a pending timer whose callback executes `S.value = v′` (legal — S is ordinary mutable JavaScript, and the callback is not render-phase code bound by any contract). The continuation resumes P at the saved pointer; B renders, reads S.value = v′, completes with output g(v′). P reaches the root; commit applies f(v) and g(v′) in one atomic mutation set: the screen simultaneously shows both. Neither A nor B could have detected the other's world: each executed correctly in its own instant. The synchronous case: without yields, A's read and B's read are separated only by synchronous reconciler code; the timer callback cannot run until the pass (and its synchronous commit) completes — the write lands before the pass or after the commit, both consistent. ∎ Note what the proof did NOT need: no misuse of React, no impurity beyond reading a non-React value during render — which Unit 1's contract already discouraged (clause 2) and this proposition now shows to be concurrency-unsafe specifically."
            },
            {
              "type": "code",
              "heading": "useSyncExternalStore: the subscription contract that closes the gap",
              "lang": "jsx",
              "code": "// The API: value = useSyncExternalStore(subscribe, getSnapshot,\n//                                        getServerSnapshot?)\n//   subscribe(cb): register cb to fire on ANY store change; return\n//                  an unsubscribe function. React manages the\n//                  subscription's lifetime (NOT an effect you write).\n//   getSnapshot(): synchronously read the CURRENT store value —\n//                  must return a CACHED/IMMUTABLE value: same\n//                  reference until the store actually changes\n//                  (a fresh object per call = infinite re-render loop,\n//                  since React uses Object.is on snapshots to detect\n//                  change).\n\n// A tiny correct store:\nfunction createStore(initial) {\n  let state = initial;                      // the single mutable cell\n  const listeners = new Set();\n  return {\n    read: () => state,                      // getSnapshot: returns the\n                                            // CURRENT immutable value\n    write(next) {\n      state = next;                         // replace, never mutate —\n      listeners.forEach(l => l());          // then notify\n    },\n    subscribe(l) {\n      listeners.add(l);\n      return () => listeners.delete(l);\n    },\n  };\n}\nconst themeStore = createStore({ mode: 'dark' });\n\nfunction useTheme() {\n  return useSyncExternalStore(themeStore.subscribe, themeStore.read);\n}\n\n// What React does with the contract (the anti-tearing machinery):\n// • On store change: re-render subscribers at SYNC priority — external\n//   store updates are deliberately NOT time-sliced (no yield gap ⇒ no\n//   window for divergent reads: the proposition's precondition removed).\n// • During any concurrent pass that read snapshots: before commit,\n//   re-check getSnapshot() against the values used; if the store moved\n//   mid-render, THROW AWAY the pass and re-render synchronously —\n//   detected-at-commit tearing is converted into a restart.\n// • The cost, stated honestly: external-store updates forgo transition\n//   scheduling (they render synchronously). Consistency was bought by\n//   giving up slicing FOR THOSE UPDATES — one more reason to keep\n//   fast-changing UI state in React state (transitions work there,\n//   because React can snapshot what it owns).\n\n// Browser-API selectors, the everyday use:\nfunction useMediaQuery(q) {\n  return useSyncExternalStore(\n    cb => { const m = matchMedia(q); m.addEventListener('change', cb);\n            return () => m.removeEventListener('change', cb); },\n    () => matchMedia(q).matches,            // boolean: primitive snapshot ✓\n    () => false                             // server default (Unit 9)\n  );\n}"
            },
            {
              "type": "text",
              "heading": "Reading the contract like a systems engineer",
              "body": "Each parameter of useSyncExternalStore exists to defeat a specific failure, and seeing the mapping is what makes the API memorable. **subscribe** hands React the store's change channel, so notification-driven re-rendering replaces render-time polling: components stop *reading a mutable during render* (the tearing precondition) and start *rendering from a snapshot React requested*. React also uses the subscription's lifetime for correctness bookkeeping — resubscribing when subscribe's identity changes, unsubscribing on unmount — which is why you pass the functions rather than wiring an effect: the hook's internal timing (subscribe *before* checking for missed updates, re-check after) closes the lost-update races a hand-rolled effect version has (subscribe-after-render leaves a gap where a change fires unheard). **getSnapshot** makes the read *explicit, synchronous, and comparable*: React can call it at defined points — during render, and again at pre-commit — and Object.is-compare results; the immutable-snapshot requirement (stable reference until real change) is what makes the comparison meaningful (Unit 3's certificate logic, again). The **pre-commit re-check** is the heart: it converts undetectable mid-render movement into a detected event with a defined response (discard, re-render synchronously). And the **sync-priority scheduling** of store updates is the honest trade: React cannot restart-with-consistency against a base *it doesn't own snapshots of*, so it removes the yield gaps instead. The corollary for architecture: uSES is for *genuinely external* facts (browser state, third-party stores, cross-tab data, module singletons); for app state you control, React state + transitions is strictly more capable — don't move state out of React to 'use the fancy hook', because the move *costs* you concurrent scheduling."
            },
            {
              "type": "example",
              "heading": "Worked example: the selector version and the re-render economics",
              "body": "A Redux-style store holds `{ user, cart, prices }` with prices ticking 4×/sec (Unit 7's dashboard, from the store side). Naive integration — `const state = useSyncExternalStore(store.subscribe, store.getState)` in every component — re-renders *every subscriber on every tick*: getState's snapshot reference changes whenever anything in the store does (immutable updates replace the root), so all subscribers see 'changed'. The refinement: **per-component selectors** — subscribe to the store, but snapshot only the slice you read: `useSyncExternalStore(store.subscribe, () => store.getState().cart)`. Now a price tick replaces the root and the prices branch, but `cart`'s branch is structurally shared (Unit 3's proposition doing load-bearing work in a store!) — its reference is unchanged, the snapshot compares equal, and React skips the re-render for cart-only subscribers. Two sharp edges: (1) the selector must return a *stable* reference — `() => state.items.filter(inStock)` allocates per call: infinite loop or wasted renders (the comparison never holds); derived selections need memoized selectors (reselect-style) or the `useSyncExternalStoreWithSelector` helper, which adds an isEqual escape hatch; (2) selector granularity is the store-world's version of Unit 4's context-splitting economics — one subscription per consumed *fact*, not per store. This example is also the honest résumé of the whole library ecosystem: Redux's `useSelector`, Zustand's hooks, Jotai's atoms are all this pattern — subscribe + immutable snapshot + selector + equality — packaged; after this lesson you can read any of their sources and find the four pieces."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**The hand-rolled version is wrong in ways you won't see in testing.** The pre-uSES idiom — subscribe in useEffect, setState in the callback, read the store in render — has three latent defects: a **lost-update window** (the store can change between render and the effect's subscribe; nothing re-renders — your 'initial' value is silently stale until the next change), **tearing** under concurrent features (render-time store reads with no pre-commit check — the proposition, unguarded), and **zombie reads** during interrupted renders (reading a store that a preempting update already changed, then committing the stale read). All three are timing-dependent: demos pass, production flakes. useSyncExternalStore exists because the React team concluded this pattern CANNOT be written correctly in userland with effects alone — the pre-commit hook into the reconciler is not accessible to you. The rule is absolute: render-time reads of anything mutable outside React go through uSES, full stop."
            },
            {
              "type": "text",
              "heading": "The full placement picture, completed",
              "body": "This lesson completes Unit 4's state-placement ladder with its concurrency column, and the summary is worth engraving. **React state** (useState/useReducer, lifted, or via context): snapshotted per pass, batched, transition-schedulable — the *most* capable tier under concurrency; keep everything here that you can. **External store via uSES**: for facts that genuinely live outside — browser APIs, cross-framework singletons, multi-tab-shared data, high-frequency feeds wanting per-subscriber selection (the 30Hz cursor case from Unit 4, where selector granularity beats context broadcast). The price: sync-rendered updates (no transitions), and the snapshot/selector stability disciplines. **Derived values**: still computed in render (Unit 4) — deriving from a uSES snapshot is fine (it's a per-pass constant like any input). **Server data**: the next unit — where the 'store' is a cache with staleness semantics and the synchronization is network-shaped. The through-line of the whole unit, stated once more: concurrency didn't add rules — it *cashed* the ones you already had. Purity made renders discardable; immutability made snapshots comparable; phase separation made commits atomic; and the one value category outside those contracts (shared mutables) needed one new API whose entire job is re-importing the contracts at the boundary. Systems that were honest about Units 1–3 got concurrent features for free; systems that cheated meet their debts here, with interest and without stack traces."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Construct the tearing scenario concretely: a module-level `let rate = 1.1` read during render by <PriceHeader> and <PriceTable> (200 rows between them in traversal order), updated by a websocket callback `rate = 1.2`. Give the exact interleaving that commits an inconsistent frame under a time-sliced render, and state why the same code cannot tear in React 17.",
                  "solution": "Sliced pass P begins: PriceHeader renders early, reads rate = 1.1, completes showing '$1.10 rate'. The 200 rows consume several slices; at a yield between slices the event loop runs the websocket message callback: rate = 1.2 (legal ordinary JS). P resumes, reaches PriceTable, which reads rate = 1.2 and renders totals at the new rate. P completes; commit atomically publishes header claiming 1.1 and table computed at 1.2 — one frame, two truths; support ticket: 'totals don't match the shown rate'. React 17 (fully synchronous rendering): the pass runs to completion on the main thread; the websocket callback is queued behind it and executes only after render+commit finish — both components read the same pre- or post-write value; no interleaving exists. The construction needs exactly: shared mutable + render-time read + yield gap + external write — remove any one (uSES removes the first two by contract, sync rendering the third) and tearing is impossible.",
                  "hint": "Place the write in the yield between the header's slice and the table's slice; then ask where that gap exists in React 17."
                },
                {
                  "prompt": "Explain both failure modes of a getSnapshot that returns a fresh object per call — () => ({ ...store.state }) — and derive the two acceptable snapshot disciplines from Object.is semantics.",
                  "solution": "React detects store change by Object.is on successive getSnapshot() results. Fresh-object-per-call: (1) after a legitimate re-render, React re-checks the snapshot — new reference ≠ old reference — concludes 'store changed again', schedules another re-render, which produces another fresh object… an infinite re-render loop (React throws 'getSnapshot should be cached' in dev); (2) even where loop protection intervenes, every check reads 'changed', so subscribers re-render on every pass regardless of actual store movement — the comparison is permanently meaningless. The disciplines that follow: (a) return the store's OWN immutable value (the store replaces its state object on write — the reference IS the version: stable between writes, different across them — Unit 3's certificate); or (b) return a primitive (matchMedia().matches, storage string) — value-compared by Object.is, allocation-free. Both make Object.is a truthful change detector, which is the entire epistemology of the hook.",
                  "hint": "What question does React answer with Object.is on snapshots, and what must be true of references for the answer to mean anything?"
                },
                {
                  "prompt": "A team stores their app's filter state in a Zustand store (external) 'for cleanliness' and later wraps filter updates in startTransition, expecting non-blocking filtering of their 8,000-row table. Nothing changes — every filter update still renders synchronously and janks. Explain why, from the uSES contract, and give the two honest architectures.",
                  "solution": "External-store updates propagate via useSyncExternalStore, which schedules subscriber re-renders at SYNC priority by design — React cannot time-slice renders reading a store it can't snapshot/restart consistently, so it removes the yield gaps instead (consistency bought by giving up slicing). startTransition marks REACT state updates' lanes; the store write inside the scope isn't a React update at all — the transition wrapper is inert, and the store's notification renders synchronously: hence unchanged jank. Honest architectures: (1) move the filter into React state (useState/useReducer at the table's owner) — now startTransition works as designed: sliced, preemptible, supersedable filtering (the capability argument for keeping owned state IN React); or (2) keep the store but defer at consumption: const filter = useStore(s => s.filter); const deferred = useDeferredValue(filter) + memo on the table — the store update still syncs, but it only re-renders the cheap subscriber; the expensive table consumes the deferred value in a background pass. (2) costs the double-render pattern; (1) is cleaner when the state has no external reason to live outside. 'For cleanliness' moved the state OUT of the tier where transitions exist — placement has concurrency consequences.",
                  "hint": "Which scheduler handles a store notification vs a React state update? Where can useDeferredValue re-insert deferral?"
                },
                {
                  "prompt": "Design an audit checklist (5 items) a reviewer can run on any codebase to find latent tearing risks before enabling concurrent features, each item tied to the proposition's preconditions — and state which single item, if enforced, eliminates the class.",
                  "solution": "(1) Grep render paths for reads of module-level mutables (config singletons, caches, feature-flag objects) — shared-mutable + render-read is preconditions 1+2. (2) Inventory browser-API reads in render: location, localStorage, matchMedia, innerWidth, Date.now — all external mutables; each needs uSES (or state) wrapping. (3) Audit store libraries' versions/integration: any subscribe-in-effect + read-in-render integration (pre-uSES adapters) carries the lost-update and no-pre-commit-check defects; require uSES-based versions. (4) Check getSnapshot/selector stability where uSES IS used: fresh-object snapshots and inline unmemoized selectors defeat the comparison (loop/holes). (5) Flag any 'read from ref during render' patterns (Unit 6's proposition) — refs are mutable stores too; mid-render ref mutation by handlers is the same interleaving hazard in miniature. The single decisive item: (1)+(2) merged — 'no render-time read of anything mutable outside React state; all such reads go through useSyncExternalStore' — because the proposition REQUIRES a render-time read of a shared mutable; removing that precondition (route every such read through the contract) makes the other conditions (yield gaps, external writes) harmless: they can no longer meet a divergent read.",
                  "hint": "The proposition needs four conditions simultaneously; which single precondition, removed everywhere, starves all constructions?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u8l3-i1",
              "front": "What is tearing, and what four conditions does it require?",
              "back": "One committed frame showing two values of the same datum. Requires: a shared mutable outside React + render-time reads of it + a yield gap (time-slicing) + an external write landing in the gap."
            },
            {
              "id": "u8l3-i2",
              "front": "Why can't React 17-style synchronous rendering tear?",
              "back": "Run-to-completion: no yields inside a pass, so no external write can land between two components' reads — the interleaving window doesn't exist. The bug class arrived with concurrency."
            },
            {
              "id": "u8l3-i3",
              "front": "The useSyncExternalStore contract, in its three parts?",
              "back": "subscribe (React manages the change-notification lifetime), getSnapshot (synchronous read returning a CACHED immutable value — Object.is-comparable), optional getServerSnapshot (SSR). React re-checks snapshots pre-commit and discards torn passes."
            },
            {
              "id": "u8l3-i4",
              "front": "What does uSES trade away for consistency?",
              "back": "External-store updates render at sync priority — no time-slicing or transitions for them. React removes the yield gap because it can't restart consistently against a base it doesn't own."
            },
            {
              "id": "u8l3-i5",
              "front": "Why must getSnapshot return a stable reference until the store truly changes?",
              "back": "React detects change by Object.is on snapshots: fresh-per-call objects read as 'always changed' — infinite loops or meaningless comparisons. Immutable-replace stores (or primitive snapshots) make the check truthful."
            },
            {
              "id": "u8l3-i6",
              "front": "Store selectors — why and with what discipline?",
              "back": "Snapshot only the consumed slice (() => getState().cart): structural sharing keeps unchanged branches reference-stable, so unrelated updates skip you. Selectors must return stable references — memoize derived selections."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u8-check",
        "questions": [
          {
            "id": "u8q1",
            "type": "short",
            "prompt": "Concurrent React's spine is an asymmetry: one phase is interruptible, the other is atomic. Name them in that order. (Format: 'X, Y')",
            "accept": [
              "render, commit",
              "render commit",
              "the render phase, the commit phase",
              "render phase, commit phase",
              "rendering, committing"
            ],
            "explanation": "Render builds private, discardable descriptions (workInProgress fibers) — sliceable between any two units of work. Commit mutates the shared DOM and must complete in one synchronous pass, or half-applied frames would be observable. Every concurrent behavior respects this line.",
            "points": 1
          },
          {
            "id": "u8q2",
            "type": "mcq",
            "prompt": "A transition render is 70% complete when the user clicks a button (urgent update). What does React do?",
            "options": [
              "Finishes the transition render first (30% left), then handles the click — renders are atomic",
              "Pauses the transition, renders and commits the urgent update, then RESUMES the transition from 70%",
              "Abandons the transition's work-in-progress tree, renders and commits the urgent update, then RESTARTS the transition from scratch against the new committed base",
              "Merges the click into the transition so both commit together at transition priority"
            ],
            "answer": 2,
            "explanation": "Abandon + restart, not resume: the 70%-built tree encoded the pre-click snapshot; resuming would graft two bases into one commit — scheduler-manufactured tearing. Abandonment is free (the workInProgress tree is private; purity means it produced no observable effects), and the restart's redo is cheapened by bailouts on unchanged subtrees. (a) is the pre-Fiber blocking behavior; (d) inverts priority isolation.",
            "points": 1
          },
          {
            "id": "u8q3",
            "type": "multi",
            "prompt": "Which statements about transitions are TRUE? (Select all that apply.)",
            "options": [
              "startTransition defers execution of the function you pass it",
              "A newer transition on the same state supersedes an older in-flight one — the stale render is abandoned and never shown",
              "useDeferredValue delivers benefit only when the expensive consumer is memoized, because the urgent pass must bail out on the unchanged deferred value",
              "Marking a controlled input's value update as a transition improves typing responsiveness",
              "During a pending transition, the screen shows the previous complete state, not a partially-updated one"
            ],
            "answer": [
              1,
              2,
              4
            ],
            "explanation": "(b) supersession is the built-in 'latest wins'. (c) the two-pass mechanism routes slow work into the background pass only via the memo bailout. (e) atomicity + previous-UI is transition consistency. (a) is false — the scope runs synchronously; only the UPDATES are stamped as low priority. (d) is inverted — input echoes must be urgent; deferring them makes typing lag (the anti-purpose).",
            "points": 2
          },
          {
            "id": "u8q4",
            "type": "proof",
            "prompt": "Prove the tearing construction: exhibit the interleaving by which a time-sliced render over components A and B, both reading a mutable external value during render, commits a frame showing two different values — and prove the same code cannot produce that frame under synchronous rendering. Conclude by identifying which precondition useSyncExternalStore removes.",
            "rubric": [
              "Constructs the interleaving precisely: A renders reading v before a yield; an external callback writes v→v′ during the yield (legal non-render code); B renders reading v′ after resumption; commit atomically publishes f(v) and g(v′) together",
              "Notes no contract violation by A/B individually is needed beyond the render-time external read — each read honestly at its execution instant; the inconsistency is created by interleaving",
              "Synchronous impossibility: run-to-completion means the pass admits no yield; the external callback is queued until after render+commit, so both reads see the same value — the write lands wholly before or wholly after",
              "Identifies the removed precondition: uSES eliminates render-time divergent reads (snapshot + pre-commit re-check discards torn passes) and removes yield gaps for store updates (sync-priority rendering) — either suffices to starve the construction"
            ],
            "solution": "Construction: sliced pass P serves some lane set. Unit-by-unit, P renders A; A's body reads store value v and completes with output f(v). shouldYield() fires between units; the loop exits, and the event loop runs a queued callback (timer, socket message, urgent handler) executing store.value = v′ — ordinary JavaScript outside any React contract. P resumes at its saved pointer and renders B, whose body reads v′, completing with g(v′). P finishes; commit applies the full mutation set atomically: one frame displays f(v) beside g(v′) — two renderings of one datum, divergent. Neither component misbehaved locally: each read the store correctly at its own instant; the frame's inconsistency is a pure interleaving product (shared mutable × render-read × yield gap × external write). Synchronous case: rendering runs to completion on the main thread — between A's read and B's read only reconciler code executes; the writing callback sits in the task queue until after commit. Hence both components read identically (both v, or both v′ if the write preceded the pass): no reachable schedule commits divergence. uSES: getSnapshot centralizes reads into React-requested snapshots, compared (Object.is) at pre-commit — a store that moved mid-pass is detected and the pass is discarded and re-rendered synchronously (torn frames never commit); additionally store-change re-renders run at sync priority, eliminating yield gaps for those updates. Either mechanism alone starves the construction; together they remove both the divergent-read and the gap preconditions. ∎",
            "explanation": "Tearing is the one genuinely NEW bug class concurrency introduces, and this proof is its complete anatomy: four preconditions, an exact interleaving, the synchronous alibi, and the contract that closes it. An engineer who can produce this proof can also audit for it — which is the point.",
            "points": 3
          },
          {
            "id": "u8q5",
            "type": "open",
            "prompt": "Architecture review under concurrency. A live-ops dashboard: (1) reads window.location.search directly in several components' render to derive filters; (2) holds a module singleton MetricsCache that render code queries, updated by a 2Hz poller; (3) recently wrapped its heavy incident-table re-sorts in startTransition, but engineers report clicks during re-sorts feel fine while OTHER engineers on slow laptops see the sort 'restart repeatedly and never finish' during incident storms (frequent urgent updates); (4) plans to move all remaining useState into the MetricsCache singleton 'for consistency'. Deliver: the tearing/consistency risk assessment for (1) and (2) with fixes; the mechanism-level explanation of (3) with two mitigations; and the argued verdict on (4).",
            "rubric": [
              "(1) Diagnoses render-time reads of a browser mutable (location) as a tearing precondition and a Unit-1 clause-2 violation; fix: route through useSyncExternalStore (popstate/navigation subscription + string snapshot) or router state, deriving filters from the snapshot",
              "(2) Diagnoses the singleton as a shared mutable read in render — the exact proposition setup with the 2Hz poller as the yield-gap writer; fix: uSES with immutable-replace writes and per-component selectors (stable references), noting the sync-priority trade",
              "(3) Explains transition starvation: each urgent commit abandons and restarts the transition; under frequent urgent updates on slow hardware the transition may never complete a full pass — mitigations: shrink the transition's render cost (Unit 7: windowing/memo so restarts are cheap and complete within gaps) and/or batch/throttle the urgent update source (reduce preemption frequency); accepting supersession semantics where only-latest matters",
              "(4) Rejects wholesale migration: moving owned UI state into an external store forfeits snapshotting, batching, and transition scheduling (uSES renders sync) and adds snapshot/selector discipline burdens — external stores are for genuinely external facts; owned interactive state belongs in React state, per the placement ladder's concurrency column"
            ],
            "solution": "(1) location.search read in render is a shared mutable outside React: pushState/replaceState (or the poller navigating) can change it between slices — components deriving filters early and late in a sliced pass can commit disagreeing filter views (the construction, with the URL as the store). It also violates input-determinism (Unit 1 clause 2) even synchronously — same props, different output across navigations with no re-render trigger. Fix: one useLocationSearch() hook via uSES — subscribe to popstate (plus a monkey-patched/router-provided notification for pushState), getSnapshot: () => window.location.search (a string: primitive snapshot, Object.is-stable); components derive filters from the returned value — or, if a router library is present, its location state (which does this internally). (2) MetricsCache is textbook proposition setup: render-time queries + a 2Hz writer landing in yield gaps ⇒ dashboards where the summary tile and the detail table disagree about the same metric in one frame — exactly the inconsistency an OPS tool cannot afford. Fix: give the cache an immutable-replace write path (state = {...}, notify) and expose uSES access with per-metric selectors (stable references via structural sharing) — each panel subscribes to its slice; a metric tick re-renders only its consumers, synchronously (accepted trade: 2Hz sync renders of small subtrees is nothing). (3) Mechanism: transitions are restartable — every urgent commit (incident row updates during storms) abandons the in-flight sort render and restarts it against the new base. On fast hardware the sort completes within inter-urgent gaps; on slow laptops the sort's full pass exceeds the gap under storm-frequency urgent traffic, so it restarts perpetually — starvation, the designed behavior's honest cost. Mitigations: (a) shrink the transition's pass below the gap — Unit 7 levers on the incident table (windowing: render the viewport, not 10k rows; memoized rows so restarts mostly bail out — a restart over unchanged subtrees is cheap); (b) reduce preemption frequency — coalesce the urgent feed (batch incident updates to 1Hz application-side, or mark non-interactive feed updates as transitions themselves so they don't preempt at sync priority; reserve urgency for actual user input). Note supersession is fine here — only the latest sort matters — the problem is completion, not correctness. (4) Verdict: reject. Moving owned interactive state (selections, dialogs, form drafts, the sort/filter state itself) into the singleton would strip it of per-pass snapshots, per-lane batching, and transition eligibility — uSES subscribers render synchronously, so the very jank (3) is fighting would become unfixable-by-transitions app-wide (the Zustand-filter lesson generalized). 'Consistency' is achieved the other direction: external facts (metrics, URL) behind uSES contracts; owned state in React; derivations in render. The ladder's concurrency column: capability decreases as state moves outward — migrate state out only when a fact's nature (external writer, cross-tab, cross-framework) forces it.",
            "explanation": "The scenario wires all three lessons into one review: tearing preconditions in the wild (URL, singleton), transition starvation as designed-behavior-meets-slow-hardware, and the placement ladder's concurrency consequences. The grader rewards mechanism-level reasoning — interleavings, restart semantics, scheduling tiers — over tool name-dropping.",
            "points": 4
          },
          {
            "id": "u8q6",
            "type": "numeric",
            "prompt": "A concurrent render of 4,800 fibers proceeds in slices that each process 300 fibers before yielding. An urgent update arrives and commits during the 9th slice's yield, forcing a restart; on the restart, memo/=== bailouts let React skip 4,500 of the fibers, processing only the remainder at the same 300-per-slice rate. How many slices does the RESTARTED render need? (Number only.)",
            "answer": 1,
            "explanation": "The restart re-renders against the new base, but unchanged subtrees bail out at === or memo boundaries: only 4,800 − 4,500 = 300 fibers do real work, which fits in a single 300-fiber slice. This is why restart-not-resume is affordable in practice: the redo's cost is proportional to what actually changed, not to the tree — provided the app's identity/memo hygiene (Units 3 and 7) gives the bailouts something to work with.",
            "points": 1
          }
        ]
      }
    },
    {
      "id": "u9",
      "title": "Data, Suspense, and the Server",
      "summary": "Network data as a synchronization problem: the fetch-race proof and its protocol, Suspense as the declarative loading contract, the hydration matching invariant, and Server Components as the two-graph architecture.",
      "references": [
        "react.dev — Suspense, use, lazy API references; 'Synchronizing with Effects' (fetching + race cleanup)",
        "react.dev — hydrateRoot, renderToPipeableStream; 'New Suspense SSR Architecture in React 18' (reactwg #37)",
        "React RFC #188 — Server Components; react.dev — 'use client' / 'use server' directives",
        "TanStack Query documentation — stale-while-revalidate cache semantics (the query-library model)"
      ],
      "prerequisites": [
        "u8"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u9l1",
          "title": "Fetching and the Race You Always Have",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Network data is synchronization with a slow, unordered world",
              "body": "Every previous unit's external systems — sockets, widgets, storage — responded instantly. Network data adds the two properties that generate a whole discipline: **latency** (hundreds of milliseconds between ask and answer) and **unordered completion** (two requests issued in order may resolve in either order — routing, caching, server load; HTTP makes no sequencing promise across requests). Combine those with what you know: a fetch driven by displayed params is a Unit-6 synchronization ('the shown data should correspond to the shown query'), so it lives in an effect with the params as deps. But the effect's *response handler* is a closure that runs when the network decides, not when React does — a Unit-3 escaped closure carrying its birth render's params — and multiple episodes' handlers can be simultaneously in flight. The question 'which response is allowed to win?' is therefore not academic: without an explicit protocol, the winner is *whichever resolves last*, which correlates with nothing meaningful. This is the **fetch race**, the most common data bug in React applications — reproducible by any user who types faster than the API responds, invisible in fast-network development, and completely preventable with a three-line protocol this lesson derives. The lesson then zooms out: the protocol, plus caching, plus deduplication, plus staleness policy is exactly the feature list of query libraries — understanding the race is understanding why that layer exists."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The fetch race: last-write-wins is wrong, and cleanup restores correctness",
              "statement": "Let an effect fetch data for parameter q and write the response into state: useEffect(() => { fetch(q).then(r => setData(r)); }, [q]). (1) If the user changes q from A to B while A's request is in flight, and A's response arrives after B's (network reordering — always possible), the committed final state is data(A) displayed under query B: the UI permanently shows the wrong results, with no error and no recovery until another change. (2) The protocol — each effect episode sets a flag its cleanup revokes: let active = true; fetch(q).then(r => { if (active) setData(r); }); return () => { active = false; } — restores the invariant 'only the current episode's response may write', because changing q runs the old episode's cleanup (revoking its write permission) before starting the new episode (effect lifecycle, Unit 6). (3) AbortController strengthens the protocol from ignore-the-response to cancel-the-request (freeing bandwidth/server work), with identical correctness: abort in cleanup.",
              "proof": "(1) Timeline: episode A starts fetch(A); user types B; deps change ⇒ episode A's cleanup runs (none exists) and episode B starts fetch(B). In-flight: both. Resolution order B-then-A (permitted by the network): setData(r_B) commits data(B) — correct so far — then A's handler runs setData(r_A), committing data(A). Final frame: query box shows B, results show A. No further event corrects it: both promises are settled; the system is at rest in the wrong state. The failure needed only two overlapping episodes and adverse resolution order — no exotic timing. (2) With the protocol: episode A's closure holds active_A; when q changes, cleanup sets active_A = false BEFORE episode B begins (cleanup-before-setup ordering, Unit 6's lifecycle). B resolves: active_B is true, setData(r_B) commits. A resolves later: its handler reads active_A === false and writes nothing. Inductively, at any moment exactly one episode (the latest) holds a true flag — its cleanup hasn't run — so only the current episode can write state: last-episode-wins replaces last-response-wins. (3) abort() causes the fetch promise to reject (AbortError) — the handler must treat that rejection as silence, not error state; correctness is the same revocation, plus resource reclamation. ∎"
            },
            {
              "type": "code",
              "heading": "The protocol in full, including the parts everyone forgets",
              "lang": "jsx",
              "code": "function SearchResults({ query }) {\n  const [state, setState] = useState({ status: 'idle' });   // Unit 4's\n                                                            // machine, not\n                                                            // boolean soup\n  useEffect(() => {\n    if (!query) { setState({ status: 'idle' }); return; }\n    const controller = new AbortController();\n    setState({ status: 'loading' });\n    fetch(`/api/search?q=${encodeURIComponent(query)}`,\n          { signal: controller.signal })\n      .then(r => {\n        if (!r.ok) throw new Error(`HTTP ${r.status}`);      // fetch does NOT\n        return r.json();                                     // reject on 4xx/5xx\n      })\n      .then(data => setState({ status: 'success', data }))\n      .catch(err => {\n        if (err.name === 'AbortError') return;               // revoked episode:\n        setState({ status: 'failure', error: err });         // silence, not an\n      });                                                    // error banner\n    return () => controller.abort();                         // the revocation\n  }, [query]);\n\n  switch (state.status) { /* … render per machine state … */ }\n}\n\n// WHY THE PIECES ARE EACH LOAD-BEARING:\n// • status machine: 'loading' must not coexist with stale 'data' unless\n//   you CHOOSE stale-while-loading — make it a state, not an accident.\n// • abort in cleanup: revokes the old episode (the proposition) AND\n//   cancels network/server work. StrictMode's dev remount now aborts\n//   the probe request — correct behavior, visible in the network tab.\n// • AbortError filtered: an aborted request is a revoked episode, not\n//   a failure; routing it to 'failure' shows error flashes on every\n//   keystroke.\n// • !r.ok check: HTTP errors resolve successfully in fetch's API —\n//   unchecked, your 500s render as JSON parse crashes.\n\n// What this STILL doesn't have (the query-library gap): caching\n// (back-navigation refetches), deduplication (two components, two\n// requests), staleness policy, retries, pagination. Correct ≠ complete."
            },
            {
              "type": "text",
              "heading": "Waterfalls: the other structural fetch disease",
              "body": "The race is a correctness bug; the **waterfall** is the throughput bug with the same root (fetching wired to component lifecycle). A profile view renders `<Profile>` which fetches the user, then renders `<Posts userId>` which — only after mounting, which requires the user fetch to finish — fetches posts, which then mounts `<Comments>` which fetches… Three sequential round trips, ~200ms each: 600ms of serialized latency for data that has *no actual dependency* (posts and comments could have been requested at t=0 with the profile — the ids were in the URL). The mechanism: fetch-in-effect couples request *start time* to component *mount time*, and mount time is downstream of parent data arrival — so the component tree's shape becomes a dependency graph the data never asked for. The cures, in increasing architecture: **hoist and parallelize** — fetch all three at the route level (Promise.all or three independent states), pass data down: one round trip of latency; **route loaders** (framework-level) — start fetches at navigation time, before any rendering: the request graph follows the *URL*, not the tree; **Server Components** (Lesson 4) — the data access moves server-side where inter-service latency is 1–5ms and the waterfall's cost collapses even when sequential. The diagnostic habit: open the network tab and look at the *staircase* — requests starting where previous ones end, with no data dependency between them, are mount-coupled fetches asking to be hoisted."
            },
            {
              "type": "example",
              "heading": "Worked example: reading a race incident backwards from the symptom",
              "body": "Bug report: 'I searched for *rust*, results showed *react* — the previous thing I typed. Refreshing fixed it.' Reconstruct: the report's shape (stale results *under a newer query*, self-consistent otherwise, cured by refresh) is the proposition's clause (1) fingerprint — a superseded episode's response landing last. Verify without reproducing: the code shows `fetch(url).then(r => r.json()).then(setResults)` with deps [query] and no cleanup — the vulnerable form. Confirm the timing plausibility: the API's p95 is 900ms under load; a user typing 'rust' produces episodes for r/ru/rus/rust at ~150ms intervals — four in-flight requests whose completion order under load is effectively random; any earlier episode resolving last reproduces the report. Note *why QA missed it*: on the office network the API's p95 is 80ms — episodes complete before the next keystroke; overlap never occurs. The fix is the three-line protocol (plus, ideally, debouncing to cut request volume — a UX choice, not the correctness fix; debouncing narrows the window but cannot close it, since two debounced requests can still reorder). The incident's meta-lesson: **race bugs are diagnosed from their fingerprint** (stale-data-under-newer-input, heals on next change) **and from the code's shape** (async write-back with no revocation), not from reproduction — by the time you can reproduce a race locally you've usually already fixed it in your head."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Query libraries are this lesson, productized — use one for real apps.** TanStack Query, SWR, RTK Query, and Apollo all implement: keyed caches (data survives unmount; back-navigation is instant), request deduplication (n components, one flight), stale-while-revalidate (show cached, refetch in background — staleness as policy, not accident), the race protocol (per-key latest-wins), retries with backoff, and invalidation. The correct mental model: they are not 'fetch wrappers' but **client-side caches of server state with a synchronization policy** — Unit 4's ladder-top rung. Hand-rolled fetch effects are for learning the mechanics (this lesson) and for tiny cases; the moment two components want the same data, or data should outlive its component, you are re-implementing a cache badly. What the library does NOT change: the server owns the truth; everything client-side is a stale copy with a policy — design reviews should ask 'how stale can this be?' as routinely as 'what's the type?'."
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "The fetch race and its cure. Episode A (query 'a') and episode B (query 'ab') overlap; the network resolves B first, then A. WITHOUT revocation, A's late response writes last — stale data under a newer query. The cleanup's revocation (dashed) flips A's write to a no-op: last-episode-wins, not last-response-wins.",
              "actors": ["User", "EpisodeA", "EpisodeB", "State"],
              "messages": [
                { "from": "User", "to": "EpisodeA", "label": "type 'a' → fetch(a)", "tone": "sage" },
                { "from": "User", "to": "EpisodeB", "label": "type 'ab' → deps change", "tone": "gold" },
                { "from": "EpisodeB", "to": "EpisodeA", "label": "cleanup: active_A = false", "tone": "rust", "dashed": true },
                { "from": "EpisodeB", "to": "State", "label": "resolve B → setData(results_ab)", "tone": "sage" },
                { "from": "EpisodeA", "to": "State", "label": "resolve A → guarded: active_A false ⇒ no write", "tone": "rust", "dashed": true },
                { "note": "Unguarded, A's write lands here and stale 'a' results stick under 'ab'" }
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "The proposition's protocol uses a closure flag. A teammate proposes instead: keep a module-level requestId counter; increment per request; in the handler, compare the captured id against the counter and write only if equal. Evaluate: is it correct? How does it compare to the cleanup-flag protocol structurally, and which subtle React behavior does the cleanup version handle that the counter version silently also handles — or doesn't?",
                  "solution": "Correct, yes: capturing myId = ++counter and writing only if myId === counter implements latest-wins (any newer request bumps the counter, disqualifying older handlers) — it's the same revocation expressed as a version check (Unit 4's input-tagging). Structural comparison: the cleanup flag derives its lifetime from React's effect lifecycle (revocation happens exactly at episode end — deps change or unmount), while the counter derives it from request issue order — so the counter version keeps working even if fetching moves OUT of effects (handlers, loaders); it's the more portable idea and is what query libraries do per cache key. What the effect-cleanup version handles automatically that the counter must remember: UNMOUNT — cleanup revokes on unmount, preventing the write-after-unmount (harmless warning-wise in modern React, but a real leak of work and a wrong cache write in custom stores); the module counter never revokes on unmount (the component gone, the handler still passes the id check if no newer request happened — writing into whatever store outlives it). Verdict: counter for cache-keyed layers, cleanup flag (or abort) for component-local effects — and abort added to either for resource reclamation.",
                  "hint": "Both revoke; ask WHAT EVENT triggers each revocation, and which events the counter never hears about."
                },
                {
                  "prompt": "Diagram the request timeline for this component tree under fetch-in-effect, with each fetch taking 200ms: <Dashboard> (fetches layout config) renders <Widgets config> (fetches widget list) which renders one <Widget> per entry (each fetches its data, 4 widgets). Compute time-to-complete. Then give the hoisted design and its time — and identify the ONE fetch that genuinely cannot be parallelized and why.",
                  "solution": "Mount-coupled: t=0 Dashboard fetches config (done 200); Widgets mounts, fetches list (done 400); 4 Widgets mount, fetch in parallel (done 600). Total 600ms — a 3-step staircase where step 3 is internally parallel. Hoisted: config and widget LIST both depend only on the route — start both at t=0 (done 200); widget DATA fetches depend on the list's contents (you don't know which widgets exist until the list arrives) — start at 200, done 400. Total 400ms. The irreducible serialization: widget-data-after-list is a TRUE data dependency (the request parameters derive from the previous response); config-before-list was pure mount coupling. If the API can be changed, a combined endpoint (list+data in one round trip) removes even that: 200ms. The skill exercised: separating tree-shaped accidental dependencies from data-shaped real ones — only the latter constrain the schedule.",
                  "hint": "For each request ask: could I have issued it at t=0 knowing only the URL? If not, WHOSE response do its parameters come from?"
                },
                {
                  "prompt": "A code review shows: .catch(err => setState({status:'failure', error: err})) with abort in cleanup, and QA reports an error flash on every fast keystroke sequence. Explain the mechanism precisely and give the fix. Then: why does the same bug NOT appear in production telemetry as failed requests?",
                  "solution": "Mechanism: each keystroke's deps change runs the previous episode's cleanup → controller.abort() → that episode's fetch promise REJECTS with AbortError → the catch handler, not filtering it, routes the rejection into {status:'failure'} — committing an error state for a request that was deliberately revoked; the next episode's 'loading' overwrites it a frame later: hence the flash. Fix: first line of catch — if (err.name === 'AbortError') return; (revoked episode = silence). Production telemetry: aborts are client-initiated cancellations — the server may log them as closed connections (often excluded from error rates), and the client-side error tracking sees an AbortError only if someone reports it as an exception, which the catch swallowed into UI state instead; requests that complete aren't failures, requests that abort aren't server errors — so dashboards show a healthy API while users see flashing errors. The general moral: cancellation is a THIRD outcome (success/failure/revoked), and any handler with only two branches is misclassifying it somewhere.",
                  "hint": "What does abort() do to the pending promise, and which branch catches it? Then: who counts an abort as an 'error', client and server?"
                },
                {
                  "prompt": "Argue from this lesson's results which of these belong in component fetch-effects versus a query-library/cache layer, in a mid-size app: (a) the current user's profile shown in the header and settings page; (b) a one-off CSV export triggered by a button; (c) autocomplete suggestions for a search box; (d) the order list that must update after a 'cancel order' mutation elsewhere in the app.",
                  "solution": "(a) Cache layer: two consumers (dedup — one flight), long-lived (survives navigation), rarely changes (staleness policy: minutes) — every library feature earns its keep; fetch-effects here mean duplicate requests and refetch-on-every-visit. (b) Component/handler-local: it's an ACTION, not displayed state (Unit 6's necessity test — the cause is the click); no caching, no sharing, no staleness: plain awaited fetch in the handler with a progress state; a cache adds nothing. (c) Borderline, lean library-with-short-TTL or hand-rolled with the full protocol: high request volume (dedup + cancellation matter), cache hits on repeated prefixes are real wins, but staleness tolerance is near-zero (suggestions for 'ru' are useless once the box shows 'rust') — the race protocol is the non-negotiable part whichever layer owns it. (d) Cache layer, decisively: 'update after a mutation elsewhere' IS cache invalidation — with fetch-effects, the order list has no way to learn about the cancellation except prop-drilled refetch callbacks or remounting; a keyed cache makes it invalidateQueries(['orders']) at the mutation site. Pattern: shared, long-lived, or invalidation-coupled server state → cache; action-shaped or truly private-and-ephemeral → local.",
                  "hint": "For each: how many consumers, what lifetime, what staleness tolerance, and does anything ELSE need to invalidate it?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l1-i1",
              "front": "The fetch race in one sentence — and its user-visible fingerprint?",
              "back": "Overlapping fetch episodes resolve out of order and the stale one writes last: results for an OLD query displayed under the new one, self-healing on the next change — no error anywhere."
            },
            {
              "id": "u9l1-i2",
              "front": "The race protocol for fetch-in-effect?",
              "back": "Per episode: a revocation the cleanup triggers — active flag set false, or AbortController.abort() — so only the latest episode may write state (last-episode-wins replaces last-response-wins). Filter AbortError as silence."
            },
            {
              "id": "u9l1-i3",
              "front": "Two fetch-API gotchas that ship bugs?",
              "back": "fetch resolves successfully on 4xx/5xx (check r.ok or your 500s become parse crashes), and abort() rejects with AbortError (route it to silence, not the failure state — else error flashes per keystroke)."
            },
            {
              "id": "u9l1-i4",
              "front": "What is a request waterfall and its root cause?",
              "back": "Sequential round trips with no data dependency — fetch start time coupled to component mount time, so the tree's shape becomes a false dependency graph. Cure: hoist to route/loader level and parallelize; only response-derived parameters truly serialize."
            },
            {
              "id": "u9l1-i5",
              "front": "What are query libraries, correctly modeled?",
              "back": "Client-side caches of server state with a synchronization policy: keyed cache, dedup, stale-while-revalidate, per-key latest-wins, retries, invalidation. The server owns truth; the client holds a stale copy with a policy."
            }
          ]
        },
        {
          "id": "u9l2",
          "title": "Suspense: Loading as a Rendering Concept",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "Moving 'not ready yet' into the tree",
              "body": "Lesson 1's status machine handles loading *imperatively*: every data-consuming component carries its own switch on status, and composing several loading states (page = profile + posts + recommendations, each maybe-pending) means hand-coordinating spinners — the classic outcomes being spinner cascades (each component flashes its own), layout jumps as pieces pop in, and 'the everything spinner' that blocks the whole page on its slowest part. **Suspense** relocates the concern into the *rendering model*: a component that needs unready data doesn't render a loading state — it *suspends*, declaring 'I cannot describe my UI yet'. The declaration propagates up the tree to the nearest `<Suspense fallback={…}>` **boundary**, which renders the fallback in place of its entire children subtree until every suspension within resolves, then swaps the real content in. The inversion is the point: loading UI stops being each component's imperative bookkeeping and becomes *tree structure* — you design loading states by *placing boundaries*, exactly as you design error handling by placing error boundaries (Unit 10) or scopes by placing providers (Unit 4). Components become unconditionally simple (they render as if data is always there); the *where-do-spinners-go* question becomes an explicit, reviewable, product-level decision encoded in JSX; and the runtime gains the ability to coordinate reveals — which Lesson 3 will exploit across the network."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The Suspense contract",
              "statement": "(1) **Suspending**: during render, a component may signal unreadiness — mechanically, reading an unresolved thenable via `use(promise)` (or a Suspense-enabled data source; the legacy mechanism is throwing the promise). The render of that subtree is abandoned (safe: render is discardable — Unit 1/8). (2) **Boundary resolution**: the nearest ancestor `<Suspense>` catches the suspension: it commits its `fallback` in place of its *entire* children subtree — not just the suspended component. Siblings inside the boundary are hidden with it (their already-completed work may be preserved but is not shown). (3) **Retry and reveal**: when the promise resolves, React re-renders the boundary's content from the suspension point; if nothing else suspends, the fallback is atomically replaced by the full subtree — content inside one boundary reveals *together*. (4) **Nesting**: boundaries compose — an inner boundary catches its own subtree's suspensions, so outer content can reveal while inner regions still show inner fallbacks: reveal granularity = boundary placement. (5) **Transition interaction**: updates wrapped in startTransition that would cause an *already-revealed* boundary to re-suspend do NOT retreat to the fallback — React keeps showing the previous content (with isPending) until the new content is ready; only *initial* mounts (or non-transition updates) show fallbacks. (6) What Suspense is NOT: a data-fetching mechanism (it renders unreadiness someone else creates), and — in raw form — not a cache (`use` needs a stable promise across renders: from a cache, a framework loader, or a Server Component — creating the promise inline in render re-suspends forever)."
            },
            {
              "type": "code",
              "heading": "Boundaries as loading design — the page, three ways",
              "lang": "jsx",
              "code": "// The data layer provides suspense-compatible reads (query library\n// with suspense mode, framework loader, or use(cachedPromise)):\nfunction Profile({ id }) {\n  const user = use(userCache.get(id));      // suspends until ready —\n  return <header>…{user.name}…</header>;    // NO loading branch here\n}\n\n// DESIGN 1 — one boundary: the page reveals as a unit. No cascade,\n// maximal coherence, but time-to-anything = the SLOWEST query:\n<Suspense fallback={<PageSkeleton/>}>\n  <Profile id={id}/> <Posts id={id}/> <Recs id={id}/>\n</Suspense>\n\n// DESIGN 2 — nested: shell fast, regions independent. Profile reveals\n// when ready; posts/recs each manage their own patch of screen:\n<Suspense fallback={<PageSkeleton/>}>\n  <Profile id={id}/>\n  <Suspense fallback={<PostsSkeleton/>}><Posts id={id}/></Suspense>\n  <Suspense fallback={<RecsSkeleton/>}><Recs id={id}/></Suspense>\n</Suspense>\n// Reveal order is NOT guaranteed by position: recs may pop before\n// posts. If that ordering is jarring, that's a DESIGN input →\n\n// DESIGN 3 — sequenced reveal: wrap regions so each waits for the\n// previous (SuspenseList in experimental builds; or nest boundaries\n// inside each other to force top-down reveal at the cost of\n// serializing the SLOWER of each pair).\n\n// THE TRANSITION RULE (contract clause 5) in practice — tab switch\n// where both tabs' content suspends:\nstartTransition(() => setTab('activity'));\n// Already-shown boundary does NOT flash back to its fallback: the old\n// tab stays (dimmed via isPending) until activity's data is ready.\n// Without the transition, the boundary retreats to the skeleton on\n// every switch — the 'skeleton flash' users hate. Rule of thumb:\n// initial load → fallbacks; subsequent navigation → transitions\n// keeping old content."
            },
            {
              "type": "example",
              "heading": "Worked example: reading a suspension, mechanically",
              "body": "What actually happens when `Posts` calls `use(postsPromise)` and the promise is pending? Walk the machinery with Unit 8 in hand. The render of Posts *cannot complete* — there is no value to destructure — so React abandons that unit of work (legal: render-phase work is private and discardable) and records the pending thenable against the nearest boundary. Reconciliation continues elsewhere (siblings outside the suspended subtree still render — the pass isn't dead, just that subtree). At commit, the boundary's subtree is represented by its fallback; the real children's fibers are retained in memory (their state is *not* destroyed — a suspended subtree is hidden, not unmounted; an input inside keeps its draft). React attaches a resolution callback to the thenable; on resolve, it schedules a re-render of the suspended region — Posts renders again *from scratch* (its function re-runs; this is why `use` must read from a stable source: a fresh `fetch()` in the body would mint a new pending promise and suspend forever — the retry must find the *same*, now-resolved promise). If the re-render completes, commit swaps fallback → content atomically. Now the details that matter in production: **reveal atomicity** is per-boundary (clause 3) — partial content inside one boundary never shows; **state preservation** across suspension means a form inside a boundary that briefly re-suspends (without a transition) hides and returns with its draft intact — surprising both ways if unplanned; and **throttling** — React may briefly delay revealing nested boundaries (~300ms coalescing) to avoid staccato pop-in, an intentional smoothing you should know exists before you chase 'missing' milliseconds."
            },
            {
              "type": "text",
              "heading": "Where the promises come from: the ecosystem's division of labor",
              "body": "The contract deliberately says nothing about *how* data loads — Suspense renders unreadiness; something else must own creation, caching, and identity of the promises. The production sources, in current practice: **frameworks** (Next.js, Remix/React Router loaders) start fetches at route level and hand components resolved-or-pending data — the waterfall fix of Lesson 1 and the promise-stability requirement solved in one move (the loader's promise is stable per navigation); **query libraries in suspense mode** (useSuspenseQuery) — the cache provides the stable promise per key, plus all of Lesson 1's protocol; **Server Components** (Lesson 4) — data is awaited server-side and *streamed* into boundaries, no client promise management at all; **React.lazy** — code-splitting as Suspense's original use: a lazy component suspends until its chunk loads, making 'the code isn't here yet' and 'the data isn't here yet' the same rendering concept, handled by the same boundaries. What you should *not* do is hand-roll a promise cache for app data — the pitfalls (cache identity across renders, invalidation, SSR serialization) are exactly the query-library feature list again. The architectural summary: **Suspense is the presentation half of async; a cache/loader is the data half** — the contract is the interface between them, and the boundaries in your JSX are the design document for how your product loads."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Boundary placement is product design — make it a deliberate pass.** Defaults gone wrong: one giant boundary (the whole page blocks on the slowest widget — your p95 time-to-content is your worst query); a boundary per component (spinner confetti, layout thrash as twelve regions pop independently); no boundary (any suspension escapes to the router/root fallback — the whole app blinks). The working method: sketch the page's *reveal story* — what must appear together (one boundary), what may lag independently (own boundary), what should never flash a skeleton after first load (transitions for its updates) — then place boundaries to encode exactly that story. Review it like copy: 'header+nav reveal instantly (no data), content reveals as a unit, sidebar recs trail' is a legible product decision; twelve ad-hoc spinners is the absence of one."
            },
            {
              "type": "decision",
              "heading": "Choosing loading structure by requirement",
              "rows": [
                ["Everything must appear together (coherent page)", "One boundary wrapping the region — reveals atomically; p95 = slowest query"],
                ["Independent regions may lag (shell + widgets)", "Nested boundaries — each region reveals when its own data resolves"],
                ["Refining already-shown content (search, filter)", "startTransition / useDeferredValue — keep old content, no skeleton flash (clause 5)"],
                ["Content must never blank after first paint", "Place it OUTSIDE any boundary — no ancestor can swap it for a fallback"],
                ["Ordered reveal (top-down, no pop-in jumps)", "Nest boundaries so each waits on the prior (serializes the slower of each pair)"],
                ["Code not yet downloaded (route split)", "React.lazy inside a boundary — 'code not here' unifies with 'data not here'"]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Predict the screen over time: <Suspense fallback={<A/>}> wraps <Fast/> (resolves 100ms) and <Suspense fallback={<B/>}> wrapping <Slow/> (resolves 900ms), plus <Static/> (no data). At t=0 all mount. Give the frames at t≈0, t≈100, t≈900, and justify each from the contract's clauses.",
                  "solution": "t≈0: outer fallback <A/> alone — Fast suspends; the outer boundary replaces its ENTIRE subtree (clause 2), including Static (ready but hidden — siblings hide with the boundary) and the inner boundary (not yet relevant: the outer catch governs). t≈100: Fast resolves; outer re-renders — Fast and Static now complete; Slow still suspends but is caught by the INNER boundary (clause 4): frame shows Fast + Static + <B/> in Slow's slot. Reveal of Fast and Static was atomic (clause 3, per-boundary). t≈900: Slow resolves; inner boundary swaps <B/> → Slow. Final: all content. The design encoded: 'Fast and Static reveal together; Slow may trail behind its own placeholder' — and if Static appearing at t≈100 rather than t≈0 surprises you, that's clause 2 doing exactly what boundary granularity asked: move Static outside the outer boundary to pin it at t≈0.",
                  "hint": "At each instant: which suspensions are pending, and which is the NEAREST boundary above each?"
                },
                {
                  "prompt": "A search page in suspense mode: typing a new query makes the results boundary flash its skeleton on every keystroke, though results were already on screen. Explain from contract clause 5 and fix it two ways (dispatch-side and consumption-side), noting what the user sees in each.",
                  "solution": "Mechanism: the query update is dispatched urgently; the re-render suspends the ALREADY-REVEALED boundary (new key, pending promise), and outside a transition, a re-suspended boundary retreats to its fallback — skeleton flash per keystroke. Dispatch-side fix: startTransition(() => setQuery(text)) (input echo stays urgent, results update is a transition): clause 5 keeps the OLD results visible until new ones are ready; pair with isPending dimming — user sees stable, slightly-dimmed stale results that swap atomically. Consumption-side fix: const deferredQuery = useDeferredValue(query) feeding the suspense query: same effect from the receiving side (old value shown while the background pass with the new value suspends and completes) — used when you don't own the dispatch site. Either restores the correct product behavior: skeletons for FIRST load, stale-content-while-updating for refinements — the initial/subsequent asymmetry the contract encodes.",
                  "hint": "Which updates may retreat a revealed boundary to its fallback, and which scheduling wrapper suppresses that?"
                },
                {
                  "prompt": "Why does const data = use(fetch(url).then(r => r.json())) inside a component body suspend forever, while const data = use(cache.get(url)) works? Ground the answer in the retry semantics, then state the general stability requirement.",
                  "solution": "Retry semantics: on suspension, React re-renders the component from scratch when the recorded promise resolves. The inline version executes fetch(url) AGAIN on the retry render — a brand-new pending promise; use() suspends on IT; its resolution triggers another retry minting another fresh promise: an infinite suspend-retry loop (plus a request storm), because the retry can never observe a resolved value. The cache version returns the SAME promise object across renders for the same key: the first render suspends on it; the retry render calls cache.get(url) and receives the identical, now-resolved promise; use() unwraps it synchronously — render completes. General requirement: the thenable passed to use() must be REFERENTIALLY STABLE across the suspend-retry cycle for the same logical request — supplied by a cache keyed on inputs, a route loader (stable per navigation), a Server Component (resolved server-side), or a memoized promise. Creating promises during render is the async version of Unit 6's inline-object dep churn: fresh identity defeats the machinery comparing identities.",
                  "hint": "What re-runs on the retry, and what must the retry FIND for the unwrap to succeed?"
                },
                {
                  "prompt": "Design the boundary structure for an email client: folder sidebar (instant, local data), message list for the selected folder (fast query), message body pane (per-message query, can be slow), and a compose overlay (no data). Requirements: switching folders must not blank the list; switching messages must not blank the whole right side; first load may show skeletons; compose must never be affected by any loading. Deliver the JSX skeleton with transitions annotated, and justify each boundary against a requirement.",
                  "solution": "<Layout> <Sidebar/> {/* no boundary: local data, renders instantly */} <Suspense fallback={<ListSkeleton/>}> <MessageList folder={folder}/> </Suspense> <Suspense fallback={<BodySkeleton/>}> <MessageBody id={selectedId}/> </Suspense> {composing && <ComposeOverlay/>} {/* outside all boundaries */} </Layout>. Transitions: folder switches → startTransition(() => setFolder(f)) — the list boundary is already revealed, so the old list stays (dimmed) instead of blanking (requirement 1, clause 5); message switches → startTransition(() => setSelectedId(id)) — old body stays while the new loads (requirement 2), and because list and body are SEPARATE boundaries, a slow body never hides the list. First load: both boundaries show their skeletons independently (requirement 3) — the list typically reveals first; if designers want list-then-body ordering guaranteed, nest the body boundary inside content revealed after the list. Compose sits outside every boundary: no ancestor boundary can ever swap it for a fallback (requirement 4) — placement IS the guarantee; had it been inside the body's boundary, a message switch without a transition would hide a half-written draft (state preserved but invisible — still a terrible experience). The exercise's essence: each requirement compiled to a placement or a transition — none to component-internal loading code.",
                  "hint": "One boundary per independently-revealing region; transitions for every already-revealed region's updates; things that must never blank go OUTSIDE boundaries."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l2-i1",
              "front": "What does a component do under Suspense when its data isn't ready?",
              "back": "It suspends — reads an unresolved thenable via use() — abandoning its render; the nearest boundary shows its fallback for the ENTIRE subtree until every suspension inside resolves, then reveals atomically."
            },
            {
              "id": "u9l2-i2",
              "front": "What do nested Suspense boundaries control?",
              "back": "Reveal granularity: each boundary is an independently-revealing region (inner catches its own suspensions while outer content shows). Boundary placement IS the page's loading design."
            },
            {
              "id": "u9l2-i3",
              "front": "The transition × Suspense rule?",
              "back": "A transition update that re-suspends an already-revealed boundary does NOT retreat to the fallback — old content stays (with isPending) until new content is ready. Fallbacks are for initial loads; transitions prevent skeleton-flash on updates."
            },
            {
              "id": "u9l2-i4",
              "front": "Why must use() receive a stable promise, and who provides it?",
              "back": "Retry re-runs the component and must find the SAME now-resolved promise — an inline fetch mints a fresh pending one and suspends forever. Stability comes from caches (query libraries), route loaders, or Server Components."
            },
            {
              "id": "u9l2-i5",
              "front": "What happens to state inside a suspended boundary?",
              "back": "The subtree is hidden, not unmounted — fibers and state survive (a form keeps its draft) and return on reveal. Plan for it: things that must never vanish belong outside boundaries."
            },
            {
              "id": "u9l2-i6",
              "front": "Suspense's division of labor with the data layer?",
              "back": "Suspense is the presentation half (rendering unreadiness, coordinating reveals); caches/loaders/RSC are the data half (fetching, dedup, stability, invalidation). The thenable contract is the interface."
            }
          ]
        },
        {
          "id": "u9l3",
          "title": "SSR and the Hydration Invariant",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Why render on a server at all",
              "body": "A client-rendered app ships HTML that says, in effect, `<div id=\"root\"></div>` — the user downloads it, then the JS bundle, then executes it, then fetches data, and only *then* sees content: three network round trips and a JS parse stand between navigation and first paint, and crawlers/link-unfurlers that don't execute JS see nothing at all. **Server-side rendering** runs your components on the server at request time — the same pure functions, fed with data the server already has — and streams real HTML: content is visible after *one* round trip, before any JavaScript arrives. The purity contract is what makes this mechanically trivial (Unit 1 clause: same inputs, same tree, on any machine — a component that honors it doesn't know it's on a server), and the server environment is what makes it *restrictive*: no window, no DOM, no effects run (there is no 'after commit' — the output is a string), no layout, one render pass per request. But HTML alone is a painting: the buttons don't work. The second act is **hydration** — the client downloads the bundle, and instead of rendering from scratch (discarding the server's HTML and rebuilding: wasteful and visibly flashing), React *adopts* the existing DOM: it renders the app in memory, walks the server-produced markup expecting it to match, attaches event listeners to the existing nodes, and builds its fiber bookkeeping around them. The page transitions from painting to application without rebuilding the set. Everything interesting in this lesson is in the word *expecting*: adoption is only sound if the client's initial render describes exactly the tree the server produced — an invariant with precise content and expensive failure modes."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The hydration matching invariant",
              "statement": "Hydration is correct iff the client's *initial* render (same components, the props/state used for SSR) produces an element tree matching the server-rendered markup — same structure, same tags, same text. (1) **Why it must hold**: hydration attaches behavior by *position* — it walks the client element tree and the server DOM in lockstep, binding each element to the existing node it expects; adoption never re-creates matching nodes, which is the entire performance point. (2) **On mismatch**: React cannot know which side is right or how far the divergence extends; it warns and (React 18+) discards the server DOM in the affected region — falling back to client re-render: the user may see content *flash and change* (the server's version replaced by the client's), layout shift, and lost browser state in the rebuilt region; hydration errors in React 18+ can escalate to re-rendering the whole root client-side, forfeiting SSR's benefit precisely on the pages it was deployed to help. (3) **The invariant's practical form**: any render-time read that differs between server and client environments — Date.now(), Math.random(), window.innerWidth, locale-sensitive formatting with different default locales, timezone-dependent dates, feature detection, auth state present only client-side — produces a mismatch by construction (Unit 1's clause 2 violations, now with a second machine to disagree with). The sanctioned pattern for genuinely client-only content: render the SERVER-COMPATIBLE value in the initial render (both sides agree), then update AFTER hydration via an effect (effects don't run on the server, and post-hydration updates are ordinary re-renders — the invariant governs only the initial render).",
              "proof": "(1) Position-wise adoption: the hydration pass pairs the k-th expected element with the k-th DOM node per level (the reconciliation walk of Unit 2, run against real nodes instead of fibers). Binding listeners and fiber stateNode pointers to a node is only meaningful if the node IS what the element describes — matching structure is the precondition for every pointer the pass creates. (2) Given a mismatch at node n, the pass has two irreconcilable descriptions with no provenance to arbitrate (the server's inputs are gone; the client's reads may be the wrong ones); any 'repair' heuristic risks compounding (Unit 2's alignment ambiguity — a missing node is indistinguishable from an inserted one). Discarding and re-rendering the region client-side is the only sound recovery — at the visible cost of replacing content the user is already reading. (3) The listed reads differ across environments by definition (no window on the server; different clock/locale/viewport). A component reading them in render emits different trees on the two machines — mismatch is deterministic, not unlucky. The effect-based pattern is sound because effects are client-only and post-adoption: the initial render satisfies the invariant (both sides render the agreed value), and the subsequent setState is an ordinary update diffed against the adopted tree. ∎"
            },
            {
              "type": "code",
              "heading": "The mismatch gallery — and each one's honest fix",
              "lang": "jsx",
              "code": "// 1) TIME — server renders at T₀, client hydrates at T₀+Δ:\n// ✗ <span>Generated {new Date().toLocaleTimeString()}</span>\n// ✓ Pass the server's timestamp as a prop/serialized data; render THAT\n//   on both sides; tick it forward post-hydration in an effect.\n\n// 2) VIEWPORT — no window on the server:\n// ✗ const cols = window.innerWidth > 900 ? 3 : 1;   // throws on server;\n//                                                    // guessing '3' ⇒ mismatch\n// ✓ CSS media queries (no JS involved — the honest tool), or:\nfunction useIsWide() {\n  return useSyncExternalStore(subscribeToResize,\n    () => window.innerWidth > 900,\n    () => false);                    // ← getServerSnapshot: the agreed\n}                                    //   initial value on BOTH sides;\n                                     //   corrected post-hydration.\n\n// 3) RANDOM/IDS — Math.random() disagrees across machines:\n// ✗ const id = `field-${Math.random()}`;\n// ✓ const id = useId();             // deterministic per tree position —\n//                                    // same on server and client BY\n//                                    // CONSTRUCTION (position-derived)\n\n// 4) CLIENT-ONLY CONTENT (auth widget, theme from localStorage):\n// ✗ {localStorage.getItem('theme') === 'dark' && <DarkBadge/>}\n// ✓ const [mounted, setMounted] = useState(false);\n//   useEffect(() => setMounted(true), []);\n//   {mounted ? <DarkBadge/> : <BadgePlaceholder/>}   // both sides render\n//   // the placeholder initially; the swap is a post-hydration update.\n//   // Cost: the real content paints one frame late — the honest price\n//   // of content the server cannot know.\n\n// 5) THE ESCAPE HATCH — suppressHydrationWarning:\n// <time suppressHydrationWarning>{formatRelative(ts)}</time>\n// Single-node, text-only differences you ACCEPT (relative times).\n// It silences the check, not the divergence — scope it to leaves."
            },
            {
              "type": "text",
              "heading": "Streaming SSR and selective hydration: Suspense crosses the wire",
              "body": "React 18 rebuilt SSR around Lesson 2's boundaries, and the composition is elegant enough to state as a pipeline. **Streaming**: `renderToPipeableStream` doesn't wait for the whole tree — when a server render hits a suspended boundary (data still loading server-side), it emits the *fallback* HTML immediately, keeps streaming the rest of the page, and when the data resolves, appends the real content plus a tiny inline script that swaps it into place — the user sees the shell in the first flight of bytes and regions pop in as the server finishes them, all before any React JS has loaded. **Selective hydration**: on the client, hydration also stops being monolithic — each Suspense boundary hydrates independently as its code and content arrive, so one slow region doesn't block interactivity everywhere else; and — the scheduler-integrated part — if the user *clicks inside* a not-yet-hydrated boundary, React records the event, **prioritizes hydrating that boundary** (urgent lane, Unit 8), and replays the event once listeners attach: interaction order drives hydration order, so the thing the user touches becomes interactive first. Read the whole pipeline as one sentence: *Suspense boundaries are the unit of streaming (server), of reveal (Lesson 2), and of hydration (client)* — one placement decision in your JSX now encodes your loading design across the network, the render, and the interactivity timeline. This is also the honest answer to 'is SSR worth the complexity?': with streaming + selective hydration, the old all-or-nothing costs (slowest query blocks all HTML; whole-page hydration blocks all interaction) are gone, and the remaining discipline is exactly the invariant above plus boundary placement you already needed for loading design."
            },
            {
              "type": "example",
              "heading": "Worked example: diagnosing a hydration incident end to end",
              "body": "Symptoms, from production monitoring: hydration-mismatch warnings spiking on the pricing page; session replays show the page *flashing* — prices render, blink, re-render — and a layout shift signature; the flash appears only for logged-in users in non-US locales. Work the invariant. Candidate reads in render: the page formats prices with `Intl.NumberFormat(navigator.language)` — the *server* has no navigator and was falling back to 'en-US', while the client formats with the user's locale: text-content mismatch on every price node (invariant clause 3, locale row). Second find: a `{user && <AccountRibbon/>}` where the server (rendering anonymously cached pages) has no user, but the client reads a token from localStorage during render — structural mismatch for logged-in users only. Both match the incident's fingerprint (locale-dependent, auth-dependent). Fixes, respectively: **make the input agree** — the locale is *request data*, not ambient: read Accept-Language on the server, pass the chosen locale through (serialized props/context) so both sides format with the same value (the general cure: convert environment reads into data that flows through the render); **defer the client-only truth** — render the ribbon's placeholder on both sides and swap post-hydration (mounted-state pattern), or move auth into the server's request context if the architecture allows (cookie, not localStorage — making it request data too). Then verify the fix the honest way: the warning count, the replay flash, and the CLS metric all drop together. The meta-lesson: hydration incidents are *diagnosed by asking which render-time read could disagree between the two machines* — the invariant turns a flaky-looking bug class into a checklist."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Hydration mismatches are correctness bugs wearing a cosmetic costume.** The flash is what you see; what you don't see: the discarded region's browser state (focus, selection, half-typed input from fast users), event listeners attached to nodes that were then replaced, analytics double-fires from re-mounted components, and — in the escalation case — the entire SSR investment silently refunded as client re-renders. Treat the dev-mode mismatch warning with the same severity as the exhaustive-deps warning (Unit 6): it is a proof that your render reads something the two environments disagree on, and every one of those reads is ALSO a purity violation (Unit 1) that concurrent features will find later even without a server. Fixing the mismatch usually fixes a latent client-only bug too."
            },
            {
              "type": "decision",
              "heading": "Mismatch source → honest fix",
              "rows": [
                ["Date.now() / new Date() in render", "Serialize the server's timestamp as data; render it on both sides; tick forward in an effect"],
                ["window / innerWidth / matchMedia read in render", "CSS media queries, or useSyncExternalStore with a getServerSnapshot both sides agree on"],
                ["Math.random() for keys/ids", "useId() — deterministic per tree position, identical on server and client"],
                ["Locale / timezone formatting (navigator.language)", "Make locale request DATA (Accept-Language / cookie) and format with the same value both sides"],
                ["Auth / localStorage / theme read in render", "Render the agreed placeholder initially; swap post-hydration via effect-set state"],
                ["Accepted leaf-only text difference (relative time)", "suppressHydrationWarning on that single node — silences the check, not the divergence"]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For each snippet, predict server output, client initial render, and the hydration outcome — then give the fix: (a) <p>Cart: {items.length} items</p> with items from serialized loader data; (b) <p>{new Intl.DateTimeFormat().format(deadline)}</p> where server TZ=UTC and the user is in UTC+9; (c) <input defaultValue={crypto.randomUUID()}/>; (d) {typeof window !== 'undefined' && <Map/>}.",
                  "solution": "(a) Matches: both sides render from the same serialized data — the invariant holds because the INPUT is shared; no action needed (this is the pattern to emulate). (b) Mismatch: same instant formatted in different timezones can differ by a day; text-content mismatch on the node → warning + region re-render (a date that visibly flips). Fix: decide the semantic — if 'deadline in the user's timezone' is the product, the timezone is request/client data: pass an explicit timeZone into the format on both sides (from a cookie/header), or render the UTC form and refine post-hydration. (c) Mismatch by construction: two machines, two UUIDs → attribute mismatch. Fix: useId() for hydration-stable identifiers, or generate the value server-side and serialize it if it must be a UUID. (d) Structural mismatch for every user: server renders nothing (window undefined), client renders <Map/> in the initial pass → hydration finds an unexpected element. Fix: the mounted-state pattern (both sides render a placeholder initially; effect swaps in <Map/>), or lazy-load the map inside a Suspense boundary designed for client-only content. The typeof-window guard LOOKS like SSR hygiene but is precisely an invariant violation when it changes the INITIAL render's structure.",
                  "hint": "For each: what exactly does each machine's initial render emit? 'Guards' that branch on environment ARE the mismatch."
                },
                {
                  "prompt": "Explain why the mounted-state pattern (useState(false) + useEffect(() => setMounted(true), []) + conditional swap) is invariant-sound, exactly what it costs, and why replacing the effect with 'if (typeof window !== \"undefined\") return <Real/>' is not equivalent even though both 'detect the client'.",
                  "solution": "Soundness: the INITIAL render on both machines takes the mounted=false branch (server: state is false, effects never run; client: state initializes false, effects haven't run during the initial render) — identical trees, invariant satisfied; hydration adopts cleanly. The effect then fires post-hydration, and setMounted(true) is an ordinary update diffed against the adopted tree — outside the invariant's jurisdiction. Cost: the real content renders one commit late (a placeholder frame — typically imperceptible, but a CLS risk if placeholder and content differ in size: size the placeholder honestly), and the swapped-in subtree mounts fresh client-side (no SSR content for it — crawlers see the placeholder). The typeof-window version branches DURING the initial render: the server takes the false branch, the client takes the TRUE branch in its very first pass — different initial trees, which is the mismatch itself. The distinction to internalize: 'am I on the client?' answered during the initial render is a mismatch machine; answered AFTER hydration (via effect-set state) is the sanctioned two-phase reveal. Same question, different phase, opposite correctness.",
                  "hint": "Write out the four renders (server, client-initial, client-post-effect) for each version and compare the first two."
                },
                {
                  "prompt": "Streaming SSR: a page has a fast shell, a <Suspense>-wrapped product grid (server data resolves at 400ms), and a <Suspense>-wrapped reviews panel (resolves at 1200ms). The JS bundle arrives at 800ms. Describe what the user sees and can DO at t≈100ms, 450ms, 800ms, 850ms (user clicks a grid item), and 1250ms — naming the mechanism at each step.",
                  "solution": "t≈100: shell HTML streamed and painted (renderToPipeableStream emits it immediately) with skeleton fallbacks in both boundary slots — visible, not interactive (no JS yet). t≈450: the grid's HTML has streamed in and the inline swap script replaced its skeleton — real products visible (still no React on the client; this is pure streamed HTML). Reviews still skeleton. t≈800: bundle arrives; hydration begins per-boundary (selective hydration) — shell and grid hydrate (their content exists); reviews boundary can't hydrate content it doesn't have and keeps its fallback. t≈850: the user clicks a product. If the grid's boundary has hydrated, the handler runs normally; if the click races hydration, React records the event, PRIORITIZES that boundary's hydration (urgent lane), and replays the click after listeners attach — the user's interaction reorders the hydration schedule toward what they touched. t≈1250: reviews' HTML streams in, swaps into place, and that boundary hydrates — the page is fully interactive. The through-line: the two Suspense boundaries were simultaneously the streaming units, the reveal units, and the hydration units — one JSX placement decision governed the entire timeline.",
                  "hint": "Track three arrivals separately — HTML per boundary, the JS bundle, hydration per boundary — and remember clicks can reorder the last."
                },
                {
                  "prompt": "A team ships SSR and sees Lighthouse improve but INP (interaction latency) worsen on low-end devices: the page is visible early but taps do nothing for ~2s, and some taps are 'eaten'. Diagnose from this lesson's machinery, and propose the three-step remediation in priority order.",
                  "solution": "Diagnosis: classic uncanny-valley SSR — content paints early (HTML streamed) but interactivity waits on bundle download + hydration; on low-end devices, monolithic or heavy hydration occupies the main thread for seconds. 'Eaten' taps indicate regions whose hydration hadn't attached listeners AND that aren't covered by selective-hydration replay (pre-18 style rendering, no boundaries to scope replay, or handlers outside React's replay set). Remediation: (1) Introduce/verify Suspense boundaries around major regions with React 18 streaming + selective hydration — hydration becomes per-region, the main-thread work chunks, and clicks on unhydrated boundaries are recorded, prioritized, and replayed instead of eaten (interaction-driven hydration order). (2) Shrink what must hydrate: code-split below-the-fold and interaction-gated regions (React.lazy inside boundaries) so their JS isn't in the critical bundle at all — and (Lesson 4 preview) move static content to Server Components, which ship zero hydration work. (3) Budget the remaining hydration: profile long tasks during startup; break up any single region whose hydration exceeds ~50ms (the INP threshold's enemy), and defer non-critical effect work out of the hydration path. Measure INP and 'time to first successful interaction' — Lighthouse's paint metrics were never the complaint.",
                  "hint": "Separate 'visible' from 'interactive'; then ask what scopes hydration, what shrinks it, and what replays the taps that land in the gap."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l3-i1",
              "front": "What is hydration, mechanically?",
              "back": "The client renders the app and ADOPTS the server's DOM — walking markup and element tree in lockstep, binding listeners and fibers to existing nodes instead of creating them. Adoption is position-wise, hence the matching requirement."
            },
            {
              "id": "u9l3-i2",
              "front": "State the hydration matching invariant and the cost of violating it.",
              "back": "The client's INITIAL render must produce the same tree the server emitted (structure, tags, text). Mismatch ⇒ warning + discard-and-re-render of the region (flash, layout shift, lost browser state), potentially escalating to full client re-render."
            },
            {
              "id": "u9l3-i3",
              "front": "The five classic mismatch sources?",
              "back": "Time (Date.now), randomness (Math.random — use useId), viewport/window reads (use CSS or getServerSnapshot), locale/timezone formatting (make locale request DATA), and client-only truths like auth/localStorage (defer via mounted-state)."
            },
            {
              "id": "u9l3-i4",
              "front": "The sanctioned pattern for content the server cannot know?",
              "back": "Render an agreed placeholder in the initial render on BOTH sides; swap in the real content post-hydration via effect-set state (effects are client-only, post-adoption). Branching on typeof window in the initial render IS the mismatch."
            },
            {
              "id": "u9l3-i5",
              "front": "What roles do Suspense boundaries play in React 18 SSR?",
              "back": "Unit of streaming (fallback HTML now, content appended when server-ready), unit of reveal, and unit of selective hydration — including click-driven prioritization with event replay. One placement, three timelines."
            },
            {
              "id": "u9l3-i6",
              "front": "Why is a hydration warning never 'just cosmetic'?",
              "back": "It proves a render-time read differs between environments — a purity violation (Unit 1 clause 2) that also breaks under concurrency; plus the visible flash hides discarded browser state and refunded SSR work."
            }
          ]
        },
        {
          "id": "u9l4",
          "title": "Server Components: The Two-Graph Architecture",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The question RSC answers",
              "body": "SSR (Lesson 3) runs your components on the server *once*, to produce faster first paint — but every component still ships its JavaScript to the browser and hydrates, because after that first paint the client owns the whole tree. Look at a real page through that lens: the markdown-rendering of a blog post, the formatting of a data table, the markup of a marketing section — components that will *never* change client-side, whose props never update, which need no state, no effects, no handlers... and whose rendering code (plus its dependencies: the markdown parser, the date library, the syntax highlighter) is nonetheless downloaded, parsed, and hydrated by every visitor. **React Server Components** make the observation structural: some components only ever need to run *where the data is* — and if a component runs only on the server, its code need never ship at all. RSC splits your component tree into two graphs: **Server Components** (the default in RSC-enabled frameworks) execute exclusively on the server — they may read databases and filesystems directly, use server secrets, and `await` data in their bodies; their *output* (rendered element trees, not code) is serialized and sent down. **Client Components** — files opting in with `'use client'` — are ordinary Units-1-through-8 React: shipped, hydrated, stateful, interactive. The architecture's wins are exactly the two standing costs of client React: **bundle** (server component code, and its dependency subtree, contributes zero bytes) and **data access** (fetching happens in the component that needs it, server-side, where the database is milliseconds away — Lesson 1's waterfalls collapse even when sequential). The price is a new discipline: a *serialization boundary* between the graphs, with rules this lesson makes precise."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The two-graph model and the serialization boundary",
              "statement": "(1) **Server graph**: components without 'use client' (in an RSC framework) render on the server — per request or at build time. They may: perform async data access directly in the body (async components: await db.query(...)); hold no state (no useState/useReducer — there is no instance to own it), run no effects (no client lifetime to synchronize with), and attach no event handlers (no listeners in serialized output). (2) **Client graph**: a 'use client' directive marks a module as a client entry point; it and its (non-server) import graph ship to the browser and behave as ordinary React. (3) **Composition rule**: server components may render client components (the serialized output references them by module id, to be hydrated); client components may NOT import server components — but they MAY receive server-rendered content as props/children (the 'slot' pattern): the server renders both graphs' skeleton, interleaving serialized server output into client components' children. (4) **The boundary constraint**: every prop crossing server → client must be **serializable** — JSON-representable values, plus framework-supported extensions (promises, server-action references); functions, class instances, Dates-as-Dates, and closures cannot cross. (5) **Refresh semantics**: server components re-render by *re-requesting* (navigation, router refresh, action revalidation) — the server re-runs them and the client *reconciles* the new serialized tree against the current one (Unit 2's diff, applied to a payload from the wire), preserving client component STATE where positions/types match — a server refresh does not blow away client-side state."
            },
            {
              "type": "code",
              "heading": "The boundary in code — what crosses, what cannot, and the slot pattern",
              "lang": "jsx",
              "code": "// ---------- server graph (no directive = server, in RSC frameworks) --\nasync function PostPage({ slug }) {          // async component: legal here\n  const post = await db.posts.find(slug);    // direct data access — no\n  const related = await recs.for(post.id);   // API layer, no client fetch,\n                                             // ~1ms to the DB not ~300ms\n  return (\n    <article>\n      <h1>{post.title}</h1>\n      <Markdown source={post.body} />         {/* heavy dep: NEVER ships */}\n      <LikeButton postId={post.id}            {/* client island */}\n                  initialCount={post.likes} /> {/* serializable props ✓ */}\n      <CommentSection postId={post.id}>        {/* client component… */}\n        <RelatedList items={related} />        {/* …receiving SERVER-rendered\n                                                  children: the slot pattern —\n                                                  legal because the server\n                                                  rendered this subtree and\n                                                  passed its OUTPUT through */}\n      </CommentSection>\n    </article>\n  );\n}\n\n// ---------- client graph ------------------------------------------\n'use client';\nfunction LikeButton({ postId, initialCount }) {\n  const [count, setCount] = useState(initialCount);   // state: client-only\n  return <button onClick={() => {                     // handlers: client-only\n    setCount(c => c + 1); api.like(postId);\n  }}>♥ {count}</button>;\n}\n\n// WHAT CANNOT CROSS THE BOUNDARY:\n// <LikeButton onLike={() => audit(post)} />   ✗ function prop — closures\n//   don't serialize. Interactivity must LIVE in the client graph (or be\n//   a server action reference — the sanctioned RPC).\n// <Detail user={new UserModel(row)} />        ✗ class instance — send\n//   plain data; reconstruct behavior client-side if needed.\n\n// WHY CLIENT CAN'T IMPORT SERVER:\n// importing = 'my bundle contains it' — but server code (db access,\n// secrets, node APIs) must never enter the bundle. The slot pattern is\n// the safe inverse: server OUTPUT flows down as children; server CODE\n// stays on the server. Composition by value, not by reference."
            },
            {
              "type": "text",
              "heading": "Thinking in islands: where to draw the client boundary",
              "body": "The design skill RSC demands is boundary placement — the same skill as Suspense boundaries (Lesson 2) and memo boundaries (Unit 7), now with bundle bytes and data access as the stakes. The heuristic: **push 'use client' to the leaves** — make the page's skeleton, content, and data assembly server components, and mark as client only the interactive *islands*: buttons, forms, dropdowns, anything with useState/effects/handlers. Each 'use client' is a *bundle frontier*: everything it imports (that isn't already server-only) ships — so a 'use client' on a page-level component drags the entire page's dependency tree into the bundle, refunding RSC's principal benefit with one line. Concretely wrong: marking `PostPage` client because one Like button needs state (the markdown parser now ships). Concretely right: PostPage stays server; LikeButton is a five-line client island receiving serializable props. The **slot pattern** handles the middle case — a client component that *wraps* rich content (a collapsible section, a carousel, a tabbed container): the interactivity (open/closed state) is client; the content inside is server-rendered and passed as children — the client component manipulates *where and whether* server output shows without owning its code. And the composition consequence worth memorizing: **the tree can alternate** — server → client → (via children) server → client — because children-passing moves rendered *values* through the boundary, not modules; only imports are one-directional. When you find yourself unable to alternate (a deep client component 'needs' fresh server data), the architecture is telling you to lift the data to the nearest server ancestor and thread it down — or that this data is genuinely dynamic and belongs to the client's cache layer (Lesson 1) instead."
            },
            {
              "type": "example",
              "heading": "Worked example: refactoring a page across the boundary",
              "body": "Before (client-rendered SPA page): `Dashboard.jsx` — fetches /api/summary and /api/activity in effects (a waterfall: summary's response decides which activity endpoint), renders KPI cards, a heavy chart (chart lib: 90kb), an activity feed with relative timestamps ('3m ago'), and a filter dropdown holding selection state. Total shipped: page + chart lib + date lib + fetching machinery; content at ~3 round trips. The RSC refactor, decision by decision: **Dashboard → server**: the two fetches become awaits in the body — and the waterfall stays *sequential but collapses* (server-to-service latency ~2ms: 3 round trips × 2ms, not × 300ms — Lesson 1's arithmetic, relocated); the KPI cards render server-side from the data (zero bundle). **Chart**: the chart *library* must execute where the canvas is — client island — but its *data* arrives as a serializable prop from the server parent: `'use client' Chart({series})`; the 90kb ships (unavoidable for a canvas-drawing dependency — RSC does not eliminate interactive code, only non-interactive code). **Feed timestamps**: '3m ago' is client-relative time — rendering it server-side violates Lesson 3's invariant on hydration... except RSC output for server components doesn't hydrate (no client code to disagree!) — but it also never *updates*: a static '3m ago' rots on screen. Honest split: server renders the absolute time; a tiny client `<RelativeTime ts={…}/>` island formats and ticks it. **Filter dropdown → client island** (selection state), but *what it filters* re-renders server-side via the refresh semantics: selecting a filter updates the URL (router state), the server re-renders the feed for the new params, and the client reconciles — selection state in the dropdown island *survives* (clause 5: state preserved where positions match). Net: bundle = chart + two tiny islands; data = collapsed waterfall; interactivity = untouched. The refactor is entirely mechanical once each piece is interrogated with: *does this need a client lifetime?*"
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**RSC didn't replace client React — it re-scoped it.** Everything in Units 1–8 — state, effects, reconciliation, memoization, concurrency — is alive and governing inside every client island; RSC's contribution is that components which never needed those capabilities now don't pay for them (in bytes or in hydration). The architecture is also older than it looks: 'templates render on the server, behavior attaches on the client' is how the web worked pre-SPA — RSC's novelty is doing it in ONE component model, with typed composition across the boundary, per-component granularity, and state-preserving refreshes instead of full-page reloads. Judge it as an engineering trade, and note its costs honestly: it requires a framework/bundler contract (module-id serialization, dual module graphs), the mental model of two execution environments in one codebase, and server infrastructure — a purely-static or purely-local app may rationally decline."
            },
            {
              "type": "decision",
              "heading": "Server, client, or split — the deciding question is 'does it need a client lifetime?'",
              "rows": [
                ["No state, effects, or handlers (markdown, tables, layout)", "Server component — renders where the data is; its code and deps ship zero bytes"],
                ["Async data access in the body (db/filesystem/secrets)", "Server component — await directly; the waterfall collapses to server-local latency"],
                ["State / effects / event handlers (buttons, inputs, dropdowns)", "Client component ('use client') — an interactive island at the leaf"],
                ["Interactive wrapper around rich content (tabs, collapse, carousel)", "Split: client island for the interaction, server-rendered content passed as children (slot pattern)"],
                ["Live subscription (WebSocket presence, ticker)", "Client island — a server component renders once per request; it can't hold a connection open"],
                ["Passing behavior across the boundary (onClick, class instance)", "Not allowed — closures/instances don't serialize; move interactivity into the client graph or use a server action"]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Sort each component into server, client, or 'split it', with the deciding question answered: (a) a syntax-highlighted code block (highlighter dep: 120kb); (b) a color-picker input; (c) a data table with server data, sortable by clicking headers; (d) a cookie-consent banner (reads/writes localStorage, shows until dismissed); (e) a nav bar highlighting the current route.",
                  "solution": "(a) Server — no client lifetime needed (no state/effects/handlers); the 120kb highlighter never ships: RSC's poster child. (b) Client — continuous interactive state; it IS an island by nature; keep its props serializable. (c) Split by the refresh semantics: table markup + data = server; sorting can be EITHER a client island re-ordering already-delivered rows (fast, but only sorts the loaded page) OR URL-state driving a server re-render (sorts the full dataset, survives as a shareable link) — the deciding question is 'sort the page or sort the data?', a product decision expressed as a boundary decision. Headers that dispatch it are a small client island either way. (d) Client island — localStorage is a client-only truth (Lesson 3's invariant!) and dismissal is state; server renders nothing for it (or a placeholder slot). (e) Split: the nav's structure/links = server; the 'current route' highlight needs router awareness — most frameworks provide a tiny client hook (usePathname) — so the highlight wrapper is a thin client island around server-rendered link content (slot pattern).",
                  "hint": "Per component: does it need state/effects/handlers (a client LIFETIME)? If only part does, that part is the island."
                },
                {
                  "prompt": "A teammate writes: 'use client' at the top of ProductPage.jsx 'because the Add-to-Cart button needs onClick'. The page imports the markdown renderer, an image-gallery lib, and a price-formatting util. Quantify what that one line did, explain the frontier rule, and produce the corrected structure.",
                  "solution": "The line made ProductPage a client entry point: it and its ENTIRE import graph (markdown renderer, gallery lib, formatting util, all transitive deps) join the bundle and hydrate — likely hundreds of kb shipped and executed so that one button can own one handler; simultaneously, any direct data access in the page had to become client fetching (round trips instead of server awaits). The frontier rule: 'use client' marks where the SERVER graph ends — everything reachable by import from there ships; boundaries therefore belong at the SMALLEST subtree that needs a client lifetime. Corrected: ProductPage (no directive) stays server — awaits product data, renders markdown/gallery/prices server-side; AddToCartButton.jsx gets 'use client' and receives {productId, price} as serializable props; if the gallery needs interaction (zoom, carousel), IT becomes its own island receiving image URLs — each island minimal, the page's heavy rendering deps never shipping. The audit habit: every 'use client', ask 'what fraction of the imports below this line actually need a client lifetime?' — if the answer isn't ~all, the directive is too high.",
                  "hint": "'use client' is a frontier, not an annotation on the component that needed it — what falls inside the frontier here?"
                },
                {
                  "prompt": "Explain why client components cannot import server components, but CAN receive them as children — and why this asymmetry is a security property, not just a bundling rule. Construct the exploit that would exist if the import were allowed.",
                  "solution": "Import semantics: importing a module means 'include its code in my graph' — for a client component, 'my graph' IS the browser bundle. A server component's code may contain db.query calls, filesystem reads, and SECRETS (connection strings, API keys via env). If client code could import it, the bundler would ship server code to every visitor's browser: the exploit is trivial — view-source/bundle-inspect to read credentials and query logic, and potentially execute data-access paths against exposed endpoints. Children-passing is safe because it moves the server component's OUTPUT — an already-rendered, serialized element tree containing only markup and data deliberately included — across the boundary: values, not code; what the server chose to render, not what it knows. The asymmetry is thus an information-flow control: code flows only server→bundle when explicitly marked ('use client' is consent to ship), data flows only through the serializable-prop channel (reviewable, typed), and secrets have no path to the client at all unless a developer serializes them into props — which is why frameworks add taint APIs (experimental_taintObjectReference) to make even THAT mistake loud. The rule reads as a bundler constraint; it functions as the architecture's trust boundary.",
                  "hint": "What does 'import' put WHERE? Then: what's inside a server component's closure that must never reach a browser?"
                },
                {
                  "prompt": "Refresh semantics: a server-rendered task list has client-island rows (each with an expanded/collapsed useState). The user completes a task via a server action; the server re-renders the list (one task now moved to the 'done' section) and the client reconciles. Predict what happens to each row's expanded state — including the moved row — and derive the authoring rule that makes the behavior deterministic.",
                  "solution": "Reconciliation applies Unit 2's rules to the new serialized tree vs the current one: client components' STATE survives where (position/key, type) match. Unmoved rows: same keys, same positions → their island instances are preserved — expanded states survive the refresh (this is RSC's headline trick: server re-render without client-state loss). The moved row: it left the 'active' list and appeared in 'done' — a DIFFERENT parent. By Unit 2's addressing rule, matching is per sibling list: the old instance (in active) is unmounted — its expanded state DIES — and a fresh instance mounts in done (collapsed, the default). Whether that's correct is a product question (arguably a completed task collapsing is fine; a form draft dying would not be). Authoring rules that follow: (1) key rows by entity id everywhere so WITHIN-list reorders preserve state (id-keyed matching); (2) know that CROSS-list moves reset islands — if state must survive a move, lift it out of the island into client-owned storage keyed by entity (a client store/map, Unit 4's lifting, with the island reading drafts[taskId]) or reflect it in server data; (3) design island state as 'ephemeral by default, lifted when precious' — the refresh model makes that line explicit and testable: simulate a revalidation and see what survives.",
                  "hint": "Apply Unit 2's identity rule to the reconciled payload: what happens at same-position-same-type, and what at a cross-parent move?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u9l4-i1",
              "front": "The two graphs of RSC, and what each may do?",
              "back": "Server components (default): run only server-side — await data directly, use secrets, ship zero bytes; no state/effects/handlers. Client components ('use client'): ordinary React — shipped, hydrated, stateful, interactive."
            },
            {
              "id": "u9l4-i2",
              "front": "The composition rule across the boundary?",
              "back": "Server may render client components; client may NOT import server components — but may receive server-rendered output as children/props (the slot pattern). Code crosses only by consent ('use client'); output crosses as serialized values."
            },
            {
              "id": "u9l4-i3",
              "front": "What must be true of props crossing server → client?",
              "back": "Serializable: plain data (plus framework-blessed extras like promises and server-action refs) — no functions, closures, or class instances. Interactivity must live in the client graph, not cross into it."
            },
            {
              "id": "u9l4-i4",
              "front": "Why is 'use client' a frontier, and where should it sit?",
              "back": "Everything importable from it joins the bundle — one directive too high ships the page's whole dependency tree. Push it to the leaves: server skeleton, minimal interactive islands, slot-wrapped server content."
            },
            {
              "id": "u9l4-i5",
              "front": "RSC refresh semantics in one line?",
              "back": "Server components update by re-requesting; the client reconciles the new serialized tree against the current one — client island STATE survives where key/position/type match (and dies on cross-parent moves, per Unit 2)."
            },
            {
              "id": "u9l4-i6",
              "front": "What two costs does RSC eliminate, and what does it not touch?",
              "back": "Eliminates bundle bytes and hydration for non-interactive components, and collapses data waterfalls to server-local latency. Untouched: interactive code still ships and everything in Units 1–8 governs inside every island."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u9-check",
        "questions": [
          {
            "id": "u9q1",
            "type": "mcq",
            "prompt": "A search component fetches in an effect keyed on [query] with no cleanup. A user types 'a' then quickly 'ab'. The 'a' request resolves AFTER the 'ab' request. What does the UI show, and what fixes it?",
            "options": [
              "Results for 'ab' — React discards state updates from earlier renders automatically",
              "Results for 'a' under a search box showing 'ab', permanently until the next change — fixed by an episode-revocation cleanup (active flag or AbortController)",
              "An error — React detects concurrent setState calls from overlapping promises",
              "Results flicker between 'a' and 'ab' until the network settles"
            ],
            "answer": 1,
            "explanation": "Last-response-wins: the stale 'a' handler runs last and overwrites correct results; nothing corrects it (both promises settled) — the race proposition's clause (1). React has no idea which response is 'current'; the protocol makes it explicit: each episode's cleanup revokes its write permission, so only the latest episode may commit (last-episode-wins). No error exists to throw, and there is no flicker — just one wrong final write.",
            "points": 1
          },
          {
            "id": "u9q2",
            "type": "short",
            "prompt": "In React 18 streaming SSR, one JSX construct is simultaneously the unit of streaming, the unit of reveal, and the unit of selective hydration. Name it.",
            "accept": [
              "Suspense boundary",
              "Suspense",
              "<Suspense>",
              "the Suspense boundary",
              "suspense boundaries"
            ],
            "explanation": "The Suspense boundary: the server streams its fallback HTML immediately and appends content when ready; the client reveals its subtree atomically; and hydration proceeds per-boundary — including click-driven prioritization with event replay. One placement decision governs the network, rendering, and interactivity timelines.",
            "points": 1
          },
          {
            "id": "u9q3",
            "type": "multi",
            "prompt": "Which of these violate the hydration matching invariant (client initial render must equal server markup)? (Select all that apply.)",
            "options": [
              "Rendering {typeof window !== 'undefined' && <ClientWidget/>} directly in the initial render",
              "const [mounted, setMounted] = useState(false) + useEffect(() => setMounted(true), []) + {mounted && <ClientWidget/>}",
              "Formatting a timestamp with the machine's default timezone on both server and client",
              "Using useId() for form-field ids",
              "Rendering Math.random() in a component body"
            ],
            "answer": [
              0,
              2,
              4
            ],
            "explanation": "(a) branches on environment DURING the initial render — server and client emit different trees: the mismatch itself. (c) same instant, different default timezones ⇒ different text. (e) two machines, two random values. (b) is the sanctioned pattern: both initial renders take the false branch (effects never run server-side and haven't run yet client-side); the swap is a post-hydration update. (d) useId is deterministic per tree position — designed to agree across server and client.",
            "points": 2
          },
          {
            "id": "u9q4",
            "type": "proof",
            "prompt": "Prove the fetch-race proposition end to end: (1) construct the interleaving under which fetch-then-setState with no cleanup commits stale data permanently; (2) prove the cleanup-revocation protocol restores 'only the latest episode writes'; (3) state precisely why debouncing narrows but cannot close the window.",
            "rubric": [
              "(1) Exhibits the full timeline: episode A in flight, deps change starts episode B, resolution order B-then-A, A's handler overwrites B's committed data; notes the system is then at rest in the wrong state (both promises settled, no correcting event)",
              "(2) Uses the effect lifecycle's cleanup-before-setup ordering: changing deps revokes A's flag before B starts; inductively exactly one episode holds a live flag at any time, so writes are restricted to the current episode (last-episode-wins)",
              "(3) Handles the abort variant: abort() rejects with AbortError, which must be routed to silence, not the failure state",
              "Debounce analysis: debouncing reduces episode overlap frequency but two issued requests can still resolve out of order (network reordering is independent of issue spacing) — correctness requires revocation; debounce is a volume/UX optimization"
            ],
            "solution": "(1) Let the effect be fetch(q).then(r => setData(r)) with deps [q]. Episode A: q='a', request A departs. User types: q='ab'; deps change — A has no cleanup, so nothing is revoked — episode B starts, request B departs. Network resolves B first: setData(r_B); commit shows correct results for 'ab'. Then A resolves: its handler — a live closure with no guard — runs setData(r_A), committing results-for-'a' under a box showing 'ab'. Both promises are now settled; no pending event can correct the state: the wrong frame is stable until the user changes q again. The construction required only overlap plus adverse ordering — both routine under real latency. (2) Add per-episode revocation: let active = true; …then(r => { if (active) setData(r) }); return () => { active = false }. The effect lifecycle (Unit 6) guarantees cleanup-before-setup on deps change: when q moves a→ab, A's cleanup sets active_A = false BEFORE B's setup runs. Invariant, by induction over episodes: after any prefix of lifecycle events, exactly the latest episode's flag is true (each new episode's setup is preceded by its predecessor's cleanup; unmount cleans the last). Therefore any resolving handler writes iff its episode is still current: stale responses are dropped at the guard. With AbortController, cleanup additionally cancels the request; the promise rejects with AbortError, which the catch must treat as silence (a revoked episode is not a failure) — same invariant, plus reclaimed resources. (3) Debouncing delays issue until input pauses, reducing how often episodes overlap — but whenever two requests HAVE been issued (pause, type, pause), their completion order remains unconstrained: a 300ms-debounced pair can still resolve inverted (first request slow, second fast). Ordering is a network property independent of issue spacing, so the stale-write path survives debouncing; only revocation (or version-tagging, its cache-layer equivalent) eliminates it. Debounce for request volume and UX; the protocol for correctness. ∎",
            "explanation": "The complete anatomy of the most-shipped async bug in React: the interleaving, the lifecycle-backed invariant that kills it, the abort refinement, and the debounce misconception. An engineer who can produce this proof can also review for it — the vulnerable shape (async write-back, no revocation) is visually identifiable in any PR.",
            "points": 3
          },
          {
            "id": "u9q5",
            "type": "open",
            "prompt": "Architecture review. A team is migrating a client-rendered e-commerce product page to an RSC framework. Current page: fetches product + reviews + recommendations in client effects (waterfall); renders markdown description (parser: 70kb); has an image gallery with zoom (interactive), an Add-to-Cart button (state + POST), review sorting (client state), and '2 people are viewing this' live presence (WebSocket). They plan to put 'use client' on the page root 'to keep it simple' and keep all fetching in effects. Deliver: the correct graph partition (server/client/split, per region, with the deciding question), the data-access redesign, the two places Lessons 1–3's machinery still applies unchanged, and the quantified argument against their plan.",
            "rubric": [
              "Partition with reasons: page skeleton/description/product data = server (no client lifetime; 70kb parser never ships); gallery, Add-to-Cart, sort control, presence = client islands (state/effects/handlers); reviews list = server-rendered content with a client sort island (or URL-driven server sort — names the product tradeoff)",
              "Data redesign: product/reviews/recommendations awaited in server components (waterfall collapses to server-local latency; no client fetch machinery); presence stays a client subscription (genuinely live, WebSocket — uSES/effect per Units 6/8); notes serializable props at each island boundary",
              "Identifies unchanged machinery: the presence socket still needs effect lifecycle + race/cleanup discipline (Units 6/9L1), and Add-to-Cart's POST is handler-shaped with in-flight guarding (Unit 3/6); hydration invariant still governs the islands (Lesson 3)",
              "Quantifies the plan's cost: root 'use client' ships the whole import graph (incl. 70kb parser) and forfeits server data access — refunding both RSC benefits with one line; and keeping fetch-in-effects retains the waterfall + race surface the migration exists to remove; states the frontier rule as the corrective"
            ],
            "solution": "Partition. Page root, product data assembly, markdown description, price block: SERVER — none has state, effects, or handlers (the deciding question: no client lifetime), and the markdown parser is exactly the dependency RSC exists to keep off the wire. Image gallery: CLIENT island (zoom/carousel state), receiving image URLs — serializable. Add-to-Cart: CLIENT island (pending state, POST action; consider a server action for the mutation), props {productId, price}. Review sorting: product decision surfaced by the boundary — client island re-sorting delivered reviews (fast, page-scoped) OR sort-in-URL driving server re-render (full-dataset, shareable, state-preserving via refresh semantics); either way the LIST content renders server-side, the control is a thin island. Presence ('2 viewing'): CLIENT island by nature — a live WebSocket subscription (server components render once per request; they cannot hold a connection open to the page). Data redesign: product, reviews, recommendations become awaits in the server components that render them — the previous effect-waterfall (3 × ~300ms client round trips, plus race surface) collapses to server-local calls (~ms each), and Lesson 1's protocol becomes unnecessary FOR THOSE READS because there are no competing client episodes — the request IS the episode. Presence keeps the full Unit-6/8 discipline: subscribe in an effect (or uSES), clean up on unmount, and treat its updates as external-store sync. Unchanged machinery (the two places): (i) the presence socket — effect lifecycle, cleanup pairing, and snapshot/latest-read decisions apply verbatim; (ii) Add-to-Cart — an action-caused mutation: handler-shaped (Unit 6's necessity test), with double-click guarding (Unit 3's ref/disabled pattern) and optimistic-vs-confirmed state as a product choice; additionally every island still owes Lesson 3's hydration invariant (no localStorage/window reads in initial renders). Against their plan, quantified: 'use client' at the root makes the ENTIRE page a client entry — the 70kb parser plus gallery/date/format dependencies all ship and hydrate (likely 100s of kb), and server-side data access becomes impossible from those components (they run client-side), so the effect-waterfall AND its race surface survive the migration intact: the plan pays RSC's complexity while refunding both of its benefits. The frontier rule is the corrective: directives at the smallest subtrees needing client lifetimes; server skeleton; islands at the leaves; slots for interactive wrappers around server content.",
            "explanation": "The capstone question: partition by client-lifetime, collapse the waterfall server-side, recognize what the new architecture does NOT change (subscriptions, mutations, hydration honesty), and price the naive migration. The grader rewards boundary reasoning with mechanisms — frontier, serialization, refresh semantics — over framework vocabulary.",
            "points": 4
          },
          {
            "id": "u9q6",
            "type": "numeric",
            "prompt": "A profile page fetch-in-effect waterfall has 3 sequential client round trips at 240ms each. After moving data access into server components, the same 3 reads run sequentially server-side at 4ms each, plus one 240ms client round trip for the page itself. What is the data latency now, in milliseconds? (Number only.)",
            "answer": 252,
            "explanation": "240 (the single client↔server round trip) + 3 × 4 (server↔database, sequential) = 252ms — versus 720ms before. The waterfall didn't disappear; it moved to where hops cost 4ms instead of 240ms. This is RSC's data argument in one number: sequential composition is nearly free when the components run next to the data.",
            "points": 1
          }
        ]
      }
    },
    {
      "id": "u10",
      "title": "Robust React: Types, Tests, Errors",
      "summary": "Making React apps trustworthy: types that encode the component contract and make illegal states unrepresentable, tests that assert behavior over implementation, and error boundaries as the render-phase failure contract.",
      "references": [
        "react.dev — TypeScript usage; Testing overview; <Component> error boundaries; useState/useReducer typing",
        "Testing Library documentation — guiding principles ('test as the user does'); react.dev on act()",
        "Kent C. Dodds — 'Testing Implementation Details'; 'Common mistakes with React Testing Library'",
        "TypeScript Handbook — discriminated unions, generics, React.ComponentProps"
      ],
      "prerequisites": [
        "u9"
      ],
      "masteryThreshold": 0.85,
      "lessons": [
        {
          "id": "u10l1",
          "title": "Types as the Component Contract",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "A prop type is a proof obligation moved to compile time",
              "body": "Unit 4 argued that the shape of state determines which bugs are possible; this lesson makes the same argument one level up, at the *interface*, and enforces it statically. Every component has a contract — the props it accepts, their types, which combinations are legal — that is *implicit* in plain JavaScript: it lives in the author's head, in the destructuring, in runtime crashes when a caller violates it. TypeScript makes the contract *explicit and checked*: a `Props` type is a specification the compiler verifies at every call site, converting a class of runtime failures (undefined is not a function, cannot read property of null, a boolean where a string was meant) into red squiggles that never ship. But the deep value is not catching typos — it is that **a well-designed prop type makes illegal usage unrepresentable**, exactly Unit 4's principle applied to the component boundary. A `Button` that must be *either* a link (with `href`) *or* an action (with `onClick`) but never both, and never neither, can encode that as a type the compiler enforces — so the invalid call is not documented against, it is *uncompilable*. This lesson develops types as contracts: modeling props so wrong calls don't type-check, typing state and hooks so the reducer's transitions are checked, and treating the type as the component's primary, always-accurate documentation — the one form of docs that cannot drift from the code because the compiler rejects drift."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The component contract, typed",
              "statement": "A component's **contract** is the pair (accepted inputs, guaranteed behavior). TypeScript encodes the input half as a props type checked structurally at every JSX call site: (1) **required vs optional** props (`x: T` vs `x?: T`) — the compiler rejects omissions of required props and flags reads of optionals as possibly-undefined; (2) **precise value types** — unions of literals (`variant: 'primary' | 'ghost'`) rather than `string`, so only listed values pass; (3) **relational constraints** — discriminated unions over props express 'these combinations are legal, those are not', making illegal prop combinations fail to type-check (the Unit-4 unrepresentability principle at the interface); (4) **children and handlers** typed by role (`children: React.ReactNode`, `onSelect: (id: string) => void`), so what may be nested and what a callback receives are checked. The contract is **structural** (TypeScript matches shapes, not names) and **erased** (types vanish at runtime — they are a compile-time proof, not a runtime guard; data crossing runtime boundaries, i.e. network/storage, still needs runtime validation, since erased types cannot check values the compiler never saw)."
            },
            {
              "type": "code",
              "heading": "Modeling props so wrong calls don't compile",
              "lang": "tsx",
              "code": "// WEAK — types present, contract absent: illegal combos compile.\ntype ButtonProps = {\n  variant?: string;                 // any string — 'primry' typo passes\n  href?: string;                    // both? neither? nothing forbids it\n  onClick?: () => void;\n};\n\n// STRONG — the type IS the spec; illegal usage fails to type-check.\ntype ButtonProps =\n  | { variant?: 'primary' | 'ghost';           // literal union: only these\n      href: string; onClick?: never }          // LINK: href required,\n  | { variant?: 'primary' | 'ghost';           //       onClick forbidden\n      href?: never; onClick: () => void };      // ACTION: onClick required,\n                                                //         href forbidden\n// <Button href=\"/x\" onClick={f}/>  → ERROR (both) — the discriminated\n// <Button variant=\"primary\"/>      → ERROR (neither href nor onClick)\n// <Button variant=\"primry\" .../>   → ERROR (not in the literal union)\n// The invalid calls aren't discouraged by docs; they don't compile.\n\n// Deriving props from another component (don't hand-copy — inherit):\ntype InputProps = React.ComponentProps<'input'> & {   // all native <input>\n  label: string;                                       // props, plus ours\n};\n// <LabeledInput label=\"Email\" type=\"email\" onChange={…} required />\n// — every real DOM input attribute is typed for free; add label as\n// the required extension. Hand-listing native props is how prop types\n// rot; ComponentProps keeps them in sync with the platform.\n\n// Generic components — type flows through:\nfunction Select<T>({ options, value, onChange }: {\n  options: T[];\n  value: T;\n  onChange: (next: T) => void;\n}) { /* … */ }\n// <Select options={users} value={u} onChange={setU}/> — onChange's\n// argument is inferred as the user type at each call site; a Select of\n// numbers and a Select of users are both checked, one definition."
            },
            {
              "type": "text",
              "heading": "Typing state and hooks — where inference helps and where it needs help",
              "body": "The hooks are typed so their storage participates in the contract, and knowing the three cases where inference falls short is most of the practical skill. **useState** usually infers from the initializer — `useState(0)` is `number`, `useState('')` is `string`, no annotation needed — but two cases require you to widen the type explicitly: nullable state (`useState<User | null>(null)` — inference would fix it at `null`, rejecting every later real value) and empty-collection state (`useState<Todo[]>([])` — inference gives `never[]`). **useReducer** is where types earn their keep for real: annotate the state as a discriminated union (Unit 4's status machine) and actions as a union of action objects, and the reducer becomes *exhaustively checked* — inside `switch (action.type)`, TypeScript narrows each case to that action's exact payload (so `action.data` exists only in the RESOLVE case), and a `default: return assertNever(action)` makes *forgetting a new action a compile error*: add an action variant, and every reducer and dispatcher that doesn't handle it fails to build. This is the payoff Unit 4 promised, now mechanically enforced — the state machine's totality is checked, not hoped for. **useRef** needs its intent typed: `useRef<HTMLInputElement>(null)` for a DOM ref (nullable until attached — the type tells you to null-check), versus `useRef(0)` for a mutable box (non-null, you own it). **Context** must be typed to force the provider check — `createContext<Theme | null>(null)` plus a `useTheme()` hook that throws (and narrows away the null) if no provider is present, converting Unit 4's 'default value or missing provider' ambiguity into a typed, guarded read. The through-line: inference handles the easy 80%; the 20% it can't (nullability, emptiness, unions, refs, context) is exactly where the bugs are, so annotate there deliberately."
            },
            {
              "type": "example",
              "heading": "Worked example: the discriminated-union reducer, exhaustively checked",
              "body": "Type Unit 4's fetch machine and watch the compiler enforce it:\n\n`type State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: Post[] } | { status: 'failure'; error: string };`\n`type Action = { type: 'START' } | { type: 'RESOLVE'; data: Post[] } | { type: 'REJECT'; error: string };`\n\nInside the reducer, `switch (action.type) { case 'RESOLVE': return { status: 'success', data: action.data };` — TypeScript *knows* `action.data` exists here (it narrowed Action to the RESOLVE variant) and would reject `action.error` in this branch (not on that variant); it also rejects `return { status: 'success' }` (missing `data`, which the State type requires under 'success'). Three enforcements compound: (1) you cannot construct an illegal state (the State union has no `{status:'success'}` without data — Unit 4's unrepresentability, now a compile error, not a runtime hope); (2) you cannot read a payload that doesn't belong to the current variant (`state.data` is a type error unless you've narrowed to 'success' — the compiler forces the `if (state.status === 'success')` guard that prevents 'cannot read data of undefined'); (3) with `default: return assertNever(action)` where `function assertNever(x: never): never { throw … }`, adding a fourth action later and forgetting to handle it makes `action` not-`never` in the default, a *compile error naming the omission*. The reducer's totality — the property Unit 4 argued for informally — is now a build-time guarantee. This is types and state-design meeting: the discriminated union is simultaneously the runtime state shape and the static contract, and one design serves both."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**`any` is a hole in the contract; `as` is a promise the compiler can't check.** Every `any` erases types *transitively* — a single `any` flowing through props/state/handlers disables checking along its whole path, silently, which is why one `any` in a hot type often explains a cluster of 'why didn't types catch this?' bugs. Prefer `unknown` (forces a narrowing check before use) for genuinely dynamic values. And `as` (type assertion) is you overriding the compiler — `data as User` asserts a shape TypeScript cannot verify; if the data is network-sourced, `as` is a lie waiting to crash (the field is missing at runtime, types said it wasn't). The honest boundary discipline: validate external data at runtime (a schema validator like Zod) and let the *validated* result carry the type — so the type reflects a checked fact, not an assertion. Types are erased; they cannot guard values that entered from outside the compiler's sight."
            },
            {
              "type": "text",
              "heading": "Types as living documentation and refactoring insurance",
              "body": "Two benefits of the typed contract are strategic rather than bug-level, and they compound over a codebase's life. First, **the type is the only documentation that cannot drift**: a JSDoc comment saying 'variant is primary or secondary' silently lies the day someone adds 'ghost'; a `variant: 'primary' | 'secondary' | 'ghost'` type *is* the current truth, checked, autocompleted at every call site, and impossible to desynchronize from the code because the compiler rejects desync. New engineers read the props type to learn a component the way one reads a function signature — and it is always accurate. Second, **types make large refactors mechanical**: rename a prop, change a payload's shape, split a component, and the compiler produces an exhaustive worklist of every affected call site — refactoring becomes 'fix all the red until it's green', a finite bounded task, rather than 'grep, guess, and hope QA catches the misses'. This is the same shift the depth floors and validators in *this very platform* embody (a machine-checked contract beats a prose promise) — and it is why typed React scales to large teams where untyped React accrues 'don't touch that component, nobody knows its contract' debt. The discipline to internalize: **write the type first, as the spec**; if the type is hard to write (a component that takes 'a config that's sometimes a string and sometimes an object with different required fields depending on a mode flag'), that difficulty is the *design* telling you the contract is too loose — tighten the component, and the type gets easy. A type that's painful to write is a design smell, not a TypeScript limitation."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Write a props type for a <Toast> that is EITHER auto-dismissing (requires durationMs: number, forbids onDismiss) OR manually-dismissable (requires onDismiss: () => void, forbids durationMs), always requires message: string, and optionally takes a variant of 'info' | 'success' | 'error'. Then show one call that must compile and one that must NOT, explaining the compiler's reasoning.",
                  "solution": "type ToastProps = { message: string; variant?: 'info' | 'success' | 'error' } & ( { durationMs: number; onDismiss?: never } | { durationMs?: never; onDismiss: () => void } ). MUST compile: <Toast message=\"Saved\" variant=\"success\" durationMs={3000}/> — matches the auto-dismiss arm (durationMs present, onDismiss absent), message present, variant in the union. MUST NOT: <Toast message=\"Err\" durationMs={3000} onDismiss={close}/> — supplying both fields satisfies neither arm: the auto arm has onDismiss?: never (so passing it errors), the manual arm has durationMs?: never (so passing it errors); the intersection with the message base doesn't rescue it. The compiler reasons over the discriminated union: a value must match at least one arm entirely, and the `never` fields make 'both' match no arm. Also failing: omitting both (neither arm's required field present) and variant=\"warn\" (not in the literal union). The type encodes the spec's 'exactly one dismissal mechanism' as a compile-time invariant.",
                  "hint": "Base type for the always-props, intersected with a union of the two mutually-exclusive arms using `?: never` to forbid the other arm's field."
                },
                {
                  "prompt": "Explain why useState(null) for user state, then later setUser(fetchedUser), fails to type-check, and give the two idiomatic fixes with the difference between them. Then explain why useState([]) for a todo list is a subtler version of the same problem.",
                  "solution": "useState(null) infers the state type as `null` (the initializer's type, with no widening) — so setUser(fetchedUser: User) is assignment of User to a null-typed setter: error. Fixes: (1) explicit type argument — useState<User | null>(null): the canonical fix, state is nullable-User, later reads must null-check (which is correct — before the fetch there IS no user, and the type forcing the guard prevents 'cannot read name of null'). (2) Rarely, initialize with a real value if one exists (useState<User>(GUEST)) — only when null is not a real state. useState([]) is the same failure hidden: [] infers as `never[]` (an array that can hold nothing), so setTodos([todo]) errors (Todo not assignable to never) — and reads like todos.map look fine until you push real data. Fix: useState<Todo[]>([]). The unifying rule: when the INITIAL value is 'empty' or 'absent' (null, [], {}), inference types the state as the empty thing itself, not the eventual real thing — annotate the intended type explicitly. Inference reads the initializer; you know the future values it can't see.",
                  "hint": "What type does TypeScript infer from the literal null / [] alone, and does it include the real values that arrive later?"
                },
                {
                  "prompt": "A reviewer sees data cast as `const user = (await res.json()) as User` and approves it. Construct the runtime crash this permits despite a green build, and rewrite the boundary correctly. State the general principle about types and runtime data.",
                  "solution": "The crash: res.json() has type `any` (or `unknown`), and `as User` ASSERTS it's a User without checking — but the server might return { error: 'not found' } (a 404 body), an older schema missing `user.settings`, or null. The build is green (the assertion silenced the compiler); at runtime user.settings.theme reads theme of undefined → crash in production, exactly where types 'guaranteed' safety. The assertion converted a checkable uncertainty into an unchecked claim. Correct boundary: validate at runtime with a schema — const user = UserSchema.parse(await res.json()) (Zod or similar): parse either returns a value the validator PROVED matches User (and TypeScript infers that type from the schema — the type now reflects a checked fact) or throws a descriptive error you handle as a failure state (Unit 4's machine). General principle: TypeScript types are erased at runtime and describe only what the compiler SAW; data crossing a runtime boundary (network, localStorage, postMessage, URL params) was never seen by the compiler, so its type must be ESTABLISHED by runtime validation, not ASSERTED by `as`. `as` on external data is a hope with a type annotation.",
                  "hint": "What does `as` actually check? What produced the JSON, and did the compiler ever see it?"
                },
                {
                  "prompt": "Design critique via types: a teammate's <Chart> takes props { type: string; data: any; options?: any }. List everything wrong from the contract perspective, then show how retyping it surfaces a DESIGN problem (not just a typing one) they'd otherwise ship.",
                  "solution": "Contract failures: type: string accepts 'lin'/'bar '/typos — should be a literal union 'line' | 'bar' | 'pie'; data: any erases all checking of the chart's actual data shape transitively (any consumer of data inside Chart is now unchecked too); options: any is the same hole and hides that different chart types need different options. Retyping surfaces the design problem: attempting type ChartProps = { type: 'line'; data: LineSeries[]; options?: LineOptions } | { type: 'bar'; data: BarSeries[]; options?: BarOptions } | … forces the question 'does a pie chart's data even have the same shape as a line chart's?' — and the honest answer (no: pie takes {label,value}[], line takes {x,y}[]) reveals that <Chart> was pretending one component handles fundamentally different data contracts via `any`. The type won't write cleanly because the component is under-designed — either it should be split (<LineChart>, <BarChart> with precise props each) or its data needs a genuinely unified typed model. The difficulty of writing the type IS the design feedback: `any` was silencing a real 'this abstraction is too broad' problem that would ship as runtime shape mismatches ('pie chart got x/y data, renders nothing'). Tighten the design; the type follows.",
                  "hint": "Try to replace each `any` with a precise type; where the type resists being written, ask what the component is conflating."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u10l1-i1",
              "front": "What is a component's typed contract, and its deepest payoff?",
              "back": "The props type checked at every call site (required/optional, literal unions, relational constraints, typed children/handlers). Deepest payoff: illegal usage becomes uncompilable — Unit 4's unrepresentability at the interface."
            },
            {
              "id": "u10l1-i2",
              "front": "How do you forbid illegal PROP COMBINATIONS (e.g. link-or-action, never both)?",
              "back": "A discriminated union of prop shapes with `?: never` on the forbidden field per arm — a call supplying both (or neither) matches no arm and fails to type-check."
            },
            {
              "id": "u10l1-i3",
              "front": "The three useState cases where inference needs an explicit type argument?",
              "back": "Nullable state (useState<User|null>(null) — else fixed at null), empty collections (useState<Todo[]>([]) — else never[]), and unions. Inference reads the initializer; annotate when it can't see the future values."
            },
            {
              "id": "u10l1-i4",
              "front": "What does typing a reducer with discriminated unions buy?",
              "back": "Exhaustive checking: each case narrows to that action's payload, illegal states can't be constructed, and assertNever(action) in default makes forgetting a new action a compile error — Unit 4's totality, enforced."
            },
            {
              "id": "u10l1-i5",
              "front": "Why can't types replace runtime validation at boundaries?",
              "back": "Types are erased at runtime and describe only what the compiler saw; network/storage data was never seen — establish its type by runtime validation (schema.parse), never assert it with `as`."
            },
            {
              "id": "u10l1-i6",
              "front": "What does a type that's painful to write tell you?",
              "back": "It's a design smell, not a TypeScript limitation — the contract is too loose (an `any`-hidden conflation). Tighten or split the component and the type becomes easy."
            }
          ]
        },
        {
          "id": "u10l2",
          "title": "Testing Behavior, Not Implementation",
          "estMinutes": 21,
          "content": [
            {
              "type": "text",
              "heading": "The testing philosophy that survives refactors",
              "body": "A test suite is an asset only if it fails when the app breaks and passes when the app works — and the most common way suites fail this is by testing *implementation* instead of *behavior*. An implementation test asserts on internals: 'state.count is 3', 'the useEffect ran', 'this child component received these props', 'the component is in loading state'. It has two fatal properties: it breaks on *refactors that change nothing the user experiences* (rename the state variable, restructure into a reducer, split a component — all green-to-red with zero real regressions, training the team to distrust and ignore the suite), and it *passes through real bugs* (state.count is 3 but the number rendered to the DOM is 2 because of a display bug the test never looked at the DOM to catch). A behavior test asserts what a *user* would observe and do: 'the screen shows 3', 'clicking increment makes it show 4', 'submitting the empty form shows a required-field error'. Its properties are the inverse: it survives any refactor that preserves behavior (the whole point of a refactor), and it catches any bug that changes what the user sees. The guiding principle, from Testing Library's design: **the more your tests resemble the way your software is used, the more confidence they give you**. This lesson operationalizes that — querying the DOM as a user perceives it, driving interactions as a user would, and the one React-specific wrinkle (`act`) that the async, batched render model forces on honest tests."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Behavioral testing and the user-resemblance principle",
              "statement": "A **behavioral test** of a component asserts only over its *observable interface*: the rendered output (the DOM the user sees) and its responses to *user-driven events* (clicks, typing, submits) — never over internal state, hook execution, instance methods, or child props. Formally, treat the component as a black box computing DOM = f(props, user-events over time); a behavioral test constrains f's observable outputs for given inputs. **Corollaries**: (1) queries should locate elements the way users do — by accessible role, label, and visible text — not by test-ids or DOM structure, so the query breaks only when the user-facing element changes; (2) interactions should simulate real event sequences (a click is pointer-down/up/focus/click; typing fires per-character events) — userEvent, not synthetic shortcuts; (3) assertions should read the resulting DOM, not the component's internals. **The act() requirement**: any state update triggered in a test must be wrapped so React flushes its render+effects before assertions — React warns if updates occur outside act, because asserting on a mid-update tree (before the batched render commits) tests a state the user never sees. Testing Library's async utilities (findBy*, waitFor) and userEvent wrap act automatically; manual state pokes need explicit act."
            },
            {
              "type": "code",
              "heading": "The same component, tested two ways",
              "lang": "tsx",
              "code": "// IMPLEMENTATION TEST — brittle and blind:\ntest('increments count state', () => {\n  const { result } = renderHook(() => useCounter());\n  act(() => result.current.increment());\n  expect(result.current.count).toBe(1);      // asserts INTERNAL state\n});\n// Breaks if: increment becomes a reducer dispatch, count is renamed,\n// the hook is inlined into the component. Passes even if the button's\n// onClick is unwired or the number renders wrong — it never looks at\n// what the user sees.\n\n// BEHAVIORAL TEST — survives refactors, catches real bugs:\ntest('clicking increment shows the next number', async () => {\n  const user = userEvent.setup();\n  render(<Counter/>);\n  // Query as a user perceives it — by role and accessible name:\n  expect(screen.getByRole('status')).toHaveTextContent('0');\n  await user.click(screen.getByRole('button', { name: /increment/i }));\n  expect(screen.getByRole('status')).toHaveTextContent('1');\n});\n// Survives: reducer refactor, state rename, hook extraction, component\n// split — ALL green, because the user's experience is unchanged.\n// Catches: unwired onClick (button click ⇒ no update ⇒ fails),\n// display bug (state 1 but renders 0 ⇒ fails), missing accessible\n// name (getByRole throws ⇒ fails, surfacing an a11y bug for free).\n\n// QUERY PRIORITY (Testing Library) — accessibility-ordered:\n//   getByRole (+ name)   ← how assistive tech and users find things\n//   getByLabelText       ← form fields by their label\n//   getByText            ← non-interactive content\n//   getByTestId          ← LAST resort: invisible to users, use only\n//                          when nothing user-facing identifies the node\n// Reaching for getByTestId first is the tell that you're testing\n// structure, not experience — and often that the component lacks the\n// accessible markup a real user needs anyway.\n\n// async: waiting for the DOM to REACH a state (not poking internals):\nawait screen.findByText('Welcome back');   // retries until it appears\n// (findBy* = getBy* + waitFor; wraps act; the honest way to test\n//  post-fetch UI — assert the SCREEN settled, not that a promise did)"
            },
            {
              "type": "text",
              "heading": "Why act() exists — the render model makes it necessary",
              "body": "`act()` confuses people until they connect it to Units 1 and 3. A state update does not synchronously update the DOM — it schedules a render, which React batches and flushes, after which effects run (Unit 1's pipeline; Unit 3's queue). In a test, if you trigger an update and *immediately* assert, you may be reading the DOM *before* React has committed the new render — a torn moment the user never experiences, because between event and paint React always flushes. `act()` is the test-time boundary that says 'apply all pending work — renders, effects, microtasks — and settle, as would happen before the user sees anything', so your assertions run against a committed, consistent tree. The 'not wrapped in act' warning is therefore not ceremony: it means *your test observed a state React was mid-way through producing* — asserting on it tests a non-frame, and worse, the settling might change the result after your assertion passed (a false green) or fire an effect that logs an error your test misses. The practical rule dissolves most of the pain: **use `userEvent` for interactions and `findBy*`/`waitFor` for async — they wrap `act` for you** — and reach for manual `act()` only when driving updates outside those (a raw store dispatch, a manual timer advance, a directly-called imperative handle). The mental model: `act` makes the test observe the same settled world the user observes; skipping it observes React's private in-progress work — the exact thing Units 1 and 8 spent pages keeping *unobservable*, briefly made observable by a test poking too early."
            },
            {
              "type": "example",
              "heading": "Worked example: testing a data-fetching form the behavioral way",
              "body": "A `<SignupForm>` validates, submits to an API, shows a success message or an error. The behavioral test tells the whole user story without touching one internal:\n\n`const user = userEvent.setup(); render(<SignupForm/>);` — then: `await user.click(screen.getByRole('button', { name: /sign up/i }))` with empty fields → `expect(screen.getByText(/email is required/i)).toBeInTheDocument()` (validation behavior, asserted on visible text — not on a `errors` state object). Fill and submit against a mocked API (mock the *network*, at the fetch/MSW layer — the app's real boundary — not the component's functions): `await user.type(screen.getByLabelText(/email/i), 'a@b.co'); await user.click(...)`. Success path: `await screen.findByText(/check your inbox/i)` — findBy waits for the post-fetch render, wrapping act; the assertion is that the *screen settled to the success state*, exactly what the user waits for. Error path: configure the mock to reject/500, assert the error message appears and — behaviorally important — that the form is still filled (the user's data wasn't lost) and re-submittable. Notice what this test never does: check `status === 'submitting'`, verify `fetch` was called with specific args as its *primary* assertion (a light call-check is fine as a secondary guard, but the primary assertion is the user-visible outcome), or inspect child component props. It reads as the feature's acceptance criteria in code — which is why it survives every refactor that preserves those criteria (reducer, state shape, component split) and fails on every regression that violates them (broken validation, swallowed error, lost input). The test IS the spec, at the user's altitude."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Mock at the boundary, not the internals.** The instinct to mock the component's own functions (jest.mock the hook, stub the reducer, replace a child) reintroduces implementation coupling through the back door — the test now knows the internals it was supposed to ignore, and breaks when they change. Mock only at genuine *system boundaries*: the network (MSW / fetch mock — the app's real seam with the server), time (fake timers for debounces/intervals), and truly external modules (analytics, a payment SDK). Everything inside the component tree should run for real, driven by user events — that's what gives the test its confidence. A test that mocks the thing it's testing is asserting that your mocks agree with your mocks. Rule of thumb: if removing the mock would require a network call or a real clock, it's a legitimate boundary mock; if it just replaces your own code, you're testing implementation."
            },
            {
              "type": "text",
              "heading": "What to test, and the confidence-per-test economy",
              "body": "Not everything deserves a test, and behavioral testing sharpens the economics because behavioral tests are *more expensive* (render a subtree, drive events) but *far more valuable* (real confidence, refactor-durable) than implementation tests — so you write fewer, better ones. The priorities: **test behavior users depend on** — the critical paths (can they sign up, check out, save?), the edge cases that bite (empty states, errors, boundary values, the race protocols of Unit 9), and the bugs you've fixed (a regression test per fixed bug is the highest-ROI test there is — it encodes a real failure that actually happened). **Test pure logic directly** — the engine of this very platform (`src/lib/`) is pure functions tested with `node --test`, no rendering needed: reducers, formatters, validators, the fold semantics — pure functions are the cheapest, most valuable tests, so push logic *into* pure functions (Unit 4's derivations, Unit 5's custom hooks' cores) specifically to make it testable without a DOM. **Don't test** the framework (React works; don't test that setState re-renders), third-party libraries (they have their own tests), or trivial pass-through components with no logic. The shape that emerges is the sane version of the 'testing trophy': a broad base of fast pure-logic tests, a strong middle of behavioral component/integration tests (where React apps' real bugs live — the interaction of state, effects, and rendering), and a thin top of end-to-end tests for the handful of critical full-stack flows. The anti-pattern to avoid is the inverted pyramid of brittle implementation unit tests that mock everything, run fast, and catch nothing — a suite that is all cost and no confidence, which teams eventually (correctly) learn to ignore."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Rewrite this implementation test as a behavioral one, and list every real bug the original would MISS that the rewrite catches: test('opens on click', () => { const { result } = renderHook(() => useDisclosure()); act(() => result.current.onOpen()); expect(result.current.isOpen).toBe(true); }) — for a <Dropdown> using that hook.",
                  "solution": "Behavioral: test('shows the menu when the trigger is clicked', async () => { const user = userEvent.setup(); render(<Dropdown/>); expect(screen.queryByRole('menu')).not.toBeInTheDocument(); await user.click(screen.getByRole('button', { name: /options/i })); expect(screen.getByRole('menu')).toBeVisible(); }). Bugs the original misses (isOpen true but the user sees nothing): the menu is rendered but display:none / zero-height (isOpen true, invisible menu); the trigger's onClick isn't wired to onOpen (hook works in isolation, component doesn't call it); the menu renders but with role/markup assistive tech can't find (getByRole('menu') would fail — an a11y bug surfaced free); isOpen drives the wrong element. The original tests that the HOOK's boolean flips — a fact about internal state that can be true while the entire user-facing feature is broken; the rewrite tests that the user can actually see the menu after clicking, which is the only thing that matters.",
                  "hint": "The original asserts a boolean. List the ways that boolean can be correct while the user still sees nothing."
                },
                {
                  "prompt": "Explain precisely why this test logs a 'not wrapped in act(...)' warning and may be flaky, then fix it: test('shows user after load', () => { render(<Profile id={1}/>); expect(screen.getByText('Ada')).toBeInTheDocument(); }) — where Profile fetches the user in an effect.",
                  "solution": "Mechanism: render() commits the initial (loading) tree; the fetch effect runs, and when it resolves it calls setState — an update that schedules a render OUTSIDE any act boundary the test established, so React warns (a state update happened that the test didn't flush and settle). The getByText runs SYNCHRONOUSLY right after render, before the fetch resolved — so it asserts against the loading tree (no 'Ada' yet) and throws; it's flaky because on a fast mock it might occasionally win the race. The assertion is reading a state the settling will change. Fix: await the DOM reaching the loaded state — test('shows user after load', async () => { render(<Profile id={1}/>); expect(await screen.findByText('Ada')).toBeInTheDocument(); }). findByText retries until 'Ada' appears (or times out), and wraps act so the fetch's update flushes and settles before the assertion resolves — testing the settled world the user sees, not React's in-progress work. General rule: any post-async UI is asserted with findBy*/waitFor, never a synchronous getBy right after render.",
                  "hint": "When does the fetch's setState happen relative to the synchronous getByText, and which tree does the assertion read?"
                },
                {
                  "prompt": "A teammate defends heavy mocking: 'I mock the useCart hook, the ProductList child, and the analytics module so my <ShopPage> test is fast and isolated'. Adjudicate each mock as boundary or internal, predict what the test can no longer catch, and state what it actually verifies.",
                  "solution": "useCart (the page's OWN hook): INTERNAL mock — reintroduces the implementation coupling behavioral testing avoids; the test now can't catch a broken integration between ShopPage and useCart (the real bug surface: does the page wire the cart correctly?), and it breaks whenever useCart is refactored though nothing user-facing changed. ProductList (a child COMPONENT): INTERNAL mock — the test no longer verifies that products actually render, that clicking one works, or that ShopPage passes the right data down; a whole feature is stubbed out. analytics (a third-party SDK / external module): BOUNDARY mock — legitimate; analytics is a genuine external system with side effects you don't want in tests. Net: after mocking its own hook and child, the test verifies only that ShopPage renders SOME shell around two mocks — it 'passes' with the cart integration broken, the product list broken, and the data flow wrong, catching essentially nothing while looking green and fast (the inverted-pyramid trap). Correct: mock only the network (MSW) and analytics; render the real useCart and ProductList; drive the page with userEvent and assert the user-visible result. Fast-and-isolated is worthless if it isolates away everything that can break.",
                  "hint": "For each mock ask: is this a system boundary (network/time/external SDK) or the component's own code? What real integration does mocking it stop testing?"
                },
                {
                  "prompt": "Design the test strategy for the debounced-search feature from Units 5/9 (useDebouncedValue + fetch with race protocol): what do you test as pure logic, what behaviorally, what at the boundary, and what do you deliberately NOT test — and how do you test the RACE without flakiness?",
                  "solution": "Pure logic (node --test / fast unit): the debounce hook's timing contract via fake timers — advance time, assert the returned value lags correctly; and any pure filtering/formatting of results. Behavioral (Testing Library): type into the search box, assert (with fake timers advanced or findBy) that results for the typed query appear, that intermediate keystrokes don't each trigger a visible fetch flurry (debounce working from the user's view), and that clearing the box clears results. Boundary (MSW): mock the search API — including per-query responses so you can assert the RIGHT results show for the RIGHT query. Testing the race WITHOUT flakiness: don't rely on real timing — make the mock's response order controllable (MSW handler that delays query 'a' longer than 'ab', or resolves promises you release manually), type 'a' then 'ab', release 'a' LAST, and assert the screen shows 'ab' results (the protocol's latest-wins) — a deterministic reproduction of Unit 9's race, green iff the cleanup/abort revocation works, red iff the stale write lands. Deliberately NOT tested: that useState re-renders, that fetch works, the debounce library internals if third-party — framework and platform guarantees. The race test is the crown jewel: it encodes the exact bug Unit 9 proved, made reproducible by controlling the boundary's timing rather than hoping for it.",
                  "hint": "Push timing logic into pure hooks (fake timers), assert user-visible results behaviorally, and make the network mock's ORDERING deterministic to test the race on purpose."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u10l2-i1",
              "front": "Behavioral vs implementation tests — the defining difference and why it matters?",
              "back": "Behavioral asserts on observable output + user events (survives refactors, catches display bugs); implementation asserts on internals (breaks on harmless refactors, passes through real bugs). Test the black box, not the wiring."
            },
            {
              "id": "u10l2-i2",
              "front": "Testing Library's query priority and what it enforces?",
              "back": "getByRole(+name) > getByLabelText > getByText > getByTestId (last resort). Querying as users/assistive-tech perceive elements — reaching for testId first signals you're testing structure and often that the markup lacks accessibility."
            },
            {
              "id": "u10l2-i3",
              "front": "Why does act() exist?",
              "back": "State updates schedule batched renders + effects (Units 1/3); asserting before React flushes reads a tree the user never sees. act() settles all pending work so assertions run against the committed frame — userEvent and findBy* wrap it automatically."
            },
            {
              "id": "u10l2-i4",
              "front": "Mock at the boundary — what qualifies, what doesn't?",
              "back": "Mock genuine system boundaries: network (MSW), time (fake timers), external SDKs. Never mock the component's own hooks/children/reducers — that reintroduces implementation coupling and stops testing the real integration."
            },
            {
              "id": "u10l2-i5",
              "front": "How do you test async UI (post-fetch) honestly?",
              "back": "findBy*/waitFor — assert the SCREEN reaches the expected state (retries + wraps act), never a synchronous getBy right after render (reads the pre-fetch tree, flaky and wrong)."
            },
            {
              "id": "u10l2-i6",
              "front": "The sane test distribution for a React app?",
              "back": "Broad base of fast pure-logic tests (push logic into pure functions to enable this), strong middle of behavioral component/integration tests (where React bugs live), thin top of e2e for critical flows. Avoid the inverted pyramid of brittle mock-everything unit tests."
            }
          ]
        },
        {
          "id": "u10l3",
          "title": "Error Boundaries and the Failure Contract",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "What happens when render throws",
              "body": "Every unit so far assumed render *succeeds*. This lesson handles the other case, and it has a sharp, non-obvious rule: **an uncaught error thrown during a component's render, in a lifecycle method, or in a constructor unmounts the entire React tree by default** — the whole app goes blank, not just the broken component. The reasoning is principled, not a bug: React cannot know how far the corruption from a failed render extends, and rendering a *partially* broken tree risks showing wrong or dangerous UI (a payment form missing its total, a permissions check that silently failed open); a blank screen is a safer failure than a subtly-wrong one. But a blank app is a terrible *user* experience for a localized failure — one broken widget shouldn't nuke the page. **Error boundaries** are the mechanism to contain the blast: a component that 'catches' errors thrown by its descendants during render and commits a fallback UI in their place, exactly as a `try/catch` contains a throw — except scoped to the render phase and expressed as tree structure (like Suspense boundaries, Lesson 9.2: place a boundary, define what shows when the subtree fails). The design symmetry is worth seeing: Suspense boundaries catch 'not ready yet' (a suspension), error boundaries catch 'failed' (a throw), and both replace their subtree with a fallback declared in JSX — React's two ways of saying 'this region couldn't render its real content, here's what to show instead'. This lesson pins down what boundaries catch (a precise, surprising subset), how to place them, and why the render-phase-only scope is exactly right."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The error boundary contract",
              "statement": "An **error boundary** is a component implementing `static getDerivedStateFromError(error)` (return fallback state — the render-phase response) and/or `componentDidCatch(error, info)` (the commit-phase side effect: log the error). Placed as an ancestor, it catches errors thrown *during rendering, in lifecycle methods, and in constructors of its descendant tree*, and renders a fallback instead of the crashed subtree — containing the failure to that subtree while the rest of the app keeps working. It **does not catch**: (1) errors in **event handlers** (they run outside render — use ordinary try/catch; a click that throws doesn't corrupt the tree); (2) errors in **asynchronous code** (setTimeout, promise callbacks, fetch .then — they escape the render call stack; handle at the async site, surface via state); (3) errors during **server-side rendering**; (4) errors thrown by the **boundary itself** (a boundary can't catch its own render error — it propagates to the next boundary up). Boundaries **nest**: the nearest ancestor boundary catches, so granular boundaries contain failures locally while an outer boundary is the last-resort app-level net. (Error boundaries remain class components — there is no hook equivalent as of React 19 — though they wrap function-component fallbacks freely.)"
            },
            {
              "type": "code",
              "heading": "A boundary, its placement, and what it deliberately doesn't catch",
              "lang": "tsx",
              "code": "class ErrorBoundary extends React.Component<\n  { fallback: (e: Error, retry: () => void) => React.ReactNode; children: React.ReactNode },\n  { error: Error | null }\n> {\n  state = { error: null as Error | null };\n  static getDerivedStateFromError(error: Error) {   // render-phase:\n    return { error };                                // → show fallback\n  }\n  componentDidCatch(error: Error, info: React.ErrorInfo) {\n    logToService(error, info.componentStack);        // commit-phase side effect\n  }\n  retry = () => this.setState({ error: null });      // re-attempt the subtree\n  render() {\n    return this.state.error\n      ? this.props.fallback(this.state.error, this.retry)\n      : this.props.children;\n  }\n}\n\n// PLACEMENT is design (like Suspense boundaries): granular boundaries\n// contain failures where users can still use everything else.\n<AppShell>                                    {/* app-level last resort */}\n  <ErrorBoundary fallback={AppCrashScreen}>\n    <Header/>                                  {/* nav survives widget crashes */}\n    <ErrorBoundary fallback={WidgetError}>     {/* one widget fails alone */}\n      <RevenueChart/>\n    </ErrorBoundary>\n    <ErrorBoundary fallback={WidgetError}>\n      <ActivityFeed/>                          {/* independent blast radius */}\n    </ErrorBoundary>\n  </ErrorBoundary>\n</AppShell>\n\n// WHAT BOUNDARIES DON'T CATCH — handle these at their real site:\nfunction SaveButton() {\n  const [err, setErr] = useState<Error | null>(null);\n  async function handleSave() {\n    try { await api.save(); }                  // async + handler: the\n    catch (e) { setErr(e as Error); }          // boundary won't see this —\n  }                                            // catch it, put it in STATE,\n  return err                                   // and render the error (which\n    ? <InlineError error={err} onRetry={() => setErr(null)}/>  // a boundary\n    : <button onClick={handleSave}>Save</button>;             // COULD catch)\n}\n// Bridge pattern: to route an async/handler error INTO a boundary,\n// setState an error in the catch and THROW it during the next render\n// (some libs' useErrorBoundary hook does exactly this) — converting a\n// non-render error into a render error the boundary's contract covers."
            },
            {
              "type": "text",
              "heading": "Why the scope is render-phase — and why that's exactly right",
              "body": "The 'doesn't catch event handlers or async' rule frustrates people until they see it follows necessarily from Unit 1's model. An error boundary catches *render-phase* failures because the render phase is where React is *in control of the call stack* — it invokes your components, so it can wrap those invocations and catch what they throw, and a render failure genuinely threatens tree integrity (a half-rendered tree is React's problem to contain). Event handlers and async callbacks run *outside* render — React isn't on the stack when your onClick fires or your promise resolves (Unit 3's escaped closures, Unit 6's effect callbacks); an error there doesn't corrupt the render tree, and React has no call-stack position from which to catch it. So the scope isn't a limitation React failed to fix — it's the precise boundary of where render-tree corruption can occur, which is exactly what error boundaries exist to contain. This clarifies the division of labor: **render errors → error boundaries** (the tree might be corrupt; contain and show a fallback); **handler/async errors → try/catch + error state** (the tree is fine; this is a *failed operation*, model it as a failure state in your Unit-4 machine and render it, because the user needs a specific, recoverable message — 'payment declined', 'save failed, retry' — not a whole-subtree fallback). The mature app uses both deliberately: boundaries as the safety net for the *unexpected* (bugs, null derefs, the crashes you didn't foresee), and modeled error states for the *expected* failures (network errors, validation, declined operations — the failures your product has real UX for). Conflating them — routing expected failures through boundaries, or trying to boundary-catch a handler throw — is the common mistake this scope rule prevents."
            },
            {
              "type": "example",
              "heading": "Worked example: designing the failure UX of a dashboard",
              "body": "Take a dashboard and design its complete failure behavior, using both mechanisms where each fits. **App-level boundary** (last resort): wraps everything, fallback = a full-page 'Something went wrong' with a reload and an error id (from componentDidCatch's log) — catches the truly unexpected (a null-deref bug in some deep component) so a single bug never shows users a blank white screen; this is the *floor*, not the plan. **Per-widget boundaries**: each independent widget (chart, feed, KPI row) gets its own boundary with a compact fallback ('This chart couldn't load — retry'), so one widget's crash leaves the other eleven fully usable — the blast-radius containment that makes boundaries worth placing granularly. **Combined with Suspense** (Lesson 9.2): each widget is wrapped in *both* — `<ErrorBoundary><Suspense fallback={<Skeleton/>}><Widget/></Suspense></ErrorBoundary>` — the canonical async-data pattern: Suspense handles 'loading', the error boundary handles 'the load or render failed', and the widget itself is written assuming success (no loading branch, no try/catch) — the two boundaries absorb both non-success cases as structure. **Modeled error states** for *expected* failures: the 'export report' button's network failure is NOT a boundary case — it's a handler error caught into state, rendering 'Export failed, retry' inline (the button and page stay fully alive); the same for form validation and declined payments — these have specific recovery UX the product designed, so they're Unit-4 failure states, not fallbacks. Trace the coverage: unexpected render bugs → contained by boundaries (app + per-widget); async loading → Suspense; expected operation failures → modeled states with tailored UX. Every failure mode has a designed response, and the *placement* of boundaries in the JSX is the design document for 'what stays usable when this part breaks' — reviewable, like the Suspense reveal story of Lesson 9.2."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Boundaries need a reset path, or the first error is permanent.** A boundary that catches and shows a fallback forever is often worse than the crash — the user is stuck on 'something went wrong' with no way out even if the cause was transient (a flaky request, a since-fixed state). Give fallbacks a *retry* that clears the boundary's error state (re-attempting the subtree render) and, crucially, reset on relevant changes: react-error-boundary's `resetKeys` re-attempts when a dependency changes (e.g. the user navigates, or the id that failed changes), so a boundary that failed for product #7 automatically retries when the user views product #8 instead of staying broken. The pattern mirrors Suspense's retry-on-resolve: a failure region should be *recoverable*, not a dead end. Pair every boundary with 'how does the user get out of this?' — retry button, reset-on-navigation, or reset-on-input-change."
            },
            {
              "type": "decision",
              "heading": "Which failure mechanism? — match the tool to where the error lives",
              "rows": [
                ["Throw during a descendant's render/lifecycle (null deref, bad data)", "Error boundary — contain the subtree, show a fallback with a reset path"],
                ["Error in an event handler (onClick parse/throw)", "try/catch → set an error state → render it inline (boundary won't catch it)"],
                ["Error in async code (fetch .then, setTimeout, await)", "catch at the async site → Unit-4 failure state, or the bridge (throw-in-render) to reach a boundary"],
                ["Data not ready yet (pending fetch)", "Suspense boundary — the loading fallback (Lesson 9.2), not an error boundary"],
                ["Expected operation failure (network 500, validation, declined)", "Modeled error STATE with tailored recovery UX — not a boundary fallback"],
                ["Unexpected crash anywhere (the bug you didn't foresee)", "App-level error boundary as the last resort — never a blank white screen"]
              ]
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For each error, state whether an error boundary catches it and what the correct handling is: (a) a component reads user.profile.name where profile is null during render; (b) an onClick handler calls JSON.parse on malformed input and throws; (c) a fetch .then callback throws because the response shape changed; (d) a useEffect's cleanup throws; (e) the error boundary's OWN fallback component throws.",
                  "solution": "(a) CAUGHT — a render-phase throw (null deref while rendering); the nearest boundary shows its fallback. Better: fix the null-safety (optional chaining / a loading state), but the boundary is the net for the ones you miss. (b) NOT caught — event handlers run outside render; wrap in try/catch and set an error state to render a message ('couldn't parse input'). (c) NOT caught — async callback, outside the render call stack; catch in the .then/await, route to a failure state (Unit 4/9), or use the bridge pattern (setState-then-throw-in-render) to send it to a boundary if you want boundary handling. (d) CAUGHT-ish but special — cleanup runs during the commit phase; a throwing cleanup is caught by a boundary (it's part of React's controlled lifecycle), though it indicates a bug to fix (cleanups should be defensive). (e) NOT caught by that boundary — a boundary can't catch its own render; the error propagates to the NEXT boundary up (hence keep fallbacks dead-simple and defensive — a fallback that can throw defeats the boundary). The organizing rule: render/lifecycle throws → boundary; handler/async throws → try/catch + state.",
                  "hint": "For each, ask: is React on the call stack (render/lifecycle) or not (handler/async)? And a boundary never catches itself."
                },
                {
                  "prompt": "Explain why React unmounts the whole tree on an uncaught render error rather than just the failing component, and use that reasoning to justify where you'd place boundaries in an app with a nav bar, a main content area, and a payment sidebar.",
                  "solution": "React can't bound the corruption from a failed render: a component that threw may have left React's internal bookkeeping for that subtree inconsistent, and rendering the SIBLINGS of a failed component might show UI that depended on invariants the failure violated — a partially-rendered tree risks showing wrong/dangerous content (a payment total missing, a permission check that failed open). A blank screen is a safe failure; a subtly-wrong one is not — so absent a boundary, React chooses safety and unmounts everything. This justifies placement by BLAST RADIUS and SENSITIVITY: wrap the whole app in a last-resort boundary (never fully blank); give the nav its own region so content crashes don't kill navigation (the user can still leave); wrap main content in its own boundary (its bugs don't touch nav or payment); and wrap the payment sidebar in its OWN boundary with an especially careful fallback — precisely because payment is sensitive, you never want a content-area bug to render a broken payment UI, and you never want a payment bug to blank the whole app mid-transaction. Boundaries turn 'any error blanks everything' into 'each region fails independently with a designed fallback' — placement encodes which failures must stay isolated from which.",
                  "hint": "Why is a partial tree dangerous? Then map 'must not be corrupted by others' failures' onto boundary placement."
                },
                {
                  "prompt": "A team wraps their entire app in ONE top-level error boundary and considers error handling 'done'. Critique this against the contract, construct the user experience of three different failures under it, and prescribe the better structure.",
                  "solution": "One top boundary catches only render/lifecycle throws and treats the whole app as a single blast radius — every uncaught render error blanks the ENTIRE app to one fallback, and it catches NONE of the handler/async errors that are most of a real app's failures. Three failures under it: (1) a deep chart component null-derefs during render → the whole app (nav, content, everything) is replaced by the app-crash screen for a one-widget bug — massive over-containment. (2) A save button's fetch rejects → NOT caught at all (async in a handler); if the code didn't try/catch it, the promise rejection is unhandled and the user sees nothing happen — a silent failure the boundary was falsely assumed to cover. (3) A form validation throw in an onChange → also uncaught (handler); silent or console-only. So the single boundary both over-reacts to render bugs and misses the majority of real errors. Better structure: (a) granular boundaries per independent region (widgets, routes) so render bugs fail locally, plus the top boundary as last resort; (b) model EXPECTED failures (network, validation, declined ops) as Unit-4 error STATES caught in handlers/effects and rendered inline with tailored recovery UX — not routed through boundaries at all; (c) retry/reset paths on every fallback. 'One boundary = done' conflates the safety net for unexpected render bugs with the (separate, larger) job of handling expected operational failures.",
                  "hint": "What does one boundary over-contain, and what whole category does it entirely miss? Two different jobs are being conflated."
                },
                {
                  "prompt": "Design the complete failure contract for a widget that fetches data (Suspense), can crash on render (boundary), and has a 'refresh' button whose fetch can fail (handler). Show the JSX composition and explain what each layer catches, what the widget component itself must (and must not) contain, and how a transient failure recovers.",
                  "solution": "Composition: <ErrorBoundary fallback={(e, retry) => <WidgetError onRetry={retry}/>} resetKeys={[widgetId]}> <Suspense fallback={<WidgetSkeleton/>}> <DataWidget id={widgetId}/> </Suspense> </ErrorBoundary>. Layers: the Suspense boundary catches 'data not ready' → shows the skeleton (Lesson 9.2); the error boundary catches render/lifecycle throws in DataWidget (a null-deref, a bad-shape crash) → shows WidgetError with retry; the refresh button's fetch failure is NOT either boundary's job (async handler) → caught in the handler into a local error state rendered inline ('refresh failed, retry') so the existing data stays visible. What DataWidget MUST contain: the refresh handler's try/catch + error state (its own operation's expected failure). What it must NOT contain: a loading branch (Suspense owns that — it reads data via use()/a suspense query assuming success) or a render-time try/catch for unexpected crashes (the boundary owns that) — the component is written for the happy path, with the two boundaries absorbing not-ready and crashed. Transient recovery: the boundary's retry re-attempts the subtree render; resetKeys={[widgetId]} auto-recovers when the user switches widgets (a failure for id 7 doesn't persist onto id 8); the refresh error state clears on a successful retry. Every non-success path — loading, crash, failed-refresh — has a designed, recoverable response, and the component stays simple because the structure absorbs the complexity.",
                  "hint": "Three failure modes, three mechanisms: Suspense (not ready), boundary (crashed), handler-state (operation failed). What does each own, and what does that leave the component to do?"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "u10l3-i1",
              "front": "What happens by default when a component throws during render?",
              "back": "React unmounts the ENTIRE tree (blank app) — it can't bound the corruption, and a partial/wrong tree is more dangerous than a blank one. Error boundaries contain the blast to a subtree."
            },
            {
              "id": "u10l3-i2",
              "front": "What does an error boundary catch — and NOT catch?",
              "back": "Catches: throws during render, lifecycle, and constructors of its descendants. Does NOT catch: event handlers, async code (setTimeout/promises), SSR, or its own render — those need try/catch + error state."
            },
            {
              "id": "u10l3-i3",
              "front": "Why is the boundary scope render-phase only, and why is that correct?",
              "back": "React controls the call stack only during render, so it can catch only there — and render failures are the only ones that threaten tree integrity. Handler/async errors don't corrupt the tree; model them as failure states."
            },
            {
              "id": "u10l3-i4",
              "front": "The two error mechanisms and their division of labor?",
              "back": "Error boundaries for UNEXPECTED render crashes (bugs — contain + fallback). Modeled error STATES (Unit 4) for EXPECTED failures (network, validation, declined ops — inline recovery UX). Don't conflate them."
            },
            {
              "id": "u10l3-i5",
              "front": "The design parallel between Suspense and error boundaries?",
              "back": "Both replace a subtree with a JSX-declared fallback for a non-success render: Suspense catches 'not ready' (suspension), error boundaries catch 'failed' (throw). Placement = the region's failure/loading design."
            },
            {
              "id": "u10l3-i6",
              "front": "Why must every boundary have a reset path?",
              "back": "A fallback shown forever is worse than the crash for transient errors — give a retry (clears error state, re-attempts the subtree) and resetKeys (auto-recovers on relevant changes, e.g. navigation/id change). Recoverable, not a dead end."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "u10-check",
        "questions": [
          {
            "id": "u10q1",
            "type": "mcq",
            "prompt": "You want a <Button> that must be EITHER a link (href, no onClick) OR an action (onClick, no href), never both or neither. Which TypeScript construct enforces this at compile time?",
            "options": [
              "A single type with href?: string and onClick?: () => void — both optional",
              "A discriminated union of two prop shapes, each using `?: never` to forbid the other's field",
              "A runtime check in the component body that throws if both or neither is present",
              "Marking both href and onClick as required"
            ],
            "answer": 1,
            "explanation": "A discriminated union — { href: string; onClick?: never } | { onClick: () => void; href?: never } — makes 'both' match no arm (each arm's `never` rejects the other's field) and 'neither' match no arm (each requires its own field): illegal combinations fail to type-check. Two optionals (a) permit both and neither; a runtime throw (c) catches it too late, at runtime, not compile time; both-required (d) forbids the valid single-field calls. This is Unit 4's unrepresentability principle at the component interface.",
            "points": 1
          },
          {
            "id": "u10q2",
            "type": "short",
            "prompt": "Testing Library's guiding principle: the more your tests resemble the way your software is ______, the more confidence they give you. (One word.)",
            "accept": [
              "used",
              "being used"
            ],
            "explanation": "Resemble the way the software is USED: query by role/label/text as users perceive elements, drive real user events, assert on the visible DOM. Such tests survive refactors that preserve behavior and catch bugs that change what the user sees — the opposite of implementation tests that break on harmless changes and miss real regressions.",
            "points": 1
          },
          {
            "id": "u10q3",
            "type": "multi",
            "prompt": "Which errors does a React error boundary catch? (Select all that apply.)",
            "options": [
              "A null dereference thrown while a descendant component is rendering",
              "An error thrown inside an onClick handler",
              "An error thrown in a setTimeout or promise .then callback",
              "An error thrown in a descendant's constructor or lifecycle method",
              "An error thrown by the error boundary's own fallback render"
            ],
            "answer": [
              0,
              3
            ],
            "explanation": "Boundaries catch throws during rendering, lifecycles, and constructors of DESCENDANTS — (a) and (d). They do NOT catch event-handler errors (b) or async-callback errors (c), which run outside React's render call stack (handle with try/catch + error state), nor their OWN render errors (e), which propagate to the next boundary up. The scope is exactly the render phase, because that's where React controls the stack and where tree corruption can occur.",
            "points": 2
          },
          {
            "id": "u10q4",
            "type": "open",
            "prompt": "A team's <CheckoutForm> test suite: mocks useCheckout (the form's own hook), asserts the internal `status` state equals 'submitting' after clicking pay, mocks the <OrderSummary> child, and checks that a `validate` function was called. The suite is fast, 100% green, and 'passed' a release where users could not actually complete checkout (the pay button's onClick was wired to the wrong handler, and the success message never rendered). Diagnose why a green suite shipped a broken checkout, then rewrite the strategy: what to test behaviorally, where to mock, and how the rewrite would have caught this exact bug.",
            "rubric": [
              "Diagnoses implementation-testing: asserting internal `status` state and that `validate` was called tests wiring the user never sees; mocking the form's own hook and child removes the real integration where the bug lived (onClick → handler → visible success)",
              "Explains the specific miss: the test never clicked the real button through to a rendered outcome, so a mis-wired onClick and a non-rendering success message are both invisible to state-level assertions — green suite, broken feature",
              "Rewrites behaviorally: render the real CheckoutForm (real hook, real OrderSummary), drive it with userEvent (fill fields, click pay), assert user-visible outcomes (validation messages, success confirmation) with findBy* for the async result",
              "Correct mock boundary: mock only the network (MSW/fetch) and external SDKs (payment), not the component's own hook or child; states how the behavioral test catches the exact bug (clicking pay would not produce the success message → red)"
            ],
            "solution": "Diagnosis: the suite tests implementation, not behavior. Asserting status === 'submitting' checks an internal state variable that can be perfectly correct while the button is wired to the wrong handler and the success UI never renders — the state and the user's experience are decoupled, and the test only looked at the state. Mocking useCheckout (the form's own hook) and OrderSummary (its child) removes exactly the integration where the bug lives: whether the REAL onClick calls the REAL handler that drives the REAL rendered outcome. Checking that `validate` was called asserts a function invocation, not that the user sees a validated, submittable, succeeding form. So every assertion passed while the feature was broken, because none of them clicked the actual button through to an actual visible result — the suite is fast and green precisely because it isn't testing the thing that broke. Rewrite: render <CheckoutForm/> with its real hook and real OrderSummary; mock only the boundaries — the payment/order network via MSW and the payment SDK. Then drive the user story: fill the fields with userEvent, click the real 'Pay' button (getByRole('button', { name: /pay/i })), and assert the user-visible outcomes — validation errors appear for bad input, and on success await screen.findByText(/order confirmed/i). How it catches THIS bug: the mis-wired onClick means clicking 'Pay' produces no submission, so the success message never appears — findByText times out — RED; and if the success message simply never renders despite a correct submit, the same assertion fails. The behavioral test asserts the exact thing the user couldn't do (complete checkout and see confirmation), so it goes red precisely when checkout breaks, which is the entire point of the suite. The old suite optimized for speed and isolation and bought zero confidence; the rewrite is slightly slower and catches the release-blocking bug.",
            "explanation": "The canonical parable of implementation testing: a green suite shipping a broken critical path because every assertion looked at internals instead of the user's outcome. The grader wants the causal chain (state ≠ experience; mocking own code removes the buggy integration) and a rewrite that mocks only boundaries and asserts user-visible results.",
            "points": 3
          },
          {
            "id": "u10q5",
            "type": "open",
            "prompt": "Design the complete robustness strategy for a data-table feature: server-fetched rows (can be slow or fail), inline row editing with a typed reducer (draft/saving/error per row), a bulk-delete action (network mutation), and rows that occasionally crash rendering on malformed data. Integrate all three of this unit's tools — types, tests, error handling — plus the relevant machinery from Units 4/9. Specify: the type-level design, the failure-handling architecture (boundaries vs modeled states), and the test plan (what at each level).",
            "rubric": [
              "Types: discriminated-union row state (idle/editing/saving/error with per-variant payload) and action union with an exhaustive reducer (assertNever); precise row-data types with runtime validation at the fetch boundary (schema.parse) rather than `as`, since rows are external data",
              "Failure architecture — modeled states (expected): edit-save failures and bulk-delete failures are handler/async errors → caught into Unit-4 error states rendered inline with retry (not boundaries); loading via Suspense; per-row error status in the reducer",
              "Failure architecture — boundaries (unexpected): per-row (or per-region) error boundaries to contain render crashes from malformed data so one bad row doesn't blank the table, with reset paths; app-level boundary as last resort; explains render-crash vs operation-failure division",
              "Test plan across levels: pure tests for the reducer (each transition, exhaustiveness) and any validators; behavioral tests for edit/save/delete flows via userEvent with MSW-mocked network (including the fetch-race and failure paths, findBy* for async); a deliberate malformed-row test asserting the boundary contains the crash; mocks only at network/SDK boundaries"
            ],
            "solution": "Types: model per-row edit state as a discriminated union — type RowState = { status: 'view' } | { status: 'editing'; draft: Row } | { status: 'saving'; draft: Row } | { status: 'error'; draft: Row; error: string } — and actions as a union (EDIT/CHANGE/SAVE/RESOLVE/REJECT/CANCEL); the reducer switches on status with assertNever(action) in default so a new action is a compile error (Unit 4's totality, enforced by Unit 10.1). Row DATA is external, so validate at the fetch boundary — RowsSchema.parse(await res.json()) — giving a checked type instead of an `as` assertion that would let malformed rows through to crash rendering. Failure architecture, split by expected vs unexpected: EXPECTED failures are modeled states — a save that rejects transitions the row's reducer to { status: 'error', error } rendered inline ('save failed, retry') with the draft preserved (the user's edit isn't lost); bulk-delete failure is a handler-caught error state showing a toast/inline message with retry; loading is Suspense (skeleton). UNEXPECTED failures — a row crashing on malformed data despite validation (a shape the schema missed, a formatter throwing) — are contained by a per-row (or per-visible-region) error boundary so one bad row shows a compact 'row failed to render' cell while the rest of the table stays fully usable, with resetKeys on the row id so navigating/editing recovers; an app-level boundary is the last resort. The division: operation failures (network, validation) are states with designed recovery UX; render crashes are boundary-contained bugs. Test plan by level: (1) pure/fast — the reducer (assert every transition and that illegal states can't be built; exhaustiveness), plus validators — no DOM needed. (2) behavioral (Testing Library + MSW) — edit a row and save (assert the row shows saved data via findBy*), save-failure path (assert inline error + preserved draft + retry works), bulk-delete (select rows, confirm, assert they're gone or the failure message shows), and the fetch-race if rows refetch (deterministic mock ordering per Unit 9). (3) a deliberate malformed-row test — feed the table a row that crashes rendering and assert the error boundary's fallback appears for THAT row while sibling rows still render (containment verified, not hoped). Mock only network (MSW) and any external SDK; run the real reducer, real rows, real boundaries. Coverage check: types make illegal row states/actions uncompilable and validate external data; modeled states handle expected failures with recovery; boundaries contain unexpected crashes; tests assert user-visible behavior at every level and prove the containment. Each of the unit's three tools covers what the others can't — types prevent, tests detect, boundaries contain.",
            "explanation": "The unit's capstone: types (prevent illegal states + validate boundaries), tests (behavioral, boundary-mocked, per-level), and error handling (modeled states for expected failures, boundaries for unexpected crashes) composed into one feature's robustness strategy — integrated with Unit 4's state machines and Unit 9's async. The grader rewards the expected/unexpected division and a test plan that asserts behavior and containment, not internals.",
            "points": 4
          },
          {
            "id": "u10q6",
            "type": "mcq",
            "prompt": "Why does asserting on a component's state immediately after triggering an update (without act/findBy) produce a 'not wrapped in act(...)' warning and risk a flaky test?",
            "options": [
              "act() is a performance optimization; the warning is advisory and the test is reliable",
              "The update schedules a batched render and effects that haven't flushed yet, so the assertion may read a mid-update tree the user never sees — act/findBy settle pending work first",
              "React requires all tests to use class components for state assertions",
              "The warning means the component has a memory leak that must be fixed before testing"
            ],
            "answer": 1,
            "explanation": "State updates schedule batched renders + effects (Units 1/3); before React flushes them, the DOM is in a state between the trigger and the committed result — a moment the user never observes, and one the settling may change after your assertion (false green) or that fires an effect error the test misses. act() (and userEvent/findBy*, which wrap it) flushes and settles all pending work so assertions run against the committed frame the user actually sees. The distractors misframe act as optional (a), invent a class requirement (c), or misread the warning as a leak (d).",
            "points": 1
          }
        ]
      }
    },
  ],
};
