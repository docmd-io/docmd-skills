---
description: Build engine architecture and configuration. Use when optimizing build performance or configuring engines.
---

# Engines

docmd features a pluggable engine architecture for file processing.

## Available Engines

| Engine | ID | Default | Use Case |
|:--|:--|:--|:--|
| JavaScript | `"js"` | ✅ | Standard sites, universal compatibility |
| Rust | `"rust"` | ❌ | Large repos (1000+ files), CI/CD optimization |

## Configuration

```json
{
  "engine": "js"
}
```

## JavaScript Engine

**Default engine** — runs everywhere Node.js runs.

- Zero-configuration
- Cross-platform (Windows, macOS, Linux)
- Works in all environments (local, CI/CD, serverless)
- Thread pool: 4 workers (configurable)

**Best for:**
- Small to medium sites (<1000 files)
- Development and prototyping
- Cross-platform compatibility

## Rust Engine (Preview)

**High-performance engine** — optimized for large repositories.

- Tokio-based async I/O
- Multi-threaded file discovery
- Platform-specific binaries (amd64, arm64)
- Falls back to JS if binaries unavailable

**Best for:**
- Enterprise documentation (1000+ files)
- CI/CD pipelines
- Performance-critical builds

**Requirements:**
- Linux, macOS, or Windows (amd64/arm64)
- Pre-built binaries downloaded automatically

## Engine Selection

### Automatic Fallback

```javascript
import { loadEngine } from '@docmd/api';

// Tries Rust, falls back to JS
const engine = await loadEngine('rust');
```

### Manual Override

Set in config:
```json
{
  "engine": "rust"
}
```

Or via CLI:
```bash
DOCMD_ENGINE=rust docmd build
```

## Performance Comparison

| Metric | JS Engine | Rust Engine |
|:--|:--|:--|
| 100 files | ~2s | ~1s |
| 1000 files | ~15s | ~5s |
| 5000 files | ~60s | ~15s |

*Benchmarks on standard CI hardware*

## Architecture

Both engines share:
- **Thread isolation** — Workers don't block main loop
- **Task verification** — Strict allowlists for security
- **Plugin compatibility** — Same API surface

**Limitations:**
- Serialization overhead for large JSON across N-API boundary
- Rust requires OS-specific binaries

## Custom Engines

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

## See Also

- [API Reference](./api.md) — Engine API
- [Configuration](./config.md) — Engine config