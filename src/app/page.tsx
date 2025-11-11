
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, QrCode, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
            <span className="font-bold text-2xl text-primary tracking-wider">
                Attendry
            </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Owner Login
          </Link>
          <Link
            href="/employee/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Employee Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/50 dark:via-background dark:to-blue-950/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                   <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                    Effortless Attendance for the Modern Workforce
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Ditch the paperwork. Attendry simplifies your employee check-ins with our smart QR code system. Save time, reduce errors, and boost productivity.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
               <Image
                src="https://res.cloudinary.com/dnkghymx5/image/upload/v1722839933/attendry-hero-image_axjg5v.png"
                width="600"
                height="600"
                alt="Hero"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-contain sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need, Nothing You Don't</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is packed with powerful features designed to make attendance management a breeze for both owners and employees.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-2 p-6 rounded-lg border-2 border-border hover:border-primary hover:shadow-lg transition-all">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <QrCode className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">QR Code Check-in</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate static or dynamic QR codes. Employees scan with their phone to check in and out instantly.
                </p>
              </div>
               <div className="grid gap-2 p-6 rounded-lg border-2 border-border hover:border-primary hover:shadow-lg transition-all">
                 <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">Staff Management</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Easily invite, view, and manage all your employee profiles across single or multiple branches.
                </p>
              </div>
               <div className="grid gap-2 p-6 rounded-lg border-2 border-border hover:border-primary hover:shadow-lg transition-all">
                 <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <BarChart3 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">Powerful Reports</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate detailed attendance, muster, and payroll reports. Export to PDF or Excel with a single click.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted dark:bg-muted/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to transform your attendance system?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join hundreds of businesses saving time and money. Get started in minutes.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Sign Up Now
              </Link>
            </div>
          </div>
        </section>
      </main>
       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Attendry. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

    