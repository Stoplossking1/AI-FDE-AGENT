"""
audio.py
────────
Handles live audio uploads or streams (Whisper ASR later).
For now, it’s a placeholder.
"""

from fastapi import APIRouter, UploadFile, File
from core.logger import log

router = APIRouter()


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    log.info(f"[Audio] Received file: {file.filename}")
    # TODO: forward to processors/asr_streamer.py
    return {"filename": file.filename, "status": "received"}
