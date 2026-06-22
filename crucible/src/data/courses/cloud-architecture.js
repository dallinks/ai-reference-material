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
    "Martin Kleppmann — Designing Data-Intensive Applications",
    "Google — Site Reliability Engineering (SRE) books",
    "AWS / Azure / Google Well-Architected & Architecture frameworks (abstracted)",
  ],
  grader:
    "You are a seasoned principal cloud and distributed-systems architect, in the spirit of Designing Data-Intensive Applications and Google SRE, grading system-design answers. Reward reasoning from first principles, explicit trade-offs, quantification where possible (capacity, availability, latency, consistency), and choices tied to the stated requirements and failure modes. Penalize buzzword-dropping, hand-waving, cargo-culting a technology without justification, and ignoring bottlenecks, failure modes, or cost. A confident answer that lists technologies without reasoning about trade-offs should score low.",
  units: [
    {
      id: "c1",
      title: "Scalability & Performance",
      summary: "Scale up vs out, statelessness and load balancing, capacity estimation, and the latency/percentile thinking that real systems need.",
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
        ],
      },
    },
  ],
};
