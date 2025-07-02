
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Share2, Edit, Trash2, ArrowRight, User, Sparkles } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { NewPostDialog } from '@/components/blog/new-post-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface BlogPostCardProps {
  post: BlogPost;
  isAdmin?: boolean;
  onSave?: (postData: any) => void;
  onDelete?: (postId: number) => void;
}

export function BlogPostCard({ post, isAdmin = false, onSave, onDelete }: BlogPostCardProps) {
  const [isCreditExpanded, setIsCreditExpanded] = useState(false);
  
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
                  {typeof post.seoScore === 'number' ? (
                    <span className="text-foreground">SEO: {post.seoScore}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">SEO: N/A</span>
                  )}
                </div>
                 <Badge variant={statusVariant[post.status]} className="capitalize">
                    {post.status.replace('-', ' ')}
                </Badge>
            </div>
          )}
        </div>
        <div className={cn("w-full flex items-center", isAdmin ? "justify-end" : "justify-end")}>
          {isAdmin ? (
            <div className="flex gap-2">
              <NewPostDialog post={post} onSave={onSave}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </NewPostDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the post
                      "{post.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete?.(post.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
