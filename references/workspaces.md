---
description: Multi-project workspace configuration. Use when managing multiple documentation sites from a single repository.
when_to_use: |
  Read this file when you are:
  - Hosting multiple doc sites from a single repo (e.g. main + SDK + CLI)
  - Adding a project switcher to the UI
  - Configuring sub-paths per project (`base: "/sdk/"`)
  - Building/dev'ing all projects at once
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-15
---

# Workspaces

Workspaces are for multi-project monorepos where one repo publishes several docs sites under different paths. For a single docs site, a regular `docmd.config.json` is sufficient.

Build multiple documentation projects from one repository with shared configuration.

## Use Cases {#use-cases}

```
docs.example.com/        → Main docs
docs.example.com/sdk/    → SDK reference
docs.example.com/cli/    → CLI docs
```

## Structure {#structure}

```
my-workspace/
├── assets/              ← Shared assets
├── main-docs/
│   ├── docmd.config.json
│   └── docs/
├── sdk-docs/
│   ├── docmd.config.json
│   └── docs/
├── docmd.config.json    ← Workspace root
└── package.json
```

A workspace requires the root `docmd.config.json` to be a workspace config (have a `workspace` key). If the root config looks like a regular project config, docmd treats the whole repo as a single project and ignores the subfolder configs.

## Workspace Configuration {#workspace-config}

Root `docmd.config.json`:

```json
{
  "workspace": {
    "projects": [
      { "prefix": "/",    "src": "main-docs", "title": "Docs" },
      { "prefix": "/sdk", "src": "sdk-docs",  "title": "SDK" }
    ],
    "switcher": {
      "enabled": true,
      "position": "sidebar-top"
    }
  },
  "theme": { "appearance": "system" },
  "logo": { "light": "assets/logo-dark.svg", "dark": "assets/logo-light.svg" }
}
```

Exactly one project must use `prefix: "/"`. If two projects claim root, the build fails.

## Workspace Options {#workspace-options}

| Key | Type | Description |
|:--|:--|:--|
| `projects` | Array | Project entries (one must use `prefix: "/"`) |
| `switcher` | Object | Project switcher UI settings |

## Project Entry {#project-entry}

| Key | Required | Description |
|:--|:--|:--|
| `prefix` | Yes | URL prefix (`"/"` for root) |
| `src` | Yes | Project directory |
| `title` | — | Display name in switcher |

`prefix` must start with `/`. `/sdk` and `/sdk/` are treated differently: the trailing-slash form is for "directory at root", the no-slash form is for "sub-path under root".

## Project Config {#project-config}

Each project can override root defaults:

`sdk-docs/docmd.config.json`:
```json
{
  "title": "SDK Reference",
  "navigation": [
    { "title": "Overview", "path": "/" },
    { "title": "API", "path": "/api/" }
  ]
}
```

Project-level `title` overrides the root `title` for that project's pages, but the project entry's `title` (in `workspace.projects[].title`) is what the switcher shows.

## Global Cascading {#global-cascading}

Root config keys cascade to all projects:
- `theme`
- `logo`
- `menubar`
- `plugins` (project-level can override)
- `layout`

Not all keys cascade. `navigation`, `url`, `out`, `src` are per-project and not cascaded. Setting `navigation` at root has no effect.

## Project Switcher {#project-switcher}

Built-in UI component for switching between projects.

```json
"switcher": {
  "enabled": true,
  "position": "sidebar-top"  // or "sidebar-bottom"
}
```

The switcher only shows up if there are two or more projects.

## Building Workspaces {#building-workspaces}

```bash
# Build all projects
docmd build

# Dev server for all projects
docmd dev

# Build specific project
docmd build --project sdk-docs
```

`docmd dev` for a workspace starts one dev server per project with a different port for each. If a port is busy, that project's dev server fails to start while others keep running.

## API {#api}

```javascript
import { 
  detectWorkspace, 
  buildWorkspace, 
  devWorkspace, 
  isWorkspace 
} from '@docmd/core';

const config = await detectWorkspace('./docmd.config.json');

if (isWorkspace(config)) {
  await buildWorkspace(config, { quiet: false });
}
```

`detectWorkspace` returns `null` for non-workspace configs; null-check before calling `isWorkspace`.

`devWorkspace` runs multiple dev servers concurrently. There is no graceful shutdown across them — use `docmd stop` to clean up.

## Deployment {#deployment}

Each project outputs to its own directory:

```
site/           ← Root project
site/sdk/       ← SDK project
site/cli/       ← CLI project
```

Configure base paths for subdirectory hosting:

SDK project:
```json
{
  "base": "/sdk/"
}
```

The `base` in project config must match the `prefix` in the workspace project entry. If they diverge, internal asset links break.

## See Also {#see-also}

- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [config.md](./config.md) — full config schema, including `base`, `url`, and per-project overrides
- [deployment.md](./deployment.md) — multi-project deployment topology
- [api.md](./api.md) — `detectWorkspace`, `buildWorkspace`, `isWorkspace` signatures
