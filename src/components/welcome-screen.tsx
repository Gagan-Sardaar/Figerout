"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BadgeCheck, Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName } from '@/lib/color-utils';

type Callout = {
  name: string;
  hex: string;
  position: { top: string; left: string };
};

type Slide = {
  id: number;
  src: string;
  photographer: string;
  photographerUrl: string;
  callouts: Callout[];
  hint: string;
};

const slidesData: Slide[] = [
    { id: 1, src: "https://placehold.co/1080x1920", photographer: "Jane Doe", photographerUrl: "#", hint: "fashion model", callouts: [{ name: "Crimson", hex: "#DC143C", position: { top: "30%", left: "60%" } }] },
    { id: 2, src: "https://placehold.co/1080x1920", photographer: "John Smith", photographerUrl: "#", hint: "street style", callouts: [{ name: "Royal Blue", hex: "#4169E1", position: { top: "50%", left: "25%" } }] },
    { id: 3, src: "https://placehold.co/1080x1920", photographer: "Emily White", photographerUrl: "#", hint: "haute couture", callouts: [{ name: "Emerald Green", hex: "#50C878", position: { top: "65%", left: "70%" } }, { name: "Gold", hex: "#FFD700", position: { top: "20%", left: "15%" } }] },
];

const WelcomeScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const totalSlides = slidesData.length;
    let loadedCount = 0;

    slidesData.forEach((slide) => {
        const img = new window.Image();
        img.src = slide.src;
        img.onload = () => {
            loadedCount++;
            setLoadingProgress((loadedCount / totalSlides) * 100);
            if (loadedCount === totalSlides) {
                setTimeout(() => setIsLoaded(true), 500);
            }
        };
    });

    if (totalSlides === 0) {
        setIsLoaded(true);
        setLoadingProgress(100);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isLoaded]);

  const activeSlide = useMemo(() => slidesData[currentSlide], [currentSlide]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {slidesData.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.src}
          alt={`Background slide ${slide.id}`}
          layout="fill"
          objectFit="cover"
          className={cn(
            "transition-opacity duration-1000 ease-in-out",
            currentSlide === index ? "opacity-100" : "opacity-0"
          )}
          priority={index === 0}
          data-ai-hint={slide.hint}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      
      {!isLoaded && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-1/2">
            <Progress value={loadingProgress} className="w-full" />
            <p className="text-center text-white/80 text-sm mt-2">Loading inspiration...</p>
          </div>
      )}

      {isLoaded && (
        <>
          <div className="absolute top-4 right-4 z-20">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                  <Info className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto text-sm">
                Photo by <a href={activeSlide.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline">{activeSlide.photographer}</a>
              </PopoverContent>
            </Popover>
          </div>

          <div className="absolute inset-0 flex flex-col justify-end items-center p-8 z-10 text-white text-center">
            <div className="max-w-md">
              <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-shadow-lg">ColorSnap Studio</h1>
              <p className="mt-4 text-lg md:text-xl text-white/90">Discover the hidden colors in your world.</p>
            </div>
            
            <Link href="/camera" passHref legacyBehavior>
              <Button size="lg" className="mt-8 rounded-full h-14 px-10 text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-300">
                Find Your Color
              </Button>
            </Link>

            <div className="mt-6 flex items-center space-x-4 text-sm text-white/70">
              <div className="flex items-center space-x-1.5">
                <BadgeCheck className="w-4 h-4" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          
          {activeSlide.callouts.map((callout, index) => (
            <div key={index} className="absolute transition-opacity duration-1000 ease-in-out" style={callout.position}>
                 <div className="relative group">
                    <div className="absolute w-4 h-4 rounded-full transition-all duration-300 group-hover:w-28 group-hover:h-28" style={{ background: callout.hex, boxShadow: `0 0 20px ${callout.hex}` }}></div>
                    <div className="relative flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/50 group-hover:w-28 group-hover:h-28 group-hover:border-white/80 transition-all duration-300" style={{ background: callout.hex }}>
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white font-bold text-shadow-md">
                           <div className="text-lg">{getColorName(callout.hex)}</div>
                           <div className="text-sm font-code">{callout.hex}</div>
                       </div>
                    </div>
                </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default WelcomeScreen;
