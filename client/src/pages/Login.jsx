import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { credentials } from "@/services/authService";
import { BookOpen, GraduationCap, Users, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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

    const fillCredentials = (type) => {
        if (type === "student") {
            setEmail(credentials.student.email);
            setPassword(credentials.student.password);
        } else if (type === "faculty") {
            setEmail(credentials.faculty.email);
            setPassword(credentials.faculty.password);
        } else if (type === "admin") {
            setEmail(credentials.admin.email);
            setPassword(credentials.admin.password);
        }
        setError("");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <div className="animate-scale-in w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-card">
                <div className="text-center">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Academic Compass</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Smart KPI Dashboard for Academic Excellence</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
                            <div className="relative mt-1">
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
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
                            <div className="relative mt-1">
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
                    </div>

                    {error && <div className="text-sm font-medium text-destructive text-center">{error}</div>}

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-semibold text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="relative my-4">
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
        </div>
    );
};

export default Login;
