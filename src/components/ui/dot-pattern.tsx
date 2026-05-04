import { cn } from "@/lib/utils"

/**
 *  DotPattern Component — Pure CSS/SVG version
 *
 *  Creates a dot grid background using a single SVG <pattern> + <rect>.
 *  Zero JavaScript, zero motion, same visual appearance.
 *  Previous version rendered thousands of individual <motion.circle> elements
 *  causing ~500ms+ of main-thread blocking on mobile.
 *
 * @param {number} [width=16] - The horizontal spacing between dots
 * @param {number} [height=16] - The vertical spacing between dots
 * @param {number} [cx=1] - The x-offset of individual dots
 * @param {number} [cy=1] - The y-offset of individual dots
 * @param {number} [cr=1] - The radius of each dot
 * @param {string} [className] - Additional CSS classes to apply to the SVG container
 */
interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  /** @deprecated glow prop removed for performance — has no effect */
  glow?: boolean
  [key: string]: unknown
}

export function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  glow: _glow,
  ...props
}: DotPatternProps) {
  // Deterministic id safe for SSR (no useId needed since this is now a server component)
  const id = "dot-pattern-bg"

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
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
  )
}
