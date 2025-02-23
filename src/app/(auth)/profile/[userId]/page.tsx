import { createClient } from "@/lib/supabase/server";
import { FollowButton } from "@/components/social/FollowButton";

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

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">
            {profile.full_name || "Unnamed User"}
          </h1>
          {/* Add other profile info here */}
        </div>
        {user?.id !== params.userId && (
          <FollowButton
            targetUserId={params.userId}
            targetUserName={profile.full_name || "Unnamed User"}
            initialIsFollowing={!!followData}
          />
        )}
      </div>
      {/* Add other profile content here */}
    </div>
  );
}
