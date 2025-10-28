"""
llm_openai.py
──────────────
OpenAI GPT-4 interface (alternative to Claude).

Provides same interface as llm_claude.py for easy swapping.
"""

import os
import asyncio
import json
from typing import Optional
from openai import AsyncOpenAI, APIError, RateLimitError, APIConnectionError

from core.logger import log


# ---------------------------------------------------------------------------
# Initialization
# ---------------------------------------------------------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("Missing OPENAI_API_KEY in environment variables")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL = "gpt-4o"  # GPT-4o is fast and smart
MAX_RETRIES = 3
TIMEOUT = 90  # seconds
TEMPERATURE = 0.2  # keep deterministic for planning tasks


# ---------------------------------------------------------------------------
# Main function
# ---------------------------------------------------------------------------
async def openai_call(
    prompt: str,
    system: Optional[str] = None,
    model: str = MODEL,
    temperature: float = TEMPERATURE,
    max_tokens: int = 8192,
    json_mode: bool = False,
) -> str:
    """
    Sends a message to OpenAI GPT and returns text output.

    Args:
        prompt: user content string
        system: system instruction (role definition)
        model: OpenAI model version
        temperature: sampling temp (low for deterministic)
        max_tokens: max tokens to generate
        json_mode: set True to force JSON output

    Returns:
        GPT's reply as string
    """

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    log.debug(f"[OpenAI] Sending to model={model}, json_mode={json_mode}")

    # Retry loop for reliability
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            kwargs = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            
            # Enable JSON mode if requested
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}

            response = await asyncio.wait_for(
                client.chat.completions.create(**kwargs),
                timeout=TIMEOUT,
            )

            output = response.choices[0].message.content
            log.success(f"[OpenAI] Response received (tokens={response.usage.completion_tokens})")
            return output

        except (RateLimitError, APIConnectionError) as e:
            wait_time = 2 ** attempt
            log.warning(f"[OpenAI] Retry {attempt}/{MAX_RETRIES} after {e}. Waiting {wait_time}s")
            await asyncio.sleep(wait_time)

        except asyncio.TimeoutError:
            log.error(f"[OpenAI] Timeout after {TIMEOUT}s on attempt {attempt}")
            await asyncio.sleep(2)

        except APIError as e:
            log.error(f"[OpenAI] APIError: {e}")
            raise

    raise RuntimeError("[OpenAI] Failed after multiple retries")


# ---------------------------------------------------------------------------
# Optional: helper for structured JSON calls
# ---------------------------------------------------------------------------
async def openai_json_call(prompt: str, system: str) -> dict:
    """
    JSON-oriented wrapper that enforces valid JSON in the reply.
    """
    for i in range(MAX_RETRIES):
        text = await openai_call(prompt, system, json_mode=True)
        try:
            # OpenAI with json_mode should return pure JSON
            return json.loads(text)
        except json.JSONDecodeError as e:
            log.warning(f"[OpenAI] Invalid JSON attempt {i+1}: {e}")
            log.debug(f"[OpenAI] Response preview: {text[:500]}...")
            await asyncio.sleep(1)

    raise ValueError("[OpenAI] Could not obtain valid JSON output after all retries")

