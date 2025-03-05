import { createClient } from "@/lib/supabase/server";
import { LikeButton } from "@/components/social/LikeButton";
import { CommentSection } from "@/components/social/CommentSection";
import type { Episode, Like } from "@/types/database";
import { VisibilityToggle } from "@/components/series/VisibilityToggle";
import { ReportButton } from "@/components/series/ReportButton";
import Link from "next/link";
import { incrementSeriesView } from "@/lib/views";
import { PriceEditForm } from "@/components/series/PriceEditForm";
import { PurchaseButton } from "@/components/series/PurchaseButton";
import { MainWithSidebar } from "@/components/layout/MainWithSidebar";
import { EpisodesList } from "@/components/series/EpisodesList";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Calendar, Eye } from "lucide-react";
import { formatDate } from "@/lib/format";
import { SimpleBreadcrumb } from "@/components/ui/breadcrumb";

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
      id,
      content,
      created_at,
      series_id,
      user_id,
      profiles (
        id,
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

  const breadcrumbItems = [
    {
      label: "Series",
      href: "/series",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: series.title,
    },
  ];

  // Main content
  const mainContent = (
    <div className="max-w-4xl mx-auto">
      <SimpleBreadcrumb items={breadcrumbItems} className="mb-4" />
      <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              {series.title}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {series.series_tags?.map(
                (tag: { tags: { id: string; name: string } }) => (
                  <Badge
                    key={tag.tags.id}
                    variant="outline"
                    className="bg-background/80"
                  >
                    {tag.tags.name}
                  </Badge>
                )
              )}
            </div>
            <p className="text-muted-foreground">{series.description}</p>
          </div>

          <div className="flex flex-col gap-4 sm:min-w-[200px]">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={series.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {series.profiles?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/profile/${series.user_id}`}
                  className="text-sm font-medium hover:text-primary hover:underline"
                >
                  {series.profiles?.full_name || "Unnamed User"}
                </Link>
                <p className="text-xs text-muted-foreground">Tác giả</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{series.view_count || 0}</p>
                  <p className="text-xs text-muted-foreground">Lượt xem</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-card rounded-lg border">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{episodes.length}</p>
                  <p className="text-xs text-muted-foreground">Bài học</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2 p-3 bg-card rounded-lg border">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(series.created_at)}</p>
                  <p className="text-xs text-muted-foreground">Ngày tạo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 border-t pt-4">
          {isOwner ? (
            <VisibilityToggle
              seriesId={series.id}
              initialIsPublic={series.is_public ?? false}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
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

      <div className="mb-8 md:mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          Danh sách bài học
        </h2>
        <EpisodesList
          episodes={episodes}
          seriesId={series.id}
          isOwner={isOwner}
          hasAccess={!!purchase}
        />
      </div>

      <div className="border-t pt-6 md:pt-8">
        <CommentSection
          seriesId={series.id}
          seriesTitle={series.title}
          seriesOwnerId={series.user_id}
          initialComments={comments ?? []}
        />
      </div>
    </div>
  );

  // Sidebar content (only for owners)
  const sidebarContent = isOwner ? (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-5">
        <h3 className="font-medium mb-4">Quản lý Series</h3>
        <PriceEditForm seriesId={series.id} initialPrice={series.price} />
      </div>
    </div>
  ) : null;

  return <MainWithSidebar main={mainContent} sidebar={sidebarContent} />;
}
