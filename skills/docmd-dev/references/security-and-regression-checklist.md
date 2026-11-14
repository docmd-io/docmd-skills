---
description: docmd-specific security and quality gate for framework contributors. Covers container parser invariants, plugin output escaping, docmd serve origin & identityHeader write gating, Playground & MDX sandboxing, MCP path & config.exclude enforcement, gitignore scoping, Docker/deploy hardening, and build-tree hygiene.
when_to_use: |
  Load this reference BEFORE declaring any framework change done or reviewing a PR touching:
  - `packages/core`, `packages/api`, `packages/parser`, `packages/ui`, `packages/tui`, `packages/utils`
  - `packages/plugins/*`, `packages/engines/*`, `packages/templates/*`, `packages/deployer`, `packages/live`
  - `docker/` or `tools/`
audience: dev
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# docmd Security and Regression Checklist (v0.10.0 Gate)

> docmd-specific security and quality gate. docmd is Node.js and TypeScript only, so generic Node security rules (`nodejs-cautions.md` and `security-must-checks.md` if `ai-dev` is installed) ALWAYS apply on top of this file. This reference captures the invariants from v0.8.x–v0.10.0 battle tests and security hardening.

## When to load this reference

- You are changing framework code in `packages/core`, `packages/api`, `packages/parser`, `packages/ui`, `packages/tui`, `packages/utils`, `packages/plugins`, `packages/engines`, `packages/templates`, `packages/deployer`, `packages/live`, or `docker/`.
- You are about to declare a framework change "done" or review a framework PR.

Every **MUST** is a release blocker. Every **SHOULD** requires explicit justification if violated.

---

## 1. Container parser (`:::`), Variables (`{{ }}`), and MDX invariants (`packages/parser`, `packages/plugins/mdx`)

- **MUST.** Depth tracking must be content-aware, not indentation-blind. Opening `::: tag` and explicit closing `::: /tag` (or generic `:::`) must pair by type and depth regardless of inner indentation. (T-F1)
- **MUST.** Self-closing containers (`::: button`, `::: tag`, `::: embed`, `::: playground src="..." /:::`) and inline tooltips (`::: tip "..." term:"..." ::: /tip`) must not corrupt the outer container depth counter when followed by or omitting a closing fence. (T-F2)
- **MUST.** Sub-container markers (`::: tab` / `::: /tab`, `::: step` / `::: /step`, `::: log` / `::: /log`) and legacy markers (`== tab`, `1.`) must both resolve deterministically without erasing inner content. (T-F3, T-F4)
- **MUST.** Trailing `# comments` on container opening and closing lines must be stripped before attribute parsing.
- **MUST.** Blank lines inside raw HTML blocks (especially on `noStyle: true` pages) must not cause subsequent HTML elements to render as escaped plain text. (#187)
- **MUST.** Variable interpolation (`{{ var || "fallback" }}`) must honour `\{{ ... }}` escaping, reserve the `docmd.*` namespace strictly for compiler metadata (`docmd.version`, `docmd.buildYear`, `docmd.gitCommit`, `docmd.gitBranch`), and never use `.innerHTML` when hydrating reactive `<span data-docmd-var="...">` tokens in `docmd-runtime.js` — always use `.textContent` to prevent DOM XSS.
- **MUST.** Relative links targeting non-index folder paths without trailing slashes from deeply nested pages must resolve accurately. (#271)

## 2. Plugin system, Registry & Output-Injection Contract (`packages/api`)

- **MUST.** Every value a plugin returns via `generateMetaTags`, `generateScripts`, `getAssets`, `template` slots, or `translations` is untrusted input. Await async returns before type-checking (`safeCall`), validate return types (warn once per plugin/hook via `warnPluginReturnTypeOnce`, never interpolate `[object Promise]` or `[object Object]` into `<head>`), and escape attributes properly. (D-S4, T-S7)
- **MUST.** Every official plugin and template must declare a valid `docmd` block in `package.json` (`key`, `kind`, `displayName`, `tagline`, `capabilities`, `requiresLiveServer`) and a `"default"` export condition in `package.json#exports["."]`. The build-time registry generator must verify zero capability drift between `package.json#docmd.capabilities` and runtime `PluginDescriptor.capabilities`.
- **MUST.** Plugins declaring `requiresLiveServer: true` must have their client assets (`getAssets`, `generateScripts`, `generateMetaTags`) automatically omitted during static `docmd build` (`isDev: false` and `serve.actions` disabled), while keeping `markdownSetup` active so markdown containers still render.
- **MUST.** Pre-flight runtime dependency installation (`preflightEnsureRuntimeDeps`) must install missing official `@docmd/*` packages and peer dependencies in a **single atomic batch** (preventing npm v7+ tree pruning) and strictly reject non-`@docmd/*` or uncatalogued package names.
- **MUST.** `PostBuildContext.resolvedAssets` passed to `onPostBuild` must be deeply frozen (`Object.freeze`) so post-build plugins cannot mutate the build's asset manifest.

## 3. Production Server (`docmd serve`), Action Host & MCP Security (`packages/core`, `packages/api`)

- **MUST.** `docmd serve` must send standard security headers by default (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` / frame protections) and expose `GET /healthz` (`503` while initial build runs, `200` with `Cache-Control: no-store` once ready). (#273, #279)
- **MUST.** Under `docmd serve`, WebSocket action connections (`serve.actions.enabled: true`) must validate the `Origin` header against `serve.actions.origins` (wildcard `*` is forbidden; missing or non-matching `Origin` gets `403`). (#272, #277)
- **MUST.** Under `docmd serve`, `ctx.writeFile` and `ctx.source` edits must **refuse to run** when `ctx.caller.identity` is `null` (i.e. when `serve.actions.identityHeader` is unset, or `"cookie"`, or missing/empty on the upgrade request). `cookie` and `set-cookie` headers must always be stripped from `ctx.caller.headers`. (#272, #277)
- **MUST.** MCP over HTTP (`POST /mcp` when `serve.mcp.enabled: true`) must be **read-only** (never write to disk or trigger rebuilds), enforce a 1 MiB body limit, reject methods other than `POST` with `405`, and reject requests carrying an `Origin` header not listed in `serve.mcp.origins` with `403`. (#278)
- **MUST.** MCP tools (`read_doc`, `list_docs`, `search_docs`, `validate_docs`) over both `stdio` and HTTP must confine file access to markdown files inside configured source roots (`safePath` / realpath check blocking symlink escapes) and **must honour `config.exclude` and `.gitignore`**. (#245, #268)
- **MUST.** `docmd mcp` over `stdio` must never emit TUI banners or ANSI escape sequences to `stdout` — `stdout` is strictly for JSON-RPC 2.0 frames; logs go to `stderr`. (#260)

## 4. Playground, Live Server & Dev Server Hardening (`packages/plugins/playground`, `packages/core`, `packages/live`)

- **MUST.** Playground HTML previews (`@docmd/plugin-playground`) must execute inside sandboxed iframes (`sandbox="allow-scripts allow-modals allow-forms"`) **without `allow-same-origin`**, isolating parent DOM, cookies, and storage.
- **MUST.** Playground JavaScript execution must run inside background Web Workers so blocking or infinite loops cannot freeze the main UI thread.
- **MUST.** Missing sourced playground scripts (`::: playground src="./missing.js" /:::`) must emit a graceful `.docmd-playground-missing-alert` warning box in normal builds rather than crashing, unless `--strict` (`DOCMD_STRICT=true`) is active.
- **MUST.** `docmd dev` and `docmd serve` must default to binding `127.0.0.1` (only binding `0.0.0.0` when explicitly passed via `--host 0.0.0.0`, `DOCMD_HOST`, or `serve.host`). (#269)
- **MUST.** Reflected URLs in dev/serve 404/500 responses must be HTML-escaped (`escapeHtml`), redirect `Location` headers validated against open-redirect vectors, and static/live asset paths resolved through canonical path boundary checks.

## 5. Gitignore & File Discovery Rules (`packages/core`)

- **MUST.** Anchored `.gitignore` patterns (e.g. `/airo`) must match relative to the directory containing that `.gitignore` (or project root), never as an unanchored substring against the full absolute OS filesystem path. (#244)
- **MUST.** Unanchored exclusion patterns in ancestor directories must not over-exclude project source files — scope `.gitignore` traversal strictly to the project/source boundary. (#274)

## 6. UI, SPA Router & Template Invariants (`packages/ui`, `packages/templates/summer`)

- **MUST.** SPA client navigation (`docmd-main.js`) must **not** re-execute inline body scripts on subsequent route transitions (preventing duplicate event listeners and DOM mutations), while firing `docmd:page-mounted` and `window.docmd.sync()`. (#270)
- **MUST.** Syntax highlight theme stylesheets must apply immediately on initial page load in both `default` and `summer` templates without an unstyled code flash (FOUC). (#270)
- **MUST.** Clicking the site logo when configured with an external URL (`https://...`) or root-relative workspace path must bypass SPA interception and navigate cleanly.

## 7. CLI Honesty, Subprocesses & Diagnostics (`packages/core`, `packages/tui`)

- **MUST.** Never use `execSync` with string interpolation for package managers, `doctor`, or search indexing — always use `spawnSync` / `execFile` with explicit argument arrays and `shell: false`.
- **MUST.** Honour `--no-open` and `DOCMD_NO_OPEN=true` across `dev`, `serve`, `live`, and test runners so headless/CI environments never spawn browser windows.
- **MUST.** Honour `--strict` (`DOCMD_STRICT=true`) and `--json` across `validate` and `doctor`, returning non-zero exit codes on errors.
- **MUST.** The official Docker image (`docker/Dockerfile` and `deploy --docker`) must run as a non-root user, validate writable `WORKDIR`, default to `docmd serve --host 0.0.0.0`, and wire `HEALTHCHECK` to `GET /healthz`.

## 8. Build Tree Hygiene & Test Isolation (`tools/`, `tests/`)

- **MUST.** `pnpm -r run build` and `pnpm prep` must leave a **100% clean `git status` working tree** — transient generated files or test artifacts must never dirty tracked or untracked paths in the repo. (#275)
- **MUST.** Every integration and unit test must allocate its own isolated temporary fixture directory per test process so parallel test execution (`tests/runner.js`) has zero race conditions. (#276)
- **MUST.** `pnpm prep` must pass `pnpm audit --audit-level=high` with zero high/critical CVEs.

---

## Before You Ship (Gate)

1. Run the relevant sections (1–8) above for every package your change touches.
2. Run `pnpm lint` and `pnpm prep` (or `pnpm test` + `pnpm build` + `git status --porcelain`).
3. Verify `git status --porcelain` is empty of any build/test side-effects.
4. Include a regression test covering the bug class or feature added.