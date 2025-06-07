import { Card, CardHeader, Divider, Progress } from "@nextui-org/react"
import { json, LoaderFunction, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { CheckSquare, Clock, FileText, Calendar, ChevronRight, FileCheck, BookOpen } from "lucide-react"
import React, { useState, useEffect } from "react"
import ChartComponent from "~/components/charts/Chart"
import { CardBody } from "~/components/acternity/3d"
import MetricCard from "~/components/ui/customCard"
import AdminLayout from "~/layout/adminLayout"
import { getSession } from "~/session"
import Registration from "~/modal/registration"
import dashboard from "~/controller/dashboard"

const StaffDashboard = () => {
  return (
    <AdminLayout>
      <div>
        <h1>Staff Dashboard</h1>
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
    
  // Sample data - in a real app, these would be merged with the dashboardData from controller
  const mockData = {
    userProfile,
    performanceData: {
      labels: ["Apr 24", "May 1", "May 8", "May 15", "May 22", "May 29"],
      values: [65, 72, 80, 75, 85, 90]
    },
    taskBreakdown: {
      labels: ["High", "Medium", "Low"],
      values: [2, 2, 1]
    },
    attendanceChart: {
      labels: ["May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30"],
      values: [8, 0, 0, 8, 7.5, 8, 6.5]
    },
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
