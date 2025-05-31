import { Card, CardHeader, Divider, Tab, Tabs } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BarChart2, BookOpen, Folder, MessageSquare, Tag, Users } from "lucide-react"
import React, { useEffect, useState } from "react"
import { CardBody } from "~/components/acternity/3d"
import ChartComponent from "~/components/charts/Chart"
import PerformanceTable from "~/components/tables/PerformanceTable"
import MetricCard from "~/components/ui/customCard"
import dashboard from "~/controller/dashboard"
import AdminLayout from "~/layout/adminLayout"
import Registration from "~/modal/registration"
import { getSession } from "~/session"

const Dashboard = () => {
  const data = useLoaderData<typeof loader>()
  const [chartScript, setChartScript] = useState<React.ReactNode>(null)

  const { 
    totalUsers, 
    totalCategories, 
    totalBlogs, 
    totalDepartments, 
    totalMessages,
    usersByRole,
    tasksByStatus,
    attendanceByMonth,
    departmentPerformance
  } = data

  // Make sure Chart.js script is loaded client-side only
  useEffect(() => {
    setChartScript(
      <script
        dangerouslySetInnerHTML={{
          __html: `
            import('chart.js').then(module => {
              window.Chart = module.Chart;
              window.dispatchEvent(new Event('chartjsloaded'));
            });
          `
        }}
      />
    )
  }, [])
  
  return (
    <AdminLayout>
      {chartScript}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of all organizational metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Total Departments"
          value={totalDepartments}
          description="Management units"
          icon={<Folder className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Total Users"
          value={totalUsers}
          description="Active accounts"
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Blog Categories"
          value={totalCategories}
          description="Content organization"
          icon={<Tag className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Messages"
          value={totalMessages}
          description="User inquiries"
          icon={<MessageSquare className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {usersByRole && (
          <ChartComponent
            type="pie"
            data={usersByRole}
            title="Users by Role"
            description="Distribution of users across different roles"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']} 
          />
        )}
        {tasksByStatus && (
          <ChartComponent
            type="bar"
            data={tasksByStatus}
            title="Tasks by Status"
            description="Current task status distribution"
            colors={['#10B981', '#F59E0B', '#EF4444']} 
          />
        )}
      </div>

      <div className="mb-6">
        {attendanceByMonth && (
          <ChartComponent
            type="line"
            data={attendanceByMonth}
            title="Attendance Trends"
            description="Monthly attendance patterns over time"
            height={300}
            className="w-full"
            colors={['#3B82F6']} 
          />
        )}
      </div>

      <Divider className="my-6" />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Department Performance</h2>
        {departmentPerformance && (
          <PerformanceTable 
            title="Task Completion by Department"
            data={departmentPerformance}
            description="Overview of task completion rates across departments"
          />
        )}
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
    const user = await Registration.findOne({ email })
    
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
      return json({ error: dashboardData.error }, { status: 500 })
    }
    
    return json(dashboardData)
  } catch (error) {
    console.error("Error in admin dashboard loader:", error)
    return json({ error: "Failed to load dashboard data" }, { status: 500 })
  }
}