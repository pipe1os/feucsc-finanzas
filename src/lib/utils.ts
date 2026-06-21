import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCLP(monto: number): string {
  return clpFormatter.format(monto);
}

export function parseISODate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return null;
  return d;
}

export function formatDate(dateStr: string): string {
  const date = parseISODate(dateStr);
  if (!date) return "—";
  return shortDateFormatter.format(date);
}

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
