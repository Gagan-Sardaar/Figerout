import { NewPostDialog } from "@/components/blog/new-post-dialog";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { blogPosts } from "@/lib/blog-data";

export default function BlogPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Blog Management</h1>
        <NewPostDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <BlogPostCard key={post.id} post={post} isAdmin={true} />
        ))}
      </div>
    </main>
  );
}
