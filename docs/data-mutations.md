# Data Mutations

## RULE: Mutations via `/data` helpers only

All database mutations (insert, update, delete) **must** go through helper functions in the `/data` directory. These helpers use Drizzle ORM exclusively.

**Never** write mutation logic directly in Server Actions, Server Components, or anywhere outside `/data`.

```ts
// Correct
import { createWorkout } from "@/data/workouts";

// Wrong — mutation outside /data
await db.insert(workouts).values({ userId, startedAt: new Date() }); // in an action/component
```

## RULE: Never use raw SQL

Use the Drizzle query builder for all mutations. Never pass raw SQL strings.

```ts
// Correct
await db.insert(workouts).values({ userId, startedAt: new Date() });

// Wrong
await db.execute(sql`INSERT INTO workouts (user_id) VALUES (${userId})`);
```

## RULE: Users can only mutate their own data

Every `/data` helper that mutates user-owned data **must** scope the operation to the authenticated user's ID. For updates and deletes, always include a `userId` filter in the `where` clause so one user cannot modify another user's rows.

```ts
// Correct — scoped delete
export async function deleteWorkout(userId: string, workoutId: number) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}

// Wrong — unscoped delete
export async function deleteWorkout(workoutId: number) {
  await db.delete(workouts).where(eq(workouts.id, workoutId)); // any user's row
}
```

The caller is responsible for obtaining `userId` from the authenticated session (e.g. via Clerk's `auth()`) and passing it to the helper. The helper must not trust any user-supplied ID that arrives from client input.

## RULE: Mutations are called from Server Actions in colocated `actions.ts` files

Mutation helpers **must** be invoked from [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations). Server Actions **must** live in a file named `actions.ts` colocated with the route segment they serve, and marked with `"use server"` at the top.

**Never** call mutation helpers from client components, route handlers, or `useEffect`.

```ts
// src/app/dashboard/workouts/actions.ts  <-- always named actions.ts, colocated with the route
"use server";

import { auth } from "@clerk/nextjs/server";
import { createWorkout } from "@/data/workouts";

export async function createWorkoutAction(name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return createWorkout(userId, name);
}
```

```
src/app/
  dashboard/
    workouts/
      page.tsx
      actions.ts   <-- Server Actions for this route segment
```

## RULE: Server Action parameters must be typed and validated with Zod

Server Action parameters **must** be explicitly typed. Never use `FormData` as a parameter type — extract and validate values before passing them to an action.

All Server Actions **must** validate their arguments with a Zod schema before doing anything else. Throw or return early if validation fails.

```ts
// Correct
import { z } from "zod";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  startedAt: z.date(),
});

export async function createWorkoutAction(input: {
  name: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = CreateWorkoutSchema.parse(input);
  return createWorkout(userId, parsed.name, parsed.startedAt);
}

// Wrong — untyped FormData parameter
export async function createWorkoutAction(formData: FormData) { ... }

// Wrong — no validation
export async function createWorkoutAction(name: string) {
  return createWorkout(userId, name); // name is untrusted
}
```

## RULE: Return the mutated row(s)

Helpers should return the inserted or updated row(s) using Drizzle's `.returning()` so callers have the canonical DB state without a second round-trip.

```ts
export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt: new Date() })
    .returning();
  return workout;
}
```

## RULE: Never redirect inside Server Actions

Do not call `redirect()` from `next/navigation` inside a Server Action. Redirects must be handled client-side after the Server Action resolves.

```ts
// Wrong — redirect inside a Server Action
export async function createWorkoutAction(input: { name: string; startedAt: Date }) {
  // ...
  await createWorkout(userId, input.name, input.startedAt);
  redirect("/dashboard"); // ❌
}

// Correct — Server Action returns, client handles navigation
export async function createWorkoutAction(input: { name: string; startedAt: Date }) {
  // ...
  return createWorkout(userId, input.name, input.startedAt);
}
```

```tsx
// Correct — client component navigates after the action resolves
startTransition(async () => {
  await createWorkoutAction(input);
  router.push("/dashboard"); // ✅
});
```

## Summary

| Concern | Correct approach |
|---|---|
| Where to write mutation logic | `/data` helpers only |
| How to write mutations | Drizzle ORM query builder |
| Raw SQL | Never |
| Data scoping | Always filter updates/deletes by authenticated `userId` |
| Where to call mutation helpers | Server Actions in a colocated `actions.ts` file |
| Server Action parameter types | Explicit TypeScript types only — never `FormData` |
| Server Action validation | Always validate with Zod before any other logic |
| Return value | Use `.returning()` to return mutated row(s) |
| Redirects | Never use `redirect()` in Server Actions — navigate client-side after the action resolves |
