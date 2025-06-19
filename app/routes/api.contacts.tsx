import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import contactController from "~/controller/contact";
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

        const { contacts, totalPages } = await contactController.getContacts({
            request,
            page,
            search_term
        });

        return json({ 
            success: true,
            data: {
                contacts, 
                totalPages, 
                currentPage: page 
            }
        });
    } catch (error: any) {
        return json({
            success: false,
            message: error.message || "Failed to fetch contacts"
        }, { status: 500 });
    }
};

export const action: ActionFunction = async ({ request }) => {
    try {
        const formData = await request.formData();
        const intent = formData.get("intent") as string;

        switch (intent) {
            case "create":
                const firstName = formData.get("firstName") as string;
                const lastName = formData.get("lastName") as string;
                const middleName = formData.get("middleName") as string;
                const number = formData.get("number") as string;
                const company = formData.get("company") as string;
                const description = formData.get("description") as string;

                const createContact = await contactController.Create({
                    firstName,
                    lastName,
                    middleName,
                    number,
                    company,
                    description
                });
                return createContact;

            case "delete":
                const deleteId = formData.get("id") as string;
                const deleteContact = await contactController.DeleteCat(deleteId);
                return deleteContact;

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