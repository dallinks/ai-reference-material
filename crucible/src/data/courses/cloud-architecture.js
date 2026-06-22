// Cloud Architecture & Distributed Systems — vendor-neutral, professional/graduate
// level. The principles that hold on any cloud, anchored in Designing
// Data-Intensive Applications (Kleppmann), Google's SRE books, and the
// Well-Architected frameworks (abstracted).
//
// Rigor here is design judgment graded against an architect's rubric (`open`
// questions) plus a verifiable quantitative spine (capacity/QPS, Little's Law,
// availability, quorums, cache hit-ratios). Unit 1 of 9 is complete; 2–9 follow.

export const cloud = {
  id: "cloud",
  title: "Cloud Architecture & Distributed Systems",
  subject: "Software Architecture",
  difficulty: "Professional / Graduate",
  description:
    "The vendor-neutral principles of building scalable, reliable distributed systems on any cloud — scaling, availability, consistency, data, caching, async, microservices, resilience, security, and cost. Design judgment is graded against an architect's rubric, with a quantitative spine.",
  sources: [
    "Martin Kleppmann — Designing Data-Intensive Applications (O'Reilly; 1st ed. 2017, 2nd ed. w/ Chris Riccomini, 2026) — the backbone text",
    "Gilbert & Lynch — Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services (ACM SIGACT News, 2002); Perspectives on the CAP Theorem (IEEE Computer 45(2), 2012)",
    "Lamport — Time, Clocks, and the Ordering of Events in a Distributed System (CACM 21(7), 1978); The Part-Time Parliament / Paxos Made Simple (1998 / 2001)",
    "Ongaro & Ousterhout — In Search of an Understandable Consensus Algorithm (Raft, USENIX ATC '14)",
    "DeCandia et al. — Dynamo (SOSP, 2007); Corbett et al. — Spanner (OSDI, 2012); Fischer, Lynch & Paterson — FLP Impossibility (JACM, 1985)",
    "Google — Site Reliability Engineering & The SRE Workbook (free at sre.google/books); MIT 6.5840 (formerly 6.824) Distributed Systems",
    "AWS / Azure / Google Well-Architected & Architecture frameworks (abstracted)",
  ],
  grader:
    "You are a seasoned principal cloud and distributed-systems architect, in the spirit of Designing Data-Intensive Applications and Google SRE, grading system-design answers. Reward reasoning from first principles, explicit trade-offs, quantification where possible (capacity, availability, latency, consistency), and choices tied to the stated requirements and failure modes. Penalize buzzword-dropping, hand-waving, cargo-culting a technology without justification, and ignoring bottlenecks, failure modes, or cost. A confident answer that lists technologies without reasoning about trade-offs should score low.",
  units: [
    {
      id: "c1",
      title: "Scalability & Performance",
      summary: "Scale up vs out, statelessness and load balancing, capacity estimation, and the latency/percentile thinking that real systems need.",
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 1, Reliable, Scalable, and Maintainable Applications",
        "Dean & Barroso — The Tail at Scale (Communications of the ACM 56(2), 2013)",
        "Amdahl — Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities (AFIPS, 1967)",
        "Google — Site Reliability Engineering: load balancing & SLOs (free at sre.google/books)",
      ],
      masteryThreshold: 0.85,
      lessons: [
        {
          id: "c1l1",
          title: "Scale Up or Scale Out",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Two ways to grow",
              body: `**Vertical scaling** (scale up) means a bigger machine — more CPU, RAM, faster disk. It's simple (no code changes) but hits a hard ceiling at the largest machine money can buy, gets expensive at the top end, and leaves a single point of failure. **Horizontal scaling** (scale out) means more machines working together — effectively unbounded and fault-tolerant, but it requires distributing work across nodes and, critically, designing those nodes to be **stateless**.`,
            },
            {
              type: "text",
              heading: "Statelessness is the enabler",
              body: `A service is **stateless** when any instance can handle any request — no per-client state lives on the node. Push session and state to a shared store (a database, a distributed cache, or a token the client carries). Then identical nodes are interchangeable: you add or remove them freely, and a node failure loses no state. Stateful nodes resist scaling out because requests get pinned to specific machines (sticky sessions), complicating both balancing and failover. This is the **shared-nothing** principle — nodes share no memory or disk and coordinate only over the network.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Design stateless from the start.** Vertical scaling is fine early because it's simpler, but it always hits a wall. If services are stateless from day one, scaling out is just adding nodes behind a load balancer — not a rewrite under pressure.`,
            },
          ],
          reviewItems: [
            { id: "c1l1-i1", front: "Vertical vs horizontal scaling?", back: "Vertical = bigger machine (simple, capped, single point of failure); horizontal = more machines (scales out, fault-tolerant, needs load balancing + statelessness)." },
            { id: "c1l1-i2", front: "Why does statelessness enable horizontal scaling?", back: "Any instance can serve any request, so nodes are interchangeable — add/remove freely, and a failure loses no state." },
            { id: "c1l1-i3", front: "The shared-nothing principle?", back: "Nodes share no memory or disk; they coordinate only over the network, so each scales independently." },
            { id: "c1l1-i4", front: "Where does state go in a stateless service?", back: "Into a shared store — a database, a distributed cache, or a token the client carries." },
          ],
        },
        {
          id: "c1l2",
          title: "Load Balancing & Capacity Estimation",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Distributing the work",
              body: `A **load balancer** spreads requests across instances. **L4** (transport-layer) balances on IP/port — fast and protocol-agnostic. **L7** (application-layer) understands HTTP — it can route by path or header, terminate TLS, and make smarter decisions. Common algorithms: round-robin, least-connections, weighted, and **consistent hashing**, which minimizes how many keys move when nodes are added or removed (vital for caches and sharded stores).`,
            },
            {
              type: "example",
              heading: "Back-of-the-envelope capacity",
              body: `Estimate before you build. Users → QPS: 8.64M daily active users × 10 requests/day, spread evenly = 86.4M/day ÷ 86,400 s/day = **1,000 QPS** average — then plan for 2–5× at peak. Size storage (objects × size × retention) and bandwidth (QPS × payload) the same way. These few numbers decide the whole architecture, so do them first.`,
            },
            {
              type: "text",
              heading: "Little's Law and the latency hierarchy",
              body: `**Little's Law**: L = λ·W — the average number of requests *in the system* equals arrival rate × average time each spends in it. At 500 req/s and 0.2 s latency, ~100 requests are in flight at once, which sizes your thread pools and connection limits. And internalize the **latency hierarchy** (orders of magnitude): main memory ~100 ns, SSD read ~tens of µs, same-datacenter network round-trip ~0.5 ms, disk seek ~10 ms, cross-continent round-trip ~150 ms. Good architecture keeps the slow tiers off the critical path.`,
            },
          ],
          reviewItems: [
            { id: "c1l2-i1", front: "L4 vs L7 load balancing?", back: "L4 balances on IP/port (fast, protocol-agnostic); L7 understands HTTP — routes by path/header, terminates TLS, smarter decisions." },
            { id: "c1l2-i2", front: "Why consistent hashing for balancing/sharding?", back: "It minimizes how many keys move when nodes are added or removed — essential for caches and sharded stores." },
            { id: "c1l2-i3", front: "Little's Law?", back: "L = λ·W: average requests in the system = arrival rate × average time each spends in it." },
            { id: "c1l2-i4", front: "Order-of-magnitude latencies: memory, datacenter RTT, disk seek, cross-continent RTT?", back: "~100 ns, ~0.5 ms, ~10 ms, ~150 ms." },
          ],
        },
        {
          id: "c1l3",
          title: "Latency, Throughput & the Limits of Scaling",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Latency vs throughput",
              body: `**Latency** is the time per request; **throughput** is requests per unit time. They're distinct and often traded off — batching raises throughput but adds latency, for instance. Optimize the one your requirements demand, and remember a system can have high throughput and terrible latency (or vice versa); a single number never tells the whole story.`,
            },
            {
              type: "text",
              heading: "Averages lie — use percentiles",
              body: `Report latency as **percentiles** (p50, p99, p99.9), never the average. The mean hides the tail, and users feel the slow requests. The p99 is the slowest 1% — and at scale that's a lot of requests. Worse, when one user request **fans out** to many backend services and waits for all of them, the chance of hitting *some* slow tail compounds. Tail latency is a first-class design concern, not a footnote.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Scaling isn't linear — Amdahl and contention.** Adding nodes doesn't multiply throughput forever. **Amdahl's Law**: if a fraction s of the work is serial, the max speedup is ≤ 1 / (s + (1−s)/N) — even a tiny serial fraction caps you. Real systems also pay **coherency** costs (coordination, crosstalk) that can make adding nodes *reduce* throughput past a point. Find the bottleneck on the critical path and attack that.`,
            },
          ],
          reviewItems: [
            { id: "c1l3-i1", front: "Latency vs throughput?", back: "Latency = time per request; throughput = requests per unit time; often traded off (e.g. batching raises throughput, adds latency)." },
            { id: "c1l3-i2", front: "Why report p99/p99.9 instead of average latency?", back: "Averages hide the tail; users feel slow requests, and with fan-out at scale the tail dominates the user experience." },
            { id: "c1l3-i3", front: "Amdahl's Law and its implication?", back: "Speedup ≤ 1/(s + (1−s)/N) for serial fraction s — even a small serial fraction caps achievable speedup." },
            { id: "c1l3-i4", front: "Why can adding nodes eventually hurt throughput?", back: "Coherency/coordination costs (crosstalk) grow with node count (the universal scalability law) — past a point, more nodes is worse." },
          ],
        },
      ],
      masteryCheck: {
        id: "c1-check",
        questions: [
          { id: "c1q1", type: "numeric", prompt: "A service has 8.64 million daily active users, each making 10 requests per day, spread evenly across the day. What is the average QPS (requests per second)? There are 86,400 seconds in a day.", answer: 1000, tolerance: 0, explanation: "8.64M × 10 = 86.4M requests/day ÷ 86,400 s = 1,000 QPS." },
          { id: "c1q2", type: "numeric", prompt: "Requests arrive at 500/s and each spends an average of 0.2 s in the system. By Little's Law (L = λ·W), how many requests are being processed concurrently on average?", answer: 100, tolerance: 0, explanation: "L = λ·W = 500 × 0.2 = 100." },
          { id: "c1q3", type: "mcq", prompt: "Horizontal scaling (scaling out) is generally preferred over vertical scaling for large systems because:", options: ["it adds capacity with commodity nodes and avoids a single-machine ceiling and single point of failure", "it is always cheaper per request", "it removes the need for load balancing", "it eliminates the need for statelessness"], answer: 0, explanation: "Scale-out grows by adding interchangeable nodes and removes the single-box ceiling and SPOF." },
          { id: "c1q4", type: "short", prompt: "Tail latency: the latency experienced by the slowest 1% of requests is the p____ percentile.", accept: ["99", "p99", "99th", "99.0"], explanation: "p99 is the 99th percentile — the slowest 1%." },
          {
            id: "c1q5",
            type: "open",
            points: 3,
            prompt: "A read-heavy web service runs on one large server and is hitting its capacity ceiling. The team's plan is to keep upgrading to bigger and bigger machines. Critique this approach and describe how you'd re-architect for horizontal scalability. Reference statelessness and load balancing.",
            rubric: [
              "Names the limits of vertical scaling: a hard ceiling at the biggest machine, steep cost at the top, and a single point of failure.",
              "Proposes horizontal scaling: multiple identical instances behind a load balancer.",
              "Addresses statelessness: move session/state off the app nodes (to a cache/DB/token) so instances are interchangeable.",
              "For a read-heavy service, adds appropriate tactics (read replicas and/or caching/CDN) to scale the read path.",
            ],
            solution:
              "Endlessly upgrading to bigger machines hits a wall: there is a largest machine you can buy, the price climbs steeply at the top, and a single box is a single point of failure — when it dies, the whole service dies. The fix is to scale out horizontally: run many identical application instances behind a load balancer that spreads requests across them. The enabler is statelessness — move any per-client or session state off the app nodes into a shared store (a distributed cache like Redis, the database, or a signed token the client carries) so that any instance can serve any request and nodes can be added, removed, or lost without consequence. Because the service is read-heavy, lean on the read path: add database read replicas to spread reads across copies, and put a cache (and a CDN for static or edge-cacheable content) in front so most reads never reach the database at all. Capacity then grows by adding commodity nodes rather than chasing an ever-bigger server, and no single machine's failure takes the service down.",
            explanation: "Vertical scaling caps out and is a SPOF; scale out with stateless instances behind a load balancer, plus read replicas/caching for the read-heavy path.",
          },
          {
            id: "c1q6",
            type: "open",
            points: 3,
            prompt: "Explain why optimizing for average (p50) latency can hide a serious user-experience problem, and how you'd measure and reason about latency properly. Reference tail latency / percentiles, and give a concrete example of why the tail matters at scale (e.g. a request that fans out to many services).",
            rubric: [
              "Explains that the average/p50 can look healthy while a meaningful fraction of requests are very slow — the mean hides the tail.",
              "Prescribes measuring latency as high percentiles (p99, p99.9) and reasoning about the worst experiences, not the typical one.",
              "Gives a concrete fan-out example showing the tail compounds (a request hitting many services is likely to hit at least one slow one).",
              "Connects to design: treat tail latency as first-class (timeouts, hedged requests, reducing fan-out), not an afterthought.",
            ],
            solution:
              "Average latency is misleading because it collapses the whole distribution into one number: a service can show a great p50 of, say, 50 ms while the slowest 1% of requests take seconds — and those slow requests are exactly the ones users notice and abandon. The discipline is to measure and target percentiles (p99, p99.9) and reason about the worst experiences rather than the typical one. The tail matters even more at scale because of fan-out: when a single user-facing request must call many backend services and wait for all of them, the chance that at least one hits its slow tail compounds. With 100 services each having a 1% chance of a slow (p99) response, roughly 63% of user requests touch at least one slow call (1 − 0.99^100 ≈ 0.63), so the user-visible latency is governed by the components' tails, not their averages. That makes tail latency a first-class design concern: set tight timeouts, issue hedged or backup requests for slow calls, reduce fan-out and serial dependencies, and provision capacity for p99 rather than the mean.",
            explanation: "p50 hides slow requests; measure p99/p99.9 and design for the tail — fan-out makes a small per-service tail dominate the user-facing latency.",
          },
          {
            id: "c1q7",
            type: "proof",
            points: 3,
            prompt: "Derive Amdahl's Law. A task has a fraction s (0 ≤ s ≤ 1) of work that is inherently serial; the remaining 1 − s is perfectly parallelizable across N processors. Prove that the speedup is S(N) = 1 / (s + (1 − s)/N), and state what it approaches as N → ∞.",
            rubric: [
              "Models the N-processor runtime (normalizing single-processor time to 1): the serial part takes s and the parallel part (1 − s)/N, run in sequence, for total s + (1 − s)/N.",
              "Defines speedup as the ratio of single-processor to N-processor time, S(N) = 1 / (s + (1 − s)/N).",
              "Carries the algebra correctly to the closed form.",
              "States the limit: as N → ∞, S(N) → 1/s — the serial fraction imposes a hard ceiling on speedup regardless of N.",
            ],
            solution:
              "Normalize the single-processor running time to T₁ = 1. By assumption a fraction s of the work is inherently serial and cannot be accelerated, so it takes time s regardless of how many processors are used; the remaining fraction 1 − s is perfectly parallelizable, so on N processors it takes (1 − s)/N. These two parts run in sequence, so the N-processor time is T_N = s + (1 − s)/N. Speedup is the ratio of the single-processor time to the parallel time: S(N) = T₁ / T_N = 1 / (s + (1 − s)/N). As N → ∞, the term (1 − s)/N → 0, so S(N) → 1/s. Therefore the speedup is bounded above by 1/s no matter how many processors are added — even a small serial fraction caps the gain (e.g. s = 0.05 limits the speedup to 20×). ∎",
            explanation: "The serial part stays at s while the parallel part shrinks to (1−s)/N; the ratio is 1/(s+(1−s)/N), which tends to 1/s as N grows.",
          },
        ],
      },
    },
    {
      id: "c2",
      title: "Availability & Reliability",
      summary: "The nines, SLIs/SLOs/SLAs and the error budget, and how availability composes — series erodes it, redundancy restores it.",
      prerequisites: ["c1"],
      masteryThreshold: 0.85,
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 1, Reliability",
        "Google — Site Reliability Engineering: SLOs, error budgets, MTTR (free at sre.google/books)",
      ],
      lessons: [
        {
          id: "c2l1",
          title: "The Nines, SLIs, SLOs & SLAs",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Availability in nines",
              body: `Availability is the fraction of time a service is working, usually quoted in **nines**. The intuition is downtime per year: **99.9%** ("three nines") allows ~8.76 hours/year; **99.99%** ~52.6 minutes; **99.999%** ~5.26 minutes. Each extra nine cuts allowed downtime ~10× — and costs far more to achieve. Pick a target from real requirements, not vanity.`,
            },
            {
              type: "text",
              heading: "SLI, SLO, SLA",
              body: `**SLI** (Service Level *Indicator*) — a measured quantity, e.g. the fraction of requests served successfully under 200 ms. **SLO** (*Objective*) — your internal target for an SLI, e.g. 99.9% of requests succeed. **SLA** (*Agreement*) — a contractual promise to customers, usually *looser* than the SLO, with penalties if breached. You set the SLO tighter than the SLA so you have margin before money is on the line.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The error budget reconciles reliability and speed.** If your SLO is 99.9%, then 0.1% unreliability is a *budget* you may spend — on releases, experiments, risk. Reliability at 100% is the wrong goal (it halts all change); the error budget turns "how reliable?" into an explicit, shared trade-off between stability and feature velocity.`,
            },
          ],
          reviewItems: [
            { id: "c2l1-i1", front: "Downtime/year for 99.9% vs 99.99%?", back: "~8.76 hours/year vs ~52.6 minutes/year — each nine cuts allowed downtime ~10×." },
            { id: "c2l1-i2", front: "SLI vs SLO vs SLA?", back: "SLI = a measured indicator; SLO = your internal target for it; SLA = a (looser) contractual promise with penalties." },
            { id: "c2l1-i3", front: "What is an error budget?", back: "The allowed unreliability (1 − SLO) you may spend on releases/risk before you must slow down and stabilize." },
            { id: "c2l1-i4", front: "Why isn't 100% reliability the goal?", back: "It halts all change; the error budget makes reliability-vs-velocity an explicit trade-off." },
          ],
        },
        {
          id: "c2l2",
          title: "Composing Availability",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Series: dependencies erode availability",
              body: `When a request needs several components and *all* must work (a **series** dependency), availabilities **multiply**. Two 99.9% services in series give 0.999 × 0.999 ≈ 99.8% — *worse* than either alone. A request touching ten 99.9% services is only ~99% available. Every hard dependency you add lowers the ceiling.`,
            },
            {
              type: "text",
              heading: "Redundancy: parallel restores it",
              body: `When *any one* of several redundant replicas suffices (a **parallel** arrangement), the service is down only if *all* fail, so availability = 1 − (1 − a)ⁿ. Two 99% replicas give 1 − 0.01² = 99.99%; three give 1 − 0.01³ = 99.9999%. Redundancy turns unreliable parts into a reliable whole — the core move behind high availability.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Redundancy only helps if failures are independent.** Two replicas in the same rack, on the same power, behind the same buggy deploy, fail together — correlated failure defeats the 1 − (1−a)ⁿ math. Real high availability spreads redundancy across **failure domains** (racks, zones, regions).`,
            },
          ],
          reviewItems: [
            { id: "c2l2-i1", front: "Availability of components in series?", back: "Multiply them: a·b — strictly ≤ the weakest link. Dependencies erode availability." },
            { id: "c2l2-i2", front: "Availability of n redundant replicas in parallel?", back: "1 − (1 − a)ⁿ — strictly ≥ a single replica. Redundancy improves availability." },
            { id: "c2l2-i3", front: "Two 99% replicas in parallel give what availability?", back: "1 − 0.01² = 99.99%." },
            { id: "c2l2-i4", front: "When does redundancy fail to help?", back: "When failures are correlated (same rack/power/deploy) — spread replicas across failure domains." },
          ],
        },
        {
          id: "c2l3",
          title: "Failure, Redundancy & Recovery",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Failure domains & blast radius",
              body: `A **failure domain** is the set of things that fail together (a process, machine, rack, availability zone, region). Good architecture limits the **blast radius** of any single failure by isolating domains — so losing one zone degrades, not destroys, the service. Spreading redundancy across domains is what makes the parallel-availability math actually hold.`,
            },
            {
              type: "text",
              heading: "MTBF, MTTR, and why recovery matters",
              body: `Availability ≈ MTBF / (MTBF + MTTR), where **MTBF** is mean time between failures and **MTTR** is mean time to recovery. This says **reducing MTTR is as powerful as preventing failures**: fast detection and automated recovery (health checks, failover, rollback) buy availability directly. You will have failures — design to recover quickly.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Degrade gracefully.** When a dependency fails, a resilient service sheds load, serves stale/cached data, or disables a feature rather than failing entirely (fail open vs fail closed is a deliberate choice). Partial service beats no service — design the degraded modes on purpose.`,
            },
          ],
          reviewItems: [
            { id: "c2l3-i1", front: "What is a failure domain / blast radius?", back: "The set of things that fail together; blast radius is how much one failure takes down — isolate domains to limit it." },
            { id: "c2l3-i2", front: "Availability in terms of MTBF and MTTR?", back: "MTBF / (MTBF + MTTR) — so reducing recovery time (MTTR) raises availability as much as preventing failures." },
            { id: "c2l3-i3", front: "Active-active vs active-passive redundancy?", back: "Active-active: all replicas serve traffic; active-passive: a standby takes over on failure (simpler, brief failover gap)." },
            { id: "c2l3-i4", front: "What is graceful degradation?", back: "On dependency failure, shed load / serve stale / disable a feature instead of failing entirely — partial service beats none." },
          ],
        },
      ],
      masteryCheck: {
        id: "c2-check",
        questions: [
          { id: "c2q1", type: "numeric", prompt: "An SLO of 99.9% availability allows how many hours of downtime per year? (365 × 24 × 0.001; to 2 decimals)", answer: 8.76, tolerance: 0.05, explanation: "8,760 hours/year × 0.001 = 8.76 hours." },
          { id: "c2q2", type: "numeric", prompt: "Two services, each 99.9% available, are called in series (both must succeed). What is the combined availability, as a percentage to one decimal place?", answer: 99.8, tolerance: 0.05, explanation: "0.999 × 0.999 = 0.998001 ≈ 99.8%." },
          { id: "c2q3", type: "numeric", prompt: "Two replicas, each 99% available, sit behind a load balancer; the service is up if either is up. What is the availability, as a percentage? (1 − (1−0.99)²)", answer: 99.99, tolerance: 0.01, explanation: "1 − 0.01² = 0.9999 = 99.99%." },
          { id: "c2q4", type: "mcq", prompt: "An error budget is:", options: ["the allowed amount of unreliability (1 − SLO), spent on releases and risk before you must slow down", "the money budgeted for the SLA penalties", "the number of on-call engineers", "the time allotted to fix a bug"], answer: 0, explanation: "It makes reliability-vs-velocity an explicit trade-off." },
          {
            id: "c2q5",
            type: "open",
            points: 3,
            prompt: "Explain the difference between an SLI, an SLO, and an SLA, and how an error budget is used to balance reliability against feature velocity. Give a concrete example.",
            rubric: [
              "Defines SLI (a measured indicator), SLO (internal target for an SLI), and SLA (a looser external contractual promise with penalties).",
              "Notes the SLO is set tighter than the SLA to leave margin.",
              "Explains the error budget = 1 − SLO, the allowed unreliability that can be 'spent' on releases/risk.",
              "Gives a concrete example tying it together (e.g. an SLI = request success rate, SLO = 99.9%, and burning the budget pauses risky launches).",
            ],
            solution:
              "An SLI is a measured quantity that reflects user-perceived health — for example, the fraction of HTTP requests that succeed within 200 ms. An SLO is your internal target for that SLI, e.g. 99.9% of requests succeed over 30 days. An SLA is a contractual promise to customers, usually looser than the SLO (say 99.5%) with financial penalties if breached; you keep the SLO tighter so you have margin before the SLA — and money — is at risk. The error budget is the complement of the SLO: at 99.9% you may be 'unreliable' 0.1% of the time, and that budget is a currency. While budget remains, teams ship features and take risks; if an incident or a bad release burns the budget, you freeze risky launches and spend the remaining time stabilizing. This reframes 'how reliable should we be?' from an argument into a shared, quantitative trade-off: 100% reliability is the wrong goal because it forbids all change, and the error budget is exactly the amount of failure you are willing to spend to move faster.",
            explanation: "SLI = measured, SLO = internal target, SLA = looser external promise; the error budget (1 − SLO) is spent on velocity until it runs out.",
          },
          {
            id: "c2q6",
            type: "proof",
            points: 3,
            prompt: "For independent components with availabilities a, b ∈ [0,1], prove that a series dependency can only decrease availability while a redundant (parallel) replica can only increase it: show the series availability a·b ≤ min(a,b), and the parallel availability 1 − (1−a)(1−b) ≥ max(a,b).",
            rubric: [
              "Series: uses b ≤ 1 to get a·b ≤ a and a ≤ 1 to get a·b ≤ b, hence a·b ≤ min(a,b).",
              "Parallel: expands 1 − (1−a)(1−b) = a + b − ab = a + b(1−a).",
              "Argues b(1−a) ≥ 0 (both factors nonnegative) so the parallel availability ≥ a, and symmetrically ≥ b, hence ≥ max(a,b).",
              "Concludes correctly: series ≤ the weaker component, parallel ≥ the stronger.",
            ],
            solution:
              "Series. The combined availability is a·b (both must be up, independent). Since 0 ≤ b ≤ 1, multiplying a by b cannot increase it: a·b ≤ a·1 = a. Likewise, since 0 ≤ a ≤ 1, a·b ≤ b. Therefore a·b ≤ min(a, b): a chain is no more available than its weakest link, and strictly less whenever both are below 1. Parallel (redundant). The combined availability is 1 − (1−a)(1−b) (down only if both are down). Expand: 1 − (1−a)(1−b) = 1 − (1 − a − b + ab) = a + b − ab = a + b(1 − a). Because 0 ≤ b and 0 ≤ a ≤ 1, the term b(1 − a) ≥ 0, so a + b(1−a) ≥ a. By symmetry (writing it as b + a(1−b)) it is also ≥ b. Hence 1 − (1−a)(1−b) ≥ max(a, b): redundancy is at least as available as the better replica, and strictly more whenever both are below 1. ∎",
            explanation: "Multiplying by a number ≤ 1 shrinks (series ≤ min); adding a nonnegative term b(1−a) grows (parallel ≥ max).",
          },
        ],
      },
    },
    {
      id: "c3",
      title: "Consistency & the CAP Theorem",
      summary: "Consistency models from linearizable to eventual, the CAP impossibility under partitions, and logical time.",
      prerequisites: ["c2"],
      masteryThreshold: 0.85,
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 5 (Replication), ch. 9 (Consistency and Consensus)",
        "Gilbert & Lynch — Brewer's Conjecture… (ACM SIGACT News, 2002); Perspectives on the CAP Theorem (IEEE Computer 45(2), 2012)",
        "Lamport — Time, Clocks, and the Ordering of Events (CACM 21(7), 1978)",
        "Abadi — Consistency Tradeoffs / PACELC (IEEE Computer 45(2), 2012)",
      ],
      lessons: [
        {
          id: "c3l1",
          title: "Consistency Models",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Strong vs eventual",
              body: `**Linearizability** (strong consistency) makes a replicated system behave as if there were a single copy: every operation appears to take effect atomically at some instant between its call and return, consistent with real-time order — so a read always sees the latest completed write. **Eventual consistency** drops that: replicas may diverge temporarily and only converge *if writes stop*. The gap between them is the central data-systems trade-off.`,
            },
            {
              type: "text",
              heading: "The spectrum and ACID vs BASE",
              body: `Between the two lie useful intermediate guarantees: **read-your-writes**, **monotonic reads**, and **causal consistency** (causally-related operations are seen in order). Databases frame the extremes as **ACID** (Atomicity, Consistency, Isolation, Durability — strong transactional guarantees) versus **BASE** (Basically Available, Soft state, Eventually consistent — the relaxed, high-availability stance). Most real systems pick a point on this spectrum per use case.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**"Eventually" can be a long time, and anomalies are real.** Under eventual consistency a user can write data and then not see it on a subsequent read (no read-your-writes), or see time go backwards (non-monotonic reads). Whether that's acceptable is a product decision — a shopping cart can tolerate it; a bank balance cannot.`,
            },
          ],
          reviewItems: [
            { id: "c3l1-i1", front: "Linearizability (strong consistency)?", back: "The system behaves as one copy: each op takes effect atomically at an instant in real-time order, so a read sees the latest completed write." },
            { id: "c3l1-i2", front: "Eventual consistency?", back: "Replicas may diverge temporarily and converge only if writes stop — no guarantee a read sees the latest write." },
            { id: "c3l1-i3", front: "ACID vs BASE?", back: "ACID: strong transactional guarantees. BASE: Basically Available, Soft state, Eventually consistent — relaxed for availability." },
            { id: "c3l1-i4", front: "Name two intermediate consistency guarantees.", back: "Read-your-writes, monotonic reads, causal consistency (any two)." },
          ],
        },
        {
          id: "c3l2",
          title: "The CAP Theorem",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "What CAP actually says",
              body: `**CAP** (Gilbert & Lynch's proof of Brewer's conjecture): in a network that can drop messages, it is impossible for a service to be both **consistent** (linearizable/atomic) and **available** (every request gets a response). Consistency is a *safety* property (no wrong answer); availability is a *liveness* property (eventually a response); partition-tolerance is the assumption that messages may be lost or delayed.`,
            },
            {
              type: "text",
              heading: "The real choice is C vs A under a partition",
              body: `The argument: split the nodes into two groups that cannot communicate; a read on the far side of a recent write cannot know about that write, so it must either answer (risking a stale, *inconsistent* value) or refuse to answer (becoming *unavailable*). Since real networks *do* partition, **P is not optional** — so the genuine decision is: during a partition, do you sacrifice consistency (stay available — AP, like Dynamo) or availability (stay consistent — CP)?`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**CAP is not "pick 2 of 3."** You don't get to permanently choose any two properties as a steady-state design. P is a fact of networks, not a choice; CAP only forces a C-vs-A trade-off *during a partition*. **PACELC** (Abadi) completes the picture: *Else* (when there's no partition) you still trade **L**atency vs **C**onsistency.`,
            },
          ],
          reviewItems: [
            { id: "c3l2-i1", front: "State the CAP theorem.", back: "Under network partitions, no service can be both consistent (linearizable) and available (every request gets a response)." },
            { id: "c3l2-i2", front: "Why is the real CAP choice 'C vs A under partition'?", back: "Partitions are unavoidable in real networks (P isn't optional), so during one you must drop either consistency or availability." },
            { id: "c3l2-i3", front: "The common CAP misstatement to avoid?", back: "'Pick 2 of 3' as a steady-state choice — wrong; CAP forces C-vs-A only during a partition, and P isn't optional." },
            { id: "c3l2-i4", front: "What does PACELC add?", back: "Else (no partition), you still trade Latency vs Consistency — CAP plus the normal-operation trade-off." },
          ],
        },
        {
          id: "c3l3",
          title: "Time & Ordering: Logical Clocks",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Physical clocks lie; use causality",
              body: `Wall-clock timestamps across machines are unreliable (clock skew, drift), so you cannot order distributed events by them. Lamport's insight: define order by **causality**. The **happens-before** relation (→) is the smallest relation with: (1) within a process, earlier events → later ones; (2) a message's send → its receive; (3) transitivity. Events with no → either way are **concurrent**.`,
            },
            {
              type: "text",
              heading: "Logical clocks",
              body: `A **logical clock** assigns each event a counter C satisfying the **clock condition**: if a → b then C(a) < C(b). Implementation: each process increments its counter per event, and on receiving a message stamps max(local, message) + 1. Breaking ties by process id gives a *total* order consistent with happens-before.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**The total order extends causality — it does not recover it.** a → b implies C(a) < C(b), but the converse is false: two *concurrent* events get ordered by their counters too, so C(a) < C(b) does NOT mean a caused b. Lamport timestamps lose the information about which events were concurrent; **vector clocks** are what actually capture causality both ways.`,
            },
          ],
          reviewItems: [
            { id: "c3l3-i1", front: "Why not order distributed events by physical clocks?", back: "Clock skew/drift make wall-clock timestamps unreliable across machines; order by causality instead." },
            { id: "c3l3-i2", front: "Lamport's happens-before (→) — the three rules?", back: "Same-process order; message send → receive; transitivity. Events with neither → are concurrent." },
            { id: "c3l3-i3", front: "The logical-clock condition?", back: "If a → b then C(a) < C(b)." },
            { id: "c3l3-i4", front: "Why don't Lamport timestamps recover causality?", back: "The order is one-directional: a→b ⇒ C(a)<C(b), but C(a)<C(b) can hold for concurrent events too. Vector clocks capture causality fully." },
          ],
        },
      ],
      masteryCheck: {
        id: "c3-check",
        questions: [
          { id: "c3q1", type: "mcq", prompt: "Under a network partition, the CAP theorem says a system must sacrifice:", options: ["either consistency (linearizability) or availability — it cannot guarantee both", "partition tolerance", "durability", "all three of C, A, and P"], answer: 0, explanation: "During a partition you choose C or A; P is forced by the network." },
          { id: "c3q2", type: "mcq", prompt: "Which statement about CAP is correct?", options: ["Under a partition you must choose between C and A; P is not optional in a real network", "You permanently pick 2 of the 3 properties as a design choice", "CAP proves you can never have consistency", "A single-node database must sacrifice one of C/A/P"], answer: 0, explanation: "CAP is not 'pick 2 of 3' — it forces a C-vs-A trade-off only during a partition." },
          { id: "c3q3", type: "short", prompt: "Lamport's logical clock satisfies the clock condition: if event a happens-before event b, then C(a) ____ C(b). Fill in the relation.", accept: ["<", "less than", "is less than", "<c(b)"], explanation: "a → b implies C(a) < C(b)." },
          { id: "c3q4", type: "mcq", prompt: "Eventual consistency guarantees that:", options: ["if writes stop, all replicas eventually converge to the same value", "every read sees the latest write immediately", "the system is always strongly consistent", "writes are rejected during partitions"], answer: 0, explanation: "Convergence is only guaranteed in the absence of new writes." },
          {
            id: "c3q5",
            type: "proof",
            points: 3,
            prompt: "State the CAP theorem precisely, then prove the impossibility: in an asynchronous network that may partition, no single-register service can be both available (every request returns a response) and consistent (linearizable/atomic). Use the standard two-execution / indistinguishability argument.",
            rubric: [
              "States CAP precisely: under partitions, consistency (linearizable) and availability (every request answered) cannot both hold.",
              "Sets up a partition splitting the replicas into two groups that cannot exchange messages.",
              "Runs the argument: a write completes on one side (by availability); a subsequent read on the other side, by availability, must answer — but having received no messages, it cannot know the new value (indistinguishability), so it returns a stale value, violating linearizability.",
              "Concludes the contradiction: assuming both A and C under a partition is impossible.",
            ],
            solution:
              "CAP theorem: in an asynchronous network in which messages may be lost (a partition), it is impossible for a read/write register to guarantee both availability (every request eventually returns a response) and consistency (linearizability — every operation appears to take effect atomically in a real-time-consistent order). Proof. Suppose, for contradiction, a service provides both. Partition the replicas into two non-empty groups G1 and G2 such that no message between them is delivered. A client issues a write of a new value v1 to a replica in G1; by availability this write returns (completes). Next a client issues a read to a replica in G2. By availability the read must return a value. But G2 received no messages since the partition began, so its state is exactly what it was before the write — the replica in G2 cannot distinguish an execution in which v1 was written from one in which it was not. It therefore returns the old value v0 ≠ v1. Linearizability requires that a read beginning after the write completed return v1 (or a later value); returning v0 violates it. Thus the service cannot be both available and consistent under the partition — contradiction. (Note: under full asynchrony the same indistinguishability arises even with no messages actually lost, merely arbitrarily delayed.) ∎",
            explanation: "Partition the replicas; the read side can't tell the write happened, so it must answer wrong (break C) or not answer (break A).",
          },
          {
            id: "c3q6",
            type: "proof",
            points: 3,
            prompt: "Define Lamport's happens-before relation (→) and the clock condition a logical clock C must satisfy. Prove that the Lamport-timestamp total order (ties broken by process id) is consistent with happens-before — a → b implies C(a) < C(b) — and explain precisely why the converse fails.",
            rubric: [
              "Defines happens-before (→) via the three rules: same-process program order, message send → receive, and transitivity.",
              "States the clock condition: a → b implies C(a) < C(b); describes the increment/max+1 implementation that achieves it.",
              "Proves consistency with → by cases (same process: counter increments; message: receive stamps > send; transitivity chains the strict inequalities).",
              "Explains the converse fails: concurrent events also receive ordered timestamps, so C(a) < C(b) does not imply a → b — the order extends but does not recover causality (vector clocks are needed for that).",
            ],
            solution:
              "Happens-before (→) is the smallest relation on events such that: (1) if a and b are in the same process and a occurs before b, then a → b; (2) if a is the sending of a message and b its receipt, then a → b; (3) it is transitive. Events with neither a → b nor b → a are concurrent. A logical clock C assigns each event an integer satisfying the clock condition: a → b implies C(a) < C(b). It is realized by having each process increment its counter on every event, and on receiving a message carrying timestamp t set its counter to max(local, t) + 1 before stamping the receive. Consistency with →: take a → b. If they are in the same process, the counter strictly increases between successive events, so C(a) < C(b). If a is a send and b its receive, the receive sets C(b) = max(local, C(a)) + 1 > C(a). Transitivity then chains these strict inequalities along any → path. Hence a → b ⇒ C(a) < C(b); breaking equal timestamps by a fixed total order on process ids yields a total order that still respects →. Converse fails: if a and b are concurrent, the construction still assigns them some timestamps, and nothing forces them equal — typically C(a) < C(b) or C(b) < C(a) purely from independent counter values. So C(a) < C(b) does not imply a → b; the total order imposes an order even on causally unrelated events, discarding the information that they were concurrent. Recovering causality in both directions requires vector clocks. ∎",
            explanation: "Each rule strictly increases C, so → ⇒ C(a)<C(b); but concurrent events also get ordered, so the implication is one-way only.",
          },
        ],
      },
    },
    {
      id: "c4",
      title: "Partitioning & Replication",
      summary: "Sharding data and replicating it — leader/leaderless schemes, and the quorum-intersection rule that buys tunable consistency.",
      prerequisites: ["c3"],
      masteryThreshold: 0.85,
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 5 (Replication), ch. 6 (Partitioning)",
        "DeCandia et al. — Dynamo: Amazon's Highly Available Key-value Store (SOSP, 2007)",
        "Corbett et al. — Spanner: Google's Globally-Distributed Database (OSDI, 2012)",
        "Gifford (weighted voting) & Thomas (majority consensus), 1979 — quorum intersection",
      ],
      lessons: [
        {
          id: "c4l1",
          title: "Partitioning (Sharding)",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Split data to scale past one machine",
              body: `**Partitioning** (sharding) divides a dataset across nodes so total data and load exceed any single machine. The two schemes: **range** partitioning keeps keys ordered (efficient range scans, but risks hotspots when load concentrates in a key range) and **hash** partitioning scatters keys by a hash (even spread, but loses efficient range queries).`,
            },
            {
              type: "text",
              heading: "Rebalancing and hot spots",
              body: `When nodes are added or removed, keys must move; **consistent hashing** minimizes that movement (only a fraction of keys relocate, not the whole map). The enemy is **skew/hot spots** — a "celebrity" key drawing disproportionate traffic to one shard. Mitigations: add a random suffix to spread a hot key, or split the hot shard further.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Partitioning and replication are orthogonal and combined.** Sharding spreads *different* data across nodes (for scale); replication keeps *copies of the same* data (for availability). Real systems do both: each shard is replicated across several nodes.`,
            },
          ],
          reviewItems: [
            { id: "c4l1-i1", front: "Range vs hash partitioning?", back: "Range: ordered keys, good for range scans, risks hotspots. Hash: even spread, no efficient range queries." },
            { id: "c4l1-i2", front: "Why consistent hashing for rebalancing?", back: "It minimizes key movement when nodes are added/removed — only a fraction relocate." },
            { id: "c4l1-i3", front: "What is a hot spot / skew, and a mitigation?", back: "A key/shard drawing disproportionate load (a 'celebrity' key); mitigate by adding a random suffix or splitting the shard." },
            { id: "c4l1-i4", front: "Partitioning vs replication?", back: "Partitioning spreads different data for scale; replication keeps copies of the same data for availability. Systems do both." },
          ],
        },
        {
          id: "c4l2",
          title: "Replication Schemes",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Leader-based and leaderless",
              body: `**Single-leader**: all writes go to one leader, which streams changes to followers (sync or async). Simple and consistent, but the leader is a write bottleneck and a failover point. **Multi-leader**: writes accepted at several leaders (e.g. multi-region), requiring conflict resolution. **Leaderless** (Dynamo-style): clients write to and read from several replicas directly, with no single leader — high availability, tunable consistency via quorums.`,
            },
            {
              type: "text",
              heading: "Replication lag and its anomalies",
              body: `Asynchronous replication is fast but introduces **lag**: a follower can be behind the leader, so a client may read stale data. This produces the anomalies from the consistency unit — failing **read-your-writes** (you don't see your own write) or **monotonic reads** (time appears to go backwards). Synchronous replication avoids lag but adds latency and couples availability to the slow replica.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The leader is the consistency/availability lever.** Single-leader gives easy strong consistency at the cost of a bottleneck and a failover gap (a CP lean). Leaderless trades simple strong consistency for availability and tunability (an AP lean) — which the quorum knobs in the next lesson make precise.`,
            },
          ],
          reviewItems: [
            { id: "c4l2-i1", front: "Single-leader replication — strengths and weakness?", back: "All writes to one leader → simple, consistent; but the leader is a write bottleneck and failover point." },
            { id: "c4l2-i2", front: "Leaderless (Dynamo-style) replication?", back: "Clients read/write several replicas directly, no leader — high availability with tunable consistency via quorums." },
            { id: "c4l2-i3", front: "What is replication lag and what does it cause?", back: "A follower trailing the leader under async replication — causes stale reads (breaks read-your-writes / monotonic reads)." },
            { id: "c4l2-i4", front: "Sync vs async replication trade-off?", back: "Sync: no lag/stale reads but higher latency and availability coupled to the slow replica. Async: fast but lagging." },
          ],
        },
        {
          id: "c4l3",
          title: "Quorums",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Tunable consistency with R, W, N",
              body: `In a leaderless store, data is replicated to **N** nodes; a write must be acknowledged by **W** of them and a read must query **R** of them. Tuning R and W trades latency against consistency. **Setting R + W > N yields a quorum-like system** (Dynamo's words): the read set and write set are forced to overlap, so a read always reaches at least one replica holding the latest write.`,
            },
            {
              type: "text",
              heading: "Two intersection rules",
              body: `**R + W > N** guarantees *read-write* overlap (reads see the latest completed write). **W > N/2** guarantees *write-write* overlap (any two write quorums share a node), preventing two conflicting concurrent writes from both succeeding unseen. The intersection principle predates Dynamo (Gifford and Thomas, 1979); Dynamo states R + W > N but does not prove it — the proof is the gate question.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Strict quorums vs Dynamo's reality.** Dynamo uses **sloppy quorums** with **hinted handoff** — during failures it writes to whatever N healthy nodes it can reach, so the strict overlap guarantee can be temporarily violated in exchange for staying writeable. That deliberate choice is what makes Dynamo AP: always-writeable, conflicts resolved later.`,
            },
          ],
          reviewItems: [
            { id: "c4l3-i1", front: "Meaning of N, R, W in a quorum store?", back: "N = replicas per item; W = nodes that must ack a write; R = nodes a read queries." },
            { id: "c4l3-i2", front: "What does R + W > N guarantee?", back: "Read and write quorums overlap, so a read reaches at least one replica with the latest completed write." },
            { id: "c4l3-i3", front: "What does W > N/2 guarantee?", back: "Any two write quorums intersect — preventing two conflicting concurrent writes from both succeeding unseen." },
            { id: "c4l3-i4", front: "What are sloppy quorums + hinted handoff?", back: "Writing to any N reachable nodes during failures (relaxing strict overlap) to stay available — Dynamo's AP choice." },
          ],
        },
      ],
      masteryCheck: {
        id: "c4-check",
        questions: [
          { id: "c4q1", type: "numeric", prompt: "A leaderless store has N = 5 replicas. Using symmetric quorums R = W with R + W > N for read-after-write consistency, what is the smallest R = W that works?", answer: 3, tolerance: 0, explanation: "2R > 5 ⇒ R ≥ 3, so R = W = 3." },
          { id: "c4q2", type: "mcq", prompt: "Setting R + W > N in a quorum system guarantees that:", options: ["every read quorum overlaps every write quorum, so a read sees at least one replica with the latest write", "writes never fail", "the system is always available", "no replication is needed"], answer: 0, explanation: "Quorum intersection forces read-write overlap." },
          { id: "c4q3", type: "short", prompt: "Hash partitioning spreads keys evenly but loses efficient ____ queries (which range partitioning supports).", accept: ["range", "range scan", "range scans", "ordered range"], explanation: "Hashing destroys key ordering, so range scans become expensive." },
          { id: "c4q4", type: "numeric", prompt: "With N = 5 replicas, what is the minimum write quorum W satisfying W > N/2, so any two write quorums overlap (preventing conflicting concurrent writes)?", answer: 3, tolerance: 0, explanation: "W > 2.5 ⇒ W ≥ 3." },
          {
            id: "c4q5",
            type: "proof",
            points: 3,
            prompt: "Prove the quorum-intersection property. In a system of N replicas where each read contacts R replicas and each write contacts W replicas, show that if R + W > N then every read quorum intersects every write quorum (so a read observes the most recent completed write). Then show W > N/2 guarantees any two write quorums intersect.",
            rubric: [
              "Models read and write quorums as subsets of the N replicas, with |read| = R and |write| = W.",
              "Read-write overlap: argues two subsets of an N-set with R + W > N must share at least R + W − N ≥ 1 element (inclusion-exclusion / pigeonhole).",
              "Connects intersection to correctness: the shared replica holds the latest completed write, and a read (using versions/timestamps) returns the newest value seen.",
              "Write-write overlap: applies the same bound to two write sets — W > N/2 gives 2W > N, so |W1 ∩ W2| ≥ 2W − N ≥ 1.",
            ],
            solution:
              "Model a read quorum as a set Q_R of replicas with |Q_R| = R and a write quorum as Q_W with |Q_W| = W, both subsets of the N replicas. Read-write intersection: by inclusion-exclusion, |Q_R ∪ Q_W| = |Q_R| + |Q_W| − |Q_R ∩ Q_W| ≤ N (the union fits within all N replicas). Rearranging, |Q_R ∩ Q_W| ≥ R + W − N. If R + W > N then R + W − N ≥ 1, so Q_R ∩ Q_W is non-empty: every read quorum shares at least one replica with every write quorum. That shared replica received the latest completed write (writes complete only after W acknowledgements), so a read that contacts R replicas and selects the value with the newest version/timestamp returns the most recent completed write. Write-write intersection: apply the identical bound to two write quorums Q1, Q2 of size W: |Q1 ∩ Q2| ≥ W + W − N = 2W − N. If W > N/2 then 2W > N, so 2W − N ≥ 1 and Q1 ∩ Q2 is non-empty — any two writes share a replica, which therefore witnesses both and can detect/serialize the conflict, so two conflicting concurrent writes cannot both succeed on disjoint replicas. ∎",
            explanation: "Two subsets of N elements whose sizes sum past N must overlap (pigeonhole): R+W>N gives read-write overlap, 2W>N gives write-write overlap.",
          },
          {
            id: "c4q6",
            type: "open",
            points: 3,
            prompt: "You're designing the data layer for a globally-distributed social app. Compare single-leader, multi-leader, and leaderless (quorum) replication for the 'post a status update' write path, and justify a choice. Reference consistency, availability, latency, and conflict handling.",
            rubric: [
              "Characterizes single-leader (simple, strongly consistent, but cross-region write latency to one leader and a failover gap).",
              "Characterizes multi-leader (low local write latency across regions, but write conflicts requiring resolution).",
              "Characterizes leaderless/quorum (high availability, tunable R/W consistency, conflicts resolved at read).",
              "Makes a justified choice for THIS workload tied to the trade-offs (e.g. status updates tolerate eventual consistency, so favor availability/low-latency local writes; reference R+W and conflict handling).",
            ],
            solution:
              "Single-leader sends every write to one leader: it's the simplest to reason about and gives strong consistency, but for a global user base most writes pay a cross-region round-trip to the leader (high latency), and the leader is a bottleneck and a failover point — a CP-leaning choice poorly matched to 'always let users post.' Multi-leader places a leader in each region so writes are accepted locally (low latency) and replicated asynchronously between regions; the cost is write conflicts (two regions editing related data) that need resolution (last-writer-wins, CRDTs, or app logic). Leaderless/quorum (Dynamo-style) lets a client write to W of N replicas and read from R, with no leader: it maximizes availability and write latency is tunable, conflicts are detected via versions and resolved at read time. For 'post a status update' the workload is write-heavy, latency-sensitive, and tolerant of brief staleness (a follower seeing a post a second late is fine, and there are few true conflicts on an append-style action). So I'd favor an available, low-latency design — leaderless with a low W (or multi-leader per region) so users in any region post with local latency, accepting eventual consistency on the read path. Where stronger guarantees are needed (e.g. 'block user' before 'post visible to them'), I'd raise R+W toward strong consistency for that specific operation rather than for the whole system.",
            explanation: "Status updates favor availability/low-latency local writes (leaderless/multi-leader, eventual consistency), reserving strong R+W quorums for the few operations that truly need them.",
          },
        ],
      },
    },
    {
      id: "c5",
      title: "Caching & Content Delivery",
      summary: "Where and how to cache, the write/invalidation strategies, and the hit-ratio math that makes (or breaks) the read path.",
      prerequisites: ["c4"],
      masteryThreshold: 0.85,
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 1 (performance), ch. 11 (derived/materialized data)",
        "Nygard — Release It! (cache stampede / stability patterns)",
      ],
      lessons: [
        {
          id: "c5l1",
          title: "Why & Where to Cache",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Trade staleness for latency and load",
              body: `A cache stores a copy of data closer or faster to access, trading a risk of **staleness** for big wins in **latency** and reduced **load** on the source. Caches sit at many layers: the client/browser, a **CDN/edge** near users, an in-memory store (Redis/Memcached) in front of the database, and the database's own buffer cache. Caching is the primary tool for scaling read-heavy systems.`,
            },
            {
              type: "text",
              heading: "Hit ratio is everything",
              body: `A cache's value is governed by its **hit ratio** h — the fraction of requests served from cache. The effective latency is roughly h × (cache latency) + (1 − h) × (origin latency). Because origin latency dwarfs cache latency, even small improvements in h move the average a lot; a low hit ratio means you've added a layer without the benefit.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Cache the hot, skip the cold.** The 80/20 (or steeper) access distribution means a small cache of the most popular items captures most reads. Cache what's read often and changes rarely; don't bother caching rarely-read or rapidly-changing data — the hit ratio (and staleness) won't justify it.`,
            },
          ],
          reviewItems: [
            { id: "c5l1-i1", front: "What does a cache fundamentally trade?", back: "Staleness risk for lower latency and reduced load on the source." },
            { id: "c5l1-i2", front: "Name the typical cache layers.", back: "Client/browser, CDN/edge, in-memory (Redis/Memcached) in front of the DB, and the DB's own buffer cache." },
            { id: "c5l1-i3", front: "Effective latency formula for a cache with hit ratio h?", back: "≈ h × cache_latency + (1 − h) × origin_latency." },
            { id: "c5l1-i4", front: "What should you cache (and not)?", back: "Cache hot, rarely-changing data; skip rarely-read or rapidly-changing data (low hit ratio / high staleness)." },
          ],
        },
        {
          id: "c5l2",
          title: "Strategies & Invalidation",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Read and write strategies",
              body: `**Cache-aside** (lazy): the app checks the cache, and on a miss loads from the DB and populates the cache — simple and resilient, but the first request is slow and writes must invalidate stale entries. **Write-through**: write to cache and DB together — reads stay consistent, writes are slower. **Write-back** (write-behind): write to cache and flush to the DB asynchronously — fast writes, but a cache failure can lose data.`,
            },
            {
              type: "text",
              heading: "Invalidation: the hard part",
              body: `"There are only two hard things in computer science: cache invalidation and naming things." Stale cache entries serve wrong data, so you must expire or invalidate them — via **TTL** (expire after a time), explicit invalidation on write, or versioned keys. The trade-off is staleness tolerance vs cache effectiveness: short TTLs are fresh but lower the hit ratio; long TTLs are efficient but stale.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Cache stampede (thundering herd).** When a popular entry expires, many requests miss simultaneously and all hit the origin at once, possibly overwhelming it. Mitigate with request **coalescing** (one request recomputes while others wait), a short **lock**, **staggered/jittered TTLs**, or serving stale while refreshing in the background.`,
            },
          ],
          reviewItems: [
            { id: "c5l2-i1", front: "Cache-aside pattern?", back: "App checks cache; on miss, loads from DB and populates the cache. Simple, resilient; first request slow; writes must invalidate." },
            { id: "c5l2-i2", front: "Write-through vs write-back?", back: "Write-through: cache+DB together (consistent, slower writes). Write-back: write cache, flush async (fast, risk of loss)." },
            { id: "c5l2-i3", front: "The TTL trade-off?", back: "Short TTL = fresher but lower hit ratio; long TTL = efficient but staler. Tune to staleness tolerance." },
            { id: "c5l2-i4", front: "What is a cache stampede, and a fix?", back: "Many simultaneous misses on a popular expired key hammer the origin; fix with request coalescing, locking, jittered TTLs, or serve-stale-while-refresh." },
          ],
        },
        {
          id: "c5l3",
          title: "CDNs & the Edge",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Move content near the user",
              body: `A **CDN** (Content Delivery Network) caches content at **edge** locations geographically close to users, cutting latency (shorter network path) and offloading the origin (most requests never reach it). Classically for static assets (images, JS, video), increasingly for cacheable API responses and even compute at the edge. The same hit-ratio math applies, now with the additional latency win of proximity.`,
            },
            {
              type: "text",
              heading: "Push vs pull, and keys",
              body: `**Pull** CDNs fetch from the origin on the first request to an edge (lazy, like cache-aside) and cache thereafter; **push** CDNs are pre-loaded with content. The **cache key** (URL plus relevant headers) determines what counts as the same object — getting it wrong (e.g. keying on a volatile header) destroys the hit ratio. Invalidation across a global edge network is the familiar hard problem at scale.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Latency is partly the speed of light.** A user 150 ms away pays that round-trip no matter how fast your origin is. A CDN edge nearby is often the only way to hit low latency for a global audience — proximity, not just caching, is the point.`,
            },
          ],
          reviewItems: [
            { id: "c5l3-i1", front: "What does a CDN do?", back: "Caches content at edge locations near users — lower latency (proximity) and offloads the origin." },
            { id: "c5l3-i2", front: "Pull vs push CDN?", back: "Pull: fetch from origin on first edge request, then cache (lazy). Push: pre-load content to the edge." },
            { id: "c5l3-i3", front: "Why does the cache key matter?", back: "It defines what counts as the same object; keying on a volatile header fragments the cache and destroys the hit ratio." },
            { id: "c5l3-i4", front: "Why can only a CDN hit low latency globally?", back: "Cross-continent round-trips (~150 ms) are bounded by physics; an edge near the user is the only way around it." },
          ],
        },
      ],
      masteryCheck: {
        id: "c5-check",
        questions: [
          { id: "c5q1", type: "numeric", prompt: "A cache has a 90% hit ratio; hits take 2 ms, misses take 100 ms (origin). What is the average (effective) latency in ms? (0.9×2 + 0.1×100)", answer: 11.8, tolerance: 0.1, explanation: "1.8 + 10 = 11.8 ms." },
          { id: "c5q2", type: "mcq", prompt: "In the cache-aside pattern:", options: ["the application checks the cache and, on a miss, loads from the DB and populates the cache", "the cache writes through to the DB on every read", "the DB pushes all data into the cache at startup", "cached entries never expire"], answer: 0, explanation: "Lazy population on read misses." },
          { id: "c5q3", type: "short", prompt: "The hardest problem in caching is keeping cached data fresh — i.e. cache ____.", accept: ["invalidation", "invalidation."], explanation: "Cache invalidation — knowing when a cached entry is stale." },
          { id: "c5q4", type: "numeric", prompt: "With hit latency 2 ms and miss latency 100 ms, what hit ratio h gives an average latency of 6.9 ms? Solve 2h + 100(1−h) = 6.9; give h to 2 decimals.", answer: 0.95, tolerance: 0.005, explanation: "100 − 98h = 6.9 ⇒ 98h = 93.1 ⇒ h = 0.95." },
          {
            id: "c5q5",
            type: "open",
            points: 3,
            prompt: "A read-heavy product-catalog service is overloading its database. Design a caching strategy: what to cache and where, which write/invalidation strategy, and how you'd handle a cache stampede when a popular entry expires. Justify the trade-offs.",
            rubric: [
              "Chooses what/where to cache (hot catalog reads in an in-memory cache and/or CDN for static assets) tied to the read-heavy, slowly-changing nature of a catalog.",
              "Picks a sensible write/invalidation strategy (cache-aside with invalidate-on-write, or write-through; TTLs sized to staleness tolerance).",
              "Addresses the cache stampede explicitly with a concrete mitigation (request coalescing/locking, jittered TTLs, or serve-stale-while-refresh).",
              "Justifies the trade-offs (hit ratio vs staleness, complexity, where the origin load lands).",
            ],
            solution:
              "A product catalog is read-heavy and changes slowly, so it caches beautifully. Put a hot in-memory cache (Redis) in front of the database for product records and put static assets (images, descriptions) behind a CDN at the edge. Use cache-aside for the records: on a read miss, load from the DB and populate the cache; on a write (price/inventory change), invalidate or update the affected key so stale data doesn't linger. Size TTLs to staleness tolerance — a product description can be cached for hours, a price for seconds-to-minutes — accepting that a longer TTL raises the hit ratio but risks brief staleness. For the cache stampede when a popular product expires: prevent the synchronized miss from hammering the database by coalescing requests (let one request recompute while the others wait on a short lock), jittering TTLs so popular keys don't all expire together, and/or serving the stale value while a background task refreshes it. The trade-off is freshness vs origin protection and complexity: cache-aside is simple and resilient (a cache outage just means more DB load, not wrong data), the invalidation-on-write keeps prices reasonably fresh, and the stampede mitigations cap the worst-case origin load — together taking the database from overloaded to mostly-idle on reads.",
            explanation: "Cache hot, slow-changing catalog data (Redis + CDN) with cache-aside + invalidate-on-write and TTLs by staleness tolerance; stop stampedes with coalescing/jitter/serve-stale.",
          },
          {
            id: "c5q6",
            type: "open",
            points: 3,
            prompt: "Caching introduces stale data. Explain the consistency trade-offs of cache-aside vs write-through vs write-back, and how you'd choose TTLs and invalidation for (a) a user's account balance versus (b) a product's view count. Reference staleness tolerance.",
            rubric: [
              "Compares the three strategies on consistency: write-through keeps cache and DB in step; cache-aside risks a stale window between a write and its invalidation; write-back risks data loss and the DB lagging the cache.",
              "Matches strategy/TTL to (a) account balance: low staleness tolerance — strong/fresh path (write-through or no cache / very short TTL / invalidate-on-write), correctness over hit ratio.",
              "Matches strategy/TTL to (b) view count: high staleness tolerance — can be eventually consistent (write-back/batched increments, longer TTL), favoring performance.",
              "Ties the choice explicitly to staleness tolerance / consequences of being wrong.",
            ],
            solution:
              "The three strategies sit on a consistency spectrum. Write-through writes cache and DB together, so the cache never lags the DB (most consistent, slower writes). Cache-aside leaves a stale window: between a DB write and the cache invalidation/refresh, readers can see old data — fine if brief and tolerable. Write-back writes only the cache and flushes asynchronously, so the DB lags the cache and a cache crash can lose un-flushed writes (least durable/consistent, fastest). Choosing per use case comes down to staleness tolerance and the cost of being wrong. (a) An account balance has very low staleness tolerance — showing a wrong balance is a correctness/trust failure — so favor consistency: read through to the source or use write-through with invalidate-on-write and a very short (or no) TTL, accepting a lower hit ratio for correctness. (b) A product view count tolerates large staleness — nobody cares if it's off by a few for a minute — so favor performance: increment in the cache and write back in batches (or cache the count with a long TTL), accepting eventual consistency. The rule: cache aggressively where being slightly stale is harmless, and tighten toward write-through / short TTL / no-cache exactly where wrong data has real consequences.",
            explanation: "Match strategy and TTL to staleness tolerance: write-through/short-TTL for a balance (correctness), write-back/long-TTL for a view count (performance).",
          },
          {
            id: "c5q6b",
            type: "mcq",
            prompt: "A pull (origin-fetch) CDN populates an edge location by:",
            options: ["fetching from the origin on the first request to that edge, then caching it", "pre-loading all content to every edge in advance", "writing through to the origin on every read", "never caching — always proxying to origin"],
            answer: 0,
            explanation: "Pull CDNs are lazy (like cache-aside); push CDNs pre-load.",
          },
        ],
      },
    },
    {
      id: "c6",
      title: "Asynchronous & Event-Driven Architecture",
      summary: "Decouple with queues and the log, get delivery semantics and idempotency right, and apply event sourcing, CQRS, and backpressure.",
      prerequisites: ["c5"],
      masteryThreshold: 0.85,
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 11 (Stream Processing)",
        "Kreps — The Log: What every software engineer should know about real-time data's unifying abstraction (2013)",
        "Kreps, Narkhede & Rao — Kafka: a Distributed Messaging System for Log Processing (NetDB, 2011)",
      ],
      lessons: [
        {
          id: "c6l1",
          title: "Why Asynchronous",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Decouple in time",
              body: `Synchronous calls couple caller and callee in time — the caller blocks, and if the callee is slow or down, so is the caller. **Asynchronous messaging** breaks that: a producer drops a message and moves on; a consumer processes it whenever ready. A **message queue** (point-to-point) distributes work to one of several consumers; **publish/subscribe** fans an event out to many independent subscribers.`,
            },
            {
              type: "text",
              heading: "Buffering and resilience",
              body: `A queue is also a **buffer** that levels load: a traffic spike fills the queue instead of crushing the consumers, which drain it at their own pace (smoothing, not dropping). And it improves **resilience** — a consumer crashing doesn't fail the producer; messages wait in the queue until the consumer recovers. The cost is added latency and the operational weight of the messaging system.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Async turns a chain into a buffer.** Synchronous A→B→C fails if any link is slow; the same flow with queues between stages keeps each stage independent — slowness in C backs up its queue without blocking A. You trade immediate consistency and simplicity for decoupling and absorptive capacity.`,
            },
          ],
          reviewItems: [
            { id: "c6l1-i1", front: "Queue (point-to-point) vs pub/sub?", back: "Queue delivers each message to one of several consumers (work distribution); pub/sub fans an event out to many subscribers." },
            { id: "c6l1-i2", front: "How does a queue help with traffic spikes?", back: "It buffers — a spike fills the queue and consumers drain it at their own pace, leveling load instead of crushing them." },
            { id: "c6l1-i3", front: "How does async improve resilience?", back: "A consumer crash doesn't fail the producer; messages wait in the queue until the consumer recovers." },
            { id: "c6l1-i4", front: "What does async cost?", back: "Added latency, eventual (not immediate) consistency, and the operational weight of the messaging system." },
          ],
        },
        {
          id: "c6l2",
          title: "The Log & Delivery Semantics",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "The append-only log",
              body: `The unifying abstraction (Kafka, Kreps's "The Log") is an **append-only, ordered, durable log** of records. Producers append; consumers read at their own offset and can **replay** from any point. Ordering and replayability make the log a backbone for both messaging and data integration — consumers are decoupled and can be added, reset, or rebuilt from history.`,
            },
            {
              type: "text",
              heading: "Delivery guarantees",
              body: `Three semantics: **at-most-once** (deliver once or not at all — may lose messages), **at-least-once** (deliver one or more times — never lost, but **may duplicate**; the common default), and **exactly-once** (deliver effectively once — hard). Because at-least-once retries can duplicate, consumers must be **idempotent**: processing the same message twice has the same effect as processing it once.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**"Exactly-once delivery" is largely a myth; exactly-once *processing* is achievable.** You generally can't guarantee a message is *delivered* exactly once over an unreliable network, but you can make the *effect* exactly-once by combining at-least-once delivery with idempotent consumers or deduplication (e.g. a unique message id checked before applying).`,
            },
          ],
          reviewItems: [
            { id: "c6l2-i1", front: "What is the log abstraction?", back: "An append-only, ordered, durable record of events; consumers read at their own offset and can replay from any point." },
            { id: "c6l2-i2", front: "The three delivery semantics?", back: "At-most-once (may lose), at-least-once (may duplicate — common default), exactly-once (hard)." },
            { id: "c6l2-i3", front: "Why must consumers be idempotent?", back: "At-least-once retries deliver duplicates; idempotency makes processing a duplicate equivalent to processing once." },
            { id: "c6l2-i4", front: "How is exactly-once *processing* achieved?", back: "At-least-once delivery + idempotent consumers or dedup (e.g. check a unique message id before applying)." },
          ],
        },
        {
          id: "c6l3",
          title: "Event Sourcing, CQRS & Backpressure",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Event sourcing & CQRS",
              body: `**Event sourcing** stores the full ordered log of state-changing **events** as the source of truth, deriving current state by replaying them — giving a complete audit trail and the ability to rebuild or time-travel. It pairs with **CQRS** (Command Query Responsibility Segregation): separate the write model (commands → events) from one or more read models (projections optimized for queries), updated asynchronously from the event stream.`,
            },
            {
              type: "text",
              heading: "Backpressure",
              body: `When producers outrun consumers, something must give — that's **backpressure**: the system signals upstream to slow down, or buffers (bounded), or sheds load (drops). Unbounded queues just defer the failure (and blow up memory); a healthy async system makes the overload behavior explicit — block the producer, drop low-priority work, or scale consumers — rather than silently falling over.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The outbox pattern fixes the dual write.** A service that must update its DB *and* publish an event can't do both atomically across two systems. Write the event to an **outbox** table in the same DB transaction, then a relay publishes it — turning two unreliable writes into one atomic write plus an at-least-once relay (consumers are idempotent anyway).`,
            },
          ],
          reviewItems: [
            { id: "c6l3-i1", front: "What is event sourcing?", back: "Store the ordered log of events as the source of truth; derive current state by replaying them (audit trail, rebuildable)." },
            { id: "c6l3-i2", front: "What is CQRS?", back: "Command Query Responsibility Segregation — separate the write model (commands→events) from read models (projections), updated async." },
            { id: "c6l3-i3", front: "What is backpressure?", back: "When producers outrun consumers, signaling upstream to slow / bounded-buffering / shedding load — making overload behavior explicit." },
            { id: "c6l3-i4", front: "What does the outbox pattern solve?", back: "The dual-write problem: write the event to an outbox in the same DB transaction, then relay it — one atomic write + at-least-once publish." },
          ],
        },
      ],
      masteryCheck: {
        id: "c6-check",
        questions: [
          { id: "c6q1", type: "mcq", prompt: "At-least-once delivery means:", options: ["a message is delivered one or more times (never lost, but possibly duplicated), so consumers must be idempotent", "exactly one delivery is guaranteed", "at most one delivery (the message may be lost)", "the message is never delivered"], answer: 0, explanation: "Never lost, but retries can duplicate — hence idempotency." },
          { id: "c6q2", type: "short", prompt: "Because retries can deliver a message more than once, consumers should be ____ — processing a duplicate has the same effect as processing it once.", accept: ["idempotent", "idempotent.", "idempotent processors"], explanation: "Idempotency is what makes at-least-once safe." },
          { id: "c6q3", type: "mcq", prompt: "A message queue between a producer and consumer primarily provides:", options: ["temporal decoupling and buffering — the producer isn't blocked and spikes are leveled", "stronger consistency", "lower storage cost", "encryption of messages"], answer: 0, explanation: "Decoupling in time plus load-leveling are the core benefits." },
          { id: "c6q4", type: "mcq", prompt: "Event sourcing stores:", options: ["the full ordered log of events as the source of truth, deriving current state by replaying them", "only the latest state", "no history at all", "just periodic database snapshots"], answer: 0, explanation: "Events are the source of truth; state is a derived replay." },
          {
            id: "c6q5",
            type: "open",
            points: 3,
            prompt: "Explain why 'exactly-once delivery' is famously hard in distributed systems, and how systems achieve exactly-once *processing* in practice. Reference at-least-once delivery and idempotency.",
            rubric: [
              "Explains the difficulty: over an unreliable network, an acknowledgement can be lost, so the sender cannot tell delivery from a lost ack — retrying risks a duplicate, not retrying risks a loss; you can't guarantee exactly one delivery.",
              "Distinguishes exactly-once DELIVERY (effectively impossible to guarantee) from exactly-once PROCESSING / effect (achievable).",
              "Describes the practical recipe: at-least-once delivery + idempotent consumers or deduplication (e.g. unique message ids / transactional offsets).",
              "Concludes that you make the effect exactly-once rather than the delivery.",
            ],
            solution:
              "Exactly-once delivery is hard because of the two-generals-style ambiguity of acknowledgements over an unreliable network: after a sender delivers a message and waits for an ack, a missing ack is indistinguishable from a lost message — the ack itself may have been dropped. If the sender retries, it risks a duplicate; if it doesn't, it risks a loss. So you cannot guarantee a message is physically delivered exactly once. The practical move is to separate delivery from effect: accept at-least-once delivery (never lose, possibly duplicate) and make the *processing* idempotent so that a duplicate has no additional effect — for example, tag each message with a unique id and check it before applying, use upserts keyed on that id, or commit the consumer's read offset in the same transaction as the side effect (transactional / 'exactly-once' processing as in Kafka). The result is exactly-once *semantics* on the outcome even though delivery is only at-least-once: you engineer the effect to be exactly-once rather than the unreliable network event.",
            explanation: "A lost ack is indistinguishable from a lost message, so delivery can't be exactly-once; achieve exactly-once *effect* via at-least-once + idempotency/dedup.",
          },
          {
            id: "c6q6",
            type: "open",
            points: 3,
            prompt: "Design the order-processing pipeline for an e-commerce checkout using an async/event-driven architecture. Address what should be synchronous vs asynchronous, the delivery guarantees and idempotency, and how a downstream service being temporarily down is handled.",
            rubric: [
              "Splits sync vs async sensibly: the user-facing 'place order' is acknowledged quickly (synchronous validation + persist + emit an event), while downstream steps (payment capture, inventory, email, shipping) run asynchronously off events.",
              "States delivery guarantees and idempotency: at-least-once event delivery with idempotent consumers / dedup keys so retries don't double-charge or double-ship.",
              "Handles a downstream outage: messages persist in the queue/log and are retried when the service recovers (and/or dead-letter for poison messages), so the order isn't lost and the user isn't blocked.",
              "Notes the consistency posture (eventual across services) and a reliability mechanism (e.g. outbox to avoid dual-write loss).",
            ],
            solution:
              "Keep the user's critical path synchronous and short: on checkout, validate the cart, reserve/persist the order, and emit an OrderPlaced event — then immediately acknowledge the user. Everything downstream runs asynchronously off that event: payment capture, inventory decrement, confirmation email, and shipping each consume the event stream independently. Use at-least-once delivery on a durable log, and make every consumer idempotent — key payment capture and inventory decrement on the order id (or a unique event id) so a redelivered event doesn't double-charge or double-decrement. To avoid the dual-write problem (persisting the order and publishing the event must be atomic), write the event to an outbox table in the same DB transaction as the order, and let a relay publish it. If a downstream service (say the payment processor's consumer) is temporarily down, its messages simply accumulate in the queue/log and are processed when it recovers — the order is never lost and the shopper is never blocked; poison messages that keep failing go to a dead-letter queue for inspection. The consistency posture is eventual across services (the order exists before payment is captured), which is acceptable for checkout and far more resilient than a synchronous chain that fails if any single downstream service is slow or down.",
            explanation: "Synchronously place + persist + emit, ack the user; run payment/inventory/email async off the event with at-least-once + idempotency + outbox; downstream outages just delay processing, not the order.",
          },
        ],
      },
    },
    {
      id: "c7",
      title: "Microservices & API Design",
      summary: "When (and when not) to decompose, the fallacies every remote call must respect, and keeping data consistent across services with sagas.",
      prerequisites: ["c6"],
      masteryThreshold: 0.85,
      references: [
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 4 (Encoding and Evolution / schema compatibility)",
        "Deutsch & Gosling — The Fallacies of Distributed Computing",
        "Garcia-Molina & Salem — Sagas (ACM SIGMOD, 1987)",
      ],
      lessons: [
        {
          id: "c7l1",
          title: "Monolith vs Microservices",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "One deployable, or many",
              body: `A **monolith** is a single deployable application — simple to build, test, and run locally, with in-process calls and easy transactions, but deployment and scaling are coupled (you ship and scale the whole thing). **Microservices** split the system into independently deployable services around business capabilities — independent scaling, deployment, and team ownership, at the price of distributed-systems complexity (network failures, cross-service consistency, operational overhead).`,
            },
            {
              type: "text",
              heading: "Boundaries: cohesion and coupling",
              body: `Good service boundaries follow **bounded contexts** — each service owns a coherent slice of the domain (high internal **cohesion**) and depends weakly on others (loose **coupling**), so changes stay local. Drawing the lines wrong yields a "distributed monolith": services that must deploy together and chat constantly — all the cost of distribution with none of the independence.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Don't start with microservices.** Premature decomposition adds network failures, data-consistency problems, and ops burden before you even understand the domain's natural seams. Most successful systems begin as a well-structured monolith and extract services once boundaries and scaling needs are clear.`,
            },
          ],
          reviewItems: [
            { id: "c7l1-i1", front: "Monolith vs microservices — core trade-off?", back: "Monolith: simple, in-process, but coupled deploy/scale. Microservices: independent deploy/scale/teams, but distributed-systems complexity." },
            { id: "c7l1-i2", front: "What makes a good service boundary?", back: "A bounded context: high internal cohesion, loose coupling to others, so changes stay local." },
            { id: "c7l1-i3", front: "What is a 'distributed monolith'?", back: "Services that must deploy together and constantly call each other — all the cost of distribution, none of the independence." },
            { id: "c7l1-i4", front: "Why not start with microservices?", back: "Premature decomposition adds failure/consistency/ops cost before domain boundaries are understood; start with a structured monolith." },
          ],
        },
        {
          id: "c7l2",
          title: "The Fallacies & Communication",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "The fallacies of distributed computing",
              body: `Every cross-service call crosses a network, and the classic **fallacies** warn against assuming otherwise: the network is reliable; latency is zero; bandwidth is infinite; the network is secure; topology doesn't change; there is one administrator; transport cost is zero; the network is homogeneous. Each false assumption becomes an outage. In microservices, an in-process method call becomes a remote call that can be slow, fail, or partially succeed.`,
            },
            {
              type: "text",
              heading: "Sync, async, and the gateway",
              body: `Services communicate **synchronously** (REST/gRPC request-response — simple, but couples availability and adds latency per hop) or **asynchronously** (events — decoupled, resilient, eventually consistent). An **API gateway** fronts the services (routing, auth, rate limiting, aggregation); **service discovery** lets services find each other as instances come and go. Contracts must evolve **backward-compatibly** (DDIA ch. 4) so services can deploy independently.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Prefer async between services for resilience.** Synchronous call chains multiply failure (the availability math from Unit 2) and propagate latency; events decouple services so one being slow or down doesn't cascade. Use sync where you genuinely need an immediate answer; use events to decouple everything else.`,
            },
          ],
          reviewItems: [
            { id: "c7l2-i1", front: "Name three fallacies of distributed computing.", back: "The network is reliable; latency is zero; bandwidth is infinite (also: secure, stable topology, one admin, zero transport cost, homogeneous)." },
            { id: "c7l2-i2", front: "Sync vs async inter-service communication?", back: "Sync (REST/gRPC): simple, immediate, but couples availability + adds latency. Async (events): decoupled, resilient, eventually consistent." },
            { id: "c7l2-i3", front: "Role of an API gateway?", back: "A front door for services — routing, auth, rate limiting, request aggregation." },
            { id: "c7l2-i4", front: "Why must service contracts be backward-compatible?", back: "So services can deploy independently without breaking callers (schema/encoding evolution, DDIA ch. 4)." },
          ],
        },
        {
          id: "c7l3",
          title: "Distributed Data: Sagas",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "No shared database, no global transaction",
              body: `Microservices each **own their data** — sharing a database recouples them and defeats independence. But that means a business transaction spanning services (place order → charge payment → reserve inventory) cannot use a single ACID transaction across separate databases. You need a way to keep multiple services' data consistent without a distributed lock.`,
            },
            {
              type: "text",
              heading: "The saga pattern",
              body: `A **saga** is a sequence of local transactions, one per service, where each step publishes an event that triggers the next — and each has a **compensating action** to semantically undo it if a later step fails (refund the payment, release the inventory). Two styles: **choreography** (services react to each other's events, decentralized) and **orchestration** (a central coordinator drives the steps). The result is *eventual* consistency across services, with explicit rollback.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Compensation, not rollback.** A saga can't roll back like a database — earlier steps already committed. It *compensates* with a new action that semantically reverses the effect (a refund, not an un-charge). Designing correct, idempotent compensations is the hard part; some effects (a sent email) can only be mitigated, not undone.`,
            },
          ],
          reviewItems: [
            { id: "c7l3-i1", front: "Why can't a cross-service transaction use one ACID transaction?", back: "Each microservice owns its own database; there's no shared DB to wrap them in a single ACID transaction." },
            { id: "c7l3-i2", front: "What is a saga?", back: "A sequence of local transactions (one per service), each with a compensating action to semantically undo it if a later step fails." },
            { id: "c7l3-i3", front: "Choreography vs orchestration sagas?", back: "Choreography: services react to each other's events (decentralized). Orchestration: a central coordinator drives the steps." },
            { id: "c7l3-i4", front: "Compensation vs rollback?", back: "Earlier steps already committed, so a saga compensates with a reversing action (a refund), not a database rollback." },
          ],
        },
      ],
      masteryCheck: {
        id: "c7-check",
        questions: [
          { id: "c7q1", type: "mcq", prompt: "A key reason NOT to start a new product with microservices is:", options: ["premature decomposition adds distributed-systems complexity (network failures, data consistency, ops) before you understand the domain boundaries", "microservices cannot scale", "monoliths cannot use a database", "microservices are always slower"], answer: 0, explanation: "Start with a structured monolith; extract services once boundaries are clear." },
          { id: "c7q2", type: "short", prompt: "The fallacies of distributed computing warn that, contrary to assumption, the network is not ____ — every remote call can fail.", accept: ["reliable", "reliable.", "always reliable", "dependable"], explanation: "'The network is reliable' is the first fallacy." },
          { id: "c7q3", type: "mcq", prompt: "A saga handles a transaction spanning multiple services by:", options: ["a sequence of local transactions, each with a compensating action to undo prior steps on failure", "a single global ACID lock across all services", "one shared database transaction", "ignoring failures"], answer: 0, explanation: "Local transactions + compensations give eventual cross-service consistency." },
          { id: "c7q4", type: "mcq", prompt: "Microservices typically each own their data because:", options: ["it preserves loose coupling and independent deployability — a shared database recouples services", "databases are too expensive to share", "it improves SQL performance", "HTTP requires it"], answer: 0, explanation: "Data ownership is what keeps services independently deployable." },
          {
            id: "c7q5",
            type: "open",
            points: 3,
            prompt: "A team wants to split their monolith into microservices. Explain how you'd decide the service boundaries, what you'd extract first, and the new failure modes they must now design for. Reference cohesion/coupling and the fallacies of distributed computing.",
            rubric: [
              "Bases boundaries on bounded contexts / business capabilities with high cohesion and loose coupling (data ownership per service), avoiding a distributed monolith.",
              "Recommends extracting a well-isolated, loosely-coupled piece first (e.g. a context with few dependencies or a distinct scaling need), incrementally — not a big-bang split.",
              "Names the new failure modes introduced by the network: partial failures, latency per hop, cross-service consistency — invoking the fallacies of distributed computing.",
              "Prescribes mitigations (async where possible, timeouts/retries/circuit breakers, idempotency, backward-compatible contracts).",
            ],
            solution:
              "Draw boundaries along bounded contexts — coherent business capabilities (orders, payments, catalog) that each own their data — choosing seams with high internal cohesion and loose coupling so a service can change and deploy without dragging others along; the failure to do this produces a distributed monolith that must deploy in lockstep. Extract incrementally, starting with a piece that is already loosely coupled or has a distinct scaling or team-ownership need (a good first candidate is something with few inbound dependencies and a clear contract), and strangle it out behind an interface rather than splitting everything at once. The hard new reality is that former in-process method calls become remote calls subject to the fallacies of distributed computing: the network is not reliable, latency is not zero, and calls can partially succeed — so they must now design for partial failure (timeouts, retries with backoff, circuit breakers), for cross-service data consistency without a shared transaction (sagas / eventual consistency, idempotent operations), and for independent deployability (backward-compatible, versioned contracts). The cohesion/coupling discipline minimizes how often services must talk; the resilience patterns handle the failures that remain when they do.",
            explanation: "Boundaries = bounded contexts (cohesion/loose coupling, data ownership); extract a loosely-coupled piece first; design for partial failure, latency, and cross-service consistency per the fallacies.",
          },
          {
            id: "c7q6",
            type: "open",
            points: 3,
            prompt: "An order must update inventory (service A) and charge payment (service B), each with its own database. Explain why a single ACID transaction isn't available, and design a saga (with compensations) that keeps the system consistent. Address the dual-write/outbox problem.",
            rubric: [
              "Explains that A and B have separate databases, so there is no shared transactional boundary — a single ACID transaction (or 2PC, with its availability cost) isn't a good option across independent services.",
              "Designs a saga: an ordered sequence of local transactions (e.g. reserve inventory → charge payment) coordinated via events, choreographed or orchestrated.",
              "Specifies compensating actions for failure (if payment fails, release the inventory reservation) and idempotency so retries are safe.",
              "Addresses the dual-write problem: persisting local state and emitting the event atomically via an outbox (and idempotent consumers), so an event is neither lost nor duplicated in effect.",
            ],
            solution:
              "Inventory (A) and payment (B) live in separate databases, so there is no common transactional boundary to wrap them in one ACID transaction; the classic alternative, two-phase commit, couples their availability (a blocked coordinator stalls everyone) and is avoided for exactly that reason. Use a saga instead: a sequence of local transactions linked by events. For example — reserve inventory in A (local transaction, emit InventoryReserved), then charge payment in B (local transaction, emit PaymentCharged), then confirm the order. Each step has a compensating action for when a later step fails: if the payment is declined, run a compensation that releases the inventory reservation in A; if confirmation fails, refund the payment. Make every step and compensation idempotent (keyed on the order id) so redelivered events don't double-reserve, double-charge, or double-release. The dual-write hazard is that each service must update its own database and publish its event atomically — two systems, no shared transaction. Solve it with the outbox pattern: write the event into an outbox table inside the same local DB transaction as the state change, and have a relay publish from the outbox at-least-once; combined with idempotent consumers this guarantees the event's effect happens exactly once and is never lost. The system ends up eventually consistent across the two services, with explicit compensations standing in for the rollback a distributed ACID transaction would have given.",
            explanation: "Separate DBs ⇒ no single ACID transaction; use a saga of local transactions + compensations (release inventory if payment fails), with the outbox + idempotency to make event publish atomic and safe.",
          },
        ],
      },
    },
    {
      id: "c8",
      title: "Resilience & Observability",
      summary: "Design for failure (timeouts, retries, circuit breakers, bulkheads), see the system (metrics/logs/traces), and know the limit FLP imposes.",
      prerequisites: ["c7"],
      masteryThreshold: 0.85,
      references: [
        "Nygard — Release It! (circuit breakers, bulkheads, stability patterns)",
        "Google — Site Reliability Engineering: monitoring, alerting on SLOs (free at sre.google/books)",
        "Fischer, Lynch & Paterson — Impossibility of Distributed Consensus with One Faulty Process (JACM 32(2), 1985)",
        "DDIA (Kleppmann, O'Reilly 2017) — ch. 8 (The Trouble with Distributed Systems)",
      ],
      lessons: [
        {
          id: "c8l1",
          title: "Resilience Patterns",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "Design for failure",
              body: `In a distributed system, dependencies *will* fail or hang, so resilience is built in, not bolted on. **Timeouts**: never wait forever on a remote call — a hung dependency must not hang you. **Retries with exponential backoff and jitter**: retry transient failures, but back off (increasing delays) and randomize (jitter) so clients don't retry in synchronized waves that hammer a recovering service (a retry storm).`,
            },
            {
              type: "text",
              heading: "Circuit breakers and bulkheads",
              body: `A **circuit breaker** monitors a dependency; after repeated failures it "opens" and fails fast (returning an error or fallback immediately) instead of piling up doomed calls, then periodically tests for recovery before closing again — preventing cascading failure and resource exhaustion. **Bulkheads** isolate resources (separate connection pools/thread pools per dependency) so one struggling dependency can't consume all resources and sink the whole service. **Rate limiting / load shedding** caps intake to protect the system under overload.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Retries need idempotency.** Safely retrying a call assumes doing it twice is harmless — which only holds if the operation is idempotent (Unit 6). A retry on a non-idempotent 'charge card' can double-charge. Pair every retry policy with idempotency keys.`,
            },
          ],
          reviewItems: [
            { id: "c8l1-i1", front: "Why timeouts on every remote call?", back: "A hung dependency must not hang you — never wait forever; free the resource and fail/fallback." },
            { id: "c8l1-i2", front: "Why exponential backoff WITH jitter?", back: "Backoff spaces out retries; jitter randomizes them so clients don't retry in synchronized waves (a retry storm) that hammer a recovering service." },
            { id: "c8l1-i3", front: "What does a circuit breaker do?", back: "After repeated failures it opens and fails fast (no piling up doomed calls), periodically testing for recovery — preventing cascading failure." },
            { id: "c8l1-i4", front: "What do bulkheads provide?", back: "Resource isolation (separate pools per dependency) so one failing dependency can't exhaust everything and sink the whole service." },
          ],
        },
        {
          id: "c8l2",
          title: "Observability",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "The three pillars",
              body: `You can't operate what you can't see. **Metrics** are aggregated numeric time-series (request rate, error rate, p99 latency) — cheap, ideal for dashboards and alerts. **Logs** are discrete, detailed event records — rich context for debugging a specific failure. **Traces** follow a single request across services, exposing where time and errors accrue in a distributed call graph. Together they answer "is it broken, where, and why?"`,
            },
            {
              type: "text",
              heading: "Monitoring vs observability; alert on SLOs",
              body: `**Monitoring** watches known failure modes (known unknowns); **observability** is the ability to ask new questions about unanticipated behavior (unknown unknowns) from your telemetry. Alert on **symptoms that burn the SLO/error budget** (user-facing impact), not on every internal blip — alert fatigue from noisy, cause-based alerts is itself an outage risk.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Distributed tracing earns its keep with fan-out.** When one request touches many services, a metric tells you the system is slow but not *which hop*; a trace shows the whole path with per-span timing, so you find the culprit. It's the direct tool for the tail-latency problem from Unit 1.`,
            },
          ],
          reviewItems: [
            { id: "c8l2-i1", front: "The three pillars of observability, and each one's use?", back: "Metrics (aggregated time-series → dashboards/alerts), logs (detailed discrete events → debugging), traces (a request's path across services → latency/causality)." },
            { id: "c8l2-i2", front: "Monitoring vs observability?", back: "Monitoring watches known failure modes (known unknowns); observability lets you ask new questions about unanticipated behavior (unknown unknowns)." },
            { id: "c8l2-i3", front: "What should you alert on?", back: "User-facing symptoms that burn the SLO/error budget — not every internal blip (avoid alert fatigue)." },
            { id: "c8l2-i4", front: "Why is tracing key for fan-out latency?", back: "It shows the full request path with per-span timing, pinpointing which hop is slow — the tool for tail latency." },
          ],
        },
        {
          id: "c8l3",
          title: "The Limits of Agreement: FLP",
          estMinutes: 16,
          content: [
            {
              type: "text",
              heading: "You can't always agree",
              body: `Distributed agreement (leader election, atomic commit, consensus) is fundamentally hard, and the **FLP impossibility** (Fischer, Lynch & Paterson, 1985) says why: in a fully **asynchronous** system where even one process may **crash**, no **deterministic** algorithm can **guarantee** it reaches consensus (agreement that always terminates). The core reason: in an asynchronous network you cannot distinguish a crashed process from a merely slow one — no timeout is provably correct — so there is always an execution that defers the decision forever.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**FLP does NOT say "consensus is impossible."** It is a precise statement about *deterministic*, *guaranteed-terminating* consensus under *full asynchrony* with a *crash*. Real systems reach consensus all the time — they escape FLP by assuming **partial synchrony** (timeouts; Paxos/Raft stay *safe* always and become *live* when the network behaves), by using **randomization**, or by accepting that liveness can stall during bad periods. FLP explains *why timeouts are everywhere* and why "detecting failure" is fundamentally a guess.`,
            },
            {
              type: "text",
              heading: "Coping in practice",
              body: `So consensus protocols (Paxos, Raft, Zab) are engineered to never violate **safety** (they never decide inconsistently), and to make **progress** whenever the network is well-behaved enough — sacrificing the guarantee of progress during pathological asynchrony rather than risking a wrong decision. **Chaos engineering** completes the picture: deliberately inject failures (kill nodes, add latency, partition the network) to verify the system degrades as designed rather than discovering it in a real outage.`,
            },
          ],
          reviewItems: [
            { id: "c8l3-i1", front: "What does FLP impossibility state?", back: "In a fully asynchronous system where one process may crash, no deterministic algorithm can guarantee consensus that always terminates." },
            { id: "c8l3-i2", front: "The intuition behind FLP?", back: "In an async network you can't distinguish a crashed process from a slow one (no sound timeout), so a decision can be deferred forever." },
            { id: "c8l3-i3", front: "The common FLP misstatement to avoid?", back: "'Consensus is impossible in distributed systems' — FLP is about deterministic, guaranteed-terminating consensus under full asynchrony with a crash." },
            { id: "c8l3-i4", front: "How do real systems escape FLP?", back: "Partial synchrony (timeouts — Paxos/Raft: always safe, live when the network behaves), randomization, or accepting liveness can stall." },
          ],
        },
      ],
      masteryCheck: {
        id: "c8-check",
        questions: [
          { id: "c8q1", type: "mcq", prompt: "A circuit breaker improves resilience by:", options: ["detecting a failing dependency and 'opening' to fail fast (stop calling it) until it recovers, preventing cascading failure", "retrying the call forever", "caching all responses", "encrypting traffic"], answer: 0, explanation: "Fail fast instead of piling up doomed calls." },
          { id: "c8q2", type: "short", prompt: "Retries should use exponential backoff with ____ (randomized delay) to stop many clients retrying in synchronized waves (a retry storm).", accept: ["jitter", "jitter.", "random jitter", "randomization"], explanation: "Jitter de-synchronizes retries." },
          { id: "c8q3", type: "mcq", prompt: "The three pillars of observability are:", options: ["metrics, logs, and traces", "CPU, RAM, and disk", "uptime, latency, and cost", "alerts, dashboards, and pages"], answer: 0, explanation: "Metrics (aggregate), logs (detailed events), traces (request path)." },
          { id: "c8q4", type: "numeric", prompt: "Exponential backoff waits base × 2^(attempt−1). With base = 100 ms, how long is the wait before the 5th attempt (attempt = 5), in ms?", answer: 1600, tolerance: 0, explanation: "100 × 2^4 = 100 × 16 = 1600 ms." },
          {
            id: "c8q5",
            type: "open",
            points: 3,
            prompt: "State the FLP impossibility result precisely (what system model, what failure assumption, what it rules out). Explain the core intuition for WHY consensus is impossible there, and how real systems cope. Avoid the common misstatement that 'consensus is impossible in distributed systems.'",
            rubric: [
              "States the model and scope correctly: a fully ASYNCHRONOUS system, a DETERMINISTIC algorithm, with even ONE crash failure possible — no algorithm can GUARANTEE consensus that always terminates (with agreement + validity).",
              "Gives the intuition: asynchrony makes a crashed process indistinguishable from a slow one, so no sound failure detector/timeout exists, and an adversarial schedule can defer the decision indefinitely.",
              "Explicitly rejects the misstatement — FLP does NOT say consensus is impossible in practice; it constrains deterministic, guaranteed-terminating consensus under full asynchrony.",
              "Describes coping mechanisms: partial synchrony / timeouts (Paxos, Raft — always safe, live when the network behaves), randomization, or accepting liveness can stall.",
            ],
            solution:
              "FLP (Fischer, Lynch & Paterson, 1985) states: in a fully asynchronous distributed system — no bound on message delay or relative processing speed — no deterministic algorithm can guarantee it will solve consensus (reach agreement on a value, with validity, and always terminate) if even a single process may crash. The intuition is indistinguishability: in a truly asynchronous system a process that has crashed looks exactly like one that is merely very slow, because there is no upper bound on how long a correct message can take — so no timeout is provably sound. An adversarial scheduler can therefore always keep the system in a state where the decision is not yet forced (a 'bivalent' configuration), delivering messages in an order that perpetually postpones commitment; termination cannot be guaranteed. Crucially, FLP does not say consensus is impossible in real systems — it is a precise impossibility for deterministic, guaranteed-terminating consensus under full asynchrony with a crash. Real systems reach consensus routinely by stepping outside that model: they assume partial synchrony, using timeouts so that protocols like Paxos and Raft remain always safe (never decide inconsistently) and become live once the network is well-behaved; or they use randomization (e.g. Ben-Or) to break the adversary's grip with positive probability; or they simply accept that progress can stall during pathological network conditions. FLP is why timeouts are everywhere and why failure detection is fundamentally a heuristic guess, not a certainty.",
            explanation: "Async + deterministic + one crash ⇒ no guaranteed-terminating consensus (a crash looks like slowness, so decisions can be deferred forever); real systems use timeouts/partial synchrony or randomization, keeping safety and giving up guaranteed liveness.",
          },
          {
            id: "c8q6",
            type: "open",
            points: 3,
            prompt: "Design the resilience strategy for a service that depends on a flaky third-party payment API. Address timeouts, retries (with backoff/jitter), circuit breaking, idempotency, and graceful degradation. Justify each choice.",
            rubric: [
              "Timeouts: bounds the wait on the third-party call so a hang doesn't tie up the service's resources.",
              "Retries with backoff + jitter, scoped to transient/idempotent failures, to avoid retry storms against a recovering API.",
              "Circuit breaker: trips after repeated failures to fail fast / use a fallback, preventing cascading failure and resource exhaustion while the API is down.",
              "Idempotency and graceful degradation: idempotency keys so retries don't double-charge; a degraded mode (queue the charge, accept-and-settle later, or clear user messaging) rather than a hard failure.",
            ],
            solution:
              "Wrap every call to the payment API in a tight timeout so a hang on their side frees the request and its connection/thread rather than tying up the service (a few seconds, tuned to the API's normal latency). Retry only transient failures (timeouts, 5xx) with exponential backoff and jitter, capped at a small number of attempts, so a brief blip is absorbed but a recovering API isn't hammered by synchronized retry storms; never blindly retry a definitive decline. Put a circuit breaker in front: after a threshold of failures it opens and the service fails fast — returning a clear error or a fallback — instead of queuing thousands of doomed calls and exhausting threads, then half-opens to test recovery. Because retries and breaker fallbacks can cause a charge to be attempted more than once, send an idempotency key with each charge (most payment APIs support one) so duplicates are collapsed and the customer is never double-charged. Finally, degrade gracefully rather than failing the whole checkout: depending on the business, that might mean accepting the order and capturing payment asynchronously once the API recovers (with the outbox/saga machinery), placing the charge on a durable queue for retry, or at minimum showing the user an honest 'payment is temporarily unavailable, try again' instead of a crash. Each layer addresses a distinct failure: timeouts bound waiting, backoff/jitter prevent storms, the breaker prevents cascading exhaustion, idempotency prevents duplicate side effects, and degradation preserves as much service as possible while the dependency is down.",
            explanation: "Timeouts bound the hang; capped backoff+jitter retries for transient errors; a circuit breaker to fail fast; idempotency keys to avoid double-charges; and a degraded/async-capture path instead of a hard failure.",
          },
        ],
      },
    },
    {
      id: "c9",
      title: "Security, Cost & the Well-Architected Trade-offs",
      summary: "Defense in depth and least privilege, the cost of the nines, and balancing the Well-Architected pillars — because there's no single best design.",
      prerequisites: ["c8"],
      masteryThreshold: 0.85,
      references: [
        "AWS Well-Architected Framework (six pillars); Azure Well-Architected Framework; Google Cloud Architecture Framework",
        "Google — Site Reliability Engineering / FinOps practices (cost as a design constraint)",
        "Saltzer & Schroeder — The Protection of Information in Computer Systems (1975) — least privilege, defense in depth",
      ],
      lessons: [
        {
          id: "c9l1",
          title: "Security: Defense in Depth & Least Privilege",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Layers and minimal access",
              body: `**Defense in depth** means multiple independent layers of control (network, identity, application, data) so no single failure is a breach — if one layer is bypassed, others still hold. **Least privilege** means every user and service gets the *minimum* access needed and no more, so a compromised credential has a small blast radius. In the cloud this is concrete: per-service IAM roles with scoped permissions, never shared root credentials.`,
            },
            {
              type: "text",
              heading: "Identity, encryption, zero trust",
              body: `Distinguish **authentication** (who are you — tokens, OAuth/OIDC, MFA) from **authorization** (what may you do — roles, policies). Encrypt data both **at rest** (stored) and **in transit** (TLS on the wire). The modern posture is **zero trust**: don't trust a request just because it's "inside the network" — authenticate and authorize every call, since the network perimeter is no longer a reliable boundary.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**The network is not a security boundary.** "It's behind the firewall" is one of the fallacies — internal services get compromised, credentials leak. Assume breach: least privilege, per-service identity, encryption everywhere, and audit logging so a single foothold doesn't become full access.`,
            },
          ],
          reviewItems: [
            { id: "c9l1-i1", front: "Defense in depth?", back: "Multiple independent layers of control (network, identity, app, data) so no single failure is a breach." },
            { id: "c9l1-i2", front: "Least privilege?", back: "Grant each user/service the minimum access needed — so a compromised credential has a small blast radius." },
            { id: "c9l1-i3", front: "Authentication vs authorization?", back: "Authentication = who you are (tokens/OAuth/MFA); authorization = what you may do (roles/policies)." },
            { id: "c9l1-i4", front: "What is zero trust?", back: "Don't trust a request because it's 'inside the network' — authenticate and authorize every call; the perimeter isn't a boundary." },
          ],
        },
        {
          id: "c9l2",
          title: "Cost: The Price of the Nines",
          estMinutes: 14,
          content: [
            {
              type: "text",
              heading: "Reliability and performance cost money",
              body: `Every nine of availability and every millisecond of latency has a price — more redundancy (replicas, multi-region), more headroom, more operational effort. Past a point the marginal cost of another nine vastly exceeds its value for most services. Cost is a first-class architectural constraint, not an afterthought: the "best" design that's unaffordable isn't the best design.`,
            },
            {
              type: "text",
              heading: "Optimization levers",
              body: `**Right-sizing** (don't over-provision idle capacity), **elasticity/autoscaling** (pay for what you use, scale with demand), **managed vs self-run** (trade money for operational burden), **storage tiering** (hot vs cold/archive), and minimizing **cross-zone/region data transfer** (a sneaky large cost). **FinOps** brings engineering and finance together to make cost visible and owned, so teams design and operate with the bill in mind.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**Match the target to the requirement.** A batch analytics job doesn't need 99.99% or single-digit-millisecond latency; a payments path might. Spending five-nines money on a service that needs three is waste — and under-spending on the one that needs five is an outage. Right-size reliability to the actual need.`,
            },
          ],
          reviewItems: [
            { id: "c9l2-i1", front: "Why does each extra nine cost disproportionately?", back: "More redundancy, headroom, and ops effort; past a point the marginal cost of a nine far exceeds its value for most services." },
            { id: "c9l2-i2", front: "Name three cost-optimization levers.", back: "Right-sizing, autoscaling/elasticity, managed-vs-self-run, storage tiering, minimizing cross-zone/region data transfer (any three)." },
            { id: "c9l2-i3", front: "What is FinOps?", back: "Making cloud cost visible and owned by engineering + finance together, so cost is a design and operations constraint." },
            { id: "c9l2-i4", front: "Why right-size reliability to the requirement?", back: "Over-spending nines on a service that doesn't need them is waste; under-spending on one that does is an outage." },
          ],
        },
        {
          id: "c9l3",
          title: "The Well-Architected Pillars",
          estMinutes: 15,
          content: [
            {
              type: "text",
              heading: "Five (or six) pillars in tension",
              body: `Cloud "Well-Architected" frameworks crystallize good design into pillars: **Reliability, Performance Efficiency, Security, Cost Optimization, and Operational Excellence** (AWS adds **Sustainability** as a sixth). They're a checklist and a vocabulary for reviewing a design — but the deeper point is that they are in **tension**: you cannot maximize all at once.`,
            },
            {
              type: "text",
              heading: "Architecture is choosing the trade-off",
              body: `More reliability (replicas, multi-region) costs money and adds latency/complexity; tighter security can add latency and operational friction; squeezing cost can hurt reliability or performance. There is **no single best architecture** — only the best fit for *this* system's requirements. The job is to make the trade-offs deliberately and explicitly, justified by what the service actually needs, and to revisit them as needs change.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**The whole course, in one frame.** Scalability, availability, consistency, data, caching, async, microservices, and resilience are all levers on these pillars — and pulling one moves the others. Good architecture isn't maximizing a checklist; it's balancing the pillars against real requirements, and being able to defend why.`,
            },
          ],
          reviewItems: [
            { id: "c9l3-i1", front: "The five core Well-Architected pillars?", back: "Reliability, Performance Efficiency, Security, Cost Optimization, Operational Excellence (AWS adds Sustainability)." },
            { id: "c9l3-i2", front: "Why are the pillars in tension?", back: "Improving one (e.g. reliability or security) typically costs another (cost, latency, complexity) — you can't maximize all." },
            { id: "c9l3-i3", front: "Is there a single best architecture?", back: "No — only the best fit for a system's specific requirements; architecture is choosing trade-offs deliberately." },
            { id: "c9l3-i4", front: "What is the architect's actual job?", back: "Make the pillar trade-offs explicitly, justified by real requirements, and revisit them as needs change." },
          ],
        },
      ],
      masteryCheck: {
        id: "c9-check",
        questions: [
          { id: "c9q1", type: "mcq", prompt: "The principle of least privilege means:", options: ["granting each user/service the minimum access needed, limiting blast radius if compromised", "giving administrators full access to everything", "encrypting all data", "using one shared credential for simplicity"], answer: 0, explanation: "Minimal access shrinks the damage from a compromised credential." },
          { id: "c9q2", type: "short", prompt: "Data should be encrypted both at ____ (in storage) and in transit (over the network).", accept: ["rest", "rest.", "rest (storage)"], explanation: "Encryption at rest and in transit." },
          { id: "c9q3", type: "mcq", prompt: "The five AWS Well-Architected pillars are reliability, performance efficiency, security, cost optimization, and:", options: ["operational excellence", "marketing reach", "vendor lock-in", "minimal latency"], answer: 0, explanation: "Operational excellence (AWS adds sustainability as a sixth)." },
          { id: "c9q4", type: "numeric", prompt: "Cost trade-off: one server costs $200/month. For higher availability you run 3 redundant servers plus a $100/month load balancer. What is the new monthly cost, in dollars? (3 × 200 + 100)", answer: 700, tolerance: 0, explanation: "$600 + $100 = $700/month." },
          {
            id: "c9q5",
            type: "open",
            points: 3,
            prompt: "Explain the 'cost of the nines': why moving from 99.9% to 99.99% availability often costs far more than the reliability gain is worth for many services. How would you decide the right availability target? Reference SLOs, redundancy, and diminishing returns.",
            rubric: [
              "Explains why higher availability costs disproportionately: more redundancy (replicas, multi-region), more headroom, more operational effort and complexity for each additional nine.",
              "Frames diminishing returns: the marginal downtime saved by another nine shrinks while its cost grows.",
              "Bases the target on requirements via SLOs: what downtime the users/business actually tolerate, not a vanity figure.",
              "Concludes with a method: set the SLO to match the requirement and spend just enough redundancy/effort to hit it, not more.",
            ],
            solution:
              "Each additional nine costs disproportionately because availability is bought with redundancy and operational rigor: going from 99.9% to 99.99% typically means more replicas, multi-zone or multi-region deployment, hotter failover, more headroom, and far more engineering and on-call effort to eliminate the rarer failure modes — while the actual downtime saved shrinks (from ~8.8 hours/year to ~53 minutes/year). That's textbook diminishing returns: the marginal benefit falls as the marginal cost climbs steeply, so for many services the extra nine isn't worth it. The way to decide the target is to start from requirements, expressed as an SLO: how much downtime can the users and the business actually tolerate, and what does an outage cost? A batch reporting job is fine at 99.9% (or less); a payments path may justify 99.99% or more. Set the SLO to match that real tolerance, then provision just enough redundancy and operational investment to meet it — and no more. Spending five-nines money on a three-nines requirement is waste; the discipline is matching reliability spend to the requirement rather than chasing nines for their own sake (and the error budget then governs how you spend the gap between your SLO and 100%).",
            explanation: "Each nine needs more redundancy/ops for less marginal downtime saved (diminishing returns); set the SLO to the real business tolerance and spend just enough to hit it.",
          },
          {
            id: "c9q6",
            type: "open",
            points: 3,
            prompt: "You're reviewing a system design against the Well-Architected pillars (reliability, performance, security, cost, operational excellence). Explain why these pillars are in tension (you can't maximize all), and walk through a concrete trade-off where improving one pillar worsened another, and how you'd decide.",
            rubric: [
              "Explains the tension: the pillars compete — investing in one (reliability, security, performance) typically costs another (cost, latency, complexity).",
              "Gives a concrete, correct example of one pillar worsening another (e.g. multi-region redundancy improves reliability but raises cost and write latency; or encryption/strong auth improves security but adds latency/ops friction).",
              "Shows how to decide: tie the choice to the system's actual requirements/SLOs rather than maximizing a pillar in the abstract.",
              "Concludes that there's no single best design — only the best fit, chosen deliberately and revisited as needs change.",
            ],
            solution:
              "The Well-Architected pillars are in tension because they draw on the same finite budget of money, latency, and complexity: pushing one up usually pushes another down. A concrete example: to improve Reliability you deploy the database across three regions with synchronous replication so the service survives a region loss. That genuinely raises availability — but it worsens Cost (3× the infrastructure plus cross-region data-transfer charges), worsens Performance (every write now pays a cross-region round-trip, hurting write latency), and worsens Operational Excellence (a more complex topology to run and reason about). Another: enforcing strong Security (mTLS everywhere, per-request authz, encryption) improves the security posture but adds latency and operational friction. There is no setting that maximizes all pillars at once, so the decision must come from the system's actual requirements: if this is a payments ledger where a region outage is unacceptable and writes are infrequent, the multi-region cost and latency are justified; if it's a high-throughput analytics store that can tolerate a brief regional failover, single-region with async backups is the better balance. I'd make the call by stating the SLOs and constraints (required availability, latency budget, security/compliance needs, cost ceiling), choosing the design that meets them with the least sacrifice elsewhere, documenting the trade-off explicitly, and revisiting it when requirements change — because the 'best' architecture is only ever the best fit for this system, not a maxed-out checklist.",
            explanation: "The pillars share a finite budget, so improving one (e.g. multi-region reliability) costs others (cost, write latency, complexity); decide by the system's real SLOs/constraints, pick the least-sacrifice fit, and revisit it.",
          },
        ],
      },
    },
  ],
};
