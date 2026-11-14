---
title: Validation, Diagnostics & Troubleshooting
description: Reference for docmd validate, docmd doctor, strict mode, link checker rules, and common build/runtime diagnostics in docmd 0.10.0.
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Validation, Diagnostics & Troubleshooting

## 1. Content & Link Validation (`docmd validate`)

`docmd validate` scans your configuration, navigation tree, internal Markdown links, and asset references without emitting a production build.

```bash
# Interactive validation report
docmd validate

# Fail with exit code 1 on any warning (recommended in CI)
docmd validate --strict

# Machine-readable JSON output for CI pipelines or AI agents
docmd validate --json
```

### Link & Asset Checker Rules (`v0.10.0`)

The built-in validator in `docmd 0.10.0` includes several accuracy improvements:

1. **Fenced Code Block Exclusion**: Links inside fenced code blocks (```` ``` ```` or `~~~`) and inline code spans are ignored so example URLs never trigger false-positive broken-link warnings.
2. **Markdown Link Titles**: Links with titles (`[Guide](./guide.md "Read the guide")`) strip the quoted title before resolving the target path.
3. **Root `/assets/` Resolution**: References to `/assets/...` resolve directly against your project root `assets/` (and `public/`) directories.
4. **Empty Alt-Text Images**: Standard decorative Markdown images (`![](./diagram.svg)`) are validated alongside titled images.
5. **Exclusion Boundary**: Files matching `config.exclude` or `.gitignore` (unless `respectGitIgnore: false`) are skipped during validation.

---

## 2. Environment & Plugin Health Checks (`docmd doctor`)

Introduced in `v0.10.0`, `docmd doctor` inspects your runtime environment, Node.js version (`>= 20.0.0`), configuration validity, git repository state, and every active plugin's `onDoctorCheck()` hook:

```bash
# Run all core and plugin diagnostics
docmd doctor

# Automatically apply safe fixes (e.g. missing directories or peer dependencies)
docmd doctor --fix

# Output structured JSON diagnostics
docmd doctor --json
```

### What `docmd doctor` Checks

| Category | Check | Resolution |
|----------|-------|------------|
| **Runtime** | Node.js `>= 20.0.0` | Upgrade Node.js to v20 LTS or v22 LTS |
| **Config** | `docmd.config.js` syntax & schema | Run `docmd migrate --dry-run` if legacy keys are detected |
| **Dependencies** | Missing optional plugins, templates, or `docmd-search` | Run `docmd doctor --fix` or `docmd build` (triggers batch pre-flight auto-install) |
| **Git** | Shallow clone detection when `@docmd/plugin-git` is active | Use `fetch-depth: 0` in GitHub Actions checkout |
| **Plugins** | Per-plugin `onDoctorCheck` diagnostics (e.g. OpenAPI spec paths, AI config, Threads storage) | Inspect reported message and suggested command |

---

## 3. Strict Mode (`--strict` / `DOCMD_STRICT=true`)

Both `docmd build` and `docmd validate` accept `--strict` (or `DOCMD_STRICT=true`):

```bash
docmd build --strict
DOCMD_STRICT=true docmd validate
```

In strict mode, any broken internal link, missing asset, unclosed container, or missing playground `src` file terminates the command with exit code `1`.

---

## 4. Common Troubleshooting Scenarios

| Symptom | Cause | Fix |
|---------|-------|-----|
| Nested `::: callout` or `::: tabs` closes early | Generic `:::` closer matched the inner container | Use explicit closing tags (`::: /callout`, `::: /tabs`, `::: /tab`, `::: /steps`, `::: /step`) |
| `{{ variable }}` renders literally or strips content | Variable name is undefined and has no fallback, or you wanted literal braces | Define the key in `variables: {}` / `DOCMD_VAR_*`, add a fallback `{{ var \|\| "default" }}`, or escape literal braces with `\{{ var }}` |
| `robots.txt` or `CNAME` is placed under `/assets/` instead of `/` | File was placed in `assets/` instead of `public/` | Move root-level static files into the top-level `public/` directory |
| `@docmd/plugin-threads` comment button does not submit under `docmd serve` | `docmd serve` is read-only by default | Enable `serve.actions.enabled: true` in `docmd.config.js` |
| `docmd mcp` fails to parse in Cursor / Claude Desktop | Older version printed startup banner to `stdout` | Upgrade to `@docmd/core >= 0.10.0` (TUI banner is suppressed on `mcp` for clean `stdio` JSON-RPC) |
| Mermaid diagrams fail to render on `file://` | Older config loaded Mermaid from an external CDN | `@docmd/plugin-mermaid` in `0.10.0` bundles Mermaid locally via an offline IIFE script automatically |
| Playground `src="./example.js"` fails to render | File path does not exist relative to page or project root | Verify path relative to the `.md` file or `src` directory; run `docmd validate --strict` |