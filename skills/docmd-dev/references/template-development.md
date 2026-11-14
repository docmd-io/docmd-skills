---
description: Guide to building custom templates for docmd — 12 supported EJS slots, package.json#docmd manifest namespace, ESM exports, asset priority chain, CSS token bridging, and resolver mechanics.
when_to_use: |
  Read this file when you are:
  - Building a new docmd template package (alternative layout, 404 page, or skin)
  - Overriding any of the 12 supported template slots (`layout`, `404`, `toc`, `navigation`, `footer`, `menubar`, `options-menu`, `project-switcher`, `version-dropdown`, `language-switcher`, `banner`, `cookie-consent`)
  - Shipping template CSS/JS via `templateAssets` and respecting the asset priority chain (`0` to `25+`)
  - Understanding `theme.name` → `theme.template` auto-promotion and the 4-step resolver chain
audience: dev
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Template Development

Full docs:
* Building Templates — https://docs.docmd.io/development/building-templates
* Theming → Templates — https://docs.docmd.io/theming/templates
* Building Plugins — https://docs.docmd.io/development/building-plugins

## What a Template Is {#what-a-template-is}

A template is a **plugin with the exclusive `template` capability** (`capabilities: ['template']`) that ships one or more `.ejs` file overrides (`templates[]`) plus an optional CSS/JS bundle (`templateAssets[]`). Templates re-skin the site without forking `@docmd/ui`.

The canonical official reference is **Summer** (`packages/templates/summer/`, published as `@docmd/template-summer`). Install it in any site via `npx @docmd/core add summer` or set `"theme": { "template": "summer" }` (auto-installed during pre-flight).

Templates are **not** stacks — only one template is active per page/slot. Use `pages` and `exclude` globs on slot entries or `config.templates` to scope different templates to different sections.

## Package Structure & `package.json` {#template-structure}

```text
@docmd/template-foo/
├── package.json          # name: "@docmd/template-foo", docmd.kind: "template"
├── src/
│   └── index.ts          # default export — { plugin, templates, templateAssets }
├── templates/            # .ejs files (only the slots you override)
│   ├── layout.ejs
│   ├── 404.ejs
│   ├── toc.ejs
│   └── partials/
│       ├── menubar.ejs
│       └── footer.ejs
└── assets/
    ├── css/foo.css
    └── js/foo.js
```

Every template's `package.json` must include both the `docmd` manifest block **and** the `"default"` condition in `exports["."]`:

```json "package.json"
{
  "name": "@docmd/template-foo",
  "version": "0.10.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "peerDependencies": {
    "@docmd/core": ">=0.10.0"
  },
  "docmd": {
    "key": "foo",
    "kind": "template",
    "displayName": "Foo",
    "tagline": "Short one-line description for catalogues and docmd doctor.",
    "capabilities": ["template"]
  }
}
```

## The Plugin Descriptor & Slot Overrides {#declaring-slot-overrides}

The `template` capability is **exclusive** — a package declaring `capabilities: ['template']` cannot declare lifecycle capabilities (`head`, `build`, `post-build`, etc.).

```typescript "src/index.ts"
import { fileURLToPath } from 'node:url';
import type { PluginDescriptor, TemplateHook, TemplateAssetHook } from '@docmd/api';

const here = import.meta.url;
const pathOf = (rel: string) => fileURLToPath(new URL(rel, here));

export const plugin: PluginDescriptor = {
  name: 'template-foo',
  version: '0.10.0',
  capabilities: ['template'],
};

export const templates: TemplateHook[] = [
  { type: 'layout',       templatePath: pathOf('../templates/layout.ejs') },
  { type: '404',          templatePath: pathOf('../templates/404.ejs') },
  { type: 'toc',          templatePath: pathOf('../templates/toc.ejs') },
  { type: 'menubar',      templatePath: pathOf('../templates/partials/menubar.ejs') },
  { type: 'footer',       templatePath: pathOf('../templates/partials/footer.ejs') },
  { type: 'options-menu', templatePath: pathOf('../templates/partials/options-menu.ejs') },
];

export const templateAssets: TemplateAssetHook[] = [
  {
    type: 'css',
    path: pathOf('../assets/css/foo.css'),
    priority: 10,     // 10 = user-overridable default; 25 = override plugin CSS (like Summer)
    position: 'head',
  },
  {
    type: 'js',
    path: pathOf('../assets/js/foo.js'),
    priority: 10,
    position: 'body',
  },
];

export default { plugin, templates, templateAssets };
```

Use `import.meta.url` (never `__dirname` alone in ESM) and copy `templates/` and `assets/` into `dist/` during build (mirror `packages/templates/summer/scripts/copy-assets.mjs`).

## The 12 Supported Slots (`TemplateSlot`) {#the-12-supported-slots}

Slots not provided by your template automatically fall back to `@docmd/ui`'s default `.ejs` files:

| Slot | What it controls |
|:--|:--|
| `layout` | Full HTML shell (`<html>`, `<head>`, `<body>`, surrounding widgets, `docmd-runtime.js` injection) |
| `404` | Standalone not-found page |
| `toc` | Right-rail "On This Page" table of contents |
| `navigation` | Sidebar / primary navigation tree |
| `footer` | Page-level footer (links, copyright, branding) |
| `menubar` | Top horizontal bar (logo, links, search trigger, actions) |
| `options-menu` | Theme switch, Focus Mode (`Alt+F`), print button, language switcher, search trigger |
| `project-switcher` | Multi-project workspace dropdown |
| `version-dropdown` | Documentation version switcher |
| `language-switcher` | i18n locale switcher (supports all 10 UI locales including `tr`, plus RTL `dir="rtl"`) |
| `banner` | Multi-position site/section announcements (`top`, `header`, `sidebar-top`, `sidebar-bottom`, `toc-top`, `toc-bottom`, `footer`) |
| `cookie-consent` | Opt-in cookie consent bar/modal |

> `noStyle: true` pages are **not** a template slot — they always render via `@docmd/ui`'s `templates/no-style.ejs`.

### Common EJS Locals in `layout.ejs` {#ejs-locals}

| Local | Description |
|:--|:--|
| `config` | Normalised site configuration |
| `frontmatter` | Per-page YAML frontmatter |
| `relativePathToRoot` | Relative prefix to site root (`./`, `../`, etc.) — always use for portable asset/page links |
| `renderIcon(name, opts)` | Renders bundled Lucide SVGs (or Iconify SVGs when `@docmd/plugin-iconify` is active) |
| `t(key, params?)` | Localised UI string lookup (across `en`, `es`, `fr`, `de`, `ja`, `zh`, `hi`, `ko`, `ru`, `tr`) |
| `buildRelativeUrl(url)` | Resolves a URL relative to the current page |
| `pageTitle`, `siteTitle`, `appearance` | Pre-computed page and theme strings |
| `_template` | Resolved template metadata (`{ templatePath, source, pluginName, type }`) |

If your template overrides `layout.ejs`, ensure it preserves:
- `window.DOCMD_SITE_ROOT` injection (required by `@docmd/plugin-search` on versioned base paths).
- `docmd-runtime.js` script loading (required for reactive `{{ user.* }}` variables and Playgrounds).
- Immediate syntax-highlight theme stylesheet binding in `<head>` to prevent unstyled code flash on initial load.

## Per-Slot Scope: `pages`, `exclude`, `priority` {#per-slot-scope}

Each `templates[]` entry accepts optional `pages`, `exclude`, and `priority`:

```javascript
{
  type: 'toc',
  templatePath: pathOf('../templates/toc-blog.ejs'),
  pages: ['blog/*', '/blog.html'],
  exclude: ['blog/legacy/*'],
  priority: 10
}
```

- `exclude` is evaluated **before** `pages` using `micromatch` against the post-build page path (e.g. `/guide/intro.html`).

## Asset Priority Chain & CSS Rules {#asset-priority-chain}

Lower priority numbers load first; higher numbers load later and win CSS cascade ties:

| Priority | Layer | Notes |
|:--|:--|:--|
| `0` | Base (`docmd-main.css`, `docmd-main.js`) | Always loaded first |
| `5` | Theme colour overlay (`docmd-theme-sky.css`, etc.) | Skipped when `theme.name` auto-promotes to a template (`_noCssOverlay: true`) |
| `10` | **Template default** | Default priority for `templateAssets` |
| `15` | User `theme.customCss` / `theme.customJs` | User overrides |
| `20` | Plugin assets (`getAssets()`) | Search, AI Assistant, OpenAPI, Threads, Playground, etc. |
| `25+` | Opinionated template (`@docmd/template-summer` uses `25`) | Loads after plugin CSS so the template can theme plugin widgets |

**Hard CSS rules for template authors:**
1. **Never use `!important` in template CSS.** Users must be able to override your template styles cleanly without specificity wars.
2. **Bridge core CSS tokens.** Map your template's palette onto `--docmd-*`, `--bg-color`, `--sidebar-bg`, `--text-color`, etc. (see Summer's variable bridge) so plugins like `@docmd/plugin-ai`, `@docmd/plugin-openapi`, `@docmd/plugin-git`, and `@docmd/plugin-threads` inherit your theme automatically in both light and dark modes.

## Resolution Order & `theme.name` Auto-Promotion {#resolution-order}

1. **`frontmatter.template`** — per-page override (`"summer"`, `"template-summer"`, and `"@docmd/template-summer"` all resolve identically).
2. **`config.templates[glob]`** — per-section glob map in `docmd.config.json`.
3. **`config.theme.template`** — site-wide default. Note: in `normalizeConfig()`, if `theme.name` is set to a non-built-in theme name (e.g. `"summer"`) and `theme.template` is unset, docmd automatically promotes `theme.template = theme.name` and sets `theme._noCssOverlay = true`.
4. **Built-in `@docmd/ui` default** — fallback if unconfigured or if a template file is missing on disk (emits at most one TUI warning per build).

## See Also {#see-also}

- [api-dev.md#template-resolver-api](./api-dev.md#template-resolver-api) — `resolveTemplate` and `clearTemplateResolverCache`
- [plugin-development.md](./plugin-development.md) — `package.json#docmd` manifest and ESM export requirements
- [security-and-regression-checklist.md](./security-and-regression-checklist.md) — SPA script execution and highlight flash regression checks