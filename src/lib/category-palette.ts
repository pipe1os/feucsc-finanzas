/**
 * Curated category color palette.
 * 20 hand-picked colors with good contrast on white, harmonious together.
 * "Varios" is always #9CA3AF (gray) — hardcoded separately.
 */
export const CATEGORY_PALETTE = [
  "#E30707", // Red (brand)
  "#F59E0B", // Amber
  "#0EA5E9", // Sky blue
  "#10B981", // Emerald
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#EF4444", // Red-500
  "#84CC16", // Lime
  "#A855F7", // Purple
  "#3B82F6", // Blue
  "#D946EF", // Fuchsia
  "#059669", // Emerald-600
  "#DC2626", // Red-600
  "#7C3AED", // Violet-600
  "#0284C7", // Sky-600
  "#CA8A04", // Yellow-600
] as const;

/** Fixed color for "Varios" / "N/A" categories */
export const VARIOS_COLOR = "#9CA3AF";

/**
 * Picks the next available color from the curated palette.
 * Skips colors already in use. Falls back to cycling through palette.
 */
export function getNextPaletteColor(usedColors: string[]): string {
  const usedSet = new Set(usedColors.map((c) => c.toUpperCase()));

  // Find first unused color in the palette
  for (const color of CATEGORY_PALETTE) {
    if (!usedSet.has(color.toUpperCase())) {
      return color;
    }
  }

  // All 20 used: cycle based on count
  return CATEGORY_PALETTE[usedColors.length % CATEGORY_PALETTE.length];
}
