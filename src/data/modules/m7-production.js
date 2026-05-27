export default
    {
      id: "m7", number: "07", title: "Production & Operations", accent: "#E040FB",
      desc: "Deployment, monitoring, security, and LLMOps for production AI systems.",
      lessons: [
        { id: "m7l1", title: "Production Architecture", duration: "11 min", tags: ["production","architecture","azure"],
          content: [
            { type: "text", heading: "The Production Stack", body: "**API Gateway** — Rate limiting, auth, routing (Azure API Management)\n**Orchestration** — Your app logic: Semantic Kernel, LangChain, or custom code\n**Model Layer** — Azure OpenAI, Anthropic API, or self-hosted (vLLM)\n**Data Layer** — Vector DBs, traditional DBs, caches\n**Observability** — Logging, monitoring, tracing every LLM call" },
            { type: "text", heading: "Azure AI Architecture", body: "**Azure OpenAI Service** — Managed GPT/embedding access with enterprise security\n**Azure AI Search** — Hybrid vector + keyword search with reranking\n**Azure AI Foundry** — Model catalog, prompt flow, evaluations\n**Container Apps / Functions** — Compute for orchestration\n**Application Insights** — Observability\n\nSemantic Kernel is built to orchestrate this entire stack." },
            { type: "checklist", heading: "Scaling Patterns", items: [
              "Stateless app servers behind load balancer — standard web arch applies",
              "Cache embeddings, common query results, and identical-input responses",
              "Async processing for long-running agents: return job ID, process in background",
              "Model routing: simple queries → cheap model, complex → capable model",
              "Multi-model fallback: Azure OpenAI → Anthropic → local model",
              "Semantic caching: match similar (not just identical) queries",
            ]}
          ]
        },
        { id: "m7l2", title: "LLMOps & Monitoring", duration: "9 min", tags: ["production","monitoring","llmops"],
          content: [
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
            { type: "text", heading: "Observability Tools", body: "**LLM-specific:** LangSmith, Helicone, Braintrust, Weights & Biases\n**General:** OpenTelemetry (Semantic Kernel has built-in OTel), Application Insights, Datadog\n\n**Minimum viable observability:** Log every LLM call with input, output, latency, token count, and cost." },
            { type: "checklist", heading: "Model Update Checklist", items: [
              "Pin specific model version strings — never use aliases in production",
              "Run full eval suite against new model versions before upgrading",
              "Canary deploy: route 5-10% traffic to new version, compare metrics",
              "Expect to re-optimize prompts when changing models",
              "Have multi-model fallback for downtime/rate limits",
            ]}
          ]
        },
        { id: "m7l3", title: "Security & Compliance", duration: "8 min", tags: ["production","security","compliance"],
          content: [
            { type: "text", heading: "AI-Specific Threats", body: "**Prompt injection** — Malicious instructions in user input. Defense: sanitization, instruction hierarchy, output validation.\n\n**Data exfiltration** — Crafted prompts to extract training/user data. Defense: output filtering, access controls.\n\n**Denial of wallet** — Expensive queries to drive up API costs. Defense: rate limiting, cost caps, input length limits." },
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
            { type: "text", heading: "Compliance Frameworks", body: "**SOC 2** — Ensure your app layer meets requirements (most AI providers are SOC 2)\n**HIPAA** — Requires BAAs with AI providers. Azure OpenAI has HIPAA-eligible configs.\n**GDPR** — Right to deletion extends to vector stores + training data.\n**EU AI Act** — Risk-level classification. High-risk (hiring, credit) has strict transparency requirements.\n**Industry-specific** — Financial (SEC/FINRA), Government (FedRAMP), Education (FERPA)" }
          ]
        },
        { id: "m7l4", title: "CI/CD for AI Systems", duration: "14 min", tags: ["production","cicd","testing","deployment","devops"],
          content: [
            { type: "text", heading: "Why AI CI/CD Is Different", body: "Traditional CI/CD: code change → tests pass → deploy. AI CI/CD adds a new dimension: your system's behavior depends on prompts, models, and data — not just code. A prompt change that passes unit tests can degrade production quality. A model version bump can break prompts that worked fine before.\n\nYou need three things traditional CI/CD doesn't cover:\n1. **Eval-gated deployment** — automated quality checks before any prompt or model change goes live\n2. **Prompt versioning** — treat prompts as first-class artifacts with history and rollback\n3. **Data pipeline monitoring** — detect when your RAG data drifts or goes stale" },
            { type: "text", heading: "The AI Deployment Pipeline", body: "**Stage 1: Code Review**\nStandard PR review. Prompts reviewed like code — diffs visible, approval required.\n\n**Stage 2: Unit Tests**\nTool functions work correctly. Input validation. Error handling. Standard software testing.\n\n**Stage 3: Eval Suite (THE KEY STAGE)**\nRun your full evaluation dataset against the changed system. Compare scores to the current production baseline. Gate deployment on quality thresholds.\n\n**Stage 4: Canary Deployment**\nRoute 5-10% of traffic to the new version. Monitor quality metrics and error rates in real-time.\n\n**Stage 5: Full Rollout**\nIf canary metrics hold for 24-48 hours, promote to 100%.\n\n**Stage 6: Post-Deploy Monitoring**\nContinuous eval sampling. Alert on quality degradation." },
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
        { id: "m7l5", title: "Cost Management & Spend Monitoring", duration: "12 min", tags: ["production","cost","monitoring","optimization"],
          content: [
            { type: "text", heading: "Why AI Costs Surprise You", body: "AI system costs are fundamentally different from traditional software. Traditional: cost scales with compute (predictable). AI: cost scales with tokens (variable, user-dependent).\n\nA single adversarial or verbose user can 10x your daily spend. A bad prompt that triggers retries can burn through budget in hours. A runaway agent loop can rack up thousands in minutes.\n\nYou need three things: visibility (where is money going?), limits (prevent runaways), and optimization (get the same output for less)." },
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
            { type: "decision", heading: "Optimization Tactics by Impact", rows: [
              ["Prompt caching (highest impact)", "Keep system prompt as stable prefix. 50-90% cost reduction on input tokens."],
              ["Model routing", "Classify complexity, route 70% of queries to cheapest model. 3-5x average cost reduction."],
              ["Right-size max_tokens", "Classification=50, extraction=500, generation=1000. Prevents over-generation."],
              ["Batch API for offline work", "50% cheaper than real-time. Use for nightly reports, bulk processing, eval runs."],
              ["Context trimming", "Send only top 3-5 relevant chunks, not top 10. Less noise, lower cost, often better quality."],
              ["Semantic caching", "Cache responses for similar queries. 100% cost savings on cache hits. Best for FAQ-like workloads."],
              ["Streaming with early stopping", "Stream response; stop when you have the answer. Saves output tokens on verbose models."],
            ]},
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
        { id: "m7l6", title: "Azure Deployment Patterns", duration: "13 min", tags: ["production","azure","deployment","infrastructure"],
          content: [
            { type: "text", heading: "The Azure AI Stack", body: "For .NET teams, Azure provides an integrated stack purpose-built for AI workloads. The key is choosing the right compute tier and connecting services correctly.\n\n**Azure OpenAI Service** — Managed GPT/Claude access with enterprise security, private networking, content filtering, and regional deployment.\n\n**Azure AI Search** — Vector + keyword hybrid search with built-in semantic ranking. The RAG backbone.\n\n**Azure AI Foundry** — Model catalog, prompt flow orchestration, evaluation tools, and deployment management.\n\n**Azure Container Apps** — Serverless containers for your orchestration layer. Scales to zero, built-in traffic splitting for canary deploys.\n\n**Azure Functions** — Event-driven compute for ingestion pipelines, scheduled jobs, and webhook handlers.\n\n**Application Insights** — Observability with custom AI metrics via OpenTelemetry." },
            { type: "decision", heading: "Compute Selection", rows: [
              ["Simple API wrapper over LLM (low traffic)", "Azure Functions — scales to zero, cheapest, fastest to deploy"],
              ["RAG system or agent (moderate traffic)", "Azure Container Apps — container flexibility, traffic splitting, scale-to-zero"],
              ["High-throughput pipeline (batch processing)", "Azure Container Apps with KEDA scaling on queue depth"],
              ["Complex multi-service system", "Azure Kubernetes Service — full control, complex but powerful"],
              ["Quick prototype / internal tool", "Azure App Service — familiar PaaS, fast deployment from VS"],
              ["Background ingestion / scheduled jobs", "Azure Functions with Timer or Queue triggers"],
            ]},
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
