"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import { useToast } from "@/hooks/use-toast";

interface LikeButtonProps {
  seriesId: string;
  seriesOwnerId: string;
  seriesTitle: string;
  initialLiked: boolean;
  likeCount: number;
}

export function LikeButton({
  seriesId,
  seriesOwnerId,
  seriesTitle,
  initialLiked,
  likeCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Đăng nhập để thích",
        description: "Vui lòng đăng nhập để thích series này",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("series_id", seriesId)
          .eq("user_id", user.id);
        setCount((prev) => prev - 1);
      } else {
        // Create like
        const { error: likeError } = await supabase.from("likes").insert({
          series_id: seriesId,
          user_id: user.id,
        });

        if (likeError) throw likeError;

        // Create notification only if we have seriesOwnerId and it's not the same as current user
        if (seriesOwnerId && seriesOwnerId !== user.id) {
          const { error: notificationError } = await supabase
            .from("notifications")
            .insert({
              user_id: seriesOwnerId,
              type: "like_series",
              data: {
                series_id: seriesId,
                series_title: seriesTitle,
                actor_id: user.id,
                actor_name: user.user_metadata?.full_name || user.email,
              },
              is_read: false,
            });

          if (notificationError) {
            console.error("Failed to create notification:", notificationError);
          }
        }

        setCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      className="flex items-center gap-2"
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`}
      />
      <span>{count}</span>
    </Button>
  );
}
