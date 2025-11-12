
'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, Upload } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { doc, setDoc, writeBatch, collection, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/app/admin/employees/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

type Suggestion = {
    place_id: number;
    display_name: string;
};

export default function AdminCompleteProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [uid, setUid] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [phone, setPhone] = useState('');

    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                console.error("Cloudinary upload error:", errorText);
                throw new Error(`Upload failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.secure_url) {
                setImageUrl(data.secure_url);
                toast({ title: "Photo Uploaded!", description: "Your profile photo has been updated." });
            } else {
                console.error("Cloudinary upload failed:", data);
                throw new Error('Image URL not found in response');
            }
        } catch (error) {
            console.error("Error uploading photo to Cloudinary:", error);
            toast({ title: "Upload Failed", description: "Could not upload your photo.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };
    
    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=5`);
            const data: Suggestion[] = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error("Failed to fetch address suggestions:", error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setAddress(value);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500); // 500ms debounce
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setAddress(suggestion.display_name);
        setSuggestions([]);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const shopName = formData.get('shopName') as string;
        const gstNumber = formData.get('gstNumber') as string;


        if (!shopName || !businessType || !address || !phone) {
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
            name,
            email,
            phone: `+91${phone}`,
            role: 'Admin',
            status: 'Active',
            isProfileComplete: true,
            fallback,
            joinDate: new Date().toISOString().split('T')[0],
            imageUrl: imageUrl || `https://placehold.co/100x100.png?text=${fallback}`,
        };

        const newShopRef = doc(db, "shops", uid); 

        const shopProfile = {
            id: newShopRef.id,
            ownerName: name,
            ownerId: uid,
            shopName,
            businessType,
            address,
            phone: `+91${phone}`,
            email,
            gstNumber,
            status: 'active',
        };

        try {
            const batch = writeBatch(db);

            const userDocRef = doc(db, "users", uid);
             const mainUserProfile = {
                ...userAsEmployeeProfile,
                shopId: newShopRef.id, 
             };
            batch.set(userDocRef, mainUserProfile, { merge: true });

            batch.set(newShopRef, shopProfile, { merge: true });

            const ownerAsEmployeeRef = doc(db, 'shops', newShopRef.id, 'employees', uid);
            batch.set(ownerAsEmployeeRef, { ...userAsEmployeeProfile, shopId: newShopRef.id });

            const shopDocSnap = await getDoc(newShopRef);
            const referredBy = shopDocSnap.data()?.referredBy;
            if (referredBy) {
                const referrerShopRef = doc(db, 'shops', referredBy);
                const referrerShopSnap = await getDoc(referrerShopRef);
                if (referrerShopSnap.exists()) {
                    const newReferralRef = doc(collection(db, 'shops', referredBy, 'referrals'));
                    batch.set(newReferralRef, {
                        referredShopId: uid,
                        referredShopName: shopName,
                        status: 'Joined',
                        date: new Date().toISOString(),
                    });
                }
            }

            await batch.commit();


            toast({
                title: "Profile Complete!",
                description: "Welcome! Your shop profile has been created.",
            });
            
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
                <div className="relative space-y-2">
                    <Label htmlFor="address">Full Shop Address *</Label>
                    <Textarea id="address" name="address" placeholder="e.g. 123 Main Street, City, State, Pincode" required value={address} onChange={handleAddressChange} />
                     {isSearching && (
                        <div className="absolute top-full left-0 w-full p-2 z-10">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                    {suggestions.length > 0 && (
                        <Card className="absolute top-full left-0 w-full max-h-60 overflow-y-auto z-10 shadow-lg">
                            <CardContent className="p-2">
                                {suggestions.map(suggestion => (
                                    <button
                                        key={suggestion.place_id}
                                        type="button"
                                        className="w-full text-left p-2 rounded-md hover:bg-accent text-sm"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion.display_name}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}
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
