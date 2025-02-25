import { createClient } from "@/lib/supabase/server";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import type { Series, Episode } from "@/types/database";
import { EpisodeContent } from "@/components/series/EpisodeContent";
import { EpisodeView } from "@/components/series/EpisodeView";
import { EpisodesSidebar } from "@/components/series/EpisodesSidebar";
import { TableOfContents } from "@/components/series/TableOfContents";
import { BookmarkButton } from "@/components/series/BookmarkButton";

async function Episode({
  seriesId,
  episodeId,
}: {
  seriesId: string;
  episodeId: string;
}) {
  const supabase = await createClient();

  const { data: series } = await supabase
    .from("series")
    .select(
      `
      *,
      episodes (
        id,
        title,
        order_number,
        is_preview
      )
    `
    )
    .eq("id", seriesId)
    .single<Series & { episodes: Episode[] }>();

  const { data: episode } = await supabase
    .from("episodes")
    .select()
    .eq("id", episodeId)
    .single<Episode>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === series?.user_id;

  if (!series || !episode) {
    return <ErrorMessage message="Không tìm thấy bài học" />;
  }

  // Check if user has access to this episode
  const hasAccess = isOwner || episode.is_preview;

  return (
    <div className="flex gap-6 px-4">
      <EpisodesSidebar
        seriesId={seriesId}
        currentEpisodeId={episodeId}
        episodes={series?.episodes || []}
        className="w-64 shrink-0 sticky top-4 h-[calc(100vh-2rem)]"
      />

      <div className="flex-1 max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/series/${seriesId}`}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay Lại Series
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{episode.title}</h1>
            <BookmarkButton episodeId={episodeId} seriesId={seriesId} />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">{episode.title}</h1>
            <p className="text-muted-foreground mb-2">
              Bài {episode.order_number} của {series.title}
            </p>
            {episode.description && (
              <p className="text-muted-foreground">{episode.description}</p>
            )}
          </div>

          {!hasAccess ? (
            <div className="text-center py-12 border rounded-lg">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Nội dung này đã bị khoá.
              </p>
              <p className="text-sm text-muted-foreground">
                Bạn cần mua series này để xem nội dung.
              </p>
            </div>
          ) : episode.content ? (
            <EpisodeView
              seriesId={seriesId}
              content={episode.content}
              isOwner={isOwner}
              episodeId={episodeId}
            />
          ) : isOwner ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">Chưa có nội dung.</p>
              <EpisodeContent
                content=""
                isEditable={true}
                episodeId={episodeId}
              />
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">Chưa có nội dung.</p>
            </div>
          )}
        </div>
      </div>

      <TableOfContents
        content={episode.content || ""}
        className="w-64 shrink-0 sticky top-4 h-[calc(100vh-2rem)]"
      />
    </div>
  );
}

export default function EpisodePage({
  params,
}: {
  params: { seriesId: string; episodeId: string };
}) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Episode seriesId={params.seriesId} episodeId={params.episodeId} />
    </Suspense>
  );
}
