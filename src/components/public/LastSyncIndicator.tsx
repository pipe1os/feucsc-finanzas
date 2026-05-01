"use client";

import { useEffect, useState } from "react";
import { Tooltip } from "@heroui/react";

interface LastSyncIndicatorProps {
  lastSyncISO: string | null;
}

function formatExactDate(isoDate: string): string {
  // Parse robustly: handle both full ISO strings and date-only strings
  // without timezone shifts by treating the input as local time.
  let date: Date;
  const trimmed = isoDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    // Date-only string: parse as local midnight to avoid UTC conversion
    const [y, m, d] = trimmed.split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(trimmed);
  }

  if (isNaN(date.getTime())) {
    return isoDate;
  }

  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic"
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!lastSyncISO || !mounted) return null;

  const relativeTime = formatDistanceToNowEs(new Date(lastSyncISO));
  const exactDate = formatExactDate(lastSyncISO);

  return (
    <Tooltip delay={0} closeDelay={0}>
      <Tooltip.Trigger>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 cursor-help">
          {/* Animated green dot */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <span>Actualizado {relativeTime} ({exactDate})</span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content className="bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-lg">
        <p>Actualizado el {exactDate}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
