"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { NewUserDialog } from "@/components/admin/new-user-dialog";
import { getUsers, updateUser, FirestoreUser } from "@/services/user-service";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow, addDays, format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [signedInUser, setSignedInUser] = useState<{ email: string; role: 'Admin' | 'Editor' | 'Viewer' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserJson = localStorage.getItem('loggedInUser');
    if (storedUserJson) {
      const user = JSON.parse(storedUserJson);
      setSignedInUser(user);
      if (user.role !== 'Admin') {
        router.replace('/admin');
        return;
      }
    } else {
      router.replace('/login');
      return;
    }

    const fetchUsers = async () => {
        setIsLoading(true);
        const firestoreUsers = await getUsers();
        setUsers(firestoreUsers);
        setIsLoading(false);
    };
    
    fetchUsers();
  }, [router]);

  if (!signedInUser) {
    return (
        <div className="flex h-full flex-1 items-center justify-center p-6">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  const handleSaveUser = async (updatedUser: Partial<FirestoreUser>) => {
    if (!updatedUser.id) return;

    // Optimistically update the UI
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );

    try {
        await updateUser(updatedUser.id, updatedUser);
        toast({
            title: "User Updated",
            description: `${updatedUser.name}'s details have been updated successfully.`,
        });
    } catch(e) {
        console.error(e);
        toast({
            title: "Update Failed",
            description: `Could not update ${updatedUser.name}'s details.`,
            variant: "destructive"
        });
        // Revert UI if update fails
        const firestoreUsers = await getUsers();
        setUsers(firestoreUsers);
    }
  };

  const usersToRender = users;

  return (
    <div className="flex flex-col flex-1 gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              A list of all users with access to your project.
            </p>
        </div>
        {signedInUser.role === 'Admin' && (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {/* The NewUserDialog is temporarily disabled. */}
                        <div tabIndex={0}>
                           <Button disabled>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              New User
                            </Button>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Creating users requires a secure server function. Coming soon!</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="hidden sm:table-cell">Role</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell">Details</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : usersToRender.map((user) => (
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
                <Badge
                  variant={
                    user.status === 'active' ? 'secondary'
                    : user.status === 'invited' ? 'default'
                    : user.status === 'pending_deletion' ? 'destructive'
                    : 'outline'
                  }
                  className="capitalize"
                >
                  {user.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                {user.status === 'pending_deletion' && user.deletionScheduledAt ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-destructive font-medium">Deletes on {format(addDays(user.deletionScheduledAt.toDate(), 30), 'MMM d, yyyy')}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>User marked for deletion {formatDistanceToNow(user.deletionScheduledAt.toDate(), { addSuffix: true })}.</p>
                        <p>Data will be purged in 30 days.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span>Last Login: N/A</span>
                )}
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
                    {/* Admins can delete any user except themselves */}
                    <DropdownMenuItem disabled className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
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
