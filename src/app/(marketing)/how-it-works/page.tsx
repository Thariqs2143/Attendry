
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import imageData from '@/app/lib/placeholder-images.json';

export default function HowItWorksPage() {
  const steps = [
    {
      title: 'Sign Up & Create Your Shop',
      description: "Getting started is easy. Create your account as a shop owner, and complete your business profile. This takes less than 5 minutes.",
      image: imageData.how_it_works_step_1,
    },
    {
      title: 'Generate & Display Your QR Code',
      description: "From your admin dashboard, generate your unique shop QR code. You can choose a permanent code to print and display, or a dynamic code that refreshes on a screen for extra security.",
      image: imageData.how_it_works_step_2,
    },
    {
      title: 'Employees Scan to Check-In & Out',
      description: "Your employees simply open the Attendry app, scan the QR code using their phone camera, and their attendance is logged in real-time. That's it!",
      image: imageData.how_it_works_step_3,
    },
  ];

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Simple Steps to a Smarter Workplace</h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            See how Attendry transforms your daily attendance process from manual and tedious to digital and effortless.
          </p>
        </div>

        <div className="relative">
          {/* The vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-24`}
            >
              <div className={`space-y-4 text-center md:text-left ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4">
                  {index + 1}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>
              <div className={`flex justify-center ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                <Image
                  src={step.image.src}
                  alt={step.image.alt}
                  data-ai-hint={step.image['data-ai-hint']}
                  width={step.image.width}
                  height={step.image.height}
                  className="rounded-xl shadow-2xl object-cover border-4 border-muted transition-transform hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-24">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Begin?</h2>
          <p className="text-muted-foreground text-lg mb-8">Start streamlining your attendance management today.</p>
          <Link href="/login">
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
