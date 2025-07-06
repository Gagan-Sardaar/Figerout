
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { users } from "@/lib/user-data";
import { searchPexelsImage } from "@/app/actions";
import { Loader2 } from "lucide-react";


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.301-11.284-7.914l-6.573,4.817C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.545,44,29.836,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndSetBackground = async () => {
      const storedBg = localStorage.getItem('loginBackground');
      const now = new Date().getTime();

      if (storedBg) {
        try {
          const { url, expiry } = JSON.parse(storedBg);
          if (now < expiry) {
            setBackgroundImage(url);
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
        const newUrl = imageResult.dataUri;
        const newExpiry = now + 24 * 60 * 60 * 1000; // 24 hours
        localStorage.setItem('loginBackground', JSON.stringify({ url: newUrl, expiry: newExpiry }));
        setBackgroundImage(newUrl);
      }
      setIsLoading(false);
    };

    fetchAndSetBackground();
  }, []);

  const handleLoginLink = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to receive a login link.",
        variant: "destructive",
      });
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      
      toast({
        title: "Check your email",
        description: `A login link has been sent to ${email}.`,
      });
      
      if (user.role === 'Admin' || user.role === 'Editor') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } else {
      toast({
        title: "User not found",
        description: "This email is not registered. Please sign up or contact an admin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="flex min-h-svh items-center justify-center p-4 bg-background transition-all duration-1000"
      style={{
        backgroundImage: `url(${backgroundImage})`,
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
                <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Choose your preferred login method
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid gap-4">
                    <Button variant="outline" className="w-full">
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Login with Google
                    </Button>
                    <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background/0 px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                    </div>
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
                    <Button type="button" className="w-full" onClick={handleLoginLink}>
                        Email me a login link
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
    </div>
  )
}
