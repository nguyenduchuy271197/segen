"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SeriesForm } from "@/components/series/SeriesForm";

interface CreateSeriesDialogProps {
  trigger?: React.ReactNode;
}

export function CreateSeriesDialog({ trigger }: CreateSeriesDialogProps) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <Button className="gap-2">
      <PlusIcon className="h-4 w-4" />
      Tạo Series Mới
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Series Mới</DialogTitle>
          <DialogDescription>
            Nhập chủ đề bạn muốn tạo series học tập
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <SeriesForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
