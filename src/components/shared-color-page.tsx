"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getColorName, isColorLight } from '@/lib/color-utils';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppFooter } from './footer';

interface SharedColorPageProps {
  color: string;
}

const SharedColorPage = ({ color }: SharedColorPageProps) => {
  const { toast } = useToast();
  const colorName = getColorName(color);
  const isPickedColorLight = isColorLight(color);

  const handleCopy = useCallback(() => {
    const textToCopy = color.toUpperCase();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Hex Code Copied!',
        description: `${textToCopy} has been copied to your clipboard.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
      });
    });
  }, [color, toast]);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-svh w-full p-4"
      style={{
        backgroundColor: '#09090b',
      }}
    >
        <div
            className="bg-zinc-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in-95"
          >
            <div className="relative h-48 w-full" style={{ backgroundColor: color }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <p className={cn("font-mono text-4xl font-bold tracking-widest", isPickedColorLight ? "text-zinc-900" : "text-white")} style={{ textShadow: isPickedColorLight ? '0 1px 1px rgba(255,255,255,0.7)' : '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {color.toUpperCase()}
                </p>
                <p className={cn("text-lg uppercase", isPickedColorLight ? "text-zinc-900/80" : "text-white/80")} style={{ textShadow: isPickedColorLight ? '0 1px 1px rgba(255,255,255,0.7)' : '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {colorName}
                </p>
              </div>
            </div>
            <div className="p-8 text-center bg-zinc-800 text-white">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-white">Figerout</h2>
              <div className="mt-8 flex flex-col gap-3">
                 <Button onClick={handleCopy} size="lg" className="w-full rounded-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
                      <Copy className="mr-2 h-5 w-5" />
                      Copy Color
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full rounded-full h-12 font-semibold border-white/30 text-white/80 hover:bg-white/10 hover:text-white">
                      <Link href="/choose">
                        Find Your Color
                      </Link>
                  </Button>
              </div>
            </div>
        </div>
        <div className="pt-8">
            <AppFooter />
        </div>
    </div>
  );
};

export default SharedColorPage;
