"use client";

import { Skeleton } from "@heroui/react";

export function SkeletonChart({
  type = "trend",
}: {
  type?: "trend" | "category";
}) {
  if (type === "category") {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white shadow-apple ring-0 p-6 sm:p-8 flex flex-col">
        <div className="space-y-2 mb-6 text-center">
          <Skeleton className="h-5 w-40 mx-auto rounded-lg" />
          <Skeleton className="h-3 w-24 mx-auto rounded-lg" />
        </div>
        <div className="flex justify-center mt-4 mb-4">
          <Skeleton className="size-48 rounded-full" />
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-3 flex-1 rounded-lg" />
              <Skeleton className="h-3 w-12 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white shadow-apple ring-0 h-full flex flex-col min-h-[320px] sm:min-h-[360px] lg:min-h-[300px]">
      <div className="p-6 pb-6 flex flex-col space-y-1.5">
        <Skeleton className="h-5 w-40 rounded-lg" />
        <Skeleton className="h-3 w-56 rounded-lg" />
      </div>
      <div className="px-6 pb-6 pt-0 flex-1 flex flex-col min-h-0">
        <div className="flex-1 w-full relative min-h-0 flex flex-col">
          <Skeleton className="flex-1 w-full rounded-xl min-h-0" />
        </div>
      </div>
    </div>
  );
}
