"""
chat.py
───────
Handles text interactions between frontend and backend.

Endpoints:
 - POST /chat/message  → general chat (for UI)
 - POST /chat/build    → triggers Planner + Coder Agents (full build pipeline)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.logger import log
from agents import planner_agent, coder_agent, ops_client

router = APIRouter()


# ---------------------------------------------------
# Request Schemas
# ---------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class BuildRequest(BaseModel):
    project_id: str
    extra_context: str | None = None


# ---------------------------------------------------
# Routes
# ---------------------------------------------------

@router.post("/message")
async def chat_message(req: ChatRequest):
    """
    General chat endpoint.
    For now, echo back the message (extend later to real Claude chat).
    """
    log.info(f"[Chat] User said: {req.message}")
    return {"reply": f"Echo: {req.message}"}


@router.post("/build")
async def build_project(req: BuildRequest):
    """
    Full build pipeline: Plan → Code → Deploy
    
    Steps:
    1. Planner Agent: Generate project plan from frozen spec
    2. Coder Agent: Generate all code files from plan
    3. Ops Agent: Deploy to GitHub + trigger cloud deployments
    
    Returns plan + code manifest + deployment URLs
    """
    try:
        # Step 1: Generate plan
        log.info(f"[Build] Step 1/2: Planning {req.project_id}...")
        plan = await planner_agent.plan_application(
            project_id=req.project_id,
            extra_context=req.extra_context
        )
        file_tree = plan.get('file_tree', [])
        file_count = len(file_tree) if isinstance(file_tree, list) else sum(len(v) for v in file_tree.values())
        log.success(f"[Build] Plan generated with {file_count} files")
        
        # Step 2: Generate code
        log.info(f"[Build] Step 2/3: Generating code...")
        code_result = await coder_agent.generate_code(
            project_id=req.project_id
        )
        log.success(f"[Build] Code generation complete! {code_result['file_count']} files created")
        
        # Step 3: Deploy to GitHub (via Agentverse agent)
        log.info(f"[Build] Step 3/3: Deploying to GitHub...")
        deploy_result = await ops_client.deploy_project(
            project_id=req.project_id
        )
        
        if deploy_result["status"] == "success":
            log.success(f"[Build] Deployment initiated! GitHub repo: {deploy_result.get('github_repo')}")
        else:
            log.warning(f"[Build] Deployment failed: {deploy_result.get('message')}")
        
        return {
            "status": "ok",
            "plan": plan,
            "code": {
                "file_count": code_result["file_count"],
                "files": code_result["files"],
                "workspace_path": code_result["workspace_path"],
                "failed_count": code_result.get("failed_count", 0)
            },
            "deployment": {
                "status": deploy_result["status"],
                "github_repo": deploy_result.get("github_repo"),
                "frontend_url": deploy_result.get("frontend_url"),
                "backend_url": deploy_result.get("backend_url"),
                "message": deploy_result.get("message")
            }
        }
        
    except Exception as e:
        log.error(f"[Build] Pipeline failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
