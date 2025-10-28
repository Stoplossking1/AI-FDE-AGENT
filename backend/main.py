"""
main.py
───────
FastAPI entrypoint for AI-FDE 2.0 backend.

 - Router registration (audio, chat, run, deploy)
 - CORS for frontend
 - Health check route
 - Shared logging
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.logger import log
from routes import audio, chat, run, deploy


# ---------------------------------------------------
# FastAPI App Initialization
# ---------------------------------------------------
app = FastAPI(
    title="AI-FDE 2.0 Backend",
    description="Backend service for the voice-to-app system",
    version="1.0.0"
)

# CORS (allow frontend in localhost dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for local dev, restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# Routers
# ---------------------------------------------------
app.include_router(audio.router, prefix="/audio", tags=["Audio"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(run.router, prefix="/run", tags=["Runner"])
app.include_router(deploy.router, prefix="/deploy", tags=["Deploy"])


# ---------------------------------------------------
# Health Check
# ---------------------------------------------------
@app.get("/")
async def root():
    return {"status": "ok", "service": "AI-FDE 2.0 Backend"}


# ---------------------------------------------------
# Startup Event
# # ---------------------------------------------------
@app.on_event("startup")
async def startup_event():
    log.info("🚀 Backend server starting up… Ready for requests.")


# ---------------------------------------------------
# Main
# ---------------------------------------------------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
