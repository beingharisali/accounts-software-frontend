import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StudentProvider } from "@/context/StudentContext";
import { BatchProvider } from "@/context/BatchContext";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { MainLayout } from "@/components/layout/MainLayout";

import Index from "./pages/Index";
import SheetUpdate from "./pages/SheetUpdate";
import DailyReport from "./pages/DailyReport";
import MasterEntry from "./pages/MasterEntry";
import CourseBreakdown from "./pages/CourseBreakdown";
import PrintReceipt from "./pages/PrintReceipt";
import MonthlyReport from "./pages/MonthlyReport";
import Recovery from "./pages/Recovery";
import Schedule from "./pages/Schedule";
import RoleSelect from "./pages/RoleSelect";
import AdminSignup from "./pages/AdminSignup";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Logic
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { currentUser } = useRole();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Yahan role check ho raha hai. Agar list di gayi hai aur user ka role usmein nahi hai, to wapas bhej do.
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { currentUser } = useRole();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/signup" element={
        currentUser ? <Navigate to="/" replace /> : <AdminSignup />
      } />
      <Route path="/login" element={
        currentUser ? <Navigate to="/" replace /> : <RoleSelect />
      } />

      {/* Shared Routes (Admin, Officer, CSR) */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Index />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Admissions & Data Entry - Roles updated to lowercase to match backend/context */}
      <Route path="/sheet-update" element={
        <ProtectedRoute allowedRoles={['admin', 'officer', 'csr']}>
          <MainLayout>
            <SheetUpdate />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/master-entry" element={
        <ProtectedRoute allowedRoles={['admin', 'officer', 'csr']}>
          <MainLayout>
            <MasterEntry />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Admin ONLY Routes */}
      <Route path="/daily-report" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <DailyReport />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/monthly-report" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <MonthlyReport />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout>
            <UserManagement />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Course & Schedule Management */}
      <Route path="/courses" element={
        <ProtectedRoute allowedRoles={['admin', 'officer', 'csr']}>
          <MainLayout>
            <CourseBreakdown />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/schedule" element={
        <ProtectedRoute allowedRoles={['admin', 'officer', 'csr']}>
          <MainLayout>
            <Schedule />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Financial & Recovery */}
      <Route path="/print-receipt" element={
        <ProtectedRoute allowedRoles={['admin', 'officer']}>
          <MainLayout>
            <PrintReceipt />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/recovery" element={
        <ProtectedRoute allowedRoles={['admin', 'officer', 'csr']}>
          <MainLayout>
            <Recovery />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <StudentProvider>
          <BatchProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </BatchProvider>
        </StudentProvider>
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;