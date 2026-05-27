export default
    {
      id: "m6", number: "06", title: "Enterprise Implementation", accent: "#00B4D8",
      desc: "Patterns for deploying AI in real organizations — strategy, architecture, and ROI.",
      lessons: [
        { id: "m6l1", title: "Pattern Overview & Selection", duration: "10 min", tags: ["enterprise","patterns","strategy"],
          content: [
            { type: "text", heading: "The Five Patterns", body: "Almost every enterprise AI project falls into one of five patterns. Each has different risk profiles, implementation complexity, team requirements, and ROI timelines. Choosing the right pattern for your situation is the single most important architectural decision you'll make.\n\nThe patterns form a maturity ladder — most organizations should start at Pattern 1 or 2 and work up. Jumping straight to autonomous agents without organizational experience in simpler patterns is the #1 cause of failed AI initiatives." },
            { type: "decision", heading: "Pattern Comparison Matrix", rows: [
              ["1. Copilot / Assistant", "Human augmentation — AI assists, human decides. Low risk, fast ROI, 15-40% productivity gain"],
              ["2. Process Automation", "Workflow step replacement — AI handles structured, repetitive tasks. Medium risk, highest direct cost savings"],
              ["3. Knowledge Management", "RAG-powered search over organizational knowledge. Low-medium risk, hard to quantify but high satisfaction"],
              ["4. Decision Support", "AI analyzes data, presents recommendations, human makes final call. Medium risk, measured in better decisions"],
              ["5. Autonomous Agent", "AI executes complete workflows independently. Highest risk, highest potential, longest to realize"],
            ]},
            { type: "decision", heading: "Which Pattern to Start With?", rows: [
              ["First AI project ever", "Pattern 1 (Copilot) — lowest risk, fastest ROI, builds org confidence"],
              ["High-volume manual process exists", "Pattern 2 (Automation) — clearest cost savings, easiest to measure"],
              ["Knowledge scattered across org", "Pattern 3 (Knowledge Mgmt) — high employee satisfaction, visible quick win"],
              ["Data-rich domain, consequential decisions", "Pattern 4 (Decision Support) — augments experts without replacing judgment"],
              ["Mature AI org, well-defined workflows", "Pattern 5 (Agent) — only after patterns 1-3 are proven"],
              ["Need executive buy-in fast", "Pattern 1 or 2 — quickest visible wins, easiest to demonstrate ROI"],
              ["Accounting/finance department", "Pattern 2 (invoice processing, reconciliation) or Pattern 3 (policy lookup)"],
              ["Customer support team", "Pattern 3 (knowledge base) then Pattern 5 (autonomous resolution)"],
              ["Engineering/dev team", "Pattern 1 (code copilot) then Pattern 2 (CI/CD automation)"],
            ]},
            { type: "text", heading: "The Maturity Path", body: "**Stage 1: Adoption (Months 1-3)** — Deploy Pattern 1 (Copilot) tools. Get the organization comfortable using AI. Measure productivity gains. Build internal champions.\n\n**Stage 2: Integration (Months 3-9)** — Build Pattern 2 (Automation) or Pattern 3 (Knowledge Mgmt) solutions. Custom development begins. Data pipelines established.\n\n**Stage 3: Transformation (Months 9-18)** — Pattern 4 (Decision Support) and Pattern 5 (Agents). AI becomes embedded in core workflows. Competitive advantage forms.\n\nSkipping stages is possible but risky. Each stage builds organizational capability, data infrastructure, and trust that the next stage depends on." }
          ]
        },
        { id: "m6l2", title: "Pattern 1: Copilot / Assistant", duration: "14 min", tags: ["enterprise","patterns","copilot","implementation"],
          content: [
            { type: "text", heading: "The Pattern", body: "AI augments human work in real-time. The human stays in the driver's seat — AI handles routine subtasks, drafts content, answers questions, and suggests next steps. The human reviews, edits, and approves everything.\n\nThis is the lowest-risk, fastest-to-deploy pattern. It's where most organizations should start." },
            { type: "text", heading: "Real-World Examples", body: "**Code Copilot** — GitHub Copilot, Cursor, Claude Code. Developer writes intent, AI suggests implementation. 30-55% productivity improvement in studies.\n\n**Writing Copilot** — AI drafts emails, reports, documentation. Human edits for accuracy and tone. Reduces first-draft time by 50-70%.\n\n**Customer Service Copilot** — Agent sees customer message. AI suggests a response, pulls relevant knowledge base articles, auto-fills case details. Agent reviews and sends.\n\n**Accounting Copilot** — AI reads invoices, suggests GL codes, flags anomalies, drafts reconciliation notes. Accountant verifies and approves.\n\n**Sales Copilot** — AI researches prospects, drafts outreach, summarizes call notes, updates CRM. Rep focuses on relationship building." },
            { type: "text", heading: "Architecture", body: "A Copilot has four components:\n\n**1. Context Engine** — Gathers relevant information: current document, user history, organizational knowledge (RAG), real-time data. The quality of context determines the quality of suggestions.\n\n**2. LLM Backbone** — Processes context + user intent to generate suggestions. Typically GPT-4o or Claude Sonnet for the balance of quality/speed/cost.\n\n**3. UI Integration** — Suggestions appear inline where the user works: sidebar panel, inline autocomplete, chat interface, or overlay. Reducing friction is critical — if users have to context-switch to a separate app, adoption drops.\n\n**4. Feedback Loop** — Track which suggestions are accepted, edited, or rejected. This data improves the system over time and measures ROI." },
            { type: "code", heading: "Copilot Backend — C# / Semantic Kernel", lang: "csharp", code: `using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

public class AccountingCopilotService
{
    private readonly Kernel _kernel;
    private readonly IMemoryStore _memory; // Your RAG store
    
    public async Task<CopilotSuggestion> SuggestGLCodeAsync(
        InvoiceData invoice, UserContext user)
    {
        // 1. CONTEXT: Retrieve relevant precedents
        var similar = await _memory.SearchAsync(
            "gl-mappings",
            $"{invoice.VendorName} {invoice.Description}",
            limit: 5);
        
        var precedents = string.Join("\\n", 
            similar.Select(s => 
                $"Vendor: {s.Vendor}, Desc: {s.Description}, " +
                $"GL: {s.GLCode}, Account: {s.AccountName}"));
        
        // 2. GENERATE: Ask LLM for suggestion with context
        var prompt = $"""
        You are an accounting assistant for {user.CompanyName}.
        
        Given this invoice, suggest the correct GL code and account.
        
        <invoice>
        Vendor: {invoice.VendorName}
        Description: {invoice.Description}
        Amount: {invoice.Amount:C}
        Date: {invoice.Date:yyyy-MM-dd}
        </invoice>
        
        <similar_past_entries>
        {precedents}
        </similar_past_entries>
        
        <chart_of_accounts>
        {user.ChartOfAccountsSummary}
        </chart_of_accounts>
        
        Respond as JSON:
        {{
          "gl_code": "suggested code",
          "account_name": "account name",
          "confidence": "high|medium|low",
          "reasoning": "brief explanation",
          "alternatives": [
            {{"gl_code": "...", "account_name": "...", "reason": "..."}}
          ]
        }}
        """;
        
        var result = await _kernel.InvokePromptAsync(prompt);
        var suggestion = JsonSerializer.Deserialize<CopilotSuggestion>(
            result.ToString());
        
        // 3. FEEDBACK: Log for tracking acceptance rate
        await _telemetry.TrackSuggestionAsync(new {
            InvoiceId = invoice.Id,
            SuggestedGL = suggestion.GLCode,
            Confidence = suggestion.Confidence,
            UserId = user.Id,
            Timestamp = DateTime.UtcNow
        });
        
        return suggestion;
    }
    
    // Called when user accepts/edits/rejects suggestion
    public async Task RecordFeedbackAsync(
        string suggestionId, string action, string? editedGL = null)
    {
        await _telemetry.TrackFeedbackAsync(new {
            SuggestionId = suggestionId,
            Action = action, // "accepted", "edited", "rejected"
            EditedValue = editedGL,
            Timestamp = DateTime.UtcNow
        });
        
        // If edited, store as new precedent for future suggestions
        if (action == "edited" && editedGL != null)
        {
            await _memory.SaveAsync("gl-mappings", new {
                Vendor = invoice.VendorName,
                Description = invoice.Description,
                GLCode = editedGL
            });
        }
    }
}` },
            { type: "code", heading: "Copilot API Endpoint — Python / FastAPI", lang: "python", code: `from fastapi import FastAPI, Depends
from langchain_openai import AzureChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

app = FastAPI()
llm = AzureChatOpenAI(model="gpt-4o", temperature=0)

class CopilotRequest(BaseModel):
    document_text: str
    user_intent: str  # "summarize", "draft_reply", "extract_data", etc.
    context: dict = {}

class CopilotResponse(BaseModel):
    suggestion: str
    confidence: str
    alternatives: list[str] = []

@app.post("/copilot/suggest", response_model=CopilotResponse)
async def suggest(req: CopilotRequest, user=Depends(get_current_user)):
    # 1. Retrieve org context via RAG
    relevant_docs = await retriever.ainvoke(
        f"{req.user_intent}: {req.document_text[:200]}"
    )
    context = "\\n".join([d.page_content for d in relevant_docs])
    
    # 2. Generate suggestion
    prompt = ChatPromptTemplate.from_template("""
    You are a helpful assistant for {company}.
    The user is working on a document and wants to: {intent}
    
    <document>
    {document}
    </document>
    
    <organizational_context>
    {context}
    </organizational_context>
    
    Provide a suggestion. Be specific and actionable.
    If you're not confident, say so and explain what info you'd need.
    
    Respond as JSON: {{"suggestion": "...", "confidence": "high|medium|low"}}
    """)
    
    result = await (prompt | llm).ainvoke({
        "company": user.company,
        "intent": req.user_intent,
        "document": req.document_text,
        "context": context
    })
    
    # 3. Log for feedback tracking
    await log_suggestion(user.id, req.user_intent, result)
    
    return CopilotResponse(**json.loads(result.content))` },
            { type: "checklist", heading: "Copilot Implementation Checklist", items: [
              "Define 3-5 specific tasks the copilot will assist with — don't try to be general-purpose",
              "Build the context engine first — copilot quality is 80% context quality",
              "UI integration must be frictionless: inline suggestions, not a separate app",
              "Track acceptance rate as your primary metric (target: >60% accepted or edited)",
              "Implement feedback loop: accepted/edited/rejected → feeds back into RAG context",
              "Start with the team's most repetitive task for maximum visible impact",
              "Temperature=0 for consistency; users hate getting different suggestions for the same input",
              "Latency target: <2 seconds for inline suggestions, <5 seconds for longer drafts",
              "Provide 'explain' option so users understand WHY the suggestion was made",
              "Build a 'thumbs down + reason' flow — this is your eval dataset",
            ]},
            { type: "decision", heading: "Copilot vs. Full Automation", rows: [
              ["Error cost is high (financial, legal, medical)", "Copilot — keep human review"],
              ["Task requires judgment or creativity", "Copilot — AI drafts, human refines"],
              ["Regulatory requirement for human oversight", "Copilot — audit trail shows human approved"],
              ["Task is purely mechanical with clear rules", "Full automation (Pattern 2) instead"],
              ["Users don't trust AI yet", "Copilot — builds confidence gradually"],
              ["Volume exceeds human review capacity", "Start copilot, graduate to automation with spot-checks"],
            ]}
          ]
        },
        { id: "m6l3", title: "Pattern 2: Process Automation", duration: "15 min", tags: ["enterprise","patterns","automation","implementation"],
          content: [
            { type: "text", heading: "The Pattern", body: "AI replaces manual steps within an existing business workflow. The key distinction from copilot: automation runs without human review on every item. Humans set up the rules, monitor quality, and handle exceptions.\n\nThis is often the highest-ROI pattern because it directly reduces labor cost on measurable, high-volume processes." },
            { type: "text", heading: "Real-World Examples", body: "**Invoice Processing** — Extract vendor, amount, line items, GL codes from invoices. Auto-match to POs. Route exceptions to AP team. Reduces processing time from 15 min to 30 seconds per invoice.\n\n**Document Classification** — Incoming emails/documents automatically categorized and routed. Insurance claims sorted by type, customer inquiries tagged by department.\n\n**Data Extraction & Entry** — Pull structured data from unstructured documents: contracts → key terms, resumes → candidate profiles, lab reports → database records.\n\n**Reconciliation** — Auto-match transactions across systems, flag discrepancies, generate exception reports. Bank reconciliation, intercompany matching.\n\n**Compliance Screening** — Automatically check documents against regulatory requirements. Flag missing fields, expired certifications, non-compliant language." },
            { type: "text", heading: "Architecture", body: "A process automation pipeline has five stages:\n\n**1. Intake** — Documents/data arrive via email, API, file drop, or database trigger.\n\n**2. Classification** — AI determines document type and routes to the correct extraction pipeline. Often a simple LLM call or fine-tuned classifier.\n\n**3. Extraction** — AI extracts structured data from unstructured input. Could be an LLM with structured output, a document intelligence model, or OCR + NLP pipeline.\n\n**4. Validation** — Rules engine checks extracted data: required fields present? Values within expected ranges? Cross-references match? Confidence above threshold?\n\n**5. Action** — If validation passes: write to database, trigger downstream workflow, send notification. If validation fails: route to human exception queue." },
            { type: "code", heading: "Invoice Automation Pipeline — C#", lang: "csharp", code: `public class InvoiceAutomationPipeline
{
    private readonly Kernel _kernel;
    private readonly IInvoiceRepository _repo;
    private readonly IExceptionQueue _exceptions;
    
    public async Task<ProcessingResult> ProcessInvoiceAsync(
        Stream documentStream, string fileName)
    {
        // STEP 1: CLASSIFY — What type of document is this?
        var classification = await ClassifyDocumentAsync(documentStream);
        if (classification.Type != "invoice")
            return ProcessingResult.Rerouted(classification.Type);
        
        // STEP 2: EXTRACT — Pull structured data from the document
        var extractPrompt = $"""
        Extract invoice data from this document.
        Respond ONLY with valid JSON matching this schema:
        {{
          "vendor_name": "string",
          "vendor_address": "string or null",
          "invoice_number": "string",
          "invoice_date": "YYYY-MM-DD",
          "due_date": "YYYY-MM-DD or null",
          "currency": "USD|EUR|GBP|etc",
          "subtotal": number,
          "tax": number,
          "total": number,
          "line_items": [
            {{
              "description": "string",
              "quantity": number,
              "unit_price": number,
              "amount": number,
              "gl_code_suggestion": "string or null"
            }}
          ],
          "po_number": "string or null",
          "payment_terms": "string or null",
          "confidence": "high|medium|low"
        }}
        """;
        
        // Send document image to multimodal LLM
        var extractResult = await _kernel.InvokePromptAsync(
            extractPrompt, 
            new() { ["image"] = Convert.ToBase64String(documentBytes) });
        
        var invoice = JsonSerializer.Deserialize<ExtractedInvoice>(
            extractResult.ToString());
        
        // STEP 3: VALIDATE — Check extracted data
        var validation = ValidateInvoice(invoice);
        
        if (!validation.IsValid || invoice.Confidence == "low")
        {
            // Route to human exception queue
            await _exceptions.EnqueueAsync(new ExceptionItem
            {
                Document = fileName,
                ExtractedData = invoice,
                Errors = validation.Errors,
                Reason = invoice.Confidence == "low" 
                    ? "Low confidence extraction" 
                    : "Validation failed"
            });
            return ProcessingResult.Exception(validation.Errors);
        }
        
        // STEP 4: ENRICH — Match to existing data
        var vendor = await _repo.MatchVendorAsync(invoice.VendorName);
        var po = invoice.PONumber != null 
            ? await _repo.MatchPOAsync(invoice.PONumber) : null;
        
        // STEP 5: ACTION — Write to ERP and trigger approval
        var erpEntry = await _repo.CreateAPEntryAsync(new APEntry
        {
            VendorId = vendor?.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            Amount = invoice.Total,
            DueDate = invoice.DueDate,
            LineItems = invoice.LineItems,
            POReference = po?.Id,
            AutoProcessed = true
        });
        
        return ProcessingResult.Success(erpEntry.Id);
    }
    
    private ValidationResult ValidateInvoice(ExtractedInvoice inv)
    {
        var errors = new List<string>();
        
        if (string.IsNullOrEmpty(inv.VendorName))
            errors.Add("Missing vendor name");
        if (inv.Total <= 0)
            errors.Add("Invalid total amount");
        if (inv.InvoiceDate > DateTime.Today.AddDays(1))
            errors.Add("Invoice date is in the future");
        
        // Check line items sum to total
        var lineSum = inv.LineItems.Sum(l => l.Amount);
        if (Math.Abs(lineSum - inv.Subtotal) > 0.01m)
            errors.Add($"Line items ({lineSum:C}) don't match subtotal ({inv.Subtotal:C})");
        
        // Check for duplicate invoice
        var existing = _repo.FindDuplicateAsync(
            inv.VendorName, inv.InvoiceNumber);
        if (existing != null)
            errors.Add($"Possible duplicate of {existing.Id}");
        
        return new ValidationResult(errors);
    }
}` },
            { type: "code", heading: "Document Classification — Python", lang: "python", code: `from langchain_openai import AzureChatOpenAI
from pydantic import BaseModel, Field
from enum import Enum

class DocType(str, Enum):
    INVOICE = "invoice"
    PURCHASE_ORDER = "purchase_order"
    RECEIPT = "receipt"
    CONTRACT = "contract"
    CORRESPONDENCE = "correspondence"
    UNKNOWN = "unknown"

class Classification(BaseModel):
    doc_type: DocType
    confidence: float = Field(ge=0, le=1)
    reasoning: str

llm = AzureChatOpenAI(model="gpt-4o", temperature=0)

async def classify_document(text: str) -> Classification:
    """Classify a document into a known type.
    
    For high-volume production: fine-tune a small model (Haiku or 
    distilled classifier) on your labeled data. LLM classification 
    is great for prototyping but expensive at scale.
    """
    result = await llm.with_structured_output(Classification).ainvoke(
        f"""Classify this document into one of these types:
        - invoice: a bill requesting payment
        - purchase_order: an order placed with a vendor
        - receipt: proof of payment
        - contract: a legal agreement
        - correspondence: letters, emails, memos
        - unknown: doesn't fit any category
        
        Document text (first 2000 chars):
        {text[:2000]}"""
    )
    return result

# Production pattern: use LLM for classification during pilot,
# then train a small fine-tuned model once you have 500+ labeled examples.
# The fine-tuned model will be 100x cheaper and 10x faster.` },
            { type: "checklist", heading: "Process Automation Checklist", items: [
              "Map the current manual process end-to-end before building anything",
              "Measure current throughput, error rate, and cost per item as baseline",
              "Design the exception queue FIRST — this is where humans spend their time",
              "Set confidence thresholds: high-confidence → auto-process, low → exception queue",
              "Start with the highest-volume, most-structured document type",
              "Build validation rules that catch the errors humans catch today",
              "Monitor auto-processing accuracy daily for the first month",
              "Implement a random sampling audit: spot-check 5% of auto-processed items",
              "Track exception rate as primary metric (target: <15% exception rate)",
              "Build dashboards showing: items processed, exceptions, accuracy, cost savings",
              "Plan for edge cases: handwritten documents, multi-page invoices, non-English",
              "Have a kill switch: ability to pause automation and route everything to humans",
            ]},
            { type: "decision", heading: "Automation Readiness Checklist", rows: [
              ["High-volume (>100 items/day)", "Strong automation candidate — ROI is clear"],
              ["Structured format (invoices, forms)", "Ideal — extraction accuracy will be high"],
              ["Unstructured (emails, contracts)", "Start with classification + routing, not full extraction"],
              ["Error cost is high", "Use automation + human spot-check, not full autonomy"],
              ["Process changes frequently", "Use LLM-based approach (flexible) over rules engine (brittle)"],
              ["Regulatory audit requirements", "Add detailed logging and random-sample human review"],
            ]}
          ]
        },
        { id: "m6l4", title: "Pattern 3: Knowledge Management", duration: "12 min", tags: ["enterprise","patterns","knowledge","rag","implementation"],
          content: [
            { type: "text", heading: "The Pattern", body: "RAG-powered systems that make organizational knowledge searchable and accessible in natural language. Instead of employees digging through SharePoint, Confluence, shared drives, or asking colleagues, they ask an AI that has access to all organizational documents.\n\nThis pattern has an outsized impact on employee satisfaction and onboarding speed. It's often the first AI project that gets genuine enthusiasm from end users." },
            { type: "text", heading: "Real-World Examples", body: "**Internal Policy Bot** — Employees ask about HR policies, benefits, compliance procedures. AI answers from the current policy documents with citations.\n\n**Technical Documentation Assistant** — Engineers ask questions about internal systems, APIs, deployment procedures. AI searches across wikis, READMEs, Slack threads, and Jira tickets.\n\n**Customer-Facing Knowledge Base** — Customers search product documentation, troubleshooting guides, FAQs. AI provides contextual answers instead of keyword-based search results.\n\n**Onboarding Assistant** — New hires ask \"How do I set up my dev environment?\" or \"What's the PTO policy?\" AI provides immediate, accurate answers from company docs.\n\n**Regulatory Knowledge Base** — Compliance team queries regulations, past audit findings, internal controls documentation." },
            { type: "text", heading: "Architecture Considerations", body: "See Module 4 (RAG Systems) for the detailed technical implementation. Here, we focus on the enterprise-specific concerns:\n\n**Multi-Source Ingestion** — Real organizations have knowledge spread across 5-15 systems: SharePoint, Confluence, Google Drive, Slack, email, databases, PDFs on shared drives. Your ingestion pipeline needs connectors for each source.\n\n**Access Control** — This is the #1 enterprise requirement that tutorials skip. If a user can't see a document in SharePoint, they must not get answers from it through the AI. Implement row-level security on your vector store.\n\n**Freshness** — Stale knowledge is dangerous knowledge. Your ingestion pipeline must run on a schedule (daily minimum) and handle document updates and deletions.\n\n**Citations** — Users need to verify answers. Every response must link back to source documents with page/section references." },
            { type: "code", heading: "Access-Controlled RAG Query — C#", lang: "csharp", code: `public class SecureKnowledgeService
{
    private readonly SearchClient _searchClient;
    private readonly Kernel _kernel;
    
    public async Task<KnowledgeResponse> QueryAsync(
        string question, UserContext user)
    {
        // 1. Build security filter based on user's group memberships
        // User can only see documents they have access to
        var groupFilter = string.Join(" or ", 
            user.SecurityGroups.Select(g => 
                $"access_groups/any(g: g eq '{g}')"));
        
        // Also filter by department if applicable
        var deptFilter = $"department eq '{user.Department}' " +
                         $"or department eq 'all'";
        
        var filter = $"({groupFilter}) and ({deptFilter})";
        
        // 2. Hybrid search with security filter
        var queryVector = await GetEmbeddingAsync(question);
        var options = new SearchOptions
        {
            Filter = filter, // THIS IS THE KEY — enforces access control
            QueryType = SearchQueryType.Semantic,
            SemanticSearch = new()
            {
                SemanticConfigurationName = "default"
            },
            VectorSearch = new()
            {
                Queries = {
                    new VectorizedQuery(queryVector)
                    {
                        KNearestNeighborsCount = 10,
                        Fields = { "contentVector" }
                    }
                }
            },
            Size = 5,
            Select = { "content", "title", "source_url", 
                       "page_number", "last_updated" }
        };
        
        var results = await _searchClient.SearchAsync<SearchDocument>(
            question, options);
        
        // 3. Build context with citations
        var contextBuilder = new StringBuilder();
        var sources = new List<SourceReference>();
        int citationIndex = 1;
        
        await foreach (var result in results.GetResultsAsync())
        {
            contextBuilder.AppendLine(
                $"[Source {citationIndex}] {result.Document["title"]}");
            contextBuilder.AppendLine(result.Document["content"].ToString());
            contextBuilder.AppendLine();
            
            sources.Add(new SourceReference
            {
                Index = citationIndex++,
                Title = result.Document["title"].ToString(),
                Url = result.Document["source_url"].ToString(),
                Page = result.Document["page_number"]?.ToString(),
                LastUpdated = DateTime.Parse(
                    result.Document["last_updated"].ToString())
            });
        }
        
        // 4. Generate answer with citation instructions
        var prompt = $"""
        Answer the question based ONLY on the provided sources.
        Include citation numbers [Source N] for every claim.
        If the sources don't contain the answer, say:
        "I couldn't find this information in our documentation."
        
        <sources>
        {contextBuilder}
        </sources>
        
        Question: {question}
        """;
        
        var answer = await _kernel.InvokePromptAsync(prompt);
        
        return new KnowledgeResponse
        {
            Answer = answer.ToString(),
            Sources = sources,
            Query = question
        };
    }
}` },
            { type: "checklist", heading: "Knowledge Management Checklist", items: [
              "Audit all knowledge sources: where does information actually live in your org?",
              "Implement access control on vector store — MUST mirror source system permissions",
              "Set up automated ingestion pipeline with connectors for each source system",
              "Schedule daily re-ingestion minimum — stale answers erode trust fast",
              "Handle document deletions: when a source doc is removed, its chunks must be too",
              "Require citations in every response — link back to source with page/section",
              "Build a feedback mechanism: users flag wrong answers → human reviews → improves system",
              "Include 'last updated' dates on cited sources so users can assess freshness",
              "Test with real employee questions, not synthetic ones",
              "Measure: answer accuracy, user satisfaction, reduction in internal support tickets",
              "Plan for multilingual content if your org operates internationally",
            ]},
            { type: "decision", heading: "Knowledge Source Priority", rows: [
              ["HR policies, benefits docs", "High priority — most frequently asked, high impact"],
              ["Technical documentation (wikis)", "High priority for engineering orgs"],
              ["Slack/Teams messages", "Medium — valuable but noisy, needs careful filtering"],
              ["Email archives", "Low priority — privacy concerns, stale content"],
              ["Meeting recordings/transcripts", "Medium — great for institutional knowledge, expensive to process"],
              ["Legacy systems/PDFs on shared drives", "Medium-high — often the most valuable and least accessible"],
            ]}
          ]
        },
        { id: "m6l5", title: "Pattern 4: Decision Support", duration: "12 min", tags: ["enterprise","patterns","decision-support","analytics","implementation"],
          content: [
            { type: "text", heading: "The Pattern", body: "AI analyzes data and presents recommendations, but a human makes the final decision. The AI surfaces patterns, anomalies, and predictions that humans might miss — while humans apply judgment, context, and accountability.\n\nThis pattern is ideal for high-stakes domains where you need AI's analytical power but can't afford to remove human oversight." },
            { type: "text", heading: "Real-World Examples", body: "**Fraud Detection** — AI scores every transaction for fraud probability. High-risk transactions are flagged for human review. Low-risk pass through. Catches patterns across millions of transactions that humans can't.\n\n**Demand Forecasting** — AI predicts product demand by region and time period, factoring in seasonality, trends, and external signals. Inventory planners use forecasts to make purchasing decisions.\n\n**Credit Risk Assessment** — AI evaluates loan applications using financial data, payment history, and market conditions. Presents a risk score with explanatory factors. Loan officer makes final call.\n\n**Medical Diagnosis Support** — AI analyzes imaging/lab results and suggests possible diagnoses with confidence levels. Physician reviews and decides on treatment.\n\n**Pricing Optimization** — AI recommends pricing based on competitor data, demand elasticity, inventory levels, and margins. Pricing team reviews and approves changes." },
            { type: "text", heading: "Architecture", body: "Decision Support systems combine traditional ML with LLMs:\n\n**1. Data Pipeline** — Aggregate data from multiple sources into a feature store. Clean, transform, and update on schedule.\n\n**2. Prediction Model** — Could be traditional ML (XGBoost, random forest for tabular data) or LLM-based analysis. Often a hybrid: ML model makes the prediction, LLM explains it.\n\n**3. Explanation Layer** — Critical for trust. Users need to understand WHY the AI recommends something. SHAP values, feature importance, or LLM-generated natural language explanations.\n\n**4. Decision Interface** — Dashboard or alert system showing recommendations with confidence, supporting evidence, and alternative options. Must include 'override' capability.\n\n**5. Outcome Tracking** — Track which recommendations were followed vs. overridden, and the actual outcomes. This measures the AI's accuracy AND identifies when human judgment adds value." },
            { type: "code", heading: "Anomaly Detection + LLM Explanation — Python", lang: "python", code: `import pandas as pd
from sklearn.ensemble import IsolationForest
from langchain_openai import AzureChatOpenAI

llm = AzureChatOpenAI(model="gpt-4o", temperature=0)

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.05,  # expect ~5% anomalies
            random_state=42
        )
    
    def fit(self, historical_data: pd.DataFrame):
        """Train on historical transaction data."""
        features = self._extract_features(historical_data)
        self.model.fit(features)
    
    def analyze(self, transactions: pd.DataFrame) -> list[dict]:
        """Score transactions and explain anomalies."""
        features = self._extract_features(transactions)
        scores = self.model.decision_function(features)
        predictions = self.model.predict(features)
        
        anomalies = []
        for idx, (pred, score) in enumerate(zip(predictions, scores)):
            if pred == -1:  # anomaly
                row = transactions.iloc[idx]
                anomalies.append({
                    "transaction": row.to_dict(),
                    "anomaly_score": float(score),
                    "severity": "high" if score < -0.3 else "medium"
                })
        
        return anomalies
    
    async def explain_anomaly(self, anomaly: dict, 
                               historical_stats: dict) -> str:
        """Use LLM to generate human-readable explanation."""
        prompt = f"""
        You are a financial analyst. A transaction has been flagged 
        as anomalous. Explain WHY in 2-3 sentences, referencing 
        the specific values that are unusual.
        
        Flagged transaction:
        {json.dumps(anomaly['transaction'], indent=2)}
        
        Normal ranges for this vendor/category:
        {json.dumps(historical_stats, indent=2)}
        
        Anomaly score: {anomaly['anomaly_score']:.3f} 
        (more negative = more anomalous)
        
        Write a brief, specific explanation a finance team 
        member would understand.
        """
        result = await llm.ainvoke(prompt)
        return result.content

# Usage in a daily pipeline:
detector = AnomalyDetector()
detector.fit(historical_transactions)

today_anomalies = detector.analyze(todays_transactions)
for a in today_anomalies:
    stats = get_historical_stats(a["transaction"]["vendor"])
    a["explanation"] = await detector.explain_anomaly(a, stats)
    await send_to_review_dashboard(a)` },
            { type: "checklist", heading: "Decision Support Checklist", items: [
              "Define the decision clearly: what exactly is the human deciding?",
              "Identify what data the human currently uses to make this decision",
              "Determine if traditional ML or LLM is more appropriate for the prediction",
              "Build an explanation layer — unexplainable recommendations won't be trusted",
              "Include confidence levels with every recommendation",
              "Provide 'override' capability — humans must be able to disagree",
              "Track outcomes: was the AI right? Was the human override better?",
              "Watch for automation bias: humans rubber-stamping AI recommendations",
              "Ensure the AI doesn't encode historical biases from training data",
              "Regulatory review: some domains require specific explainability standards",
              "Build a feedback loop: human overrides should improve the model over time",
            ]},
            { type: "decision", heading: "ML vs LLM for Decision Support", rows: [
              ["Tabular data, clear features", "Traditional ML (XGBoost, random forest) — faster, cheaper, more explainable"],
              ["Unstructured text analysis", "LLM — reads documents, extracts signals"],
              ["Time series forecasting", "Traditional ML (Prophet, ARIMA, gradient boosting)"],
              ["Need natural language explanations", "Hybrid: ML predicts, LLM explains"],
              ["Few-shot / limited training data", "LLM — can reason with context, no training needed"],
              ["High-throughput scoring (1M+ items)", "Traditional ML — orders of magnitude cheaper"],
            ]}
          ]
        },
        { id: "m6l6", title: "Pattern 5: Autonomous Agents", duration: "13 min", tags: ["enterprise","patterns","agents","autonomous","implementation"],
          content: [
            { type: "text", heading: "The Pattern", body: "AI executes complete workflows independently, end-to-end, without human review of each action. Humans set goals, define boundaries, and monitor outcomes — but the agent handles execution.\n\nThis is the highest-risk, highest-reward pattern. It requires mature AI infrastructure, robust guardrails, and organizational trust built through successful deployment of simpler patterns." },
            { type: "text", heading: "Real-World Examples", body: "**Customer Service Resolution** — Agent reads customer inquiry, looks up account, diagnoses issue, takes corrective action (refund, reset, escalate), sends response. Resolves 40-60% of tickets without human involvement.\n\n**Automated Report Generation** — Agent queries databases, analyzes trends, generates narrative report with charts, distributes to stakeholders on schedule.\n\n**Lead Qualification & Outreach** — Agent researches prospects, scores leads against ICP, drafts personalized outreach, schedules follow-ups, updates CRM.\n\n**Infrastructure Monitoring & Remediation** — Agent monitors systems, detects anomalies, diagnoses root cause, executes runbook remediation, pages on-call only for novel issues.\n\n**Supply Chain Reordering** — Agent monitors inventory levels, forecasts demand, generates purchase orders, selects vendors based on price/lead-time optimization." },
            { type: "text", heading: "When Autonomous Agents Are Appropriate", body: "Autonomous agents are appropriate ONLY when ALL of these conditions are met:\n\n**1. Well-defined workflow** — The process has clear steps, clear success criteria, and limited branching. If it takes a human expert 30 minutes to explain the process, it's probably too complex for full autonomy.\n\n**2. Bounded action space** — The agent can only do a limited set of things. A customer service agent that can issue refunds up to $50 and send templated emails is bounded. One that can modify any database record is not.\n\n**3. Reversible or low-cost errors** — If the agent makes a mistake, can it be fixed easily? A wrong email can be followed up. A wrong financial transfer is much harder to reverse.\n\n**4. Observable outcomes** — You can measure whether the agent is succeeding. If you can't evaluate output quality automatically or through sampling, you can't run autonomous.\n\n**5. Gradual rollout path** — You can start with 5% of traffic, measure, then expand. Don't go from 0% to 100% autonomous." },
            { type: "code", heading: "Autonomous Agent with Guardrails — C#", lang: "csharp", code: `public class CustomerServiceAgent
{
    private readonly Kernel _kernel;
    private readonly ICustomerRepository _customers;
    private readonly ITicketRepository _tickets;
    
    // CRITICAL: Define the agent's boundaries
    private static readonly AgentPolicy Policy = new()
    {
        MaxRefundAmount = 50.00m,
        AllowedActions = new[] {
            "lookup_customer", "lookup_order", "issue_refund",
            "send_template_email", "update_ticket", "escalate"
        },
        ForbiddenActions = new[] {
            "delete_account", "modify_billing", "access_payment_info"
        },
        MaxActionsPerTicket = 8,
        MaxTimePerTicket = TimeSpan.FromSeconds(30),
        RequireEscalationFor = new[] {
            "legal_threat", "data_deletion_request", 
            "executive_complaint", "media_mention"
        }
    };
    
    public async Task<ResolutionResult> HandleTicketAsync(
        SupportTicket ticket)
    {
        // 1. PRE-SCREENING — Check if this ticket CAN be auto-handled
        var screening = await ScreenTicketAsync(ticket);
        if (screening.RequiresHuman)
        {
            return ResolutionResult.Escalated(screening.Reason);
        }
        
        // 2. RESOLVE — Agent works through the issue
        var chat = _kernel.GetRequiredService<IChatCompletionService>();
        var history = new ChatHistory();
        history.AddSystemMessage($"""
            You are a customer service agent for Acme Corp.
            
            RULES:
            - You can ONLY use the provided tools
            - Refunds must not exceed \${Policy.MaxRefundAmount}
            - If the customer mentions legal action, data deletion, 
              or asks for a manager, IMMEDIATELY escalate
            - Always be polite and professional
            - After resolving, update the ticket status
            
            Resolve this ticket efficiently.
        """);
        history.AddUserMessage($"""
            Ticket #{ticket.Id}
            From: {ticket.CustomerEmail}
            Subject: {ticket.Subject}
            Message: {ticket.Body}
        """);
        
        int actions = 0;
        var cts = new CancellationTokenSource(Policy.MaxTimePerTicket);
        
        try
        {
            while (actions < Policy.MaxActionsPerTicket)
            {
                actions++;
                var result = await chat.GetChatMessageContentAsync(
                    history,
                    new OpenAIPromptExecutionSettings {
                        FunctionChoiceBehavior = 
                            FunctionChoiceBehavior.Auto()
                    },
                    _kernel,
                    cts.Token);
                
                history.Add(result);
                
                // Check if agent is done
                if (result.Content?.Contains("[RESOLVED]") == true)
                    return ResolutionResult.Resolved(history);
                if (result.Content?.Contains("[ESCALATE]") == true)
                    return ResolutionResult.Escalated("Agent requested");
            }
            
            // Hit action limit — escalate
            return ResolutionResult.Escalated("Max actions reached");
        }
        catch (OperationCanceledException)
        {
            return ResolutionResult.Escalated("Timeout");
        }
    }
    
    private async Task<ScreeningResult> ScreenTicketAsync(
        SupportTicket ticket)
    {
        // Quick classification — should this be auto-handled?
        var result = await _kernel.InvokePromptAsync($"""
            Classify this support ticket. Return JSON:
            {{"auto_handleable": true/false, "reason": "...", 
             "sentiment": "positive|neutral|negative|angry",
             "topics": ["..."]}}
            
            Ticket: {ticket.Subject} — {ticket.Body}
        """);
        
        var classification = JsonSerializer.Deserialize<TicketClassification>(
            result.ToString());
        
        // Check against policy
        bool requiresHuman = 
            classification.Topics.Any(t => 
                Policy.RequireEscalationFor.Contains(t)) ||
            classification.Sentiment == "angry" ||
            !classification.AutoHandleable;
        
        return new ScreeningResult(requiresHuman, classification);
    }
}` },
            { type: "checklist", heading: "Autonomous Agent Deployment Checklist", items: [
              "Patterns 1-3 are already deployed and trusted in your org",
              "The workflow is documented with clear steps and success criteria",
              "Action space is explicitly bounded — agent CAN'T do things outside the list",
              "Guardrails: spend limits, action limits, time limits, escalation triggers",
              "Pre-screening filter routes complex/sensitive cases to humans",
              "Monitoring dashboard shows: resolution rate, escalation rate, customer satisfaction",
              "Random sampling: human reviews 10% of autonomous resolutions daily",
              "Kill switch: can pause all autonomous processing within minutes",
              "Gradual rollout: start with 5-10% of cases, measure for 2 weeks, expand",
              "Fallback: if autonomous quality drops below threshold, auto-revert to copilot mode",
              "Audit trail: every action the agent takes is logged with reasoning",
              "Weekly review: team examines escalated cases and failed resolutions to improve system",
            ]},
            { type: "decision", heading: "Autonomous vs. Human-in-the-Loop", rows: [
              ["Simple, repetitive, low-risk tasks", "Autonomous — password resets, order status, FAQ answers"],
              ["Financial actions above threshold", "Human approval — agent prepares, human confirms"],
              ["Customer is angry or escalating", "Human takeover — AI assists but doesn't respond directly"],
              ["Legal or compliance implications", "Always human — AI can draft, human must review and send"],
              ["High-value customer (enterprise tier)", "Human-in-the-loop — too much relationship risk for full autonomy"],
              ["Off-hours / no humans available", "Autonomous for safe actions, queue sensitive ones for morning"],
            ]}
          ]
        },
        { id: "m6l7", title: "Data Strategy & Governance", duration: "10 min", tags: ["enterprise","data","security","governance"],
          content: [
            { type: "text", heading: "Data Is the Moat", body: "Every company has access to the same foundation models. Your differentiator is proprietary data and how well you use it.\n\n**Data quality > quantity** — Small, clean, well-structured data beats massive messy data.\n**Data pipelines** — AI needs continuously updated data. Build robust ingestion." },
            { type: "checklist", heading: "Data Governance for AI", items: [
              "Classify data: what can go to external APIs vs. must stay on-premise",
              "PII must be masked or removed before sending to LLMs — no exceptions",
              "Understand provider data retention policies (most enterprise agreements = zero retention)",
              "RAG systems must respect existing document permissions (row-level security)",
              "GDPR right to deletion extends to vector stores and training data",
              "Involve legal early — HIPAA, SOC2, industry regulations all have AI implications",
              "Log what data is sent to which models for audit trail",
              "Establish data quality monitoring for AI inputs",
            ]}
          ]
        },
        { id: "m6l8", title: "Measuring ROI & Running Pilots", duration: "9 min", tags: ["enterprise","roi","pilot"],
          content: [
            { type: "text", heading: "The Pilot Framework", body: "**Week 1-2: Discovery** — Map current workflow, identify highest-impact opportunity\n**Week 3-4: Build** — MVP focused on the core happy path\n**Week 5-8: Pilot** — Deploy to 5-20 users. Collect metrics daily.\n**Week 9-10: Evaluate** — Analyze results, calculate ROI, document wins + failures\n**Week 11-12: Scale plan** — Roadmap for broader deployment" },
            { type: "checklist", heading: "ROI Metrics to Track", items: [
              "Time saved per task (measure before and after)",
              "Error rate reduction",
              "Throughput increase (documents processed, tickets resolved)",
              "Direct cost savings (labor, infrastructure)",
              "Employee satisfaction and adoption rate",
              "Customer satisfaction impact (if customer-facing)",
              "Time to complete pilot vs. estimate",
            ]},
            { type: "text", heading: "Change Management", body: "AI projects fail more from human resistance than technical problems.\n\n**Communicate early** — Show specific examples of how jobs get better, not just \"AI helps.\"\n**Involve end users in design** — They know what's broken. Their input improves the system AND buy-in.\n**Budget 20% of project time for training** — People need to learn to work with AI.\n**Quick wins build momentum** — Start with visible pain points.\n**Executive sponsorship** — Every successful AI initiative has a senior champion." }
          ]
        }
      ]
    }
;
