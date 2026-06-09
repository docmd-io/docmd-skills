---
description: Complete configuration schema for docmd.config.json. Use when setting up or modifying docmd configuration files.
---

# Configuration Reference

Full docs:
* Configuration - https://docs.docmd.io/configuration/

Configuration file: `docmd.config.json` (also supports `.js` and `.ts`)

## Zero-Config

Without a config file, docmd auto-detects source from `docs/`, `src/docs/`, `documentation/`, or any `.md` folder. Navigation, titles, search, and TOC are set up automatically.

## Core Settings

| Key | Type | Default | Description |
|:--|:--|:--|:--|
| `title` | String | `"Documentation"` | Site name — appears in nav, browser tabs, and SEO |
| `description` | String | — | Fallback meta description for pages without their own |
| `url` | String | — | Canonical production URL. **Required** for SEO, sitemap, and canonical links |
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

## Logo

```jsonc
"logo": {
  "light": "assets/images/logo-dark.png",  // Logo for light mode
  "dark": "assets/images/logo-light.png",  // Logo for dark mode
  "href": "/",                              // Click destination
  "alt": "Logo",                            // Alt text
  "height": "32px"                          // CSS height
}
```

## Layout

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

## Navigation

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

## Theme

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

## i18n (Internationalization)

```jsonc
"i18n": {
  "default": "en",
  "locales": [
    { "id": "en", "label": "English" },
    { "id": "de", "label": "Deutsch" }
  ]
}
```

## Versions

```jsonc
"versions": [
  { "id": "v0.8", "label": "v0.8 (latest)", "default": true },
  { "id": "v0.7", "label": "v0.7" }
]
```

## Plugins

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

## Complete Example

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

## Configuration File Formats

### JSON (Recommended)
```json
{
  "title": "My Docs"
}
```

### JavaScript
```javascript
export default {
  title: "My Docs"
};
```

### TypeScript
```typescript
import type { DocmdConfig } from "@docmd/core";

export default {
  title: "My Docs"
} satisfies DocmdConfig;
```

## Environment Variables

- `DOCMD_CONFIG` — Override config file path
- `DOCMD_PORT` — Override default dev server port
- `DOCMD_OFFLINE` — Force offline mode for builds