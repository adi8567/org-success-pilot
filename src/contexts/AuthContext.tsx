import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

// Define types
export type UserRole = "admin" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  joinedDate?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [employees, setEmployees] = useState<User[]>([]);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employees");
      }
    };

    fetchEmployees();
  }, []);

  // Check for persisted authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Generate mock password (e.g., email prefix + "123")
  const generateMockPassword = (email: string) => {
    const emailPrefix = email.split("@")[0];
    return `${emailPrefix}123`;
  };

  // Log authentication event to database
  const logAuthEvent = async (employeeId: string, action: "login" | "logout") => {
    try {
      await axios.post("http://localhost:5000/api/login-logs", {
        employeeId,
        action,
      });
    } catch (error) {
      console.error(`Error logging ${action} event:`, error);
      toast.error(`Failed to log ${action} event`);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user with matching email
      const foundEmployee = employees.find(
        (emp) => emp.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!foundEmployee) {
        toast.error("Invalid email or password");
        throw new Error("Invalid email");
      }

      // Check password (mock: email prefix + "123")
      const expectedPassword = generateMockPassword(foundEmployee.email);
      if (password !== expectedPassword) {
        toast.error("Invalid email or password");
        throw new Error("Invalid password");
      }

      // Successful login
      setUser(foundEmployee);
      localStorage.setItem("user", JSON.stringify(foundEmployee));
      await logAuthEvent(foundEmployee.id, "login");
      toast.success("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    if (user) {
      await logAuthEvent(user.id, "logout");
    }
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);