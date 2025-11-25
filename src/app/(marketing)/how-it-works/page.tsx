
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, FileText, GitBranch } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HowItWorksPage() {
    return (
        <>
            <section className="w-full pt-32 pb-12 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/50 dark:via-background dark:to-indigo-950/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium">How It Works</div>
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                           A Clear Path to Efficiency
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                           Our platform is designed for simplicity and speed. Go from signup to tracking in minutes with our intuitive three-step process.
                        </p>
                    </div>
                </div>
            </section>

             <section id="how-it-works-detailed" className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="space-y-16">
                        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 items-center">
                            <div className="space-y-4">
                                <div className="text-4xl font-bold text-primary">1.</div>
                                <h3 className="text-3xl font-bold">Create Your Shop & Invite Staff</h3>
                                <p className="text-muted-foreground md:text-lg">
                                    Sign up as a shop owner and create your digital workspace in under two minutes. Once your shop is set up, easily invite your employees to join by sending them an invitation link via email or WhatsApp.
                                </p>
                            </div>
                             <Image src="https://res.cloudinary.com/dnkghymx5/image/upload/v1762849032/Generated_Image_November_11_2025_-_1_42PM_1_n4lc6r.png" alt="Create Shop" width={600} height={400} className="rounded-lg object-cover w-full aspect-video shadow-lg"/>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 items-center">
                            <Image src="https://res.cloudinary.com/dnkghymx5/image/upload/v1762849381/Generated_Image_November_11_2025_-_1_52PM_1_bkpo3k.png" alt="Generate QR" width={600} height={400} className="rounded-lg object-cover w-full aspect-video shadow-lg md:order-last"/>
                            <div className="space-y-4">
                                <div className="text-4xl font-bold text-primary">2.</div>
                                <h3 className="text-3xl font-bold">Generate Your Unique QR Code</h3>
                                <p className="text-muted-foreground md:text-lg">
                                    From your admin dashboard, generate a unique QR code for your shop. Choose a permanent code for printing and display, or a dynamic code that refreshes every 15 seconds for enhanced security on a tablet or screen.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 items-center">
                             <div className="space-y-4">
                                <div className="text-4xl font-bold text-primary">3.</div>
                                <h3 className="text-3xl font-bold">Scan, Track, and Analyze</h3>
                                <p className="text-muted-foreground md:text-lg">
                                    Your employees simply scan the QR code with their smartphone's camera to check in and out. All attendance data is captured in real-time on your dashboard, ready for you to view, analyze, and export for payroll.
                                </p>
                            </div>
                            <Image src="https://res.cloudinary.com/dnkghymx5/image/upload/v1762849716/Generated_Image_November_11_2025_-_1_57PM_1_msv8zo.png" alt="Scan & Track" width={600} height={400} className="rounded-lg object-cover w-full aspect-video shadow-lg"/>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 dark:bg-muted/20">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="space-y-2">
                             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Beyond the Scan</h2>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Attendry does more than just track time. It unlocks efficiency across your business.
                            </p>
                        </div>
                    </div>
                     <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 md:grid-cols-3 mt-12">
                        <div className="flex flex-col gap-4 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
                             <FileText className="h-8 w-8 text-primary" />
                             <h3 className="text-xl font-bold">Automated Payroll</h3>
                             <p className="text-sm text-muted-foreground">
                                Save hours of manual work. Generate accurate payroll and muster reports based on captured attendance data with a single click.
                             </p>
                        </div>
                         <div className="flex flex-col gap-4 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
                            <BarChart3 className="h-8 w-8 text-primary" />
                             <h3 className="text-xl font-bold">Insightful Reports</h3>
                             <p className="text-sm text-muted-foreground">
                                Access detailed analytics on punctuality, overtime, and leave patterns. Export your data to PDF or Excel anytime for deeper analysis.
                             </p>
                        </div>
                         <div className="flex flex-col gap-4 p-6 rounded-lg border-2 bg-background border-border hover:border-primary hover:shadow-lg transition-all">
                            <GitBranch className="h-8 w-8 text-primary" />
                             <h3 className="text-xl font-bold">Multi-Branch Control</h3>
                             <p className="text-sm text-muted-foreground">
                                Manage attendance for all your locations from one central dashboard. Get a complete view of your entire workforce, no matter where they are.
                             </p>
                        </div>
                    </div>
                </div>
            </section>

             <section className="w-full py-16 md:py-24 lg:py-32">
                <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        Ready to Simplify Your Business?
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Stop wasting time on manual tracking. Experience the ease and efficiency of Attendry today.
                    </p>
                </div>
                <div className="mx-auto w-full max-w-sm">
                    <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    prefetch={false}
                    >
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
                </div>
            </section>
        </>
    );
}
