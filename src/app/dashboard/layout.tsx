"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppFooter } from "@/components/footer";
import { useRouter } from 'next/navigation';

function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Visitor', email: 'visitor@figerout.com', initials: 'V' });

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            setUser({
                name: parsedUser.name,
                email: parsedUser.email,
                initials: parsedUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
            });
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/login');
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <div className="font-semibold text-sm">{user.name}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </div>
      <Avatar className="h-8 w-8">
          <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
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
        <main className="flex-1 p-6">
          {children}
        </main>
        <AppFooter />
    </div>
  );
}
