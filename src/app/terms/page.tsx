import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Figerout application (the "Service") operated by us.</p>
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
          <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

          <h2>1. Use of Service</h2>
          <p>You agree to use the Figerout application only for lawful purposes. You are responsible for any content you generate or share using our Service. You must not use our Service in any way that is unlawful, illegal, fraudulent or harmful, or in connection with any unlawful, illegal, fraudulent or harmful purpose or activity.</p>
          
          <h2>2. Intellectual Property</h2>
          <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Figerout and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Figerout.</p>

          <h2>3. User-Generated Content</h2>
          <p>Our Service allows you to capture and share content. You retain any and all of your rights to any content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for content you or any third-party posts on or through the Service.</p>

          <h2>4. AI-Powered Tools</h2>
          <p>For admin users, our Service includes AI-powered tools. While we strive to ensure the accuracy and quality of the generated content, we do not guarantee it. You are responsible for reviewing and editing any AI-generated content to ensure it meets your needs and standards before publishing.</p>
          
          <h2>5. Limitation Of Liability</h2>
          <p>In no event shall Figerout, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          
          <h2>6. Disclaimer</h2>
          <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>

          <h2>7. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          
          <h2>8. Contact Us</h2>
          <p>If you have any questions about these Terms, please <Link href="/contact">contact us</Link>.</p>
          
          <div className="not-prose mt-8">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
