---
description: Multi-project workspace configuration. Use when managing multiple documentation sites from a single repository.
---

# Workspaces

Build multiple documentation projects from one repository with shared configuration.

## Use Cases

```
docs.example.com/        → Main docs
docs.example.com/sdk/    → SDK reference
docs.example.com/cli/    → CLI docs
```

## Structure

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

## Workspace Configuration

**Root `docmd.config.json`:**

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

## Workspace Options

| Key | Type | Description |
|:--|:--|:--|
| `projects` | Array | Project entries (one must use `prefix: "/"`) |
| `switcher` | Object | Project switcher UI settings |

## Project Entry

| Key | Required | Description |
|:--|:--|:--|
| `prefix` | ✅ | URL prefix (`"/"` for root) |
| `src` | ✅ | Project directory |
| `title` | — | Display name in switcher |

## Project Config

Each project can override root defaults:

**`sdk-docs/docmd.config.json`:**
```json
{
  "title": "SDK Reference",
  "navigation": [
    { "title": "Overview", "path": "/" },
    { "title": "API", "path": "/api/" }
  ]
}
```

## Global Cascading

Root config keys cascade to all projects:
- `theme`
- `logo`
- `menubar`
- `plugins` (project-level can override)
- `layout`

## Project Switcher

Built-in UI component for switching between projects.

```json
"switcher": {
  "enabled": true,
  "position": "sidebar-top"  // or "sidebar-bottom"
}
```

## Building Workspaces

```bash
# Build all projects
docmd build

# Dev server for all projects
docmd dev

# Build specific project
docmd build --project sdk-docs
```

## API

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

## Deployment

Each project outputs to its own directory:

```
site/           ← Root project
site/sdk/       ← SDK project
site/cli/       ← CLI project
```

Configure base paths for subdirectory hosting:

**SDK project:**
```json
{
  "base": "/sdk/"
}
```

## See Also

- [Configuration](./config.md) — Full config schema
- [Deployment](./deployment.md) — Multi-project deployment
- [API Reference](./api.md) — Workspace API