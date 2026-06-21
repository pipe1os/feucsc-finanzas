"use client";

import { Skeleton } from "@heroui/react";

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  const safeRows = Math.max(0, Math.floor(rows));
 return (
 <div className="rounded-2xl border border-zinc-100 bg-white shadow-apple ring-0 overflow-hidden">
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
 <div className="hidden md:grid grid-cols-[120px_1fr_120px_100px_80px] gap-4 pb-3 border-b border-zinc-100">
 <Skeleton className="h-3 w-16 rounded" />
 <Skeleton className="h-3 w-24 rounded" />
 <Skeleton className="h-3 w-20 rounded" />
 <Skeleton className="h-3 w-16 rounded" />
 <Skeleton className="h-3 w-12 rounded" />
 </div>

 {Array.from({ length: safeRows }).map((_, index) => (
 <div
 key={index}
 className="hidden md:grid grid-cols-[120px_1fr_120px_100px_80px] gap-4 items-center py-3 border-b border-zinc-50 last:border-b-0"
 >
 <Skeleton className="h-4 w-20 rounded" />
 <Skeleton className="h-4 w-3/4 rounded" />
 <Skeleton className="h-5 w-20 rounded-lg" />
 <Skeleton className="h-4 w-20 rounded" />
 <Skeleton className="size-8 rounded-lg mx-auto" />
 </div>
 ))}

 {Array.from({ length: safeRows }).map((_, index) => (
 <div
 key={`mobile-${index}`}
 className="md:hidden flex flex-col gap-2 py-3 border-b border-zinc-100 last:border-b-0"
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

 <div className="px-6 py-4 border-t border-zinc-50 flex items-center justify-between">
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
