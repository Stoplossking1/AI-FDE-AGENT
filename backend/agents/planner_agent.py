"""
planner_agent.py
────────────────
The Planner Agent acts as the system architect.

It receives a *frozen specification* from spec_manager,
consults optional context from the vector store,
and asks Claude to produce a deterministic JSON project plan
(stack, file tree, dependencies, tasks).

The plan is later consumed by coder_agent.
"""

from __future__ import annotations
import json
from typing import Any, Dict, Optional

# Switch between OpenAI and Claude
# from core.llm_openai import openai_json_call as llm_json_call  # OpenAI (faster)
from core.llm_claude import claude_json_call as llm_json_call  # Claude

# from core.vector_store import query_context    # semantic context
from core.spec_manager import load_frozen_spec # spec retrieval
from core.logger import log                    # unified logger


# ---------- main public entrypoint ----------
async def plan_application(
    project_id: str,
    spec_path: Optional[str] = None,
    extra_context: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build a deterministic project plan from a frozen spec.

    Args:
        project_id: unique id for this build session
        spec_path: path to frozen spec JSON (if None → load from spec_manager)
        extra_context: optional manual context from user

    Returns:
        dict → structured plan.json ready for coder_agent
    """

    # 1. Load frozen spec -----------------------------------------------------
    spec = load_frozen_spec(project_id, spec_path)
    log.info(f"[Planner] Loaded spec for {project_id} with {len(spec)} keys")

    # 2. Retrieve similar context from vector store --------------------------
    # TODO: Re-enable when vector store is ready
    # retrieved = query_context(json.dumps(spec)) or []
    # context_snippet = "\n".join(retrieved[:3])
    context_snippet = ""
    if extra_context:
        context_snippet += f"\nUser Context:\n{extra_context}"

    # 3. Compose prompt for Claude -------------------------------------------
    system_prompt = (
        "You are an expert full-stack software architect. "
        "Given a structured app specification, output ONLY a valid JSON object. "
        "No markdown, no code blocks, no explanation - just raw JSON."
    )

    user_prompt = f"""Based on this specification, generate a complete project plan.

SPECIFICATION:
{json.dumps(spec, indent=2)}

CONTEXT:
{context_snippet or "No additional context"}

Return ONLY a JSON object with this exact structure:

{{
  "stack": {{
    "frontend": "Next.js 14",
    "backend": "FastAPI",
    "auth": "Supabase Auth",
    "database": "PostgreSQL"
  }},
  "dependencies": {{
    "frontend": ["react", "next", "tailwindcss"],
    "backend": ["fastapi", "sqlalchemy", "pydantic"]
  }},
  "file_tree": [
    "README.md",
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/tailwind.config.js",
    "frontend/app/layout.tsx",
    "frontend/app/page.tsx",
    "frontend/components/DogCard.tsx",
    "frontend/lib/api-client.ts",
    "frontend/types/dog.ts",
    "backend/main.py",
    "backend/requirements.txt",
    "backend/models/dog.py",
    "backend/api/dogs.py"
  ],
  "api_routes": ["/api/dogs", "/api/health-metrics"],
  "entities": ["Dog", "Activity", "HealthMetric"],
  "tasks": [
    "Set up Next.js project with TypeScript",
    "Configure FastAPI backend",
    "Create database models",
    "Build dashboard UI"
  ]
}}

IMPORTANT RULES:
1. file_tree should be a flat array of full paths (e.g. "frontend/app/page.tsx")
2. Include frontend/ and backend/ prefixes for proper folder separation
3. Keep the file list focused - include ~10-20 essential files, not every possible file
4. Include key config files (package.json, requirements.txt, tsconfig.json)
5. Include main components, pages, models, and API routes
6. Don't generate exhaustive lists - focus on core functionality

Return ONLY the JSON object, nothing else."""

    # 4. Call LLM (OpenAI/Claude) --------------------------------------------
    log.info("[Planner] Sending prompt to LLM…")
    plan = await llm_json_call(prompt=user_prompt, system=system_prompt)
    # llm_json_call already returns parsed dict, no need to parse again

    # 5. Validate output -----------------------------------------------------
    _validate_plan(plan)
    log.success(f"[Planner] Plan ready for {project_id}")

    # 6. Persist plan ---------------------------------------------------------
    _store_plan(project_id, plan)

    return plan


# ---------- helper functions ------------------------------------------------
def _safe_parse_json(text: str) -> Dict[str, Any]:
    """Try to extract valid JSON from Claude output."""
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end])
    except Exception as exc:
        log.error(f"[Planner] JSON parse failed: {exc}")
        raise


def _validate_plan(plan: Dict[str, Any]) -> None:
    """Basic sanity checks on plan fields."""
    required = ["stack", "dependencies", "file_tree", "tasks"]
    missing = [k for k in required if k not in plan]
    if missing:
        raise ValueError(f"Planner output missing fields: {missing}")
    
    # Validate file_tree is list or dict
    file_tree = plan.get("file_tree")
    if not isinstance(file_tree, (list, dict)):
        raise ValueError(f"file_tree must be list or dict, got {type(file_tree)}")


def _store_plan(project_id: str, plan: Dict[str, Any]) -> None:
    """Save plan.json under /data/plans/"""
    import os
    path = f"data/plans/{project_id}.json"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2)
    log.info(f"[Planner] Plan stored → {path}")
