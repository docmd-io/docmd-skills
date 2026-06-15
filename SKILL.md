---
name: docmd-skills
description: AI agent instructions for docmd — the zero-config AI-first documentation engine. Use when working with docmd projects, configuring documentation sites, building plugins, using the MCP server, or troubleshooting docmd builds.
when_to_use: |
  Use this skill when the user wants to:
  - Scaffold, configure, build, validate, or deploy a docmd documentation site
  - Use the `npx @docmd/core` CLI (init, dev, build, validate, live, deploy, mcp)
  - Edit `docmd.config.json` (themes, navigation, layout, plugins, i18n, versions)
  - Write docmd-flavored markdown (containers, tabs, cards, frontmatter, Mermaid)
  - Connect to a docmd project over MCP (the 4 tools: search_docs, read_doc, validate_docs, get_llms_context)
  - Build a custom docmd plugin or pick between the JS / Rust build engine
  - Migrate from Docusaurus / MkDocs / VitePress to docmd
not_use_this_for: Generic Markdown editing, non-docmd static site generators, or building MDX/React component libraries.
version: 1.1.0
verified_against:
  docmd: "0.8.6"
  node: ">=20"
  tested_on: 2026-06-15
repository: https://github.com/docmd-io/docmd
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
---

# docmd — Agent Skill

## 0. Pre-flight check (always run first)

Before doing anything with this skill, confirm the toolchain works:

```bash
npx --yes @docmd/core --version   # should print a version (e.g. 0.8.6)
node --version                    # must be >= 20
```

If `npx` errors with a network issue, fix that first — every command in this skill assumes a working `npx` and a reachable npm registry.

**Compatibility note:** This skill was verified against docmd 0.8.6. For other 0.8.x versions most things hold; for 0.7.x or 0.9.x read [references/migration.md](./references/migration.md) for breaking changes.

## 1. When to reach for docmd (vs alternatives)

| Pick docmd when… | Pick something else when… |
| --- | --- |
| You want a static docs site built from Markdown in under 5 minutes | You need MDX/React components inside content (use Next.js + `next-mdx-remote`) |
| The site will be **consumed by AI agents** (llms.txt, MCP, semantic search) — this is docmd's core differentiator | You need a large plugin ecosystem and don't care about LLM context files |
| You're shipping to plain static hosting (Pages, Vercel, Netlify, S3, nginx) | You need versioned i18n with > 5 locales and per-page translators |
| You want fast builds (1–5s for typical sites) | You have a > 5000-file monorepo (consider the Rust engine, or Docusaurus) |

## 2. The 6 commands that matter (90% of all work)

| Command | What it does | When to use |
| --- | --- | --- |
| `npx @docmd/core init` | Scaffold `docs/`, `docmd.config.json`, `package.json`, starter `index.md` | First run only |
| `npx @docmd/core dev` | Hot-reload dev server on port 3000 (auto-increments) | Local content writing |
| `npx @docmd/core build` | Production build → `site/` directory | Pre-deploy, pre-commit |
| `npx @docmd/core validate` | Lint internal links, exit non-zero on broken refs | CI gate, pre-commit |
| `npx @docmd/core mcp` | Start stdio MCP server (JSON-RPC 2.0) | When host is MCP-capable |
| `npx @docmd/core add <name>` / `remove <name>` | Manage official plugins | Adding search/math/threads/etc. |

Full flag/option reference: [references/cli.md](./references/cli.md).

**Pick the right tool surface:**

- **Shell CLI** (above) — simplest, always available, easiest to debug.
- **MCP server** (`docmd mcp`) — use when the agent host is MCP-aware and you want structured JSON responses. See §4.
- **Node API** (`buildSite`, `buildLive`, `detectWorkspace`) — use when you're embedding docmd in another Node tool. See [references/api.md](./references/api.md).

## 3. First-time setup (copy-paste, ~30s)

```bash
mkdir my-docs && cd my-docs
npx --yes @docmd/core init .        # creates scaffold; pass --no-install to skip npm install
npm install                          # if you didn't pass --no-install
$EDITOR docs/index.md                # edit content
npx @docmd/core build                # produces ./site
npx @docmd/core validate             # confirms no broken links
```

After `init`, the project looks like:

```
my-docs/
├── docmd.config.json    # site config — title, url, layout, theme, plugins
├── package.json         # scripts: dev / build / preview
├── SKILL.md             # local copy of this skill, included for context
└── docs/
    └── index.md         # your landing page
```

After `build`, the `site/` directory is a fully static site you can open in a browser or deploy anywhere:

```
site/
├── index.html                   # /
├── <page>/index.html            # one per markdown file, kebab-case paths
├── 404.html
├── assets/                      # CSS, JS, favicon — hashed for cache-busting
├── search-index.json            # client-side search index
├── llms.txt                     # short AI-agent context (page list + descriptions)
├── llms-full.txt                # full AI-agent context (every page, in full)
├── llms.json                    # structured equivalent of llms.txt
├── sitemap.xml
├── robots.txt
└── .nojekyll                    # signals GitHub Pages to skip Jekyll processing
```

## 4. MCP server — what it actually exposes

`docmd mcp` starts a JSON-RPC 2.0 server over stdio. **Verified tool surface** (probed 2026-06-15, docmd 0.8.6):

| Tool | Input | Output | Use it for |
| --- | --- | --- | --- |
| `search_docs` | `{ query: string }` | List of file/line matches with surrounding context | "What does this project say about X?" |
| `read_doc` | `{ route: string }` (e.g. `"docs/foo.md"`) | Raw markdown content, or error text | Grabbing a single file's content |
| `validate_docs` | `{}` | Pass/fail text | CI-style link check |
| `get_llms_context` | `{}` | Full `llms-full.txt` body | Priming another LLM with the docs |

**Protocol details:**
- Transport: stdio, one JSON-RPC message per line.
- Protocol version advertised: `2025-03-26` (server accepts `2024-11-05` too).
- Errors are returned as `content[].text` strings, not JSON-RPC error objects — parse the text to detect failures.
- The server prints an ASCII banner to **stdout** on startup (this is technically malformed for stdio JSON-RPC — see §7).

**Handshake sequence** (every MCP client must do this):

```text
→ {"jsonrpc":"2.0","id":1,"method":"initialize","params":{...}}
← {"jsonrpc":"2.0","id":1,"result":{"protocolVersion":"2025-03-26",...}}
→ {"jsonrpc":"2.0","method":"notifications/initialized","params":{}}
→ {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
← {"jsonrpc":"2.0","id":2,"result":{"tools":[...]}}
→ {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_docs","arguments":{"query":"foo"}}}
← {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text","text":"..."}]}}
```

**Client config examples:**

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

**When to use MCP vs the CLI:**
- Use **MCP** when the host is MCP-aware and you want structured responses (search returns file+line, read_doc returns clean text). Less pipe-parsing.
- Use **CLI** when you just need to run `build` / `validate` once. Cheaper to spawn, no protocol overhead.

## 5. Quick config cheat-sheet

Minimal `docmd.config.json`:

```jsonc
{
  "title": "My Docs",            // site name (browser tab, nav, SEO)
  "url":  "https://docs.example.com", // REQUIRED for sitemap, canonical, og:* tags
  "src":  "docs",                // source folder
  "out":  "site"                 // output folder
}
```

That is enough for a working site. Common additions:

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

Full schema (every key, every default): [references/config.md](./references/config.md).

**Frontmatter on each `.md` file** (strongly recommended):

```yaml
---
title: "Page Title"          # HTML <title>, nav label
description: "SEO summary"   # meta description
order: 1                     # sidebar ordering (lower = higher)
noindex: false               # true to exclude from search + sitemap
llms: true                   # false to exclude from llms.txt
---
```

Full frontmatter reference (every field including `seo.canonicalUrl`, `bodyClass`, `components.*`): [references/formatting.md#frontmatter](./references/formatting.md#frontmatter).

## 6. Markdown extensions you'll use a lot

docmd-flavored markdown adds containers and tabs on top of CommonMark. Top 5 by frequency:

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

Full container catalog (steps, grids, hero, changelog, collapsible, tag, embed): [references/formatting.md](./references/formatting.md).

## 7. Known papercuts (read this before filing bugs)

These are real behaviors observed in 0.8.6 — not bugs to fix, but things to be aware of so you don't burn cycles on them:

1. **Attribution comment is injected into every HTML page.** Look for `<!-- [docmd-source] - Please do not remove this header. -->` at the top of every output file. Removing it is not supported and may break upgrades.
4. **`docmd dev` auto-increments the port.** If 3000 is busy, it picks 3001, 3002, etc. Watch the actual log line for the chosen port rather than assuming 3000.
5. **`autoTitleFromH1` requires the first `# H1` to exist.** Pages with no `# H1` and no `title:` frontmatter get a generic title.
6. **`docmd add` auto-installs via the detected package manager** (pnpm → yarn → bun → npm). If the user wants npm but a `pnpm-lock.yaml` exists from a stale branch, it'll use pnpm. Delete stray lockfiles first.
7. **No `dist/` alias.** The CLI uses `site/` as the output dir by default (matches Docusaurus); some other tools use `dist/` or `public/`. Don't grep for `dist/` in a fresh docmd project — look in `site/`. Or set `out` in docmd.config.json for custom output directory.

## 8. When to read each reference file

| You need to… | Read |
| --- | --- |
| Look up a CLI flag or command | [references/cli.md](./references/cli.md) |
| Add or tune a config key | [references/config.md](./references/config.md) |
| Write a doc page (frontmatter, containers, tabs) | [references/formatting.md](./references/formatting.md) |
| Enable/configure a plugin (search, git, seo, llms, etc.) | [references/plugins.md](./references/plugins.md) |
| Build a custom plugin | [references/plugin-development.md](./references/plugin-development.md) |
| Validate links in CI | [references/validation.md](./references/validation.md) |
| Multi-project monorepo | [references/workspaces.md](./references/workspaces.md) |
| Pick JS vs Rust build engine | [references/engines.md](./references/engines.md) |
| Programmatic Node/Browser integration | [references/api.md](./references/api.md) |
| Migrate from Docusaurus / MkDocs / VitePress | [references/migration.md](./references/migration.md) |
| Generate deploy configs (Docker, nginx, Vercel, etc.) | [references/deployment.md](./references/deployment.md) |

## 9. Recommended workflow for agents

1. **Pre-flight**: run `npx @docmd/core --version` (§0). If it fails, fix the environment first.
2. **Orient**: read §1, §2, §3 of this file. Skim §7 (papercuts) — saves debugging time later.
3. **Read on demand**: pick the reference file from §8 only for the part of the task at hand. Don't pre-load all 11.
4. **Build small → validate → build larger**: scaffold → first page → `build` → `validate` → add more pages. Don't write 20 pages and then build once.
5. **Use MCP when you have it**: if the host is MCP-capable, `search_docs` and `read_doc` beat shelling out to `cat` + `grep` over and over.
6. **Trust `validate`, not the build**: a green build doesn't mean links work. Always run `validate` before declaring done.

## 10. Support & upstream

- Project repo: <https://github.com/docmd-io/docmd>
- Full docs: <https://docs.docmd.io>
- LLM-friendly full context: <https://docs.docmd.io/llms-full.txt>
- Issues: <https://github.com/docmd-io/docmd/issues>
- This skill repo: <https://github.com/docmd-io/docmd-skills>

If something in this skill contradicts the official docs, **the official docs win** — file an issue or PR against this repo to fix the drift.
