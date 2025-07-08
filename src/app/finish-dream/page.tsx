
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import type { FirestoreUser } from '@/services/user-service';
import { Button } from '@/components/ui/button';
import { saveColor } from '@/services/color-service';

export default function FinishDreamPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [message, setMessage] = useState('Verifying your dream link...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const processSignIn = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                if (!email) {
                    setError("Your email is required to complete sign-in. Please try the login process again from the same device or browser.");
                    setMessage("Verification Failed");
                    return;
                }

                try {
                    const result = await signInWithEmailLink(auth, email, window.location.href);
                    window.localStorage.removeItem('emailForSignIn');
                    
                    const user = result.user;
                    if (!user) throw new Error("Authentication failed.");

                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as FirestoreUser;
                        
                        if (userProfile.status === 'inactive' || userProfile.status === 'pending_deletion' || userProfile.status === 'blocked') {
                            let description = 'Your account is currently inactive. Please contact support.';
                            if (userProfile.status === 'pending_deletion') description = 'This account is scheduled for deletion and can no longer be accessed.';
                            if (userProfile.status === 'blocked') description = 'This account has been blocked by an administrator.';
                            throw new Error(description);
                        }
                        
                        const colorToSaveJSON = sessionStorage.getItem('colorToSaveAfterLogin');
                        if (colorToSaveJSON) {
                          try {
                            const colorToSave = JSON.parse(colorToSaveJSON);
                            await saveColor(userProfile.id, colorToSave);
                            sessionStorage.removeItem('colorToSaveAfterLogin');
                          } catch (e) {
                            console.error("Failed to save color after login", e);
                          }
                        }

                        localStorage.setItem('loggedInUser', JSON.stringify(userProfile));
                        toast({ title: "Login Successful", description: `Welcome back, ${userProfile.name}.` });
                        
                        router.push(userProfile.role === 'Admin' || userProfile.role === 'Editor' ? '/admin' : '/dashboard');

                    } else {
                        throw new Error("Authenticated user profile not found.");
                    }
                    
                } catch (err: any) {
                    console.error(err);
                    setError(err.message || "The dream link is invalid or has expired. Please try again.");
                    setMessage("Verification Failed");
                }
            } else {
                 setError("This is not a valid dream link.");
                 setMessage("Verification Failed");
            }
        };

        processSignIn();
    }, [router, toast]);

    return (
        <div className="flex min-h-svh items-center justify-center bg-background text-foreground flex-col gap-4 p-4">
            {error ? (
                <>
                    <h1 className="text-2xl font-bold text-destructive">{message}</h1>
                    <p className="text-muted-foreground max-w-sm text-center">{error}</p>
                    <Button onClick={() => router.push('/dream-portal')}>Back to Dream Portal</Button>
                </>
            ) : (
                <>
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <h1 className="text-2xl font-bold">{message}</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </>
            )}
        </div>
    );
}
