"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 h-8">
        <div className="flex-1" />
      </div>
    );
  }

  const isLight = resolvedTheme === "light";

  return (
    <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5">
      <button
        onClick={() => setTheme("light")}
        data-active={isLight}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer data-[active=true]:bg-white data-[active=true]:text-zinc-900 data-[active=true]:shadow-xs data-[active=false]:text-zinc-600 dark:data-[active=false]:text-zinc-400"
      >
        <SunIcon />
        <span>Claro</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        data-active={!isLight}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer data-[active=true]:bg-white dark:data-[active=true]:bg-zinc-700 data-[active=true]:text-zinc-900 dark:data-[active=true]:text-white data-[active=true]:shadow-xs data-[active=false]:text-zinc-600 dark:data-[active=false]:text-zinc-400"
      >
        <MoonIcon />
        <span>Oscuro</span>
      </button>
    </div>
  );
}
