"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Cookie } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Wait for the component to mount before checking localStorage
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'true') {
      // Use a timeout to make the banner appear smoothly after page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div 
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-500"
        />
      )}
      <div
        className={cn(
          'fixed bottom-0 inset-x-0 z-50 w-full border-t bg-background/80 p-4 text-card-foreground shadow-lg transition-transform duration-500 ease-out',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="container mx-auto flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 shrink-0 text-primary" />
            <h3 className="font-semibold text-lg">Cookie Preferences</h3>
          </div>
          <p className="text-sm text-muted-foreground flex-grow sm:text-left text-center">
            We use cookies to enhance your experience. By clicking "Accept", you agree to our use of cookies.
            {' '}
            <Link href="/cookies" className="underline hover:text-primary">
              Learn more
            </Link>.
          </p>
          <div className="shrink-0">
            <Button size="sm" onClick={handleAccept}>
              Accept
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
