
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import type { FirestoreUser } from '@/services/user-service';
import { Button } from '@/components/ui/button';
import { saveColor } from '@/services/color-service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';

export default function FinishDreamPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [message, setMessage] = useState('Verifying your dream link...');
    const [error, setError] = useState<string | null>(null);
    const [promptForEmail, setPromptForEmail] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [isVerifying, setIsVerifying] = useState(true);

    const completeSignIn = useCallback(async (email: string) => {
        setIsVerifying(true);
        setMessage('Finalizing your login...');
        setError(null);
        setPromptForEmail(false);

        try {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            const user = result.user;
            if (!user) throw new Error("Authentication failed after link verification.");

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
                    const colorToSave = JSON.parse(colorToSaveJSON);
                    await saveColor(userProfile.id, colorToSave);
                    sessionStorage.removeItem('colorToSaveAfterLogin');
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
        } finally {
            setIsVerifying(false);
        }
    }, [router, toast]);

    useEffect(() => {
        const processSignInLink = () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let email = window.localStorage.getItem('emailForSignIn');
                if (email) {
                    completeSignIn(email);
                } else {
                    setMessage("Please enter your email to complete sign-in.");
                    setPromptForEmail(true);
                    setIsVerifying(false);
                }
            } else {
                setError("This is not a valid dream link.");
                setMessage("Verification Failed");
                setIsVerifying(false);
            }
        };
        processSignInLink();
    }, [completeSignIn]);

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (emailInput) {
            completeSignIn(emailInput);
        } else {
            toast({ title: 'Email required', description: 'Please enter your email address.', variant: 'destructive' });
        }
    };

    const renderContent = () => {
        if (isVerifying) {
            return (
                <>
                    <Loader2 className="h-10 w-10 animate-spin" />
                    <h1 className="text-2xl font-bold">{message}</h1>
                    <p className="text-muted-foreground">Please wait...</p>
                </>
            );
        }
        if (error) {
             return (
                <>
                    <h1 className="text-2xl font-bold text-destructive">{message}</h1>
                    <p className="text-muted-foreground max-w-sm text-center">{error}</p>
                    <Button onClick={() => router.push('/dream-portal')}>Back to Dream Portal</Button>
                </>
            );
        }
        if (promptForEmail) {
            return (
                 <Card className="mx-auto w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Confirm Your Email</CardTitle>
                        <CardDescription>
                           To complete your sign-in, please enter the email address this link was sent to.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleEmailSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-confirm">Email</Label>
                                <Input 
                                    id="email-confirm"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full">Confirm Email</Button>
                        </CardFooter>
                    </form>
                </Card>
            )
        }
        return null; // Should not be reached
    }

    return (
        <div className="flex min-h-svh items-center justify-center bg-background text-foreground flex-col gap-4 p-4">
            {renderContent()}
        </div>
    );
}
