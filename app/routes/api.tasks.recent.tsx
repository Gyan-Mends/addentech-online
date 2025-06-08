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

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '5');

        // Get recent tasks using TaskController
        const result = await TaskController.getTasks({
            page: 1,
            limit,
            sortBy: 'updatedAt',
            sortOrder: 'desc',
            userEmail: userId,
            userRole: currentUser.role,
            userDepartment: currentUser.department
        });

        return json({
            success: true,
            tasks: result.tasks,
            total: result.total
        });
    } catch (error: any) {
        console.error('Error fetching recent tasks:', error);
        return json(
            { 
                success: false, 
                error: `Failed to fetch recent tasks: ${error?.message || error}`,
                tasks: [],
                total: 0
            }, 
            { status: 500 }
        );
    }
} 