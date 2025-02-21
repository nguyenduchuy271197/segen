import { Database } from "./supabase";

export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];

export interface NotificationWithProfile extends Notification {
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface LikeNotificationData {
  series_id: string;
  series_title: string;
  actor_id: string;
  actor_name: string;
}

export interface CommentNotificationData {
  series_id: string;
  series_title: string;
  comment_id: string;
  comment_content: string;
  actor_id: string;
  actor_name: string;
}

export interface FollowNotificationData {
  follower_id: string;
  follower_name: string;
}

export interface ReportNotificationData {
  series_id: string;
  series_title: string;
  report_id: string;
  reason: string;
  reporter_id: string;
  reporter_name: string;
}

export type NotificationData =
  | LikeNotificationData
  | CommentNotificationData
  | FollowNotificationData
  | ReportNotificationData;
