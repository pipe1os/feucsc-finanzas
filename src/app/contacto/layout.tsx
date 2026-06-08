import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | FEUCSC",
  description: "Ponte en contacto con la Federación de Estudiantes UCSC.",
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
