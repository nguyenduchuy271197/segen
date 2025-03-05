import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Section } from "@/components/ui/section";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { MainWithSidebar } from "@/components/layout/MainWithSidebar";
import { BookOpen, Heart, ShoppingBag } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  // Get user stats
  const { count: seriesCountValue } = await supabase
    .from("series")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: likesCountValue } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: purchasesCountValue } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const transformedProfile = profile
    ? {
        ...profile,
        full_name: profile.full_name || undefined,
        avatar_url: profile.avatar_url || undefined,
        bio: profile.bio || undefined,
      }
    : null;

  const mainContent = (
    <>
      <Section
        title="Hồ sơ của tôi"
        description="Quản lý thông tin cá nhân của bạn"
      >
        <div className="bg-card border rounded-xl p-6">
          <ProfileForm user={user} profile={transformedProfile} />
        </div>
      </Section>
    </>
  );

  const sidebarContent = (
    <div className="space-y-6 py-8 md:py-12 px-4 md:px-6">
      <div className="bg-card border rounded-xl p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage
              src={profile?.avatar_url || user.user_metadata?.avatar_url}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {profile?.full_name?.[0] || user.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-medium text-lg">
            {profile?.full_name ||
              user.user_metadata?.full_name ||
              "Người dùng"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

          <div className="grid grid-cols-3 gap-2 w-full text-center text-sm">
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <BookOpen className="h-4 w-4 mb-1 text-primary" />
              <span className="font-medium">{seriesCountValue || 0}</span>
              <span className="text-xs text-muted-foreground">Series</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <Heart className="h-4 w-4 mb-1 text-primary" />
              <span className="font-medium">{likesCountValue || 0}</span>
              <span className="text-xs text-muted-foreground">Likes</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
              <ShoppingBag className="h-4 w-4 mb-1 text-primary" />
              <span className="font-medium">{purchasesCountValue || 0}</span>
              <span className="text-xs text-muted-foreground">Mua</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainWithSidebar
      main={mainContent}
      sidebar={sidebarContent}
      className="p-0 md:p-0"
    />
  );
}
