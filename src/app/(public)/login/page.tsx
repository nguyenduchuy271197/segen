import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/ui/logo";
import { GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Đăng nhập | EduSeries",
  description: "Đăng nhập vào tài khoản EduSeries của bạn",
};

export default function LoginPage() {
  return (
    <div className="container relative flex-col items-center justify-center min-h-screen grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-accent opacity-90" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo size="md" className="text-white" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;EduSeries đã giúp tôi học tập hiệu quả và chia sẻ kiến thức với cộng đồng một cách dễ dàng.&rdquo;
            </p>
            <footer className="text-sm">Nguyễn Văn A</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="mx-auto bg-primary/10 p-2 rounded-full mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Đăng nhập
            </h1>
            <p className="text-sm text-muted-foreground">
              Đăng nhập để truy cập vào tài khoản của bạn
            </p>
          </div>
          <LoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Điều khoản dịch vụ
            </a>{" "}
            và{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
