"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName } from '@/lib/color-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPexelsImages } from '@/app/actions';
import { BadgeCheck, ShieldCheck } from 'lucide-react';


type Position = {
  top: string;
  left: string;
};

type Callout = {
  name: string;
  hex: string;
  position: Position;
  mobilePosition?: Position;
};

type SlideConfig = {
    id: number;
    callouts: Callout[];
}

type Slide = {
  id: number;
  src: string;
  photographer: string;
  photographerUrl: string;
  callouts: Callout[];
  hint: string;
};

const slidesConfig: SlideConfig[] = [
    { 
        id: 32648254, 
        callouts: [
            { name: "", hex: "#f2bfc8", position: { top: "55%", left: "55%" } }
        ] 
    },
    { 
        id: 6988665, 
        callouts: [
            { name: "", hex: "#c3c7a6", position: { top: "60%", left: "45%" } }
        ] 
    },
    { 
        id: 8367798,
        callouts: [
            { name: "", hex: "#6a1910", position: { top: "60%", left: "50%" } }
        ] 
    },
    { 
        id: 3755021, 
        callouts: [
            { name: "", hex: "#37251b", position: { top: "55%", left: "40%" }, mobilePosition: { top: "50%", left: "40%" } },
            { name: "", hex: "#c3b9b3", position: { top: "65%", left: "55%" }, mobilePosition: { top: "62%", left: "56%" } }
        ] 
    },
    { 
        id: 6686434, 
        callouts: [
            { name: "", hex: "#80a6cb", position: { top: "65%", left: "60%" }, mobilePosition: { top: "60%", left: "60%" } }
        ] 
    },
    { 
        id: 7680203,
        callouts: [
            { name: "", hex: "#e9cfd3", position: { top: "60%", left: "50%" } }
        ] 
    },
    { 
        id: 8317652,
        callouts: [
            { name: "", hex: "#a794bb", position: { top: "60%", left: "45%" } }
        ] 
    },
    { 
        id: 720815,
        callouts: [
            { name: "", hex: "#eed137", position: { top: "65%", left: "55%" }, mobilePosition: { top: "60%", left: "55%" } }
        ] 
    },
    { 
        id: 4668556,
        callouts: [
            { name: "", hex: "#596e73", position: { top: "60%", left: "55%" } }
        ] 
    },
];

const WelcomeScreen = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchSlides = async () => {
        const ids = slidesConfig.map(s => s.id);
        const pexelsData = await getPexelsImages(ids);
        
        const populatedSlides = slidesConfig.map(config => {
            const imageData = pexelsData[config.id];
            if (!imageData) return null;
            return {
                ...config,
                ...imageData,
                callouts: config.callouts.map(c => ({...c, name: getColorName(c.hex)}))
            };
        }).filter((slide): slide is Slide => slide !== null);

        setSlides(populatedSlides);
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    let loadedCount = 0;
    slides.forEach((slide) => {
        const img = new window.Image();
        img.src = slide.src;
        img.onload = () => {
            loadedCount++;
            setLoadingProgress((loadedCount / slides.length) * 100);
            if (loadedCount === slides.length) {
                setTimeout(() => setIsLoaded(true), 500);
            }
        };
    });
  }, [slides]);

  useEffect(() => {
    if (!isLoaded || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isLoaded, slides.length]);

  const activeSlide = useMemo(() => slides[currentSlide], [currentSlide, slides]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {slides.length > 0 && slides.map((slide, index) => (
        <Image
          key={slide.id}
          src={slide.src}
          alt={slide.hint || `Background slide ${slide.id}`}
          fill
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
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

      {isLoaded && activeSlide && (
        <>
          {/* Top Center Content */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-10 w-full px-4 text-white text-center">
            <div className="max-w-md mx-auto">
              <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter">Figerout</h1>
              <p className="mt-4 text-lg md:text-xl text-white/90">Discover the hidden colors in your world.</p>
            </div>
          </div>

          {/* Bottom Center Content */}
          <div className="absolute bottom-0 inset-x-0 pb-8 z-10 flex flex-col items-center text-white text-center">
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-10 text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-300"
            >
              <Link href="/camera">
                Find Your Color
              </Link>
            </Button>
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
            <div 
              key={index} 
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ease-in-out" 
              style={isMobile && callout.mobilePosition ? callout.mobilePosition : callout.position}
            >
                <div className="flex items-center gap-3 rounded-full bg-black/70 py-2 pl-2 pr-4 text-white shadow-lg backdrop-blur-md">
                  {/* Color Swatch */}
                  <div 
                    className="relative h-10 w-10 shrink-0"
                    style={{ color: callout.hex }}
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-current opacity-70"></div>
                    <div className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"></div>
                  </div>
                  {/* Text */}
                  <div>
                    <p className="font-bold font-code text-base tracking-wide text-white">{callout.hex.toUpperCase()}</p>
                    <p className="text-sm uppercase text-white/80">{callout.name}</p>
                  </div>
              </div>
            </div>
          ))}
          
          {/* Photographer Credit */}
          <div className="absolute bottom-4 left-4 z-20 text-xs text-white/80">
            <a
              href={activeSlide.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1.5 rounded-lg bg-black/40 p-2 backdrop-blur-sm transition-colors"
            >
              <span>Photo by {activeSlide.photographer}</span>
              <UserCircle className="h-4 w-4" />
            </a>
          </div>

          {/* Copyright & Legal Links */}
          <div className="absolute bottom-4 right-4 z-20">
            <div
              className="relative"
              onMouseEnter={() => setIsFooterExpanded(true)}
              onMouseLeave={() => setIsFooterExpanded(false)}
            >
              <div className="rounded-lg bg-black/40 p-3 text-xs text-white/80 backdrop-blur-sm">
                <p className="cursor-default text-right">
                  &copy; {new Date().getFullYear()} Figerout
                </p>
                <div
                  className={cn(
                    'grid grid-rows-[0fr] transition-[grid-template-rows,padding-top,margin-top] duration-300 ease-in-out',
                    isFooterExpanded && 'grid-rows-[1fr] pt-2 mt-2'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col items-end gap-2 border-t border-white/20 pt-2">
                      <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
                      <Link href="/terms" className="hover:text-white">Terms of Service</Link>
                      <p className="text-white/60">All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WelcomeScreen;
