import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  status: "present" | "absent" | "late" | "half-day";
  notes?: string;
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  clockIn: (employeeId: string) => Promise<void>;
  clockOut: (employeeId: string) => Promise<void>;
  getEmployeeAttendance: (employeeId: string) => AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, "id">) => Promise<void>;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => Promise<void>;
}

// Generate today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

// Create context
const AttendanceContext = createContext<AttendanceContextType>({
  attendanceRecords: [],
  isLoading: false,
  error: null,
  clockIn: async () => {},
  clockOut: async () => {},
  getEmployeeAttendance: () => [],
  markAttendance: async () => {},
  updateAttendance: async () => {},
});

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance records from the database
  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/attendance");
      setAttendanceRecords(response.data);
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "Failed to fetch attendance records";
      setError(`Failed to fetch attendance records: ${message}`);
      console.error("Error fetching attendance:", {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        } : "No response",
        config: err.config
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const clockIn = async (employeeId: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Check if employee already clocked in today
    const existingRecord = attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today
    );

    if (existingRecord) {
      toast.error("You have already clocked in today");
      return;
    }

    const newRecord: Omit<AttendanceRecord, "id"> = {
      employeeId,
      date: today,
      clockIn: time,
      clockOut: null,
      status: parseInt(time.split(":")[0]) > 9 ? "late" : "present",
    };

    try {
      await axios.post("http://localhost:5000/api/attendance", newRecord);
      await fetchAttendance();
      toast.success("Clocked in successfully");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to clock in";
      toast.error(message);
      console.error("Error clocking in:", err);
      throw new Error(message);
    }
  };

  const clockOut = async (employeeId: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const record = attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today && !record.clockOut
    );

    if (!record) {
      toast.error("No clock-in record found for today");
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/attendance/${record.id}`, {
        clockOut: time,
      });
      await fetchAttendance();
      toast.success("Clocked out successfully");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to clock out";
      toast.error(message);
      console.error("Error clocking out:", err);
      throw new Error(message);
    }
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendanceRecords.filter((record) => record.employeeId === employeeId);
  };

  const markAttendance = async (record: Omit<AttendanceRecord, "id">) => {
    try {
      await axios.post("http://localhost:5000/api/attendance", record);
      await fetchAttendance();
      toast.success("Attendance marked successfully");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to mark attendance";
      toast.error(message);
      console.error("Error marking attendance:", err);
      throw new Error(message);
    }
  };

  const updateAttendance = async (id: string, recordData: Partial<AttendanceRecord>) => {
    try {
      await axios.put(`http://localhost:5000/api/attendance/${id}`, recordData);
      await fetchAttendance();
      toast.success("Attendance record updated");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to update attendance record";
      toast.error(message);
      console.error("Error updating attendance:", err);
      throw new Error(message);
    }
  };

  const value: AttendanceContextType = {
    attendanceRecords,
    isLoading,
    error,
    clockIn,
    clockOut,
    getEmployeeAttendance,
    markAttendance,
    updateAttendance,
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export const useAttendance = () => useContext(AttendanceContext);