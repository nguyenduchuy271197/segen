"use client";

import { useAuth } from "@/lib/supabase/provider";
import Link from "next/link";
import { Button } from "./button";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Menu,
  Search,
  User,
  BookOpen,
  Bookmark,
  ShoppingBag,
  PlusCircle,
} from "lucide-react";
import { Input } from "./input";
import { useState } from "react";
import { Skeleton } from "./skeleton";
import { LoginDialog } from "@/components/auth/login-dialog";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex-1 flex items-center">
          <div className="max-w-md w-full">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Tìm kiếm series, tác giả..."
                className="w-full pl-9 rounded-full border-primary/20 focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </form>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </>
          ) : user ? (
            <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="border-2 border-primary/20 cursor-pointer">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url}
                      alt={user.user_metadata?.full_name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Hồ sơ</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/series"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Series của tôi</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/series/new"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Tạo series mới</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/bookmarks"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>Bookmarks</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/purchases"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Đã mua</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <LoginDialog
              trigger={<Button variant="gradient">Đăng nhập</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
