// ============================================================
// Jobs and Steps — Exercises
// ============================================================
// Run: npx tsx 09-cicd/02-github-actions/02-jobs-and-steps/exercises.ts
// ============================================================

// Exercise 1: Job Dependency Graph Types
// Define: Job = { name: string; needs: string[]; steps: string[]; runsOn: string }
// ExecutionPlan = string[][] (groups of parallel jobs)

// YOUR CODE HERE


// Exercise 2: Topological Sort for Job Dependencies
// Implement function resolveJobOrder(jobs: Job[]): string[][]
// Returns groups of jobs that can run in parallel.
// Throw Error("Circular dependency") if cycle detected.

// YOUR CODE HERE


// Exercise 3: Job Execution Simulator
// Implement class JobExecutor with:
// - constructor(jobs: Job[])
// - async execute(): Promise<Record<string, 'success' | 'failure' | 'skipped' | 'cancelled'>>
// Simulate: each step takes 5ms. If job name contains "fail", it fails.
// If a dependency failed, skip the job.

// YOUR CODE HERE


// Exercise 4: Step Output Manager
// Implement class StepOutputManager with:
// - setOutput(stepId: string, key: string, value: string): void
// - getOutput(stepId: string, key: string): string | undefined
// - setEnv(key: string, value: string): void
// - getEnv(key: string): string | undefined
// - resolveExpression(expr: string): string
//   Resolve "${{ steps.X.outputs.Y }}" and "${{ env.Z }}" patterns

// YOUR CODE HERE


// Exercise 5: Artifact Transfer Simulator
// Implement class ArtifactTransfer with:
// - upload(jobName: string, artifactName: string, files: string[]): void
// - download(artifactName: string): string[] | undefined
// - listArtifacts(): Array<{ name: string; uploadedBy: string; files: string[] }>
// - cleanup(artifactName: string): boolean

// YOUR CODE HERE


// Exercise 6: Service Container Manager
// Implement class ServiceManager with:
// - addService(name: string, image: string, ports: Array<{host: number; container: number}>, env?: Record<string,string>): void
// - getConnectionString(name: string): string  (e.g. "postgres://localhost:5432")
// - healthCheck(name: string): boolean  (simulate: return true if service was added)
// - listServices(): Array<{name: string; image: string; status: 'running' | 'stopped'}>

// YOUR CODE HERE


// Exercise 7: Conditional Expression Evaluator
// Implement function evaluateCondition(
//   expression: string,
//   context: { github: Record<string, string>; needs: Record<string, { result: string }> }
// ): boolean
// Support: "github.ref == 'value'", "needs.job.result == 'success'",
// "&&", "||", "success()", "failure()"
// Simplified: only handle single comparisons and status functions.

// YOUR CODE HERE


// Exercise 8: Job Duration Estimator
// Implement function estimateWorkflowDuration(
//   jobs: Array<{name: string; needs: string[]; estimatedMinutes: number}>
// ): number
// Parallel jobs run simultaneously. Serial jobs add up. Return total minutes.

// YOUR CODE HERE


// Exercise 9: Matrix Job Generator
// Implement function generateMatrixJobs(
//   matrix: Record<string, unknown[]>,
//   include?: Array<Record<string, unknown>>,
//   exclude?: Array<Record<string, unknown>>
// ): Array<Record<string, unknown>>
// Generate all combinations, add includes, remove excludes.

// YOUR CODE HERE


// Exercise 10: Job Output Chain
// Implement function chainJobOutputs(
//   jobs: Array<{ name: string; needs: string[]; outputs: Record<string, string> }>,
//   targetJob: string,
//   outputKey: string
// ): string | undefined
// Resolve an output by traversing the dependency chain.
// Target job accesses needs.X.outputs.Y — find the value.

// YOUR CODE HERE


// Exercise 11: Workflow Visualizer
// Implement function visualizeWorkflow(jobs: Array<{name: string; needs: string[]}>): string
// Return ASCII representation:
// "lint ──┐\ntest ──┤──▶ build ──▶ deploy\n       │"
// Simplified: return lines showing parallel groups with arrows.
// Format: "Group 1: [lint, test] → Group 2: [build] → Group 3: [deploy]"

// YOUR CODE HERE


// Exercise 12: Step Retry Wrapper
// Implement function retryStep(
//   name: string,
//   fn: () => Promise<void>,
//   options: { maxRetries: number; continueOnError: boolean }
// ): Promise<{ name: string; status: 'success' | 'failure'; attempts: number }>

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
