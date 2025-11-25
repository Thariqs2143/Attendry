
'use client';

import { AnnouncementsList } from "@/components/announcements-list";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, getDoc, doc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import type { ShopAnnouncement } from "@/app/admin/settings/page";
import type { User as AppUser } from "@/app/admin/employees/page";


const ShopAnnouncements = () => {
    const [announcements, setAnnouncements] = useState<ShopAnnouncement[]>([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserProfile(userDocSnap.data() as AppUser);
                }
            }
            setLoading(false);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!userProfile || !userProfile.shopId) {
             setLoading(false);
             return;
        }

        const db = getFirestore();
        const announcementsRef = collection(db, 'shops', userProfile.shopId, 'announcements');
        const q = query(announcementsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAnnouncements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            } as unknown as ShopAnnouncement));
            setAnnouncements(fetchedAnnouncements);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching shop announcements:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>From Your Manager</CardTitle>
                 <CardDescription>Updates and messages from your shop.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                        <p>No announcements from your manager right now.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <div key={ann.id} className="border p-4 rounded-lg shadow-sm">
                                <p className="font-bold">{ann.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">{ann.message}</p>
                                <p className="text-xs text-muted-foreground/70 mt-2">
                                    Posted {formatDistanceToNow(ann.createdAt, { addSuffix: true })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


export default function EmployeeNotificationsPage() {

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">Important announcements and updates.</p>
            </div>
            <ShopAnnouncements />
            <AnnouncementsList />
        </div>
    );
}
