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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useRole();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// App routes component
function AppRoutes() {
  const { currentUser } = useRole();
  
  return (
    <Routes>
      <Route path="/login" element={
        currentUser ? <Navigate to="/" replace /> : <RoleSelect />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Index />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/sheet-update" element={
        <ProtectedRoute>
          <MainLayout>
            <SheetUpdate />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/daily-report" element={
        <ProtectedRoute>
          <MainLayout>
            <DailyReport />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/master-entry" element={
        <ProtectedRoute>
          <MainLayout>
            <MasterEntry />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/courses" element={
        <ProtectedRoute>
          <MainLayout>
            <CourseBreakdown />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/schedule" element={
        <ProtectedRoute>
          <MainLayout>
            <Schedule />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/print-receipt" element={
        <ProtectedRoute>
          <MainLayout>
            <PrintReceipt />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/monthly-report" element={
        <ProtectedRoute>
          <MainLayout>
            <MonthlyReport />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/recovery" element={
        <ProtectedRoute>
          <MainLayout>
            <Recovery />
          </MainLayout>
        </ProtectedRoute>
      } />
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
