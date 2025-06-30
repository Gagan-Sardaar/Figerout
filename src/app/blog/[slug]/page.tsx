import { blogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, Heart, Share2 } from 'lucide-react';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-background min-h-svh">
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Link>
                </Button>
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
                        </div>
                        <CardTitle className="text-3xl md:text-4xl font-bold">{post.title}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground gap-4 pt-2">
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-4 w-4" />
                                <span>{post.views.toLocaleString()} Views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes.toLocaleString()} Likes</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Share2 className="h-4 w-4" />
                                <span>{post.shares.toLocaleString()} Shares</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-lg">
                        <p>{post.summary}</p>
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <p>
                            Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
