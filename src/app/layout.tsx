import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FEUCSC - Federacion de Estudiantes UCSC",
  description:
    "Portal público de transparencia financiera de la Federación de Estudiantes de la Universidad Católica de la Santísima Concepción.",
  keywords: ["FEUCSC", "UCSC"],
  appleWebApp: {
    title: "FEUCSC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
