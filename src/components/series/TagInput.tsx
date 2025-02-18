"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Hash } from "lucide-react";
import { useTags } from "@/hooks/use-tags";
import { cn } from "@/lib/utils";

interface TagInputProps {
  seriesId: string;
  initialTags?: Tag[];
  disabled?: boolean;
}

export function TagInput({
  seriesId,
  initialTags = [],
  disabled,
}: TagInputProps) {
  const { tags, isLoading, addTag, removeTag, fetchTags } = useTags(seriesId);
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (initialTags.length === 0) {
      fetchTags();
    }
  }, [initialTags.length, fetchTags]);

  const displayTags = initialTags.length > 0 ? initialTags : tags;

  if (isLoading && initialTags.length === 0) {
    return <div className="animate-pulse h-10 bg-muted rounded" />;
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-wrap gap-2 min-h-[2.5rem] p-2 rounded-md border",
          isFocused && "ring-2 ring-ring",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {displayTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="h-6 px-2 text-sm font-normal"
          >
            <Hash className="w-3 h-3 mr-1 text-muted-foreground" />
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 hover:text-destructive focus:outline-none focus:text-destructive"
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.trim()) {
                addTag(input);
                setInput("");
              }
            } else if (
              e.key === "Backspace" &&
              !input &&
              displayTags.length > 0
            ) {
              removeTag(displayTags[displayTags.length - 1].id);
            }
          }}
          placeholder={displayTags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[120px] border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0"
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to add a tag, Backspace to remove the last tag
      </p>
    </div>
  );
}
