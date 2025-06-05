import Leave, { LeaveTypes, LeaveStatus, LeavePriority } from "~/modal/leave";
import Registration from "~/modal/registration";
import Department from "~/modal/department";

export class LeaveController {
  // Create a new leave application
  static async createLeave(leaveData: any) {
    try {
      const leave = new Leave(leaveData);
      await leave.save();
      return { success: true, leave };
    } catch (error) {
      console.error("Error creating leave:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create leave" };
    }
  }

  // Get leaves based on user role and permissions
  static async getLeaves(userId: string, userRole: string, userDepartment?: string, filters: any = {}) {
    try {
      let query: any = {};

      // Apply role-based filtering
      if (userRole === 'admin' || userRole === 'manager') {
        // Admin and manager can see all leaves
        query = { ...filters };
      } else if (userRole === 'department_head' && userDepartment) {
        // Department head can see leaves from their department
        query = { department: userDepartment, ...filters };
      } else {
        // Staff can only see their own leaves
        query = { employee: userId, ...filters };
      }

      const leaves = await Leave.find(query)
        .populate('employee', 'firstName lastName email position')
        .populate('department', 'name')
        .populate('approvalWorkflow.approver', 'firstName lastName')
        .sort({ submissionDate: -1 });

      return { success: true, leaves };
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch leaves" };
    }
  }

  // Get pending approvals for a user
  static async getPendingApprovals(userId: string) {
    try {
      const leaves = await Leave.find({
        'approvalWorkflow.approver': userId,
        'approvalWorkflow.status': 'pending',
        status: LeaveStatus.PENDING
      })
      .populate('employee', 'firstName lastName email position')
      .populate('department', 'name')
      .sort({ submissionDate: 1 });

      return { success: true, leaves };
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch pending approvals" };
    }
  }

  // Approve a leave
  static async approveLeave(leaveId: string, approverId: string, comments?: string) {
    try {
      const leave = await Leave.findById(leaveId);
      if (!leave) {
        return { success: false, error: "Leave not found" };
      }

      await leave.approve(approverId, comments);
      return { success: true, leave };
    } catch (error) {
      console.error("Error approving leave:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to approve leave" };
    }
  }

  // Reject a leave
  static async rejectLeave(leaveId: string, approverId: string, comments: string) {
    try {
      const leave = await Leave.findById(leaveId);
      if (!leave) {
        return { success: false, error: "Leave not found" };
      }

      await leave.reject(approverId, comments);
      return { success: true, leave };
    } catch (error) {
      console.error("Error rejecting leave:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to reject leave" };
    }
  }

  // Update a leave application
  static async updateLeave(leaveId: string, updateData: any, userId: string, userRole: string) {
    try {
      const leave = await Leave.findById(leaveId);
      if (!leave) {
        return { success: false, error: "Leave not found" };
      }

      // Check if user can edit this leave
      if (!leave.canBeEditedBy(userId, userRole)) {
        return { success: false, error: "You don't have permission to edit this leave" };
      }

      Object.assign(leave, updateData);
      leave.modifiedBy = userId;
      await leave.save();

      return { success: true, leave };
    } catch (error) {
      console.error("Error updating leave:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to update leave" };
    }
  }

  // Cancel a leave application
  static async cancelLeave(leaveId: string, userId: string, userRole: string) {
    try {
      const leave = await Leave.findById(leaveId);
      if (!leave) {
        return { success: false, error: "Leave not found" };
      }

      // Check permissions
      if (leave.employee.toString() !== userId && userRole !== 'admin') {
        return { success: false, error: "You don't have permission to cancel this leave" };
      }

      leave.status = LeaveStatus.CANCELLED;
      leave.modifiedBy = userId;
      await leave.save();

      return { success: true, leave };
    } catch (error) {
      console.error("Error cancelling leave:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to cancel leave" };
    }
  }

  // Get leave statistics
  static async getLeaveStatistics(userRole: string, userId?: string, departmentId?: string) {
    try {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31);

      let matchQuery: any = {
        submissionDate: { $gte: startOfYear, $lte: endOfYear }
      };

      // Apply role-based filtering
      if (userRole === 'department_head' && departmentId) {
        matchQuery.department = departmentId;
      } else if (userRole === 'staff' && userId) {
        matchQuery.employee = userId;
      }

      const stats = await Leave.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            pendingCount: {
              $sum: { $cond: [{ $eq: ["$status", LeaveStatus.PENDING] }, 1, 0] }
            },
            approvedCount: {
              $sum: { $cond: [{ $eq: ["$status", LeaveStatus.APPROVED] }, 1, 0] }
            },
            rejectedCount: {
              $sum: { $cond: [{ $eq: ["$status", LeaveStatus.REJECTED] }, 1, 0] }
            },
            totalDaysRequested: { $sum: "$totalDays" },
            averageLeaveDays: { $avg: "$totalDays" }
          }
        }
      ]);

      const leaveTypeStats = await Leave.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$leaveType",
            count: { $sum: 1 },
            totalDays: { $sum: "$totalDays" }
          }
        }
      ]);

      return {
        success: true,
        statistics: stats[0] || {
          totalApplications: 0,
          pendingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          totalDaysRequested: 0,
          averageLeaveDays: 0
        },
        leaveTypeStats
      };
    } catch (error) {
      console.error("Error fetching leave statistics:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch statistics" };
    }
  }

  // Get leave balance for an employee
  static async getLeaveBalance(employeeId: string) {
    try {
      const balance = await Leave.getLeaveBalance(employeeId);
      return { success: true, balance };
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch leave balance" };
    }
  }

  // Get upcoming leaves
  static async getUpcomingLeaves(departmentId?: string, days = 30) {
    try {
      const leaves = await Leave.getUpcomingLeaves(departmentId, days);
      return { success: true, leaves };
    } catch (error) {
      console.error("Error fetching upcoming leaves:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch upcoming leaves" };
    }
  }

  // Check if user can perform an action on a leave
  static async checkPermission(leaveId: string, userId: string, userRole: string, action: string) {
    try {
      const leave = await Leave.findById(leaveId);
      if (!leave) {
        return { success: false, error: "Leave not found" };
      }

      let hasPermission = false;

      switch (action) {
        case 'view':
          hasPermission = leave.canBeViewedBy(userId, userRole);
          break;
        case 'edit':
          hasPermission = leave.canBeEditedBy(userId, userRole);
          break;
        case 'approve':
          hasPermission = leave.approvalWorkflow.some((step: any) =>
            step.approver.toString() === userId && step.status === 'pending'
          );
          break;
        case 'cancel':
          hasPermission = leave.employee.toString() === userId || userRole === 'admin';
          break;
        default:
          hasPermission = false;
      }

      return { success: true, hasPermission };
    } catch (error) {
      console.error("Error checking permission:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to check permission" };
    }
  }

  // Get leave calendar data
  static async getLeaveCalendar(year: number, month?: number, departmentId?: string) {
    try {
      const startDate = month 
        ? new Date(year, month - 1, 1)
        : new Date(year, 0, 1);
      
      const endDate = month
        ? new Date(year, month, 0) // Last day of the month
        : new Date(year, 11, 31); // Last day of the year

      let query: any = {
        status: LeaveStatus.APPROVED,
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ]
      };

      if (departmentId) {
        query.department = departmentId;
      }

      const leaves = await Leave.find(query)
        .populate('employee', 'firstName lastName')
        .populate('department', 'name')
        .sort({ startDate: 1 });

      return { success: true, leaves };
    } catch (error) {
      console.error("Error fetching leave calendar:", error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to fetch leave calendar" };
    }
  }
}

export default LeaveController;