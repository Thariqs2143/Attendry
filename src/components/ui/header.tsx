
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Header({ hasBanner }: { hasBanner: boolean }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      // Trigger the change slightly after scrolling starts
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = mounted && currentTheme === 'dark' ? '/header-logo-dark.png' : '/header-logo-light.png';

  // Render a placeholder until the component is mounted to avoid hydration mismatch
  if (!mounted) {
    return (
        <header className={cn("sticky z-40 w-full", hasBanner ? "top-[var(--banner-height)]" : "top-0")}>
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex h-16 items-center justify-between px-4 md:px-6">
                    <div style={{ width: 150, height: 40 }} />
                </div>
            </div>
        </header>
    );
  }

  return (
    <header 
      className={cn(
        "sticky z-40 w-full transition-all duration-300",
        hasBanner ? "top-[var(--banner-height)]" : "top-0",
      )}
    >
      <div className={cn(
          "transition-all duration-300 ease-in-out mx-auto",
          isScrolled ? "max-w-5xl" : "max-w-screen-2xl"
      )}>
        <div
          className={cn(
            "flex h-16 items-center justify-between transition-all duration-300 ease-in-out",
            isScrolled ? "mt-2 px-6 rounded-full border bg-background/80 backdrop-blur-sm shadow-lg" : "px-4 md:px-6"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center" prefetch={false}>
            <Image src={logoSrc} alt="Attendry Logo" width={150} height={40} priority />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("text-sm font-medium transition-colors",
                  pathname === link.href ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
                )}
                prefetch={false}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <Button size="sm" className="rounded-full">Get Started</Button>
            </Link>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="rounded-full">Go Pro</Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden">
              <Sheet>
              <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                  </Button>
              </SheetTrigger>
              <SheetContent side="left">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col gap-8 p-6">
                  <Link href="/" className="flex items-center" prefetch={false}>
                    <Image src={logoSrc} alt="Attendry Logo" width={150} height={40} priority />
                  </Link>
                  <nav className="grid gap-4 text-lg">
                      {navLinks.map((link) => (
                      <Link
                          key={link.href}
                          href={link.href}
                          className="font-medium hover:text-primary"
                          prefetch={false}
                      >
                          {link.label}
                      </Link>
                      ))}
                  </nav>
                  <div className="flex flex-col gap-4">
                      <Link href="/login">
                          <Button className="w-full">Get Started</Button>
                      </Link>
                      <Link href="/pricing">
                          <Button variant="outline" className="w-full">Go Pro</Button>
                      </Link>
                  </div>
                  </div>
              </SheetContent>
              </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
