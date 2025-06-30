import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BlogPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Blog</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Blog Management</CardTitle>
          <CardDescription>Manage your blog posts here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder page for blog management.</p>
        </CardContent>
      </Card>
    </main>
  );
}
