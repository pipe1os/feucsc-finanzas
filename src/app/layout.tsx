import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { DotPattern } from "@/components/ui/dot-pattern";
import Sidebar from "@/components/public/Sidebar";

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
      <head>
        <meta name="color-scheme" content="light dark" />
        {/* Inline critical background: prevents white flash before React hydrates */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { background-color: #f5f5f7; }
              html.dark { background-color: #141414; }
            `,
          }}
        />
        <script
          // Prevent FOUC: apply dark mode before first paint
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var shouldBeDark = false;
                  if (stored === 'dark') {
                    shouldBeDark = true;
                  } else if (stored === 'light') {
                    shouldBeDark = false;
                  } else if (stored === null || stored === undefined) {
                    shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-transparent text-foreground`}>
        <div className="fixed inset-0 -z-10 bg-bg-secondary" />
        <DotPattern className="fixed inset-0 -z-10 text-neutral-400/15 dark:text-neutral-600/15" />
        <Providers>
          <div className="flex min-h-dvh bg-transparent">
            <Sidebar />
            <main className="flex-1 min-w-0 lg:ml-65">
              {children}
            </main>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
