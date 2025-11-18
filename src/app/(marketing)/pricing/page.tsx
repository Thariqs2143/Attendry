
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Building, Users, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'threeYearly'>('yearly');
  const [currency, setCurrency] = useState<'inr' | 'usd'>('inr');
  const [staffCount, setStaffCount] = useState(10);

 const plans = [
    {
      id: 'trial',
      name: '14-Day Free Trial',
      price: { monthly: { inr: 0, usd: 0 }, yearly: { inr: 0, usd: 0 }, threeYearly: { inr: 0, usd: 0 } },
      cta: 'Start Free Trial',
      highlight: 'Try our core features — absolutely free for 14 days.',
      mainFeatures: ['QR Code Check-in/out', 'Manual Attendance Entry', 'Live Attendance Dashboard', 'Easy Employee Onboarding'],
      usageLimits: { employees: 'Up to 5', branches: '1 Branch' }
    },
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: { inr: 49, usd: 0.99 }, yearly: { inr: 490, usd: 9.9 }, threeYearly: { inr: 999, usd: 19.9 } },
      cta: 'Choose Starter',
      highlight: 'For new & small businesses just getting started.',
      mainFeatures: ['QR Code Check-in/out', 'Manual Attendance Entry', 'Live Attendance Dashboard', 'Easy Employee Onboarding'],
      usageLimits: { employees: 'Up to 20 employees', branches: '1 Branch' }
    },
    {
      id: 'growth',
      name: 'Growth',
      price: { monthly: { inr: 79, usd: 1.49 }, yearly: { inr: 790, usd: 14.9 }, threeYearly: { inr: 1599, usd: 29.9 } },
      cta: 'Choose Growth',
      highlight: 'For growing businesses that need more control.',
      isPopular: true,
      mainFeatures: ['All Starter features', 'Priority Support', 'Advanced Reports & Analytics', 'Multi-branch Dashboard'],
      usageLimits: { employees: 'Up to 50 employees', branches: 'Up to 5 Branches' }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: { inr: 129, usd: 2.49 }, yearly: { inr: 1290, usd: 24.9 }, threeYearly: { inr: 2999, usd: 49.9 } },
      cta: 'Choose Pro',
      highlight: 'For large organizations needing enterprise-grade power.',
      isBestValue: true,
      mainFeatures: ['All Growth features', 'AI-powered Insights', 'Custom Branding & Reports', 'API Access + Integrations'],
      usageLimits: { employees: 'Unlimited', branches: 'Unlimited' }
    }
  ];

  const featureComparison = [
    { name: 'QR Code Check-in/out', trial: true, starter: true, growth: true, pro: true },
    { name: 'Manual Attendance Entry', trial: true, starter: true, growth: true, pro: true },
    { name: 'Live Attendance Dashboard', trial: true, starter: true, growth: true, pro: true },
    { name: 'Easy Employee Onboarding', trial: true, starter: true, growth: true, pro: true },
    { name: 'Employee Profiles', trial: true, starter: true, growth: true, pro: true },
    { name: 'Detailed Attendance Reports', trial: true, starter: true, growth: true, pro: true },
    { name: 'Export Reports (PDF / Excel)', trial: false, starter: true, growth: true, pro: true },
    { name: 'Muster Roll Generation', trial: false, starter: false, growth: true, pro: true },
    { name: 'Automated Payroll Calculation', trial: false, starter: false, growth: true, pro: true },
    { name: 'Points & Rewards System', trial: false, starter: false, growth: true, pro: true },
    { name: 'Punctuality Leaderboard', trial: false, starter: false, growth: true, pro: true },
    { name: 'Multi-Branch Support', trial: false, starter: false, growth: true, pro: true },
    { name: 'Staff Transfer Between Branches', trial: false, starter: false, growth: true, pro: true },
    { name: 'AI-Powered Weekly Briefing', trial: false, starter: false, growth: false, pro: true },
    { name: 'Smart Staffing Advisor (AI)', trial: false, starter: false, growth: false, pro: true },
    { name: 'Customizable Alerts & Notifications', trial: false, starter: false, growth: false, pro: true },
  ];

  const currencySymbol = currency === 'inr' ? '₹' : '$';
  const cycleText = billingCycle === 'monthly' ? '/month' : billingCycle === 'yearly' ? '/year' : '/3-years';
  const CheckIcon = ({ className = 'w-5 h-5' }) => <Check className={cn("text-emerald-500", className)} />;
  const XMark = ({ className = 'w-5 h-5' }) => <X className={cn("text-gray-400 dark:text-gray-600", className)} />;

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
                <div className="container max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Flexible Plans for Every Team</h2>
                        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Choose your billing cycle and select the number of staff you need.</p>
                        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span className={cn(currency === 'inr' ? 'text-primary' : 'text-gray-500 dark:text-gray-400')}>INR (₹)</span>
                                <Switch checked={currency === 'usd'} onCheckedChange={(checked) => setCurrency(checked ? 'usd' : 'inr')} />
                                <span className={cn(currency === 'usd' ? 'text-primary' : 'text-gray-500 dark:text-gray-400')}>USD ($)</span>
                            </div>
                            <Separator orientation="vertical" className="h-6 hidden sm:block" />
                            <div className="w-full sm:w-auto sm:max-w-xs">
                                <Select value={billingCycle} onValueChange={(value) => setBillingCycle(value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select billing cycle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                                        <SelectItem value="threeYearly">3-Year (Save 40%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    
                    <Card className="mb-12">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="staff-slider" className="text-lg font-semibold">How many staff members do you have?</Label>
                                    <p className="text-sm text-muted-foreground">Slide to calculate your price. The slider is capped at 200 for Pro.</p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <Slider
                                        id="staff-slider"
                                        value={[staffCount]}
                                        onValueChange={(value) => setStaffCount(value[0])}
                                        max={200}
                                        min={1}
                                        step={1}
                                        className="w-full md:w-64"
                                    />
                                    <div className="flex h-10 w-24 items-center justify-center rounded-md border border-input bg-transparent px-3 text-lg font-bold">
                                        {staffCount}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4 mb-14">
                        {plans.map((p) => {
                            const pricePerStaff = p.price[billingCycle][currency];
                            const maxEmployees = p.id === 'pro' || p.id === 'trial' ? Infinity : p.id === 'starter' ? 20 : 50;
                            const isWithinLimit = staffCount <= maxEmployees;
                            const finalPrice = p.id === 'trial' ? 0 : pricePerStaff * (p.id === 'starter' || p.id === 'growth' ? Math.min(staffCount, maxEmployees) : staffCount);

                            return (
                                <div key={p.id} className={cn(
                                    'relative rounded-2xl p-6 flex flex-col h-full bg-slate-100 dark:bg-slate-800 border-2 shadow-lg transition-all duration-300',
                                    !isWithinLimit && 'opacity-60 bg-slate-200 dark:bg-slate-900',
                                    p.isPopular ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-200 dark:border-slate-700',
                                    p.isBestValue ? 'border-green-500 shadow-green-500/20' : ''
                                )}>
                                {p.isPopular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10"><div className="px-4 py-1 text-sm font-semibold rounded-full bg-blue-500 text-white shadow-md">TOP CHOICE</div></div>}
                                {p.isBestValue && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10"><div className="px-4 py-1 text-sm font-semibold rounded-full bg-green-500 text-white shadow-md">SPECIAL OFFER</div></div>}
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-center">{p.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 h-10 text-center">{p.highlight}</p>
                                    
                                    <div className="mb-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-5xl font-extrabold">
                                                <span className="text-3xl align-top">{currencySymbol}</span>
                                                <span className="break-all">{currency === 'inr' ? Math.round(finalPrice) : finalPrice.toFixed(2)}</span>
                                            </span>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{cycleText}</p>
                                        </div>
                                        {p.id !== 'trial' && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">(billed per employee)</p>}
                                    </div>
                                    
                                    <Link href="/login">
                                      <Button
                                        disabled={!isWithinLimit}
                                        className={cn(
                                          'w-full mt-auto py-3 rounded-lg font-semibold transition-all shadow-md text-base',
                                          p.isPopular ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-800 dark:text-white',
                                          p.isBestValue ? 'bg-green-500 hover:bg-green-600 text-white' : '',
                                          !isWithinLimit && 'opacity-50 cursor-not-allowed'
                                        )}
                                      >
                                          {!isWithinLimit ? 'Staff limit exceeded' : p.cta}
                                      </Button>
                                    </Link>

                                    <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
                                    
                                    <div className="space-y-2 text-sm">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">Features:</p>
                                        <ul className="space-y-3 text-sm mb-4">
                                            {p.mainFeatures.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-x-3 text-slate-600 dark:text-slate-400">
                                                    <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Separator className="my-6 bg-slate-300 dark:bg-slate-700" />
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">Usage Limits:</p>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-start gap-x-3 text-slate-600 dark:text-slate-400">
                                                <Users className="h-4 w-4 mt-1" />
                                                <span>{p.usageLimits.employees}</span>
                                            </li>
                                            <li className="flex items-start gap-x-3 text-slate-600 dark:text-slate-400">
                                                <Building className="h-4 w-4 mt-1"/>
                                                <span>{p.usageLimits.branches}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                </div>
                            )
                        })}
                    </div>
      
                    <div className="mt-16 bg-slate-100 dark:bg-slate-900 p-4 md:p-8 rounded-2xl">
                        <h2 className="text-3xl font-bold text-center mb-8">Full Feature Comparison</h2>
                        <Accordion type="single" collapsible className="w-full">
                            {featureComparison.map((feature, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{feature.name}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
                                            <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                <p className="font-semibold text-slate-600 dark:text-slate-300">Trial</p>
                                                {feature.trial ? <CheckIcon className="text-green-500" /> : <XMark className="text-red-500" />}
                                            </div>
                                            <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                <p className="font-semibold text-slate-600 dark:text-slate-300">Starter</p>
                                                {feature.starter ? <CheckIcon className="text-green-500" /> : <XMark className="text-red-500" />}
                                            </div>
                                            <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                <p className="font-semibold text-slate-600 dark:text-slate-300">Growth</p>
                                                {feature.growth ? <CheckIcon className="text-green-500" /> : <XMark className="text-red-500" />}
                                            </div>
                                            <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-slate-200 dark:bg-slate-700">
                                                <p className="font-semibold text-slate-600 dark:text-slate-300">Pro</p>
                                                {feature.pro ? <CheckIcon className="text-green-500" /> : <XMark className="text-red-500" />}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">Need a custom quote or on-premise version? <Link href="/contact" className="font-semibold text-primary hover:underline">Contact our team</Link> — we'll tailor it for your business.</p>
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

export default PricingPage;
