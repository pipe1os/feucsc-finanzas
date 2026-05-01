"use client";

import dynamic from "next/dynamic";

// ── Lazy-load chart components (ssr: false defers hydration) ────
// Recharts (~128 KiB) will only load AFTER the initial paint,
// keeping it off the critical rendering path.

export const LazyExpenseTrendChart = dynamic(
  () => import("./ExpenseTrendChart"),
  {
    ssr: false,
      loading: () => (
      <div className="min-h-[300px] rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-apple animate-pulse">
        <div className="h-5 w-40 rounded bg-gray-100 dark:bg-gray-800 mb-2" />
        <div className="h-3 w-56 rounded bg-gray-50 dark:bg-gray-800/50 mb-6" />
        <div className="h-[300px] w-full rounded-xl bg-gray-50 dark:bg-gray-800/50" />
      </div>
    ),
  }
);

export const LazyExpenseCategoryChart = dynamic(
  () => import("./ExpenseCategoryChart"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-apple animate-pulse">
        <div className="h-5 w-36 rounded bg-gray-100 dark:bg-gray-800 mb-4" />
        <div className="mx-auto h-48 w-48 rounded-full bg-gray-50 dark:bg-gray-800/50" />
      </div>
    ),
  }
);
