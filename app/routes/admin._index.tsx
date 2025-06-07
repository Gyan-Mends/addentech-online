import { Card, CardHeader, Divider, Tab, Tabs, Progress, Chip, Button, Avatar, AvatarGroup } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BarChart2, BookOpen, Folder, MessageSquare, Tag, Users, TrendingUp, Clock, CheckSquare, Activity, Calendar, AlertTriangle, Target, Award, UserCheck, Settings, RefreshCw } from "lucide-react"
import React, { useEffect, useState } from "react"
import { CardBody } from "~/components/acternity/3d"
import ChartComponent from "~/components/charts/Chart"
import PerformanceTable from "~/components/tables/PerformanceTable"
import MetricCard from "~/components/ui/customCard"
import DashboardMetricCard from "~/components/ui/DashboardMetricCard"
import DashboardWidget, { QuickStat, TeamMemberItem } from "~/components/ui/DashboardWidget"
import dashboard from "~/controller/dashboard"
import AdminLayout from "~/layout/adminLayout"
import Registration from "~/modal/registration"
import { getSession } from "~/session"

const Dashboard = () => {
  const data = useLoaderData<typeof loader>()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState("overview")

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Handle loading and error states
  if (data.error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600">{data.error}</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard
          title="Total Users"
          value={data.totalUsers || 0}
          description="Active system users"
          icon={<Users className="h-4 w-4" />}
          trend="up"
          color="primary"
          trendPercentage={8}
        />
        <DashboardMetricCard
          title="Departments"
          value={data.totalDepartments || 0}
          description="Active departments"
          icon={<Folder className="h-4 w-4" />}
          trend="stable"
          color="secondary"
        />
        <DashboardMetricCard
          title="Total Tasks"
          value={data.tasksByStatus?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="All tasks in system"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="up"
          color="success"
          trendPercentage={12}
        />
        <DashboardMetricCard
          title="Messages"
          value={data.totalMessages || 0}
          description="Unread messages"
          icon={<MessageSquare className="h-4 w-4" />}
          trend="stable"
          color="warning"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.usersByRole && (
          <ChartComponent
            type="doughnut"
            data={data.usersByRole}
            title="Users by Role"
            description="Distribution of users across different roles"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
          />
        )}
        {data.tasksByStatus && (
          <ChartComponent
            type="bar"
            data={data.tasksByStatus}
            title="Tasks by Status"
            description="Current task status distribution"
            colors={['#10B981', '#F59E0B', '#EF4444', '#6B7280']}
          />
        )}
      </div>

      {/* Department Performance */}
      {data.departmentPerformance && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Department Performance Overview
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {data.departmentPerformance.map((dept: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{dept.name}</h4>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-green-600">Completed: {dept.completed || 0}</span>
                      <span className="text-yellow-600">In Progress: {dept.inProgress || 0}</span>
                      <span className="text-gray-600">Pending: {dept.pending || 0}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((dept.completed || 0) / Math.max((dept.completed || 0) + (dept.inProgress || 0) + (dept.pending || 0), 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Completion Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Monthly Attendance Trend */}
      {data.attendanceByMonth && (
        <ChartComponent
          type="line"
          data={data.attendanceByMonth}
          title="Monthly Attendance Trends"
          description="Attendance patterns over the last 6 months"
          colors={['#3B82F6']}
        />
      )}
    </div>
  )

  const renderManagerDashboard = () => (
    <div className="space-y-6">
      {/* Manager Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Tasks"
          value={data.tasksByStatus?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="Tasks under management"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Team Members"
          value={data.totalUsers || 0}
          description="Team size"
          icon={<Users className="h-4 w-4" />}
          trend="stable"
        />
        <MetricCard
          title="Work Modes"
          value={data.workModeDistribution?.labels?.length || 0}
          description="Different work arrangements"
          icon={<Activity className="h-4 w-4" />}
          trend="stable"
        />
        <MetricCard
          title="Recent Activities"
          value={data.recentTasks?.length || 0}
          description="Recent task updates"
          icon={<Clock className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Manager Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.tasksByStatus && (
          <ChartComponent
            type="doughnut"
            data={data.tasksByStatus}
            title="Task Status Distribution"
            description="Current status of all managed tasks"
            colors={['#10B981', '#F59E0B', '#EF4444', '#6B7280']}
          />
        )}
        {data.workModeDistribution && (
          <ChartComponent
            type="pie"
            data={data.workModeDistribution}
            title="Work Mode Distribution"
            description="Team work arrangement preferences"
            colors={['#3B82F6', '#10B981', '#F59E0B']}
          />
        )}
      </div>

      {/* Team Performance */}
      {data.teamPerformance && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              Team Performance Insights
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {data.teamPerformance.map((member: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" name={member.name} />
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <div className="flex gap-3 mt-1 text-sm">
                        <span className="text-green-600">✓ {member.completed || 0}</span>
                        <span className="text-yellow-600">⏳ {member.inProgress || 0}</span>
                        <span className="text-gray-600">📋 {member.pending || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Progress
                      size="sm"
                      value={Math.round(((member.completed || 0) / Math.max((member.completed || 0) + (member.inProgress || 0) + (member.pending || 0), 1)) * 100)}
                      className="w-20"
                      color="success"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {Math.round(((member.completed || 0) / Math.max((member.completed || 0) + (member.inProgress || 0) + (member.pending || 0), 1)) * 100)}% complete
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )

  const renderDepartmentHeadDashboard = () => (
    <div className="space-y-6">
      {/* Department Head Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Department Staff"
          value={data.departmentStaff || 0}
          description="Team members in department"
          icon={<Users className="h-4 w-4" />}
          trend="stable"
        />
        <MetricCard
          title="Department Tasks"
          value={data.departmentTasks?.values?.reduce((a: number, b: number) => a + b, 0) || 0}
          description="Tasks in your department"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Work Modes"
          value={data.workModeBreakdown?.labels?.length || 0}
          description="Team work arrangements"
          icon={<Activity className="h-4 w-4" />}
          trend="stable"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${Math.round(((data.departmentAttendance?.values?.reduce((a: number, b: number) => a + b, 0) || 0) / (data.departmentStaff || 1)) * 100)}%`}
          description="Department attendance"
          icon={<UserCheck className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Department Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.departmentTasks && (
          <ChartComponent
            type="bar"
            data={data.departmentTasks}
            title="Department Task Status"
            description="Status of tasks in your department"
            colors={['#10B981', '#F59E0B', '#EF4444', '#6B7280']}
          />
        )}
        {data.workModeBreakdown && (
          <ChartComponent
            type="doughnut"
            data={data.workModeBreakdown}
            title="Work Mode Distribution"
            description="How your team prefers to work"
            colors={['#3B82F6', '#10B981', '#F59E0B']}
          />
        )}
      </div>

      {/* Staff Performance */}
      {data.staffPerformance && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Staff Performance in Department
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {data.staffPerformance.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" name={staff.name} />
                    <div>
                      <h4 className="font-medium">{staff.name}</h4>
                      <div className="flex gap-3 mt-1 text-sm">
                        <span className="text-green-600">Completed: {staff.completed || 0}</span>
                        <span className="text-yellow-600">In Progress: {staff.inProgress || 0}</span>
                        <span className="text-gray-600">Pending: {staff.pending || 0}</span>
                      </div>
                    </div>
                  </div>
                  <Chip
                    color={Math.round(((staff.completed || 0) / Math.max((staff.completed || 0) + (staff.inProgress || 0) + (staff.pending || 0), 1)) * 100) >= 70 ? "success" : "warning"}
                    variant="flat"
                  >
                    {Math.round(((staff.completed || 0) / Math.max((staff.completed || 0) + (staff.inProgress || 0) + (staff.pending || 0), 1)) * 100)}% complete
                  </Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Department Attendance */}
      {data.departmentAttendance && (
        <ChartComponent
          type="line"
          data={data.departmentAttendance}
          title="Department Daily Attendance"
          description="Daily attendance patterns this month"
          colors={['#8B5CF6']}
        />
      )}
    </div>
  )

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      {/* Staff Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="My Tasks"
          value={data.userTasks?.values?.reduce((a, b) => a + b, 0) || 0}
          description="Total tasks assigned to you"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Completed"
          value={data.userTasks?.values?.[data.userTasks.labels?.indexOf('Completed')] || 0}
          description="Tasks you've completed"
          icon={<Award className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Pending"
          value={data.userTasks?.values?.[data.userTasks.labels?.indexOf('Pending')] || 0}
          description="Tasks waiting for you"
          icon={<Clock className="h-4 w-4" />}
          trend="stable"
        />
        <MetricCard
          title="Hours This Month"
          description="Total hours worked"
          value={`${data.userAttendance?.values?.reduce((a: number, b: number) => a + b, 0)?.toFixed(1) || 0}h`}
          icon={<Activity className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Staff Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.userTasks && (
          <ChartComponent
            type="doughnut"
            data={data.userTasks}
            title="My Task Status"
            description="Status of your assigned tasks"
            colors={['#10B981', '#F59E0B', '#EF4444', '#6B7280']}
          />
        )}
        {data.userAttendance && (
          <ChartComponent
            type="bar"
            data={data.userAttendance}
            title="My Daily Hours"
            description="Hours worked each day this month"
            colors={['#3B82F6']}
          />
        )}
      </div>

      {/* Upcoming Tasks */}
      {data.upcomingTasks && data.upcomingTasks.length > 0 && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Upcoming Tasks & Deadlines
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {data.upcomingTasks.slice(0, 5).map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-l-orange-400">
                  <div>
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{task.description?.substring(0, 60)}...</p>
                  </div>
                  <div className="text-right">
                    <Chip size="sm" color="warning" variant="flat">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Chip>
                    <div className="text-xs text-gray-500 mt-1">
                      Priority: {task.priority}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Activities */}
      {data.recentActivities && data.recentActivities.length > 0 && (
        <Card className="p-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {data.recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{activity.title}</h4>
                    <p className="text-sm text-gray-600">
                      Updated {new Date(activity.updatedAt).toLocaleDateString()} - Status: {activity.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )

  const renderDashboardByRole = () => {
    switch (data.userRole) {
      case 'admin':
        return renderAdminDashboard()
      case 'manager':
        return renderManagerDashboard()
      case 'department_head':
        return renderDepartmentHeadDashboard()
      case 'staff':
      default:
        return renderStaffDashboard()
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {data.userRole === 'admin' && '🎯 Admin Dashboard'}
                {data.userRole === 'manager' && '📊 Manager Dashboard'}
                {data.userRole === 'department_head' && '🏢 Department Dashboard'}
                {data.userRole === 'staff' && '👤 My Dashboard'}
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's what's happening in your workspace.
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <Divider className="mt-4" />
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <Chip 
            color="primary" 
            variant="flat" 
            size="lg"
            startContent={<UserCheck className="h-4 w-4" />}
          >
            {data.userRole?.replace('_', ' ').toUpperCase()} ACCESS
          </Chip>
        </div>

        {/* Main Dashboard Content */}
        {renderDashboardByRole()}

        {/* Quick Actions Footer */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {(data.userRole === 'admin' || data.userRole === 'manager' || data.userRole === 'department_head') && (
              <Button
                as="a"
                href="/admin/tasks"
                color="primary"
                variant="flat"
                startContent={<CheckSquare className="h-4 w-4" />}
              >
                Manage Tasks
              </Button>
            )}
            <Button
              as="a"
              href="/admin/attendance"
              color="secondary"
              variant="flat"
              startContent={<Clock className="h-4 w-4" />}
            >
              View Attendance
            </Button>
            <Button
              as="a"
              href="/admin/monthly-reports"
              color="success"
              variant="flat"
              startContent={<BarChart2 className="h-4 w-4" />}
            >
              Reports
            </Button>
            {data.userRole === 'admin' && (
              <Button
                as="a"
                href="/admin/users"
                color="warning"
                variant="flat"
                startContent={<Users className="h-4 w-4" />}
              >
                Manage Users
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              color="default"
              variant="flat"
              startContent={<RefreshCw className="h-4 w-4" />}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard

export const loader: LoaderFunction = async ({ request }) => {
  // Get the session and user
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");
  
  if (!email) {
    return redirect("/addentech-login")
  }
  
  try {
    // Get user information to determine role and department
    const user = await Registration.findOne({ email }).populate('department')
    
    if (!user) {
      return redirect("/addentech-login")
    }
    
    // Check if user has permission to view dashboard
    const permissions = user.permissions ? Object.fromEntries(user.permissions) : {};
    if (user.role !== 'admin' && (!permissions || !permissions.view_dashboard)) {
      return redirect("/admin?error=You do not have permission to view the admin dashboard")
    }
    
    // Get role-specific dashboard data
    const dashboardData = await dashboard.getRoleDashboardData(
      user._id.toString(),
      user.role,
      user.department ? user.department.toString() : undefined
    )
    
    if ('error' in dashboardData) {
      return json({ 
        error: dashboardData.error,
        userRole: user.role,
        userDepartment: user.department
      }, { status: 500 })
    }
    
    // Add user context to dashboard data
    const enrichedData = {
      ...dashboardData,
      userRole: user.role,
      userDepartment: user.department,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email
    }
    
    return json(enrichedData)
  } catch (error) {
    console.error("Error in admin dashboard loader:", error)
    return json({ 
      error: "Failed to load dashboard data",
      userRole: "staff"
    }, { status: 500 })
  }
}