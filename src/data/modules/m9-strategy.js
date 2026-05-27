export default
    {
      id: "m9", number: "09", title: "AI Strategy & Future", accent: "#FF8A65",
      desc: "Building an AI-first organization and positioning for what's next.",
      lessons: [
        { id: "m9l1", title: "Building an AI Roadmap", duration: "10 min", tags: ["strategy","roadmap","planning"],
          content: [
            { type: "text", heading: "The 3-Horizon Framework", body: "**Horizon 1 (0-3 months): Quick Wins** — Deploy off-the-shelf AI tools. M365 Copilot, ChatGPT Enterprise, AI coding assistants.\n\n**Horizon 2 (3-12 months): Custom Solutions** — Build RAG, custom automations, domain-specific tools. Competitive advantage starts here.\n\n**Horizon 3 (12+ months): Transformative AI** — Agents handling complete workflows. AI-native products. Business model innovation." },
            { type: "decision", heading: "Project Prioritization", rows: [
              ["High impact + Easy", "Do first — quick wins build momentum"],
              ["High impact + Hard", "Plan and invest — this is your competitive advantage"],
              ["Low impact + Easy", "Quick wins for momentum only"],
              ["Low impact + Hard", "Skip entirely"],
            ]},
            { type: "text", heading: "Minimum Viable AI Team", body: "**Start with:**\n• 1 AI/ML engineer — builds and optimizes AI systems\n• 1 full-stack developer — integrates AI into applications\n• 1 domain expert — ensures AI solves real problems\n• 1 product owner — defines requirements, measures success\n\n**Key insight:** You don't need PhDs. The most impactful enterprise AI work is integration and application engineering, not research." }
          ]
        },
        { id: "m9l2", title: "What's Coming Next", duration: "8 min", tags: ["future","trends"],
          content: [
            { type: "text", heading: "Trends to Watch", body: "**Agentic AI goes mainstream** — 2025-2026: agents move from demos to production\n**Smaller, cheaper models** — Capable models on laptops. On-device AI explosion.\n**AI-native apps** — Products built around AI, not AI bolted on. Will disrupt incumbents.\n**Regulation increases** — EU AI Act is just the beginning\n**Multimodal becomes default** — Text-only AI will feel limiting" },
            { type: "checklist", heading: "How to Stay Ahead", items: [
              "Build your data moat — best proprietary data + best systems to leverage it",
              "Stay model-agnostic — use abstraction layers (Semantic Kernel, LiteLLM)",
              "Focus on workflow, not technology — AI is the tool, not the goal",
              "Experiment relentlessly — the landscape changes monthly",
              "Invest in AI literacy across the org — everyone should understand prompting",
              "The opportunity for implementors has never been larger — bridge AI capabilities to business needs",
            ]}
          ]
        },
        { id: "m9l3", title: "AI Career Positioning & Building in Public", duration: "11 min", tags: ["career","strategy","visibility","personal-brand"],
          content: [
            { type: "text", heading: "The AI Engineer Opportunity", body: "AI engineering is the fastest-growing role in tech. The demand massively outstrips supply — most companies want to implement AI but don't have anyone who can bridge the gap between raw model capabilities and production systems.\n\nThe skillset is rare: you need production software engineering (deployment, testing, monitoring), AI/ML understanding (models, embeddings, fine-tuning), AND domain knowledge (understanding the business problem). People with all three are scarce and command premium compensation.\n\nYour positioning goal: be recognized as someone who builds production AI systems that deliver measurable business results — not someone who plays with APIs." },
            { type: "text", heading: "The Credibility Stack", body: "Credibility in AI engineering comes from four layers, each building on the last:\n\n**Layer 1: Proof of Work** — You've built real systems that work in production. This is the foundation. Without it, everything else is noise.\n\n**Layer 2: Public Artifacts** — Case studies, blog posts, open-source tools, or talks that demonstrate your thinking and results. This is how people who don't know you can verify Layer 1.\n\n**Layer 3: Community Presence** — Active in AI engineering communities: engaging with others' work, sharing learnings, asking good questions. This creates the network effects.\n\n**Layer 4: Thought Leadership** — Original frameworks, contrarian takes backed by evidence, novel approaches. This puts you in the top tier but requires the other layers first." },
            { type: "text", heading: "Building the Portfolio", body: "The single highest-leverage career move for an AI engineer is publishing 3-5 case studies of production AI work. Not tutorials. Not toy projects. Case studies that show:\n\n**The Problem** — What was the business pain? Be specific: \"AP team spending 15 min per invoice on manual data entry, processing 200 invoices/day.\"\n\n**The Architecture** — What did you build? System diagram, tech stack, key design decisions and WHY you made them.\n\n**The Hard Parts** — What didn't work? What did you try and abandon? This is where credibility lives. Anyone can describe the happy path.\n\n**The Results** — Quantified impact. \"Reduced processing time from 15 min to 45 seconds. 92% auto-processing rate. $180K annual labor cost savings.\"\n\n**The Lessons** — What would you do differently? What surprised you?" },
            { type: "code", heading: "Case Study Template — Markdown", lang: "markdown", code: `# [Title: System Name] — [One-Line Result]

## The Problem
[2-3 sentences: What was the business pain? Who felt it? How much did it cost?]

**Before:** [Specific metric — time, cost, error rate]
**Goal:** [What success looks like]

## Architecture
[System diagram or description]

**Tech Stack:**
- LLM: [Model + provider]
- Orchestration: [Framework]
- Data: [Vector DB, traditional DB]
- Infrastructure: [Cloud services]
- Language: [Primary language]

## Key Design Decisions
### Decision 1: [e.g., "Vision LLM over OCR for extraction"]
**Options considered:** [A, B, C]
**Chose:** [X] because [specific reasoning]
**Tradeoff:** [What we gave up]

### Decision 2: [e.g., "Human-in-the-loop for amounts over $10K"]
[Same structure]

## What Didn't Work
- [First approach that failed and why]
- [Unexpected challenge and how you solved it]
- [Performance issue and the fix]

## Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Processing time | 15 min | 45 sec | 95% reduction |
| Accuracy | 85% | 97% | +12 points |
| Monthly cost | $15,000 | $2,100 | 86% reduction |

## Lessons Learned
1. [Most important lesson]
2. [Second lesson]
3. [What you'd do differently next time]

## Code Sample
[One representative code block showing the most interesting 
part of the architecture — not a tutorial, just a window 
into the implementation quality]` },
            { type: "text", heading: "Where to Publish", body: "**LinkedIn articles** — Highest professional ROI. Your network sees it, recruiters index on it, it's permanently tied to your professional identity. Aim for 1 substantial post per month.\n\n**Personal blog / Substack** — Longer-form technical depth. Shows sustained thinking. Good for SEO and discoverability.\n\n**GitHub** — Open-source tools, reference implementations, or even just well-documented starter templates. Code speaks louder than words.\n\n**Conference talks** — Local meetups first (AI/ML meetups, .NET user groups). Low barrier, high credibility per effort. Record and post to YouTube.\n\n**Twitter/X** — For real-time engagement with the AI engineering community. Share learnings in threads, engage with practitioners at companies you admire." },
            { type: "text", heading: "The Visibility Resistance Pattern", body: "If you feel resistance to putting work out publicly — that's extremely common among technical people who are genuinely good at what they do. The pattern usually looks like:\n\n**Perfectionism** — \"It's not polished enough to publish.\" Counter: Published and imperfect beats unpublished and perfect. Every time.\n\n**Impostor syndrome** — \"Who am I to write about this?\" Counter: If you built a production system, you have more practical experience than 95% of people writing about AI.\n\n**Fear of judgment** — \"What if someone finds a flaw?\" Counter: Engagement (even critical) is better than invisibility. Thoughtful people appreciate nuance and honesty about tradeoffs.\n\n**The practical antidote:** Start small. Post a single insight from your work week — one thing you learned, one mistake you made, one decision you navigated. No need for a polished essay. Consistency beats intensity." },
            { type: "decision", heading: "Content Ideas by Effort Level", rows: [
              ["15 minutes", "LinkedIn post: 'One thing I learned this week building [system]'"],
              ["30 minutes", "Thread: 'How I debugged a RAG retrieval issue' with screenshots"],
              ["1-2 hours", "Blog post: Architecture decision record for a specific design choice"],
              ["Half day", "Full case study with metrics, architecture diagram, and code samples"],
              ["Ongoing", "Open-source a utility/tool from your work (with employer permission)"],
              ["Weekend project", "Build a public demo of a technique you use at work (different domain/data)"],
            ]},
            { type: "checklist", heading: "Career Positioning Checklist", items: [
              "Identify 3 production AI projects that could become case studies",
              "Write your first case study using the template above — focus on results and decisions, not technology",
              "Set up a publishing cadence: 1 LinkedIn post per week, 1 longer piece per month",
              "Get employer permission for publishing: most companies allow it with review",
              "Engage with 5 AI engineers whose work you respect — comment thoughtfully on their posts",
              "Contribute to one open-source AI project (Semantic Kernel, LangChain, Ragas, etc.)",
              "Update LinkedIn headline to reflect AI engineering focus with specific technologies",
              "Track compensation data: levels.fyi, Glassdoor, and Blind for AI engineering roles",
              "Identify 3 companies where your exact skillset (AI + .NET + enterprise) would be valued",
              "Build a personal site or portfolio page linking to your case studies and projects",
              "Record a 5-minute walkthrough of a system you built — video content has outsized reach",
              "Start before you feel ready — the first post is the hardest, it gets easier",
            ]}
          ]
        }
      ]
    }
;
