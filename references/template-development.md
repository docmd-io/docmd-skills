---
description: Guide to building custom templates for docmd — alternative layouts, 404 pages, TOC skins, and partial overrides. Use when creating a docmd template package or extending an existing one.
when_to_use: |
  Read this file when you are:
  - Building a new docmd template package (alternative layout, 404 page, or skin)
  - Overriding one of the 14 supported template slots (layout, 404, toc, menubar, footer, etc.)
  - Shipping template CSS/JS as part of a plugin
  - Picking a name, version, or naming convention for a community template
  - Understanding the 4-step resolver chain (frontmatter → config.templates → config.theme.template → default)
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-15
---

# Template Development

Full docs:
* Theming → Templates - https://docs.docmd.io/theming/templates/
* Building Plugins - https://docs.docmd.io/plugins/building-plugins/
* Configuration - https://docs.docmd.io/configuration/

## What a template is {#what-a-template-is}

A template is a **plugin with the `template` capability** that ships one or more `.ejs` file overrides plus an optional CSS/JS bundle. Templates let you re-skin the entire site (layout, 404, TOC, menubar, footer, banner, cookie dialog, etc.) without forking `@docmd/ui`.

The first official template is **Summer** — install it with `npx @docmd/core add summer`. It ships 6 slot overrides plus a single CSS+JS bundle. Read its [source on GitHub](https://github.com/docmd-io/docmd/tree/main/packages/templates/summer) for a complete worked example.

Templates are **not** stacks — installing a new template *replaces* the active one in `config.theme.template`. There is no concept of layered templates. Use `pages` / `exclude` globs to scope a template to specific sections.

## Template Structure {#template-structure}

A template package looks like any other docmd plugin:

```
@docmd/template-foo/
├── package.json          # name: "@docmd/template-foo", kind: "template"
├── src/
│   └── index.ts          # default export — the plugin module
├── templates/            # .ejs files (one per slot you override)
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

`package.json` is the same shape as any plugin, with two extras:

```json
{
  "docmd": {
    "kind": "template",
    "displayName": "Foo",
    "tagline": "Short one-line description for the docs."
  }
}
```

`displayName` and `tagline` are shown in `npx @docmd/core add` prompts and the docs site's template gallery. Optional but recommended for public packages.

## The Plugin Descriptor {#the-plugin-descriptor}

Same as a plugin — but with a single capability:

```javascript
export const plugin = {
  name: 'template-foo',
  version: '1.0.0',
  capabilities: ['template'],   // ← only this
};
```

The `template` capability is **exclusive** — if you declare it, you cannot also declare `head`, `build`, `post-build`, etc. Templates do not run lifecycle hooks; they only ship slots and assets. If you need both, ship two separate packages.

## Declaring Slot Overrides {#declaring-slot-overrides}

Export a `templates` array on the plugin module — one entry per slot:

```javascript
import { fileURLToPath } from 'node:url';

const here = import.meta.url;
const pathOf = (rel) => fileURLToPath(new URL(rel, here));

const templates = [
  { type: 'layout',        templatePath: pathOf('../templates/layout.ejs') },
  { type: '404',           templatePath: pathOf('../templates/404.ejs') },
  { type: 'toc',           templatePath: pathOf('../templates/toc.ejs') },
  { type: 'menubar',       templatePath: pathOf('../templates/partials/menubar.ejs') },
  { type: 'footer',        templatePath: pathOf('../templates/partials/footer.ejs') },
  { type: 'options-menu',  templatePath: pathOf('../templates/partials/options-menu.ejs') },
];
```

Path resolution uses **`import.meta.url`** (URL-relative) so the same code works in dev (`src/index.ts`) and after `tsc` (`dist/index.js`). The `tsc` build must copy `templates/` and `assets/` into `dist/` — see the [summer template's `scripts/copy-assets.mjs`](https://github.com/docmd-io/docmd/tree/main/packages/templates/summer/scripts) for the standard pattern.

## The 14 Supported Slots {#the-14-supported-slots}

You may override any of these. Slots you do not provide fall back to the `@docmd/ui` default automatically.

| Slot | What it controls |
|:--|:--|
| `layout` | The full page shell — `<html>`, `<head>`, `<body>`, every surrounding widget |
| `404` | Standalone not-found page |
| `toc` | Right-rail table of contents |
| `navigation` | Sidebar / primary nav |
| `footer` | Page-level footer (links, copyright, "Built with docmd") |
| `menubar` | Top horizontal bar (logo + search + actions) |
| `header` | Per-page header (title, breadcrumbs, edit link) |
| `options-menu` | Theme switch / language switcher / search trigger |
| `project-switcher` | Monorepo project dropdown |
| `version-dropdown` | Doc version switcher |
| `language-switcher` | i18n locale switcher |
| `banner` | Site-wide announcement (dismissable, opt-in) |
| `cookie-consent` | Cookie consent dialog (opt-in) |

> The `layout` slot is the biggest hammer. Overriding it means you re-render everything below it. Most templates only override a handful of partials and let `layout` stay default.

`no-style` pages (frontmatter `noStyle: true`) are **not** affected by templates — they always use the default `templates/no-style.ejs` and are unaffected by the active template.

## Per-Slot Scope: `pages` and `exclude` {#per-slot-scope}

Each `templates[]` entry accepts optional `pages` and `exclude` glob arrays. They are evaluated against the page path (post-build, e.g. `/guide/intro.html`):

```javascript
{
  type: 'toc',
  templatePath: pathOf('./toc-blog.ejs'),
  pages: ['blog/*', '/blog.html'],   // apply to /blog/* paths
  exclude: ['blog/legacy/*'],        // except /blog/legacy/*
}
```

- Omit `pages` (or pass `[]`) to apply to all pages.
- `exclude` is evaluated **before** `pages`.
- Globs are matched with `micromatch` (same engine `frontmatter.template` uses).
- Slot priority is also configurable: `priority?: number` — higher wins when multiple templates claim the same slot. Default is `0`.

## Shipping CSS/JS: `templateAssets` {#shipping-assets}

Export a `templateAssets` array for the template's own CSS/JS bundle:

```javascript
const templateAssets = [
  {
    type: 'css',
    path: pathOf('../assets/css/foo.css'),
    priority: 25,           // see priority chain below
    position: 'head',       // 'head' | 'body' | 'footer'
  },
  {
    type: 'js',
    path: pathOf('../assets/js/foo.js'),
    priority: 25,
    position: 'body',
  },
];
```

| Field | Default | Notes |
|:--|:--|:--|
| `type` | — | `'css'` or `'js'` |
| `path` | — | Absolute path to the file inside the template package |
| `priority` | `10` for templates | Higher loads later (wins cascade ties). Use `25` to override plugin CSS |
| `position` | `head` for css, `body` for js | Where the asset tag is injected |

The full **asset priority chain** is:

```
base theme     (0)   ← docmd-main.css
theme          (5)   ← theme-specific tokens
template      (10)   ← your template's CSS (default)
customCss     (15)   ← config.customCss
plugins       (20)   ← plugin getAssets()
```

Templates may use higher priorities (Summer uses `25`) to win against plugins, but **must not** use `!important` in CSS — that is a hard rule. If a user cannot override your template, it is a bug, not a feature.

## Default Export {#default-export}

```javascript
import type { PluginDescriptor, PluginModule, TemplateHook, TemplateAssetHook } from '@docmd/api';

const templateFoo = {
  plugin,
  templates,
  templateAssets,
};

export default templateFoo;
// Type: PluginModule & { templates: TemplateHook[]; templateAssets: TemplateAssetHook[] }
```

If you use TypeScript, both `templates` and `templateAssets` are typed. Re-export their types from `@docmd/api`:

```typescript
import type { TemplateHook, TemplateAssetHook } from '@docmd/api';
```

## Activating a Template {#activating-a-template}

Three resolution layers, in order:

### 1. `frontmatter.template` (per-page)

```markdown
---
title: "Changelog"
template: "template-changelog"
---
```

Wins everything. The string is the plugin's package name; bare names like `"changelog"`, `"template-changelog"`, and `"@docmd/template-changelog"` all resolve identically.

### 2. `config.templates` (per-section, glob → name)

```jsonc
{
  "templates": {
    "blog/*":  "template-blog",
    "changelog": "template-changelog"
  }
}
```

Per-section map. Globs match the page path. Useful for "use template-blog on `/blog/*` and default everywhere else" without frontmatter.

### 3. `config.theme.template` (site-wide)

```jsonc
{
  "theme": {
    "template": "summer"
  }
}
```

Site-wide default. Most users will only set this.

If any step fails (the name doesn't match a registered template, or the resolved file is missing on disk), the resolver moves on to the next step. If all steps fail, the resolver falls back to the default and emits **one TUI warning** per build. The build never errors on a missing template.

## Path Resolution & Build {#path-resolution}

Use `import.meta.url` (URL-relative) for everything so the same code works in dev and after `tsc`:

```typescript
import { fileURLToPath } from 'node:url';

const here = import.meta.url;
const pathOf = (rel: string) => fileURLToPath(new URL(rel, here));
```

Your `tsconfig.json` should keep `src/index.ts` as the only entry. The `tsc` build must copy `templates/` and `assets/` into `dist/` (use a small `scripts/copy-assets.mjs` — see summer for the reference). The package's `files` field should publish `dist/` only.

## Naming Conventions {#naming-conventions}

- Public templates: `@docmd/template-<name>` (e.g. `@docmd/template-summer`).
- Bare names like `summer` and `template-summer` resolve identically — the resolver strips both prefixes.
- The plugin descriptor's `name` field uses the short form: `template-summer`, not `@docmd/template-summer`.
- The package on npm **must** be in the `@docmd/template-*` scope for `docmd add` to find it via the auto-install pipeline. Locally-hosted templates work via path resolution in `config.plugins` and don't need the scope.

## Gotchas {#gotchas}

- **Asset priority collisions** are silent. If you set `priority: 25` and so does a plugin, load order is alphabetical by `plugin.name`. Pick a unique priority band (e.g. `20 + N` for a series of N related templates).
- **`!important` in template CSS is forbidden.** Users must always be able to override via `customCss`. The build does not enforce this — a code review must.
- **No stacking.** Installing a second template replaces the first. To get behaviour from both, ship one template that combines their slots.
- **`noStyle: true` pages ignore templates.** This is intentional — those pages are for raw markdown export.
- **Frontmatter `template` is the strongest override.** A user who wants to opt a single page out of the site-wide template just sets `template: null` (or omits the field on the active template).
- **The resolver is cached per build.** If you mutate `config.theme.template` at runtime inside a plugin, call `clearTemplateResolverCache()` from `@docmd/ui` to invalidate. See [api.md](./api.md#template-resolver-api) for the runtime API.

## Best Practices {#best-practices}

1. **Override as few slots as possible.** Most templates need only 2-3 partials; the rest is the default.
2. **Stay in the priority band `10-20` for assets.** Anything higher breaks user overrideability.
3. **Use `import.meta.url` for paths**, never `__dirname` (it is undefined in ESM).
4. **Ship one CSS file and one JS file.** Splitting into many small files defeats the priority chain.
5. **Test with the standard `docmd add` pipeline** before publishing — if `docmd add <name>` cannot find your package, users will not find it either.
6. **Mirror the [summer template's `scripts/copy-assets.mjs`](https://github.com/docmd-io/docmd/tree/main/packages/templates/summer/scripts)** rather than rolling your own — the patterns are battle-tested.
7. **Document every `pages` / `exclude` glob in your README** — users will not guess which paths they affect.

## Publishing {#publishing}

1. `npm login` (one-time)
2. `npm publish --access public` from the package root
3. The version on npm must match the version of `@docmd/core` you developed against. A template built against `0.8.7` will work with `0.8.7+` core; a template built against `0.9.0` may need adjustments for older cores.
4. Tag the release on GitHub so the [docs template gallery](https://docs.docmd.io/theming/templates/) can pick it up.

## See Also {#see-also}

- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [plugin-development.md](./plugin-development.md) — for non-template plugins (use the same `plugin` descriptor, different `capabilities`)
- [api.md#template-resolver-api](./api.md#template-resolver-api) — runtime API for resolving and clearing templates
- [config.md#theme](./config.md#theme) — `theme.template`, `templates` map, and `frontmatter.template`
- [summer template on GitHub](https://github.com/docmd-io/docmd/tree/main/packages/templates/summer) — canonical worked example
- [summer template package](https://www.npmjs.com/package/@docmd/template-summer)