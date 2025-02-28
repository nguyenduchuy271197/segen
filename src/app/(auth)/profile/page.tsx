"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase/provider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/ui/section";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setFullName(data.full_name || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();
  }, [user, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        bio,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thành công",
        description: "Thông tin hồ sơ đã được cập nhật",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin hồ sơ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="Hồ Sơ" description="Quản lý thông tin cá nhân của bạn">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {fullName ? fullName[0]?.toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <div>
              <Label htmlFor="bio">Giới thiệu</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu ngắn về bạn"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </form>
      </div>
    </Section>
  );
}
