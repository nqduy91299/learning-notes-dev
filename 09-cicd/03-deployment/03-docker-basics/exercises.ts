// ============================================================
// Docker Basics — Exercises
// ============================================================
// Run: npx tsx 09-cicd/03-deployment/03-docker-basics/exercises.ts
// ============================================================

// Exercise 1: Dockerfile Instruction Types
// Define type DockerInstruction = { type: 'FROM'|'RUN'|'COPY'|'WORKDIR'|'CMD'|'EXPOSE'|'ENV'|'ARG'|'ENTRYPOINT'|'ADD'|'USER'; args: string }
// Define type Dockerfile = { instructions: DockerInstruction[] }

// YOUR CODE HERE


// Exercise 2: Dockerfile Parser
// Implement function parseDockerfile(content: string): DockerInstruction[]
// Parse each line as "INSTRUCTION args". Ignore comments (#) and empty lines.
// Handle multi-line (trailing \): join continuation lines.

// YOUR CODE HERE


// Exercise 3: Layer Cache Simulator
// Implement function simulateLayerCache(
//   instructions: DockerInstruction[],
//   cachedLayers: Array<{instruction: string; hash: string}>,
//   fileHashes: Record<string, string>
// ): Array<{instruction: string; cached: boolean}>
// COPY invalidates if any file hash changed. RUN invalidates if previous layer invalidated.
// Once a layer is invalidated, all subsequent layers are uncached.

// YOUR CODE HERE


// Exercise 4: Multi-Stage Build Analyzer
// Implement function analyzeMultiStage(instructions: DockerInstruction[]): Array<{name: string | null; instructionCount: number; fromImage: string}>
// Each FROM starts a new stage. "FROM image AS name" has a name.

// YOUR CODE HERE


// Exercise 5: Image Size Estimator
// Implement function estimateImageSize(
//   baseImageSizeMB: number,
//   instructions: DockerInstruction[],
//   fileSizes: Record<string, number>  // path → MB
// ): number
// COPY adds file sizes. RUN adds 5MB (rough estimate). Final stage only.

// YOUR CODE HERE


// Exercise 6: Dockerignore Matcher
// Implement function isIgnored(path: string, patterns: string[]): boolean
// Patterns: "node_modules" matches exact dir, "*.md" matches extension, "!" negates.
// Process patterns in order; later patterns override earlier ones.

// YOUR CODE HERE


// Exercise 7: Docker Compose Service Parser
// Implement function parseComposeServices(config: {
//   services: Record<string, {image?: string; build?: string; ports?: string[]; depends_on?: string[]; environment?: string[]}>
// }): Array<{name: string; type: 'image' | 'build'; ports: Array<{host: number; container: number}>; dependencies: string[]}>

// YOUR CODE HERE


// Exercise 8: Container Port Conflict Detector
// Implement function detectPortConflicts(
//   services: Array<{name: string; ports: Array<{host: number}>}>
// ): Array<{port: number; services: string[]}>
// Return ports used by multiple services.

// YOUR CODE HERE


// Exercise 9: Dockerfile Linter
// Implement function lintDockerfile(instructions: DockerInstruction[]): string[]
// Rules:
// - Must start with FROM
// - Should not use latest tag (FROM node:latest)
// - Should have WORKDIR before COPY/RUN
// - Should not COPY . . before package*.json (cache efficiency)
// - Should use CMD or ENTRYPOINT

// YOUR CODE HERE


// Exercise 10: Docker Tag Generator
// Implement function generateTags(
//   registry: string, repo: string, sha: string, branch: string, version?: string
// ): string[]
// Tags: sha (short 7), branch (sanitized: replace / with -), version (if provided), "latest" (if branch is main).

// YOUR CODE HERE


// Exercise 11: Build Arg Resolver
// Implement function resolveArgs(instructions: DockerInstruction[], buildArgs: Record<string, string>): DockerInstruction[]
// Replace ${ARG_NAME} in all instruction args with provided values or ARG defaults.

// YOUR CODE HERE


// Exercise 12: Container Health Checker
// Implement class HealthChecker with:
// - register(name: string, check: () => Promise<boolean>, intervalMs: number): void
// - async checkAll(): Promise<Record<string, 'healthy' | 'unhealthy'>>
// - async waitForHealthy(name: string, timeoutMs: number): Promise<boolean>

// YOUR CODE HERE


// ============================================================
console.log("Exercises file loaded successfully.");
