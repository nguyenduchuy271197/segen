"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select()
          .eq("id", user.id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (!existingProfile) {
          // Create new profile with Google data
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              full_name: user.user_metadata?.name,
              avatar_url: user.user_metadata?.picture,
              updated_at: new Date().toISOString(),
            });

          if (createError) throw createError;

          setFullName(user.user_metadata?.name || "");
          setAvatarUrl(user.user_metadata?.picture || null);
        } else {
          setFullName(existingProfile.full_name || "");
          setBio(existingProfile.bio || "");
          setAvatarUrl(existingProfile.avatar_url || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin cá nhân",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [user, supabase, toast]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      toast({
        title: "Thành công",
        description: "Ảnh đại diện đã được cập nhật",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lên ảnh",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        bio,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24 border">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>
              {fullName?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={loading}
            >
              Thay đổi ảnh
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Giới thiệu</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded-md"
            />
          </div>

          <Button type="submit" disabled={loading}>
            Lưu thay đổi
          </Button>
        </form>
      </div>
    </div>
  );
}
