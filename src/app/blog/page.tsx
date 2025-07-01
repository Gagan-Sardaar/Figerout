import { BlogPostList } from '@/components/blog/blog-post-list';
import { blogPosts } from '@/lib/blog-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">From the Blog</h1>
            <Button asChild variant="outline">
                <Link href="/">
                    Return to Home
                </Link>
            </Button>
        </div>
        <BlogPostList initialPosts={blogPosts} />
      </div>
    </div>
  );
}
