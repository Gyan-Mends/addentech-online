import { json } from "@remix-run/node"
import Memo from "~/modal/memo"
import { getSession } from "~/session"
import emailService from "~/controller/emailService"

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
        currentUserId,
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
        currentUserId?: string
    }) {

        try {
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
                createdBy: currentUserId,
            })

            const saveMemo = await memo.save()

            if (saveMemo) {
                // Send email notifications if emailCheck is enabled
                if (emailCheck) {
                    try {
                        // Import Registration model to get user details
                        const Registration = await import("~/modal/registration").then(m => m.default);
                        
                        // Populate the saved memo with user and department details
                        const populatedMemo = await Memo.findById(saveMemo._id)
                            .populate("fromName", "firstName lastName email")
                            .populate("fromDepartment", "name")
                            .populate("toName", "firstName lastName email")
                            .populate("ccName", "firstName lastName email")
                            .exec();

                        if (populatedMemo) {
                            // Prepare email data
                            const memoEmailData = {
                                refNumber: populatedMemo.refNumber,
                                subject: populatedMemo.subject,
                                fromName: {
                                    firstName: (populatedMemo.fromName as any).firstName,
                                    lastName: (populatedMemo.fromName as any).lastName,
                                    email: (populatedMemo.fromName as any).email
                                },
                                fromDepartment: {
                                    name: (populatedMemo.fromDepartment as any).name
                                },
                                memoDate: populatedMemo.memoDate.toString(),
                                dueDate: populatedMemo.dueDate?.toString(),
                                frequency: populatedMemo.frequency,
                                remark: populatedMemo.remark,
                                memoType: populatedMemo.memoType
                            };

                            // Prepare recipient data
                            const toRecipient = {
                                email: (populatedMemo.toName as any).email,
                                firstName: (populatedMemo.toName as any).firstName,
                                lastName: (populatedMemo.toName as any).lastName
                            };

                            const ccRecipient = {
                                email: (populatedMemo.ccName as any).email,
                                firstName: (populatedMemo.ccName as any).firstName,
                                lastName: (populatedMemo.ccName as any).lastName
                            };

                            // Send email notifications
                            const emailResults = await emailService.sendMemoNotifications(
                                memoEmailData,
                                toRecipient,
                                ccRecipient,
                                (populatedMemo.fromName as any).email
                            );

                            console.log(`Email notification results:`, emailResults);

                            // Return success response with email status
                            return json({
                                message: `Memo created successfully. Email notifications: TO ${emailResults.toSent ? 'sent' : 'failed'}, CC ${emailResults.ccSent ? 'sent' : 'failed'}`,
                                success: true,
                                status: 200,
                                emailResults
                            });
                        }
                    } catch (emailError) {
                        console.error("Error sending email notifications:", emailError);
                        // Return success for memo creation but note email failure
                        return json({
                            message: "Memo created successfully, but email notifications failed to send",
                            success: true,
                            status: 200,
                            emailError: (emailError as Error).message
                        });
                    }
                }

                return json({
                    message: "Memo created successfully",
                    success: true,
                    status: 200
                });
            } else {
                return json({
                    message: "Unable to create Memo",
                    success: false,
                    status: 500
                });
            }
        } catch (error: any) {
            console.error("Error creating memo:", error);
            return json({
                message: error.message || "An error occurred while creating the memo",
                success: false,
                status: 500
            });
        }
    }

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
        currentUserId,
    }: {
        request?: Request;
        page: number;
        search_term?: string;
        limit?: number;
        currentUserId?: string;
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
            
            // Import Registration model to check user role
            const Registration = await import("~/modal/registration").then(m => m.default);
            const user = token ? await Registration.findOne({ email: token }) : null;

            // Create visibility filter based on user role and involvement
            let visibilityFilter = {};
            
            if (user && currentUserId) {
                // Admin and managers can see all memos
                if (user.role === 'admin' || user.role === 'manager') {
                    visibilityFilter = {}; // No filter - see all memos
                } else {
                    // Regular users can only see memos where they are involved
                    visibilityFilter = {
                        $or: [
                            { fromName: currentUserId }, // Memos they sent
                            { toName: currentUserId },   // Memos sent to them
                            { ccName: currentUserId },   // Memos they are CC'd on
                            { createdBy: currentUserId } // Memos they created (if different from fromName)
                        ]
                    };
                }
            }

            // Combine search filter with visibility filter
            const combinedFilter = {
                ...searchFilter,
                ...visibilityFilter
            };

            // Get total employee count and calculate total pages       
            const totalEmployeeCount = await Memo.countDocuments(combinedFilter).exec();
            const totalPages = Math.ceil(totalEmployeeCount / (limit || 9));

            // Find memos with pagination, search filter, and visibility filter
            const memos = await Memo.find(combinedFilter)
                .skip(skipCount)
                .limit(limit || 9)
                .populate("fromDepartment")
                .populate("toDepartment")
                .populate("toName")
                .populate("fromName")
                .populate("ccDepartment")
                .populate("ccName")
                .sort({ createdAt: -1 }) // Show newest first
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
