"use client";

import { useState } from "react";
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
import { Sparkles, Loader2, Save, X, PlusCircle } from "lucide-react";
import {
  generatePageContent,
  GeneratePageContentOutput,
} from "@/ai/flows/generate-page-content";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

type PageTopic = "About Us" | "Contact Us" | "Privacy Policy" | "Terms of Service" | "Cookie Policy";

const pageContentSchema = z.object({
  pageTitle: z.string().min(1, "Page title is required."),
  metaTitle: z.string().min(1, "Meta title is required."),
  metaDescription: z.string().min(1, "Meta description is required."),
  focusKeywords: z.array(z.object({ value: z.string() })).min(1, "At least one keyword is required."),
  pageContent: z.string().min(1, "Page content is required."),
});

type PageContentFormValues = z.infer<typeof pageContentSchema>;

function PageEditor({ topic }: { topic: PageTopic }) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    form.reset();
    try {
      const result = await generatePageContent({ pageTopic: topic, appName: "Figerout" });
      form.setValue("pageTitle", result.pageTitle);
      form.setValue("metaTitle", result.metaTitle);
      form.setValue("metaDescription", result.metaDescription);
      form.setValue("pageContent", result.pageContent);
      form.setValue("focusKeywords", result.focusKeywords.map(kw => ({ value: kw })));
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
  };
  
  const onSubmit = (data: PageContentFormValues) => {
    console.log(data);
    toast({
        title: "Changes Saved!",
        description: `Content for ${topic} has been updated.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editing: {topic}</CardTitle>
        <CardDescription>
          Manage the content and SEO settings for this page. Use the AI generator for a quick start.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleGenerateContent} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Content
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
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
                  <FormControl>
                    <Textarea
                      placeholder="The main content of the page..."
                      className="min-h-[400px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function PagesPage() {
  const pages: PageTopic[] = [
    "About Us",
    "Contact Us",
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Page Management</h1>
      </div>

      <Tabs defaultValue={pages[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
          {pages.map((page) => (
            <TabsTrigger key={page} value={page} className="text-xs md:text-sm">
              {page}
            </TabsTrigger>
          ))}
        </TabsList>
        {pages.map((page) => (
          <TabsContent key={page} value={page}>
            <PageEditor topic={page} />
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
