"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  seriesId: string;
}

export function ShareButton({ seriesId }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/series/${seriesId}`;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Đã sao chép",
        description: "Đường dẫn đã được sao chép vào clipboard",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép đường dẫn",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="w-4 h-4 mr-2" />
      Chia sẻ
    </Button>
  );
}
