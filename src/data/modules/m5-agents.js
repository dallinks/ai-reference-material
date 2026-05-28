export default
    {
      id: "m5", number: "05", title: "AI Agents", accent: "#FFB800",
      desc: "Autonomous systems that plan, use tools, and execute multi-step workflows.",
      lessons: [
        { id: "m5l1", title: "Agent Architecture", duration: "26 min", tags: ["agents","architecture","patterns","react","reflexion","plan-and-execute","internals"],
          content: [
            { type: "text", heading: "What Makes an Agent", body: "An AI agent is an LLM with a loop. It can take actions, observe results, and iterate.\n\n**Simple LLM:** Input → Model → Output (one shot)\n**Agent:** Goal → Plan → Action → Observation → Reasoning → ... → Final Answer\n\nAgents use tools: search, databases, code execution, APIs, file operations. The distinguishing trait is non-determinism in *control flow*: the model itself decides what to do next, including when to stop — rather than the developer pre-wiring every branch." },

            { type: "text", heading: "Agents vs Chains vs Workflows", body: "These three terms get used interchangeably and they shouldn't be.\n\n**Chain** — A fixed sequence of LLM calls. `extract → classify → respond`. The developer hardcodes the order. Predictable, cheap, easy to test. Most production \"AI features\" are chains, not agents.\n\n**Workflow** — A graph (often a DAG) with conditional edges. The developer defines every possible path; the LLM chooses which branch to take at each node. Adaptive within a known design space. Tools like LangGraph and Semantic Kernel Process Framework target this shape.\n\n**Agent** — No fixed graph. The model decides at every step which tool (if any) to call, with what arguments, and whether the task is done. Maximum flexibility, hardest to reason about, most expensive at runtime.\n\nRule of thumb: **prefer the simplest structure that solves the problem**. Most teams reach for \"an agent\" when a chain or workflow would be faster, cheaper, and more reliable. Agents earn their cost when the problem genuinely requires unconstrained tool choice over many steps." },

            { type: "text", heading: "The Anatomy of an Agent", body: "Every agent — whether you build it from scratch or use a framework — has the same six parts:\n\n**1. Model** — The LLM that emits each decision. The brain.\n\n**2. Tool catalog** — The functions the model is allowed to call. Defined by JSON Schemas. (See m5l2.) The hands.\n\n**3. Scratchpad / message history** — The running record of user input, model output, tool calls, and tool results. This list IS the agent's working memory at runtime. The agent has no other state between turns.\n\n**4. Long-term memory** (optional) — External storage the agent can read from / write to: vector DBs for retrieval, key-value stores for facts, structured DBs for prior decisions. Distinct from the scratchpad in that it persists across runs and can exceed the context window.\n\n**5. Loop controller** — Your code that drives the cycle: call model → inspect output → execute tools → append results → repeat. This is the part most people forget exists. The model is stateless; the agent loop is where \"agency\" actually lives.\n\n**6. Stop condition** — When does the loop end? Max-turns, a special \"finish\" tool, no more tool calls in the last response, external interrupt. Without a deliberate stop condition, agents either halt arbitrarily or run forever." },

            { type: "text", heading: "The Agent Loop — What Actually Runs", body: "The LLM is stateless. It does not \"think\" between turns. It does not \"wake up\" when a tool result comes back. It exists only during a single model call.\n\nAgency is an illusion produced by your harness code, which:\n\n1. Sends the current message history + tool catalog to the model\n2. Receives the model's reply (text and/or tool-call blocks)\n3. Appends that reply to the history\n4. If the reply contains tool calls: executes each, appends results to history, jumps back to step 1\n5. If the reply has no tool calls (or a stop condition trips): exits the loop and returns the final text to the user\n\nThat's it. There is no daemon, no persistent agent process, no \"the agent is now thinking\" state. Every turn is a fresh model call that re-reads the entire history from scratch.\n\nThis has three big consequences:\n\n• **Context length is everything.** As the scratchpad grows, latency rises, cost rises, and eventually the model loses track of early steps.\n\n• **Determinism is in your hands.** The model is non-deterministic; the loop, retry policy, timeouts, and stop conditions are entirely your code's responsibility.\n\n• **Replay is free.** Save every model input + output. You can re-run any past agent execution offline by replaying its history — no special debugger needed." },

            { type: "code", heading: "A Minimal Agent Loop in 40 Lines (Python, No Framework)", lang: "python", code: `# This is the entire agent pattern. Every framework is a wrapper around this loop.

from anthropic import Anthropic
import json

client = Anthropic()
TOOLS = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    }
]
TOOL_IMPL = {"get_weather": lambda city: {"temp_c": 18, "conditions": "rain", "city": city}}

def run_agent(user_goal, max_turns=10):
    # The scratchpad. This IS the agent's runtime state.
    history = [{"role": "user", "content": user_goal}]

    for turn in range(max_turns):
        # --- Step 1: Ask the model what to do next ---
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            tools=TOOLS,
            messages=history,
        )
        history.append({"role": "assistant", "content": response.content})

        # --- Step 2: Stop condition — no more tool calls means we're done ---
        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if b.type == "text"), "")

        # --- Step 3: Execute every tool call, append results ---
        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            try:
                result = TOOL_IMPL[block.name](**block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id,
                                     "content": json.dumps(result)})
            except Exception as e:
                tool_results.append({"type": "tool_result", "tool_use_id": block.id,
                                     "content": f"Error: {e}", "is_error": True})
        history.append({"role": "user", "content": tool_results})

    raise RuntimeError(f"Agent did not finish within {max_turns} turns")` },

            { type: "text", heading: "The ReAct Pattern", body: "**Re**asoning + **Act**ing — the most common agent architecture, introduced in the 2022 ReAct paper.\n\n1. **Thought** — Agent reasons about what to do\n2. **Action** — Agent selects and invokes a tool\n3. **Observation** — Agent receives tool output\n4. **Repeat** until task is complete\n\nOriginally, ReAct was a *prompting strategy*: you'd instruct the model to emit `Thought: ...` then `Action: ...` then `Observation: ...` in plain text, then parse it. Modern agents replace the plain-text Action step with structured function calls, but the underlying pattern is identical.\n\nWhy ReAct works: forcing the model to verbalize a Thought before an Action improves tool choice. Forcing it to verbalize an Observation after a tool result improves the next decision. The loop gives the model space to course-correct that single-shot prompting cannot." },

            { type: "code", heading: "ReAct Trace — What the Model Actually Sees", lang: "text", code: `Turn 1:
  history sent to model:
    user: "Should I bring an umbrella to my Seattle meeting tomorrow?"
  model response (stop_reason: tool_use):
    text:     "I'll check the Seattle weather forecast for tomorrow."
    tool_use: get_weather(city="Seattle")

Turn 2:
  history sent to model (note: full Turn 1 included):
    user:      "Should I bring an umbrella to my Seattle meeting tomorrow?"
    assistant: text + tool_use(get_weather, city="Seattle")
    user:      tool_result(toolu_01..., {"temp_c": 11, "conditions": "rain"})
  model response (stop_reason: end_turn):
    text: "Yes — Seattle's forecast shows rain at 11°C. Bring the umbrella."

Two model calls. One tool execution. The model never "remembered" turn 1 in turn 2 —
your loop physically replayed the entire history. The model's "reasoning" is just
its next-token prediction over that history.

The "Thought" text in turn 1 ("I'll check the Seattle weather forecast...") is not
required for the tool call to work. It exists because verbalized reasoning improves
the quality of the action that follows it — and because it's useful for you when
debugging.` },

            { type: "text", heading: "Plan-and-Execute", body: "ReAct decides one step at a time. **Plan-and-Execute** splits the agent into two roles:\n\n**Planner** (called once) — Reads the goal and produces an ordered list of steps. Often a stronger/more expensive model.\n\n**Executor** (called per step) — Runs each step with tool access. Often a cheaper model since each step is narrow.\n\n**Why use it:** Long-horizon tasks where planning ahead matters more than reacting to each result. Research tasks, multi-document analysis, code generation. Forces the agent to think about the *whole* problem before getting lost in the first step.\n\n**Why not use it:** Tasks where intermediate results genuinely change what should happen next. A rigid pre-baked plan is wrong if step 2's output invalidates step 3.\n\n**Common variant: Plan-and-Execute with Replan.** After every N steps (or on failure), re-invoke the planner with progress-so-far to revise the remaining plan. Combines forethought with adaptability at the cost of extra planner calls." },

            { type: "text", heading: "Reflexion / Self-Critique", body: "Add an evaluation step after the agent produces an answer. A separate **critic prompt** grades the output against the original goal. If the critique is negative, the agent retries with the critique appended to its scratchpad.\n\n**Why it works:** LLMs are often better at spotting errors than avoiding them. A second model call asking \"is this answer actually correct and complete?\" catches a meaningful fraction of mistakes that a single-pass agent would ship.\n\n**Costs:** Roughly 2× the tokens per query in the happy path, more on retries. Only worth it for high-stakes outputs where wrong-but-confident is the failure mode you most need to avoid: legal/medical Q&A, code generation, financial calculations.\n\n**Variants:**\n• **Self-Reflexion** — Same model plays both roles with different prompts.\n• **Pair-of-models** — A larger model critiques a smaller model's output. Useful when the executor is cheap.\n• **Rubric-graded** — The critic checks specific criteria (\"did the answer cite a source?\", \"did it cover all parts of the question?\") rather than free-form judging." },

            { type: "text", heading: "Hierarchical / Supervisor", body: "A **supervisor agent** doesn't do work directly — it routes to specialist sub-agents and synthesizes their results. Each specialist has its own narrower tool catalog and focused system prompt.\n\nWhy: a single agent with 30 tools picks the wrong one constantly and burns context on irrelevant tool descriptions. Three specialists with 10 tools each, behind a router, are more accurate and easier to reason about.\n\nThis is the dominant pattern at scale. We'll go deep on it in **m5l3 (Multi-Agent Systems)** — what to mention here is just that *single-agent* and *multi-agent* are architectural choices, not lifecycle stages. Some problems are inherently better as one big agent; some are inherently better as a team." },

            { type: "decision", heading: "Choosing an Architecture", rows: [
              ["Task is short and the action sequence is mostly deterministic", "Skip the agent — write a chain or a workflow. You don't need this."],
              ["Task is open-ended; each step depends on the previous result", "ReAct. The default. Start here."],
              ["Task is long and benefits from upfront thinking (research, multi-doc analysis)", "Plan-and-Execute (with replan if results may invalidate the plan)"],
              ["Output correctness is critical and verifiable (code, math, structured extraction)", "Reflexion / self-critique loop, optionally with a separate critic model"],
              ["Tool catalog exceeds ~15 tools or spans clearly distinct domains", "Hierarchical / supervisor with specialist sub-agents (see m5l3)"],
              ["Tasks are short and parallelizable across independent inputs", "Many small agents in parallel; no orchestrator needed"],
              ["You need strict, auditable, regulatable control flow", "Workflow (LangGraph / SK Process Framework), NOT an agent"],
            ]},

            { type: "text", heading: "State, Memory, and the Context Window", body: "The scratchpad grows every turn: user message + assistant reply + tool calls + tool results all stack up. By turn 8 of a tool-heavy agent, you might be sending 30K tokens per call. By turn 20, you may have blown past the model's context limit entirely.\n\nFour mitigation strategies, in increasing order of complexity:\n\n**1. Bound the loop.** Hard max on turns. Hard max on tokens per response. Tools return ≤4KB. Most agents finish in 3–7 turns; agents going past 15 are usually broken.\n\n**2. Trim the scratchpad.** Keep the last N turns verbatim; drop or summarize earlier ones. Risk: dropping the user's original goal. Always keep the first user message intact.\n\n**3. Summarize on overflow.** When history exceeds a threshold, call the model to compress middle turns into a structured summary, replace those turns with the summary, continue. Cheap-ish and surprisingly effective. This is how Claude Code's compaction works.\n\n**4. External long-term memory.** Write structured facts to a DB or vector store as the agent runs (`remember(\"user prefers metric units\")`). At each turn, retrieve the K most relevant memories and inject them into the system prompt. Decouples runtime context from persistent state. Required for agents that span sessions." },

            { type: "text", heading: "Stopping Conditions", body: "How an agent decides it's done is the single most underappreciated architectural choice. Get it wrong and your agent either quits with the job half-finished or runs in circles forever.\n\nThe options, in order of how much you should default to each:\n\n**1. Max turns (always).** A hard cap (typically 10–25) on the number of model calls. Non-negotiable. Even if every other stop condition works, this is your safety net against runaway loops. On hitting it, return a clear \"didn't finish\" message — never silently give a partial answer as if it were final.\n\n**2. No tool calls in last response.** The most natural signal: the model emitted only text, with no `tool_use`. Treat this as \"the model thinks it's answering the user.\" Works well with modern function-calling APIs.\n\n**3. Explicit `finish_task` tool.** Define a tool the model calls to declare completion: `finish_task(answer, confidence)`. Forces a structured exit and gives you a place to enforce acceptance criteria (\"answer must be non-empty\", \"confidence must be > 0.7\"). Best for high-stakes agents.\n\n**4. Repeated-state detection.** Track `(tool_name, arguments)` tuples. If the model calls the same tool with the same arguments twice in a row, you're in a doom loop — inject a system note and force a different action, or bail out.\n\n**5. External signals.** User interrupt, deadline timer, parent-agent abort. Always handle these — long-running agents WILL be cancelled mid-flight." },

            { type: "code", heading: "ReAct Agent — Semantic Kernel (C#)", lang: "csharp", code: `using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using System.ComponentModel;

// 1. Define tools as plugins
public class CustomerPlugin
{
    [KernelFunction, Description("Look up customer by email address")]
    public async Task<string> GetCustomer(
        [Description("Customer email")] string email)
    {
        // Your DB lookup logic here
        var customer = await _db.Customers
            .FirstOrDefaultAsync(c => c.Email == email);
        return JsonSerializer.Serialize(customer);
    }

    [KernelFunction, Description("Get recent orders for a customer ID")]
    public async Task<string> GetOrders(
        [Description("Customer ID")] int customerId)
    {
        var orders = await _db.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.Date)
            .Take(5)
            .ToListAsync();
        return JsonSerializer.Serialize(orders);
    }

    [KernelFunction, Description("Issue a refund for an order")]
    public async Task<string> IssueRefund(
        [Description("Order ID")] int orderId,
        [Description("Refund reason")] string reason)
    {
        // Your refund logic — this is a consequential action!
        return JsonSerializer.Serialize(new {
            status = "pending_approval",
            orderId, reason
        });
    }
}

// 2. Build kernel with plugins
var builder = Kernel.CreateBuilder();
builder.AddAzureOpenAIChatCompletion("gpt-4o", endpoint, key);
builder.Plugins.AddFromType<CustomerPlugin>();
var kernel = builder.Build();

// 3. Run agent with auto function calling
var chat = kernel.GetRequiredService<IChatCompletionService>();
var settings = new OpenAIPromptExecutionSettings
{
    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto()
};

var history = new ChatHistory();
history.AddSystemMessage("""
    You are a customer support agent for Acme Corp.
    Use the available tools to help resolve customer issues.
    Always look up the customer first before taking any action.
    For refunds, explain what you found before processing.
""");

history.AddUserMessage("Customer jane@example.com wants a refund on her last order");

// The agent will: 1) look up customer, 2) get orders, 3) issue refund
var result = await chat.GetChatMessageContentAsync(
    history, settings, kernel);` },

            { type: "code", heading: "ReAct Agent — LangGraph (Python)", lang: "python", code: `from langchain_openai import AzureChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

# 1. Define tools
@tool
def get_customer(email: str) -> str:
    """Look up customer by email address."""
    # Your DB lookup
    customer = db.query(Customer).filter_by(email=email).first()
    return json.dumps(customer.to_dict())

@tool
def get_orders(customer_id: int) -> str:
    """Get recent orders for a customer ID."""
    orders = db.query(Order)\\
        .filter_by(customer_id=customer_id)\\
        .order_by(Order.date.desc())\\
        .limit(5).all()
    return json.dumps([o.to_dict() for o in orders])

@tool
def issue_refund(order_id: int, reason: str) -> str:
    """Issue a refund for an order. Returns pending status."""
    return json.dumps({
        "status": "pending_approval",
        "order_id": order_id, "reason": reason
    })

# 2. Create agent
llm = AzureChatOpenAI(model="gpt-4o")
tools = [get_customer, get_orders, issue_refund]

agent = create_react_agent(
    llm,
    tools,
    state_modifier="""You are a customer support agent for Acme Corp.
    Always look up the customer first before taking any action.
    For refunds, explain what you found before processing."""
)

# 3. Run
result = agent.invoke({
    "messages": [
        ("user", "Customer jane@example.com wants a refund on her last order")
    ]
})` },

            { type: "text", heading: "Observability: You Cannot Debug What You Cannot See", body: "Agents fail in ways stack traces don't capture. The model picked the wrong tool. The model's argument was almost-but-not-quite right. The summary turn dropped a critical fact. None of these throw exceptions — they just produce a worse answer.\n\nMinimum viable agent observability — log per turn:\n\n• The exact `messages` array sent to the model (after any compaction)\n• The model's full response: text blocks, tool_use blocks, stop reason, token counts\n• Each tool invocation: name, arguments, result, duration, error if any\n• The total elapsed time and total tokens for the run\n• A correlation ID linking every turn of one user-facing request\n\nWith this, you can replay any failed run offline: feed the same history back to the model, see if the same wrong choice repeats, then iterate on the system prompt or schema in isolation.\n\nTooling: **LangSmith** (LangChain-native), **Weights & Biases Traces**, **Arize Phoenix**, **Anthropic's built-in `trace_id` + console**. For DIY: OpenTelemetry has GenAI semantic conventions — your existing APM (Datadog, Honeycomb, Application Insights) already understands them.\n\nIf you only do one thing for production readiness: ship structured logging of every turn before you ship the agent." },

            { type: "text", heading: "Failure Modes & Architectural Antidotes", body: "**Doom loop.** Same tool, same arguments, repeatedly. *Antidote:* repeated-state detection in the loop; inject \"you already called X with these args and got Y — try something different.\"\n\n**Premature stop.** Model says \"I'm done\" while the task is half-finished. *Antidote:* an explicit `finish_task` tool with arguments that act as acceptance criteria the model has to fill in (\"summary\", \"confidence\", \"all_subtasks_complete: bool\").\n\n**Token explosion.** Scratchpad outgrows the context window mid-run. *Antidote:* trim or summarize on a token threshold; cap tool results at 4KB; paginate large data.\n\n**Wrong abstraction.** Plan-and-Execute used on a task whose plan needs constant revision; or ReAct used on a task that genuinely needs upfront planning. *Antidote:* re-read the architecture-choice table above. Migrate.\n\n**Tool-choice churn.** Agent flips between two tools without progress. *Antidote:* fewer, more orthogonal tools; sharper descriptions; in the worst case, a hierarchical supervisor that routes to a specialist.\n\n**Silent tool failures.** Tool returned an error envelope the model didn't notice, agent confidently fabricates an answer. *Antidote:* error envelopes that say \"Error: ... — suggested action: ...\" (per m5l2). Reflexion can also catch these post-hoc.\n\n**Untraceable production bug.** Agent gives a bad answer once and nobody can reproduce it. *Antidote:* full per-turn logging from day one. Without it, you're flying blind." },

            { type: "checklist", heading: "Production Agent Architecture Checklist", items: [
              "The architecture choice (chain / workflow / agent / hierarchy) is documented with the reason it was chosen",
              "A hard max-turns cap is set; hitting it produces a clear 'did not finish' response, never a silent partial answer",
              "Stop conditions beyond max-turns are explicit: natural end-turn, finish_task tool, repeated-state detection",
              "Every model call's input and output is logged with a correlation ID — full replay is possible",
              "Per-turn token counts and latencies are emitted as metrics; cost-per-run is dashboarded",
              "Scratchpad has a defined trim or summarize strategy; long runs don't blow the context window",
              "Tool catalog size is bounded (<15 per agent ideal); larger surfaces are split via supervisor/specialist split",
              "Repeated-state detection (same tool + args) is implemented; loops break out with a system note",
              "Tools never throw uncaught exceptions to the loop — every failure becomes a structured error tool_result",
              "Consequential actions require a confirmation step (preview tool, then commit tool) — the model cannot delete/pay/send in one shot",
              "An eval set of historical runs exists; changes to prompts/models are validated against it before rolling out",
              "User-facing errors say what happened in plain language ('I was unable to finish this in time'), not stack traces",
            ]}
          ]
        },
        { id: "m5l2", title: "Tool Design & Function Calling", duration: "28 min", tags: ["agents","tools","function-calling","mcp","internals"],
          content: [
            { type: "text", heading: "Tools Are the Agent's Hands", body: "Without tools, an LLM is a closed system — it can only generate text from what was in its training data and its current context window. It can't look up today's order status, query your database, or send an email. **Tools** (also called **functions**) close that loop: they let the model trigger your code, get a result back, and continue reasoning with new information.\n\nWell-designed tools make agents dramatically more capable. Poorly designed tools cause loops, hallucinated arguments, parameter mismatches, and silent failures. The hard part isn't writing the function — it's designing the *contract* the model sees." },

            { type: "text", heading: "What \"Function Calling\" Actually Is", body: "There's a persistent myth that the model \"calls\" your function. It doesn't. The model has no network access, no runtime, no ability to execute anything. It only generates tokens.\n\nWhat actually happens: you advertise a list of tools in your API request. The model, instead of (or in addition to) producing a normal text reply, produces a **structured JSON block** that names a tool and supplies arguments. Your application — the \"harness\" — parses that JSON, runs the actual function, and sends the result back in the next request. The model then continues from there.\n\nFunction calling is **constrained generation plus protocol convention**. The model is fine-tuned to emit tool-call JSON in a specific shape when it thinks a tool would help, and providers add server-side decoding constraints (logit biasing, grammar-constrained sampling) so the output is always parseable. The \"magic\" is just disciplined text generation wrapped in an agreed-upon envelope." },

            { type: "text", heading: "The Tool-Use Loop, Step by Step", body: "Every agent that uses tools — Claude Code, Cursor, an Azure OpenAI assistant, a LangGraph workflow — runs the same fundamental loop:\n\n**1. Advertise.** You send the model a request containing (a) the conversation so far, (b) a `tools` array describing each available function: name, natural-language description, and a JSON Schema for its parameters.\n\n**2. Decide.** The model reads the user's request and the tool descriptions. It either replies with normal text (no tool needed) OR emits one-or-more tool-use blocks specifying `name` and `input` (the JSON arguments).\n\n**3. Stop.** When the model emits a tool call, the response ends with `stop_reason: \"tool_use\"` (Anthropic) or `finish_reason: \"tool_calls\"` (OpenAI). The model is now *waiting*.\n\n**4. Execute.** Your harness — not the model — validates the arguments against the schema, runs the actual function, and captures the result (or error).\n\n**5. Return.** You send a new request containing the entire prior conversation PLUS the assistant's tool-use message PLUS a new message with the tool result, keyed by the `tool_use_id` so the model knows which call it answers.\n\n**6. Continue.** The model reads the result and either calls more tools, replies to the user with final text, or both. Loop back to step 2 until it stops calling tools.\n\nThe loop is stateless from the model's perspective — every turn it re-reads the full transcript. The *agent loop* lives in your code, not in the model." },

            { type: "code", heading: "Wire Format — What Actually Crosses the Network (Anthropic)", lang: "json", code: `// === REQUEST 1: User asks a question, you advertise tools ===
POST https://api.anthropic.com/v1/messages
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "tools": [
    {
      "name": "get_order_status",
      "description": "Look up the current status of a customer order. Returns the order state, last update time, and tracking URL if shipped.",
      "input_schema": {
        "type": "object",
        "properties": {
          "order_id": {
            "type": "string",
            "description": "The order ID in the format ORD-XXXXXX, e.g. ORD-481923"
          }
        },
        "required": ["order_id"]
      }
    }
  ],
  "messages": [
    { "role": "user", "content": "Where is my order ORD-481923?" }
  ]
}

// === RESPONSE 1: Model decides to call the tool ===
{
  "id": "msg_01ABC...",
  "stop_reason": "tool_use",          // ← key signal: do not show to user yet
  "content": [
    { "type": "text", "text": "I'll look that up for you." },
    {
      "type": "tool_use",
      "id": "toolu_01XYZ...",          // ← unique ID for THIS call
      "name": "get_order_status",
      "input": { "order_id": "ORD-481923" }
    }
  ]
}

// === REQUEST 2: You replay history + add the tool result ===
POST https://api.anthropic.com/v1/messages
{
  "model": "claude-sonnet-4-6",
  "tools": [ /* same tools array */ ],
  "messages": [
    { "role": "user", "content": "Where is my order ORD-481923?" },
    { "role": "assistant", "content": [
        { "type": "text", "text": "I'll look that up for you." },
        { "type": "tool_use", "id": "toolu_01XYZ...",
          "name": "get_order_status",
          "input": { "order_id": "ORD-481923" } }
    ]},
    { "role": "user", "content": [
        {
          "type": "tool_result",
          "tool_use_id": "toolu_01XYZ...",   // ← matches the call above
          "content": "{\\"status\\":\\"shipped\\",\\"carrier\\":\\"UPS\\",\\"tracking\\":\\"1Z999...\\",\\"eta\\":\\"2026-05-30\\"}"
        }
    ]}
  ]
}

// === RESPONSE 2: Model uses the result to answer the user ===
{
  "stop_reason": "end_turn",            // ← done; safe to render to user
  "content": [
    { "type": "text", "text": "Your order ORD-481923 shipped via UPS and is expected to arrive on May 30. Tracking: 1Z999..." }
  ]
}` },

            { type: "code", heading: "Same Concept — OpenAI / Azure OpenAI Wire Format", lang: "json", code: `// OpenAI and Anthropic differ in field names and message structure,
// but the concept is identical. Know both — you'll hit both.

// === REQUEST 1 ===
POST /chat/completions
{
  "model": "gpt-4.1",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_order_status",
        "description": "Look up the current status of a customer order...",
        "parameters": {              // ← OpenAI calls it "parameters", Anthropic "input_schema"
          "type": "object",
          "properties": {
            "order_id": { "type": "string", "description": "..." }
          },
          "required": ["order_id"]
        }
      }
    }
  ],
  "messages": [
    { "role": "user", "content": "Where is my order ORD-481923?" }
  ]
}

// === RESPONSE 1 ===
{
  "choices": [{
    "finish_reason": "tool_calls",     // ← OpenAI signal
    "message": {
      "role": "assistant",
      "content": null,                  // typically null when calling tools
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_order_status",
          "arguments": "{\\"order_id\\":\\"ORD-481923\\"}"   // ← STRING, not object — must JSON.parse
        }
      }]
    }
  }]
}

// === REQUEST 2 — note the "tool" role and tool_call_id linkage ===
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": null, "tool_calls": [ /* echo back */ ] },
    {
      "role": "tool",                    // ← dedicated role, not "user"
      "tool_call_id": "call_abc123",
      "content": "{\\"status\\":\\"shipped\\",...}"
    }
  ]
}

// Key cross-provider gotchas:
//  • OpenAI returns arguments as a JSON STRING; Anthropic returns an OBJECT
//  • OpenAI uses role "tool"; Anthropic uses role "user" with a tool_result block
//  • OpenAI ID lives at tool_calls[i].id; Anthropic ID lives at content[i].id
//  • Both require: every tool_call in assistant turn MUST be answered before next assistant turn` },

            { type: "code", heading: "The Agent Loop in Real Code (Python + Anthropic SDK)", lang: "python", code: `from anthropic import Anthropic

client = Anthropic()

TOOLS = [{
    "name": "get_order_status",
    "description": "Look up the current status of a customer order...",
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "description": "Format: ORD-XXXXXX"}
        },
        "required": ["order_id"],
    },
}]

# Your actual implementations. Keys MUST match tool["name"].
def get_order_status(order_id: str) -> dict:
    # In real code: db lookup, API call, etc.
    return {"status": "shipped", "carrier": "UPS", "eta": "2026-05-30"}

TOOL_IMPL = {"get_order_status": get_order_status}

def run_agent(user_message: str, max_turns: int = 10):
    messages = [{"role": "user", "content": user_message}]

    for turn in range(max_turns):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )

        # Always append the assistant's full response to history
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            # Model finished — extract final text and return
            text = next((b.text for b in response.content if b.type == "text"), "")
            return text

        if response.stop_reason == "tool_use":
            # Execute every tool_use block in this turn (may be multiple — parallel calls)
            tool_results = []
            for block in response.content:
                if block.type != "tool_use":
                    continue
                try:
                    result = TOOL_IMPL[block.name](**block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(result),
                    })
                except Exception as e:
                    # CRITICAL: return errors as tool_result with is_error=True,
                    # NOT as Python exceptions. The model can recover from errors
                    # it can see; it can't recover from your harness crashing.
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": f"Error: {e}",
                        "is_error": True,
                    })

            messages.append({"role": "user", "content": tool_results})
            continue  # loop back — model will read results and decide next step

        # Other stop reasons: max_tokens, stop_sequence, etc.
        raise RuntimeError(f"Unexpected stop_reason: {response.stop_reason}")

    raise RuntimeError(f"Agent exceeded {max_turns} turns without resolving")` },

            { type: "text", heading: "Parallel Tool Calls", body: "Modern models can emit **multiple tool-use blocks in a single response** when the calls are independent. Asking \"What's the weather in Seattle and Tokyo?\" should produce two `get_weather` calls in one turn, not two sequential turns.\n\nYour harness must:\n\n• Iterate over **all** tool-use blocks in the assistant response, not just the first.\n• Execute them in parallel where safe (e.g., `asyncio.gather` / `Task.WhenAll`).\n• Return **all** results in the next user message — one `tool_result` per `tool_use_id`. The model expects every call to be answered before it continues.\n\nMissing this halves throughput on read-heavy agents. Many naïve loops only handle the first tool call and lose the others, causing the model to retry and burn tokens." },

            { type: "text", heading: "Tool Choice: Steering When the Model Calls Tools", body: "Both providers expose a `tool_choice` parameter that controls *whether* and *which* tools the model may use:\n\n**`auto`** (default) — Model decides per turn. Best for general agents.\n\n**`any` / `required`** — Force the model to call *some* tool this turn. Use when you know a tool answer is required (e.g., \"the user definitely asked a question only the database can answer\").\n\n**`tool` (named)** — Force a specific tool. Useful for structured-output use cases: define one tool whose schema is your desired output shape, force it, then ignore the agentic part entirely. This is the most reliable way to get structured JSON from a model.\n\n**`none`** — Disable tools for this turn while keeping the descriptions in context. Lets you do a \"reflect\" turn without the model spuriously calling more tools.\n\nNote: `tool_choice` applies only to the *next* model turn. After a tool result comes back, you typically want to switch back to `auto` so the model can decide whether to call again or answer." },

            { type: "text", heading: "Why It Almost Always Produces Valid JSON", body: "The model is trained to emit tool-use blocks, but training alone isn't enough — sampling is probabilistic and would occasionally produce malformed JSON or invalid argument types. Providers solve this with **constrained decoding**:\n\n• **Logit biasing / masking** — at each generation step, tokens that would make the JSON invalid (e.g., a letter where a closing brace is required) have their probability driven to zero before sampling.\n\n• **Grammar-constrained sampling** — the JSON Schema you supplied is compiled into a finite-state automaton; only tokens that keep the automaton in a valid state are eligible.\n\nThis means: if your schema says `order_id` is a string and `quantity` is an integer between 1 and 100, the runtime will *refuse to sample* a token that would violate that. You still get semantic errors (the model can pick the wrong order ID) but structural errors are nearly eliminated.\n\nPractical implication: **invest in your schemas**. Tight `enum` lists, numeric ranges, and `pattern` regexes don't just document — they constrain the model at sampling time and make failures impossible rather than rare." },

            { type: "code", heading: "Schema Constraints That Actually Constrain", lang: "json", code: `{
  "name": "create_support_ticket",
  "description": "Open a support ticket for the current customer.",
  "input_schema": {
    "type": "object",
    "properties": {
      "priority": {
        "type": "string",
        "enum": ["low", "normal", "high", "urgent"],
        "description": "Use 'urgent' ONLY for production outages or safety issues."
      },
      "category": {
        "type": "string",
        "enum": ["billing", "technical", "account", "feedback", "other"]
      },
      "summary": {
        "type": "string",
        "minLength": 10,
        "maxLength": 120,
        "description": "One-line problem statement, 10–120 characters."
      },
      "customer_id": {
        "type": "string",
        "pattern": "^CUST-[0-9]{6}$",
        "description": "Format CUST-NNNNNN, e.g. CUST-001234"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "maxItems": 5,
        "uniqueItems": true
      }
    },
    "required": ["priority", "category", "summary", "customer_id"],
    "additionalProperties": false   // ← reject anything the model invents
  }
}

// What you get from constrained decoding:
//   ✓ priority will be one of the four enum values, never "Critical" or "p0"
//   ✓ customer_id will match the regex, never "customer 1234" or "1234"
//   ✓ summary will be 10–120 chars, never the empty string or a 5KB essay
//   ✓ tags will be an array of unique strings, never null or an object
// What you DON'T get:
//   ✗ The right customer (semantics — the model can still hallucinate IDs)
//   ✗ The right priority for the situation (judgment — separate problem)` },

            { type: "text", heading: "Token Economics of Tools", body: "Every tool you advertise costs tokens — *on every request*. The tool list is part of the system prompt that gets re-sent each turn, so a bloated tool roster taxes every step of the loop.\n\nRough numbers for typical schemas:\n\n• A simple read-only tool with one parameter: ~80–150 tokens\n• A complex write tool with 6 parameters and detailed descriptions: ~400–700 tokens\n• 20 tools advertised, average ~250 tokens each: **~5K tokens of overhead per turn**\n\nFor an agent that runs 10 turns, that's 50K tokens of pure tool-list overhead. At Claude Sonnet pricing, that adds real cost — and worse, it pushes useful context out of the window.\n\nMitigations:\n\n**1. Prompt caching.** Both Anthropic and OpenAI support caching the tools+system block. Mark it cached and you pay full price once, then a fraction for every subsequent turn in the same conversation. This is the single biggest win for tool-heavy agents.\n\n**2. Dynamic tool sets.** Don't advertise every tool every turn. For a triage agent, the first turn might only need 3 routing tools; downstream specialists get the full roster. Swap the tool list based on the current state.\n\n**3. Hierarchical tools.** Instead of 30 flat tools, expose 5 \"meta\" tools (`search_kb`, `query_db`, `call_api`, `manage_ticket`, `report`) with a sub-action parameter. Fewer descriptions, model picks the family, you dispatch internally.\n\n**4. Trim descriptions.** Write tight, useful descriptions, but don't repeat what the schema already says. The schema's `enum` already lists allowed values — don't list them again in prose." },

            { type: "checklist", heading: "Tool Design Principles", items: [
              "Each tool does ONE thing — no multi-purpose Swiss Army tools",
              "Tool descriptions are clear and unambiguous (the LLM reads them to decide which to use)",
              "Parameter descriptions explain format and constraints (\"Customer ID as integer, e.g. 12345\")",
              "Use `enum`, `pattern`, `minLength`/`maxLength` in schemas — constrained decoding enforces them at sampling time",
              "Set `additionalProperties: false` so the model can't invent extra fields",
              "Tools return structured data (JSON), not prose — and ideally the same shape on success and error",
              "Error messages are actionable (\"Customer not found for email: x\" not \"Error 404\")",
              "Return errors as tool_result with `is_error: true`, NEVER throw — the model can recover from errors it sees",
              "Include examples in complex tool descriptions — models pattern-match strongly on these",
              "Idempotent where possible — safe to retry on transient failures",
              "Consequential actions (delete, send, pay) require an explicit `confirm: true` argument or a separate confirmation tool",
              "Name tools verb_noun (`search_orders`, `send_email`) — matches how the model thinks about actions",
            ]},

            { type: "code", heading: "Good vs Bad Tool Definitions", lang: "csharp", code: `// ❌ BAD — vague description, unclear params, does too much
[KernelFunction, Description("Handle customer stuff")]
public async Task<string> HandleCustomer(string input)
{
    // What does this even do?
}

// ✅ GOOD — specific, clear description, typed params
[KernelFunction, Description(
    "Search for products by name or category. " +
    "Returns top 10 matches with price and availability. " +
    "Example: SearchProducts(\"wireless headphones\", \"electronics\")")]
public async Task<string> SearchProducts(
    [Description("Search query — product name or keywords")]
    string query,
    [Description("Product category filter (optional). " +
        "Values: electronics, clothing, home, food")]
    string? category = null)
{
    var results = await _catalog.SearchAsync(query, category);
    return JsonSerializer.Serialize(results.Take(10));
}

// ✅ GOOD — consequential action with clear constraints
[KernelFunction, Description(
    "Send an email to a customer. Only use after confirming " +
    "the message content with the user. " +
    "Returns send status and message ID.")]
public async Task<string> SendEmail(
    [Description("Recipient email address")] string to,
    [Description("Email subject line")] string subject,
    [Description("Email body in plain text")] string body)
{
    // Validate before sending
    if (!IsValidEmail(to))
        return JsonSerializer.Serialize(new {
            error = "Invalid email format", to });

    var result = await _emailService.SendAsync(to, subject, body);
    return JsonSerializer.Serialize(result);
}` },

            { type: "code", heading: "Designing Tool Return Values", lang: "json", code: `// Tool results are read by the MODEL, not a human. Design accordingly.

// ❌ BAD — prose. Model has to parse English to extract fields.
"Order ORD-481923 was shipped on 2026-05-25 via UPS with tracking 1Z999AA1 and should arrive May 30."

// ❌ BAD — raw API dump. Too much noise, too many fields, model wastes tokens on irrelevant data.
{
  "_links": { "self": "...", "customer": "...", "shipment": "..." },
  "metadata": { "version": 47, "schema": "order.v3", "trace_id": "..." },
  "data": { "order": { "id": "ORD-481923", "status_code": 4, ... 80 more fields ... } }
}

// ❌ BAD — same error shape varies. Model has to guess where the failure info is.
"Error: not found"               // sometimes
{ "error": { "code": 404 } }     // sometimes
null                             // sometimes 😱

// ✅ GOOD — flat, named fields, consistent envelope, only what the model needs
{
  "ok": true,
  "order_id": "ORD-481923",
  "status": "shipped",
  "carrier": "UPS",
  "tracking_number": "1Z999AA1",
  "tracking_url": "https://www.ups.com/track?num=1Z999AA1",
  "shipped_at": "2026-05-25",
  "estimated_delivery": "2026-05-30"
}

// ✅ GOOD — errors use the SAME envelope so the model handles success/failure uniformly
{
  "ok": false,
  "error_code": "ORDER_NOT_FOUND",
  "error_message": "No order matches ID 'ORD-481923'. Common causes: typo in ID, or the order belongs to a different account.",
  "suggested_action": "Confirm the order ID with the user, or use search_orders with the customer's email."
}

// Tip: the "suggested_action" field above is gold. The model reads it
// and self-corrects without needing you to write recovery logic.` },

            { type: "text", heading: "Streaming with Tool Use", body: "When you stream a tool-using response, the JSON arguments arrive **incrementally** as partial tokens, not as a complete object. You can render the user-facing text in real time, but you cannot start executing the tool until the entire `tool_use` block has streamed in.\n\nAnthropic emits `input_json_delta` events that accumulate; OpenAI streams partial `tool_calls[i].function.arguments` strings you must concatenate. In both cases, only after `message_stop` / `finish_reason: \"tool_calls\"` do you have valid, complete JSON to parse.\n\nA common bug: starting tool execution when you see the tool name appear, before the arguments finish streaming. Don't. Wait for the stop signal." },

            { type: "text", heading: "MCP — Tools as a Standard, Not a Bespoke Integration", body: "The **Model Context Protocol (MCP)** is an open standard introduced by Anthropic in late 2024 and now adopted across the industry. It defines a wire format for tools, resources, and prompts that any client (Claude Desktop, Claude Code, Cursor, an SDK app) can plug into any server (a database, a filesystem, a GitHub integration, your custom API).\n\nWhy it matters for tool design:\n\n• **One implementation, many clients.** Write your `query_warehouse` tool as an MCP server once; it works in Claude Code, Cursor, and your custom agent without rewriting.\n\n• **Tool isolation.** MCP servers run as separate processes (often subprocesses over stdio, or remote over HTTP+SSE). Bad tool code can't crash your agent harness.\n\n• **Discoverability.** Clients can ask a server `list_tools` at runtime — you don't have to hardcode the catalog.\n\n• **Resources and prompts, not just tools.** MCP also standardizes read-only resources (file contents, DB rows) and reusable prompt templates, so the model can pull context on demand rather than receiving everything up front.\n\nIf you're building tools that several agents or several products will share, write them behind an MCP server interface. If you're building one bespoke agent, native function calling is simpler and lower-overhead." },

            { type: "decision", heading: "Common Tool Patterns", rows: [
              ["Data lookup (read-only)", "No confirmation needed, return structured JSON with consistent envelope"],
              ["Data modification (write)", "Return preview first, require confirmation tool call or explicit confirm:true arg"],
              ["External API calls", "Implement retry with backoff and timeout; return errors as data, not exceptions"],
              ["Code execution", "Sandbox it. Set time/memory limits. Never trust generated code. Return stdout/stderr/exit_code"],
              ["Search (vector/web)", "Return snippets with source URLs and a score; let agent decide relevance"],
              ["File operations", "Restrict to specific directories with absolute-path validation; never accept '..'"],
              ["Long-running jobs", "Return a job_id immediately; provide a separate get_job_status tool to poll"],
              ["Multi-step transactions", "Expose begin/commit/rollback as separate tools; the model orchestrates"],
              ["Ambiguous user intent", "Add a clarify_with_user tool — let the model ask instead of guessing"],
            ]},

            { type: "text", heading: "Common Failure Modes & How to Debug", body: "**1. Argument hallucination.** Model invents a value that looks plausible but isn't real — a customer ID, a product SKU, a date. *Fix:* tighten the schema (`enum`, `pattern`), and return errors with `suggested_action` pointing to a search tool.\n\n**2. Tool-call loops.** Agent calls the same tool with the same arguments over and over. *Fix:* track call history in the harness; if `(tool, args)` repeats, inject a system note: \"You already called X with these args and got Y. Try a different approach or ask the user.\"\n\n**3. Wrong tool chosen.** Model picks `update_order` when it should have picked `search_orders` first. *Fix:* sharpen descriptions to disambiguate. Lead with the *use case*, not the implementation: \"Use this when you have a known order ID and want to change its state.\"\n\n**4. Missing tool_result errors.** Provider returns 400 because the previous assistant turn had two tool_use blocks but you only sent one tool_result. *Fix:* always iterate ALL tool_use blocks; return one result per call.\n\n**5. Stale arguments.** Multi-turn agent passes an outdated value (e.g., yesterday's date as \"today\"). *Fix:* include current state in the system prompt or via a `get_context` tool the model calls at turn 1.\n\n**6. Silent truncation.** Tool returns a 50KB blob; the model only sees the first chunk because the response was truncated. *Fix:* paginate large results, return summaries with a `fetch_full` follow-up tool.\n\n**7. \"It worked in playground, broken in prod.\"** Usually a schema mismatch: prod tool list differs from what was tested, or the system prompt is different. *Fix:* log the exact tool list and system prompt on every failed run.\n\nDebugging tactic: **log the full request + response JSON for every turn.** Re-render it as a transcript. Most agent bugs become obvious when you see the conversation the way the model saw it." },

            { type: "checklist", heading: "Production Hardening Checklist", items: [
              "Every tool result is JSON, ≤4KB, with a consistent envelope on success and failure",
              "Every tool has a hard timeout — never let a tool hang the agent loop",
              "Schemas use enum/pattern/min/max to constrain arguments at the sampling layer",
              "The tool list is cached via prompt caching when supported",
              "The agent loop has a max-turns guard and emits a clear final message on hitting it",
              "Tool exceptions are caught and returned as is_error tool_results, not propagated",
              "Mutating tools require an explicit confirmation argument or a preceding preview tool",
              "Tool call history is logged with request/response/duration for offline replay and eval",
              "PII redaction runs on tool arguments before logging — model-generated args often contain user data",
              "Permission checks happen in the tool implementation, never relying on the model to refuse",
              "Repeated identical (tool, args) calls within a single run are detected and short-circuited",
              "Long-running tools return a job_id pattern, not a synchronous wait",
            ]}
          ]
        },
        { id: "m5l3", title: "Multi-Agent Systems", duration: "10 min", tags: ["agents","multi-agent","patterns"],
          content: [
            { type: "text", heading: "Why Multiple Agents?", body: "Single agents hit limits on complex tasks. Multi-agent systems divide and conquer.\n\n**Specialization** — Each agent has focused prompt + tools\n**Parallelism** — Independent subtasks run simultaneously\n**Quality control** — One generates, another evaluates" },
            { type: "text", heading: "Common Patterns", body: "**Supervisor** — Central agent delegates to workers, synthesizes results. Like a project manager.\n\n**Pipeline** — Sequential execution. Each agent's output → next agent's input. Assembly line.\n\n**Debate** — Two agents argue positions, third judges. Reduces errors on subjective tasks.\n\n**Swarm** — Agents hand off dynamically based on current need.\n\n**Hierarchical** — Layers: top plans, mid coordinates, bottom executes." },
            { type: "code", heading: "Supervisor Pattern — LangGraph", lang: "python", code: `from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_openai import AzureChatOpenAI

llm = AzureChatOpenAI(model="gpt-4o")

# Define specialized agents
researcher = create_react_agent(llm, [web_search, fetch_url],
    state_modifier="You are a research analyst. Find facts and data.")

writer = create_react_agent(llm, [create_document],
    state_modifier="You are a technical writer. Create clear docs.")

reviewer = create_react_agent(llm, [],
    state_modifier="You review documents for accuracy and clarity.")

# Supervisor decides who works next
def supervisor(state: MessagesState):
    response = llm.invoke([
        ("system", """You are a project supervisor. Based on the 
        conversation, decide who should act next.
        Return JSON: {"next": "researcher|writer|reviewer|FINISH"}"""),
        *state["messages"]
    ])
    return json.loads(response.content)["next"]

# Build the graph
graph = StateGraph(MessagesState)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)  
graph.add_node("reviewer", reviewer)
graph.add_node("supervisor", supervisor)

graph.add_edge(START, "supervisor")
graph.add_conditional_edges("supervisor", lambda x: x, {
    "researcher": "researcher",
    "writer": "writer",
    "reviewer": "reviewer",
    "FINISH": END
})
# After each agent, go back to supervisor
for agent in ["researcher", "writer", "reviewer"]:
    graph.add_edge(agent, "supervisor")

app = graph.compile()` },
            { type: "checklist", heading: "Multi-Agent Cost & Latency", items: [
              "Model your costs: 5 agents × 3 iterations = 15 LLM calls per request",
              "Sequential chains add up: 5 steps × 2s each = 10s minimum",
              "Parallelize independent subtasks wherever possible",
              "Log every agent's reasoning, tool calls, and outputs from day one",
              "Set max iteration limits per agent AND per workflow",
              "Implement circuit breakers — agents can get stuck in loops",
            ]}
          ]
        },
        { id: "m5l4", title: "Agent Guardrails & Safety", duration: "9 min", tags: ["agents","safety","guardrails","production"],
          content: [
            { type: "text", heading: "The Reliability Problem", body: "Agents are less reliable than single LLM calls. Each step introduces failure potential. A 95% reliable step over 10 steps = 60% end-to-end reliability.\n\nProduction agents need engineering rigor." },
            { type: "code", heading: "Guardrail Wrapper Pattern — C#", lang: "csharp", code: `public class GuardedAgent
{
    private readonly Kernel _kernel;
    private readonly AgentConfig _config;
    
    public async Task<AgentResult> ExecuteAsync(
        string userInput, CancellationToken ct)
    {
        // INPUT GUARDRAILS
        var sanitized = await ValidateInput(userInput);
        if (!sanitized.IsValid)
            return AgentResult.Blocked(sanitized.Reason);
        
        int iterations = 0;
        decimal totalCost = 0m;
        var timeout = new CancellationTokenSource(
            TimeSpan.FromSeconds(_config.MaxTimeoutSeconds));
        var linked = CancellationTokenSource
            .CreateLinkedTokenSource(ct, timeout.Token);
        
        try
        {
            while (iterations < _config.MaxIterations)
            {
                iterations++;
                
                // SPEND LIMIT
                if (totalCost > _config.MaxCostPerRequest)
                    return AgentResult.SpendLimitReached(totalCost);
                
                var stepResult = await ExecuteStepAsync(
                    sanitized.Input, linked.Token);
                
                totalCost += stepResult.Cost;
                
                // OUTPUT GUARDRAILS
                var validation = await ValidateOutput(stepResult);
                if (validation.RequiresHumanApproval)
                    return AgentResult.NeedsApproval(stepResult, validation);
                
                if (validation.ContainsPII)
                    stepResult = RedactPII(stepResult);
                
                if (stepResult.IsComplete)
                    return AgentResult.Success(stepResult);
            }
            
            return AgentResult.MaxIterationsReached(iterations);
        }
        catch (OperationCanceledException)
        {
            return AgentResult.TimedOut(_config.MaxTimeoutSeconds);
        }
    }
}` },
            { type: "checklist", heading: "Agent Safety Checklist", items: [
              "Input validation and sanitization before agent receives user input",
              "Output validation before results reach user or execute actions",
              "Tool access is restricted — customer service agents can't delete databases",
              "Spend limits: cap LLM calls, tool invocations, and dollars per request",
              "Human approval gate for consequential actions (send, delete, purchase, modify)",
              "Maximum iteration limit per agent loop (e.g., 10 iterations max)",
              "Timeout on the entire agent workflow (e.g., 30 seconds)",
              "Audit logging of every decision and action — essential for debugging + compliance",
              "PII detection on outputs before returning to users",
              "Circuit breaker: if error rate exceeds threshold, fall back to simpler path",
            ]},
            { type: "decision", heading: "Human-in-the-Loop Patterns", rows: [
              ["Read-only operations (search, lookup)", "No approval needed"],
              ["Internal data modification", "Log + notify, optional approval"],
              ["External communication (email, Slack)", "Always require approval"],
              ["Financial transactions", "Always require approval + audit"],
              ["Irreversible actions (delete)", "Require approval + confirmation"],
            ]}
          ]
        },
        { id: "m5l5", title: "Agent Evaluation & Testing", duration: "8 min", tags: ["agents","testing","evaluation"],
          content: [
            { type: "text", heading: "Three Levels of Agent Testing", body: "**Unit tests** — Each tool works correctly in isolation. Standard software testing.\n\n**Trajectory tests** — Given a task, does the agent use the right tools in a reasonable order? Evaluate the path, not just the endpoint.\n\n**End-to-end tests** — Does the agent complete the task correctly? Test with diverse inputs including edge cases, adversarial inputs, and missing data." },
            { type: "code", heading: "Agent Trajectory Testing — Python", lang: "python", code: `import pytest

async def test_refund_agent_trajectory():
    """Agent should: lookup customer -> get orders -> issue refund"""
    
    result = await agent.ainvoke({
        "messages": [("user", "Refund jane@example.com's last order")]
    })
    
    # Extract tool calls from message history
    tool_calls = [
        msg.tool_calls[0]["name"] 
        for msg in result["messages"] 
        if hasattr(msg, "tool_calls") and msg.tool_calls
    ]
    
    # Verify correct tool sequence
    assert "get_customer" in tool_calls, "Should look up customer first"
    assert tool_calls.index("get_customer") < tool_calls.index("get_orders"), \\
        "Should look up customer before orders"
    assert "issue_refund" in tool_calls, "Should issue the refund"
    
    # Verify final answer quality
    final_message = result["messages"][-1].content
    assert "refund" in final_message.lower()
    assert "jane" in final_message.lower()

async def test_agent_handles_missing_customer():
    """Agent should gracefully handle customer not found"""
    result = await agent.ainvoke({
        "messages": [("user", "Refund nonexistent@fake.com's order")]
    })
    final = result["messages"][-1].content
    assert "not found" in final.lower() or "couldn't find" in final.lower()

async def test_agent_max_iterations():
    """Agent should not loop forever on impossible tasks"""
    result = await agent.ainvoke({
        "messages": [("user", "Do something impossible")]
    })
    tool_calls = [m for m in result["messages"] if hasattr(m, "tool_calls")]
    assert len(tool_calls) <= 10, "Should respect iteration limit"` },
            { type: "checklist", heading: "Agent Testing Checklist", items: [
              "Happy path: does the agent complete typical tasks correctly?",
              "Edge cases: ambiguous inputs, missing data, partial information",
              "Adversarial: prompt injection attempts in user input",
              "Timeout: does the agent respect time limits?",
              "Cost: does the agent stay within token/cost budgets?",
              "Trajectory: is the tool sequence efficient and logical?",
              "Regression: full test suite runs on every prompt/tool/model change",
              "Load testing: agent behavior under concurrent requests",
            ]}
          ]
        },
        { id: "m5l6", title: "Agent State & Memory Patterns", duration: "13 min", tags: ["agents","memory","state","patterns"],
          content: [
            { type: "text", heading: "Why Agents Need Memory", body: "LLMs are stateless — each API call starts from scratch. But useful agents need to remember: what happened earlier in the conversation, what the user prefers, what entities have been mentioned, and what tasks are in progress.\n\nMemory is what turns a stateless tool-caller into a coherent agent. The right memory architecture depends on your use case." },
            { type: "decision", heading: "Memory Type Selection", rows: [
              ["Short conversation (<20 messages)", "Buffer memory — store all messages, send full history"],
              ["Long conversation (20-100+ messages)", "Window memory (last N messages) or summary memory"],
              ["Need to track specific entities (people, orders, products)", "Entity memory — extract and store entity state separately"],
              ["Agent needs to remember across sessions (days/weeks)", "Long-term vector memory — embed and retrieve past interactions"],
              ["Multi-step workflow with structured progress", "Workflow state — explicit state machine, not conversation-based"],
              ["Multiple users, personalized behavior", "Per-user memory store — vector DB partitioned by user ID"],
            ]},
            { type: "text", heading: "Buffer Memory (Full History)", body: "The simplest pattern: store every message and send the complete history with each request.\n\n**Pros:** Complete context, no information loss\n**Cons:** Token cost grows linearly, eventually hits context limit\n**Best for:** Short task-specific conversations (customer support tickets, single-session workflows)" },
            { type: "text", heading: "Window Memory (Last N Messages)", body: "Keep only the last N messages. Simple and predictable token usage.\n\n**Pros:** Fixed token cost, easy to implement\n**Cons:** Forgets earlier context — agent can contradict itself\n**Best for:** Casual chat, long-running sessions where recent context matters most" },
            { type: "text", heading: "Summary Memory", body: "Use an LLM to periodically summarize older messages, then keep the summary + recent messages.\n\n**Pros:** Retains key information from long conversations at fixed token cost\n**Cons:** Summary can lose important details, adds LLM call overhead\n**Best for:** Long customer interactions, ongoing projects" },
            { type: "code", heading: "Conversation Memory Manager — C#", lang: "csharp", code: `public class ConversationMemory
{
    private readonly List<ChatMessage> _fullHistory = new();
    private readonly Kernel _kernel;
    private string _summary = "";
    private readonly int _windowSize;
    private readonly int _summarizeThreshold;
    
    public ConversationMemory(
        Kernel kernel, int windowSize = 10, int summarizeThreshold = 20)
    {
        _kernel = kernel;
        _windowSize = windowSize;
        _summarizeThreshold = summarizeThreshold;
    }
    
    public void AddMessage(ChatMessage message)
    {
        _fullHistory.Add(message);
    }
    
    /// <summary>
    /// Get messages to send to the LLM. Uses summary + window strategy.
    /// </summary>
    public async Task<List<ChatMessage>> GetContextAsync()
    {
        // If short conversation, send everything
        if (_fullHistory.Count <= _windowSize)
            return new List<ChatMessage>(_fullHistory);
        
        // If we've accumulated enough new messages, update summary
        if (_fullHistory.Count >= _summarizeThreshold && 
            _fullHistory.Count % _summarizeThreshold == 0)
        {
            await UpdateSummaryAsync();
        }
        
        var context = new List<ChatMessage>();
        
        // Add summary of older messages
        if (!string.IsNullOrEmpty(_summary))
        {
            context.Add(new ChatMessage(
                "system",
                $"Summary of earlier conversation:\n{_summary}"));
        }
        
        // Add recent messages (window)
        var recent = _fullHistory
            .Skip(Math.Max(0, _fullHistory.Count - _windowSize))
            .ToList();
        context.AddRange(recent);
        
        return context;
    }
    
    private async Task UpdateSummaryAsync()
    {
        // Summarize everything except the last window
        var toSummarize = _fullHistory
            .Take(_fullHistory.Count - _windowSize)
            .ToList();
        
        var messages = string.Join("\n", 
            toSummarize.Select(m => 
                $"{m.Role}: {m.Content}"));
        
        var prompt = $"""
        Summarize this conversation history concisely. 
        Preserve: key decisions, action items, user preferences, 
        and any commitments made.
        
        {(_summary != "" ? $"Previous summary:\n{_summary}\n\n" : "")}
        New messages to incorporate:
        {messages}
        
        Updated summary:
        """;
        
        var result = await _kernel.InvokePromptAsync(prompt);
        _summary = result.ToString();
    }
}

// Usage in an agent loop:
var memory = new ConversationMemory(kernel, windowSize: 10);

while (true)
{
    var userInput = GetUserInput();
    memory.AddMessage(new ChatMessage("user", userInput));
    
    var context = await memory.GetContextAsync();
    var systemPrompt = new ChatMessage("system", agentInstructions);
    
    var allMessages = new[] { systemPrompt }
        .Concat(context).ToList();
    
    var response = await chat.GetChatMessageContentAsync(allMessages);
    memory.AddMessage(new ChatMessage("assistant", response.Content));
}` },
            { type: "text", heading: "Entity Memory", body: "Extract and maintain structured information about entities (people, companies, orders, projects) mentioned in conversation. The agent tracks entity state separately from message history.\n\n**How it works:**\n1. After each message, extract entity updates (LLM call)\n2. Store entities in a structured format (JSON/DB)\n3. Inject relevant entity summaries into the agent context\n\n**Best for:** CRM-like agents, case management, any workflow where tracking the state of specific things matters more than the conversation flow." },
            { type: "code", heading: "Entity Memory — Python", lang: "python", code: `from pydantic import BaseModel
from langchain_openai import AzureChatOpenAI

llm = AzureChatOpenAI(model="gpt-4o-mini", temperature=0)

class EntityUpdate(BaseModel):
    entity_name: str
    entity_type: str  # person, company, order, product
    attributes: dict[str, str]  # key-value pairs to update

class EntityMemory:
    def __init__(self):
        self.entities: dict[str, dict] = {}  # name -> attributes
    
    async def extract_and_update(self, message: str):
        """Extract entity updates from a message."""
        result = await llm.with_structured_output(
            list[EntityUpdate]
        ).ainvoke(
            f"""Extract entity information from this message.
            Return updates for any people, companies, orders, 
            or products mentioned with their attributes.
            
            Current known entities:
            {json.dumps(self.entities, indent=2)}
            
            Message: {message}
            
            Return a JSON array of entity updates."""
        )
        
        for update in result:
            name = update.entity_name.lower()
            if name not in self.entities:
                self.entities[name] = {
                    "type": update.entity_type,
                    "first_mentioned": datetime.now().isoformat()
                }
            self.entities[name].update(update.attributes)
    
    def get_context(self, relevant_to: str = None) -> str:
        """Get entity context for the agent prompt."""
        if not self.entities:
            return ""
        
        lines = ["Known entities:"]
        for name, attrs in self.entities.items():
            lines.append(f"  {name} ({attrs.get('type', 'unknown')}):")
            for k, v in attrs.items():
                if k not in ('type', 'first_mentioned'):
                    lines.append(f"    {k}: {v}")
        
        return "\n".join(lines)

# Usage:
memory = EntityMemory()

# User says: "Jane from Acme Corp placed order #1234 for 50 widgets"
await memory.extract_and_update(
    "Jane from Acme Corp placed order #1234 for 50 widgets"
)
# memory.entities now contains:
# {"jane": {"type": "person", "company": "Acme Corp"},
#  "acme corp": {"type": "company"},
#  "order #1234": {"type": "order", "items": "50 widgets", "customer": "Jane"}}

# Inject into agent prompt:
agent_context = memory.get_context()` },
            { type: "text", heading: "Long-Term Vector Memory", body: "Store past interactions as embeddings in a vector database. Retrieve relevant memories when context is needed. This is how you build agents that remember across sessions — days, weeks, or months later.\n\n**How it works:**\n1. After each conversation turn, embed and store a memory record\n2. On new messages, search for relevant past memories\n3. Inject top-K memories into the agent context\n\n**Key design decisions:**\n• What to store: full messages, summaries, or extracted facts?\n• How to index: by content, by topic, by timestamp, or by user?\n• How to expire: time-based decay, relevance threshold, or explicit deletion?" },
            { type: "code", heading: "Long-Term Memory Store — Python", lang: "python", code: `from datetime import datetime
import json

class LongTermMemory:
    """Vector-backed memory that persists across sessions."""
    
    def __init__(self, vector_store, embeddings, user_id: str):
        self.store = vector_store
        self.embeddings = embeddings
        self.user_id = user_id
    
    async def save_memory(
        self, content: str, 
        memory_type: str = "conversation",
        metadata: dict = None
    ):
        """Save a memory to the vector store."""
        doc_metadata = {
            "user_id": self.user_id,
            "memory_type": memory_type,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {})
        }
        
        await self.store.aadd_texts(
            texts=[content],
            metadatas=[doc_metadata]
        )
    
    async def recall(
        self, query: str, 
        k: int = 5,
        memory_type: str = None
    ) -> list[str]:
        """Retrieve relevant memories."""
        filter_dict = {"user_id": self.user_id}
        if memory_type:
            filter_dict["memory_type"] = memory_type
        
        results = await self.store.asimilarity_search(
            query, k=k, filter=filter_dict
        )
        
        return [
            f"[{r.metadata['timestamp'][:10]}] {r.page_content}"
            for r in results
        ]
    
    async def save_conversation_summary(
        self, messages: list[dict], llm
    ):
        """Summarize and store a conversation for long-term recall."""
        conversation = "\n".join(
            f"{m['role']}: {m['content']}" for m in messages
        )
        
        summary = await llm.ainvoke(
            f"""Summarize this conversation in 2-3 sentences.
            Focus on: decisions made, preferences expressed, 
            problems discussed, and outcomes.
            
            {conversation}"""
        )
        
        await self.save_memory(
            summary.content,
            memory_type="conversation_summary",
            metadata={"message_count": len(messages)}
        )

# Usage in an agent:
memory = LongTermMemory(vector_store, embeddings, user_id="user_123")

# At start of conversation, recall relevant context
user_message = "How's my project coming along?"
memories = await memory.recall(user_message, k=3)

# Inject into system prompt
system = f"""You are a helpful assistant.

Relevant context from past conversations:
{chr(10).join(memories) if memories else 'No relevant past context.'}

Use this context naturally. Don't mention that you're 
retrieving memories — just use the information."""

# At end of conversation, save for future recall
await memory.save_conversation_summary(conversation_messages, llm)` },
            { type: "text", heading: "Workflow State (Structured)", body: "For multi-step workflows, don't rely on conversation memory at all. Use explicit structured state.\n\nThis is the LangGraph approach: define a state schema, update it at each step, and pass it between nodes. The conversation is a side effect of the workflow, not the source of truth." },
            { type: "code", heading: "Workflow State — LangGraph", lang: "python", code: `from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from operator import add

class InvoiceProcessingState(TypedDict):
    """Explicit state schema for an invoice processing workflow."""
    
    # Input
    document_path: str
    
    # Classification step
    doc_type: str
    classification_confidence: float
    
    # Extraction step
    extracted_data: dict
    extraction_errors: list[str]
    
    # Validation step
    is_valid: bool
    validation_errors: Annotated[list[str], add]
    
    # Matching step
    matched_vendor_id: str | None
    matched_po_id: str | None
    
    # Output
    status: str  # "processed" | "exception" | "rejected"
    ap_entry_id: str | None
    
    # Audit trail
    messages: Annotated[list[str], add]

async def classify_node(state: InvoiceProcessingState):
    # Classification logic here
    return {
        "doc_type": "invoice",
        "classification_confidence": 0.95,
        "messages": ["Classified as invoice (95% confidence)"]
    }

async def extract_node(state: InvoiceProcessingState):
    # Extraction logic here
    return {
        "extracted_data": extracted,
        "extraction_errors": errors,
        "messages": [f"Extracted {len(extracted)} fields"]
    }

async def validate_node(state: InvoiceProcessingState):
    errors = run_validation_rules(state["extracted_data"])
    return {
        "is_valid": len(errors) == 0,
        "validation_errors": errors,
        "messages": [f"Validation: {len(errors)} errors found"]
    }

def route_after_validation(state: InvoiceProcessingState):
    if not state["is_valid"]:
        return "exception_queue"
    return "match_and_process"

# Build the graph
graph = StateGraph(InvoiceProcessingState)
graph.add_node("classify", classify_node)
graph.add_node("extract", extract_node)
graph.add_node("validate", validate_node)
graph.add_node("match_and_process", match_node)
graph.add_node("exception_queue", exception_node)

graph.add_edge(START, "classify")
graph.add_edge("classify", "extract")
graph.add_edge("extract", "validate")
graph.add_conditional_edges("validate", route_after_validation)
graph.add_edge("match_and_process", END)
graph.add_edge("exception_queue", END)

app = graph.compile()

# State is explicit, inspectable, and serializable at every step
result = await app.ainvoke({"document_path": "/invoices/001.pdf"})
print(result["status"])      # "processed" or "exception"
print(result["messages"])    # full audit trail` },
            { type: "checklist", heading: "Memory Architecture Checklist", items: [
              "Start with the simplest memory type that meets your needs (usually buffer)",
              "Set a token budget for memory context — don't let it eat your context window",
              "For multi-step workflows, use explicit structured state, not conversation memory",
              "Entity memory is worth the complexity when you're tracking 5+ entity types",
              "Long-term memory needs a retention policy: time-based decay or max entries",
              "Always partition long-term memory by user ID — never leak memories across users",
              "Test memory with long conversations (50+ turns) — most bugs appear at scale",
              "Log what memories are injected on each turn for debugging",
              "Summarization memory adds ~500ms latency per summarize — do it async or batched",
              "For production: persist state to a database, not in-memory — agents crash and restart",
            ]}
          ]
        },
        { id: "m5l7", title: "Workflow Orchestration Deep Dive", duration: "14 min", tags: ["agents","orchestration","langgraph","semantic-kernel","workflows"],
          content: [
            { type: "text", heading: "Beyond Simple Agents", body: "Simple ReAct agents handle straightforward tool-calling tasks well. But real enterprise workflows need more: conditional branching, parallel execution, human approval gates, error recovery, and persistent state that survives crashes.\n\nThis is where orchestration frameworks come in. They give you a graph-based or pipeline-based way to define complex workflows where an LLM is just one node among many." },
            { type: "decision", heading: "Orchestration Framework Selection", rows: [
              [".NET/C# team, Azure ecosystem", "Semantic Kernel — first-party Microsoft, native Azure integration, production-grade"],
              ["Python team, maximum flexibility", "LangGraph — graph-based, most expressive, best for complex branching"],
              ["Python team, multi-agent focus", "CrewAI — role-based agents that collaborate, simpler API"],
              ["Need visual workflow builder", "n8n with AI nodes — low-code, visual, good for non-engineers"],
              ["Simple linear pipeline", "Plain code — don't add a framework for a 3-step chain"],
              ["Event-driven / async-heavy", "LangGraph with async nodes + message queues for durability"],
            ]},
            { type: "text", heading: "Semantic Kernel Planners & Pipelines", body: "Semantic Kernel offers two orchestration approaches:\n\n**Auto Function Calling** — The LLM decides which plugins/functions to call and in what order. Best for conversational agents where the user drives the workflow.\n\n**Manual Orchestration** — You define the pipeline in code, calling kernel functions explicitly. Best for structured workflows where the steps are known in advance.\n\nFor production systems, manual orchestration is almost always the right choice. You want deterministic flow with LLM intelligence at specific steps — not an LLM deciding the entire workflow." },
            { type: "code", heading: "Semantic Kernel Pipeline — C#", lang: "csharp", code: `using Microsoft.SemanticKernel;

public class InvoicePipeline
{
    private readonly Kernel _kernel;
    
    /// <summary>
    /// Structured pipeline: each step is explicit, LLM used 
    /// only where intelligence is needed.
    /// </summary>
    public async Task<PipelineResult> ProcessAsync(
        InvoiceDocument doc, CancellationToken ct)
    {
        var state = new PipelineState { Document = doc };
        
        // Step 1: CLASSIFY (LLM) — Is this an invoice?
        state.Classification = await _kernel.InvokeAsync<ClassificationResult>(
            "DocumentPlugin", "ClassifyDocument",
            new() { ["document"] = doc.Text });
        
        if (state.Classification.Type != "invoice")
            return PipelineResult.Skipped(
                $"Document classified as {state.Classification.Type}");
        
        // Step 2: EXTRACT (LLM) — Pull structured data
        state.Extraction = await _kernel.InvokeAsync<InvoiceData>(
            "ExtractionPlugin", "ExtractInvoice",
            new() { ["document"] = doc.Text, ["images"] = doc.PageImages });
        
        // Step 3: VALIDATE (Code) — Deterministic business rules
        state.Validation = ValidateExtraction(state.Extraction);
        if (!state.Validation.IsValid)
        {
            // Branch: route to exception queue
            return PipelineResult.Exception(
                state.Extraction, state.Validation.Errors);
        }
        
        // Step 4: MATCH (Code + DB) — Find vendor and PO
        state.VendorMatch = await _vendorRepo.MatchAsync(
            state.Extraction.VendorName);
        
        if (state.VendorMatch == null)
        {
            // Branch: new vendor — needs human approval
            return PipelineResult.NeedsApproval(
                "New vendor detected", state.Extraction);
        }
        
        // Step 5: GL CODING (LLM) — Suggest GL codes
        state.GLCodes = await _kernel.InvokeAsync<GLSuggestion>(
            "AccountingPlugin", "SuggestGLCodes",
            new() { 
                ["lineItems"] = state.Extraction.LineItems,
                ["vendorHistory"] = state.VendorMatch.RecentCodes,
                ["chartOfAccounts"] = _chartOfAccounts 
            });
        
        // Step 6: COMMIT (Code) — Write to ERP
        // Only reached if all previous steps passed
        var entry = await _erpService.CreateAPEntryAsync(
            state.ToAPEntry());
        
        return PipelineResult.Success(entry.Id, state);
    }
    
    /// <summary>
    /// Define each LLM step as a Semantic Kernel function.
    /// This keeps prompts organized and testable.
    /// </summary>
    private void RegisterPlugins()
    {
        _kernel.Plugins.AddFromPromptDirectory("./Prompts/Document");
        _kernel.Plugins.AddFromPromptDirectory("./Prompts/Extraction");
        _kernel.Plugins.AddFromPromptDirectory("./Prompts/Accounting");
        _kernel.Plugins.AddFromType<ValidationPlugin>();
    }
}` },
            { type: "code", heading: "LangGraph Complex Workflow — Python", lang: "python", code: `from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from typing import TypedDict, Annotated, Literal
from operator import add

# 1. Define typed state — this is your workflow's data model
class WorkflowState(TypedDict):
    # Input
    document_path: str
    
    # Processing state
    classification: dict | None
    extracted_data: dict | None
    validation_errors: Annotated[list[str], add]
    vendor_match: dict | None
    gl_suggestions: list[dict]
    
    # Control flow
    needs_human_review: bool
    review_decision: str | None  # "approve" | "reject" | "edit"
    
    # Output
    status: str
    ap_entry_id: str | None
    audit_trail: Annotated[list[str], add]

# 2. Define nodes (each is an async function)
async def classify(state: WorkflowState) -> dict:
    result = await llm.ainvoke(
        f"Classify this document: {state['document_path']}")
    return {
        "classification": {"type": "invoice", "confidence": 0.95},
        "audit_trail": ["Classified as invoice (95%)"]
    }

async def extract(state: WorkflowState) -> dict:
    result = await extract_with_vision(state["document_path"])
    return {
        "extracted_data": result,
        "audit_trail": [f"Extracted {len(result.get('line_items',[]))} line items"]
    }

async def validate(state: WorkflowState) -> dict:
    errors = run_validation(state["extracted_data"])
    return {
        "validation_errors": errors,
        "needs_human_review": len(errors) > 0,
        "audit_trail": [f"Validation: {len(errors)} errors"]
    }

async def match_vendor(state: WorkflowState) -> dict:
    vendor = await vendor_db.match(state["extracted_data"]["vendor_name"])
    return {
        "vendor_match": vendor,
        "needs_human_review": vendor is None,
        "audit_trail": [f"Vendor: {'matched' if vendor else 'NEW - needs review'}"]
    }

async def suggest_gl(state: WorkflowState) -> dict:
    suggestions = await llm.ainvoke(
        f"Suggest GL codes for: {state['extracted_data']['line_items']}")
    return {
        "gl_suggestions": suggestions,
        "audit_trail": ["GL codes suggested"]
    }

async def human_review(state: WorkflowState) -> dict:
    """This node PAUSES the workflow until a human responds.
    LangGraph's checkpointing saves state to SQLite/Postgres.
    Resume by sending the human's decision as an update."""
    # The workflow halts here. External system (UI, Slack bot, email)
    # collects the human decision and resumes the workflow.
    return {
        "audit_trail": ["Awaiting human review"],
        "status": "pending_review"
    }

async def commit_to_erp(state: WorkflowState) -> dict:
    entry_id = await erp.create_ap_entry(state)
    return {
        "ap_entry_id": entry_id,
        "status": "processed",
        "audit_trail": [f"Committed to ERP: {entry_id}"]
    }

async def reject(state: WorkflowState) -> dict:
    return {
        "status": "rejected",
        "audit_trail": ["Rejected by human reviewer"]
    }

# 3. Define routing functions
def route_after_validation(state: WorkflowState) -> Literal["match_vendor", "human_review"]:
    if state.get("needs_human_review"):
        return "human_review"
    return "match_vendor"

def route_after_review(state: WorkflowState) -> Literal["match_vendor", "reject"]:
    if state.get("review_decision") == "approve":
        return "match_vendor"
    return "reject"

# 4. Build the graph
graph = StateGraph(WorkflowState)

# Add nodes
graph.add_node("classify", classify)
graph.add_node("extract", extract)
graph.add_node("validate", validate)
graph.add_node("match_vendor", match_vendor)
graph.add_node("suggest_gl", suggest_gl)
graph.add_node("human_review", human_review)
graph.add_node("commit", commit_to_erp)
graph.add_node("reject", reject)

# Add edges
graph.add_edge(START, "classify")
graph.add_edge("classify", "extract")
graph.add_edge("extract", "validate")
graph.add_conditional_edges("validate", route_after_validation)
graph.add_conditional_edges("human_review", route_after_review)
graph.add_edge("match_vendor", "suggest_gl")
graph.add_edge("suggest_gl", "commit")
graph.add_edge("commit", END)
graph.add_edge("reject", END)

# 5. Compile with persistence (survives crashes)
checkpointer = SqliteSaver.from_conn_string("./workflow_state.db")
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["human_review"]  # pause before this node
)

# 6. Run a workflow
config = {"configurable": {"thread_id": "invoice-001"}}
result = await app.ainvoke(
    {"document_path": "/invoices/acme-001.pdf"},
    config=config
)

# If workflow paused at human_review, resume later:
# (after human approves via your UI)
result = await app.ainvoke(
    {"review_decision": "approve"},
    config=config  # same thread_id resumes from checkpoint
)` },
            { type: "text", heading: "Key Design Patterns", body: "**Deterministic flow, intelligent nodes** — The workflow structure (which steps, in what order, what branches) is defined in code. LLMs are used only at specific nodes where intelligence is needed (classification, extraction, GL coding). Never let an LLM decide the workflow structure.\n\n**Checkpointing for durability** — Long-running workflows crash. LangGraph's checkpointer saves state after each node. When you restart, it resumes from the last checkpoint — not from scratch.\n\n**Human-in-the-loop via interrupts** — Define interrupt points where the workflow pauses and waits for human input. The workflow state is saved to a database. An external system (web UI, Slack bot, email) collects the human decision and resumes the workflow.\n\n**Parallel execution** — Independent steps can run simultaneously. In LangGraph, nodes that don't depend on each other run in parallel automatically when you define separate branches that converge." },
            { type: "checklist", heading: "Workflow Orchestration Checklist", items: [
              "Define workflow structure in code, not in LLM prompts — deterministic flow is debuggable",
              "Use LLMs only at nodes that require intelligence — everything else is plain code",
              "Enable checkpointing/persistence from day one — workflows will crash and need to resume",
              "Define explicit state schemas (TypedDict, Pydantic) — no untyped dictionaries",
              "Implement human-in-the-loop as interrupt + resume, not as blocking waits",
              "Add audit trail to state: every node appends what it did and why",
              "Set timeouts on every LLM node — one slow call shouldn't block the whole pipeline",
              "Test the full graph with mock LLM responses before integrating real models",
              "Log state transitions: which node, what input state, what output state",
              "Build a dead letter queue: workflows that fail after max retries go here for manual inspection",
              "Version your workflow graphs: changing the graph shape can break in-flight workflows",
            ]}
          ]
        }
      ]
    }
;
