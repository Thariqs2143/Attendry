
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, QrCode, Users, Quote, Files, TrendingUp, CalendarOff, FileText, GitBranch, Trophy, BrainCircuit, Store, UtensilsCrossed, Wrench } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef } from 'react';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import imageData from '@/app/lib/placeholder-images.json';

const { marketing_hero, testimonials, how_it_works_step_1, how_it_works_step_2, how_it_works_step_3 } = imageData;


export default function LandingPage() {
  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <>
      <section className="w-full pt-32 pb-12 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  Every Scan. Smarter Attendance.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Ditch the paperwork. Attendry simplifies your employee check-ins with our smart QR code system. Save time, reduce errors, and boost productivity.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  prefetch={false}
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                 <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  prefetch={false}
                >
                  Contact Sales
                </Link>
              </div>
            </div>
             <Image
              src={marketing_hero.src}
              width={marketing_hero.width}
              height={marketing_hero.height}
              alt={marketing_hero.alt}
              data-ai-hint={marketing_hero['data-ai-hint']}
              className="mx-auto overflow-hidden rounded-xl object-contain"
            />
          </div>
        </div>
      </section>

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 border-2 border-primary/20 px-4 py-1.5 text-sm text-primary font-medium">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need, Nothing You Don't</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform is packed with powerful features designed to make attendance management a breeze for both owners and employees.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 lg:max-w-none mt-12">
            <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
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
             <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
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
            <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Payroll & Muster Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automate salary calculations and generate traditional muster rolls for compliance with one click.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <CalendarOff className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Leave Management</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Employees can request leave through the app, and admins can approve or deny requests on the go.
              </p>
            </div>
             <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <GitBranch className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Multi-Branch Support</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage all your business locations from a single dashboard and easily transfer staff between them.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Gamified Rewards</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Boost punctuality with a points-based leaderboard and reward system that encourages on-time check-ins.
              </p>
            </div>
             <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">AI-Powered Insights</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive smart weekly briefings on staff performance and get AI-driven advice on optimal staffing levels.
              </p>
            </div>
             <div className="flex flex-col gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
               <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Detailed Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Access detailed reports on attendance, punctuality, and leaves. Export to PDF or Excel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Get Started in 3 Simple Steps</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform is designed for simplicity and speed. Go from signup to tracking in minutes.
                </p>
            </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-12 md:grid-cols-3 mt-12">
            <div className="grid gap-4 text-center">
                <Image 
                    src={how_it_works_step_1.src} 
                    alt={how_it_works_step_1.alt} 
                    width={how_it_works_step_1.width} 
                    height={how_it_works_step_1.height} 
                    data-ai-hint={how_it_works_step_1['data-ai-hint']}
                    className="rounded-lg object-cover w-full aspect-[3/2] mb-4"/>
                <h3 className="text-xl font-bold">1. Create Your Shop</h3>
                <p className="text-muted-foreground">Sign up as a shop owner and set up your business profile. Invite your employees to join your workspace via email.</p>
            </div>
            <div className="grid gap-4 text-center">
                <Image 
                    src={how_it_works_step_2.src} 
                    alt={how_it_works_step_2.alt} 
                    width={how_it_works_step_2.width} 
                    height={how_it_works_step_2.height}
                    data-ai-hint={how_it_works_step_2['data-ai-hint']}
                    className="rounded-lg object-cover w-full aspect-[3/2] mb-4"/>
                <h3 className="text-xl font-bold">2. Generate QR Code</h3>
                <p className="text-muted-foreground">Generate a unique QR code for your shop. Choose between a permanent code for printing or a dynamic one for a screen.</p>
            </div>
            <div className="grid gap-4 text-center">
                <Image 
                    src={how_it_works_step_3.src} 
                    alt={how_it_works_step_3.alt} 
                    width={how_it_works_step_3.width} 
                    height={how_it_works_step_3.height}
                    data-ai-hint={how_it_works_step_3['data-ai-hint']}
                    className="rounded-lg object-cover w-full aspect-[3/2] mb-4"/>
                <h3 className="text-xl font-bold">3. Scan & Track</h3>
                <p className="text-muted-foreground">Employees scan the QR code with their phone to check in and out. All data is logged in your real-time dashboard instantly.</p>
            </div>
            </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                From Manual to Automated
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Visualize Your Transformation</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See the tangible impact Attendry can have on your business, transforming manual paperwork into streamlined, automated workflows.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-12 mt-12">
            <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-all hover:border-solid hover:shadow-lg">
                <h3 className="text-xl font-bold text-muted-foreground">Without Attendry</h3>
                 <div className="p-6 bg-muted rounded-full">
                    <Files className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Wasting hours on manual attendance registers, payroll errors, and tedious paperwork.</p>
            </div>
             <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-primary/50 bg-primary/5 p-8 text-center transition-all hover:shadow-2xl hover:border-primary">
                <h3 className="text-xl font-bold text-primary">With Attendry</h3>
                <div className="relative">
                  <div className="p-6 bg-primary rounded-full animate-pulse">
                      <QrCode className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <Users className="absolute -top-1 -left-1 h-6 w-6 text-primary animate-pulse delay-300" />
                   <TrendingUp className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse delay-500" />
                   <FileText className="absolute -bottom-1 left-0 h-6 w-6 text-primary animate-pulse delay-700" />
                </div>
                <p className="text-muted-foreground">Automating check-ins with QR codes, simplifying payroll, and empowering employees.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="who-its-for" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-primary/10 border-2 border-primary/20 px-4 py-1.5 text-sm text-primary font-medium">Who It's For</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Perfect For Every Local Business</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whether you run a small shop or a multi-location service, Attendry is designed to fit your unique staffing needs.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-stretch gap-8 sm:grid-cols-2 md:grid-cols-3 lg:max-w-none mt-12">
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 border-2 border-border hover:border-primary hover:shadow-lg hover:-translate-y-1">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Retail & Shops</h3>
              <p className="text-muted-foreground mt-2">Manage cashiers, floor staff, and stockists. Easily track shifts and overtime during peak festival seasons.</p>
            </Card>
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 border-2 border-border hover:border-primary hover:shadow-lg hover:-translate-y-1">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Restaurants & Cafes</h3>
              <p className="text-muted-foreground mt-2">Handle complex schedules for waiters, kitchen staff, and part-time workers. Simplify payroll for tipped employees.</p>
            </Card>
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 border-2 border-border hover:border-primary hover:shadow-lg hover:-translate-y-1">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Workshops & Services</h3>
              <p className="text-muted-foreground mt-2">Track hours for mechanics, technicians, and field agents. Ensure accurate time-logging for project-based work.</p>
            </Card>
          </div>
        </div>
      </section>

      <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                      <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Customers Say</h2>
                      <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                          We're trusted by businesses across various industries to manage their most valuable asset: their people.
                      </p>
                  </div>
              </div>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[plugin.current]}
                className="w-full max-w-6xl mx-auto mt-12"
              >
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 h-full">
                        <Card className="h-full border-2 border-border hover:border-primary hover:shadow-lg transition-all flex flex-col">
                            <CardHeader className="flex-row gap-4 items-center">
                                <Avatar>
                                    <AvatarImage src={`https://picsum.photos/seed/${testimonial.seed}/100/100`} />
                                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle>{testimonial.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <Quote className="h-6 w-6 text-primary mb-2" />
                                <p className="text-muted-foreground">{testimonial.review}</p>
                            </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
          </div>
      </section>
      
      <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Have questions? We've got answers. Here are some of the most common things we get asked.
                </p>
            </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What kind of phone do my employees need?</AccordionTrigger>
                    <AccordionContent>
                        Any modern smartphone with a camera will work! Attendry is a web-based application, so there's no need for your employees to download anything from the app store. They can simply scan the QR code using their phone's camera and our web app will handle the rest.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Is my business data secure?</AccordionTrigger>
                    <AccordionContent>
                        Absolutely. We take data security very seriously. All data is encrypted in transit and at rest. We use industry-standard security protocols to ensure that your business and employee information is always protected.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Can I use this for multiple shop locations?</AccordionTrigger>
                    <AccordionContent>
                        Yes! Our Growth and Pro plans are designed specifically for businesses with multiple branches. You can manage all your locations, employees, and attendance data from a single, centralized dashboard, and even transfer employees between branches.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>What if an employee forgets their phone?</AccordionTrigger>
                    <AccordionContent>
                        No problem. As the shop owner or admin, you have access to a manual entry feature. You can easily add an attendance record for any employee, including check-in/out times and status, directly from your dashboard.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                    <AccordionTrigger>How does the payroll feature work?</AccordionTrigger>
                    <AccordionContent>
                        Our system automatically calculates each employee's salary based on their base pay, hours worked, overtime, and any deductions for late arrivals or unpaid leave. You can generate a detailed payroll report with a single click, saving you hours of manual calculation.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            </div>
        </div>
      </section>

       <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/20">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Boost Your Business?
            </h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join hundreds of businesses saving time and money. Get started for free today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mx-auto w-full max-w-sm">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              prefetch={false}
            >
              Claim Your Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
             <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-full border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              prefetch={false}
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
