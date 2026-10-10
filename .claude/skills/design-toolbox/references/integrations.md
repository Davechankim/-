# Integration adapters

## Figma

Prefer the connected Figma plugin when it is present. The official remote MCP is
`https://mcp.figma.com/mcp`. Both routes need the user's OAuth consent. This bundle
does not download a private copy of Figma or supply authentication. The repository includes the official HTTP endpoint in `.mcp.json`. A local Mac
sign-in does not transfer to cloud sessions; prefer an authenticated account connector.

For a supplied Figma URL/node, collect design context, assets, variables and a
screenshot through the actual available Figma tools; match existing code and
components, implement the intended states, and verify in Playwright. Do not guess
inaccessible nodes or represent a reconstructed layout as the fetched design.
Follow any tool-specific prerequisite to load its associated native Figma skill.

For a cloud session, connect Figma in the user's Claude account and enable the
connector for that session. Do not run the original Codex `auth-figma` helper.
Consult the repository's `docs/design-toolbox-cloud.md` for authentication limits.

Official setup: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/

## Playwright

The downloaded Microsoft package is pinned in `runtime/package-lock.json`.
`scripts/cloud.py playwright` prepares the pinned runtime and matching Chromium,
then starts the MCP in an isolated headless browser context. For cloud startup,
run `scripts/cloud.py setup --browser` beforehand. Never hardcode the original
Mac's Chrome path or disable browser sandboxing to mask a missing dependency.
Current-session MCP tools do not appear merely because a new config was written.
Reopen the chat/session when needed; verify actual `tools/list`/browser results.

For UI work, verify the requested flows, desktop/mobile layout, keyboard behavior,
and relevant console errors. A screenshot by itself does not establish a working
flow. Use a local dev server or user-authorized URL, and report what was actually
checked. Existing Playwright project tests may be the most direct verification.

Browser launch settings are in `runtime/playwright.chromium.json`.
Runtime flags and versions are defined by the installed package, not by the skill.
Official repository: https://github.com/microsoft/playwright-mcp

## Framer Motion / Motion for React

This is a project dependency rather than an MCP server. `motion` and
`framer-motion` npm archives are downloaded and pinned in this bundle. They are
installed in the toolbox runtime as a dependency cache, **not in every app**.
Use the target project's package manager when animation work requires them.
Keep an existing `framer-motion` setup unless migration is requested or necessary.
For a new compatible React project, the official installation is `npm install motion`
and the usual import is `import { motion } from "motion/react"`.

Inspect React/library versions first; apply reduced-motion preferences, focus
and exit behavior, intentional timing and transform/opacity animation. Load the
Emil animate/review guides for relevant detailed decisions. Do not add animation
to a non-React project just because this module was selected; use an appropriate
native CSS or project-supported alternative.

Official installation: https://motion.dev/docs/react-installation

## 21st.dev Magic / 21st MCP

The bundle retains the upstream `21st-ui` guide at
`library/magic/magic/GUIDE.md`. The project `.mcp.json` connects directly to
`https://21st.dev/api/mcp` and reads the `API_KEY_21ST` cloud environment variable.
It does not read the Mac's private key file or embed credentials in the repository.
When available, prefer an already authenticated 21st account connector.

Use the actual discovered tools and `get_usage` to verify access. Missing credentials
must not stop independent design work. Configure secrets only through the cloud
account/environment UI; never request their values in chat or commit them.

Read the upstream guide before searches or component retrieval. Adapt retrieved
code to the existing design system. Hosted generation requires the account's
actual generation entitlement; check `get_usage.aiGenerationEnabled` and the
current tools. Do not assume a paid/free tier's quotas from vendored instructions.
Purchases, paid generation, publishing and account changes require the user's
corresponding authorization. Ordinary component integration is within a UI task.

Key and setup: https://21st.dev/mcp
Official source: https://github.com/21st-dev/magic-mcp

## Connection status

`cloud.py doctor` verifies guide hashes, runtime preparation, browser download and
key presence without printing credentials. It does not authenticate accounts.
Use the actual MCP connection and a read-only call to verify each service.
See `docs/design-toolbox-cloud.md` at the repository root for cloud setup.
