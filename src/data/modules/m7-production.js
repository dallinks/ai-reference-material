export default
    {
      id: "m7", number: "07", title: "Production & Operations", accent: "#E040FB",
      desc: "Deployment, monitoring, security, and LLMOps for production AI systems.",
      lessons: [
        { id: "m7l1", title: "Production Architecture", duration: "19 min", tags: ["production","architecture","azure","scaling","resilience","caching"],
          content: [
            { type: "text", heading: "The Production Stack", body: "**API Gateway** — Rate limiting, auth, routing (Azure API Management)\n**Orchestration** — Your app logic: Semantic Kernel, LangChain, or custom code\n**Model Layer** — Azure OpenAI, Anthropic API, or self-hosted (vLLM)\n**Data Layer** — Vector DBs, traditional DBs, caches\n**Observability** — Logging, monitoring, tracing every LLM call" },

            { type: "text", heading: "The Request Lifecycle, End to End", body: "Trace one user request through the stack and the architecture becomes concrete:\n\n**1. Client → API Gateway** — Authentication, rate limiting, routing (Azure API Management). The gateway is also where you enforce per-user/per-tenant quotas so one caller can't starve the rest.\n\n**2. Gateway → Orchestration** — Your app logic assembles the request: pull conversation state, run input guardrails (m5l4), retrieve context via RAG (Module 4), build the prompt (m3l1).\n\n**3. Orchestration → Model** — *First check the cache* (below). On a miss, call the model — ideally through an abstraction layer so you can route or fail over (m1l3).\n\n**4. Response path** — Validate/parse the output (m3l3), run output guardrails, redact for logging, then return — usually **streamed** token-by-token so the user sees output immediately.\n\n**5. Observability tap** — Every hop emits a trace under one correlation ID: latency, tokens, cost, cache hit/miss, errors (m5l1, m7l2).\n\nTwo shapes exist: **synchronous/streaming** for chat (answer in real time) and **asynchronous/queued** for long agent jobs (return a job ID, process in the background, notify on completion). The wrong shape — a long agent behind a synchronous HTTP request — is a top cause of gateway timeouts." },

            { type: "text", heading: "Why LLM Apps Aren't Normal Web Apps", body: "An LLM application looks like a web service but breaks several assumptions normal web architecture is built on — and each break forces a design change:\n\n**Latency is seconds, not milliseconds** — A model call takes 1–30s, not 50ms. You can't hold a thread blocking on it the way you would a DB query; you stream or go async.\n**Responses stream** — Users expect token-by-token output (SSE or WebSockets), not one response after a long wait. This changes your API and UI layer.\n**Each request is expensive** — Tokens cost real money (m2l4), so caching and routing aren't micro-optimizations, they're core architecture.\n**Conversations are stateful** — Context grows across turns (m5l6); you manage and store it, unlike a stateless REST call.\n**Output is non-deterministic** — The same input can vary (m3l2), complicating caching, testing, and debugging.\n**The core dependency is external and rate-limited** — You don't own the model; you call a quota-limited API that can throttle or fail (next sections).\n\nKeep the familiar stateless-web patterns where they still apply (your app servers), but design explicitly for these six differences where they don't." },

            { type: "text", heading: "Azure AI Architecture", body: "**Azure OpenAI Service** — Managed GPT/embedding access with enterprise security\n**Azure AI Search** — Hybrid vector + keyword search with reranking\n**Azure AI Foundry** — Model catalog, prompt flow, evaluations\n**Container Apps / Functions** — Compute for orchestration\n**Application Insights** — Observability\n\nSemantic Kernel is built to orchestrate this entire stack." },

            { type: "text", heading: "Scaling the Bottleneck: It's the Model, Not Your Servers", body: "In a normal web app you scale by adding stateless app servers behind a load balancer — and you should still do that here; orchestration is cheap and stateless. But it won't be your bottleneck. **The constraint is the model provider's throughput quota** — measured in tokens-per-minute (TPM) and requests-per-minute (RPM).\n\nThis flips where you spend scaling effort:\n\n**Quota is the ceiling** — Hit your TPM limit and requests get 429-throttled no matter how many app servers you've added. Know your limits and monitor utilization against them.\n**Provisioned throughput (PTU)** — For steady, high volume, reserve dedicated capacity (Azure OpenAI PTUs): predictable latency, no noisy-neighbor throttling, at a higher fixed floor. Pay-as-you-go shares a quota pool and is cheaper at low/spiky volume (m2l5's logic, one level down).\n**Spread the load** — Distribute across multiple deployments/regions/providers to multiply effective quota and add resilience.\n**Queue and apply backpressure** — When demand exceeds quota, queue work and defer gracefully rather than hammering the API into more 429s.\n\nThe mental shift: you're not scaling compute you own, you're managing a *rate-limited external resource.*" },

            { type: "text", heading: "Caching Layers", body: "Because each call costs tokens and seconds, caching is load-bearing architecture, not an optimization. Four distinct layers, each a different mechanism and tradeoff:\n\n**Exact-match response cache** — Hash the full request (prompt + params); identical input returns the stored output instantly, at zero token cost. Safe and simple, but only hits on *identical* requests.\n\n**Prompt caching (provider-side)** — The provider reuses the KV-cache for a repeated prefix (m2l4): a big discount and lower latency on the static part (system prompt, tools, context). Structure prompts stable-prefix-first to exploit it.\n\n**Semantic cache** — Embed the query and return a cached answer for a *similar* (not identical) past query (m2l1). Big hit-rate gains on FAQ-style traffic — but a too-loose similarity threshold returns the *wrong* cached answer. Tune the threshold and scope by user/tenant.\n\n**Embedding cache** — Never re-embed unchanged text; cache vectors by content hash. Saves cost on ingestion and repeated queries.\n\nLayer them: semantic/exact cache short-circuits the whole call; prompt caching discounts the calls that get through; embedding cache cuts the retrieval cost underneath." },

            { type: "text", heading: "Resilience: Designing for a Flaky, Rate-Limited Dependency", body: "Your most important dependency — the model API — *will* rate-limit you, time out, and occasionally error or degrade. Production architecture treats that as normal, not exceptional:\n\n**Retry with exponential backoff + jitter** — The first response to a 429 or transient 5xx. Jitter prevents synchronized retry storms across your servers.\n**Timeouts** — Bound every model call; a hung request must not hold a thread indefinitely.\n**Circuit breaker** — When a provider/deployment starts failing, stop hammering it for a cooldown and fail fast, rather than piling on.\n**Multi-deployment / multi-provider fallback** — Route to a secondary deployment, region, or provider when the primary is throttled or down (the checklist's fallback chain). An abstraction layer (m1l3) makes this a config change.\n**Graceful degradation** — On exhaustion, degrade instead of hard-failing: serve a cached answer, drop to a smaller/faster model, or queue with an honest \"try again shortly.\"\n**Async for long work** — Long agent runs go on a queue with a job ID, so they can't time out a synchronous gateway.\n\nThe goal: a model-provider hiccup degrades quality or speed — it doesn't take your product down." },

            { type: "decision", heading: "Hosting the Model: API vs PTU vs Self-Host", rows: [
              ["Low or spiky volume, getting started", "Pay-as-you-go API — cheapest at low volume, zero infra"],
              ["Steady high volume, latency-sensitive", "Provisioned throughput (PTU) — reserved capacity, predictable latency"],
              ["Need quota beyond a single deployment", "Multiple deployments/regions, or add a second provider"],
              ["Strict data residency / air-gapped", "Self-host an open-weight model in your tenant (m2l5)"],
              ["Heavy, predictable volume where API cost dominates", "Self-host can win on unit cost — if you have the MLOps (m2l5)"],
              ["Provider-grade quality with zero ops", "Managed API (pay-go or PTU) — don't self-host the frontier"],
            ]},

            { type: "checklist", heading: "Scaling Patterns", items: [
              "Stateless app servers behind load balancer — standard web arch applies",
              "Cache embeddings, common query results, and identical-input responses",
              "Async processing for long-running agents: return job ID, process in background",
              "Model routing: simple queries → cheap model, complex → capable model",
              "Multi-model fallback: Azure OpenAI → Anthropic → local model",
              "Semantic caching: match similar (not just identical) queries",
            ]},

            { type: "text", heading: "Failure Modes & Antidotes", body: "**Quota exhaustion / noisy neighbor** — One feature or tenant burns the shared TPM and everyone else gets throttled. *Antidote:* per-tenant rate limits at the gateway, separate deployments for critical paths, monitor utilization.\n\n**Blocking on latency** — Synchronous threads held for seconds per call exhaust the pool under load. *Antidote:* async I/O, streaming, queue long jobs.\n\n**Cost runaway** — A traffic spike or agent loop multiplies spend (m2l4, m5l4). *Antidote:* spend caps, max-tokens, alerting on cost anomalies (m7l5).\n\n**Single-provider dependency** — The provider has an outage and so do you. *Antidote:* multi-provider fallback behind an abstraction layer.\n\n**Hard fail on model outage** — No degradation path, so a throttle becomes a user-facing 500. *Antidote:* cached/smaller-model fallback, graceful \"try again.\"\n\n**Gateway timeout on long agents** — A multi-minute agent behind a 30s HTTP request. *Antidote:* the async job-ID pattern.\n\n**No observability** — An incident and no traces to diagnose it. *Antidote:* correlation-ID tracing of every call from day one (m7l2).\n\nThe through-line: design for a slow, costly, rate-limited, occasionally-down external brain — and the rest of the architecture follows." }
          ]
        },
        { id: "m7l2", title: "LLMOps & Monitoring", duration: "18 min", tags: ["production","monitoring","llmops","tracing","drift","evaluation"],
          content: [
            { type: "text", heading: "Why LLMOps ≠ DevOps", body: "Standard DevOps monitoring — latency, error rate, throughput, CPU — all still applies, and you should keep it. But it has a blind spot that's fatal for AI: **a system can be perfectly 'healthy' and completely wrong.** Every request returns 200, p99 latency is great, zero exceptions — and the model is confidently hallucinating. Infra monitoring sees green; users see garbage.\n\nThat's the core of LLMOps: layered on top of ops, you must monitor **output quality** and **user behavior**, which infra metrics can't see. And two things drift underneath you that never drift in a normal app — the **inputs** (users ask new things) and the **model itself** (providers update it, you upgrade it).\n\nSo LLMOps = DevOps + quality observability + drift detection + an evaluation loop. That evaluation loop is the same discipline from m3l4 — eval sets, LLM-as-judge, gating — now run *continuously against live traffic* instead of once against a frozen set (the online half of offline-vs-online eval). The rest of this lesson is the mechanics of those additions. The mental shift: \"is it up?\" is necessary but nowhere near sufficient — you also need \"is it any good, right now, on today's traffic?\"" },

            { type: "checklist", heading: "What to Monitor", items: [
              "Latency: time to first token + total response time",
              "Throughput: requests per second",
              "Error rates: API failures, timeouts, rate limits",
              "Token usage and cost per request",
              "Response quality (automated eval or sampling)",
              "Hallucination rate",
              "Format compliance (valid JSON when expected?)",
              "User satisfaction (thumbs up/down)",
              "Task completion rate",
              "Escalation rate (AI → human handoff frequency)",
            ]},

            { type: "text", heading: "Three Layers of Signals: Ops, Quality, Behavior", body: "It helps to file everything in the list above into three layers, because each is measured a different way:\n\n**1. Ops / system signals** — Latency (TTFT + total), throughput, error/timeout/429 rates, token usage, cost. Measured the standard way (metrics, your APM). These tell you if it's *up and affordable.*\n\n**2. Quality signals** — Faithfulness, format/JSON compliance, hallucination rate, answer relevance. These can't be read off infra — they need **evaluation**: sampling + LLM-as-judge (m4l6) or automated checks. They tell you if it's *correct.*\n\n**3. User / behavior signals** — Thumbs up/down, task-completion rate, escalation/handoff rate, abandonment, follow-up-question rate. Emitted by real usage. They tell you if it's *useful* — and they're often your earliest warning, because users feel degradation before your metrics catch it.\n\nMost teams build layer 1 (it's familiar) and skip 2 and 3 — which is exactly how a system stays 'green' while quietly failing users. All three, or you're flying partially blind." },

            { type: "text", heading: "Tracing: The Unit of LLMOps Observability", body: "Metrics tell you *that* something's wrong; **traces** tell you *why.* A trace is the complete, replayable record of one request: the exact prompt sent (after templating and RAG injection), the retrieved context, every model and tool call with inputs/outputs, token counts, latency, cost, and the final response — all under one correlation ID (m5l1).\n\nFor a single call that's one span; for a RAG or agent request it's a **tree of spans** (retrieve → rerank → generate, or the whole agent loop), so you can see exactly which step misbehaved.\n\nWhy tracing is *the* LLMOps primitive: LLM bugs are qualitative — \"why did it give that answer?\" You can't reason about that from an aggregate latency chart. You answer it by pulling up the offending trace and reading the conversation the model actually saw (the debugging discipline of m4l7 and m5l1). A metric without a trace behind it is an alarm with no way to investigate it.\n\nMinimum bar: every model call is traced and the trace is queryable after the fact. This is also what makes governance lineage (m6l7) and eval-on-logged-traffic (below) possible." },

            { type: "text", heading: "Observability Tools", body: "**LLM-specific:** LangSmith, Helicone, Braintrust, Weights & Biases\n**General:** OpenTelemetry (Semantic Kernel has built-in OTel), Application Insights, Datadog\n\n**Minimum viable observability:** Log every LLM call with input, output, latency, token count, and cost." },

            { type: "text", heading: "Online Quality Monitoring: You Can't Eval Everything", body: "Offline evals (m4l6, m5l5) run your golden set *before* deploy. But production traffic is unlabeled and unbounded — you can't run a full eval on every live request without doubling cost and latency. Online quality monitoring bridges the gap with cheaper mechanisms:\n\n**Sampled judging** — Score a random sample (say 1–5%) of live responses with an LLM-as-judge (m4l6) for faithfulness/quality. Enough for a trend, a fraction of the cost.\n\n**Cheap proxy signals** — Free or near-free indicators that correlate with quality: format-validation pass rate, refusal/\"I don't know\" rate, response-length anomalies, retrieval hit rate, user thumbs. A spike in refusals or malformed JSON is an early quality alarm.\n\n**Periodic batch evals** — Run the full eval suite on a slice of *logged production traffic* (from your traces) nightly/weekly, so real-world cases — not just your golden set — gate quality over time.\n\n**Feed it back** — Surprising production failures become new golden-set cases (m4l6/m5l5), so the offline suite tracks reality.\n\nThe principle: continuous *sampling* of quality, not continuous *full* evaluation." },

            { type: "text", heading: "Drift: When Yesterday's System Degrades Today", body: "Unlike a deterministic app, an LLM system can get *worse over time without any code change.* Three kinds of drift:\n\n**Input / data drift** — Users start asking things you didn't design for; new document formats hit your RAG (m6l3). The system didn't change — its *inputs* did. *Detect:* monitor input distributions, embedding clusters of incoming queries, and the rate of low-retrieval/refusal cases.\n\n**Model drift** — The provider silently updates a model behind an alias, or you upgrade versions, and behavior shifts — prompts that worked now misbehave. *Detect:* pin exact version strings (the Model Update checklist), and diff eval scores across versions before switching.\n\n**Concept drift** — The world changed and old answers are now wrong (a policy updated, a product was discontinued). *Detect:* freshness monitoring on sources (m6l4) and declining satisfaction on affected topics.\n\nThe common thread: drift is invisible to ops metrics and only shows up in *quality and behavior* signals trended over time. This is why you watch metrics as time series with baselines, not just instantaneous dashboards — and why pinning versions turns silent model drift into a deliberate, tested upgrade." },

            { type: "checklist", heading: "Model Update Checklist", items: [
              "Pin specific model version strings — never use aliases in production",
              "Run full eval suite against new model versions before upgrading",
              "Canary deploy: route 5-10% traffic to new version, compare metrics",
              "Expect to re-optimize prompts when changing models",
              "Have multi-model fallback for downtime/rate limits",
            ]},

            { type: "text", heading: "Alerting: What's Worth Waking Someone For", body: "Signals are only useful if the right ones page the right person — and LLM systems are noisy, so naive alerting drowns you in false alarms. What actually merits an alert:\n\n**SLO breaches** — Error rate, p95 latency, or availability past threshold. Standard ops.\n**Cost anomalies** — Spend rate spikes well above baseline (a loop, abuse, a traffic surge) — catch it in minutes, not on the monthly invoice (m7l5).\n**Quality drops** — Sampled-judge score, format-compliance, or task-completion falling below a floor.\n**Behavior spikes** — A jump in refusal, escalation, or thumbs-down rate — often the *first* sign of a regression or drift.\n**Eval-gate failures** — A deploy or model change that fails the offline suite (m7l4) blocks the rollout.\n\nTwo rules against alarm fatigue: alert on **rates and trends, not single events** (one bad response is noise; a 3x refusal-rate jump is signal), and wire critical drops to **automated mitigation** where possible — fall back to a previous prompt/model or revert the canary (m6l6) rather than only paging a human at 3am." },

            { type: "text", heading: "Failure Modes & Antidotes", body: "**Silent quality regression** — Infra is green, answers are bad; nobody notices for weeks. *Antidote:* monitor quality and behavior signals (layers 2–3), not just ops.\n\n**No traces** — A user reports a bad answer and you can't reproduce or explain it. *Antidote:* trace every call; make traces queryable.\n\n**Model-alias drift** — \"latest\" silently changed under you and behavior shifted. *Antidote:* pin exact versions; upgrade deliberately through evals + canary.\n\n**Alert fatigue** — So many noisy alerts that real ones get ignored. *Antidote:* alert on trends/rates, tune thresholds, auto-mitigate the routine ones.\n\n**Ops-only monitoring** — Measuring uptime and latency but never quality. *Antidote:* the three-layer model; sampled online evals.\n\n**Dead-end signals** — You collect thumbs and judge scores but nothing acts on them. *Antidote:* close the loop — failures become eval cases, alerts trigger mitigation, trends inform prompt/model changes.\n\nThe through-line: in LLMOps, 'observable and healthy' must include *quality*, and every signal needs a path to action — measurement nobody acts on is just expensive logging." },

          ]
        },
        { id: "m7l3", title: "Security & Compliance", duration: "18 min", tags: ["production","security","compliance","owasp","threat-model"],
          content: [
            { type: "text", heading: "AI-Specific Threats", body: "**Prompt injection** — Malicious instructions in user input. Defense: sanitization, instruction hierarchy, output validation.\n\n**Data exfiltration** — Crafted prompts to extract training/user data. Defense: output filtering, access controls.\n\n**Denial of wallet** — Expensive queries to drive up API costs. Defense: rate limiting, cost caps, input length limits." },

            { type: "text", heading: "The OWASP LLM Top 10 (Your Threat Model)", body: "Security starts with a threat model — knowing *what* can go wrong. For LLM apps the industry-standard list is the **OWASP Top 10 for LLM Applications.** Treat it as the checklist of threats to design against:\n\n**Prompt injection** — Untrusted text hijacks the model's instructions (m3l3). The #1 risk.\n**Insecure output handling** — Trusting model output in a downstream system (SQL, shell, HTML) — injection one layer down (next block).\n**Training-data poisoning** — Tainted data corrupts a model or a RAG index.\n**Model denial of service / denial of wallet** — Expensive queries to exhaust quota or run up cost (m7l1).\n**Supply-chain vulnerabilities** — A compromised model, dataset, package, or tool (below).\n**Sensitive information disclosure** — Leaking PII, secrets, or other users' data (m6l7).\n**Insecure plugin/tool design** — Tools with too much power or weak validation (m5l2).\n**Excessive agency** — An agent that can do more than it should (below).\n**Overreliance** — Humans trusting wrong output (automation bias, m6l5).\n**Model theft** — Exfiltrating a proprietary model or its behavior.\n\nMost of these are covered deeply elsewhere in the course; this lesson's job is to put them in one frame and add production controls. Work the list against your own app — what's exposed, and what's the control?" },

            { type: "text", heading: "Insecure Output Handling: Trusting the Model Downstream", body: "An under-appreciated class of vulnerability: the danger isn't only what goes *into* the model, it's what you do with what comes *out.* Model output frequently flows into other systems — a database, a shell, an HTML page, a browser, an `eval()` — and if you trust it, the model (or an attacker via injection, m3l3) can drive a classic injection attack one layer down:\n\n**Generated SQL** → SQL injection if executed unsanitized.\n**Generated shell/code** → remote code execution if run unsandboxed.\n**Markdown/HTML in a response** → XSS, or data exfiltration via an auto-loaded image URL (m3l3).\n**A URL the model emits** → SSRF if your backend fetches it.\n\nThe rule: **treat every model output as untrusted user input.** Parameterize queries, sandbox code (m5l2), escape/sanitize rendered output, allow-list URLs and tool arguments, and validate structured output against a schema (m3l2) before acting on it. The model is not a trusted component — it's an untrusted text generator sitting in the middle of your system." },

            { type: "checklist", heading: "Security Layers", items: [
              "INPUT: Sanitize + validate all user inputs, limit length",
              "INPUT: Detect and block known injection patterns",
              "INPUT: Separate system and user message roles",
              "PROCESS: Least-privilege tool access for agents",
              "PROCESS: Sandbox any code execution",
              "PROCESS: Timeout all external calls",
              "OUTPUT: Check for PII before returning to users",
              "OUTPUT: Validate structured outputs against schemas",
              "OUTPUT: Content filtering for harmful/off-topic responses",
              "AUDIT: Log everything for compliance review",
            ]},

            { type: "text", heading: "Excessive Agency & the Confused Deputy", body: "When you give an LLM tools (Module 5), you create a classic security hazard: the **confused deputy.** The agent acts with *its own* credentials and permissions on behalf of a user who may not hold them — so if the agent can be steered (via prompt injection, m3l3) to misuse its access, it becomes a privilege-escalation vector. An injected support agent with a broad database tool can read or change records the *attacker* never had rights to.\n\n**Excessive agency** is the OWASP name for giving the agent more capability, permission, or autonomy than the task needs. The controls are the agent guardrails from m5l4, seen as security:\n\n**Least privilege** — The agent's tools and credentials grant the minimum needed; scope them to the *requesting user's* permissions, not a superuser's.\n**Bounded tools** — No open-ended \"run any SQL\" tool; narrow, validated actions only (m5l2).\n**Human gates** — Consequential actions require confirmation (m5l4).\n**Deterministic enforcement** — Permission checks live in code, not the prompt (m5l4) — the model can be talked out of a guideline, never out of an `if`.\n\nThe m5l4 principle restated as security: you can't stop an agent from being *tricked*, so make sure it lacks the access to do harm when it is." },

            { type: "text", heading: "The Data Boundary: Where Your Data Goes", body: "Every prompt is a potential data egress: a closed-model API call sends your input to a third party (m1l3, m6l7). For security and compliance, the model provider is part of your **attack surface** and your **data boundary**, so govern what crosses it:\n\n**Classify, then route** — Match data sensitivity to a destination: public API for non-sensitive, zero-retention enterprise API for confidential, regional/private deployment for regulated, self-host for air-gapped (the m6l7 decision table).\n**Never put secrets in a prompt** — API keys, credentials, connection strings. Assume the prompt can be extracted (m3l3) and may be logged.\n**Redact / tokenize PII** before it leaves your tenant (m6l7).\n**Verify provider terms** — Zero-retention and no-training-on-your-data should be contractual (enterprise agreements), not assumed.\n**Mind the whole path** — Data also lands in logs, traces (m7l2), and caches (m7l1); secure and govern those too.\n\nThis is the security lens on m6l7's governance: the same controls that satisfy GDPR/HIPAA also shrink your breach surface." },

            { type: "text", heading: "Compliance Frameworks", body: "**SOC 2** — Ensure your app layer meets requirements (most AI providers are SOC 2)\n**HIPAA** — Requires BAAs with AI providers. Azure OpenAI has HIPAA-eligible configs.\n**GDPR** — Right to deletion extends to vector stores + training data.\n**EU AI Act** — Risk-level classification. High-risk (hiring, credit) has strict transparency requirements.\n**Industry-specific** — Financial (SEC/FINRA), Government (FedRAMP), Education (FERPA)" },

            { type: "text", heading: "Supply Chain & Model Provenance", body: "Your AI system depends on components you didn't build: foundation models, open weights, embedding models, datasets, libraries, and increasingly third-party **tools and MCP servers** (m5l2). Each is supply-chain attack surface:\n\n**Compromised models / weights** — An open-weight model from an unvetted source could be backdoored or poisoned. *Antidote:* pull from trusted registries, verify checksums, prefer reputable providers.\n**Poisoned data** — Tainted training or RAG data skews behavior or plants triggers. *Antidote:* vet and control data sources (m6l7); treat ingested third-party content as untrusted (indirect injection, m3l3).\n**Malicious dependencies / tools** — A rogue package or MCP server with access to your data or actions. *Antidote:* scan dependencies, pin versions, and **sandbox third-party tools** as isolated, least-privilege processes (m5l2).\n**Indirect injection via dependencies** — Attack payloads hidden in a library's docs or a tool's outputs that your agent later reads (m3l3).\n\nApply normal software supply-chain hygiene (SBOMs, pinning, scanning) *plus* the AI-specific provenance checks. As you adopt more third-party agents and MCP servers, this surface grows fast." },

            { type: "text", heading: "Security Testing: Red-Teaming & the Review", body: "You can't prove an AI system is secure by reading the code — you probe it, the way an attacker would.\n\n**Red-teaming** — Deliberately attack your own app: injection and jailbreak attempts (m3l3), data-exfiltration prompts, tool-misuse attempts, attempts to push an agent past its scope. Do it manually and with adversarial-prompt datasets. Every successful attack becomes a fixed, regression-tested case.\n\n**Adversarial regression suite** — Fold known attacks into your eval suite (m5l5) so a future change can't silently reopen them. Run it in CI (m7l4) as a security gate.\n\n**Pre-launch security review** — A structured review keyed to the OWASP list above: for each threat, what's the exposure and the control? Don't ship a tool-wielding or data-touching agent without it.\n\n**Ongoing testing** — The threat landscape and the models both shift; re-test after model upgrades (drift, m7l2) and on a schedule. Some orgs run internal bug bounties.\n\nThe mindset: assume a motivated attacker will try to make your AI do something it shouldn't, and earn confidence by failing to break it yourself first." },

            { type: "checklist", heading: "Security Review Checklist", items: [
              "Threat-model the app against the OWASP LLM Top 10 — for each, name the exposure and the control",
              "Treat model output as untrusted: parameterize SQL, sandbox code, escape rendered HTML, allow-list URLs/args",
              "Least privilege for agent tools and credentials — scope to the requesting user, enforce in code not the prompt",
              "Classify data and route by sensitivity; never put secrets in prompts; redact PII before egress (m6l7)",
              "Confirm provider data terms contractually (zero-retention, no training on your data)",
              "Secure the whole data path — logs, traces, and caches contain prompt data too (m7l2)",
              "Vet and pin models, datasets, packages, and tools; sandbox third-party/MCP tools (m5l2)",
              "Red-team before launch; keep adversarial cases as a CI regression gate (m5l5, m7l4)",
              "Map controls to compliance obligations (SOC 2, HIPAA, GDPR, EU AI Act) and involve legal early",
              "Re-test security after every model upgrade and on a schedule — the landscape drifts (m7l2)",
            ]}
          ]
        },
        { id: "m7l4", title: "CI/CD for AI Systems", duration: "19 min", tags: ["production","cicd","testing","deployment","devops","evals","versioning"],
          content: [
            { type: "text", heading: "Why AI CI/CD Is Different", body: "Traditional CI/CD: code change → tests pass → deploy. AI CI/CD adds a new dimension: your system's behavior depends on prompts, models, and data — not just code. A prompt change that passes unit tests can degrade production quality. A model version bump can break prompts that worked fine before.\n\nYou need three things traditional CI/CD doesn't cover:\n1. **Eval-gated deployment** — automated quality checks before any prompt or model change goes live\n2. **Prompt versioning** — treat prompts as first-class artifacts with history and rollback\n3. **Data pipeline monitoring** — detect when your RAG data drifts or goes stale" },

            { type: "text", heading: "The Three Things You're Versioning", body: "Normal CI/CD versions one thing: code. AI CI/CD versions a **triple — code + prompt + model** (and often a fourth: the data/RAG index). Change *any* of them and behavior changes:\n\n**Code** — your orchestration, tools, parsing. Versioned as usual.\n**Prompts** — a one-word wording tweak can swing quality across thousands of cases (m3l3). Prompts are production logic and must be versioned like code, not edited live in a console.\n**Model** — the same prompt behaves differently on GPT-4o vs Claude vs a new version of the same model (m2l5, m7l2). \"latest\" silently changing is a deploy you didn't make.\n**Data / index** — re-chunking or swapping the embedding model changes retrieval (m4l2), so the index version is part of the system's behavior too.\n\nThe consequence: the deployable, testable, *rollback-able* unit isn't \"the code\" — it's the **(code, prompt, model, index) tuple.** \"It works on my machine\" becomes \"it works on this exact combination,\" so all four travel together through the pipeline and roll back together." },

            { type: "text", heading: "The AI Deployment Pipeline", body: "**Stage 1: Code Review**\nStandard PR review. Prompts reviewed like code — diffs visible, approval required.\n\n**Stage 2: Unit Tests**\nTool functions work correctly. Input validation. Error handling. Standard software testing.\n\n**Stage 3: Eval Suite (THE KEY STAGE)**\nRun your full evaluation dataset against the changed system. Compare scores to the current production baseline. Gate deployment on quality thresholds.\n\n**Stage 4: Canary Deployment**\nRoute 5-10% of traffic to the new version. Monitor quality metrics and error rates in real-time.\n\n**Stage 5: Full Rollout**\nIf canary metrics hold for 24-48 hours, promote to 100%.\n\n**Stage 6: Post-Deploy Monitoring**\nContinuous eval sampling. Alert on quality degradation." },

            { type: "text", heading: "The Eval Gate: Tests That Aren't Pass/Fail", body: "The defining difference of an AI pipeline is the **eval gate**, and it doesn't behave like a normal test. Unit tests are deterministic: a single input either passes or fails. An eval gate is **statistical** — you run a candidate (new prompt/model/code) against your eval set (m5l5) and gate on *aggregate* quality, because individual outputs vary run to run (m3l2).\n\nHow the gate actually works:\n\n**Compare to a baseline, not an absolute.** Score the candidate and the current production version on the same set; block the deploy if the candidate is meaningfully *worse*. Relative comparison controls for the eval's own noise.\n**Gate on aggregate + no critical regressions.** Require the overall metric (faithfulness, accuracy) to hold *and* zero failures on a set of must-pass cases (safety, known bugs).\n**Set a regression budget.** Define the allowed drop (e.g., \"accuracy must not fall >1%\"), since exact-match across a stochastic system is unrealistic — m5l5's pass-rate thinking applied as a merge gate.\n**Include adversarial cases.** The security regression suite from m7l3 runs here too.\n\nThis is why a robust eval set (m4l6/m5l5) is the prerequisite for AI CI/CD: without it, you have no gate, and every deploy is a guess." },

            { type: "code", heading: "Eval-Gated GitHub Actions Pipeline", lang: "yaml", code: `# .github/workflows/ai-deploy.yml
name: AI System Deploy

on:
  push:
    branches: [main]
    paths:
      - 'prompts/**'
      - 'src/**'
      - 'config/models.yaml'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      - run: pytest tests/unit/ -v

  eval-gate:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r requirements.txt
      
      - name: Run eval suite
        env:
          AZURE_OPENAI_KEY: \${{ secrets.AZURE_OPENAI_KEY }}
          AZURE_OPENAI_ENDPOINT: \${{ secrets.AZURE_OPENAI_ENDPOINT }}
        run: |
          python evals/run_evals.py \
            --eval-set evals/datasets/production_eval.jsonl \
            --output evals/results/current_run.json
      
      - name: Compare against baseline
        run: |
          python evals/compare_results.py \
            --baseline evals/results/production_baseline.json \
            --current evals/results/current_run.json \
            --threshold-file evals/thresholds.yaml
        # Fails the pipeline if quality drops below thresholds

      - name: Upload eval results
        uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: evals/results/

  canary-deploy:
    needs: eval-gate
    runs-on: ubuntu-latest
    environment: production-canary
    steps:
      - name: Deploy canary (10% traffic)
        run: |
          az containerapp revision copy \
            --name ai-service \
            --resource-group prod-rg \
            --traffic-weight latest=10 \
            --traffic-weight stable=90` },
            { type: "code", heading: "Eval Runner Script — Python", lang: "python", code: `import json
import asyncio
from dataclasses import dataclass

@dataclass
class EvalResult:
    query: str
    expected: str
    actual: str
    score: float        # 0-1
    latency_ms: float
    token_count: int
    passed: bool

async def run_eval_suite(
    eval_file: str, 
    pipeline_fn,       # your RAG/agent pipeline function
    output_file: str
):
    """Run evaluation suite and produce results report."""
    
    with open(eval_file) as f:
        eval_cases = [json.loads(line) for line in f]
    
    results = []
    for case in eval_cases:
        start = time.time()
        
        actual = await pipeline_fn(case["query"])
        
        latency = (time.time() - start) * 1000
        
        # Score using LLM-as-judge
        score = await score_response(
            query=case["query"],
            expected=case["expected_answer"],
            actual=actual["answer"],
            criteria=case.get("criteria", "accuracy")
        )
        
        results.append(EvalResult(
            query=case["query"],
            expected=case["expected_answer"],
            actual=actual["answer"],
            score=score,
            latency_ms=latency,
            token_count=actual.get("token_count", 0),
            passed=score >= case.get("min_score", 0.7)
        ))
    
    # Aggregate metrics
    report = {
        "total": len(results),
        "passed": sum(1 for r in results if r.passed),
        "pass_rate": sum(1 for r in results if r.passed) / len(results),
        "avg_score": sum(r.score for r in results) / len(results),
        "avg_latency_ms": sum(r.latency_ms for r in results) / len(results),
        "p95_latency_ms": sorted(r.latency_ms for r in results)[
            int(len(results) * 0.95)],
        "avg_tokens": sum(r.token_count for r in results) / len(results),
        "failures": [
            {"query": r.query, "expected": r.expected, 
             "actual": r.actual, "score": r.score}
            for r in results if not r.passed
        ]
    }
    
    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"Pass rate: {report['pass_rate']:.1%}")
    print(f"Avg score: {report['avg_score']:.3f}")
    print(f"Avg latency: {report['avg_latency_ms']:.0f}ms")
    print(f"Failures: {len(report['failures'])}/{report['total']}")
    
    return report

async def score_response(query, expected, actual, criteria) -> float:
    """LLM-as-judge scoring."""
    result = await judge_llm.ainvoke(f"""
    Score how well the actual answer addresses the query compared 
    to the expected answer. Score from 0.0 to 1.0.
    
    Criteria: {criteria}
    Query: {query}
    Expected answer: {expected}
    Actual answer: {actual}
    
    Return ONLY a number between 0.0 and 1.0.
    """)
    return float(result.content.strip())` },
            { type: "text", heading: "Prompt Versioning", body: "Prompts should be versioned, stored outside application code, and tracked with the same rigor as database migrations.\n\n**Option 1: File-based** — Prompts in a /prompts directory, version-controlled in git. Simple, works for small teams.\n\n**Option 2: Database-backed** — Prompts stored in a database with version history. Enables A/B testing and instant rollback without deployment.\n\n**Option 3: Managed platform** — LangSmith, Humanloop, PromptLayer. Track versions, run evals, compare performance across versions.\n\nRegardless of approach: every prompt change should trigger the eval suite. Prompt regressions are silent and deadly." },
            { type: "code", heading: "Prompt Version Manager — C#", lang: "csharp", code: `public class PromptManager
{
    private readonly IPromptStore _store; // DB or file-backed
    
    /// <summary>
    /// Load a prompt by name, optionally pinning to a version.
    /// </summary>
    public async Task<PromptTemplate> GetPromptAsync(
        string name, int? version = null)
    {
        var prompt = version.HasValue
            ? await _store.GetVersionAsync(name, version.Value)
            : await _store.GetActiveAsync(name);
        
        if (prompt == null)
            throw new PromptNotFoundException(name, version);
        
        return prompt;
    }
    
    /// <summary>
    /// Save a new version of a prompt. Does NOT activate it.
    /// </summary>
    public async Task<int> SaveNewVersionAsync(
        string name, string template, string changeNote)
    {
        var newVersion = await _store.SaveVersionAsync(
            name, template, changeNote, activatedBy: null);
        
        // Log for audit
        _logger.LogInformation(
            "Prompt '{Name}' v{Version} saved: {Note}",
            name, newVersion, changeNote);
        
        return newVersion;
    }
    
    /// <summary>
    /// Activate a prompt version (makes it the default).
    /// Only call after eval suite passes.
    /// </summary>
    public async Task ActivateVersionAsync(
        string name, int version, string activatedBy)
    {
        var evalPassed = await RunEvalForPromptAsync(name, version);
        if (!evalPassed)
            throw new EvalFailedException(
                $"Prompt '{name}' v{version} failed eval gate");
        
        await _store.ActivateVersionAsync(name, version, activatedBy);
        
        _logger.LogInformation(
            "Prompt '{Name}' v{Version} activated by {User}",
            name, version, activatedBy);
    }
    
    /// <summary>
    /// Emergency rollback to previous version.
    /// </summary>
    public async Task RollbackAsync(string name, string reason)
    {
        var previousVersion = await _store.GetPreviousActiveAsync(name);
        await _store.ActivateVersionAsync(
            name, previousVersion.Version, "ROLLBACK");
        
        _logger.LogWarning(
            "ROLLBACK: Prompt '{Name}' rolled back to v{Version}: {Reason}",
            name, previousVersion.Version, reason);
    }
}

// Usage:
var manager = new PromptManager(store);

// Load active prompt
var prompt = await manager.GetPromptAsync("invoice-extraction");
var rendered = prompt.Render(new { DocumentText = invoiceText });

// Deploy new version (after writing + testing)
var v = await manager.SaveNewVersionAsync(
    "invoice-extraction", newTemplate, "Added tax field handling");
await manager.ActivateVersionAsync("invoice-extraction", v, "dallin");

// Oh no, quality dropped
await manager.RollbackAsync("invoice-extraction", "Tax extraction accuracy dropped 15%");` },

            { type: "text", heading: "Deploying Safely: Canary, Shadow & Rollback", body: "Offline evals reduce risk but can't fully predict live behavior on real traffic — so AI leans hard on progressive deployment (the same machinery as m6l6):\n\n**Shadow deploy** — Run the new version alongside production on real requests *without* serving its output to users; compare its decisions to the live one. Zero-risk, honest measurement before exposure.\n**Canary** — Route a small % of live traffic to the new (prompt, model) and watch the online quality and behavior signals (m7l2) against the baseline. Expand only if they hold.\n**A/B for prompt/model changes** — Because you often can't tell offline which of two prompts is better, run them against each other on live traffic and let the metrics decide.\n**Instant rollback** — Since the deployable unit is the (code, prompt, model, index) tuple, rollback must revert *all* of it together — a prompt rollback that leaves a new model in place is a different, untested system. Keep the previous tuple one switch away (the auto-revert seatbelt, m6l6/m7l2).\n\nThe principle: validate offline to ship *safely*, then validate online because the real world always holds cases your eval set didn't." },

            { type: "text", heading: "Failure Modes & Antidotes", body: "**Untracked prompt change** — Someone edits a prompt in a console; prod drifts with no diff, no review, no rollback. *Antidote:* prompts in version control, deployed through the pipeline (m3l3).\n\n**Silent model-upgrade breakage** — The provider moves an alias or you bump a version and prompts quietly degrade. *Antidote:* pin exact versions; gate upgrades through the eval suite (m7l2).\n\n**Eval set too small or stale** — The gate passes but real quality regressed because the set didn't cover the broken case. *Antidote:* grow the set; feed production failures back into it (m4l6).\n\n**Gating on the wrong metric** — Optimizing one number while another regresses (m5l5). *Antidote:* gate on a metric *set* plus must-pass critical cases.\n\n**Flaky eval gate** — Non-determinism makes CI red intermittently. *Antidote:* pass-rate thresholds and enough samples, not single-run assertions (m5l5).\n\n**Partial rollback** — Reverting the prompt but not the model (or index), shipping an untested combination. *Antidote:* version and roll back the whole tuple together.\n\nThe through-line: treat prompts, models, and the index as first-class versioned artifacts gated by statistical evals — then most AI deploy disasters become impossible." },

            { type: "checklist", heading: "AI CI/CD Checklist", items: [
              "Eval dataset exists with 50+ cases covering happy paths and edge cases",
              "Eval runs automatically on every PR that touches prompts, models, or pipeline code",
              "Quality thresholds are defined: minimum pass rate, minimum avg score, max latency",
              "Deployment is gated on eval results — failing evals block the merge/deploy",
              "Prompts are versioned and stored in a trackable system (git, DB, or managed platform)",
              "Rollback is one command: can revert to previous prompt version in <5 minutes",
              "Canary deployments route 5-10% traffic before full rollout",
              "Post-deploy monitoring alerts on quality degradation within 24 hours",
              "Model version changes go through the same eval gate as prompt changes",
              "Eval dataset is updated monthly with real production failures",
              "Cost per request is tracked per deployment version",
            ]}
          ]
        },
        { id: "m7l5", title: "Cost Management & Spend Monitoring", duration: "19 min", tags: ["production","cost","monitoring","optimization","finops","attribution"],
          content: [
            { type: "text", heading: "Why AI Costs Surprise You", body: "AI system costs are fundamentally different from traditional software. Traditional: cost scales with compute (predictable). AI: cost scales with tokens (variable, user-dependent).\n\nA single adversarial or verbose user can 10x your daily spend. A bad prompt that triggers retries can burn through budget in hours. A runaway agent loop can rack up thousands in minutes.\n\nYou need three things: visibility (where is money going?), limits (prevent runaways), and optimization (get the same output for less)." },

            { type: "text", heading: "Cost Attribution: Whose Spend Is This?", body: "\"Visibility\" sounds obvious and is the step teams skip — they see a $40K monthly bill and can't say *why.* The fix is **cost attribution**: tag every single LLM call with the dimensions you'll want to slice by, then aggregate.\n\nThe dimensions that matter:\n\n**User / team / customer** — who incurred it (for chargeback and abuse detection).\n**Feature / endpoint** — which product surface (the chatbot? the summarizer? the agent?).\n**Model** — where the expensive-model spend concentrates.\n**Request type** — is it the 5% of requests that are 60% of cost?\n\nWith these tags, an opaque \"$40K\" becomes \"the research-agent feature, on Opus, for three enterprise customers, is 70% of spend\" — which is *actionable* (route it to a cheaper model, cap it, or price it). Without them you can only panic.\n\nThe tracking middleware below is exactly this: it records tokens, cost, and tags per call into a store you can query (the dashboard SQL). Attribution is the prerequisite for every other cost decision — you can't optimize or budget what you can't slice." },

            { type: "code", heading: "Token & Cost Tracking Middleware — C#", lang: "csharp", code: `public class LLMCostTracker
{
    private readonly ILogger _logger;
    private readonly IMetricsService _metrics;
    
    // Pricing per 1M tokens (keep updated)
    private static readonly Dictionary<string, (decimal Input, decimal Output)> 
        Pricing = new()
    {
        ["gpt-4o"] =          (2.50m, 10.00m),
        ["gpt-4o-mini"] =     (0.15m, 0.60m),
        ["claude-sonnet"] =   (3.00m, 15.00m),
        ["claude-haiku"] =    (0.80m, 4.00m),
        ["embedding-small"] = (0.02m, 0.00m),
    };
    
    /// <summary>
    /// Wrap every LLM call with cost tracking.
    /// </summary>
    public async Task<T> TrackAsync<T>(
        string operationName,
        string model,
        Func<Task<T>> llmCall,
        string? userId = null,
        string? requestId = null)
    {
        var sw = Stopwatch.StartNew();
        
        try
        {
            var result = await llmCall();
            sw.Stop();
            
            // Extract token counts from result
            // (implementation depends on your SDK)
            var usage = ExtractUsage(result);
            
            var cost = CalculateCost(
                model, usage.InputTokens, usage.OutputTokens);
            
            // Record metrics
            _metrics.RecordLLMCall(new LLMCallMetrics
            {
                Operation = operationName,
                Model = model,
                InputTokens = usage.InputTokens,
                OutputTokens = usage.OutputTokens,
                TotalTokens = usage.InputTokens + usage.OutputTokens,
                CostUSD = cost,
                LatencyMs = sw.ElapsedMilliseconds,
                UserId = userId,
                RequestId = requestId,
                Timestamp = DateTime.UtcNow,
                Success = true
            });
            
            // Alert on expensive single calls
            if (cost > 0.50m)
            {
                _logger.LogWarning(
                    "Expensive LLM call: {Op} cost {Cost:C} " +
                    "({InputTokens} in, {OutputTokens} out) " +
                    "model={Model} user={User}",
                    operationName, cost, usage.InputTokens,
                    usage.OutputTokens, model, userId);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _metrics.RecordLLMCall(new LLMCallMetrics
            {
                Operation = operationName,
                Model = model,
                LatencyMs = sw.ElapsedMilliseconds,
                Success = false,
                Error = ex.Message
            });
            throw;
        }
    }
    
    private decimal CalculateCost(
        string model, int inputTokens, int outputTokens)
    {
        if (!Pricing.TryGetValue(model, out var prices))
            return 0m; // unknown model — log warning
        
        return (inputTokens / 1_000_000m * prices.Input) +
               (outputTokens / 1_000_000m * prices.Output);
    }
}

// Usage — wrap every LLM call:
var response = await costTracker.TrackAsync(
    operationName: "invoice-extraction",
    model: "claude-sonnet",
    llmCall: () => kernel.InvokePromptAsync(extractionPrompt),
    userId: currentUser.Id,
    requestId: HttpContext.TraceIdentifier
);` },
            { type: "code", heading: "Cost Dashboard Query — SQL", lang: "sql", code: `-- Daily cost by operation (run against your metrics table)
SELECT 
    CAST(timestamp AS DATE) AS day,
    operation,
    model,
    COUNT(*) AS calls,
    SUM(input_tokens) AS total_input_tokens,
    SUM(output_tokens) AS total_output_tokens,
    SUM(cost_usd) AS total_cost,
    AVG(cost_usd) AS avg_cost_per_call,
    AVG(latency_ms) AS avg_latency,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95_latency
FROM llm_call_metrics
WHERE timestamp >= DATEADD(day, -30, GETDATE())
GROUP BY CAST(timestamp AS DATE), operation, model
ORDER BY total_cost DESC;

-- Top cost drivers (which operations burn the most?)
SELECT 
    operation,
    model,
    COUNT(*) AS daily_avg_calls,
    AVG(cost_usd) AS avg_cost_per_call,
    SUM(cost_usd) AS total_30d_cost,
    AVG(input_tokens) AS avg_input_tokens,
    AVG(output_tokens) AS avg_output_tokens
FROM llm_call_metrics
WHERE timestamp >= DATEADD(day, -30, GETDATE())
GROUP BY operation, model
ORDER BY total_30d_cost DESC;

-- Anomaly detection: users/requests with unusually high cost
SELECT 
    user_id,
    COUNT(*) AS calls_today,
    SUM(cost_usd) AS total_cost_today,
    MAX(cost_usd) AS max_single_call_cost
FROM llm_call_metrics
WHERE timestamp >= CAST(GETDATE() AS DATE)
GROUP BY user_id
HAVING SUM(cost_usd) > 10.00  -- flag users over $10/day
ORDER BY total_cost_today DESC;` },

            { type: "text", heading: "Unit Economics: Cost per Outcome, Not per Token", body: "Total monthly tokens is a vanity metric. The number that tells you whether the system is healthy is **cost per business outcome** — per resolved ticket, per processed invoice, per active user, per closed lead.\n\nWhy it's the right unit:\n\n**It's comparable to value.** \"$0.012 per resolved ticket\" sits right next to \"$6 saved per resolved ticket\" (m6l8) — the ROI is immediate and obvious.\n**It normalizes for growth.** Total spend rising as you onboard users is fine *if* cost-per-user is flat or falling. Cost-per-outcome separates healthy growth from a leak.\n**It sets pricing.** If you resell the feature, unit cost is your floor.\n\nWorked example: a support bot does 20,000 tickets/month at ~$0.012/ticket of model cost = ~$240/mo, against ~$6 human cost per ticket — trivially economic. But if a prompt change pushes it to $0.05/ticket, the *total* bill (~$1,000) might not alarm anyone while the *unit* cost quietly quadrupled. Track the unit, trend it, and alert on it — it catches regressions the gross number hides." },

            { type: "text", heading: "Spend Limits & Circuit Breakers", body: "Implement limits at three levels:\n\n**Per-request limit** — Maximum tokens and cost for a single LLM call. Prevents runaway agent loops. Typical: 10K output tokens, $0.50 max per request.\n\n**Per-user limit** — Daily or hourly cost cap per user. Prevents abuse and surprise bills. Typical: $5-20/day per user depending on use case.\n\n**System-wide limit** — Total daily spend across all users. Emergency stop if something goes very wrong. Typical: 2-3x your expected daily spend.\n\nWhen a limit is hit: degrade gracefully. Use a cheaper model, return a cached response, or queue the request for later." },
            { type: "code", heading: "Spend Limiter — Python", lang: "python", code: `from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

class SpendLimiter:
    """Rate limiter based on spend, not request count."""
    
    def __init__(
        self,
        per_request_max: float = 0.50,
        per_user_daily_max: float = 10.00,
        system_daily_max: float = 500.00
    ):
        self.per_request_max = per_request_max
        self.per_user_daily_max = per_user_daily_max
        self.system_daily_max = system_daily_max
        self.user_spend: dict[str, float] = defaultdict(float)
        self.system_spend: float = 0.0
        self.last_reset: datetime = datetime.utcnow()
    
    def _maybe_reset(self):
        """Reset daily counters at midnight UTC."""
        now = datetime.utcnow()
        if now.date() > self.last_reset.date():
            self.user_spend.clear()
            self.system_spend = 0.0
            self.last_reset = now
    
    def check_budget(self, user_id: str, estimated_cost: float) -> dict:
        """Check if a request is within budget. Call BEFORE the LLM call."""
        self._maybe_reset()
        
        # Per-request check
        if estimated_cost > self.per_request_max:
            return {
                "allowed": False,
                "reason": f"Estimated cost ({estimated_cost:.4f}) "
                          f"exceeds per-request limit "
                          f"({self.per_request_max:.2f})",
                "suggestion": "reduce_context"  # use fewer RAG chunks
            }
        
        # Per-user check
        user_total = self.user_spend[user_id] + estimated_cost
        if user_total > self.per_user_daily_max:
            return {
                "allowed": False,
                "reason": f"User daily spend ({self.user_spend[user_id]:.2f})"
                          f" would exceed limit ({self.per_user_daily_max})",
                "suggestion": "downgrade_model"  # use cheaper model
            }
        
        # System check
        if self.system_spend + estimated_cost > self.system_daily_max:
            return {
                "allowed": False,
                "reason": "System daily budget exhausted",
                "suggestion": "queue_request"  # try again tomorrow
            }
        
        return {"allowed": True}
    
    def record_spend(self, user_id: str, actual_cost: float):
        """Record actual spend after an LLM call completes."""
        self._maybe_reset()
        self.user_spend[user_id] += actual_cost
        self.system_spend += actual_cost

# Usage in your API:
limiter = SpendLimiter(
    per_request_max=0.50,
    per_user_daily_max=10.00,
    system_daily_max=500.00
)

async def handle_request(user_id: str, query: str):
    estimated = estimate_cost(query, model="claude-sonnet")
    
    budget = limiter.check_budget(user_id, estimated)
    if not budget["allowed"]:
        if budget["suggestion"] == "downgrade_model":
            # Graceful degradation: try cheaper model
            return await handle_with_model(query, "claude-haiku")
        elif budget["suggestion"] == "reduce_context":
            # Use fewer RAG chunks
            return await handle_with_fewer_chunks(query, max_chunks=2)
        else:
            return {"error": "Daily usage limit reached. Try again tomorrow."}
    
    result = await process_query(query)
    limiter.record_spend(user_id, result["actual_cost"])
    return result` },

            { type: "text", heading: "Budgeting & Forecasting", body: "Because spend is variable, you budget *probabilistically*, not as a fixed line item. The model is simple:\n\n  **monthly cost ≈ volume × tokens-per-request × blended price-per-token**\n\nForecast by taking your measured unit cost (above) × projected volume, then adjust for three things people forget: **growth** (more users/requests), **model-mix shift** (a feature graduating from Haiku to Opus changes the blended price), and **feature creep** (every new capability adds calls — agents especially multiply them, m2l4).\n\nThree practices keep budgets honest:\n\n**Set budgets with headroom** and tier alerts at 50% / 80% / 100% of budget (m7l2), so you react before the overage, not after the invoice.\n**Reserved capacity for predictable volume** — provisioned throughput (PTU, m7l1) converts variable per-token cost into a fixed, forecastable floor when volume is steady and high.\n**Re-forecast on every major change** — a new feature, a model swap, or a price change (prices keep falling, m1l3) all move the curve.\n\nThe goal: no surprises on the invoice, because you predicted the range and instrumented the alerts." },

            { type: "decision", heading: "Optimization Tactics by Impact", rows: [
              ["Prompt caching (highest impact)", "Keep system prompt as stable prefix. 50-90% cost reduction on input tokens."],
              ["Model routing", "Classify complexity, route 70% of queries to cheapest model. 3-5x average cost reduction."],
              ["Right-size max_tokens", "Classification=50, extraction=500, generation=1000. Prevents over-generation."],
              ["Batch API for offline work", "50% cheaper than real-time. Use for nightly reports, bulk processing, eval runs."],
              ["Context trimming", "Send only top 3-5 relevant chunks, not top 10. Less noise, lower cost, often better quality."],
              ["Semantic caching", "Cache responses for similar queries. 100% cost savings on cache hits. Best for FAQ-like workloads."],
              ["Streaming with early stopping", "Stream response; stop when you have the answer. Saves output tokens on verbose models."],
            ]},

            { type: "text", heading: "Governance: Quotas, Chargeback & Guardrails", body: "At org scale, a single shared API key is a tragedy of the commons — one team's experiment can blow the whole budget. **FinOps governance** assigns accountability:\n\n**Per-team budgets and quotas** — Each team/feature gets a spend cap and TPM allocation (m7l1), enforced at the gateway. One team hitting its limit doesn't starve the rest.\n**Chargeback / showback** — Attribute spend back to each team (chargeback = they pay; showback = they just see it). Visibility alone changes behavior — teams optimize once the cost is *theirs*.\n**Approval for expensive choices** — Using a frontier/reasoning model (m2l5) or raising a quota requires sign-off, not a silent config change.\n**Tie governance to the rest** — Attribution (above) feeds chargeback; alerts (m7l2) catch breaches; the optimization tactics (m2l4) are how teams get back under budget.\n\nThe shift from a startup's \"watch the bill\" to an enterprise's \"every dollar has an owner.\" Without it, cost is everyone's problem and therefore no one's." },

            { type: "checklist", heading: "Cost Management Checklist", items: [
              "Every LLM call logs: operation name, model, input tokens, output tokens, cost, latency, user ID",
              "Daily cost dashboard exists and is reviewed (even if just a SQL query)",
              "Per-request spend limit prevents any single call from exceeding $X",
              "Per-user daily limit prevents abuse and surprise bills",
              "System-wide daily limit with alerting at 50%, 80%, and 100% thresholds",
              "Graceful degradation when limits hit: cheaper model, not hard failure",
              "Cost is tracked per operation type: know which features are expensive",
              "Monthly cost review: compare actual vs budget, identify optimization opportunities",
              "Prompt caching is verified working (check provider dashboard for cache hit rates)",
              "Model routing is in place: simple queries go to cheap models",
              "Alerts fire if daily spend exceeds 2x the 7-day average",
              "Runaway agent detection: alert if any single request makes >10 LLM calls",
            ]}
          ]
        },
        { id: "m7l6", title: "Azure Deployment Patterns", duration: "19 min", tags: ["production","azure","deployment","infrastructure","networking","scaling"],
          content: [
            { type: "text", heading: "The Azure AI Stack", body: "For .NET teams, Azure provides an integrated stack purpose-built for AI workloads. The key is choosing the right compute tier and connecting services correctly.\n\n**Azure OpenAI Service** — Managed GPT/Claude access with enterprise security, private networking, content filtering, and regional deployment.\n\n**Azure AI Search** — Vector + keyword hybrid search with built-in semantic ranking. The RAG backbone.\n\n**Azure AI Foundry** — Model catalog, prompt flow orchestration, evaluation tools, and deployment management.\n\n**Azure Container Apps** — Serverless containers for your orchestration layer. Scales to zero, built-in traffic splitting for canary deploys.\n\n**Azure Functions** — Event-driven compute for ingestion pipelines, scheduled jobs, and webhook handlers.\n\n**Application Insights** — Observability with custom AI metrics via OpenTelemetry." },

            { type: "text", heading: "Reference Architecture: How the Pieces Connect", body: "The service list becomes a system once you wire it. A typical Azure AI reference architecture, following the request lifecycle from m7l1:\n\n**Edge** — Azure Front Door / API Management as the gateway: auth, rate limiting, per-tenant quotas, WAF.\n**Orchestration** — Azure Container Apps running your Semantic Kernel / app code, scaling on load.\n**Model** — Azure OpenAI (chat + embeddings), called over a *private endpoint*.\n**Knowledge** — Azure AI Search for RAG (Module 4); a database (Cosmos DB / PostgreSQL) for conversation state and app data (m5l6).\n**Secrets & identity** — Key Vault for secrets; **Managed Identity** so services authenticate to each other without API keys (below).\n**Network** — all of it inside a VNet with private endpoints, so data never crosses the public internet (m6l7 residency).\n**Observability** — Application Insights collecting per-call traces and metrics (m7l2) via OpenTelemetry.\n\nThat's the m7l1 lifecycle (gateway → orchestration → model + RAG + state → observability) realized in concrete Azure services. The Bicep below provisions a slice of it; the value of seeing the whole picture is knowing how the boxes connect, not just that they exist." },

            { type: "decision", heading: "Compute Selection", rows: [
              ["Simple API wrapper over LLM (low traffic)", "Azure Functions — scales to zero, cheapest, fastest to deploy"],
              ["RAG system or agent (moderate traffic)", "Azure Container Apps — container flexibility, traffic splitting, scale-to-zero"],
              ["High-throughput pipeline (batch processing)", "Azure Container Apps with KEDA scaling on queue depth"],
              ["Complex multi-service system", "Azure Kubernetes Service — full control, complex but powerful"],
              ["Quick prototype / internal tool", "Azure App Service — familiar PaaS, fast deployment from VS"],
              ["Background ingestion / scheduled jobs", "Azure Functions with Timer or Queue triggers"],
            ]},

            { type: "text", heading: "Networking & Identity: Private Endpoints, Managed Identity, Key Vault", body: "The gap between an Azure AI *demo* and an enterprise *deployment* is mostly networking and identity — exactly what quickstarts skip:\n\n**Private endpoints / VNet** — By default, calls to Azure OpenAI and AI Search traverse public endpoints. Enterprise deployments put these services behind **private endpoints** inside a virtual network, so traffic (and your data) never leaves Microsoft's backbone. This is often what \"data residency\" and security review actually require (m6l7, m7l3).\n\n**Managed Identity over API keys** — Don't ship API keys in config. A **Managed Identity** gives your Container App an Azure AD identity that authenticates to Azure OpenAI, Search, and Key Vault directly, with no secret to leak or rotate (m7l3: secrets never in prompts *or* config). Grant it least-privilege RBAC roles.\n\n**Key Vault** — For the secrets you genuinely can't avoid (third-party API keys, connection strings), store them in Key Vault and reference them — never hardcode in appsettings.\n\n**RBAC, least privilege** — Each service gets only the roles it needs (the infra version of m5l4/m7l3 least privilege).\n\nThese aren't optional polish — a security review will block launch without them, and they're far cheaper to build into the first Bicep file than to retrofit." },

            { type: "code", heading: "Container Apps Deployment — Bicep/IaC", lang: "bicep", code: `// infrastructure/main.bicep
// Deploy AI service with Container Apps + Azure OpenAI + AI Search

param location string = resourceGroup().location
param environmentName string = 'ai-prod'

// Container Apps Environment
resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '\${environmentName}-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// AI Service Container App
resource aiService 'Microsoft.App/containerApps@2024-03-01' = {
  name: '\${environmentName}-ai-service'
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        traffic: [
          {
            // Canary: 90% stable, 10% latest
            revisionName: '\${environmentName}-ai-service--stable'
            weight: 90
          }
          {
            latestRevision: true
            weight: 10
          }
        ]
      }
      secrets: [
        {
          name: 'azure-openai-key'
          value: openai.listKeys().key1
        }
        {
          name: 'search-key'
          value: searchService.listAdminKeys().primaryKey
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'ai-service'
          image: 'myregistry.azurecr.io/ai-service:latest'
          resources: {
            cpu: json('1.0')
            memory: '2Gi'
          }
          env: [
            { name: 'AZURE_OPENAI_ENDPOINT', value: openai.properties.endpoint }
            { name: 'AZURE_OPENAI_KEY', secretRef: 'azure-openai-key' }
            { name: 'AZURE_SEARCH_ENDPOINT', value: 'https://\${searchService.name}.search.windows.net' }
            { name: 'AZURE_SEARCH_KEY', secretRef: 'search-key' }
          ]
        }
      ]
      scale: {
        minReplicas: 1    // keep warm for latency
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: { metadata: { concurrentRequests: '20' } }
          }
        ]
      }
    }
  }
}

// Azure OpenAI Service
resource openai 'Microsoft.CognitiveServices/accounts@2024-04-01-preview' = {
  name: '\${environmentName}-openai'
  location: location
  kind: 'OpenAI'
  sku: { name: 'S0' }
  properties: {
    customSubDomainName: '\${environmentName}-openai'
    publicNetworkAccess: 'Disabled'  // private endpoint only
  }
}

// Azure AI Search
resource searchService 'Microsoft.Search/searchServices@2024-03-01-preview' = {
  name: '\${environmentName}-search'
  location: location
  sku: { name: 'standard' }  // basic for dev, standard for prod
  properties: {
    replicaCount: 2           // HA: minimum 2 replicas
    partitionCount: 1
  }
}` },
            { type: "code", heading: "Startup Configuration — C# / .NET 8", lang: "csharp", code: `// Program.cs — Wire up Azure AI services
using Microsoft.SemanticKernel;
using Azure.Identity;
using Azure.Search.Documents;

var builder = WebApplication.CreateBuilder(args);

// Use Managed Identity in production (no keys in config)
var credential = builder.Environment.IsDevelopment()
    ? new AzureCliCredential() as TokenCredential
    : new DefaultAzureCredential();

// Register Semantic Kernel
builder.Services.AddKernel()
    .AddAzureOpenAIChatCompletion(
        deploymentName: "gpt-4o",
        endpoint: builder.Configuration["AzureOpenAI:Endpoint"],
        credentials: credential)
    .AddAzureOpenAITextEmbeddingGeneration(
        deploymentName: "text-embedding-3-small",
        endpoint: builder.Configuration["AzureOpenAI:Endpoint"],
        credentials: credential);

// Register Azure AI Search client
builder.Services.AddSingleton(sp =>
{
    var endpoint = new Uri(
        builder.Configuration["AzureSearch:Endpoint"]);
    return new SearchClient(
        endpoint, "my-docs-index", credential);
});

// Register your services
builder.Services.AddScoped<IRagService, RagService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();

// Health checks
builder.Services.AddHealthChecks()
    .AddAzureOpenAI(builder.Configuration["AzureOpenAI:Endpoint"])
    .AddAzureSearch(builder.Configuration["AzureSearch:Endpoint"]);

// OpenTelemetry for LLM observability
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .AddSource("Microsoft.SemanticKernel*")
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter())
    .WithMetrics(m => m
        .AddMeter("Microsoft.SemanticKernel*")
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());

var app = builder.Build();

app.MapHealthChecks("/health");
app.MapPost("/api/query", async (
    QueryRequest req, IRagService rag) =>
{
    var result = await rag.QueryAsync(req.Question, req.UserId);
    return Results.Ok(result);
});

app.Run();` },
            { type: "code", heading: "appsettings.json — Configuration", lang: "json", code: `{
  "AzureOpenAI": {
    "Endpoint": "https://my-prod-openai.openai.azure.com/",
    "ChatDeployment": "gpt-4o",
    "EmbeddingDeployment": "text-embedding-3-small"
  },
  "AzureSearch": {
    "Endpoint": "https://my-prod-search.search.windows.net",
    "IndexName": "my-docs-index"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.SemanticKernel": "Debug"
    }
  },
  "AllowedHosts": "*"
}` },

            { type: "text", heading: "Scaling on Azure: Scale-to-Zero, KEDA & PTU", body: "Azure gives you two scaling knobs, and you need both because (per m7l1) your compute and your *model quota* scale separately.\n\n**Compute scaling (Container Apps)** — Scale-to-zero when idle (you pay nothing for an unused internal tool), autoscale up on load. **KEDA** scales on real signals: HTTP concurrency for chat, or **queue depth** for the async/batch pattern (m7l1) — workers spin up as the queue grows. The tradeoff is **cold start**: scale-to-zero means the first request after idle is slow, so latency-sensitive services set a minimum (warm) replica count and only batch/background jobs scale to zero.\n\n**Model scaling (Azure OpenAI)** — Adding Container App replicas does *nothing* for model throughput — that's governed by your Azure OpenAI **TPM quota** (m7l1). Scale it with **provisioned throughput (PTUs)** for steady high volume (reserved capacity, predictable latency) or by spreading across multiple deployments/regions for pay-as-you-go.\n\nThe mistake to avoid: autoscaling your compute into a fixed model quota — you just get more replicas all getting 429-throttled. Scale both, or neither matters." },

            { type: "text", heading: "Multi-Region & Resilience on Azure", body: "Single-region is the default and a trap — it caps throughput at one region's quota and means a regional outage is your outage. Multi-region buys three things at once:\n\n**Residency** — Deploy Azure OpenAI in the region your data must stay in (EU data → EU region); route by user geography (m6l7).\n**Throughput** — Azure OpenAI quota is *per region*, so multiple regional deployments multiply your effective TPM ceiling (m7l1).\n**Failover** — When a region or deployment throttles or goes down, route to another — the multi-deployment fallback from m7l1, realized with Azure Front Door / Traffic Manager in front and your abstraction layer (m1l3) choosing the deployment.\n\nThe pattern: identical deployments in 2–3 regions, a global router in front, health checks driving failover, state in a geo-replicated store (Cosmos DB). It costs more and adds deployment complexity (your IaC must provision every region — the Bicep above, parameterized), so reserve full multi-region for systems where availability and residency genuinely demand it; many internal tools are fine single-region with a documented recovery plan." },

            { type: "checklist", heading: "Azure Deployment Checklist", items: [
              "Use Managed Identity (DefaultAzureCredential) — no API keys in config or env vars",
              "Azure OpenAI: set up private endpoint, disable public access in production",
              "Azure AI Search: minimum 2 replicas for high availability in production",
              "Container Apps: set minReplicas >= 1 for latency-sensitive services (cold start = 5-10s)",
              "Configure traffic splitting for canary deployments (90/10 stable/new)",
              "Health checks for all downstream services (OpenAI, Search, DB)",
              "OpenTelemetry configured with Semantic Kernel source for LLM call tracing",
              "Application Insights connected for alerting and dashboards",
              "Resource locks on production resources to prevent accidental deletion",
              "Separate resource groups for dev/staging/prod with RBAC",
              "Azure OpenAI rate limits: set TPM (tokens per minute) quotas per deployment",
              "Enable diagnostic logging on Azure OpenAI for usage auditing",
            ]}
          ]
        }
      ]
    }
;
