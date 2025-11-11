

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AboutPage() {
    return (
        <>
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
        </>
    );
}
