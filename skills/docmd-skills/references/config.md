---
description: Complete configuration schema for docmd.config.json / .jsonc / .ts / .js. Covers core settings, static root assets (public/), exclude globs, theme & template, layout, Focus Mode, print & copy widgets, 7-position banners, cookie consent, security.html, markdown options, i18n, versions, serve, and plugins.
when_to_use: |
  Read this file when you are:
  - Setting up or editing `docmd.config.json` (`.jsonc`, `.ts`, `.js`)
  - Configuring `public/` static root assets (`static`), file exclusions (`exclude`), or the build engine (`js`, `rust`, `python`)
  - Configuring UI zones (`layout.header`, `sidebar`, `optionsMenu`, `focusMode`, `print`, `copyWidgets`, `titleSeparator`, `titleAppend`, `footer`)
  - Setting up multi-position announcements or sponsor cards (`layout.banners` across 7 positions)
  - Configuring `security.html`, `markdown.linkify`, `markdown.typographer`, `markdown.linkifyDefaultScheme`, `cookieConsent`, or `serve`
audience: user
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Configuration Reference

Full docs:
* General Configuration — https://docs.docmd.io/configuration/overview
* Layout & UI Zones — https://docs.docmd.io/configuration/layout-ui
* Site Banners — https://docs.docmd.io/configuration/site-banner
* Security & HTML Policy — https://docs.docmd.io/configuration/security

Supported config files: `docmd.config.json`, `docmd.config.jsonc` (comments and trailing commas supported), `docmd.config.ts`, and `docmd.config.js`.

## Zero-Config Mode {#zero-config}

Without a config file, docmd auto-detects markdown sources from `docs/`, `src/docs/`, `documentation/`, or the current directory, and sets up navigation, titles, search, TOC, and `public/` root asset copying automatically.

## Core Top-Level Settings {#core-settings}

| Key | Type | Default | Description |
|:--|:--|:--|:--|
| `title` | `string` | `"Documentation"` | Site name — displayed in nav header, browser `<title>`, and SEO metadata |
| `description` | `string` | — | Fallback meta description for pages without frontmatter `description` |
| `url` | `string` | `""` | Canonical production URL (e.g. `"https://docs.example.com"`). Required for sitemap, canonical links, and OpenGraph |
| `src` | `string` | `"docs"` | Relative path to source Markdown/MDX directory |
| `out` | `string` | `"site"` | Relative path for compiled static output |
| `base` | `string` | `"/"` | Root URL base path for subpath hosting (e.g. `"/docs/"`) |
| `static` | `string \| string[] \| boolean` | `undefined` (auto `public/`) | Public static root assets pipeline (new in 0.10.0). Automatically copies top-level `public/` contents directly to the output root (`robots.txt`, `CNAME`, `.well-known/*`, `favicon.ico`). Pass custom path(s) or `false` to disable |
| `exclude` | `string[]` | `[]` | Gitignore-style glob patterns excluded from build, link validation, and MCP tools (e.g. `["drafts/**", "archive/*.md"]`). Note: `.gitignore` is also honoured automatically |
| `engine` | `'js' \| 'rust' \| 'python'` | `'js'` | Build engine: `'js'` (default), `'rust'` (`@docmd/engine-rust`), or `'python'` (`@docmd/engine-python`) |
| `tmp` | `string` | `null` | Custom temp/cache directory for intermediate build files |
| `favicon` | `string` | — | Path to site favicon (e.g. `"assets/favicon.ico"`) |
| `minify` | `boolean` | `true` | Minify compiled HTML, CSS, and JS |
| `autoTitleFromH1` | `boolean` | `true` | Use the page's first `# H1` as title when frontmatter `title` is omitted |
| `variables` | `object \| string` | `{}` | Build-time and reactive client variables (or path to `./data/variables.json` / `.js`). See [variables.md](./variables.md) |
| `templates` | `Record<string, string>` | `{}` | Per-section glob-to-template map (e.g. `{ "blog/*": "summer" }`) |
| `plugins` | `Record<string, any>` | `{}` | Plugin configuration map. See [plugins.md](./plugins.md) |
| `serve` | `object` | `{ host: "127.0.0.1", port: 3000 }` | Production HTTP server config for `docmd serve`. See [deployment.md](./deployment.md#production-server-docmd-serve) |

> **Pre-render variable interpolation:** `docmd` interpolates `{{ variable }}` tokens inside config strings (such as `layout.banners.*.content`, `layout.footer.content`, `footer.copyright`, `title`) before rendering templates. See [variables.md](./variables.md).

## Logo & Theme (`logo`, `theme`) {#logo-and-theme}

```jsonc "docmd.config.json"
{
  "logo": {
    "light": "assets/images/logo-dark.png",  // Used on light background
    "dark": "assets/images/logo-light.png",  // Used on dark background
    "href": "/",                              // Internal path or external URL (bypasses SPA router if external)
    "alt": "Company Logo",
    "height": "32px"
  },
  "theme": {
    "name": "default",        // "default", "sky", "ruby", etc., or "summer" (auto-promotes to theme.template)
    "template": "summer",     // Optional explicit template package ("default" or "summer" / "@docmd/template-*")
    "appearance": "system",   // "light" | "dark" | "system" (default: "system")
    "default": "light",       // Fallback when appearance is "system"
    "codeHighlight": true,
    "colors": {
      "primary": "#3b82f6",
      "background": "#ffffff"
    },
    "customCss": ["/assets/css/custom.css"], // Loaded at priority 15 (overrides default template priority 10)
    "customJs": ["/assets/js/custom.js"]
  }
}
```

## Layout, Focus Mode, Copy Widgets & Multi-Position Banners (`layout`) {#layout}

```jsonc "docmd.config.json"
{
  "layout": {
    "spa": true,                  // Instant client-side SPA routing (default: true)
    "titleSeparator": "-",        // Delimiter between page title and site title (formatted as " - ")
    "titleAppend": true,          // Append site title to <title> (can override per-page in frontmatter)
    "focusMode": false,           // Enable distraction-free Zen Mode toggle & Alt+F shortcut
    "print": false,               // Show Print button in article action bar & Focus Mode toolbar
    "copyCode": true,             // Show Copy button on fenced code blocks
    "pageNavigation": true,       // Show Previous / Next page links at bottom of articles
    "breadcrumbs": true,          // Show hierarchical breadcrumbs above article title
    "copyWidgets": {
      "enabled": true,            // Action bar above article content
      "raw": true,                // "Copy Markdown" button
      "context": true             // "Copy Context" button (formatted for LLMs)
    },
    "header": {
      "enabled": true
    },
    "sidebar": {
      "collapsible": true,
      "defaultCollapsed": false
    },
    "optionsMenu": {
      "position": "header",       // "header" | "sidebar-top" | "sidebar-bottom"
      "components": {
        "search": true,
        "themeSwitch": true,
        "focusMode": true,
        "sponsor": "https://github.com/sponsors/docmd-io"
      }
    },
    "footer": {
      "style": "complete",        // "minimal" | "complete"
      "content": "© {{ docmd.buildYear }} My Project.",
      "description": "Documentation built with docmd.",
      "branding": true,
      "columns": [
        {
          "title": "Resources",
          "links": [{ "text": "GitHub", "url": "https://github.com/docmd-io/docmd" }]
        }
      ]
    }
  }
}
```

### Multi-Position Banners (`layout.banners` & `layout.banner`) {#banners}

Configure up to **7 banner positions**. Top/header bars default to `dismissible: true` (`sessionStorage`); sidebar and TOC cards default to persistent (`dismissible: false`):

| Position | Style | Default `dismissible` | Placement |
|:--|:--|:--|:--|
| `top` | Bar | `true` | Full-width bar at top of viewport (`layout.banner` is shorthand for `layout.banners.top`) |
| `header` | Bar | `true` | Bar inside/under the page header |
| `sidebar-top` | Card | `false` | Compact card pinned to top of left navigation sidebar |
| `sidebar-bottom` | Card | `false` | Compact card pinned to bottom of left navigation sidebar |
| `toc-top` | Card | `false` | Compact card pinned to top of right-hand TOC rail |
| `toc-bottom` | Card | `false` | Compact card pinned to bottom of right-hand TOC rail |
| `footer` | Bar | `false` | Wide banner directly above the page footer |

```jsonc "docmd.config.json"
{
  "layout": {
    "banners": {
      "top": {
        "content": "**v{{ docmd.version }} is live!** Explore the new features.",
        "type": "announcement", // "info" | "success" | "warning" | "danger" | "announcement"
        "icon": "sparkles",
        "dismissible": true,    // Aliases: dismissable, closable
        "link": { "text": "Release Notes", "url": "/release-notes/" }
      },
      "toc-top": {
        "image": "/assets/sponsor.png",
        "alt": "Sponsor",
        "content": "**Support open source**",
        "link": { "text": "Sponsor", "url": "https://github.com/sponsors/docmd-io" }
      }
    }
  }
}
```

Suppress banners on a specific page by setting `banner: null` in page frontmatter.

## Markdown & Security Policies (`markdown`, `security`, `cookieConsent`) {#markdown-and-security}

```jsonc "docmd.config.json"
{
  "markdown": {
    "breaks": true,                   // Convert single newlines to <br> (set false for 80-col wrapped prose)
    "linkify": true,                  // Auto-convert bare URLs/domains into links (set false to disable)
    "typographer": true,              // Smart quotes and dashes (set false to keep verbatim)
    "linkifyDefaultScheme": "https"   // "https" (default) or "http" for bare-domain autolinks
  },
  "security": {
    "html": "allow",                  // "allow" (default) | "escape" | "strip" (legacy alias: htmlPolicy)
    "strictLinkSanitizing": true,
    "allowedIframeHosts": ["youtube.com", "vimeo.com", "codesandbox.io"]
  },
  "cookieConsent": {
    "enabled": true,
    "message": "We use cookies to improve documentation analytics.",
    "acceptText": "Accept",
    "declineText": "Decline",
    "policyUrl": "/privacy/"
  }
}
```

## Navigation (`navigation` or `navigation.json`) {#navigation}

Navigation can live inline in `docmd.config.json` or in a per-locale/per-version `navigation.json` file:

```jsonc "docmd.config.json"
{
  "navigation": [
    { "title": "Quick Start", "path": "/", "icon": "zap" },
    {
      "title": "Guides",
      "icon": "book-open",
      "collapsible": true,
      "children": [
        { "title": "Installation", "path": "/getting-started/installation" },
        { "title": "Configuration", "path": "/configuration/overview" }
      ]
    },
    { "title": "GitHub", "href": "https://github.com/docmd-io/docmd", "icon": "github", "external": true }
  ]
}
```

## Internationalisation (`i18n`) & Versioning (`versions`) {#i18n-and-versions}

Built-in UI strings ship for **10 languages**: `en`, `es`, `fr`, `de`, `ja`, `zh`, `hi`, `ko`, `ru`, `tr` (plus automatic `dir="rtl"` on `<html>` for `ar`, `he`, `fa`).

```jsonc "docmd.config.json"
{
  "i18n": {
    "default": "en",
    "locales": [
      { "id": "en", "label": "English" },
      { "id": "de", "label": "Deutsch" },
      { "id": "tr", "label": "Türkçe" }
    ]
  },
  "versions": {
    "current": "v10",
    "position": "sidebar-top",
    "all": [
      { "id": "v10", "dir": "docs/v10", "label": "v0.10 (Latest)" },
      {
        "id": "v09",
        "dir": "docs/v09",
        "label": "v0.9",
        "banners": {
          "top": { "content": "You are viewing v0.9 docs.", "type": "warning", "dismissible": false }
        }
      }
    ]
  }
}
```

## Production Server (`serve`) {#serve-config}

Used only by `npx @docmd/core serve` (ignored by `build` and `dev`):

```jsonc "docmd.config.json"
{
  "serve": {
    "host": "127.0.0.1",
    "port": 3000,
    "actions": {
      "enabled": false,
      "origins": ["https://docs.example.com"],
      "identityHeader": "x-auth-request-email"
    },
    "mcp": {
      "enabled": false,
      "origins": []
    }
  }
}
```

## Legacy Key Auto-Mapping (Backwards Compatibility) {#backwards-compatibility}

`normalizeConfig()` automatically maps legacy keys without breaking builds (run `npx @docmd/core migrate --upgrade` to rewrite them in place):
- `siteTitle` → `title`, `siteUrl` / `baseUrl` → `url`, `srcDir` / `source` → `src`, `outputDir` → `out`
- Root `customCss` / `customJs` → `theme.customCss` / `theme.customJs`
- Root `htmlPolicy` or `security.htmlPolicy` → `security.html`
- Root `focusMode`, `print`, `copyCode`, `pageNavigation` → `layout.*`

## See Also {#see-also}

- [variables.md](./variables.md) — `variables` block and `{{ ... }}` interpolation inside config and markdown
- [plugins.md](./plugins.md) — configuring all 12 built-in and 4 optional plugins
- [deployment.md](./deployment.md) — `serve`, `static` (`public/`), and hosting providers
- [cli.md](./cli.md) — CLI flags and environment variables