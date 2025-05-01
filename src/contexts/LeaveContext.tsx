
import React, { createContext, useContext, useState, useEffect } from "react";
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
}

interface LeaveContextType {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
  applyForLeave: (request: Omit<LeaveRequest, "id" | "status" | "appliedDate">) => void;
  approveLeave: (id: string, adminId: string, comments?: string) => void;
  rejectLeave: (id: string, adminId: string, comments?: string) => void;
  getEmployeeLeaves: (employeeId: string) => LeaveRequest[];
  getPendingLeaves: () => LeaveRequest[];
}

// Mock data
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeId: "2",
    startDate: "2023-06-10",
    endDate: "2023-06-15",
    type: "vacation",
    reason: "Family vacation",
    status: "approved",
    appliedDate: "2023-05-20",
    reviewedBy: "1",
    reviewDate: "2023-05-22",
  },
  {
    id: "2",
    employeeId: "3",
    startDate: "2023-06-05",
    endDate: "2023-06-06",
    type: "sick",
    reason: "Not feeling well",
    status: "pending",
    appliedDate: "2023-06-04",
  },
  {
    id: "3",
    employeeId: "4",
    startDate: "2023-07-01",
    endDate: "2023-07-10",
    type: "vacation",
    reason: "Summer vacation",
    status: "pending",
    appliedDate: "2023-05-25",
  },
];

// Create context
const LeaveContext = createContext<LeaveContextType>({
  leaveRequests: [],
  isLoading: false,
  error: null,
  applyForLeave: () => {},
  approveLeave: () => {},
  rejectLeave: () => {},
  getEmployeeLeaves: () => [],
  getPendingLeaves: () => [],
});

export const LeaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchLeaves = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLeaveRequests(mockLeaveRequests);
        setError(null);
      } catch (err) {
        setError("Failed to fetch leave requests");
        console.error("Error fetching leave requests:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const applyForLeave = (request: Omit<LeaveRequest, "id" | "status" | "appliedDate">) => {
    const today = new Date().toISOString().split("T")[0];
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      status: "pending",
      appliedDate: today,
    };
    
    setLeaveRequests([...leaveRequests, newRequest]);
    toast.success("Leave request submitted successfully");
  };

  const approveLeave = (id: string, adminId: string, comments?: string) => {
    const today = new Date().toISOString().split("T")[0];
    setLeaveRequests(
      leaveRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "approved",
              reviewedBy: adminId,
              reviewDate: today,
              comments: comments || request.comments,
            }
          : request
      )
    );
    toast.success("Leave request approved");
  };

  const rejectLeave = (id: string, adminId: string, comments?: string) => {
    const today = new Date().toISOString().split("T")[0];
    setLeaveRequests(
      leaveRequests.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "rejected",
              reviewedBy: adminId,
              reviewDate: today,
              comments: comments || request.comments,
            }
          : request
      )
    );
    toast.success("Leave request rejected");
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
