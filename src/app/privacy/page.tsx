import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generatePageContent } from "@/ai/flows/generate-page-content";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import { AppFooter } from "@/components/footer";

export async function generateMetadata(): Promise<Metadata> {
    const content = await generatePageContent({ pageTopic: "Privacy Policy", appName: "Figerout" });
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.focusKeywords,
    };
}

const PolicyPageHeader = () => (
    <header className="bg-primary text-white overflow-hidden">
        <h1 className="text-[20vw] lg:text-[15rem] font-headline font-extrabold tracking-tighter leading-none select-none">
            Figerout
        </h1>
    </header>
);

export default async function PrivacyPolicyPage() {
  const content = await generatePageContent({ pageTopic: "Privacy Policy", appName: "Figerout" });
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
