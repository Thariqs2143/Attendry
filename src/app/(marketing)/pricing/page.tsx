
'use client';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);

  const features = [
    'QR Code Check-in/out',
    'Selfie Attendance',
    'Manual Attendance Entry',
    'Live Attendance Dashboard',
    'Multi-Branch Support',
    'Employee Profiles',
    'Easy Employee Onboarding',
    'Staff Transfer Between Branches',
    'Detailed Attendance Reports',
    'Muster Roll Generation',
    'Automated Payroll Calculation',
    'Export Reports (PDF / Excel)',
    'Points & Rewards System',
    'Punctuality Leaderboard',
    'Achievement Badges',
    'AI-Powered Weekly Briefing',
    'Smart Staffing Advisor (AI)',
    'Platform Announcements',
    'Shop-level Announcements',
    'Custom Work Shifts',
    'Permission Management',
    'Dark/Light Mode',
    'PWA for Mobile'
  ];

  const plans = [
    {
      id: 'trial',
      name: 'Free Trial',
      monthly: 0,
      yearly: 0,
      note: '/14 days',
      cta: 'Start Free Trial',
      employees: '5',
      branches: '1',
      included: new Set([
        'QR Code Check-in/out',
        'Selfie Attendance',
        'Manual Attendance Entry',
        'Live Attendance Dashboard',
        'Employee Profiles',
        'Easy Employee Onboarding',
        'Detailed Attendance Reports',
        'Export Reports (PDF / Excel)',
        'Points & Rewards System',
        'Punctuality Leaderboard',
        'Platform Announcements',
        'Shop-level Announcements',
        'Custom Work Shifts',
        'Permission Management',
        'Dark/Light Mode',
        'PWA for Mobile'
      ]),
      highlight: 'Try main features for 14 days',
      accent: 'from-blue-500 to-sky-500'
    },
    {
      id: 'growth',
      name: 'Growth',
      monthly: 499,
      yearly: 4999,
      note: '',
      cta: 'Upgrade to Growth',
      employees: '50',
      branches: '5',
      included: new Set([
        ...features.filter(f => ![
            'Smart Staffing Advisor (AI)',
        ].includes(f)),
      ]),
      highlight: 'Most popular for SMBs',
      accent: 'from-primary to-blue-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      monthly: 999,
      yearly: 9999,
      note: '',
      cta: 'Upgrade to Pro',
      employees: 'Unlimited',
      branches: 'Unlimited',
      included: new Set(features),
      highlight: 'For large multi-branch organizations',
      accent: 'from-purple-600 to-indigo-600'
    }
  ];

  const CheckIcon = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.5 10.5L8.2 14.2L15.5 6.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const XMark = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Start free, explore every feature, and upgrade when you’re ready.</p>
        <div className="mt-6 flex justify-center items-center gap-3">
          <span className={`text-sm font-medium ${!isYearly ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>Monthly</span>
           <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                aria-label="Toggle yearly pricing"
            />
          <span className={`text-sm font-medium ${isYearly ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>Yearly <span className="text-green-600 dark:text-green-400 font-semibold">(Save ~15%)</span></span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 mb-14">
        {plans.map((p) => (
          <div key={p.id} className={`relative rounded-3xl shadow-lg border ${p.id === 'growth' ? 'border-primary' : 'border-border'} bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
            {p.id === 'growth' && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 text-sm font-semibold rounded-full bg-primary text-primary-foreground shadow-lg">
                        MOST POPULAR
                    </div>
                </div>
            )}
            <div className="p-8 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.highlight}</p>
                </div>
              </div>

              <div className="mb-6">
                {p.monthly === null ? (
                  <span className="text-4xl font-extrabold text-foreground">Custom</span>
                ) : (
                  <>
                    <div className="flex items-baseline gap-x-2">
                      <span className="text-4xl font-extrabold text-foreground">₹{isYearly ? p.yearly.toLocaleString('en-IN') : p.monthly.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-muted-foreground">{p.id === 'trial' ? p.note : isYearly ? '/year' : '/month'}</span>
                    </div>
                    {p.id !== 'trial' && isYearly && (
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Originally ₹{(p.monthly * 12).toLocaleString('en-IN')} per year</p>
                    )}
                  </>
                )}
                <div className="mt-2 text-sm text-muted-foreground">Up to {p.employees} employees • {p.branches} {p.branches === '1' ? 'branch' : 'branches'}</div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {p.included.size > 10 ? (
                    <>
                        {Array.from(p.included).slice(0, 5).map((f) => (
                             <li key={f} className="flex items-start gap-x-3 text-sm">
                                <CheckIcon className="text-emerald-500 w-5 h-5 mt-0.5 shrink-0" />
                                <span className="text-foreground">{f}</span>
                            </li>
                        ))}
                         <li className="text-sm text-primary font-medium pl-8">and {p.included.size - 5} more features...</li>
                    </>
                ) : (
                    Array.from(p.included).map((f) => (
                        <li key={f} className="flex items-start gap-x-3 text-sm">
                            <CheckIcon className="text-emerald-500 w-5 h-5 mt-0.5 shrink-0" />
                            <span className="text-foreground">{f}</span>
                        </li>
                    ))
                )}
              </ul>

              <Button className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${p.accent} hover:opacity-90 transition-all shadow-md`}>{p.cta}</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-x-auto shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Feature</th>
              {plans.map((p) => (
                <th key={p.id} className="px-6 py-3 text-center text-sm font-semibold text-foreground">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {features.map((f) => (
              <tr key={f} className="hover:bg-muted/50 transition">
                <td className="px-6 py-4 text-sm text-foreground w-64">{f}</td>
                {plans.map((p) => (
                  <td key={p.id} className="px-6 py-4 text-center">
                    {p.included.has(f) ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"><CheckIcon className="w-5 h-5" /></span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500"><XMark className="w-5 h-5" /></span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 text-center text-sm text-muted-foreground">
        <p>Need a custom quote or on-premise version? <a href="/contact" className="text-primary font-semibold hover:underline">Contact our team</a> — we’ll tailor it for your business.</p>
      </div>
    </div>
  );
};

export default PricingPlans;
