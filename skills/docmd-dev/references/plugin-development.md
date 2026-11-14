---
description: Guide to building custom plugins for docmd. Covers the runtime PluginDescriptor, package.json#docmd manifest namespace, ESM exports, 14 capabilities (including server, doctor, and template), requiresLiveServer, conditional assets, production action host (docmd serve), and resolvedAssets.
when_to_use: |
  Read this file when you are:
  - Writing a new docmd plugin from scratch or updating an official `@docmd/plugin-*` package
  - Adding the required `package.json#docmd` manifest namespace and `exports["."].default` condition
  - Picking the right capability for the hook you need (`server`, `doctor`, `actions`, `assets`, etc.)
  - Implementing conditional asset loading (`AssetCondition`) so pages without your feature pay 0 KB overhead
  - Implementing action/event handlers that work in both `docmd dev` and `docmd serve` (`ctx.mode`, `ctx.caller.identity`)
audience: dev
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Plugin Development

Full docs:
* Building Plugins — https://docs.docmd.io/development/building-plugins
* Plugin Examples — https://docs.docmd.io/development/plugin-examples
* Plugin Usage — https://docs.docmd.io/plugins/usage

## 1. Plugin Descriptor (Runtime) {#plugin-structure}

Every plugin must export a `plugin` descriptor — plugins without a valid descriptor are rejected at load time.

```javascript
export default {
  plugin: {
    name: 'my-plugin',                              // Unique identifier
    version: '1.0.0',                               // Valid semver string
    capabilities: ['head', 'build', 'post-build'],  // Strict allowlist of hook categories used
    requiresLiveServer: false                       // Optional: true if client assets need dev/serve RPC
  },
  // ... hooks
};
```

Naming conventions:
- Official plugins live in `packages/plugins/<name>/` and publish as `@docmd/plugin-<name>` (configured via shorthand `"<name>"`).
- Community plugins should prefix with `docmd-plugin-` and are configured in `docmd.config.json` by their **full npm package name** (there is no alias system for third-party plugins, preventing supply-chain confusion).

## 2. The `package.json#docmd` Manifest Namespace & ESM Exports {#manifest-namespace}

Every official plugin, template, and engine in the monorepo **must** declare a `docmd` block in its `package.json` (introduced in 0.8.9, single source of truth in 0.9.0+ replacing the legacy `plugins.json`). The build-time registry generator reads this block during `pnpm build` of `@docmd/api` and cross-checks that `docmd.capabilities` matches the runtime `PluginDescriptor.capabilities`.

```json "package.json"
{
  "name": "@docmd/plugin-foo",
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
  "docmd": {
    "key": "foo",
    "kind": "plugin",
    "displayName": "Foo",
    "tagline": "One-line summary shown in catalogues and docmd doctor",
    "capabilities": ["head", "build", "post-build", "doctor"],
    "requiresLiveServer": false
  }
}
```

- **ESM `exports["."].default` is mandatory**: Always include `"default": "./dist/index.js"` alongside `"import"`. Without `"default"`, Node's CJS resolver throws `ERR_PACKAGE_PATH_NOT_EXPORTED` on the auto-installer's first resolution pass.
- **`requiresLiveServer: true`**: Use this for interactive plugins that rely on the WebSocket RPC bridge (like `@docmd/plugin-threads`). During static `docmd build`, docmd automatically omits the plugin's client assets (`getAssets`, `generateScripts`, `generateMetaTags`) while keeping `markdownSetup` active so containers still parse cleanly. Under `docmd dev` (and `docmd serve` with `serve.actions.enabled: true`), client assets are included. Users can override per-site with `devOnly: false` / `liveOnly: false`.

## 3. Capabilities → Hooks (14 Capabilities) {#capabilities}

Capabilities are a **strict allowlist**. Implementing a hook without declaring its capability in `plugin.capabilities` causes the hook to be ignored (and triggers a build-time registry warning in the monorepo).

| Capability | Allowed Hooks | Phase |
|:--|:---|:--|
| `init` | `onConfigResolved` | Init — read/modify normalised config after load |
| `markdown` | `markdownSetup` | Setup — extend `markdown-it` parser (synchronous) |
| `head` | `generateMetaTags`, `generateScripts` (head) | Render — inject into `<head>` |
| `body` | `generateScripts` (body) | Render — inject before `</body>` |
| `build` | `onBeforeParse`, `onAfterParse`, `onBeforeBuild`, `onBeforeRender`, `onPageReady` | Build — transform content and page metadata |
| `post-build` | `onPostBuild` | Post-Build — run after all HTML and `resolvedAssets` are ready |
| `dev` | `onDevServerReady` | Dev Server — access raw Node HTTP server & `wss` (`docmd dev` only) |
| `server` | `onServerReady` | Server Host — receive `ServerHandle` in both `docmd dev` and `docmd serve` |
| `assets` | `getAssets` | Output — copy local files or inject `<link>`/`<script>` with optional `condition` |
| `actions` | `actions` | Interactive — WebSocket RPC handlers (`dev` + `serve` with `serve.actions`) |
| `events` | `events` | Interactive — fire-and-forget handlers (`dev` + `serve` with `serve.actions`) |
| `translations` | `translations` | i18n — return locale UI strings map |
| `template` | `templates`, `templateAssets` | Render — **exclusive** to template packages (cannot combine with other capabilities) |
| `doctor` | `onDoctorCheck` | Diagnostics — run custom health checks during `docmd doctor` |

## 4. Hook Signatures {#hook-signatures}

### Init & Setup {#init-setup}

```javascript
// capability: 'init'
onConfigResolved: async (config) => {
  config.title = config.title || 'My Docs';
},

// capability: 'markdown' (synchronous only!)
markdownSetup: (md, pluginOptions) => {
  md.use(myMarkdownItPlugin, pluginOptions);
}
```

### Build Phase (`capability: 'build'`) {#build-phase}

```javascript
// Modify raw markdown string before parsing
onBeforeParse: async (src, frontmatter, filePath) => {
  return src;
},

// Modify rendered markdown HTML body before template wrapping
onAfterParse: async (html, frontmatter, filePath) => {
  return html;
},

// Heavy pre-computation / indexing across all parsed pages before HTML rendering
onBeforeBuild: async ({ config, pages, tui, options, runWorkerTask }) => {
  tui.step('Indexing content', 'WAIT');
  // ... process pages ...
  tui.step('Indexing content', 'DONE');
},

// Mutate page.frontmatter or page.html in-place before EJS template runs
onBeforeRender: async (page) => {
  page.frontmatter.wordCount = page.html.split(/\s+/).length;
},

// Inspect fully assembled page object right before disk write
onPageReady: async (page) => {
  // page.outputPath, page.urls, etc.
}
```

### Head, Body & Conditional Assets (`head`, `body`, `assets`) {#assets-and-injection}

Prefer `getAssets()` with `condition` over unconditional script injection so pages that do not use your plugin's syntax load **0 KB** of extra CSS/JS (used by `@docmd/plugin-playground`, `@docmd/plugin-mermaid`, `@docmd/plugin-math`):

```javascript
// capability: 'assets'
getAssets: (pluginOptions) => [
  {
    path: path.join(__dirname, 'assets/my-plugin.css'),
    url: 'assets/css/my-plugin.css',
    type: 'css',
    position: 'head',
    priority: 20,
    condition: {
      pageHtmlMatches: ['class="my-widget"', 'data-my-widget'],
      // or frontmatterHas: 'myPlugin'
    }
  },
  {
    path: path.join(__dirname, 'assets/my-plugin.js'),
    url: 'assets/js/my-plugin.js',
    type: 'js',
    position: 'body',
    priority: 20,
    attributes: { defer: true },
    condition: { pageHtmlMatches: 'class="my-widget"' }
  }
]
```

For per-page dynamic tags or inline config scripts:

```javascript
// capability: 'head'
generateMetaTags: async (config, page, relativePathToRoot) => {
  return `<meta name="x-page-slug" content="${page.urls?.slug || ''}">`;
},

// capability: 'head' and/or 'body'
generateScripts: (config, options) => ({
  headScriptsHtml: '',
  bodyScriptsHtml: '<script>window.__MY_PLUGIN__ = true;</script>'
})
```

### Post-Build & `resolvedAssets` (`capability: 'post-build'`) {#post-build}

`onPostBuild` receives an immutable, deeply frozen `resolvedAssets` array (`readonly ResolvedAsset[]`) representing all plugin and template asset declarations resolved for the build:

```javascript
// capability: 'post-build'
onPostBuild: async ({ config, pages, outputDir, resolvedAssets, tui, log, options, runWorkerTask }) => {
  log(`Verified ${pages.length} pages and ${resolvedAssets.length} declared assets.`);
}
```

### Server Lifecycle & Production Actions (`server`, `actions`, `events`) {#server-and-actions}

In v0.10.0, plugin actions run in both `docmd dev` and `docmd serve` (when `serve.actions.enabled: true`).

```javascript
// capability: 'server'
onServerReady: async (handle) => {
  // handle.mode: 'dev' | 'serve'
  // handle.projectRoot, handle.config
  // handle.rebuild(files?), handle.broadcast(event, data)
  const timer = setInterval(() => handle.rebuild(), 60_000);
  handle.onShutdown(() => clearInterval(timer));
},

// capability: 'actions'
actions: {
  'my-plugin:save-note': async (payload, ctx) => {
    // Under `serve`, ctx.caller.identity holds the value of `serve.actions.identityHeader`.
    // In `dev`, ctx.caller.identity is always null.
    const author = ctx.caller.identity || (ctx.mode === 'dev' ? 'local' : null);
    if (!author) throw new Error('Authentication required to save notes');

    const content = await ctx.readFile(payload.file);
    await ctx.writeFile(payload.file, `${content}\n\n> Note by ${author}: ${payload.note}`);
    // Note: ctx.writeFile automatically triggers a rebuild in both dev and serve!
    // Use ctx.requestRebuild(files) only if you modified files outside ctx.writeFile.
    return { saved: true };
  }
},

// capability: 'events'
events: {
  'my-plugin:viewed': (data, ctx) => {
    // Fire-and-forget handler
  }
}
```

> **Security contract under `docmd serve`:** `ctx.writeFile` and `ctx.source` automatically reject writes when `ctx.caller.identity` is `null`. Never bypass `ctx.writeFile` with raw `fs.writeFile` on untrusted paths or unauthenticated callers.

### Doctor Diagnostics (`capability: 'doctor'`) {#doctor-check}

Plugins can register custom pre-flight checks executed by `npx @docmd/core doctor`:

```javascript
// capability: 'doctor'
onDoctorCheck: async ({ projectRoot, config, pluginOptions, mode }) => {
  const results = [];
  if (!pluginOptions?.apiKey && !process.env.MY_PLUGIN_KEY) {
    results.push({
      name: 'my-plugin: credentials',
      status: 'warn', // 'ok' | 'warn' | 'error'
      message: 'No API key configured for my-plugin',
      hint: 'Set MY_PLUGIN_KEY in your environment or plugins["my-plugin"].apiKey in docmd.config.json',
      fixable: false
    });
  } else {
    results.push({
      name: 'my-plugin: credentials',
      status: 'ok',
      message: 'API key configured'
    });
  }
  return results;
}
```

### Scoping on `noStyle` Pages {#nostyle-scope}

Plugins run on `noStyle: true` landing pages by default. Export `noStyle: false` on your plugin module if its scripts/styles should be skipped on `noStyle` pages unless explicitly opted in via page frontmatter (`plugins: { myPlugin: true }`).

## See Also {#see-also}

- [api-dev.md](./api-dev.md) — `loadPlugins`, `createActionDispatcher`, `ActionContext`, `ServerHandle`, URL utilities
- [template-development.md](./template-development.md) — `capabilities: ['template']`
- [engines.md](./engines.md) — offloading work via `runWorkerTask` and engine helpers
- [security-and-regression-checklist.md](./security-and-regression-checklist.md) — plugin output-injection and security rules