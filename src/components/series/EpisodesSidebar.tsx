"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Episode } from "@/types/database";
import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle2, Lock } from "lucide-react";

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
  // Sort episodes by order_number
  const sortedEpisodes = [...episodes].sort(
    (a, b) => a.order_number - b.order_number
  );

  return (
    <Card className={cn("overflow-y-auto", className)}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <BookOpen className="h-4 w-4" />
          <h4 className="text-sm font-medium">Danh Sách Bài Học</h4>
        </div>

        <nav className="space-y-2">
          {sortedEpisodes.map((episode) => {
            const isActive = episode.id === currentEpisodeId;

            return (
              <Link
                key={episode.id}
                href={`/series/${seriesId}/episodes/${episode.id}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors relative group",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  {isActive ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">
                      {episode.order_number}
                    </span>
                  )}
                </div>

                <span className="flex-1 truncate">{episode.title}</span>

                {!episode.is_preview && (
                  <Lock className="h-3 w-3 opacity-50 flex-shrink-0" />
                )}

                {/* Progress indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-50 transition-opacity rounded-l-md"></div>
              </Link>
            );
          })}
        </nav>
      </div>
    </Card>
  );
}
