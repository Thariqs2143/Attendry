
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

export type Shift = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
};

function ShiftManagementContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [newShiftName, setNewShiftName] = useState('');
    const [newShiftStart, setNewShiftStart] = useState('');
    const [newShiftEnd, setNewShiftEnd] = useState('');
    const [isAddingShift, setIsAddingShift] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user);
            } else {
                router.push('/admin/login');
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    useEffect(() => {
        if (!authUser) return;
        setLoading(true);
        const db = getFirestore();
        const shiftsCollectionRef = collection(db, 'shops', authUser.uid, 'shifts');
        const unsubscribe = onSnapshot(shiftsCollectionRef, (snapshot) => {
            const fetchedShifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
            setShifts(fetchedShifts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching shifts:", error);
            toast({ title: "Error", description: "Could not load shifts.", variant: "destructive" });
            setLoading(false);
        });
        return () => unsubscribe();
    }, [authUser, toast]);

    const handleAddShift = async () => {
        if (!authUser || !newShiftName || !newShiftStart || !newShiftEnd) {
            toast({ title: "Missing Fields", description: "Please provide a name, start time, and end time for the shift.", variant: "destructive" });
            return;
        }
        setIsAddingShift(true);
        const db = getFirestore();
        try {
            const shiftsCollectionRef = collection(db, 'shops', authUser.uid, 'shifts');
            await addDoc(shiftsCollectionRef, {
                name: newShiftName,
                startTime: newShiftStart,
                endTime: newShiftEnd,
            });
            toast({ title: "Shift Added!", description: `${newShiftName} has been created.` });
            setNewShiftName('');
            setNewShiftStart('');
            setNewShiftEnd('');
        } catch (error) {
            console.error("Error adding shift: ", error);
            toast({ title: "Error", description: "Could not add shift.", variant: "destructive" });
        } finally {
            setIsAddingShift(false);
        }
    };

    const handleDeleteShift = async (shiftId: string) => {
        if (!authUser) return;
        const db = getFirestore();
        const shiftDocRef = doc(db, 'shops', authUser.uid, 'shifts', shiftId);
        try {
            await deleteDoc(shiftDocRef);
            toast({ title: "Shift Deleted", description: "The shift has been removed." });
        } catch (error) {
            console.error("Error deleting shift: ", error);
            toast({ title: "Error", description: "Could not delete shift.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/settings">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Shift Management</h1>
                    <p className="text-muted-foreground">Define custom work shifts for your employees.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Shift</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
                        <div className="space-y-1.5">
                            <Label htmlFor="shift-name">Shift Name</Label>
                            <Input id="shift-name" placeholder="e.g., Morning Shift" value={newShiftName} onChange={(e) => setNewShiftName(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="shift-start">Start Time</Label>
                            <Input id="shift-start" type="time" value={newShiftStart} onChange={(e) => setNewShiftStart(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="shift-end">End Time</Label>
                            <Input id="shift-end" type="time" value={newShiftEnd} onChange={(e) => setNewShiftEnd(e.target.value)} />
                        </div>
                        <Button onClick={handleAddShift} disabled={isAddingShift} className="w-full md:w-auto">
                            {isAddingShift ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Add Shift
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Shifts</CardTitle>
                    <CardDescription>A list of all custom shifts you have created.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : shifts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center p-4">No custom shifts created yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {shifts.map(shift => (
                                <div key={shift.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div>
                                        <p className="font-medium">{shift.name}</p>
                                        <p className="text-sm text-muted-foreground">{shift.startTime} - {shift.endTime}</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the "{shift.name}" shift. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteShift(shift.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Delete Shift
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ShiftManagementPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <ShiftManagementContent />
        </Suspense>
    )
}
