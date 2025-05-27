import { Card, CardHeader, Progress, Tab, Tabs } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BarChart2, BookOpen, Folder, Tag, Users } from "lucide-react"
import { useState } from "react"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import dashboard from "~/controller/dashboard"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"

const Dashboard = () => {
  const data = useLoaderData<typeof loader>()

  const { totalUsers, totalCategories, totalBlogs, totalDepartments, totalMessages } = data

  
  return (
    <AdminLayout>
      <div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Departments"
            value={totalDepartments}
            description="+2 from last month"
            icon={<Folder className="h-4 w-4" />}
            trend="up"
          />
          <MetricCard
            title="Total Users"
            value={totalUsers}
            description="+15% from last month"
            icon={<Users className="h-4 w-4" />}
            trend="up"
          />
          <MetricCard
            title="Blog Categories"
            value={totalCategories}
            description="Same as last month"
            icon={<Tag className="h-4 w-4" />}
            trend="neutral"
          />
          <MetricCard
            title="Blogs"
            value={totalBlogs}
            description="+12 from last week"
            icon={<BookOpen className="h-4 w-4" />}
            trend="up"
          />
        </div>

      </div>
    </AdminLayout>
  )
}

export default Dashboard


export const loader: LoaderFunction = async ({ request }) => {
  const dashboardData = await dashboard.getDashboardData()
  
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("email");
  if (!token) {
      return redirect("/login")
  }
  
  if ('error' in dashboardData) {
      return json({ error: dashboardData.error }, { status: 500 })

  }
  
  return dashboardData
}