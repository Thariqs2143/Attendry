
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  writeBatch,
  where,
  orderBy,
  Timestamp,
  addDoc,
} from 'firebase/firestore';
import { setHours, setMinutes, setSeconds, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Camera, CameraOff, LogIn, LogOut, LocateFixed, PartyPopper, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// Types
type ScanStatus = 'idle' | 'processing';

type AttendanceRecord = {
  id: string;
  checkInTime: Timestamp;
  checkOutTime?: Timestamp | null;
  status?: string;
};

type GamificationSettings = {
  onTimePoints: number;
  gracePeriodMinutes: number;
  lateCategory1Minutes: number;
  lateCategory1Points: number;
  lateCategory2Minutes: number;
  lateCategory2Points: number;
  lateCategory3Minutes: number;
  lateCategory3Points: number;
  absentMinutes: number;
  absentPoints: number;
  streakBonusDays: number;
  streakBonusPoints: number;
};

type ShopData = {
  latitude?: number;
  longitude?: number;
};

type AppUser = {
  uid: string;
  id?: string;
  name?: string;
  shopId?: string;
  points?: number;
  streak?: number;
};

// Helpers
const R = 6371e3; // metres
const toRad = (deg: number) => (deg * Math.PI) / 180;
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // meters
};

export default function FaceAttendancePage(): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);

  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const [showCamera, setShowCamera] = useState(false);

  const [activeCheckIn, setActiveCheckIn] = useState<AttendanceRecord | null>(null);
  const [hasCompletedDay, setHasCompletedDay] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [shopData, setShopData] = useState<ShopData | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkPermissions = useCallback(async () => {
    try {
      const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(cameraStatus.state);
      const locationStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(locationStatus.state);
    } catch (error) {
      console.warn("Permission status API not supported, falling back to prompt.", error);
      setCameraPermission('prompt');
      setLocationPermission('prompt');
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      toast({ variant: 'destructive', title: 'Camera permission denied', description: 'Please enable camera access in your browser settings.' });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowCamera(false);
  }, []);

  const captureFrameAsBlob = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < video.HAVE_METADATA) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  }, []);

  const uploadToCloudinary = useCallback(async (blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'attendry_uploads');

    const res = await fetch('https://api.cloudinary.com/v1_1/dkek6cset/image/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return (await res.json()).secure_url as string;
  }, []);

  const checkAttendanceStatusForToday = useCallback(async (employeeId: string, shopId: string) => {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      const q = query(
        collection(db, 'shops', shopId, 'attendance'),
        where('userId', '==', employeeId),
        where('checkInTime', '>=', todayStart),
        where('checkInTime', '<=', todayEnd),
        orderBy('checkInTime', 'desc'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const record = { id: snap.docs[0].id, ...snap.docs[0].data() } as AttendanceRecord;
        if (record.checkOutTime) {
          setHasCompletedDay(true);
          setActiveCheckIn(null);
        } else {
          setActiveCheckIn(record);
          setHasCompletedDay(false);
        }
      } else {
        setActiveCheckIn(null);
        setHasCompletedDay(false);
      }
    } catch (err) {
      console.error('checkAttendanceStatusForToday error', err);
    }
  }, []);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/employee/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) {
          router.push('/employee/login');
          return;
        }
        const profile = { uid: user.uid, ...(snap.data() as any) } as AppUser;
        setUserProfile(profile);
        if (profile.shopId) {
          await checkAttendanceStatusForToday(profile.uid, profile.shopId);
          const shopSnap = await getDoc(doc(db, 'shops', profile.shopId));
          if (shopSnap.exists()) {
            const data = shopSnap.data();
            setShopData({
                latitude: Number(data.latitude),
                longitude: Number(data.longitude)
            });
          }
        }
      } catch (err) {
        console.error('auth load error', err);
      }
    });

    return () => {
      unsub();
      stopCamera();
    };
  }, [router, checkAttendanceStatusForToday, stopCamera]);

  const handleCheckIn = useCallback(
    async (shopId: string, locationStatus: 'Verified' | 'Unverified', imageUrl: string) => {
      if (!userProfile) return;
      try {
        const shopConfigSnap = await getDoc(doc(db, 'shops', shopId, 'config', 'main'));
        const settings = shopConfigSnap.exists() ? shopConfigSnap.data() : {};
        const gamification: GamificationSettings = {
          onTimePoints: 10,
          gracePeriodMinutes: 5,
          lateCategory1Minutes: 10,
          lateCategory1Points: -1,
          lateCategory2Minutes: 30,
          lateCategory2Points: -2,
          lateCategory3Minutes: 60,
          lateCategory3Points: -3,
          absentMinutes: 60,
          absentPoints: -5,
          streakBonusDays: 5,
          streakBonusPoints: 50,
          ...(settings.gamification || {}),
        } as GamificationSettings;
        
        const businessHours = settings.businessHours || {};
        const todayKey = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
        const shiftStartTimeString = businessHours[todayKey]?.startTime || '09:30';
        
        const now = new Date();
        const [hours, minutes] = shiftStartTimeString.split(':').map(Number);
        const shiftStart = setSeconds(setMinutes(setHours(startOfDay(now), hours), minutes), 0);
        
        let attendanceStatus = 'On-time';
        let pointsChange = 0;
        let isLate = false;
        
        const timeDiffMinutes = (now.getTime() - shiftStart.getTime()) / 60000;

        if (timeDiffMinutes > gamification.gracePeriodMinutes) {
          isLate = true;
          if (timeDiffMinutes <= gamification.lateCategory1Minutes) {
              attendanceStatus = 'Late Category 1';
              pointsChange = gamification.lateCategory1Points;
          } else if (timeDiffMinutes <= gamification.lateCategory2Minutes) {
              attendanceStatus = 'Late Category 2';
              pointsChange = gamification.lateCategory2Points;
          } else if (timeDiffMinutes <= gamification.lateCategory3Minutes) {
              attendanceStatus = 'Late Category 3';
              pointsChange = gamification.lateCategory3Points;
          } else {
              attendanceStatus = 'Absent';
              pointsChange = gamification.absentPoints;
              isLate = false; // Absent is not "late" for the free pass logic
          }
        } else {
            attendanceStatus = 'On-time';
            pointsChange = gamification.onTimePoints;
        }
        
        if (isLate) {
            const monthStart = startOfMonth(now);
            const monthEnd = endOfMonth(now);
            const lateSnap = await getDocs(query(
              collection(db, 'shops', shopId, 'attendance'),
              where('userId', '==', userProfile.uid),
              where('checkInTime', '>=', monthStart),
              where('checkInTime', '<=', monthEnd),
              where('status', 'in', ['Late Category 1', 'Late Category 2', 'Late Category 3'])
            ));
            if (lateSnap.size < 3) {
              pointsChange = 0;
              toast({ title: 'Late allowance used', description: `This is your ${lateSnap.size + 1}/3 late entries for this month. No points deducted.` });
            }
        }

        const newStreak = attendanceStatus === 'On-time' ? (userProfile.streak || 0) + 1 : 0;
        
        const batch = writeBatch(db);
        const newAttendanceRef = doc(collection(db, 'shops', shopId, 'attendance'));
        const newAttendanceRecord = {
          userId: userProfile.uid, userName: userProfile.name, shopId,
          checkInTime: Timestamp.now(), status: attendanceStatus, checkOutTime: null,
          locationStatus, imageUrl, method: 'Selfie',
        };
        batch.set(newAttendanceRef, newAttendanceRecord);

        const newPoints = Math.max(0, (userProfile.points || 0) + pointsChange);
        const updateData: any = { points: newPoints, streak: newStreak };
        
        if (newStreak > 0 && newStreak % gamification.streakBonusDays === 0) {
          updateData.points += gamification.streakBonusPoints;
          toast({ title: 'Streak Bonus!', description: `+${gamification.streakBonusPoints} for your ${gamification.streakBonusDays}-day streak!` });
        }
        
        batch.update(doc(db, 'shops', shopId, 'employees', userProfile.uid), updateData);
        batch.update(doc(db, 'users', userProfile.uid), updateData);
        await batch.commit();

        setActiveCheckIn({ id: newAttendanceRef.id, checkInTime: newAttendanceRecord.checkInTime });
        setUserProfile((prev) => (prev ? { ...prev, ...updateData } : prev));
        toast({ title: 'Check-in Successful', description: `Marked as ${attendanceStatus}` });
        stopCamera();
      } catch (err) {
        console.error('handleCheckIn error', err);
        toast({ title: 'Check-in Failed', variant: 'destructive' });
      }
    },
    [toast, userProfile, stopCamera]
  );

  const handleCheckOut = useCallback(
    async (locationStatus: 'Verified' | 'Unverified', imageUrl: string) => {
      if (!userProfile?.shopId || !activeCheckIn) return;
      try {
        await updateDoc(doc(db, 'shops', userProfile.shopId, 'attendance', activeCheckIn.id), {
          checkOutTime: Timestamp.now(),
          checkoutLocationStatus: locationStatus,
          checkoutImageUrl: imageUrl,
          checkoutMethod: 'Selfie',
        });
        setActiveCheckIn(null);
        setHasCompletedDay(true);
        toast({ title: 'Check-out Successful', description: 'Have a great day!' });
        stopCamera();
      } catch (err) {
        console.error('handleCheckOut error', err);
        toast({ title: 'Check-out Failed', variant: 'destructive' });
      }
    },
    [userProfile, activeCheckIn, stopCamera, toast]
  );

  const handleLocationAndMarkAttendance = useCallback(() => {
    if (status === 'processing') return;
    setStatus('processing');
    toast({ title: 'Verifying location...' });

    if (!shopData || typeof shopData.latitude !== 'number' || typeof shopData.longitude !== 'number') {
      toast({ variant: 'destructive', title: 'Setup Error', description: 'Shop location is not configured.' });
      setStatus('idle');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const distance = getDistance(pos.coords.latitude, pos.coords.longitude, shopData.latitude!, shopData.longitude!);
          if (distance > 100) {
            toast({ variant: 'destructive', title: 'Location Mismatch', description: `You are ${Math.round(distance)}m away from the shop.` });
            setStatus('idle');
            return;
          }

          const blob = await captureFrameAsBlob();
          if (!blob) {
            toast({ variant: 'destructive', title: 'Capture Failed', description: 'Could not capture image from camera.' });
            setStatus('idle');
            return;
          }

          toast({ title: 'Uploading photo...' });
          const imageUrl = await uploadToCloudinary(blob);

          if (activeCheckIn) {
            await handleCheckOut('Verified', imageUrl);
          } else if (userProfile?.shopId) {
            await handleCheckIn(userProfile.shopId, 'Verified', imageUrl);
          }
        } catch (err) {
          console.error('attendance flow error', err);
          toast({ variant: 'destructive', title: 'Attendance Failed', description: 'Something went wrong. Try again.' });
        } finally {
          setStatus('idle');
        }
      },
      (err) => {
        console.error('Geolocation error', err);
        toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location.' });
        setStatus('idle');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [status, toast, shopData, captureFrameAsBlob, uploadToCloudinary, activeCheckIn, userProfile, handleCheckIn, handleCheckOut]);

  if (!userProfile) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const renderContent = () => {
    if (hasCompletedDay) {
      return (
        <div className="flex flex-col items-center gap-2 text-center p-8">
          <PartyPopper className="h-20 w-20 text-primary" />
          <p className="text-lg font-semibold">All Done for Today!</p>
          <p className="text-sm text-muted-foreground">You have already completed your attendance. See you tomorrow!</p>
        </div>
      );
    }
    
    if (cameraPermission !== 'granted' || locationPermission !== 'granted') {
      return (
          <div className="w-full p-4 text-center">
              <Alert variant="destructive">
                  <CameraOff className="h-4 w-4" />
                  <AlertTitle>Permissions Required</AlertTitle>
                  <AlertDescription>
                      This feature requires both Camera and Location access. Please enable them in your profile settings.
                  </AlertDescription>
              </Alert>
              <Link href="/employee/profile?tab=permissions">
                  <Button variant="link" className="mt-4">Go to Settings</Button>
              </Link>
          </div>
      );
    }
    
    if (showCamera) {
      return (
        <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-lg border-4 border-muted shadow-lg">
          <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      );
    }

    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="font-semibold text-lg">Ready to mark attendance?</p>
            <p className="text-sm text-muted-foreground mb-4">Click below to start your camera.</p>
            <Button onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Start Selfie Attendance
            </Button>
        </div>
    );
  };

  const getButtonAction = () => {
    if (showCamera) {
      handleLocationAndMarkAttendance();
    } else {
      startCamera();
    }
  }

  const getButtonText = () => {
    if (!showCamera) {
      return "Start Selfie Camera";
    }
    return activeCheckIn ? 'Mark Check-Out' : 'Mark Check-In';
  }

  const getButtonIcon = () => {
      if (status === 'processing') return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
      if (!showCamera) return <Camera className="mr-2 h-4 w-4" />;
      return activeCheckIn ? <LogOut className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {userProfile?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Use your face to mark your attendance.</p>
      </div>
      <Card className="w-full max-w-lg mx-auto transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground hover:border-primary">
        <CardHeader>
          <CardTitle>Selfie Attendance</CardTitle>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4 min-h-[300px]">
          {renderContent()}
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
          {(cameraPermission === 'granted' && locationPermission === 'granted') && !hasCompletedDay && (
            <>
              <Alert variant="default" className="border-primary/50 bg-primary/5 text-primary-foreground">
                <LocateFixed className="h-4 w-4" />
                <AlertTitle className="font-semibold text-primary">Location & Photo Verification</AlertTitle>
                <AlertDescription className="text-primary/90">Your location is verified, and a photo is captured for your manager's confirmation. No biometric data is stored.</AlertDescription>
              </Alert>
              <Button onClick={getButtonAction} size="lg" className="w-full" disabled={status !== 'idle'}>
                {getButtonIcon()}
                {getButtonText()}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      <div className="text-left text-muted-foreground mt-8 py-4">
        <div className="flex flex-col md:flex-row md:gap-x-4">
          <h1 className="text-5xl md:text-6xl font-extrabold">Earn</h1>
          <h1 className="text-5xl md:text-6xl font-extrabold">It Up !</h1>
        </div>
        <p className="text-sm mt-2">Crafted with ❤️ in TamilNadu, India</p>
      </div>
    </div>
  );
}
