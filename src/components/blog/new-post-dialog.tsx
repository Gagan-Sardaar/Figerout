
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCallback, useState, useRef } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  UploadCloud,
  ImagePlus,
  Save,
  Lock,
  Clock,
  Send,
  Dice5,
  PlusCircle,
  BookLock,
  Trash2,
  Replace,
  Bold,
  Italic,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { searchPexelsImage } from "@/app/actions";
import { extractImageKeywords } from "@/ai/flows/extract-image-keywords";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  featuredImage: z.any().optional(),
});

function NewPostForm({ onSave }: { onSave: () => void }) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", metaTitle: "", metaDescription: "", content: "" },
  });

  const handleMarkdownAction = (type: 'bold' | 'italic' | 'link' | 'h2' | 'h3' | 'h4' | 'p' | 'image') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const value = form.getValues('content');
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    const applyInlineMarkdown = (prefix: string, suffix: string = prefix) => {
      const newText = `${value.substring(0, selectionStart)}${prefix}${selectedText}${suffix}${value.substring(selectionEnd)}`;
      form.setValue('content', newText, { shouldDirty: true, shouldValidate: true });
      setTimeout(() => {
        textarea.focus();
        if (selectedText) {
          textarea.setSelectionRange(selectionStart + prefix.length, selectionEnd + prefix.length);
        } else {
          textarea.setSelectionRange(selectionStart + prefix.length, selectionStart + prefix.length);
        }
      }, 0);
    };

    const applyBlockMarkdown = (prefix: string) => {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEnd = value.indexOf('\n', lineStart) === -1 ? value.length : value.indexOf('\n', lineStart);
      const currentLine = value.substring(lineStart, lineEnd);
      const trimmedLine = currentLine.replace(/^#+\s*/, '');
      const newLine = prefix + trimmedLine;
      const newText = value.substring(0, lineStart) + newLine + value.substring(lineEnd);
      form.setValue('content', newText, { shouldDirty: true, shouldValidate: true });
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = lineStart + newLine.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    };

    switch (type) {
      case 'bold':
        applyInlineMarkdown('**');
        break;
      case 'italic':
        applyInlineMarkdown('_');
        break;
      case 'link':
        applyInlineMarkdown('[', '](https://)');
        break;
      case 'h2':
        applyBlockMarkdown('## ');
        break;
      case 'h3':
        applyBlockMarkdown('### ');
        break;
      case 'h4':
        applyBlockMarkdown('#### ');
        break;
      case 'p':
        applyBlockMarkdown('');
        break;
      case 'image':
        applyInlineMarkdown('![alt text](', 'image_url)');
        break;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("featuredImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    noClick: !!imagePreview,
    noKeyboard: !!imagePreview,
  });

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue("featuredImage", null);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Post Published!",
      description: "Your new blog post is now live.",
    });
    onSave();
  }

  const handleSaveDraft = () => {
    toast({
      title: "Draft Saved!",
      description: "Your post has been saved as a draft.",
    });
    onSave();
  };

  const handlePasswordProtect = () => {
    toast({
      title: "Coming Soon!",
      description: "Password protection feature is not yet available.",
    });
  };
  
  const handleSetPrivate = () => {
    toast({
      title: "Coming Soon!",
      description: "Setting post to private is not yet available.",
    });
  };

  const handleSchedule = () => {
    toast({
      title: "Coming Soon!",
      description: "Scheduling posts is not yet available.",
    });
  };

  const handleImageButtonClick = async () => {
    // If an image is already selected, find a similar one.
    if (imagePreview) {
      setIsSearchingImage(true);
      toast({ title: "Finding a similar image..." });
      try {
        const keywordsResult = await extractImageKeywords({ imageDataUri: imagePreview });
        if (!keywordsResult || keywordsResult.keywords.length === 0) {
          throw new Error("Could not extract keywords from image.");
        }
        
        toast({ description: `Searching for images related to: ${keywordsResult.keywords.join(", ")}` });

        const newImageUrl = await searchPexelsImage(keywordsResult.keywords.join(" "));
        if (newImageUrl) {
          setImagePreview(newImageUrl);
          form.setValue("featuredImage", newImageUrl);
          toast({ title: "Found a similar image!" });
        } else {
          toast({ title: "Couldn't find a similar image.", description: "Try again or use a different image.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error finding similar image:", error);
        toast({ title: "Error finding similar image", variant: "destructive", description: "Please check the console for details." });
      } finally {
        setIsSearchingImage(false);
      }
    } else {
      // If no image is selected, fetch a random one.
      setIsSearchingImage(true);
      toast({ title: "Searching for a random image..." });
      try {
        const randomKeywords = ['abstract background', 'vibrant colors', 'modern texture', 'minimalist design', 'nature pattern', 'futuristic technology', 'artistic portrait'];
        const randomQuery = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
        const newImageUrl = await searchPexelsImage(randomQuery);
        if (newImageUrl) {
          handleRemoveImage();
          setImagePreview(newImageUrl);
          form.setValue("featuredImage", newImageUrl);
          toast({ title: "Random image selected!" });
        } else {
          toast({ title: "Could not fetch a random image.", description: "The stock photo library might be busy.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error fetching random image:", error);
        toast({ title: "Error fetching random image", variant: "destructive", description: "Please check the console for details." });
      }
      setIsSearchingImage(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the main title for your post" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Post Content</FormLabel>
              <div className="mt-2 flex items-center gap-1 border border-input rounded-t-md p-1 bg-background flex-wrap">
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('bold')}><Bold/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('italic')}><Italic/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('link')}><LinkIcon/></Button>
                 <Separator orientation="vertical" className="h-6 mx-1" />
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('h2')}><Heading2/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('h3')}><Heading3/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('h4')}><Heading4/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMarkdownAction('p')}><Pilcrow/></Button>
                 <Separator orientation="vertical" className="h-6 mx-1" />
                 <Button type="button" variant="ghost" size="sm" onClick={() => handleMarkdownAction('image')}><ImagePlus className="mr-2"/> Add Image</Button>
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        ref={(e) => {
                          field.ref(e);
                          if(e) contentTextareaRef.current = e;
                        }}
                        placeholder="Write your blog post content here..."
                        className="min-h-[300px] rounded-t-none focus-visible:ring-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-8">
            <FormField
              control={form.control}
              name="featuredImage"
              render={() => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                   <div className="relative">
                    <FormControl>
                      <div
                        {...getRootProps()}
                        className={`relative group border-2 border-dashed rounded-lg text-center transition-colors ${isDragActive ? "border-primary bg-primary/10" : "border-input"} ${!imagePreview && !isSearchingImage && "hover:border-primary/50 cursor-pointer"}`}
                      >
                        <input {...getInputProps()} />
                        {imagePreview ? (
                          <>
                            <div className="relative aspect-video">
                              <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-md" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button type="button" size="icon" variant="secondary" onClick={open} aria-label="Change image">
                                <Replace />
                              </Button>
                              <Button type="button" size="icon" variant="destructive" onClick={handleRemoveImage} aria-label="Delete image">
                                <Trash2 />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex aspect-video flex-col items-center justify-center gap-2 text-muted-foreground p-8">
                            <UploadCloud className="w-10 h-10" />
                            <p>Drag & drop or click</p>
                          </div>
                        )}
                        {isSearchingImage && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-lg bg-background/95 p-4 text-foreground backdrop-blur-sm">
                            <p className="flex items-center gap-2 text-lg font-semibold animate-pulse"><Search className="h-5 w-5" /> Searching...</p>
                            <div className="w-full max-w-xs">
                                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div className="absolute top-0 h-full w-1/3 animate-indeterminate-progress bg-primary"></div>
                                </div>
                            </div>
                            <p className="mt-2 text-center text-xs text-muted-foreground">Finding the perfect image for you.</p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <div className="space-y-2">
                       <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={handleImageButtonClick} disabled={isSearchingImage}>
                          {imagePreview ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Find similar image
                            </>
                          ) : (
                            <>
                              <Dice5 className="mr-2 h-4 w-4"/>
                              Get random image
                            </>
                          )}
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>SEO Settings</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl><Input placeholder="SEO-friendly title" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl><Textarea placeholder="Brief summary for search engines" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        
        <div className="flex justify-end items-center gap-2 pt-4 border-t flex-wrap">
            <Button type="button" variant="secondary" onClick={handleSaveDraft}><Save className="mr-2" />Save Draft</Button>
            <div className="flex-grow"></div>
            <Button type="button" variant="outline" onClick={handlePasswordProtect}><BookLock className="mr-2" />Password</Button>
            <Button type="button" variant="outline" onClick={handleSetPrivate}><Lock className="mr-2" />Private</Button>
            <Button type="button" variant="outline" onClick={handleSchedule}><Clock className="mr-2" />Schedule</Button>
            <Button type="submit"><Send className="mr-2" />Publish</Button>
        </div>
      </form>
    </Form>
  );
}

export function NewPostDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
          <DialogDescription>
            Fill out the details below. Click publish when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mr-6 pr-6">
          <NewPostForm onSave={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
