import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, User, ROLE_PERMISSIONS } from '@/types/role';

interface RoleContextType {
  currentUser: User | null;
  setRole: (role: UserRole) => void;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS.admin) => boolean;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check localStorage for saved role
    const savedRole = localStorage.getItem('userRole') as UserRole | null;
    if (savedRole && ['admin', 'officer', 'csr'].includes(savedRole)) {
      return {
        id: '1',
        name: savedRole.charAt(0).toUpperCase() + savedRole.slice(1) + ' User',
        email: `${savedRole}@ideoversity.com`,
        role: savedRole,
      };
    }
    return null;
  });

  const setRole = (role: UserRole) => {
    const user: User = {
      id: '1',
      name: role.charAt(0).toUpperCase() + role.slice(1) + ' User',
      email: `${role}@ideoversity.com`,
      role,
    };
    setCurrentUser(user);
    localStorage.setItem('userRole', role);
  };

  const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS.admin): boolean => {
    if (!currentUser) return false;
    return ROLE_PERMISSIONS[currentUser.role][permission];
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('userRole');
  };

  return (
    <RoleContext.Provider value={{ currentUser, setRole, hasPermission, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
