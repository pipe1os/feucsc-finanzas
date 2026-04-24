"use client";

import Image from "next/image";
import { useState } from "react";

const HomeIcon = () => (
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
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 flex items-center justify-center
                   size-10 rounded-xl bg-white shadow-apple-lg lg:hidden
                   transition-colors hover:bg-gray-50 cursor-pointer"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-dvh w-[260px]
          flex flex-col bg-white/80 backdrop-blur-xl
          border-r border-gray-100
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-center px-5 pt-7 pb-5">
          <Image
            src="/feucsclogo.webp"
            alt="Logo FEUCSC"
            width={894}
            height={307}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gray-100" />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4 pt-6">
          <span className="px-3 pb-2 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
            General
          </span>
          <button
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5
                       bg-red-50 text-red-500 font-medium text-sm
                       transition-all duration-200 cursor-pointer"
          >
            <span
              className="flex items-center justify-center size-8 rounded-lg
                            bg-red-500 text-white shadow-sm
                            transition-transform duration-200 group-hover:scale-105"
            >
              <HomeIcon />
            </span>
            Inicio
          </button>

          <button
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5
                       text-gray-500 hover:text-gray-900 font-medium text-sm
                       transition-all duration-200 cursor-pointer"
          >
            <span
              className="flex items-center justify-center size-8 rounded-lg
                            text-gray-400 group-hover:text-gray-900
                            transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            Contacto
          </button>

          <button
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5
                       text-gray-500 hover:text-gray-900 font-medium text-sm
                       transition-all duration-200 cursor-pointer"
          >
            <span
              className="flex items-center justify-center size-8 rounded-lg
                            text-gray-400 group-hover:text-gray-900
                            transition-colors duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            Preguntas frecuentes
          </button>
        </nav>

        {/* Footer */}
      </aside>
    </>
  );
}
