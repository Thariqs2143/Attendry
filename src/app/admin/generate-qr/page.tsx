
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, Timestamp, where, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import type { User } from '../employees/page';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getAuth } from 'firebase/auth';
import Image from 'next/image';

type ActivityRecord = {
    id: string;
    userId: string;
    userName: string;
    checkInTime: Timestamp;
    checkOutTime?: Timestamp;
    status: 'On-time' | 'Late' | 'Manual' | 'Absent' | 'Half-day';
    userFallback?: string;
    userImageUrl?: string;
    locationStatus?: 'Verified' | 'Unverified' | 'Error';
    imageUrl?: string;
    checkoutImageUrl?: string;
};

const RecentActivity = () => {
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [allEmployees, setAllEmployees] = useState<User[]>([]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                const employeesRef = collection(db, 'shops', user.uid, 'employees');
                const empSnapshot = await getDocs(employeesRef);
                const employeesData = empSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setAllEmployees(employeesData);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!authUser) return;
        setLoading(true);
        const attendanceRef = collection(db, 'shops', authUser.uid, 'attendance');
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
    }, [authUser, allEmployees]);


    return (
         <Card className="h-full flex flex-col transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground hover:border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Live Attendance Feed</CardTitle>
                <CardDescription>A real-time log of all attendance activity.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {loading ? <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    : activities.length > 0 ? (
                        <div className="space-y-4">
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
                                            <div className='flex items-center gap-2'>
                                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</p>
                                                {item.locationStatus && (
                                                    <Badge variant={item.locationStatus === 'Verified' ? 'secondary' : 'destructive'}>
                                                        {item.locationStatus}
                                                    </Badge>
                                                )}
                                                {item.status !== 'On-time' && item.status !== 'Grace Period' && (
                                                    <Badge variant="destructive" className="hidden sm:inline-flex">{item.status}</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-sm text-muted-foreground text-center py-4">No attendance activity yet.</p>
                }
            </CardContent>
        </Card>
    )
}

export default function LiveAttendancePage() {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Live Attendance</h1>
                <p className="text-muted-foreground">Monitor real-time check-ins and check-outs from your employees.</p>
            </div>
        </div>

        <div className="w-full">
            <RecentActivity />
        </div>
    </div>
  );
}
