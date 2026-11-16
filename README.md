# ApexProof — Beyond Pass@1: Evaluating Long-Horizon Architectural Resilience in Autonomous Coding Agents

*An open-core benchmark architecture, deterministic verification pipeline, and privacy-first fine-tuning regression lab built to test AI software engineering agents under real production constraints.*

> **Open-Core Showcase & IP Notice:**  
> This repository publishes ApexProof's full-stack web architecture, strict TypeScript domain contracts, 6-stage deterministic verification DAG, multi-tier LLM quota fallback router, and privacy-first multi-iteration regression comparator.  
> To protect proprietary intellectual property ahead of formal licensing or acquisition discussions, ApexProof's adversarial prompt engine, red-team persona calibration rubrics, production scenario trap corpus, empirically tuned scoring weights, and curated RLHF/DPO patch datasets reside in a private core (`@apexproof/private-core`) and are represented here via clean reference interfaces and deterministic sample fixtures.

---

## 1. The Production Paradox of Autonomous Coding Agents

Over the past eighteen months, scores on single-turn code generation benchmarks have climbed rapidly. Autonomous models now solve isolated algorithmic puzzles in seconds and pass localized unit-test patches with high frequency.

Yet engineering teams evaluating coding agents on real, multi-module production repositories repeatedly encounter a stark disconnect:

> **An agent that passes isolated single-diff unit tests routinely introduces subtle concurrency regressions, edits unrelated modules, violates memory or latency budgets, overwrites pinned dependency workarounds, or accumulates severe technical debt across sequential engineering turns.**

Why does this gap persist across frontier model families? Conventional evaluations share four structural blind spots:

1. **Spoon-Fed Technical Diagnostics vs. Human Bug Reports:** Traditional benchmarks hand the agent exact file paths, offending function signatures, and deterministic unit assertions. Real end users, clinicians, operators, and support engineers do not file tickets citing internal consensus modules—they describe *observable user symptoms* under real operational pressure.
2. **Single-Shot Amnesia vs. Successive Mutation:** Production engineering is an ongoing sequence of requirements: build a capability, tune it under new telemetry, deprecate a legacy route, and refactor an adjacent subsystem. Agents evaluated only on one-shot diffs frequently exhibit *feature amnesia*—silently breaking Turn 1 invariants while implementing Turn 3 modifications.
3. **Short-Sighted Fixes vs. Long-Horizon Architectural Foresight:** An agent can turn a red unit test green by hardcoding an in-memory lock, bypassing an abstraction boundary, or tightly coupling schema assumptions—choices that pass immediately while directly sabotaging the team's disclosed 12-month technical roadmap.
4. **Sanitized Sandboxes vs. Messy Production Repositories:** Real repositories carry pinned dependency constraints (due to upstream regressions or native ABI quirks) and undocumented tribal invariants hidden across config files and comments. Agents trained purely on clean greenfield exercises often naively upgrade locked packages or strip defensive workarounds.

**ApexProof** was designed and shipped end-to-end **in under 1 month using Google AI Studio's AI coding agent** to model, instrument, and evaluate coding agents across all of these dimensions in a unified engineering console.

---

## 2. Core Pillars of the Evaluation Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                       APEXPROOF CORE ARCHITECTURE                      │
├────────────────────────────────┬───────────────────────────────────────┤
│  01. Non-Technical Symptoms    │  02. Infrastructure Budget Envelopes  │
│  (Observable user friction)    │  (RAM caps, p99 SLA, bandwidth/cost)  │
├────────────────────────────────┼───────────────────────────────────────┤
│  03. Successive Mutations      │  04. Roadmap Foresight & Absurdity    │
│  (Add → Modify → Deprecate)    │  (12-mo directional vs. hack audit)  │
├────────────────────────────────┼───────────────────────────────────────┤
│  05. Live Failure Intelligence │  06. Messy SWE & Incomplete Context   │
│  (Web-grounded glitch intake)  │  (Pinned deps & tribal knowledge)     │
├────────────────────────────────┴───────────────────────────────────────┤
│  07. Per-Test 8/9-vs-10 Audits & Zero-Key Model Iteration Lab          │
│  (Prompt/reply distillation + bidirectional % delta progression)       │
└────────────────────────────────────────────────────────────────────────┘
```

### Pillar I: Non-Technical Symptom Framing (Zero Spoon-Feeding)
Instead of handing an agent pre-located stack traces or target line numbers, ApexProof frames tasks as authentic non-technical operator or customer incident reports. The evaluated agent must bridge the semantic gap from observable system behavior down to root-cause state invariants and failure boundaries on its own.

### Pillar II: Real-World Infrastructure Constraint Envelopes
Every evaluation run attaches typed operational boundaries (`RealWorldInfrastructureConstraints` in `lib/types.ts`), including:
- **Heap / Container Memory Ceilings** (`maxMemoryLimitMb`)
- **Latency SLAs** (`maxP99LatencyMs`)
- **Network / Link Bandwidth Quotas** (`networkBandwidthQuota`)
- **Cloud Spend / Scan Guardrails** (`cloudCostConstraint`)
- **Backward Compatibility Contracts** (`backwardCompatibilitySla`)

Patches that resolve a symptom functionally while violating latency, unbounded-allocation, or compatibility budgets are explicitly surfaced in the scorecard and audit diagnostics.

### Pillar III: Successive Feature Mutations & Cohesion Tracking (CFCI)
To detect multi-turn feature amnesia, ApexProof structures multi-turn mutation pipelines (`FeatureMutationTurn`: `add`, `modify`, `delete`, `refactor`) via `MarathonEngine` (`lib/engine/marathon-engine.ts`). It computes the **Cumulative Feature Cohesion Index (CFCI)** across turns—flagging exactly which prior turn's invariants broke when a subsequent feature mutation was introduced.

### Pillar IV: 12-Month Architectural Roadmap Foresight & Absurdity Auditing
Each evaluation pairs the immediate task with an explicit future engineering roadmap (`FutureArchitecturalRoadmap`: intended evolution, planned modules, explicit architectural constraints). The engine audits candidate modifications along two orthogonal signals:
- **Directional Alignment Score (0–100):** Whether interfaces and boundaries move cleanly toward the planned evolution.
- **Absurdity Score (0–100):** Whether the patch introduces brittle dead-ends, monolithic shortcuts, or roadmap-blocking debt (`HIGH_ABSURDITY_FAILURE`, `ARCHITECTURAL_DEBT`, `TACTICALLY_SOUND`, `EXEMPLARY_FORESIGHT`).

### Pillar V: Search-Grounded AI Coding Agent Failure Intelligence
Through `/api/gemini/threat-intel`, ApexProof integrates Google Search grounding via `@google/genai` to pull recent real-world reports of autonomous coding agent failure patterns (e.g., premature termination, context drift, lockfile clobbering, multi-turn regression loops) and surface structured failure modes for proactive benchmark coverage.

### Pillar VI: Messier SWE Realism — Fragile Dependencies & Incomplete Context
Real production tickets omit implicit tribal rules and require strict respect for fragile dependencies. ApexProof explicitly models:
- **`FragileDependencyTrap`:** Specific pinned packages, why naive upgrades fail, and safe usage patterns.
- **`MessySWEContextProbe`:** Incomplete ticket briefs paired with subtle technical clues buried across the active project stack (`messySWEResilienceScore`).

### Pillar VII: Concise Per-Test Diagnostics & Privacy-First Iteration Lab
To make evaluations immediately actionable for human engineers training or tuning models (`lib/engine/iteration-analyzer.ts` + `components/TestResultsAndIterationLab.tsx`):
- **Distilled Per-Test Engineering Audits (`8/9 vs 10` Verdicts):** Because multi-turn prompts and agent patches can span thousands of tokens, `summarizeLongExchange` and `buildTestAuditRecord` distill each test into compact **Prompt Summary** and **Response Summary** blocks (with full expand-on-demand inspection), balanced **Positives & Negatives**, and a single crisp **Why Not 10/10** diagnostic verdict.
- **Zero-Key Successive Iteration Tracking:** When engineers fine-tune a model and run **Iteration #N+1**, ApexProof tracks identity exclusively via normalized model name (`normalizeModelIdentifier`)—**never saving or persisting user-entered API keys** in browser storage, snapshots, or exported dossiers.
- **Polarity-Normalized `%` Delta Attribution:** `compareModelIterations` automatically adjusts metric polarity across *higher-is-better* dimensions (functional pass, cohesion, security, architectural integrity) and *lower-is-better* risk dimensions (hidden concurrency failure rate, technical-debt absurdity), outputting clear bidirectional gain/regression statements and visual delta charts.
- **Custom Prompt Stress Injection:** Engineers can inject custom adversarial prompts via the Tested Agent Gateway (`/api/gemini/run-iteration`) without degrading baseline scoring isolation, reporting custom test outcomes in dedicated audit fields.

---

## 3. Execution Telemetry & Algorithmic Complexity Instrumentation

Beyond pass/fail percentages, every evaluation turn records structured execution telemetry (`ExecutionTelemetry` in `lib/types.ts`):

- **Asymptotic Time Complexity (`timeComplexity`):** Flags hidden quadratic or exponential blowups introduced by naive fixes.
- **Asymptotic Space Complexity (`spaceComplexity`):** Distinguishes bounded memory structures from unbounded retry/buffer allocations.
- **Three-Tier Token Accounting:** Separately records `promptTokens`, `completionTokens`, and `totalTokens` to measure reasoning efficiency across fine-tuning iterations.
- **Wall-Clock Turn Latency (`evaluationDurationMs`):** Captures exact millisecond turnaround per evaluation pass.
- **Bottleneck Attribution (`bottleneckAnalysis`):** Concise architectural trace summarizing latency or allocation risks.

---

## 4. Open-Core Architecture vs. Private Core Boundary

This public repository demonstrates verifiable systems engineering and full-stack execution. Sensitive evaluation IP remains cleanly separated:

| Capability Area | Included in This Public Showcase | Housed in `@apexproof/private-core` |
| :--- | :--- | :--- |
| **Frontend Workspace & Charts** | Complete Next.js 15 / React 19 UI, ProofGraph Visualizer, Iteration Lab | — |
| **Verification Pipeline** | Complete 6-stage typed DAG & hash-chained ledger (`ProofGraphEngine`) | Calibrated empirical boundary cutoffs |
| **Iteration Comparator** | Full `compareModelIterations`, `buildTestAuditRecord`, zero-key isolation | Enterprise fleet telemetry sync |
| **Evaluation Scoring** | Clean reference multi-dimension implementation (`EvaluationEngine`) | Empirically calibrated weighting & penalty matrices |
| **LLM Routing & Quota Safety** | Complete sequential multi-tier cascade (`generateWithFallbackCascade`) | Private batch orchestration queues |
| **Adversarial Prompt Engine** | Clean route scaffolding & reference formatting interface | Master adversarial persona prompts & trap synthesis |
| **Production Stress Corpus** | Sample distributed-lease fixture (`lib/data/scenarios.ts`) | Multi-domain distributed/security/ledger scenario bank & chaos bash harnesses |

---

## 5. Web Stack & Engineering Decisions: What, Why, and How

| Layer | Technology | What & Why | How Implemented |
| :--- | :--- | :--- | :--- |
| **Full-Stack Framework** | **Next.js 15+ (App Router)** | Separates interactive browser state from server-side secrets (`GEMINI_API_KEY`) without a custom Express server. | Route handlers under `app/api/gemini/*` proxy all inference and evaluation calls cleanly. |
| **UI & Concurrency** | **React 19** | Responsive state synchronization across Agent Gateway, ProofGraph Ledger, Test Audits, and Iteration Lab. | Centralized typed state in `app/page.tsx` driving modular client views under `components/`. |
| **Domain Contracts** | **TypeScript 5.9 (Strict)** | Eliminates schema drift across complex telemetry, foresight, and verification DAG structures. | Strongly typed interfaces in `lib/types.ts` verified with `tsc --noEmit` (zero errors). |
| **Styling System** | **Tailwind CSS v4** | Crisp, uncrowded layout hierarchy with responsive non-clipping controls and zero CSS-in-JS runtime weight. | Configured via `@tailwindcss/postcss` and `app/globals.css`. |
| **Icons & Motion** | **Lucide React & Motion** | Clean technical iconography and smooth non-blocking drawer/tab transitions. | Tree-shaken Lucide components + `motion/react` animations. |
| **AI SDK & Failover** | **@google/genai + Cascade** | Prevents HTTP 429 quota failures from aborting multi-turn evaluations. | `generateWithFallbackCascade` (`lib/gemini-fallback.ts`) fails over sequentially across `gemini-3.8-flash` $\rightarrow$ `gemini-flash-latest` $\rightarrow$ `gemini-3.1-flash-lite` with per-tier timeouts. |
| **Unit Verification** | **Native `node:test` + `tsx`** | Sub-second TypeScript unit testing with zero heavy test-runner overhead. | Verified pure engine modules (`lib/engine/*.test.ts`, `lib/gemini-fallback.test.ts`). |

---

## 6. Seven-Dimension Evaluation Framework

ApexProof decomposes candidate agent performance across seven orthogonal engineering dimensions (`EvaluationScorecard`):

1. **Functional Correctness:** Resolves the user-visible symptom without breaking baseline contracts.
2. **Architectural Integrity:** Preserves clean module boundaries and separation of concerns without out-of-scope edits.
3. **Security Architecture:** Prevents tenant isolation breaks, auth bypasses, and unsafe payload handling.
4. **Concurrency & Reliability:** Maintains correctness under concurrent request storms, lease expiration, and failover jitter.
5. **Long-Horizon Completion:** Sustains coherence across sequential rounds without regression loops or resurrected bugs.
6. **Performance & Latency Efficiency:** Operates within asymptotic memory/time and SLA latency envelopes.
7. **Regression & Boundary Discipline:** Confines modifications strictly inside relevant task boundaries rather than making collateral edits across unrelated modules.

*(In this public showcase, `EvaluationEngine` in `lib/engine/scoring.ts` and `DEFAULT_PUBLIC_BOUNDARY_THRESHOLD` in `lib/engine/proofgraph.ts` use pluggable open reference thresholds so researchers can supply custom calibration policies.)*

---

## 7. Actionable Outputs: Audit Dossiers, Diagnostics & Stress Isolation

Every ApexProof evaluation produces tangible engineering artifacts directly from verifiable modules in this repository:

- **Concise Per-Test Audit Records (`lib/engine/iteration-analyzer.ts`):** Compact prompt and reply summaries paired with expandable raw inspection (`TestResultsAndIterationLab.tsx`), balanced Positives/Negatives, and one-sentence verdicts explaining why a run scored an `8` or `9` instead of `10`.
- **Custom Prompt Stress Injection (`app/api/gemini/run-iteration/route.ts`):** Engineers can inject custom adversarial probes alongside baseline evaluations without diluting baseline scoring discipline, producing dedicated custom prompt status and pass-rate breakdowns.
- **Fine-Tuning Data & Chaos Schema Contracts (`lib/engine/data-pipeline.ts`, `lib/engine/repro-generator.ts`):** Structured TypeScript schemas for pairing discovered regression patterns with system-prompt guardrail templates and deterministic verification harness specs (with reference sample structures included openly and enterprise corpora kept in `@apexproof/private-core`).
- **Exportable Executive Audit Dossiers (`lib/download-report.ts` & `components/AuditReportModal.tsx`):** Generates downloadable `.md` audit reports consolidating composite scorecards, execution telemetry, ProofGraph hash traces, per-test `8/9 vs 10` verdicts, and multi-iteration `%` progression summaries—with zero API key retention.

---

## 8. Reproducible Verification & What You Can Prove Locally

Every technical claim about this public showcase can be verified directly from your terminal with zero external database setup:

```bash
# 1. Install dependencies
npm install

# 2. Verify strict TypeScript compilation across the entire codebase (0 errors)
npx tsc --noEmit

# 3. Run all 16 pure-TypeScript unit tests across 4 engine suites (< 2 seconds)
npx tsx --test lib/engine/iteration-analyzer.test.ts lib/engine/marathon-engine.test.ts lib/gemini-fallback.test.ts lib/engine/proofgraph.test.ts

# 4. Run ESLint static analysis
npm run lint

# 5. Build production Next.js bundle & launch interactive dashboard
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the full interactive workspace.

### What Works Out-of-the-Box Without Any API Keys:
- **Deterministic Offline Reference Mode:** If `GEMINI_API_KEY` is omitted from `.env`, backend API routes gracefully serve typed reference fixtures so every tab, ProofGraph DAG trace, custom prompt flow, `8/9 vs 10` audit card, multi-iteration `%` delta chart, and Markdown dossier export (`lib/download-report.ts`) operates cleanly.
- **16 Verified Unit Assertions Across 4 Suites:**
  - `lib/engine/iteration-analyzer.test.ts` (**5 tests**): Model name normalization (zero key exposure), polarity-adjusted `%` gains and regressions, custom prompt delta math, `buildTestAuditRecord` diagnostic synthesis, and long-exchange summarization.
  - `lib/engine/marathon-engine.test.ts` (**4 tests**): Cumulative Feature Cohesion Index (CFCI) deductions, multi-turn cascade attribution, architectural foresight scoring, and natural-symptom challenge formatting.
  - `lib/engine/proofgraph.test.ts` (**4 tests**): Evidence contradiction detection, configurable boundary enforcement blocking out-of-scope edits, full 6-stage transaction verification, and ledger hash integrity checks.
  - `lib/gemini-fallback.test.ts` (**3 tests**): Sequential multi-tier cascade definitions, configuration validation, and fixture integrity checks.
- **End-to-End 1-Month Build Velocity:** Architected, implemented, tested, and verified from scratch **in under 1 month** by a solo developer leveraging **Google AI Studio's AI coding agent**.

---

## 9. Contact & Acquisition / Interview Inquiries

- **Creator:** Anant Bajpai
- **Email:** `anantbajpai3927@gmail.com`
- **Access Requests:** Inquiries regarding technical architecture walkthroughs, research roles, or licensing/evaluation of the private `@apexproof/private-core` prompt and scenario suites are welcome via email.
