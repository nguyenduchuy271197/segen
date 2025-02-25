import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export default async function PurchasesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please login to view your purchases</div>;
  }

  // Get user's purchases with series and profile information
  const { data: purchases } = await supabase
    .from("purchases")
    .select(
      `
      *,
      series:series_id (
        id,
        title,
        description,
        user_id,
        profiles:user_id (
          full_name,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!purchases?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Chưa có series nào được mua</h1>
        <p className="text-muted-foreground mb-6">
          Khám phá và mua các series để bắt đầu học ngay!
        </p>
        <Link
          href="/explore"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
        >
          Khám phá series
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Series đã mua</h1>
      <div className="space-y-6">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-all"
          >
            <Link href={`/series/${purchase.series.id}`}>
              <h2 className="text-xl font-semibold mb-2 hover:text-primary">
                {purchase.series.title}
              </h2>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Tác giả: {purchase.series.profiles.full_name}</span>
              <span>•</span>
              <span>Mua ngày: {formatDate(purchase.created_at)}</span>
              <span>•</span>
              <span>Số tiền: {purchase.amount.toLocaleString()}đ</span>
            </div>
            {purchase.series.description && (
              <p className="text-muted-foreground">
                {purchase.series.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
