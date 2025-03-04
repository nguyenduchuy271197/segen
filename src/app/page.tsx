import { createClient } from "@/lib/supabase/server";
import { Section } from "@/components/ui/section";
import { SeriesCard } from "@/components/ui/series-card";
import { CreateSeriesDialog } from "@/components/series/CreateSeriesDialog";
import { GraduationCap } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch popular series with their authors
  const { data: featuredSeries } = await supabase
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
    .order("view_count", { ascending: false })
    .limit(9);

  return (
    <>
      {/* <div className="bg-gradient-to-b from-primary/10 to-background pt-12 pb-8 mb-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="bg-primary/10 p-3 rounded-full mb-6">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Học và chia sẻ kiến thức với <span className="text-primary">EduSeries</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Nền tảng tạo và chia sẻ series kiến thức hiện đại, giúp bạn học tập và giảng dạy hiệu quả
            </p>
            <CreateSeriesDialog />
          </div>
        </div>
      </div> */}

      <Section
        title="Series Nổi Bật"
        description="Khám phá các series kiến thức được xem nhiều nhất"
      >
        {featuredSeries && featuredSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSeries.map((series) => (
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
                isPremium={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-xl bg-card">
            <p className="text-muted-foreground mb-4">
              Chưa có series nổi bật. Hãy tạo series đầu tiên!
            </p>
            <CreateSeriesDialog />
          </div>
        )}
      </Section>
    </>
  );
}
