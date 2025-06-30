"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getColorName } from '@/lib/color-utils';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

interface SharedColorPageProps {
  color: string;
}

const SharedColorPage = ({ color }: SharedColorPageProps) => {
  const { toast } = useToast();
  const colorName = getColorName(color);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = color.toUpperCase();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({
        title: 'Color Copied!',
        description: `${colorName} (${color.toUpperCase()}) copied to clipboard.`,
      });
      setTimeout(() => setIsCopied(false), 2000);
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
        <div className="relative bg-neutral-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl text-white p-8 flex flex-col items-center text-center border border-white/10">
          
          <div className="w-28 h-28 rounded-full mb-6 shadow-lg" style={{ backgroundColor: color }} />
          
          <h1 className="text-4xl font-bold tracking-tight">{colorName}</h1>

          <button 
            onClick={handleCopy} 
            className="mt-2 inline-flex items-center gap-3 rounded-full bg-black/30 px-4 py-2 text-lg font-mono backdrop-blur-sm text-white/80 hover:text-white transition-colors"
          >
            {color.toUpperCase()}
            {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>
          
          <div className="w-full h-px bg-white/10 my-8" />
          
          <p className="text-sm text-white/70 mb-4">Ready to find your own color?</p>
          
          <Button asChild size="lg" className="w-full rounded-full h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
            <Link href="/">
              Find Your Perfect Color
            </Link>
          </Button>

        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-6">&copy; {new Date().getFullYear()} Figerout</p>
    </div>
  );
};

export default SharedColorPage;
