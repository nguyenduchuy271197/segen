"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import { Button } from "./button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { NotificationDropdown } from "../notifications/NotificationDropdown";

export function Nav() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            EduSeries
          </Link>
          <Link
            href="/explore"
            className="ml-8 flex items-center text-muted-foreground hover:text-foreground"
          >
            Khám phá
          </Link>
          {user && (
            <>
              <Link
                href="/series"
                className="text-muted-foreground hover:text-foreground"
              >
                Series Của Bạn
              </Link>
              <Link
                href="/purchases"
                className="text-muted-foreground hover:text-foreground"
              >
                Series Đã Mua
              </Link>
              <Link
                href="/bookmarks"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <Link href="/profile" className="hover:text-primary">
              Trang cá nhân
            </Link>
            <Button variant="ghost" onClick={handleSignOut}>
              Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
