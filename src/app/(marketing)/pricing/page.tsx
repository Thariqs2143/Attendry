
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: '₹0',
      duration: '/ 14 days',
      description: 'Try all our core features on a small scale, no credit card required.',
      features: [
        'Up to 5 Employees',
        '1 Branch Location',
        'QR Code & Manual Entry',
        'Live Attendance Dashboard',
      ],
      cta: 'Start Free Trial',
      isPopular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '₹79',
      duration: '/employee/month',
      description: 'For growing businesses that need more power and control.',
      features: [
        'Up to 50 Employees',
        'Up to 5 Branch Locations',
        'Advanced Reports & Payroll',
        'Leave Management',
        'Gamified Rewards System',
      ],
      cta: 'Choose Growth Plan',
      isPopular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹129',
      duration: '/employee/month',
      description: 'For large organizations needing enterprise-grade features.',
      features: [
        'Unlimited Employees',
        'Unlimited Branches',
        'Everything in Growth',
        'AI-Powered Insights',
        'API Access & Integrations',
      ],
      cta: 'Go Pro',
      isPopular: false,
    },
];

export default function PricingPage() {
    return (
        <>
            <section className="w-full pt-32 pb-12 md:pt-48 md:pb-24 lg:pt-56 lg:pb-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/50 dark:via-background dark:to-blue-950/50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                           Simple, Transparent Pricing
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                           Choose the plan that's right for your business. No hidden fees, just powerful features.
                        </p>
                    </div>
                </div>
            </section>
            
            <section className="w-full py-12 md:py-24 lg:py-32">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                             <div key={plan.id} className={`rounded-xl border-2 p-6 flex flex-col relative transition-all duration-300 ease-in-out ${plan.isPopular ? 'border-primary shadow-2xl shadow-primary/10' : 'border-border hover:border-primary hover:shadow-lg'}`}>
                                {plan.isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold rounded-full bg-primary text-primary-foreground">
                                        Top Choice
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                                    <p className="text-muted-foreground mt-2 min-h-[40px]">{plan.description}</p>
                                    <div className="my-8">
                                        <span className="text-5xl font-extrabold">{plan.price}</span>
                                        <span className="text-muted-foreground ml-1">{plan.duration}</span>
                                    </div>
                                    <ul className="space-y-4 text-muted-foreground">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="h-5 w-5 text-green-500"/>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Link href="/login" className="w-full mt-8">
                                    <Button size="lg" className={`w-full font-semibold ${!plan.isPopular && 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             <section className="w-full py-16 md:py-24 lg:py-32 bg-muted/50 dark:bg-muted/20">
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
