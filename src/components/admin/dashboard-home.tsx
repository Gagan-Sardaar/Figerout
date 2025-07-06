
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import {
  generateSeoContent,
  GenerateSeoContentOutput,
} from "@/ai/flows/generate-seo-content";
import { generateBlogPost } from "@/ai/flows/generate-blog-post";
import { generateSeoScore } from "@/ai/flows/generate-seo-score";
import type { BlogPost } from "@/lib/blog-data";
import { blogPosts as initialBlogPosts } from "@/lib/blog-data";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { searchPexelsImage } from "@/app/actions";
import { subDays, format } from "date-fns";

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const postsInMonth: { title: string; views: number; likes: number; shares: number }[] = data.posts || [];

    if (data.views === 0 && data.likes === 0 && data.shares === 0) {
      return null;
    }

    return (
      <div className="rounded-lg border bg-card p-3 shadow-sm text-card-foreground max-w-xs w-64">
        <p className="font-bold text-base mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
              <span className="capitalize text-muted-foreground">{p.name}:</span>
              <span className="font-medium ml-auto">{p.value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {postsInMonth.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              <p className="font-semibold text-sm mb-1">Top Posts</p>
              {postsInMonth.slice(0, 5).map((post, index) => (
                <div key={index} className="text-xs">
                  <p className="font-medium truncate" title={post.title}>{post.title}</p>
                  <div className="flex justify-between text-muted-foreground gap-2">
                    <span>Views: {post.views.toLocaleString()}</span>
                    <span>Likes: {post.likes.toLocaleString()}</span>
                    <span>Shares: {post.shares.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {postsInMonth.length > 5 && (
                <p className="text-xs text-center text-muted-foreground mt-1">...and {postsInMonth.length - 5} more</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
  return null;
};

export default function DashboardHome() {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<(GenerateSeoContentOutput & { originalIndex: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<Record<number, 'idle' | 'generating' | 'done'>>({ 0: 'idle', 1: 'idle' });
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('month');

  // Hydrate state from localStorage on the client to avoid hydration mismatch
  useEffect(() => {
    setIsHydrated(true);

    const storedStatus = localStorage.getItem('generationStatus');
    if (storedStatus) {
      try {
        const parsedStatus = JSON.parse(storedStatus);
        if (typeof parsedStatus === 'object' && parsedStatus !== null && '0' in parsedStatus && '1' in parsedStatus) {
            setGenerationStatus(parsedStatus);
        }
      } catch (e) {
        console.error("Failed to parse generationStatus from localStorage", e);
      }
    }
  }, []);
  
  useEffect(() => {
    if (!isHydrated) return;

    const storedPostsJSON = localStorage.getItem('blogPosts');
    const posts: BlogPost[] = storedPostsJSON ? JSON.parse(storedPostsJSON) : initialBlogPosts;

    let newChartData: any[] = [];
    const now = new Date();
    
    if (timeRange === 'month') { // This Year
      const currentYear = now.getFullYear();
      const monthlyData = Array.from({ length: 12 }, () => ({
        views: 0,
        likes: 0,
        shares: 0,
        posts: [] as { title: string; views: number; likes: number; shares: number }[],
      }));

      posts.forEach(post => {
        const postDate = new Date(post.lastUpdated);
        if (postDate.getFullYear() === currentYear) {
            const month = postDate.getMonth();
            monthlyData[month].views += post.views;
            monthlyData[month].likes += post.likes;
            monthlyData[month].shares += post.shares;
            if (post.views > 0 || post.likes > 0 || post.shares > 0) {
                monthlyData[month].posts.push({
                    title: post.title,
                    views: post.views,
                    likes: post.likes,
                    shares: post.shares,
                });
            }
        }
      });

      monthlyData.forEach(month => {
        month.posts.sort((a, b) => (b.views + b.likes + b.shares) - (a.views + a.likes + a.shares));
      });

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      newChartData = monthlyData.map((data, index) => ({
        name: monthNames[index],
        ...data,
      }));
    } else if (timeRange === 'day') { // Last 30 days
        const dailyData = new Map<string, { views: number; likes: number; shares: number; posts: any[] }>();
        
        for (let i = 0; i < 30; i++) {
            const date = subDays(now, i);
            const key = format(date, 'yyyy-MM-dd');
            dailyData.set(key, { views: 0, likes: 0, shares: 0, posts: [] });
        }

        const thirtyDaysAgo = subDays(now, 30);
        posts.forEach(post => {
            const postDate = new Date(post.lastUpdated);
            if (postDate >= thirtyDaysAgo) {
                const key = format(postDate, 'yyyy-MM-dd');
                if (dailyData.has(key)) {
                    const dayData = dailyData.get(key)!;
                    dayData.views += post.views;
                    dayData.likes += post.likes;
                    dayData.shares += post.shares;
                    if (post.views > 0 || post.likes > 0 || post.shares > 0) {
                        dayData.posts.push({
                            title: post.title,
                            views: post.views,
                            likes: post.likes,
                            shares: post.shares,
                        });
                    }
                }
            }
        });
        
        const sortedDailyData = Array.from(dailyData.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

        newChartData = sortedDailyData.map(([dateKey, data]) => {
            const name = format(new Date(dateKey), 'MMM d');
            data.posts.sort((a, b) => (b.views + b.likes + b.shares) - (a.views + a.likes + a.shares));
            return { name, ...data };
        });

    } else if (timeRange === 'year') { // All Time
        const yearlyData = new Map<number, { views: number; likes: number; shares: number; posts: any[] }>();

        posts.forEach(post => {
            const year = new Date(post.lastUpdated).getFullYear();
            if (!yearlyData.has(year)) {
                yearlyData.set(year, { views: 0, likes: 0, shares: 0, posts: [] });
            }
            const yearData = yearlyData.get(year)!;
            yearData.views += post.views;
            yearData.likes += post.likes;
            yearData.shares += post.shares;
             if (post.views > 0 || post.likes > 0 || post.shares > 0) {
                yearData.posts.push({
                    title: post.title,
                    views: post.views,
                    likes: post.likes,
                    shares: post.shares,
                });
            }
        });
        
        const sortedYearlyData = Array.from(yearlyData.entries()).sort((a, b) => a[0] - b[0]);
        
        newChartData = sortedYearlyData.map(([year, data]) => {
            data.posts.sort((a, b) => (b.views + b.likes + b.shares) - (a.views + a.likes + a.shares));
            return { name: year.toString(), ...data };
        });
    }

    setChartData(newChartData);
  }, [isHydrated, timeRange]);

  const allDone = Object.values(generationStatus).every(s => s === 'done');

  useEffect(() => {
    if (isHydrated) {
        localStorage.setItem('generationStatus', JSON.stringify(generationStatus));
    }
  }, [generationStatus, isHydrated]);
  
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
    if (!isHydrated) return;

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
  }, [allDone, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

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
  }, [allDone, fetchIdeas, generationStatus, ideas.length, isHydrated]);

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

      const seoResult = await generateSeoScore({
        title: blogPostResult.metaTitle || idea.title,
        content: blogPostResult.content,
        metaTitle: blogPostResult.metaTitle,
        metaDescription: blogPostResult.metaDescription,
      });

      let featuredImage = 'https://placehold.co/600x400.png';
      let imageHint = 'abstract color';
      let photographer = 'AI Generator';
      let photographerUrl = '#';

      if (blogPostResult.imageSearchQuery) {
        const imageResult = await searchPexelsImage(blogPostResult.imageSearchQuery);
        if (imageResult) {
          featuredImage = imageResult.dataUri;
          imageHint = imageResult.alt;
          photographer = imageResult.photographer;
          photographerUrl = imageResult.photographerUrl;
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
        photographer: photographer,
        photographerUrl: photographerUrl,
        views: 0,
        likes: 0,
        shares: 0,
        status: 'draft',
        lastUpdated: new Date().toISOString(),
        metaTitle: blogPostResult.metaTitle,
        metaDescription: blogPostResult.metaDescription,
        focusKeywords: blogPostResult.focusKeywords,
        seoScore: seoResult?.score
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
    <div className="flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid gap-4 md:gap-6">
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
            {isHydrated && (
              allDone ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Next ideas available in">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono tabular-nums">{countdown}</span>
                  </div>
              ) : (
                  <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
              )
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
                            <Button variant="ghost" onClick={() => handleGeneratePost(idea, idea.originalIndex)} disabled={isLoading || !isHydrated}>
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
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-green-500">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Draft created!</span>
                                </div>
                                <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary font-semibold">
                                    <Link href="/admin/blog">
                                        View Draft <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
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
                Engagement metrics for all posts.
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 30 Days</SelectItem>
                <SelectItem value="month">This Year</SelectItem>
                <SelectItem value="year">All Time</SelectItem>
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
                    content={<CustomTooltip />}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="views" name="Views" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="likes" name="Likes" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="shares" name="Shares" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
