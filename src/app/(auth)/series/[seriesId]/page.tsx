import { createClient } from "@/lib/supabase/server";
import { EpisodeForm } from "@/components/series/EpisodeForm";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import type { Episode, Like } from "@/types/database";
import { VisibilityToggle } from "@/components/series/VisibilityToggle";
import { ReportButton } from "@/components/series/ReportButton";
import Link from "next/link";
import { incrementSeriesView } from "@/lib/views";
import { PriceEditForm } from "@/components/series/PriceEditForm";
import { PurchaseButton } from "@/components/series/PurchaseButton";

export default async function SeriesDetailPage({
  params,
}: {
  params: { seriesId: string };
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Increment view count
  await incrementSeriesView(params.seriesId, user?.id);

  // Get series data with tags
  // Update the series query to include profile information
  const { data: series } = await supabase
    .from("series")
    .select(
      `
      *,
      profiles (
        full_name,
        avatar_url
      ),
      series_tags (
        tags (
          id,
          name
        )
      )
    `
    )
    .eq("id", params.seriesId)
    .single();

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

  const isOwner = user?.id === series?.user_id;

  const userLike = likes?.find((like) => like.user_id === user?.id);

  // Check if user has purchased the series
  const { data: purchase } = user?.id
    ? await supabase
        .from("purchases")
        .select()
        .eq("series_id", params.seriesId)
        .eq("user_id", user.id)
        .single()
    : { data: null };

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
    <div className="flex gap-6">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{series.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{series.view_count || 0} lượt xem</span>
                  <div className="mt-2">
                    <Link
                      href={`/profile/${series.user_id}`}
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      Tạo bởi {series.profiles?.full_name || "Unnamed User"}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {isOwner ? (
                  <VisibilityToggle
                    seriesId={series.id}
                    initialIsPublic={series.is_public ?? false}
                  />
                ) : (
                  <div className="flex items-center gap-4">
                    <ReportButton seriesId={series.id} />
                    {(series.price ?? 0) > 0 && (
                      <PurchaseButton
                        seriesId={series.id}
                        price={series.price || 0}
                        isPurchased={!!purchase}
                      />
                    )}
                  </div>
                )}
                <LikeButton
                  seriesId={series.id}
                  seriesOwnerId={series.user_id}
                  seriesTitle={series.title}
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
                      <p className="text-muted-foreground">
                        {episode.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            )}
          </div>

          <div className="border-t pt-8">
            <CommentSection
              seriesId={series.id}
              seriesTitle={series.title}
              seriesOwnerId={series.user_id}
              initialComments={comments ?? []}
            />
          </div>
        </div>
      </main>

      {isOwner && (
        <aside className="w-80 space-y-6">
          <PriceEditForm seriesId={series.id} initialPrice={series.price} />
        </aside>
      )}
    </div>
  );
}
