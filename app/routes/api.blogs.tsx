import { json } from "@remix-run/node";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import blog from "~/controller/blog";
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

        const { user, blogs, totalPages } = await blog.getBlogs({
            request,
            page,
            search_term
        });

        return json({ 
            success: true,
            data: {
                user, 
                blogs, 
                totalPages, 
                currentPage: page 
            }
        });
    } catch (error: any) {
        return json({
            success: false,
            message: error.message || "Failed to fetch blogs"
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
                const base64Image = formData.get("base64Image") as string;
                const category = formData.get("category") as string;
                const description = formData.get("description") as string;
                const admin = formData.get("admin") as string;

                const createBlog = await blog.BlogAdd({
                    name,
                    base64Image,
                    category,
                    description,
                    admin
                });
                return createBlog;

            case "delete":
                const deleteId = formData.get("id") as string;
                const deleteBlog = await blog.DeleteBlog({ intent, id: deleteId });
                return deleteBlog;

            case "update":
                const updateId = formData.get("id") as string;
                const updateName = formData.get("name") as string;
                const updateBase64Image = formData.get("base64Image") as string;
                const updateCategory = formData.get("category") as string;
                const updateDescription = formData.get("description") as string;
                const updateAdmin = formData.get("admin") as string;

                const updateBlog = await blog.UpdateCat({
                    name: updateName,
                    base64Image: updateBase64Image,
                    category: updateCategory,
                    description: updateDescription,
                    admin: updateAdmin,
                    id: updateId
                });
                return updateBlog;

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