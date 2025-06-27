"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getColorName } from '@/lib/color-utils';

interface SharedColorPageProps {
  color: string;
}

const SharedColorPage = ({ color }: SharedColorPageProps) => {
  const colorName = getColorName(color);

  const containerStyle: React.CSSProperties = {
    '--glow-color': color,
  } as React.CSSProperties;

  const orbStyle: React.CSSProperties = {
    background: `radial-gradient(circle at 30% 30%, ${color}, #000)`,
    boxShadow: `0 0 80px -20px ${color}, inset 0 0 40px rgba(255, 255, 255, 0.2), 0 0 20px rgba(0,0,0,0.5)`,
  };

  return (
    <div
      style={containerStyle}
      className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden"
    >
      <div className="absolute inset-0 z-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--glow-color)_0%,_transparent_50%)] opacity-30" />
      <div className="z-10 text-center">
        <h2 className="text-2xl font-headline font-bold text-muted-foreground mb-4">Figerout</h2>
        <div style={orbStyle} className="relative w-64 h-64 md:w-80 md:h-80 rounded-full mb-8 transition-all duration-500 transform hover:scale-105" />
        <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter">{colorName}</h1>
        <p className="mt-2 text-2xl font-code text-muted-foreground">{color}</p>
        <Button asChild size="lg" className="mt-12 rounded-full h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:scale-105 transition-transform duration-300">
          <Link href="/">
            Find Your Perfect Color
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SharedColorPage;
