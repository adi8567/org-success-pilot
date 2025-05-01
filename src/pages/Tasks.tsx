
import React, { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { useEmployees } from "@/contexts/EmployeeContext";
import { useAuth } from "@/contexts/AuthContext";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const TaskStatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    completed: "bg-green-100 text-green-800 hover:bg-green-100",
    on_hold: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <Badge className={statusStyles[status]} variant="outline">
      {status.replace("_", " ")}
    </Badge>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityStyles = {
    low: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    high: "bg-red-100 text-red-800 hover:bg-red-100",
  };

  return (
    <Badge className={priorityStyles[priority]} variant="outline">
      {priority}
    </Badge>
  );
};

const TasksPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { employees } = useEmployees();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");

  // New task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    notes: "",
    progress: 0,
  });

  // Reset form when dialog opens/closes
  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      priority: "medium",
      status: "pending",
      notes: "",
      progress: 0,
    });
  };

  // Handle create task form submit
  const handleCreateTask = (e) => {
    e.preventDefault();
    addTask({
      ...newTask,
      assignedBy: user.id,
    });
    setIsCreateDialogOpen(false);
    resetForm();
  };

  // Handle edit task form submit
  const handleEditTask = (e) => {
    e.preventDefault();
    if (selectedTask) {
      updateTask(selectedTask.id, {
        ...newTask,
      });
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      resetForm();
    }
  };

  // Handle delete task
  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      toast.success("Task deleted successfully");
    }
  };

  // Open edit dialog and set form values
  const openEditDialog = (task) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      notes: task.notes || "",
      progress: task.progress || 0,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Filter tasks based on user role and filter selection
  const filteredTasks = tasks.filter((task) => {
    if (!isAdmin && task.assignedTo !== user.id) {
      return false;
    }
    
    if (filter === "all") {
      return true;
    } else if (filter === "my") {
      return task.assignedTo === user.id;
    } else if (filter === "assigned") {
      return task.assignedBy === user.id;
    } else if (filter === filter) {
      return task.status === filter;
    }
    
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks Management</h1>
        <div className="flex space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Tasks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="my">My Tasks</SelectItem>
              {isAdmin && <SelectItem value="assigned">Assigned by Me</SelectItem>}
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
          
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>Create Task</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task and assign it to an employee
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="assignedTo">Assign To</Label>
                        <Select
                          value={newTask.assignedTo}
                          onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
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
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newTask.dueDate}
                          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={newTask.notes}
                        onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Task</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {filteredTasks.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const assignedEmployee = employees.find((e) => e.id === task.assignedTo);
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{assignedEmployee?.name || "Unknown"}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <PriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress || 0} className="w-[80px] h-2" />
                          <span className="text-xs">{task.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(task)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
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
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="text-muted-foreground text-center mt-2">
                {filter !== "all" ? "Try changing the filter to view more tasks." : 
                  isAdmin ? "Create a new task to get started." : 
                  "You don't have any tasks assigned yet."}
              </p>
              {isAdmin && filter === "all" && (
                <Button 
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create Task
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  required
                />
              </div>
              
              {isAdmin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-assignedTo">Assign To</Label>
                    <Select
                      value={newTask.assignedTo}
                      onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
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
                    <Label htmlFor="edit-dueDate">Due Date</Label>
                    <Input
                      id="edit-dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {isAdmin && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={newTask.status}
                    onValueChange={(value) => setNewTask({ ...newTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-progress">Progress</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="edit-progress"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newTask.progress || 0}
                    onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <span className="w-10 text-center">{newTask.progress || 0}%</span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Additional Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksPage;
