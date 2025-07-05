
import { generatePageContent } from '@/ai/flows/generate-page-content';
import { ContactForm } from '@/components/contact-form';
import type { Metadata } from 'next';
import { AppFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_cache as cache } from 'next/cache';
import { Mail, Phone, MapPin } from 'lucide-react';

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

    return (
        <div className="min-h-svh bg-background flex flex-col">
             <header className="border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{content.pageTitle}</h1>
                        <Button asChild variant="outline">
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </div>
                </div>
              </header>
            <main className="flex-grow">
                <div className="relative bg-muted/40">
                    <div className="container mx-auto px-4 py-16 text-center">
                         <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Get in Touch</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            We'd love to hear from you. Whether you have a question about features, trials, or anything else, our team is ready to answer all your questions.
                        </p>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-16">
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        <div className="bg-card p-6 rounded-lg shadow-sm border text-center flex flex-col items-center">
                            <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                                <Mail className="w-6 h-6 text-primary"/>
                            </div>
                            <h3 className="text-lg font-semibold">Email Us</h3>
                            <p className="text-muted-foreground mt-1">Our inbox is always open.</p>
                            <a href="mailto:contact@figerout.com" className="mt-2 text-sm font-medium text-primary hover:underline">
                                contact@figerout.com
                            </a>
                        </div>
                        <div className="bg-card p-6 rounded-lg shadow-sm border text-center flex flex-col items-center">
                            <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                                <Phone className="w-6 h-6 text-primary"/>
                            </div>
                            <h3 className="text-lg font-semibold">Call Us</h3>
                            <p className="text-muted-foreground mt-1">Mon-Fri from 9am to 5pm.</p>
                            <a href="tel:5551234567" className="mt-2 text-sm font-medium text-primary hover:underline">
                                (555) 123-4567
                            </a>
                        </div>
                        <div className="bg-card p-6 rounded-lg shadow-sm border text-center flex flex-col items-center lg:col-span-1 md:col-span-2 md:mx-auto md:w-full">
                             <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                                <MapPin className="w-6 h-6 text-primary"/>
                            </div>
                            <h3 className="text-lg font-semibold">Find Us</h3>
                            <p className="text-muted-foreground mt-1">Come say hi at our office.</p>
                             <p className="mt-2 text-sm font-medium text-primary">
                                123 Design St, Creative City
                            </p>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto">
                         <h2 className="text-3xl font-bold text-center mb-2">Send a Message</h2>
                         <p className="text-muted-foreground text-center mb-8">Please fill out the form below and we will get back to you shortly.</p>
                        <ContactForm />
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}
