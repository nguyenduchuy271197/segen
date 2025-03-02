"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Episode } from "@/types/database";
import { Loader2, RefreshCw, Sparkles, Lock, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface EpisodeFormProps {
  episode: Episode;
  seriesId: string;
}

export function EpisodeForm({ episode, seriesId }: EpisodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(episode.is_preview);
  const { toast } = useToast();
  const supabase = createClient();

  const handleGenerate = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/generate-episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          episodeId: episode.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể tạo nội dung");
      }

      toast({
        title: "Tạo nội dung thành công",
        description: "Nội dung bài học đã được tạo",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "Lỗi khi tạo nội dung",
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreview = async () => {
    try {
      const { error } = await supabase
        .from("episodes")
        .update({ is_preview: !isPreview })
        .eq("id", episode.id);

      if (error) throw error;

      setIsPreview(!isPreview);

      toast({
        title: `Bài học đã được ${!isPreview ? "đặt" : "bỏ"} làm bài xem trước`,
        description: !isPreview
          ? "Người dùng có thể xem bài học này mà không cần mua series"
          : "Người dùng cần mua series để xem bài học này",
      });
    } catch (error) {
      toast({
        title: "Lỗi khi cập nhật trạng thái",
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:border-primary/20 bg-card">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary/10 text-primary w-8 h-8 rounded-lg flex items-center justify-center font-medium">
              {episode.order_number}
            </div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {episode.title}
            </h3>
            {isPreview && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              >
                Preview
              </Badge>
            )}
          </div>

          {episode.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm mb-4">
              {episode.description}
            </p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`preview-${episode.id}`}
                checked={isPreview || false}
                onCheckedChange={togglePreview}
              />
              <Label htmlFor={`preview-${episode.id}`} className="text-sm">
                Bài xem trước
              </Label>
            </div>

            <Link
              href={`/series/${seriesId}/episodes/${episode.id}`}
              className={cn(
                "text-sm font-medium flex items-center gap-1.5 text-primary hover:underline",
                !episode.content && "text-muted-foreground hover:text-primary"
              )}
            >
              {episode.content ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Xem bài học
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Chưa có nội dung
                </>
              )}
            </Link>
          </div>
        </div>

        <div className="flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  variant={episode.content ? "outline" : "default"}
                  size="icon"
                  className="w-10 h-10"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : episode.content ? (
                    <RefreshCw className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLoading
                  ? "Đang tạo..."
                  : episode.content
                  ? "Tạo lại nội dung"
                  : "Tạo nội dung"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
