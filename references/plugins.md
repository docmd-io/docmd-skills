---
description: Reference for built-in docmd plugins and their configuration. Use when configuring plugins or understanding plugin capabilities.
when_to_use: |
  Read this file when you are:
  - Enabling a built-in plugin (search, git, seo, llms, mermaid, math, pwa, threads, analytics, sitemap, openapi)
  - Deciding between keyword search and semantic search
  - Configuring per-plugin options
  - Choosing between the shorthand `plugins.<name>` form and the full package name form
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-15
---

# Plugins Reference

Plugins are declared in `docmd.config.json` under `"plugins": { ... }`.

Official shorthands (e.g. `"search"`) resolve to `@docmd/plugin-<name>`. Third-party plugins use their full npm package name.

Full docs:
* Using Plugins - https://docs.docmd.io/plugins/usage/
* Building Plugins - https://docs.docmd.io/plugins/building-plugins/

## Plugin Resolution {#plugin-resolution}

- Official shorthands (`search`, `math`, `git`) → `@docmd/plugin-<name>`
- Third-party → use full npm package name (e.g. `my-docmd-plugin` or `@myorg/docmd-extras`)
- Auto-install: adding an official plugin to config can auto-install it on next build
- Isolation: broken plugins cannot crash the build — errors are caught and logged
- Capability enforcement: plugins can only use hooks they declare in `capabilities`

Note: shorthand `seo` is built-in, but shorthand `math` requires `docmd add math` first. The asymmetry is intentional.

## Built-In Plugins {#built-in-plugins}

### Search {#search}

Full docs: Search Plugin - https://docs.docmd.io/plugins/search/

```jsonc
"search": {
  "semantic": false,            // Enable vector-based semantic search (requires docmd-search)
  "model": "Xenova/all-MiniLM-L6-v2", // Embedding model (semantic mode)
  "include": ["**/*.md"],       // Glob patterns to index
  "exclude": ["**/.git/**"],    // Glob patterns to exclude
  "showConfidence": false,      // Show similarity % badges (semantic mode)
  "showFilters": true,          // Show version filter bar
  "chunkSize": 512,             // Max chars per semantic chunk
  "chunkOverlap": 50,           // Chunk overlap for context
  "enabled": true,              // Master toggle
  "placeholder": "Search...",   // Input placeholder
  "maxResults": 10              // Max results in modal
}
```

Features:
- Keyboard: `/` or `Ctrl+K`
- Keyword: [MiniSearch](https://github.com/lucaong/minisearch) (client-side, offline)
- Semantic: Local embeddings — 100% private, no server calls
- Exclude pages: `noindex: true` in frontmatter
- CJK support: Auto-tokenized per-character

Semantic Search (docmd-search):

Install for vector-based semantic search:
```bash
npm install docmd-search
```

Or run standalone on any folder:
```bash
npx docmd-search ./docs  # Instant semantic search
```

`semantic: true` requires `docmd-search` to be installed; otherwise the plugin falls back to keyword search silently.

### Git {#git}

```jsonc
"git": {
  "repo": "https://github.com/user/repo", // Git remote URL — enables "Edit this page" links
  "branch": "main",            // (default: "main") Branch for edit links
  "editLink": true,            // (default: true) Show "Edit this page" link
  "lastUpdated": true,         // (default: true) Show last-modified timestamp
  "commitHistory": true,       // (default: true) Render commit history list per page
  "maxCommits": 5,             // (default: 5) Max commits to show per page
  "dateFormat": "relative"     // (default: "relative") "relative" = "2 days ago", "absolute" = "2026-06-05"
}
```

Features:
- Auto-disables if project is not a git repository
- No configuration required for basic last-updated timestamps

### SEO {#seo}

```jsonc
"seo": {
  "titleTemplate": "%s | Docs", // (default: "%s") Format for HTML <title>. %s = page title
  "description": "Fallback",    // (default: from root config) Fallback meta description
  "ogImage": "/assets/og.png",  // Social share preview image path
  "aiBots": true                // (default: true) Set false to block AI crawlers
}
```

Per-page overrides in frontmatter:
- `seo.image`
- `seo.canonicalUrl`
- `seo.aiBots`

### Analytics {#analytics}

```jsonc
"analytics": {
  "provider": "google",         // "google", "plausible", or "custom"
  "id": "G-XXXXXXXXXX"         // Tracking/measurement ID
}
```

Or for Google Analytics v4 specifically:

```jsonc
"analytics": {
  "googleV4": {
    "measurementId": "G-XXXXXXXXXX"
  }
}
```

### Sitemap {#sitemap}

```jsonc
"sitemap": {
  "url": "https://docs.myproject.com" // Required: canonical root URL
}
```

Requirements:
- Also requires `url` in root config
- Skipped if missing

`plugins.sitemap.url` is a separate key from the root `url`; they are usually the same value. The root `url` is used for canonical links; `plugins.sitemap.url` is used as the `<loc>` prefix.

### OpenAPI {#openapi}

```jsonc
"openapi": {
  "info": true,                 // (default: true) Render spec info block
  "collapsible": true,          // (default: true) Make endpoint paths collapsible
  "download": true              // (default: true) Show spec download link
}
```

### Mermaid {#mermaid}

```jsonc
"mermaid": {
  "theme": "default"            // Options: "default", "forest", "dark", "neutral"
}
```

`mermaid` fenced code blocks only render if the Mermaid plugin is enabled. There is no inline fallback.

### Math (KaTeX) {#math}

```jsonc
"math": {
  "katex": {}                   // KaTeX configuration object. See https://katex.org/docs/options.html
}
```

- Optional plugin — install with `docmd add math`
- Renders `$inline$` and `$$block$$` LaTeX expressions

### LLMs {#llms}

```jsonc
"llms": {}  // No config needed
```

- `llms.txt` = short summary with page links
- `llms-full.txt` = full content of all pages, optimised for LLM context windows
- Exclude pages with `llms: false` in frontmatter

### PWA {#pwa}

```jsonc
"pwa": {
  "enabled": true,              // (default: true) Generate service worker
  "name": "My Documentation",  // PWA application title
  "shortName": "Docs"          // PWA launcher name
}
```

- Optional plugin — install with `docmd add pwa`
- Enables offline access

### Threads {#threads}

```jsonc
"threads": {
  "comments": true,             // (default: true) Enable inline discussion threads
  "storage": "local"            // (default: "local") "local" = markdown-stored, or backend database
}
```

- Optional plugin — install with `docmd add threads`

## Plugin Management {#plugin-management}

### Install Plugin {#install-plugin}

```bash
docmd add search
docmd add math
docmd add threads
```

### Remove Plugin {#remove-plugin}

```bash
docmd remove threads
```

### Manual Configuration {#manual-configuration}

Add to `docmd.config.json`:

```jsonc
{
  "plugins": {
    "search": {},
    "git": {
      "repo": "https://github.com/user/repo"
    }
  }
}
```

## Third-Party Plugins {#third-party-plugins}

Use full npm package name:

```jsonc
{
  "plugins": {
    "my-custom-plugin": {},
    "@myorg/docmd-extras": {
      "option": "value"
    }
  }
}
```

Third-party plugins are not auto-installed; you must `npm install` them yourself.

## See Also {#see-also}

- [SKILL.md §4](../SKILL.md#4-mcp-server) — the 4 MCP tools use plugins under the hood
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [plugin-development.md](./plugin-development.md) — build your own plugin
- [api.md](./api.md) — `loadPlugins`, capabilities, action handlers
- [config.md#plugins-config](./config.md#plugins-config) — site-level config pair
