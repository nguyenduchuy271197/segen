"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SeriesForm } from "./SeriesForm";
import { PlusCircle } from "lucide-react";

interface CreateSeriesDialogProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function CreateSeriesDialog({
  variant = "gradient",
  size = "default",
  className,
}: CreateSeriesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo Series Mới
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo Series Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản để tạo series học tập của bạn
          </DialogDescription>
        </DialogHeader>
        <SeriesForm />
      </DialogContent>
    </Dialog>
  );
}
