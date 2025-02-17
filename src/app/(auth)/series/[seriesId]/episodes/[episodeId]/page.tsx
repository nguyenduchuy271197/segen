import { createClient } from "@/lib/supabase/server";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error";
import { MarkdownContent } from "@/components/ui/markdown";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Series, Episode } from "@/types/database";
import { EpisodeForm } from "@/components/series/EpisodeForm";

async function EpisodeContent({
  seriesId,
  episodeId,
}: {
  seriesId: string;
  episodeId: string;
}) {
  const supabase = await createClient();

  const { data: series } = await supabase
    .from("series")
    .select()
    .eq("id", seriesId)
    .single<Series>();

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

  return (
    <div className="max-w-4xl mx-auto p-8">
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
        <div>
          <h1 className="text-3xl font-bold mb-2">{episode.title}</h1>
          <p className="text-muted-foreground mb-2">
            Bài {episode.order_number} của {series.title}
          </p>
          {episode.description && (
            <p className="text-muted-foreground">{episode.description}</p>
          )}
        </div>

        {episode.content ? (
          <div className="bg-card rounded-lg p-8 shadow-sm">
            <MarkdownContent content={episode.content} />
            {isOwner && (
              <div className="mt-4 border-t pt-4">
                <EpisodeForm episode={episode} seriesId={seriesId} />
              </div>
            )}
          </div>
        ) : isOwner ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">Chưa có nội dung.</p>
            <EpisodeForm episode={episode} seriesId={seriesId} />
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              Nội dung này chưa được tạo bởi người sở hữu.
            </p>
          </div>
        )}
      </div>
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
      <EpisodeContent seriesId={params.seriesId} episodeId={params.episodeId} />
    </Suspense>
  );
}
