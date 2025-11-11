
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';
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


export default function AboutPage() {
    return (
        <AppLayout>
            <section className="w-full pt-32 pb-12 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/50 dark:via-background dark:to-blue-950/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            About Attendry
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            We are on a mission to empower small and medium businesses with tools that were once only available to large corporations.
                        </p>
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="space-y-4">
                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our Mission</div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Simplifying Business Operations</h2>
                            <p className="text-muted-foreground md:text-lg">
                                Attendry was born from a simple observation: local business owners spend too much time on manual, repetitive tasks. From tracking employee hours on paper to manually calculating payroll, these administrative burdens steal focus from what truly matters—serving customers and growing the business.
                            </p>
                            <p className="text-muted-foreground md:text-lg">
                                Our mission is to eliminate this administrative friction. We build intuitive, affordable, and powerful digital tools that automate the mundane, providing business owners with the time and data they need to make smart decisions. We believe that technology should be an enabler, not a barrier, for everyone.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our Vision</div>
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">The Digital Backbone for Local Commerce</h2>
                            <p className="text-muted-foreground md:text-lg">
                                We envision a world where every local shop, cafe, and workshop can compete on a level playing field. Our goal is for Attendry to become the essential digital partner for these businesses, a comprehensive platform that goes beyond attendance to simplify every aspect of their operations.
                            </p>
                            <p className="text-muted-foreground md:text-lg">
                                From staff management and payroll to customer engagement and inventory, we are building a connected ecosystem that empowers local entrepreneurs to thrive in the digital age.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
