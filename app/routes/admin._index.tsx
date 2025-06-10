import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import dashboard from "~/controller/dashboard";
import AdminLayout from "~/layout/adminLayout";
import DashboardMetricCard from "~/components/ui/DashboardMetricCard";
import DashboardWidget, { QuickStat, TeamMemberItem } from "~/components/ui/DashboardWidget";
import { 
  Users, 
  ClipboardList, 
  Clock, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  Building2,
  UserPlus,
  Plus,
  Settings,
  Eye,
  Activity,
  Target,
  MessageSquare,
  PieChart,
  Home,
  BookOpen,
  Mail
} from "lucide-react";
import { Button, Progress, Chip, Avatar } from "@nextui-org/react";
import { motion } from "framer-motion";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
      return redirect("/addentech-login");
    }
    
    const currentUser = await Registration.findOne({ email });
    if (!currentUser) {
      return redirect("/addentech-login");
    }
    
    // Get comprehensive dashboard data based on user role
    const dashboardData = await dashboard.getRoleDashboardData(
      currentUser._id.toString(),
      currentUser.role,
      currentUser.department?.toString()
    );
    
    return json({
      currentUser: {
        id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department,
        workMode: currentUser.workMode
      },
      dashboardData
    });
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return json({
      currentUser: null,
      dashboardData: { error: "Failed to load dashboard data" }
    });
  }
};

const Admin = () => {
  const { currentUser, dashboardData } = useLoaderData<typeof loader>();
  
  if (!currentUser) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">Please log in to access the dashboard.</p>
        </div>
      </AdminLayout>
    );
  }
  
  if (dashboardData.error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
          <p className="text-gray-600 mt-2">{dashboardData.error}</p>
        </div>
      </AdminLayout>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Manager';
      case 'department_head': return 'Department Head';
      case 'staff': return 'Staff Member';
      default: return role;
    }
  };

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 
                     new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
    return `Good ${timeOfDay}, ${currentUser.firstName}!`;
  };

  // Role-specific quick actions
  const getQuickActions = () => {
    const actions = [];
    
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      actions.push(
        { label: "Create Task", href: "/admin/task-create", icon: <Plus className="h-4 w-4" /> },
        { label: "Manage Users", href: "/admin/users", icon: <UserPlus className="h-4 w-4" /> },
        { label: "View Reports", href: "/admin/reports", icon: <FileText className="h-4 w-4" /> },
        { label: "Attendance", href: "/admin/attendance", icon: <Clock className="h-4 w-4" /> }
      );
    } else if (currentUser.role === 'department_head') {
      actions.push(
        { label: "Department Tasks", href: "/admin/task-management", icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Team Calendar", href: "/admin/team-calendar", icon: <Calendar className="h-4 w-4" /> },
        { label: "Department Reports", href: "/admin/reports", icon: <BarChart3 className="h-4 w-4" /> },
        { label: "Leave Management", href: "/admin/leave-management", icon: <FileText className="h-4 w-4" /> }
      );
    } else if (currentUser.role === 'staff') {
      actions.push(
        { label: "My Tasks", href: "/admin/task-management", icon: <ClipboardList className="h-4 w-4" /> },
        { label: "Apply Leave", href: "/employee-leave-application", icon: <Calendar className="h-4 w-4" /> },
        { label: "My Attendance", href: "/admin/attendance", icon: <Clock className="h-4 w-4" /> },
        { label: "Team", href: "/team", icon: <Users className="h-4 w-4" /> }
      );
    }
    
    return actions;
  };

  const renderAdminDashboard = () => (
    <>
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard
          title="Total Users"
          value={dashboardData.totalUsers || 0}
          description="Active system users"
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <DashboardMetricCard
          title="Departments"
          value={dashboardData.totalDepartments || 0}
          description="Active departments"
          icon={<Building2 className="h-5 w-5" />}
          color="secondary"
        />
        <DashboardMetricCard
          title="Blog Posts"
          value={dashboardData.totalBlogs || 0}
          description="Published articles"
          icon={<BookOpen className="h-5 w-5" />}
          color="success"
        />
        <DashboardMetricCard
          title="Messages"
          value={dashboardData.totalMessages || 0}
          description="Contact inquiries"
          icon={<Mail className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Charts and Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget
          title="Users by Role"
          description="Distribution of user roles"
          icon={<PieChart className="h-5 w-5" />}
          action={{ label: "Manage Users", href: "/admin/users" }}
        >
          {dashboardData.usersByRole ? (
            <div className="space-y-3">
              {dashboardData.usersByRole.labels.map((role: string, index: number) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{role}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <Progress
                        size="sm"
                        value={(dashboardData.usersByRole.values[index] / Math.max(...dashboardData.usersByRole.values)) * 100}
                        color="primary"
                      />
                    </div>
                    <span className="text-sm font-bold w-8">{dashboardData.usersByRole.values[index]}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No user data available</p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Task Status Overview"
          description="Current task distribution"
          icon={<Target className="h-5 w-5" />}
          action={{ label: "View Tasks", href: "/admin/task-management" }}
        >
          {dashboardData.tasksByStatus ? (
            <div className="space-y-3">
              {dashboardData.tasksByStatus.labels.map((status: string, index: number) => (
                <QuickStat
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  value={dashboardData.tasksByStatus.values[index]}
                  color={status === 'completed' ? 'green' : status === 'pending' ? 'red' : 'blue'}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No task data available</p>
          )}
        </DashboardWidget>
      </div>

      {/* Department Performance */}
      {dashboardData.departmentPerformance && (
        <DashboardWidget
          title="Department Performance"
          description="Task completion across departments"
          icon={<BarChart3 className="h-5 w-5" />}
          action={{ label: "View Reports", href: "/admin/reports" }}
        >
          <div className="space-y-4">
            {dashboardData.departmentPerformance.map((dept: any) => (
              <div key={dept.name} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">{dept.name}</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <QuickStat label="Completed" value={dept.completed || 0} color="green" />
                  <QuickStat label="In Progress" value={dept.inProgress || 0} color="blue" />
                  <QuickStat label="Pending" value={dept.pending || 0} color="red" />
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>
      )}
    </>
  );

  const renderManagerDashboard = () => (
    <>
      {/* Manager Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard
          title="Total Users"
          value={dashboardData.totalUsers || 0}
          description="System users"
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <DashboardMetricCard
          title="Departments"
          value={dashboardData.totalDepartments || 0}
          description="Under management"
          icon={<Building2 className="h-5 w-5" />}
          color="secondary"
        />
        <DashboardMetricCard
          title="Work Modes"
          value={dashboardData.workModeDistribution?.labels?.length || 0}
          description="Hybrid management"
          icon={<Home className="h-5 w-5" />}
          color="success"
        />
        <DashboardMetricCard
          title="Active Tasks"
          value={dashboardData.tasksByStatus?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="Currently managed"
          icon={<ClipboardList className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Manager specific widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget
          title="Work Mode Distribution"
          description="Team work arrangement"
          icon={<Home className="h-5 w-5" />}
          action={{ label: "Manage Team", href: "/admin/users" }}
        >
          {dashboardData.workModeDistribution ? (
            <div className="space-y-3">
              {dashboardData.workModeDistribution.labels.map((mode: string, index: number) => (
                <QuickStat
                  key={mode}
                  label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                  value={dashboardData.workModeDistribution.values[index]}
                  color={mode === 'remote' ? 'blue' : 'green'}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No work mode data available</p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Recent Activities"
          description="Latest task updates"
          icon={<Activity className="h-5 w-5" />}
          action={{ label: "View All Tasks", href: "/admin/task-management" }}
        >
          {dashboardData.recentTasks && dashboardData.recentTasks.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentTasks.slice(0, 5).map((task: any) => (
                <div key={task._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      Assigned to: {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                    </p>
                  </div>
                  <Chip size="sm" color={task.status === 'completed' ? 'success' : 'warning'}>
                    {task.status}
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities</p>
          )}
        </DashboardWidget>
      </div>

      {/* Team Performance */}
      {dashboardData.teamPerformance && (
        <DashboardWidget
          title="Team Performance"
          description="Individual team member progress"
          icon={<Users className="h-5 w-5" />}
          action={{ label: "View Details", href: "/admin/reports" }}
        >
          <div className="space-y-3">
            {dashboardData.teamPerformance.map((member: any) => (
              <TeamMemberItem
                key={member.name}
                name={member.name}
                stats={{
                  completed: member.completed || 0,
                  pending: member.pending || 0,
                  inProgress: member.inProgress || 0
                }}
              />
            ))}
          </div>
        </DashboardWidget>
      )}
    </>
  );

  const renderDepartmentHeadDashboard = () => (
    <>
      {/* Department Head Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard
          title="Department Staff"
          value={dashboardData.departmentStaff || 0}
          description="Team members"
          icon={<Users className="h-5 w-5" />}
          color="primary"
        />
        <DashboardMetricCard
          title="Department Tasks"
          value={dashboardData.departmentTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="Active tasks"
          icon={<ClipboardList className="h-5 w-5" />}
          color="secondary"
        />
        <DashboardMetricCard
          title="Work Modes"
          value={dashboardData.workModeBreakdown?.labels?.length || 0}
          description="Team arrangement"
          icon={<Home className="h-5 w-5" />}
          color="success"
        />
        <DashboardMetricCard
          title="Monthly Attendance"
          value={dashboardData.departmentAttendance?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="This month"
          icon={<Clock className="h-5 w-5" />}
          color="warning"
        />
      </div>

      {/* Department specific widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget
          title="Department Task Status"
          description="Current task distribution"
          icon={<Target className="h-5 w-5" />}
          action={{ label: "Manage Tasks", href: "/admin/task-management" }}
        >
          {dashboardData.departmentTasks ? (
            <div className="space-y-3">
              {dashboardData.departmentTasks.labels.map((status: string, index: number) => (
                <QuickStat
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  value={dashboardData.departmentTasks.values[index]}
                  color={status === 'completed' ? 'green' : status === 'pending' ? 'red' : 'blue'}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No task data available</p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Work Mode Analysis"
          description="Department work arrangement"
          icon={<PieChart className="h-5 w-5" />}
          action={{ label: "View Team", href: "/admin/users" }}
        >
          {dashboardData.workModeBreakdown ? (
            <div className="space-y-3">
              {dashboardData.workModeBreakdown.labels.map((mode: string, index: number) => (
                <div key={mode} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium capitalize">{mode}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{dashboardData.workModeBreakdown.values[index]}</span>
                    {dashboardData.workModeAttendance && (
                      <span className="text-xs text-gray-600">
                        Avg: {dashboardData.workModeAttendance.avgHours?.[index] || 0}h
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No work mode data available</p>
          )}
        </DashboardWidget>
      </div>

      {/* Staff Performance */}
      {dashboardData.staffPerformance && (
        <DashboardWidget
          title="Staff Performance"
          description="Department team member progress"
          icon={<Users className="h-5 w-5" />}
          action={{ label: "View Reports", href: "/admin/reports" }}
        >
          <div className="space-y-3">
            {dashboardData.staffPerformance.map((member: any) => (
              <TeamMemberItem
                key={member.name}
                name={member.name}
                stats={{
                  completed: member.completed || 0,
                  pending: member.pending || 0,
                  inProgress: member.inProgress || 0
                }}
              />
            ))}
          </div>
        </DashboardWidget>
      )}
    </>
  );

  const renderStaffDashboard = () => (
    <>
      {/* Staff Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard
          title="My Tasks"
          value={dashboardData.userTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="Total assigned"
          icon={<ClipboardList className="h-5 w-5" />}
          color="primary"
        />
        <DashboardMetricCard
          title="Completed"
          value={dashboardData.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('completed')] || 0}
          description="Tasks finished"
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="success"
        />
        <DashboardMetricCard
          title="Pending"
          value={dashboardData.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('pending')] || 0}
          description="Awaiting action"
          icon={<AlertCircle className="h-5 w-5" />}
          color="warning"
        />
        <DashboardMetricCard
          title="Work Mode"
          value={currentUser.workMode?.charAt(0).toUpperCase() + currentUser.workMode?.slice(1) || "Not Set"}
          description="Current setting"
          icon={<Home className="h-5 w-5" />}
          color="secondary"
        />
      </div>

      {/* Staff specific widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardWidget
          title="My Task Progress"
          description="Personal task breakdown"
          icon={<Target className="h-5 w-5" />}
          action={{ label: "View All Tasks", href: "/admin/task-management" }}
        >
          {dashboardData.userTasks ? (
            <div className="space-y-3">
              {dashboardData.userTasks.labels.map((status: string, index: number) => (
                <QuickStat
                  key={status}
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                  value={dashboardData.userTasks.values[index]}
                  color={status === 'completed' ? 'green' : status === 'pending' ? 'red' : 'blue'}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No task data available</p>
          )}
        </DashboardWidget>

        <DashboardWidget
          title="Upcoming Deadlines"
          description="Tasks requiring attention"
          icon={<Calendar className="h-5 w-5" />}
          action={{ label: "Apply Leave", href: "/employee-leave-application" }}
        >
          {dashboardData.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingTasks.slice(0, 5).map((task: any) => (
                <div key={task._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Chip size="sm" color="warning">
                    {task.priority || 'Normal'}
                  </Chip>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
          )}
        </DashboardWidget>
      </div>

      {/* Recent Activities */}
      {dashboardData.recentActivities && (
        <DashboardWidget
          title="Recent Activities"
          description="Your recent task updates"
          icon={<Activity className="h-5 w-5" />}
          action={{ label: "View All", href: "/admin/task-management" }}
        >
          <div className="space-y-3">
            {dashboardData.recentActivities.slice(0, 5).map((activity: any) => (
              <div key={activity._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-600">
                    Updated: {new Date(activity.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Chip size="sm" color={activity.status === 'completed' ? 'success' : 'default'}>
                  {activity.status}
                </Chip>
              </div>
            ))}
          </div>
        </DashboardWidget>
      )}

      {/* Monthly Attendance Chart */}
      {dashboardData.userAttendance && (
        <DashboardWidget
          title="My Attendance This Month"
          description="Daily work hours tracking"
          icon={<Clock className="h-5 w-5" />}
          action={{ label: "View Details", href: "/admin/attendance" }}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Average Daily Hours</span>
              <span>
                {dashboardData.userAttendance.values?.length > 0 
                  ? (dashboardData.userAttendance.values.reduce((a: number, b: number) => a + b, 0) / dashboardData.userAttendance.values.filter((v: number) => v > 0).length).toFixed(1)
                  : '0'
                }h
              </span>
            </div>
            <Progress
              size="sm"
              value={Math.min((dashboardData.userAttendance.values?.reduce((a: number, b: number) => a + b, 0) || 0) / (8 * 30) * 100, 100)}
              color="success"
            />
            <div className="text-xs text-gray-500">
              Total hours this month: {dashboardData.userAttendance.values?.reduce((a: number, b: number) => a + b, 0).toFixed(1) || '0'}h
            </div>
          </div>
        </DashboardWidget>
      )}
    </>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
              <p className="text-blue-100 mt-1">
                {getRoleDisplayName(currentUser.role)} Dashboard
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Today's Date</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DashboardWidget
            title="Quick Actions"
            description="Frequently used features"
            icon={<Settings className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {getQuickActions().map((action, index) => (
                <Button
                  key={index}
                  as={Link}
                  to={action.href}
                  variant="flat"
                  color="primary"
                  startContent={action.icon}
                  className="justify-start h-auto p-3"
                >
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </DashboardWidget>
        </motion.div>

        {/* Role-specific Dashboard Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {currentUser.role === 'admin' && renderAdminDashboard()}
          {currentUser.role === 'manager' && renderManagerDashboard()}
          {currentUser.role === 'department_head' && renderDepartmentHeadDashboard()}
          {currentUser.role === 'staff' && renderStaffDashboard()}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Admin;