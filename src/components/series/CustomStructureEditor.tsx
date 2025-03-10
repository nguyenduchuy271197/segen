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
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { type SectionType } from "./AIContentAssistant";
import { type ContentStyle } from "./TemplateSelection";

interface CustomStructureEditorProps {
  customSections: Array<{ title: string; type: SectionType }>;
  style: ContentStyle;
  setStyle: (style: ContentStyle) => void;
  onBackClick: () => void;
  updateSectionTitle: (index: number, title: string) => void;
  removeSection: (index: number) => void;
  insertSectionAfter: (index: number) => void;
  addSection: () => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function CustomStructureEditor({
  customSections,
  style,
  setStyle,
  onBackClick,
  updateSectionTitle,
  removeSection,
  insertSectionAfter,
  addSection,
  handleDragEnd,
}: CustomStructureEditorProps) {
  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="mr-1 p-0 h-8 w-8 rounded-full hover:bg-muted"
            title="Quay lại chọn mẫu"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
          <h3 className="font-medium text-sm sm:text-base">Cấu trúc bài học</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="style-custom" className="text-sm whitespace-nowrap">
              Phong cách:
            </Label>
            <Select
              value={style}
              onValueChange={(value) => setStyle(value as ContentStyle)}
            >
              <SelectTrigger id="style-custom" className="w-full sm:w-[140px]">
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
                ` → ${customSections[customSections.length - 1].title}`}
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
  );
}
