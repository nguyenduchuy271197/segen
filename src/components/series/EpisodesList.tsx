import { EpisodeCard } from "@/components/ui/episode-card";
import { cn } from "@/lib/utils";
import { EpisodeForm } from "./EpisodeForm";
import type { Episode } from "@/types/database";

interface EpisodesListProps {
  episodes: Episode[];
  seriesId: string;
  isOwner: boolean;
  hasAccess: boolean;
  className?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function EpisodesList({
  episodes,
  seriesId,
  isOwner,
  hasAccess,
  className,
  emptyMessage = "Chưa có bài học nào",
  emptyAction,
}: EpisodesListProps) {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-card">
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {episodes.map((episode) =>
        isOwner ? (
          <EpisodeForm key={episode.id} episode={episode} seriesId={seriesId} />
        ) : (
          <EpisodeCard
            key={episode.id}
            id={episode.id}
            seriesId={seriesId}
            title={episode.title}
            description={episode.description}
            orderNumber={episode.order_number}
            isPreview={episode.is_preview}
            hasAccess={isOwner || hasAccess}
          />
        )
      )}
    </div>
  );
}
