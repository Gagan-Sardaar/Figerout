
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageContent } from "@/ai/flows/generate-page-content";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import { AppFooter } from "@/components/footer";
import { unstable_cache as cache } from 'next/cache';
import { InteractivePolicyHeader } from "@/components/interactive-policy-header";

const getCachedPageContent = cache(
    async () => {
        return generatePageContent({ pageTopic: "Cookie Policy", appName: "Figerout" });
    },
    ['page-content-cookies'],
    { revalidate: 3600 }
);

export async function generateMetadata(): Promise<Metadata> {
    const content = await getCachedPageContent();
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.focusKeywords,
    };
}

export default async function CookiePolicyPage() {
  const content = await getCachedPageContent();
  const lastUpdated = "July 3, 2024";

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <InteractivePolicyHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
                <div>
                    <CardTitle className="text-3xl md:text-4xl">{content.pageTitle}</CardTitle>
                    <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.pageContent}</ReactMarkdown>
              </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
