import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, GraduationCap, Users, Mail, Lock, ChevronDown, ChevronUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoogleLogin } from "@react-oauth/google";

// All user credentials for quick login
const allCredentials = {
    students: [
        { name: "Praneeta (CS Year 3)", email: "praneeta.cs3@gmail.com", password: "student123" },
        { name: "Aravind (EC Year 4)", email: "aravind.ec4@gmail.com", password: "student123" },
        { name: "Bhavya (ME Year 4)", email: "bhavya.me1@gmail.com", password: "student123" },
        { name: "Chaitra (IT Year 3)", email: "chaitra.it2@gmail.com", password: "student123" },
        { name: "Deepak (CS Year 4)", email: "deepak.cs3@gmail.com", password: "student123" },
        { name: "Meera (IT Year 4)", email: "meera.it1@gmail.com", password: "student123" },
        { name: "Farhan (ME Year 4)", email: "farhan.me3@gmail.com", password: "student123" },
        { name: "Gautam (IT Year 4)", email: "gautam.it4@gmail.com", password: "student123" },
        { name: "Hema (CS Year 4)", email: "hema.cs1@gmail.com", password: "student123" },
        { name: "Ishaan (EC Year 4)", email: "ishaan.ec2@gmail.com", password: "student123" },
    ],
    faculty: [
        { name: "CS Faculty (Dr. CS Prof)", email: "prof.cs@university.edu", password: "faculty123" },
        { name: "EC Faculty (Dr. EC Prof)", email: "prof.ec@university.edu", password: "faculty123" },
        { name: "ME Faculty (Dr. ME Prof)", email: "prof.me@university.edu", password: "faculty123" },
        { name: "IT Faculty (Dr. IT Prof)", email: "prof.it@university.edu", password: "faculty123" },
    ],
    admin: [
        { name: "System Admin (100 Students)", email: "admin@university.edu", password: "admin123" },
    ],
};

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showQuickLogin, setShowQuickLogin] = useState(false);
    const [activeTab, setActiveTab] = useState("student"); // "student" | "faculty" | "admin"
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                if (result.user?.role === "student") navigate("/student");
                else if (result.user?.role === "faculty") navigate("/faculty");
                else if (result.user?.role === "admin") navigate("/admin");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fillCredentials = (cred) => {
        setEmail(cred.email);
        setPassword(cred.password);
        setError("");
        setShowQuickLogin(false);
    };

    const tabConfig = {
        student: { label: "Students", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", active: "bg-blue-500 text-white" },
        faculty: { label: "Faculty", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", active: "bg-purple-500 text-white" },
        admin: { label: "Admin", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", active: "bg-amber-500 text-white" },
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <div className="animate-scale-in w-full max-w-md space-y-6">
                {/* Header Card */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-card space-y-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            <GraduationCap className="h-7 w-7 text-primary" />
                        </div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Academic Compass</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Smart KPI Dashboard for Academic Excellence</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    className="pl-10"
                                    placeholder="you@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="text-sm font-medium text-destructive text-center rounded-lg bg-destructive/10 px-3 py-2">{error}</div>}

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Don't have an account?{" "}
                                <Link to="/register" className="font-semibold text-primary hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Google Sign-In */}
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <Separator />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={async (credentialResponse) => {
                                    const result = await googleLogin(credentialResponse.credential);
                                    if (result.success) {
                                        if (result.user?.role === "student") navigate("/student");
                                        else if (result.user?.role === "faculty") navigate("/faculty");
                                        else if (result.user?.role === "admin") navigate("/admin");
                                    } else {
                                        setError(result.message);
                                    }
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                    setError("Google Login Failed");
                                }}
                            />
                        </div>
                    </form>
                </div>

                {/* Quick Login Panel */}
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                    <button
                        onClick={() => setShowQuickLogin(!showQuickLogin)}
                        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>Quick Login — Demo Credentials</span>
                        </div>
                        {showQuickLogin ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    {showQuickLogin && (
                        <div className="border-t border-border">
                            {/* Role Tabs */}
                            <div className="flex border-b border-border">
                                {["student", "faculty", "admin"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === tab
                                            ? tab === "student"
                                                ? "bg-blue-500 text-white"
                                                : tab === "faculty"
                                                    ? "bg-purple-500 text-white"
                                                    : "bg-amber-500 text-white"
                                            : "text-muted-foreground hover:bg-muted/50"
                                            }`}
                                    >
                                        {tab === "student" ? "Students" : tab === "faculty" ? "Faculty" : "Admin"}
                                    </button>
                                ))}
                            </div>

                            {/* Credentials List */}
                            <div className="p-3 space-y-2 max-h-56 overflow-y-auto">
                                {activeTab === "student" && (
                                    <>
                                        <p className="text-xs text-muted-foreground px-1 mb-2">Password for all students: <code className="bg-muted px-1 rounded">student123</code></p>
                                        {allCredentials.students.map((cred) => (
                                            <button
                                                key={cred.email}
                                                onClick={() => fillCredentials(cred)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-blue-500/10 hover:border-blue-500/40 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10">
                                                        <User className="h-3.5 w-3.5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">{cred.name}</p>
                                                        <p className="text-xs text-muted-foreground">{cred.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground group-hover:text-blue-400 transition-colors">Click to fill →</span>
                                            </button>
                                        ))}
                                    </>
                                )}

                                {activeTab === "faculty" && (
                                    <>
                                        <p className="text-xs text-muted-foreground px-1 mb-2">Password: <code className="bg-muted px-1 rounded">faculty123</code></p>
                                        {allCredentials.faculty.map((cred) => (
                                            <button
                                                key={cred.email}
                                                onClick={() => fillCredentials(cred)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-purple-500/10 hover:border-purple-500/40 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10">
                                                        <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors">{cred.name}</p>
                                                        <p className="text-xs text-muted-foreground">{cred.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground group-hover:text-purple-400 transition-colors">Click to fill →</span>
                                            </button>
                                        ))}
                                    </>
                                )}

                                {activeTab === "admin" && (
                                    <>
                                        <p className="text-xs text-muted-foreground px-1 mb-2">Password: <code className="bg-muted px-1 rounded">admin123</code></p>
                                        {allCredentials.admin.map((cred) => (
                                            <button
                                                key={cred.email}
                                                onClick={() => fillCredentials(cred)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-amber-500/10 hover:border-amber-500/40 transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10">
                                                        <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground group-hover:text-amber-400 transition-colors">{cred.name}</p>
                                                        <p className="text-xs text-muted-foreground">{cred.email}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground group-hover:text-amber-400 transition-colors">Click to fill →</span>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
