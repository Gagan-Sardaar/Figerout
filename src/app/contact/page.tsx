import { generatePageContent } from '@/ai/flows/generate-page-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';

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
        <div className="min-h-svh bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl">{content.pageTitle}</CardTitle>
                    <CardDescription>
                        {content.pageContent}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContactForm />
                </CardContent>
            </Card>
        </div>
    );
}
