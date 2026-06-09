---
description: Link validation and CI/CD integration for docmd. Use when checking for broken links or setting up continuous integration.
---

# Validation Reference

Full docs: CLI Commands - https://docs.docmd.io/api/cli-commands/

## Commands

```bash
# Lint all internal markdown links — terminal-formatted output
docmd validate

# Machine-readable JSON array for CI/CD pipelines
docmd validate --json
```

## What It Checks

✅ **Validates:**
- Relative markdown links (`[text](./path.md)`)
- Directory links (`[text](./guide/)`)
- Index file references (`[text](./guide)`)
- Local image/asset paths

❌ **Skips:**
- External URLs: `http://`, `https://`
- Email links: `mailto:`
- Phone links: `tel:`
- Anchor-only links: `#section`
- `external:` prefixed links

## Output Format

### Terminal Output (default)

```
✓ docs/index.md
✓ docs/getting-started.md
✗ docs/api/config.md
  → Broken link: ./missing.md (line 42)

Found 1 broken link in 12 pages
```

### JSON Output (`--json`)

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

## CI/CD Integration

### GitHub Actions

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

### GitLab CI

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

### CircleCI

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

## MCP Tool

The MCP server exposes `validate_docs` as a tool — runs the same checks programmatically via JSON-RPC.

```bash
docmd mcp  # Start MCP server
```

Tool: `validate_docs`

Input: `{}`

Output: Array of broken links (same format as `--json`)

## Pre-commit Hook

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

## Common Issues

### False Positives

If you have dynamic routes or external content, create a `.docmdignore` file:

```
# Skip validation for specific patterns
docs/dynamic/*.md
docs/legacy/**/*.md
```

### Relative Path Resolution

docmd resolves links relative to the source file:

```markdown
# In docs/api/config.md

[Getting Started](../getting-started.md)  # → docs/getting-started.md
[CLI](./cli.md)                           # → docs/api/cli.md
[Index](../../)                           # → docs/index.md
```

### Case Sensitivity

On case-insensitive filesystems (macOS, Windows), validation is case-insensitive.
On CI (Linux), validation is case-sensitive — ensure consistent casing.

## Exit Codes

- `0` — No broken links
- `1` — Broken links found
- `2` — Configuration error

## See Also

- [CLI Reference](./cli.md) — All CLI commands
- [Configuration](./config.md) — Configuration schema