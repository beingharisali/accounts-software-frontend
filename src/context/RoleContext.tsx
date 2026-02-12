import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserRole, User, ROLE_PERMISSIONS } from "@/types/role";

interface RoleContextType {
  currentUser: User | null;
  // Updated to handle real user data from login
  setCurrentUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.admin) => boolean;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check localStorage for saved user data and role
    const savedUser = localStorage.getItem("userData");
    const savedRole = localStorage.getItem("userRole") as UserRole | null;

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }

    // Fallback for your old logic if only role exists
    if (savedRole && ["admin", "officer", "csr"].includes(savedRole)) {
      return {
        id: "1",
        name: savedRole.charAt(0).toUpperCase() + savedRole.slice(1) + " User",
        email: `${savedRole}@software.com`,
        role: savedRole,
      };
    }
    return null;
  });

  // Function for your old manual selection (if needed for testing)
  const setRole = (role: UserRole) => {
    const user: User = {
      id: "1",
      name: role.charAt(0).toUpperCase() + role.slice(1) + " User",
      email: `${role}@software.com`,
      role,
    };
    setCurrentUser(user);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userData", JSON.stringify(user));
  };

  const hasPermission = (
    permission: keyof typeof ROLE_PERMISSIONS.admin,
  ): boolean => {
    if (!currentUser) return false;

    if (currentUser.role === 'admin') return true;

    const permissions = ROLE_PERMISSIONS[currentUser.role];
    return permissions ? permissions[permission] : false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <RoleContext.Provider
      value={{ currentUser, setCurrentUser, setRole, hasPermission, logout }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}