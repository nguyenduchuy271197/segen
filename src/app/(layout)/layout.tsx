import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layouts/AppLayout";
import { AuthProvider } from "@/lib/supabase/provider";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
      <Toaster />
    </AuthProvider>
  );
}
