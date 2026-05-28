export default
    {
      id: "m1", number: "01", title: "AI Foundations", accent: "#FF6B35",
      desc: "The landscape of artificial intelligence — taxonomy, capabilities, and why it matters now.",
      lessons: [
        { id: "m1l1", title: "What Is AI, Really?", duration: "16 min", tags: ["concepts","intro","mental-models","mechanics"],
          content: [
            { type: "text", heading: "Beyond the Buzzwords", body: "AI is pattern recognition at scale. Every AI system — from spam filters to GPT-4 — works by finding statistical patterns in data and using those patterns to make predictions or decisions.\n\nAI is NOT magic. It's mathematics. Understanding this is the foundation for everything else — so before the taxonomy and the buzzwords, let's look at the actual mechanism that makes all of it work." },

            { type: "text", heading: "What \"Learning From Data\" Actually Means", body: "Saying \"AI finds patterns\" is true but vague. Here is the concrete mechanism behind essentially every modern AI system.\n\nA model is a giant mathematical function with adjustable internal numbers called **parameters** (or **weights**) — frontier models have hundreds of billions of them. Initially the weights are random, so the model's outputs are garbage.\n\n**Training** is a feedback loop: show the model an example, compare its output to the correct answer, and nudge every weight slightly in the direction that would have reduced the error. The size and direction of each nudge is computed with calculus — the **gradient** — which is why the process is called *gradient descent*. Repeat across billions of examples and the weights gradually settle into values that encode the statistical structure of the data.\n\nThat is the whole trick. No rule-writing, no hand-coded logic. The \"intelligence\" is just a very large set of numbers tuned to map inputs to likely outputs." },

            { type: "code", heading: "The Learning Loop, in Pseudocode", lang: "python", code: `# Every "learning" system — spam filter, image classifier, or GPT —
# is a variation on this loop:

model = init_random_parameters()        # billions of numbers, all random ("weights")

for example_input, correct_output in training_data:
    prediction = model(example_input)            # run input through CURRENT weights
    error      = compare(prediction, correct_output)   # how wrong were we?
    gradient   = how_each_weight_affected_error(error) # calculus does this
    model      = nudge_weights(model, gradient)        # shrink the error a little

# After billions of nudges the weights encode the patterns in the data.
#   "Training"  = finding the weights   (expensive, done once)
#   "Inference" = using the frozen weights (cheap, done per request)` },

            { type: "text", heading: "From Training to Prediction (Inference)", body: "Once training stops, the weights are **frozen**. Using the model — called **inference** — is just arithmetic: the input flows through the fixed weights and an output comes out. No learning happens at inference time, which is why a model doesn't remember your last question unless you feed the conversation back in every time.\n\nFor an LLM specifically, the output is a **probability distribution over the next token** (roughly, the next word-piece). The model says \"given everything so far, the next token is 73% 'the', 11% 'a', 4% 'an'…\" and one is sampled. Append it, then repeat. Fluent paragraphs emerge from millions of these next-token guesses.\n\nThis is why the same prompt can produce different answers (sampling is random), and why models are fundamentally *predictors of plausible continuations*, not databases of facts." },

            { type: "text", heading: "Why This Explains Both the Magic and the Failures", body: "Almost every surprising behavior of AI follows directly from \"it is a pattern predictor\":\n\n**Generalization (the magic)** — Because training finds general patterns, the model handles inputs it never saw exactly, by interpolating between things it did see.\n\n**Out-of-distribution failure** — Ask about something unlike its training data and it has no patterns to lean on; quality collapses.\n\n**Hallucination** — The model generates *plausible* text, not *true* text. A confident, well-formed, wrong answer is the system working exactly as designed — it optimized for plausibility, not accuracy.\n\n**Bias** — Patterns in the training data, including societal biases, get encoded in the weights and reproduced in outputs.\n\nHold onto this mental model. Most of this course is techniques for steering a plausibility-predictor toward correctness: grounding it in real data (RAG, Module 4), constraining its outputs (prompting and tools, Modules 3 and 5), and verifying its work (evals, throughout)." },

            { type: "text", heading: "The AI Taxonomy", body: "**Narrow AI (ANI)** — What exists today. Systems that excel at ONE specific task. Every commercial AI product is narrow AI.\n\n**General AI (AGI)** — Hypothetical human-level reasoning across all domains. Doesn't exist yet.\n\n**Superintelligence (ASI)** — AI surpassing human intelligence. Purely theoretical." },

            { type: "text", heading: "What Actually Makes Today's AI \"Narrow\"", body: "The ANI/AGI/ASI labels are useful, but what concretely separates today's \"narrow\" AI from the general AI of science fiction?\n\n**No transfer** — Skills are learned separately; competence in one domain doesn't automatically create competence in another.\n**No persistent goals** — It responds to inputs; it has no ongoing intentions between calls.\n**No grounded understanding** — It models *correlations* in text and pixels, not the physical world those represent.\n**No self-directed learning** — It can't choose to go learn something new; its knowledge is frozen at training time.\n\nModern frontier models blur the edges — a single model can now translate, write code, and analyze images — but each skill still comes from patterns in training data, not from general reasoning. \"AGI\" would mean closing those gaps; whether scaling today's methods gets there is the central open debate in the field." },

            { type: "text", heading: "Why Now? The Three Forces", body: "**1. Data** — The internet generated unprecedented volumes of training data.\n\n**2. Compute** — GPUs + cloud computing made massive parallel computation accessible.\n\n**3. Algorithms** — The Transformer architecture (2017) enabled models to process sequences in parallel, unlocking capabilities previous architectures couldn't achieve." },

            { type: "text", heading: "The Scaling Hypothesis — Why It Kept Working", body: "The reason AI exploded after 2020 isn't a single clever idea — it's that researchers found capability scales *predictably* with size. **Scaling laws** show that as you increase three things together — parameters, training data, and compute — model performance improves along a smooth, forecastable curve.\n\nMore striking still: some abilities (multi-step arithmetic, following instructions, in-context learning) appeared **emergently** — absent in smaller models, then \"switching on\" once models crossed a size threshold. Nobody programmed those abilities; they fell out of scale.\n\nThis turned AI progress into something close to an engineering and economics problem: spend more on compute and data, get a more capable model. That's why labs raised billions for ever-larger training runs. The open question now is whether the curve keeps paying off or flattens — which is exactly what people mean when they argue about \"hitting a wall\" versus \"scaling continues.\"" },

            { type: "decision", heading: "Is This Even an AI Problem?", rows: [
              ["Rules are clear, fixed, and auditable (tax brackets, form validation)", "Traditional code — deterministic, cheaper, fully testable. Don't use AI."],
              ["Pattern is obvious from data but hard to express as rules (spam, fraud)", "Classic ML — train on labeled examples"],
              ["Task involves understanding or generating language, images, or audio", "Generative AI / LLM"],
              ["You need the exact same answer every time", "Avoid LLMs — they're probabilistic; use code or constrain heavily"],
              ["Problem changes constantly and tolerates 'good enough'", "AI shines — it adapts without re-coding the rules"],
              ["You have no data and no way to collect it", "Not yet an ML problem — start by instrumenting to gather data"],
            ]},

            { type: "text", heading: "Common Misconceptions", body: "**\"The AI understands me.\"** It models statistical relationships in language. The output can be indistinguishable from understanding without any inner comprehension — worth remembering when it confidently fails.\n\n**\"AI is objective.\"** It inherits the biases of its training data and the choices of its builders. \"The algorithm decided\" is never a neutral statement.\n\n**\"AI is deterministic.\"** Most generative systems sample randomly, so the same input yields different outputs. Reproducibility takes deliberate effort (fixed seeds, temperature 0, caching).\n\n**\"Bigger is always better.\"** Larger models cost more and run slower. A small, well-targeted model often beats a frontier model on a narrow task at a fraction of the price — a theme we return to in model selection (m2l5)." },

            { type: "checklist", heading: "Key Mental Models", items: [
              "AI is a tool, not a product — value comes from application to real problems",
              "Under the hood it's just tuned numbers mapping inputs to likely outputs — math, not magic",
              "LLMs predict plausible continuations, not verified facts — design for hallucination from day one",
              "The companies winning with AI understand their data and processes first",
              "If clear rules exist, write code — reserve AI for problems rules can't capture",
              "Capabilities advance along scaling curves — what's impossible today may be trivial in 6 months",
              "Start with the problem, not the technology",
            ]}
          ]
        },
        { id: "m1l2", title: "ML vs Deep Learning vs GenAI", duration: "17 min", tags: ["concepts","ml","mechanics","mental-models"],
          content: [
            { type: "text", heading: "The Hierarchy", body: "Think nested circles: AI → Machine Learning → Deep Learning → Generative AI. Each layer adds capability and complexity." },

            { type: "text", heading: "Why the Nesting Matters", body: "The nesting isn't just trivia — each inner layer makes the same trade: **less human engineering, more data and compute.**\n\n**Classic ML** — A human decides which features matter (you engineer the inputs); the algorithm learns weights over them.\n**Deep Learning** — The network learns the features itself from raw data; you supply architecture and lots of examples instead of hand-built signals.\n**Generative AI** — A deep network trained at massive scale doesn't just classify, it learns the data distribution well enough to *produce* new samples.\n\nMoving inward buys capability and generality at the cost of data, compute, and interpretability. That trade is the whole story of the last decade of AI." },

            { type: "text", heading: "Machine Learning", body: "Training algorithms on data so they can make predictions without explicit programming.\n\n**Supervised Learning** — Labeled examples. \"Here are 10,000 emails labeled spam/not-spam.\" Used for classification, regression, prediction.\n\n**Unsupervised Learning** — No labels. Algorithm finds structure. \"Find natural groupings in these 100K transactions.\" Used for clustering, anomaly detection.\n\n**Reinforcement Learning** — Agent learns by trial and error with rewards. Used for robotics, game AI, optimization." },

            { type: "text", heading: "The Defining Trait of Classic ML: Feature Engineering", body: "What makes classic ML *classic* is that **humans design the features.** To detect spam, an engineer decides the model should look at: number of links, sender domain age, ratio of capital letters, presence of certain words. Each email becomes a row of numbers — a **feature vector** — and the algorithm (logistic regression, random forest, XGBoost) learns a weight for each feature.\n\nThe model is only as good as the features you hand it. Most of the work — and most of the skill — is in feature engineering, not the algorithm. This is why classic ML still dominates for **structured / tabular data** (spreadsheets, transactions, sensor readings): the features are already columns, it's cheap to train, fast to run, and easy to explain. For tabular prediction, gradient-boosted trees often still beat neural networks outright." },

            { type: "text", heading: "Deep Learning", body: "Neural networks with many layers learning hierarchical representations from raw data. Key architectures:\n\n**CNNs** — Dominant for image processing\n**RNNs/LSTMs** — Sequential data (largely replaced by Transformers)\n**Transformers** — The architecture behind modern LLMs" },

            { type: "text", heading: "What \"Deep\" Actually Means: Layers & Representations", body: "A neural network is layers of simple math units. Each **layer** takes the previous layer's output, multiplies it by a matrix of **parameters** (the learned weights), and applies a simple non-linear function. \"Deep\" just means *many* such layers stacked.\n\nThe power of depth is **hierarchical representation.** Early layers learn primitive features; later layers combine them into higher-level concepts. For images: pixels → edges → shapes → object parts → objects. For text: characters → words → phrases → meaning. Crucially, *nobody specifies these features* — they emerge from training because that's what minimizes error.\n\nThis is why deep learning displaced classic ML for images, audio, and language: it **learns the features automatically**, eliminating the manual feature engineering that high-dimensional, messy inputs made nearly impossible by hand. The cost: far more data, far more compute, and learned features that aren't human-readable." },

            { type: "code", heading: "Feature Engineering vs Learned Features", lang: "python", code: `# CLASSIC ML — the human builds the features by hand:
def email_to_features(email):
    return [
        count_links(email),            # a human decided these matter
        sender_domain_age_days(email),
        fraction_caps(email),
        contains_word(email, "free"),
    ]

X = [email_to_features(e) for e in emails]   # rows of numbers YOU designed
model = XGBoost().fit(X, labels)             # learns weights over your features


# DEEP LEARNING — the network builds the features itself:
X = [raw_tokens(e) for e in emails]          # just the raw text, no hand-crafting
model = NeuralNetwork(layers=12).fit(X, labels)
#   layer 1  might learn "word-ish" patterns
#   layer 5  might learn "phrase-ish" patterns
#   layer 12 might learn "this smells like spam"
#   ...none of which you programmed. The cost is data + compute.` },

            { type: "text", heading: "Generative AI", body: "Models that create new content by learning statistical distributions of training data.\n\n**LLMs** (GPT-4, Claude, Gemini, Llama) — Predict the next token in a sequence\n**Diffusion Models** (DALL-E, Stable Diffusion) — Denoise random noise into coherent images\n**Multimodal Models** — Combine text, image, audio, video understanding" },

            { type: "text", heading: "Discriminative vs Generative: The Core Distinction", body: "The deepest split isn't ML-vs-DL — it's **discriminative vs generative**, and it explains what each can actually do.\n\n**Discriminative models** learn the *boundary between* categories — informally, P(label | input). Given an email, output spam-or-not. Given an image, output cat-or-dog. They draw lines; they classify and predict. Most classic ML and much of deep learning is discriminative.\n\n**Generative models** learn the *distribution of the data itself* — informally, P(input). Once you've modeled what real data looks like, you can **sample new examples** from it: new sentences, new images, new audio. That is why \"Generative AI\" can create rather than merely label.\n\nAn LLM is a generative model of text: it learned the distribution of token sequences so well that sampling from it produces coherent writing." },

            { type: "text", heading: "Why Generative AI Changed the Workflow", body: "Generative AI didn't just add a capability — it changed how you *build* with AI.\n\n**Old workflow (classic ML / discriminative DL):** collect a labeled dataset for your specific task, train a model for that task, deploy it. Want a second task? Collect more data, train a second model.\n\n**New workflow (foundation models):** one giant pre-trained model already knows language (or vision). You adapt it with a **prompt** — plain instructions and examples in the input — often with *zero* additional training. The same model summarizes, translates, classifies, and writes code depending only on what you ask.\n\nThis is the shift from \"a model per task\" to \"one general model, many tasks via prompting.\" It's why prompt engineering (Module 3) and retrieval (Module 4) — not model training — are where most implementation effort now goes." },

            { type: "text", heading: "Common Confusions", body: "**\"Is an LLM deep learning or generative AI?\"** Both. It's a deep neural network (a Transformer) that is also generative. The categories nest and overlap — a thing can be ML *and* DL *and* GenAI at once.\n\n**\"Is all generative AI an LLM?\"** No. Image diffusion models (DALL·E, Stable Diffusion) are generative but not language models.\n\n**\"Is deep learning always better than classic ML?\"** No. On structured/tabular data with limited examples, gradient-boosted trees usually win — cheaper, faster, more interpretable.\n\n**\"Do I need deep learning to use AI?\"** Almost never directly. As an implementor you'll mostly *call* pre-trained foundation models via an API; you rarely train networks from scratch." },

            { type: "decision", heading: "Quick Decision: Which AI Type?", rows: [
              ["Structured data, clear labels", "Supervised ML (XGBoost, random forest)"],
              ["Tabular data needing explainability (credit, risk)", "Gradient-boosted trees — strong on tables and interpretable"],
              ["Finding patterns in unlabeled data", "Unsupervised ML (clustering, PCA)"],
              ["Image classification/detection", "CNN or Vision Transformer"],
              ["Text understanding/generation", "LLM (GPT-4, Claude, Llama)"],
              ["Content creation (images, text)", "Generative AI"],
              ["Many varied language tasks at once", "One foundation LLM adapted by prompting, not bespoke models"],
              ["Complex multi-step reasoning", "LLM with chain-of-thought or agents"],
            ]},

            { type: "checklist", heading: "Choosing the Right Tool", items: [
              "Tabular / structured data → classic ML (gradient-boosted trees) is usually the right, cheap default",
              "Images, audio, or raw language → deep learning learns the features you can't hand-craft",
              "Need to create content, not just label it → generative models",
              "Many different language tasks → one foundation LLM + prompting beats many bespoke models",
              "More capability and generality costs more data, compute, and interpretability — pick the least powerful tool that solves the problem",
              "You'll rarely train models from scratch — most implementation work is calling and steering pre-trained models",
            ]}
          ]
        },
        { id: "m1l3", title: "The Current AI Landscape", duration: "14 min", tags: ["concepts","landscape","strategy","models"],
          content: [
            { type: "text", heading: "The Players", body: "**Frontier Labs** — OpenAI (GPT), Anthropic (Claude), Google DeepMind (Gemini), Meta (Llama)\n\n**Cloud Platforms** — Azure AI, AWS Bedrock, Google Vertex AI\n\n**Open Source** — Hugging Face, Meta Llama, Mistral\n\n**Tooling** — LangChain, LlamaIndex, Semantic Kernel" },

            { type: "text", heading: "Why the Landscape Looks Like This", body: "The shape of the market follows directly from three economic facts.\n\n**Training frontier models is brutally expensive.** A single state-of-the-art training run costs tens to hundreds of millions of dollars in compute. That's why only a handful of well-capitalized labs build frontier base models — and why each is backed by, or partnered with, a cloud giant.\n\n**Compute is the bottleneck.** Training needs tens of thousands of high-end GPUs. NVIDIA designs the chips nearly everyone uses, which is why a chipmaker became one of the most valuable companies on earth. Access to GPUs, not ideas, is often the gating constraint.\n\n**Data is the other bottleneck.** The easily-scraped public internet has largely been consumed. The next gains increasingly come from proprietary, licensed, and synthetic data — which is exactly why your organization's unique data is a genuine competitive asset.\n\nUnderstand these forces and the rest of the landscape — the partnerships, the pricing, the open-vs-closed fight — stops looking like chaos and starts looking like consequences." },

            { type: "text", heading: "The Three Layers of the Stack", body: "It helps to see the ecosystem as three layers:\n\n**1. Model layer** — The foundation models themselves (GPT, Claude, Gemini, Llama, Mistral). Enormous cost to produce, increasingly commoditized to consume. A few players.\n\n**2. Platform layer** — Clouds that host and serve models with enterprise plumbing: Azure AI Foundry, AWS Bedrock, Google Vertex AI. They wrap raw models in security, networking, scaling, and compliance.\n\n**3. Tooling & application layer** — Orchestration (Semantic Kernel, LangChain, LlamaIndex), vector databases, eval tools, and the actual products built on top.\n\n**As an implementor, you live in layers 2 and 3.** You almost never train a model (layer 1); you compose, ground, and deploy them. That's where the work — and most of the durable value — is." },

            { type: "text", heading: "Open vs Closed (Proprietary) Models", body: "A central fault line in the landscape is **open-weight** vs **closed (API-only)** models.\n\n**Closed / proprietary** (GPT-4, Claude, Gemini) — You call them over an API. Usually the most capable, with zero infrastructure to manage. But you can't see the weights, your data leaves your environment (subject to the provider's terms), and you're exposed to price and availability changes.\n\n**Open-weight** (Llama, Mistral, and many others) — The weights are downloadable. You can run them in your own environment, fine-tune freely, inspect them, and pin a version forever. The trade: you manage the infrastructure and GPUs, and the very best open model typically trails the very best closed model by 6–18 months.\n\nNote: \"open-weight\" rarely means fully open-source — training data and code are usually withheld, and licenses can restrict commercial use. Always read the license." },

            { type: "decision", heading: "Closed API vs Open-Weight?", rows: [
              ["Need the highest possible capability, fast", "Closed frontier API (GPT / Claude / Gemini)"],
              ["Strict data residency — data can't leave your tenant", "Open-weight self-hosted, or a closed model deployed in your own cloud tenant"],
              ["Need to fine-tune deeply on proprietary data", "Open-weight — full control over training"],
              ["High, predictable volume where per-token API cost hurts", "Open-weight self-hosted can be cheaper at scale"],
              ["Small team, no MLOps or GPU expertise", "Closed API — no infrastructure to run"],
              ["Must pin an exact, unchanging model version for years", "Open-weight — closed models get deprecated on the provider's schedule"],
            ]},

            { type: "text", heading: "How to Read a Model Before You Pick It", body: "Every model — open or closed — ships with a spec sheet (a \"model card\"). The dimensions that actually matter for implementation:\n\n**Context window** — How much text it can consider at once (8K vs 200K+ tokens). Governs how much document or conversation history you can feed it.\n**Modality** — Text only, or also images / audio / video, in and out.\n**Cost** — Price per million input and output tokens. Output is usually several times pricier than input.\n**Latency / throughput** — Time-to-first-token and tokens-per-second. Critical for chat UX vs overnight batch jobs.\n**Knowledge cutoff** — The date its training data ends. Anything after that it doesn't know, unless you supply it via RAG.\n**License & data policy** — Commercial-use terms, and whether your prompts are retained or used for training.\n**Reported benchmarks** — Useful as a rough filter, dangerous as gospel (next block).\n\nWe turn these into an actual decision in m2l5 (Model Selection Guide)." },

            { type: "text", heading: "Why Benchmarks Lie (and How to Use Them Anyway)", body: "Every model launch trumpets benchmark scores (MMLU, GSM8K, HumanEval, and friends). Treat them with skepticism:\n\n**Contamination** — If the benchmark's questions leaked into the training data, the model effectively memorized the answers. This happens constantly with public benchmarks.\n**Gaming** — Labs optimize for the metrics everyone watches; a high score can reflect benchmark-tuning more than general ability.\n**Saturation** — Top models now cluster near the ceiling on older benchmarks, so a one-point difference is noise, not signal.\n**Distribution mismatch** — A model that aces general benchmarks may be mediocre on *your* specific data and tasks.\n\nUse public benchmarks only to build a shortlist. Then do the thing that actually matters: **run your own evaluation on your own representative data** (Modules 4 and 5 cover how). The model that wins on your eval set is the right model — regardless of who tops the public leaderboard." },

            { type: "text", heading: "What's Changing Fast", body: "**Context windows** — 4K → 200K+ tokens\n**Multimodality** — See, hear, read simultaneously\n**Reasoning** — Planning, decomposition, self-correction\n**Cost** — 100x cheaper than 2 years ago\n**Agents** — Autonomous multi-step workflow execution" },

            { type: "text", heading: "Where This Is Heading", body: "Two trends should shape how you bet:\n\n**Base models are commoditizing.** Capability gaps between providers are narrowing and prices keep falling (roughly 10x cheaper per year for a given capability). Raw model access is becoming a utility, like electricity — essential, but not where you build a moat.\n\n**Value is migrating up the stack.** The durable advantage isn't \"we use the best model\" — everyone can rent it next quarter. It's your proprietary data, your domain workflows, your integrations, and your evaluation and quality systems. Those are hard to copy.\n\nThe practical hedge: **stay model-agnostic.** Build behind an abstraction layer (Semantic Kernel, LangChain, LiteLLM) so swapping providers is a config change, not a rewrite. Assume the best model will change every few months — because it will." },

            { type: "checklist", heading: "Key Takeaways", items: [
              "Most enterprises are still in early stages — the opportunity for implementors is massive",
              "The landscape's shape follows from economics: frontier training costs $100M+, and compute and data are the bottlenecks",
              "You work at the platform and tooling layers — you compose and ground models, you rarely train them",
              "Open-weight buys control, privacy, and version stability; closed APIs buy peak capability with zero infra",
              "Read the model card — context window, cost, modality, cutoff, license — not just the headline benchmark",
              "Trust your own evals over public leaderboards; benchmarks get contaminated and gamed",
              "Stay model-agnostic with an abstraction layer — the best model will change every few months",
              "The biggest challenges are organizational, not technical: data quality, change management, ROI",
            ]}
          ]
        }
      ]
    }
;
