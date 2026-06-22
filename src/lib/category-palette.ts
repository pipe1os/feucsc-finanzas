const CATEGORY_PALETTE = [
"#C41E3A",
"#D4595E",
"#B83232",

"#D97706",
"#C2410C",
"#B45309",

"#2563EB",
"#3B82F6",
"#1D4ED8",
"#0891B2",

"#059669",
"#10B981",
"#0F766E",

"#7C3AED",
"#8B5CF6",
"#6D28D9",

"#DB2777",
"#E11D48",
"#BE185D",

"#475569",
"#64748B",
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
