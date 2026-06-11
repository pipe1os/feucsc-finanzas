import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { DotPattern } from "@/components/ui/dot-pattern";
import SidebarWrapper from "@/components/SidebarWrapper";
import MainWrapper from "@/components/MainWrapper";
import Script from "next/script";

const sfProDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/SF-Pro-Display-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Display-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-heading",
  display: "swap",
});

const sfProText = localFont({
  src: [
    {
      path: "../../public/fonts/SF-Pro-Text-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Text-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Text-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Text-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/SF-Pro-Text-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
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
      <head>
        <meta name="color-scheme" content="light dark" />
        <Script id="theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem("theme"),d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d){var h=document.documentElement;h.classList.add("dark");h.style.background="#141414";h.style.colorScheme="dark";var o=new MutationObserver(function(){if(!h.classList.contains("dark")){h.classList.add("dark")}});o.observe(h,{attributes:true,attributeFilter:["class"]});setTimeout(function(){o.disconnect()},3000)}}catch(e){}})()`}</Script>
        <style>{`body{background:transparent}html{background:#f5f5f7;color-scheme:light}html.dark{background:#141414;color-scheme:dark;color:#f5f5f7}@media(prefers-color-scheme:dark){html:not(.light){background:#141414;color-scheme:dark;color:#f5f5f7}}`}</style>
      </head>
      <body className={`antialiased bg-transparent text-foreground font-sans ${sfProText.variable} ${sfProDisplay.variable}`}>
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
