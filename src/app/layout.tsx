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
        <meta name="color-scheme" content="light dark" />
        {}
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
        {}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem("theme"),d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d){var h=document.documentElement;h.classList.add("dark");h.style.background="#141414";h.style.colorScheme="dark";var o=new MutationObserver(function(){if(!h.classList.contains("dark")){h.classList.add("dark")}});o.observe(h,{attributes:true,attributeFilter:["class"]});setTimeout(function(){o.disconnect()},3000)}}catch(e){}})()` }} />
        <style>{`body{background:transparent}html{background:#f5f5f7;color-scheme:light}html.dark{background:#141414;color-scheme:dark;color:#f5f5f7}@media(prefers-color-scheme:dark){html:not(.light){background:#141414;color-scheme:dark;color:#f5f5f7}}`}</style>
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
