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
} from "lucide-react";
import { Button } from "../ui/button";
import { useEffect } from "react";

interface EpisodeEditorProps {
  content: string;
  isEditable?: boolean;
  onChange?: (content: string) => void;
}

export function EpisodeEditor({
  content,
  isEditable = true,
  onChange,
}: EpisodeEditorProps) {
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
    editable: isEditable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card">
      {isEditable && (
        <div className="flex flex-wrap items-center gap-1 border-b p-2 sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 z-10">
          <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={editor.isActive("bold") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <BoldIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("italic") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <ItalicIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("underline") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className="h-8 w-8 p-0"
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={
                editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className="h-8 w-8 p-0"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant={
                editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className="h-8 w-8 p-0"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant={
                editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className="h-8 w-8 p-0"
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className="h-8 w-8 p-0"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className="h-8 w-8 p-0"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("code") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className="h-8 w-8 p-0"
              title="Inline Code"
            >
              <CodeIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className="h-8 w-8 p-0"
              title="Code Block"
            >
              <Braces className="h-4 w-4" />
            </Button>
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
        prose-pre:p-4"
      />

      {isEditable && editor && (
        <div className="px-6 py-2 text-sm text-muted-foreground border-t">
          {editor.storage.characterCount.characters()} characters ·{" "}
          {editor.storage.characterCount.words()} words
        </div>
      )}
    </div>
  );
}
