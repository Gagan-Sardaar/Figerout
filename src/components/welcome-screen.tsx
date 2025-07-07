
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BadgeCheck, ShieldCheck, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getColorName } from '@/lib/color-utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { CookieBanner } from '@/components/cookie-banner';


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

type Slide = {
  src: string;
  callouts: Callout[];
  hint: string;
};

const slidesConfig: Omit<Slide, 'callouts'> & { callouts: Omit<Callout, 'name'>[] }[] = [
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'woman mirror',
        callouts: [
            { hex: "#f2bfc8", position: { top: "55%", left: "55%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'green leaves',
        callouts: [
            { hex: "#c3c7a6", position: { top: "60%", left: "45%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'red car',
        callouts: [
            { hex: "#6a1910", position: { top: "60%", left: "50%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'concrete building',
        callouts: [
            { hex: "#37251b", position: { top: "55%", left: "40%" }, mobilePosition: { top: "50%", left: "40%" } },
            { hex: "#c3b9b3", position: { top: "65%", left: "55%" }, mobilePosition: { top: "62%", left: "56%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'modern building',
        callouts: [
            { hex: "#80a6cb", position: { top: "65%", left: "60%" }, mobilePosition: { top: "60%", left: "60%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'pink flowers',
        callouts: [
            { hex: "#e9cfd3", position: { top: "60%", left: "50%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'woman coat',
        callouts: [
            { hex: "#a794bb", position: { top: "60%", left: "45%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'yellow flowers',
        callouts: [
            { hex: "#eed137", position: { top: "65%", left: "55%" }, mobilePosition: { top: "60%", left: "55%" } }
        ] 
    },
    { 
        src: 'https://placehold.co/1920x1080.png',
        hint: 'glass building',
        callouts: [
            { hex: "#596e73", position: { top: "60%", left: "55%" } }
        ] 
    },
];

const slides: Slide[] = slidesConfig.map(config => ({
    ...config,
    callouts: config.callouts.map(c => ({...c, name: getColorName(c.hex)}))
}));

const WelcomeScreen = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  const footerLinks = [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (footerRef.current && !footerRef.current.contains(event.target as Node)) {
        setIsFooterExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [footerRef]);

  useEffect(() => {
    if (slides.length === 0) {
      setIsLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalSlides = slides.length;

    const handleLoadOrError = () => {
      loadedCount++;
      setLoadingProgress((loadedCount / totalSlides) * 100);
      if (loadedCount === totalSlides) {
        setTimeout(() => setIsLoaded(true), 500);
      }
    };

    slides.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.src;
      img.onload = handleLoadOrError;
      img.onerror = () => {
        handleLoadOrError(); // Treat as loaded to not get stuck
      };
    });
  }, []);

  useEffect(() => {
    if (!isLoaded || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isLoaded]);

  const activeSlide = useMemo(() => slides[currentSlide], [currentSlide]);

  if (!isLoaded) {
    return (
      <div className="flex h-svh w-full flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter">Figerout</h1>
          <p className="mt-4 text-xs md:text-sm animate-pulse">Loading inspiration...</p>
        </div>
        <div className="fixed bottom-10 w-full max-w-xs px-4">
          <Progress value={loadingProgress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-svh overflow-hidden bg-black">
      {slides.length > 0 && slides.map((slide, index) => (
        <Image
          key={index}
          src={slide.src}
          alt={slide.hint || `Background slide ${index + 1}`}
          fill
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            currentSlide === index ? "opacity-100" : "opacity-0"
          )}
          priority={index === 0}
          data-ai-hint={slide.hint}
        />
      ))}
      
      <div className="absolute inset-0 bg-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      
      {activeSlide && (
        <>
          {/* Top Center Content */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 z-10 w-full px-4 text-white text-center animate-in fade-in duration-1000">
            <div className="max-w-md mx-auto">
              <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter">Figerout</h1>
              <p className="mt-4 text-xs md:text-sm whitespace-nowrap">Discover the hidden colors in your world.</p>
            </div>
          </div>

          {/* Bottom Center Content */}
          <div className="absolute bottom-0 inset-x-0 pb-8 z-10 flex flex-col items-center text-white text-center animate-in fade-in duration-1000">
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-10 text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:scale-105 transition-transform duration-300"
            >
              <Link href="/choose">
                Find Your Color
              </Link>
            </Button>
            <div className="mt-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-white/70 mb-4 sm:mb-0">
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
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ease-in-out animate-in fade-in" 
              style={isMobile && callout.mobilePosition ? callout.mobilePosition : callout.position}
            >
              <div className="flex items-center gap-2 rounded-full bg-black/50 py-1 pl-1 pr-3 text-white shadow-lg backdrop-blur-md md:gap-3 md:py-2 md:pl-2 md:pr-4">
                <div 
                  className="relative h-5 w-5 shrink-0 md:h-8 md:w-8"
                  style={{ color: callout.hex }}
                >
                  <div className="absolute inset-0 rounded-full border border-current opacity-70"></div>
                  <div className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current md:h-4 md:w-4"></div>
                </div>
                <div>
                  <p className="font-bold font-code text-[9px] tracking-wide text-white md:text-xs">{callout.hex.toUpperCase()}</p>
                  <p className="text-[8px] uppercase text-white/80 leading-tight md:text-[10px]">{callout.name}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Footer left */}
           <div className="absolute bottom-2 left-2 z-20">
                <div ref={footerRef} className="relative inline-block">
                    <div
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/50 p-1.5 text-xs text-white/80 backdrop-blur-sm transition-colors hover:text-white"
                      onClick={() => setIsFooterExpanded(prev => !prev)}
                    >
                        <ChevronUp
                            className={cn(
                            'h-4 w-4 shrink-0 transition-transform duration-300',
                            isFooterExpanded && 'rotate-180'
                            )}
                        />
                        <span>
                            &copy; {new Date().getFullYear()} Figerout
                        </span>
                    </div>
                    <div
                        className={cn(
                            'absolute bottom-full mb-2 w-full min-w-max rounded-lg border border-white/10 bg-black/70 p-1.5 text-xs text-white/80 backdrop-blur-md shadow-lg transition-opacity duration-300 ease-in-out',
                            isFooterExpanded ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 pointer-events-none'
                        )}
                    >
                        <div className="flex flex-col items-start gap-1">
                            {footerLinks.map(link => (
                                <Link 
                                  key={link.href} 
                                  href={link.href} 
                                  className="block w-full rounded-sm px-2 py-1 transition-colors hover:bg-white/10"
                                  onClick={() => setIsFooterExpanded(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          <CookieBanner />
        </>
      )}
    </div>
  );
};

export default WelcomeScreen;
