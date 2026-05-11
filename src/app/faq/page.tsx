import FAQContent from "@/components/public/FAQContent";
import Footer from "@/components/public/Footer";
import Link from "next/link";

export const metadata = {
  title: "Preguntas Frecuentes | FEUCSC",
  description:
    "Respuestas a las preguntas más frecuentes sobre la transparencia financiera de la Federación de Estudiantes UCSC.",
};

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-16 pb-4 sm:px-6 lg:px-10 lg:pt-10 lg:pb-4">
      {}
      <header className="mb-8 animate-fade-in-up opacity-0">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white font-heading">
          Preguntas Frecuentes
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
          Respuestas a las preguntas más frecuentes sobre la FEUCSC.
        </p>
      </header>

      {}
      <FAQContent />

      {}
      <section
        className="mt-12 mb-0 text-center animate-fade-in-up opacity-0"
        style={{ animationDelay: "0.4s" }}
      >
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white leading-snug font-heading">
          ¿Tienes otra duda?{" "}
          <Link
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
          </Link>
        </h2>
      </section>

      {}
      <Footer />
    </div>
  );
}
