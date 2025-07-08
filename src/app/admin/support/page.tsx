"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Inbox, Check, X } from "lucide-react";
import { getDeletionRequests, updateRequestStatus, SupportTicket } from '@/services/support-service';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedTickets = await getDeletionRequests();
            setTickets(fetchedTickets);
        } catch (error) {
            toast({
                title: "Error fetching tickets",
                description: "Could not load support requests.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleUpdateStatus = async (ticketId: string, status: 'approved' | 'rejected') => {
        try {
            await updateRequestStatus(ticketId, status);
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
            toast({
                title: "Ticket Updated",
                description: `The request has been ${status}.`
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: "Could not update the ticket status.",
                variant: "destructive"
            });
        }
    };

    const StatusBadge = ({ status }: { status: SupportTicket['status'] }) => {
        const config = {
            open: { variant: 'default', text: 'Open' },
            approved: { variant: 'secondary', text: 'Approved' },
            rejected: { variant: 'outline', text: 'Rejected' },
            cancelled: { variant: 'outline', text: 'Cancelled' },
        } as const;
        const currentConfig = config[status] || { variant: 'outline', text: 'Unknown' };
        return <Badge variant={currentConfig.variant}>{currentConfig.text}</Badge>;
    };

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col flex-1 gap-6 p-6">
            <h1 className="text-lg font-semibold md:text-2xl">Support Center</h1>
            
            {tickets.length === 0 ? (
                <Card>
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                            <Inbox className="w-16 h-16 mb-4" />
                            <h3 className="text-xl font-semibold text-foreground">All Caught Up!</h3>
                            <p className="mt-2">There are no open support requests.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tickets.map(ticket => (
                        <Card key={ticket.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">Account Deletion Request</CardTitle>
                                    <StatusBadge status={ticket.status} />
                                </div>
                                <CardDescription>{ticket.userEmail}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic border-l-2 pl-3">
                                    "{ticket.reason}"
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                                </p>
                                {ticket.status === 'open' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(ticket.id, 'rejected')}>
                                            <X className="mr-2 h-4 w-4"/>
                                            Reject
                                        </Button>
                                        <Button size="sm" onClick={() => handleUpdateStatus(ticket.id, 'approved')}>
                                            <Check className="mr-2 h-4 w-4"/>
                                            Approve
                                        </Button>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
