
'use client';

import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, ArrowLeft, MapPin } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onAuthStateChanged, type User as AuthUser, getAuth } from 'firebase/auth';
import Link from 'next/link';
import { Loader } from '@googlemaps/js-api-loader';

type ShopProfile = {
    shopName: string;
    businessType: string;
    address: string;
    email: string;
    gstNumber: string;
    latitude: string;
    longitude: string;
};


function EditBranchContent() {
    const router = useRouter();
    const params = useParams();
    const { branchId } = params as { branchId: string };
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Partial<ShopProfile>>({});

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
            } else {
                router.replace('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [router]);
    
    useEffect(() => {
        if (!authUser || !branchId) return;
        const db = getFirestore();

        const fetchBranch = async () => {
            setLoading(true);
            const shopDocRef = doc(db, 'shops', branchId);
            const shopSnap = await getDoc(shopDocRef);

            if (shopSnap.exists() && shopSnap.data().ownerId === authUser.uid) {
                setProfile(shopSnap.data());
            } else {
                toast({ title: "Not Found", description: "This branch either does not exist or you do not have permission to edit it.", variant: "destructive"});
                router.replace('/admin/branches');
            }
            setLoading(false);
        };
        
        fetchBranch();
    }, [authUser, branchId, router, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSelectChange = (value: string) => {
        setProfile(prev => ({...prev, businessType: value}));
    };

    const handleFetchLocation = async () => {
        setLocationLoading(true);
        if (!navigator.geolocation) {
            toast({ title: "Geolocation not supported", variant: "destructive" });
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
                version: "weekly",
            });

            try {
                const { Geocoder } = await loader.importLibrary("geocoding");
                const geocoder = new Geocoder();
                const response = await geocoder.geocode({ location: { lat, lng } });
                
                if (response.results[0]) {
                    setProfile(prev => ({
                        ...prev,
                        latitude: lat.toString(),
                        longitude: lng.toString(),
                        address: response.results[0].formatted_address
                    }));
                    toast({ title: "Location Updated!", description: "Address and coordinates have been updated." });
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
            toast({ title: "Location Access Denied", variant: "destructive" });
            setLocationLoading(false);
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile.shopName || !profile.businessType || !profile.address || !profile.latitude || !profile.longitude) {
             toast({ title: "Error", description: "Please fill out all required fields, including location coordinates.", variant: "destructive" });
             return;
        }

        setSaving(true);
        const db = getFirestore();
        const shopDocRef = doc(db, 'shops', branchId);
        try {
            await updateDoc(shopDocRef, {
                shopName: profile.shopName,
                businessType: profile.businessType,
                address: profile.address,
                email: profile.email || '',
                gstNumber: profile.gstNumber || '',
                latitude: profile.latitude,
                longitude: profile.longitude,
            });

            toast({
                title: "Branch Updated!",
                description: `${profile.shopName} has been successfully updated.`,
            });
            router.push('/admin/branches');

        } catch (error) {
            console.error("Error updating branch:", error);
            toast({ title: "Error", description: "Could not update the branch. Please try again.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/branches">
                    <Button variant="outline" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="text-left">
                    <h1 className="text-3xl font-bold">Edit Branch Details</h1>
                    <p className="text-muted-foreground mt-1">
                        Update the information for {profile.shopName}.
                    </p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="shopName">Branch / Shop Name *</Label>
                        <Input id="shopName" name="shopName" value={profile.shopName || ''} onChange={handleInputChange} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type *</Label>
                        <Select onValueChange={handleSelectChange} value={profile.businessType || ''} required>
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
                        <Input id="email" name="email" type="email" value={profile.email || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gstNumber">Branch GST Number (Optional)</Label>
                        <Input id="gstNumber" name="gstNumber" value={profile.gstNumber || ''} onChange={handleInputChange} />
                    </div>
                </div>
                
                <div className="space-y-4 rounded-lg border-2 p-4">
                    <div className='flex items-start gap-3'>
                        <MapPin className='h-5 w-5 text-primary mt-1' />
                        <div>
                            <h3 className="font-semibold">Branch Location & Address *</h3>
                            <p className="text-xs text-muted-foreground">Update the branch's location and address automatically.</p>
                        </div>
                    </div>
                    <Button type="button" onClick={handleFetchLocation} disabled={locationLoading} className="w-full">
                        {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Update to My Current Location
                    </Button>
                    <div className="space-y-2 pt-2 border-t">
                        <Label>Current Address</Label>
                        <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md min-h-[40px]">{profile.address}</p>
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <p>Lat: {profile.latitude || 'N/A'}</p>
                            <p>Lon: {profile.longitude || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" className="w-full max-w-sm" disabled={saving}>
                    {saving && <Loader2 className="mr-2 animate-spin" />}
                    <Store className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default function EditBranchPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <EditBranchContent />
        </Suspense>
    )
}
