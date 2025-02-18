"use client";

import { useState } from "react";
import { Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EpisodeContent } from "./EpisodeContent";
import { BookmarkButton } from "./BookmarkButton";

interface EpisodeViewProps {
  content: string;
  isOwner: boolean;
  episodeId: string;
  seriesId: string;
}

export function EpisodeView({
  content,
  isOwner,
  episodeId,
  seriesId,
}: EpisodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-card rounded-lg p-8 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
              {isEditing ? "View Mode" : "Edit Mode"}
            </Button>
          )}
          <BookmarkButton episodeId={episodeId} seriesId={seriesId} />
        </div>
      </div>
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
        isEditable={isOwner && isEditing}
        episodeId={episodeId}
      />
    </div>
  );
}
