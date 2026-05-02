export function buildCategoryColors(
  categoriasData: Array<{ nombre: string; color?: string }>,
): Record<string, string> {
  const categoryColors: Record<string, string> = {};
  categoriasData.forEach((c) => {
    if (c.color) categoryColors[c.nombre] = c.color;
  });
  if (!categoryColors["N/A"]) categoryColors["N/A"] = "#9CA3AF";
  if (!categoryColors["Varios"]) categoryColors["Varios"] = "#9CA3AF";
  return categoryColors;
}
