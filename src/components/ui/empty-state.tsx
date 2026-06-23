import React from"react";
import { cn } from"@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
 title?: string;
 description?: string;
 icon?: React.ReactNode;
}

export function EmptyState({
 title ="Sin resultados",
 description ="No se encontraron datos.",
 icon,
 className,
 ...props
}: EmptyStateProps) {
 return (
 <div
 className={cn(
"flex h-48 w-full flex-col items-center justify-center gap-3 text-center",
 className
 )}
 {...props}
 >
 <div className="flex size-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 border border-border shadow-xs ring-4 ring-gray-50/50">
 {icon || (
 <svg
 width="20"
 height="20"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 strokeWidth="2"
 strokeLinecap="round"
 strokeLinejoin="round"
 >
 <circle cx="11" cy="11" r="8" />
 <path d="m21 21-4.3-4.3" />
 </svg>
 )}
 </div>
 <div className="flex flex-col">
 <span className="text-sm font-semibold text-gray-900 font-heading">
 {title}
 </span>
 <span className="text-xs text-gray-500 mt-0.5 max-w-[250px]">
 {description}
 </span>
 </div>
 </div>
 );
}
