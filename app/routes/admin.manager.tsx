import { Card, CardHeader, Divider, Progress, Button, Chip, Avatar } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { BarChart2, CheckSquare, Clock, FileText, Users, UserCheck, TrendingUp, AlertCircle, Plus, Settings, Activity, Target, Home, Building2, Eye } from "lucide-react"
import React, { useEffect, useState } from "react"
import ChartComponent from "~/components/charts/Chart"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import DashboardMetricCard from "~/components/ui/DashboardMetricCard"
import DashboardWidget, { QuickStat, TeamMemberItem } from "~/components/ui/DashboardWidget"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
import Registration from "~/modal/registration"
import dashboard from "~/controller/dashboard"
import { motion } from "framer-motion"

const ManagerDashboard = () => {
  const { userProfile, dashboardData, error } = useLoaderData<typeof loader>()
  
  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </AdminLayout>
    )
  }

  const getWelcomeMessage = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 
                     new Date().getHours() < 18 ? 'Afternoon' : 'Evening';
    return `Good ${timeOfDay}, ${userProfile?.firstName}!`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
              <p className="text-purple-100 mt-1">Manager Dashboard - System Overview</p>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Today's Date</p>
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
            description="Manager tools and shortcuts"
            icon={<Settings className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                as={Link}
                to="/admin/task-create"
                variant="flat"
                color="primary"
                startContent={<Plus className="h-4 w-4" />}
                className="justify-start h-auto p-3"
              >
                <span className="text-xs">Create Task</span>
              </Button>
              <Button
                as={Link}
                to="/admin/users"
                variant="flat"
                color="primary"
                startContent={<Users className="h-4 w-4" />}
                className="justify-start h-auto p-3"
              >
                <span className="text-xs">Manage Team</span>
              </Button>
              <Button
                as={Link}
                to="/admin/reports"
                variant="flat"
                color="primary"
                startContent={<FileText className="h-4 w-4" />}
                className="justify-start h-auto p-3"
              >
                <span className="text-xs">View Reports</span>
              </Button>
              <Button
                as={Link}
                to="/admin/attendance"
                variant="flat"
                color="primary"
                startContent={<Clock className="h-4 w-4" />}
                className="justify-start h-auto p-3"
              >
                <span className="text-xs">Attendance</span>
              </Button>
            </div>
          </DashboardWidget>
        </motion.div>

        {/* Manager Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <DashboardMetricCard
            title="Total Users"
            value={dashboardData?.totalUsers || 0}
            description="System users"
            icon={<Users className="h-5 w-5" />}
            color="primary"
          />
          <DashboardMetricCard
            title="Departments"
            value={dashboardData?.totalDepartments || 0}
            description="Under management"
            icon={<Building2 className="h-5 w-5" />}
            color="secondary"
          />
          <DashboardMetricCard
            title="Work Modes"
            value={dashboardData?.workModeDistribution?.labels?.length || 0}
            description="Hybrid management"
            icon={<Home className="h-5 w-5" />}
            color="success"
          />
          <DashboardMetricCard
            title="Active Tasks"
            value={dashboardData?.tasksByStatus?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
            description="Currently managed"
            icon={<Target className="h-5 w-5" />}
            color="warning"
          />
        </motion.div>

        {/* Manager specific widgets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DashboardWidget
            title="Work Mode Distribution"
            description="Team work arrangement"
            icon={<Home className="h-5 w-5" />}
            action={{ label: "Manage Team", href: "/admin/users" }}
          >
            {dashboardData?.workModeDistribution ? (
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
            title="Task Status Overview"
            description="Current task distribution"
            icon={<Target className="h-5 w-5" />}
            action={{ label: "View Tasks", href: "/admin/task-management" }}
          >
            {dashboardData?.tasksByStatus ? (
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
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DashboardWidget
            title="Recent Activities"
            description="Latest task updates"
            icon={<Activity className="h-5 w-5" />}
            action={{ label: "View All Tasks", href: "/admin/task-management" }}
          >
            {dashboardData?.recentTasks && dashboardData.recentTasks.length > 0 ? (
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

          <DashboardWidget
            title="System Overview"
            description="Overall system metrics"
            icon={<BarChart2 className="h-5 w-5" />}
            action={{ label: "View Reports", href: "/admin/reports" }}
          >
            <div className="space-y-3">
              <QuickStat label="Blog Posts" value={dashboardData?.totalBlogs || 0} color="blue" />
              <QuickStat label="Categories" value={dashboardData?.totalCategories || 0} color="green" />
              <QuickStat label="Messages" value={dashboardData?.totalMessages || 0} color="red" />
            </div>
          </DashboardWidget>
        </motion.div>

        {/* Team Performance */}
        {dashboardData?.teamPerformance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
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
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ManagerDashboard

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Authenticate user and check if they're a manager
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
      return redirect("/addentech-login");
    }
    
    // Get user profile and check role
    const userProfile = await Registration.findOne({ email });
    if (!userProfile || userProfile.role !== "manager") {
      return redirect("/admin?error=Access denied. Manager role required.");
    }
    
    // Get role-specific dashboard data from controller
    const dashboardData = await dashboard.getRoleDashboardData(
      userProfile._id.toString(),
      userProfile.role,
      userProfile.department?.toString()
    )
    
    if (dashboardData.error) {
      return json({
        error: dashboardData.error,
        userProfile,
        dashboardData: {}
      });
    }
    
    return json({
      userProfile: {
        id: userProfile._id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        role: userProfile.role,
        department: userProfile.department,
        workMode: userProfile.workMode
      },
      dashboardData
    });
  } catch (error) {
    console.error("Manager dashboard error:", error);
    return json({
      error: "Failed to load manager dashboard",
      userProfile: null,
      dashboardData: {}
    });
  }
}
