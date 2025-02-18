"use client";

import { createClient } from "@/lib/supabase/client";
import { EpisodeEditor } from "./EpisodeEditor";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState, useCallback } from "react";
import { SaveIndicator } from "./SaveIndicator";

interface EpisodeContentProps {
  content: string;
  isEditable: boolean;
  episodeId: string;
}

export function EpisodeContent({
  content,
  isEditable,
  episodeId,
}: EpisodeContentProps) {
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "error">(
    "saved"
  );
  const [localContent, setLocalContent] = useState(content);
  const debouncedContent = useDebounce(localContent, 1000);

  const handleSave = useCallback(
    async (newContent: string) => {
      setSaveStatus("saving");
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("episodes")
          .update({ content: newContent })
          .eq("id", episodeId);

        if (error) throw error;
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [episodeId]
  );

  useEffect(() => {
    if (debouncedContent !== content) {
      handleSave(debouncedContent);
    }
  }, [content, debouncedContent, handleSave]);

  return (
    <div className="space-y-4">
      <EpisodeEditor
        content={content}
        isEditable={isEditable}
        onChange={(newContent) => setLocalContent(newContent)}
      />
      {isEditable && <SaveIndicator status={saveStatus} />}
    </div>
  );
}
