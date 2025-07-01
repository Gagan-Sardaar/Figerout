"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppFooter() {
  const [isFooterExpanded, setIsFooterExpanded] = useState(false);

  const footerLinks = [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact Us" },
    { href: "/admin", label: "Dashboard" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
  ];

  return (
    <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-4">
            <div
                className="relative inline-block"
                onMouseEnter={() => setIsFooterExpanded(true)}
                onMouseLeave={() => setIsFooterExpanded(false)}
            >
                <div className="rounded-lg bg-muted p-2 text-sm text-muted-foreground">
                    <div className="flex cursor-default items-center gap-2">
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
                            'grid grid-rows-[0fr] transition-[grid-template-rows,padding-top,margin-top] duration-300 ease-in-out',
                            isFooterExpanded && 'grid-rows-[1fr] pt-2 mt-2'
                        )}
                    >
                        <div className="overflow-hidden">
                            <div className="flex flex-col items-start gap-1.5 border-t border-border pt-2">
                                {footerLinks.map(link => (
                                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>
  );
}
