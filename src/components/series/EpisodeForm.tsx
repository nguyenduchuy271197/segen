"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Episode } from "@/types/database";
import { ErrorMessage } from "@/components/ui/error";
import { LoadingSpinner } from "../ui/loading";
import { RefreshCw, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EpisodeFormProps {
  episode: Episode;
  seriesId: string;
}

export function EpisodeForm({ episode, seriesId }: EpisodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

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

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      href={`/series/${seriesId}/episodes/${episode.id}`}
      className="block group"
    >
      <div className="border rounded-lg p-4 lg:p-6 hover:shadow-lg transition-all space-y-4">
        <div>
          <div className="flex justify-between items-center gap-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs lg:text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                  Bài {episode.order_number}
                </span>
                <h3 className="lg:text-lg font-medium group-hover:text-primary">
                  {episode.title}
                </h3>
              </div>
              {episode.description && (
                <p className="text-sm lg:text-base mt-2 text-muted-foreground">
                  {episode.description}
                </p>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleGenerate();
                    }}
                    disabled={isLoading}
                    variant={episode.content ? "outline" : "success"}
                    size="icon"
                    className="w-10 h-10 lg:w-12 shrink-0"
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : episode.content ? (
                      <RefreshCw />
                    ) : (
                      <Sparkles />
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

        {error && (
          <ErrorMessage
            message={error}
            retry={() => {
              setError(null);
              handleGenerate();
            }}
          />
        )}
      </div>
    </Link>
  );
}
