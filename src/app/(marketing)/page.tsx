
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, QrCode, Users, Quote } from 'lucide-react';
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
      <section className="w-full pt-32 pb-12 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/50 dark:via-background dark:to-blue-950/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                  Turn Visitors into Loyal Customers with a QR Scan
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
                  Claim Your Free Account
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

      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted dark:bg-muted/50">
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
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <div className="grid gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
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
             <div className="grid gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
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
             <div className="grid gap-2 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
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
