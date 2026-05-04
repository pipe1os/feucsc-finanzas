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
        {/* Critical FOUC prevention: blocks rendering until correct theme is applied.
            1. The <script> runs synchronously before first paint.
            2. It reads localStorage('theme') and matchMedia to determine dark/light.
            3. It sets the .dark class, background-color, and color-scheme on <html>
               all in one shot — no intermediate light frame is ever visible.
            Must stay in sync with next-themes config
            (storageKey='theme', attribute='class', defaultTheme='system'). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,t=localStorage.getItem('theme'),isDark=t==='dark'||(t!=='light'&&(t==='system'||!t)&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(isDark){d.classList.add('dark');d.style.colorScheme='dark';d.style.background='#141414'}else{d.style.colorScheme='light';d.style.background='#f5f5f7'}}catch(e){document.documentElement.style.colorScheme='light';document.documentElement.style.background='#f5f5f7'}})()`,
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
