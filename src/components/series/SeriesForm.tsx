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

const formSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: "Tiêu đề phải có ít nhất 5 ký tự",
    })
    .max(100, {
      message: "Tiêu đề không được vượt quá 100 ký tự",
    }),
  description: z
    .string()
    .min(10, {
      message: "Mô tả phải có ít nhất 10 ký tự",
    })
    .max(500, {
      message: "Mô tả không được vượt quá 500 ký tự",
    }),
});

export function SeriesForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Lỗi xác thực",
          description: "Bạn cần đăng nhập để tạo series",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("series")
        .insert({
          title: values.title,
          description: values.description,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Series đã được tạo",
        description: "Bạn có thể bắt đầu thêm bài học vào series",
      });

      router.push(`/series/${data.id}`);
    } catch (error: unknown) {
      const err = error as { message: string };
      toast({
        title: "Lỗi khi tạo series",
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tiêu đề series"
                  className="edu-input"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tiêu đề ngắn gọn, hấp dẫn cho series của bạn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết về series"
                  className="edu-input min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Mô tả ngắn gọn về nội dung và mục tiêu của series
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo Series"
          )}
        </Button>
      </form>
    </Form>
  );
}
