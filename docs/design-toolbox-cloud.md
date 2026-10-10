# Design Toolbox in Claude Code cloud

Start a new **single-repository** cloud session for `Davechankim/-` on a branch
containing these files. A session on an older branch cannot see them.

```text
/design-toolbox 선택 가능한 목록만 보여줘.
/design-toolbox 모드=개선. DESIGN.md를 유지하면서 모바일 화면을 개선해줘.
/design-toolbox 사용=emil,taste,playwright. 현재 랜딩페이지를 검토해줘.
```

`design-toolbox` is a skill. `/mcp` lists its external tools separately.
The full 326-guide collection, support data, licenses and source hashes live in
`.claude/skills/design-toolbox/`; no personal key or Mac binary is included.

## What is ready and what needs an account

| Part | Setup |
| --- | --- |
| Design, writing, ECC, ADHD guides | Available immediately from the repository |
| UI/UX Pro Max search and Kill AI Slop scanner | Bundled scripts; use Python/Node in the VM |
| Impeccable | Official launcher fetches the engine for the VM's platform when needed |
| Playwright | Project MCP launches the pinned runtime and matching Chromium in the VM |
| 21st | Project HTTP MCP; supply `API_KEY_21ST` in the cloud environment |
| Figma | Authenticate the Figma connector in your Claude account and enable it for the cloud session |
| Motion | Use only in a compatible application; this existing site uses native CSS/JS |

## Runtime preparation

The SessionStart hook installs the pinned npm dependencies only when
`CLAUDE_CODE_REMOTE=true`. It checks a Node/platform/lockfile fingerprint and skips
an unchanged installation. It does not change user-wide Claude or Codex settings.
Installation failure leaves the guides usable and reports a warning.

Playwright's launcher uses the same installation lock, avoiding a race with the hook.
Its first launch also downloads Chromium if missing. For reliable startup, put this
command in the cloud environment's **Setup script** box so the download completes
before Claude starts. Run from the repository root:

```bash
python3 .claude/skills/design-toolbox/scripts/cloud.py setup --browser
```

Allow npm and the browser download hosts through the environment network policy:
`registry.npmjs.org`, `cdn.playwright.dev`, `playwright.download.prss.microsoft.com`.
Additional redirects can require their actual destination hosts. Keep the existing
trusted package-manager allowlist. If Playwright reports missing Linux libraries,
run its `install-deps chromium` command in the cloud VM with the VM's normal permissions;
do not disable the browser sandbox as a workaround.

```bash
python3 .claude/skills/design-toolbox/scripts/cloud.py doctor
python3 .claude/skills/design-toolbox/scripts/toolbox.py plan --preset polish
```

`doctor` checks local files/runtime and key presence only. It does not validate
Figma or 21st authentication, and never prints a key.

## 21st authentication

The Mac's private key file is not available in the cloud. In the cloud environment
settings, set `API_KEY_21ST` to your existing 21st key, then start a new session.
The checked-in `.mcp.json` contains only an environment-variable reference.
Do not put the value in a chat message, GitHub file, setup script, or committed `.env`.
Environment variables are readable by users of that environment; use a personal
environment for this key. Allow `21st.dev` if project MCP traffic is subject to the
environment's network policy.

Ask Claude to call `get_usage` first. Authentication, retrieval allowance and hosted
AI generation entitlement are separate. If hosted generation is unavailable, search
for components, retrieve permitted code and let Claude adapt it to this project.
Do not infer today's quotas from the original Mac installation report.

The environment's Network secrets feature is a different authentication route. This
configuration expects `API_KEY_21ST`; a network secret alone does not populate it.

## Figma authentication

The project includes the official HTTP endpoint. An existing Mac OAuth sign-in does
not transfer. For cloud work, connect Figma in Claude account Connectors and enable
that connector on the session. Prefer the authenticated connector when available.
If the project HTTP entry reports `Needs authentication`, do not claim it is connected;
use the account connector or finish `/mcp` authentication in a supported local session.
Browser-based OAuth inside a headless cloud VM is not a reliable setup path.

## Scope and portability

The original `toolbox.py install`, `setup-mcp`, `auth-figma` and `set-magic-key` commands
configure **Codex**, not this project. Do not use those in the cloud. Use `cloud.py`
for runtime preparation and the environment/connector settings for credentials.

The project has no automatic MCP approval or permission bypass. Approve the project
MCP configuration through Claude's normal controls when prompted. Cloud sessions with
multiple repositories may not load repository hooks/MCP settings; use one repository.

References: [cloud environments](https://code.claude.com/docs/en/cloud-environments),
[skills](https://code.claude.com/docs/en/skills),
[MCP setup](https://code.claude.com/docs/en/mcp).
