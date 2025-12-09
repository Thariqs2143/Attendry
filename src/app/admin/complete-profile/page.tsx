
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, Upload, MapPin } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/app/admin/employees/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AdminCompleteProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [uid, setUid] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [phone, setPhone] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const adminUID = localStorage.getItem('adminUID');
        const adminEmail = localStorage.getItem('adminEmail');
        const adminName = localStorage.getItem('adminName');
        if (adminUID && adminEmail && adminName) {
            setUid(adminUID);
            setEmail(adminEmail);
            setName(adminName);
        } else {
            toast({ title: "Error", description: "Could not find admin information. Please log in again.", variant: "destructive"});
            router.replace('/login');
        }
    }, [router, toast]);
    
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
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
                const errorText = await response.text();
                throw new Error(`Upload failed: ${errorText}`);
            }
            
            const data = await response.json();
            setImageUrl(data.secure_url);
            toast({ title: "Photo Uploaded!", description: "Your profile photo has been updated." });
        } catch (error) {
            console.error("Error uploading photo:", error);
            toast({ title: "Upload Failed", description: "Could not upload your photo.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };
    
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
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const shopName = formData.get('shopName') as string;
        const gstNumber = formData.get('gstNumber') as string;

        if (!shopName || !businessType || !address || !phone || !latitude || !longitude) {
             toast({ title: "Error", description: "Please fill out all required fields.", variant: "destructive" });
             setLoading(false);
             return;
        }

        if (!/^\d{10}$/.test(phone)) {
            toast({ title: "Invalid Phone Number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
            setLoading(false);
            return;
        }
        
        const fallback = shopName.split(' ').map(n => n[0]).join('');

        const userAsEmployeeProfile: Partial<User> = {
            name, email, phone: `+91${phone}`, role: 'Admin', status: 'Active',
            isProfileComplete: true, fallback, joinDate: new Date().toISOString().split('T')[0],
            imageUrl: imageUrl || `https://placehold.co/100x100.png?text=${fallback}`,
        };

        const newShopRef = doc(db, "shops", uid); 

        const shopProfile = {
            id: newShopRef.id, ownerName: name, ownerId: uid, shopName, businessType,
            address, phone: `+91${phone}`, email, gstNumber, status: 'active', latitude, longitude,
        };

        try {
            const batch = writeBatch(db);
            
            const userDocRef = doc(db, "users", uid);
            const mainUserProfile = { ...userAsEmployeeProfile, shopId: newShopRef.id };
            batch.set(userDocRef, mainUserProfile, { merge: true });
            
            batch.set(newShopRef, shopProfile, { merge: true });

            const ownerAsEmployeeRef = doc(db, 'shops', newShopRef.id, 'employees', uid);
            batch.set(ownerAsEmployeeRef, { ...userAsEmployeeProfile, shopId: newShopRef.id, uid: uid });

            await batch.commit();
            toast({ title: "Profile Complete!", description: "Welcome! Your shop profile has been created." });
            
            localStorage.removeItem('adminUID');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminName');
            
            router.push('/admin');
        } catch (error) {
            console.error("Error creating admin profile:", error);
            toast({ title: "Error", description: "Could not save your profile. Please try again.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Setup Your Shop Profile</h1>
                <p className="text-muted-foreground mt-2">
                    Please provide your business details to get started.
                </p>
            </div>
            
            <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={imageUrl ?? undefined} />
                        <AvatarFallback>{name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                     <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                      Upload Photo
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Contact Person Name</Label>
                        <Input id="name" name="name" value={name} required readOnly disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Contact Email Address</Label>
                        <Input id="email" name="email" type="email" value={email} required readOnly disabled />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Contact Phone Number *</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="10-digit mobile number" required maxLength={10} pattern="[0-9]{10}" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shopName">Shop / Business Name *</Label>
                        <Input id="shopName" name="shopName" placeholder="e.g. JD Retail Store" required />
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
                        <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                        <Input id="gstNumber" name="gstNumber" placeholder="e.g. 29ABCDE1234F1Z5" />
                    </div>
                </div>
                
                 <div className="space-y-4 rounded-lg border-2 p-4">
                    <div className='flex items-start gap-3'>
                        <MapPin className='h-5 w-5 text-primary mt-1' />
                        <div>
                            <h3 className="font-semibold">Shop Location & Address *</h3>
                            <p className="text-xs text-muted-foreground">Click the button to automatically find your address and coordinates. This is required for face attendance.</p>
                        </div>
                    </div>
                    <Button type="button" onClick={handleFetchLocation} disabled={locationLoading} className="w-full">
                        {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                        Use My Current Location
                    </Button>
                    <div className="space-y-2 pt-2 border-t">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Auto-filled or type manually" required/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="latitude">Latitude *</Label>
                            <Input id="latitude" name="latitude" placeholder="e.g., 11.0168" required value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="longitude">Longitude *</Label>
                            <Input id="longitude" name="longitude" placeholder="e.g., 76.9558" required value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <Button type="submit" size="lg" className="w-full max-w-sm" disabled={loading || uploading}>
                    {loading && <Loader2 className="mr-2 animate-spin" />}
                    <Store className="mr-2 h-4 w-4" />
                    Complete Setup
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
