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
  GraduationCap,
  ChevronLeft,
  ChevronRight,
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
import { Button } from "./button";

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
        "border-r h-screen sticky top-0 transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col h-full py-4 bg-sidebar-background text-sidebar-foreground">
        <div
          className={cn(
            "mb-6 flex items-center justify-between",
            collapsed ? "px-3" : "px-6"
          )}
        >
          {collapsed ? (
            <Link href="/" className="mx-auto">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
            </Link>
          ) : (
            <Logo size="md" />
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "absolute -right-3 top-6 bg-background text-foreground border rounded-full shadow-sm h-6 w-6",
              collapsed ? "-right-3" : "-right-3"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
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
                            "flex items-center gap-3 py-2 rounded-lg text-sm",
                            collapsed ? "justify-center px-2" : "px-3",
                            isActive(item.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                              : "hover:bg-sidebar-accent/10 text-foreground"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "flex-shrink-0",
                              isActive(item.href) ? "h-5 w-5" : "h-5 w-5"
                            )}
                          />
                          {!collapsed && (
                            <span
                              className={cn(
                                isActive(item.href)
                                  ? "font-medium"
                                  : "text-foreground"
                              )}
                            >
                              {item.name}
                            </span>
                          )}
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

        {user && !collapsed && (
          <div className="px-6 mt-6">
            <div className="p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
});

AppSidebar.displayName = "AppSidebar";
