
"use client";

import Link from "next/link";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { LogOut, User as UserIcon, Settings, LifeBuoy, LayoutDashboard, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppFooter } from "@/components/footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/user-data";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getOpenDeletionRequestForUser, SupportTicket } from '@/services/support-service';

function UserNav({ user }: { user: User | null }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('originalLoggedInUser');
    router.push('/login');
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
          Login
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <NotificationsPopover user={user} />
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                      <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/support">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Support</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
              </DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [openDeletionRequest, setOpenDeletionRequest] = useState<SupportTicket | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            const checkDeletionStatus = async () => {
                if (userData.status !== 'pending_deletion') {
                    const request = await getOpenDeletionRequestForUser(userData.id);
                    setOpenDeletionRequest(request);
                }
            };
            checkDeletionStatus();

        } catch (e) { console.error(e) }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 z-10">
           <Link href="/" className="font-headline text-lg font-bold">
                Figerout
            </Link>
           <UserNav user={user} />
        </header>
        <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
          {(user?.status === 'pending_deletion' || openDeletionRequest) && (
              <Alert variant="destructive" className="mb-6 flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-grow">
                  <AlertTitle>Account Deletion In Progress</AlertTitle>
                  <AlertDescription>
                    A request to delete your account is currently being processed.&nbsp;
                    <Button asChild variant="link" className="p-0 h-auto font-bold text-current underline">
                        <Link href="/dashboard/support">
                            View details or cancel.
                        </Link>
                    </Button>
                  </AlertDescription>
                </div>
              </Alert>
          )}
          {children}
        </main>
        <AppFooter />
    </div>
  );
}
