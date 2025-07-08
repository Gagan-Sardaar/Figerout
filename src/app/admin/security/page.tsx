
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, KeyRound, ServerCrash, Unplug, ShieldCheck, ShieldX, Unlock } from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { onFailedLoginsChange, resetLockout, FailedLoginAttempt } from '@/services/security-service';
import { getUserByEmail, getBlockedUsers, updateUser, FirestoreUser } from '@/services/user-service';
import { addLogEntry } from '@/services/logging-service';
import { Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function AdminSecurityPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);
    const [failedLogins, setFailedLogins] = useState<FailedLoginAttempt[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<FirestoreUser[]>([]);
    const [emailToReset, setEmailToReset] = useState("");
    const [emailToBlock, setEmailToBlock] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role !== 'Admin') {
                router.replace('/admin');
                return;
            }

            setIsAllowed(true);

            // Fetch non-realtime data
            getBlockedUsers().then(setBlockedUsers).catch(err => {
                console.error(err);
                toast({ title: "Error", description: "Could not load blocked users.", variant: "destructive" });
            });

            // Set up listener for real-time data
            const unsubscribe = onFailedLoginsChange((logins) => {
                setFailedLogins(logins);
                if (isLoading) setIsLoading(false);
            });

            return () => unsubscribe();
        } else {
            router.replace('/dream-portal');
        }
    }, [router, toast, isLoading]);

    const handleResetLockout = async () => {
        if (!emailToReset.trim()) return;
        try {
            await resetLockout(emailToReset);
            toast({ title: "Lockout Reset", description: `Login lockout for ${emailToReset} has been reset.` });
            setEmailToReset("");
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Could not reset lockout.", variant: "destructive" });
        }
    };

    const handleBlockUser = async () => {
        if (!emailToBlock.trim()) return;
        try {
            const user = await getUserByEmail(emailToBlock);
            if (!user) {
                toast({ title: "User Not Found", description: `No user found with email ${emailToBlock}.`, variant: "destructive" });
                return;
            }
            if (user.role === 'Admin') {
                toast({ title: "Action Not Allowed", description: "Cannot block an administrator account.", variant: "destructive" });
                return;
            }
            await updateUser(user.id, { status: 'blocked' });
            await addLogEntry('user_blocked', `Admin blocked user ${user.email}`, { admin: localStorage.getItem('loggedInUser'), targetUserId: user.id });
            toast({ title: "User Blocked", description: `${user.email} has been blocked successfully.` });
            setBlockedUsers(prev => [...prev, user]);
            setEmailToBlock("");
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Could not block user.", variant: "destructive" });
        }
    };
    
    const handleUnblockUser = async (userId: string, email: string) => {
        try {
            await updateUser(userId, { status: 'active' });
            await addLogEntry('user_unblocked', `Admin unblocked user ${email}`, { admin: localStorage.getItem('loggedInUser'), targetUserId: userId });
            toast({ title: "User Unblocked", description: `${email} has been unblocked.` });
            setBlockedUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Could not unblock user.", variant: "destructive" });
        }
    };

    if (!isAllowed) {
        return <div className="flex flex-1 items-center justify-center h-full p-6"><Loader2 className="h-10 w-10 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col flex-1 gap-6 p-6">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShieldAlert /> Security Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><KeyRound/> Manage Login Lockouts</CardTitle>
                        <CardDescription>If a user is locked out of their account, you can reset their lockout timer here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex gap-2">
                            <Input 
                                placeholder="user@example.com" 
                                value={emailToReset}
                                onChange={(e) => setEmailToReset(e.target.value)}
                            />
                            <Button onClick={handleResetLockout}>Reset Lockout</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldX /> Block User Account</CardTitle>
                        <CardDescription>Permanently block a user from accessing the application by their email address.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex gap-2">
                            <Input 
                                placeholder="spammer@example.com" 
                                value={emailToBlock}
                                onChange={(e) => setEmailToBlock(e.target.value)}
                            />
                            <Button variant="destructive" onClick={handleBlockUser}>Block User</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {blockedUsers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck /> Blocked Users ({blockedUsers.length})</CardTitle>
                        <CardDescription>List of users who are currently blocked from logging in.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blockedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" onClick={() => handleUnblockUser(user.id, user.email)}>
                                            <Unlock className="mr-2 h-4 w-4"/> Unblock
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent Failed Login Attempts</CardTitle>
                    <CardDescription>A log of the most recent failed login attempts across the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="flex flex-1 items-center justify-center p-6 h-64"><Loader2 className="h-10 w-10 animate-spin" /></div>
                    ) : failedLogins.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center text-muted-foreground">
                            <Unplug className="w-16 h-16 mb-4" />
                            <p>No failed login attempts have been recorded yet.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Location</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {failedLogins.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className="text-muted-foreground text-xs cursor-default">
                                                {formatDistanceToNow((log.timestamp as unknown as Timestamp).toDate(), { addSuffix: true })}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                <p>{(log.timestamp as unknown as Timestamp).toDate().toLocaleString()}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.email}</TableCell>
                                    <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                                    <TableCell>{log.location}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
