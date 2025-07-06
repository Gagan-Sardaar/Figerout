
"use client";

import { useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';
import Link from 'next/link';
import { AppFooter } from '@/components/footer';

export default function ChoosePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        sessionStorage.setItem('capturedImage', dataUrl);
        router.push('/picker');
      };
      reader.onerror = () => {
        toast({
            title: 'Error reading file',
            description: 'Something went wrong while trying to load your image.',
            variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col min-h-svh bg-muted/40">
       <header className="bg-background border-b p-6 text-center sm:text-left">
        <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-foreground">
          Figerout
        </Link>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-xl text-center">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">How would you like to find a color?</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-muted-foreground pt-2 max-w-xl mx-auto">
                        Capture a new moment or explore colors from an existing photo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                    <div 
                        onClick={() => router.push('/camera')}
                        className="group relative flex items-center justify-start p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 shrink-0">
                            <Camera className="w-6 h-6" />
                        </div>
                        <div className="ml-4 text-left">
                            <h3 className="text-lg font-semibold text-foreground">Live Capture</h3>
                            <p className="text-sm text-muted-foreground">Use your camera to find colors.</p>
                        </div>
                    </div>

                    <div 
                        onClick={handleUploadClick}
                        className="group relative flex items-center justify-start p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5"
                    >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 shrink-0">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div className="ml-4 text-left">
                            <h3 className="text-lg font-semibold text-foreground">Upload Image</h3>
                            <p className="text-sm text-muted-foreground">Pick from your photo library.</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                </CardContent>
                <div className="text-center text-sm text-muted-foreground pt-6">
                    <p>We only see the colours — your image isn’t stored anywhere.</p>
                </div>
            </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
