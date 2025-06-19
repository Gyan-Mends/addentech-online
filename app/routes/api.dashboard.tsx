import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import dashboard from "~/controller/dashboard";
import { getSession } from "~/session";
import Registration from "~/modal/registration";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const type = url.searchParams.get("type") || "base"; // "base" or "role"
        
        const session = await getSession(request.headers.get("Cookie"));
        const token = session.get("email");
        
        if (!token) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user information
        const user = await Registration.findOne({ email: token });
        if (!user) {
            return json({ error: "User not found" }, { status: 404 });
        }

        let dashboardData;

        if (type === "role") {
            // Get role-specific dashboard data
            dashboardData = await dashboard.getRoleDashboardData(
                user._id.toString(),
                user.role,
                user.department?.toString()
            );
        } else {
            // Get base dashboard data
            dashboardData = await dashboard.getDashboardData();
        }

        return json({ 
            success: true,
            data: {
                ...dashboardData,
                user: {
                    id: user._id,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    department: user.department
                }
            }
        });
    } catch (error: any) {
        console.error("Dashboard API error:", error);
        return json({
            success: false,
            message: error.message || "Failed to fetch dashboard data"
        }, { status: 500 });
    }
}; 