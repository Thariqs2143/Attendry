
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Loader2, AlertTriangle, Building } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { User } from '@/app/admin/employees/page';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function SignUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [inviteData, setInviteData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const inviteId = searchParams.get('inviteId');
    const shopId = searchParams.get('shopId');

    useEffect(() => {
        if (!inviteId || !shopId) {
            setError("Invalid or missing invitation link. Please check the URL.");
            return;
        }

        const fetchInvite = async () => {
            const inviteDocRef = doc(db, 'shops', shopId, 'invites', inviteId);
            const inviteSnap = await getDoc(inviteDocRef);

            if (inviteSnap.exists() && inviteSnap.data().status === 'pending') {
                setInviteData(inviteSnap.data());
            } else {
                setError("This invitation is invalid, has already been used, or has expired.");
            }
        };

        fetchInvite();
    }, [inviteId, shopId]);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast({ title: "Passwords do not match", variant: "destructive" });
            return;
        }
        if (password.length < 6) {
            toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }
        if (!inviteData || !shopId || !inviteId) {
            toast({ title: "Error", description: "Invitation data is missing.", variant: "destructive" });
            return;
        }

        setLoading(true);

        try {
            // 1. Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, inviteData.email, password);
            const user = userCredential.user;

            // 2. Prepare user profile
            const newEmployeeProfile: Partial<User> = {
                uid: user.uid,
                name: inviteData.name,
                email: inviteData.email,
                role: inviteData.role,
                employeeId: inviteData.employeeId,
                status: 'Pending Onboarding',
                fallback: inviteData.name.split(' ').map((n: string) => n[0]).join(''),
                shopId: shopId,
                points: 0,
                streak: 0,
                joinDate: new Date().toISOString().split('T')[0],
                baseSalary: inviteData.baseSalary || 0,
                isProfileComplete: false,
            };

            // 3. Use a batch write to save profiles and update invite status
            const batch = writeBatch(db);

            // Create document in global users collection
            const userDocRef = doc(db, "users", user.uid);
            batch.set(userDocRef, newEmployeeProfile);

            // Create document in shop's employees subcollection
            const shopEmployeeDocRef = doc(db, 'shops', shopId, 'employees', user.uid);
            batch.set(shopEmployeeDocRef, newEmployeeProfile);

            // Mark invite as used
            const inviteDocRef = doc(db, 'shops', shopId, 'invites', inviteId);
            batch.update(inviteDocRef, { status: 'accepted', acceptedAt: new Date() });

            await batch.commit();
            
            // 4. Redirect to complete profile
            toast({ title: "Account Created!", description: "Please complete your profile to continue." });
            router.push('/employee/complete-profile');

        } catch (error: any) {
            console.error("Error creating account from invite:", error);
             if (error.code === 'auth/email-already-in-use') {
                setError("This email address is already associated with an account. Please contact your manager.");
            } else {
                setError("An unexpected error occurred. Please try the link again or contact your manager.");
            }
        } finally {
            setLoading(false);
        }
    };
    
    if (error) {
        return (
             <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md border-destructive">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-destructive/10 rounded-full p-3 w-fit mb-4">
                            <AlertTriangle className="h-10 w-10 text-destructive"/>
                        </div>
                        <CardTitle className="text-destructive">Invitation Error</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">{error}</p>
                         <Button asChild variant="link" className="mt-4">
                            <Link href="/login">Return to Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    if (!inviteData) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Verifying your invitation...</p>
            </div>
        )
    }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center">
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                    <UserCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Welcome to {inviteData.shopName}!</h1>
                <p className="text-muted-foreground mt-2">
                    You've been invited by your manager. Create your account to get started.
                </p>
            </div>
            
            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="font-semibold">{inviteData.name}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-semibold">{inviteData.email}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Set Your Password *</Label>
                        <Input id="password" name="password" type="password" placeholder="Min. 6 characters" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" className="w-full max-w-sm" disabled={loading}>
                    {loading && <Loader2 className="mr-2 animate-spin" />}
                    Create My Account
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default function SuspendedSignUpPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <SignUpPage />
        </Suspense>
    )
}
