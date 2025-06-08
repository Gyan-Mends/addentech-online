import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/session";
import { TaskController } from "~/controller/task";
import Registration from "~/modal/registration";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get current user information for role-based access
        const currentUser = await Registration.findOne({ email: userId });
        if (!currentUser) {
            return json({ error: "User not found" }, { status: 404 });
        }

        // Get task statistics using TaskController
        const stats = await TaskController.calculateTaskStats(
            currentUser.role,
            userId,
            currentUser.department
        );

        return json({
            success: true,
            stats
        });
    } catch (error: any) {
        console.error('Error fetching task stats:', error);
        return json(
            { 
                success: false, 
                error: `Failed to fetch task statistics: ${error?.message || error}`,
                stats: {
                    totalTasks: 0,
                    activeTasks: 0,
                    completedTasks: 0,
                    overdueTasks: 0,
                    highPriorityTasks: 0,
                    tasksThisWeek: 0
                }
            }, 
            { status: 500 }
        );
    }
} 