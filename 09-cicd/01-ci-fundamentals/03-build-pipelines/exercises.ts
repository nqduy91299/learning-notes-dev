// ============================================================
// Build Pipelines — Exercises
// ============================================================
// Run: npx tsx 09-cicd/01-ci-fundamentals/03-build-pipelines/exercises.ts
// ============================================================

// Exercise 1: Stage Definition
// Define types:
// StageStatus = 'queued' | 'running' | 'success' | 'failure' | 'cancelled'
// StageConfig = { name: string; commands: string[]; dependsOn: string[]; timeout?: number; retries?: number; condition?: 'always' | 'on-success' | 'on-failure' }
// Create a sample stage config for a "lint" stage.

// YOUR CODE HERE


// Exercise 2: Build Pipeline Scheduler
// Implement class BuildScheduler with:
// - addStage(config: StageConfig): void
// - getExecutionPlan(): string[][]  — returns groups of stages that can run in parallel
//   e.g., [["install"], ["lint", "test"], ["build"], ["deploy"]]
//   Stages in the same group have all their deps satisfied by previous groups.

// YOUR CODE HERE


// Exercise 3: Pipeline Executor Simulator
// Implement class PipelineExecutor with:
// - constructor(stages: StageConfig[])
// - async execute(): Promise<Record<string, StageStatus>>
//   Simulates execution: each command "runs" for 10ms.
//   If a stage's name includes "fail", simulate failure.
//   If a dependency failed, skip the stage.
//   Returns final status for each stage.

// YOUR CODE HERE


// Exercise 4: Cache Key Generator
// Implement function generateCacheKey(template: string, context: Record<string, string>): string
// Template format: "prefix-{{ hash(file) }}-{{ value }}"
// {{ hash(file) }} → compute a simple hash of the file value from context
// {{ value }} → directly substitute the value from context
// Simple hash: sum of char codes modulo 10000, as string.

// YOUR CODE HERE


// Exercise 5: Cache Hit Predictor
// Implement function predictCacheHit(
//   currentKey: string,
//   restoreKeys: string[],
//   availableKeys: string[]
// ): string | null
// First try exact match with currentKey.
// Then try prefix match with restoreKeys (in order), returning the first availableKey that starts with any restoreKey.
// Return null if no match.

// YOUR CODE HERE


// Exercise 6: Artifact Store
// Implement class ArtifactStore with:
// - upload(stage: string, name: string, data: string, retentionDays: number): void
// - download(name: string): string | undefined
// - listByStage(stage: string): string[]
// - cleanup(currentDate: Date): number — removes expired artifacts, returns count removed
// Track upload date internally.

// YOUR CODE HERE


// Exercise 7: Parallel Stage Grouper
// Given stages with dependencies, group them into parallel execution layers.
// Implement function groupStages(stages: Array<{name: string; dependsOn: string[]}>): string[][]
// Each group can execute in parallel. Groups are ordered so all deps are in earlier groups.

// YOUR CODE HERE


// Exercise 8: Pipeline Duration Calculator
// Implement function calculateDuration(
//   plan: string[][],  // parallel groups from Exercise 7
//   durations: Record<string, number>  // stage name → duration in ms
// ): number
// Each group takes as long as its slowest stage (parallel). Total = sum of group maxes.

// YOUR CODE HERE


// Exercise 9: Environment Config Builder
// Implement class EnvConfigBuilder with fluent API:
// - new EnvConfigBuilder(env: 'development' | 'staging' | 'production')
// - set(key: string, value: string): this
// - setSecret(key: string, value: string): this  (marks as secret)
// - inherit(parent: EnvConfigBuilder): this  (copies all non-secret vars from parent)
// - build(): { variables: Record<string, string>; secrets: string[] }
//   secrets array contains the keys that are secret

// YOUR CODE HERE


// Exercise 10: Pipeline Retry Handler
// Implement function executeWithRetry(
//   stageName: string,
//   fn: () => Promise<boolean>,  // returns true on success
//   maxRetries: number
// ): Promise<{ success: boolean; attempts: number; stageName: string }>

// YOUR CODE HERE


// Exercise 11: Conditional Stage Evaluator
// Implement function shouldRunStage(
//   stage: { name: string; condition?: 'always' | 'on-success' | 'on-failure' },
//   previousResults: Record<string, 'success' | 'failure' | 'cancelled'>
// ): boolean
// 'always' → always run
// 'on-success' (default) → run only if ALL previous stages succeeded
// 'on-failure' → run only if ANY previous stage failed

// YOUR CODE HERE


// Exercise 12: Pipeline YAML-like Config Validator
// Implement function validatePipelineConfig(config: unknown): { valid: boolean; errors: string[] }
// Config must be an object with:
// - name (string, required)
// - stages (non-empty array, required)
// - Each stage needs: name (string), commands (non-empty string array)
// Return specific error messages for each violation.

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully. Implement the exercises above and run solutions.ts to verify.");
