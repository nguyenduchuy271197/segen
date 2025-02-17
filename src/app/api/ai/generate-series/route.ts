import { createClient } from "@/lib/supabase/server";
import { generateSeries } from "@/lib/ai/deepseek";
import { NextResponse } from "next/server";
import type { Series } from "@/types/database";
import { SeriesGenerationResponse } from "@/lib/ai/types";

type StreamEvent = {
  event: "progress" | "complete" | "error";
  data: {
    step?: string;
    data?: Partial<SeriesGenerationResponse>;
    seriesId?: string;
    message?: string;
  };
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { topic } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const writeToStream = async (
    event: StreamEvent["event"],
    data: StreamEvent["data"]
  ) => {
    const json = JSON.stringify({ event, data });
    await writer.write(encoder.encode(`data: ${json}\n\n`));
  };

  (async () => {
    try {
      const seriesData = await generateSeries(topic, async (step, data) => {
        await writeToStream("progress", { step, data });
      });

      await writeToStream("progress", { step: "Đang lưu series..." });
      const { data: series, error: seriesError } = await supabase
        .from("series")
        .insert({
          title: seriesData.title,
          description: seriesData.description,
          user_id: user.id,
        })
        .select()
        .single<Series>();

      if (seriesError) throw seriesError;

      await writeToStream("progress", { step: "Đang tạo các bài học..." });
      const episodesData = seriesData.episodes.map((episode) => ({
        series_id: series.id,
        title: episode.title,
        description: episode.description,
        content: null,
        order_number: episode.order,
      }));

      const { error: episodesError } = await supabase
        .from("episodes")
        .insert(episodesData);

      if (episodesError) throw episodesError;

      await writeToStream("complete", { seriesId: series.id });
    } catch (error) {
      await writeToStream("error", {
        message:
          error instanceof Error ? error.message : "Không thể tạo series",
      });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
