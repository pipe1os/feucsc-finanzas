"use client";

import { Skeleton } from "@heroui/react";

export function SkeletonKPICards() {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-apple p-6 sm:p-8 h-full flex flex-col">
      <div className="flex flex-col flex-1 justify-between gap-5 lg:justify-center">
        <div>
          <Skeleton className="h-3 w-24 rounded-lg mb-2" />
          <Skeleton className="h-12 w-52 sm:h-14 sm:w-72 rounded-lg mb-2" />
          <Skeleton className="h-4 w-44 rounded-lg mb-3" />

          <Skeleton className="h-1 w-full rounded-full" />
        </div>

        <div className="flex items-end justify-between gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800">
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

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-apple overflow-hidden">
      {}
      <div className="p-6 pb-0 space-y-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-56 rounded-lg" />
      </div>

      <div className="flex flex-wrap items-center gap-3 px-6 pt-3">
        <Skeleton className="h-9 w-full sm:w-56 rounded-xl" />
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-9 w-56 rounded-xl" />
      </div>

      <div className="p-6 pt-4 space-y-3">
        <div className="hidden md:grid grid-cols-[120px_1fr_120px_100px_80px] gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>

        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="hidden md:grid grid-cols-[120px_1fr_120px_100px_80px] gap-4 items-center py-3 border-b border-zinc-50 dark:border-zinc-800 last:border-b-0"
          >
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="size-8 rounded-lg mx-auto" />
          </div>
        ))}

        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`mobile-${index}`}
            className="md:hidden flex flex-col gap-2 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
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

      <div className="px-6 py-4 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}



export function SkeletonChart({
  type = "trend",
}: {
  type?: "trend" | "category";
}) {
  if (type === "category") {
    return (
      <div className="h-full flex flex-col rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-apple overflow-hidden gap-y-4">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <div className="flex justify-center mt-4 mb-4">
          <Skeleton className="size-56 rounded-full" />
        </div>
        <div className="flex-1 space-y-5 flex flex-col pt-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-3 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>
              <div className="flex items-center gap-4 flex-1 justify-end">
                <Skeleton className="h-2 w-16 rounded-full" />
                <Skeleton className="h-4 w-10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-apple overflow-hidden gap-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-56 rounded-lg" />
      </div>
      <Skeleton className="flex-1 w-full rounded-xl min-h-0" />
    </div>
  );
}

