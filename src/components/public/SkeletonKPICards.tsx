"use client";

import { Skeleton } from"@heroui/react";

export function SkeletonKPICards() {
 return (
 <div className="rounded-2xl border border-border bg-white shadow-apple ring-0 p-6 sm:p-8 h-full flex flex-col">
 <div className="flex flex-col flex-1 justify-between gap-5 lg:justify-center">
 <div>
 <Skeleton className="h-3 w-24 rounded-lg mb-2" />
 <Skeleton className="h-12 w-52 sm:h-14 sm:w-72 rounded-lg mb-2" />
 <Skeleton className="h-4 w-44 rounded-lg mb-3" />

 <Skeleton className="h-1 w-full rounded-full" />
 </div>

 <div className="flex items-end justify-between gap-4 pt-4 border-t border-gray-50">
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
