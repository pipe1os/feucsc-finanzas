import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Resumen" },
  { href: "/gastos", label: "Gastos" },
  { href: "/faq", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
];

export default function Footer() {
  return (
    <footer className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
      <nav aria-label="Navegación del pie de página" className="flex justify-center gap-6 mb-4">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors duration-200"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex justify-center items-center mb-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          &copy; 2026 Federaci&oacute;n de Estudiantes Universidad Cat&oacute;lica de
          la Sant&iacute;sima Concepci&oacute;n.
        </p>
      </div>
    </footer>
  );
}
