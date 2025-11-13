
'use client';

import { useState } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { Banner } from '@/components/banner';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Banner show={showBanner} onHide={() => setShowBanner(false)} />
      <Header hasBanner={showBanner} />
      <main className="flex-1 -mt-[var(--header-height)]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
