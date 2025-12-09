
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, ArrowLeft, Lock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { User } from '@/app/admin/employees/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import Link from 'next/link';
import { useSubscription } from '@/context/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AddBranchPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [ownerProfile, setOwnerProfile] = useState<Partial<User>>({});
    const [businessType, setBusinessType] = useState('');
    const { hasReachedBranchLimit, canAccessFeature } = useSubscription();
    const [branchCount, setBranchCount] = useState(0);

    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const isLocked = !canAccessFeature('MULTI_BRANCH') || hasReachedBranchLimit(branchCount + 1); // +1 to account for the new branch

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                const ownerDocRef = doc(db, 'users', user.uid);
                const ownerSnap = await getDoc(ownerDocRef);
                if (ownerSnap.exists()) {
                    setOwnerProfile(ownerSnap.data());
                }
                const branchesQuery = query(collection(db, "shops"), where("ownerId", "==", user.uid));
                const branchesSnapshot = await getDocs(branchesQuery);
                setBranchCount(branchesSnapshot.size);
            } else {
                router.replace('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleFetchLocation = async () => {
        setLocationLoading(true);
        if (!navigator.geolocation) {
            toast({ title: "Geolocation not supported", description: "Your browser doesn't support location services.", variant: "destructive" });
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLatitude(lat.toString());
            setLongitude(lng.toString());

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    setAddress(data.display_name);
                    toast({ title: "Location Found!", description: "Address has been filled automatically." });
                } else {
                    toast({ title: "No address found", variant: "destructive" });
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                toast({ title: "Could not fetch address", variant: "destructive" });
            } finally {
                setLocationLoading(false);
            }
        }, () => {
            toast({ title: "Location Access Denied", description: "Please allow location access in your browser.", variant: "destructive" });
            setLocationLoading(false);
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLocked) {
            toast({ title: "Upgrade Required", description: "You have reached your branch limit. Please upgrade your plan.", variant: "destructive" });
            return;
        }

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const shopName = formData.get('shopName') as string;
        const email = formData.get('email') as string;
        const gstNumber = formData.get('gstNumber') as string;

        if (!shopName || !businessType || !address || !authUser || !latitude || !longitude) {
             toast({ title: "Error", description: "Please fill out all required fields, including location and address.", variant: "destructive" });
             setLoading(false);
             return;
        }

        try {
            const newShopRef = doc(collection(db, "shops"));
            const newShopData = {
                id: newShopRef.id,
                ownerId: authUser.uid,
                ownerName: ownerProfile.name,
                shopName,
                businessType,
                address,
                email,
                gstNumber,
                latitude,
                longitude,
                status: 'active',
            };
            await setDoc(newShopRef, newShopData);
            
            const ownerAsEmployeeData = {
                ...ownerProfile,
                uid: authUser.uid,
                shopId: newShopRef.id,
                isProfileComplete: true,
                status: 'Active',
                role: 'Admin',
            };
            const ownerAsEmployeeRef = doc(db, 'shops', newShopRef.id, 'employees', authUser.uid);
            await setDoc(ownerAsEmployeeRef, ownerAsEmployeeData);

            toast({ title: "Branch Created!", description: `${shopName} has been added to your account.` });
            router.push('/admin');
        } catch (error) {
            console.error("Error creating new branch:", error);
            toast({ title: "Error", description: "Could not create the new branch. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button variant="outline" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="text-left">
                    <h1 className="text-3xl font-bold">Add New Branch</h1>
                    <p className="text-muted-foreground mt-1">
                        Enter the details for your new business location.
                    </p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="shopName">Branch / Shop Name *</Label>
                        <Input id="shopName" name="shopName" placeholder="e.g., JD Retail - Downtown" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select onValueChange={setBusinessType} required>
                            <SelectTrigger id="businessType">
                                <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                                <SelectItem value="Service">Service</SelectItem>
                                <SelectItem value="MSME">MSME</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Branch Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="e.g., downtown@jdretail.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gstNumber">Branch GST Number (Optional)</Label>
                        <Input id="gstNumber" name="gstNumber" placeholder="e.g., 29ABCDE1234F1Z6" />
                    </div>
                </div>
                <div className="space-y-4 rounded-lg border-2 p-4">
                    <div className='flex items-start gap-3'>
                        <MapPin className='h-5 w-5 text-primary mt-1' />
                        <div>
                            <h3 className="font-semibold">Branch Location & Address *</h3>
                            <p className="text-xs text-muted-foreground">Click the button to automatically find the branch's address and coordinates for face attendance.</p>
                        </div>
                    </div>
                    <Button type="button" onClick={handleFetchLocation} disabled={locationLoading} className="w-full">
                        {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Use My Current Location
                    </Button>
                    <div className="space-y-2 pt-2 border-t">
                        <Label>Detected Address</Label>
                        <Input id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Auto-filled or type manually" required/>
                    </div>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                {isLocked ? (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="submit" size="lg" className="w-full max-w-sm" disabled>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Create Branch
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                               <p>Upgrade your plan to add more branches.</p>
                               <Link href="/admin/settings?tab=subscription">
                                    <Button variant="link" size="sm" className="p-0 h-auto">View Plans</Button>
                                </Link>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Button type="submit" size="lg" className="w-full max-w-sm" disabled={loading}>
                        {loading && <Loader2 className="mr-2 animate-spin" />}
                        <Store className="mr-2 h-4 w-4" />
                        Create Branch
                    </Button>
                )}
            </div>
        </form>
      </div>
    </div>
  );
}
