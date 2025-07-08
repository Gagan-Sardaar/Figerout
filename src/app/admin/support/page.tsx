import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function AdminSupportPage() {
  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <h1 className="text-lg font-semibold md:text-2xl">Support Center</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will display user support requests, including account deletion tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center text-muted-foreground">
                <LifeBuoy className="w-16 h-16 mb-4" />
                <p>The support ticket system is under construction.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
