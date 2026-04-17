// ============================================================
// Monitoring & Rollback — Exercises
// ============================================================
// Run: npx tsx 09-cicd/04-advanced/04-monitoring-rollback/exercises.ts
// ============================================================

// Exercise 1: Health Check System
// Implement class HealthChecker with:
// - addCheck(name: string, fn: () => Promise<boolean>): void
// - async check(): Promise<{status: 'healthy'|'degraded'|'unhealthy'; checks: Record<string, boolean>}>
// healthy = all pass, degraded = some pass, unhealthy = none pass

// YOUR CODE HERE


// Exercise 2: Metric Collector
// Implement class MetricCollector with:
// - record(metric: string, value: number, timestamp?: Date): void
// - getAverage(metric: string, windowMs: number): number
// - getP95(metric: string, windowMs: number): number
// - getRate(metric: string, windowMs: number): number  (count per second)

// YOUR CODE HERE


// Exercise 3: Rollback Decision Engine
// Implement function shouldRollback(metrics: {
//   errorRate: number; p95Latency: number; healthChecksPassing: boolean;
//   thresholds: { maxErrorRate: number; maxLatency: number }
// }): { rollback: boolean; reasons: string[] }

// YOUR CODE HERE


// Exercise 4: Blue-Green Deployment Simulator
// Implement class BlueGreenDeployment with:
// - constructor() — starts with blue active
// - deploy(version: string): string  (deploys to inactive env, returns env name)
// - swap(): string  (switches active env, returns new active)
// - rollback(): string  (swaps back)
// - getActive(): { env: 'blue'|'green'; version: string }
// - getStandby(): { env: 'blue'|'green'; version: string }

// YOUR CODE HERE


// Exercise 5: Canary Release Manager
// Implement class CanaryRelease with:
// - start(newVersion: string, phases: number[]): void  (phases = traffic percentages [5,25,50,100])
// - getCurrentPhase(): { phase: number; trafficPercent: number; version: string }
// - advance(): boolean  (move to next phase, false if complete)
// - rollback(): void  (set traffic to 0%)
// - getTrafficSplit(): { stable: number; canary: number }

// YOUR CODE HERE


// Exercise 6: Feature Flag Manager
// Implement class FeatureFlagManager with:
// - create(name: string, defaultEnabled: boolean): void
// - isEnabled(name: string, context?: { userId?: string; percentage?: number }): boolean
//   If percentage set, enable for that % of users (hash userId to determine)
// - enable(name: string): void
// - disable(name: string): void
// - listFlags(): Array<{name: string; enabled: boolean}>

// YOUR CODE HERE


// Exercise 7: Incident Severity Classifier
// Implement function classifySeverity(incident: {
//   usersAffected: number; totalUsers: number;
//   serviceDown: boolean; dataLoss: boolean; revenueImpact: boolean
// }): { severity: 'SEV1'|'SEV2'|'SEV3'|'SEV4'; responseTime: string }

// YOUR CODE HERE


// Exercise 8: Alert Manager
// Implement class AlertManager with:
// - addRule(name: string, condition: (value: number) => boolean, severity: 'info'|'warning'|'critical'): void
// - evaluate(metric: string, value: number): Array<{rule: string; severity: string}>
// - getActiveAlerts(): Array<{rule: string; severity: string; triggeredAt: Date}>
// - acknowledge(rule: string): void

// YOUR CODE HERE


// Exercise 9: Deployment Timeline Builder
// Implement function buildTimeline(events: Array<{time: Date; event: string; actor: string}>): string
// Format: "[HH:MM] event (by actor)" one per line, sorted by time.

// YOUR CODE HERE


// Exercise 10: Rollback Plan Generator
// Implement function generateRollbackPlan(deployment: {
//   type: 'blue-green'|'canary'|'direct';
//   currentVersion: string; previousVersion: string;
//   hasDatabaseMigration: boolean;
// }): { steps: string[]; estimatedTime: string; risk: 'low'|'medium'|'high' }

// YOUR CODE HERE


// Exercise 11: SLO Monitor
// Implement function checkSLO(
//   metrics: Array<{timestamp: Date; value: number}>,
//   target: number,  // e.g., 99.9 (percentage)
//   windowDays: number
// ): { current: number; target: number; budget: number; status: 'ok'|'warning'|'critical' }
// budget = remaining error budget as percentage

// YOUR CODE HERE


// Exercise 12: Post-Mortem Generator
// Implement function generatePostMortem(incident: {
//   title: string; severity: string; duration: number; // minutes
//   impact: string; rootCause: string; timeline: Array<{time: string; event: string}>;
//   actionItems: Array<{task: string; owner: string; priority: 'high'|'medium'|'low'}>
// }): string
// Generate a markdown post-mortem document.

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
