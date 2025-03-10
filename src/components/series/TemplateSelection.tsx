"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Lightbulb,
  GraduationCap,
  Plus,
  Trash,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EpisodeTemplate } from "@/lib/ai/types";

// Predefined templates
export const DEFAULT_TEMPLATES: EpisodeTemplate[] = [
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
      ],
    },
  },
];

export interface SavedTemplate {
  id: string;
  name: string;
  sections: Array<{ title: string; type: string }>;
  createdAt: string;
}

export type ContentStyle =
  | "conversational"
  | "academic"
  | "practical"
  | "storytelling";

interface TemplateSelectionProps {
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  style: ContentStyle;
  setStyle: (style: ContentStyle) => void;
  userTemplates: SavedTemplate[];
  loadUserTemplate: (template: SavedTemplate) => void;
  deleteUserTemplate: (templateId: string) => void;
  onCustomizeClick: () => void;
}

export function TemplateSelection({
  selectedTemplate,
  setSelectedTemplate,
  style,
  setStyle,
  userTemplates,
  loadUserTemplate,
  deleteUserTemplate,
  onCustomizeClick,
}: TemplateSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
        <h3 className="text-sm font-medium">Chọn mẫu cấu trúc</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="style" className="text-sm whitespace-nowrap">
            Phong cách viết:
          </Label>
          <Select
            value={style}
            onValueChange={(value) => setStyle(value as ContentStyle)}
          >
            <SelectTrigger id="style" className="w-full sm:w-[140px]">
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
      </div>

      {/* Default Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {DEFAULT_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedTemplate === template.id
                ? "border-primary bg-primary/5"
                : ""
            )}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-center text-center gap-2">
                {template.id === "tutorial" && (
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1" />
                )}
                {template.id === "concept" && (
                  <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1" />
                )}
                {template.id === "case-study" && (
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1" />
                )}
                <h3 className="font-medium text-sm sm:text-base">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </div>
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  {template.structure.sections.map((section, index) => (
                    <div key={index} className="flex items-center gap-1 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <span>{section.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Saved Templates */}
      {userTemplates.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h3 className="text-sm font-medium mb-2">Mẫu đã lưu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userTemplates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:border-primary/50"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500" />
                        <h3 className="font-medium text-sm sm:text-base">
                          {template.name}
                        </h3>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {template.sections.slice(0, 3).map((section, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 mb-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                            <span>{section.title}</span>
                          </div>
                        ))}
                        {template.sections.length > 3 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            + {template.sections.length - 3} phần khác
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadUserTemplate(template);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUserTemplate(template.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        className="w-full mt-2"
        onClick={onCustomizeClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Tùy chỉnh cấu trúc bài học
      </Button>
    </div>
  );
}
