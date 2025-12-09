
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Camera, CameraOff, LogIn, LogOut, PartyPopper, LocateFixed } from "lucide-react";
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, addDoc, collection, writeBatch, Timestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { setHours, setMinutes, setSeconds, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import type { User as AppUser } from '@/app/admin/employees/page';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';


type ScanStatus = 'idle' | 'scanning' | 'success' | 'error' | 'processing';
type PermissionStatus = 'prompt' | 'granted' | 'denied';


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
  
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('prompt');
  const [locationPermission, setLocationPermission] = useState<PermissionStatus>('prompt');
  
  const [activeCheckIn, setActiveCheckIn] = useState<AttendanceRecord | null>(null);
  const [hasCompletedDay, setHasCompletedDay] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [shopData, setShopData] = useState<ShopData | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraPermission('granted');
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraPermission('denied');
    }
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
  
  // Main effect for auth and profile fetching
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

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
    });

    return () => {
      unsubscribe();
      stopCamera();
    };
  }, [router, checkAttendanceStatusForToday, stopCamera]);

  // Effect for checking and handling permissions
  useEffect(() => {
    const checkAndRequestPermissions = async () => {
        try {
            const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
            setCameraPermission(cameraStatus.state);
            
            const locationStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            setLocationPermission(locationStatus.state);

            if (cameraStatus.state === 'granted') {
                if (!hasCompletedDay) {
                    startCamera();
                }
            }
            
            cameraStatus.onchange = () => {
                setCameraPermission(cameraStatus.state);
                if(cameraStatus.state === 'granted' && !hasCompletedDay) startCamera();
                else stopCamera();
            };
            locationStatus.onchange = () => setLocationPermission(locationStatus.state);

        } catch (error) {
            console.error("Error checking permissions:", error);
            setCameraPermission('prompt');
            setLocationPermission('prompt');
        }
    };
    checkAndRequestPermissions();
    
    return () => stopCamera();
  }, [startCamera, stopCamera, hasCompletedDay]);

  const requestPermissions = async () => {
    let locGranted = locationPermission === 'granted';

    if (cameraPermission === 'prompt') {
      try {
        await startCamera();
      } catch (err) {
        // startCamera already handles setting denied state
      }
    }

    if (locationPermission === 'prompt') {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        locGranted = true;
        setLocationPermission('granted');
      } catch (err) {
        setLocationPermission('denied');
      }
    }
  };


  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState >= 3) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  }, []);

  const uploadImage = async (dataUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', dataUri);
    formData.append('upload_preset', 'attendry_uploads');

    const response = await fetch('https://api.cloudinary.com/v1_1/dkek6cset/image/upload', {
        method: 'POST',
        body: formData,
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload error:', errorText);
        throw new Error('Image upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleLocationAndMarkAttendance = async () => {
      setStatus('processing');
      toast({ title: 'Capturing image and getting location...' });

      const imageDataUri = captureFrame();
      if (!imageDataUri) {
          toast({ variant: 'destructive', title: 'Capture Failed', description: 'Could not capture image from camera.' });
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
          return;
      }
      
      if (!shopData?.latitude || !shopData?.longitude) {
          toast({ variant: 'destructive', title: 'Setup Error', description: 'Shop location is not set. Please contact your admin.' });
          setStatus('error');
          setTimeout(() => setStatus('idle'), 3000);
          return;
      }

      navigator.geolocation.getCurrentPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              const shopLat = parseFloat(shopData.latitude!);
              const shopLon = parseFloat(shopData.longitude!);
              
              const distance = getDistance(latitude, longitude, shopLat, shopLon);

              if (distance > 100) { // 100 meters radius
                  toast({ variant: 'destructive', title: 'Location Mismatch', description: `You are too far from the shop. You are ${Math.round(distance)}m away.`});
                  setStatus('error');
                  setTimeout(() => setStatus('idle'), 3000);
                  return;
              }

              toast({ title: 'Location Verified!', description: 'Finalizing attendance...' });

              try {
                const imageUrl = await uploadImage(imageDataUri);
                 if (activeCheckIn) {
                    await handleCheckOut('Verified', imageUrl);
                  } else {
                    if(userProfile?.shopId) {
                      await handleCheckIn(userProfile.shopId, 'Verified', imageUrl);
                    }
                  }
              } catch (e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload attendance image.' });
                setStatus('error');
                setTimeout(() => setStatus('idle'), 3000);
              }
          },
          (error) => {
              console.error("Geolocation error:", error);
              toast({ variant: 'destructive', title: 'Location Error', description: 'Could not get your location. Please try again.' });
              setStatus('error');
              setTimeout(() => setStatus('idle'), 3000);
          },
          { enableHighAccuracy: true }
      );
  };

  const handleCheckIn = async (shopId: string, locationStatus: 'Verified' | 'Unverified', imageUrl: string) => {
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
        imageUrl,
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
    setTimeout(() => setStatus('idle'), 3000);
    toast({ title: 'Check-in Successful!', description: `You have been marked as ${attendanceStatus}.` });
  };
  
  const handleCheckOut = async (locationStatus: 'Verified' | 'Unverified', imageUrl: string) => {
    if (!userProfile?.shopId || !activeCheckIn) return;
    
    const attendanceDocRef = doc(db, 'shops', userProfile.shopId, 'attendance', activeCheckIn.id);
    await updateDoc(attendanceDocRef, {
        checkOutTime: Timestamp.now(),
        locationStatus: locationStatus,
        checkoutImageUrl: imageUrl,
    });

    setActiveCheckIn(null);
    setHasCompletedDay(true);
    setStatus('success');
    stopCamera();
    setTimeout(() => setStatus('idle'), 3000);
    toast({ title: 'Check-out Successful!', description: 'Have a great day!' });
  };
  
  if (!userProfile) {
     return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const renderContent = () => {
    if (hasCompletedDay) {
        return (
            <div className="flex flex-col items-center gap-2 text-center">
                <PartyPopper className="h-20 w-20 text-primary" />
                <p className="text-lg font-semibold">All Done for Today!</p>
                <p className="text-sm text-muted-foreground">You have already completed your attendance. See you tomorrow!</p>
            </div>
        );
    }
    
    if (status !== 'idle') {
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
        }
    }
    
    if (cameraPermission === 'denied' || locationPermission === 'denied') {
        return (
            <div className="w-full">
                <Alert variant="destructive">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Permissions Required</AlertTitle>
                    <AlertDescription>
                        {cameraPermission === 'denied' && "Camera access is denied. "}
                        {locationPermission === 'denied' && "Location access is denied. "}
                        Please enable permissions in your browser settings to continue.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (cameraPermission === 'prompt' || locationPermission === 'prompt') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4">
                <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg">Ready to mark attendance?</p>
                <p className="text-sm text-muted-foreground mb-4">We need to access your camera and location.</p>
                <Button onClick={requestPermissions}>
                    <LocateFixed className="mr-2 h-4 w-4" />
                    Allow Access
                </Button>
            </div>
        );
    }

    // Granted state
    return (
         <div className="relative w-full aspect-square max-w-sm mx-auto overflow-hidden rounded-lg border-4 border-muted shadow-lg">
            <video 
                ref={videoRef} 
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay 
                muted 
                playsInline
            />
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
          <canvas ref={canvasRef} className="hidden"></canvas>
          {renderContent()}
        </CardContent>
         <CardFooter className="flex-col gap-4 pt-6">
            <Alert variant="default" className="border-primary/50 bg-primary/5 text-primary-foreground">
                <LocateFixed className="h-4 w-4" />
                <AlertTitle className="font-semibold text-primary">Location & Photo Verification</AlertTitle>
                <AlertDescription className="text-primary/90">
                    Your location is verified, and a photo is captured for your manager's confirmation. No biometric data is stored.
                </AlertDescription>
            </Alert>
            
            <Button onClick={handleLocationAndMarkAttendance} size="lg" className="w-full" disabled={cameraPermission !== 'granted' || locationPermission !== 'granted' || status !== 'idle' || hasCompletedDay}>
               {status === 'processing' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
               {activeCheckIn ? <LogOut className="mr-2 h-4 w-4"/> : <LogIn className="mr-2 h-4 w-4"/>}
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
