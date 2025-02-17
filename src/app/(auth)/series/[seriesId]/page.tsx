import { createClient } from "@/lib/supabase/server";
import { EpisodeForm } from "@/components/series/EpisodeForm";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import type { Series, Episode, Like } from "@/types/database";
import { VisibilityToggle } from "@/components/series/VisibilityToggle";
import Link from "next/link";

export default async function SeriesDetailPage({
  params,
}: {
  params: { seriesId: string };
}) {
  const supabase = await createClient();

  // Get series data
  const { data: series } = await supabase
    .from("series")
    .select()
    .eq("id", params.seriesId)
    .single<Series>();

  // Get episodes
  const { data: episodes } = await supabase
    .from("episodes")
    .select()
    .eq("series_id", params.seriesId)
    .order("order_number")
    .returns<Episode[]>();

  // Get likes count and user's like status
  const { data: likes } = await supabase
    .from("likes")
    .select()
    .eq("series_id", params.seriesId)
    .returns<Like[]>();

  // Get current user and check ownership
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === series?.user_id;

  const userLike = likes?.find((like) => like.user_id === user?.id);

  // Get comments with profiles
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `
    )
    .eq("series_id", params.seriesId)
    .order("created_at", { ascending: false });

  if (!series || !episodes) {
    return <div>Series not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{series.title}</h1>
          <div className="flex items-center gap-4">
            {isOwner && (
              <VisibilityToggle
                seriesId={series.id}
                initialIsPublic={series.is_public ?? false}
              />
            )}
            <LikeButton
              seriesId={series.id}
              initialLiked={!!userLike}
              likeCount={likes?.length ?? 0}
            />
          </div>
        </div>
        <p className="text-gray-600">{series.description}</p>
      </div>

      <div className="space-y-8 mb-12">
        {episodes.map((episode) =>
          isOwner ? (
            <EpisodeForm
              key={episode.id}
              episode={episode}
              seriesId={series.id}
            />
          ) : (
            <Link
              key={episode.id}
              href={`/series/${series.id}/episodes/${episode.id}`}
              className="block group"
            >
              <div className="border rounded-lg p-6 hover:shadow-lg transition-all">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {episode.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Bài {episode.order_number}
                </p>
                {episode.description && (
                  <p className="text-muted-foreground">{episode.description}</p>
                )}
              </div>
            </Link>
          )
        )}
      </div>

      <div className="border-t pt-8">
        <CommentSection seriesId={series.id} initialComments={comments ?? []} />
      </div>
    </div>
  );
}
