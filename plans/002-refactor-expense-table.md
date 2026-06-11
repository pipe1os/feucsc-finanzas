# Plan 002: Refactor `ExpenseTable` into composable UI components

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat b9c20dc..HEAD -- src/components/public/ExpenseTable.tsx`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `b9c20dc`, 2026-06-10

## Why this matters

The `ExpenseTable.tsx` component is 884 lines long. It duplicates presentation logic (a HeroUI `<Table>` for desktop, and a `<ListBox>` for mobile), houses a massive filter bar, manages its own complex multi-page pagination logic, and embeds an image lightbox. Splitting this into focused sub-components improves rendering performance and creates a more readable UI architecture for the public-facing dashboard.

## Current state

- `src/components/public/ExpenseTable.tsx` — Monolithic UI component taking raw transactions and handling all filtering, sorting, pagination, and dual-view rendering.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `pnpm install`           | exit 0              |
| Typecheck | `pnpm tsc --noEmit`      | exit 0, no errors   |
| Lint      | `pnpm lint`              | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/components/public/ExpenseTable.tsx`
- `src/components/public/ExpenseTableFilters.tsx` (create)
- `src/components/public/ExpenseTableDesktop.tsx` (create)
- `src/components/public/ExpenseTableMobile.tsx` (create)

**Out of scope**:
- Data fetching logic in `src/app/page.tsx`
- `src/components/public/KPICards.tsx` or `LatestTransactionsPreview.tsx`

## Git workflow

- Branch: `advisor/002-refactor-expense-table`
- Commit per step or per logical unit; message style: `refactor(public): extract ExpenseTable components`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract `ExpenseTableFilters`

Create `src/components/public/ExpenseTableFilters.tsx`. Move the search input and `<Select>` dropdowns for month/category. Pass the filter state via props from `ExpenseTable`.

**Verify**: `pnpm tsc --noEmit` → exit 0, no errors

### Step 2: Extract `ExpenseTableMobile`

Create `src/components/public/ExpenseTableMobile.tsx`. Move the HeroUI `<ListBox>` implementation that renders the mobile-friendly card view of expenses. Accept the paginated items array as a prop.

**Verify**: `pnpm tsc --noEmit` → exit 0, no errors

### Step 3: Extract `ExpenseTableDesktop`

Create `src/components/public/ExpenseTableDesktop.tsx`. Move the HeroUI `<Table>` implementation that renders the desktop-friendly grid view of expenses. Accept the paginated items array and sorting state as props.

**Verify**: `pnpm tsc --noEmit` → exit 0, no errors

### Step 4: Re-compose `ExpenseTable.tsx`

Update `src/components/public/ExpenseTable.tsx` to act strictly as the container component. It should house the local state (pagination, sorting, filtering derived state) and render `<ExpenseTableFilters>`, `<ExpenseTableMobile>`, and `<ExpenseTableDesktop>`. Keep the pagination controls in the parent or extract them into an inline functional component.

**Verify**: `pnpm lint` → exit 0, no errors

## Test plan

- Manual verification is required to ensure filters and pagination still control the displayed data in both views.
- Verification: `pnpm tsc --noEmit` → all pass.

## Done criteria

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `src/components/public/ExpenseTable.tsx` is reduced to primarily state management and container layout.
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Complex state coupling makes it impossible to pass props down without a massive prop-drilling chain.
- A step's verification fails twice after a reasonable fix attempt.

## Maintenance notes

- Future columns added to the data should be reflected in both `ExpenseTableDesktop.tsx` and `ExpenseTableMobile.tsx`.
