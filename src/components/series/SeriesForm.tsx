"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SeriesGenerationResponse } from "@/lib/ai/types";

type ProgressState = {
  step: string;
  data?: Partial<SeriesGenerationResponse>;
};

// Custom type for SSE events
interface MessageEvent extends Event {
  data: string;
}

export function SeriesForm() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setProgress({ step: "Đang khởi tạo..." });

    try {
      const eventSource = new EventSource(
        `/api/ai/generate-series?topic=${encodeURIComponent(topic)}`
      );

      eventSource.addEventListener("progress", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(data);
        } catch (error) {
          console.error("Error parsing progress data:", error);
        }
      });

      eventSource.addEventListener("complete", (event: MessageEvent) => {
        try {
          const parsedData = JSON.parse(event.data);
          eventSource.close();
          setIsLoading(false);

          toast({
            title: "Tạo series thành công",
            description: "Series của bạn đã được tạo thành công.",
          });

          // Add debugging to see what we're receiving
          console.log("Complete event data:", parsedData);

          // Check if seriesId exists in the expected location
          const seriesId = parsedData.data?.seriesId;

          if (seriesId) {
            router.push(`/series/${seriesId}`);
          } else {
            console.error("Series ID not found in response:", parsedData);
            toast({
              title: "Lỗi điều hướng",
              description:
                "Không thể tìm thấy ID series. Vui lòng kiểm tra danh sách series của bạn.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error parsing complete data:", error);
          eventSource.close();
          setIsLoading(false);
        }
      });

      eventSource.addEventListener("error", (event: MessageEvent) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            toast({
              title: "Lỗi tạo series",
              description: data.message || "Đã xảy ra lỗi khi tạo series.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Lỗi tạo series",
              description: "Đã xảy ra lỗi khi tạo series.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error parsing error data:", error);
        } finally {
          eventSource.close();
          setIsLoading(false);
        }
      });

      eventSource.onerror = () => {
        eventSource.close();
        setIsLoading(false);

        toast({
          title: "Lỗi kết nối",
          description: "Không thể kết nối đến máy chủ.",
          variant: "destructive",
        });
      };
    } catch {
      setIsLoading(false);
      toast({
        title: "Lỗi tạo series",
        description: "Đã xảy ra lỗi khi tạo series.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Chủ đề Series</Label>
          <Input
            id="topic"
            placeholder="Nhập chủ đề bạn muốn tạo series (ví dụ: Machine Learning cơ bản)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo Series với AI"
          )}
        </Button>
      </form>

      {isLoading && progress && (
        <div className="mt-6 space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">{progress.step}</h3>

            {progress.data && progress.data.title && (
              <div className="space-y-2 animate-in fade-in-50">
                <p className="font-semibold">{progress.data.title}</p>
                {progress.data.description && (
                  <p className="text-sm text-muted-foreground">
                    {progress.data.description}
                  </p>
                )}

                {progress.data.tags && progress.data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {progress.data.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {progress.data.episodes &&
                  progress.data.episodes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Bài học:</p>
                      <ul className="space-y-1">
                        {progress.data.episodes.map((episode, i: number) => (
                          <li key={i} className="text-sm">
                            {episode.order}. {episode.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
