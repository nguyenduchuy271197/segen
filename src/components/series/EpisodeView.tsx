"use client";

import { useState } from "react";
import { Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EpisodeContent } from "./EpisodeContent";

interface EpisodeViewProps {
  content: string;
  isOwner: boolean;
  episodeId: string;
}

export function EpisodeView({ content, isOwner, episodeId }: EpisodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-card rounded-lg p-8 shadow-sm">
      {isOwner && (
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4" />
                View Mode
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit Mode
              </>
            )}
          </Button>
        </div>
      )}
      <EpisodeContent
        content={content}
        isEditable={isOwner && isEditing} // Only allow editing if user is owner AND in edit mode
        episodeId={episodeId}
      />
    </div>
  );
}
