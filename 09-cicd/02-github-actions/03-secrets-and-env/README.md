# GitHub Actions: Secrets and Environment Variables

## Table of Contents

1. [Introduction](#introduction)
2. [GitHub Secrets](#github-secrets)
3. [Environment Variables](#environment-variables)
4. [Context Objects](#context-objects)
5. [GITHUB_TOKEN](#github_token)
6. [Environment Protection Rules](#environment-protection-rules)
7. [Secret Masking](#secret-masking)
8. [Security Best Practices](#security-best-practices)
9. [Common Patterns](#common-patterns)
10. [Debugging Secrets Issues](#debugging-secrets-issues)

---

## Introduction

Secrets and environment variables are essential for CI/CD pipelines. They allow workflows to access API keys, database credentials, deployment tokens, and configuration values without exposing them in code.

Key distinctions:
- **Secrets** — Encrypted values, never shown in logs
- **Environment variables** — Configuration values, may be visible in logs
- **Contexts** — GitHub-provided data about the workflow run

---

## GitHub Secrets

### Types of Secrets

| Level          | Scope                              | Set By         |
|----------------|-----------------------------------|----------------|
| Repository     | Single repository                 | Repo admin     |
| Environment    | Specific environment (prod, staging)| Repo admin   |
| Organization   | All repos in org (or selected)    | Org admin      |

### Setting Secrets

Repository secrets are set in Settings → Secrets and variables → Actions.

### Using Secrets in Workflows

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Secret Rules

1. Secrets are **not passed to forked PRs** (security measure)
2. Secrets are **masked in logs** — if the value appears in output, it shows `***`
3. Secrets cannot be accessed in `if` conditions directly
4. Secret names are case-insensitive but conventionally UPPER_SNAKE_CASE
5. Maximum 1000 secrets per repository, 100 per environment

---

## Environment Variables

### Levels of Environment Variables

```yaml
# Workflow level — available to all jobs
env:
  NODE_ENV: production

jobs:
  build:
    # Job level — available to all steps in this job
    env:
      CI: true
    steps:
      # Step level — available only to this step
      - run: echo $MY_VAR
        env:
          MY_VAR: hello
```

### Precedence (highest to lowest)

1. Step `env`
2. Job `env`
3. Workflow `env`
4. Default GitHub environment variables

### Default GitHub Variables

| Variable                | Description                          |
|------------------------|--------------------------------------|
| `GITHUB_REPOSITORY`   | `owner/repo`                         |
| `GITHUB_REF`          | Branch or tag ref                    |
| `GITHUB_SHA`          | Commit SHA                           |
| `GITHUB_EVENT_NAME`   | Event that triggered the workflow    |
| `GITHUB_WORKSPACE`    | Working directory path               |
| `GITHUB_ACTOR`        | User who triggered the workflow      |
| `GITHUB_RUN_ID`       | Unique workflow run identifier       |
| `GITHUB_RUN_NUMBER`   | Sequential run number for workflow   |
| `RUNNER_OS`           | Operating system (Linux, macOS, Windows) |

---

## Context Objects

GitHub Actions provides context objects accessible via `${{ }}` expressions.

### Available Contexts

| Context    | Description                              |
|-----------|------------------------------------------|
| `github`  | Workflow run info (ref, sha, actor, etc.)|
| `env`     | Environment variables                    |
| `secrets` | Secret values                            |
| `job`     | Current job info                         |
| `steps`   | Step outputs and status                  |
| `runner`  | Runner machine info                      |
| `needs`   | Dependent job outputs                    |
| `inputs`  | Workflow inputs (dispatch/call)          |
| `matrix`  | Matrix values for current job            |

### Expression Syntax

```yaml
# Simple reference
${{ github.ref }}

# Comparison
${{ github.ref == 'refs/heads/main' }}

# Ternary-like with format
${{ github.event_name == 'push' && 'production' || 'preview' }}

# Functions
${{ contains(github.ref, 'release') }}
${{ startsWith(github.ref, 'refs/tags/') }}
${{ toJSON(github.event) }}
```

---

## GITHUB_TOKEN

Every workflow run gets an automatic `GITHUB_TOKEN` with limited permissions.

### Default Permissions

```yaml
permissions:
  contents: read
  metadata: read
```

### Configuring Permissions

```yaml
# Workflow level
permissions:
  contents: write
  pull-requests: write
  issues: write

# Job level (overrides workflow level)
jobs:
  deploy:
    permissions:
      contents: read
      deployments: write
```

### Permission Options

| Permission     | Description                    |
|---------------|-------------------------------|
| `contents`    | Read/write repo contents       |
| `pull-requests`| Comment on / modify PRs       |
| `issues`      | Create/modify issues           |
| `deployments` | Create deployments             |
| `packages`    | Publish packages               |
| `actions`     | Manage workflow runs           |
| `checks`      | Create check runs              |
| `statuses`    | Update commit statuses         |

Values: `read`, `write`, or `none`

---

## Environment Protection Rules

Environments can have protection rules for deployment safety.

### Configuration Options

1. **Required reviewers** — Specific users must approve deployment
2. **Wait timer** — Delay deployment by N minutes
3. **Branch restrictions** — Only certain branches can deploy
4. **Environment secrets** — Secrets available only in this environment

### Usage in Workflow

```yaml
jobs:
  deploy-production:
    environment:
      name: production
      url: https://myapp.com
    runs-on: ubuntu-latest
    steps:
      - run: deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}  # Environment secret
```

---

## Secret Masking

### Automatic Masking

GitHub Actions automatically masks secret values in logs. If you do:

```yaml
- run: echo "${{ secrets.API_KEY }}"
```

The log shows: `***`

### Manual Masking

```yaml
- run: |
    TOKEN=$(generate-token)
    echo "::add-mask::$TOKEN"
    echo "Using token for deployment"
```

### Masking Limitations

- Short secrets (< 4 chars) may not be masked reliably
- Base64-encoded or transformed secrets won't be auto-masked
- Secrets in structured output (JSON) might partially leak

---

## Security Best Practices

1. **Principle of least privilege** — Give minimum required permissions
2. **Don't echo secrets** — Even masked, avoid printing them
3. **Use environment secrets** — Separate prod/staging credentials
4. **Rotate secrets regularly** — Especially after team member departures
5. **Don't pass secrets to forks** — Default behavior, don't override
6. **Audit secret usage** — Review which workflows access which secrets
7. **Use OIDC** — For cloud providers, use OIDC instead of long-lived tokens
8. **Pin actions** — Prevent supply chain attacks via compromised actions

---

## Common Patterns

### Dynamic Environment Selection

```yaml
- name: Set environment
  run: |
    if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
      echo "DEPLOY_ENV=production" >> "$GITHUB_ENV"
    else
      echo "DEPLOY_ENV=staging" >> "$GITHUB_ENV"
    fi

- name: Deploy
  run: deploy --env ${{ env.DEPLOY_ENV }}
  env:
    API_KEY: ${{ secrets[format('{0}_API_KEY', env.DEPLOY_ENV)] }}
```

### Passing Secrets Between Steps

```yaml
- id: get-secret
  run: echo "token=$(vault read secret/token)" >> "$GITHUB_OUTPUT"
  
- run: use-token "${{ steps.get-secret.outputs.token }}"
```

---

## Debugging Secrets Issues

### Common Problems

1. **Secret is empty** — Check spelling, check if set at right level
2. **Secret not masked** — Value too short or transformed
3. **Fork PR can't access secrets** — By design, use `pull_request_target` carefully
4. **Environment secret not found** — Job must reference the environment

### Debug Techniques

```yaml
# Check if secret exists (don't print value!)
- run: |
    if [ -z "$MY_SECRET" ]; then
      echo "Secret is empty!"
    else
      echo "Secret is set (length: ${#MY_SECRET})"
    fi
  env:
    MY_SECRET: ${{ secrets.MY_SECRET }}
```

---

## Key Takeaways

- Secrets are encrypted and masked in logs — use them for sensitive data
- Environment variables can be set at workflow, job, or step level
- GITHUB_TOKEN provides scoped access to GitHub APIs
- Environment protection rules add safety gates for deployments
- Always use principle of least privilege for permissions
- Never expose secrets in logs, even accidentally
