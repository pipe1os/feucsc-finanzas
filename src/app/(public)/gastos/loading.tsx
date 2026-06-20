import { SkeletonChart, SkeletonTable } from "@/components/public/Skeletons";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors duration-200"
              >
                <span className="flex items-center justify-center size-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 transition-colors duration-200">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-200 group-hover:-translate-x-0.5"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </span>
                <span className="uppercase tracking-wider text-[11px] font-semibold">
                  Resumen
                </span>
              </Link>
            </div>
            <Skeleton className="h-8 w-48 rounded-lg mb-2" />
            <Skeleton className="h-4 w-64 rounded-lg" />
          </div>
        </div>
      </header>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="col-span-1 lg:col-span-8">
            <SkeletonChart type="trend" />
          </div>
          <div className="col-span-1 lg:col-span-4">
            <SkeletonChart type="category" />
          </div>
        </div>
        <SkeletonTable rows={10} />
      </div>
      
      <Footer />
    </div>
  );
}
