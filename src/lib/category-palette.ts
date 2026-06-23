const CATEGORY_PALETTE = [
  "#D97706", "#C2410C", "#B45309", "#EA580C", "#CA8A04",   // oranges / golds
  "#059669", "#10B981", "#0F766E", "#16A34A", "#0E7490",   // greens / teal
  "#2563EB", "#3B82F6", "#1D4ED8", "#0891B2",              // blues / cyan
  "#7C3AED", "#8B5CF6", "#6D28D9", "#4F46E5",              // purples / indigo
  "#475569", "#64748B",                                    // slates
] as const;

export const VARIOS_COLOR ="#9CA3AF";

export function getNextPaletteColor(usedColors: string[]): string {
 const usedSet = new Set(usedColors.map((c) => c.toUpperCase()));

 for (const color of CATEGORY_PALETTE) {
 if (!usedSet.has(color.toUpperCase())) {
 return color;
 }
 }

 return CATEGORY_PALETTE[usedColors.length % CATEGORY_PALETTE.length];
}
