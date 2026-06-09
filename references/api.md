---
description: Complete API reference for docmd including Node.js API, browser API, MCP server, and utilities. Use when integrating docmd programmatically or building advanced plugins.
---

# API Reference

Full docs:
* Node API - https://docs.docmd.io/api/node-api/
* Browser API - https://docs.docmd.io/api/browser-api/
* Client Events - https://docs.docmd.io/api/client-side-events/

## Node.js Build API (`@docmd/core`)

### buildSite

Build static site — same as `docmd build`

```javascript
import { buildSite } from "@docmd/core";

await buildSite("./docmd.config.json", {
  isDev: false,      // true = dev mode (no minification, enables HMR assets)
  offline: false,    // true = rewrite links to .html for file:// browsing
  zeroConfig: false  // true = skip config file, auto-detect everything
});
```

### buildLive

Generate browser-based Live Editor bundle

```javascript
import { buildLive } from "@docmd/core";

await buildLive({ 
  serve: false,  // Start dev server
  port: 3000     // Server port
});
```

### Workspace Functions

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

## URL Utilities (`@docmd/api`)

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

## Pre-computed Page URLs

Every `page` object in plugin hooks has pre-computed URLs:

```javascript
page.urls.slug       // 'guide/'
page.urls.canonical  // 'https://docs.example.com/guide/' (if config.url set)
page.urls.pathname   // '/guide/'
```

## Browser API

### Isomorphic Compile Engine

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

**Limitations:**
- No filesystem access in browser
- Provide `navigation` array explicitly
- Node-only plugins (sitemap, LLMs) disabled

### Dev-Mode Plugin API (`window.docmd`)

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

## SPA Client-Side Events

docmd uses an SPA router — `DOMContentLoaded` won't re-fire on navigation.

```javascript
document.addEventListener("docmd:page-mounted", (event) => {
  const { url } = event.detail;  // Absolute URL of newly mounted page
  // Re-init third-party libraries here
});
```

## MCP Server

Full docs:
* MCP Server - https://docs.docmd.io/api/mcp-server/

Start MCP server for AI agent integration:

```bash
docmd mcp  # stdio transport, JSON-RPC 2.0
```

### Protocol Details

- **Transport:** stdio (stdin/stdout), one JSON-RPC message per line
- **Protocol version:** `2025-03-26`
- **Lifecycle:** `initialize` → `notifications/initialized` → tool calls
- **Health checks:** `ping` supported
- **Diagnostics:** Logged to stderr (never pollutes JSON-RPC stream)

### Available Tools

| Tool | Input | Description |
|:--|:--|:--|
| `search_docs` | `{ query: string }` | Full-text search across all docs |
| `read_doc` | `{ route: string }` | Read raw markdown by relative path |
| `validate_docs` | `{}` | Lint all internal links |
| `get_llms_context` | `{}` | Return full `llms-full.txt` content |

### Client Configuration

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "docmd": {
      "command": "npx",
      "args": ["@docmd/core", "mcp"],
      "cwd": "/path/to/project"
    }
  }
}
```

**Cursor / Windsurf:**
```json
{
  "command": "npx @docmd/core mcp",
  "transport": "stdio"
}
```

### Security

- Local only — no network ports, no external connections
- File access sandboxed to project root
- No telemetry

## Plugin System Utilities (`@docmd/api`)

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

## TypeScript Types

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
  Engine
} from '@docmd/api';
```

All exports from `@docmd/api` are also available from `@docmd/core`.

**Recommendation:** New projects should prefer `@docmd/api` for better tree-shaking.

## See Also

- [Plugin Development](./plugin-development.md) — Building custom plugins
- [Configuration](./config.md) — Configuration schema