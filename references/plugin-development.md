---
description: Guide to building custom plugins for docmd. Use when creating or modifying docmd plugins.
---

# Plugin Development

Full docs:
* Building Plugins - https://docs.docmd.io/plugins/building-plugins/
* Plugin Usage - https://docs.docmd.io/plugins/usage/

## Plugin Structure

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

**Naming convention:** Community plugins should prefix with `docmd-plugin-`

## Capabilities → Hooks

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

## Hook Signatures

### Init & Setup

**`onConfigResolved(config)`** — Modify config after loading
```javascript
onConfigResolved: async (config) => {
  config.title = config.title || "My Docs";
  return config;
}
```

**`markdownSetup(md, opts)`** — Extend markdown-it instance (synchronous only)
```javascript
markdownSetup: (md, opts) => {
  md.use(require('markdown-it-emoji'));
}
```

### Build Phase

**`onBeforeParse(src, frontmatter, filePath?)`** → return modified markdown
```javascript
onBeforeParse: async (src, frontmatter, filePath) => {
  // Modify markdown before parsing
  return src.replace(/\{\{version\}\}/g, 'v2.0.0');
}
```

**`onAfterParse(html, frontmatter, filePath?)`** → return modified HTML
```javascript
onAfterParse: async (html, frontmatter, filePath) => {
  // Modify HTML after markdown→HTML
  return html.replace(/<pre>/g, '<pre class="highlight">');
}
```

**`onBeforeBuild({ pages, tui })`** — Heavy data fetching/indexing
```javascript
onBeforeBuild: async ({ pages, tui }) => {
  tui.step("Indexing content...");
  // Use tui.progress() for progress bars
  for (const page of pages) {
    // Process pages
  }
}
```

**`onBeforeRender(page)`** — Mutate `page.frontmatter` or `page.html`
```javascript
onBeforeRender: async (page) => {
  page.frontmatter.wordCount = page.html.split(/\s+/).length;
}
```

**`onPageReady(page)`** — Access final page before write
```javascript
onPageReady: async (page) => {
  // Final checks or logging
  console.log(`Built: ${page.sourcePath}`);
}
```

### Head & Body Injection

**`generateMetaTags(config, page, relativePathToRoot)`** → return HTML string
```javascript
generateMetaTags: async (config, page) => {
  return `<meta name="author" content="My Team">`;
}
```

**`generateScripts(config, opts)`** → return `{ headScriptsHtml, bodyScriptsHtml }`
```javascript
generateScripts: async (config, opts) => {
  return {
    headScriptsHtml: '<script src="https://cdn.example.com/lib.js"></script>',
    bodyScriptsHtml: '<script>console.log("loaded");</script>'
  };
}
```

### Post-Build

**`onPostBuild({ config, pages, outputDir, log, options })`** — Post-generation tasks
```javascript
onPostBuild: async ({ pages, log }) => {
  log(`Verified ${pages.length} pages.`);
}
```

### Assets

**`getAssets(opts)`** → return array of assets
```javascript
getAssets: (opts) => [
  { url: "https://cdn.example.com/lib.js", type: "js", location: "head" },
  { src: path.join(__dirname, "custom.css"), dest: "assets/css/custom.css", type: "css", location: "head" }
]
```

### Dev Server

**`onDevServerReady(server, wss)`** — Access raw Node.js server
```javascript
onDevServerReady: async (server, wss) => {
  // Custom WebSocket handlers
  wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
      // Handle message
    });
  });
}
```

### Interactive (Dev Only)

**`actions`** — WebSocket RPC handlers
```javascript
actions: {
  "my-plugin:save": async (payload, ctx) => {
    const content = await ctx.readFile(payload.file);
    await ctx.writeFile(payload.file, content + "\n" + payload.note);
    return { saved: true };
  }
}
```

**`events`** — Fire-and-forget handlers
```javascript
events: {
  "my-plugin:analytics": async (payload, ctx) => {
    // Log analytics event
    console.log("Page view:", payload.path);
  }
}
```

### Translations

**`translations(localeId)`** → return locale strings
```javascript
translations: (localeId) => {
  const strings = {
    en: { search: "Search", nav: "Navigation" },
    de: { search: "Suchen", nav: "Navigation" }
  };
  return strings[localeId] || strings.en;
}
```

## PageContext

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

## ActionContext

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

## Complete Example

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

## Best Practices

1. **Always declare capabilities** — Plugins can only use hooks they declare
2. **Use async/await** — Hooks may be called concurrently
3. **Keep plugins stateless** — Engine may re-initialize them
4. **Prefix action names** — Use `my-plugin:action-name` format
5. **Use log() for output** — Respects user verbosity settings
6. **Handle errors gracefully** — Broken plugins shouldn't crash builds
7. **Use worker tasks** — Offload CPU-intensive work
8. **Test in isolation** — Use `onBeforeBuild` for setup, `onPostBuild` for verification

## Publishing

1. Create npm package with `docmd-plugin-` prefix
2. Export plugin as default
3. Include README with configuration options
4. Add `docmd-plugin` keyword in package.json
5. Test with real docmd project

## See Also

- [API Reference](./api.md) — URL utilities and helper functions
- [Plugins Reference](./plugins.md) — Built-in plugin configuration