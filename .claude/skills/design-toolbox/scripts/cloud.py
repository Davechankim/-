#!/usr/bin/env python3
"""Prepare the project runtime and launch Playwright; never read personal keys."""
import argparse
import fcntl
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys

BASE = Path(__file__).resolve().parents[1]
RUNTIME = BASE / "runtime"
MARKER = RUNTIME / "node_modules/.toolbox-ready"


def run(command, **kwargs):
    # MCP reserves stdout for JSON-RPC. Installation logs go to stderr.
    subprocess.run(command, check=True, stdout=sys.stderr, timeout=300, **kwargs)


def fingerprint():
    node_version = subprocess.check_output(["node", "--version"], text=True).strip()
    value = (RUNTIME / "package-lock.json").read_bytes()
    value += f"{sys.platform}:{platform.machine()}:{node_version}".encode()
    return hashlib.sha256(value).hexdigest()


def runtime_ready():
    entries = ("@playwright/mcp/cli.js", "playwright/cli.js")
    return (shutil.which("node") is not None and MARKER.is_file()
            and all((RUNTIME / "node_modules" / item).is_file() for item in entries)
            and MARKER.read_text().strip() == fingerprint())


def ensure_runtime():
    if not shutil.which("node") or not shutil.which("npm"):
        raise RuntimeError("Node.js and npm are required in this environment.")
    with (RUNTIME / ".setup.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if runtime_ready():
            return
        run(["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"], cwd=RUNTIME)
        MARKER.write_text(fingerprint() + "\n")


def browser_path():
    script = "process.stdout.write(require('playwright').chromium.executablePath())"
    return Path(subprocess.check_output(["node", "-e", script], cwd=RUNTIME, text=True))


def ensure_browser():
    ensure_runtime()
    with (RUNTIME / ".browser.lock").open("a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if not browser_path().is_file():
            run(["node", str(RUNTIME / "node_modules/playwright/cli.js"), "install", "chromium"])
        if not browser_path().is_file():
            raise RuntimeError("Chromium installation did not produce a browser executable.")


def doctor():
    spec = importlib.util.spec_from_file_location("toolbox", BASE / "scripts/toolbox.py")
    module = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True
    spec.loader.exec_module(module)
    ready = runtime_ready()
    report = {
        "guides": len(module.registry()),
        "integrity_errors": module.verify_assets(),
        "runtime_ready": ready,
        "chromium_downloaded": ready and browser_path().is_file(),
        "api_key_environment_present": bool(os.environ.get("API_KEY_21ST")),
        "authentication": "not tested; call the connected service to verify",
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if report["integrity_errors"] else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["setup", "session-start", "playwright", "doctor"])
    parser.add_argument("--browser", action="store_true", help="Download matching Chromium during setup")
    args = parser.parse_args()
    if args.command == "doctor":
        return doctor()
    if args.command == "session-start" and os.environ.get("CLAUDE_CODE_REMOTE") != "true":
        return 0
    try:
        ensure_runtime()
        if args.browser or args.command == "playwright":
            ensure_browser()
        if args.command == "playwright":
            entry = RUNTIME / "node_modules/@playwright/mcp/cli.js"
            config = RUNTIME / "playwright.chromium.json"
            node = shutil.which("node")
            os.execv(node, [node, str(entry), "--config", str(config)])
        return 0
    except (RuntimeError, OSError, subprocess.SubprocessError) as exc:
        print(f"Design Toolbox setup failed ({type(exc).__name__}). Check Node/npm, network access and installation logs. Guides remain usable.", file=sys.stderr)
        return 0 if args.command == "session-start" else 1


if __name__ == "__main__":
    sys.exit(main())
