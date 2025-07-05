
import { generatePageContent } from '@/ai/flows/generate-page-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';
import { AppFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { unstable_cache as cache } from 'next/cache';

const getCachedPageContent = cache(
    async () => {
        return generatePageContent({ pageTopic: "Contact Us", appName: "Figerout" });
    },
    ['page-content-contact'],
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

export default async function ContactUsPage() {
    const content = await getCachedPageContent();
    // AI can sometimes include a redundant H1 in the content, let's remove it
    const pageContent = content.pageContent.replace(/^#\s[^\n\r]+(\r\n|\n|\r)?/, '');

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <main className="flex-grow flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl">{content.pageTitle}</CardTitle>
                            <div className="prose dark:prose-invert max-w-none pt-2">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{pageContent}</ReactMarkdown>
                            </div>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                      <ContactForm />
                  </CardContent>
              </Card>
            </main>
            <AppFooter />
        </div>
    );
}
