"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PurchaseButtonProps {
  seriesId: string;
  price: number;
  isPurchased?: boolean;
  onSuccess?: () => void;
}

export function PurchaseButton({
  seriesId,
  price,
  isPurchased = false,
  onSuccess,
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    try {
      setLoading(true);

      // TODO: Implement payment gateway integration
      const response = await fetch("/api/series/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seriesId,
          price,
        }),
      });

      if (!response.ok) {
        throw new Error("Purchase failed");
      }

      toast({
        title: "Purchase successful",
        description: "You now have access to this series",
      });

      onSuccess?.();
    } catch {
      toast({
        title: "Purchase failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isPurchased) {
    return (
      <Button disabled variant="outline">
        Purchased
      </Button>
    );
  }

  return (
    <Button onClick={handlePurchase} disabled={loading}>
      {loading ? "Processing..." : `Purchase for $${price}`}
    </Button>
  );
}
