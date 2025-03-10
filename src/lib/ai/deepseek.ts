import OpenAI from "openai";
import {
  SeriesGenerationResponse,
  EpisodeContentResponse,
  StructuredEpisodeResponse,
} from "./types";

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
    "tags": ["tag1", "tag2", "tag3"],
    "episodes": [
      {
        "title": "Tiêu đề tập",
        "description": "Mô tả ngắn về tập",
        "order": 1
      }
    ]
  }

  Lưu ý:
  - Tags: Tạo 3-5 tags phù hợp với nội dung và mức độ của series
  - Tags nên bao gồm: chủ đề chính, độ khó, đối tượng học
  - Tags phải ngắn gọn và có ý nghĩa`;

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
  episodeTitle: string,
  options: {
    style?: "academic" | "conversational" | "practical" | "storytelling";
    includeExercises?: boolean;
    difficultyLevel?: "beginner" | "intermediate" | "advanced";
    targetAudience?: string;
    keyPoints?: string[];
  } = {}
): Promise<EpisodeContentResponse> {
  const {
    style = "conversational",
    includeExercises = true,
    difficultyLevel = "intermediate",
    targetAudience = "người học tổng quát",
    keyPoints = [],
  } = options;

  let stylePrompt = "";
  switch (style) {
    case "academic":
      stylePrompt =
        "Sử dụng phong cách học thuật, chính thống với các trích dẫn và tài liệu tham khảo.";
      break;
    case "conversational":
      stylePrompt = "Sử dụng phong cách trò chuyện, thân thiện và dễ tiếp cận.";
      break;
    case "practical":
      stylePrompt = "Tập trung vào các ví dụ thực tế và ứng dụng thực tiễn.";
      break;
    case "storytelling":
      stylePrompt =
        "Sử dụng kể chuyện để minh họa các khái niệm và giữ người học tham gia.";
      break;
  }

  const keyPointsPrompt =
    keyPoints.length > 0
      ? `Đảm bảo bao gồm các điểm chính sau: ${keyPoints.join(", ")}.`
      : "";

  const exercisesPrompt = includeExercises
    ? "Bao gồm các bài tập thực hành và câu hỏi kiểm tra để củng cố kiến thức."
    : "";

  const systemPrompt = `Tạo nội dung chi tiết cho một bài học. Xuất ra định dạng JSON với cấu trúc sau:
  {
    "content": "Nội dung chính của bài học ở định dạng HTML. Sử dụng các thẻ: <h1>, <h2>, <h3> cho tiêu đề, <p> cho đoạn văn, <ul>/<li> cho danh sách không thứ tự, <ol>/<li> cho danh sách có thứ tự, <blockquote> cho trích dẫn, <code> cho code, <strong> cho in đậm, <em> cho in nghiêng",
    "summary": "Tóm tắt ngắn gọn về bài học",
    "keyTakeaways": ["Điểm chính 1", "Điểm chính 2", "Điểm chính 3"]
  }
  
  Hướng dẫn bổ sung:
  - Cấp độ: ${difficultyLevel}
  - Đối tượng: ${targetAudience}
  - ${stylePrompt}
  - ${keyPointsPrompt}
  - ${exercisesPrompt}
  - Tạo nội dung có cấu trúc rõ ràng với các phần giới thiệu, nội dung chính, và kết luận.
  - Sử dụng các ví dụ cụ thể để minh họa các khái niệm.
  - Tạo các tiêu đề phần rõ ràng để phân chia nội dung.`;

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
    temperature: 1.2,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Không nhận được nội dung từ API");
  }
  return JSON.parse(content);
}

export async function generateStructuredEpisode(
  seriesTitle: string,
  episodeTitle: string,
  structure: {
    sections: Array<{
      title: string;
      type: "concept" | "example" | "exercise" | "summary";
      keyPoints?: string[];
    }>;
  }
): Promise<StructuredEpisodeResponse> {
  const sectionsPrompt = structure.sections
    .map((section, index) => {
      const keyPointsText = section.keyPoints?.length
        ? `Điểm chính: ${section.keyPoints.join(", ")}`
        : "";

      return `Phần ${index + 1}: ${section.title} (Loại: ${
        section.type
      }) ${keyPointsText}`;
    })
    .join("\n");

  const systemPrompt = `Tạo nội dung chi tiết cho một bài học theo cấu trúc được cung cấp. Xuất ra định dạng JSON với cấu trúc sau:
  {
    "sections": [
      {
        "title": "Tiêu đề phần",
        "content": "Nội dung HTML của phần",
        "type": "concept|example|exercise|summary"
      }
    ],
    "summary": "Tóm tắt ngắn gọn về bài học",
    "keyTakeaways": ["Điểm chính 1", "Điểm chính 2", "Điểm chính 3"]
  }
  
  Cấu trúc bài học:
  ${sectionsPrompt}
  
  Hướng dẫn:
  - Tạo nội dung HTML phong phú cho mỗi phần
  - Sử dụng các thẻ HTML phù hợp: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <code>, <blockquote>, <strong>, <em>
  - Đối với phần "concept": Giải thích khái niệm một cách rõ ràng và dễ hiểu
  - Đối với phần "example": Cung cấp ví dụ cụ thể và chi tiết
  - Đối với phần "exercise": Tạo bài tập thực hành hoặc câu hỏi kiểm tra
  - Đối với phần "summary": Tóm tắt các điểm chính đã học`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Tạo nội dung có cấu trúc cho tập "${episodeTitle}" trong series "${seriesTitle}"`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 1.2,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Không nhận được nội dung từ API");
  }

  const structuredContent = JSON.parse(content) as StructuredEpisodeResponse;

  // Combine all sections into a single HTML content
  const combinedContent = structuredContent.sections
    .map((section) => {
      return `<h2>${section.title}</h2>${section.content}`;
    })
    .join("");

  return {
    ...structuredContent,
    content: combinedContent,
  };
}
