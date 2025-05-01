
import React, { createContext, useContext, useState, useEffect } from "react";
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
  clockIn: (employeeId: string) => void;
  clockOut: (employeeId: string) => void;
  getEmployeeAttendance: (employeeId: string) => AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, "id">) => void;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => void;
}

// Generate today's date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

// Mock data
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    employeeId: "2",
    date: "2023-05-15",
    clockIn: "09:00",
    clockOut: "17:30",
    status: "present",
  },
  {
    id: "2",
    employeeId: "3",
    date: "2023-05-15",
    clockIn: "09:15",
    clockOut: "17:00",
    status: "present",
  },
  {
    id: "3",
    employeeId: "4",
    date: "2023-05-15",
    clockIn: "10:00",
    clockOut: "17:30",
    status: "late",
    notes: "Traffic delay",
  },
  {
    id: "4",
    employeeId: "2",
    date: "2023-05-16",
    clockIn: "09:05",
    clockOut: "17:45",
    status: "present",
  },
  {
    id: "5",
    employeeId: "3",
    date: "2023-05-16",
    clockIn: "09:30",
    clockOut: "14:00",
    status: "half-day",
    notes: "Doctor appointment",
  },
];

// Create context
const AttendanceContext = createContext<AttendanceContextType>({
  attendanceRecords: [],
  isLoading: false,
  error: null,
  clockIn: () => {},
  clockOut: () => {},
  getEmployeeAttendance: () => [],
  markAttendance: () => {},
  updateAttendance: () => {},
});

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchAttendance = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setAttendanceRecords(mockAttendanceRecords);
        setError(null);
      } catch (err) {
        setError("Failed to fetch attendance records");
        console.error("Error fetching attendance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const clockIn = (employeeId: string) => {
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

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      employeeId,
      date: today,
      clockIn: time,
      clockOut: null,
      status: parseInt(time.split(":")[0]) > 9 ? "late" : "present",
    };

    setAttendanceRecords([...attendanceRecords, newRecord]);
    toast.success("Clocked in successfully");
  };

  const clockOut = (employeeId: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    setAttendanceRecords(
      attendanceRecords.map((record) => {
        if (record.employeeId === employeeId && record.date === today && !record.clockOut) {
          return { ...record, clockOut: time };
        }
        return record;
      })
    );
    toast.success("Clocked out successfully");
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendanceRecords.filter((record) => record.employeeId === employeeId);
  };

  const markAttendance = (record: Omit<AttendanceRecord, "id">) => {
    const newRecord = {
      ...record,
      id: Date.now().toString(),
    };
    setAttendanceRecords([...attendanceRecords, newRecord]);
    toast.success("Attendance marked successfully");
  };

  const updateAttendance = (id: string, recordData: Partial<AttendanceRecord>) => {
    setAttendanceRecords(
      attendanceRecords.map((record) =>
        record.id === id ? { ...record, ...recordData } : record
      )
    );
    toast.success("Attendance record updated");
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
