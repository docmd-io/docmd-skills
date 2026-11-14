---
title: Plugins Reference
description: Configuration reference for all 12 core built-in plugins and 4 optional plugins in docmd 0.10.0, including OKF, AI, Playground, MDX, OpenAPI, and Threads.
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Plugins Reference

## 1. Plugin Architecture & Batch Pre-Flight Auto-Install

`docmd 0.10.0` divides official plugins into two tiers:

1. **12 Core Built-in Plugins** (ship pre-installed with `@docmd/core` — zero installation needed):
   `search`, `ai`, `seo`, `sitemap`, `analytics`, `llms`, `okf`, `mermaid`, `openapi`, `git`, `playground`, `mdx`
2. **4 Optional Plugins** (install on demand or automatically during build pre-flight):
   `math`, `pwa`, `threads`, `iconify`

### Batch Pre-Flight Auto-Install

When you reference any official optional plugin (`math`, `pwa`, `threads`, `iconify`), external template (`horizon`, `retro`, `glass`), native engine (`@docmd/engine-rust`), or semantic search peer dependency (`docmd-search`) in `docmd.config.js`, `docmd` detects all missing packages during pre-flight and installs them in a **single batched package-manager operation** (`pnpm` → `yarn` → `bun` → `npm`) before starting the build.

You can also manage optional plugins explicitly via the CLI:

```bash
npx @docmd/core add math pwa threads iconify
npx @docmd/core remove math
```

### Disabling Any Core Plugin

Every core plugin that runs by default (`search`, `seo`, `sitemap`, `llms`, `okf`, `mermaid`, `playground`, `mdx`) can be disabled in `docmd.config.js`:

```javascript
export default defineConfig({
  plugins: {
    okf: false,
    llms: false,
  },
});
```

---

## 2. Core Built-in Plugins (12)

### 1. `search` (`@docmd/plugin-search`)

Offline-first keyword (BM25 + fuzzy) search enabled by default, with optional neural semantic vector search powered by `docmd-search` (`all-MiniLM-L6-v2` quantized int8 embeddings):

```javascript
plugins: {
  search: {
    semantic: true,                       // Enable hybrid BM25 + neural vector search
    model: 'Xenova/all-MiniLM-L6-v2',     // Embedding model (cached locally after first build)
    showConfidence: true,                 // Show match score badge in search modal
    showFilters: true,                    // Show tag/type filter pills in search modal
    chunkSize: 500,                       // Characters per vector chunk
    chunkOverlap: 50,                     // Overlap between adjacent chunks
  },
}
```

- Exposes `window.docmdSearch.search(query, { mode: 'hybrid' | 'keyword' | 'semantic', limit: 10 })` in the browser.
- Emits `_docmd-search/search-index.json` (and quantized vector chunks when `semantic: true`).

---

### 2. `ai` (`@docmd/plugin-ai`)

Interactive AI assistant widget with autonomous browser tools (`get_site_structure`, `search_documentation`, `read_documentation_page`, `navigate_to_page`, `copy_code_snippet`) and multi-project workspace RAG support. Supports two operational modes:

#### Mode A — Managed docmd Cloud Relay (`projectId`)
Zero API keys in client code; streams via SSE from `docmd Cloud`:

```javascript
plugins: {
  ai: {
    projectId: 'proj_abc123',
    position: 'bottom-right',             // 'bottom-right' | 'bottom-left' | 'sidebar'
    greeting: 'Hi! Ask me anything about the docs.',
    placeholder: 'Ask a question...',
    suggestions: [
      'How do I configure variables?',
      'How do I run docmd serve in Docker?',
    ],
    allowExternalUrls: false,             // Allow AI agent to fetch external URLs
    contextLimit: 5,                      // Max RAG chunks injected per turn
    captcha: {
      provider: 'turnstile',              // 'turnstile' | 'recaptcha'
      siteKey: '0x4AAAAAA...',
    },
  },
}
```

#### Mode B — Self-Hosted / BYOK (`aiplug`)
Connect directly to OpenAI, Anthropic, Google Gemini, Groq, Ollama, or custom OpenAI-compatible endpoints:

```javascript
plugins: {
  ai: {
    provider: 'openai',                   // 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'custom'
    model: 'gpt-4o-mini',
    endpoint: 'https://api.example.com/v1', // Optional custom proxy endpoint
    systemPrompt: 'Answer strictly using the provided documentation context.',
    rateLimit: { maxRequests: 20, windowMs: 60000 },
    messageActions: { copy: true, feedback: true, regenerate: true },
  },
}
```

---

### 3. `seo` (`@docmd/plugin-seo`)

Generates Open Graph, Twitter Cards, canonical URLs, AI crawler directives, and automatic Schema.org JSON-LD (`Organization`, `WebSite`, `BreadcrumbList`, plus per-page frontmatter `ldJson`):

```javascript
plugins: {
  seo: {
    titleTemplate: '%s — Acme Docs',
    description: 'Official documentation for Acme Platform.',
    ogImage: '/assets/og-default.png',
    twitterHandle: '@acmedev',
    aiBots: true,                         // false adds noai/noimageai robots directives
    organization: {
      name: 'Acme Inc.',
      url: 'https://acme.example.com',
      logo: 'https://docs.acme.example.com/assets/logo.png',
    },
  },
}
```

---

### 4. `sitemap` (`@docmd/plugin-sitemap`)

Generates `sitemap.xml` at build time (automatically respects `noindex: true` and `i18n` locales):

```javascript
plugins: {
  sitemap: {
    hostname: 'https://docs.example.com', // Falls back to top-level siteUrl
    changefreq: 'weekly',
    priority: 0.8,
  },
}
```

---

### 5. `analytics` (`@docmd/plugin-analytics`)

Zero-cookie or provider-based telemetry with SPA navigation tracking:

```javascript
plugins: {
  analytics: {
    googleV4: { measurementId: 'G-XXXXXXXXXX' },
    plausible: { domain: 'docs.example.com' },
    umami: { websiteId: 'uuid-here', src: 'https://analytics.example.com/script.js' },
  },
}
```

---

### 6. `llms` (`@docmd/plugin-llms`)

Generates `/llms.txt` (structured index grouped by navigation section) and `/llms-full.txt` (complete concatenated documentation corpus) for AI coding assistants:

```javascript
plugins: {
  llms: {
    fullText: true,                       // Emit llms-full.txt alongside llms.txt
    prompt: 'Prefer @docmd/core v0.10.0 ESM APIs and explicit ::: /type container closers.',
    sections: true,                       // Group entries by top-level sidebar sections
  },
}
```

Exclude a single page from `llms.txt` while keeping it in search/sitemap by setting `llms: false` in frontmatter.

---

### 7. `okf` (`@docmd/plugin-okf`)

**Enabled by default in `v0.10.0`.** Compiles your documentation into an **Open Knowledge Framework (OKF)** machine-readable bundle inside `<outDir>/okf/`:

- `okf/okf.yaml` — Manifest of site metadata, concepts, versions, and entrypoints
- `okf/concepts/<slug>.md` — Normalised concept documents with merged `tags` + `keywords` and semantic `type`
- `okf/_meta/bundle.json` — Complete indexed knowledge bundle (plus dependency/link graph when `graph: true`)

```javascript
plugins: {
  okf: {
    enabled: true,                        // Default: true (set plugins.okf = false to disable)
    graph: true,                          // Emit inter-document link & concept relationship graph
    localeStrategy: 'default-only',       // 'default-only' | 'folders' (multi-locale OKF output)
    defaultType: 'concept',               // Fallback type when frontmatter `type` is omitted
  },
}
```

Per-page frontmatter control:
- `okf: false` — Exclude this page from the OKF bundle.
- `type: 'guide' | 'concept' | 'reference' | 'api' | 'runbook'` (or `okf: { type: 'guide' }`) — Classify the document inside `okf.yaml`.

---

### 8. `mermaid` (`@docmd/plugin-mermaid`)

Bundled locally via an offline IIFE build (works offline and over `file://` with zero external CDN requests):

```javascript
plugins: {
  mermaid: {
    theme: 'default',                     // Light mode Mermaid theme
    darkTheme: 'dark',                    // Dark mode Mermaid theme
    zoom: true,                           // Enable click-to-zoom modal globally
  },
}
```

---

### 9. `openapi` (`@docmd/plugin-openapi`)

Renders interactive OpenAPI 3.0 / 3.1 reference blocks with collapsible operations, parameter tables, schema validation constraints (`minLength`, `maxLength`, `minimum`, `maximum`, `pattern`, `enum`), and request/response payload examples.

Supports two authoring patterns inside any `.md` or `.mdx` page:

1. **External Spec File Reference** (resolves relative to current page, `src/`, or workspace root):
   ````markdown
   ```openapi
   ./specs/payments-v2.yaml
   ```
   ````
2. **Inline YAML or JSON Spec**:
   ````markdown
   ```openapi
   openapi: 3.0.3
   info:
     title: Users API
     version: 1.0.0
   paths:
     /users:
       get:
         summary: List users
         responses:
           '200':
             description: Successful response
   ```
   ````

Configuration in `docmd.config.js`:

```javascript
plugins: {
  openapi: {
    info: true,                           // Show API info header block
    collapsible: true,                    // Render endpoints as collapsible accordions
    download: true,                       // Show "Download OpenAPI Spec" button
  },
}
```

---

### 10. `git` (`@docmd/plugin-git`)

Extracts last-updated timestamps, contributor avatars, commit history, and "Edit this page" links using git history (accelerated by Rust/Python batch git log when available):

```javascript
plugins: {
  git: {
    repo: 'https://github.com/org/repo',
    branch: 'main',
    dir: 'docs',                          // Subdirectory within the git repository
    editLink: true,
    lastUpdated: true,
    commitHistory: true,
    maxCommits: 5,
    dateFormat: 'YYYY-MM-DD',
  },
}
```

---

### 11. `playground` (`@docmd/plugin-playground`)

Interactive code playground engine for `::: playground` and ```` ```js playground ```` blocks (see [Formatting & Containers §4](./formatting.md#4-interactive-playgrounds--playground)):

```javascript
plugins: {
  playground: {
    enabled: true,                        // Default: true (0 KB overhead on pages without playgrounds)
    defaultLayout: 'stacked',             // 'stacked' | 'split'
  },
}
```

---

### 12. `mdx` (`@docmd/plugin-mdx`)

Zero-config JSX compilation powered by `@docmd/lite-mdx`. Enabled by default for `.mdx` and `.md` files (see [Formatting & Containers §8](./formatting.md#8-mdx-components-mdx--md)).

---

## 3. Optional Plugins (4)

Install via `npx @docmd/core add <name>` or simply declare in `docmd.config.js` (auto-installed during pre-flight).

### 1. `math` (`@docmd/plugin-math`)

Server-side KaTeX math rendering for inline `$E = mc^2$` and block `$$ ... $$` equations:

```javascript
plugins: {
  math: {
    strict: false,
    macros: { '\\RR': '\\mathbb{R}' },
  },
}
```

### 2. `pwa` (`@docmd/plugin-pwa`)

Generates a Web App Manifest (`manifest.webmanifest`) and offline Service Worker (`sw.js`):

```javascript
plugins: {
  pwa: {
    name: 'Acme Documentation',
    shortName: 'Acme Docs',
    themeColor: '#2563eb',
    backgroundColor: '#0f172a',
  },
}
```

### 3. `threads` (`@docmd/plugin-threads`)

Inline contextual discussion threads and review annotations stored directly in your repository (`src/.threads/`).

- **Live Server Requirement**: `threads` sets `requiresLiveServer: true`. Its interactive comment creation/reply UI activates automatically during `docmd dev` or under `docmd serve` when `serve.actions.enabled: true` is configured; on purely static builds (`docmd build`), it remains read-only or hidden unless `readonly: true` is configured.
- Features a sleek right-docked slide handle and inline comment count badges on annotated blocks.

```javascript
plugins: {
  threads: {
    author: 'Jane Doe',                   // Default author name in dev mode
    readonly: false,                      // Set true to display existing threads on static builds
  },
}
```

### 4. `iconify` (`@docmd/plugin-iconify`)

Build-time SVG resolver for 200,000+ Iconify icons (`icon:iconify:<set>:<name>`):

```javascript
plugins: {
  iconify: {
    defaultSet: 'mdi',                    // Optional fallback icon set
  },
}
```