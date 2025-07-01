import { blogPosts } from '@/lib/blog-data';
import { notFound } from 'next/navigation';
import { BlogPostPageClient } from '@/components/blog/blog-post-page-client';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }
  
  return <BlogPostPageClient post={post} />;
}
