# Forms and Mutations

## Table of Contents
1. [Introduction](#1-introduction)
2. [Server Actions](#2-server-actions)
3. [Form Handling with Server Actions](#3-form-handling)
4. [useFormState](#4-useformstate)
5. [useFormStatus](#5-useformstatus)
6. [Optimistic Updates](#6-optimistic-updates)
7. [Form Validation](#7-form-validation)
8. [Progressive Enhancement](#8-progressive-enhancement)
9. [Revalidation After Mutations](#9-revalidation-after-mutations)
10. [Best Practices](#10-best-practices)

---

## 1. Introduction

Next.js App Router introduces Server Actions as the primary way to handle form submissions and data mutations. They eliminate the need for API routes for most form handling.

```typescript
const formEvolution = {
  traditional: 'Client form → API route → Database → Response',
  serverActions: 'Client form → Server Action (direct) → Database → Revalidate',
  benefit: 'No API route needed, progressive enhancement, type-safe',
};
```

---

## 2. Server Actions

```typescript
// "use server" directive marks a function as a Server Action
// async function createPost(formData: FormData) {
//   "use server";
//   const title = formData.get("title") as string;
//   await db.posts.create({ title });
//   revalidatePath("/posts");
// }

const serverActionRules = {
  directive: '"use server" at top of function or top of file',
  serialization: 'Arguments and return values must be serializable',
  security: 'Always validate input — actions are public HTTP endpoints',
  revalidation: 'Call revalidatePath/revalidateTag after mutations',
};
```

---

## 3. Form Handling

```typescript
// Server Component with form:
// export default function Page() {
//   async function handleSubmit(formData: FormData) {
//     "use server";
//     const name = formData.get("name");
//     await db.users.create({ name });
//   }
//   return <form action={handleSubmit}><input name="name" /><button>Submit</button></form>;
// }

const formPatterns = {
  serverComponent: 'Define action inline or import from separate file',
  clientComponent: 'Import action, use as form action or call directly',
  withValidation: 'Validate in action, return errors via useFormState',
};
```

---

## 4. useFormState

```typescript
// Client-side form state management with Server Actions:
// "use client";
// const [state, formAction] = useFormState(serverAction, initialState);
// return <form action={formAction}>{state.error && <p>{state.error}</p>}</form>;

const useFormStatePattern = {
  purpose: 'Track server action return value (errors, success messages)',
  signature: 'useFormState(action, initialState) → [state, wrappedAction]',
  actionSignature: '(prevState: State, formData: FormData) → Promise<State>',
};
```

---

## 5. useFormStatus

```typescript
// Shows pending state during form submission:
// "use client";
// function SubmitButton() {
//   const { pending } = useFormStatus();
//   return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
// }

const useFormStatusRules = {
  scope: 'Must be used inside a <form> — reads the parent form status',
  returns: '{ pending, data, method, action }',
  note: 'Cannot be in the same component as the form — must be a child',
};
```

---

## 6. Optimistic Updates

```typescript
// useOptimistic shows optimistic state while action processes:
// const [optimisticPosts, addOptimistic] = useOptimistic(posts,
//   (state, newPost) => [...state, { ...newPost, sending: true }]
// );

const optimisticPattern = {
  purpose: 'Instant UI feedback before server confirms',
  flow: ['User submits', 'UI updates immediately (optimistic)', 'Server processes', 'Real data replaces optimistic'],
  rollback: 'If server fails, optimistic state reverts automatically',
};
```

---

## 7. Form Validation

```typescript
const validationLayers = {
  client: 'HTML5 attributes (required, pattern) + JS validation',
  server: 'ALWAYS validate in Server Action (client validation is bypassable)',
  schema: 'Use Zod or similar for type-safe validation',
};
```

---

## 8. Progressive Enhancement

```typescript
const progressiveEnhancement = {
  concept: 'Forms work without JavaScript',
  serverActions: 'Form submits via standard HTTP POST when JS disabled',
  enhancement: 'With JS: no page reload, optimistic updates, pending states',
};
```

---

## 9. Revalidation After Mutations

```typescript
const revalidation = {
  revalidatePath: 'Invalidate cached data for a specific route',
  revalidateTag: 'Invalidate all data fetched with a specific tag',
  redirect: 'Redirect to another page after mutation',
};
```

---

## 10. Best Practices

- Always validate input in Server Actions (they're public endpoints)
- Use useFormState for error feedback
- Use useFormStatus for loading indicators
- Implement optimistic updates for better UX
- Revalidate data after mutations
- Use progressive enhancement for accessibility
- Keep Server Actions focused (single responsibility)

---

## Further Reading

- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Forms](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)
