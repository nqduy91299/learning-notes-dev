# 09 - CI/CD

Continuous Integration and Continuous Deployment — automate testing, building, and deploying.

## Chapters

### 01 - CI Fundamentals
| Topic | Description |
|-------|-------------|
| what-is-ci-cd | Core concepts, CI vs CD vs CD |
| testing-in-ci | Running tests automatically on push/PR |
| build-pipelines | Build steps, artifacts, environments |

### 02 - GitHub Actions
| Topic | Description |
|-------|-------------|
| workflows-basics | YAML syntax, triggers, events |
| jobs-and-steps | Job dependencies, step outputs |
| secrets-and-env | Managing secrets, environment variables |
| reusable-workflows | Shared workflows, composite actions |
| matrix-strategy | Test across multiple versions/OS |

### 03 - Deployment
| Topic | Description |
|-------|-------------|
| vercel | Deploy Next.js apps to Vercel |
| netlify | Deploy static/SSR apps to Netlify |
| docker-basics | Dockerfile, images, containers for deployment |
| preview-deployments | PR preview URLs, staging environments |

### 04 - Advanced
| Topic | Description |
|-------|-------------|
| monorepo-ci | CI strategies for monorepos (turbo, nx) |
| caching-optimization | Speed up CI with caching and parallelism |
| release-automation | Semantic versioning, changelogs, auto-release |
| monitoring-rollback | Post-deploy monitoring, rollback strategies |

## Suggested Order

```
01-ci-fundamentals --> 02-github-actions --> 03-deployment --> 04-advanced
```
