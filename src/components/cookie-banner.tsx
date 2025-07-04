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
    <div
      className={cn(
        'fixed bottom-4 inset-x-4 z-50 w-auto max-w-lg rounded-lg border bg-card p-4 text-card-foreground shadow-lg transition-transform duration-500 ease-out md:right-8 md:left-auto',
        isVisible ? 'translate-y-0' : 'translate-y-[calc(100%+2rem)]'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="h-6 w-6 shrink-0 text-primary" />
          <h3 className="font-semibold text-lg">Cookie Preferences</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-2 sm:mt-0 flex-grow">
          We use cookies to enhance your experience. By clicking "Accept", you agree to our use of cookies.
          {' '}
          <Link href="/cookies" className="underline hover:text-primary">
            Learn more
          </Link>.
        </p>
        <div className="flex justify-end mt-4 sm:mt-0 shrink-0">
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
