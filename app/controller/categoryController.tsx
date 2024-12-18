import { json, redirect } from "@remix-run/node";
import { CategoryInterface, RegistrationInterface } from "~/interface/interface";
import Category from "~/modal/category";
import Registration from "~/modal/registration";
import { getSession } from "~/session"


class CategoryController {
    async DeleteCat(intent: string, id: string) {
        // Delete Logic
        if (intent === "delete") {
            const deleteCategory = await Category.findByIdAndDelete(id);
            if (deleteCategory) {
                return json({ message: "Category deleted successfully", success: true }, { status: 200 });
            } else {
                return json({ message: "Category not found", success: false }, { status: 404 });
            }
        }
    }

    async UpdateCat({
        intent,
        id,
        name,
        description,
    }: {
        intent: string,
        id: string,
        name: string,
        description: string,
    }) {
        // Update Logic
        if (intent === "update") {

            const updateCategory = await Category.findByIdAndUpdate(id, { name, description });
            if (updateCategory) {
                return json({ message: "Category updated successfully", success: true }, { status: 200 });
            } else {
                return json({ message: "Category not found", success: false }, { status: 404 });
            }

        }
    }

    async CategoryAdd(request: Request, name: string, description: string, seller: string, intent: string, id: string) {
        try {

            if (intent === "create") {
                // Checking if category already exists
                const categoryExistCheck = await Category.findOne({ seller, name });
                if (categoryExistCheck) {
                    return json({ message: "Category already exists", success: false }, { status: 400 });
                }

                // Saving data if category does not exist
                const category = new Category({
                    name,
                    description,
                    seller
                });

                const response = await category.save();
                if (response) {
                    return json({ message: "Category created successfully", success: true }, { status: 200 });
                }

            }
        } catch (error: any) {
            return json({ message: error.message, success: false }, { status: 400 });
        }
    }



    async getCategories({
        request,
        page,
        search_term,
        limit = 9
    }: {
        request: Request,
        page: number;
        search_term: string;
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
            const totalEmployeeCount = await Category.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(totalEmployeeCount / limit);

            // Find users with pagination and search filter
            const categories = await Category.find(searchFilter)
                .skip(skipCount)
                .limit(limit)
                .exec();

            return { user, categories, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }
}

const category = new CategoryController
export default category