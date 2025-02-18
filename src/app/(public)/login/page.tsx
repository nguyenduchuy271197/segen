"use client";

import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function LoginPage() {
  const supabase = createClient();

  return (
    <div className="max-w-[350px] mx-auto p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Đăng Nhập</h1>
        <p className="text-muted-foreground">
          Đăng nhập để bắt đầu tạo series của bạn
        </p>
      </div>

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
  );
}
