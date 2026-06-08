"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/public/Sidebar";

const noSidebarPaths = ["/login", "/auth/callback", "/admin"];

export default function SidebarWrapper() {
  const pathname = usePathname();
  if (noSidebarPaths.includes(pathname)) return null;
  return <Sidebar />;
}
