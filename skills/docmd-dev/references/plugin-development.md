---
description: Guide to building custom plugins for docmd. Use when creating or modifying docmd plugins.
when_to_use: |
  Read this file when you are:
  - Writing a new docmd plugin from scratch
  - Picking the right capability for the hook you need
  - Implementing action/event handlers for the Live Editor (WebSocket RPC)
  - Publishing a community plugin (`docmd-plugin-*` prefix)
audience: dev
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# Plugin Development

Full docs:
* Building Plugins - https://docs.docmd.io/development/building-plugins/
* Plugin Usage - https://docs.docmd.io/plugins/usage

## Plugin Structure {#plugin-structure}

Every plugin must export a `plugin` descriptor — plugins without it are rejected at load time.

```javascript
export default {
  plugin: {
    name: "my-plugin",           // Unique identifier
    version: "1.0.0",
    capabilities: ["head", "build", "post-build"]  // Declares which hooks this plugin uses
  },
  // ... hooks
};
```

Naming convention: community plugins should prefix with `docmd-plugin-`.

## Capabilities → Hooks {#capabilities}

| Capability | Hooks | Phase |
|:--|:--|:--|
| `init` | `onConfigResolved` | Init — modify config after load |
| `markdown` | `markdownSetup` | Setup — extend markdown-it parser |
| `head` | `generateMetaTags`, `generateScripts` (head) | Render — inject into `<head>` |
| `body` | `generateScripts` (body) | Render — inject before `</body>` |
| `build` | `onBeforeParse`, `onAfterParse`, `onBeforeBuild`, `onBeforeRender`, `onPageReady` | Build — transform content |
| `post-build` | `onPostBuild` | Post-Build — run after all HTML generated |
| `dev` | `onDevServerReady` | Dev Server — access raw Node.js server |
| `assets` | `getAssets` | Output — copy/link external files |
| `actions` | `actions` | Interactive — WebSocket RPC handlers (dev only) |
| `events` | `events` | Interactive — fire-and-forget handlers (dev only) |
| `translations` | `translations` | i18n — return locale strings |

Capabilities are a strict allowlist, not a hint. Declaring `capabilities: ["build"]` and writing an `onPostBuild` hook means the post-build hook is silently never called. Add `post-build` to the array.

## Hook Signatures {#hook-signatures}

### Init & Setup {#init-setup}

`onConfigResolved(config)` — Modify config after loading
```javascript
onConfigResolved: async (config) => {
  config.title = config.title || "My Docs";
  return config;
}
```

`markdownSetup(md, opts)` — Extend markdown-it instance (synchronous only)
```javascript
markdownSetup: (md, opts) => {
  md.use(require('markdown-it-emoji'));
}
```

`markdownSetup` is synchronous only; returning a Promise has no effect.

### Build Phase {#build-phase}

`onBeforeParse(src, frontmatter, filePath?)` → return modified markdown
```javascript
onBeforeParse: async (src, frontmatter, filePath) => {
  return src.replace(/\{\{version\}\}/g, 'v2.0.0');
}
```

`onAfterParse(html, frontmatter, filePath?)` → return modified HTML
```javascript
onAfterParse: async (html, frontmatter, filePath) => {
  return html.replace(/<pre>/g, '<pre class="highlight">');
}
```

`onBeforeBuild({ pages, tui })` — Heavy data fetching/indexing
```javascript
onBeforeBuild: async ({ pages, tui }) => {
  tui.step("Indexing content...");
  for (const page of pages) {
    // Process pages
  }
}
```

`onBeforeRender(page)` — Mutate `page.frontmatter` or `page.html`
```javascript
onBeforeRender: async (page) => {
  page.frontmatter.wordCount = page.html.split(/\s+/).length;
}
```

`onBeforeRender` mutates `page` in place. The return value is ignored, unlike `onBeforeParse` / `onAfterParse` which return a new value.

`onPageReady(page)` — Access final page before write
```javascript
onPageReady: async (page) => {
  console.log(`Built: ${page.sourcePath}`);
}
```

### Head & Body Injection {#head-body-injection}

`generateMetaTags(config, page, relativePathToRoot)` → return HTML string
```javascript
generateMetaTags: async (config, page) => {
  return `<meta name="author" content="My Team">`;
}
```

`generateScripts(config, opts)` → return `{ headScriptsHtml, bodyScriptsHtml }`
```javascript
generateScripts: async (config, opts) => {
  return {
    headScriptsHtml: '<script src="https://cdn.example.com/lib.js"></script>',
    bodyScriptsHtml: '<script>console.log("loaded");</script>'
  };
}
```

### Post-Build {#post-build}

`onPostBuild({ config, pages, outputDir, log, options })` — Post-generation tasks
```javascript
onPostBuild: async ({ pages, log }) => {
  log(`Verified ${pages.length} pages.`);
}
```

The `log` function is a scoped logger; output goes to the build log with the plugin's name prefix.

### Assets {#assets}

`getAssets(opts)` → return array of assets
```javascript
getAssets: (opts) => [
  { url: "https://cdn.example.com/lib.js", type: "js", location: "head" },
  { src: path.join(__dirname, "custom.css"), dest: "assets/css/custom.css", type: "css", location: "head" }
]
```

`getAssets` runs once per build, not once per page.

### Dev Server {#dev-server}

`onDevServerReady(server, wss)` — Access raw Node.js server
```javascript
onDevServerReady: async (server, wss) => {
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      // Handle message
    });
  });
}
```

`onDevServerReady` is only called during `docmd dev`, not during `docmd build`.

### Interactive (Dev Only) {#interactive}

`actions` — WebSocket RPC handlers
```javascript
actions: {
  "my-plugin:save": async (payload, ctx) => {
    const content = await ctx.readFile(payload.file);
    await ctx.writeFile(payload.file, content + "\n" + payload.note);
    return { saved: true };
  }
}
```

`events` — Fire-and-forget handlers
```javascript
events: {
  "my-plugin:analytics": async (payload, ctx) => {
    console.log("Page view:", payload.path);
  }
}
```

Action names must be namespaced (`my-plugin:save`, not just `save`).

### Translations {#translations}

`translations(localeId)` → return locale strings
```javascript
translations: (localeId) => {
  const strings = {
    en: { search: "Search", nav: "Navigation" },
    de: { search: "Suchen", nav: "Navigation" }
  };
  return strings[localeId] || strings.en;
}
```

## PageContext {#pagecontext}

Available in build hooks:

```typescript
interface PageContext {
  sourcePath: string;              // Absolute path to source .md file
  frontmatter: Record<string, any>; // Parsed YAML frontmatter (mutable)
  html: string;                     // Rendered HTML body (mutable)
  localeId?: string;                // Current locale (e.g. "en", "de")
  versionId?: string;               // Current version (e.g. "v0.8")
  relativePathToRoot?: string;      // Relative path back to site root
  urls: {
    slug: string;                   // 'guide/'
    pathname: string;               // '/guide/'
    canonical?: string;             // 'https://docs.example.com/guide/'
  };
  runWorkerTask<T>(module: string, fn: string, args: any[]): Promise<T>;
}
```

## ActionContext {#actioncontext}

Available in `actions` and `events`:

```typescript
interface ActionContext {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readFileLines(path: string): Promise<string[]>;
  broadcast(event: string, data: any): void;
  runWorkerTask<T>(module: string, fn: string, args: any[]): Promise<T>;
  source: SourceTools;
  projectRoot: string;
  config: DocmdConfig;
}
```

`source: SourceTools` is the editor source tools; it is only meaningful inside the Live Editor / dev-mode context.

## Complete Example {#complete-example}

```javascript
import path from 'path';

export default {
  plugin: {
    name: "my-plugin",
    version: "1.0.0",
    capabilities: ["head", "build", "post-build"]
  },

  generateMetaTags: async (config, page) =>
    `<meta name="x-build-id" content="${config._buildHash}">`,

  onBeforeRender: async (page) => {
    page.frontmatter.wordCount = page.html.split(/\s+/).length;
  },

  onPostBuild: async ({ pages, log }) => {
    log(`Verified ${pages.length} pages.`);
  }
};
```

Register in `docmd.config.json`:

```jsonc
{
  "plugins": {
    "my-plugin": {}
  }
}
```

## Best Practices {#best-practices}

1. Always declare capabilities — plugins can only use hooks they declare
2. Use async/await — hooks may be called concurrently
3. Keep plugins stateless — engine may re-initialize them
4. Prefix action names — use `my-plugin:action-name` format
5. Use `log()` for output — respects user verbosity settings
6. Handle errors gracefully — broken plugins shouldn't crash builds
7. Use worker tasks — offload CPU-intensive work
8. Test in isolation — use `onBeforeBuild` for setup, `onPostBuild` for verification

Plugin errors are caught and logged at runtime; the build does not fail. To confirm a hook is being called, throw inside the hook temporarily and watch the build log.

## Publishing {#publishing}

1. Create npm package with `docmd-plugin-` prefix
2. Export plugin as default
3. Include README with configuration options
4. Add `docmd` keyword in package.json
5. Test with real docmd project

The `docmd-plugin-` prefix is a convention, not an enforced rule, but it is required for npm discoverability.

## See Also {#see-also}

- [SKILL.md §7](../../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- **plugins.md** (in the docmd-skills skill) — built-in plugins you can model your plugin afterr
- [api-dev.md](./api-dev.md) — `loadPlugins`, `createActionDispatcher`, URL utilities
- **config.md** (in the docmd-skills skill) — how plugins are wired into config
- [engines.md](./engines.md) — engine boundary, serialization gotchas
