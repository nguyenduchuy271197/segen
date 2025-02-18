"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Episode } from "@/types/database";

interface EpisodesSidebarProps {
  seriesId: string;
  currentEpisodeId: string;
  episodes: Episode[];
  className?: string;
}

export function EpisodesSidebar({
  seriesId,
  currentEpisodeId,
  episodes,
  className,
}: EpisodesSidebarProps) {
  return (
    <div className={cn("overflow-y-auto border-r", className)}>
      <div className="space-y-1 p-4">
        {episodes.map((episode) => (
          <Link
            key={episode.id}
            href={`/series/${seriesId}/episodes/${episode.id}`}
            className={cn(
              "block px-4 py-2 rounded-md text-sm transition-colors",
              episode.id === currentEpisodeId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {episode.order_number}. {episode.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
