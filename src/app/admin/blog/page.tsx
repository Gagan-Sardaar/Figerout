
"use client";

import { useState, useEffect } from "react";
import { NewPostDialog } from "@/components/blog/new-post-dialog";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { blogPosts as initialBlogPosts, BlogPost } from "@/lib/blog-data";
import { useToast } from "@/hooks/use-toast";

// Helper to create a slug from a title
const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

export default function BlogPage() {
  const [posts, setPostsState] = useState<BlogPost[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedPostsJSON = localStorage.getItem('blogPosts');
    let postsToLoad = storedPostsJSON ? JSON.parse(storedPostsJSON) : initialBlogPosts;

    const storedInteractions = JSON.parse(localStorage.getItem('postInteractions') || '{}');
    if (Object.keys(storedInteractions).length > 0) {
        postsToLoad = postsToLoad.map(post => {
            const interaction = storedInteractions[post.id];
            if (interaction) {
                return {
                    ...post,
                    views: interaction.views ?? post.views,
                    likes: interaction.likes ?? post.likes,
                    shares: interaction.shares ?? post.shares,
                };
            }
            return post;
        });
    }
    setPostsState(postsToLoad);
    
    // Ensure localStorage is seeded if it was empty
    if (!storedPostsJSON) {
        localStorage.setItem('blogPosts', JSON.stringify(initialBlogPosts));
    }
  }, []);
  
  const setPosts = (newPosts: BlogPost[] | ((prevState: BlogPost[]) => BlogPost[])) => {
    const updatedPosts = typeof newPosts === 'function' ? newPosts(posts) : newPosts;
    setPostsState(updatedPosts);
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
  };


  const handleSavePost = (postData: Partial<BlogPost> & { title: string; content: string; status: BlogPost['status'], featuredImage?: string }) => {
    const summary = postData.content.length > 150 ? postData.content.substring(0, 150) + '...' : postData.content;
    
    if (postData.id) {
      // Update existing post
      setPosts(posts.map(p => p.id === postData.id ? { 
          ...p, 
          ...postData, 
          title: postData.title, 
          content: postData.content,
          summary: summary,
          imageUrl: postData.featuredImage || p.imageUrl 
        } as BlogPost : p));
      toast({
          title: "Post Updated!",
          description: `"${postData.title}" has been saved.`,
      });
    } else {
      // Create new post
      const newPost: BlogPost = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        slug: createSlug(postData.title),
        title: postData.title,
        summary: summary,
        content: postData.content,
        imageUrl: postData.featuredImage || 'https://placehold.co/600x400.png',
        imageHint: 'placeholder image',
        photographer: 'Figerout',
        photographerUrl: '#',
        views: 0,
        likes: 0,
        shares: 0,
        status: postData.status,
        lastUpdated: new Date().toISOString(),
      };
      setPosts([newPost, ...posts]);
      toast({
        title: "Post Created!",
        description: `"${newPost.title}" has been created as a ${newPost.status}.`,
      });
    }
  };

  const handleDeletePost = (postId: number) => {
     setPosts(posts.filter(p => p.id !== postId));
     toast({
        title: "Post Deleted",
        description: "The blog post has been successfully deleted.",
        variant: "destructive",
     });
  };

  return (
    <div className="flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Blog Management</h1>
        <NewPostDialog onSave={handleSavePost} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} isAdmin={true} onSave={handleSavePost} onDelete={handleDeletePost} />
        ))}
      </div>
    </div>
  );
}
