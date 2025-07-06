
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
        return generatePageContent({ pageTopic: "Terms of Service", appName: "Figerout" });
    },
    ['page-content-terms'],
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

export default async function TermsOfServicePage() {
  const content = await getCachedPageContent();
  const lastUpdated = "July 3, 2024";

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-6">
                <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-foreground">
                    Figerout
                </Link>
                <Button asChild variant="outline">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{content.pageTitle}</h1>
            <p className="mb-8 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.pageContent}</ReactMarkdown>
            </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
