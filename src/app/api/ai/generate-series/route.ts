import { createClient } from "@/lib/supabase/server";
import { generateSeries } from "@/lib/ai/deepseek";
import { NextResponse } from "next/server";
import type { EpisodeInsert } from "@/types/database";
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

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

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
    await writer.write(encoder.encode(`event: ${event}\ndata: ${json}\n\n`));
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
          is_public: false,
          price: 0,
          view_count: 0,
        })
        .select()
        .single();

      if (seriesError) throw seriesError;

      // Process tags
      if (seriesData.tags && seriesData.tags.length > 0) {
        for (const tagName of seriesData.tags) {
          const normalizedName = tagName.toLowerCase().trim();

          // Check if tag exists
          const { data: existingTag } = await supabase
            .from("tags")
            .select()
            .eq("name", normalizedName)
            .maybeSingle();

          let tag = existingTag;

          if (!tag) {
            const { data: newTag } = await supabase
              .from("tags")
              .insert({ name: normalizedName })
              .select()
              .single();
            tag = newTag;
          }

          // Link tag to series
          if (tag) {
            await supabase.from("series_tags").insert({
              series_id: series.id,
              tag_id: tag.id,
            });
          }
        }
      }

      await writeToStream("progress", { step: "Đang tạo các bài học..." });

      const episodesData: EpisodeInsert[] = seriesData.episodes.map(
        (episode) => ({
          series_id: series.id,
          title: episode.title,
          description: episode.description || null,
          content: null,
          order_number: episode.order,
          is_preview: false,
        })
      );

      const { error: episodesError } = await supabase
        .from("episodes")
        .insert(episodesData);

      if (episodesError) throw episodesError;

      await writeToStream("complete", {
        step: "Hoàn thành",
        seriesId: series.id,
        data: {
          title: seriesData.title,
          description: seriesData.description,
          tags: seriesData.tags,
          episodes: seriesData.episodes,
          // seriesId: series.id,
        },
      });
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
