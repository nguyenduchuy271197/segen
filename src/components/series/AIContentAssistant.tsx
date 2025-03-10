"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, Plus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EpisodeTemplate } from "@/lib/ai/types";

// Predefined templates
const DEFAULT_TEMPLATES: EpisodeTemplate[] = [
  {
    id: "tutorial",
    name: "Hướng dẫn thực hành",
    description: "Mẫu dành cho bài học hướng dẫn thực hành với các bước cụ thể",
    structure: {
      sections: [
        {
          title: "Giới thiệu",
          type: "concept",
          keyPoints: ["Tổng quan về chủ đề", "Mục tiêu của bài học"],
        },
        {
          title: "Kiến thức nền tảng",
          type: "concept",
        },
        {
          title: "Hướng dẫn từng bước",
          type: "example",
        },
        {
          title: "Ví dụ thực tế",
          type: "example",
        },
        {
          title: "Bài tập thực hành",
          type: "exercise",
        },
        {
          title: "Tổng kết",
          type: "summary",
        },
      ],
    },
  },
  {
    id: "concept",
    name: "Giải thích khái niệm",
    description: "Mẫu dành cho bài học giải thích khái niệm lý thuyết",
    structure: {
      sections: [
        {
          title: "Giới thiệu khái niệm",
          type: "concept",
        },
        {
          title: "Định nghĩa và giải thích",
          type: "concept",
        },
        {
          title: "Ví dụ minh họa",
          type: "example",
        },
        {
          title: "Ứng dụng thực tế",
          type: "example",
        },
        {
          title: "Câu hỏi ôn tập",
          type: "exercise",
        },
        {
          title: "Tổng kết",
          type: "summary",
        },
      ],
    },
  },
  {
    id: "case-study",
    name: "Nghiên cứu tình huống",
    description: "Mẫu dành cho bài học phân tích tình huống thực tế",
    structure: {
      sections: [
        {
          title: "Bối cảnh",
          type: "concept",
        },
        {
          title: "Vấn đề",
          type: "concept",
        },
        {
          title: "Phân tích",
          type: "example",
        },
        {
          title: "Giải pháp",
          type: "example",
        },
        {
          title: "Bài học kinh nghiệm",
          type: "summary",
        },
        {
          title: "Câu hỏi thảo luận",
          type: "exercise",
        },
      ],
    },
  },
];

interface AIContentAssistantProps {
  episodeId: string;
  seriesId: string;
  seriesTitle: string;
  episodeTitle: string;
  onContentGenerated: (content: string) => void;
  trigger?: ReactNode;
}

type ContentStyle =
  | "conversational"
  | "academic"
  | "practical"
  | "storytelling";
type DifficultyLevel = "beginner" | "intermediate" | "advanced";
type SectionType = "concept" | "example" | "exercise" | "summary";

export function AIContentAssistant({
  episodeId,
  seriesId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  seriesTitle,
  episodeTitle,
  onContentGenerated,
  trigger,
}: AIContentAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("quick");
  const [style, setStyle] = useState<ContentStyle>("conversational");
  const [includeExercises, setIncludeExercises] = useState(true);
  const [difficultyLevel, setDifficultyLevel] =
    useState<DifficultyLevel>("intermediate");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("tutorial");
  const [customTemplate, setCustomTemplate] = useState<
    EpisodeTemplate["structure"]
  >({
    sections: [
      { title: "Giới thiệu", type: "concept" },
      { title: "Nội dung chính", type: "concept" },
      { title: "Tổng kết", type: "summary" },
    ],
  });
  const { toast } = useToast();

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const addSection = () => {
    setCustomTemplate({
      ...customTemplate,
      sections: [
        ...customTemplate.sections,
        { title: "Phần mới", type: "concept" },
      ],
    });
  };

  const removeSection = (index: number) => {
    setCustomTemplate({
      ...customTemplate,
      sections: customTemplate.sections.filter((_, i) => i !== index),
    });
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updatedSections = [...customTemplate.sections];
    updatedSections[index] = { ...updatedSections[index], title };
    setCustomTemplate({ ...customTemplate, sections: updatedSections });
  };

  const updateSectionType = (index: number, type: SectionType) => {
    const updatedSections = [...customTemplate.sections];
    updatedSections[index] = { ...updatedSections[index], type };
    setCustomTemplate({ ...customTemplate, sections: updatedSections });
  };

  const getSelectedTemplate = (): EpisodeTemplate["structure"] => {
    if (activeTab === "template") {
      return (
        DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplateId)?.structure ||
        DEFAULT_TEMPLATES[0].structure
      );
    } else if (activeTab === "custom") {
      return customTemplate;
    }
    return { sections: [] };
  };

  const generateContent = async () => {
    setIsLoading(true);

    try {
      let response;

      if (activeTab === "quick") {
        // Quick generation with style options
        response = await fetch("/api/ai/generate-episode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seriesId,
            episodeId,
            options: {
              style,
              includeExercises,
              difficultyLevel,
              targetAudience: targetAudience || undefined,
              keyPoints: keyPoints.length > 0 ? keyPoints : undefined,
            },
          }),
        });
      } else {
        // Structured generation with template
        response = await fetch("/api/ai/generate-structured-episode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seriesId,
            episodeId,
            structure: getSelectedTemplate(),
          }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể tạo nội dung");
      }

      const data = await response.json();

      // Update episode with generated content
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("episodes")
        .update({
          content: data.content.content,
        })
        .eq("id", episodeId)
        .eq("series_id", seriesId);

      if (updateError) throw updateError;

      onContentGenerated(data.content.content);

      toast({
        title: "Tạo nội dung thành công",
        description: "Nội dung bài học đã được tạo",
      });
    } catch (error) {
      toast({
        title: "Lỗi khi tạo nội dung",
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không mong muốn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            data-testid="ai-assistant-button"
          >
            <Sparkles className="h-4 w-4" />
            Trợ lý AI
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trợ lý tạo nội dung AI</DialogTitle>
          <DialogDescription>
            Sử dụng AI để tạo nội dung cho bài học &ldquo;{episodeTitle}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="quick">Tạo nhanh</TabsTrigger>
            <TabsTrigger value="template">Mẫu có sẵn</TabsTrigger>
            <TabsTrigger value="custom">Tùy chỉnh cấu trúc</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="style">Phong cách viết</Label>
                <Select
                  value={style}
                  onValueChange={(value) => setStyle(value as ContentStyle)}
                >
                  <SelectTrigger id="style">
                    <SelectValue placeholder="Chọn phong cách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversational">Trò chuyện</SelectItem>
                    <SelectItem value="academic">Học thuật</SelectItem>
                    <SelectItem value="practical">Thực tiễn</SelectItem>
                    <SelectItem value="storytelling">Kể chuyện</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Độ khó</Label>
                <Select
                  value={difficultyLevel}
                  onValueChange={(value) =>
                    setDifficultyLevel(value as DifficultyLevel)
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Cơ bản</SelectItem>
                    <SelectItem value="intermediate">Trung cấp</SelectItem>
                    <SelectItem value="advanced">Nâng cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">
                Đối tượng người học (không bắt buộc)
              </Label>
              <Input
                id="audience"
                placeholder="Ví dụ: Sinh viên đại học, Người mới bắt đầu..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="exercises"
                checked={includeExercises}
                onCheckedChange={setIncludeExercises}
              />
              <Label htmlFor="exercises">Bao gồm bài tập thực hành</Label>
            </div>

            <div className="space-y-2">
              <Label>Điểm chính cần đề cập</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm điểm chính"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addKeyPoint();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyPoint} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {keyPoints.map((point, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {point}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeKeyPoint(index)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplateId === template.id
                      ? "border-primary"
                      : "hover:border-muted-foreground/20"
                  }`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full ${
                          selectedTemplateId === template.id
                            ? "bg-primary"
                            : "bg-muted"
                        }`}
                      />
                    </div>
                    <div className="mt-4 space-y-1">
                      {template.structure.sections.map((section, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground flex items-center"
                        >
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 mr-2" />
                          {section.title}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Cấu trúc bài học tùy chỉnh</Label>
                <Button
                  type="button"
                  onClick={addSection}
                  size="sm"
                  variant="outline"
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" /> Thêm phần
                </Button>
              </div>

              <div className="space-y-3">
                {customTemplate.sections.map((section, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 border p-3 rounded-md"
                  >
                    <div className="flex-1">
                      <Input
                        value={section.title}
                        onChange={(e) =>
                          updateSectionTitle(index, e.target.value)
                        }
                        placeholder="Tiêu đề phần"
                      />
                    </div>
                    <Select
                      value={section.type}
                      onValueChange={(value) =>
                        updateSectionType(index, value as SectionType)
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concept">Khái niệm</SelectItem>
                        <SelectItem value="example">Ví dụ</SelectItem>
                        <SelectItem value="exercise">Bài tập</SelectItem>
                        <SelectItem value="summary">Tổng kết</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => removeSection(index)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={generateContent}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isLoading ? "Đang tạo nội dung..." : "Tạo nội dung"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
