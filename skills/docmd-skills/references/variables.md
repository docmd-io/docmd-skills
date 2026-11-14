---
description: Reference for the docmd Variables & Personalisation Engine (v0.9.9+). Covers {{ variable || "fallback" }} template syntax, built-in system/Git/page variables, config & external variable files, environment variables (env.* and DOCMD_VAR_*), and client-side reactive personalisation (user.* and window.docmd.var).
when_to_use: |
  Read this file when you are:
  - Replacing hardcoded versions, copyright years, Git branches/commits, or URLs with `{{ variable }}` tokens
  - Defining project variables in `docmd.config.json` (`variables` block or external `.json`/`.js` file)
  - Interpolating variables inside `docmd.config.json` fields (`footer.copyright`, `layout.banners.top.content`)
  - Injecting CI/CD environment variables (`{{ env.VAR }}` or `DOCMD_VAR_*` zero-prefix promotion)
  - Building interactive personalised docs with reactive session variables (`{{ user.apiKey }}` and `window.docmd.var.set()`)
audience: user
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Variables & Personalisation Engine Reference

Full docs:
* Variables Overview — https://docs.docmd.io/variables/overview
* Built-in Variables — https://docs.docmd.io/variables/built-in-variables
* Config & Custom Variables — https://docs.docmd.io/variables/config-variables
* Environment Variables — https://docs.docmd.io/variables/environment-variables
* Client Runtime & Personalisation — https://docs.docmd.io/variables/runtime-personalisation

## 1. Template Syntax, Fallbacks & Escaping {#syntax}

Use double curly braces in Markdown, MDX, or `docmd.config.json` strings:

```markdown
Welcome to **{{ site.title }}** (compiled with docmd v{{ docmd.version }})!
Connect to `{{ cloud.apiEndpoint || "https://api.example.com" }}`.
```

- **Fallback operator (`||`)**: Supports single-quoted strings (`'Guest'`), double-quoted strings (`"https://..."`), numbers (`8080`), or identifiers.
- **Escaping**: Prefix with a backslash (`\{{ variableName }}`) to render literal curly braces without evaluating the token (essential when documenting variable syntax itself).

## 2. Built-in Zero-Config Variables {#built-in-variables}

Registered automatically on every build without any configuration:

| Variable | Alias | Example Value | Description |
|:--|:--|:--|:--|
| `docmd.version` | `DOCMD_VERSION` | `0.10.0` | Active `@docmd/core` compiler version |
| `docmd.buildYear` | `BUILD_YEAR` | `2026` | 4-digit calendar year of the build |
| `docmd.buildDate` | `BUILD_DATE` | `2026-11-14` | ISO calendar date (`YYYY-MM-DD`) |
| `docmd.buildTime` | `BUILD_TIME` | `2026-11-14T08:00:00Z` | Full ISO 8601 UTC timestamp |
| `docmd.gitCommit` | `git.commit`, `GIT_COMMIT` | `7a9b1c2` | 7-character short SHA of `HEAD` (when in a Git repo) |
| `docmd.gitBranch` | `git.branch`, `GIT_BRANCH` | `main` | Active Git branch name |
| `site.title` | — | `Acme Docs` | `title` from `docmd.config.json` |
| `site.base` | — | `/` | `base` path from `docmd.config.json` |
| `page.title` | — | `Quick Start` | Current page title (frontmatter `title` or first `# H1`) |
| `page.slug` | — | `getting-started/quick-start` | Clean page slug without extension |
| `page.path` | — | `getting-started/quick-start.md` | Relative source markdown file path |

> **Namespace rule:** `docmd.*`, `site.*`, `page.*`, and `git.*` are reserved for compiler metadata. User-defined variables in `docmd.config.json` are referenced directly **without** a `docmd.` prefix (e.g. `{{ apiEndpoint }}` or `{{ cloud.region }}`).

## 3. Config & External Variables (`variables`) {#config-variables}

### Inline in `docmd.config.json` {#inline-config}

```json "docmd.config.json"
{
  "title": "Acme Cloud Docs",
  "variables": {
    "companyName": "Acme Technologies",
    "supportEmail": "support@acme.com",
    "cloud": {
      "apiEndpoint": "https://api.acme.cloud/v2",
      "region": "eu-west-1"
    }
  },
  "layout": {
    "banners": {
      "top": {
        "content": "**docmd v{{ docmd.version }}** — {{ companyName }} ({{ cloud.region }})"
      }
    },
    "footer": {
      "content": "© {{ docmd.buildYear }} {{ companyName }}. All rights reserved."
    }
  }
}
```

### External JSON or JS Module {#external-variables}

Point `variables` to a file path relative to project root:

```json "docmd.config.json"
{
  "variables": "./data/variables.json"
  // or "./data/variables.js" exporting an object/function
}
```

## 4. Environment Variables (`env.*` & `DOCMD_VAR_*`) {#environment-variables}

1. **`env.<NAME>`**: Access any build-time environment variable via `{{ env.GITHUB_RUN_ID || 'local' }}`.
2. **`DOCMD_VAR_<NAME>` zero-prefix promotion**: Any environment variable prefixed with `DOCMD_VAR_` is automatically promoted to a top-level variable:
   ```bash
   export DOCMD_VAR_API_HOST="https://api.prod.internal"
   ```
   Use in Markdown as `{{ API_HOST }}` (or `{{ DOCMD_VAR_API_HOST }}`).

> **Security warning:** Build-time variables are baked into static HTML. Never put secret keys or private tokens in `variables` or `DOCMD_VAR_*`. For per-user tokens, use client runtime personalisation (`user.*`) below.

## 5. Client-Side Reactive Personalisation (`docmd-runtime.js`) {#runtime-personalisation}

Every template automatically bundles the headless `docmd-runtime.js` engine (`window.docmd`).
Variables prefixed with `user.` (e.g. `{{ user.apiKey || 'YOUR_API_KEY' }}`) or listed in `variables.dynamic` are emitted as reactive `<span data-docmd-var="...">` markers and live-updated across prose **and fenced code blocks** without page reloads.

```json "docmd.config.json"
{
  "variables": {
    "dynamic": ["user.name", "user.apiKey", "activeRegion"]
  }
}
```

### Browser SDK (`window.docmd.var`) {#browser-sdk}

```javascript
// Get any built-in, config, or dynamic variable (1:1 key match with Markdown)
const endpoint = window.docmd.var.get('cloud.apiEndpoint');
const apiKey   = window.docmd.var.get('user.apiKey');

// Update a single variable or batch of variables across DOM & code blocks
window.docmd.var.set('user.apiKey', 'sk_live_99882244');
window.docmd.var.set({
  'user.name': 'Ada Lovelace',
  'activeRegion': 'eu-central-1'
});

// List all registered dynamic variables
const all = window.docmd.var.list();

// Re-scan DOM after custom client-side injection (SPA router calls this automatically)
window.docmd.var.sync();

// Listen for variable updates
window.addEventListener('docmd:variable-change', (e) => {
  console.log(e.detail.key, e.detail.value);
});
```

### Cross-Frame Portal Synchronisation (`postMessage`) {#postmessage-sync}

When embedding a docmd site inside a developer portal `<iframe>`, push user session variables from the parent window:

```javascript
docsIframe.contentWindow.postMessage({
  type: 'docmd:set-variables',
  variables: {
    'user.name': 'Alex',
    'user.apiKey': 'sk_live_449911'
  }
}, '*');
```

All reactive DOM updates use `.textContent` exclusively, guaranteeing immunity to DOM XSS.

## See Also {#see-also}

- [config.md](./config.md) — `variables` in `docmd.config.json`
- [formatting.md](./formatting.md) — using `window.docmd.var` inside `::: playground` blocks
- [api-user.md](./api-user.md) — browser events and runtime APIs