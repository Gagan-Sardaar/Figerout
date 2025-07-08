
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { deleteAllColors } from "@/services/color-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, ShieldQuestion, Mail, ShieldAlert, XCircle } from "lucide-react";
import { updateUser } from "@/services/user-service";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);

        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            try {
                setUserRole(JSON.parse(storedUser).role);
            } catch (e) {
                console.error("Failed to parse user role from local storage", e);
            }
        }
      } else {
        router.push("/dream-portal");
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

  const handleDeactivateAccount = async () => {
    if (!userId) return;
    setIsDeactivating(true);
    try {
      await updateUser(userId, { status: 'inactive' });
      toast({
        title: "Account Deactivated",
        description: "Your account has been successfully deactivated. You have been logged out.",
      });
      await auth.signOut();
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('originalLoggedInUser');
      router.push("/dream-portal");
    } catch (error) {
      console.error(error);
      toast({
        title: "Deactivation Failed",
        description: "Could not deactivate your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  if (!userEmail || !userRole) {
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
                        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/90 hover:text-destructive-foreground">
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
            
            {userRole !== 'Admin' && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive/20 p-4">
                  <div className="space-y-0.5 mb-4 sm:mb-0">
                      <p className="text-sm font-medium">Deactivate Account</p>
                      <p className="text-xs text-muted-foreground">
                          Temporarily deactivate your account. You will be logged out.
                      </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="mr-2 h-4 w-4" /> Deactivate Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to deactivate?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be logged out and will not be able to log back in until your account is reactivated by support. Your data will not be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeactivateAccount} disabled={isDeactivating} className="bg-destructive hover:bg-destructive/90">
                          {isDeactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

    