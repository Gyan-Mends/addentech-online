import { Button, Card, Input, Select, SelectItem, Spinner, Tab, Tabs, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { DataTable } from "../components/DataTable";
import AdminLayout from "~/layout/adminLayout";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import monthlyReportController from "~/controller/monthlyReport";
import { ActionFunctionArgs } from "@remix-run/node";
import { BarChart, Calendar, FileText, Plus, Trash2, Edit, Eye } from "lucide-react";
import { useState } from "react";
import { commitSession, getSession } from "~/session";
import Registration from "~/modal/registration";
import Departments from "~/modal/department";
import type { DepartmentInterface } from "~/modal/department";
import type { RegistrationInterface } from "~/modal/registration";
import type { MonthlyReportInterface } from "~/modal/monthlyReport";

// Define type for loader data
interface LoaderData {
  currentUser: RegistrationInterface;
  data?: MonthlyReportInterface[];
  departments?: DepartmentInterface[];
  success?: boolean;
  message?: string;
  report?: MonthlyReportInterface;
}

// Define type for action data
interface ActionData {
  success: boolean;
  message: string;
  data?: any;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userEmail = session.get("email");
  
  // Check for user authorization
  if (!userEmail) {
    return redirect("/addentech-login");
  }
  
  // Get the user from database using email
  const currentUser = await Registration.findOne({ email: userEmail });
  if (!currentUser) {
    return redirect("/addentech-login");
  }

  const url = new URL(request.url);
  const departmentId = url.searchParams.get("department");
  const reportId = url.searchParams.get("id");

  if (reportId) {
    const reportData = await monthlyReportController.getReportById({ reportId });
    return json({
      ...reportData,
      currentUser
    });
  } else {
    let reportsResponse;
    
    // Handle reports based on role
    if (currentUser.role === "admin" || currentUser.role === "manager") {
      // Admin and managers can see all reports
      reportsResponse = await monthlyReportController.getAllReports();
    } else if (currentUser.role === "head") {
      // Department heads can see all reports from their department
      reportsResponse = await monthlyReportController.getReportsByDepartment({ 
        departmentId: currentUser.department, 
        user: currentUser 
      });
    } else {
      // Staff can only see reports they created
      reportsResponse = await monthlyReportController.getReportsByUser({ userId: currentUser._id });
    }
    
    // Get departments for the create report form
    const departments = await Departments.find().sort({ name: 1 });
    
    return json({
      data: reportsResponse.data,
      success: reportsResponse.success,
      message: reportsResponse.message,
      currentUser,
      departments
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userEmail = session.get("email");
  
  if (!userEmail) {
    return json({ success: false, message: "User not authenticated" });
  }
  
  // Get the user from database using email
  const user = await Registration.findOne({ email: userEmail });
  if (!user) {
    return json({ success: false, message: "User not found" });
  }

  const formData = await request.formData();
  const action = formData.get("_action") as string;

  if (action === "create") {
    // All roles can create reports
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
      user
    });
  } else if (action === "delete") {
    const reportId = formData.get("reportId") as string;
    return await monthlyReportController.deleteReport({ reportId, user });
  } else if (action === "approve") {
    const reportId = formData.get("reportId") as string;
    const actionType = formData.get("action") as string;
    const notes = formData.get("notes") as string;
    
    if (actionType === "approve") {
      return await monthlyReportController.approveReport({
        reportId,
        approvedBy: user._id,
        notes,
        user
      });
    } else if (actionType === "reject") {
      return await monthlyReportController.rejectReport({
        reportId,
        rejectedBy: user._id,
        notes,
        user
      });
    }
  }
  
  return json({ success: false, message: "Invalid action" });
};

export default function MonthlyReportsPage() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>() as LoaderData;
  const actionData = useActionData<typeof action>() as ActionData | undefined;
  
  const isLoading = navigation.state === "submitting";
  const [activeTab, setActiveTab] = useState("view");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MonthlyReportInterface | null>(null);
  
  // Get data from loader
  const { currentUser, departments, data: reportsData } = loaderData;
  const reports = reportsData || [];
  
  // Function to get month name
  const getMonthName = (month: number): string => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return monthNames[month - 1];
  };

  // Columns for reports table
  const columns = [
    {
      key: "department",
      label: "DEPARTMENT",
      render: (row: MonthlyReportInterface) => {
        return <span>{row.departmentName}</span>;
      }
    },
    {
      key: "month",
      label: "PERIOD",
      render: (row: MonthlyReportInterface) => {
        return <span>{getMonthName(row.month)} {row.year}</span>;
      }
    },
    {
      key: "type",
      label: "TYPE",
      render: (row: MonthlyReportInterface) => {
        return <span className="capitalize">{row.type}</span>;
      }
    },
    {
      key: "package",
      label: "PACKAGE",
      render: (row: MonthlyReportInterface) => {
        return <span className="capitalize">{row.subscriptionPackage}</span>;
      }
    },
    {
      key: "firms",
      label: "FIRMS",
      render: (row: MonthlyReportInterface) => {
        return <span>{row.numberOfFirms}</span>;
      }
    },
    {
      key: "users",
      label: "USERS",
      render: (row: MonthlyReportInterface) => {
        return <span>{row.numberOfUsers}</span>;
      }
    },
    {
      key: "amount",
      label: "AMOUNT (GHS)",
      render: (row: MonthlyReportInterface) => {
        return <span>{row.amount.toFixed(2)}</span>;
      }
    },
    {
      key: "status",
      label: "STATUS",
      render: (row: MonthlyReportInterface) => {
        const getStatusColor = () => {
          switch (row.status) {
            case "approved":
              return "text-green-500 bg-green-100";
            case "rejected":
              return "text-red-500 bg-red-100";
            case "pending":
              return "text-yellow-500 bg-yellow-100";
            default:
              return "text-gray-500 bg-gray-100";
          }
        };
        
        return (
          <span className={`py-1 px-2 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {row.status === "pending" ? "Pending" : row.status === "approved" ? "Approved" : "Rejected"}
          </span>
        );
      }
    },
    {
      key: "actions",
      label: "ACTIONS",
      render: (row: MonthlyReportInterface) => {
        // Check permissions based on user role and report status
        const canDelete = 
          (currentUser.role === "admin" || currentUser.role === "manager") || 
          ((currentUser.role === "head" || currentUser.role === "staff") && 
           currentUser._id.toString() === row.createdBy.toString());
        
        const canApproveReject = 
          (currentUser.role === "admin" || currentUser.role === "manager" || 
           (currentUser.role === "head" && currentUser.department.toString() === row.department.toString())) && 
          row.status === "pending";
        
        return (
          <div className="flex gap-2 justify-end">
            <Button 
              isIconOnly 
              size="sm" 
              color="primary" 
              variant="light"
              onClick={() => {
                // View report details (you can implement a view details modal)
                console.log("View report:", row);
              }}
            >
              <Eye size={16} />
            </Button>
            
            {canApproveReject && (
              <Button 
                isIconOnly 
                size="sm" 
                color="success" 
                variant="light"
                onClick={() => {
                  setSelectedReport(row);
                  setShowApprovalForm(true);
                }}
              >
                <Edit size={16} />
              </Button>
            )}
            
            {canDelete && (
              <Button 
                isIconOnly 
                size="sm" 
                color="danger" 
                variant="light"
                onClick={() => {
                  setSelectedReport(row);
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Monthly Reports
          </h1>
          {isLoading && <Spinner />}
        </div>

        {actionData && actionData.message && (
          <div className={`p-4 mb-4 rounded-md ${actionData.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {actionData.message}
          </div>
        )}

        <Tabs 
          selectedKey={activeTab} 
          onSelectionChange={(key) => setActiveTab(key as string)}
          aria-label="Report Tabs"
        >
          <Tab key="view" title="View Reports">
            <div className="py-4">
              <DataTable columns={columns} rows={reports || []} />
              
              {/* Delete Confirmation Modal */}
              <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Confirm Delete</ModalHeader>
                      <ModalBody>
                        <p>Are you sure you want to delete this report? This action cannot be undone.</p>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="default" variant="light" onPress={onClose}>
                          Cancel
                        </Button>
                        <Form method="post">
                          <input type="hidden" name="_action" value="delete" />
                          <input type="hidden" name="reportId" value={selectedReport?._id} />
                          <Button type="submit" color="danger" isLoading={isLoading}>
                            Delete
                          </Button>
                        </Form>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>

              {/* Approval Form Modal */}
              <Modal isOpen={showApprovalForm} onClose={() => setShowApprovalForm(false)}>
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">Review Report</ModalHeader>
                      <ModalBody>
                        <Form method="post">
                          <input type="hidden" name="_action" value="approve" />
                          <input type="hidden" name="reportId" value={selectedReport?._id} />
                          <Textarea
                            name="notes"
                            label="Review Notes"
                            placeholder="Add comments about this report"
                          />
                          <div className="flex justify-between gap-2 mt-4">
                            <Button 
                              type="submit" 
                              name="action" 
                              value="reject" 
                              color="danger" 
                              className="flex-1"
                              isLoading={isLoading}
                            >
                              Reject Report
                            </Button>
                            <Button
                              type="submit"
                              name="action"
                              value="approve"
                              color="success"
                              className="flex-1"
                              isLoading={isLoading}
                            >
                              Approve Report
                            </Button>
                          </div>
                        </Form>
                      </ModalBody>
                      <ModalFooter>
                        <Button type="button" variant="flat" onPress={onClose}>
                          Cancel
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          </Tab>

          <Tab key="create" title="Create Report">
            <div className="py-4">
              <Card className="p-6">
                <Form method="post">
                  <input type="hidden" name="_action" value="create" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Select
                        label="Department"
                        placeholder="Select department"
                        name="department"
                        isRequired
                        defaultSelectedKeys={currentUser.role === "head" && currentUser.department ? [currentUser.department.toString()] : []}
                        isDisabled={currentUser.role === "head"}
                      >
                        {departments?.map((dept: DepartmentInterface) => (
                          <SelectItem key={dept._id.toString()} value={dept._id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <Select 
                        label="Month" 
                        placeholder="Select month" 
                        name="month"
                        isRequired
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={(i + 1).toString()} value={(i + 1).toString()}>
                            {getMonthName(i + 1)}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <Select 
                        label="Year" 
                        placeholder="Select year" 
                        name="year"
                        isRequired
                      >
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - 2 + i;
                          return (
                            <SelectItem key={year.toString()} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </Select>
                    </div>
                    
                    <div>
                      <Select 
                        label="Report Type" 
                        placeholder="Select type" 
                        name="type"
                        isRequired
                      >
                        <SelectItem key="revenue" value="revenue">Revenue</SelectItem>
                        <SelectItem key="usage" value="usage">Usage</SelectItem>
                      </Select>
                    </div>
                    
                    <div>
                      <Select 
                        label="Subscription Package" 
                        placeholder="Select package" 
                        name="subscriptionPackage"
                        isRequired
                      >
                        <SelectItem key="basic" value="basic">Basic</SelectItem>
                        <SelectItem key="standard" value="standard">Standard</SelectItem>
                        <SelectItem key="premium" value="premium">Premium</SelectItem>
                      </Select>
                    </div>
                    
                    <div>
                      <Input 
                        type="number" 
                        label="Number of Firms" 
                        placeholder="Enter number of firms" 
                        name="numberOfFirms"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <Input 
                        type="number" 
                        label="Number of Users" 
                        placeholder="Enter number of users" 
                        name="numberOfUsers"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <Input 
                        type="number" 
                        label="Amount (GHS)" 
                        placeholder="Enter amount" 
                        name="amount"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Textarea 
                        label="Notes" 
                        placeholder="Enter notes about this report" 
                        name="notes"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" color="primary" isLoading={isLoading}>
                      Create Report
                    </Button>
                  </div>
                </Form>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
