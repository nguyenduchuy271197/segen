import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { Section } from "@/components/ui/section";

export default async function PurchasesPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  // Get user's purchases with series details
  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      *,
      series (
        id,
        title,
        description,
        price,
        profiles (
          full_name
        )
      )
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <Section 
      title="Đã Mua" 
      description="Các series bạn đã mua"
    >
      <div className="space-y-6">
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="border rounded-lg p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {purchase.series?.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-2">
                    {purchase.series?.description}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <span>Tác giả: {purchase.series?.profiles?.full_name}</span>
                    <span className="mx-2">•</span>
                    <span>Mua ngày: {formatDate(purchase.created_at)}</span>
                  </div>
                </div>
                <Link
                  href={`/series/${purchase.series_id}`}
                  className="shrink-0"
                >
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    Xem Series
                  </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">
              Bạn chưa mua series nào. Hãy khám phá các series có sẵn!
            </p>
            <Link href="/explore" className="mt-4 inline-block">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Khám Phá Series
              </button>
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}
