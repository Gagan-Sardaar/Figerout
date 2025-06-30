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
    const url = `${window.location.origin}/?color=${color.substring(1)}`;
    const textToCopy = `${colorName}, ${color.toUpperCase()}\n${url}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      toast({
        title: 'Color copied!',
        description: `${colorName} (${color.toUpperCase()}) is ready to share.`,
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
      className="relative flex flex-col items-center justify-between min-h-svh w-full text-white p-8 overflow-hidden"
      style={{ backgroundColor: color }}
    >
      {/* Bottom left logo */}
      <div className="absolute bottom-4 left-4 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 text-white font-bold text-sm backdrop-blur-sm">
        N
      </div>

      {/* Header */}
      <header>
        <h2 className="text-4xl font-headline font-bold text-white/90">Figerout</h2>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center -mt-16">
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border border-white/50"></div>
          <div className="absolute w-2/3 h-2/3 rounded-full border border-white/50"></div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">{colorName}</h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-base font-mono backdrop-blur-sm">
          {color.toUpperCase()}
          <button onClick={handleCopy} className="text-white/70 hover:text-white transition-colors">
            {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span className="sr-only">Copy hex code</span>
          </button>
        </div>
      </main>

      {/* Footer Button */}
      <footer>
        <Button asChild size="lg" className="rounded-full h-12 px-8 font-semibold bg-yellow-400 text-black hover:bg-yellow-500 transition-colors shadow-lg">
          <Link href="/">
            Find Your Perfect Color
          </Link>
        </Button>
      </footer>
    </div>
  );
};

export default SharedColorPage;
