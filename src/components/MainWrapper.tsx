"use client";

import { usePathname } from "next/navigation";

const noSidebarPaths = ["/login", "/auth/callback", "/admin"];

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebar = !noSidebarPaths.includes(pathname);

  return (
    <main className={`flex-1 min-w-0 ${hasSidebar ? "lg:ml-65" : ""}`}>
      {children}
    </main>
  );
}
