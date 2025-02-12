import { json, redirect } from "@remix-run/node";
import { DepartmentInterface, RegistrationInterface } from "~/interface/interface";
import Category from "~/modal/category";
import Departments from "~/modal/department";
import Registration from "~/modal/registration";
import { getSession } from "~/session"


class DepartmentController {
    async DeleteCat(intent: string, id: string) {
        // Delete Logic
        if (intent === "delete") {
            const deleteCategory = await Departments.findByIdAndDelete(id);
            if (deleteCategory) {
                return json({ message: "Department deleted successfully", success: true }, { status: 200 });
            } else {
                return json({ message: "Department not found", success: false }, { status: 404 });
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

            const updateCategory = await Departments.findByIdAndUpdate(id, { name, description });
            if (updateCategory) {
                return json({ message: "Department updated successfully", success: true }, { status: 200 });
            } else {
                return json({ message: "Department not found", success: false }, { status: 404 });
            }

        }
    }

    async CategoryAdd(request: Request, name: string, description: string, admin: string, intent: string, id: string) {
        try {

            if (intent === "create") {
                // Checking if category already exists
                const categoryExistCheck = await Departments.findOne({ admin, name });
                if (categoryExistCheck) {
                    return json({ message: "Department already exists", success: false }, { status: 400 });
                }

                // Saving data if category does not exist
                const category = new Departments({
                    name,
                    description,
                    admin
                });

                const response = await category.save();
                if (response) {
                    return json({ message: "Department created successfully", success: true }, { status: 200 });
                }

            }
        } catch (error: any) {
            return json({ message: error.message, success: false }, { status: 400 });
        }
    }



    async getDepartments({
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
        categories: DepartmentInterface[],
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


            // Get total employee count and calculate total pages       
            const totalEmployeeCount = await Departments.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(totalEmployeeCount / limit);

            // Find users with pagination and search filter
            const departments = await Departments.find(searchFilter)
                .skip(skipCount)
                .limit(limit)
                .exec();

            const department = await Departments.find()


            return { departments, department, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }
}

const department = new DepartmentController
export default department