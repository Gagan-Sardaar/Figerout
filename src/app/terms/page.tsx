import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageContent } from "@/ai/flows/generate-page-content";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const content = await generatePageContent({ pageTopic: "Terms of Service", appName: "Figerout" });
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.focusKeywords,
    };
}

export default async function TermsOfServicePage() {
  const content = await generatePageContent({ pageTopic: "Terms of Service", appName: "Figerout" });
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">{content.pageTitle}</CardTitle>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.pageContent}</ReactMarkdown>
            </div>
            <div className="not-prose mt-8">
                <Button asChild>
                <Link href="/">Return to Home</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
