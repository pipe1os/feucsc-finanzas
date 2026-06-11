"use client";

import { useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@heroui/react";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/admin/ThemeToggle";
import {
  HugeiconsMenuIcon,
  type HugeiconsMenuIconHandle,
} from "@/components/ui/hugeicons-menu";
import { LogOutIcon } from "@/components/admin/Icons";

export default function AdminSidebar() {
  const { replace } = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuIconRef = useRef<HugeiconsMenuIconHandle>(null);

  const toggleSidebar = (open: boolean) => {
    setSidebarOpen(open);
    if (open) {
      menuIconRef.current?.startAnimation();
    } else {
      menuIconRef.current?.stopAnimation();
    }
  };
  const closeSidebar = () => toggleSidebar(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    replace("/login");
  };

  return (
    <>
      <button type="button"
        onClick={() => toggleSidebar(!sidebarOpen)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center
                   size-10 rounded-xl bg-white dark:bg-zinc-800 shadow-apple-lg lg:hidden
                   transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer"
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <HugeiconsMenuIcon ref={menuIconRef} size={22} />
      </button>
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden cursor-default"
          onClick={closeSidebar}
          aria-label="Cerrar menú"
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-dvh w-65
          flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl
          border-r border-zinc-100 dark:border-zinc-800
          transition-transform duration-300 ease-out
          overflow-y-auto
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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
        <div className="mx-5 h-px bg-zinc-100 dark:bg-zinc-800" />
        <nav className="flex flex-col gap-1 px-4 pt-6">
          <span className="px-3 pb-2 pt-1 text-[10px] font-medium tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
            Administración
          </span>
          <Link
            href="/admin"
            onClick={closeSidebar}
            className={`group relative flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-all duration-200 cursor-pointer
              ${
                pathname === "/admin"
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
          >
            {pathname === "/admin" && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-red-500/70 dark:bg-red-400/70" />
            )}
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center size-8 rounded-lg transition-all duration-200
                  ${
                    pathname === "/admin"
                      ? "text-red-500 dark:text-red-400"
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`}
              >
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
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
              </span>
              Gestión de Gastos
            </div>
          </Link>
        </nav>
        <div className="flex-1" />
        <div className="px-5 pb-6 pt-4">
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-4" />
          <Button
            variant="ghost"
            onPress={handleSignOut}
            className="w-full justify-start text-zinc-600 dark:text-zinc-300 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer font-medium rounded-xl mb-4"
          >
            <LogOutIcon />
            Cerrar sesión
          </Button>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
