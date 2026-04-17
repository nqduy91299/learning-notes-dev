// ============================================================
// GitHub Actions: Workflow Basics — Exercises
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/01-workflows-basics/exercises.ts
// ============================================================

// Exercise 1: Workflow Config Type
// Define types that model a GitHub Actions workflow:
// WorkflowTrigger = { events: string[]; branches?: string[]; paths?: string[]; pathsIgnore?: string[] }
// WorkflowConfig = { name: string; on: WorkflowTrigger; jobs: Record<string, JobConfig> }
// JobConfig = { runsOn: string; steps: StepConfig[]; needs?: string[] }
// StepConfig = { name?: string; run?: string; uses?: string; with?: Record<string, string> }

// YOUR CODE HERE


// Exercise 2: Workflow Validator
// Implement function validateWorkflow(config: unknown): { valid: boolean; errors: string[] }
// Rules:
// - config must be object with 'name' (string), 'on' (object with events array), 'jobs' (non-empty object)
// - Each job must have 'runsOn' (string) and 'steps' (non-empty array)
// - Each step must have either 'run' or 'uses' (not both, not neither)

// YOUR CODE HERE


// Exercise 3: Trigger Evaluator
// Implement function evaluateTrigger(trigger: WorkflowTrigger, event: { type: string; branch: string; changedFiles: string[] }): boolean
// - event.type must be in trigger.events
// - If trigger.branches exists, event.branch must match one (simple glob: * matches any single segment)
// - If trigger.paths exists, at least one changedFile must start with a path prefix
// - If trigger.pathsIgnore exists, skip if ALL changedFiles match pathsIgnore prefixes

// YOUR CODE HERE


// Exercise 4: Cron Parser
// Implement function parseCron(expression: string): { minute: string; hour: string; dayOfMonth: string; month: string; dayOfWeek: string }
// Parse "0 0 * * 1" into its components. Validate that expression has exactly 5 parts.
// Throw if invalid.

// YOUR CODE HERE


// Exercise 5: Cron Schedule Matcher
// Implement function matchesCron(expression: string, date: Date): boolean
// Check if a given Date matches the cron expression.
// Support: specific numbers, '*' (any), '*/N' (every N).
// Ignore day-of-week for simplicity if it's '*'.

// YOUR CODE HERE


// Exercise 6: Concurrency Group Resolver
// Implement function resolveConcurrencyGroup(
//   template: string,
//   context: { workflow: string; ref: string; sha: string }
// ): string
// Replace ${{ github.workflow }}, ${{ github.ref }}, ${{ github.sha }} in template.

// YOUR CODE HERE


// Exercise 7: Branch Glob Matcher
// Implement function matchBranch(pattern: string, branch: string): boolean
// Patterns:
// - "main" → exact match
// - "feature/*" → matches "feature/foo" but not "feature/foo/bar"
// - "release/**" → matches "release/1.0" and "release/1.0/hotfix"
// - "!hotfix" → negation (doesn't match "hotfix")

// YOUR CODE HERE


// Exercise 8: Path Filter Evaluator
// Implement function evaluatePathFilter(
//   config: { paths?: string[]; pathsIgnore?: string[] },
//   changedFiles: string[]
// ): boolean
// If paths defined: at least one file must match a path pattern
// If pathsIgnore defined: must have at least one file NOT matching any ignore pattern
// If neither: return true

// YOUR CODE HERE


// Exercise 9: Workflow Run Deduplicator
// Implement function deduplicateRuns(
//   runs: Array<{ id: number; group: string; createdAt: Date; status: 'queued' | 'running' | 'completed' }>,
//   cancelInProgress: boolean
// ): Array<{ id: number; action: 'keep' | 'cancel' }>
// For each concurrency group, keep only the latest run. If cancelInProgress, cancel running ones too.

// YOUR CODE HERE


// Exercise 10: Workflow Input Validator
// Implement function validateInputs(
//   schema: Record<string, { type: 'string' | 'boolean' | 'choice'; required?: boolean; options?: string[]; default?: string }>,
//   inputs: Record<string, string>
// ): { valid: boolean; errors: string[]; resolved: Record<string, string> }
// Apply defaults for missing optional inputs. Validate required, type matching, choice options.

// YOUR CODE HERE


// Exercise 11: Event Payload Simulator
// Implement function createEventPayload(
//   type: 'push' | 'pull_request' | 'schedule' | 'workflow_dispatch',
//   overrides?: Record<string, unknown>
// ): Record<string, unknown>
// Return a realistic event payload shape with defaults:
// push: { ref, sha, commits: [] }
// pull_request: { number, action: 'opened', head: {ref, sha}, base: {ref} }
// schedule: { schedule: '0 0 * * *' }
// workflow_dispatch: { inputs: {} }

// YOUR CODE HERE


// Exercise 12: Runner Selector
// Implement function selectRunner(
//   runsOn: string | string[],
//   availableRunners: Array<{ name: string; labels: string[]; status: 'online' | 'offline' }>
// ): string | null
// Find an online runner that matches ALL labels in runsOn. Return runner name or null.

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
