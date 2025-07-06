
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { LogOut, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AppFooter } from "@/components/footer";
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/user-data";

function RoleSwitcher() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
  
  const handleSwitchRole = (newRole: 'Admin' | 'Editor' | 'Viewer') => {
    const storedOriginalUser = localStorage.getItem('originalLoggedInUser');
    if (!storedOriginalUser) return;

    const userToModify = JSON.parse(storedOriginalUser);
    userToModify.role = newRole;
    localStorage.setItem('loggedInUser', JSON.stringify(userToModify));
    
    if (newRole === 'Viewer') {
      window.location.reload();
    } else {
      router.push('/admin');
    }
  };

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8">
          <span>View: {currentUser.role}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Dashboard View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleSwitchRole('Admin')}>
          Admin
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitchRole('Editor')}>
          Editor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitchRole('Viewer')}>
          Viewer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserNav() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'Visitor', email: 'visitor@figerout.com', initials: 'V' });
  const [originalUser, setOriginalUser] = useState<User | null>(null);

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

    const storedOriginalUser = localStorage.getItem('originalLoggedInUser');
    if (storedOriginalUser) {
      setOriginalUser(JSON.parse(storedOriginalUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('originalLoggedInUser');
    router.push('/login');
  }

  return (
    <div className="flex items-center gap-4">
      {originalUser?.role === 'Admin' && <RoleSwitcher />}
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
        <main className="flex-1">
          {children}
        </main>
        <AppFooter />
    </div>
  );
}
