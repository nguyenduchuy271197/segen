"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";

interface DeleteSeriesButtonProps {
  seriesId: string;
}

export function DeleteSeriesButton({ seriesId }: DeleteSeriesButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("series")
        .delete()
        .eq("id", seriesId);

      if (error) throw error;

      setIsOpen(false);
      toast({
        title: "Series đã được xóa",
        description: "Series của bạn đã được xóa thành công",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting series:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa series. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa Series</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa series này? Hành động này không thể hoàn
            tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
