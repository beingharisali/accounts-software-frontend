import { useRole } from "@/context/RoleContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, User, Users } from "lucide-react";

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
  const { setRole } = useRole();
  const navigate = useNavigate();

  const handleRoleSelect = (role: "admin" | "officer" | "csr") => {
    setRole(role);
    navigate("/");
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

        {/* Role Selection */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            Select Your Role
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="group p-6 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-lg transition-all text-left"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
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

          <p className="text-center text-xs text-muted-foreground mt-6">
            This is a demo mode. In production, use proper authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
