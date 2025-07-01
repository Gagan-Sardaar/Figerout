
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
                {/* Trigger */}
                <div className="flex cursor-default items-center gap-1.5 rounded-lg bg-muted/50 p-1.5 text-xs text-muted-foreground transition-all">
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
                        'absolute bottom-full mb-2 w-full min-w-max rounded-lg bg-popover p-1.5 text-xs text-popover-foreground shadow-lg transition-all duration-300 ease-in-out',
                        isFooterExpanded ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 pointer-events-none'
                    )}
                >
                    <div className="flex flex-col items-start gap-1">
                        {footerLinks.map(link => (
                            <Link key={link.href} href={link.href} className="block w-full rounded-sm px-2 py-1 transition-colors hover:bg-accent hover:text-accent-foreground">
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
