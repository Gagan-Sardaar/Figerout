"use client";

import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Figerout. All rights reserved.
          </p>
          <nav className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-6 gap-y-2 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookies</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
