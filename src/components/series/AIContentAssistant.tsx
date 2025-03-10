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
import { Sparkles, Loader2, ArrowLeft, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import {
  TemplateSelection,
  DEFAULT_TEMPLATES,
  SavedTemplate,
  ContentStyle,
} from "./TemplateSelection";

// Constants
const USER_TEMPLATES_KEY = "user_templates";

interface AIContentAssistantProps {
  episodeId: string;
  seriesId: string;
  seriesTitle: string;
  episodeTitle: string;
  onContentGenerated: (content: string) => void;
  trigger?: ReactNode;
}

export type SectionType = "concept" | "example" | "exercise" | "summary";

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

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
              data-testid="ai-assistant-button"
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Trợ lý AI
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[85vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {isCustomizing
                ? "Tùy chỉnh cấu trúc bài học"
                : "Tạo nội dung bài học với AI"}
            </DialogTitle>
            <DialogDescription>
              {isCustomizing
                ? "Điều chỉnh cấu trúc bài học theo nhu cầu của bạn"
                : `Chọn cấu trúc bài học phù hợp cho "${episodeTitle}"`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2 sm:py-4">
            {!isCustomizing ? (
              <TemplateSelection
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                style={style}
                setStyle={setStyle}
                userTemplates={userTemplates}
                loadUserTemplate={loadUserTemplate}
                deleteUserTemplate={deleteUserTemplate}
                onCustomizeClick={() => {
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
              />
            ) : (
              <>
                {/* Custom Structure Editor */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCustomizing(false)}
                        className="mr-1 p-0 h-8 w-8 rounded-full hover:bg-muted"
                        title="Quay lại chọn mẫu"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Quay lại</span>
                      </Button>
                      <h3 className="font-medium text-sm sm:text-base">
                        Cấu trúc bài học
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Label
                          htmlFor="style-custom"
                          className="text-sm whitespace-nowrap"
                        >
                          Phong cách:
                        </Label>
                        <Select
                          value={style}
                          onValueChange={(value) =>
                            setStyle(value as ContentStyle)
                          }
                        >
                          <SelectTrigger
                            id="style-custom"
                            className="w-full sm:w-[140px]"
                          >
                            <SelectValue placeholder="Chọn phong cách" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conversational">
                              Trò chuyện
                            </SelectItem>
                            <SelectItem value="academic">Học thuật</SelectItem>
                            <SelectItem value="practical">Thực tiễn</SelectItem>
                            <SelectItem value="storytelling">
                              Kể chuyện
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md bg-muted/20">
                    {/* Structure summary */}
                    <div className="p-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Cấu trúc ({customSections.length} phần)
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs font-normal truncate max-w-[150px] sm:max-w-[200px]"
                        >
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
                      <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto p-3 pb-10 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={customSections.map((_, i) => `item-${i}`)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-1">
                              {customSections.map((section, index) => (
                                <SortableItem
                                  key={`item-${index}`}
                                  id={`item-${index}`}
                                  index={index}
                                  section={section}
                                  isLast={index === customSections.length - 1}
                                  updateSectionTitle={updateSectionTitle}
                                  removeSection={removeSection}
                                  insertSectionAfter={insertSectionAfter}
                                  addSection={addSection}
                                  minSections={customSections.length}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>

                      {/* Scroll indicators */}
                      <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-b from-muted/50 to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3">
            {isCustomizing ? (
              <>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => setShowSaveDialog(true)}
                    size="sm"
                    variant="outline"
                    className="gap-1 w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                    Lưu cấu trúc
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsCustomizing(false)}
                    className="gap-1 w-full sm:w-auto sm:hidden"
                    disabled={isLoading}
                  >
                    Quay lại
                  </Button>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateClick}
                  disabled={isLoading}
                  className="gap-2 w-full sm:w-auto"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isLoading ? "Đang tạo nội dung..." : "Tạo nội dung"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handleGenerateClick}
                disabled={isLoading}
                className="gap-2 w-full sm:w-auto sm:ml-auto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isLoading ? "Đang tạo nội dung..." : "Tạo nội dung"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lưu cấu trúc bài học</DialogTitle>
            <DialogDescription>
              Lưu cấu trúc này để sử dụng lại cho các bài học khác trong tương
              lai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setTemplateName("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={saveTemplate} disabled={!templateName.trim()}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lưu cấu trúc bài học?</DialogTitle>
            <DialogDescription>
              Bạn đã tùy chỉnh cấu trúc bài học. Bạn có muốn lưu lại để sử dụng
              sau này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setShowSaveConfirmation(false);
                generateContent();
              }}
            >
              Không, tiếp tục
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                setShowSaveConfirmation(false);
                setShowSaveDialog(true);
              }}
            >
              Lưu cấu trúc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
