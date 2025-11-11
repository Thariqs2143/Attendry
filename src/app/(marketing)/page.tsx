
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, QrCode, Users, Quote, Fingerprint, Files, TrendingUp, CalendarOff, FileText, GitBranch, Trophy, BrainCircuit, Store, UtensilsCrossed, Wrench } from 'lucide-react';
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

const testimonials = [
  { name: 'Ravi Sharma', role: 'Retail Store Owner', review: "Attendry has been a game-changer. Payroll used to take me hours, but now it's a matter of minutes. The reporting is fantastic and my staff love how easy it is to use.", seed: '1' },
  { name: 'Priya Joshi', role: 'Cafe Manager', review: "Managing shifts in a busy cafe is chaotic. The dynamic QR code feature is genius - it ensures my team is actually on-site when they check in. It has significantly improved punctuality.", seed: '2' },
  { name: 'Anil Verma', role: 'MSME Workshop Supervisor', review: "I run a small workshop and needed something simple. Attendry was the perfect fit. No expensive hardware, just a simple app that everyone understands. Highly recommended.", seed: '3' },
  { name: 'Sunita Gupta', role: 'Boutique Owner', review: "The multi-branch feature is a lifesaver! I can finally see attendance for all my locations from one dashboard. It has made managing my teams so much easier.", seed: '4' },
  { name: 'Rajesh Kumar', role: 'Restaurant Chain Head', review: "Switching to Attendry has saved us countless admin hours. The automated payroll report is accurate and saves us a headache every month.", seed: '5' },
  { name: 'Deepika Singh', role: 'IT Services Firm HR', review: "Our employees love the rewards system. It's a fun way to encourage punctuality and has genuinely improved our on-time attendance rates.", seed: '6' },
  { name: 'Vikram Patel', role: 'Construction Site Manager', review: "Tracking attendance for a mobile workforce was always tough. With Attendry, my crew can check in easily on-site. The data is always live and accurate.", seed: '7' },
  { name: 'Meena Iyer', role: 'School Administrator', review: "We use Attendry for our non-teaching staff. It's reliable, easy to manage, and the support has been excellent. The leave management feature is also very helpful.", seed: '8' },
  { name: 'Amit Desai', role: 'Food Truck Operator', review: "As a small, mobile business, I needed something flexible. The app is perfect. I can generate a QR code on my tablet and my team is good to go.", seed: '9' },
  { name: 'Kavita Reddy', role: 'Gym Owner', review: "My trainers have variable schedules. The shift management and attendance tracking in Attendry handle it all perfectly. It has simplified our operations.", seed: '10' },
  { name: 'Harish Mehta', role: 'Manufacturing Plant Foreman', review: "The muster roll generation is a key feature for our compliance needs. What used to be a manual task is now automated and error-free.", seed: '11' },
  { name: 'Nisha Agarwal', role: 'Supermarket Owner', review: "The AI-powered weekly briefing gives me a quick snapshot of my staff's performance without having to dig through reports. It's a fantastic time-saver.", seed: '12' },
  { name: 'Sanjay Kapoor', role: 'Logistics Head', review: "We have multiple warehouses. The ability to transfer staff profiles between branches in the app is a simple but incredibly useful feature for us.", seed: '13' },
  { name: 'Pooja Nair', role: 'Event Management Company', review: "For temporary staff at events, Attendry is perfect. We can quickly add them, track their hours, and process payments accurately. It's very efficient.", seed: '14' },
  { name: 'Arun Singh', role: 'Automobile Service Center', review: "The system just works. It's reliable, my mechanics find it easy to use, and I get all the data I need without any fuss. I'm very happy with it.", seed: '15' },
];

export default function LandingPage() {
  const plugin = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <>
      <section className="w-full pt-32 pb-12 md:pt-40 md:pb-24 lg:pt-48 lg:pb-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  QR-Powered Attendance for the Modern Workforce
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Ditch the paperwork. Attendry simplifies your employee check-ins with our smart QR code system. Save time, reduce errors, and boost productivity.
                </p>
              </div>
              <div className="flex flex-col gap-4 min-[400px]:flex-row">
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
              src="https://res.cloudinary.com/dnkghymx5/image/upload/v1722839933/attendry-hero-image_axjg5v.png"
              width={700}
              height={700}
              alt="Hero"
              className="mx-auto aspect-square overflow-hidden rounded-xl object-contain"
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
                  <div className="p-6 bg-primary rounded-full">
                      <Fingerprint className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <Users className="absolute -top-1 -left-1 h-6 w-6 text-primary animate-pulse" />
                   <TrendingUp className="absolute -top-1 -right-1 h-6 w-6 text-primary animate-pulse" />
                   <QrCode className="absolute -bottom-1 left-0 h-6 w-6 text-primary animate-pulse" />
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
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Retail & Shops</h3>
              <p className="text-muted-foreground mt-2">Manage cashiers, floor staff, and stockists. Easily track shifts and overtime during peak festival seasons.</p>
            </Card>
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <UtensilsCrossed className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Restaurants & Cafes</h3>
              <p className="text-muted-foreground mt-2">Handle complex schedules for waiters, kitchen staff, and part-time workers. Simplify payroll for tipped employees.</p>
            </Card>
            <Card className="flex flex-col items-center text-center p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
      
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 dark:bg-muted/20">
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
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              prefetch={false}
            >
              Sign Up Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
