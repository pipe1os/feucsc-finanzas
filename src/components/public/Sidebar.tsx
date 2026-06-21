"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@heroui/react";
import { m, LazyMotion, domAnimation } from "motion/react";
import {
  HugeiconsMenuIcon,
  type HugeiconsMenuIconHandle,
} from "@/components/ui/hugeicons-menu";

const ChartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    strokeWidth="2"
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
    strokeWidth="2"
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
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
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
    <LazyMotion features={domAnimation}>
      <Link
        href={href}
        onClick={onClick}
        className={`group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-all duration-200 cursor-pointer
          ${
            isActive
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
      >
        {isActive && (
          <m.div
            layoutId="activeNavTab"
            className="absolute inset-0 bg-red-50 dark:bg-white/5 rounded-xl -z-10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        {isActive && (
          <m.span
            layoutId="activeNavIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-red-500/70 dark:bg-red-400/70"
          />
        )}
        <div className="flex items-center gap-3 relative z-10">
        <Badge.Anchor>
          <span
            className={`flex items-center justify-center size-8 rounded-lg transition-all duration-200
              ${
                isActive
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
              }`}
          >
            {icon}
          </span>
          {!!badgeCount && badgeCount > 0 && (
            <Badge
              color="danger"
              size="sm"
              variant="primary"
              placement="top-right"
            >
              <Badge.Label className="text-[10px] font-bold">
                {badgeCount > 99 ? "99+" : badgeCount}
              </Badge.Label>
            </Badge>
          )}
        </Badge.Anchor>
        {label}
      </div>
    </Link>
    </LazyMotion>
  );
}

function NavCategory({ label }: { label: string }) {
  return (
    <span className="px-3 pb-2 pt-1 text-[10px] font-medium tracking-widest text-gray-500 dark:text-gray-400 uppercase">
      {label}
    </span>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [newExpensesCount, setNewExpensesCount] = useState(0);
  const menuIconRef = useRef<HugeiconsMenuIconHandle>(null);

  const toggleSidebar = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  };

  useEffect(() => {
    const checkNewExpenses = async () => {
      try {
        if (pathname === "/gastos") {
          localStorage.setItem("lastVisitedGastos", new Date().toISOString());
          setNewExpensesCount(0);
          return;
        }

        const lastVisited = localStorage.getItem("lastVisitedGastos");
        if (!lastVisited) {
          localStorage.setItem("lastVisitedGastos", new Date().toISOString());
          return;
        }

        const { count } = await supabase
          .from("gastos")
          .select("*", { count: "exact", head: true })
          .gt("creado_el", lastVisited);

        if (count && count > 0) {
          setNewExpensesCount(count);
        }
      } catch {
        setNewExpensesCount(0);
      }
    };

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    if (typeof requestIdleCallback === "function") {
      idleId = requestIdleCallback(() => {
        checkNewExpenses();
      });
    } else {
      timeoutId = setTimeout(() => {
        checkNewExpenses();
      }, 200);
    }

    return () => {
      if (idleId !== null && typeof cancelIdleCallback === "function") {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [pathname]);

  const close = () => toggleSidebar(false);

  return (
    <>
      <button type="button"
        onClick={() => toggleSidebar(!isOpen)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center
                   size-10 rounded-xl bg-surface dark:bg-gray-800 shadow-apple-lg lg:hidden
                   transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <HugeiconsMenuIcon ref={menuIconRef} size={22} />
      </button>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-gray-900/20 backdrop-blur-xs lg:hidden cursor-default"
          onClick={close}
          aria-label="Cerrar menú"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-dvh w-65
          flex flex-col bg-surface/80 dark:bg-gray-900/80 backdrop-blur-xl
          border-r border-gray-100 dark:border-gray-800
          transition-transform duration-300 ease-out
          overflow-y-auto
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-center px-5 pt-7 pb-5">
          <Image
            src="/logofeucsc.webp"
            alt="Logo FEUCSC"
            width={894}
            height={307}
            sizes="(max-width: 1024px) 200px, 260px"
            className="h-16 w-auto max-w-full object-contain dark:brightness-110 dark:contrast-110"
            priority
          />
        </div>

        <div className="mx-5 h-px bg-gray-100 dark:bg-gray-800" />

        <nav className="flex flex-col gap-1 px-4 pt-6">
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

          <div className="mt-4" />

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

        <div className="flex-1" />
      </aside>
    </>
  );
}
