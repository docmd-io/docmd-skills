# docmd Configuration Reference
> Full docs: [Configuration](https://docs.docmd.io/configuration/) · File: `docmd.config.json` (also `.js` and `.ts`)

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
  "spa": true,                  // (default: true) SPA navigation — instant page transitions without reload
  "header": { "enabled": true },
  "sidebar": {
    "collapsible": true,        // (default: true) Allow sidebar sections to collapse
    "defaultCollapsed": false   // (default: false) Start collapsed
  },
  "optionsMenu": {
    "position": "header",       // "header" or "sidebar"
    "components": {
      "search": true,           // Show search button
      "themeSwitch": true,      // Show dark/light mode toggle
      "sponsor": "https://..."  // Optional sponsor link URL
    }
  },
  "footer": { "style": "minimal", "content": "© 2026", "branding": true }
}
```

## Theme
```jsonc
"theme": {
  "name": "default",            // Built-in themes: "default", "sky", "ruby", "retro"
  "appearance": "system",       // "light", "dark", or "system" (follows OS preference)
  "codeHighlight": true,        // (default: true) Syntax highlighting via Highlight.js
  "customCss": []               // Array of custom CSS file paths to inject
}
```

## Navigation
```jsonc
"navigation": [
  { "title": "Home", "path": "/", "icon": "home" },
  { "title": "Guide", "path": "/getting-started/installation", "icon": "book-open" },
  {
    "title": "API",
    "icon": "code",
    "collapsible": true,        // Group with collapsible children
    "children": [
      { "title": "Node API", "path": "/api/node-api" },
      { "title": "CLI", "path": "/api/cli-commands" }
    ]
  }
]
```
Icons use [Lucide](https://lucide.dev/icons) names.

## Versions
```jsonc
"versions": {
  "current": "v1.0",            // Active version ID
  "position": "sidebar-top",    // Version selector position
  "all": [
    { "id": "v1.0", "dir": "docs/v1.0", "label": "Version 1.0" },
    { "id": "v0.8", "dir": "docs/v0.8", "label": "Version 0.8" }
  ]
}
```

## i18n
```jsonc
"i18n": {
  "default": "en",              // Fallback locale
  "locales": [
    { "id": "en", "label": "English", "dir": "ltr" },
    { "id": "de", "label": "Deutsch", "dir": "ltr" },
    { "id": "zh", "label": "中文", "dir": "ltr" },
    { "id": "ar", "label": "العربية", "dir": "rtl" }
  ]
}
```

## Redirects
```jsonc
"redirects": { "/old-path": "/new-path" }  // Key-value redirect rules
```

## Custom Assets
```jsonc
"customJs": ["assets/js/custom.js"],  // JS files injected into every page
// customCss goes inside theme.customCss (see Theme section)
```

## Plugins
See [plugins.md](./plugins.md) for all plugin configs with defaults and options.