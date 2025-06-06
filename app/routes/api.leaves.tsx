import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { getSession } from "~/session";
import Registration from "~/modal/registration";
import Leave, { LeaveStatus, LeaveTypes } from "~/modal/leave";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");

    if (!email) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await Registration.findOne({ email });
    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "balance":
        // Get leave balance for the user
        const leaveType = url.searchParams.get("leaveType");
        const balance = await Leave.getLeaveBalance(user._id.toString(), leaveType || undefined);
        return json({ balance });

      case "upcoming":
        // Get upcoming leaves for user's department
        const days = parseInt(url.searchParams.get("days") || "30");
        const upcomingLeaves = await Leave.getUpcomingLeaves(
          user.role === 'department_head' ? user.department._id.toString() : undefined,
          days
        );
        return json({ upcomingLeaves });

      case "conflicts":
        // Check for leave conflicts
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const excludeId = url.searchParams.get("excludeId");

        if (!startDate || !endDate) {
          return json({ error: "Start date and end date are required" }, { status: 400 });
        }

        const conflictQuery: any = {
          employee: user._id,
          status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
          $or: [
            { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(startDate) } },
            { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(endDate) } },
            { startDate: { $gte: new Date(startDate) }, endDate: { $lte: new Date(endDate) } }
          ]
        };

        if (excludeId) {
          conflictQuery._id = { $ne: excludeId };
        }

        const conflicts = await Leave.find(conflictQuery);
        return json({ conflicts: conflicts.length > 0, conflictingLeaves: conflicts });

      case "stats":
        // Get leave statistics
        const year = parseInt(url.searchParams.get("year") || new Date().getFullYear().toString());
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);

        let statsQuery: any = {
          submissionDate: { $gte: startOfYear, $lte: endOfYear }
        };

        // Apply role-based filtering
        if (user.role === 'department_head') {
          statsQuery.department = user.department;
        } else if (!['admin', 'manager'].includes(user.role)) {
          statsQuery.employee = user._id;
        }

        const [totalApplications, pendingApplications, approvedApplications, rejectedApplications] = await Promise.all([
          Leave.countDocuments(statsQuery),
          Leave.countDocuments({ ...statsQuery, status: LeaveStatus.PENDING }),
          Leave.countDocuments({ ...statsQuery, status: LeaveStatus.APPROVED }),
          Leave.countDocuments({ ...statsQuery, status: LeaveStatus.REJECTED })
        ]);

        // Get leave type breakdown
        const leaveTypeStats = await Leave.aggregate([
          { $match: statsQuery },
          { $group: { _id: "$leaveType", count: { $sum: 1 }, totalDays: { $sum: "$totalDays" } } },
          { $sort: { count: -1 } }
        ]);

        return json({
          stats: {
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            leaveTypeStats
          }
        });

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in leaves API:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export const action: ActionFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const email = session.get("email");

    if (!email) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await Registration.findOne({ email });
    if (!user) {
      return json({ error: "User not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const action = formData.get("action") as string;

    switch (action) {
      case "bulk-approve":
        // Bulk approve leaves (admin/manager only)
        if (!['admin', 'manager'].includes(user.role)) {
          return json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const approveIds = JSON.parse(formData.get("leaveIds") as string);
        const approveComments = formData.get("comments") as string;

        const approveResults = await Promise.allSettled(
          approveIds.map(async (id: string) => {
            const leave = await Leave.findById(id);
            if (leave && leave.status === LeaveStatus.PENDING) {
              return await leave.approve(user._id.toString(), approveComments);
            }
            return null;
          })
        );

        const approveSuccessCount = approveResults.filter(result => result.status === 'fulfilled').length;
        
        return json({ 
          success: `${approveSuccessCount} leave applications approved successfully`,
          processed: approveSuccessCount,
          total: approveIds.length
        });

      case "bulk-reject":
        // Bulk reject leaves (admin/manager only)
        if (!['admin', 'manager'].includes(user.role)) {
          return json({ error: "Insufficient permissions" }, { status: 403 });
        }

        const rejectIds = JSON.parse(formData.get("leaveIds") as string);
        const rejectComments = formData.get("comments") as string;

        if (!rejectComments) {
          return json({ error: "Comments are required for rejection" }, { status: 400 });
        }

        const rejectResults = await Promise.allSettled(
          rejectIds.map(async (id: string) => {
            const leave = await Leave.findById(id);
            if (leave && leave.status === LeaveStatus.PENDING) {
              return await leave.reject(user._id.toString(), rejectComments);
            }
            return null;
          })
        );

        const rejectSuccessCount = rejectResults.filter(result => result.status === 'fulfilled').length;
        
        return json({ 
          success: `${rejectSuccessCount} leave applications rejected successfully`,
          processed: rejectSuccessCount,
          total: rejectIds.length
        });

      case "update-leave":
        // Update existing leave (employee only, pending leaves only)
        const leaveId = formData.get("leaveId") as string;
        const leave = await Leave.findById(leaveId);

        if (!leave) {
          return json({ error: "Leave application not found" }, { status: 404 });
        }

        if (leave.employee.toString() !== user._id.toString()) {
          return json({ error: "Unauthorized" }, { status: 403 });
        }

        if (leave.status !== LeaveStatus.PENDING) {
          return json({ error: "Can only update pending leave applications" }, { status: 400 });
        }

        // Update fields
        const updateData: any = {};
        
        const leaveType = formData.get("leaveType");
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");
        const reason = formData.get("reason");
        const priority = formData.get("priority");
        const handoverTo = formData.get("handoverTo");
        const handoverNotes = formData.get("handoverNotes");

        if (leaveType) updateData.leaveType = leaveType;
        if (startDate) updateData.startDate = new Date(startDate as string);
        if (endDate) updateData.endDate = new Date(endDate as string);
        if (reason) updateData.reason = reason;
        if (priority) updateData.priority = priority;
        if (handoverTo) updateData.handoverTo = handoverTo;
        if (handoverNotes) updateData.handoverNotes = handoverNotes;

        // Validate dates if provided
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          
          if (end < start) {
            return json({ error: "End date cannot be before start date" }, { status: 400 });
          }

          // Check for conflicts
          const conflictingLeave = await Leave.findOne({
            employee: user._id,
            _id: { $ne: leaveId },
            status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
            $or: [
              { startDate: { $lte: start }, endDate: { $gte: start } },
              { startDate: { $lte: end }, endDate: { $gte: end } },
              { startDate: { $gte: start }, endDate: { $lte: end } }
            ]
          });

          if (conflictingLeave) {
            return json({ error: "Leave dates conflict with existing application" }, { status: 400 });
          }
        }

        await Leave.findByIdAndUpdate(leaveId, updateData);
        
        return json({ success: "Leave application updated successfully" });

      case "delete-leave":
        // Delete leave (employee only, pending leaves only)
        const deleteLeaveId = formData.get("leaveId") as string;
        const deleteLeave = await Leave.findById(deleteLeaveId);

        if (!deleteLeave) {
          return json({ error: "Leave application not found" }, { status: 404 });
        }

        if (deleteLeave.employee.toString() !== user._id.toString() && 
            !['admin', 'manager'].includes(user.role)) {
          return json({ error: "Unauthorized" }, { status: 403 });
        }

        if (deleteLeave.status !== LeaveStatus.PENDING) {
          return json({ error: "Can only delete pending leave applications" }, { status: 400 });
        }

        await Leave.findByIdAndDelete(deleteLeaveId);
        
        return json({ success: "Leave application deleted successfully" });

      case "export-leaves":
        // Export leaves data
        const exportQuery: any = {};
        const exportYear = formData.get("year");
        const exportDepartment = formData.get("department");
        const exportStatus = formData.get("status");

        // Apply role-based filtering
        if (user.role === 'department_head') {
          exportQuery.department = user.department;
        } else if (!['admin', 'manager'].includes(user.role)) {
          exportQuery.employee = user._id;
        }

        if (exportYear) {
          const year = parseInt(exportYear as string);
          exportQuery.submissionDate = {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31)
          };
        }

        if (exportDepartment && exportDepartment !== 'all') {
          exportQuery.department = exportDepartment;
        }

        if (exportStatus && exportStatus !== 'all') {
          exportQuery.status = exportStatus;
        }

        const exportLeaves = await Leave.find(exportQuery)
          .populate('employee', 'firstName lastName email')
          .populate('department', 'name')
          .sort({ submissionDate: -1 });

        return json({ 
          success: "Data exported successfully", 
          data: exportLeaves,
          count: exportLeaves.length
        });

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in leaves API action:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};