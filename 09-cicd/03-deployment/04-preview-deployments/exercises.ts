// ============================================================
// Preview Deployments — Exercises
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/04-preview-deployments/exercises.ts
// ============================================================

// Exercise 1: Preview URL Generator
// Implement function generatePreviewUrl(config: {platform: 'vercel'|'netlify'|'custom'; project: string; prNumber?: number; sha?: string; team?: string; domain?: string}): string

// YOUR CODE HERE


// Exercise 2: Preview Deployment Manager
// Implement class PreviewManager with:
// - deploy(prNumber: number, sha: string): { url: string; deployId: string }
// - getByPR(prNumber: number): {url: string; deployId: string; status: string} | undefined
// - updateStatus(deployId: string, status: 'building'|'ready'|'error'|'deleted'): void
// - cleanup(prNumber: number): boolean
// - listActive(): Array<{prNumber: number; url: string; status: string}>

// YOUR CODE HERE


// Exercise 3: PR Comment Builder
// Implement function buildPreviewComment(deployment: {url: string; sha: string; status: 'building'|'ready'|'error'; buildTime?: number}): string
// Format a markdown comment with deployment info, status emoji, and link.

// YOUR CODE HERE


// Exercise 4: Deployment Status State Machine
// Implement class DeploymentStateMachine with:
// - constructor(initialState: string)
// - transition(event: string): string  (returns new state)
// Valid transitions: pending→building, building→ready, building→error, ready→active, active→inactive, any→cancelled
// Throw on invalid transitions.

// YOUR CODE HERE


// Exercise 5: Stale Preview Detector
// Implement function findStaleDeployments(
//   deployments: Array<{prNumber: number; createdAt: Date; lastAccessed: Date; status: string}>,
//   maxStaleDays: number
// ): number[]  (returns PR numbers of stale deployments)

// YOUR CODE HERE


// Exercise 6: Preview Environment Config
// Implement function buildPreviewEnv(
//   prNumber: number,
//   baseConfig: Record<string, string>,
//   previewOverrides: Record<string, string>
// ): Record<string, string>
// Auto-add PREVIEW_URL and PR_NUMBER to the config.

// YOUR CODE HERE


// Exercise 7: Resource Limiter
// Implement class ResourceLimiter with:
// - constructor(maxPreviews: number, maxCostPerDay: number)
// - canDeploy(currentCount: number, dailyCost: number): { allowed: boolean; reason?: string }
// - suggestCleanup(deployments: Array<{prNumber: number; createdAt: Date; cost: number}>): number[]
//   Suggest oldest and most expensive deployments to clean up.

// YOUR CODE HERE


// Exercise 8: Branch to Environment Mapper
// Implement function mapBranchToEnvironment(
//   branch: string,
//   rules: Array<{pattern: string; environment: string}>
// ): string
// Pattern matching: "main"→exact, "feature/*"→glob, default→"preview".

// YOUR CODE HERE


// Exercise 9: Deployment Diff Reporter
// Implement function generateDeployDiff(
//   current: {url: string; sha: string; deployedAt: Date},
//   previous: {url: string; sha: string; deployedAt: Date}
// ): { currentUrl: string; previousUrl: string; commitsBehind: number; timeSinceLastDeploy: string }
// timeSinceLastDeploy as human-readable: "2 hours ago", "3 days ago".

// YOUR CODE HERE


// Exercise 10: Preview DNS Manager
// Implement class PreviewDNS with:
// - createRecord(prNumber: number, target: string): string  (returns subdomain like pr-42.preview.myapp.com)
// - deleteRecord(prNumber: number): boolean
// - resolve(subdomain: string): string | null  (returns target)
// - listRecords(): Array<{subdomain: string; target: string}>

// YOUR CODE HERE


// Exercise 11: Cleanup Orchestrator
// Implement async function cleanupPreviews(
//   deployments: Array<{prNumber: number; status: string}>,
//   isPROpen: (prNumber: number) => Promise<boolean>,
//   deleteDeploy: (prNumber: number) => Promise<void>
// ): Promise<{cleaned: number[]; kept: number[]; errors: number[]}>

// YOUR CODE HERE


// Exercise 12: Preview Test Runner
// Implement async function runPreviewTests(
//   previewUrl: string,
//   tests: Array<{name: string; path: string; expectedStatus: number}>
// ): Promise<Array<{name: string; passed: boolean; actualStatus: number}>>
// Simulate HTTP checks: even-indexed tests pass, odd-indexed "fail" with 500.

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
