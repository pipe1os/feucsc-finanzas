"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "./Icons";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 p-1 h-9">
        <div className="flex-1" />
      </div>
    );
  }

  const isLight = theme === "light";

  return (
    <div className="flex items-center rounded-xl bg-gray-100 dark:bg-white/5 p-1">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
          ${
            isLight
              ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
      >
        <SunIcon />
        <span>Claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer
          ${
            !isLight
              ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
      >
        <MoonIcon />
        <span>Oscuro</span>
      </button>
    </div>
  );
}
