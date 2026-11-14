---
description: Plugin-author and framework internals — @docmd/api package, URL utilities, action/event dispatcher (dev and serve), ServerHandle, DoctorContext, source tools, pre-flight runtime dependency installer, template resolver, engine loader (JS/Rust/Python), client runtime SDK (window.docmd), and TypeScript types.
when_to_use: |
  Read this file when you are:
  - Writing a docmd plugin (using `@docmd/api` URL helpers, action dispatcher, `ServerHandle`, `DoctorContext`, source tools)
  - Reaching for the engine loader (`js`, `rust`, `python`) or engine task helpers (`discoverFiles`, `getGitLog`, `chunkText`, `quantizeVectors`, `cosineSimilarity`)
  - Resolving which template file renders a given slot (`resolveTemplate` from `@docmd/ui`)
  - Working with the browser client bridge (`window.docmd.call`, `isLive`, `ping`) or reactive variable runtime (`window.docmd.var`)
  - Pulling TypeScript types for plugin or template authoring

  For the user-facing programmatic build API (`buildSite`, `dev`, `serve`, `buildLive`, workspace orchestration), see **api-user.md** in the **docmd-skills** skill.
audience: dev
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# API Reference (Framework & Plugin Author)

Use this when writing a **docmd plugin, custom template, or modifying the engine**. The dev-facing APIs live in `@docmd/api` (with key helpers re-exported from `@docmd/core`).

For the user-facing programmatic build API (`buildSite`/`build`, `dev`, `serve`, `buildLive`, workspace orchestration), load **api-user.md** in the **docmd-skills** skill.

## URL & Path Utilities (`@docmd/api`) {#url-utilities}

Centralised URL and path helpers re-exported from `@docmd/parser` and `@docmd/utils` — plugins **must** use these instead of custom string concatenation.

```javascript
import {
  sanitizeUrl,
  outputPathToSlug,
  outputPathToPathname,
  outputPathToCanonical,
  buildContextualUrl,
  buildRootRelativeUrl,
  buildAbsoluteContextualUrl,
  stripDefaultLocalePrefixFromHtml,
  rewriteHtmlLinks,
  createUrlContext,
  computePageUrls,
  buildAbsoluteUrl,
  resolveHref,
  normalizeInternalHref,
  safePath,
  asUserPath
} from '@docmd/api';

// Convert output path to clean directory-style slug
outputPathToSlug('guide/index.html');       // → 'guide/'
outputPathToSlug('index.html');             // → '/'
outputPathToSlug('de/v1/api/index.html');   // → 'de/v1/api/'

// Convert to root-relative pathname
outputPathToPathname('guide/index.html');   // → '/guide/'

// Build full canonical URL
outputPathToCanonical('guide/index.html', 'https://docs.example.com');
// → 'https://docs.example.com/guide/'

// Collapse double slashes (preserving protocol)
sanitizeUrl('https://docs.example.com//guide'); // → 'https://docs.example.com/guide'
sanitizeUrl('/foo//bar');                       // → '/foo/bar'

// Build absolute URL with base, locale, and version prefixes
buildAbsoluteUrl('/', 'de/', 'v1/', 'guide/');  // → '/de/v1/guide/'

// Normalise user-written markdown hrefs
resolveHref('overview.md');                 // → 'overview/'
resolveHref('external:https://github.com'); // → 'https://github.com'
resolveHref('raw:docs/readme.md');          // → 'docs/readme.md'

// Sandbox untrusted relative paths inside a project/source root
const resolved = safePath(projectRoot, asUserPath(userProvidedPath));
```

## Pre-computed Page URLs {#pre-computed-page-urls}

Every `page` object in `onBeforeBuild` and `onPostBuild` includes pre-computed URLs:

```javascript
page.urls.slug       // 'guide/'
page.urls.pathname   // '/guide/'
page.urls.canonical  // 'https://docs.example.com/guide/' (only if config.url is set)
```

`page.urls.canonical` is `undefined` when root `config.url` is not set.

## Client Runtime APIs (`window.docmd`) {#client-runtime-apis}

docmd ships two distinct client-side runtime layers under `window.docmd`:

### 1. Universal Headless Variable Runtime (`docmd-runtime.js`) {#variable-runtime}

Bundled across **all** builds and templates (`default`, `summer`, custom templates). Powers reactive `{{ user.* }}` and `variables.dynamic` tokens (`<span data-docmd-var="...">`) and live code-snippet personalisation without page reloads:

```javascript
// Read any built-in, config, or dynamic variable
const version = window.docmd.var.get('docmd.version');
const apiKey  = window.docmd.var.get('user.apiKey');

// Update a reactive variable across the DOM and code blocks
window.docmd.var.set('user.apiKey', 'sk_live_123');

// List all registered variables
const allVars = window.docmd.var.list();

// Re-hydrate dynamic markers after SPA navigation
window.docmd.sync();
```

### 2. Live Action & Server Bridge (`/__dev/docmd-api.js`) {#live-server-bridge}

Loaded during `docmd dev` and during `docmd serve` when `serve.actions.enabled: true`. Omitted in static `docmd build` output.

```javascript
// Check synchronously if the WebSocket connection to dev/serve is open
if (window.docmd && window.docmd.isLive?.()) {
  // Send an async heartbeat (system:ping) to verify end-to-end server responsiveness
  const alive = await window.docmd.ping(2000);

  // Call a server-side plugin action handler (returns Promise)
  const result = await window.docmd.call('threads:get-threads', {
    file: 'docs/guide.md'
  });

  // Fire-and-forget event to server
  window.docmd.send('analytics:page-view', {
    path: location.pathname
  });

  // Subscribe to server-pushed events (e.g. 'system:rebuilt' under serve)
  const unsub = window.docmd.on('threads:updated', (data) => {
    // Handle update
  });

  // Stash context across dev-mode page reloads
  window.docmd.scheduleReload('scroll-restore', { scrollY: window.scrollY });
  window.docmd.afterReload('scroll-restore', (ctx) => window.scrollTo(0, ctx.scrollY));
}
```

## Plugin Loader, Registry & Doctor Utilities (`@docmd/api`) {#plugin-loader-utilities}

```javascript
import {
  loadPlugins,
  hooks,
  resolvePluginName,
  resolveTemplateName,
  getPluginErrors,
  getPluginLoadErrors,
  CORE_PLUGINS,
  isCorePlugin,
  runPluginDoctorChecks,
  preflightEnsureRuntimeDeps
} from '@docmd/api';

// Load, validate descriptors/capabilities, and register all plugins
const registeredHooks = await loadPlugins(config, {
  resolvePaths: [__dirname],
  isDev: true // false in static build — omits assets for requiresLiveServer plugins
});

// Pre-flight batch auto-installer for missing official templates, plugins, engines, or docmd-search
await preflightEnsureRuntimeDeps(config, { projectRoot });

// Execute all registered plugin `onDoctorCheck` hooks (used by `docmd doctor`)
const diagnostics = await runPluginDoctorChecks({ projectRoot, config, mode: 'doctor' });
```

## Action Dispatcher & Source Tools (`@docmd/api`) {#action-dispatcher}

Used by `docmd dev` and `docmd serve` (when `serve.actions.enabled: true`) to route WebSocket RPC messages to plugin `actions` and `events`.

```javascript
import {
  createActionDispatcher,
  markFileWrittenByRpc,
  wasWrittenByRpc,
  createSourceTools
} from '@docmd/api';

const dispatcher = createActionDispatcher(
  { actions: hooks.actions, events: hooks.events },
  {
    projectRoot: '/path/to/project',
    config,
    broadcast,
    mode: 'serve', // 'dev' | 'serve'
    requestRebuild: async (files) => { /* ... */ }
  }
);

// Pass caller metadata built from the WebSocket upgrade request
const { result, reload, writtenFiles } = await dispatcher.handleCall(
  'my-plugin:save',
  payload,
  caller // ActionCaller
);

// Markdown block-level source editing tools
const source = createSourceTools({ projectRoot: '/path/to/project' });
const blocks = await source.getBlocks('docs/page.md');
const block  = await source.getBlockAt('docs/page.md', [10, 12]);
await source.wrapText('docs/page.md', [10, 12], 'important', 0, '**', '**');
```

Under `mode: 'serve'`, `ctx.writeFile` and `ctx.source` mutations automatically refuse to execute when `ctx.caller.identity` is `null` (i.e. when `serve.actions.identityHeader` is unset or absent on the upgrade request).

## Template Resolver API (`@docmd/ui`) {#template-resolver-api}

Re-exported from `@docmd/ui` (and `@docmd/core`). Resolves which `.ejs` file renders a given slot (`TemplateSlot`) on a given page.

```javascript
import { resolveTemplate, clearTemplateResolverCache } from '@docmd/ui';

const tpl = resolveTemplate({
  type: 'layout',
  pagePath: '/guide/intro.html',
  frontmatter: page.frontmatter,
  config: normalizedConfig,
  localeId: 'en',
  versionId: 'v10'
});
// → { templatePath: '/abs/.../summer/templates/layout.ejs', source: 'plugin', pluginName: 'template-summer', type: 'layout' }
```

**Resolution order**:

1. `frontmatter.template` — per-page override, wins everything
2. `config.templates[glob]` — per-section map (e.g. `{ "blog/*": "template-blog" }`)
3. `config.theme.template` — site-wide default (note: `normalizeConfig()` auto-promotes non-reserved `theme.name` values to `theme.template`)
4. Built-in default from `@docmd/ui`

Call `clearTemplateResolverCache()` if a plugin mutates `config.theme.template` or `config.templates` at runtime.

```typescript
type TemplateSlot =
  | 'layout' | '404' | 'toc' | 'navigation' | 'footer'
  | 'menubar' | 'options-menu' | 'project-switcher'
  | 'version-dropdown' | 'language-switcher' | 'banner' | 'cookie-consent';
```

## Engine Loader & Task Helpers (`@docmd/api`) {#engine-loader-api}

docmd supports three built-in engines (`'js'`, `'rust'`, `'python'`) plus custom engines via `registerEngine`.

```javascript
import {
  loadEngine,
  resolveEngine,
  isEngineAvailable,
  getAvailableEngines,
  registerEngine,
  shutdownEngines,
  runTask,
  discoverFiles,
  readFilesBatch,
  getGitLog,
  buildSearchIndex,
  chunkText,
  quantizeVectors,
  cosineSimilarity
} from '@docmd/api';

// Resolve best available engine from preference list (falls back to 'js' with a warning)
const engine = await resolveEngine(['rust', 'python', 'js']);

// File & Git helpers (allowlisted across JS, Rust, and Python engines)
const files    = await discoverFiles(engine, './docs', ['.md', '.mdx'], ['drafts/**']);
const contents = await readFilesBatch(engine, files.map(f => f.path));
const gitLogs  = await getGitLog(engine, files.map(f => f.path), 6);

// Semantic vector & chunking helpers (accelerated by Python engine, supported in JS)
const chunks = await chunkText(engine, markdownText, 'guide.md', 256, 32);
const { quantized, mins, ranges } = await quantizeVectors(engine, floatVectors, 384);
const topMatches = await cosineSimilarity(engine, queryVector, corpusVectors, 10);

// Clean up persistent worker processes (e.g. Python stdio pool / native handles)
await shutdownEngines();
```

Allowed plugin task types (`ALLOWED_TASK_TYPES`): `file:discover`, `file:read`, `file:readBatch`, `file:write`, `file:exists`, `git:log`, `git:status`, `search:index`, `search:query`, `search:chunk`, `search:quantize`, `search:cosine`.

## TypeScript Types (`@docmd/api`) {#typescript-types}

```typescript
import type {
  // Plugin system
  PluginDescriptor,
  PluginModule,
  PluginHooks,
  Capability,
  PageContext,
  BeforeBuildContext,
  PostBuildContext,
  DocConfigShape,
  PageInfoShape,
  // Action/Event & Server system
  ActionCaller,
  ServerHandle,
  ActionContext,
  ActionHandler,
  EventHandler,
  DispatchResult,
  // Source tools
  SourceTools,
  BlockInfo,
  InlineSegment,
  TextLocation,
  // Engine system
  Engine,
  EngineTask,
  EngineResult,
  EngineLoader,
  EngineInitOptions,
  BuiltinTaskType,
  FileDiscoverPayload,
  FileReadBatchPayload,
  GitLogPayload,
  SearchIndexPayload,
  // Assets
  Asset,
  AssetCondition,
  AssetKind,
  AssetPosition,
  ResolvedAsset,
  // Template system
  TemplateSlot,
  TemplateHook,
  TemplateAssetHook,
  TemplateResolutionContext,
  ResolvedTemplate,
  // Doctor diagnostics (new in 0.10.0)
  DoctorCheckResult,
  DoctorCheckStatus,
  DoctorContext,
  // URL & Path types
  UrlContext,
  PageUrls,
  UserPath,
  ScopedLogger,
  PreflightRequirements
} from '@docmd/api';
```

## See Also {#see-also}

- [plugin-development.md](./plugin-development.md) — hook signatures, `docmd` manifest namespace, capabilities, and `requiresLiveServer`
- [template-development.md](./template-development.md) — `TemplateHook`, `TemplateAssetHook`, and slot overrides
- [engines.md](./engines.md) — JS, Rust, and Python engine architecture and serialisation trade-offs
- [security-and-regression-checklist.md](./security-and-regression-checklist.md) — mandatory pre-ship gate