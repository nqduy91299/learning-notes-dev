# GitHub Actions: Workflow Basics

## Table of Contents

1. [Introduction](#introduction)
2. [YAML Workflow Structure](#yaml-workflow-structure)
3. [Workflow File Location](#workflow-file-location)
4. [Triggers (Events)](#triggers-events)
5. [Push Trigger](#push-trigger)
6. [Pull Request Trigger](#pull-request-trigger)
7. [Schedule Trigger](#schedule-trigger)
8. [Manual Trigger (workflow_dispatch)](#manual-trigger-workflow_dispatch)
9. [Other Events](#other-events)
10. [Runs-on (Runners)](#runs-on-runners)
11. [Workflow Permissions](#workflow-permissions)
12. [Concurrency](#concurrency)
13. [Workflow Examples](#workflow-examples)
14. [Best Practices](#best-practices)

---

## Introduction

GitHub Actions is a CI/CD platform built into GitHub. Workflows are defined in YAML files and triggered by events like pushes, pull requests, or schedules. Each workflow runs on a virtual machine called a **runner**.

Key concepts:
- **Workflow** — An automated process defined in a YAML file
- **Event** — Something that triggers a workflow (push, PR, cron)
- **Job** — A set of steps that run on the same runner
- **Step** — An individual task (run a command or use an action)
- **Action** — A reusable unit of code (from GitHub Marketplace or custom)

---

## YAML Workflow Structure

A workflow file has this top-level structure:

```yaml
name: CI                          # Workflow name (shown in GitHub UI)

on:                               # Trigger events
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:                      # Token permissions
  contents: read

concurrency:                      # Prevent duplicate runs
  group: ${{ github.ref }}
  cancel-in-progress: true

jobs:                             # Job definitions
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
```

### Key Sections

| Section       | Required | Description                           |
|--------------|----------|---------------------------------------|
| `name`       | No       | Display name for the workflow         |
| `on`         | Yes      | Events that trigger the workflow      |
| `permissions`| No       | GITHUB_TOKEN permissions              |
| `concurrency`| No       | Concurrency control                   |
| `env`        | No       | Environment variables for all jobs    |
| `jobs`       | Yes      | Map of job definitions                |

---

## Workflow File Location

Workflows must be stored in `.github/workflows/` directory:

```
.github/
└── workflows/
    ├── ci.yml
    ├── deploy.yml
    └── release.yml
```

- Files must have `.yml` or `.yaml` extension
- Multiple workflow files are supported
- Each file defines one workflow
- Workflows are independent (unless using `workflow_call`)

---

## Triggers (Events)

The `on` key defines what triggers the workflow.

### Single Event

```yaml
on: push
```

### Multiple Events

```yaml
on: [push, pull_request]
```

### Events with Configuration

```yaml
on:
  push:
    branches: [main, develop]
    paths: ["src/**"]
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
```

---

## Push Trigger

Triggered when commits are pushed to a branch.

```yaml
on:
  push:
    branches:
      - main
      - "release/**"       # Glob patterns supported
    branches-ignore:
      - "dependabot/**"    # Exclude branches
    paths:
      - "src/**"           # Only trigger for changes in src/
      - "package.json"
    paths-ignore:
      - "docs/**"          # Ignore docs changes
      - "**.md"
    tags:
      - "v*"               # Trigger on version tags
```

### Branch Filters

- `branches` — Include only these branches
- `branches-ignore` — Exclude these branches
- Cannot use both `branches` and `branches-ignore`
- Supports glob patterns: `*`, `**`, `?`, `!`

### Path Filters

- `paths` — Only trigger when these paths change
- `paths-ignore` — Don't trigger when only these paths change
- Cannot use both `paths` and `paths-ignore`
- Useful for monorepos to avoid unnecessary builds

---

## Pull Request Trigger

Triggered when a pull request is opened, updated, or other PR events occur.

```yaml
on:
  pull_request:
    branches: [main]
    types:
      - opened
      - synchronize     # New commits pushed
      - reopened
      - ready_for_review
    paths:
      - "src/**"
```

### PR Activity Types

| Type             | Description                              |
|------------------|------------------------------------------|
| `opened`         | PR is created                            |
| `synchronize`    | New commits pushed to PR                 |
| `reopened`       | PR is reopened after being closed        |
| `closed`         | PR is closed (merged or not)             |
| `ready_for_review`| PR is moved from draft to ready        |
| `labeled`        | A label is added                         |
| `unlabeled`      | A label is removed                       |
| `review_requested`| Review is requested                     |

Default types (if not specified): `opened`, `synchronize`, `reopened`

### PR vs Push

| Aspect          | `push`                | `pull_request`          |
|-----------------|----------------------|------------------------|
| Trigger         | Commit to branch     | PR activity            |
| Branch context  | Target branch        | PR merge ref           |
| Runs on         | Base branch code     | Merged code (PR + base)|
| Fork support    | Same repo only       | Forks supported        |

---

## Schedule Trigger

Run workflows on a cron schedule.

```yaml
on:
  schedule:
    - cron: "0 0 * * *"    # Daily at midnight UTC
    - cron: "0 */6 * * *"  # Every 6 hours
```

### Cron Syntax

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, 0=Sunday)
│ │ │ │ │
* * * * *
```

### Common Schedules

| Cron Expression    | Description            |
|-------------------|------------------------|
| `0 0 * * *`       | Daily at midnight      |
| `0 */6 * * *`     | Every 6 hours          |
| `0 0 * * 1`       | Every Monday at midnight|
| `30 5 * * 1-5`    | Weekdays at 5:30 AM   |
| `0 0 1 * *`       | First of every month   |

### Limitations

- Minimum interval: 5 minutes (GitHub may delay scheduled runs)
- Scheduled workflows only run on the default branch
- Can be disabled if no repo activity for 60 days

---

## Manual Trigger (workflow_dispatch)

Allow manually triggering a workflow from the GitHub UI or API.

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: "Target environment"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production
      debug:
        description: "Enable debug logging"
        required: false
        type: boolean
        default: false
```

### Input Types

| Type      | Description                   |
|-----------|-------------------------------|
| `string`  | Free text input               |
| `boolean` | True/false checkbox           |
| `choice`  | Dropdown with options         |
| `environment` | Environment selector      |

### Accessing Inputs

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying to ${{ github.event.inputs.environment }}"
```

---

## Other Events

### Repository Events

```yaml
on:
  issues:
    types: [opened, labeled]
  release:
    types: [published]
  create:        # Branch or tag created
  delete:        # Branch or tag deleted
```

### Workflow Events

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
  workflow_call:  # Called by another workflow (reusable)
```

### External Events

```yaml
on:
  repository_dispatch:
    types: [deploy-command]
```

---

## Runs-on (Runners)

Runners are the machines that execute workflow jobs.

### GitHub-Hosted Runners

| Runner Label        | OS                    | Architecture |
|--------------------|-----------------------|-------------|
| `ubuntu-latest`   | Ubuntu 22.04          | x64         |
| `ubuntu-24.04`    | Ubuntu 24.04          | x64         |
| `macos-latest`    | macOS 14 (Sonoma)     | ARM64       |
| `macos-13`        | macOS 13 (Ventura)    | x64         |
| `windows-latest`  | Windows Server 2022   | x64         |

### Self-Hosted Runners

```yaml
runs-on: self-hosted         # Any self-hosted runner
runs-on: [self-hosted, linux] # Self-hosted Linux runner
```

---

## Concurrency

Prevent duplicate workflow runs.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

- `group` — String identifier; workflows in the same group are queued
- `cancel-in-progress` — Cancel existing runs when a new one starts
- Common pattern: cancel outdated PR builds when new commits are pushed

---

## Workflow Examples

### Minimal CI

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
```

### Full CI Pipeline

```yaml
name: Full CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

---

## Best Practices

1. **Pin action versions** — Use `@v4` not `@main` (or better, pin to SHA)
2. **Use concurrency** — Cancel outdated PR builds
3. **Filter paths** — Don't run CI for docs-only changes
4. **Keep workflows focused** — Separate CI, deploy, release workflows
5. **Use caching** — `actions/cache` for node_modules
6. **Set timeouts** — Prevent hung jobs from consuming minutes
7. **Use permissions** — Minimize GITHUB_TOKEN permissions
8. **Name your steps** — Makes debugging easier in the UI

---

## Key Takeaways

- Workflows live in `.github/workflows/*.yml`
- `on` defines triggers: push, pull_request, schedule, workflow_dispatch
- Branch and path filters control when workflows run
- `runs-on` specifies the runner (ubuntu-latest is most common)
- Concurrency prevents duplicate runs
- Pin action versions for reproducibility
