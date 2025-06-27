import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <p>This is a placeholder for your Terms of Service.</p>
          <p>
            Please replace this with your own terms. It should cover user responsibilities, intellectual property rights, acceptable use, and limitations of liability.
          </p>

          <h3 className="font-semibold">1. Acceptance of Terms</h3>
          <p>Placeholder text about user agreement.</p>
          
          <h3 className="font-semibold">2. User Conduct</h3>
          <p>Placeholder text about user responsibilities.</p>

          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
