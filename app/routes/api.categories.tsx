import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import category from "~/controller/categoryController";
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

        const { user, categories, totalPages } = await category.getCategories({
            request,
            page,
            search_term
        });

        return json({ 
            success: true,
            data: {
                user, 
                categories, 
                totalPages, 
                currentPage: page 
            }
        });
    } catch (error: any) {
        return json({
            success: false,
            message: error.message || "Failed to fetch categories"
        }, { status: 500 });
    }
};

export const action: ActionFunction = async ({ request }) => {
    try {
        const formData = await request.formData();
        const intent = formData.get("intent") as string;

        switch (intent) {
            case "create":
                const name = formData.get("name") as string;
                const seller = formData.get("seller") as string;
                const description = formData.get("description") as string;
                const id = formData.get("id") as string;

                const createCategory = await category.CategoryAdd(request, name, description, seller, intent, id);
                return createCategory;

            case "delete":
                const deleteId = formData.get("id") as string;
                const deleteCategory = await category.DeleteCat(intent, deleteId);
                return deleteCategory;

            case "update":
                const updateId = formData.get("id") as string;
                const updateName = formData.get("name") as string;
                const updateDescription = formData.get("description") as string;

                const updateCategory = await category.UpdateCat({
                    intent,
                    id: updateId,
                    name: updateName,
                    description: updateDescription
                });
                return updateCategory;

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