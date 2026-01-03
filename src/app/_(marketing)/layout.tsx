
'use client';

import { useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Banner } from '@/components/banner';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

export default function MarketingLayout({ children }: PropsWithChildren) {
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <div className="flex min-h-screen flex-col">
      <Banner show={isBannerVisible} onHide={() => setIsBannerVisible(false)} />
      <Header hasBanner={isBannerVisible} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

