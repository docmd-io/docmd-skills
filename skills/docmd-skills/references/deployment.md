---
title: Deployment & Hosting
description: Guide to deploying docmd 0.10.0 sites using docmd serve, the public/ static root asset pipeline, Docker, GitHub Actions, nginx, Caddy, Vercel, and Netlify.
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Deployment & Hosting

## 1. Public Static Root Assets Pipeline (`public/` & `config.static`)

Introduced in `v0.10.0`, `docmd` automatically copies every file inside your project's top-level **`public/`** directory verbatim to the root of your output directory (`site/`).

Use `public/` for root-level verification, routing, and crawler files that must live at `/<filename>` rather than `/assets/<filename>`:

```text
my-docs/
├── public/
│   ├── robots.txt                 → site/robots.txt
│   ├── CNAME                      → site/CNAME
│   ├── favicon.ico                → site/favicon.ico
│   ├── _redirects                 → site/_redirects
│   └── .well-known/
│       └── security.txt           → site/.well-known/security.txt
├── assets/                        → site/assets/
├── docs/
└── docmd.config.js
```

- **Custom Directory**: Override the directory name via `static: 'static-root'` in `docmd.config.js`, or disable root copying with `static: false`.
- **Conflict Precedence**: `public/` files are copied before page compilation; if a generated page or `robots.txt` from `@docmd/plugin-seo` targets the same path, explicit files in `public/` take precedence when `seo` does not overwrite them (or configure `plugins.seo` accordingly).

---

## 2. Production HTTP Server (`docmd serve`)

`docmd 0.10.0` includes a hardened zero-config production HTTP server (`docmd serve`) designed for Docker containers, Kubernetes pods, and private internal documentation servers.

```bash
# Build and serve in two steps
docmd build
docmd serve --host 0.0.0.0 --port 4173

# Or build + serve in one command
docmd serve --build --host 0.0.0.0 --port 4173
```

### `docmd dev` vs `docmd serve`

| Capability | `docmd dev` | `docmd serve` |
|------------|-------------|---------------|
| File watchers (`chokidar`) & WebSocket HMR | Enabled | **Disabled** (zero watcher overhead) |
| Gzip / Deflate compression | Disabled | **Enabled** |
| Security headers (`CSP`, `HSTS`, `X-Frame-Options`, `X-Content-Type-Options`) | Relaxed for HMR | **Hardened** |
| Health check probe | — | **`GET /healthz`** (`200 OK` JSON) |
| Plugin server actions (`/__docmd/action`) | Always enabled (`ctx.mode === 'dev'`) | **Opt-in** via `serve.actions.enabled: true` (`ctx.mode === 'serve'`) |
| MCP over HTTP (`POST /mcp`) | — | **Opt-in** via `serve.mcp.enabled: true` |

### Host & Port Resolution Precedence

1. CLI flags (`--host`, `--port` / `-p`)
2. `docmd.config.js` (`serve.host`, `serve.port`)
3. Environment variables (`HOST`, `PORT`)
4. Defaults (`127.0.0.1:4173` for `serve`, `127.0.0.1:3000` for `dev`)

### Enabling Live Server Actions (`@docmd/plugin-threads`, etc.) in Production

By default, `docmd serve` is strictly read-only. To allow live plugins such as `@docmd/plugin-threads` to persist changes in production behind an authenticating reverse proxy (e.g. Cloudflare Access, Pomerium, oauth2-proxy):

```javascript
// docmd.config.js
export default defineConfig({
  serve: {
    host: '0.0.0.0',
    port: 4173,
    actions: {
      enabled: true,
      origins: ['https://docs.internal.example.com'], // Strict Origin allow-list
      identityHeader: 'x-forwarded-email',            // Header populated by your auth proxy
    },
  },
});
```

When `identityHeader` is configured, `docmd serve` rejects any write action missing that header with `401 Unauthenticated` and passes the verified user identity to plugins as `ctx.caller.identity`.

### Enabling Stateless MCP over HTTP (`POST /mcp`)

Expose your documentation to remote AI agents and Claude Code over HTTP:

```javascript
// docmd.config.js
export default defineConfig({
  serve: {
    mcp: { enabled: true },
  },
});
```

Connect from Claude Code:

```bash
claude mcp add --transport http my-docs https://docs.internal.example.com/mcp
```

---

## 3. Docker & Kubernetes Deployment

```dockerfile
# Stage 1 — Build static site and indexes
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx docmd build

# Stage 2 — Production server
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/docmd.config.js ./
COPY --from=builder /app/site ./site
COPY --from=builder /app/docs ./docs

EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:4173/healthz || exit 1

CMD ["npx", "docmd", "serve", "--host", "0.0.0.0", "--port", "4173"]
```

---

## 4. GitHub Actions (`docmd-io/deploy`) & GitHub Pages

### Option A — Official `docmd-io/deploy` Action

```yaml
name: Deploy Documentation
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full git history for @docmd/plugin-git
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx docmd doctor
      - run: npx docmd build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./site
      - uses: actions/deploy-pages@v4
```

### Subpath Hosting (`base`)

When deploying to a GitHub Pages repository subpath (`https://<org>.github.io/<repo>/`), set `base` in `docmd.config.js`:

```javascript
export default defineConfig({
  siteUrl: 'https://org.github.io',
  base: '/repo-name',
});
```

---

## 5. Static Hosting Providers (Vercel, Netlify, Cloudflare Pages, nginx, Caddy)

| Provider | Build Command | Output Directory | Node Version |
|----------|---------------|------------------|--------------|
| **Vercel** | `npx docmd build` | `site` | `20.x` or `22.x` |
| **Netlify** | `npx docmd build` | `site` | `20` or `22` |
| **Cloudflare Pages** | `npx docmd build` | `site` | `20` or `22` |

### nginx Configuration

```nginx
server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docmd/site;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    error_page 404 /404.html;
}
```

### Caddy Configuration (`Caddyfile`)

```caddyfile
docs.example.com {
    root * /var/www/docmd/site
    encode zstd gzip
    try_files {path} {path}/ {path}.html
    file_server
    handle_errors {
        @404 expression {http.error.status_code} == 404
        rewrite @404 /404.html
        file_server
    }
}
```