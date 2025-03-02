import { SeriesCard } from "@/components/ui/series-card";
import { cn } from "@/lib/utils";

type SeriesWithAuthor = {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean | null;
  price: number | null;
  user_id: string;
  created_at: string;
  view_count: number | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  series_tags?: {
    tags: {
      id: string;
      name: string;
    };
  }[];
};

interface SeriesListProps {
  series: SeriesWithAuthor[];
  className?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function SeriesList({
  series,
  className,
  emptyMessage = "Không có series nào",
  emptyAction,
  columns = 3,
}: SeriesListProps) {
  const columnsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (!series || series.length === 0) {
    return (
      <div className="text-center py-12 border rounded-xl bg-card">
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className={cn(`grid ${columnsClass[columns]} gap-6`, className)}>
      {series.map((item) => (
        <SeriesCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          authorName={item.profiles?.full_name || "Unnamed User"}
          authorAvatar={item.profiles?.avatar_url}
          createdAt={item.created_at}
          episodeCount={0}
          viewCount={item.view_count || 0}
          tags={item.series_tags?.map((st) => st.tags) || []}
          price={item.price}
          isPremium={(item.price || 0) > 0}
        />
      ))}
    </div>
  );
}
