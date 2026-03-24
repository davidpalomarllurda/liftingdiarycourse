# Data Fetching

## RULE: Server Components Only

All data fetching in this app **must** be done via React Server Components.

**Never** fetch data via:
- Route handlers (`app/api/`)
- Client components (`"use client"`)
- Third-party data-fetching libraries (SWR, React Query, etc.)
- `useEffect` + `fetch`

If you need data in a client component, fetch it in a parent Server Component and pass it down as props.

## RULE: Drizzle ORM via `/data` helpers

Database queries **must** go through helper functions in the `/data` directory. These helpers use Drizzle ORM exclusively.

**Never** write raw SQL strings. Use the Drizzle query builder.

```ts
// Correct
import { getWorkoutsByUser } from "@/data/workouts";

// Wrong — raw SQL
db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);

// Wrong — query outside /data
const workouts = await db.select().from(workoutsTable).where(...); // in a page/component
```

## RULE: Users can only access their own data

Every `/data` helper that queries user-owned data **must** filter by the authenticated user's ID. Never return rows without scoping to the current user.

```ts
// Correct — always scope to userId
export async function getWorkoutsByUser(userId: string) {
  return db
    .select()
    .from(workoutsTable)
    .where(eq(workoutsTable.userId, userId));
}

// Wrong — unscoped query
export async function getAllWorkouts() {
  return db.select().from(workoutsTable); // leaks other users' data
}
```

The caller (Server Component) is responsible for obtaining `userId` from the authenticated session (e.g. via Clerk's `auth()`) and passing it to the helper. The helper must not trust any user-supplied ID that arrives from outside the session.

## Summary

| Concern | Correct approach |
|---|---|
| Where to fetch data | Server Components only |
| How to query the DB | Drizzle ORM helpers in `/data` |
| Raw SQL | Never |
| Data scoping | Always filter by authenticated `userId` |
