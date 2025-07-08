
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { Loader2, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createDeletionRequest, cancelDeletionRequest, getOpenDeletionRequestForUser, SupportTicket } from "@/services/support-service";
import { getUser, FirestoreUser } from "@/services/user-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SupportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [userId, setUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletionReason, setDeletionReason] = useState("");

    const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
    const [openRequest, setOpenRequest] = useState<SupportTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [countdown, setCountdown] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            setUserId(user.uid);
            setIsLoading(true);
            const profile = await getUser(user.uid);
            setUserProfile(profile);

            if (profile?.status !== 'pending_deletion') {
                const request = await getOpenDeletionRequestForUser(user.uid);
                setOpenRequest(request);
            }
            
            setIsLoading(false);
          } else {
            router.push("/login");
          }
        });
        return () => unsubscribe();
    }, [router]);

     useEffect(() => {
        if (userProfile?.status !== 'pending_deletion' || !userProfile.deletionScheduledAt) {
            setCountdown(null);
            return;
        }

        const scheduledAt = userProfile.deletionScheduledAt.toDate();
        const deletionDate = new Date(scheduledAt.getTime() + 30 * 24 * 60 * 60 * 1000);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = deletionDate.getTime() - now;

            if (distance < 0) {
                setCountdown("Your account is being deleted.");
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [userProfile]);

    const handleRequestDeletion = async () => {
        if (!userId || !userProfile?.email) {
          toast({ title: "Error", description: "Could not identify user. Please try again.", variant: "destructive" });
          return;
        }
        if (!deletionReason.trim()) {
          toast({ title: "Reason Required", description: "Please provide a reason for deleting your account.", variant: "destructive" });
          return;
        }
        setIsSubmitting(true);
        
        try {
          await createDeletionRequest(userId, userProfile.email, deletionReason);
          toast({
              title: "Deletion Request Sent",
              description: "Your account deletion request has been submitted for review. An admin will process it shortly.",
          });
          setDeletionReason("");
          const request = await getOpenDeletionRequestForUser(userId);
          setOpenRequest(request);
        } catch (error: any) {
          toast({
              title: "Request Failed",
              description: error.message || "Could not submit your request. Please try again later.",
              variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
    };
    
     const handleCancelRequest = async () => {
        if (!userId) return;
        setIsSubmitting(true);
        try {
            await cancelDeletionRequest(userId);
            toast({
                title: "Request Cancelled",
                description: "Your account deletion request has been cancelled.",
            });
            const profile = await getUser(userId);
            setUserProfile(profile);
            setOpenRequest(null);
        } catch(error: any) {
            toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }


    if (isLoading) {
        return (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Support Center</CardTitle>
                <CardDescription>
                    Manage your account and get help here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {userProfile?.status === 'pending_deletion' ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive"><AlertCircle/> Account Deletion Pending</CardTitle>
                            <CardDescription>Your account is scheduled for permanent deletion based on your request.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert variant="destructive" className="bg-destructive/10">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Deletion Scheduled</AlertTitle>
                                <AlertDescription>
                                    Your account and all associated data will be permanently deleted in approximately:
                                    <div className="text-2xl font-mono font-bold text-center py-4 text-destructive">{countdown || <Loader2 className="h-6 w-6 animate-spin mx-auto" />}</div>
                                    You can cancel this request at any time before the deletion date.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleCancelRequest} disabled={isSubmitting} variant="outline">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cancel Deletion Request
                            </Button>
                        </CardFooter>
                    </Card>
                ) : openRequest ? (
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Request Sent
                            </CardTitle>
                            <CardDescription>
                                Your request to delete your account was sent on {new Date(openRequest.createdAt).toLocaleDateString()}. It is awaiting admin review.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert variant="default" className="bg-muted/50">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>What Happens Next?</AlertTitle>
                                <AlertDescription>
                                    Once an administrator approves your request, a 30-day grace period will begin, after which your account will be permanently deleted. You can cancel at any time.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleCancelRequest} disabled={isSubmitting} variant="outline">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cancel Deletion Request
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-destructive" />
                                Request Account Deletion
                            </CardTitle>
                            <CardDescription>
                                Submit a request to permanently delete your account and all associated data. This action is final and cannot be undone. The process will begin after admin approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full gap-2">
                            <Label htmlFor="deletion-reason">Reason for leaving (required)</Label>
                            <Textarea
                                    id="deletion-reason"
                                    placeholder="Your feedback is valuable to us..."
                                    value={deletionReason}
                                    onChange={(e) => setDeletionReason(e.target.value)}
                                    className="min-h-[120px]"
                                />
                            </div>
                            <Button onClick={handleRequestDeletion} disabled={isSubmitting || !deletionReason.trim()} variant="destructive">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Deletion Request
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}
