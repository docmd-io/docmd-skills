---
description: Plugin-author internals — @docmd/api package, URL utilities, action/event dispatcher, source tools, engine loader, and TypeScript types. Use when writing docmd plugins, templates, or modifying the engine itself.
when_to_use: |
  Read this file when you are:
  - Writing a docmd plugin (using `@docmd/api` URL helpers, action dispatcher, source tools)
  - Reaching for the engine loader to register a custom build engine
  - Resolving which template file renders a given slot (`resolveTemplate` from `@docmd/ui`)
  - Pulling TypeScript types for plugin authoring

  For the user-facing programmatic build API (`buildSite`, `buildLive`, workspace orchestration), see **api-user.md** in the docmd-skills skill.
audience: dev
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# API Reference (Plugin Author)

Use this when writing a **docmd plugin, custom template, or modifying the engine**. The dev-facing APIs live in `@docmd/api` (and are re-exported from `@docmd/core`).

For the user-facing build API (`buildSite`, `buildLive`, workspace orchestration), see **api-user.md** in the docmd-skills skill instead.

## URL Utilities (`@docmd/api`) {#url-utilities}

Centralized URL helpers — plugins should use these instead of custom implementations.

```javascript
import {
  outputPathToSlug,
  outputPathToPathname,
  outputPathToCanonical,
  sanitizeUrl,
  buildAbsoluteUrl,
  resolveHref
} from '@docmd/api';

// Convert output path to clean slug
outputPathToSlug('guide/index.html');     // → 'guide/'
outputPathToSlug('index.html');           // → '/'

// Convert to root-relative pathname
outputPathToPathname('guide/index.html'); // → '/guide/'

// Build canonical URL
outputPathToCanonical('guide/index.html', 'https://docs.example.com');
// → 'https://docs.example.com/guide/'

// Collapse double slashes
sanitizeUrl('/foo//bar');                 // → '/foo/bar'

// Build absolute URL with locale/version prefix
buildAbsoluteUrl('/', 'de/', 'v1/', 'guide/');
// → '/de/v1/guide/'

// Resolve markdown links
resolveHref('overview.md');               // → 'overview/'
resolveHref('external:https://github.com'); // → 'https://github.com'
resolveHref('raw:docs/readme.md');        // → 'docs/readme.md'
```

## Pre-computed Page URLs {#pre-computed-page-urls}

Every `page` object in plugin hooks has pre-computed URLs:

```javascript
page.urls.slug       // 'guide/'
page.urls.canonical  // 'https://docs.example.com/guide/' (if config.url set)
page.urls.pathname   // '/guide/'
```

`page.urls.canonical` is `undefined` if root config `url` is missing.

## Dev-Mode Plugin API (`window.docmd`) {#dev-mode-plugin-api}

Only available during `docmd dev` — not in production builds.

```javascript
// Call a server-side plugin action handler (returns Promise)
const result = await docmd.call("threads:get-threads", {
  file: "docs/guide.md"
});

// Fire-and-forget event to server
docmd.send("analytics:page-view", {
  path: location.pathname
});

// Subscribe to server-pushed events (returns unsubscribe function)
const unsub = docmd.on("threads:updated", (data) => {
  // Handle update
});

// Stash context for after next page reload
docmd.scheduleReload("scroll-restore", { scrollY: window.scrollY });
docmd.afterReload("scroll-restore", (ctx) => window.scrollTo(0, ctx.scrollY));
```

`window.docmd` does not exist in production builds. Guard with `if (window.docmd) { ... }`.

## Template Resolver API (`@docmd/ui`) {#template-resolver-api}

Re-exported from `@docmd/ui` (and re-exported from `@docmd/core`). Use these when a plugin needs to ask "which template file would render slot X on page Y?" at build time.

### resolveTemplate {#resolvetemplate}

Resolves which `.ejs` file should be used for a given slot on a given page. Returns an object describing the source of the resolution (default / frontmatter / config / plugin) so callers can short-circuit or log accordingly.

```javascript
import { resolveTemplate } from '@docmd/ui';

const tpl = resolveTemplate({
  type: 'layout',
  pagePath: '/guide/intro.html',
  frontmatter: page.frontmatter,
  config: normalizedConfig,
});
// → { templatePath: '/abs/.../summer/layout.ejs', source: 'plugin', pluginName: 'template-summer', type: 'layout' }
```

**Resolution order** (each step may be skipped):

1. `frontmatter.template` — per-page override, wins everything
2. `config.templates[glob]` — per-section map (e.g. `{ "blog/*": "template-blog" }`)
3. `config.theme.template` — site-wide default
4. Built-in default from `@docmd/ui`

If a step produces a name that does not match a registered template, the resolver moves on. If the resolved file does not exist on disk, the resolver falls back to the default and emits **one TUI warning per build** — the build itself never errors on a missing template.

### clearTemplateResolverCache {#cleartemplateresolvercache}

The resolver caches per-build results. Call this if you mutate `config.theme.template` (or `config.templates`) at runtime inside a plugin and need the next resolution to see the new state.

```javascript
import { clearTemplateResolverCache } from '@docmd/ui';

// Inside a plugin's onBeforeBuild hook, after mutating config
clearTemplateResolverCache();
```

Not needed for normal builds — only when a plugin rewrites the active template at runtime.

### Resolver Types {#resolver-types}

```typescript
import type {
  TemplateSlot,
  TemplateResolutionContext,
  ResolvedTemplate,
  TemplateHook,
  TemplateAssetHook,
  Asset,
  AssetKind,
  AssetPosition,
} from '@docmd/api';

interface ResolvedTemplate {
  /** Absolute filesystem path to the EJS file to render. */
  templatePath: string;
  /** How the resolution arrived at this template. */
  source: 'default' | 'frontmatter' | 'config' | 'plugin';
  /** Plugin name, when `source === 'plugin'`. */
  pluginName?: string;
  /** Slot that was resolved. */
  type: TemplateSlot;
}

interface TemplateResolutionContext {
  /** Slot being resolved. */
  type: TemplateSlot;
  /** Post-build page path (e.g. `/guide/intro.html`). */
  pagePath: string;
  /** Page frontmatter (may contain `template` override). */
  frontmatter: Record<string, any>;
  /** Resolved site config. */
  config: any;
  /** Locale id for the page, if any. */
  localeId?: string;
  /** Version id for the page, if any. */
  versionId?: string;
}

type TemplateSlot =
  | 'layout' | '404' | 'toc' | 'navigation' | 'footer'
  | 'menubar' | 'options-menu' | 'project-switcher'
  | 'version-dropdown' | 'language-switcher' | 'banner' | 'cookie-consent';
```

For the **author-side** types used when declaring slot overrides and asset bundles in your own template package, see [template-development.md](./template-development.md) — they are `TemplateHook` and `TemplateAssetHook`.

## Plugin System Utilities (`@docmd/api`) {#plugin-system-utilities}

```javascript
import {
  loadPlugins,
  createActionDispatcher,
  createSourceTools,
  loadEngine,
  registerEngine
} from "@docmd/api";

// Load and validate all plugins from config
const hooks = await loadPlugins(config, {
  resolvePaths: [__dirname]
});

// Route WebSocket RPC messages to plugin handlers
const dispatcher = createActionDispatcher(
  { actions, events },
  { projectRoot, config, broadcast }
);
const { result, reload } = await dispatcher.handleCall("my-action", payload);

// Markdown source editing tools
const source = createSourceTools({ projectRoot: "/path" });
await source.getBlockAt("docs/page.md", [10, 12]);
await source.wrapText("docs/page.md", [10, 12], "important", 0, "**", "**");

// Pluggable build engine (JS default, Rust preview)
const engine = await loadEngine("rust");  // Falls back to JS if unavailable
registerEngine("custom", myEngineImpl);   // Register custom engine
```

`loadEngine('rust')` silently falls back to JS if the platform-specific binary is unavailable. Check `engine.name` to know which one was loaded.

`createSourceTools` is for editor / Live Editor use, not build-time plugins.

## TypeScript Types {#typescript-types}

```typescript
import type {
  PluginModule,
  PluginDescriptor,
  PluginHooks,
  PageContext,
  BeforeBuildContext,
  PostBuildContext,
  Capability,
  ActionContext,
  ActionHandler,
  EventHandler,
  SourceTools,
  BlockInfo,
  TextLocation,
  Engine,
  // Templates (new in 0.8.7)
  TemplateSlot,
  TemplateHook,
  TemplateAssetHook,
  TemplateResolutionContext,
  ResolvedTemplate,
  Asset,
  AssetKind,
  AssetPosition
} from '@docmd/api';
```

All exports from `@docmd/api` are also available from `@docmd/core`. New projects should prefer `@docmd/api` for better tree-shaking.

## See Also {#see-also}

- [plugin-development.md](./plugin-development.md) — hook signatures referenced from `loadPlugins`
- [template-development.md](./template-development.md) — for the author-side `TemplateHook` / `TemplateAssetHook` types
- [engines.md](./engines.md) — engine loader and architecture internals
