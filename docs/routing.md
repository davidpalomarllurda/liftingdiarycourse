# Routing

## RULE: All app routes live under `/dashboard`

Every page in this application must be nested under the `/dashboard` path. There are no top-level routes other than the root landing page.

```
src/app/
  page.tsx                          # landing / marketing page
  dashboard/
    page.tsx                        # main dashboard
    workout/
      new/
        page.tsx                    # create workout
      [workoutId]/
        page.tsx                    # edit workout
```

## RULE: All `/dashboard` routes are protected

Every route under `/dashboard` must be accessible only to authenticated users. Unauthenticated users must be redirected to sign-in.

## RULE: Route protection is handled by the Next.js proxy (middleware)

Use the `proxy.ts` file (Next.js 15/16's renamed middleware) as the single place to enforce authentication on `/dashboard` routes. Do not add per-page auth guards in `page.tsx` files for the purpose of route protection.

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

## Summary

| Concern | Correct approach |
|---|---|
| Where app pages live | Under `/dashboard` |
| Who can access `/dashboard` routes | Authenticated users only |
| Where to enforce auth | `proxy.ts` (Next.js middleware) — not in individual pages |
