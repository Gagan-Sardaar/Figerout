
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
import { users as staticUsers, User, DisplayUser } from "@/lib/user-data";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs only on the client, after hydration.
    // To prevent hydration errors, we process dates and set the initial state here.
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
    
    setUsers(processedUsers);
  }, []);

  const handleSaveUser = (updatedUser: Omit<User, 'lastLogin'>) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
  };

  const handleDelete = (userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "The user has been removed from the list.",
      variant: "destructive",
    });
  };

  // During SSR and initial client render, use a version of the data without dates to avoid mismatch.
  const usersToRender = users.length > 0 
    ? users 
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
                    <EditUserDialog user={user} onSave={handleSaveUser}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-primary focus:text-primary-foreground">
                        Edit
                      </DropdownMenuItem>
                    </EditUserDialog>
                    <DropdownMenuItem onSelect={() => handleDelete(user.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                      Delete
                    </DropdownMenuItem>
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
