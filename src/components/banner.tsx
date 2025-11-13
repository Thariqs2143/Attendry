
'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Banner({ show, onHide }: { show: boolean; onHide: () => void }) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="sticky top-0 z-50 bg-primary text-primary-foreground p-3 text-center text-sm font-medium"
      style={{ height: 'var(--banner-height)' }}
    >
      <div className="container flex items-center justify-center relative h-full">
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
            onHide();
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close banner</span>
        </Button>
      </div>
    </div>
  );
}
