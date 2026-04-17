# Preview Deployments

## Table of Contents
1. [Introduction](#introduction)
2. [How Preview Deployments Work](#how-preview-deployments-work)
3. [PR Preview URLs](#pr-preview-urls)
4. [Branch Deployments](#branch-deployments)
5. [Staging Environments](#staging-environments)
6. [Deployment Status Checks](#deployment-status-checks)
7. [Preview Environment Configuration](#preview-environment-configuration)
8. [Database and Service Previews](#database-and-service-previews)
9. [Cleanup Strategies](#cleanup-strategies)
10. [Security Considerations](#security-considerations)
11. [Common Platforms](#common-platforms)
12. [Best Practices](#best-practices)

---

## Introduction

Preview deployments create temporary, isolated environments for each pull request or branch. They allow teams to review changes visually and functionally before merging to production.

```
PR Opened → Build → Deploy Preview → Review → Merge → Cleanup
```

Benefits:
- **Visual review** without pulling code locally
- **Stakeholder feedback** from non-technical team members
- **QA testing** in a production-like environment
- **Automated testing** against deployed previews

---

## How Preview Deployments Work

### Lifecycle

```
1. Developer opens PR
2. CI detects PR event
3. Build triggered for PR branch
4. Deploy to unique preview URL
5. Post URL as PR comment / status check
6. Reviewers access preview
7. PR merged or closed
8. Preview environment cleaned up
```

### URL Patterns

| Platform  | URL Pattern                                    |
|-----------|------------------------------------------------|
| Vercel    | `project-hash-team.vercel.app`                |
| Netlify   | `deploy-preview-{num}--site.netlify.app`      |
| Custom    | `pr-{number}.preview.myapp.com`               |
| Railway   | `project-pr-{number}.up.railway.app`          |

---

## PR Preview URLs

### Generating Preview URLs

The URL typically includes:
- Project identifier
- PR number or commit SHA
- Platform domain

### Posting URLs to PRs

```yaml
# GitHub Actions example
- name: Comment PR
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `Preview: https://pr-${context.issue.number}.preview.myapp.com`
      })
```

---

## Branch Deployments

Beyond PRs, deploy any branch to a unique environment.

### Use Cases
- **Feature branches** — Test features in isolation
- **Release branches** — Test release candidates
- **Hotfix branches** — Verify fixes before production

### Naming Convention
```
main → production
develop → staging
feature/* → preview
release/* → release-candidate
```

---

## Staging Environments

A persistent preview environment that mirrors production.

### Staging vs Preview
| Aspect          | Staging               | Preview              |
|-----------------|----------------------|----------------------|
| Lifetime        | Persistent           | Temporary per PR     |
| Data            | Seeded/production-like| Minimal/fresh        |
| URL             | Fixed                | Dynamic per PR       |
| Purpose         | Integration testing  | Feature review       |

---

## Deployment Status Checks

### GitHub Deployment Status API

Deployment statuses inform PR reviewers about the deployment state.

```
pending → in_progress → success → active
                      → failure
                      → error
```

### Status Check Integration

```yaml
- name: Create deployment
  uses: actions/github-script@v7
  with:
    script: |
      const deployment = await github.rest.repos.createDeployment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: context.sha,
        environment: 'preview',
        auto_merge: false,
        required_contexts: []
      });
```

---

## Preview Environment Configuration

### Environment Variables
- Use preview-specific API endpoints
- Use test/sandbox payment providers
- Enable debug logging
- Disable analytics/tracking

### Feature Flags
- Enable experimental features in previews
- Test feature flag variations
- A/B test configurations

---

## Database and Service Previews

### Strategies
1. **Shared staging DB** — All previews share one database
2. **Branch databases** — Each preview gets its own DB
3. **Seed data** — Fresh data for each preview
4. **Production snapshot** — Copy of production (anonymized)

### Branch Databases
```
PR #42 → preview-42.myapp.com → db-preview-42
PR #43 → preview-43.myapp.com → db-preview-43
```

---

## Cleanup Strategies

### When to Clean Up
- **PR closed/merged** — Remove immediately
- **Stale previews** — Remove after N days of inactivity
- **Manual** — Developer triggers cleanup

### Cleanup Checklist
1. Delete deployment/container
2. Remove DNS records
3. Delete branch database
4. Clean up storage/artifacts
5. Update deployment status

---

## Security Considerations

1. **Don't expose production secrets** in previews
2. **Authentication** — Protect previews from public access
3. **Data isolation** — Don't use production data in previews
4. **CORS** — Configure preview domains properly
5. **Rate limiting** — Prevent abuse of preview endpoints
6. **Cleanup** — Don't leave old previews running

---

## Common Platforms

| Platform  | Auto Preview | Custom Domain | DB Preview | Free Tier |
|-----------|-------------|---------------|------------|-----------|
| Vercel    | ✅          | ✅            | ❌         | ✅        |
| Netlify   | ✅          | ✅            | ❌         | ✅        |
| Railway   | ✅          | ✅            | ✅         | ✅        |
| Render    | ✅          | ✅            | ✅         | ✅        |
| Fly.io    | Manual      | ✅            | ✅         | ✅        |

---

## Best Practices

1. **Auto-deploy on PR** — Every PR should get a preview
2. **Post URL as PR comment** — Make it easy to find
3. **Use deployment status checks** — Visual indicator in PR
4. **Clean up on PR close** — Don't leave orphaned environments
5. **Use preview-specific env vars** — Separate from production
6. **Run E2E tests against previews** — Real deployment testing
7. **Set resource limits** — Prevent cost overruns
8. **Add TTL to previews** — Auto-cleanup stale environments

---

## Key Takeaways

- Preview deployments give every PR a unique, testable URL
- They enable visual review and stakeholder feedback
- Cleanup is critical — orphaned previews waste resources
- Security: use preview-specific secrets, protect from public access
- Deployment status checks integrate previews into the PR workflow
- Branch databases enable full-stack preview environments
