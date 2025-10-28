
##  **Lamp — Autonomous Forward-Deployed Engineer (AI-FDE)**

**Lamp** is an AI-native orchestration system designed to autonomously translate unstructured product conversations into production-ready software. The platform integrates a multi-agent architecture built around a deterministic **orchestrator** that coordinates specialized LLM agents—**Planner**, **Coder**, **Tester**, **Security**, **Ops**, and **Doc**—each responsible for a discrete stage of the engineering lifecycle.

---

### 🧩 **System Architecture**

**1. Audio + Specification Layer**

* Input begins with customer or product team meetings captured in real time.
* **Whisper** (OpenAI) performs multilingual ASR with timestamped speaker diarization and confidence scoring.
* A custom **spec_manager** parses transcripts using in-context LLM reasoning to extract structured feature definitions, entities, and dependencies into a canonical **`spec.json`** format.
* Each spec is immutable once frozen and versioned under `/data/specs/`.

**2. Orchestration Layer**

* A lightweight Python orchestration engine (FastAPI + asyncio) implements a finite-state machine controlling task progression:
  `PLAN → CODE → TEST → SECURITY → DEPLOY → DOC`.
* The orchestrator enforces **stop conditions** (max attempts, time, and tool calls) and validates every agent I/O against formal **JSON Schemas**.
* Agents run in parallelized subprocesses but share memory through a **vector store (Chroma)** for cross-context recall.

**3. Agent Layer**
Each agent is a stateless LLM worker containerized via the **Model Context Protocol (MCP)** to ensure consistent prompt injection and tool access.

| Agent              | Core Function                                                                                                                                       | Inputs                          | Outputs              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------- |
| **Planner Agent**  | Converts `spec.json` → `plan.json`; determines stack, dependencies, API routes, DB schema, and testing plan.                                        | spec.json                       | plan.json            |
| **Coder Agent**    | Applies unified diffs to a sandboxed repo based on `plan.json`. Integrates with **Toolhouse** for safe code execution and GitHub PR creation.       | plan.json                       | workspace diff       |
| **Tester Agent**   | Executes unit and integration tests inside a containerized sandbox (pytest/Jest) and emits structured **`test_report.json`** with coverage metrics. | workspace                       | test_report.json     |
| **Security Agent** | Performs static code analysis, dependency vulnerability scanning (Bandit/Snyk API), and LLM-based heuristic review of secrets and unsafe patterns.  | workspace                       | security_report.json |
| **Ops Agent**      | Handles CI/CD orchestration. Generates Vercel or Render preview deployments via Toolhouse tools, returning deployment metadata.                     | workspace                       | deploy_report.json   |
| **Doc Agent**      | Summarizes build artifacts (spec, plan, test/security reports) to produce `README.md`, `CHANGELOG.md`, and PR summaries.                            | spec.json + plan.json + reports | docs.zip             |

---

### 🧠 **Reasoning & Evaluation Loop**

The orchestrator implements a **bounded evaluator–optimizer loop** inspired by Anthropic’s *Building Effective Agents* paper:

* On test or security failure, the orchestrator feeds structured feedback into the Coder Agent’s **Refinement Mode**, prompting small, scoped edits.
* Maximum of two refine cycles (`max_refinements=2`) before marking the task `needs_human`.
* All artifacts (`spec.json`, `plan.json`, `test_report.json`, etc.) are stored under `/data/runs/{task_id}/` for reproducibility.

---

### 🔐 **Safety & Isolation**

* All code generation and execution occur within **containerized sandboxes** with read-only mounts.
* Deployment and repo write operations run via **Toolhouse** to enforce audit logging and permission scopes.
* The orchestrator’s memory and logs are serialized as structured JSON for end-to-end observability.

---

### 🧱 **Core Stack**

* **LLMs:** Anthropic Claude 3 Opus / Sonnet (primary), OpenAI GPT-4o (fallback)
* **Backend:** FastAPI (Python 3.11), asyncio orchestration engine
* **Infra:** Docker + Vercel + Render (dry-run mode for MVP)
* **Persistence:** Firestore / local JSON storage + Chroma vector DB
* **Integration Layer:** Toolhouse (tool registry + sandbox executor), Fetch.ai (deployment automation)
* **Testing:** Pytest / Jest / Vitest with structured reporters
* **Versioning:** GitHub API (branch creation, commits, PRs)

---

### 📈 **Output**

Lamp converts a one-hour customer conversation into a deployable, test-passing MVP—complete with:

* Source code (frontend + backend)
* Automated tests and coverage reports
* Static security analysis
* Preview deployment link
* Generated documentation (README, CHANGELOG, PR summary)

---

### 🚀 **Vision**

Lamp transforms the Forward-Deployed Engineer model into a scalable autonomous workflow—where customer insight flows directly into a working product, with every intermediate artifact logged, testable, and reproducible.
