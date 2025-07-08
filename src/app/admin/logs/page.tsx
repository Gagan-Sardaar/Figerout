import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileClock } from "lucide-react";

export default function AdminLogsPage() {
  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <h1 className="text-lg font-semibold md:text-2xl">Activity Logs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This page will display real-time activity logs from across the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center text-muted-foreground">
                <FileClock className="w-16 h-16 mb-4" />
                <p>Activity logging is under construction.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
