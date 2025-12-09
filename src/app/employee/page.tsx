
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, CameraOff, LogIn, LogOut, PartyPopper, LocateFixed } from "lucide-react";
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, writeBatch, Timestamp, query, where, getDocs, limit } from 'firebase/firestore';
import type { User as AppUser } from '@/app/admin/employees/page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { setHours, setMinutes, setSeconds, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { verifyFace } from '@/ai/flows/verify-face-flow';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'processing';
type AttendanceRecord = {
    id: string;
    checkInTime: Timestamp;
    checkOutTime?: Timestamp;
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
    latitude?: string;
    longitude?: string;
};

// Haversine formula to calculate distance between two lat/lon points
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

export default function FaceAttendancePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeCheckIn, setActiveCheckIn] = useState<AttendanceRecord | null>(null);
  const [hasCompletedDay, setHasCompletedDay] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [shopData, setShopData] = useState<ShopData | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const checkAttendanceStatusForToday = useCallback(async (employeeId: string, shopId: string) => {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const attendanceQuery = query(
        collection(db, 'shops', shopId, 'attendance'),
        where('userId', '==', employeeId),
        where('checkInTime', '>=', todayStart),
        where('checkInTime', '<=', todayEnd),
        limit(1)
    );
    const snapshot = await getDocs(attendanceQuery);
    if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const record = { id: docSnap.id, ...docSnap.data() } as AttendanceRecord;
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
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const profile = { id: userDocSnap.id, ...userDocSnap.data(), uid: user.uid } as AppUser;
            setUserProfile(profile);
            if(profile.shopId){
                await checkAttendanceStatusForToday(profile.uid, profile.shopId);
                const shopDocRef = doc(db, 'shops', profile.shopId);
                const shopSnap = await getDoc(shopDocRef);
                if (shopSnap.exists()) {
                    setShopData(shopSnap.data() as ShopData);
                }
            }
        } else {
            router.push('/employee/login');
        }
      } else {
        router.push('/employee/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, checkAttendanceStatusForToday]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus('idle');
  }, []);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        streamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use face attendance.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
      stopCamera();
    };
  }, [stopCamera, toast]);
  
  const captureFrame = (): string | null => {
      if (!videoRef.current) return null;
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return null;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg');
  };

  const handleLocationAndMarkAttendance = async () => {
      setStatus('processing');
      toast({ title: 'Getting your location...' });

      if (!shopData?.latitude || !shopData?.longitude) {
          toast({ variant: 'destructive', title: 'Setup Error', description: 'Shop location is not set. Please contact your admin.' });
          setStatus('error');
          return;
      }

      navigator.geolocation.getCurrentPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              const shopLat = parseFloat(shopData.latitude!);
              const shopLon = parseFloat(shopData.longitude!);
              
              const distance = getDistance(latitude, longitude, shopLat, shopLon);

              if (distance > 100) { // 100 meters radius
                  toast({ variant: 'destructive', title: 'Location Mismatch', description: `You must be within 100 meters of the shop to mark attendance. You are ${Math.round(distance)}m away.`});
                  setStatus('error');
                  return;
              }

              toast({ title: 'Location Verified!', description: 'Now verifying your face...' });
              await handleMarkAttendance('Verified');
          },
          (error) => {
              console.error("Geolocation error:", error);
              toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please enable location services and try again.' });
              setStatus('error');
          },
          { enableHighAccuracy: true }
      );
  };
  
  const handleMarkAttendance = async (locationStatus: 'Verified' | 'Unverified') => {
    if (!userProfile?.uid || !userProfile?.shopId) return;

    const capturedImage = captureFrame();
    if (!capturedImage) {
        toast({ title: 'Capture Failed', description: 'Could not capture image from camera.', variant: 'destructive' });
        setStatus('error');
        return;
    }

    if (!userProfile.faceIdImageUrl) {
        toast({ title: 'Setup Required', description: 'Your Face ID is not set up. Please go to your profile to add it.', variant: 'destructive' });
        setStatus('error');
        return;
    }

    try {
        const { isSamePerson } = await verifyFace({
            capturedPhotoDataUri: capturedImage,
            referencePhotoUrl: userProfile.faceIdImageUrl,
        });

        if (!isSamePerson) {
            toast({ title: 'Face Mismatch', description: 'The face captured does not match your profile. Please try again.', variant: 'destructive' });
            setStatus('error');
            return;
        }

        toast({ title: 'Face Verified!', description: 'Finalizing attendance...' });

        if (activeCheckIn) {
            await handleCheckOut(locationStatus);
        } else {
            await handleCheckIn(userProfile.shopId, locationStatus);
        }
    } catch (aiError) {
        console.error("AI Face Verification Error:", aiError);
        toast({ title: 'AI Error', description: 'Could not verify face. Please try again.', variant: 'destructive' });
        setStatus('error');
    }
  };

  const handleCheckIn = async (shopId: string, locationStatus: 'Verified' | 'Unverified') => {
    if (!userProfile?.uid) return;

    const shopConfigRef = doc(db, 'shops', shopId, 'config', 'main');
    const shopConfigSnap = await getDoc(shopConfigRef);
    const settings = shopConfigSnap.exists() ? shopConfigSnap.data() : {};
    const gamification: GamificationSettings = {
        onTimePoints: 1, gracePeriodMinutes: 5,
        lateCategory1Minutes: 10, lateCategory1Points: -1,
        lateCategory2Minutes: 30, lateCategory2Points: -2,
        lateCategory3Minutes: 60, lateCategory3Points: -3,
        absentMinutes: 60, absentPoints: -5,
        streakBonusDays: 5, streakBonusPoints: 50,
        ...settings.gamification
    };

    const businessHours = settings.businessHours || {};
    const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const shiftStartTimeString = businessHours[today]?.startTime || '09:30';

    const now = new Date();
    const [hours, minutes] = shiftStartTimeString.split(':');
    const shiftStartTime = setSeconds(setMinutes(setHours(startOfDay(now), parseInt(hours)), parseInt(minutes)), 0);

    let attendanceStatus: string = 'On-time';
    let pointsChange = 0;
    let isLate = false;

    const timeDiffMinutes = (now.getTime() - shiftStartTime.getTime()) / (1000 * 60);

    if (timeDiffMinutes <= 0) {
        attendanceStatus = 'On-time';
        pointsChange = gamification.onTimePoints;
    } else if (timeDiffMinutes <= gamification.gracePeriodMinutes) {
        attendanceStatus = 'Grace Period';
        pointsChange = 0;
    } else {
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
            isLate = false;
        }
    }
    
    if (isLate) {
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const lateQuery = query(
            collection(db, 'shops', shopId, 'attendance'),
            where('userId', '==', userProfile.uid),
            where('checkInTime', '>=', monthStart),
            where('checkInTime', '<=', monthEnd),
            where('status', 'in', ['Late Category 1', 'Late Category 2', 'Late Category 3'])
        );
        const lateSnapshot = await getDocs(lateQuery);
        const monthlyLateCount = lateSnapshot.size;

        if (monthlyLateCount < 3) {
            pointsChange = 0;
            toast({ title: 'Late Entry Allowance Used', description: `This is your ${monthlyLateCount + 1}/3 late entry this month. No points deducted.`});
        }
    }
    
    const newStreak = (attendanceStatus === 'On-time' || attendanceStatus === 'Grace Period') ? (userProfile.streak || 0) + 1 : 0;

    const batch = writeBatch(db);
    const newAttendanceRef = doc(collection(db, 'shops', shopId, 'attendance'));
    const newAttendanceRecord = {
        userId: userProfile.uid,
        userName: userProfile.name,
        shopId: shopId,
        checkInTime: Timestamp.now(),
        status: attendanceStatus,
        checkOutTime: null,
        locationStatus,
    };
    batch.set(newAttendanceRef, newAttendanceRecord);
    
    const employeeDocRef = doc(db, 'shops', shopId, 'employees', userProfile.uid);
    const newPoints = (userProfile.points || 0) + pointsChange;
    let updateData: any = {
        points: newPoints < 0 ? 0 : newPoints,
        streak: newStreak
    };
    
    if (newStreak > 0 && newStreak % gamification.streakBonusDays === 0) {
        updateData.points += gamification.streakBonusPoints;
        toast({ title: 'Streak Bonus!', description: `+${gamification.streakBonusPoints} bonus points for your ${gamification.streakBonusDays}-day streak!` });
    }

    batch.update(employeeDocRef, updateData);
    await batch.commit();
    
    setActiveCheckIn({ id: newAttendanceRef.id, ...newAttendanceRecord });
    setUserProfile(prev => prev ? {...prev, ...updateData} : null);

    setStatus('success');
    toast({ title: 'Check-in Successful!', description: `You have been marked as ${attendanceStatus}.` });
  };
  
  const handleCheckOut = async (locationStatus: 'Verified' | 'Unverified') => {
    if (!userProfile?.shopId || !activeCheckIn) return;
    
    const attendanceDocRef = doc(db, 'shops', userProfile.shopId, 'attendance', activeCheckIn.id);
    await updateDoc(attendanceDocRef, {
        checkOutTime: Timestamp.now(),
        locationStatus: locationStatus
    });

    setActiveCheckIn(null);
    setHasCompletedDay(true);
    setStatus('success');
    toast({ title: 'Check-out Successful!', description: 'Have a great day!' });
  };

  const renderStatus = () => {
    if (status === 'success' || status === 'error') {
        setTimeout(() => setStatus('idle'), 3000);
    }

    switch(status) {
      case 'success':
        return (
          <div className="flex flex-col items-center gap-4 text-center text-green-600">
            <CheckCircle className="h-20 w-20" />
            <p className="font-bold text-xl">Success!</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center gap-4 text-center text-destructive">
            <XCircle className="h-20 w-20" />
            <p className="font-bold text-xl">Verification Failed</p>
            <p className="text-sm text-muted-foreground">Please try again. Make sure you are in a well-lit area.</p>
          </div>
        );
      case 'processing':
          return (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-20 w-20 animate-spin text-primary" />
              <p className="font-bold text-xl">Processing...</p>
              <p className="text-sm text-muted-foreground">Verifying your identity and location.</p>
            </div>
          );
      case 'idle':
      default:
        if (hasCompletedDay) {
            return (
                <div className="flex flex-col items-center gap-2 text-center">
                    <PartyPopper className="h-20 w-20 text-primary" />
                    <p className="text-lg font-semibold">All Done for Today!</p>
                    <p className="text-sm text-muted-foreground">You have already completed your attendance. See you tomorrow!</p>
                </div>
            )
        }
        if (activeCheckIn) {
            return (
                 <div className="flex flex-col items-center gap-2 text-center">
                     <LogIn className="h-20 w-20 text-green-500" />
                     <p className="text-lg font-semibold">You are checked in!</p>
                     <p className="text-sm text-muted-foreground">Checked in at: {activeCheckIn.checkInTime.toDate().toLocaleTimeString()}</p>
                 </div>
            )
        }
        return (
          <div className="flex flex-col items-center gap-2 text-center">
             <p className="text-lg font-semibold">Ready to start your day?</p>
             <p className="text-sm text-muted-foreground">Center your face in the camera to mark attendance.</p>
          </div>
        )
    }
  }

  if (loading || !userProfile) {
     return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {userProfile?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Use your face to mark your attendance.</p>
      </div>
      <Card className="w-full max-w-lg mx-auto transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground hover:border-primary">
        <CardHeader>
          <CardTitle>Face Attendance</CardTitle>
          <CardDescription>{currentDate}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-4 min-h-[300px]">
          {status !== 'idle' ? renderStatus() : (
              <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-lg border-4 border-muted shadow-lg">
                <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
                {!hasCameraPermission && status === 'idle' && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-4">
                        <CameraOff className="h-10 w-10 mb-4"/>
                        <p className="font-semibold">Camera Access Required</p>
                        <p className="text-sm text-center">Please allow camera access to use this feature.</p>
                    </div>
                )}
              </div>
          )}
        </CardContent>
         <CardFooter className="flex-col gap-4 pt-6">
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Camera Permission Denied</AlertTitle>
                    <AlertDescription>
                        You must allow camera access in your browser settings to use face attendance.
                    </AlertDescription>
                </Alert>
            )}
            <Button onClick={handleLocationAndMarkAttendance} size="lg" className="w-full" disabled={status !== 'idle' || hasCompletedDay || !hasCameraPermission}>
               {status === 'processing' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
               {activeCheckIn ? <LogOut className="mr-2 h-4 w-4"/> : <LocateFixed className="mr-2 h-4 w-4"/>}
               {activeCheckIn ? 'Mark Check-Out' : 'Mark Check-In'}
            </Button>
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
