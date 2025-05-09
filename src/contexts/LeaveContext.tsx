import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "sick" | "vacation" | "personal" | "other";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  comments?: string;
  version: number;
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
  applyForLeave: (request: Omit<LeaveRequest, "id" | "status" | "appliedDate" | "version">) => Promise<void>;
  approveLeave: (id: string, adminId: string, comments?: string, version?: number) => Promise<void>;
  rejectLeave: (id: string, adminId: string, comments?: string, version?: number) => Promise<void>;
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
  getPendingLeaves: () => LeaveRequest[];
}

// Create context
const LeaveContext = createContext<LeaveContextType>({
  leaveRequests: [],
  isLoading: false,
  error: null,
  applyForLeave: async () => {},
  approveLeave: async () => {},
  rejectLeave: async () => {},
  getEmployeeLeaves: () => [],
  getPendingLeaves: () => [],
});

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leave requests
  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/leave-requests");
      setLeaveRequests(response.data);
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Failed to fetch leave requests";
      setError(message);
      console.error("Error fetching leave requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchLeaves();
  }, []);

  const applyForLeave = async (request: Omit<LeaveRequest, "id" | "status" | "appliedDate" | "version">) => {
    try {
      console.log("Applying for leave:", request);
      const response = await axios.post("http://localhost:5000/api/leave-requests", {
        ...request,
      });
      console.log("Response:", response.data);
      await fetchLeaves();
      toast.success("Leave request submitted successfully");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to submit leave request";
      setError(message);
      console.error("Error applying for leave:", err);
      toast.error(message);
    }
  };

  const approveLeave = async (id: string, adminId: string, comments?: string, version?: number) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}/approve`, {
        adminId,
        comments,
        version: version ?? leaveRequests.find(req => req.id === id)?.version ?? 1,
      });
      await fetchLeaves();
      toast.success("Leave request approved");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to approve leave request";
      setError(message);
      console.error("Error approving leave:", err);
      toast.error(message);
      if (err.response?.status === 409) {
        toast.error("Leave request was modified by another user. Please refresh and try again.");
      }
    }
  };

  const rejectLeave = async (id: string, adminId: string, comments?: string, version?: number) => {
    try {
      await axios.put(`http://localhost:5000/api/leave-requests/${id}/reject`, {
        adminId,
        comments,
        version: version ?? leaveRequests.find(req => req.id === id)?.version ?? 1,
      });
      await fetchLeaves();
      toast.success("Leave request rejected");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to reject leave request";
      setError(message);
      console.error("Error rejecting leave:", err);
      toast.error(message);
      if (err.response?.status === 409) {
        toast.error("Leave request was modified by another user. Please refresh and try again.");
      }
    }
  };

  const getEmployeeLeaves = (employeeId: string) => {
    return leaveRequests.filter((request) => request.employeeId === employeeId);
  };

  const getPendingLeaves = () => {
    return leaveRequests.filter((request) => request.status === "pending");
  };

  const value: LeaveContextType = {
    leaveRequests,
    isLoading,
    error,
    applyForLeave,
    approveLeave,
    rejectLeave,
    getEmployeeLeaves,
    getPendingLeaves,
  };

  return <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>;
};

export const useLeaves = () => useContext(LeaveContext);