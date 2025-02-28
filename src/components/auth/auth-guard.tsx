"use client";

import { useAuth } from "@/lib/supabase/provider";
import { LoadingPage } from "../ui/loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
