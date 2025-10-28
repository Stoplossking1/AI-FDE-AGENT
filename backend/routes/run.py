"""
run.py
──────
Handles local sandbox runs of generated code.
"""

from fastapi import APIRouter
from core.logger import log

router = APIRouter()


@router.post("/start")
async def start_run():
    log.info("[Runner] Starting local sandbox test…")
    # TODO: call core/sandbox.py
    return {"status": "running"}
