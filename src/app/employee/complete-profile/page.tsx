
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/app/admin/employees/page';
import { getAuth, onAuthStateChanged, updatePassword } from 'firebase/auth';

export default function CompleteProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<Partial<User>>({});
    const [uid, setUid] = useState('');
    const [shopId, setShopId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        const userUID = localStorage.getItem('newUserUID');
        const userShopId = localStorage.getItem('newUserShopId');

        if (userUID && userShopId) {
            setUid(userUID);
            setShopId(userShopId);

            const fetchProfile = async () => {
                const employeeDocRef = doc(db, "users", userUID);
                const docSnap = await getDoc(employeeDocRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
            };
            fetchProfile();

        } else {
            toast({ title: "Error", description: "Could not find your invitation. Please contact your shop owner.", variant: "destructive"});
            router.replace('/employee/login');
        }
    }, [router, toast]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const aadhaar = formData.get('aadhaar') as string;

        if (!aadhaar) {
             toast({ title: "Error", description: "Please enter your Aadhaar number.", variant: "destructive" });
             setLoading(false);
             return;
        }

        if (password && password !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
            setLoading(false);
            return;
        }

        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (password && currentUser) {
                await updatePassword(currentUser, password);
                 toast({ title: "Password Updated!", description: "Your new password has been set." });
            }

            const updatedProfile: Partial<User> = {
                aadhaar,
                status: 'Active',
                isProfileComplete: true,
            };
            
            const employeeDocRef = doc(db, "users", uid);
            await updateDoc(employeeDocRef, updatedProfile);

            toast({
                title: "Profile Complete!",
                description: "Welcome aboard! You will now be redirected to your dashboard.",
            });
            
            localStorage.removeItem('newUserUID');
            localStorage.removeItem('newUserShopId');
            
            setTimeout(() => {
                router.push('/employee');
            }, 1500);

        } catch (error: any) {
            console.error("Error updating profile:", error);
            let description = "Could not save your profile. Please try again.";
            if (error.code === 'auth/weak-password') {
                description = "Password is too weak. It must be at least 6 characters long.";
            }
            toast({ title: "Error", description, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center">
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    <UserCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Complete Your Profile</h1>
                <p className="text-muted-foreground mt-2">
                    Verify your details and set a password to get started.
                </p>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={profile.name || ''} readOnly disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role / Designation</Label>
                        <Input id="role" name="role" value={profile.role || ''} readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input id="employeeId" name="employeeId" value={profile.employeeId || ''} readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" value={profile.email || ''} readOnly disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="password">Set New Password</Label>
                        <Input id="password" name="password" type="password" placeholder="Must be at least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                        <Input id="aadhaar" name="aadhaar" type="text" inputMode="numeric" placeholder="e.g. 1234 5678 9012" required maxLength={12} pattern="\d{12}" title="Aadhaar must be 12 digits" />
                    </div>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" className="w-full max-w-sm" disabled={loading}>
                    {loading && <Loader2 className="mr-2 animate-spin" />}
                    Submit and Continue
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
