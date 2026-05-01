"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import { Badge } from "@heroui/react";

/* ── Apple-style minimalist icons (SF Symbols inspired) ── */

const ChartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="m7 14 4-4 4 4 6-6" />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2v20l3-3 3 3 3-3 3 3 3-3V2H4z" />
    <path d="M8 6h8" />
    <path d="M8 10h8" />
    <path d="M8 14h5" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const QuestionIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const SunIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
  badgeCount?: number;
}

function NavItem({
  href,
  label,
  icon,
  isActive,
  onClick,
  badgeCount,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-all duration-200 cursor-pointer
        ${
          isActive
            ? "text-red-500 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200"
        }`}
      style={
        isActive ? { backgroundColor: "rgba(227, 7, 7, 0.08)" } : undefined
      }
    >
      <div className="flex items-center gap-3">
        <Badge.Anchor>
          <span
            className={`flex items-center justify-center size-8 rounded-lg transition-all duration-200
              ${
                isActive
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              }`}
          >
            {icon}
          </span>
          {!!badgeCount && badgeCount > 0 && (
            <Badge color="danger" size="sm" variant="primary" placement="top-right">
              <Badge.Label className="text-[10px] font-bold">
                {badgeCount > 99 ? "99+" : badgeCount}
              </Badge.Label>
            </Badge>
          )}
        </Badge.Anchor>
        {label}
      </div>
    </Link>
  );
}

function NavCategory({ label }: { label: string }) {
  return (
    <span className="px-3 pb-2 pt-1 text-[10px] font-medium tracking-widest text-zinc-400 dark:text-zinc-600 uppercase">
      {label}
    </span>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 h-8">
        <div className="flex-1" />
      </div>
    );
  }

  const isLight = theme === "light";

  return (
    <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5">
      <button
        onClick={() => setTheme("light")}
        data-active={isLight}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer data-[active=true]:bg-white data-[active=true]:text-gray-900 data-[active=true]:shadow-xs data-[active=false]:text-gray-500 dark:data-[active=false]:text-gray-400"
      >
        <SunIcon />
        <span>Claro</span>
      </button>
      <button
        onClick={() => setTheme("dark")}
        data-active={!isLight}
        className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 cursor-pointer data-[active=true]:bg-white dark:data-[active=true]:bg-zinc-700 data-[active=true]:text-gray-900 dark:data-[active=true]:text-white data-[active=true]:shadow-xs data-[active=false]:text-gray-500 dark:data-[active=false]:text-gray-400"
      >
        <MoonIcon />
        <span>Oscuro</span>
      </button>
    </div>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [newExpensesCount, setNewExpensesCount] = useState(0);

  useEffect(() => {
    // Determine the number of new expenses since last visit
    const checkNewExpenses = async () => {
      try {
        // If we are currently ON the gastos page, reset the count and update lastVisited
        if (pathname === "/gastos") {
          localStorage.setItem("lastVisitedGastos", new Date().toISOString());
          setNewExpensesCount(0);
          return;
        }

        const lastVisited = localStorage.getItem("lastVisitedGastos");
        if (!lastVisited) {
          // If they have never visited, initialize with current time to avoid showing everything
          localStorage.setItem("lastVisitedGastos", new Date().toISOString());
          return;
        }

        // Query Supabase for count of expenses newer than lastVisited
        const { count } = await supabase
          .from("gastos")
          .select("*", { count: "exact", head: true })
          .gt("creado_el", lastVisited);

        if (count && count > 0) {
          setNewExpensesCount(count);
        }
      } catch {
        // Silently fail if localStorage is unavailable (private mode, restricted contexts)
        setNewExpensesCount(0);
      }
    };

    checkNewExpenses();
  }, [pathname]);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center
                   size-10 rounded-xl bg-white dark:bg-gray-800 shadow-apple-lg lg:hidden
                   transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-dvh w-65
          flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
          border-r border-gray-100 dark:border-gray-800
          transition-transform duration-300 ease-out
          overflow-y-auto
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-center px-5 pt-7 pb-5">
          <Image
            src="/logofeucsc.webp"
            alt="Logo FEUCSC"
            width={894}
            height={307}
            className="h-16 w-auto object-contain dark:brightness-110 dark:contrast-110"
            priority
          />
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gray-100 dark:bg-gray-800" />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4 pt-6">
          {/* ── Finanzas ── */}
          <NavCategory label="Finanzas" />
          <NavItem
            href="/"
            label="Resumen"
            icon={<ChartIcon />}
            isActive={pathname === "/"}
            onClick={close}
          />
          <NavItem
            href="/gastos"
            label="Gastos"
            icon={<ReceiptIcon />}
            isActive={pathname === "/gastos"}
            onClick={close}
            badgeCount={newExpensesCount}
          />

          {/* Spacer between groups */}
          <div className="mt-4" />

          {/* ── Soporte ── */}
          <NavCategory label="Soporte" />
          <NavItem
            href="/faq"
            label="Preguntas frecuentes"
            icon={<QuestionIcon />}
            isActive={pathname === "/faq"}
            onClick={close}
          />
          <NavItem
            href="/contacto"
            label="Contacto"
            icon={<MailIcon />}
            isActive={pathname === "/contacto"}
            onClick={close}
          />
        </nav>

        {/* Spacer pushes footer to bottom */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <div className="px-5 pb-6">
          <div className="h-px bg-gray-100 dark:bg-gray-800 mb-4" />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
