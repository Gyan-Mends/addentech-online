import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { LeaveController } from "~/controller/leave";
import { getSession } from "~/session";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("userId");
        
        if (!userId) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const filters = {
            status: url.searchParams.get('status') || 'all',
            leaveType: url.searchParams.get('leaveType') || 'all',
            department: url.searchParams.get('department') || 'all',
            employee: url.searchParams.get('employee') || '',
            startDate: url.searchParams.get('startDate') || '',
            endDate: url.searchParams.get('endDate') || '',
            page: parseInt(url.searchParams.get('page') || '1'),
            limit: parseInt(url.searchParams.get('limit') || '10')
        };

        const { leaves, total, stats } = await LeaveController.getLeaves(filters);
        
        return json({ 
            success: true, 
            data: { leaves, total, stats } 
        });
    } catch (error) {
        console.error('Error in leaves loader:', error);
        return json(
            { success: false, error: "Failed to fetch leaves" },
            { status: 500 }
        );
    }
}

export async function action({ request }: ActionFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("userId");
        
        if (!userId) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const method = formData.get('_method') as string;

        switch (method) {
            case 'POST': {
                // Create new leave application
                const leaveData = {
                    employee: formData.get('employee') as string || userId,
                    leaveType: formData.get('leaveType') as string,
                    startDate: new Date(formData.get('startDate') as string),
                    endDate: new Date(formData.get('endDate') as string),
                    reason: formData.get('reason') as string,
                    priority: formData.get('priority') as string || 'normal',
                    department: formData.get('department') as string,
                    approvalWorkflow: [{
                        approver: formData.get('approver') as string,
                        approverRole: 'manager',
                        status: 'pending' as const,
                        order: 1
                    }]
                };

                const newLeave = await LeaveController.createLeave(leaveData);
                
                return json({ 
                    success: true, 
                    message: "Leave application submitted successfully",
                    data: newLeave 
                });
            }

            case 'PUT': {
                // Update leave status (approve/reject)
                const leaveId = formData.get('leaveId') as string;
                const status = formData.get('status') as 'approved' | 'rejected';
                const comments = formData.get('comments') as string;

                const updatedLeave = await LeaveController.updateLeaveStatus(
                    leaveId, 
                    status, 
                    userId, 
                    comments
                );

                return json({ 
                    success: true, 
                    message: `Leave application ${status} successfully`,
                    data: updatedLeave 
                });
            }

            case 'DELETE': {
                // Cancel/Delete leave application
                const leaveId = formData.get('leaveId') as string;
                
                await LeaveController.deleteLeave(leaveId, userId);
                
                return json({ 
                    success: true, 
                    message: "Leave application cancelled successfully" 
                });
            }

            default:
                return json(
                    { success: false, error: "Invalid method" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in leaves action:', error);
        return json(
            { success: false, error: "Operation failed" },
            { status: 500 }
        );
    }
}

// Export CSV endpoint
export async function exportCSV({ request }: LoaderFunctionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const userId = session.get("userId");
        
        if (!userId) {
            return json({ error: "Unauthorized" }, { status: 401 });
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
        return json(
            { success: false, error: "Failed to export CSV" },
            { status: 500 }
        );
    }
} 