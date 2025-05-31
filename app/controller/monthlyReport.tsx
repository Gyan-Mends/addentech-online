import { json } from "@remix-run/node";
import MonthlyReport from "~/modal/monthlyReport";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";

// Role-based access permissions
const canViewReport = (user: any, report: any) => {
  if (!user || !report) return false;
  
  // Admin and manager can view all reports
  if (user.role === "admin" || user.role === "manager") return true;
  
  // Department head can view all reports in their department
  if (user.role === "head" && user.department.toString() === report.department.toString()) return true;
  
  // Staff can only view reports they created
  if (user.role === "staff" && user.id.toString() === report.createdBy.toString()) return true;
  
  return false;
};

const canEditReport = (user: any, report: any) => {
  if (!user || !report) return false;
  
  // Admin and manager can edit all reports
  if (user.role === "admin" || user.role === "manager") return true;
  
  // Department head can edit all reports in their department
  if (user.role === "head" && user.department.toString() === report.department.toString()) return true;
  
  // Staff can only edit reports they created
  if (user.role === "staff" && user.id.toString() === report.createdBy.toString()) return true;
  
  return false;
};

const canDeleteReport = (user: any, report: any) => {
  if (!user || !report) return false;
  
  // Admin and manager can delete all reports
  if (user.role === "admin" || user.role === "manager") return true;
  
  // Department head and staff can only delete reports they created
  if ((user.role === "head" || user.role === "staff") && 
      user.id.toString() === report.createdBy.toString()) return true;
  
  return false;
};

class MonthlyReportController {
  async createReport({
    department,
    month,
    year,
    type,
    subscriptionPackage,
    numberOfFirms,
    numberOfUsers,
    amount,
    createdBy,
    notes,
    user,
  }: {
    department: string;
    month: number;
    year: number;
    type: string;
    subscriptionPackage: string;
    numberOfFirms: number;
    numberOfUsers: number;
    amount: number;
    createdBy: string;
    notes?: string;
    user: any;
  }) {
    try {
      // Check role-based permissions for creating reports
      // Department heads can only create reports for their department
      if (user.role === "head" && user.department.toString() !== department) {
        return json({
          message: "You can only create reports for your department",
          success: false,
          status: 403,
        });
      }
      
      // Check if report already exists
      const existingReport = await MonthlyReport.findOne({
        department,
        month,
        year,
        type,
      });

      if (existingReport) {
        return json({
          message: "Report for this department, month, year, and type already exists",
          success: false,
          status: 409,
        });
      }

      // Create new report
      const report = new MonthlyReport({
        department,
        month,
        year,
        type,
        subscriptionPackage,
        numberOfFirms,
        numberOfUsers,
        amount,
        createdBy,
        status: "draft",
        notes,
      });

      const savedReport = await report.save();

      if (savedReport) {
        return json({
          message: "Monthly report created successfully",
          success: true,
          status: 201,
          data: savedReport,
        });
      } else {
        return json({
          message: "Failed to create monthly report",
          success: false,
          status: 500,
        });
      }
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async updateReport({
    reportId,
    subscriptionPackage,
    numberOfFirms,
    numberOfUsers,
    amount,
    notes,
    status,
    user,
  }: {
    reportId: string;
    subscriptionPackage?: string;
    numberOfFirms?: number;
    numberOfUsers?: number;
    amount?: number;
    notes?: string;
    status?: string;
    user: any;
  }) {
    try {
      const report = await MonthlyReport.findById(reportId)
        .populate("department")
        .populate("createdBy");

      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
        });
      }
      
      // Check if user has permission to update this report
      if (!canEditReport(user, report)) {
        return json({
          message: "You don't have permission to update this report",
          success: false,
          status: 403,
        });
      }

      // Update fields if provided
      if (subscriptionPackage) report.subscriptionPackage = subscriptionPackage;
      if (numberOfFirms !== undefined) report.numberOfFirms = numberOfFirms;
      if (numberOfUsers !== undefined) report.numberOfUsers = numberOfUsers;
      if (amount !== undefined) report.amount = amount;
      if (notes) report.notes = notes;
      if (status) report.status = status;

      const updatedReport = await report.save();

      if (updatedReport) {
        return json({
          message: "Report updated successfully",
          success: true,
          status: 200,
          data: updatedReport,
        });
      } else {
        return json({
          message: "Failed to update report",
          success: false,
          status: 500,
        });
      }
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getReportsByDepartment({ departmentId, user }: { departmentId: string, user?: any }) {
    try {
      // For department heads, enforce they can only access their own department
      if (user && user.role === "head" && user.department.toString() !== departmentId) {
        return json({
          message: "You can only view reports from your department",
          success: false,
          status: 403,
        });
      }
      
      const reports = await MonthlyReport.find({ department: departmentId })
        .populate("department", "name")
        .populate("createdBy", "firstName lastName")
        .sort({ year: -1, month: -1 });

      return json({
        message: "Reports retrieved successfully",
        success: true,
        status: 200,
        data: reports,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getReportById({ reportId }: { reportId: string }) {
    try {
      const report = await MonthlyReport.findById(reportId)
        .populate("department", "name")
        .populate("createdBy", "firstName lastName");

      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
        });
      }

      return json({
        message: "Report retrieved successfully",
        success: true,
        status: 200,
        data: report,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async getAllReports() {
    try {
      const reports = await MonthlyReport.find()
        .populate("department", "name")
        .populate("createdBy", "firstName lastName")
        .sort({ year: -1, month: -1 });

      return json({
        message: "All reports retrieved successfully",
        success: true,
        status: 200,
        data: reports,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Get reports created by a specific user
  async getReportsByUser({ userId }: { userId: string }) {
    try {
      const reports = await MonthlyReport.find({ createdBy: userId })
        .populate("department", "name")
        .populate("createdBy", "firstName lastName")
        .sort({ year: -1, month: -1 });

      return json({
        message: "User reports retrieved successfully",
        success: true,
        status: 200,
        data: reports,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  // Delete a report
  async deleteReport({ reportId, user }: { reportId: string, user: any }) {
    try {
      const report = await MonthlyReport.findById(reportId)
        .populate("department")
        .populate("createdBy");
      
      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
        });
      }
      
      // Check if user has permission to delete this report
      if (!canDeleteReport(user, report)) {
        return json({
          message: "You don't have permission to delete this report",
          success: false,
          status: 403,
        });
      }
      
      const result = await MonthlyReport.findByIdAndDelete(reportId);

      return json({
        message: "Report deleted successfully",
        success: true,
        status: 200,
      });
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async submitReport({ reportId, user }: { reportId: string, user: any }) {
    try {
      const report = await MonthlyReport.findById(reportId)
        .populate("department")
        .populate("createdBy");

      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
        });
      }
      
      // Check if user has permission to submit this report
      if (!canEditReport(user, report)) {
        return json({
          message: "You don't have permission to submit this report",
          success: false,
          status: 403,
        });
      }

      report.status = "submitted";
      const updatedReport = await report.save();

      if (updatedReport) {
        return json({
          message: "Report submitted successfully",
          success: true,
          status: 200,
          data: updatedReport,
        });
      } else {
        return json({
          message: "Failed to submit report",
          success: false,
          status: 500,
        });
      }
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }

  async approveOrRejectReport({ 
    reportId, 
    status, 
    notes,
    user 
  }: { 
    reportId: string; 
    status: "approved" | "rejected"; 
    notes?: string;
    user: any 
  }) {
    try {
      // Only admin and managers can approve/reject reports
      if (user.role !== "admin" && user.role !== "manager") {
        return json({
          message: "You don't have permission to approve or reject reports",
          success: false,
          status: 403,
        });
      }
      
      const report = await MonthlyReport.findById(reportId);

      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
        });
      }

      if (report.status !== "submitted") {
        return json({
          message: "Only submitted reports can be approved or rejected",
          success: false,
          status: 400,
        });
      }

      report.status = status;
      if (notes) report.notes = notes;
      
      const updatedReport = await report.save();

      if (updatedReport) {
        return json({
          message: `Report ${status} successfully`,
          success: true,
          status: 200,
          data: updatedReport,
        });
      } else {
        return json({
          message: `Failed to ${status} report`,
          success: false,
          status: 500,
        });
      }
    } catch (error: any) {
      return json({
        message: error.message,
        success: false,
        status: 500,
      });
    }
  }
}

const monthlyReportController = new MonthlyReportController();
export default monthlyReportController;
