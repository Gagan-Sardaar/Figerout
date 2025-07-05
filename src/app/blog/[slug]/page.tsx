
"use client";

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { blogPosts as initialBlogPosts, BlogPost } from '@/lib/blog-data';
import { BlogPostPageClient } from '@/components/blog/blog-post-page-client';
import { Skeleton } from '@/components/ui/skeleton';
import { AppFooter } from '@/components/footer';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    // Merge posts from static data and localStorage.
    const storedPostsJSON = localStorage.getItem('blogPosts');
    const filePosts = initialBlogPosts;
    const combinedPosts = new Map<number, BlogPost>();

    for (const p of filePosts) {
      combinedPosts.set(p.id, p);
    }

    if (storedPostsJSON) {
      try {
        const storedPosts: BlogPost[] = JSON.parse(storedPostsJSON);
        for (const p of storedPosts) {
          combinedPosts.set(p.id, p);
        }
      } catch (e) {
        console.error("Failed to parse blog posts from localStorage", e);
      }
    }

    const allPosts = Array.from(combinedPosts.values());
    const foundPost = allPosts.find((p) => p.slug === slug);
    
    if (foundPost) {
        // For public users, only show published or password-protected posts via direct link.
        if (foundPost.status === 'published' || foundPost.status === 'password-protected') {
             setPost(foundPost);
        }
    }
    setIsLoading(false);
  }, [slug]);

  if (isLoading) {
    return (
        <div className="bg-background min-h-svh flex flex-col">
            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-9 w-40 mb-4" />
                    <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <Skeleton className="aspect-video w-full rounded-md" />
                        <Skeleton className="h-10 w-3/4" />
                        <div className="flex gap-4">
                           <Skeleton className="h-5 w-24" />
                           <Skeleton className="h-5 w-24" />
                           <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="pt-4 space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                           <Skeleton className="h-4 w-full pt-4" />
                           <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
  }

  if (!post) {
    notFound();
  }
  
  return <BlogPostPageClient post={post} />;
}
