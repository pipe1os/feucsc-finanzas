import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { DotPattern } from "@/components/ui/dot-pattern";

import { Outfit } from "next/font/google";

const outfitSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans-next",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading-next",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
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
    <html lang="es" suppressHydrationWarning>
      <body className={`antialiased bg-transparent text-foreground font-sans ${outfitSans.variable} ${outfitHeading.variable}`}>
        <div className="fixed inset-0 -z-10 bg-bg-secondary" />
        <DotPattern className="fixed inset-0 -z-10 text-neutral-400/15 dark:text-neutral-600/15" />
        <Providers>
          <div className="flex min-h-dvh bg-transparent">
            {children}
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
