import Sidebar from "@/components/public/Sidebar";
import FAQContent from "@/components/public/FAQContent";
import Link from "next/link";

export const metadata = {
  title: "Preguntas Frecuentes | FEUCSC",
  description:
    "Respuestas a las preguntas más frecuentes sobre la transparencia financiera de la Federación de Estudiantes UCSC.",
};

export default function FAQPage() {
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
              Preguntas Frecuentes
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Respuestas a las preguntas más frecuentes sobre la FEUCSC.
            </p>
          </header>

          {/* FAQ Accordion Content (client component) */}
          <FAQContent />

          {/* CTA Section */}
          <section
            className="mt-12 mb-0 text-center animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="text-x1 sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
              ¿Tienes otra duda?{" "}
              <a
                href="/contacto"
                className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-600 transition-colors duration-200 group"
              >
                Contáctanos
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="inline-block size-[0.7em] transition-transform duration-200 group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>
            </h2>
          </section>

          {/* Footer — same as main page */}
          <footer
            className="mt-20 border-t border-gray-100 dark:border-gray-800 pt-6 animate-fade-in-up opacity-0"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
              <p className="text-xs text-gray-400 text-center sm:text-left">
                © 2026 Federación de Estudiantes Universidad Católica de la
                Santísima Concepción.
              </p>
              <a
                href="https://instagram.com/feucsc_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Instagram de FEUCSC"
              >
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
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
