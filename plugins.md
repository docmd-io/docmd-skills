# docmd Plugins Reference
> Full docs: [Using Plugins](https://docs.docmd.io/plugins/usage/) · [Building Plugins](https://docs.docmd.io/plugins/building-plugins/)

Plugins are declared in `docmd.config.json` under `"plugins": { ... }`.
Official shorthand names (e.g. `"search"`) resolve to `@docmd/plugin-<name>`. Third-party plugins use their full npm package name.

## Search
> Full docs: [Search Plugin](https://docs.docmd.io/plugins/search/)

```jsonc
"search": {
  // Keyword search is always enabled. These options control the UI and semantic mode.
  "semantic": false,            // (default: false) Enable vector-based semantic search. Requires `docmd-search` package.
  "model": "Xenova/all-MiniLM-L6-v2", // (default) Embedding model. Only used when semantic=true. See docs for multilingual models.
  "include": ["**/*.md"],       // (default: all .md files) Glob patterns for files to index
  "exclude": ["**/.git/**"],    // (default: .git) Glob patterns to exclude from indexing
  "showConfidence": false,      // (default: false) Show similarity % badges in semantic results
  "showFilters": true,          // (default: true) Show version filter bar above results
  "chunkSize": 512,             // (default: 512) Max characters per semantic chunk
  "chunkOverlap": 50,           // (default: 50) Overlap between chunks for context continuity
  "enabled": true,              // (default: true) Master toggle for the search indexer
  "placeholder": "Search...",   // (default: "Search...") Custom input placeholder text
  "maxResults": 10              // (default: 10) Max results in modal
}
```
- Keyboard shortcut: `/` or `Ctrl+K` opens search modal
- Uses [MiniSearch](https://github.com/lucaong/minisearch) for keyword search (client-side, offline, zero-config)
- Semantic search uses local embeddings — 100% private, no data sent to servers
- Exclude pages from search with `noindex: true` in frontmatter
- CJK/Thai/Lao/Khmer/Burmese/Tibetan scripts are auto-tokenized per-character

## Git
```jsonc
"git": {
  "repo": "https://github.com/user/repo", // Git remote URL — enables "Edit this page" links
  "branch": "main",            // (default: "main") Branch for edit links
  "editLink": true,            // (default: true) Show "Edit this page" link on each page
  "lastUpdated": true,         // (default: true) Show last-modified timestamp from git log
  "commitHistory": true,       // (default: true) Render commit history list per page
  "maxCommits": 5,             // (default: 5) Max commits to show per page
  "dateFormat": "relative"     // (default: "relative") "relative" = "2 days ago", "absolute" = "2026-06-05"
}
```
- Auto-disables if project is not a git repository
- No configuration required for basic last-updated timestamps

## SEO
```jsonc
"seo": {
  "titleTemplate": "%s | Docs", // (default: "%s") Format for HTML <title>. %s = page title.
  "description": "Fallback",    // (default: from root config) Fallback meta description
  "ogImage": "/assets/og.png",  // Social share preview image path
  "aiBots": true                // (default: true) Set false to add robots meta blocking AI crawlers
}
```
- Per-page overrides in frontmatter: `seo.image`, `seo.canonicalUrl`, `seo.aiBots`

## Analytics
```jsonc
"analytics": {
  "provider": "google",         // "google", "plausible", or "custom"
  "id": "G-XXXXXXXXXX",        // Tracking/measurement ID
  // OR for Google Analytics v4 specifically:
  "googleV4": { "measurementId": "G-XXXXXXXXXX" }
}
```
- If search plugin is enabled, search keywords are auto-captured by analytics

## Sitemap
```jsonc
"sitemap": {
  "url": "https://docs.myproject.com" // Required: canonical root URL for sitemap links
}
```
- Also requires `url` in root config. Skipped if missing.

## OpenAPI
```jsonc
"openapi": {
  "info": true,                 // (default: true) Render spec info block (title, version, description)
  "collapsible": true,          // (default: true) Make endpoint paths collapsible
  "download": true              // (default: true) Show spec download link
}
```

## Mermaid
```jsonc
"mermaid": {
  "theme": "default"            // Options: "default", "forest", "dark", "neutral"
}
```

## Math (KaTeX)
```jsonc
"math": {
  "katex": {}                   // KaTeX configuration object. See https://katex.org/docs/options.html
}
```
- Optional plugin — install with `docmd add math`
- Renders `$inline$` and `$$block$$` LaTeX expressions

## LLMs
```jsonc
"llms": {}                      // No config needed. Generates llms.txt and llms-full.txt at build time.
```
- `llms.txt` = short summary with page links
- `llms-full.txt` = full content of all pages, optimised for LLM context windows
- Exclude pages with `llms: false` in frontmatter

## PWA
```jsonc
"pwa": {
  "enabled": true,              // (default: true) Generate service worker for offline access
  "name": "My Documentation",  // PWA application title
  "shortName": "Docs"          // PWA launcher name
}
```
- Optional plugin — install with `docmd add pwa`

## Threads
```jsonc
"threads": {
  "comments": true,             // (default: true) Enable inline discussion threads
  "storage": "local"            // (default: "local") "local" = markdown-stored, or backend database
}
```
- Optional plugin — install with `docmd add threads`

## Plugin Resolution & Safety
- Official shorthands (`search`, `math`, `git`) → `@docmd/plugin-<name>`
- Third-party → use full npm package name (e.g. `my-docmd-plugin` or `@myorg/docmd-extras`)
- Auto-install: adding an official plugin to config auto-installs it on next build
- **Isolation**: broken plugins cannot crash the build — errors are caught and logged
- **Capability enforcement**: plugins can only use hooks they declare in `capabilities`

See [plugin-development.md](./plugin-development.md) for building custom plugins.