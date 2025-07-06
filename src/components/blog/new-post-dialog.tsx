
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useCallback, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import {
  Button
} from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  UploadCloud,
  ImagePlus,
  Save,
  Clock,
  Dice5,
  PlusCircle,
  Trash2,
  Replace,
  Bold,
  Italic,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  Quote,
  Search,
  Sparkles,
  Loader2,
  Lightbulb,
  X,
  Send,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { extractImageKeywords } from "@/ai/flows/extract-image-keywords";
import { searchPexelsImage } from "@/app/actions";
import {
  generateSeoScore,
  GenerateSeoScoreOutput,
} from "@/ai/flows/generate-seo-score";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ImageToolbarDialog } from "@/components/image-toolbar-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { BlogPost } from "@/lib/blog-data";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeywords: z.array(z.object({ value: z.string() })).optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  featuredImage: z.any().optional(),
  status: z.enum(["published", "draft", "private", "password-protected"]).default("draft"),
  password: z.string().optional(),
  scheduleDate: z.date().optional(),
}).refine(
    (data) => {
        if (data.status === "password-protected") {
            return data.password && data.password.length >= 4;
        }
        return true;
    },
    {
        message: "A password of at least 4 characters is required.",
        path: ["password"],
    }
);

type FormValues = z.infer<typeof formSchema>;

function NewPostForm({ post, onSave, onExit }: { post?: BlogPost, onSave?: (data: any) => void, onExit: () => void }) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [seoResult, setSeoResult] = useState<GenerateSeoScoreOutput | null>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageCursorPos, setImageCursorPos] = useState(0);
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!post;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      metaTitle: "",
      metaDescription: "",
      content: "",
      status: "draft",
      focusKeywords: [],
      password: "",
      scheduleDate: undefined,
    },
  });
  
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content || post.summary,
        status: post.status,
        featuredImage: post.imageUrl,
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        focusKeywords: post.focusKeywords?.map(kw => ({ value: kw })) || [],
        password: "",
        scheduleDate: post.lastUpdated ? new Date(post.lastUpdated) : undefined,
      });
      setImagePreview(post.imageUrl);
      if (post.seoScore) {
        setSeoResult({ score: post.seoScore, feedback: "SEO score from last save." });
      }
    }
  }, [post, form]);
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "focusKeywords",
  });

  const title = form.watch("title");
  const content = form.watch("content");
  const metaTitle = form.watch("metaTitle");
  const metaDescription = form.watch("metaDescription");
  const scheduleDate = form.watch("scheduleDate");
  const status = form.watch("status");


  const handleAnalyzeSeo = async () => {
    if (!title || !content) {
      toast({
        title: "Cannot Analyze SEO",
        description: "Please provide a title and content before analyzing.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzingSeo(true);
    setSeoResult(null);
    try {
      const result = await generateSeoScore({
        title,
        content,
        metaTitle,
        metaDescription,
      });
      setSeoResult(result);
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      toast({
        title: "SEO Analysis Failed",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzingSeo(false);
    }
  };

  const handleImageInsert = (markdown: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const value = form.getValues('content');
    const startPos = imageCursorPos;
    
    const newText = value.substring(0, startPos) + markdown + value.substring(startPos);
    
    form.setValue('content', newText, { shouldDirty: true, shouldValidate: true });

    setTimeout(() => {
        if (contentTextareaRef.current) {
            const newCursorPos = startPos + markdown.length;
            contentTextareaRef.current.focus();
            contentTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
    }, 0);
  };

  const handleToolbarMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleMarkdownAction = (type: 'bold' | 'italic' | 'link' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'quote' | 'image') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    if (type === 'image') {
        setImageCursorPos(textarea.selectionStart);
        setIsImageDialogOpen(true);
        return;
    }

    const { selectionStart, selectionEnd } = textarea;
    const value = textarea.value;

    const updateTextAndState = (newText: string, newSelectionStart: number, newSelectionEnd: number) => {
        textarea.value = newText;
        textarea.focus();
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        form.setValue('content', newText, { shouldDirty: true, shouldValidate: true });
    };

    if (['h2', 'h3', 'h4', 'h5', 'h6', 'p', 'quote'].includes(type)) {
        const prefixes: Record<string, string> = { h2: '## ', h3: '### ', h4: '#### ', h5: '##### ', h6: '###### ', p: '', quote: '> ' };
        const blockPrefix = prefixes[type];

        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        let lineEnd = value.indexOf('\n', lineStart);
        if (lineEnd === -1) lineEnd = value.length;
        
        const currentLine = value.substring(lineStart, lineEnd);
        const trimmedLine = currentLine.replace(/^(#+\s*|>\s*)/, '');
        
        const currentPrefix = currentLine.match(/^(#+\s*|>\s*)/)?.[0] || '';
        
        let newLine;
        if (type === 'p') {
            newLine = trimmedLine;
        } else if (currentPrefix.trim() === blockPrefix.trim()) {
            newLine = trimmedLine;
        } else {
            newLine = blockPrefix + trimmedLine;
        }
        
        const newText = value.substring(0, lineStart) + newLine + value.substring(lineEnd);
        const newCursorPos = lineStart + newLine.length;
        updateTextAndState(newText, newCursorPos, newCursorPos);
        return;
    }
    
    let prefix = '';
    let suffix = '';
    let placeholder = 'text';
    const selectedText = value.substring(selectionStart, selectionEnd);

    switch (type) {
        case 'bold': prefix = '**'; suffix = '**'; break;
        case 'italic': prefix = '_'; suffix = '_'; break;
        case 'link': prefix = '['; suffix = '](https://)'; placeholder = selectedText || 'link'; break;
    }

    const textToWrap = selectedText || placeholder;
    const newText = `${value.substring(0, selectionStart)}${prefix}${textToWrap}${suffix}${value.substring(selectionEnd)}`;
    const newStart = selectionStart + prefix.length;
    const newEnd = newStart + textToWrap.length;
    updateTextAndState(newText, newStart, newEnd);
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

  const handleImageButtonClick = async () => {
    if (imagePreview) {
      setIsSearchingImage(true);
      toast({ title: "Finding a similar image..." });
      try {
        const keywordsResult = await extractImageKeywords({ imageDataUri: imagePreview });
        if (!keywordsResult || keywordsResult.keywords.length === 0) {
          throw new Error("Could not extract keywords from image.");
        }
        
        toast({ description: `Searching for images related to: ${keywordsResult.keywords.join(", ")}` });

        const newImage = await searchPexelsImage(keywordsResult.keywords.join(" "));
        if (newImage) {
          setImagePreview(newImage.dataUri);
          form.setValue("featuredImage", newImage.dataUri);
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
      setIsSearchingImage(true);
      toast({ title: "Searching for a random image..." });
      try {
        const randomKeywords = ['abstract background', 'vibrant colors', 'modern texture', 'minimalist design', 'nature pattern', 'futuristic technology', 'artistic portrait'];
        const randomQuery = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
        const newImage = await searchPexelsImage(randomQuery);
        if (newImage) {
          handleRemoveImage();
          setImagePreview(newImage.dataUri);
          form.setValue("featuredImage", newImage.dataUri);
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

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    let seoScore: number | undefined = undefined;

    try {
        const result = await generateSeoScore({
            title: data.title,
            content: data.content,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
        });
        seoScore = result?.score;
    } catch (error) {
        console.error("Error calculating SEO score:", error);
        toast({
            title: "SEO Score Calculation Failed",
            description: "The post was saved, but the SEO score could not be calculated. You can analyze it again later.",
            variant: "destructive"
        });
    }

    const saveData = {
      ...data,
      focusKeywords: data.focusKeywords?.map(kw => kw.value),
      id: post?.id,
      seoScore: seoScore,
    };

    onSave?.(saveData);
    setLastSaved(new Date());
    setIsSaving(false);
    onExit();
  };

  const getSubmitButtonConfig = () => {
    const iconClass = "mr-2 h-4 w-4";
    if (isEditing) {
      if(status === 'draft' || status === 'private') {
        return { text: 'Save Changes', icon: <Save className={iconClass} /> };
      }
      return { text: 'Update', icon: <Save className={iconClass} /> };
    }
    
    if (status === 'published' || status === 'password-protected') {
      return { text: 'Publish', icon: <Send className={iconClass} /> };
    }
    
    return { text: 'Save Draft', icon: <Save className={iconClass} /> };
  };

  const submitButtonConfig = getSubmitButtonConfig();

  return (
    <Form {...form}>
      <ImageToolbarDialog 
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onInsertImage={handleImageInsert}
      />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                        <Input placeholder="Title for search engine results" {...field} />
                        </FormControl>
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
                        <FormControl>
                        <Input placeholder="Description for search engine results" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <div>
              <Label>Focus Keywords</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {fields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                    {form.watch(`focusKeywords.${index}.value`)}
                    <button type="button" onClick={() => remove(index)} className="rounded-full hover:bg-muted-foreground/20">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button type="button" size="sm" variant="ghost" onClick={() => append({ value: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>
              {form.formState.errors.focusKeywords && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.focusKeywords.message}
                  </p>
                )}
            </div>

            <div>
              <FormLabel>Post Content</FormLabel>
              <div className="mt-2 flex items-center gap-1 border border-input rounded-t-md p-1 bg-background flex-wrap">
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('bold')}><Bold/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('italic')}><Italic/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('link')}><LinkIcon/></Button>
                 <Separator orientation="vertical" className="h-6 mx-1" />
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('h2')}><Heading2/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('h3')}><Heading3/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('h4')}><Heading4/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('h5')}><Heading5/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('h6')}><Heading6/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('p')}><Pilcrow/></Button>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('quote')}><Quote/></Button>
                 <Separator orientation="vertical" className="h-6 mx-1" />
                 <Button type="button" variant="ghost" size="sm" onMouseDown={handleToolbarMouseDown} onClick={() => handleMarkdownAction('image')}><ImagePlus className="mr-2"/> Add Image</Button>
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
                          if(e) {
                            contentTextareaRef.current = e;
                          }
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Post Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="published" /></FormControl>
                              <FormLabel className="font-normal">Published</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="draft" /></FormControl>
                              <FormLabel className="font-normal">Draft</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="private" /></FormControl>
                              <FormLabel className="font-normal">Private</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="password-protected" /></FormControl>
                              <FormLabel className="font-normal">Password Protected</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("status") === "password-protected" && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Post Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter post password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  SEO Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button type="button" onClick={handleAnalyzeSeo} disabled={isAnalyzingSeo || !title || !content} className="w-full">
                  {isAnalyzingSeo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Analyze SEO
                </Button>
                
                {seoResult && (
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <Label className="text-base font-bold">Score: {seoResult.score}/100</Label>
                    <Progress value={seoResult.score} />
                    <Card className="mt-4 bg-muted/50">
                      <CardHeader className="flex flex-row items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-primary" />
                              <CardTitle className="text-sm font-semibold">
                                  Feedback
                              </CardTitle>
                          </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs text-muted-foreground">
                          {seoResult.feedback}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
        
        <div className="flex justify-end items-center gap-2 pt-4 border-t flex-wrap">
            {lastSaved && <p className="text-xs text-muted-foreground mr-auto">Last saved: {lastSaved.toLocaleString()}</p>}
             <Popover
                open={isSchedulePopoverOpen}
                onOpenChange={(open) => {
                    if (open && !form.getValues("scheduleDate")) {
                        form.setValue("scheduleDate", new Date(), { shouldDirty: true, shouldValidate: true });
                    }
                    setIsSchedulePopoverOpen(open);
                }}
            >
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant={"outline"}
                        className="w-[280px] justify-start text-left font-normal"
                    >
                        <Clock className="mr-2 h-4 w-4" />
                        {scheduleDate ? format(scheduleDate, "PPP p") : <span>Schedule post</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={(date) => {
                            if (!date) return;
                            const currentScheduleDate = form.getValues("scheduleDate") || new Date();
                            const newDate = new Date(date);
                            newDate.setHours(currentScheduleDate.getHours());
                            newDate.setMinutes(currentScheduleDate.getMinutes());
                            form.setValue("scheduleDate", newDate, { shouldDirty: true, shouldValidate: true });
                        }}
                        initialFocus
                    />
                    <div className="p-3 border-t border-border">
                        <Label className="mb-2 block">Time</Label>
                        <Input 
                            type="time"
                            value={scheduleDate ? format(scheduleDate, "HH:mm") : ""}
                            onChange={(e) => {
                                if (!e.target.value) return;
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const baseDate = form.getValues("scheduleDate") || new Date(); 
                                
                                if (!isNaN(hours) && !isNaN(minutes)) {
                                    const newDate = new Date(baseDate);
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    form.setValue("scheduleDate", newDate, { shouldDirty: true, shouldValidate: true });
                                }
                            }}
                            placeholder="Select a time"
                        />
                    </div>
                    <div className="p-3 border-t border-border flex justify-end">
                       <Button size="sm" onClick={() => setIsSchedulePopoverOpen(false)} type="button">Done</Button>
                    </div>
                </PopoverContent>
            </Popover>
            <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : submitButtonConfig.icon}
                {isSaving ? 'Saving...' : submitButtonConfig.text}
            </Button>
        </div>
      </form>
    </Form>
  );
}

export function NewPostDialog({ post, children, onSave }: { post?: BlogPost; children?: React.ReactNode, onSave?: (data: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = !!post;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Post' : 'Create New Blog Post'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to your post here. Click update when you're done." : "Fill out the details below. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mr-6 pr-6">
          <NewPostForm post={post} onSave={onSave} onExit={() => setIsOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
