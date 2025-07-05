
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const PolicyPageHeader = () => (
    <header className="bg-zinc-900 py-16 md:py-24 overflow-hidden">
        <h1 className="text-center text-[15vw] lg:text-[12rem] font-headline font-extrabold tracking-tighter leading-tight select-none bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Figerout
        </h1>
    </header>
);

export default async function TermsOfServicePage() {
  const content = await getCachedPageContent();
  const lastUpdated = "July 3, 2024";

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <PolicyPageHeader />
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
