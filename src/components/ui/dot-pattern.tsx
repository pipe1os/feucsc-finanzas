import { cn } from"@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
 width?: number;
 height?: number;
 cx?: number;
 cy?: number;
 cr?: number;
 className?: string;
 dense?: boolean;
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
 dense = false,
 glow: _glow,
 ...props
}: DotPatternProps) {
 void _glow;
 const id = dense ? "dot-pattern-dense" : "dot-pattern-bg";
 const finalWidth = dense ? width * 0.7 : width;
 const finalHeight = dense ? height * 0.7 : height;

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
 width={finalWidth}
 height={finalHeight}
 patternUnits="userSpaceOnUse"
 >
 <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill={`url(#${id})`} />
 </svg>
 );
}
