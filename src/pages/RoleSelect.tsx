import { useState } from "react";
import { useRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, Shield, User, Users, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api"; // Ensure this matches your axios instance

const roles = [
  {
    id: "admin",
    title: "Admin",
    description: "Full system access - Add, Edit, Delete all data",
    icon: Shield,
    color: "bg-primary text-primary-foreground",
  },
  {
    id: "officer",
    title: "Officer",
    description: "Add/Update entries, View reports, Print receipts",
    icon: Users,
    color: "bg-success text-success-foreground",
  },
  {
    id: "csr",
    title: "CSR",
    description: "Enter admissions, View assigned records, Send reminders",
    icon: User,
    color: "bg-accent text-accent-foreground",
  },
] as const;

export default function RoleSelect() {
  const { setCurrentUser } = useRole();
  const navigate = useNavigate();

  // State to manage which role is currently being logged in
  const [selectedRole, setSelectedRole] = useState<typeof roles[number] | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);
      const { token, user } = response.data;

      // Check if the user's real role matches the selected card (Security check)
      if (user.role.toLowerCase() !== selectedRole?.id) {
        toast.error(`This account is not registered as ${selectedRole?.title}`);
        setLoading(false);
        return;
      }

      // Save to localStorage & Context
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("userRole", user.role.toLowerCase());

      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}`);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mb-4">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Software</h1>
          <p className="text-muted-foreground mt-2">
            Accounts Management System
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          {!selectedRole ? (
            <>
              <h2 className="text-xl font-semibold text-center mb-6">
                Select Your Role to Login
              </h2>
              <div className="grid md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className="group p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all text-left"
                    >
                      <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{role.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Login Form View */
            <div className="max-w-md mx-auto animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to roles
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl ${selectedRole.color} flex items-center justify-center`}>
                  <selectedRole.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedRole.title} Login</h2>
                  <p className="text-sm text-muted-foreground">Enter your credentials below</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@organization.com"
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
                <Button className="w-full mt-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Login as {selectedRole.title}
                </Button>
              </form>
            </div>
          )}

          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">
              Don't have an Admin account? <button onClick={() => navigate('/signup')} className="text-primary hover:underline font-medium">Register Initial Admin</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}