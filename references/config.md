---
description: Complete configuration schema for docmd.config.json. Use when setting up or modifying docmd configuration.
when_to_use: |
  Read this file when you are:
  - Setting up `docmd.config.json` for the first time and need the full key set
  - Hunting for the right key to toggle a specific behavior (theme, layout, navigation, i18n, versions)
  - Looking up what a config key defaults to
  - Debugging why SEO, sitemap, or canonical URLs aren't being generated
  - Migrating from a non-standard config (see also [migration.md](./migration.md))
audience: user
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# Configuration Reference

The smallest valid config is three keys: `title`, `url`, and `src`. All other keys have defaults.

Full docs:
* Configuration - https://docs.docmd.io/configuration/overview

Configuration file: `docmd.config.json` (also supports `.js` and `.ts`)

## Zero-Config {#zero-config}

Without a config file, docmd auto-detects source from `docs/`, `src/docs/`, `documentation/`, or any `.md` folder. Navigation, titles, search, and TOC are set up automatically.

## Core Settings {#core-settings}

| Key | Type | Default | Description |
|:--|:--|:--|:--|
| `title` | String | `"Documentation"` | Site name — appears in nav, browser tabs, and SEO |
| `description` | String | — | Fallback meta description for pages without their own |
| `url` | String | — | Canonical production URL. Required for SEO, sitemap, and canonical links |
| `src` | String | `"docs"` | Relative path to source markdown directory |
| `out` | String | `"site"` | Relative path for compiled static output |
| `base` | String | `"/"` | Root base path for subfolder hosting (e.g. `/docs/`) |
| `engine` | String | `"js"` | Build engine: `"js"` (stable, default) or `"rust"` (native preview) |
| `tmp` | String | — | Custom temp/cache directory for intermediate build files |
| `favicon` | String | — | Path to favicon file |
| `minify` | Boolean | `true` | Compress output HTML/JS. Set `false` for debug builds |
| `autoTitleFromH1` | Boolean | `true` | When page has no `title` in frontmatter, use first `# H1` heading |
| `copyCode` | Boolean | `true` | Show "Copy" button on fenced code blocks |
| `pageNavigation` | Boolean | `true` | Show right-hand "On This Page" TOC sidebar |
| `markdown.breaks` | Boolean | `true` | Convert single newlines to `<br>`. Set `false` for 80-column-wrapped markdown |

Note: `url` is required for sitemap, canonical `<link>` tags, and `og:url`. If `url` is missing, the build succeeds but those values will be empty in the output. Set `url` even for local-only work (`"http://localhost:3000"`).

## Logo {#logo}

```jsonc
"logo": {
  "light": "assets/images/logo-dark.png",  // Logo for light mode
  "dark": "assets/images/logo-light.png",  // Logo for dark mode
  "href": "/",                              // Click destination
  "alt": "Logo",                            // Alt text
  "height": "32px"                          // CSS height
}
```

The keys are named by the background they sit on (not the logo color): `light` is the logo used against a light background.

## Layout {#layout}

```jsonc
"layout": {
  "spa": true,                  // (default: true) SPA navigation — instant page transitions
  "header": {
    "enabled": true
  },
  "sidebar": {
    "collapsible": true,        // (default: true) Allow sidebar sections to collapse
    "defaultCollapsed": false   // (default: false) Start collapsed
  },
  "optionsMenu": {
    "position": "header",       // "header" or "sidebar"
    "components": {
      "search": true,           // Show search button
      "themeSwitch": true,      // Show dark/light mode toggle
    }
  }
}
```

## Navigation {#navigation}

```jsonc
"navigation": [
  {
    "title": "Getting Started",
    "path": "/getting-started/"
  },
  {
    "title": "API Reference",
    "children": [
      { "title": "CLI", "path": "/api/cli/" },
      { "title": "Configuration", "path": "/api/config/" }
    ]
  },
  {
    "title": "External Link",
    "href": "https://github.com",
    "external": true
  }
]
```

Internal `path` values should start with `/`. External links use `href` plus `external: true`.

## Theme {#theme}

```jsonc
"theme": {
  "appearance": "system",  // "light", "dark", or "system" (default: "system")
  "default": "light",      // Fallback for system
  "colors": {
    "primary": "#3b82f6",
    "background": "#ffffff"
  }
}
```

`appearance: "system"` requires client-side JS to read `prefers-color-scheme`. Use `appearance: "light"` for static exports that won't run JS.

## i18n (Internationalization) {#i18n}

```jsonc
"i18n": {
  "default": "en",
  "locales": [
    { "id": "en", "label": "English" },
    { "id": "de", "label": "Deutsch" }
  ]
}
```

i18n requires locale-named source folders (e.g. `docs/de/`) for the per-locale pages to be generated. Setting `i18n` alone does not produce translated output.

## Versions {#versions}

```jsonc
"versions": [
  { "id": "v0.8", "label": "v0.8 (latest)", "default": true },
  { "id": "v0.7", "label": "v0.7" }
]
```

Like i18n, `versions` requires versioned source folders (e.g. `docs/v0.8/`, `docs/v0.7/`) for the build to fan out. The label `"v0.8 (latest)"` requires `default: true` on exactly one entry.

## Plugins {#plugins-config}

```jsonc
"plugins": {
  "search": {},
  "git": {
    "repo": "https://github.com/user/repo"
  },
  "seo": {},
  "llms": {}
}
```

See [plugins.md](./plugins.md) for complete plugin configuration.

## Complete Example {#complete-example}

```jsonc
{
  "title": "My Documentation",
  "description": "Comprehensive guide to my project",
  "url": "https://docs.example.com",
  "src": "docs",
  "out": "site",
  "base": "/",
  "favicon": "assets/favicon.ico",
  
  "logo": {
    "light": "assets/logo-dark.png",
    "dark": "assets/logo-light.png",
    "href": "/"
  },
  
  "layout": {
    "spa": true,
    "sidebar": {
      "collapsible": true
    }
  },
  
  "theme": {
    "appearance": "system"
  },
  
  "navigation": [
    { "title": "Home", "path": "/" },
    { "title": "Guide", "path": "/guide/" }
  ],
  
  "plugins": {
    "search": {},
    "git": {
      "repo": "https://github.com/example/project"
    },
    "seo": {}
  }
}
```

## Configuration File Formats {#file-formats}

### JSON (Recommended) {#json}

```json
{
  "title": "My Docs"
}
```

### JavaScript {#javascript}

```javascript
export default {
  title: "My Docs"
};
```

### TypeScript {#typescript}

```typescript
import type { DocmdConfig } from "@docmd/core";

export default {
  title: "My Docs"
} satisfies DocmdConfig;
```

TypeScript config requires `"type": "module"` in `package.json` and a build step (tsc / tsx).

## Environment Variables {#environment-variables}

- `DOCMD_CONFIG` — Override config file path
- `DOCMD_PORT` — Override default dev server port
- `DOCMD_OFFLINE` — Force offline mode for builds

Env vars are read at process start, not per-build.

## See Also {#see-also}

- [SKILL.md §5](../SKILL.md#5-quick-config-cheat-sheet) — minimal config + the 6 most common add-ons
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [cli.md](./cli.md) — CLI flags and exit codes
- [plugins.md](./plugins.md) — per-plugin config
- [formatting.md](./formatting.md) — page-level frontmatter pairs with site config
- [migration.md](./migration.md) — upgrading from older docmd config schemas