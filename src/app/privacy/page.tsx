import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>This is a placeholder for your Privacy Policy.</p>
          <p>
            Please replace this with your own privacy policy content. It should detail how you collect, use, and protect your users' data, especially since this app uses the camera and may involve user-generated content.
          </p>
          
          <h3 className="font-semibold">1. Information We Collect</h3>
          <p>Placeholder text about data collection.</p>
          
          <h3 className="font-semibold">2. How We Use Your Information</h3>
          <p>Placeholder text about data usage.</p>

          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
