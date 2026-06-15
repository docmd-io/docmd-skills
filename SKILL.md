---
name: docmd-skills
description: Instructions for working with docmd — a zero-config documentation generator with MCP integration. Use when scaffolding, configuring, building, validating, or deploying a docmd site.
when_to_use: |
  Use this skill when the user wants to:
  - Scaffold, configure, build, validate, or deploy a docmd documentation site
  - Use the `npx @docmd/core` CLI (init, dev, build, validate, live, deploy, mcp)
  - Edit `docmd.config.json` (themes, navigation, layout, plugins, i18n, versions)
  - Write docmd-flavored markdown (containers, tabs, cards, frontmatter, Mermaid)
  - Connect to a docmd project over MCP (search_docs, read_doc, validate_docs, get_llms_context)
  - Build a custom docmd plugin or pick between the JS / Rust build engine
  - Migrate from Docusaurus / MkDocs / VitePress to docmd
do_not_use_for: Generic Markdown editing, non-docmd static site generators, or building MDX/React component libraries.
version: 1.2.0
verified_against:
  docmd: "0.8.7"
  node: ">=20"
  tested_on: 2026-06-15
repository: https://github.com/docmd-io/docmd
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
---

# docmd — Agent Skill

## 0. Pre-flight check {#0-pre-flight-check}

Before working with docmd, confirm the toolchain is available:

```bash
npx --yes @docmd/core --version   # should print a version (e.g. 0.8.6)
node --version                    # must be >= 20
```

If `npx` reports a network error, fix that first — every command in this skill assumes a working `npx` and a reachable npm registry.

This skill was verified against docmd 0.8.6. For 0.7.x or 0.9.x, see [references/migration.md](./references/migration.md) for breaking changes.

## 1. When docmd fits the task {#1-when-docmd-fits}

docmd is a strong fit for static documentation sites that will be consumed by AI agents (llms.txt and MCP are first-class features). It is less suitable when the project needs MDX/React components inside content, versioned i18n with more than a handful of locales, or a large third-party plugin ecosystem.

## 2. Core commands {#2-core-commands}

| Command | Purpose | When to use |
| --- | --- | --- |
| `npx @docmd/core init` | Scaffold `docs/`, `docmd.config.json`, `package.json`, starter `index.md` | First run only |
| `npx @docmd/core dev` | Hot-reload dev server on port 3000 (auto-increments) | Local content writing |
| `npx @docmd/core build` | Production build to `site/` | Pre-deploy, pre-commit |
| `npx @docmd/core validate` | Lint internal links, exit non-zero on broken refs | CI gate, pre-commit |
| `npx @docmd/core mcp` | Start stdio MCP server (JSON-RPC 2.0) | MCP-capable host |
| `npx @docmd/core add <name>` / `remove <name>` | Manage official plugins | Adding search / math / threads / etc. |

Full flag/option reference: [references/cli.md](./references/cli.md).

Three tool surfaces are available:

- **Shell CLI** (above) — simplest, easiest to debug
- **MCP server** (`docmd mcp`) — for MCP-aware hosts that want structured JSON responses
- **Node API** (`buildSite`, `buildLive`, `detectWorkspace`) — for embedding docmd in other Node tools. See [references/api.md](./references/api.md)

## 3. First-time setup {#3-first-time-setup}

```bash
mkdir my-docs && cd my-docs
npx --yes @docmd/core init .        # add --no-install to skip the npm install step
npm install                          # if --no-install was used
$EDITOR docs/index.md                # edit content
npx @docmd/core build                # produces ./site
npx @docmd/core validate             # confirms no broken links
```

After `init`, the project contains:

```
my-docs/
├── docmd.config.json    # site config — title, url, layout, theme, plugins
├── package.json         # scripts: dev / build / preview
├── SKILL.md             # local copy of this skill
└── docs/
    └── index.md         # landing page
```

After `build`, `site/` is a static site ready to deploy:

```
site/
├── index.html                   # /
├── <page>/index.html            # one per markdown file, kebab-case paths
├── 404.html
├── assets/                      # CSS, JS, favicon — hashed
├── search-index.json            # client-side search index
├── llms.txt                     # short AI-agent context
├── llms-full.txt                # full AI-agent context
├── llms.json                    # structured equivalent of llms.txt
├── sitemap.xml
├── robots.txt
└── .nojekyll                    # disables Jekyll on GitHub Pages
```

## 4. MCP server {#4-mcp-server}

`docmd mcp` starts a JSON-RPC 2.0 server over stdio. Verified tool surface (probed 2026-06-15, docmd 0.8.6):

| Tool | Input | Output | Use |
| --- | --- | --- | --- |
| `search_docs` | `{ query: string }` | File/line matches with surrounding context | "What does this project say about X?" |
| `read_doc` | `{ route: string }` (e.g. `"docs/foo.md"`) | Raw markdown content, or error text | Grab a single file |
| `validate_docs` | `{}` | Pass/fail text | CI-style link check |
| `get_llms_context` | `{}` | Full `llms-full.txt` body | Priming another LLM |

Protocol details:

- Transport: stdio, one JSON-RPC message per line
- Protocol version advertised: `2025-03-26` (server accepts `2024-11-05` too)
- Errors are returned as `content[].text` strings, not JSON-RPC error objects — parse the text to detect failures
- The server prints an ASCII banner to stdout on startup (filter non-JSON lines on the client)

Handshake sequence (every MCP client must do this):

```text
→ {"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
← {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26",...}}
→ {"jsonrpc":"2.0","method":"notifications/initialized","params":{}}
→ {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
← {"jsonrpc":"2.0","id":2,"result":{"tools":[...]}}
→ {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_docs","arguments":{"query":"foo"}}}
← {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"..."}]}}
```

Client config examples:

```jsonc
// Claude Desktop / claude_desktop_config.json
{
  "mcpServers": {
    "docmd": {
      "command": "npx",
      "args": ["--yes", "@docmd/core", "mcp"],
      "cwd": "/absolute/path/to/project"
    }
  }
}
```

```jsonc
// Cursor / Windsurf
{
  "command": "npx --yes @docmd/core mcp",
  "transport": "stdio"
}
```

Use MCP when the host is MCP-aware and structured responses are useful. Use the CLI for one-off `build` / `validate` runs — cheaper to spawn, no protocol overhead.

## 5. Quick config cheat-sheet {#5-quick-config-cheat-sheet}

Minimal `docmd.config.json`:

```jsonc
{
  "title": "My Docs",            // site name (browser tab, nav, SEO)
  "url":  "https://docs.example.com", // required for sitemap, canonical, og:* tags
  "src":  "docs",                // source folder
  "out":  "site"                 // output folder
}
```

Common additions:

```jsonc
{
  "layout":   { "spa": true, "sidebar": { "collapsible": true } },
  "theme":    { "appearance": "system" },   // "light" | "dark" | "system"
  "navigation": [                            // override auto-generated nav
    { "title": "Home",  "path": "/" },
    { "title": "Guide", "path": "/guide" }
  ],
  "plugins": {
    "search": {},                            // keyword search (MiniSearch, client-side)
    "seo":    {},                            // meta tags + sitemap trigger
    "llms":   {},                            // llms.txt + llms-full.txt
    "git":    { "repo": "https://github.com/me/proj" }
  }
}
```

Full schema: [references/config.md](./references/config.md).

Recommended frontmatter on each `.md` file:

```yaml
---
title: "Page Title"          # HTML <title>, nav label
description: "SEO summary"   # meta description
order: 1                     # sidebar ordering (lower = higher)
noindex: false               # true to exclude from search + sitemap
llms: true                   # false to exclude from llms.txt
---
```

Full frontmatter reference: [references/formatting.md#frontmatter](./references/formatting.md#frontmatter).

## 6. Markdown extensions {#6-markdown-extensions}

docmd-flavored markdown adds containers and tabs on top of CommonMark. Most frequently used:

````markdown
::: callout tip "Heads up"
Inline note rendered as a styled callout. Types: info, tip, warning, danger, success.
:::

::: tabs
== tab "pnpm"
```bash
pnpm add @docmd/core
```
== tab "npm"
```bash
npm install @docmd/core
```
:::

::: card "Quick Start" icon:zap
Card body — supports full markdown inside.
:::

::: button "Get Started" /getting-started
::: button "GitHub" external:https://github.com/me/proj icon:github
:::

```mermaid
graph LR; A[Write] --> B[Build] --> C[Ship]
```
````

Full container catalog: [references/formatting.md](./references/formatting.md).

## 7. Compatibility notes {#7-compatibility-notes}

A small number of behaviors are worth knowing before relying on them:

1. Every built HTML page contains a `<!-- [docmd-source] -->` attribution comment at the top. The comment is not currently gated by a config flag.
2. `engine: "rust"` falls back to the JS engine silently if the platform-specific binary is unavailable. The build log contains an `[engine]` line that indicates which engine actually ran.

## 8. When to read each reference file {#8-when-to-read-each-reference}

| You need to… | Read |
| --- | --- |
| Look up a CLI flag or command | [references/cli.md](./references/cli.md) |
| Add or tune a config key | [references/config.md](./references/config.md) |
| Write a doc page (frontmatter, containers, tabs) | [references/formatting.md](./references/formatting.md) |
| Enable/configure a plugin (search, git, seo, llms, etc.) | [references/plugins.md](./references/plugins.md) |
| Build a custom plugin | [references/plugin-development.md](./references/plugin-development.md) |
| Build a custom template (layout, 404, TOC, partials) | [references/template-development.md](./references/template-development.md) |
| Validate links in CI | [references/validation.md](./references/validation.md) |
| Multi-project monorepo | [references/workspaces.md](./references/workspaces.md) |
| Pick JS vs Rust build engine | [references/engines.md](./references/engines.md) |
| Programmatic Node/Browser integration | [references/api.md](./references/api.md) |
| Migrate from Docusaurus / MkDocs / VitePress | [references/migration.md](./references/migration.md) |
| Generate deploy configs (Docker, nginx, Vercel, etc.) | [references/deployment.md](./references/deployment.md) |

## 9. Recommended workflow for agents {#9-recommended-workflow}

1. Pre-flight: run `npx @docmd/core --version` (§0). If it fails, fix the environment first.
2. Read §§ 1, 2, 3 of this file. Skim §7 (compatibility notes) before any non-trivial work.
3. Read on demand: pick the reference file from §8 only for the part of the task at hand.
4. Build small → validate → build larger: scaffold → first page → `build` → `validate` → add more pages.
5. Use MCP when available: if the host is MCP-capable, `search_docs` and `read_doc` beat shelling out to `cat` + `grep` repeatedly.
6. Run `validate` before declaring done — a green build does not guarantee working links.

## 10. Support and upstream links {#10-support-and-upstream}

- Project repo: <https://github.com/docmd-io/docmd>
- Full docs: <https://docs.docmd.io>
- LLM-friendly full context: <https://docs.docmd.io/llms-full.txt>
- Issues: <https://github.com/docmd-io/docmd/issues>
- This skill repo: <https://github.com/docmd-io/docmd-skills>

If something in this skill contradicts the official docs, the official docs take precedence. File an issue or PR against this repo to fix any drift.