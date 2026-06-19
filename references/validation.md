---
description: Link validation and CI/CD integration for docmd. Use when checking for broken links or setting up continuous integration.
when_to_use: |
  Read this file when you are:
  - Adding `docmd validate` to a CI pipeline (GitHub Actions, GitLab, CircleCI, pre-commit)
  - Parsing `--json` output programmatically
  - Deciding what to skip via `.docmdignore`
  - Diagnosing false-positive broken-link reports
audience: user
verified_against:
  docmd: "0.8.7"
  tested_on: 2026-06-19
---

# Validation Reference

`validate` is not the same as `build` — a green build does not mean links work. Build runs the engine; validate runs the linter. Run both in CI.

Full docs: CLI Commands - https://docs.docmd.io/reference/cli-commands/

## Commands {#commands}

```bash
# Lint all internal markdown links — terminal-formatted output
docmd validate

# Machine-readable JSON array for CI/CD pipelines
npx @docmd/core validate --json
```

`validate` does not run the build. It only checks link targets.

## What It Checks {#what-it-checks}

Validates:
- Relative markdown links (`[text](./path.md)`)
- Directory links (`[text](./guide/)`)
- Index file references (`[text](./guide)`)
- Local image/asset paths

Skips:
- External URLs: `http://`, `https://`
- Email links: `mailto:`
- Phone links: `tel:`
- Anchor-only links: `#section`
- `external:` prefixed links

External URLs are not validated by default. If a GitHub link 404s in your published docs, `validate` will not catch it.

## Output Format {#output-format}

### Terminal Output (default) {#terminal-output}

```
✓ docs/index.md
✓ docs/getting-started.md
✗ docs/api/config.md
  → Broken link: ./missing.md (line 42)

Found 1 broken link in 12 pages
```

### JSON Output (`--json`) {#json-output}

```json
[
  {
    "file": "docs/api/config.md",
    "link": "./missing.md",
    "line": 42,
    "column": 5
  }
]
```

The JSON output is a bare array, not an object with a `results` or `errors` wrapper. Empty result = `[]`.

## CI/CD Integration {#cicd}

### GitHub Actions {#cicd-gha}

```yaml
name: Validate Docs

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
      
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate links
        run: npx @docmd/core validate --json > validation.json
      
      - name: Check for broken links
        run: |
          if [ $(jq length validation.json) -gt 0 ]; then
            echo "Found broken links:"
            jq '.' validation.json
            exit 1
          fi
```

### GitLab CI {#cicd-gitlab}

```yaml
validate:
  image: node:20
  script:
    - npm ci
    - npx @docmd/core validate --json > validation.json
    - |
      if [ $(jq length validation.json) -gt 0 ]; then
        echo "Found broken links:"
        jq '.' validation.json
        exit 1
      fi
  only:
    - main
    - merge_requests
```

### CircleCI {#cicd-circleci}

```yaml
version: 2.1

jobs:
  validate:
    docker:
      - image: cimg/node:20
    steps:
      - checkout
      - run: npm ci
      - run:
          name: Validate links
          command: |
            npx @docmd/core validate --json > validation.json
            if [ $(jq length validation.json) -gt 0 ]; then
              echo "Found broken links:"
              jq '.' validation.json
              exit 1
            fi

workflows:
  version: 2
  build-and-validate:
    jobs:
      - validate
```

## MCP Tool {#mcp-tool}

The MCP server exposes `validate_docs` as a tool — runs the same checks programmatically via JSON-RPC.

```bash
docmd mcp  # Start MCP server
```

Tool: `validate_docs`

Input: `{}`

Output: Array of broken links (same format as `--json`)

The MCP `validate_docs` tool returns its result as a `content[].text` string (per [SKILL.md §4](../SKILL.md#4-mcp-server)), not as a parsed JSON array. `JSON.parse` the text before iterating.

## Pre-commit Hook {#pre-commit}

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: docmd-validate
        name: Validate docmd links
        entry: npx @docmd/core validate
        language: system
        pass_filenames: false
        always_run: true
```

Pre-commit hooks run against staged changes only by default, but `validate` scans the whole repo, which makes the hook slow on large repos.

## Common Issues {#common-issues}

### False Positives {#false-positives}

If you have dynamic routes or external content, create a `.docmdignore` file:

```
# Skip validation for specific patterns
docs/dynamic/*.md
docs/legacy/**/*.md
```

`.docmdignore` uses gitignore-style globs, not regex. `docs/dynamic/*.md` matches one level; `docs/dynamic/**` matches deeper.

### Relative Path Resolution {#path-resolution}

docmd resolves links relative to the source file:

```markdown
# In docs/api/config.md

[Getting Started](../getting-started.md)  # → docs/getting-started.md
[CLI](./cli.md)                           # → docs/api/cli.md
[Index](../../)                           # → docs/index.md
```

`[Index](../../)` (trailing slash, no filename) resolves to the directory's `index.md`, not the directory itself.

### Case Sensitivity {#case-sensitivity}

On case-insensitive filesystems (macOS, Windows), validation is case-insensitive.
On CI (Linux), validation is case-sensitive — ensure consistent casing.

Case sensitivity mismatches are a common cause of "works on my Mac, fails in CI" doc bugs. Always run `validate` in a Linux-based CI runner.

## Exit Codes {#exit-codes}

- `0` — No broken links
- `1` — Broken links found
- `2` — Configuration error
- `3` — Plugin error (when called via `build`, not `validate`)

`validate` only emits codes 0, 1, and 2. Plugin errors (code 3) are a `build` thing.

## See Also {#see-also}

- [SKILL.md §2](../SKILL.md#2-core-commands) — where `validate` fits in the command table
- [SKILL.md §7](../SKILL.md#7-compatibility-notes) — compatibility notes across the whole tool
- [cli.md](./cli.md) — `validate` flags and global exit-code table
- [deployment.md](./deployment.md) — full CI/CD pipeline examples
- [migration.md](./migration.md) — running `validate` after migrating from another tool
