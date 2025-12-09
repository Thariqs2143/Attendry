
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Upload, MapPin } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as AppUser } from '@/app/admin/employees/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader } from '@googlemaps/js-api-loader';

type ShopProfile = {
    ownerName?: string;
    shopName?: string;
    businessType?: string;
    address?: string;
    email?: string;
    gstNumber?: string;
    latitude?: string;
    longitude?: string;
};

type FullProfile = AppUser & ShopProfile;

export default function AdminProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<Partial<FullProfile>>({
        name: '', email: '', phone: '', shopName: '', businessType: '',
        address: '', gstNumber: '', imageUrl: '', latitude: '', longitude: ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                setLoading(true);
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userSnap = await getDoc(userDocRef);
                    const userData = userSnap.exists() ? userSnap.data() : {};

                    const shopDocRef = doc(db, 'shops', user.uid);
                    const shopSnap = await getDoc(shopDocRef);
                    const shopData = shopSnap.exists() ? shopSnap.data() : {};
                    
                    setProfile({ ...userData, ...shopData });
                } catch (error) {
                    toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            } else {
                router.push('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [router, toast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSelectChange = (value: string) => {
        setProfile(prev => ({...prev, businessType: value}));
    };
    
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !authUser) return;
        
        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'attendry_uploads');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dkek6cset/image/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${await response.text()}`);
            }

            const data = await response.json();
            const imageUrl = data.secure_url;
            setProfile(prev => ({ ...prev, imageUrl: imageUrl }));
            
            const userDocRef = doc(db, "users", authUser.uid);
            await updateDoc(userDocRef, { imageUrl: imageUrl });
            toast({ title: "Photo Uploaded!", description: "Your profile photo has been updated." });
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast({ title: "Upload Failed", variant: "destructive" });
        } finally {
            setUploading(false);
        }
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
        setSaving(true);
        
        if (!authUser) {
            toast({ title: "Error", description: "You are not authenticated.", variant: "destructive" });
            setSaving(false);
            return;
        }

        if (!profile.name || !profile.shopName || !profile.businessType || !profile.address || !profile.latitude || !profile.longitude) {
             toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
             setSaving(false);
             return;
        }

        try {
            const batch = writeBatch(db);
            const userDocRef = doc(db, "users", authUser.uid);
            batch.update(userDocRef, {
                name: profile.name, email: profile.email || '',
                fallback: profile.shopName.split(' ').map(n => n[0]).join(''),
                imageUrl: profile.imageUrl || '',
            });
            
            const shopDocRef = doc(db, "shops", authUser.uid);
            batch.update(shopDocRef, {
                ownerName: profile.name, shopName: profile.shopName,
                businessType: profile.businessType, address: profile.address,
                email: profile.email || '', gstNumber: profile.gstNumber || '',
                latitude: profile.latitude, longitude: profile.longitude,
            });

            await batch.commit();
            toast({ title: "Profile Updated!", description: "Your shop profile has been saved." });
            router.push('/admin/settings');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Error", description: "Could not save your profile.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-4">
                 <Link href="/admin/settings">
                    <Button variant="outline" size="icon" type="button">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="text-left">
                    <h1 className="text-3xl font-bold">Edit Shop Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Update your business details below.
                    </p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                     <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={profile.imageUrl ?? undefined} />
                        <AvatarFallback>{profile.shopName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                     <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                      Change Photo
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Contact Person Name *</Label>
                        <Input id="name" value={profile.name || ''} onChange={handleInputChange} placeholder="e.g. John Doe" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Contact Phone Number</Label>
                        <Input id="phone" type="tel" value={profile.phone || ''} required readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shopName">Shop / Business Name *</Label>
                        <Input id="shopName" value={profile.shopName || ''} onChange={handleInputChange} placeholder="e.g. JD Retail Store" required />
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
                        <Label htmlFor="email">Business Email Address</Label>
                        <Input id="email" type="email" value={profile.email || ''} onChange={handleInputChange} placeholder="e.g. contact@jdretail.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                        <Input id="gstNumber" value={profile.gstNumber || ''} onChange={handleInputChange} placeholder="e.g. 29ABCDE1234F1Z5" />
                    </div>
                </div>

                <div className="space-y-4 rounded-lg border-2 p-4">
                    <div className='flex items-start gap-3'>
                        <MapPin className='h-5 w-5 text-primary mt-1' />
                        <div>
                            <h3 className="font-semibold">Shop Location & Address *</h3>
                            <p className="text-xs text-muted-foreground">Update your location and address automatically.</p>
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
                <Button type="submit" size="lg" className="w-full max-w-sm" disabled={saving || uploading}>
                    {saving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
