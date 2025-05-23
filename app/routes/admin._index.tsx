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

        <div className="grid gap-4 md:grid-cols-7 mt-4">
          <Card className="md:col-span-4 border border-black/20 bg-white">
            <CardBody>  
              <div className="h-[300px] flex items-center justify-center">

              </div>
            </CardBody>
          </Card>

          <Card className="md:col-span-3 border border-black/20 bg-white shadow-sm px-10">
            <CardBody className="space-y-4 ">
              <div>

              </div>
              {/* <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">New Users</span>
                </div>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">Blog Posts</span>
                </div>
                <span>63%</span>
              </div>
              <Progress value={63} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">Comments</span>
                </div>
                <span>42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="font-medium">Engagement</span>
                </div>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2 w-[100%]" />
            </div> */}
            </CardBody>
          </Card>
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