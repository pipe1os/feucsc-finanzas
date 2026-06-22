import { cn } from"@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
 width?: number;
 height?: number;
 cx?: number;
 cy?: number;
 cr?: number;
 className?: string;

 glow?: boolean;
 [key: string]: unknown;
}

export function DotPattern({
 width = 16,
 height = 16,
 cx = 1,
 cy = 1,
 cr = 1,
 className,

 glow: _glow,
 ...props
}: DotPatternProps) {
 void _glow;
 const id ="dot-pattern-bg";

 return (
 <svg
 aria-hidden="true"
 className={cn(
"pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
 className,
 )}
 {...props}
 >
 <defs>
 <pattern
 id={id}
 x="0"
 y="0"
 width={width}
 height={height}
 patternUnits="userSpaceOnUse"
 >
 <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill={`url(#${id})`} />
 </svg>
 );
}
