/**
 * Curated category color palette.
 * Harmonious, muted tones inspired by Apple design language.
 * Colors are desaturated enough to work together without visual chaos.
 * "Varios" is always #9CA3AF (gray) — hardcoded separately.
 */
export const CATEGORY_PALETTE = [
  // Brand-adjacent reds (muted)
  "#C41E3A", // Cardinal red
  "#D4595E", // Muted coral
  "#B83232", // Brick red

  // Warm tones (muted amber/orange)
  "#D97706", // Amber-600
  "#C2410C", // Orange-700
  "#B45309", // Amber-700

  // Cool blues (muted, professional)
  "#2563EB", // Blue-600
  "#3B82F6", // Blue-500
  "#1D4ED8", // Blue-700
  "#0891B2", // Cyan-600

  // Greens (muted, natural)
  "#059669", // Emerald-600
  "#10B981", // Emerald-500
  "#0F766E", // Teal-700

  // Purples (muted, not neon)
  "#7C3AED", // Violet-600
  "#8B5CF6", // Violet-500
  "#6D28D9", // Violet-700

  // Pink/rose (muted)
  "#DB2777", // Pink-600
  "#E11D48", // Rose-600
  "#BE185D", // Pink-700

  // Neutral accent
  "#475569", // Slate-600
  "#64748B", // Slate-500
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

  // All used: cycle based on count
  return CATEGORY_PALETTE[usedColors.length % CATEGORY_PALETTE.length];
}
