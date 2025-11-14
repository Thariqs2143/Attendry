
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Trophy, LogOut, Save, Loader2, Bell, Edit, Building, Mail, Check, Crown, ArrowRight, CalendarDays, ShieldCheck, Gift, Upload, Copy, Share2, CheckCircle, Users, Briefcase, MapPin, Percent, Phone, User as UserIcon, Settings as SettingsIcon, PlusCircle, Trash2, Clock, X, XCircle } from "lucide-react";
import { auth, db, requestForToken, functions } from "@/lib/firebase";
import { signOut, onAuthStateChanged, type User as AuthUser } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, Suspense } from "react";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { User as AppUser } from '@/app/admin/employees/page';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSubscription } from "@/context/SubscriptionContext";
import { Progress } from "@/components/ui/progress";
import { httpsCallable } from "firebase/functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";

type ShopProfile = {
    ownerName: string;
    shopName: string;
    email?: string;
    businessType?: string;
    address?: string;
    gstNumber?: string;
    phone?: string;
}

type FullProfile = AppUser & ShopProfile;


const PricingPlans = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'threeYearly'>('yearly');
  const [currency, setCurrency] = useState<'inr' | 'usd'>('inr');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [staffCount, setStaffCount] = useState(10);
  const [profile, setProfile] = useState<Partial<FullProfile>>({});

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if(userSnap.exists()){
            setProfile(userSnap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

 const plans = [
    {
      id: 'trial',
      name: '14-Day Free Trial',
      price: { monthly: { inr: 0, usd: 0 }, yearly: { inr: 0, usd: 0 }, threeYearly: { inr: 0, usd: 0 } },
      plan_id: { monthly: { inr: 'dodo_trial_inr_monthly', usd: 'dodo_trial_usd_monthly' }, yearly: { inr: 'dodo_trial_inr_yearly', usd: 'dodo_trial_usd_yearly' }, threeYearly: { inr: 'dodo_trial_inr_3y', usd: 'dodo_trial_usd_3y' } },
      cta: 'Start Free Trial',
      highlight: 'Try our core features — absolutely free for 14 days.',
      mainFeatures: ['QR Code Check-in/out', 'Manual Attendance Entry', 'Live Attendance Dashboard', 'Easy Employee Onboarding'],
      usageLimits: { employees: 'Up to 5', branches: '1 Branch' }
    },
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: { inr: 49, usd: 0.99 }, yearly: { inr: 490, usd: 9.9 }, threeYearly: { inr: 999, usd: 19.9 } },
      plan_id: { monthly: { inr: 'pdt_spNpTEoFNYNJeeDRynUQ8', usd: 'pdt_dmNNjfR8pdHmyUQaTPCpY' }, yearly: { inr: 'pdt_EFOn69ZCJERTASlzUQUZU', usd: 'pdt_SrsybYaHr0AG5GXnnLO7S' }, threeYearly: { inr: 'pdt_WmVUxyEFB5KQ2IAANYvMY', usd: 'pdt_LjaIX4I73QjSUiPXS6Z6T' } },
      cta: 'Choose Starter',
      highlight: 'For new & small businesses just getting started.',
      mainFeatures: ['QR Code Check-in/out', 'Manual Attendance Entry', 'Live Attendance Dashboard', 'Easy Employee Onboarding'],
      usageLimits: { employees: 'Up to 20 employees', branches: '1 Branch' }
    },
    {
      id: 'growth',
      name: 'Growth',
      price: { monthly: { inr: 79, usd: 1.49 }, yearly: { inr: 790, usd: 14.9 }, threeYearly: { inr: 1599, usd: 29.9 } },
      plan_id: { monthly: { inr: 'pdt_Kj7IT4XwRq5yNLM0vTD1K', usd: 'pdt_NirzUFWWDLEo4dX9wChQ4' }, yearly: { inr: 'pdt_zPZO12RXBToia4vKfI38w', usd: 'pdt_ShbPLJXhOwscGjWiH3m5F' }, threeYearly: { inr: 'pdt_yygvHhLfFxutXYzJNKZta', usd: 'pdt_nmV6qydnrp3JHisHtXopM' } },
      cta: 'Upgrade to Growth',
      highlight: 'For growing businesses that need more control.',
      isPopular: true,
      mainFeatures: ['All Starter features', 'Priority Support', 'Advanced Reports & Analytics', 'Multi-branch Dashboard'],
      usageLimits: { employees: 'Up to 50 employees', branches: 'Up to 5 Branches' }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: { inr: 129, usd: 2.49 }, yearly: { inr: 1290, usd: 24.9 }, threeYearly: { inr: 2999, usd: 49.9 } },
      plan_id: { monthly: { inr: 'pdt_AjNgvBP5e39dQr06SiXHT', usd: 'pdt_eWUBiKEfh4hyphK51X7Wo' }, yearly: { inr: 'pdt_VyNauKVSHfPhcSPQSLqMU', usd: 'pdt_YH8gajeq3KOfojCJcB8QB' }, threeYearly: { inr: 'pdt_UOnolPQtwuviXPBirTgNE', usd: 'pdt_EF34N9kllxfUbzgi7EKah' } },
      cta: 'Upgrade to Pro',
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
    { name: 'Export Reports (PDF / Excel)', trial: true, starter: true, growth: true, pro: true },
    { name: 'Muster Roll Generation', trial: true, starter: true, growth: true, pro: true },
    { name: 'Automated Payroll Calculation', trial: true, starter: true, growth: true, pro: true },
    { name: 'Points & Rewards System', trial: true, starter: true, growth: true, pro: true },
    { name: 'Punctuality Leaderboard', trial: true, starter: true, growth: true, pro: true },
    { name: 'Multi-Branch Support', trial: false, starter: false, growth: true, pro: true },
    { name: 'Staff Transfer Between Branches', trial: false, starter: false, growth: true, pro: true },
    { name: 'AI-Powered Weekly Briefing', trial: true, starter: false, growth: false, pro: true },
    { name: 'Smart Staffing Advisor (AI)', trial: true, starter: false, growth: false, pro: true },
    { name: 'Customizable Alerts & Notifications', trial: false, starter: false, growth: false, pro: true },
  ];

  const handlePayment = async (plan: typeof plans[0]) => {
    if (!profile || !profile.uid) {
        toast({ title: "Please Login", description: "You must be logged in to subscribe.", variant: "destructive" });
        router.push('/login');
        return;
    }
    
    const planId = plan.plan_id[billingCycle][currency];
    if (!planId) {
        toast({ title: "Error", description: "This plan is not available for purchase yet.", variant: "destructive" });
        return;
    }

    setLoadingPlan(plan.id);
    
    const options = {
      key: process.env.NEXT_PUBLIC_DODO_KEY_ID,
      subscription_id: planId,
      quantity: staffCount,
      name: "Attendry Subscription",
      description: `Billing for ${plan.name} - ${billingCycle} (${currency.toUpperCase()})`,
      image: "https://res.cloudinary.com/dnkghymx5/image/upload/v1721992194/logo-sm_scak0f.png",
      handler: async (response: any) => {
          try {
              const verifySubscription = httpsCallable(functions, 'verifySubscriptionPayment');
              await verifySubscription({
                  paymentId: response.dodo_payment_id,
                  subscriptionId: response.dodo_subscription_id,
                  signature: response.dodo_signature,
                  shopId: profile.uid,
                  planName: plan.name,
              });

              toast({
                  title: "Subscription Activated!",
                  description: `You are now on the ${plan.name} plan.`,
              });
               router.push('/admin');
          } catch (error: any) {
              console.error("Verification failed:", error);
              toast({ title: "Verification Failed", description: error.message || "Could not verify your payment. Please contact support.", variant: "destructive" });
          } finally {
              setLoadingPlan(null);
          }
      },
      prefill: {
          name: profile.name,
          email: profile.email,
          contact: profile.phone,
      },
      theme: {
          color: "#0C2A6A"
      }
    };
    
    console.log("Initiating DodoPay with options:", options);
    setTimeout(() => {
        toast({ title: "Demo Flow", description: "Payment gateway would open here."});
        setLoadingPlan(null);
    }, 1500);
  }

  const currencySymbol = currency === 'inr' ? '₹' : '$';
  const cycleText = billingCycle === 'monthly' ? '/month' : billingCycle === 'yearly' ? '/year' : '/3-years';
  const CheckIcon = ({ className = 'w-5 h-5' }) => <Check className={cn("text-emerald-500", className)} />;
  const XMark = ({ className = 'w-5 h-5' }) => <X className={cn("text-gray-400 dark:text-gray-600", className)} />;


  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
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
                    'relative rounded-2xl p-6 flex flex-col h-full bg-slate-800 border-2 shadow-lg transition-all duration-300',
                    !isWithinLimit && 'opacity-60 bg-slate-900',
                    p.isPopular ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-700',
                    p.isBestValue ? 'border-green-500 shadow-green-500/20' : 'border-slate-700',
                )}>
                  {p.isPopular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10"><div className="px-4 py-1 text-sm font-semibold rounded-full bg-blue-500 text-white shadow-md">TOP CHOICE</div></div>}
                  {p.isBestValue && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10"><div className="px-4 py-1 text-sm font-semibold rounded-full bg-green-500 text-white shadow-md">SPECIAL OFFER</div></div>}
                  <div className="flex-1 text-white">
                      <h3 className="text-2xl font-semibold text-center">{p.name}</h3>
                      <p className="text-sm text-slate-400 mt-2 mb-6 h-10 text-center">{p.highlight}</p>
                      
                      <div className="mb-6 text-center">
                          <div className="flex flex-col items-center">
                              {p.id === 'trial' ? (
                                  <span className="text-5xl font-extrabold">
                                      <span className="text-3xl align-top">{currencySymbol}</span>
                                      <span className="break-all">0</span>
                                  </span>
                              ) : (
                                  <span className="text-5xl font-extrabold">
                                      <span className="text-3xl align-top">{currencySymbol}</span>
                                      <span className="break-all">{currency === 'inr' ? Math.round(finalPrice) : finalPrice.toFixed(2)}</span>
                                  </span>
                              )}
                              <p className="text-sm text-slate-400">{cycleText}</p>
                          </div>
                          {p.id !== 'trial' && <p className="text-xs text-slate-500 mt-1">(billed per employee)</p>}
                      </div>
                      
                      <Button
                        onClick={() => handlePayment(p)}
                        disabled={loadingPlan === p.id || !isWithinLimit}
                        className={cn(
                          'w-full mt-auto py-3 rounded-lg font-semibold text-slate-900 transition-all shadow-md text-base',
                          p.isPopular ? 'bg-blue-400 hover:bg-blue-500' : 'bg-slate-200 hover:bg-white',
                          p.isBestValue ? 'bg-green-400 hover:bg-green-500' : '',
                          (loadingPlan === p.id || !isWithinLimit) && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                          {loadingPlan === p.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                          {!isWithinLimit ? 'Staff limit exceeded' : (profile?.uid ? p.cta : 'Get Started')}
                      </Button>

                      <Separator className="my-6 bg-slate-700" />
                      
                      <div className="space-y-2 text-sm">
                          <p className="font-semibold text-slate-300">Features:</p>
                          <ul className="space-y-3 text-sm mb-4">
                              {p.mainFeatures.map((feature, i) => (
                                  <li key={i} className="flex items-start gap-x-3 text-slate-400">
                                      <CheckIcon className="w-5 h-5 text-green-400 mt-0.5" />
                                      <span>{feature}</span>
                                  </li>
                              ))}
                          </ul>
                          <Separator className="my-6 bg-slate-700" />
                          <p className="font-semibold text-slate-300">Usage Limits:</p>
                          <ul className="space-y-3 text-sm">
                              <li className="flex items-start gap-x-3 text-slate-400">
                                  <Users className="h-4 w-4 mt-1" />
                                  <span>{p.usageLimits.employees}</span>
                              </li>
                              <li className="flex items-start gap-x-3 text-slate-400">
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
      
      <div className="mt-16 bg-slate-900 text-white p-4 md:p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">Full Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-4 px-2 md:px-4 font-semibold text-slate-300 min-w-[200px] md:min-w-[250px]">Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className="py-4 px-2 md:px-4 font-semibold text-center text-slate-300">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureComparison.map((feature, index) => (
                <tr key={index} className="border-b border-slate-800">
                  <td className="py-4 px-2 md:px-4 text-sm text-slate-400">{feature.name}</td>
                  <td className="py-4 px-2 md:px-4 text-center">
                    {feature.trial ? <CheckIcon /> : <XMark />}
                  </td>
                   <td className="py-4 px-2 md:px-4 text-center">
                    {feature.starter ? <CheckIcon /> : <XMark />}
                  </td>
                  <td className="py-4 px-2 md:px-4 text-center">
                    {feature.growth ? <CheckIcon /> : <XMark />}
                  </td>
                  <td className="py-4 px-2 md:px-4 text-center">
                    {feature.pro ? <CheckIcon /> : <XMark />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-sm text-slate-400 mt-8">Need a custom quote or on-premise version? <Link href="/contact" className="font-semibold text-primary hover:underline">Contact our team</Link> — we'll tailor it for your business.</p>
      </div>

    </div>
  );
};


export default function PricingPage() {
    return (
        <div className="pt-16 md:pt-24">
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                <PricingPlans />
            </Suspense>
        </div>
    )
}

    

    
