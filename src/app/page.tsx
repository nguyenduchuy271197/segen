import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/ui/section";

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
      )
    `
    )
    .eq("is_public", true)
    .order("view_count", { ascending: false })
    .limit(9);

  return (
    <Section
      title="Series Nổi Bật"
      description="Khám phá các series kiến thức được xem nhiều nhất"
    >
      {featuredSeries && featuredSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSeries.map((series) => (
            <Link key={series.id} href={`/series/${series.id}`}>
              <div className="border rounded-lg p-6 h-full hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold line-clamp-2">
                    {series.title}
                  </h3>
                  {series.view_count && series.view_count > 100 && (
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground line-clamp-2 mb-4 flex-grow">
                  {series.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t text-sm text-muted-foreground">
                  <span>
                    Tác giả: {series.profiles?.full_name || "Unnamed User"}
                  </span>
                  <span>{formatDate(series.created_at)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            Chưa có series nổi bật. Hãy tạo series đầu tiên!
          </p>
          <Link href="/series/new">
            <Button>Tạo Series Mới</Button>
          </Link>
        </div>
      )}
    </Section>
  );
}
