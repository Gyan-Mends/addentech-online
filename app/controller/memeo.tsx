import { json } from "@remix-run/node"
import Memo from "~/modal/memo"
import { getSession } from "~/session"
import Registration from "~/modal/registration"
import { sendEmail, createMemoEmailTemplate } from "~/utils/email"

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
        currentUser,
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
        currentUser: any
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
                emailCheck: true, // Always set to true as requested
                image: base64Image,
            })

            const saveMemo = await memo.save()

            if (saveMemo) {
                // Send emails if emailCheck is true (which is always true now)
                try {
                    // Get recipient details for emails
                    const toUser = await Registration.findById(toName).populate('department');
                    const ccUser = await Registration.findById(ccName).populate('department');
                    const fromUser = await Registration.findById(fromName).populate('department');

                    if (toUser && ccUser && fromUser) {
                        const memoData = {
                            refNumber,
                            fromName: `${fromUser.firstName} ${fromUser.lastName}`,
                            fromDepartment: (fromUser.department as any)?.name || '',
                            subject,
                            memoDate,
                            dueDate,
                            memoType,
                            frequency,
                            remark
                        };

                        // Prepare attachment if image exists
                        let attachments: Array<{
                            filename: string;
                            content: string;
                            encoding: string;
                        }> = [];

                        if (base64Image && base64Image.trim() !== '') {
                            // Extract the base64 data and determine file type
                            const base64Data = base64Image.includes(',') 
                                ? base64Image.split(',')[1] 
                                : base64Image;
                            
                            // Determine file extension from base64 header
                            let fileExtension = 'jpg'; // default
                            if (base64Image.includes('data:image/png')) {
                                fileExtension = 'png';
                            } else if (base64Image.includes('data:image/jpeg') || base64Image.includes('data:image/jpg')) {
                                fileExtension = 'jpg';
                            } else if (base64Image.includes('data:image/gif')) {
                                fileExtension = 'gif';
                            } else if (base64Image.includes('data:application/pdf')) {
                                fileExtension = 'pdf';
                            }

                            attachments.push({
                                filename: `memo_attachment_${refNumber}.${fileExtension}`,
                                content: base64Data,
                                encoding: 'base64'
                            });
                        }

                        // Send email to the "To" recipient
                        const toEmailTemplate = createMemoEmailTemplate(
                            memoData,
                            `${toUser.firstName} ${toUser.lastName}`,
                            'TO',
                            attachments.length > 0
                        );

                        await sendEmail({
                            from: currentUser.email,
                            to: toUser.email,
                            subject: `New Memo: ${subject} (Ref: ${refNumber})`,
                            html: toEmailTemplate,
                            attachments: attachments.length > 0 ? attachments : undefined
                        });

                        // Send email to the "CC" recipient
                        const ccEmailTemplate = createMemoEmailTemplate(
                            memoData,
                            `${ccUser.firstName} ${ccUser.lastName}`,
                            'CC',
                            attachments.length > 0
                        );

                        await sendEmail({
                            from: currentUser.email,
                            to: ccUser.email,
                            subject: `CC: New Memo - ${subject} (Ref: ${refNumber})`,
                            html: ccEmailTemplate,
                            attachments: attachments.length > 0 ? attachments : undefined
                        });

                        console.log('Emails sent successfully for memo:', refNumber);
                    }
                } catch (emailError) {
                    console.error('Error sending emails:', emailError);
                    // Don't fail the memo creation if email fails
                }

                return json({
                    message: "Memo created successfully",
                    success: true,
                    status: 201
                })
            } else {
                return json({
                    message: "Unable to create Memo",
                    success: false,
                    status: 500
                })
            }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500
            })
        }
    }

    // Update memo
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
        currentUser,
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
        base64Image?: string;
        currentUser?: any;
    }) {
        try {
            // Find the existing memo
            const existingMemo = await Memo.findById(id);

            if (!existingMemo) {
                return json({
                    message: "Memo not found. Unable to update.",
                    success: false,
                    status: 404,
                });
            }

            // Update the image only if a new one is provided
            const updatedImage = base64Image ? base64Image : existingMemo.image;

            // Prepare update payload
            const updatePayload: Record<string, any> = {
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
                emailCheck: true, // Always set to true
                image: updatedImage,
                updatedAt: new Date(),
            };

            // Remove undefined values from the payload
            Object.keys(updatePayload).forEach((key) => {
                if (updatePayload[key] === undefined) {
                    delete updatePayload[key];
                }
            });

            // Perform the update
            const updatedMemo = await Memo.findByIdAndUpdate(id, updatePayload, { new: true });

            if (updatedMemo) {
                // Send update emails if recipients changed or if requested
                if (currentUser && (
                    existingMemo.toName.toString() !== toName ||
                    existingMemo.ccName.toString() !== ccName
                )) {
                    try {
                        const toUser = await Registration.findById(toName).populate('department');
                        const ccUser = await Registration.findById(ccName).populate('department');
                        const fromUser = await Registration.findById(fromName).populate('department');

                        if (toUser && ccUser && fromUser) {
                            const memoData = {
                                refNumber,
                                fromName: `${fromUser.firstName} ${fromUser.lastName}`,
                                fromDepartment: (fromUser.department as any)?.name || '',
                                subject,
                                memoDate,
                                dueDate: dueDate || '',
                                memoType,
                                frequency: frequency || '',
                                remark: remark || ''
                            };

                            // Prepare attachment if image exists
                            let attachments: Array<{
                                filename: string;
                                content: string;
                                encoding: string;
                            }> = [];

                            if (updatedImage && updatedImage.trim() !== '') {
                                // Extract the base64 data and determine file type
                                const base64Data = updatedImage.includes(',') 
                                    ? updatedImage.split(',')[1] 
                                    : updatedImage;
                                
                                // Determine file extension from base64 header
                                let fileExtension = 'jpg'; // default
                                if (updatedImage.includes('data:image/png')) {
                                    fileExtension = 'png';
                                } else if (updatedImage.includes('data:image/jpeg') || updatedImage.includes('data:image/jpg')) {
                                    fileExtension = 'jpg';
                                } else if (updatedImage.includes('data:image/gif')) {
                                    fileExtension = 'gif';
                                } else if (updatedImage.includes('data:application/pdf')) {
                                    fileExtension = 'pdf';
                                }

                                attachments.push({
                                    filename: `memo_attachment_${refNumber}.${fileExtension}`,
                                    content: base64Data,
                                    encoding: 'base64'
                                });
                            }

                            // Send updated memo emails
                            const toEmailTemplate = createMemoEmailTemplate(
                                memoData,
                                `${toUser.firstName} ${toUser.lastName}`,
                                'TO',
                                attachments.length > 0
                            );

                            await sendEmail({
                                from: currentUser.email,
                                to: toUser.email,
                                subject: `Updated Memo: ${subject} (Ref: ${refNumber})`,
                                html: toEmailTemplate,
                                attachments: attachments.length > 0 ? attachments : undefined
                            });

                            const ccEmailTemplate = createMemoEmailTemplate(
                                memoData,
                                `${ccUser.firstName} ${ccUser.lastName}`,
                                'CC',
                                attachments.length > 0
                            );

                            await sendEmail({
                                from: currentUser.email,
                                to: ccUser.email,
                                subject: `CC: Updated Memo - ${subject} (Ref: ${refNumber})`,
                                html: ccEmailTemplate,
                                attachments: attachments.length > 0 ? attachments : undefined
                            });
                        }
                    } catch (emailError) {
                        console.error('Error sending update emails:', emailError);
                    }
                }

                return json({
                    message: "Memo updated successfully",
                    success: true,
                    status: 200,
                    data: updatedMemo,
                });
            } else {
                return json({
                    message: "Unable to update this record.",
                    success: false,
                    status: 500,
                });
            }
        } catch (error: any) {
            return json({
                message: error.message || "An error occurred while updating the memo.",
                success: false,
                status: 500,
            });
        }
    }

    // Delete memo
    async DeleteMemo({
        id,
    }: {
        id: string,
    }) {
        try {
            const deleteMemo = await Memo.findByIdAndDelete(id);
            if (deleteMemo) {
                return json({
                    message: "Memo deleted successfully",
                    success: true,
                    status: 200,
                })
            } else {
                return json({
                    message: "Unable to delete memo",
                    success: false,
                    status: 500
                })
            }
        } catch (error: any) {
            return json({
                message: error.message,
                success: false,
                status: 500
            })
        }
    }

    // Fetch memos with role-based visibility
    async FetchMemo({
        request,
        page = 1,
        search_term,
        limit = 7,
    }: {
        request?: Request;
        page?: number;
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
                    {
                        subject: {
                            $regex: new RegExp(
                                search_term
                                    .split(" ")
                                    .map((term) => `(?=.*${term})`)
                                    .join(""),
                                "i"
                            ),
                        },
                    }
                ],
            }
            : {};

        try {
            // Get session and user information
            const session = request ? await getSession(request.headers.get("Cookie")) : null;
            const token = session?.get("email");
            const user = token ? await Registration.findOne({ email: token }).populate('department') : null;

            if (!user) {
                return {
                    message: "User not authenticated",
                    success: false,
                    status: 401
                };
            }

            // Apply role-based filtering for memo visibility
            let roleBasedFilter: any = {};

            if (user.role === "admin" || user.role === "manager") {
                // Admin and manager can see all memos
                roleBasedFilter = {};
            } else {
                // For all other roles, they can only see memos where they are:
                // 1. The sender (fromName)
                // 2. The recipient (toName) 
                // 3. CC'd (ccName)
                roleBasedFilter = {
                    $or: [
                        { fromName: user._id },
                        { toName: user._id },
                        { ccName: user._id }
                    ]
                };
            }

            // Combine search filter with role-based filter
            const combinedFilter = { ...searchFilter, ...roleBasedFilter };

            // Get total memo count and calculate total pages       
            const totalMemoCount = await Memo.countDocuments(combinedFilter).exec();
            const totalPages = Math.ceil(totalMemoCount / (limit || 9));

            // Find memos with pagination and search filter
            const memos = await Memo.find(combinedFilter)
                .skip(skipCount)
                .limit(limit || 9)
                .populate("fromDepartment", "name")
                .populate("toDepartment", "name")
                .populate("toName", "firstName middleName lastName email")
                .populate("fromName", "firstName middleName lastName email")
                .populate("ccDepartment", "name")
                .populate("ccName", "firstName middleName lastName email")
                .sort({ createdAt: -1 }) // Sort by newest first
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
}

const memoController = new MemoController
export default memoController
