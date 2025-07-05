
import { generatePageContent } from '@/ai/flows/generate-page-content';
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
    const pageContent = content.pageContent.replace(/^#\s[^\n\r]+(\r\n|\n|\r)?/, '');

    return (
        <div className="min-h-svh bg-background flex flex-col">
             <div className="absolute top-6 right-6 z-10">
                 <Button asChild variant="outline">
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
            <main className="flex-grow container mx-auto px-4 py-12 md:py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{content.pageTitle}</h1>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{pageContent}</ReactMarkdown>
                        </div>
                    </div>
                    <div className="bg-card p-8 rounded-lg shadow-sm border">
                        <h2 className="text-2xl font-bold mb-4">Send us a message</h2>
                        <ContactForm />
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
