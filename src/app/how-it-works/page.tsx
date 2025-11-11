
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="container mx-auto h-16 flex items-center justify-between rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/20 px-6">
          <Link href="/" className="flex items-center" prefetch={false}>
            <span className="font-bold text-2xl text-primary tracking-wider">Attendry</span>
          </Link>
          <nav className="hidden lg:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              About Us
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Contact Us
            </Link>
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
              Owner Login
            </Link>
            <Link href="/employee/login">
              <Button>Employee Login</Button>
            </Link>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden rounded-full">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center" prefetch={false}>
                  <span className="font-bold text-2xl text-primary tracking-wider">Attendry</span>
                </Link>
                <nav className="grid gap-4 text-lg">
                  <Link href="/" className="font-medium hover:underline underline-offset-4">Home</Link>
                  <Link href="/about" className="font-medium hover:underline underline-offset-4">About Us</Link>
                  <Link href="/how-it-works" className="font-medium hover:underline underline-offset-4">How It Works</Link>
                  <Link href="/pricing" className="font-medium hover:underline underline-offset-4">Pricing</Link>
                  <Link href="/contact" className="font-medium hover:underline underline-offset-4">Contact Us</Link>
                  <Link href="/login" className="font-medium hover:underline underline-offset-4">Owner Login</Link>
                  <Link href="/employee/login" className="font-medium hover:underline underline-offset-4">Employee Login</Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto py-12 px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
                <Link href="/" className="flex items-center" prefetch={false}>
                    <span className="font-bold text-2xl text-primary tracking-wider">Attendry</span>
                </Link>
                <p className="text-muted-foreground max-w-md">Attendry simplifies attendance tracking for modern businesses, helping you save time, reduce errors, and boost productivity with a smart, QR-based system.</p>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold uppercase text-muted-foreground">Navigation</h4>
                <nav className="flex flex-col gap-2">
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
        <div className="border-t">
            <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
                <p>&copy; 2024 Attendry. All rights reserved.</p>
                <p>Made with ❤️ in India</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default function HowItWorksPage() {
    return (
        <AppLayout>
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                     <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">How It Works</div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Get Started in 3 Simple Steps</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Our platform is designed for simplicity and speed. Go from signup to tracking in minutes.
                            </p>
                        </div>
                    </div>
                    <div className="mx-auto grid max-w-5xl items-start gap-12 md:grid-cols-3 mt-12">
                        <div className="grid gap-4 text-center">
                            <div className="relative flex justify-center">
                                <div className="p-4 rounded-full bg-primary text-primary-foreground text-2xl font-bold h-16 w-16 flex items-center justify-center">1</div>
                            </div>
                            <h3 className="text-xl font-bold">Create Your Shop</h3>
                            <p className="text-muted-foreground">Sign up as a shop owner and set up your business profile. Invite your employees to join your workspace via email.</p>
                        </div>
                        <div className="grid gap-4 text-center">
                            <div className="relative flex justify-center">
                               <div className="p-4 rounded-full bg-primary text-primary-foreground text-2xl font-bold h-16 w-16 flex items-center justify-center">2</div>
                            </div>
                            <h3 className="text-xl font-bold">Generate QR Code</h3>
                            <p className="text-muted-foreground">Generate a unique QR code for your shop. Choose between a permanent code for printing or a dynamic one for a screen.</p>
                        </div>
                        <div className="grid gap-4 text-center">
                             <div className="relative flex justify-center">
                               <div className="p-4 rounded-full bg-primary text-primary-foreground text-2xl font-bold h-16 w-16 flex items-center justify-center">3</div>
                            </div>
                            <h3 className="text-xl font-bold">Scan & Track</h3>
                            <p className="text-muted-foreground">Employees scan the QR code with their phone to check in and out. All data is logged in your real-time dashboard instantly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
