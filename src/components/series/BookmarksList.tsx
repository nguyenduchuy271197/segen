"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2 } from "lucide-react";
import { BookmarkWithRelations } from "@/types/database";

interface BookmarksListProps {
  initialBookmarks: BookmarkWithRelations[] | null;
}

export function BookmarksList({ initialBookmarks }: BookmarksListProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkWithRelations[]>(
    initialBookmarks || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const supabase = createClient();

  const loadMore = useCallback(async () => {
    setIsLoading(true);
    const lastBookmark = bookmarks[bookmarks.length - 1];
    const lastDate = lastBookmark?.created_at;

    try {
      const { data } = await supabase
        .from("bookmarks")
        .select(
          `
          id,
          created_at,
          episode_id,
          series_id,
          user_id,
          episodes!inner (
            id,
            title,
            description,
            series!inner (
              id,
              title
            )
          )
        `
        )
        .lt("created_at", lastDate)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setBookmarks([...bookmarks, ...(data as BookmarkWithRelations[])]);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [bookmarks, supabase]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, inView, isLoading, loadMore]);

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Chưa có bookmark nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <Link
          key={bookmark.id}
          href={`/series/${bookmark.episodes.series.id}/episodes/${bookmark.episodes.id}`}
          className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <h2 className="font-semibold">{bookmark.episodes.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Từ series: {bookmark.episodes.series.title}
          </p>
          {bookmark.episodes.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {bookmark.episodes.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Đã lưu: {new Date(bookmark.created_at).toLocaleDateString("vi-VN")}
          </p>
        </Link>
      ))}

      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
      )}
    </div>
  );
}
