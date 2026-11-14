---
name: docmd-skills
description: Use this skill when working with a docmd site — scaffolding, configuring, building, serving in production, running diagnostics (`doctor`), validating links, using variables & personalisation, authoring containers/MDX/playgrounds, configuring plugins (AI Assistant, OKF, Search, OpenAPI, etc.), or deploying. Covers the CLI, config, themes/templates, plugins, variables, MCP (`stdio` and `POST /mcp`), migration, and deployment.
audience: user
load_command: docmd-skills <dir> (default install)
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
  - name: docmd-dev
    when: working on the docmd framework itself (cloned `docmd/` monorepo) or authoring custom plugins/templates/engines
  - name: docmd-writer
    when: writing, structuring, or reviewing the prose inside a docmd site
---

# docmd — Agent Skill (User / Site Operator)

Use this skill when the user wants to **build, configure, validate, serve, or deploy a docmd documentation site**. It can be loaded on demand individually or called from its sibling skills (**docmd-dev** and **docmd-writer**).

## When to use this skill

Use it when the user wants to:

- Scaffold a new docmd site (`npx @docmd/core init`)
- Run the dev server (`dev`), static build (`build`), production server (`serve`), pre-flight diagnostics (`doctor`), link linter (`validate`), Live Editor (`live`), or deploy manifest generator (`deploy`)
- Edit `docmd.config.json` / `.jsonc` / `.ts` / `.js` (themes, templates, `public/` static root assets, navigation, layout, multi-position banners, Focus Mode, security, i18n, versions, `serve`, `exclude`)
- Use the **Variables & Personalisation Engine** (`{{ var || "fallback" }}`, `docmd.*`, `site.*`, `page.*`, `env.*`, `DOCMD_VAR_*`, reactive `user.*` via `window.docmd.var`)
- Author docmd-flavoured Markdown, `:::` containers (`callout`, `card`, `grids`, `tabs`, `steps`, `collapsible`, `button`, `tag`, `hero`, `embed`, `changelog`, `mermaid`, `playground`, `tip`/`tooltip`), or **MDX** (`<Callout>`, `<Cards>`, `<Card>`, `<Tabs>`, `<Tab>`, `<Steps>`)
- Configure built-in or optional plugins (`search`, `ai`, `seo`, `sitemap`, `analytics`, `llms`, `okf`, `mermaid`, `openapi`, `git`, `playground`, `mdx`, `math`, `pwa`, `threads`, `iconify`)
- Connect to the `docmd mcp` server over `stdio` or `POST /mcp` (`search_docs`, `list_docs`, `read_doc`, `get_config`, `validate_docs`, `get_llms_context`)
- Migrate from Docusaurus, MkDocs, VitePress, Starlight, or legacy docmd configs (`docmd migrate`)
- Pick between the `js`, `rust`, and `python` build engines

Do not use it for: writing or reviewing the prose style/structure inside pages (call **docmd-writer**), or modifying the `docmd/` framework monorepo internals and authoring custom plugin/template packages (call **docmd-dev**).

## Loading & sibling-skill rules

- Load `SKILL.md` (this file) whenever the user operates a docmd project.
- Load the relevant reference file from the index below when touching that specific surface.
- All three skills (**docmd-skills**, **docmd-dev**, **docmd-writer**) are sibling skills that can be loaded individually on demand or cross-called mid-task:
  - Hand off to **docmd-writer** whenever drafting, restructuring, or reviewing page prose, headings, or code-block file titles (` ```json "docmd.config.json" `).
  - Hand off to **docmd-dev** whenever editing the cloned `docmd/` monorepo (`packages/*`) or authoring a custom plugin/template/engine against `@docmd/api`.

## Reference index

| Reference | CLI install subcommand | Use it for |
| --- | --- | --- |
| `references/cli.md` | `docmd-skills` (default) | All `npx @docmd/core` subcommands: `init`, `dev`, `build`, `serve`, `doctor`, `validate`, `live`, `stop`, `deploy`, `migrate`, `mcp`, `add`, `remove`, plus `--host`, `--no-open`, `--strict`, `--fix`, `--json` |
| `references/config.md` | `docmd-skills` (default) | `docmd.config.json` / `.jsonc` schema, `static` (`public/`), `exclude`, themes & templates, navigation, layout, Focus Mode & print, 7-position `banners`, `security.html`, `markdown.*`, `i18n`, `versions`, `serve` |
| `references/variables.md` | `docmd-skills` (default) | Variables & Personalisation Engine: `{{ var \|\| 'default' }}`, `\{{ escaped }}`, built-in `docmd.*` / `site.*` / `page.*`, `env.*` & `DOCMD_VAR_*`, config interpolation, reactive `user.*` & `window.docmd.var` |
| `references/formatting.md` | `docmd-skills` (default) | Containers (`:::` / `::: /type`, key-value attributes, `# comments`), `playground`, `mermaid`, `tip`/`tooltip`, Iconify icons, MDX components (`<Callout>`, `<Tabs>`, `<Steps>`, `<Cards>`), and frontmatter |
| `references/plugins.md` | `docmd-skills` (default) | Core built-in plugins (`search`, `ai`, `seo`, `sitemap`, `analytics`, `llms`, `okf`, `mermaid`, `openapi`, `git`, `playground`, `mdx`), optional plugins (`math`, `pwa`, `threads`, `iconify`), and batch pre-flight auto-install |
| `references/deployment.md` | `docmd-skills` (default) | Static hosting, `docmd serve` production server (`GET /healthz`, `POST /mcp`, `serve.actions`), `public/` root assets, `docmd deploy`, Docker, GitHub Actions, CI recipes |
| `references/validation.md` | `docmd-skills` (default) | `docmd validate` (`--json`, `--strict`), `docmd doctor` (`--fix`, `--json`), `.docmdignore`, `config.exclude`, MCP `validate_docs` |
| `references/migration.md` | `docmd-skills` (default) | Migrating from Docusaurus, MkDocs, VitePress, Starlight, and `docmd migrate --upgrade` / `--dry-run` |
| `references/workspaces.md` | `docmd-skills` (default) | Multi-project doc workspaces (`workspace.projects`), project switcher, cross-workspace AI/search RAG, banner inheritance |
| `references/api-user.md` | `docmd-skills` (default) | Node build API (`buildSite`/`build`, `dev`, `serve`, `buildLive`, `defineConfig`, workspace helpers), browser compile (`@docmd/live`), client runtime (`window.docmd.var`, `docmd:page-mounted`), and the 6 MCP tools |

## Workflows

### 1. New project

1. Run `npx @docmd/core init` (creates `docs/index.md`, `docs/skills.md`, `docmd.config.json`, `assets/`, `package.json`).
2. Check `docmd.config.json` against `references/config.md` and `references/variables.md`.
3. Add pages under `docs/` (`.md` or `.mdx`); use `references/formatting.md` for containers/MDX/playgrounds and call **docmd-writer** for prose quality and code-block file titles.
4. Preview with `npx @docmd/core dev` (use `--no-open` in headless/agent environments), then run `npx @docmd/core doctor`, `npx @docmd/core validate`, and `npx @docmd/core build`.

### 2. Existing project, new feature

1. Check `references/config.md` and `references/plugins.md` first — 12 plugins (`ai`, `okf`, `playground`, `mdx`, `openapi`, `mermaid`, `search`, `seo`, `sitemap`, `llms`, `git`, `analytics`) are built into `@docmd/core` with zero install required, and optional plugins/templates (`math`, `pwa`, `threads`, `iconify`, `summer`) auto-install during pre-flight or via `npx @docmd/core add <name>`.
2. Use `references/variables.md` when replacing hardcoded versions, dates, endpoints, or per-user API keys with `{{ ... }}` tokens.
3. Run `npx @docmd/core doctor` to verify config routes, assets, and plugin health.

### 3. Production server or static deployment

1. Run `npx @docmd/core doctor` and `npx @docmd/core validate --strict` as your CI gate (`references/validation.md`).
2. Choose between static hosting (`npx @docmd/core build` → `site/`) or the production HTTP server (`npx @docmd/core serve --host 0.0.0.0`) when you need built-in compression, security headers, `GET /healthz`, live plugin actions (`serve.actions`), or remote MCP over HTTP (`POST /mcp`). See `references/deployment.md`.

## Cross-skill navigation

- **docmd-dev** — call when editing the `docmd/` framework monorepo or building a custom plugin, template, or engine.
- **docmd-writer** — call whenever writing, structuring, translating, or reviewing documentation prose.