---
description: Reference for docmd CLI commands, flags, environment variables, and exit codes. Use when running docmd commands (`init`, `dev`, `build`, `serve`, `doctor`, `validate`, `live`, `stop`, `deploy`, `migrate`, `mcp`, `add`, `remove`).
when_to_use: |
  Read this file when you are:
  - Looking up a command or flag (`--host`, `--no-open`, `--strict`, `--offline`, `--port`, `--json`, `--fix`, `--force`, `--dry-run`, `-y`)
  - Deciding between `docmd dev` (local HMR), `docmd build` (static output), and `docmd serve` (production HTTP server with `/healthz`, `/mcp`, and `serve.actions`)
  - Running `docmd doctor` (with `--fix` or `--json`) to audit environment, routes, assets, and plugins
  - Running docmd in headless / AI agent / CI environments (`--no-open` / `DOCMD_NO_OPEN=true`, `--strict` / `DOCMD_STRICT=true`)
audience: user
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# CLI Reference

Full docs:
* CLI Commands — https://docs.docmd.io/reference/cli-commands/
* Production Server (`docmd serve`) — https://docs.docmd.io/deployment/docmd-serve

## Installation {#installation}

```bash
# Install as dev dependency (Node.js >= 20 required)
npm install -D @docmd/core
pnpm add -D @docmd/core
yarn add -D @docmd/core
bun add -D @docmd/core

# Zero-install runner
npx @docmd/core <command> [options]
```

## Commands Overview {#commands}

| Command | Description |
|:--|:--|
| `docmd init` | Scaffold a new project — creates `docs/index.md`, `docs/skills.md`, `docmd.config.json`, `assets/`, and `package.json` |
| `docmd dev` | Start local development server with HMR (`127.0.0.1:3000` by default; auto-increments port if busy) |
| `docmd build` | Compile production static site to `site/` (or configured `out` directory) |
| `docmd serve` | Build once and run the production HTTP server (Gzip/Deflate, security headers, `GET /healthz`, opt-in `POST /mcp` & `serve.actions`) |
| `docmd doctor` | Run pre-flight environment, asset, navigation route, template, and plugin diagnostics (`--fix` auto-installs missing official deps) |
| `docmd validate` | Lint internal markdown links, images, and assets (`--json` for CI, `--strict` to fail on any missing reference) |
| `docmd live` | Launch browser-based Live Editor (`--build-only` to emit bundle without starting server) |
| `docmd stop` | Terminate active `docmd dev` and `docmd serve` servers |
| `docmd deploy` | Generate deployment configs for Docker, nginx, Caddy, Vercel, Netlify, or GitHub Pages |
| `docmd migrate` | Migrate from Docusaurus, MkDocs, VitePress, Starlight, or upgrade legacy docmd configs (`--upgrade`, `--dry-run`) |
| `docmd mcp` | Start Model Context Protocol (MCP) server over `stdio` (pure JSON-RPC 2.0, banner suppressed) |
| `docmd add <name>` | Install an official plugin or template (`@docmd/plugin-*` / `@docmd/template-*`) and inject config |
| `docmd remove <name>` | Uninstall a plugin/template and remove its config entry |

## Global Flags {#global-flags}

| Flag | Short | Env Var Equivalent | Description |
|:--|:--|:--|:--|
| `--config <path>` | `-c` | `DOCMD_CONFIG` | Path to config file (auto-discovers `docmd.config.json`, `.jsonc`, `.ts`, `.js`) |
| `--cwd <path>` | | | Override working directory before running the command |
| `--host <address>` | | `DOCMD_HOST` | Network interface to bind (`127.0.0.1` default; use `0.0.0.0` for LAN/Docker) |
| `--port <number>` | `-p` | `DOCMD_PORT` / `PORT` | Server port (default: `3000`) |
| `--no-open` | | `DOCMD_NO_OPEN=true` | Never auto-open a browser window (always pass in CI, Docker, or AI agent sessions) |
| `--strict` | | `DOCMD_STRICT=true` | Fail build/validation with exit code `1` on any missing sourced file, asset, or broken container |
| `--verbose` | `-V` | `DOCMD_VERBOSE=true` | Print detailed build, plugin, and package manager logs |
| `--json` | | | Output machine-readable JSON (`validate`, `doctor`) and suppress TUI banner |
| `--version` | `-v` | | Print installed `@docmd/core` version |
| `--help` | `-h` | | Print CLI help |

## Command-Specific Flags & Behaviour {#command-specific-flags}

### `init` {#init}

- `--force` — Overwrite existing `docmd.config.*`, `docs/index.md`, and `docs/skills.md`
- `--yes` (`-y`) — Answer "yes" to prompts in non-interactive/CI shells

### `dev` {#dev}

- `--port <n>` (`-p`) — Starting port (default `3000`; auto-increments to `3001`, etc., if busy)
- `--host <address>` — Bind address (default `127.0.0.1`; pass `--host 0.0.0.0` to expose on LAN/container)
- `--no-open` — Do not open the system browser on startup

> **Tip for AI agents:** Always run `npx @docmd/core dev --no-open` (or set `DOCMD_NO_OPEN=true`) when starting the dev server from an automated shell.

### `build` {#build}

- `--offline` (`DOCMD_OFFLINE=true`) — Rewrite internal links to `.html` suffixes and bypass external network fetches for local `file://` browsing
- `--strict` — Fail immediately if any sourced playground script (`src="..."`) or referenced asset is missing

> Note: `--offline` output is for `file://` zip distribution and is incompatible with SPA routing on web hosts.

### `serve` (New in v0.10.0) {#serve}

Builds the site once in production mode and serves it with Gzip/Deflate compression, CSP/HSTS/Frame security headers, and zero file-watching overhead:

```bash
npx @docmd/core serve
npx @docmd/core serve --host 0.0.0.0 --port 8080
```

- `--host <address>` — Precedence: `--host` → `DOCMD_HOST` → `config.serve.host` → `127.0.0.1`
- `--port <number>` (`-p`) — Precedence: `--port` → `PORT` → `config.serve.port` → `3000`. Unlike `dev`, **`serve` exits with code `1` if the port is already in use**.
- Exposes `GET /healthz` (`503` with `Retry-After: 1` during initial build; `200` `{"status":"ok","version":"..."}` once ready).
- Supports opt-in `POST /mcp` (`serve.mcp.enabled: true`) and authenticated WebSocket plugin actions (`serve.actions.enabled: true`). See [deployment.md](./deployment.md#production-server-docmd-serve).

### `doctor` (New in v0.10.0) {#doctor}

Runs non-destructive pre-flight diagnostics across your environment and project:

```bash
npx @docmd/core doctor
npx @docmd/core doctor --fix
npx @docmd/core doctor --json
```

- `--fix` — Automatically installs missing official `@docmd/plugin-*` or `@docmd/template-*` packages using your detected package manager
- `--json` — Emits structured JSON diagnostics for CI pipelines
- Checks: Node.js version (`>=20`), OS/architecture, engine availability (`js`, `rust`, `python`), `src` directory, logo/favicon/banner image paths on disk, `navigation.json` / `config.navigation` route targets against `.md`/`.mdx` files, installed vs missing plugins/templates, and custom plugin `onDoctorCheck` hooks.

### `validate` {#validate}

```bash
npx @docmd/core validate
npx @docmd/core validate --json
npx @docmd/core validate --strict
```

- `--json` — Outputs a JSON array of broken links (`[]` when clean)
- `--strict` — Enforces strict validation failure rules

### `migrate` {#migrate}

```bash
npx @docmd/core migrate --docusaurus
npx @docmd/core migrate --mkdocs
npx @docmd/core migrate --vitepress
npx @docmd/core migrate --starlight
npx @docmd/core migrate --upgrade
npx @docmd/core migrate --upgrade --dry-run
```

- `--docusaurus` / `--mkdocs` / `--vitepress` / `--starlight` — Migrate from another framework (backs up original to `<source>-backup/`)
- `--upgrade` — Upgrade legacy docmd config keys in-place
- `--dry-run` — Preview migration changes without writing to disk
- Calling `docmd migrate` with no source flag prints usage and exits with code `1`.

### `deploy` {#deploy}

```bash
npx @docmd/core deploy --docker --nginx --caddy --vercel --netlify --github-pages [--force]
```

- Generates deployment config files in the project root (does not push to cloud providers). Use `--force` to overwrite existing files.

### `stop` {#stop}

- `--port <n>` (`-p`) — Stop server on a specific port
- `--force` (`-f`) — Stop servers across standard ports (`3000`, `3001`, `8080`, `8081`)

### `mcp` {#mcp}

```bash
npx @docmd/core mcp
```

- Starts the Model Context Protocol server over `stdio` (JSON-RPC 2.0). TUI banners are automatically suppressed on `stdout` so MCP clients (Claude Desktop, Cursor, Windsurf, Claude Code) receive clean protocol frames.

## Package Manager & Pre-Flight Auto-Detection {#package-manager-detection}

`docmd add`, `docmd remove`, `docmd doctor --fix`, and the build-time pre-flight installer (`preflightEnsureRuntimeDeps`) detect your package manager by lockfile:
1. `pnpm-lock.yaml` → `pnpm`
2. `yarn.lock` → `yarn`
3. `bun.lockb` → `bun`
4. Fallback → `npm`

## Exit Codes {#exit-codes}

- `0` — Success
- `1` — Build, validation, `serve` port/config, `migrate` missing-arg, or `doctor` error
- `2` — Configuration error
- `3` — Fatal plugin error

## See Also {#see-also}

- [config.md](./config.md) — `docmd.config.json` schema consumed by the CLI
- [deployment.md](./deployment.md) — `docmd serve` and `docmd deploy` in detail
- [validation.md](./validation.md) — `docmd validate` and `docmd doctor` CI workflows
- [api-user.md](./api-user.md) — programmatic equivalents (`buildSite`, `dev`, `serve`, `buildLive`) and MCP tools