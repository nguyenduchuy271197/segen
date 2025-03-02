"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Github, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthError = {
  message: string;
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);
  const router = useRouter() // eslint-disable-line @typescript-eslint/no-unused-vars
  const { toast } = useToast();
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setIsMagicLinkSent(true);
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Lỗi đăng nhập",
        description: authError.message || "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      const authError = error as AuthError;
      toast({
        title: "Lỗi đăng nhập",
        description: authError.message || "Đã có lỗi xảy ra",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (isMagicLinkSent) {
    return (
      <div className="bg-muted/50 p-6 rounded-lg text-center space-y-4">
        <h3 className="font-medium text-lg">Kiểm tra email của bạn</h3>
        <p className="text-muted-foreground">
          Chúng tôi đã gửi một liên kết đăng nhập đến {email}. Vui lòng kiểm tra
          hộp thư đến của bạn và nhấp vào liên kết để đăng nhập.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => setIsMagicLinkSent(false)}
        >
          Thử lại với email khác
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleEmailLogin}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="edu-input"
              required
            />
          </div>
          <Button disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng nhập với Email"
            )}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={handleGithubLogin}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Github className="mr-2 h-4 w-4" />
        )}
        Github
      </Button>
    </div>
  );
} 