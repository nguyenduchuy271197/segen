import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./badge";
import { Lock, PlayCircle } from "lucide-react";

interface EpisodeCardProps {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  isPreview: boolean | null;
  seriesId: string;
  isOwner?: boolean;
  hasAccess?: boolean;
  className?: string;
}

export function EpisodeCard({
  id,
  title,
  description,
  orderNumber,
  isPreview = false,
  seriesId,
  isOwner = false,
  hasAccess = false,
  className,
}: EpisodeCardProps) {
  return (
    <Link href={`/series/${seriesId}/episodes/${id}`}>
      <div
        className={cn(
          "group border rounded-xl p-5 transition-all duration-300 hover:shadow-md hover:border-primary/20",
          !hasAccess && !isPreview && !isOwner && "bg-muted/30",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold",
              hasAccess || isPreview || isOwner
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {orderNumber}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={cn(
                  "font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors",
                  !hasAccess &&
                    !isPreview &&
                    !isOwner &&
                    "text-muted-foreground"
                )}
              >
                {title}
              </h3>

              {isPreview && (
                <Badge variant="outline" className="ml-2">
                  Preview
                </Badge>
              )}

              {isOwner && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  Owner
                </Badge>
              )}
            </div>

            {description && (
              <p
                className={cn(
                  "text-muted-foreground line-clamp-2 text-sm",
                  !hasAccess &&
                    !isPreview &&
                    !isOwner &&
                    "text-muted-foreground/70"
                )}
              >
                {description}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 ml-2">
            {hasAccess || isPreview || isOwner ? (
              <PlayCircle className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
