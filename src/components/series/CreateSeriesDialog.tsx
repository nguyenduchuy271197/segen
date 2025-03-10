"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Check, BookOpen, Tag, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SeriesGenerationResponse } from "@/lib/ai/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProgressState = {
  step: string;
  data?: Partial<SeriesGenerationResponse>;
};

// Custom type for SSE events
interface MessageEvent extends Event {
  data: string;
}

export function CreateSeriesDialog() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [activeEpisodeIndex, setActiveEpisodeIndex] = useState<number | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();

  // Update active episode index based on progress step
  useEffect(() => {
    if (
      progress?.step === "Đang tạo các bài học..." &&
      progress.data?.episodes
    ) {
      setActiveEpisodeIndex(progress.data.episodes.length - 1);
    } else if (progress?.step === "Hoàn thành") {
      setActiveEpisodeIndex(null);
    }
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setProgress({ step: "Đang khởi tạo..." });
    setActiveEpisodeIndex(null);

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
            // Close dialog after a short delay to show completion
            setTimeout(() => {
              setIsOpen(false);
              router.push(`/series/${seriesId}`);
            }, 1000);
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

  const resetForm = () => {
    if (!isLoading) {
      setTopic("");
      setProgress(null);
      setActiveEpisodeIndex(null);
    }
  };

  const getStepIcon = () => {
    switch (progress?.step) {
      case "Đang khởi tạo...":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "Đang tạo nội dung...":
        return <FileText className="h-4 w-4" />;
      case "Đang xử lý...":
        return <Tag className="h-4 w-4" />;
      case "Đang lưu series...":
        return <BookOpen className="h-4 w-4" />;
      case "Đang tạo các bài học...":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "Hoàn thành":
        return <Check className="h-4 w-4 text-green-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Series Mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Series Mới</DialogTitle>
          <DialogDescription>
            Nhập chủ đề bạn muốn tạo series học tập và AI sẽ tự động tạo nội
            dung
          </DialogDescription>
        </DialogHeader>

        {!isLoading || !progress?.data?.title ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-dialog">Chủ đề Series</Label>
              <Input
                id="topic-dialog"
                placeholder="Nhập chủ đề (ví dụ: Machine Learning cơ bản)"
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
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
              {getStepIcon()}
              <span className="text-sm font-medium">{progress.step}</span>
            </div>

            <div className="space-y-4">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {progress.data.title}
                </h3>
                {progress.data.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {progress.data.description}
                  </p>
                )}

                {progress.data.tags && progress.data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {progress.data.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-primary/5">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {progress.data.episodes && progress.data.episodes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Danh sách bài học đang được tạo
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({progress.data.episodes.length} bài)
                    </span>
                  </h4>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                    {progress.data.episodes.map((episode, i: number) => (
                      <div
                        key={i}
                        className={cn(
                          "border rounded-lg transition-all duration-300",
                          i === activeEpisodeIndex
                            ? "bg-primary/10 border-primary shadow-sm scale-[1.02]"
                            : "bg-card",
                          progress.step === "Hoàn thành" &&
                            "bg-card hover:bg-muted/50"
                        )}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="bg-muted w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">
                                  {episode.order}
                                </span>
                              </div>
                              <h5 className="font-medium text-sm ml-2">
                                {episode.title}
                              </h5>
                            </div>

                            {(i < activeEpisodeIndex ||
                              progress.step === "Hoàn thành") && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}

                            {i === activeEpisodeIndex &&
                              progress.step === "Đang tạo các bài học..." && (
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              )}
                          </div>

                          {episode.description && (
                            <p className="text-xs text-muted-foreground pl-8">
                              {episode.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {progress.step === "Hoàn thành" && (
              <Button
                className="w-full"
                onClick={() => {
                  const seriesId = progress.data?.seriesId;
                  if (seriesId) {
                    router.push(`/series/${seriesId}`);
                  }
                }}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Xem Series
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
