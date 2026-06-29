// Entrepreneurship (founder track) — graduate / MBA level, anchored in MIT's
// Disciplined Entrepreneurship (Aulet, 15.390), Steve Blank's Customer
// Development, Ries's Lean Startup, Moore's Crossing the Chasm, and the YC canon.
//
// Rigor here is judgment graded against operator rubrics (`open` questions, see
// lib/grader.js) plus a verifiable quantitative spine (market sizing, unit
// economics). Unit 1 of 9 is complete; units 2–9 follow.

export const entrepreneurship = {
  id: "entrepreneurship",
  title: "Entrepreneurship: Building a Startup",
  subject: "Business",
  difficulty: "Graduate / MBA",
  description:
    "The disciplined, evidence-based founder's path from a raw idea to a scalable company — anchored in MIT's Disciplined Entrepreneurship, Lean Startup, and Customer Development. The judgment is graded against operator rubrics, not multiple choice.",
  sources: [
    "Bill Aulet — Disciplined Entrepreneurship (MIT 15.390)",
    "Steve Blank — The Startup Owner's Manual / Customer Development",
    "Eric Ries — The Lean Startup",
    "Geoffrey Moore — Crossing the Chasm",
    "Y Combinator — Startup School",
  ],
  grader:
    "You are a sharp, experienced startup operator and entrepreneurship professor in the mold of MIT 15.390 (Disciplined Entrepreneurship), Steve Blank, and Y Combinator partners. Grade like an investor or operator who has seen these mistakes a thousand times: reward specific, evidence-based, customer-grounded reasoning and correct use of the frameworks (beachhead market, jobs-to-be-done, TAM/SAM/SOM, unit economics); penalize vague generalities, buzzwords, top-down hand-waving, and answers that dodge the hard question. A confident but generic answer should score low.",
  units: [
    {
      id: "e1",
      title: "Markets & Customers",
      summary: "Pick a beachhead, know exactly who the customer is, and size the market from the bottom up.",
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e1l1",
          "title": "Market Segmentation & the Beachhead",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Why the market is the bet",
              "body": "Across post-mortems of failed startups, the most common cause is not that the technology didn't work — it's that **nobody wanted it**. CB Insights' running analysis of why startups die puts *\"no market need\"* at or near the top, cited in roughly 35–42% of cases, ahead of running out of cash or being out-competed. The implication is sharp: your dominant risk is **market risk**, not technical risk. So the first discipline of building a company isn't the product — it's deciding *who, exactly, the customer is and why their need is urgent.* Everything downstream — the product, the pricing, the pitch — is a consequence of that choice. The cardinal sin is the opposite instinct: defining the market broadly (\"everyone who eats\", \"all small businesses\") because breadth feels ambitious. Breadth is, in fact, usually fatal."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Beachhead market",
              "statement": "A **beachhead market** is a single, narrow, *homogeneous* customer segment that a startup targets **first**, with the explicit goal of winning a dominant (near-100%) share before expanding. The term is borrowed from amphibious warfare: rather than assault the whole coastline at once, you seize one defensible beach, consolidate strength, and advance inland from there. Concretely, a beachhead is **one end user, doing one job, reachable through one channel**, for whom you can build a complete solution."
            },
            {
              "type": "text",
              "heading": "Segmentation: diverge wide, then commit narrow",
              "body": "Choosing the beachhead is a two-phase move (Aulet's *Disciplined Entrepreneurship*, Steps 1–3). **First diverge:** brainstorm six to twelve candidate end-user markets — distinct combinations of *who* the user is and *what* job they hire you for — and resist falling in love with the first. **Then converge:** through primary customer research (talking to real people, not guessing at a whiteboard), score the candidates and pick exactly one. The discipline is to widen the option set *before* you narrow it, so the final beachhead is deliberately **selected**, not accidentally defaulted into."
            },
            {
              "type": "decision",
              "heading": "The six criteria of a strong beachhead",
              "rows": [
                [
                  "Reachable",
                  "A concrete, affordable channel exists to *find and sell to* these customers — a list, a community, an event. 'Everyone online' is not a channel."
                ],
                [
                  "Compelling reason to buy *now*",
                  "An urgent, funded problem they are actively trying to solve — a painkiller, not a vitamin."
                ],
                [
                  "Whole product is deliverable",
                  "With the resources you actually have, you can solve their need *end to end* — not 80% of it. A half-solution to a real job loses to the status quo."
                ],
                [
                  "Willing & able to pay",
                  "Budget exists *and* the value clearly exceeds the price, so the purchase is an easy yes for whoever controls the money."
                ],
                [
                  "Homogeneous",
                  "Customers share needs and, crucially, *talk to each other* — a tight word-of-mouth network, so each win seeds the next."
                ],
                [
                  "Has follow-on markets",
                  "Adjacent segments to expand into after you win here, sharing product, references, or a similar job — your second beach."
                ]
              ]
            },
            {
              "type": "example",
              "heading": "Scoring three candidate segments",
              "body": "A team building a scheduling tool narrowed a long brainstorm to three finalists and scored each against the criteria:\n\n• **Independent hair salons** — reachable (salon-software directories, trade groups ✓), urgent (no-shows are direct lost revenue ✓✓), whole product deliverable ✓, willing to pay ($50/mo is trivial next to one recovered booking ✓), highly homogeneous and chatty (owners swap tool tips in Facebook groups ✓✓), follow-on to barbers and spas ✓.\n• **Hospital radiology departments** — huge budgets, but a 9-month sales cycle, committee buying, and HIPAA make the *whole product* undeliverable for a seed-stage team (✗ reachable now, ✗ deliverable now).\n• **\"Small businesses\" in general** — fails on homogeneity: a law firm and a food truck share almost no needs, so there is no compounding word-of-mouth and no single channel.\n\nThe salons win — not because the market is biggest (it isn't), but because it scores highest on **dominability**. You can actually *own* it."
            },
            {
              "type": "text",
              "heading": "Why focus compounds",
              "body": "The payoff of a homogeneous beachhead isn't just clearer messaging — it's an **acquisition advantage that compounds**. When customers share a context and a network, each satisfied customer becomes a reference that lowers the cost of winning the next. In a diffuse \"everyone\" market your customers are strangers to one another, referrals barely flow, and every acquisition is paid for from scratch. Focus is what turns word-of-mouth from a rounding error into your cheapest channel — and we can make that precise."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The referral economics of a homogeneous beachhead",
              "statement": "Suppose you pay to acquire one customer, and within a homogeneous segment each acquired customer brings, on average, **r** further customers by referral (each of whom also refers at rate r, and so on), with 0 ≤ r < 1. Then one paid acquisition ultimately yields 1/(1 − r) customers, so the **effective** cost per customer is (1 − r) times the paid cost. As the segment's internal connectedness r rises toward 1, effective CAC collapses toward zero.",
              "proof": "One paid customer refers r customers in the first generation; those refer r·r = r² in the second; and so on. The total number of customers seeded by the single paid acquisition is the geometric series\n\n  1 + r + r² + r³ + ⋯ = Σ_{k=0}^{∞} rᵏ = 1/(1 − r),  which converges because 0 ≤ r < 1.\n\nIf the paid acquisition costs C, it is amortized over 1/(1 − r) customers, so the effective cost per acquired customer is\n\n  CAC_eff = C / (1/(1 − r)) = C·(1 − r).\n\nIn a diffuse market r ≈ 0 and CAC_eff ≈ C; in a tightly networked beachhead with r = 0.5, CAC_eff is halved; at r = 0.8 it is one-fifth of the paid cost. ∎\n\nThis is the same geometric-series engine behind the viral coefficient (Unit 6). **Homogeneity is precisely what makes r large** — which is why a tightly connected beachhead is cheaper to win than a scattered market of the same size."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Boiling the ocean.** \"Our market is everyone\" means no focus: no reference customers, no compounding word-of-mouth, and a product that half-serves everybody and fully serves no one. Narrow the target until it feels almost uncomfortably small — then go dominate it."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A beachhead segment has referral rate r = 0.6 and a paid acquisition cost of $200 per customer. Using the referral model, what is the effective CAC?",
                  "solution": "Each paid customer seeds 1/(1 − 0.6) = 1/0.4 = 2.5 customers, so the $200 is spread over 2.5 customers: CAC_eff = $200 × (1 − 0.6) = $80. (Check: $200 / 2.5 = $80.)"
                },
                {
                  "prompt": "Score the segment 'all college students' as a beachhead against the six criteria, and name its single biggest weakness.",
                  "hint": "Start with the criterion about shared needs and word-of-mouth.",
                  "solution": "It fails hardest on **homogeneity**: a pre-med, an art major, and an engineering student share few needs and barely overlapping networks, so word-of-mouth doesn't compound — and 'all students' isn't reachable as one channel. A defensible narrowing: 'first-year students in a single university's engineering program', who share courses, deadlines, and a dense social graph, making referrals compound."
                },
                {
                  "prompt": "A founder insists their beachhead is 'U.S. retail.' Give two concrete reasons this is not a beachhead, and one reframing that is.",
                  "solution": "(1) Not homogeneous — a national grocery chain and a single boutique have opposite needs, budgets, and buying processes. (2) Not reachable through one channel. A reframing: 'independent specialty-coffee roasters with 1–3 retail locations in the Pacific Northwest' — homogeneous, reachable via roaster trade communities, with a shared urgent job (freshness/inventory)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e1l1-i1",
              "front": "Why do most startups fail?",
              "back": "They build something nobody wants — a market/customer failure ('no market need'), not usually a technology one. Market risk dominates technical risk."
            },
            {
              "id": "e1l1-i2",
              "front": "What is a beachhead market?",
              "back": "One narrow, homogeneous segment you target first to win near-100% share before expanding — one end user, one job, one channel, a complete product."
            },
            {
              "id": "e1l1-i3",
              "front": "The six beachhead criteria?",
              "back": "Reachable; compelling reason to buy now; whole product deliverable; willing & able to pay; homogeneous; has follow-on markets."
            },
            {
              "id": "e1l1-i4",
              "front": "Referral economics: effective CAC if each customer refers r more?",
              "back": "One paid customer seeds 1/(1−r) total, so CAC_eff = C·(1−r). Homogeneity makes r large → cheaper acquisition."
            },
            {
              "id": "e1l1-i5",
              "front": "Segmentation discipline in one line?",
              "back": "Diverge wide (brainstorm 6–12 candidate segments), then converge narrow (research and pick exactly one). Select the beachhead, don't default into it."
            },
            {
              "id": "e1l1-i6",
              "front": "Why does focus compound?",
              "back": "A homogeneous segment shares a network, so each win produces references that lower the cost of the next acquisition — word-of-mouth becomes the cheapest channel."
            }
          ]
        },
        {
          "id": "e1l2",
          "title": "Who Is the Customer, Exactly?",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Three people hide inside 'the customer'",
              "body": "\"The customer\" is rarely one person. Especially in B2B, the human who **uses** the product, the one who **pays** for it, and the people who can **approve or veto** the purchase are usually different people with different incentives. A product the end user loves but the economic buyer won't fund dies in procurement; one the buyer mandates but users ignore dies in adoption. Before you can sell, you have to map every role in the decision — and design for all of them."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The Decision-Making Unit (DMU)",
              "statement": "The **Decision-Making Unit** is the set of people involved in a single purchase decision. The core roles (Aulet, Step 12): the **end user** (uses the product), the **economic buyer** (controls the budget and signs), and the **champion** (the internal advocate who wants it bought) — plus **influencers**, **gatekeepers**, and anyone with **veto** power (often IT, legal, security, or procurement). In a consumer purchase the roles can collapse onto one or two people, but they still exist: the partner who vetoes, the child who is the user, the friend who influences."
            },
            {
              "type": "text",
              "heading": "Jobs to be done",
              "body": "Clayton Christensen's reframing: customers don't \"buy products\", they **hire** them to make progress on a **job** in a particular circumstance. The classic line — people don't want a quarter-inch drill, they want a quarter-inch hole; and really, a shelf; and really, a tidy home. A job has **functional**, **emotional**, and **social** dimensions. To understand demand, ask what job the customer is trying to get done, and what they currently \"fire\" (the status quo, a competitor, a spreadsheet, doing nothing) to \"hire\" you. Sell the job, not the feature list."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Job to be done",
              "statement": "A **job to be done** is the progress a customer is trying to make in a given circumstance — the functional task together with its emotional and social dimensions — *independent of any particular product*. Products are **hired** to do jobs and **fired** when something does the job better. A job statement has the form: **\"When [situation], I want to [motivation], so I can [expected outcome].\"**"
            },
            {
              "type": "example",
              "heading": "The milkshake job (Christensen)",
              "body": "A fast-food chain tried to lift milkshake sales by improving the product — thicker, sweeter, more flavors — to no effect. The breakthrough came from asking *what job the milkshake was hired for*. Nearly half were bought before 9am by lone commuters who \"hired\" a milkshake to make a long, dull drive bearable: it's filling, takes ~20 minutes to drink through a straw, and is mess-free in one hand. Its real competitors weren't other milkshakes — they were **bananas, bagels, and boredom**. The right improvements (make it even thicker; move it to a fast pre-pay line) are obvious *once you know the job*, and invisible while you're \"improving the product\" in the abstract."
            },
            {
              "type": "text",
              "heading": "From job to a concrete persona",
              "body": "Aulet's End User Profile turns the job into a **persona**: a single, named archetype standing in for the beachhead's typical user. Not \"millennials who like fitness\" but \"Marcus, 34, newly diagnosed Type-2 diabetic whose endocrinologist just handed him a diet plan he has no idea how to follow.\" A useful persona records a day in their life, the job they're hiring for, their **current workaround**, what they can pay, and the precise **trigger** that would make them switch. Decisively, it is assembled from real interviews — every field is a quote or an observation, never a whiteboard guess."
            },
            {
              "type": "decision",
              "heading": "Demographic vs. jobs/behavioral segmentation",
              "rows": [
                [
                  "Demographic — 'women 25–40, urban'",
                  "Easy to buy ads against, but two identical demographics can want opposite things. Weak predictor of need or message."
                ],
                [
                  "Jobs / behavioral — 'just got a diagnosis and a diet plan'",
                  "Predicts the actual purchase: shared job, shared urgency, shared workaround. Strong predictor of need, message, and channel."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Demographics lie.** \"Women, 25–40, urban\" tells you nothing about the job being hired for — two people with identical demographics can want opposite things. Segment by **job and behavior**, not by census category."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "For a SaaS tool that helps engineering teams manage on-call incidents, list the likely DMU roles and name a plausible veto player.",
                  "solution": "End user: on-call engineers. Champion: an SRE or eng lead who feels the 3am pain. Economic buyer: VP of Engineering (owns the budget). Influencers: the wider on-call rotation. **Veto player: Security/IT**, who can block any tool that ingests production logs without passing review. Selling only to the champion and ignoring security is exactly how deals die at the finish line."
                },
                {
                  "prompt": "Write a jobs-to-be-done statement ('When… I want to… so I can…') for someone buying a weeknight meal-kit subscription, and name what it competes with.",
                  "hint": "Capture functional AND emotional/social dimensions.",
                  "solution": "*When* I get home exhausted on a weeknight with no plan for dinner, *I want to* cook something healthy without deciding what to make or shopping for it, *so I can* eat well and feel like a competent adult without the mental load. It competes with **takeout and frozen pizza**, not just groceries — and the emotional 'competent adult' dimension is exactly what a 'feeds you' framing misses."
                },
                {
                  "prompt": "Critique this persona: 'Our user is a 28-year-old urban professional who values convenience.' What's missing?",
                  "solution": "It's a demographic, not a job. It states no circumstance, no specific job-to-be-done, no current workaround, no buying trigger, and no willingness to pay. 'Values convenience' fits nearly everyone and predicts nothing. A usable persona names the situation that creates urgency and what the person fires to hire you."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e1l2-i1",
              "front": "The Decision-Making Unit (DMU) roles?",
              "back": "End user, economic buyer, champion, plus influencers, gatekeepers, and veto players (IT/legal/security). Often different people, especially in B2B."
            },
            {
              "id": "e1l2-i2",
              "front": "Jobs-to-be-done, in one line?",
              "back": "Customers 'hire' a product to make progress on a functional/emotional/social job; understand the job and what they fire to hire you."
            },
            {
              "id": "e1l2-i3",
              "front": "Job statement template?",
              "back": "'When [situation], I want to [motivation], so I can [expected outcome].'"
            },
            {
              "id": "e1l2-i4",
              "front": "What is a persona / End User Profile?",
              "back": "A specific, named archetype built from interviews — their job, current workaround, budget, and switching trigger — not a demographic."
            },
            {
              "id": "e1l2-i5",
              "front": "Why are demographics weak segmentation?",
              "back": "Identical demographics can hide opposite jobs-to-be-done; segment by job and behavior, which predict the purchase."
            },
            {
              "id": "e1l2-i6",
              "front": "The milkshake lesson?",
              "back": "Improving 'the product' abstractly failed; identifying the job (a bearable commute, competing with bananas/boredom) revealed the right changes."
            }
          ]
        },
        {
          "id": "e1l3",
          "title": "Sizing the Market: TAM, SAM, SOM",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "TAM, SAM, SOM",
              "statement": "Three nested estimates of market size, all measured as **annual revenue**:\n**TAM** (Total Addressable Market) — total annual revenue if *every* possible customer bought from someone: 100% of conceivable demand.\n**SAM** (Serviceable Available Market) — the portion of TAM your business model, product, and geography can actually serve.\n**SOM** (Serviceable Obtainable Market) — the portion of SAM you can realistically capture in the near term given competition, sales capacity, and reach.\nBy construction, SOM ⊆ SAM ⊆ TAM."
            },
            {
              "type": "text",
              "heading": "Top-down is a fantasy; bottoms-up counts units",
              "body": "There are two ways to size a market. **Top-down** starts from a giant industry figure and asserts a share: \"the market is $50B, we'll get 2%.\" The 2% is conjured — it embeds no customers and no channel, so it's unfalsifiable and almost always wrong. **Bottoms-up** builds the number from countable units: identify the actual end users in your segment and multiply by what each pays per year. It forces you to know *who* the customers are and *how* you'd reach them — which is the entire point of sizing in the first place."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Bottoms-up market size and its segment additivity",
              "statement": "For a segment of N identifiable end users with mean annual revenue per user ARPU, the segment's annual market size is\n\n  TAM = N × ARPU.\n\nIf the market is partitioned into disjoint segments i with Nᵢ users at ARPUᵢ, then TAM = Σᵢ Nᵢ · ARPUᵢ. The serviceable and obtainable markets scale this by the fractions you can serve and win: SAM = s · TAM and SOM = σ · SAM = σ·s · TAM, with s, σ ∈ (0, 1].",
              "proof": "Annual market revenue is, by definition, the sum over every customer of that customer's annual category spend: TAM = Σ_{j=1}^{N} spendⱼ. Writing ARPU = (1/N) Σⱼ spendⱼ for the mean gives Σⱼ spendⱼ = N · ARPU, hence TAM = N · ARPU. For a partition into disjoint segments the outer sum splits over segments, TAM = Σᵢ Σ_{j∈i} spendⱼ = Σᵢ Nᵢ · ARPUᵢ — so you may (and should) size a mixed market segment by segment and add. SAM and SOM are by definition the serviceable fraction s and obtainable fraction σ of that revenue, so they multiply through. ∎\n\nThe additivity is the practical payoff: it licenses sizing each homogeneous sub-segment with its own ARPU instead of forcing one blended average over a market that isn't uniform."
            },
            {
              "type": "example",
              "heading": "Bottoms-up sizing, worked end to end",
              "body": "A team targets independent dental practices in the U.S. for a patient-reminder product.\n**Count users:** ~130,000 independent practices nationally; the beachhead is the ~20,000 in three states they can support at launch.\n**Revenue per user:** the product recovers ~$1,000/month of no-show revenue; priced at $200/month, ARPU = $2,400/year.\n**TAM** (all U.S. independents) = 130,000 × $2,400 = **$312M/year**.\n**SAM** (3 states, single language, compatible practice-management systems) ≈ 20,000 × $2,400 = **$48M/year** (s ≈ 0.15).\n**SOM** (realistically ~8% in three years, given two competitors and a 4-person sales team) = 0.08 × $48M = **$3.8M/year**.\nEvery figure traces to a countable set of practices at a defensible price — the opposite of \"1% of the $150B dental industry.\""
            },
            {
              "type": "text",
              "heading": "Triangulate: bottoms-up and top-down should reconcile",
              "body": "A bottoms-up estimate isn't automatically correct — it's just *falsifiable*. Sanity-check it against an independent top-down figure; the two should agree to within roughly an order of magnitude. If your bottoms-up TAM is $300M but the entire industry it sits inside is reported at $200M, you've double-counted or mis-defined the segment. If they differ by 100×, find the error before trusting either number."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Inverting the sizing formula: what a revenue goal demands",
              "statement": "To reach annual revenue R at average revenue per user ARPU, you must acquire and retain\n\n  N = R / ARPU\n\npaying users. Conversely, a fixed base of N users caps revenue at N · ARPU unless ARPU rises. Hence a revenue target is feasible only if R / ARPU ≤ (the obtainable user count implied by your SOM).",
              "proof": "Revenue equals paying users times annual revenue per user: Revenue = N · ARPU. Solving for the N required to hit a target R gives N = R / ARPU; holding N fixed, revenue is maximized at N · ARPU. Feasibility then requires the needed N to fit inside the obtainable market: R / ARPU ≤ N_SOM, where N_SOM = SOM / ARPU. ∎\n\nThis turns sizing into a planning test. A $10M goal at ARPU = $2,400 needs 10,000,000 / 2,400 ≈ 4,170 retained customers — a figure you can immediately check against your SAM and your sales capacity, instead of hiding behind \"2% of a huge market.\""
            },
            {
              "type": "decision",
              "heading": "Diagnosing a TAM that's the wrong size",
              "rows": [
                [
                  "A *beachhead* TAM in the billions",
                  "The segment is too broad — you're sizing the ocean, not the beach. Narrow until it's roughly $5M–$100M."
                ],
                [
                  "TAM too small for the outcome you need (e.g. < ~$50–100M, no follow-on)",
                  "Even total domination won't build a big company. You need credible follow-on markets, or a different beachhead."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**A beachhead TAM should feel small** — often $5M–$100M, not billions. A huge beachhead TAM usually means the segment is still too broad. You grow TAM later by capturing **follow-on markets**, not by defining the beachhead expansively from the start."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A segment has 45,000 reachable businesses; your product's ARPU is $3,600/year. Compute the bottoms-up TAM. If the serviceable share is s = 0.4 and the near-term obtainable share is σ = 0.1, compute SAM and SOM.",
                  "solution": "TAM = 45,000 × $3,600 = $162M/year. SAM = 0.4 × $162M = $64.8M/year. SOM = 0.1 × $64.8M = $6.48M/year."
                },
                {
                  "prompt": "You want $25M in annual revenue at an ARPU of $5,000/year. How many retained customers does that require — and what does it tell you if your entire SAM is only 3,000 customers?",
                  "hint": "Use N = R / ARPU, then compare to the available market.",
                  "solution": "N = R / ARPU = $25,000,000 / $5,000 = 5,000 customers. But the SAM is only 3,000, so $25M is **infeasible** at this ARPU and serviceable definition: you'd need to raise ARPU (to ≥ $8,334 to hit $25M from 3,000 customers) or expand the SAM. Inverting the formula exposes an impossible plan that a top-down '2% of a huge market' would have concealed."
                },
                {
                  "prompt": "A founder claims a $6B TAM by taking '1% of the $600B wellness industry.' Re-derive a credible TAM bottoms-up for a specific beachhead of your choosing, and explain why it's more trustworthy even though it's far smaller.",
                  "solution": "Pick a concrete segment — e.g. 'boutique Pilates studios in the U.S.': ~6,000 studios × ~$3,000/year for a class-management add-on = **$18M** bottoms-up TAM. It's ~300× smaller than $6B but trustworthy because every dollar maps to a countable, reachable studio at a defensible price, whereas '1% of $600B' embeds no customers, no channel, and no reason anyone buys. Dominating a real $18M beachhead (with follow-on to yoga/barre) beats an imaginary 1% of an industry."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e1l3-i1",
              "front": "Define TAM, SAM, SOM.",
              "back": "TAM: total annual demand at 100%. SAM: the slice your model/geography can serve. SOM: what you can realistically obtain near-term. SOM ⊆ SAM ⊆ TAM."
            },
            {
              "id": "e1l3-i2",
              "front": "Bottoms-up sizing formula (and segment form)?",
              "back": "TAM = N × ARPU; for mixed markets, TAM = Σᵢ Nᵢ·ARPUᵢ — size each homogeneous segment and add."
            },
            {
              "id": "e1l3-i3",
              "front": "Why is top-down sizing ('X% of a huge market') dangerous?",
              "back": "The percentage is asserted, not earned — it embeds no customers and no channel, so it's unfalsifiable and usually wrong."
            },
            {
              "id": "e1l3-i4",
              "front": "Invert sizing: customers needed for revenue R?",
              "back": "N = R / ARPU. Feasible only if N fits inside your obtainable market (N ≤ SOM/ARPU)."
            },
            {
              "id": "e1l3-i5",
              "front": "How should bottoms-up and top-down relate?",
              "back": "They should reconcile to within ~an order of magnitude; a 100× gap signals a double-count or mis-defined segment."
            },
            {
              "id": "e1l3-i6",
              "front": "How big should a beachhead TAM feel?",
              "back": "Small — often $5M–$100M. A billions-size beachhead TAM means the segment is too broad; grow via follow-on markets later."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e1-check",
        questions: [
          { id: "e1q1", type: "numeric", prompt: "A beachhead segment has 80,000 reachable end users, each worth about $300/year. What is the bottoms-up TAM, in dollars per year?", answer: 24000000, tolerance: 0, explanation: "80,000 × $300 = $24,000,000 per year." },
          { id: "e1q2", type: "mcq", prompt: "The beachhead-market strategy is to:", options: ["dominate one small, well-chosen segment first, then expand", "target the largest possible market immediately", "sell to anyone who will buy", "avoid all competition"], answer: 0, explanation: "Win one narrow segment fully — references and word-of-mouth — before broadening." },
          { id: "e1q3", type: "short", prompt: "In a B2B sale, the person who pays is the economic buyer; the person who actually uses the product day to day is the ____.", accept: ["end user", "user", "end-user", "enduser"], explanation: "User, economic buyer, and decision-makers are often different people." },
          { id: "e1q4", type: "numeric", prompt: "Your bottoms-up TAM is $24M/year and you estimate you can realistically obtain 5% of it near-term. What is your SOM, in dollars per year?", answer: 1200000, tolerance: 0, explanation: "0.05 × $24,000,000 = $1,200,000 per year." },
          {
            id: "e1q5",
            type: "open",
            points: 3,
            prompt: "A founder says: 'Our market is the $600B global wellness industry, and we only need 1% of it to build a huge company.' Critique this market definition and propose a more rigorous approach. Reference TAM/SAM/SOM and the beachhead concept.",
            rubric: [
              "Names the core error: '1% of a huge market' is a top-down assertion with no mechanism for who the customers are or how they are won.",
              "Argues for a specific, reachable beachhead segment instead of the whole industry.",
              "Invokes bottoms-up sizing (identifiable end users × revenue per user) over a top-down percentage.",
              "Distinguishes TAM/SAM/SOM and notes that early focus belongs on dominating a small SOM, not on the headline TAM.",
            ],
            solution:
              "The '1% of $600B' framing is the classic top-down fallacy: the 1% is conjured from a percentage with no account of who the customers are, why they would buy, or how you would reach them. A rigorous approach picks a single beachhead — a narrow, homogeneous segment you can actually identify, reach, and dominate — and sizes it bottoms-up: count the identifiable end users in that segment and multiply by realistic annual revenue per user. That bottoms-up figure is your near-term TAM; SAM is the slice your business model and geography can serve, and SOM is what you can realistically obtain in the next few years. Early on, winning ~100% of a small, dominable SOM beats 1% of a vague TAM, because focus produces reference customers, word-of-mouth within a tight community, and a complete product for one customer type — none of which a diffuse 'whole industry' strategy can deliver. The $600B is a number with no people behind it; replace it with a few thousand named, reachable customers.",
            explanation: "The fix is a specific beachhead sized bottoms-up — real customers and a real channel — not a percentage of an industry.",
          },
          {
            id: "e1q6",
            type: "open",
            points: 3,
            prompt: "You're building a meal-planning app. Define a specific beachhead market for it and justify your choice against at least four of the standard beachhead criteria (reachable, compelling reason to buy now, deliverable whole product, willing/able to pay, homogeneous, follow-on markets).",
            rubric: [
              "Names a SPECIFIC, narrow segment (a concrete role/context/persona) — not 'busy people' or 'the meal-planning market'.",
              "Justifies the choice against at least four beachhead criteria with real reasoning, not just listing the criteria.",
              "Shows the segment is homogeneous (shared needs and a tight word-of-mouth network) so early wins compound.",
              "Avoids the common failure modes: too broad, no reachable channel, or no compelling reason to buy now.",
            ],
            solution:
              "A strong answer names a specific segment — for example 'adults newly prescribed a dietitian-guided plan after a Type-2 diabetes diagnosis' or 'members of a CrossFit gym on a coach-prescribed cutting phase' — and defends it: (1) Reachable — there is a concrete channel (endocrinology clinics and diabetes educators, or gym coaches) to find them, unlike 'health-conscious people'. (2) Compelling reason to buy now — a medical or coach mandate creates urgency that a casual dieter lacks. (3) Whole product deliverable — the app can fully solve this narrow need (compliant macro targets, approved recipes, progress tracking) without boiling the ocean. (4) Willing and able to pay — health stakes or existing coaching fees signal real willingness to pay. The segment is also homogeneous, so references spread fast within the tight community, and it has obvious follow-on markets (adjacent conditions or other coached communities). A weak answer says 'health-conscious people 25–45' — too broad, no channel, no urgency, and no compounding word-of-mouth.",
            explanation: "Pick one concrete, reachable segment with urgency and a tight community — then defend it criterion by criterion.",
          },
        ],
      },
    },
    {
      id: "e2",
      title: "Value Proposition & MVP",
      summary: "Design and quantify the value you deliver, build the smallest thing that tests it, and recognize product-market fit.",
      prerequisites: ["e1"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e2l1",
          "title": "Designing & Quantifying the Value Proposition",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "A value proposition is a quantified promise",
              "body": "A value proposition is not a slogan — it is a **specific, measurable benefit** the customer receives relative to their best alternative. \"We make scheduling easy\" is a slogan. \"We recover ~$1,000/month of no-show revenue for a salon, for $50/month\" is a value proposition: it names the customer, the metric they care about, the magnitude, and the price. The discipline (Aulet, Steps 8 & 23) is to express value in the **customer's own units** — dollars, hours, conversion points, risk avoided — tied to the *one priority* the decision-maker is measured on."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Value proposition",
              "statement": "A **value proposition** states, for a specific end user and job, the quantified outcome of using your product **versus the status quo**: *as a result of your product, the customer's key metric moves from its current value to a better one, by a stated amount.* It is anchored to the customer's top priority (not to your features), measured in their units, and credible."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Quantified value and the value-based price ceiling",
              "statement": "If a product removes Q units of a costly problem per period (hours wasted, errors, lost sales) and each unit costs the customer v, the value delivered per period is V = Q · v. A rational economic buyer accepts a price P only if P < V; because switching carries friction and risk, buyers demand a margin of safety, so a common target is **P ≤ V/3** (a ≥ 3× value-to-price ratio). Value-based pricing therefore sets P as a fraction of V — never as cost-plus.",
              "proof": "The customer's net gain from adopting is (value received) − (price paid) = V − P. They will switch from the status quo only if this surplus is positive and beats their alternatives, so P < V is necessary. Switching also costs time, risk, and change-management, which buyers price in as a required margin of safety; empirically this lands around a 3–10× ratio, i.e. P ≤ V/3 makes the decision an easy \"yes.\" Since V = Q · v scales with the size of the problem, the *same* product is worth more to a customer with larger Q — which is precisely why you target the segment that feels the pain most acutely (the beachhead from Unit 1). Cost-plus pricing ignores V entirely and leaves money on the table when V ≫ cost, or prices you out when V is small. ∎"
            },
            {
              "type": "example",
              "heading": "Quantifying value, worked",
              "body": "A tool saves a mid-market customer **10 hours/month** of analyst time at a loaded labor cost of **$50/hour**.\nValue delivered: V = Q · v = 10 × $50 = **$500/month**.\nValue-based price ceiling for an easy sale: P ≤ V/3 ≈ **$166/month**. Pricing at, say, $149/month leaves the customer a ~3.4× return — an obvious purchase — while capturing far more than a cost-plus price (if the software costs you $20/customer to run, cost-plus might have charged $40 and left $460/month of value uncaptured on every account)."
            },
            {
              "type": "decision",
              "heading": "Feature vs. benefit vs. quantified value",
              "rows": [
                [
                  "Feature — 'real-time sync'",
                  "What the product *does*. Necessary to build, but it doesn't move a buyer."
                ],
                [
                  "Benefit — 'your team is always up to date'",
                  "What the feature *gives* the user. Better, but still unmeasured."
                ],
                [
                  "Quantified value — 'cuts reconciliation from 6 hrs to 30 min/week → ~$1,100/month saved'",
                  "The benefit *in the customer's units*. This is what justifies a price and closes a sale."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't sell features; don't even sell benefits — sell the quantified outcome.** If you can't put a number on the value in the customer's own metric, you don't yet understand the job well enough to price it, and the buyer will default to \"too expensive\" because there's nothing to weigh the price against."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A product reduces a retailer's monthly stockouts from 200 to 50, and each stockout costs ~$30 in lost margin. Compute the quantified monthly value, and a value-based price ceiling at P ≤ V/3.",
                  "solution": "Stockouts removed per month Q = 200 − 50 = 150, at v = $30 each: V = 150 × $30 = $4,500/month. Value-based ceiling: P ≤ $4,500 / 3 = $1,500/month. (Cost-plus pricing, ignorant of the $4,500 of value, would likely under-charge by an order of magnitude.)"
                },
                {
                  "prompt": "Critique this value proposition: 'Our AI platform leverages cutting-edge models to supercharge your workflow.' Rewrite it for a specific customer.",
                  "hint": "Name the customer, the metric, the magnitude, and the alternative.",
                  "solution": "It's pure feature-and-buzzword: no customer, no metric, no magnitude, no comparison to the status quo — so a buyer has nothing to weigh a price against. A rewrite: 'For support teams on Zendesk, we auto-draft replies that cut average handle time from 8 min to 3 min, letting a 10-agent team clear ~40% more tickets/day at the same headcount.' Now there is a customer, a measured metric, a magnitude, and an implicit ROI."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e2l1-i1",
              "front": "What makes a value proposition (vs a slogan)?",
              "back": "A specific, measured outcome vs the status quo, in the customer's units (dollars/hours/risk), tied to their top priority — not features."
            },
            {
              "id": "e2l1-i2",
              "front": "Quantified value formula and price ceiling?",
              "back": "V = Q · v (units of pain removed × value per unit). Buyers need P < V, and demand a margin of safety, so target P ≤ V/3."
            },
            {
              "id": "e2l1-i3",
              "front": "Why value-based pricing over cost-plus?",
              "back": "Price tracks the value V you create, not your cost. Cost-plus leaves money on the table when V ≫ cost and overprices when V is small."
            },
            {
              "id": "e2l1-i4",
              "front": "Feature vs benefit vs quantified value?",
              "back": "Feature = what it does; benefit = what the user gets; quantified value = the benefit measured in the customer's metric ($/time saved)."
            },
            {
              "id": "e2l1-i5",
              "front": "Why does the same product justify a higher price to some customers?",
              "back": "V = Q · v scales with the size of their problem (Q); the segment feeling the most pain values it most — target them."
            }
          ]
        },
        {
          "id": "e2l2",
          "title": "The Minimum Viable Product",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Minimum Viable Product (MVP)",
              "statement": "An **MVP** (Ries, *The Lean Startup*) is the *smallest* thing you can build that lets you begin the **Build–Measure–Learn** loop — i.e. test your riskiest assumption with real customers and obtain **validated learning** — for the least time and money. It is defined by the *question it answers*, not by a feature count: an MVP can be a landing page, a demo video, or a human doing the work manually behind the scenes. It is emphatically **not** \"version 1.0 with fewer features.\""
            },
            {
              "type": "text",
              "heading": "Build–Measure–Learn, and validated learning",
              "body": "The Lean Startup reframes a startup as an engine for **validated learning** under uncertainty. You hold a set of leap-of-faith assumptions (people have this problem; they'll pay; you can reach them). Each loop turn: **build** the minimum needed to test the riskiest one, **measure** real behavior, **learn** whether the assumption held, then pivot or persevere. The goal of the early company is to *maximize learning per dollar and per week* — not to maximize features shipped. An MVP is whatever minimizes the cost of one trip around that loop."
            },
            {
              "type": "text",
              "heading": "Test the riskiest assumption first",
              "body": "Not all assumptions are equal. Rank them by **(probability it's wrong) × (damage if it's wrong)** and test the top one first. If \"will anyone pay?\" is the assumption most likely to kill you, a landing page with a price and a \"Buy\" button tests it in days — building the actual product first would be answering an easier question expensively. The MVP is chosen by *which assumption it retires*, which is why a fake door or a concierge can be a better MVP than working software."
            },
            {
              "type": "decision",
              "heading": "Common MVP types",
              "rows": [
                [
                  "Landing-page / fake-door",
                  "Tests demand: a page describing the product with a sign-up or pre-order. Measures whether anyone wants it before you build it."
                ],
                [
                  "Concierge",
                  "You deliver the service manually, by hand, for a few customers. Tests whether the solution actually solves the job, with no automation."
                ],
                [
                  "Wizard of Oz",
                  "The front end looks automated; humans do the work behind the curtain. Tests the experience and demand without building the engine."
                ],
                [
                  "Single-feature / piecemeal",
                  "One core feature (or stitched-together existing tools) that delivers the central value, nothing else."
                ]
              ]
            },
            {
              "type": "example",
              "heading": "Two famous MVPs",
              "body": "**Dropbox** couldn't easily demo file-sync (it required deep OS integration and infrastructure), so before building it Drew Houston posted a **3-minute video** showing how it would work. The beta waitlist jumped from 5,000 to 75,000 overnight — validated demand for almost zero engineering. **Zappos** tested whether people would buy shoes online by photographing inventory at local stores and, when an order came in, *buying the shoes at retail and shipping them by hand* (a concierge/Wizard-of-Oz MVP). Neither built the \"real\" product first; both bought a decisive answer cheaply."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The 9-month \"fully-featured app\" is the anti-MVP.** Spending three quarters building before any customer contact maximizes the cost of being wrong — you learn whether anyone wanted it only after you can no longer afford to change course. If you can't name the single assumption your build will test, you're building a product, not an MVP."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You believe dog owners will pay for a monthly box of vet-curated supplements, but you're unsure they'll subscribe rather than buy ad hoc. Design an MVP that tests the riskiest assumption without building fulfillment.",
                  "hint": "What single assumption, if false, kills the business — and what's the cheapest way to test exactly that?",
                  "solution": "The riskiest assumption is willingness to commit to a *subscription*. A landing-page/fake-door MVP: a page describing the box with a real monthly price and a 'Subscribe' button that collects payment details (or a pre-order). Measure the conversion from visitors to subscription intent. If you want to also test fulfillment value, run it **concierge**: for the first 10 sign-ups, hand-assemble and mail boxes yourself. Both retire the demand question before any logistics are built."
                },
                {
                  "prompt": "A founder says 'our MVP is a polished iOS + Android app with payments, social feed, and AI recommendations, shipping in 9 months.' Explain why this is not an MVP and what they should do instead.",
                  "solution": "It's a full product, not an MVP: it tests no single assumption cheaply and maximizes the cost of being wrong (9 months and a large build before any validated learning). Worse, it bundles several risky assumptions (demand, retention, willingness to pay, the value of AI recs) so a failure won't even tell them *which* assumption was wrong. Instead: identify the one leap-of-faith assumption most likely to be fatal, build the smallest thing that tests it (a landing page, a concierge pilot, a single-feature web app), and only expand once it's validated."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e2l2-i1",
              "front": "What is an MVP, really?",
              "back": "The smallest thing that lets you run one Build–Measure–Learn loop and get validated learning — defined by the assumption it tests, not a feature count."
            },
            {
              "id": "e2l2-i2",
              "front": "The Build–Measure–Learn loop?",
              "back": "Build the minimum to test the riskiest assumption, measure real behavior, learn whether it held, then pivot or persevere. Maximize learning per dollar/week."
            },
            {
              "id": "e2l2-i3",
              "front": "How do you pick which MVP to build?",
              "back": "By the riskiest assumption: rank by (probability wrong) × (damage if wrong); the MVP is whatever retires the top one most cheaply."
            },
            {
              "id": "e2l2-i4",
              "front": "Name three MVP types.",
              "back": "Landing-page/fake-door (tests demand), concierge (manual delivery), Wizard of Oz (manual behind an automated-looking front), single-feature."
            },
            {
              "id": "e2l2-i5",
              "front": "Why is the '9-month full app' an anti-MVP?",
              "back": "It maximizes the cost of being wrong and bundles many assumptions, so you learn late and can't tell which assumption failed."
            }
          ]
        },
        {
          "id": "e2l3",
          "title": "Product-Market Fit",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Product-market fit (PMF)",
              "statement": "**Product-market fit** is the state of being in a good market with a product that *satisfies that market* — the point at which demand begins to **pull** the product out of the company faster than you can push it. Marc Andreessen (popularizing Andy Rachleff's idea) argued it is \"the only thing that matters\" for a young startup: before PMF, nothing else (growth tactics, hiring, fundraising) reliably works; after it, the problem inverts to keeping up with demand."
            },
            {
              "type": "text",
              "heading": "What PMF feels like — pull, not push",
              "body": "Andreessen's description is visceral: *before* PMF, customers aren't quite getting value, word of mouth isn't spreading, usage isn't growing, deals take forever, and the press doesn't care. *After* PMF, customers buy as fast as you can make it, usage grows as fast as you can add servers, money piles up, and you're hiring sales and support frantically. The shift from **push** (you chasing customers) to **pull** (customers chasing you) is the signature. The danger is mistaking push for pull and scaling a product the market doesn't actually want."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The Sean Ellis test",
              "statement": "A leading quantitative proxy for PMF: survey active users with *\"How would you feel if you could no longer use this product?\"* (very disappointed / somewhat disappointed / not disappointed). The benchmark, from Sean Ellis's study of ~100 startups, is that **≥ 40%** answering **\"very disappointed\"** strongly correlates with having achieved product-market fit. Below ~40%, fit is usually still missing."
            },
            {
              "type": "text",
              "heading": "Measuring PMF beyond the survey",
              "body": "The survey is a proxy; the ground truth is **behavior**. The strongest signal is a **retention curve that flattens**: plot the fraction of a signup cohort still active at week 1, 2, 4, 8, …; if it decays to zero you have no fit, but if it *flattens at a positive level*, a stable group keeps getting value — a durable market. Reinforcing signals: organic/word-of-mouth growth, rising usage frequency, low churn, and customers who'd be upset to lose you (the Ellis test). Any one can be gamed; together, a flattening retention curve plus a high \"very disappointed\" share is hard to fake."
            },
            {
              "type": "decision",
              "heading": "Real PMF signals vs. false positives",
              "rows": [
                [
                  "Real — retention curve flattens at a positive level",
                  "A stable cohort keeps returning: durable value. The single most trustworthy signal."
                ],
                [
                  "Real — organic growth + ≥40% 'very disappointed'",
                  "Pull from the market and customers who'd miss you. Reinforces the retention signal."
                ],
                [
                  "False — big total signups, but cohort retention decays to ~0",
                  "A leaky bucket: acquisition masks the absence of fit. Scaling here burns cash."
                ],
                [
                  "False — growth bought entirely with paid ads, churn high",
                  "Push, not pull. Turn off the ads and growth stops; not PMF."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**PMF is the gate before scaling.** Pouring acquisition spend into a product without fit fills a leaky bucket — you pay to acquire users who churn. Fix retention (evidence of fit) *first*; only then does spending on growth compound rather than evaporate (Unit 6 makes the retention-before-growth case quantitatively)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You survey 250 active users; 95 say they'd be 'very disappointed' to lose the product. Compute the Sean Ellis score and interpret it against the benchmark.",
                  "solution": "Score = 95 / 250 = 38%. That is just below the ~40% benchmark, so you likely have *not yet* reached product-market fit — though you're close. The action is not to scale spend but to study the 'very disappointed' segment (who are they, what job?), double down on what they love, and re-measure, rather than treating 38% as 'good enough' and pouring on acquisition."
                },
                {
                  "prompt": "Two products both have 50,000 signups. Product A's monthly cohort retention flattens at 35%; Product B's decays toward 0% by month 3. Which has product-market fit, and why does the signup count mislead?",
                  "solution": "**Product A** has PMF: a retention curve that flattens at a positive level (35%) means a stable cohort keeps getting value — a durable market. Product B's curve decaying to ~0 means no one stays; its 50,000 signups are a leaky bucket inflated by acquisition. Total signups is a vanity metric — it counts arrivals, not value delivered. Cohort retention is the honest measure because it tracks whether users *keep* coming back."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e2l3-i1",
              "front": "Define product-market fit.",
              "back": "Being in a good market with a product that satisfies it — demand starts to pull the product out of you faster than you can push. 'The only thing that matters' early."
            },
            {
              "id": "e2l3-i2",
              "front": "Push vs pull?",
              "back": "Before PMF you chase customers (push); after PMF they chase you (pull) — buying, using, and referring faster than you can keep up."
            },
            {
              "id": "e2l3-i3",
              "front": "The Sean Ellis PMF test and threshold?",
              "back": "Ask active users how they'd feel if they could no longer use it; ≥40% answering 'very disappointed' correlates with PMF."
            },
            {
              "id": "e2l3-i4",
              "front": "The most trustworthy PMF signal?",
              "back": "A retention curve that flattens at a positive level — a stable cohort keeps returning (durable value), unlike a curve decaying to zero."
            },
            {
              "id": "e2l3-i5",
              "front": "Why is 'total signups' a false PMF signal?",
              "back": "It counts arrivals, not retained value; high acquisition can mask a leaky bucket. Measure cohort retention, not cumulative signups."
            },
            {
              "id": "e2l3-i6",
              "front": "Why must PMF precede scaling?",
              "back": "Scaling acquisition without fit fills a leaky bucket — you pay for users who churn. Fix retention first so growth compounds."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e2-check",
        questions: [
          { id: "e2q1", type: "numeric", prompt: "The Sean Ellis product-market-fit survey asks how users would feel if they could no longer use the product. The rule of thumb is you likely have PMF if at least ____% answer 'very disappointed.' Give the number.", answer: 40, tolerance: 0, explanation: "The widely used threshold is 40%." },
          { id: "e2q2", type: "mcq", prompt: "An MVP (minimum viable product) is best described as:", options: ["the smallest product that starts the build-measure-learn loop and validates a hypothesis", "a feature-complete version 1", "a polished prototype you never ship", "the cheapest possible product, regardless of what it teaches you"], answer: 0, explanation: "An MVP exists to produce validated learning quickly, not to be complete." },
          { id: "e2q3", type: "short", prompt: "Andreessen argued the only thing that matters early is getting to product-____ fit.", accept: ["market", "market fit"], explanation: "Product-market fit." },
          { id: "e2q4", type: "numeric", prompt: "Your product saves a customer 10 hours/month and their loaded labor cost is $50/hour. What is the quantified monthly value delivered, in dollars?", answer: 500, tolerance: 0, explanation: "10 hours × $50 = $500/month." },
          {
            id: "e2q5",
            type: "open",
            points: 3,
            prompt: "A team says their MVP is 'a fully-featured app we'll spend 9 months building, then launch.' Explain why this is not a real MVP, and describe a genuine MVP for testing their core hypothesis. Use the build-measure-learn framing.",
            rubric: [
              "Explains why a 9-month feature-complete build is not an MVP: it maximizes time/money spent before learning whether anyone wants it — the opposite of fast validated learning.",
              "Names the riskiest assumption / core hypothesis that should be tested first.",
              "Proposes a genuine lightweight MVP (concierge, landing-page, Wizard-of-Oz, or single-feature) tied to a measurable signal.",
              "Frames it as build-measure-learn: what they'd build, what they'd measure, and the decision it would drive.",
            ],
            solution:
              "A 9-month feature-complete build is the opposite of an MVP: it sinks the most time and money before learning whether anyone wants the product, which is the single largest startup risk. An MVP is the smallest experiment that tests the riskiest assumption and yields validated learning. First name that assumption — e.g. 'people with problem X will change their behavior and pay for our solution.' Then build the cheapest thing that tests it: a concierge MVP delivering the value by hand to a few real customers, a landing page measuring sign-ups or pre-orders against the promise, or a single-feature version that solves only the core job. Decide the metric and the threshold in advance (conversion, retention, willingness to pay), and the rule: if early users don't pull, pivot before spending nine months. The deliverable is learning, not a finished product.",
            explanation: "Name the riskiest assumption, then build the cheapest test of it with a metric and a decision rule.",
          },
          {
            id: "e2q6",
            type: "open",
            points: 3,
            prompt: "Define product-market fit, and give three concrete, observable signals you'd use to decide whether a startup has reached it. Distinguish leading from lagging indicators.",
            rubric: [
              "Defines PMF correctly: a good market plus a product that urgently satisfies it — demand pulls the product out of you.",
              "Gives at least three concrete, observable signals (retention plateau, organic word-of-mouth/referrals, the 40% 'very disappointed' test, sales accelerating without proportional effort).",
              "Distinguishes leading indicators (retention, qualitative pull) from lagging ones (revenue growth).",
              "Avoids citing vanity metrics (sign-ups, downloads, press) as evidence of PMF.",
            ],
            solution:
              "Product-market fit means being in a good market with a product that market urgently wants — you feel demand pulling the product out of you rather than pushing it. Three observable signals: (1) retention — usage curves flatten at a healthy plateau instead of decaying to zero; (2) organic pull — word-of-mouth, referrals, and inbound growth without proportional spend; (3) the Sean Ellis test — at least 40% of users would be 'very disappointed' without it. Retention and qualitative pull are leading indicators (they move first); revenue growth is lagging (it confirms fit after the fact). Vanity metrics — sign-ups, downloads, press, 'people say they love it' — are not evidence; only repeated retained usage and real willingness to pay demonstrate fit.",
            explanation: "Define PMF as urgent market pull; cite retention + organic growth + the 40% test; separate leading from lagging.",
          },
        ],
      },
    },
    {
      id: "e3",
      title: "Customer Development & Validation",
      summary: "Get out of the building, run honest interviews and experiments, and decide when to pivot or persevere.",
      prerequisites: ["e2"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e3l1",
          "title": "Get Out of the Building",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Inside the building there are only opinions",
              "body": "Steve Blank's foundational rule: *\"There are no facts inside your building, so get the hell outside.\"* Early on, every belief about the customer, the problem, and the willingness to pay is a **hypothesis**, not a fact — and the facts live only where the customers are. Founders default to refining the product at a whiteboard because it's comfortable and controllable; the discipline of **Customer Development** is to spend that energy outside, systematically converting guesses into evidence."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Startup (Blank)",
              "statement": "A **startup** is *a temporary organization in search of a repeatable and scalable business model.* The operative word is **search**: a startup is not a small version of a big company (which **executes** a known model). Its job is to discover *who* the customer is, *what* they'll pay for, and *how* to reach and serve them profitably — and only then to scale. Confusing search with execution (building and scaling before the model is found) is the central failure Customer Development guards against."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Customer Development (the four steps)",
              "statement": "Blank's **Customer Development** runs in parallel with product development and has four steps: **(1) Customer Discovery** — turn the founders' vision into hypotheses and test the problem/customer outside the building; **(2) Customer Validation** — prove the model is repeatable by getting real customers to buy (and building a repeatable sales/marketing roadmap); **(3) Customer Creation** — drive demand into the validated channel and scale it; **(4) Company Building** — transition from a searching startup into an executing company with the org to match. Discovery and Validation together are the **search**; only after they pass do you spend on Creation and Building."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Search before execution.** The most expensive mistake is to staff up sales, marketing, and a big build *before* discovery and validation prove the model is repeatable. You then scale a model that doesn't work — burning the most cash exactly when you're most wrong. Find the model first; pour fuel on it second."
            },
            {
              "type": "example",
              "heading": "What 'getting out' actually looks like",
              "body": "For a beachhead of independent physiotherapy clinics, Customer Discovery is concrete: schedule **15–20 interviews** with clinic owners and front-desk staff (your DMU from Unit 1); ask them to walk you through *the last time* a patient no-showed and what it cost; observe their current workaround (a paper book? a generic SMS tool?); and look for the **pattern** across interviews — not a single enthusiastic quote. The output is not \"they liked it\"; it's a validated (or invalidated) problem statement, a sharpened persona, and the next hypothesis to test."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A founder spends three months building features based on what they 'know' customers want, then launches to silence. Which Customer Development step did they skip, and what should they have done?",
                  "solution": "They skipped **Customer Discovery** (and Validation) — they treated their internal beliefs as facts and went straight to building/execution. Before writing code they should have gotten out of the building: run 15–20 interviews with the target persona about their actual problem and current workaround, look for a consistent pattern of pain, and only build once the problem and a willingness to pay were evidenced. They scaled the *search* phase straight into *execution* without searching."
                },
                {
                  "prompt": "Explain why Blank defines a startup as an organization that *searches* rather than *executes*, and one practical consequence for how you spend money early.",
                  "solution": "A big company executes a known, repeatable business model; a startup doesn't yet *have* one — its job is to find who the customer is, what they'll pay for, and how to reach them. The practical consequence: early spend should buy **learning** (interviews, small experiments, MVPs), not **scale** (large sales teams, big ad budgets, a full build). You only scale once Discovery and Validation show the model is repeatable; spending on scale during search burns cash on an unproven model."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e3l1-i1",
              "front": "Blank's foundational rule?",
              "back": "'Get out of the building' — there are no facts inside; every belief about the customer is a hypothesis until tested outside with real customers."
            },
            {
              "id": "e3l1-i2",
              "front": "Blank's definition of a startup?",
              "back": "A temporary organization in search of a repeatable and scalable business model — it searches; a big company executes a known model."
            },
            {
              "id": "e3l1-i3",
              "front": "The four Customer Development steps?",
              "back": "Customer Discovery, Customer Validation (= the search), then Customer Creation, Company Building (= execution/scale)."
            },
            {
              "id": "e3l1-i4",
              "front": "Why is 'search before execution' the key discipline?",
              "back": "Scaling sales/marketing/build before the model is validated burns the most cash exactly when you're most likely wrong about the model."
            }
          ]
        },
        {
          "id": "e3l2",
          "title": "Interviews & Experiments: The Mom Test",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The Mom Test (Fitzpatrick)",
              "statement": "The **Mom Test** is a way to run customer conversations so that *even your mom can't lie to you*. Three rules: **(1)** talk about *their* life and problems, not your idea; **(2)** ask about *specifics in the past*, not generics or hypotheticals about the future; **(3)** talk less and listen more. The point: opinions and predictions about future behavior are nearly worthless, but facts about what someone *already did and paid for* are reliable."
            },
            {
              "type": "text",
              "heading": "Why hypotheticals lie",
              "body": "\"Would you buy a product that does X?\" almost always gets a polite \"yes\" — people are kind, they imagine an idealized future self, and they don't want to crush you. That yes is **data poisoning**: it feels like validation and isn't. The fix is to mine the **past**, which can't be flattering fiction: *\"When did you last face this problem? What did you do about it? What did that cost you (in time or money)? What else have you tried?\"* Past behavior is evidence; future intention is a wish."
            },
            {
              "type": "decision",
              "heading": "Bad question vs. Mom Test question",
              "rows": [
                [
                  "'Do you think this is a good idea?' / 'Would you pay $30/mo for this?'",
                  "Hypothetical and seeks approval → polite, useless yeses. Pitches the idea, biasing the answer."
                ],
                [
                  "'Walk me through the last time you had this problem. What did you do, and what did it cost you?'",
                  "Asks about specific past behavior → facts you can act on. Reveals real workarounds, spend, and urgency."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "From talk to commitment: advancement signals",
              "body": "Even good interviews can mislead if you stop at words. Push every promising conversation toward a **commitment or advancement** — does the customer give something real: **time** (a follow-up meeting, a pilot), **reputation** (an intro to their boss, a referral), or **money** (a pre-order, a deposit, a signed LOI)? Compliments are free and worthless; commitments cost the customer something and are therefore evidence. Pair interviews with small **experiments** (a landing page, a price test) so claims meet behavior."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Vanity vs. actionable metrics",
              "statement": "A **vanity metric** (cumulative signups, total registered users, raw pageviews) only ever grows and hides the truth; an **actionable metric** is a *rate or cohort* that can move down and ties to a decision. In particular, monthly active users decompose as\n\n  MAU = (registered users) × (active fraction),\n\nso a large registered base with a tiny active fraction is a near-empty business wearing a big number. Always divide by the base: track the **rate**, not the total.",
              "proof": "Let R be the number of registered users and let aₖ = 1 if user k used the product this month, else 0. Then MAU = Σ_{k=1}^{R} aₖ = R · ( (1/R) Σₖ aₖ ) = R · p, where p = active fraction. The cumulative total R is monotonically non-decreasing — it can never reveal a problem because it never falls — whereas p can drop, exposing churn and weak engagement. Hence decisions must be driven by p (and cohort retention), not by R. ∎\n\nExample: R = 1,000,000 registered with p = 2% gives MAU = 1,000,000 × 0.02 = 20,000 — a number two orders of magnitude smaller than the headline, and the only one that reflects the real business."
            },
            {
              "type": "example",
              "heading": "Rewriting a leading interview",
              "body": "**Leading (poisoned):** \"We're building an app to help you eat healthier — would you use it? Would you pay $10/month?\" → \"Sure, sounds great!\" (worthless).\n**Mom Test version:** \"Walk me through what you ate yesterday and how you decided. … Last time you tried to eat healthier, what did you actually do? … What did you spend on it — apps, meal kits, a trainer? … What made you stop?\" → reveals real spend ($85/month on a meal kit they quit after 6 weeks), the real job (decision fatigue at 6pm), and the real failure mode (boredom) — facts that reshape the product."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A startup advertises '1,000,000 registered users,' but only 2% were active this month. Compute MAU and explain why the headline number is a vanity metric.",
                  "solution": "MAU = 1,000,000 × 0.02 = **20,000**. The 1,000,000 is a vanity metric: cumulative registrations only ever rise and so can never reveal a problem, while the 2% active rate exposes that 98% of registrants don't return. The business is two orders of magnitude smaller than its headline; decisions should track the active *rate* (and cohort retention), not the cumulative total."
                },
                {
                  "prompt": "Rewrite this leading question into a Mom Test question, and say what kind of evidence each version produces: 'Would you pay for a tool that automates your invoicing?'",
                  "hint": "Move from hypothetical future intention to specific past behavior.",
                  "solution": "Rewrite: 'Walk me through how you invoiced your last few clients. How long did it take, what tools did you use, and what went wrong? Have you ever paid for anything to make it easier?' The original asks about a hypothetical future purchase → polite, unreliable yeses (an opinion). The rewrite asks about specific past behavior and actual spend → facts about the real workflow, its cost, and demonstrated willingness to pay (evidence)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e3l2-i1",
              "front": "The three Mom Test rules?",
              "back": "Talk about their life not your idea; ask about specific past behavior not future hypotheticals; talk less, listen more."
            },
            {
              "id": "e3l2-i2",
              "front": "Why do hypothetical questions ('would you buy X?') mislead?",
              "back": "People give polite, idealized yeses about an imagined future self. Past behavior (what they did and paid) is the only reliable evidence."
            },
            {
              "id": "e3l2-i3",
              "front": "What is a commitment/advancement signal?",
              "back": "The customer gives something real — time (meeting/pilot), reputation (intro/referral), or money (pre-order/deposit). Compliments are free; commitments are evidence."
            },
            {
              "id": "e3l2-i4",
              "front": "Vanity vs actionable metric?",
              "back": "Vanity: cumulative totals that only rise (signups, pageviews). Actionable: rates/cohorts that can fall and drive a decision. MAU = registered × active fraction — track the rate."
            },
            {
              "id": "e3l2-i5",
              "front": "1,000,000 registered at 2% active = ? MAU",
              "back": "20,000. The headline registration count is a vanity metric; the active rate is what reflects the real business."
            }
          ]
        },
        {
          "id": "e3l3",
          "title": "Pivot or Persevere",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Pivot (Ries)",
              "statement": "A **pivot** is a *structured course correction designed to test a new fundamental hypothesis* about the product, strategy, or engine of growth — while **keeping one foot in what you've already learned**. It is not a random restart or abandoning everything; it's a disciplined change of one core assumption, retaining the validated learning and often the team, technology, or customer insight gained so far."
            },
            {
              "type": "text",
              "heading": "A vocabulary of pivots",
              "body": "Ries catalogs many pivot types; the common ones: **zoom-in** (one feature becomes the whole product) and **zoom-out** (the product becomes one feature of a bigger whole); **customer-segment** (right product, wrong customer — sell to a different segment); **customer-need** (the customer is real but the priority problem is a different one); **platform** (app ↔ platform); **business-architecture** (high-margin/low-volume ↔ low-margin/high-volume); **value-capture** (change the monetization/pricing model); **engine-of-growth** (viral ↔ paid ↔ sticky); **channel**; and **technology** (same solution, cheaper/better tech). Naming the pivot type forces precision about *which* assumption you're changing."
            },
            {
              "type": "text",
              "heading": "The pivot-or-persevere decision",
              "body": "Run a **pivot-or-persevere meeting** on a regular cadence (say, every 4–8 weeks). The trigger to pivot is not a single bad week — it's the pattern: *the engine is tuned but the core metric isn't moving.* You've optimized funnels, onboarding, and messaging, yet activation/retention/growth are flat. That means the problem isn't execution; it's a flawed hypothesis. Conversely, persevere when the metrics are improving with each iteration — you're climbing, just not yet at the top. The hardest discipline is honesty: distinguishing **conviction** (evidence trending up) from **stubbornness** (refusing to read flat evidence)."
            },
            {
              "type": "decision",
              "heading": "Signals: pivot vs. persevere",
              "rows": [
                [
                  "Pivot",
                  "Core metric flat for months *despite* optimization; weak retention curve; interviews keep revealing a different real problem; little willingness to pay."
                ],
                [
                  "Persevere",
                  "Metrics improving iteration over iteration; retention curve flattening at a positive level; a real (if small) segment loves it and refers others."
                ]
              ]
            },
            {
              "type": "example",
              "heading": "Pivots that worked",
              "body": "**Slack** began as *Tiny Speck*, a company building an online game (Glitch); the game failed, but the internal chat tool they'd built to coordinate became the product — a **zoom-in** pivot (one feature became the whole company). **Instagram** started as *Burbn*, a cluttered check-in app; the founders noticed users only loved the photo-sharing feature, stripped everything else, and relaunched around photos — a **zoom-in/customer-need** pivot. In both, the team kept the learning, talent, and tech and changed the core hypothesis rather than starting from zero."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**A pivot is a hypothesis change, not a failure or a fresh start.** You keep the validated learning, the team, and usually the technology — you change one fundamental assumption and re-test. Equally, \"persevere\" must be earned by improving metrics, not asserted by stubbornness; founders who can't tell the two apart waste years climbing a hill with no summit."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A startup's weekly active users have been flat for four months despite strong work on onboarding, funnels, and messaging. Should they pivot or persevere, and what does the evidence specifically indicate?",
                  "solution": "This points to a **pivot**. The signature is exactly this: the engine has been tuned (onboarding, funnels, messaging all optimized) yet the core metric won't move — so the bottleneck is not execution but a flawed fundamental hypothesis (wrong customer, wrong need, or no real demand). The disciplined move is a structured pivot: identify which assumption to change (often via fresh customer interviews — is it the segment, the need, or the value?), keep the validated learning and team, and re-test the new hypothesis. Persevering would be stubbornness, since four months of optimization produced no trend."
                },
                {
                  "prompt": "Classify each as a pivot type: (a) a payroll app realizes its expense-report feature is what everyone uses, and rebuilds around just that; (b) a B2C fitness app finds gyms, not consumers, are the real buyers.",
                  "solution": "(a) **Zoom-in pivot** — a single feature (expense reports) becomes the whole product. (b) **Customer-segment pivot** — the product is roughly right but the customer is different (sell to gyms / B2B, not consumers / B2C). Naming the type forces clarity about which one assumption is changing while the rest of the learning is retained."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e3l3-i1",
              "front": "What is a pivot (Ries)?",
              "back": "A structured course correction testing a new fundamental hypothesis while keeping one foot in prior learning — not a random restart."
            },
            {
              "id": "e3l3-i2",
              "front": "Name three pivot types.",
              "back": "Zoom-in/zoom-out (feature↔product), customer-segment (different buyer), customer-need, platform, value-capture (pricing), engine-of-growth, channel, technology."
            },
            {
              "id": "e3l3-i3",
              "front": "What triggers a pivot decision?",
              "back": "The pattern, not one bad week: the engine is tuned (funnels/onboarding optimized) but the core metric stays flat — a flawed hypothesis, not bad execution."
            },
            {
              "id": "e3l3-i4",
              "front": "Conviction vs stubbornness?",
              "back": "Conviction = metrics trending up with each iteration (persevere); stubbornness = refusing to read flat evidence after real optimization (should pivot)."
            },
            {
              "id": "e3l3-i5",
              "front": "Why is a pivot not a fresh start?",
              "back": "You retain the validated learning, team, and usually the technology — changing one fundamental assumption and re-testing (e.g. Slack, Instagram)."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e3-check",
        questions: [
          { id: "e3q1", type: "mcq", prompt: "Steve Blank's Customer Development begins with:", options: ["getting out of the building to turn hypotheses into facts with real customers", "building the complete product first", "hiring a sales team", "raising a seed round"], answer: 0, explanation: "There are no facts inside the building." },
          { id: "e3q2", type: "short", prompt: "The Mom Test says: in customer interviews, never pitch — instead ask about the customer's real life and ____ behavior, not hypothetical future intentions.", accept: ["past", "previous", "prior"], explanation: "Past behavior predicts; stated intentions don't." },
          { id: "e3q3", type: "numeric", prompt: "A startup brags about 1,000,000 total registered users, but only 2% are active this month. How many monthly active users is that?", answer: 20000, tolerance: 0, explanation: "2% × 1,000,000 = 20,000 — the actionable number behind the vanity metric." },
          { id: "e3q4", type: "mcq", prompt: "A pivot is best described as:", options: ["a structured change to a core hypothesis that keeps prior validated learning", "giving up on the startup", "a minor feature tweak", "a new marketing campaign"], answer: 0, explanation: "One foot anchored in learning, one foot testing a new hypothesis." },
          {
            id: "e3q5",
            type: "open",
            points: 3,
            prompt: "A founder did 20 customer interviews and reports 'everyone said they loved the idea and would definitely buy.' Explain why this is weak evidence, and describe how to run interviews that produce trustworthy signal (reference the Mom Test).",
            rubric: [
              "Identifies the bias: pitching the idea and asking hypotheticals elicits compliments and false 'would buy' answers — people are nice and bad at predicting their behavior.",
              "Prescribes asking about the customer's actual past behavior and current spend, not the idea or the future.",
              "Emphasizes seeking real commitment (time, money, pre-order, referral) as the only trustworthy signal.",
              "Notes how to avoid leading the witness — don't pitch, dig into specifics, and be willing to be told you're wrong.",
            ],
            solution:
              "'Everyone loved it and would definitely buy' is almost worthless: by presenting the idea and asking a hypothetical, the founder invited compliments and speculative yeses, and people are both polite and poor predictors of their own future behavior — classic false positives. The Mom Test fix is to never pitch the idea; instead talk about the customer's actual life and past behavior: 'Walk me through the last time you hit this problem,' 'What do you use today and what does it cost you,' 'How much time/money have you already spent trying to solve it.' Trust only commitment — a pre-order, a deposit, a pilot, an intro to their boss — not enthusiasm. Dig into specifics, avoid leading questions, and treat being told 'this isn't really a problem for me' as a valuable result, not a failure.",
            explanation: "Stop pitching; ask about real past behavior and spend; trust only commitment, not compliments.",
          },
          {
            id: "e3q6",
            type: "open",
            points: 3,
            prompt: "A startup's weekly active users have been flat for four months despite shipping features. Walk through how you'd decide whether to pivot or persevere, and if pivoting, what kind of pivot you'd consider.",
            rubric: [
              "Frames the decision around evidence: is the engine of growth (retention/engagement) actually turning, or is effort producing no movement?",
              "Proposes diagnosing WHY it's flat — return to discovery/interviews and the funnel to locate the broken hypothesis (wrong customer, wrong problem, weak value).",
              "Articulates a decision rule: persevere only with a concrete hypothesis for what will move the metric; otherwise pivot.",
              "Names a specific, appropriate pivot type (customer-segment, problem, zoom-in/out, etc.) tied to the likely diagnosis.",
            ],
            solution:
              "Four months of flat WAU despite shipping is strong evidence the engine of growth isn't turning — adding features hasn't changed behavior, which usually means a flawed core hypothesis, not a missing feature. First diagnose: go back to customers and the funnel to find where it breaks — are the right users even arriving (acquisition), failing to activate, or activating but not retaining? That locates which hypothesis is wrong: wrong customer segment, wrong problem, or a value proposition too weak to change behavior. The decision rule: persevere only if you have a concrete, testable reason a specific change will move retention; absent that, pivot rather than burn runway shipping more. Match the pivot to the diagnosis — a customer-segment pivot if a different buyer has the urgent problem, a problem pivot if this segment cares about something adjacent, or a zoom-in pivot if one feature shows real pull while the rest is ignored.",
            explanation: "Diagnose where the funnel/retention breaks, set a decision rule, and pick the pivot type that matches the broken hypothesis.",
          },
        ],
      },
    },
    {
      id: "e4",
      title: "Business Model & Unit Economics",
      summary: "How you make money, how you price it, and the per-customer math (CAC, LTV, payback) that decides whether growth helps or kills you.",
      prerequisites: ["e3"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e4l1",
          "title": "Business Models & Pricing",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Business model",
              "statement": "A **business model** is how a company *creates, delivers, and captures value*: who the customer is, what value they get, how it's delivered, and — crucially — how the firm gets paid (the **revenue model**) and what it costs to serve (the **cost structure**). Unit economics, the subject of this unit, is the per-customer slice of that model: the profit (or loss) on a single customer, which determines whether growth builds the company or bankrupts it."
            },
            {
              "type": "decision",
              "heading": "Common revenue models",
              "rows": [
                [
                  "Subscription / SaaS",
                  "Recurring fee for ongoing access. Predictable revenue; the whole game is retention (low churn) and expansion."
                ],
                [
                  "Transactional / marketplace",
                  "A take-rate on each transaction you facilitate. Revenue = GMV × take-rate; you monetize others' commerce."
                ],
                [
                  "Usage-based",
                  "Pay per unit consumed (API calls, GB, compute). Revenue scales with the customer's success — aligns price with value."
                ],
                [
                  "Freemium",
                  "Free tier to acquire, paid tier to monetize. Works only if a real fraction converts and the free tier is cheap to serve."
                ],
                [
                  "Advertising",
                  "Users are free; attention is sold. Needs large scale and engagement before it pays."
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Marketplace revenue and the take-rate",
              "statement": "For a marketplace facilitating gross merchandise value GMV at take-rate τ, revenue is R = GMV · τ. Because τ is typically small (often 5–30%), a marketplace must move *much* more value than a SaaS business earns in order to net the same revenue.",
              "proof": "Each transaction of value x yields the platform τ·x; summing over all transactions whose values total GMV gives R = Σ τ·xᵢ = τ · Σ xᵢ = τ · GMV. Hence to earn revenue R the marketplace must facilitate GMV = R/τ. At τ = 0.15, earning $15M of revenue requires $100M of GMV flowing through the platform — which is why marketplace take-rates, liquidity, and GMV growth are the metrics that matter, not headline \"sales.\" ∎"
            },
            {
              "type": "text",
              "heading": "Pricing: anchor to value, not cost",
              "body": "Pricing is the most under-tested lever in a startup, and the highest-leverage: a price change flows **directly** to gross margin with no added cost. The three stances — **cost-plus** (mark up your cost), **competitive** (match the market), and **value-based** (a fraction of the quantified value V from Unit 2) — usually rank value-based > competitive > cost-plus for a differentiated product. Equally important is the **price metric**: the unit you charge by (per seat, per usage, per outcome) should track the value the customer receives, so that as they get more value they pay more — and your revenue grows with their success."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Charge by a metric that scales with value.** A security tool priced per employee grows as the customer hires; priced per one-time license, it doesn't. Aligning the price metric to value turns customer success into your revenue growth — and is why usage- and seat-based SaaS compounds."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A marketplace wants $30M in annual revenue at a 12% take-rate. What annual GMV must flow through the platform?",
                  "solution": "R = GMV · τ ⟹ GMV = R/τ = $30,000,000 / 0.12 = $250,000,000. The platform must facilitate a quarter-billion dollars of transactions to net $30M — which is why marketplaces obsess over GMV and liquidity, not just revenue."
                },
                {
                  "prompt": "Your software costs you $5/customer/month to run and delivers ~$400/month of quantified value. Why is cost-plus pricing (say $10/month) a mistake here, and what should anchor the price?",
                  "solution": "Cost-plus ($10) ignores the $400 of value and leaves ~$390/month of value uncaptured on every account — you've priced a Ferrari like its fuel cost. Price should anchor to **value** (Unit 2): with V = $400, a value-based price of, say, $120/month still gives the customer a ~3.3× return (an easy yes) while capturing far more margin. Cost only sets a floor, never the price of a differentiated product."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e4l1-i1",
              "front": "What is a business model?",
              "back": "How a firm creates, delivers, and captures value — including the revenue model (how you get paid) and cost structure (what it costs to serve)."
            },
            {
              "id": "e4l1-i2",
              "front": "Marketplace revenue formula?",
              "back": "R = GMV × take-rate (τ). To earn R you must facilitate GMV = R/τ; small take-rates require large GMV."
            },
            {
              "id": "e4l1-i3",
              "front": "Three pricing stances, best to worst for a differentiated product?",
              "back": "Value-based (fraction of quantified value) > competitive (match market) > cost-plus (mark up cost). Cost only sets a floor."
            },
            {
              "id": "e4l1-i4",
              "front": "Why does the price metric matter?",
              "back": "Charging by a unit that scales with value (per seat/usage) makes the customer's success grow your revenue; a flat license doesn't."
            }
          ]
        },
        {
          "id": "e4l2",
          "title": "Unit Economics: CAC and LTV",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Customer Acquisition Cost (CAC)",
              "statement": "**CAC** is the fully-loaded cost to acquire one new customer over a period: CAC = (total sales & marketing spend in the period) / (new customers acquired in the period). \"Fully-loaded\" means *everything* — ad spend, salaries of sales/marketing staff, tools, commissions — not just media cost. Blended CAC averages all channels; paid CAC isolates the marginal cost of buying a customer."
            },
            {
              "type": "example",
              "heading": "Computing CAC",
              "body": "You spent **$50,000** on all sales & marketing last month and acquired **250** new customers. CAC = $50,000 / 250 = **$200** per customer. If $30,000 of that was a fixed marketing salary and $20,000 was paid ads that brought 200 of the customers, your *paid* CAC is $20,000/200 = $100 — useful for deciding whether to buy more from that channel, while the $200 blended figure is what the whole business must earn back."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Lifetime Value (LTV) and churn",
              "statement": "**LTV** (customer lifetime value) is the total **gross profit** a customer generates over their entire relationship with you — gross profit, not revenue, because serving them has a cost. For a subscription product the key driver is **churn**: the rate at which customers cancel. A higher churn means a shorter expected lifetime and thus a smaller LTV."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "LTV from churn (the geometric-series derivation)",
              "statement": "For a subscription with monthly revenue m per customer, gross margin g, and constant monthly churn probability c (0 < c ≤ 1), a customer's expected lifetime is 1/c months and\n\n  LTV = (m · g) / c = (monthly gross profit) × (1/c).",
              "proof": "A customer is still active at the start of month t only if they survived each of the t prior months, which happens with probability (1 − c)ᵗ. The expected number of months for which they pay is therefore the geometric series\n\n  E[lifetime] = Σ_{t=0}^{∞} (1 − c)ᵗ = 1 / (1 − (1 − c)) = 1/c,\n\nusing Σ_{t≥0} xᵗ = 1/(1 − x) for |x| < 1 with x = 1 − c. Each active month contributes gross profit m · g (revenue times margin), so\n\n  LTV = (m · g) · E[lifetime] = m · g / c. ∎\n\n**Worked:** m = $40/month, g = 75%, c = 5%/month ⟹ E[lifetime] = 1/0.05 = 20 months, and LTV = $40 × 0.75 × 20 = **$600**. Halving churn to 2.5% doubles lifetime to 40 months and LTV to $1,200 — which is why, in subscriptions, *retention is the highest-leverage number in the model.*"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The LTV:CAC ratio",
              "statement": "The **LTV:CAC ratio** divides the lifetime gross profit of a customer by the cost to acquire them. It must exceed **1** just to avoid losing money on acquisition; the widely-cited healthy-SaaS benchmark is **≥ 3** — meaning each customer returns at least three times their acquisition cost in gross profit."
            },
            {
              "type": "example",
              "heading": "The ratio, and why 3",
              "body": "With LTV = $600 and CAC = $200, the LTV:CAC ratio is 600 / 200 = **3**. Why insist on 3 rather than, say, 1.2? Because CAC and the gross-margin LTV **don't capture all costs**: R&D, G&A, support, and overhead aren't in CAC, and churn/price are uncertain. A ratio near 1 means any of those overheads or a modest churn surprise turns the customer unprofitable. A 3× cushion leaves room for the rest of the company to exist and for the estimates to be wrong. (A ratio *far* above 3 — say 8 — often signals **under-investment** in growth: you could profitably acquire more.)"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You spent $80,000 on sales & marketing and acquired 320 customers. Each pays $25/month at 80% gross margin with 4% monthly churn. Compute CAC, expected lifetime, LTV, and the LTV:CAC ratio.",
                  "solution": "CAC = $80,000 / 320 = $250. Expected lifetime = 1/c = 1/0.04 = 25 months. LTV = m·g/c = $25 × 0.80 × 25 = $500. LTV:CAC = 500 / 250 = 2.0 — below the healthy benchmark of 3, so this is not yet a fundable engine: you'd need to lower CAC, raise price/margin, or cut churn (each lever moves the ratio)."
                },
                {
                  "prompt": "A subscription has m = $60, g = 70%, and monthly churn c = 3%. Compute LTV. Then show what happens to LTV if churn rises to 6%, and state the lesson.",
                  "hint": "LTV = m·g/c; lifetime = 1/c.",
                  "solution": "At c = 3%: lifetime = 1/0.03 ≈ 33.3 months, LTV = $60 × 0.70 / 0.03 = $42 / 0.03 = $1,400. At c = 6%: lifetime = 1/0.06 ≈ 16.7 months, LTV = $42 / 0.06 = $700. Doubling churn **halves** LTV (LTV ∝ 1/c). Lesson: in a subscription, churn is the dominant lever on customer value — a small retention improvement is worth more than most acquisition optimizations."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e4l2-i1",
              "front": "Define CAC.",
              "back": "Fully-loaded sales & marketing spend ÷ new customers acquired in the period. Includes salaries/tools/commissions, not just ad spend."
            },
            {
              "id": "e4l2-i2",
              "front": "LTV from churn — formula and derivation?",
              "back": "LTV = m·g/c. A customer is active at month t w.p. (1−c)ᵗ; expected lifetime = Σ(1−c)ᵗ = 1/c (geometric series); ×monthly gross profit m·g."
            },
            {
              "id": "e4l2-i3",
              "front": "Why is LTV gross profit, not revenue?",
              "back": "Serving a customer has a cost, so only the gross-margin fraction g of revenue is value to the firm: per-month gross profit = m·g."
            },
            {
              "id": "e4l2-i4",
              "front": "Healthy LTV:CAC ratio, and why ≥3 not ≥1?",
              "back": "≥3. CAC/LTV omit R&D, G&A, support, and overhead, and churn/price are uncertain; a 3× cushion covers them and estimate error. (>1 just avoids losing money on acquisition.)"
            },
            {
              "id": "e4l2-i5",
              "front": "Effect of doubling churn on LTV?",
              "back": "LTV ∝ 1/c, so doubling churn halves LTV. Retention is the highest-leverage number in a subscription model."
            }
          ]
        },
        {
          "id": "e4l3",
          "title": "Payback, Churn & Why Scale Can Kill",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "CAC payback period",
              "statement": "The **CAC payback period** is how many months of gross profit it takes to recover the upfront cost of acquiring a customer: Payback P = CAC / (m · g) months. It measures not whether a customer is *eventually* worth it (that's LTV:CAC) but *how long your cash is tied up* before you break even on them."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Same LTV:CAC, different payback — why the ratio isn't enough",
              "statement": "Payback P = CAC/(m·g), and it relates to the ratio by LTV:CAC = 1/(c·P). Therefore two businesses with the *same* LTV:CAC ratio can have very different payback periods, determined by their churn — and the one with shorter payback ties up less cash and carries less risk.",
              "proof": "Recovering CAC at m·g gross profit per month needs P months with P·(m·g) = CAC, so P = CAC/(m·g). Now compute the ratio: LTV:CAC = (m·g/c)/CAC = (1/c)·(m·g/CAC) = (1/c)·(1/P) = 1/(c·P). Holding LTV:CAC fixed at, say, 3 forces c·P = 1/3, which many (c, P) pairs satisfy:\n\n  • Firm A: c = 2%/mo ⟹ P = 1/(3·0.02) ≈ 16.7 months payback.\n  • Firm B: c = 10%/mo ⟹ P = 1/(3·0.10) ≈ 3.3 months payback.\n\nBoth have LTV:CAC = 3, yet Firm B recovers its acquisition cost five times faster. Firm B can recycle cash into growth quickly and survives a downturn; Firm A must finance ~17 months of underwater customers. The ratio says *eventually worth it*; payback says *how long you bleed first*. ∎"
            },
            {
              "type": "text",
              "heading": "Why faster growth can drain cash even when every customer is profitable",
              "body": "Here is the counter-intuitive trap. Each new customer costs CAC **today** but returns gross profit only over the following P months. If you acquire new customers steadily, then at any moment a whole **cohort of recent customers is still underwater** (pre-payback). The faster you grow, the larger that underwater cohort, and the deeper the cash hole — *even though each customer is individually profitable.* This is why high-LTV:CAC companies still raise money: they're financing the gap between paying CAC now and collecting it later. Growth doesn't fix this cash gap; it widens it. The remedy is capital (to fund the gap) plus short payback (to shrink it)."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "When 'make it up in volume' is a fallacy",
              "statement": "If LTV < CAC (you lose money on every customer), then total contribution is N·(LTV − CAC) < 0 and grows *more negative* with N: scaling **multiplies the loss**. \"We lose a little on each sale but make it up in volume\" is arithmetically false whenever unit economics are negative.",
              "proof": "Acquiring N customers yields total lifetime contribution N·(LTV − CAC). If LTV − CAC < 0, this is negative and strictly decreasing in N — every additional customer adds another (LTV − CAC) < 0 of loss. Volume cannot rescue a negative per-unit margin; it amplifies it. The only fixes are to make LTV − CAC > 0 first: raise price/margin, cut CAC, or reduce churn (which raises LTV via LTV = m·g/c). Contrast this with the *payback* problem above, where LTV − CAC > 0 (each customer is profitable) but the cash is merely delayed — survivable with financing. Negative unit economics is fatal; slow payback is a financing question. ∎"
            },
            {
              "type": "decision",
              "heading": "Diagnose before you scale",
              "rows": [
                [
                  "LTV < CAC (negative unit economics)",
                  "Do NOT scale — growth multiplies the loss. Fix price, CAC, or churn first. 'Make it up in volume' is false here."
                ],
                [
                  "LTV > CAC but long payback",
                  "Unit economics work, but growth ties up cash for many months. Scale, but finance the gap and drive payback down."
                ],
                [
                  "LTV > CAC and short payback",
                  "The ideal: each customer self-funds quickly. Recycle the cash into more acquisition and scale aggressively."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**\"We'll make it up in volume\" only works if you make money on each unit.** With negative unit economics, every new customer deepens the loss — scaling is pouring money into a furnace. Confirm LTV > CAC *first*; only then is the remaining question (payback) about cash timing, not survival."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "CAC = $300, monthly revenue m = $50, gross margin g = 60%. Compute the CAC payback period. If a competitor has the same LTV:CAC ratio but half the churn, who has the longer payback and why?",
                  "solution": "Monthly gross profit = m·g = $50 × 0.60 = $30. Payback P = CAC/(m·g) = $300/$30 = 10 months. Using LTV:CAC = 1/(c·P): at a fixed ratio, P = 1/(ratio·c), so P ∝ 1/c. A competitor with *half* the churn (c smaller) has a *longer* payback at the same ratio — lower churn buys a higher LTV (= more total profit) but spread over a longer life, so cash returns more slowly. Same ratio, different cash dynamics."
                },
                {
                  "prompt": "A founder says: 'We lose $50 on each customer, but we'll make it up in volume as we scale.' Evaluate this claim rigorously.",
                  "solution": "It's false. Losing $50/customer means LTV − CAC = −$50 < 0, so acquiring N customers yields total contribution N × (−$50), which only grows *more negative* as N rises — scaling multiplies the loss, it doesn't dilute it. Volume rescues *fixed* costs (spread over more units), but never a *negative per-unit margin*. The fix is to make unit economics positive first — raise price/margin, lower CAC, or cut churn (which raises LTV = m·g/c) — and only then scale."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e4l3-i1",
              "front": "CAC payback period formula?",
              "back": "P = CAC / (m·g) — months of gross profit to recover acquisition cost. Measures cash tied up, not eventual worth."
            },
            {
              "id": "e4l3-i2",
              "front": "Can two firms share an LTV:CAC ratio but differ in payback?",
              "back": "Yes — LTV:CAC = 1/(c·P), so at a fixed ratio, payback P ∝ 1/c. Different churn ⇒ different payback; shorter payback = less cash tied up, less risk."
            },
            {
              "id": "e4l3-i3",
              "front": "Why can fast growth drain cash even with profitable customers?",
              "back": "CAC is paid upfront but recovered over P months, so a growing cohort is always underwater; faster growth = bigger underwater cohort = deeper cash hole. Finance the gap."
            },
            {
              "id": "e4l3-i4",
              "front": "Why is 'make it up in volume' false with negative unit economics?",
              "back": "Total contribution = N·(LTV−CAC); if LTV<CAC it's negative and grows more negative with N — scaling multiplies the loss."
            },
            {
              "id": "e4l3-i5",
              "front": "Negative unit economics vs long payback — which is fatal?",
              "back": "Negative unit economics (LTV<CAC) is fatal — fix it first. Long payback with LTV>CAC is a financing/cash-timing problem, survivable with capital."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e4-check",
        questions: [
          { id: "e4q1", type: "numeric", prompt: "You spent $50,000 on sales & marketing last month and acquired 250 customers. What is your CAC, in dollars?", answer: 200, tolerance: 0, explanation: "$50,000 ÷ 250 = $200." },
          { id: "e4q2", type: "numeric", prompt: "A customer pays $40/month at 75% gross margin, with 5% monthly churn (so average lifetime = 1/0.05 = 20 months). Estimate LTV = monthly revenue × gross margin × lifetime, in dollars.", answer: 600, tolerance: 0, explanation: "$40 × 0.75 × 20 = $600." },
          { id: "e4q3", type: "numeric", prompt: "With LTV = $600 and CAC = $200, what is the LTV:CAC ratio?", answer: 3, tolerance: 0, explanation: "$600 ÷ $200 = 3." },
          { id: "e4q4", type: "short", prompt: "A healthy SaaS rule of thumb is an LTV:CAC ratio of at least ____ (a single number).", accept: ["3", "3:1", "3x", "three"], explanation: "LTV:CAC ≥ 3 is the common floor." },
          {
            id: "e4q5",
            type: "open",
            points: 3,
            prompt: "A founder says: 'We lose $50 on each customer but we'll make it up in volume as we scale.' Explain, using unit economics, why this is usually fatal, and what would have to change for scaling to be the right move.",
            rubric: [
              "Explains that negative contribution per customer means scaling multiplies losses — growth accelerates death, not profit.",
              "Distinguishes losing money on fixed costs (fine to outgrow) from losing money on each unit (not fixable by volume).",
              "Lists the levers that must change first: raise price, cut CAC, reduce churn, or improve gross margin until unit economics turn positive.",
              "States the condition for scaling: positive (and ideally improving) unit economics with an acceptable CAC payback.",
            ],
            solution:
              "If you lose $50 on every customer, then every additional customer adds $50 of loss — scaling multiplies the bleeding, so 'make it up in volume' makes the hole deeper, not smaller. 'Make it up in volume' only works when the per-unit (contribution) economics are positive and you're spreading fixed costs over more units; here the loss is per unit, which volume cannot cure. Before scaling, the unit economics must turn positive: raise price toward the value delivered, cut CAC (better channels/conversion), reduce churn (which lifts LTV), or improve gross margin (lower cost to serve). Scaling is the right move only once contribution per customer is positive, LTV:CAC is comfortably above ~3, and CAC payback is short enough that growth doesn't outrun your cash.",
            explanation: "Per-unit losses scale with volume; fix price/CAC/churn/margin until contribution is positive before pouring in growth capital.",
          },
          {
            id: "e4q6",
            type: "open",
            points: 3,
            prompt: "Two startups both have an LTV:CAC ratio of 3. Startup A recovers its CAC in 6 months; Startup B in 30 months. Explain why these are very different businesses and which is healthier, referencing CAC payback and cash flow.",
            rubric: [
              "Notes that LTV:CAC alone hides timing — the same ratio can mask very different cash dynamics.",
              "Explains CAC payback: A repays acquisition cost in 6 months, B in 30, so B fronts far more cash per customer for far longer.",
              "Connects to cash flow / runway: long payback means growth consumes cash and risks running out before LTV is realized; it also bets on long retention.",
              "Concludes A is healthier (faster self-funding growth, less financing risk), other things equal.",
            ],
            solution:
              "An identical LTV:CAC of 3 says nothing about timing, and timing is where these two diverge. CAC payback — how long until a customer repays their acquisition cost — is 6 months for A and 30 months for B, so for every customer acquired, B ties up acquisition cash for two and a half years before breaking even, while A is whole in half a year and can recycle that cash into the next cohort. That makes A far healthier: growth is closer to self-funding, it needs less external capital, and it's less exposed to the risk that customers churn before the long-dated LTV ever materializes (B's economics depend on customers actually staying ~retained long enough to realize the LTV). B can still be a fine venture-backed business, but it must raise and burn far more cash to grow at the same rate, and a long payback amplifies the damage if churn turns out higher than assumed.",
            explanation: "Same ratio, very different cash: short payback (A) self-funds growth; long payback (B) fronts cash for years and bets on long retention.",
          },
        ],
      },
    },
    {
      id: "e5",
      title: "Go-to-Market & Sales",
      summary: "Choose a motion that fits your price and customer, cross the chasm to the mainstream, and position so the right people buy.",
      prerequisites: ["e4"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e5l1",
          "title": "GTM Motions & Channels",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Go-to-market motion",
              "statement": "A **go-to-market (GTM) motion** is the repeatable way you reach, acquire, and serve customers — the channel and sales process that move a stranger to a paying user. The central design rule: the motion must **fit the price and the customer.** A motion that's too expensive for the deal size loses money on every sale; one that's too thin for a complex, high-stakes purchase never closes it."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Price determines motion (the ACV floor for human sales)",
              "statement": "A human sales rep has fully-loaded annual cost C_rep and can close at most N deals/year, so a human-sold customer costs at least CAC_sales ≈ C_rep / N in sales payroll alone. Since viability needs LTV > CAC, human-assisted sales only works when LTV > C_rep / N. For typical rep costs this sets an **ACV floor in the thousands of dollars**; below it, the motion must be self-serve (product-led).",
              "proof": "A rep costing C_rep per year who closes N deals spreads that cost over N customers, so each sold customer carries at least C_rep/N of sales payroll before any marketing. Viability requires LTV > CAC ≥ C_rep/N. With a loaded rep at C_rep = $150,000 closing N = 50 deals/year, CAC_sales ≈ $3,000 — so a product whose customers are worth $200 of lifetime gross profit *cannot* support a human seller; it must acquire through a self-serve funnel whose marginal cost per customer is near zero. As LTV climbs, higher-touch motions become affordable in turn — inside sales in the low-thousands of ACV, field/enterprise sales in the tens-to-hundreds of thousands. Hence the channel is *picked by the price*: ACV sets the ceiling on acquisition spend, and that ceiling selects the motion. ∎"
            },
            {
              "type": "decision",
              "heading": "Matching motion to price (the ACV ladder)",
              "rows": [
                [
                  "Product-led / self-serve (ACV < ~$1–2k)",
                  "User signs up and buys with no human. Growth from the product, content, and virality. The only motion cheap enough for small deals."
                ],
                [
                  "Inside sales (ACV ~ $2k–50k)",
                  "Reps sell remotely (calls, demos). Affordable once each deal can absorb a few hundred to a few thousand of CAC."
                ],
                [
                  "Field / enterprise sales (ACV > ~$50–100k)",
                  "Outside reps, solution engineers, long cycles, procurement. Only large contracts can fund this overhead."
                ],
                [
                  "Channel / partner",
                  "Resellers or platforms sell for you. Extends reach, but you give up margin and direct customer contact."
                ]
              ]
            },
            {
              "type": "example",
              "heading": "A motion mismatch",
              "body": "A startup sells a **$2,000/year** SMB product and hires a five-person **field sales** team with $160k loaded cost each. To even cover payroll, each rep must generate $160k of *gross profit* per year; at $2,000 ACV and (say) 70% margin, that's $160,000 / ($2,000 × 0.70) ≈ **114 new customers per rep per year** — far beyond what a consultative field rep can close. The motion is structurally unaffordable: a $2k product needs a **self-serve or low-touch inside** motion, where acquisition cost is a small fraction of ACV, not a field team built for six-figure deals."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Motion–price mismatch is a top GTM killer.** Bolting an enterprise sales team onto a cheap product (or expecting self-serve to close a $250k deal with security review and procurement) breaks the unit economics or the close rate. Let the price pick the motion — then staff to that motion, not your ambition."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A loaded inside-sales rep costs $120,000/year and can close 80 deals/year. What is the minimum sales CAC, and what ACV/LTV is needed for the motion to be viable?",
                  "solution": "Minimum sales CAC ≈ C_rep/N = $120,000/80 = $1,500 per customer (payroll only, before marketing). Viability needs LTV > CAC, so the customer's lifetime gross profit must exceed ~$1,500 — implying an ACV of at least a few thousand dollars (depending on margin and churn). A $300-LTV product can't fund this rep; it must go self-serve."
                },
                {
                  "prompt": "Explain, using the ACV floor, why product-led growth is essentially mandatory for a $15/month consumer app.",
                  "solution": "At $15/month (~$180/year ACV) the customer's LTV is on the order of a few hundred dollars at best. The minimum human-sales CAC (rep cost ÷ deals) is in the thousands, which dwarfs that LTV — so any human-assisted motion loses money on every sale. The only acquisition channel cheap enough is self-serve/product-led, where marginal cost per signup is near zero (organic, content, virality, low-cost ads). Price < motion cost ⟹ the product must sell itself."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e5l1-i1",
              "front": "What is a go-to-market motion, and its design rule?",
              "back": "The repeatable way you reach/acquire/serve customers. Rule: the motion must fit the price and customer — too costly a motion for the deal size loses money."
            },
            {
              "id": "e5l1-i2",
              "front": "Why does price determine the sales motion?",
              "back": "Human sales costs ≥ C_rep/N per customer; viability needs LTV > that. Low ACV ⇒ self-serve; high ACV ⇒ inside then field sales. ACV sets the acquisition ceiling."
            },
            {
              "id": "e5l1-i3",
              "front": "The ACV→motion ladder?",
              "back": "Self-serve (<~$1–2k), inside sales (~$2k–50k), field/enterprise (>~$50–100k), plus channel/partner. Higher ACV affords higher touch."
            },
            {
              "id": "e5l1-i4",
              "front": "Why is hiring enterprise sales for a $2k product a mistake?",
              "back": "Each rep must close ~100+ deals/year just to cover loaded cost — impossible for consultative field sales. A cheap product needs a self-serve/low-touch motion."
            }
          ]
        },
        {
          "id": "e5l2",
          "title": "Crossing the Chasm",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The technology adoption life cycle",
              "statement": "Moore (building on Rogers) models adoption of a discontinuous innovation across five groups, in order: **innovators** (techies, try anything), **early adopters** (visionaries, buy on competitive advantage), **early majority** (pragmatists, buy proven solutions), **late majority** (conservatives, buy when it's standard and safe), and **laggards** (skeptics). Roughly bell-shaped, the early+late majority are ~⅔ of the market — the mainstream you must reach to build a large company."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The chasm",
              "statement": "The **chasm** is the deep gap between the **early adopters** (visionaries) and the **early majority** (pragmatists). It exists because the two groups buy on *opposite* psychologies: visionaries seek a breakthrough edge and will tolerate an incomplete, risky product; pragmatists want a safe, complete, proven solution with references from *people like them.* A startup with strong early-adopter traction can stall and die in the chasm because the very things that won visionaries (newness, vision, risk) repel pragmatists."
            },
            {
              "type": "decision",
              "heading": "Early adopter vs. early majority",
              "rows": [
                [
                  "Early adopter (visionary)",
                  "Buys a competitive *advantage*; tolerates rough edges and bugs; will take a risk on the new; references other visionaries (whom pragmatists distrust)."
                ],
                [
                  "Early majority (pragmatist)",
                  "Buys a proven *solution* to a known problem; wants the whole product, support, and references from peers in their own industry; is risk-averse and waits for a safe choice."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "How to cross: niche down to one pragmatist segment",
              "body": "Moore's crossing strategy is — not coincidentally — the **beachhead** of Unit 1, applied to the mainstream. You don't cross the chasm by appealing to \"the early majority\" broadly; pragmatists buy in herds within their own niche. So pick **one** pragmatist segment with an urgent problem, deliver the **whole product** (the complete solution including integrations, support, and service — not just your core software), win a beachhead of reference customers *in that niche*, and let pragmatist word-of-mouth carry you. Then use that as the lead \"bowling pin\" to topple adjacent segments. Focus is the bridge across the chasm."
            },
            {
              "type": "example",
              "heading": "Whole product, one niche",
              "body": "A workflow startup had enthusiastic early-adopter usage across a dozen industries but couldn't land repeatable mainstream deals — classic chasm. It crossed by **narrowing to a single vertical** (mid-size insurance claims teams): building the integrations, compliance, templates, and support that made it a *complete* solution for that one niche, and landing three lighthouse customers whose references other claims teams trusted. Mainstream sales in insurance then compounded, funding expansion into the next vertical. The product barely changed; the **focus and whole-product completeness** did."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Visionary traction is not mainstream traction.** A wall of enthusiastic early adopters can mask the chasm — the pragmatist majority hasn't moved, and won't, until you give *their* niche a complete, referenced, low-risk solution. Many startups mistake early-adopter buzz for product-market fit with the mass market and scale straight into the gap."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A startup has 5,000 enthusiastic early-adopter users across many industries but can't close repeatable deals with mainstream buyers. Diagnose the problem and outline a crossing strategy.",
                  "solution": "This is the **chasm**: early-adopter (visionary) traction that hasn't converted to the early majority (pragmatists), who buy differently — they want a proven, complete, low-risk solution with references from peers in their own industry, none of which 'enthusiasm across many industries' provides. Crossing strategy: pick **one** pragmatist niche with an urgent problem; build the **whole product** for it (integrations, support, compliance — a complete solution, not just core features); win a beachhead of 3–5 lighthouse reference customers in that niche; then ride peer word-of-mouth to dominate it before expanding to adjacent segments (bowling-pin expansion). Focus, not breadth, crosses the chasm."
                },
                {
                  "prompt": "Why do references from early adopters fail to convince the early majority?",
                  "solution": "Pragmatists buy on risk reduction and trust *people like them* — peers in their own industry facing their own constraints. Visionaries (early adopters) are, by definition, *not* like pragmatists: they chase novelty and tolerate risk, so a pragmatist discounts a visionary's reference ('of course the bleeding-edge crowd likes it; that's not my situation'). You need references from within the pragmatist's *own* segment, which is exactly why crossing requires dominating one niche to generate peer proof."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e5l2-i1",
              "front": "The five adoption groups (Moore/Rogers)?",
              "back": "Innovators, early adopters (visionaries), early majority (pragmatists), late majority (conservatives), laggards. The majorities (~⅔) are the mainstream."
            },
            {
              "id": "e5l2-i2",
              "front": "What is the chasm and why does it exist?",
              "back": "The gap between early adopters and the early majority. They buy on opposite psychologies: visionaries want an edge and tolerate risk; pragmatists want a proven, complete, peer-referenced solution."
            },
            {
              "id": "e5l2-i3",
              "front": "How do you cross the chasm?",
              "back": "Niche down to one pragmatist segment, deliver the whole product, win reference customers in that niche, ride peer word-of-mouth, then expand to adjacent segments (bowling-pin). It's the beachhead applied to the mainstream."
            },
            {
              "id": "e5l2-i4",
              "front": "Why is early-adopter traction a trap?",
              "back": "It can mask the chasm — pragmatists haven't moved and discount visionary references. Buzz ≠ mainstream product-market fit."
            }
          ]
        },
        {
          "id": "e5l3",
          "title": "Positioning & Founder-Led Sales",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Positioning",
              "statement": "**Positioning** (April Dunford; Ries & Trout) is the context you deliberately set so the *right* customers instantly grasp why you're the best choice *for them*. It is a choice of frame, built from: the **competitive alternatives** (what they'd use instead), your **unique attributes** versus those, the **value** those attributes enable, the **target segment** that cares most, and the **market category** you place yourself in. Positioning is not a tagline — it's the lens through which everything else is understood."
            },
            {
              "type": "text",
              "heading": "Positioning is a choice, and the wrong one buries a good product",
              "body": "The same product can win or lose depending on the category and comparison you invoke. Frame a powerful database as \"a faster MySQL\" and buyers judge you on MySQL's terms (and your gaps); frame it as \"a real-time analytics engine\" and the comparison — and the value — change entirely. Dunford's method: list who *actually* loves the product and why, find the competitive alternatives they'd otherwise use, isolate the attributes only you have, and choose the market category that makes those attributes obviously valuable. Position *toward the customers who already get the most value*, not the broadest possible audience."
            },
            {
              "type": "text",
              "heading": "Founders must sell first",
              "body": "Before there's a repeatable motion, **the founders do the selling** — and should. Founder-led sales isn't a stopgap; it's how you *find* the motion: founders can change the pitch mid-call, hear every objection unfiltered, detect which segment leans in, and feed that learning straight back into product and positioning (it's Customer Development continued into revenue). The classic mistake is hiring a VP of Sales to \"figure out sales\" *before* the founders have closed enough deals to know what the repeatable script, segment, and motion even are. You can't delegate the search; you can only delegate the execution once the search succeeds."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The sales funnel multiplies",
              "statement": "A funnel with stages of conversion rates r₁, r₂, …, r_k turns L leads into L · (r₁ · r₂ · ⋯ · r_k) customers. Because the rates *multiply*, overall yield is dominated by the **worst** stage, and adding stages compounds the loss.",
              "proof": "Of L leads, L·r₁ advance past stage 1; of those, (L·r₁)·r₂ advance past stage 2; by induction, L·∏_{i=1}^{j} rᵢ advance past stage j. After all k stages, customers = L · ∏_{i=1}^{k} rᵢ. Since every rᵢ ≤ 1, the product is no larger than its smallest factor — so the lowest-converting stage caps the entire funnel, and the largest single improvement comes from fixing that worst stage. ∎\n\n**Worked:** 2,000 leads → 10% become qualified → 20% of those close gives 2,000 × 0.10 × 0.20 = **40 customers** — an overall lead-to-customer rate of just 2%. Doubling the 10% qualification rate (the worst stage) to 20% doubles output to 80; doubling the 20% close rate also doubles it — but the cheapest win is wherever the rate is lowest and most movable."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't hire a sales team to fix a broken funnel or an unfound motion.** If the funnel leaks at qualification or close, more reps just pour more leads into the same leak. Find the repeatable motion and fix the worst-converting stage first (often a positioning or qualification problem) — then add salespeople to scale what already works."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Your funnel: 2,000 leads → 10% become qualified → 20% of qualified close. How many customers? If you could either double the qualification rate or double the close rate, does it matter which (for output), and what should actually guide the choice?",
                  "solution": "Customers = 2,000 × 0.10 × 0.20 = 40. Because the stages multiply, doubling *either* rate doubles output to 80 — for raw output it doesn't matter which. What should guide the choice is **which stage is both lowest and most movable**, and the *cost* of improving each: if qualification is the bigger leak relative to benchmark (10% is low), fixing targeting/positioning there is usually cheaper and higher-leverage than squeezing the close rate."
                },
                {
                  "prompt": "A founder wants to hire a VP of Sales to 'build the sales machine' before they've personally closed more than a handful of deals. Why is this risky, and what should they do first?",
                  "solution": "It's risky because there is **no repeatable motion to hand off yet** — the segment, pitch, objections, and qualification criteria are still unknown. A VP of Sales executes and scales a known motion; they rarely *discover* one, and will burn months and money guessing. The founders should sell first (founder-led sales): close enough deals to learn the repeatable script, the segment that converts, and the funnel's real conversion rates — i.e. find the motion — and only then hire a VP to scale it."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e5l3-i1",
              "front": "What is positioning?",
              "back": "The context you set so the right customers grasp why you're best for them — competitive alternatives, unique attributes, the value they enable, target segment, and market category. Not a tagline."
            },
            {
              "id": "e5l3-i2",
              "front": "Why position toward the customers who love you most?",
              "back": "The category and comparison you invoke decide how you're judged; framing toward those who get the most value makes your unique attributes obviously valuable, instead of competing on someone else's terms."
            },
            {
              "id": "e5l3-i3",
              "front": "Why must founders sell first?",
              "back": "Founder-led sales is how you FIND the motion — adapt the pitch live, hear objections, spot the converting segment, feed it back to product/positioning. You can't delegate the search, only the execution."
            },
            {
              "id": "e5l3-i4",
              "front": "Sales funnel math?",
              "back": "Customers = leads × ∏ stage conversion rates. Rates multiply, so the worst stage dominates. 2,000 × 10% × 20% = 40."
            },
            {
              "id": "e5l3-i5",
              "front": "Why not hire reps to fix a broken funnel?",
              "back": "More reps pour more leads into the same leak. Fix the worst-converting stage and find the repeatable motion first; then add salespeople to scale it."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e5-check",
        questions: [
          { id: "e5q1", type: "mcq", prompt: "In Crossing the Chasm, the hardest gap is between early adopters and the early majority because the early majority:", options: ["are pragmatists who buy on references and a complete whole product, not on vision", "have no money to spend", "are technophobes who never buy new products", "always wait for the price to drop"], answer: 0, explanation: "Pragmatists require references and a whole product; visionary-era tactics fail with them." },
          { id: "e5q2", type: "short", prompt: "A low-price, high-volume product usually fits a product-led / self-serve motion; a high-contract-value enterprise product usually needs a ____-led motion.", accept: ["sales", "sales-led", "direct sales", "human"], explanation: "ACV picks the motion: low → self-serve, high → sales-led." },
          { id: "e5q3", type: "numeric", prompt: "Your funnel: 2,000 leads → 10% become qualified → 20% of those close. How many customers is that?", answer: 40, tolerance: 0, explanation: "2,000 × 0.10 × 0.20 = 40." },
          { id: "e5q4", type: "mcq", prompt: "Positioning is fundamentally about:", options: ["defining your frame of reference and differentiation — who you're for and what you're better than", "choosing a logo and color palette", "setting the lowest possible price", "buying more ads"], answer: 0, explanation: "Category + audience + differentiation." },
          {
            id: "e5q5",
            type: "open",
            points: 3,
            prompt: "A startup selling a $2,000/year SMB software product is hiring a large outbound enterprise sales team and running expensive brand ads. Critique this go-to-market choice and propose a motion that fits the price point and customer.",
            rubric: [
              "Identifies the mismatch: a high-cost enterprise sales motion can't be supported by a $2,000 ACV — the cost of sale swamps the unit economics.",
              "Connects motion to ACV/CAC: at low ACV you need an efficient, low-touch motion so CAC stays well below LTV.",
              "Proposes a fitting motion (product-led / self-serve, low-touch inside sales, content/inbound, partnerships) appropriate to SMB and the price point.",
              "Notes brand ads are an inefficient acquisition channel here; favors measurable, targeted channels tied to CAC.",
            ],
            solution:
              "The motion is wildly mismatched to the economics. A $2,000/year product yields perhaps a few hundred dollars of first-year contribution, but an outbound enterprise rep plus expensive brand advertising can cost thousands to acquire a single SMB customer — CAC swamps LTV and every sale loses money. At low ACV the motion must be low-touch and efficient: a product-led / self-serve funnel where SMBs sign up and convert with little or no human contact, supported by content and SEO inbound, lightweight inside sales only for the larger SMB deals, and possibly partnerships or marketplaces that aggregate the audience. Brand advertising is a poor fit because it's hard to attribute and expensive per acquired customer; favor measurable, targeted channels and watch CAC and payback so they stay comfortably inside the LTV the $2,000 price can support. Let the ACV pick the motion, not ambition.",
            explanation: "Low ACV demands a low-touch, efficient motion (PLG/inbound); an enterprise sales team + brand ads make CAC exceed LTV.",
          },
          {
            id: "e5q6",
            type: "open",
            points: 3,
            prompt: "Explain the 'chasm' in technology adoption, and describe a concrete strategy for a B2B startup to cross it, connecting it to the beachhead-market and whole-product concepts.",
            rubric: [
              "Defines the chasm: the gap between early adopters (visionaries) and the early majority (pragmatists), who buy for opposite reasons.",
              "Explains that pragmatists demand references from peers and a complete whole product, which visionary-era tactics don't provide.",
              "Prescribes targeting a single beachhead segment and delivering the whole product for it, rather than chasing the whole mainstream at once.",
              "Explains the mechanism: dominating one segment creates the references that pull in the next — connecting beachhead → references → expansion.",
            ],
            solution:
              "The chasm is the gap between the early adopters who bought your product on vision and the early majority who won't. Early adopters are visionaries comfortable with rough edges; the early majority are pragmatists who buy only on references from people like them and demand a complete 'whole product' — integrations, support, proof, a finished solution. The tactics that won the visionaries (novelty, promise) fail with pragmatists, and a startup stalls in the chasm trying to sell the unfinished product to a skeptical mainstream. The way across is the beachhead applied to adoption: pick one narrow pragmatist segment, build the whole product they specifically need (not a generic platform), and win it so completely that those customers become the references the next pragmatists require. Dominate that beachhead, harvest its references and case studies, then expand to the adjacent segment — bowling-pin style — rather than attacking the entire early majority at once.",
            explanation: "Pragmatists need peer references and a whole product; cross by dominating one beachhead segment whose references pull in the next.",
          },
        ],
      },
    },
    {
      id: "e6",
      title: "Growth & Retention",
      summary: "The AARRR funnel, why retention is the foundation, and the engines of growth — sticky, viral, and paid.",
      prerequisites: ["e5"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e6l1",
          "title": "The Funnel: AARRR",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "AARRR — the pirate-metrics funnel",
              "statement": "Dave McClure's **AARRR** framework breaks the customer lifecycle into five measurable stages: **Acquisition** (a user arrives), **Activation** (their first successful experience — the \"aha\"), **Retention** (they come back), **Referral** (they bring others), and **Revenue** (they pay). Each stage has a conversion rate, and instrumenting all five turns vague \"growth\" into a diagnosable system: you can see *exactly* where users are lost."
            },
            {
              "type": "decision",
              "heading": "The five stages, their metric, and a common leak",
              "rows": [
                [
                  "Acquisition",
                  "Visitors / signups by channel. Leak: expensive, low-intent traffic that never activates."
                ],
                [
                  "Activation",
                  "% reaching the first 'aha' (the key action). Leak: onboarding friction — users sign up but never get value."
                ],
                [
                  "Retention",
                  "% of a cohort still active at week/month N. Leak: no durable value — the single most fatal leak."
                ],
                [
                  "Referral",
                  "Invites sent × conversion (the viral coefficient k). Leak: no reason or mechanism to share."
                ],
                [
                  "Revenue",
                  "% who pay; ARPU. Leak: value not captured by pricing/packaging."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Measure by cohort, not by cumulative totals",
              "body": "The funnel only tells the truth when measured by **cohort** — a group of users grouped by when they arrived — tracked over time. Cumulative totals (Unit 3's vanity metrics) hide decay; a cohort shows what fraction of *this week's* signups activated, then came back at week 1, 2, 4. Because the stages **multiply** (Unit 5's funnel result: output = inflow × ∏ stage rates), overall yield is capped by the *leakiest* stage — so the highest-leverage work is to find the worst-converting step in the cohort and fix that one first."
            },
            {
              "type": "example",
              "heading": "A two-stage funnel, worked",
              "body": "Start a cohort of **10,000** visitors. **30%** activate (reach the first key action): 10,000 × 0.30 = **3,000** activated. Of those, **40%** are still active at month 1 (retained): 3,000 × 0.40 = **1,200** month-1 retained users. The overall visitor→retained rate is 1,200/10,000 = 12%. If activation is the weak stage (30% is low), lifting it to 45% would raise retained users to 10,000 × 0.45 × 0.40 = 1,800 — a 50% gain from fixing one stage, with no extra acquisition spend."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Fix the leakiest stage, measured by cohort.** Because conversion rates multiply, a 2× improvement at the worst stage beats marginal gains everywhere else combined. And always read the funnel as cohorts over time — a healthy-looking cumulative chart can hide a retention stage that decays to zero."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A cohort: 10,000 visitors → 30% activate → 40% of activated users are retained at month 1. How many month-1 retained users? What is the overall visitor→retained conversion?",
                  "solution": "Activated = 10,000 × 0.30 = 3,000. Month-1 retained = 3,000 × 0.40 = 1,200. Overall conversion = 1,200 / 10,000 = 12% (= 0.30 × 0.40, since the stages multiply)."
                },
                {
                  "prompt": "In that funnel, you can improve either activation (30%→40%) or retention (40%→50%). Which yields more month-1 retained users, and what does it tell you about where to invest?",
                  "solution": "Activation 40%: 10,000 × 0.40 × 0.40 = 1,600. Retention 50%: 10,000 × 0.30 × 0.50 = 1,500. Improving the *worse* stage (activation, 30%) gives slightly more here (1,600 vs 1,500). Since rates multiply, target the lowest, most-movable stage — but note retention improvements also compound downstream (more retained users → more referral and revenue), so a retention gain is often worth more than this single-step count suggests."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e6l1-i1",
              "front": "What does AARRR stand for?",
              "back": "Acquisition, Activation, Retention, Referral, Revenue (Dave McClure's pirate metrics) — the five measurable stages of the customer lifecycle."
            },
            {
              "id": "e6l1-i2",
              "front": "Why measure the funnel by cohort?",
              "back": "Cohorts (users grouped by arrival time, tracked over time) reveal decay that cumulative totals hide — especially a retention stage that quietly falls to zero."
            },
            {
              "id": "e6l1-i3",
              "front": "Why does the leakiest stage dominate?",
              "back": "Stage conversion rates multiply (output = inflow × ∏ rates), so overall yield ≤ the smallest factor; fixing the worst stage gives the biggest gain."
            },
            {
              "id": "e6l1-i4",
              "front": "10,000 → 30% activate → 40% retained = ?",
              "back": "3,000 activated, then 1,200 month-1 retained (12% overall)."
            }
          ]
        },
        {
          "id": "e6l2",
          "title": "Retention Is the Foundation",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Retention and the retention curve",
              "statement": "**Retention** is the fraction of a cohort still active after a given time. Plotted over time it forms the **retention curve**: if it decays to zero, no one stays and there is no business; if it **flattens at a positive level**, a stable core keeps getting value — the quantitative signature of product-market fit (Unit 2). Retention is \"the foundation\" because every other metric is built on it: LTV, referral, and revenue all assume users stick around."
            },
            {
              "type": "text",
              "heading": "Why retention multiplies everything",
              "body": "Retention is the highest-leverage number in the whole model. From Unit 4, LTV = m·g/c, so LTV ∝ 1/(churn) — better retention directly inflates the value of every customer. Referral needs users present long enough to invite others. Activation is wasted spend if users don't return. Pour acquisition into a product that doesn't retain and you're filling a **leaky bucket**: you pay for users who drain out the bottom. The discipline (echoing Unit 2's \"PMF before scaling\") is to fix retention *first*, then add acquisition — and we can show exactly why with a steady-state argument."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The leaky bucket: retention sets the ceiling",
              "statement": "If each period you acquire A new users and lose fraction c of your existing base (retaining 1 − c), the user base converges to the steady state\n\n  U* = A / c.\n\nSo for a fixed acquisition rate, the *size* of your business is set by retention: halving churn doubles the ceiling — for free.",
              "proof": "The base evolves as U_{t+1} = (1 − c)·U_t + A: you keep a (1 − c) fraction and add A new users. A steady state U* is a fixed point: U* = (1 − c)·U* + A, hence c·U* = A and U* = A/c. The update map U ↦ (1 − c)U + A has slope (1 − c) with 0 < c ≤ 1, so |1 − c| < 1 and it is a contraction — U_t converges to U* from any starting point. ∎\n\n**Worked:** acquiring A = 1,000 new users/month at churn c = 10% gives a ceiling U* = 1,000/0.10 = 10,000 users. Halving churn to c = 5% — with *no change* to acquisition — doubles the ceiling to U* = 20,000. This is why retention beats acquisition: better retention raises the asymptote, while more acquisition only fills a bucket whose size is fixed by churn."
            },
            {
              "type": "decision",
              "heading": "Retention curve: healthy vs. doomed",
              "rows": [
                [
                  "Flattens at a positive level (e.g. ~35%)",
                  "A durable core keeps returning — product-market fit. Acquisition now compounds on a stable base."
                ],
                [
                  "Decays toward zero",
                  "No durable value — a leaky bucket. Acquisition spend evaporates; fix the product/onboarding before scaling."
                ],
                [
                  "'Smiling' curve (dips then rises)",
                  "Resurrected/expanding users (e.g. via re-engagement or new use cases) — a strong sign, base can exceed naive A/c."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Fix retention before pouring money into acquisition.** Acquisition only fills a bucket whose ceiling (A/c) is set by retention — spend on a leaky bucket drains away. A startup spending heavily on ads while month-1 retention is collapsing is paying to acquire users who immediately churn; the money would be better spent finding *why* they leave and fixing it."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You acquire 2,000 new users/month and your monthly churn is 8%. What user base does this converge to? What if you cut churn to 4%?",
                  "solution": "Steady state U* = A/c = 2,000 / 0.08 = 25,000 users. Cutting churn to 4% (no change to acquisition) gives U* = 2,000 / 0.04 = 50,000 — the base doubles. Retention sets the ceiling: halving churn doubles the business for the same acquisition spend."
                },
                {
                  "prompt": "A startup is spending heavily on ads to acquire users, but month-1 retention is low and falling. Explain, using the leaky-bucket result, why this is a mistake and what they should do.",
                  "solution": "Their user base is capped at U* = A/c, and low/falling retention means a large c — a low ceiling no matter how high A goes. Worse, every acquired user churns out fast, so the ad spend buys a brief blip, not a base: they're paying to fill a bucket with a big hole. The fix is to **stop scaling acquisition and fix retention first** — diagnose why users leave (onboarding, value, the wrong segment from Units 1–2), raise the retention curve so it flattens, and only then spend on acquisition, where it will now compound on a durable base."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e6l2-i1",
              "front": "What is the retention curve, and what does a healthy one look like?",
              "back": "The fraction of a cohort still active over time. Healthy: it flattens at a positive level (a durable core) — the signature of PMF. Doomed: it decays to zero."
            },
            {
              "id": "e6l2-i2",
              "front": "The leaky-bucket steady state?",
              "back": "U* = A/c (acquisition rate ÷ churn). Retention sets the ceiling on the user base; halving churn doubles it for the same acquisition."
            },
            {
              "id": "e6l2-i3",
              "front": "Why is retention the highest-leverage metric?",
              "back": "LTV ∝ 1/churn (Unit 4), referral needs retained users, and acquisition is wasted if users don't stay. It multiplies everything downstream."
            },
            {
              "id": "e6l2-i4",
              "front": "Why fix retention before scaling acquisition?",
              "back": "Acquisition only fills a bucket whose ceiling A/c is set by churn; spending on a leaky bucket drains away. Raise retention first, then acquisition compounds."
            }
          ]
        },
        {
          "id": "e6l3",
          "title": "Engines of Growth & Virality",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The three engines of growth (Ries)",
              "statement": "Ries identifies three self-reinforcing growth engines, each tuned by a different metric: the **sticky** engine (compound growth from high retention — keep more than you lose, and the base grows on its own); the **viral** engine (existing users bring new users through normal use, measured by the viral coefficient k); and the **paid** engine (reinvest the margin LTV − CAC from each customer into acquiring more). A startup should focus on *one* engine at a time — the metrics and tactics differ."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Viral coefficient",
              "statement": "The **viral coefficient** k measures how many *new* users each existing user generates: k = (invitations sent per user) × (conversion rate per invitation). It is the average number of successful referrals one user produces. k is the engine's gain; whether growth fizzles, sustains, or explodes depends entirely on whether k is below, at, or above 1."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Viral growth and the k = 1 threshold",
              "statement": "Seeding one user yields, in total, 1/(1 − k) users when k < 1 (a finite amplification), grows without bound — exponentially — when k > 1, and sits exactly at the critical threshold when k = 1. Sustained k > 1 is true viral growth; k < 1 merely *amplifies* whatever other channel seeds the users.",
              "proof": "One seeded user brings k users in the first generation; each of those brings k, for k² in the second generation; and so on. The total descended from one seed is the geometric series\n\n  1 + k + k² + k³ + ⋯ = Σ_{g=0}^{∞} kᵍ.\n\nFor k < 1 this converges to 1/(1 − k): a finite multiplier (k = 0.5 ⇒ 2× amplification; k = 0.8 ⇒ 5×). For k ≥ 1 the series diverges — each generation is at least as large as the last, so the user count grows without bound, strictly exponentially when k > 1. k = 1 is the knife-edge between fizzling to a finite multiple and exploding. ∎\n\nNote that **cycle time** (how long one generation takes) governs *how fast* this compounds — two products with the same k > 1 grow at very different speeds if one's referral loop closes in a day and the other's in a month."
            },
            {
              "type": "example",
              "heading": "k = 1, exactly on the edge",
              "body": "Each user sends **5** invites that convert at **20%**: k = 5 × 0.20 = **1.0**. At k = 1 each user exactly replaces themselves once — growth is sustained but not yet exponential (the total from a seed is unbounded only in the limit, and any real-world decay tips it below). Improve either lever a little — 6 invites (k = 1.2) or 25% conversion (k = 1.25) — and the loop crosses into compounding, self-sustaining growth; slip to 4 invites (k = 0.8) and a seed amplifies only 5× before dying out. The threshold at k = 1 is where \"growth hack\" becomes \"growth engine.\""
            },
            {
              "type": "decision",
              "heading": "Which engine fits which business",
              "rows": [
                [
                  "Sticky (tune: churn/retention)",
                  "High-switching-cost or habitual products (databases, ERP, social). Win by retaining; the base compounds."
                ],
                [
                  "Viral (tune: k and cycle time)",
                  "Products whose value involves others (messaging, collaboration, marketplaces). Win by raising k > 1 and shortening the loop."
                ],
                [
                  "Paid (tune: LTV − CAC and payback)",
                  "Products with strong unit economics and a scalable channel. Win by reinvesting per-customer margin into acquisition."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**True virality (sustained k > 1) is rare.** Most \"viral\" growth is k < 1 — a finite amplifier (1/(1−k)) on top of a paid or sticky engine, not a perpetual motion machine. Don't bet the company on a viral coefficient you haven't measured; instrument invites and conversion, compute k, and be honest about which engine is actually driving growth."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Each user sends 5 invites and 20% convert. Compute the viral coefficient k and interpret it. What total amplification does a seed get if instead 4 invites convert at 20%?",
                  "solution": "k = invites × conversion = 5 × 0.20 = 1.0 — exactly the critical threshold: each user replaces themselves once, so growth is just barely self-sustaining and any decay tips it below. With 4 invites at 20%, k = 0.8 < 1, so growth is *not* self-sustaining; a seed amplifies by a finite 1/(1 − 0.8) = 5× and then dies out. Crossing k = 1 is the line between an amplifier and an engine."
                },
                {
                  "prompt": "A consumer messaging app and an enterprise database both want to grow. Which engine of growth fits each, and what single metric should each obsess over?",
                  "solution": "**Messaging app → viral engine**: its value inherently involves inviting others, so it should obsess over the **viral coefficient k** (invites × conversion) and **cycle time**, pushing k > 1 with a fast loop. **Enterprise database → sticky engine**: high switching costs and daily dependence mean growth comes from *keeping* customers, so it should obsess over **retention/churn** (and net revenue retention). Matching engine to business type focuses effort on the one lever that actually compounds for that product."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e6l3-i1",
              "front": "The three engines of growth (Ries)?",
              "back": "Sticky (compounds via retention), viral (users bring users, tuned by k), paid (reinvest LTV−CAC margin into acquisition). Focus on one at a time."
            },
            {
              "id": "e6l3-i2",
              "front": "Viral coefficient formula?",
              "back": "k = (invites sent per user) × (conversion rate per invite) — the average number of new users each user generates."
            },
            {
              "id": "e6l3-i3",
              "front": "What happens for k<1, k=1, k>1?",
              "back": "k<1: finite amplification 1/(1−k); k=1: critical knife-edge; k>1: unbounded exponential growth. Sustained k>1 is true virality."
            },
            {
              "id": "e6l3-i4",
              "front": "k = 5 invites × 20% conversion = ?",
              "back": "k = 1.0 — exactly critical: each user replaces themselves once; a small improvement tips it into compounding growth."
            },
            {
              "id": "e6l3-i5",
              "front": "Why does cycle time matter alongside k?",
              "back": "k sets whether growth compounds; cycle time (how fast a generation refers) sets how FAST it compounds — same k, very different speed."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e6-check",
        questions: [
          { id: "e6q1", type: "short", prompt: "Dave McClure's pirate-metrics funnel — AARRR — stands for Acquisition, Activation, Retention, Referral, and ____.", accept: ["Revenue", "revenue"], explanation: "Acquisition, Activation, Retention, Referral, Revenue." },
          { id: "e6q2", type: "numeric", prompt: "Virality: each user sends 5 invites and 20% convert. What is the viral coefficient k? (k = invites × conversion rate)", answer: 1, tolerance: 0.001, explanation: "k = 5 × 0.20 = 1.0 — exactly self-sustaining." },
          { id: "e6q3", type: "mcq", prompt: "Why fix retention before pouring money into acquisition?", options: ["acquiring users into a high-churn 'leaky bucket' wastes spend — retention is the foundation of growth", "acquisition is free", "retention doesn't affect growth", "investors only look at acquisition"], answer: 0, explanation: "Acquisition amplifies whatever retention you have, including zero." },
          { id: "e6q4", type: "numeric", prompt: "AARRR funnel: 10,000 visitors → 30% activate → 40% of activated users are retained at month 1. How many month-1 retained users is that?", answer: 1200, tolerance: 0, explanation: "10,000 × 0.30 × 0.40 = 1,200." },
          {
            id: "e6q5",
            type: "open",
            points: 3,
            prompt: "A startup is spending heavily on ads to acquire users, but month-1 retention is only 5%. Explain why scaling acquisition now is a mistake and what they should fix first. Reference the leaky-bucket idea and AARRR.",
            rubric: [
              "Quantifies the leak: 5% retention means ~95% churn within a month, so acquisition spend is mostly wasted.",
              "Explains the leaky bucket: paid growth on bad retention is rented, not owned — it stops the moment spend stops.",
              "Locates the problem in AARRR as Activation/Retention, not Acquisition; prescribes diagnosing why users don't stick (onboarding, aha moment, real PMF).",
              "Concludes: fix retention/activation until cohorts plateau before scaling acquisition.",
            ],
            solution:
              "Month-1 retention of 5% means 95% of acquired users are gone within a month — the bucket is almost all holes. Pouring ad money in is lighting cash on fire: you pay CAC for users who never return, so growth is rented and collapses the instant you stop spending. In AARRR terms the leak isn't Acquisition; it's Activation and Retention. Before scaling spend, diagnose why new users don't stick — weak onboarding, never reaching the core-value 'aha' moment, or, most fundamentally, no real product-market fit (a product people don't actually need won't retain). Fix activation and retention until cohort curves flatten at a healthy plateau; only then does acquisition compound instead of evaporate. Retention is the foundation — acquisition merely amplifies whatever retention you already have.",
            explanation: "95% churn makes paid acquisition wasteful; fix activation/retention (the real leak) until cohorts plateau before scaling spend.",
          },
          {
            id: "e6q6",
            type: "open",
            points: 3,
            prompt: "Explain the three engines of growth (sticky, viral, paid). For a consumer mobile app with weak word-of-mouth, recommend which engine to focus on and why, referencing the k-factor.",
            rubric: [
              "Correctly explains sticky (retention compounds), viral (users bring users, measured by k-factor), and paid (LTV−CAC funds acquisition).",
              "Argues the viral engine is unavailable here — weak word-of-mouth means k well below 1, so virality can't carry growth.",
              "Recommends focusing on the sticky engine (retention/engagement) as the foundation, and notes paid is viable only once LTV comfortably exceeds CAC.",
              "Avoids the mistake of forcing virality onto a product people don't love.",
            ],
            solution:
              "Sticky growth comes from high retention: users stay and engage, so the base compounds. Viral growth comes from each user bringing new users, measured by the k-factor (k = invites per user × invite conversion); k ≥ 1 is exponential and self-sustaining. Paid growth comes from spending on acquisition where LTV exceeds CAC, recycling profit into more ads. For a consumer app with weak word-of-mouth, the viral engine is effectively off — its k-factor is far below 1, so betting on virality won't work. Focus first on the sticky engine: improve retention and engagement so the existing base compounds and the product earns real love — which is also the precondition for any other engine. Paid growth becomes viable only once retention is strong enough that LTV clearly beats CAC; spending to acquire users who don't stick just burns cash. Forcing virality onto a product people don't already love is the classic error — make it sticky first.",
            explanation: "Weak word-of-mouth means k < 1, so virality is out; build the sticky (retention) engine first, then paid once LTV > CAC.",
          },
        ],
      },
    },
    {
      id: "e7",
      title: "Fundraising & Financing",
      summary: "Whether to raise at all, how VC math works, and the cap-table and term-sheet mechanics that decide what founders keep.",
      prerequisites: ["e6"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e7l1",
          "title": "Bootstrapping vs Venture, and the Power Law",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Should you raise at all?",
              "body": "Venture capital is not free money and not a milestone to celebrate by default — it is **selling a permanent slice of your company** and signing up for a specific, demanding path: rapid growth toward a large exit on the investors' timeline. For some businesses that's exactly right; for others it's a trap that swaps a great independent company for a mediocre venture-scale gamble. The first fundraising decision is not \"how much?\" but \"should we raise venture money *at all*?\" — and the answer follows from how VC economics work."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Venture capital",
              "statement": "**Venture capital** is equity financing for high-risk, high-growth startups, supplied by funds that themselves must return capital (plus a large multiple) to *their* investors (LPs). A VC buys ownership in exchange for cash, betting on a small chance of an enormous outcome. Crucially, VCs invest from a portfolio and need **fund-returners**: companies that can plausibly become very large (hundreds of millions to billions in value)."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The power law of venture returns",
              "statement": "Venture portfolio returns are dominated by a few extreme winners, not the average: most investments return ≈ 0, and a small number return enormous multiples that carry the whole fund. Consequently a VC requires each new investment to be *capable* of returning a meaningful fraction of the entire fund — which filters for businesses that can become very large.",
              "proof": "Consider a fund of size F making N investments that aims to return a multiple M (e.g. F = $100M, M = 3, target $300M). If a fraction of bets go to zero and only the top one or two produce nearly all the proceeds, then to hit M·F the fund needs at least one outcome on the order of M·F itself — here ~$300M of value created from a single position. An investment that, even if wildly successful, could only ever be worth (say) $20M cannot move a $100M fund and so is **un-fundable by that VC**, regardless of how good a business it is. Hence VCs select for the *ceiling* of an outcome — \"could this be a $1B company?\" — not for its expected value or its odds of modest success. ∎\n\nThis is why a solid, likely-profitable business can be a poor *venture* investment: VC math rewards a small chance of an enormous outcome over a high chance of a good one."
            },
            {
              "type": "decision",
              "heading": "Bootstrap vs. raise venture",
              "rows": [
                [
                  "Raise VC when…",
                  "The business can plausibly become very large (a power-law outcome), winning requires capital *now* (winner-take-most market, speed matters), and you accept the growth-and-exit path."
                ],
                [
                  "Bootstrap when…",
                  "The business is great but not venture-scale (e.g. a steady climb to a few $M/year of profit), you value control and optionality, or revenue can fund growth. A wonderful company; a wrong fit for VC."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Bootstrapping: grow on revenue, keep control",
              "body": "Bootstrapping funds growth from revenue (and sometimes debt or revenue-based financing) instead of selling equity. You keep ownership, control, and the freedom to optimize for profit and longevity rather than a forced exit. The trade-off is slower growth and no war chest to win a land-grab market. For a business heading to, say, $5M/year of profitable revenue with no need to dominate a winner-take-all market, bootstrapping usually *beats* raising — you'd otherwise dilute and commit to a venture exit you don't need."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**VC fits the business, or it doesn't — don't raise by default.** Taking venture money for a sustainable, modest-outcome business signs you up for a power-law exit the company can't deliver, misaligning you with investors who *need* a huge result. Raise only if the company can plausibly be enormous and capital is what unlocks that; otherwise keep your equity and your options."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A solid, profitable business expects to reach $5M/year in revenue and grow steadily, in a market with no winner-take-all dynamics. Should it raise venture capital? Justify using the power law.",
                  "solution": "Almost certainly **no**. VC returns follow a power law: funds need each investment capable of returning a large fraction of the fund (a $100M+ outcome), so they select for businesses that can become *very large* fast. A steady climb to a few million a year of profit — however excellent as a business — can't be a fund-returner, so it's a poor venture fit. Raising would dilute the founders and commit them to a growth-and-exit path the market doesn't support, misaligning them with investors who *need* a huge exit. Bootstrapping (grow on revenue, keep control) fits far better; if outside money helps, revenue-based or debt financing avoids the venture mismatch."
                },
                {
                  "prompt": "Why does a VC care more about a company's *potential ceiling* ($1B?) than its *probability* of a modest success?",
                  "solution": "Because portfolio returns are dominated by a few extreme winners. A fund must return a multiple of its size, and that comes almost entirely from its biggest outcomes — so a position that can't get large enough to move the fund is worthless to the VC even if it's very likely to succeed modestly. The VC optimizes the *tail* (could this be enormous?), accepting a high chance of zero on each bet, rather than the expected value or the odds of a small win."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e7l1-i1",
              "front": "What is venture capital, and what do VCs need?",
              "back": "Equity financing for high-risk, high-growth startups from funds that must return a large multiple to their LPs. They need fund-returners: companies that can become very large."
            },
            {
              "id": "e7l1-i2",
              "front": "The power law of venture returns?",
              "back": "A few extreme winners produce nearly all returns; most investments ≈ 0. So VCs require each bet to be CAPABLE of returning much of the fund — selecting for huge potential ceilings."
            },
            {
              "id": "e7l1-i3",
              "front": "When should you raise VC vs bootstrap?",
              "back": "VC: plausibly very large outcome, capital needed now, accept growth-and-exit path. Bootstrap: great-but-not-venture-scale business, value control, revenue can fund growth."
            },
            {
              "id": "e7l1-i4",
              "front": "Why is a profitable $5M/year business often a bad VC fit?",
              "back": "It can't be a fund-returner (no power-law outcome), so raising dilutes founders and forces a venture exit the market can't deliver — misaligned with investors who need a huge result."
            }
          ]
        },
        {
          "id": "e7l2",
          "title": "Stages & the Cap Table",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Pre-money, post-money, and the cap table",
              "statement": "**Pre-money valuation** is what a company is deemed worth *before* new investment; **post-money** is the value immediately *after* the cash goes in. The **capitalization table (cap table)** records who owns what — founders, the employee option pool, and investors — as percentages and share counts. Every financing round updates the cap table by issuing new shares to investors, which dilutes existing holders."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Post-money valuation and investor ownership",
              "statement": "Raising investment I at pre-money valuation P gives post-money valuation\n\n  Post = P + I,\n\nthe new investors own I / Post = I/(P + I), and existing shareholders are diluted to P / Post = P/(P + I) of the company.",
              "proof": "Post-money value is the pre-money business (worth P) plus the new cash (I), so Post = P + I. The investors paid I, and share price is set so their stake equals their money at the post-money valuation: ownership = I / Post = I/(P + I). All previously-issued shares still represent the pre-money value P, now a slice P / Post = P/(P + I) of the larger whole. The two shares sum to 1, as they must. ∎\n\n**Worked:** raising I = $2M at P = $8M pre-money gives Post = $8M + $2M = **$10M**; the new investors own $2M/$10M = **20%**, and prior holders (founders + pool) retain $8M/$10M = 80%."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Dilution is multiplicative across rounds",
              "statement": "If across rounds 1..n new investors take fractions f₁,…,fₙ (so existing holders keep 1 − fᵢ = Pᵢ/Postᵢ each round), a founder's ownership after round n is\n\n  ownershipₙ = ownership₀ × ∏_{i=1}^{n} (1 − fᵢ).\n\nDilution **compounds** (multiplies); it does not add.",
              "proof": "Each round issues new shares to investors taking fraction fᵢ, scaling every existing holder's percentage by the survival factor (1 − fᵢ). Applying rounds in sequence multiplies these factors: after round n, a founder holds ownership₀ · ∏_{i=1}^{n}(1 − fᵢ). ∎\n\n**Worked:** a founder starting at 100% who gives up 20% in a seed and 25% in Series A retains 1.00 × (1 − 0.20) × (1 − 0.25) = 1.00 × 0.80 × 0.75 = **60%**. Note two *20%* rounds would leave 0.80 × 0.80 = **64%**, not the 60% a naive \"100 − 20 − 20\" subtraction suggests — because the second round only takes 20% of what *remains*. Option-pool top-ups dilute by the same multiplicative rule."
            },
            {
              "type": "text",
              "heading": "The option pool (and the 'pool shuffle')",
              "body": "Startups reserve an **employee option pool** (often 10–20%) to hire. The subtlety: investors usually require the pool to be created (or topped up) **pre-money**, meaning it comes out of the *founders'* and existing holders' ownership before the round, not the new investor's. A larger pre-money pool is therefore effectively a hidden discount to the valuation — a \"pool shuffle\" that dilutes founders more than the headline pre-money implies. Always model the pool's source when comparing term sheets."
            },
            {
              "type": "decision",
              "heading": "Funding stages and what each buys",
              "rows": [
                [
                  "Pre-seed / seed",
                  "Find product-market fit: small checks for a small team to search (Units 1–3). Sold on team + early signal."
                ],
                [
                  "Series A",
                  "Scale a *working* model: proven PMF and early unit economics, raise to build the go-to-market engine (Units 4–6)."
                ],
                [
                  "Series B and beyond",
                  "Pour fuel on a proven engine: expand markets, teams, and product once growth is repeatable and efficient."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Model the whole journey, not one round.** Because dilution multiplies, what matters is your ownership *at exit* after seed, A, B, C and pool top-ups — not the dilution of any single round. A founder can feel fine giving up 20% once and be startled to own ~15% after four rounds. Build a simple cap-table model early and update it every round."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You raise $2M on an $8M pre-money valuation. Compute the post-money valuation and the new investors' ownership percentage.",
                  "solution": "Post-money = pre + investment = $8M + $2M = $10M. Investor ownership = investment / post-money = $2M / $10M = 20%. Founders + existing holders retain $8M/$10M = 80%."
                },
                {
                  "prompt": "A founder owns 100%, then gives up 20% (seed), 25% (Series A), and 15% (Series B) to investors. What is their ownership after Series B? Why isn't it 100 − 20 − 25 − 15 = 40%?",
                  "solution": "Ownership multiplies: 1.00 × (1−0.20) × (1−0.25) × (1−0.15) = 0.80 × 0.75 × 0.85 = 0.51 = **51%**. It isn't 40% because each round only takes its fraction of what *remains*, not of the original whole — dilution compounds (multiplies), it doesn't subtract. (Any employee-pool top-ups would multiply in further.)"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e7l2-i1",
              "front": "Post-money valuation and investor ownership?",
              "back": "Post = pre + investment. Investor % = investment / post; existing holders retain pre / post. E.g. $2M on $8M pre → $10M post, 20% to investors."
            },
            {
              "id": "e7l2-i2",
              "front": "How does dilution compound across rounds?",
              "back": "Ownership = initial × ∏(1 − fᵢ) = ∏(preᵢ/postᵢ). It multiplies, not adds — each round takes its fraction of what remains."
            },
            {
              "id": "e7l2-i3",
              "front": "Why isn't giving up 20% then 25% a 45% loss?",
              "back": "0.80 × 0.75 = 60% retained (40% lost), not 55% — the second round only takes 25% of the remaining 80%. Dilution multiplies."
            },
            {
              "id": "e7l2-i4",
              "front": "The option-pool 'shuffle'?",
              "back": "Investors usually require the pool created/topped-up pre-money, so it dilutes founders (not the new investor) — a hidden discount to the headline valuation."
            },
            {
              "id": "e7l2-i5",
              "front": "Why model the whole funding journey?",
              "back": "Dilution compounds, so what matters is ownership at exit after all rounds + pool top-ups — not any single round. Build a cap-table model early."
            }
          ]
        },
        {
          "id": "e7l3",
          "title": "Term Sheets & the Process",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Term sheet",
              "statement": "A **term sheet** is a (mostly non-binding) outline of a financing's key terms, in two buckets: **economics** — valuation, the option pool, and the **liquidation preference** (who gets paid what, and in what order, at an exit) — and **control** — board composition, voting, and protective provisions (vetoes over major decisions). The headline valuation is only one term; the economics and control terms can matter more to founder outcomes than the price."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Liquidation preference",
              "statement": "A **liquidation preference** entitles preferred investors to be paid before common shareholders in an exit. A **1× preference** returns their money first; the multiple can be higher (2×, 3×). **Non-participating**: the investor takes the *greater* of their preference or their as-converted ownership share. **Participating** (\"double dip\"): they take the preference *and then also* share pro-rata in the remainder. Preferences reallocate proceeds toward investors and bite hardest in small-to-moderate exits."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Liquidation preference can dominate the headline ownership",
              "statement": "With a 1× non-participating preference, an investor who put in I for ownership ω receives, at exit value E, payout = max(I, ω·E). In a small exit the preference (I) wins and common holders split only E − I, so the founders' headline ownership % overstates their actual proceeds.",
              "proof": "Non-participating means the investor elects, at exit, whichever is larger: take the preference (their I back) or convert to common and take ω·E. So payout = max(I, ω·E); common holders divide the remainder E − payout. ∎\n\n**Worked:** investor put I = $5M for ω = 25%, 1× non-participating; company exits at E = $8M. The investor takes max($5M, 0.25 × $8M = $2M) = **$5M** (the preference wins), leaving common just $3M — *far* less than the $6M a naive \"founders own 75%\" reading implies. At a large exit, say E = $80M, ω·E = $20M > $5M, so the investor converts and the preference is irrelevant. Preferences matter most exactly when the exit is modest — the case founders most need to plan for."
            },
            {
              "type": "decision",
              "heading": "Founder-friendly vs. onerous terms",
              "rows": [
                [
                  "Cleaner / friendlier",
                  "1× non-participating preference; standard board balance; a pool sized to real hiring needs; few extra protective provisions."
                ],
                [
                  "Onerous (beware)",
                  "Participating preference or >1× multiple; investor board control; large pre-money pool ('shuffle'); broad veto rights and full-ratchet anti-dilution."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Running the process",
              "body": "Fundraising is a sales process with you as the product. Leverage comes from **momentum and options**: run a tight, time-boxed process so conversations converge, and aim to generate **more than one term sheet** — competition is what improves terms, not pleading. Optimize for the *right partner* (the person who'll be on your board for years) and *clean terms*, not merely the highest headline valuation, since a high valuation paired with a participating 2× preference and tight control can leave you worse off than a lower, clean deal."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't optimize the headline valuation in isolation.** A higher valuation with a participating or multiple preference, an inflated pre-money option pool, and investor board control can be worth less to founders than a lower valuation with clean 1× non-participating terms. Read the economics *and* control terms together, and model the payout at a *modest* exit, where bad preferences do the most damage."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An investor put in $5M for 25% with a 1× non-participating liquidation preference. Compute their payout and the common holders' total if the company exits at (a) $8M and (b) $80M.",
                  "solution": "Payout = max(I, ω·E). (a) E = $8M: max($5M, 0.25×$8M = $2M) = $5M to the investor; common split E − $5M = $3M. (The naive 75% share would have been $6M — the preference cost common $3M.) (b) E = $80M: max($5M, 0.25×$80M = $20M) = $20M; the investor converts (preference irrelevant), common get $60M. Preferences bite in small exits, vanish in large ones."
                },
                {
                  "prompt": "Term Sheet A: $12M pre-money, 2× participating preference, investor board control. Term Sheet B: $9M pre-money, 1× non-participating, balanced board. Why might a founder rationally prefer B despite the lower valuation?",
                  "solution": "Because economics and control can outweigh the headline price. A's **2× participating** preference means the investor takes 2× their money *and then also* shares the remainder — gutting founder proceeds in any but a huge exit — and **board control** can override founder decisions and force an exit. B's **1× non-participating, balanced board** is far cleaner: in a modest exit founders keep much more, and they retain control. The extra $3M of headline valuation in A is often illusory once you model payouts at a realistic exit and account for who controls the company."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e7l3-i1",
              "front": "What two buckets of terms does a term sheet cover?",
              "back": "Economics (valuation, option pool, liquidation preference) and control (board seats, voting, protective provisions/vetoes). Valuation is just one term."
            },
            {
              "id": "e7l3-i2",
              "front": "What is a liquidation preference?",
              "back": "Preferred investors get paid before common in an exit. 1× returns their money first; non-participating = greater of preference or as-converted; participating = preference plus pro-rata share."
            },
            {
              "id": "e7l3-i3",
              "front": "1× non-participating payout formula?",
              "back": "payout = max(I, ω·E) at exit value E. In small exits the preference (I) dominates, so common get E − I — less than the headline ownership implies."
            },
            {
              "id": "e7l3-i4",
              "front": "Why not optimize headline valuation alone?",
              "back": "A high valuation with a participating/multiple preference, big pre-money pool, and investor control can net founders less than a lower, clean 1× non-participating deal."
            },
            {
              "id": "e7l3-i5",
              "front": "Where does leverage in fundraising come from?",
              "back": "Momentum and options — run a tight, time-boxed process and get more than one term sheet; competition improves terms. Optimize for the right partner and clean terms."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e7-check",
        questions: [
          { id: "e7q1", type: "numeric", prompt: "You raise $2M on an $8M pre-money valuation. What is the post-money valuation, in millions of dollars?", answer: 10, tolerance: 0, explanation: "post-money = pre-money + investment = $8M + $2M = $10M." },
          { id: "e7q2", type: "numeric", prompt: "With $2M raised at an $8M pre-money ($10M post-money), what percentage of the company do the new investors own?", answer: 20, tolerance: 0.1, explanation: "investment ÷ post-money = $2M ÷ $10M = 20%." },
          { id: "e7q3", type: "mcq", prompt: "Venture capital is the right financing for:", options: ["companies that could plausibly reach a very large, venture-scale, exit-bound outcome", "every small business", "only already-profitable businesses", "companies that never want to sell or go public"], answer: 0, explanation: "The power law requires fund-returning outcomes." },
          { id: "e7q4", type: "short", prompt: "A ____ preference means investors are paid back before common shareholders in an exit.", accept: ["liquidation", "liquidation preference", "liq"], explanation: "The liquidation preference sets the payout order." },
          {
            id: "e7q5",
            type: "open",
            points: 3,
            prompt: "A solid, profitable business expects to reach $5M/year in revenue and grow slowly. A founder wants to raise venture capital for it. Explain why VC is likely the wrong fit, using the power law and what VCs need from an investment.",
            rubric: [
              "Explains the power law: a fund's returns come from a few huge winners that must each return the whole fund.",
              "Argues a steady ~$5M business can't produce a fund-returning outcome or a large exit on a VC timeline.",
              "Notes the mismatch isn't a failure — most good businesses aren't venture-backable.",
              "Recommends a fitting alternative (bootstrapping, debt, revenue-based financing) that preserves control and suits steady growth.",
            ],
            solution:
              "Venture capital runs on a power law: a fund makes many bets, most return little, and a tiny number of huge winners must return the entire fund and more. A VC therefore can only back companies that could plausibly become very large — large enough to return their whole fund — and that offer an exit (acquisition or IPO) to realize it. A solid business that tops out around $5M/year and grows slowly, however excellent, can't produce that fund-returning outcome and offers no exit on a VC's timeline, so it's simply the wrong shape for venture money. Taking VC would also saddle a healthy, controllable business with investors who need an outcome it can't deliver and who will push for reckless, growth-at-all-costs behavior. That's not a failure — most good businesses aren't venture-backable. The right financing is bootstrapping from the profits it already generates, a bank loan or line of credit, or revenue-based financing, all of which fit steady, profitable, founder-controlled growth.",
            explanation: "The power law needs fund-returning outcomes; a steady $5M business can't deliver one — bootstrap or use debt instead.",
          },
          {
            id: "e7q6",
            type: "open",
            points: 3,
            prompt: "Explain dilution, and why founders should care about more than the headline valuation in a term sheet. Reference at least two terms (e.g., option pool, liquidation preference) that affect what founders actually keep.",
            rubric: [
              "Defines dilution: issuing new shares reduces existing holders' ownership percentage (ideally of a larger pie).",
              "Explains that the headline valuation is only one input to founder outcome.",
              "Explains the option pool / pool-shuffle: a pool carved from the pre-money makes founders absorb that dilution, lowering the effective price.",
              "Explains the liquidation preference: investors are paid first, which can gut founder proceeds in a modest exit even at a high valuation.",
            ],
            solution:
              "Dilution is the reduction in your ownership percentage when new shares are issued: a raise creates new shares for investors, so your slice shrinks (you hope the whole pie grows enough to more than compensate). The headline valuation is only one input into what founders actually walk away with. Two terms matter especially. The option pool: investors usually require a new employee option pool carved out of the pre-money valuation, so founders — not investors — absorb that dilution (the 'option-pool shuffle'); a larger pool at a fixed pre-money quietly lowers your effective price per share. The liquidation preference: investors are paid back first in an exit, commonly 1× their money and sometimes participating or a multiple, which can gut founder proceeds in a modest exit even when the nominal valuation looked great. So a high valuation paired with a big option pool and a 2× participating preference can leave founders worse off than a lower valuation with clean terms — optimize for ownership × outcome × clean terms, not the headline number.",
            explanation: "Dilution shrinks your %; the option pool and liquidation preference can matter more than the valuation for what founders keep.",
          },
        ],
      },
    },
    {
      id: "e8",
      title: "Team, Org & Execution",
      summary: "Why the team is the bet, how to split equity and vest it, and how early hiring and execution differ from a big company.",
      prerequisites: ["e7"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e8l1",
          "title": "The Founding Team",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Investors bet on the jockey, not just the horse",
              "body": "Ask early-stage investors what they bet on and the answer is almost always **the team** before the idea. The reason is structural: the initial idea is a hypothesis that will likely **pivot** (Unit 3), the market will shift, and the plan will be wrong in ways no one can foresee — but the *team* is what navigates all of that. A great team in a mediocre initial idea finds a better one; a weak team in a great idea fumbles it. Execution, resilience, and the ability to learn fast are properties of people, not slides."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Founder–market fit",
              "statement": "**Founder–market fit** is the founders' specific, hard-to-replicate advantage for *this* problem and market: deep domain expertise, unusual access to customers or talent, a personal obsession that sustains them through years of grind, or insight earned from living the problem. It's the team-level analogue of product–market fit — the reason *these* founders are unusually likely to win *this* market, rather than anyone with the same idea."
            },
            {
              "type": "text",
              "heading": "Co-founders: the highest-variance decision",
              "body": "Most enduring startups have more than one founder — for complementary skills (the classic \"builder + seller\"), shared workload, and mutual resilience through the lows. But the co-founder relationship is also the **single highest-variance factor** in a young company: a strong, aligned pair compounds, while a misaligned one is among the most common causes of early death. The antidote is to align *explicitly and early* — on vision, roles and decision rights, equity, commitment level, and what happens if someone wants to leave — *before* the pressure hits, not during the first crisis."
            },
            {
              "type": "decision",
              "heading": "Strong vs. weak founding-team signals",
              "rows": [
                [
                  "Strong",
                  "Complementary skills covering build + sell; genuine founder–market fit; explicit alignment on vision/roles/equity; a track record of working together through hard things."
                ],
                [
                  "Weak",
                  "Overlapping skills (two of the same), no unfair advantage for this market, unspoken assumptions about roles or equity, met last month with no shared adversity tested."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Co-founder conflict is a leading cause of early-startup death** — frequently cited alongside \"no market need\" and \"ran out of cash.\" Unaligned vision, unclear roles, or a resented equity split detonates under stress. Have the hard conversations (and write them down: roles, equity, vesting, decision-making, exit) *before* you build, when it's cheap to disagree."
            },
            {
              "type": "example",
              "heading": "Complementary, aligned, and tested",
              "body": "A strong pair: one founder is a domain expert who spent eight years *inside* the industry they're disrupting (founder–market fit and customer access); the other is a senior engineer who can build the product (complementary skill). They've shipped a side project together through a stressful deadline (tested under adversity), agreed a 50/50 split with 4-year vesting, and written down who is CEO and how they break ties. Contrast a weak pair: two engineers who met at a hackathon last month, both want to \"do product and strategy,\" haven't discussed equity, and have no special advantage in the market they picked."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Why do experienced investors say they bet on the team more than the idea? Give the structural reason, not just a platitude.",
                  "solution": "Because the initial idea is a hypothesis that will likely pivot, the market will shift, and the plan will be wrong in unforeseeable ways — so the durable asset isn't the idea, it's the team that *navigates* all that change. A strong team in a weak idea finds a better one (execution, learning, resilience are team properties); a weak team squanders a great idea. The idea is a starting point with a short half-life; the team is what persists and adapts across pivots."
                },
                {
                  "prompt": "Two strangers with identical engineering backgrounds want to co-found a fintech startup neither has worked in. Name two founding-team weaknesses and how to address them.",
                  "solution": "(1) **No complementary skills** — two of the same (both engineers) leaves selling, distribution, and domain covered by neither; address by finding a co-founder with go-to-market or fintech-domain strength, or one consciously owning that lane. (2) **No founder–market fit** — neither has fintech expertise, access, or earned insight, so they have no unfair advantage; address by deeply immersing (customer development), recruiting domain expertise, or picking a market where they *do* have an edge. Also: as strangers, they should explicitly align on vision/roles/equity/vesting before building, since untested relationships fracture under stress."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e8l1-i1",
              "front": "What do early-stage investors bet on most, and why?",
              "back": "The team. The idea will pivot and the plan will be wrong; the team is what navigates change — execution, learning, and resilience are team properties."
            },
            {
              "id": "e8l1-i2",
              "front": "What is founder–market fit?",
              "back": "The founders' hard-to-replicate advantage for this market: domain expertise, customer/talent access, obsession, or earned insight — why THESE founders are likely to win THIS market."
            },
            {
              "id": "e8l1-i3",
              "front": "Why are co-founders the highest-variance decision?",
              "back": "A strong, aligned pair compounds; a misaligned one is among the top causes of early failure. Align explicitly and early on vision, roles, equity, commitment, and exit."
            },
            {
              "id": "e8l1-i4",
              "front": "How do you de-risk the co-founder relationship?",
              "back": "Have the hard conversations before building — vision, roles/decision rights, equity, vesting, and what happens if someone leaves — and write them down while it's cheap to disagree."
            }
          ]
        },
        {
          "id": "e8l2",
          "title": "Equity & Vesting",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Splitting equity: weigh the future, not the idea",
              "body": "Founder equity should reflect **expected future contribution, risk, and commitment** — who is going all-in, who is taking the salary cut, who is critical to execution — far more than who \"had the idea.\" The common 90/10 demand on the grounds of \"it was my idea\" is almost always a mistake: ideas are cheap and will pivot (Unit 3); the company is built by years of execution from everyone. A lopsided split that doesn't match contribution breeds resentment exactly when alignment matters most, and a near-equal split among truly committed co-founders is often healthiest."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Vesting and the cliff",
              "statement": "**Vesting** means equity is *earned over time* rather than granted outright — standard is **4 years** with a **1-year cliff**: nothing vests during the first year, then a full year's worth vests at once at the 12-month mark (the cliff), and the rest vests monthly thereafter. Vesting applies to founders *and* employees. Its purpose: ensure that people who leave early don't walk away owning a large, permanent slice of a company they didn't build."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Vesting computation",
              "statement": "For a grant of S shares vesting linearly over T months with a one-year (12-month) cliff, the shares vested after m months of tenure are:\n\n  0,                if m < 12   (the cliff: nothing yet),\n  S · (m / T),      if m ≥ 12.\n\nAt the cliff (m = 12) a lump of S·12/T vests at once; thereafter it accrues S/T per month.",
              "proof": "Vesting accrues linearly across the full T months, so by month m the earned fraction is m/T — except the cliff withholds *all* equity until month 12, at which point the first twelve months' worth, S·12/T, vests in a single lump. For every m ≥ 12, vested = S·(m/T). ∎\n\n**Worked (the standard grant):** S = 1,000,000 shares, T = 48 months (4 years), 1-year cliff. After m = 18 months: vested = 1,000,000 × 18/48 = **375,000** shares. Checkpoints: m = 11 ⇒ 0 (pre-cliff); m = 12 ⇒ 1,000,000 × 12/48 = 250,000 (the cliff lump); m = 48 ⇒ fully vested."
            },
            {
              "type": "text",
              "heading": "Why vesting protects everyone",
              "body": "Vesting is the structural remedy for the co-founder-who-walks problem. If a co-founder with a 50% un-vested stake quits after six months, vesting means they leave with **nothing** (pre-cliff) rather than holding half the company hostage forever — protecting the founders who stay *and* future investors (who won't fund a cap table with large \"dead equity\"). On an acquisition, **acceleration** clauses (single-trigger: vesting speeds up on the deal; double-trigger: on the deal *and* if you're let go) determine how unvested equity is treated. Always put founder equity on a vesting schedule — including your own."
            },
            {
              "type": "decision",
              "heading": "What an equity split should weigh",
              "rows": [
                [
                  "Weight heavily",
                  "Full-time commitment and opportunity cost (salary forgone); criticality to execution; capital contributed; ongoing risk borne."
                ],
                [
                  "Weight lightly",
                  "Who had the idea; pre-existing IP of uncertain value; past titles. (The idea is a starting hypothesis, not the company.)"
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Always vest founder equity — including your own — and beware the 'I had the idea' split.** Unvested equity is the *only* clean remedy when a co-founder leaves early; without it, a six-month departure can leave a huge permanent stake on the cap table that poisons the company and scares off investors."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A co-founder has 1,000,000 shares vesting monthly over 4 years (48 months) after a 1-year cliff. How many shares have vested after exactly 18 months? After 11 months? After 12 months?",
                  "solution": "After 18 months (past the cliff): 1,000,000 × 18/48 = **375,000** shares. After 11 months: **0** (still inside the 1-year cliff — nothing has vested). After 12 months (the cliff): 1,000,000 × 12/48 = **250,000** shares vest in a lump at that moment."
                },
                {
                  "prompt": "Two co-founders are splitting equity. One wants 90/10 because they 'had the idea,' though both will work full-time and the other is critical to building the product. Evaluate the demand.",
                  "solution": "The 90/10 demand is almost certainly wrong. Equity should track **expected future contribution, risk, and commitment**, not idea origination — ideas are cheap and will likely pivot (Unit 3), while the company is built by years of execution from *both* full-time founders, one of whom is critical to the product. A 90/10 split that doesn't match contribution will breed resentment and misalignment exactly when the team most needs to pull together, and it signals a founder who overvalues the idea relative to execution. A split much closer to equal — with **4-year vesting and a 1-year cliff** for both — better reflects reality and protects everyone if someone leaves."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e8l2-i1",
              "front": "What should a founder equity split weigh most?",
              "back": "Expected future contribution, risk, and commitment (full-time, opportunity cost, criticality) — not who had the idea. Ideas are cheap and pivot; execution builds the company."
            },
            {
              "id": "e8l2-i2",
              "front": "Standard vesting terms?",
              "back": "4 years with a 1-year cliff: nothing vests in year 1, then a year's worth vests at once at month 12, monthly thereafter. Applies to founders and employees."
            },
            {
              "id": "e8l2-i3",
              "front": "Vesting computation (S shares, T months, 1-yr cliff)?",
              "back": "0 if m<12; S·(m/T) if m≥12. E.g. 1,000,000 over 48 mo after 18 mo = 375,000; at month 12 a 250,000 lump vests."
            },
            {
              "id": "e8l2-i4",
              "front": "Why does vesting protect everyone?",
              "back": "A co-founder who leaves early forfeits unvested equity (pre-cliff: nothing), so they can't hold a big permanent stake hostage — protecting remaining founders and investors from 'dead equity'."
            },
            {
              "id": "e8l2-i5",
              "front": "Single- vs double-trigger acceleration?",
              "back": "On acquisition, single-trigger accelerates vesting on the deal alone; double-trigger requires the deal AND being terminated. Governs how unvested equity is treated at exit."
            }
          ]
        },
        {
          "id": "e8l3",
          "title": "Hiring & Execution",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Early hires are disproportionately consequential",
              "body": "The first handful of employees set the company's trajectory far more than any later hire. They carry large equity, define the culture by example, and each represents a big fraction of the whole team — so a single bad early hire is *disproportionately* costly (expensive in equity, slow to unwind, and culture-damaging). Early hiring is therefore a high-stakes, low-volume activity: **hire slowly and deliberately, and act quickly when it's clearly not working.**"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Hiring for slope, not just intercept",
              "statement": "Early-stage hiring favors **learning rate (slope)** over polished prior experience (intercept): generalists with high ownership who can wear many hats, grow into the role, and thrive amid ambiguity beat narrow specialists optimized for a big-company function that doesn't exist yet. The classic heuristics — \"hire slow, fire fast\" and \"only A-players\" — reflect that at small scale the cost of a wrong hire is amplified and the value of a great one is enormous."
            },
            {
              "type": "text",
              "heading": "Hire against the binding constraint",
              "body": "With scarce headcount, each hire should relieve the company's **biggest current bottleneck**, not build out an org chart. If distribution is the constraint, your next hire sells; if the product can't ship fast enough, it builds. Early roles are broad by necessity — you're hiring people, not job descriptions — so optimize for mission fit, ownership, and raw ability over a perfect résumé match. Specialists and managers come later, once there's a working machine to specialize and manage."
            },
            {
              "type": "decision",
              "heading": "Early hiring: do vs. don't",
              "rows": [
                [
                  "Do",
                  "Hire generalists with high ownership and a steep learning curve; hire against the biggest constraint; move fast to part ways when it's clearly wrong."
                ],
                [
                  "Don't",
                  "Hire ahead of the validated model (Unit 3); hire narrow specialists or managers prematurely; tolerate a bad early hire because firing is uncomfortable."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Execution: speed is the startup's only structural edge",
              "body": "A startup cannot out-resource an incumbent — its one durable advantage is **speed**: faster learning loops (Build–Measure–Learn), faster decisions, and ruthless **focus** on a tiny number of priorities. Execution discipline at this stage is mostly the discipline of *saying no* — concentrating the whole team on the one or two things that move the core metric, and shipping/learning faster than anyone larger can. Diffusing effort across many initiatives squanders the only edge you have."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't scale the team ahead of the model.** Hiring aggressively before product–market fit and a repeatable motion (Units 2–5) burns cash, dilutes focus, and bakes in a cost structure the unvalidated business can't support — Blank's \"search before execution\" applied to headcount. Stay lean until the model works; *then* hire to scale what's proven."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A seed-stage startup is about to make its first 5 hires. Explain how early hiring differs from hiring at a big company, and what these hires should optimize for.",
                  "solution": "At a big company you hire specialists into well-defined roles within a working machine; at seed stage there is no machine yet, each hire is a large fraction of the team and equity, and they define the culture — so a bad hire is disproportionately costly and a great one transformational. These first hires should optimize for: **generalists with high ownership and a steep learning curve** (slope over polished intercept) who thrive in ambiguity; **mission fit**; and relieving the company's **biggest current constraint** (sell if distribution is the bottleneck, build if shipping is). Hire slowly and deliberately, act fast when it's clearly wrong, and don't hire narrow specialists or managers until there's a validated model to specialize and scale."
                },
                {
                  "prompt": "Why is 'hire slow, fire fast' especially important at 5 people but less so at 5,000?",
                  "solution": "At 5 people, one hire is 20% of the company: they carry large equity, set culture by example, and a wrong hire is slow and expensive to unwind while quietly damaging the team — so you hire deliberately and correct mistakes quickly before they metastasize. At 5,000 people, any single hire is a rounding error in headcount and culture, processes buffer mistakes, and the marginal cost of a wrong hire is small. The amplification of both upside and downside at tiny scale is what makes early hiring high-stakes and low-volume."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e8l3-i1",
              "front": "Why are the first 5 hires disproportionately consequential?",
              "back": "They carry large equity, define the culture, and each is a big fraction of the team — so a bad early hire is amplified in cost and a great one is transformational."
            },
            {
              "id": "e8l3-i2",
              "front": "Hire for slope or intercept early?",
              "back": "Slope (learning rate): generalists with high ownership who grow into the role and handle ambiguity, over narrow specialists with polished big-company experience."
            },
            {
              "id": "e8l3-i3",
              "front": "What should each early hire optimize for?",
              "back": "Relieving the biggest current constraint (sell if distribution is the bottleneck, build if shipping is), plus mission fit and ownership — not filling an org chart."
            },
            {
              "id": "e8l3-i4",
              "front": "A startup's one structural edge?",
              "back": "Speed — faster learning loops, decisions, and ruthless focus on 1–2 priorities. Execution discipline is mostly the discipline of saying no."
            },
            {
              "id": "e8l3-i5",
              "front": "Why not scale the team ahead of the model?",
              "back": "It burns cash, dilutes focus, and bakes in a cost structure the unvalidated business can't support (search before execution). Stay lean until the model works, then hire to scale."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e8-check",
        questions: [
          { id: "e8q1", type: "mcq", prompt: "What do early-stage investors say they bet on most?", options: ["the team", "the financial model", "the patent", "the office location"], answer: 0, explanation: "With little product or traction, the team is the bet — it executes and survives pivots." },
          { id: "e8q2", type: "short", prompt: "Standard startup equity vesting is typically 4 years with a 1-year ____ — nothing vests if you leave in the first year.", accept: ["cliff"], explanation: "The cliff protects the cap table against early departures." },
          { id: "e8q3", type: "numeric", prompt: "A co-founder has 1,000,000 shares vesting monthly over 4 years (48 months) after a 1-year cliff. After exactly 18 months, how many shares have vested? (18 of 48 months earned)", answer: 375000, tolerance: 0, explanation: "Past the cliff, 18/48 = 37.5% has vested: 0.375 × 1,000,000 = 375,000." },
          { id: "e8q4", type: "mcq", prompt: "A frequently cited top reason early startups fail is:", options: ["co-founder / team conflict", "having too much revenue", "office space shortages", "a weak logo"], answer: 0, explanation: "Co-founder breakdown kills more early startups than market or tech." },
          {
            id: "e8q5",
            type: "open",
            points: 3,
            prompt: "Two co-founders are splitting equity. One wants 90/10 because they 'had the idea.' Explain the problems with heavily unequal splits among active co-founders, and the role vesting plays regardless of the split.",
            rubric: [
              "Argues the idea is worth far less than the years of execution ahead, so 'I had the idea' is weak grounds for 90/10.",
              "Explains the human cost: a lopsided split demotivates the smaller holder and signals 'employee, not partner' — breeding the conflict that kills startups.",
              "Recommends near-equal splits for comparable forward contribution, with gaps reflecting real differences in commitment/role, decided openly.",
              "Explains that, regardless of the split, all founder equity should vest (4yr/1yr cliff) so equity is earned and an early departure doesn't keep unearned shares.",
            ],
            solution:
              "A 90/10 split justified by 'I had the idea' usually gets the value backwards: an idea is worth very little compared with the years of risky, full-time execution both founders are about to put in. A heavily lopsided split among active co-founders is corrosive — it tells the 10% partner they're really an employee, which kills the motivation you most need from them and seeds exactly the co-founder conflict that so often destroys startups. For two people contributing comparably going forward, a near-equal split best aligns incentives for the long, hard road; a meaningful gap should reflect a genuinely large difference in commitment, role, capital, or risk, agreed openly rather than imposed by whoever spoke first. Separately, and independent of the split, all founder equity should vest — typically four years with a one-year cliff — so equity is earned through continued contribution: if the 'idea' founder (or anyone) leaves after six months, they don't keep a huge unearned stake, which protects the company and the remaining team.",
            explanation: "The idea is worth little vs execution; near-equal splits align incentives, and vesting ensures equity is earned regardless of the split.",
          },
          {
            id: "e8q6",
            type: "open",
            points: 3,
            prompt: "A seed-stage startup is about to make its first 5 hires. Explain how hiring priorities should differ from a 200-person company, and why a single bad early hire is so costly.",
            rubric: [
              "Contrasts early-stage generalists on the critical path with the specialist roles a large company fills.",
              "Argues early hires should target what most de-risks the company now and will shape the culture, not a predefined org chart.",
              "Explains the outsized cost of a bad early hire: large fraction of the team, sets culture/norms, big opportunity cost, painful to fire in a tiny org.",
              "Invokes a high bar and 'slow to hire, fast to fire' (or equivalent) as the discipline.",
            ],
            solution:
              "A 200-person company mostly fills well-defined specialist roles inside an established culture and process. A seed startup's first five hires are the opposite: each is 20% of the company, will wear many hats, and helps set the culture that every future hire inherits. So early hires should be high-agency generalists placed on the critical path — whatever most de-risks the company right now — rather than narrow specialists for a scale you haven't reached. A single bad early hire is devastating because they're a huge fraction of the team, they shape norms and morale for everyone who follows, the opportunity cost of the wrong person in a key seat is enormous, and firing in a tiny, intimate team is painful and disruptive. The discipline is to hold a very high bar on skill, values, and ownership and to be 'slow to hire, fast to fire' — correcting mistakes quickly before a wrong early hire calcifies into the company's culture.",
            explanation: "Early = high-agency generalists on the critical path who set culture; one bad hire is 20% of the team and shapes everything, so bar high and fix fast.",
          },
        ],
      },
    },
    {
      id: "e9",
      title: "Strategy, Moats & Scaling",
      summary: "Competitive structure, what makes an advantage durable, and when to scale at all costs versus sustainably.",
      prerequisites: ["e8"],
      masteryThreshold: 0.85,
      lessons: [
        {
          "id": "e9l1",
          "title": "Competitive Strategy & Five Forces",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Porter's Five Forces",
              "statement": "Michael Porter's framework analyzes the **structural attractiveness (profit potential) of an industry** through five forces that compete away profit: **(1) rivalry** among existing competitors; **(2) threat of new entrants** (how low the barriers to entry are); **(3) threat of substitutes** (alternative ways to get the job done); **(4) bargaining power of buyers**; and **(5) bargaining power of suppliers**. The stronger these forces, the more they squeeze margins — so the five forces describe how much profit an industry *allows*, before any single company's strategy."
            },
            {
              "type": "text",
              "heading": "How each force squeezes profit",
              "body": "Each force is a channel through which value leaks away from incumbents. Intense **rivalry** triggers price wars and ad spend. Low entry barriers mean any profit invites **new entrants** who compete it away. **Substitutes** cap the price you can charge (if a cheaper alternative does the job, you can't exceed it by much). Powerful **buyers** (few, large, or well-informed) demand discounts; powerful **suppliers** (few, critical inputs) raise your costs. An industry where all five are strong — say, commodity retail — is structurally low-margin no matter how well you execute."
            },
            {
              "type": "decision",
              "heading": "Reading the five forces (strong force = bad for incumbents)",
              "rows": [
                [
                  "Rivalry",
                  "High when many similar competitors, slow growth, low differentiation → price competition."
                ],
                [
                  "New entrants",
                  "High threat when barriers (capital, regulation, network effects, brand) are low → profits invite copycats."
                ],
                [
                  "Substitutes",
                  "High when a different solution does the job cheaply → caps your pricing power."
                ],
                [
                  "Buyer power",
                  "High when buyers are few/large/price-sensitive or can switch easily → they extract discounts."
                ],
                [
                  "Supplier power",
                  "High when inputs are scarce or controlled by few suppliers → they capture your margin."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Strategy: position within the structure, or change it",
              "body": "Given the structure, strategy is either to **position** where the forces are weakest (a defensible niche, a differentiated segment that dulls rivalry and buyer power) or to **change the structure** in your favor — build barriers to entry (the moats of the next lesson), reduce supplier power (vertical integration, multi-sourcing), or neutralize substitutes. The strategic question isn't only \"are we better than rivals?\" but \"is this industry's *structure* one where a winner can keep its profits?\" — and if not, how do we alter it?"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Structure can beat execution.** A great product in a structurally brutal industry (intense rivalry, no entry barriers, powerful buyers) struggles to keep any profit it earns, because the forces compete it away. Evaluate the five forces *before* committing — and prefer markets whose structure lets a winner *hold* its gains (the role of moats)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What do Porter's Five Forces analyze, and why is a strong force bad news?",
                  "solution": "They analyze the **structural attractiveness (profit potential) of an industry** — how much profit the industry's structure allows, before any company's individual strategy. A strong force is bad because each force is a channel that competes profit away: strong rivalry → price wars; low entry barriers → entrants erode profits; cheap substitutes → capped pricing; powerful buyers → discounts; powerful suppliers → higher costs. When the forces are strong, even a well-run company can't retain much margin."
                },
                {
                  "prompt": "Apply the five forces to the restaurant industry and explain why it is famously low-margin.",
                  "solution": "**Rivalry**: extremely high — countless restaurants, low differentiation, intense competition. **New entrants**: low barriers (anyone can open one), so any local success invites imitators. **Substitutes**: abundant — home cooking, delivery, other cuisines. **Buyer power**: high — diners are price-sensitive and can trivially switch. **Supplier power**: moderate-to-high — food costs and prime real estate (landlords) capture margin. With nearly all five forces strong, the *structure* permits little sustained profit, which is why even excellent restaurants typically run thin margins — execution can't override a brutal structure (absent a moat like a unique brand or location)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e9l1-i1",
              "front": "What do Porter's Five Forces analyze?",
              "back": "The structural attractiveness / profit potential of an INDUSTRY — how much profit its structure allows, before any single company's strategy."
            },
            {
              "id": "e9l1-i2",
              "front": "Name the five forces.",
              "back": "Rivalry among competitors, threat of new entrants, threat of substitutes, buyer bargaining power, supplier bargaining power."
            },
            {
              "id": "e9l1-i3",
              "front": "Why is a strong force bad for incumbents?",
              "back": "Each force competes profit away: rivalry → price wars; low barriers → entrants; substitutes → capped prices; strong buyers → discounts; strong suppliers → higher costs."
            },
            {
              "id": "e9l1-i4",
              "front": "Two strategic responses to industry structure?",
              "back": "Position where the forces are weakest (defensible niche/differentiation), or change the structure (build entry barriers/moats, reduce supplier power, neutralize substitutes)."
            }
          ]
        },
        {
          "id": "e9l2",
          "title": "Moats: What Makes Advantage Durable",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Economic moat",
              "statement": "An **economic moat** (Buffett's term) is a *structural* barrier that protects a company's profits from competition **over time** — the reason a successful business stays successful instead of being copied into mediocrity. A moat is not a head start or a better product (both are temporary); it is a self-reinforcing advantage that *widens* or persists as the company grows. The main moats: **network effects, switching costs, economies of scale, brand, and proprietary technology / data / IP.**"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Network effects",
              "statement": "A product has **network effects** when it becomes *more valuable to each user as more people use it* — directly (each new user adds value for the others, as in a phone network or messaging app) or indirectly (more users attract more complements, as in a marketplace or platform). Network effects are often the strongest digital moat because value and defensibility grow with the user base itself."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Metcalfe's law: why network value grows ~quadratically",
              "statement": "Among n users, the number of distinct pairwise connections is C(n, 2) = n(n − 1)/2 = Θ(n²). Under **Metcalfe's law** — a network's value scales with the connections it enables — value grows roughly as the *square* of the user base, so doubling users roughly **quadruples** value, and the largest network's lead compounds.",
              "proof": "A connection is an unordered pair of distinct users. There are n choices for the first endpoint and n − 1 for the second, giving n(n − 1) ordered pairs; each connection is counted twice (once per ordering), so the number of distinct pairs is n(n − 1)/2. As n → ∞ this is Θ(n²). If value ∝ n(n − 1)/2, then a network of size 2n enables (2n)(2n − 1)/2 ≈ 4 · n(n − 1)/2 connections — about 4× the value. ∎\n\n**Gate:** n = 6 ⟹ 6 · 5 / 2 = **15** possible connections. The super-linear (quadratic) growth is *why* network-effect markets tip toward a single winner: each new user widens the leader's value advantage faster than linearly, making the network self-reinforcing and very hard to dislodge — and why winning such a market quickly can be decisive (next lesson). (The same counting argument is the handshake lemma from graph theory.)"
            },
            {
              "type": "text",
              "heading": "Popular is not the same as defensible",
              "body": "A product can be wildly *popular* and still have **no moat**. Popularity is a snapshot of demand; a moat is a structural reason that popularity *persists* against well-funded copycats. If a hot product has no network effects, no switching costs, no scale advantage, weak brand, and nothing proprietary, then its very success advertises the opportunity and invites competitors who erode its margins and share. The strategic task is to *convert* early popularity into a moat — accumulate a network, raise switching costs (data, integrations, workflow lock-in), build a brand, or reach a scale rivals can't match — before the imitators arrive."
            },
            {
              "type": "decision",
              "heading": "The major moats and how each is built",
              "rows": [
                [
                  "Network effects",
                  "Value rises with users (Metcalfe). Build by reaching critical mass first; markets tip to the leader."
                ],
                [
                  "Switching costs",
                  "Painful to leave (data, integrations, learning, contracts). Build by embedding in the customer's workflow and data."
                ],
                [
                  "Economies of scale",
                  "Lower unit cost at volume. Build by reaching scale that fixed costs amortize over and rivals can't match."
                ],
                [
                  "Brand",
                  "Trust/preference that commands a premium and lowers CAC. Build over years via consistent quality and meaning."
                ],
                [
                  "Proprietary tech / data / IP",
                  "A hard-to-replicate asset (algorithms, unique data, patents). Build via a data flywheel or genuine R&D lead."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**A popular product with no moat is a target, not a fortress.** Success without a structural barrier invites competition that competes the profits away. Treat early traction as a window to *build* a moat — network, switching costs, scale, brand, or proprietary data — not as a finish line."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A network's value is modeled as growing with the number of possible pairwise connections, n(n − 1)/2. For n = 6 users, how many possible connections are there? What does the quadratic growth imply for competition?",
                  "solution": "n(n − 1)/2 = 6 × 5 / 2 = **15** connections. Because value grows ~quadratically (Θ(n²)), each new user widens the leader's value advantage faster than linearly — a network twice the size is ~4× as valuable. This is why network-effect markets tend to **tip toward a single winner**: the lead compounds, the largest network is the most valuable and attracts the next user, and competitors find it very hard to dislodge an established network. (It's also why being first to scale such a market can be decisive.)"
                },
                {
                  "prompt": "A startup has a popular product but no obvious moat. Explain why popularity alone won't protect it, and name two moats it could try to build.",
                  "solution": "Popularity is a snapshot of current demand, not a structural reason that demand *persists*. With no network effects, switching costs, scale advantage, brand, or proprietary asset, the product's very success advertises the opportunity and invites well-funded copycats who erode its share and margins — there's nothing to stop a competitor from cloning it. To become defensible it should convert traction into a **moat**, e.g.: (1) **switching costs** — embed deeply in customers' workflows and data so leaving is painful; (2) **network effects** — design the product so each user adds value for others, then race to critical mass. (Brand, economies of scale, or proprietary data are other options.) The window to build a moat is *before* the imitators arrive."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e9l2-i1",
              "front": "What is an economic moat?",
              "back": "A structural barrier that protects profits from competition over time — a self-reinforcing advantage that persists/widens with growth, not a temporary head start or better product."
            },
            {
              "id": "e9l2-i2",
              "front": "The major moats?",
              "back": "Network effects, switching costs, economies of scale, brand, and proprietary tech/data/IP."
            },
            {
              "id": "e9l2-i3",
              "front": "What are network effects?",
              "back": "The product becomes more valuable to each user as more people use it (directly or via complements) — often the strongest digital moat."
            },
            {
              "id": "e9l2-i4",
              "front": "Metcalfe's law: connections among n users, and why it matters?",
              "back": "n(n−1)/2 = Θ(n²) connections (n=6 → 15). Value grows ~quadratically, so the leader's advantage compounds and the market tips to a single winner."
            },
            {
              "id": "e9l2-i5",
              "front": "Why isn't a popular product automatically defensible?",
              "back": "Popularity is current demand, not a reason it persists. Without a moat, success invites copycats that erode share/margins. Convert traction into a moat before they arrive."
            }
          ]
        },
        {
          "id": "e9l3",
          "title": "Scaling: Blitzscaling vs Sustainable",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Blitzscaling",
              "statement": "**Blitzscaling** (Reid Hoffman) is *prioritizing speed over efficiency in conditions of uncertainty* to achieve massive scale fast. It deliberately accepts inefficiency, higher burn, and operational risk — overstaffing, unprofitable growth, imperfect products — in exchange for *velocity*, on the bet that being first to scale wins a market that won't be split. It is the opposite of the careful, capital-efficient default; a specialized tool, not a general strategy."
            },
            {
              "type": "text",
              "heading": "When blitzscaling is the right bet",
              "body": "Blitzscaling pays off only in **winner-take-most/all markets** — typically those with strong **network effects** (Metcalfe's quadratic value, last lesson) or large **economies of scale**, where the first company to reach critical scale builds a moat that later rivals can't overcome. There, speed *is* the strategy: the prize is the entire market and a durable moat, so trading efficiency and risk for being first is rational — losing the race to scale means losing everything. The classic cases (marketplaces, social networks, platforms) are exactly the network-effect businesses whose value compounds with size."
            },
            {
              "type": "text",
              "heading": "When it's wrong — which is most of the time",
              "body": "In markets *without* winner-take-all dynamics, blitzscaling just incinerates capital: if being twice as big doesn't make you structurally safer, then burning to grow fast buys risk without a moat, and a downturn or a slimmer competitor can kill the over-extended leader. Most businesses should scale **sustainably** — grow as fast as unit economics and a working model allow, keeping efficiency and optionality. Blitzscaling a business with no winner-take-all prize is a way to lose a lot of money quickly; the inefficiency is only justified when the market genuinely tips to a single winner."
            },
            {
              "type": "decision",
              "heading": "Blitzscale vs. scale sustainably",
              "rows": [
                [
                  "Blitzscale (speed > efficiency)",
                  "Winner-take-most market with network effects or huge economies of scale; capital available; a real first-scaler-wins dynamic. The prize is the whole market + a moat."
                ],
                [
                  "Scale sustainably (efficiency matters)",
                  "No winner-take-all dynamic; unit economics should lead growth; you value control and resilience. Speed-for-its-own-sake just burns capital and adds risk."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Blitzscaling is a tool for a specific situation, not a default.** It trades efficiency and risk for speed, and is justified *only* when the market tips to a single winner (strong network effects / economies of scale) so that being first to scale builds an unassailable moat. Applied to an ordinary market, it's just rapid, risky cash-burning — most companies should scale sustainably and let unit economics pace growth."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "When is blitzscaling (speed over efficiency) the right strategy, and when is it a mistake?",
                  "solution": "**Right** in winner-take-most/all markets — those with strong network effects (value ∝ n², so the leader's advantage compounds) or large economies of scale — where the first to reach critical scale builds a moat later rivals can't overcome. There the prize is the whole market plus durability, so trading efficiency and risk for *being first* is rational; losing the scale race means losing everything. **A mistake** in markets *without* winner-take-all dynamics: if being bigger doesn't make you structurally safer, blitzscaling just burns capital and piles on risk with no moat to show for it, leaving the over-extended company vulnerable to a downturn or a leaner competitor. Most businesses should scale sustainably and let unit economics pace growth; blitzscaling is a specialized tool, not a default."
                },
                {
                  "prompt": "Why are network effects (Metcalfe's n² value) the textbook condition that justifies blitzscaling?",
                  "solution": "Because network-effect value grows ~quadratically with users, the largest network is disproportionately the most valuable and most attractive to the next user — so the market *tips* to whoever reaches critical scale first, and that lead compounds into a moat. When the structure makes 'first to scale' equal to 'winner,' speed itself becomes the strategy: it's worth accepting inefficiency and burn to win the race, because the reward is the entire market and a durable, self-reinforcing advantage. Absent such tipping dynamics, there's no winner-take-all prize to justify the inefficiency, and sustainable scaling is better."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "e9l3-i1",
              "front": "What is blitzscaling?",
              "back": "Prioritizing speed over efficiency under uncertainty to reach massive scale fast — accepting inefficiency, burn, and risk to be first to scale. A specialized tool, not a default."
            },
            {
              "id": "e9l3-i2",
              "front": "When is blitzscaling the right strategy?",
              "back": "Winner-take-most/all markets — strong network effects or economies of scale — where the first to reach critical scale builds an unassailable moat. Speed is the strategy."
            },
            {
              "id": "e9l3-i3",
              "front": "When is blitzscaling a mistake?",
              "back": "In markets without winner-take-all dynamics: if being bigger doesn't make you safer, blitzscaling just burns capital and adds risk with no moat. Scale sustainably instead."
            },
            {
              "id": "e9l3-i4",
              "front": "Why do network effects justify blitzscaling?",
              "back": "Value ∝ n² means the market tips to whoever scales first (the lead compounds into a moat), so being first to scale = winning — making speed worth the inefficiency."
            }
          ]
        }
      ],
      masteryCheck: {
        id: "e9-check",
        questions: [
          { id: "e9q1", type: "mcq", prompt: "Porter's five forces analyze:", options: ["the structural forces that determine an industry's profitability", "a company's logo and branding", "the founder's resume", "the office layout"], answer: 0, explanation: "Rivalry, entrants, substitutes, buyer power, supplier power." },
          { id: "e9q2", type: "numeric", prompt: "A network's value is often modeled as growing with the number of possible pairwise connections, n(n−1)/2. For n = 6 users, how many possible connections are there?", answer: 15, tolerance: 0, explanation: "6 × 5 / 2 = 15 — value grows faster than the user count, the engine of network effects." },
          { id: "e9q3", type: "short", prompt: "When a product becomes more valuable to each user as more people use it, it has ____ effects — often the strongest digital moat.", accept: ["network"], explanation: "Network effects tend toward winner-take-most." },
          { id: "e9q4", type: "mcq", prompt: "Blitzscaling means:", options: ["prioritizing speed over efficiency to win a winner-take-most market, accepting risk and inefficiency", "growing as slowly and safely as possible", "never raising capital", "avoiding competition entirely"], answer: 0, explanation: "Speed-over-efficiency to capture a winner-take-most market first." },
          {
            id: "e9q5",
            type: "open",
            points: 3,
            prompt: "A startup has a popular product but no obvious moat. Explain why popularity alone isn't defensibility, and identify which types of moat a marketplace business in particular might build.",
            rubric: [
              "Explains that popularity is copyable — a hit invites well-funded clones; 'better' erodes once matched.",
              "Defines defensibility as what stops a competitor from taking customers even when they match the product.",
              "For a marketplace, identifies network effects via liquidity (more buyers attract more sellers and vice versa) as the key moat.",
              "Names additional applicable moats (switching costs/reputation, scale economics, brand/trust, proprietary data).",
            ],
            solution:
              "Popularity isn't defensibility: a product people love today can be cloned tomorrow by a faster or better-funded competitor, and being 'more popular' or 'better' stops protecting you the moment someone matches your features. A moat is what makes it hard for a competitor to take your customers even when their product is just as good. For a marketplace, the strongest candidate is the network effect through liquidity: more buyers attract more sellers and more sellers attract more buyers, so once a marketplace reaches critical mass it becomes self-reinforcing and very hard to dislodge — a thin competing marketplace offers neither side enough to switch. On top of that, a marketplace can build switching costs (accumulated reputation, reviews, and history that don't transfer), economies of scale (better pricing, logistics, or fraud control at volume), brand and trust, and proprietary data (matching, pricing, and recommendation models that improve with usage). The strategic priority is to engineer those effects — drive one category or geography to liquidity fast — rather than rely on popularity, which any competitor can attack.",
            explanation: "Popularity is copyable; defensibility for a marketplace is liquidity-driven network effects, plus switching costs, scale, brand, and data.",
          },
          {
            id: "e9q6",
            type: "open",
            points: 3,
            prompt: "When is blitzscaling (speed over efficiency) the right strategy, and when is it reckless? Reference winner-take-most dynamics / network effects and unit economics.",
            rubric: [
              "Defines blitzscaling: deliberately trading efficiency for speed to capture a market before competitors.",
              "States the conditions where it's right: a winner-take-most market (often network effects) where first-to-scale becomes dominant, AND unit economics that can plausibly work at scale.",
              "States when it's reckless: no winner-take-most dynamic/moat, or negative unit economics (speed just multiplies losses).",
              "Connects to unit economics: scaling negative economics accelerates failure, not dominance.",
            ],
            solution:
              "Blitzscaling means deliberately prioritizing speed over efficiency — accepting burn, inefficiency, and risk — to capture a market before competitors can. It's the right strategy when two conditions hold together: the market is winner-take-most, usually because of strong network effects or other first-scaler-wins dynamics so that the first company to reach critical scale becomes nearly unassailable; and the underlying unit economics can plausibly work once that scale is reached, so the burn buys a durable, defensible position worth paying for. It's reckless when those conditions are absent. If there's no network effect or winner-take-most dynamic, racing ahead just spends faster without building any moat — a fast follower can still win. And if the unit economics are negative, blitzscaling multiplies the per-unit losses (exactly as in the unit-economics unit) and accelerates death rather than dominance. So blitzscale only when winning the land-grab creates real defensibility and the economics can converge at scale; otherwise grow sustainably and let the reckless competitors burn themselves out.",
            explanation: "Blitzscale only when the market is winner-take-most (network effects) AND the economics can work at scale; otherwise speed just multiplies losses.",
          },
        ],
      },
    },
  ],
};
