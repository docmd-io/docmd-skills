---
description: Reference for docmd CLI commands, flags, and options. Use when running docmd commands or understanding CLI capabilities.
when_to_use: |
  Read this file when you are:
  - Looking up a flag for a specific command (`--offline`, `--port`, `--json`, `--force`, etc.)
  - Deciding which subcommand to run (init vs dev vs build vs live vs deploy vs validate vs mcp)
  - Wiring docmd into a CI pipeline (exit codes, `--json` output, `--config` overrides)
  - Understanding which package manager `docmd add` will use
audience: user
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# CLI Reference

Full docs:
* CLI Commands - https://docs.docmd.io/reference/cli-commands/

## Installation {#installation}

```bash
# Install as dev dependency
npm install -D @docmd/core

# Or use pnpm/yarn/bun
pnpm add -D @docmd/core
yarn add -D @docmd/core
bun add -D @docmd/core

# Zero-install runner (no global install needed)
npx @docmd/core <command>
```

## Commands {#commands}

| Command | Description |
|:--|:--|
| `docmd init` | Scaffold new project — creates `docs/index.md`, `docmd.config.json`, `package.json` scripts, and `SKILL.md` |
| `docmd dev` | Start dev server with hot reload. Default port `3000`, auto-increments if busy |
| `docmd build` | Build production static site to `site/` directory |
| `docmd live` | Launch browser-based Live Editor — isomorphic engine runs in-browser for instant preview |
| `docmd stop` | Kill running dev servers on common ports |
| `docmd deploy` | Generate deployment configs for Docker, nginx, Caddy, Vercel, Netlify, GitHub Pages |
| `docmd migrate` | Upgrade legacy config keys to modern schema (e.g. `siteTitle` → `title`) |
| `docmd validate` | Lint all internal markdown links. Use `--json` for CI/CD output |
| `docmd mcp` | Start MCP server over stdio for AI agent integration (JSON-RPC 2.0) |
| `docmd add <plugin>` | Install official plugin — auto-detects package manager, injects config |
| `docmd remove <plugin>` | Uninstall plugin and clean its config entry |

## Global Flags {#global-flags}

| Flag | Short | Description |
|:--|:--|:--|
| `--config <path>` | `-c` | Path to config file. Default: `docmd.config.json` |
| `--verbose` | `-V` | Show detailed build/install logs |
| `--version` | `-v` | Print installed version |
| `--help` | `-h` | Show help menu |
| `--cwd <path>` | | Override working directory (useful for monorepos) |

## Command-Specific Flags {#command-specific-flags}

### dev {#dev}

- `--port <n>` (`-p`) — Server port. Default: `3000`

Note: `docmd dev` auto-increments the port when 3000 is busy. The actual port is printed in the startup log line; scripts should parse it from there rather than hardcoding 3000.

### build {#build}

- `--offline` — Rewrite links to `.html` for local `file://` browsing

Note: `build --offline` rewrites every internal link to end in `.html`, which is incompatible with SPA navigation. Use it only for `file://` distribution, not as a substitute for `dev`.

### deploy {#deploy}

- `--docker` — Generate Dockerfile
- `--nginx` — Generate nginx config
- `--caddy` — Generate Caddy config
- `--github-pages` — Generate GitHub Pages workflow
- `--vercel` — Generate Vercel config
- `--netlify` — Generate Netlify config
- `--force` — Overwrite existing files

Note: `docmd deploy` generates config files but does not perform the deployment. Use the corresponding platform CLI (`vercel`, `netlify`, `docker build`, etc.) to push.

### stop {#stop}

- `--port <n>` (`-p`) — Kill server on specific port
- `--force` (`-f`) — Also kill `serve` processes

### validate {#validate}

- `--json` — Output JSON array of broken links for CI pipelines

### live {#live}

- `--build-only` — Generate Live Editor bundle without starting server
- `--port <n>` (`-p`) — Server port for Live Editor

## Zero-Config Mode {#zero-config-mode}

If no `docmd.config.json` exists, the engine auto-detects source from:
- `docs/`
- `src/docs/`
- `documentation/`
- Any folder with `.md` files

Navigation, titles, search, and TOC are set up automatically.

## Examples {#examples}

### Initialize New Project {#initialize-new-project}

```bash
npx @docmd/core init
# Creates: docs/index.md, docmd.config.json, package.json scripts
```

### Development Server {#development-server}

```bash
docmd dev
docmd dev --port 4000
docmd dev --config ./custom.config.json
```

### Production Build {#production-build}

```bash
docmd build
docmd build --offline  # For file:// browsing
docmd build --config ./prod.config.json
```

### Deploy Configuration {#deploy-configuration}

```bash
docmd deploy --docker --nginx
docmd deploy --vercel --netlify --force
```

### Validation in CI/CD {#validation-in-cicd}

```bash
docmd validate --json > validation.json
# Check exit code or parse JSON output
```

### MCP for AI Agents {#mcp-for-ai-agents}

```bash
docmd mcp
# Starts JSON-RPC 2.0 server over stdio
```

## Package Manager Detection {#package-manager-detection}

`docmd add` and `docmd remove` auto-detect your package manager by lockfile presence:
1. Checks for `pnpm-lock.yaml` → uses pnpm
2. Checks for `yarn.lock` → uses yarn
3. Checks for `bun.lockb` → uses bun
4. Falls back to npm

## Exit Codes {#exit-codes}

- `0` — Success
- `1` — Build/validation error
- `2` — Configuration error
- `3` — Plugin error

## See Also {#see-also}

- [SKILL.md §2](../SKILL.md#2-core-commands) — which command to reach for in most cases
- [SKILL.md §4](../SKILL.md#4-mcp-server) — full MCP section
- [config.md](./config.md) — site config that the CLI consumes
- [api.md](./api.md) — programmatic equivalent of these commands
- [deployment.md](./deployment.md) — what `docmd deploy` actually generates
- [validation.md](./validation.md) — CI/CD patterns for `validate --json`