import nodemailer from 'nodemailer';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

// Alternative: Simple API-based email configuration
interface SimpleEmailConfig {
    service: 'sendgrid' | 'mailgun' | 'smtp';
    apiKey?: string;
    domain?: string; // For Mailgun
    smtpConfig?: EmailConfig; // For SMTP fallback
}

interface MemoEmailData {
    refNumber: string;
    subject: string;
    fromName: {
        firstName: string;
        lastName: string;
        email: string;
    };
    fromDepartment: {
        name: string;
    };
    memoDate: string;
    dueDate?: string;
    frequency?: string;
    remark?: string;
    memoType: string;
}

interface RecipientData {
    email: string;
    firstName: string;
    lastName: string;
}

class EmailService {
    private transporter!: nodemailer.Transporter;
    private emailConfig: SimpleEmailConfig;

    constructor() {
        // Check which email service to use
        this.emailConfig = {
            service: (process.env.EMAIL_SERVICE as any) || 'smtp',
            apiKey: process.env.EMAIL_API_KEY,
            domain: process.env.EMAIL_DOMAIN,
            smtpConfig: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER || 'your-email@gmail.com',
                    pass: process.env.SMTP_PASS || 'your-app-password'
                }
            }
        };

        // Initialize the appropriate transporter
        this.initializeTransporter();
    }

    private initializeTransporter() {
        switch (this.emailConfig.service) {
            case 'sendgrid':
                // SendGrid configuration
                this.transporter = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: 'apikey',
                        pass: this.emailConfig.apiKey || process.env.SENDGRID_API_KEY
                    }
                });
                break;
            
            case 'mailgun':
                // Mailgun configuration  
                this.transporter = nodemailer.createTransport({
                    service: 'Mailgun',
                    auth: {
                        user: this.emailConfig.apiKey || process.env.MAILGUN_API_KEY,
                        pass: this.emailConfig.domain || process.env.MAILGUN_DOMAIN
                    }
                });
                break;
            
            default:
                // Default SMTP configuration
                this.transporter = nodemailer.createTransport(this.emailConfig.smtpConfig!);
                break;
        }
    }

    // Send memo notification to recipient
    async sendMemoNotification(
        memoData: MemoEmailData,
        recipient: RecipientData,
        recipientType: 'TO' | 'CC',
        senderEmail?: string // Optional: logged-in user's email
    ): Promise<boolean> {
        try {
            const subject = `New Memo: ${memoData.subject} - ${memoData.refNumber}`;
            const htmlContent = this.generateMemoEmailHTML(memoData, recipient, recipientType);
            const textContent = this.generateMemoEmailText(memoData, recipient, recipientType);

            // Use sender's email if provided, otherwise use system email
            const fromEmail = senderEmail || process.env.SMTP_USER;
            const fromName = senderEmail ? 
                `${memoData.fromName.firstName} ${memoData.fromName.lastName}` : 
                'Memo System';

            const mailOptions = {
                from: `"${fromName}" <${process.env.SMTP_USER}>`, // Still use system SMTP for sending
                replyTo: senderEmail || process.env.SMTP_USER, // Reply goes to actual sender
                to: recipient.email,
                subject: subject,
                text: textContent,
                html: htmlContent,
                headers: {
                    'X-Sender': senderEmail || process.env.SMTP_USER || '',
                    'X-Original-Sender': memoData.fromName.email
                }
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`Memo email sent successfully to ${recipient.email}:`, result.messageId);
            return true;
        } catch (error) {
            console.error(`Error sending memo email to ${recipient.email}:`, error);
            return false;
        }
    }

    // Send memo notifications to multiple recipients
    async sendMemoNotifications(
        memoData: MemoEmailData,
        toRecipient: RecipientData,
        ccRecipient?: RecipientData,
        senderEmail?: string // Optional: logged-in user's email
    ): Promise<{ toSent: boolean; ccSent: boolean }> {
        const results = {
            toSent: false,
            ccSent: false
        };

        // Send to primary recipient
        results.toSent = await this.sendMemoNotification(memoData, toRecipient, 'TO', senderEmail);

        // Send to CC recipient if provided
        if (ccRecipient) {
            results.ccSent = await this.sendMemoNotification(memoData, ccRecipient, 'CC', senderEmail);
        } else {
            results.ccSent = true; // No CC recipient, so consider it "sent"
        }

        return results;
    }

    // Generate HTML email content
    private generateMemoEmailHTML(
        memoData: MemoEmailData,
        recipient: RecipientData,
        recipientType: 'TO' | 'CC'
    ): string {
        const recipientLabel = recipientType === 'TO' ? 'addressed to you' : 'copied to you';
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Memo Notification</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                    .memo-details { background-color: #ffffff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                    .detail-row { margin-bottom: 10px; }
                    .label { font-weight: bold; color: #495057; }
                    .value { color: #212529; }
                    .footer { background-color: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px; color: #6c757d; }
                    .priority-high { color: #dc3545; }
                    .priority-medium { color: #ffc107; }
                    .priority-low { color: #28a745; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0; color: #007bff;">New Memo Notification</h2>
                        <p style="margin: 10px 0 0 0;">You have received a new memo ${recipientLabel}.</p>
                    </div>
                    
                    <div class="memo-details">
                        <h3 style="margin-top: 0; color: #495057;">Memo Details</h3>
                        
                        <div class="detail-row">
                            <span class="label">Reference Number:</span>
                            <span class="value">${memoData.refNumber}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Subject:</span>
                            <span class="value">${memoData.subject}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">From:</span>
                            <span class="value">${memoData.fromName.firstName} ${memoData.fromName.lastName} (${memoData.fromDepartment.name})</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Memo Date:</span>
                            <span class="value">${new Date(memoData.memoDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="label">Type:</span>
                            <span class="value">${memoData.memoType}</span>
                        </div>
                        
                        ${memoData.dueDate ? `
                        <div class="detail-row">
                            <span class="label">Due Date:</span>
                            <span class="value">${new Date(memoData.dueDate).toLocaleDateString()}</span>
                        </div>
                        ` : ''}
                        
                        ${memoData.frequency ? `
                        <div class="detail-row">
                            <span class="label">Follow-up Frequency:</span>
                            <span class="value">${memoData.frequency}</span>
                        </div>
                        ` : ''}
                        
                        ${memoData.remark ? `
                        <div class="detail-row">
                            <span class="label">Remarks:</span>
                            <div class="value" style="margin-top: 5px; padding: 10px; background-color: #f8f9fa; border-radius: 4px;">
                                ${memoData.remark}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 0;">Please log in to your dashboard to view the complete memo and any attachments.</p>
                        <p style="margin: 10px 0 0 0;"><small>This is an automated notification from the Memo Management System.</small></p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    // Generate plain text email content
    private generateMemoEmailText(
        memoData: MemoEmailData,
        recipient: RecipientData,
        recipientType: 'TO' | 'CC'
    ): string {
        const recipientLabel = recipientType === 'TO' ? 'addressed to you' : 'copied to you';
        
        let textContent = `NEW MEMO NOTIFICATION\n\n`;
        textContent += `Dear ${recipient.firstName},\n\n`;
        textContent += `You have received a new memo ${recipientLabel}.\n\n`;
        textContent += `MEMO DETAILS:\n`;
        textContent += `Reference Number: ${memoData.refNumber}\n`;
        textContent += `Subject: ${memoData.subject}\n`;
        textContent += `From: ${memoData.fromName.firstName} ${memoData.fromName.lastName} (${memoData.fromDepartment.name})\n`;
        textContent += `Memo Date: ${new Date(memoData.memoDate).toLocaleDateString()}\n`;
        textContent += `Type: ${memoData.memoType}\n`;
        
        if (memoData.dueDate) {
            textContent += `Due Date: ${new Date(memoData.dueDate).toLocaleDateString()}\n`;
        }
        
        if (memoData.frequency) {
            textContent += `Follow-up Frequency: ${memoData.frequency}\n`;
        }
        
        if (memoData.remark) {
            textContent += `\nRemarks:\n${memoData.remark}\n`;
        }
        
        textContent += `\nPlease log in to your dashboard to view the complete memo and any attachments.\n\n`;
        textContent += `This is an automated notification from the Memo Management System.`;
        
        return textContent;
    }

    // Test email configuration
    async testEmailConfiguration(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('Email configuration is valid');
            return true;
        } catch (error) {
            console.error('Email configuration error:', error);
            return false;
        }
    }
}

export default new EmailService(); 