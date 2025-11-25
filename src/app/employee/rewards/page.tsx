
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Award, Star, ShieldCheck, Flame, CalendarCheck, Loader2, Landmark, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as AuthUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs, onSnapshot, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { User as AppUser } from "@/app/admin/employees/page";
import { differenceInYears } from "date-fns";

type GamificationSettings = {
    onTimePoints: number;
    gracePeriodMinutes: number;
    lateCategory1Minutes: number;
    lateCategory1Points: number;
    lateCategory2Minutes: number;
    lateCategory2Points: number;
    lateCategory3Minutes: number;
    lateCategory3Points: number;
    absentMinutes: number;
    absentPoints: number;
    streakBonusDays: number;
    streakBonusPoints: number;
};

const defaultGamificationSettings: GamificationSettings = {
    onTimePoints: 1,
    gracePeriodMinutes: 5,
    lateCategory1Minutes: 10,
    lateCategory1Points: -1,
    lateCategory2Minutes: 30,
    lateCategory2Points: -2,
    lateCategory3Minutes: 60,
    lateCategory3Points: -3,
    absentMinutes: 60,
    absentPoints: -5,
    streakBonusDays: 5,
    streakBonusPoints: 50,
};

const badges = [
    { id: "streak", icon: <Flame className="h-8 w-8" />, name: "Hot Streak", description: (settings: GamificationSettings) => `${settings.streakBonusDays}-day on-time streak`, unlocked: (user: AppUser, rank: number, settings: GamificationSettings) => user.streak >= settings.streakBonusDays },
    { id: "points", icon: <Trophy className="h-8 w-8" />, name: "Punctuality Pro", description: () => "1000 total points", unlocked: (user: AppUser) => user.points >= 1000 },
    { id: "veteran", icon: <Landmark className="h-8 w-8" />, name: "Veteran", description: () => "1 year of service", unlocked: (user: AppUser) => {
        if (!user.joinDate) return false;
        return differenceInYears(new Date(), new Date(user.joinDate)) >= 1;
    }},
    { id: "month", icon: <Award className="h-8 w-8" />, name: "Perfect Month", description: () => "No late check-ins for a month", unlocked: () => false }, // Needs complex logic
    { id: "early", icon: <Star className="h-8 w-8" />, name: "Early Bird", description: () => "Check in 30 mins before shift", unlocked: () => false }, // Needs complex logic
    { id: "rank", icon: <ShieldCheck className="h-8 w-8" />, name: "Top Performer", description: () => "Reach #1 on the leaderboard", unlocked: (user: AppUser, rank: number) => rank === 1 },
];

export default function RewardsPage() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<AppUser | null>(null);
    const [rank, setRank] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gamificationSettings, setGamificationSettings] = useState<GamificationSettings>(defaultGamificationSettings);


    useEffect(() => {
        const fetchUserData = async (user: AuthUser) => {
            const db = getFirestore();
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const profile = { id: userDocSnap.id, ...userDocSnap.data() } as AppUser;
                    setUserProfile(profile);
                    if (profile.shopId) {
                        await fetchRank(profile.id!, profile.shopId);
                        
                        // Fetch gamification settings
                        const settingsDocRef = doc(db, 'shops', profile.shopId, 'config', 'main');
                        const settingsSnap = await getDoc(settingsDocRef);
                        if (settingsSnap.exists() && settingsSnap.data().gamification) {
                            setGamificationSettings({ ...defaultGamificationSettings, ...settingsSnap.data().gamification });
                        }
                    }
                } else {
                    router.push('/employee/login');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchRank = async (employeeId: string, shopId: string) => {
            const db = getFirestore();
            const usersCollectionRef = collection(db, 'shops', shopId, 'employees');
            const q = query(usersCollectionRef, orderBy('points', 'desc'));
            const querySnapshot = await getDocs(q);
            const userRank = querySnapshot.docs.findIndex(doc => doc.id === employeeId) + 1;
            setRank(userRank);
        };
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchUserData(user);
            } else {
                setLoading(false);
                router.push('/employee/login');
            }
        });

        return () => unsubscribe();
    }, [router]);


  if (loading || !userProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your rewards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Rewards</h1>
        <p className="text-muted-foreground">Your achievements and progress.</p>
      </div>
      <Separator />

      <Card className="w-full bg-gradient-to-tr from-primary to-blue-700 text-primary-foreground border-none transition-all duration-300 ease-out hover:shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl text-white">Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Trophy className="h-8 sm:h-10 sm:w-10 text-yellow-300 mb-2"/>
                <p className="text-2xl sm:text-3xl font-bold text-white">{userProfile.points.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-blue-200">Total Points</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Award className="h-8 sm:h-10 sm:w-10 text-yellow-300 mb-2"/>
                <p className="text-2xl sm:text-3xl font-bold text-white">{rank > 0 ? `#${rank}` : 'N/A'}</p>
                <p className="text-xs sm:text-sm text-blue-200">Current Rank</p>
            </div>
             <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Flame className="h-8 sm:h-10 sm:w-10 text-yellow-300 mb-2"/>
                <p className="text-2xl sm:text-3xl font-bold text-white">{userProfile.streak}</p>
                <p className="text-xs sm:text-sm text-blue-200">Day Streak</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <CalendarCheck className="h-8 sm:h-10 sm:w-10 text-yellow-300 mb-2"/>
                <p className="text-2xl sm:text-3xl font-bold text-white">0</p>
                <p className="text-xs sm:text-sm text-blue-200">Perfect Days</p>
            </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/>Points System</CardTitle>
            <CardDescription>How to earn and lose points, as set by your manager.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
            <p><strong className="text-primary">+{gamificationSettings.onTimePoints} points</strong> for each on-time check-in.</p>
            <p><strong className="text-primary">0 points</strong> for checking in within the {gamificationSettings.gracePeriodMinutes}-minute grace period.</p>
            <p><strong className="text-destructive">{gamificationSettings.lateCategory1Points} points</strong> for being {gamificationSettings.gracePeriodMinutes + 1}-{gamificationSettings.lateCategory1Minutes} minutes late.</p>
            <p><strong className="text-destructive">{gamificationSettings.lateCategory2Points} points</strong> for being {gamificationSettings.lateCategory1Minutes + 1}-{gamificationSettings.lateCategory2Minutes} minutes late.</p>
            <p><strong className="text-destructive">{gamificationSettings.lateCategory3Points} points</strong> for being over {gamificationSettings.lateCategory2Minutes} minutes late.</p>
             <p><strong className="text-destructive">{gamificationSettings.absentPoints} points</strong> for being absent (more than {gamificationSettings.absentMinutes} mins late).</p>
            <Separator className="my-2"/>
            <p><strong className="text-primary">+{gamificationSettings.streakBonusPoints} bonus points</strong> for a {gamificationSettings.streakBonusDays}-day on-time streak.</p>
        </CardContent>
      </Card>
      
      <Card className="transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
        <CardHeader>
            <CardTitle>Achievement Badges</CardTitle>
            <CardDescription>Collect badges for your accomplishments.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {badges.map(badge => {
                const isUnlocked = badge.unlocked(userProfile, rank, gamificationSettings);
                const description = typeof badge.description === 'function' ? badge.description(gamificationSettings) : badge.description;
                return (
                    <div key={badge.id} className={`flex flex-col items-center justify-start text-center p-4 border-2 rounded-lg transition-all ${isUnlocked ? 'border-primary bg-primary/5' : 'border-dashed opacity-50'}`}>
                       <div className={`mb-3 text-primary ${!isUnlocked && 'grayscale'}`}>
                            {badge.icon}
                       </div>
                       <p className={`font-semibold text-sm ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>{badge.name}</p>
                       <p className="text-xs text-muted-foreground mt-1">{description}</p>
                       {!isUnlocked && <div className="mt-3 px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">Locked</div>}
                    </div>
                );
            })}
        </CardContent>
      </Card>

    </div>
  );
}
