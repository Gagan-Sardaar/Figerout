
import { generatePageContent } from '@/ai/flows/generate-page-content';
import { getPageContent } from '@/services/page-content-service';
import type { Metadata } from 'next';
import { AppFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_cache as cache } from 'next/cache';
import { Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const getPageData = cache(
    async () => {
        const slug = 'contact-us';
        let content = await getPageContent(slug);

        if (!content) {
            const generated = await generatePageContent({ pageTopic: "Contact Us", appName: "Figerout" });
            return {
                pageTitle: generated.pageTitle,
                description: "The best way to reach us is by email. We'd love to hear from you and will do our best to respond as soon as possible.",
                metaTitle: generated.metaTitle,
                metaDescription: generated.metaDescription,
                focusKeywords: generated.focusKeywords,
            };
        }

        return {
            pageTitle: content.pageTitle,
            description: content.pageContent,
            metaTitle: content.metaTitle,
            metaDescription: content.metaDescription,
            focusKeywords: content.focusKeywords,
        };
    },
    ['page-data-contact'],
    { revalidate: 3600 }
);

export async function generateMetadata(): Promise<Metadata> {
    const content = await getPageData();
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.focusKeywords,
    };
}

export default async function ContactUsPage() {
    const content = await getPageData();

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
            <main className="flex-grow">
                <div className="relative bg-muted/40">
                    <div className="container mx-auto px-4 py-16 text-center">
                         <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">{content.pageTitle}</h2>
                        <div className="text-lg text-muted-foreground max-w-2xl mx-auto prose dark:prose-invert">
                           <ReactMarkdown>{content.description}</ReactMarkdown>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-16">
                     <div className="flex justify-center">
                        <div className="bg-card p-8 rounded-lg shadow-sm border text-center flex flex-col items-center w-full max-w-md">
                            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                <Mail className="w-8 h-8 text-primary"/>
                            </div>
                            <h3 className="text-xl font-semibold">Email Us</h3>
                            <p className="text-muted-foreground mt-1">Our inbox is always open.</p>
                            <a href="mailto:contact@figerout.com" className="mt-4 text-lg font-medium text-primary hover:underline break-all">
                                contact@figerout.com
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
