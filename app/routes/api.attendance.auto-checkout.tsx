import { json, ActionFunction } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import attendanceController from "~/controller/attendance";

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
    const currentUser = await Registration.findOne({ email });
    
    if (!currentUser || !["admin", "manager"].includes(currentUser.role)) {
      return json({ 
        success: false, 
        message: "Not authorized to trigger auto-checkout" 
      }, { status: 403 });
    }
    
    // Trigger the auto-checkout process
    const result = await attendanceController.performAutoCheckout();
    
    return json(result);
  } catch (error: any) {
    return json({
      success: false,
      message: `Error triggering auto-checkout: ${error.message}`
    }, { status: 500 });
  }
}; 