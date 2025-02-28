import { cn } from "@/lib/utils";
import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function Section({
  title,
  description,
  children,
  action,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-8 px-6", className)} {...props}>
      <div className="max-w-screen-xl mx-auto">
        {(title || action) && (
          <div className="flex items-center justify-between mb-8">
            <div>
              {title && <h2 className="text-2xl font-bold">{title}</h2>}
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
