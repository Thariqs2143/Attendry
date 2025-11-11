
'use client';

import { Button } from "@/components/ui/button";
import { Menu, Check, X } from "lucide-react";
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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


export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const plans = [
        {
          id: 'starter',
          name: 'Starter',
          price: { monthly: 49, yearly: 490 },
          description: 'For new & small businesses just getting started.',
          features: ['Up to 20 employees', '1 Branch', 'QR Code Check-in/out', 'Manual Attendance Entry', 'Live Dashboard'],
          cta: 'Choose Starter'
        },
        {
          id: 'growth',
          name: 'Growth',
          price: { monthly: 79, yearly: 790 },
          description: 'For growing businesses that need more control.',
          isPopular: true,
          features: ['Up to 50 employees', 'Up to 5 Branches', 'Advanced Reports', 'Multi-branch Dashboard', 'Payroll & Muster Roll'],
          cta: 'Choose Growth'
        },
        {
          id: 'pro',
          name: 'Pro',
          price: { monthly: 129, yearly: 1290 },
          description: 'For large organizations needing enterprise power.',
          features: ['Unlimited employees', 'Unlimited Branches', 'AI-powered Insights', 'API Access', 'Priority Support'],
          cta: 'Choose Pro'
        }
    ];

    const CheckIcon = () => <Check className="h-5 w-5 text-green-500" />;

    return (
        <AppLayout>
            <section className="w-full py-24 md:py-32 lg:py-40 bg-muted/50">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Flexible Plans for Every Team</h1>
                        <p className="mt-3 text-lg text-muted-foreground">Choose the plan that's right for your business.</p>
                        <div className="mt-6 flex justify-center items-center gap-2">
                            <span className={cn("font-medium", billingCycle === 'monthly' ? 'text-primary' : 'text-muted-foreground')}>Monthly</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={billingCycle === 'yearly'} onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-focus dark:peer-focus:ring-primary dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                            <span className={cn("font-medium", billingCycle === 'yearly' ? 'text-primary' : 'text-muted-foreground')}>
                                Yearly
                                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">Save 20%</Badge>
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.id} className={cn("relative rounded-2xl p-6 flex flex-col h-full border-2 shadow-lg transition-all duration-300", plan.isPopular ? 'border-primary' : 'border-border')}>
                                {plan.isPopular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10"><div className="px-4 py-1 text-sm font-semibold rounded-full bg-primary text-primary-foreground shadow-md">POPULAR</div></div>}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-center">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-2 mb-6 h-10 text-center">{plan.description}</p>
                                    
                                    <div className="mb-6 text-center">
                                        <span className="text-5xl font-extrabold">
                                            ₹{plan.price[billingCycle]}
                                        </span>
                                        <span className="text-sm text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                                    </div>
                                    
                                    <ul className="space-y-4 text-sm">
                                        {plan.features.map(feature => (
                                            <li key={feature} className="flex items-start gap-x-3">
                                                <CheckIcon />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button className="w-full mt-8" size="lg">
                                    {plan.cta}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
