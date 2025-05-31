import { Card, CardHeader, Divider, Progress } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BarChart2, CheckSquare, Clock, FileText, Users, UserCheck } from "lucide-react"
import React, { useEffect, useState } from "react"
import ChartComponent from "~/components/charts/Chart"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
import Registration from "~/modal/registration"
import dashboard from "~/controller/dashboard"

const ManagerDashboard = () => {
  const data = useLoaderData<typeof loader>()
  const { userProfile, departmentStats, taskStats, teamPerformance, taskDistribution, departmentTrends } = data
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

  return (
    <AdminLayout>
      {chartScript}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manager Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.firstName || "Manager"}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Departments"
          value={departmentStats.total}
          description="Under management"
          icon={<Users className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Tasks"
          value={taskStats.active}
          description="Active tasks"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Completed"
          value={taskStats.completed}
          description="This month"
          icon={<UserCheck className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Overdue"
          value={taskStats.overdue}
          description="Needs attention"
          icon={<Clock className="h-4 w-4" />}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {taskDistribution && (
          <ChartComponent
            type="pie"
            data={taskDistribution}
            title="Task Distribution"
            description="Tasks by current status"
            colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
          />
        )}
        
        {departmentTrends && (
          <ChartComponent
            type="bar"
            data={departmentTrends}
            title="Department Performance"
            description="Current month performance by department"
            colors={['#10B981']}
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Department Performance</h4>
            <p className="text-tiny uppercase font-bold">Current Month</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            {departmentStats.departments.map((dept: any) => (
              <div key={dept.name} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{dept.name}</span>
                  <span className="text-sm font-medium">{dept.performance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      dept.performance > 75 ? 'bg-green-600' : 
                      dept.performance > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.performance}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Task Statistics</h4>
            <p className="text-tiny uppercase font-bold">By Status</p>
          </CardHeader>
          <CardBody className="py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-blue-600 font-bold text-3xl mb-1">{taskStats.inProgress}</div>
                  <div className="text-blue-800 text-sm">In Progress</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-green-600 font-bold text-3xl mb-1">{taskStats.completed}</div>
                  <div className="text-green-800 text-sm">Completed</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-yellow-600 font-bold text-3xl mb-1">{taskStats.pending}</div>
                  <div className="text-yellow-800 text-sm">Pending</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-red-600 font-bold text-3xl mb-1">{taskStats.overdue}</div>
                  <div className="text-red-800 text-sm">Overdue</div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Divider className="my-6" />
      
      <Card className="p-4 mb-8">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h4 className="font-bold text-large">Team Performance</h4>
          <p className="text-tiny uppercase font-bold">Top Performers</p>
        </CardHeader>
        <CardBody className="py-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Staff</th>
                  <th className="text-left py-3 px-4">Department</th>
                  <th className="text-left py-3 px-4">Tasks</th>
                  <th className="text-left py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.map((member: any) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{member.name}</td>
                    <td className="py-2 px-4">{member.department}</td>
                    <td className="py-2 px-4">{member.tasks}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <div className="w-full h-2 bg-gray-200 rounded-full mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              member.performance > 75 ? 'bg-green-600' : 
                              member.performance > 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${member.performance}%` }}
                          ></div>
                        </div>
                        <span>{member.performance}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

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
              <a href="/admin/monthly-reports" className="p-4 bg-green-50 rounded-lg flex flex-col items-center justify-center hover:bg-green-100">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Reports</span>
              </a>
              <a href="/admin/users" className="p-4 bg-purple-50 rounded-lg flex flex-col items-center justify-center hover:bg-purple-100">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Team</span>
              </a>
              <a href="/admin/departments" className="p-4 bg-amber-50 rounded-lg flex flex-col items-center justify-center hover:bg-amber-100">
                <BarChart2 className="h-8 w-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium">Analytics</span>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default ManagerDashboard

export const loader: LoaderFunction = async ({ request }) => {
  // Authenticate user and check if they're a manager
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");
  
  if (!email) {
    return redirect("/addentech-login");
  }
  
  // Get user profile and check role
  const userProfile = await Registration.findOne({ email });
  if (!userProfile || userProfile.role !== "manager") {
    return redirect("/addentech-login");
  }
  
  // Get role-specific dashboard data from controller
  const dashboardData = await dashboard.getRoleDashboardData(
    userProfile._id.toString(),
    userProfile.role,
    userProfile.department?.toString()
  )
  
  if ('error' in dashboardData) {
    return json({
      error: dashboardData.error,
      userProfile
    }, { status: 500 })
  }
  
  // Sample data - in a real app, these would be merged with dashboardData
  const mockData = {
    userProfile,
    taskDistribution: {
      labels: ["In Progress", "Completed", "Pending", "Overdue"],
      values: [18, 24, 8, 5]
    },
    departmentTrends: {
      labels: ["Legal Research", "Contract Management", "Corporate Law"],
      values: [85, 72, 63]
    },
    departmentStats: {
      total: 3,
      departments: [
        { name: "Legal Research", performance: 85 },
        { name: "Contract Management", performance: 72 },
        { name: "Corporate Law", performance: 63 }
      ]
    },
    taskStats: {
      active: 37,
      completed: 24,
      pending: 8,
      inProgress: 18,
      overdue: 5
    },
    teamPerformance: [
      { id: 1, name: "Jane Smith", department: "Legal Research", tasks: 15, performance: 92 },
      { id: 2, name: "John Doe", department: "Contract Management", tasks: 12, performance: 88 },
      { id: 3, name: "Alice Johnson", department: "Corporate Law", tasks: 10, performance: 78 },
      { id: 4, name: "Robert Brown", department: "Legal Research", tasks: 8, performance: 65 }
    ]
  };
  
  return json(mockData);
}
