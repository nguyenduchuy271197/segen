"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { List } from "lucide-react";

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
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3");

    const items = Array.from(headings).map((heading) => {
      const id =
        heading.id ||
        heading.textContent?.toLowerCase().replace(/\s+/g, "-") ||
        "";

      // If heading doesn't have an ID, we need to add it to the content
      if (!heading.id && typeof document !== "undefined") {
        const contentHeadings = document.querySelectorAll("h1, h2, h3");
        contentHeadings.forEach((h) => {
          if (h.textContent === heading.textContent && !h.id) {
            h.id = id;
          }
        });
      }

      return {
        id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName[1]),
      };
    });

    setToc(items);
  }, [content]);

  // Track active heading on scroll
  useEffect(() => {
    if (typeof window === "undefined" || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    // Observe all headings
    toc.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      toc.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <Card className={cn("overflow-y-auto", className)}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <List className="h-4 w-4" />
          <h4 className="text-sm font-medium">Mục Lục</h4>
        </div>

        <nav className="space-y-1">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block py-1 text-sm transition-colors rounded hover:bg-muted px-2",
                {
                  "pl-4": item.level === 2,
                  "pl-6": item.level === 3,
                  "bg-muted/50 text-foreground font-medium":
                    activeId === item.id,
                  "text-muted-foreground": activeId !== item.id,
                }
              )}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                  setActiveId(item.id);
                  // Update URL hash without jumping
                  window.history.pushState(null, "", `#${item.id}`);
                }
              }}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </Card>
  );
}
