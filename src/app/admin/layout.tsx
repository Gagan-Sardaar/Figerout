
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Newspaper, 
  Settings, 
  FileText, 
  ExternalLink,
  LogOut,
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
  const user = {
    name: "Admin User",
    email: "admin@figerout.com",
    avatar: "" 
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
      <Button variant="outline" size="sm" asChild>
        <Link href="/">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Link>
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

  const isActive = (path: string) => {
    return pathname === path || (path !== "/admin" && pathname.startsWith(path));
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-14 items-center gap-2 p-2 justify-between border-b lg:h-[60px]">
            <div className="font-headline text-lg font-bold p-2">Figerout Admin</div>
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
                    <span>Visit Website</span>
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
                  <span>Dashboard</span>
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
                  <span>Blog</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive("/admin/pages")}
                tooltip="Pages"
              >
                <Link href="/admin/pages">
                  <FileText />
                  <span>Pages</span>
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
                  <span>App Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
