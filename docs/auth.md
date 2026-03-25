# Authentication

## Provider: Clerk

This app uses **Clerk** for all authentication. Do not introduce any other auth library or custom auth logic.

- Client-side imports come from `@clerk/nextjs`
- Server-side imports come from `@clerk/nextjs/server`

## RULE: Wrap the app in `ClerkProvider`

`ClerkProvider` must remain in the root layout (`src/app/layout.tsx`) wrapping all children. Never remove it or add a second instance.

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
```

## RULE: Protect routes via middleware

Route protection is handled by `clerkMiddleware` in `src/proxy.ts`. Do not add per-route auth guards in page files — the middleware is the single place where protection is enforced.

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

## RULE: Get the current user via `auth()` in Server Components

Use `auth()` from `@clerk/nextjs/server` to retrieve the authenticated user's ID in Server Components and pass it down as needed.

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

- Never read `userId` from request params, cookies, or any client-supplied source.
- Always treat `userId` from `auth()` as the authoritative identity for data scoping (see `data-fetching.md`).

## RULE: Use Clerk UI components for auth UI

Use Clerk's built-in components for all sign-in/sign-up/user UI. Do not build custom auth forms.

| Purpose | Component |
|---|---|
| Sign-in trigger | `<SignInButton mode="modal">` |
| Sign-up trigger | `<SignUpButton mode="modal">` |
| User avatar / account menu | `<UserButton />` |
| Conditional rendering by auth state | `<Show when="signed-in">` / `<Show when="signed-out">` |

```tsx
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal"><button>Sign in</button></SignInButton>
  <SignUpButton mode="modal"><button>Sign up</button></SignUpButton>
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Summary

| Concern | Correct approach |
|---|---|
| Auth provider | Clerk only |
| Root wrapping | `ClerkProvider` in root layout |
| Route protection | `clerkMiddleware` in `src/proxy.ts` |
| Reading current user | `auth()` from `@clerk/nextjs/server` |
| Auth UI | Clerk components (`SignInButton`, `SignUpButton`, `UserButton`, `Show`) |
