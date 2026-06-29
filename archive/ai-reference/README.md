# AI Implementation Reference

A comprehensive, searchable reference for building and deploying AI systems. Code examples in C#/Semantic Kernel and Python/LangChain.

## Quick Start

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

## Build for Production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages).

## Modules

| # | Module | Lessons | Highlights |
|---|--------|---------|------------|
| 01 | AI Foundations | 3 | Taxonomy, ML/DL/GenAI, landscape |
| 02 | How LLMs Work | 3 | Tokenization, transformers, training |
| 03 | Prompt Engineering | 3 | Fundamentals, advanced, production |
| 04 | RAG Systems | 6 | Architecture, chunking, hybrid search, re-ranking, eval |
| 05 | AI Agents | 5 | ReAct, tool design, multi-agent, guardrails, testing |
| 06 | Enterprise Implementation | 8 | 5 pattern deep dives, data strategy, ROI |
| 07 | Production & Operations | 3 | Architecture, LLMOps, security |
| 08 | Vision & Multimodal | 2 | Computer vision, multimodal patterns |
| 09 | Strategy & Future | 2 | Roadmapping, trends |

## The Five Implementation Patterns (Module 06)

Each pattern has its own lesson with architecture, real-world examples, production code, and implementation checklists:

- **Copilot** — Accounting GL code copilot (C#), FastAPI suggestion endpoint (Python)
- **Process Automation** — Invoice extraction pipeline (C#), document classifier (Python)
- **Knowledge Management** — Access-controlled RAG with security groups (C#)
- **Decision Support** — Anomaly detection + LLM explanation (Python)
- **Autonomous Agent** — Customer service agent with policy boundaries (C#)

## Customization

All content is in the `COURSE` object at the top of `src/App.jsx`. Lesson format:

```js
{
  id: "m6l2",
  title: "Pattern 1: Copilot / Assistant",
  duration: "14 min",
  tags: ["enterprise", "patterns", "copilot"],
  content: [
    { type: "text", heading: "...", body: "..." },
    { type: "code", heading: "...", lang: "csharp", code: `...` },
    { type: "checklist", heading: "...", items: ["..."] },
    { type: "decision", heading: "...", rows: [["If...", "Then..."]] },
  ]
}
```

## Tech Stack

React 18, Vite 6, zero external UI dependencies, all inline styling.
