"use client";

import { Skeleton } from "@heroui/react";

// ── KPI Cards Skeleton ───────────────────────────────────────────
export function SkeletonKPICards() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple p-6 sm:p-8 h-full flex flex-col">
      <div className="flex flex-col flex-1 justify-between gap-5 lg:justify-center">
        {/* Hero metric: label → big number → status text → progress bar */}
        <div>
          <Skeleton className="h-3 w-24 rounded-lg mb-2" />
          <Skeleton className="h-12 w-52 sm:h-14 sm:w-72 rounded-lg mb-2" />
          <Skeleton className="h-4 w-44 rounded-lg mb-3" />
          {/* Progress bar */}
          <Skeleton className="h-1 w-full rounded-full" />
        </div>

        {/* Sub-metrics: two columns */}
        <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-lg" />
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-3 w-28 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-36 rounded-lg" />
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Table Skeleton ───────────────────────────────────────────────
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-apple overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0 space-y-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-56 rounded-lg" />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 px-6 pt-3">
        <Skeleton className="h-9 w-full sm:w-56 rounded-xl" />
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-9 w-56 rounded-xl" />
      </div>

      {/* Table */}
      <div className="p-6 pt-4 space-y-3">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[120px_1fr_120px_100px_80px] gap-4 pb-3 border-b border-gray-100 dark:border-gray-800">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="hidden md:grid grid-cols-[120px_1fr_120px_100px_80px] gap-4 items-center py-3 border-b border-gray-50 dark:border-gray-800 last:border-b-0"
          >
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-8 w-8 rounded-lg mx-auto" />
          </div>
        ))}

        {/* Mobile rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`mobile-${index}`}
            className="md:hidden flex flex-col gap-2 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer pagination */}
      <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Latest Transactions Skeleton (Home page mini table) ──────────
export function SkeletonLatestTransactions({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900 shadow-xs dark:shadow-none overflow-hidden">
      {/* Header — matches real: px-6 pt-5 pb-4 */}
      <div className="px-6 pt-5 pb-4">
        <Skeleton className="h-5 w-28 rounded-lg" />
      </div>

      {/* Mobile rows — matches ListBox: md:hidden px-5 */}
      <div className="md:hidden px-5">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`mobile-${index}`}
            className="flex flex-col gap-1 py-3 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table rows — matches Table: hidden md:block */}
      <div className="hidden md:block px-5">
        {/* Table header row */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] items-center border-b border-gray-100 dark:border-gray-800">
          <div className="px-4 py-2"><Skeleton className="h-3 w-10 rounded" /></div>
          <div className="px-6 py-2"><Skeleton className="h-3 w-20 rounded" /></div>
          <div className="px-4 py-2"><Skeleton className="h-3 w-16 rounded" /></div>
          <div className="px-6 py-2 text-right"><Skeleton className="h-3 w-12 rounded ml-auto" /></div>
        </div>
        {/* Table body rows */}
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center border-t border-gray-50 dark:border-gray-800"
          >
            <div className="px-4 py-2"><Skeleton className="h-4 w-20 rounded" /></div>
            <div className="px-6 py-2"><Skeleton className="h-4 w-3/5 rounded" /></div>
            <div className="px-4 py-2"><Skeleton className="h-5 w-20 rounded-lg" /></div>
            <div className="px-6 py-2 text-right"><Skeleton className="h-4 w-16 rounded ml-auto" /></div>
          </div>
        ))}
      </div>

      {/* Footer — matches real: px-6 py-4 */}
      <div className="px-6 py-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <Skeleton className="h-3 w-28 rounded" />
        <Skeleton className="h-4 w-36 rounded" />
      </div>
    </div>
  );
}

// ── Chart Skeleton ───────────────────────────────────────────────
export function SkeletonChart({ type = "trend" }: { type?: "trend" | "category" }) {
  if (type === "category") {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-apple overflow-hidden space-y-4">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <div className="flex justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-apple overflow-hidden space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-56 rounded-lg" />
      </div>
      <Skeleton className="flex-1 w-full rounded-xl min-h-0" />
    </div>
  );
}

// ── Generic List Items Skeleton ──────────────────────────────────
export function SkeletonListItems({ count = 3 }: { count?: number }) {
  return (
    <div className="w-full max-w-sm space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-4/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Single Shimmer Grid Skeleton ─────────────────────────────────
export function SkeletonGrid({ items = 3 }: { items?: number }) {
  return (
    <div className="skeleton--shimmer relative grid w-full max-w-xl grid-cols-3 gap-4 overflow-hidden rounded-xl">
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton key={index} animationType="none" className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
