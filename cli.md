# docmd CLI & Setup
> Full docs: [CLI Commands](https://docs.docmd.io/api/cli-commands/)

## Installation
```bash
npm install -D @docmd/core   # or pnpm/yarn/bun
npx @docmd/core <command>    # zero-install runner, no global install needed
```

## Commands

| Command | Description |
|:--|:--|
| `docmd init` | Scaffold project — creates `docs/index.md`, `docmd.config.json`, `package.json` scripts, `SKILL.md` |
| `docmd dev` | Dev server with hot reload. Default port `3000`, auto-increments if busy |
| `docmd build` | Production static site output to `site/` directory |
| `docmd live` | Browser-based Live Editor — isomorphic engine runs in-browser for instant preview |
| `docmd stop` | Kill running dev servers on common ports |
| `docmd deploy` | Generate deployment configs for Docker, nginx, Caddy, Vercel, Netlify, GitHub Pages |
| `docmd migrate` | Upgrade legacy config keys to modern schema (e.g. `siteTitle` → `title`) |
| `docmd validate` | Lint all internal markdown links. Use `--json` for machine-readable CI/CD output |
| `docmd mcp` | Start MCP server over stdio for AI agent integration (JSON-RPC 2.0) |
| `docmd add <plugin>` | Install official plugin — auto-detects package manager, injects config |
| `docmd remove <plugin>` | Uninstall plugin and clean its config entry |

## Global Flags
- `--config <path>` (`-c`) — Path to config file. Default: `docmd.config.json`
- `--verbose` (`-V`) — Show detailed build/install logs
- `--version` (`-v`) — Print installed version
- `--help` (`-h`) — Show help menu
- `--cwd <path>` — Override working directory (useful for monorepo setups)

## Per-Command Flags
- **dev**: `--port <n>` (`-p`) — Server port. Default: `3000`
- **build**: `--offline` — Rewrite links to `.html` for local `file://` browsing
- **deploy**: `--docker` · `--nginx` · `--caddy` · `--github-pages` · `--vercel` · `--netlify` · `--force`
- **stop**: `--port <n>` (`-p`) · `--force` (`-f`) — Also kill `serve` processes
- **validate**: `--json` — Output JSON array of broken links for CI pipelines

## Zero-Config
If no `docmd.config.json` exists, the engine auto-detects source from `docs/`, `src/docs/`, `documentation/`, or any folder with `.md` files. Navigation, titles, search, and TOC are set up automatically.