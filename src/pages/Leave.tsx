import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeaves, LeaveType } from "@/contexts/LeaveContext";
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
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Plus, ArrowUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { LeaveRequest } from "@/contexts/LeaveContext";

const LeavePage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { leaveRequests, applyForLeave, approveLeave, rejectLeave, isLoading, error } = useLeaves();
  const { employees, error: employeesError } = useEmployees();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [leaveType, setLeaveType] = useState<LeaveType>("sick");
  const [reason, setReason] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortField, setSortField] = useState<"appliedDate" | "startDate" | "status">("appliedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [actionDialog, setActionDialog] = useState<{
    id: string;
    action: "approve" | "reject";
    comments: string;
    version: number;
  } | null>(null);

  // Validate form
  const validateForm = () => {
    const errors: string[] = [];
    if (!startDate) errors.push("Start Date is required");
    if (!endDate) errors.push("End Date is required");
    if (!leaveType) errors.push("Leave Type is required");
    if (!reason) errors.push("Reason is required");
    if (startDate && endDate && startDate > endDate) {
      errors.push("End Date must be after Start Date");
    }
    return errors;
  };

  // Handle new leave request
  const handleAddLeaveRequest = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await applyForLeave({
        employeeId: user?.id || "",
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
        type: leaveType,
        reason,
      });
      setStartDate(new Date());
      setEndDate(addDays(new Date(), 1));
      setLeaveType("sick");
      setReason("");
      setIsAddDialogOpen(false);
      setFormErrors([]);
      toast.success("Leave request submitted successfully");
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to submit leave request";
      setFormErrors([message]);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approve/reject with comments
  const handleApproveReject = async () => {
    if (!actionDialog) return;
    setIsSubmitting(true);
    try {
      if (actionDialog.action === "approve") {
        await approveLeave(actionDialog.id, user?.id || "", actionDialog.comments, actionDialog.version);
        toast.success("Leave request approved");
      } else {
        await rejectLeave(actionDialog.id, user?.id || "", actionDialog.comments, actionDialog.version);
        toast.success("Leave request rejected");
      }
      setActionDialog(null);
    } catch (err: any) {
      const message = err.response?.data?.error || `Failed to ${actionDialog.action} leave request`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort requests
  const filteredRequests = (isAdmin ? leaveRequests : leaveRequests.filter((request) => request.employeeId === user?.id))
    .sort((a, b) => {
      if (sortField === "status") {
        return sortOrder === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Toggle sort order
  const toggleSort = (field: "appliedDate" | "startDate" | "status") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage employee leave requests" : "Request and track your leave"}
          </p>
        </div>

        {!isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isSubmitting}>
                <Plus className="mr-2 h-4 w-4" />
                New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription>
                  Submit a new leave request for approval. All fields are required.
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
                  <Label htmlFor="start-date">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="start-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="end-date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select
                    value={leaveType}
                    onValueChange={(value: LeaveType) => setLeaveType(value)}
                    required
                  >
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="vacation">Vacation Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Provide a reason for your leave request"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    required
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
                <Button onClick={handleAddLeaveRequest} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {employeesError && <p className="text-red-500">Failed to fetch employees: {employeesError}</p>}
      {isLoading && <p>Loading leave requests...</p>}

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {isAdmin ? "All employee leave requests" : "Your leave request history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of leave requests</TableCaption>
            <TableHeader>
              <TableRow>
                {isAdmin && (
                  <TableHead>
                    Employee
                  </TableHead>
                )}
                <TableHead onClick={() => toggleSort("appliedDate")} className="cursor-pointer">
                  Applied Date <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead onClick={() => toggleSort("startDate")} className="cursor-pointer">
                  Start Date <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead onClick={() => toggleSort("status")} className="cursor-pointer">
                  Status <ArrowUpDown className="inline h-4 w-4 ml-1" />
                </TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    {isAdmin && (
                      <TableCell>
                        {employees.length > 0 ? 
                          (employees.find((e) => e.id === request.employeeId)?.name || `Unknown (${request.employeeId})`) : 
                          `Loading... (${request.employeeId})`}
                      </TableCell>
                    )}
                    <TableCell>{request.appliedDate}</TableCell>
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell className="capitalize">{request.type}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    {isAdmin && request.status === "pending" && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                            onClick={() => setActionDialog({ id: request.id, action: "approve", comments: "", version: request.version })}
                            disabled={isSubmitting}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-100 text-red-800 hover:bg-red-200"
                            onClick={() => setActionDialog({ id: request.id, action: "reject", comments: "", version: request.version })}
                            disabled={isSubmitting}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    )}
                    {isAdmin && request.status !== "pending" && (
                      <TableCell>
                        {request.comments ? `Comment: ${request.comments}` : "-"}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve/Reject Dialog */}
      {actionDialog && (
        <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionDialog.action === "approve" ? "Approve" : "Reject"} Leave Request</DialogTitle>
              <DialogDescription>
                Optionally provide a comment for this action.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="comments">Comment</Label>
                <Textarea
                  id="comments"
                  placeholder="Add a comment (optional)"
                  value={actionDialog.comments}
                  onChange={(e) => setActionDialog({ ...actionDialog, comments: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproveReject}
                disabled={isSubmitting}
                className={actionDialog.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isSubmitting ? "Processing..." : actionDialog.action === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LeavePage;