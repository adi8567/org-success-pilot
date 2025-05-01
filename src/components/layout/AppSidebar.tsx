
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  Clock,
} from "lucide-react";

export function AppSidebar() {
  const { isAdmin } = useAuth();

  // Define menu items based on role
  const commonMenuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: FileText,
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: Clock,
    },
    {
      title: "Leave",
      url: "/leave",
      icon: Calendar,
    },
  ];

  const adminMenuItems = [
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  // Combine menu items based on role
  const menuItems = isAdmin
    ? [...commonMenuItems, ...adminMenuItems]
    : commonMenuItems;

  return (
    <Sidebar>
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-primary">EMS Portal</h1>
        <p className="text-sm text-sidebar-foreground/70">Employee Management</p>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
