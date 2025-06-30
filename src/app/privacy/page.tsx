import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to Figerout. Your privacy is critically important to us. This Privacy Policy document outlines the types of information that is collected and recorded by Figerout and how we use it.
          </p>
          
          <h2>1. Information We Collect</h2>
          <p>
            We collect information in the following ways to provide and improve our services:
          </p>
          <ul>
            <li><strong>Information you provide us directly:</strong> This includes any information you provide when you contact us for support, or otherwise communicate with us.</li>
            <li><strong>Camera and Image Data:</strong> To use our core feature, you must grant us access to your device's camera. When you capture an image, that image data is processed on your device to allow you to select colors. The captured image is temporarily stored in your browser's session storage and is not uploaded to our servers unless you choose to share it.</li>
            <li><strong>Usage Data:</strong> We may collect information about how you access and use the Service ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other diagnostic data.</li>
            <li><strong>AI-Generated Content (for Admin Users):</strong> For users of our admin dashboard, we process the inputs you provide to our AI tools (like topics for blog posts) to generate content. We do not store these inputs long-term.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the collected data for various purposes:
          </p>
          <ul>
            <li>To provide and maintain our Service.</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
            <li>To provide customer support.</li>
            <li>To monitor the usage of our Service to detect, prevent and address technical issues.</li>
            <li>For our admin users, to provide powerful AI-driven content generation tools.</li>
          </ul>
          
          <h2>3. Data Storage and Security</h2>
          <p>The security of your data is important to us. We use your browser's local and session storage to store data like captured images and preferences. This means sensitive data like your photos do not leave your device unless explicitly shared. We strive to use commercially acceptable means to protect your Personal Information, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
          
          <h2>4. Cookies</h2>
          <p>We use cookies and similar tracking technologies to track the activity on our Service and we hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. Please review our Cookie Policy for more details.</p>

          <h2>5. Your Data Protection Rights</h2>
          <p>You have certain data protection rights. Figerout aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you wish to be informed what Personal Data we hold about you and if you want it to be removed from our systems, please contact us.</p>

          <h2>6. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
          
          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through our <Link href="/contact">contact page</Link>.</p>

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
