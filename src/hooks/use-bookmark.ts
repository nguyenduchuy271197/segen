import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/provider";

interface UseBookmarkOptions {
  onSuccess?: (isBookmarked: boolean) => void;
  onError?: () => void;
}

export function useBookmark(
  episodeId: string,
  seriesId: string,
  options?: UseBookmarkOptions
) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  const checkBookmarkStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("bookmarks")
        .select()
        .eq("episode_id", episodeId)
        .eq("user_id", user.id)
        .eq("series_id", seriesId)
        .single();

      setIsBookmarked(!!data);
    } finally {
      setIsLoading(false);
    }
  }, [episodeId, seriesId, supabase, user]);

  const toggleBookmark = async () => {
    if (!user) {
      options?.onError?.();
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("episode_id", episodeId)
          .eq("user_id", user.id)
          .eq("series_id", seriesId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("bookmarks").insert({
          episode_id: episodeId,
          series_id: seriesId,
          user_id: user.id,
        });

        if (error) throw error;
      }

      setIsBookmarked(!isBookmarked);
      options?.onSuccess?.(!isBookmarked);
    } catch (error) {
      console.error("Bookmark error:", error);
      options?.onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBookmarkStatus();
  }, [checkBookmarkStatus]);

  return {
    isBookmarked,
    isLoading,
    toggleBookmark,
  };
}
