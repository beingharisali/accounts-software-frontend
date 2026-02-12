import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api"; // Ensure your axios instance path is correct
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminSignup() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Backend par ye registerAdmin hit karega
            await api.post("/auth/register-admin", formData);
            toast.success("Admin registered successfully! Please login.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.msg || "Signup failed. Admin might already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        <ShieldCheck className="text-primary w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Initial Admin Setup</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Create the master administrator account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input
                                type="email"
                                placeholder="admin@organization.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <Button className="w-full mt-4" disabled={loading}>
                            {loading ? "Registering..." : "Create Admin Account"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}