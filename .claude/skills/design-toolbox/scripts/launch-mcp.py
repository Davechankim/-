#!/usr/bin/env python3
"""Launch a pinned toolbox MCP without putting credentials in argv or output."""
import os
from pathlib import Path
import shutil
import sys

BASE = Path(__file__).resolve().parents[1]


def key_file():
    return Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex"))) / "design-toolbox" / "21st-key"


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("playwright", "magic"):
        raise SystemExit("Usage: launch-mcp.py playwright|magic [server flags]")
    node = shutil.which("node")
    if not node:
        raise SystemExit("Node.js is required. Install the toolbox runtime in a Node-enabled environment.")
    mode = sys.argv[1]
    if mode == "playwright":
        entry = BASE / "runtime/node_modules/@playwright/mcp/cli.js"
        flags = ["--headless", "--isolated"]
        if sys.platform == "darwin" and Path("/Applications/Google Chrome.app").exists():
            flags += ["--browser", "chrome"]
        else:
            flags += ["--config", str(BASE / "runtime/playwright.chromium.json")]
    else:
        entry = BASE / "runtime/node_modules/@21st-dev/magic/dist/index.js"
        flags = []
        key = os.environ.get("API_KEY_21ST") or os.environ.get("TWENTY_FIRST_API_KEY")
        if not key and key_file().is_file():
            key = key_file().read_text(encoding="utf-8").strip()
        if not key:
            raise SystemExit("21st API key is missing. Run toolbox.py set-magic-key in an interactive terminal.")
        os.environ["API_KEY_21ST"] = key
    if not entry.is_file():
        raise SystemExit("Toolbox npm runtime is missing. Run toolbox.py install-runtime.")
    os.execv(node, [node, str(entry), *flags, *sys.argv[2:]])


if __name__ == "__main__":
    main()
