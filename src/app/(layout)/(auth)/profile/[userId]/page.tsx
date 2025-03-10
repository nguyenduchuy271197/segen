import { createClient } from "@/lib/supabase/server";
import { FollowButton } from "@/components/social/FollowButton";
import { SimpleBreadcrumb } from "@/components/ui/breadcrumb";
import { Users, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = await createClient();

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", params.userId)
    .single();
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if current user is following this profile
  const { data: followData } = user
    ? await supabase
        .from("follows")
        .select()
        .eq("follower_id", user.id)
        .eq("following_id", params.userId)
        .single()
    : { data: null };

  // Get user's series
  const { data: userSeries } = await supabase
    .from("series")
    .select("id, title, description, created_at, view_count, is_public")
    .eq("user_id", params.userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  // Get follower count
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", params.userId);

  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", params.userId);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const breadcrumbItems = [
    {
      label: "Người dùng",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: profile.full_name || "Unnamed User",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <SimpleBreadcrumb items={breadcrumbItems} className="mb-6" />

      <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profile.avatar_url || ""}
                alt={profile.full_name || "User"}
              />
              <AvatarFallback className="text-2xl">
                {(profile.full_name || "U").charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <h1 className="text-3xl font-bold mb-2 md:mb-0">
                {profile.full_name || "Unnamed User"}
              </h1>

              {user?.id !== params.userId ? (
                <FollowButton
                  targetUserId={params.userId}
                  targetUserName={profile.full_name || "Unnamed User"}
                  initialIsFollowing={!!followData}
                />
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/settings/profile">Chỉnh sửa hồ sơ</Link>
                </Button>
              )}
            </div>

            <div className="space-y-2 text-muted-foreground mb-4">
              {profile.bio && <p>{profile.bio}</p>}

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Tham gia {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <span className="font-bold">{followerCount || 0}</span>
                <p className="text-sm text-muted-foreground">Người theo dõi</p>
              </div>
              <div className="text-center">
                <span className="font-bold">{followingCount || 0}</span>
                <p className="text-sm text-muted-foreground">Đang theo dõi</p>
              </div>
              <div className="text-center">
                <span className="font-bold">{userSeries?.length || 0}</span>
                <p className="text-sm text-muted-foreground">Series</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="series" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="about">Giới thiệu</TabsTrigger>
        </TabsList>

        <TabsContent value="series">
          {userSeries && userSeries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userSeries.map((series) => (
                <Card key={series.id}>
                  <CardContent className="p-4">
                    <Link
                      href={`/series/${series.id}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-lg mb-2">
                        {series.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                      {series.description || "Không có mô tả"}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(series.created_at)}</span>
                      <span>{series.view_count || 0} lượt xem</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Người dùng chưa có series nào
            </div>
          )}
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Thông tin</h3>
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground">
                  Người dùng chưa cập nhật thông tin giới thiệu
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
