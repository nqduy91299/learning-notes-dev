# Server Actions (Advanced)

## Table of Contents
1. [Introduction](#1-introduction)
2. ['use server' Directive](#2-use-server-directive)
3. [Form Actions](#3-form-actions)
4. [Calling from Client Components](#4-calling-from-client)
5. [Revalidation](#5-revalidation)
6. [Error Handling](#6-error-handling)
7. [Optimistic Updates](#7-optimistic-updates)
8. [Security](#8-security)
9. [Input Validation](#9-input-validation)
10. [Authorization](#10-authorization)
11. [Best Practices](#11-best-practices)

---

## 1. Introduction

Server Actions are async functions executed on the server, callable from Client Components. They provide a secure, type-safe way to perform mutations without API routes.

```typescript
const serverActions = {
  what: 'Async functions that run on the server',
  directive: '"use server" at top of function or file',
  callable: 'From <form action>, onClick, useEffect, etc.',
  security: 'Encrypted action IDs, input always untrusted',
  revalidation: 'Trigger cache revalidation after mutations',
};
```

---

## 2. 'use server' Directive

```typescript
// Option 1: Inline in Server Component
// async function createPost(formData: FormData) {
//   "use server";
//   await db.posts.create({ title: formData.get("title") });
// }

// Option 2: Separate file (recommended for reuse)
// "use server";  // Top of file — ALL exports become Server Actions
// export async function createPost(data) { ... }
// export async function deletePost(id) { ... }
```

---

## 3-10. [Detailed sections on forms, revalidation, error handling, security, validation, authorization]

Server Actions are public HTTP endpoints — always validate input and check authorization.

```typescript
const securityRules = {
  rule1: 'Always validate input (Server Actions are public endpoints)',
  rule2: 'Always check authorization (who is calling this action?)',
  rule3: 'Use Zod or similar for schema validation',
  rule4: 'Never trust FormData — sanitize everything',
  rule5: 'Rate limit actions to prevent abuse',
  rule6: 'Actions get encrypted IDs but code is still exposed',
};
```

---

## 11. Best Practices

- Keep actions focused (single responsibility)
- Always validate input with a schema (Zod)
- Always verify authorization
- Use revalidatePath/revalidateTag after mutations
- Return structured error/success states
- Use useFormState for form error feedback
- Implement optimistic updates for better UX

---

## Further Reading

- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
