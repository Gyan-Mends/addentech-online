import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { getSession, setSession } from "~/session";
import bcrypt from 'bcryptjs';
import Registration from "~/modal/registration";

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const formData = await request.formData();
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const rememberMe = formData.get("rememberMe") === "on";

        const session = await getSession(request.headers.get("Cookie"));

        // Check if email exists in the database
        const userCheck = await Registration.findOne({ email });
        if (!userCheck) {
            return json({
                success: false,
                emailError: { email },
                emailErrorMessage: "Invalid email"
            }, { status: 400 });
        }

        // Check if the password matches the one in the database
        const isPasswordValid = await bcrypt.compare(password, userCheck.password);
        if (!isPasswordValid) {
            return json({
                success: false,
                passwordError: { password },
                passwordErrorMessage: "Invalid password"
            }, { status: 400 });
        }

        // If email and password are valid, handle the session
        const cookie = await setSession(session, email, rememberMe);

        let redirectUrl = "/admin";
        if (userCheck.role === "department_head") {
            redirectUrl = "/admin/department";
        } else if (userCheck.role === "manager") {
            redirectUrl = "/admin/manager";
        } else if (userCheck.role === "staff") {
            redirectUrl = "/admin/staff";
        }

        return json({
            success: true,
            redirectUrl,
            user: {
                id: userCheck._id,
                email: userCheck.email,
                role: userCheck.role,
                firstName: userCheck.firstName,
                lastName: userCheck.lastName
            }
        }, { 
            headers: { "Set-Cookie": cookie }
        });

    } catch (error) {
        return json({
            success: false,
            message: "Something went wrong, check your connection"
        }, { status: 500 });
    }
}; 