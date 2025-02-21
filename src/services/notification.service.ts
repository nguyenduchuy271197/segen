import { createClient } from "@/lib/supabase/client";
import { NotificationWithProfile } from "@/types/notification";

export const notificationService = {
  async getNotifications() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as NotificationWithProfile[];
  },

  async markAsRead(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
  },
};
