
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Menu, Mail, Phone, MapPin } from 'lucide-react';
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


export default function ContactPage() {
    return (
        <AppLayout>
            <section className="w-full pt-32 pb-12 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32 bg-muted/50">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                        <div className="space-y-6">
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Get in Touch</h1>
                            <p className="text-muted-foreground md:text-lg">
                                Have questions about our features, pricing, or anything else? Our team is ready to answer all your questions.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Mail className="h-6 w-6 text-primary" />
                                    <a href="mailto:support@attendry.com" className="hover:underline">support@attendry.com</a>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Phone className="h-6 w-6 text-primary" />
                                    <span>+91 12345 67890</span>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-primary mt-1" />
                                    <span>123 Tech Park, Innovation Drive<br/>Bangalore, Karnataka, 560100, India</span>
                                </div>
                            </div>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Send us a Message</CardTitle>
                                <CardDescription>We'll get back to you as soon as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" placeholder="Enter your name" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" placeholder="Enter your email" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input id="subject" placeholder="What's your message about?" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" placeholder="Your message..." className="min-h-[120px]" />
                                    </div>
                                    <Button type="submit" className="w-full">Send Message</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
