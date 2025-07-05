"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { users as staticUsers, User } from "@/lib/user-data";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

// Extend User type to include the formatted string for lastLogin
interface DisplayUser extends Omit<User, 'lastLogin'> {
    lastLogin: string;
}

export default function UsersPage() {
  const [hydratedUsers, setHydratedUsers] = useState<DisplayUser[]>([]);

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    const processedUsers = staticUsers.map(user => {
      const date = new Date();
      date.setDate(date.getDate() - user.lastLogin.days);
      date.setHours(date.getHours() - (user.lastLogin.hours || 0));
      date.setMinutes(date.getMinutes() - (user.lastLogin.minutes || 0));
      
      const lastLoginString = date.toLocaleString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit' 
      });

      return {
        ...user,
        lastLogin: lastLoginString,
      };
    });
    
    setHydratedUsers(processedUsers);
  }, []);

  // During SSR and initial client render, use a version of the data without dates to avoid mismatch.
  const usersToRender = hydratedUsers.length > 0 
    ? hydratedUsers 
    : staticUsers.map(u => ({ ...u, lastLogin: '' }));


  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          A list of all users with access to your project.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Login</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersToRender.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline">{user.role}</Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant={user.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {user.lastLogin || <span className="text-muted-foreground">Loading...</span>}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
