export const unit = {
  id: "lg2",
  title: "Tools & Tool Calling",
  summary: "Give the model hands: define tools, run the reason→act→observe loop, and see why that loop is a cycle LCEL can't express.",
  prerequisites: ["lg1"],
  masteryThreshold: 0.85,
  references: [
    "LangChain docs — Tools & tool calling (@tool, bind_tools)",
    "LangChain docs — Agents and the tool-calling loop",
    "Yao et al. — ReAct: Synergizing Reasoning and Acting (2022)",
  ],
  lessons: [
    {
      id: "lg2l1",
      title: "Defining Tools",
      estMinutes: 22,
      content: [
        {
          type: "text",
          heading: "A tool is a function the model can ask you to run",
          body: `A chat model can only emit text — it cannot read a database, call an API, or do arithmetic reliably. A **tool** closes that gap: it is an ordinary function you expose to the model, with a name, a description, and a typed argument schema. Crucially, the model does **not execute** the tool — it *requests* a call (which function, which arguments), and *your application* executes it and returns the result. This separation is the whole basis of agents: the model decides *what* to do; your code decides *whether and how* to actually do it.`,
        },
        {
          type: "theorem",
          kind: "definition",
          name: "Tool",
          statement: `A **tool** is a callable exposed to a model with three things the model can see: a **name**, a **description** (what it does / when to use it), and a **typed argument schema** (the parameters and their types). In LangChain the \`@tool\` decorator turns a Python function into a tool, deriving the schema from the type hints and the description from the docstring. The model never sees the function body — only this interface.`,
        },
        {
          type: "code",
          heading: "Defining a tool",
          lang: "python",
          code: `from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get the current weather for a city.

    Args:
        city: The city name, e.g. "Paris" or "Tokyo".
    """
    return _weather_api(city)   # your real implementation

print(get_weather.name)         # "get_weather"
print(get_weather.description)  # the docstring — the model reads THIS
print(get_weather.args)         # {"city": {"type": "string", ...}}`,
        },
        {
          type: "theorem",
          kind: "definition",
          name: "The tool schema is the model's only interface",
          statement: `The model chooses *whether* and *how* to call a tool based solely on its **name, description, and argument schema** — never the implementation. So those three are effectively *prompt*: a vague name or description, or an under-specified argument, leads the model to skip the tool, call it wrongly, or hallucinate arguments. Tool design is interface design *for an LLM consumer*.`,
        },
        {
          type: "callout",
          tone: "warn",
          body: `**The docstring is a prompt — write it for the model.** "get_weather: gets weather" tells the model little; "Get the *current* weather for a city; use when the user asks about present conditions, not forecasts; city must be a single city name" tells it *when* and *how*. Under-described tools are the #1 cause of agents that ignore a perfectly good tool or call it with garbage arguments.`,
        },
        {
          type: "example",
          heading: "A well-described tool vs. a poor one",
          body: `**Poor:** \`@tool def search(q): """search"""\` — no types, no guidance; the model doesn't know what it searches, what \`q\` should be, or when to use it.\n**Good:** \`@tool def search_docs(query: str) -> list[str]: """Search the internal product documentation for passages relevant to a question. Use for questions about our product's features or APIs, not general knowledge. 'query' is a natural-language question."""\` — typed, scoped ("internal docs", "not general knowledge"), and tells the model exactly when to reach for it. The body is identical; the *interface* is what makes the agent work.`,
        },
        {
          type: "exercises",
          heading: "Exercises",
          items: [
            {
              prompt: "When a chat model 'calls a tool,' what actually executes the function — the model or your application? Why does this separation matter for safety?",
              solution: "**Your application executes it**, not the model. The model only *requests* a call — it returns a structured request naming the tool and its arguments; your code decides whether to run it and then runs it. This separation matters for safety because it gives you a control point: you can validate the arguments, require human approval for dangerous tools (deletes, payments), rate-limit, sandbox, or refuse the call entirely — none of which would be possible if the model executed code directly. The model proposes; your code disposes.",
            },
            {
              prompt: "An agent keeps ignoring a tool that would clearly help. The function works fine. What is the most likely cause, and how do you fix it?",
              solution: "The most likely cause is a **poor tool interface** — the name/description/argument schema, which is all the model sees. If the description is vague ('search: searches') or the args are untyped/unexplained, the model can't tell when or how to use it, so it skips it. Fix by treating the docstring as a prompt: give a precise name, a description stating *what it does and when to use it* (and when not to), and typed, documented arguments. The implementation is irrelevant to the model — improving the *interface* is what gets the tool used.",
            },
          ],
        },
      ],
      reviewItems: [
        { id: "lg2l1-i1", front: "What is a tool, and who executes it?", back: "A function exposed to the model with a name, description, and typed arg schema. The model REQUESTS a call (name + args); your application executes it — the model never runs the code." },
        { id: "lg2l1-i2", front: "What does @tool derive from the function?", back: "Name (function name), description (docstring), and argument schema (type hints). The model sees only this interface, never the body." },
        { id: "lg2l1-i3", front: "Why is the tool description effectively a prompt?", back: "The model decides whether/how to call a tool purely from its name, description, and arg schema — so vague descriptions cause skipped or mis-called tools. Tool design = LLM-facing interface design." },
        { id: "lg2l1-i4", front: "#1 cause of an agent ignoring a useful tool?", back: "A poor interface (vague name/description, untyped/unexplained args). Fix the docstring and types, not the implementation." },
      ],
    },
    {
      id: "lg2l2",
      title: "Tool Calling & the Agent Loop",
      estMinutes: 26,
      content: [
        {
          type: "theorem",
          kind: "definition",
          name: "Binding tools",
          statement: `\`model.bind_tools([...])\` returns a model that knows about the tools — it advertises their schemas to the provider so the model *may* respond with tool calls. A response is then an \`AIMessage\` whose \`.tool_calls\` is a list of requested calls, each with a tool \`name\`, \`args\`, and an \`id\`. If \`.tool_calls\` is empty, the model answered directly; if not, it is asking you to run those tools.`,
        },
        {
          type: "text",
          heading: "The reason → act → observe loop",
          body: `Tool use is inherently a **loop**, the **ReAct** pattern (Yao et al., 2022): the model **reasons** and emits tool calls (act); your code **executes** them and returns results (observe); you feed the results back and the model reasons again — until it produces a final answer with no tool calls. One round-trip is rarely enough: the model might search, read the result, then search again, then answer. This back-and-forth is the heartbeat of every agent.`,
        },
        {
          type: "code",
          heading: "The tool-calling loop, by hand",
          lang: "python",
          code: `from langchain_core.messages import HumanMessage, ToolMessage

tools = {t.name: t for t in [get_weather, search_docs]}
model_t = model.bind_tools(list(tools.values()))

messages = [HumanMessage("What's the weather in Paris?")]
while True:
    ai = model_t.invoke(messages)      # reason
    messages.append(ai)
    if not ai.tool_calls:              # no calls -> final answer
        break
    for call in ai.tool_calls:         # act + observe
        result = tools[call["name"]].invoke(call["args"])
        messages.append(ToolMessage(result, tool_call_id=call["id"]))
print(ai.content)`,
        },
        {
          type: "theorem",
          kind: "proposition",
          name: "The agent loop is a cycle — which is why it needs a graph",
          statement: `The reason→act→observe loop contains a **back edge**: after executing tools you return to the model, possibly many times. A computation with a data-dependent back edge is a **cycle**, and LCEL — being a DAG of pure transforms (Unit 1) — cannot express it. Expressing the loop requires a stateful graph with a conditional edge that routes "model → tools → model" until a termination condition holds. That graph is exactly LangGraph.`,
          proof: `In LCEL, \`a | b | c\` is a directed *acyclic* pipeline: data flows forward through each stage once, and there is no construct to route output *back* to an earlier stage based on its content. The tool-calling loop, however, must decide *after* the model runs whether to (a) go to the tool-execution step and then *back* to the model, or (b) stop — a decision that depends on the model's output (\`.tool_calls\`). That "back to the model" transition is a cycle in the control-flow graph, and the (a)/(b) decision is a conditional branch on state. Neither a cycle nor a data-dependent branch exists in a DAG, so LCEL cannot represent the loop; you must hand-roll a \`while\` loop (as above) or use a framework whose computational model *is* a graph with cycles and conditional edges. ∎\n\nThe hand-rolled \`while\` loop works but quietly reinvents what a graph gives you: persistence across steps, streaming of intermediate steps, a recursion limit, parallel tool execution, and resumability. That reinvention is LangGraph's reason to exist (Unit 4).`,
        },
        {
          type: "diagram",
          kind: "graph",
          directed: true,
          height: 250,
          caption: "The tool-calling agent loop as a graph. The model node either requests tool calls (→ tools, which execute and feed ToolMessages back — the cycle) or returns a final answer (→ END). This reason→act→observe cycle is exactly what an LCEL DAG cannot express and what LangGraph's StateGraph (Unit 4) is built for.",
          nodes: [
            { id: "start", label: "START", x: 8, y: 50, tone: "muted" },
            { id: "model", label: "model", x: 38, y: 50, tone: "gold" },
            { id: "tools", label: "tools", x: 75, y: 50, tone: "sage" },
            { id: "end", label: "END", x: 38, y: 90, tone: "muted" },
          ],
          edges: [
            { from: "start", to: "model" },
            { from: "model", to: "tools", label: "tool_calls", tone: "sage" },
            { from: "tools", to: "model", label: "ToolMessages", tone: "sage" },
            { from: "model", to: "end", label: "no tool_calls", tone: "gold" },
          ],
        },
        {
          type: "callout",
          tone: "warn",
          body: `**Hand-rolling the loop is where bugs live.** A raw \`while True\` has no step limit (a confused model can loop forever), runs tools serially, loses all state if the process dies mid-loop, and can't stream progress or pause for human approval. These are exactly the concerns LangGraph (and the prebuilt \`create_react_agent\`, Unit 7) handle — which is why you graduate from the manual loop to a graph.`,
        },
        {
          type: "exercises",
          heading: "Exercises",
          items: [
            {
              prompt: "Walk through the tool-calling loop: starting from a user question, what are the steps and what message types are appended at each, until a final answer?",
              solution: "Start: messages = [HumanMessage(question)]. (1) **Reason** — invoke the tool-bound model; it returns an **AIMessage**, appended to messages. (2) Check `.tool_calls`: if empty, that AIMessage is the final answer — stop. (3) If non-empty, **act + observe** — for each requested call, execute the named tool with its args and append a **ToolMessage** (carrying the result, keyed by tool_call_id) for each. (4) **Loop** — invoke the model again with the extended history; it now sees the tool results and either calls more tools (back to step 3) or answers (step 2). The message sequence grows Human → AI(tool_calls) → Tool(s) → AI(tool_calls) → Tool(s) → … → AI(final). The cycle is the AI↔Tool back-and-forth.",
            },
            {
              prompt: "Why can't the tool-calling loop be written as an LCEL chain (prompt | model | ...)? Name two things a graph gives you that the hand-rolled while-loop doesn't.",
              solution: "Because the loop is a **cycle with a data-dependent branch**: after the model runs, you must decide — based on whether it emitted `.tool_calls` — to execute tools and go *back* to the model, or to stop. LCEL is a directed *acyclic* pipeline of pure transforms; it has no back edge and no conditional routing on output, so it cannot express the loop. A graph framework (LangGraph) gives you, beyond the bare while-loop: (1) a **recursion/step limit** so a confused model can't loop forever; (2) **persistence/checkpointing** so the loop survives a crash and can resume — plus streaming of intermediate steps, parallel tool execution, and pause-for-human-approval. The while-loop reinvents these poorly; the graph provides them.",
            },
          ],
        },
      ],
      reviewItems: [
        { id: "lg2l2-i1", front: "What does model.bind_tools([...]) do?", back: "Returns a model that advertises the tools' schemas to the provider, so its response (an AIMessage) may include .tool_calls (name, args, id) requesting executions." },
        { id: "lg2l2-i2", front: "The reason→act→observe (ReAct) loop?", back: "Model reasons + emits tool calls (act); your code executes them, returns results as ToolMessages (observe); feed back; repeat until the model answers with no tool calls." },
        { id: "lg2l2-i3", front: "Why can't LCEL express the agent loop?", back: "The loop has a back edge (tools → model) and a data-dependent branch (tool_calls?) — a cycle. LCEL is a DAG of pure transforms with no cycles or content-based routing. Needs a stateful graph." },
        { id: "lg2l2-i4", front: "What does a graph give over a hand-rolled while-loop?", back: "Recursion/step limit, persistence/checkpointing (resume after crash), streaming of steps, parallel tool execution, and pause-for-human-approval — the reasons to use LangGraph." },
      ],
    },
    {
      id: "lg2l3",
      title: "Reliability: Errors, Validation & Runaway Loops",
      estMinutes: 22,
      content: [
        {
          type: "text",
          heading: "Tools fail — decide how",
          body: `A tool calls the real world, so it can fail: a timeout, a 404, bad arguments from the model. You have a design choice. **Return the error to the model** (as a ToolMessage describing what went wrong) and let it adapt — retry with different arguments, try another tool, or apologize — which makes the agent robust and self-correcting. Or **raise** and abort, for failures the model can't recover from. The default in LangGraph's tool node is to catch the error and feed it back, because an agent that can *see* its failures can often route around them.`,
        },
        {
          type: "theorem",
          kind: "definition",
          name: "Argument validation",
          statement: `Tool arguments come from the model and may be wrong — out of range, malformed, or hallucinated. Because tools have a **typed schema** (from the function's type hints / a Pydantic model), arguments are validated against it before execution, and a validation failure becomes a recoverable error returned to the model rather than a crash. Validation at the tool boundary is the agent's equivalent of input validation at a trust boundary (cloud Unit 9's "never trust input").`,
        },
        {
          type: "text",
          heading: "Parallel tool calls",
          body: `In one turn a model may request **several** tool calls at once (e.g. "get the weather in Paris *and* Tokyo"). Because those calls are independent, they should be executed **in parallel**, not serially — the latency of the act step is then the *max* of the calls, not the sum (cloud Unit 7's parallel-vs-serial latency). The framework collects all the results as ToolMessages before the next model turn. Designing tools to be independent and side-effect-safe lets this parallelism be exploited.`,
        },
        {
          type: "theorem",
          kind: "proposition",
          name: "Runaway loops and the step limit",
          statement: `Because the agent loop is a cycle (lg2l2), it can fail to terminate: a confused model may call tools forever, or two states may alternate. Termination is therefore *not* guaranteed by the model and must be *imposed* — by a hard **recursion/step limit** (LangGraph's \`recursion_limit\`) that caps the number of super-steps, plus loop-detection or a max-tool-calls budget. This is the agent analogue of proving a loop terminates with a decreasing measure (algorithms Unit 1): since the model won't supply the measure, you bound the iteration count externally.`,
          proof: `The loop continues whenever the model emits tool calls and stops only when it emits none — a decision the (stochastic, fallible) model controls. There is no guarantee the model ever stops: it can repeat a failing call, oscillate between two tool calls, or chase its own outputs indefinitely. Since no internal decreasing measure is guaranteed (unlike a hand-written loop with a counter), termination must be enforced from outside: cap the number of iterations (super-steps) at a recursion limit, so the run *always* halts — either with an answer or with a 'limit exceeded' that you handle (return a partial result, escalate to a human). Bounding the iteration count converts a possibly-non-terminating cycle into a guaranteed-terminating one, trading completeness for the certainty of halting. ∎`,
        },
        {
          type: "callout",
          tone: "danger",
          body: `**Every tool is attack surface and a way to loop forever — gate both.** Validate arguments against the schema; set a recursion/step limit so the loop always halts; and require human approval (Unit 6's interrupts) before any *irreversible* tool (delete, pay, email). An agent with an un-capped loop and an unguarded "delete database" tool is one hallucinated tool call from disaster.`,
        },
        {
          type: "exercises",
          heading: "Exercises",
          items: [
            {
              prompt: "A tool call fails (the API timed out). Compare returning the error to the model versus raising, and say which is usually the default and why.",
              solution: "**Returning the error to the model** (as a ToolMessage describing the failure) lets the agent *see* and adapt — retry with backoff, try a different tool, or tell the user it couldn't fetch the data; this makes the agent robust and self-correcting, and is usually the **default** (e.g. LangGraph's tool node catches and feeds back). **Raising** aborts the whole run, appropriate only when the failure is unrecoverable or must stop execution (e.g. an auth failure, or a guardrail trip). Default to feeding errors back because an agent that can observe its failures can often route around them; raise only when there's nothing the model could usefully do.",
            },
            {
              prompt: "The agent loop is a cycle. Why isn't termination guaranteed, and how do you guarantee the run always halts?",
              solution: "Termination depends on the model emitting *no* tool calls, but the model is stochastic and fallible — it can repeat a failing call, oscillate between two tool calls, or keep chasing its outputs, so there's no guaranteed internal decreasing measure that forces it to stop (unlike a counter-driven loop). You guarantee halting by **imposing a bound externally**: a hard recursion/step limit (e.g. LangGraph's `recursion_limit`) caps the number of super-steps so the run always ends — either with a final answer or with a 'limit exceeded' you handle (return partial results, escalate to a human). Optionally add loop/duplicate-call detection. This is the agent version of bounding a loop with an external measure to force termination (algorithms Unit 1).",
            },
          ],
        },
      ],
      reviewItems: [
        { id: "lg2l3-i1", front: "Two ways to handle a tool failure, and the usual default?", back: "Return the error to the model (as a ToolMessage) so it can adapt — the usual default, making the agent self-correcting; or raise/abort for unrecoverable failures. Default: feed errors back." },
        { id: "lg2l3-i2", front: "Why validate tool arguments?", back: "Args come from the (fallible) model and may be wrong/hallucinated. The typed schema validates them before execution, turning bad args into a recoverable error, not a crash — input validation at a trust boundary." },
        { id: "lg2l3-i3", front: "Why execute parallel tool calls concurrently?", back: "A model can request several independent calls in one turn; running them in parallel makes the act-step latency the MAX of the calls, not the sum (parallel vs serial latency)." },
        { id: "lg2l3-i4", front: "Why isn't agent-loop termination guaranteed, and the fix?", back: "Stopping depends on the stochastic model emitting no tool calls — it can loop forever. Impose a hard recursion/step limit (recursion_limit) so the run always halts; handle 'limit exceeded'." },
        { id: "lg2l3-i5", front: "Two guardrails every tool-using agent needs?", back: "A recursion/step limit (always halt) and human approval before irreversible tools (delete/pay/email), plus argument validation. Tools are attack surface + a way to loop forever." },
      ],
    },
  ],
  masteryCheck: {
    id: "lg2-check",
    questions: [
      {
        id: "lg2q1",
        type: "mcq",
        prompt: "When a chat model 'calls a tool,' what actually happens?",
        options: [
          "The model returns an AIMessage requesting the call (tool name + args); your application executes the tool and returns a ToolMessage",
          "The model executes the Python function itself and returns its output",
          "The tool runs automatically inside the provider's servers with no app involvement",
          "The model rewrites the function and runs the new version",
        ],
        answer: 0,
        explanation: "The model only REQUESTS a call (name + args in .tool_calls); your application executes the tool and feeds the result back as a ToolMessage. This separation is the agent's control point.",
      },
      {
        id: "lg2q2",
        type: "short",
        prompt: "The message type that carries a tool's execution result back to the model (keyed by tool_call_id) is the ____ Message.",
        accept: ["Tool", "tool", "ToolMessage", "toolmessage"],
        explanation: "A ToolMessage holds the result of running a tool the model requested, returned to the model so it can reason on it.",
      },
      {
        id: "lg2q3",
        type: "mcq",
        prompt: "What most determines whether a model uses a tool correctly?",
        options: [
          "the tool's name, description, and typed argument schema (its interface) — the model never sees the body",
          "the speed of the tool's implementation",
          "the model's temperature setting",
          "the number of other tools available",
        ],
        answer: 0,
        explanation: "The model chooses whether/how to call a tool solely from its name, description, and arg schema. Those are effectively prompt — tool design is LLM-facing interface design.",
      },
      {
        id: "lg2q4",
        type: "short",
        prompt: "In graph terms, the reason→act→observe agent loop (model → tools → model → …) is a ____ — which LCEL's DAG cannot express. (one word)",
        accept: ["cycle", "loop", "Cycle", "Loop"],
        explanation: "The back edge tools→model plus the data-dependent branch (tool_calls?) make it a cycle; LCEL is acyclic, so the loop needs a stateful graph (LangGraph).",
      },
      {
        id: "lg2q5",
        type: "open",
        points: 3,
        prompt: "Design a tool-using assistant that can answer questions needing current weather and arithmetic (e.g. 'Is it warmer in Paris or Tokyo, and by how many degrees?'). Specify the tools (interfaces), the loop, and how you guarantee it terminates and handles tool failures.",
        rubric: [
          "Defines concrete tools with good interfaces: e.g. get_weather(city: str) and a calculator/compute tool, each with a clear description and typed args; notes the description is what drives correct use.",
          "Describes the reason→act→observe loop: bind tools, model emits tool_calls (possibly parallel — both cities at once), execute, return ToolMessages, repeat until a final answer with no tool calls.",
          "Guarantees termination with a recursion/step limit (the loop is a cycle; the stochastic model won't guarantee halting) and handles the 'limit exceeded' case.",
          "Handles tool failures by returning errors to the model so it can adapt (retry/alternate), and validates arguments against the schema; notes parallel execution for the two independent weather calls.",
        ],
        solution:
          "Tools: `get_weather(city: str) -> str` ('Get current weather (incl. temperature in °C) for a single city; use for present conditions') and `compute(expression: str) -> float` ('Evaluate an arithmetic expression') — both with precise descriptions and typed args, since the interface is what the model reads. Loop: bind both tools; on 'warmer in Paris or Tokyo and by how much?', the model emits two parallel get_weather calls (independent → execute concurrently, latency = max not sum), we return two ToolMessages, the model then emits a compute call on the difference, we return its result, and the model produces the final answer with no tool calls — the reason→act→observe cycle. Termination: because this is a cycle and the model is stochastic, impose a hard recursion/step limit (e.g. recursion_limit) so the run always halts; on 'limit exceeded', return a partial answer or escalate. Failures: run tools in a try/except and return the error as a ToolMessage (timeout/404) so the model can retry or apologize rather than crashing; validate args against the schema (e.g. city is a non-empty string) and feed validation errors back too. Dangerous/irreversible tools would additionally require human approval — not needed here since both tools are read-only.",
        explanation: "Two well-described tools, a reason→act→observe loop with parallel independent calls, a recursion limit to force termination, and errors fed back to the model for self-correction.",
      },
      {
        id: "lg2q6",
        type: "open",
        points: 3,
        prompt: "Explain why the tool-calling loop cannot be written as an LCEL chain, and what concrete capabilities you gain by expressing it as a LangGraph graph instead of a hand-rolled while-loop.",
        rubric: [
          "Identifies the loop as a cycle with a data-dependent branch: after the model runs you route back to tools then to the model, or stop, based on .tool_calls — a back edge + conditional, neither of which a DAG has.",
          "States that LCEL is a directed ACYCLIC pipeline of pure transforms, so it has no back edge and no content-based routing — it structurally cannot express the loop.",
          "Names capabilities a graph provides over a bare while-loop: persistence/checkpointing (resume after crash), a recursion/step limit (guaranteed termination), streaming of intermediate steps, parallel tool execution, pause-for-human-approval.",
          "Connects to the broader point: the graph's value is managing state, control flow, and durability around the loop — which is LangGraph's reason to exist.",
        ],
        solution:
          "The tool-calling loop is a **cycle with a data-dependent branch**: after the model runs, the system must decide — based on whether the AIMessage contains `.tool_calls` — to execute tools and route *back* to the model (a back edge), or to stop. LCEL composes Runnables into a directed **acyclic** pipeline of pure transforms (Unit 1): data flows forward once, with no construct to route output back to an earlier stage or to branch on that output. So LCEL structurally cannot represent the loop — you must either hand-roll a `while` loop or use a graph whose model *is* cyclic with conditional edges. A hand-rolled while-loop technically works but reinvents, poorly, what LangGraph provides: **persistence/checkpointing** (the loop's state is saved each step, so a crash can resume rather than restart), a **recursion/step limit** (guaranteed termination of the cycle), **streaming** of intermediate steps (tool calls/results) to the UI, **parallel** execution of independent tool calls, and **pause-for-human-approval** before risky actions. The deeper point: the hard part of an agent isn't calling the model — it's managing the *state, control flow, and durability* around the loop, which is exactly what a graph framework exists to do.",
        explanation: "The loop is a cycle + conditional (impossible in an acyclic LCEL pipeline); a graph adds persistence, a step limit, streaming, parallelism, and human-in-the-loop around it.",
      },
    ],
  },
};
