
"use client";

import { useState, useEffect } from 'react';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { BlogPost } from '@/lib/blog-data';

export function BlogPostList({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

    useEffect(() => {
        const storedInteractions = JSON.parse(localStorage.getItem('postInteractions') || '{}');
        
        if (Object.keys(storedInteractions).length > 0) {
            const updatedPosts = initialPosts.map(post => {
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
            setPosts(updatedPosts);
        }
    }, [initialPosts]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
    );
}
