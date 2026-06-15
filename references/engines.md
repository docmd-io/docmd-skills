---
description: Build engine architecture and configuration. Use when optimizing build performance or configuring engines.
when_to_use: |
  Read this file when you are:
  - Deciding between the JS and Rust build engines
  - Diagnosing slow build performance
  - Writing or registering a custom build engine
  - Understanding silent fallback from Rust to JS
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-15
---

# Engines

docmd features a pluggable engine architecture for file processing.

## Available Engines {#available-engines}

| Engine | ID | Default | Use Case |
|:--|:--|:--|:--|
| JavaScript | `"js"` | Yes | Standard sites, universal compatibility |
| Rust | `"rust"` | No | Large repos (1000+ files), CI/CD optimization |

## Configuration {#configuration}

```json
{
  "engine": "js"
}
```

Or via environment variable:

```bash
DOCMD_ENGINE=rust npx @docmd/core build
```

`engine: "rust"` falls back to JS silently if the platform-specific binary is unavailable. The build log contains an `[engine]` line indicating which engine actually ran.

## JavaScript Engine {#js-engine}

Default engine — runs everywhere Node.js runs.

- Zero-configuration
- Cross-platform (Windows, macOS, Linux)
- Works in all environments (local, CI/CD, serverless)
- Thread pool: 4 workers (configurable)

Best for:
- Small to medium sites (<1000 files)
- Development and prototyping
- Cross-platform compatibility

## Rust Engine (Preview) {#rust-engine}

High-performance engine — optimized for large repositories.

- Tokio-based async I/O
- Multi-threaded file discovery
- Platform-specific binaries (amd64, arm64)
- Falls back to JS if binaries unavailable

APIs and binary availability can change between minor docmd versions.

Best for:
- Enterprise documentation (1000+ files)
- CI/CD pipelines
- Performance-critical builds

Requirements:
- Linux, macOS, or Windows (amd64/arm64)
- Pre-built binaries downloaded automatically

The Rust engine downloads platform-specific binaries on first use. In an air-gapped CI environment, this will fail. Either pre-warm the cache or set `engine: "js"` explicitly.

## Engine Selection {#engine-selection}

### Automatic Fallback {#engine-auto-fallback}

```javascript
import { loadEngine } from '@docmd/api';

// Tries Rust, falls back to JS
const engine = await loadEngine('rust');
```

`loadEngine('rust')` returns a JS engine if Rust is unavailable. The returned object's `.name` is the reliable way to know which one was loaded.

### Manual Override {#engine-manual}

Set in config:

```json
{
  "engine": "rust"
}
```

Or via CLI:

```bash
DOCMD_ENGINE=rust
npx @docmd/core build
```

## Performance Comparison {#performance}

| Metric | JS Engine | Rust Engine |
|:--|:--|:--|
| 100 files | ~2s | ~1s |
| 1000 files | ~15s | ~5s |
| 5000 files | ~60s | ~15s |

*Benchmarks on standard CI hardware*

These numbers are aspirational. Actual perf depends on disk I/O, plugin overhead (semantic search, sitemap, llms generation), and the number of frontmatter-rendered pages. Measure with your own workload before betting on Rust.

## Architecture {#architecture}

Both engines share:
- Thread isolation — workers don't block main loop
- Task verification — strict allowlists for security
- Plugin compatibility — same API surface

While the plugin API is the same, the serialization boundary between JS plugins and the Rust engine goes through N-API. Plugins that ship huge page objects pay a serialization tax on every build.

Limitations:
- Serialization overhead for large JSON across N-API boundary
- Rust requires OS-specific binaries

## Custom Engines {#custom-engines}

Register custom engines:

```javascript
import { registerEngine } from '@docmd/api';

registerEngine('custom', {
  name: 'custom',
  build: async (config, options) => {
    // Custom build logic
  }
});
```

`registerEngine` replaces the default for that ID; it does not add alongside. If you register `'js'`, you override the built-in. Pick a unique ID for your custom engine.

## See Also {#see-also}

- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [api.md](./api.md) — `loadEngine`, `registerEngine` signatures
- [config.md](./config.md) — where the `engine` key lives
- [plugin-development.md](./plugin-development.md) — plugin capabilities that interact with engines