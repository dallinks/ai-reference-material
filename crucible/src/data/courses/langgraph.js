// Building Agents with LangChain & LangGraph — professional/graduate level.
// LangGraph-centered: LangChain's Runnable/LCEL abstraction as the on-ramp, then
// LangGraph's graph execution model (StateGraph, super-steps, channels/reducers,
// checkpointing) as the rigorous core, then agents and production.
//
// APIs were web-verified against the current docs (docs.langchain.com/oss/python,
// 2026) at authoring time. The *rigor* is anchored in the durable layer — the
// Pregel/BSP execution model, graph semantics, retrieval math, and the foundational
// agent papers — which doesn't drift; exact imports/signatures should still be
// checked against the current docs, since the framework moves fast.

export const langgraph = {
  id: "langgraph",
  title: "Building Agents with LangChain & LangGraph",
  subject: "AI Engineering",
  difficulty: "Professional / Graduate",
  description:
    "A rigorous, build-first path from LangChain's Runnable abstraction to LangGraph's graph execution model — state machines, durable agents, RAG, and multi-agent systems. Grounded in the official docs and the foundational agent papers; the gates make you design and reason about real graphs, not recite APIs.",
  sources: [
    "LangChain & LangGraph official documentation (docs.langchain.com/oss/python, 2026)",
    "Yao et al. — ReAct: Synergizing Reasoning and Acting in Language Models (2022)",
    "Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP (2020)",
    "Shinn et al. — Reflexion (2023); Wang et al. — Plan-and-Solve Prompting (2023)",
    "Malewicz et al. — Pregel: A System for Large-Scale Graph Processing (SIGMOD 2010)",
  ],
  grader:
    "You are a principal AI engineer and LangGraph maintainer grading agent designs and graph implementations. Reward correct use of the execution model (super-steps, state channels, reducers), sound control flow (conditional edges, cycles with explicit termination, Command/Send), proper RAG and tool-calling, and explicit reasoning about failure modes, cost, determinism, and persistence; penalize hand-waving, 'just call the LLM again' non-answers, incorrect API usage, and designs that ignore state, error handling, or termination. A plausible-sounding but architecturally wrong answer should score low.",
  units: [
    {
      id: "lg1",
      title: "LLM Apps & the Runnable Abstraction (LCEL)",
      summary: "The composable primitive: chat models, messages, prompts, and the Runnable/LCEL interface that everything is built on.",
      masteryThreshold: 0.85,
      references: [
        "LangChain docs — Models, Messages & Prompts (docs.langchain.com/oss/python/langchain/models)",
        "LangChain docs — Runnable interface & LCEL (the `|` pipe)",
      ],
      lessons: [
        {
          id: "lg1l1",
          title: "Chat Models, Messages & Prompts",
          estMinutes: 22,
          content: [
            {
              type: "text",
              heading: "The LLM as a component",
              body: `Everything in LangChain reduces to one primitive: a **chat model** is a function from a *list of messages* to *a message*. You hand it the conversation so far (system instructions, user turns, prior assistant turns, tool results) and it returns the next assistant message. That's the whole contract. The model is **stateless** — it remembers nothing between calls; the entire context must be supplied each time. Building an "app" is the work of *assembling the right messages*, *calling the model*, and *acting on its reply* — and, crucially, managing the state the model itself doesn't (which is what LangGraph, later in this course, exists to do).`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Chat model",
              statement: `A **chat model** is a component that maps an ordered list of messages to a single response message. In LangChain you instantiate one provider-agnostically with \`init_chat_model("provider:model")\` (or a provider class like \`ChatAnthropic\`/\`ChatOpenAI\`), and call \`.invoke(messages)\` to get an \`AIMessage\`. The model is **deterministic only at temperature 0** and otherwise samples — a fact that shapes every reliability and evaluation decision later in the course.`,
            },
            {
              type: "code",
              heading: "Instantiate and invoke a chat model",
              lang: "python",
              code: `from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage

# Provider-agnostic: swap "openai:gpt-4o" etc. for any supported model.
model = init_chat_model("anthropic:claude-sonnet-4-5", temperature=0)

response = model.invoke([
    SystemMessage("You are a terse assistant."),
    HumanMessage("Name the capital of France."),
])
print(type(response))   # <class '...AIMessage'>
print(response.content) # "Paris."`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Messages",
              statement: `A conversation is a list of typed messages: **SystemMessage** (instructions/persona), **HumanMessage** (user input), **AIMessage** (the model's reply, which may contain tool calls), and **ToolMessage** (the result of executing a tool, fed back to the model). The umbrella type is **AnyMessage**. This typed message list — not a raw string — is the unit of currency: it carries roles, tool calls, and metadata that string concatenation would lose.`,
            },
            {
              type: "text",
              heading: "Prompts: templated message lists",
              body: `Hardcoding messages doesn't scale; you parameterize them with a **prompt template**. A \`ChatPromptTemplate\` is a function from variables to a message list — the reusable, testable unit of "how we ask." It separates the *fixed structure* of the prompt (system instructions, format, few-shot examples) from the *per-call inputs* (the user's question, retrieved context), so prompts can be versioned and reused rather than smeared through the code.`,
            },
            {
              type: "code",
              heading: "A prompt template",
              lang: "python",
              code: `from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {tone} assistant."),
    ("human", "{question}"),
])

messages = prompt.invoke({"tone": "concise", "question": "What is RAG?"})
# messages is a list: [SystemMessage("You are a concise assistant."),
#                      HumanMessage("What is RAG?")]
answer = model.invoke(messages)`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**The model is stateless — memory is *your* job.** Each \`.invoke\` is independent; the model recalls nothing from prior calls. A "chatbot that remembers" only does so because *you* re-send the accumulated message history every turn. As histories grow this costs tokens and eventually overflows the context window — which is why state management, summarization, and persistence (LangGraph, Units 4–6) are first-class concerns, not afterthoughts.`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "A developer says their chatbot 'remembers the conversation.' The model is stateless — so what is actually making it appear to remember, and what failure mode does that create as the conversation grows?",
                  solution: "The application is re-sending the **entire accumulated message history** (every prior Human/AI message) on each call — the model itself remembers nothing; it just re-reads the whole transcript each time. Failure mode: the history grows unbounded, so every turn costs more tokens (latency + $$), and eventually the transcript exceeds the model's **context window**, at which point either the call errors or early messages must be dropped/summarized — silently losing memory. This is why real systems manage state explicitly (trim, summarize, or persist + retrieve relevant history) rather than naively appending forever.",
                },
                {
                  prompt: "Why is a typed message list (System/Human/AI/Tool) the unit of input rather than a single concatenated string?",
                  solution: "Because the structure carries information a flat string would destroy: **roles** (the model treats system instructions, user turns, and its own prior replies differently), **tool calls** (an AIMessage can contain structured tool-call requests, and a ToolMessage carries the result keyed to that call), and metadata. Providers consume a structured chat format, and tool-calling/agents depend on that structure; concatenating to a string would lose the roles and make tool use impossible. The message list is the lossless, provider-native representation.",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "lg1l1-i1", front: "What is a chat model, as a function?", back: "A map from an ordered list of messages → a single response (AIMessage). Stateless: it remembers nothing between calls; the full context must be supplied each time." },
            { id: "lg1l1-i2", front: "The four message types?", back: "SystemMessage (instructions), HumanMessage (user), AIMessage (model reply, may hold tool calls), ToolMessage (tool result fed back). Umbrella type: AnyMessage." },
            { id: "lg1l1-i3", front: "What is a ChatPromptTemplate?", back: "A function from variables → a message list — the reusable, versionable unit separating fixed prompt structure from per-call inputs. `prompt.invoke({...})` yields messages." },
            { id: "lg1l1-i4", front: "Why does a 'memory' chatbot eventually break?", back: "The model is stateless; memory = re-sending the whole history each turn. It grows unbounded → rising token cost and eventual context-window overflow. Hence explicit state management." },
            { id: "lg1l1-i5", front: "When is a chat model deterministic?", back: "Only at temperature 0 (greedy). Otherwise it samples — the root reason agents need evaluation, retries, and careful reliability design." },
          ],
        },
        {
          id: "lg1l2",
          title: "Composition: The Runnable Interface & LCEL",
          estMinutes: 24,
          content: [
            {
              type: "theorem",
              kind: "definition",
              name: "The Runnable interface",
              statement: `A **Runnable** is any component implementing LangChain's standard protocol: synchronous \`invoke\` (one input → one output), \`batch\` (many inputs in parallel), and \`stream\` (yield output incrementally), plus their async forms \`ainvoke\`/\`abatch\`/\`astream\`. Chat models, prompt templates, output parsers, retrievers, and tools are *all* Runnables. The uniform interface is the entire design: because every piece speaks the same protocol, pieces compose interchangeably.`,
            },
            {
              type: "text",
              heading: "LCEL: composition with a pipe",
              body: `The **LangChain Expression Language (LCEL)** composes Runnables with the pipe operator \`|\`, borrowed from Unix: \`chain = prompt | model | parser\` builds a pipeline where each component's output feeds the next's input. The pipe is **function composition** made concrete — \`(prompt | model)\` is read left-to-right as "run prompt, feed its messages to model." The result is *itself a Runnable*, so it too has \`invoke\`/\`batch\`/\`stream\`. This is not syntactic sugar; it's an algebra, and the next result says why that matters.`,
            },
            {
              type: "code",
              heading: "An LCEL chain",
              lang: "python",
              code: `from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()   # Runnable: dict -> str

chain.invoke({"tone": "concise", "question": "What is RAG?"})   # one call
chain.batch([{"tone": "terse", "question": q} for q in questions])  # parallel
for chunk in chain.stream({"tone": "concise", "question": "..."}):  # streaming
    print(chunk, end="")`,
            },
            {
              type: "theorem",
              kind: "proposition",
              name: "Runnables are closed under composition",
              statement: `If f : A → B and g : B → C are Runnables, then f | g is a Runnable A → C. Hence any LCEL pipeline is itself a Runnable and inherits the full interface — sync/async invoke, batch, and stream — with no extra code. Composition is associative, so chains of any length are well-defined.`,
              proof: `A Runnable is any object satisfying the interface (invoke/batch/stream + async) that maps a typed input to a typed output. The pipe f | g constructs a new object whose \`invoke(x)\` computes \`g.invoke(f.invoke(x))\` — ordinary function composition — and which *implements the same interface* by delegation: its \`batch\` maps the composition over inputs (reusing each stage's parallel batch), its \`stream\` pipes f's output into g, and its async methods await the underlying async forms. Since the constructed object satisfies the Runnable interface, it *is* a Runnable (closure). And because composition of functions is associative, (f | g) | h = f | (g | h), so a pipeline's meaning is independent of how you parenthesize it. ∎\n\nThe payoff is concrete: you write a chain as a linear expression and get streaming, batching, async, retries, and fallbacks **for free**, because they are defined once on the interface and propagate through every composition. This closure property is the real reason LCEL exists.`,
            },
            {
              type: "text",
              heading: "Parallelism and beyond",
              body: `Two more combinators round out the algebra. **RunnableParallel** (often written as a dict in a chain) runs several Runnables on the same input concurrently and collects their outputs — e.g. fetch a retrieval result *and* pass through the question in one step. **RunnablePassthrough** forwards input unchanged (useful for threading the original input alongside a transformed one). With pipe (sequence), parallel (fan-out/join), and passthrough, LCEL expresses any **directed acyclic** dataflow. What it deliberately *cannot* express is **branching on data, loops, or shared mutable state** — and that boundary is exactly where LangGraph begins.`,
            },
            {
              type: "callout",
              tone: "info",
              body: `**LCEL is for linear/DAG pipelines; LangGraph is for branching, loops, and state.** If your flow is "prompt → model → parse," LCEL is perfect and you should not reach for a graph. The moment you need *conditional routing* ("if the model asked for a tool, run it, else finish"), *cycles* (an agent that loops until done), or *shared evolving state* across steps, you've outgrown a DAG — that's the signal to move to LangGraph (Unit 4).`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "The LCEL chain `prompt | model | parser` — what classical programming concept is the `|` operator implementing, and why does that make the whole chain a Runnable?",
                  solution: "It implements **function composition**: (prompt | model | parser).invoke(x) = parser.invoke(model.invoke(prompt.invoke(x))), feeding each stage's output to the next. The chain is itself a Runnable because the **Runnable interface is closed under composition** — the composed object delegates invoke/batch/stream/async to its stages, so it satisfies the same interface. That closure is what lets the chain inherit streaming, batching, and async for free, and lets you nest chains arbitrarily.",
                },
                {
                  prompt: "Name three capabilities a composed LCEL chain inherits 'for free,' and explain what kind of flow LCEL *cannot* express (and what to use instead).",
                  solution: "For free (from the uniform interface, defined once and propagated by closure): (1) **streaming** (`stream` pipes each stage's incremental output), (2) **batching** (`batch` runs many inputs in parallel across stages), (3) **async** (`ainvoke`/`astream`) — plus retries/fallbacks/parallel. What LCEL *cannot* express: **data-dependent branching, loops/cycles, and shared mutable state** — LCEL is a DAG of pure transforms. For conditional routing, loops (e.g. an agent that calls tools until done), or evolving shared state, you use **LangGraph** (a stateful graph with conditional edges and cycles), which is the core of this course.",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "lg1l2-i1", front: "What is the Runnable interface?", back: "The standard protocol every LangChain component implements: invoke, batch, stream (+ async ainvoke/abatch/astream). Uniformity is what lets components compose interchangeably." },
            { id: "lg1l2-i2", front: "What does the LCEL `|` operator do?", back: "Function composition: chains Runnables left-to-right (prompt | model | parser), each output feeding the next input. The result is itself a Runnable." },
            { id: "lg1l2-i3", front: "Why is a composed LCEL chain itself a Runnable?", back: "Closure under composition: the piped object delegates invoke/batch/stream/async to its stages, satisfying the same interface — so it's a Runnable, and composition is associative." },
            { id: "lg1l2-i4", front: "What do you get 'for free' from LCEL composition?", back: "Streaming, batching, async, parallelism (RunnableParallel), retries, fallbacks — defined once on the interface and propagated through every composition." },
            { id: "lg1l2-i5", front: "What can LCEL NOT express, and what's the alternative?", back: "Data-dependent branching, loops/cycles, and shared mutable state (it's a DAG of pure transforms). For those, use LangGraph — a stateful graph with conditional edges and cycles." },
          ],
        },
        {
          id: "lg1l3",
          title: "Structured Output & Reliability",
          estMinutes: 22,
          content: [
            {
              type: "text",
              heading: "From text to typed data",
              body: `LLMs emit *text*, but applications need *typed data* — a category label, a list of extracted fields, a routing decision. Coaxing JSON out of a model with prompt instructions and then regex-parsing the reply is brittle: the model adds prose, forgets a brace, or hallucinates a field. The reliable path is to make the model emit structure *natively*, validated against a schema you declare — which modern providers support directly via their tool-calling / JSON-mode machinery.`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Structured output",
              statement: `\`model.with_structured_output(Schema)\` returns a Runnable that, instead of free text, yields an instance of \`Schema\` (a Pydantic model, TypedDict, or JSON schema). Under the hood it constrains the model — typically by exposing the schema as a tool the model must "call," or via the provider's JSON mode — so the output is parsed and validated against the schema before you ever see it. You get a typed object, not a string to wrestle with.`,
            },
            {
              type: "code",
              heading: "Structured output with a Pydantic schema",
              lang: "python",
              code: `from pydantic import BaseModel, Field

class Classification(BaseModel):
    category: str = Field(description="one of: billing, technical, other")
    urgency: int = Field(description="1 (low) to 5 (high)")

classifier = model.with_structured_output(Classification)

result = classifier.invoke("My payment failed three times and I'm furious!")
print(result.category, result.urgency)   # e.g. "billing" 5
print(type(result))                      # <class 'Classification'>  — typed!`,
            },
            {
              type: "theorem",
              kind: "definition",
              name: "Output parsers",
              statement: `An **output parser** is a Runnable that transforms a model's raw output into a target form: \`StrOutputParser\` (extract the text content), \`JsonOutputParser\` (parse JSON, optionally streaming partial objects), \`PydanticOutputParser\` (validate into a Pydantic model). Parsers sit at the end of an LCEL chain. They are the fallback when a provider lacks native structured output; when it has it, prefer \`with_structured_output\`.`,
            },
            {
              type: "text",
              heading: "Why native structure beats parsing",
              body: `\`with_structured_output\` is more reliable than instruct-and-parse for a structural reason: it uses the provider's **constrained generation** (tool-calling / JSON mode), where the model is steered to produce schema-valid output and the framework validates it — versus hoping a free-text model happens to emit clean JSON and then parsing it after the fact. The first fails *loudly* (a validation error you can retry) and rarely; the second fails *silently* and often (a stray sentence, a missing field). For anything a downstream step depends on — a routing decision, an extracted entity — use native structured output and treat a validation failure as a first-class, retryable event.`,
            },
            {
              type: "callout",
              tone: "warn",
              body: `**Don't regex JSON out of free text — declare a schema.** Prompt-and-parse ("respond in JSON…") is the classic source of flaky agents: it works in the demo and breaks in production on the one reply with extra prose. Prefer \`with_structured_output(Schema)\` (provider-native, validated); fall back to an output parser only when the provider can't do constrained generation, and even then validate and retry on failure.`,
            },
            {
              type: "exercises",
              heading: "Exercises",
              items: [
                {
                  prompt: "The most reliable way to get typed/structured data from a chat model is which approach, and why is the alternative fragile?",
                  solution: "Use **`with_structured_output(Schema)`** (native structured output), which leverages the provider's constrained generation (tool-calling / JSON mode) to steer the model toward schema-valid output and validates it before returning a typed object. The alternative — instructing the model to 'respond in JSON' and then **regex/parsing the free text** — is fragile because the model is unconstrained: it may add prose, omit a field, or malform the JSON, and parsing fails silently and often. Native structured output fails loudly (a validation error you can retry) and rarely, because the structure is enforced, not hoped for.",
                },
                {
                  prompt: "You're building a router that classifies a support ticket and the next node depends on the category. Sketch the component and explain how you'd handle the model returning an invalid category.",
                  solution: "Define a schema constraining the category, ideally an enum/Literal: e.g. `class Route(BaseModel): category: Literal['billing','technical','other']`, then `router = model.with_structured_output(Route)`. Because the category is a constrained field, the provider is steered to one of the allowed values and the result is validated to be one of them. Handling invalid output: treat a validation error as a **first-class, retryable event** — catch it, optionally re-invoke with a corrective message (or a lower temperature), and after N failures route to a safe default ('other' / human handoff) rather than crashing or silently mis-routing. The key is that the failure surfaces explicitly (validation), so the router can decide what to do — unlike free-text parsing, which would mis-route silently.",
                },
              ],
            },
          ],
          reviewItems: [
            { id: "lg1l3-i1", front: "What does with_structured_output(Schema) do?", back: "Returns a Runnable that yields a validated instance of Schema (Pydantic/TypedDict/JSON schema) instead of text — using the provider's tool-calling/JSON mode to constrain and validate the output." },
            { id: "lg1l3-i2", front: "Three output parsers and their use?", back: "StrOutputParser (extract text), JsonOutputParser (parse JSON, can stream partials), PydanticOutputParser (validate into a Pydantic model). They sit at the end of an LCEL chain." },
            { id: "lg1l3-i3", front: "Why is with_structured_output more reliable than instruct-and-parse?", back: "It uses constrained generation (tool-calling/JSON mode) + validation, failing loudly and rarely; instruct-and-parse hopes for clean JSON from a free-text model and fails silently and often." },
            { id: "lg1l3-i4", front: "How should you treat a structured-output validation failure?", back: "As a first-class, retryable event: catch it, optionally re-invoke with a correction/lower temperature, and fall back to a safe default after N tries — never silently mis-handle." },
          ],
        },
      ],
      masteryCheck: {
        id: "lg1-check",
        questions: [
          {
            id: "lg1q1",
            type: "mcq",
            prompt: "In an LCEL chain `prompt | model | parser`, the `|` operator chains components by:",
            options: [
              "passing each Runnable's output as the next Runnable's input (function composition)",
              "running all three components in parallel and merging results",
              "retrying the model until the parser succeeds",
              "concatenating their string outputs",
            ],
            answer: 0,
            explanation: "LCEL's pipe is function composition: prompt's output feeds model, whose output feeds parser. The composed chain is itself a Runnable.",
          },
          {
            id: "lg1q2",
            type: "short",
            prompt: "The message class that represents the chat model's own reply (and may contain tool calls) is the ____ Message.",
            accept: ["AI", "ai", "AIMessage", "aimessage"],
            explanation: "AIMessage is the model's response; it can carry tool calls that an agent then executes.",
          },
          {
            id: "lg1q3",
            type: "mcq",
            prompt: "The most reliable way to get typed, structured data out of a chat model is:",
            options: [
              "model.with_structured_output(Schema) — native constrained generation, validated",
              "instructing the model to 'respond only in JSON' and regex-parsing the text",
              "lowering the temperature to 0 and hoping for clean JSON",
              "asking the model to apologize if it makes a mistake",
            ],
            answer: 0,
            explanation: "with_structured_output uses the provider's tool-calling/JSON mode and validates against the schema — failing loudly and rarely, unlike fragile free-text parsing.",
          },
          {
            id: "lg1q4",
            type: "short",
            prompt: "Every LangChain component (models, prompts, parsers, retrievers) implements the same standard interface — invoke/batch/stream. What is that interface called? The ____ interface.",
            accept: ["Runnable", "runnable"],
            explanation: "The Runnable interface is the uniform protocol that makes LCEL composition work.",
          },
          {
            id: "lg1q5",
            type: "open",
            points: 3,
            prompt: "Design an LCEL pipeline that classifies an incoming support email into {billing, technical, other} with an urgency score, returning a typed object. Specify each component, and explain why LCEL (not LangGraph) is the right tool here.",
            rubric: [
              "Specifies a concrete pipeline: a ChatPromptTemplate (system instructions + the email as input) piped into a chat model with structured output (with_structured_output over a Pydantic/TypedDict schema with category + urgency).",
              "Uses native structured output (not free-text JSON parsing) and constrains the category (enum/Literal), with validation/retry reasoning.",
              "Justifies LCEL: the flow is a linear DAG (prompt → model → typed output) with no branching, loops, or shared state — exactly LCEL's domain.",
              "Notes what would push this to LangGraph instead (e.g. if the category had to route to different downstream handlers with loops/state).",
            ],
            solution:
              "Pipeline: `prompt | model.with_structured_output(Ticket)` where `Ticket` is a Pydantic model `category: Literal['billing','technical','other']` and `urgency: int (1–5)`, and `prompt = ChatPromptTemplate.from_messages([('system','Classify the support email...'),('human','{email}')])`. Invoking with `{email: ...}` returns a validated `Ticket` object. Use native structured output (not 'respond in JSON' + regex) so the category is constrained to the enum and validated; on a validation error, retry once at temperature 0, then fall back to category='other'. LCEL is right because the flow is a pure linear DAG — prompt → model → typed output — with no data-dependent branching, no loop, and no shared evolving state; that's exactly the closed-under-composition Runnable algebra LCEL is built for, and you get batching/streaming/async for free. It would become a LangGraph job only if, say, each category had to route to a different downstream subflow with its own tools and the system looped (classify → act → re-check) or carried shared state across steps.",
            explanation: "A prompt piped into a structured-output model is a linear DAG with a typed result — LCEL's sweet spot. Branching/loops/state would call for LangGraph.",
          },
          {
            id: "lg1q6",
            type: "open",
            points: 3,
            prompt: "Explain why composing Runnables with `|` yields another Runnable, and what concrete capabilities a composed chain inherits as a result. Then explain why a chat model being 'stateless' forces explicit state management in any multi-turn application.",
            rubric: [
              "States the closure property: the piped object delegates invoke/batch/stream (and async) to its stages, so it satisfies the Runnable interface and is itself a Runnable; notes composition is associative.",
              "Names concrete inherited capabilities (streaming, batching, async, parallelism, retries/fallbacks) and ties them to being defined once on the interface and propagated by closure.",
              "Explains statelessness: the model maps messages→message with no memory between calls, so 'memory' = re-sending accumulated history each turn.",
              "Draws the consequence: unbounded history growth → rising token cost and context-window overflow → the need for explicit state management (trim/summarize/persist), motivating LangGraph.",
            ],
            solution:
              "Composing with `|` yields a Runnable by **closure under composition**: the constructed pipe object implements the same standard interface by delegating — its invoke computes g.invoke(f.invoke(x)), its batch maps over inputs reusing each stage's batch, its stream pipes f's output into g, and its async methods await the underlying async forms. Satisfying the interface, it *is* a Runnable, and since function composition is associative, chains of any length and nesting are well-defined. Because the interface defines streaming, batching, async, parallelism, retries, and fallbacks once, a composed chain inherits all of them for free — that's the practical point of the algebra. Separately, a chat model is **stateless**: it is a pure map from a message list to a reply, retaining nothing between calls. So a multi-turn app only 'remembers' by re-sending the accumulated conversation each turn; nothing in the model persists it. That history grows without bound, so token cost and latency climb every turn and eventually the transcript overruns the context window, forcing messages to be dropped or summarized. Hence any real multi-turn system must manage state explicitly — trimming, summarizing, or persisting and selectively re-injecting history — which is precisely the role LangGraph's state, checkpointing, and memory play later in the course.",
            explanation: "Closure under composition makes chains Runnables (inheriting streaming/batch/async); statelessness makes memory the app's responsibility, motivating LangGraph's state/persistence.",
          },
        ],
      },
    },
    {
      "id": "lg2",
      "title": "Tools & Tool Calling",
      "summary": "Give the model hands: define tools, run the reason→act→observe loop, and see why that loop is a cycle LCEL can't express.",
      "prerequisites": [
        "lg1"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangChain docs — Tools & tool calling (@tool, bind_tools)",
        "LangChain docs — Agents and the tool-calling loop",
        "Yao et al. — ReAct: Synergizing Reasoning and Acting (2022)"
      ],
      "lessons": [
        {
          "id": "lg2l1",
          "title": "Defining Tools",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "A tool is a function the model can ask you to run",
              "body": "A chat model can only emit text — it cannot read a database, call an API, or do arithmetic reliably. A **tool** closes that gap: it is an ordinary function you expose to the model, with a name, a description, and a typed argument schema. Crucially, the model does **not execute** the tool — it *requests* a call (which function, which arguments), and *your application* executes it and returns the result. This separation is the whole basis of agents: the model decides *what* to do; your code decides *whether and how* to actually do it."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Tool",
              "statement": "A **tool** is a callable exposed to a model with three things the model can see: a **name**, a **description** (what it does / when to use it), and a **typed argument schema** (the parameters and their types). In LangChain the `@tool` decorator turns a Python function into a tool, deriving the schema from the type hints and the description from the docstring. The model never sees the function body — only this interface."
            },
            {
              "type": "code",
              "heading": "Defining a tool",
              "lang": "python",
              "code": "from langchain_core.tools import tool\n\n@tool\ndef get_weather(city: str) -> str:\n    \"\"\"Get the current weather for a city.\n\n    Args:\n        city: The city name, e.g. \"Paris\" or \"Tokyo\".\n    \"\"\"\n    return _weather_api(city)   # your real implementation\n\nprint(get_weather.name)         # \"get_weather\"\nprint(get_weather.description)  # the docstring — the model reads THIS\nprint(get_weather.args)         # {\"city\": {\"type\": \"string\", ...}}"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "The tool schema is the model's only interface",
              "statement": "The model chooses *whether* and *how* to call a tool based solely on its **name, description, and argument schema** — never the implementation. So those three are effectively *prompt*: a vague name or description, or an under-specified argument, leads the model to skip the tool, call it wrongly, or hallucinate arguments. Tool design is interface design *for an LLM consumer*."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**The docstring is a prompt — write it for the model.** \"get_weather: gets weather\" tells the model little; \"Get the *current* weather for a city; use when the user asks about present conditions, not forecasts; city must be a single city name\" tells it *when* and *how*. Under-described tools are the #1 cause of agents that ignore a perfectly good tool or call it with garbage arguments."
            },
            {
              "type": "example",
              "heading": "A well-described tool vs. a poor one",
              "body": "**Poor:** `@tool def search(q): \"\"\"search\"\"\"` — no types, no guidance; the model doesn't know what it searches, what `q` should be, or when to use it.\n**Good:** `@tool def search_docs(query: str) -> list[str]: \"\"\"Search the internal product documentation for passages relevant to a question. Use for questions about our product's features or APIs, not general knowledge. 'query' is a natural-language question.\"\"\"` — typed, scoped (\"internal docs\", \"not general knowledge\"), and tells the model exactly when to reach for it. The body is identical; the *interface* is what makes the agent work."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "When a chat model 'calls a tool,' what actually executes the function — the model or your application? Why does this separation matter for safety?",
                  "solution": "**Your application executes it**, not the model. The model only *requests* a call — it returns a structured request naming the tool and its arguments; your code decides whether to run it and then runs it. This separation matters for safety because it gives you a control point: you can validate the arguments, require human approval for dangerous tools (deletes, payments), rate-limit, sandbox, or refuse the call entirely — none of which would be possible if the model executed code directly. The model proposes; your code disposes."
                },
                {
                  "prompt": "An agent keeps ignoring a tool that would clearly help. The function works fine. What is the most likely cause, and how do you fix it?",
                  "solution": "The most likely cause is a **poor tool interface** — the name/description/argument schema, which is all the model sees. If the description is vague ('search: searches') or the args are untyped/unexplained, the model can't tell when or how to use it, so it skips it. Fix by treating the docstring as a prompt: give a precise name, a description stating *what it does and when to use it* (and when not to), and typed, documented arguments. The implementation is irrelevant to the model — improving the *interface* is what gets the tool used."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg2l1-i1",
              "front": "What is a tool, and who executes it?",
              "back": "A function exposed to the model with a name, description, and typed arg schema. The model REQUESTS a call (name + args); your application executes it — the model never runs the code."
            },
            {
              "id": "lg2l1-i2",
              "front": "What does @tool derive from the function?",
              "back": "Name (function name), description (docstring), and argument schema (type hints). The model sees only this interface, never the body."
            },
            {
              "id": "lg2l1-i3",
              "front": "Why is the tool description effectively a prompt?",
              "back": "The model decides whether/how to call a tool purely from its name, description, and arg schema — so vague descriptions cause skipped or mis-called tools. Tool design = LLM-facing interface design."
            },
            {
              "id": "lg2l1-i4",
              "front": "#1 cause of an agent ignoring a useful tool?",
              "back": "A poor interface (vague name/description, untyped/unexplained args). Fix the docstring and types, not the implementation."
            }
          ]
        },
        {
          "id": "lg2l2",
          "title": "Tool Calling & the Agent Loop",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Binding tools",
              "statement": "`model.bind_tools([...])` returns a model that knows about the tools — it advertises their schemas to the provider so the model *may* respond with tool calls. A response is then an `AIMessage` whose `.tool_calls` is a list of requested calls, each with a tool `name`, `args`, and an `id`. If `.tool_calls` is empty, the model answered directly; if not, it is asking you to run those tools."
            },
            {
              "type": "text",
              "heading": "The reason → act → observe loop",
              "body": "Tool use is inherently a **loop**, the **ReAct** pattern (Yao et al., 2022): the model **reasons** and emits tool calls (act); your code **executes** them and returns results (observe); you feed the results back and the model reasons again — until it produces a final answer with no tool calls. One round-trip is rarely enough: the model might search, read the result, then search again, then answer. This back-and-forth is the heartbeat of every agent."
            },
            {
              "type": "code",
              "heading": "The tool-calling loop, by hand",
              "lang": "python",
              "code": "from langchain_core.messages import HumanMessage, ToolMessage\n\ntools = {t.name: t for t in [get_weather, search_docs]}\nmodel_t = model.bind_tools(list(tools.values()))\n\nmessages = [HumanMessage(\"What's the weather in Paris?\")]\nwhile True:\n    ai = model_t.invoke(messages)      # reason\n    messages.append(ai)\n    if not ai.tool_calls:              # no calls -> final answer\n        break\n    for call in ai.tool_calls:         # act + observe\n        result = tools[call[\"name\"]].invoke(call[\"args\"])\n        messages.append(ToolMessage(result, tool_call_id=call[\"id\"]))\nprint(ai.content)"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The agent loop is a cycle — which is why it needs a graph",
              "statement": "The reason→act→observe loop contains a **back edge**: after executing tools you return to the model, possibly many times. A computation with a data-dependent back edge is a **cycle**, and LCEL — being a DAG of pure transforms (Unit 1) — cannot express it. Expressing the loop requires a stateful graph with a conditional edge that routes \"model → tools → model\" until a termination condition holds. That graph is exactly LangGraph.",
              "proof": "In LCEL, `a | b | c` is a directed *acyclic* pipeline: data flows forward through each stage once, and there is no construct to route output *back* to an earlier stage based on its content. The tool-calling loop, however, must decide *after* the model runs whether to (a) go to the tool-execution step and then *back* to the model, or (b) stop — a decision that depends on the model's output (`.tool_calls`). That \"back to the model\" transition is a cycle in the control-flow graph, and the (a)/(b) decision is a conditional branch on state. Neither a cycle nor a data-dependent branch exists in a DAG, so LCEL cannot represent the loop; you must hand-roll a `while` loop (as above) or use a framework whose computational model *is* a graph with cycles and conditional edges. ∎\n\nThe hand-rolled `while` loop works but quietly reinvents what a graph gives you: persistence across steps, streaming of intermediate steps, a recursion limit, parallel tool execution, and resumability. That reinvention is LangGraph's reason to exist (Unit 4)."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 250,
              "caption": "The tool-calling agent loop as a graph. The model node either requests tool calls (→ tools, which execute and feed ToolMessages back — the cycle) or returns a final answer (→ END). This reason→act→observe cycle is exactly what an LCEL DAG cannot express and what LangGraph's StateGraph (Unit 4) is built for.",
              "nodes": [
                {
                  "id": "start",
                  "label": "START",
                  "x": 8,
                  "y": 50,
                  "tone": "muted"
                },
                {
                  "id": "model",
                  "label": "model",
                  "x": 38,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "tools",
                  "label": "tools",
                  "x": 75,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "end",
                  "label": "END",
                  "x": 38,
                  "y": 90,
                  "tone": "muted"
                }
              ],
              "edges": [
                {
                  "from": "start",
                  "to": "model"
                },
                {
                  "from": "model",
                  "to": "tools",
                  "label": "tool_calls",
                  "tone": "sage"
                },
                {
                  "from": "tools",
                  "to": "model",
                  "label": "ToolMessages",
                  "tone": "sage"
                },
                {
                  "from": "model",
                  "to": "end",
                  "label": "no tool_calls",
                  "tone": "gold"
                }
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Hand-rolling the loop is where bugs live.** A raw `while True` has no step limit (a confused model can loop forever), runs tools serially, loses all state if the process dies mid-loop, and can't stream progress or pause for human approval. These are exactly the concerns LangGraph (and the prebuilt `create_react_agent`, Unit 7) handle — which is why you graduate from the manual loop to a graph."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Walk through the tool-calling loop: starting from a user question, what are the steps and what message types are appended at each, until a final answer?",
                  "solution": "Start: messages = [HumanMessage(question)]. (1) **Reason** — invoke the tool-bound model; it returns an **AIMessage**, appended to messages. (2) Check `.tool_calls`: if empty, that AIMessage is the final answer — stop. (3) If non-empty, **act + observe** — for each requested call, execute the named tool with its args and append a **ToolMessage** (carrying the result, keyed by tool_call_id) for each. (4) **Loop** — invoke the model again with the extended history; it now sees the tool results and either calls more tools (back to step 3) or answers (step 2). The message sequence grows Human → AI(tool_calls) → Tool(s) → AI(tool_calls) → Tool(s) → … → AI(final). The cycle is the AI↔Tool back-and-forth."
                },
                {
                  "prompt": "Why can't the tool-calling loop be written as an LCEL chain (prompt | model | ...)? Name two things a graph gives you that the hand-rolled while-loop doesn't.",
                  "solution": "Because the loop is a **cycle with a data-dependent branch**: after the model runs, you must decide — based on whether it emitted `.tool_calls` — to execute tools and go *back* to the model, or to stop. LCEL is a directed *acyclic* pipeline of pure transforms; it has no back edge and no conditional routing on output, so it cannot express the loop. A graph framework (LangGraph) gives you, beyond the bare while-loop: (1) a **recursion/step limit** so a confused model can't loop forever; (2) **persistence/checkpointing** so the loop survives a crash and can resume — plus streaming of intermediate steps, parallel tool execution, and pause-for-human-approval. The while-loop reinvents these poorly; the graph provides them."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg2l2-i1",
              "front": "What does model.bind_tools([...]) do?",
              "back": "Returns a model that advertises the tools' schemas to the provider, so its response (an AIMessage) may include .tool_calls (name, args, id) requesting executions."
            },
            {
              "id": "lg2l2-i2",
              "front": "The reason→act→observe (ReAct) loop?",
              "back": "Model reasons + emits tool calls (act); your code executes them, returns results as ToolMessages (observe); feed back; repeat until the model answers with no tool calls."
            },
            {
              "id": "lg2l2-i3",
              "front": "Why can't LCEL express the agent loop?",
              "back": "The loop has a back edge (tools → model) and a data-dependent branch (tool_calls?) — a cycle. LCEL is a DAG of pure transforms with no cycles or content-based routing. Needs a stateful graph."
            },
            {
              "id": "lg2l2-i4",
              "front": "What does a graph give over a hand-rolled while-loop?",
              "back": "Recursion/step limit, persistence/checkpointing (resume after crash), streaming of steps, parallel tool execution, and pause-for-human-approval — the reasons to use LangGraph."
            }
          ]
        },
        {
          "id": "lg2l3",
          "title": "Reliability: Errors, Validation & Runaway Loops",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Tools fail — decide how",
              "body": "A tool calls the real world, so it can fail: a timeout, a 404, bad arguments from the model. You have a design choice. **Return the error to the model** (as a ToolMessage describing what went wrong) and let it adapt — retry with different arguments, try another tool, or apologize — which makes the agent robust and self-correcting. Or **raise** and abort, for failures the model can't recover from. The default in LangGraph's tool node is to catch the error and feed it back, because an agent that can *see* its failures can often route around them."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Argument validation",
              "statement": "Tool arguments come from the model and may be wrong — out of range, malformed, or hallucinated. Because tools have a **typed schema** (from the function's type hints / a Pydantic model), arguments are validated against it before execution, and a validation failure becomes a recoverable error returned to the model rather than a crash. Validation at the tool boundary is the agent's equivalent of input validation at a trust boundary (cloud Unit 9's \"never trust input\")."
            },
            {
              "type": "text",
              "heading": "Parallel tool calls",
              "body": "In one turn a model may request **several** tool calls at once (e.g. \"get the weather in Paris *and* Tokyo\"). Because those calls are independent, they should be executed **in parallel**, not serially — the latency of the act step is then the *max* of the calls, not the sum (cloud Unit 7's parallel-vs-serial latency). The framework collects all the results as ToolMessages before the next model turn. Designing tools to be independent and side-effect-safe lets this parallelism be exploited."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Runaway loops and the step limit",
              "statement": "Because the agent loop is a cycle (lg2l2), it can fail to terminate: a confused model may call tools forever, or two states may alternate. Termination is therefore *not* guaranteed by the model and must be *imposed* — by a hard **recursion/step limit** (LangGraph's `recursion_limit`) that caps the number of super-steps, plus loop-detection or a max-tool-calls budget. This is the agent analogue of proving a loop terminates with a decreasing measure (algorithms Unit 1): since the model won't supply the measure, you bound the iteration count externally.",
              "proof": "The loop continues whenever the model emits tool calls and stops only when it emits none — a decision the (stochastic, fallible) model controls. There is no guarantee the model ever stops: it can repeat a failing call, oscillate between two tool calls, or chase its own outputs indefinitely. Since no internal decreasing measure is guaranteed (unlike a hand-written loop with a counter), termination must be enforced from outside: cap the number of iterations (super-steps) at a recursion limit, so the run *always* halts — either with an answer or with a 'limit exceeded' that you handle (return a partial result, escalate to a human). Bounding the iteration count converts a possibly-non-terminating cycle into a guaranteed-terminating one, trading completeness for the certainty of halting. ∎"
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Every tool is attack surface and a way to loop forever — gate both.** Validate arguments against the schema; set a recursion/step limit so the loop always halts; and require human approval (Unit 6's interrupts) before any *irreversible* tool (delete, pay, email). An agent with an un-capped loop and an unguarded \"delete database\" tool is one hallucinated tool call from disaster."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A tool call fails (the API timed out). Compare returning the error to the model versus raising, and say which is usually the default and why.",
                  "solution": "**Returning the error to the model** (as a ToolMessage describing the failure) lets the agent *see* and adapt — retry with backoff, try a different tool, or tell the user it couldn't fetch the data; this makes the agent robust and self-correcting, and is usually the **default** (e.g. LangGraph's tool node catches and feeds back). **Raising** aborts the whole run, appropriate only when the failure is unrecoverable or must stop execution (e.g. an auth failure, or a guardrail trip). Default to feeding errors back because an agent that can observe its failures can often route around them; raise only when there's nothing the model could usefully do."
                },
                {
                  "prompt": "The agent loop is a cycle. Why isn't termination guaranteed, and how do you guarantee the run always halts?",
                  "solution": "Termination depends on the model emitting *no* tool calls, but the model is stochastic and fallible — it can repeat a failing call, oscillate between two tool calls, or keep chasing its outputs, so there's no guaranteed internal decreasing measure that forces it to stop (unlike a counter-driven loop). You guarantee halting by **imposing a bound externally**: a hard recursion/step limit (e.g. LangGraph's `recursion_limit`) caps the number of super-steps so the run always ends — either with a final answer or with a 'limit exceeded' you handle (return partial results, escalate to a human). Optionally add loop/duplicate-call detection. This is the agent version of bounding a loop with an external measure to force termination (algorithms Unit 1)."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg2l3-i1",
              "front": "Two ways to handle a tool failure, and the usual default?",
              "back": "Return the error to the model (as a ToolMessage) so it can adapt — the usual default, making the agent self-correcting; or raise/abort for unrecoverable failures. Default: feed errors back."
            },
            {
              "id": "lg2l3-i2",
              "front": "Why validate tool arguments?",
              "back": "Args come from the (fallible) model and may be wrong/hallucinated. The typed schema validates them before execution, turning bad args into a recoverable error, not a crash — input validation at a trust boundary."
            },
            {
              "id": "lg2l3-i3",
              "front": "Why execute parallel tool calls concurrently?",
              "back": "A model can request several independent calls in one turn; running them in parallel makes the act-step latency the MAX of the calls, not the sum (parallel vs serial latency)."
            },
            {
              "id": "lg2l3-i4",
              "front": "Why isn't agent-loop termination guaranteed, and the fix?",
              "back": "Stopping depends on the stochastic model emitting no tool calls — it can loop forever. Impose a hard recursion/step limit (recursion_limit) so the run always halts; handle 'limit exceeded'."
            },
            {
              "id": "lg2l3-i5",
              "front": "Two guardrails every tool-using agent needs?",
              "back": "A recursion/step limit (always halt) and human approval before irreversible tools (delete/pay/email), plus argument validation. Tools are attack surface + a way to loop forever."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg2-check",
        "questions": [
          {
            "id": "lg2q1",
            "type": "mcq",
            "prompt": "When a chat model 'calls a tool,' what actually happens?",
            "options": [
              "The model returns an AIMessage requesting the call (tool name + args); your application executes the tool and returns a ToolMessage",
              "The model executes the Python function itself and returns its output",
              "The tool runs automatically inside the provider's servers with no app involvement",
              "The model rewrites the function and runs the new version"
            ],
            "answer": 0,
            "explanation": "The model only REQUESTS a call (name + args in .tool_calls); your application executes the tool and feeds the result back as a ToolMessage. This separation is the agent's control point."
          },
          {
            "id": "lg2q2",
            "type": "short",
            "prompt": "The message type that carries a tool's execution result back to the model (keyed by tool_call_id) is the ____ Message.",
            "accept": [
              "Tool",
              "tool",
              "ToolMessage",
              "toolmessage"
            ],
            "explanation": "A ToolMessage holds the result of running a tool the model requested, returned to the model so it can reason on it."
          },
          {
            "id": "lg2q3",
            "type": "mcq",
            "prompt": "What most determines whether a model uses a tool correctly?",
            "options": [
              "the tool's name, description, and typed argument schema (its interface) — the model never sees the body",
              "the speed of the tool's implementation",
              "the model's temperature setting",
              "the number of other tools available"
            ],
            "answer": 0,
            "explanation": "The model chooses whether/how to call a tool solely from its name, description, and arg schema. Those are effectively prompt — tool design is LLM-facing interface design."
          },
          {
            "id": "lg2q4",
            "type": "short",
            "prompt": "In graph terms, the reason→act→observe agent loop (model → tools → model → …) is a ____ — which LCEL's DAG cannot express. (one word)",
            "accept": [
              "cycle",
              "loop",
              "Cycle",
              "Loop"
            ],
            "explanation": "The back edge tools→model plus the data-dependent branch (tool_calls?) make it a cycle; LCEL is acyclic, so the loop needs a stateful graph (LangGraph)."
          },
          {
            "id": "lg2q5",
            "type": "open",
            "points": 3,
            "prompt": "Design a tool-using assistant that can answer questions needing current weather and arithmetic (e.g. 'Is it warmer in Paris or Tokyo, and by how many degrees?'). Specify the tools (interfaces), the loop, and how you guarantee it terminates and handles tool failures.",
            "rubric": [
              "Defines concrete tools with good interfaces: e.g. get_weather(city: str) and a calculator/compute tool, each with a clear description and typed args; notes the description is what drives correct use.",
              "Describes the reason→act→observe loop: bind tools, model emits tool_calls (possibly parallel — both cities at once), execute, return ToolMessages, repeat until a final answer with no tool calls.",
              "Guarantees termination with a recursion/step limit (the loop is a cycle; the stochastic model won't guarantee halting) and handles the 'limit exceeded' case.",
              "Handles tool failures by returning errors to the model so it can adapt (retry/alternate), and validates arguments against the schema; notes parallel execution for the two independent weather calls."
            ],
            "solution": "Tools: `get_weather(city: str) -> str` ('Get current weather (incl. temperature in °C) for a single city; use for present conditions') and `compute(expression: str) -> float` ('Evaluate an arithmetic expression') — both with precise descriptions and typed args, since the interface is what the model reads. Loop: bind both tools; on 'warmer in Paris or Tokyo and by how much?', the model emits two parallel get_weather calls (independent → execute concurrently, latency = max not sum), we return two ToolMessages, the model then emits a compute call on the difference, we return its result, and the model produces the final answer with no tool calls — the reason→act→observe cycle. Termination: because this is a cycle and the model is stochastic, impose a hard recursion/step limit (e.g. recursion_limit) so the run always halts; on 'limit exceeded', return a partial answer or escalate. Failures: run tools in a try/except and return the error as a ToolMessage (timeout/404) so the model can retry or apologize rather than crashing; validate args against the schema (e.g. city is a non-empty string) and feed validation errors back too. Dangerous/irreversible tools would additionally require human approval — not needed here since both tools are read-only.",
            "explanation": "Two well-described tools, a reason→act→observe loop with parallel independent calls, a recursion limit to force termination, and errors fed back to the model for self-correction."
          },
          {
            "id": "lg2q6",
            "type": "open",
            "points": 3,
            "prompt": "Explain why the tool-calling loop cannot be written as an LCEL chain, and what concrete capabilities you gain by expressing it as a LangGraph graph instead of a hand-rolled while-loop.",
            "rubric": [
              "Identifies the loop as a cycle with a data-dependent branch: after the model runs you route back to tools then to the model, or stop, based on .tool_calls — a back edge + conditional, neither of which a DAG has.",
              "States that LCEL is a directed ACYCLIC pipeline of pure transforms, so it has no back edge and no content-based routing — it structurally cannot express the loop.",
              "Names capabilities a graph provides over a bare while-loop: persistence/checkpointing (resume after crash), a recursion/step limit (guaranteed termination), streaming of intermediate steps, parallel tool execution, pause-for-human-approval.",
              "Connects to the broader point: the graph's value is managing state, control flow, and durability around the loop — which is LangGraph's reason to exist."
            ],
            "solution": "The tool-calling loop is a **cycle with a data-dependent branch**: after the model runs, the system must decide — based on whether the AIMessage contains `.tool_calls` — to execute tools and route *back* to the model (a back edge), or to stop. LCEL composes Runnables into a directed **acyclic** pipeline of pure transforms (Unit 1): data flows forward once, with no construct to route output back to an earlier stage or to branch on that output. So LCEL structurally cannot represent the loop — you must either hand-roll a `while` loop or use a graph whose model *is* cyclic with conditional edges. A hand-rolled while-loop technically works but reinvents, poorly, what LangGraph provides: **persistence/checkpointing** (the loop's state is saved each step, so a crash can resume rather than restart), a **recursion/step limit** (guaranteed termination of the cycle), **streaming** of intermediate steps (tool calls/results) to the UI, **parallel** execution of independent tool calls, and **pause-for-human-approval** before risky actions. The deeper point: the hard part of an agent isn't calling the model — it's managing the *state, control flow, and durability* around the loop, which is exactly what a graph framework exists to do.",
            "explanation": "The loop is a cycle + conditional (impossible in an acyclic LCEL pipeline); a graph adds persistence, a step limit, streaming, parallelism, and human-in-the-loop around it."
          }
        ]
      }
    },
    {
      "id": "lg3",
      "title": "Retrieval-Augmented Generation (RAG)",
      "summary": "Ground the model in your data: embeddings and the cosine-similarity math, chunking trade-offs, retrieval strategies, and the RAG chain.",
      "prerequisites": [
        "lg1"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangChain docs — Semantic search / retrievers & vector stores",
        "Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP (2020)"
      ],
      "lessons": [
        {
          "id": "lg3l1",
          "title": "Why RAG: Grounding LLMs in Data",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "The knowledge problem",
              "body": "An LLM knows only what was in its training data — which is **stale** (frozen at a cutoff), **generic** (none of your private/internal documents), and **lossy** (it compresses the web into weights and confidently *hallucinates* specifics it never memorized). You can't retrain the model for every question. **Retrieval-Augmented Generation (RAG)** sidesteps all three: instead of relying on the model's parametric memory, you *retrieve* relevant documents at query time and *put them in the prompt*, so the model answers from evidence you supplied — current, private, and citable."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Retrieval-Augmented Generation (RAG)",
              "statement": "**RAG** (Lewis et al., 2020) augments generation with a retrieval step: given a query, fetch the most relevant documents from an external knowledge store and include them in the model's context, so the answer is grounded in retrieved evidence rather than the model's weights. It separates **knowledge** (in an updatable store) from **reasoning** (in the model) — you update the store without retraining, and the model cites what it was given."
            },
            {
              "type": "text",
              "heading": "The two-phase pipeline",
              "body": "RAG has an **offline indexing** phase and an **online query** phase. *Indexing* (once, and on updates): **load** documents → **split** them into chunks → **embed** each chunk into a vector → **store** the vectors in a vector database. *Query* (per request): **embed** the question → **retrieve** the top-k most similar chunks → **stuff** them into the prompt → **generate** an answer grounded in them. The first phase builds the searchable index; the second turns a question into grounded context and an answer."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 250,
              "caption": "The RAG query pipeline. The question is embedded and used to retrieve the top-k most similar chunks from the vector store; those chunks are formatted into the prompt alongside the question, and the model generates a grounded answer. Indexing (load → split → embed → store) happens offline beforehand.",
              "nodes": [
                {
                  "id": "q",
                  "label": "question",
                  "x": 6,
                  "y": 50
                },
                {
                  "id": "ret",
                  "label": "retriever",
                  "x": 32,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "vs",
                  "label": "vectors",
                  "x": 32,
                  "y": 14,
                  "tone": "muted"
                },
                {
                  "id": "prompt",
                  "label": "prompt",
                  "x": 62,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "model",
                  "label": "model",
                  "x": 88,
                  "y": 50,
                  "tone": "gold"
                }
              ],
              "edges": [
                {
                  "from": "q",
                  "to": "ret",
                  "label": "embed"
                },
                {
                  "from": "vs",
                  "to": "ret",
                  "label": "top-k",
                  "tone": "sage",
                  "dashed": true
                },
                {
                  "from": "ret",
                  "to": "prompt",
                  "label": "chunks",
                  "tone": "sage"
                },
                {
                  "from": "q",
                  "to": "prompt",
                  "label": "question",
                  "tone": "muted"
                },
                {
                  "from": "prompt",
                  "to": "model",
                  "label": "grounded",
                  "tone": "gold"
                }
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**RAG reduces hallucination — it does not eliminate it.** The model can still ignore the retrieved context, misread it, or blend it with its (wrong) parametric memory; and if retrieval surfaces the *wrong* chunks, the model confidently answers from bad evidence. Ground the prompt (\"answer only from the context; say 'I don't know' if it's not there\"), and verify — RAG moves the failure from the model to the *retrieval*, which you must then make good (Lesson 3)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "RAG works by doing what — and why is that better than fine-tuning the model on your documents for a knowledge base that changes daily?",
                  "solution": "RAG **retrieves relevant documents at query time and injects them into the model's prompt context**, so the model answers from supplied evidence rather than its weights. For a daily-changing knowledge base this beats fine-tuning because: knowledge lives in an **updatable store** (add/edit/delete a document instantly; no retraining), it's **current** (retrieval sees the latest docs), it's **citable** (you know which chunks grounded the answer), and it's **cheaper** (no training run per update). Fine-tuning bakes knowledge into weights — stale the moment data changes, expensive to redo, and hard to attribute or update granularly. RAG separates updatable knowledge from fixed reasoning."
                },
                {
                  "prompt": "Name the offline indexing steps and the online query steps of a RAG pipeline.",
                  "solution": "**Offline indexing** (once + on updates): load documents → split into chunks → embed each chunk into a vector → store the vectors in a vector store. **Online query** (per request): embed the question → retrieve the top-k most similar chunks from the store → stuff those chunks into the prompt alongside the question → generate an answer grounded in them. Indexing builds the searchable vector index; query turns a question into retrieved context + a grounded answer."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg3l1-i1",
              "front": "What problem does RAG solve?",
              "back": "LLM knowledge is stale, generic (no private data), and hallucination-prone. RAG retrieves relevant docs at query time and injects them into the prompt, grounding answers in supplied evidence."
            },
            {
              "id": "lg3l1-i2",
              "front": "RAG's two phases?",
              "back": "Offline indexing: load → split → embed → store. Online query: embed question → retrieve top-k → stuff into prompt → generate grounded answer."
            },
            {
              "id": "lg3l1-i3",
              "front": "RAG vs fine-tuning for changing knowledge?",
              "back": "RAG keeps knowledge in an updatable store (instant updates, current, citable, cheap); fine-tuning bakes it into weights (stale on change, expensive, hard to attribute). RAG separates knowledge from reasoning."
            },
            {
              "id": "lg3l1-i4",
              "front": "Does RAG eliminate hallucination?",
              "back": "No — it reduces it but the model can ignore/misread context, and wrong retrieval → confident wrong answers. Ground the prompt ('answer only from context') and fix retrieval quality."
            }
          ]
        },
        {
          "id": "lg3l2",
          "title": "Embeddings & Vector Search",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Embedding",
              "statement": "An **embedding** is a function mapping a piece of text to a fixed-length vector of floats (e.g. 1536 dimensions) such that **semantically similar texts map to nearby vectors**. The geometry encodes meaning: \"car\" and \"automobile\" land close together, \"car\" and \"banana\" far apart — regardless of shared words. Embeddings turn the fuzzy problem of \"find passages *about* this\" into the precise problem of \"find nearby vectors.\""
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Cosine similarity is the retrieval metric",
              "statement": "Semantic closeness between vectors a and b is measured by **cosine similarity**\n\n  sim(a, b) = (a · b) / (‖a‖ ‖b‖) = cos θ ∈ [−1, 1],\n\nthe cosine of the angle between them: 1 = identical direction, 0 = orthogonal/unrelated, −1 = opposite. Retrieval is then a **k-nearest-neighbour** search: embed the query and return the k stored chunk-vectors with the highest cosine similarity.",
              "proof": "By definition of the dot product, a · b = ‖a‖‖b‖cos θ, so cos θ = (a·b)/(‖a‖‖b‖). This depends only on the *angle* between the vectors, not their magnitudes — which is what we want, because embedding models encode meaning in the *direction* of the vector, not its length (a longer passage isn't 'more' of a meaning). Normalizing vectors to unit length makes cosine similarity equal to the plain dot product and a monotonic function of (negative) squared Euclidean distance, so 'highest cosine similarity' and 'nearest neighbour' coincide. Retrieval embeds the query into the same space and returns the k chunk-vectors of largest cosine similarity. ∎\n\n**Worked:** a = [1, 0, 1], b = [1, 1, 0]: a·b = 1·1 + 0·1 + 1·0 = 1; ‖a‖ = ‖b‖ = √2; sim = 1/(√2·√2) = 1/2 = 0.5 — the vectors are 60° apart, moderately related."
            },
            {
              "type": "code",
              "heading": "Embed, store, and retrieve",
              "lang": "python",
              "code": "from langchain_openai import OpenAIEmbeddings\nfrom langchain_core.vectorstores import InMemoryVectorStore\n\nembeddings = OpenAIEmbeddings()                       # text -> vector\nstore = InMemoryVectorStore(embeddings)               # any vector DB: Chroma, FAISS, ...\nstore.add_texts(chunks)                               # embed + index the chunks\n\nretriever = store.as_retriever(search_type=\"similarity\", search_kwargs={\"k\": 4})\ndocs = retriever.invoke(\"How do I reset my password?\") # top-4 by cosine similarity\n# A retriever is a Runnable -> it composes in an LCEL chain (Lesson 3)."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Vector store & retriever",
              "statement": "A **vector store** (Chroma, FAISS, Qdrant, pgvector, …) stores embedded chunks and performs fast approximate nearest-neighbour search. A **retriever** wraps it as a **Runnable** (so it composes in LCEL chains) exposing `search_type`: **\"similarity\"** (top-k by cosine — the default), **\"mmr\"** (maximal marginal relevance — relevance *and* diversity), and **\"similarity_score_threshold\"** (only results above a score). `k` controls how many chunks come back."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Retrieval quality bounds answer quality — garbage in, garbage out.** The model can only be as good as the chunks you retrieve; if the right passage isn't in the top-k, the model can't use it and will fall back on (possibly wrong) parametric memory. So retrieval is the part to measure and tune: the embedding model, the chunking (Lesson 3), and k all decide whether the answer-bearing passage is even *present* in the context."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Compute the cosine similarity of a = [1, 0, 1] and b = [1, 1, 0]. What does the value tell you, and why is cosine (angle) used instead of Euclidean distance?",
                  "solution": "sim = (a·b)/(‖a‖‖b‖). a·b = 1·1 + 0·1 + 1·0 = 1; ‖a‖ = √(1+0+1) = √2, ‖b‖ = √(1+1+0) = √2; sim = 1/(√2·√2) = 1/2 = **0.5**. That means the vectors are 60° apart — moderately similar (1 would be identical direction, 0 unrelated). Cosine (angle) is used because embedding models encode meaning in the *direction* of the vector, not its magnitude — a longer document isn't 'more' of a meaning — so the angle is the right measure; on unit-normalized vectors cosine similarity also coincides with nearest-neighbour by Euclidean distance, so the two agree."
                },
                {
                  "prompt": "Your RAG answers are vague and miss specifics that you know are in the documents. Before touching the prompt or model, what part of the system should you investigate, and what two knobs most affect it?",
                  "solution": "Investigate **retrieval** — if the answer-bearing chunk isn't in the top-k, the model never sees it, so no prompt/model change can help. The two knobs that most affect whether the right passage is retrieved: (1) **chunking** (chunk size/overlap and splitting strategy — too-large chunks dilute relevance, too-small lose context; Lesson 3), and (2) the **embedding model + k** (a better embedding places relevant chunks nearer the query; a larger k widens the net at the cost of more/noisier context). Measure retrieval directly (e.g. recall@k: is the gold passage in the top-k?) before blaming generation."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg3l2-i1",
              "front": "What is an embedding?",
              "back": "A function mapping text → a fixed-length vector so that semantically similar texts map to nearby vectors. Geometry encodes meaning; turns 'find passages about X' into 'find nearby vectors'."
            },
            {
              "id": "lg3l2-i2",
              "front": "Cosine similarity formula and range?",
              "back": "sim(a,b) = (a·b)/(‖a‖‖b‖) = cos θ ∈ [−1,1]: 1 identical direction, 0 unrelated, −1 opposite. Retrieval = k-NN by highest cosine similarity to the query vector."
            },
            {
              "id": "lg3l2-i3",
              "front": "Why cosine (angle), not magnitude?",
              "back": "Embedding models encode meaning in vector DIRECTION, not length; the angle is the right measure. On unit-normalized vectors, cosine similarity coincides with Euclidean nearest-neighbour."
            },
            {
              "id": "lg3l2-i4",
              "front": "Vector store + retriever, and the search types?",
              "back": "Store: embedded chunks + fast ANN search (Chroma/FAISS/…). Retriever: a Runnable over it with search_type 'similarity' (top-k cosine, default), 'mmr' (relevance + diversity), 'similarity_score_threshold'."
            },
            {
              "id": "lg3l2-i5",
              "front": "Why is retrieval the thing to measure?",
              "back": "The model can only be as good as the retrieved chunks; if the answer passage isn't in top-k, the model can't use it. Embedding, chunking, and k decide whether it's even present."
            }
          ]
        },
        {
          "id": "lg3l3",
          "title": "Chunking, Retrieval Strategies & the RAG Chain",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Chunking",
              "statement": "**Chunking** splits documents into the units you embed and retrieve. The default `RecursiveCharacterTextSplitter(chunk_size, chunk_overlap)` tries to split on the largest natural boundary first (paragraph → line → sentence → word), keeping semantically coherent pieces, and overlaps consecutive chunks by `chunk_overlap` characters so context isn't severed at a boundary. Chunk size and overlap are among the highest-leverage RAG parameters."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The chunking trade-off",
              "statement": "Chunk size trades **retrieval precision** against **context completeness**. Chunks too *large* dilute the embedding (one vector averages many topics, so the relevant sentence is buried and matches weakly) and waste context-window budget; chunks too *small* match sharply but sever the surrounding context the answer needs. **Overlap** mitigates boundary loss at the cost of duplication. There is no universal optimum — it depends on document structure and query type, and must be tuned by measuring retrieval.",
              "proof": "An embedding is a single vector summarizing a whole chunk, so its direction is an average over the chunk's content. A large chunk covering several topics has a vector pulled toward their average — the specific answer-bearing sentence contributes little, so the chunk's cosine similarity to a pointed query is *diluted* and it may fall out of the top-k; and once retrieved, a large chunk consumes more of the finite context window (fewer chunks fit). A very small chunk embeds sharply (one idea, one direction) and ranks well for a matching query, but may omit the surrounding sentences needed to actually answer (a pronoun's referent, the preceding condition). Overlap re-includes boundary context in both neighbours, reducing severed-context misses, but stores each overlapped span twice. Since precision (favoring small) and completeness (favoring large) pull oppositely and the balance depends on the data, the parameters are tuned empirically against a retrieval metric (e.g. recall@k). ∎"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Retrieval strategies: MMR, threshold, hybrid",
              "statement": "Beyond plain top-k similarity: **MMR** (maximal marginal relevance) re-ranks to balance relevance with **diversity**, avoiding k near-duplicate chunks that waste context. **Score threshold** returns only results above a similarity cutoff (better to return *few or none* than forced junk). **Hybrid search** combines dense vector retrieval with sparse keyword (**BM25**) retrieval — catching exact terms/IDs that embeddings blur — and fuses the two rankings with **Reciprocal Rank Fusion**: score(d) = Σᵢ 1/(K + rankᵢ(d)), summing reciprocal ranks across retrievers (K ≈ 60 damps low ranks), so each method contributes without needing comparable score scales."
            },
            {
              "type": "code",
              "heading": "The RAG chain (LCEL)",
              "lang": "python",
              "code": "from langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_core.output_parsers import StrOutputParser\n\nprompt = ChatPromptTemplate.from_messages([\n    (\"system\", \"Answer ONLY from the context. If it's not there, say you don't know.\\n\\n{context}\"),\n    (\"human\", \"{question}\"),\n])\n\ndef format_docs(docs): return \"\\n\\n\".join(d.page_content for d in docs)\n\nrag_chain = (\n    {\"context\": retriever | format_docs, \"question\": RunnablePassthrough()}\n    | prompt | model | StrOutputParser()\n)\nrag_chain.invoke(\"How do I reset my password?\")  # retrieves, grounds, answers"
            },
            {
              "type": "text",
              "heading": "Where RAG fails",
              "body": "Most RAG failures are **retrieval** failures, not generation failures. The answer-bearing chunk may never be retrieved (bad chunking, weak embedding, wrong query phrasing); retrieved context may be **diluted** by irrelevant chunks; the model may suffer **lost-in-the-middle** (ignoring evidence buried in a long context); or it may **override** the context with confident parametric memory. The discipline is to *measure retrieval separately from generation* — e.g. recall@k (is the gold passage in the top-k?) — so you fix the actual broken stage instead of fiddling with the prompt."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**When RAG is wrong, suspect retrieval first.** Check whether the answer-bearing passage was even in the retrieved top-k *before* blaming the model or the prompt. If it wasn't, no amount of prompt-tuning helps — fix chunking, the embedding model, k, or add hybrid/MMR. Measure retrieval (recall@k) and generation (faithfulness to context) as *separate* metrics."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "To preserve context across chunk boundaries, splitters overlap consecutive chunks. What is this parameter called, and explain the precision-vs-completeness trade-off of chunk size.",
                  "solution": "It's the **chunk overlap** (e.g. `chunk_overlap=200`) — consecutive chunks share that many characters so a sentence/idea split at a boundary still appears whole in one chunk. Chunk-size trade-off: **large** chunks embed as an average over many topics, so the relevant sentence is diluted and ranks weakly (worse precision), and each consumes more context-window budget; **small** chunks embed sharply and rank well (better precision) but may omit surrounding context the answer needs (worse completeness). Overlap reduces boundary loss at the cost of duplication. There's no universal optimum — tune size/overlap against a retrieval metric (recall@k) for your documents and queries."
                },
                {
                  "prompt": "A RAG system confidently gives a wrong answer. Describe how you'd diagnose whether the failure is in retrieval or generation, and give one fix for each case.",
                  "solution": "Diagnose by **inspecting the retrieved chunks for that query**: check whether the answer-bearing passage is present in the top-k (recall@k). **If it's absent → retrieval failure**: the model never saw the evidence. Fixes: improve chunking (size/overlap), use a better embedding model, raise k, or add MMR/hybrid (BM25 + RRF) to catch exact terms — anything that gets the right passage into the top-k. **If the passage IS in the retrieved context but the answer is still wrong → generation failure**: the model ignored, misread, or overrode it (lost-in-the-middle, or trusting parametric memory). Fixes: ground the prompt ('answer ONLY from the context; say you don't know otherwise'), reduce/reorder context (put key chunks first/last), or lower temperature. The key is to measure retrieval and generation **separately** so you fix the actually-broken stage rather than blindly tuning the prompt."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg3l3-i1",
              "front": "What does RecursiveCharacterTextSplitter do?",
              "back": "Splits on the largest natural boundary first (paragraph→line→sentence→word) for coherent chunks, with chunk_overlap characters shared between neighbours so context isn't severed at boundaries."
            },
            {
              "id": "lg3l3-i2",
              "front": "The chunk-size trade-off?",
              "back": "Large chunks dilute the embedding (relevant sentence buried, weak match) + waste context; small chunks match sharply but lose surrounding context. Overlap mitigates boundary loss (with duplication). Tune empirically."
            },
            {
              "id": "lg3l3-i3",
              "front": "MMR, threshold, and hybrid retrieval?",
              "back": "MMR: relevance + diversity (avoid near-duplicates). Threshold: only above a score. Hybrid: dense vectors + sparse BM25 keyword, fused by Reciprocal Rank Fusion score(d)=Σ 1/(K+rankᵢ(d))."
            },
            {
              "id": "lg3l3-i4",
              "front": "Most RAG failures are ____ failures?",
              "back": "Retrieval failures (answer chunk never retrieved / diluted), not generation. Measure retrieval (recall@k) separately; check the retrieved chunks before blaming the prompt or model."
            },
            {
              "id": "lg3l3-i5",
              "front": "Why ground the RAG prompt explicitly?",
              "back": "So the model answers from the retrieved context, not parametric memory: 'answer ONLY from the context; say you don't know if absent.' Reduces (not eliminates) hallucination + override."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg3-check",
        "questions": [
          {
            "id": "lg3q1",
            "type": "numeric",
            "prompt": "Compute the cosine similarity of the vectors a = [1, 0, 1] and b = [1, 1, 0]. (Give a decimal.)",
            "answer": 0.5,
            "tolerance": 0.01,
            "explanation": "a·b = 1; ‖a‖ = ‖b‖ = √2; sim = 1/(√2·√2) = 1/2 = 0.5 — 60° apart, moderately similar."
          },
          {
            "id": "lg3q2",
            "type": "mcq",
            "prompt": "Retrieval-Augmented Generation (RAG) works by:",
            "options": [
              "retrieving relevant documents at query time and injecting them into the model's prompt context",
              "fine-tuning the model's weights on your documents",
              "increasing the model's temperature so it's more creative",
              "storing the conversation history in a database"
            ],
            "answer": 0,
            "explanation": "RAG grounds answers in retrieved evidence placed in the prompt — keeping knowledge in an updatable store, separate from the model's reasoning."
          },
          {
            "id": "lg3q3",
            "type": "short",
            "prompt": "To preserve context across chunk boundaries, text splitters share characters between consecutive chunks. This parameter is the chunk ____.",
            "accept": [
              "overlap",
              "Overlap"
            ],
            "explanation": "chunk_overlap shares characters between neighbouring chunks so an idea split at a boundary still appears whole in one chunk."
          },
          {
            "id": "lg3q4",
            "type": "mcq",
            "prompt": "A RAG system returns confidently wrong answers about facts you know are in your documents. The most common root cause is:",
            "options": [
              "retrieval — the answer-bearing chunk was never in the retrieved top-k (bad chunking/embedding/query)",
              "the model's temperature is too low",
              "the vector store is too large",
              "the prompt is too short"
            ],
            "answer": 0,
            "explanation": "Most RAG failures are retrieval failures: if the right passage isn't retrieved, the model can't use it. Check recall@k before blaming generation."
          },
          {
            "id": "lg3q5",
            "type": "open",
            "points": 3,
            "prompt": "Design a RAG system to answer employee questions over a company's internal policy documents (HR, IT, legal — thousands of pages, updated often). Specify the indexing pipeline, the retrieval strategy, the prompt, and how you'd measure quality.",
            "rubric": [
              "Indexing pipeline: load the policy docs → split with a recursive splitter (sensible chunk_size/overlap, justified) → embed → store in a vector DB; notes re-indexing on updates (knowledge in an updatable store, not the weights).",
              "Retrieval strategy: top-k similarity, with a justified k; considers MMR for diversity and/or hybrid (vector + BM25) to catch exact terms like policy IDs/acronyms; possibly a score threshold.",
              "Prompt grounding: instruct the model to answer ONLY from the retrieved context and to say 'I don't know' / cite the source if absent — to curb hallucination and override.",
              "Measurement: evaluates retrieval (recall@k — is the gold passage retrieved?) and generation (faithfulness to context) SEPARATELY, and tunes chunking/k/strategy against retrieval metrics."
            ],
            "solution": "Indexing: load the HR/IT/legal docs, split with RecursiveCharacterTextSplitter (start ~500–1000 chars, ~100–200 overlap, tuned against retrieval — policy clauses are short and self-contained, so moderate chunks keep a clause whole without diluting), embed each chunk, and store in a vector DB (Chroma/pgvector); re-index changed documents on update so knowledge stays current without retraining. Retrieval: top-k similarity (k≈4–6), with **hybrid** search (dense vectors + BM25) since policy questions often hit exact terms (policy numbers, acronyms, 'PTO', form IDs) that embeddings blur, fused by Reciprocal Rank Fusion; add **MMR** to avoid retrieving k near-duplicate paragraphs, and possibly a score threshold so an out-of-scope question returns nothing rather than junk. Metadata-filter by department where possible. Prompt: 'Answer ONLY from the provided policy excerpts; if the answer isn't in them, say you don't know and suggest who to contact; cite the document/section.' Measurement: evaluate **retrieval** and **generation separately** — retrieval via recall@k on a labeled set (is the correct clause in the top-k?), generation via faithfulness (does the answer follow from the cited context, no fabrication?); tune chunk size/overlap, k, and hybrid weighting against the retrieval metric, since most failures are retrieval failures. This keeps knowledge updatable, grounds answers in evidence, and makes quality measurable per-stage.",
            "explanation": "Recursive chunking + hybrid (vector+BM25) retrieval with MMR, a strictly-grounded prompt, and separate recall@k / faithfulness metrics — because RAG quality is bounded by retrieval."
          },
          {
            "id": "lg3q6",
            "type": "open",
            "points": 3,
            "prompt": "Explain the chunking trade-off in RAG (why both too-large and too-small chunks hurt), and why cosine similarity (the angle) is the right metric for retrieval over raw vector magnitude.",
            "rubric": [
              "Too-large chunks: the embedding averages multiple topics, diluting the relevant content so it matches a pointed query weakly (worse precision) and wastes context-window budget.",
              "Too-small chunks: embed sharply and rank well, but omit surrounding context needed to answer (referents, conditions) — worse completeness; overlap mitigates boundary loss at the cost of duplication.",
              "Concludes there's no universal optimum — precision vs completeness pull oppositely and depend on the data, so chunking is tuned against a retrieval metric.",
              "Cosine/angle: embedding models encode meaning in vector DIRECTION not magnitude (a longer passage isn't 'more' of a meaning), so the angle measures semantic closeness; on normalized vectors cosine ranking coincides with nearest-neighbour."
            ],
            "solution": "Chunking trades retrieval **precision** against context **completeness**. A **too-large** chunk is embedded as a single vector averaging several topics, so its direction is pulled toward the average and the one answer-bearing sentence contributes little — the chunk matches a pointed query weakly and may fall out of the top-k; and once retrieved it consumes more of the finite context window, so fewer chunks fit. A **too-small** chunk embeds sharply (one idea, one direction) and ranks well, but may omit the surrounding sentences the answer actually needs — a pronoun's referent, a preceding condition — so even when retrieved it's insufficient. **Overlap** re-includes boundary context in both neighbours, reducing severed-context misses at the cost of storing overlapped spans twice. Since precision (favoring small) and completeness (favoring large) pull oppositely and the right balance depends on document structure and query type, there is no universal optimum — you tune size/overlap empirically against a retrieval metric (recall@k). As for the metric: **cosine similarity (the angle)** is right because embedding models encode meaning in the *direction* of the vector, not its magnitude — a longer document isn't 'more' of a meaning, so length shouldn't affect similarity. Cosine = (a·b)/(‖a‖‖b‖) = cos θ depends only on the angle; on unit-normalized embeddings it also coincides with nearest-neighbour by Euclidean distance, so 'most similar' and 'nearest' agree. Using raw dot product/magnitude would let longer (larger-norm) vectors spuriously dominate.",
            "explanation": "Large chunks dilute + waste context; small chunks lose context; tune against recall@k. Cosine uses direction (where meaning lives), not magnitude — so length doesn't distort similarity."
          }
        ]
      }
    },
  ],
};
