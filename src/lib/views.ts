import { createClient } from "./supabase/server";

export async function incrementSeriesView(seriesId: string, userId?: string) {
  const supabase = await createClient();

  if (userId) {
    // Check if view already exists
    const { data: existingView } = await supabase
      .from("series_views")
      .select()
      .eq("series_id", seriesId)
      .eq("user_id", userId)
      .single();

    // Only insert and increment if it's a new view
    if (!existingView) {
      const { error: viewError } = await supabase
        .from("series_views")
        .insert({ series_id: seriesId, user_id: userId });

      if (!viewError) {
        await supabase.rpc("increment_view_count", { series_id: seriesId });
      }
    }
  } else {
    // Anonymous view, just increment the counter
    await supabase.rpc("increment_view_count", { series_id: seriesId });
  }
}
