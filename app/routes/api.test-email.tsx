import { json, ActionFunction } from "@remix-run/node";
import { getSession } from "~/session";
import emailService from "~/controller/emailService";

export const action: ActionFunction = async ({ request }) => {
  try {
    // Get the user's session
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    // If no email in session, user is not logged in
    if (!email) {
      return json({ success: false, message: "Not authenticated" }, { status: 401 });
    }
    
    // Find the current user to check role permissions
    const Registration = await import("~/modal/registration").then(m => m.default);
    const currentUser = await Registration.findOne({ email });
    
    if (!currentUser || !["admin", "manager"].includes(currentUser.role)) {
      return json({ 
        success: false, 
        message: "Not authorized to test email configuration" 
      }, { status: 403 });
    }
    
    // Parse the request body
    const formData = await request.formData();
    const testEmail = formData.get("testEmail") as string;
    
    if (!testEmail) {
      return json({ 
        success: false, 
        message: "Test email address is required" 
      }, { status: 400 });
    }
    
    // Test email configuration first
    const configValid = await emailService.testEmailConfiguration();
    
    if (!configValid) {
      return json({
        success: false,
        message: "Email configuration is invalid. Please check SMTP settings."
      }, { status: 500 });
    }
    
    // Send test email
    const testMemoData = {
      refNumber: "TEST-MEMO-001",
      subject: "Test Memo - Email Configuration",
      fromName: {
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email
      },
      fromDepartment: {
        name: "System Administration"
      },
      memoDate: new Date().toISOString(),
      memoType: "Test",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      frequency: "One-time",
      remark: "This is a test email to verify that memo notifications are working correctly."
    };
    
    const testRecipient = {
      email: testEmail,
      firstName: "Test",
      lastName: "User"
    };
    
    const emailSent = await emailService.sendMemoNotification(
      testMemoData,
      testRecipient,
      'TO',
      currentUser.email
    );
    
    if (emailSent) {
      return json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`
      });
    } else {
      return json({
        success: false,
        message: "Failed to send test email. Check server logs for details."
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in test email endpoint:", error);
    return json({ 
      success: false, 
      message: "Error testing email configuration" 
    }, { status: 500 });
  }
}; 