import { json } from "@remix-run/node";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import memoController from "~/controller/memeo";
import { getSession } from "~/session";
import Registration from "~/modal/registration";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") as string) || 1;
    const search_term = url.searchParams.get("search_term") as string;
    const limit = parseInt(url.searchParams.get("limit") as string) || 7;

    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");

    if (!token) {
      return json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // Get current user without populating department to keep it as ID
    const currentUser = await Registration.findOne({ email: token });
    
    if (!currentUser) {
      return json({ success: false, message: "User not found" }, { status: 404 });
    }

    const result = await memoController.FetchMemo({
      request,
      page,
      search_term,
      limit,
    });

    if (result.message && !result.user) {
      return json({
        success: false,
        message: result.message,
        status: result.status || 500
      });
    }

    return json({
      success: true,
      data: result.memos || [],
      totalPages: result.totalPages || 1,
      currentPage: page,
      currentUser: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department
      },
      message: "Memos retrieved successfully"
    });
  } catch (error: any) {
    return json({
      success: false,
      message: error.message || "An error occurred",
      data: [],
      totalPages: 1,
      currentPage: 1
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    // Get current user for email sending
    const session = await getSession(request.headers.get("Cookie"));
    const token = session.get("email");
    const currentUser = token ? await Registration.findOne({ email: token }) : null;

    if (!currentUser) {
      return json({
        message: "User not authenticated",
        success: false,
        status: 401
      });
    }

    switch (intent) {
      case "create":
        const refNumber = formData.get("refNumber") as string;
        const fromDepartment = formData.get("fromDepartment") as string;
        const fromName = formData.get("fromName") as string;
        const memoDate = formData.get("memoDate") as string;
        const toDepartment = formData.get("toDepartment") as string;
        const toName = formData.get("toName") as string;
        const subject = formData.get("subject") as string;
        const memoType = formData.get("memoType") as string;
        const dueDate = formData.get("dueDate") as string;
        const frequency = formData.get("frequency") as string;
        const remark = formData.get("remark") as string;
        const ccDepartment = formData.get("ccDepartment") as string;
        const ccName = formData.get("ccName") as string;
        const base64Image = formData.get("base64Image") as string;
        const emailCheck = true; // Always true as requested

        const memo = await memoController.Memo({
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
        });
        return memo;

      case "update":
        const updateId = formData.get("id") as string;
        const updateRefNumber = formData.get("refNumber") as string;
        const updateFromDepartment = formData.get("fromDepartment") as string;
        const updateFromName = formData.get("fromName") as string;
        const updateMemoDate = formData.get("memoDate") as string;
        const updateToDepartment = formData.get("toDepartment") as string;
        const updateToName = formData.get("toName") as string;
        const updateSubject = formData.get("subject") as string;
        const updateMemoType = formData.get("memoType") as string;
        const updateDueDate = formData.get("dueDate") as string;
        const updateFrequency = formData.get("frequency") as string;
        const updateRemark = formData.get("remark") as string;
        const updateCcDepartment = formData.get("ccDepartment") as string;
        const updateCcName = formData.get("ccName") as string;
        const updateBase64Image = formData.get("base64Image") as string;
        const updateEmailCheck = true; // Always true

        const updateMemo = await memoController.UpdateMemo({
          id: updateId,
          refNumber: updateRefNumber,
          fromDepartment: updateFromDepartment,
          fromName: updateFromName,
          memoDate: updateMemoDate,
          toDepartment: updateToDepartment,
          toName: updateToName,
          subject: updateSubject,
          memoType: updateMemoType,
          dueDate: updateDueDate,
          frequency: updateFrequency,
          remark: updateRemark,
          ccDepartment: updateCcDepartment,
          ccName: updateCcName,
          emailCheck: updateEmailCheck,
          base64Image: updateBase64Image,
          currentUser,
        });
        return updateMemo;

      case "delete":
        const deleteId = formData.get("id") as string;
        const deleteMemo = await memoController.DeleteMemo({
          id: deleteId
        });
        return deleteMemo;

      default:
        return json({
          message: "Invalid intent",
          success: false,
          status: 400
        });
    }
  } catch (error: any) {
    return json({
      success: false,
      message: error.message || "An error occurred",
      status: 500
    });
  }
}
