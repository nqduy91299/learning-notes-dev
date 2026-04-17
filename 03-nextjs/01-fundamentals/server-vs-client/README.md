# Server Components vs Client Components

## Table of Contents

1. [Introduction](#1-introduction)
2. [Server Components (Default)](#2-server-components-default)
3. [Client Components](#3-client-components)
4. [When to Use Which](#4-when-to-use-which)
5. [The "use client" Boundary](#5-the-use-client-boundary)
6. [Composition Patterns](#6-composition-patterns)
7. [Serialization Boundary](#7-serialization-boundary)
8. [Rendering Behavior](#8-rendering-behavior)
9. [Data Flow Patterns](#9-data-flow-patterns)
10. [Common Mistakes](#10-common-mistakes)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

In the Next.js App Router, **all components are Server Components by default**. This is a
fundamental shift from the Pages Router where everything ran on the client. Server Components
run exclusively on the server and send zero JavaScript to the browser.

```typescript
// Mental model for component types:
const componentTypes = {
  server: {
    directive: 'none (default)',
    runsOn: 'server only',
    jsShipped: 'none',
    canUse: ['async/await', 'database', 'filesystem', 'env secrets'],
    cannotUse: ['useState', 'useEffect', 'onClick', 'browser APIs'],
  },
  client: {
    directive: '"use client"',
    runsOn: 'server (SSR) + client (hydration)',
    jsShipped: 'component code + dependencies',
    canUse: ['useState', 'useEffect', 'onClick', 'browser APIs'],
    cannotUse: ['async component', 'database direct', 'filesystem'],
  },
};
```

---

## 2. Server Components (Default)

### 2.1 What Are Server Components?

Server Components render entirely on the server. Their code never reaches the client.

```typescript
// This is a Server Component (no "use client" directive)
// Conceptual representation:
const ServerComponent = {
  type: 'server',
  canBeAsync: true,
  capabilities: [
    'Direct database queries',
    'File system access',
    'Access environment variables (secrets)',
    'Import server-only modules',
    'Reduced client bundle size',
  ],
  limitations: [
    'No useState or useReducer',
    'No useEffect or useLayoutEffect',
    'No event handlers (onClick, onChange, etc.)',
    'No browser-only APIs (window, document, localStorage)',
    'No custom hooks that use state/effects',
  ],
};
```

### 2.2 Async Server Components

```typescript
// Server Components can be async — a major advantage:
// async function ProductPage({ params }) {
//   const product = await db.products.findOne(params.id);
//   return <div>{product.name}</div>;
// }

// Conceptual representation:
const asyncComponent = {
  type: 'server',
  async: true,
  render: async (params: { id: string }) => {
    // Can await directly — no useEffect needed!
    const data = await fetchData(params.id);
    return { name: data.name, price: data.price };
  },
};

async function fetchData(id: string): Promise<{ name: string; price: number }> {
  return { name: 'Widget', price: 9.99 };
}
```

### 2.3 Server-Only Code

```typescript
// Mark modules as server-only to prevent accidental client import:
// import 'server-only';
// This will throw a build error if imported in a Client Component

const serverOnlyModule = {
  marker: "import 'server-only'",
  purpose: 'Prevent accidental import in Client Components',
  error: 'Build error if imported in a file with "use client"',
};
```

---

## 3. Client Components

### 3.1 The "use client" Directive

```typescript
// Add "use client" at the top of the file:
// "use client";
// import { useState } from 'react';
// export default function Counter() { ... }

const clientComponent = {
  directive: '"use client"',
  placement: 'Top of file, before any imports',
  effect: 'Marks this file AND all its imports as client boundary',
  rendering: 'SSR on server first, then hydrated on client',
};
```

### 3.2 When You Need Client Components

```typescript
const needsClientComponent = [
  'useState, useReducer — state management',
  'useEffect, useLayoutEffect — side effects',
  'onClick, onChange, onSubmit — event handlers',
  'useContext — React context consumers',
  'Custom hooks using state/effects',
  'Browser APIs: window, document, localStorage',
  'Third-party libraries that use hooks/browser APIs',
];
```

### 3.3 Client Component SSR

**Important:** Client Components still render on the server first (SSR).
"Client Component" does not mean "client-only."

```typescript
const clientComponentLifecycle = {
  step1: 'Server renders HTML (SSR)',
  step2: 'HTML sent to browser (fast first paint)',
  step3: 'JavaScript bundle downloaded',
  step4: 'React hydrates — attaches event handlers',
  step5: 'Component is now interactive',
};
```

---

## 4. When to Use Which

### 4.1 Decision Matrix

```typescript
const decisionMatrix = {
  'Fetch data': 'Server Component',
  'Access backend resources directly': 'Server Component',
  'Keep sensitive info on server': 'Server Component',
  'Reduce client-side JavaScript': 'Server Component',
  'Add interactivity (onClick, onChange)': 'Client Component',
  'Use state (useState, useReducer)': 'Client Component',
  'Use lifecycle effects (useEffect)': 'Client Component',
  'Use browser-only APIs': 'Client Component',
  'Use custom hooks with state/effects': 'Client Component',
  'Use React Class Components': 'Client Component',
};
```

### 4.2 The 80/20 Rule

In a typical Next.js app:
- ~80% of components can be Server Components
- ~20% need to be Client Components (interactive bits)

Push "use client" as far down the tree as possible.

---

## 5. The "use client" Boundary

### 5.1 How the Boundary Works

```typescript
// "use client" creates a BOUNDARY in the component tree.
// Everything imported by a Client Component is also client code.

const boundaryRules = {
  rule1: '"use client" marks the entry point into client territory',
  rule2: 'All modules imported by this file become client modules',
  rule3: 'Server Components ABOVE the boundary stay on the server',
  rule4: 'Server Components can be PASSED as children to Client Components',
};

// File: app/page.tsx (Server Component)
//   └── imports ClientWrapper (Client Component — "use client")
//       └── imports ClientHelper — also becomes client code
//       └── receives {children} — children can be Server Components!
```

### 5.2 The Children Pattern

```typescript
// This is the KEY composition pattern:

// ServerPage (Server Component)
//   → renders ClientSidebar (Client Component)
//       → receives children prop
//           → children = ServerContent (Server Component!)

// The Server Component is rendered on the server, then passed
// as serialized React elements to the Client Component.

const childrenPattern = {
  outer: { type: 'server', component: 'ServerPage' },
  middle: { type: 'client', component: 'ClientSidebar', directive: '"use client"' },
  inner: { type: 'server', component: 'ServerContent', passedAs: 'children' },
};
```

---

## 6. Composition Patterns

### 6.1 Pattern: Server Wrapper with Client Island

```typescript
// Server Component fetches data, Client Component handles interaction
const serverWrapperPattern = {
  server: {
    component: 'ProductPage',
    responsibility: 'Fetch product data from DB',
    passes: 'product data as props to client child',
  },
  client: {
    component: 'AddToCartButton',
    directive: '"use client"',
    responsibility: 'Handle click, update cart state',
    receives: 'product data as serializable props',
  },
};
```

### 6.2 Pattern: Extracting Client Logic

```typescript
// BAD: Making entire page client because of one interactive element
const badPattern = {
  file: 'page.tsx',
  directive: '"use client"',  // Makes EVERYTHING client
  problem: 'Entire page ships as JavaScript',
};

// GOOD: Extract interactive part into separate Client Component
const goodPattern = {
  serverFile: 'page.tsx',  // Server Component — no JS shipped
  clientFile: 'SearchBar.tsx',  // "use client" — only this ships
  benefit: 'Minimal JavaScript shipped to client',
};
```

### 6.3 Pattern: Context Providers

```typescript
// Context providers must be Client Components (they use state internally)
// But you can wrap them around Server Component children:

const contextPattern = {
  rootLayout: {
    type: 'server',
    renders: 'ThemeProvider',
  },
  themeProvider: {
    type: 'client',
    directive: '"use client"',
    renders: 'children (which can be Server Components)',
  },
  childPage: {
    type: 'server',
    note: 'Still a Server Component despite being inside a client provider',
  },
};
```

---

## 7. Serialization Boundary

### 7.1 What Can Cross the Boundary?

```typescript
const serializableTypes = {
  allowed: [
    'string, number, boolean, null, undefined',
    'Array, plain Object (with serializable values)',
    'Date (serialized as string)',
    'Map, Set (in newer React versions)',
    'React elements (JSX / the children pattern)',
    'Promises (for use with Suspense)',
    'Server Actions (functions marked with "use server")',
  ],
  notAllowed: [
    'Functions (except Server Actions)',
    'Classes / class instances',
    'Symbols',
    'Circular references',
    'DOM nodes',
    'Event handlers (they are functions)',
  ],
};
```

### 7.2 Common Serialization Errors

```typescript
// ERROR: Passing a function from Server to Client
const serializationError = {
  serverComponent: {
    code: 'Renders <ClientButton onClick={() => doSomething()} />',
    error: 'Functions cannot be passed as props to Client Components',
  },
  fix: 'Use Server Actions or move the logic to the Client Component',
};

// WORKS: Passing data and Server Actions
const serializationSuccess = {
  serverComponent: {
    code: 'Renders <ClientForm action={serverAction} data={plainObject} />',
    works: 'Server Actions and serializable data cross the boundary',
  },
};
```

---

## 8. Rendering Behavior

### 8.1 Server Component Rendering

```typescript
const serverRenderFlow = {
  step1: 'Next.js renders Server Components on the server',
  step2: 'Output: React Server Component Payload (RSC Payload)',
  step3: 'RSC Payload is a compact binary format (not HTML)',
  step4: 'Client receives RSC Payload and renders the tree',
  step5: 'No JavaScript for Server Components is sent to client',
};
```

### 8.2 Client Component Rendering

```typescript
const clientRenderFlow = {
  step1: 'Server renders Client Component HTML (SSR)',
  step2: 'HTML sent to browser for fast first paint',
  step3: 'RSC Payload includes Client Component references',
  step4: 'Client downloads JavaScript bundles for Client Components',
  step5: 'React hydrates — reconciles server HTML with client tree',
  step6: 'Event handlers attached, component becomes interactive',
};
```

### 8.3 Tree Rendering Order

```typescript
// Server Components render first (on server)
// Client Components SSR next (on server)
// HTML sent to client
// Client Components hydrate (on client)

const renderOrder = {
  phase1_server: ['ServerComponentA', 'ServerComponentB'],
  phase2_ssr: ['ClientComponentC', 'ClientComponentD'],
  phase3_html: 'Complete HTML sent to browser',
  phase4_hydrate: ['ClientComponentC', 'ClientComponentD'],
};
```

---

## 9. Data Flow Patterns

### 9.1 Server → Client Data Flow

```typescript
// Fetch on server, pass serializable data to client
const serverToClient = {
  server: {
    fetches: 'data from database',
    passes: 'serializable props to Client Components',
  },
  client: {
    receives: 'props (already loaded, no loading state needed)',
    manages: 'UI state, interactivity',
  },
};
```

### 9.2 Client → Server Data Flow

```typescript
// Client sends data to server via Server Actions or API routes
const clientToServer = {
  option1: 'Server Actions (form submissions, mutations)',
  option2: 'API Routes (fetch from client)',
  option3: 'URL search params (navigation-based)',
};
```

---

## 10. Common Mistakes

### 10.1 Unnecessary "use client"

```typescript
const mistake1 = {
  problem: 'Adding "use client" to a component that doesn\'t need interactivity',
  impact: 'Unnecessary JavaScript shipped to client',
  fix: 'Only add "use client" when you use hooks, events, or browser APIs',
};
```

### 10.2 Importing Server Code in Client Components

```typescript
const mistake2 = {
  problem: 'Importing a module with server-only code in a Client Component',
  impact: 'Build error or runtime error',
  fix: 'Use "server-only" package to guard server modules',
};
```

### 10.3 Passing Non-Serializable Props

```typescript
const mistake3 = {
  problem: 'Passing functions, classes, or complex objects across the boundary',
  impact: 'Serialization error at runtime',
  fix: 'Only pass serializable data, use Server Actions for functions',
};
```

---

## 11. Best Practices

### 11.1 Component Organization

```typescript
const bestPractices = {
  rule1: 'Default to Server Components — only opt into client when needed',
  rule2: 'Push "use client" boundary as far down as possible',
  rule3: 'Extract interactive parts into small Client Components',
  rule4: 'Use the children pattern for Server Components inside Client wrappers',
  rule5: 'Guard server-only modules with import "server-only"',
  rule6: 'Keep Client Components focused — minimal code in client bundle',
};
```

### 11.2 File Organization Convention

```
app/
├── page.tsx              ← Server Component (data fetching)
├── _components/
│   ├── ProductGrid.tsx   ← Server Component (just renders data)
│   ├── SearchBar.tsx     ← Client Component ("use client")
│   └── CartButton.tsx    ← Client Component ("use client")
```

### 11.3 Performance Tips

- Avoid wrapping large subtrees in "use client"
- Colocate data fetching with the component that uses it
- Use React.lazy() for heavy Client Components
- Profile your bundle to find unexpected client code

---

## Further Reading

- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
