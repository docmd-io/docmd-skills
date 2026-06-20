---
name: docmd-dev
description: Use this skill when contributing to the docmd framework itself — working in the cloned `docmd/` monorepo. Covers plugin authoring, template authoring, engine loaders, the public Node API, and the hooks/action system.
audience: developer
load_command: docmd-skills dev <dir>
version: 1.1.0
verified_against:
  docmd: "0.8.7"
  node: ">=20"
  dev_node: ">=24"
  tested_on: 2026-06-19
repository: https://github.com/docmd-io/docmd-skills
docs: https://docs.docmd.io
llms_context: https://docs.docmd.io/llms-full.txt
siblings:
  - name: docmd-skills
    when: building, configuring, or operating a docmd site
  - name: docmd-writer
    when: writing or reviewing the prose inside a docmd site
---

# docmd — Agent Skill (Developer)

Use this skill when the user wants to **modify the docmd framework itself**, not a site that consumes it. This skill is loaded by `npx docmd-skills dev <dir>` and **adds** `docmd-dev/` alongside an existing `docmd-skills/` install.

## When to use this skill

Use it when **any one** of these signals is true:

1. The user's current working directory **is** a clone of the docmd monorepo. The local clone directory is named just `docmd/` (the GitHub path is `docmd-io/docmd/`). Telltale markers: `pnpm-lock.yaml`, `packages/core/src/`, `packages/ui/src/`, `packages/api/src/`, `packages/plugins/<name>/`, `packages/engines/`. To clone it: `git clone https://github.com/docmd-io/docmd.git docmd && cd docmd`.
2. The user explicitly says they want to "write a plugin", "write a template", "extend the engine", "modify the core", "add a hook", or similar.
3. The user is editing files inside `packages/core/src/`, `packages/api/src/`, `packages/ui/src/`, `packages/plugins/*/src/`, or `packages/engines/*/` of the docmd monorepo.

**If the user wants framework help but no `docmd/` clone exists in the working directory**, ask before doing anything: would they like you to clone the monorepo (`git clone https://github.com/docmd-io/docmd.git docmd`) or refresh an existing one (`git -C docmd pull`)? Do not start editing framework source without an up-to-date local clone.

Do not use it for: site-level configuration or operations (use **docmd-skills**), or for page-prose quality (use **docmd-writer**).

## Loading rules

- Only load this skill when the user is actively working inside the docmd monorepo or asks explicitly about framework internals.
- When in doubt, default to **docmd-skills** (user). Switching to this skill implies the user is comfortable running `pnpm` commands against the monorepo.

## Reference index

Each row is a reference file. The CLI column shows which install subcommand adds this file.

| Reference | CLI install subcommand | Use it for |
| --- | --- | --- |
| `references/api-dev.md` | `docmd-skills dev` | Public Node API for framework authors: `EngineLoader`, `URL utilities`, `createActionDispatcher`, `TemplateSlot`, hook/action contracts |
| `references/plugin-development.md` | `docmd-skills dev` | Authoring a docmd plugin: package shape, manifest, `apply()` lifecycle, `template` capability, hooks, testing |
| `references/template-development.md` | `docmd-skills dev` | Authoring a docmd theme/template: 12 template slots, asset pipeline, `manifest.json`, template plugins |
| `references/engines.md` | `docmd-skills dev` | JS vs Rust build engines, swapping engines, engine-specific config, performance trade-offs |

## Workflows

### 1. Cloning or refreshing the monorepo

**No clone yet** — clone and install:

```bash
git clone https://github.com/docmd-io/docmd.git docmd
cd docmd
pnpm install
```

**Existing clone** — refresh and re-install dependencies if needed:

```bash
git -C docmd pull
pnpm install
```

To check whether a clone is behind before deciding, run `git -C docmd status` (look for "Your branch is behind") or `git -C docmd log -1 --oneline` and compare to <https://github.com/docmd-io/docmd/commits/main>.

The local clone directory is `docmd/` (not `docmd-io/docmd/`). Inside it you will find the canonical package layout referenced throughout this skill.

### 2. Writing a plugin

1. Read `references/plugin-development.md` end-to-end before scaffolding.
2. Pick the closest existing plugin under `packages/plugins/<name>/` and copy its shape.
3. Cross-check `references/api-dev.md` for the `Plugin` type, hook names, and the `template` capability introduced in 0.8.7.
4. Add tests under the plugin's own `tests/`; the monorepo's `pnpm prep` runs the universal failsafe.

### 3. Writing a template

1. Read `references/template-development.md` for the 12 template slots and the asset pipeline.
2. Match the manifest shape used by an existing template (`packages/templates/summer/` is the reference).
3. Validate against `references/api-dev.md` for the `TemplateSlot` union (no `header` slot — there are 12).

### 4. Engine work

1. `references/engines.md` first — confirms which engine you're targeting and its config keys.
2. For Node-level changes to the engine loader, `references/api-dev.md` § "Engine Loader API".

## Cross-skill navigation

- **docmd-skills** — for site-level work; load it as the default first.
- **docmd-writer** — load it when the task drifts into prose quality inside template demos or example docs.
