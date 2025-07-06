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
    <div className="flex flex-col min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="font-headline text-2xl font-bold tracking-tight text-foreground">
            Figerout
        </Link>
      </div>
      <main className="w-full max-w-2xl text-center">
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">How would you like to find a color?</CardTitle>
                <CardDescription className="text-md sm:text-lg text-muted-foreground pt-2 max-w-lg mx-auto">
                    Capture a new moment or explore colors from an existing photo.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-8">
                 <div 
                    onClick={() => router.push('/camera')}
                    className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5"
                 >
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4 transition-transform duration-300 group-hover:scale-110">
                        <Camera className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Live Capture</h3>
                    <p className="text-muted-foreground mt-2 text-center">Use your camera to find colors in real-time.</p>
                 </div>

                 <div 
                    onClick={handleUploadClick}
                    className="group relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5"
                 >
                     <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4 transition-transform duration-300 group-hover:scale-110">
                        <ImageIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Upload Image</h3>
                    <p className="text-muted-foreground mt-2 text-center">Pick colors from a photo in your library.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                 </div>
            </CardContent>
            <div className="text-center text-sm text-muted-foreground pt-8">
                <p>We only see the colours — your image isn’t stored anywhere.</p>
            </div>
        </Card>
      </main>
      <div className="absolute bottom-0 w-full">
         <AppFooter />
      </div>
    </div>
  );
}
