export default
    {
      id: "m8", number: "08", title: "Vision & Multimodal AI", accent: "#26C6DA",
      desc: "Beyond text — image understanding, document processing, and multimodal applications.",
      lessons: [
        { id: "m8l1", title: "Computer Vision & Document AI", duration: "10 min", tags: ["vision","documents","multimodal"],
          content: [
            { type: "text", heading: "Core CV Tasks", body: "**Image Classification** — \"What is this?\" Cat vs dog, defective vs normal.\n**Object Detection** — \"What's where?\" Bounding boxes + labels.\n**OCR** — Extract text from images. Modern OCR handles handwriting + messy layouts.\n**Document Understanding** — Send page image to LLM. It sees tables, charts, formatting that text extraction misses." },
            { type: "decision", heading: "Approach Selection", rows: [
              ["Flexible understanding, low volume", "Multimodal LLM (GPT-4o, Claude) — no training needed"],
              ["High throughput, simple classification", "Fine-tuned CNN/ViT — fast, cheap per image"],
              ["Object detection in images", "YOLO or DETR — real-time capable"],
              ["Document data extraction", "Azure Document Intelligence or multimodal LLM"],
              ["OCR (printed text)", "Azure AI Vision, Google Cloud Vision, or Tesseract"],
            ]},
            { type: "text", heading: "Enterprise Applications", body: "**Quality inspection** — Camera on production line + vision model catches defects\n**Document processing** — Invoices, receipts, forms → structured data (IDP)\n**Safety compliance** — PPE detection, restricted area monitoring\n**Inventory** — Shelf scanning, warehouse counting, asset tracking" }
          ]
        },
        { id: "m8l2", title: "Multimodal Applications", duration: "9 min", tags: ["multimodal","audio","video","patterns"],
          content: [
            { type: "text", heading: "Practical Multimodal Patterns", body: "**Document understanding** — Send PDF page as image to LLM instead of extracting text. The model sees layout, tables, and charts.\n\n**Visual QA for field workers** — Photograph equipment → \"What's wrong with this unit?\" → Model identifies issues.\n\n**Meeting intelligence** — Audio → Whisper transcription → LLM summarization → Action items.\n\n**Content moderation** — Analyze text + images together for contextual understanding.\n\n**Accessibility** — Automated image descriptions, video captions, document summaries." },
            { type: "code", heading: "Vision + Chat — Python", lang: "python", code: `import anthropic, base64

client = anthropic.Anthropic()

# Read image
with open("equipment_photo.jpg", "rb") as f:
    image_data = base64.standard_b64encode(f.read()).decode("utf-8")

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": image_data,
                },
            },
            {
                "type": "text",
                "text": "Analyze this equipment photo. Identify any " +
                        "visible issues, safety concerns, or maintenance needs."
            }
        ],
    }],
)
print(response.content[0].text)` }
          ]
        },
        { id: "m8l3", title: "Document Intelligence Deep Dive", duration: "15 min", tags: ["vision","documents","extraction","invoices","azure","production"],
          content: [
            { type: "text", heading: "The Document Processing Problem", body: "Extracting structured data from unstructured documents (invoices, contracts, forms, receipts) is one of the highest-ROI AI applications in enterprise. But it's harder than it looks.\n\nDocuments come in endless formats: scanned PDFs, photographed receipts, multi-page invoices with tables spanning pages, handwritten notes, mixed languages. A solution that works on clean digital PDFs will fail on real-world input.\n\nTwo approaches dominate: specialized Document AI models (Azure Document Intelligence, AWS Textract) and multimodal LLMs (GPT-4o, Claude). The right choice depends on your volume, accuracy needs, and budget." },
            { type: "decision", heading: "Approach Selection", rows: [
              ["High volume (>1000 docs/day), structured formats", "Azure Document Intelligence — fast, cheap, purpose-built for extraction"],
              ["Low volume, diverse/unusual formats", "Multimodal LLM (GPT-4o, Claude) — flexible, no training needed"],
              ["Need to extract tables accurately", "Azure Doc Intelligence (best table extraction) or LLM with page images"],
              ["Handwritten content", "Azure Doc Intelligence with handwriting model, or GPT-4o vision"],
              ["Need custom fields from domain-specific forms", "Azure Doc Intelligence custom model (train on 5+ labeled samples)"],
              ["Mixed: some structured, some messy", "Hybrid: Doc Intelligence for known formats, LLM fallback for unknown"],
              ["Budget-sensitive at scale", "Azure Doc Intelligence ($1.50/1000 pages) vs LLM ($15-50/1000 pages)"],
            ]},
            { type: "text", heading: "Architecture: Vision LLM Extraction", body: "The most flexible approach: render each document page as an image, send to a multimodal LLM with a structured extraction prompt, validate the output.\n\n**Why images instead of text extraction?**\nPDF text extraction (PyPDF, pdfminer) loses critical information: table structure, spatial relationships, headers/footers, checkboxes, logos, stamps. The LLM seeing the actual page image captures all of this.\n\n**The tradeoff:** More expensive per document ($0.01-0.05 vs $0.001-0.003), but dramatically more accurate on complex layouts and requires zero training data." },
            { type: "code", heading: "Invoice Extraction with Vision LLM — Python", lang: "python", code: `import anthropic
import base64
import json
from pdf2image import convert_from_path
from pydantic import BaseModel, Field

class LineItem(BaseModel):
    description: str
    quantity: float | None = None
    unit_price: float | None = None
    amount: float

class InvoiceExtraction(BaseModel):
    vendor_name: str
    vendor_address: str | None = None
    invoice_number: str
    invoice_date: str  # YYYY-MM-DD
    due_date: str | None = None
    po_number: str | None = None
    payment_terms: str | None = None
    line_items: list[LineItem]
    subtotal: float
    tax: float | None = None
    shipping: float | None = None
    total: float
    currency: str = "USD"
    confidence: str  # high, medium, low
    extraction_notes: list[str] = []  # any issues or ambiguities

client = anthropic.Anthropic()

async def extract_invoice(pdf_path: str) -> InvoiceExtraction:
    """Extract structured invoice data from a PDF using vision LLM."""
    
    # Step 1: Convert PDF pages to images
    images = convert_from_path(pdf_path, dpi=200)  # 200 DPI is sufficient
    
    # Step 2: Build message with page images
    content = []
    for i, img in enumerate(images):
        # Convert PIL image to base64
        import io
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_b64 = base64.standard_b64encode(buffer.getvalue()).decode()
        
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": img_b64,
            }
        })
        content.append({
            "type": "text",
            "text": f"[Page {i+1} of {len(images)}]"
        })
    
    # Step 3: Add extraction prompt
    content.append({
        "type": "text",
        "text": """Extract all invoice data from the document above.

Rules:
- Extract ONLY information visible in the document
- Use null for fields you cannot find — NEVER guess
- Dates in YYYY-MM-DD format
- All monetary amounts as numbers (no currency symbols)
- If a value is ambiguous or hard to read, note it in extraction_notes
- Set confidence to "low" if any key fields are unclear
- For line items, extract every row from the table

Respond with ONLY valid JSON matching InvoiceExtraction schema."""
    })
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        temperature=0,
        messages=[{"role": "user", "content": content}]
    )
    
    # Step 4: Parse and validate
    raw = response.content[0].text
    # Strip markdown fences if present
    if raw.startswith("\x60\x60\x60"):
        raw = raw.split("\n", 1)[1].rsplit("\x60\x60\x60", 1)[0]
    
    extraction = InvoiceExtraction.model_validate_json(raw)
    
    # Step 5: Cross-validation
    notes = list(extraction.extraction_notes)
    
    # Check line items sum to subtotal
    line_sum = sum(item.amount for item in extraction.line_items)
    if abs(line_sum - extraction.subtotal) > 0.02:
        notes.append(
            f"Line items sum ({line_sum:.2f}) differs from "
            f"subtotal ({extraction.subtotal:.2f})"
        )
    
    # Check subtotal + tax = total
    expected_total = extraction.subtotal + (extraction.tax or 0) + (extraction.shipping or 0)
    if abs(expected_total - extraction.total) > 0.02:
        notes.append(
            f"Computed total ({expected_total:.2f}) differs from "
            f"stated total ({extraction.total:.2f})"
        )
    
    extraction.extraction_notes = notes
    if notes:
        extraction.confidence = "medium"
    
    return extraction` },
            { type: "code", heading: "Azure Document Intelligence — C#", lang: "csharp", code: `using Azure.AI.DocumentIntelligence;

public class AzureDocIntelligenceExtractor
{
    private readonly DocumentIntelligenceClient _client;
    
    public AzureDocIntelligenceExtractor(string endpoint, string key)
    {
        _client = new DocumentIntelligenceClient(
            new Uri(endpoint), new AzureKeyCredential(key));
    }
    
    /// <summary>
    /// Extract invoice data using Azure's prebuilt invoice model.
    /// Handles most standard invoice formats out of the box.
    /// </summary>
    public async Task<InvoiceResult> ExtractInvoiceAsync(
        Stream documentStream)
    {
        // Use the prebuilt invoice model
        var operation = await _client.AnalyzeDocumentAsync(
            WaitUntil.Completed,
            "prebuilt-invoice",
            documentStream);
        
        var result = operation.Value;
        
        if (result.Documents.Count == 0)
            return InvoiceResult.Failed("No invoice detected");
        
        var invoice = result.Documents[0];
        var fields = invoice.Fields;
        
        return new InvoiceResult
        {
            VendorName = GetFieldValue(fields, "VendorName"),
            VendorAddress = GetFieldValue(fields, "VendorAddress"),
            InvoiceNumber = GetFieldValue(fields, "InvoiceId"),
            InvoiceDate = GetDateField(fields, "InvoiceDate"),
            DueDate = GetDateField(fields, "DueDate"),
            PONumber = GetFieldValue(fields, "PurchaseOrder"),
            SubTotal = GetCurrencyField(fields, "SubTotal"),
            TotalTax = GetCurrencyField(fields, "TotalTax"),
            InvoiceTotal = GetCurrencyField(fields, "InvoiceTotal"),
            LineItems = ExtractLineItems(fields),
            Confidence = invoice.Confidence,
            ModelId = "prebuilt-invoice"
        };
    }
    
    /// <summary>
    /// Extract data using a custom trained model.
    /// Train on 5+ labeled samples via Document Intelligence Studio.
    /// </summary>
    public async Task<Dictionary<string, ExtractedField>> 
        ExtractWithCustomModelAsync(
            Stream document, string customModelId)
    {
        var operation = await _client.AnalyzeDocumentAsync(
            WaitUntil.Completed,
            customModelId,
            document);
        
        var result = operation.Value;
        var fields = new Dictionary<string, ExtractedField>();
        
        foreach (var doc in result.Documents)
        {
            foreach (var (name, field) in doc.Fields)
            {
                fields[name] = new ExtractedField
                {
                    Value = field.Content,
                    Confidence = field.Confidence,
                    BoundingRegion = field.BoundingRegions
                        ?.FirstOrDefault()?.ToString()
                };
            }
        }
        
        return fields;
    }
    
    private List<LineItemResult> ExtractLineItems(
        IReadOnlyDictionary<string, DocumentField> fields)
    {
        var items = new List<LineItemResult>();
        
        if (!fields.TryGetValue("Items", out var itemsField))
            return items;
        
        foreach (var item in itemsField.ValueList)
        {
            var itemFields = item.ValueDictionary;
            items.Add(new LineItemResult
            {
                Description = GetFieldValue(itemFields, "Description"),
                Quantity = GetNumberField(itemFields, "Quantity"),
                UnitPrice = GetCurrencyField(itemFields, "UnitPrice"),
                Amount = GetCurrencyField(itemFields, "Amount"),
                ProductCode = GetFieldValue(itemFields, "ProductCode"),
            });
        }
        
        return items;
    }
}` },
            { type: "text", heading: "Hybrid Architecture: Best of Both", body: "The production pattern for document processing at scale combines both approaches:\n\n**1. Classification** — Cheap LLM call or rules engine determines document type.\n\n**2. Known formats → Azure Document Intelligence** — Invoices, receipts, W-2s, business cards use prebuilt models. Fast ($0.001/page), accurate on standard formats.\n\n**3. Unknown/complex formats → Vision LLM** — Unusual layouts, multi-language documents, or anything that needs flexible understanding. More expensive ($0.01-0.05/page) but handles anything.\n\n**4. Validation** — Cross-check extracted values (do line items sum correctly?). Low-confidence extractions route to human review.\n\n**5. Human-in-the-loop** — Exception queue for documents that fail validation. Humans correct errors, corrections feed back into the system." },
            { type: "code", heading: "Hybrid Pipeline — C#", lang: "csharp", code: `public class HybridDocumentPipeline
{
    private readonly AzureDocIntelligenceExtractor _docIntel;
    private readonly VisionLLMExtractor _visionLLM;
    private readonly IExceptionQueue _exceptions;
    
    public async Task<ExtractionResult> ProcessAsync(
        Stream document, string fileName)
    {
        // Step 1: Try Azure Document Intelligence first (fast + cheap)
        var docIntelResult = await _docIntel.ExtractInvoiceAsync(document);
        
        if (docIntelResult.Confidence > 0.85m)
        {
            // High confidence — validate and accept
            var validation = Validate(docIntelResult);
            if (validation.IsValid)
            {
                return ExtractionResult.Success(
                    docIntelResult, source: "azure-doc-intel");
            }
        }
        
        // Step 2: Fall back to Vision LLM (flexible + expensive)
        document.Position = 0; // reset stream
        var visionResult = await _visionLLM.ExtractAsync(document);
        
        var visionValidation = Validate(visionResult);
        if (visionValidation.IsValid && 
            visionResult.Confidence != "low")
        {
            return ExtractionResult.Success(
                visionResult, source: "vision-llm");
        }
        
        // Step 3: Both failed — route to human review
        await _exceptions.EnqueueAsync(new ExceptionItem
        {
            FileName = fileName,
            DocIntelResult = docIntelResult,
            VisionLLMResult = visionResult,
            ValidationErrors = visionValidation.Errors,
            Reason = "Both extraction methods produced low-confidence results"
        });
        
        return ExtractionResult.NeedsHumanReview(
            bestGuess: visionResult);
    }
}` },
            { type: "decision", heading: "Table Extraction Approaches", rows: [
              ["Simple tables (few columns, no spanning)", "Azure Doc Intelligence prebuilt — handles well out of the box"],
              ["Complex tables (merged cells, spanning rows)", "Vision LLM with explicit table extraction prompt — more flexible"],
              ["Tables spanning multiple pages", "Vision LLM with multi-page context — Doc Intelligence struggles here"],
              ["Consistent table format across documents", "Azure Doc Intelligence custom model — train once, fast extraction"],
              ["Need to preserve table structure in output", "Return as structured JSON array, not markdown — downstream code needs structure"],
            ]},
            { type: "checklist", heading: "Document Processing Production Checklist", items: [
              "Handle multiple input formats: PDF (digital + scanned), images (JPEG/PNG/TIFF), email attachments",
              "Render PDFs at 200 DPI for vision LLM — higher wastes tokens, lower loses detail",
              "Implement page limits: alert on documents >20 pages (cost risk)",
              "Cross-validate extracted values: line items sum to subtotal, subtotal + tax = total",
              "Low-confidence extractions route to human review queue — never silently accept bad data",
              "Human corrections feed back as training data for custom models or RAG examples",
              "Track extraction accuracy by document source/vendor — some vendors formats are harder",
              "Build vendor-specific templates where possible — same vendor = same format",
              "Handle multi-language documents: specify language hints when known",
              "Monitor processing cost per document type — optimize the expensive ones first",
              "Implement duplicate detection: same invoice number + vendor = likely duplicate",
              "Store raw document alongside extraction for audit trail and reprocessing",
            ]}
          ]
        }
      ]
    }
;
