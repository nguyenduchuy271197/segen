"use client";

import { useRef } from "react";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { Navbar } from "@/components/ui/navbar";
import { MobileNav } from "@/components/ui/mobile-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const sidebarRef = useRef<{ toggleSidebar: () => void } | null>(null);

  const handleToggleSidebar = () => {
    if (sidebarRef.current) {
      sidebarRef.current.toggleSidebar();
    }
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar className="hidden md:block" ref={sidebarRef} />
      <div className="flex-1 flex flex-col">
        <div className="hidden md:block">
          <Navbar onToggleSidebar={handleToggleSidebar} />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
