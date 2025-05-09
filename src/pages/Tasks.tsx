import React, { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  Edit,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { Task, TaskPriority, TaskStatus } from "@/contexts/TaskContext";
import { useEmployees } from "@/contexts/EmployeeContext";

const TasksPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Filter tasks based on user role and filters
  const filteredTasks = tasks.filter((task) => {
    const roleFilter = isAdmin ? true : task.assignedTo === user?.id;
    const searchFilter =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const statusFilter = filterStatus === "all" ? true : task.status === filterStatus;
    const priorityFilter = filterPriority === "all" ? true : task.priority === filterPriority;
    return roleFilter && searchFilter && statusFilter && priorityFilter;
  });

  // For adding a new task
  const [newTask, setNewTask] = useState<Omit<Task, "id" | "createdAt">>({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
    assignedBy: user?.id || "", // Default to current user
    progress: 0,
  });

  // For editing a task
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Handle form input change for new task
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value,
    });
    setFormErrors([]); // Clear errors on change
  };

  // Handle select change (status, priority, assignee)
  const handleSelectChange = (name: string, value: string) => {
    setNewTask({
      ...newTask,
      [name]: value,
    });
    setFormErrors([]);
  };

  // Handle edit input change
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (editingTask) {
      const { name, value } = e.target;
      setEditingTask({
        ...editingTask,
        [name]: value,
      });
    }
  };

  // Handle edit select change
  const handleEditSelectChange = (name: string, value: string) => {
    if (editingTask) {
      setEditingTask({
        ...editingTask,
        [name]: value,
      });
    }
  };

  // Validate new task form
  const validateForm = () => {
    const errors: string[] = [];
    if (!newTask.title) errors.push("Title is required");
    if (!newTask.description) errors.push("Description is required");
    if (!newTask.assignedTo) errors.push("Assigned To is required");
    if (!newTask.assignedBy) errors.push("Assigned By is required");
    if (!newTask.dueDate) errors.push("Due Date is required");
    if (!newTask.priority) errors.push("Priority is required");
    if (!newTask.status) errors.push("Status is required");
    return errors;
  };

  // Add new task
  const handleAddTask = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await addTask(newTask);
      setNewTask({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
        assignedBy: user?.id || "",
        progress: 0,
      });
      setIsAddDialogOpen(false);
      setFormErrors([]);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  // Update existing task
  const handleUpdateTask = async () => {
    if (editingTask) {
      await updateTask(editingTask.id, editingTask);
      setEditingTask(null);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(id);
    }
  };

  // Get status badge color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Manage and track all tasks" : "View and update your assigned tasks"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(value: TaskStatus | "all") => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPriority}
            onValueChange={(value: TaskPriority | "all") => setFilterPriority(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add details for the new task. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                {formErrors.length > 0 && (
                  <div className="text-red-500">
                    {formErrors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Task description"
                      value={newTask.description}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium">
                        Status
                      </label>
                      <Select
                        value={newTask.status}
                        onValueChange={(value) => handleSelectChange("status", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">
                        Priority
                      </label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => handleSelectChange("priority", value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="dueDate" className="text-sm font-medium">
                        Due Date
                      </label>
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="assignedTo" className="text-sm font-medium">
                        Assigned To
                      </label>
                      <Select
                        value={newTask.assignedTo}
                        onValueChange={(value) => handleSelectChange("assignedTo", value)}
                        required
                      >
                        <SelectTrigger>
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
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="assignedBy" className="text-sm font-medium">
                      Assigned By
                    </label>
                    <Select
                      value={newTask.assignedBy}
                      onValueChange={(value) => handleSelectChange("assignedBy", value)}
                      required
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <label htmlFor="progress" className="text-sm font-medium">
                      Progress: {newTask.progress}%
                    </label>
                    <Input
                      id="progress"
                      name="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={newTask.progress}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setNewTask({ ...newTask, progress: value });
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setFormErrors([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleAddTask}>
                    Create Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <CheckCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterStatus !== "all" || filterPriority !== "all"
              ? "Try changing your filters"
              : isAdmin
              ? "Create a new task to get started"
              : "No tasks have been assigned to you yet"}
          </p>
          {isAdmin && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Due: {task.dueDate || "Not set"}
                    </CardDescription>
                  </div>
                  <Dialog>
                    {(isAdmin || task.assignedTo === user?.id) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setEditingTask(task)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                          </DialogTrigger>
                          {isAdmin && (
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                handleDeleteTask(task.id);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {editingTask && editingTask.id === task.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                          <DialogDescription>Make changes to this task.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="edit-title" className="text-sm font-medium">
                              Title
                            </label>
                            <Input
                              id="edit-title"
                              name="title"
                              placeholder="Task title"
                              value={editingTask.title}
                              onChange={handleEditInputChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="edit-description" className="text-sm font-medium">
                              Description
                            </label>
                            <Textarea
                              id="edit-description"
                              name="description"
                              placeholder="Task description"
                              value={editingTask.description}
                              onChange={handleEditInputChange}
                              rows={3}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="edit-status" className="text-sm font-medium">
                                Status
                              </label>
                              <Select
                                value={editingTask.status}
                                onValueChange={(value) => handleEditSelectChange("status", value)}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="on_hold">On Hold</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label htmlFor="edit-priority" className="text-sm font-medium">
                                Priority
                              </label>
                              <Select
                                value={editingTask.priority}
                                onValueChange={(value) => handleEditSelectChange("priority", value)}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor="edit-dueDate" className="text-sm font-medium">
                                Due Date
                              </label>
                              <Input
                                id="edit-dueDate"
                                name="dueDate"
                                type="date"
                                value={editingTask.dueDate}
                                onChange={handleEditInputChange}
                                required
                              />
                            </div>

                            {isAdmin && (
                              <div className="space-y-2">
                                <label htmlFor="edit-assignedTo" className="text-sm font-medium">
                                  Assigned To
                                </label>
                                <Select
                                  value={editingTask.assignedTo}
                                  onValueChange={(value) =>
                                    handleEditSelectChange("assignedTo", value)
                                  }
                                  required
                                >
                                  <SelectTrigger>
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
                            )}
                          </div>

                          {isAdmin && (
                            <div className="space-y-2">
                              <label htmlFor="edit-assignedBy" className="text-sm font-medium">
                                Assigned By
                              </label>
                              <Select
                                value={editingTask.assignedBy}
                                onValueChange={(value) =>
                                  handleEditSelectChange("assignedBy", value)
                                }
                                required
                              >
                                <SelectTrigger>
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
                          )}

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Progress: {editingTask.progress}%
                            </label>
                            <Input
                              type="range"
                              name="progress"
                              min="0"
                              max="100"
                              value={editingTask.progress}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                handleEditSelectChange("progress", value.toString());
                              }}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleUpdateTask}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground mb-4">
                  {task.description || "No description provided"}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className={getStatusColor(task.status)}>
                    {task.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    {employees.find((e) => e.id === task.assignedTo)?.name || "Unassigned"}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;