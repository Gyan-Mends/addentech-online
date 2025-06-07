// Email configuration - you should move these to environment variables
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
    }
};

export interface LeaveReminderData {
    employeeName: string;
    employeeEmail: string;
    leaveType: string;
    endDate: string;
    totalDays: number;
}

export class EmailService {
    
    // Send leave reminder email
    static async sendLeaveReminder(data: LeaveReminderData): Promise<boolean> {
        try {
            // For now, just log to console - you can integrate with your email service
            console.log('=== LEAVE REMINDER EMAIL ===');
            console.log(`To: ${data.employeeEmail}`);
            console.log(`Subject: Leave Reminder - Your leave is ending soon`);
            console.log(`Employee: ${data.employeeName}`);
            console.log(`Leave Type: ${data.leaveType}`);
            console.log(`End Date: ${data.endDate}`);
            console.log(`Total Days: ${data.totalDays}`);
            console.log('===============================');
            
            // TODO: Implement actual email sending with nodemailer
            // const transporter = nodemailer.createTransporter(EMAIL_CONFIG);
            // await transporter.sendMail(mailOptions);
            
            return true;
            
        } catch (error) {
            console.error('Error sending leave reminder email:', error);
            return false;
        }
    }

    // Send leave approval notification
    static async sendLeaveApprovalNotification(
        employeeEmail: string, 
        employeeName: string, 
        leaveType: string, 
        status: 'approved' | 'rejected',
        comments?: string
    ): Promise<boolean> {
        try {
            console.log('=== LEAVE APPROVAL NOTIFICATION ===');
            console.log(`To: ${employeeEmail}`);
            console.log(`Subject: Leave ${status} - ${leaveType} Leave`);
            console.log(`Employee: ${employeeName}`);
            console.log(`Status: ${status}`);
            console.log(`Comments: ${comments || 'No comments'}`);
            console.log('===================================');
            
            // TODO: Implement actual email sending
            return true;
            
        } catch (error) {
            console.error('Error sending leave approval notification:', error);
            return false;
        }
    }
} 