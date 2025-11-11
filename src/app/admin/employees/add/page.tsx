'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Loader2, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth, functions } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { onAuthStateChanged, type User as AuthUser } from "firebase/auth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { httpsCallable } from "firebase/functions";

type Branch = {
    id: string;
    shopName: string;
    ownerId: string;
};


export default function AddEmployeePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [openBranchSelector, setOpenBranchSelector] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                
                // Fetch branches
                const branchesQuery = query(collection(db, "shops"), where("ownerId", "==", user.uid));
                const branchesSnapshot = await getDocs(branchesQuery);
                const fetchedBranches = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
                setBranches(fetchedBranches);
                if (fetchedBranches.length > 0) {
                    setSelectedBranch(fetchedBranches[0]);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleAddEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!authUser || !selectedBranch) {
             toast({ title: "Authentication or Branch Error", description: "You must be logged in and have a branch selected.", variant: "destructive" });
             return;
        }

        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const employeeId = formData.get('employeeId') as string;
        const role = formData.get('role') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const baseSalary = formData.get('baseSalary') as string;
        
        if (!name || !email || !password || !role || !employeeId) {
            toast({
                title: "Error",
                description: "Please fill out all required fields.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const createEmployee = httpsCallable(functions, 'createEmployee');
            const result = await createEmployee({
                email,
                password,
                name,
                employeeId,
                role,
                baseSalary: Number(baseSalary) || 0,
                shopId: selectedBranch.id,
            });

            if ((result.data as any).success) {
                toast({
                    title: "Employee Invited!",
                    description: `${name} has been added. They can now log in with their email and password.`,
                });
                router.push('/admin/employees');
            } else {
                 throw new Error((result.data as any).error || "An unknown error occurred.");
            }
           
        } catch (error: any) {
            console.error("Error adding employee:", error);
            let description = error.message || "Could not create invitation. Please try again.";
            // Firebase functions often wrap auth errors, so we check the message string
            if (error.message.includes('EMAIL_EXISTS')) {
                description = "This email address is already in use by another account.";
            } else if (error.message.includes('WEAK_PASSWORD')) {
                description = "The password is too weak. It must be at least 6 characters long.";
            }
            toast({
                title: "Error",
                description: description,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
             <div className="flex items-center gap-4">
                <Link href="/admin/employees">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Invite New Employee</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Enter the employee's details to invite them to join a shop.</p>
                </div>
            </div>
            <form onSubmit={handleAddEmployee} className="w-full max-w-2xl mx-auto space-y-8">
                <fieldset disabled={loading} className="group">
                    <div className="space-y-2">
                        <Label>Branch *</Label>
                         <Popover open={openBranchSelector} onOpenChange={setOpenBranchSelector}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openBranchSelector}
                                    className="w-full justify-between"
                                    disabled={branches.length === 0}
                                >
                                    {selectedBranch ? selectedBranch.shopName : "Select a branch..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Search branch..." />
                                    <CommandEmpty>No branches found. <Link href="/admin/add-branch" className="text-primary underline">Add one now</Link>.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandList>
                                        {branches.map((branch) => (
                                            <CommandItem
                                                key={branch.id}
                                                value={branch.id}
                                                onSelect={(currentValue) => {
                                                    const branch = branches.find(b => b.id === currentValue);
                                                    setSelectedBranch(branch || null);
                                                    setOpenBranchSelector(false);
                                                }}
                                            >
                                                {branch.shopName}
                                            </CommandItem>
                                        ))}
                                        </CommandList>
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <fieldset disabled={!selectedBranch} className="group">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" placeholder="e.g., John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="employeeId">Employee ID *</Label>
                                <Input id="employeeId" name="employeeId" placeholder="e.g., EMP-001" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role / Designation *</Label>
                                <Input id="role" name="role" placeholder="e.g., Cashier" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input id="email" name="email" type="email" placeholder="employee@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Set Initial Password *</Label>
                                <Input id="password" name="password" type="password" placeholder="Min. 6 characters" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="baseSalary">Base Monthly Salary (₹)</Label>
                                <Input id="baseSalary" name="baseSalary" type="number" placeholder="e.g., 25000" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">The employee will use this email and password to log in for the first time.</p>
                        <div className="flex justify-center mt-8">
                            <Button type="submit" size="lg" className="w-full max-w-xs" disabled={!selectedBranch || loading}>
                                {loading && <Loader2 className="mr-2 animate-spin" />}
                                <UserPlus className="mr-2"/>
                                Create Employee Account
                            </Button>
                        </div>
                    </fieldset>
                </fieldset>
            </form>
        </div>
    );
}