# UI Coding Standards

## Component Library

**Only shadcn/ui components** may be used for UI in this project. Do not create custom UI components under any circumstances.

- Install components via the shadcn CLI: `npx shadcn@latest add <component>`
- All installed components live in `src/components/ui/`
- Use these components directly — do not wrap them in custom abstractions

If a shadcn component does not exist for a particular use case, compose the needed UI using multiple existing shadcn components rather than building something from scratch.

## Date Formatting

Use **date-fns** for all date formatting. Do not use `Date.toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting method.

Dates must be formatted with an ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2025
4th Jan 2024
```

Use the `do MMM yyyy` format string with `format` from date-fns:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2025"
```
