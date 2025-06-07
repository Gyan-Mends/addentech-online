import { type LoaderFunctionArgs } from "@remix-run/node";
import { LeaveController } from "~/controller/leave";
import { getSession } from "~/session";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("email");
        
        if (!userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const url = new URL(request.url);
        const filters = {
            status: url.searchParams.get('status') || 'all',
            leaveType: url.searchParams.get('leaveType') || 'all',
            department: url.searchParams.get('department') || 'all'
        };

        const csvContent = await LeaveController.exportLeavesToCSV(filters);

        return new Response(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="leave-applications.csv"'
            }
        });
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return new Response("Failed to export CSV", { status: 500 });
    }
} 