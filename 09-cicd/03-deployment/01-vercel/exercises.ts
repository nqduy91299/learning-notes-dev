// ============================================================
// Vercel Deployment — Exercises
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/01-vercel/exercises.ts
// ============================================================

// Exercise 1: Deployment Config Types
// Define: VercelConfig = { buildCommand?: string; outputDirectory?: string; installCommand?: string; framework?: string; regions?: string[]; rewrites?: Rewrite[]; redirects?: Redirect[] }
// Rewrite = { source: string; destination: string }
// Redirect = { source: string; destination: string; permanent: boolean }

// YOUR CODE HERE


// Exercise 2: Framework Detector
// Implement function detectFramework(packageJson: { dependencies?: Record<string,string>; devDependencies?: Record<string,string> }): string | null
// Detect: "next"→"nextjs", "nuxt"→"nuxt", "svelte"→"sveltekit", "@angular/core"→"angular". Return null if unknown.

// YOUR CODE HERE


// Exercise 3: Environment Variable Resolver
// Implement function resolveEnvVars(
//   vars: Array<{key: string; value: string; target: Array<'production'|'preview'|'development'>}>,
//   environment: 'production' | 'preview' | 'development'
// ): Record<string, string>

// YOUR CODE HERE


// Exercise 4: Preview URL Generator
// Implement function generatePreviewUrl(project: string, commitSha: string, team: string): string
// Format: https://{project}-{sha7}-{team}.vercel.app (sha7 = first 7 chars of SHA)

// YOUR CODE HERE


// Exercise 5: Rewrite Rule Matcher
// Implement function matchRewrite(rewrites: Rewrite[], path: string): string | null
// Match source patterns with :param* syntax. Return destination or null.
// "/api/:path*" matches "/api/users/123" → destination with :path* replaced by "users/123"

// YOUR CODE HERE


// Exercise 6: Redirect Resolver
// Implement function resolveRedirect(
//   redirects: Redirect[],
//   path: string
// ): { destination: string; statusCode: number } | null
// permanent → 308, not permanent → 307.

// YOUR CODE HERE


// Exercise 7: Build Output Analyzer
// Implement function analyzeBuildOutput(
//   files: Array<{path: string; size: number; type: 'static' | 'serverless' | 'edge'}>
// ): { totalSize: number; staticFiles: number; serverlessFunctions: number; edgeFunctions: number; largestFile: string }

// YOUR CODE HERE


// Exercise 8: Deployment Status Tracker
// Implement class DeploymentTracker with:
// - create(id: string, branch: string, sha: string): void
// - updateStatus(id: string, status: 'building' | 'ready' | 'error' | 'cancelled'): void
// - getByBranch(branch: string): Array<{id: string; status: string; sha: string}>
// - getLatest(branch: string): {id: string; status: string} | undefined

// YOUR CODE HERE


// Exercise 9: Serverless Function Config Validator
// Implement function validateFunctionConfig(config: { memory?: number; maxDuration?: number; regions?: string[] }): { valid: boolean; errors: string[] }
// Memory: 128-3008 in 64MB increments. MaxDuration: 1-300. Regions: non-empty if specified.

// YOUR CODE HERE


// Exercise 10: Monorepo Build Filter
// Implement function shouldBuild(
//   rootDirectory: string,
//   changedFiles: string[],
//   ignorePatterns?: string[]
// ): boolean
// Build if any changed file is under rootDirectory and not matching ignorePatterns.

// YOUR CODE HERE


// Exercise 11: Deployment URL Router
// Implement function routeDeployment(
//   branch: string,
//   customDomains: Record<string, string>,  // branch → domain
//   projectName: string,
//   team: string
// ): { url: string; type: 'production' | 'preview' }

// YOUR CODE HERE


// Exercise 12: Vercel Config Merger
// Implement function mergeVercelConfigs(base: Partial<VercelConfig>, override: Partial<VercelConfig>): VercelConfig
// Arrays (rewrites, redirects, regions) are concatenated. Strings are overridden.

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
