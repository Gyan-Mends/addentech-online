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
 
  return (
    <AdminLayout>
      <div>
        <h1>Department Head Dashboard</h1>
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
