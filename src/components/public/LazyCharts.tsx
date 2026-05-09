"use client";

import dynamic from "next/dynamic";
import { SkeletonChart } from "./Skeletons";

export const LazyExpenseTrendChart = dynamic(
  () => import("./ExpenseTrendChart"),
  {
    ssr: false,
    loading: () => <SkeletonChart type="trend" />,
  },
);

export const LazyExpenseCategoryChart = dynamic(
  () => import("./ExpenseCategoryChart"),
  {
    ssr: false,
    loading: () => <SkeletonChart type="category" />,
  },
);
