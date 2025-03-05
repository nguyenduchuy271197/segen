import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DeleteSeriesButton } from "@/components/series/DeleteSeriesButton";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { CreateSeriesDialog } from "@/components/series/CreateSeriesDialog";
import Link from "next/link";

export default async function SeriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userSeries } = user
    ? await supabase
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
    : { data: [] };

  const createSeriesButton = <CreateSeriesDialog />;

  return (
    <Section
      title="Series Của Tôi"
      description="Quản lý các series kiến thức của bạn"
      action={userSeries && userSeries.length > 0 && createSeriesButton}
    >
      {userSeries && userSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSeries.map((series) => (
            <div
              key={series.id}
              className="border rounded-lg p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-xl line-clamp-1">
                  {series.title}
                </h3>
                <DeleteSeriesButton seriesId={series.id} />
              </div>
              <p className="text-muted-foreground line-clamp-2 mb-4">
                {series.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {series.series_tags?.map(
                  (tag) =>
                    tag.tags && (
                      <Badge key={tag.tags.id} variant="outline">
                        {tag.tags.name}
                      </Badge>
                    )
                )}
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t">
                <Badge variant={series.is_public ? "default" : "secondary"}>
                  {series.is_public ? "Public" : "Private"}
                </Badge>
                <Link href={`/series/${series.id}`}>
                  <Button variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg min-h-[40vh] flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">
            Bạn chưa có series nào. Hãy tạo series đầu tiên!
          </p>
          {createSeriesButton}
        </div>
      )}
    </Section>
  );
}
