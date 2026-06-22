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
          id: "e1l1",
          title: "Start With a Beachhead, Not the Ocean",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Ideas are cheap; the market is everything",
              body: `Startups overwhelmingly fail because they build something nobody wants — a market and customer failure, not usually a technology one. So the first discipline isn't the product; it's deciding **who** you serve. The cardinal sin is defining the market too broadly: "everyone who eats", "all small businesses". Breadth feels ambitious and is, in fact, fatal.`,
            },
            {
              type: "text",
              heading: "The beachhead market",
              body: `Borrowed from amphibious warfare: you don't invade the whole coast at once — you take one beach, secure it, and expand from strength. A **beachhead market** is a single, narrow, well-defined segment you can *dominate* first: earn near-100% share, generate references and word-of-mouth, and build a complete product for one kind of customer before broadening.`,
            },
            {
              type: "decision",
              heading: "What makes a good beachhead",
              rows: [
                ["Reachable", "You can identify and access these customers through a real channel"],
                ["Compelling reason to buy *now*", "A pressing problem, not a nice-to-have"],
                ["Whole product is deliverable", "You can fully solve their need with what you can build"],
                ["Willing & able to pay", "Budget exists and the value clearly justifies the price"],
                ["Homogeneous", "Shared needs and a tight word-of-mouth network, so wins compound"],
                ["Has follow-on markets", "Adjacent segments to expand into after you win this one"],
              ],
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Boiling the ocean.** "Our market is everyone" means no focus — no reference customers, no word-of-mouth, and a product that half-serves everybody and fully serves no one. Narrow your target until it feels almost uncomfortably small, then go dominate it.`,
            },
          ],
          reviewItems: [
            { id: "e1l1-i1", front: "Why do most startups fail?", back: "They build something nobody wants — a market/customer failure, not usually a technology one." },
            { id: "e1l1-i2", front: "What is a beachhead market?", back: "A single narrow, well-defined segment you can dominate first (near-100% share) before expanding to adjacent markets." },
            { id: "e1l1-i3", front: "Name three criteria of a good beachhead.", back: "Reachable, a compelling reason to buy now, a deliverable whole product (also: willing to pay, homogeneous, follow-on markets)." },
            { id: "e1l1-i4", front: "What's wrong with targeting 'everyone'?", back: "No focus → no references, no word-of-mouth, and a product that half-serves everybody; you can't dominate." },
          ],
        },
        {
          id: "e1l2",
          title: "Who Is the Customer, Exactly?",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "User ≠ buyer ≠ decision-maker",
              body: `Especially in B2B, the person who **uses** the product, the **economic buyer** who pays, and the people who **influence or veto** the purchase are often different humans with different motivations. Map all of them. A product the user loves but the economic buyer won't fund is dead; so is one the buyer approves but the user ignores.`,
            },
            {
              type: "text",
              heading: "Jobs to be done",
              body: `Clayton Christensen's lens: customers "hire" a product to do a **job** in their lives. People don't want a quarter-inch drill; they want a quarter-inch hole — really, a shelf, really, a tidy home. Understand the functional, emotional, and social job the customer is trying to get done, and what they currently "fire" to hire you. Sell the job, not the features.`,
            },
            {
              type: "example",
              heading: "The persona, built from interviews",
              body: `Aulet's End User Profile plus a concrete **persona**: not "millennials who like fitness" but a specific, named archetype — their day, the job they're trying to do, their current workaround, their budget, and exactly what would make them switch. Crucially, it's built from real customer interviews, not from imagination at a whiteboard.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Demographics lie.** "Women, 25–40, urban" tells you nothing about the job being hired for — two people with identical demographics can want opposite things. Segment by **job and behavior**, not by census category.`,
            },
          ],
          reviewItems: [
            { id: "e1l2-i1", front: "User vs economic buyer vs decision-maker?", back: "User uses it, economic buyer pays, decision-makers/influencers approve or veto — often different people, especially in B2B." },
            { id: "e1l2-i2", front: "Jobs-to-be-done, in one line?", back: "Customers 'hire' a product to get a functional/emotional/social job done; understand the job and the alternatives they fire to hire you." },
            { id: "e1l2-i3", front: "What is a persona / end-user profile?", back: "A specific, real archetype (built from interviews) with their job-to-be-done, current workaround, budget, and switching triggers — not a demographic." },
            { id: "e1l2-i4", front: "Why are demographics weak segmentation?", back: "Identical demographics can hide opposite jobs-to-be-done; segment by job and behavior, not census category." },
          ],
        },
        {
          id: "e1l3",
          title: "How Big Is It? TAM, SAM, SOM",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Three nested sizes",
              body: `**TAM** (Total Addressable Market) — total annual revenue if you had 100% of everyone who could conceivably buy. **SAM** (Serviceable Available Market) — the slice your business model, product, and geography can actually serve. **SOM** (Serviceable Obtainable Market) — what you can realistically capture in the near term, given competition and your reach.`,
            },
            {
              type: "text",
              heading: "Bottoms-up beats top-down",
              body: `Top-down sizing — "the market is $50B, we'll get 2%" — is a fantasy: the 2% is *asserted*, with no account of who those customers are or how you'd reach them. **Bottoms-up** sizing counts real units:\n\nTAM ≈ (number of identifiable end users in the segment) × (annual revenue per end user)\n\nIt forces you to know the customers and the channel — which is the entire point.`,
            },
            {
              type: "example",
              heading: "Sizing a beachhead bottoms-up",
              body: `Suppose your beachhead has ~80,000 reachable end users, each worth about $300/year. Bottoms-up TAM ≈ 80,000 × $300 = $24M/year. That is a focused, defensible number tied to real, reachable customers — utterly unlike "1% of a $600B industry", which is a number with no people behind it.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**A beachhead TAM should feel small** — often $5M–$100M, not billions. A huge beachhead TAM usually means your segment is still too broad. You grow TAM later by capturing **follow-on markets**, not by defining the beachhead expansively from the start.`,
            },
          ],
          reviewItems: [
            { id: "e1l3-i1", front: "Define TAM, SAM, SOM.", back: "TAM: total annual demand at 100%. SAM: the slice your model/geography can serve. SOM: what you can realistically obtain near-term." },
            { id: "e1l3-i2", front: "Bottoms-up market-sizing formula?", back: "(number of identifiable end users in the segment) × (annual revenue per end user)." },
            { id: "e1l3-i3", front: "Why is top-down sizing ('we'll get X% of a huge market') dangerous?", back: "The percentage is asserted, not earned — it ignores who the customers are and how you'd actually reach them." },
            { id: "e1l3-i4", front: "How big should a beachhead TAM feel?", back: "Small — often $5M–$100M; a huge beachhead TAM usually means the segment is too broad." },
          ],
        },
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
          id: "e2l1",
          title: "Designing the Value Proposition",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Map value to the customer's job",
              body: `The value proposition canvas pairs the **customer side** — the jobs they're trying to do, their pains, and their desired gains — with **your side** — the product, your pain relievers, and your gain creators. A strong value proposition relieves the most severe pains and creates the most-wanted gains for a specific customer, not a generic list of features.`,
            },
            {
              type: "text",
              heading: "Quantify it against the alternative",
              body: `Aulet's discipline: express your value in the customer's own numbers, relative to their **next best alternative** (which is often "do nothing" or a spreadsheet). Not "we're faster" but "we cut the monthly close from 10 days to 2, saving ~$8,000 of finance time." A **quantified value proposition** anchors pricing and cuts through skepticism — the customer can do the math.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Features are not value.** Customers don't buy features; they buy outcomes against an alternative. If you can't state your value as a concrete improvement over what they do today — in their units, money or time — you don't yet understand your value proposition.`,
            },
          ],
          reviewItems: [
            { id: "e2l1-i1", front: "What does the value proposition canvas map?", back: "Customer jobs/pains/gains ↔ your product, pain relievers, and gain creators." },
            { id: "e2l1-i2", front: "What is a quantified value proposition?", back: "Your value expressed in the customer's own numbers (time/money) relative to their next best alternative." },
            { id: "e2l1-i3", front: "What's the usual 'next best alternative' you must beat?", back: "Often 'do nothing' or a manual workaround (spreadsheet) — not a direct competitor." },
            { id: "e2l1-i4", front: "Why aren't features the value proposition?", back: "Customers buy outcomes vs an alternative; features only matter insofar as they produce a quantified improvement." },
          ],
        },
        {
          id: "e2l2",
          title: "The Minimum Viable Product",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "An MVP is an experiment, not a product",
              body: `Ries's **MVP** is the smallest thing that lets you start the **build–measure–learn** loop and test your riskiest assumption with real customers. Its deliverable is *validated learning*, not a shippable v1. Aulet's **MVBP** (minimum viable *business* product) sharpens it: something a customer actually uses, pays for, and gives feedback on.`,
            },
            {
              type: "example",
              heading: "MVPs that aren't full products",
              body: `A **concierge MVP** delivers the value by hand to a few real customers (no software yet). A **Wizard-of-Oz MVP** looks automated but a human is behind the curtain. A **landing-page MVP** measures sign-ups or pre-orders against a promise. Each tests "will they want and pay for this?" in days, not quarters.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**What an MVP is NOT:** a buggy, feature-complete app you spent nine months building. If there's no hypothesis being tested and no metric being measured, it isn't an MVP — it's just a slow, expensive bet on being right.`,
            },
          ],
          reviewItems: [
            { id: "e2l2-i1", front: "What is an MVP, and what is its deliverable?", back: "The smallest thing to start build-measure-learn and test the riskiest assumption; its deliverable is validated learning, not a polished product." },
            { id: "e2l2-i2", front: "MVP vs Aulet's MVBP?", back: "MVBP adds that a real customer uses it, pays for it, and gives feedback — a minimum viable business product." },
            { id: "e2l2-i3", front: "Name two MVPs that aren't full products.", back: "Concierge (deliver value by hand), Wizard-of-Oz (human behind a seemingly automated front), landing-page (measure pre-orders)." },
            { id: "e2l2-i4", front: "Why isn't a 9-month feature-complete build an MVP?", back: "It tests no hypothesis and delays learning — the whole point of an MVP is fast validated learning." },
          ],
        },
        {
          id: "e2l3",
          title: "Product-Market Fit",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Being in a good market with a product it wants",
              body: `Marc Andreessen: product-market fit is "being in a good market with a product that can satisfy that market" — and it's "the only thing that matters." Before PMF, nothing else (growth tactics, hiring, fundraising) reliably works; after it, demand pulls the product out of you. You can usually *feel* the difference.`,
            },
            {
              type: "text",
              heading: "Signals — and the 40% test",
              body: `Concrete signals: **retention** curves that flatten at a healthy plateau (not decay to zero), **organic pull** (word-of-mouth, referrals, inbound) without proportional spend, and the **Sean Ellis test** — at least 40% of users say they'd be "very disappointed" if they could no longer use it. Retention and qualitative pull are *leading* indicators; revenue growth merely *confirms* fit later.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Vanity signals aren't PMF.** Sign-ups, downloads, press, and "people say they love it" feel like traction but prove nothing. Only repeated, retained usage and real willingness to pay count.`,
            },
          ],
          reviewItems: [
            { id: "e2l3-i1", front: "Define product-market fit.", back: "Being in a good market with a product that satisfies it — demand pulls the product out of you." },
            { id: "e2l3-i2", front: "The Sean Ellis PMF test?", back: "≥40% of users say they'd be 'very disappointed' if they could no longer use the product." },
            { id: "e2l3-i3", front: "Leading vs lagging PMF indicators?", back: "Leading: retention plateau, organic pull. Lagging: revenue growth (confirms fit after the fact)." },
            { id: "e2l3-i4", front: "Why are sign-ups a poor PMF signal?", back: "They're a vanity metric — only retained usage and willingness to pay demonstrate fit." },
          ],
        },
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
          id: "e3l1",
          title: "Get Out of the Building",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "There are no facts inside the building",
              body: `Steve Blank's foundational idea: inside your office there are only opinions; the facts live with customers. **Customer Development** turns your business-model hypotheses (who the customer is, what problem, what solution, what price) into facts by systematically testing them with real people — in parallel with, not after, building the product.`,
            },
            {
              type: "text",
              heading: "Discovery, then validation",
              body: `**Customer discovery** confirms you've found a real problem worth solving and the right customer. **Customer validation** confirms you have a repeatable, scalable way to sell and deliver the solution. You don't scale (hire sales, spend on growth) until both are done — premature scaling is the most common cause of startup death.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Selling ≠ learning.** When you pitch, you bias every answer toward yes. In discovery your job is to *learn*, which means asking, listening, and being willing to hear that you're wrong — not convincing.`,
            },
          ],
          reviewItems: [
            { id: "e3l1-i1", front: "Blank's core insight about facts?", back: "There are no facts inside the building — only opinions; facts live with customers." },
            { id: "e3l1-i2", front: "Customer discovery vs validation?", back: "Discovery: confirm a real problem and the right customer. Validation: confirm a repeatable, scalable way to sell/deliver." },
            { id: "e3l1-i3", front: "What kills startups that scale too early?", back: "Premature scaling — spending on growth before discovery and validation are done." },
            { id: "e3l1-i4", front: "Why keep selling separate from learning?", back: "Pitching biases answers toward yes; discovery requires listening and being willing to be wrong." },
          ],
        },
        {
          id: "e3l2",
          title: "Interviews & Experiments",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "The Mom Test",
              body: `Rob Fitzpatrick's rule: ask questions even your mom couldn't lie about. Talk about the customer's **actual life and past behavior**, never your idea: "Walk me through the last time you faced this." "What do you use today, and what does it cost you?" Avoid hypotheticals ("Would you buy...?") and compliments — both produce false positives. Commitment (time, money, a referral) is the only real signal.`,
            },
            {
              type: "text",
              heading: "Validated learning vs vanity metrics",
              body: `Design each experiment to test the **riskiest assumption** and to move an *actionable* metric — one tied to a decision (activation, retention, conversion, willingness to pay). **Vanity metrics** (total sign-ups, page views, cumulative downloads) only ever go up and tell you nothing about whether the business works.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Past behavior predicts; opinions don't.** "I would definitely buy that" is worth little; "I already pay $X for a worse workaround" is worth a lot. Anchor interviews in what people have actually done and spent.`,
            },
          ],
          reviewItems: [
            { id: "e3l2-i1", front: "The Mom Test in one line?", back: "Ask about the customer's real life and past behavior, never pitch your idea; only commitment is real signal." },
            { id: "e3l2-i2", front: "Why avoid 'would you buy this?' questions?", back: "Hypotheticals and compliments produce false positives — people are nice and bad at predicting their own behavior." },
            { id: "e3l2-i3", front: "Actionable vs vanity metric?", back: "Actionable ties to a decision (activation/retention/conversion); vanity (total sign-ups, page views) only goes up and informs nothing." },
            { id: "e3l2-i4", front: "Strongest signal in an interview?", back: "Commitment — time, money, or a referral — and evidence of past behavior/spend, not stated intent." },
          ],
        },
        {
          id: "e3l3",
          title: "Pivot or Persevere",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "A pivot is a structured change of hypothesis",
              body: `A **pivot** is a disciplined course-correction that changes one core hypothesis while keeping the validated learning you've earned — one foot anchored, one foot moving. It is not failure, and not a random new idea; it's a deliberate test of a new fundamental assumption when the evidence says the current one is wrong.`,
            },
            {
              type: "text",
              heading: "The pivot taxonomy",
              body: `Ries catalogs kinds of pivot: **zoom-in** (one feature becomes the whole product) and **zoom-out** (the product becomes a feature of something bigger); **customer-segment** (same product, different buyer); **problem** (same customer, different problem); **platform**, **business-model**, **channel**, and others. Naming the pivot keeps the change deliberate rather than flailing.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**The signal to pivot: the engine of growth isn't turning.** Flat retention/engagement despite shipping, no organic pull, and experiments that keep failing mean perseverance is just burning runway. Pivot decisively and early — most successful startups pivoted at least once.`,
            },
          ],
          reviewItems: [
            { id: "e3l3-i1", front: "What is a pivot?", back: "A structured change to one core hypothesis that keeps prior validated learning — not failure, not a random new idea." },
            { id: "e3l3-i2", front: "Name three kinds of pivot.", back: "Zoom-in/zoom-out, customer-segment, problem, platform, business-model, channel (any three)." },
            { id: "e3l3-i3", front: "The signal that it's time to pivot?", back: "The engine of growth isn't turning — flat retention/engagement and failing experiments despite effort." },
            { id: "e3l3-i4", front: "Pivot vs persevere — what's the deciding evidence?", back: "Whether your metrics show the core hypothesis is working; if growth/retention stay flat, persevering just burns runway." },
          ],
        },
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
          id: "e4l1",
          title: "Business Models & Pricing",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "How you make money is a design choice",
              body: `The business model — subscription, transactional, marketplace (take-rate), freemium, usage-based, licensing — determines your revenue dynamics, not just your revenue. It must be chosen deliberately to fit the customer and the value, not bolted on later. The same product under a different model can be a great business or a terrible one.`,
            },
            {
              type: "text",
              heading: "Price on value, not cost",
              body: `**Value-based pricing** anchors the price to the quantified value you deliver and the customer's willingness to pay — capturing a fraction of the value created. **Cost-plus pricing** (your cost + a margin) leaves money on the table and ignores what the customer would gladly pay. Price is one of the highest-leverage decisions a startup makes, and most founders price too low.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Willingness to pay is discoverable.** It comes out of the customer development you've already done — what they pay for alternatives, what the quantified value is worth to them. Pricing is a hypothesis to test, not a number to guess once.`,
            },
          ],
          reviewItems: [
            { id: "e4l1-i1", front: "Why does the business model matter beyond 'how much' you earn?", back: "It sets revenue dynamics (recurring vs one-off, take-rate, etc.) and must fit the customer and value — a design choice, not an afterthought." },
            { id: "e4l1-i2", front: "Value-based vs cost-plus pricing?", back: "Value-based anchors to the quantified value and willingness to pay; cost-plus is cost + margin and usually leaves money on the table." },
            { id: "e4l1-i3", front: "Most common founder pricing error?", back: "Pricing too low — undervaluing the outcome delivered." },
            { id: "e4l1-i4", front: "Where does willingness to pay come from?", back: "Customer development — what they pay for alternatives and what the quantified value is worth to them." },
          ],
        },
        {
          id: "e4l2",
          title: "Unit Economics: CAC and LTV",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The two numbers that define the engine",
              body: `**CAC** (Customer Acquisition Cost) = fully-loaded sales and marketing spend ÷ new customers acquired in that period. **LTV** (Lifetime Value) = the gross profit a customer generates over their lifetime — a common form is (monthly revenue × gross margin) ÷ monthly churn, i.e. monthly contribution × average lifetime. These are *per customer*, and they are the heart of the business.`,
            },
            {
              type: "example",
              heading: "A worked example",
              body: `Spend $50,000 to acquire 250 customers → CAC = $50,000 ÷ 250 = $200. A customer pays $40/month at 75% gross margin with 5% monthly churn → average lifetime = 1 ÷ 0.05 = 20 months, so LTV = $40 × 0.75 × 20 = $600. The **LTV:CAC ratio** is $600 ÷ $200 = 3 — the healthy rule-of-thumb floor.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**LTV:CAC ≥ 3 is the rule of thumb.** Below ~1 you lose money on every customer; around 1–3 the model is fragile; well above 3 you may be under-investing in growth. But the ratio alone hides timing — which the next lesson fixes.`,
            },
          ],
          reviewItems: [
            { id: "e4l2-i1", front: "How is CAC computed?", back: "Fully-loaded sales + marketing spend ÷ number of new customers acquired in the period." },
            { id: "e4l2-i2", front: "One formula for LTV?", back: "(monthly revenue × gross margin) ÷ monthly churn = monthly contribution × average customer lifetime." },
            { id: "e4l2-i3", front: "Average lifetime from churn?", back: "1 ÷ churn rate (e.g. 5% monthly churn → 20-month lifetime)." },
            { id: "e4l2-i4", front: "Healthy LTV:CAC rule of thumb?", back: "At least 3 (below ~1 you lose money per customer; far above 3 may mean under-investing in growth)." },
          ],
        },
        {
          id: "e4l3",
          title: "Churn, Payback & Why Scale Can Kill",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Churn is the silent killer",
              body: `Because LTV ≈ contribution ÷ churn, churn sits in the denominator — small changes swing LTV hard. Halving churn doubles LTV; doubling churn halves it. A leaky bucket (high churn) caps how big you can get no matter how much you pour in, because you're refilling losses instead of growing.`,
            },
            {
              type: "text",
              heading: "Payback period and cash",
              body: `The **CAC payback period** = CAC ÷ monthly contribution per customer — how long until a customer repays their acquisition cost. You want it short (often < 12 months); a long payback means you front huge cash to grow and can run out before the LTV ever arrives. Two businesses with identical LTV:CAC can have wildly different cash needs depending on payback.`,
            },
            {
              type: "callout",
              tone: "danger",
              body: `**"We lose money on each sale but make it up in volume" is usually fatal.** If unit economics are negative, scaling multiplies the losses — growth accelerates death. Fix the unit economics (raise price, cut CAC, cut churn, raise margin) *before* pouring fuel on the fire.`,
            },
          ],
          reviewItems: [
            { id: "e4l3-i1", front: "Why is churn so dangerous to LTV?", back: "LTV ≈ contribution ÷ churn — churn is in the denominator, so small increases slash LTV; high churn caps total size." },
            { id: "e4l3-i2", front: "CAC payback period formula and target?", back: "CAC ÷ monthly contribution per customer; want it short (often < 12 months)." },
            { id: "e4l3-i3", front: "Why can two businesses with equal LTV:CAC differ greatly?", back: "Payback period — a long payback fronts far more cash and risks running out before LTV arrives." },
            { id: "e4l3-i4", front: "Why is scaling negative unit economics fatal?", back: "Each sale loses money, so growth multiplies the losses — fix the economics before scaling." },
          ],
        },
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
          id: "e5l1",
          title: "GTM Motions & Channels",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Match the motion to the deal size",
              body: `The main go-to-market motions: **product-led / self-serve** (the product sells itself; users sign up and convert), **sales-led** (humans close deals, inside or field sales), **marketing/inbound**, and **channel/partnerships**. The deciding factor is usually **annual contract value (ACV)**: a $50/year product can't afford a salesperson, so it needs self-serve; a $100k enterprise deal can't be sold purely self-serve.`,
            },
            {
              type: "text",
              heading: "The channel is part of the product",
              body: `How you reach customers — and how they buy — is a design decision as real as the features. A great product with no viable, affordable channel to its customers is not a business. Early on you test channels the same way you test the product: small experiments, measured by cost per acquired customer against the LTV you can support.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Mismatched motion burns cash fast.** A field sales team selling a $1,000/year product, or pure self-serve for a $250k product that needs hand-holding and procurement, both fail — the cost of the motion swamps the economics. Let ACV pick the motion.`,
            },
          ],
          reviewItems: [
            { id: "e5l1-i1", front: "Name the main GTM motions.", back: "Product-led/self-serve, sales-led, marketing/inbound, channel/partnerships." },
            { id: "e5l1-i2", front: "What mostly decides the motion?", back: "Annual contract value (ACV) — low ACV → self-serve/PLG; high ACV → sales-led." },
            { id: "e5l1-i3", front: "Why is 'the channel is part of the product'?", back: "A great product with no affordable, viable channel to customers isn't a business; the route to the customer is a design choice." },
            { id: "e5l1-i4", front: "How do you evaluate a channel early?", back: "Small experiments measured by cost per acquired customer against the LTV you can support." },
          ],
        },
        {
          id: "e5l2",
          title: "Crossing the Chasm",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The adoption lifecycle and the gap",
              body: `Geoffrey Moore's technology adoption lifecycle runs innovators → **early adopters** → **early majority** → late majority → laggards. The dangerous gap — the **chasm** — sits between early adopters and the early majority, because they buy for opposite reasons.`,
            },
            {
              type: "text",
              heading: "Visionaries vs pragmatists",
              body: `**Early adopters** are visionaries who buy on the promise and tolerate rough edges. The **early majority** are pragmatists who buy on **references from people like them** and demand a **complete ("whole") product** — integrations, support, proof. Strategies that won the early adopters (vision, novelty) fail with pragmatists. You cross the chasm by picking one **beachhead** segment (back to Unit 1), delivering the whole product for it, and earning the references that pragmatists require.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Crossing the chasm = the beachhead, applied to adoption.** Dominate one pragmatist segment completely so it becomes the reference that pulls in the next. Trying to serve the whole mainstream at once is the chasm-falling move.`,
            },
          ],
          reviewItems: [
            { id: "e5l2-i1", front: "Where is the chasm, and why?", back: "Between early adopters and the early majority — they buy for opposite reasons (vision vs references/whole product)." },
            { id: "e5l2-i2", front: "Early adopters vs early majority?", back: "Early adopters (visionaries) buy on promise and tolerate rough edges; the early majority (pragmatists) buy on references and a complete whole product." },
            { id: "e5l2-i3", front: "How do you cross the chasm?", back: "Pick one beachhead segment, deliver the whole product for it, and earn the references pragmatists demand." },
            { id: "e5l2-i4", front: "What does the early majority require that early adopters don't?", back: "A complete 'whole product' (support, integrations, proof) and references from people like them." },
          ],
        },
        {
          id: "e5l3",
          title: "Positioning & Founder-Led Sales",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Positioning sets the frame",
              body: `Positioning answers: in what category do you compete (the **frame of reference**), for whom, and what makes you better (the **differentiation**)? Get it wrong and even great messaging falls flat — you're being compared to the wrong things. Strong positioning makes the value obvious to the right customer and uninteresting to the wrong one (which is fine).`,
            },
            {
              type: "text",
              heading: "Early sales is the founder's job — and it's learning",
              body: `Before there's a sales playbook, the **founder sells**. The goal isn't only revenue; it's to discover the repeatable pitch, objections, and buying process that a future sales team will execute. You can't delegate sales until you've learned how the sale actually works — which is itself part of customer validation.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Don't hire salespeople to find product-market fit.** A sales team can execute a known, repeatable sale; it cannot discover one. Founder-led selling de-risks the motion before you scale headcount.`,
            },
          ],
          reviewItems: [
            { id: "e5l3-i1", front: "What does positioning define?", back: "Your frame of reference (the category), who it's for, and your differentiation (what makes you better)." },
            { id: "e5l3-i2", front: "Why must founders do early sales?", back: "To discover the repeatable pitch, objections, and buying process before a sales team can execute them — it's part of validation." },
            { id: "e5l3-i3", front: "Why not hire salespeople to find PMF?", back: "A sales team can execute a known sale, not discover one; founder-led selling de-risks the motion first." },
            { id: "e5l3-i4", front: "What does strong positioning do to the wrong customer?", back: "Makes you uninteresting to them — which is fine; clarity for the right customer is the goal." },
          ],
        },
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
          id: "e6l1",
          title: "The Funnel: AARRR",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Pirate metrics",
              body: `Dave McClure's funnel — **AARRR** — breaks the customer journey into Acquisition (they find you), **Activation** (first great experience, the "aha"), **Retention** (they come back), **Referral** (they bring others), and **Revenue** (they pay). Instrument each step, find the biggest leak, and fix that — optimizing a later stage is wasted if an earlier one is hemorrhaging.`,
            },
            {
              type: "text",
              heading: "Activation precedes retention",
              body: `Users can't retain on a product they never really experienced. **Activation** — getting a new user to the moment they feel the core value — is the hinge of the funnel. Many "retention problems" are actually activation problems: people signed up, never reached the aha, and left.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Find the leak, then fix it.** Measure conversion between each AARRR stage. The stage with the worst drop-off is where effort pays off — intuition about which stage is broken is usually wrong, so measure.`,
            },
          ],
          reviewItems: [
            { id: "e6l1-i1", front: "What does AARRR stand for?", back: "Acquisition, Activation, Retention, Referral, Revenue (Dave McClure's pirate metrics)." },
            { id: "e6l1-i2", front: "What is activation?", back: "Getting a new user to first experience the core value — the 'aha' moment; it precedes retention." },
            { id: "e6l1-i3", front: "Why are many 'retention' problems really activation problems?", back: "Users who never reached the core-value moment were never positioned to retain — they left before experiencing it." },
            { id: "e6l1-i4", front: "Where should you focus funnel effort?", back: "On the stage with the worst measured drop-off — not where you assume the problem is." },
          ],
        },
        {
          id: "e6l2",
          title: "Retention Is the Foundation",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "The leaky bucket",
              body: `Acquisition without retention is pouring water into a leaky bucket: you pay CAC for users who churn, so growth stops the instant you stop spending. **Retention is the foundation** — it determines whether acquisition compounds (you keep what you add) or evaporates. Fix retention before scaling spend.`,
            },
            {
              type: "text",
              heading: "Cohorts and the retention curve",
              body: `Track **cohorts** (users grouped by when they joined) and plot how many stay active over time. A curve that **flattens at a healthy plateau** means a real, retained base — the signature of product-market fit. A curve that decays toward zero means no durable value, and no amount of acquisition will save it.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**You cannot out-acquire bad retention.** If the curve goes to zero, the business is renting users, not building a base. Retention is the metric most correlated with long-term success — and the hardest to fake.`,
            },
          ],
          reviewItems: [
            { id: "e6l2-i1", front: "The leaky-bucket problem?", back: "Acquiring users who churn wastes CAC; growth stops when spending stops. Retention determines whether acquisition compounds." },
            { id: "e6l2-i2", front: "What is a cohort, and what does its retention curve show?", back: "Users grouped by join date; the curve shows how many stay active over time — a healthy plateau signals a retained base / PMF." },
            { id: "e6l2-i3", front: "What does a retention curve decaying to zero mean?", back: "No durable value — the product isn't retained, and acquisition can't fix it." },
            { id: "e6l2-i4", front: "Why fix retention before acquisition?", back: "Acquisition amplifies whatever retention you have — including zero; you can't out-acquire a leaky bucket." },
          ],
        },
        {
          id: "e6l3",
          title: "Engines of Growth & Virality",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Three engines",
              body: `Ries names three engines of growth. **Sticky**: high retention compounds the existing base. **Viral**: each user brings new users through normal use. **Paid**: profit (LTV − CAC) funds acquisition. A startup should pick and tune *one* engine; trying to run all three diffusely usually means none works.`,
            },
            {
              type: "text",
              heading: "The k-factor",
              body: `Virality is measured by the **k-factor**: k = (invites sent per user) × (conversion rate of an invite). If **k ≥ 1**, each user brings at least one more — growth is self-sustaining and exponential. If k < 1, virality only amplifies other channels; it won't carry growth on its own. Most products have k well below 1, so true viral growth is rare.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Growth loops beat funnels.** A funnel runs once per user; a **loop** feeds its output back into its input (each retained or referred user generates the next), compounding over time. The best growth comes from a loop tied to a real, retained behavior — not a one-time campaign.`,
            },
          ],
          reviewItems: [
            { id: "e6l3-i1", front: "The three engines of growth?", back: "Sticky (retention compounds), viral (users bring users), paid (LTV−CAC funds acquisition)." },
            { id: "e6l3-i2", front: "The k-factor formula and the key threshold?", back: "k = invites per user × invite conversion rate; k ≥ 1 means self-sustaining exponential growth." },
            { id: "e6l3-i3", front: "What does k < 1 mean for virality?", back: "Virality amplifies other channels but can't carry growth alone — most products sit well below 1." },
            { id: "e6l3-i4", front: "Growth loop vs funnel?", back: "A funnel runs once per user; a loop feeds output back to input (each user generates the next), compounding." },
          ],
        },
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
          id: "e7l1",
          title: "Bootstrapping vs Venture, and the Power Law",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "VC runs on a power law",
              body: `A venture fund makes many bets; most return little, and a tiny handful of huge winners must return the *entire fund*. So a VC can only back companies that could plausibly become enormous — large enough to return their whole fund — and that have a path to an exit (acquisition or IPO). This **power law** is why VCs chase venture-scale outcomes, not steady ones.`,
            },
            {
              type: "text",
              heading: "Most good businesses aren't venture-backable",
              body: `A profitable company growing steadily to a few million in revenue can be an excellent business and a terrible VC investment — it can't return a fund and offers no big exit. That's not failure; it's a mismatch. The right financing for such a business is **bootstrapping** from revenue, debt, or revenue-based financing — which keep founders in control and don't demand a moonshot.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Raising VC is a strategic commitment, not free money.** It obliges you to pursue a venture-scale, exit-bound outcome on the fund's timeline. Take it only if your business genuinely has that shape — otherwise it forces reckless growth on a company that should compound calmly.`,
            },
          ],
          reviewItems: [
            { id: "e7l1-i1", front: "The VC power law?", back: "A few huge winners must return the whole fund; most bets return little — so VCs need venture-scale outcomes." },
            { id: "e7l1-i2", front: "Why isn't a steady $5M/year business venture-backable?", back: "It can't return a fund and has no large exit — a mismatch with VC economics, not a failure." },
            { id: "e7l1-i3", front: "Financing that fits a steady, profitable business?", back: "Bootstrapping from revenue, debt/line of credit, or revenue-based financing — founder-controlled, no moonshot required." },
            { id: "e7l1-i4", front: "What does raising VC commit you to?", back: "Pursuing a venture-scale, exit-bound outcome on the fund's timeline — a strategic choice, not free money." },
          ],
        },
        {
          id: "e7l2",
          title: "Stages & the Cap Table",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Stages buy down risk",
              body: `Rounds — pre-seed, seed, Series A, B, and on — each fund the milestones that de-risk the next: seed to find product-market fit, Series A to prove a repeatable growth model, later rounds to scale it. Raise against a clear milestone, not a vague runway.`,
            },
            {
              type: "text",
              heading: "Dilution and the post-money math",
              body: `The **cap table** lists who owns what. Issuing new shares to investors **dilutes** existing holders — your *percentage* shrinks (ideally of a bigger pie). The core arithmetic: **post-money = pre-money + investment**, and the new investor's ownership = **investment ÷ post-money**. Raise $2M at an $8M pre-money → $10M post, and investors own 2 ÷ 10 = 20%.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Percentage shrinks; value can grow.** Dilution isn't inherently bad — owning 15% of a company worth $1B beats 100% of one worth nothing. The goal is to raise the right amount at the right price for the milestone, not to minimize dilution at all costs.`,
            },
          ],
          reviewItems: [
            { id: "e7l2-i1", front: "What does each financing stage fund?", back: "The milestones that de-risk the next (seed → PMF, Series A → repeatable growth, later → scale)." },
            { id: "e7l2-i2", front: "Post-money valuation formula?", back: "post-money = pre-money + investment." },
            { id: "e7l2-i3", front: "New investor's ownership percentage?", back: "investment ÷ post-money (e.g. $2M ÷ $10M = 20%)." },
            { id: "e7l2-i4", front: "Why isn't dilution inherently bad?", back: "Your percentage shrinks but the pie can grow — 15% of a huge outcome beats 100% of nothing." },
          ],
        },
        {
          id: "e7l3",
          title: "Term Sheets & the Process",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Valuation is not the whole deal",
              body: `Two terms quietly shape what founders keep. The **option pool**: investors often require a new employee pool carved out of the *pre-money*, so founders absorb that dilution (the "option-pool shuffle") — a bigger pool at fixed pre-money silently lowers your real price. The **liquidation preference**: investors get paid back first (typically 1×, sometimes participating), which can gut founder proceeds in a modest exit even at a high headline valuation.`,
            },
            {
              type: "text",
              heading: "Fundraising is a sales process",
              body: `A round is a sale: you're selling equity, so run it like one — build a pipeline of investors, create urgency and momentum (parallel conversations, a real timeline), and drive to a close. Investors are not default-yes; a tight, momentum-driven process is what produces a term sheet and a fair price.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Optimize for ownership × outcome × clean terms — not the headline valuation.** A high valuation with a large option pool and a 2× participating preference can leave founders worse off than a lower valuation with clean terms.`,
            },
          ],
          reviewItems: [
            { id: "e7l3-i1", front: "The option-pool shuffle?", back: "Investors require a new option pool from the pre-money, so founders (not investors) absorb that dilution — lowering the effective price." },
            { id: "e7l3-i2", front: "What is a liquidation preference?", back: "Investors are paid back first in an exit (often 1×, sometimes participating), which can gut founder proceeds in a modest exit." },
            { id: "e7l3-i3", front: "Why treat fundraising as a sales process?", back: "You're selling equity — build a pipeline, create momentum/urgency, and drive to a close; investors aren't default-yes." },
            { id: "e7l3-i4", front: "What should founders optimize, if not headline valuation?", back: "Ownership × outcome × clean terms — pool size and preference can outweigh a higher valuation." },
          ],
        },
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
          id: "e8l1",
          title: "The Founding Team",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Investors bet on the team",
              body: `At the earliest stage there's little product and no traction to evaluate, so investors bet primarily on the **team** — its domain insight, resilience, and ability to execute and adapt. A great team in an okay market usually beats a weak team in a great one, because the team is what survives the inevitable pivots.`,
            },
            {
              type: "text",
              heading: "Co-founder conflict is a top killer",
              body: `The most common way early startups die isn't the market or the tech — it's **co-founder breakdown**. Complementary skills, genuinely shared values, and explicit, hard conversations *up front* (roles, equity, decision-making, what happens if someone leaves) prevent the disputes that otherwise detonate under stress.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Have the hard conversations before you need them.** Equity splits, roles, and exit scenarios are easy to discuss while everyone's optimistic and brutal to negotiate mid-crisis. Front-load them.`,
            },
          ],
          reviewItems: [
            { id: "e8l1-i1", front: "What do early-stage investors bet on most, and why?", back: "The team — there's little product/traction yet, and the team is what executes and survives pivots." },
            { id: "e8l1-i2", front: "A top reason early startups die (people-side)?", back: "Co-founder conflict / breakdown — more often than market or technology." },
            { id: "e8l1-i3", front: "How do you prevent co-founder blowups?", back: "Complementary skills, shared values, and explicit hard conversations up front (roles, equity, exit scenarios)." },
            { id: "e8l1-i4", front: "When should founders settle roles and equity?", back: "Early, while everyone is optimistic — not mid-crisis when it's brutal to negotiate." },
          ],
        },
        {
          id: "e8l2",
          title: "Equity & Vesting",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Splitting founder equity",
              body: `The idea is worth far less than the years of risky execution ahead, so heavily unequal splits among active, full-time co-founders are usually a mistake — they demotivate the smaller holder and signal a partner is really an employee. For co-founders contributing comparably going forward, **near-equal** splits best align incentives for the long haul; large gaps should reflect genuinely large differences in commitment or risk, decided openly.`,
            },
            {
              type: "text",
              heading: "Vesting protects everyone",
              body: `Regardless of the split, founder equity should **vest** — typically over **4 years with a 1-year cliff** (nothing vests if you leave in the first year; then it accrues monthly). Vesting means equity is *earned* through continued contribution: if a co-founder leaves after six months, they don't walk away owning half the company. It protects the company and the remaining founders.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Vesting is for founders too, not just employees.** Founders sometimes skip vesting on themselves — a costly mistake. The cliff is exactly what saves the cap table when an early co-founder departs.`,
            },
          ],
          reviewItems: [
            { id: "e8l2-i1", front: "Why avoid heavily unequal splits among active co-founders?", back: "The idea is worth little vs years of execution; lopsided splits demotivate and signal 'employee,' breeding conflict." },
            { id: "e8l2-i2", front: "Standard founder vesting schedule?", back: "Typically 4 years with a 1-year cliff, then monthly — equity earned through continued contribution." },
            { id: "e8l2-i3", front: "What does the 1-year cliff do?", back: "Nothing vests if you leave within the first year — it protects the cap table against early departures." },
            { id: "e8l2-i4", front: "Should founders vest their own equity?", back: "Yes — skipping it is a costly mistake; the cliff is what saves the cap table if a co-founder leaves early." },
          ],
        },
        {
          id: "e8l3",
          title: "Hiring & Execution",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Hire for the stage",
              body: `Early hires are high-agency **generalists** on the critical path who wear many hats and help set the culture; specialists and managers come later, at scale. Match each hire to what most de-risks the company *now*, not to an org chart you don't yet have.`,
            },
            {
              type: "text",
              heading: "A bad early hire is catastrophic",
              body: `In a five-person company, one hire is 20% of the team, shapes the culture every future hire inherits, and carries enormous opportunity cost if wrong — and firing in a tiny team is painful. Hence **"slow to hire, fast to fire"**: hold a very high bar on skills, values, and ownership, and correct mistakes quickly rather than letting them calcify.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The founder's job shifts from doing to building.** Early on you do the work; as you grow, your job becomes hiring and enabling the people who do it, plus keeping the company focused on a few priorities (e.g. clear goals/OKRs). Failing to make that shift caps the company at what the founders can personally do.`,
            },
          ],
          reviewItems: [
            { id: "e8l3-i1", front: "What kind of people are the right early hires?", back: "High-agency generalists on the critical path who wear many hats and shape culture — specialists come at scale." },
            { id: "e8l3-i2", front: "Why is a bad early hire so costly?", back: "They're a large fraction of the team, set culture, carry big opportunity cost, and are painful to fire in a tiny org." },
            { id: "e8l3-i3", front: "What does 'slow to hire, fast to fire' mean?", back: "Hold a very high bar before hiring, and correct hiring mistakes quickly rather than letting them calcify." },
            { id: "e8l3-i4", front: "How does the founder's role change with scale?", back: "From doing the work to hiring/enabling those who do it and keeping the company focused on a few priorities." },
          ],
        },
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
          id: "e9l1",
          title: "Competitive Strategy & Five Forces",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Where do profits come from?",
              body: `Porter's **five forces** explain why some industries are profitable and others brutal: the intensity of **rivalry**, the threat of **new entrants**, the threat of **substitutes**, and the bargaining power of **buyers** and **suppliers**. Strong forces compete profits away; weak forces leave room to earn. Strategy is choosing a position where these forces are favorable — not merely being "better."`,
            },
            {
              type: "text",
              heading: "Strategy is choosing what not to do",
              body: `A strategy is a coherent set of choices about where to play and how to win that competitors can't easily copy — deliberately *not* serving some customers or doing some things. "Be better than everyone at everything" isn't a strategy; it's a wish, and it invites everyone to compete with you head-on.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Pick your battlefield.** Two equally good teams can have opposite fates depending on industry structure. Where you compete (the five forces you face) often matters as much as how well you execute.`,
            },
          ],
          reviewItems: [
            { id: "e9l1-i1", front: "Porter's five forces?", back: "Rivalry, threat of new entrants, threat of substitutes, buyer power, supplier power — they determine industry profitability." },
            { id: "e9l1-i2", front: "What does a strategy actually consist of?", back: "Coherent, hard-to-copy choices about where to play and how to win — including what NOT to do." },
            { id: "e9l1-i3", front: "Why isn't 'be better at everything' a strategy?", back: "It's a wish, not a set of choices — and it invites everyone to compete with you head-on." },
            { id: "e9l1-i4", front: "Why does the choice of industry/battlefield matter so much?", back: "Industry structure (the five forces) can decide outcomes as much as execution quality does." },
          ],
        },
        {
          id: "e9l2",
          title: "Moats: What Makes Advantage Durable",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "A great product is not a moat",
              body: `Products get copied. A **moat** is what keeps competitors from taking your customers even when they match your product. The main sources: **network effects**, **economies of scale**, **switching/lock-in costs**, **brand/trust**, and **proprietary technology or data**. Without one, today's hit invites tomorrow's clone.`,
            },
            {
              type: "text",
              heading: "Network effects: the strongest digital moat",
              body: `A product has **network effects** when it becomes more valuable to each user as more people use it (a phone network, a marketplace, a social graph). The possible connections grow faster than the user count, so value compounds — and the leader becomes self-reinforcing and hard to dislodge, tending toward **winner-take-most**. A thin competing network simply can't offer comparable value.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Engineer the moat deliberately.** Defensibility rarely appears by accident. Decide which moat you're building (often network effects + switching costs) and design the product and go-to-market to create it — reaching critical mass in one segment first.`,
            },
          ],
          reviewItems: [
            { id: "e9l2-i1", front: "What is a moat?", back: "A durable advantage that keeps competitors from taking your customers even when they copy your product." },
            { id: "e9l2-i2", front: "Name the main sources of a moat.", back: "Network effects, economies of scale, switching/lock-in costs, brand/trust, proprietary tech or data." },
            { id: "e9l2-i3", front: "What are network effects, and why are they powerful?", back: "Value rises for each user as more people join; it compounds and self-reinforces, tending to winner-take-most." },
            { id: "e9l2-i4", front: "Why isn't a great product a moat by itself?", back: "Products get copied; without a structural advantage, a hit invites clones." },
          ],
        },
        {
          id: "e9l3",
          title: "Scaling: Blitzscaling vs Sustainable",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Speed over efficiency — sometimes",
              body: `**Blitzscaling** (Reid Hoffman) means deliberately prioritizing **speed over efficiency** — tolerating burn, mess, and risk — to capture a market before anyone else can. It's the right move when the market is **winner-take-most** (usually because of strong network effects), so the first company to reach critical scale becomes nearly unassailable, and when the unit economics can plausibly work once scale arrives.`,
            },
            {
              type: "text",
              heading: "When it's reckless",
              body: `Blitzscaling without those conditions just burns money faster. If there's **no winner-take-most dynamic or moat**, racing ahead builds no durable lead; if the **unit economics are negative**, scaling multiplies the losses (the lesson from unit economics) and accelerates death. Most businesses should grow sustainably and let reckless competitors burn out.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Scale magnifies whatever you are.** Growth amplifies good economics and a real moat into dominance — and bad economics or no moat into a faster collapse. Earn the right to blitzscale; don't assume it.`,
            },
          ],
          reviewItems: [
            { id: "e9l3-i1", front: "What is blitzscaling?", back: "Deliberately prioritizing speed over efficiency to capture a winner-take-most market before competitors can." },
            { id: "e9l3-i2", front: "When is blitzscaling warranted?", back: "Winner-take-most markets (often network effects) where first-to-scale wins, and unit economics can plausibly work at scale." },
            { id: "e9l3-i3", front: "When is blitzscaling reckless?", back: "No winner-take-most dynamic/moat, or negative unit economics — then speed just multiplies losses." },
            { id: "e9l3-i4", front: "What does scaling do to a business's fundamentals?", back: "It magnifies them — good economics + a moat into dominance, bad economics or no moat into faster collapse." },
          ],
        },
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
