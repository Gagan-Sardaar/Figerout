
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppFooter() {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);

  const footerLinks = [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
    { href: "/admin", label: "Dashboard" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
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

  return (
    <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-4">
            <div ref={footerRef} className="relative inline-block">
                {/* Trigger */}
                <div
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-muted p-1.5 text-xs text-muted-foreground transition-colors"
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

                {/* Content - positioned to open upwards */}
                <div
                    className={cn(
                        'absolute bottom-full mb-2 w-full min-w-max rounded-lg border bg-popover p-1.5 text-xs text-popover-foreground shadow-lg transition-opacity duration-300 ease-in-out',
                        isFooterExpanded ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 pointer-events-none'
                    )}
                >
                    <div className="flex flex-col items-start gap-1">
                        {footerLinks.map(link => (
                            <Link 
                              key={link.href} 
                              href={link.href} 
                              className="block w-full rounded-sm px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground"
                              onClick={() => setIsFooterExpanded(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
}
