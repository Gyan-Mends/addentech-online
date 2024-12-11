import { json, redirect } from "@remix-run/node";
import { getSession, setSession } from "~/session";
import bcrypt from 'bcryptjs';
import Registration from "~/modal/registration";

class LoginController {
    async Logins({
        request,
        email,
        password,
        rememberMe
    }: {
        request: Request,
        email: string,
        password: string,
        rememberMe: boolean | any
    }) {
        try {
            const session = await getSession(request.headers.get("Cookie"));

            // Check if email exists in the database
            const userCheck = await Registration.findOne({ email });
            if (!userCheck) {
                return json({
                    emailError: { email },
                    emailErrorMessage: "Invalid email "
                });
            }

            // Check if the password matches the one in the database
            const isPasswordValid = await bcrypt.compare(password, userCheck.password);
            if (!isPasswordValid) {
                return json({
                    passwordError: { password },
                    passwordErrorMessage: "Invalid password"
                });
            }

            // If email and password are valid, handle the session and redirect
            const cookie = await setSession(session, email, rememberMe === 'on');

            if (userCheck.role === "admin") {
                return redirect("/admin", { headers: { "Set-Cookie": cookie } });
            } else if (userCheck.role === "attendant") {
                return redirect("/attendant", { headers: { "Set-Cookie": cookie } });
            } else {
                return json({
                    success: false,
                    errors: { role: "Invalid role selection" }
                });
            }

        } catch (error) {
            return json({
                success: false,
                message: "Something went wrong, check your connection"
            }, { status: 500 });
        }
    }

    async Creaete({
        email,
        password
    }: {
        email: string,
        password: string
    }) {
        const save = new Registration({ email, password })

        const saveUs = await save.save()

        if (saveUs) {
            console.log("success");

        } else {
            console.log("failed");

        }
    }
}

const login = new LoginController();
export default login;

