---
description: Deployment options and CI/CD integration for docmd. Use when deploying documentation or setting up automated builds.
---

# Deployment Reference

## GitHub Template

The fastest way to start a new documentation site with docmd is to use the official template repository. This gives you a pre-configured project with GitHub Actions workflow already set up for automatic deployment to GitHub Pages.

Template repository: https://github.com/docmd-io/docmd-template

### Quick Start

1. Go to https://github.com/docmd-io/docmd-template and click "Use this template"
2. Create your repository with a name of your choice
3. Edit docmd.config.json and update the title and url fields
4. Push any change to the main branch — the site deploys automatically

Your site will be live at https://username.github.io/repo-name/

### What's Included

The template includes these key files:

- .github/workflows/docs.yml — GitHub Actions workflow that builds and deploys on every push to main
- docmd.config.json — Site configuration with title, URL, and output directory settings
- docs/index.md — Your first documentation page
- package.json — Scripts for local development (npm run dev, npm run build)

### Local Development

To work on your documentation locally:

```bash
npm install
npm run dev
```

This starts a development server at http://localhost:3000 with live reload.

To build for production:

```bash
npm run build
```

This outputs to the site/ directory (or whatever is configured as "out" in your config).

### First-Time Setup

GitHub Pages must be configured to deploy from GitHub Actions rather than from a branch. This is a one-time step per repository:

1. Go to your repository Settings
2. Navigate to Pages section
3. Under Source, select "GitHub Actions"
4. Save the settings

After this, every push to main triggers an automatic deployment.

## GitHub Actions

For existing repositories that already have a different structure, you can add the docmd GitHub Action directly to any workflow file. The action is available at the GitHub Marketplace: https://github.com/marketplace/actions/build-and-deploy-documentation-with-docmd

The action source code is at: https://github.com/docmd-io/deploy

### Basic Usage

Add these steps to any GitHub Actions workflow:

```yaml
jobs:
  docs:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v6
      - uses: docmd-io/deploy@v1.1
        id: build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: ${{ steps.build.outputs.site-dir }}
      - uses: actions/deploy-pages@v5
        id: deploy
```

### Reusable Workflow

For the minimum boilerplate, use the hosted reusable workflow:

```yaml
on:
  push:
    branches: [main]

jobs:
  docs:
    uses: docmd-io/deploy/.github/workflows/deploy.yml@v1.1
```

This handles permissions, checkout, build, upload, and deploy in a single line.

### What the Action Does

The docmd-io/deploy action performs these steps automatically:

1. Sets up Node.js using the specified version (default: 20)
2. Detects your docmd.config.json anywhere in the repository tree (searches up to two levels deep)
3. Falls back to running npx @docmd/core init if no config file is found
4. Installs dependencies — runs npm ci if package.json exists, otherwise installs @docmd/core directly
5. Runs npx @docmd/core build to generate the static site
6. Outputs the site directory path via the site-dir output variable

### Inputs

| Input | Default | Description |
|-------|---------|-------------|
| node | 20 | Node.js version to use during the build |

### Outputs

| Output | Description |
|--------|-------------|
| site-dir | Relative path to the compiled site directory (e.g., site/) |

### Nested Config Support

If your docmd.config.json lives in a subdirectory (for example, packages/docs/docmd.config.json in a monorepo), the action automatically detects it and passes the --cwd flag to docmd. No manual path configuration is required.

### Pinning the Action Version

For production documentation sites, pin to a specific release tag rather than using @v1 or @v1.1:

```yaml
- uses: docmd-io/deploy@v1.0.0
```

This prevents unexpected behaviour from future minor updates.

## Manual Build Commands

### Development Build

```bash
npx @docmd/core dev
```

Starts the development server with hot module replacement. Changes to Markdown files are reflected immediately in the browser.

### Production Build

```bash
npx @docmd/core build
```

Generates the static site to the output directory. This is what runs in CI/CD pipelines.

### Offline Build

```bash
npx @docmd/core build --offline
```

Builds the site for offline or file:// browsing. Useful for generating documentation that will be distributed as a zip file or stored on media without a web server.

### Custom Config

```bash
npx @docmd/core build --config ./prod.config.json
```

Uses a specific configuration file instead of the default docmd.config.json.

### Output Directory

By default, docmd outputs to a directory named "site". You can customise this in your configuration:

```json
{
  "out": "dist"
}
```

## Deployer Command

The deploy command generates provider-specific configuration files tailored to your project. Run it from your project root where docmd.config.json lives.

### Docker

Generates a Dockerfile and .dockerignore for containerised deployment:

```bash
npx @docmd/core deploy --docker
```

To build and run your custom container:

```bash
docker build -t my-docs .
docker run -p 80:80 my-docs
```

### nginx

Generates a production-ready nginx.conf with SPA routing, gzip compression, and security headers:

```bash
npx @docmd/core deploy --nginx
```

### Caddy

Generates a Caddyfile with automatic HTTPS and SPA routing:

```bash
npx @docmd/core deploy --caddy
```

### Vercel

Generates vercel.json with build command and output directory settings:

```bash
npx @docmd/core deploy --vercel
```

Deploy using the Vercel CLI:

```bash
vercel --prod
```

### Netlify

Generates netlify.toml with build settings and SPA redirects:

```bash
npx @docmd/core deploy --netlify
```

Deploy using the Netlify CLI:

```bash
netlify deploy --prod
```

### GitHub Pages

Generates a GitHub Actions workflow file for Pages deployment:

```bash
npx @docmd/core deploy --github-pages
```

### Generating Multiple Providers

You can generate configs for multiple providers at once:

```bash
npx @docmd/core deploy --docker --nginx
```

To overwrite existing files without prompts:

```bash
npx @docmd/core deploy --docker --force
```

## CI/CD Pipeline Examples

### Full Pipeline with Validation

This workflow runs validation on every push and pull request, then deploys only on pushes to main:

```yaml
name: Docs CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v5
        with:
          node-version: '20'
      - run: npm ci
      - run: npx @docmd/core validate --json > validation.json
      - run: "[ $(jq length validation.json) -eq 0 ] || exit 1"

  deploy:
    needs: validate
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v6
      - uses: docmd-io/deploy@v1.1
        id: build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: ${{ steps.build.outputs.site-dir }}
      - uses: actions/deploy-pages@v5
        id: deploy
```

### Preview Deployments

This workflow builds a preview for every pull request:

```yaml
jobs:
  preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v5
        with:
          node-version: '20'
      - run: npm ci
      - run: npx @docmd/core build
      - uses: actions/upload-artifact@v5
        with:
          name: preview
          path: site/
```

## Environment Variables

These environment variables can be used to override default behaviour:

- DOCMD_CONFIG — Override the default config file path
- DOCMD_PORT — Override the default development server port (default: 3000)
- DOCMD_OFFLINE — Force offline mode for builds

## See Also

- [CLI Reference](./cli.md) — All available CLI commands with detailed options
- [Configuration](./config.md) — Complete configuration schema for docmd.config.json