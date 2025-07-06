"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getColorName } from '@/lib/color-utils';
import { useToast } from '@/hooks/use-toast';

interface SharedColorPageProps {
  color: string;
}

const SharedColorPage = ({ color }: SharedColorPageProps) => {
  const { toast } = useToast();
  const colorName = getColorName(color);

  const handleCopy = () => {
    const textToCopy = color.toUpperCase();
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: 'Color Copied!',
        description: `${colorName} (${color.toUpperCase()}) copied to clipboard.`,
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
      });
    });
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-svh w-full bg-background p-4"
    >
      <div className="w-full max-w-sm">
        <div className="relative bg-zinc-800 rounded-3xl shadow-2xl text-white p-8 flex flex-col items-center text-center">
          
          <div className="w-28 h-28 rounded-full mb-6 shadow-lg" style={{ backgroundColor: color }} />
          
          <h1 className="text-4xl font-bold tracking-tight">{colorName}</h1>

          <div
            onClick={handleCopy}
            className="cursor-pointer mt-2 inline-flex items-center justify-center rounded-full bg-zinc-700 px-4 py-2 text-sm font-mono text-white/80"
          >
            {color.toUpperCase()}
          </div>
          
          <div className="w-full h-px bg-white/20 my-8" />
          
          <Button asChild size="lg" className="w-full rounded-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
            <Link href="/">
              Find Your Perfect Color
            </Link>
          </Button>

        </div>
      </div>
      <footer className="text-center text-xs text-muted-foreground mt-6 space-y-2">
        <div className="flex justify-center items-center gap-x-4 gap-y-1 flex-wrap">
          <Link href="/about" className="hover:text-foreground">About</Link>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Figerout</p>
      </footer>
    </div>
  );
};

export default SharedColorPage;
