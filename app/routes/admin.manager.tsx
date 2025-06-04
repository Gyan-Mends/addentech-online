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
