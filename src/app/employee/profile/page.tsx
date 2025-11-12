
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInMonths, differenceInYears } from 'date-fns';
import { auth, db, requestForToken } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, signOut, type User as AuthUser, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/app/admin/employees/page';
import { Loader2, LogOut, Upload, Bell, Edit, Save, X, User as UserIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  });
  const [newPassword, setNewPassword] = useState('');
  const [tenure, setTenure] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const profile = { id: userDocSnap.id, ...userDocSnap.data() } as AppUser;
            setUserProfile(profile);
            setEditableProfile(profile);
        } else {
            router.push('/employee/login');
        }
      } else {
        router.push('/employee/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    if (userProfile) {
        setTenure(calculateTenure(userProfile.joinDate));
    }
  }, [userProfile]);


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
        }

        const updateData = {
            name: editableProfile.name,
            aadhaar: editableProfile.aadhaar,
            fallback: editableProfile.name?.split(' ').map(n => n[0]).join('')
        };

        await updateDoc(userDocRef, updateData);
        
        if(userProfile.shopId) {
            const shopEmployeeDocRef = doc(db, 'shops', userProfile.shopId, 'employees', userProfile.id);
            await updateDoc(shopEmployeeDocRef, updateData);
        }

        setUserProfile(prev => ({...prev!, ...updateData, imageUrl: editableProfile.imageUrl}));
        setEditableProfile(prev => ({...prev, ...updateData}));
        toast({ title: "Success", description: "Your profile has been updated." });
        setIsEditing(false);
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

  const handleEnableNotifications = async () => {
    if (!authUser) return;
    setNotifLoading(true);
    try {
      const token = await requestForToken();
      if (token && userProfile?.id) {
        const userDocRef = doc(db, 'users', userProfile.id);
        await updateDoc(userDocRef, { fcmToken: token });
        toast({
          title: "Notifications Enabled!",
          description: "You will now receive check-in and check-out reminders.",
        });
      }
    } catch (error) {
      console.error('An error occurred while enabling notifications: ', error);
      toast({
        title: 'Error Enabling Notifications',
        description: 'Please ensure you have granted permission and try again.',
        variant: 'destructive',
      });
    } finally {
        setNotifLoading(false);
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
        const errorText = await response.text();
        console.error("Cloudinary upload error:", errorText);
        throw new Error(`Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.secure_url) {
          const imageUrl = data.secure_url;
          
          setEditableProfile(prev => ({ ...prev, imageUrl: imageUrl }));
          
          const userDocRef = doc(db, 'users', userProfile.id);
          await updateDoc(userDocRef, { imageUrl: imageUrl });
           if(userProfile.shopId) {
                const shopEmployeeDocRef = doc(db, 'shops', userProfile.shopId, 'employees', userProfile.id);
                await updateDoc(shopEmployeeDocRef, { imageUrl: imageUrl });
            }
          
          setUserProfile(prev => ({...(prev as AppUser), imageUrl: imageUrl }));
          toast({ title: "Photo Updated!", description: "Your new profile photo has been saved." });
      } else {
          console.error("Cloudinary upload failed:", data);
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
        <Card className="w-full max-w-3xl mx-auto">
            <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary flex-shrink-0">
                        <AvatarImage src={userProfile.imageUrl} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="text-left space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold">{userProfile.name}</h2>
                        <p className="text-sm text-muted-foreground">{userProfile.employeeId}</p>
                        {tenure && <p className="text-sm text-primary font-medium mt-1">Tenure: {tenure}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
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
                    <Label>Aadhaar Number</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.aadhaar || 'Not Provided'}</p>
                </div>
                 <div className="space-y-1">
                    <Label>Date Joined</Label>
                    <p className="font-medium text-muted-foreground">{userProfile.joinDate || 'N/A'}</p>
                </div>
            </CardContent>
             <CardFooter>
                <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </CardFooter>
        </Card>
    </div>
  );

  const renderProfileEdit = () => (
     <div className="space-y-6">
        <Card className="w-full max-w-3xl mx-auto">
            <CardContent className="pt-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-primary flex-shrink-0">
                        <AvatarImage src={editableProfile.imageUrl} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.fallback}</AvatarFallback>
                    </Avatar>
                    <div className="text-left space-y-1 flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold">{userProfile.name}</h2>
                        <p className="text-sm text-muted-foreground">{userProfile.employeeId}</p>
                         <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                        <Button variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
                          Change Photo
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      <Card>
        <CardHeader>
          <CardTitle>Edit Information</CardTitle>
          <CardDescription>Update your contact details and password.</CardDescription>
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
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Leave blank to keep current password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSaveChanges} disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
            <Button variant="outline" onClick={() => { setIsEditing(false); setEditableProfile(userProfile); }} className="w-full sm:w-auto">
                <X className="mr-2 h-4 w-4"/>
                Cancel
            </Button>
        </CardFooter>
      </Card>
     </div>
  );

  return (
    <div className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">
                    <UserIcon className="mr-2 h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
                {isEditing ? renderProfileEdit() : renderProfileView()}
            </TabsContent>
            <TabsContent value="settings" className="mt-6 space-y-6">
                 <Card>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Enable or disable reminders and alerts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-semibold">Enable Browser Notifications</h4>
                                    <p className="text-xs text-muted-foreground">Allow notifications to get check-in/out reminders.</p>
                                </div>
                                <Button variant="secondary" onClick={handleEnableNotifications} disabled={notifLoading}>
                                    {notifLoading ? <Loader2 className="mr-2 animate-spin"/> : <Bell className="mr-2"/>}
                                    Enable
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button variant="destructive" className="w-full max-w-xs" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4"/>
                            Logout
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
