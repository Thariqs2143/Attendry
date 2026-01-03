'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function RootPage() {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect to the login page after a short delay to show the splash
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 1500); // 1.5-second splash screen

    return () => clearTimeout(timer);
  }, [router]);

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = mounted && currentTheme === 'dark' ? '/header-logo-dark.png' : '/header-logo-light.png';

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="animate-pulse">
        {mounted ? (
          <Image src={logoSrc} alt="Attendry Logo" width={250} height={67} priority />
        ) : (
          <div style={{ width: 250, height: 67 }} />
        )}
      </div>
    </div>
  );
}
