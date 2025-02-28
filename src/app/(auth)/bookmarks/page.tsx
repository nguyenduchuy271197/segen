import { createClient } from "@/lib/supabase/server";
import { BookmarksList } from "@/components/series/BookmarksList";
import { Section } from "@/components/ui/section";

export default async function BookmarksPage() {
  const supabase = await createClient();

  const { data: initialBookmarks } = await supabase
    .from("bookmarks")
    .select(`
      *,
      series (
        id,
        title,
        description,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <Section 
      title="Bookmarks" 
      description="Các series bạn đã lưu để xem sau"
    >
      <BookmarksList initialBookmarks={initialBookmarks} />
    </Section>
  );
}

