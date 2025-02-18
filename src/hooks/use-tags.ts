import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tag } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

export function useTags(seriesId: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("series_tags")
        .select(
          `
          tags (
            id,
            name,
            created_at
          )
        `
        )
        .eq("series_id", seriesId);

      setTags(data?.map((st) => st.tags) || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, supabase]);

  const addTag = useCallback(
    async (name: string) => {
      const normalizedName = name.toLowerCase().trim();
      if (!normalizedName) return;

      try {
        let { data: tag } = await supabase
          .from("tags")
          .select()
          .eq("name", normalizedName)
          .single();

        if (!tag) {
          const { data: newTag, error: insertError } = await supabase
            .from("tags")
            .insert({ name: normalizedName })
            .select()
            .single();

          if (insertError) throw insertError;
          tag = newTag;
        }

        if (tag) {
          const { error: linkError } = await supabase
            .from("series_tags")
            .insert({
              series_id: seriesId,
              tag_id: tag.id,
            });

          if (linkError) throw linkError;
          setTags((prev) => [...prev, tag!]);
          toast({
            title: "Success",
            description: `Added tag "${tag.name}"`,
          });
        }
      } catch (error) {
        console.error("Error adding tag:", error);
        toast({
          title: "Error",
          description: "Failed to add tag",
          variant: "destructive",
        });
      }
    },
    [seriesId, supabase, toast]
  );

  const removeTag = useCallback(
    async (tagId: string) => {
      try {
        const { error } = await supabase
          .from("series_tags")
          .delete()
          .eq("series_id", seriesId)
          .eq("tag_id", tagId);

        if (error) throw error;
        setTags((prev) => prev.filter((t) => t.id !== tagId));
        toast({
          title: "Success",
          description: "Tag removed",
        });
      } catch (error) {
        console.error("Error removing tag:", error);
        toast({
          title: "Error",
          description: "Failed to remove tag",
          variant: "destructive",
        });
      }
    },
    [seriesId, supabase, toast]
  );

  return {
    tags,
    isLoading,
    addTag,
    removeTag,
    fetchTags,
  };
}
