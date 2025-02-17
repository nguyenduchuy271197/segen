"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Episode } from "@/types/database";
import { ErrorMessage } from "@/components/ui/error";
import { LoadingSpinner } from "../ui/loading";

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
      <div className="border rounded-lg p-6 hover:shadow-lg transition-all space-y-4">
        <div>
          <h3 className="text-lg font-medium group-hover:text-primary">
            {episode.title}
          </h3>
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
