
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">About Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This is a placeholder for your About Us page.</p>
          <p>
            Here you can share the story behind Figerout, your mission, and introduce your team.
          </p>

          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
