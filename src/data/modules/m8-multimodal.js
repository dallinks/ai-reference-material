export default
    {
      id: "m8", number: "08", title: "Vision & Multimodal AI", accent: "#26C6DA",
      desc: "Beyond text — image understanding, document processing, and multimodal applications.",
      lessons: [
        { id: "m8l1", title: "Computer Vision & Document AI", duration: "18 min", tags: ["vision","documents","multimodal","vit","ocr","mechanics"],
          content: [
            { type: "text", heading: "Core CV Tasks", body: "**Image Classification** — \"What is this?\" Cat vs dog, defective vs normal.\n**Object Detection** — \"What's where?\" Bounding boxes + labels.\n**OCR** — Extract text from images. Modern OCR handles handwriting + messy layouts.\n**Document Understanding** — Send page image to LLM. It sees tables, charts, formatting that text extraction misses." },

            { type: "text", heading: "How a Model Turns an Image Into Tokens", body: "An LLM only processes tokens (m2l1). So how does a multimodal model \"see\" a picture? It converts the image into tokens too — and the mechanism mirrors text tokenization.\n\nThe dominant approach is the **Vision Transformer (ViT)**:\n\n1. **Patchify** — Cut the image into a grid of fixed-size patches (e.g., 16×16 pixels). A patch is the image equivalent of a text token.\n2. **Embed** — Flatten each patch and project it into a vector — a *patch embedding*, the visual analogue of a word embedding.\n3. **Add position** — Tag each patch with its grid position (positional encoding, m2l2) so the model knows *where* it sat.\n4. **Attend** — Run the patch sequence through transformer self-attention (m2l2), exactly like text. Patches attend to each other, building up understanding from edges → shapes → objects (the hierarchy from m1l2).\n\nThe key insight: **once an image is a sequence of patch tokens, it's just another sequence** — the same transformer machinery handles it. This is why one architecture now spans text, images, and audio: everything becomes tokens." },

            { type: "text", heading: "How Multimodal LLMs Fuse Vision and Language", body: "A multimodal LLM (GPT-4o, Claude, Gemini) bolts the vision mechanism above onto a language model. The architecture has three parts:\n\n**Vision encoder** — A ViT-style encoder turns the image into patch-embedding vectors (above).\n**Projection layer** — A learned adapter maps those visual vectors into the *same embedding space* the language model uses for text tokens. This is the bridge: it makes an image patch \"look like\" a token the LLM already understands.\n**Language model** — The usual decoder (m2l2) now attends over a **single mixed sequence** of text tokens *and* projected image tokens, generating its answer from both.\n\nSo \"send the page image to the LLM\" really means: encode → project → splice the image tokens into the prompt alongside your text → generate. Two practical consequences:\n\n**Images cost tokens.** A high-res image can consume hundreds to thousands of tokens (m2l4) — visual input isn't free, and bigger images cost more.\n**Resolution is a knob.** More patches = more detail but more tokens and latency. Downscaling a document too far makes small text unreadable to the model; too high wastes money. There's a sweet spot per task." },

            { type: "decision", heading: "Approach Selection", rows: [
              ["Flexible understanding, low volume", "Multimodal LLM (GPT-4o, Claude) — no training needed"],
              ["High throughput, simple classification", "Fine-tuned CNN/ViT — fast, cheap per image"],
              ["Object detection in images", "YOLO or DETR — real-time capable"],
              ["Document data extraction", "Azure Document Intelligence or multimodal LLM"],
              ["OCR (printed text)", "Azure AI Vision, Google Cloud Vision, or Tesseract"],
            ]},

            { type: "text", heading: "OCR vs Vision LLM: Two Ways to Read a Document", body: "There are two fundamentally different ways to get information out of a document image, and choosing wrong wastes money or accuracy.\n\n**Traditional OCR / Document Intelligence** (Azure AI Vision, Document Intelligence, Tesseract) — Purpose-built models that extract text *plus its position* (bounding boxes), detect tables, and — with prebuilt or custom models — pull named fields. **Cheap (~$0.001–0.01/page), fast, deterministic, and it gives you coordinates** for highlighting and audit. Weaker on reasoning and unusual layouts.\n\n**Vision LLM** (GPT-4o, Claude) — Send the page image to a multimodal model and *ask*. **Flexible and reasoning-capable** — it handles novel layouts, answers questions, infers intent, follows instructions — but it's more expensive per page, slower, non-deterministic, and gives no bounding boxes (so it's harder to verify *where* an answer came from). It can also hallucinate a plausible value.\n\nThe production answer is usually **both**: OCR/Document Intelligence for structured, high-volume, known formats; vision LLM for messy, low-volume, or reasoning-heavy cases — often OCR first, then an LLM to interpret the extracted text+layout. The full hybrid pipeline is m8l3." },

            { type: "text", heading: "Enterprise Applications", body: "**Quality inspection** — Camera on production line + vision model catches defects\n**Document processing** — Invoices, receipts, forms → structured data (IDP)\n**Safety compliance** — PPE detection, restricted area monitoring\n**Inventory** — Shelf scanning, warehouse counting, asset tracking" },

            { type: "code", heading: "Vision LLM — Reading an Image (Python)", lang: "python", code: `import base64
from anthropic import Anthropic

client = Anthropic()

# Images are passed as base64-encoded blocks INTERLEAVED with text in the
# prompt -- they become image tokens spliced alongside your text tokens.
with open("invoice.png", "rb") as f:
    img_b64 = base64.standard_b64encode(f.read()).decode()

resp = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": img_b64}},
            {"type": "text", "text":
                "Extract vendor, invoice number, and total as JSON. "
                "If a field is missing, use null -- do NOT guess."},
        ],
    }],
)
print(resp.content[0].text)

# Cost/quality knobs:
#   * Render PDFs at ~150 DPI -- enough for small text, not wastefully large
#   * Resolution drives token count (m2l4): downscale, but not below legibility
#   * Ground against hallucination: 'use null, do not guess' (m4l1, m6l3)` },

            { type: "text", heading: "Failure Modes & Antidotes", body: "**Hallucinated fields** — A vision LLM invents a plausible total or date not actually on the page. *Antidote:* instruct \"null if not present, don't guess\" (m6l3), cross-validate (do line items sum?), and verify low-confidence extractions against OCR.\n\n**Resolution loss** — Small text (fine print, dense tables) downscaled into illegibility. *Antidote:* render at sufficient DPI (~150–200); tile very large pages; verify the model can actually read the smallest text you care about.\n\n**No provenance** — A vision LLM gives an answer but no bounding box, so you can't show *where* it came from. *Antidote:* use OCR/Document Intelligence when you need coordinates for audit or highlighting (m8l3).\n\n**Multi-page confusion** — A value on page 1 misattributed to page 7's context. *Antidote:* process pages with explicit page markers; classify then route per page (m6l3).\n\n**Token cost blowout** — Sending high-res, multi-page documents through a frontier model at volume gets expensive fast. *Antidote:* OCR/Document Intelligence for high-volume known formats; reserve the vision LLM for the cases that need reasoning (decision table above; cost math in m2l4).\n\n**Orientation / quality** — Skewed, rotated, or low-quality scans tank accuracy. *Antidote:* deskew/clean in preprocessing before the model sees them." },

            { type: "checklist", heading: "Vision & Document AI Takeaways", items: [
              "Models 'see' by patchifying images into tokens (ViT) — once it's a token sequence, it's just another transformer input (m2l2)",
              "Multimodal LLMs encode → project image patches into the text embedding space → attend over a mixed token stream",
              "Images cost tokens; resolution is a knob — downscale for cost but never below legibility (m2l4)",
              "OCR/Document Intelligence: cheap, fast, deterministic, gives bounding boxes — best for high-volume known formats",
              "Vision LLM: flexible, reasoning-capable, no coordinates, can hallucinate — best for messy or reasoning-heavy cases",
              "Production usually combines both: structured extraction for the bulk, LLM for the long tail (full pipeline in m8l3)",
              "Always ground against hallucination ('null, don't guess') and cross-validate extracted numbers",
              "Pick the tool by volume, format consistency, need for provenance, and reasoning required — not by novelty",
            ]}
          ]
        },
        { id: "m8l2", title: "Multimodal Applications", duration: "18 min", tags: ["multimodal","audio","video","patterns","speech","realtime"],
          content: [
            { type: "text", heading: "The Modality Matrix", body: "\"Multimodal\" just means a model handles more than text — but the useful framing is a grid of **input modalities × output modalities**. Text, image, audio, and video can each be an input, an output, or both:\n\n**Text→text** — the classic LLM.\n**Image→text** — vision understanding / VQA (m8l1): \"what's in this photo?\"\n**Text→image** — generation (diffusion models, m1l2): \"draw a logo.\"\n**Audio→text** — speech-to-text (transcription).\n**Text→audio** — text-to-speech (voice output).\n**Audio→audio** — native speech-to-speech (voice assistants).\n**Video→text** — video understanding (summarize this clip).\n\nMost enterprise value today is in the *understanding* directions (X→text), because text is what your business logic, search, and databases consume. The mechanism underneath is always the same trick from m8l1: **encode each modality into tokens, project into a shared space, let the transformer attend across all of them.** Identify which cell of the matrix your use case needs — that decides the model and the pipeline." },

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
print(response.content[0].text)` },

            { type: "text", heading: "Audio: The Speech Pipeline", body: "Audio is the highest-value non-text modality for most enterprises (calls, meetings, voice interfaces), and there are two ways to build with it.\n\n**The pipeline approach (compose three models):**\n\n1. **Speech-to-text (STT)** — A model like Whisper transcribes audio to text. Watch for diarization (who spoke), timestamps, and domain vocabulary (names, jargon) which generic STT fumbles.\n2. **LLM** — The text flows into your normal LLM logic: summarize, extract action items, answer, classify sentiment.\n3. **Text-to-speech (TTS)** — Optionally synthesize a spoken reply.\n\nThis is flexible (swap any stage, m1l3) and debuggable (you can read the transcript), and it's how most \"meeting intelligence\" and call-analytics systems work.\n\n**The native speech-to-speech approach** — Newer realtime models (GPT-4o realtime, Gemini Live) take audio in and emit audio out *directly*, without a text round-trip. Lower latency and they preserve tone, emotion, and interruptions — but they're harder to inspect, log, and guardrail. Use the pipeline when you need the transcript and control; use native speech-to-speech when conversational latency and naturalness are the product (next block)." },

            { type: "code", heading: "Meeting Intelligence Pipeline — Python", lang: "python", code: `from openai import OpenAI
client = OpenAI()

# 1. SPEECH-TO-TEXT: transcribe the recording (Whisper)
with open("meeting.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(
        model="whisper-1", file=f,
        response_format="verbose_json",   # timestamps + segments
    )

# 2. LLM: the transcript is now ordinary text -> normal LLM logic applies
summary = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content":
            "Summarize this meeting. Output JSON: "
            "{summary, decisions[], action_items[{owner, task, due}]}."},
        {"role": "user", "content": transcript.text},
    ],
    response_format={"type": "json_object"},   # structured output (m3l2)
)
print(summary.choices[0].message.content)

# The pattern: convert the exotic modality (audio) into TEXT as early as
# possible, then reuse everything you already know about LLMs, RAG, and evals.` },

            { type: "text", heading: "Real-Time & Voice Agents", body: "Voice agents (phone support, live assistants) are their own design problem because **latency is the product** — humans notice a conversational gap above ~300–500ms.\n\nThe pipeline STT→LLM→TTS adds up fast: transcription + model time-to-first-token (m2l4) + synthesis can blow the latency budget. Techniques that keep it conversational:\n\n**Stream every stage** — Start transcribing before the speaker finishes, start the LLM on partial transcript, start TTS on the first sentence (m7l1 streaming).\n**Endpointing** — Detect when the user *stopped* talking quickly, so you don't wait awkwardly.\n**Handle barge-in** — Let the user interrupt; stop TTS instantly when they speak.\n**Use a fast model** — A smaller/faster model often beats a smarter slow one for live voice (m2l5 latency).\n**Or go native** — Speech-to-speech realtime models collapse the three stages into one, eliminating round-trip latency — the reason they exist.\n\nThe rest of the agent stack still applies: tools (m5l2), guardrails (m5l4), and grounding (Module 4) — voice just adds a hard real-time constraint on top." },

            { type: "text", heading: "Video Understanding", body: "Video is the heaviest modality — it's images plus audio plus *time* — and the dominant technique is to **decompose it**, not feed raw video to a model:\n\n**Sample frames** — Extract keyframes (on scene changes, or every N seconds) and treat them as images (m8l1). A 30-minute video becomes a few hundred frames, not millions — naive frame-by-frame is ruinously expensive in tokens (m2l4).\n**Transcribe the audio track** — Run STT on the soundtrack (above) for the spoken content.\n**Fuse** — Give the LLM the sampled frames *plus* the timestamped transcript so it reasons over what was shown *and* said.\n\nNative long-video models (Gemini's long context) are emerging, but frame-sampling + transcription remains the cost-effective workhorse. Uses: surveillance event detection, training-video Q&A, content moderation, sports/media analysis. The key tradeoff is **sampling rate** — too sparse and you miss the moment that mattered; too dense and cost explodes." },

            { type: "text", heading: "Generation: Creating Images & Audio", body: "The matrix's *output* side is generative media — different models and a different risk profile from understanding:\n\n**Image generation** — Diffusion models (DALL·E, Stable Diffusion, Imagen) turn text into images (m1l2). Enterprise uses: marketing assets, product mockups, synthetic training data, design exploration.\n**Audio / voice generation** — TTS and voice cloning produce spoken output and branded voices.\n**Video generation** — Emerging (Sora-class), still costly and hard to control for production.\n\nWhat changes with *generating* media: the governance burden rises. **Provenance** (was this AI-made?), **C2PA content credentials / watermarking**, **rights and likeness** (don't clone a voice or face without consent), **brand safety** (a generated image can embarrass you), and **deepfake risk** all become first-class concerns (m6l7, m7l3). Generation is powerful for content velocity, but treat its outputs as needing review and provenance, not blind publication." },

            { type: "decision", heading: "Modality Approach Selection", rows: [
              ["Understand an image / document", "Multimodal LLM or OCR (m8l1); document pipeline (m8l3)"],
              ["Transcribe calls / meetings", "STT (Whisper) → LLM — keep the transcript for audit"],
              ["Live voice assistant, latency-critical", "Native speech-to-speech realtime model; stream every stage"],
              ["Understand video content", "Sample frames + transcribe audio + fuse in an LLM"],
              ["Create images (marketing, mockups)", "Diffusion model — add provenance/watermarking"],
              ["Branded voice output", "TTS / voice cloning — with consent and rights cleared"],
              ["Any exotic modality feeding business logic", "Convert to text ASAP, then reuse your LLM/RAG/eval stack"],
            ]},

            { type: "text", heading: "Failure Modes & Antidotes", body: "**Transcription errors compound** — A wrong STT word becomes a wrong LLM summary. *Antidote:* domain vocabulary/phrase hints, confidence thresholds, surface the transcript for correction.\n\n**Latency budget blown (voice)** — The STT→LLM→TTS chain feels laggy. *Antidote:* stream every stage, endpointing, a faster model, or native speech-to-speech.\n\n**Video token blowout** — Sampling every frame at full res bankrupts the budget. *Antidote:* keyframe sampling + transcript fusion, not raw frames (m2l4).\n\n**Modality mismatch** — Forcing one model to do everything (e.g., a vision LLM for high-volume transcription). *Antidote:* the right specialized model per modality (decision table).\n\n**Lost context across modalities** — Frames without the transcript, or audio without speaker labels, so the model misses what tied them together. *Antidote:* fuse modalities with timestamps and metadata.\n\n**Generation governance gaps** — Publishing AI media without provenance, rights, or review. *Antidote:* watermarking/C2PA, consent for likeness, human review (m6l7, m7l3).\n\nThe through-line: **decompose multimodal problems into per-modality models, convert to text early, and fuse deliberately** — don't expect one model to do it all." },

            { type: "checklist", heading: "Multimodal Application Takeaways", items: [
              "Frame the task on the input×output modality matrix — that picks the model and pipeline",
              "Underneath, every modality becomes tokens projected into a shared space (m8l1) — same transformer, different encoder",
              "Convert exotic modalities (audio, video) to text early, then reuse your LLM/RAG/eval stack",
              "Audio: pipeline (STT→LLM→TTS) for control and transcripts; native speech-to-speech for low-latency voice",
              "Voice agents are a latency problem — stream every stage, handle barge-in, or go native realtime",
              "Video: sample keyframes + transcribe audio + fuse — never feed raw frames (cost, m2l4)",
              "Generation (image/audio/video) adds provenance, rights, and brand-safety obligations (m6l7, m7l3)",
              "Decompose into specialized per-modality models and fuse with timestamps/metadata — don't force one model to do everything",
            ]}
          ]
        },
        { id: "m8l3", title: "Document Intelligence Deep Dive", duration: "17 min", tags: ["vision","documents","extraction","invoices","azure","production","evaluation"],
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
            { type: "text", heading: "Measuring Extraction Accuracy", body: "\"It extracts invoices\" isn't a spec — you need a number, per field, or you can't set the confidence threshold (m6l3) or know if a model change helped. Document extraction is evaluated **field by field** against a labeled golden set (m4l6, m5l5):\n\n**Field-level accuracy** — For each field (vendor, total, date), what fraction of documents did it get exactly right? Aggregate accuracy hides that you're 99% on vendor but 80% on line items — and line items are what matter.\n**Match type matters** — Exact match for IDs and amounts; normalized match for dates and currency (is \"$1,234.00\" == \"1234\"?); fuzzy match for free-text. Define this per field or your accuracy number is meaningless.\n**Precision vs recall per field** — Did it extract a *wrong* value (precision) or *miss* one (recall)? They route differently: a wrong total is dangerous, a missing one just escalates (m6l3).\n**Confidence calibration** — Plot accuracy at each confidence level so your auto-process threshold reflects *measured* accuracy, not the model's self-rating (m6l5 calibration).\n\nBuild the golden set from real documents including the messy long tail (m6l8 baseline), and re-run it on every model or prompt change as a regression gate (m7l4). The threshold that decides auto-process vs human review (m6l3) is only as trustworthy as this measurement." },

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
