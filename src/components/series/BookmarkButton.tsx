"use client";

import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmark } from "@/hooks/use-bookmark";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BookmarkButtonProps {
  episodeId: string;
  seriesId: string;
  className?: string;
}

export function BookmarkButton({
  episodeId,
  seriesId,
  className,
}: BookmarkButtonProps) {
  const { toast } = useToast();
  const { isBookmarked, isLoading, toggleBookmark } = useBookmark(
    episodeId,
    seriesId,
    {
      onSuccess: (isBookmarked) => {
        toast({
          title: isBookmarked ? "Đã lưu bài học" : "Đã bỏ lưu bài học",
          description: isBookmarked
            ? "Bạn có thể xem lại trong mục Bookmarks"
            : "Bài học đã được xóa khỏi mục Bookmarks",
        });
      },
      onError: () => {
        toast({
          title: "Lỗi",
          description: "Không thể thực hiện thao tác. Vui lòng thử lại.",
          variant: "destructive",
        });
      },
    }
  );

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleBookmark}
      disabled={isLoading}
      className={cn("relative", className)}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-5 w-5 text-primary transition-colors" />
      ) : (
        <Bookmark className="h-5 w-5 transition-colors" />
      )}
      <span className="sr-only">
        {isBookmarked ? "Remove bookmark" : "Add bookmark"}
      </span>
    </Button>
  );
}
