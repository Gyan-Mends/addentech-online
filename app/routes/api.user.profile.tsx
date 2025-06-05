import { json, LoaderFunction } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    // Get the user's session
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");
    
    // If no email in session, user is not logged in
    if (!email) {
      return json({ authenticated: false }, { status: 401 });
    }
    
    // Find the user by email to get their role and permissions
    const user = await Registration.findOne({ email });
    
    if (!user) {
      return json({ authenticated: false }, { status: 404 });
    }
    
    // Convert permissions Map to plain object
    const permissions: Record<string, boolean> = {};
    if (user.permissions && user.permissions instanceof Map) {
      for (const [key, value] of user.permissions.entries()) {
        permissions[key] = value;
      }
    }
    
    // Return user profile data (only include necessary fields for security)
    return json({
      authenticated: true,
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: permissions
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
};
