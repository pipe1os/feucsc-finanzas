# Plan 001: Refactor `AdminPage` to eliminate God Component anti-pattern

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving to the next step. If anything in the "STOP conditions" section occurs, stop and report — do not improvise. When done, update the status row for this plan in `plans/README.md` — unless a reviewer dispatched you and told you they maintain the index.
>
> **Drift check (run first)**: `git diff --stat b9c20dc..HEAD -- src/app/admin/page.tsx`
> If any in-scope file changed since this plan was written, compare the "Current state" excerpts against the live code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `b9c20dc`, 2026-06-10

## Why this matters

The `src/app/admin/page.tsx` file is a massive "God Component" spanning roughly 1000 lines of code. It manages fetching, complex client-side state, layout (sidebar), modal dialogues for CRUD operations, and table rendering all in one monolithic block. Extracting this into smaller, cohesive components will significantly reduce cognitive load, improve rendering performance by scoping state updates, and make the codebase vastly easier to maintain for future developers.

## Current state

- `src/app/admin/page.tsx` — Main admin dashboard UI. Manages `useGastos` state, modals, filtering logic, and renders `AdminDesktopTable` and mobile views.

The repo uses HeroUI v3 and Tailwind v4. UI components should live in `src/components/admin/`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `pnpm install`           | exit 0              |
| Typecheck | `pnpm tsc --noEmit`      | exit 0, no errors   |
| Lint      | `pnpm lint`              | exit 0              |

## Scope

**In scope** (the only files you should modify):
- `src/app/admin/page.tsx`
- `src/components/admin/AdminSidebar.tsx` (create)
- `src/components/admin/AdminFilters.tsx` (create)
- `src/components/admin/AdminModals.tsx` (create)

**Out of scope**:
- `src/app/actions/gastos.ts`
- `src/components/admin/AdminDesktopTable.tsx`
- Any change to the Supabase data fetching layer or `useGastos` hook.

## Git workflow

- Branch: `advisor/001-refactor-admin-page`
- Commit per step or per logical unit; message style: `refactor(admin): extract AdminSidebar component`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extract `AdminSidebar`

Create `src/components/admin/AdminSidebar.tsx`. Move the `<aside>` markup from `src/app/admin/page.tsx` into this new file. Accept any necessary props (e.g., active section state, handlers for navigation).

**Verify**: `pnpm tsc --noEmit` → exit 0, no errors

### Step 2: Extract `AdminFilters`

Create `src/components/admin/AdminFilters.tsx`. Move the filtering UI (month selection, category selection, search input) and its immediate local state handling from `src/app/admin/page.tsx` into this new file. Pass the filter values up to the parent `page.tsx` via callback props.

**Verify**: `pnpm tsc --noEmit` → exit 0, no errors

### Step 3: Extract `AdminModals`

Create `src/components/admin/AdminModals.tsx`. Move the modal components (`<Modal>` blocks for GastoForm, Delete confirmation, Image viewer) out of the main render function in `page.tsx`. Pass the required state (e.g., `isAddModalOpen`, `selectedGasto`) and handlers (e.g., `onClose`, `onSuccess`) as props.

**Verify**: `pnpm tsc --noEmit` → exit 0, no errors

### Step 4: Refactor `page.tsx` to consume the new components

Clean up `src/app/admin/page.tsx` so that its render function is a clean composition of `<AdminSidebar>`, `<AdminFilters>`, `<AdminDesktopTable>` (existing), and `<AdminModals>`. Verify that all states are wired up correctly.

**Verify**: `pnpm lint` → exit 0, no errors

## Test plan

- Since this is a pure UI refactor, no new automated tests are required. Verification is via type checking and manual UI validation.
- Verification: `pnpm tsc --noEmit` → all pass.

## Done criteria

- [ ] `pnpm tsc --noEmit` exits 0
- [ ] `src/app/admin/page.tsx` is significantly reduced in size (target < 400 lines).
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The codebase has drifted significantly, making the UI extraction impossible without breaking data flow.
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file (like the Supabase hooks).

## Maintenance notes

- Future additions to the admin layout should happen in `AdminSidebar.tsx`.
- New filter controls should be added to `AdminFilters.tsx`.
