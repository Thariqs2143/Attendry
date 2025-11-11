
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="bg-primary text-primary-foreground p-3 text-center text-sm font-medium">
        <Link href="/pricing" className="flex items-center justify-center gap-2 hover:underline">
          <span>Special Offer! Upgrade and save up to 40% on our plans.</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <Header />
      <main className="flex-1 pt-12">{children}</main>
      <Footer />
    </div>
  );
}
