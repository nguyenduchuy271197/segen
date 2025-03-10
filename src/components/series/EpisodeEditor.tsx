import { useEditor, EditorContent } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Strike from "@tiptap/extension-strike";
import History from "@tiptap/extension-history";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  Braces,
  Link as LinkIcon,
  Eye,
} from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { AIContentAssistant } from "./AIContentAssistant";
import { MediaEmbedTool } from "./MediaEmbedTool";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EpisodeEditorProps {
  content: string;
  isEditable?: boolean;
  onChange?: (content: string) => void;
  episodeId?: string;
  seriesId?: string;
  seriesTitle?: string;
  episodeTitle?: string;
}

export function EpisodeEditor({
  content,
  isEditable = true,
  onChange,
  episodeId,
  seriesId,
  seriesTitle,
  episodeTitle,
}: EpisodeEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      Bold,
      Italic,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Underline,
      Strike,
      CodeBlock,
      Code,
      Blockquote,
      CharacterCount,
    ],
    content,
    editable: isEditable && !showPreview,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable && !showPreview);
    }
  }, [editor, isEditable, showPreview]);

  const handleLinkSubmit = () => {
    if (editor && linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();

      setLinkUrl("");
      setLinkDialogOpen(false);
    }
  };

  const handleMediaEmbed = (html: string) => {
    if (editor) {
      editor.chain().focus().insertContent(html).run();
    }
  };

  const handleAIContentGenerated = (newContent: string) => {
    if (editor) {
      editor.commands.setContent(newContent);
      onChange?.(newContent);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card">
      {isEditable && (
        <div className="flex flex-wrap items-center justify-between gap-1 border-b p-2 sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 z-10">
          <div className="flex flex-wrap items-center gap-1">
            <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive("bold") ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className="h-8 w-8 p-0"
                    >
                      <BoldIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>In đậm</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("italic") ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <ItalicIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>In nghiêng</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("underline") ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gạch chân</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("heading", { level: 1 })
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tiêu đề 1</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("heading", { level: 2 })
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tiêu đề 2</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("heading", { level: 3 })
                          ? "secondary"
                          : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Heading3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tiêu đề 3</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("bulletList") ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Danh sách không thứ tự</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("orderedList") ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Danh sách có thứ tự</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("blockquote") ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Trích dẫn</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={editor.isActive("code") ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      className="h-8 w-8 p-0"
                    >
                      <CodeIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mã nội dòng</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        editor.isActive("codeBlock") ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      className="h-8 w-8 p-0"
                    >
                      <Braces className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Khối mã</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant={
                            editor.isActive("link") ? "secondary" : "ghost"
                          }
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Thêm liên kết</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Thêm liên kết</DialogTitle>
                    <DialogDescription>Nhập URL cho liên kết</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleLinkSubmit();
                        }
                      }}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleLinkSubmit}>
                      Thêm liên kết
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {episodeId && (
                <MediaEmbedTool
                  episodeId={episodeId}
                  onEmbed={handleMediaEmbed}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showPreview ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? "Đang xem trước" : "Xem trước"}
            </Button>

            {episodeId && seriesId && seriesTitle && episodeTitle && (
              <AIContentAssistant
                episodeId={episodeId}
                seriesId={seriesId}
                seriesTitle={seriesTitle}
                episodeTitle={episodeTitle}
                onContentGenerated={handleAIContentGenerated}
              />
            )}
          </div>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose max-w-none prose-sm sm:prose-base p-4 pl-10 overflow-y-auto
        relative
        prose-headings:font-semibold
        prose-headings:text-foreground
        prose-h1:text-2xl
        prose-h2:text-xl
        prose-h3:text-lg
        prose-p:text-muted-foreground
        prose-p:leading-relaxed
        prose-strong:text-foreground
        prose-em:text-foreground
        prose-blockquote:border-l-primary
        prose-blockquote:bg-muted/20
        prose-blockquote:rounded-r-lg
        prose-blockquote:py-1
        prose-blockquote:px-4
        prose-blockquote:text-muted-foreground
        prose-blockquote:not-italic
        prose-ul:text-muted-foreground
        prose-ul:marker:text-muted-foreground/70
        prose-ol:text-muted-foreground
        prose-ol:marker:text-muted-foreground/70
        prose-code:text-foreground
        prose-code:bg-muted/30
        prose-code:rounded
        prose-code:px-1.5
        prose-code:py-0.5
        prose-code:text-sm
        prose-pre:bg-muted/50
        prose-pre:border
        prose-pre:rounded-md
        prose-pre:p-4
        prose-img:rounded-md
        prose-img:mx-auto
        prose-figure:mx-auto
        prose-figcaption:text-center
        prose-figcaption:text-sm
        prose-figcaption:text-muted-foreground
        prose-a:text-primary
        prose-a:underline
        prose-a:underline-offset-2
        prose-a:decoration-primary/30
        hover:prose-a:decoration-primary
        prose-a:transition-colors
        "
      />

      {isEditable && (
        <div className="flex justify-between items-center px-4 py-2 border-t text-xs text-muted-foreground">
          <div>
            {editor.storage.characterCount.characters()} ký tự
            {" • "}
            {editor.storage.characterCount.words()} từ
          </div>
        </div>
      )}
    </div>
  );
}
