
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import { useAttendance } from "@/contexts/AttendanceContext";
import { useLeaves } from "@/contexts/LeaveContext";
import { useEmployees } from "@/contexts/EmployeeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart, LineChart } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users,
  Calendar,
  Clock,
  FileText,
  CircleCheck,
  CircleAlert,
  Timer
} from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

const StatCard = ({ title, value, description, icon, trend }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {trend && (
        <div className="flex items-center mt-2">
          <span className={trend.positive ? "text-green-600" : "text-red-600"}>
            {trend.positive ? "+" : "-"}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard: React.FC = () => {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { attendanceRecords } = useAttendance();
  const { leaveRequests } = useLeaves();
  const { tasks } = useTasks();
  
  // Data for charts
  const taskStatusData = [
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#f59e0b' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'On Hold', value: tasks.filter(t => t.status === 'on_hold').length, color: '#6b7280' }
  ];
  
  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending').length;
  const absentToday = attendanceRecords.filter(record => 
    record.date === new Date().toISOString().split("T")[0] && 
    record.status === 'absent'
  ).length;
  
  // Calculate overall attendance percentage
  const attendancePercentage = attendanceRecords.length ? 
    (attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100 : 
    0;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline">Generate Report</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Employees" 
          value={employees.length} 
          description="Active employees in system" 
          icon={<Users className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="Pending Leaves" 
          value={pendingLeaves} 
          description="Awaiting your approval" 
          icon={<Calendar className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="Absent Today" 
          value={absentToday} 
          description="Employees not present today" 
          icon={<Clock className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="Open Tasks" 
          value={tasks.filter(t => t.status !== 'completed').length} 
          description="Tasks in progress or pending" 
          icon={<FileText className="h-4 w-4 text-primary" />} 
          trend={{ value: 12, label: "vs. last month", positive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Distribution of tasks by status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Overall attendance statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Present Rate</div>
                <div className="text-sm text-muted-foreground">{attendancePercentage.toFixed(0)}%</div>
              </div>
              <Progress value={attendancePercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                <CircleCheck className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-lg font-bold">
                  {attendanceRecords.filter(r => r.status === 'present').length}
                </span>
                <span className="text-sm text-muted-foreground">Present</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                <Timer className="h-8 w-8 text-amber-500 mb-2" />
                <span className="text-lg font-bold">
                  {attendanceRecords.filter(r => r.status === 'late').length}
                </span>
                <span className="text-sm text-muted-foreground">Late</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg">
                <CircleAlert className="h-8 w-8 text-red-500 mb-2" />
                <span className="text-lg font-bold">
                  {attendanceRecords.filter(r => r.status === 'absent').length}
                </span>
                <span className="text-sm text-muted-foreground">Absent</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-lg font-bold">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </span>
                <span className="text-sm text-muted-foreground">On Leave</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { attendanceRecords } = useAttendance();
  const { leaveRequests } = useLeaves();
  
  // Filter data for current user
  const employeeTasks = tasks.filter(task => task.assignedTo === user?.id);
  const employeeAttendance = attendanceRecords.filter(record => record.employeeId === user?.id);
  const employeeLeaves = leaveRequests.filter(leave => leave.employeeId === user?.id);
  
  // Calculate metrics
  const completedTasks = employeeTasks.filter(task => task.status === 'completed').length;
  const pendingTasks = employeeTasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = employeeTasks.filter(task => task.status === 'in_progress').length;
  
  const isClockInForToday = employeeAttendance.some(
    record => record.date === new Date().toISOString().split('T')[0] && record.clockIn
  );
  
  const isClockOutForToday = employeeAttendance.some(
    record => 
      record.date === new Date().toISOString().split('T')[0] && 
      record.clockIn && 
      record.clockOut
  );
  
  // Recent tasks
  const recentTasks = [...employeeTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
    
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Today's Attendance" 
          value={isClockInForToday ? "Clocked In" : "Not Recorded"} 
          description={isClockOutForToday ? "You've completed today's shift" : isClockInForToday ? "Remember to clock out" : "Don't forget to clock in"} 
          icon={<Clock className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="Pending Tasks" 
          value={pendingTasks + inProgressTasks} 
          description={`${completedTasks} tasks completed`} 
          icon={<FileText className="h-4 w-4 text-primary" />} 
        />
        <StatCard 
          title="Leave Balance" 
          value="12 days" 
          description={`${employeeLeaves.filter(l => l.status === 'approved').length} leaves taken this year`} 
          icon={<Calendar className="h-4 w-4 text-primary" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Your recent and upcoming tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Due: {task.dueDate}</div>
                      <div className="flex items-center">
                        <Progress value={task.progress || 0} className="h-2 w-24 mr-2" />
                        <span className="text-xs">{task.progress || 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                You have no tasks assigned currently
              </div>
            )}
            <div className="mt-4">
              <Button variant="outline" className="w-full">View All Tasks</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Attendance & Leave</CardTitle>
            <CardDescription>Your recent attendance and leave status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Today's Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Clock In</div>
                    <div className="text-xs text-muted-foreground">
                      {isClockInForToday ? 
                        employeeAttendance.find(r => r.date === new Date().toISOString().split('T')[0])?.clockIn : 
                        'Not yet clocked in'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Clock Out</div>
                    <div className="text-xs text-muted-foreground">
                      {isClockOutForToday ? 
                        employeeAttendance.find(r => r.date === new Date().toISOString().split('T')[0])?.clockOut : 
                        'Not yet clocked out'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Button className="w-full" disabled={isClockInForToday}>
                  Clock In
                </Button>
                <Button className="w-full" variant="outline" disabled={!isClockInForToday || isClockOutForToday}>
                  Clock Out
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Recent Leave Requests</h3>
              {employeeLeaves.length > 0 ? (
                <div className="space-y-2">
                  {employeeLeaves.slice(0, 2).map(leave => (
                    <div key={leave.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{leave.type} Leave</div>
                        <div className="text-xs text-muted-foreground">
                          {leave.startDate} to {leave.endDate}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                        leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No recent leave requests
                </div>
              )}
              <div className="mt-2">
                <Button variant="outline" className="w-full">Apply for Leave</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  
  return isAdmin ? <AdminDashboard /> : <EmployeeDashboard />;
};

export default Dashboard;
