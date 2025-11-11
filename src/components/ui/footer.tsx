
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/theme-switcher';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
                <Link href="/" className="flex items-center" prefetch={false}>
                    <span className="font-bold text-2xl text-primary tracking-wider">Attendry</span>
                </Link>
                <p className="text-muted-foreground max-w-md">Attendry simplifies attendance tracking for modern businesses, helping you save time, reduce errors, and boost productivity with a smart, QR-based system.</p>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold uppercase text-muted-foreground">Navigation</h4>
                <nav className="flex flex-col gap-2">
                    <Link href="/" className="text-sm hover:underline">Home</Link>
                    <Link href="/about" className="text-sm hover:underline">About Us</Link>
                    <Link href="/how-it-works" className="text-sm hover:underline">How It Works</Link>
                    <Link href="/pricing" className="text-sm hover:underline">Pricing</Link>
                    <Link href="/contact" className="text-sm hover:underline">Contact Us</Link>
                </nav>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold uppercase text-muted-foreground">Quick Links</h4>
                <nav className="flex flex-col gap-2">
                    <Link href="/login" className="text-sm hover:underline">Shop Owner Portal</Link>
                    <Link href="/employee/login" className="text-sm hover:underline">Employee Portal</Link>
                    <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
                    <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
                </nav>
            </div>
        </div>
        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2024 Attendry. All rights reserved.</p>
          <div className="mt-4 sm:mt-0">
             <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
