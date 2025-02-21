"use client";

import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useEffect, useState } from "react";
import {
  NotificationWithProfile,
  LikeNotificationData,
  CommentNotificationData,
  FollowNotificationData,
  ReportNotificationData,
} from "@/types/notification";
import { notificationService } from "@/services/notification.service";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/provider";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationWithProfile[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((current) => [
            payload.new as NotificationWithProfile,
            ...current,
          ]);
          setUnreadCount((count) => count + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  const loadNotifications = async () => {
    try {
      const notifications = await notificationService.getNotifications();
      setNotifications(notifications);
      setUnreadCount(notifications.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleNotificationClick = async (
    notification: NotificationWithProfile
  ) => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      setUnreadCount((count) => count - 1);
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
    }
  };

  // Type guard functions to ensure type safety
  const isLikeNotification = (data: unknown): data is LikeNotificationData => {
    const d = data as LikeNotificationData;
    return !!(d?.series_id && d?.series_title && d?.actor_id && d?.actor_name);
  };

  const isCommentNotification = (
    data: unknown
  ): data is CommentNotificationData => {
    const d = data as CommentNotificationData;
    return !!(
      d?.series_id &&
      d?.series_title &&
      d?.comment_id &&
      d?.comment_content &&
      d?.actor_id &&
      d?.actor_name
    );
  };

  const isFollowNotification = (
    data: unknown
  ): data is FollowNotificationData => {
    const d = data as FollowNotificationData;
    return !!(d?.follower_id && d?.follower_name);
  };

  const isReportNotification = (
    data: unknown
  ): data is ReportNotificationData => {
    const d = data as ReportNotificationData;
    return !!(
      d?.series_id &&
      d?.series_title &&
      d?.report_id &&
      d?.reason &&
      d?.reporter_id &&
      d?.reporter_name
    );
  };

  const renderNotification = (notification: NotificationWithProfile) => {
    if (typeof notification.data !== "object" || !notification.data) {
      return null;
    }

    switch (notification.type) {
      case "like_series": {
        if (!isLikeNotification(notification.data)) return null;
        const likeData = notification.data;
        return (
          <Link
            href={`/series/${likeData.series_id}`}
            className="block w-full text-left"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className={`p-4 ${notification.is_read ? "opacity-60" : ""}`}>
              <p className="text-sm">
                {likeData.actor_name} đã thích series &quot;
                {likeData.series_title}
                &quot; của bạn
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        );
      }

      case "comment": {
        if (!isCommentNotification(notification.data)) return null;
        const commentData = notification.data;
        return (
          <Link
            href={`/series/${commentData.series_id}`}
            className="block w-full text-left"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className={`p-4 ${notification.is_read ? "opacity-60" : ""}`}>
              <p className="text-sm">
                {commentData.actor_name} đã bình luận về series &quot;
                {commentData.series_title}&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        );
      }

      case "follow": {
        if (!isFollowNotification(notification.data)) return null;
        const followData = notification.data;
        return (
          <Link
            href={`/profile/${followData.follower_id}`}
            className="block w-full text-left"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className={`p-4 ${notification.is_read ? "opacity-60" : ""}`}>
              <p className="text-sm">
                {followData.follower_name} đã theo dõi bạn
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        );
      }

      case "report": {
        if (!isReportNotification(notification.data)) return null;
        const reportData = notification.data;
        return (
          <Link
            href={`/series/${reportData.series_id}`}
            className="block w-full text-left"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className={`p-4 ${notification.is_read ? "opacity-60" : ""}`}>
              <p className="text-sm">
                Series &quot;{reportData.series_title}&quot; của bạn đã bị báo
                cáo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        );
      }

      default:
        return null;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Không có thông báo
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="p-0">
              {renderNotification(notification)}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
