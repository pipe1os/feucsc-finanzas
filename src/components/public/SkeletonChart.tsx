"use client";

import { Skeleton } from "@heroui/react";
import AreaChartLoading from "@/components/charts/area-chart-loading";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";

export function SkeletonChart({
 type ="trend",
}: {
 type?:"trend" |"category";
}) {
 if (type ==="category") {
 return (
 <Card className="rounded-2xl border border-border bg-white shadow-apple ring-0">
 <CardHeader className="pb-4">
 <CardTitle className="text-base font-semibold text-zinc-900 font-heading">
 <Skeleton className="h-5 w-40 rounded-lg" />
 </CardTitle>
 <CardDescription className="text-xs text-zinc-400">
 <Skeleton className="h-3 w-24 rounded-lg mt-1" />
 </CardDescription>
 </CardHeader>
 <CardContent className="flex flex-col items-center gap-6">
 <Skeleton className="size-56 rounded-full" />
 <div className="w-full space-y-3">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="flex items-center gap-3 w-full py-1">
 <Skeleton className="size-2.5 rounded-full shrink-0" />
 <Skeleton className="h-3 flex-1 rounded-lg" />
 <Skeleton className="h-3 w-8 rounded-lg shrink-0" />
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="rounded-2xl border border-border bg-white shadow-apple ring-0 h-full flex flex-col min-h-80 sm:min-h-90 lg:min-h-75">
 <CardHeader className="pb-6">
 <CardTitle className="text-base font-semibold text-zinc-900 font-heading">
 <Skeleton className="h-5 w-40 rounded-lg" />
 </CardTitle>
 <CardDescription className="text-xs text-zinc-500">
 <Skeleton className="h-3 w-56 rounded-lg mt-1" />
 </CardDescription>
 </CardHeader>

 <CardContent className="flex-1 flex flex-col min-h-0 pt-0 relative">
 <div className="flex-1 w-full min-h-0">
          <AreaChartLoading
            gridShimmerSync
            label="Loading"
            stroke="var(--foreground)"
            strokeOpacity={0.5}
            aspectRatio="auto"
            className="h-full"
          />
 </div>
 </CardContent>
 </Card>
 );
}
