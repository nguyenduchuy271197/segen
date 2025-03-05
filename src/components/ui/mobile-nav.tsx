"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/provider";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Skeleton } from "./skeleton";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "./input";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const closeMenu = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    closeMenu();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      closeMenu();
    }
  };

  const navItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Khám phá", href: "/explore" },
    ...(user
      ? [
          { name: "Series của tôi", href: "/series" },
          { name: "Bookmarks", href: "/bookmarks" },
          { name: "Đã mua", href: "/purchases" },
          { name: "Hồ sơ", href: "/profile" },
        ]
      : []),
  ];

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
            <SheetHeader className="p-4 border-b">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.user_metadata?.full_name || "User"}
                    />
                    <AvatarFallback>
                      {user.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <SheetTitle className="text-left">
                      {user.user_metadata?.full_name || "User"}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <SheetTitle>
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="font-bold text-lg"
                  >
                    EduSeries
                  </Link>
                </SheetTitle>
              )}
            </SheetHeader>

            <div className="py-2">
              <nav className="flex flex-col">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "py-3 px-4 text-base",
                      pathname === item.href
                        ? "font-medium text-primary bg-primary/10 border-l-4 border-primary"
                        : "text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4 mt-2 border-t">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : !user ? (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-center"
                  >
                    Đăng nhập
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 mx-4">
          <form className="relative">
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-full pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e);
                }
              }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </form>
        </div>

        <div className="flex items-center">
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <NotificationDropdown />
          ) : (
            <Link href="/login">
              <Button size="sm" variant="gradient">
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
