import { ActionFunction, json } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import dashboard from "~/controller/dashboard";

export const action: ActionFunction = async ({ request }) => {
  try {
    // Check authentication
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    if (!email) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
    
    const currentUser = await Registration.findOne({ email });
    if (!currentUser) {
      return json({ error: "User not found" }, { status: 404 });
    }
    
    const formData = await request.formData();
    const action = formData.get("action");
    
    if (action === "getDashboardData") {
      // Get base dashboard data
      const dashboardData = await dashboard.getDashboardData();
      
      return json({
        success: true,
        data: dashboardData,
        currentUser: {
          id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          role: currentUser.role,
          department: currentUser.department,
          workMode: currentUser.workMode
        }
      });
    }
    
    if (action === "getRoleDashboardData") {
      // Get role-specific dashboard data
      const dashboardData = await dashboard.getRoleDashboardData(
        currentUser._id.toString(),
        currentUser.role,
        currentUser.department?.toString()
      );
      
      return json({
        success: true,
        data: dashboardData,
        currentUser: {
          id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          role: currentUser.role,
          department: currentUser.department,
          workMode: currentUser.workMode
        }
      });
    }
    
    return json({ error: "Invalid action" }, { status: 400 });
    
  } catch (error) {
    console.error("Dashboard API error:", error);
    return json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}; 