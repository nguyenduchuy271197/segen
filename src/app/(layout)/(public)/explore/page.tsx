import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { SeriesCard } from "@/components/ui/series-card";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: publicSeries } = await supabase
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
      ),
      episodes (id)
    `
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  return (
    <Section
      title="Khám Phá Series"
      description="Tìm kiếm các series kiến thức mới nhất"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicSeries?.map((series) => (
          <SeriesCard
            key={series.id}
            id={series.id}
            title={series.title}
            description={series.description}
            authorName={series.profiles?.full_name || "Unnamed User"}
            authorAvatar={series.profiles?.avatar_url}
            createdAt={series.created_at}
            episodeCount={series.episodes?.length || 0}
            viewCount={series.view_count || 0}
            tags={series.series_tags?.map((st) => st.tags) || []}
            price={series.price}
            isPremium={!!series.price && series.price > 0}
          />
        ))}
      </div>
    </Section>
  );
}
