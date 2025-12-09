
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Award, Star, ShieldCheck, Flame, CalendarCheck, Loader2, Landmark, Sparkles, UserCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as AuthUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs, onSnapshot, getFirestore, where, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import type { User as AppUser } from "@/app/admin/employees/page";
import { differenceInYears, startOfWeek, endOfWeek } from "date-fns";

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

type WeeklyStat = {
    onTime: number;
    late: number;
};

type AttendanceRecord = {
    id: string;
    checkInTime: Timestamp;
    status: 'On-time' | 'Late' | 'Absent' | 'Manual' | 'Half-day' | 'Grace Period' | 'Late Category 1' | 'Late Category 2' | 'Late Category 3';
};

const defaultGamificationSettings: GamificationSettings = {
    onTimePoints: 10,
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
    { id: "streak", icon: <Flame className="h-8 w-8" />, name: "Hot Streak", description: (settings: GamificationSettings) => `${settings.streakBonusDays}-day on-time streak`, unlocked: (user: AppUser, rank: number, settings: GamificationSettings) => (user.streak || 0) >= settings.streakBonusDays },
    { id: "points", icon: <Trophy className="h-8 w-8" />, name: "Punctuality Pro", description: () => "1000 total points", unlocked: (user: AppUser) => (user.points || 0) >= 1000 },
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
    const [weeklyStats, setWeeklyStats] = useState<WeeklyStat>({ onTime: 0, late: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    // Effect 1: Handle user authentication state
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Set a temporary profile to trigger other effects
                setUserProfile({ uid: user.uid } as AppUser);
            } else {
                setLoading(false);
                router.push('/employee/login');
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    // Effect 2: Set up real-time listener for user profile (points, streak, etc.)
    useEffect(() => {
        if (!userProfile?.uid) return;

        const db = getFirestore();
        const userDocRef = doc(db, "users", userProfile.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
                const profileData = { id: userDocSnap.id, ...userDocSnap.data() } as AppUser;
                setUserProfile(profileData);
            } else {
                router.push('/employee/login');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setLoading(false);
        });

        return () => unsubscribeProfile();
    }, [userProfile?.uid, router]);

    // Effect 3: Set up listeners for shop-specific data (rank, settings, weekly stats)
    useEffect(() => {
        if (!userProfile?.shopId || !userProfile?.id) return;

        const db = getFirestore();
        const shopId = userProfile.shopId;
        const employeeId = userProfile.id;

        // Listener for gamification settings
        const settingsDocRef = doc(db, 'shops', shopId, 'config', 'main');
        const unsubscribeSettings = onSnapshot(settingsDocRef, (settingsSnap) => {
            if (settingsSnap.exists() && settingsSnap.data().gamification) {
                setGamificationSettings({ ...defaultGamificationSettings, ...settingsSnap.data().gamification });
            }
        });

        // Listener for user's rank
        const usersCollectionRef = collection(db, 'shops', shopId, 'employees');
        const qRank = query(usersCollectionRef, orderBy('points', 'desc'));
        const unsubscribeRank = onSnapshot(qRank, (querySnapshot) => {
            const userRank = querySnapshot.docs.findIndex(doc => doc.id === employeeId) + 1;
            setRank(userRank);
        });
        
        // Listener for weekly summary
        setLoadingStats(true);
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const attendanceRef = collection(db, 'shops', shopId, 'attendance');
        const qSummary = query(
            attendanceRef, 
            where('userId', '==', employeeId),
            where('checkInTime', '>=', weekStart),
            where('checkInTime', '<=', weekEnd)
        );
        const unsubscribeSummary = onSnapshot(qSummary, (snapshot) => {
            let onTimeCount = 0;
            let lateCount = 0;
            snapshot.forEach(doc => {
                const record = doc.data() as AttendanceRecord;
                if (record.status === 'On-time') {
                    onTimeCount++;
                } else if (record.status.startsWith('Late')) {
                    lateCount++;
                }
            });
            setWeeklyStats({ onTime: onTimeCount, late: lateCount });
            setLoadingStats(false);
        }, (error) => {
            console.error("Error fetching weekly summary:", error);
            setLoadingStats(false);
        });


        // Cleanup all listeners when component unmounts or shopId changes
        return () => {
            unsubscribeSettings();
            unsubscribeRank();
            unsubscribeSummary();
        };

    }, [userProfile?.shopId, userProfile?.id]);


  if (loading || !userProfile?.name) { // Wait for full profile load
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
                <p className="text-2xl sm:text-3xl font-bold text-white">{(userProfile.points || 0).toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-blue-200">Total Points</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Award className="h-8 sm:h-10 sm:w-10 text-yellow-300 mb-2"/>
                <p className="text-2xl sm:text-3xl font-bold text-white">{rank > 0 ? `#${rank}` : 'N/A'}</p>
                <p className="text-xs sm:text-sm text-blue-200">Current Rank</p>
            </div>
             <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Flame className="h-8 sm:h-10 sm:w-10 text-yellow-300 mb-2"/>
                <p className="text-2xl sm:text-3xl font-bold text-white">{userProfile.streak || 0}</p>
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
            <CardTitle>This Week's Summary</CardTitle>
            <CardDescription>Your performance summary for the current week.</CardDescription>
        </CardHeader>
        <CardContent>
             {loadingStats ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-800">
                        <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                        <div>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{weeklyStats.onTime}</p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">On-Time Days</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/50 border-2 border-red-200 dark:border-red-800">
                        <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
                        <div>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{weeklyStats.late}</p>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Late Days</p>
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 ease-out hover:shadow-lg border-2 border-foreground/20 dark:border-foreground/20 hover:border-primary">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/>Points System</CardTitle>
            <CardDescription>How to earn and lose points, as set by your manager.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
            <p><strong className="text-primary">+{gamificationSettings.onTimePoints} points</strong> for checking in on-time (including the {gamificationSettings.gracePeriodMinutes}-minute grace period).</p>
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
