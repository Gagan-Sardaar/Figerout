
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, Heart, Share2, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/blog-data';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppFooter } from '@/components/footer';

export function BlogPostPageClient({ post }: { post: BlogPost }) {
  const [isCreditExpanded, setIsCreditExpanded] = useState(false);
  const { toast } = useToast();

  const [views, setViews] = useState(post.views);
  const [likes, setLikes] = useState(post.likes);
  const [shares, setShares] = useState(post.shares);
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    // Load persisted data from localStorage
    const allInteractions = JSON.parse(localStorage.getItem('postInteractions') || '{}');
    const postInteraction = allInteractions[post.id] || {};

    // Get initial values from storage or props
    const initialViews = postInteraction.views ?? post.views;
    const initialLikes = postInteraction.likes ?? post.likes;
    const initialShares = postInteraction.shares ?? post.shares;
    const initialIsLiked = postInteraction.isLiked ?? false;
    const initialIsShared = postInteraction.isShared ?? false;
    
    // Increment view count on every load
    const newViewCount = initialViews + 1;

    // Update state
    setViews(newViewCount);
    setLikes(initialLikes);
    setShares(initialShares);
    setIsLiked(initialIsLiked);
    setIsShared(initialIsShared);

    // Persist the new view count and other interaction data
    const updatedInteraction = { 
      views: newViewCount,
      likes: initialLikes,
      shares: initialShares,
      isLiked: initialIsLiked,
      isShared: initialIsShared,
    };
    const updatedAllInteractions = { ...allInteractions, [post.id]: updatedInteraction };
    localStorage.setItem('postInteractions', JSON.stringify(updatedAllInteractions));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const updateStoredInteractions = (update: object) => {
    const allInteractions = JSON.parse(localStorage.getItem('postInteractions') || '{}');
    const postInteraction = allInteractions[post.id] || {};
    const updatedInteraction = { ...postInteraction, ...update };
    const updatedAllInteractions = { ...allInteractions, [post.id]: updatedInteraction };
    localStorage.setItem('postInteractions', JSON.stringify(updatedAllInteractions));
  };

  const handleLike = () => {
    const newLikes = isLiked ? likes - 1 : likes + 1;
    const newIsLiked = !isLiked;
    setLikes(newLikes);
    setIsLiked(newIsLiked);
    updateStoredInteractions({ likes: newLikes, isLiked: newIsLiked });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied!",
        description: "The blog post URL has been copied to your clipboard.",
      });
      if (!isShared) {
        const newShares = shares + 1;
        setShares(newShares);
        setIsShared(true);
        updateStoredInteractions({ shares: newShares, isShared: true });
      }
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
      });
    });
  };

  return (
    <div className="bg-background min-h-svh flex flex-col">
        <header className="border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-6">
                    <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-foreground">
                        Figerout
                    </Link>
                    <Button asChild variant="outline">
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
        <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="relative aspect-video mb-4">
                            <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover rounded-md"
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
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-3xl md:text-4xl font-bold">{post.title}</CardTitle>
                            {post.status !== 'published' && (
                                <Badge variant="outline" className="capitalize shrink-0 ml-4">{post.status}</Badge>
                            )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-4 pt-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{views.toLocaleString()} Views</span>
                            </div>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 p-1 h-auto text-muted-foreground hover:text-foreground" onClick={handleLike}>
                                <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                                <span>{likes.toLocaleString()} Likes</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1.5 p-1 h-auto text-muted-foreground hover:text-foreground" onClick={handleShare}>
                                {isShared ? (
                                    <Check className="h-4 w-4 text-primary" />
                                ) : (
                                    <Share2 className="h-4 w-4" />
                                )}
                                <span>{shares.toLocaleString()} Shares</span>
                            </Button>
                            <div className="ml-auto text-xs">
                                Last updated: {new Date(post.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-lg">
                        {post.content ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                        ) : (
                            <p>{post.summary}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
        <AppFooter />
    </div>
  );
}
