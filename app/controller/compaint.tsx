import { json, redirect } from "@remix-run/node";
import { CategoryInterface, RegistrationInterface } from "~/interface/interface";
import Category from "~/modal/category";
import Complaint from "~/modal/complaint";
import Registration from "~/modal/registration";
import { getSession } from "~/session"


class ComplaintController {
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

    async createComplaint(
        {
            base64Image,
            description,
            unique_id
        }: {
            base64Image: string,
            description: string,
            unique_id: string
        }
    ) {
        try {


            const idCheck = await Complaint.findOne({ unique_id: unique_id });
            if (idCheck) {
                return json({ message: "Unique ID already exists", success: false }, { status: 400 });
            }

            // Saving data if category does not exist
            const complaint = new Complaint({
                image: base64Image,
                description,
                unique_id
            });

            const response = await complaint.save();
            if (response) {
                return json({ message: "Complaint made successfully", success: true }, { status: 200 });
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

const complaintController = new ComplaintController
export default complaintController