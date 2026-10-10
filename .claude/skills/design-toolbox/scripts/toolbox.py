#!/usr/bin/env python3
"""Install, select and inspect the toolbox using Python's standard library."""
import argparse
import datetime
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile

BASE = Path(__file__).resolve().parents[1]
CODENAME = "design-toolbox"
TOOLS = {"figma", "playwright", "motion", "magic"}
PRESETS = {
    "auto": [],
    "design": ["taste", "ui-ux-pro-max", "emil", "playwright"],
    "app": ["ui-ux-pro-max", "impeccable", "emil", "playwright"],
    "polish": ["impeccable", "emil", "kill-ai-slop", "playwright"],
    "motion": ["emil", "emil:animate", "emil:review-animations", "motion", "playwright"],
    "figma": ["figma", "ui-ux-pro-max", "emil", "playwright"],
    "components": ["21st-ui", "magic", "emil", "playwright"],
    "engineering": ["ecc:coding-standards", "ecc:frontend-patterns", "ecc:verification-loop", "playwright"],
    "writing": ["humanizer"],
    "adhd": ["i-have-adhd"],
}
ALIASES = {
    "자동": "auto", "디자인": "design", "앱": "app", "개선": "polish", "모션": "motion",
    "개발": "engineering", "글쓰기": "writing", "컴포넌트": "components",
    "emil": "emil:emil-design-eng", "emil-kowalski": "emil:emil-design-eng",
    "taste": "taste:taste-skill", "uipro": "ui-ux-pro-max", "ui/ux-pro-max": "ui-ux-pro-max",
    "adhd": "i-have-adhd", "21st": "magic", "21st.dev": "magic", "21st.dev-magic": "magic",
    "framer-motion": "motion", "framer motion": "motion", "playwright-mcp": "playwright",
    "figma-mcp": "figma", "humanizer": "humanizer", "kill-ai-slop": "kill-ai-slop",
}


def codex_home():
    return Path(os.environ.get("CODEX_HOME", str(Path.home() / ".codex"))).expanduser()


def registry():
    return json.loads((BASE / "registry.json").read_text(encoding="utf-8"))


def emit(data):
    print(json.dumps(data, ensure_ascii=False, indent=2))


def atomic_json(path, data, mode=0o644):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=".toolbox-", dir=str(path.parent))
    try:
        os.fchmod(fd, mode)
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write("\n")
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def normalize(value):
    value = value.strip().lower()
    return ALIASES.get(value, value)


def split(value):
    return [x.strip().lower() for x in (value or "").split(",") if x.strip()]


def resolve(raw):
    ids = registry()
    out = []
    for value in raw:
        value = normalize(value)
        expanded = ["ecc:coding-standards", "ecc:verification-loop"] if value == "ecc" else [value]
        for item in expanded:
            if item not in ids and item not in TOOLS:
                raise ValueError("Unknown module: " + item + ". Use list or list --family ecc.")
            if item not in out:
                out.append(item)
    return out


def plan(args):
    preferences = {}
    if args.preset is None and args.use is None and (BASE / "preferences.json").is_file():
        preferences = json.loads((BASE / "preferences.json").read_text(encoding="utf-8"))
    preset = args.preset or preferences.get("preset") or "auto"
    preset = {"자동": "auto", "디자인": "design", "앱": "app", "개선": "polish", "모션": "motion", "개발": "engineering", "글쓰기": "writing", "컴포넌트": "components"}.get(preset, preset)
    if preset not in PRESETS:
        raise ValueError("Unknown preset: " + preset)
    raw = split(args.use) if args.use is not None else preferences.get("use") if preferences.get("use") is not None else PRESETS[preset]
    selected = resolve(raw)
    exclusions = split(args.exclude) if args.exclude is not None else preferences.get("exclude", [])
    ids = registry()
    for excluded in exclusions:
        n = normalize(excluded)
        if n not in TOOLS and n not in ids and excluded not in {x["family"] for x in ids.values()}:
            raise ValueError("Unknown exclusion: " + excluded)
        selected = [x for x in selected if x != n and x != excluded and ids.get(x, {}).get("family") != excluded]
    guides = [{"id": x, "path": str(BASE / ids[x]["path"])} for x in selected if x in ids]
    tools = [x for x in selected if x in TOOLS]
    return {"preset": preset, "selected": selected, "guides": guides, "tools": tools,
            "automatic": preset == "auto" and args.use is None and preferences.get("use") is None,
            "note": "auto chooses modules from the actual task; this command does not run a task or load every guide."}


def mcp_list():
    if not shutil.which("codex"):
        return [], "Codex CLI not found"
    p = subprocess.run(["codex", "mcp", "list", "--json"], capture_output=True, text=True, timeout=30)
    if p.returncode:
        return [], "Codex MCP list failed; inspect it locally"
    try:
        return json.loads(p.stdout), None
    except json.JSONDecodeError:
        return [], "Codex MCP list did not return JSON"


def key_path():
    return codex_home() / CODENAME / "21st-key"


def key_exists():
    return bool(os.environ.get("API_KEY_21ST") or os.environ.get("TWENTY_FIRST_API_KEY")) or (key_path().is_file() and key_path().stat().st_size > 0)


def verify_assets():
    errors = []
    for name, item in registry().items():
        path = BASE / item["path"]
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
            errors.append(name)
    lock = json.loads((BASE / "sources.lock.json").read_text(encoding="utf-8"))
    for item in lock["npm"] + lock.get("binaries", []) + lock.get("files", []):
        path = BASE / item["file"]
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
            errors.append(item.get("name", item["file"]))
    return errors


def doctor():
    ids = registry()
    servers, error = mcp_list()
    mcps = []
    for s in servers:
        if s.get("name", "").startswith(CODENAME + "-"):
            mcps.append({"name": s["name"], "enabled": s.get("enabled"), "auth_status": s.get("auth_status"),
                         "status": "configured; current-session tool connection not verified"})
    lock = json.loads((BASE / "sources.lock.json").read_text(encoding="utf-8"))
    return {"bundle": str(BASE), "guides": len(ids), "families": {k: sum(v["family"] == k for v in ids.values()) for k in sorted({v["family"] for v in ids.values()})},
            "integrity_errors": verify_assets(), "node": shutil.which("node"),
            "npm_runtime": {item["name"]: (BASE / "runtime/node_modules" / item["name"] / "package.json").is_file() for item in lock["npm"]},
            "system_chrome": Path("/Applications/Google Chrome.app").exists() if sys.platform == "darwin" else None,
            "magic_key_present": key_exists(), "magic_account_access": "not verified",
            "mcp": mcps, "mcp_inventory_error": error,
            "preferences": json.loads((BASE / "preferences.json").read_text(encoding="utf-8")) if (BASE / "preferences.json").is_file() else {"preset": "auto"}}


def run_runtime(base=BASE):
    if not shutil.which("npm") or not shutil.which("node"):
        raise ValueError("Node.js and npm are required for MCP runtime installation.")
    locked = (base / "runtime/package-lock.json").is_file()
    cmd = ["npm", "ci" if locked else "install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", str(base / "runtime")]
    p = subprocess.run(cmd)
    if p.returncode:
        raise ValueError("npm runtime installation failed. Existing skill files remain installed.")


def write_config(text):
    path = codex_home() / "config.toml"
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        stamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
        backup = path.with_name("config.toml.design-toolbox-backup-" + stamp)
        shutil.copy2(path, backup)
        backup.chmod(0o600)
    fd, tmp = tempfile.mkstemp(prefix=".toolbox-config-", dir=str(path.parent))
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def setup_mcp(base=BASE, tools=None):
    requested = tools or ["playwright", "figma", "magic"]
    bad = set(requested) - {"playwright", "figma", "magic"}
    if bad:
        raise ValueError("Unknown MCP tools: " + ",".join(sorted(bad)))
    servers, error = mcp_list()
    if error:
        raise ValueError(error)
    current = {x["name"] for x in servers}
    path = codex_home() / "config.toml"
    original = path.read_text(encoding="utf-8") if path.exists() else ""
    additions = []
    result = []
    for tool in requested:
        name = CODENAME + "-" + ("21st" if tool == "magic" else tool)
        if name in current or re.search(r"^\[mcp_servers\." + re.escape(name) + r"\]", original, re.M):
            result.append({"name": name, "action": "kept existing configuration"})
            continue
        enabled = tool == "playwright" or (tool == "magic" and key_exists())
        section = "\n[mcp_servers." + name + "]\n"
        if tool == "figma":
            section += 'url = "https://mcp.figma.com/mcp"\n'
        else:
            section += "command = " + json.dumps(sys.executable) + "\n"
            section += "args = " + json.dumps([str(base / "scripts/launch-mcp.py"), tool]) + "\n"
            if tool == "magic":
                section += 'env_vars = ["API_KEY_21ST", "TWENTY_FIRST_API_KEY"]\n'
            section += "startup_timeout_sec = 30\n"
        section += "enabled = " + str(enabled).lower() + "\n"
        additions.append(section)
        result.append({"name": name, "action": "configured", "enabled": enabled,
                       "note": "OAuth needed; prefer the native Figma plugin" if tool == "figma" else "key presence is not account verification" if tool == "magic" else "MCP browser connection must be verified in the next session"})
    if additions:
        write_config(original.rstrip() + "\n" + "".join(additions))
    return result


def enable_owned(name):
    path = codex_home() / "config.toml"
    original = path.read_text(encoding="utf-8")
    pattern = re.compile(r"(^\[mcp_servers\." + re.escape(name) + r"\]\n)(.*?)(?=^\[|\Z)", re.M | re.S)
    found = pattern.search(original)
    if not found:
        raise ValueError("MCP has not been staged: " + name)
    block = found.group(2)
    if name == CODENAME + "-21st" and str(BASE / "scripts/launch-mcp.py") not in block:
        raise ValueError("Existing MCP belongs to another install; configuration was preserved.")
    if name == CODENAME + "-figma" and 'https://mcp.figma.com/mcp' not in block:
        raise ValueError("Existing Figma MCP is different; configuration was preserved.")
    updated = re.sub(r"^enabled\s*=\s*(?:true|false)\s*$", "enabled = true", block, flags=re.M)
    if updated == block and not re.search(r"^enabled\s*=", block, re.M):
        updated += "enabled = true\n"
    result = original[:found.start(2)] + updated + original[found.end(2):]
    if result != original:
        write_config(result)


def install(args):
    errors = verify_assets()
    if errors:
        raise ValueError("Integrity check failed: " + ", ".join(errors))
    dest = Path(args.dest).expanduser().resolve() if args.dest else codex_home() / "skills" / CODENAME
    same = dest.resolve() == BASE.resolve()
    if not same:
        if dest.exists():
            raise ValueError("Destination exists; it was preserved: " + str(dest))
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = Path(tempfile.mkdtemp(prefix=".design-toolbox-", dir=str(dest.parent)))
        try:
            shutil.copytree(BASE, tmp, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", "__pycache__", ".DS_Store"))
            os.replace(str(tmp), str(dest))
        finally:
            if tmp.exists():
                shutil.rmtree(tmp)
    if not args.no_runtime:
        run_runtime(dest)
    result = {"skill_installed": str(dest), "available": "next Codex turn/session", "guide_count": len(registry())}
    if args.with_mcp:
        result["mcp"] = setup_mcp(dest)
    emit(result)


def set_magic_key():
    if not sys.stdin.isatty():
        raise ValueError("Run set-magic-key in your own interactive terminal; never paste a key into chat.")
    key = getpass.getpass("21st API key (hidden): ").strip()
    if not key or "\n" in key or "\r" in key:
        raise ValueError("A non-empty single-line key is required.")
    path = key_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.parent.chmod(0o700)
    fd, tmp = tempfile.mkstemp(prefix=".21st-", dir=str(path.parent))
    try:
        os.fchmod(fd, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(key + "\n")
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)
    setup_mcp(tools=["magic"])
    enable_owned(CODENAME + "-21st")
    emit({"key_stored": True, "permissions": "0600", "mcp_enabled": True, "account_access": "not verified"})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    ls = sub.add_parser("list", help="Show presets, modules, or an upstream family")
    ls.add_argument("--family", choices=["emil", "impeccable", "taste", "uipro", "ecc", "humanizer", "kill-ai-slop", "adhd", "magic"])
    for name in ("plan", "select"):
        p = sub.add_parser(name, help="Resolve selection" if name == "plan" else "Save a default selection for this toolbox")
        p.add_argument("--preset")
        p.add_argument("--use", help="Comma-separated modules; replaces preset modules")
        p.add_argument("--exclude", help="Comma-separated modules or families")
    sub.add_parser("doctor", help="Report hashes, runtime and MCP configuration without credentials")
    ins = sub.add_parser("install", help="Install one discoverable skill with its selected-on-demand library")
    ins.add_argument("--dest")
    ins.add_argument("--with-mcp", action="store_true")
    ins.add_argument("--no-runtime", action="store_true")
    sub.add_parser("install-runtime")
    sub.add_parser("install-browser", help="Install the matching Playwright Chromium when system Chrome is unavailable")
    mcp = sub.add_parser("setup-mcp")
    mcp.add_argument("--tools", default="playwright,figma,magic")
    sub.add_parser("set-magic-key", help="Store a private key using hidden terminal input")
    sub.add_parser("auth-figma", help="Run Figma OAuth and enable its MCP after success")
    args = parser.parse_args()
    try:
        if args.command == "list":
            if args.family:
                emit({k: v["description"] for k, v in registry().items() if v["family"] == args.family})
            else:
                emit({"presets": PRESETS, "families": {k: sum(v["family"] == k for v in registry().values()) for k in sorted({v["family"] for v in registry().values()})}, "tools": sorted(TOOLS), "individual_modules": "list --family emil|taste|ecc|..."})
        elif args.command in ("plan", "select"):
            data = plan(args)
            if args.command == "select":
                saved = {"preset": data["preset"], "use": split(args.use) if args.use is not None else None, "exclude": split(args.exclude)}
                atomic_json(BASE / "preferences.json", saved)
                data["saved_to"] = str(BASE / "preferences.json")
            emit(data)
        elif args.command == "doctor":
            data = doctor()
            emit(data)
            if data["integrity_errors"]:
                return 1
        elif args.command == "install":
            install(args)
        elif args.command == "install-runtime":
            run_runtime()
        elif args.command == "install-browser":
            cli = BASE / "runtime/node_modules/playwright/cli.js"
            if not cli.is_file():
                raise ValueError("Install the npm runtime first.")
            p = subprocess.run([shutil.which("node") or "node", str(cli), "install", "chromium"])
            return p.returncode
        elif args.command == "setup-mcp":
            emit(setup_mcp(tools=[normalize(x) for x in split(args.tools)]))
        elif args.command == "set-magic-key":
            set_magic_key()
        elif args.command == "auth-figma":
            setup_mcp(tools=["figma"])
            p = subprocess.run(["codex", "mcp", "login", CODENAME + "-figma"])
            if p.returncode:
                raise ValueError("Figma OAuth did not complete; the staged MCP remains disabled.")
            enable_owned(CODENAME + "-figma")
            emit({"figma_oauth": "CLI reported success", "mcp_enabled": True, "current_session_connection": "reopen and verify tools"})
    except (ValueError, OSError, subprocess.TimeoutExpired) as e:
        print("Toolbox error: " + str(e), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
