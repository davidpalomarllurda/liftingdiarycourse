# Server Components

## RULE: Always await `params` and `searchParams`

In Next.js 15+, `params` and `searchParams` are **Promises**. You must `await` them before accessing any values. Accessing them synchronously will result in a runtime error.

```tsx
// Correct
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
}

// Wrong — synchronous access
export default function Page({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params // runtime error in Next.js 15
}
```

The same rule applies to `searchParams`:

```tsx
// Correct
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { date } = await searchParams
}
```

## RULE: Pages must be async Server Components when accessing route data

Any page that reads `params` or `searchParams` must be an `async` function so that `await` can be used.

```tsx
// Correct
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  // fetch data, render UI
}

// Wrong — non-async page cannot await params
export default function Page({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params // syntax error
}
```

## Summary

| Concern | Correct approach |
|---|---|
| Accessing `params` | Always `await` — it is a Promise in Next.js 15 |
| Accessing `searchParams` | Always `await` — it is a Promise in Next.js 15 |
| Page function signature | `async` whenever `params` or `searchParams` are used |
