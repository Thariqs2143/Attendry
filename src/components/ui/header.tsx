
'use client';

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

export function Header({ hasBanner }: { hasBanner: boolean }) {
  const pathname = usePathname();

  return (
    <header 
        className={cn(
            "sticky z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            hasBanner ? "top-[var(--banner-height)]" : "top-0"
        )}
        style={{ height: 'var(--header-height)'}}
    >
      <div
        className='container flex h-full max-w-screen-2xl items-center'
      >
        <Link href="/" className="mr-6 flex items-center" prefetch={false}>
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
        
        <div className="flex flex-1 items-center justify-end gap-2">
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
      </div>
    </header>
  );
}
