import { json, redirect } from "@remix-run/node";
import { CategoryInterface, RegistrationInterface } from "~/interface/interface";
import Blog from "~/modal/blog";
import Category from "~/modal/category";
import Registration from "~/modal/registration";
import { getSession } from "~/session"


class BlogController {
    async DeleteBlog({
        intent,
        id
    }: {
        intent: string, id: string
    }) {
        // Delete Logic
        const deleteBlog = await Blog.findByIdAndDelete(id);
        if (deleteBlog) {
            return json({ message: "Category deleted successfully", success: true }, { status: 200 });
        } else {
            return json({ message: "Category not found", success: false }, { status: 404 });
        }
    }

    async UpdateCat({
        name,
        base64Image,
        category,
        description,
        admin,
        id
    }: {
            name: string,
            base64Image: string,
            category: string,
            description: string,
            admin: string,
            id: string
        }) {    

        const updateBlog = await Blog.findByIdAndUpdate(id, {
            name,
            image: base64Image,
            category,
            description,
            admin,

        });
        if (updateBlog) {
            return json({ message: "Blog updated successfully", success: true }, { status: 200 });
            } else {
            return json({ message: "Blog not found", success: false }, { status: 404 });
            }


    }

    async BlogAdd({
        name,
        base64Image,
        category,
        description,
        admin
    }: {
        name: string
        base64Image: string
        category: string
        description: string
        admin: string
    }) {
        try {

            // Checking if blog already exists
            const blogExistCheck = await Blog.findOne({ name: name });
            if (blogExistCheck) {
                return json({ message: "Blog already exists", success: false }, { status: 400 });
            }

            // Saving data if category does not exist
            const blog = new Blog({
                name,
                image: base64Image,
                category,
                description,
                admin
            });

            const response = await blog.save();
            if (response) {
                return json({ message: "Blog created successfully", success: true }, { status: 200 });
            }


        } catch (error: any) {
            return json({ message: error.message, success: false }, { status: 400 });
        }
    }



    async getBlogs({
        request,
        page,
        search_term,
        limit = 9
    }: {
            request?: Request,
            page?: number;
            search_term?: string;
        limit?: number;
    }): Promise<{
        user: RegistrationInterface[],
        categories: CategoryInterface[],
        totalPages: number
    } | any> {
        const skipCount = (page - 1) * limit; // Calculate the number of documents to skip

        // Define the search filter only once
        const searchFilter = search_term
            ? {
                $or: [
                    {
                        name: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                    },

                ],
            }
            : {};

        try {
            // Get session and user information
            const session = await getSession(request.headers.get("Cookie"));
            const token = session.get("email");
            const user = await Registration.findOne({ email: token });

            // Get total employee count and calculate total pages       
            const totalEmployeeCount = await Blog.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(totalEmployeeCount / limit);

            // Find users with pagination and search filter
            const blogs = await Blog.find(searchFilter)
                .populate("admin")
                .populate("category")
                .skip(skipCount)
                .limit(limit)
                .exec();

            return { user, blogs, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }
}

const blog = new BlogController
export default blog