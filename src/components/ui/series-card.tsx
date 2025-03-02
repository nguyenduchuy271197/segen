import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./badge";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { formatDate } from "@/lib/format";
import { BookOpen, Eye, Star } from "lucide-react";

interface SeriesCardProps {
  id: string;
  title: string;
  description: string | null;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
  episodeCount: number;
  viewCount: number;
  tags: { id: string; name: string }[];
  price: number | null;
  isPremium: boolean;
  className?: string;
}

export function SeriesCard({
  id,
  title,
  description,
  authorName,
  authorAvatar,
  createdAt,
  episodeCount = 0,
  viewCount = 0,
  tags = [],
  price,
  isPremium = false,
  className,
}: SeriesCardProps) {
  return (
    <Link href={`/series/${id}`}>
      <div
        className={cn(
          "group bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/20 h-full flex flex-col",
          className
        )}
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-xl line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {isPremium && (
              <Badge
                variant="secondary"
                className="ml-2 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              >
                <Star className="h-3 w-3 mr-1 fill-current" /> Premium
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground line-clamp-2 mb-4 text-sm">
            {description}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 border-t flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={authorAvatar || ""} />
                <AvatarFallback>{authorName[0]}</AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">{authorName}</span>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center">
                <BookOpen className="h-3.5 w-3.5 mr-1" />
                <span>{episodeCount}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-3.5 w-3.5 mr-1" />
                <span>{viewCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 px-6 py-3 text-sm flex justify-between items-center">
          <span className="text-muted-foreground">{formatDate(createdAt)}</span>
          {price !== null && price > 0 ? (
            <span className="font-medium text-primary">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(price)}
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-medium">
              Miễn phí
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
