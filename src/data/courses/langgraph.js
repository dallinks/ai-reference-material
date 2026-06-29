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
    {
      "id": "lg4",
      "title": "The Graph Execution Model",
      "summary": "LangGraph's core: StateGraph, and the Pregel/bulk-synchronous super-step model — the same BSP computation as the cloud course, applied to agents.",
      "prerequisites": [
        "lg2"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangGraph docs — Graph API & execution model (super-steps, channels)",
        "Malewicz et al. — Pregel: A System for Large-Scale Graph Processing (SIGMOD 2010)"
      ],
      "lessons": [
        {
          "id": "lg4l1",
          "title": "StateGraph: Nodes, Edges & State",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "From a hand-rolled loop to a graph",
              "body": "Unit 2 ended with a hand-rolled `while` loop and a list of everything it lacked: a step limit, persistence, streaming, parallelism. **LangGraph** supplies all of those by making your computation a **graph**: you declare *nodes* (units of work), *edges* (what runs next), and a shared *state*, then hand it to an engine that runs the graph with cycles, conditional routing, and durability built in. The graph is data you build with a `StateGraph` builder and then `compile()` into an executable."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "StateGraph",
              "statement": "A **StateGraph** is a builder for a stateful graph, parameterized by a **State schema** (a TypedDict whose keys are the graph's *channels*). You add **nodes** with `add_node(name, fn)`, wire them with `add_edge(source, target)` (using the special `START` and `END` markers for entry and exit), and call `compile()` to produce an executable graph — itself a Runnable, so it has `invoke`/`stream` like any LCEL component."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Node and edge",
              "statement": "A **node** is a function `State → partial-state-update`: it receives the current state and returns a dict of *only the keys it wants to change* (the engine merges that update into the state). An **edge** declares control flow: `add_edge(START, \"a\")` sets the entry point, `add_edge(\"a\", \"b\")` makes b run after a, and `add_edge(\"b\", END)` exits. Nodes do work; edges decide what runs next."
            },
            {
              "type": "code",
              "heading": "A minimal StateGraph",
              "lang": "python",
              "code": "from langgraph.graph import StateGraph, START, END\nfrom typing_extensions import TypedDict\n\nclass State(TypedDict):\n    value: int\n\ndef increment(state: State) -> dict:\n    return {\"value\": state[\"value\"] + 1}   # partial update: only \"value\"\n\ndef double(state: State) -> dict:\n    return {\"value\": state[\"value\"] * 2}\n\nbuilder = StateGraph(State)\nbuilder.add_node(\"increment\", increment)\nbuilder.add_node(\"double\", double)\nbuilder.add_edge(START, \"increment\")\nbuilder.add_edge(\"increment\", \"double\")\nbuilder.add_edge(\"double\", END)\n\ngraph = builder.compile()              # an executable Runnable\ngraph.invoke({\"value\": 5})             # -> {\"value\": 12}   (5+1=6, then 6*2)"
            },
            {
              "type": "text",
              "heading": "Nodes return partial updates",
              "body": "A node does **not** return the whole state — it returns a dict of just the channels it changed, and the engine merges that into the running state. This is what lets nodes be small and composable, and it is the hook for the entire execution model: *how* a returned update is merged into a channel is decided by that channel's **reducer** (default: overwrite), which the next two lessons make precise. Returning a partial update is also why two parallel nodes can each touch the state without clobbering everything — they each declare only their own changes."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**A node returns only what it changes; the framework merges it.** Don't return the entire state from a node — return `{\"answer\": ...}`, not a full copy. The merge into each channel is governed by that channel's reducer (Unit 5), which is exactly what makes parallel updates and message accumulation well-defined. Thinking \"partial update + reducer\" instead of \"mutate the whole state\" is the mental shift LangGraph requires."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Trace the minimal graph above on input {\"value\": 3}. What does each node return, and what is the final state?",
                  "solution": "Entry edge START → increment. `increment({'value': 3})` returns the partial update `{'value': 4}` (3+1), merged into state → {'value': 4}. Edge increment → double. `double({'value': 4})` returns `{'value': 8}` (4×2), merged → {'value': 8}. Edge double → END. Final state: **{'value': 8}**. Note each node returned only the `value` channel it changed, not the whole state."
                },
                {
                  "prompt": "Why do nodes return a partial update (just the changed keys) rather than the full state? Give two consequences.",
                  "solution": "Because the framework *merges* each node's returned update into the state per-channel, rather than replacing the state wholesale. Consequences: (1) **Composability/locality** — a node only declares its own changes, so nodes stay small and don't need to know or preserve unrelated state; (2) **Well-defined parallelism + accumulation** — since updates are merged by each channel's *reducer*, two parallel nodes can each contribute to the state without clobbering each other (their writes are combined at the super-step barrier), and channels like `messages` can *accumulate* (append) rather than overwrite. Returning the whole state would break both: parallel nodes would overwrite each other, and there'd be no place for reducer-based merging."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg4l1-i1",
              "front": "What is a StateGraph?",
              "back": "A builder for a stateful graph parameterized by a State schema (TypedDict of channels). add_node / add_edge (with START, END), then compile() → an executable Runnable."
            },
            {
              "id": "lg4l1-i2",
              "front": "What is a node, as a function?",
              "back": "A function State → partial-state-update: it reads the current state and returns a dict of only the channels it changes; the engine merges that update in."
            },
            {
              "id": "lg4l1-i3",
              "front": "What do START and END mark?",
              "back": "The graph's entry (add_edge(START, first_node)) and exit (add_edge(last_node, END)) — special markers, not real nodes."
            },
            {
              "id": "lg4l1-i4",
              "front": "Why do nodes return partial updates, not the whole state?",
              "back": "So the engine merges each update per-channel via reducers — enabling small composable nodes, well-defined parallel writes (no clobbering), and accumulating channels (e.g. messages append)."
            }
          ]
        },
        {
          "id": "lg4l2",
          "title": "The Super-Step Execution Model (Pregel/BSP)",
          "estMinutes": 28,
          "content": [
            {
              "type": "text",
              "heading": "How a compiled graph actually runs",
              "body": "LangGraph's engine is not an ad-hoc loop — it is an implementation of the **Pregel / Bulk Synchronous Parallel (BSP)** model, the same computation model Google's Pregel uses for large-scale graph processing and the same bulk-synchronous model from the cloud course. Understanding it is what separates \"I wired up some nodes\" from knowing *exactly* what runs when, what each node sees, and why parallel branches don't race. The unit of execution is the **super-step**."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Super-step and channels",
              "statement": "A compiled graph runs as a sequence of discrete **super-steps**. The state is a set of **channels** (the State keys); nodes are **actors** that read channels and write updates to them. A node **activates** in a super-step when it receives a new value on an incoming channel/edge. Nodes that activate in the *same* super-step run **in parallel**; nodes that must run one-after-another fall in *separate*, sequential super-steps. One super-step = one synchronized round of \"all currently-active nodes run.\""
            },
            {
              "type": "theorem",
              "kind": "theorem",
              "name": "The BSP barrier makes parallel execution deterministic",
              "statement": "Within a super-step, **no node observes another node's writes**: every active node reads the channel values as of the *start* of the step, computes in isolation, and its writes are buffered until the step's **barrier**. At the barrier, all buffered writes to each channel are combined by that channel's **reducer** and the merged value becomes the channel's state for the *next* super-step. Therefore parallel nodes in one super-step all read the *same* input, and their concurrent writes to a shared channel merge **deterministically by the reducer** — independent of which node finished first.",
              "proof": "A super-step has three phases. **Read:** each active node reads the channel state as it stands at the start of the step. **Compute:** each node runs its function on that snapshot, in isolation — it cannot see other nodes' results because their writes have not been applied. **Barrier:** the step ends with a synchronization barrier at which all buffered writes are applied; for each channel, its reducer (a (Value, Value) → Value function) folds the concurrent writes into a single new value, which becomes that channel's state entering the next super-step.\n\nBecause reads occur at the start and writes apply only at the barrier, two parallel nodes A and B in the same super-step both read the start-of-step state S — neither sees the other's output, so there is no read-after-write race. Their writes to a shared channel are merged by the reducer; if the reducer is associative and commutative (as list-append and addition are), the folded result does not depend on the order A's and B's writes are combined, so the outcome is deterministic regardless of which finished first. ∎\n\nThis is precisely why \"fan out to parallel branches, fan back in\" is well-defined in LangGraph: the join is not a timing-dependent race but a reducer-merge at the barrier — the BSP guarantee, inherited from Pregel."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 250,
              "caption": "Super-step execution. A runs in super-step 1. B and C both activate on A's output and run in PARALLEL in super-step 2 — neither sees the other's writes. At the barrier ending step 2, B's and C's updates to each shared channel are merged by that channel's reducer; D then runs in super-step 3 on the merged state. The barrier (not execution order) is what makes the parallel fan-in deterministic.",
              "nodes": [
                {
                  "id": "a",
                  "label": "A",
                  "x": 14,
                  "y": 50,
                  "tone": "gold",
                  "sub": "step 1"
                },
                {
                  "id": "b",
                  "label": "B",
                  "x": 48,
                  "y": 22,
                  "tone": "sage",
                  "sub": "step 2"
                },
                {
                  "id": "c",
                  "label": "C",
                  "x": 48,
                  "y": 78,
                  "tone": "sage",
                  "sub": "step 2"
                },
                {
                  "id": "d",
                  "label": "D",
                  "x": 84,
                  "y": 50,
                  "tone": "gold",
                  "sub": "step 3"
                }
              ],
              "edges": [
                {
                  "from": "a",
                  "to": "b"
                },
                {
                  "from": "a",
                  "to": "c"
                },
                {
                  "from": "b",
                  "to": "d",
                  "tone": "sage"
                },
                {
                  "from": "c",
                  "to": "d",
                  "tone": "sage"
                }
              ]
            },
            {
              "type": "text",
              "heading": "Channels and reducers, previewed",
              "body": "Each State key is a **channel** with a value and a **reducer** that defines how writes to it combine at the barrier. The *default* channel has no reducer and uses **last-write-wins** (a write overwrites the old value) — fine for a single writer, dangerous for parallel writers (one clobbers the other). A channel with a reducer (e.g. `add_messages` for the message list, `operator.add` for a list) **accumulates** writes. Choosing the reducer is choosing how the barrier merges concurrent updates — the subject of the next unit."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**The barrier is why LangGraph parallelism is safe.** Unlike threads racing on shared memory, parallel nodes in a super-step cannot see or clobber each other's writes mid-step — they read the same snapshot and their updates are merged by reducers at the barrier. So \"fan out, fan in\" gives a deterministic, reducer-defined result, not a nondeterministic race. (This is the bulk-synchronous guarantee from Pregel and the cloud course's BSP model.)"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "In a graph where node A fans out to B and C (parallel) which both feed D, how many super-steps execute the nodes, and what state does each parallel node read?",
                  "solution": "**Three** super-steps: (1) A runs; (2) B and C activate on A's output and run *in parallel*; (3) D runs. Both B and C read the **same** channel state — the value(s) as written by A at the start-of-step-2 snapshot — because within a super-step no node sees another node's writes. B and C compute in isolation; their writes are buffered and merged by each channel's reducer at the barrier ending step 2, and D (step 3) reads that merged result. Neither B nor C sees the other's output."
                },
                {
                  "prompt": "Two parallel nodes both write to the same channel in one super-step. Explain why the result is deterministic in LangGraph but would be a race condition with ordinary shared-memory threads.",
                  "solution": "In LangGraph, the two writes are **buffered until the barrier** at the end of the super-step and then **merged by the channel's reducer** — both nodes read the same start-of-step snapshot (no mid-step visibility), and if the reducer is associative+commutative the merged value is independent of which node finished first. So the outcome is deterministic and defined by the reducer, not by timing. With ordinary shared-memory threads, each node would read-modify-write the shared variable *immediately and interleaved*, so the final value depends on the unpredictable interleaving of reads and writes (a data race / lost update). The BSP barrier replaces racing interleaved writes with a single, well-defined reducer-merge — the bulk-synchronous guarantee."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg4l2-i1",
              "front": "What execution model does LangGraph implement?",
              "back": "Pregel / Bulk Synchronous Parallel (BSP): the graph runs in discrete super-steps; nodes are actors communicating via channels (the same model as Google's Pregel and the cloud course's BSP)."
            },
            {
              "id": "lg4l2-i2",
              "front": "What is a super-step?",
              "back": "One synchronized round of execution: all currently-active nodes run. Parallel nodes share a super-step; sequential nodes fall in separate super-steps. A node activates on a new value on an incoming channel."
            },
            {
              "id": "lg4l2-i3",
              "front": "The BSP barrier rule?",
              "back": "Within a super-step no node sees another's writes — all read the start-of-step state, compute in isolation, and writes apply only at the barrier, where each channel's reducer merges them for the next step."
            },
            {
              "id": "lg4l2-i4",
              "front": "Why is LangGraph parallel fan-in deterministic?",
              "back": "Parallel nodes read the same snapshot (no mid-step visibility) and their writes merge via the channel's reducer at the barrier — not by timing. Associative+commutative reducers make it order-independent."
            },
            {
              "id": "lg4l2-i5",
              "front": "What is a channel?",
              "back": "A State key with a value and a reducer defining how writes to it combine at the barrier. Default: last-write-wins (overwrite). With a reducer (add_messages, operator.add): accumulate."
            }
          ]
        },
        {
          "id": "lg4l3",
          "title": "Termination & the Recursion Limit",
          "estMinutes": 20,
          "content": [
            {
              "type": "text",
              "heading": "Cycles run until they exit — or hit the limit",
              "body": "Because LangGraph allows cycles (the agent loop of Unit 2 is one), a run is a sequence of super-steps that continues as long as nodes keep activating — i.e. until control reaches `END`, or until a safety cap is hit. The cap is the **recursion limit**: the maximum number of super-steps a single execution may take. It is the formalization of Unit 2's termination argument — since a cyclic graph's structure does not guarantee halting, the engine imposes an external bound."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "recursion_limit and GraphRecursionError",
              "statement": "The **recursion_limit** sets the maximum number of super-steps a graph may execute in one run (default 1000 in recent versions). It is passed at runtime in the config dict — `graph.invoke(input, {\"recursion_limit\": 50})` — as a standalone key (not inside `configurable`). If the graph executes that many super-steps without reaching END, the engine raises **GraphRecursionError**, halting the run. The limit guarantees *every* execution terminates, in success (reached END) or in a handled error."
            },
            {
              "type": "code",
              "heading": "Bounding a cyclic graph",
              "lang": "python",
              "code": "from langgraph.errors import GraphRecursionError\n\ntry:\n    result = graph.invoke(user_input, {\"recursion_limit\": 25})\nexcept GraphRecursionError:\n    # The cycle ran 25 super-steps without reaching END.\n    # Handle it: return a partial result, escalate to a human, log for analysis.\n    result = {\"answer\": \"I couldn't complete this within the step budget.\"}"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "The recursion limit guarantees termination",
              "statement": "A graph containing a cycle is not guaranteed by its structure to terminate (a conditional edge may keep routing back into the loop). The recursion_limit converts this into a guaranteed-terminating computation: every run halts within at most `limit` super-steps — either by reaching END, or by raising GraphRecursionError — so the engine never runs forever.",
              "proof": "Each super-step increments a counter; the engine compares it to recursion_limit and stops when the counter would exceed it (raising GraphRecursionError). Since the counter strictly increases by one per super-step and the limit is finite, the run can execute at most `limit` super-steps before forced termination. Independently, the run also stops early if control reaches END. Hence the run terminates in ≤ limit super-steps in every case. This is the same device as bounding a possibly-non-terminating loop with an external decreasing/bounded measure (algorithms Unit 1, and Unit 2's agent loop): the structure cannot promise halting, so a finite external bound enforces it, trading the possibility of completing a very long legitimate run for the certainty of always stopping. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Design cycles to exit on a condition; treat hitting the limit as an error, not a plan.** A well-built loop reaches END via a conditional edge (the model finishes, the retry succeeds, the budget runs out *in your logic*). The recursion_limit is the *safety net* for when that logic fails — hitting GraphRecursionError means a runaway loop you should investigate, and you must handle it (partial result, escalation), not let it crash the request."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What does the recursion_limit do, what happens when it's exceeded, and why is it necessary for a graph with a cycle?",
                  "solution": "The recursion_limit caps the number of **super-steps** a single graph run may execute (default 1000). When a run reaches that many super-steps without arriving at END, the engine raises **GraphRecursionError** and halts. It's necessary for a cyclic graph because the graph's structure doesn't guarantee the loop ever exits — a conditional edge could keep routing back indefinitely (e.g. a confused agent calling tools forever). Since the counter strictly increases each super-step and the limit is finite, the run is forced to terminate within `limit` steps, guaranteeing halting; you then handle the error (partial result / escalate) rather than running forever."
                },
                {
                  "prompt": "How does the recursion_limit relate to the termination argument for the agent loop in Unit 2, and to proving a loop terminates in the algorithms course?",
                  "solution": "It's the same idea — bound a possibly-non-terminating loop with an external limit. Unit 2 argued that the agent loop is a cycle whose exit depends on a stochastic model, so termination can't be guaranteed internally; the fix is an external step bound. The recursion_limit *is* that bound, now concrete: it caps super-steps so the cyclic graph always halts. In the algorithms course, you prove a loop terminates by exhibiting a measure that strictly decreases into a well-founded set (e.g. ℕ); here, since the agent supplies no such measure, the engine imposes one — a strictly increasing super-step counter bounded by recursion_limit — which forces halting. All three are the same pattern: when structure can't promise termination, an external bounded/decreasing measure enforces it."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg4l3-i1",
              "front": "What is the recursion_limit?",
              "back": "The max number of super-steps a single graph run may execute (default 1000), passed in the config dict. It bounds cyclic graphs so every run terminates."
            },
            {
              "id": "lg4l3-i2",
              "front": "What happens when the recursion_limit is exceeded?",
              "back": "The engine raises GraphRecursionError and halts the run (the cycle didn't reach END in time). You handle it — partial result, escalate, log — don't let it crash."
            },
            {
              "id": "lg4l3-i3",
              "front": "Why does a cyclic graph need a recursion limit?",
              "back": "Its structure doesn't guarantee the loop exits (a conditional edge can keep routing back). The limit forces halting in ≤ limit super-steps — the external bound from Unit 2 / algorithms termination."
            },
            {
              "id": "lg4l3-i4",
              "front": "Limit as a safety net vs a plan?",
              "back": "Design cycles to reach END via a condition (the real exit). The recursion_limit catches runaway loops; hitting it is an error to investigate and handle, not normal control flow."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg4-check",
        "questions": [
          {
            "id": "lg4q1",
            "type": "mcq",
            "prompt": "In LangGraph's execution model, nodes that run in parallel (in the same super-step):",
            "options": [
              "each read the start-of-step state and cannot see another node's writes until the next super-step (the BSP barrier)",
              "execute in a random order, racing on shared mutable state",
              "must be merged manually by the developer after they finish",
              "are not allowed — LangGraph is strictly sequential"
            ],
            "answer": 0,
            "explanation": "Parallel nodes share a super-step, read the same snapshot, and their writes apply only at the barrier (merged by reducers) — the bulk-synchronous guarantee, so no races."
          },
          {
            "id": "lg4q2",
            "type": "short",
            "prompt": "LangGraph's execution engine implements the ____ / bulk-synchronous-parallel model, named after Google's large-scale graph-processing system.",
            "accept": [
              "Pregel",
              "pregel"
            ],
            "explanation": "LangGraph runs the Pregel/BSP model: discrete super-steps, actors (nodes) communicating via channels."
          },
          {
            "id": "lg4q3",
            "type": "numeric",
            "prompt": "A graph runs node A, then A fans out to B and C which run in parallel, then both feed node D. How many super-steps execute these nodes (A; then B,C; then D)?",
            "answer": 3,
            "tolerance": 0,
            "explanation": "Super-step 1: A. Super-step 2: B and C in parallel. Super-step 3: D (after the barrier merges B's and C's writes). Three super-steps."
          },
          {
            "id": "lg4q4",
            "type": "mcq",
            "prompt": "The recursion_limit in LangGraph:",
            "options": [
              "caps the number of super-steps in one run and raises GraphRecursionError if exceeded — guaranteeing termination of cyclic graphs",
              "limits the total number of nodes a graph may contain",
              "sets the maximum size of the state object",
              "controls how many tools the model may call at once"
            ],
            "answer": 0,
            "explanation": "It bounds super-steps per execution; exceeding it raises GraphRecursionError, forcing any cyclic graph to halt (success or handled error)."
          },
          {
            "id": "lg4q5",
            "type": "open",
            "points": 3,
            "prompt": "Explain the super-step (BSP) execution model and why it makes a 'fan out to parallel nodes, then fan back in' pattern deterministic, where naive shared-memory parallelism would have a race condition.",
            "rubric": [
              "Describes super-steps: the graph runs in discrete synchronized rounds; nodes active in the same super-step run in parallel, sequential nodes in separate steps; a node activates on a new value on an incoming channel.",
              "States the barrier rule: within a super-step nodes read the start-of-step state and cannot see each other's writes; writes are buffered and applied only at the barrier.",
              "Explains the reducer-merge: at the barrier, each channel's reducer folds the concurrent writes into one value for the next step; associative+commutative reducers make the result order-independent.",
              "Contrasts with shared-memory threads (interleaved read-modify-write → race/lost update) and concludes the barrier replaces racing with a deterministic reducer-merge — the bulk-synchronous guarantee."
            ],
            "solution": "LangGraph runs a compiled graph as a sequence of discrete **super-steps** (the Pregel/BSP model). In each super-step, every currently-active node runs — nodes that activate together run in parallel; nodes that must follow one another fall in separate super-steps; a node activates when it receives a new value on an incoming channel. The key is the **barrier**: within a super-step, each node *reads the channel state as of the start of the step* and computes *in isolation* — its writes are **buffered, not applied**, so no node can see another node's output mid-step. At the step's barrier, all buffered writes to each channel are merged by that channel's **reducer** (a (Value,Value)→Value fold) into a single value that becomes the channel's state for the next super-step. So in 'fan out to B and C, fan back into D': B and C both read the same start-of-step snapshot (neither sees the other), their writes to a shared channel are combined by the reducer at the barrier, and D reads the merged result — deterministically. If the reducer is associative and commutative (list-append, addition), the merge is independent of which node finished first. With naive shared-memory threads, B and C would instead read-modify-write the shared state *immediately and interleaved*, so the final value would depend on the unpredictable interleaving (a data race / lost update). The BSP barrier replaces interleaved racing with a single well-defined reducer-merge — that's why LangGraph parallelism is safe and deterministic.",
            "explanation": "Super-steps + a barrier (read start-of-step, buffer writes, merge by reducer) eliminate mid-step visibility, turning a potential race into a deterministic reducer-merge — the Pregel/BSP guarantee."
          },
          {
            "id": "lg4q6",
            "type": "open",
            "points": 3,
            "prompt": "A LangGraph agent has a cycle (model ⇄ tools). Explain how it executes as super-steps, why its termination is not guaranteed by structure, and how the recursion_limit guarantees the run always halts. Relate this to proving loop termination in general.",
            "rubric": [
              "Describes the cyclic execution: each pass through model → tools → model is one or more super-steps; the run continues as long as the conditional edge routes back into the loop, and ends when it routes to END.",
              "Argues termination isn't structurally guaranteed: the exit depends on the (stochastic) model emitting no tool calls, so it could loop forever (repeat/oscillate).",
              "Explains the recursion_limit: a super-step counter strictly increases and is bounded by the limit, so the run halts in ≤ limit super-steps — reaching END or raising GraphRecursionError (which must be handled).",
              "Connects to general termination proofs: structure can't promise halting, so an external bounded/decreasing measure (the step counter ≤ limit) enforces it — the same device as bounding a loop with a measure (algorithms Unit 1)."
            ],
            "solution": "The agent runs as super-steps: the model node runs (a super-step), and a conditional edge routes either to the tools node (which runs, then edges back to the model — continuing the cycle over further super-steps) or to END. Each lap through model → tools → model advances the super-step counter. **Termination is not guaranteed by the graph's structure**, because whether the cycle exits depends on the model emitting *no* tool calls — and the model is stochastic and fallible, so it could call tools forever, repeat a failing call, or oscillate between two calls; there is no structural decreasing measure forcing it to stop. The **recursion_limit** supplies that measure externally: the engine increments a super-step counter each round and stops when it would exceed the limit, raising **GraphRecursionError**. Since the counter strictly increases by one per super-step and the limit is finite, the run *must* halt within `limit` super-steps — either by reaching END (success) or by hitting the limit (a handled error: return a partial answer or escalate). This is exactly the general pattern for proving termination: when a loop's structure cannot guarantee halting, you bound it with an external measure into a well-founded set (here, a counter bounded by recursion_limit) — the same technique used to prove loops terminate in the algorithms course and to bound the raw agent loop in Unit 2.",
            "explanation": "The cycle advances super-steps; its exit depends on a stochastic model (no structural guarantee), so the recursion_limit (a bounded, strictly-increasing step counter) forces halting — the external-measure termination device."
          }
        ]
      }
    },
    {
      "id": "lg5",
      "title": "State, Reducers & Control Flow",
      "summary": "Channels and reducers (how writes merge at the barrier), conditional edges and cycles (the agent loop as a real graph), and Command/Send for dynamic routing and map-reduce.",
      "prerequisites": [
        "lg4"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangGraph docs — State, reducers & conditional edges",
        "LangGraph docs — Command & the Send API (map-reduce)"
      ],
      "lessons": [
        {
          "id": "lg5l1",
          "title": "Channels & Reducers",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Channel and reducer",
              "statement": "Each key of the State schema is a **channel**: a slot with a current value and a **reducer** — a function `(current, update) → new` that defines how a node's write combines with what's already there. A channel declared as a plain type has *no* reducer and uses **last-write-wins** (the write overwrites the old value). A channel annotated with a reducer **accumulates**: `Annotated[list, operator.add]` concatenates lists; `Annotated[list, add_messages]` appends/merges messages. The reducer is exactly what the super-step barrier (Unit 4) applies to merge writes."
            },
            {
              "type": "code",
              "heading": "Declaring channels with reducers",
              "lang": "python",
              "code": "from typing import Annotated\nfrom typing_extensions import TypedDict\nfrom operator import add\nfrom langgraph.graph.message import add_messages\n\nclass State(TypedDict):\n    messages: Annotated[list, add_messages]  # reducer: append/merge messages\n    visited: Annotated[list[str], add]       # reducer: concatenate lists\n    current_step: str                        # no reducer: overwrite (last-write-wins)\n\n# A node returns a partial update; the reducer decides how it merges:\ndef node(state: State) -> dict:\n    return {\"messages\": [(\"ai\", \"hi\")], \"visited\": [\"node\"], \"current_step\": \"done\"}\n# messages & visited APPEND; current_step OVERWRITES."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "add_messages",
              "statement": "`add_messages` is the standard reducer for the message channel (and what the prebuilt **MessagesState** uses). It **appends** new messages to the list, but with message semantics: messages are merged by **id** (a re-emitted message with the same id *updates* rather than duplicates), and string/dict shorthands are coerced to message objects. It is why `messages: Annotated[list, add_messages]` accumulates a conversation across nodes and super-steps instead of each node clobbering the history."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Reducers for parallel channels must be associative and commutative",
              "statement": "If a channel can be written by **parallel** nodes (the same super-step), its reducer must be **associative and commutative** for the merged result to be deterministic. Overwrite (last-write-wins) is *not* commutative, so two parallel writes to a plain channel give an order-dependent, effectively nondeterministic result — reintroducing the race the barrier was meant to remove.",
              "proof": "At the barrier, the engine folds the set of concurrent writes {u₁, u₂, …} to a channel using its reducer r: the merged value is r(r(r(init, u₁), u₂), …). The *set* of writes is unordered (parallel nodes have no defined finish order), so the result is well-defined only if it is independent of the fold order — i.e. if r is associative (regrouping doesn't matter) and commutative (reordering doesn't matter). List concatenation/append (add, add_messages) and numeric addition are associative and commutative, so parallel writes merge deterministically. Last-write-wins is *not* commutative — LWW(a, b) = b ≠ a = LWW(b, a) — so two parallel writes to a reducer-less channel resolve to 'whichever the engine happened to apply last,' an order-dependent outcome. Hence: channels written by parallel branches need an accumulating, order-independent reducer; reducer-less (overwrite) channels are safe only for a single writer per super-step. ∎"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Pick reducers deliberately — a bad one re-creates the race the barrier removed.** Single-writer state (a status flag, the current node's choice) is fine as overwrite. But any channel that parallel branches write — counters, collected results, messages — needs an *accumulating, associative+commutative* reducer (`operator.add`, `add_messages`), or the parallel fan-in becomes order-dependent. The reducer is not a detail; it is the semantics of your state."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "A channel is declared `count: int` (no reducer). Two parallel nodes each return {\"count\": <some value>}. What happens, and how do you make the result deterministic if you wanted to sum their contributions?",
                  "solution": "With no reducer, the channel is **last-write-wins (overwrite)**: at the barrier the two parallel writes resolve to whichever the engine applies last, so one node's value silently clobbers the other's — an order-dependent, effectively nondeterministic result (and certainly not their sum). To deterministically sum the contributions, declare an accumulating reducer: `count: Annotated[int, operator.add]`. Now each node returns its *delta* (e.g. {'count': 1}) and the barrier folds them with addition — which is associative and commutative, so the merged total is order-independent and deterministic regardless of which parallel node finished first."
                },
                {
                  "prompt": "Why is add_messages the right reducer for a conversation channel, and what would go wrong with the default (overwrite) reducer in a multi-node graph?",
                  "solution": "`add_messages` **appends** new messages to the running list (merging by id, so a re-emitted message updates rather than duplicates), which is exactly what a conversation needs: each node — model, tools — adds its message(s) and the full history accumulates across nodes and super-steps. With the **default overwrite** reducer, each node's returned `{'messages': [...]}` would *replace* the entire history with just that node's messages, destroying the conversation: the tool node would wipe the user's question and the model's prior turn, the model would lose all context, and the agent loop would break. Accumulation (append) vs replacement is the whole difference, and it's the reducer that decides it."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg5l1-i1",
              "front": "What is a channel and its reducer?",
              "back": "Each State key is a channel with a value and a reducer (current, update)→new defining how writes merge at the barrier. No reducer = overwrite (last-write-wins); a reducer = accumulate."
            },
            {
              "id": "lg5l1-i2",
              "front": "What does add_messages do?",
              "back": "The standard messages-channel reducer (used by MessagesState): appends new messages, merging by id (re-emitted same-id message updates, not duplicates), coercing shorthands. Accumulates the conversation."
            },
            {
              "id": "lg5l1-i3",
              "front": "Why must a parallel-written channel's reducer be associative + commutative?",
              "back": "Parallel writes have no defined order; the merge is well-defined only if regrouping (associative) and reordering (commutative) don't change it. add/add_messages qualify; overwrite (LWW) doesn't → order-dependent race."
            },
            {
              "id": "lg5l1-i4",
              "front": "When is an overwrite (no-reducer) channel safe?",
              "back": "Only for a single writer per super-step (a status flag, a routing choice). Any channel parallel branches write needs an accumulating, order-independent reducer."
            }
          ]
        },
        {
          "id": "lg5l2",
          "title": "Conditional Edges & Cycles",
          "estMinutes": 26,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Conditional edge",
              "statement": "A **conditional edge** routes dynamically: `add_conditional_edges(source, routing_fn, mapping?)` runs `routing_fn(state)` after the source node and uses its return value to choose the next node(s). With a mapping dict, the function returns a key that maps to a node name (or `END`). This is the data-dependent branch that LCEL lacks (Unit 1) — the control-flow primitive that, combined with a back edge, builds loops."
            },
            {
              "type": "text",
              "heading": "Building the agent loop as a real graph",
              "body": "Now Unit 2's reason→act→observe loop becomes a concrete StateGraph. Two nodes: **model** (calls the LLM, appends an AIMessage that may contain tool calls) and **tools** (executes any tool calls, appends ToolMessages). A **conditional edge** out of `model` runs `should_continue`: if the last message has tool calls, go to `tools`; otherwise go to `END`. A **normal edge** `tools → model` closes the loop. The recursion_limit (Unit 4) caps it. That's a complete agent — a cycle with a conditional exit."
            },
            {
              "type": "code",
              "heading": "The ReAct agent as a StateGraph",
              "lang": "python",
              "code": "from langgraph.graph import StateGraph, START, END, MessagesState\nfrom langgraph.prebuilt import ToolNode\n\nmodel_t = model.bind_tools(tools)\n\ndef call_model(state: MessagesState) -> dict:\n    return {\"messages\": [model_t.invoke(state[\"messages\"])]}\n\ndef should_continue(state: MessagesState) -> str:\n    last = state[\"messages\"][-1]\n    return \"tools\" if last.tool_calls else END   # data-dependent branch\n\nbuilder = StateGraph(MessagesState)\nbuilder.add_node(\"model\", call_model)\nbuilder.add_node(\"tools\", ToolNode(tools))       # prebuilt: runs the tool calls\nbuilder.add_edge(START, \"model\")\nbuilder.add_conditional_edges(\"model\", should_continue, {\"tools\": \"tools\", END: END})\nbuilder.add_edge(\"tools\", \"model\")               # the back edge -> a cycle\nagent = builder.compile()"
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 250,
              "caption": "The ReAct agent as a real StateGraph. After the model node, the conditional edge should_continue routes to tools (if the last AIMessage has tool calls) or to END (if not). The tools → model back edge makes it a cycle; the messages channel (add_messages reducer) accumulates the conversation; the recursion_limit bounds the loop. This is exactly the cycle LCEL could not express.",
              "nodes": [
                {
                  "id": "start",
                  "label": "START",
                  "x": 10,
                  "y": 50,
                  "tone": "muted"
                },
                {
                  "id": "model",
                  "label": "model",
                  "x": 40,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "tools",
                  "label": "tools",
                  "x": 76,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "end",
                  "label": "END",
                  "x": 40,
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
                  "label": "back edge",
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
              "body": "**Every cycle needs a conditional edge that can actually reach END.** A back edge with no exit condition (or a condition that never fires) is an infinite loop that only stops at the recursion_limit — a bug, not a feature. When you add a back edge, immediately ask: *what state makes the conditional route to END, and will it ever hold?* (Here: the model eventually answers with no tool calls.)"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "In the ReAct StateGraph, identify the cycle, the exit condition, and the reducer that makes it work. What would break if the messages channel used the default (overwrite) reducer?",
                  "solution": "**Cycle:** model → (conditional) tools → model (the `tools → model` back edge). **Exit condition:** the conditional edge `should_continue` routes to END when the last AIMessage has *no* tool calls (the model produced a final answer). **Reducer:** `messages: Annotated[list, add_messages]` (via MessagesState) — it *appends* each node's messages so the conversation accumulates. If messages used the default **overwrite** reducer, each node would replace the whole history with only its own messages: the tools node would wipe the user question and the model's tool-call message, the model would re-run with no context (losing what tools it called and their results), and the loop would never make progress or terminate sensibly — the agent breaks. Accumulation is essential to the loop."
                },
                {
                  "prompt": "Why is add_conditional_edges the key construct that distinguishes a LangGraph from an LCEL chain, and what must you verify whenever you add a back edge?",
                  "solution": "`add_conditional_edges` implements a **data-dependent branch**: it runs a function on the current state and routes to different next nodes based on the result — exactly the content-based routing that LCEL's acyclic, pure-transform pipeline cannot do. Combined with a back edge, it's what lets a graph form *cycles with conditional exits* (loops), the thing LCEL structurally lacks. Whenever you add a back edge (creating a cycle), you must verify there is a **reachable exit**: some state makes a conditional edge route to END, and that state will actually occur — otherwise the cycle runs until it hits the recursion_limit (a runaway-loop bug). Ask 'what condition ends this loop, and will it ever be true?' every time you close a cycle."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg5l2-i1",
              "front": "What is a conditional edge?",
              "back": "add_conditional_edges(source, routing_fn, mapping?) runs routing_fn(state) after the source and routes to the next node(s) by its result — the data-dependent branch LCEL lacks."
            },
            {
              "id": "lg5l2-i2",
              "front": "The ReAct agent graph structure?",
              "back": "Nodes model + tools; conditional edge from model (should_continue: tools if last msg has tool_calls else END); back edge tools → model (the cycle); messages channel accumulates via add_messages; recursion_limit bounds it."
            },
            {
              "id": "lg5l2-i3",
              "front": "What makes a graph cyclic, and what must every cycle have?",
              "back": "A back edge (e.g. tools → model). Every cycle needs a conditional edge with a *reachable* exit to END; otherwise it loops until the recursion_limit — a bug."
            },
            {
              "id": "lg5l2-i4",
              "front": "Why would overwrite break the agent loop?",
              "back": "Each node would replace the whole message history with only its own messages, wiping context (question, tool calls/results). The model loses its history and the loop can't progress. Needs add_messages (append)."
            }
          ]
        },
        {
          "id": "lg5l3",
          "title": "Command & Send: Dynamic Routing and Map-Reduce",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Command: update and route together",
              "statement": "A node can return a **Command** to combine a state update *and* the routing decision in one place: `Command(update={...}, goto=\"next_node\")`. Instead of a node that writes state followed by a separate conditional edge, the node itself decides where to go. It's used for dynamic control flow from inside a node (e.g. a supervisor that updates state and routes to the chosen worker), and is annotated with the possible targets, e.g. `-> Command[Literal[\"a\", \"b\"]]`."
            },
            {
              "type": "code",
              "heading": "Command",
              "lang": "python",
              "code": "from langgraph.types import Command\nfrom typing import Literal\n\ndef supervisor(state: State) -> Command[Literal[\"researcher\", \"writer\", \"__end__\"]]:\n    decision = route(state)                 # your logic / an LLM call\n    return Command(\n        update={\"last_decision\": decision},  # write to state...\n        goto=decision,                       # ...AND route, in one return\n    )"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Send: dynamic fan-out (map-reduce)",
              "statement": "**Send** dispatches a *runtime-determined* number of parallel node invocations, each with its own input: returning `[Send(\"worker\", payload) for payload in items]` from a conditional edge fans out one `worker` instance per item. The instances run **in parallel in the next super-step**, and their writes merge at the barrier via the channel reducer. This is **map-reduce**: Send is the *map* (fan out over a collection whose size is unknown at build time), the accumulating reducer is the *reduce*."
            },
            {
              "type": "code",
              "heading": "Send: map-reduce over a collection",
              "lang": "python",
              "code": "from langgraph.types import Send\n\nclass State(TypedDict):\n    subjects: list[str]\n    jokes: Annotated[list[str], add]   # reduce: collect results\n\ndef fan_out(state: State):             # a conditional edge returns Sends\n    return [Send(\"gen_joke\", {\"subject\": s}) for s in state[\"subjects\"]]\n\ndef gen_joke(state: dict) -> dict:     # runs once per subject, in parallel\n    return {\"jokes\": [f\"joke about {state['subject']}\"]}\n\nbuilder.add_conditional_edges(\"pick\", fan_out, [\"gen_joke\"])\nbuilder.add_edge(\"gen_joke\", \"collect\")\n# All gen_joke instances run in one super-step; their {\"jokes\": [...]} writes\n# merge via the add reducer at the barrier -> jokes = [all of them]."
            },
            {
              "type": "text",
              "heading": "Why Send needs the BSP barrier and a good reducer",
              "body": "Send is the clearest payoff of the super-step model (Unit 4). The N fanned-out instances are exactly N parallel nodes in one super-step: each reads its own `Send` payload, computes in isolation, and writes to the shared results channel; at the barrier those N writes are folded by the reducer into the collected output. This is *only* deterministic because the reducer (here `add`) is associative and commutative (Lesson 1) — the workers finish in arbitrary order, but list-concatenation makes the merge order-independent. Map-reduce on the BSP model is the same pattern as the cloud and algorithms courses, now driving agent fan-out."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Command routes one path; Send forks many.** Use `Command(update=, goto=)` when a node should update state and pick its single next node (dynamic routing, supervisors). Use `Send` when you must fan out over a collection sized at runtime (process each retrieved doc, each sub-question, each subject) — and make the results channel's reducer accumulating + commutative so the parallel results merge deterministically at the barrier."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "You need to summarize each of an unknown number of retrieved documents in parallel, then combine the summaries. Which primitive do you use, and what must the results channel's reducer be — and why?",
                  "solution": "Use **Send**: from a conditional edge return `[Send('summarize', {'doc': d}) for d in state['docs']]`, fanning out one `summarize` instance per document (the count is known only at runtime). The results channel (e.g. `summaries: Annotated[list, add]`) must have an **accumulating, associative+commutative reducer** (list concatenation). Why: the N summarize instances are N parallel nodes in one super-step; they finish in arbitrary order and each writes its summary to the shared channel, and those writes are merged by the reducer at the barrier. Only an associative+commutative reducer makes that merge **order-independent** (deterministic) regardless of which document finished first — `add` (concat) qualifies; an overwrite reducer would let summaries clobber each other. Send is the *map*; the accumulating reducer is the *reduce*."
                },
                {
                  "prompt": "Contrast Command and Send: when do you use each, and how do they relate to the super-step model?",
                  "solution": "**Command** combines a state update with routing to a *single* next node from inside a node: `Command(update={...}, goto='next')`. Use it for dynamic control flow where one node decides both what to write and where to go next — e.g. a supervisor routing to the chosen worker. It advances to one node (one branch). **Send** dispatches a *runtime-determined number* of *parallel* invocations of a node, each with its own payload: `[Send('worker', x) for x in items]`. Use it to fan out over a collection sized at runtime (map-reduce). Relation to super-steps: Send creates N parallel nodes that all run in the *next super-step* and whose writes merge at the barrier via the reducer (so it relies on, and showcases, the BSP guarantee); Command just sets the next active node for the following super-step. In short: Command routes one path; Send forks many parallel paths that the barrier then joins."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg5l3-i1",
              "front": "What does Command let a node do?",
              "back": "Return Command(update={...}, goto='next') to combine a state update AND the routing decision in one place — dynamic control flow from inside a node (e.g. a supervisor). Annotated with possible targets."
            },
            {
              "id": "lg5l3-i2",
              "front": "What is Send for?",
              "back": "Dynamic fan-out: return [Send('node', payload) for ... ] to launch a runtime-determined number of parallel node instances, each with its own input — the map step of map-reduce."
            },
            {
              "id": "lg5l3-i3",
              "front": "How does Send relate to super-steps and reducers?",
              "back": "The N Send instances run as N parallel nodes in the next super-step; their writes merge at the barrier via the channel reducer (the reduce step) — deterministic only if the reducer is associative+commutative."
            },
            {
              "id": "lg5l3-i4",
              "front": "Command vs Send?",
              "back": "Command routes ONE path (update + goto a single node, e.g. supervisor). Send FORKS many parallel instances over a runtime-sized collection (map-reduce), joined at the barrier by the reducer."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg5-check",
        "questions": [
          {
            "id": "lg5q1",
            "type": "mcq",
            "prompt": "A LangGraph channel declared with no reducer (e.g. `status: str`), written by a node, behaves how?",
            "options": [
              "the written value overwrites the old one (last-write-wins)",
              "the new value is appended to a list of all values",
              "writes are rejected unless a reducer is defined",
              "the values are averaged"
            ],
            "answer": 0,
            "explanation": "No reducer = overwrite (last-write-wins). An accumulating channel needs a reducer (operator.add, add_messages). Overwrite is safe only for a single writer per super-step."
          },
          {
            "id": "lg5q2",
            "type": "short",
            "prompt": "The standard reducer that appends/merges messages on the messages channel (and that MessagesState uses) is ____.",
            "accept": [
              "add_messages",
              "add messages"
            ],
            "explanation": "add_messages appends new messages (merging by id), accumulating the conversation across nodes — unlike the default overwrite."
          },
          {
            "id": "lg5q3",
            "type": "mcq",
            "prompt": "A conditional edge (add_conditional_edges) does what?",
            "options": [
              "runs a function on the current state and routes to the next node(s) based on its result (data-dependent branching)",
              "runs all successor nodes unconditionally",
              "merges two channels into one",
              "pauses the graph until a human responds"
            ],
            "answer": 0,
            "explanation": "It's the data-dependent branch LCEL lacks: routing_fn(state) chooses the next node. With a back edge, it builds conditional cycles (the agent loop)."
          },
          {
            "id": "lg5q4",
            "type": "short",
            "prompt": "To fan out a runtime-determined number of parallel node invocations (map-reduce over a collection), a conditional edge returns a list of ____ objects.",
            "accept": [
              "Send",
              "send",
              "Send objects",
              "Sends"
            ],
            "explanation": "Send('node', payload) dispatches one parallel invocation per item; their writes merge at the barrier via the channel reducer (the reduce step)."
          },
          {
            "id": "lg5q5",
            "type": "open",
            "points": 3,
            "prompt": "Design a LangGraph for a research agent that iteratively searches: it searches, reflects on whether it has enough to answer, and either searches again or writes the final answer. Specify the state (with reducers), the nodes, the conditional edge and cycle, and how it terminates.",
            "rubric": [
              "State with appropriate reducers: e.g. messages or a findings list with an accumulating reducer (add/add_messages), plus a counter or 'enough' flag; justifies overwrite vs accumulate per channel.",
              "Nodes: a search node (runs a retrieval/tool, appends findings), a reflect node (decides if findings suffice), and a write node (produces the final answer).",
              "Conditional edge + cycle: reflect routes back to search (need more) or to write/END (enough) — a back edge forms the loop; identifies the reachable exit condition.",
              "Termination: the exit condition (reflect says 'enough' or a max-iterations check) plus the recursion_limit as the safety net; notes handling GraphRecursionError."
            ],
            "solution": "State (TypedDict): `findings: Annotated[list[str], add]` (accumulate retrieved evidence — written each loop, so an accumulating, commutative reducer), `messages: Annotated[list, add_messages]` (the running dialogue), `iterations: Annotated[int, add]` or a plain `enough: bool` (single-writer, overwrite is fine). Nodes: **search** (run the retrieval tool on the current query, append results to `findings`), **reflect** (an LLM/structured-output call deciding whether `findings` suffice to answer — sets `enough` and possibly a refined query), **write** (compose the final grounded answer from `findings`). Edges: START → search → reflect; a **conditional edge** out of reflect, `should_continue(state)` → `'search'` if not `enough` (and under a max-iteration cap) else `'write'`; `write → END`. The `reflect → search` route plus `search → reflect` forms the **cycle**. **Reachable exit:** reflect routes to write when it judges the findings sufficient (or the iteration cap is reached) — a condition that will hold because each loop adds findings and the cap is finite. **Termination:** primarily the exit condition (enough / cap), with the **recursion_limit** as the safety net so a reflect that never says 'enough' still halts — catch GraphRecursionError and return the best partial answer. Reducers matter: `findings`/`messages` must accumulate (not overwrite) so evidence and context build across iterations; the loop control (`enough`, `iterations`) is single-writer and can overwrite/add.",
            "explanation": "Search→reflect→(search|write) with accumulating findings/messages reducers, a conditional cycle with a reachable 'enough'/cap exit, and the recursion_limit as the safety net."
          },
          {
            "id": "lg5q6",
            "type": "open",
            "points": 3,
            "prompt": "Explain what a reducer is and why a channel that parallel nodes write to must have an associative and commutative reducer. Tie your answer to the super-step barrier, and give an example of a correct reducer and an incorrect one for parallel writes.",
            "rubric": [
              "Defines a reducer: a (current, update) → new function per channel that the super-step barrier uses to merge writes into the channel's next value; default (no reducer) = overwrite/last-write-wins.",
              "Explains the barrier connection: parallel nodes' writes are buffered and folded by the reducer at the barrier; the writes have no defined order, so the fold must be order-independent.",
              "States the requirement: order-independence needs associativity (regrouping) + commutativity (reordering); names a correct reducer (operator.add / add_messages — list concat, addition) and an incorrect one (overwrite/LWW, which isn't commutative).",
              "Concludes that a non-commutative reducer on a parallel-written channel reintroduces nondeterminism (a race/lost update), defeating the barrier's guarantee."
            ],
            "solution": "A **reducer** is a per-channel function `(current, update) → new` that defines how a node's write to that channel combines with the existing value; it's exactly what the super-step **barrier** applies to merge all the writes to a channel into the value that enters the next super-step. A channel with no reducer uses **overwrite (last-write-wins)**. When a channel is written by **parallel** nodes (the same super-step), their writes are buffered and folded by the reducer at the barrier, but the writes have **no defined order** (parallel nodes finish unpredictably). So the merged result is well-defined — deterministic — only if the fold is **order-independent**, which requires the reducer to be **associative** (regrouping the folds doesn't change the result) and **commutative** (reordering the writes doesn't change it). A **correct** reducer for parallel writes is `operator.add` (list concatenation) or `add_messages` / numeric addition — all associative and commutative, so N parallel writes merge to the same collection/total regardless of finish order. An **incorrect** one is the default overwrite (last-write-wins): LWW(a,b)=b≠a=LWW(b,a) is not commutative, so two parallel writes resolve to 'whichever the engine applied last' — an order-dependent, effectively random result (a lost update). Using a non-commutative reducer on a parallel-written channel reintroduces exactly the race condition the BSP barrier was designed to eliminate, so the reducer choice is the determinism guarantee, not a detail.",
            "explanation": "A reducer is the barrier's per-channel merge function; parallel writes are unordered, so only an associative+commutative reducer (add/add_messages) merges them deterministically — overwrite (non-commutative) re-creates a race."
          }
        ]
      }
    },
    {
      "id": "lg6",
      "title": "Persistence, Memory & Human-in-the-Loop",
      "summary": "Checkpointers and threads (durable, resumable state), short- vs long-term memory under the context window, and interrupt/time-travel for human oversight.",
      "prerequisites": [
        "lg4"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangGraph docs — Persistence (checkpointers, threads, durable execution)",
        "LangGraph docs — Interrupts & human-in-the-loop"
      ],
      "lessons": [
        {
          "id": "lg6l1",
          "title": "Checkpointers & Threads (Durable State)",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "By default a graph forgets everything",
              "body": "A compiled graph, invoked twice, has no memory of the first call — like the bare chat model of Unit 1, the state exists only for one `invoke`. To make a graph *remember* across calls (a multi-turn conversation) and *survive* a crash (resume mid-run), you attach a **checkpointer**. With one line at compile time, every run's state is persisted automatically, and the same graph becomes a durable, stateful, multi-session application."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Checkpointer",
              "statement": "A **checkpointer** persists a snapshot of the entire graph state (all channels) to durable storage **after every super-step**, keyed by a thread. You attach it at compile: `graph = builder.compile(checkpointer=...)`. On each `invoke` with a given thread, the engine *loads* the latest snapshot before running and *saves* the updated state after each super-step — so state accumulates across invocations and survives process restarts, with no extra code in your nodes."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Thread",
              "statement": "A **thread** is a series of checkpoints under a unique `thread_id`, supplied at runtime in the config: `{\"configurable\": {\"thread_id\": \"user-42\"}}`. Each thread is an independent state timeline — one conversation, one session, one user — so a single deployed graph serves many isolated threads concurrently (multi-tenancy). Invoking with a new thread_id starts fresh; invoking with an existing one continues where that thread left off."
            },
            {
              "type": "code",
              "heading": "Memory across calls, via a checkpointer + thread_id",
              "lang": "python",
              "code": "from langgraph.checkpoint.memory import InMemorySaver\n# Production: from langgraph.checkpoint.sqlite import SqliteSaver  (or Postgres)\n\ngraph = builder.compile(checkpointer=InMemorySaver())\n\nconfig = {\"configurable\": {\"thread_id\": \"user-42\"}}\ngraph.invoke({\"messages\": [HumanMessage(\"Hi, I'm Alice.\")]}, config)\ngraph.invoke({\"messages\": [HumanMessage(\"What's my name?\")]}, config)\n# -> \"Alice\" — the 2nd call loaded the thread's checkpointed history.\n# A different thread_id would not know Alice."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Checkpointer backends",
              "statement": "Checkpointers differ only in *where* they store snapshots: **InMemorySaver** keeps them in a RAM dict — fine for notebooks/tests/CI, but wiped on process exit (never production). **SqliteSaver** persists to a local SQLite file (single-node durability). **PostgresSaver** (and other DB backends) gives shared, production-grade persistence across many servers. The graph code is identical; you swap the backend."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Durable, resumable execution",
              "statement": "Because the checkpointer saves the full state after every super-step, a run that crashes mid-execution **resumes from the last completed super-step** rather than restarting: re-invoking with the same thread_id loads the latest checkpoint and continues. This is the same checkpoint-and-resume durability as the cloud course's event sourcing / checkpointing.",
              "proof": "The checkpointer persists a snapshot of all channels at each super-step barrier. Suppose a run completes super-steps 1..k and the process dies during super-step k+1. The post-k state is durably stored. On restart, invoking with the same thread_id makes the engine read the latest checkpoint (post-k) and resume from there — re-running only super-step k+1 onward, not 1..k. Because each super-step's effect is captured before the next begins (the barrier of Unit 4), no completed work is lost and none is re-applied (the loaded state already reflects 1..k). That is exactly checkpoint-based durable execution: persist state at well-defined points; on failure, resume from the last persisted point. ∎\n\nThe same mechanism that gives a conversation memory across calls gives a long-running agent crash-resilience — both are 'load the latest checkpoint for this thread, then continue.'"
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Use a persistent checkpointer in production — InMemorySaver loses everything on restart.** The checkpointer is what turns a stateless graph into a durable, multi-session app (memory + crash-resume) for one line at compile time. But InMemorySaver is RAM-only: a deploy or crash wipes every conversation. Use SqliteSaver (single node) or a DB-backed saver (Postgres) for anything real."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What two capabilities does attaching a checkpointer give a LangGraph, and why does the same mechanism provide both?",
                  "solution": "(1) **Memory across invocations** — a multi-turn conversation 'remembers' because each call's state is saved and the next call on the same thread loads it; (2) **Durable, resumable execution** — a crash mid-run can resume from the last checkpoint instead of restarting. The same mechanism provides both because both are 'persist the full state after each super-step, and on the next invocation load the latest snapshot for this thread before continuing.' Memory is loading the snapshot on the *next turn*; crash-recovery is loading the snapshot on *restart* — identical operations on the same per-super-step checkpoints."
                },
                {
                  "prompt": "A chat app serves thousands of users. How does LangGraph keep their conversations separate with one deployed graph, and why is InMemorySaver the wrong checkpointer here?",
                  "solution": "Each user's conversation is a separate **thread**, identified by a distinct `thread_id` passed in the config (`{'configurable': {'thread_id': user_id}}`). The single compiled graph serves all of them: an invoke loads and saves checkpoints scoped to that thread_id, so user A's history never leaks into user B's — threads are independent state timelines (multi-tenancy). InMemorySaver is wrong because it stores checkpoints in a RAM dict that is wiped on process exit and isn't shared across server instances: a deploy or crash loses every conversation, and a load-balanced fleet of servers wouldn't see each other's in-memory state. Production needs a shared, durable backend (PostgresSaver or similar) so threads persist across restarts and are visible to all instances."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg6l1-i1",
              "front": "What is a checkpointer?",
              "back": "It persists a snapshot of the full graph state after every super-step, keyed by thread (compile(checkpointer=...)). Gives memory across invokes + crash-resume, automatically."
            },
            {
              "id": "lg6l1-i2",
              "front": "What is a thread?",
              "back": "A series of checkpoints under a thread_id (config: {'configurable': {'thread_id': ...}}) — one independent state timeline (a conversation/session/user). Enables multi-tenancy from one graph."
            },
            {
              "id": "lg6l1-i3",
              "front": "Checkpointer backends?",
              "back": "InMemorySaver (RAM, dev/test, wiped on exit), SqliteSaver (local file, single node), PostgresSaver/DB (production, shared, durable). Same graph code; swap the backend."
            },
            {
              "id": "lg6l1-i4",
              "front": "What is durable execution in LangGraph?",
              "back": "State is checkpointed each super-step, so a crash resumes from the last completed super-step (re-invoke same thread → load latest checkpoint → continue). Same as cloud event-sourcing/checkpointing."
            }
          ]
        },
        {
          "id": "lg6l2",
          "title": "Memory: Short-Term, Long-Term & the Context Window",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Short-term vs long-term memory",
              "statement": "**Short-term memory** is *within a thread*: the checkpointed state — chiefly the accumulating message history — that gives a single conversation continuity. **Long-term memory** is *across threads*: facts that should persist beyond one session (a user's name, preferences, learned facts), kept in a separate **store** (e.g. LangGraph's `BaseStore`/`InMemoryStore`) and retrieved into context when relevant. Short-term is the thread; long-term is a cross-thread knowledge base the agent reads and writes."
            },
            {
              "type": "text",
              "heading": "The context window forces curation",
              "body": "Short-term memory has a hard ceiling: the message history grows with every turn (Unit 1), but the model's **context window** is finite. Sooner or later the accumulated history won't fit — and even before it overflows, a bloated context raises cost, latency, and the \"lost-in-the-middle\" risk (Unit 3). So memory is *not* \"save everything and replay it.\" You must **bound** the working context by one of: **trimming** (drop the oldest messages), **summarizing** (replace old turns with a compact summary message), or **selective retrieval** (RAG over the history — fetch only the relevant past). Each trades completeness for fit."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Memory must be bounded",
              "statement": "If a conversation accumulates messages at a roughly constant rate, the raw history grows without bound (Θ(turns)), but the model's context window is a fixed size W. Therefore a long-running thread *must* reduce its working context — by trimming, summarizing, or retrieval — to stay within W; unbounded accumulation is not a viable strategy.",
              "proof": "Let each turn add a roughly constant number of tokens t; after n turns the raw history is ≈ t·n tokens, which grows linearly without bound. The model accepts at most W tokens of context (a fixed constant). Once t·n > W, the full history cannot be sent — the call fails or must be truncated. Since n increases over the life of a thread, every long-running conversation eventually crosses W, so it must apply a bounding operation: trimming keeps only the last k messages (constant size), summarizing replaces the old prefix with an O(1) summary, retrieval injects only the top-k relevant past messages — each keeps the working context O(1) in the number of turns rather than Θ(n). ∎\n\nThis is the same bounded-resource discipline as caching and the leaky-bucket ceiling in the cloud course: a fixed-capacity resource (the window) forces you to curate what occupies it."
            },
            {
              "type": "decision",
              "heading": "Bounding the working context",
              "rows": [
                [
                  "Trim",
                  "Keep the last k messages, drop older ones. Simple and cheap; loses early context entirely."
                ],
                [
                  "Summarize",
                  "Replace old turns with a running summary message. Preserves the gist compactly; costs a model call and loses detail."
                ],
                [
                  "Selective retrieval (RAG over history)",
                  "Embed past turns; fetch only those relevant to the current query. Scales to long histories; adds retrieval machinery (Unit 3) and its failure modes."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Memory is curation, not hoarding.** Because the context window is fixed, the question is never \"how do I keep everything?\" but \"what does this turn actually need?\" — recent messages (trim), the gist (summarize), and the relevant past + durable facts (retrieve / long-term store). Decide *what to remember* deliberately, the same way caching decides what's worth keeping warm."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Distinguish short-term and long-term memory in LangGraph, and give an example fact that belongs in each.",
                  "solution": "**Short-term memory** is within a single thread — the checkpointed state, chiefly the accumulating message history — giving *this* conversation continuity. Example: 'three messages ago the user said they're comparing plan A vs plan B' (relevant to the current turn, scoped to this session). **Long-term memory** is across threads — facts persisted in a separate store and retrieved when relevant, surviving beyond one session. Example: 'this user's name is Alice and she prefers metric units' (should be remembered next week in a new conversation). Short-term lives in the thread's checkpoint; long-term lives in a cross-thread store the agent reads/writes."
                },
                {
                  "prompt": "Why can't a long-running chatbot simply keep appending every message to its context forever, and what are two ways to handle it?",
                  "solution": "Because the raw history grows linearly with the number of turns (Θ(turns)) while the model's **context window is a fixed size W** — so eventually the accumulated history exceeds W and can't be sent (the call fails or must be truncated), and well before that a bloated context inflates cost, latency, and lost-in-the-middle errors. The history must be **bounded** to stay within W. Two ways: (1) **trim** — keep only the last k messages and drop older ones (constant size, but loses early context); (2) **summarize** — periodically replace the old prefix with a compact running summary message (preserves the gist in O(1) space, at the cost of a model call and some detail). A third is **selective retrieval** (RAG over the history). Each keeps the working context roughly constant in the number of turns instead of growing without bound — the same fixed-capacity discipline as caching."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg6l2-i1",
              "front": "Short-term vs long-term memory?",
              "back": "Short-term: within a thread — the checkpointed message history (one conversation's continuity). Long-term: across threads — facts in a separate store, retrieved when relevant (persist beyond a session)."
            },
            {
              "id": "lg6l2-i2",
              "front": "Why must memory be bounded?",
              "back": "Raw history grows Θ(turns) but the context window is fixed (W); a long thread eventually exceeds W (and bloats cost/latency). Must trim/summarize/retrieve to keep working context O(1) in turns."
            },
            {
              "id": "lg6l2-i3",
              "front": "Three ways to bound the working context?",
              "back": "Trim (keep last k messages), summarize (replace old turns with a running summary), selective retrieval (RAG over history — fetch only relevant past). Each trades completeness for fit."
            },
            {
              "id": "lg6l2-i4",
              "front": "Memory as curation, not hoarding?",
              "back": "The fixed context window means the question is 'what does this turn need?' — recent (trim), gist (summarize), relevant past + durable facts (retrieve/long-term store) — like caching deciding what to keep warm."
            }
          ]
        },
        {
          "id": "lg6l3",
          "title": "Human-in-the-Loop: interrupt & Time Travel",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "interrupt",
              "statement": "`interrupt(value)`, called inside a node, **pauses** the graph: it persists the current state via the checkpointer, surfaces `value` to the caller, and the run waits — indefinitely — for a human. You resume by invoking the graph on the *same thread* with `Command(resume=answer)`; execution continues from exactly the interrupt point, with `interrupt` now returning `answer`. It is the primitive for approvals, edits, and any \"ask a human\" step."
            },
            {
              "type": "code",
              "heading": "An approval gate with interrupt",
              "lang": "python",
              "code": "from langgraph.types import interrupt, Command\n\ndef approve_payment(state) -> dict:\n    decision = interrupt({\"action\": \"pay\", \"amount\": state[\"amount\"]})  # PAUSE here\n    if decision != \"approve\":\n        return {\"messages\": [(\"ai\", \"Payment cancelled by reviewer.\")]}\n    return {\"messages\": [(\"ai\", make_payment(state[\"amount\"]))]}\n\n# The run pauses at the interrupt and persists. Later, on the SAME thread:\ngraph.invoke(Command(resume=\"approve\"), config)   # resumes -> executes payment\n# (a different resume value, e.g. \"reject\", takes the other branch)"
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "interrupt requires a checkpointer — the pause is durable",
              "statement": "A human-in-the-loop pause is only useful if it can wait minutes, hours, or across a restart for the human — which requires the state to be **persisted**. So `interrupt` depends on a checkpointer: the pause saves the full state to the thread, and `Command(resume=...)` reloads it and continues. Without a checkpointer there is nothing to persist the pause, and the feature cannot work.",
              "proof": "When `interrupt` is hit, the graph must stop and later continue from *exactly* that point, possibly after the process has been idle or restarted (a human may approve tomorrow). 'Continue from exactly that point' means the complete state at the interrupt must be available later — i.e. it must be checkpointed. The checkpointer persists the state of the current super-step to the thread when the interrupt fires; resuming invokes the same thread with `Command(resume=answer)`, which loads that checkpoint and re-enters the interrupted node, with `interrupt` returning `answer`. With no checkpointer, the state lives only in the in-flight call's memory, so the pause cannot outlive the call and resumption is impossible. Hence human-in-the-loop is built *on* persistence — the same durable-execution mechanism as Lesson 1. ∎"
            },
            {
              "type": "diagram",
              "kind": "sequence",
              "caption": "Human-in-the-loop via interrupt + checkpointer. A node calls interrupt(), which persists the state and pauses the run; the reviewer can respond hours later (or after a restart). Command(resume=...) reloads the checkpointed state and continues from exactly the interrupt point — durable execution applied to approval gates.",
              "actors": [
                "Graph",
                "Checkpointer",
                "Reviewer"
              ],
              "messages": [
                {
                  "from": "Graph",
                  "to": "Checkpointer",
                  "label": "save state (interrupt)",
                  "tone": "sage",
                  "dashed": true
                },
                {
                  "note": "paused — durable; may wait hours / survive a restart"
                },
                {
                  "from": "Graph",
                  "to": "Reviewer",
                  "label": "approve payment of $5,000?",
                  "tone": "gold"
                },
                {
                  "from": "Reviewer",
                  "to": "Graph",
                  "label": "Command(resume='approve')",
                  "tone": "gold"
                },
                {
                  "from": "Checkpointer",
                  "to": "Graph",
                  "label": "reload state",
                  "tone": "sage",
                  "dashed": true
                },
                {
                  "note": "resumes from exactly the interrupt point -> execute"
                }
              ]
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Time travel",
              "statement": "Because every super-step is checkpointed, you can **time-travel** the thread: `graph.get_state_history(config)` lists past checkpoints (newest first); you can **replay** from any of them by invoking with that checkpoint's config, or **fork** an alternate future by calling `graph.update_state(config, values)` to edit the state at a point and continue from there. This powers debugging (\"what was the state when it went wrong?\"), what-if exploration, and human edits to an agent's trajectory."
            },
            {
              "type": "callout",
              "tone": "danger",
              "body": "**Gate every irreversible action behind a human interrupt.** Unit 2 warned that an un-guarded \"delete/pay/send\" tool is one hallucinated call from disaster; `interrupt` is the fix — pause for explicit approval before the action, and (because of the checkpointer) the pause is durable and resumable. Combine it with the recursion limit (always halts) and argument validation for a defense-in-depth agent (cloud Unit 9)."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Why does interrupt() (a human-in-the-loop pause) require a checkpointer? Walk through pause and resume.",
                  "solution": "Because a human pause must be able to wait — minutes, hours, or across a process restart — and then continue from *exactly* where it paused, which requires the full state at the interrupt to be **persisted**; the checkpointer is what persists it. Walk-through: when a node calls `interrupt(value)`, the engine saves the current state to the thread (via the checkpointer), surfaces `value` to the caller, and stops — the run is now durably paused, not holding any in-memory call. Later, the application invokes the graph on the **same thread** with `Command(resume=answer)`; the engine loads the checkpointed state, re-enters the interrupted node, and `interrupt` now returns `answer`, so execution continues from precisely that point. Without a checkpointer, the paused state would exist only in the original call's memory and couldn't survive the wait, so resumption — and thus human-in-the-loop — would be impossible."
                },
                {
                  "prompt": "An agent can issue refunds. Design the human-in-the-loop control, and explain how it combines with the recursion limit and argument validation for safety.",
                  "solution": "Put an **interrupt** before the irreversible action: in the refund node (or a dedicated approval node), call `interrupt({'action': 'refund', 'amount': amount, 'order': order_id})` to pause and surface the proposed refund to a human reviewer; the run persists (checkpointer) and waits. The reviewer resumes with `Command(resume='approve')` (execute the refund) or `'reject'` (take the cancel branch) — possibly hours later, durably. Defense in depth (cloud Unit 9): (1) **argument validation** ensures the refund amount/order are well-formed and within policy *before* the human even sees it (catch hallucinated/out-of-range args at the tool boundary); (2) the **recursion limit** guarantees the surrounding agent loop always halts, so a confused agent can't spin forever proposing refunds; (3) the **interrupt** guarantees no refund executes without explicit human approval. Together: the loop can't run away (limit), bad arguments can't slip through (validation), and the irreversible action can't happen unapproved (interrupt) — each an independent layer, the security composition of cloud Unit 9."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg6l3-i1",
              "front": "What does interrupt() do?",
              "back": "Called in a node, it pauses the graph, persists the state (via the checkpointer), and surfaces a value to the caller; resume with Command(resume=answer) on the same thread, continuing from exactly that point (interrupt returns answer)."
            },
            {
              "id": "lg6l3-i2",
              "front": "Why does interrupt require a checkpointer?",
              "back": "The pause must wait (minutes/hours/across restart) and resume from exactly that point — so the full state must be persisted. The checkpointer persists it; without one the pause can't outlive the call."
            },
            {
              "id": "lg6l3-i3",
              "front": "What is time travel in LangGraph?",
              "back": "Using checkpoints: get_state_history lists past states; replay from any checkpoint, or update_state to edit/fork an alternate continuation. Powers debugging, what-if, and human edits."
            },
            {
              "id": "lg6l3-i4",
              "front": "How to safely allow an irreversible agent action?",
              "back": "Gate it behind a human interrupt (approval), with argument validation (catch bad args) and the recursion limit (always halts) — independent defense-in-depth layers (cloud Unit 9)."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg6-check",
        "questions": [
          {
            "id": "lg6q1",
            "type": "mcq",
            "prompt": "A checkpointer in LangGraph does what?",
            "options": [
              "saves a snapshot of the full graph state after every super-step (keyed by thread), giving memory across invocations and resume-after-crash",
              "caches the model's responses to save tokens",
              "limits how many super-steps the graph can run",
              "validates the state schema at compile time"
            ],
            "answer": 0,
            "explanation": "The checkpointer persists per-super-step state per thread — the basis of both conversational memory (load on next turn) and durable execution (resume after crash)."
          },
          {
            "id": "lg6q2",
            "type": "short",
            "prompt": "The id that groups one conversation/session's checkpoints (so thousands of users get isolated state from one graph) is the ____ id.",
            "accept": [
              "thread",
              "thread_id",
              "thread id"
            ],
            "explanation": "A thread_id identifies an independent state timeline; invoking with the same thread continues it, a new one starts fresh."
          },
          {
            "id": "lg6q3",
            "type": "mcq",
            "prompt": "Why does interrupt() (the human-in-the-loop pause) require a checkpointer?",
            "options": [
              "the pause persists the full state, so the run can wait (even across a restart) and resume from exactly where it paused",
              "the checkpointer makes the model respond faster",
              "interrupt deletes the state, which the checkpointer restores",
              "it doesn't — interrupt works without persistence"
            ],
            "answer": 0,
            "explanation": "A durable pause needs the state saved so a human can respond later and the run can resume from the interrupt point — that's the checkpointer."
          },
          {
            "id": "lg6q4",
            "type": "short",
            "prompt": "A model's context window is finite, so a thread's ever-growing message history must be bounded — name one strategy (besides retrieval): ____.",
            "accept": [
              "trim",
              "summarize",
              "summarise",
              "trimming",
              "summarizing",
              "summarization",
              "summary",
              "truncate"
            ],
            "explanation": "Trimming (keep last k) or summarizing (compress old turns) keeps the working context within the window; raw unbounded accumulation eventually overflows W."
          },
          {
            "id": "lg6q5",
            "type": "open",
            "points": 3,
            "prompt": "Design the persistence and human-oversight layer for a customer-service agent that can issue refunds and send emails (both irreversible). Cover memory across turns, multi-user isolation, approval gating, and crash resilience.",
            "rubric": [
              "Memory + multi-user: compile with a checkpointer and use a per-user thread_id so each customer's conversation is an isolated, persistent thread (short-term memory); a persistent backend (Sqlite/Postgres), not InMemorySaver.",
              "Approval gating: an interrupt before each irreversible action (refund, send email) that pauses for human approval and resumes via Command(resume=...); notes the pause is durable thanks to the checkpointer.",
              "Crash resilience: durable execution — because state is checkpointed per super-step, a crash mid-conversation/mid-action resumes from the last checkpoint on the same thread.",
              "Defense in depth: combines the interrupt with argument validation (well-formed/within-policy amounts) and the recursion limit (the agent loop always halts) — independent layers."
            ],
            "solution": "Compile the agent graph with a **persistent checkpointer** (SqliteSaver for a single node, PostgresSaver for a fleet — never InMemorySaver, which is wiped on restart) and run every customer in their own **thread** via `config = {'configurable': {'thread_id': customer_id}}`. That gives, from one deployed graph: short-term **memory across turns** (each invoke loads the customer's checkpointed history) and **multi-user isolation** (threads are independent timelines). **Approval gating:** before any irreversible action, the agent hits an `interrupt` — e.g. an approval node calls `interrupt({'action':'refund','amount':amt,'order':id})` (and similarly before sending an email), pausing and persisting the state; a human reviewer resumes with `Command(resume='approve')` to execute or `'reject'` to cancel, possibly hours later, because the checkpointer makes the pause durable. **Crash resilience:** since state is checkpointed after every super-step, a crash mid-conversation or mid-action resumes from the last checkpoint on that thread rather than restarting — durable execution. **Defense in depth (cloud Unit 9):** layer the interrupt (no irreversible action without human approval) with **argument validation** (refund amount well-formed and within policy, valid order id — catch hallucinated args at the tool boundary) and the **recursion limit** (the agent loop always halts, so it can't spin forever). Each is an independent barrier: the loop can't run away, bad args can't pass, and irreversible actions can't fire unapproved.",
            "explanation": "Persistent checkpointer + per-user thread_id (memory + isolation + crash-resume), an interrupt before each irreversible action (durable approval), plus validation and the recursion limit — defense in depth."
          },
          {
            "id": "lg6q6",
            "type": "open",
            "points": 3,
            "prompt": "Explain durable execution and time travel in LangGraph, how they both arise from checkpointing, and how this relates to the cloud course's event sourcing / checkpointing.",
            "rubric": [
              "Durable execution: state is persisted after every super-step, so a crash mid-run resumes from the last completed super-step (re-invoke same thread → load latest checkpoint → continue), with no work lost or double-applied.",
              "Time travel: the per-super-step checkpoints form a history — get_state_history lists them; you can replay from a past checkpoint or update_state to fork an alternate continuation (debugging, what-if, human edits).",
              "Both arise from the same fact: a snapshot of the full state is saved at each super-step barrier, so the latest snapshot enables resume and the full sequence enables replay/forking.",
              "Relates to cloud event sourcing/checkpointing: persisting state at well-defined points to enable resume-from-last-checkpoint and replay/rebuild — the same durability pattern, here applied to agent graphs."
            ],
            "solution": "Both come from one fact: the checkpointer saves a **snapshot of the entire state after every super-step**, keyed by thread. **Durable execution** uses the *latest* snapshot: if a run crashes mid-execution, re-invoking with the same thread_id loads the most recent checkpoint and resumes from the last completed super-step — re-running only the unfinished work, with nothing lost (completed steps were saved before the next began, the Unit-4 barrier) and nothing double-applied (the loaded state already reflects them). **Time travel** uses the *whole sequence* of snapshots: `get_state_history` lists the thread's checkpoints (newest first); you can **replay** from any past checkpoint by invoking with its config, or **fork** an alternate future by calling `update_state` to edit the state at a chosen point and continuing — enabling time-travel debugging ('what was the state when it went wrong?'), what-if exploration, and human edits to the agent's trajectory. So one checkpoint-per-super-step gives both: the head of the log → resume; the full log → replay/fork. This is exactly the cloud course's **event sourcing / checkpointing** durability pattern — persist state at well-defined points so you can resume from the last checkpoint and replay/rebuild from history — now applied to agent graphs: LangGraph's per-super-step checkpoints are the durable log, and threads are the per-entity streams.",
            "explanation": "One snapshot per super-step yields durable execution (resume from the latest checkpoint) and time travel (replay/fork over the checkpoint history) — the cloud course's event-sourcing/checkpointing durability, applied to agents."
          }
        ]
      }
    },
    {
      "id": "lg7",
      "title": "Agent Architectures",
      "summary": "The canonical agent patterns as graphs: ReAct and the prebuilt agent, reflection/self-critique, and plan-and-execute — grounded in the foundational papers.",
      "prerequisites": [
        "lg5"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangGraph docs — Prebuilt agents (create_react_agent)",
        "Yao et al. — ReAct (2022); Shinn et al. — Reflexion (2023); Wang et al. — Plan-and-Solve (2023)"
      ],
      "lessons": [
        {
          "id": "lg7l1",
          "title": "ReAct & the Prebuilt Agent",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "ReAct (Reason + Act)",
              "statement": "**ReAct** (Yao et al., 2022) interleaves **reasoning** (the model thinks about what to do) and **acting** (the model calls a tool and observes the result), in a loop: think → act → observe → think → … This is exactly the cyclic agent of Units 2 and 5. Interleaving beats reason-only (chain-of-thought, which can't gather facts) and act-only (which can't plan): grounding each reasoning step in a real observation curbs hallucination and lets the model course-correct on what it actually finds."
            },
            {
              "type": "text",
              "heading": "ReAct is the default — and you've already built it",
              "body": "The model⇄tools StateGraph you assembled in Unit 5 *is* a ReAct agent: the model reasons and emits tool calls, the tools node acts and returns observations, and the conditional edge loops until the model answers. ReAct is the workhorse architecture for tool-using agents because most real tasks are \"figure out what you need, fetch it, decide, repeat.\" Because it's so common, LangGraph ships a **prebuilt** that constructs this graph for you."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "create_react_agent",
              "statement": "`create_react_agent(model, tools, prompt=..., checkpointer=...)` (from `langgraph.prebuilt`) builds and compiles the standard ReAct StateGraph — the model node, the tool node, the conditional loop, the message-accumulating state — and returns it as a ready agent. It accepts the same building blocks you'd wire by hand (a model, a tool list, an optional system prompt, a checkpointer for memory), plus options like structured output. It is the fast path to a working agent."
            },
            {
              "type": "code",
              "heading": "The prebuilt ReAct agent",
              "lang": "python",
              "code": "from langgraph.prebuilt import create_react_agent\nfrom langgraph.checkpoint.memory import InMemorySaver\n\nagent = create_react_agent(\n    model=\"anthropic:claude-sonnet-4-5\",\n    tools=[get_weather, search_docs],\n    prompt=\"You are a helpful research assistant.\",\n    checkpointer=InMemorySaver(),   # gives the agent memory across turns\n)\n\nconfig = {\"configurable\": {\"thread_id\": \"1\"}}\nagent.invoke({\"messages\": [(\"user\", \"What's the weather in Paris?\")]}, config)"
            },
            {
              "type": "decision",
              "heading": "Prebuilt agent vs. custom StateGraph",
              "rows": [
                [
                  "create_react_agent (prebuilt)",
                  "Use when the standard ReAct loop fits: a model, some tools, optional memory. Fastest to a working agent; less to get wrong."
                ],
                [
                  "Custom StateGraph",
                  "Use when you need control the prebuilt doesn't give: extra nodes (a planner, a reflector, a router), custom state channels, specific conditional routing, multi-agent, or human-in-the-loop steps beyond the default."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Start with the prebuilt; graduate to a custom graph when you need control.** `create_react_agent` gets you a correct, memory-capable ReAct agent in a few lines — don't hand-roll the loop if the standard one fits. Reach for a custom `StateGraph` only when the architecture itself must change (reflection, planning, multiple agents, bespoke routing) — i.e. when the rest of this unit applies."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What does ReAct interleave, and why does interleaving beat pure reasoning (chain-of-thought) or pure acting?",
                  "solution": "ReAct interleaves **reasoning** (the model thinking about what to do next) and **acting** (calling a tool and observing the result), looping think→act→observe. It beats **pure reasoning** (chain-of-thought) because CoT can only manipulate what the model already 'knows' — it can't fetch a current fact, run a computation, or check the world, so it hallucinates specifics; and it beats **pure acting** because acting without interleaved reasoning can't plan, adapt, or decide *when* it's done. Interleaving grounds each reasoning step in a real observation: the model reasons, acts to get a fact, sees what actually came back, and reasons again — reducing hallucination and letting it course-correct on real results."
                },
                {
                  "prompt": "When should you use create_react_agent versus building a custom StateGraph?",
                  "solution": "Use **create_react_agent** when the standard ReAct loop fits the task — you have a model, a set of tools, optionally memory (a checkpointer) and a system prompt — and you just want a correct, working tool-using agent fast, without hand-wiring the model/tools/conditional-loop. Use a **custom StateGraph** when the *architecture itself* must differ from the plain loop: you need extra nodes (a planner, a reflector/critic, a router/supervisor), custom state channels beyond messages, specific conditional routing, multi-agent coordination, or human-in-the-loop steps the prebuilt doesn't provide. Rule of thumb: prebuilt for the common case (fastest, least to get wrong); custom graph the moment you're changing the shape of the computation — which is exactly what reflection, planning, and multi-agent (the rest of this unit) do."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg7l1-i1",
              "front": "What is ReAct?",
              "back": "Reason + Act: interleave the model reasoning about what to do with acting (tool call) and observing — think→act→observe→think. The cyclic tool-using agent; beats reason-only (can't fetch) and act-only (can't plan)."
            },
            {
              "id": "lg7l1-i2",
              "front": "What does create_react_agent do?",
              "back": "Prebuilt (langgraph.prebuilt) that builds + compiles the standard ReAct StateGraph (model node, tool node, conditional loop, message state) from a model + tools + optional prompt/checkpointer. The fast path to an agent."
            },
            {
              "id": "lg7l1-i3",
              "front": "Why does ReAct's interleaving reduce hallucination?",
              "back": "Each reasoning step is grounded in a real observation from a tool, so the model reasons over actual fetched facts and can course-correct — unlike CoT, which only manipulates parametric memory."
            },
            {
              "id": "lg7l1-i4",
              "front": "Prebuilt agent vs custom graph?",
              "back": "Prebuilt (create_react_agent): the standard loop fits — fastest, least to get wrong. Custom StateGraph: when the architecture must change — extra nodes (planner/reflector/router), custom state/routing, multi-agent, HITL."
            }
          ]
        },
        {
          "id": "lg7l2",
          "title": "Reflection & Self-Critique",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Reflection",
              "statement": "**Reflection** adds a self-critique loop: the agent **generates** an output, then a **reflect** step critiques it (what's wrong, what's missing), then the agent **revises** — repeating until the critique is satisfied or a limit is hit. **Reflexion** (Shinn et al., 2023) formalizes this with *verbal self-feedback* stored in memory across attempts. It is an **actor–critic** structure: a generator proposes, a critic evaluates, and the feedback drives the next attempt."
            },
            {
              "type": "text",
              "heading": "Why a second pass helps",
              "body": "A single forward pass commits to the first plausible answer; a dedicated **critic** pass — prompted specifically to *find faults* — catches errors, omissions, and inconsistencies the generator glossed over, the way a writer editing a draft sees problems they missed while writing. The key is that critique and generation are *different tasks*: asking \"what's wrong with this?\" elicits different, often sharper, model behavior than \"produce an answer.\" Feeding that critique back as guidance measurably improves the next draft on reasoning, code, and writing tasks."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 250,
              "caption": "Reflection as a graph. The generate node produces a draft; the reflect node critiques it; a conditional edge routes back to generate (revise, carrying the critique) if issues remain, or to END if it's good enough. This actor–critic cycle catches errors the first pass missed — and, like any cycle, must be bounded (a max-reflections counter or the recursion_limit).",
              "nodes": [
                {
                  "id": "start",
                  "label": "START",
                  "x": 10,
                  "y": 50,
                  "tone": "muted"
                },
                {
                  "id": "gen",
                  "label": "generate",
                  "x": 40,
                  "y": 50,
                  "tone": "gold"
                },
                {
                  "id": "ref",
                  "label": "reflect",
                  "x": 76,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "end",
                  "label": "END",
                  "x": 40,
                  "y": 90,
                  "tone": "muted"
                }
              ],
              "edges": [
                {
                  "from": "start",
                  "to": "gen"
                },
                {
                  "from": "gen",
                  "to": "ref",
                  "label": "draft",
                  "tone": "gold"
                },
                {
                  "from": "ref",
                  "to": "gen",
                  "label": "needs revision",
                  "tone": "sage"
                },
                {
                  "from": "ref",
                  "to": "end",
                  "label": "good enough",
                  "tone": "muted"
                }
              ]
            },
            {
              "type": "text",
              "heading": "The cost — and bounding it",
              "body": "Reflection is not free: each generate→reflect→revise iteration is *extra model calls*, multiplying latency and token cost per improvement. And it has diminishing returns — the third revision rarely helps as much as the first. So a reflection loop is, again, a **cycle that must be bounded**: cap the iterations (a max-reflections counter or the recursion_limit, Unit 4), and exit as soon as the critic is satisfied. Spend reflection where output quality justifies the cost (final reports, generated code, high-stakes answers), not on every trivial reply."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Reflection trades cost for quality — bound the loop and use it selectively.** The critic pass genuinely improves hard outputs, but every iteration is more calls, more latency, more tokens, with diminishing returns. Cap the number of reflections (it's a cycle — the same termination discipline as Unit 4), exit on a satisfied critique, and reserve it for outputs where the quality gain is worth the spend."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Explain the reflection pattern and why a separate critic pass catches errors the original generation missed.",
                  "solution": "Reflection runs a self-critique loop: **generate** a draft → **reflect** (a step prompted to critique the draft — find errors, omissions, inconsistencies) → **revise** using that critique → repeat until the critique is satisfied or a limit is reached (an actor–critic structure; Reflexion stores the verbal feedback across attempts). A separate critic pass catches what the generator missed because **critique and generation are different tasks**: when generating, the model commits to the first plausible continuation and is biased toward its own output; when explicitly asked 'what is wrong with this?', it engages in a different, fault-finding mode (like an editor reviewing a draft they didn't write), surfacing problems the forward pass glossed over. Feeding that critique back as concrete guidance improves the next draft — measurably so on reasoning, code, and writing."
                },
                {
                  "prompt": "A reflection loop is a cycle. What are its costs, and how do you bound it?",
                  "solution": "Costs: each generate→reflect→revise iteration is **extra model calls**, so reflection multiplies **latency and token cost** per unit of improvement, and it has **diminishing returns** (the first revision helps most; later ones help little). Because it's a **cycle**, it must be bounded exactly like the agent loop of Unit 4: cap the number of iterations with a **max-reflections counter** (or rely on the **recursion_limit** as a backstop), and **exit early** as soon as the critic judges the output good enough (the conditional edge to END). And use it **selectively** — only where output quality justifies the spend (final reports, generated code, high-stakes answers), not on every trivial reply. So: bound the iterations, exit on satisfaction, and apply it where it pays."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg7l2-i1",
              "front": "What is the reflection pattern?",
              "back": "A self-critique loop: generate → reflect (critique) → revise, repeating until satisfied or bounded. Actor–critic; Reflexion stores verbal self-feedback across attempts."
            },
            {
              "id": "lg7l2-i2",
              "front": "Why does a critic pass catch missed errors?",
              "back": "Critique and generation are different tasks: asking 'what's wrong with this?' elicits fault-finding behavior (like an editor) that the committed-to-its-output generation pass glossed over."
            },
            {
              "id": "lg7l2-i3",
              "front": "Reflection's costs and how to bound it?",
              "back": "Extra model calls per iteration (latency + tokens), with diminishing returns. It's a cycle: cap iterations (max-reflections / recursion_limit), exit on a satisfied critique, use selectively where quality justifies cost."
            }
          ]
        },
        {
          "id": "lg7l3",
          "title": "Planning: Plan-and-Execute",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Plan-and-Execute",
              "statement": "**Plan-and-execute** first generates an explicit multi-step **plan**, then **executes** the steps in order (each possibly a tool call or a sub-agent), optionally **re-planning** when reality diverges from the plan. It contrasts with ReAct, which decides *one step at a time* with no plan. Plan-and-Solve (Wang et al., 2023) showed that prompting a model to lay out a plan before acting improves performance on complex, multi-step tasks."
            },
            {
              "type": "text",
              "heading": "Why plan up front",
              "body": "For a long, structured task, deciding each step reactively (ReAct) risks **losing the thread** — the model wanders, repeats work, or forgets the overall goal across many turns. An explicit plan (a) keeps the agent **on track** toward the goal, (b) makes the trajectory **legible** (you can inspect and edit the plan, e.g. via a human interrupt), (c) lets **independent steps run in parallel** (fan out with `Send`, Unit 5), and (d) separates an expensive **planner** model from cheaper **executor** calls. The cost is **rigidity**: a flawed plan cascades, so robust plan-execute systems **re-plan** when a step's result invalidates the plan."
            },
            {
              "type": "decision",
              "heading": "ReAct vs. plan-and-execute (vs. reflection)",
              "rows": [
                [
                  "ReAct (reactive)",
                  "Decide one step at a time, grounded in observations. Best for short, interactive, tool-driven tasks; flexible, but can wander on long tasks."
                ],
                [
                  "Plan-and-execute (deliberative)",
                  "Plan all steps up front, then execute (and re-plan). Best for long, structured, multi-step tasks; legible and parallelizable, but rigid — needs re-planning."
                ],
                [
                  "Reflection (iterative refinement)",
                  "Generate → critique → revise. Best for quality-critical *outputs* (reports, code). Composes with the others (reflect on a plan, or on a ReAct answer)."
                ]
              ]
            },
            {
              "type": "text",
              "heading": "Architectures compose",
              "body": "These are not mutually exclusive — they're building blocks. A plan-and-execute agent can make **each plan step a ReAct sub-agent** (deliberate at the top, react within a step); a **reflection** loop can wrap either (critique the final report, or critique the plan before executing it); a planner can fan its independent steps out with **Send** for parallel execution. The skill is matching structure to the task — reactive for short tool-use, deliberative for long structured work, reflective for high-stakes output — and composing them, all on the same StateGraph substrate."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Match the architecture to the task; they compose on one graph.** ReAct for short, interactive, tool-driven work; plan-and-execute for long, structured, multi-step tasks (with re-planning for robustness); reflection for quality-critical outputs. They're not rivals — a planner whose steps are ReAct agents, wrapped in a reflection loop, is a common, powerful combination, all expressed as a StateGraph."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "How does plan-and-execute differ from ReAct, and for what kind of task is each better suited?",
                  "solution": "**ReAct** decides **one step at a time**, reactively, grounding each decision in the latest observation — there is no up-front plan. **Plan-and-execute** first generates an **explicit multi-step plan**, then executes the steps in order (re-planning if results diverge). ReAct is better for **short, interactive, tool-driven** tasks where flexibility matters and the path is unpredictable — but it can wander or lose the goal on long tasks. Plan-and-execute is better for **long, structured, multi-step** tasks: the plan keeps the agent on track toward the goal, makes the trajectory legible (inspectable/editable), allows independent steps to run in parallel, and separates an expensive planner from cheaper executors — at the cost of rigidity (a flawed plan cascades, so re-planning is needed). Short reactive tool-use → ReAct; long deliberate workflows → plan-and-execute."
                },
                {
                  "prompt": "Design an architecture for an agent that writes a well-researched, polished market report. Justify your choice and note how the patterns compose.",
                  "solution": "Compose all three patterns on one StateGraph. **Plan-and-execute** at the top: a planner decomposes the report into sections/research questions (a legible, multi-step plan) — appropriate because writing a report is a long, structured task where reacting step-by-step would wander. **ReAct within each step**: each research step is a ReAct sub-agent that searches/retrieves (Unit 3 RAG) and reasons over real findings to draft its section — grounding content in evidence. Fan the **independent research steps out in parallel** with `Send` (Unit 5) since sections are largely independent, merging results via an accumulating reducer (map-reduce). Then a **reflection** loop wraps the assembled draft: a critic pass checks accuracy, completeness, and coherence, and routes back for revision until good enough or a max-reflections bound — appropriate because the *output quality* is high-stakes. Bound every loop (recursion_limit / max-reflections), and optionally add a human **interrupt** (Unit 6) to approve the plan before the expensive research runs. Justification: deliberative planning keeps a long task on track and parallelizable, ReAct grounds each section in real research, and reflection earns the final polish — each pattern applied where it pays, all on the same graph substrate."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg7l3-i1",
              "front": "What is plan-and-execute?",
              "back": "Generate an explicit multi-step plan up front, then execute the steps in order (re-planning if results diverge). Contrasts with ReAct's one-step-at-a-time. (Plan-and-Solve, 2023.)"
            },
            {
              "id": "lg7l3-i2",
              "front": "Why plan up front for complex tasks?",
              "back": "Keeps the agent on track (doesn't wander/forget the goal), makes the trajectory legible/editable, lets independent steps run in parallel (Send), and separates an expensive planner from cheap executors. Cost: rigidity → re-plan."
            },
            {
              "id": "lg7l3-i3",
              "front": "ReAct vs plan-and-execute vs reflection — when each?",
              "back": "ReAct: short, interactive, tool-driven (flexible, can wander). Plan-execute: long, structured, multi-step (legible, parallel, but rigid). Reflection: quality-critical outputs (reports/code)."
            },
            {
              "id": "lg7l3-i4",
              "front": "Do the architectures compose?",
              "back": "Yes — a planner whose steps are ReAct sub-agents, fanned out with Send, wrapped in a reflection loop, with a human interrupt to approve the plan. All on one StateGraph; match structure to task."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg7-check",
        "questions": [
          {
            "id": "lg7q1",
            "type": "short",
            "prompt": "The dominant agent pattern that interleaves Reasoning (thoughts) and Acting (tool calls + observations) in a loop is called ____.",
            "accept": [
              "ReAct",
              "react",
              "Reason+Act",
              "reason and act"
            ],
            "explanation": "ReAct (Yao et al. 2022): think → act → observe → think. It's the cyclic tool-using agent from Units 2 and 5."
          },
          {
            "id": "lg7q2",
            "type": "mcq",
            "prompt": "create_react_agent (from langgraph.prebuilt) is:",
            "options": [
              "a prebuilt that builds and compiles the standard model⇄tools ReAct StateGraph from a model + tools (+ optional prompt/checkpointer)",
              "a function that fine-tunes the model on your tools",
              "a way to run multiple models in parallel",
              "a vector store for tool results"
            ],
            "answer": 0,
            "explanation": "It assembles the standard ReAct graph (model node, tool node, conditional loop, message state) for you — the fast path to a tool-using agent."
          },
          {
            "id": "lg7q3",
            "type": "mcq",
            "prompt": "A reflection (self-critique) agent improves output quality by:",
            "options": [
              "adding a critic pass that critiques the draft, then a revise step that fixes it — looping until good enough (bounded)",
              "raising the temperature so the model is more creative",
              "calling more tools per step",
              "increasing the recursion limit"
            ],
            "answer": 0,
            "explanation": "Generate → reflect (critique) → revise, repeating (bounded). The critic pass is a different task that catches errors the generation pass missed."
          },
          {
            "id": "lg7q4",
            "type": "short",
            "prompt": "Unlike ReAct (which decides one step at a time), the plan-and-execute architecture first generates an explicit multi-step ____.",
            "accept": [
              "plan",
              "Plan"
            ],
            "explanation": "Plan-and-execute plans all steps up front, then executes (and re-plans) — better for long, structured tasks; ReAct decides reactively."
          },
          {
            "id": "lg7q5",
            "type": "open",
            "points": 3,
            "prompt": "Choose and design an agent architecture for a coding assistant that, given a bug report, must locate the bug across a codebase, fix it, and verify the fix passes tests. Justify your choice over the alternatives, and bound any loops.",
            "rubric": [
              "Chooses a sensible architecture (likely ReAct or plan-and-execute, often with reflection), and justifies it against the task: locating + fixing + verifying is multi-step and tool-driven (search code, edit, run tests).",
              "Specifies the tools/nodes (search/grep, read file, edit, run tests) and the loop: act (e.g. run tests) → observe (failures) → reason → revise, grounded in real observations (ReAct), or a plan (locate → fix → verify) with re-planning.",
              "Uses reflection/verification appropriately: the test run IS an objective critic — fix → run tests → if failing, revise (a reflection/verify loop with a real signal, not just the model's opinion).",
              "Bounds the loops (recursion_limit / max attempts) since fix→test→revise is a cycle with no guaranteed termination, and handles the give-up case (escalate / report)."
            ],
            "solution": "Use a **ReAct agent with a verify (reflection) loop**, optionally under a light plan. The task — locate, fix, verify — is multi-step and tool-driven, with an *objective* success signal (the tests), which makes it ideal for grounded reaction plus verification. Tools/nodes: `search_code`/`grep` and `read_file` (locate), `edit_file` (fix), `run_tests` (verify). Flow: (1) optionally a small **plan** — locate → fix → verify — to keep it on track; (2) **ReAct** to locate the bug: the model searches/reads, reasoning over real code (grounded, not hallucinated); (3) propose an edit; (4) **run the tests** — this is the key: the test run is an *objective critic*, so this is a reflection/verify loop with a real signal rather than the model's self-opinion. Conditional edge: if tests **pass** → END (done); if they **fail** → feed the failures back and **revise** (back to locate/fix) — the cycle. Because fix→test→revise is a **cycle with no guaranteed termination** (the model might never produce a passing fix), bound it: a max-attempts counter / the **recursion_limit**, and on exhaustion **give up gracefully** — report the attempted fix and remaining failures, or escalate to a human (a human **interrupt** before committing the change is also wise). I'd prefer this over pure plan-and-execute (the path is too unpredictable to fully plan up front — you discover the bug by exploring) and over pure ReAct without verification (you need the objective test signal to know you're actually done, not just the model's claim). So: ReAct for grounded exploration + an objective verify loop for correctness + bounded iterations for termination.",
            "explanation": "ReAct to explore/fix grounded in the code, with the test run as an objective critic in a bounded fix→test→revise loop (real verification signal), escalating on exhaustion."
          },
          {
            "id": "lg7q6",
            "type": "open",
            "points": 3,
            "prompt": "Explain the reflection pattern: why a critic pass improves output, the cost trade-off, and how you bound it. Then explain how reflection, ReAct, and plan-and-execute compose rather than compete.",
            "rubric": [
              "Reflection mechanics: generate → reflect (critique) → revise loop (actor–critic; Reflexion stores verbal feedback), repeating until satisfied or bounded.",
              "Why it works: critique and generation are different tasks; an explicit fault-finding pass catches errors/omissions the committed generation pass missed.",
              "Cost trade-off + bounding: each iteration is extra model calls (latency/tokens) with diminishing returns; it's a cycle, so cap iterations (max-reflections / recursion_limit), exit on a satisfied critique, and use selectively.",
              "Composition: they're building blocks on one StateGraph — e.g. a plan-and-execute agent whose steps are ReAct sub-agents (fanned out with Send), wrapped in a reflection loop; match structure to task."
            ],
            "solution": "**Reflection** runs an actor–critic loop: **generate** a draft → **reflect** (a step prompted to critique it — find errors, omissions, inconsistencies) → **revise** using that critique → repeat until the critique is satisfied or a bound is hit (Reflexion stores the verbal feedback across attempts). It improves output because **critique and generation are different tasks**: while generating, the model commits to its first plausible output and is biased toward it; when explicitly asked 'what's wrong with this?', it engages a fault-finding mode (like an editor reviewing a draft), surfacing problems the forward pass glossed over — and feeding that back as concrete guidance measurably improves the next draft. **Cost trade-off:** every iteration is extra model calls, so reflection multiplies latency and token cost, with diminishing returns (the first revision helps most). Because it's a **cycle**, you **bound** it: a max-reflections counter (or the recursion_limit as a backstop), exit early when the critic is satisfied, and apply it **selectively** — only where output quality justifies the spend. **Composition:** reflection, ReAct, and plan-and-execute are not rivals but building blocks on the same StateGraph substrate. A **plan-and-execute** agent can make each plan step a **ReAct** sub-agent (deliberate at the top, react within a step), fan independent steps out with **Send** for parallelism, and wrap the whole thing in a **reflection** loop that critiques the final output (or the plan before executing). The skill is matching structure to the task — reactive for short tool-use, deliberative for long structured work, reflective for high-stakes output — and combining them, all bounded and all expressed as one graph.",
            "explanation": "Generate→critique→revise (a different task catches missed errors); bound the cycle and use selectively. The three patterns compose on one StateGraph — e.g. a planner of ReAct sub-agents wrapped in reflection."
          }
        ]
      }
    },
    {
      "id": "lg8",
      "title": "Multi-Agent Systems",
      "summary": "When and how to split work across agents: supervisor / swarm / hierarchical architectures, handoffs and subgraphs, and the coordination, cost, and reliability costs of going multi-agent.",
      "prerequisites": [
        "lg7"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangGraph docs — Multi-agent (supervisor, swarm, handoffs)",
        "LangGraph docs — Subgraphs & composition"
      ],
      "lessons": [
        {
          "id": "lg8l1",
          "title": "Why Multi-Agent & the Architectures",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "When one agent isn't enough",
              "body": "A single ReAct agent works well until it doesn't: give it *too many tools* and the model gets confused about which to use; ask it to do *very different sub-tasks* (research, then code, then write) and one prompt/model can't be great at all of them; and a long task crams a *bloated, unfocused context* that hurts quality and cost. **Multi-agent** systems address this by splitting the work across several agents, each with its own focused prompt, tools, and context — coordinating to solve the whole. The benefit is *specialization and context isolation*; the cost (this unit's theme) is *coordination*."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Multi-agent system",
              "statement": "A **multi-agent system** is several agents — each typically its own StateGraph with its own prompt, tools, and (often) state — that coordinate to accomplish a task. They communicate by passing messages/state and by **handing off** control (Lesson 2). The point is to give each agent a *narrow, focused* job so its context and tool set stay manageable, rather than overloading one generalist agent."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Multi-agent architectures",
              "statement": "Common topologies: **Supervisor** — a central router agent delegates each sub-task to the specialized worker best suited to it and collects results (hub-and-spoke; workers don't talk to each other). **Swarm / network** — agents hand off **peer-to-peer**, each transferring control to whichever agent should act next. **Hierarchical** — supervisors managing teams of agents (or sub-supervisors), for large systems. The supervisor pattern is the common default: centralized control is easiest to reason about and debug."
            },
            {
              "type": "diagram",
              "kind": "graph",
              "directed": true,
              "height": 250,
              "caption": "Supervisor architecture. A central supervisor (router) delegates each sub-task to the specialized worker best suited to it (researcher, coder, writer); when a worker finishes it hands control back to the supervisor (via Command(goto='supervisor')), which delegates the next step or routes to END. Hub-and-spoke: workers don't talk to each other — all coordination flows through the supervisor.",
              "nodes": [
                {
                  "id": "sup",
                  "label": "supervisor",
                  "x": 22,
                  "y": 50,
                  "tone": "gold",
                  "sub": "router"
                },
                {
                  "id": "res",
                  "label": "researcher",
                  "x": 72,
                  "y": 16,
                  "tone": "sage"
                },
                {
                  "id": "cod",
                  "label": "coder",
                  "x": 72,
                  "y": 50,
                  "tone": "sage"
                },
                {
                  "id": "wri",
                  "label": "writer",
                  "x": 72,
                  "y": 84,
                  "tone": "sage"
                }
              ],
              "edges": [
                {
                  "from": "sup",
                  "to": "res",
                  "label": "delegate",
                  "tone": "gold"
                },
                {
                  "from": "sup",
                  "to": "cod",
                  "tone": "gold"
                },
                {
                  "from": "sup",
                  "to": "wri",
                  "tone": "gold"
                }
              ]
            },
            {
              "type": "decision",
              "heading": "Supervisor vs. swarm vs. hierarchical",
              "rows": [
                [
                  "Supervisor (hub-and-spoke)",
                  "A router delegates to workers and collects results. Centralized, easy to reason about and debug. The common default."
                ],
                [
                  "Swarm / network (peer-to-peer)",
                  "Agents hand off directly to whichever should act next. Flexible, but harder to trace and reason about (no central controller)."
                ],
                [
                  "Hierarchical (teams of teams)",
                  "Supervisors of supervisors. For large systems that need structure; more coordination layers, more overhead."
                ]
              ]
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**More agents means more coordination and cost — split deliberately, not by default.** Multi-agent is justified when a single agent's tools or context genuinely overload it, or when sub-tasks need truly different prompts/models/tools. It is *not* a free upgrade: every agent adds model calls, handoff complexity, and failure surface (Lesson 3). Start with one well-tooled agent; reach for multi-agent when the specialization gain is real."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What problems does a multi-agent system solve that a single agent struggles with, and what does the supervisor architecture look like?",
                  "solution": "It addresses three single-agent failure modes: **tool overload** (too many tools confuse the model about which to use), **conflicting sub-tasks** (one prompt/model can't be excellent at research *and* coding *and* writing), and **context bloat** (a long task crams an unfocused context that hurts quality and cost). Multi-agent splits the work so each agent has a narrow job with a focused prompt, tool set, and context. The **supervisor architecture** is hub-and-spoke: a central supervisor (router) agent delegates each sub-task to the specialized worker best suited to it (e.g. researcher, coder, writer), each worker hands control back to the supervisor when done (e.g. via Command(goto='supervisor')), and the supervisor delegates the next step or finishes. Workers don't communicate directly — all coordination flows through the supervisor, which makes the system centralized and easy to reason about and debug."
                },
                {
                  "prompt": "Contrast the supervisor and swarm architectures, and say why supervisor is the common default.",
                  "solution": "In a **supervisor** (hub-and-spoke) system, a central router agent decides which worker handles each step; workers only talk to the supervisor, not each other — control always returns to the center. In a **swarm/network**, agents hand off **peer-to-peer**: each agent decides which other agent should act next and transfers control directly, with no central controller. Supervisor is the common **default** because centralized control is much easier to **reason about, trace, and debug**: there's one place where routing decisions are made and one place to inspect, and the flow is legible (delegate → work → return). A swarm is more flexible but its control flow is distributed and emergent, making it harder to predict, trace, and constrain (and easier to get into confusing handoff loops). You reach for swarm/hierarchical only when the task genuinely needs decentralized or large-scale structure."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg8l1-i1",
              "front": "Why split into multiple agents?",
              "back": "To fix single-agent failures: tool overload, conflicting sub-tasks needing different prompts/models, and context bloat. Multi-agent gives each agent a narrow, focused job — specialization + context isolation."
            },
            {
              "id": "lg8l1-i2",
              "front": "The three multi-agent architectures?",
              "back": "Supervisor (central router delegates to workers, hub-and-spoke), swarm/network (peer-to-peer handoffs), hierarchical (supervisors of supervisors). Supervisor is the common default."
            },
            {
              "id": "lg8l1-i3",
              "front": "Why is supervisor the default architecture?",
              "back": "Centralized control is easiest to reason about, trace, and debug — one place makes routing decisions; workers don't talk to each other, so the flow is legible (delegate → work → return)."
            },
            {
              "id": "lg8l1-i4",
              "front": "When is multi-agent NOT worth it?",
              "back": "When a single agent's tools/context don't overload it. Multi-agent adds coordination, cost (more model calls), and failure surface — split only when specialization/isolation gains are real."
            }
          ]
        },
        {
          "id": "lg8l2",
          "title": "Handoffs & Subgraphs",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Handoff",
              "statement": "A **handoff** is one agent transferring control (and some state) to another. In LangGraph it's a **Command** (Unit 5): a node returns `Command(goto=\"other_agent\", update={...})` to route to another agent and pass it context. To hand off *out* of a subgraph to an agent in the parent graph, use `Command(graph=Command.PARENT, goto=...)`. Handoffs are how supervisors delegate and how swarm agents pass the baton — dynamic routing between agents, on shared state."
            },
            {
              "type": "code",
              "heading": "A handoff via Command",
              "lang": "python",
              "code": "from langgraph.types import Command\nfrom typing import Literal\n\ndef supervisor(state) -> Command[Literal[\"researcher\", \"writer\", \"__end__\"]]:\n    target = choose_worker(state)            # which agent should act next?\n    return Command(\n        goto=target,                          # hand off control...\n        update={\"task\": state[\"subtask\"]},    # ...passing the worker its context\n    )"
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Subgraph",
              "statement": "A **subgraph** is a compiled graph used as a **node** inside a parent graph: `builder.add_node(\"researcher\", research_agent)` where `research_agent` is itself a compiled StateGraph. Subgraphs give **composition** (build and test each agent independently, then wire them together) and **state isolation** (a subgraph can have its *own* state schema, with the framework mapping the relevant channels in and out). They are how you assemble a multi-agent system from agent building blocks."
            },
            {
              "type": "code",
              "heading": "An agent as a subgraph node",
              "lang": "python",
              "code": "# research_agent is its own compiled StateGraph (built and tested separately)\nresearch_agent = build_research_agent().compile()\n\nparent = StateGraph(ParentState)\nparent.add_node(\"researcher\", research_agent)   # subgraph as a node\nparent.add_node(\"supervisor\", supervisor)\nparent.add_edge(START, \"supervisor\")\n# supervisor hands off to \"researcher\" (a whole agent) via Command(goto=...)\napp = parent.compile(checkpointer=checkpointer)"
            },
            {
              "type": "text",
              "heading": "Shared vs. isolated state",
              "body": "Two ways agents exchange information. **Shared state**: agents read/write a common channel (typically `messages`) — simple, and the whole history is visible to all, but it *couples* the agents (each sees everyone's context, raising cost and confusion). **Isolated state (subgraphs)**: each agent has its own state schema, and you map only the needed inputs in and outputs out — modular and focused, but you must define the input/output transforms. The trade is the recurring one: shared is simple but coupled; isolated is modular but needs explicit mapping. Prefer isolation for genuinely independent agents; share `messages` when a single conversation is the point."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**Command routes control between agents; subgraphs encapsulate an agent with its own state.** Use a **subgraph** to build an agent as a reusable, independently-testable unit with isolated state; use **Command** (handoff) for the dynamic delegation/routing *between* those units. Together they're the multi-agent toolkit: compose agents as subgraphs, coordinate them with handoffs."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What is a handoff, how is it implemented in LangGraph, and how does it differ from a subgraph?",
                  "solution": "A **handoff** is one agent transferring control (and some context) to another agent. It's implemented with a **Command** (Unit 5): a node returns `Command(goto='other_agent', update={...})` to route to another agent and pass it state (or `Command(graph=Command.PARENT, goto=...)` to hand off out of a subgraph to the parent). It's a *control-flow* action — dynamic routing between agents on shared state. A **subgraph** is different: it's a *structural* unit — a compiled graph used as a node inside a parent graph, giving composition (build/test each agent independently) and state isolation (its own state schema, with channels mapped in/out). In short: the subgraph is *what* an agent is (an encapsulated, reusable graph); the handoff (Command) is *how* control moves between agents at runtime."
                },
                {
                  "prompt": "When should multi-agent communication use shared state versus isolated (subgraph) state? Give the trade-off.",
                  "solution": "Use **shared state** (agents read/write a common channel, typically `messages`) when a **single conversation is the point** and all agents genuinely need the full context — it's simple and everything is visible, but it **couples** the agents: each sees everyone's history, which raises token cost and can confuse a worker with irrelevant context. Use **isolated state** (each agent a **subgraph** with its own schema, mapping only needed inputs in and outputs out) when agents are **genuinely independent** specialists — it keeps each agent's context focused (lower cost, less confusion) and makes them modular and independently testable, at the cost of having to define the input/output transforms between parent and subgraph. Trade-off: shared = simple but coupled (and costlier as context grows); isolated = modular and focused but requires explicit state mapping. Prefer isolation for independent workers; share `messages` when the whole system is really one conversation."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg8l2-i1",
              "front": "What is a handoff and how is it implemented?",
              "back": "One agent transferring control + state to another. Implemented with Command: return Command(goto='agent', update={...}) (or Command(graph=Command.PARENT, goto=...) to hand off to the parent). Dynamic routing between agents."
            },
            {
              "id": "lg8l2-i2",
              "front": "What is a subgraph?",
              "back": "A compiled graph used as a node inside a parent graph (add_node('x', compiled_agent)). Gives composition (build/test agents independently) and state isolation (its own schema, channels mapped in/out)."
            },
            {
              "id": "lg8l2-i3",
              "front": "Shared vs isolated state for agents?",
              "back": "Shared (common channel like messages): simple, full visibility, but couples agents (cost/confusion). Isolated (subgraph, own schema): modular, focused context, but needs input/output mapping. Isolate independent agents; share for one conversation."
            },
            {
              "id": "lg8l2-i4",
              "front": "Command vs subgraph roles?",
              "back": "Subgraph = what an agent is (encapsulated, reusable graph with isolated state). Command/handoff = how control moves between agents at runtime (dynamic delegation/routing). Compose as subgraphs, coordinate with handoffs."
            }
          ]
        },
        {
          "id": "lg8l3",
          "title": "Coordination, Context & Cost",
          "estMinutes": 22,
          "content": [
            {
              "type": "text",
              "heading": "Coordination is the hard part",
              "body": "The agents are the easy bit; making them work *together* is where multi-agent systems get hard. Three recurring problems: **state ownership** (which agent writes which channel — uncontrolled shared writes reintroduce the reducer/race issues of Unit 5), **context passing** (what each agent sees — too much wastes tokens and confuses, too little and it can't do its job), and **history management** (whose messages does each agent get, and how do you keep that bounded — Unit 6). Most multi-agent bugs are coordination bugs, not agent bugs."
            },
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Cost and reliability compound with more agents",
              "statement": "A multi-agent system of N agents has total token cost ≈ Σᵢ (agent i's cost) — strictly more than one agent doing the work — and, if the agents form a dependency chain where each must succeed, an end-to-end reliability ≈ ∏ᵢ aᵢ (the **series-availability** composition of the cloud course). Both cost (a sum) and failure (a downward-compounding product) grow with N, so multi-agent pays off only when specialization gains exceed them.",
              "proof": "Each agent independently consumes tokens for its model calls, so the system's total token cost is the sum over agents (plus coordination overhead) — adding agents only increases cost relative to a single agent that could do the task. For reliability: if the task requires every agent in a chain to produce a correct result for the whole to succeed (a series dependency — the supervisor trusts each worker, each handoff must be right), then by independence the probability all succeed is ∏ᵢ aᵢ, which decreases as N grows since each aᵢ ≤ 1 — exactly the availability tax of a synchronous microservice chain (cloud Unit 7: aᴺ for equal aᵢ). So three agents each 90% reliable in a chain give 0.9³ ≈ 0.73 end-to-end — worse than any one. Cost compounds upward (a sum), reliability compounds downward (a product); multi-agent is justified only when the per-agent benefits (focused context, specialized tools, modularity) outweigh this. ∎"
            },
            {
              "type": "text",
              "heading": "Failure propagation",
              "body": "In a chain of agents, one agent's error doesn't stay local: a bad handoff, a hallucinated sub-result that the supervisor trusts, or a malformed state update cascades downstream — the same way a faulty service corrupts everything that depends on it (cloud Unit 7). So multi-agent systems need **validation at boundaries**: check a worker's output before the supervisor acts on it, validate handoff payloads, and constrain what each agent can write. Treat every handoff as a trust boundary, not an assumption."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**A single well-built agent is the default; multi-agent must earn its keep.** It adds coordination overhead, multiplies cost (a sum over agents), compounds failure (a product down the chain), and enlarges the debugging surface. Reach for it only when a single agent genuinely can't cope — too many tools, irreconcilable sub-tasks, or context that must be isolated — and then validate every handoff as a trust boundary. Don't build a five-agent system where one good ReAct agent would do."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Three agents must each succeed for a task to succeed (a dependency chain), each succeeding with probability 0.9. What is the end-to-end success probability, and what cloud-course concept is this?",
                  "solution": "End-to-end success = 0.9 × 0.9 × 0.9 = 0.9³ = **0.729** (~73%) — worse than any single agent (90%). This is the **series-availability composition** from the cloud course (Unit 2/7): when every component in a chain must succeed, the reliability is the product ∏ aᵢ = aᴺ, which decreases as the chain lengthens. It's the 'availability tax' of synchronous chains, now applied to a chain of agents: more agents in a must-all-succeed pipeline compounds the failure probability downward. (Mitigate as in cloud: validate at each boundary, add retries/fallbacks, or shorten the chain.)"
                },
                {
                  "prompt": "Why are most multi-agent bugs coordination bugs rather than agent bugs, and how does failure propagate?",
                  "solution": "Because the individual agents are usually fine in isolation — the hard part is making them work *together*, which introduces problems that don't exist for a single agent: **state ownership** (which agent writes which channel; uncontrolled shared writes re-create the reducer/race issues of Unit 5), **context passing** (giving each agent the right slice of context — too much wastes tokens and confuses it, too little and it fails), and **history/bounding** across agents (Unit 6). These coordination seams are where things break. **Failure propagates** because agents form a dependency chain: one agent's error — a hallucinated sub-result the supervisor trusts, a bad handoff payload, a malformed state update — is consumed downstream and corrupts everything that depends on it, exactly like a faulty service poisoning its dependents in a microservice chain (cloud Unit 7). The fix is to treat **every handoff as a trust boundary**: validate a worker's output before acting on it, validate handoff payloads, and constrain what each agent can write — rather than assuming each agent's output is correct."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg8l3-i1",
              "front": "The three hard coordination problems?",
              "back": "State ownership (who writes which channel — race/reducer issues), context passing (what each agent sees — too much/little), and history management/bounding across agents. Most multi-agent bugs are coordination bugs."
            },
            {
              "id": "lg8l3-i2",
              "front": "How do cost and reliability scale with more agents?",
              "back": "Cost ≈ Σ agent costs (a sum, grows up). Reliability of a must-all-succeed chain ≈ ∏ aᵢ = aᴺ (a product, compounds down — the cloud series-availability tax). 3 agents at 90% → 0.729."
            },
            {
              "id": "lg8l3-i3",
              "front": "How does failure propagate in multi-agent systems?",
              "back": "One agent's error (bad handoff, hallucinated sub-result the supervisor trusts, malformed update) cascades downstream — like a faulty service corrupting its dependents (cloud Unit 7). Validate every handoff as a trust boundary."
            },
            {
              "id": "lg8l3-i4",
              "front": "Default: single or multi-agent?",
              "back": "Single well-built agent is the default. Multi-agent adds coordination, multiplies cost, compounds failure, and enlarges debugging — use only when one agent genuinely can't cope (tool overload, irreconcilable sub-tasks, context isolation)."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg8-check",
        "questions": [
          {
            "id": "lg8q1",
            "type": "mcq",
            "prompt": "A 'supervisor' multi-agent architecture is:",
            "options": [
              "a central router agent that delegates sub-tasks to specialized workers and collects their results (hub-and-spoke)",
              "many agents sharing one giant prompt and tool list",
              "two copies of the same agent voting on answers",
              "an agent that supervises a human"
            ],
            "answer": 0,
            "explanation": "The supervisor delegates to specialized workers (which don't talk to each other) and routes the next step — centralized, easy to debug. The common default."
          },
          {
            "id": "lg8q2",
            "type": "short",
            "prompt": "One agent transferring control (and context) to another agent is called a ____, implemented in LangGraph with Command(goto=...).",
            "accept": [
              "handoff",
              "hand-off",
              "hand off",
              "Handoff"
            ],
            "explanation": "A handoff is dynamic routing between agents via Command(goto='agent', update={...}); supervisors delegate and swarm agents pass the baton this way."
          },
          {
            "id": "lg8q3",
            "type": "numeric",
            "prompt": "Three agents must each succeed for a task to succeed (a dependency chain); each succeeds with probability 0.9. What is the end-to-end success probability? (to 3 decimals)",
            "answer": 0.729,
            "tolerance": 0.001,
            "explanation": "Series composition: 0.9³ = 0.729 — worse than any single agent. The same availability tax as a synchronous microservice chain (cloud)."
          },
          {
            "id": "lg8q4",
            "type": "mcq",
            "prompt": "When is a single agent usually better than a multi-agent system?",
            "options": [
              "when one agent's tools and context don't overload it — multi-agent adds coordination, multiplies cost, and compounds failure",
              "always — multi-agent never helps",
              "only when there are no tools involved",
              "when you want higher token usage"
            ],
            "answer": 0,
            "explanation": "A single well-built agent is the default; multi-agent earns its keep only when specialization/context-isolation gains exceed the coordination, cost, and failure-compounding costs."
          },
          {
            "id": "lg8q5",
            "type": "open",
            "points": 3,
            "prompt": "Design a multi-agent system for producing a researched, fact-checked article from a topic. Choose an architecture, specify the agents and how they hand off and share state, and address coordination, cost, and failure.",
            "rubric": [
              "Chooses a sensible architecture (e.g. supervisor) with specialized agents (researcher, writer, fact-checker/editor) and justifies the split (different tools/prompts, context isolation).",
              "Specifies handoffs (Command(goto=...) from a supervisor) and state strategy (shared messages vs isolated subgraph state, with reasoning) — agents as subgraphs for modularity.",
              "Addresses coordination: state ownership (who writes what), context passing (each agent gets only what it needs), and validating worker outputs at handoff boundaries.",
              "Addresses cost and failure compounding: more agents = more model calls (sum) and a must-all-succeed chain compounds failure (∏ aᵢ); bounds the overall loop (recursion_limit) and notes when a single agent would suffice."
            ],
            "solution": "Use a **supervisor** architecture with three specialized agents built as **subgraphs**: a **researcher** (tools: web/RAG search — Unit 3 — gathers and cites sources), a **writer** (drafts the article from the research), and a **fact-checker/editor** (verifies claims against the cited sources and critiques — a reflection step, Unit 7). The split is justified: these are genuinely different jobs needing different tools/prompts, and isolating each agent's context keeps it focused (lower cost, less confusion). **Coordination:** the supervisor delegates via `Command(goto='researcher'|'writer'|'fact_checker', update={...})`, passing each worker only the context it needs; workers hand back with `Command(goto='supervisor')`. Use **isolated subgraph state** for researcher/writer (their internals don't belong in a shared history) but pass the draft + sources explicitly between them; define clearly **who owns which channel** (e.g. the supervisor owns the article + sources channels) to avoid uncontrolled shared writes (Unit 5 reducer/race issues). **Validate at boundaries:** the fact-checker validates the writer's claims against the researcher's sources *before* the supervisor accepts the article — treating each handoff as a trust boundary so a hallucinated fact doesn't cascade (Unit 7 failure propagation). **Cost & failure:** this is several agents, so cost is the sum of their calls and a must-all-succeed chain compounds failure (∏ aᵢ) — so bound the overall loop with the **recursion_limit**, let the fact-check loop revise a bounded number of times, and add retries on transient failures. Note when this is over-engineering: for a *short* factual answer, a single ReAct agent with a search tool would do — reserve the three-agent system for genuinely long, multi-faceted articles where the specialization and fact-checking earn their cost.",
            "explanation": "Supervisor + researcher/writer/fact-checker subgraphs, Command handoffs with explicit state ownership, fact-check as a validating trust boundary, bounded loops, and the honesty that a single agent suffices for simple cases."
          },
          {
            "id": "lg8q6",
            "type": "open",
            "points": 3,
            "prompt": "Explain why multi-agent systems compound both cost and failure as you add agents, relating each to the cloud course, and state the rule of thumb for when multi-agent is justified.",
            "rubric": [
              "Cost compounds upward: each agent makes its own model calls, so total cost ≈ the sum over agents (plus coordination) — strictly more than one agent doing the work; ties to token-cost accounting.",
              "Reliability compounds downward: a must-all-succeed chain of agents has end-to-end reliability ≈ ∏ aᵢ (= aᴺ), decreasing with N — the cloud series-availability tax (Unit 2/7).",
              "Failure propagation: one agent's error cascades to dependents (a bad handoff / hallucinated sub-result the supervisor trusts), like a faulty service in a chain — so validate at each boundary.",
              "Rule of thumb: a single well-built agent is the default; multi-agent is justified only when specialization / context-isolation gains exceed the coordination, cost, and failure-compounding costs."
            ],
            "solution": "**Cost compounds upward** because each agent independently makes model calls, so the system's total token cost is the **sum** over all agents (plus coordination overhead) — adding agents can only increase cost relative to one agent doing the task; since LLM tokens dominate an agent's cost, more agents = more calls = more money (the token-accounting point of Unit 9). **Reliability compounds downward** because, when the task requires *every* agent in a chain to produce a correct result (a series dependency — the supervisor trusts each worker, each handoff must be right), the probability all succeed is the **product** ∏ aᵢ (= aᴺ for equal reliabilities), which *decreases* as N grows since each aᵢ ≤ 1 — exactly the **series-availability tax** of a synchronous microservice chain in the cloud course (Unit 2/7), e.g. three 90%-reliable agents give 0.9³ ≈ 0.73. And **failure propagates**: one agent's error — a hallucinated sub-result the supervisor accepts, a bad handoff payload — cascades to everything downstream, like a faulty service corrupting its dependents, so each handoff must be treated as a trust boundary with validation. So cost is a sum that grows and reliability is a product that shrinks as you add agents. **Rule of thumb:** a single well-built agent (e.g. a ReAct agent with well-described tools) is the default; multi-agent is justified *only* when the specialization and context-isolation benefits — too many tools for one model, irreconcilable sub-tasks, context that must be kept separate — clearly outweigh the added coordination overhead, the summed cost, and the compounded failure. Don't build five agents where one good one would do.",
            "explanation": "Cost = sum over agents (grows up); must-all-succeed reliability = ∏ aᵢ (shrinks down, the cloud series tax); errors cascade across handoffs. Default to one good agent; split only when specialization clearly wins."
          }
        ]
      }
    },
    {
      "id": "lg9",
      "title": "Evaluation, Observability & Production",
      "summary": "Make agents measurable and shippable: evaluation as the agent's test suite, tracing/streaming for observability, and the cost/latency/reliability discipline of treating an agent as a distributed system.",
      "prerequisites": [
        "lg7"
      ],
      "masteryThreshold": 0.85,
      "references": [
        "LangChain docs — Evaluation & LangSmith tracing",
        "LangGraph docs — Streaming & deployment"
      ],
      "lessons": [
        {
          "id": "lg9l1",
          "title": "Evaluation: Measuring Agent Quality",
          "estMinutes": 24,
          "content": [
            {
              "type": "text",
              "heading": "You can't improve what you don't measure",
              "body": "Agents are **non-deterministic** (the model samples) and **open-ended** (many valid outputs), so you can't unit-test exact strings. Yet you still must know whether a change made the agent *better* or *worse*, and whether yesterday's fix broke something else. **Evaluation** is the answer: it is to agents what tests are to code — a measurable, repeatable check of quality that you run on every change. Without it, \"the agent feels better now\" is the entire quality process, and regressions ship silently."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Evaluation",
              "statement": "**Evaluation** measures an agent's quality against a **dataset** of inputs paired with reference outputs or success criteria. Three pieces: the **dataset** (representative inputs + expected answers/criteria), one or more **evaluators** (functions that score the agent's output — exact match, a metric, or an LLM judge), and the **target** (the agent under test). You run the target over the dataset, score each result, and aggregate — the agent's test suite."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "What to measure",
              "statement": "Agent quality has several axes: **final-answer correctness** (is the answer right?), **trajectory / step correctness** (did it take sensible steps and call the *right* tools, not just luck into the answer?), **tool-call accuracy** (correct tool, correct arguments), **RAG metrics** (retrieval recall@k and answer faithfulness, Unit 3), and operational metrics (**latency, cost**). For open-ended outputs with no exact reference, use **LLM-as-judge**: a strong model scores the output against a rubric — powerful but needing calibration (judges have biases)."
            },
            {
              "type": "text",
              "heading": "Offline and online evaluation",
              "body": "**Offline** eval runs a fixed dataset before deploy — your **regression suite**: run it on every prompt/model/graph change to catch quality drops before they ship. **Online** eval watches *production* — live metrics, user feedback (thumbs up/down), and sampling real traffic into the dataset (so the eval set grows toward real usage). The two compose: offline gates changes, online catches what the dataset missed and feeds it back. Both depend on the tracing of the next lesson to capture what actually happened."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Build an eval dataset early and treat it as the test suite.** The single biggest difference between a demo agent and a reliable one is a real eval set, run on every change. Don't tune prompts by vibes — measure final-answer *and* trajectory quality against a dataset, add every production failure to it, and never let a change ship that regresses the suite. (This is the same rigor-and-accountability discipline this very platform is built on.)"
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "Why do agents need evaluation, and why isn't exact-string matching enough? What replaces it for open-ended outputs?",
                  "solution": "Agents need evaluation because they're **non-deterministic** (the model samples, so outputs vary run to run) and you must still know whether a change improved or regressed quality — eval is the agent's equivalent of a test suite, run on every change to catch regressions before they ship; without it, quality is just 'it feels better.' Exact-string matching isn't enough because agent tasks are **open-ended**: there are many valid phrasings/answers, so a correct response rarely equals a single reference string. What replaces it: **graded/criteria-based evaluators** — checking final-answer correctness against criteria (not exact text), trajectory/tool-use correctness, and RAG metrics — and, for open-ended outputs with no exact reference, **LLM-as-judge**: a strong model scores the output against a rubric (with the caveat that judges have biases and need calibration). The point is to measure quality on meaningful axes, not literal equality."
                },
                {
                  "prompt": "Why measure trajectory/step correctness, not just final-answer correctness?",
                  "solution": "Because an agent can reach the **right answer for the wrong reasons** — luck, a hallucinated shortcut, or ignoring its tools — and such an agent is fragile and will fail on the next case. Measuring only the final answer hides this: it can't distinguish 'searched the docs, found the policy, answered correctly' from 'guessed and happened to be right.' **Trajectory/step correctness** checks the *process* — did it call the right tools with the right arguments, follow a sensible sequence, and ground its answer in real observations? — which predicts whether the behavior will generalize. It also localizes failures (which step went wrong) for debugging, and catches degradations that don't yet change the final answer but will (e.g. an increasingly unnecessary tool call). Both axes matter: final-answer for *what*, trajectory for *whether you can trust it to keep being right*."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg9l1-i1",
              "front": "Why do agents need evaluation?",
              "back": "They're non-deterministic and open-ended, so you can't eyeball quality or unit-test exact strings; eval measures quality against a dataset and catches regressions on every change — the agent's test suite."
            },
            {
              "id": "lg9l1-i2",
              "front": "The three pieces of an evaluation?",
              "back": "A dataset (inputs + reference answers/criteria), evaluators (scoring functions — match, metric, or LLM judge), and the target (the agent). Run target over dataset, score, aggregate."
            },
            {
              "id": "lg9l1-i3",
              "front": "What axes of agent quality to measure?",
              "back": "Final-answer correctness, trajectory/step correctness (right steps/tools, not luck), tool-call accuracy, RAG metrics (recall@k, faithfulness), and latency/cost. LLM-as-judge for open-ended outputs (calibrate it)."
            },
            {
              "id": "lg9l1-i4",
              "front": "Offline vs online evaluation?",
              "back": "Offline: a fixed dataset run pre-deploy (a regression suite gating changes). Online: production metrics + user feedback + sampling real traffic into the dataset. They compose; both need tracing."
            }
          ]
        },
        {
          "id": "lg9l2",
          "title": "Observability: Tracing, Streaming & Debugging",
          "estMinutes": 22,
          "content": [
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Tracing",
              "statement": "A **trace** records the full tree of an agent run: every node, LLM call, and tool call as a **span** with its inputs, outputs, timing, and token usage (LangSmith is the standard tool). Because an agent run is a multi-step tree of model and tool calls — not a single function — the trace *is* the agent's stack trace: it's how you answer \"why did it do that?\" and locate where a run went wrong. It is the direct analogue of distributed tracing in the cloud course (Unit 8)."
            },
            {
              "type": "text",
              "heading": "An agent without tracing is a black box",
              "body": "When a non-deterministic, multi-step agent produces a wrong or weird answer, the only way to understand it is to see *each step*: what messages the model got, what it decided, which tool it called with what arguments, what came back. A trace reconstructs that tree; without it you're guessing at a black box. Tracing is also what feeds evaluation (Lesson 1) — the trajectory you score is the trace — and what surfaces cost and latency per step. Instrument from day one, not after the first production incident."
            },
            {
              "type": "theorem",
              "kind": "definition",
              "name": "Streaming",
              "statement": "`graph.stream(input, config, stream_mode=...)` yields output incrementally instead of waiting for the whole run. Modes include **\"values\"** (the full state after each step), **\"updates\"** (just each node's changes), and **\"messages\"** (token-by-token LLM output, for chat UX). Streaming serves two purposes: **UX** (the user sees progress and tokens as they're generated, cutting *perceived* latency) and **observability** (you watch the agent's steps live as it runs)."
            },
            {
              "type": "code",
              "heading": "Streaming an agent's progress",
              "lang": "python",
              "code": "# Watch each node's updates as the agent runs:\nfor chunk in graph.stream(user_input, config, stream_mode=\"updates\"):\n    print(chunk)   # {node_name: {state changes}} after each step\n\n# Token-by-token model output for a responsive chat UI:\nfor token, meta in graph.stream(user_input, config, stream_mode=\"messages\"):\n    print(token.content, end=\"\")"
            },
            {
              "type": "text",
              "heading": "The three pillars, for agents",
              "body": "Observability for agents is the cloud course's **three pillars** (Unit 8) applied: **traces** (the run tree — which step, how long, what tokens), **metrics** (aggregate latency percentiles, token/cost per run, error and tool-failure rates, success rate from eval), and **logs** (detailed records of specific events/errors). An agent is a distributed, multi-step computation over flaky model/tool calls, so it needs the same instrumentation as any production service — you can't operate, debug, or improve what you can't see."
            },
            {
              "type": "callout",
              "tone": "warn",
              "body": "**Instrument tracing before you need it — the trace tree is the only way to understand a run.** A multi-step, non-deterministic agent is undebuggable as a black box; the trace (each node/LLM/tool span with inputs, outputs, timing, tokens) is its stack trace, the source of its eval trajectory, and where you see cost and latency. Add it from day one — and stream updates for both UX and live visibility."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "What does a trace of an agent run capture, and why is it essential for debugging a multi-step agent?",
                  "solution": "A trace records the **full tree of the run**: every node, LLM call, and tool call as a **span**, each with its inputs, outputs, timing, and token usage. It's essential because an agent run is a **multi-step, non-deterministic tree** of model and tool calls, not a single function — so when it produces a wrong or strange answer, the only way to understand *why* is to inspect each step (what context the model received, what it decided, which tool it called with what arguments, what came back). The trace reconstructs that tree — it's effectively the agent's **stack trace**. Without it the agent is a black box and you're guessing. The trace also doubles as the **trajectory** that evaluation scores and the place where per-step **cost and latency** are visible. It's the direct analogue of distributed tracing in the cloud course."
                },
                {
                  "prompt": "Name the two purposes of streaming an agent's output and a stream mode that serves each.",
                  "solution": "(1) **UX / perceived latency** — show the user progress and the answer as it's produced instead of a long wait; served by `stream_mode='messages'` (token-by-token model output for a responsive chat UI), or `'updates'` to show 'now searching… now answering' step progress. (2) **Observability** — watch the agent's steps live as it runs, to see what it's doing and catch problems in real time; served by `stream_mode='updates'` (each node's state changes as it completes) or `'values'` (the full state after each step). So messages-mode is mainly for end-user responsiveness, and updates/values modes are mainly for developer/operator visibility into the run."
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg9l2-i1",
              "front": "What is a trace, and why essential for agents?",
              "back": "The full tree of a run — every node/LLM/tool call as a span with inputs/outputs/timing/tokens. It's the agent's stack trace: the only way to debug a multi-step, non-deterministic run (cloud distributed tracing applied)."
            },
            {
              "id": "lg9l2-i2",
              "front": "What is streaming and its modes?",
              "back": "graph.stream yields output incrementally. Modes: 'values' (full state per step), 'updates' (node changes), 'messages' (token-by-token output). Serves UX (perceived latency) + live observability."
            },
            {
              "id": "lg9l2-i3",
              "front": "The three observability pillars for agents?",
              "back": "Traces (the run tree), metrics (latency percentiles, token/cost per run, error/tool-failure/success rates), logs (event/error detail) — the cloud Unit 8 pillars applied to agents."
            },
            {
              "id": "lg9l2-i4",
              "front": "Why instrument tracing from day one?",
              "back": "A multi-step non-deterministic agent is a black box without it; the trace is its stack trace, its eval trajectory, and where cost/latency are visible. Add it before the first incident."
            }
          ]
        },
        {
          "id": "lg9l3",
          "title": "Production: Cost, Latency, Reliability & Deployment",
          "estMinutes": 24,
          "content": [
            {
              "type": "theorem",
              "kind": "proposition",
              "name": "Token-cost accounting",
              "statement": "An agent's monetary cost is dominated by LLM tokens: total ≈ Σ over all model calls c of (input_tokens(c) + output_tokens(c)) × price. Because every reasoning step, tool-call decision, reflection iteration, and agent is a model call, cost scales with the **number of model invocations × tokens per call** — so the levers are: fewer steps, smaller models for easy steps, shorter contexts, and caching.",
              "proof": "Each model call bills its input tokens (the context sent) and output tokens (the generation) at the provider's per-token price; the run's total token cost is the sum over every call (tracing, Lesson 2, gives this exact breakdown). A single ReAct step is one call; K loop iterations are ≥ K calls; R reflection rounds add ≈ 2R calls; N agents each add their calls — so the call count, and thus cost, grows with loop length, reflection depth, and agent count, each multiplied by the tokens per call (which the context size sets). Reducing cost therefore means: reduce *calls* (terminate loops sooner, avoid needless reflection/extra agents), reduce *tokens per call* (bound and curate the context — Unit 6 — and trim prompts), use *cheaper models* where adequate, and *cache* repeated calls (cloud Unit 5). ∎\n\nSo the architecture choices of Units 5–8 are also cost choices: bounding loops, curating context, and not over-using reflection/multi-agent are the primary cost controls."
            },
            {
              "type": "text",
              "heading": "Latency and reliability are cloud problems",
              "body": "**Latency** is dominated by model calls (each is hundreds of ms to seconds), and they're often *serial* (each step needs the last). The levers are the cloud course's: **parallelize** independent calls (`Send`, so latency is the *max* not the *sum* — Unit 7), **stream** to cut perceived latency, and **cache** repeated work (Unit 5). **Reliability**: an agent calls flaky services (model APIs, tools), so it needs every cloud resilience pattern (Unit 8) — **retries with backoff** for transient errors, **fallbacks** (a backup model), **timeouts**, the **recursion limit** (always halts), **graceful degradation**, and **human escalation**. An agent *is* a distributed system."
            },
            {
              "type": "text",
              "heading": "Deployment: stateless logic + a durable state tier",
              "body": "To serve an agent at scale, apply the cloud course's first lesson: keep the **graph logic stateless** and push all conversation/run state into a **durable checkpointer backend** (Postgres, Unit 6). Then you can run many identical, stateless graph workers behind a load balancer (horizontal scaling, cloud Unit 1), each loading the relevant thread's state from the shared checkpointer on demand — exactly the \"stateless compute tier + shared state store\" pattern. The checkpointer *is* the state tier; the graph is the stateless compute. Add the availability composition, monitoring, and cost controls of the cloud course, and you have a production agent rather than a demo."
            },
            {
              "type": "callout",
              "tone": "info",
              "body": "**A production agent is a distributed system — build it with that discipline.** It inherits every concern of the cloud course: token *cost* (a sum over calls — minimize calls and context), *latency* (parallelize/stream/cache), *reliability* (retries, fallbacks, timeouts, the recursion limit, degradation, escalation), *observability* (traces/metrics/logs), and *scaling* (stateless graph + durable checkpointer state tier). The agent patterns of this course and the systems discipline of the cloud course are the same toolkit, applied to LLM workflows."
            },
            {
              "type": "exercises",
              "heading": "Exercises",
              "items": [
                {
                  "prompt": "An agent run makes model calls totaling 10,000 input tokens (priced at $3 per million) and 2,000 output tokens (priced at $15 per million). What is the run's token cost in dollars? Then name two levers to reduce it.",
                  "solution": "Cost = input + output = (10,000 / 1,000,000) × $3 + (2,000 / 1,000,000) × $15 = $0.03 + $0.03 = **$0.06** per run. Levers to reduce it (from total ≈ Σ over calls of tokens × price): (1) **fewer model calls** — terminate loops sooner (tighter exit conditions / recursion limit), avoid needless reflection iterations or extra agents, since each is a call; (2) **fewer tokens per call** — bound and curate the context (trim/summarize history, Unit 6; trim prompts; retrieve only what's needed) so each call sends less input. Also: use a **cheaper/smaller model** for easy steps and **cache** repeated calls (cloud Unit 5). Output tokens are pricier per token, so concise outputs help too."
                },
                {
                  "prompt": "Explain why a production agent should keep its graph logic stateless and push state to a durable checkpointer, relating it to the cloud course.",
                  "solution": "To **scale horizontally**. The cloud course's Unit 1 lesson is that a **stateless compute tier** can be scaled by simply adding identical workers behind a load balancer, because any worker can handle any request — whereas stateful workers force you to pin a user to 'their' server. Applied to agents: keep the **graph (the agent logic) stateless** and put all conversation/run state in a **durable checkpointer backend** (e.g. Postgres, Unit 6). Then you can run many identical graph-worker instances behind a load balancer; each request loads the relevant **thread's** state from the shared checkpointer, processes it, and writes the updated checkpoint back — so any worker can serve any user, and you scale by adding workers. The checkpointer *is* the shared state tier and the graph is the stateless compute tier — exactly the 'stateless app servers + shared state store' architecture of cloud Unit 1. (Using an in-memory checkpointer would defeat this — state must be shared/durable across instances.)"
                }
              ]
            }
          ],
          "reviewItems": [
            {
              "id": "lg9l3-i1",
              "front": "Token-cost accounting for an agent?",
              "back": "Total ≈ Σ over model calls of (input + output tokens) × price. Cost scales with number of calls × tokens/call. Levers: fewer steps/calls, smaller models, shorter contexts, caching."
            },
            {
              "id": "lg9l3-i2",
              "front": "Latency levers for agents (cloud)?",
              "back": "Model calls dominate and are often serial. Parallelize independent calls (Send → latency = max not sum), stream (perceived latency), cache repeated work. The cloud course's latency toolkit."
            },
            {
              "id": "lg9l3-i3",
              "front": "Reliability patterns a production agent needs?",
              "back": "It calls flaky services, so: retries with backoff, fallbacks (backup model), timeouts, the recursion limit (always halts), graceful degradation, human escalation — every cloud Unit 8 resilience pattern."
            },
            {
              "id": "lg9l3-i4",
              "front": "How to deploy an agent at scale?",
              "back": "Keep the graph logic stateless; push run/conversation state to a durable checkpointer (Postgres). Run many stateless graph workers behind a load balancer, loading thread state on demand — cloud Unit 1's stateless compute + shared state tier."
            },
            {
              "id": "lg9l3-i5",
              "front": "Why is a production agent a distributed system?",
              "back": "It's a multi-step computation over flaky model/tool calls, so it inherits all cloud concerns: cost, latency, reliability/resilience, observability (traces/metrics/logs), and stateless-scaling with a durable state tier."
            }
          ]
        }
      ],
      "masteryCheck": {
        "id": "lg9-check",
        "questions": [
          {
            "id": "lg9q1",
            "type": "mcq",
            "prompt": "Why do LLM agents need evaluation (rather than just eyeballing outputs)?",
            "options": [
              "they're non-deterministic and open-ended, so eval measures quality against a dataset and catches regressions on every change — the agent's test suite",
              "evaluation makes the model respond faster",
              "it's required to compile the graph",
              "it eliminates the need for tracing"
            ],
            "answer": 0,
            "explanation": "Non-deterministic, open-ended outputs can't be eyeballed or exact-matched; an eval dataset run on every change measures quality and prevents silent regressions — like tests for code."
          },
          {
            "id": "lg9q2",
            "type": "short",
            "prompt": "Using a strong model to score an agent's open-ended output against a rubric (when there's no exact reference answer) is called LLM-as-____.",
            "accept": [
              "judge",
              "Judge",
              "a-judge",
              "judge."
            ],
            "explanation": "LLM-as-judge scores open-ended outputs against a rubric — powerful but biased, so it needs calibration."
          },
          {
            "id": "lg9q3",
            "type": "mcq",
            "prompt": "A trace of an agent run records:",
            "options": [
              "the full tree of nodes, LLM calls, and tool calls as spans (with inputs, outputs, timing, tokens) — the agent's stack trace for debugging",
              "only the final answer",
              "the model's training data",
              "a cache of repeated responses"
            ],
            "answer": 0,
            "explanation": "A trace captures each step as a span; it's how you debug a multi-step run, the trajectory eval scores, and where cost/latency are visible — distributed tracing for agents."
          },
          {
            "id": "lg9q4",
            "type": "numeric",
            "prompt": "An agent run uses 10,000 input tokens at $3 per million and 2,000 output tokens at $15 per million. What is the run's cost, in dollars? (e.g. 0.06)",
            "answer": 0.06,
            "tolerance": 0.005,
            "explanation": "(10,000/1e6)×$3 + (2,000/1e6)×$15 = $0.03 + $0.03 = $0.06. Cost ≈ Σ over calls of tokens × price; reduce calls, tokens, model size, or cache."
          },
          {
            "id": "lg9q5",
            "type": "open",
            "points": 3,
            "prompt": "A deployed agent is too slow, too expensive, and occasionally fails or loops. Diagnose each problem and give concrete fixes, drawing on the cost/latency/reliability tools of this and the cloud course.",
            "rubric": [
              "Cost: total ≈ Σ over model calls of tokens × price — so reduce the number of calls (tighter loop exits, less reflection/fewer agents), tokens per call (curate/bound context, trim prompts), use cheaper models for easy steps, and cache repeated calls.",
              "Latency: model calls dominate and are often serial — parallelize independent calls (Send → max not sum), stream for perceived latency, and cache; identify the slow spans via tracing.",
              "Reliability/looping: add retries with backoff + fallbacks + timeouts for flaky model/tool calls, ensure the recursion limit bounds loops (handle GraphRecursionError), validate inputs, and escalate to a human on failure.",
              "Uses observability to diagnose (traces/metrics to find the expensive/slow/failing step) and frames the agent as a distributed system inheriting cloud concerns."
            ],
            "solution": "First **diagnose with tracing/metrics** (Lesson 2): the trace shows which steps consume the tokens, time, and errors — fix what the data points to, not guesses. **Cost** (total ≈ Σ over calls of (in+out tokens)×price): reduce the **number of model calls** — tighten loop exit conditions and the recursion limit so the agent stops sooner, cut unnecessary reflection iterations and over-eager multi-agent fan-out (each is calls); reduce **tokens per call** — bound/curate the context (trim or summarize history, Unit 6; trim bloated prompts; retrieve only what's needed); use a **smaller/cheaper model** for easy steps (routing, classification) and reserve the big model for hard ones; and **cache** repeated calls (cloud Unit 5). **Latency** (model calls dominate, often serial): **parallelize** independent calls with `Send` so latency is the *max* not the *sum* (cloud Unit 7), **stream** output to cut *perceived* latency, and **cache**; the trace pinpoints the slow spans. **Reliability/looping**: the agent calls flaky services, so add the cloud Unit 8 patterns — **retries with exponential backoff + jitter** for transient model/API failures, a **fallback** model, **timeouts** on tool/model calls, and make sure the **recursion_limit** bounds every loop (catch GraphRecursionError and return a partial result or escalate) so it can't loop forever; **validate** tool arguments, and **escalate to a human** (interrupt) when it can't succeed. Underlying all of this: a production agent **is a distributed system**, so it inherits the cloud course's cost, latency, resilience, and observability discipline — apply it.",
            "explanation": "Trace to find the costly/slow/failing spans; cut calls + tokens + model size + cache (cost), parallelize/stream/cache (latency), and add retries/fallbacks/timeouts/recursion-limit/escalation (reliability) — the cloud toolkit applied to an agent."
          },
          {
            "id": "lg9q6",
            "type": "open",
            "points": 3,
            "prompt": "Make the case that a production LangGraph agent is a distributed system, and list the concerns it inherits from the cloud course and how each is addressed in the agent context.",
            "rubric": [
              "Frames the agent as a multi-step computation over flaky remote services (model APIs, tools), i.e. a distributed system — not a single function call.",
              "Cost (token accounting — sum over calls; minimize calls/tokens/model size, cache) and latency (model calls dominate, often serial; parallelize with Send → max not sum, stream, cache).",
              "Reliability/resilience (retries+backoff, fallbacks, timeouts, the recursion limit, graceful degradation, human escalation) and the availability composition of chained agents/tools (series ∏).",
              "Observability (traces/metrics/logs — the three pillars) and scaling/deployment (stateless graph + durable checkpointer state tier — stateless compute + shared state store)."
            ],
            "solution": "A production agent is not a single function call — it's a **multi-step computation that repeatedly calls remote, flaky services** (model provider APIs, tools, retrieval/databases) and maintains state across steps and sessions. That is the definition of a **distributed system**, so it inherits the cloud course's concerns: **Cost** — dominated by tokens, total ≈ Σ over calls of (in+out)×price, so minimize calls (bound loops, limit reflection/agents), tokens per call (curate context, Unit 6), model size (cheap models for easy steps), and cache (Unit 5). **Latency** — model calls dominate and are often serial, so parallelize independent calls with `Send` (latency = max not sum, cloud Unit 7), stream for perceived latency, and cache. **Reliability/resilience** — calling flaky services means retries with backoff+jitter, fallbacks (backup model), timeouts, the recursion limit (guaranteed halting), graceful degradation, and human escalation (cloud Unit 8); and a chain of agents/tools that must all succeed has availability ≈ ∏ aᵢ (the series tax, cloud Unit 2/7), so validate at boundaries. **Observability** — the three pillars (traces of the run tree, metrics for latency/cost/error rates, logs), since a multi-step non-deterministic run is undebuggable otherwise (cloud Unit 8). **Scaling/deployment** — keep the graph stateless and push state to a durable checkpointer (Postgres), so identical stateless graph workers run behind a load balancer loading thread state on demand — the cloud Unit 1 'stateless compute tier + shared state store' pattern. In short, the agent patterns of this course and the systems discipline of the cloud course are one toolkit: a reliable agent is built like any reliable distributed service.",
            "explanation": "An agent is a stateful, multi-step computation over flaky remote services — a distributed system — inheriting the cloud course's cost, latency, resilience, availability-composition, observability, and stateless-scaling concerns, each addressed with the corresponding agent-context tool."
          }
        ]
      }
    },
  ],
};
