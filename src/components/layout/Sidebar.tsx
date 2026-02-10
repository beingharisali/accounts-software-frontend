import { NavLink, useNavigate } from "react-router-dom";
import { useRole } from "@/context/RoleContext";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  ClipboardList,
  Printer,
  BarChart3,
  RefreshCw,
  GraduationCap,
  LogOut,
  CalendarDays,
  Shield,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    permission: null, // Everyone can see
  },
  {
    path: "/sheet-update",
    label: "Sheet Update",
    icon: FileSpreadsheet,
    permission: "canAdd" as const,
  },
  {
    path: "/master-entry",
    label: "Master Entry",
    icon: ClipboardList,
    permission: null,
  },
  {
    path: "/daily-report",
    label: "Daily Report",
    icon: Calendar,
    permission: "canViewAllReports" as const,
  },
  {
    path: "/monthly-report",
    label: "Monthly Report",
    icon: BarChart3,
    permission: "canViewAllReports" as const,
  },
  {
    path: "/courses",
    label: "Course Breakdown",
    icon: BookOpen,
    permission: null,
  },
  {
    path: "/schedule",
    label: "Schedule",
    icon: CalendarDays,
    permission: null,
  },
  {
    path: "/recovery",
    label: "Recovery",
    icon: RefreshCw,
    permission: null,
  },
  {
    path: "/print-receipt",
    label: "Print Receipt",
    icon: Printer,
    permission: "canPrintReceipts" as const,
  },
];

export function Sidebar() {
  const { currentUser, hasPermission, logout } = useRole();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleIcon = () => {
    switch (currentUser?.role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "officer":
        return <Users className="w-4 h-4" />;
      case "csr":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch (currentUser?.role) {
      case "admin":
        return "bg-primary/15 text-primary";
      case "officer":
        return "bg-success/15 text-success";
      case "csr":
        return "bg-accent/15 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const visibleNavItems = navItems.filter((item) => {
    if (item.permission === null) return true;
    return hasPermission(item.permission);
  });

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar-foreground">
              Software
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Accounts System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* User Role Badge */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/30">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              getRoleColor(),
            )}
          >
            {getRoleIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {currentUser?.role}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
