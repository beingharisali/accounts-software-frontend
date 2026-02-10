export type UserRole = 'admin' | 'officer' | 'csr';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const ROLE_PERMISSIONS = {
  admin: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canViewAllReports: true,
    canExport: true,
    canPrintReceipts: true,
    canManageUsers: true,
    canSendReminders: true,
  },
  officer: {
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canViewAllReports: true,
    canExport: true,
    canPrintReceipts: true,
    canManageUsers: false,
    canSendReminders: true,
  },
  csr: {
    canAdd: true,
    canEdit: false,
    canDelete: false,
    canViewAllReports: false,
    canExport: false,
    canPrintReceipts: false,
    canManageUsers: false,
    canSendReminders: true,
  },
} as const;
