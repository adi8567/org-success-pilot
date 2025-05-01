
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Task, TaskPriority, TaskStatus } from "@/contexts/TaskContext";

const TasksPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const { tasks, addTask, updateTask } = useTasks();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState(0);

  // Reset form when dialog closes
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setDueDate(new Date());
    setPriority("medium");
    setStatus("pending");
    setNotes("");
    setProgress(0);
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    if (!title || !description || !assignedTo || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    addTask({
      assignedBy: user?.id || "",
      title,
      description,
      assignedTo,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      priority,
      status,
      notes,
      progress,
    });

    resetForm();
    setIsAddDialogOpen(false);
    toast.success("Task added successfully");
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;

    updateTask({
      ...selectedTask,
      title,
      description,
      assignedTo,
      dueDate: format(dueDate!, "yyyy-MM-dd"),
      priority,
      status,
      notes,
      progress,
    });

    resetForm();
    setIsAddDialogOpen(false);
    toast.success("Task updated successfully");
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setAssignedTo(task.assignedTo);
    setDueDate(new Date(task.dueDate));
    setPriority(task.priority);
    setStatus(task.status);
    setNotes(task.notes || "");
    setProgress(task.progress);
    setIsAddDialogOpen(true);
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        status: newStatus,
        progress: newStatus === "completed" ? 100 : task.progress
      });
      toast.success(`Task marked as ${newStatus}`);
    }
  };

  // Filter tasks based on user role
  const filteredTasks = isAdmin
    ? tasks
    : tasks.filter(task => task.assignedTo === user?.id || task.assignedBy === user?.id);

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage and assign tasks to employees" : "View and update your tasks"}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                <DialogDescription>
                  {selectedTask ? "Update task details" : "Add a new task for an employee"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="assignedTo">Assigned To (Employee ID)</Label>
                  <Input
                    id="assignedTo"
                    placeholder="Employee ID"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dueDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: TaskPriority) => setPriority(value)}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: TaskStatus) => setStatus(value)}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="progress">Progress ({progress}%)</Label>
                  <Slider
                    id="progress"
                    value={[progress]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={([value]) => setProgress(value)}
                    className="my-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={selectedTask ? handleUpdateTask : handleAddTask}>
                  {selectedTask ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            {isAdmin ? "All assigned tasks" : "Your assigned tasks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all tasks</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                {isAdmin && <TableHead>Assigned To</TableHead>}
                <TableHead>Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{task.description}</TableCell>
                    {isAdmin && <TableCell>{task.assignedTo}</TableCell>}
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{task.progress}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </Button>
                        )}
                        
                        {!isAdmin && task.status !== "completed" && (
                          <Select 
                            value={task.status} 
                            onValueChange={(value: TaskStatus) => handleUpdateStatus(task.id, value)}
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableCell>
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

export default TasksPage;
