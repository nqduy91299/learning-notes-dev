# Learning Notes

A structured monorepo for learning web development from fundamentals to advanced topics.

## Roadmap

| # | Topic | Chapters | Status |
|---|-------|----------|--------|
| 01 | [JavaScript](./01-javascript/) | Fundamentals, Objects & Arrays, Async, Advanced, DOM & Events | Not Started |
| 02 | [TypeScript](./02-typescript/) | Basics, Intermediate, Advanced, Practical | Not Started |
| 03 | [Next.js](./03-nextjs/) | Fundamentals, Intermediate, Advanced, Deployment | Not Started |
| 04 | [SEO with Next.js](./04-seo-nextjs/) | SEO Fundamentals, Technical SEO, Advanced SEO | Not Started |
| 05 | [Design Patterns](./05-design-patterns/) | Creational, Structural, Behavioral, Real-World | Not Started |
| 06 | [DSA](./06-dsa/) | Complexity, Data Structures, Algorithms | Not Started |
| 07 | [LeetCode](./07-leetcode/) | Easy, Medium, Hard | Not Started |

## Suggested Learning Order

```
01-javascript --> 02-typescript --> 03-nextjs --> 04-seo-nextjs
                                       ^
                    05-design-patterns -+  (can start in parallel)
                    06-dsa ---------------  (can start anytime)
                    07-leetcode ----------  (practice alongside 06-dsa)
```

## How to Use

### Run an exercise

```bash
npx tsx 01-javascript/01-fundamentals/01-variables/exercises.ts
```

### Run a Next.js mini-app

```bash
cd 03-nextjs/01-fundamentals/app-router-basics
npm install
npm run dev
```

## Exercise Pattern

Each topic folder follows this structure:

```
topic-name/
  README.md        # Theory, key concepts, gotchas
  exercises.ts     # Problems with empty function signatures
  solutions.ts     # Complete solutions with explanations
```

## Tech Stack

- **Language:** TypeScript
- **Runner:** tsx (run .ts files directly)
- **Framework:** Next.js 15 (for Next.js and SEO chapters)
- **Node.js:** >= 20
