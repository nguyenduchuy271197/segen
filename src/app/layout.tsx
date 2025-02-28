import { AuthProvider } from "@/lib/supabase/provider";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layouts/AppLayout";
import "./globals.css";
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

const nunitoSans = Nunito_Sans({ subsets: ["vietnamese"] });

export const metadata: Metadata = {
  title: "Segen",
  description: "Tạo Series Kiến Thức với AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={nunitoSans.className}>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
