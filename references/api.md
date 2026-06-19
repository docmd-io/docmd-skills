---
description: Complete API reference for docmd including Node.js API, browser API, MCP server, and utilities. Use when integrating docmd programmatically or building advanced plugins.
when_to_use: |
  Read this file when you are:
  - Calling docmd programmatically from Node (build, dev, workspace orchestration)
  - Embedding the docmd Live Editor / compile engine in a browser
  - Using the `window.docmd` dev-mode API for plugin actions/events
  - Reaching for the URL utilities (`outputPathToSlug`, `resolveHref`, etc.) inside a custom plugin
  - Resolving which template file renders a given slot on a given page (`resolveTemplate` from `@docmd/ui`)
  - Speaking to the MCP server (full coverage in [SKILL.md §4](../SKILL.md#4-mcp-server))
audience: both
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# API Reference

Prefer `@docmd/api` over `@docmd/core` for type-only or utility imports. They are re-exported from `core`, but `api` has the focused surface that tree-shakes cleanly.

Full docs:
* Node API - https://docs.docmd.io/reference/build-api/
* Browser API - https://docs.docmd.io/reference/browser-api/
* Client Events - https://docs.docmd.io/reference/client-side-events/

## Node.js Build API (`@docmd/core`) {#node-build-api}

### buildSite {#buildsite}

Build static site — same as `docmd build`

```javascript
import { buildSite } from "@docmd/core";

await buildSite("./docmd.config.json", {
  isDev: false,      // true = dev mode (no minification, enables HMR assets)
  offline: false,    // true = rewrite links to .html for file:// browsing
  zeroConfig: false  // true = skip config file, auto-detect everything
});
```

`isDev: true` does not start a dev server — it sets build-time flags only. For a live dev server, use `buildLive` or shell out to `docmd dev`.

### buildLive {#buildlive}

Generate browser-based Live Editor bundle

```javascript
import { buildLive } from "@docmd/core";

await buildLive({ 
  serve: false,  // Start dev server
  port: 3000     // Server port
});
```

`buildLive` defaults to `serve: false`, which only generates the bundle. Set `serve: true` to actually open it.

### Workspace Functions {#workspace-functions}

```javascript
import { 
  detectWorkspace, 
  buildWorkspace, 
  devWorkspace, 
  isWorkspace 
} from "@docmd/core";

// Detect if config is a workspace config
const config = await detectWorkspace("./docmd.config.json");
// Returns null if not a workspace, or normalised WorkspaceRootConfig

if (isWorkspace(config)) {
  // Build all projects in workspace
  await buildWorkspace(config, { quiet: false });
  
  // Or start dev server for all projects
  await devWorkspace(config, { quiet: false });
}
```

`detectWorkspace` returns `null` for non-workspace configs; always null-check before passing to `isWorkspace`.

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

## Browser API {#browser-api}

### Isomorphic Compile Engine {#isomorphic-compile-engine}

The same engine that builds static sites can run in the browser:

```html
<link rel="stylesheet" href="https://unpkg.com/@docmd/ui/assets/css/docmd-main.css">
<script src="https://unpkg.com/@docmd/live/dist/docmd-live.js"></script>
```

```javascript
// Compile raw markdown → full HTML document string
const html = await docmd.compile(markdownString, {
  title: "Preview",
  theme: { appearance: "light" }
});

iframe.srcdoc = html;  // Render in iframe for style isolation
```

Browser mode has no filesystem access. `navigation` and any source content must be passed explicitly. Node-only plugins (sitemap, LLMs generation) are auto-disabled.

Limitations:
- No filesystem access in browser
- Provide `navigation` array explicitly
- Node-only plugins (sitemap, LLMs) disabled

### Dev-Mode Plugin API (`window.docmd`) {#dev-mode-plugin-api}

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

## SPA Client-Side Events {#spa-client-side-events}

docmd uses an SPA router — `DOMContentLoaded` won't re-fire on navigation.

```javascript
document.addEventListener("docmd:page-mounted", (event) => {
  const { url } = event.detail;  // Absolute URL of newly mounted page
  // Re-init third-party libraries here
});
```

Third-party libraries that initialize on `DOMContentLoaded` (analytics widgets, syntax highlighters, comment widgets) only run on the first page load. Listen for `docmd:page-mounted` to re-init on subsequent navigations.

## MCP Server {#mcp-server}

Full coverage lives in [SKILL.md §4](../SKILL.md#4-mcp-server). The summary table:

| Tool | Input | Output |
|:--|:--|:--|
| `search_docs` | `{ query: string }` | File/line matches with context |
| `read_doc` | `{ route: string }` | Raw markdown content |
| `validate_docs` | `{}` | Pass/fail text |
| `get_llms_context` | `{}` | Full `llms-full.txt` body |

Errors come back as `content[].text` strings, not JSON-RPC error objects. Parse the text to detect failure: the string starts with `Error: ...` for known error cases.

Full docs: MCP Server - https://docs.docmd.io/reference/mcp-server/

### Client Configuration {#mcp-client-config}

Claude Desktop (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "docmd": {
      "command": "npx",
      "args": ["--yes", "@docmd/core", "mcp"],
      "cwd": "/path/to/project"
    }
  }
}
```

Cursor / Windsurf:
```json
{
  "command": "npx --yes @docmd/core mcp",
  "transport": "stdio"
}
```

### Security {#mcp-security}

- Local only — no network ports, no external connections
- File access sandboxed to project root
- No telemetry

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
  | 'menubar' | 'header' | 'options-menu' | 'project-switcher'
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

- [SKILL.md §4](../SKILL.md#4-mcp-server) — full MCP section with handshake sequence
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [plugin-development.md](./plugin-development.md) — hook signatures referenced from `loadPlugins`
- [template-development.md](./template-development.md) — for the author-side `TemplateHook` / `TemplateAssetHook` types
- [engines.md](./engines.md) — JS vs Rust engine details
- [cli.md](./cli.md) — CLI equivalents of these API functions