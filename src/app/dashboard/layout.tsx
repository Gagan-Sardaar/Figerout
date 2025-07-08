
"use client";

import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppFooter } from "@/components/footer";
import { useRouter } from 'next/navigation';

function UserNav() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('originalLoggedInUser');
    router.push('/login');
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Visit Website</span>
          </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 z-10">
           <Link href="/" className="font-headline text-lg font-bold">
                Figerout
            </Link>
           <UserNav />
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <AppFooter />
    </div>
  );
}
