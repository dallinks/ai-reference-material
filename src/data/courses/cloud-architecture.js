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
          "id": "c1l1",
          "title": "Scale Up or Scale Out",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Two ways to add capacity",
              "body": "When a system runs out of headroom there are exactly two moves. **Scale up (vertical):** replace the machine with a bigger one — more CPU, RAM, faster disk. Simple, but bounded by the largest machine money can buy, and it leaves a single point of failure. **Scale out (horizontal):** add more machines and spread load across them. Effectively unbounded and naturally redundant, but it forces you to confront distribution — load balancing, shared state, consistency, and partial failure (the rest of this course). Real systems scale up the easy parts and scale out the parts that must grow without limit."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Vertical vs. horizontal scaling",
              "statement": "**Vertical scaling (scale up)** increases the capacity of a *single* node (bigger CPU/RAM/IO). **Horizontal scaling (scale out)** increases capacity by adding *more* nodes and distributing work across them. Horizontal scaling is generally preferred for large systems because it has no hard ceiling, provides redundancy (no single machine is fatal), and uses cheap commodity hardware — at the cost of distributed-systems complexity."
            },
            {
              "type": "text",
              "heading": "Statelessness is what makes scale-out possible",
              "body": "You can only freely spread requests across N interchangeable servers if any server can handle any request — i.e. the servers are **stateless**: they keep no per-client state between requests, pushing session/data state into a shared tier (a database, cache, or object store). A stateless tier scales horizontally by simply adding nodes behind a load balancer; a stateful one forces you to route a client to \"its\" server (sticky sessions) or replicate state, both of which complicate scaling and failure. The discipline \"make the compute tier stateless\" is the precondition for everything else in this unit."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Amdahl's Law",
              "statement": "If a fraction **s** of a task is inherently **serial** (cannot be parallelized) and the remaining **1 − s** is perfectly parallelizable across **p** processors, the overall speedup is\n\n  S(p) = 1 / ( s + (1 − s)/p ),\n\nwhich is bounded above by **1/s** as p → ∞. The serial fraction sets a hard ceiling on speedup no matter how many processors you add."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Derivation of Amdahl's Law",
              "statement": "With serial fraction s and parallel fraction 1 − s run on p processors, S(p) = 1/(s + (1−s)/p), and lim_{p→∞} S(p) = 1/s.",
              "proof": "Normalize the single-processor execution time to 1. By assumption the work splits into a serial part taking time s (unaffected by adding processors) and a parallel part taking time 1 − s on one processor. Spreading the parallel part perfectly across p processors reduces its time to (1 − s)/p, while the serial part still takes s. So the p-processor time is\n\n  T(p) = s + (1 − s)/p,\n\nand the speedup is the ratio of one-processor time to p-processor time:\n\n  S(p) = T(1)/T(p) = 1 / ( s + (1 − s)/p ).\n\nAs p → ∞, the term (1 − s)/p → 0, so S(p) → 1/s. ∎\n\nThe consequence is sobering: if just 5% of a task is serial (s = 0.05), the maximum possible speedup is 1/0.05 = 20× — even with infinitely many processors. Parallelizing hardware cannot overcome a serial bottleneck; you must shrink s itself."
            },
            {
              "type": "example",
              "heading": "Amdahl in practice",
              "body": "A batch job is 90% parallelizable (s = 0.10). On p = 10 machines: S(10) = 1/(0.10 + 0.90/10) = 1/(0.10 + 0.09) = 1/0.19 ≈ **5.3×** — not 10×, because the serial 10% already costs as much as the entire parallel part now does. On p = 100 machines: S(100) = 1/(0.10 + 0.009) ≈ **9.2×**. The hard ceiling is 1/0.10 = **10×**: ten times the hardware (10→100) bought only 5.3→9.2. Past a point, throwing machines at a serial bottleneck is nearly free of benefit."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The serial fraction, not the processor count, sets your ceiling.** Before scaling out, find and shrink the serial bottleneck (a global lock, a single coordinator, an unshardable step). Adding nodes around an unmovable serial section yields diminishing returns that Amdahl quantifies exactly — and the Universal Scalability Law (Lesson 3) shows coordination can make it *worse* than this."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A task is 80% parallelizable. Compute the speedup on 4 processors and the theoretical maximum speedup.",
                  "solution": "Serial fraction s = 0.20. On p = 4: S(4) = 1/(0.20 + 0.80/4) = 1/(0.20 + 0.20) = 1/0.40 = 2.5×. Maximum (p → ∞): 1/s = 1/0.20 = 5×. So even infinite processors only get 5×, and 4 processors already reach half of that."
                },
                {
                  "prompt": "Two optimizations are proposed: (A) double the number of processors (p: 10→20) on a job with s = 0.10, or (B) halve the serial fraction (s: 0.10→0.05) at p = 10. Which gives the bigger speedup, and what's the lesson?",
                  "solution": "Baseline S(10, 0.10) = 1/(0.10+0.09) ≈ 5.3×. (A) p=20: S = 1/(0.10 + 0.90/20) = 1/(0.10+0.045) = 1/0.145 ≈ 6.9×. (B) s=0.05 at p=10: S = 1/(0.05 + 0.95/10) = 1/(0.05+0.095) = 1/0.145 ≈ 6.9×. Here they tie numerically, but (B) also *raises the ceiling* from 10× to 20× (1/s), whereas (A) leaves the ceiling at 10×. Lesson: attacking the serial fraction lifts the asymptote; adding hardware only chases a fixed ceiling. Reduce s."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c1l1-i1",
              "front": "Vertical vs horizontal scaling?",
              "back": "Vertical (scale up): a bigger single node — bounded, single point of failure. Horizontal (scale out): more nodes with load spread across them — unbounded, redundant, but distributed-systems complexity."
            },
            {
              "id": "c1l1-i2",
              "front": "Why is statelessness the precondition for scale-out?",
              "back": "If servers keep no per-client state, any server can handle any request, so you can freely add nodes behind a load balancer; state lives in a shared tier instead of pinning clients to a server."
            },
            {
              "id": "c1l1-i3",
              "front": "Amdahl's Law formula and its ceiling?",
              "back": "S(p) = 1/(s + (1−s)/p), where s is the serial fraction; max speedup = 1/s as p→∞. The serial fraction caps speedup regardless of processor count."
            },
            {
              "id": "c1l1-i4",
              "front": "Amdahl derivation in one line?",
              "back": "Normalize T(1)=1; parallel part shrinks to (1−s)/p while serial s is fixed, so T(p)=s+(1−s)/p and S=1/T(p)→1/s."
            },
            {
              "id": "c1l1-i5",
              "front": "Practical lesson of Amdahl?",
              "back": "Shrink the serial fraction s (it raises the 1/s ceiling); adding processors only chases a fixed ceiling with diminishing returns."
            }
          ]
        },
        {
          "id": "c1l2",
          "title": "Load Balancing & Capacity Estimation",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Load balancer",
              "statement": "A **load balancer (LB)** distributes incoming requests across a pool of backend servers, presenting one virtual endpoint to clients. **Layer-4** LBs route by IP/port (fast, protocol-agnostic); **Layer-7** LBs route by application data (URL, headers, cookies — enabling content-based routing and sticky sessions). The LB also performs **health checks**, removing unhealthy backends from rotation. Because all traffic flows through it, the LB itself must be made redundant (Unit 2) or it becomes the single point of failure horizontal scaling was meant to avoid."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 260,
              "caption": "A load balancer fans requests across a pool of stateless servers; capacity scales by adding servers. The LB is on the critical path for every request, so it must itself be redundant (Unit 2) — otherwise it is a single point of failure.",
              "nodes": [
                {
                  "id": "c",
                  "label": "client",
                  "x": 6,
                  "y": 50
                },
                {
                  "id": "lb",
                  "label": "LB",
                  "x": 34,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "s1",
                  "label": "s₁",
                  "x": 72,
                  "y": 16,
                  "tone": "sage"
                },
                {
                  "id": "s2",
                  "label": "s₂",
                  "x": 72,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "s3",
                  "label": "s₃",
                  "x": 72,
                  "y": 84,
                  "tone": "sage"
                }
              ],
              "edges": [
                {
                  "from": "c",
                  "to": "lb",
                  "label": "λ"
                },
                {
                  "from": "lb",
                  "to": "s1",
                  "tone": "sage"
                },
                {
                  "from": "lb",
                  "to": "s2",
                  "tone": "sage"
                },
                {
                  "from": "lb",
                  "to": "s3",
                  "tone": "sage"
                }
              ]
            },
            {
              "type": "decision",
              "heading": "Common load-balancing algorithms",
              "rows": [
                [
                  "Round-robin",
                  "Cycle through servers in order. Simple; assumes roughly equal request cost and server capacity."
                ],
                [
                  "Least-connections",
                  "Send to the server with the fewest active connections. Adapts to uneven request durations."
                ],
                [
                  "Consistent hashing",
                  "Hash a key (e.g. user/session) to a server, minimizing remaps when servers join/leave. Enables cache affinity (Unit 4)."
                ],
                [
                  "Weighted",
                  "Bias toward more-capable servers. Used in heterogeneous fleets or gradual rollouts."
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Capacity from demand (QPS estimation)",
              "statement": "For U daily active users each making r requests per day spread over a day of D seconds, the average request rate is\n\n  QPS_avg = U · r / D.\n\nReal traffic is peaky, so size for peak: QPS_peak = QPS_avg · (peak factor). The number of servers needed is ⌈QPS_peak / (per-server capacity)⌉, with headroom.",
              "proof": "Total daily requests = U · r. Spreading them uniformly over D seconds gives an average rate of (U · r)/D requests per second by definition of a rate. Demand is never uniform (diurnal peaks, spikes), so the *average* understates the load the system must survive; multiplying by an empirical peak-to-average factor (commonly 2–10×) yields the rate to provision for. Dividing peak demand by the throughput one server sustains, and rounding up, gives the fleet size — to which you add headroom for failures and growth. ∎\n\n**Worked:** U = 8.64M DAU, r = 10 requests/user/day, D = 86,400 s/day. QPS_avg = 8,640,000 × 10 / 86,400 = 86,400,000 / 86,400 = **1,000 QPS**. At a 4× peak factor that's 4,000 peak QPS; if one server handles 500 QPS, you need ⌈4000/500⌉ = 8 servers, plus headroom."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Little's Law",
              "statement": "For any stable system, the average number of items in the system equals the average arrival rate times the average time each item spends in it:\n\n  L = λ · W.\n\nIt holds regardless of arrival distribution, service distribution, or scheduling discipline.",
              "proof": "Consider a long interval of length T. Let λ be the average arrival rate, so ≈ λT items arrive (and, in steady state, depart) during T. Track the total \"item-time\" accumulated — the area under the curve of \"number in system\" over time. Counted by item, each of the λT items contributes on average W time units, giving total item-time ≈ λT · W. Counted by time, the total item-time is ∫₀ᵀ L(t) dt = L̄ · T, where L̄ is the time-average number in the system. Equating the two counts of the same area: L̄ · T = λT · W, so L̄ = λ · W. ∎\n\n**Worked:** requests arrive at λ = 500/s and each spends W = 0.2 s in the system, so the average number in flight is L = 500 × 0.2 = **100** concurrent requests. This sizes thread pools, connection limits, and memory — if each in-flight request needs a thread, you need ~100 threads on average (more for peaks)."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Provision for peak with headroom, not for the average.** Little's Law and the QPS estimate give the *average* load; real traffic peaks well above it, and you must keep slack for failures (a dead node dumps its share onto the survivors) and for the latency blow-up near full utilization (Lesson 3). A fleet sized to exactly the average is already overloaded half the day."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A service has 8.64 million DAU, each making 10 requests/day, spread evenly. Compute the average QPS. Then, if peak is 5× average and one server sustains 800 QPS, how many servers (no headroom) are needed at peak?",
                  "solution": "QPS_avg = 8,640,000 × 10 / 86,400 = 1,000 QPS. Peak = 5 × 1,000 = 5,000 QPS. Servers = ⌈5,000 / 800⌉ = ⌈6.25⌉ = 7 servers at peak (before adding headroom for failures/growth, which would push it higher)."
                },
                {
                  "prompt": "By Little's Law, if 1,200 requests are in flight on average and each spends 0.05 s in the system, what is the throughput (arrival rate λ)?",
                  "solution": "Little's Law L = λ·W ⟹ λ = L/W = 1,200 / 0.05 = 24,000 requests/second. (Rearranging Little's Law lets you solve for whichever of L, λ, W is unknown — here throughput from concurrency and latency.)"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c1l2-i1",
              "front": "Layer-4 vs Layer-7 load balancing?",
              "back": "L4 routes by IP/port (fast, protocol-agnostic); L7 routes by application data (URL/headers/cookies), enabling content-based routing and sticky sessions. Both health-check backends."
            },
            {
              "id": "c1l2-i2",
              "front": "QPS from DAU?",
              "back": "QPS_avg = users × requests-per-user-per-day / seconds-per-day; then multiply by a peak factor and divide by per-server capacity (round up, add headroom). E.g. 8.64M×10/86,400 = 1,000 QPS."
            },
            {
              "id": "c1l2-i3",
              "front": "Little's Law and what it sizes?",
              "back": "L = λ·W (items in system = arrival rate × time in system); holds for any distribution. Sizes concurrency: threads, connections, in-flight memory. E.g. 500/s × 0.2 s = 100 concurrent."
            },
            {
              "id": "c1l2-i4",
              "front": "Little's Law derivation idea?",
              "back": "Over time T, item-time (area under 'number in system') counted by item ≈ λT·W and by time = L̄·T; equate ⇒ L̄ = λW."
            },
            {
              "id": "c1l2-i5",
              "front": "Why must the load balancer be redundant?",
              "back": "All traffic flows through it, so a single LB is a single point of failure — defeating the redundancy of scaling out. Run it in a redundant (failover/active-active) configuration."
            }
          ]
        },
        {
          "id": "c1l3",
          "title": "Latency, Throughput & the Limits of Scaling",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Latency vs. throughput; percentiles",
              "statement": "**Latency** is the time to serve one request (a duration); **throughput** is requests served per unit time (a rate). They are distinct: a system can have high throughput and bad latency (deep queues) or low throughput and good latency. Because latency is a *distribution*, summarize it by **percentiles**: the **p99** is the value below which 99% of requests fall — the latency the slowest 1% experience. The high percentiles (p99, p99.9) are the **tail**, and they, not the average, govern user-perceived performance."
            },
            {
              "type": "text",
              "heading": "Why the average lies",
              "body": "Reporting mean (p50-ish) latency hides the tail that actually hurts users. If p50 = 10 ms but p99 = 2 s, one request in a hundred is catastrophically slow — and a single page that makes 100 backend calls will, on average, hit that 2 s tail *once per page load*, so nearly every user feels it. Averages also mask bimodal behavior (cache hit vs miss). Always look at the distribution and the tail; optimize p99/p99.9, not the mean."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Queueing: why you can't run at 100% utilization",
              "statement": "Model a server as an M/M/1 queue with arrival rate λ and service rate μ, so utilization ρ = λ/μ (with ρ < 1 for stability). The mean number in system is L = ρ/(1 − ρ), and by Little's Law the mean response time is\n\n  W = 1/(μ − λ) = (1/μ) · 1/(1 − ρ).\n\nAs ρ → 1, W → ∞: response time blows up *hyperbolically* near saturation, long before utilization reaches 100%.",
              "proof": "For an M/M/1 queue the steady-state number in system is geometrically distributed with mean L = ρ/(1 − ρ) (a standard birth–death result). Apply Little's Law (Lesson 2), W = L/λ:\n\n  W = ρ/(λ(1 − ρ)) = (λ/μ)/(λ(1 − ρ)) = 1/(μ(1 − ρ)) = 1/(μ − λ).\n\nThe factor 1/(1 − ρ) is the key: at ρ = 0.5 response time is 2× the bare service time; at ρ = 0.9 it is 10×; at ρ = 0.99 it is 100×. So the cost of the last few percent of utilization is enormous. ∎\n\nThis is *why* you provision headroom (Lesson 2) and target moderate utilization (often ~60–70%): the tail latency explodes as you approach full load, and a node running \"efficiently\" at 95% utilization is one traffic blip away from a latency cliff."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The Universal Scalability Law (USL)",
              "statement": "Real systems don't scale linearly. The USL (Gunther) models the relative capacity of N workers as\n\n  C(N) = N / ( 1 + α(N − 1) + β·N(N − 1) ),\n\nwhere α is the **contention** (serialization) penalty and β is the **coherency** (crosstalk/coordination) penalty. With β = 0 it reduces to an Amdahl-like curve (diminishing returns); with β > 0, throughput **peaks and then declines** (retrograde scaling) as coordination overhead dominates.",
              "proof": "Start from contention: a fraction of work must serialize, so N workers behave like Amdahl's Law — capacity N/(1 + α(N − 1)), which saturates at 1/α as N grows (the serial fraction again). Now add **coherency**: keeping N workers mutually consistent requires them to coordinate pairwise, and there are N(N − 1)/2 = Θ(N²) pairs (the handshake count from graph theory). This Θ(N²) coordination cost enters the denominator as β·N(N − 1), so beyond some N* the quadratic coherency term outgrows the linear capacity gain and adding workers makes the system *slower*. Setting dC/dN = 0 gives the optimum N* = √((1 − α)/β). ∎\n\nUSL is why \"just add more nodes/threads\" can backfire: past N*, the cost of keeping everyone coherent (locks, cache-line bouncing, consensus chatter) exceeds the work they add. The cure is to reduce β — shard so workers rarely coordinate."
            },
            {
              "type": "example",
              "heading": "Retrograde scaling",
              "body": "A service with contention α = 0.03 and coherency β = 0.001 has optimum N* = √((1 − 0.03)/0.001) = √970 ≈ **31** nodes. Below 31, adding nodes helps (sub-linearly); at ~31 throughput peaks; beyond 31, throughput *falls* — 40 nodes are slower than 31. The Θ(N²) coherency term (locks, shared state, coordination) eventually swamps the linear capacity. The fix isn't more hardware; it's lowering β by sharding the contended resource so nodes stop coordinating."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Three independent walls limit scaling, and all say \"shrink coordination.\"** Amdahl (serial fraction caps speedup), queueing (latency explodes as ρ→1), and USL (coherency β causes retrograde scaling) are different lenses on one truth: the bottleneck is the part that *can't* be done independently. Scale by removing coordination — statelessness, sharding, async — not by piling on nodes around a shared chokepoint."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A server has service rate μ = 1,000 requests/s. Compute the mean response time (M/M/1) at λ = 500/s and at λ = 950/s. What does the comparison show?",
                  "solution": "W = 1/(μ − λ). At λ = 500: W = 1/(1,000 − 500) = 1/500 = 0.002 s = 2 ms. At λ = 950: W = 1/(1,000 − 950) = 1/50 = 0.02 s = 20 ms. Going from 50% to 95% utilization (1.9× the load) made latency 10× worse — the 1/(1−ρ) blow-up. Running near saturation trades a little extra throughput for a latency cliff."
                },
                {
                  "prompt": "Explain why optimizing for average (p50) latency can hide a serious user-experience problem, using a fan-out example.",
                  "solution": "The average hides the tail. Suppose p50 = 10 ms but p99 = 500 ms. A user-facing page that makes 100 independent backend calls and waits for all of them will, with high probability, hit at least one p99-tail call: P(no call in the slow 1%) = 0.99¹⁰⁰ ≈ 0.37, so ~63% of page loads include a 500 ms call and are bottlenecked by it. The 'average' looked fine (10 ms), but most users actually experience the tail because fan-out amplifies it. You must optimize p99/p99.9, not the mean (this 'tail at scale' is revisited in Unit 8)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c1l3-i1",
              "front": "Latency vs throughput?",
              "back": "Latency = time to serve one request (duration); throughput = requests per unit time (rate). Independent — high throughput can coexist with bad (queued) latency."
            },
            {
              "id": "c1l3-i2",
              "front": "What is p99 / tail latency, and why does it matter?",
              "back": "p99 = the latency the slowest 1% experience. Tails (p99, p99.9) govern user experience because fan-out makes nearly every page hit a tail call; the average hides it."
            },
            {
              "id": "c1l3-i3",
              "front": "M/M/1 response time and the utilization wall?",
              "back": "W = 1/(μ−λ) = (1/μ)·1/(1−ρ). As ρ→1, W→∞ — at ρ=0.9 it's 10× service time, at 0.99 it's 100×. Hence target moderate utilization and keep headroom."
            },
            {
              "id": "c1l3-i4",
              "front": "Universal Scalability Law?",
              "back": "C(N) = N/(1 + α(N−1) + βN(N−1)): α = contention (Amdahl-like), β = coherency (Θ(N²) coordination). β>0 ⇒ throughput peaks at N*=√((1−α)/β) then declines (retrograde)."
            },
            {
              "id": "c1l3-i5",
              "front": "Why does USL have an N(N−1) term?",
              "back": "Keeping N workers coherent needs pairwise coordination, and there are N(N−1)/2 = Θ(N²) pairs (handshake count) — so coordination cost grows quadratically and eventually dominates."
            },
            {
              "id": "c1l3-i6",
              "front": "The common message of Amdahl, queueing, and USL?",
              "back": "The limit is the part that can't be done independently. Scale by removing coordination (statelessness, sharding, async), not by adding nodes around a shared chokepoint."
            }
          ]
        }
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
          "id": "c2l1",
          "title": "The Nines, SLIs, SLOs & SLAs",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Availability and 'the nines'",
              "statement": "**Availability** is the fraction of time a system is operational: a = uptime / (uptime + downtime) ∈ [0, 1], usually quoted as a percentage. Each additional **nine** cuts allowed downtime tenfold: 99% (\"two nines\") permits ~3.65 days/year of downtime, 99.9% ~8.76 hours, 99.99% ~52.6 minutes, 99.999% ~5.26 minutes. The downtime budget over a period of length T is simply (1 − a)·T."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Downtime budget",
              "statement": "A system with availability a over a period of length T may be down for at most (1 − a)·T. Each extra nine divides the downtime budget by ten.",
              "proof": "By definition a is the fraction of time up, so (1 − a) is the fraction down, and over a period T the absolute downtime is (1 − a)·T. Replacing a = 1 − 10⁻ᵏ (\"k nines\") gives downtime 10⁻ᵏ·T, so increasing k by one shrinks the budget by a factor of 10. ∎\n\n**Worked:** at 99.9% (a = 0.999) over a year (T = 365 × 24 = 8,760 hours), the downtime budget is (1 − 0.999) × 8,760 = 0.001 × 8,760 = **8.76 hours/year**. At 99.99% it is 0.876 hours ≈ 52.6 minutes — ten times tighter."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "SLI, SLO, SLA",
              "statement": "Three nested concepts (Google SRE): an **SLI** (Service Level *Indicator*) is a *measured* metric of service quality — e.g. the fraction of requests served < 200 ms, or the success rate. An **SLO** (Service Level *Objective*) is an internal *target* for an SLI (e.g. \"99.9% of requests succeed over 28 days\"). An **SLA** (Service Level *Agreement*) is an external *contract* with customers that carries penalties (refunds) if breached — and is therefore set *looser* than the SLO, so you alert and act on the SLO long before the SLA is at risk."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Error budget",
              "statement": "The **error budget** is the allowed unreliability implied by an SLO: error budget = 1 − SLO. A 99.9% SLO grants a 0.1% budget of failures/downtime per window. It reframes reliability as a *resource to spend*: while budget remains, the team can ship features and take risks; when it's exhausted, the policy shifts to reliability work (freeze risky launches). This dissolves the dev-vs-ops tug-of-war into a shared, quantitative rule."
            },
            {
              "type": "decision",
              "heading": "SLI vs. SLO vs. SLA",
              "rows": [
                [
                  "SLI — indicator",
                  "What you measure: a quality metric (latency < X, success rate). The raw signal."
                ],
                [
                  "SLO — objective",
                  "Your internal target for the SLI (99.9% over 28 days). Drives alerting and the error budget."
                ],
                [
                  "SLA — agreement",
                  "An external contract with penalties; set looser than the SLO so you react well before breaching it."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**100% is the wrong reliability target.** It's impossible (dependencies, deploys, and the physical world fail) and ruinously expensive (each nine costs more — Unit 9), and it leaves no error budget to ship features. Choose the *lowest* availability users won't notice, set the SLO there, and spend the resulting error budget on velocity."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An SLO of 99.9% availability allows how many hours of downtime per year? (Use 365 × 24 hours.)",
                  "solution": "Downtime budget = (1 − a)·T = (1 − 0.999) × (365 × 24) = 0.001 × 8,760 = 8.76 hours/year."
                },
                {
                  "prompt": "A service has a 99.95% SLO over 30 days. In the first 20 days it has already been down for 18 minutes. How much of its error budget remains for the rest of the window? (30 days = 43,200 minutes.)",
                  "solution": "Total budget = (1 − 0.9995) × 43,200 = 0.0005 × 43,200 = 21.6 minutes for the 30-day window. Already spent: 18 minutes. Remaining = 21.6 − 18 = 3.6 minutes for the final 10 days. With most of the budget gone, error-budget policy would now freeze risky launches and prioritize reliability — a quantitative, non-political trigger."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c2l1-i1",
              "front": "Availability and the downtime budget?",
              "back": "a = uptime/(uptime+downtime). Downtime budget over period T = (1−a)·T. Each extra nine cuts allowed downtime 10×; 99.9% over a year = 8.76 hours."
            },
            {
              "id": "c2l1-i2",
              "front": "SLI vs SLO vs SLA?",
              "back": "SLI: a measured quality metric. SLO: internal target for it. SLA: external contract with penalties, set looser than the SLO so you react before breaching it."
            },
            {
              "id": "c2l1-i3",
              "front": "What is an error budget?",
              "back": "1 − SLO: the allowed unreliability per window. Reframes reliability as a resource — spend it on velocity while it lasts; freeze risky work when exhausted."
            },
            {
              "id": "c2l1-i4",
              "front": "Why is 100% the wrong target?",
              "back": "Impossible (things fail), ruinously expensive (each nine costs more), and leaves no error budget to ship. Target the lowest availability users won't notice."
            }
          ]
        },
        {
          "id": "c2l2",
          "title": "Composing Availability",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "Systems are built from parts — and the parts compose",
              "body": "A real service is a graph of dependencies: it calls databases, caches, other services, each with its own availability. The system's availability is *not* any single component's — it's determined by how they combine. There are two fundamental compositions: **series** (every component must work — a dependency chain) and **parallel** (any one working suffices — redundancy). They pull in opposite directions, and knowing the math tells you exactly where reliability is won or lost."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Series composition (dependencies multiply down)",
              "statement": "For independent components with availabilities a₁, …, aₙ arranged in **series** — the system works only if *all* of them work — the combined availability is the product\n\n  A_series = ∏ᵢ aᵢ,  and  A_series ≤ min(aᵢ).\n\nEvery additional hard dependency can only lower availability.",
              "proof": "The system is up exactly when every component is up. By independence, the probability that all are up is the product of the individual up-probabilities:\n\n  A_series = P(all up) = ∏ᵢ P(componentᵢ up) = ∏ᵢ aᵢ.\n\nSince each aᵢ ∈ [0, 1], multiplying the running product by aᵢ ≤ 1 cannot increase it; hence A_series ≤ aⱼ for every j, so A_series ≤ min(aᵢ). ∎\n\n**Worked:** two independent components each 99.9% available, both required: A = 0.999 × 0.999 = 0.998001 ≈ **99.8%** — *worse* than either alone. Ten such dependencies in series give 0.999¹⁰ ≈ 0.990 = 99.0%, losing two nines just from chain length."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Parallel composition (redundancy adds nines)",
              "statement": "For independent redundant components in **parallel** — the system works if *at least one* works — the availability is\n\n  A_parallel = 1 − ∏ᵢ (1 − aᵢ),  and  A_parallel ≥ max(aᵢ).\n\nAdding a redundant replica multiplies the *unavailabilities*, sharply increasing reliability.",
              "proof": "The system is down only when *every* component is down. By independence, P(all down) = ∏ᵢ (1 − aᵢ), so\n\n  A_parallel = 1 − P(all down) = 1 − ∏ᵢ (1 − aᵢ).\n\nEach (1 − aᵢ) ∈ [0, 1], so the product of unavailabilities is ≤ any single factor; therefore 1 − ∏(1 − aᵢ) ≥ 1 − (1 − aⱼ) = aⱼ for every j, so A_parallel ≥ max(aᵢ). ∎\n\n**Worked:** two replicas each 99% available behind a load balancer, service up if either is up: A = 1 − (1 − 0.99)² = 1 − (0.01)² = 1 − 0.0001 = 0.9999 = **99.99%** — *two nines better* than a single replica. Each independent replica squares the unavailability."
            },
            {
              "type": "decision",
              "heading": "Series vs. parallel — opposite effects",
              "rows": [
                [
                  "Series (all must work): A = ∏aᵢ",
                  "Availability drops below the weakest link. Every hard dependency is a tax. Minimize the dependency chain on the critical path."
                ],
                [
                  "Parallel (any can work): A = 1 − ∏(1−aᵢ)",
                  "Availability rises above the best component. Redundancy multiplies unavailabilities away. Add replicas to the things that must not fail."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Every serial dependency is an availability tax — this is the hidden cost of microservices.** A request that synchronously fans through 10 services, each 99.9% available, is at best 0.999¹⁰ ≈ 99.0% available *even if every service hits its own SLO*. Either make dependencies non-critical (cache, default, degrade — Unit 8) or make them redundant; don't let a long synchronous chain silently erode your nines (revisited in Unit 7)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Two services, each 99.9% available, are called in series (both must succeed). What is the combined availability, to one decimal place? Then a third 99.9% dependency is added — what is it now?",
                  "solution": "Series multiplies: A₂ = 0.999 × 0.999 = 0.998001 ≈ 99.8%. With a third: A₃ = 0.999³ = 0.997002999 ≈ 99.7%. Each added serial dependency costs roughly another 0.1% (a tenth of a nine) — the dependency-chain tax."
                },
                {
                  "prompt": "Two replicas, each 99% available, sit behind a load balancer; the service is up if either is up. What is the availability? How many such replicas would reach 99.9999% (six nines)?",
                  "solution": "Two replicas: A = 1 − (1 − 0.99)² = 1 − 0.0001 = 0.9999 = 99.99%. For n replicas, A = 1 − (0.01)ⁿ; unavailability is 0.01ⁿ = 10⁻²ⁿ, which reaches 10⁻⁶ (six nines) when 2n = 6, i.e. n = 3 replicas. (Each independent 99% replica adds two nines, since it multiplies the unavailability by 0.01.)"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c2l2-i1",
              "front": "Series availability composition?",
              "back": "All must work ⇒ A = ∏aᵢ ≤ min. Independence makes up-probabilities multiply; every hard dependency lowers availability. Two 99.9% in series → 99.8%."
            },
            {
              "id": "c2l2-i2",
              "front": "Parallel (redundant) availability composition?",
              "back": "Any one works ⇒ A = 1 − ∏(1−aᵢ) ≥ max. The system is down only if all are down, so unavailabilities multiply. Two 99% replicas → 99.99%."
            },
            {
              "id": "c2l2-i3",
              "front": "Why does each redundant 99% replica add two nines?",
              "back": "It multiplies the unavailability by (1−0.99)=0.01 = 10⁻², i.e. adds two nines per independent replica: 1 replica 99%, 2 → 99.99%, 3 → 99.9999%."
            },
            {
              "id": "c2l2-i4",
              "front": "The availability tax of microservices?",
              "back": "A synchronous chain of N services each at availability a is only ~aᴺ available even if each meets its SLO (10 × 99.9% ≈ 99.0%). Make dependencies non-critical or redundant."
            }
          ]
        },
        {
          "id": "c2l3",
          "title": "Failure, Redundancy & Recovery",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "MTBF and MTTR",
              "statement": "**MTBF** (Mean Time Between Failures) is the average uptime between successive failures — how *reliable* a component is. **MTTR** (Mean Time To Repair/Recover) is the average time to restore service after a failure — how *recoverable* it is. Reliability is about failing less often; recoverability is about failing *briefly*. Both feed availability, and they are different engineering problems."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Availability from MTBF and MTTR — and why MTTR is the lever",
              "statement": "A component that is up for MTBF and down for MTTR each failure cycle has availability\n\n  a = MTBF / (MTBF + MTTR).\n\nReducing MTTR raises availability just as effectively as increasing MTBF — and is usually far easier — so fast recovery is the higher-leverage investment.",
              "proof": "Over one failure cycle the component is up for a time MTBF and down for a time MTTR, a full cycle of MTBF + MTTR. Availability is the long-run fraction of time up:\n\n  a = MTBF / (MTBF + MTTR).\n\nThe two parameters enter symmetrically: a depends only on the *ratio* MTBF/MTTR (dividing top and bottom by MTTR gives a = (MTBF/MTTR)/(MTBF/MTTR + 1)). So halving MTTR doubles that ratio exactly as doubling MTBF would — equal leverage. But making a component fail half as often (raising MTBF) typically means fundamental hardening, whereas recovering twice as fast (lowering MTTR) is achievable with monitoring, automation, fast rollback, and well-drilled runbooks. Hence the practical rule: **invest in recovery.** ∎\n\n**Worked:** MTBF = 1,000 hours, MTTR = 1 hour ⟹ a = 1,000/1,001 ≈ 99.9%. Cut MTTR to 0.1 h (6 min) ⟹ a = 1,000/1,000.1 ≈ 99.99% — a full extra nine from faster recovery alone, no change in failure rate."
            },
            {
              "type": "text",
              "heading": "Redundancy and failover",
              "body": "Redundancy is how series-fragile components become parallel-robust (Lesson 2). **Active-active**: all replicas serve traffic; a failure just removes capacity (size for N−1). **Active-passive (standby)**: a hot/warm standby takes over on failure — cheaper but with a failover gap that *is* part of MTTR. **Failover** must be automatic and tested: an untested standby is a liability, since the moment you need it is the worst time to discover it doesn't work. Redundancy only buys availability if the failure detection and switchover are fast and reliable."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Failure domains, blast radius, graceful degradation",
              "statement": "A **failure domain** is a boundary within which a single failure is contained (a server, rack, availability zone, region). **Blast radius** is how much breaks when something fails. **Graceful degradation** is continuing to serve reduced functionality instead of failing completely (e.g. serve stale cache, hide a non-critical widget). Good designs partition into independent failure domains so one failure can't take down everything, and degrade rather than collapse."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**You cannot prevent all failures — design for fast recovery and a small blast radius.** Because a = MTBF/(MTBF+MTTR) and MTTR is the cheaper lever, prioritize detection, automated failover, and rollback over chasing an unattainably high MTBF. And contain failures: independent failure domains plus graceful degradation turn a catastrophic outage into a localized, survivable one."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A component has MTBF = 720 hours and MTTR = 4 hours. Compute its availability. Then, without changing MTBF, how low must MTTR go to reach 99.9%?",
                  "solution": "a = MTBF/(MTBF+MTTR) = 720/(720+4) = 720/724 ≈ 0.99448 ≈ 99.45%. For a = 0.999: 0.999 = 720/(720+MTTR) ⟹ 720 + MTTR = 720/0.999 ≈ 720.72 ⟹ MTTR ≈ 0.72 hours ≈ 43 minutes. Cutting recovery from 4 h to ~43 min reaches 99.9% with no change in how often it fails — MTTR is the lever."
                },
                {
                  "prompt": "Why is an untested active-passive standby described as a liability, and how does it relate to MTTR?",
                  "solution": "Failover time is part of MTTR — availability is a = MTBF/(MTBF+MTTR), so a slow or failed switchover directly lowers availability. An untested standby may have stale config, missing data, or broken failover automation that you only discover during a real outage (the worst moment), turning a brief blip into a long outage (huge MTTR) or total failure. Redundancy only helps if detection + failover are fast and *proven* — hence regular failover drills / chaos testing to keep effective MTTR low."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c2l3-i1",
              "front": "MTBF vs MTTR?",
              "back": "MTBF = mean uptime between failures (how reliable); MTTR = mean time to recover after a failure (how recoverable). Different engineering problems, both feed availability."
            },
            {
              "id": "c2l3-i2",
              "front": "Availability from MTBF/MTTR, and which is the lever?",
              "back": "a = MTBF/(MTBF+MTTR); it depends on the ratio, so halving MTTR = doubling MTBF in effect. MTTR is usually far cheaper to improve (monitoring, automation, rollback) — invest in recovery."
            },
            {
              "id": "c2l3-i3",
              "front": "Active-active vs active-passive redundancy?",
              "back": "Active-active: all replicas serve, a failure just removes capacity (size for N−1). Active-passive: a standby takes over on failure — cheaper, but the failover gap counts toward MTTR and must be tested."
            },
            {
              "id": "c2l3-i4",
              "front": "Failure domain, blast radius, graceful degradation?",
              "back": "Failure domain: boundary containing a failure (server/rack/AZ/region). Blast radius: how much breaks. Graceful degradation: serve reduced function (stale cache, hide widgets) instead of failing fully."
            }
          ]
        }
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
          "id": "c3l1",
          "title": "Consistency Models",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Consistency model",
              "statement": "A **consistency model** is the contract a storage system makes about *which values a read may return* in the presence of concurrent writes and replication. It is a spectrum from **strong** (reads always reflect the latest write, as if there were one copy) to **weak** (reads may return stale or out-of-order data). Stronger models are easier to program against but cost latency and availability; weaker models are cheaper and more available but push correctness work onto the application."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Linearizability (strong consistency)",
              "statement": "**Linearizability** is the strongest single-object model: every operation appears to take effect **atomically at some instant between its invocation and its response**, and that order is consistent with **real time** — if operation A completes before B begins, A's effect is ordered before B's. The system behaves as if there is a single, up-to-date copy. It is the \"gold standard\" of correctness and the C in CAP — and, as the next lesson proves, it cannot be combined with availability under a partition."
            },
            {
              "type": "text",
              "heading": "The spectrum, from strong to eventual",
              "body": "Between linearizable and eventual lie useful intermediate models. **Sequential consistency** preserves each process's program order and a single global order, but not real-time order. **Causal consistency** preserves cause-and-effect (the happens-before relation of Lesson 3) — if you see an effect you see its cause — while letting truly concurrent operations be seen in different orders; it is notably the *strongest* model achievable while staying available under a partition. **Read-your-writes**, **monotonic reads**, and other \"session\" guarantees are weaker still. Each step down trades a correctness guarantee for lower latency and higher availability."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Eventual consistency",
              "statement": "**Eventual consistency** is a weak guarantee: *if writes stop, all replicas eventually converge to the same value.* It says nothing about how long convergence takes or what a read sees in the meantime (reads may be stale or non-monotonic). It maximizes availability and low latency — every replica answers immediately from its local state — at the cost of temporary disagreement, and is the default for AP systems (Dynamo-style stores)."
            },
            {
              "type": "decision",
              "heading": "Picking a consistency model",
              "rows": [
                [
                  "Linearizable (strong)",
                  "Reads see the latest write, single-copy semantics. For correctness-critical state (balances, locks, config). Costs latency; unavailable under partition (CP)."
                ],
                [
                  "Causal",
                  "Cause precedes effect; concurrent ops may diverge. The strongest model that stays available under partition. Good for collaboration, comments, feeds."
                ],
                [
                  "Eventual",
                  "Converges only after writes stop; reads may be stale. Maximum availability and lowest latency (AP). For likes, view counts, caches."
                ]
              ]
            },
            {
              "type": "example",
              "heading": "An anomaly each model rules out",
              "body": "Alice posts a comment, then replies to her own comment. Under **eventual** consistency a friend might see the reply before the original (causal order violated) — confusing but tolerable for a feed. **Causal** consistency forbids this: because the original *happens-before* the reply, every observer that sees the reply must already see the original. **Linearizability** adds real-time: if Alice's bank transfer completes before she checks her balance, the balance read *must* reflect it — anything else is a correctness bug, not a cosmetic one. Match the model to how wrong an anomaly would be."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Stronger consistency is not \"better\" — it's a trade.** Linearizability simplifies application logic but forces coordination (latency) on every operation and forfeits availability under partition. Pick the *weakest* model whose anomalies your application can tolerate; reserve linearizability for the state where a stale read is an actual bug."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Eventual consistency guarantees what, exactly — and what does it NOT guarantee?",
                  "solution": "It guarantees that **if writes stop, all replicas eventually converge to the same value**. It does NOT guarantee when convergence happens, that a read sees the latest write, that successive reads are monotonic (a later read can return an older value than an earlier one), or any real-time ordering. It trades those guarantees for immediate, always-available local reads."
                },
                {
                  "prompt": "Why is causal consistency, not linearizability, the strongest model you can offer while remaining available during a network partition?",
                  "solution": "Linearizability requires a real-time global order, which (CAP, next lesson) is impossible to maintain while staying available under a partition — a partitioned node can't know about writes on the other side, so it can't guarantee its read reflects the latest one without blocking. Causal consistency only requires preserving *happens-before* (cause→effect), which can be tracked locally with metadata (e.g. vector clocks) and enforced without cross-partition coordination: a node can still serve reads/writes using causal metadata it already has, deferring only the *merge* of concurrent updates. So causality is preservable under partition while availability is kept, whereas real-time linearizability is not."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c3l1-i1",
              "front": "What is a consistency model?",
              "back": "The contract about which values reads may return given concurrent writes/replication — a spectrum from strong (latest write always) to weak (stale/out-of-order allowed)."
            },
            {
              "id": "c3l1-i2",
              "front": "Define linearizability.",
              "back": "Every operation appears atomic at one instant between invoke and response, consistent with real time (A before B in time ⇒ A ordered first). Single up-to-date copy. The C in CAP."
            },
            {
              "id": "c3l1-i3",
              "front": "Define eventual consistency.",
              "back": "If writes stop, all replicas eventually converge. No timing guarantee, reads may be stale/non-monotonic. Max availability + low latency (AP)."
            },
            {
              "id": "c3l1-i4",
              "front": "Why is causal consistency special?",
              "back": "It preserves cause→effect (happens-before) while allowing concurrent ops to diverge — and it's the strongest model achievable while staying available under a partition."
            },
            {
              "id": "c3l1-i5",
              "front": "How do you choose a consistency model?",
              "back": "Pick the weakest model whose anomalies your app tolerates; reserve linearizability for state where a stale read is a real bug (balances, locks). Strength trades latency/availability."
            }
          ]
        },
        {
          "id": "c3l2",
          "title": "The CAP Theorem",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "CAP: consistency, availability, partition tolerance",
              "statement": "**CAP** concerns a replicated read/write register under three properties: **Consistency (C)** — linearizable, every read sees the latest write; **Availability (A)** — every request to a non-failing node returns a non-error response (no hanging); **Partition tolerance (P)** — the system keeps working despite the network dropping or delaying arbitrary messages between nodes. The theorem (Gilbert & Lynch's proof of Brewer's conjecture) says these cannot all three hold."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "CAP impossibility (Gilbert–Lynch)",
              "statement": "In an asynchronous network that may partition (drop messages), no read/write register can be simultaneously **consistent** (linearizable) and **available** (every request to a non-failing node returns a non-error response). Under a partition, a system must sacrifice C or A.",
              "proof": "Suppose, for contradiction, a register is both consistent and available despite partitions. Partition the replicas into two non-empty groups G₁ and G₂ that cannot exchange any messages; let the register initially hold v₀.\n\nA client writes v₁ to a node in G₁. The write must complete (availability), but since G₁ cannot reach G₂, no node in G₂ learns of it. Now a client issues a read to a node in G₂. By availability that node must return a response *without* waiting for the partition to heal (which might never happen). Its only information is G₂'s local state, still v₀ — and this execution is **indistinguishable**, from G₂'s perspective, from one in which the write of v₁ never occurred. So it returns v₀.\n\nBut the read began after the write completed, so linearizability requires it to return v₁ (or newer). Returning v₀ violates consistency. Hence the G₂ node must either *not respond* (violating availability) or *return stale v₀* (violating consistency) — both cannot hold. ∎\n\nThe engine is **indistinguishability**: from G₂'s side, \"the write happened but I can't hear about it\" and \"the write never happened\" are identical, so any answer it gives is wrong in one of those two worlds."
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "The Gilbert–Lynch execution. A write commits at N₁; the partition drops replication to N₂. A later read at N₂ cannot distinguish this run from one where v1 was never written — so it must return stale v0 (breaking consistency) or withhold a reply (breaking availability). Hence no service is both consistent and available under a partition. ∎",
              "actors": [
                "Writer",
                "N₁",
                "N₂",
                "Reader"
              ],
              "messages": [
                {
                  "from": "Writer",
                  "to": "N₁",
                  "label": "write x=v1",
                  "tone": "sage"
                },
                {
                  "from": "N₁",
                  "to": "Writer",
                  "label": "ack",
                  "tone": "sage",
                  "dashed": true
                },
                {
                  "note": "✂ partition — N₁ ⇄ N₂ messages dropped"
                },
                {
                  "from": "N₁",
                  "to": "N₂",
                  "label": "replicate v1 — lost",
                  "tone": "rust",
                  "dashed": true
                },
                {
                  "from": "Reader",
                  "to": "N₂",
                  "label": "read x"
                },
                {
                  "note": "N₂'s state is indistinguishable from 'v1 never written'"
                },
                {
                  "from": "N₂",
                  "to": "Reader",
                  "label": "stale v0 → ¬C    or    no reply → ¬A",
                  "tone": "rust"
                }
              ]
            },
            {
              "type": "text",
              "heading": "The real choice: C vs A, only under partition",
              "body": "Because real networks *do* partition, **P is not optional** — it's a fact you must tolerate, not a property you choose. So CAP doesn't offer a steady-state menu of \"any two of three.\" It says: *during a partition*, you must choose. **CP systems** (e.g. consensus-backed stores) keep consistency and refuse/stall requests on the minority side (sacrificing A). **AP systems** (e.g. Dynamo-style) keep answering from local state and reconcile later (sacrificing C). When there is no partition, you can have both C and A — which is exactly what PACELC adds."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "PACELC",
              "statement": "**PACELC** (Abadi) completes CAP: *if there is a Partition (P), trade Availability vs Consistency (A/C); Else (E) — in normal operation — trade Latency vs Consistency (L/C).* It captures the everyday cost CAP ignores: even with no partition, stronger consistency requires more coordination and thus higher latency. Systems are classified e.g. PA/EL (Dynamo: available under partition, low-latency otherwise) or PC/EC (Spanner: consistent always, paying latency)."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**CAP is not \"pick 2 of 3.\"** You don't permanently select two properties as a design. P (partitions occur) is forced by real networks; CAP only compels a **C-vs-A choice during a partition**, and PACELC adds the latency-vs-consistency choice the rest of the time. Stating CAP as \"choose any two\" is the classic misformulation — avoid it."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Under a network partition, what does CAP say a system must sacrifice, and why is 'pick 2 of 3' the wrong framing?",
                  "solution": "Under a partition it must sacrifice **either consistency (linearizability) or availability** — it cannot guarantee both. 'Pick 2 of 3' is wrong because P (partitions) isn't a property you opt into; real networks partition, so you must tolerate it. CAP doesn't offer a steady-state choice of any two — it forces a C-vs-A decision *only during a partition* (and, per PACELC, a latency-vs-consistency decision the rest of the time). The genuine design question is 'when partitioned, do we stay consistent (CP) or available (AP)?'"
                },
                {
                  "prompt": "Classify each under PACELC and explain: (a) a globally-distributed bank ledger that must never show a wrong balance; (b) a social-media 'like' counter.",
                  "solution": "(a) **PC/EC** — under partition it chooses consistency over availability (a wrong balance is unacceptable, so it refuses/stalls minority-side writes), and even in normal operation (Else) it pays latency for strong consistency (e.g. Spanner-style). Correctness dominates. (b) **PA/EL** — a like counter tolerates staleness, so under partition it stays available (AP), and in normal operation it favors low latency over strong consistency (eventual is fine). The cost of an anomaly (a momentarily-off like count) is negligible, so it optimizes availability and latency."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c3l2-i1",
              "front": "State CAP's three properties.",
              "back": "C: linearizable (reads see latest write). A: every request to a non-failing node gets a non-error response. P: keeps working despite the network dropping/delaying messages."
            },
            {
              "id": "c3l2-i2",
              "front": "CAP impossibility proof idea?",
              "back": "Partition into G₁,G₂; write v1 to G₁; a read at G₂ can't tell 'write happened but unheard' from 'never happened' (indistinguishability), so it returns stale v0 (¬C) or doesn't respond (¬A). ∎"
            },
            {
              "id": "c3l2-i3",
              "front": "Why is the real CAP choice 'C vs A under partition'?",
              "back": "Partitions are unavoidable (P isn't optional), so during one you must drop either C or A. It is NOT 'pick 2 of 3' as a steady-state design."
            },
            {
              "id": "c3l2-i4",
              "front": "What does PACELC add?",
              "back": "If Partition → A vs C; Else (normal operation) → Latency vs Consistency. Even with no partition, stronger consistency costs latency. E.g. PA/EL (Dynamo), PC/EC (Spanner)."
            }
          ]
        },
        {
          "id": "c3l3",
          "title": "Time & Ordering: Logical Clocks",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "There is no global 'now'",
              "body": "In a distributed system you cannot rely on physical wall-clock time to order events: clocks on different machines drift and are only loosely synchronized (NTP leaves milliseconds of skew; even Google's TrueTime exposes an uncertainty interval). Two events microseconds apart on different nodes cannot be reliably ordered by timestamp. Yet correctness often depends on *ordering* — who wrote last, did the cause precede the effect. The resolution is to abandon physical time and define ordering by **causality**."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The happens-before relation (→)",
              "statement": "Lamport's **happens-before** relation → is the smallest relation on events satisfying: **(1)** if a and b are in the same process and a occurs before b, then a → b; **(2)** if a is the *sending* of a message and b is its *receipt*, then a → b; **(3)** transitivity: a → b and b → c imply a → c. If neither a → b nor b → a, the events are **concurrent** (a ∥ b) — they have no causal relationship and may be seen in either order. → is a *partial* order: concurrency is genuine, not just unknown."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Lamport logical clock",
              "statement": "A **Lamport clock** assigns each event an integer timestamp C via a counter per process: **(a)** before each event, a process increments its counter; **(b)** a sent message carries its sender's counter value; **(c)** on receiving a message with timestamp t, a process sets its counter to max(local, t) + 1 before timestamping the receive event. This needs no synchronized physical clocks — just counters and the message values already in flight."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The clock condition: a → b ⇒ C(a) < C(b)",
              "statement": "Under Lamport's logical-clock rules, if a → b then C(a) < C(b). The timestamps are consistent with causality.",
              "proof": "It suffices to show C strictly increases across each of the three generators of →; transitivity then carries it to all of →.\n**(1) Same process, a before b:** the process increments its counter before each event, so a later event's timestamp exceeds an earlier one's: C(a) < C(b).\n**(2) Send a, receive b:** the message carries C(a); on receipt the process sets its counter to max(local, C(a)) + 1 ≥ C(a) + 1 > C(a), so C(b) > C(a).\n**(3) Transitivity:** any a → b is witnessed by a finite chain a = e₀ → e₁ → ⋯ → eₖ = b of generator steps (1)/(2). By the two cases, C strictly increases at each step: C(e₀) < C(e₁) < ⋯ < C(eₖ), hence C(a) < C(b). ∎\n\n**⚠ The converse is false.** C(a) < C(b) does *not* imply a → b: two concurrent events can receive ordered timestamps by coincidence of the counters. Lamport timestamps give a *total order consistent with* causality, but they cannot *detect* concurrency — you can extend → to a total order, but you cannot recover → from the timestamps. (Vector clocks fix this: V(a) < V(b) iff a → b, capturing causality exactly.)"
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "Lamport timestamps in action. Each event carries a counter; on receive, C = max(local, message) + 1. The send a (C=1) happens-before the send b (C=3) via the message chain, and indeed C(a)=1 < 3=C(b) — the clock condition. The converse fails: an unrelated event could also carry C=2 without being caused by a.",
              "actors": [
                "P₁",
                "P₂",
                "P₃"
              ],
              "messages": [
                {
                  "from": "P₁",
                  "to": "P₂",
                  "label": "m₁  (event a)",
                  "tick": "C=1",
                  "tone": "sage"
                },
                {
                  "note": "P₂ on receive: C = max(local, 1) + 1 = 2"
                },
                {
                  "from": "P₂",
                  "to": "P₃",
                  "label": "m₂  (event b)",
                  "tick": "C=3",
                  "tone": "sage"
                },
                {
                  "note": "a → b (via m₁ then m₂),  and  C(a)=1 < 3=C(b)  ✓"
                }
              ]
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Vector clocks",
              "statement": "A **vector clock** assigns each event a vector V of one counter per process (each process bumps its own entry per event; on receive, take the element-wise max then bump its own entry). Define V(a) < V(b) iff every entry of V(a) ≤ V(b) and at least one is strictly less. Then **a → b iff V(a) < V(b)**, and a ∥ b iff the vectors are incomparable. Vector clocks therefore capture causality *exactly* — including detecting concurrency — which a scalar Lamport clock cannot."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Lamport vs. vector clocks.** A Lamport timestamp gives a cheap total order *consistent with* causality (a → b ⇒ C(a) < C(b)) but can't tell whether two events are causally related or merely concurrent. Vector clocks cost O(number of processes) per timestamp but make causality decidable (a → b *iff* V(a) < V(b)) — the basis for detecting conflicting concurrent writes in Dynamo-style stores (Unit 4)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Lamport's clock condition states: if a happens-before b, then C(a) ___ C(b). Fill in the relation, and state whether the converse holds.",
                  "solution": "C(a) **<** C(b) (strictly less). The converse does NOT hold: C(a) < C(b) does not imply a → b, because two concurrent (causally unrelated) events can still get ordered timestamps. Lamport clocks are consistent with causality but can't detect concurrency."
                },
                {
                  "prompt": "Process P₁ has counter 4 and does a local event, then sends a message; P₂ has counter 2 when it receives that message and then does a local event. Give the Lamport timestamps of P₁'s send and P₂'s receive and following event, and identify the happens-before relations.",
                  "solution": "P₁ increments before the local event: C=5 (local event). Then increments before the send: send timestamp C=6 (message carries 6). P₂ receives: C = max(local=2, msg=6) + 1 = 7 (receive event). P₂'s next local event: C=8. Happens-before: (local 5) → (send 6) [same process], (send 6) → (receive 7) [message], (receive 7) → (event 8) [same process], and by transitivity 5 → 7, 5 → 8, 6 → 8. All satisfy C(a) < C(b). The event P₂ did *before* receiving (timestamp ≤ 2... e.g. its prior events) is concurrent with P₁'s send 6 — incomparable under →."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c3l3-i1",
              "front": "Why can't physical clocks order distributed events?",
              "back": "Clocks drift and are only loosely synced (NTP skew, TrueTime uncertainty), so timestamps can't reliably order events microseconds apart on different nodes. Order by causality instead."
            },
            {
              "id": "c3l3-i2",
              "front": "Define happens-before (→).",
              "back": "Smallest relation with: (1) same-process order, (2) message send → receive, (3) transitivity. Neither a→b nor b→a ⇒ concurrent. It's a partial order."
            },
            {
              "id": "c3l3-i3",
              "front": "Lamport clock update rules?",
              "back": "Increment counter before each event; messages carry the sender's counter; on receive set counter = max(local, msg)+1. No physical clock needed."
            },
            {
              "id": "c3l3-i4",
              "front": "Clock condition and its proof idea?",
              "back": "a→b ⇒ C(a)<C(b). C strictly increases across same-process order, across send→receive (max+1), and by transitivity along the witnessing chain."
            },
            {
              "id": "c3l3-i5",
              "front": "Lamport's one-directional limitation, and the fix?",
              "back": "C(a)<C(b) does NOT imply a→b (can't detect concurrency). Vector clocks fix it: a→b IFF V(a)<V(b), capturing causality exactly (cost: one counter per process)."
            }
          ]
        }
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
          "id": "c4l1",
          "title": "Partitioning (Sharding)",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Partitioning (sharding)",
              "statement": "**Partitioning** (sharding) splits a dataset across multiple nodes so that the total data and load can exceed any single machine. Each **partition (shard)** holds a disjoint subset of the keys, and a request is routed to the shard owning its key. Partitioning is how you scale *writes* and *storage* horizontally (replication, next lesson, scales reads and availability). The central design choice is the **partitioning scheme** — how keys map to shards — because it determines load balance and which queries stay efficient."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Range vs. hash partitioning",
              "statement": "**Range partitioning** assigns contiguous key ranges to shards (keys 'a–f' → shard 1, 'g–m' → shard 2…). It keeps keys ordered, so **range scans are efficient**, but adjacent hot keys land on the same shard, risking **hotspots**. **Hash partitioning** assigns key k to shard hash(k) mod m, scattering keys uniformly for **even load** — but it **destroys ordering**, so range queries must hit every shard. The choice trades range-query efficiency (range) against load uniformity (hash)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Consistent hashing",
              "statement": "**Consistent hashing** maps both keys and nodes onto a circular hash space (a ring); each key is owned by the next node clockwise. Its purpose is to make *adding or removing a node* cheap: only the keys in the affected arc move, not the whole dataset (unlike hash-mod-m, where changing m remaps almost everything). **Virtual nodes** — placing each physical node at many ring positions — even out the load and the amount of data that moves."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Consistent hashing moves only a 1/(n+1) fraction of keys",
              "statement": "With K keys spread over n nodes by consistent hashing, adding an (n+1)th node remaps in expectation only K/(n+1) keys — a 1/(n+1) fraction — whereas naive hash(k) mod n remaps ≈ all K keys when n changes.",
              "proof": "In consistent hashing a key is owned by the next node clockwise on the ring. Adding a new node at a (uniformly) random ring position only steals the keys lying between it and its clockwise-predecessor node; every other key keeps its owner. With n+1 nodes placed on the ring, the expected fraction of the ring in any one node's arc is 1/(n+1), so the new node captures in expectation K/(n+1) keys — and *only* those move.\n\nContrast naive partitioning: key k lives on node hash(k) mod n. Changing the modulus from n to n+1 changes hash(k) mod (n+1) for almost every k (the residues reshuffle), so ≈ K keys move — a full reshuffle. ∎\n\n**Worked:** going from 4 to 5 nodes, consistent hashing moves ≈ K/5 = 20% of keys; hash-mod moves ≈ 80–100%. Virtual nodes (each physical node at V ring positions) tighten the variance so each node ends up near the K/(n+1) expectation rather than getting unlucky with a large arc. This is why consistent hashing underpins distributed caches and Dynamo-style stores: scaling the cluster shuffles a small, even slice of data."
            },
            {
              "type": "text",
              "heading": "Hotspots and the partition key",
              "body": "The most consequential decision is the **partition key**. A poorly chosen key concentrates load: partitioning a social graph by celebrity creates a single scorching shard (the \"celebrity problem\"); partitioning time-series by timestamp puts all *recent* writes on one shard. Mitigations: hash or salt the key to spread load, split hot keys into sub-keys, or use a compound key. The key must simultaneously **spread load evenly** and **keep your dominant query on a single shard** — those two goals can conflict, and resolving that tension is the heart of shard design."
            },
            {
              "type": "decision",
              "heading": "Choosing a partitioning scheme",
              "rows": [
                [
                  "Range",
                  "Use when range scans / ordered access dominate (time ranges, alphabetical). Watch for hotspots on sequential keys."
                ],
                [
                  "Hash",
                  "Use when point lookups dominate and even load matters most. Range queries become scatter-gather across all shards."
                ],
                [
                  "Consistent hashing (+ vnodes)",
                  "Use when the node set changes often (elastic clusters, caches). Minimizes data movement on scaling; even load via virtual nodes."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The partition key decides your fate.** It fixes both load distribution and which queries are cheap. Choose it to spread load (avoid hot keys) *and* to keep your most frequent query on one shard; when those conflict, you'll often replicate or maintain a secondary index. Re-sharding later is painful — model the access pattern up front."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Hash partitioning spreads keys evenly but loses efficient ___ queries (which range partitioning supports). Fill in the blank and explain why.",
                  "solution": "**range** queries. Hashing scatters adjacent keys across all shards to balance load, which destroys key ordering — so a query for 'all keys between X and Y' can't be served by one shard and must scatter-gather across every shard. Range partitioning keeps keys ordered (and co-located), making such scans efficient, at the cost of hotspot risk."
                },
                {
                  "prompt": "A cache cluster grows from 9 to 10 nodes. Roughly what fraction of keys move under consistent hashing vs. under hash(key) mod n? Why does this matter for a cache?",
                  "solution": "Consistent hashing: ≈ 1/(n+1) = 1/10 = ~10% of keys move (only the new node's arc). Hash-mod-n: changing the modulus from 9 to 10 reshuffles residues, moving ≈ all keys (~90–100%). For a cache this is decisive: a full remap means almost every key is suddenly on the 'wrong' node → a cache miss → a thundering herd of origin fetches right when you scaled. Consistent hashing limits the miss storm to ~10% of keys, keeping the cache warm."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c4l1-i1",
              "front": "What is partitioning/sharding, and what does it scale?",
              "back": "Splitting data across nodes so total data/load exceeds one machine; each shard owns disjoint keys. It scales writes and storage horizontally (replication scales reads/availability)."
            },
            {
              "id": "c4l1-i2",
              "front": "Range vs hash partitioning trade-off?",
              "back": "Range: ordered keys, efficient range scans, but hotspot risk. Hash: even load, but ordering destroyed so range queries scatter across all shards."
            },
            {
              "id": "c4l1-i3",
              "front": "What problem does consistent hashing solve?",
              "back": "Cheap node add/remove: only the keys in the affected ring arc move (≈1/(n+1)), not the whole dataset like hash-mod-m. Virtual nodes even out load and data movement."
            },
            {
              "id": "c4l1-i4",
              "front": "Consistent hashing vs hash-mod on scaling?",
              "back": "Adding the (n+1)th node moves ≈ K/(n+1) keys (one arc) under consistent hashing vs ≈ all K keys under hash(k) mod n (residues reshuffle)."
            },
            {
              "id": "c4l1-i5",
              "front": "Why is the partition key the key decision?",
              "back": "It fixes load distribution (avoid hot keys like celebrities/recent timestamps) AND which queries stay on one shard. Those goals can conflict; re-sharding later is painful."
            }
          ]
        },
        {
          "id": "c4l2",
          "title": "Replication Schemes",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Replication",
              "statement": "**Replication** keeps copies of the same data on multiple nodes. It buys **availability** (a replica can take over when one fails — the parallel composition of Unit 2), **read throughput** (reads spread across replicas), and **locality** (a replica near the user). Its central problem is keeping the copies consistent as writes occur — the consistency models of Lesson 1 are precisely the contracts replication must honor."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Single-leader replication",
              "statement": "In **single-leader** (primary–replica) replication, all writes go to one **leader**, which applies them and streams a replication log to **followers**; reads may be served by any replica. **Synchronous** replication waits for follower(s) to acknowledge before confirming the write (durable, but a slow/failed follower stalls writes); **asynchronous** confirms immediately and replicates in the background (fast and available, but followers lag and a leader crash can lose un-replicated writes). Most systems use *semi-synchronous*: one synchronous follower, the rest async."
            },
            {
              "type": "text",
              "heading": "Replication lag and its anomalies",
              "body": "Asynchronous followers are behind the leader by the **replication lag**, and reading from a lagging follower produces classic anomalies: **read-your-writes** violations (you submit a comment, then a read from a stale follower doesn't show it), **monotonic-read** violations (a refresh shows *older* data than the previous read, because two reads hit followers at different lags), and **causal** violations (you see a reply before the message it answers). Each has a fix — route a user's own reads to the leader or a consistent replica, pin a session to one replica, track causal dependencies — and each fix costs some of the scalability replication was meant to provide."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Multi-leader and leaderless replication",
              "statement": "**Multi-leader**: several nodes accept writes (e.g. one leader per datacenter) and replicate to each other; great for write locality and offline operation, but concurrent writes to the same key on different leaders **conflict** and must be resolved (last-write-wins, CRDTs, or application merge). **Leaderless** (Dynamo-style): clients write to *several* replicas directly and read from several, using **quorums** (next lesson) instead of a leader; highly available and tunable, with conflict detection via version vectors and repair on read."
            },
            {
              "type": "decision",
              "heading": "Replication schemes",
              "rows": [
                [
                  "Single-leader, synchronous",
                  "Strong-ish consistency and durability; writes stall if a synced follower is slow. Reads scale on followers (with lag if async reads allowed)."
                ],
                [
                  "Single-leader, asynchronous",
                  "Fast, available writes; followers lag → stale reads and possible data loss on leader failover. The common default."
                ],
                [
                  "Multi-leader",
                  "Write locality / multi-region / offline; must resolve write–write conflicts (LWW, CRDTs, merge)."
                ],
                [
                  "Leaderless (quorum)",
                  "High availability, tunable consistency via R/W quorums; conflict detection + read repair. AP-leaning (Unit 3)."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Asynchronous replication trades consistency and durability for latency and availability.** Followers lag (stale reads), and a leader crash can lose writes that hadn't replicated yet, so failover risks data loss. Synchronous replication avoids that but pays write latency and can stall on a slow replica. Choose per-write where it matters: critical writes synchronous, the rest async (semi-sync)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A user posts a comment (a write to the leader), then immediately reloads and the comment is missing. Name the anomaly, its cause, and a fix.",
                  "solution": "**Read-your-writes (read-after-write) violation**, caused by the reload being served by an **asynchronous follower** that hasn't yet received the write (replication lag). Fixes: route a user's reads of their *own* data to the leader (or a synchronously-updated replica) for a short window after they write; or track the write's position and only read from a replica caught up past it (read-your-writes consistency). The cost is reduced read-scaling for that user's data."
                },
                {
                  "prompt": "Why do multi-leader and leaderless replication require conflict resolution while single-leader (mostly) does not?",
                  "solution": "With a single leader, all writes are ordered by that one node, so there is a single authoritative sequence — no two writes to a key are accepted 'simultaneously' without an order. Multi-leader and leaderless schemes accept writes at multiple nodes concurrently, so two writes to the same key can be accepted independently with no agreed order → a **conflict**. They must detect it (version/vector clocks) and resolve it (last-write-wins, CRDTs that merge deterministically, or application-level merge). The benefit (write locality / high availability) is paid for with conflict handling."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c4l2-i1",
              "front": "What does replication buy, and what's its core problem?",
              "back": "Availability (failover), read throughput, and locality. Core problem: keeping copies consistent as writes occur (the consistency models are the contracts it must honor)."
            },
            {
              "id": "c4l2-i2",
              "front": "Single-leader: sync vs async replication?",
              "back": "Sync waits for follower ack (durable, but a slow follower stalls writes); async confirms immediately (fast/available, but followers lag and a crash can lose un-replicated writes). Semi-sync mixes them."
            },
            {
              "id": "c4l2-i3",
              "front": "Replication-lag anomalies and fixes?",
              "back": "Read-your-writes (route own reads to leader), monotonic reads (pin session to one replica), causal (track dependencies). Each fix costs some read-scaling."
            },
            {
              "id": "c4l2-i4",
              "front": "Why do multi-leader/leaderless need conflict resolution?",
              "back": "They accept concurrent writes at multiple nodes with no single ordering, so two writes to a key can conflict; resolve via LWW, CRDTs, or app merge (single-leader orders all writes, avoiding this)."
            }
          ]
        },
        {
          "id": "c4l3",
          "title": "Quorums",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Quorum (R, W, N)",
              "statement": "In a leaderless store with **N** replicas per key, a **write** must be acknowledged by **W** replicas and a **read** must gather responses from **R** replicas (the client picks the newest version among them, by timestamp/version vector). R, W, and N are *tunable* knobs that trade consistency, latency, and availability. The quorum conditions below tell you which (R, W) settings actually guarantee freshness."
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "Quorum intersection",
              "statement": "With N replicas, read quorum R, and write quorum W: if **R + W > N**, every read quorum intersects every write quorum, so a read observes at least one replica holding the latest write (read-after-write consistency). Additionally, if **2W > N**, any two write quorums intersect, so conflicting concurrent writes cannot both complete on disjoint replica sets.",
              "proof": "Read and write quorums are subsets of the same N replicas. Suppose a read quorum (R nodes) and a write quorum (W nodes) were **disjoint**; then their union would contain R + W distinct replicas, all drawn from the N available, forcing R + W ≤ N. Contrapositively, **R + W > N** makes disjointness impossible: by pigeonhole the two sets share at least R + W − N ≥ 1 replica. That shared replica received the write and is consulted by the read, so the read sees the latest write (versioning lets the reader select the newest value among the R it gathers).\n\nFor two **write** quorums each of size W: if disjoint they would need 2W ≤ N distinct replicas, so **2W > N** forces them to overlap in at least 2W − N ≥ 1 replica — that common replica sees both writes and serializes them (detecting the conflict), so two concurrent writes cannot each 'succeed' on a fully separate set. ∎\n\n**Note:** R + W > N gives *read-after-write* (a read sees the last completed write); it does not by itself give full linearizability, since concurrent writes still need conflict resolution and reads can interleave — strong consistency needs more (leader/consensus) on top."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "height": 230,
              "caption": "N = 5 replicas. A write quorum W = {n₁, n₂, n₃} (gold) and a read quorum R = {n₃, n₄, n₅} (sage) with R + W = 6 > 5 are forced to overlap — here at n₃ (the intersection), which carries the latest write and is seen by the read. Two disjoint sets would need R + W ≤ N = 5.",
              "nodes": [
                {
                  "id": "n1",
                  "label": "n₁",
                  "x": 10,
                  "y": 50,
                  "tone": "gold",
                  "sub": "W"
                },
                {
                  "id": "n2",
                  "label": "n₂",
                  "x": 30,
                  "y": 50,
                  "tone": "gold",
                  "sub": "W"
                },
                {
                  "id": "n3",
                  "label": "n₃",
                  "x": 50,
                  "y": 50,
                  "tone": "ember",
                  "sub": "R∩W"
                },
                {
                  "id": "n4",
                  "label": "n₄",
                  "x": 70,
                  "y": 50,
                  "tone": "sage",
                  "sub": "R"
                },
                {
                  "id": "n5",
                  "label": "n₅",
                  "x": 90,
                  "y": 50,
                  "tone": "sage",
                  "sub": "R"
                }
              ],
              "edges": []
            },
            {
              "type": "text",
              "heading": "Tunable consistency and its companions",
              "body": "R, W, N let you tune the trade-off. **W = N, R = 1**: fast reads, durable writes, but a single slow/dead replica blocks writes. **W = 1, R = N**: fast available writes, slow reads, weak durability. The common **balanced** choice for an odd N is R = W = ⌈(N+1)/2⌉ (a majority), which satisfies both R + W > N and 2W > N. Real systems add **sloppy quorums** + **hinted handoff** (accept writes on substitute nodes during failures, hand them back later) for availability, and **read repair** / anti-entropy to converge stale replicas in the background."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**R + W > N is necessary for read-after-write, not sufficient for linearizability.** The intersection guarantees a read *sees* the latest completed write, but concurrent writes still need conflict resolution (versioning/merge), and without a single ordering point, edge interleavings can still violate strict linearizability. Quorums give tunable, mostly-strong consistency cheaply; true linearizability needs a leader or consensus."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A leaderless store has N = 5 replicas. Using symmetric quorums R = W with R + W > N for read-after-write consistency, what is the smallest R = W that works? Separately, what is the minimum write quorum W satisfying 2W > N?",
                  "solution": "Symmetric read-after-write: R = W with R + W > N means 2R > 5, so R > 2.5, i.e. R = W = **3** (the smallest integer). Write–write overlap: 2W > N = 5 means W > 2.5, so minimum W = **3**. (For odd N = 5, the majority ⌈(N+1)/2⌉ = 3 satisfies both conditions — the standard balanced quorum.)"
                },
                {
                  "prompt": "Prove that with N = 6, R = 3, W = 3, a read can miss the latest write — and give the smallest change that fixes it.",
                  "solution": "R + W = 3 + 3 = 6 = N, which is *not* > N. The quorum-intersection proof needs R + W > N to force overlap; at R + W = N the read and write quorums can be **disjoint** (e.g. write to {n₁,n₂,n₃}, read from {n₄,n₅,n₆}), so the read sees none of the write — stale. Smallest fix: increase either quorum by one so R + W = 7 > 6, e.g. R = 4 (or W = 4), restoring a guaranteed ≥ R + W − N = 1 shared replica."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c4l3-i1",
              "front": "What are R, W, N in a quorum store?",
              "back": "N replicas per key; a write needs W acks, a read gathers R responses (picking the newest version). R, W, N are tunable knobs trading consistency, latency, availability."
            },
            {
              "id": "c4l3-i2",
              "front": "Quorum intersection conditions and what each guarantees?",
              "back": "R+W>N ⇒ every read quorum meets every write quorum (read-after-write). 2W>N ⇒ any two write quorums overlap (no conflicting concurrent writes on disjoint sets). Proof: pigeonhole on N replicas."
            },
            {
              "id": "c4l3-i3",
              "front": "N=5 smallest symmetric R=W for read-after-write?",
              "back": "R=W=3 (need 2R>5 ⇒ R≥3). Also minimum W for 2W>5 is 3 — the majority ⌈(N+1)/2⌉."
            },
            {
              "id": "c4l3-i4",
              "front": "Does R+W>N give linearizability?",
              "back": "No — only read-after-write (a read sees the latest completed write). Concurrent writes still need conflict resolution; strict linearizability needs a leader/consensus on top."
            },
            {
              "id": "c4l3-i5",
              "front": "Sloppy quorum + hinted handoff?",
              "back": "During failures, accept writes on substitute replicas (sloppy quorum) and hand them back to the right nodes when they recover (hinted handoff) — trades strict quorum for availability."
            }
          ]
        }
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
          "id": "c5l1",
          "title": "Why & Where to Cache",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Cache",
              "statement": "A **cache** is a fast, usually smaller store holding copies of frequently-accessed data, placed in front of a slower or more expensive source (a database, a remote service, disk). A request that finds its data in the cache is a **hit** (fast); one that doesn't is a **miss** and must pay the full cost of fetching from the source. Caching trades a little memory and the risk of staleness for large reductions in **latency** and backend **load** — the single highest-leverage performance technique in most systems."
            },
            {
              "type": "text",
              "heading": "The cache hierarchy: where to put it",
              "body": "Caches appear at every layer, each closer to the user and faster than the last: the **client/browser** (avoid the network entirely), the **CDN/edge** (Lesson 3), a shared **in-memory cache** (Redis/Memcached) in front of the database, an **application/local** cache in the process, and the database's own **buffer pool**. This mirrors the hardware memory hierarchy (registers → L1/L2/L3 → RAM → disk): each level is faster and smaller, and a hit at a higher level avoids the cost of every level below it. Cache as close to the consumer as correctness allows."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Effective latency of a cache",
              "statement": "For a cache with hit ratio h, hit latency t_hit, and miss latency t_miss, the average (effective) latency is\n\n  L_eff = h·t_hit + (1 − h)·t_miss = t_hit + (1 − h)(t_miss − t_hit).\n\nBecause t_miss ≫ t_hit, L_eff is dominated by the *miss* term unless h is very close to 1 — so the last few percent of hit ratio matter enormously.",
              "proof": "A fraction h of requests hit (cost t_hit) and the remaining 1 − h miss (cost t_miss). The expected latency is the probability-weighted average of the two outcomes: L_eff = h·t_hit + (1 − h)·t_miss. Factoring, L_eff = t_hit + (1 − h)(t_miss − t_hit), which shows the cache saves (t_miss − t_hit) on each hit, for a speedup of t_miss / L_eff over no cache. ∎\n\n**Worked:** h = 0.90, t_hit = 2 ms, t_miss = 100 ms ⟹ L_eff = 0.9×2 + 0.1×100 = 1.8 + 10 = **11.8 ms**. Notice the 10% of misses contribute 10 ms while the 90% of hits contribute only 1.8 ms — *misses dominate*. To hit a target of 6.9 ms, solve 2h + 100(1 − h) = 6.9 ⟹ 100 − 98h = 6.9 ⟹ h = **0.95**: pushing the hit ratio from 90% to 95% nearly halves effective latency. That asymmetry — small hit-ratio gains yielding large latency wins — is the central fact of cache tuning."
            },
            {
              "type": "text",
              "heading": "Why a small cache works: locality and the working set",
              "body": "Caches pay off because access is not uniform — it exhibits **locality**. *Temporal* locality: recently-used items are likely to be used again soon. *Spatial* locality: items near a used item are likely to be used. And real workloads are heavily skewed (often Zipfian/power-law): a small fraction of keys serve most requests. Consequently a cache only large enough to hold the hot **working set** can serve a high hit ratio with little memory — the classic \"20% of the items get 80% of the traffic.\" Sizing a cache is really about capturing the working set, not the whole dataset."
            },
            {
              "type": "decision",
              "heading": "Where to cache",
              "rows": [
                [
                  "Client / browser",
                  "Fastest (no network), but per-user and hard to invalidate. For static assets and user-private data."
                ],
                [
                  "CDN / edge",
                  "Cuts the distance to the user (Lesson 3). For static and cacheable content close to the audience."
                ],
                [
                  "Shared in-memory (Redis/Memcached)",
                  "One warm cache for all app servers, in front of the DB. The workhorse for hot reads."
                ],
                [
                  "Application/local",
                  "In-process, nanosecond access, but duplicated per server and not shared. For tiny, very hot data."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The miss tail dominates — chase hit ratio, but watch the misses.** Because L_eff = h·t_hit + (1−h)·t_miss with t_miss ≫ t_hit, a 90%→95% hit-ratio improvement can halve latency, while a cache with a mediocre hit ratio barely helps (and adds a layer). Measure your hit ratio; if it's low, the cache isn't earning its keep — fix the working-set fit or the access pattern."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A cache has a 90% hit ratio; hits take 2 ms, misses take 100 ms. Compute the average (effective) latency.",
                  "solution": "L_eff = h·t_hit + (1 − h)·t_miss = 0.90 × 2 + 0.10 × 100 = 1.8 + 10 = 11.8 ms. (The 10% of misses contribute 10 of those 11.8 ms — the miss tail dominates.)"
                },
                {
                  "prompt": "With hit latency 2 ms and miss latency 100 ms, what hit ratio h gives an average latency of 6.9 ms? Solve 2h + 100(1 − h) = 6.9.",
                  "solution": "2h + 100 − 100h = 6.9 ⟹ 100 − 98h = 6.9 ⟹ 98h = 93.1 ⟹ h = 0.95 (95%). Going from 90% to 95% hit ratio drops effective latency from 11.8 ms to 6.9 ms — a 5-point hit-ratio gain nearly halves latency, illustrating the leverage of the miss tail."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c5l1-i1",
              "front": "What is a cache and what does it trade?",
              "back": "A fast store of copies of hot data in front of a slower source; hits are fast, misses pay full cost. Trades memory + staleness risk for big latency/load reductions."
            },
            {
              "id": "c5l1-i2",
              "front": "Effective latency formula?",
              "back": "L_eff = h·t_hit + (1−h)·t_miss = t_hit + (1−h)(t_miss − t_hit). Dominated by misses since t_miss ≫ t_hit."
            },
            {
              "id": "c5l1-i3",
              "front": "Why does a small hit-ratio gain help so much?",
              "back": "Misses cost t_miss ≫ t_hit, so they dominate L_eff; cutting the miss fraction (e.g. 90%→95%) sharply lowers latency (11.8 ms → 6.9 ms in the worked case)."
            },
            {
              "id": "c5l1-i4",
              "front": "Why does a small cache achieve a high hit ratio?",
              "back": "Access has locality (temporal/spatial) and is skewed (Zipf/power-law) — a small hot working set serves most requests, so caching it captures most of the benefit."
            }
          ]
        },
        {
          "id": "c5l2",
          "title": "Strategies & Invalidation",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Cache-aside (lazy loading)",
              "statement": "In the **cache-aside** pattern the *application* manages the cache: on a read it first checks the cache; on a **hit** it returns the cached value; on a **miss** it loads from the database, **populates the cache**, and returns. The cache is filled lazily, only with data actually requested, and the application code (not the cache) owns the read-through logic. It's the most common pattern because it's simple and only caches what's used."
            },
            {
              "type": "decision",
              "heading": "Read and write strategies",
              "rows": [
                [
                  "Cache-aside (lazy read)",
                  "App checks cache, loads from DB on miss and populates. Only caches what's requested; first access always misses."
                ],
                [
                  "Read-through",
                  "The cache itself loads from the DB on a miss (the app talks only to the cache). Cleaner, but couples to a cache that knows the source."
                ],
                [
                  "Write-through",
                  "Writes go to cache and DB synchronously — cache always fresh, write latency higher."
                ],
                [
                  "Write-back (write-behind)",
                  "Write to cache, flush to DB asynchronously — fast writes, but risk of data loss if the cache dies before flush."
                ],
                [
                  "Write-around",
                  "Writes go straight to the DB, bypassing the cache — avoids caching write-only data, but the next read misses."
                ]
              ]
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Cache invalidation",
              "statement": "**Cache invalidation** is keeping cached copies consistent with the source as the source changes — removing or refreshing entries that have gone stale. It is famously the hardest problem in caching (\"there are only two hard things in computer science: cache invalidation and naming things\"). The tools — **TTL** (expire after a time), **explicit invalidation** (delete/update on write), and **versioning** (key by version) — each trade *freshness* against *load* and *complexity*, and connect directly to the consistency models of Unit 3."
            },
            {
              "type": "text",
              "heading": "The freshness–load trade",
              "body": "Every invalidation strategy sits on a spectrum. A long **TTL** maximizes hit ratio and offloads the source but serves stale data for up to the TTL; a short TTL is fresher but pushes more misses to the origin. **Explicit invalidation** on write is fresher but couples writers to the cache and is hard to get right across many cache copies and races. Pure caching can give you at best *eventual* consistency with the source (stale within the TTL window); if you need read-your-writes, you must invalidate or update on write and accept the coupling. Choose the *staleness bound* your application can tolerate, then pick the cheapest strategy that meets it."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Cache stampede (thundering herd)",
              "statement": "When a hot key expires, every concurrent request for it misses at once and hits the origin simultaneously: if N requests for the key arrive during the miss-refill window, the origin sees up to **N** simultaneous loads instead of 1 — a stampede that can overload the backend exactly when the cache was supposed to protect it.",
              "proof": "Suppose a key receives requests at rate r and the time to recompute/refetch it on a miss is T. The moment the entry expires, every request arriving during the refill interval of length T finds the entry empty (it isn't repopulated until the first load finishes), so all ≈ r·T of them miss and independently call the origin. For a hot key, r·T can be hundreds or thousands of concurrent origin loads from a *single* expiry. ∎\n\n**Mitigations:** (1) **request coalescing / single-flight** — let only the first miss fetch while the others wait for its result, collapsing N loads to 1; (2) **probabilistic early expiration** — refresh slightly before the TTL with a small random probability, so one request refills ahead of the herd; (3) a short **lock/lease** on the key so only one loader proceeds. All cap origin load at ≈ 1 per key per refill."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Cache invalidation is the hard part — design for a staleness bound, and defend against stampedes.** Decide how stale a read may be (it's a Unit-3 consistency choice), pick TTL/explicit-invalidation accordingly, and add single-flight or early-refresh so a hot key's expiry doesn't dump a thundering herd on the origin. A cache that collapses under its own miss storm is worse than no cache."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Describe the cache-aside read path on a hit and on a miss, and name one downside of the pattern.",
                  "solution": "On a **hit**: the app checks the cache, finds the value, returns it (no DB access). On a **miss**: the app checks the cache, finds nothing, loads the value from the database, writes it into the cache, and returns it. Downside: the *first* request for any key always misses (cold cache / lazy population), and the app must implement the load-and-populate logic and handle invalidation itself; also, stale data persists until TTL or explicit invalidation."
                },
                {
                  "prompt": "The hardest problem in caching is keeping cached data fresh — i.e. cache ____. Fill in the blank, and explain why a hot key expiring can overload the database.",
                  "solution": "cache **invalidation**. A hot key expiring causes a **stampede (thundering herd)**: all the concurrent requests for that key miss simultaneously during the refill window and each independently queries the database, so the origin sees up to N simultaneous loads instead of 1 — a spike that can overload the backend precisely when the cache was meant to shield it. Mitigate with request coalescing/single-flight, probabilistic early expiration, or a per-key lease."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c5l2-i1",
              "front": "Cache-aside (lazy loading) read path?",
              "back": "App checks cache; on hit returns it; on miss loads from DB, populates the cache, returns. App owns the logic; only caches requested data; first access misses."
            },
            {
              "id": "c5l2-i2",
              "front": "Write-through vs write-back?",
              "back": "Write-through: write cache + DB synchronously (always fresh, slower writes). Write-back: write cache, flush to DB async (fast, risk loss if cache dies first)."
            },
            {
              "id": "c5l2-i3",
              "front": "Why is cache invalidation hard, and the freshness trade?",
              "back": "Keeping copies consistent with a changing source across races/copies. Long TTL = high hit ratio but stale; short TTL/explicit invalidation = fresher but more load/coupling. Pick a tolerable staleness bound."
            },
            {
              "id": "c5l2-i4",
              "front": "Cache stampede and mitigations?",
              "back": "A hot key expires → all concurrent requests miss and hit the origin at once (up to N loads). Mitigate: single-flight/request coalescing, probabilistic early expiration, per-key lock/lease."
            }
          ]
        },
        {
          "id": "c5l3",
          "title": "CDNs & the Edge",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Content Delivery Network (CDN)",
              "statement": "A **CDN** is a geographically distributed network of **edge** cache servers that serve content from a location physically close to each user. By terminating requests near the user, a CDN cuts round-trip latency, offloads the origin, and absorbs traffic spikes (including DDoS). CDNs cache **static and cacheable** content (images, video, JS/CSS, API responses with appropriate headers); dynamic/personalized content needs other techniques (edge compute, or just origin fetch)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Pull vs. push CDNs",
              "statement": "A **pull (origin-fetch)** CDN populates an edge lazily: on the first request for an object at an edge, the edge **fetches it from the origin** (a miss), caches it, and serves subsequent requests locally until it expires — cache-aside at the edge. A **push** CDN is populated proactively: you upload content to the edges ahead of demand. Pull is simpler and self-managing (popular content naturally caches); push gives control for large or latency-critical assets you know will be needed."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The speed-of-light latency floor",
              "statement": "Network latency has a hard physical floor set by propagation. A signal travels through fiber at c_fiber ≈ 2×10⁸ m/s (about ⅔ of c), so the one-way delay over distance d is d / c_fiber and the round trip is RTT ≈ 2d / c_fiber — independent of bandwidth or server speed. The *only* way to beat the distance floor is to shrink d by serving from a nearby edge.",
              "proof": "Latency over a link is bounded below by propagation time = distance / signal speed; no amount of bandwidth or compute reduces it. In optical fiber the signal speed is ≈ 2×10⁸ m/s, giving one-way delay d/(2×10⁸) seconds, doubled for a round trip. ∎\n\n**Worked:** a user 3,000 km from the origin: one-way = 3×10⁶ m / 2×10⁸ m/s = 0.015 s = 15 ms, so RTT ≈ **30 ms** before any processing. A CDN edge 100 km away: one-way = 10⁵ / 2×10⁸ = 0.5 ms, RTT ≈ **1 ms** — a ~30× reduction in the unavoidable distance floor. This is *why* CDNs exist: for a globally-distributed audience, no server optimization can overcome 30 ms of physics, but moving the content 100 km away can."
            },
            {
              "type": "text",
              "heading": "What the edge can and can't do",
              "body": "The edge excels at cacheable content: serve it once from origin, then a million times from nearby caches, cutting both latency (the speed-of-light floor) and origin load. It struggles with **dynamic, personalized, or write** traffic, which can't be shared across users and must reach an authoritative origin. The modern answer is **edge compute** — running small amounts of logic (auth, personalization, A/B routing) at the edge — and careful **cache-control headers** to mark what's cacheable, for how long, and per which key (vary). Decide, per response, whether it's shareable; only shareable content benefits from the edge."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**You can't out-engineer the speed of light — you can only move closer.** For a global audience, processing optimizations can't overcome tens of milliseconds of propagation; an edge near the user is the only lever on the distance floor. Push cacheable content to the edge; keep dynamic/personalized logic minimal there (edge compute) and route the rest to a nearby region."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A pull (origin-fetch) CDN populates an edge location by doing what on the first request?",
                  "solution": "On the first request for an object at that edge (a cache miss), the edge **fetches the object from the origin server**, stores (caches) it locally, and serves it; subsequent requests for the same object are served from the edge cache until it expires. It's cache-aside applied at the edge — content populates lazily, driven by actual demand."
                },
                {
                  "prompt": "A user is 6,000 km from the origin. Estimate the round-trip propagation latency (c_fiber ≈ 2×10⁸ m/s). How much does an edge 150 km away reduce it?",
                  "solution": "Origin: one-way = 6×10⁶ m / 2×10⁸ m/s = 0.03 s = 30 ms, so RTT ≈ 60 ms. Edge 150 km: one-way = 1.5×10⁵ / 2×10⁸ = 0.75 ms, RTT ≈ 1.5 ms. The edge cuts the propagation floor from ~60 ms to ~1.5 ms — a ~40× reduction — which no server-side optimization could achieve, since it's pure distance/physics."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c5l3-i1",
              "front": "What is a CDN and what does it cache?",
              "back": "A geographically distributed network of edge caches serving content close to users — cuts RTT, offloads origin, absorbs spikes. Caches static/cacheable content; dynamic needs edge compute or origin."
            },
            {
              "id": "c5l3-i2",
              "front": "Pull vs push CDN?",
              "back": "Pull (origin-fetch): edge lazily fetches from origin on first request (cache-aside at the edge). Push: you upload content to edges proactively."
            },
            {
              "id": "c5l3-i3",
              "front": "The speed-of-light latency floor?",
              "back": "RTT ≈ 2d/c_fiber with c_fiber ≈ 2×10⁸ m/s — independent of bandwidth/compute. 3,000 km ≈ 30 ms RTT; a 100 km edge ≈ 1 ms. Only shrinking distance helps."
            },
            {
              "id": "c5l3-i4",
              "front": "Why can't the edge cache everything?",
              "back": "Dynamic/personalized/write traffic isn't shareable across users and needs an authoritative origin. Use edge compute for light logic and cache-control headers to mark what's shareable."
            }
          ]
        }
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
          "id": "c6l1",
          "title": "Why Asynchronous",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Synchronous coupling vs. asynchronous decoupling",
              "body": "A **synchronous** call blocks the caller until the callee responds, binding their fates: if the callee is slow or down, the caller is too, and a chain of synchronous calls multiplies latency and *divides* availability (Unit 2's series composition). **Asynchronous** messaging breaks that bond: the producer hands a message to a broker/queue and moves on; the consumer processes it independently, whenever it can. This decoupling in *time* (they needn't be up together), *space* (they needn't know each other), and *rate* (they needn't run at the same speed) is the foundation of resilient, scalable architectures."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Message queue / broker",
              "statement": "A **message queue** (or broker) sits between a **producer** and a **consumer**, accepting messages from the producer and holding them until the consumer processes them. It provides **decoupling** (producer and consumer are independent and can scale, deploy, and fail separately), **buffering** (absorbing bursts so the consumer sees a smoothed rate), and **durability** (messages survive a consumer outage). The producer's only dependency is the broker — not the consumer."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The queue as a buffer (load leveling)",
              "statement": "A queue lets a consumer provisioned for the *average* rate μ survive bursts above μ: during a burst of arrival rate λ_peak > μ for duration T, the queue absorbs the excess, growing by ≈ (λ_peak − μ)·T messages, then drains afterward. By Little's Law the consumer's in-flight work stays bounded by its own capacity while the queue holds the backlog — so you size compute for the mean and the queue for the peak.",
              "proof": "Queue depth changes at rate (arrival − service) = λ(t) − μ. During a burst where λ_peak > μ for time T, depth rises by ∫(λ_peak − μ) dt = (λ_peak − μ)·T; once λ drops back below μ, depth falls at rate (μ − λ) until empty. So a *temporary* overload is converted into a *backlog* the consumer works off at its steady rate μ, rather than overwhelming it — provided the long-run average arrival rate is ≤ μ (else the queue grows without bound; Lesson 3). The consumer's own concurrency is governed by Little's Law L = μ·W, independent of the burst. ∎\n\n**Worked:** a consumer handles μ = 100 msg/s; a flash sale drives λ_peak = 500 msg/s for T = 10 s. The queue absorbs (500 − 100)×10 = 4,000 messages, then drains them at 100/s over the next 40 s — the consumer never sees more than its rated 100/s. Without the queue, the synchronous path would have dropped or timed out 80% of the burst."
            },
            {
              "type": "decision",
              "heading": "Synchronous vs. asynchronous",
              "rows": [
                [
                  "Synchronous (request/response)",
                  "Use when the caller needs the result now (a user awaiting an answer). Simple, but couples availability/latency in series."
                ],
                [
                  "Asynchronous (message/event)",
                  "Use for work that can happen later (emails, processing, fan-out), to absorb bursts, and to decouple services. Adds eventual consistency and ordering/duplicate handling."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Async isn't free — it buys decoupling with complexity.** You inherit eventual consistency (the effect happens *later*), out-of-order and duplicate delivery (Lesson 2), harder debugging (no single call stack), and the need to monitor queue depth and consumer lag. Use it where the work genuinely can be deferred or smoothed; don't make a user-facing read asynchronous just to \"decouple.\""
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A message queue between a producer and a consumer primarily provides what?",
                  "solution": "**Decoupling and buffering** (plus durability): the producer and consumer become independent — they can scale, deploy, and fail separately (the producer depends only on the broker, not the consumer) — and the queue absorbs bursts, holding messages until the consumer can process them at its own rate, so a temporary spike or a consumer outage doesn't drop work."
                },
                {
                  "prompt": "A consumer processes 200 msg/s. A burst arrives at 1,000 msg/s for 5 seconds. How many messages back up in the queue, and how long to drain after the burst (assuming steady 200/s arrivals resume)?",
                  "solution": "Backlog accumulated = (λ_peak − μ)·T = (1,000 − 200) × 5 = 4,000 messages. After the burst, if arrivals return to ≤ 200/s the consumer drains the backlog at its surplus rate; if arrivals are ~200/s (= μ) the surplus is ~0 and it never drains — so assume arrivals drop below 200/s, e.g. to ~0 briefly: drain time = 4,000 / 200 = 20 s. Key point: the queue converted a 5× overload into a bounded 4,000-message backlog the consumer clears at its rated 200/s, instead of dropping 80% of the burst."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c6l1-i1",
              "front": "Synchronous vs asynchronous coupling?",
              "back": "Sync blocks the caller on the callee (couples latency/availability in series). Async hands work to a broker and decouples in time, space, and rate — the basis of resilient/scalable design."
            },
            {
              "id": "c6l1-i2",
              "front": "What does a message queue provide?",
              "back": "Decoupling (producer/consumer independent, scale/fail separately), buffering (absorb bursts), and durability (survive consumer outages). The producer depends only on the broker."
            },
            {
              "id": "c6l1-i3",
              "front": "How does a queue do load leveling?",
              "back": "During a burst λ_peak>μ for time T it absorbs ≈(λ_peak−μ)·T messages, then drains at μ — so you size compute for the mean and the queue for the peak (works only if long-run λ ≤ μ)."
            },
            {
              "id": "c6l1-i4",
              "front": "What does async cost you?",
              "back": "Eventual consistency (effects happen later), out-of-order/duplicate delivery, harder debugging (no single stack), and the need to monitor queue depth/consumer lag."
            }
          ]
        },
        {
          "id": "c6l2",
          "title": "The Log & Delivery Semantics",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The log",
              "statement": "A **log** is an append-only, totally-ordered, durable sequence of records; consumers read it in order and track their position with an **offset**. Unlike a queue that deletes a message once consumed, a log *retains* records, so **many independent consumers** can read at their own pace, **replay** from any offset (reprocess history, bootstrap a new consumer), and rely on a single agreed **order**. The log (Kafka; Kreps's \"The Log\") is the backbone of event-driven systems and stream processing."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Delivery semantics",
              "statement": "Three guarantees a messaging system can offer: **at-most-once** (each message delivered zero or one times — may be *lost*, never duplicated); **at-least-once** (delivered one or more times — never lost, may be *duplicated*); and **exactly-once** (delivered precisely once — neither lost nor duplicated). At-most-once needs no retries (fire and forget); at-least-once retries until acknowledged; exactly-once *delivery* is the seductive ideal that, as the next result shows, is unachievable in general."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Why exactly-once delivery is impossible (and what to do instead)",
              "statement": "In an asynchronous network where messages and acknowledgments can be lost, a sender cannot guarantee exactly-once *delivery*. When an ack fails to arrive, it must either retransmit (risking a duplicate) or not (risking loss) — it cannot do neither. The practical resolution is **at-least-once delivery + idempotent processing**, which yields exactly-once *effect* on state.",
              "proof": "A sender transmits a message and waits for an acknowledgment. If no ack arrives, two situations are **indistinguishable** to it: (i) the message was lost before delivery, or (ii) the message was delivered but the *ack* was lost. Under asynchrony with message loss the sender cannot tell which occurred, so any fixed policy errs in one case — retransmitting double-delivers in case (ii), while giving up loses the message in case (i). No protocol escapes this dichotomy (it is the two-generals problem). Hence exactly-once *delivery* is impossible.\n\nThe fix decouples *delivery* from *effect*: deliver **at-least-once** (retry until acked, accepting possible duplicates) and make the consumer **idempotent** — processing the same message twice has the same effect as once — via a dedup/idempotency key. Then duplicates are harmless and the *observable state* changes exactly once. ∎"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Idempotency",
              "statement": "An operation is **idempotent** if applying it more than once has the same effect as applying it once. With at-least-once delivery (duplicates possible), consumers must be idempotent — e.g. tag each message with a unique **idempotency key** and record processed keys so a re-delivered message is recognized and skipped, or design the operation to be naturally idempotent (SET x = 5 is; INCREMENT x is not). Idempotency is what turns unavoidable duplicates into a non-problem."
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "At-least-once delivery + an idempotent consumer = exactly-once effect. The lost ack forces the broker to re-deliver message 42 (a possible duplicate), but the consumer recognizes the idempotency key and treats the re-delivery as a no-op — so processing 42 twice changes state exactly once. Exactly-once delivery is impossible; exactly-once effect is not.",
              "actors": [
                "Producer",
                "Broker",
                "Consumer"
              ],
              "messages": [
                {
                  "from": "Producer",
                  "to": "Broker",
                  "label": "send(msg, id=42)",
                  "tone": "sage"
                },
                {
                  "from": "Broker",
                  "to": "Consumer",
                  "label": "deliver(42)",
                  "tone": "sage"
                },
                {
                  "note": "Consumer processes 42, records id 42 as done"
                },
                {
                  "note": "✂ ack lost — Broker can't tell 'delivered' from 'lost'"
                },
                {
                  "from": "Broker",
                  "to": "Consumer",
                  "label": "re-deliver(42)",
                  "tone": "ember",
                  "dashed": true
                },
                {
                  "note": "id 42 already processed → idempotent no-op"
                },
                {
                  "from": "Consumer",
                  "to": "Broker",
                  "label": "ack(42)",
                  "tone": "sage",
                  "dashed": true
                }
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't chase exactly-once delivery — engineer for at-least-once + idempotency.** Since the lost-ack ambiguity makes exactly-once delivery impossible, the robust design is to retry until acknowledged and make every consumer idempotent (dedup by idempotency key, or use naturally idempotent operations). \"Exactly-once\" products achieve exactly-once *effect* this way (often with transactional offset commits), not magic delivery."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "At-least-once delivery means what? And why should consumers therefore be idempotent?",
                  "solution": "At-least-once means each message is delivered **one or more times** — it is never lost, but may be **duplicated** (because the sender retries when an ack is missing). Consumers must therefore be **idempotent** — processing a duplicate has the same effect as processing it once — so that the inevitable redeliveries don't double-charge, double-ship, or double-count. Idempotency (via a dedup/idempotency key or naturally idempotent operations) turns unavoidable duplicates into harmless no-ops."
                },
                {
                  "prompt": "Explain why 'exactly-once delivery' is famously hard in distributed systems, and how real systems achieve exactly-once *effect*.",
                  "solution": "Exactly-once *delivery* is impossible because of the lost-ack ambiguity: when the sender gets no acknowledgment, it cannot distinguish 'the message was lost' from 'the message arrived but the ack was lost' (asynchrony + message loss). Retransmitting risks a duplicate; not retransmitting risks a loss — no policy is always right (the two-generals problem). Real systems instead achieve exactly-once *effect* by combining **at-least-once delivery** (retry until acked, tolerating duplicates) with **idempotent processing** (dedup by idempotency key, or transactional 'process-and-commit-offset' so a message's effect and its acknowledgment commit atomically). Duplicates still occur on the wire, but the observable state changes exactly once."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c6l2-i1",
              "front": "What is a log (vs a queue)?",
              "back": "An append-only, ordered, durable, replayable sequence; consumers track an offset and records are retained — so many consumers can read independently and replay from any offset (a queue deletes on consume)."
            },
            {
              "id": "c6l2-i2",
              "front": "The three delivery semantics?",
              "back": "At-most-once (≤1, may lose), at-least-once (≥1, may duplicate), exactly-once (precisely 1 — unachievable as delivery in general)."
            },
            {
              "id": "c6l2-i3",
              "front": "Why is exactly-once delivery impossible?",
              "back": "On a missing ack the sender can't distinguish 'message lost' from 'ack lost' (asynchrony + loss); retry risks a duplicate, not retrying risks loss — no policy is always right (two-generals)."
            },
            {
              "id": "c6l2-i4",
              "front": "How is exactly-once EFFECT achieved?",
              "back": "At-least-once delivery + idempotent processing: retry until acked, and make a duplicate a no-op (dedup by idempotency key, or transactional process+offset commit). State changes exactly once."
            },
            {
              "id": "c6l2-i5",
              "front": "What is idempotency, and an example?",
              "back": "Applying an operation twice = applying it once. SET x=5 is idempotent; INCREMENT x is not. Consumers under at-least-once must be idempotent (dedup keys)."
            }
          ]
        },
        {
          "id": "c6l3",
          "title": "Event Sourcing, CQRS & Backpressure",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Event sourcing",
              "statement": "**Event sourcing** stores, as the source of truth, the *full ordered sequence of state-changing events* rather than only the current state. Current state is derived by **replaying** (folding) the events. So instead of UPDATE balance = 90, you append a Withdrew(10) event; the balance is the sum of all such events. This yields a complete **audit log**, the ability to **rebuild** state or new projections by replay, and **temporal queries** (\"what was the state at time T?\") — at the cost of more complexity and the need to handle event-schema evolution."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "CQRS (Command Query Responsibility Segregation)",
              "statement": "**CQRS** separates the **write model** (commands that validate and produce events) from the **read model** (queries served by **projections** — denormalized views built for fast reads). The read side is derived from the write side's events, often **asynchronously**, so the read model is *eventually consistent* with the writes. CQRS pairs naturally with event sourcing: events are the write log, and any number of read projections are folded from them, each optimized for a particular query."
            },
            {
              "type": "text",
              "heading": "Why separate reads from writes",
              "body": "Reads and writes have opposite needs: writes want a normalized, validated, consistent model; reads want denormalized, query-shaped, fast views — and there are usually far more reads than writes. CQRS lets each scale and evolve independently: add new read projections without touching the write model, scale the read side horizontally, and serve each query from a purpose-built view. The price is **eventual consistency** between write and read sides (a just-written value may not yet appear in a projection) and the operational cost of maintaining projections — a direct application of Unit 3's consistency trade-offs."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Backpressure: why queues must be bounded",
              "statement": "If the sustained arrival rate λ exceeds the consumer's service rate μ, an *unbounded* queue grows without limit — its depth diverges and eventually exhausts memory — exactly as an M/M/1 queue is unstable for ρ = λ/μ ≥ 1 (Unit 1). A **bounded** queue with **backpressure** caps the depth by pushing back on producers (blocking, slowing, or shedding load), forcing the effective arrival rate down to μ and restoring stability.",
              "proof": "Queue depth changes at rate λ − μ. If λ > μ is sustained, depth grows at the positive rate λ − μ without bound (the backlog L(t) ≈ (λ − μ)·t → ∞), so an unbounded in-memory queue consumes all memory and the system crashes — the failure is merely *delayed*, not avoided, by adding buffer. Bounding the queue at capacity Q forces a decision when full: reject, block, or drop incoming work. Any of these lowers the *accepted* arrival rate to at most the drain rate μ, so λ_eff ≤ μ and the depth stops growing — stability is restored at the cost of rejected/delayed producers (the **backpressure** signal). ∎\n\nThe lesson: an unbounded queue doesn't prevent overload, it *hides* it until a catastrophic crash. Bound every queue and propagate backpressure so overload degrades gracefully (Unit 8) instead of exploding."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**An unbounded queue is a time bomb.** It masks the fact that λ > μ — latency and memory climb silently until an out-of-memory crash takes everything down at once. Always bound queues and apply backpressure (block/throttle/shed) so a sustained overload surfaces early and degrades gracefully, rather than detonating later."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Event sourcing stores what, and name one benefit and one cost versus storing current state.",
                  "solution": "It stores the **full ordered sequence of state-changing events** (not just the current state); current state is derived by replaying the events. **Benefit:** a complete audit log plus the ability to rebuild state or new read projections by replay and to ask temporal queries ('state as of time T?'). **Cost:** added complexity — you must replay/fold events to get state, manage event-schema evolution over time, and often snapshot to keep replay fast."
                },
                {
                  "prompt": "A producer sends to a consumer through an in-memory queue with no size limit, and sustained load pushes arrivals above the consumer's throughput. What happens, and how does backpressure fix it?",
                  "solution": "With sustained λ > μ, the queue depth grows without bound at rate λ − μ (the system is unstable, ρ ≥ 1), latency and memory climb, and eventually the process runs out of memory and crashes — taking the work with it. The unbounded queue only *delayed* the overload. **Backpressure** fixes it by bounding the queue: when full, the system blocks, throttles, or sheds incoming work, dropping the accepted arrival rate to ≤ μ so depth stops growing. Overload then surfaces immediately as graceful slowdown/rejection (which upstream can react to) instead of a silent climb to a catastrophic crash."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c6l3-i1",
              "front": "What does event sourcing store?",
              "back": "The full ordered sequence of state-changing events as the source of truth; current state = replay/fold of events. Gives audit log, replay/rebuild, temporal queries; costs complexity + schema evolution."
            },
            {
              "id": "c6l3-i2",
              "front": "What is CQRS?",
              "back": "Separating the write model (commands → events) from the read model (denormalized projections), with reads derived (often async) from writes — so each scales/evolves independently, at the cost of eventual consistency."
            },
            {
              "id": "c6l3-i3",
              "front": "Why must queues be bounded (backpressure)?",
              "back": "If sustained λ>μ, an unbounded queue grows without limit (unstable, ρ≥1) and OOM-crashes — overload is hidden, not avoided. A bounded queue + backpressure forces λ_eff≤μ, degrading gracefully."
            },
            {
              "id": "c6l3-i4",
              "front": "What is backpressure?",
              "back": "Signaling upstream to slow/stop when a consumer can't keep up (block, throttle, or shed load), capping queue depth so overload surfaces early instead of crashing later."
            }
          ]
        }
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
          "id": "c7l1",
          "title": "Monolith vs Microservices",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Monolith vs. microservices",
              "statement": "A **monolith** is a single deployable application: all modules run in one process and call each other in-process. A **microservices** architecture splits the system into many small, independently deployable services that communicate over the network, each owning its own data. The split is fundamentally an *organizational and scaling* decision — it lets teams and services deploy and scale independently — bought at the price of turning reliable in-process calls into unreliable network calls and a single ACID database into a distributed-data problem."
            },
            {
              "type": "decision",
              "heading": "Monolith vs. microservices trade-offs",
              "rows": [
                [
                  "Monolith",
                  "Simple deploy, in-process calls (fast, reliable), easy ACID transactions, one codebase. But: scales as a unit, couples teams, one tech stack, a big blast radius."
                ],
                [
                  "Microservices",
                  "Independent deploy/scale per service, team autonomy, tech diversity, fault isolation. But: network failure, distributed data/consistency, operational and observability overhead, harder transactions."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Why not to start with microservices",
              "body": "The dominant reason to *not* begin a new product with microservices is that **you don't yet know the right service boundaries** — and premature distribution makes them enormously expensive to change. Boundaries emerge from understanding the domain (and the team); guess wrong early and you get a **distributed monolith**: services so chatty and coupled that you pay all the distributed-systems costs with none of the independence. \"Monolith first\" (Fowler): build a well-modularized monolith, learn the seams, and extract services along proven boundaries when scaling or team structure demands it."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Bounded context and data ownership",
              "statement": "A **bounded context** (Domain-Driven Design) is a boundary within which a domain model is consistent and self-contained — the natural seam for a microservice. Each service should **own its data** (its own database, private to it) and expose it only through its API. Sharing a database across services recreates tight coupling (any schema change ripples; no independent deploy) — the distributed-monolith anti-pattern. Private data per service is what makes services independently deployable and loosely coupled."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The availability (and latency) tax of decomposition",
              "statement": "A request served by a synchronous chain of N independent services, each available with probability a, succeeds only if all N succeed, so its end-to-end availability is aᴺ (series composition, Unit 2) — *decreasing* in N. And its latency is at least the sum of the per-service latencies. Splitting a monolith into a synchronous chain therefore lowers availability and raises latency unless each service is made more reliable and calls are coarsened or parallelized.",
              "proof": "By independence and the series requirement that every service succeed, availability = ∏ a = aᴺ. Since a ≤ 1, aᴺ decreases as N grows — each added synchronous dependency multiplies availability by a ≤ 1. For latency, a synchronous chain blocks on each call in turn, so end-to-end latency = Σ (service time + network round-trip) ≥ Σ service times. ∎\n\n**Worked:** 10 services each at 99.9% (a = 0.999): end-to-end availability = 0.999¹⁰ ≈ 0.990 = **99.0%** — two nines *worse* than any single service, purely from chain length. To keep the whole chain at 99.9%, each of the 10 must reach ≈ 99.99% (0.9999¹⁰ ≈ 0.999). The lesson: decomposition imposes an availability/latency tax you pay in reliability investment per service, or by removing synchronous dependencies (async, caching, fallbacks — Units 5, 6, 8)."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Microservices are a scaling/org tool with a real tax — don't adopt them prematurely.** A synchronous chain of N services is only ~aᴺ available and Σ-latency slow, plus the ops/observability burden. Start with a modular monolith, learn the true boundaries, and extract services when team size or scale genuinely requires it — not by default."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Give a key reason NOT to start a new product with microservices, and explain the 'distributed monolith' risk.",
                  "solution": "You don't yet know the correct service boundaries — they emerge from understanding the domain and team — and premature distribution makes boundaries very costly to move. If you guess wrong, you get a **distributed monolith**: services that are chatty and tightly coupled (e.g. sharing data or requiring lock-step deploys), so you pay every distributed-systems cost (network failure, latency, consistency, ops) while getting none of the benefit (independent deploy/scale). Better: a modular monolith first, then extract services along proven seams."
                },
                {
                  "prompt": "A request synchronously traverses 5 services, each 99.95% available. What is the end-to-end availability? What single architectural change most improves it?",
                  "solution": "Series composition: a⁵ = 0.9995⁵ ≈ 0.99750 ≈ 99.75% — worse than any single service, from chain length. The highest-leverage change is to **remove synchronous dependencies from the critical path**: make some calls asynchronous (Unit 6), serve from cache (Unit 5), or add fallbacks/graceful degradation so a downstream failure doesn't fail the whole request (Unit 8) — converting series dependencies into non-critical or parallel ones. Raising each service's individual availability also helps but is slower and costlier than shortening the synchronous chain."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c7l1-i1",
              "front": "Monolith vs microservices — the core trade?",
              "back": "Monolith: one deployable, in-process calls (fast/reliable), easy transactions, but couples scaling/teams. Microservices: independent deploy/scale per team, but network failure, distributed data, and ops overhead."
            },
            {
              "id": "c7l1-i2",
              "front": "Why not start with microservices?",
              "back": "You don't yet know the right service boundaries; premature distribution is costly to change and risks a 'distributed monolith' (coupled, chatty services with all the cost, none of the benefit). Monolith-first."
            },
            {
              "id": "c7l1-i3",
              "front": "Why does each microservice own its data?",
              "back": "Private data per service enables loose coupling and independent deployability; a shared database recreates coupling (schema changes ripple, no independent deploy) — the distributed-monolith anti-pattern."
            },
            {
              "id": "c7l1-i4",
              "front": "The availability tax of decomposition?",
              "back": "A synchronous chain of N services each at availability a is only aᴺ available (series, Unit 2) and Σ-latency slow. 10 × 99.9% ≈ 99.0%. Each service must be more reliable, or remove synchronous deps."
            }
          ]
        },
        {
          "id": "c7l2",
          "title": "The Fallacies & Communication",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The fallacies of distributed computing",
              "statement": "The eight **fallacies of distributed computing** (Deutsch & Gosling) are false assumptions that in-process programmers carry into distributed systems: (1) the network is reliable; (2) latency is zero; (3) bandwidth is infinite; (4) the network is secure; (5) topology doesn't change; (6) there is one administrator; (7) transport cost is zero; (8) the network is homogeneous. Every one is false, and each remote call must be designed as if it knows so."
            },
            {
              "type": "text",
              "heading": "The two that bite first: unreliable, and not-zero-latency",
              "body": "**The network is not reliable.** Contrary to the in-process assumption, every remote call can fail — drop, time out, or partially complete — so you must bound it with a **timeout**, plan for **retries** (with idempotency, Unit 6), and treat failure as the normal case, not the exception (Unit 8). **Latency is not zero.** A network round-trip is orders of magnitude slower than a function call, so a \"chatty\" interface that makes many fine-grained calls compounds latency badly. These two fallacies alone reshape API design toward coarse-grained, failure-aware interfaces."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Latency composition: why chatty APIs are slow",
              "statement": "A synchronous request that calls N services in sequence has end-to-end latency L = Σ_{i=1}^{N} (t_i + r_i), where t_i is service i's processing time and r_i the network round-trip to it. The round-trip terms (which the \"latency is zero\" fallacy ignores) dominate for fine-grained APIs, so replacing M chatty calls with one coarse call saves ≈ (M − 1) round-trips.",
              "proof": "Sequential dependencies can't overlap — each call blocks until it returns (often because the next needs its result) — so total time is the sum of each call's processing plus its network round-trip: L = Σ (t_i + r_i). If an interaction is M fine-grained calls each costing a round-trip r, the round-trip cost alone is M·r; one coarse call returning the same data pays r once, saving (M − 1)·r. ∎\n\n**Worked:** rendering a page needs 50 sequential calls, each with a 1 ms RTT: that's 50 ms of *pure network latency* before any processing. Batch them into one coarse call and the network cost drops to ~1 ms. (Alternatively, fan out the independent calls in *parallel* — then latency is the max, not the sum — but parallel fan-out hits the tail-at-scale problem of Unit 8.)"
            },
            {
              "type": "decision",
              "heading": "Communication styles",
              "rows": [
                [
                  "Synchronous (REST/gRPC)",
                  "Caller waits for a response. Simple request/response, but couples availability/latency in series — keep chains short and APIs coarse."
                ],
                [
                  "Asynchronous (events/messaging)",
                  "Fire-and-forget via a broker (Unit 6). Decouples and absorbs bursts; pays eventual consistency. For work that can happen later."
                ],
                [
                  "Coarse- vs fine-grained API",
                  "Coarse: fewer round-trips, less chatty (prefer across the network). Fine: flexible but chatty — fine within a process, costly between services."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Every in-process call you promote to a network call inherits all eight fallacies.** It can now fail, take real time, cross a trust boundary, and traverse a changing topology. Design service APIs **coarse-grained** (to amortize round-trips), **failure-aware** (timeouts, retries, idempotency), and **versioned** (so you can evolve them without breaking consumers) — none of which a function call required."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "The fallacies of distributed computing warn that, contrary to assumption, the network is not ___ — every remote call can fail. Fill in the blank and give two concrete design consequences.",
                  "solution": "not **reliable**. Consequences: (1) bound every remote call with a **timeout** (no call waits forever) and plan **retries with backoff + idempotency** (Units 6, 8), since calls drop/time out/partially complete; (2) treat failure as the normal case — add circuit breakers, fallbacks, and graceful degradation (Unit 8) so a dependency's failure doesn't fail the whole request. More broadly, the availability of a synchronous chain is only aᴺ (Unit 7), so minimize hard dependencies."
                },
                {
                  "prompt": "A page makes 40 sequential service calls, each with 2 ms processing and 3 ms network RTT. Compute the end-to-end latency. How much do you save by batching them into a single coarse call (one RTT, 2 ms processing)?",
                  "solution": "Sequential: L = Σ(t_i + r_i) = 40 × (2 + 3) = 40 × 5 = 200 ms. Coarse single call: ≈ 2 ms processing + 3 ms RTT = 5 ms. Saving ≈ 195 ms, almost all of it the 40 × 3 = 120 ms of repeated round-trips plus the serialized processing. This is why chatty fine-grained APIs are slow across the network and coarse-grained calls (or parallel fan-out) are preferred."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c7l2-i1",
              "front": "Name the most-cited fallacies of distributed computing.",
              "back": "The network is reliable; latency is zero; bandwidth is infinite; the network is secure; topology doesn't change; one administrator; transport cost is zero; the network is homogeneous. All false."
            },
            {
              "id": "c7l2-i2",
              "front": "Design consequences of 'the network is not reliable'?",
              "back": "Timeout every remote call, retry with backoff + idempotency, treat failure as normal (circuit breakers, fallbacks, degradation). Minimize hard synchronous dependencies (aᴺ availability)."
            },
            {
              "id": "c7l2-i3",
              "front": "Latency composition of a synchronous chain?",
              "back": "L = Σ(t_i + r_i): processing + network round-trip per call, summed (they can't overlap). Round-trips dominate chatty APIs; coarsening M calls into 1 saves (M−1) round-trips."
            },
            {
              "id": "c7l2-i4",
              "front": "Why prefer coarse-grained APIs across services?",
              "back": "Each network call costs a round-trip (latency ≠ 0); fine-grained chatty calls compound it. Coarse calls amortize round-trips; or fan out in parallel (latency = max, but hits tail-at-scale)."
            }
          ]
        },
        {
          "id": "c7l3",
          "title": "Distributed Data: Sagas",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "The distributed-transaction problem",
              "body": "A business operation often spans services that each own their data — checkout must reserve **inventory** (service A) *and* charge **payment** (service B). In a monolith this is one ACID transaction; across services it is not, because each service has its own database and a distributed ACID transaction (two-phase commit) is impractical at scale: 2PC is **blocking** (a coordinator failure can stall all participants holding locks), couples services tightly, and trades away availability (CAP). So microservices need a different way to keep multi-service operations consistent."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Saga",
              "statement": "A **saga** implements a transaction spanning multiple services as a *sequence of local transactions*, one per service. Each local transaction commits in its own service and publishes an event/command triggering the next. If a step fails, the saga runs **compensating transactions** — semantic undos of the already-committed steps, in reverse — to return the system to a consistent state. A saga provides atomicity of *outcome* and eventual consistency, but **not** ACID isolation: intermediate states are visible to others."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Choreography vs. orchestration",
              "statement": "Sagas are coordinated in two styles. **Choreography**: no central coordinator — each service listens for events and reacts, publishing its own events (decentralized, loosely coupled, but the overall flow is implicit and hard to follow). **Orchestration**: a central **orchestrator** explicitly drives the steps and compensations (the flow is explicit and easy to reason about and change, at the cost of a coordinator component). Choreography suits simple flows; orchestration suits complex ones needing visibility and control."
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "An orchestration saga for checkout. Each step is a local transaction in one service. When payment is declined, the orchestrator runs compensating transactions in reverse — releasing the reserved inventory. A saga gives atomicity of outcome and eventual consistency, not ACID isolation: the intermediate 'reserved but unpaid' state is briefly visible to others.",
              "actors": [
                "Orchestrator",
                "Inventory",
                "Payment"
              ],
              "messages": [
                {
                  "from": "Orchestrator",
                  "to": "Inventory",
                  "label": "reserve(item)",
                  "tone": "sage"
                },
                {
                  "from": "Inventory",
                  "to": "Orchestrator",
                  "label": "reserved",
                  "tone": "sage",
                  "dashed": true
                },
                {
                  "from": "Orchestrator",
                  "to": "Payment",
                  "label": "charge(card)",
                  "tone": "sage"
                },
                {
                  "from": "Payment",
                  "to": "Orchestrator",
                  "label": "DECLINED",
                  "tone": "rust",
                  "dashed": true
                },
                {
                  "note": "step failed → run compensations in reverse"
                },
                {
                  "from": "Orchestrator",
                  "to": "Inventory",
                  "label": "release(item)  [compensate]",
                  "tone": "ember"
                }
              ]
            },
            {
              "type": "text",
              "heading": "Compensation, not rollback",
              "body": "A saga can't *roll back* a committed local transaction — it can only **compensate** with a new transaction that semantically undoes it: not \"undelete the charge\" but \"issue a refund\"; not \"un-reserve\" but \"release the reservation.\" Compensations must be designed per step, must themselves be **idempotent** (Unit 6, since they may be retried), and must cope with the fact that the original effect was *visible* in the interim (someone may have acted on the reserved-but-unpaid state). This is the cost of trading ACID isolation for availability: you get eventual consistency and must reason about the intermediate states."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Sagas trade isolation for availability — design the compensations and the visible interim states.** There is no distributed rollback; every step needs a correct, idempotent compensating action, and because there's no isolation, other operations can observe the in-progress state (reserved-but-unpaid). Don't reach for distributed 2PC to avoid this — it's blocking and kills availability; sagas are the pragmatic, available choice (with eventual consistency)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A saga handles a transaction spanning multiple services by doing what?",
                  "solution": "By breaking it into a **sequence of local transactions**, one per service, each committing in its own service and triggering the next (via events or an orchestrator); if a later step fails, the saga runs **compensating transactions** — semantic undos of the already-committed steps, in reverse order — to restore consistency. It gives atomicity of outcome and eventual consistency, not ACID isolation."
                },
                {
                  "prompt": "An order must update inventory (service A) and charge payment (service B), which own separate databases. Design this as a saga, including the failure path, and state what guarantee you give up versus a single ACID transaction.",
                  "solution": "Model it as a saga (orchestrated): step 1 — Inventory.reserve(item) commits locally; step 2 — Payment.charge(card) commits locally. **Failure path:** if payment is declined (or times out), the orchestrator invokes the compensating transaction Inventory.release(item) to undo the reservation; if inventory reservation itself fails, abort before charging. Each step and compensation must be idempotent (retries) and keyed by an order/idempotency id (Unit 6). **Guarantee given up:** ACID **isolation** — unlike a single transaction, the intermediate 'reserved but not yet paid' state is briefly visible to other operations, and consistency is only *eventual* (achieved once the saga completes or fully compensates). You keep atomicity of the final outcome and availability; you lose isolation and immediate consistency. Using distributed 2PC instead would restore isolation but block on coordinator/participant failures and harm availability."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c7l3-i1",
              "front": "Why can't microservices use one ACID transaction across services?",
              "back": "Each owns its own database; distributed 2PC is blocking (coordinator failure stalls participants holding locks), tightly coupling and trading away availability (CAP). Need a different approach: sagas."
            },
            {
              "id": "c7l3-i2",
              "front": "What is a saga?",
              "back": "A multi-service transaction as a sequence of local transactions, each triggering the next; on failure, compensating transactions undo prior steps in reverse. Atomicity of outcome + eventual consistency, not ACID isolation."
            },
            {
              "id": "c7l3-i3",
              "front": "Choreography vs orchestration sagas?",
              "back": "Choreography: services react to events, decentralized (implicit flow). Orchestration: a central coordinator drives steps/compensations (explicit, visible flow). Choreography for simple flows, orchestration for complex."
            },
            {
              "id": "c7l3-i4",
              "front": "Compensation vs rollback?",
              "back": "A committed local transaction can't be rolled back, only compensated by a new semantic-undo transaction (refund, not un-charge). Compensations must be idempotent, and the interim state was visible (no isolation)."
            }
          ]
        }
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
          "id": "c8l1",
          "title": "Resilience Patterns",
          "estMinutes": 26,
          "content": [
            {
              "type": "text",
              "heading": "Design for partial failure",
              "body": "In a distributed system, *something is always failing* — a dependency is slow, a node is down, a network blips. **Resilience** is staying available despite these *partial* failures, so that one component's trouble doesn't cascade into a total outage. The patterns below — timeouts, retries with backoff, circuit breakers, bulkheads — are the standard toolkit, and they share one goal: contain a failure to where it happened and fail *fast and gracefully* rather than slowly and catastrophically."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Timeouts and retries",
              "statement": "A **timeout** bounds how long a caller waits for a remote call before giving up — mandatory, because the network is unreliable (Unit 7) and an unbounded wait ties up resources indefinitely. A **retry** re-attempts a failed call, on the assumption the failure was transient. Retries are safe only on **idempotent** operations (Unit 6), and must be rate-limited — naive immediate retries amplify load on an already-struggling dependency."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Exponential backoff with jitter",
              "statement": "Exponential backoff retries after a delay that doubles each attempt: wait(attempt) = base × 2^(attempt − 1). This gives a failing dependency exponentially more time to recover and cuts the retry rate geometrically. Adding **jitter** (randomizing each delay) prevents a **retry storm** — many clients that failed together retrying in synchronized waves and re-overloading the recovering service.",
              "proof": "By definition the nth retry waits base × 2^(n − 1): base, 2·base, 4·base, 8·base, … — a geometric schedule, so the number of retries within any elapsed window grows only logarithmically, sharply reducing load versus fixed-interval retries. But if N clients all failed at the same instant (a dependency blip), each computes the *same* deterministic backoff and retries *simultaneously* — an N× spike (retry storm / thundering herd) that can re-crash the recovering service. Randomizing each client's delay (e.g. uniform in [0, base × 2^(n − 1)]) desynchronizes them, spreading retries across the window instead of landing together. ∎\n\n**Worked:** base = 100 ms, attempt = 5 ⟹ wait = 100 × 2^(5 − 1) = 100 × 16 = **1,600 ms**."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Circuit breaker",
              "statement": "A **circuit breaker** wraps calls to a dependency and tracks failures. In **CLOSED** state calls pass through; once failures cross a threshold it trips to **OPEN**, where calls **fail fast** immediately (without hitting the dependency) for a cool-down period; after the cool-down it goes **HALF-OPEN**, letting a trial call through — success closes the circuit, failure re-opens it. It improves resilience by *not* hammering a known-failing dependency: it sheds load so the dependency can recover, and frees the caller from waiting on calls that will fail anyway."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 240,
              "caption": "Circuit-breaker state machine. CLOSED passes calls; on enough failures it trips OPEN (fail fast, don't call the dependency); after a cool-down it goes HALF-OPEN and tries one call — success → CLOSED, failure → OPEN. Failing fast sheds load so the dependency can recover and stops the caller blocking on doomed calls.",
              "nodes": [
                {
                  "id": "closed",
                  "label": "CLOSED",
                  "x": 12,
                  "y": 50,
                  "tone": "sage",
                  "sub": "calls pass"
                },
                {
                  "id": "open",
                  "label": "OPEN",
                  "x": 88,
                  "y": 50,
                  "tone": "rust",
                  "sub": "fail fast"
                },
                {
                  "id": "half",
                  "label": "HALF-OPEN",
                  "x": 50,
                  "y": 18,
                  "tone": "gold",
                  "sub": "trial call"
                }
              ],
              "edges": [
                {
                  "from": "closed",
                  "to": "open",
                  "label": "failures ≥ threshold",
                  "tone": "rust"
                },
                {
                  "from": "open",
                  "to": "half",
                  "label": "after cool-down",
                  "tone": "gold"
                },
                {
                  "from": "half",
                  "to": "closed",
                  "label": "success",
                  "tone": "sage"
                },
                {
                  "from": "half",
                  "to": "open",
                  "label": "failure",
                  "tone": "rust"
                }
              ]
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Cascading failure (and the bulkhead)",
              "statement": "A slow dependency can take down its caller: if a dependency's latency W rises, then by Little's Law the number of in-flight requests L = λ·W rises proportionally; when L exceeds the caller's thread/connection pool, the caller is **resource-exhausted** and starts failing *its* callers — the failure cascades upstream. A **bulkhead** (isolating a separate, bounded resource pool per dependency) plus timeouts and circuit breakers caps W and L, containing the failure.",
              "proof": "Hold the request rate λ to a dependency roughly fixed. If the dependency slows, each call's time-in-system W increases, and Little's Law (Unit 1) gives the concurrent in-flight count L = λ·W, which therefore increases in proportion. The caller serves these from a finite pool of P threads/connections; once L > P the pool is exhausted, new requests queue or are rejected, and the caller's own latency and error rate spike — so its upstream callers, by the same mechanism, begin to fail. The failure thus propagates up the call graph. **Timeouts** cap W (bounding L = λ·W); a **circuit breaker** drops λ to ~0 for the failing dependency; a **bulkhead** confines the blow-up to one dependency's dedicated pool so it can't consume the threads needed for healthy dependencies. ∎"
            },
            {
              "type": "decision",
              "heading": "Resilience patterns",
              "rows": [
                [
                  "Timeout",
                  "Bound every remote call. Caps W (and thus in-flight L) so a slow dependency can't tie up resources forever."
                ],
                [
                  "Retry + backoff + jitter",
                  "Recover from transient failures without a retry storm. Idempotent calls only; exponential delays + randomization."
                ],
                [
                  "Circuit breaker",
                  "Stop calling a failing dependency (fail fast); let it recover; probe with half-open. Prevents hammering and caller blocking."
                ],
                [
                  "Bulkhead",
                  "Isolate resources (separate pools) per dependency so one slow dependency can't exhaust all threads and cascade."
                ],
                [
                  "Graceful degradation",
                  "Serve reduced functionality (stale cache, default, hide a widget — Unit 2) instead of failing the whole request."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Slowness, not just failure, is the killer — bound it.** A dependency that merely gets *slow* inflates in-flight count L = λ·W until the caller's pool exhausts and the failure cascades. Always set timeouts (cap W), add circuit breakers (cut λ to a sick dependency), and use bulkheads (contain the blast radius), so one slow dependency degrades gracefully instead of toppling the whole system."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Exponential backoff waits base × 2^(attempt−1). With base = 100 ms, how long is the wait before the 5th attempt? And why add jitter?",
                  "solution": "wait = 100 × 2^(5−1) = 100 × 2⁴ = 100 × 16 = 1,600 ms. Jitter (randomizing the delay) is added to prevent a **retry storm**: without it, many clients that failed at the same moment compute the same deterministic backoff and retry simultaneously, producing synchronized N× load spikes that re-overload the recovering dependency. Randomizing spreads the retries across the window so the recovering service sees smooth, not spiky, load."
                },
                {
                  "prompt": "A circuit breaker improves resilience by doing what? Walk through its three states.",
                  "solution": "It improves resilience by **not repeatedly calling a dependency that is failing** — it fails fast, shedding load so the dependency can recover and freeing the caller from blocking on doomed calls (preventing cascading exhaustion). States: **CLOSED** — calls pass through, failures are counted; on crossing a failure threshold it trips to **OPEN** — calls fail immediately without contacting the dependency, for a cool-down period; after cool-down it moves to **HALF-OPEN** — a single trial call is allowed: if it succeeds the breaker returns to CLOSED, if it fails it returns to OPEN. This lets the system stop hammering a sick dependency and automatically recover when it heals."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c8l1-i1",
              "front": "Why bound every remote call with a timeout?",
              "back": "The network is unreliable; an unbounded wait ties up resources. A timeout caps W, so by Little's Law L = λW the in-flight count stays bounded — preventing slow dependencies from exhausting the caller."
            },
            {
              "id": "c8l1-i2",
              "front": "Exponential backoff formula and the role of jitter?",
              "back": "wait = base × 2^(attempt−1) (geometric: gives the dependency time to recover, cuts retry rate). Jitter randomizes delays to break synchronized retry storms. base=100ms, attempt=5 → 1,600 ms."
            },
            {
              "id": "c8l1-i3",
              "front": "Circuit-breaker states?",
              "back": "CLOSED (calls pass, count failures) → OPEN on threshold (fail fast, don't call) → after cool-down HALF-OPEN (trial call) → success→CLOSED, failure→OPEN. Sheds load so the dependency recovers."
            },
            {
              "id": "c8l1-i4",
              "front": "How does a slow dependency cause cascading failure, and the fix?",
              "back": "Slow dep ⇒ W↑ ⇒ in-flight L=λW↑ ⇒ caller's pool exhausts ⇒ caller fails its callers (cascade). Fix: timeouts (cap W), circuit breaker (cut λ), bulkhead (isolate pool per dependency)."
            }
          ]
        },
        {
          "id": "c8l2",
          "title": "Observability",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Observability",
              "statement": "**Observability** is the ability to infer a system's *internal* state from its *external* outputs — to ask new questions about behavior you didn't anticipate, not just watch pre-built dashboards. It is broader than **monitoring** (checking known indicators against thresholds): a system is observable when, faced with a novel failure, you can explore the telemetry and find *why* without shipping new code. In distributed systems it is essential, because a request's story is scattered across many services."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The three pillars: logs, metrics, traces",
              "statement": "The three pillars of observability: **logs** — timestamped, discrete event records (what happened, with detail), good for debugging specifics; **metrics** — numeric, aggregated time series (request rate, error rate, latency percentiles, saturation), cheap to store and ideal for alerting and trends; **traces** — the end-to-end path of a single request across services, with per-hop timing (spans), essential for finding *which* service in a chain is slow or failing. Together they answer \"what's the trend?\" (metrics), \"where in the request?\" (traces), and \"exactly what happened?\" (logs)."
            },
            {
              "type": "text",
              "heading": "Distributed tracing ties the request together",
              "body": "In a microservices call graph, no single log file tells the story of a request. **Distributed tracing** propagates a **trace ID** through every service a request touches, with a **span** per operation recording its start, duration, and parent — reconstructing the full tree of calls and where the time went. This is what lets you see that a user-facing 800 ms came from one slow database span four services deep. Combined with the percentile metrics of Unit 1, tracing is how you hunt the **tail** — and the tail, at scale, is where the problems live."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Tail at scale: fan-out makes the tail the common case",
              "statement": "If a request fans out to N independent services and must wait for *all* of them, and each is \"slow\" (beyond a latency threshold) with probability p, then the request is slow with probability 1 − (1 − p)^N. Even a tiny per-service tail probability becomes near-certain at large fan-out — so a single service's p99 latency becomes the *typical* experience of a high-fan-out request (Dean & Barroso, \"The Tail at Scale\").",
              "proof": "The overall request is fast only if *every* one of the N independent services is fast, which by independence has probability (1 − p)^N. Hence P(at least one slow) = 1 − (1 − p)^N, which increases toward 1 as N grows (for fixed p > 0, (1 − p)^N → 0). ∎\n\n**Worked:** each service is slow with p = 1% (its p99), and a request fans out to N = 100 of them: P(slow) = 1 − 0.99¹⁰⁰ ≈ 1 − 0.366 = **0.634**. So ~63% of these requests hit at least one tail-latency service — the *99th-percentile* latency of one service is the *median* experience of the fan-out. Mitigations: **hedged/tied requests** (issue a duplicate to a second replica and take the first to return, making the effective tail ≈ p² per pair), and reducing fan-out N or each service's tail p."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**At scale, the tail is the common case — instrument for it.** Because fan-out turns a 1% per-service tail into a ~63% request-level tail (N=100), optimizing the *average* is useless; you must measure p99/p99.9 (metrics) and use distributed tracing to locate the slow span. Then attack the tail with hedged requests, timeouts, and reduced fan-out — not with a faster mean."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Name the three pillars of observability and what each is best for.",
                  "solution": "**Logs** — discrete, timestamped event records with detail; best for debugging exactly what happened in a specific case. **Metrics** — numeric aggregated time series (rates, error %, latency percentiles, saturation); cheap, best for alerting and trends ('what's the rate/trend?'). **Traces** — the end-to-end path of a single request across services with per-span timing; best for locating *where* in a distributed call graph the latency or error occurred. Used together they cover trend (metrics), location (traces), and detail (logs)."
                },
                {
                  "prompt": "A request fans out to 50 services and waits for all; each has a 2% chance of exceeding the latency budget. What fraction of requests exceed the budget? What does this imply about optimizing the mean?",
                  "solution": "P(slow) = 1 − (1 − 0.02)⁵⁰ = 1 − 0.98⁵⁰ ≈ 1 − 0.364 = 0.636 — about 64% of requests hit at least one slow service. This shows optimizing the *mean* latency is nearly useless at fan-out: even a small 2% per-service tail makes the *majority* of requests slow, because the request inherits the worst of its 50 dependencies. You must drive down the per-service tail (p99/p99.9) and/or fan-out, and use hedged requests — the tail, not the average, governs the experience (tail at scale)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c8l2-i1",
              "front": "Observability vs monitoring?",
              "back": "Observability: infer internal state from external outputs to answer NEW questions about unanticipated behavior. Monitoring: check known indicators against thresholds. Observability is the broader capability."
            },
            {
              "id": "c8l2-i2",
              "front": "The three pillars of observability?",
              "back": "Logs (discrete detailed events), metrics (aggregated numeric time series — rates/percentiles, for alerting/trends), traces (end-to-end request path across services with per-span timing)."
            },
            {
              "id": "c8l2-i3",
              "front": "What is distributed tracing for?",
              "back": "Propagating a trace ID + spans through every service a request touches, to reconstruct the call tree and find which service/hop consumed the time — essential for the tail in microservices."
            },
            {
              "id": "c8l2-i4",
              "front": "Tail-at-scale fan-out probability?",
              "back": "Fan out to N services, each slow with prob p, wait for all ⇒ P(slow) = 1−(1−p)^N. p=1%, N=100 → ~63%. A service's p99 becomes the typical fan-out experience. Mitigate with hedged requests."
            }
          ]
        },
        {
          "id": "c8l3",
          "title": "The Limits of Agreement: FLP",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Consensus: the hard core of distributed systems",
              "body": "Much of distributed systems reduces to **consensus** — getting a set of processes to *agree* on one value (a leader, a commit/abort decision, the next entry in a log). A correct consensus protocol must satisfy three properties: **agreement** (no two processes decide differently), **validity** (the decided value was proposed by someone), and **termination** (every non-faulty process eventually decides). The first two are *safety*; termination is *liveness*. FLP is the fundamental result on whether all three can be guaranteed together."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The FLP impossibility result",
              "statement": "**FLP** (Fischer, Lynch & Paterson, 1985): in a fully **asynchronous** system (no bound on message delay or relative process speed), there is **no deterministic** algorithm that solves consensus — guaranteeing agreement, validity, *and* termination — if even **one** process may fail by crashing (fail-stop). Precisely: deterministic, guaranteed-terminating consensus is impossible under full asynchrony with a single crash fault. It does *not* say consensus is impossible in practice — only that no deterministic protocol can guarantee it will *always* terminate in this model."
            },
            {
              "type": "text",
              "heading": "Why — the intuition",
              "body": "In a fully asynchronous system you **cannot distinguish a crashed process from a merely slow one**: with no bound on message delay, a silent process might be dead or might just be late. So a deterministic protocol can never safely \"give up\" waiting and decide, because the awaited message might still arrive and contradict it. The formal argument shows there is always a \"bivalent\" (undecided) configuration from which the adversary — by delaying exactly the right message — can drive the system to *another* bivalent configuration, indefinitely. Safety forces the protocol to keep waiting; the adversary makes it wait forever. Liveness (termination) is what must yield."
            },
            {
              "type": "text",
              "heading": "How real systems live with FLP",
              "body": "Working consensus systems — Paxos, Raft, Zab, PBFT — do not *violate* FLP; they **sidestep its assumptions**. Two escapes: **(1) partial synchrony** — assume the network is *eventually* well-behaved (messages arrive within some bound after some unknown time), which lets **failure detectors** (timeouts) suspect crashed processes; protocols then guarantee safety *always* and termination *once the network stabilizes* (Raft elects a leader and makes progress in stable periods). **(2) randomization** — randomized protocols (Ben-Or) terminate with *probability 1* rather than with certainty, dodging the deterministic clause. FLP tells you the price of consensus: you must relax either synchrony or determinism to get liveness."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Avoid the misstatement: FLP does NOT say \"consensus is impossible in distributed systems.\"** It constrains *deterministic, guaranteed-terminating* consensus under *full asynchrony* with a crash fault. Real systems achieve consensus every day by relaxing those assumptions — adding timeouts/failure detectors (partial synchrony) or randomization. FLP describes *what you must give up* (guaranteed termination under full asynchrony), not an impossibility of agreement."
            },
            {
              "type": "text",
              "heading": "FLP and CAP: two faces of asynchrony",
              "body": "FLP and CAP (Unit 3) are siblings: both are impossibility results born of the asynchronous, failure-prone network. CAP says you can't have consistency *and* availability under a partition; FLP says you can't guarantee consensus *termination* under full asynchrony with a crash. A CP system (consensus-backed) chooses safety/consistency and sacrifices liveness/availability exactly when the network misbehaves — which is FLP's \"termination yields\" and CAP's \"availability yields\" seen from two angles. Both teach the same humility: in an asynchronous world, some guarantee must be conditional."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "State the FLP impossibility result precisely (system model, failure assumption, what it rules out), and give the core intuition for why.",
                  "solution": "**Statement:** In a fully asynchronous system (no bound on message delays or relative process speeds), no *deterministic* algorithm can solve consensus — guarantee agreement, validity, AND termination — if even a single process may fail by crashing (fail-stop). I.e. deterministic, guaranteed-terminating consensus is impossible under full asynchrony with one crash fault. **Intuition:** under full asynchrony you cannot tell a crashed process from a slow one (no timeout is safe, since a delayed message may still arrive), so a deterministic protocol can never safely stop waiting to decide; formally, from any undecided ('bivalent') configuration an adversary can delay the right message to reach another bivalent configuration forever. Safety forces continued waiting, so termination (liveness) is what cannot be guaranteed. It does NOT say consensus is impossible in practice."
                },
                {
                  "prompt": "Raft reliably elects leaders and commits entries in production. Does it violate FLP? Explain how it copes.",
                  "solution": "No — Raft does not violate FLP; it **sidesteps FLP's assumptions** rather than contradicting the theorem. FLP rules out *deterministic, guaranteed-terminating* consensus under *full asynchrony*. Raft assumes **partial synchrony**: it uses **timeouts (a failure detector)** to suspect a dead/slow leader and trigger a new election. This preserves safety (agreement/validity) *always*, but guarantees **termination only during periods when the network is well-behaved** (messages and elections complete within the timeouts). During pathological asynchrony — e.g. repeated split votes or messages delayed past timeouts — Raft may keep re-electing without deciding, exactly as FLP predicts; it just makes progress once the network stabilizes. So it trades FLP's impossibility for 'terminates when the system is synchronous enough,' which is the standard partial-synchrony escape."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c8l3-i1",
              "front": "What three properties must consensus satisfy?",
              "back": "Agreement (no two decide differently) + validity (decided value was proposed) — safety; and termination (every non-faulty process eventually decides) — liveness."
            },
            {
              "id": "c8l3-i2",
              "front": "State FLP precisely.",
              "back": "In a fully asynchronous system, no deterministic algorithm guarantees consensus (agreement+validity+termination) if even one process may crash. Deterministic guaranteed-terminating consensus is impossible under full asynchrony + 1 crash."
            },
            {
              "id": "c8l3-i3",
              "front": "FLP intuition?",
              "back": "Can't distinguish a crashed process from a slow one (no safe timeout), so a deterministic protocol can never safely stop waiting; an adversary keeps it in undecided (bivalent) configs forever. Termination is what yields."
            },
            {
              "id": "c8l3-i4",
              "front": "How do real systems cope with FLP?",
              "back": "Sidestep its assumptions: partial synchrony + failure detectors/timeouts (Raft/Paxos — safe always, terminate when network stabilizes) or randomization (terminate with probability 1). They don't violate FLP."
            },
            {
              "id": "c8l3-i5",
              "front": "The FLP misstatement to avoid?",
              "back": "'Consensus is impossible in distributed systems' — wrong. FLP constrains deterministic, guaranteed-terminating consensus under full asynchrony with a crash; real systems achieve consensus by relaxing those assumptions."
            }
          ]
        }
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
          "id": "c9l1",
          "title": "Security: Defense in Depth & Least Privilege",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Defense in depth",
              "statement": "**Defense in depth** layers multiple, *independent* security controls so that no single failure is catastrophic — network controls (firewalls, segmentation), identity (authentication, authorization), data (encryption), and application (input validation, WAF) each form a barrier. An attacker must defeat *every* layer to succeed, so a breach of one is contained by the others. It is the security analogue of redundancy: don't rely on a single wall."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Least privilege",
              "statement": "The **principle of least privilege** grants every user, service, and credential the **minimum permissions needed to do its job — and nothing more**. A service that only reads one table gets read access to that one table, not admin on the database. Least privilege directly bounds the **blast radius** (Unit 2) of a compromise: a stolen credential or a hacked service can only reach what it was narrowly granted, so one breach doesn't become total. Implement it with scoped IAM roles, per-service identities, and short-lived credentials."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Why layered, independent barriers multiply risk down",
              "statement": "If an attacker must independently defeat k security layers, each breachable with probability pᵢ, the probability of full compromise is ∏ pᵢ ≤ min(pᵢ). Each independent layer multiplies the breach probability *down* — the security dual of Unit 2's availability composition.",
              "proof": "A full breach requires defeating *every* layer (an AND over independent barriers), so by independence P(full breach) = ∏ pᵢ. Since each pᵢ ≤ 1, the product is ≤ any single factor, hence ≤ min — adding a barrier can only lower the breach probability. ∎\n\n**Worked:** two independent layers each breachable with probability 0.1 give a joint breach probability 0.1 × 0.1 = 0.01 — defense in depth turned a 10% risk into 1%. This is exactly the mirror of availability: for *uptime* you put components in **parallel** (up if any is up: 1 − ∏(1 − aᵢ)); for *security* you put barriers in **series** (breached only if all fall: ∏ pᵢ). Both exploit independence to drive the bad outcome's probability toward zero — provided the layers are genuinely independent (a shared flaw correlates them and breaks the product)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Encryption at rest and in transit; zero trust",
              "statement": "Data must be **encrypted at rest** (in storage — disks, databases, backups) and **in transit** (over the network — TLS), so that stealing a disk or sniffing a link yields only ciphertext. **Zero trust** drops the old assumption that the internal network is safe: *never trust, always verify* — authenticate and authorize *every* request regardless of its origin (no implicit trust from being \"inside\"), because the network is not secure (Unit 7's fallacy) and breaches happen."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Assume breach — least privilege and defense in depth limit the damage.** You cannot make compromise impossible, so design for *containment*: grant minimum permissions (small blast radius), layer independent controls (∏ pᵢ drives full-breach probability down), encrypt at rest and in transit, and verify every request (zero trust). The goal is that any single failure is survivable, not that no failure ever occurs."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "The principle of least privilege means what, and how does it relate to blast radius?",
                  "solution": "It means granting every user/service/credential the **minimum permissions needed for its task and nothing more** (e.g. read-only on one table, not database admin). It relates directly to **blast radius** (Unit 2): when a credential is stolen or a service is compromised, the attacker can only reach what that identity was narrowly permitted, so the damage is *contained* to a small radius instead of spreading to the whole system. Least privilege is the cheapest, highest-leverage control for limiting the impact of an inevitable breach."
                },
                {
                  "prompt": "Data should be encrypted both at ___ (in storage) and in transit. Fill in the blank, and explain why defense-in-depth layers should be independent.",
                  "solution": "encrypted at **rest** (in storage), and in transit (over the network via TLS). Defense-in-depth layers should be **independent** because the breach probability is the product ∏ pᵢ *only if* the layers fail independently — then each added layer multiplies the joint risk down (two 10% layers → 1%). If the layers share a common flaw (same library bug, same admin credential, same misconfiguration), defeating one defeats the others together, the probabilities become correlated rather than multiplied, and the apparent depth is an illusion. True defense in depth requires diverse, independent controls."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c9l1-i1",
              "front": "Defense in depth?",
              "back": "Multiple independent security layers (network, identity, data, application) so no single failure is catastrophic — an attacker must defeat them all. The security analogue of redundancy."
            },
            {
              "id": "c9l1-i2",
              "front": "Principle of least privilege, and why it matters?",
              "back": "Grant the minimum permissions needed, nothing more. Bounds the blast radius of a compromise — a stolen credential/hacked service reaches only what it was narrowly granted."
            },
            {
              "id": "c9l1-i3",
              "front": "Why do independent security layers multiply risk down?",
              "back": "Full breach needs defeating all k layers (AND), so P = ∏pᵢ ≤ min. Two 10% layers → 1%. The series-composition dual of parallel availability redundancy — requires genuine independence."
            },
            {
              "id": "c9l1-i4",
              "front": "Encryption at rest/in transit and zero trust?",
              "back": "At rest (storage) + in transit (TLS) so theft yields only ciphertext. Zero trust: never trust, always verify — authenticate/authorize every request regardless of network location."
            }
          ]
        },
        {
          "id": "c9l2",
          "title": "Cost: The Price of the Nines",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "Cost is an architecture concern",
              "body": "In the cloud, every architectural choice is also a *spending* choice: more redundancy, more regions, more headroom, and stronger consistency all cost real money, billed by the hour. Cost optimization is therefore a first-class design dimension, not an afterthought — and the elasticity of the cloud (pay for what you use, scale on demand) makes it controllable in ways on-prem never was. The discipline is to spend where it buys business value and stop where it doesn't."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The cost of redundancy",
              "statement": "Running availability through redundancy is *additive* in resources: N redundant servers at price s each, plus shared infrastructure (load balancer, etc.) of cost I, costs N·s + I per period — versus s for a single server. Redundancy multiplies availability up (Unit 2) but multiplies cost up too.",
              "proof": "Each server is billed independently, so N of them cost N·s; the shared infrastructure adds a fixed I, giving total N·s + I. ∎\n\n**Worked:** one server costs $200/month. For higher availability you run **3** redundant servers plus a **$100/month** load balancer: new cost = 3 × $200 + $100 = **$700/month** — 3.5× the single-server cost. From Unit 2 those 3 replicas (each, say, 99%) raise availability to 1 − 0.01³ ≈ 99.9999%; the question c9l2 forces is whether that jump is *worth* 3.5× the spend for this workload."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The cost of the nines (diminishing returns)",
              "statement": "Each additional nine of availability costs *disproportionately more* (more redundancy, more regions, more ops, faster recovery), while the marginal benefit — downtime avoided — shrinks by 10× per nine. So cost per nine rises as benefit per nine collapses, and there is an economically *optimal* availability target, not \"maximum nines.\"",
              "proof": "Adding the (k+1)th nine removes downtime equal to (10⁻ᵏ − 10⁻⁽ᵏ⁺¹⁾)·T = 9·10⁻⁽ᵏ⁺¹⁾·T — a quantity that falls by a factor of 10 with each nine. Meanwhile achieving each further nine typically requires another layer of redundancy/isolation (multi-AZ → multi-region → automated failover → …), multiplying cost by some factor > 1 per nine. Thus marginal benefit decays geometrically while marginal cost grows; the economically optimal availability is where the marginal cost of the next nine equals the marginal value of the downtime it removes. ∎\n\n**Worked:** going 99.9% → 99.99% removes 8.76 − 0.876 = **7.88 hours/year** of downtime; going 99.99% → 99.999% removes only 0.876 − 0.0876 = **0.79 hours** — a tenth of the benefit, for comparable (often greater) extra cost. Past a point, buying nines is paying exponentially more to avoid trivial amounts of downtime."
            },
            {
              "type": "decision",
              "heading": "Cost levers",
              "rows": [
                [
                  "Right-sizing & autoscaling",
                  "Match capacity to actual load; scale out on demand and in when idle, instead of provisioning for peak 24/7."
                ],
                [
                  "Pricing models (reserved/spot)",
                  "Commit (reserved/savings plans) for steady load; use cheap interruptible (spot) capacity for fault-tolerant batch work."
                ],
                [
                  "Storage & data tiering",
                  "Move cold data to cheaper tiers; mind egress/transfer costs (often the surprise bill)."
                ],
                [
                  "Managed services",
                  "Trade per-hour price for lower ops cost; sometimes cheaper all-in than self-running."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Don't buy more nines than the business needs.** Each nine costs disproportionately more for 10× less downtime avoided, so match the availability target to the *cost of downtime* for this system (a payments ledger and a marketing blog are not the same). This is exactly what SLOs and error budgets (Unit 2) operationalize — pick the lowest availability users won't notice, and spend the savings elsewhere."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "One server costs $200/month. For higher availability you run 3 redundant servers plus a $100/month load balancer. What is the new monthly cost?",
                  "solution": "Cost = 3 × $200 + $100 = $600 + $100 = $700/month (3.5× the single-server $200). The extra $500/month buys the availability gain from 3-way redundancy — worth it only if this system's cost of downtime justifies it."
                },
                {
                  "prompt": "Explain the 'cost of the nines': why does moving from 99.9% to 99.99% availability cost disproportionately more than the downtime it saves at higher levels?",
                  "solution": "Each additional nine removes 10× *less* downtime than the previous one — 99.9%→99.99% saves 8.76−0.876 = 7.88 h/year, but 99.99%→99.999% saves only 0.79 h/year — so the *benefit* per nine shrinks geometrically. Meanwhile each further nine typically requires another expensive layer (multi-AZ, then multi-region, then automated cross-region failover, more on-call/ops), so the *cost* per nine grows. Marginal cost rising while marginal benefit collapses means there's an economically optimal availability, not 'as many nines as possible' — buy nines only until the cost of the next one exceeds the value of the downtime it avoids (which SLOs/error budgets formalize)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c9l2-i1",
              "front": "Cost of redundancy?",
              "back": "Additive in resources: N servers at price s plus shared infra I = N·s + I. Redundancy multiplies availability up (Unit 2) and cost up. 3×$200 + $100 LB = $700/mo."
            },
            {
              "id": "c9l2-i2",
              "front": "The cost of the nines?",
              "back": "Each extra nine costs disproportionately more (more redundancy/regions/ops) while saving 10× less downtime — so marginal cost rises as marginal benefit collapses. There's an optimal availability, not max nines."
            },
            {
              "id": "c9l2-i3",
              "front": "99.9%→99.99% vs 99.99%→99.999% downtime saved?",
              "back": "7.88 h/year vs only 0.79 h/year — a tenth the benefit for comparable/greater cost. Diminishing returns on nines."
            },
            {
              "id": "c9l2-i4",
              "front": "Main cloud cost levers?",
              "back": "Right-sizing + autoscaling (match capacity to load), reserved/spot pricing, storage tiering (+ watch egress), and managed services (trade price for lower ops). Match nines to the cost of downtime."
            }
          ]
        },
        {
          "id": "c9l3",
          "title": "The Well-Architected Pillars",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The Well-Architected pillars",
              "statement": "Cloud Well-Architected frameworks (AWS's is the canonical one) organize good design into pillars: **operational excellence** (run and improve systems — monitoring, automation, runbooks), **security** (protect data and systems — Lesson 1), **reliability** (recover from failure, meet availability — Units 2, 8), **performance efficiency** (use resources well, scale — Unit 1), and **cost optimization** (deliver value at the lowest price — Lesson 2). (A sixth, **sustainability**, was later added.) They are a checklist for reviewing a design from every angle."
            },
            {
              "type": "text",
              "heading": "Every architecture is a set of trade-offs",
              "body": "The pillars don't all point the same way — they *tension* against each other, and that tension is the entire subject of this course. More **reliability** (redundancy, multi-region) costs more (**cost**) and can add latency (**performance**). Stronger **security** (encryption, checks, isolation) can cost performance and operational simplicity. More **performance** (caching, denormalization) weakens **consistency** (Unit 3) and complicates **operations**. There is no design that maximizes all pillars at once; architecture is the act of choosing *where on each trade-off to sit*, given this system's requirements."
            },
            {
              "type": "decision",
              "heading": "What each pillar asks of a design",
              "rows": [
                [
                  "Operational excellence",
                  "Can we run, observe, and safely change it? (monitoring, automation, deploys, runbooks)"
                ],
                [
                  "Security",
                  "Is data protected and access least-privileged at every layer? (Lesson 1)"
                ],
                [
                  "Reliability",
                  "Does it meet its availability target and recover from failure? (Units 2, 8 — SLOs, redundancy, resilience)"
                ],
                [
                  "Performance efficiency",
                  "Does it use resources well and scale with demand? (Unit 1 — and the limits of scaling)"
                ],
                [
                  "Cost optimization",
                  "Are we delivering the required value at the lowest sensible cost? (Lesson 2 — match nines to downtime cost)"
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Using the framework: make the trade-offs explicit",
              "body": "The value of the pillars is as a **review discipline**: walk a design past each pillar, surface where it trades one for another, and decide *intentionally* rather than by accident. A good review states the trade-offs out loud — \"we chose eventual consistency (weaker reliability of reads) to hit our latency and cost targets,\" \"we accept a single region (lower reliability) because our downtime cost is low and multi-region triples the bill.\" The recurring lesson of this entire course is that there are **no free lunches in distributed systems — only trade-offs**, and the engineer's job is to choose them deliberately and defensibly."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Architecture is choosing trade-offs on purpose.** CAP (C vs A), PACELC (latency vs consistency), sync vs async, monolith vs microservices, the cost of the nines — every unit of this course is a trade-off with no universally right answer. The Well-Architected pillars are the checklist that forces you to make each trade-off *explicit and intentional*, matched to the specific system's requirements, instead of stumbling into it."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Name the five core AWS Well-Architected pillars.",
                  "solution": "Reliability, performance efficiency, security, cost optimization, and **operational excellence**. (A sixth pillar, sustainability, was added later.) They form a checklist for reviewing a design from every angle — and they tension against one another, so a design must choose where to sit on each trade-off."
                },
                {
                  "prompt": "You're reviewing a system design against the Well-Architected pillars. The team proposes a single-region, eventually-consistent, aggressively-cached service to minimize cost and latency. Identify the trade-offs they're making across the pillars and how you'd decide if it's acceptable.",
                  "solution": "They are optimizing **performance efficiency** (caching, low latency) and **cost optimization** (single region, no multi-region spend) at the expense of **reliability** (a single region has no regional failover — lower availability, larger blast radius) and **consistency/correctness** (eventual consistency + aggressive caching means stale reads — acceptable for some data, a bug for others, per Unit 3). **Security** and **operational excellence** are orthogonal here but must still be checked (least privilege, encryption, observability of the cache hit ratio and staleness). To decide if it's acceptable, tie each trade-off to requirements: What is this system's **cost of downtime** and required SLO (Unit 2)? If low (e.g. a content catalog), single-region + eventual consistency is a sound, cost-efficient choice; if high (payments, primary records), the reliability and consistency sacrifices are unacceptable and you'd add a second region and strengthen consistency for the critical data — accepting the higher cost. The review's job is to make these trade-offs explicit and match them to the business's actual reliability/consistency needs, not to maximize any one pillar."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "c9l3-i1",
              "front": "The five core Well-Architected pillars?",
              "back": "Operational excellence, security, reliability, performance efficiency, cost optimization (+ a later sixth: sustainability). A checklist to review a design from every angle."
            },
            {
              "id": "c9l3-i2",
              "front": "Why is every architecture a set of trade-offs?",
              "back": "The pillars tension: more reliability/security costs more and can hurt performance; more performance weakens consistency. No design maximizes all — you choose where to sit on each trade-off per requirements."
            },
            {
              "id": "c9l3-i3",
              "front": "How do you use the Well-Architected framework?",
              "back": "As a review discipline: walk the design past each pillar, surface where it trades one for another, and decide intentionally — stating the trade-offs explicitly and matching them to the system's needs."
            },
            {
              "id": "c9l3-i4",
              "front": "The course's recurring lesson?",
              "back": "No free lunches in distributed systems — only trade-offs (CAP, PACELC, sync/async, monolith/micro, cost-of-nines). The engineer's job is to choose them deliberately and defensibly per requirements."
            }
          ]
        }
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
