"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, {
      message: "Tên phải có ít nhất 2 ký tự",
    })
    .max(50, {
      message: "Tên không được vượt quá 50 ký tự",
    }),
  bio: z
    .string()
    .max(500, {
      message: "Giới thiệu không được vượt quá 500 ký tự",
    })
    .optional(),
  website: z
    .string()
    .url({
      message: "Website phải là một URL hợp lệ",
    })
    .optional()
    .or(z.literal("")),
});

type ProfileData = {
  id: string;
  full_name: string | null | undefined;
  avatar_url: string | null | undefined;
  bio: string | null | undefined;
  created_at: string;
  updated_at: string;
};

interface ProfileFormProps {
  user: User;
  profile: ProfileData | null;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || user.user_metadata?.full_name || "",
      bio: profile?.bio || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: values.full_name,
        bio: values.bio,
        website: values.website,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Cập nhật hồ sơ thành công",
        description: "Thông tin hồ sơ của bạn đã được cập nhật",
      });

      router.refresh();
    } catch (error: unknown) {
      const err = error as { message: string };
      toast({
        title: "Lỗi khi cập nhật hồ sơ",
        description: err.message || "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập họ và tên của bạn"
                  className="edu-input"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tên của bạn sẽ được hiển thị công khai
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới thiệu</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Giới thiệu ngắn về bản thân"
                  className="edu-input min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Giới thiệu ngắn gọn về bản thân và chuyên môn của bạn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  className="edu-input"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Website cá nhân hoặc mạng xã hội của bạn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang cập nhật...
            </>
          ) : (
            "Cập nhật hồ sơ"
          )}
        </Button>
      </form>
    </Form>
  );
}
