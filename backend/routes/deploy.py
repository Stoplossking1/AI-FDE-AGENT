"""
deploy.py
─────────
Manages deployment of generated projects.
"""

from fastapi import APIRouter
from core.logger import log

router = APIRRouter = APIRouter()


@router.post("/start")
async def deploy_project():
    log.info("[Deploy] Starting deployment pipeline…")
    # TODO: call core/deployer.py
    return {"status": "deploying"}
