import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import usersController from "~/controller/Users";
import department from "~/controller/departments";
import { getSession } from "~/session";

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") as string) || 1;
        const search_term = url.searchParams.get("search_term") as string;

        const session = await getSession(request.headers.get("Cookie"));
        const token = session.get("email");
        
        if (!token) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }

        const { user, users, totalPages } = await usersController.FetchUsers({
            request,
            page,
            search_term
        });

        const { departments } = await department.getDepartments({
            request,
            page,
            search_term
        });

        return json({ 
            success: true,
            data: {
                user, 
                users, 
                totalPages, 
                departments, 
                currentPage: page 
            }
        });
    } catch (error: any) {
        return json({
            success: false,
            message: error.message || "Failed to fetch users"
        }, { status: 500 });
    }
};

export const action: ActionFunction = async ({ request }) => {
    try {
        const formData = await request.formData();
        const intent = formData.get("intent") as string;

        switch (intent) {
            case "create":
                const firstName = formData.get("firstname") as string;
                const lastName = formData.get("lastname") as string;
                const middleName = formData.get("middlename") as string;
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;
                const phone = formData.get("phone") as string;
                const base64Image = formData.get("base64Image") as string;
                const role = formData.get("role") as string;
                const admin = formData.get("admin") as string;
                const position = formData.get("position") as string;
                const department = formData.get("department") as string;
                const bio = formData.get("bio") as string;

                const user = await usersController.CreateUser({
                    firstName,
                    middleName,
                    lastName,
                    email,
                    admin,
                    password,
                    phone,
                    role,
                    intent,
                    position,
                    department,
                    base64Image,
                    bio,
                });
                return user;

            case "delete":
                const deleteId = formData.get("id") as string;
                const deleteUser = await usersController.DeleteUser({
                    id: deleteId
                });
                return deleteUser;

            case "update":
                const updateFirstName = formData.get("firstname") as string;
                const updateLastName = formData.get("lastname") as string;
                const updateMiddleName = formData.get("middlename") as string;
                const updateEmail = formData.get("email") as string;
                const updatePhone = formData.get("phone") as string;
                const updateBase64Image = formData.get("base64Image") as string;
                const updateRole = formData.get("role") as string;
                const updateAdmin = formData.get("admin") as string;
                const updatePosition = formData.get("position") as string;
                const updateDepartment = formData.get("department") as string;
                const updateId = formData.get("id") as string;
                const updateBio = formData.get("bio") as string;

                const updateUser = await usersController.UpdateUser({
                    firstName: updateFirstName,
                    middleName: updateMiddleName,
                    lastName: updateLastName,
                    email: updateEmail,
                    admin: updateAdmin,
                    phone: updatePhone,
                    role: updateRole,
                    position: updatePosition,
                    department: updateDepartment,
                    base64Image: updateBase64Image,
                    id: updateId,
                    bio: updateBio,
                });
                return updateUser;

            case "logout":
                const logout = await usersController.logout(intent);
                return logout;

            default:
                return json({
                    success: false,
                    message: "Bad request - Invalid intent"
                }, { status: 400 });
        }
    } catch (error: any) {
        return json({
            success: false,
            message: error.message || "An error occurred"
        }, { status: 500 });
    }
}; 