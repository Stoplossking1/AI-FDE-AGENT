"""
llm_claude.py
──────────────
Centralized interface to Anthropic Claude 3 API.

Provides:
  - `claude_call()` → async call with retry, timeout, JSON output control.
  - consistent system/user message structure
  - error and token logging for analytics
"""

import os
import asyncio
import json
from typing import Optional
from anthropic import AsyncAnthropic, APIError, RateLimitError, APIConnectionError

from core.logger import log


# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    raise EnvironmentError("Missing ANTHROPIC_API_KEY in environment variables")

client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL = "claude-sonnet-4-5"
MAX_RETRIES = 3
TIMEOUT = 120  # seconds (increased for large plan generation)
TEMPERATURE = 0.2  # keep deterministic for planning tasks


# ---------------------------------------------------------------------------
# Main function
# ---------------------------------------------------------------------------
async def claude_call(
    prompt: str,
    system: Optional[str] = None,
    model: str = MODEL,
    temperature: float = TEMPERATURE,
    max_tokens: int = 8192,  # Increased for long JSON responses
    json_mode: bool = False,
) -> str:
    """
    Sends a single message to Claude asynchronously and returns text output.

    Args:
        prompt: user content string
        system: system instruction (role definition)
        model: Claude model version
        temperature: sampling temp (low for deterministic)
        max_tokens: max tokens to generate
        json_mode: set True to bias model towards valid JSON

    Returns:
        Claude's reply as string (assistant text content)
    """

    messages = [
        {"role": "user", "content": prompt}
    ]

    log.debug(f"[Claude] Sending to model={model}, json_mode={json_mode}")

    # System message is passed as separate parameter to client.messages.create()

    # Retry loop for reliability
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = await asyncio.wait_for(
                client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    messages=messages,
                    system=system,
                    extra_headers={"anthropic-beta": "messages-2023-12-15"},
                    # optionally we could add 'response_format': {'type': 'json_object'}
                ),
                timeout=TIMEOUT,
            )

            output = _extract_text(response)
            log.success(f"[Claude] Response received (tokens={response.usage.output_tokens})")
            return output

        except (RateLimitError, APIConnectionError) as e:
            wait_time = 2 ** attempt
            log.warning(f"[Claude] Retry {attempt}/{MAX_RETRIES} after {e}. Waiting {wait_time}s")
            await asyncio.sleep(wait_time)

        except asyncio.TimeoutError:
            log.error(f"[Claude] Timeout after {TIMEOUT}s on attempt {attempt}")
            await asyncio.sleep(2)

        except APIError as e:
            log.error(f"[Claude] APIError: {e}")
            raise

    raise RuntimeError("[Claude] Failed after multiple retries")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _extract_text(response) -> str:
    """Extracts text content from Anthropic message response object."""
    try:
        parts = response.content
        if not parts:
            return ""
        # Each part may be a dict with {"type": "text", "text": "..."}
        for p in parts:
            if isinstance(p, dict) and p.get("type") == "text":
                return p.get("text", "")
        # fallback
        if hasattr(parts[0], "text"):
            return parts[0].text
        return str(parts)
    except Exception as e:
        log.error(f"[Claude] Failed to parse response content: {e}")
        return ""


# ---------------------------------------------------------------------------
# Optional: helper for structured JSON calls (used by planner/coder agents)
# ---------------------------------------------------------------------------
async def claude_json_call(prompt: str, system: str) -> dict:
    """
    A stricter JSON-oriented wrapper that enforces valid JSON in the reply.
    Retries until valid JSON or max attempts reached.
    """
    for i in range(MAX_RETRIES):
        text = await claude_call(prompt, system, json_mode=True)
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start == -1 or end == 0:
                log.error(f"[Claude] No JSON braces found in response. Response preview: {text[:200]}")
                await asyncio.sleep(1)
                continue
            json_str = text[start:end]
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            log.warning(f"[Claude] Invalid JSON attempt {i+1}: {e}. Response length: {len(text)} chars")
            log.debug(f"[Claude] Response preview: {text[:500]}...")
            await asyncio.sleep(1)

    raise ValueError("[Claude] Could not obtain valid JSON output after all retries")
