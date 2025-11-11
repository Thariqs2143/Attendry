
'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {showBanner && (
        <div className="bg-primary text-primary-foreground p-3 text-center text-sm font-medium relative">
          <Link href="/pricing" className="flex items-center justify-center gap-2 hover:underline">
            <span>Special Offer! Upgrade and save up to 40% on our plans.</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 right-4 -translate-y-1/2 h-7 w-7 text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground"
            onClick={(e) => {
                e.preventDefault();
                setShowBanner(false);
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close banner</span>
          </Button>
        </div>
      )}
      <Header hasBanner={showBanner} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
