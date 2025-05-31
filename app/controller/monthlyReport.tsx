import { json } from "@remix-run/node";
import MonthlyReport from "~/modal/monthlyReport";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";

class MonthlyReportController {
  async createReport(formData: any) {
    try {
      console.log('Create report with form data:', formData);
      const { department, month, year, type, createdBy, notes } = formData;
      
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
      
      // Get department info to determine departmentType
      const departmentInfo = await Departments.findById(department);
      if (!departmentInfo) {
        return json({
          message: "Department not found",
          success: false,
          status: 404,
        });
      }
      
      // Determine department type based on department name
      let departmentType = "general";
      const deptName = departmentInfo.name.toLowerCase();
      
      if (deptName.includes('data')) {
        departmentType = "data";
      } else if (deptName.includes('software') || deptName.includes('it')) {
        departmentType = "software";
      } else if (deptName.includes('customer') || deptName.includes('service')) {
        departmentType = "customer_service";
      } else if (deptName.includes('news')) {
        departmentType = "news";
      }
      
      // Base report fields that all department types share
      const reportData = {
        department,
        month: parseInt(month),
        year: parseInt(year),
        type,
        amount: parseFloat(formData.amount || 0),
        createdBy,
        status: "draft",
        notes,
        departmentType,
        
        // Add default values for ALL possible fields to prevent validation errors
        // Data Department default fields
        subscriptionPackage: "N/A",
        numberOfFirms: 0,
        numberOfUsers: 0,
        
        // Software Department default fields
        projectName: "N/A",
        developmentHours: 0,
        projectStatus: "planning",
        
        // Customer Service Department default fields
        totalTickets: 0,
        resolvedTickets: 0,
        averageResponseTime: 0,
        customerSatisfaction: 0,
        
        // News Department default fields
        articlesPublished: 0,
        totalViews: 0,
        newSubscribers: 0,
        revenue: 0,
        
        // General Department default fields
        metric1: "N/A",
        value1: 0,
        metric2: "N/A",
        value2: 0
      };
      
      // Override with department-specific fields based on departmentType
      switch (departmentType) {
        case "data":
          Object.assign(reportData, {
            subscriptionPackage: formData.subscriptionPackage || "Standard",
            numberOfFirms: parseInt(formData.numberOfFirms || 0),
            numberOfUsers: parseInt(formData.numberOfUsers || 0)
          });
          break;
          
        case "software":
          Object.assign(reportData, {
            projectName: formData.projectName || "Default Project",
            developmentHours: parseInt(formData.developmentHours || 0),
            projectStatus: formData.projectStatus || "planning"
          });
          break;
          
        case "customer_service":
          Object.assign(reportData, {
            totalTickets: parseInt(formData.totalTickets || 0),
            resolvedTickets: parseInt(formData.resolvedTickets || 0),
            averageResponseTime: parseFloat(formData.averageResponseTime || 0),
            customerSatisfaction: parseInt(formData.customerSatisfaction || 0)
          });
          break;
          
        case "news":
          Object.assign(reportData, {
            articlesPublished: parseInt(formData.articlesPublished || 0),
            totalViews: parseInt(formData.totalViews || 0),
            newSubscribers: parseInt(formData.newSubscribers || 0),
            revenue: parseFloat(formData.revenue || 0)
          });
          break;
          
        case "general":
        default:
          Object.assign(reportData, {
            metric1: formData.metric1 || "Key Metric",
            value1: parseFloat(formData.value1 || 0),
            metric2: formData.metric2 || "Key Metric",
            value2: parseFloat(formData.value2 || 0)
          });
          break;
      }
      
      console.log('Creating report with data:', reportData);
      
      // Create new report with appropriate fields
      const report = new MonthlyReport(reportData);

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

  async updateReport(formData: any) {
    try {
      console.log('Update report with form data:', formData);
      const { reportId } = formData;
      
      if (!reportId) {
        return json({
          message: "Report ID is required",
          success: false,
          status: 400,
        });
      }
      
      // Find the existing report
      const report = await MonthlyReport.findById(reportId);
      if (!report) {
        return json({
          message: "Report not found",
          success: false,
          status: 404,
        });
      }
      
      // Get the department type from the existing report
      const departmentType = report.departmentType || 'general';
      
      // Prepare update object with base fields that can be updated for all reports
      const updateData: Record<string, any> = {};
      
      // Update basic fields if provided
      if (formData.notes) updateData.notes = formData.notes;
      if (formData.status) updateData.status = formData.status;
      if (formData.amount) updateData.amount = parseFloat(formData.amount);
      
      // Add department-specific fields based on the report's departmentType
      switch (departmentType) {
        case "data":
          if (formData.subscriptionPackage) updateData.subscriptionPackage = formData.subscriptionPackage;
          if (formData.numberOfFirms) updateData.numberOfFirms = parseInt(formData.numberOfFirms);
          if (formData.numberOfUsers) updateData.numberOfUsers = parseInt(formData.numberOfUsers);
          break;
          
        case "software":
          if (formData.projectName) updateData.projectName = formData.projectName;
          if (formData.developmentHours) updateData.developmentHours = parseInt(formData.developmentHours);
          if (formData.projectStatus) updateData.projectStatus = formData.projectStatus;
          break;
          
        case "customer_service":
          if (formData.totalTickets) updateData.totalTickets = parseInt(formData.totalTickets);
          if (formData.resolvedTickets) updateData.resolvedTickets = parseInt(formData.resolvedTickets);
          if (formData.averageResponseTime) updateData.averageResponseTime = parseFloat(formData.averageResponseTime);
          if (formData.customerSatisfaction) updateData.customerSatisfaction = parseInt(formData.customerSatisfaction);
          break;
          
        case "news":
          if (formData.articlesPublished) updateData.articlesPublished = parseInt(formData.articlesPublished);
          if (formData.totalViews) updateData.totalViews = parseInt(formData.totalViews);
          if (formData.newSubscribers) updateData.newSubscribers = parseInt(formData.newSubscribers);
          if (formData.revenue) updateData.revenue = parseFloat(formData.revenue);
          break;
          
        case "general":
        default:
          if (formData.metric1) updateData.metric1 = formData.metric1;
          if (formData.value1) updateData.value1 = parseFloat(formData.value1);
          if (formData.metric2) updateData.metric2 = formData.metric2;
          if (formData.value2) updateData.value2 = parseFloat(formData.value2);
          break;
      }
      
      console.log('Updating report with data:', updateData);
      
      // Update the report with a single operation
      const updatedReport = await MonthlyReport.findByIdAndUpdate(reportId, updateData, { new: true });

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
      console.log('Fetching all reports from MongoDB...');
      const reports = await MonthlyReport.find()
        .populate("department", "name")
        .populate("createdBy", "firstName lastName")
        .sort({ year: -1, month: -1 });
      
      console.log('MongoDB reports found:', reports.length);
      console.log('First report sample:', reports[0]);

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

  async submitReport(formData: any) {
    try {
      console.log('Submit report with form data:', formData);
      const reportId = formData.reportId;
      
      if (!reportId) {
        return json({
          message: "Report ID is required",
          success: false,
          status: 400,
        });
      }

      // Update with a single operation
      const updatedReport = await MonthlyReport.findByIdAndUpdate(
        reportId,
        { status: "submitted" },
        { new: true }
      );

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

  async approveReport(formData: any) {
    try {
      console.log('Approve report with form data:', formData);
      const reportId = formData.reportId;
      
      if (!reportId) {
        return json({
          message: "Report ID is required",
          success: false,
          status: 400,
        });
      }

      // Find the report first to verify its status
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
          message: "Only submitted reports can be approved",
          success: false,
          status: 400,
        });
      }

      // Update with a single operation
      const updatedReport = await MonthlyReport.findByIdAndUpdate(
        reportId,
        { 
          status: "approved",
          approvedBy: formData.approvedBy || null,
          approvedAt: new Date(),
          notes: formData.notes || report.notes
        },
        { new: true }
      );

      if (updatedReport) {
        return json({
          message: "Report approved successfully",
          success: true,
          status: 200,
          data: updatedReport,
        });
      } else {
        return json({
          message: "Failed to approve report",
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

  async rejectReport(formData: any) {
    try {
      console.log('Reject report with form data:', formData);
      const reportId = formData.reportId;
      
      if (!reportId) {
        return json({
          message: "Report ID is required",
          success: false,
          status: 400,
        });
      }

      // Find the report first to verify its status
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
          message: "Only submitted reports can be rejected",
          success: false,
          status: 400,
        });
      }

      // Update with a single operation
      const updatedReport = await MonthlyReport.findByIdAndUpdate(
        reportId,
        { 
          status: "rejected",
          rejectedBy: formData.rejectedBy || null,
          rejectedAt: new Date(),
          rejectionReason: formData.rejectionReason || "No reason provided",
          notes: formData.notes || report.notes
        },
        { new: true }
      );

      if (updatedReport) {
        return json({
          message: "Report rejected successfully",
          success: true,
          status: 200,
          data: updatedReport,
        });
      } else {
        return json({
          message: "Failed to reject report",
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
