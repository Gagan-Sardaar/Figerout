
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageContent } from "@/ai/flows/generate-page-content";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import { AppFooter } from "@/components/footer";
import { unstable_cache as cache } from 'next/cache';

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
      <main className="flex-grow container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-start gap-4 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{content.pageTitle}</h1>
                    <p className="mt-2 text-muted-foreground">Last updated: {lastUpdated}</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.pageContent}</ReactMarkdown>
            </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
