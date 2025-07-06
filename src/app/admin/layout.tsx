
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Newspaper, 
  Settings, 
  FileText, 
  ExternalLink,
  LogOut,
  Users,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppFooter } from "@/components/footer";

function UserNav() {
  const router = useRouter();
  const user = {
    name: "Admin User",
    email: "admin@figerout.com",
    avatar: "" 
  }
  
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    router.push('/login');
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <div className="text-right hidden sm:block">
        <div className="font-semibold text-sm">{user.name}</div>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </div>
      <Avatar className="h-8 w-8 hidden sm:flex">
          <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
      </Button>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'Admin' | 'Editor' | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role === 'Viewer') {
                router.replace('/dashboard');
            } else {
                setUserRole(parsedUser.role);
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            router.replace('/login');
        }
    } else {
        router.replace('/login');
    }
  }, [router]);


  const isActive = (path: string) => {
    return pathname === path || (path !== "/admin" && pathname.startsWith(path));
  };
  
  if (!userRole) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex h-14 items-center justify-between border-b lg:h-[60px] group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:lg:h-10">
            <div className="flex w-full items-center justify-center group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-2">
              <Link href="/admin" className="font-headline text-lg font-bold">
                <span className="group-data-[state=collapsed]:hidden">Figerout Admin</span>
                <span className="hidden group-data-[state=collapsed]:inline">F</span>
              </Link>
            </div>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                asChild
                tooltip="Visit Website"
                >
                <a href="/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink />
                    <span className="group-data-[state=collapsed]:hidden">Visit Website</span>
                </a>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/admin"}
                tooltip="Dashboard"
              >
                <Link href="/admin">
                  <LayoutDashboard />
                  <span className="group-data-[state=collapsed]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/blog")}
                tooltip="Blog"
              >
                <Link href="/admin/blog">
                  <Newspaper />
                  <span className="group-data-[state=collapsed]:hidden">Blog</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {userRole === 'Admin' && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/pages")}
                    tooltip="Pages"
                  >
                    <Link href="/admin/pages">
                      <FileText />
                      <span className="group-data-[state=collapsed]:hidden">Pages</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/users")}
                    tooltip="Users"
                  >
                    <Link href="/admin/users">
                      <Users />
                      <span className="group-data-[state=collapsed]:hidden">Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin/settings")}
                    tooltip="App Settings"
                  >
                    <Link href="/admin/settings">
                      <Settings />
                      <span className="group-data-[state=collapsed]:hidden">App Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-6 z-10">
           <SidebarTrigger className="hidden md:flex"/>
           <UserNav />
        </header>
        <main className="flex-1">
          {children}
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
