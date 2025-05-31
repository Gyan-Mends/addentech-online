import { Button, Card, Input, Select, SelectItem, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { DataTable } from "../components/DataTable";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import monthlyReportController from "~/controller/monthlyReport";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { ActionFunctionArgs } from "@remix-run/node";
import { BarChart, Calendar, FileText, Plus } from "lucide-react";
import { commitSession, getSession } from "~/session";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('MONTHLY REPORTS LOADER CALLED - SIMPLIFIED VERSION');
  
  try {
    // Get a minimal user session check
    const session = await getSession(request.headers.get("Cookie"));
    const userEmail = session.get("email");
    
    // TEMPORARY: If no email in session, create a default user for testing
    let user;
    if (userEmail) {
      user = await Registration.findOne({ email: userEmail });
    }
    
   
    
    console.log('Using user:', user);
    
    // Set up headers to clear flash messages
    const headers = {
      "Set-Cookie": await commitSession(session)
    };
    
    const url = new URL(request.url);
    const departmentId = url.searchParams.get("department");
    const reportId = url.searchParams.get("id");

    // Get all reports and extract the data from the Response object
    const reportsResponse = await monthlyReportController.getAllReports();
    // Convert the Response to JSON to access the data property
    const reportsData = await reportsResponse.json();
    console.log('Reports Data:', reportsData);
    
    // Fetch all departments for the dropdown
    const departments = await Departments.find().sort({ name: 1 });
    console.log('Departments fetched:', departments.length);
    
    let reportResponse;
    
    if (reportId) {
      reportResponse = await monthlyReportController.getReportById({ reportId });
    } else if (departmentId) {
      reportResponse = await monthlyReportController.getReportsByDepartment({ departmentId });
    } else {
      // Get all reports for all users
      reportResponse = await monthlyReportController.getAllReports();
    }
    
    // Extract the data from the Response object
    const result = await reportResponse.json() as { 
      message: string; 
      success: boolean; 
      status: number; 
      data: any[]; 
    };
    console.log('Result from controller:', result);
    // Extract data from the result
    const extractedReports = result.data || [];
    console.log('Reports data extracted:', extractedReports);
    console.log('Is data array?', Array.isArray(extractedReports));
    
    return json({
      success: true,
      message: "Reports loaded successfully",
      reports: extractedReports, // Using the extracted data
      currentUser: user,
      departments: departments || []
    }, { headers });
  } catch (error) {
    console.error('Error in monthly reports loader:', error);
    // Even on error, return an empty successful response to prevent redirects
    return json({
      success: true,
      message: "No reports found",
      reports: [],
      currentUser: { role: 'unknown' }, // Fixed: user is not defined in this scope
      departments: []
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userEmail = session.get("email");
  
  if (!userEmail) {
    return json({ success: false, message: "User not authenticated" });
  }
  
  // Get the full user object from the database
  const user = await Registration.findOne({ email: userEmail });
  if (!user) {
    return json({ success: false, message: "User not found" });
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create") {
    console.log('Processing create report action');
    
    // Collect all form data entries into an object
    const formDataObj: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      // Skip the _action field as it's just for routing
      if (key !== '_action') {
        formDataObj[key] = value;
      }
    }
    
    // Add the user ID to the form data
    formDataObj.createdBy = user._id;
    
    console.log('Sending form data to controller:', formDataObj);
    
    // Pass all form data to the controller which will determine the department type
    return await monthlyReportController.createReport(formDataObj);
  } else if (action === "update") {
    console.log('Processing update report action');
    
    // Collect all form data entries into an object
    const formDataObj: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      // Skip the _action field as it's just for routing
      if (key !== '_action') {
        formDataObj[key] = value;
      }
    }
    
    // Make sure we have the reportId
    const reportId = formData.get("reportId") as string;
    if (!reportId) {
      return json({
        success: false,
        message: "Report ID is required for updates",
        status: 400
      });
    }
    
    // Add user information for audit purposes
    formDataObj.updatedBy = user._id;
    
    console.log('Sending update data to controller:', formDataObj);
    
    return await monthlyReportController.updateReport(formDataObj);
  } else if (action === "submit") {
    console.log('Processing submit report action');
    
    // Collect basic form data for submission
    const formDataObj: Record<string, any> = {};
    formDataObj.reportId = formData.get("reportId") as string;
    formDataObj.submittedBy = user._id;
    formDataObj.notes = formData.get("notes") as string;
    
    console.log('Sending submit data to controller:', formDataObj);
    
    return await monthlyReportController.submitReport(formDataObj);
    
  } else if (action === "approve") {
    console.log('Processing approve report action');
    
    // Check if user has admin or manager role
    if (user.role !== 'admin' && user.role !== 'manager') {
      return json({
        success: false,
        message: "Only administrators and managers can approve reports",
        status: 403
      });
    }
    
    // Collect form data for approval
    const formDataObj: Record<string, any> = {};
    formDataObj.reportId = formData.get("reportId") as string;
    formDataObj.approvedBy = user._id;
    formDataObj.notes = formData.get("notes") as string;
    
    console.log('Sending approve data to controller:', formDataObj);
    
    return await monthlyReportController.approveReport(formDataObj);
    
  } else if (action === "reject") {
    console.log('Processing reject report action');
    
    // Check if user has admin or manager role
    if (user.role !== 'admin' && user.role !== 'manager') {
      return json({
        success: false,
        message: "Only administrators and managers can reject reports",
        status: 403
      });
    }
    
    // Collect form data for rejection
    const formDataObj: Record<string, any> = {};
    formDataObj.reportId = formData.get("reportId") as string;
    formDataObj.rejectedBy = user._id;
    formDataObj.notes = formData.get("notes") as string;
    formDataObj.rejectionReason = formData.get("rejectionReason") as string;
    
    console.log('Sending reject data to controller:', formDataObj);
    
    return await monthlyReportController.rejectReport(formDataObj);
  } else if (action === "analyze") {
    console.log('Processing AI analysis request');
    
    // Collect report data for analysis
    const reportId = formData.get("reportId") as string;
    
    if (!reportId) {
      return json({
        success: false,
        message: "Report ID is required for analysis",
        status: 400
      });
    }
    
    try {
      // Get the report data
      const report = await MonthlyReport.findById(reportId)
        .populate("department", "name")
        .populate("createdBy", "firstName lastName");
        
      if (!report) {
        return json({
          success: false,
          message: "Report not found",
          status: 404
        });
      }
      
      // AI analysis would be performed on the server in a real implementation
      // Here we'll return a success response since the analysis is simulated client-side
      return json({
        success: true,
        message: "Report analysis completed",
        status: 200,
        data: report
      });
    } catch (error: any) {
      console.error('Error analyzing report:', error);
      return json({
        success: false,
        message: error.message || "Error analyzing report",
        status: 500
      });
    }
  }

  return json({ success: false, message: "Invalid action" });
};

export default function MonthlyReportsPage() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState("view");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showAiAnalysisModal, setShowAiAnalysisModal] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isLoading = navigation.state === "loading";

  // Get current date for form defaults
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-11
  const currentYear = currentDate.getFullYear();

  // Helper function to get month name
  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };
  
  // Handle department change
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
  };
  
  // Helper function to determine if the user can view a report
  const canViewReport = (report: any) => {
    if (!currentUser) return false;
    
    // Admin and manager can see all reports
    if ((currentUser as any).role === 'admin' || (currentUser as any).role === 'manager') {
      return true;
    }
    
    // Department head can see all reports from their department
    if ((currentUser as any).role === 'department_head' && 
        (currentUser as any).department && 
        report.department && 
        (currentUser as any).department.toString() === report.department._id?.toString()) {
      return true;
    }
    
    // Staff can only see reports they created
    if ((currentUser as any)._id && report.createdBy && 
        (currentUser as any)._id.toString() === report.createdBy._id?.toString()) {
      return true;
    }
    
    return false;
  };
  
  // Helper function to determine if the user can edit a report
  const canEditReport = (report: any) => {
    if (!currentUser) return false;
    
    // Admin and manager can edit all reports
    if ((currentUser as any).role === 'admin' || (currentUser as any).role === 'manager') {
      return true;
    }
    
    // Others can only edit their own reports in draft status
    if (report.status === 'draft' && 
        (currentUser as any)._id && 
        report.createdBy && 
        (currentUser as any)._id.toString() === report.createdBy._id?.toString()) {
      return true;
    }
    
    return false;
  };
  
  // Helper function to determine if the user can submit a report
  const canSubmitReport = (report: any) => {
    // Only reports in draft status can be submitted
    if (report.status !== 'draft') return false;
    
    // Same rules as editing
    return canEditReport(report);
  };
  
  // Helper function to determine if the user can review (approve/reject) a report
  const canReviewReport = (report: any) => {
    if (!currentUser) return false;
    
    // Only admin, manager, and department head can review reports
    if (report.status !== 'submitted') return false;
    
    // Admin and manager can review any submitted report
    if ((currentUser as any).role === 'admin' || (currentUser as any).role === 'manager') {
      return true;
    }
    
    // Department head can only review reports from their department that they didn't create
    if ((currentUser as any).role === 'department_head' && 
        (currentUser as any).department && 
        report.department && 
        (currentUser as any).department.toString() === report.department._id?.toString() &&
        report.createdBy && 
        (currentUser as any)._id.toString() !== report.createdBy._id?.toString()) {
      return true;
    }
    
    return false;
  };
  
  // Handle AI analysis of reports
  const handleAiAnalysis = async (report: any) => {
    try {
      setIsAnalyzing(true);
      setAiAnalysisResult("");
      
      // Prepare the report data for analysis
      const submit = useSubmit();
      const formData = new FormData();
      formData.append("_action", "analyze");
      formData.append("reportId", report._id);
      
      // Submit to the action function
      submit(formData, { method: "post" });
      
      // For immediate feedback, we'll simulate the analysis with a predefined response
      // In a real implementation, this would come from the server response
      setTimeout(() => {
        // Generate analysis based on department type
        let analysis = "";
        
        if (report.departmentType === "data") {
          analysis = `
            <h3>Data Department Report Analysis</h3>
            <p>Based on the analysis of your report for ${getMonthName(report.month)} ${report.year}, here are the key insights:</p>
            <ul>
              <li><strong>Subscription Growth:</strong> Your ${report.subscriptionPackage} package has ${report.numberOfFirms} firms with ${report.numberOfUsers} users, generating ₵${report.amount.toLocaleString()}.</li>
              <li><strong>User Adoption Rate:</strong> ${(report.numberOfUsers / report.numberOfFirms).toFixed(2)} users per firm, which is ${(report.numberOfUsers / report.numberOfFirms) > 3 ? 'above' : 'below'} the industry average.</li>
              <li><strong>Revenue per User:</strong> ₵${(report.amount / report.numberOfUsers).toFixed(2)} per user, indicating ${(report.amount / report.numberOfUsers) > 500 ? 'strong' : 'moderate'} monetization.</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Consider ${(report.numberOfUsers / report.numberOfFirms) < 3 ? 'increasing user adoption within existing firms' : 'expanding to new firms'} to optimize growth.</li>
              <li>The revenue trend compared to previous months suggests ${report.amount > 50000 ? 'continued growth' : 'potential for optimization'}.</li>
            </ul>
          `;
        } else if (report.departmentType === "software") {
          analysis = `
            <h3>Software Department Report Analysis</h3>
            <p>Analysis of your ${report.projectName} project:</p>
            <ul>
              <li><strong>Development Efficiency:</strong> ${report.developmentHours} hours spent on a project currently in "${report.projectStatus}" status.</li>
              <li><strong>Hourly Rate:</strong> ₵${(report.amount / report.developmentHours).toFixed(2)} per development hour.</li>
              <li><strong>Project Health:</strong> ${report.projectStatus === 'completed' ? 'Project completed successfully' : report.projectStatus === 'testing' ? 'Project in final stages' : 'Project in active development'}.</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>${report.developmentHours > 200 ? 'Consider reviewing scope to prevent scope creep' : 'Current resource allocation appears optimal'}.</li>
              <li>Based on industry standards, your hourly rate is ${(report.amount / report.developmentHours) > 100 ? 'competitive' : 'below market average'}.</li>
            </ul>
          `;
        } else if (report.departmentType === "customer_service") {
          const resolutionRate = (report.resolvedTickets / report.totalTickets) * 100;
          analysis = `
            <h3>Customer Service Report Analysis</h3>
            <p>Key performance indicators for ${getMonthName(report.month)} ${report.year}:</p>
            <ul>
              <li><strong>Ticket Resolution Rate:</strong> ${resolutionRate.toFixed(1)}% (${report.resolvedTickets} of ${report.totalTickets} tickets resolved).</li>
              <li><strong>Average Response Time:</strong> ${report.averageResponseTime} hours, which is ${report.averageResponseTime < 4 ? 'excellent' : report.averageResponseTime < 8 ? 'acceptable' : 'needs improvement'}.</li>
              <li><strong>Customer Satisfaction:</strong> ${report.customerSatisfaction}%, indicating ${report.customerSatisfaction > 85 ? 'high customer loyalty' : report.customerSatisfaction > 70 ? 'moderate satisfaction' : 'potential concerns'}.</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>${resolutionRate < 90 ? 'Focus on improving ticket resolution processes' : 'Maintain current resolution efficiency'}.</li>
              <li>${report.averageResponseTime > 6 ? 'Implement measures to reduce response time' : 'Continue current response strategies'}.</li>
              <li>${report.customerSatisfaction < 80 ? 'Consider additional customer satisfaction initiatives' : 'Share successful satisfaction strategies across teams'}.</li>
            </ul>
          `;
        } else if (report.departmentType === "news") {
          const viewsPerArticle = report.totalViews / report.articlesPublished;
          analysis = `
            <h3>News Department Report Analysis</h3>
            <p>Content performance metrics for ${getMonthName(report.month)} ${report.year}:</p>
            <ul>
              <li><strong>Content Production:</strong> ${report.articlesPublished} articles published, generating ${report.totalViews.toLocaleString()} total views.</li>
              <li><strong>Average Views per Article:</strong> ${viewsPerArticle.toFixed(0)}, which is ${viewsPerArticle > 5000 ? 'excellent' : viewsPerArticle > 2000 ? 'good' : 'below target'}.</li>
              <li><strong>Subscriber Conversion:</strong> ${report.newSubscribers} new subscribers (${(report.newSubscribers / report.totalViews * 10000).toFixed(2)}% conversion rate).</li>
              <li><strong>Revenue Generation:</strong> ₵${report.revenue.toLocaleString()}, averaging ₵${(report.revenue / report.articlesPublished).toFixed(2)} per article.</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>${viewsPerArticle < 3000 ? 'Review content strategy to increase engagement' : 'Continue successful content approach'}.</li>
              <li>${(report.newSubscribers / report.totalViews) < 0.001 ? 'Enhance subscriber conversion mechanisms' : 'Maintain effective subscriber acquisition strategies'}.</li>
              <li>${(report.revenue / report.articlesPublished) < 1000 ? 'Explore additional monetization channels' : 'Optimize current revenue streams'}.</li>
            </ul>
          `;
        } else {
          // General analysis for other departments
          analysis = `
            <h3>Department Report Analysis</h3>
            <p>Analysis for ${getMonthName(report.month)} ${report.year}:</p>
            <ul>
              <li><strong>${report.metric1}:</strong> ${report.value1}</li>
              <li><strong>${report.metric2}:</strong> ${report.value2}</li>
              <li><strong>Total Revenue:</strong> ₵${report.amount.toLocaleString()}</li>
            </ul>
            <p><strong>Recommendations:</strong></p>
            <ul>
              <li>Consider tracking additional metrics to enable more detailed analysis.</li>
              <li>Implement month-over-month comparison to identify trends.</li>
              <li>Establish key performance indicators specific to your department's goals.</li>
            </ul>
          `;
        }
        
        setAiAnalysisResult(analysis);
        setIsAnalyzing(false);
      }, 2000); // Simulate 2-second analysis time
      
    } catch (error) {
      console.error('Error during AI analysis:', error);
      setAiAnalysisResult('<p class="text-red-500">Error analyzing report. Please try again.</p>');
      setIsAnalyzing(false);
    }
  };

  // Get the user info and reports data from the loader
  const { currentUser, reports = [], departments = [] } = loaderData || {};
  
  // Set the user's department automatically for security
  useEffect(() => {
    if (currentUser && (currentUser as any).department) {
      setSelectedDepartment((currentUser as any).department.toString());
    }
  }, [currentUser]);
  
  console.log('Monthly Reports Page Data:', loaderData);
  console.log('Reports from loaderData:', reports);
  console.log('Current User:', currentUser);
  console.log('Reports Data:', reports);
  console.log('Departments:', departments);
  
  // Columns for reports table
  const columns = [
    {
      key: "department",
      label: "DEPARTMENT",
      render: (row: any) => {
        const department = row.department || {};
        return department.name || "Unknown";
      },
    },
    {
      key: "month",
      label: "PERIOD",
      render: (row: any) => {
        return `${getMonthName(row.month)} ${row.year}`;
      },
    },
    {
      key: "type",
      label: "TYPE",
      render: (row: any) => {
        return row.type;
      },
    },
    {
      key: "package",
      label: "PACKAGE",
      render: (row: any) => {
        return row.subscriptionPackage;
      },
    },
    {
      key: "firms",
      label: "FIRMS",
      render: (row: any) => {
        return row.numberOfFirms;
      },
    },
    {
      key: "users",
      label: "USERS",
      render: (row: any) => {
        return row.numberOfUsers;
      },
    },
    {
      key: "amount",
      label: "AMOUNT (GHS)",
      render: (row: any) => {
        return `₵${row.amount.toLocaleString()}`;
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (row: any) => {
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              row.status === "approved"
                ? "bg-green-100 text-green-800"
                : row.status === "rejected"
                ? "bg-red-100 text-red-800"
                : row.status === "submitted"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row: any) => {
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              color="primary"
              className="bg-pink-500"
              onClick={() => {
                setSelectedReport(row);
                setActiveTab("edit");
              }}
            >
              Edit
            </Button>
            {row.status === "draft" && (
              <Form method="post">
                <input type="hidden" name="reportId" value={row._id} />
                <input type="hidden" name="_action" value="submit" />
                <Button
                  size="sm"
                  color="success"
                  type="submit"
                  isLoading={isLoading}
                >
                  Submit
                </Button>
              </Form>
            )}
            {row.status === "submitted" && 
              // Only show Review button to admin and manager roles
              ((currentUser as any).role === 'admin' || (currentUser as any).role === 'manager') && (
                <Button
                  size="sm"
                  color="warning"
                  onClick={() => {
                    setSelectedReport(row);
                    setShowApprovalForm(true);
                  }}
                >
                  Review
                </Button>
              )
            }
            {/* AI Analysis button - available for all reports */}
            <Button
              size="sm"
              color="secondary"
              onClick={() => {
                setSelectedReport(row);
                setShowAiAnalysisModal(true);
              }}
            >
              AI Analysis
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Monthly Sales Reports
          </h1>
        </div>

        {actionData && (
          <div
            className={`mb-4 p-4 rounded-md ${
              actionData.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {actionData.message}
          </div>
        )}

        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-6"
        >
          <Tab
            key="view"
            title={
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>View Reports</span>
              </div>
            }
          />
          <Tab
            key="create"
            title={
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Report</span>
              </div>
            }
          />
          <Tab
            key="edit"
            title={
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Edit Report</span>
              </div>
            }
          />
          <Tab
            key="analytics"
            title={
              <div className="flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </div>
            }
          />
        </Tabs>

        {activeTab === "view" && (
          <>
            {/* Filter controls */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Filter Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  type="date"
                  label="From Date"
                  placeholder="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  type="date"
                  label="To Date"
                  placeholder="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Select
                  label="Department"
                  placeholder="All Departments"
                  selectedKeys={selectedDepartment ? [selectedDepartment] : []}
                  onSelectionChange={(keys) => {
                    const keysArray = Array.from(keys);
                    setSelectedDepartment(keysArray[0]?.toString() || '');
                  }}
                >
                  <SelectItem key="" value="">All Departments</SelectItem>
                  {departments?.map((dept: any) => (
                    <SelectItem key={dept._id.toString()} value={dept._id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </Select>
                <Button 
                  color="primary" 
                  className="self-end"
                  onClick={() => {
                    // Reset filters
                    setStartDate('');
                    setEndDate('');
                    setSelectedDepartment('');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <>
                {/* Debug info to verify data */}
                <div className="mb-4 p-2 bg-gray-50 rounded">
                  <details>
                    <summary className="text-sm text-gray-500 cursor-pointer">Debug Report Data</summary>
                    <pre className="text-xs overflow-auto max-h-40 p-2">
                      {JSON.stringify(reports, null, 2)}
                    </pre>
                  </details>
                </div>
                
                {/* Filter reports based on permissions and selected filters */}
                {(() => {
                  // Filter reports based on user permissions
                  let filteredReports = Array.isArray(reports) ? reports.filter(canViewReport) : [];
                  
                  // Apply department filter
                  if (selectedDepartment) {
                    filteredReports = filteredReports.filter(report => 
                      report.department && report.department._id?.toString() === selectedDepartment
                    );
                  }
                  
                  // Apply date filters if provided
                  if (startDate || endDate) {
                    filteredReports = filteredReports.filter(report => {
                      // Convert year and month to date string for comparison
                      const reportDate = new Date(report.year, report.month - 1, 1);
                      const reportDateStr = reportDate.toISOString().split('T')[0];
                      
                      if (startDate && endDate) {
                        return reportDateStr >= startDate && reportDateStr <= endDate;
                      } else if (startDate) {
                        return reportDateStr >= startDate;
                      } else if (endDate) {
                        return reportDateStr <= endDate;
                      }
                      return true;
                    });
                  }
                  
                  if (filteredReports.length > 0) {
                    return (
                      <>
                        <DataTable
                          columns={columns}
                          data={filteredReports}
                          pagination
                          search
                        />
                      </>
                    );
                  } else {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No reports found.</p>
                      </div>
                    );
                  }
                })()}
              </>
            )}
          </>
        )}

        {activeTab === "create" && (
          <Form method="post" className="space-y-4 max-w-3xl mx-auto">
            <input type="hidden" name="_action" value="create" />
            
            {/* Hidden department field - automatically set to user's department */}
            <input type="hidden" name="department" value={selectedDepartment} />
            
            {/* Display the department name (read-only) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="text-sm font-medium">Department</label>
                <div className="p-2 border rounded mt-1 bg-gray-100">
                  {departments.find((dept: any) => dept._id.toString() === selectedDepartment)?.name || 'Loading...'}
                </div>
              </div>
              <Select
                name="month"
                label="Month"
                placeholder="Select month"
                defaultSelectedKeys={[`${currentMonth}`]}
                isRequired
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                  <SelectItem key={month} value={month}>
                    {getMonthName(month)}
                  </SelectItem>
                ))}
              </Select>
              <Input
                name="year"
                label="Year"
                placeholder="Enter year"
                defaultValue={`${currentYear}`}
                isRequired
              />
              <Input
                name="type"
                label="Type"
                placeholder="e.g., Firm Subscription"
                isRequired
              />
            </div>
            
            {/* Department-specific fields */}
            {selectedDepartment && (() => {
              // Find the selected department name
              const dept = departments.find((d: any) => d._id.toString() === selectedDepartment);
              const deptName = dept?.name || '';
              
              // Data Department Form Fields
              if (deptName.toLowerCase().includes('data')) {
                return (
                  <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                    <div className="col-span-2">
                      <h3 className="text-md font-medium mb-2">Data Department Fields</h3>
                    </div>
                    <Input
                      name="subscriptionPackage"
                      label="Subscription Package"
                      placeholder="e.g., Premium, Standard"
                      defaultValue="Standard" // Default value to prevent required error
                      isRequired
                    />
                    <Input
                      name="numberOfFirms"
                      type="number"
                      min="0"
                      label="Number of Firms"
                      placeholder="Enter number of firms"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="numberOfUsers"
                      type="number"
                      min="0"
                      label="Number of Users"
                      placeholder="Enter number of users"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="amount"
                      type="number"
                      min="0"
                      label="Amount (GHS)"
                      placeholder="Enter amount"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                  </div>
                );
              }
              
              // Software Department Form Fields
              else if (deptName.toLowerCase().includes('software') || deptName.toLowerCase().includes('it')) {
                return (
                  <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                    <div className="col-span-2">
                      <h3 className="text-md font-medium mb-2">Software Department Fields</h3>
                    </div>
                    <Input
                      name="projectName"
                      label="Project Name"
                      placeholder="Enter project name"
                      defaultValue="Default Project" // Default value
                      isRequired
                    />
                    <Input
                      name="developmentHours"
                      type="number"
                      min="0"
                      label="Development Hours"
                      placeholder="Enter development hours"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Select
                      name="projectStatus"
                      label="Project Status"
                      placeholder="Select status"
                      defaultSelectedKeys={["planning"]} // Default selected value
                      isRequired
                    >
                      <SelectItem key="planning" value="planning">Planning</SelectItem>
                      <SelectItem key="in-progress" value="in-progress">In Progress</SelectItem>
                      <SelectItem key="testing" value="testing">Testing</SelectItem>
                      <SelectItem key="completed" value="completed">Completed</SelectItem>
                    </Select>
                    <Input
                      name="amount"
                      type="number"
                      min="0"
                      label="Amount (GHS)"
                      placeholder="Enter amount"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                  </div>
                );
              }
              
              // Customer Services Department Form Fields
              else if (deptName.toLowerCase().includes('customer') || deptName.toLowerCase().includes('service')) {
                return (
                  <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                    <div className="col-span-2">
                      <h3 className="text-md font-medium mb-2">Customer Services Fields</h3>
                    </div>
                    <Input
                      name="totalTickets"
                      type="number"
                      min="0"
                      label="Total Tickets"
                      placeholder="Enter total tickets"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="resolvedTickets"
                      type="number"
                      min="0"
                      label="Resolved Tickets"
                      placeholder="Enter resolved tickets"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="averageResponseTime"
                      type="number"
                      min="0"
                      label="Avg. Response Time (hrs)"
                      placeholder="Enter average response time"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="customerSatisfaction"
                      type="number"
                      label="Customer Satisfaction (%)"
                      placeholder="Enter satisfaction percentage"
                      min="0"
                      max="100"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                  </div>
                );
              }
              
              // News Department Form Fields
              else if (deptName.toLowerCase().includes('news')) {
                return (
                  <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                    <div className="col-span-2">
                      <h3 className="text-md font-medium mb-2">News Department Fields</h3>
                    </div>
                    <Input
                      name="articlesPublished"
                      type="number"
                      min="0"
                      label="Articles Published"
                      placeholder="Enter number of articles"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="totalViews"
                      type="number"
                      min="0"
                      label="Total Views"
                      placeholder="Enter total views"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="newSubscribers"
                      type="number"
                      min="0"
                      label="New Subscribers"
                      placeholder="Enter new subscribers"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="revenue"
                      type="number"
                      min="0"
                      label="Revenue (GHS)"
                      placeholder="Enter revenue"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                  </div>
                );
              }
              
              // Default fields for other departments
              else {
                return (
                  <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                    <div className="col-span-2">
                      <h3 className="text-md font-medium mb-2">Default Department Fields</h3>
                    </div>
                    <Input
                      name="metric1"
                      label="Key Metric 1"
                      placeholder="Enter key metric"
                      defaultValue="Key Metric" // Default value
                      isRequired
                    />
                    <Input
                      name="value1"
                      type="number"
                      min="0"
                      label="Value 1"
                      placeholder="Enter value"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                    <Input
                      name="metric2"
                      label="Key Metric 2"
                      placeholder="Enter key metric"
                      defaultValue="Key Metric" // Default value
                      isRequired
                    />
                    <Input
                      name="value2"
                      type="number"
                      min="0"
                      label="Value 2"
                      placeholder="Enter value"
                      defaultValue="0" // Default value to prevent NaN error
                      isRequired
                    />
                  </div>
                );
              }
            })()}
            
            <Textarea
              name="notes"
              label="Notes"
              placeholder="Additional notes or comments"
            />
            
            <Button
              type="submit"
              className="bg-pink-500 text-white"
              isLoading={isLoading}
            >
              Create Report
            </Button>
          </Form>
        )}

        {activeTab === "edit" && selectedReport && (
          <Form method="post" className="space-y-4 max-w-3xl mx-auto">
            <input type="hidden" name="_action" value="update" />
            <input type="hidden" name="reportId" value={selectedReport._id} />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="department"
                label="Department"
                value={selectedReport.department?.name || ""}
                isReadOnly
              />
              <Input
                name="month"
                label="Month"
                value={getMonthName(selectedReport.month)}
                isReadOnly
              />
              <Input
                name="year"
                label="Year"
                value={selectedReport.year}
                isReadOnly
              />
              <Input
                name="type"
                label="Type"
                value={selectedReport.type}
                isReadOnly
              />
              <Input
                name="subscriptionPackage"
                label="Subscription Package"
                defaultValue={selectedReport.subscriptionPackage}
                isDisabled={selectedReport.status !== "draft"}
              />
              <Input
                name="numberOfFirms"
                type="number"
                label="Number of Firms"
                defaultValue={selectedReport.numberOfFirms}
                isDisabled={selectedReport.status !== "draft"}
              />
              <Input
                name="numberOfUsers"
                type="number"
                label="Number of Users"
                defaultValue={selectedReport.numberOfUsers}
                isDisabled={selectedReport.status !== "draft"}
              />
              <Input
                name="amount"
                type="number"
                label="Amount (GHS)"
                defaultValue={selectedReport.amount}
                isDisabled={selectedReport.status !== "draft"}
              />
            </div>
            <Textarea
              name="notes"
              label="Notes"
              placeholder="Additional notes or comments"
              defaultValue={selectedReport.notes || ""}
              isDisabled={selectedReport.status !== "draft"}
            />
            {selectedReport.status === "draft" && (
              <Button
                type="submit"
                className="bg-pink-500 text-white"
                isLoading={isLoading}
              >
                Update Report
              </Button>
            )}
          </Form>
        )}

        {activeTab === "analytics" && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Analytics feature coming soon. This will show charts and trends of monthly sales data.
            </p>
          </div>
        )}

        {showApprovalForm && selectedReport && (
          <Card className="max-w-3xl mx-auto p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Review Report</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p>{selectedReport.department?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p>{getMonthName(selectedReport.month)} {selectedReport.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p>{selectedReport.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Package</p>
                <p>{selectedReport.subscriptionPackage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Firms</p>
                <p>{selectedReport.numberOfFirms}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Users</p>
                <p>{selectedReport.numberOfUsers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount (GHS)</p>
                <p>₵{selectedReport.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="capitalize">{selectedReport.status}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Notes</p>
              <p>{selectedReport.notes || "No notes provided"}</p>
            </div>
            
            <Form method="post" className="space-y-4">
              <input type="hidden" name="reportId" value={selectedReport._id} />
              <Textarea
                name="notes"
                label="Review Notes"
                placeholder="Add comments about this report"
              />
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  name="_action"
                  value="approve"
                  color="success"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Approve Report
                </Button>
                <Button
                  type="submit"
                  name="_action"
                  value="reject"
                  color="danger"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  Reject Report
                </Button>
                <Button
                  type="button"
                  color="default"
                  onClick={() => setShowApprovalForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* AI Analysis Modal */}
        {showAiAnalysisModal && selectedReport && (
          <Card className="max-w-3xl mx-auto p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">AI Report Analysis</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p>{selectedReport.department?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p>{getMonthName(selectedReport.month)} {selectedReport.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p>{selectedReport.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount (GHS)</p>
                <p>₵{selectedReport.amount.toLocaleString()}</p>
              </div>
            </div>
            
            {!isAnalyzing && !aiAnalysisResult && (
              <div className="text-center p-6">
                <p className="text-gray-700 mb-4">Run AI analysis on this report to get insights and recommendations.</p>
                <Button
                  color="secondary"
                  className="mx-auto"
                  onClick={() => handleAiAnalysis(selectedReport)}
                  isLoading={isAnalyzing}
                >
                  Run Analysis
                </Button>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="text-center p-6">
                <Spinner size="lg" color="secondary" />
                <p className="mt-4 text-gray-600">Analyzing report data...</p>
              </div>
            )}
            
            {aiAnalysisResult && !isAnalyzing && (
              <div className="mt-4">
                <h4 className="text-lg font-medium mb-2">Analysis Results</h4>
                <div className="p-4 bg-gray-50 rounded-md">
                  <div dangerouslySetInnerHTML={{ __html: aiAnalysisResult }} />
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    color="secondary"
                    variant="light"
                    onClick={() => {
                      setAiAnalysisResult("");
                      handleAiAnalysis(selectedReport);
                    }}
                  >
                    Regenerate
                  </Button>
                  <Button
                    color="default"
                    onClick={() => {
                      setShowAiAnalysisModal(false);
                      setAiAnalysisResult("");
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
            
            {!isAnalyzing && (
              <div className="mt-4 flex justify-end">
                {!aiAnalysisResult && (
                  <Button
                    color="default"
                    onClick={() => setShowAiAnalysisModal(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
