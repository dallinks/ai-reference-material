export const unit = {
  id: "lg3",
  title: "Retrieval-Augmented Generation (RAG)",
  summary: "Ground the model in your data: embeddings and the cosine-similarity math, chunking trade-offs, retrieval strategies, and the RAG chain.",
  prerequisites: ["lg1"],
  masteryThreshold: 0.85,
  references: [
    "LangChain docs — Semantic search / retrievers & vector stores",
    "Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP (2020)",
  ],
  lessons: [
    {
      id: "lg3l1",
      title: "Why RAG: Grounding LLMs in Data",
      estMinutes: 22,
      content: [
        {
          type: "text",
          heading: "The knowledge problem",
          body: `An LLM knows only what was in its training data — which is **stale** (frozen at a cutoff), **generic** (none of your private/internal documents), and **lossy** (it compresses the web into weights and confidently *hallucinates* specifics it never memorized). You can't retrain the model for every question. **Retrieval-Augmented Generation (RAG)** sidesteps all three: instead of relying on the model's parametric memory, you *retrieve* relevant documents at query time and *put them in the prompt*, so the model answers from evidence you supplied — current, private, and citable.`,
        },
        {
          type: "theorem",
          kind: "definition",
          name: "Retrieval-Augmented Generation (RAG)",
          statement: `**RAG** (Lewis et al., 2020) augments generation with a retrieval step: given a query, fetch the most relevant documents from an external knowledge store and include them in the model's context, so the answer is grounded in retrieved evidence rather than the model's weights. It separates **knowledge** (in an updatable store) from **reasoning** (in the model) — you update the store without retraining, and the model cites what it was given.`,
        },
        {
          type: "text",
          heading: "The two-phase pipeline",
          body: `RAG has an **offline indexing** phase and an **online query** phase. *Indexing* (once, and on updates): **load** documents → **split** them into chunks → **embed** each chunk into a vector → **store** the vectors in a vector database. *Query* (per request): **embed** the question → **retrieve** the top-k most similar chunks → **stuff** them into the prompt → **generate** an answer grounded in them. The first phase builds the searchable index; the second turns a question into grounded context and an answer.`,
        },
        {
          type: "diagram",
          kind: "graph",
          directed: true,
          height: 250,
          caption: "The RAG query pipeline. The question is embedded and used to retrieve the top-k most similar chunks from the vector store; those chunks are formatted into the prompt alongside the question, and the model generates a grounded answer. Indexing (load → split → embed → store) happens offline beforehand.",
          nodes: [
            { id: "q", label: "question", x: 6, y: 50 },
            { id: "ret", label: "retriever", x: 32, y: 50, tone: "sage" },
            { id: "vs", label: "vectors", x: 32, y: 14, tone: "muted" },
            { id: "prompt", label: "prompt", x: 62, y: 50, tone: "gold" },
            { id: "model", label: "model", x: 88, y: 50, tone: "gold" },
          ],
          edges: [
            { from: "q", to: "ret", label: "embed" },
            { from: "vs", to: "ret", label: "top-k", tone: "sage", dashed: true },
            { from: "ret", to: "prompt", label: "chunks", tone: "sage" },
            { from: "q", to: "prompt", label: "question", tone: "muted" },
            { from: "prompt", to: "model", label: "grounded", tone: "gold" },
          ],
        },
        {
          type: "callout",
          tone: "warn",
          body: `**RAG reduces hallucination — it does not eliminate it.** The model can still ignore the retrieved context, misread it, or blend it with its (wrong) parametric memory; and if retrieval surfaces the *wrong* chunks, the model confidently answers from bad evidence. Ground the prompt ("answer only from the context; say 'I don't know' if it's not there"), and verify — RAG moves the failure from the model to the *retrieval*, which you must then make good (Lesson 3).`,
        },
        {
          type: "exercises",
          heading: "Exercises",
          items: [
            {
              prompt: "RAG works by doing what — and why is that better than fine-tuning the model on your documents for a knowledge base that changes daily?",
              solution: "RAG **retrieves relevant documents at query time and injects them into the model's prompt context**, so the model answers from supplied evidence rather than its weights. For a daily-changing knowledge base this beats fine-tuning because: knowledge lives in an **updatable store** (add/edit/delete a document instantly; no retraining), it's **current** (retrieval sees the latest docs), it's **citable** (you know which chunks grounded the answer), and it's **cheaper** (no training run per update). Fine-tuning bakes knowledge into weights — stale the moment data changes, expensive to redo, and hard to attribute or update granularly. RAG separates updatable knowledge from fixed reasoning.",
            },
            {
              prompt: "Name the offline indexing steps and the online query steps of a RAG pipeline.",
              solution: "**Offline indexing** (once + on updates): load documents → split into chunks → embed each chunk into a vector → store the vectors in a vector store. **Online query** (per request): embed the question → retrieve the top-k most similar chunks from the store → stuff those chunks into the prompt alongside the question → generate an answer grounded in them. Indexing builds the searchable vector index; query turns a question into retrieved context + a grounded answer.",
            },
          ],
        },
      ],
      reviewItems: [
        { id: "lg3l1-i1", front: "What problem does RAG solve?", back: "LLM knowledge is stale, generic (no private data), and hallucination-prone. RAG retrieves relevant docs at query time and injects them into the prompt, grounding answers in supplied evidence." },
        { id: "lg3l1-i2", front: "RAG's two phases?", back: "Offline indexing: load → split → embed → store. Online query: embed question → retrieve top-k → stuff into prompt → generate grounded answer." },
        { id: "lg3l1-i3", front: "RAG vs fine-tuning for changing knowledge?", back: "RAG keeps knowledge in an updatable store (instant updates, current, citable, cheap); fine-tuning bakes it into weights (stale on change, expensive, hard to attribute). RAG separates knowledge from reasoning." },
        { id: "lg3l1-i4", front: "Does RAG eliminate hallucination?", back: "No — it reduces it but the model can ignore/misread context, and wrong retrieval → confident wrong answers. Ground the prompt ('answer only from context') and fix retrieval quality." },
      ],
    },
    {
      id: "lg3l2",
      title: "Embeddings & Vector Search",
      estMinutes: 26,
      content: [
        {
          type: "theorem",
          kind: "definition",
          name: "Embedding",
          statement: `An **embedding** is a function mapping a piece of text to a fixed-length vector of floats (e.g. 1536 dimensions) such that **semantically similar texts map to nearby vectors**. The geometry encodes meaning: "car" and "automobile" land close together, "car" and "banana" far apart — regardless of shared words. Embeddings turn the fuzzy problem of "find passages *about* this" into the precise problem of "find nearby vectors."`,
        },
        {
          type: "theorem",
          kind: "proposition",
          name: "Cosine similarity is the retrieval metric",
          statement: `Semantic closeness between vectors a and b is measured by **cosine similarity**\n\n  sim(a, b) = (a · b) / (‖a‖ ‖b‖) = cos θ ∈ [−1, 1],\n\nthe cosine of the angle between them: 1 = identical direction, 0 = orthogonal/unrelated, −1 = opposite. Retrieval is then a **k-nearest-neighbour** search: embed the query and return the k stored chunk-vectors with the highest cosine similarity.`,
          proof: `By definition of the dot product, a · b = ‖a‖‖b‖cos θ, so cos θ = (a·b)/(‖a‖‖b‖). This depends only on the *angle* between the vectors, not their magnitudes — which is what we want, because embedding models encode meaning in the *direction* of the vector, not its length (a longer passage isn't 'more' of a meaning). Normalizing vectors to unit length makes cosine similarity equal to the plain dot product and a monotonic function of (negative) squared Euclidean distance, so 'highest cosine similarity' and 'nearest neighbour' coincide. Retrieval embeds the query into the same space and returns the k chunk-vectors of largest cosine similarity. ∎\n\n**Worked:** a = [1, 0, 1], b = [1, 1, 0]: a·b = 1·1 + 0·1 + 1·0 = 1; ‖a‖ = ‖b‖ = √2; sim = 1/(√2·√2) = 1/2 = 0.5 — the vectors are 60° apart, moderately related.`,
        },
        {
          type: "code",
          heading: "Embed, store, and retrieve",
          lang: "python",
          code: `from langchain_openai import OpenAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore

embeddings = OpenAIEmbeddings()                       # text -> vector
store = InMemoryVectorStore(embeddings)               # any vector DB: Chroma, FAISS, ...
store.add_texts(chunks)                               # embed + index the chunks

retriever = store.as_retriever(search_type="similarity", search_kwargs={"k": 4})
docs = retriever.invoke("How do I reset my password?") # top-4 by cosine similarity
# A retriever is a Runnable -> it composes in an LCEL chain (Lesson 3).`,
        },
        {
          type: "theorem",
          kind: "definition",
          name: "Vector store & retriever",
          statement: `A **vector store** (Chroma, FAISS, Qdrant, pgvector, …) stores embedded chunks and performs fast approximate nearest-neighbour search. A **retriever** wraps it as a **Runnable** (so it composes in LCEL chains) exposing \`search_type\`: **"similarity"** (top-k by cosine — the default), **"mmr"** (maximal marginal relevance — relevance *and* diversity), and **"similarity_score_threshold"** (only results above a score). \`k\` controls how many chunks come back.`,
        },
        {
          type: "callout",
          tone: "warn",
          body: `**Retrieval quality bounds answer quality — garbage in, garbage out.** The model can only be as good as the chunks you retrieve; if the right passage isn't in the top-k, the model can't use it and will fall back on (possibly wrong) parametric memory. So retrieval is the part to measure and tune: the embedding model, the chunking (Lesson 3), and k all decide whether the answer-bearing passage is even *present* in the context.`,
        },
        {
          type: "exercises",
          heading: "Exercises",
          items: [
            {
              prompt: "Compute the cosine similarity of a = [1, 0, 1] and b = [1, 1, 0]. What does the value tell you, and why is cosine (angle) used instead of Euclidean distance?",
              solution: "sim = (a·b)/(‖a‖‖b‖). a·b = 1·1 + 0·1 + 1·0 = 1; ‖a‖ = √(1+0+1) = √2, ‖b‖ = √(1+1+0) = √2; sim = 1/(√2·√2) = 1/2 = **0.5**. That means the vectors are 60° apart — moderately similar (1 would be identical direction, 0 unrelated). Cosine (angle) is used because embedding models encode meaning in the *direction* of the vector, not its magnitude — a longer document isn't 'more' of a meaning — so the angle is the right measure; on unit-normalized vectors cosine similarity also coincides with nearest-neighbour by Euclidean distance, so the two agree.",
            },
            {
              prompt: "Your RAG answers are vague and miss specifics that you know are in the documents. Before touching the prompt or model, what part of the system should you investigate, and what two knobs most affect it?",
              solution: "Investigate **retrieval** — if the answer-bearing chunk isn't in the top-k, the model never sees it, so no prompt/model change can help. The two knobs that most affect whether the right passage is retrieved: (1) **chunking** (chunk size/overlap and splitting strategy — too-large chunks dilute relevance, too-small lose context; Lesson 3), and (2) the **embedding model + k** (a better embedding places relevant chunks nearer the query; a larger k widens the net at the cost of more/noisier context). Measure retrieval directly (e.g. recall@k: is the gold passage in the top-k?) before blaming generation.",
            },
          ],
        },
      ],
      reviewItems: [
        { id: "lg3l2-i1", front: "What is an embedding?", back: "A function mapping text → a fixed-length vector so that semantically similar texts map to nearby vectors. Geometry encodes meaning; turns 'find passages about X' into 'find nearby vectors'." },
        { id: "lg3l2-i2", front: "Cosine similarity formula and range?", back: "sim(a,b) = (a·b)/(‖a‖‖b‖) = cos θ ∈ [−1,1]: 1 identical direction, 0 unrelated, −1 opposite. Retrieval = k-NN by highest cosine similarity to the query vector." },
        { id: "lg3l2-i3", front: "Why cosine (angle), not magnitude?", back: "Embedding models encode meaning in vector DIRECTION, not length; the angle is the right measure. On unit-normalized vectors, cosine similarity coincides with Euclidean nearest-neighbour." },
        { id: "lg3l2-i4", front: "Vector store + retriever, and the search types?", back: "Store: embedded chunks + fast ANN search (Chroma/FAISS/…). Retriever: a Runnable over it with search_type 'similarity' (top-k cosine, default), 'mmr' (relevance + diversity), 'similarity_score_threshold'." },
        { id: "lg3l2-i5", front: "Why is retrieval the thing to measure?", back: "The model can only be as good as the retrieved chunks; if the answer passage isn't in top-k, the model can't use it. Embedding, chunking, and k decide whether it's even present." },
      ],
    },
    {
      id: "lg3l3",
      title: "Chunking, Retrieval Strategies & the RAG Chain",
      estMinutes: 26,
      content: [
        {
          type: "theorem",
          kind: "definition",
          name: "Chunking",
          statement: `**Chunking** splits documents into the units you embed and retrieve. The default \`RecursiveCharacterTextSplitter(chunk_size, chunk_overlap)\` tries to split on the largest natural boundary first (paragraph → line → sentence → word), keeping semantically coherent pieces, and overlaps consecutive chunks by \`chunk_overlap\` characters so context isn't severed at a boundary. Chunk size and overlap are among the highest-leverage RAG parameters.`,
        },
        {
          type: "theorem",
          kind: "proposition",
          name: "The chunking trade-off",
          statement: `Chunk size trades **retrieval precision** against **context completeness**. Chunks too *large* dilute the embedding (one vector averages many topics, so the relevant sentence is buried and matches weakly) and waste context-window budget; chunks too *small* match sharply but sever the surrounding context the answer needs. **Overlap** mitigates boundary loss at the cost of duplication. There is no universal optimum — it depends on document structure and query type, and must be tuned by measuring retrieval.`,
          proof: `An embedding is a single vector summarizing a whole chunk, so its direction is an average over the chunk's content. A large chunk covering several topics has a vector pulled toward their average — the specific answer-bearing sentence contributes little, so the chunk's cosine similarity to a pointed query is *diluted* and it may fall out of the top-k; and once retrieved, a large chunk consumes more of the finite context window (fewer chunks fit). A very small chunk embeds sharply (one idea, one direction) and ranks well for a matching query, but may omit the surrounding sentences needed to actually answer (a pronoun's referent, the preceding condition). Overlap re-includes boundary context in both neighbours, reducing severed-context misses, but stores each overlapped span twice. Since precision (favoring small) and completeness (favoring large) pull oppositely and the balance depends on the data, the parameters are tuned empirically against a retrieval metric (e.g. recall@k). ∎`,
        },
        {
          type: "theorem",
          kind: "definition",
          name: "Retrieval strategies: MMR, threshold, hybrid",
          statement: `Beyond plain top-k similarity: **MMR** (maximal marginal relevance) re-ranks to balance relevance with **diversity**, avoiding k near-duplicate chunks that waste context. **Score threshold** returns only results above a similarity cutoff (better to return *few or none* than forced junk). **Hybrid search** combines dense vector retrieval with sparse keyword (**BM25**) retrieval — catching exact terms/IDs that embeddings blur — and fuses the two rankings with **Reciprocal Rank Fusion**: score(d) = Σᵢ 1/(K + rankᵢ(d)), summing reciprocal ranks across retrievers (K ≈ 60 damps low ranks), so each method contributes without needing comparable score scales.`,
        },
        {
          type: "code",
          heading: "The RAG chain (LCEL)",
          lang: "python",
          code: `from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "Answer ONLY from the context. If it's not there, say you don't know.\\n\\n{context}"),
    ("human", "{question}"),
])

def format_docs(docs): return "\\n\\n".join(d.page_content for d in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt | model | StrOutputParser()
)
rag_chain.invoke("How do I reset my password?")  # retrieves, grounds, answers`,
        },
        {
          type: "text",
          heading: "Where RAG fails",
          body: `Most RAG failures are **retrieval** failures, not generation failures. The answer-bearing chunk may never be retrieved (bad chunking, weak embedding, wrong query phrasing); retrieved context may be **diluted** by irrelevant chunks; the model may suffer **lost-in-the-middle** (ignoring evidence buried in a long context); or it may **override** the context with confident parametric memory. The discipline is to *measure retrieval separately from generation* — e.g. recall@k (is the gold passage in the top-k?) — so you fix the actual broken stage instead of fiddling with the prompt.`,
        },
        {
          type: "callout",
          tone: "warn",
          body: `**When RAG is wrong, suspect retrieval first.** Check whether the answer-bearing passage was even in the retrieved top-k *before* blaming the model or the prompt. If it wasn't, no amount of prompt-tuning helps — fix chunking, the embedding model, k, or add hybrid/MMR. Measure retrieval (recall@k) and generation (faithfulness to context) as *separate* metrics.`,
        },
        {
          type: "exercises",
          heading: "Exercises",
          items: [
            {
              prompt: "To preserve context across chunk boundaries, splitters overlap consecutive chunks. What is this parameter called, and explain the precision-vs-completeness trade-off of chunk size.",
              solution: "It's the **chunk overlap** (e.g. `chunk_overlap=200`) — consecutive chunks share that many characters so a sentence/idea split at a boundary still appears whole in one chunk. Chunk-size trade-off: **large** chunks embed as an average over many topics, so the relevant sentence is diluted and ranks weakly (worse precision), and each consumes more context-window budget; **small** chunks embed sharply and rank well (better precision) but may omit surrounding context the answer needs (worse completeness). Overlap reduces boundary loss at the cost of duplication. There's no universal optimum — tune size/overlap against a retrieval metric (recall@k) for your documents and queries.",
            },
            {
              prompt: "A RAG system confidently gives a wrong answer. Describe how you'd diagnose whether the failure is in retrieval or generation, and give one fix for each case.",
              solution: "Diagnose by **inspecting the retrieved chunks for that query**: check whether the answer-bearing passage is present in the top-k (recall@k). **If it's absent → retrieval failure**: the model never saw the evidence. Fixes: improve chunking (size/overlap), use a better embedding model, raise k, or add MMR/hybrid (BM25 + RRF) to catch exact terms — anything that gets the right passage into the top-k. **If the passage IS in the retrieved context but the answer is still wrong → generation failure**: the model ignored, misread, or overrode it (lost-in-the-middle, or trusting parametric memory). Fixes: ground the prompt ('answer ONLY from the context; say you don't know otherwise'), reduce/reorder context (put key chunks first/last), or lower temperature. The key is to measure retrieval and generation **separately** so you fix the actually-broken stage rather than blindly tuning the prompt.",
            },
          ],
        },
      ],
      reviewItems: [
        { id: "lg3l3-i1", front: "What does RecursiveCharacterTextSplitter do?", back: "Splits on the largest natural boundary first (paragraph→line→sentence→word) for coherent chunks, with chunk_overlap characters shared between neighbours so context isn't severed at boundaries." },
        { id: "lg3l3-i2", front: "The chunk-size trade-off?", back: "Large chunks dilute the embedding (relevant sentence buried, weak match) + waste context; small chunks match sharply but lose surrounding context. Overlap mitigates boundary loss (with duplication). Tune empirically." },
        { id: "lg3l3-i3", front: "MMR, threshold, and hybrid retrieval?", back: "MMR: relevance + diversity (avoid near-duplicates). Threshold: only above a score. Hybrid: dense vectors + sparse BM25 keyword, fused by Reciprocal Rank Fusion score(d)=Σ 1/(K+rankᵢ(d))." },
        { id: "lg3l3-i4", front: "Most RAG failures are ____ failures?", back: "Retrieval failures (answer chunk never retrieved / diluted), not generation. Measure retrieval (recall@k) separately; check the retrieved chunks before blaming the prompt or model." },
        { id: "lg3l3-i5", front: "Why ground the RAG prompt explicitly?", back: "So the model answers from the retrieved context, not parametric memory: 'answer ONLY from the context; say you don't know if absent.' Reduces (not eliminates) hallucination + override." },
      ],
    },
  ],
  masteryCheck: {
    id: "lg3-check",
    questions: [
      {
        id: "lg3q1",
        type: "numeric",
        prompt: "Compute the cosine similarity of the vectors a = [1, 0, 1] and b = [1, 1, 0]. (Give a decimal.)",
        answer: 0.5,
        tolerance: 0.01,
        explanation: "a·b = 1; ‖a‖ = ‖b‖ = √2; sim = 1/(√2·√2) = 1/2 = 0.5 — 60° apart, moderately similar.",
      },
      {
        id: "lg3q2",
        type: "mcq",
        prompt: "Retrieval-Augmented Generation (RAG) works by:",
        options: [
          "retrieving relevant documents at query time and injecting them into the model's prompt context",
          "fine-tuning the model's weights on your documents",
          "increasing the model's temperature so it's more creative",
          "storing the conversation history in a database",
        ],
        answer: 0,
        explanation: "RAG grounds answers in retrieved evidence placed in the prompt — keeping knowledge in an updatable store, separate from the model's reasoning.",
      },
      {
        id: "lg3q3",
        type: "short",
        prompt: "To preserve context across chunk boundaries, text splitters share characters between consecutive chunks. This parameter is the chunk ____.",
        accept: ["overlap", "Overlap"],
        explanation: "chunk_overlap shares characters between neighbouring chunks so an idea split at a boundary still appears whole in one chunk.",
      },
      {
        id: "lg3q4",
        type: "mcq",
        prompt: "A RAG system returns confidently wrong answers about facts you know are in your documents. The most common root cause is:",
        options: [
          "retrieval — the answer-bearing chunk was never in the retrieved top-k (bad chunking/embedding/query)",
          "the model's temperature is too low",
          "the vector store is too large",
          "the prompt is too short",
        ],
        answer: 0,
        explanation: "Most RAG failures are retrieval failures: if the right passage isn't retrieved, the model can't use it. Check recall@k before blaming generation.",
      },
      {
        id: "lg3q5",
        type: "open",
        points: 3,
        prompt: "Design a RAG system to answer employee questions over a company's internal policy documents (HR, IT, legal — thousands of pages, updated often). Specify the indexing pipeline, the retrieval strategy, the prompt, and how you'd measure quality.",
        rubric: [
          "Indexing pipeline: load the policy docs → split with a recursive splitter (sensible chunk_size/overlap, justified) → embed → store in a vector DB; notes re-indexing on updates (knowledge in an updatable store, not the weights).",
          "Retrieval strategy: top-k similarity, with a justified k; considers MMR for diversity and/or hybrid (vector + BM25) to catch exact terms like policy IDs/acronyms; possibly a score threshold.",
          "Prompt grounding: instruct the model to answer ONLY from the retrieved context and to say 'I don't know' / cite the source if absent — to curb hallucination and override.",
          "Measurement: evaluates retrieval (recall@k — is the gold passage retrieved?) and generation (faithfulness to context) SEPARATELY, and tunes chunking/k/strategy against retrieval metrics.",
        ],
        solution:
          "Indexing: load the HR/IT/legal docs, split with RecursiveCharacterTextSplitter (start ~500–1000 chars, ~100–200 overlap, tuned against retrieval — policy clauses are short and self-contained, so moderate chunks keep a clause whole without diluting), embed each chunk, and store in a vector DB (Chroma/pgvector); re-index changed documents on update so knowledge stays current without retraining. Retrieval: top-k similarity (k≈4–6), with **hybrid** search (dense vectors + BM25) since policy questions often hit exact terms (policy numbers, acronyms, 'PTO', form IDs) that embeddings blur, fused by Reciprocal Rank Fusion; add **MMR** to avoid retrieving k near-duplicate paragraphs, and possibly a score threshold so an out-of-scope question returns nothing rather than junk. Metadata-filter by department where possible. Prompt: 'Answer ONLY from the provided policy excerpts; if the answer isn't in them, say you don't know and suggest who to contact; cite the document/section.' Measurement: evaluate **retrieval** and **generation separately** — retrieval via recall@k on a labeled set (is the correct clause in the top-k?), generation via faithfulness (does the answer follow from the cited context, no fabrication?); tune chunk size/overlap, k, and hybrid weighting against the retrieval metric, since most failures are retrieval failures. This keeps knowledge updatable, grounds answers in evidence, and makes quality measurable per-stage.",
        explanation: "Recursive chunking + hybrid (vector+BM25) retrieval with MMR, a strictly-grounded prompt, and separate recall@k / faithfulness metrics — because RAG quality is bounded by retrieval.",
      },
      {
        id: "lg3q6",
        type: "open",
        points: 3,
        prompt: "Explain the chunking trade-off in RAG (why both too-large and too-small chunks hurt), and why cosine similarity (the angle) is the right metric for retrieval over raw vector magnitude.",
        rubric: [
          "Too-large chunks: the embedding averages multiple topics, diluting the relevant content so it matches a pointed query weakly (worse precision) and wastes context-window budget.",
          "Too-small chunks: embed sharply and rank well, but omit surrounding context needed to answer (referents, conditions) — worse completeness; overlap mitigates boundary loss at the cost of duplication.",
          "Concludes there's no universal optimum — precision vs completeness pull oppositely and depend on the data, so chunking is tuned against a retrieval metric.",
          "Cosine/angle: embedding models encode meaning in vector DIRECTION not magnitude (a longer passage isn't 'more' of a meaning), so the angle measures semantic closeness; on normalized vectors cosine ranking coincides with nearest-neighbour.",
        ],
        solution:
          "Chunking trades retrieval **precision** against context **completeness**. A **too-large** chunk is embedded as a single vector averaging several topics, so its direction is pulled toward the average and the one answer-bearing sentence contributes little — the chunk matches a pointed query weakly and may fall out of the top-k; and once retrieved it consumes more of the finite context window, so fewer chunks fit. A **too-small** chunk embeds sharply (one idea, one direction) and ranks well, but may omit the surrounding sentences the answer actually needs — a pronoun's referent, a preceding condition — so even when retrieved it's insufficient. **Overlap** re-includes boundary context in both neighbours, reducing severed-context misses at the cost of storing overlapped spans twice. Since precision (favoring small) and completeness (favoring large) pull oppositely and the right balance depends on document structure and query type, there is no universal optimum — you tune size/overlap empirically against a retrieval metric (recall@k). As for the metric: **cosine similarity (the angle)** is right because embedding models encode meaning in the *direction* of the vector, not its magnitude — a longer document isn't 'more' of a meaning, so length shouldn't affect similarity. Cosine = (a·b)/(‖a‖‖b‖) = cos θ depends only on the angle; on unit-normalized embeddings it also coincides with nearest-neighbour by Euclidean distance, so 'most similar' and 'nearest' agree. Using raw dot product/magnitude would let longer (larger-norm) vectors spuriously dominate.",
        explanation: "Large chunks dilute + waste context; small chunks lose context; tune against recall@k. Cosine uses direction (where meaning lives), not magnitude — so length doesn't distort similarity.",
      },
    ],
  },
};
