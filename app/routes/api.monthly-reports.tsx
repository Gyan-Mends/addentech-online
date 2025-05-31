import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import MonthlyReport from "~/modal/monthlyReport";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const departmentId = url.searchParams.get("department");
    const reportId = url.searchParams.get("id");
    
    if (reportId) {
      const report = await MonthlyReport.findById(reportId)
        .populate("department", "name")
        .populate("createdBy", "firstName lastName email");
        
      if (!report) {
        return json({
          success: false,
          message: "Report not found",
          status: 404,
        });
      }
      
      return json({
        success: true,
        data: report,
        message: "Report retrieved successfully",
      });
    } 
    
    if (departmentId) {
      const reports = await MonthlyReport.find({ department: departmentId })
        .populate("department", "name")
        .populate("createdBy", "firstName lastName email")
        .sort({ year: -1, month: -1 });
        
      return json({
        success: true,
        data: reports,
        message: "Department reports retrieved successfully",
      });
    }
    
    // Get all reports
    const reports = await MonthlyReport.find()
      .populate("department", "name")
      .populate("createdBy", "firstName lastName email")
      .sort({ year: -1, month: -1 });
      
    return json({
      success: true,
      data: reports,
      message: "All reports retrieved successfully",
    });
  } catch (error: any) {
    return json({
      success: false,
      message: error.message,
      status: 500,
    });
  }
};
