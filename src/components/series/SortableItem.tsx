"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, PlusCircle, Trash } from "lucide-react";
import { type SectionType } from "./AIContentAssistant";

interface SortableItemProps {
  id: string;
  index: number;
  section: { title: string; type: SectionType };
  isLast?: boolean;
  updateSectionTitle: (index: number, title: string) => void;
  removeSection: (index: number) => void;
  insertSectionAfter: (index: number) => void;
  addSection: () => void;
  minSections: number;
}

export function SortableItem({
  id,
  index,
  section,
  isLast,
  updateSectionTitle,
  removeSection,
  insertSectionAfter,
  addSection,
  minSections,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2 group relative">
      <div className="border rounded-md bg-card">
        <div className="p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <Input
                value={section.title}
                onChange={(e) => updateSectionTitle(index, e.target.value)}
                placeholder="Tiêu đề phần"
                className="text-sm sm:text-base h-8 sm:h-10"
              />
            </div>
            <Button
              type="button"
              onClick={() => removeSection(index)}
              size="icon"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-8"
              disabled={minSections <= 2}
            >
              <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
          className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-background border-primary/30 shadow-sm"
        >
          <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
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
            className="h-6 sm:h-7 px-2 sm:px-3 text-xs gap-1 sm:gap-1.5 border-dashed border-muted-foreground/30"
          >
            <PlusCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Thêm phần cuối</span>
          </Button>
        </div>
      )}
    </div>
  );
} 