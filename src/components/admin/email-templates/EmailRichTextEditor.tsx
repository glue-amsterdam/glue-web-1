"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Palette,
  LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontSize } from "@/app/components/tiptap-font-size";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const FONT_SIZES = ["0.75rem", "0.875rem", "1rem", "1.125rem", "1.5rem"];

const getNextFontSize = (current: string | null, direction: 1 | -1) => {
  const idx = FONT_SIZES.indexOf(current || "1rem");
  let newIdx = direction === 1 ? idx + 1 : idx - 1;
  if (newIdx < 0) newIdx = 0;
  if (newIdx >= FONT_SIZES.length) newIdx = FONT_SIZES.length - 1;
  return FONT_SIZES[newIdx];
};

const getCurrentFontSize = (editor: Editor | null) => {
  if (!editor) return null;
  const attrs = editor.getAttributes("fontSize");
  return attrs.fontSize || null;
};

const getCurrentColor = (editor: Editor | null) => {
  if (!editor) return null;
  const attrs = editor.getAttributes("textStyle");
  return attrs.color || null;
};

// Helper functions to safely call Color extension commands
const setTextColor = (editor: Editor, color: string) => {
  editor.chain().focus().setColor(color).run();
};

const unsetTextColor = (editor: Editor) => {
  editor.chain().focus().unsetColor().run();
};

// Custom Image extension that supports link attribute and shows preview
const CustomImage = Node.create({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return {
            src: attributes.src,
          };
        },
      },
      link: {
        default: null,
        parseHTML: (element) => element.getAttribute("link"),
        renderHTML: (attributes) => {
          if (!attributes.link) {
            return {};
          }
          return {
            link: attributes.link,
          };
        },
      },
      clickable: {
        default: false,
        parseHTML: (element) => {
          const clickableAttr = element.getAttribute("clickable");
          // Return true if clickable="true", false otherwise
          return clickableAttr === "true" ? true : false;
        },
        renderHTML: (attributes) => {
          if (!attributes.clickable) {
            return {};
          }
          return {
            clickable: attributes.clickable === true ? "true" : attributes.clickable,
          };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {};
          }
          return {
            alt: attributes.alt,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
      {
        tag: 'img[link]',
      },
      {
        tag: 'img[clickable]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
    const link = attrs.link;
    const src = attrs.src || link;
    const clickable = attrs.clickable;
    
    // Keep clickable and link in HTML output so they can be saved
    // We'll remove them in processHtmlForSave if needed, but we need them in the HTML
    const imgAttrs = { ...attrs };
    
    // In editor preview, NEVER wrap in anchor tag - just show as image
    // The wrapping will happen in processImageTags when sending emails
    if (src && !imgAttrs.src) {
      imgAttrs.src = src;
    }
    
    // Ensure clickable and link are preserved in HTML output
    if (clickable) {
      imgAttrs.clickable = clickable;
    }
    if (link) {
      imgAttrs.link = link;
    }
    
    return ["img", imgAttrs];
  },
});

const MenuBar = ({
  editor,
  onImageClick,
}: {
  editor: Editor | null;
  onImageClick: () => void;
}) => {
  if (!editor) {
    return null;
  }

  const handleIncreaseFontSize = () => {
    const current = getCurrentFontSize(editor);
    const next = getNextFontSize(current, 1);
    editor.chain().focus().setFontSize(next).run();
  };

  const handleDecreaseFontSize = () => {
    const current = getCurrentFontSize(editor);
    const next = getNextFontSize(current, -1);
    editor.chain().focus().setFontSize(next).run();
  };

  const handleLinkClick = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter the URL", previousUrl || "");
    
    if (url) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      
      if (selectedText) {
        // Text is selected, apply link to selection
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // No text selected, insert link with URL as text
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      }
    }
  };

  return (
    <div className="bg-gray flex flex-wrap gap-1 pb-2 border-b w-full max-w-full overflow-x-auto">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("bold") && "bg-uiblack/20"
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("italic") && "bg-uiblack/20"
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("underline") && "bg-uiblack/20"
        )}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("strike") && "bg-uiblack/20"
        )}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("code") && "bg-uiblack/30"
        )}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "text-black hover:bg-uiblack/30",
              getCurrentColor(editor) && "bg-uiblack/20"
            )}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <ColorPicker
              value={getCurrentColor(editor) || "#000000"}
              onChange={(color) => {
                if (color && editor) {
                  setTextColor(editor, color);
                } else if (editor) {
                  unsetTextColor(editor);
                }
              }}
              label="Text Color"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (editor) {
                  unsetTextColor(editor);
                }
              }}
              className="w-full text-black"
            >
              Remove Color
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLinkClick}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("link") && "bg-uiblack/20"
        )}
        title="Insert Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onImageClick}
        className="text-black hover:bg-uiblack/30"
        title="Insert Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("bulletList") && "bg-uiblack/20"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("orderedList") && "bg-uiblack/20"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("blockquote") && "bg-uiblack/20"
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6 bg-gray-400" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Decrease font size"
        onClick={handleDecreaseFontSize}
        className="text-black hover:bg-uiblack/30"
        tabIndex={0}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Increase font size"
        onClick={handleIncreaseFontSize}
        className="text-black hover:bg-uiblack/30"
        tabIndex={0}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="text-black hover:bg-uiblack/30"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="text-black hover:bg-uiblack/30"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const EmailRichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  
  // Image properties panel state
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<{
    src: string | null;
    link: string | null;
    clickable: boolean;
  } | null>(null);
  
  // Store original redirect URL when unchecked (so it can be restored when re-checked)
  // Using ref to avoid dependency issues in useEffect
  const preservedRedirectUrlRef = useRef<string | null>(null);

  // Process HTML to convert <img link="..."> to <img src="..." link="..."> for preview
  // Also handle clickable attribute
  const processHtmlForPreview = (html: string): string => {
    let processed = html;
    
    // Handle images with link attribute (add src if missing, preserve clickable)
    processed = processed.replace(
      /<img\s+([^>]*?)(?:clickable\s*=\s*["']([^"']+)["']\s+)?(?:src\s*=\s*["']([^"']+)["']\s+)?link\s*=\s*["']([^"']+)["']([^>]*?)\/?>/gi,
      (match, before, clickableValue, srcUrl, linkUrl, after) => {
        let newTag = "<img";
        if (before) {
          newTag += ` ${before.trim()}`;
        }
        // Preserve clickable attribute if present
        if (clickableValue === "true") {
          newTag += ` clickable="true"`;
        }
        // Use existing src if present, otherwise use linkUrl (backward compatibility)
        const finalSrc = srcUrl || linkUrl;
        if (finalSrc) {
          newTag += ` src="${finalSrc}"`;
        }
        // Keep link separate (redirect URL)
        newTag += ` link="${linkUrl}"`;
        if (after) {
          newTag += ` ${after.trim()}`;
        }
        newTag += ">";
        return newTag;
      }
    );
    
    // Handle images with clickable but no link (clickable images that link to themselves)
    processed = processed.replace(
      /<img\s+([^>]*?)clickable\s*=\s*["']true["']([^>]*?)(?!link\s*=\s*["'])([^>]*?)\/?>/gi,
      (match, before, middle, after) => {
        // Skip if already has link
        if (before.includes('link=') || middle.includes('link=') || after.includes('link=')) {
          return match;
        }
        
        // Extract src
        const srcMatch = before.match(/src\s*=\s*["']([^"']+)["']/) || 
                         middle.match(/src\s*=\s*["']([^"']+)["']/) || 
                         after.match(/src\s*=\s*["']([^"']+)["']/);
        
        if (!srcMatch) {
          return match; // No src found
        }
        
        const src = srcMatch[1];
        let newTag = "<img";
        if (before) {
          newTag += ` ${before.trim()}`;
        }
        if (middle) {
          newTag += ` ${middle.trim()}`;
        }
        // Keep clickable and src, but don't add link (it links to itself)
        newTag += ` clickable="true" src="${src}"`;
        if (after) {
          newTag += ` ${after.trim()}`;
        }
        newTag += ">";
        return newTag;
      }
    );
    
    return processed;
  };

  // Process HTML to ensure link and clickable attributes are preserved in saved content
  // Also ensures color styles are preserved
  // Removes src attribute if it matches link (to keep storage clean)
  const processHtmlForSave = (html: string): string => {
    let processed = html;
    
    // Process all img tags to ensure clickable and link attributes are preserved
    const allImgRegex = /<img\s+([^>]*?)\/?>/gi;
    
    processed = processed.replace(allImgRegex, (match, attrs) => {
      // Extract attributes (order doesn't matter)
      const clickableMatch = attrs.match(/clickable\s*=\s*["']([^"']+)["']/i);
      const linkMatch = attrs.match(/link\s*=\s*["']([^"']+)["']/i);
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
      
      const isClickable = clickableMatch && clickableMatch[1] === "true";
      let linkUrl = linkMatch ? linkMatch[1] : null;
      let src = srcMatch ? srcMatch[1] : null;
      
      // Remove temporary redirect marker if present
      if (linkUrl && linkUrl.endsWith("#redirect")) {
        linkUrl = linkUrl.replace("#redirect", "");
      }
      
      // If link equals src, it means redirect is unchecked - treat as no redirect
      // Use src as the image source, don't save link
      if (linkUrl && linkUrl === src) {
        linkUrl = null; // Don't save link if it equals src
      }
      
      // If no src but we have linkUrl (and they're different), use linkUrl as src fallback
      if (!src && linkUrl) {
        src = linkUrl;
      }
      
      // CRITICAL: For clickable images, src MUST exist (it's used as href when no redirect)
      // If src is missing, we can't make the image clickable, so skip processing
      if (isClickable && !src) {
        return match; // Can't process clickable image without src
      }
      
      // Remove clickable, link, and src from attributes (we'll add them back in correct format)
      const cleanedAttrs = attrs
        .replace(/clickable\s*=\s*["'][^"']*["']/gi, "")
        .replace(/link\s*=\s*["'][^"']*["']/gi, "")
        .replace(/src\s*=\s*["'][^"']*["']/gi, "")
        .trim();
      
      let newTag = "<img";
      if (cleanedAttrs) {
        newTag += ` ${cleanedAttrs}`;
      }
      
      // Always preserve src for the image (required for image to display and clickability)
      // This is critical - src must always be present for clickable images to work
      if (src) {
        newTag += ` src="${src}"`;
      }
      
      // If clickable, save clickable attribute
      if (isClickable) {
        newTag += ` clickable="true"`;
        // Only save link if it's different from src (actual redirect)
        // If link equals src or doesn't exist, don't save link (image links to itself)
        if (linkUrl && linkUrl !== src) {
          newTag += ` link="${linkUrl}"`;
        }
      } else if (linkUrl) {
        // Not clickable but has link (old format, keep for backward compatibility)
        newTag += ` link="${linkUrl}"`;
        if (!src) {
          newTag += ` src="${linkUrl}"`;
        }
      }
      
      newTag += "/>";
      return newTag;
    });
    
    // Ensure color styles are preserved - TipTap saves them as style="color: #hex"
    // This should already be in the HTML, but we verify it's not being stripped
    // The HTML from TipTap should already have the color attribute preserved
    return processed;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      TextStyle,
      Color,
      FontSize,
      CustomImage,
    ],
    content: processHtmlForPreview(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const processedHtml = processHtmlForSave(html);
      onChange(processedHtml);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] max-h-[40dvh] overflow-y-auto bg-white font-overpass text-black w-full p-2 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_a]:cursor-pointer",
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value !== processHtmlForSave(editor.getHTML())) {
      editor.commands.setContent(processHtmlForPreview(value));
    }
  }, [editor, value]);

  // Update selected image attributes when selection changes
  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      if (editor.isActive("image")) {
        const attrs = editor.getAttributes("image") as Record<string, string | boolean | null>;
        const src = attrs.src as string;
        const link = attrs.link as string;
        const clickable = (attrs.clickable as boolean) || false;
        
        // Check if it's a temporary redirect marker
        const isTemporaryRedirect = link && link.endsWith("#redirect");
        // Determine if redirect is actually set (link exists and is different from src)
        // If link equals src, it means redirect is unchecked (but URL preserved for re-checking)
        const hasRedirect = link && link !== src && !isTemporaryRedirect;
        
      // If link equals src, it means redirect was unchecked - preserve the original URL if we have it
      // Otherwise, if we're switching to a different image, clear preserved URL
      if (link !== src && !isTemporaryRedirect) {
        // Different image or redirect is active - clear preserved URL
        preservedRedirectUrlRef.current = null;
      }
        
        setSelectedImageAttrs({
          src: src || link?.replace("#redirect", "") || null, // Use src first, fallback to link for display
          link: hasRedirect ? link : (isTemporaryRedirect ? "" : null), // Show link if redirect, empty if temporary, null if unchecked
          clickable: clickable,
        });
      } else {
        setSelectedImageAttrs(null);
        preservedRedirectUrlRef.current = null; // Clear when deselecting
      }
    };

    editor.on("selectionUpdate", updateSelection);
    updateSelection();

    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor]);

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      return;
    }

    let imgTag = `<img link="${imageUrl.trim()}" clickable="false"`;
    if (imageWidth.trim()) {
      imgTag += ` width="${imageWidth.trim()}"`;
    }
    if (imageHeight.trim()) {
      imgTag += ` height="${imageHeight.trim()}"`;
    }
    imgTag += ` src="${imageUrl.trim()}" />`; // Add src for preview

    if (editor) {
      editor.chain().focus().insertContent(imgTag).run();
    }

    // Reset form
    setImageUrl("");
    setImageWidth("");
    setImageHeight("");
    setIsImageDialogOpen(false);
  };

  const handleUpdateImageAttrs = (updates: { link?: string | null; clickable?: boolean; removeLink?: boolean }) => {
    if (!editor || !editor.isActive("image")) return;

    const currentAttrs = editor.getAttributes("image");
    // Always preserve the original src - never change it
    const currentSrc = (currentAttrs.src as string) || null;
    const newAttrs: Record<string, string | boolean | null> = { ...currentAttrs };
    
    // Always preserve src
    if (currentSrc) {
      newAttrs.src = currentSrc;
    }
    
    // Handle clickable update
    if (updates.clickable !== undefined) {
      newAttrs.clickable = updates.clickable;
      // If unchecking clickable, remove link
      if (updates.clickable === false) {
        delete newAttrs.link;
      }
    }
    
    // Handle link update
    if (updates.removeLink) {
      // When unchecking redirect, preserve the original redirect URL
      // Store it separately so it can be restored when re-checking
      const currentLink = (currentAttrs.link as string) || null;
      if (currentLink && currentLink !== currentSrc && !currentLink.endsWith("#redirect")) {
        // Preserve the original redirect URL
        preservedRedirectUrlRef.current = currentLink;
      }
      // Set link to src (marks as "no redirect" for save function)
      // The save function will not save link if it equals src
      // IMPORTANT: Also ensure src is explicitly set so it's in the HTML output
      if (currentSrc) {
        newAttrs.link = currentSrc;
        newAttrs.src = currentSrc; // Ensure src is explicitly set
      } else {
        delete newAttrs.link;
      }
    } else if (updates.link !== undefined) {
      // Update link
      if (updates.link === null) {
        // Explicitly remove link (no redirect, just clickable)
        if (currentSrc) {
          newAttrs.link = currentSrc; // Set to src instead of removing
        } else {
          delete newAttrs.link;
        }
      } else if (updates.link === "" && currentSrc) {
        // Empty string when enabling redirect - use a temporary placeholder
        // Add a marker so it's different from src and checkbox stays checked
        newAttrs.link = currentSrc + "#redirect";
      } else {
        // Set link (redirect URL) - but keep src unchanged
        newAttrs.link = updates.link;
        // Ensure src is preserved
        if (currentSrc) {
          newAttrs.src = currentSrc;
        }
      }
    }

    // Update attributes in editor
    editor.chain().focus().updateAttributes("image", newAttrs).run();
    
    // Immediately update local state
    const finalLink = (newAttrs.link as string) || null;
    // Check if it's a temporary redirect marker (src + "#redirect")
    const isTemporaryRedirect = finalLink && finalLink.endsWith("#redirect");
    // Determine if redirect is actually set (different from src, or temporary marker exists)
    // If link equals src, it means redirect is unchecked (but URL is preserved for re-checking)
    const hasRedirect = finalLink && finalLink !== currentSrc && !isTemporaryRedirect;
    
    const newState = {
      src: currentSrc || (finalLink && !isTemporaryRedirect ? finalLink.replace("#redirect", "") : null) || null,
      // Show link in state if it's a real redirect (different from src)
      // If it's temporary (equals src + marker), show as empty string so user can enter URL
      // If link equals src (redirect unchecked), show as null (checkbox unchecked, but URL preserved in editor)
      link: hasRedirect ? finalLink : (isTemporaryRedirect ? "" : null),
      clickable: (newAttrs.clickable as boolean) || false,
    };
    setSelectedImageAttrs(newState);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .ProseMirror a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
            cursor: pointer !important;
          }
          .ProseMirror a:hover {
            color: #2563eb !important;
          }
        `
      }} />
      <div className="border rounded-md overflow-hidden w-full max-w-full">
        {editor && (
          <MenuBar
            editor={editor}
            onImageClick={() => setIsImageDialogOpen(true)}
          />
        )}
        <EditorContent editor={editor} className="w-full max-w-full" />
        {selectedImageAttrs && (
          <div className="border-t bg-gray-50 p-3 space-y-3 w-full max-w-full">
            <div className="flex items-center space-x-2 w-full max-w-full">
              <Checkbox
                id="img-clickable"
                checked={selectedImageAttrs.clickable}
                onCheckedChange={(checked) => {
                  const isClickable = checked === true;
                  handleUpdateImageAttrs({ 
                    clickable: isClickable,
                    // If unchecking clickable, remove redirect URL
                    link: isClickable ? selectedImageAttrs.link : null
                  });
                }}
              />
              <Label
                htmlFor="img-clickable"
                className="text-black text-sm font-medium cursor-pointer"
              >
                Clickable image
              </Label>
            </div>
            {selectedImageAttrs.clickable && (
              <>
                <div className="flex items-center space-x-2 w-full max-w-full">
                  <Checkbox
                    id="img-redirect"
                    checked={selectedImageAttrs.link !== null}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // When enabling redirect, restore preserved URL if available, otherwise use placeholder
                        if (preservedRedirectUrlRef.current) {
                          // Restore the original redirect URL that was preserved when unchecked
                          handleUpdateImageAttrs({ 
                            link: preservedRedirectUrlRef.current
                          });
                          preservedRedirectUrlRef.current = null; // Clear preserved URL
                        } else if (selectedImageAttrs.link === selectedImageAttrs.src || !selectedImageAttrs.link) {
                          // Was unchecked or no redirect - use placeholder
                          const placeholder = (selectedImageAttrs.src || "") + "#redirect";
                          handleUpdateImageAttrs({ 
                            link: placeholder
                          });
                        } else {
                          // Already has redirect URL - keep it
                          handleUpdateImageAttrs({ 
                            link: selectedImageAttrs.link
                          });
                        }
                      } else {
                        // When disabling redirect, preserve the URL and set link to src
                        // Save function will not save link if it equals src
                        handleUpdateImageAttrs({ removeLink: true });
                      }
                    }}
                  />
                  <Label
                    htmlFor="img-redirect"
                    className="text-black text-sm font-medium cursor-pointer"
                  >
                    Redirect to other URL
                  </Label>
                </div>
                {selectedImageAttrs.link !== null && (
                  <div className="w-full max-w-full">
                    <Label htmlFor="img-hyperlink-url" className="text-black text-sm font-semibold">
                      Redirect URL
                    </Label>
                    <Input
                      id="img-hyperlink-url"
                      type="url"
                      placeholder={selectedImageAttrs.src || "https://example.com"}
                      value={selectedImageAttrs.link || ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        // Update link immediately while typing (don't trim or set to null)
                        // This prevents the image from being deleted while typing
                        handleUpdateImageAttrs({ link: url });
                      }}
                      onBlur={(e) => {
                        // Only trim and validate on blur
                        const url = e.target.value.trim();
                        if (url && url !== selectedImageAttrs.src) {
                          // Only update if URL is different from src (actual redirect)
                          handleUpdateImageAttrs({ link: url });
                        } else if (!url || url === selectedImageAttrs.src) {
                          // If empty or same as src, remove redirect (will link to itself)
                          handleUpdateImageAttrs({ removeLink: true });
                        }
                      }}
                      className="text-black mt-1 w-full max-w-full"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="img-url" className="text-black">
                Image URL *
              </Label>
              <Input
                id="img-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-black mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="img-width" className="text-black">
                  Width (optional)
                </Label>
                <Input
                  id="img-width"
                  type="text"
                  placeholder="e.g., 300px or 50%"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  className="text-black mt-1"
                />
              </div>
              <div>
                <Label htmlFor="img-height" className="text-black">
                  Height (optional)
                </Label>
                <Input
                  id="img-height"
                  type="text"
                  placeholder="e.g., 200px or auto"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                  className="text-black mt-1"
                />
              </div>
            </div>
            {imageUrl && (
              <div className="border rounded p-2 bg-gray-50">
                <Label className="text-black text-sm font-semibold mb-2 block">
                  Preview
                </Label>
                <div className="mx-auto relative" style={{ maxWidth: "100%" }}>
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={imageWidth ? parseInt(imageWidth.toString()) : 800}
                    height={imageHeight ? parseInt(imageHeight.toString()) : 600}
                    className="mx-auto"
                    style={{
                      width: imageWidth || "auto",
                      height: imageHeight || "auto",
                      maxWidth: "100%",
                      display: "block",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsertImage}
              disabled={!imageUrl.trim()}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
};
