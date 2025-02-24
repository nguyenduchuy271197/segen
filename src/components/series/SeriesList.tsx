import { SeriesWithTags } from "@/types/database";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

interface SeriesListProps {
  series: SeriesWithTags[];
}

export function SeriesList({ series }: SeriesListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {series.map((item) => (
        <Link
          key={item.id}
          href={`/series/${item.id}`}
          className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <h2 className="font-semibold">{item.title}</h2>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {item.description}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatPrice(item.price)}
            </span>
            <div className="flex flex-wrap gap-2 mt-3">
              {item.series_tags?.map((st) => (
                <Badge key={st.tags.id} variant="secondary">
                  {st.tags.name}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
