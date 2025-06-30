
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, FileText } from "lucide-react";
import {
  generateSeoContent,
  GenerateSeoContentOutput,
} from "@/ai/flows/generate-seo-content";
import { generateBlogPost } from "@/ai/flows/generate-blog-post";

type Idea = { title: string; summary: string };

export default function ContentAssistantPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("The Psychology of Colors in Fashion");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [generatedPost, setGeneratedPost] = useState("");
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  const handleGenerateIdea = async (clearPrevious = false) => {
    setIsGeneratingIdeas(true);
    if (clearPrevious) {
      setIdeas([]);
    }
    setGeneratedPost("");
    try {
      const newIdea = await generateSeoContent({ topic });
      setIdeas(prevIdeas => clearPrevious ? [newIdea] : [...prevIdeas, newIdea]);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error generating idea",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleGeneratePost = async (title: string) => {
    setIsLoadingPost(true);
    setGeneratedPost("");
    setSelectedTitle(title);
    try {
      const result = await generateBlogPost({ title });
      setGeneratedPost(result.content);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error generating post",
        description: "Could not connect to the AI service.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPost(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Content Assistant</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Generate Ideas</CardTitle>
            <CardDescription>
              Enter a topic to generate SEO-friendly blog post titles and summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Blog Post Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Summer color trends"
              />
            </div>
            <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleGenerateIdea(true)} disabled={isGeneratingIdeas}>
                {isGeneratingIdeas && ideas.length === 0 ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Ideas
                </Button>
                {ideas.length > 0 && (
                <Button variant="secondary" onClick={() => handleGenerateIdea(false)} disabled={isGeneratingIdeas}>
                    {isGeneratingIdeas && ideas.length > 0 ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Another
                </Button>
                )}
            </div>
            {ideas.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="font-semibold">Generated Ideas:</h3>
                {ideas.map((idea, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <CardDescription>{idea.summary}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGeneratePost(idea.title)}
                        disabled={isLoadingPost}
                      >
                        {isLoadingPost && selectedTitle === idea.title ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="mr-2 h-4 w-4" />
                        )}
                        Generate Post
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Generated Post</CardTitle>
            <CardDescription>
              Your full, SEO-optimized blog post will appear here in Markdown format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(isLoadingPost || generatedPost) && (
              <div className="space-y-2">
                <Label htmlFor="post-content">Blog Post Content</Label>
                <Textarea
                  id="post-content"
                  readOnly
                  value={isLoadingPost ? "Generating..." : generatedPost}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Your generated blog post will appear here..."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
