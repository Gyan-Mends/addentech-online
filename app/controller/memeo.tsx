import { json } from "@remix-run/node"
import Memo from "~/modal/memo"
import { getSession } from "~/session"

class MemoController {
    // Create a new memo
    async Memo({
        refNumber,
        fromDepartment,
        fromName,
        memoDate,
        toDepartment,
        toName,
        subject,
        memoType,
        dueDate,
        frequency,
        remark,
        ccDepartment,
        ccName,
        emailCheck,
        base64Image,
    }: {
        refNumber: string
        fromDepartment: string
        fromName: string
        memoDate: string
        toDepartment: string
        toName: string
        subject: string
        memoType: string
        dueDate: string
        frequency: string
        remark: string
        ccDepartment: string
        ccName: string
        emailCheck: boolean
        base64Image: string
    }) {

        const memo = new Memo({
            refNumber,
            fromDepartment,
            fromName,
            memoDate,
            toDepartment,
            toName,
            subject,
            memoType,
            dueDate,
            frequency,
            remark,
            ccDepartment,
            ccName,
            emailCheck,
            image: base64Image,
        })

        const saveMemo = await memo.save()

        if (saveMemo) {
            return json({
                message: "Memo created successfully",
                success: true,
                status: 500
            })
        } else {
            return json({
                message: "Unable to create Memo",
                success: false,
                status: 500
            })
        }

    };

    async UpdateMemo({
        id,
        refNumber,
        fromDepartment,
        fromName,
        memoDate,
        toDepartment,
        toName,
        subject,
        memoType,
        dueDate,
        frequency,
        remark,
        ccDepartment,
        ccName,
        emailCheck,
        base64Image,
    }: {
        id: string;
        refNumber: string;
        fromDepartment: string;
        fromName: string;
        memoDate: string;
        toDepartment: string;
        toName: string;
        subject: string;
        memoType: string;
        dueDate?: string;
        frequency?: string;
        remark?: string;
        ccDepartment?: string;
        ccName?: string;
        emailCheck?: boolean;
        base64Image?: string; // Make image optional
    }) {
        try {
            // Find the existing memo
            const existingMemo = await Memo.findById(id);
    
            if (!existingMemo) {
                return json(
                    { message: "Memo not found", success: false },
                    { status: 404 }
                );
            }
    
            // Update image only if a new one is provided
            const updatedImage = base64Image ? base64Image : existingMemo.image;
    
            // Update the memo with the new or existing image
            const updatedMemo = await Memo.findByIdAndUpdate(
                id,
                {
                    refNumber,
                    fromDepartment,
                    fromName,
                    memoDate,
                    toDepartment,
                    toName,
                    subject,
                    memoType,
                    dueDate,
                    frequency,
                    remark,
                    ccDepartment,
                    ccName,
                    emailCheck,
                    image: updatedImage,
                },
                { new: true } // Return the updated document
            );
    
            if (updatedMemo) {
                return json(
                    { message: "Memo updated successfully", success: true, data: updatedMemo },
                    { status: 200 }
                );
            } else {
                return json(
                    { message: "Unable to update memo", success: false },
                    { status: 500 }
                );
            }
        } catch (error: any) {
            return json(
                { message: error.message || "An error occurred while updating the memo.", success: false },
                { status: 500 }
            );
        }
    }
    


    async FetchMemo({
        request,
        page,
        search_term,
        limit = 7,
    }: {
        request?: Request;
        page: number;
        search_term?: string;
        limit?: number;
    } = { page: 1 }) {
        const skipCount = (page - 1) * (limit);

        const searchFilter = search_term
            ? {
                $or: [
                    {
                        refNumber: {
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
            // Get session and user information if request is provided
            const session = request ? await getSession(request.headers.get("Cookie")) : null;
            const token = session?.get("email");
            const user = token ? await Memo.findOne({ email: token }) : null;

            // Get total employee count and calculate total pages       
            const totalEmployeeCount = await Memo.countDocuments(searchFilter).exec();
            const totalPages = Math.ceil(totalEmployeeCount / (limit || 9));

            // Find users with pagination and search filter
            const memos = await Memo.find(searchFilter)
                .skip(skipCount)
                .limit(limit || 9)
                .populate("fromDepartment")
                .populate("toDepartment")
                .populate("toName")
                .populate("fromName")
                .populate("ccDepartment")
                .populate("ccName")
                .exec();

            return { user, memos, totalPages };
        } catch (error: any) {
            return {
                message: error.message,
                success: false,
                status: 500
            };
        }
    }

    async DeleteMemo(
        {
            id,
        }: {
            id: string,
        }
    ) {

        const deleteMemo = await Memo.findByIdAndDelete(id);
        if (deleteMemo) {
            return json({
                message: "memo delete successfully",
                success: true,
                status: 500,
            })
        } else {
            return json({
                message: "Unable to delete memo",
                success: false,
                status: 500
            })
        }

    }
}

const memoController = new MemoController;
export default memoController
