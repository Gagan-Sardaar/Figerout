
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactUsPage() {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a placeholder for your Contact Us page. You can add a contact form here.</p>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your Name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Your message..." />
          </div>
          <div className="flex justify-between items-center">
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button>Send Message</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
