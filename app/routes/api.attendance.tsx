import { json } from "@remix-run/node";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import attendanceController from "~/controller/attendance";
import { getSession } from "~/session";
import Registration from "~/modal/registration";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get user session data
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");

    if (!userEmail) {
      return json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // Get current user info
    const currentUser = await Registration.findOne({ email: userEmail });
    if (!currentUser) {
      return json({ success: false, message: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const departmentId = url.searchParams.get("department") || (currentUser.department ? currentUser.department.toString() : null);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const userId = url.searchParams.get("userId");
    const action = url.searchParams.get("action");

    // Handle auto-checkout trigger
    if (action === "auto-checkout") {
      if (!["admin", "manager"].includes(currentUser.role)) {
        return json({ success: false, message: "Not authorized" }, { status: 403 });
      }
      const result = await attendanceController.performAutoCheckout();
      return json(result);
    }

    // Get attendance data based on user role and parameters
    let attendanceData = [];
    let message = "";

    // Only admins and managers can see all attendance records
    const canViewAllAttendance = ["admin", "manager"].includes(currentUser.role);

    if (!canViewAllAttendance) {
      // Non-admin/manager users can only see their own attendance
      let queryParams: { userId: string; startDate?: string; endDate?: string } = {
        userId: currentUser._id
      };

      // Add date filtering if provided
      if (startDate && endDate) {
        queryParams.startDate = startDate;
        queryParams.endDate = endDate;
      }

      // Get attendance data directly from the controller
      const result = await attendanceController.getUserAttendance(queryParams);
      attendanceData = result.data || [];
      message = result.message;
    } else {
      // Admin and Manager view
      if (startDate && endDate) {
        // Date range report
        const result = await attendanceController.getAttendanceReport({
          startDate,
          endDate,
          departmentId: departmentId || undefined
        });
        attendanceData = result.data || [];
        message = result.message;
      } else if (userId) {
        // View specific user's attendance
        const result = await attendanceController.getUserAttendance({
          userId
        });
        attendanceData = result.data || [];
        message = result.message;
      } else if (departmentId) {
        // View department attendance
        const result = await attendanceController.getAttendanceByDepartment({
          departmentId,
        });
        attendanceData = result.data || [];
        message = result.message;
      } else {
        // Default view for admins/managers - ALL attendance records
        try {
          const result = await attendanceController.getAttendanceReport({
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
          });
          attendanceData = result.data || [];
          message = result.message;
        } catch (error) {
          console.error('Error fetching all attendance:', error);
          message = "Error fetching attendance records";
          attendanceData = [];
        }
      }
    }

    return json({
      success: true,
      data: attendanceData,
      message: message || (attendanceData.length === 0 ? "No attendance records found" : "Attendance data retrieved successfully"),
      currentUser: {
        id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        role: currentUser.role,
        department: currentUser.department,
        workMode: currentUser.workMode || "in-house"
      },
      isAdmin: ["admin", "manager"].includes(currentUser.role)
    });
  } catch (error: any) {
    return json({
      success: false,
      message: error.message || "An error occurred",
      data: []
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Get the user session first
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");

    if (!userEmail) {
      return json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    // Get current user
    const currentUser = await Registration.findOne({ email: userEmail });
    if (!currentUser) {
      return json({ success: false, message: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const actionType = formData.get("action") as string;

    switch (actionType) {
      case "checkIn":
        try {
          // Use the current user's ID and department automatically
          const userId = currentUser._id.toString();
          const departmentId = currentUser.department.toString();
          const notes = formData.get("notes") as string;
          // Use the user's configured work mode
          const workMode = currentUser.workMode || "in-house";

          // Only get location if work mode is in-house
          let latitude, longitude;
          if (workMode === "in-house") {
            latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined;
            longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined;
          }

          // Validate required fields
          if (!userId || !departmentId) {
            return json({
              message: "Missing required user or department data",
              success: false,
              status: 400,
              debug: { userId, departmentId, workMode }
            });
          }

          // Call the controller method to check in
          const result = await attendanceController.checkIn({
            userId: currentUser._id,
            departmentId: currentUser.department,
            notes,
            workMode: currentUser.workMode,
            latitude: latitude ? parseFloat(latitude.toString()) : undefined,
            longitude: longitude ? parseFloat(longitude.toString()) : undefined,
            locationName: formData.get('locationName')?.toString() || 'Unknown location'
          });

          return result;
        } catch (error: any) {
          return json({
            message: `Check-in error: ${error.message}`,
            success: false,
            status: 500
          });
        }

      case "checkOut":
        const attendanceId = formData.get("attendanceId") as string;

        if (!attendanceId) {
          return json({ success: false, message: "Attendance ID is required for checkout" }, { status: 400 });
        }

        return await attendanceController.checkOut({
          attendanceId,
        });

      case "updateWorkMode":
        // Only admins and managers can update work modes
        if (!["admin", "manager"].includes(currentUser.role)) {
          return json({ success: false, message: "Not authorized" }, { status: 403 });
        }

        const targetUserId = formData.get("targetUserId") as string;
        const newWorkMode = formData.get("newWorkMode") as string;

        if (!targetUserId || !newWorkMode || !['in-house', 'remote'].includes(newWorkMode)) {
          return json({ success: false, message: "Invalid parameters" }, { status: 400 });
        }

        try {
          await Registration.findByIdAndUpdate(targetUserId, { workMode: newWorkMode });
          return json({ success: true, message: `Work mode updated to ${newWorkMode}` });
        } catch (error) {
          return json({ success: false, message: "Failed to update work mode" }, { status: 500 });
        }

      case "deleteAttendance":
        // Only admins and managers can delete attendance records
        if (!['admin', 'manager'].includes(currentUser.role)) {
          return json({ success: false, message: "You don't have permission to delete attendance records" }, { status: 403 });
        }

        const deleteAttendanceId = formData.get("attendanceId") as string;

        if (!deleteAttendanceId) {
          return json({ success: false, message: "Attendance ID is required for deletion" }, { status: 400 });
        }

        // Call the controller method to delete the attendance record
        const deleteResult = await attendanceController.deleteAttendance({
          attendanceId: deleteAttendanceId,
          userRole: currentUser.role
        });

        return json(deleteResult);

      case "autoCheckout":
        // Only admins and managers can trigger auto-checkout
        if (!["admin", "manager"].includes(currentUser.role)) {
          return json({ success: false, message: "Not authorized" }, { status: 403 });
        }

        const autoCheckoutResult = await attendanceController.performAutoCheckout();
        return json(autoCheckoutResult);

      default:
        return json({ success: false, message: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return json({
      success: false,
      message: error.message || "An error occurred",
      status: 500
    });
  }
}
