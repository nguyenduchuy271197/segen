import { createClient } from "@/lib/supabase/server";
import { BookmarksList } from "@/components/series/BookmarksList";

export default async function BookmarksPage() {
  const supabase = await createClient();

  const { data: initialBookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      id,
      created_at,
      episode_id,
      series_id,
      user_id,
      episodes (
        id,
        title,
        description,
        content,
        created_at,
        order_number,
        series_id,
        series (
          id,
          title,
          created_at,
          description,
          is_public,
          user_id,
          view_count
        )
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookmarks</h1>
      <BookmarksList initialBookmarks={initialBookmarks} />
    </div>
  );
}
