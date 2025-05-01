
import React, { createContext, useContext, useState, useEffect } from "react";
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

// Mock user data for demonstration
const adminUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@company.com",
  role: "admin",
  department: "Management",
  position: "Administrator",
  joinedDate: "2020-01-01",
  profilePicture: "/placeholder.svg",
};

const employeeUser: User = {
  id: "2",
  name: "John Employee",
  email: "employee@company.com",
  role: "employee",
  department: "Development",
  position: "Software Engineer",
  joinedDate: "2021-03-15",
  profilePicture: "/placeholder.svg",
};

// Mock credentials
const mockCredentials = [
  { email: "admin@company.com", password: "admin123", user: adminUser },
  { email: "employee@company.com", password: "emp123", user: employeeUser },
];

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

  // Check for persisted authentication
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const foundCredentials = mockCredentials.find(
        (cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
      );
      
      if (foundCredentials) {
        setUser(foundCredentials.user);
        localStorage.setItem("user", JSON.stringify(foundCredentials.user));
        toast.success("Login successful");
      } else {
        toast.error("Invalid email or password");
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
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
