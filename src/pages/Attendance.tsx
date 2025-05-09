import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useEmployees } from "@/contexts/EmployeeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

const AttendancePage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { attendanceRecords, clockIn, clockOut, markAttendance, updateAttendance, isLoading: attendanceLoading, error: attendanceError } = useAttendance();
  const { employees, error: employeesError } = useEmployees();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [clockInTime, setClockInTime] = useState("");
  const [clockOutTime, setClockOutTime] = useState("");
  const [status, setStatus] = useState<"present" | "absent" | "late" | "half-day">("present");
  const [notes, setNotes] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(user?.id || "");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter records based on user role
  const filteredRecords = isAdmin
    ? attendanceRecords
    : attendanceRecords.filter(record => record.employeeId === user?.id);

  // Check if user has already clocked in/out today
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecord = attendanceRecords.find(
    (record) => record.date === today && record.employeeId === user?.id
  );

  // Validate form for adding attendance record
  const validateForm = () => {
    const errors: string[] = [];
    if (!selectedEmployeeId) errors.push("Employee ID is required");
    if (!selectedDate) errors.push("Date is required");
    if (!clockInTime) errors.push("Clock In time is required");
    if (clockInTime && clockOutTime) {
      const [inHour, inMinute] = clockInTime.split(":").map(Number);
      const [outHour, outMinute] = clockOutTime.split(":").map(Number);
      const inTime = inHour * 60 + inMinute;
      const outTime = outHour * 60 + outMinute;
      if (outTime <= inTime) {
        errors.push("Clock Out time must be after Clock In time");
      }
    }
    if (!status) errors.push("Status is required");
    return errors;
  };

  const handleAddAttendance = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate!, "yyyy-MM-dd");
      await markAttendance({
        employeeId: selectedEmployeeId,
        date: formattedDate,
        clockIn: clockInTime,
        clockOut: clockOutTime || null,
        status,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedDate(new Date());
      setClockInTime("");
      setClockOutTime("");
      setStatus("present");
      setNotes("");
      setSelectedEmployeeId(isAdmin ? "" : user?.id || "");
      setIsAddDialogOpen(false);
      setFormErrors([]);
    } catch (error: any) {
      setFormErrors([error.message || "Failed to add attendance record"]);
      toast.error(error.message || "Failed to add attendance record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockInAction = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      await clockIn(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to clock in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOutAction = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setIsSubmitting(true);
    try {
      await clockOut(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to clock out");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage employee attendance records" : "View and manage your attendance"}
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isAdmin && (
            <>
              <Button 
                onClick={handleClockInAction}
                disabled={isSubmitting || !!todayRecord?.clockIn}
              >
                {isSubmitting ? "Processing..." : "Clock In"}
              </Button>
              <Button 
                onClick={handleClockOutAction}
                disabled={isSubmitting || !todayRecord?.clockIn || !!todayRecord?.clockOut}
              >
                {isSubmitting ? "Processing..." : "Clock Out"}
              </Button>
            </>
          )}
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Attendance Record</DialogTitle>
                  <DialogDescription>
                    Add a new attendance record for an employee
                  </DialogDescription>
                </DialogHeader>
                
                {formErrors.length > 0 && (
                  <div className="text-red-500">
                    {formErrors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select
                      value={selectedEmployeeId}
                      onValueChange={setSelectedEmployeeId}
                    >
                      <SelectTrigger id="employee">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clockIn">Clock In</Label>
                      <Input
                        id="clockIn"
                        type="time"
                        value={clockInTime}
                        onChange={(e) => setClockInTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clockOut">Clock Out</Label>
                      <Input
                        id="clockOut"
                        type="time"
                        value={clockOutTime}
                        onChange={(e) => setClockOutTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: "present" | "absent" | "late" | "half-day") => setStatus(value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half-day">Half Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setFormErrors([]);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddAttendance}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {attendanceError && <p className="text-red-500">{attendanceError}</p>}
      {employeesError && <p className="text-red-500">Failed to fetch employees: {employeesError}</p>}
      {attendanceLoading && <p>Loading attendance records...</p>}

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {isAdmin ? "All employee attendance records" : "Your attendance history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of attendance records</TableCaption>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Employee</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    {isAdmin && (
                      <TableCell>
                        {employees.length > 0 
                          ? (employees.find((e) => e.id === record.employeeId)?.name || `Unknown (${record.employeeId})`)
                          : `Loading... (${record.employeeId})`}
                      </TableCell>
                    )}
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.clockIn || "N/A"}</TableCell>
                    <TableCell>{record.clockOut || "N/A"}</TableCell>
                    <TableCell>
                      <span className={
                        record.status === "present" ? "text-green-500" :
                        record.status === "absent" ? "text-red-500" :
                        record.status === "late" ? "text-yellow-500" : 
                        "text-blue-500"
                      }>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{record.notes || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;