# GitHub Actions: Reusable Workflows

## Table of Contents

1. [Introduction](#introduction)
2. [workflow_call Trigger](#workflow_call-trigger)
3. [Inputs, Outputs, and Secrets](#inputs-outputs-and-secrets)
4. [Composite Actions](#composite-actions)
5. [Marketplace Actions](#marketplace-actions)
6. [Action Versioning](#action-versioning)
7. [Creating Custom Actions](#creating-custom-actions)
8. [Reusable Workflow Patterns](#reusable-workflow-patterns)
9. [Comparison: Reusable Workflows vs Composite Actions](#comparison)
10. [Best Practices](#best-practices)

---

## Introduction

As CI/CD pipelines grow, duplication becomes a problem. GitHub Actions provides two mechanisms for reuse:

1. **Reusable Workflows** — Call an entire workflow from another workflow
2. **Composite Actions** — Bundle multiple steps into a single action

Both reduce duplication and centralize maintenance.

---

## workflow_call Trigger

A reusable workflow uses `workflow_call` as its trigger.

### Defining a Reusable Workflow

```yaml
# .github/workflows/reusable-ci.yml
name: Reusable CI
on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: "20"
    secrets:
      npm-token:
        required: false
    outputs:
      build-status:
        description: "Build result"
        value: ${{ jobs.build.outputs.status }}

jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      status: ${{ steps.build.outputs.result }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - id: build
        run: |
          npm run build && echo "result=success" >> "$GITHUB_OUTPUT"
```

### Calling a Reusable Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on: push
jobs:
  call-ci:
    uses: ./.github/workflows/reusable-ci.yml
    with:
      node-version: "20"
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

---

## Inputs, Outputs, and Secrets

### Input Types

| Type      | Description            |
|-----------|----------------------|
| `string`  | Text value            |
| `number`  | Numeric value         |
| `boolean` | True/false            |

### Passing Secrets

```yaml
# Option 1: Explicit secrets
secrets:
  deploy-key: ${{ secrets.DEPLOY_KEY }}

# Option 2: Inherit all secrets
secrets: inherit
```

### Outputs

Reusable workflow outputs must reference job outputs:

```yaml
on:
  workflow_call:
    outputs:
      version:
        value: ${{ jobs.determine-version.outputs.ver }}
```

---

## Composite Actions

Composite actions combine multiple steps into one reusable step.

### Structure

```
.github/actions/setup-and-build/
├── action.yml
└── scripts/
    └── build.sh
```

### action.yml

```yaml
name: Setup and Build
description: Install dependencies and build the project
inputs:
  node-version:
    description: Node.js version
    required: false
    default: "20"
outputs:
  artifact-path:
    description: Path to build output
    value: ${{ steps.build.outputs.path }}

runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
    - run: npm ci
      shell: bash
    - id: build
      run: |
        npm run build
        echo "path=dist" >> "$GITHUB_OUTPUT"
      shell: bash
```

### Usage

```yaml
steps:
  - uses: ./.github/actions/setup-and-build
    with:
      node-version: "20"
```

---

## Marketplace Actions

### Finding Actions

- GitHub Marketplace: https://github.com/marketplace?type=actions
- Search by category, verified creators
- Check stars, maintenance activity

### Popular Actions

| Action                     | Purpose                      |
|---------------------------|------------------------------|
| `actions/checkout@v4`     | Checkout repository          |
| `actions/setup-node@v4`   | Setup Node.js                |
| `actions/cache@v4`        | Cache dependencies           |
| `actions/upload-artifact@v4`| Upload build artifacts     |
| `peter-evans/create-pull-request@v6` | Create PRs programmatically |
| `changesets/action@v1`    | Version management           |

---

## Action Versioning

### Referencing Versions

```yaml
# Major version tag (recommended)
- uses: actions/checkout@v4

# Specific version tag
- uses: actions/checkout@v4.1.1

# Commit SHA (most secure)
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11

# Branch (not recommended for production)
- uses: actions/checkout@main
```

### Why Pin Versions?

- **Reproducibility** — Same behavior across runs
- **Security** — Prevent supply chain attacks
- **Stability** — Breaking changes don't affect you

---

## Creating Custom Actions

### Types of Actions

| Type       | Runtime      | Best For                     |
|------------|-------------|------------------------------|
| JavaScript | Node.js     | Fast startup, GitHub API     |
| Docker     | Container   | Any language, complex setup  |
| Composite  | Shell/YAML  | Combining existing actions   |

### JavaScript Action Structure

```
my-action/
├── action.yml
├── index.js
├── package.json
└── node_modules/  (bundled)
```

### Publishing to Marketplace

1. Create a public repository
2. Add `action.yml` at the root
3. Create a release with a version tag
4. Publish to Marketplace from GitHub UI

---

## Reusable Workflow Patterns

### Shared CI for Monorepo

```yaml
# Each package calls the same reusable workflow
jobs:
  api:
    uses: ./.github/workflows/node-ci.yml
    with:
      working-directory: packages/api
  web:
    uses: ./.github/workflows/node-ci.yml
    with:
      working-directory: packages/web
```

### Deployment Pipeline

```yaml
jobs:
  ci:
    uses: ./.github/workflows/ci.yml
  deploy-staging:
    needs: ci
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
    secrets: inherit
  deploy-production:
    needs: deploy-staging
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
    secrets: inherit
```

### Organization-Wide Templates

```yaml
# org-repo/.github/workflows/standard-ci.yml
# Called from any repo in the org:
jobs:
  ci:
    uses: my-org/shared-workflows/.github/workflows/ci.yml@v1
```

---

## Comparison

| Feature                  | Reusable Workflow         | Composite Action          |
|--------------------------|--------------------------|--------------------------|
| Scope                    | Entire workflow/jobs      | Single step              |
| Trigger                  | `workflow_call`           | `uses` in step           |
| Can define jobs          | Yes                      | No                       |
| Can use `runs-on`        | Yes                      | Inherits from caller     |
| Secrets handling         | Explicit pass or inherit  | Via inputs               |
| Nesting                  | Up to 4 levels           | Up to 10 levels          |
| Location                 | `.github/workflows/`     | Any directory             |
| Best for                 | Full CI/CD pipelines     | Setup/utility tasks      |

---

## Best Practices

1. **Start with composite actions** — Simpler, easier to test
2. **Use reusable workflows for full pipelines** — When you need job-level control
3. **Version your shared workflows** — Use tags, not branches
4. **Document inputs/outputs** — Clear descriptions in YAML
5. **Use `secrets: inherit` sparingly** — Explicit is safer
6. **Test reusable workflows** — Include a test workflow that calls them
7. **Keep actions focused** — One action, one purpose
8. **Pin dependencies** — Both in action code and in action references

---

## Key Takeaways

- Reusable workflows (`workflow_call`) share entire job pipelines
- Composite actions combine steps into a single reusable step
- Both reduce duplication and centralize CI/CD logic
- Version pinning is critical for security and reproducibility
- `secrets: inherit` passes all secrets; explicit passing is safer
- Organization-wide shared workflows standardize CI across repos
