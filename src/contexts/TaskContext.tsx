
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "in_progress" | "completed" | "on_hold";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  progress?: number;
}

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getEmployeeTasks: (employeeId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete Project Proposal",
    description: "Write a detailed project proposal for the new client",
    assignedTo: "2",
    assignedBy: "1",
    createdAt: "2023-05-10",
    dueDate: "2023-05-20",
    priority: "high",
    status: "completed",
    progress: 100,
  },
  {
    id: "2",
    title: "Prepare Sales Presentation",
    description: "Create slides for the upcoming sales pitch",
    assignedTo: "3",
    assignedBy: "1",
    createdAt: "2023-05-12",
    dueDate: "2023-05-18",
    priority: "medium",
    status: "in_progress",
    progress: 60,
  },
  {
    id: "3",
    title: "Review Code PR",
    description: "Review the pull request for the new feature",
    assignedTo: "2",
    assignedBy: "1",
    createdAt: "2023-05-15",
    dueDate: "2023-05-17",
    priority: "high",
    status: "pending",
    progress: 0,
  },
  {
    id: "4",
    title: "Update Documentation",
    description: "Update the API documentation with the latest changes",
    assignedTo: "4",
    assignedBy: "1",
    createdAt: "2023-05-14",
    dueDate: "2023-05-25",
    priority: "low",
    status: "in_progress",
    progress: 30,
  },
];

// Create context
const TaskContext = createContext<TaskContextType>({
  tasks: [],
  isLoading: false,
  error: null,
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  getEmployeeTasks: () => [],
  getTaskById: () => undefined,
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchTasks = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTasks(mockTasks);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tasks");
        console.error("Error fetching tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    const today = new Date().toISOString().split("T")[0];
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: today,
      progress: task.status === "completed" ? 100 : task.progress || 0,
    };
    
    setTasks([...tasks, newTask]);
    toast.success("Task added successfully");
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...taskData };
          // Ensure progress is 100% if status is completed
          if (updatedTask.status === "completed" && updatedTask.progress !== 100) {
            updatedTask.progress = 100;
          }
          return updatedTask;
        }
        return task;
      })
    );
    toast.success("Task updated successfully");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Task deleted successfully");
  };

  const getEmployeeTasks = (employeeId: string) => {
    return tasks.filter((task) => task.assignedTo === employeeId);
  };

  const getTaskById = (id: string) => {
    return tasks.find((task) => task.id === id);
  };

  const value: TaskContextType = {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    getEmployeeTasks,
    getTaskById,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => useContext(TaskContext);
