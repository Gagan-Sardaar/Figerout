
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import {
  generateSeoContent,
  GenerateSeoContentOutput,
} from "@/ai/flows/generate-seo-content";
import { generateBlogPost } from "@/ai/flows/generate-blog-post";
import type { BlogPost } from "@/lib/blog-data";
import { blogPosts as initialBlogPosts } from "@/lib/blog-data";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { searchPexelsImage } from "@/app/actions";

const chartData = [
  { name: "Jan", engagement: 400 },
  { name: "Feb", engagement: 300 },
  { name: "Mar", engagement: 200 },
  { name: "Apr", engagement: 278 },
  { name: "May", engagement: 189 },
  { name: "Jun", engagement: 239 },
  { name: "Jul", engagement: 349 },
  { name: "Aug", engagement: 450 },
  { name: "Sep", engagement: 360 },
  { name: "Oct", engagement: 500 },
  { name: "Nov", engagement: 420 },
  { name: "Dec", engagement: 600 },
];

const LoadingSkeleton = () => (
  <Card className="bg-muted/20 dark:bg-muted/50">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-4">
        <Skeleton className="h-9 w-44" />
      </div>
    </CardContent>
  </Card>
);

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

const initialTopics = [
    "The Intersection of Color Theory and Modern Fashion",
    "How to Use Contrasting Colors in Home Decor",
];

export default function DashboardHome() {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<(GenerateSeoContentOutput & { originalIndex: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  
  const [generationStatus, setGenerationStatus] = useState<Record<number, 'idle' | 'generating' | 'done'>>(() => {
    if (typeof window === 'undefined') {
      return { 0: 'idle', 1: 'idle' };
    }
    const storedStatus = localStorage.getItem('generationStatus');
    if (storedStatus) {
        try {
            const parsedStatus = JSON.parse(storedStatus);
            if (typeof parsedStatus === 'object' && parsedStatus !== null && '0' in parsedStatus && '1' in parsedStatus) {
                return parsedStatus;
            }
        } catch (e) {
            console.error("Failed to parse generationStatus from localStorage", e);
        }
    }
    return { 0: 'idle', 1: 'idle' };
  });

  const allDone = Object.values(generationStatus).every(s => s === 'done');

  useEffect(() => {
    localStorage.setItem('generationStatus', JSON.stringify(generationStatus));
  }, [generationStatus]);
  
  const fetchIdeas = useCallback(async (topicsToFetch: { topic: string, index: number }[]) => {
    if (topicsToFetch.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    try {
      const ideaPromises = topicsToFetch.map(({ topic }) => generateSeoContent({ topic }));
      const results = await Promise.all(ideaPromises);
      
      const newIdeas = results.map((result, i) => ({
        ...result,
        originalIndex: topicsToFetch[i].index,
      }));

      setIdeas(prevIdeas => {
        const updatedIdeas = [...prevIdeas];
        newIdeas.forEach(newIdea => {
          const existingIndex = updatedIdeas.findIndex(i => i.originalIndex === newIdea.originalIndex);
          if (existingIndex !== -1) {
            updatedIdeas[existingIndex] = newIdea;
          } else {
            updatedIdeas.push(newIdea);
          }
        });
        return updatedIdeas.sort((a, b) => a.originalIndex - b.originalIndex);
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching AI suggestions",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (allDone) {
      const getNextGenerationTime = () => {
        let nextTime = localStorage.getItem('nextGenerationTime');
        if (!nextTime) {
          const newNextTime = new Date().getTime() + 24 * 60 * 60 * 1000;
          localStorage.setItem('nextGenerationTime', String(newNextTime));
          return newNextTime;
        }
        return Number(nextTime);
      };
      
      const nextGenerationTime = getNextGenerationTime();
      
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = nextGenerationTime - now;
        
        if (distance < 0) {
          if (timer) clearInterval(timer);
          setCountdown("");
          localStorage.removeItem('nextGenerationTime');
          localStorage.removeItem('generationStatus');
          setGenerationStatus({ 0: 'idle', 1: 'idle' });
          return;
        }
        
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setCountdown(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      };
      
      updateTimer(); // Initial call
      timer = setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [allDone]);

  useEffect(() => {
    if (!allDone) {
      const topicsToRefresh = initialTopics
        .map((topic, index) => ({ topic, index }))
        .filter(({ index }) => generationStatus[index] !== 'done');
      
      if (topicsToRefresh.length > 0 && ideas.length === 0) {
        fetchIdeas(topicsToRefresh);
      } else {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false); 
    }
  }, [allDone, fetchIdeas, generationStatus, ideas.length]);

  const handleRefresh = () => {
    const topicsToRefresh = initialTopics
      .map((topic, index) => ({ topic, index }))
      .filter(({ index }) => generationStatus[index] !== 'done');
    
    fetchIdeas(topicsToRefresh);
  };

  const handleGeneratePost = async (idea: GenerateSeoContentOutput, index: number) => {
    setGenerationStatus(prev => ({ ...prev, [index]: 'generating' }));
    try {
      const blogPostResult = await generateBlogPost({ title: idea.title });

      let featuredImage = 'https://placehold.co/600x400.png';
      let imageHint = 'abstract color';

      if (blogPostResult.imageSearchQuery) {
        const imageResult = await searchPexelsImage(blogPostResult.imageSearchQuery);
        if (imageResult) {
          featuredImage = imageResult.dataUri;
          imageHint = imageResult.alt;
        }
      }
      
      const storedPostsJSON = localStorage.getItem('blogPosts');
      const allPosts: BlogPost[] = storedPostsJSON ? JSON.parse(storedPostsJSON) : initialBlogPosts;

      const newPostId = allPosts.length > 0 ? Math.max(...allPosts.map(p => p.id)) + 1 : 1;
      
      const newPost: BlogPost = {
        id: newPostId,
        slug: createSlug(idea.title),
        title: idea.title,
        summary: idea.summary,
        content: blogPostResult.content,
        imageUrl: featuredImage,
        imageHint: imageHint,
        photographer: 'AI Generator',
        photographerUrl: '#',
        views: 0,
        likes: 0,
        shares: 0,
        status: 'draft',
        lastUpdated: new Date().toISOString(),
        metaTitle: blogPostResult.metaTitle,
        metaDescription: blogPostResult.metaDescription,
        focusKeywords: blogPostResult.focusKeywords,
      };
      
      const updatedPosts = [newPost, ...allPosts];
      localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));

      setGenerationStatus(prev => ({ ...prev, [index]: 'done' }));

    } catch (error) {
      console.error(error);
      toast({
        title: "Error generating post",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
      setGenerationStatus(prev => ({ ...prev, [index]: 'idle' }));
    }
  };

  return (
    <div className="flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to your Admin Dashboard</CardTitle>
            <CardDescription>
              Manage your application content and settings from here. Use the navigation menu on the left to get started.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>AI Content Assistant</span>
              </CardTitle>
              <CardDescription>Daily inspiration for your next article.</CardDescription>
            </div>
            {allDone ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Next ideas available in">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono tabular-nums">{countdown}</span>
                </div>
            ) : (
                <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
            )}
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {isLoading && ideas.length === 0 ? (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            ) : (
              ideas.map((idea) => {
                const status = generationStatus[idea.originalIndex] || 'idle';
                return (
                    <Card key={idea.originalIndex} className="bg-muted/20 dark:bg-muted/50 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">
                        {idea.summary}
                        </p>
                    </CardContent>
                    <CardContent>
                        {status === 'idle' && (
                            <Button variant="ghost" onClick={() => handleGeneratePost(idea, idea.originalIndex)} disabled={isLoading}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Full Post
                            </Button>
                        )}
                        {status === 'generating' && (
                            <div className="w-full space-y-2 text-center">
                                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div className="absolute top-0 h-full w-1/3 animate-indeterminate-progress bg-primary"></div>
                                </div>
                                <p className="text-xs text-muted-foreground">Generating post...</p>
                            </div>
                        )}
                        {status === 'done' && (
                            <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Draft created!</span>
                            </div>
                        )}
                    </CardContent>
                    </Card>
                )
            })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">Post Engagement</CardTitle>
              <CardDescription>
                Daily engagement metrics for posts created or updated in the selected period.
              </CardDescription>
            </div>
            <Select defaultValue="month">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
