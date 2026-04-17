# Technical Debt & Refactoring

## Table of Contents

- [What Is Technical Debt](#what-is-technical-debt)
- [Martin Fowler's Technical Debt Quadrant](#martin-fowlers-technical-debt-quadrant)
- [Types of Technical Debt](#types-of-technical-debt)
- [Measuring Technical Debt](#measuring-technical-debt)
- [When to Refactor](#when-to-refactor)
- [Refactoring Techniques](#refactoring-techniques)
- [Safe Refactoring](#safe-refactoring)
- [Migration Strategies](#migration-strategies)
- [Managing Technical Debt](#managing-technical-debt)
- [Dependency Management](#dependency-management)

---

## What Is Technical Debt

Technical debt is the implied cost of future rework caused by choosing an expedient
solution now instead of a better approach that would take longer.

Like financial debt, technical debt has **principal** (the shortcut itself) and
**interest** (the ongoing cost of working around it). Some debt is strategic —
deliberately taken to ship faster. Other debt is accidental — the result of
inexperience or changing requirements.

### Intentional vs Unintentional

**Intentional debt**: "We know this API design isn't ideal, but we need to launch by
Friday. We'll redesign it next sprint." This is a conscious trade-off with a repayment
plan.

**Unintentional debt**: "We didn't realize our state management approach would become
unmaintainable at this scale." This is discovered after the fact.

The key difference: intentional debt should be **tracked and planned for**. Unintentional
debt should be **identified and prevented** through code reviews and learning.

---

## Martin Fowler's Technical Debt Quadrant

Martin Fowler categorized technical debt along two axes:

```
              Deliberate              Inadvertent
         ┌──────────────────┬──────────────────┐
Reckless │ "We don't have   │ "What's          │
         │  time for design"│  layered arch?"   │
         ├──────────────────┼──────────────────┤
Prudent  │ "Ship now, deal  │ "Now we know how │
         │  with it later"  │  we should have  │
         │                  │  done it"         │
         └──────────────────┴──────────────────┘
```

### Reckless + Deliberate

The team knows they're cutting corners and doesn't care. "We don't have time for
tests." This is the most dangerous — it's a choice to take on debt with no plan to
repay it.

### Reckless + Inadvertent

The team doesn't know enough to realize they're creating debt. A junior team building
without code review or design patterns. Fix this with education, mentoring, and reviews.

### Prudent + Deliberate

A conscious decision: "We'll use a simpler architecture now and refactor when we
understand the domain better." This is acceptable if tracked.

### Prudent + Inadvertent

"Now that we've built the feature, we understand the domain well enough to see how
it should have been designed." This is natural — you learn by building. Refactor as
you discover better approaches.

---

## Types of Technical Debt

### Code Debt

- Duplicated logic across modules
- Long functions with multiple responsibilities
- Poor naming that obscures intent
- Missing type safety (using `any` in TypeScript)
- Deeply nested conditionals

### Architecture Debt

- Monolithic frontend that should be modular
- Tightly coupled components that can't be tested in isolation
- Missing API layer (components directly calling fetch)
- No clear data flow pattern (state scattered everywhere)

### Test Debt

- Missing tests for critical business logic
- Flaky tests that get skipped
- Tests that test implementation rather than behavior
- No integration or E2E tests

### Documentation Debt

- Undocumented API contracts
- Missing onboarding documentation
- Stale README files
- No architecture decision records (ADRs)

### Dependency Debt

- Outdated packages with known vulnerabilities
- Major version upgrades deferred for years
- Abandoned dependencies with no maintained alternative
- Incompatible dependency versions (peer dependency warnings)

---

## Measuring Technical Debt

You can't manage what you can't measure. Use these signals:

### Code Complexity

**Cyclomatic complexity** counts the number of independent paths through a function.
Higher complexity = harder to test and maintain.

```
Complexity  | Meaning
1-5         | Simple, easy to test
6-10        | Moderate, needs attention
11-20       | Complex, should refactor
21+         | Untestable, refactor immediately
```

### Other Metrics

- **Test coverage**: Not a quality metric by itself, but trending downward is a warning
- **Lint warnings**: Increasing warnings indicate declining standards
- **Dependency age**: How many major versions behind are your deps?
- **Build time**: Increasing build times suggest architecture issues
- **Bundle size**: Growing bundles indicate missing code splitting
- **Time to fix bugs**: If simple bugs take days, you have architectural debt

---

## When to Refactor

### The Boy Scout Rule

> Always leave the code cleaner than you found it.

When you touch a file, make one small improvement — rename a variable, extract a
function, add a missing type. Over time, the codebase improves naturally.

### Before Adding Features

If the area you're about to modify is messy, clean it up first. Adding features on
top of debt accelerates the interest payments.

### When It Blocks Progress

If the team regularly says "this would be easy if we hadn't done X," it's time to
address X. Debt that actively slows development has the highest ROI to fix.

### When NOT to Refactor

- Code that works and nobody touches — leave it alone
- Right before a major deadline — you'll introduce bugs under pressure
- Without tests — you need a safety net before changing behavior
- When you want to but nobody asked — refactoring for its own sake is a smell

---

## Refactoring Techniques

### Extract Function

Pull a chunk of logic into a named function. The name becomes documentation.

```typescript
// BEFORE
function processOrder(order: Order): void {
  // validate
  if (!order.items.length) throw new Error("Empty");
  if (!order.customer) throw new Error("No customer");

  // calculate
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.qty;
  }

  // apply discount
  if (total > 100) total *= 0.9;

  console.log(`Total: ${total}`);
}

// AFTER
function validateOrder(order: Order): void {
  if (!order.items.length) throw new Error("Empty");
  if (!order.customer) throw new Error("No customer");
}

function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function applyDiscount(total: number, threshold: number): number {
  return total > threshold ? total * 0.9 : total;
}
```

### Extract Class

When a class has too many responsibilities, split it.

### Rename

The cheapest and most impactful refactoring. When you understand what code does better
than its name suggests, rename it.

### Inline

The opposite of extract — when an abstraction adds complexity without value, inline it
back. Not every function needs to exist.

### Replace Conditional with Polymorphism

Replace switch/if chains with objects that implement a common interface (see Clean Code
chapter, Exercise 16).

### Introduce Parameter Object

When multiple functions take the same group of parameters, bundle them into an object.

```typescript
// BEFORE
function between(date: Date, start: Date, end: Date): boolean { ... }
function overlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean { ... }

// AFTER
interface DateRange { start: Date; end: Date; }
function between(date: Date, range: DateRange): boolean { ... }
function overlap(range1: DateRange, range2: DateRange): boolean { ... }
```

---

## Safe Refactoring

### Tests First

Never refactor without tests. If the code doesn't have tests, write characterization
tests first — tests that capture the current behavior, even if that behavior is buggy.

### Small Steps

Make one change at a time. Run tests after each change. If something breaks, you know
exactly which change caused it.

### CI Verification

- Every refactoring commit should pass CI
- Use feature branches for large refactors
- Get code reviews — a second pair of eyes catches subtle behavior changes
- Run the full test suite, not just the tests for the changed module

### The Mikado Method

For large refactorings:
1. Try the change you want to make
2. If it breaks, note what broke
3. Revert your change
4. Fix the prerequisites first
5. Repeat until the original change works

---

## Migration Strategies

### Strangler Fig Pattern

Named after strangler fig trees that grow around existing trees and eventually replace
them. Gradually replace old system components with new ones while keeping the system
running.

```
Phase 1: New system handles 0% of traffic
   [Old System] ← 100% traffic

Phase 2: Route some features to new system
   [Router] → [Old System]  (80%)
           → [New System]   (20%)

Phase 3: Gradually shift traffic
   [Router] → [Old System]  (20%)
           → [New System]   (80%)

Phase 4: Old system decommissioned
   [New System] ← 100% traffic
```

### Feature Flags

Deploy new code behind feature flags. Test it in production with a small percentage
of users. Roll back instantly if issues arise.

```typescript
function getCheckoutComponent(): ComponentType {
  if (featureFlags.isEnabled("new-checkout")) {
    return NewCheckout;
  }
  return LegacyCheckout;
}
```

### Parallel Running

Run both old and new implementations simultaneously. Compare outputs. Only switch over
when the new implementation matches the old one consistently.

This is expensive but safe — ideal for critical financial or data processing systems.

---

## Managing Technical Debt

### Tracking

- Maintain a tech debt backlog (separate from feature backlog)
- Tag debt items by type (code, architecture, test, dependency)
- Estimate the "interest" — how much time does this debt cost per sprint?

### Prioritizing

Prioritize debt that:
1. Blocks new feature development
2. Causes production incidents
3. Slows the team measurably
4. Has compounding interest (gets worse over time)

Don't prioritize debt that:
- Is in stable, rarely-touched code
- Has low interest (not getting worse)
- Would require a large investment for small return

### Communicating to Stakeholders

Non-technical stakeholders don't care about "clean code." Frame debt in business terms:

- "This will reduce our deployment time from 45 minutes to 10 minutes"
- "New features in the checkout flow currently take 3x longer due to technical debt"
- "We have 12 known security vulnerabilities in outdated dependencies"

### Sprint Allocation

A common approach: allocate 15-20% of each sprint to tech debt. This prevents debt
from accumulating while keeping feature velocity high.

Some teams use "tech debt sprints" — a full sprint dedicated to debt every 6-8 weeks.
This works for larger refactorings but can feel like "wasted" time to stakeholders.

---

## Dependency Management

### Keeping Dependencies Updated

Outdated dependencies are a form of technical debt. They accumulate:
- Security vulnerabilities
- Incompatibilities with newer tooling
- Larger eventual upgrade effort

### Tools

- **Dependabot / Renovate**: Automated PRs for dependency updates
- **npm audit**: Check for known vulnerabilities
- **npm outdated**: See which packages have newer versions

### Dealing with Breaking Changes

- Read changelogs before upgrading major versions
- Run the full test suite after upgrading
- Upgrade one major dependency at a time
- Use codemods when available (e.g., React's codemod scripts)

### Lockfiles

Always commit your lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`).
Lockfiles ensure every developer and CI machine uses the exact same dependency versions.

Without a lockfile:
- `npm install` on Monday might give you lodash@4.17.20
- `npm install` on Friday might give you lodash@4.17.21
- If that patch has a bug, builds break inconsistently

### Evaluating New Dependencies

Before adding a dependency, check:
- **Maintenance**: When was the last commit? Are issues responded to?
- **Size**: What does it add to your bundle? (`bundlephobia.com`)
- **Alternatives**: Can you write it yourself in < 50 lines?
- **License**: Is it compatible with your project's license?
- **Downloads**: Is it widely used and battle-tested?

---

## Summary

- Technical debt is a strategic trade-off — manage it like financial debt
- Use Fowler's quadrant to categorize and address debt appropriately
- Measure debt with concrete metrics: complexity, coverage, dependency age
- Refactor when debt blocks progress, not for its own sake
- Always refactor with tests, small steps, and CI verification
- Use strangler fig pattern and feature flags for safe migrations
- Track, prioritize, and communicate debt in business terms
- Keep dependencies updated — automated tools make this sustainable
- Allocate consistent time for debt repayment — 15-20% per sprint
