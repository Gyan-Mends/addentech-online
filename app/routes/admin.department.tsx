import { Card, CardHeader, Divider } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BarChart2, CheckSquare, Clock, FileText, User, Users, HomeIcon, Building2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import ChartComponent from "~/components/charts/Chart"
import { CardBody } from "~/components/acternity/3d"
import PerformanceTable from "~/components/tables/PerformanceTable"
import MetricCard from "~/components/ui/customCard"
import dashboard from "~/controller/dashboard"
import AdminLayout from "~/layout/adminLayout"
import Registration from "~/modal/registration"
import Department from "~/modal/department"
import { getSession } from "~/session"

const DepartmentHeadDashboard = () => {
  const data = useLoaderData<typeof loader>()
  const { 
    departmentName,
    departmentStaff,
    departmentTasks,
    staffPerformance,
    departmentAttendance,
    workModeBreakdown,
    workModeAttendance
  } = data
  
  const [chartScript, setChartScript] = useState<React.ReactNode>(null)

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

  // Calculate task metrics
  const totalTasks = departmentTasks?.labels.reduce((acc: number, _item: string, i: number) => {
    return acc + (departmentTasks.values[i] || 0);
  }, 0) || 0;
  
  const completedTasksIdx = departmentTasks?.labels.findIndex(
    (label: string) => label.toLowerCase() === "completed"
  );
  
  const completedTasks = completedTasksIdx >= 0 ? departmentTasks?.values[completedTasksIdx] : 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <AdminLayout>
      {chartScript}
      <div className="mb-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Department Head Dashboard</h1>
          <p className="text-gray-600">Department: {departmentName || "Not Assigned"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {workModeBreakdown && (
          <ChartComponent
            type="pie"
            data={workModeBreakdown}
            title="Work Mode Distribution"
            description="Staff distribution by work mode"
            colors={['#3B82F6', '#10B981']}
          />
        )}

        {departmentTasks && (
          <ChartComponent
            type="doughnut"
            data={departmentTasks}
            title="Task Status"
            description="Department task completion status"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Staff Members"
          value={departmentStaff || 0}
          description="In your department"
          icon={<Users className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Tasks completed"
          icon={<CheckSquare className="h-4 w-4" />}
          trend={completionRate >= 75 ? "up" : completionRate >= 50 ? "neutral" : "down"}
        />
        <MetricCard
          title="Total Tasks"
          value={totalTasks}
          description="Assigned to department"
          icon={<FileText className="h-4 w-4" />}
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Department Staff Distribution</h3>
          <p className="text-lg">Total staff: <span className="font-semibold">12</span></p>
          <p className="text-gray-600 mt-2">Last updated: May 30, 2023</p>
        </div>
      </div>

      <div className="grid grid-cols-1 mb-8">
        {staffPerformance && staffPerformance.length > 0 ? (
          <PerformanceTable 
            title="Task Completion by Staff"
            data={staffPerformance}
            description="Overview of individual staff performance metrics"
          />
        ) : (
          <Card className="shadow-sm">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <h4 className="font-bold text-large">Staff Performance</h4>
              <p className="text-tiny text-default-500">Task completion rates</p>
            </CardHeader>
            <CardBody>
              <p className="text-gray-500 text-center py-8">No staff performance data available</p>
            </CardBody>
          </Card>
        )}
      </div>

      {workModeAttendance && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Work Mode Productivity Analysis</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Attendance by Work Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <div className="p-3 mr-4 bg-blue-100 rounded-full">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">In-house Staff</p>
                      <p className="text-xl font-bold">
                        {workModeAttendance.labels.indexOf('in-house') >= 0 ? 
                          workModeAttendance.values[workModeAttendance.labels.indexOf('in-house')] : 0}
                      </p>
                      <p className="text-xs text-blue-700">Check-ins this month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <div className="p-3 mr-4 bg-green-100 rounded-full">
                      <HomeIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 font-semibold">Remote Staff</p>
                      <p className="text-xl font-bold">
                        {workModeAttendance.labels.indexOf('remote') >= 0 ? 
                          workModeAttendance.values[workModeAttendance.labels.indexOf('remote')] : 0}
                      </p>
                      <p className="text-xs text-green-700">Check-ins this month</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Avg. Hours by Work Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">In-house Avg. Hours</p>
                    <p className="text-2xl font-bold">
                      {workModeAttendance.labels.indexOf('in-house') >= 0 ? 
                        workModeAttendance.avgHours[workModeAttendance.labels.indexOf('in-house')] : 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (workModeAttendance.labels.indexOf('in-house') >= 0 ? workModeAttendance.avgHours[workModeAttendance.labels.indexOf('in-house')] : 0) / 8 * 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">Remote Avg. Hours</p>
                    <p className="text-2xl font-bold">
                      {workModeAttendance.labels.indexOf('remote') >= 0 ? 
                        workModeAttendance.avgHours[workModeAttendance.labels.indexOf('remote')] : 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, (workModeAttendance.labels.indexOf('remote') >= 0 ? workModeAttendance.avgHours[workModeAttendance.labels.indexOf('remote')] : 0) / 8 * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Department Reports</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Generated By</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200">Monthly Case Summary</td>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200">John Smith</td>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200">05/28/2023</td>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900 mr-4">View</a>
                    <a href="#" className="text-blue-600 hover:text-blue-900">Download</a>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200">Client Engagement Report</td>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200">Sarah Johnson</td>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200">05/20/2023</td>
                  <td className="py-2 px-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 font-medium">
                    <a href="#" className="text-blue-600 hover:text-blue-900 mr-4">View</a>
                    <a href="#" className="text-blue-600 hover:text-blue-900">Download</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Quick Actions</h4>
          </CardHeader>
          <CardBody className="py-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/tasks" className="p-4 bg-blue-50 rounded-lg flex flex-col items-center justify-center hover:bg-blue-100">
                <CheckSquare className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Manage Tasks</span>
              </a>
              <a href="/admin/attendance" className="p-4 bg-green-50 rounded-lg flex flex-col items-center justify-center hover:bg-green-100">
                <Clock className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Attendance</span>
              </a>
              <a href="/admin/monthly-reports" className="p-4 bg-purple-50 rounded-lg flex flex-col items-center justify-center hover:bg-purple-100">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Reports</span>
              </a>
              <a href="/admin/users" className="p-4 bg-amber-50 rounded-lg flex flex-col items-center justify-center hover:bg-amber-100">
                <Users className="h-8 w-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium">Staff</span>
              </a>
            </div>
          </CardBody>
        </Card>
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
        departmentStaff: 0
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
    
    if ('error' in dashboardData) {
      return json({ 
        error: dashboardData.error, 
        departmentName,
      }, { status: 500 })
    }
    
    return json({
      ...dashboardData,
      departmentName,
    })
    
  } catch (error) {
    console.error("Error loading department head dashboard:", error)
    return json({ error: "Failed to load department head dashboard" }, { status: 500 })
  }
}
