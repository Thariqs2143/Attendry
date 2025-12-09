
'use client';

import type { PropsWithChildren } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav, type NavItem } from '@/components/bottom-nav';
import Link from 'next/link';
import { EmployeeNav } from '@/components/employee-nav';
import { Bell, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as AppUser } from '@/app/admin/employees/page';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const employeeNavItems: NavItem[] = [
  { href: '/employee', label: 'Selfie', iconName: 'UserCheck' },
  { href: '/employee/scan', label: 'Scan QR', iconName: 'QrCode' },
  { href: '/employee/history', label: 'History', iconName: 'History' },
  { href: '/employee/leave', label: 'Leave', iconName: 'CalendarOff' },
  { href: '/employee/rewards', label: 'Rewards', iconName: 'Trophy' },
  { href: '/employee/profile', label: 'Profile', iconName: 'User' },
];

export default function EmployeeLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = mounted && currentTheme === 'dark' ? '/header-logo-dark.png' : '/header-logo-light.png';

  // Skip nav for auth/onboarding pages
  const isAuthPage =
    pathname === '/employee/login' || pathname === '/employee/complete-profile';

  useEffect(() => {
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
              const employeeData = { id: userDocSnap.id, ...userDocSnap.data() } as AppUser;

              // Fetch shop name if shopId exists
              if (employeeData.shopId) {
                  const shopDocRef = doc(db, "shops", employeeData.shopId);
                  const shopDocSnap = await getDoc(shopDocRef);
                  if(shopDocSnap.exists()) {
                      employeeData.shopName = shopDocSnap.data().shopName;
                  }
              }

              setUserProfile(employeeData);
          } else {
            router.replace('/employee/login');
          }
        } catch (error) {
          console.error("Error fetching employee profile for layout:", error);
          router.replace('/employee/login');
        } finally {
          setLoading(false);
        }
      } else {
        router.replace('/employee/login');
      }
    });

    return () => unsubscribe();
  }, [pathname, router, isAuthPage]);


  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!mounted) {
      return (
          <div className="flex min-h-screen w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <EmployeeNav navItems={employeeNavItems} profile={userProfile} />

      {/* Page content */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Mobile top header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden sticky top-0 z-40">
          <Link href="/employee">
            <Image src={logoSrc} alt="Attendry Logo" width={120} height={32} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/employee/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <BottomNav navItems={employeeNavItems} />
    </div>
  );
}
