
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword } from 'firebase/auth';
import { createUser } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const createAccountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  password: z.string().min(8, "Password must be at least 8 characters.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Must include uppercase, lowercase, and a number."),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

function CreateAccountForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [oobCode, setOobCode] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<CreateAccountFormValues>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: { name: "", password: "", confirmPassword: "" },
    });

    useEffect(() => {
        const code = searchParams.get('oobCode');
        if (!code) {
            setError("The setup link is missing necessary information. Please try again.");
            setIsLoading(false);
            return;
        }

        setOobCode(code);
        verifyPasswordResetCode(auth, code)
            .then((verifiedEmail) => {
                setEmail(verifiedEmail);
            })
            .catch(() => {
                setError("This setup link is invalid or has expired. Please request a new one.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [searchParams]);

    const onSubmit = async (values: CreateAccountFormValues) => {
        if (!oobCode || !email) {
            toast({ title: "Error", description: "Something went wrong. Please try the link again.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            await confirmPasswordReset(auth, oobCode, values.password);
            const userCredential = await signInWithEmailAndPassword(auth, email, values.password);
            const firebaseUser = userCredential.user;

            const userProfile = await createUser(firebaseUser.uid, { email, name: values.name });
            
            localStorage.setItem('loggedInUser', JSON.stringify(userProfile));
            toast({ title: "Account Created!", description: `Welcome, ${userProfile.name}!` });
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            toast({ title: "Account Creation Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-10 w-10 animate-spin" />
                <h1 className="text-2xl font-bold">Verifying Link...</h1>
                <p className="text-muted-foreground">Please wait while we check your setup link.</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                    <CardTitle className="text-2xl text-destructive">Link Invalid</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild className="w-full"><Link href="/dream-portal">Back to Login</Link></Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="mx-auto w-full max-w-sm">
            <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                <CardDescription>
                    Welcome! Set a secure password for <span className="font-medium text-foreground">{email}</span>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your full name" {...field} autoFocus /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? "text" : "password"} placeholder="Enter a strong password" {...field} className="pr-10" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" {...field} className="pr-10" />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Account
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}


export default function CreateAccountPage() {
    return (
        <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
            <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin" />}>
                <CreateAccountForm />
            </Suspense>
        </div>
    )
}
