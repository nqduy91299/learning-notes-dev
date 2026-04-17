# Docker Basics for CI/CD

## Table of Contents
1. [Introduction](#introduction)
2. [Docker Concepts](#docker-concepts)
3. [Dockerfile Instructions](#dockerfile-instructions)
4. [Images and Containers](#images-and-containers)
5. [Layers and Caching](#layers-and-caching)
6. [Multi-Stage Builds](#multi-stage-builds)
7. [.dockerignore](#dockerignore)
8. [Docker Compose Basics](#docker-compose-basics)
9. [Docker in CI/CD](#docker-in-cicd)
10. [Image Optimization](#image-optimization)
11. [Security Best Practices](#security-best-practices)
12. [Common Patterns](#common-patterns)

---

## Introduction

Docker packages applications and their dependencies into **containers** — lightweight, portable, and reproducible environments. In CI/CD, Docker ensures that builds and tests run in consistent environments regardless of the host machine.

```
Dockerfile → Build → Image → Run → Container
```

---

## Docker Concepts

| Concept    | Description                                          |
|-----------|------------------------------------------------------|
| Image     | Read-only template with OS, runtime, app code        |
| Container | Running instance of an image                         |
| Dockerfile| Text file with instructions to build an image        |
| Registry  | Storage for images (Docker Hub, GitHub CR, ECR)      |
| Layer     | Each Dockerfile instruction creates a cached layer   |
| Volume    | Persistent storage mounted into containers           |
| Network   | Virtual network for container communication          |

---

## Dockerfile Instructions

### FROM — Base Image

```dockerfile
FROM node:20-alpine        # Use specific version + slim variant
FROM node:20-alpine AS builder  # Named stage for multi-stage
```

### RUN — Execute Commands

```dockerfile
RUN npm ci                 # Install dependencies
RUN apt-get update && apt-get install -y curl  # Install system packages
```

### COPY / ADD — Copy Files

```dockerfile
COPY package*.json ./      # Copy specific files
COPY . .                   # Copy everything
# ADD can extract archives and fetch URLs (prefer COPY)
```

### WORKDIR — Set Working Directory

```dockerfile
WORKDIR /app               # All subsequent commands run here
```

### CMD / ENTRYPOINT — Default Command

```dockerfile
CMD ["node", "server.js"]           # Default, can be overridden
ENTRYPOINT ["node", "server.js"]    # Always runs, args appended
```

### ENV — Environment Variables

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

### EXPOSE — Document Ports

```dockerfile
EXPOSE 3000                # Documentation only, doesn't publish
```

### ARG — Build Arguments

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine
```

### Complete Dockerfile Example

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## Images and Containers

### Image Naming
```
registry/repository:tag
docker.io/library/node:20-alpine
ghcr.io/myorg/myapp:v1.2.3
```

### Common Commands
```bash
docker build -t myapp:latest .     # Build image
docker run -p 3000:3000 myapp      # Run container
docker ps                          # List running containers
docker images                      # List images
docker push myapp:latest           # Push to registry
docker pull node:20-alpine         # Pull from registry
```

---

## Layers and Caching

Each Dockerfile instruction creates a **layer**. Docker caches layers and reuses them if the instruction and context haven't changed.

### Layer Cache Rules
1. If the instruction is the same AND input files haven't changed → use cache
2. If any layer is invalidated, all subsequent layers are rebuilt
3. Order matters: put rarely-changing instructions first

### Optimal Layer Ordering
```dockerfile
FROM node:20-alpine
WORKDIR /app

# Layer 1: Dependencies (changes rarely)
COPY package*.json ./
RUN npm ci

# Layer 2: Source code (changes often)
COPY . .
RUN npm run build
```

If only source code changes, `npm ci` layer is cached.

### Cache Busting
```dockerfile
# Bad: invalidates cache even when deps haven't changed
COPY . .
RUN npm ci

# Good: deps cached separately
COPY package*.json ./
RUN npm ci
COPY . .
```

---

## Multi-Stage Builds

Use multiple `FROM` statements to create smaller production images.

```dockerfile
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (only the built output)
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Benefits
- Final image doesn't include build tools, devDependencies
- Smaller image size (100MB vs 1GB+)
- Reduced attack surface

---

## .dockerignore

Exclude files from the build context (like `.gitignore`).

```
node_modules
.git
.env
dist
*.md
.github
coverage
.next
```

### Why It Matters
- Speeds up `docker build` (smaller context sent to daemon)
- Prevents secrets from being copied into the image
- Avoids cache invalidation from irrelevant file changes

---

## Docker Compose Basics

Define multi-container applications.

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
    depends_on:
      - db
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  pgdata:
```

### Commands
```bash
docker compose up -d          # Start all services
docker compose down           # Stop and remove
docker compose logs app       # View logs
docker compose build          # Rebuild images
```

---

## Docker in CI/CD

### Building and Pushing Images
```yaml
# GitHub Actions example
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: ghcr.io/myorg/myapp:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Using Docker in Tests
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: test
    ports:
      - 5432:5432
```

---

## Image Optimization

| Technique              | Impact                    |
|-----------------------|---------------------------|
| Alpine base images    | ~5MB vs ~1GB for full OS  |
| Multi-stage builds    | Remove build artifacts    |
| `.dockerignore`       | Smaller build context     |
| Combine RUN commands  | Fewer layers              |
| Use `--no-cache`      | Prevent stale packages    |
| Pin versions          | Reproducible builds       |

---

## Security Best Practices

1. **Don't run as root** — Use `USER node`
2. **Pin base image versions** — `node:20.10.0-alpine`, not `node:latest`
3. **Scan for vulnerabilities** — `docker scout`, Snyk, Trivy
4. **Don't store secrets in images** — Use runtime env vars
5. **Use multi-stage builds** — Minimize attack surface
6. **Keep images small** — Fewer packages = fewer vulnerabilities
7. **Use read-only filesystem** — `docker run --read-only`

---

## Common Patterns

### Node.js Production
```dockerfile
FROM node:20-alpine
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Development with Hot Reload
```yaml
# docker-compose.dev.yml
services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

---

## Key Takeaways

- Dockerfiles define how to build images layer by layer
- Layer ordering matters for cache efficiency: deps before source
- Multi-stage builds create small, production-ready images
- `.dockerignore` prevents unnecessary files in the build context
- Docker Compose orchestrates multi-container applications
- In CI/CD, Docker ensures consistent build environments
- Security: don't run as root, pin versions, scan for vulnerabilities
