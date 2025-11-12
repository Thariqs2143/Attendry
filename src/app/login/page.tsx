
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { IndianFlagIcon } from "@/components/ui/indian-flag-icon";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const referredBy = searchParams.get('ref');


  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isNewUser && !name)) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isNewUser) {
        // Handle Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store preliminary info and redirect to complete profile
        localStorage.setItem('adminUID', user.uid);
        localStorage.setItem('adminEmail', user.email || email);
        localStorage.setItem('adminName', name);

        const userData: {[key: string]: any} = {
            uid: user.uid,
            email: user.email || email,
            name: name,
            role: 'Admin',
            isProfileComplete: false,
            joinDate: new Date().toISOString().split('T')[0],
        };
        
        await setDoc(doc(db, "users", user.uid), userData, { merge: true });

        // If there's a referral code, store it on the shop document placeholder
        if(referredBy) {
            await setDoc(doc(db, "shops", user.uid), { referredBy: referredBy }, { merge: true });
        }
        
        toast({ title: "Account Created!", description: "Please complete your shop profile to continue." });
        router.push('/admin/complete-profile');

      } else {
        // Handle Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().isProfileComplete) {
            toast({ title: "Login Successful!", description: "Redirecting to dashboard..." });
            router.push('/admin');
        } else if (userDocSnap.exists() && userDocSnap.data().role === 'Admin') {
             // This case handles users who signed up but didn't complete their profile
             localStorage.setItem('adminUID', user.uid);
             localStorage.setItem('adminEmail', user.email || email);
             localStorage.setItem('adminName', userDocSnap.data()?.name || '');
             toast({ title: "Welcome Back!", description: "Please complete your shop profile." });
             router.push('/admin/complete-profile');
        } else {
            toast({ title: "Not Authorized", description: "This account does not have admin privileges.", variant: "destructive"});
            await auth.signOut();
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      let description = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already in use. Please log in instead.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/weak-password') {
        description = "Your password must be at least 6 characters long.";
      }
      toast({
        title: "Authentication Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-2">
      {/* LEFT SIDE - Desktop Image */}
      <div className="relative hidden md:block">
        <Image
          src="https://res.cloudinary.com/dnkghymx5/image/upload/v1762241011/Generated_Image_November_04_2025_-_12_50PM_1_hslend.png"
          alt="Attendry illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* RIGHT SIDE - Form Section */}
      <div className="flex flex-col items-center justify-center w-full">
        {/* TOP IMAGE for Mobile */}
        <div className="md:hidden w-full relative">
            <Image
            src="https://res.cloudinary.com/dnkghymx5/image/upload/v1762241011/Generated_Image_November_04_2025_-_12_50PM_1_hslend.png"
            alt="Attendry illustration"
            width={800}
            height={600}
            className="w-full h-auto object-cover"
            priority
            />
        </div>

        {/* FORM CARD */}
        <div className="w-full max-w-sm space-y-6 p-6">
            <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
                India’s #1 QR Powered Staff Attendance App
            </h1>
            <div className="flex items-center my-4">
                <hr className="w-full border-muted-foreground/20" />
                <span className="px-4 text-muted-foreground font-semibold whitespace-nowrap text-sm">
                OWNER ACCESS
                </span>
                <hr className="w-full border-muted-foreground/20" />
            </div>
            </div>

            {/* LOGIN FORM */}
            <form className="space-y-4" onSubmit={handleAuthAction}>
            {isNewUser && (
                 <div className="space-y-1.5">
                    <Label htmlFor="name">Your Full Name</Label>
                    <Input id="name" type="text" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} required={isNewUser} />
                </div>
            )}
            <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>


            <Button
                type="submit"
                className="w-full bg-[#0C2A6A] hover:bg-[#0C2A6A]/90 !mt-6"
                disabled={loading}
            >
                {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                {isNewUser ? "Create Account" : "Continue to Dashboard"}
            </Button>
            </form>

             <p className="text-center text-sm text-muted-foreground">
                {isNewUser ? "Already have an account?" : "Don't have an account?"}{' '}
                <button onClick={() => setIsNewUser(!isNewUser)} className="text-primary hover:underline font-medium">
                    {isNewUser ? "Sign In" : "Sign Up"}
                </button>
            </p>

            <div className="flex items-center my-8">
                <hr className="w-full" />
                <span className="px-4 text-muted-foreground font-medium">OR</span>
                <hr className="w-full" />
            </div>

            <Link href="/employee/login" className="w-full">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                    Login as Employee
                </Button>
            </Link>
        </div>
        </div>

    </div>
  );
}
