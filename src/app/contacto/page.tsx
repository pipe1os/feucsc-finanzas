"use client";

import { toast } from "@heroui/react";
import Footer from "@/components/public/Footer";

export default function ContactoPage() {
  const handleCopyEmail = () => {
    const text = "feucsc@ucsc.cl";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Correo copiado al portapapeles");
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position: fixed; opacity: 0;";
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
    <div className="mx-auto max-w-3xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
      <header className="mb-10 animate-fade-in-up opacity-0 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white font-heading">
          Contacto
        </h1>
        <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          ¿Tienes dudas? Ponte en contacto con nosotros.
        </p>
      </header>

      <div
        className="mb-12 animate-fade-in-up opacity-0 flex flex-col gap-4"
        style={{ animationDelay: "0.1s" }}
      >
        <button
          type="button"
          onClick={handleCopyEmail}
          className="group flex items-center gap-5 p-5 sm:p-6 text-left cursor-pointer transition-all duration-200 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-apple hover:shadow-apple-lg hover:border-zinc-200 dark:hover:border-zinc-700"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Correo institucional
            </span>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-white break-all">
              feucsc@ucsc.cl
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            Copiar
          </span>
        </button>

        <div className="flex items-center gap-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-apple">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Sala FEUCSC
            </span>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              Avenida Alonso de Ribera 2850, Concepción
            </span>
          </div>
        </div>

        <a
          href="https://instagram.com/feucsc_"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-apple transition-all duration-200 hover:shadow-apple-lg hover:border-zinc-200 dark:hover:border-zinc-700"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Síguenos en Instagram
            </span>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors duration-200">
              @feucsc_
            </span>
          </div>
        </a>
      </div>

      <Footer />
    </div>
  );
}
