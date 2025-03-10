"use client";

import { useState, ReactNode, useEffect } from "react";
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
import {
  Sparkles,
  Loader2,
  BookOpen,
  Lightbulb,
  GraduationCap,
  Plus,
  Trash,
  ChevronDown,
  ChevronUp,
  Save,
  Star,
  GripVertical,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EpisodeTemplate } from "@/lib/ai/types";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// User saved templates storage key
const USER_TEMPLATES_KEY = "user_saved_templates";

interface SavedTemplate {
  id: string;
  name: string;
  sections: Array<{ title: string; type: string }>;
  createdAt: string;
}

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>("tutorial");
  const [style, setStyle] = useState<ContentStyle>("conversational");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customSections, setCustomSections] = useState<
    Array<{ title: string; type: SectionType }>
  >([
    { title: "Giới thiệu", type: "concept" },
    { title: "Nội dung chính", type: "concept" },
    { title: "Ví dụ minh họa", type: "example" },
    { title: "Tổng kết", type: "summary" },
  ]);
  const [userTemplates, setUserTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [hasModifiedStructure, setHasModifiedStructure] = useState(false);
  const { toast } = useToast();

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load user templates on component mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem(USER_TEMPLATES_KEY);
    if (savedTemplates) {
      try {
        setUserTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error("Failed to parse saved templates", e);
      }
    }
  }, []);

  // Track structure modifications
  useEffect(() => {
    if (isCustomizing) {
      setHasModifiedStructure(true);
    }
  }, [customSections, isCustomizing]);

  const addSection = () => {
    setCustomSections([
      ...customSections,
      { title: "Phần mới", type: "concept" },
    ]);
  };

  const insertSectionAfter = (index: number) => {
    const newSections = [...customSections];
    newSections.splice(index + 1, 0, { title: "Phần mới", type: "concept" });
    setCustomSections(newSections);
  };

  const removeSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updated = [...customSections];
    updated[index] = { ...updated[index], title };
    setCustomSections(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCustomSections((items) => {
        const oldIndex = items.findIndex(
          (_, i) => `section-${i}` === active.id
        );
        const newIndex = items.findIndex((_, i) => `section-${i}` === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Tên mẫu không được để trống",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: SavedTemplate = {
      id: `user-${Date.now()}`,
      name: templateName,
      sections: customSections,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...userTemplates, newTemplate];
    setUserTemplates(updatedTemplates);
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updatedTemplates));

    toast({
      title: "Đã lưu mẫu thành công",
      description: `Mẫu "${templateName}" đã được lưu và có thể sử dụng lại`,
    });

    setTemplateName("");
    setShowSaveDialog(false);
    setHasModifiedStructure(false);
  };

  const loadUserTemplate = (template: SavedTemplate) => {
    setCustomSections(
      template.sections as Array<{ title: string; type: SectionType }>
    );
    setIsCustomizing(true);

    toast({
      title: "Đã tải mẫu",
      description: `Mẫu "${template.name}" đã được tải`,
    });
  };

  const deleteUserTemplate = (templateId: string) => {
    const updatedTemplates = userTemplates.filter((t) => t.id !== templateId);
    setUserTemplates(updatedTemplates);
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updatedTemplates));

    toast({
      title: "Đã xóa mẫu",
    });
  };

  const getStructure = () => {
    if (isCustomizing) {
      return { sections: customSections };
    }
    return (
      DEFAULT_TEMPLATES.find((t) => t.id === selectedTemplate)?.structure ||
      DEFAULT_TEMPLATES[0].structure
    );
  };

  const handleGenerateClick = () => {
    if (isCustomizing && hasModifiedStructure) {
      setShowSaveConfirmation(true);
    } else {
      generateContent();
    }
  };

  const generateContent = async () => {
    setIsLoading(true);
    setShowSaveConfirmation(false);

    try {
      // Generate content with the selected template or custom structure
      const response = await fetch("/api/ai/generate-structured-episode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId,
          episodeId,
          structure: getStructure(),
          options: {
            style,
          },
        }),
      });

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

  // SortableItem component for drag and drop
  function SortableItem({
    id,
    index,
    section,
    isLast,
  }: {
    id: string;
    index: number;
    section: { title: string; type: SectionType };
    isLast?: boolean;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} className="mb-2 group relative">
        <div className="border rounded-md bg-card">
          <div className="p-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Input
                  value={section.title}
                  onChange={(e) => updateSectionTitle(index, e.target.value)}
                  placeholder="Tiêu đề phần"
                />
              </div>
              <Button
                type="button"
                onClick={() => removeSection(index)}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                disabled={customSections.length <= 2}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Insert button that appears on hover or focus */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
          <Button
            type="button"
            onClick={() => insertSectionAfter(index)}
            size="icon"
            variant="outline"
            className="h-6 w-6 rounded-full bg-background border-primary/30 shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5 text-primary" />
            <span className="sr-only">Chèn phần mới</span>
          </Button>
        </div>

        {/* Add section button after the last item */}
        {isLast && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 mt-2">
            <Button
              type="button"
              onClick={addSection}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs gap-1.5 border-dashed border-muted-foreground/30"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Thêm phần cuối</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo nội dung bài học với AI</DialogTitle>
          <DialogDescription>
            Chọn cấu trúc bài học phù hợp cho &ldquo;{episodeTitle}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isCustomizing ? (
            <>
              {/* Template Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Chọn mẫu cấu trúc</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="style" className="text-sm">
                      Phong cách viết:
                    </Label>
                    <Select
                      value={style}
                      onValueChange={(value) => setStyle(value as ContentStyle)}
                    >
                      <SelectTrigger id="style" className="w-[140px]">
                        <SelectValue placeholder="Chọn phong cách" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversational">
                          Trò chuyện
                        </SelectItem>
                        <SelectItem value="academic">Học thuật</SelectItem>
                        <SelectItem value="practical">Thực tiễn</SelectItem>
                        <SelectItem value="storytelling">Kể chuyện</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Default Templates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center gap-2">
                          {template.id === "tutorial" && (
                            <BookOpen className="h-8 w-8 text-primary mb-1" />
                          )}
                          {template.id === "concept" && (
                            <Lightbulb className="h-8 w-8 text-primary mb-1" />
                          )}
                          {template.id === "case-study" && (
                            <GraduationCap className="h-8 w-8 text-primary mb-1" />
                          )}
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="text-xs text-muted-foreground">
                            {template.structure.sections.map(
                              (section, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-1 mb-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                  <span>{section.title}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* User Saved Templates */}
                {userTemplates.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Mẫu đã lưu</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer transition-all hover:border-primary/50"
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500" />
                                  <h3 className="font-medium">
                                    {template.name}
                                  </h3>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {template.sections
                                    .slice(0, 3)
                                    .map((section, index) => (
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
                  onClick={() => {
                    // Initialize custom sections based on selected template
                    const template = DEFAULT_TEMPLATES.find(
                      (t) => t.id === selectedTemplate
                    );
                    if (template) {
                      setCustomSections(
                        template.structure.sections.map((s) => ({
                          title: s.title,
                          type: s.type,
                        }))
                      );
                    }
                    setIsCustomizing(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tùy chỉnh cấu trúc bài học
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Custom Structure Editor */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Tùy chỉnh cấu trúc bài học</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="style-custom" className="text-sm">
                      Phong cách:
                    </Label>
                    <Select
                      value={style}
                      onValueChange={(value) => setStyle(value as ContentStyle)}
                    >
                      <SelectTrigger id="style-custom" className="w-[140px]">
                        <SelectValue placeholder="Chọn phong cách" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversational">
                          Trò chuyện
                        </SelectItem>
                        <SelectItem value="academic">Học thuật</SelectItem>
                        <SelectItem value="practical">Thực tiễn</SelectItem>
                        <SelectItem value="storytelling">Kể chuyện</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCustomizing(false)}
                    >
                      Quay lại
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md bg-muted/20">
                  {/* Structure summary */}
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Cấu trúc ({customSections.length} phần)
                      </span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {customSections.length > 0 && customSections[0].title}
                        {customSections.length > 1 &&
                          ` → ${
                            customSections[customSections.length - 1].title
                          }`}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Kéo thả để sắp xếp
                    </div>
                  </div>

                  {/* Scrollable section list with visual indicators */}
                  <div className="relative">
                    <div className="max-h-[300px] overflow-y-auto p-3 pb-10 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={customSections.map((_, i) => `section-${i}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {customSections.map((section, index) => (
                            <SortableItem
                              key={`section-${index}`}
                              id={`section-${index}`}
                              index={index}
                              section={section}
                              isLast={index === customSections.length - 1}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>

                    {/* Scroll indicators */}
                    <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-b from-muted/50 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {showSaveDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
                      <h3 className="text-lg font-medium mb-4">
                        Lưu cấu trúc bài học
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Lưu cấu trúc này để sử dụng lại cho các bài học khác
                        trong tương lai.
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="template-name">Tên cấu trúc</Label>
                          <Input
                            id="template-name"
                            placeholder="Nhập tên cấu trúc"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            autoFocus
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowSaveDialog(false);
                              setTemplateName("");
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={saveTemplate}
                            disabled={!templateName.trim()}
                          >
                            Lưu
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          {isCustomizing && (
            <Button
              type="button"
              onClick={() => setShowSaveDialog(true)}
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              Lưu cấu trúc
            </Button>
          )}

          <Button
            type="button"
            onClick={handleGenerateClick}
            disabled={isLoading}
            className={cn("gap-2", !isCustomizing && "ml-auto")}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isLoading ? "Đang tạo nội dung..." : "Tạo nội dung"}
          </Button>
        </DialogFooter>

        {/* Save Confirmation Dialog */}
        {showSaveConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
              <h3 className="text-lg font-medium mb-4">
                Lưu cấu trúc bài học?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bạn đã tùy chỉnh cấu trúc bài học. Bạn có muốn lưu lại để sử
                dụng sau này không?
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveConfirmation(false);
                    generateContent();
                  }}
                >
                  Không, tiếp tục
                </Button>
                <Button
                  onClick={() => {
                    setShowSaveConfirmation(false);
                    setShowSaveDialog(true);
                  }}
                >
                  Lưu cấu trúc
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
