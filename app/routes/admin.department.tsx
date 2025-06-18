import { Card, CardHeader, Divider, Button, Chip, Progress } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { BarChart2, CheckSquare, Clock, FileText, User, Users, HomeIcon, Building2, AlertCircle, Target, Activity, Settings, Calendar, PieChart } from "lucide-react"
import React, { useEffect, useState } from "react"
import ChartComponent from "~/components/charts/Chart"
import { CardBody } from "~/components/acternity/3d"
import NewCustomTable from "~/components/table/newTable"
import MetricCard from "~/components/ui/customCard"
import DashboardMetricCard from "~/components/ui/DashboardMetricCard"
import DashboardWidget, { QuickStat, TeamMemberItem } from "~/components/ui/DashboardWidget"
import dashboard from "~/controller/dashboard"
import AdminLayout from "~/layout/adminLayout"
import Registration from "~/modal/registration"
import Department from "~/modal/department"
import { getSession } from "~/session"
import { motion } from "framer-motion"
import LineChart from "~/components/ui/LineChart"

const DepartmentHeadDashboard = () => {
  const { dashboardData, departmentName, error, userProfile } = useLoaderData<typeof loader>()
  
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
              <p className="text-pink-100 mt-1">Department Head - {departmentName}</p>
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
            description="Department management tools"
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
                <span className="text-xs">Department Tasks</span>
              </Button>
              <Button
                as={Link}
                to="/admin/team-calendar"
                variant="flat"
                startContent={<Calendar className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">Team Calendar</span>
              </Button>
              <Button
                as={Link}
                to="/admin/reports"
                variant="flat"
                startContent={<BarChart2 className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">Department Reports</span>
              </Button>
              <Button
                as={Link}
                to="/admin/leave-management"
                variant="flat"
                startContent={<FileText className="h-4 w-4" />}
                className="justify-start h-auto p-3 bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200"
              >
                <span className="text-xs">Leave Management</span>
              </Button>
            </div>
          </DashboardWidget>
        </motion.div>

        {/* Department Head Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <DashboardMetricCard
            title="Department Staff"
            value={dashboardData?.departmentStaff || 0}
            description="Team members"
            icon={<Users className="h-5 w-5" />}
            color="primary"
          />
          <DashboardMetricCard
            title="Department Tasks"
            value={dashboardData?.departmentTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
            description="Active tasks"
            icon={<CheckSquare className="h-5 w-5" />}
            color="secondary"
          />
          <DashboardMetricCard
            title="Work Modes"
            value={dashboardData?.workModeBreakdown?.labels?.length || 0}
            description="Team arrangement"
            icon={<HomeIcon className="h-5 w-5" />}
            color="success"
          />
          <DashboardMetricCard
            title="Monthly Attendance"
            value={dashboardData?.departmentAttendance?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
            description="This month"
            icon={<Clock className="h-5 w-5" />}
            color="warning"
          />
        </motion.div>

        {/* Department Head Statistics Line Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <LineChart
            title="Department Statistics Overview"
            data={{
              labels: ['Department Staff', 'Department Tasks', 'Work Modes', 'Monthly Attendance'],
              datasets: [
                {
                  label: 'Department Stats',
                  data: [
                    dashboardData?.departmentStaff || 0,
                    dashboardData?.departmentTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0,
                    dashboardData?.workModeBreakdown?.labels?.length || 0,
                    dashboardData?.departmentAttendance?.values?.reduce((a: number, b: number) => a + b, 0) || 0
                  ],
                  borderColor: '#F59E0B',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            height={350}
            className="mb-6"
          />
        </motion.div>

        {/* Department specific widgets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DashboardWidget
            title="Department Task Status"
            description="Current task distribution"
            icon={<Target className="h-5 w-5" />}
            action={{ label: "Manage Tasks", href: "/admin/task-management" }}
          >
            {dashboardData?.departmentTasks ? (
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
            {dashboardData?.workModeBreakdown ? (
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
        </motion.div>

        {/* Department Attendance and Performance */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <DashboardWidget
            title="Department Attendance"
            description="Monthly attendance overview"
            icon={<Clock className="h-5 w-5" />}
            action={{ label: "View Details", href: "/admin/attendance" }}
          >
            {dashboardData?.departmentAttendance ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Attendance Days</span>
                  <span>{dashboardData.departmentAttendance.values?.reduce((a: number, b: number) => a + b, 0) || 0}</span>
                </div>
                <Progress
                  size="sm"
                  value={Math.min((dashboardData.departmentAttendance.values?.reduce((a: number, b: number) => a + b, 0) || 0) / (dashboardData.departmentStaff * 22) * 100, 100)}
                  color="success"
                />
                <div className="text-xs text-gray-500">
                  Average daily attendance: {dashboardData.departmentAttendance.values?.length > 0 
                    ? (dashboardData.departmentAttendance.values.reduce((a: number, b: number) => a + b, 0) / dashboardData.departmentAttendance.values.filter((v: number) => v > 0).length).toFixed(1)
                    : '0'
                  } people
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No attendance data available</p>
            )}
          </DashboardWidget>

          <DashboardWidget
            title="Quick Overview"
            description="Department metrics summary"
            icon={<BarChart2 className="h-5 w-5" />}
            action={{ label: "Full Reports", href: "/admin/reports" }}
          >
            <div className="space-y-3">
              <QuickStat label="Staff Count" value={dashboardData?.departmentStaff || 0} color="blue" />
              <QuickStat 
                label="Completed Tasks" 
                value={dashboardData?.departmentTasks?.values?.[dashboardData.departmentTasks.labels?.indexOf('completed')] || 0} 
                color="green" 
              />
              <QuickStat 
                label="Pending Tasks" 
                value={dashboardData?.departmentTasks?.values?.[dashboardData.departmentTasks.labels?.indexOf('pending')] || 0} 
                color="red" 
              />
            </div>
          </DashboardWidget>
        </motion.div>

        {/* Staff Performance */}
        {dashboardData?.staffPerformance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
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
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}

export default DepartmentHeadDashboard

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Get the session and user
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
      return redirect("/addentech-login")
    }
    
    // Get user information to determine department
    const user = await Registration.findOne({ email })
    
    if (!user) {
      return redirect("/addentech-login")
    }
    
    // Verify user is a department head or manager
    if (user.role !== 'department_head' && user.role !== 'head' && user.role !== 'manager') {
      return redirect("/admin?error=You do not have permission to access the department head dashboard")
    }
    
    // Check if user has permission to view dashboard (handle undefined permissions gracefully)
    const permissions = user.permissions ? Object.fromEntries(user.permissions) : {};
    
    // For managers and department heads, allow access even if permissions are not explicitly set
    const hasViewPermission = 
      ['manager', 'department_head', 'head'].includes(user.role) || 
      (permissions && permissions.view_dashboard);
      
    if (!hasViewPermission) {
      return redirect("/admin?error=You do not have permission to view the dashboard")
    }
    
    // Get department information
    const departmentId = user.department?.toString();
    if (!departmentId) {
      return json({
        error: "You are not assigned to any department",
        departmentName: "Not Assigned",
        dashboardData: {},
        userProfile: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      })
    }
    
    // Get department name
    const departmentInfo = await Department.findById(departmentId);
    const departmentName = departmentInfo?.name || "Unknown Department";
    
    // Get role-specific dashboard data
    const dashboardData = await dashboard.getRoleDashboardData(
      user._id.toString(),
      user.role,
      departmentId
    )
    
    if (dashboardData.error) {
      return json({ 
        error: dashboardData.error, 
        departmentName,
        dashboardData: {},
        userProfile: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      })
    }
    
    return json({
      dashboardData,
      departmentName,
      userProfile: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        workMode: user.workMode
      }
    })
    
  } catch (error) {
    console.error("Error loading department head dashboard:", error)
    return json({ 
      error: "Failed to load department head dashboard",
      departmentName: "Unknown",
      dashboardData: {},
      userProfile: null
    })
  }
} 