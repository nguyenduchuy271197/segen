import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { DeleteSeriesButton } from "@/components/series/DeleteSeriesButton";
import { Badge } from "@/components/ui/badge";
import { SeriesWithTags } from "@/types/database";

export default async function SeriesListingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Please log in to view your series.
        </p>
      </div>
    );
  }

  const { data: series } = await supabase
    .from("series")
    .select(
      `
      *,
      series_tags (
        tags (
          id,
          name
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<SeriesWithTags[]>();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Series Của Bạn</h1>
        <Link href="/series/new">
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Tạo Series Mới
          </Button>
        </Link>
      </div>

      {series?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Bạn chưa tạo series nào.</p>
          <Link href="/series/new">
            <Button>Tạo Series Đầu Tiên</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series?.map((item) => (
            <div key={item.id} className="relative group">
              <Link href={`/series/${item.id}`} className="block">
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  {item.series_tags && item.series_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.series_tags.map((st) => (
                        <Badge key={st.tags.id} variant="secondary">
                          {st.tags.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Tạo ngày{" "}
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </Link>
              <div className="absolute top-4 right-4">
                <DeleteSeriesButton seriesId={item.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
