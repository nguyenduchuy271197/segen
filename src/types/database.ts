import type { Database } from "./supabase";

export type Series = Database["public"]["Tables"]["series"]["Row"];
export type Episode = Database["public"]["Tables"]["episodes"]["Row"];

export type SeriesInsert = Database["public"]["Tables"]["series"]["Insert"];
export type EpisodeInsert = Database["public"]["Tables"]["episodes"]["Insert"];

export type SeriesUpdate = Database["public"]["Tables"]["series"]["Update"];
export type EpisodeUpdate = Database["public"]["Tables"]["episodes"]["Update"];

export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];

export type LikeInsert = Database["public"]["Tables"]["likes"]["Insert"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type FollowInsert = Database["public"]["Tables"]["follows"]["Insert"];

export type Profile = Database["public"]["Tables"]["profiles"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Bookmark = Database["public"]["Tables"]["bookmarks"];
export type BookmarkUpdate =
  Database["public"]["Tables"]["bookmarks"]["Update"];
export type BookmarkWithRelations =
  Database["public"]["Tables"]["bookmarks"]["Row"] & {
    episodes: Database["public"]["Tables"]["episodes"]["Row"] & {
      series: Database["public"]["Tables"]["series"]["Row"];
    };
  };
