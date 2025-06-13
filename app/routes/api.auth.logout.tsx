import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getSession, destroySession } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        // Get the current session
        const session = await getSession(request.headers.get("Cookie"));
        
        // Destroy the session and return success response
        return json(
            { success: true, message: "Logged out successfully" },
            {
                headers: {
                    "Set-Cookie": await destroySession(session),
                },
            }
        );
    } catch (error) {
        console.error("Logout error:", error);
        return json(
            { success: false, error: "Failed to logout" },
            { status: 500 }
        );
    }
}

// Handle GET requests (redirect to login)
export async function loader() {
    return json({ error: "Method not allowed" }, { status: 405 });
} 