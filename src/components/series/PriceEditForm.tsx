"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/format";

interface PriceEditFormProps {
  seriesId: string;
  initialPrice: number | null;
}

export function PriceEditForm({ seriesId, initialPrice }: PriceEditFormProps) {
  const [price, setPrice] = useState(initialPrice || 0);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from("series")
        .update({ price })
        .eq("id", seriesId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Price updated successfully",
      });
      setIsEditing(false);
    } catch {
      toast({
        title: "Error",
        description: "Could not update price",
        variant: "destructive",
      });
    }
  };

  if (!isEditing) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm text-muted-foreground">Giá series</Label>
            <p className="text-lg font-medium">{formatPrice(price)}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Chỉnh sửa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg">
      <Label htmlFor="price">Giá series (VND)</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="price"
          type="number"
          min="0"
          step="1000"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
}
