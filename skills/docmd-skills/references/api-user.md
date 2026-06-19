---
description: Programmatic build API for docmd — Node.js build/live functions, browser isomorphic compile, MCP server, and SPA client-side events. Use when integrating docmd into Node scripts or browser code as a user.
when_to_use: |
  Read this file when you are:
  - Calling docmd programmatically from Node (build, dev, workspace orchestration)
  - Embedding the docmd Live Editor / compile engine in a browser
  - Listening for SPA client-side events to wire third-party scripts
  - Connecting an MCP-aware host to the docmd docs site

  For plugin-author internals (`@docmd/api` package, URL utilities, action dispatcher, source tools, engine loader), see [api-dev.md](../../docmd-dev/references/api-dev.md).
audience: user
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# API Reference (User)

Use this when calling docmd from your own code as a **user of the tool**. If you're writing a docmd plugin, custom template, or modifying the engine itself, load [api-dev.md](../../docmd-dev/references/api-dev.md) instead.

Prefer `@docmd/api` over `@docmd/core` for type-only or utility imports. They are re-exported from `core`, but `api` has the focused surface that tree-shakes cleanly.

Full docs:
* Node API - https://docs.docmd.io/reference/build-api/
* Browser API - https://docs.docmd.io/reference/browser-api/
* Client Events - https://docs.docmd.io/reference/client-side-events/

## Node.js Build API (`@docmd/core`) {#node-build-api}

### buildSite {#buildsite}

Build static site — same as `docmd build`.

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

Generate browser-based Live Editor bundle.

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

## See Also {#see-also}

- [SKILL.md §4](../SKILL.md#4-mcp-server) — full MCP section with handshake sequence
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [api-dev.md](../../docmd-dev/references/api-dev.md) — for plugin-author internals (`@docmd/api`, URL utilities, action dispatcher, engine loader, types)
