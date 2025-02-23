"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  targetUserName: string;
  initialIsFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  targetUserName,
  initialIsFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { user } = useAuth();
  const supabase = createClient();
  const { toast } = useToast();

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Đăng nhập để theo dõi",
        description: `Vui lòng đăng nhập để theo dõi ${targetUserName}`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);

        toast({
          description: `Đã hủy theo dõi ${targetUserName}`,
        });
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

        // Create notification
        if (targetUserId !== user.id) {
          await supabase.from("notifications").insert({
            user_id: targetUserId,
            type: "follow",
            data: {
              follower_id: user.id,
              follower_name: user.user_metadata?.full_name || user.email,
              target_name: targetUserName,
            },
            is_read: false,
          });
        }

        toast({
          description: `Đã theo dõi ${targetUserName}`,
        });
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Lỗi",
        description: `Không thể ${
          isFollowing ? "hủy theo dõi" : "theo dõi"
        } ${targetUserName}. Vui lòng thử lại sau.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      onClick={handleFollow}
    >
      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
    </Button>
  );
}
