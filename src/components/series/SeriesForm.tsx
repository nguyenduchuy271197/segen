"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error";
import { LoadingSpinner } from "@/components/ui/loading";
import { SeriesGenerationResponse } from "@/lib/ai/types";
import { Label } from "@/components/ui/label";
import { TagInput } from "./TagInput";

export function SeriesForm() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>("");
  const [partialData, setPartialData] =
    useState<Partial<SeriesGenerationResponse> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPartialData(null);

    try {
      const response = await fetch("/api/ai/generate-series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Không thể đọc phản hồi");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const { event, data } = JSON.parse(line.slice(5));

              if (event === "progress") {
                setStep(data.step);
                if (data.data) setPartialData(data.data);
              } else if (event === "complete") {
                window.location.href = `/series/${data.seriesId}`;
                return;
              } else if (event === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              console.log(e);
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage message={error} retry={() => setError(null)} />}

      <div>
        <label htmlFor="topic" className="block text-sm font-medium">
          Bạn muốn học về chủ đề gì?
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1 block w-full rounded-md border p-2"
          placeholder="Nhập chủ đề..."
          required
          disabled={isLoading}
        />
      </div>

      {partialData?.id && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <TagInput
            seriesId={partialData.id}
            initialTags={[]}
            disabled={isLoading}
          />
          <p className="text-sm text-muted-foreground">
            Press Enter to add a tag
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <LoadingSpinner />
              <span className="font-medium">{step}</span>
            </div>

            <div className="space-y-4">
              {partialData && (
                <>
                  <div className="space-y-2 animate-fade-in">
                    {partialData.title && (
                      <div>
                        <div className="text-xs uppercase text-muted-foreground mb-1">
                          Tiêu đề
                        </div>
                        <h3 className="font-medium">{partialData.title}</h3>
                      </div>
                    )}

                    {partialData.description && (
                      <div>
                        <div className="text-xs uppercase text-muted-foreground mb-1">
                          Mô tả
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {partialData.description}
                        </p>
                      </div>
                    )}

                    {partialData.episodes &&
                      partialData.episodes.length > 0 && (
                        <div>
                          <div className="text-xs uppercase text-muted-foreground mb-1">
                            Các bài học
                          </div>
                          <div className="space-y-1">
                            {partialData.episodes.map((episode, index) => (
                              <div
                                key={index}
                                className="text-sm flex items-center gap-2 animate-fade-in"
                              >
                                <span className="text-muted-foreground">
                                  {episode.order}.
                                </span>
                                <span>{episode.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner />
            Đang xử lý...
          </span>
        ) : (
          "Tạo Series"
        )}
      </Button>
    </form>
  );
}
