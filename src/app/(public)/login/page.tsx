"use client";

import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();

  return (
    <div className="max-w-[400px] mx-auto p-8 mt-12">
      <div className="mb-6">
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay Lại Trang Chủ
        </Link>
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Đăng Nhập</h1>
        <p className="text-muted-foreground">
          Đăng nhập để bắt đầu tạo series của bạn
        </p>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "hsl(var(--primary))",
                  brandAccent: "hsl(var(--primary))",
                },
              },
            },
            style: {
              button: {
                borderRadius: "0.375rem",
                height: "40px",
              },
              input: {
                borderRadius: "0.375rem",
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Mật khẩu",
                button_label: "Đăng nhập",
                social_provider_text: "Đăng nhập với {{provider}}",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Mật khẩu",
                button_label: "Đăng ký",
                social_provider_text: "Đăng nhập với {{provider}}",
              },
            },
          }}
          providers={["google"]}
          view="sign_in"
        />
      </div>
    </div>
  );
}
