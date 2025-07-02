
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">App Settings</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Manage your application settings here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder page for application settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
