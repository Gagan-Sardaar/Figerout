"use client";

import { useState, useEffect } from "react";
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
import { Sparkles, RefreshCw } from "lucide-react";
import {
  generateSeoContent,
  GenerateSeoContentOutput,
} from "@/ai/flows/generate-seo-content";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function DashboardHome() {
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<GenerateSeoContentOutput["suggestions"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      const result = await generateSeoContent({ topic: "The Intersection of Color Theory and Modern Fashion" });
      setIdeas(result.suggestions.slice(0, 2));
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
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
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
            <Button variant="ghost" size="icon" onClick={fetchIdeas} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            ) : (
              ideas.map((idea, index) => (
                <Card key={index} className="bg-muted/20 dark:bg-muted/50 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">
                      {idea.summary}
                    </p>
                  </CardContent>
                  <CardContent>
                     <Button variant="ghost" asChild>
                      <Link href="/admin/content-assistant">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Full Post
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
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
    </main>
  );
}
