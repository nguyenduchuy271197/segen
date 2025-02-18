"use client";

import { Badge } from "@/components/ui/badge";
import { Tag } from "@/types/database";
import Link from "next/link";

interface TagCloudProps {
  tags: (Tag & { _count: { series_tags: number } })[];
}

export function TagCloud({ tags }: TagCloudProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tags/${tag.name}`}>
          <Badge variant="secondary" className="hover:bg-secondary/80">
            {tag.name}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {tag._count.series_tags}
            </span>
          </Badge>
        </Link>
      ))}
    </div>
  );
}
