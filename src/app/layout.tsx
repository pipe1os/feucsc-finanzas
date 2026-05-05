import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { DotPattern } from "@/components/ui/dot-pattern";
import SidebarWrapper from "@/components/SidebarWrapper";
import MainWrapper from "@/components/MainWrapper";

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
      <head>
        {/* Preload critical fonts to eliminate render-blocking and improve LCP */}
        <link
          rel="preload"
          href="/fonts/SF-Pro-Text-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SF-Pro-Display-Semibold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SF-Pro-Display-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* ── FOUC prevention (production-safe) ────────────────────────
            Problem: In production, Tailwind CSS is an external file. Before
            it loads, <body> has the browser-default white background because
            the `bg-transparent` class doesn't exist yet. Additionally, React
            hydration can briefly strip the `.dark` class from <html> before
            next-themes re-adds it.

            Solution (2 layers):
            1. Inline <style> — sets body transparent + html theme backgrounds
               so the correct color shows even before external CSS loads.
            2. Inline <script> — reads localStorage/matchMedia and adds .dark
               class + inline style.background, all synchronously in <head>.

            Must stay in sync with next-themes config
            (storageKey='theme', attribute='class', defaultTheme='system'). */}
        <style>{`body{background:transparent}html{background:#f5f5f7;color-scheme:light}html.dark{background:#141414;color-scheme:dark;color:#f5f5f7}`}</style>
        <script>{`(function(){try{var d=document.documentElement,t=localStorage.getItem('theme'),isDark=t==='dark'||(t!=='light'&&(t==='system'||!t)&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(isDark){d.classList.add('dark');d.style.colorScheme='dark';d.style.background='#141414'}else{d.style.colorScheme='light';d.style.background='#f5f5f7'}}catch(e){d.style.colorScheme='light';d.style.background='#f5f5f7'}})()`}</script>
      </head>
      <body className="antialiased bg-transparent text-foreground font-sans">
        <div className="fixed inset-0 -z-10 bg-bg-secondary" />
        <DotPattern className="fixed inset-0 -z-10 text-neutral-400/15 dark:text-neutral-600/15" />
        <Providers>
          <div className="flex min-h-dvh bg-transparent">
            <SidebarWrapper />
            <MainWrapper>
              {children}
            </MainWrapper>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
