import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

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
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Khám phá Series</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicSeries?.map((item) => (
          <Link key={item.id} href={`/series/${item.id}`}>
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
                {item.title}
              </h2>
              <p className="text-muted-foreground line-clamp-2 mb-4">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  {formatPrice(item.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Tạo bởi {item.profiles?.full_name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
