import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { Section } from "@/components/ui/section";

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
      )
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
          <Link key={series.id} href={`/series/${series.id}`}>
            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-6 flex-1">
                <h3 className="font-semibold text-xl mb-2 line-clamp-2">{series.title}</h3>
                <p className="text-muted-foreground line-clamp-2 mb-4">{series.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-sm text-muted-foreground">
                    {series.profiles?.full_name || "Unnamed User"}
                  </span>
                  <span className="font-medium">
                    {series.price ? formatPrice(series.price) : "Miễn phí"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
