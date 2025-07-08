"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { deleteAllColors } from "@/services/color-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, ShieldQuestion, Mail, ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");
  const [isDeleteRequestDialogOpen, setIsDeleteRequestDialogOpen] = useState(false);

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

  const handleSendResetLink = async () => {
    if (!userEmail) return;
    try {
      await sendPasswordResetEmail(auth, userEmail);
      toast({
        title: "Password Reset Email Sent",
        description: `A reset link has been sent to ${userEmail}. Please check your inbox.`,
      });
    } catch (error) {
      toast({
        title: "Error Sending Email",
        description: "Could not send password reset email. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleResetColors = async () => {
    if (!userId) return;
    try {
      await deleteAllColors(userId);
      toast({
        title: "Colors Cleared",
        description: "All of your saved colors have been permanently deleted.",
      });
    } catch (error) {
      toast({
        title: "Error Clearing Colors",
        description: "Could not clear your saved colors. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleRequestDeletion = async () => {
      if (!deletionReason) {
        toast({ title: "Reason Required", description: "Please provide a reason for deleting your account.", variant: "destructive" });
        return;
      }
      setIsSubmitting(true);
      // Placeholder for actual submission logic
      console.log("Account Deletion Requested:", { userId, reason: deletionReason });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Deletion Request Sent",
        description: "Your account deletion request has been submitted for review.",
      });

      setIsSubmitting(false);
      setIsDeleteRequestDialogOpen(false);
      setDeletionReason("");
  };


  if (!userEmail) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldQuestion /> Security</CardTitle>
          <CardDescription>Manage your password and account security settings.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5 mb-4 sm:mb-0">
                    <p className="text-sm font-medium">Password Reset</p>
                    <p className="text-xs text-muted-foreground">
                        Send a password reset link to your email address.
                    </p>
                </div>
                <Button onClick={handleSendResetLink}>
                    <Mail className="mr-2 h-4 w-4" /> Send Reset Link
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert /> Danger Zone</CardTitle>
            <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div className="space-y-0.5 mb-4 sm:mb-0">
                    <p className="text-sm font-medium">Reset All Saved Colors</p>
                    <p className="text-xs text-muted-foreground">
                        This will permanently delete your entire color collection.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" outline>
                            <Trash2 className="mr-2 h-4 w-4" /> Reset Colors
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all your saved colors from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetColors} className="bg-destructive hover:bg-destructive/90">Yes, delete all my colors</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/20 p-4">
                <div className="space-y-0.5 mb-4 sm:mb-0">
                    <p className="text-sm font-medium">Delete Your Account</p>
                    <p className="text-xs text-muted-foreground">
                        Request permanent deletion of your account and all associated data.
                    </p>
                </div>
                <AlertDialog open={isDeleteRequestDialogOpen} onOpenChange={setIsDeleteRequestDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                             <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                                Account deletion is final. Once your request is processed, all data will be removed after a 30-day grace period. Please tell us why you are leaving so we can improve.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid w-full gap-2">
                           <Label htmlFor="deletion-reason">Reason for leaving</Label>
                           <Textarea
                                id="deletion-reason"
                                placeholder="Your feedback is valuable to us..."
                                value={deletionReason}
                                onChange={(e) => setDeletionReason(e.target.value)}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletionReason("")}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRequestDeletion} disabled={isSubmitting || !deletionReason} className="bg-destructive hover:bg-destructive/90">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Deletion Request
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
