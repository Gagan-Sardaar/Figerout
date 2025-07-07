
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { searchPexelsImage } from "@/app/actions";
import { Loader2, User, Eye, EyeOff } from "lucide-react";
import { saveColor } from "@/services/color-service";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { getUser } from "@/services/user-service";


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [backgroundDetails, setBackgroundDetails] = useState<{ url: string; photographer: string; photographerUrl: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Email and password required",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    let authUser: FirebaseUser | null = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      authUser = userCredential.user;
      
      if (!authUser) {
        throw new Error("Authentication failed, user not found.");
      }

      console.log('Successfully authenticated. Looking for profile with UID:', authUser.uid);
      const userProfile = await getUser(authUser.uid);

      if (userProfile) {
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
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userProfile.name}. Redirecting...`,
        });
        
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
      const projectId = db.app.options.projectId;

      if (error.message === "User authenticated but profile not found in database.") {
        description = `Login successful, but your user profile was not found in the Firestore database.

Please verify your configuration:

1.  **Firestore Data:** A user document must exist in the \`users\` collection with the ID:
    **${authUser?.uid}**

2.  **Project Config:** Your app is configured to use the Firebase Project ID:
    **${projectId || 'Not Found'}**

Please ensure this Project ID matches the one you are viewing in the Firebase Console.`;
      } else {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'invalid-credential':
              description = "Invalid email or password. Please try again.";
              break;
            case 'auth/too-many-requests':
              description = "Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
              break;
            default:
              description = error.message;
              break;
        }
      }
      
      toast({
        title: "Login Failed",
        description: description,
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsLoggingIn(false);
    }
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
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        ) : (
          <AlertDialog>
            <Card className="mx-auto w-full max-w-sm bg-background/80 backdrop-blur-sm border-white/10 text-foreground">
                <CardHeader className="items-center text-center">
                    <Link href="/" className="font-headline text-3xl font-bold tracking-tight text-foreground mb-2">
                        Figerout
                    </Link>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-background/50 border-white/20 focus:bg-background/70"
                      />
                    </div>

                    <div className="grid gap-2">
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
                          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                          className="bg-background/50 border-white/20 focus:bg-background/70 pr-10"
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
                    <Button type="button" className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
                      {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <AlertDialogTrigger asChild>
                        <Button variant="link" className="underline p-0 h-auto text-primary">Sign up</Button>
                    </AlertDialogTrigger>
                </div>
                </CardContent>
            </Card>

            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Registration Coming Soon!</AlertDialogTitle>
                <AlertDialogDescription>
                    We're currently in an invite-only phase. Public sign-ups will be available soon. Please check back later!
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogAction>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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

    