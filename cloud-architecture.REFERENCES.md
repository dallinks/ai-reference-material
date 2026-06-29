# Cloud Architecture — verified reference map

Source-grounding for `src/data/courses/cloud-architecture.js`, produced by a
deep-research verification pass (claims 3-vote adversarially verified against
primary sources). Use this to write per-unit `references` and **correct** proof
rubrics. Items marked ⚠️ are rubric hazards confirmed by the verifier.

## Backbone text
- **Kleppmann, *Designing Data-Intensive Applications*** — O'Reilly. **1st ed. 2017** (Kleppmann solo, ISBN 9781491903063); **2nd ed. 2026** (early release, + co-author **Chris Riccomini**, ISBN 9781098119058). ⚠️ **Always specify the edition** when citing chapters — the 2nd ed. renumbers and renames "Partitioning" → "Sharding".
  - 1st-ed. chapters: 1 Reliable/Scalable/Maintainable · 2 Data Models · 3 Storage & Retrieval · 4 Encoding & Evolution · **5 Replication** · **6 Partitioning** · 7 Transactions · 8 The Trouble with Distributed Systems · **9 Consistency and Consensus** · 10 Batch · 11 Stream · 12 The Future of Data Systems.

## Foundational papers (verified citations)
- **CAP** — Gilbert & Lynch, *Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services*, **ACM SIGACT News, 2002** (the original proof). Survey: Gilbert & Lynch, *Perspectives on the CAP Theorem*, **IEEE Computer 45(2), Feb 2012, pp. 30-36**. ⚠️ The PDF at `groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf` is the **2012 survey**, NOT the 2002 original — cite accordingly.
- **Lamport clocks** — *Time, Clocks, and the Ordering of Events in a Distributed System*, **CACM 21(7):558-565, 1978**, DOI 10.1145/359545.359563.
- **Paxos** — *The Part-Time Parliament*, **TOCS 16(2):133-169, 1998**, DOI 10.1145/279227.279229; *Paxos Made Simple*, **SIGACT News 32(4):51-58, 2001** (no DOI).
- **Raft** — Ongaro & Ousterhout, *In Search of an Understandable Consensus Algorithm*, **USENIX ATC '14, pp. 305-319**.
- **Dynamo** — DeCandia et al., *Dynamo: Amazon's Highly Available Key-value Store*, **SOSP 2007**. (⚠️ full author/title was only weakly verified this run — re-check before printing; the N/R/W content is verified.)
- **Spanner** — Corbett et al., *Spanner: Google's Globally-Distributed Database*, **OSDI 2012**.
- *Known but NOT independently verified this run — verify before citing:* **PACELC** (Abadi, IEEE Computer 45(2), 2012), **FLP** (Fischer, Lynch & Paterson, JACM 32(2):374-382, 1985), Bigtable (OSDI 2006), GFS (SOSP 2003), MapReduce (OSDI 2004), Kafka (NetDB 2011) / Kreps *The Log* (2013), Dean & Barroso *The Tail at Scale* (CACM 56(2), 2013), Herlihy & Wing linearizability (TOPLAS 12(3), 1990).
- **Reference texts** — Google *SRE* + *SRE Workbook* (free, sre.google/books); van Steen & Tanenbaum *Distributed Systems* 4th ed. (free, distributed-systems.net); MIT **6.5840** (formerly 6.824), paper-driven.

## Verified theorem statements (for proof rubrics)
- **CAP** — "In a network subject to communication failures, it is impossible for any web service to implement an atomic read/write shared memory that guarantees a response to every request." C = atomicity (**safety**), A = "eventually every request receives a response" (**liveness**), P = messages may be delayed/lost. **Gilbert-Lynch argument:** partition into {p1} and {p2…pn}; a read at p2 can't distinguish a prior write of v1 vs v2 (messages from p1 lost), so it must either answer (risk staleness → break C) or not answer (break A). ⚠️ CAP is **not** "pick 2 of 3" as a steady-state choice — it's C-vs-A **under a partition**. (Async with no bound causes the same even with no loss.)
- **Quorum intersection** — N replicas, read quorum R, write quorum W. **R + W > N** ⇒ every read quorum intersects every write quorum (pigeonhole: R + W > N ⇒ ≥ R+W−N ≥ 1 shared node), so a read sees the latest write. **2W > N** ⇒ any two write quorums intersect, preventing conflicting concurrent writes. ⚠️ Dynamo states R+W>N **descriptively** — the course authors the proof; the principle predates Dynamo (Gifford 1979, Thomas 1979).
- **Lamport clock condition** — if a → b (happens-before) then C(a) < C(b); the derived total order **extends** happens-before. ⚠️ One-directional — the total order does **not** recover causality (a→b ⇒ a⇒b, NOT the converse). The paper's real contribution is the total-order / state-machine replication generalization, not "Lamport timestamps".
- **Spanner external consistency** — "if T1 commits before T2 starts, T1's commit timestamp < T2's," via TrueTime. ⚠️ Prefer the label **strict serializability** (the transactional generalization of linearizability) over bare "linearizability".
- **Raft** — produces a result equivalent to and as efficient as (multi-)Paxos; strong-leader. ⚠️ Understandability is the authors' **stated goal**, not an established fact (Howard & Mortier dispute it).

## Per-unit source map
| Unit | DDIA (1st ed.) | Seminal paper(s) | Theorem gate |
|------|----------------|------------------|--------------|
| 1 Scalability & Performance | ch. 1 | Dean & Barroso *Tail at Scale* (2013); Amdahl (1967) | **Amdahl's Law** (built) |
| 2 Availability & Reliability | ch. 1 | Google SRE (SLO/error-budget, MTTR) | availability composition (series/redundancy) |
| 3 Consistency & CAP | ch. 5, 9 | Gilbert-Lynch CAP (2002/2012); Lamport (1978); PACELC | **CAP impossibility**; Lamport clock condition |
| 4 Partitioning & Replication | ch. 5, 6 | Dynamo (2007); Spanner (2012); Gifford/Thomas (1979) | **Quorum intersection R+W>N / 2W>N** |
| 5 Caching & CDNs | ch. 1 (caching), 11 | — | (computational: hit-ratio / effective latency) |
| 6 Async & Event-Driven | ch. 11 | Kafka (2011); Kreps *The Log* (2013) | (idempotency / delivery-semantics reasoning) |
| 7 Microservices & API design | ch. 4, 7 | Fallacies of Distributed Computing; sagas (Garcia-Molina & Salem 1987) | — |
| 8 Resilience & Observability | ch. 8 | Nygard *Release It!*; Google SRE; Dean & Barroso | FLP impossibility (consensus can't be guaranteed) |
| 9 Security, Cost & Well-Architected | — | AWS/Azure/Google Well-Architected pillars | (cost-of-the-nines computation) |
