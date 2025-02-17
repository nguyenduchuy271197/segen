"use client";

import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function VisibilityToggle({
  seriesId,
  initialIsPublic,
}: {
  seriesId: string;
  initialIsPublic: boolean;
}) {
  const supabase = createClient();
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  const handleToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from("series")
        .update({ is_public: checked })
        .eq("id", seriesId);

      if (error) throw error;

      setIsPublic(checked);
      toast({
        title: "Thành công",
        description: `Series đã được chuyển sang chế độ ${
          checked ? "công khai" : "riêng tư"
        }`,
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể thay đổi chế độ hiển thị",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch checked={isPublic} onCheckedChange={handleToggle} />
      <span className="text-sm text-muted-foreground">
        {isPublic ? "Công khai" : "Riêng tư"}
      </span>
    </div>
  );
}
