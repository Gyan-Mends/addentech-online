import { Card, CardHeader, Divider, Progress, Button, Chip } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { CheckSquare, Clock, FileText, Calendar, ChevronRight, FileCheck, BookOpen, AlertCircle, Target, Activity, Settings, Home, TrendingUp } from "lucide-react"
import React, { useState, useEffect } from "react"
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
import LineChart from "~/components/ui/LineChart"

const StaffDashboard = () => {
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
          className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{getWelcomeMessage()}</h1>
              <p className="text-pink-100 mt-1">Staff Member Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-pink-100 text-sm">Today's Date</p>
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
            description="Your daily tools and shortcuts"
            icon={<Settings className="h-5 w-5" />}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                as={Link}
                to="/admin/task-management"
                variant="flat"
                startContent={<CheckSquare className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">My Tasks</span>
              </Button>
              <Button
                as={Link}
                to="/employee-leave-application"
                variant="flat"
                startContent={<Calendar className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">Apply Leave</span>
              </Button>
              <Button
                as={Link}
                to="/admin/attendance"
                variant="flat"
                startContent={<Clock className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">My Attendance</span>
              </Button>
              <Button
                as={Link}
                to="/team"
                variant="flat"
                startContent={<Activity className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">Team</span>
              </Button>
            </div>
          </DashboardWidget>
        </motion.div>

        {/* Staff Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <DashboardMetricCard
            title="My Tasks"
            value={dashboardData?.userTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
            description="Total assigned"
            icon={<CheckSquare className="h-5 w-5" />}
            color="primary"
          />
          <DashboardMetricCard
            title="Completed"
            value={dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('completed')] || 0}
            description="Tasks finished"
            icon={<FileCheck className="h-5 w-5" />}
            color="success"
          />
          <DashboardMetricCard
            title="Pending"
            value={dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('pending')] || 0}
            description="Awaiting action"
            icon={<AlertCircle className="h-5 w-5" />}
            color="warning"
          />
          <DashboardMetricCard
            title="Work Mode"
            value={userProfile?.workMode?.charAt(0).toUpperCase() + userProfile?.workMode?.slice(1) || "Not Set"}
            description="Current setting"
            icon={<Home className="h-5 w-5" />}
            color="secondary"
          />
        </motion.div>

        {/* Staff Statistics Line Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <LineChart
            title="My Personal Statistics Overview"
            data={{
              labels: ['My Tasks', 'Completed', 'Pending', 'In Progress'],
              datasets: [
                {
                  label: 'My Stats',
                  data: [
                    dashboardData?.userTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0,
                    dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('completed')] || 0,
                    dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('pending')] || 0,
                    dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('in_progress')] || 0
                  ],
                  borderColor: '#8B5CF6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            height={350}
            className="mb-6"
          />
        </motion.div>

        {/* Staff specific widgets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DashboardWidget
            title="My Task Progress"
            description="Personal task breakdown"
            icon={<Target className="h-5 w-5" />}
            action={{ label: "View All Tasks", href: "/admin/task-management" }}
          >
            {dashboardData?.userTasks ? (
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
            {dashboardData?.upcomingTasks && dashboardData.upcomingTasks.length > 0 ? (
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
        </motion.div>

        {/* Recent Activities and Attendance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DashboardWidget
            title="Recent Activities"
            description="Your recent task updates"
            icon={<Activity className="h-5 w-5" />}
            action={{ label: "View All", href: "/admin/task-management" }}
          >
            {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
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
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            )}
          </DashboardWidget>

          <DashboardWidget
            title="My Attendance This Month"
            description="Daily work hours tracking"
            icon={<Clock className="h-5 w-5" />}
            action={{ label: "View Details", href: "/admin/attendance" }}
          >
            {dashboardData?.userAttendance ? (
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
            ) : (
              <p className="text-gray-500 text-center py-4">No attendance data available</p>
            )}
          </DashboardWidget>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <DashboardWidget
            title="Performance Summary"
            description="Your monthly performance overview"
            icon={<TrendingUp className="h-5 w-5" />}
            action={{ label: "View Leave Balance", href: "/employee-leave-balance" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('completed')] || 0}
                </p>
                <p className="text-sm text-gray-600">Tasks Completed</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData?.userAttendance?.values?.filter((v: number) => v > 0).length || 0}
                </p>
                <p className="text-sm text-gray-600">Days Attended</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {((dashboardData?.userTasks?.values?.[dashboardData.userTasks?.labels?.indexOf('completed')] || 0) / Math.max(dashboardData?.userTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 1, 1) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">Completion Rate</p>
              </div>
            </div>
          </DashboardWidget>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

export default StaffDashboard

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Authenticate user and check if they're a staff member
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
      return redirect("/addentech-login");
    }
    
    // Get user profile and check role
    const userProfile = await Registration.findOne({ email });
    if (!userProfile || userProfile.role !== "staff") {
      return redirect("/admin?error=Access denied. Staff role required.");
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
    console.error("Staff dashboard error:", error);
    return json({
      error: "Failed to load staff dashboard",
      userProfile: null,
      dashboardData: {}
    });
  }
}
