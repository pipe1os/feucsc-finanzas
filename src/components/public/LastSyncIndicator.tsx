"use client";

import { Tooltip } from "@heroui/react";

interface LastSyncIndicatorProps {
  lastSyncISO: string | null;
}

function parseRobustDate(isoDate: string): Date | null {
  const trimmed = isoDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatExactDate(isoDate: string): string {
  const date = parseRobustDate(isoDate);
  if (!date) return isoDate;

  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const mins = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month}, ${hours}:${mins}`;
}

function formatDistanceToNowEs(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "hace unos segundos";
  if (diffMin < 2) return "hace 1 minuto";
  if (diffMin < 60) return `hace ${diffMin} minutos`;
  if (diffHour < 2) return "hace 1 hora";
  if (diffHour < 24) return `hace ${diffHour} horas`;
  if (diffDay < 2) return "hace 1 día";
  if (diffDay < 30) return `hace ${diffDay} días`;
  if (diffMonth < 2) return "hace 1 mes";
  if (diffMonth < 12) return `hace ${diffMonth} meses`;
  if (diffYear < 2) return "hace 1 año";
  return `hace ${diffYear} años`;
}

export default function LastSyncIndicator({
  lastSyncISO,
}: LastSyncIndicatorProps) {
  if (!lastSyncISO) return null;

  const date = parseRobustDate(lastSyncISO);
  const relativeTime = date ? formatDistanceToNowEs(date) : "";
  const exactDate = formatExactDate(lastSyncISO);

  return (
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-help">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <span suppressHydrationWarning>
            Actualizado {relativeTime} ({exactDate})
          </span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg">
        <p>Actualizado el {exactDate}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
