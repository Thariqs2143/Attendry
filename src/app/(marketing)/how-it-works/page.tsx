
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function HowItWorksPage() {
    return (
        <>
            <section className="w-full py-24 md:py-32 lg:py-40">
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
        </>
    );
}
