---
name: docmd-dev
description: Use this skill when contributing to the docmd framework itself — working in the cloned `docmd/` monorepo or authoring plugins, templates, and engines. Covers the monorepo architecture, supporting micro-libraries (`lite-matter`, `lite-mdx`, `lite-template`, `lite-hl`, `embed-lite`), plugin authoring (`docmd` manifest namespace, `requiresLiveServer`, `server` and `doctor` capabilities, conditional assets), template authoring (12 EJS slots, priority chain), JS/Rust/Python engine loaders, the public `@docmd/api` Node & client runtime APIs, and the security/regression gate.
audience: developer
load_command: docmd-skills dev <dir>
version: 1.3.0
verified_against:
  docmd: "0.10.0"
  node: ">=20"
  dev_node: ">=24"
  tested_on: 2026-11-14
repository: https://github.com/docmd-io/docmd-skills
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
siblings:
  - name: docmd-skills
    when: building, configuring, validating, serving, or deploying a docmd site
  - name: docmd-writer
    when: writing, structuring, or reviewing the prose inside a docmd site
---

# docmd — Agent Skill (Developer)

Use this skill when the user wants to **modify the docmd framework itself** or **author a plugin, template, or engine** against `@docmd/api`. This skill can be loaded on demand individually (`npx docmd-skills dev <dir>`) or invoked from its sibling skills (**docmd-skills** and **docmd-writer**) whenever a task crosses into framework internals.

## When to use this skill

Use it when **any one** of these signals is true:

1. The user's working directory **is** a clone of the docmd monorepo (`docmd/`). Telltale markers: `pnpm-lock.yaml`, `packages/core/src/`, `packages/ui/src/`, `packages/api/src/`, `packages/parser/src/`, `packages/plugins/<name>/`, `packages/engines/{js,rust,python}/`, `packages/templates/summer/`.
2. The user explicitly asks to "write a plugin", "write a template", "extend the engine", "modify the core/parser", "add a hook", "add a `doctor` check", or "add a `serve` action".
3. The user is editing files inside `packages/core/src/`, `packages/api/src/`, `packages/parser/src/`, `packages/ui/src/`, `packages/tui/src/`, `packages/deployer/src/`, `packages/live/src/`, `packages/plugins/*/src/`, `packages/templates/*/`, or `packages/engines/*/` of the docmd monorepo.

**If the user wants framework help but no `docmd/` clone exists in the working directory**, ask before editing framework source: would they like you to clone the monorepo (`git clone https://github.com/docmd-io/docmd.git docmd`) or refresh an existing one (`git -C docmd pull`)?

Do not use it for: site-level configuration or operations (call **docmd-skills**), or page-prose quality and Diátaxis structure (call **docmd-writer**).

## Loading & sibling-skill rules

- All three skills (**docmd-dev**, **docmd-skills**, **docmd-writer**) are peers that can be loaded individually on demand or cross-called mid-task.
- If a framework task also requires updating user-facing config or site docs, call **docmd-skills** for site configuration/CLI conventions and **docmd-writer** for documentation prose and code-block file titles.
- Load `references/security-and-regression-checklist.md` before declaring any framework change done.

## Monorepo package map (v0.10.0)

| Package / Path | Role |
| --- | --- |
| `packages/api` (`@docmd/api`) | Plugin loader, capability enforcement, `hooks` registry, pre-flight runtime dependency installer, WebSocket RPC action/event dispatcher (`dev` & `serve`), source editing tools, centralised URL utilities, and engine loader (`js`, `rust`, `python`). |
| `packages/core` (`@docmd/core`) | CLI entry (`init`, `dev`, `build`, `serve`, `live`, `stop`, `deploy`, `migrate`, `validate`, `doctor`, `mcp`, `add`, `remove`), static site builder, public static root assets pipeline (`public/`), workspace orchestrator, production HTTP server (`serve`), and MCP server (`stdio` + `POST /mcp`). |
| `packages/parser` (`@docmd/parser`) | Markdown/CommonMark compiler, depth-aware `:::` container engine (`callout`, `card`, `grids`, `tabs`, `steps`, `collapsible`, `button`, `tag`, `hero`, `embed`, `changelog`, `mermaid`, `playground`, `tip`/`tooltip`), Variables & Personalisation Engine (`VariableRegistry`, `{{ var \|\| 'fallback' }}`), and URL normalisation helpers. |
| `packages/ui` (`@docmd/ui`) | Default EJS templates (12 slots + `no-style.ejs`), template resolver (`resolveTemplate`, `clearTemplateResolverCache`), `docmd-main.css` / `docmd-main.js` (SPA router, Focus Mode, print controls, lightbox), `docmd-runtime.js` (headless reactive variable SDK `window.docmd.var`), and 10 UI locales (`en`, `es`, `fr`, `de`, `ja`, `zh`, `hi`, `ko`, `ru`, `tr`). |
| `packages/tui` (`@docmd/tui`) | Minimalist border-free terminal UI, scoped loggers, spinners, and structured diagnostic formatting (`doctor`, `prep`, `sim`). |
| `packages/utils` (`@docmd/utils`) | Filesystem helpers, `safePath`, `asUserPath`, and path boundary guards. |
| `packages/deployer` (`@docmd/deployer`) | Manifest generators for `--docker` (defaults to `docmd serve --host 0.0.0.0` + `/healthz`), `--nginx`, `--caddy`, `--vercel`, `--netlify`, `--github-pages`. |
| `packages/live` (`@docmd/live`) | Browser-based isomorphic Live Editor bundle (`docmd.compile`). |
| `packages/engines/*` | Execution backends: `js` (`@docmd/engine-js`, default), `rust` (`@docmd/engine-rust` + `@docmd/engine-rust-*` N-API binaries), `python` (`@docmd/engine-python`, Python 3.8+ stdio worker pool). |
| `packages/templates/summer` | Official `@docmd/template-summer` package (priority `25`, 6 slot overrides). |
| `packages/plugins/*` | **Core built-ins**: `search`, `ai`, `seo`, `sitemap`, `analytics`, `llms`, `okf`, `mermaid`, `openapi`, `git`, `playground`, `mdx`. **Optional (`docmd add`)**: `math`, `pwa`, `threads`, `iconify`. **Installer**: `installer` (`@docmd/plugin-installer`). |

### Supporting micro-libraries (`docmd-io` ecosystem)

Zero-dependency, isomorphic TypeScript packages used by `@docmd/parser`, `@docmd/ui`, and `@docmd/plugin-mdx`:

- **`@docmd/lite-matter`** — Frontmatter extractor and YAML parser.
- **`@docmd/lite-mdx`** — Zero-dependency MDX/JSX compiler with component mapping (`<Callout>`, `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`, `<Steps>`) and sandboxed expressions.
- **`@docmd/lite-template`** — Sub-millisecond async EJS-compatible template compiler.
- **`@docmd/lite-hl`** — Zero-config heuristic code tokenizer and syntax highlighter.
- **`embed-lite`** — Static URL-to-HTML responsive embed generator (YouTube, X/Twitter, Spotify, CodePen, Figma, etc.).

## Reference index

| Reference | CLI install subcommand | Use it for |
| --- | --- | --- |
| `references/api-dev.md` | `docmd-skills dev` | `@docmd/api` internals: URL utilities, `loadPlugins`, `createActionDispatcher`, `ActionContext` (`mode`, `caller`, `requestRebuild`), `ServerHandle`, `DoctorContext`, `resolveTemplate`, engine loader & vector/file helpers, `window.docmd` dev & runtime SDK, TypeScript types |
| `references/plugin-development.md` | `docmd-skills dev` | Authoring a docmd plugin: `PluginDescriptor`, `package.json#docmd` manifest namespace, ESM `exports.default`, 14 capabilities (`init`, `markdown`, `head`, `body`, `build`, `post-build`, `dev`, `server`, `assets`, `actions`, `events`, `translations`, `template`, `doctor`), `requiresLiveServer`, conditional assets (`AssetCondition`), `resolvedAssets` |
| `references/template-development.md` | `docmd-skills dev` | Authoring a docmd template: 12 template slots, EJS locals, `templateAssets` priority chain (`0` base → `5` theme → `10` template → `15` customCss → `20` plugins → `25+` opinionated template), `theme.name` auto-promotion, ESM exports |
| `references/engines.md` | `docmd-skills dev` | Pluggable engine architecture: JS, Rust (N-API), and Python (stdio `ThreadPoolExecutor`) engines, double-serialisation trade-offs, task allowlist, `resolveEngine`, `shutdownEngines`, custom engine registration |
| `references/security-and-regression-checklist.md` | `docmd-skills dev` | Mandatory security and regression gate before any framework change ships: `:::` parser invariants, plugin output escaping, `docmd serve` origin & `identityHeader` write gating, Playground iframe/worker sandboxing, MCP path & `config.exclude` sandboxing, gitignore anchor rules, build-tree hygiene |

## Workflows

### 1. Cloning, refreshing, and verifying the monorepo

```bash
# Clone fresh
git clone https://github.com/docmd-io/docmd.git docmd
cd docmd
pnpm install

# Refresh existing clone
git -C docmd pull
pnpm install
```

Key monorepo scripts (`package.json`):

- `pnpm build` / `pnpm dev` — build or run the `_playground` test site.
- `pnpm prep` — full preparation, security audit (`pnpm audit --audit-level=high`), build, and 7-pillar E2E test suite. **Must leave a clean `git status` tree.**
- `pnpm verify` — verification pipeline.
- `pnpm sim` — consumer simulation (`tools/sim.mjs`).
- `pnpm lint` — ESLint across all packages.
- `pnpm doctor` — run `docmd doctor` against `_playground`.

### 2. Writing or updating a plugin

1. Read `references/plugin-development.md` end-to-end before scaffolding.
2. Pick the closest existing plugin under `packages/plugins/<name>/` and match its structure.
3. Declare both the runtime `plugin` descriptor **and** the `package.json#docmd` manifest namespace (`key`, `kind`, `displayName`, `tagline`, `capabilities`, `requiresLiveServer`), plus `"default"` in `package.json#exports["."]`.
4. Cross-check `references/api-dev.md` for hook signatures, `AssetCondition` (so unused plugins emit 0 KB on pages that don't need them), `onServerReady` (`server` capability), and `onDoctorCheck` (`doctor` capability).
5. Run `pnpm prep` to regenerate the build-time plugin registry and verify no capability drift.

### 3. Writing or updating a template

1. Read `references/template-development.md` for the 12 template slots and the asset priority chain.
2. Match `packages/templates/summer/` (`capabilities: ['template']`, `templates[]`, `templateAssets[]`, `scripts/copy-assets.mjs`, and `exports["."].default`).
3. Never use `!important` in template CSS — user `customCss` (priority `15`) must remain able to override default template styles (priority `10`), and templates must bridge `--docmd-*` CSS tokens cleanly.

### 4. Engine work (JS / Rust / Python)

1. Read `references/engines.md` first — understand which tasks belong in JS vs Rust (`@docmd/engine-rust`) vs Python (`@docmd/engine-python`) and why the double-serialisation tax matters.
2. Check `references/api-dev.md` for `loadEngine`, `resolveEngine`, `shutdownEngines`, and the allowlisted task helpers (`discoverFiles`, `readFilesBatch`, `getGitLog`, `buildSearchIndex`, `chunkText`, `quantizeVectors`, `cosineSimilarity`).

### 5. Hard checks before any framework change ships

Run this gate before declaring a framework change done:

1. Generic Node triage (`nodejs-cautions.md` grep checklist + `security-must-checks.md` Rules 1–7 if `ai-dev` is installed).
2. `references/security-and-regression-checklist.md` — verify every section that touches the area you changed (parser, plugins, public API, i18n/versioning, `serve`/Docker/deployer, migration, CLI honesty, rendering/Playgrounds/MDX, TUI, engines).
3. Ensure `pnpm -r run build` and `pnpm prep` leave a **clean git working tree** (no untracked or mutated fixture files) and all tests use isolated temporary directories.
4. Add one regression test per bug class fixed.

## Cross-skill navigation

- **docmd-skills** — load when the task turns to operating a docmd site (`docmd.config.json`, CLI flags, `docmd serve`, `docmd doctor`, deployment, variables, containers, plugins).
- **docmd-writer** — load when drafting or reviewing documentation prose, Diátaxis page structure, British English style, or code-block file titles.