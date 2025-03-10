import { createClient } from "@/lib/supabase/server";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Series, Episode } from "@/types/database";
import { EpisodeContent } from "@/components/series/EpisodeContent";
import { EpisodeView } from "@/components/series/EpisodeView";
import { EpisodesSidebar } from "@/components/series/EpisodesSidebar";
import { TableOfContents } from "@/components/series/TableOfContents";
import { BookmarkButton } from "@/components/series/BookmarkButton";
import { SimpleBreadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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

  const { data: purchase } = user?.id
    ? await supabase
        .from("purchases")
        .select()
        .eq("series_id", seriesId)
        .eq("user_id", user.id)
        .single()
    : { data: null };

  if (!series || !episode) {
    return <ErrorMessage message="Không tìm thấy bài học" />;
  }

  // Check if user has access to this episode
  const hasAccess = isOwner || episode.is_preview || !!purchase;

  const breadcrumbItems = [
    {
      label: "Series",
      href: "/series",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: series.title,
      href: `/series/${seriesId}`,
    },
    {
      label: episode.title,
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  // Find previous and next episodes
  const sortedEpisodes = [...(series.episodes || [])].sort(
    (a, b) => a.order_number - b.order_number
  );
  const currentIndex = sortedEpisodes.findIndex((ep) => ep.id === episodeId);
  const prevEpisode =
    currentIndex > 0 ? sortedEpisodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < sortedEpisodes.length - 1
      ? sortedEpisodes[currentIndex + 1]
      : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <SimpleBreadcrumb items={breadcrumbItems} className="mb-6" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-4 h-[calc(100vh-2rem)]">
          <EpisodesSidebar
            seriesId={seriesId}
            currentEpisodeId={episodeId}
            episodes={series?.episodes || []}
            className="rounded-lg border shadow-sm bg-card"
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 max-w-4xl mx-auto">
          {/* Episode header */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href={`/series/${seriesId}`}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay Lại Series
              </Link>

              {episode.is_preview && (
                <Badge variant="secondary" className="ml-auto">
                  Xem Thử
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{episode.title}</h1>
                <BookmarkButton episodeId={episodeId} seriesId={seriesId} />
              </div>

              <p className="text-muted-foreground">
                Bài {episode.order_number} của {series.title}
              </p>

              {episode.description && (
                <p className="text-muted-foreground mt-2 pb-2 border-b">
                  {episode.description}
                </p>
              )}
            </div>
          </Card>

          {/* Episode content */}
          {!hasAccess ? (
            <Card className="text-center py-12 px-6">
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">
                Nội dung này đã bị khoá
              </h2>
              <p className="text-muted-foreground mb-6">
                Bạn cần mua series này để xem nội dung.
              </p>
              <Button asChild>
                <Link href={`/series/${seriesId}`}>Xem Chi Tiết Series</Link>
              </Button>
            </Card>
          ) : episode.content ? (
            <EpisodeView
              seriesId={seriesId}
              content={episode.content}
              isOwner={isOwner}
              episodeId={episodeId}
            />
          ) : isOwner ? (
            <Card className="text-center py-12 px-6">
              <h2 className="text-xl font-semibold mb-4">Chưa có nội dung</h2>
              <p className="text-muted-foreground mb-6">
                Bạn có thể thêm nội dung cho bài học này ngay bây giờ.
              </p>
              <EpisodeContent
                content=""
                isEditable={true}
                episodeId={episodeId}
              />
            </Card>
          ) : (
            <Card className="text-center py-12 px-6">
              <h2 className="text-xl font-semibold mb-2">Chưa có nội dung</h2>
              <p className="text-muted-foreground">
                Nội dung bài học này đang được chuẩn bị.
              </p>
            </Card>
          )}

          {/* Episode navigation */}
          {hasAccess && (
            <div className="flex justify-between mt-8">
              {prevEpisode ? (
                <Button variant="outline" asChild>
                  <Link
                    href={`/series/${seriesId}/episodes/${prevEpisode.id}`}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Bài trước
                  </Link>
                </Button>
              ) : (
                <div></div>
              )}

              {nextEpisode ? (
                <Button asChild>
                  <Link
                    href={`/series/${seriesId}/episodes/${nextEpisode.id}`}
                    className="flex items-center"
                  >
                    Bài tiếp theo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link
                    href={`/series/${seriesId}`}
                    className="flex items-center"
                  >
                    Hoàn thành series
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          )}
        </main>

        {/* Table of contents - Hidden on mobile, shown on larger screens */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-4 h-[calc(100vh-2rem)]">
          <TableOfContents
            content={episode.content || ""}
            className="rounded-lg border shadow-sm bg-card"
          />
        </aside>
      </div>

      {/* Mobile navigation drawer - Visible only on small screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-between items-center">
        {prevEpisode ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/series/${seriesId}/episodes/${prevEpisode.id}`}>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <div></div>
        )}

        <Button variant="outline" size="sm" asChild>
          <Link href={`/series/${seriesId}`}>
            <BookOpen className="w-4 h-4" />
          </Link>
        </Button>

        {nextEpisode ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/series/${seriesId}/episodes/${nextEpisode.id}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        ) : (
          <div></div>
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
      <Episode seriesId={params.seriesId} episodeId={params.episodeId} />
    </Suspense>
  );
}
