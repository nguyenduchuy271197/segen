"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
  content: string;
  className?: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3");

    const items = Array.from(headings).map((heading) => ({
      id:
        heading.id ||
        heading.textContent?.toLowerCase().replace(/\s+/g, "-") ||
        "",
      text: heading.textContent || "",
      level: parseInt(heading.tagName[1]),
    }));

    setToc(items);
  }, [content]);

  return (
    <div className={cn("overflow-y-auto border-l", className)}>
      <div className="space-y-1 p-4">
        <h4 className="text-sm font-medium mb-4">Mục Lục</h4>
        {toc.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block text-sm text-muted-foreground hover:text-foreground transition-colors",
              {
                "pl-4": item.level === 2,
                "pl-8": item.level === 3,
              }
            )}
          >
            {item.text}
          </a>
        ))}
      </div>
    </div>
  );
}
