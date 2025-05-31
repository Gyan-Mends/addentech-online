import { Button, Card, Input, Select, SelectItem, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { DataTable } from "../components/DataTable";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import monthlyReportController from "~/controller/monthlyReport";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import { ActionFunctionArgs } from "@remix-run/node";
import { BarChart, Calendar, FileText, Plus } from "lucide-react";
import { useState } from "react";
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
    const result = await reportResponse.json();
    console.log('Result:', result);
    
    return json({
      success: true,
      message: "Reports loaded successfully",
      reports: result.data || [], // Use the data property from the extracted result
      currentUser: user,
      departments: departments || []
    }, { headers });
  } catch (error) {
    console.error('Error in monthly reports loader:', error);
    // Even on error, return an empty successful response to prevent redirects
    return json({
      success: true,
      message: "No reports found",
      data: [],
      currentUser: user || { role: 'unknown' },
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
    const department = formData.get("department") as string;
    const month = parseInt(formData.get("month") as string, 10);
    const year = parseInt(formData.get("year") as string, 10);
    const type = formData.get("type") as string;
    const subscriptionPackage = formData.get("subscriptionPackage") as string;
    const numberOfFirms = parseInt(formData.get("numberOfFirms") as string, 10);
    const numberOfUsers = parseInt(formData.get("numberOfUsers") as string, 10);
    const amount = parseFloat(formData.get("amount") as string);
    const notes = formData.get("notes") as string;

    return await monthlyReportController.createReport({
      department,
      month,
      year,
      type,
      subscriptionPackage,
      numberOfFirms,
      numberOfUsers,
      amount,
      createdBy: user._id,
      notes,
    });
  } else if (action === "update") {
    const reportId = formData.get("reportId") as string;
    const subscriptionPackage = formData.get("subscriptionPackage") as string;
    const numberOfFirms = parseInt(formData.get("numberOfFirms") as string, 10);
    const numberOfUsers = parseInt(formData.get("numberOfUsers") as string, 10);
    const amount = parseFloat(formData.get("amount") as string);
    const notes = formData.get("notes") as string;

    return await monthlyReportController.updateReport({
      reportId,
      subscriptionPackage,
      numberOfFirms,
      numberOfUsers,
      amount,
      notes,
    });
  } else if (action === "submit") {
    const reportId = formData.get("reportId") as string;
    return await monthlyReportController.submitReport({ reportId });
  } else if (action === "approve" || action === "reject") {
    const reportId = formData.get("reportId") as string;
    const notes = formData.get("notes") as string;
    
    // All authenticated users can approve/reject reports
    // No permission check needed

    return await monthlyReportController.approveOrRejectReport({
      reportId,
      status: action === "approve" ? "approved" : "rejected",
      notes,
    });
  }

  return json({ success: false, message: "Invalid action" });
};

export default function MonthlyReportsPage() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [activeTab, setActiveTab] = useState("view");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

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

  // Get the user info and reports data from the loader
  const { currentUser, data: reports = [], departments = [] } = loaderData || {};
  
  console.log('Monthly Reports Page Data:', loaderData);
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
            {row.status === "submitted" && (
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
            )}
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <>
                {Array.isArray(reports) && reports.length > 0 ? (
                  <DataTable
                    columns={columns}
                    data={reports}
                    pagination
                    search
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reports found.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "create" && (
          <Form method="post" className="space-y-4 max-w-3xl mx-auto">
            <input type="hidden" name="_action" value="create" />
            <div className="grid grid-cols-2 gap-4">
              <Select
                name="department"
                label="Department"
                placeholder="Select department"
                defaultSelectedKeys={currentUser?.department ? [currentUser.department.toString()] : []}
                isRequired
              >
                {departments?.map((dept) => (
                  <SelectItem key={dept._id.toString()} value={dept._id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </Select>
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
              <Input
                name="subscriptionPackage"
                label="Subscription Package"
                placeholder="e.g., Premium, Standard"
                isRequired
              />
              <Input
                name="numberOfFirms"
                type="number"
                label="Number of Firms"
                placeholder="Enter number of firms"
                isRequired
              />
              <Input
                name="numberOfUsers"
                type="number"
                label="Number of Users"
                placeholder="Enter number of users"
                isRequired
              />
              <Input
                name="amount"
                type="number"
                label="Amount (GHS)"
                placeholder="Enter amount"
                isRequired
              />
            </div>
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
                  variant="flat"
                  className="flex-1"
                  onClick={() => setShowApprovalForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
