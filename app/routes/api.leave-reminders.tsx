import { json, type ActionFunctionArgs } from "@remix-run/node";
import { Leave } from "../controller/leave";
import Registration from "../modal/registration";
import { EmailService } from "../services/emailService";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const method = request.method;
        
        if (method === 'POST') {
            console.log('Starting leave reminder check...');
            
            // Get tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            
            console.log('Checking for leaves ending on:', tomorrow.toISOString().split('T')[0]);
            
            // Find approved leaves ending tomorrow that haven't had reminder sent
            const Leave = (await import('../controller/leave')).Leave;
            const leavesEndingTomorrow = await Leave.find({
                endDate: {
                    $gte: tomorrow,
                    $lt: dayAfterTomorrow
                },
                status: 'approved',
                isActive: true,
                reminderSent: { $ne: true } // Don't send reminder if already sent
            }).populate('employee', 'firstName lastName email');
            
            console.log(`Found ${leavesEndingTomorrow.length} leaves ending tomorrow`);
            
            let remindersSent = 0;
            let errors = 0;
            
            // Send reminders for each leave
            for (const leave of leavesEndingTomorrow) {
                try {
                    const employee = leave.employee as any;
                    if (employee && employee.email) {
                        
                        const reminderData = {
                            employeeName: `${employee.firstName} ${employee.lastName}`,
                            employeeEmail: employee.email,
                            leaveType: leave.leaveType,
                            endDate: leave.endDate.toISOString().split('T')[0],
                            totalDays: leave.totalDays
                        };
                        
                        const emailSent = await EmailService.sendLeaveReminder(reminderData);
                        
                        if (emailSent) {
                            // Mark reminder as sent
                            await Leave.findByIdAndUpdate(leave._id, {
                                reminderSent: true,
                                reminderSentAt: new Date()
                            });
                            
                            remindersSent++;
                            console.log(`Reminder sent successfully for leave ID: ${leave._id}`);
                        } else {
                            errors++;
                            console.log(`Failed to send reminder for leave ID: ${leave._id}`);
                        }
                    }
                } catch (error) {
                    errors++;
                    console.error(`Error processing leave ID ${leave._id}:`, error);
                }
            }
            
            return json({ 
                success: true, 
                message: `Leave reminder check completed. ${remindersSent} reminders sent, ${errors} errors.`,
                remindersSent,
                errors,
                totalChecked: leavesEndingTomorrow.length
            });
        }
        
        return json({ success: false, error: "Method not allowed" }, { status: 405 });
        
    } catch (error) {
        console.error('Error in leave reminder API:', error);
        return json({ 
            success: false, 
            error: "Failed to process leave reminders", 
            details: error.message 
        }, { status: 500 });
    }
}

// Handle GET requests for testing
export async function loader() {
    return json({ 
        message: "Leave reminder API is working. Use POST to trigger reminder checks.",
        endpoint: "/api/leave-reminders",
        method: "POST"
    });
} 