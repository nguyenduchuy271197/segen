"use client";

import { useAuth } from "@/lib/supabase/provider";
import { LoadingPage } from "../ui/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
