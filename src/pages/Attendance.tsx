
import React, { useState } from "react";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees } from "@/contexts/EmployeeContext";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  ArrowRight
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

const AttendanceStatusBadge = ({ status }) => {
  const statusStyles = {
    present: "bg-green-100 text-green-800 hover:bg-green-100",
    absent: "bg-red-100 text-red-800 hover:bg-red-100",
    late: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "half-day": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  };

  return (
    <Badge className={statusStyles[status]} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const AttendancePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { attendanceRecords, clockIn, clockOut, markAttendance, updateAttendance } = useAttendance();
  const { employees } = useEmployees();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(isAdmin ? "" : user.id);
  const [isMarkDialogOpen, setIsMarkDialogOpen] = useState(false);
  
  // Form state for marking attendance
  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    date: selectedDate,
    clockIn: "",
    clockOut: "",
    status: "present",
    notes: "",
  });
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];
  
  // Check if the current user has already clocked in/out today
  const todayRecord = attendanceRecords.find(
    record => record.employeeId === user.id && record.date === today
  );
  
  // Filter attendance records based on selected date and employee
  const filteredRecords = attendanceRecords.filter((record) => {
    if (selectedDate && record.date !== selectedDate) {
      return false;
    }
    
    if (selectedEmployee && record.employeeId !== selectedEmployee) {
      return false;
    }
    
    return true;
  });
  
  // Reset form when dialog opens/closes
  const resetForm = () => {
    setNewAttendance({
      employeeId: isAdmin ? "" : user.id,
      date: selectedDate,
      clockIn: "",
      clockOut: "",
      status: "present",
      notes: "",
    });
  };
  
  // Handle mark attendance form submit
  const handleMarkAttendance = (e) => {
    e.preventDefault();
    
    markAttendance({
      ...newAttendance,
    });
    
    setIsMarkDialogOpen(false);
    resetForm();
  };
  
  // Handle clock in button click
  const handleClockIn = () => {
    clockIn(user.id);
  };
  
  // Handle clock out button click
  const handleClockOut = () => {
    clockOut(user.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <div className="flex space-x-2">
          {isAdmin && (
            <Dialog open={isMarkDialogOpen} onOpenChange={setIsMarkDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Mark Attendance</DialogTitle>
                  <DialogDescription>
                    Record attendance for an employee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleMarkAttendance}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="employeeId">Employee</Label>
                      <Select
                        value={newAttendance.employeeId}
                        onValueChange={(value) => setNewAttendance({ ...newAttendance, employeeId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newAttendance.date}
                        onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="clockIn">Clock In</Label>
                        <Input
                          id="clockIn"
                          type="time"
                          value={newAttendance.clockIn}
                          onChange={(e) => setNewAttendance({ ...newAttendance, clockIn: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="clockOut">Clock Out</Label>
                        <Input
                          id="clockOut"
                          type="time"
                          value={newAttendance.clockOut || ""}
                          onChange={(e) => setNewAttendance({ ...newAttendance, clockOut: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newAttendance.status}
                        onValueChange={(value) => setNewAttendance({ ...newAttendance, status: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="half-day">Half Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newAttendance.notes}
                        onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })}
                        placeholder="Any additional notes"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Mark Attendance</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              {today} - {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your Status</p>
                  <div className="flex items-center mt-1">
                    {todayRecord ? (
                      <>
                        <AttendanceStatusBadge status={todayRecord.status} />
                        {todayRecord.clockIn && (
                          <span className="text-xs text-muted-foreground ml-2">
                            In: {todayRecord.clockIn}
                            {todayRecord.clockOut && <> • Out: {todayRecord.clockOut}</>}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not recorded yet</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleClockIn} 
                  disabled={!!todayRecord?.clockIn}
                  variant={!todayRecord?.clockIn ? "default" : "outline"}
                >
                  Clock In
                </Button>
                <Button
                  onClick={handleClockOut}
                  disabled={!todayRecord?.clockIn || !!todayRecord?.clockOut}
                  variant={todayRecord?.clockIn && !todayRecord?.clockOut ? "default" : "outline"}
                >
                  Clock Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="date-filter" className="mb-2 block">Date</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              
              {isAdmin && (
                <div className="flex-1">
                  <Label htmlFor="employee-filter" className="mb-2 block">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Employees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {filteredRecords.length > 0 ? (
            <Table>
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
                {filteredRecords.map((record) => {
                  const employee = employees.find(e => e.id === record.employeeId);
                  return (
                    <TableRow key={record.id}>
                      {isAdmin && <TableCell>{employee?.name || "Unknown"}</TableCell>}
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.clockIn || "-"}</TableCell>
                      <TableCell>{record.clockOut || "-"}</TableCell>
                      <TableCell>
                        <AttendanceStatusBadge status={record.status} />
                      </TableCell>
                      <TableCell>{record.notes || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No attendance records found</h3>
              <p className="text-muted-foreground text-center mt-2">
                Try changing the filter parameters to view more records.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
