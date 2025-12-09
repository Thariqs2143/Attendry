
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Download, RefreshCw, Activity, Link as LinkIcon, Users, CheckCircle, XCircle, Camera } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, Timestamp, doc, getDoc, setDoc, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '../employees/page';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintableQrCard } from '@/components/printable-qr-card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { useTheme } from 'next-themes';


type ActivityRecord = {
    id: string;
    userId: string;
    userName: string;
    checkInTime: Timestamp;
    checkOutTime?: Timestamp;
    status: 'On-time' | 'Late' | 'Manual' | 'Absent' | 'Half-day' | 'Grace Period';
    userFallback?: string;
    userImageUrl?: string;
    locationStatus?: 'Verified' | 'Unverified' | 'Error';
    imageUrl?: string;
    checkoutImageUrl?: string;
    method?: 'Selfie' | 'QR';
};

const RecentActivity = ({ shopId }: { shopId: string }) => {
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [allEmployees, setAllEmployees] = useState<User[]>([]);

    useEffect(() => {
        if (!shopId) return;

        const fetchEmployees = async () => {
             const employeesRef = collection(db, 'shops', shopId, 'employees');
             const empSnapshot = await getDocs(employeesRef);
             const employeesData = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
             setAllEmployees(employeesData);
        };
        fetchEmployees();
    }, [shopId]);

    useEffect(() => {
        if (!shopId || allEmployees.length === 0) {
             setLoading(false);
             return;
        };

        setLoading(true);
        const attendanceRef = collection(db, 'shops', shopId, 'attendance');
        const q = query(attendanceRef, orderBy('checkInTime', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedActivities = snapshot.docs.map(doc => {
                const data = doc.data() as ActivityRecord;
                const employee = allEmployees.find(e => e.uid === data.userId);
                return { ...data, id: doc.id, userFallback: employee?.fallback, userImageUrl: employee?.imageUrl };
            });
            setActivities(fetchedActivities);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching live feed:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [shopId, allEmployees]);


    return (
         <Card className="h-full flex flex-col transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground/20 hover:border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Live Attendance Feed</CardTitle>
                <CardDescription>A real-time log of all attendance activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {loading ? <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    : activities.length > 0 ? (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {activities.map((item) => {
                                const actionText = item.checkOutTime ? 'checked out.' : 'checked in.';
                                const timestamp = item.checkOutTime ? item.checkOutTime.toDate() : item.checkInTime.toDate();
                                const verificationImage = item.checkOutTime ? item.checkoutImageUrl : item.imageUrl;
                                
                                return (
                                    <div key={item.id} className="flex items-start gap-4">
                                        {verificationImage ? (
                                            <Image
                                                src={verificationImage}
                                                alt={`Attendance photo for ${item.userName}`}
                                                width={48}
                                                height={48}
                                                className="h-12 w-12 rounded-md object-cover border-2"
                                            />
                                        ) : (
                                            <Avatar className="h-12 w-12 border"><AvatarImage src={item.userImageUrl} /><AvatarFallback>{item.userFallback || '?'}</AvatarFallback></Avatar>
                                        )}
                                        <div className="flex-1 text-sm">
                                            <p><span className="font-semibold">{item.userName}</span> {actionText}</p>
                                            <div className='flex items-center gap-2 flex-wrap'>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</p>
                                                {item.method && (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        {item.method === 'Selfie' ? <Camera className="h-3 w-3" /> : <QrCode className="h-3 w-3" />}
                                                        {item.method}
                                                    </Badge>
                                                )}
                                                {item.locationStatus && (
                                                    <Badge variant={item.locationStatus === 'Verified' ? 'secondary' : 'destructive'}>
                                                        {item.locationStatus === 'Verified' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                                                        {item.locationStatus}
                                                    </Badge>
                                                )}
                                                {(item.status !== 'On-time' && item.status !== 'Grace Period') && (
                                                    <Badge variant="destructive" className="hidden sm:inline-flex">{item.status}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <div className="text-center py-10"><Users className="h-10 w-10 mx-auto text-muted-foreground mb-4" /><p className="text-sm text-muted-foreground">No attendance activity yet.</p></div>
                }
            </CardContent>
        </Card>
    )
}

export default function GenerateQrPage() {
  const [qrMode, setQrMode] = useState<'permanent' | 'dynamic'>('permanent');
  const [qrUrl, setQrUrl] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const { toast } = useToast();
  const printableCardRef = useRef<HTMLDivElement>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logoSrc = mounted && currentTheme === 'dark' ? '/header-logo-dark.png' : '/header-logo-light.png';


   const handleDownloadPdf = async () => {
    if (!printableCardRef.current) return;
    setDownloading(true);
    try {
        const canvas = await html2canvas(printableCardRef.current, {
            scale: 2, // Increase resolution
            useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [400, 600] // Match aspect ratio of the card
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 400, 600);
        pdf.save(`${shopName}-QR-Code.pdf`);
        toast({ title: 'PDF Downloaded!', description: 'Your QR code card has been saved as a PDF.' });
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ title: 'Download Failed', description: 'Could not generate PDF. Please try again.', variant: 'destructive' });
    } finally {
        setDownloading(false);
    }
  };

  const generateAndSaveToken = useCallback(async (uid: string) => {
    const token = Math.random().toString(36).substring(2, 10);
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + 15);
    const tokenDocRef = doc(db, 'shops', uid, 'qr-history', 'currentToken');
    await setDoc(tokenDocRef, { token, expires: Timestamp.fromDate(expires) });
    return token;
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        setLoading(true);
        const shopDocRef = doc(db, 'shops', user.uid);
        const shopSnap = await getDoc(shopDocRef);
        if (shopSnap.exists()) {
          const shopData = shopSnap.data();
          setShopName(shopData.shopName);
          const configDocRef = doc(db, 'shops', user.uid, 'config', 'main');
          const configSnap = await getDoc(configDocRef);
          if (configSnap.exists()) {
            setQrMode(configSnap.data().qrCodeMode || 'permanent');
          }
        }
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const generatePermanentUrl = () => {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/employee/scan?shopId=${authUser.uid}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;
      setQrUrl(qrApiUrl);
    };

    if (qrMode === 'permanent') {
      generatePermanentUrl();
    } else if (qrMode === 'dynamic') {
      let intervalId: NodeJS.Timeout;

      const generateDynamicUrl = async () => {
        const token = await generateAndSaveToken(authUser.uid);
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/employee/scan?shopId=${authUser.uid}&token=${token}`;
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;
        setQrUrl(qrApiUrl);
      };

      generateDynamicUrl();
      intervalId = setInterval(generateDynamicUrl, 15000);

      return () => clearInterval(intervalId);
    }
  }, [qrMode, authUser, generateAndSaveToken]);

  const copyLink = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/employee/scan?shopId=${authUser?.uid}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied!', description: 'The permanent check-in link has been copied.' });
  }

  if (loading || !authUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground">
          Use this page to display a QR code for your employees to check in.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <Card className="transform-gpu transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground/20 hover:border-primary">
          <CardHeader>
            <CardTitle>{shopName}</CardTitle>
            <CardDescription>
              Employees can scan this code to mark their attendance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={qrMode} onValueChange={(value) => setQrMode(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="permanent">Permanent</TabsTrigger>
                <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
              </TabsList>
              <TabsContent value="permanent">
                  <div className="p-4 border rounded-lg flex flex-col items-center gap-4">
                    {qrUrl ? (
                      <Image src={qrUrl} alt="Permanent QR Code" width={256} height={256} />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                        <Loader2 className="animate-spin" />
                      </div>
                    )}
                    <p className="text-xs text-center text-muted-foreground">This code is permanent. Print it and display it at your shop entrance.</p>
                  </div>
              </TabsContent>
              <TabsContent value="dynamic">
                 <div className="p-4 border rounded-lg flex flex-col items-center gap-4">
                    {qrUrl ? (
                       <Image src={qrUrl} alt="Dynamic QR Code" width={256} height={256} />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
                        <Loader2 className="animate-spin" />
                      </div>
                    )}
                    <p className="text-xs text-center text-muted-foreground flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> This code refreshes every 15 seconds. Ideal for displaying on a tablet.</p>
                  </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardContent className="border-t pt-4 flex flex-wrap gap-4">
              <Button onClick={handleDownloadPdf} disabled={downloading}>
                {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                 Download PDF
              </Button>
              <Button variant="outline" onClick={copyLink}>
                  <LinkIcon className="mr-2 h-4 w-4"/> Copy Link
              </Button>
          </CardContent>
        </Card>
        
        <RecentActivity shopId={authUser.uid} />
      </div>

      <div style={{ position: 'absolute', left: '-9999px' }}>
        <PrintableQrCard ref={printableCardRef} shopName={shopName} qrUrl={qrUrl} logoSrc={logoSrc}/>
      </div>
    </div>
  );
}
