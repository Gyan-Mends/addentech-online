import nodemailer from 'nodemailer';

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

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter(EMAIL_CONFIG);
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
            const transporter = createTransporter();
            
            const mailOptions = {
                from: `"Addentech Leave System" <${EMAIL_CONFIG.auth.user}>`,
                to: data.employeeEmail,
                subject: 'Leave Reminder - Your leave is ending soon',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #333; text-align: center;">Leave Reminder</h2>
                            
                            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p>Dear ${data.employeeName},</p>
                                
                                <p>This is a friendly reminder that your <strong>${data.leaveType}</strong> leave is ending soon.</p>
                                
                                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
                                    <h3 style="color: #1976d2; margin: 0 0 10px 0;">Leave Details:</h3>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li><strong>Leave Type:</strong> ${data.leaveType}</li>
                                        <li><strong>End Date:</strong> ${data.endDate}</li>
                                        <li><strong>Total Days:</strong> ${data.totalDays} days</li>
                                    </ul>
                                </div>
                                
                                <p>Please ensure you're prepared to return to work on the next working day after your leave ends.</p>
                                
                                <p>If you need to extend your leave or have any questions, please contact your manager or HR department as soon as possible.</p>
                                
                                <p>Best regards,<br>
                                <strong>Addentech HR Team</strong></p>
                            </div>
                            
                            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                                <p>This is an automated message from the Addentech Leave Management System.</p>
                            </div>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('Leave reminder email sent successfully to:', data.employeeEmail);
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
            const transporter = createTransporter();
            
            const isApproved = status === 'approved';
            const statusColor = isApproved ? '#4caf50' : '#f44336';
            const statusText = isApproved ? 'Approved' : 'Rejected';
            
            const mailOptions = {
                from: `"Addentech Leave System" <${EMAIL_CONFIG.auth.user}>`,
                to: employeeEmail,
                subject: `Leave ${statusText} - ${leaveType} Leave`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #333; text-align: center;">Leave ${statusText}</h2>
                            
                            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p>Dear ${employeeName},</p>
                                
                                <div style="background-color: ${statusColor}20; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid ${statusColor};">
                                    <h3 style="color: ${statusColor}; margin: 0 0 10px 0;">Your ${leaveType} leave has been ${statusText.toLowerCase()}</h3>
                                </div>
                                
                                ${comments ? `
                                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                                        <h4 style="margin: 0 0 10px 0;">Comments:</h4>
                                        <p style="margin: 0;">${comments}</p>
                                    </div>
                                ` : ''}
                                
                                <p>You can view your leave status and details in the leave management system.</p>
                                
                                <p>Best regards,<br>
                                <strong>Addentech HR Team</strong></p>
                            </div>
                            
                            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                                <p>This is an automated message from the Addentech Leave Management System.</p>
                            </div>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('Leave approval notification sent successfully to:', employeeEmail);
            return true;
            
        } catch (error) {
            console.error('Error sending leave approval notification:', error);
            return false;
        }
    }
} 