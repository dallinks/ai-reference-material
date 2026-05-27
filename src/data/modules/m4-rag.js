export default
    {
      id: "m4", number: "04", title: "RAG Systems", accent: "#FF3366",
      desc: "Retrieval-Augmented Generation — architecture, implementation, and production patterns.",
      lessons: [
        { id: "m4l1", title: "RAG Architecture Overview", duration: "10 min", tags: ["rag","architecture","patterns"],
          content: [
            { type: "text", heading: "The Core Problem", body: "LLMs have knowledge cutoffs and don't know your private data. RAG retrieves relevant information at query time and injects it into the prompt.\n\nSimple LLM: User → LLM → (possibly hallucinated) Answer\nRAG: User → Retrieve docs → LLM + docs → Grounded answer\n\nThis is the #1 enterprise AI pattern." },
            { type: "text", heading: "The RAG Pipeline", body: "**Ingestion (offline):**\n1. Load documents (PDFs, web pages, databases)\n2. Chunk into manageable pieces (200-1000 tokens)\n3. Generate embeddings for each chunk\n4. Store in vector database\n\n**Retrieval (runtime):**\n1. Embed the user's question\n2. Search vector DB for most similar chunks\n3. Return top-K results\n\n**Generation:**\n1. Inject retrieved chunks as context\n2. LLM answers grounded in provided context\n3. Optionally include citations" },
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
print(response.content)` }
          ]
        },
        { id: "m4l2", title: "Chunking Strategies", duration: "9 min", tags: ["rag","chunking","ingestion"],
          content: [
            { type: "text", heading: "Why Chunking Matters", body: "Chunk size and strategy directly determine retrieval quality. Too small = missing context. Too large = diluted relevance, wasted tokens. The right approach depends on your content and query patterns." },
            { type: "decision", heading: "Chunking Strategy Selection", rows: [
              ["Uniform content (articles, docs)", "Recursive character splitting, 500 tokens, 50 overlap"],
              ["Structured docs (manuals, specs)", "Document-aware: split on headers/sections"],
              ["Code repositories", "Split on function/class boundaries"],
              ["Legal / regulatory docs", "Paragraph-level with section metadata preserved"],
              ["Mixed content types", "Parent-child: large parent chunks, small child chunks for retrieval"],
              ["FAQ / Q&A content", "One chunk per question-answer pair"],
            ]},
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
        { id: "m4l3", title: "Vector Search & Hybrid Search", duration: "12 min", tags: ["rag","search","azure","vector-db"],
          content: [
            { type: "text", heading: "Vector Search Basics", body: "Embedding similarity finds semantically related content. \"refund policy\" matches \"money back guarantee\" even though they share no words.\n\nBut pure vector search has weaknesses: it misses exact keyword matches, struggles with names/IDs, and can return plausible-sounding but irrelevant results." },
            { type: "text", heading: "Hybrid Search = Vector + Keyword", body: "Combine vector similarity with BM25 keyword search, merge with Reciprocal Rank Fusion (RRF).\n\nThis is the production standard. Real-world improvement: 10-30% better retrieval accuracy vs vector-only.\n\nAzure AI Search, Elasticsearch, and Weaviate all support hybrid natively." },
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
            { type: "decision", heading: "Vector Database Selection", rows: [
              ["Azure/.NET ecosystem", "Azure AI Search — native hybrid + semantic ranking"],
              ["Already using PostgreSQL", "pgvector extension — simple, good enough for most cases"],
              ["Need managed + serverless", "Pinecone — zero-ops, scales automatically"],
              ["Open source, self-hosted", "Qdrant or Weaviate — both excellent"],
              ["Prototype / local dev", "Chroma — lightweight, in-memory, easy setup"],
              ["AWS ecosystem", "OpenSearch with vector plugin"],
            ]}
          ]
        },
        { id: "m4l4", title: "Advanced RAG Patterns", duration: "13 min", tags: ["rag","advanced","patterns","reranking"],
          content: [
            { type: "text", heading: "Query Transformation", body: "Users ask bad questions. Transform them before retrieval.\n\n**Query expansion** — LLM generates multiple search queries from one question:\n\"What's our refund policy?\" → [\"refund policy\", \"return process\", \"money back guarantee\"]\n\n**HyDE** — Generate a hypothetical answer, embed THAT for retrieval. The answer is closer in embedding space to the actual document than the question.\n\n**Step-back prompting** — For specific questions, broaden first:\n\"Why did revenue drop in Q3?\" → \"Company financial performance 2024\"" },
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
            { type: "text", heading: "Re-Ranking", body: "Vector search gets candidates. Re-ranking orders them by actual relevance.\n\n**Cross-encoder re-ranking** — Specialized model scores each chunk against the query. Much more accurate than embedding cosine similarity.\n\n**Pipeline:** Retrieve 20 candidates → Re-rank → Keep top 5 → Send to LLM\n\nThis gives you breadth (retrieval) + precision (re-ranking)." },
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
            { type: "text", heading: "Parent-Child Retrieval", body: "Embed small chunks (sentences/paragraphs) for precise matching, but return the larger parent chunk (full section/page) as context. Best of both worlds: retrieval precision + generation context.\n\nStore both parent and child chunks with a parent_id relationship. Search children, return parents." },
            { type: "text", heading: "Agentic RAG", body: "The most advanced pattern: an AI agent decides what to retrieve and when.\n\n**Router RAG** — Classify query → route to appropriate knowledge base\n**Multi-step RAG** — If first retrieval fails, reformulate and retry\n**Tool-augmented RAG** — Agent can search vectors, query SQL, call APIs, synthesize multiple sources" }
          ]
        },
        { id: "m4l5", title: "RAG Production Checklist", duration: "6 min", tags: ["rag","production","checklist"],
          content: [
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
            ]}
          ]
        },
        { id: "m4l6", title: "Evaluating RAG Systems", duration: "8 min", tags: ["rag","evaluation","testing"],
          content: [
            { type: "text", heading: "Separate Retrieval from Generation", body: "You must measure two things independently:\n\n**Retrieval quality** — Are you finding the right documents?\n• Precision@K: Of K retrieved docs, how many are relevant?\n• Recall: Of all relevant docs, how many did you find?\n• MRR: How high is the first relevant result?\n\n**Generation quality** — Is the LLM using context correctly?\n• Faithfulness: Does the answer stick to context?\n• Relevance: Does it actually answer the question?\n• Context utilization: Is all relevant info used?" },
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
            { type: "decision", heading: "Common Failures → Fixes", rows: [
              ["Low retrieval precision", "Improve chunking, add re-ranking, try hybrid search"],
              ["Low retrieval recall", "Add query expansion, check if content is actually ingested"],
              ["Low faithfulness (hallucination)", "Strengthen system prompt, reduce temperature to 0"],
              ["Low answer relevance", "Improve retrieval first, then tune generation prompt"],
              ["Model ignores context", "Check context length — model may be losing info in the middle"],
              ["Inconsistent results", "Pin model version, set temperature=0, check for data staleness"],
            ]}
          ]
        },
        { id: "m4l7", title: "RAG Troubleshooting Guide", duration: "12 min", tags: ["rag","debugging","troubleshooting","production"],
          content: [
            { type: "text", heading: "The Diagnostic Framework", body: "When your RAG system isn't performing, resist the urge to tweak randomly. Follow this systematic approach:\n\n**Step 1:** Isolate the problem — is it retrieval or generation?\n**Step 2:** Reproduce with specific failing queries\n**Step 3:** Diagnose the root cause\n**Step 4:** Fix and verify against your eval set\n\nThe most common mistake is tuning generation prompts when the real problem is retrieval. Always diagnose retrieval first." },
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
