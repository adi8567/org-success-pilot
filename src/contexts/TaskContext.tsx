import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import axios from "axios";

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
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getEmployeeTasks: (employeeId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
}

// Create context
const TaskContext = createContext<TaskContextType>({
  tasks: [],
  isLoading: false,
  error: null,
  addTask: async () => {},
  updateTask: async () => {},
  deleteTask: async () => {},
  getEmployeeTasks: () => [],
  getTaskById: () => undefined,
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:5000/api/tasks";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(API_URL);
        setTasks(response.data);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || "Failed to fetch tasks";
        setError(errorMessage);
        console.error("Error fetching tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    console.log("Adding task:", task); // Debug log
    try {
      const response = await axios.post(API_URL, {
        ...task,
        progress: task.status === "completed" ? 100 : task.progress || 0,
      });
      console.log("Response:", response.data); // Debug log
      setTasks([...tasks, response.data]);
      toast.success("Task added successfully");
    } catch (err: any) {
      console.error("Error adding task:", err);
      const errorMessage = err.response?.data?.error || "Failed to add task";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    console.log("Updating task:", id, taskData); // Debug log
    try {
      const updatedTaskData = {
        ...taskData,
        progress: taskData.status === "completed" ? 100 : taskData.progress,
      };
      await axios.put(`${API_URL}/${id}`, updatedTaskData);
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, ...updatedTaskData } : task
        )
      );
      toast.success("Task updated successfully");
    } catch (err: any) {
      console.error("Error updating task:", err);
      const errorMessage = err.response?.data?.error || "Failed to update task";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const deleteTask = async (id: string) => {
    console.log("Deleting task:", id); // Debug log
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
      toast.success("Task deleted successfully");
    } catch (err: any) {
      console.error("Error deleting task:", err);
      const errorMessage = err.response?.data?.error || "Failed to delete task";
      setError(errorMessage);
      toast.error(errorMessage);
    }
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