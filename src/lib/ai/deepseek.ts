import OpenAI from "openai";
import { SeriesGenerationResponse, EpisodeContentResponse } from "./types";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function generateSeries(
  topic: string,
  onProgress?: (step: string, data?: Partial<SeriesGenerationResponse>) => void
): Promise<SeriesGenerationResponse> {
  onProgress?.("Đang khởi tạo...");

  const systemPrompt = `Tạo một chuỗi bài học toàn diện về chủ đề. Xuất ra định dạng JSON với cấu trúc sau:
  {
    "title": "Tiêu đề chính của series",
    "description": "Tổng quan về series",
    "episodes": [
      {
        "title": "Tiêu đề tập",
        "description": "Mô tả ngắn về tập",
        "order": 1
      }
    ]
  }`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Tạo một series học tập về: ${topic}` },
    ],
    response_format: { type: "json_object" },
    stream: true,
  });

  let fullContent = "";
  onProgress?.("Đang tạo nội dung...");

  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullContent += content;
    try {
      const partialData = JSON.parse(
        fullContent
      ) as Partial<SeriesGenerationResponse>;
      onProgress?.("Đang xử lý...", partialData);
    } catch {
      // Continue collecting chunks until we have valid JSON
    }
  }

  if (!fullContent) {
    throw new Error("Không nhận được nội dung từ API");
  }

  return JSON.parse(fullContent);
}

export async function generateEpisodeContent(
  seriesTitle: string,
  episodeTitle: string
): Promise<EpisodeContentResponse> {
  const systemPrompt = `Tạo nội dung chi tiết cho một bài học. Xuất ra định dạng JSON với cấu trúc sau:
  {
    "content": "Nội dung chính của bài học ở định dạng HTML. Sử dụng các thẻ: <h1>, <h2>, <h3> cho tiêu đề, <p> cho đoạn văn, <ul>/<li> cho danh sách không thứ tự, <ol>/<li> cho danh sách có thứ tự, <blockquote> cho trích dẫn, <code> cho code, <strong> cho in đậm, <em> cho in nghiêng",
    "summary": "Tóm tắt ngắn gọn về bài học"
  }`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Tạo nội dung cho tập "${episodeTitle}" trong series "${seriesTitle}"`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 1.5,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Không nhận được nội dung từ API");
  }
  return JSON.parse(content);
}
