import { json } from "@remix-run/node";
import MonthlyReport from "~/modal/monthlyReport";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";

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
  }) {
    try {
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
  }: {
    reportId: string;
    subscriptionPackage?: string;
    numberOfFirms?: number;
    numberOfUsers?: number;
    amount?: number;
    notes?: string;
    status?: string;
  }) {
    try {
      const report = await MonthlyReport.findById(reportId);

      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
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

  async getReportsByDepartment({ departmentId }: { departmentId: string }) {
    try {
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

  async submitReport({ reportId }: { reportId: string }) {
    try {
      const report = await MonthlyReport.findById(reportId);

      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
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
    notes 
  }: { 
    reportId: string; 
    status: "approved" | "rejected"; 
    notes?: string 
  }) {
    try {
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
