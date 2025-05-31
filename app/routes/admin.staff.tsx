import { Card, CardHeader, Progress } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { CheckSquare, Clock, FileText, Calendar, ChevronRight, FileCheck, BookOpen } from "lucide-react"
import { useState } from "react"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
import Registration from "~/modal/registration"

const StaffDashboard = () => {
  const data = useLoaderData<typeof loader>()
  const { userProfile, tasks, attendance, recentActivity } = data

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Staff Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userProfile?.firstName || "Staff Member"}</p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-700">Department: {userProfile?.department ? userProfile.department : "Not Assigned"}</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <MetricCard
          title="Tasks Assigned"
          value={tasks.assigned}
          description="Current tasks"
          icon={<CheckSquare className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Tasks Completed"
          value={tasks.completed}
          description="This month"
          icon={<FileCheck className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Work Hours"
          value={attendance.hoursThisWeek}
          description="This week"
          icon={<Clock className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">My Tasks</h4>
            <p className="text-tiny uppercase font-bold">Due Soon</p>
          </CardHeader>
          <CardBody className="overflow-visible py-2">
            {tasks.upcoming.length > 0 ? (
              <div className="space-y-4">
                {tasks.upcoming.map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === "High" ? "bg-red-100 text-red-800" :
                        task.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      <a href={`/admin/tasks/${task.id}`} className="text-xs text-blue-600 flex items-center">
                        View <ChevronRight className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
            )}
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Attendance</h4>
            <p className="text-tiny uppercase font-bold">Last 7 Days</p>
          </CardHeader>
          <CardBody className="py-2">
            <div className="space-y-3">
              {attendance.recentDays.map((day) => (
                <div key={day.date} className="flex justify-between items-center p-2 border-b">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      day.status === "Present" ? "bg-green-500" :
                      day.status === "Late" ? "bg-yellow-500" :
                      day.status === "Absent" ? "bg-red-500" : "bg-gray-500"
                    }`}></div>
                    <span>{day.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm mr-4">{day.hours} hrs</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      day.status === "Present" ? "bg-green-100 text-green-800" :
                      day.status === "Late" ? "bg-yellow-100 text-yellow-800" :
                      day.status === "Absent" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {day.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <a href="/admin/attendance" className="text-sm text-blue-600 flex items-center justify-center">
                View Full Attendance <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 mb-8">
        <Card className="p-4">
          <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
            <h4 className="font-bold text-large">Recent Activity</h4>
          </CardHeader>
          <CardBody className="py-2">
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200"></div>
              <div className="space-y-6 relative">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="ml-10 relative">
                    <div className="absolute -left-10 mt-1.5">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                        {activity.type === "task" ? (
                          <CheckSquare className="h-3 w-3 text-blue-600" />
                        ) : activity.type === "attendance" ? (
                          <Clock className="h-3 w-3 text-green-600" />
                        ) : (
                          <FileText className="h-3 w-3 text-purple-600" />
                        )}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                <span className="text-sm font-medium">My Tasks</span>
              </a>
              <a href="/admin/attendance" className="p-4 bg-green-50 rounded-lg flex flex-col items-center justify-center hover:bg-green-100">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Attendance</span>
              </a>
              <a href="/admin/monthly-reports" className="p-4 bg-purple-50 rounded-lg flex flex-col items-center justify-center hover:bg-purple-100">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Reports</span>
              </a>
              <a href="/admin/blog" className="p-4 bg-amber-50 rounded-lg flex flex-col items-center justify-center hover:bg-amber-100">
                <BookOpen className="h-8 w-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium">Resources</span>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default StaffDashboard

export const loader: LoaderFunction = async ({ request }) => {
  // Authenticate user and check if they're a staff member
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");
  
  if (!email) {
    return redirect("/addentech-login");
  }
  
  // Get user profile and check role
  const userProfile = await Registration.findOne({ email });
  if (!userProfile || userProfile.role !== "staff") {
    return redirect("/addentech-login");
  }
  
  // Sample data - in a real app, these would come from actual queries
  const mockData = {
    userProfile,
    tasks: {
      assigned: 5,
      completed: 12,
      upcoming: [
        {
          id: "task1",
          title: "Review Contract for Client X",
          description: "Review and provide feedback on the drafted contract",
          priority: "High",
          dueDate: "May 31, 2025"
        },
        {
          id: "task2",
          title: "Prepare Case Summary",
          description: "Summarize key points from recent case documents",
          priority: "Medium",
          dueDate: "June 2, 2025"
        },
        {
          id: "task3",
          title: "Update Client Records",
          description: "Update client information in the database",
          priority: "Low",
          dueDate: "June 5, 2025"
        }
      ]
    },
    attendance: {
      hoursThisWeek: 38,
      recentDays: [
        { date: "May 24, 2025", hours: 8, status: "Present" },
        { date: "May 25, 2025", hours: 0, status: "Weekend" },
        { date: "May 26, 2025", hours: 0, status: "Weekend" },
        { date: "May 27, 2025", hours: 8, status: "Present" },
        { date: "May 28, 2025", hours: 7.5, status: "Late" },
        { date: "May 29, 2025", hours: 8, status: "Present" },
        { date: "May 30, 2025", hours: 6.5, status: "Present" }
      ]
    },
    recentActivity: [
      {
        type: "task",
        description: "Completed task: Research for Case #A-123",
        time: "Today at 10:15 AM"
      },
      {
        type: "attendance",
        description: "Checked in for the day",
        time: "Today at 8:45 AM"
      },
      {
        type: "task",
        description: "New task assigned: Contract Review for Client X",
        time: "Yesterday at 4:30 PM"
      },
      {
        type: "report",
        description: "Submitted monthly activity report",
        time: "Yesterday at 2:15 PM"
      }
    ]
  };
  
  return json(mockData);
}
