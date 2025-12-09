
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInMonths, differenceInYears } from 'date-fns';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, signOut, type User as AuthUser, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/app/admin/employees/page';
import { Loader2, LogOut, Upload, Bell, Edit, Save, X, User as UserIcon, Settings, KeyRound, ShieldCheck, Camera, LocateFixed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type Suggestion = {
    place_id: number;
    display_name: string;
};

const calculateTenure = (joinDate: string | undefined) => {
    if (!joinDate) return 'N/A';
    const startDate = new Date(joinDate);
    const endDate = new Date();
    
    const years = differenceInYears(endDate, startDate);
    const months = differenceInMonths(endDate, startDate) % 12;

    if (years === 0 && months === 0) {
        return 'New Joiner';
    }

    let tenureString = '';
    if (years > 0) {
        tenureString += `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        if (tenureString.length > 0) tenureString += ', ';
        tenureString += `${months} month${months > 1 ? 's' : ''}`;
    }
    
    return tenureString || 'Less than a month';
};

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [editableProfile, setEditableProfile] = useState<Partial<AppUser>>({
      name: '',
      aadhaar: '',
      imageUrl: '',
      address: '',
      phone: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [tenure, setTenure] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

   const checkPermissions = useCallback(async () => {
    try {
      const cameraStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(cameraStatus.state);
      cameraStatus.onchange = () => setCameraPermission(cameraStatus.state);

      const locationStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setLocationPermission(locationStatus.state);
      locationStatus.onchange = () => setLocationPermission(locationStatus.state);
    } catch (error) {
      console.warn("Permission status API not supported.", error);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const profile = { id: userDocSnap.id, ...userDocSnap.data() } as AppUser;
            setUserProfile(profile);
            setEditableProfile(profile);
            setAddress(profile.address || '');
        } else {
            router.push('/employee/login');
        }
      } else {
        router.push('/employee/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast, checkPermissions]);

  useEffect(() => {
    if (userProfile) {
        setTenure(calculateTenure(userProfile.joinDate));
    }
  }, [userProfile]);
  
  const requestCameraPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        checkPermissions();
      } catch (error) {
        toast({ title: "Camera access was denied.", variant: "destructive" });
        checkPermissions();
      }
  };

  const requestLocationPermission = async () => {
      try {
          await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          checkPermissions();
      } catch (error) {
          toast({ title: "Location access was denied.", variant: "destructive" });
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
      }, 500);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
      setAddress(suggestion.display_name);
      setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditableProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveChanges = async () => {
    if (!authUser || !userProfile?.id) return;
    setSaving(true);
    const userDocRef = doc(db, 'users', userProfile.id);
    try {
        if (newPassword) {
            if (newPassword.length < 6) {
                toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
                setSaving(false);
                return;
            }
            await updatePassword(authUser, newPassword);
            setNewPassword(''); 
            toast({ title: "Password Updated", description: "Your new password has been set." });
        }

        const updateData: Partial<AppUser> = {
            name: editableProfile.name,
            aadhaar: editableProfile.aadhaar,
            address: address, // Save address from state
            phone: editableProfile.phone,
            fallback: editableProfile.name?.split(' ').map(n => n[0]).join('')
        };

        await updateDoc(userDocRef, updateData);
        
        if(userProfile.shopId) {
            const shopEmployeeDocRef = doc(db, 'shops', userProfile.shopId, 'employees', userProfile.id);
            await updateDoc(shopEmployeeDocRef, updateData);
        }

        setUserProfile(prev => ({...prev!, ...updateData}));
        setEditableProfile(prev => ({...prev, ...updateData}));
        toast({ title: "Success", description: "Your profile has been updated." });
        setActiveTab('profile');
    } catch (error: any) {
        console.error("Error updating profile:", error);
        let description = "Could not update your profile.";
        if (error.code === 'auth/requires-recent-login') {
            description = "This action is sensitive and requires a recent login. Please log out and log back in to change your password."
        }
        toast({ title: "Error", description, variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !authUser || !userProfile?.id) {
      return;
    }
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
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.secure_url) {
          const imageUrl = data.secure_url;
          setEditableProfile(prev => ({ ...prev, imageUrl }));
          
          const userDocRef = doc(db, 'users', userProfile.id);
          await updateDoc(userDocRef, { imageUrl });
          if(userProfile.shopId) {
                const shopEmployeeDocRef = doc(db, 'shops', userProfile.shopId, 'employees', userProfile.id);
                await updateDoc(shopEmployeeDocRef, { imageUrl });
          }
          
          setUserProfile(prev => ({...(prev as AppUser), imageUrl }));
          toast({ title: "Photo Updated!", description: `Your new profile photo has been saved.` });
      } else {
          throw new Error('Image URL not found in response');
      }
    } catch (error) {
      console.error("Error uploading photo to Cloudinary:", error);
      toast({ title: "Upload Failed", description: "Could not upload your photo. Please try again.", variant: "destructive"});
    } finally {
      setUploading(false);
    }
  };
  
  if (loading || !userProfile) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading your profile...</p>
        </div>
    );
  }

  const renderProfileView = () => (
    <div className="space-y-6">
        <Card className="w-full max-w-3xl mx-auto border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
            <CardContent className="pt-6">
                 <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-2 border-primary flex-shrink-0">
                        <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                        <p className="text-muted-foreground">{userProfile.employeeId}</p>
                        {tenure && <p className="text-sm text-primary font-medium mt-1">Tenure: {tenure}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
            <CardHeader>
                <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-1">
                    <Label>Full Name</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.name}</p>
                </div>
                <div className="space-y-1">
                    <Label>Email Address</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.email}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Phone Number</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.phone || 'Not Provided'}</p>
                </div>
                <div className="space-y-1">
                    <Label>Aadhaar Number</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.aadhaar || 'Not Provided'}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Address</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.address || 'Not Provided'}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Date Joined</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.joinDate || 'N/A'}</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );

  const renderProfileEdit = () => (
     <div className="space-y-6">
        <Card className="w-full max-w-3xl mx-auto border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
            <CardContent className="pt-6">
                 <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-2 border-primary flex-shrink-0">
                        <AvatarImage src={editableProfile.imageUrl} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 flex-1 w-full">
                        <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                        <p className="text-muted-foreground">{userProfile.employeeId}</p>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                          Change Photo
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      <Card className="border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
        <CardHeader>
          <CardTitle>Edit Information</CardTitle>
          <CardDescription>Update your contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={editableProfile.name || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number</Label>
              <Input id="aadhaar" value={editableProfile.aadhaar || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={editableProfile.phone || ''} onChange={handleInputChange} />
            </div>
          </div>
           <div className="relative space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Start typing your address..." value={address} onChange={handleAddressChange} />
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
        </CardContent>
        <CardContent className="border-t pt-6 flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSaveChanges} disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
            <Button variant="outline" onClick={() => { setActiveTab('profile'); setEditableProfile(userProfile); setAddress(userProfile.address || ''); }} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4"/>
                Cancel
            </Button>
        </CardContent>
      </Card>
     </div>
  );

  return (
    <div className="space-y-6">
        <div className="hidden md:block">
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">View and update your personal information.</p>
        </div>
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full md:grid md:grid-cols-[minmax(180px,220px)_1fr] md:gap-8 md:items-start"
        >
            <TabsList className="h-auto items-start justify-start rounded-md bg-transparent p-0 hidden md:flex md:flex-col md:gap-1 md:bg-transparent md:p-0 md:sticky top-20">
                <TabsTrigger value="profile" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold text-base py-3 px-4 rounded-lg border-2 hover:bg-muted/50 hover:border-border transition-all duration-300 ease-out">
                    <UserIcon className="mr-2 h-5 w-5" /> Profile
                </TabsTrigger>
                 <TabsTrigger value="edit-profile" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold text-base py-3 px-4 rounded-lg border-2 hover:bg-muted/50 hover:border-border transition-all duration-300 ease-out">
                    <Edit className="mr-2 h-5 w-5" /> Edit Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold text-base py-3 px-4 rounded-lg border-2 hover:bg-muted/50 hover:border-border transition-all duration-300 ease-out">
                    <KeyRound className="mr-2 h-5 w-5" /> Security
                </TabsTrigger>
                <TabsTrigger value="permissions" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold text-base py-3 px-4 rounded-lg border-2 hover:bg-muted/50 hover:border-border transition-all duration-300 ease-out">
                    <ShieldCheck className="mr-2 h-5 w-5" /> Permissions
                </TabsTrigger>
                <TabsTrigger value="settings" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold text-base py-3 px-4 rounded-lg border-2 hover:bg-muted/50 hover:border-border transition-all duration-300 ease-out">
                    <Settings className="mr-2 h-5 w-5" /> Settings
                </TabsTrigger>
            </TabsList>
            
            <div className="md:hidden border-2 border-border rounded-lg p-1">
              <TabsList className="grid w-full grid-cols-2 p-0 h-auto rounded-md bg-muted">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-sm py-2 transition-all duration-300 flex items-center gap-2">
                      <UserIcon className="h-4 w-4" /> Profile
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-sm py-2 transition-all duration-300 flex items-center gap-2">
                      <Settings className="h-4 w-4" /> Settings
                  </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="mt-6 md:mt-0">
                <TabsContent value="profile" forceMount={true} className={cn('mt-0', activeTab !== 'profile' && 'hidden')}>
                    {renderProfileView()}
                </TabsContent>
                 <TabsContent value="edit-profile" forceMount={true} className={cn('mt-0', activeTab !== 'edit-profile' && 'hidden')}>
                    {renderProfileEdit()}
                </TabsContent>
                <TabsContent value="security" className="space-y-6 mt-0">
                    <Card className="border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Set a new password for your account.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-w-sm">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" type="password" placeholder="Min. 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                        </CardContent>
                         <CardContent className="border-t pt-6">
                            <Button onClick={handleSaveChanges} disabled={saving}>
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                                Save New Password
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="permissions" className="space-y-6 mt-0">
                     <Card className="border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
                        <CardHeader>
                            <CardTitle>App Permissions</CardTitle>
                            <CardDescription>Manage access to your device's features for attendance.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <Camera className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Camera Access</p>
                                        <p className="text-xs text-muted-foreground">Required for Selfie Attendance</p>
                                    </div>
                                </div>
                                <Button onClick={requestCameraPermission} disabled={cameraPermission === 'granted'} variant={cameraPermission === 'granted' ? 'secondary' : 'default'}>
                                    {cameraPermission === 'granted' ? 'Enabled' : 'Enable'}
                                </Button>
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <LocateFixed className="h-6 w-6 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">Location Access</p>
                                        <p className="text-xs text-muted-foreground">Required for location verification</p>
                                    </div>
                                </div>
                                 <Button onClick={requestLocationPermission} disabled={locationPermission === 'granted'} variant={locationPermission === 'granted' ? 'secondary' : 'default'}>
                                    {locationPermission === 'granted' ? 'Enabled' : 'Enable'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="settings" forceMount={true} className={cn('mt-0', activeTab !== 'settings' && 'hidden')}>
                     <Card className="border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                            <Label htmlFor="theme-switcher" className="font-medium">Theme</Label>
                            <ThemeSwitcher />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="mt-6 border-2 border-destructive hover:border-destructive">
                         <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-destructive">Account Actions</CardTitle>
                                <CardDescription>This action will end your current session.</CardDescription>
                            </div>
                            <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4"/>
                                Logout
                            </Button>
                        </CardHeader>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
    </div>
  );
}
