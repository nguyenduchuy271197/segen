"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  BookOpen,
  Bookmark,
  Home,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/provider";

interface AppSidebarProps {
  className?: string;
}

export const AppSidebar = forwardRef<
  { toggleSidebar: () => void },
  AppSidebarProps
>(({ className }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useImperativeHandle(ref, () => ({
    toggleSidebar: () => setIsOpen(!isOpen),
  }));

  const navItems = [
    {
      name: "Trang chủ",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Khám phá",
      href: "/explore",
      icon: <Search className="h-5 w-5" />,
    },
    ...(user
      ? [
          {
            name: "Series của tôi",
            href: "/series",
            icon: <BookOpen className="h-5 w-5" />,
          },
          {
            name: "Đã mua",
            href: "/purchases",
            icon: <ShoppingBag className="h-5 w-5" />,
          },
          {
            name: "Đã lưu",
            href: "/bookmarks",
            icon: <Bookmark className="h-5 w-5" />,
          },
          {
            name: "Hồ sơ",
            href: "/profile",
            icon: <User className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-card border-r border-border flex-shrink-0 h-screen sticky top-0 transition-all duration-300 z-40",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <Logo size="sm" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>© 2023 EduSeries</p>
            <p>Phiên bản 1.0.0</p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 md:hidden z-50 rounded-full shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </aside>
  );
});

AppSidebar.displayName = "AppSidebar";
