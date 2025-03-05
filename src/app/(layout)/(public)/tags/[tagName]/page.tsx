import { createClient } from "@/lib/supabase/server";
import { SeriesList } from "@/components/series/SeriesList";

export default async function TagPage({
  params,
}: {
  params: { tagName: string };
}) {
  const supabase = await createClient();

  const { data: series } = await supabase
    .from("series")
    .select(
      `
      *,
      profiles!inner (
        full_name,
        avatar_url
      ),
      series_tags!inner (
        tags!inner (
          id,
          name,
          created_at
        )
      )
    `
    )
    .eq("series_tags.tags.name", params.tagName)
    .eq("is_public", true);

  // Transform the series data to ensure non-null values
  const transformedSeries =
    series?.map((s) => ({
      ...s,
      profiles: {
        ...s.profiles,
        full_name: s.profiles.full_name || "Unnamed User",
      },
    })) || [];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">
        Series tagged with &quot;{params.tagName}&quot;
      </h1>
      <SeriesList series={transformedSeries} />
    </div>
  );
}
