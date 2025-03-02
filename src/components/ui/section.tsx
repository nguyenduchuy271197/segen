import { cn } from "@/lib/utils";
import React from "react";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  children,
  action,
  className,
}: SectionProps) {
  return (
    <section className={cn("py-8 md:py-12", className)}>
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight relative">
              {title}
              <span className="absolute -bottom-1 left-0 w-12 h-1 bg-primary rounded-full"></span>
            </h2>
            {description && (
              <p className="text-muted-foreground max-w-[700px]">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
