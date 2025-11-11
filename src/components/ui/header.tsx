
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
        "fixed left-0 right-0 z-50 p-4 transition-all duration-300 top-0"
    )}>
      <div
        className={cn(
          'container mx-auto flex h-16 items-center justify-between px-6 rounded-full transition-all duration-300',
          hasScrolled
            ? 'bg-background/80 backdrop-blur-sm shadow-lg border'
            : 'bg-transparent'
        )}
      >
        <Link href="/" className="flex items-center" prefetch={false}>
          <span className="font-bold text-2xl text-primary tracking-wider">
            Attendry
          </span>
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

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
                <Button>Get Started</Button>
            </Link>
            <Link href="/pricing">
                <Button variant="outline">Go Pro</Button>
            </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-8 p-6">
                <Link href="/" className="flex items-center" prefetch={false}>
                  <span className="font-bold text-2xl text-primary tracking-wider">Attendry</span>
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
    </header>
  );
}
