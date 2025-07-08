
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { Loader2, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createDeletionRequest } from "@/services/support-service";

export default function SupportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletionReason, setDeletionReason] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            setUserEmail(user.email);
            setUserId(user.uid);
          } else {
            router.push("/login");
          }
        });
        return () => unsubscribe();
    }, [router]);

    const handleRequestDeletion = async () => {
        if (!userId || !userEmail) {
          toast({ title: "Error", description: "Could not identify user. Please try again.", variant: "destructive" });
          return;
        }
        if (!deletionReason.trim()) {
          toast({ title: "Reason Required", description: "Please provide a reason for deleting your account.", variant: "destructive" });
          return;
        }
        setIsSubmitting(true);
        
        try {
          await createDeletionRequest(userId, userEmail, deletionReason);
          toast({
              title: "Deletion Request Sent",
              description: "Your account deletion request has been submitted for review. An admin will process it shortly.",
          });
          setDeletionReason("");
        } catch (error) {
          console.error("Failed to submit deletion request:", error);
          toast({
              title: "Request Failed",
              description: "Could not submit your request. Please try again later.",
              variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
    };

    if (!userId) {
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
            </CardContent>
        </Card>
    );
}
