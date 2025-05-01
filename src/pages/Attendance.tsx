
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  const { attendanceRecords, addAttendanceRecord, updateAttendanceRecord } = useAttendance();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [status, setStatus] = useState<"present" | "absent" | "late" | "half-day">("present");
  const [notes, setNotes] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(user?.id || "");

  const handleAddAttendance = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    addAttendanceRecord({
      employeeId: selectedEmployeeId,
      date: formattedDate,
      clockIn,
      clockOut,
      status,
      notes,
    });

    // Reset form
    setSelectedDate(new Date());
    setClockIn("");
    setClockOut("");
    setStatus("present");
    setNotes("");
    setIsAddDialogOpen(false);
    
    toast.success("Attendance record added successfully");
  };

  const handleClockIn = () => {
    const now = new Date();
    const clockInTime = format(now, "HH:mm");
    const today = format(now, "yyyy-MM-dd");
    
    // Check if there's already an entry for today
    const todayEntry = attendanceRecords.find(
      record => record.date === today && record.employeeId === user?.id
    );
    
    if (todayEntry) {
      updateAttendanceRecord({
        ...todayEntry,
        clockIn: clockInTime,
        status: "present"
      });
      toast.success("Clocked in successfully");
    } else {
      addAttendanceRecord({
        employeeId: user?.id || "",
        date: today,
        clockIn: clockInTime,
        clockOut: "",
        status: "present",
        notes: ""
      });
      toast.success("Attendance started for today");
    }
  };

  const handleClockOut = () => {
    const now = new Date();
    const clockOutTime = format(now, "HH:mm");
    const today = format(now, "yyyy-MM-dd");
    
    // Find today's entry
    const todayEntry = attendanceRecords.find(
      record => record.date === today && record.employeeId === user?.id
    );
    
    if (todayEntry) {
      updateAttendanceRecord({
        ...todayEntry,
        clockOut: clockOutTime
      });
      toast.success("Clocked out successfully");
    } else {
      toast.error("No clock-in record found for today");
    }
  };

  // Filter records based on user role
  const filteredRecords = isAdmin 
    ? attendanceRecords 
    : attendanceRecords.filter(record => record.employeeId === user?.id);

  // Check if user has already clocked in/out today
  const today = format(new Date(), "yyyy-MM-dd");
  const todayRecord = attendanceRecords.find(
    record => record.date === today && record.employeeId === user?.id
  );

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
                onClick={handleClockIn}
                disabled={todayRecord?.clockIn !== ""}
              >
                Clock In
              </Button>
              <Button 
                onClick={handleClockOut}
                disabled={!todayRecord?.clockIn || todayRecord?.clockOut !== ""}
              >
                Clock Out
              </Button>
            </>
          )}
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Input
                      id="employee"
                      placeholder="Employee ID"
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    />
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
                        value={clockIn}
                        onChange={(e) => setClockIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clockOut">Clock Out</Label>
                      <Input
                        id="clockOut"
                        type="time"
                        value={clockOut}
                        onChange={(e) => setClockOut(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: "present" | "absent" | "late" | "half-day") => setStatus(value)}>
                      <SelectTrigger>
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddAttendance}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
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
                {isAdmin && <TableHead>Employee ID</TableHead>}
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
                    {isAdmin && <TableCell>{record.employeeId}</TableCell>}
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
