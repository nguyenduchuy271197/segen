"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Home,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/provider";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Skeleton } from "./skeleton";
import { Logo } from "@/components/ui/logo";

interface AppSidebarProps {
  className?: string;
}

export const AppSidebar = forwardRef<
  { toggleSidebar: () => void },
  AppSidebarProps
>(({ className }, ref) => {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar_collapsed");
    if (savedState) {
      setCollapsed(savedState === "true");
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", collapsed.toString());
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Expose the toggleSidebar function via ref
  useImperativeHandle(ref, () => ({
    toggleSidebar,
  }));

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navItems = [
    {
      name: "Trang chủ",
      href: "/",
      icon: Home,
      public: true,
    },
    {
      name: "Khám phá",
      href: "/explore",
      icon: Search,
      public: true,
    },
    {
      name: "Series của tôi",
      href: "/series",
      icon: BookOpen,
      public: false,
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: Bookmark,
      public: false,
    },
    {
      name: "Đã mua",
      href: "/purchases",
      icon: ShoppingBag,
      public: false,
    },
    {
      name: "Hồ sơ",
      href: "/profile",
      icon: User,
      public: false,
    },
  ];

  // Render loading skeletons
  const renderSkeletons = () => {
    return (
      <>
        {navItems.slice(0, 6).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 py-2 rounded-md",
              collapsed ? "justify-center px-2" : "px-3"
            )}
          >
            <Skeleton className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <Skeleton className="h-4 w-24" />}
          </div>
        ))}
      </>
    );
  };

  return (
    <aside
      className={cn(
        "border-r h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col h-full py-4 bg-sidebar-background text-sidebar-foreground">
        <div className={cn("mb-6", collapsed ? "px-3 text-center" : "px-6")}>
          {collapsed ? (
            <Link href="/">
              <div className="text-lg text-primary-foreground bg-primary rounded-md px-2 py-1">
                S
              </div>
            </Link>
          ) : (
            <Logo size="md" />
          )}
        </div>

        <nav className="space-y-1 flex-1 px-3">
          <TooltipProvider>
            {isLoading ? (
              renderSkeletons()
            ) : (
              <>
                {navItems
                  .filter((item) => item.public || user)
                  .map((item) => (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 py-2 rounded-md text-sm transition-colors",
                            collapsed ? "justify-center px-2" : "px-3",
                            isActive(item.href)
                              ? "bg-sidebar-accent text-sidebar-primary font-medium"
                              : "hover:bg-sidebar-accent/50"
                          )}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && <span>{item.name}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent side="right">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
              </>
            )}
          </TooltipProvider>
        </nav>
      </div>
    </aside>
  );
});

AppSidebar.displayName = "AppSidebar";
