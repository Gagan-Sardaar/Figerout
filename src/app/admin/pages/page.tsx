
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Save, X, PlusCircle, Lightbulb, Bold, Italic, Link as LinkIcon, Heading2, Heading3, Heading4, Heading5, Heading6, Pilcrow, Quote, ImagePlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  generatePageContent
} from "@/ai/flows/generate-page-content";
import {
  generateSeoScore,
  GenerateSeoScoreOutput,
} from "@/ai/flows/generate-seo-score";
import { improveSeo } from "@/ai/flows/improve-seo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ImageToolbarDialog } from "@/components/image-toolbar-dialog";
import {
  savePageContent,
  getPageContent,
} from '@/services/page-content-service';
import { Skeleton } from "@/components/ui/skeleton";

type PageTopicSlug = "about-us" | "contact-us" | "privacy-policy" | "terms-of-service" | "cookie-policy";

const pageContentSchema = z.object({
  pageTitle: z.string().min(1, "Page title is required."),
  metaTitle: z.string().min(1, "Meta title is required."),
  metaDescription: z.string().min(1, "Meta description is required."),
  focusKeywords: z.array(z.object({ value: z.string() })).min(1, "At least one keyword is required."),
  pageContent: z.string().min(1, "Page content is required."),
});

type PageContentFormValues = z.infer<typeof pageContentSchema>;

function PageEditor({ topicSlug, topicName }: { topicSlug: PageTopicSlug, topicName: string }) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [seoResult, setSeoResult] = useState<GenerateSeoScoreOutput | null>(null);
  const [isAnalyzingSeo, setIsAnalyzingSeo] = useState(false);
  const [isImprovingSeo, setIsImprovingSeo] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageCursorPos, setImageCursorPos] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const form = useForm<PageContentFormValues>({
    resolver: zodResolver(pageContentSchema),
    defaultValues: {
      pageTitle: "",
      metaTitle: "",
      metaDescription: "",
      focusKeywords: [],
      pageContent: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "focusKeywords",
  });
  
  const pageTitle = form.watch("pageTitle");
  const metaTitle = form.watch("metaTitle");
  const metaDescription = form.watch("metaDescription");
  const focusKeywords = form.watch("focusKeywords");
  const pageContent = form.watch("pageContent");

  useEffect(() => {
    const loadPageData = async () => {
      setIsFetching(true);
      form.reset();
      setSeoResult(null);
      setLastSaved(null);

      const savedData = await getPageContent(topicSlug);
      if (savedData) {
        form.reset({
          pageTitle: savedData.pageTitle,
          metaTitle: savedData.metaTitle,
          metaDescription: savedData.metaDescription,
          pageContent: savedData.pageContent,
          focusKeywords: savedData.focusKeywords.map(kw => ({ value: kw })),
        });
        setLastSaved(savedData.lastUpdated);
      }
      setIsFetching(false);
    };

    loadPageData();
  }, [topicSlug, form]);

  const handleGenerateContent = useCallback(async () => {
    setIsGenerating(true);
    setSeoResult(null);
    try {
      const result = await generatePageContent({ pageTopic: topicName, appName: "Figerout" });
      const pageData = {
          pageTitle: result.pageTitle,
          metaTitle: result.metaTitle,
          metaDescription: result.metaDescription,
          pageContent: result.pageContent,
          focusKeywords: result.focusKeywords,
      };
      
      await savePageContent(topicSlug, pageData);

      form.reset({
        ...pageData,
        focusKeywords: pageData.focusKeywords.map(kw => ({ value: kw }))
      });
      setLastSaved(new Date());

      toast({
          title: "Content Generated & Saved",
          description: `New content for "${topicName}" has been successfully saved.`
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error generating content",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [form, topicSlug, topicName, toast]);
  
  const handleImageInsert = (markdown: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const value = form.getValues('pageContent');
    const startPos = imageCursorPos;
    
    const newText = value.substring(0, startPos) + markdown + value.substring(startPos);
    form.setValue('pageContent', newText, { shouldDirty: true, shouldValidate: true });

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
        form.setValue('pageContent', newText, { shouldDirty: true, shouldValidate: true });
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

  const handleAnalyzeSeo = async () => {
    if (!pageTitle || !pageContent) {
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
        title: pageTitle,
        content: pageContent,
        metaTitle: metaTitle,
        metaDescription: metaDescription,
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
  
  const handleImproveSeo = async () => {
    if (!seoResult) return;
    setIsImprovingSeo(true);
    try {
      const result = await improveSeo({
        title: pageTitle,
        content: pageContent,
        metaTitle,
        metaDescription,
        focusKeywords: focusKeywords.map(kw => kw.value),
        feedback: seoResult.feedback,
        isBlogPost: false,
      });

      if (result.improvedContent) {
        form.setValue('pageContent', result.improvedContent, { shouldDirty: true, shouldValidate: true });
      }
      if (result.improvedMetaTitle) {
        form.setValue('metaTitle', result.improvedMetaTitle, { shouldDirty: true, shouldValidate: true });
      }
      if (result.improvedMetaDescription) {
        form.setValue('metaDescription', result.improvedMetaDescription, { shouldDirty: true, shouldValidate: true });
      }
      
      // Re-analyze SEO after improvements
      handleAnalyzeSeo();
      
      toast({
        title: "Content Improved!",
        description: "The AI has rewritten your content for better SEO.",
      });

    } catch (error) {
      console.error("Error improving SEO:", error);
      toast({
        title: "Improvement Failed",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
    } finally {
      setIsImprovingSeo(false);
    }
  };

  const onSubmit = async (data: PageContentFormValues) => {
    setIsSaving(true);
    try {
      await savePageContent(topicSlug, {
        pageTitle: data.pageTitle,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        pageContent: data.pageContent,
        focusKeywords: data.focusKeywords.map(kw => kw.value),
      });
      toast({
        title: "Changes Saved!",
        description: `Content for "${topicName}" has been updated.`,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save to database:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your changes to the database.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }

  const PageSkeleton = () => (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-10 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-[450px] w-full" />
    </div>
  );

  return (
    <Card>
      <ImageToolbarDialog 
        isOpen={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onInsertImage={handleImageInsert}
      />
      <CardHeader>
        <CardTitle>Editing: {topicName}</CardTitle>
        <CardDescription>
          Manage the content and SEO settings for this page. Use the AI generator for a quick start.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            {isFetching ? <PageSkeleton /> : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex justify-end gap-2 items-center">
                    {lastSaved && <p className="text-xs text-muted-foreground mr-auto">Last saved: {lastSaved.toLocaleString()}</p>}
                    <Button type="button" variant="outline" onClick={handleGenerateContent} disabled={isGenerating || isSaving}>
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Generate Content
                    </Button>
                    <Button type="submit" disabled={isSaving || isGenerating}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="pageTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Title (H1)</FormLabel>
                        <FormControl>
                          <Input placeholder="The main title displayed on the page" {...field} />
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

                  <FormField
                    control={form.control}
                    name="pageContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Content (Markdown)</FormLabel>
                        <div className="flex items-center gap-1 border border-input rounded-t-md p-1 bg-background flex-wrap">
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
                        <FormControl>
                          <Textarea
                            ref={(e) => {
                              field.ref(e);
                              if(e) {
                                contentTextareaRef.current = e;
                              }
                            }}
                            placeholder="The main content of the page..."
                            className="min-h-[400px] font-mono text-sm rounded-t-none focus-visible:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    SEO Analysis
                  </CardTitle>
                  <CardDescription>Click to analyze your content's SEO performance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleAnalyzeSeo} disabled={isAnalyzingSeo || !pageTitle || !pageContent || isFetching} className="w-full">
                    {isAnalyzingSeo ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze SEO
                  </Button>
                  
                  {seoResult && (
                    <div className="space-y-2 mt-4 pt-4 border-t">
                      <Label className="text-base font-bold">
                        Score: {seoResult.score}/100
                      </Label>
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
                       <Button type="button" onClick={handleImproveSeo} disabled={isImprovingSeo} className="w-full mt-2">
                        {isImprovingSeo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Improve with AI
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PagesPage() {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  
  useEffect(() => {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
          try {
              const user = JSON.parse(storedUser);
              if (user.role === 'Admin') {
                  setIsAllowed(true);
              } else {
                  router.replace('/admin');
              }
          } catch (e) {
              router.replace('/login');
          }
      } else {
          router.replace('/login');
      }
  }, [router]);
  
  if (!isAllowed) {
    return (
      <div className="flex flex-1 items-center justify-center h-full p-6">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const pages: { slug: PageTopicSlug, name: string }[] = [
    { slug: "about-us", name: "About Us" },
    { slug: "contact-us", name: "Contact Us" },
    { slug: "privacy-policy", name: "Privacy Policy" },
    { slug: "terms-of-service", name: "Terms of Service" },
    { slug: "cookie-policy", name: "Cookie Policy" },
  ];

  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Page Management</h1>
      </div>

      <Tabs defaultValue={pages[0].slug} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          {pages.map((page) => (
            <TabsTrigger key={page.slug} value={page.slug} className="text-xs md:text-sm">
              {page.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {pages.map((page) => (
          <TabsContent key={page.slug} value={page.slug}>
            <PageEditor topicSlug={page.slug} topicName={page.name} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
