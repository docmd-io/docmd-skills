# docmd Node.js, Browser & Plugin API
> Full docs: [Node API](https://docs.docmd.io/api/node-api/) · [Browser API](https://docs.docmd.io/api/browser-api/) · [Client Events](https://docs.docmd.io/api/client-side-events/)

## Node.js Build API (`@docmd/core`)
```javascript
import { buildSite, buildLive } from "@docmd/core";

// Build static site — same as `docmd build`
await buildSite("./docmd.config.json", {
  isDev: false,      // true = dev mode (no minification, enables HMR assets)
  offline: false,    // true = rewrite links to .html for file:// browsing
  zeroConfig: false  // true = skip config file, auto-detect everything
});

// Generate browser-based Live Editor bundle — same as `docmd live --build-only`
await buildLive({ serve: false, port: 3000 });
```

## Workspace Functions
```javascript
import { detectWorkspace, buildWorkspace, devWorkspace, isWorkspace } from "@docmd/core";

const config = await detectWorkspace("./docmd.config.json");
// Returns null if not a workspace config, or a normalised WorkspaceRootConfig

if (isWorkspace(config)) {
  await buildWorkspace(config, { quiet: false }); // Builds all projects in workspace
  // await devWorkspace(config, { quiet: false }); // Dev server for all projects
}
```

## URL Utilities (`@docmd/api`)
These are centralised URL helpers — plugins should use these instead of rolling their own.

```javascript
import { outputPathToSlug, outputPathToPathname, outputPathToCanonical,
         sanitizeUrl, buildAbsoluteUrl, resolveHref } from '@docmd/api';

outputPathToSlug('guide/index.html');           // → 'guide/'  (clean directory slug)
outputPathToSlug('index.html');                 // → '/'
outputPathToPathname('guide/index.html');       // → '/guide/' (root-relative)
outputPathToCanonical('guide/index.html', 'https://docs.example.com');  // full canonical URL
sanitizeUrl('/foo//bar');                       // → '/foo/bar' (collapse double slashes)
buildAbsoluteUrl('/', 'de/', 'v1/', 'guide/'); // → '/de/v1/guide/' (with locale+version prefix)
resolveHref('overview.md');                    // → 'overview/' (strip .md, add trailing slash)
resolveHref('external:https://github.com');    // → 'https://github.com' (external prefix)
resolveHref('raw:docs/readme.md');             // → 'docs/readme.md' (raw prefix, no transform)
```

## Pre-computed Page URLs
Every `page` object in plugin hooks has these pre-computed:
```javascript
page.urls.slug       // 'guide/'
page.urls.canonical  // 'https://docs.example.com/guide/' (only if config.url is set)
page.urls.pathname   // '/guide/'
```

## Browser API (Client-Side)

### Isomorphic Compile Engine
The same engine that builds static sites can run in the browser for live previews:
```html
<link rel="stylesheet" href="https://unpkg.com/@docmd/ui/assets/css/docmd-main.css">
<script src="https://unpkg.com/@docmd/live/dist/docmd-live.js"></script>
```
```javascript
// Compile raw markdown → full HTML document string
const html = await docmd.compile(markdownString, { title: "Preview", theme: { appearance: "light" } });
iframe.srcdoc = html;  // Render in iframe for style isolation
```
- No filesystem access in browser — provide `navigation` array explicitly
- Node-only plugins (sitemap, LLMs) are disabled in browser

### Dev-Mode Plugin API (`window.docmd`)
Only available during `docmd dev` — not included in production builds:
```javascript
// Call a server-side plugin action handler (returns Promise)
const result = await docmd.call("threads:get-threads", { file: "docs/guide.md" });

// Fire-and-forget event to server
docmd.send("analytics:page-view", { path: location.pathname });

// Subscribe to server-pushed events (returns unsubscribe function)
const unsub = docmd.on("threads:updated", (data) => { /* ... */ });

// Stash context for after next page reload
docmd.scheduleReload("scroll-restore", { scrollY: window.scrollY });
docmd.afterReload("scroll-restore", (ctx) => window.scrollTo(0, ctx.scrollY));
```

## SPA Client-Side Events
docmd uses an SPA router — `DOMContentLoaded` won't re-fire on navigation. Use:
```javascript
document.addEventListener("docmd:page-mounted", (event) => {
  const { url } = event.detail;  // Absolute URL of newly mounted page
  // Re-init third-party libraries here
});
```

## MCP Server (Model Context Protocol)
> Full docs: [MCP Server](https://docs.docmd.io/api/mcp-server/)

Start a local MCP server for AI agent integration:
```bash
docmd mcp   # stdio transport, JSON-RPC 2.0
```

### Protocol
- Transport: `stdio` (stdin/stdout), one JSON-RPC message per line
- Protocol version: `2025-03-26`
- Lifecycle: `initialize` → `notifications/initialized` → tool calls
- `ping` supported for connection health checks
- Diagnostics logged to `stderr` (never pollutes the JSON-RPC stream)

### Available Tools
| Tool | Input | Description |
|:--|:--|:--|
| `search_docs` | `{ query: string }` | Full-text search across all docs |
| `read_doc` | `{ route: string }` | Read raw markdown by relative path |
| `validate_docs` | `{}` | Lint all internal links |
| `get_llms_context` | `{}` | Return full `llms-full.txt` content |

### Client Config Examples

**Claude Desktop** (`claude_desktop_config.json`):
```json
{ "mcpServers": { "docmd": { "command": "npx", "args": ["@docmd/core", "mcp"], "cwd": "/path/to/project" } } }
```

**Cursor / Windsurf**: `{ "command": "npx @docmd/core mcp", "transport": "stdio" }`

### Security
- Local only — no network ports, no external connections
- File access sandboxed to project root
- No telemetry

## Plugin System Utilities (`@docmd/api`)
```javascript
import { loadPlugins, createActionDispatcher, createSourceTools, loadEngine, registerEngine } from "@docmd/api";

// Load and validate all plugins from config
const hooks = await loadPlugins(config, { resolvePaths: [__dirname] });

// Route WebSocket RPC messages to plugin action/event handlers
const dispatcher = createActionDispatcher({ actions, events }, { projectRoot, config, broadcast });
const { result, reload } = await dispatcher.handleCall("my-action", payload);

// Markdown source editing tools (used by action handlers)
const source = createSourceTools({ projectRoot: "/path" });
await source.getBlockAt("docs/page.md", [10, 12]);
await source.wrapText("docs/page.md", [10, 12], "important", 0, "**", "**");

// Pluggable build engine (JS default, Rust preview)
const engine = await loadEngine("rust");  // Falls back to JS if binaries unavailable
registerEngine("custom", myEngineImpl);   // Register custom engine
```

## TypeScript Types
```typescript
import type {
  PluginModule, PluginDescriptor, PluginHooks,
  PageContext, BeforeBuildContext, PostBuildContext,
  Capability, ActionContext, ActionHandler, EventHandler,
  SourceTools, BlockInfo, TextLocation, Engine
} from '@docmd/api';
```
All exports from `@docmd/api` are also available from `@docmd/core`. New projects should prefer `@docmd/api`.