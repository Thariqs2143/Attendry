
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
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Header({ hasBanner }: { hasBanner: boolean }) {
  const pathname = usePathname();

  return (
    <header 
      className={cn(
        "sticky z-40 w-full transition-all duration-300",
        hasBanner ? "top-[var(--banner-height)]" : "top-0"
      )}
      style={{ height: 'var(--header-height)'}}
    >
      <div className="container flex h-full max-w-screen-2xl items-center">
        {/* Centered Rounded Navigation for Desktop */}
        <div className="hidden md:flex mx-auto h-14 items-center justify-center rounded-full border bg-background/80 backdrop-blur-sm px-8 shadow-lg">
          <Link href="/" className="mr-6 flex items-center" prefetch={false}>
            <span className="font-bold text-lg text-primary tracking-wider">
              Attendry
            </span>
          </Link>
          <nav className="flex items-center gap-6">
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
          <div className="flex items-center gap-2 ml-6">
            <Link href="/login">
              <Button size="sm" className="rounded-full">Get Started</Button>
            </Link>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="rounded-full">Go Pro</Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex w-full items-center justify-between md:hidden">
            <Link href="/" className="flex items-center" prefetch={false}>
                <span className="font-bold text-2xl text-primary tracking-wider">Attendry</span>
            </Link>
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
