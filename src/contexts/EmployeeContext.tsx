import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  joinedDate?: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  emergencyContact?: string;
  salary?: number;
}

interface EmployeeContextType {
  employees: Employee[];
  error: string | null;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

// Create context
const EmployeeContext = createContext<EmployeeContextType>({
  employees: [],
  error: null,
  addEmployee: async () => {},
  updateEmployee: async () => {},
  deleteEmployee: async () => {},
});

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employees");
      setEmployees(response.data);
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to fetch employees";
      setError(message);
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const response = await axios.post("http://localhost:5000/api/employees", employee);
      setEmployees([...employees, response.data]);
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to add employee";
      setError(message);
      console.error("Error adding employee:", err);
      throw new Error(message);
    }
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      await axios.put(`http://localhost:5000/api/employees/${id}`, updates);
      setEmployees(
        employees.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
      );
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to update employee";
      setError(message);
      console.error("Error updating employee:", err);
      throw new Error(message);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to delete employee";
      setError(message);
      console.error("Error deleting employee:", err);
      throw new Error(message);
    }
  };

  const value: EmployeeContextType = {
    employees,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployees = () => useContext(EmployeeContext);