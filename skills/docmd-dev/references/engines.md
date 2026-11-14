---
description: Pluggable build engine architecture and configuration (JS, Rust N-API, and Python 3 stdio engines). Use when optimising build performance, working on engine adapters, or calling engine task helpers from plugins.
when_to_use: |
  Read this file when you are:
  - Deciding between the JavaScript (`"js"`), Rust (`"rust"`), and Python (`"python"`) build engines
  - Understanding why the double-serialisation tax makes Rust/Python faster for I/O and vectors but slower for tiny in-memory JS tasks
  - Using `@docmd/api` task helpers (`discoverFiles`, `readFilesBatch`, `getGitLog`, `chunkText`, `quantizeVectors`, `cosineSimilarity`)
  - Managing engine lifecycles (`shutdownEngines()`, `engine.shutdown()`, `engine.destroy()`)
  - Writing or registering a custom build engine (`registerEngine`)
audience: dev
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Engines Architecture (`js`, `rust`, `python`)

Full docs:
* Engines Overview — https://docs.docmd.io/development/engines/overview
* JavaScript Engine — https://docs.docmd.io/development/engines/js
* Rust Engine — https://docs.docmd.io/development/engines/rust
* Python Engine — https://docs.docmd.io/development/engines/python

## 1. Available Engines {#available-engines}

docmd decouples build orchestration from heavy I/O and vector computation through three pluggable engines under `packages/engines/`:

| Engine | ID | Package | Default | Target Use Case | Key Strength |
|:--|:--|:--|:--|:--|:--|
| **JavaScript** | `"js"` | `@docmd/engine-js` | **Yes** | Standard sites (<1,000 files), local `dev`, universal CI portability | Zero-config, zero cross-process serialisation tax, runs everywhere Node.js >=20 runs |
| **Rust (Preview)** | `"rust"` | `@docmd/engine-rust` (+ `@docmd/engine-rust-<platform>`) | No | Massive repos (1,000+ files), cold CI/CD builds, deep Git logs | Tokio multi-threaded file discovery/reads and `git:log` harvesting (~1.24× faster Git, ~25% cold build speedup) |
| **Python** | `"python"` | `@docmd/engine-python` | No | Large repos, semantic vector search (`docmd-search`), zero-binary cross-platform acceleration | Persistent Python 3.8+ `ThreadPoolExecutor` stdio worker; native `search:chunk`, Float32→Int8 `search:quantize`, and `search:cosine` without native C/Rust binaries |

## 2. Configuration & Loud Fallback {#configuration}

Configure in `docmd.config.json`:

```json "docmd.config.json"
{
  "engine": "js" // "js" | "rust" | "python"
}
```

Or via environment variable:

```bash
DOCMD_ENGINE=rust npx @docmd/core build
DOCMD_ENGINE=python npx @docmd/core build
```

**Auto-install & loud fallback contract:**
- When `"engine": "rust"` or `"engine": "python"` is configured, docmd's pre-flight dependency manager (`preflightEnsureRuntimeDeps`) or `loadEngine()` auto-installs `@docmd/engine-rust` or `@docmd/engine-python` if missing.
- If the platform binary is unsupported (Rust) or Python 3.8+ is not on `PATH` (Python), `loadEngine()` **emits a visible warning** explaining the reason and falls back to `"js"` so the build still succeeds deterministically. Never fail silently without a warning.

## 3. Architectural Trade-Offs: The Double-Serialisation Tax {#double-serialisation-tax}

Both external engines cross a process/FFI boundary:

- **Rust Engine (`@docmd/engine-rust`)**:
  `JS Worker → JSON.stringify() → N-API Boundary → Serde Deserialise → [Rust Tokio Task] → Serde Serialise → N-API → JSON.parse()`
  - **Wins on**: `file:discover`, `file:readBatch`, `git:log`, cold-start disk I/O.
  - **Loses on**: CPU-bound full-text `search:index` over large document arrays where N-API JSON serialisation costs more than V8 JIT string handling.

- **Python Engine (`@docmd/engine-python`)**:
  `JS Worker → JSON.stringify() → stdio Pipe → Python Worker (runner.py) → [Python Task] → Serialise → stdio Pipe → JSON.parse()`
  - **Wins on**: `file:discover`, `file:readBatch`, `git:log` (~1.20× faster), and batch semantic vector tasks (`search:chunk`, `search:quantize`, `search:cosine`).
  - **Loses on**: Single tiny file reads (`file:read`) or iterative micro-tasks where IPC round-trip latency exceeds V8 in-memory execution.

### Supported Rust Platform Packages {#rust-platform-packages}

`@docmd/engine-rust` lazy-loads the matching platform package from `packages/engines/rust-binaries/`:
- `@docmd/engine-rust-darwin-arm64` (macOS Apple Silicon)
- `@docmd/engine-rust-darwin-x64` (macOS Intel)
- `@docmd/engine-rust-linux-x64-gnu` (Linux x64 glibc)
- `@docmd/engine-rust-linux-arm64-gnu` (Linux ARM64 glibc)
- `@docmd/engine-rust-win32-x64-msvc` (Windows x64)

## 4. Security Allowlist & Plugin Task API (`@docmd/api`) {#plugin-task-api}

Plugins do not call `engine.run()` with arbitrary task names. `@docmd/api` enforces `ALLOWED_TASK_TYPES`:

- **File tasks**: `file:discover`, `file:read`, `file:readBatch`, `file:write`, `file:exists`
- **Git tasks**: `git:log`, `git:status`
- **Search & Vector tasks**: `search:index`, `search:query`, `search:chunk`, `search:quantize`, `search:cosine`

Use the typed convenience helpers from `@docmd/api`:

```typescript
import {
  resolveEngine,
  discoverFiles,
  readFilesBatch,
  getGitLog,
  buildSearchIndex,
  chunkText,
  quantizeVectors,
  cosineSimilarity,
  shutdownEngines
} from '@docmd/api';

// Try preferred accelerators in order; falls back to 'js'
const engine = await resolveEngine(['rust', 'python', 'js']);

// File & Git operations
const files    = await discoverFiles(engine, './docs', ['.md', '.mdx'], ['drafts/**']);
const contents = await readFilesBatch(engine, files.map(f => f.path));
const gitLogs  = await getGitLog(engine, files.map(f => f.path), 5);

// Vector operations (Python engine or JS fallback)
const chunks = await chunkText(engine, markdownSource, 'guide.md', 256, 32);
const { quantized, mins, ranges } = await quantizeVectors(engine, embeddings, 384);
const topK = await cosineSimilarity(engine, queryEmbedding, corpusEmbeddings, 10);
```

## 5. Engine Lifecycle & Resource Cleanup {#engine-lifecycle}

Introduced in v0.9.7: all engines implement optional `shutdown()` and `destroy()` hooks on the `Engine` interface.
- Core `build` and `dev` pipelines call `await shutdownEngines()` on completion to terminate persistent subprocesses (such as the Python stdio worker pool) and release native handles cleanly so Node exits without hanging.
- If you write a custom CLI script or test runner that calls `loadEngine()` or `resolveEngine()` directly, always call `await shutdownEngines()` in a `finally` block.

## 6. Registering a Custom Engine {#custom-engines}

```typescript
import { registerEngine, type Engine } from '@docmd/api';

const customEngine: Engine = {
  name: 'custom',
  version: '1.0.0',
  async run(task) {
    return { success: true, data: {} };
  },
  async shutdown() {
    // Clean up workers
  }
};

registerEngine('custom', async () => customEngine);
```

Built-in engine IDs (`'js'`, `'rust'`, `'python'`) must not be silently hijacked by plugins; pick a unique identifier for custom engines.

## See Also {#see-also}

- [api-dev.md#engine-loader-api](./api-dev.md#engine-loader-api) — full TypeScript signatures for engine helpers
- [plugin-development.md](./plugin-development.md) — `runWorkerTask` inside `PageContext`, `BeforeBuildContext`, `PostBuildContext`, and `ActionContext`
- [security-and-regression-checklist.md](./security-and-regression-checklist.md) — engine fallback and subprocess security rules