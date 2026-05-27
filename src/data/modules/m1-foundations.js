export default
    {
      id: "m1", number: "01", title: "AI Foundations", accent: "#FF6B35",
      desc: "The landscape of artificial intelligence — taxonomy, capabilities, and why it matters now.",
      lessons: [
        { id: "m1l1", title: "What Is AI, Really?", duration: "8 min", tags: ["concepts","intro"],
          content: [
            { type: "text", heading: "Beyond the Buzzwords", body: "AI is pattern recognition at scale. Every AI system — from spam filters to GPT-4 — works by finding statistical patterns in data and using those patterns to make predictions or decisions.\n\nAI is NOT magic. It's mathematics. Understanding this is the foundation for everything else." },
            { type: "text", heading: "The AI Taxonomy", body: "**Narrow AI (ANI)** — What exists today. Systems that excel at ONE specific task. Every commercial AI product is narrow AI.\n\n**General AI (AGI)** — Hypothetical human-level reasoning across all domains. Doesn't exist yet.\n\n**Superintelligence (ASI)** — AI surpassing human intelligence. Purely theoretical." },
            { type: "text", heading: "Why Now? The Three Forces", body: "**1. Data** — The internet generated unprecedented volumes of training data.\n\n**2. Compute** — GPUs + cloud computing made massive parallel computation accessible.\n\n**3. Algorithms** — The Transformer architecture (2017) enabled models to process sequences in parallel, unlocking capabilities previous architectures couldn't achieve." },
            { type: "checklist", heading: "Key Mental Models", items: [
              "AI is a tool, not a product — value comes from application to real problems",
              "The companies winning with AI understand their data and processes first",
              "Capabilities are advancing monthly — what's impossible today may be trivial in 6 months",
              "Start with the problem, not the technology"
            ]}
          ]
        },
        { id: "m1l2", title: "ML vs Deep Learning vs GenAI", duration: "10 min", tags: ["concepts","ml"],
          content: [
            { type: "text", heading: "The Hierarchy", body: "Think nested circles: AI → Machine Learning → Deep Learning → Generative AI. Each layer adds capability and complexity." },
            { type: "text", heading: "Machine Learning", body: "Training algorithms on data so they can make predictions without explicit programming.\n\n**Supervised Learning** — Labeled examples. \"Here are 10,000 emails labeled spam/not-spam.\" Used for classification, regression, prediction.\n\n**Unsupervised Learning** — No labels. Algorithm finds structure. \"Find natural groupings in these 100K transactions.\" Used for clustering, anomaly detection.\n\n**Reinforcement Learning** — Agent learns by trial and error with rewards. Used for robotics, game AI, optimization." },
            { type: "text", heading: "Deep Learning", body: "Neural networks with many layers learning hierarchical representations from raw data. Key architectures:\n\n**CNNs** — Dominant for image processing\n**RNNs/LSTMs** — Sequential data (largely replaced by Transformers)\n**Transformers** — The architecture behind modern LLMs" },
            { type: "text", heading: "Generative AI", body: "Models that create new content by learning statistical distributions of training data.\n\n**LLMs** (GPT-4, Claude, Gemini, Llama) — Predict the next token in a sequence\n**Diffusion Models** (DALL-E, Stable Diffusion) — Denoise random noise into coherent images\n**Multimodal Models** — Combine text, image, audio, video understanding" },
            { type: "decision", heading: "Quick Decision: Which AI Type?", rows: [
              ["Structured data, clear labels", "Supervised ML (XGBoost, random forest)"],
              ["Finding patterns in unlabeled data", "Unsupervised ML (clustering, PCA)"],
              ["Image classification/detection", "CNN or Vision Transformer"],
              ["Text understanding/generation", "LLM (GPT-4, Claude, Llama)"],
              ["Content creation (images, text)", "Generative AI"],
              ["Complex multi-step reasoning", "LLM with chain-of-thought or agents"],
            ]}
          ]
        },
        { id: "m1l3", title: "The Current AI Landscape", duration: "7 min", tags: ["concepts","landscape"],
          content: [
            { type: "text", heading: "The Players", body: "**Frontier Labs** — OpenAI (GPT), Anthropic (Claude), Google DeepMind (Gemini), Meta (Llama)\n\n**Cloud Platforms** — Azure AI, AWS Bedrock, Google Vertex AI\n\n**Open Source** — Hugging Face, Meta Llama, Mistral\n\n**Tooling** — LangChain, LlamaIndex, Semantic Kernel" },
            { type: "text", heading: "What's Changing Fast", body: "**Context windows** — 4K → 200K+ tokens\n**Multimodality** — See, hear, read simultaneously\n**Reasoning** — Planning, decomposition, self-correction\n**Cost** — 100x cheaper than 2 years ago\n**Agents** — Autonomous multi-step workflow execution" },
            { type: "checklist", heading: "Key Takeaways", items: [
              "Most enterprises are still in early stages — the opportunity for implementors is massive",
              "The biggest challenges are organizational, not technical: data quality, change management, ROI",
              "Stay model-agnostic — use abstraction layers that let you swap providers",
              "The tooling layer (Semantic Kernel, LangChain) is where most implementation work happens"
            ]}
          ]
        }
      ]
    }
;
