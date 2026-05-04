"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/public/Sidebar";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const noSidebarPaths = ["/login", "/auth/callback", "/admin"];
  if (noSidebarPaths.includes(pathname)) return null;
  return <Sidebar />;
}
