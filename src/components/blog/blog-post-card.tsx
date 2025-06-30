
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Share2, Edit, Trash2, ArrowRight, User, Sparkles } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import { generateSeoScore, GenerateSeoScoreOutput } from '@/ai/flows/generate-seo-score';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { NewPostDialog } from '@/components/blog/new-post-dialog';

interface BlogPostCardProps {
  post: BlogPost;
  isAdmin?: boolean;
}

export function BlogPostCard({ post, isAdmin = false }: BlogPostCardProps) {
  const { toast } = useToast();
  const [isCreditExpanded, setIsCreditExpanded] = useState(false);
  const [seoResult, setSeoResult] = useState<GenerateSeoScoreOutput | null>(null);
  const [isLoadingSeo, setIsLoadingSeo] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const fetchSeoScore = async () => {
        setIsLoadingSeo(true);
        try {
          const result = await generateSeoScore({
            title: post.title,
            content: post.summary,
          });
          setSeoResult(result);
        } catch (error) {
          console.error("Failed to fetch SEO score:", error);
          toast({
            title: "SEO Analysis Failed",
            description: "Could not fetch SEO score for the post.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSeo(false);
        }
      };
      fetchSeoScore();
    }
  }, [isAdmin, post.title, post.summary, toast]);
  
  const statusVariant = {
    published: 'default',
    draft: 'secondary',
    private: 'outline',
    'password-protected': 'outline',
  } as const;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9]">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
          data-ai-hint={post.imageHint}
        />
        {post.photographer && post.photographerUrl && (
          <div
            className="absolute top-2 right-2 z-10"
            onMouseEnter={() => setIsCreditExpanded(true)}
            onMouseLeave={() => setIsCreditExpanded(false)}
          >
            <a
              href={post.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-1.5 rounded-full bg-black/50 py-1 pl-2 pr-2 text-xs text-white/80 backdrop-blur-sm transition-all duration-300 ease-in-out hover:text-white"
            >
              <User className="h-4 w-4 shrink-0" />
              <div
                className={cn(
                  'grid grid-cols-[0fr] transition-[grid-template-columns,margin-left] duration-300 ease-in-out',
                  isCreditExpanded && 'ml-1 grid-cols-[1fr]'
                )}
              >
                <span className="overflow-hidden whitespace-nowrap">
                  Photo by {post.photographer}
                </span>
              </div>
            </a>
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl h-14 line-clamp-2">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{post.summary}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex w-full items-center text-sm text-muted-foreground gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            <span>{post.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="h-4 w-4" />
            <span>{post.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Share2 className="h-4 w-4" />
            <span>{post.shares.toLocaleString()}</span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {isLoadingSeo ? (
                    <Skeleton className="h-4 w-16" />
                  ) : seoResult ? (
                    <span className="text-foreground">SEO: {seoResult.score}</span>
                  ) : (
                    <span>SEO: N/A</span>
                  )}
                </div>
                 <Badge variant={statusVariant[post.status]} className="capitalize">
                    {post.status.replace('-', ' ')}
                </Badge>
            </div>
          )}
        </div>
        <div className={cn("w-full flex items-center justify-end")}>
          {isAdmin ? (
            <div className="flex gap-2">
              <NewPostDialog post={post}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </NewPostDialog>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          ) : (
            <Button asChild variant="link" className="p-0 h-auto text-primary font-semibold">
              <Link href={`/blog/${post.slug}`}>
                READ MORE <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
