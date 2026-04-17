# What is CI/CD?

## Table of Contents

1. [Introduction](#introduction)
2. [Continuous Integration (CI)](#continuous-integration-ci)
3. [Continuous Delivery vs Continuous Deployment](#continuous-delivery-vs-continuous-deployment)
4. [Pipeline Stages](#pipeline-stages)
5. [Benefits of CI/CD](#benefits-of-cicd)
6. [CI/CD Culture](#cicd-culture)
7. [Common CI/CD Tools](#common-cicd-tools)
8. [Pipeline Anatomy](#pipeline-anatomy)
9. [Best Practices](#best-practices)
10. [Anti-Patterns](#anti-patterns)

---

## Introduction

CI/CD stands for **Continuous Integration** and **Continuous Delivery/Deployment**. It is a set of practices that automate the process of integrating code changes, running tests, building artifacts, and deploying applications. CI/CD forms the backbone of modern DevOps culture.

The core idea: every code change should be automatically validated, built, and (optionally) deployed with minimal human intervention.

```
Developer → Push Code → CI Pipeline → Build → Test → Deploy
```

---

## Continuous Integration (CI)

### Definition

Continuous Integration is the practice of frequently merging code changes into a shared repository, where automated builds and tests verify each integration.

### Key Principles

1. **Single source repository** — All code lives in version control (e.g., Git)
2. **Automate the build** — Every commit triggers an automated build
3. **Self-testing builds** — Tests run automatically as part of the build
4. **Fast feedback** — Developers know within minutes if their change broke something
5. **Everyone commits frequently** — At least daily, ideally multiple times per day

### The CI Loop

```
┌─────────────┐
│  Developer   │
│  writes code │
└──────┬───────┘
       │ git push
       ▼
┌─────────────┐
│  CI Server   │
│  detects     │
│  change      │
└──────┬───────┘
       │
       ▼
┌─────────────┐     ┌──────────┐
│  Build &     │────▶│  Pass?   │
│  Test        │     └────┬─────┘
└─────────────┘          │
                    Yes ──┤── No
                    │     │
                    ▼     ▼
               ✅ Merge  ❌ Fix
```

### What CI Validates

- Code compiles/transpiles without errors
- Unit tests pass
- Linting rules are satisfied
- Type checking passes (for TypeScript)
- Code formatting is consistent

---

## Continuous Delivery vs Continuous Deployment

These two terms are often confused. They are **different practices**.

### Continuous Delivery

- Every change is **automatically prepared** for release
- A **human approval** step exists before production deployment
- The artifact is always in a deployable state
- "Can deploy at any time, but choose when"

```
Code → Build → Test → Stage → [Manual Approval] → Production
```

### Continuous Deployment

- Every change that passes all tests is **automatically deployed** to production
- No manual intervention
- Requires extremely high confidence in automated tests
- "Every commit goes to production"

```
Code → Build → Test → Stage → Production (automatic)
```

### Comparison Table

| Aspect                | Continuous Delivery      | Continuous Deployment     |
|-----------------------|--------------------------|---------------------------|
| Manual approval       | Yes                      | No                        |
| Deploy frequency      | On-demand                | Every passing commit      |
| Risk                  | Lower (human gate)       | Higher (automated)        |
| Test confidence needed| High                     | Very high                 |
| Speed to production   | Hours to days            | Minutes                   |
| Common in             | Enterprises, regulated   | SaaS, startups            |

---

## Pipeline Stages

A typical CI/CD pipeline has these stages:

### 1. Source Stage

- Triggered by a code change (push, PR, merge)
- Fetches the latest code from the repository
- Determines what changed (for optimization)

### 2. Install Stage

- Install dependencies (`npm install`, `pip install`, etc.)
- Restore caches for faster builds
- Set up the build environment

### 3. Lint & Format Stage

- Run linters (ESLint, Prettier, etc.)
- Check code style and formatting
- Static analysis for potential bugs

### 4. Test Stage

- Run unit tests
- Run integration tests
- Generate code coverage reports
- Fail the pipeline if coverage drops below threshold

### 5. Build Stage

- Compile/transpile the code
- Bundle assets
- Generate build artifacts
- Optimize for production

### 6. Deploy Stage

- Deploy to target environment (staging, production)
- Run database migrations
- Invalidate caches
- Verify deployment health

### Pipeline Visualization

```
┌────────┐   ┌─────────┐   ┌──────┐   ┌──────┐   ┌───────┐   ┌────────┐
│ Source  │──▶│ Install │──▶│ Lint │──▶│ Test │──▶│ Build │──▶│ Deploy │
└────────┘   └─────────┘   └──────┘   └──────┘   └───────┘   └────────┘
                                                                    │
                                                              ┌─────┴─────┐
                                                              │  Staging   │
                                                              │ Production │
                                                              └───────────┘
```

---

## Benefits of CI/CD

### For Developers

1. **Faster feedback** — Know within minutes if a change is broken
2. **Reduced merge conflicts** — Frequent integration means smaller diffs
3. **Confidence to refactor** — Automated tests catch regressions
4. **Less manual work** — No manual build/deploy steps

### For Teams

1. **Consistent process** — Everyone follows the same pipeline
2. **Visibility** — Pipeline status is visible to all team members
3. **Accountability** — Each commit is tied to a build result
4. **Faster releases** — Ship features in hours, not weeks

### For Business

1. **Faster time to market** — Features reach users quickly
2. **Higher quality** — Automated testing catches bugs early
3. **Lower cost** — Fewer manual QA cycles needed
4. **Reduced risk** — Small, frequent changes are easier to debug

---

## CI/CD Culture

CI/CD is not just tooling — it's a **cultural shift**.

### Cultural Principles

1. **Trunk-based development** — Short-lived branches, frequent merges
2. **Fix broken builds immediately** — A broken pipeline is the team's top priority
3. **Don't commit to a broken build** — Check pipeline status before pushing
4. **Keep the pipeline fast** — Target under 10 minutes for CI
5. **Everyone is responsible** — CI/CD is not just "the DevOps team's job"

### The Cost of a Broken Pipeline

When the CI pipeline is broken:
- No one can merge their code
- Developers start working around the pipeline
- Trust in the process erodes
- Technical debt accumulates

### Pipeline as Documentation

A well-structured pipeline serves as living documentation of:
- How to build the project
- What tests exist and must pass
- What environments exist
- How deployment works

---

## Common CI/CD Tools

| Tool             | Type        | Key Feature                    |
|------------------|-------------|--------------------------------|
| GitHub Actions   | Cloud CI/CD | Native GitHub integration      |
| GitLab CI        | Cloud CI/CD | Built into GitLab              |
| Jenkins          | Self-hosted | Highly customizable            |
| CircleCI         | Cloud CI/CD | Fast, Docker-native            |
| Travis CI        | Cloud CI/CD | Simple YAML config             |
| Vercel           | Deploy      | Frontend-focused, preview URLs |
| Netlify          | Deploy      | Static sites, edge functions   |
| AWS CodePipeline | Cloud CI/CD | AWS-native                     |

---

## Pipeline Anatomy

### A Simple Pipeline Definition (Conceptual)

```typescript
const pipeline = {
  name: "CI Pipeline",
  trigger: ["push", "pull_request"],
  stages: [
    {
      name: "install",
      commands: ["npm ci"],
      cache: { key: "node_modules", paths: ["node_modules"] }
    },
    {
      name: "lint",
      commands: ["npm run lint"],
      dependsOn: ["install"]
    },
    {
      name: "test",
      commands: ["npm test"],
      dependsOn: ["install"]
    },
    {
      name: "build",
      commands: ["npm run build"],
      dependsOn: ["lint", "test"]
    },
    {
      name: "deploy",
      commands: ["npm run deploy"],
      dependsOn: ["build"],
      environment: "production",
      manualApproval: true
    }
  ]
};
```

### Pipeline Status Lifecycle

```
pending → running → success
                  → failure
                  → cancelled
```

Each stage can be:
- **pending** — Waiting for dependencies
- **running** — Currently executing
- **success** — Completed without errors
- **failure** — Exited with non-zero code
- **skipped** — Skipped due to condition or upstream failure
- **cancelled** — Manually or automatically cancelled

---

## Best Practices

1. **Keep pipelines fast** — Under 10 minutes for CI, use caching and parallelism
2. **Fail fast** — Put the fastest checks (lint, typecheck) first
3. **Use environment parity** — Dev, staging, and prod should be as similar as possible
4. **Version your pipeline** — Pipeline config lives in the repo (pipeline-as-code)
5. **Don't store secrets in code** — Use CI/CD secret management
6. **Use branch protection** — Require CI to pass before merge
7. **Monitor pipeline metrics** — Track build times, failure rates, flake rates
8. **Clean up artifacts** — Don't let old build artifacts consume storage

---

## Anti-Patterns

1. **Manual deployment Friday at 5pm** — Deploy small changes frequently instead
2. **"Works on my machine"** — CI ensures consistent build environment
3. **Long-lived feature branches** — Leads to painful merges; prefer trunk-based dev
4. **Skipping CI** — Never use `[skip ci]` in production workflows
5. **Flaky tests** — Fix or quarantine them; don't just re-run
6. **Mega-pipelines** — Break into smaller, focused pipelines
7. **No rollback plan** — Always have a way to revert a bad deploy

---

## Key Takeaways

- **CI** = automatically build and test every code change
- **CD (Delivery)** = automatically prepare for release, manual deploy
- **CD (Deployment)** = automatically deploy every passing change
- Pipelines have stages: source → install → lint → test → build → deploy
- CI/CD is a cultural practice, not just a tool
- Fast feedback loops are the #1 benefit
- Pipeline-as-code keeps configuration versioned and reviewable

---

## Next Steps

- [Testing in CI](../02-testing-in-ci/README.md) — Deep dive into test automation
- [Build Pipelines](../03-build-pipelines/README.md) — Pipeline design patterns
