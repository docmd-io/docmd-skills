---
title: Multi-Project Workspaces
description: Configuring and building multi-project documentation monorepos with docmd.workspace.js, unified navigation, cross-project search, and AI RAG in docmd 0.10.0.
verified_against:
  docmd: "0.10.0"
  tested_on: 2026-11-14
---

# Multi-Project Workspaces (`docmd.workspace.js`)

## 1. Overview

For monorepos or multi-product documentation portals, `docmd` supports a root **`docmd.workspace.js`** (or `docmd.workspace.ts` / `docmd.workspace.mjs` / `docmd.workspace.json`) file that orchestrates multiple independent `docmd` projects into a single unified documentation site with shared header switching, cross-project search, and unified AI RAG.

```text
acme-monorepo/
├── docmd.workspace.js             # Workspace orchestrator
├── public/                        # Optional workspace-wide root static files
├── packages/
│   ├── cli/
│   │   ├── docmd.config.js
│   │   └── docs/
│   ├── sdk/
│   │   ├── docmd.config.js
│   │   └── docs/
│   └── cloud/
│       ├── docmd.config.js
│       └── docs/
└── site/                          # Unified build output
    ├── index.html                 # Hub landing page or redirect to defaultProject
    ├── cli/
    ├── sdk/
    └── cloud/
```

---

## 2. `docmd.workspace.js` Configuration

```javascript
export default {
  siteTitle: 'Acme Developer Hub',
  siteUrl: 'https://docs.acme.example.com',
  out: 'site',
  defaultProject: 'cli',

  // Member projects
  projects: [
    {
      id: 'cli',
      name: 'Acme CLI',
      path: './packages/cli',       // Path to directory containing docmd.config.js
      base: '/cli',                 // Mount subpath in unified output
      icon: 'terminal',
      description: 'Command-line interface and automation tools.',
    },
    {
      id: 'sdk',
      name: 'TypeScript SDK',
      path: './packages/sdk',
      base: '/sdk',
      icon: 'code',
      description: 'Client libraries for Node.js and browsers.',
    },
    {
      id: 'cloud',
      name: 'Acme Cloud API',
      path: './packages/cloud',
      base: '/cloud',
      icon: 'cloud',
      description: 'Managed control plane and REST API.',
    },
  ],

  // Optional hub landing page (or omit to redirect / → defaultProject)
  hub: {
    enabled: true,
    title: 'Acme Documentation Portal',
    description: 'Everything you need to build with Acme.',
  },

  // Shared theme and plugin overrides applied across all member projects
  theme: {
    name: 'default',
    appearance: 'system',
  },
};
```

---

## 3. Workspace Build & Runtime Features (`v0.10.0`)

1. **Unified Pre-Flight Dependency Resolution**: Before building member projects, `docmd` scans all member configs and installs any missing optional plugins, templates, or engines in a single workspace-wide batch.
2. **Cross-Project Search & AI RAG**: Each project emits its own `_docmd-search/search-index.json` under its mount path, and the root workspace aggregates search and `@docmd/plugin-ai` RAG context across all member projects.
3. **Workspace-Aware OpenAPI Resolution**: `@docmd/plugin-openapi` resolves external spec paths relative to the member project directory first, falling back to the workspace root.
4. **Programmatic Workspace API**:
   ```javascript
   import { detectWorkspace, isWorkspace, buildWorkspace } from '@docmd/core';

   const wsPath = await detectWorkspace(process.cwd());
   if (wsPath && isWorkspace(wsPath)) {
     await buildWorkspace({ cwd: process.cwd() });
   }
   ```