
import React, { useState } from "react";
import { useLeaves } from "@/contexts/LeaveContext";
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
  CardTitle, 
  CardFooter 
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
import { toast } from "@/components/ui/sonner";
import { Calendar, Check, X, FileText } from "lucide-react";

// Helper function to calculate number of days between two dates
const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveStatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    approved: "bg-green-100 text-green-800 hover:bg-green-100",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge className={statusStyles[status]} variant="outline">
      {status}
    </Badge>
  );
};

const LeaveTypeBadge = ({ type }) => {
  const typeStyles = {
    sick: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    vacation: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    personal: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    other: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge className={typeStyles[type]} variant="outline">
      {type}
    </Badge>
  );
};

const LeavePage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { leaveRequests, applyForLeave, approveLeave, rejectLeave } = useLeaves();
  const { employees } = useEmployees();
  
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filter, setFilter] = useState(isAdmin ? "pending" : "all");
  const [reviewComment, setReviewComment] = useState("");
  
  // New leave request form state
  const [newLeave, setNewLeave] = useState({
    startDate: "",
    endDate: "",
    type: "vacation",
    reason: "",
  });
  
  // Reset form when dialog opens/closes
  const resetForm = () => {
    setNewLeave({
      startDate: "",
      endDate: "",
      type: "vacation",
      reason: "",
    });
    setReviewComment("");
  };
  
  // Filter leave requests based on user role and filter selection
  const filteredLeaves = leaveRequests.filter((leave) => {
    // For employees, only show their own leaves
    if (!isAdmin && leave.employeeId !== user.id) {
      return false;
    }
    
    // Filter by status
    if (filter !== "all" && leave.status !== filter) {
      return false;
    }
    
    return true;
  });
  
  // Handle apply for leave form submit
  const handleApplyForLeave = (e) => {
    e.preventDefault();
    
    if (new Date(newLeave.startDate) > new Date(newLeave.endDate)) {
      toast.error("End date cannot be before start date");
      return;
    }
    
    applyForLeave({
      ...newLeave,
      employeeId: user.id,
    });
    
    setIsApplyDialogOpen(false);
    resetForm();
  };
  
  // Handle approve leave
  const handleApproveLeave = () => {
    if (selectedLeave) {
      approveLeave(selectedLeave.id, user.id, reviewComment);
      setIsReviewDialogOpen(false);
      setSelectedLeave(null);
      resetForm();
    }
  };
  
  // Handle reject leave
  const handleRejectLeave = () => {
    if (selectedLeave) {
      rejectLeave(selectedLeave.id, user.id, reviewComment);
      setIsReviewDialogOpen(false);
      setSelectedLeave(null);
      resetForm();
    }
  };
  
  // Open review dialog
  const openReviewDialog = (leave) => {
    setSelectedLeave(leave);
    setIsReviewDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>Apply for Leave</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Submit a new leave request for approval
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleApplyForLeave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newLeave.startDate}
                        onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newLeave.endDate}
                        onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                        min={newLeave.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  
                  {newLeave.startDate && newLeave.endDate && new Date(newLeave.startDate) <= new Date(newLeave.endDate) && (
                    <div className="text-sm text-muted-foreground">
                      Duration: {calculateDays(newLeave.startDate, newLeave.endDate)} day(s)
                    </div>
                  )}
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Leave Type</Label>
                    <Select
                      value={newLeave.type}
                      onValueChange={(value) => setNewLeave({ ...newLeave, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Leave Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                      placeholder="Please provide a reason for your leave"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {filteredLeaves.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Employee</TableHead>}
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && filter === "pending" && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => {
                  const employee = employees.find((e) => e.id === leave.employeeId);
                  const days = calculateDays(leave.startDate, leave.endDate);
                  
                  return (
                    <TableRow key={leave.id}>
                      {isAdmin && <TableCell>{employee?.name || "Unknown"}</TableCell>}
                      <TableCell>
                        <LeaveTypeBadge type={leave.type} />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{days} day(s)</div>
                        <div className="text-xs text-muted-foreground">
                          {leave.startDate} to {leave.endDate}
                        </div>
                      </TableCell>
                      <TableCell>{leave.appliedDate}</TableCell>
                      <TableCell>
                        <LeaveStatusBadge status={leave.status} />
                      </TableCell>
                      {isAdmin && filter === "pending" && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openReviewDialog(leave)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No leave requests found</h3>
              <p className="text-muted-foreground text-center mt-2">
                {isAdmin ? 
                  "There are no leave requests matching your filter." : 
                  "You haven't applied for any leave yet."}
              </p>
              {!isAdmin && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsApplyDialogOpen(true)}
                >
                  Apply for Leave
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Leave Request Detail Card (Shown when clicking on a leave request) */}
      {selectedLeave && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Review Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employee</p>
                  <p className="text-base">{employees.find(e => e.id === selectedLeave.employeeId)?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                  <p className="text-base flex items-center mt-1">
                    <LeaveTypeBadge type={selectedLeave.type} />
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date Requested</p>
                  <p className="text-base">{selectedLeave.appliedDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-base">
                    {calculateDays(selectedLeave.startDate, selectedLeave.endDate)} day(s)
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date Range</p>
                <p className="text-base">
                  {selectedLeave.startDate} to {selectedLeave.endDate}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reason</p>
                <p className="text-base">{selectedLeave.reason}</p>
              </div>
              
              <div>
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add a comment to this review"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <div className="flex space-x-2 w-full">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setIsReviewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={handleRejectLeave}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleApproveLeave}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LeavePage;
