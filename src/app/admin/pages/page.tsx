import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PagesPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
       <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Pages</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Page Management</CardTitle>
          <CardDescription>Manage your application pages here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder page for page management.</p>
        </CardContent>
      </Card>
    </main>
  );
}
