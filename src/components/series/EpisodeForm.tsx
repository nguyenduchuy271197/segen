"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Episode } from "@/types/database";
import { ErrorMessage } from "@/components/ui/error";
import { LoadingSpinner } from "../ui/loading";
import { createClient } from "@/lib/supabase/client";

interface EpisodeFormProps {
  episode: Episode;
  seriesId: string;
}

export function EpisodeForm({ episode, seriesId }: EpisodeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(episode.is_preview ?? false);

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

  const togglePreview = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("episodes")
        .update({ is_preview: !isPreview })
        .eq("id", episode.id);

      if (error) throw error;
      setIsPreview(!isPreview);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái xem trước"
      );
    }
  };

  return (
    <Link
      href={`/series/${seriesId}/episodes/${episode.id}`}
      className="block group"
    >
      <div className="border rounded-lg p-6 hover:shadow-lg transition-all space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium group-hover:text-primary">
              {episode.title}
            </h3>
            <Button
              onClick={togglePreview}
              variant="ghost"
              size="sm"
              className={isPreview ? "text-green-600" : "text-gray-500"}
            >
              {isPreview ? "Cho phép xem trước" : "Khoá xem trước"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Bài {episode.order_number}
          </p>
          {episode.description && (
            <p className="mt-2 text-muted-foreground">{episode.description}</p>
          )}
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

        <div className="space-y-2">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            disabled={isLoading}
            className="w-full"
            variant={episode.content ? "outline" : "default"}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Đang tạo...
              </span>
            ) : episode.content ? (
              "Tạo Lại Nội Dung"
            ) : (
              "Tạo Nội Dung"
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
