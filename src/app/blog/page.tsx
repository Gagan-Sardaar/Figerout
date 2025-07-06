
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppFooter } from '@/components/footer';
import { BlogPostList } from '@/components/blog/blog-post-list';
import { blogPosts as initialBlogPosts, BlogPost } from '@/lib/blog-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Merge posts from static data and localStorage to ensure all posts are loaded.
    const storedPostsJSON = localStorage.getItem('blogPosts');
    const filePosts = initialBlogPosts;
    const combinedPosts = new Map<number, BlogPost>();

    // Start with the base posts from the file.
    for (const post of filePosts) {
      combinedPosts.set(post.id, post);
    }

    // Overwrite with any newer or dynamically created posts from localStorage.
    if (storedPostsJSON) {
      try {
        const storedPosts: BlogPost[] = JSON.parse(storedPostsJSON);
        for (const post of storedPosts) {
          combinedPosts.set(post.id, post);
        }
      } catch (e) {
        console.error("Failed to parse blog posts from localStorage", e);
      }
    }

    // Filter for published posts and sort by date
    const allPosts = Array.from(combinedPosts.values());
    const publishedPosts = allPosts
      .filter(post => post.status === 'published')
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    setPosts(publishedPosts);
    setIsLoading(false);
  }, []);

  const SkeletonCard = () => (
    <div className="flex flex-col space-y-3">
        <Skeleton className="h-[225px] w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
  );

  return (
    <div className="bg-background min-h-svh flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-6">
                <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-foreground">
                    Figerout
                </Link>
                <Button asChild variant="outline">
                    <Link href="/">
                        Return to Home
                    </Link>
                </Button>
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">From the Blog</h1>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <BlogPostList initialPosts={posts} />
        )}
      </main>
      <AppFooter />
    </div>
  );
}
