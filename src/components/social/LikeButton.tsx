"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, HeartOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import { useToast } from "@/hooks/use-toast";

interface LikeButtonProps {
  seriesId: string;
  initialLiked?: boolean;
  likeCount: number;
}

export function LikeButton({
  seriesId,
  initialLiked = false,
  likeCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(likeCount);
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

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
        await supabase.from("likes").insert({
          series_id: seriesId,
          user_id: user.id,
        });
        setCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
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
      {isLiked ? (
        <Heart className="w-4 h-4 fill-current text-red-500" />
      ) : (
        <HeartOff className="w-4 h-4" />
      )}
      <span>{count}</span>
    </Button>
  );
}
