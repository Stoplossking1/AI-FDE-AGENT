"""
logger.py
──────────
Unified colorful logging utility for AI-FDE 2.0 backend.

- Provides `log` object with `.info()`, `.success()`, `.warning()`, `.error()`, `.debug()`
- Timestamped, colorized console output via `rich`
- Used across all modules (core, agents, routes)
"""

from rich.console import Console
from rich.theme import Theme
from datetime import datetime


# ---------------------------------------------------------------------------
# Theme setup
# ---------------------------------------------------------------------------
custom_theme = Theme({
    "info": "bold cyan",
    "success": "bold green",
    "warning": "bold yellow",
    "error": "bold red",
    "debug": "dim white",
    "timestamp": "dim cyan"
})

console = Console(theme=custom_theme)


# ---------------------------------------------------------------------------
# Logger class
# ---------------------------------------------------------------------------
class Logger:
    """Minimal, thread-safe color logger for consistent agent output."""

    @staticmethod
    def _time() -> str:
        return datetime.now().strftime("%H:%M:%S")

    def info(self, msg: str):
        console.print(f"[{self._time()}] [INFO] {msg}", style="info")

    def success(self, msg: str):
        console.print(f"[{self._time()}] [SUCCESS] {msg}", style="success")

    def warning(self, msg: str):
        console.print(f"[{self._time()}] [WARN] {msg}", style="warning")

    def error(self, msg: str):
        console.print(f"[{self._time()}] [ERROR] {msg}", style="error")

    def debug(self, msg: str):
        console.print(f"[{self._time()}] [DEBUG] {msg}", style="debug")


# ---------------------------------------------------------------------------
# Global instance
# ---------------------------------------------------------------------------
log = Logger()
