export default
    {
      id: "m2", number: "02", title: "How LLMs Work", accent: "#00D4AA",
      desc: "Tokenization, attention, training, and inference — the mechanics behind the magic.",
      lessons: [
        { id: "m2l1", title: "Tokenization & Embeddings", duration: "9 min", tags: ["llm","embeddings","rag"],
          content: [
            { type: "text", heading: "From Text to Numbers", body: "Tokenizers convert text into numerical tokens using subword algorithms like BPE (Byte Pair Encoding). \"unhappiness\" → [\"un\", \"happiness\"] or [\"un\", \"hap\", \"pi\", \"ness\"]." },
            { type: "checklist", heading: "Why Tokenization Matters Practically", items: [
              "Cost — API pricing is per-token. ~4 chars = 1 token for English",
              "Context limits — 128K tokens ≈ 96K words for English",
              "Some languages tokenize less efficiently (more tokens per word = higher cost)",
              "Structured output (JSON) is generated token-by-token, which is why it can break"
            ]},
            { type: "text", heading: "Embeddings: The Semantic Layer", body: "An embedding is a dense vector representing meaning. Similar meanings → similar vectors.\n\n\"The cat sat on the mat\" and \"A feline rested on the rug\" produce nearly identical vectors despite sharing almost no words." },
            { type: "code", heading: "Generate Embeddings — C# / Azure OpenAI", lang: "csharp", code: `// Using Azure.AI.OpenAI NuGet package
using Azure.AI.OpenAI;
using Azure;

var client = new AzureOpenAIClient(
    new Uri("https://YOUR-RESOURCE.openai.azure.com/"),
    new AzureKeyCredential("YOUR-KEY"));

var embeddingClient = client.GetEmbeddingClient("text-embedding-3-small");

// Single embedding
var result = await embeddingClient.GenerateEmbeddingAsync("Your text here");
ReadOnlyMemory<float> vector = result.Value.ToFloats();

// Batch embeddings (cheaper, faster)
var inputs = new[] { "First doc", "Second doc", "Third doc" };
var batchResult = await embeddingClient.GenerateEmbeddingsAsync(inputs);
foreach (var embedding in batchResult.Value)
{
    ReadOnlyMemory<float> v = embedding.ToFloats();
    // Store in your vector DB
}` },
            { type: "code", heading: "Generate Embeddings — Python", lang: "python", code: `from openai import AzureOpenAI

client = AzureOpenAI(
    azure_endpoint="https://YOUR-RESOURCE.openai.azure.com/",
    api_key="YOUR-KEY",
    api_version="2024-06-01"
)

# Single embedding
result = client.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)
vector = result.data[0].embedding  # List[float]

# Batch embeddings
texts = ["First doc", "Second doc", "Third doc"]
result = client.embeddings.create(
    model="text-embedding-3-small",
    input=texts
)
vectors = [item.embedding for item in result.data]` },
            { type: "decision", heading: "Embedding Model Selection", rows: [
              ["General purpose, cost-sensitive", "text-embedding-3-small (1536 dims)"],
              ["Higher accuracy needed", "text-embedding-3-large (3072 dims)"],
              ["Open source / self-hosted", "BGE-large-en, E5-large-v2"],
              ["Multilingual requirements", "Cohere embed-multilingual-v3"],
              ["Already on Azure", "Azure OpenAI text-embedding-3-small"],
            ]}
          ]
        },
        { id: "m2l2", title: "The Transformer Architecture", duration: "12 min", tags: ["llm","transformer"],
          content: [
            { type: "text", heading: "Attention Is All You Need", body: "The 2017 paper that changed everything. Self-attention lets every token \"attend to\" every other token simultaneously, capturing long-range dependencies.\n\nBefore: models processed sequences left-to-right (slow, lost context).\nAfter: entire sequence processed at once (fast, rich context)." },
            { type: "text", heading: "Self-Attention Intuition", body: "\"The animal didn't cross the street because it was too tired.\"\n\nWhat does \"it\" refer to? Self-attention computes scores between \"it\" and every other word. High attention to \"animal\", low attention to \"street.\"\n\nMultiple attention heads learn different relationship types — syntactic, semantic, positional." },
            { type: "text", heading: "Architecture Stack", body: "**Input Embedding + Positional Encoding** — Tokens → vectors + position info\n**Encoder** (optional) — Processes input. Used in BERT-style models.\n**Decoder** — Generates tokens one at a time. GPT/Claude are decoder-only.\n**Feed-Forward Networks** — Transform representations at each position\n**Layer Norm + Residual Connections** — Make deep networks trainable" },
            { type: "text", heading: "Scale Creates Emergence", body: "1B params → basic text completion\n70B params → complex reasoning\n400B+ params → code, images, nuanced conversation\n\nNew abilities appear at scale that weren't predicted. This emergence is still not fully understood." }
          ]
        },
        { id: "m2l3", title: "Training, Fine-Tuning & RLHF", duration: "10 min", tags: ["llm","fine-tuning","training"],
          content: [
            { type: "text", heading: "Pre-Training", body: "Simple objective: predict the next token on massive text corpus. Unsupervised — no labels needed. Cost: $50M–$100M+ for frontier models." },
            { type: "text", heading: "Fine-Tuning", body: "Adapt a pre-trained model to specific tasks/domains with curated data.\n\n**Full fine-tuning** — Update all params. Expensive, thorough.\n**LoRA** — Train small adapter layers, freeze base model. Much cheaper, nearly as good.\n**QLoRA** — LoRA + quantization. Fine-tune 70B models on a single GPU." },
            { type: "decision", heading: "Should You Fine-Tune?", rows: [
              ["Need consistent style/format", "Yes — fine-tuning excels here"],
              ["Domain-specific jargon/knowledge", "Try RAG first, fine-tune if insufficient"],
              ["Improve accuracy on narrow task", "Yes — with enough quality examples (500+)"],
              ["Need up-to-date information", "No — use RAG instead (fine-tuned knowledge is static)"],
              ["Limited budget/data", "No — use prompt engineering + few-shot examples"],
              ["Reduce latency/cost at scale", "Yes — distill large model behavior into smaller model"],
            ]},
            { type: "text", heading: "RLHF & Alignment", body: "How raw language models become helpful assistants:\n\n**Step 1** — Train reward model on human preferences (\"which response is better?\")\n**Step 2** — Optimize language model against reward model via RL (PPO or DPO)\n\nNewer approaches: Constitutional AI (Anthropic), RLAIF (AI feedback at scale)." }
          ]
        },
        { id: "m2l4", title: "Token Economics & Cost Optimization", duration: "11 min", tags: ["llm","cost","tokens","production"],
          content: [
            { type: "text", heading: "How LLM Pricing Works", body: "LLM APIs charge per token — both input and output. Input tokens (your prompt + context) and output tokens (the model's response) are priced separately, with output tokens typically 3-5x more expensive.\n\n**Why this matters:** A RAG system sending 4000 tokens of context + a 100-token question, getting a 500-token answer, costs based on 4100 input + 500 output tokens. The context dominates your bill.\n\n**Token estimation:** 1 token ≈ 4 characters ≈ 0.75 words in English. A typical page of text is ~500 tokens. A full 128K context window is roughly a 200-page book." },
            { type: "decision", heading: "Current Pricing Landscape (approximate, per 1M tokens)", rows: [
              ["Claude Opus 4", "$15 input / $75 output — complex reasoning, analysis"],
              ["Claude Sonnet 4", "$3 input / $15 output — best general-purpose balance"],
              ["Claude Haiku 3.5", "$0.80 input / $4 output — fast extraction, classification"],
              ["GPT-4o", "$2.50 input / $10 output — strong multimodal"],
              ["GPT-4o-mini", "$0.15 input / $0.60 output — simple tasks at scale"],
              ["Llama 3.1 70B (self-hosted)", "$0 API cost, ~$2/hr GPU compute"],
            ]},
            { type: "text", heading: "Prompt Caching", body: "Prompt caching is the single biggest cost optimization for production systems. When your system prompt + static context is the same across requests, the provider caches the KV representations and charges a reduced rate.\n\n**Anthropic:** Cached input tokens cost 90% less. Cache is created automatically for prompts > 1024 tokens that share a common prefix. Cache lives for 5 minutes, refreshed on each hit.\n\n**OpenAI:** Similar automatic caching for prompts > 1024 tokens. 50% discount on cached tokens.\n\n**Practical impact:** A RAG system with a 2000-token system prompt serving 10,000 queries/day saves ~$50-200/day on Sonnet just from caching the system prompt." },
            { type: "code", heading: "Cost Estimation Utility — Python", lang: "python", code: `import tiktoken

def estimate_cost(
    prompt: str,
    expected_output_tokens: int = 500,
    model: str = "claude-sonnet",
    cached_prefix_tokens: int = 0
) -> dict:
    """Estimate the cost of an LLM API call."""
    
    # Pricing per 1M tokens (update as needed)
    PRICING = {
        "claude-opus":   {"input": 15.00, "output": 75.00, "cache_read": 1.50},
        "claude-sonnet": {"input": 3.00,  "output": 15.00, "cache_read": 0.30},
        "claude-haiku":  {"input": 0.80,  "output": 4.00,  "cache_read": 0.08},
        "gpt-4o":        {"input": 2.50,  "output": 10.00, "cache_read": 1.25},
        "gpt-4o-mini":   {"input": 0.15,  "output": 0.60,  "cache_read": 0.075},
    }
    
    enc = tiktoken.encoding_for_model("gpt-4o")  # approximate
    input_tokens = len(enc.encode(prompt))
    
    prices = PRICING[model]
    uncached_tokens = input_tokens - cached_prefix_tokens
    
    input_cost = (uncached_tokens / 1_000_000) * prices["input"]
    cache_cost = (cached_prefix_tokens / 1_000_000) * prices["cache_read"]
    output_cost = (expected_output_tokens / 1_000_000) * prices["output"]
    total = input_cost + cache_cost + output_cost
    
    return {
        "input_tokens": input_tokens,
        "cached_tokens": cached_prefix_tokens,
        "output_tokens": expected_output_tokens,
        "input_cost": f"\${input_cost:.6f}",
        "cache_cost": f"\${cache_cost:.6f}",
        "output_cost": f"\${output_cost:.6f}",
        "total_cost": f"\${total:.6f}",
        "cost_per_1000_requests": f"\${total * 1000:.2f}",
    }

# Example: RAG query with cached system prompt
result = estimate_cost(
    prompt=system_prompt + retrieved_context + user_question,
    expected_output_tokens=400,
    model="claude-sonnet",
    cached_prefix_tokens=2000  # system prompt cached
)
print(result)` },
            { type: "checklist", heading: "Cost Optimization Tactics", items: [
              "Use prompt caching: keep system prompts and static context as a stable prefix",
              "Right-size the model: Haiku for classification/extraction, Sonnet for reasoning, Opus only when needed",
              "Set max_tokens appropriately: classification needs 50 tokens, not 4096",
              "Use batch APIs for offline processing (50% cheaper on most providers)",
              "Implement semantic caching: cache responses for similar (not just identical) queries",
              "Monitor token usage per request type: find the expensive outliers",
              "Trim context: only send relevant chunks, not everything retrieved",
              "Use model routing: classify query complexity, route simple queries to cheap models",
              "Compress prompts: remove unnecessary whitespace and verbose instructions",
              "Track cost per business outcome (cost per invoice processed, cost per ticket resolved)",
            ]}
          ]
        },
        { id: "m2l5", title: "Model Selection Guide", duration: "10 min", tags: ["llm","models","selection","production"],
          content: [
            { type: "text", heading: "The Selection Framework", body: "Model selection is a tradeoff between four factors:\n\n**Quality** — Can the model handle your task accurately?\n**Speed** — Is latency acceptable for your use case?\n**Cost** — Does the per-token cost fit your budget at scale?\n**Control** — Do you need to self-host, fine-tune, or have specific compliance requirements?\n\nStart with the cheapest model that might work. Test it. Move up only when you have evidence the cheaper model fails." },
            { type: "decision", heading: "Task → Model Mapping", rows: [
              ["Simple classification (spam, sentiment, category)", "Haiku / GPT-4o-mini — fast, cheap, accurate enough"],
              ["Data extraction from structured docs", "Haiku / GPT-4o-mini — structured output works well on small models"],
              ["Complex data extraction (messy docs, tables)", "Sonnet / GPT-4o — needs stronger reasoning"],
              ["Summarization", "Sonnet / GPT-4o — good balance of quality and cost"],
              ["Code generation / review", "Sonnet / GPT-4o — strong coding capability"],
              ["Complex reasoning, multi-step analysis", "Opus / GPT-4o — needs frontier capability"],
              ["Customer-facing chat (quality matters)", "Sonnet — best quality/cost for conversation"],
              ["Embeddings (RAG, semantic search)", "text-embedding-3-small — 1536 dims, cheap, good enough"],
              ["Embeddings (high accuracy needed)", "text-embedding-3-large — 3072 dims, better retrieval"],
              ["High-volume, cost-sensitive (>100K calls/day)", "Fine-tuned Haiku or self-hosted Llama"],
              ["Data sovereignty / air-gapped environment", "Self-hosted: Llama 3.1, Mistral, or Phi"],
            ]},
            { type: "text", heading: "API Models vs Open Source", body: "**API models (Claude, GPT-4o)**\nPros: No infrastructure, always latest version, highest capability, managed scaling.\nCons: Data leaves your network, per-token cost, vendor dependency, rate limits.\n\n**Open source self-hosted (Llama, Mistral)**\nPros: Full data control, no per-token cost, customizable, no rate limits.\nCons: GPU infrastructure cost (~$2-8/hr per GPU), operational burden, lower capability than frontier models, you manage updates.\n\n**When to self-host:**\n• >500K API calls/day (cost crossover point)\n• Strict data sovereignty requirements\n• Need to fine-tune for specific behavior\n• Air-gapped or classified environments\n\n**When to use APIs:**\n• Everything else. Seriously. The operational burden of self-hosting is significant." },
            { type: "code", heading: "Model Routing Pattern — Python", lang: "python", code: `from langchain_openai import AzureChatOpenAI

# Define model tiers
models = {
    "fast": AzureChatOpenAI(model="gpt-4o-mini", temperature=0),
    "balanced": AzureChatOpenAI(model="gpt-4o", temperature=0),
    "powerful": AzureChatOpenAI(model="gpt-4o", temperature=0),  # or Claude Opus
}

async def classify_complexity(query: str) -> str:
    """Use the cheapest model to classify query complexity."""
    result = await models["fast"].ainvoke(
        f"""Classify this query's complexity. Return ONLY one word:
        - simple: factual lookup, yes/no, simple extraction
        - medium: summarization, comparison, moderate reasoning  
        - complex: multi-step analysis, creative, ambiguous
        
        Query: {query}"""
    )
    return result.content.strip().lower()

async def route_query(query: str, context: str = "") -> str:
    """Route query to appropriate model based on complexity."""
    complexity = await classify_complexity(query)
    
    tier_map = {
        "simple": "fast",      # GPT-4o-mini: ~$0.15/1M input
        "medium": "balanced",  # GPT-4o:      ~$2.50/1M input
        "complex": "powerful", # Opus/GPT-4o: ~$15/1M input
    }
    
    tier = tier_map.get(complexity, "balanced")
    model = models[tier]
    
    result = await model.ainvoke(
        f"Context: {context}\n\nQuestion: {query}"
    )
    
    return result.content` },
            { type: "checklist", heading: "Model Evaluation Checklist", items: [
              "Build an eval set of 50-100 examples BEFORE comparing models",
              "Test the cheapest plausible model first — you'll be surprised how capable small models are",
              "Measure accuracy, latency, and cost per request for each model",
              "Run the same prompts: different models respond differently to the same instructions",
              "Test edge cases specifically: the gap between models shows most on hard examples",
              "Consider model routing: use small model for 80% of queries, large model for 20%",
              "Pin specific model versions for reproducibility",
              "Re-evaluate quarterly: model capabilities and pricing change fast",
              "Factor in prompt caching: a more expensive model with better caching can be cheaper overall",
            ]}
          ]
        }
      ]
    }
;
