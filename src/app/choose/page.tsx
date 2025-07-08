
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

  const resizeImage = (dataUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_DIMENSION = 1280;
              let { width, height } = img;
              const aspectRatio = width / height;

              if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                  if (aspectRatio > 1) { // Landscape
                      width = MAX_DIMENSION;
                      height = MAX_DIMENSION / aspectRatio;
                  } else { // Portrait
                      height = MAX_DIMENSION;
                      width = MAX_DIMENSION * aspectRatio;
                  }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  return reject(new Error('Could not get canvas context'));
              }
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG for compression
          };
          img.onerror = reject;
          img.src = dataUrl;
      });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      reader.onloadend = async () => {
        try {
            const dataUrl = reader.result as string;
            const resizedDataUrl = await resizeImage(dataUrl);
            sessionStorage.setItem('capturedImage', resizedDataUrl);
            router.push('/picker');
        } catch(error) {
            console.error(error);
            toast({
                title: 'Error processing image',
                description: 'The image could not be loaded or resized.',
                variant: 'destructive',
            });
        }
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
        <div className="w-full max-w-2xl text-center">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                    <CardTitle className="text-xl sm:text-3xl font-bold tracking-tight">How would you like to find a color?</CardTitle>
                    <CardDescription className="text-xs sm:text-base text-muted-foreground pt-2 max-w-2xl mx-auto">
                        <span className="sm:hidden">
                            Capture a new moment or<br />explore colors from an existing photo.
                        </span>
                        <span className="hidden sm:inline">
                            Capture a new moment or explore colors from an existing photo.
                        </span>
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
                    <p>
                        <span className="sm:hidden">
                            We only see the colours<br />your image isn’t stored anywhere.
                        </span>
                        <span className="hidden sm:inline">
                            We only see the colours — your image isn’t stored anywhere.
                        </span>
                    </p>
                </div>
            </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
