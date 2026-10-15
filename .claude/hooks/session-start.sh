#!/bin/bash
# Installs the Higgsfield CLI in Claude Code cloud sessions so the
# higgsfield-* skills in .claude/skills can run. Idempotent; local sessions skip it.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

if command -v higgsfield >/dev/null 2>&1; then
  echo "higgsfield CLI already installed: $(higgsfield --version 2>/dev/null | head -1)"
  exit 0
fi

npm i -g @higgsfield/cli
echo "higgsfield CLI installed: $(higgsfield --version 2>/dev/null | head -1)"
