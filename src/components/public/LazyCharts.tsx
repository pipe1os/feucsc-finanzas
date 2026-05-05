"use client";

import dynamic from "next/dynamic";
import { SkeletonChart, SkeletonLatestTransactions } from "./Skeletons";

// ── Lazy-load chart components (ssr: false defers hydration) ────
// Recharts (~128 KiB) will only load AFTER the initial paint,
// keeping it off the critical rendering path.

export const LazyExpenseTrendChart = dynamic(
  () => import("./ExpenseTrendChart"),
  {
    ssr: false,
    loading: () => <SkeletonChart type="trend" />,
  }
);

export const LazyExpenseCategoryChart = dynamic(
  () => import("./ExpenseCategoryChart"),
  {
    ssr: false,
    loading: () => <SkeletonChart type="category" />,
  }
);

export const LazyLatestTransactionsPreview = dynamic(
  () => import("./LatestTransactionsPreview"),
  {
    ssr: false,
    loading: () => <SkeletonLatestTransactions rows={3} />,
  }
);
