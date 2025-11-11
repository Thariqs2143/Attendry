'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function EmployeeLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({ title: "Error", description: "Please enter both email and password.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists() && (userDocSnap.data().role === 'Employee' || userDocSnap.data().role === 'Admin')) {
                const shopId = userDocSnap.data().shopId;
                const shopDocRef = doc(db, 'shops', shopId);
                const shopDocSnap = await getDoc(shopDocRef);

                if (!shopDocSnap.exists() || shopDocSnap.data().status === 'disabled') {
                    toast({ title: "Access Denied", description: "Your employer's shop account has been disabled.", variant: "destructive" });
                    await auth.signOut();
                } else if (userDocSnap.data().isProfileComplete) {
                     toast({ title: "Login Successful!" });
                     router.push('/employee');
                } else {
                     localStorage.setItem('newUserUID', user.uid);
                     localStorage.setItem('newUserShopId', shopId);
                     toast({ title: "Welcome!", description: "Please complete your profile." });
                     router.push('/employee/complete-profile');
                }

            } else {
                toast({ title: "Not Authorized", description: "This account is not registered as an employee.", variant: "destructive"});
                await auth.signOut();
            }

        } catch (error: any) {
            console.error("Error signing in:", error);
            if(error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive"});
            } else {
                toast({ title: "Login Failed", description: "An unexpected error occurred.", variant: "destructive"});
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-start bg-background p-4 pt-20 sm:pt-28">
            <div className="w-full max-w-sm text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <User className="h-12 w-12 text-primary"/>
                    </div>
                </div>
                <h1 className="text-3xl font-bold">Employee Login</h1>
                <p className="text-muted-foreground mt-2 mb-8">
                   Enter your registered email and password.
                </p>
            
                <form className="space-y-6 text-left" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full !mt-8" disabled={loading}>
                         {loading && <Loader2 className="mr-2 animate-spin" />}
                        Login
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Forgot your password? Please contact your manager to get it reset.
                </p>
                
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Not an employee?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        Login as Shop Owner
                    </Link>
                </p>
            </div>
        </div>
    );
}