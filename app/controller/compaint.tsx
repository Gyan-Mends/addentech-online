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
                attachment: base64Image,
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



    async getComplaints({
        request,
        page,
        search_term,
        limit = 9
    }: {
        request: Request,
        page: number;
        search_term: string;
        limit?: number;
        }) {
        const skipCount = (page - 1) * limit; // Calculate the number of documents to skip

        // Define the search filter only once
        const searchFilter = search_term
            ? {
                $or: [
                    {
                        unique_id: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                        status: {
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

            // Get total employee count and calculate total pages       
            const complaintCount = await Complaint.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(complaintCount / limit);

            // Find users with pagination and search filter
            const complaint = await Complaint.find(searchFilter)
                .skip(skipCount)
                .limit(limit)
                .exec();

            return { complaint, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }

    async DeleteComplaint(
        {
            id,
        }: {
            id: string,
        }
    ) {

        const deleteMemo = await Complaint.findByIdAndDelete(id);
        if (deleteMemo) {
            return json({
                message: "Complaint delete successfully",
                success: true,
                status: 500,
            })
        } else {
            return json({
                message: "Unable to delete complaint",
                success: false,
                status: 500
            })
        }

    }
}

const complaintController = new ComplaintController
export default complaintController