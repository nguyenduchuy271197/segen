"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import { useToast } from "@/hooks/use-toast";
import type { Comment } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentWithProfile extends Comment {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  seriesId: string;
  initialComments: CommentWithProfile[];
}

export function CommentSection({
  seriesId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] =
    useState<CommentWithProfile[]>(initialComments);
  const [content, setContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: newComment, error } = await supabase
        .from("comments")
        .insert({
          series_id: seriesId,
          user_id: user.id,
          content,
        })
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) throw error;

      setComments([...comments, newComment]);
      setContent("");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Bình luận</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          className="w-full min-h-[100px] p-2 border rounded-md"
          required
        />
        <Button type="submit" disabled={!user}>
          Đăng bình luận
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 border rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarImage src={comment.profiles?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {comment.profiles?.full_name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {comment.profiles?.full_name ?? "Anonymous"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
