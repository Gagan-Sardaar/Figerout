
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NewPostDialog } from "@/components/blog/new-post-dialog";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { blogPosts as initialBlogPosts, BlogPost } from "@/lib/blog-data";
import { useToast } from "@/hooks/use-toast";
import { notifyUsersAboutPost } from "@/services/notification-service";

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
  const [userRole, setUserRole] = useState<'Admin' | 'Editor' | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        try {
            const parsedUser = JSON.parse(loggedInUser);
            setUserRole(parsedUser.role);
            setUserId(parsedUser.id);
        } catch(e) { console.error(e) }
    }
    
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

    // Sort posts to have the newest ones first.
    let postsToLoad = Array.from(combinedPosts.values()).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    // Merge interaction data (views, likes, shares)
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
    
    // Persist the definitive merged list back to localStorage.
    localStorage.setItem('blogPosts', JSON.stringify(postsToLoad));
  }, []);
  
  const setPosts = (newPosts: BlogPost[] | ((prevState: BlogPost[]) => BlogPost[])) => {
    const updatedPosts = typeof newPosts === 'function' ? newPosts(posts) : newPosts;
    const sortedPosts = [...updatedPosts].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    setPostsState(sortedPosts);
    localStorage.setItem('blogPosts', JSON.stringify(sortedPosts));
  };


  const handleSavePost = async (postData: Partial<BlogPost> & { title: string; content: string; status: BlogPost['status'], featuredImage?: string }) => {
    const summary = postData.content.length > 150 ? postData.content.substring(0, 150) + '...' : postData.content;
    const lastUpdated = new Date().toISOString();
    let savedPost: BlogPost | undefined;
    
    if (postData.id) {
      // Update existing post
      setPosts(posts.map(p => {
        if (p.id === postData.id) {
            const updatedPost = { 
              ...p, 
              ...postData, 
              title: postData.title, 
              content: postData.content,
              summary: summary,
              imageUrl: postData.featuredImage || p.imageUrl,
              lastUpdated: lastUpdated,
            } as BlogPost;
            savedPost = updatedPost;
            return updatedPost;
        }
        return p
      }));
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
        lastUpdated: lastUpdated,
        metaTitle: postData.metaTitle,
        metaDescription: postData.metaDescription,
        focusKeywords: postData.focusKeywords,
        seoScore: postData.seoScore,
      };
      savedPost = newPost;
      setPosts(prevPosts => [newPost, ...prevPosts]);
      toast({
        title: "Post Created!",
        description: `"${newPost.title}" has been created as a ${newPost.status}.`,
      });
    }

    if (userId && savedPost && savedPost.status === 'published') {
      await notifyUsersAboutPost(userId, savedPost);
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
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Blog Management</h1>
        <NewPostDialog onSave={handleSavePost}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </NewPostDialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} isAdmin={true} onSave={handleSavePost} onDelete={handleDeletePost} userRole={userRole} />
        ))}
      </div>
    </div>
  );
}
