
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, QrCode, TrendingUp, Users } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Autoplay from "embla-carousel-autoplay";
import imageData from '@/app/lib/placeholder-images.json';


export default function MarketingHomePage() {

  const features = [
    {
      icon: <QrCode className="h-10 w-10 text-primary" />,
      title: 'Effortless QR & Selfie Check-in',
      description: "Employees can check-in and out in seconds using a dynamic QR code or a quick selfie, ensuring they are right where they need to be.",
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      title: 'Real-time Dashboards',
      description: "Get a live overview of who's on time, who's late, and who's absent across all your branches from a single, intuitive dashboard.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Automated Payroll & Reports',
      description: "Save hours of manual work. Generate muster rolls and payroll reports automatically based on precise attendance data.",
    },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    The Smart Way to Track Employee Attendance
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Attendry is a QR-based attendance system designed for modern businesses. Save time, reduce errors, and boost productivity.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Get Started
                  </Link>
                   <Link
                    href="/how-it-works"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <Image
                src={imageData.marketing_hero.src}
                width={imageData.marketing_hero.width}
                height={imageData.marketing_hero.height}
                alt={imageData.marketing_hero.alt}
                data-ai-hint={imageData.marketing_hero['data-ai-hint']}
                className="mx-auto aspect-square overflow-hidden rounded-xl object-contain sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need, Nothing You Don't</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Attendry is packed with features to make attendance management seamless for you and your employees.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-12 py-12 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-4 text-center">
                  <div className="mx-auto">{feature.icon}</div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Loved by Businesses Across India</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Hear what our customers have to say about simplifying their daily operations with Attendry.
                </p>
            </div>
            <Carousel
                opts={{ align: "start", loop: true, }}
                plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                className="w-full max-w-4xl mx-auto"
            >
                <CarouselContent>
                {imageData.testimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.seed} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex-1">
                                <p className="text-muted-foreground">"{testimonial.review}"</p>
                            </CardHeader>
                            <CardContent className="border-t pt-4">
                                <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://picsum.photos/seed/${testimonial.seed}/40/40`} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 fill-black" />
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 fill-black" />
            </Carousel>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Simplify Your Attendance?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join hundreds of businesses saving time and money. Get started in just 5 minutes.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Link href="/login">
                <Button size="lg" className="w-full">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
