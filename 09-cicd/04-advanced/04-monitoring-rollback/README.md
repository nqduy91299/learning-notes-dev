# Monitoring and Rollback

## Table of Contents
1. [Introduction](#introduction)
2. [Deployment Monitoring](#deployment-monitoring)
3. [Health Checks](#health-checks)
4. [Rollback Strategies](#rollback-strategies)
5. [Blue-Green Deployments](#blue-green-deployments)
6. [Canary Deployments](#canary-deployments)
7. [Instant Rollback](#instant-rollback)
8. [Feature Flags](#feature-flags)
9. [Incident Response](#incident-response)
10. [Alerting](#alerting)
11. [Post-Mortem Process](#post-mortem-process)
12. [Best Practices](#best-practices)

---

## Introduction

Deploying code is only half the job. Monitoring ensures deployments are healthy, and rollback strategies provide safety nets when things go wrong. A good deployment strategy assumes failure is possible and plans for rapid recovery.

```
Deploy → Monitor → Healthy? → Yes: Done
                            → No: Rollback → Investigate
```

---

## Deployment Monitoring

### Key Metrics
| Metric              | Description                     | Threshold       |
|--------------------|---------------------------------|-----------------|
| Error rate         | % of requests returning errors  | < 1%            |
| Response time (p95)| 95th percentile latency         | < 500ms         |
| CPU utilization    | Server CPU usage                | < 80%           |
| Memory usage       | Server memory usage             | < 85%           |
| Request rate       | Requests per second             | Within 2x normal|

### Monitoring Tools
| Tool          | Type          | Key Feature               |
|--------------|---------------|---------------------------|
| Datadog      | Full-stack    | APM, logs, metrics        |
| Sentry       | Error tracking| Stack traces, breadcrumbs |
| Grafana      | Visualization | Dashboards, alerting      |
| Prometheus   | Metrics       | Time-series metrics       |
| PagerDuty    | Alerting      | On-call management        |

---

## Health Checks

### Types
1. **Liveness** — Is the application running? (restart if not)
2. **Readiness** — Is the application ready to serve traffic? (don't route if not)
3. **Startup** — Has the application finished initializing?

### Implementation
```typescript
// GET /health
{
  "status": "healthy",
  "version": "1.2.3",
  "uptime": 3600,
  "checks": {
    "database": "connected",
    "cache": "connected",
    "disk": "ok"
  }
}
```

### Health Check Strategy
```
                    ┌─ Healthy → Route traffic
Health Check ──────┤
                    └─ Unhealthy → Remove from load balancer
                                   → Alert on-call
                                   → Auto-rollback (if configured)
```

---

## Rollback Strategies

### Comparison
| Strategy      | Speed    | Risk   | Complexity | Use Case           |
|--------------|----------|--------|------------|---------------------|
| Instant      | Seconds  | Low    | Low        | Revert to previous  |
| Blue-Green   | Seconds  | Low    | Medium     | Full environment swap|
| Canary       | Minutes  | Lowest | High       | Gradual rollout     |
| Feature Flag | Instant  | Low    | Medium     | Per-feature control |

---

## Blue-Green Deployments

Two identical production environments. Only one serves traffic at a time.

```
         ┌───────────────┐
Users ──▶│ Load Balancer  │
         └───────┬───────┘
            ┌────┴────┐
            ▼         ▼
    ┌──────────┐  ┌──────────┐
    │  Blue    │  │  Green   │
    │ (v1.2.3) │  │ (v1.3.0) │
    │ [ACTIVE] │  │ [STANDBY]│
    └──────────┘  └──────────┘
```

### Deployment Process
1. Deploy new version to standby environment (Green)
2. Run smoke tests against Green
3. Switch load balancer to Green
4. Green becomes active, Blue becomes standby
5. If issues: switch back to Blue (instant rollback)

---

## Canary Deployments

Route a small percentage of traffic to the new version. Gradually increase if healthy.

```
                    ┌─── 95% → v1.2.3 (stable)
Users ── Router ───┤
                    └─── 5%  → v1.3.0 (canary)
```

### Rollout Phases
```
Phase 1:  5% traffic → canary (monitor 10 min)
Phase 2: 25% traffic → canary (monitor 10 min)
Phase 3: 50% traffic → canary (monitor 10 min)
Phase 4: 100% traffic → new version is stable
```

### Auto-Rollback Triggers
- Error rate exceeds threshold
- Latency increases beyond threshold
- Health check fails

---

## Instant Rollback

Revert to the previous deployment immediately.

```bash
# Vercel
vercel rollback

# Docker
docker service update --image myapp:v1.2.3 myapp

# Kubernetes
kubectl rollout undo deployment/myapp
```

### Prerequisites
- Previous version must still be available
- Database migrations must be backward-compatible
- Feature flags for new features

---

## Feature Flags

Decouple deployment from feature release.

```typescript
if (featureFlags.isEnabled('new-checkout', { userId })) {
  renderNewCheckout();
} else {
  renderOldCheckout();
}
```

### Benefits
- Deploy code without releasing features
- Gradual rollout to percentage of users
- Instant disable without redeployment
- A/B testing

### Feature Flag Lifecycle
```
Created → Enabled (% rollout) → Fully Enabled → Flag Removed
                  │
                  └── Disabled (rollback)
```

---

## Incident Response

### Severity Levels
| Level | Description              | Response Time | Example                    |
|-------|--------------------------|--------------|----------------------------|
| SEV1  | Complete outage          | < 15 min     | Site is down               |
| SEV2  | Major feature broken     | < 30 min     | Payments failing           |
| SEV3  | Minor feature degraded   | < 2 hours    | Slow search results        |
| SEV4  | Cosmetic issue           | Next sprint  | Button misaligned          |

### Response Steps
1. **Detect** — Monitoring alert or user report
2. **Triage** — Assess severity and impact
3. **Communicate** — Notify stakeholders
4. **Mitigate** — Rollback, feature flag, or hotfix
5. **Resolve** — Fix the root cause
6. **Review** — Post-mortem analysis

---

## Alerting

### Alert Levels
```
Info     → Log only
Warning  → Slack notification
Critical → PagerDuty page + Slack + Email
```

### Alert Fatigue Prevention
- Only alert on actionable issues
- Group related alerts
- Set appropriate thresholds (not too sensitive)
- Use escalation policies

---

## Post-Mortem Process

### Template
1. **Summary** — What happened?
2. **Impact** — Who was affected? For how long?
3. **Timeline** — Minute-by-minute sequence of events
4. **Root Cause** — Why did it happen?
5. **What Went Well** — What worked in the response?
6. **What Went Wrong** — What could be improved?
7. **Action Items** — Specific tasks to prevent recurrence

### Blameless Culture
- Focus on systems, not people
- "How did the system allow this?" not "Who caused this?"
- Share learnings openly

---

## Best Practices

1. **Monitor every deployment** — Watch metrics for 15+ minutes after deploy
2. **Have rollback ready** — One-click rollback for every deployment
3. **Use health checks** — Automated liveness and readiness checks
4. **Start with canary** — Route small traffic before full rollout
5. **Use feature flags** — Decouple deploy from release
6. **Set up alerts** — Get notified before users notice
7. **Practice incident response** — Run game days / fire drills
8. **Write post-mortems** — Learn from every incident
9. **Keep deployments small** — Small changes are easier to debug
10. **Test rollback procedures** — Verify rollback works before you need it

---

## Key Takeaways

- Monitoring watches for errors, latency, and resource usage after deployment
- Health checks verify application readiness at the infrastructure level
- Blue-green: instant switch between two environments
- Canary: gradual traffic shift with automatic rollback on errors
- Feature flags: toggle features without redeployment
- Incident response: detect → triage → mitigate → resolve → review
- Blameless post-mortems improve systems, not assign blame
