import { json, ActionFunction } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";

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
        message: "Not authorized to update work mode settings" 
      }, { status: 403 });
    }
    
    // Parse the request body
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const workMode = formData.get("workMode") as string;
    
    if (!userId || !workMode || !["in-house", "remote"].includes(workMode)) {
      return json({ 
        success: false, 
        message: "Invalid request. userId and workMode (in-house or remote) are required." 
      }, { status: 400 });
    }
    
    // Update the user's work mode
    const user = await Registration.findByIdAndUpdate(
      userId, 
      { workMode }, 
      { new: true }
    );
    
    if (!user) {
      return json({ success: false, message: "User not found" }, { status: 404 });
    }
    
    return json({
      success: true,
      message: `User work mode updated to ${workMode}`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        workMode: user.workMode
      }
    });
  } catch (error) {
    console.error("Error updating user work mode:", error);
    return json({ 
      success: false, 
      message: "Failed to update user work mode" 
    }, { status: 500 });
  }
};
