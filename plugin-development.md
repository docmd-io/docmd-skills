# docmd Plugin Development
> Full docs: [Building Plugins](https://docs.docmd.io/plugins/building-plugins/) · [Plugin Usage](https://docs.docmd.io/plugins/usage/)

## Plugin Structure
Every plugin must export a `plugin` descriptor — plugins without it are rejected at load time.
```javascript
export default {
  plugin: {
    name: "my-plugin",           // Unique identifier. Community convention: prefix with "docmd-plugin-"
    version: "1.0.0",
    capabilities: ["head", "build", "post-build"]  // Declares which hooks this plugin uses (see table below)
  },
  // ... hooks
};
```

## Capabilities → Allowed Hooks

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

**`markdownSetup(md, opts)`** — Extend [markdown-it](https://github.com/markdown-it/markdown-it) instance. Synchronous only.
**`generateMetaTags(config, page, relativePathToRoot)`** → return HTML string to inject in `<head>`
**`generateScripts(config, opts)`** → return `{ headScriptsHtml: "...", bodyScriptsHtml: "..." }`
**`onBeforeParse(src, frontmatter, filePath?)`** → return modified markdown string before parsing
**`onAfterParse(html, frontmatter, filePath?)`** → return modified HTML string after markdown→HTML
**`onBeforeBuild({ pages, tui })`** — Heavy data fetching/indexing. Use `tui.step()` / `tui.progress()` for progress bars.
**`onBeforeRender(page)`** — Mutate `page.frontmatter` or `page.html` before template rendering
**`onPageReady(page)`** — Access final assembled page just before write to disk
**`onPostBuild({ config, pages, outputDir, log, options })`** — Post-generation tasks. Use `log()` for verbosity-aware output.
**`onDevServerReady(server, wss)`** — Raw Node.js HTTP server + WebSocket server during `docmd dev`
**`getAssets(opts)`** → return `[{ url|src, dest, type: "js"|"css", location: "head"|"body" }]`
**`translations(localeId)`** → return `Record<string, string>` of translated UI strings

## PageContext (available in build hooks)
```typescript
interface PageContext {
  sourcePath: string;              // Absolute path to source .md file
  frontmatter: Record<string, any>; // Parsed YAML frontmatter (mutable in onBeforeRender)
  html: string;                     // Rendered HTML body (mutable in onBeforeRender)
  localeId?: string;                // Current locale (e.g. "en", "de")
  versionId?: string;               // Current version (e.g. "v0.8")
  relativePathToRoot?: string;      // Relative path back to site root
  runWorkerTask<T>(module: string, fn: string, args: any[]): Promise<T>; // Offload CPU work
}
```

## Minimal Example
```javascript
export default {
  plugin: { name: "my-plugin", version: "1.0.0", capabilities: ["head", "build", "post-build"] },

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
Register in config: `"plugins": { "my-plugin": {} }`

## WebSocket RPC Actions (dev mode only)
```javascript
actions: {
  "my-plugin:save": async (payload, ctx) => {
    const content = await ctx.readFile(payload.file);
    await ctx.writeFile(payload.file, content + "\n" + payload.note);
    return { saved: true };  // Returned to browser via docmd.call()
  }
}
```

### ActionContext (`ctx`) — available in actions and events
| Method | Description |
|:--|:--|
| `ctx.readFile(path)` | Read file relative to project root |
| `ctx.writeFile(path, content)` | Write file — triggers rebuild + browser reload |
| `ctx.readFileLines(path)` | Read file as `string[]` |
| `ctx.broadcast(event, data)` | Push event to all connected browsers |
| `ctx.runWorkerTask(module, fn, args)` | Offload to worker pool |
| `ctx.source` | Source editing tools (see [api.md](./api.md)) |
| `ctx.projectRoot` | Absolute path to project root |
| `ctx.config` | Current docmd config object |

All file operations sandboxed to project root.

## Asset Injection
```javascript
getAssets: (opts) => [
  { url: "https://cdn.example.com/lib.js", type: "js", location: "head" },    // CDN link
  { src: path.join(__dirname, "init.js"), dest: "assets/js/init.js", type: "js", location: "body" }  // Local file copy
]
```

## noStyle Scoping
Export `noStyle: false` to prevent your plugin from rendering on `noStyle: true` pages.
Override per-user: `"plugins": { "my-plugin": { "noStyle": false } }`
Override per-page: frontmatter `plugins: { my-plugin: true }`

## Best Practices
1. Always declare `plugin` descriptor with explicit `capabilities`
2. Use `onBeforeRender` for per-page data injection, `onBeforeBuild` for bulk operations
3. Always use `async/await` — hooks may be called concurrently
4. Keep plugins stateless — engine may re-initialise them
5. Prefix community packages: `docmd-plugin-*`
6. Prefix action names: `my-plugin:action-name`
7. Use `log()` in `onPostBuild` to respect user verbosity settings
