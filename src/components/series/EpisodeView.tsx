"use client";

import { useState } from "react";
import { Eye, Edit, BookmarkPlus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EpisodeContent } from "./EpisodeContent";
import { BookmarkButton } from "./BookmarkButton";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EpisodeViewProps {
  content: string;
  isOwner: boolean;
  episodeId: string;
  seriesId: string;
}

export function EpisodeView({
  content,
  isOwner,
  episodeId,
  seriesId,
}: EpisodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Chia sẻ bài học này",
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Đã sao chép đường dẫn vào clipboard!"))
        .catch((err) => console.error("Could not copy text: ", err));
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/30 border-b px-6 py-3 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {isOwner && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2"
                  >
                    {isEditing ? (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Xem</span>
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        <span className="hidden sm:inline">Chỉnh sửa</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isEditing
                    ? "Chuyển sang chế độ xem"
                    : "Chuyển sang chế độ chỉnh sửa"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chia sẻ bài học</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <BookmarkButton episodeId={episodeId} seriesId={seriesId} />
        </div>
      </div>

      <div className="p-6">
        <EpisodeContent
          content={content}
          isEditable={isOwner && isEditing}
          episodeId={episodeId}
        />
      </div>
    </Card>
  );
}
