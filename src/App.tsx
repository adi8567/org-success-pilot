
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { EmployeeProvider } from "@/contexts/EmployeeContext";
import { AttendanceProvider } from "@/contexts/AttendanceContext";
import { LeaveProvider } from "@/contexts/LeaveContext";
import { TaskProvider } from "@/contexts/TaskContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import TasksPage from "./pages/Tasks";
import AttendancePage from "./pages/Attendance";
import LeavePage from "./pages/Leave";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import EmployeesPage from "./pages/Employees";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <EmployeeProvider>
          <AttendanceProvider>
            <LeaveProvider>
              <TaskProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={<AppLayout />}>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="tasks" element={<TasksPage />} />
                      <Route path="attendance" element={<AttendancePage />} />
                      <Route path="leave" element={<LeavePage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="employees" element={<EmployeesPage />} />
                    </Route>
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TaskProvider>
            </LeaveProvider>
          </AttendanceProvider>
        </EmployeeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
