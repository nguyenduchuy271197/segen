"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Youtube, Code, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface MediaEmbedToolProps {
  episodeId: string;
  onEmbed: (html: string) => void;
}

export function MediaEmbedTool({ episodeId, onEmbed }: MediaEmbedToolProps) {
  const [activeTab, setActiveTab] = useState("image");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCaption, setVideoCaption] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [embedCaption, setEmbedCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();

      // Create a unique file path
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${episodeId}-${Math.random()
        .toString(36)
        .substring(2, 15)}.${fileExt}`;
      const filePath = `episodes/${episodeId}/${fileName}`;

      // Upload the file
      const { error } = await supabase.storage
        .from("media")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      setImageUrl(urlData.publicUrl);

      // Set progress to 100% when complete
      setUploadProgress(100);

      toast({
        title: "Tải lên thành công",
        description: "Hình ảnh đã được tải lên",
      });
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      toast({
        title: "Lỗi khi tải lên",
        description: "Không thể tải lên hình ảnh",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const embedImage = () => {
    if (!imageUrl) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập URL hình ảnh",
        variant: "destructive",
      });
      return;
    }

    const altText = imageAlt || imageCaption || "Hình ảnh";
    const html = `<figure class="image-container">
  <img src="${imageUrl}" alt="${altText}" class="rounded-md max-w-full" />
  ${
    imageCaption
      ? `<figcaption class="text-sm text-muted-foreground text-center mt-2">${imageCaption}</figcaption>`
      : ""
  }
</figure>`;

    onEmbed(html);
  };

  const embedVideo = () => {
    if (!videoUrl) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập URL video",
        variant: "destructive",
      });
      return;
    }

    // Extract YouTube video ID
    let videoId = "";
    if (videoUrl.includes("youtube.com/watch")) {
      videoId = new URL(videoUrl).searchParams.get("v") || "";
    } else if (videoUrl.includes("youtu.be/")) {
      videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
    }

    if (!videoId) {
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập URL YouTube hợp lệ",
        variant: "destructive",
      });
      return;
    }

    const html = `<figure class="video-container">
  <div class="aspect-w-16 aspect-h-9">
    <iframe 
      src="https://www.youtube.com/embed/${videoId}" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
      class="rounded-md w-full h-full"
    ></iframe>
  </div>
  ${
    videoCaption
      ? `<figcaption class="text-sm text-muted-foreground text-center mt-2">${videoCaption}</figcaption>`
      : ""
  }
</figure>`;

    onEmbed(html);
  };

  const embedCustomCode = () => {
    if (!embedCode) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mã nhúng",
        variant: "destructive",
      });
      return;
    }

    const html = `<figure class="embed-container">
  <div class="embed-responsive">
    ${embedCode}
  </div>
  ${
    embedCaption
      ? `<figcaption class="text-sm text-muted-foreground text-center mt-2">${embedCaption}</figcaption>`
      : ""
  }
</figure>`;

    onEmbed(html);
  };

  const handleEmbed = () => {
    switch (activeTab) {
      case "image":
        embedImage();
        break;
      case "video":
        embedVideo();
        break;
      case "embed":
        embedCustomCode();
        break;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="media-embed-button"
        >
          <ImageIcon className="h-4 w-4" aria-hidden="true" />
          Chèn media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chèn media vào bài học</DialogTitle>
          <DialogDescription>
            Thêm hình ảnh, video, hoặc mã nhúng vào nội dung bài học
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Hình ảnh
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" aria-hidden="true" />
              Video
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="h-4 w-4" aria-hidden="true" />
              Mã nhúng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Tải lên hình ảnh</Label>
              <div className="flex gap-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={uploadImage}
                  disabled={!selectedFile || isLoading}
                >
                  {isLoading ? `${uploadProgress}%` : "Tải lên"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">URL hình ảnh</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image-alt">Văn bản thay thế (Alt)</Label>
                <Input
                  id="image-alt"
                  placeholder="Mô tả hình ảnh"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-caption">Chú thích</Label>
                <Input
                  id="image-caption"
                  placeholder="Chú thích cho hình ảnh"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">URL video YouTube</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-caption">Chú thích</Label>
              <Input
                id="video-caption"
                placeholder="Chú thích cho video"
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embed-code">Mã nhúng</Label>
              <Textarea
                id="embed-code"
                placeholder="<iframe>...</iframe>"
                value={embedCode}
                onChange={(e) => setEmbedCode(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embed-caption">Chú thích</Label>
              <Input
                id="embed-caption"
                placeholder="Chú thích cho nội dung nhúng"
                value={embedCaption}
                onChange={(e) => setEmbedCaption(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button type="button" onClick={handleEmbed}>
            Chèn vào bài học
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
