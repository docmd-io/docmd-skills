---
description: Complete reference for docmd CLI commands, flags, and options. Use when running docmd commands or understanding CLI capabilities.
---

# CLI Reference

Full docs:
* CLI Commands - https://docs.docmd.io/api/cli-commands/

## Installation

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

## Commands

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

## Global Flags

| Flag | Short | Description |
|:--|:--|:--|
| `--config <path>` | `-c` | Path to config file. Default: `docmd.config.json` |
| `--verbose` | `-V` | Show detailed build/install logs |
| `--version` | `-v` | Print installed version |
| `--help` | `-h` | Show help menu |
| `--cwd <path>` | | Override working directory (useful for monorepos) |

## Command-Specific Flags

### dev
- `--port <n>` (`-p`) — Server port. Default: `3000`

### build
- `--offline` — Rewrite links to `.html` for local `file://` browsing

### deploy
- `--docker` — Generate Dockerfile
- `--nginx` — Generate nginx config
- `--caddy` — Generate Caddy config
- `--github-pages` — Generate GitHub Pages workflow
- `--vercel` — Generate Vercel config
- `--netlify` — Generate Netlify config
- `--force` — Overwrite existing files

### stop
- `--port <n>` (`-p`) — Kill server on specific port
- `--force` (`-f`) — Also kill `serve` processes

### validate
- `--json` — Output JSON array of broken links for CI pipelines

### live
- `--build-only` — Generate Live Editor bundle without starting server
- `--port <n>` (`-p`) — Server port for Live Editor

## Zero-Config Mode

If no `docmd.config.json` exists, the engine auto-detects source from:
- `docs/`
- `src/docs/`
- `documentation/`
- Any folder with `.md` files

Navigation, titles, search, and TOC are set up automatically.

## Examples

### Initialize New Project
```bash
npx @docmd/core init
# Creates: docs/index.md, docmd.config.json, package.json scripts
```

### Development Server
```bash
docmd dev
docmd dev --port 4000
docmd dev --config ./custom.config.json
```

### Production Build
```bash
docmd build
docmd build --offline  # For file:// browsing
docmd build --config ./prod.config.json
```

### Deploy Configuration
```bash
docmd deploy --docker --nginx
docmd deploy --vercel --netlify --force
```

### Validation in CI/CD
```bash
docmd validate --json > validation.json
# Check exit code or parse JSON output
```

### MCP for AI Agents
```bash
docmd mcp
# Starts JSON-RPC 2.0 server over stdio
```

## Package Manager Detection

`docmd add` and `docmd remove` auto-detect your package manager:
1. Checks for `pnpm-lock.yaml` → uses pnpm
2. Checks for `yarn.lock` → uses yarn
3. Checks for `bun.lockb` → uses bun
4. Falls back to npm

## Exit Codes

- `0` — Success
- `1` — Build/validation error
- `2` — Configuration error
- `3` — Plugin error