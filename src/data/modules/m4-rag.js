export default
    {
      id: "m4", number: "04", title: "RAG Systems", accent: "#FF3366",
      desc: "Retrieval-Augmented Generation — architecture, implementation, and production patterns.",
      lessons: [
        { id: "m4l1", title: "RAG Architecture Overview", duration: "17 min", tags: ["rag","architecture","patterns","ingestion","retrieval","fundamentals"],
          content: [
            { type: "text", heading: "The Core Problem", body: "LLMs have knowledge cutoffs and don't know your private data. RAG retrieves relevant information at query time and injects it into the prompt.\n\nSimple LLM: User → LLM → (possibly hallucinated) Answer\nRAG: User → Retrieve docs → LLM + docs → Grounded answer\n\nThis is the #1 enterprise AI pattern." },

            { type: "text", heading: "A Mental Model: RAG as an Open-Book Exam", body: "The most useful intuition for RAG: it's an **open-book exam.**\n\nThe LLM is a bright student who hasn't memorized your company's facts. Instead of forcing it to memorize (fine-tuning), you let it bring notes — but only a few pages fit on the desk (the context window). **Retrieval is the act of choosing which pages to put on the desk.**\n\nThis analogy predicts almost everything about RAG behavior:\n\n• Put the *right* pages out and a smart student answers well.\n• Put the *wrong* pages out and even a genius fails — it can't answer from facts it can't see.\n• Pile on *too many* pages and the student gets distracted and misses the key line.\n• The student still has to *read and reason* — good notes don't guarantee a good answer.\n\nKeep this in mind through the whole module: most RAG failures are *page-selection* failures (retrieval), not student-intelligence failures (the model)." },

            { type: "text", heading: "Why RAG Beats the Alternatives", body: "RAG isn't the only way to give a model knowledge it lacks. It wins for most enterprise cases because the alternatives have sharp limits:\n\n**vs Fine-tuning** — Fine-tuning changes *behavior*, not *facts* (m2l3). Baking knowledge into weights is expensive, slow to update, and unreliable for recall. RAG knowledge updates the instant you change a document, and every answer can cite its source.\n\n**vs Long-context stuffing** — \"Just paste all the docs in the prompt\" fails at scale: expensive (you pay for every token every call, m2l4), slow, capped by the context window, and hurt by lost-in-the-middle (m3l1). RAG sends only the relevant slice.\n\n**vs Keyword search alone** — Keyword search misses semantic matches (\"feline\" vs \"cat\"); RAG's embeddings find meaning, not just words (m2l1).\n\nThe sweet spot: **large, changing, or private knowledge** that must be answered accurately and verifiably. When knowledge is small and static, put it in the system prompt; when you need *behavior* change, fine-tune; often you combine RAG with both." },

            { type: "text", heading: "The RAG Pipeline", body: "**Ingestion (offline):**\n1. Load documents (PDFs, web pages, databases)\n2. Chunk into manageable pieces (200-1000 tokens)\n3. Generate embeddings for each chunk\n4. Store in vector database\n\n**Retrieval (runtime):**\n1. Embed the user's question\n2. Search vector DB for most similar chunks\n3. Return top-K results\n\n**Generation:**\n1. Inject retrieved chunks as context\n2. LLM answers grounded in provided context\n3. Optionally include citations" },

            { type: "diagram", heading: "The Retrieval Hot Path", variant: "flow", nodes: [
              { label: "Question" },
              { label: "Embed", detail: "same model as ingest" },
              { label: "Vector search", detail: "top-K chunks" },
              { label: "Assemble", detail: "inject + instruct" },
              { label: "LLM", detail: "grounded answer" },
            ], caption: "What the user feels, on a latency budget. Ingestion (load → chunk → embed → store) runs offline, ahead of time — the same embedding model must be used in both phases." },

            { type: "text", heading: "Two Phases: Ingestion (Offline) vs Retrieval (Online)", body: "RAG has two pipelines that run at completely different times, and conflating them causes most architectural confusion.\n\n**Ingestion (offline / batch)** — A data pipeline that runs *ahead of time*, re-running whenever your documents change: load → parse → chunk → embed → store. It's ETL. It can be slow, scheduled, and re-run freely without touching live traffic.\n\n**Retrieval + generation (online / hot path)** — Runs *per user query*, on a latency budget: embed the question → search → assemble prompt → generate. This is what your users feel.\n\nWhy the split matters: you can re-index the whole corpus (new chunking, new embedding model) without changing serving code — but the **embedding model must be identical in both phases** (m2l1: vectors from different models aren't comparable). Mismatching them silently destroys retrieval quality. Most teams under-invest in ingestion and then blame the model for bad answers." },

            { type: "text", heading: "Why It's Called Retrieval-Augmented Generation", body: "The name is the architecture, one word per stage:\n\n**Retrieval** — Find the chunks most relevant to the question (vector, keyword, or hybrid search — m4l3). This stage caps the ceiling on answer quality.\n\n**Augmented** — *Assemble* the prompt: inject the retrieved chunks as context, add instructions (\"answer only from this context\"), order and format them, include citations. This step is quietly where a lot of quality is won or lost — how you present context matters as much as what you retrieved.\n\n**Generation** — The LLM produces an answer grounded in the supplied context. Crucially, \"grounded\" is *encouraged, not guaranteed* — the model can still ignore the context, blend in its own (possibly wrong) prior knowledge, or hallucinate. Faithfulness must be measured (m4l6), not assumed.\n\nEach stage is a separate lever with its own failure modes — which is why this module devotes a lesson to each." },

            { type: "code", heading: "Minimal RAG — C# with Semantic Kernel", lang: "csharp", code: `using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;
using Microsoft.SemanticKernel.Connectors.AzureAISearch;
using Microsoft.SemanticKernel.Memory;

// 1. Build kernel with chat + embedding models
var builder = Kernel.CreateBuilder();
builder.AddAzureOpenAIChatCompletion(
    "gpt-4o", "https://YOUR.openai.azure.com/", "KEY");
builder.AddAzureOpenAITextEmbeddingGeneration(
    "text-embedding-3-small", "https://YOUR.openai.azure.com/", "KEY");
var kernel = builder.Build();

// 2. Set up memory with Azure AI Search
var memoryBuilder = new MemoryBuilder()
    .WithAzureOpenAITextEmbeddingGeneration(
        "text-embedding-3-small", "https://YOUR.openai.azure.com/", "KEY")
    .WithMemoryStore(new AzureAISearchMemoryStore(
        "https://YOUR.search.windows.net", "KEY"));
var memory = memoryBuilder.Build();

// 3. Ingest documents
await memory.SaveInformationAsync("docs", 
    id: "doc1",
    text: "Your document chunk text here...",
    description: "Source: handbook.pdf, page 12");

// 4. Retrieve and generate
string query = "What is our refund policy?";
var results = memory.SearchAsync("docs", query, limit: 5);

var context = new StringBuilder();
await foreach (var result in results)
{
    context.AppendLine(result.Metadata.Text);
}

var prompt = $"""
Answer the question based ONLY on the provided context.
If the context doesn't contain the answer, say "I don't have that information."

<context>
{context}
</context>

Question: {query}
""";

var response = await kernel.InvokePromptAsync(prompt);
Console.WriteLine(response);` },
            { type: "code", heading: "Minimal RAG — Python with LangChain", lang: "python", code: `from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_community.vectorstores import AzureSearch
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

# 1. Set up models
llm = AzureChatOpenAI(
    azure_deployment="gpt-4o",
    azure_endpoint="https://YOUR.openai.azure.com/",
    api_key="KEY"
)
embeddings = AzureOpenAIEmbeddings(
    azure_deployment="text-embedding-3-small",
    azure_endpoint="https://YOUR.openai.azure.com/",
    api_key="KEY"
)

# 2. Set up vector store
vector_store = AzureSearch(
    azure_search_endpoint="https://YOUR.search.windows.net",
    azure_search_key="KEY",
    index_name="my-docs",
    embedding_function=embeddings.embed_query,
)

# 3. Ingest documents
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500, chunk_overlap=50
)
chunks = splitter.split_documents(documents)
vector_store.add_documents(chunks)

# 4. Retrieve and generate
retriever = vector_store.as_retriever(search_kwargs={"k": 5})

prompt = ChatPromptTemplate.from_template("""
Answer based ONLY on the provided context.
If the context doesn't contain the answer, say so.

Context: {context}
Question: {question}
""")

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
)

response = chain.invoke("What is our refund policy?")
print(response.content)` },

            { type: "text", heading: "Where RAG Breaks: The Failure Points", body: "RAG looks simple in a demo and gets hard in production because failure can enter at *every* stage. Knowing the map tells you where to debug (full playbook in m4l7):\n\n**Parsing** — A PDF table or scanned page extracts as garbled text. Garbage in, garbage out before retrieval even starts.\n**Chunking** — Chunks too big (diluted meaning, wasted tokens) or too small (lost context), or split mid-sentence/mid-table (m4l2).\n**Embedding** — Wrong or mismatched embedding model, or a domain where general embeddings don't separate your concepts (m2l1).\n**Retrieval miss** — The answer exists in your corpus but isn't in the top-K results (low recall) — the single most common RAG failure (m4l3, m4l4).\n**Too much / irrelevant context** — The right chunk is retrieved but buried among distractors; the model latches onto the wrong one.\n**Generation** — The model ignores the context, merges in stale prior knowledge, or hallucinates despite good retrieval.\n**No citations** — The answer may be right, but nobody can verify it, so nobody trusts it.\n\nThe discipline: when an answer is wrong, find *which stage* failed before changing anything — usually it's retrieval, not the model." },

            { type: "text", heading: "Retrieval Caps Generation", body: "The single most important principle in RAG: **the generator can only be as good as what retrieval feeds it.** If the relevant chunk isn't in the context, no amount of model intelligence or prompt tuning will conjure the right answer — the model will either say \"I don't know\" (good) or confidently make something up (bad).\n\nThis reframes where to spend effort. Teams instinctively reach for a bigger LLM when RAG answers are poor, but the bottleneck is usually **retrieval quality**, governed by two competing measures:\n\n**Recall** — Did we retrieve the chunk that contains the answer? Miss it and you've lost before generation.\n**Precision** — Of what we retrieved, how much is actually relevant? Low precision floods the prompt with distractors and dilutes attention.\n\nMost of Module 4 — chunking (m4l2), hybrid search and reranking (m4l3, m4l4), evaluation (m4l6) — is really about raising recall and precision. Fix retrieval first; reach for a better generator last." },

            { type: "decision", heading: "Is RAG the Right Tool?", rows: [
              ["Large, changing, or private knowledge; answers must be accurate & cited", "RAG — the core enterprise pattern"],
              ["Knowledge is small and static (a few facts/rules)", "Just put it in the system prompt — no retrieval needed"],
              ["You need to change the model's behavior, style, or format", "Fine-tune (m2l3); combine with RAG if you also need facts"],
              ["The whole relevant corpus fits the context window, cheaply", "Long-context prompt may be simpler — but watch cost & lost-in-the-middle"],
              ["Answer requires live actions or computation, not just lookup", "Tools / agents (Module 5), possibly alongside RAG"],
              ["Questions are exact-keyword lookups (IDs, codes, SKUs)", "Keyword/DB search may beat vectors — or hybrid (m4l3)"],
            ]},

            { type: "checklist", heading: "RAG Architecture Takeaways", items: [
              "RAG = open-book exam: retrieval chooses the pages, the model reads and reasons over them",
              "Two pipelines: offline ingestion (load→chunk→embed→store) and the online hot path (embed→search→augment→generate)",
              "Use the SAME embedding model for ingestion and query — mismatched vectors silently wreck retrieval",
              "Retrieval caps generation — fix recall/precision before reaching for a bigger LLM",
              "Failure can enter at any stage (parse, chunk, embed, retrieve, augment, generate) — diagnose the stage first",
              "Always ground with 'answer only from context' instructions and require citations for verifiability",
              "RAG for facts, fine-tuning for behavior, system prompt for small static knowledge — often combined",
              "Grounding is encouraged, not guaranteed — measure faithfulness (m4l6), don't assume it",
            ]}
          ]
        },
        { id: "m4l2", title: "Chunking Strategies", duration: "16 min", tags: ["rag","chunking","ingestion","embeddings","metadata"],
          content: [
            { type: "text", heading: "Why Chunking Matters", body: "Chunk size and strategy directly determine retrieval quality. Too small = missing context. Too large = diluted relevance, wasted tokens. The right approach depends on your content and query patterns." },

            { type: "text", heading: "The Chunking Trade-off, Mechanically", body: "Chunking quality is really an *embedding* problem. Recall from m2l1 that each chunk is compressed into a **single fixed-size vector** meant to summarize its meaning. That one vector is a lossy summary — and its quality depends on how much, and how coherent, the text inside is.\n\n**Too large** — A 2,000-token chunk covering five topics yields a vector that's the *average* of all five. It matches everything weakly and nothing strongly — \"blurry\" meaning. It also burns context tokens at generation time.\n\n**Too small** — A single sentence embeds sharply but may lack the context to actually answer (\"It increased 12%\" — what did, over what period?).\n\nThe goal: chunks that are **one coherent idea** — big enough to stand alone, small enough that the embedding stays sharp. That's why *where* you cut matters as much as *how big* the pieces are." },

            { type: "text", heading: "Chunk-Size Math: Budgets & Overlap", body: "Two quick calculations keep chunking grounded.\n\n**Context budget.** Retrieved chunks share the prompt with everything else. With top-K = 5 chunks at 500 tokens each, that's 2,500 tokens of context — plus system prompt (~500) and room for the answer (~800). Fine for a 128K window. But bump chunks to 2,000 tokens and those same 5 results balloon to 10,000 tokens: 4x the cost per query (m2l4) for often *worse* precision. Bigger chunks aren't free.\n\n**Overlap.** Overlap stops a fact from being lost when it straddles a boundary. Without it, \"...the warranty lasts | 24 months from purchase\" splits the answer across two chunks and neither matches well. A 50-token overlap on 500-token chunks copies the last ~50 tokens into the next chunk: ~10% redundancy, ~11% more chunks to store and embed — cheap insurance. Rule of thumb: **overlap ≈ 10–20% of chunk size**, more for dense reference material, less for prose." },

            { type: "decision", heading: "Chunking Strategy Selection", rows: [
              ["Uniform content (articles, docs)", "Recursive character splitting, 500 tokens, 50 overlap"],
              ["Structured docs (manuals, specs)", "Document-aware: split on headers/sections"],
              ["Code repositories", "Split on function/class boundaries"],
              ["Legal / regulatory docs", "Paragraph-level with section metadata preserved"],
              ["Mixed content types", "Parent-child: large parent chunks, small child chunks for retrieval"],
              ["FAQ / Q&A content", "One chunk per question-answer pair"],
            ]},

            { type: "text", heading: "Structure-Aware > Size-Aware", body: "The biggest chunking upgrade is to stop cutting by raw character count and start cutting on **the document's own structure.** A fixed 500-character cut will happily slice through the middle of a sentence, a table row, or a function definition — producing chunks that embed poorly and read as nonsense.\n\nSemantic boundaries make better split points because they align with coherent ideas:\n\n• **Prose** → paragraphs and sections (the recursive splitter approximates this by trying paragraph breaks before line breaks before words).\n• **Markdown / HTML** → headings (each section becomes a chunk carrying its heading as metadata).\n• **Code** → function/class boundaries, never mid-function.\n• **Tables** → keep a row's data together, ideally with the header row repeated, or extract to structured form.\n\nThe principle: a chunk boundary should fall where a *human* would see a natural break. Respecting structure does more for retrieval quality than tuning the exact token count." },

            { type: "code", heading: "Recursive Character Splitting — Python", lang: "python", code: `from langchain.text_splitter import RecursiveCharacterTextSplitter

# Standard recursive splitter — tries largest separators first
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,          # tokens (roughly)
    chunk_overlap=50,        # overlap prevents cutting mid-thought
    separators=[             # tries these in order:
        "\\n\\n",            # 1. paragraph breaks
        "\\n",               # 2. line breaks
        ". ",                # 3. sentences
        " ",                 # 4. words
        ""                   # 5. characters (last resort)
    ],
    length_function=len,     # swap with tiktoken for accurate token count
)

chunks = splitter.split_documents(documents)

# With tiktoken for accurate token counting
import tiktoken
enc = tiktoken.encoding_for_model("gpt-4o")
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    length_function=lambda text: len(enc.encode(text)),
)` },
            { type: "code", heading: "Markdown Header Splitting — Python", lang: "python", code: `from langchain.text_splitter import MarkdownHeaderTextSplitter

# Split on markdown headers — preserves document structure
headers_to_split_on = [
    ("#", "h1"),
    ("##", "h2"),
    ("###", "h3"),
]

splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on
)

chunks = splitter.split_text(markdown_content)
# Each chunk includes header metadata:
# chunk.metadata = {"h1": "Introduction", "h2": "Overview"}` },

            { type: "text", heading: "Parent-Child (Small-to-Big) Retrieval", body: "There's a clever way out of the small-vs-large dilemma: **decouple what you embed from what you return.**\n\n**Parent-child (small-to-big):** Split documents into large *parent* chunks, then split each parent into small *child* chunks. Embed and search over the **children** (sharp, precise matching), but when a child is retrieved, hand the **parent** to the LLM (full context to answer with). You get retrieval precision *and* generation context.\n\n**Sentence-window** is a lighter variant: embed individual sentences, but on a hit return that sentence plus a window of N sentences around it.\n\nBoth solve the same problem: the text that matches *best* is often too small to *answer* from. Separate the two jobs and you stop having to compromise on chunk size." },

            { type: "code", heading: "Parent-Child Chunking — Python", lang: "python", code: `# Embed small children for precise matching; return big parents for context.
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
child_splitter  = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=40)

store = {}          # parent_id -> parent_text
index = []          # list of (child_vector, parent_id)

for doc in documents:
    for parent in parent_splitter.split_text(doc):
        pid = new_id()
        store[pid] = parent
        for child in child_splitter.split_text(parent):
            index.append((embed(child), pid))    # search happens over children

def retrieve(query, k=5):
    hits = top_k(embed(query), index, k)          # match precise children
    parent_ids = dedupe(pid for _, pid in hits)   # ...but return their parents
    return [store[pid] for pid in parent_ids]     # full context to the LLM

# LangChain ships this as ParentDocumentRetriever; the mechanism is the above.` },

            { type: "text", heading: "Enrich Chunks: Metadata & Context", body: "A raw chunk in isolation is often ambiguous — \"The limit is $5,000 per quarter\" means nothing without knowing *which* limit, in *which* policy. Two enrichments fix this:\n\n**Metadata** — Attach structured fields to every chunk: source file, page, section heading, document date, author, access level. Metadata powers (1) **citations** (\"handbook.pdf, p.12\"), (2) **filtering** (\"only HR docs updated this year\" before vector search — m4l3), and (3) **debugging** (which doc did this come from?). Never throw it away during chunking.\n\n**Contextual retrieval** — Before embedding, prepend a one-line, LLM-generated summary situating the chunk in its document (\"This chunk is from the 2025 Travel Policy, Reimbursement section.\"). Now the isolated chunk carries its own context, so it embeds and matches far more accurately. Anthropic reported this cutting retrieval failures substantially; the trade is a small one-time cost per chunk at ingestion." },

            { type: "text", heading: "Common Chunking Failures", body: "Most retrieval problems are born at the chunking stage. The usual culprits:\n\n**Mangled tables and figures** — A table flattened into a wall of numbers embeds as noise. Detect tables and extract them to structured form (or keep rows intact with the header).\n\n**Code split mid-function** — A chunk ending halfway through a function is useless. Split code on function/class boundaries.\n\n**Boundary loss** — A fact spanning two chunks with no overlap is retrievable from neither. Add overlap.\n\n**Over-large chunks** — One vector summarizing many topics matches weakly and wastes tokens. Tighten to one coherent idea.\n\n**Dropped metadata** — No source/page means no citations and no filtering. Preserve it from the start.\n\n**Stale chunks after a model swap** — Different embedding models prefer different sizes and (m2l1) require a full re-embed anyway. Changing the embedding model means re-running ingestion end to end.\n\nWhen retrieval is bad, inspect the actual chunks before blaming search or the model — the rot usually starts here." },

            { type: "checklist", heading: "Chunking Best Practices", items: [
              "Start at 500 tokens with 50-token overlap, then experiment",
              "Always preserve metadata (source file, page number, section header)",
              "Test with real user queries — not just eyeballing chunk boundaries",
              "Use parent-child chunking for complex documents: embed small chunks, retrieve parent",
              "Consider query length: chunks should be similar in length to expected queries",
              "Re-chunk when you change embedding models — different models prefer different sizes",
            ]}
          ]
        },
        { id: "m4l3", title: "Vector Search & Hybrid Search", duration: "19 min", tags: ["rag","search","azure","vector-db","hnsw","bm25","hybrid"],
          content: [
            { type: "text", heading: "Vector Search Basics", body: "Embedding similarity finds semantically related content. \"refund policy\" matches \"money back guarantee\" even though they share no words.\n\nBut pure vector search has weaknesses: it misses exact keyword matches, struggles with names/IDs, and can return plausible-sounding but irrelevant results." },

            { type: "text", heading: "Exact vs Approximate Nearest Neighbor (ANN)", body: "Vector search answers one question: \"which stored vectors are closest to this query vector?\" (similarity via cosine/dot product, m2l1). The naive way — **exact k-nearest-neighbor** — compares the query against *every* stored vector and sorts. That's O(N) per query: fine for 10,000 chunks, hopeless for 10 million (you'd score 10M dot products on every keystroke).\n\nSo vector databases use **Approximate Nearest Neighbor (ANN)** indexes. They trade a sliver of accuracy for orders-of-magnitude speed: instead of guaranteeing the *exact* top-K, they return *almost certainly* the top-K, in milliseconds, by cleverly avoiding most comparisons.\n\nThis is the entire reason a \"vector database\" is a distinct product rather than a column in your SQL table — it's the data structure that makes similarity search fast at scale. The cost: results are *approximate*, so 'recall@k' (did we find the true neighbors?) becomes a tunable that never quite hits 100%." },

            { type: "text", heading: "How HNSW Works", body: "**HNSW (Hierarchical Navigable Small World)** is the most widely used ANN index — the default in Azure AI Search, Qdrant, Weaviate, and pgvector's HNSW mode.\n\nThe idea: build a **multi-layer graph** of vectors. The top layer has a few nodes with long-range links; each layer down is denser. To search, you enter at the sparse top, greedily hop to the neighbor closest to the query, then drop a layer and repeat — like zooming in on a map. You reach the right neighborhood in roughly logarithmic hops instead of scanning everything.\n\nThree parameters control the speed/recall/memory trade:\n\n**M** — links per node. Higher = better recall, more memory.\n**efConstruction** — effort at *build* time. Higher = better-quality graph, slower indexing.\n**efSearch** — candidates explored at *query* time. Higher = better recall, slower queries. This is the main knob you tune live.\n\nAlternatives exist — **IVF** (cluster vectors, search only nearby clusters) and **product quantization (PQ)** (compress vectors to save memory, at some accuracy cost), often combined as IVF-PQ for billion-scale indexes. HNSW is the default because it's fast and high-recall out of the box." },

            { type: "text", heading: "Hybrid Search = Vector + Keyword", body: "Combine vector similarity with BM25 keyword search, merge with Reciprocal Rank Fusion (RRF).\n\nThis is the production standard. Real-world improvement: 10-30% better retrieval accuracy vs vector-only.\n\nAzure AI Search, Elasticsearch, and Weaviate all support hybrid natively." },

            { type: "text", heading: "Why You Need Keyword Search Too (BM25)", body: "Pure vector search has a blind spot: it's *semantic*, so it can fumble the *literal*. It often misses exact tokens that carry all the meaning — product codes (\"ERR_4012\"), part numbers (\"SKU-88231\"), people's names, acronyms, rare jargon. To an embedding, \"ERR_4012\" and \"ERR_4013\" look nearly identical; to a user they're completely different.\n\n**BM25** (the classic keyword-ranking algorithm behind Lucene/Elasticsearch) is the complement. It scores documents by **term frequency** (how often the query words appear) × **inverse document frequency** (rarer words count more), with length normalization so long docs don't win automatically. It nails exact-match and rare-term queries that vectors miss — but it's blind to synonyms (\"feline\" ≠ \"cat\").\n\nThe two have *complementary* failure modes: semantic search misses exact tokens, lexical search misses meaning. Combining them covers both — which is why hybrid is the production default." },

            { type: "text", heading: "How RRF Actually Merges Results", body: "Hybrid search runs vector and keyword search separately, then must merge two ranked lists into one. The catch: their scores aren't comparable — cosine similarity lives in [-1, 1], BM25 scores are unbounded and corpus-dependent. Normalizing them is fragile.\n\n**Reciprocal Rank Fusion (RRF)** sidesteps that by fusing on **rank, not score.** Each document's fused score is the sum, across every result list it appears in, of 1 / (k + rank), where rank is its position in that list and k is a small constant (commonly 60):\n\n  score(d) = Σ  1 / (k + rank_in_list(d))\n\nSo a doc ranked #1 by vectors and #3 by keywords scores 1/61 + 1/63. A doc high in *both* lists rises to the top; a doc that's #1 in one list but absent from the other still scores respectably. Because it uses only ranks, RRF needs no score normalization and no tuning — which is why nearly every hybrid engine uses it. (k dampens the influence of the very top ranks; higher k flattens the contribution curve.)" },

            { type: "code", heading: "Reciprocal Rank Fusion — Python", lang: "python", code: `def reciprocal_rank_fusion(result_lists, k=60, top_n=5):
    """Merge several ranked lists of doc IDs into one fused ranking."""
    scores = {}
    for ranked in result_lists:                  # e.g. [vector_hits, keyword_hits]
        for rank, doc_id in enumerate(ranked):   # rank is 0-based here
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
    return sorted(scores, key=scores.get, reverse=True)[:top_n]

# Vector and keyword each return their own ranking of doc IDs:
vector_hits  = ["d9", "d2", "d5", "d7"]
keyword_hits = ["d2", "d3", "d9", "d1"]

fused = reciprocal_rank_fusion([vector_hits, keyword_hits])
# d2 and d9 rank high in BOTH lists -> they rise to the top of the fused result.` },

            { type: "code", heading: "Azure AI Search — Hybrid Search Setup", lang: "csharp", code: `using Azure.Search.Documents;
using Azure.Search.Documents.Indexes;
using Azure.Search.Documents.Indexes.Models;
using Azure.Search.Documents.Models;

// 1. Define index with both vector and keyword fields
var index = new SearchIndex("my-docs")
{
    Fields =
    {
        new SimpleField("id", SearchFieldDataType.String) { IsKey = true },
        new SearchableField("content") { AnalyzerName = LexicalAnalyzerName.EnLucene },
        new SearchableField("title"),
        new SimpleField("source", SearchFieldDataType.String) { IsFilterable = true },
        new SearchField("contentVector", SearchFieldDataType.Collection(
            SearchFieldDataType.Single))
        {
            IsSearchable = true,
            VectorSearchDimensions = 1536,
            VectorSearchProfileName = "my-vector-profile"
        }
    },
    VectorSearch = new()
    {
        Profiles = { new VectorSearchProfile("my-vector-profile", "my-hnsw") },
        Algorithms = { new HnswAlgorithmConfiguration("my-hnsw") }
    },
    // Enable semantic ranker for re-ranking
    SemanticSearch = new()
    {
        Configurations =
        {
            new SemanticConfiguration("my-semantic-config", new()
            {
                ContentFields = { new SemanticField("content") },
                TitleField = new SemanticField("title")
            })
        }
    }
};

// 2. Create index
var adminClient = new SearchIndexClient(endpoint, credential);
await adminClient.CreateOrUpdateIndexAsync(index);

// 3. Hybrid search query (vector + keyword + semantic reranking)
var searchClient = new SearchClient(endpoint, "my-docs", credential);

float[] queryVector = await GetEmbeddingAsync(userQuery);

var options = new SearchOptions
{
    // Keyword search component
    QueryType = SearchQueryType.Semantic,
    SemanticSearch = new()
    {
        SemanticConfigurationName = "my-semantic-config",
        QueryCaption = new(QueryCaptionType.Extractive)
    },
    // Vector search component
    VectorSearch = new()
    {
        Queries =
        {
            new VectorizedQuery(queryVector)
            {
                KNearestNeighborsCount = 10,
                Fields = { "contentVector" }
            }
        }
    },
    Size = 5,       // top 5 results
    Select = { "content", "title", "source" }
};

var results = await searchClient.SearchAsync<SearchDocument>(
    userQuery, options);` },
            { type: "code", heading: "Azure AI Search — Hybrid Query in Python", lang: "python", code: `from azure.search.documents import SearchClient
from azure.search.documents.models import (
    VectorizedQuery, QueryType, QueryCaptionType
)

search_client = SearchClient(endpoint, "my-docs", credential)

query_vector = get_embedding(user_query)

results = search_client.search(
    search_text=user_query,           # keyword component
    query_type=QueryType.SEMANTIC,     # enable semantic ranker
    semantic_configuration_name="my-semantic-config",
    query_caption=QueryCaptionType.EXTRACTIVE,
    vector_queries=[
        VectorizedQuery(
            vector=query_vector,
            k_nearest_neighbors=10,
            fields="contentVector"
        )
    ],
    top=5,
    select=["content", "title", "source"]
)

for result in results:
    print(f"[{result['@search.score']:.2f}] {result['title']}")
    print(result["content"][:200])` },

            { type: "text", heading: "Metadata Filtering: Narrow Before You Search", body: "Real queries are rarely \"search everything.\" They're \"search the *current user's* documents,\" \"only docs from this year,\" \"only the EU region's policies.\" That's **metadata filtering** (using fields attached during chunking, m4l2), and *where* it happens matters:\n\n**Pre-filtering** — Restrict the candidate set by metadata *before* the ANN search runs. More accurate (you search only eligible docs, so recall isn't wasted on ineligible ones) and essential for security — in a multi-tenant app, pre-filtering by tenant_id is what stops one customer's query from ever matching another's data (m3l3).\n\n**Post-filtering** — Run the search, then drop results that fail the filter. Simpler, but can return *fewer* than K results (or none) when the top matches all get filtered out.\n\nPrefer **pre-filtering** for correctness and security. Note it interacts with ANN: aggressive filters can degrade HNSW recall (the graph wasn't built around your filter), which good vector DBs mitigate with filter-aware search — worth testing at your selectivity." },

            { type: "decision", heading: "Vector Database Selection", rows: [
              ["Azure/.NET ecosystem", "Azure AI Search — native hybrid + semantic ranking"],
              ["Already using PostgreSQL", "pgvector extension — simple, good enough for most cases"],
              ["Need managed + serverless", "Pinecone — zero-ops, scales automatically"],
              ["Open source, self-hosted", "Qdrant or Weaviate — both excellent"],
              ["Prototype / local dev", "Chroma — lightweight, in-memory, easy setup"],
              ["AWS ecosystem", "OpenSearch with vector plugin"],
            ]},

            { type: "text", heading: "Tuning & Pitfalls", body: "Search quality lives in the details:\n\n**Recall vs latency (efSearch/topK)** — Raising efSearch and K finds more true neighbors but costs latency. Tune against an eval set (m4l6), not by feel.\n\n**The 'approximate' gotcha** — ANN can miss the true nearest neighbor. If a *must-never-miss* exact lookup matters (a specific clause, an ID), lean on the keyword side of hybrid or an exact filter — don't trust vectors alone.\n\n**Metric mismatch** — The index's distance metric must match how the embedding model was trained (cosine vs dot vs L2, m2l1). A mismatch silently corrupts ranking.\n\n**Forgotten re-index** — Change the embedding model and every vector is invalid; you must rebuild the index (m2l1, m4l2).\n\n**Over-trusting scores** — Similarity scores aren't probabilities; 0.82 isn't '82% relevant.' Use them for *ranking*, and gate quality with reranking (m4l4) and evals — not raw thresholds.\n\n**Retrieve-then-rerank** — Hybrid gets the right docs *into* the top ~20; a reranker (m4l4) then orders them precisely. Complementary stages, not competitors." },

            { type: "checklist", heading: "Search Takeaways", items: [
              "Vector DBs use Approximate Nearest Neighbor (ANN) — fast at scale, but recall is approximate and tunable",
              "HNSW is the default ANN index; efSearch is the main recall-vs-latency knob you tune at query time",
              "Pure vectors miss exact tokens (codes, IDs, names) — add BM25 keyword search to cover the gap",
              "Hybrid search (vector + keyword) is the production standard, typically 10–30% better than vector-only",
              "RRF fuses result lists by RANK, not score — no normalization, no tuning; that's why everyone uses it",
              "Pre-filter by metadata before searching — more accurate, and the basis of multi-tenant data isolation",
              "Match the distance metric to the embedding model; rebuild the index whenever you change models",
              "Retrieve broadly with hybrid, then rerank precisely (m4l4); validate the whole pipeline with evals (m4l6)",
            ]}
          ]
        },
        { id: "m4l4", title: "Advanced RAG Patterns", duration: "19 min", tags: ["rag","advanced","patterns","reranking","hyde","query-expansion","cross-encoder"],
          content: [
            { type: "text", heading: "Query Transformation", body: "Users ask bad questions. Transform them before retrieval.\n\n**Query expansion** — LLM generates multiple search queries from one question:\n\"What's our refund policy?\" → [\"refund policy\", \"return process\", \"money back guarantee\"]\n\n**HyDE** — Generate a hypothetical answer, embed THAT for retrieval. The answer is closer in embedding space to the actual document than the question.\n\n**Step-back prompting** — For specific questions, broaden first:\n\"Why did revenue drop in Q3?\" → \"Company financial performance 2024\"" },

            { type: "text", heading: "Why Query Transformation Helps: The Query-Document Gap", body: "All three transformations attack one underlying problem: **a question and its answer don't look alike in embedding space.**\n\nEmbeddings encode meaning by *similarity of text* (m2l1). But a user's question — short, interrogative, often vague (\"refund?\") — is phrased nothing like the document that answers it — long, declarative, formal (\"Customers may request a return within 30 days...\"). Their vectors can sit far apart even though one perfectly answers the other. This is the **query-document gap**, and it quietly caps retrieval recall.\n\nThe transformations close the gap from different angles:\n\n**Query expansion** casts a wider net — multiple phrasings raise the chance one lands near the right document.\n**HyDE** reshapes the query to *look like an answer*, so it lands in the answer's neighborhood.\n**Step-back** broadens an over-specific query so it matches the more general document that holds the context.\n\nEach costs an extra LLM call before retrieval — worth it when your queries are short, varied, or phrased very differently from your corpus." },

            { type: "code", heading: "Query Expansion Pattern", lang: "python", code: `from langchain_core.prompts import ChatPromptTemplate

expansion_prompt = ChatPromptTemplate.from_template("""
Generate 3 different search queries to find information 
that would help answer this question. Return as JSON array.
Focus on different phrasings and related concepts.

Question: {question}

Return ONLY a JSON array of strings, nothing else.
""")

# In your retrieval pipeline:
async def expanded_retrieval(question: str, retriever, llm):
    # Generate expanded queries
    result = await (expansion_prompt | llm).ainvoke(
        {"question": question}
    )
    queries = json.loads(result.content)
    queries.append(question)  # include original
    
    # Retrieve for each query, deduplicate
    all_docs = []
    seen_ids = set()
    for q in queries:
        docs = await retriever.ainvoke(q)
        for doc in docs:
            doc_id = hash(doc.page_content)
            if doc_id not in seen_ids:
                seen_ids.add(doc_id)
                all_docs.append(doc)
    
    return all_docs` },

            { type: "text", heading: "HyDE, Mechanically", body: "**HyDE (Hypothetical Document Embeddings)** is the cleverest transformation, and it sounds wrong at first: you ask the LLM to *make up* an answer, then search with the fake one.\n\nThe steps: (1) the LLM generates a hypothetical answer — plausible, document-shaped prose; (2) you embed *that hypothetical answer*, not the question; (3) you search with that embedding.\n\nWhy it works despite the fake answer often being factually wrong: **correctness doesn't matter, shape does.** A made-up answer is structurally a document — declarative, detailed, in the corpus's register — so its embedding lands in the same neighborhood as the *real* answer documents. You then retrieve those real documents and answer grounded in them (the hallucinated draft is discarded).\n\nThe trade: an extra generation call (latency + cost) before every retrieval, and it can *hurt* on topics so niche the model's hypothetical is wildly off-base. Test it against your eval set rather than adopting it blindly." },

            { type: "code", heading: "HyDE — Python", lang: "python", code: `def hyde_retrieve(question, llm, retriever, k=5):
    # 1. Generate a HYPOTHETICAL answer (it may be factually wrong -- fine)
    draft = llm.invoke(
        f"Write a short, confident paragraph answering: {question}"
    ).content

    # 2. Embed and search with the DRAFT, not the question.
    #    The draft is document-shaped, so it lands near real answer docs.
    docs = retriever.invoke(draft, k=k)

    # 3. Answer grounded in the REAL retrieved docs; the draft is discarded.
    return docs` },

            { type: "text", heading: "Re-Ranking", body: "Vector search gets candidates. Re-ranking orders them by actual relevance.\n\n**Cross-encoder re-ranking** — Specialized model scores each chunk against the query. Much more accurate than embedding cosine similarity.\n\n**Pipeline:** Retrieve 20 candidates → Re-rank → Keep top 5 → Send to LLM\n\nThis gives you breadth (retrieval) + precision (re-ranking)." },

            { type: "text", heading: "How Cross-Encoders Differ from Bi-Encoders", body: "Re-ranking works because it uses a fundamentally more powerful (and more expensive) model than retrieval. The distinction:\n\n**Bi-encoder (what retrieval uses)** — Encodes the query and each document *separately* into fixed vectors, then compares with cosine similarity (m2l1). Because document vectors are computed *ahead of time* and stored, search is lightning fast — but the query and document never \"see\" each other, so subtle relevance is lost.\n\n**Cross-encoder (what a reranker is)** — Feeds the query and a candidate document *together* into a model whose attention runs across both at once, outputting a single relevance score. It captures fine-grained interaction (does *this* doc actually answer *this* query?) — far more accurate — but must run the model once *per candidate* and can't be precomputed.\n\nThat cost asymmetry is the whole strategy: use the cheap bi-encoder to pull ~20–100 candidates from millions, then the expensive cross-encoder to precisely re-order just those into the top 5. Breadth from retrieval, precision from reranking. A reranker is often the single highest-ROI upgrade to a mediocre RAG system." },

            { type: "code", heading: "Re-Ranking with Cohere — Python", lang: "python", code: `import cohere

co = cohere.Client("YOUR-COHERE-KEY")

def retrieve_and_rerank(query: str, retriever, top_k=5):
    # Step 1: Broad retrieval (get 20 candidates)
    candidates = retriever.invoke(query, k=20)
    
    # Step 2: Re-rank with cross-encoder
    rerank_results = co.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=[doc.page_content for doc in candidates],
        top_n=top_k
    )
    
    # Step 3: Return top re-ranked results
    return [candidates[r.index] for r in rerank_results.results]` },
            { type: "text", heading: "Parent-Child Retrieval", body: "Embed small chunks (sentences/paragraphs) for precise matching, but return the larger parent chunk (full section/page) as context. Best of both worlds: retrieval precision + generation context.\n\nStore both parent and child chunks with a parent_id relationship. Search children, return parents. (Mechanism and code in m4l2.)" },

            { type: "decision", heading: "When Each Pattern Earns Its Cost", rows: [
              ["Users phrase the same need many different ways", "Query expansion — multiple phrasings widen recall"],
              ["Queries are short/vague and look nothing like your docs", "HyDE — reshape the query into an answer"],
              ["Over-specific questions miss the broader context doc", "Step-back prompting — broaden before retrieving"],
              ["Retrieval returns the right docs but ranked poorly / noisily", "Cross-encoder reranking — the highest-ROI fix"],
              ["Best-matching chunk is too small to answer from", "Parent-child / small-to-big (see m4l2)"],
              ["Query spans multiple sources or needs follow-up retrieval", "Agentic RAG — route, retry, multi-source"],
            ]},

            { type: "text", heading: "Agentic RAG", body: "The most advanced pattern: an AI agent decides what to retrieve and when.\n\n**Router RAG** — Classify query → route to appropriate knowledge base\n**Multi-step RAG** — If first retrieval fails, reformulate and retry\n**Tool-augmented RAG** — Agent can search vectors, query SQL, call APIs, synthesize multiple sources" },

            { type: "text", heading: "Don't Reach for These First", body: "Every pattern here adds latency, cost, and failure surface — query transformation and reranking each add a model call; agentic RAG adds many. Stacking all of them turns a 1-second answer into a 6-second one and multiplies the spend.\n\nThe disciplined order of attack:\n\n**1. Get the basics right** — clean parsing, good chunking (m4l2), and **hybrid search + a reranker** (m4l3, above). This is the 80/20; most struggling RAG systems are fixed here.\n\n**2. Add query transformation** only if evals show a query-document gap — short or highly varied queries that retrieval keeps missing.\n\n**3. Go agentic** only when the task genuinely needs multi-step or multi-source retrieval, not because it sounds sophisticated.\n\nThe rule: **let your eval set (m4l6) tell you which gap to close**, then add the *one* pattern that closes it. Adding patterns speculatively just buys latency and bugs. More machinery is not more accuracy." },

            { type: "checklist", heading: "Advanced RAG Takeaways", items: [
              "The query-document gap caps recall — questions and answers don't look alike in embedding space",
              "Query expansion (more phrasings), HyDE (answer-shaped query), and step-back (broaden) each close that gap, at one LLM call each",
              "HyDE works because shape, not correctness, drives the match — discard the hallucinated draft, keep the real docs",
              "Rerankers are cross-encoders: query+doc scored together — far more accurate, but O(candidates) and not precomputable",
              "Retrieve broadly with the cheap bi-encoder (~20–100), then rerank to the top 5 with the cross-encoder",
              "A reranker is usually the highest-ROI upgrade to a mediocre RAG pipeline",
              "Nail chunking + hybrid + rerank before adding transformation or agentic patterns — they add latency and cost",
              "Let evals (m4l6) pick which pattern to add; layering everything multiplies cost without guaranteeing accuracy",
            ]}
          ]
        },
        { id: "m4l5", title: "RAG Production Checklist", duration: "9 min", tags: ["rag","production","checklist","go-live"],
          content: [
            { type: "text", heading: "How to Use This Checklist", body: "This is a go-live and ongoing-ops gate, not a tutorial — work it before launch and revisit it each release. The four sections trace the RAG data flow from m4l1: **ingestion → retrieval → generation → operations.** Each is a place failure can enter (m4l1's failure map), so each gets its own list.\n\nTwo things to weight your effort: most RAG quality problems are **retrieval** problems (m4l1), so the Ingestion and Retrieval lists earn the most attention; and nothing here is verifiable without an **eval set** (m4l6) — \"hallucination rate is measured\" assumes you have something to measure against. Pair this checklist with the evaluation lesson (m4l6) and the troubleshooting playbook (m4l7)." },

            { type: "checklist", heading: "Data Ingestion", items: [
              "Documents are cleaned and normalized before chunking",
              "Metadata is extracted and preserved (source, date, author, section)",
              "Chunking strategy is tested against real queries",
              "Ingestion pipeline is automated and scheduled",
              "Document versioning is in place — stale content is removed",
              "Large tables/images are handled separately (not just chunked as text)",
            ]},
            { type: "checklist", heading: "Retrieval Quality", items: [
              "Hybrid search is enabled (vector + keyword)",
              "Re-ranking is applied to retrieved results",
              "Query expansion or transformation is implemented for ambiguous queries",
              "Top-K is tuned (start with 5, measure quality vs. token cost)",
              "Metadata filters are used where appropriate (date ranges, categories)",
              "Retrieval eval set exists with 50+ query-document pairs",
            ]},
            { type: "checklist", heading: "Generation Quality", items: [
              "System prompt instructs model to answer ONLY from context",
              "\"I don't know\" behavior is tested — model refuses when context lacks answer",
              "Citations/source references are included in responses",
              "Output format is validated (JSON schema, length limits)",
              "Hallucination rate is measured on eval set",
              "Context window usage is monitored (not exceeding limits)",
            ]},
            { type: "checklist", heading: "Operations", items: [
              "Latency is monitored (target: <3s for simple queries)",
              "Token usage and cost per query is tracked",
              "Error rates and retry logic are in place",
              "User feedback (thumbs up/down) is collected",
              "Stale data detection: alerts when source documents change",
              "Load testing has been performed for expected throughput",
            ]},

            { type: "text", heading: "The Minimum Bar to Ship", body: "If you do nothing else on this page, don't go live without these four:\n\n**1. An eval set exists and is green.** 50+ representative query/answer pairs with a measured baseline (m4l6). Without it, every other item is a guess.\n\n**2. Grounding is enforced and tested.** The model answers only from context and reliably says \"I don't know\" when the answer isn't there — verified, not assumed.\n\n**3. Every answer is traceable.** Citations to source chunks, plus logging of the retrieved context per query, so a wrong answer can be pinned to a stage (m4l7).\n\n**4. Access control is correct.** Retrieval respects per-user / per-tenant permissions via metadata pre-filtering (m4l3) — a RAG system that leaks documents across users is a breach, not a bug.\n\nEverything else here improves quality or economics; these four are the difference between a demo and a system you can put in front of users." }
          ]
        },
        { id: "m4l6", title: "Evaluating RAG Systems", duration: "18 min", tags: ["rag","evaluation","testing","metrics","llm-as-judge"],
          content: [
            { type: "text", heading: "Separate Retrieval from Generation", body: "You must measure two things independently:\n\n**Retrieval quality** — Are you finding the right documents?\n• Precision@K: Of K retrieved docs, how many are relevant?\n• Recall: Of all relevant docs, how many did you find?\n• MRR: How high is the first relevant result?\n\n**Generation quality** — Is the LLM using context correctly?\n• Faithfulness: Does the answer stick to context?\n• Relevance: Does it actually answer the question?\n• Context utilization: Is all relevant info used?" },

            { type: "text", heading: "Retrieval Metrics, With the Math", body: "Retrieval is an information-retrieval problem, so borrow IR's metrics. Say a query has **4 truly relevant chunks** in your corpus, and you retrieve **K = 5**, of which **3 are relevant** (at positions 2, 3, 5).\n\n**Precision@K** = relevant retrieved ÷ K = 3/5 = **0.60**. \"How clean is what I returned?\"\n\n**Recall@K** = relevant retrieved ÷ total relevant = 3/4 = **0.75**. \"How much of what exists did I find?\"\n\n**MRR (Mean Reciprocal Rank)** = 1 ÷ rank of the *first* relevant result, averaged over queries. First relevant at position 2 → 1/2 = **0.50**. Rewards getting *a* good hit high.\n\n**NDCG** = like precision but **discounts by rank** (a relevant doc at position 1 counts more than at position 5) and supports graded relevance. The standard when ranking *order* matters.\n\n**Hit rate@K** = fraction of queries where *at least one* relevant doc lands in the top K. The simplest \"did retrieval even work?\" gauge.\n\nComputing any of these requires knowing which chunks are relevant per query — which is why the golden set (below) is non-negotiable." },

            { type: "text", heading: "Why Precision and Recall Trade Off", body: "Precision and recall pull against each other, and **K** (how many chunks you retrieve) is the dial between them.\n\n**Raise K** → you catch more of the relevant docs (recall ↑) but pull in more junk (precision ↓), spend more context tokens (m2l4), and risk lost-in-the-middle (m3l1).\n**Lower K** → cleaner context (precision ↑) but you risk missing the one chunk that holds the answer (recall ↓).\n\n**F1** = the harmonic mean of precision and recall, when you want a single balanced number.\n\nWhich to favor? In RAG, a *missed* relevant chunk usually means a wrong or \"I don't know\" answer — so **recall is often the priority**, and you recover precision afterward with a reranker (m4l4) that trims the noisy candidates back down. The classic recipe: retrieve at high K for recall, rerank to low K for precision, then generate." },

            { type: "text", heading: "Generation Metrics, Defined", body: "Even with perfect retrieval, generation can fail. Three metrics — often called the **RAG triad** — cover it:\n\n**Faithfulness (groundedness)** — Of the claims in the answer, what fraction are actually supported by the retrieved context? This is the hallucination detector. An answer that's correct but *not derivable from the context* still scores low — and should, because it means the model used outside, unverifiable knowledge.\n\n**Answer relevancy** — Does the answer actually address the question, without padding or drift?\n\n**Context relevance / utilization** — Was the retrieved context on-topic, and did the answer use the relevant parts of it?\n\nThe triad localizes failure: low *context relevance* points at retrieval; low *faithfulness* with good context points at generation; low *answer relevancy* with good faithfulness points at prompt/instruction problems. That's why you measure all three, not a single end-to-end score." },

            { type: "text", heading: "LLM-as-Judge: How Automated Metrics Actually Work", body: "How does a tool like Ragas compute \"faithfulness = 0.92\" with no human in the loop? **LLM-as-judge.** A strong model is given a rubric and asked to grade — for faithfulness, it typically decomposes the answer into individual claims and checks each against the retrieved context, returning the fraction supported.\n\nThis is the only way to evaluate open-ended generation at scale (exact-match fails — there are many correct phrasings). But the judge is itself an LLM, so:\n\n**Validate it against humans.** Spot-check that judge scores correlate with human ratings before trusting them.\n**Use a strong, separate judge model.** Don't grade a model's output with the same model — shared blind spots inflate scores.\n**Beware known biases** — judges favor longer, more confident answers and show position bias in comparisons (same root cause as sycophancy, m2l3).\n\nUsed carefully, LLM-as-judge is good enough to drive regression tests and A/Bs; used blindly, it produces confident, wrong numbers. The general discipline — building an eval set, validating the judge, gating on it — is m3l4; the judge prompt pattern is in m3l5." },

            { type: "code", heading: "Automated RAG Evaluation — Python with Ragas", lang: "python", code: `from ragas import evaluate
from ragas.metrics import (
    faithfulness,       # does answer stick to context?
    answer_relevancy,   # does it answer the question?
    context_precision,  # are retrieved docs relevant?
    context_recall,     # did we find all relevant docs?
)
from datasets import Dataset

# Prepare eval dataset
eval_data = {
    "question": ["What is the refund policy?", ...],
    "answer": [rag_pipeline("What is the refund policy?"), ...],
    "contexts": [retrieved_contexts, ...],
    "ground_truth": ["Full refunds within 30 days...", ...]
}

dataset = Dataset.from_dict(eval_data)

# Run evaluation
results = evaluate(
    dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_precision,
        context_recall,
    ],
)

print(results)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88, 
#  'context_precision': 0.85, 'context_recall': 0.78}` },

            { type: "text", heading: "Build the Golden Set", body: "Every metric above is meaningless without ground truth. The **golden set** (a.k.a. eval set) is the foundation: a curated collection of **(question, ideal answer, and ideally the IDs of the relevant chunks)**.\n\nHow to build one worth trusting:\n\n**Mine real queries** — Pull actual or anticipated questions from logs, support tickets, and SMEs. Synthetic-only sets miss how people really ask.\n**Author answers with experts** — A subject-matter expert writes/approves the ideal answer and marks which source chunks support it.\n**Cover the hard cases on purpose** — ambiguous questions, multi-hop questions, and crucially **questions your corpus *can't* answer** (to test the \"I don't know\" behavior).\n**Size: ~50 to start, 100–200+ for stability** — enough that a one-point metric move isn't noise.\n\nThis is the same discipline as the model bake-off (m2l5), applied to retrieval. It's tedious to build and pays for itself the first time it catches a regression before users do." },

            { type: "code", heading: "A Minimal Eval Harness — Python", lang: "python", code: `# What Ragas does under the hood, in miniature: loop the golden set,
# run the pipeline, score retrieval with math and generation with a judge.

def precision_recall_at_k(retrieved_ids, relevant_ids, k):
    top  = retrieved_ids[:k]
    hits = len(set(top) & set(relevant_ids))
    precision = hits / k
    recall    = hits / len(relevant_ids) if relevant_ids else 0.0
    return precision, recall

def evaluate(golden_set, rag, judge, k=5):
    p_sum = r_sum = f_sum = 0.0
    for ex in golden_set:                       # ex: question, relevant_ids, ideal
        retrieved_ids, context, answer = rag(ex["question"])
        p, r = precision_recall_at_k(retrieved_ids, ex["relevant_ids"], k)
        # faithfulness via LLM-as-judge: fraction of answer claims in context
        f = judge.faithfulness(answer=answer, context=context)
        p_sum += p; r_sum += r; f_sum += f
    n = len(golden_set)
    return {"precision@k": p_sum/n, "recall@k": r_sum/n, "faithfulness": f_sum/n}

# Run this in CI on every prompt / model / index change -> a regression gate (m7l4).` },

            { type: "decision", heading: "Common Failures → Fixes", rows: [
              ["Low retrieval precision", "Improve chunking, add re-ranking, try hybrid search"],
              ["Low retrieval recall", "Add query expansion, check if content is actually ingested"],
              ["Low faithfulness (hallucination)", "Strengthen system prompt, reduce temperature to 0"],
              ["Low answer relevance", "Improve retrieval first, then tune generation prompt"],
              ["Model ignores context", "Check context length — model may be losing info in the middle"],
              ["Inconsistent results", "Pin model version, set temperature=0, check for data staleness"],
            ]},

            { type: "text", heading: "Offline vs Online Evaluation", body: "Two evaluation loops, both necessary:\n\n**Offline** — Run the golden set against a candidate change *before* deploy. Deterministic, repeatable, and the right place for a **regression gate**: block the release if faithfulness or recall drops below baseline (wire it into CI — m7l4). Its blind spot: it only knows the queries you thought of.\n\n**Online** — Signals from real production traffic: thumbs up/down, citation click-through, the **\"I don't know\" rate**, escalation/retry rate, latency. These catch what offline can't — **distribution shift**, where real users ask things your golden set never anticipated, or the corpus drifts.\n\nUse them together: offline to ship safely, online to discover gaps — then feed surprising production queries *back into* the golden set so it keeps reflecting reality. (Production monitoring details in m7l2.)" },

            { type: "text", heading: "Evaluation Pitfalls", body: "**No ground truth.** \"It looks good\" isn't a metric. Build the golden set first; everything depends on it.\n\n**Eval set too small.** Ten examples means every metric is noise. Aim for 50+, more for stable comparisons.\n\n**Judge = generator.** Grading a model's answers with the same model inflates scores through shared blind spots. Use a different, strong judge and validate against humans.\n\n**Only end-to-end scores.** A single \"accuracy\" number can't tell you whether retrieval or generation failed. Measure the stages separately — the whole point of this lesson.\n\n**Gaming one metric.** Optimizing faithfulness alone can make the model refuse everything (perfectly faithful, useless). Track the triad together.\n\n**Static eval set.** Corpora and questions drift; a set frozen at launch slowly stops reflecting reality. Refresh it from production." },

            { type: "checklist", heading: "RAG Evaluation Takeaways", items: [
              "Measure retrieval and generation separately — a single end-to-end score can't localize failure",
              "Retrieval: precision@K (clean?), recall@K (complete?), MRR/NDCG (ranked well?) — needs labeled relevant chunks",
              "Favor recall in retrieval (a missed chunk = wrong answer); recover precision with a reranker (m4l4)",
              "Generation: the RAG triad — context relevance, faithfulness/groundedness, answer relevancy",
              "Automated metrics use LLM-as-judge — validate against humans, use a separate strong judge, watch length/position bias",
              "The golden set (question + ideal answer + relevant chunk IDs) is the non-negotiable foundation — include 'should refuse' cases",
              "Run offline evals as a CI regression gate (m7l4); watch online signals (thumbs, 'I don't know' rate) for drift",
              "Feed surprising production queries back into the golden set so it keeps reflecting reality",
            ]}
          ]
        },
        { id: "m4l7", title: "RAG Troubleshooting Guide", duration: "13 min", tags: ["rag","debugging","troubleshooting","production","diagnostics"],
          content: [
            { type: "text", heading: "The Diagnostic Framework", body: "When your RAG system isn't performing, resist the urge to tweak randomly. Follow this systematic approach:\n\n**Step 1:** Isolate the problem — is it retrieval or generation?\n**Step 2:** Reproduce with specific failing queries\n**Step 3:** Diagnose the root cause\n**Step 4:** Fix and verify against your eval set\n\nThe most common mistake is tuning generation prompts when the real problem is retrieval. Always diagnose retrieval first." },

            { type: "text", heading: "Triage Order: Cheapest Checks First", body: "Before the deep diagnostic below, run the fast checks in order of likelihood and effort — most RAG failures are caught in the first three:\n\n**1. Is the content even there?** Query the vector store directly for the answer's text. If it's missing, it's a *data / ingestion* gap (m4l2), not a search or model problem — stop here and fix ingestion.\n**2. Did the right chunk get retrieved?** Inspect the top-K *before* generation. Not present → a *retrieval* problem (the most common one — m4l1, m4l3).\n**3. Embedding model match?** Confirm ingestion and query use the *same* model and version (m2l1) — a silent mismatch wrecks everything downstream.\n**4. Is an access filter hiding it?** Pre-filters (m4l3) can correctly-but-surprisingly exclude the very doc you expect.\n**5. Only now suspect generation.** Good context but a wrong answer → prompt/grounding or lost-in-the-middle (m3l1).\n\nThe discipline is *order*: each step is cheaper than the next and rules out a whole class of cause. Quantify what you find against the golden set (m4l6) rather than eyeballing a single query." },

            { type: "text", heading: "Step 1: Is It Retrieval or Generation?", body: "Run a failing query and inspect the retrieved chunks BEFORE they go to the LLM.\n\n**If the relevant chunks are NOT in the retrieved results** → Retrieval problem. The right information exists in your corpus but the search isn't finding it.\n\n**If the relevant chunks ARE in the retrieved results but the answer is wrong** → Generation problem. The LLM is receiving good context but producing a bad answer.\n\n**If the relevant information isn't in your corpus at all** → Data gap. No amount of tuning will help. You need to add the missing content." },
            { type: "code", heading: "RAG Diagnostic Script — Python", lang: "python", code: `async def diagnose_rag(query: str, expected_source: str = None):
    """Run a diagnostic on a failing RAG query."""
    
    print(f"\n{'='*60}")
    print(f"QUERY: {query}")
    print(f"{'='*60}")
    
    # Step 1: Check retrieval
    print("\n--- RETRIEVAL DIAGNOSIS ---")
    retrieved = await retriever.ainvoke(query, k=10)
    
    for i, doc in enumerate(retrieved):
        relevance = "?" # manually inspect
        print(f"\n[{i+1}] Score: {doc.metadata.get('score', 'N/A'):.4f}")
        print(f"    Source: {doc.metadata.get('source', 'unknown')}")
        print(f"    Content: {doc.page_content[:200]}...")
    
    if expected_source:
        found = any(expected_source in d.metadata.get('source', '') 
                     for d in retrieved)
        print(f"\nExpected source '{expected_source}': "
              f"{'FOUND' if found else 'NOT FOUND'}")
    
    # Step 2: Check embedding similarity
    print("\n--- EMBEDDING ANALYSIS ---")
    query_embedding = await embeddings.aembed_query(query)
    
    if expected_source:
        # Compare query embedding to expected document
        expected_doc = await get_doc_by_source(expected_source)
        if expected_doc:
            doc_embedding = await embeddings.aembed_query(
                expected_doc.page_content)
            similarity = cosine_similarity(query_embedding, doc_embedding)
            print(f"Query-to-expected-doc similarity: {similarity:.4f}")
            if similarity < 0.7:
                print("LOW SIMILARITY - query and document use very "
                      "different language. Consider:")
                print("  - Adding query expansion")
                print("  - Using HyDE (hypothetical document embeddings)")
                print("  - Adding keyword aliases to your docs")
    
    # Step 3: Check generation
    print("\n--- GENERATION DIAGNOSIS ---")
    context = "\n\n".join([d.page_content for d in retrieved[:5]])
    
    response = await llm.ainvoke(f"""
    Answer based ONLY on context. If context lacks the answer, say so.
    
    Context: {context}
    Question: {query}
    """)
    
    print(f"Response: {response.content[:500]}")
    print(f"\nContext token count: ~{len(context.split()) * 1.3:.0f}")
    print(f"Used {len(retrieved[:5])} chunks")
    
    # Step 4: Summary
    print(f"\n--- DIAGNOSIS SUMMARY ---")
    print("Check these in order:")
    print("1. Are the right documents being retrieved? (inspect above)")
    print("2. Is the similarity score reasonable? (>0.75 is good)")
    print("3. Is the context too long? (model loses info in middle)")
    print("4. Is the generation prompt clear enough?")

# Usage:
await diagnose_rag(
    "What is our refund policy for international orders?",
    expected_source="policies/returns.pdf"
)` },
            { type: "decision", heading: "Retrieval Problems → Fixes", rows: [
              ["Right doc exists but isn't retrieved at all", "Check if document was ingested. Query your vector store directly to verify the chunks exist."],
              ["Right doc retrieved but ranked too low (not in top 5)", "Add re-ranking (cross-encoder). Switch to hybrid search. Try query expansion."],
              ["Query and document use different terminology", "Add query expansion (LLM generates multiple search phrases). Try HyDE. Add synonyms/aliases to doc metadata."],
              ["Too many irrelevant results diluting good ones", "Tighten chunk size. Add metadata filters (date, category, source). Increase re-ranking cutoff."],
              ["Works for short queries, fails for long/complex ones", "Decompose complex queries into sub-queries. Implement multi-step retrieval."],
              ["Keyword-heavy queries return nothing (IDs, codes, names)", "Enable hybrid search (BM25 + vector). Pure vector search misses exact matches."],
              ["Works in testing, fails in production", "Check if ingestion pipeline is running. Verify no stale/deleted documents. Check for encoding issues."],
            ]},
            { type: "decision", heading: "Generation Problems → Fixes", rows: [
              ["Model ignores retrieved context, answers from training data", "Strengthen instruction: 'ONLY use provided context.' Lower temperature to 0. Add: 'If context lacks the answer, say I don't know.'"],
              ["Model hallucinates details not in context", "Add citation requirement. Reduce context length (model loses middle). Use smaller, more relevant chunks."],
              ["Answer is too vague / doesn't use specific details", "Add instruction: 'Include specific numbers, dates, and names from the context.' Add few-shot example of good answer."],
              ["Model says 'I don't know' when answer IS in context", "Check context length — answer may be buried. Move most relevant chunk to the beginning. Increase top-K."],
              ["Answers are inconsistent for same query", "Set temperature=0. Pin model version. Check if retrieved chunks vary between runs."],
              ["Good answer but wrong source cited", "Number your source chunks explicitly: [Source 1], [Source 2]. Tell model to cite by number."],
            ]},
            { type: "code", heading: "Quick Retrieval Quality Check — Python", lang: "python", code: `async def retrieval_quality_report(eval_pairs: list[dict]):
    """Run retrieval eval on a set of query-expected_doc pairs.
    
    eval_pairs format:
    [{"query": "...", "expected_doc_id": "..."}, ...]
    """
    hits = 0
    mrr_sum = 0.0
    
    for pair in eval_pairs:
        results = await retriever.ainvoke(pair["query"], k=10)
        result_ids = [r.metadata.get("doc_id") for r in results]
        
        if pair["expected_doc_id"] in result_ids:
            hits += 1
            rank = result_ids.index(pair["expected_doc_id"]) + 1
            mrr_sum += 1.0 / rank
    
    n = len(eval_pairs)
    print(f"Recall@10:   {hits/n:.1%} ({hits}/{n} queries found the right doc)")
    print(f"MRR:         {mrr_sum/n:.3f} (higher = relevant docs ranked higher)")
    
    if hits/n < 0.7:
        print("\nACTION: Retrieval needs work before tuning generation.")
        print("Try: hybrid search, query expansion, re-ranking, or re-chunking.")
    elif hits/n < 0.9:
        print("\nACTION: Retrieval is decent. Add re-ranking to push to 90%+.")
    else:
        print("\nRetrieval looks good. Focus on generation quality.")` },
            { type: "checklist", heading: "RAG Debugging Checklist", items: [
              "Run 10 failing queries through the diagnostic script — look for patterns",
              "Check retrieval BEFORE generation — most 'generation' problems are actually retrieval problems",
              "Verify documents are actually ingested: query vector store directly, not through the full pipeline",
              "Check embedding model matches between ingestion and query time (same model, same version)",
              "Inspect chunk boundaries: is important context getting split across chunks?",
              "Test hybrid search vs vector-only: run same queries, compare retrieval quality",
              "Check for stale data: when was the last successful ingestion run?",
              "Monitor context token count: if you're sending 10K+ tokens, the model loses information in the middle",
              "Verify temperature=0 for consistent debugging (non-determinism makes diagnosis impossible)",
              "Build and maintain an eval set of 50+ failing queries with expected answers and sources",
            ]}
          ]
        }
      ]
    }
;
