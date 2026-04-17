// ============================================================
// CI/CD Fundamentals: What is CI/CD? — Exercises
// ============================================================
// Run: npx tsx 09-cicd/01-ci-fundamentals/01-what-is-ci-cd/exercises.ts
// ============================================================

// Exercise 1: Pipeline Stage Type
// Define a type PipelineStage with: name (string), status ('pending'|'running'|'success'|'failure'|'skipped'|'cancelled'),
// commands (string[]), dependsOn (string[]), and optional timeoutMs (number).
// Then create a variable `lintStage` of that type with name "lint", status "pending", commands ["npm run lint"],
// dependsOn ["install"].

// YOUR CODE HERE
export type PipelineStage = unknown; // Replace unknown with your type
// export const lintStage: PipelineStage = ...


// Exercise 2: Pipeline Class
// Implement a Pipeline class with:
// - constructor(name: string)
// - addStage(stage: PipelineStage): void
// - getStages(): PipelineStage[]
// - getStage(name: string): PipelineStage | undefined
// - getExecutionOrder(): string[] — returns stage names in valid execution order
//   (stages whose dependencies come first; if a dependency is missing, skip that stage)

// YOUR CODE HERE
// export class Pipeline { ... }


// Exercise 3: Pipeline Status
// Define type PipelineStatus = 'pending' | 'running' | 'success' | 'failure' | 'cancelled'
// Implement function getPipelineStatus(stages: PipelineStage[]): PipelineStatus
// Rules:
// - If any stage is 'failure' → 'failure'
// - If any stage is 'cancelled' → 'cancelled'
// - If any stage is 'running' → 'running'
// - If all stages are 'success' or 'skipped' → 'success'
// - Otherwise → 'pending'

// YOUR CODE HERE


// Exercise 4: Stage Dependency Validator
// Implement function validateDependencies(stages: PipelineStage[]): string[]
// Returns an array of error messages:
// - "Stage 'X' depends on unknown stage 'Y'" if a dependency doesn't exist
// - "Circular dependency detected involving stage 'X'" if there's a cycle

// YOUR CODE HERE


// Exercise 5: Pipeline Duration Estimator
// Given an array of stages with an `estimatedDurationMs` field and dependencies,
// calculate the total pipeline duration assuming stages without dependency
// relationships run in parallel.
// Implement: function estimatePipelineDuration(stages: Array<{name: string; dependsOn: string[]; estimatedDurationMs: number}>): number

// YOUR CODE HERE


// Exercise 6: CI vs CD Classifier
// Implement function classifyPipeline(stages: PipelineStage[]): 'ci-only' | 'continuous-delivery' | 'continuous-deployment'
// Rules:
// - If no stage has name containing "deploy" → 'ci-only'
// - If a deploy stage exists and has a `manualApproval` property set to true → 'continuous-delivery'
// - If a deploy stage exists and no manual approval → 'continuous-deployment'
// Extend PipelineStage or use a new type with optional manualApproval?: boolean

type ClassifiableStage = {
  name: string;
  commands: string[];
  dependsOn: string[];
  manualApproval?: boolean;
};

// YOUR CODE HERE
// export function classifyPipeline(stages: ClassifiableStage[]): string { ... }


// Exercise 7: Build Trigger Matcher
// Implement function shouldTrigger(trigger: TriggerConfig, event: GitEvent): boolean
// Types:
type TriggerConfig = {
  branches?: string[];       // glob-like: "main", "feature/*"
  events: Array<'push' | 'pull_request' | 'schedule' | 'manual'>;
  paths?: string[];          // file path prefixes: "src/", "package.json"
};

type GitEvent = {
  type: 'push' | 'pull_request' | 'schedule' | 'manual';
  branch: string;
  changedFiles: string[];
};

// Simple glob: "feature/*" matches "feature/foo" but not "feature/foo/bar"
// If branches is undefined, match all branches
// If paths is undefined, match all paths; if defined, at least one changed file must match a path prefix

// YOUR CODE HERE


// Exercise 8: Pipeline Retry Logic
// Implement function runWithRetry<T>(fn: () => Promise<T>, maxRetries: number, delayMs: number): Promise<T>
// - Calls fn, if it throws, waits delayMs then retries up to maxRetries times
// - If all retries fail, throw the last error
// For testing purposes, use a simple delay: const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// YOUR CODE HERE


// Exercise 9: Artifact Manager
// Implement class ArtifactManager with:
// - upload(name: string, data: string, metadata?: Record<string, string>): void
// - download(name: string): string | undefined
// - list(): Array<{name: string; size: number; uploadedAt: Date; metadata?: Record<string, string>}>
// - delete(name: string): boolean
// - getTotalSize(): number (sum of all artifact data lengths)

// YOUR CODE HERE


// Exercise 10: Pipeline Event Emitter
// Implement class PipelineEventEmitter with:
// - on(event: string, callback: (...args: unknown[]) => void): void
// - emit(event: string, ...args: unknown[]): void
// - off(event: string, callback: (...args: unknown[]) => void): void
// Events to support: 'stage:start', 'stage:end', 'pipeline:start', 'pipeline:end', 'pipeline:error'

// YOUR CODE HERE


// Exercise 11: Environment Config Resolver
// Implement function resolveConfig(base: Record<string, string>, overrides: Record<string, Record<string, string>>, env: string): Record<string, string>
// Merges base config with environment-specific overrides.
// Example: resolveConfig({API: "http://localhost"}, {production: {API: "https://api.com"}}, "production")
// → {API: "https://api.com"}

// YOUR CODE HERE


// Exercise 12: Pipeline Step Output Parser
// Implement function parseStepOutput(output: string): { exitCode: number; stdout: string; stderr: string; durationMs: number }
// Input format: "EXIT:0\nSTDOUT:some output\nSTDERR:some error\nDURATION:1234"
// Each field is on its own line prefixed by the key and colon.
// If a field is missing, use defaults: exitCode=1, stdout="", stderr="", durationMs=0

// YOUR CODE HERE


// ============================================================
// DO NOT MODIFY BELOW THIS LINE — test runner placeholder
// ============================================================
console.log("Exercises file loaded successfully. Implement the exercises above and run solutions.ts to verify.");
