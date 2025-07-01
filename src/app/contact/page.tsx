import { generatePageContent } from '@/ai/flows/generate-page-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';
import { AppFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
    const content = await generatePageContent({ pageTopic: "Contact Us", appName: "Figerout" });
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        keywords: content.focusKeywords,
    };
}

export default async function ContactUsPage() {
    const content = await generatePageContent({ pageTopic: "Contact Us", appName: "Figerout" });

    return (
        <div className="min-h-svh bg-background flex flex-col">
            <main className="flex-grow flex items-center justify-center p-4">
              <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl">{content.pageTitle}</CardTitle>
                            <CardDescription>
                                {content.pageContent}
                            </CardDescription>
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
