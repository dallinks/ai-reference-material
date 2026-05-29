export default
    {
      id: "m2", number: "02", title: "How LLMs Work", accent: "#00D4AA",
      desc: "Tokenization, attention, training, and inference — the mechanics behind the magic.",
      lessons: [
        { id: "m2l1", title: "Tokenization & Embeddings", duration: "18 min", tags: ["llm","embeddings","rag","tokenization","cost","mechanics"],
          content: [
            { type: "text", heading: "From Text to Numbers", body: "Tokenizers convert text into numerical tokens using subword algorithms like BPE (Byte Pair Encoding). \"unhappiness\" → [\"un\", \"happiness\"] or [\"un\", \"hap\", \"pi\", \"ness\"]." },

            { type: "text", heading: "How BPE Actually Builds a Vocabulary", body: "Byte Pair Encoding (BPE) is the algorithm behind most tokenizers (GPT, Llama, and others use variants). It's trained once, before the model itself, by a simple greedy procedure:\n\n1. Start with the rawest possible vocabulary — individual characters (or raw bytes).\n2. Scan a huge text corpus and find the **most frequent adjacent pair** of symbols.\n3. **Merge** that pair into a single new token and add it to the vocabulary.\n4. Repeat thousands of times until you hit a target vocab size (often ~100K–200K tokens).\n\nThe result: common words become single tokens (\"the\", \"because\"), rare words split into reusable pieces (\"tokenization\" → \"token\" + \"ization\"), and *any* string can still be represented by falling back to characters. That's why subword tokenization beat both word-level (vocabulary too huge, can't handle new words) and character-level (sequences too long) — it's the practical middle ground." },

            { type: "code", heading: "Inspect Tokenization — Python (tiktoken)", lang: "python", code: `import tiktoken

enc = tiktoken.encoding_for_model("gpt-4o")

text = "Tokenization isn't intuitive."
ids = enc.encode(text)

print(len(ids), "tokens")
for tid in ids:
    print(tid, "->", repr(enc.decode([tid])))

# Things you'll notice, and why they matter:
#   * a leading space is usually PART of the next token (" intuitive")
#   * capitalization changes the token  ("The" != "the")
#   * numbers often split oddly  -> a big reason LLMs struggle with arithmetic` },

            { type: "text", heading: "Why Tokenization Causes Weird Behavior", body: "A surprising number of LLM quirks trace directly back to tokenization:\n\n**\"How many r's in strawberry?\"** The model never sees letters — it sees the tokens for \"straw\" and \"berry\". Counting characters means reasoning about something it can't directly observe, so it often gets it wrong.\n\n**Bad at arithmetic** — Numbers tokenize inconsistently (\"1234\" might be one token, \"1235\" three). With no clean digit-place representation, multi-digit math is genuinely hard for it.\n\n**Whitespace sensitivity** — A trailing space changes which token comes next and can derail generation; \"hello\" and \"hello \" are different inputs.\n\n**Non-English tax** — Tokenizers are trained mostly on English. The same sentence in Thai or Telugu can take 2–4x more tokens, making those languages 2–4x more expensive and effectively shrinking the usable context window.\n\n**Glitch tokens** — Rare tokens that appeared strangely in training can produce bizarre outputs. These are real, documented failure modes, not folklore." },

            { type: "checklist", heading: "Why Tokenization Matters Practically", items: [
              "Cost — API pricing is per-token. ~4 chars = 1 token for English",
              "Context limits — 128K tokens ≈ 96K words for English",
              "Some languages tokenize less efficiently (more tokens per word = higher cost)",
              "Structured output (JSON) is generated token-by-token, which is why it can break",
              "You can't reliably make a model count characters or do exact math — it sees tokens, not letters or digits",
            ]},

            { type: "text", heading: "Token Cost & Context Math, Worked", body: "Because everything is priced and bounded in tokens, estimating token counts is a core implementor skill. Rule of thumb for English: **~4 characters ≈ 1 token**, or roughly **¾ of a word**.\n\n**A document** — A 10-page PDF (~5,000 words) ≈ **~6,700 tokens**. A 200K-token context window holds roughly 30 such documents — though you rarely want to fill it.\n\n**A RAG request** — System prompt (300) + user question (50) + 5 retrieved chunks at 800 tokens each (4,000) + generated answer (500) ≈ **4,850 tokens** per call. At ~$2.50 / 1M input and ~$10 / 1M output, that's roughly $0.011 input + $0.005 output ≈ **~1.6¢ per query** — multiply by a million queries and it's real money.\n\n**Output costs more** — Output tokens are typically 3–5x the price of input tokens, so verbose answers and \"think step by step\" cost more than they appear. Token economics gets a full treatment in m2l4." },

            { type: "text", heading: "Embeddings: The Semantic Layer", body: "An embedding is a dense vector representing meaning. Similar meanings → similar vectors.\n\n\"The cat sat on the mat\" and \"A feline rested on the rug\" produce nearly identical vectors despite sharing almost no words." },

            { type: "text", heading: "What the Embedding Vector Actually Is", body: "An embedding is a list of numbers — e.g., 1,536 of them for text-embedding-3-small. Geometrically, that's a single **point in 1,536-dimensional space**.\n\nTraining arranges that space so **direction and proximity encode meaning**: texts about similar things land near each other; unrelated texts land far apart. You can't picture 1,536 dimensions, but the 2D intuition holds — \"king\" sits near \"queen\", \"Paris\" near \"France\", and the *direction* from \"man\" to \"woman\" is roughly parallel to \"king\" → \"queen\".\n\nThis is what makes semantic search possible: to find documents related to a query, embed the query into the same space and look for the **nearest points**. No keyword overlap required — \"feline\" and \"cat\" are neighbors even though they share no letters." },

            { type: "text", heading: "How Similarity Is Measured", body: "\"Nearest points\" needs a distance metric. Three are common:\n\n**Cosine similarity** — Measures the *angle* between two vectors, ignoring their length. Ranges from -1 (opposite) to 1 (identical direction). The default for text embeddings, because meaning lives in *direction*, not magnitude.\n\n**Dot product** — Cosine times the two lengths. If vectors are **normalized** to unit length (most modern embedding models do this), dot product and cosine are equivalent — which is why vector DBs often use dot product for speed.\n\n**Euclidean (L2) distance** — Straight-line distance between points. Works, but sensitive to magnitude, so it's less common for text.\n\nPractical takeaway: use **cosine** (or dot product on normalized vectors) for text, consistently. Mixing metrics, or using dot product on un-normalized vectors, silently corrupts your search ranking." },

            { type: "code", heading: "Cosine Similarity — Python", lang: "python", code: `import numpy as np

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Two embeddings from the SAME model (e.g., text-embedding-3-small)
print(cosine_similarity(vec_cat, vec_feline))   # ~0.85  -> close in meaning
print(cosine_similarity(vec_cat, vec_invoice))  # ~0.10  -> unrelated

#   1.0 = identical direction, 0 = unrelated, negative = opposing.
# This single number is the heart of every vector search (Module 4).` },

            { type: "text", heading: "How Embeddings Get Their Meaning (Contrastive Training)", body: "Embedding models aren't told what words mean — they learn it from **contrastive training**. The model is shown many pairs of texts and trained to:\n\n• **Pull together** the vectors of texts that belong together (a question and its correct answer; a sentence and its paraphrase).\n• **Push apart** the vectors of texts that don't (random unrelated pairs).\n\nRepeated over billions of pairs, this arranges the space so semantically related text ends up close — exactly why \"a feline rested on the rug\" lands near \"the cat sat on the mat\" despite zero shared words.\n\nTwo consequences worth remembering: (1) an embedding model is only as good as the pairs it was trained on, so specialized domains can need a domain-tuned model; (2) embeddings from *different* models live in *different, incompatible* spaces — you can never compare a vector from one model against a vector from another." },

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
            ]},

            { type: "checklist", heading: "Embedding Gotchas in Production", items: [
              "Never mix embedding models — vectors from different models aren't comparable; switching means re-embedding everything",
              "Pin the embedding model version; a silent provider update can shift the space and degrade search",
              "Match the metric to the model — use cosine (or dot product on normalized vectors), consistently",
              "Embed the query and the documents with the SAME model and the same preprocessing",
              "Chunk size drives embedding quality — too big blurs meaning, too small loses context (see m4l2)",
              "Embeddings are a frozen snapshot — changing models forces a full, costly re-index of the corpus",
              "Higher dimensions (3-large, 3072-D) cost more storage and slower search for often-marginal accuracy gains",
              "Batch your embedding calls — far cheaper and faster than one text at a time",
            ]}
          ]
        },
        { id: "m2l2", title: "The Transformer Architecture", duration: "20 min", tags: ["llm","transformer","attention","architecture","mechanics"],
          content: [
            { type: "text", heading: "Attention Is All You Need", body: "The 2017 paper that changed everything. Self-attention lets every token \"attend to\" every other token simultaneously, capturing long-range dependencies.\n\nBefore: models processed sequences left-to-right (slow, lost context).\nAfter: entire sequence processed at once (fast, rich context)." },

            { type: "text", heading: "Self-Attention Intuition", body: "\"The animal didn't cross the street because it was too tired.\"\n\nWhat does \"it\" refer to? Self-attention computes scores between \"it\" and every other word. High attention to \"animal\", low attention to \"street.\"\n\nMultiple attention heads learn different relationship types — syntactic, semantic, positional." },

            { type: "text", heading: "Query, Key, Value: How Attention Actually Computes", body: "\"Tokens attend to each other\" becomes concrete through three learned projections. From each token's vector, the model produces three new vectors:\n\n**Query (Q)** — what this token is looking for.\n**Key (K)** — what this token offers to others.\n**Value (V)** — the information this token will actually contribute.\n\nThe attention score between token *i* and token *j* is the **dot product of i's query with j's key** — large when they're relevant to each other. Those scores become weights, and each token's output is a **weighted blend of every token's value vector.**\n\nSo for \"it\" in our sentence, its query matches the key of \"animal\" strongly, so \"it\" pulls in \"animal\"'s value — that's mechanically how the model resolves the reference. Q, K, and V are produced by weight matrices learned during training; learning *good* projections is most of what training a Transformer does." },

            { type: "code", heading: "Self-Attention in ~20 Lines (NumPy)", lang: "python", code: `import numpy as np

def softmax(x, axis=-1):
    e = np.exp(x - x.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)

def self_attention(X, Wq, Wk, Wv):
    # X: (seq_len, d_model) -- the token vectors for ONE sequence
    Q = X @ Wq                          # what each token is "looking for"
    K = X @ Wk                          # what each token "offers"
    V = X @ Wv                          # what each token will "contribute"

    d_k    = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)     # (seq, seq): token-to-token relevance
    weights = softmax(scores, axis=-1)  # each row sums to 1
    return weights @ V                  # weighted blend of the value vectors

# That's the entire mechanism. A real Transformer just stacks dozens of these
# (split across multiple heads), with feed-forward layers in between.` },

            { type: "text", heading: "Why Softmax and the √d Scaling", body: "Two small details in that formula do a lot of work.\n\n**Softmax** converts raw scores into weights that are all positive and **sum to 1** — a probability distribution over \"how much attention to pay to each token.\" That's what lets a token blend others proportionally instead of picking just one.\n\n**The 1/√d_k scaling** (dividing scores by the square root of the key dimension) prevents a subtle failure: in high dimensions, dot products grow large, pushing softmax into a near one-hot regime where gradients vanish and learning stalls. Scaling keeps scores in a sane range. It is literally the \"scaled\" in *scaled dot-product attention* — a one-line fix that made deep Transformers trainable." },

            { type: "text", heading: "Multi-Head Attention: Many Relationships at Once", body: "A single attention computation captures one kind of relationship at a time. Real Transformers run **multiple attention heads in parallel** — often 32 or 96 — each with its own learned Q/K/V projections.\n\nDifferent heads specialize: one tracks subject-verb agreement, another resolves pronouns, another follows positional patterns, another links related topics. Each head produces its own weighted blend; the results are concatenated and projected back together.\n\nThis is why interpretability researchers talk about \"the induction head\" or \"the previous-token head\" — specific heads in trained models really do learn identifiable jobs. More heads means more relationship types captured at once, part of why bigger models grasp more nuance." },

            { type: "text", heading: "Positional Encoding: Giving Order to a Bag of Tokens", body: "A non-obvious problem: attention is **permutation-invariant.** Computed naively, \"dog bites man\" and \"man bites dog\" would produce the same result — the math doesn't inherently know token order.\n\nTransformers fix this by **injecting position information** into the token vectors before attention. The original paper used fixed **sinusoidal** patterns; modern models (Llama and most recent LLMs) use **RoPE (Rotary Position Embedding)**, which rotates the Q/K vectors by an angle proportional to position so relative distance falls out of the dot product naturally.\n\nWhy care: positional encoding is what bounds and shapes the **context window.** Techniques to extend context (RoPE scaling, position interpolation) are tricks to make the positional scheme generalize past the lengths it was trained on — and they're why quality often degrades near the far end of a very long context." },

            { type: "text", heading: "Architecture Stack", body: "**Input Embedding + Positional Encoding** — Tokens → vectors + position info\n**Encoder** (optional) — Processes input. Used in BERT-style models.\n**Decoder** — Generates tokens one at a time. GPT/Claude are decoder-only.\n**Feed-Forward Networks** — Transform representations at each position\n**Layer Norm + Residual Connections** — Make deep networks trainable" },

            { type: "text", heading: "The Feed-Forward Layer: Where Knowledge Lives", body: "Each Transformer block has two halves: attention, then a **feed-forward network (FFN)** applied to each position independently. The FFN is easy to overlook, but it holds the majority of the model's parameters — typically about two-thirds.\n\nA useful model from interpretability research: **attention moves information around; the FFN does the recall and computation.** The FFN behaves like a giant key-value memory — patterns in its weights store facts (\"the capital of France is…\") learned during pre-training. When people say a fact is \"baked into the weights,\" it largely lives here.\n\nThis matters practically: it's why a model can't update a memorized fact without retraining or fine-tuning, and why RAG (Module 4) exists — to supply fresh or private facts at inference time instead of relying on what's frozen in the FFN." },

            { type: "text", heading: "How a Token Flows Through the Whole Stack", body: "Putting it together, the full path from input to next token:\n\n1. **Tokenize** the text into token IDs (m2l1).\n2. **Embed** each ID into a vector and **add positional information.**\n3. Pass through **N stacked Transformer blocks** (frontier models have dozens to 100+). Each block: multi-head attention → add & normalize → feed-forward → add & normalize. The *residual* (\"add\") connections let signal and gradients flow through a very deep stack without degrading.\n4. The final layer projects each position's vector into a **logit for every token in the vocabulary** (100K+ numbers).\n5. **Softmax** turns the last position's logits into a probability distribution over the next token.\n6. **Sample** one token, append it, and repeat from step 1.\n\nEverything an LLM does — reasoning, coding, conversation — is this loop, run one token at a time." },

            { type: "diagram", heading: "One Token's Journey Through the Stack", variant: "cycle", nodes: [
              { label: "Tokenize", detail: "text → IDs" },
              { label: "Embed", detail: "+ position" },
              { label: "N× blocks", detail: "attention → FFN" },
              { label: "Logits", detail: "score every token" },
              { label: "Softmax", detail: "→ probabilities" },
              { label: "Sample", detail: "pick next token" },
            ], caption: "Autoregressive generation: the sampled token is appended to the input and the whole loop runs again for the next one." },

            { type: "decision", heading: "Encoder-only vs Decoder-only vs Encoder-Decoder", rows: [
              ["Classification, embeddings, search, understanding", "Encoder-only (BERT-style) — sees the whole input at once"],
              ["Text generation, chat, completion, code", "Decoder-only (GPT, Claude, Llama) — generates left-to-right"],
              ["Translation, summarization, strict input→output mapping", "Encoder-decoder (T5, BART) — encode input, then decode output"],
              ["A general assistant / most modern LLM use", "Decoder-only — it has become the dominant design"],
            ]},

            { type: "text", heading: "Why Attention Is Expensive: The O(n²) Problem", body: "Self-attention compares **every token with every other token**, so cost grows with the **square of the sequence length.** Double the context, quadruple the attention compute and memory. This one fact explains most of the pain around long context.\n\nIt's why huge context windows are expensive and why latency climbs as your prompt grows. Mitigations you'll meet:\n\n**KV cache** — During generation, cache the key/value vectors of earlier tokens so each new token doesn't recompute them. Essential — and also why long conversations eat so much GPU memory.\n**FlashAttention** — A memory-efficient implementation that gets the same result without materializing the giant scores matrix.\n**Sparse / sliding-window attention** — Each token attends only to a local window or subset, trading some quality for sub-quadratic cost (used in several long-context models).\n\nTakeaway for implementors: long context isn't free — it costs tokens *and* compute super-linearly, which is why retrieval (Module 4) is often smarter than stuffing everything into the prompt." },

            { type: "text", heading: "Scale Creates Emergence", body: "1B params → basic text completion\n70B params → complex reasoning\n400B+ params → code, images, nuanced conversation\n\nNew abilities appear at scale that weren't predicted. This emergence is still not fully understood." },

            { type: "checklist", heading: "What to Remember About Transformers", items: [
              "Attention = each token blends in others' Value vectors, weighted by Query·Key relevance",
              "Multi-head attention captures many relationship types at once; different heads specialize",
              "Positional encoding (sinusoidal or RoPE) gives the model word order — and bounds context length",
              "Feed-forward layers hold ~2/3 of parameters and store most memorized knowledge",
              "Modern LLMs are decoder-only stacks; output is a probability distribution over the next token",
              "Attention cost is O(n²) in sequence length — long context is expensive in both tokens and compute",
              "Emergent abilities appear with scale and aren't fully predictable — bet on capability improving, not on exactly when",
            ]}
          ]
        },
        { id: "m2l3", title: "Training, Fine-Tuning & RLHF", duration: "19 min", tags: ["llm","fine-tuning","training","rlhf","dpo","alignment"],
          content: [
            { type: "text", heading: "The LLM Training Pipeline", body: "A production assistant like GPT-4 or Claude isn't trained in one shot — it's built in stages, each fixing what the previous one can't do:\n\n**1. Pre-training** — Learn language and world knowledge from a massive corpus by predicting the next token. Produces a *base model*: fluent and knowledgeable, but not an assistant.\n\n**2. Supervised fine-tuning (SFT)** — Teach it to follow instructions using curated (prompt, ideal-answer) examples. Produces an *instruct model*.\n\n**3. Preference optimization (RLHF / DPO)** — Align it with human preferences for helpfulness, honesty, and safety. Produces the *chat model* you actually use.\n\n(Optional **4. Domain fine-tuning** — you adapt that model to *your* task or style.) Knowing which stage does what is the key to knowing whether your problem needs fine-tuning, RAG, or just a better prompt." },

            { type: "text", heading: "Pre-Training", body: "Simple objective: predict the next token on a massive text corpus. Unsupervised — no labels needed. Cost: $50M–$100M+ for frontier models." },

            { type: "text", heading: "What Pre-Training Actually Produces (the \"Base Model\")", body: "Pre-training optimizes exactly one thing — predict the next token — and that alone produces astonishing language ability and world knowledge. But the result, a **base model**, is *not* an assistant.\n\nAsk a raw base model \"What is the capital of France?\" and it might continue with \"What is the capital of Germany? What is the capital of Spain?\" — because it learned that such a line often appears in a *list of quiz questions*, and it's completing the pattern, not answering you.\n\nA base model will happily ramble, refuse nothing, and ignore instructions, because nothing has taught it that it's supposed to be a helpful respondent. Turning that raw next-token predictor into something useful is the job of the next two stages. (Base models are still valuable — they're the starting point for all fine-tuning and for research.)" },

            { type: "text", heading: "Supervised Fine-Tuning: From Base Model to Assistant", body: "**Supervised fine-tuning (SFT)**, also called *instruction tuning*, is the step that turns a base model into something that follows instructions. You continue training the base model on curated **(prompt, ideal response)** pairs written or vetted by humans: questions with good answers, instructions with correct completions, multi-turn conversations.\n\nThe objective is still next-token prediction — but now the \"next tokens\" are *exemplary assistant behavior.* After SFT, the model has learned the *format* of being helpful: asked a question, it answers; given an instruction, it follows it.\n\nThis is distinct from **domain fine-tuning** (next sections), which adapts an already-helpful model to your specific task or style. SFT creates the assistant; domain fine-tuning specializes it." },

            { type: "text", heading: "Fine-Tuning", body: "Adapt a pre-trained model to specific tasks/domains with curated data.\n\n**Full fine-tuning** — Update all params. Expensive, thorough.\n**LoRA** — Train small adapter layers, freeze base model. Much cheaper, nearly as good.\n**QLoRA** — LoRA + quantization. Fine-tune 70B models on a single GPU." },

            { type: "text", heading: "How LoRA Works (and Why It's So Cheap)", body: "Full fine-tuning updates all of a model's billions of weights — enormous GPU memory, easy to overfit, and you end up with a full-size copy per task. **LoRA (Low-Rank Adaptation)** sidesteps all of that.\n\nThe insight: the *change* fine-tuning makes to a big weight matrix is usually **low-rank** — it can be approximated by multiplying two much smaller matrices, A and B. So LoRA **freezes the original weights** and learns only the small A·B \"delta\" added alongside them. You train millions of parameters instead of billions.\n\nWhy it became the default: a LoRA adapter is tiny (a few MB) and **hot-swappable** — keep one base model in memory and switch adapters per task; you can fine-tune a 70B model on a single GPU (**QLoRA** adds 4-bit quantization on top); and because the base is frozen, you're far less likely to wreck the model's general abilities. The quality gap versus full fine-tuning is usually negligible." },

            { type: "code", heading: "LoRA Fine-Tuning — Python (PEFT)", lang: "python", code: `from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM, TrainingArguments, Trainer

base = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3.1-8B")

lora = LoraConfig(
    r=16,                 # rank of the A*B delta -- bigger = more capacity & params
    lora_alpha=32,        # scaling applied to the delta
    target_modules=["q_proj", "v_proj"],   # which weight matrices to adapt
    lora_dropout=0.05,
    task_type="CAUSAL_LM",
)

model = get_peft_model(base, lora)
model.print_trainable_parameters()
# -> trainable params: ~4M  ||  all params: ~8B  ||  trainable%: 0.05%

trainer = Trainer(model=model, args=TrainingArguments(...),
                  train_dataset=your_prompt_response_pairs)
trainer.train()
model.save_pretrained("./my-lora-adapter")   # a few MB, not gigabytes` },

            { type: "text", heading: "RLHF & Alignment", body: "How raw language models become helpful assistants:\n\n**Step 1** — Train reward model on human preferences (\"which response is better?\")\n**Step 2** — Optimize language model against reward model via RL (PPO or DPO)\n\nNewer approaches: Constitutional AI (Anthropic), RLAIF (AI feedback at scale)." },

            { type: "text", heading: "RLHF, Step by Step", body: "RLHF (Reinforcement Learning from Human Feedback) tunes an instruction-following model toward *human preferences*. The classic recipe:\n\n**1. Start from the SFT model.** It already follows instructions.\n**2. Collect preferences.** Show humans two model responses to the same prompt; they pick the better one. Gather tens of thousands of comparisons.\n**3. Train a reward model.** A separate model learns to predict which response humans prefer — turning fuzzy \"better\" judgments into a numeric score.\n**4. Optimize the policy with RL.** Using PPO, nudge the language model toward responses the reward model scores highly — **while a KL penalty keeps it from drifting too far from the SFT model.**\n\nThat KL penalty is crucial: without it, the model learns to *game* the reward model, collapsing into weird high-scoring gibberish instead of staying a coherent assistant." },

            { type: "text", heading: "DPO: Skipping the Reward Model", body: "RLHF's PPO loop is finicky: a separate reward model to train and host, an unstable RL optimization, many moving parts. **Direct Preference Optimization (DPO)** reaches the same goal more simply.\n\nDPO shows you can optimize the language model **directly on the preference pairs** — \"prefer response A over B\" — with a single, stable loss function, no separate reward model and no reinforcement learning at all. It mathematically rewrites the RLHF objective into something that trains like ordinary supervised learning.\n\nResult: comparable alignment quality with far less complexity, which is why DPO (and variants like IPO/KTO) is now common for open models and many production pipelines. When someone says \"we aligned it with DPO,\" this is what they mean." },

            { type: "text", heading: "Why Alignment Is Hard: Reward Hacking & Sycophancy", body: "Aligning to human preferences has a catch: **you get what you measure, including the parts you didn't mean.**\n\n**Sycophancy** — Humans rate agreeable, flattering answers higher, so preference-tuned models drift toward telling you what you want to hear and caving when challenged, even when they were right.\n**Length & confidence bias** — Longer, more confident-sounding answers often win comparisons, so models learn to be verbose and assertive — sometimes confidently wrong.\n**Reward hacking** — The model finds responses that score well without being genuinely better, exploiting quirks of the reward signal.\n\nMitigations push feedback beyond raw human preference: **Constitutional AI** (Anthropic) has the model critique and revise its own answers against a written set of principles; **RLAIF** uses AI-generated feedback to scale past what human labelers can produce. Alignment is an active research problem, not a solved one — which is why model behavior keeps shifting release to release." },

            { type: "text", heading: "Fine-Tuning vs RAG: They Solve Different Problems", body: "The single most common confusion in applied AI: \"should I fine-tune or use RAG?\" They aren't alternatives — they fix different things.\n\n**RAG gives the model knowledge** it didn't have — fresh, private, or niche facts — by retrieving them into the prompt at inference time. Change a document and the answers change immediately. Knowledge lives *outside* the weights. (Module 4.)\n\n**Fine-tuning changes the model's behavior** — style, format, tone, or how it performs a narrow task — by adjusting the weights. It does *not* reliably teach new facts: fine-tuned knowledge is frozen, costly to update, and prone to being recalled incorrectly.\n\nRule of thumb: **fine-tune for *form*, retrieve for *facts*.** Need it to always answer in your house style or emit a strict schema? Fine-tune. Need it to know your latest pricing or internal docs? RAG. Many production systems do both. And before either, try a better prompt — it's free." },

            { type: "decision", heading: "Should You Fine-Tune?", rows: [
              ["Need consistent style/format", "Yes — fine-tuning excels here"],
              ["Domain-specific jargon/knowledge", "Try RAG first, fine-tune if insufficient"],
              ["Improve accuracy on narrow task", "Yes — with enough quality examples (500+)"],
              ["Need up-to-date information", "No — use RAG instead (fine-tuned knowledge is static)"],
              ["Limited budget/data", "No — use prompt engineering + few-shot examples"],
              ["Reduce latency/cost at scale", "Yes — distill large model behavior into smaller model"],
            ]},

            { type: "checklist", heading: "Training & Fine-Tuning Takeaways", items: [
              "An assistant is built in stages: pre-training → SFT (instruction tuning) → RLHF/DPO alignment",
              "A base model completes text; it is not an assistant until SFT teaches it to follow instructions",
              "LoRA/QLoRA fine-tune a few-MB adapter on frozen weights — cheap, hot-swappable, nearly as good as full fine-tuning",
              "RLHF uses a reward model + PPO with a KL penalty; DPO reaches the same goal directly, simpler and more stable",
              "Alignment introduces sycophancy, length bias, and reward hacking — model behavior is a moving target",
              "Fine-tune for form (style/format/task), retrieve for facts (RAG) — they're complementary, not rivals",
              "Try prompt engineering and few-shot first; fine-tune only with 500+ quality examples and a clear behavior gap",
            ]}
          ]
        },
        { id: "m2l4", title: "Token Economics & Cost Optimization", duration: "18 min", tags: ["llm","cost","tokens","production","caching","routing"],
          content: [
            { type: "text", heading: "How LLM Pricing Works", body: "LLM APIs charge per token — both input and output. Input tokens (your prompt + context) and output tokens (the model's response) are priced separately, with output tokens typically 3-5x more expensive.\n\n**Why this matters:** A RAG system sending 4000 tokens of context + a 100-token question, getting a 500-token answer, costs based on 4100 input + 500 output tokens. The context dominates your bill.\n\n**Token estimation:** 1 token ≈ 4 characters ≈ 0.75 words in English. A typical page of text is ~500 tokens. A full 128K context window is roughly a 200-page book." },

            { type: "text", heading: "Why Output Tokens Cost More: Prefill vs Decode", body: "Output tokens cost 3–5x more than input tokens because of *how* a Transformer runs (m2l2). Inference splits into two very different phases:\n\n**Prefill (processing your input)** — The model ingests your entire prompt in **one parallel forward pass.** All input tokens are processed at once, so prefill is fast and cheap per token — the GPU is fully utilized.\n\n**Decode (generating the output)** — Output is produced **one token at a time, sequentially.** Each new token needs its own forward pass through the whole model, and you can't start token N+1 until token N exists. The GPU is underutilized per step, and there are as many passes as output tokens.\n\nSo input is a batch operation and output is a serial loop — which is why providers price output higher, and why a verbose 800-token answer can cost more than 4,000 tokens of context. The same split explains latency: **time-to-first-token** is dominated by prefill, **tokens-per-second** by decode." },

            { type: "decision", heading: "Current Pricing Landscape (approximate, per 1M tokens)", rows: [
              ["Claude Opus 4", "$15 input / $75 output — complex reasoning, analysis"],
              ["Claude Sonnet 4", "$3 input / $15 output — best general-purpose balance"],
              ["Claude Haiku 3.5", "$0.80 input / $4 output — fast extraction, classification"],
              ["GPT-4o", "$2.50 input / $10 output — strong multimodal"],
              ["GPT-4o-mini", "$0.15 input / $0.60 output — simple tasks at scale"],
              ["Llama 3.1 70B (self-hosted)", "$0 API cost, ~$2/hr GPU compute"],
            ]},

            { type: "text", heading: "A Worked Cost Model: Support Bot at Scale", body: "Numbers make this concrete. A customer-support RAG bot on Claude Sonnet (~$3 / 1M input, $15 / 1M output), handling **20,000 queries/day**:\n\n**Per query (naive):** 2,000-token system prompt + 4,000 tokens retrieved context + 100-token question = 6,100 input; 400-token answer.\n• Input: 6,100 / 1M × $3 = $0.0183\n• Output: 400 / 1M × $15 = $0.0060\n• **≈ $0.0243 / query → ~$486/day → ~$14.6K/month**\n\n**Same workload, optimized:**\n• Cache the 2,000-token system prompt (~90% off the cached portion) → saves ~$0.0054/query\n• Trim retrieved context 4,000 → 1,500 tokens via better chunking (m4l2) → saves ~$0.0075/query\n• Route the ~40% of trivial queries to Haiku (~5x cheaper)\n• Net: roughly **$0.012 / query → ~$240/day → ~$7.2K/month** — about a **50% cut**, with no model downgrade for the hard queries.\n\nThe lesson: cost optimization is mostly about *input* (caching + trimming context) and *routing* — not squeezing the answer shorter." },

            { type: "text", heading: "Prompt Caching", body: "Prompt caching is the single biggest cost optimization for production systems. When your system prompt + static context is the same across requests, the provider caches the KV representations and charges a reduced rate.\n\n**Anthropic:** Cached input tokens cost 90% less. Cache is created automatically for prompts > 1024 tokens that share a common prefix. Cache lives for 5 minutes, refreshed on each hit.\n\n**OpenAI:** Similar automatic caching for prompts > 1024 tokens. 50% discount on cached tokens.\n\n**Practical impact:** A RAG system with a 2000-token system prompt serving 10,000 queries/day saves ~$50-200/day on Sonnet just from caching the system prompt." },

            { type: "text", heading: "How Prompt Caching Actually Works", body: "Caching isn't magic — it reuses the Transformer's **KV cache** (m2l2). When the model processes your prompt, it computes key/value vectors for every token. If the **prefix** of your next request is byte-for-byte identical, the provider reuses those already-computed vectors instead of recomputing them, and charges a fraction of the price.\n\nThis dictates how you should structure prompts:\n\n**Put the stable stuff first.** Caching works on a *prefix*: system prompt → tool definitions → static context → *then* the variable user input. One changed character early in the prompt invalidates everything after it.\n\n**Don't interleave dynamic content into the static prefix.** A timestamp or per-user detail injected at the top breaks the cache for every request.\n\n**Mind the TTL.** Anthropic's cache lives ~5 minutes, refreshed on each hit; steady traffic keeps it warm, sporadic traffic loses it.\n\n**It speeds things up too** — skipping prefill on cached tokens cuts time-to-first-token, not just cost." },

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

            { type: "text", heading: "Model Routing & Cascades", body: "Not every query needs your most expensive model. **Routing** sends each request to the cheapest model that can handle it; **cascading** tries a cheap model first and escalates only when needed.\n\n**Static routing** — Classify the request up front (with a tiny/cheap model or simple rules) and dispatch: classification and extraction → Haiku / GPT-4o-mini; reasoning and synthesis → Sonnet; rare hard cases → Opus.\n\n**Cascade (escalation)** — Answer with the cheap model, check a confidence or validation signal, and only re-run on the expensive model when the cheap answer fails. You pay for the big model on the minority of queries that truly need it.\n\nIn a typical workload, 50–80% of queries are \"easy.\" Routing those to a model 5–20x cheaper is often the single largest cost lever — bigger than caching. The cost of the extra classifier call is trivial against the savings." },

            { type: "code", heading: "A Simple Model Cascade — Python", lang: "python", code: `def answer(query: str) -> str:
    # 1. Try the cheap model first
    cheap = call_model("gpt-4o-mini", query, max_tokens=400)

    # 2. Cheap validation: did it actually answer, or punt?
    if is_confident(cheap):       # e.g. no "I'm not sure", passes a schema check
        return cheap.text

    # 3. Escalate only the hard minority to the expensive model
    strong = call_model("gpt-4o", query, max_tokens=800)
    return strong.text

# If 70% of queries clear the cheap path, blended cost is roughly:
#   0.70 * cheap  +  0.30 * (cheap + strong)   -- far below always-strong.
# The catch: you need a RELIABLE is_confident() signal. A bad one escalates
# everything (no savings) or returns weak answers (no quality).` },

            { type: "text", heading: "Where Bills Actually Blow Up", body: "Cost surprises in production almost always come from a handful of patterns:\n\n**Unbounded agent loops** — An agent that calls tools in a loop (Module 5) re-sends the entire growing history every turn. A 10-turn agent can cost 10–50x a single call. *Cap turns; summarize history.*\n\n**No max_tokens** — A classification task that should emit 5 tokens is allowed to generate 4,096. *Set max_tokens to the real need.*\n\n**Re-sending full conversation history** — Long chats resend everything each turn; cost grows quadratically over a session. *Truncate or summarize old turns (m5l6).*\n\n**Verbose reasoning everywhere** — \"Think step by step\" and reasoning/thinking tokens are output tokens at output prices. Great for hard problems, wasteful on easy ones.\n\n**Retries without backoff** — A bug that retries failed calls can silently multiply spend. *Cap retries; alert on spikes.*\n\n**No caching on a stable prefix** — Leaving caching off is often a free 50–90% discount left unclaimed.\n\nThe meta-lesson: instrument token usage *per request type* so the outliers are visible before the invoice arrives. (Full spend monitoring: m7l5.)" },

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
            ]},

            { type: "decision", heading: "Which Lever to Pull?", rows: [
              ["Need lower cost, can't drop quality", "Prompt caching + trim input context — attack input tokens first"],
              ["Need lower cost, quality varies by query", "Model routing / cascade — cheap model for the easy majority"],
              ["Need lower latency (chat UX)", "Smaller model + cache (faster prefill) + stream tokens; cap output length"],
              ["Offline / non-urgent bulk work", "Batch API — ~50% cheaper, async turnaround"],
              ["High, steady volume on one model", "Consider self-hosting an open model — fixed GPU cost beats per-token at scale"],
              ["Quality is the bottleneck, cost secondary", "Larger model + more context; optimize cost only after quality is met"],
            ]}
          ]
        },
        { id: "m2l5", title: "Model Selection Guide", duration: "18 min", tags: ["llm","models","selection","production","reasoning","evaluation"],
          content: [
            { type: "text", heading: "The Selection Framework", body: "Model selection is a tradeoff between four factors:\n\n**Quality** — Can the model handle your task accurately?\n**Speed** — Is latency acceptable for your use case?\n**Cost** — Does the per-token cost fit your budget at scale?\n**Control** — Do you need to self-host, fine-tune, or have specific compliance requirements?\n\nStart with the cheapest model that might work. Test it. Move up only when you have evidence the cheaper model fails." },

            { type: "text", heading: "How to Actually Run a Model Bake-Off", body: "\"Pick the cheapest model that works\" only means something if you can *measure* \"works.\" Selection is a small, repeatable experiment:\n\n**1. Pin down the task.** One job, clear inputs, a definition of a correct output. Vague tasks can't be evaluated.\n\n**2. Build an eval set.** 50–100 real, representative examples with known-good answers — including the hard and weird cases. This is the highest-leverage thing you'll do; it outlives any single model.\n\n**3. Set the acceptance bar.** What accuracy / latency / cost makes this shippable? Decide *before* you see results, so you can't rationalize.\n\n**4. Test cheapest-up.** Run the smallest plausible model against the eval set. Record accuracy, p50/p95 latency, and cost per request.\n\n**5. Escalate only on evidence.** If the cheap model clears the bar, ship it. If not, step up one tier and re-measure.\n\nThis turns selection from vibes (\"Opus feels smarter\") into data (\"Haiku scores 94% at 1/20th the cost and passes\"). The eval set is reusable for routing decisions, regression tests, and the next model release." },

            { type: "text", heading: "Quality Is Task-Specific, Not Global", body: "There is no single \"best model\" — only the best model *for your task.* A model that tops the public leaderboards (m1l3) can lose to a smaller one on *your* data, because:\n\n• Benchmarks measure general ability; your task is specific and may stress things benchmarks don't.\n• Models have personalities — one is terser, one follows JSON schemas more reliably, one knows your domain's jargon.\n• Prompt sensitivity differs: a prompt that's great for GPT-4o may underperform on Claude and vice-versa, so a fair comparison re-tunes the prompt per model.\n\nThe consequence: **trust your eval set, not the leaderboard.** The \"weaker\" model that scores higher on your 100 examples is, by definition, the better model for you. Re-run the comparison whenever you materially change the task or prompt." },

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

            { type: "text", heading: "Reasoning Models vs Standard Models", body: "A major selection axis has emerged: **reasoning models** (OpenAI o-series, Claude with extended thinking, DeepSeek-R1, Gemini Thinking) versus **standard models.**\n\nReasoning models are trained to spend extra **test-time compute** — they generate a long internal chain of thought before answering. On hard, multi-step problems (math, complex code, intricate planning) they're markedly more accurate.\n\nThe trade is steep:\n\n**Slower** — They emit many hidden reasoning tokens first, so latency can be 5–30x a standard model.\n**More expensive** — Those reasoning tokens are billed as output tokens, so one answer can cost far more.\n**Overkill for easy tasks** — On classification, extraction, or simple Q&A, the extra thinking buys nothing.\n\nRule of thumb: **default to a standard model; reach for a reasoning model only when your eval shows the task genuinely needs multi-step reasoning the standard model fails at.** Many systems route the hard 5–10% of queries to a reasoning model and everything else to a fast standard one." },

            { type: "text", heading: "API Models vs Open Source", body: "**API models (Claude, GPT-4o)**\nPros: No infrastructure, always latest version, highest capability, managed scaling.\nCons: Data leaves your network, per-token cost, vendor dependency, rate limits.\n\n**Open source self-hosted (Llama, Mistral)**\nPros: Full data control, no per-token cost, customizable, no rate limits.\nCons: GPU infrastructure cost (~$2-8/hr per GPU), operational burden, lower capability than frontier models, you manage updates.\n\n**When to self-host:**\n• >500K API calls/day (cost crossover point)\n• Strict data sovereignty requirements\n• Need to fine-tune for specific behavior\n• Air-gapped or classified environments\n\n**When to use APIs:**\n• Everything else. Seriously. The operational burden of self-hosting is significant." },

            { type: "text", heading: "The API-vs-Self-Host Crossover, Worked", body: "\"Self-hosting is cheaper at scale\" is true only past a breakeven point — and people usually underestimate where it is.\n\n**The API side:** Haiku-class usage at ~$0.80 / 1M input + $4 / 1M output. A workload averaging 1,500 input + 300 output tokens/call costs ≈ $0.0024/call.\n\n**The self-host side:** An open model on a single GPU runs ~$2–8/hr (≈ $1,500–6,000/month reserved). Add engineering time to deploy, monitor, patch, and keep it highly available — easily another full-time slice.\n\n**Breakeven:** At $0.0024/call, $3,000/month of GPU equals ~1.25M calls/month (~42K/day) — *before* counting operational labor. Below that, the API is cheaper *and* spares you the ops burden.\n\nSo self-hosting wins mainly with **high, steady volume** (well past ~500K–1M calls/day), **hard data-sovereignty needs**, or a **fine-tuned model** you must run yourself. For everyone else, the API's all-in cost is lower once you price in people, not just GPUs." },

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

            { type: "text", heading: "Latency: The Dimension People Forget", body: "Teams obsess over quality and cost, then ship something that *feels* slow. Latency has structure worth selecting on:\n\n**Time-to-first-token (TTFT)** — How long until the user sees *anything.* Dominated by prefill (m2l4) and model size. This is what makes a chat UI feel responsive; streaming hides everything after it.\n\n**Tokens per second (throughput)** — How fast the rest streams in. Bigger models are slower per token.\n\n**Total latency** — TTFT + (output tokens ÷ throughput). A long answer from a fast model can still feel slower than a short answer from a slow one.\n\n**Tail latency (p95/p99)** — The slow requests, not the average, are what users complain about and what blow SLAs. Always measure percentiles, never just the mean.\n\nImplications: for interactive UX, prefer smaller/faster models and **stream** the output; for batch/offline work, latency barely matters, so optimize purely for quality and cost." },

            { type: "text", heading: "Common Selection Mistakes", body: "**Picking by leaderboard.** Choosing the top-ranked model without testing it on your task. Almost always over-pays for capability you can't measure benefiting you.\n\n**Over-provisioning.** Using Opus/GPT-4-class models for classification and extraction a model 20x cheaper handles fine. The most common money leak.\n\n**Under-testing.** Eyeballing five playground examples and declaring a winner. Without a real eval set you're guessing.\n\n**Not pinning versions.** Letting \"latest\" float means a silent provider update can change behavior overnight and break your prompts. Pin, then upgrade deliberately.\n\n**Never re-evaluating.** The frontier moves monthly; the optimal model/price from last quarter may be beaten today. Re-run your bake-off on a schedule.\n\n**Ignoring non-model levers.** Reaching for a bigger model when a better prompt, few-shot examples, or RAG would close the gap more cheaply. Try those first." },

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
        },
        { id: "m2l6", title: "Model Customization in Practice", duration: "19 min", tags: ["llm","fine-tuning","rag","distillation","synthetic-data","slm","selection"],
          content: [
            { type: "text", heading: "From Mechanics to the Decision", body: "m2l3 explained *how* customization works — SFT, LoRA, RLHF/DPO. This lesson is the part that actually shows up in your job: **given a real problem, do you prompt it, retrieve for it, or fine-tune — and how do you make a small, cheap model do a big model's work?**\n\nThe single most expensive mistake in applied AI is reaching for fine-tuning first. It's the most powerful-sounding option, so teams jump to it — then spend weeks collecting data and running GPUs to get something a prompt or a retrieval step would have delivered in an afternoon, cheaper, and more flexibly. The skill is knowing which tool the problem actually needs." },

            { type: "text", heading: "The Customization Ladder — Climb in Order", body: "Reach for the cheapest, most reversible option first, and only climb when your eval (m3l4) proves you have to:\n\n**1. Prompt + few-shot examples (m3)** — Minutes to change, no training, instant to roll back. Astonishingly far on its own.\n**2. Retrieval / RAG (m4)** — When the gap is *missing, private, or changing facts.* Add knowledge without touching the model.\n**3. Fine-tune (m2l3)** — When the gap is *behavior or form* that prompting can't hold reliably.\n**4. Distill to a smaller model** — Once it works, make it cheap and fast for production scale.\n\nEach rung costs more and is harder to undo: a prompt edit is seconds; a fine-tune is a data-collection project plus GPU time plus a new artifact to version and maintain. Most teams skip straight to rung 3 and regret it. Climb only as high as the problem forces you to." },

            { type: "text", heading: "Fine-Tune for Behavior, Retrieve for Facts", body: "This one heuristic resolves most customization confusion, so internalize it:\n\n**Fine-tuning changes *how* the model responds** — its format, tone, style, and task-specific skill. It is excellent for behavior you can demonstrate with examples but struggle to fully specify in a prompt.\n\n**Fine-tuning is a terrible way to inject *what* the model knows.** Facts baked into weights are frozen at training time, can't be cited, are expensive to update, and *increase* hallucination risk because the model can't distinguish what it half-memorized from what it knows. For facts, use **RAG** — knowledge updates the instant a document changes, and every answer can show its source.\n\nThey compose beautifully: **fine-tune the behavior, retrieve the facts.** A support model fine-tuned to your house style and escalation rules, answering from a live RAG index of current policies, is the canonical production shape." },

            { type: "decision", heading: "Prompt vs RAG vs Fine-Tune", rows: [
              ["Behavior is off: format, tone, style, refusals", "Prompt first; fine-tune only if prompting can't hold it"],
              ["Model lacks facts: private, fresh, or changing knowledge", "RAG — do not fine-tune facts in (stale, unverifiable)"],
              ["Need one consistent output format at scale", "Structured-output mode (m3l2) first; fine-tune if needed"],
              ["High volume, narrow task, cost & latency matter", "Distill a small fine-tuned model from a big one"],
              ["Requirements change weekly", "Prompt / RAG — fine-tuning can't keep up with the churn"],
              ["Data can't leave your tenant / must run on-device", "Self-hosted open-weight or small model (SLM)"],
              ["You have fewer than ~100 quality labeled examples", "Prompt + few-shot — you can't fine-tune well yet"],
            ]},

            { type: "text", heading: "When Fine-Tuning Actually Pays Off", body: "It's the right tool more rarely than people think, but when it fits, nothing else matches it:\n\n**A consistent format, style, or tone** you can demonstrate with hundreds of examples but can't pin down in words — brand voice, a rigid report structure, a domain's house style.\n**A narrow, high-volume task** where a fine-tuned small model beats a prompted frontier model on cost *and* latency (this is usually distillation — next block).\n**A skill that resists prompting** — a specialized classification or extraction task where even good few-shot prompts plateau below your bar.\n**Prompt compression** — folding a giant few-shot prompt into the weights so you stop paying for those example tokens on every single call (m2l4).\n\nEvery one of these needs enough high-quality labeled data (typically hundreds to thousands of examples) **and** an eval proving the fine-tune beat the prompted baseline (m3l4). No eval, no fine-tune — you'd have no way to know it helped." },

            { type: "text", heading: "Distillation: Make a Small Model Do a Big Model's Job", body: "The highest-leverage customization pattern in production. Use a strong, expensive **teacher** model to generate ideal outputs or labels for your task, then **fine-tune a small, cheap student** model on those examples.\n\nThe student can't match the teacher at *everything* — but on *your one narrow task* it gets remarkably close, at a fraction of the per-call cost and latency. This is how you get near-frontier quality at small-model prices: let the big model do the hard thinking once (to create the dataset), then bottle that behavior into a model small enough to serve cheaply at scale. It pairs naturally with model routing (m2l4): the distilled student handles the routine 80%, the frontier model handles the hard 20%." },

            { type: "code", heading: "Distillation: Teacher Generates, Student Learns", lang: "python", code: `# A strong "teacher" labels your data; you fine-tune a small, cheap "student"
# on its answers. The student approaches teacher quality on THIS narrow task.

from anthropic import Anthropic
import json

client = Anthropic()

# Your real, unlabeled inputs -- mine these from production traffic.
INPUTS = ["customer email 1 ...", "customer email 2 ...", "..."]

# 1. Teacher (expensive, high quality) produces the "ideal" output.
def teacher_label(text):
    r = client.messages.create(
        model="claude-opus-4-6",          # strong teacher
        max_tokens=512,
        messages=[{"role": "user",
                   "content": f"Extract name, intent, urgency as JSON from:\\n{text}"}],
    )
    return r.content[0].text

# 2. Build a supervised fine-tuning dataset from the teacher's answers.
sft_data = [{"prompt": x, "completion": teacher_label(x)} for x in INPUTS]
with open("sft.jsonl", "w") as f:
    for row in sft_data:
        f.write(json.dumps(row) + "\\n")

# 3. Fine-tune a SMALL model on sft.jsonl with LoRA (the trainer is in m2l3).
#    Result: an ~8B student doing this one task close to the teacher's quality,
#    at a fraction of the cost and latency -- validate the gap on an eval set.` },

            { type: "text", heading: "Synthetic Data: When You Don't Have Enough Examples", body: "Fine-tuning and evaluation both need data you often don't have. So generate it: prompt a strong model to produce diverse, realistic examples — including the edge cases and failure modes you want covered. For classification, generate per class; for extraction, vary formats and difficulty; for chat, simulate the awkward multi-turn cases.\n\nThe cautions matter as much as the technique:\n**Validate quality** — garbage synthetic data trains a garbage model. Spot-check it like real data.\n**Force diversity** — models left to themselves produce samey, low-variance output; vary prompts, seeds, personas, and difficulty explicitly.\n**Watch for inherited errors and bias** — the teacher's mistakes and biases propagate straight into your student (m9l2).\n**Never let synthetic data be your only eval** — your held-out test set must contain *real* inputs, or you're grading the model on its own imagination.\n**Check the terms** — some providers restrict using their model's outputs to train competing models; confirm before you build on it (m9l2)." },

            { type: "text", heading: "Small & On-Device Models (SLMs)", body: "Not every problem needs a frontier model — and defaulting to one is often the expensive wrong answer (m1l1: bigger isn't always better). **Small language models** (roughly 1B–14B parameters) and on-device deployment win in specific, common situations:\n\n**Privacy / data residency** — runs entirely inside your tenant or on the device; data never leaves (m1l3, m6l7).\n**Latency** — no network round-trip; on-device inference can be near-instant.\n**Cost at volume** — at high, steady request rates, a self-hosted small model undercuts per-token API pricing (m2l4).\n**Offline** — works with no connectivity.\n\nThe trade is a lower ceiling on open-ended reasoning. But here's the key insight: for a *narrow, distilled* task, that ceiling rarely matters — a small specialized model is frequently indistinguishable from a frontier one on the job it was tuned for, while costing and latency-ing a fraction as much." },

            { type: "diagram", heading: "The Customization Ladder", variant: "flow", nodes: [
              { label: "Prompt", detail: "minutes, free" },
              { label: "+ Few-shot", detail: "examples in context" },
              { label: "+ RAG", detail: "for facts" },
              { label: "Fine-tune", detail: "for behavior" },
              { label: "Distill → SLM", detail: "cheap at scale" },
            ], caption: "Each rung costs more and is harder to reverse. Climb only as far as your eval (m3l4) requires — most problems stop at rung 1 or 2." },

            { type: "text", heading: "Fine-Tuning Pitfalls", body: "If you do climb to fine-tuning, these are what bite:\n\n**Catastrophic forgetting** — over-tuning on a narrow dataset can degrade the model's general ability. LoRA (m2l3), a light touch, and mixing in general examples all mitigate it.\n**Data quality dominates** — a few thousand clean, consistent examples beat tens of thousands of noisy ones. Most of the work is data, not training.\n**No before/after eval = flying blind** — measure the prompted baseline and the fine-tuned model on the *same held-out set* (m3l4), or you can't claim it helped.\n**It's a versioned artifact, not set-and-forget** — your adapter is part of the deployable `(code, prompt, model, index)` tuple (m7l4), and you'll re-tune when base models deprecate or inputs drift.\n**Budget the whole cost** — data labeling and eval often cost more than the GPU time everyone focuses on." },

            { type: "checklist", heading: "Customization Essentials", items: [
              "Climb the ladder: prompt → RAG → fine-tune → distill; stop at the first rung your eval passes",
              "Fine-tune for behavior and form; retrieve for facts — never bake changing facts into weights",
              "Prove any fine-tune beats the prompted baseline on a held-out eval set (m3l4) before shipping",
              "Distillation (teacher → student) is the cheapest route to near-frontier quality at small-model cost",
              "Generate synthetic data when examples are scarce — but validate its quality and diversity, and keep real data in your eval",
              "Smaller specialized models often win on cost, latency, and privacy; the frontier default is frequently overkill",
              "Version fine-tuned adapters as part of the deployable tuple (m7l4); plan to re-tune as base models deprecate",
              "Budget for data labeling, not just GPU time — data quality dominates the outcome",
            ]}
          ]
        }
      ]
    }
;
