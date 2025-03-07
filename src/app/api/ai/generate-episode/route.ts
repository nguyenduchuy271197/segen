import { createClient } from "@/lib/supabase/server";
import { generateEpisodeContent } from "@/lib/ai/deepseek";
import { NextResponse } from "next/server";
import type { Series, Episode } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { seriesId, episodeId } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get series and episode info
    const { data: series } = await supabase
      .from("series")
      .select()
      .eq("id", seriesId)
      .eq("user_id", user.id)
      .single<Series>();

    const { data: episode } = await supabase
      .from("episodes")
      .select()
      .eq("id", episodeId)
      .eq("series_id", seriesId)
      .single<Episode>();

    if (!series || !episode) {
      return NextResponse.json(
        { error: "Không tìm thấy series hoặc bài học" },
        { status: 404 }
      );
    }

    // Generate content
    const content = await generateEpisodeContent(series.title, episode.title);

    // Update episode with generated content
    const { error: updateError } = await supabase
      .from("episodes")
      .update({
        content: content.content,
      })
      .eq("id", episodeId)
      .eq("series_id", seriesId);

    if (updateError) throw updateError;

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error generating episode content:", error);
    return NextResponse.json(
      { error: "Không thể tạo nội dung bài học" },
      { status: 500 }
    );
  }
}
