import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Share2, Edit, Trash2, ArrowRight } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-data';

interface BlogPostCardProps {
  post: BlogPost;
  isAdmin?: boolean;
}

export function BlogPostCard({ post, isAdmin = false }: BlogPostCardProps) {
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
      </div>
      <CardHeader>
        <CardTitle className="text-xl h-14 line-clamp-2">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{post.summary}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex w-full items-center text-sm text-muted-foreground gap-4">
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
        </div>
        <div className="w-full">
          {isAdmin ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
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
