import { Leave } from '../controller/leave';
import registration from '../modal/registration';
import { EmailService } from './emailService';

export class LeaveReminderService {
    
    // Check for leaves ending tomorrow and send reminders
    static async checkAndSendReminders(): Promise<void> {
        try {
            console.log('Starting leave reminder check...');
            
            // Get tomorrow's date
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            
            console.log('Checking for leaves ending on:', tomorrow.toISOString().split('T')[0]);
            
            // Find approved leaves ending tomorrow
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
                            
                            console.log(`Reminder sent successfully for leave ID: ${leave._id}`);
                        } else {
                            console.log(`Failed to send reminder for leave ID: ${leave._id}`);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing leave ID ${leave._id}:`, error);
                }
            }
            
            console.log('Leave reminder check completed');
            
        } catch (error) {
            console.error('Error in leave reminder service:', error);
        }
    }
    
    // Manual trigger for testing
    static async sendTestReminder(leaveId: string): Promise<boolean> {
        try {
            const leave = await Leave.findById(leaveId).populate('employee', 'firstName lastName email');
            
            if (!leave) {
                console.log('Leave not found');
                return false;
            }
            
            const employee = leave.employee as any;
            if (!employee || !employee.email) {
                console.log('Employee email not found');
                return false;
            }
            
            const reminderData = {
                employeeName: `${employee.firstName} ${employee.lastName}`,
                employeeEmail: employee.email,
                leaveType: leave.leaveType,
                endDate: leave.endDate.toISOString().split('T')[0],
                totalDays: leave.totalDays
            };
            
            const emailSent = await EmailService.sendLeaveReminder(reminderData);
            
            if (emailSent) {
                await Leave.findByIdAndUpdate(leave._id, {
                    reminderSent: true,
                    reminderSentAt: new Date()
                });
            }
            
            return emailSent;
            
        } catch (error) {
            console.error('Error sending test reminder:', error);
            return false;
        }
    }
} 