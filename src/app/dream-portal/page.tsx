
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { searchPexelsImage } from "@/app/actions";
import { Loader2, User, Eye, EyeOff, ArrowLeft, AlertTriangle, Mail } from "lucide-react";
import { saveColor } from "@/services/color-service";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, User as FirebaseUser, sendSignInLinkToEmail, fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import type { FirestoreUser } from "@/services/user-service";
import { addLogEntry } from "@/services/logging-service";
import { LockoutState, getLockoutState, processFailedLogin, clearSuccessfulLogin } from "@/services/security-service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DreamPortalPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [backgroundDetails, setBackgroundDetails] = useState<{ url: string; photographer: string; photographerUrl: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password' | 'locked' | 'signup'>('email');
  const [lockoutInfo, setLockoutInfo] = useState<{until: number, message: string} | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [lockoutExpired, setLockoutExpired] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isSendingSignupLink, setIsSendingSignupLink] = useState(false);
  const [unauthorizedDomainError, setUnauthorizedDomainError] = useState<string | null>(null);


  useEffect(() => {
    if (localStorage.getItem("loggedInUser")) {
      router.push("/");
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    const fetchAndSetBackground = async () => {
      const storedBg = localStorage.getItem('loginBackground');
      const now = new Date().getTime();

      if (storedBg) {
        try {
          const { url, expiry, photographer, photographerUrl } = JSON.parse(storedBg);
          if (now < expiry) {
            setBackgroundDetails({ url, photographer, photographerUrl });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse login background from localStorage", e);
        }
      }

      const queries = ['minimal abstract', 'dark texture', 'gradient wallpaper', 'subtle pattern', 'dark landscape'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const imageResult = await searchPexelsImage(randomQuery);
      
      if (imageResult?.dataUri) {
        const bgDetails = {
            url: imageResult.dataUri,
            photographer: imageResult.photographer,
            photographerUrl: imageResult.photographerUrl,
        };
        const newExpiry = now + 24 * 60 * 60 * 1000; // 24 hours
        localStorage.setItem('loginBackground', JSON.stringify({ ...bgDetails, expiry: newExpiry }));
        setBackgroundDetails(bgDetails);
      }
      setIsLoading(false);
    };

    fetchAndSetBackground();
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;
    
    const message = sessionStorage.getItem('logout_message');
    if (message) {
        toast({
            title: "Account Update",
            description: message,
            duration: 9000,
        });
        sessionStorage.removeItem('logout_message');
    }

    const lastEmail = localStorage.getItem('lastLoginEmail');
    if (lastEmail) {
      setEmail(lastEmail);
    }
  }, [toast, authChecked]);

  useEffect(() => {
    if (loginStep !== 'locked' || !lockoutInfo) {
      setTimeLeft('');
      return;
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const distance = lockoutInfo.until - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft("You can now try again.");
        setLockoutExpired(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let timeLeftString = '';
      if (days > 0) timeLeftString += `${days}d `;
      if (hours > 0 || days > 0) timeLeftString += `${String(hours).padStart(2, '0')}:`;
      timeLeftString += `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      setTimeLeft(timeLeftString.trim());
    }, 1000);

    return () => clearInterval(timer);
  }, [loginStep, lockoutInfo]);

  const handleFailedLoginAttempt = async () => {
    const newLockoutState = await processFailedLogin(email);

    if (newLockoutState.until) {
        const untilMillis = (newLockoutState.until as Timestamp).toMillis();
        setLockoutInfo({
            until: untilMillis,
            message: `Too many failed attempts.`
        });
        setLoginStep('locked');
    }

    let toastDescription = "Invalid email or password. Please try again.";
    const remainingAttempts = 3 - (newLockoutState.attempts % 3);
    if (newLockoutState.attempts < 3) {
      toastDescription += ` ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before a 15 min lockout.`;
    }

    toast({
      title: "Login Failed",
      description: toastDescription,
      variant: "destructive",
    });
  };

  const handleEmailStep = async () => {
    if (!email) {
        toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
        return;
    }

    setIsCheckingEmail(true);
    localStorage.setItem('lastLoginEmail', email);

    try {
        const lockout = await getLockoutState(email);
        if (lockout && lockout.until) {
            const untilMillis = (lockout.until as Timestamp).toMillis();
            if (Date.now() < untilMillis) {
                setLockoutInfo({
                    until: untilMillis,
                    message: "This account is temporarily locked."
                });
                setLoginStep('locked');
                return;
            }
        }
        setLoginStep('password');
    } catch (error) {
        console.error("Error checking lockout status:", error);
        toast({ title: "Error", description: "Could not verify email status. Please try again.", variant: "destructive"});
    } finally {
        setIsCheckingEmail(false);
    }
  };

  const handlePasswordStep = async () => {
     if (!email || !password) {
      toast({ title: "Email and password required", description: "Please enter your email and password.", variant: "destructive" });
      return;
    }

    setIsLoggingIn(true);
    let authUser: FirebaseUser | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authUser = userCredential.user;
      
      if (!authUser) throw new Error("Authentication failed, user not found.");
      
      const userDocRef = doc(db, "users", authUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as FirestoreUser;

        if (userProfile.status === 'inactive' || userProfile.status === 'pending_deletion' || userProfile.status === 'blocked') {
            let title = 'Account Access Denied';
            let description = 'Your account is currently inactive. Please contact support.';
            if (userProfile.status === 'pending_deletion') {
                description = 'This account is scheduled for deletion and can no longer be accessed.';
            } else if (userProfile.status === 'blocked') {
                description = 'This account has been blocked by an administrator.';
            }
            toast({ title, description, variant: "destructive", duration: 9000 });
            auth.signOut();
            setIsLoggingIn(false);
            return;
        }
        
        await clearSuccessfulLogin(userProfile.email);

        await addLogEntry('user_login', `${userProfile.name} (${userProfile.email}) logged in.`, { userId: userProfile.id, email: userProfile.email });
        
        localStorage.setItem('loggedInUser', JSON.stringify(userProfile));
        
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
        
        toast({ title: "Login Successful", description: `Welcome back, ${userProfile.name}. Redirecting...` });
        
        if (userProfile.role === 'Admin' || userProfile.role === 'Editor') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error("User authenticated but profile not found in database.");
      }
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/invalid-credential') {
        await handleFailedLoginAttempt();
        setIsLoggingIn(false);
        return; 
      } else if (error.code === 'auth/too-many-requests') {
        description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
      } else if (error.message === "User authenticated but profile not found in database.") {
        const projectId = db.app.options.projectId;
        description = `Login successful, but your user profile was not found. Please verify your config. Project: ${projectId || 'Not Found'}. User UID: ${authUser?.uid}`;
      } else if (error.code === 'auth/quota-exceeded') {
        description = "The daily quota for sending email links has been exceeded. Please try again tomorrow, or log in with your password.";
      }
      
      toast({ title: "Login Failed", description: description, variant: "destructive", duration: 9000 });
    } finally {
      setIsLoggingIn(false);
    }
  }

  const handleSendLoginLink = async () => {
    setIsSendingLink(true);
    setUnauthorizedDomainError(null);
    const actionCodeSettings = {
        url: `${window.location.origin}/finish-dream`,
        handleCodeInApp: true,
    };
    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        toast({
            title: 'Login Link Sent',
            description: `A login link has been sent to ${email}. Please check your inbox.`,
        });
        setLockoutInfo(null);
        setLockoutExpired(false);
        setLoginStep('email');
    } catch (error: any) {
        console.error(error);
        let description = 'Could not send login link. Please try again.';

        if (error.code === 'auth/unauthorized-continue-uri' || (error.message && error.message.includes('unauthorized-continue-uri'))) {
            setUnauthorizedDomainError(window.location.origin);
            setLockoutInfo({ until: 0, message: "The domain for the login link is not authorized in your Firebase project." });
            setLoginStep('locked');
            return;
        } else if (error.code === 'auth/operation-not-allowed') {
            description = 'Email link sign-in is not enabled in your Firebase project. Please enable it in the Authentication settings of your Firebase console.';
        } else if (error.code === 'auth/quota-exceeded') {
            description = "The daily quota for sending email links has been exceeded. Please try again tomorrow, or log in with your password.";
        }
        
        toast({ title: 'Error Sending Link', description, variant: 'destructive', duration: 9000 });
    } finally {
        setIsSendingLink(false);
    }
  };

  const handleSendSignupLink = async () => {
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address to sign up.", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
        return;
    }

    setIsSendingSignupLink(true);
    setUnauthorizedDomainError(null);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        toast({
          title: "Email Already Registered",
          description: "This email is already in use. Please try logging in instead.",
          variant: "destructive",
        });
        setIsSendingSignupLink(false);
        return;
      }
      
      const actionCodeSettings = {
        url: `${window.location.origin}/create-account`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      toast({
        title: "Setup Link Sent!",
        description: `A link to create your account has been sent to ${email}. Please check your inbox and spam folder.`,
      });
      setLoginStep('email');
    } catch (error: any) {
      console.error("Signup error:", error);
      let description = "Could not send setup link. Please try again.";

      if (error.code === 'auth/unauthorized-continue-uri' || (error.message && error.message.includes('unauthorized-continue-uri'))) {
          setUnauthorizedDomainError(window.location.origin);
          setLockoutInfo({ until: 0, message: "The domain for the sign-up link is not authorized in your Firebase project." });
          setLoginStep('locked');
          return;
      }
      toast({ title: "Error", description: description, variant: "destructive"});
    } finally {
      setIsSendingSignupLink(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginStep === 'email') {
      await handleEmailStep();
    } else if (loginStep === 'password') {
      await handlePasswordStep();
    } else if (loginStep === 'signup') {
      await handleSendSignupLink();
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  const LockoutView = () => (
    <Card className="bg-background/80 backdrop-blur-sm border-destructive/50 text-foreground">
      <CardHeader className="items-center text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <CardTitle className="text-2xl text-destructive">
            {unauthorizedDomainError ? 'Domain Not Authorized' : 'Login Locked'}
        </CardTitle>
        <CardDescription>
          {unauthorizedDomainError ?
            "This app's domain must be authorized in Firebase." :
            lockoutInfo?.message
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {unauthorizedDomainError ? (
             <Alert variant="destructive" className="text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>
                    <p className="mb-2">To use email link sign-in, you must add this domain to your Firebase project's authorized domains list:</p>
                    <code className="mt-2 mb-2 block bg-muted p-2 rounded-md text-sm font-mono break-all">{unauthorizedDomainError}</code>
                    <p className="mb-4 text-xs">Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains to add it.</p>
                    <Button onClick={() => { setUnauthorizedDomainError(null); handleSendLoginLink(); }} className="w-full" disabled={isSendingLink}>
                        {isSendingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        I've added the domain, try again
                    </Button>
                </AlertDescription>
            </Alert>
        ) : lockoutExpired ? (
            <div className="space-y-4">
                <p className="font-semibold text-lg">You can now try again</p>
                <div className="flex flex-col gap-2">
                    <Button onClick={() => {
                        setLoginStep('password');
                        setLockoutInfo(null);
                        setLockoutExpired(false);
                    }}>
                        Try Again with Password
                    </Button>
                    <Button variant="secondary" onClick={handleSendLoginLink} disabled={isSendingLink}>
                        {isSendingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                        Send Login Link
                    </Button>
                </div>
            </div>
        ) : (
            <>
                <p className="text-sm text-muted-foreground">Time remaining:</p>
                <p className="text-4xl font-mono font-bold tracking-widest">{timeLeft}</p>
            </>
        )}
      </CardContent>
    </Card>
  );

  const cardTitles = {
    email: 'Login',
    password: 'Enter Password',
    signup: 'Create an Account',
    locked: 'Login Locked',
  };

  const cardDescriptions = {
    email: 'Enter your email to continue',
    password: `Signing in as ${email}`,
    signup: 'Enter your email to receive a setup link.',
    locked: '',
  };

  return (
    <div
      className="flex min-h-svh items-center justify-center p-4 bg-background transition-all duration-1000"
      style={{
        backgroundImage: `url(${backgroundDetails?.url || ''})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60 z-0" />
      
      <div className="relative z-10 w-full">
        <div className="text-center mb-6">
            <Link href="/" className="font-headline text-5xl font-extrabold tracking-tighter text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                Figerout
            </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-sm">
            {loginStep === 'locked' ? <LockoutView /> : (
                <Card className="bg-background/80 backdrop-blur-sm border-white/10 text-foreground">
                    <CardHeader className="items-center text-center pb-4">
                        <CardTitle className="text-2xl">{cardTitles[loginStep]}</CardTitle>
                        <CardDescription>
                            {cardDescriptions[loginStep]}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <form onSubmit={handleSubmit} className="grid gap-4">
                        {loginStep === 'password' ? (
                          <>
                            <div className="grid gap-1">
                              <Label htmlFor="email-display">Email</Label>
                              <div className="flex items-center justify-between rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                                <span className="truncate">{email}</span>
                                <Button variant="link" size="sm" type="button" className="h-auto p-0 text-primary" onClick={() => {
                                  setLoginStep('email');
                                  setPassword('');
                                }}>
                                  Change
                                </Button>
                              </div>
                            </div>
                            <div className="grid gap-1">
                              <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                  href="/forgot-password"
                                  className="ml-auto inline-block text-sm underline"
                                >
                                  Forgot your password?
                                </Link>
                              </div>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  required
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="bg-background/50 border-white/20 focus:bg-background/70 pr-10"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                                  aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="grid gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="m@example.com"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-background/50 border-white/20 focus:bg-background/70"
                              autoFocus
                            />
                          </div>
                        )}
                        
                        {loginStep === 'email' && (
                           <Button type="submit" className="w-full" disabled={isCheckingEmail}>
                             {isCheckingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Continue
                           </Button>
                        )}
                        {loginStep === 'signup' && (
                          <Button type="submit" className="w-full" disabled={isSendingSignupLink}>
                            {isSendingSignupLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Setup Link
                          </Button>
                        )}
                        {loginStep === 'password' && (
                          <>
                            <Button type="submit" className="w-full" disabled={isLoggingIn}>
                              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Login
                            </Button>
                            <div className="relative my-0">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/20" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background/80 px-2 text-muted-foreground backdrop-blur-sm">
                                  Or
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" type="button" onClick={handleSendLoginLink} disabled={isSendingLink} className="bg-background/50 border-white/20 hover:bg-background/70">
                              {isSendingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                              Login with email link
                            </Button>
                          </>
                        )}
                      </form>
                    </CardContent>
                    <CardFooter className="flex-col items-center gap-2 pt-4 border-t border-white/10">
                        {loginStep !== 'password' && (
                            <Button variant="ghost" className="w-full text-sm" asChild>
                                <Link href="/">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Link>
                            </Button>
                        )}
                        {loginStep === 'email' && (
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Button variant="link" type="button" className="underline p-0 h-auto text-primary text-sm" onClick={() => setLoginStep('signup')}>Sign up</Button>
                            </div>
                        )}
                        {loginStep === 'signup' && (
                             <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Button variant="link" type="button" className="underline p-0 h-auto text-primary text-sm" onClick={() => setLoginStep('email')}>Login</Button>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            )}
          </div>
        )}
      </div>
      {backgroundDetails && !isLoading && (
        <>
            <div className="absolute bottom-2 left-2 z-20">
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap rounded-lg bg-black/50 p-1.5 text-xs text-white/80 backdrop-blur-sm">
                    <span>&copy; {new Date().getFullYear()} Figerout</span>
                    <div className="hidden items-center gap-x-3 border-l border-white/20 pl-3 sm:flex">
                        <Link href="/about" className="hover:text-white">About</Link>
                        <Link href="/blog" className="hover:text-white">Blog</Link>
                        <Link href="/contact" className="hover:text-white">Contact</Link>
                        <Link href="/privacy" className="hover:text-white">Privacy</Link>
                        <Link href="/terms" className="hover:text-white">Terms</Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-2 right-2 z-20">
                <a
                href={backgroundDetails.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-black/50 p-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:text-white"
                >
                <User className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">Photo by {backgroundDetails.photographer}</span>
                </a>
            </div>
        </>
      )}
    </div>
  )
}

    