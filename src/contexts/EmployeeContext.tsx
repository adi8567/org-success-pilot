
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

// Define Employee type (extends User)
export interface Employee extends User {
  phone?: string;
  address?: string;
  emergencyContact?: string;
  salary?: number;
}

// Define context type
interface EmployeeContextType {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getEmployee: (id: string) => Employee | undefined;
}

// Mock data
const mockEmployees: Employee[] = [
  {
    id: "2",
    name: "John Employee",
    email: "employee@company.com",
    role: "employee",
    department: "Development",
    position: "Software Engineer",
    joinedDate: "2021-03-15",
    phone: "123-456-7890",
    address: "123 Main St, Anytown USA",
    profilePicture: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Jane Doe",
    email: "jane.doe@company.com",
    role: "employee",
    department: "Marketing",
    position: "Marketing Specialist",
    joinedDate: "2022-02-10",
    phone: "987-654-3210",
    address: "456 Elm St, Anytown USA",
    profilePicture: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Robert Smith",
    email: "robert.smith@company.com",
    role: "employee",
    department: "HR",
    position: "HR Manager",
    joinedDate: "2020-05-20",
    phone: "555-123-4567",
    address: "789 Oak St, Anytown USA",
    profilePicture: "/placeholder.svg",
  },
];

// Create context
const EmployeeContext = createContext<EmployeeContextType>({
  employees: [],
  isLoading: false,
  error: null,
  addEmployee: () => {},
  updateEmployee: () => {},
  deleteEmployee: () => {},
  getEmployee: () => undefined,
});

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchEmployees = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setEmployees(mockEmployees);
        setError(null);
      } catch (err) {
        setError("Failed to fetch employees");
        console.error("Error fetching employees:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
    };
    setEmployees([...employees, newEmployee]);
    toast.success(`Employee ${newEmployee.name} added successfully`);
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === id ? { ...emp, ...employeeData } : emp
      )
    );
    toast.success("Employee updated successfully");
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    toast.success("Employee deleted successfully");
  };

  const getEmployee = (id: string) => {
    return employees.find((emp) => emp.id === id);
  };

  const value: EmployeeContextType = {
    employees,
    isLoading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployee,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployees = () => useContext(EmployeeContext);
