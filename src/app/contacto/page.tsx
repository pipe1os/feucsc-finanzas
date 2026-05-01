"use client";

import Sidebar from "@/components/public/Sidebar";
import { toast } from "@heroui/react";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export default function ContactoPage() {
  const handleCopyEmail = () => {
    const text = "feucsc@ucsc.cl";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Correo copiado al portapapeles");
    } else {
      // Fallback para HTTP o navegadores sin clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        toast.success("Correo copiado al portapapeles");
      } catch {
        toast.danger("No se pudo copiar el correo");
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="flex min-h-dvh bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0 lg:ml-65">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
          {/* Page header */}
          <header className="mb-8 animate-fade-in-up opacity-0">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Contacto
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              ¿Tienes dudas? Ponte en contacto con nosotros.
            </p>
          </header>

          {/* Single unified contact card */}
          <div
            className="mb-8 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] divide-y divide-gray-100 dark:divide-gray-800">
              {/* Email — click to copy */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="group flex w-full items-center gap-4 p-5 sm:p-6 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-50/60 dark:hover:bg-white/5 rounded-t-3xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gray-400 dark:text-gray-500"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-gray-400">
                    Correo institucional
                  </span>
                  <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 dark:text-white break-all">
                    feucsc@ucsc.cl
                  </span>
                </div>
                <span className="ml-auto text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                  Copiar
                </span>
              </button>

              {/* Location */}
              <div className="flex items-center gap-4 p-5 sm:p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gray-400 dark:text-gray-500"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-gray-400">
                    Sala FEUCSC
                  </span>
                  <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                    Avenida Alonso de Ribera 2850, Concepción
                  </span>
                </div>
              </div>

              {/* Instagram */}
              <a
                href="https://instagram.com/feucsc_"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 p-5 sm:p-6 rounded-b-3xl transition-colors duration-200 hover:bg-gray-50/60 dark:hover:bg-white/5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gray-400 dark:text-gray-500"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-gray-400">
                    Síguenos en Instagram
                  </span>
                  <span className="text-sm sm:text-base font-semibold tracking-tight text-gray-900 dark:text-white group-hover:text-red-500 transition-colors duration-200">
                    @feucsc_
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
}
