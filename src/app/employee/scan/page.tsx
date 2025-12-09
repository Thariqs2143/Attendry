
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, AlertTriangle, CameraOff } from 'lucide-react';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, addDoc, collection, writeBatch, Timestamp, query, where, getDocs, limit, startOfMonth, endOfMonth } from 'firebase/firestore';
import { setHours, setMinutes, setSeconds, startOfDay, endOfDay } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ScanStatus = 'idle' | 'scanning' | 'processing' | 'success' | 'error';
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

type AppUser = {
  uid: string;
  name?: string;
  shopId?: string;
  points?: number;
  streak?: number;
};

export default function QRScannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [scanResult, setScanResult] = useState('');
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/employee/login');
        return;
      }
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        setUserProfile({ uid: user.uid, ...userSnap.data() } as AppUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const startScan = useCallback(() => {
    if (videoRef.current && hasCameraPermission) {
      setStatus('scanning');
      const video = videoRef.current;
      const canvas = canvasRef.current?.getContext('2d', { willReadFrequently: true });

      if (!canvas) return;

      const tick = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.canvas.height = video.videoHeight;
          canvas.canvas.width = video.videoWidth;
          canvas.drawImage(video, 0, 0, canvas.canvas.width, canvas.canvas.height);
          const imageData = canvas.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            setScanResult(code.data);
            setStatus('processing');
            // Stop scanning
            return;
          }
        }
        animationFrameId.current = requestAnimationFrame(tick);
      };

      animationFrameId.current = requestAnimationFrame(tick);
    }
  }, [hasCameraPermission]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
          description: 'Please enable camera permissions in your browser settings to use the scanner.',
        });
      }
    };
    getCameraPermission();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  useEffect(() => {
    if (status === 'scanning' && hasCameraPermission) {
        startScan();
    }
    return () => {
        if(animationFrameId.current){
            cancelAnimationFrame(animationFrameId.current);
        }
    }
  }, [status, hasCameraPermission, startScan]);


  useEffect(() => {
    if (status === 'processing' && scanResult) {
      handleAttendance(scanResult);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, scanResult]);

  const handleAttendance = async (url: string) => {
    if (!userProfile) return;

    try {
      const parsedUrl = new URL(url);
      const shopId = parsedUrl.searchParams.get('shopId');
      const token = parsedUrl.searchParams.get('token');

      if (!shopId) {
        throw new Error('Invalid QR code: Missing shop ID.');
      }
      if (shopId !== userProfile.shopId) {
        throw new Error('This QR code is for a different shop.');
      }

      if (token) {
        // Dynamic QR code validation
        const tokenDocRef = doc(db, 'shops', shopId, 'qr-history', 'currentToken');
        const tokenSnap = await getDoc(tokenDocRef);
        if (!tokenSnap.exists() || tokenSnap.data().token !== token) {
          throw new Error('Invalid or expired QR code.');
        }
        const expires = tokenSnap.data().expires.toDate();
        if (new Date() > expires) {
          throw new Error('QR code has expired. Please scan the new one.');
        }
      }
      
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      const attendanceQuery = query(
        collection(db, 'shops', shopId, 'attendance'),
        where('userId', '==', userProfile.uid),
        where('checkInTime', '>=', todayStart),
        where('checkInTime', '<=', todayEnd),
        orderBy('checkInTime', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(attendanceQuery);
      const lastRecord = querySnapshot.docs[0];

      if (lastRecord && !lastRecord.data().checkOutTime) {
        // Handle Check-out
        await updateDoc(doc(db, 'shops', shopId, 'attendance', lastRecord.id), {
          checkOutTime: Timestamp.now()
        });
        toast({ title: 'Check-out Successful!', description: 'Have a great day!' });
      } else {
        // Handle Check-in
        const shopConfigRef = doc(db, 'shops', shopId, 'config', 'main');
        const shopConfigSnap = await getDoc(shopConfigRef);
        const settings = shopConfigSnap.exists() ? shopConfigSnap.data() : {};
        const gamification: GamificationSettings = {
          onTimePoints: 1, gracePeriodMinutes: 5, lateCategory1Points: -1,
          lateCategory1Minutes: 10, lateCategory2Points: -2, lateCategory2Minutes: 30,
          lateCategory3Points: -3, lateCategory3Minutes: 60, absentMinutes: 60, absentPoints: -5,
          streakBonusDays: 5, streakBonusPoints: 50,
          ...(settings.gamification || {}),
        } as GamificationSettings;

        const businessHours = settings.businessHours || {};
        const todayKey = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
        const shiftStartTimeString = businessHours[todayKey]?.startTime || '09:30';

        const now = new Date();
        const [hours, minutes] = shiftStartTimeString.split(':').map((v: string) => parseInt(v, 10));
        const shiftStart = setSeconds(setMinutes(setHours(startOfDay(now), hours), minutes), 0);

        let attendanceStatus = 'On-time';
        let pointsChange = 0;
        let isLate = false;

        const timeDiffMinutes = (now.getTime() - shiftStart.getTime()) / (1000 * 60);

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
          const lateQ = query(
            collection(db, 'shops', shopId, 'attendance'),
            where('userId', '==', userProfile.uid),
            where('checkInTime', '>=', monthStart),
            where('checkInTime', '<=', monthEnd),
            where('status', 'in', ['Late Category 1', 'Late Category 2', 'Late Category 3'])
          );
          const lateSnap = await getDocs(lateQ);
          const monthlyLateCount = lateSnap.size;
          if (monthlyLateCount < 3) {
            pointsChange = 0;
            toast({ title: 'Late allowance used', description: `This is your ${monthlyLateCount + 1}/3 late entries for this month. No points deducted.` });
          }
        }

        const newStreak = attendanceStatus === 'On-time' || attendanceStatus === 'Grace Period' ? (userProfile.streak || 0) + 1 : 0;
        
        const batch = writeBatch(db);
        
        const newAttendanceRef = doc(collection(db, 'shops', shopId, 'attendance'));
        batch.set(newAttendanceRef, {
            userId: userProfile.uid,
            userName: userProfile.name,
            shopId: shopId,
            checkInTime: Timestamp.now(),
            status: attendanceStatus,
            checkOutTime: null,
        });
        
        const employeeRef = doc(db, 'shops', shopId, 'employees', userProfile.uid);
        const newPoints = Math.max(0, (userProfile.points || 0) + pointsChange);
        const updateData: any = { points: newPoints, streak: newStreak };
        
        if (newStreak > 0 && newStreak % gamification.streakBonusDays === 0) {
            updateData.points = updateData.points + gamification.streakBonusPoints;
            toast({ title: 'Streak Bonus!', description: `+${gamification.streakBonusPoints} bonus points for your ${gamification.streakBonusDays}-day streak!` });
        }
        
        batch.update(employeeRef, updateData);
        await batch.commit();
        
        toast({ title: 'Check-in Successful!', description: `You have been marked as ${attendanceStatus}.` });
      }

      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Attendance Failed', description: e.message, variant: 'destructive' });
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };
  
  if (hasCameraPermission === null) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>
  }
  
  if (hasCameraPermission === false) {
     return (
        <Alert variant="destructive">
          <CameraOff className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access in your browser settings to use the QR scanner.
          </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold tracking-tight">QR Scanner</h1>
       <div className="relative w-full max-w-sm aspect-square border-4 border-muted rounded-2xl overflow-hidden shadow-lg">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-3/4 border-4 border-dashed border-white/50 rounded-2xl" />
          </div>
          {status !== 'scanning' && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 text-white">
                {status === 'idle' && <QrCode className="h-16 w-16" />}
                {status === 'processing' && <Loader2 className="h-16 w-16 animate-spin" />}
                {status === 'success' && <div className="text-4xl">✅</div>}
                {status === 'error' && <AlertTriangle className="h-16 w-16 text-destructive" />}
                <p className="font-semibold text-lg">{
                    status === 'idle' ? 'Ready to Scan'
                    : status === 'processing' ? 'Processing...'
                    : status === 'success' ? 'Success!'
                    : status === 'error' ? 'Scan Failed'
                    : 'Scanning...'
                }</p>
            </div>
          )}
      </div>
      <Button 
        onClick={() => setStatus('scanning')} 
        disabled={status !== 'idle' && status !== 'success' && status !== 'error'} 
        className="w-full max-w-sm" 
        size="lg"
      >
        {status === 'scanning' ? 'Scanning...' : 'Start Scan'}
      </Button>
    </div>
  );
}
