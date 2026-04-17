// ============================================================
// Reusable Workflows — Exercises
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/04-reusable-workflows/exercises.ts
// ============================================================

// Exercise 1: Workflow Call Types
// Define types for reusable workflows:
// WorkflowInput = { name: string; type: 'string' | 'number' | 'boolean'; required: boolean; default?: string }
// WorkflowSecret = { name: string; required: boolean }
// WorkflowOutput = { name: string; value: string }
// ReusableWorkflow = { name: string; inputs: WorkflowInput[]; secrets: WorkflowSecret[]; outputs: WorkflowOutput[]; jobs: string[] }

// YOUR CODE HERE


// Exercise 2: Workflow Composer
// Implement class WorkflowComposer with:
// - addReusableWorkflow(name: string, ref: string, inputs?: Record<string,string>, secrets?: 'inherit' | Record<string,string>): void
// - addDirectJob(name: string, steps: string[], needs?: string[]): void
// - compose(): { jobs: Array<{name: string; type: 'reusable' | 'direct'; needs: string[]}> }
// Validates that needs references exist.

// YOUR CODE HERE


// Exercise 3: Input Validator
// Implement function validateWorkflowInputs(
//   schema: WorkflowInput[],
//   provided: Record<string, string>
// ): { valid: boolean; errors: string[]; resolved: Record<string, string | number | boolean> }
// Apply type coercion: "true"→true, "42"→42. Apply defaults.

// YOUR CODE HERE


// Exercise 4: Composite Action Builder
// Implement class CompositeActionBuilder with fluent API:
// - input(name: string, opts: {required?: boolean; default?: string}): this
// - output(name: string, valueExpr: string): this
// - step(config: {name: string; run?: string; uses?: string}): this
// - build(): object  (returns the action.yml-like structure)

// YOUR CODE HERE


// Exercise 5: Action Version Resolver
// Implement function resolveActionVersion(
//   ref: string,
//   versions: Array<{tag: string; sha: string; date: Date}>
// ): { tag: string; sha: string } | null
// ref can be: "v4" (major), "v4.1.1" (exact), SHA (40 hex chars), "main" (not found in tags)
// "v4" matches latest "v4.x.x"

// YOUR CODE HERE


// Exercise 6: Secret Inheritance Resolver
// Implement function resolveSecrets(
//   mode: 'inherit' | Record<string, string>,
//   callerSecrets: Record<string, string>,
//   requiredSecrets: string[]
// ): { resolved: Record<string, string>; missing: string[] }
// 'inherit' passes all caller secrets. Explicit passes only specified.

// YOUR CODE HERE


// Exercise 7: Workflow Call Chain Validator
// Implement function validateCallChain(
//   workflows: Record<string, { calls: string[] }>,
//   maxDepth: number
// ): { valid: boolean; errors: string[] }
// Check: no circular calls, depth doesn't exceed maxDepth.

// YOUR CODE HERE


// Exercise 8: Action Marketplace Search Simulator
// Implement class ActionMarketplace with:
// - publish(action: {name: string; author: string; description: string; stars: number; verified: boolean}): void
// - search(query: string): Array<{name: string; author: string; stars: number}>
//   Match query against name or description (case-insensitive). Sort by stars desc.
// - getVerified(): same return type, only verified actions

// YOUR CODE HERE


// Exercise 9: Reusable Workflow Output Merger
// Implement function mergeWorkflowOutputs(
//   workflows: Array<{ name: string; outputs: Record<string, string> }>
// ): Record<string, string>
// Prefix each output with workflow name: "workflow-name.output-key"

// YOUR CODE HERE


// Exercise 10: Action Dependency Graph
// Implement function buildActionDependencyGraph(
//   steps: Array<{name: string; uses?: string; needs?: string[]}>
// ): Record<string, string[]>
// Map each step to its dependencies (both explicit needs and action references).

// YOUR CODE HERE


// Exercise 11: Workflow Template Engine
// Implement function renderWorkflowTemplate(
//   template: string,
//   variables: Record<string, string>
// ): string
// Replace {{VAR}} patterns with values. Throw if a variable is used but not provided.

// YOUR CODE HERE


// Exercise 12: Composite Action Step Counter
// Implement function countTotalSteps(
//   actions: Record<string, { steps: number; uses: string[] }>,
//   entryAction: string
// ): number
// Recursively count all steps including nested composite actions. Handle cycles.

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
