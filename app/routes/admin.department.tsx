import { Card, CardHeader } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BarChart2, BookOpen, Folder, Tag, Users, Calendar, CheckSquare, FileText } from "lucide-react"
import { useState } from "react"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import dashboard from "~/controller/dashboard"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
import Registration from "~/modal/registration"

const DepartmentHeadDashboard = () => {
  const data = useLoaderData<typeof loader>()
  const { departmentName, totalStaff, totalTasks, totalAttendance, taskCompletion, userProfile } = data

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Department Head Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.firstName || "Department Head"}</p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-700">Department: {departmentName}</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <MetricCard
          title="Department Staff"
          value={totalStaff}
          description="Total active staff members"
          icon={<Users className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Active Tasks"
          value={totalTasks}
          description="Tasks in progress"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Today's Attendance"
          value={totalAttendance}
          description="Staff checked in today"
          icon={<Calendar className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Task Completion Rate</h4>
            <p className="text-tiny uppercase font-bold">Last 30 days</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            <div className="flex items-center gap-4">
              <div className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-sm font-medium">{taskCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${taskCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Department Reports</h4>
            <p className="text-tiny uppercase font-bold">Monthly Performance</p>
          </CardHeader>
          <CardBody className="py-2">
            <ul className="space-y-2">
              <li className="flex justify-between p-2 border-b">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Monthly Report (May)
                </span>
                <span className="text-green-600 font-medium">Submitted</span>
              </li>
              <li className="flex justify-between p-2 border-b">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Performance Review
                </span>
                <span className="text-amber-600 font-medium">Pending</span>
              </li>
              <li className="flex justify-between p-2">
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Budget Request
                </span>
                <span className="text-green-600 font-medium">Approved</span>
              </li>
            </ul>
          </CardBody>
        </Card>
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
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
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
  // Authenticate user and check if they're a department head
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");
  
  if (!email) {
    return redirect("/addentech-login");
  }
  
  // Get user profile and check role
  const userProfile = await Registration.findOne({ email });
  if (!userProfile || userProfile.role !== "department_head") {
    return redirect("/addentech-login");
  }
  
  // Get department name (would normally come from the department associated with the user)
  const departmentName = "Legal Research"; // Placeholder - should come from user's department
  
  // Sample data - in a real app, these would come from actual queries
  const mockData = {
    departmentName,
    totalStaff: 12,
    totalTasks: 24,
    totalAttendance: 10,
    taskCompletion: 75,
    userProfile
  };
  
  return json(mockData);
}
