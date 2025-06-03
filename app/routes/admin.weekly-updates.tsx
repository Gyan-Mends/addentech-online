import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Tabs, Tab, Card, CardBody, Button, Input,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, Spinner, Select, SelectItem
} from "@nextui-org/react";
import { FileText, Plus, Calendar, BarChart, Edit, Eye, Trash2, CheckCircle } from "lucide-react";
import { Form } from "@remix-run/react";
import AdminLayout from "~/layout/adminLayout";
import DataTable from "~/components/DataTable";
import CustomInput from "~/components/ui/CustomInput";
import RichEditor from "~/components/ui/RichEditor";
import { getSession } from "~/session";
import weeklyUpdateController from "~/controller/weeklyUpdate";
import WeeklyUpdate from "~/modal/weeklyUpdate";
import departmentController from "~/controller/departments";
import Registration from "~/modal/registration";
import department from "~/controller/departments";

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to get current week range (Monday to Friday)
const getCurrentWeekRange = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);
  
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  return {
    start: monday,
    end: friday,
    startFormatted: monday.toISOString().split('T')[0],
    endFormatted: friday.toISOString().split('T')[0]
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") as string) || 1;
  const search_term = url.searchParams.get("search_term") as string;
  // Get the current user session
  const session = await getSession(request.headers.get("Cookie"));
  const email = session.get("email");

  if (!email) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Fetch the complete user data from the database
  const user = await Registration.findOne({ email });
  
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  // Get current week information
  const weekInfo = weeklyUpdateController.getCurrentWeekInfo();

  // Get all departments
  const {departmentsResponse} = await department.getDepartments({ request, page, search_term });

  // Get updates based on user role
  let updates;
  if (user.role === "admin") {
    // Admins can see all updates
    const response = await weeklyUpdateController.getAllUpdates();
    updates = response.data;
   
  } else if (user.role === "manager") {
    // Managers can see updates from their department
    const response = await weeklyUpdateController.getUpdatesByDepartment(user.department);
    updates = response.data;
   
  } else if (user.role === "department_head") {
    // Department heads can see updates from their department
    const response = await weeklyUpdateController.getUpdatesByDepartment(user.department);
    updates = response.data;   
  } else {
    // Regular staff can only see their own updates
    const response = await weeklyUpdateController.getUpdatesByUser(user._id);
    updates = response.data;   
  }

  return json({
      user,
      weekInfo,
      departmentsResponse,
      updates,
  });
};

// Permission helper functions
const canViewUpdate = (update: any, user: any) => {
  // Admins, managers, and department heads can view all updates in their scope
  if (user.role === "admin") return true;
  
  // Managers and department heads can view updates from their department
  if (["manager", "department_head"].includes(user.role)) {
    return update.department._id.toString() === user.department.toString();
  }
  
  // Staff can only view their own updates
  return update.user._id.toString() === user._id.toString();
};

const canEditUpdate = (update: any, user: any) => {
  // Can only edit draft updates
  if (update.status !== "draft") return false;
  
  // Staff can only edit their own updates
  if (user.role === "staff") {
    return update.user._id.toString() === user._id.toString();
  }
  
  // Admins can edit any draft update
  if (user.role === "admin") return true;
  
  // Managers and department heads can edit updates from their department
  if (["manager", "department_head"].includes(user.role)) {
    return update.department._id.toString() === user.department.toString();
  }
  
  return false;
};

const canReviewUpdate = (update: any, user: any) => {
  // Only submitted updates can be reviewed
  if (update.status !== "submitted") return false;
  
  // Only admins, managers, and department heads can review
  if (!["admin", "manager", "department_head"].includes(user.role)) {
    return false;
  }
  
  // Admins can review any update
  if (user.role === "admin") return true;
  
  // Managers and department heads can only review updates from their department
  return update.department._id.toString() === user.department.toString();
};

const canDeleteUpdate = (update: any, user: any) => {
  // Can only delete draft updates
  if (update.status !== "draft") return false;
  
  // Admins can delete any draft update
  if (user.role === "admin") return true;
  
  // Users can only delete their own draft updates
  return update.user._id.toString() === user._id.toString();
};

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user" as any);

  if (!user) {
    return json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get("_action");

  console.log("Action:", action);

  switch (action) {
    case "create": {
      const data = {
        user: user._id,
        department: formData.get("department"),
        weekNumber: parseInt(formData.get("weekNumber") as string),
        year: parseInt(formData.get("year") as string),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        tasksCompleted: formData.get("tasksCompleted"),
        challengesFaced: formData.get("challengesFaced"),
        nextWeekPlans: formData.get("nextWeekPlans"),
        additionalNotes: formData.get("additionalNotes"),
      };
      return weeklyUpdateController.createUpdate(data);
    }

    case "update": {
      const data = {
        updateId: formData.get("updateId"),
        tasksCompleted: formData.get("tasksCompleted"),
        challengesFaced: formData.get("challengesFaced"),
        nextWeekPlans: formData.get("nextWeekPlans"),
        additionalNotes: formData.get("additionalNotes"),
      };
      return weeklyUpdateController.updateUpdate(data);
    }

    case "submit": {
      const data = {
        updateId: formData.get("updateId"),
        userId: user._id,
        tasksCompleted: formData.get("tasksCompleted"),
        challengesFaced: formData.get("challengesFaced"),
        nextWeekPlans: formData.get("nextWeekPlans"),
        additionalNotes: formData.get("additionalNotes"),
      };
      return weeklyUpdateController.submitUpdate(data);
    }

    case "review": {
      // Only managers, department heads, and admins can review
      if (!["admin", "manager", "department_head"].includes(user.role)) {
        return json({
          success: false,
          message: "You do not have permission to review updates",
        });
      }

      const data = {
        updateId: formData.get("updateId"),
        reviewerComments: formData.get("reviewerComments"),
        reviewerId: user._id,
      };
      return weeklyUpdateController.reviewUpdate(data);
    }

    case "delete": {
      const data = {
        updateId: formData.get("updateId"),
        userId: user._id,
      };
      return weeklyUpdateController.deleteUpdate(data);
    }

    default:
      return json({ success: false, message: "Invalid action" });
  }
};

// Main component
export default function WeeklyUpdatesPage() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const { user, weekInfo, departmentsResponse, updates } = useLoaderData<{ user: { user: string }, weekInfo: any, departmentsResponse: any, updates: any }>()
  
  // State for UI
  const [activeTab, setActiveTab] = useState("view");
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  
  // For the delete confirmation modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updateToDelete, setUpdateToDelete] = useState<any>(null);

  // Get current week range for new updates
  const weekRange = getCurrentWeekRange();
  
  // Reset selected update when changing tabs
  useEffect(() => {
    if (activeTab !== "edit" && activeTab !== "view-details") {
      setSelectedUpdate(null);
    }
  }, [activeTab]);

  // Table columns for the updates list
  const columns = [
    {
      key: "weekNumber",
      label: "WEEK",
      render: (row: any) => {
        return `Week ${row.weekNumber}, ${row.year}`;
      },
    },
    {
      key: "period",
      label: "PERIOD",
      render: (row: any) => {
        return `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`;
      },
    },
    {
      key: "user",
      label: "STAFF",
      render: (row: any) => {
        return row.user ? `${row.user.firstName} ${row.user.lastName}` : "Unknown";
      },
    },
    {
      key: "department",
      label: "DEPARTMENT",
      render: (row: any) => {
        return row.department ? row.department.name : "Unknown";
      },
    },
    {
      key: "status",
      label: "STATUS",
      render: (row: any) => {
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              row.status === "reviewed"
                ? "bg-green-100 text-green-800"
                : row.status === "submitted"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
            {/* View button - available for all viewable updates */}
            <Button
              size="sm"
              variant="light"
              color="primary"
              isIconOnly
              onClick={() => {
                setSelectedUpdate(row);
                setActiveTab("view-details");
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {/* Edit button - only for draft updates by the current user */}
            {canEditUpdate(row, user) && (
              <Button
                size="sm"
                variant="light"
                color="secondary"
                isIconOnly
                onClick={() => {
                  setSelectedUpdate(row);
                  setActiveTab("edit");
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* Submit button - only for draft updates by the current user */}
            {row.status === "draft" && row.user._id.toString() === user._id.toString() && (
              <Form method="post">
                <input type="hidden" name="updateId" value={row._id} />
                <input type="hidden" name="_action" value="submit" />
                <input type="hidden" name="tasksCompleted" value={row.tasksCompleted || ''} />
                <input type="hidden" name="challengesFaced" value={row.challengesFaced || ''} />
                <input type="hidden" name="nextWeekPlans" value={row.nextWeekPlans || ''} />
                <input type="hidden" name="additionalNotes" value={row.additionalNotes || ''} />
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

            {/* Review button - only for managers/heads/admins */}
            {canReviewUpdate(row, user) && (
              <Button
                size="sm"
                variant="flat"
                color="success"
                onClick={() => {
                  setSelectedUpdate(row);
                  setActiveTab("review");
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}

            {/* Delete button - only for admins or the user who created the draft */}
            {canDeleteUpdate(row, user) && (
              <Button
                size="sm"
                variant="light"
                color="danger"
                isIconOnly
                onClick={() => {
                  setUpdateToDelete(row);
                  onOpen();
                }}
              >
                <Trash2 className="h-4 w-4" />
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
            Weekly Progress Updates
          </h1>
        </div>

        {actionData && (
          <div
            className={`mb-4 p-4 rounded-md ${actionData.success
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
          className="mb-6 overflow-x-auto whitespace-nowrap flex flex-wrap scrollbar-hide"
        >
          <Tab
            key="view"
            title={
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sm:inline text-sm sm:text-base">View Updates</span>
              </div>
            }
          />
          <Tab
            key="create"
            title={
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sm:inline text-sm sm:text-base">Create Update</span>
              </div>
            }
          />
          {selectedUpdate && (
            <Tab
              key="edit"
              title={
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sm:inline text-sm sm:text-base">Edit Update</span>
                </div>
              }
            />
          )}
          {selectedUpdate && (
            <Tab
              key="view-details"
              title={
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sm:inline text-sm sm:text-base">View Details</span>
                </div>
              }
            />
          )}
          {selectedUpdate && canReviewUpdate(selectedUpdate, user) && (
            <Tab
              key="review"
              title={
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sm:inline text-sm sm:text-base">Review Update</span>
                </div>
              }
            />
          )}
          <Tab
            key="analytics"
            title={
              <div className="flex items-center space-x-2 sm:space-x-3">
                <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm sm:text-base">Analytics</span>
              </div>
            }
          />
        </Tabs>

        {/* Tab content based on active tab */}
        <div className="mt-4">
          {/* View tab - shows all updates with filters */}
          {activeTab === "view" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Department filter - only for admins */}
                {user.role === "admin" && (
                  <Select
                    label="Department"
                    placeholder="All Departments"
                    className="max-w-xs"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <SelectItem key="" value="">
                      All Departments
                    </SelectItem>
                    {departmentsResponse.map((dept: any) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}

                {/* Status filter */}
                <Select
                  label="Status"
                  placeholder="All Statuses"
                  className="max-w-xs"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <SelectItem key="" value="">
                    All Statuses
                  </SelectItem>
                  <SelectItem key="draft" value="draft">
                    Draft
                  </SelectItem>
                  <SelectItem key="submitted" value="submitted">
                    Submitted
                  </SelectItem>
                  <SelectItem key="reviewed" value="reviewed">
                    Reviewed
                  </SelectItem>
                </Select>

                {/* Week filter */}
                <Select
                  label="Week"
                  placeholder="Current Week"
                  className="max-w-xs"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                >
                  <SelectItem key="" value="">
                    All Weeks
                  </SelectItem>
                  <SelectItem key="current" value={`${weekInfo.weekNumber}-${weekInfo.year}`}>
                    Current Week ({weekInfo.weekNumber}/{weekInfo.year})
                  </SelectItem>
                  {/* Could add previous weeks dynamically here */}
                </Select>
              </div>

              {/* Data table */}
              <DataTable
                columns={columns}
                data={updates.filter((update: any) => {
                  // Apply department filter
                  if (selectedDepartment && update.department._id !== selectedDepartment) {
                    return false;
                  }
                  // Apply status filter
                  if (selectedStatus && update.status !== selectedStatus) {
                    return false;
                  }
                  // Apply week filter
                  if (selectedWeek) {
                    const [week, year] = selectedWeek.split('-');
                    if (
                      update.weekNumber.toString() !== week ||
                      update.year.toString() !== year
                    ) {
                      return false;
                    }
                  }
                  return true;
                })}
                emptyMessage="No weekly updates found"
              />
            </div>
          )}

          {/* Create tab - form to create a new update */}
          {activeTab === "create" && (
            <Card>
              <CardBody>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="_action" value="create" />
                  <input
                    type="hidden"
                    name="weekNumber"
                    value={weekInfo.weekNumber}
                  />
                  <input type="hidden" name="year" value={weekInfo.year} />
                  <input
                    type="hidden"
                    name="startDate"
                    value={weekRange.startFormatted}
                  />
                  <input
                    type="hidden"
                    name="endDate"
                    value={weekRange.endFormatted}
                  />

                  {/* Only admins can select department, others use their own */}
                  {user.role === "admin" ? (
                    <Select
                      label="Department"
                      placeholder="Select department"
                      name="department"
                      isRequired
                    >
                      {departments.map((dept: any) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </Select>
                  ) : (
                    <input
                      type="hidden"
                      name="department"
                      value={user.department}
                    />
                  )}

                  <div>
                    <h3 className="text-md font-semibold mb-2">Week {weekInfo.weekNumber}, {weekInfo.year}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {formatDate(weekRange.startFormatted)} - {formatDate(weekRange.endFormatted)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tasks Completed This Week
                      </label>
                      <RichEditor name="tasksCompleted" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Challenges Faced
                      </label>
                      <RichEditor name="challengesFaced" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plans for Next Week
                      </label>
                      <RichEditor name="nextWeekPlans" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <RichEditor name="additionalNotes" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={isLoading}
                    >
                      Save as Draft
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          )}

          {/* Edit tab - form to edit an existing update */}
          {activeTab === "edit" && selectedUpdate && (
            <Card>
              <CardBody>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="_action" value="update" />
                  <input
                    type="hidden"
                    name="updateId"
                    value={selectedUpdate._id}
                  />

                  <div>
                    <h3 className="text-md font-semibold mb-2">Week {selectedUpdate.weekNumber}, {selectedUpdate.year}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {formatDate(selectedUpdate.startDate)} - {formatDate(selectedUpdate.endDate)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tasks Completed This Week
                      </label>
                      <RichEditor
                        name="tasksCompleted"
                        defaultValue={selectedUpdate.tasksCompleted}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Challenges Faced
                      </label>
                      <RichEditor
                        name="challengesFaced"
                        defaultValue={selectedUpdate.challengesFaced}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plans for Next Week
                      </label>
                      <RichEditor
                        name="nextWeekPlans"
                        defaultValue={selectedUpdate.nextWeekPlans}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <RichEditor
                        name="additionalNotes"
                        defaultValue={selectedUpdate.additionalNotes}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      onClick={() => setActiveTab("view")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      isLoading={isLoading}
                    >
                      Update Draft
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          )}

          {/* View Details tab - detailed view of a selected update */}
          {activeTab === "view-details" && selectedUpdate && (
            <Card>
              <CardBody>
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Week {selectedUpdate.weekNumber}, {selectedUpdate.year}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {formatDate(selectedUpdate.startDate)} - {formatDate(selectedUpdate.endDate)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedUpdate.status === "reviewed"
                            ? "bg-green-100 text-green-800"
                            : selectedUpdate.status === "submitted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedUpdate.status.charAt(0).toUpperCase() + selectedUpdate.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Staff:</span>{" "}
                      <span className="font-medium">
                        {selectedUpdate.user
                          ? `${selectedUpdate.user.firstName} ${selectedUpdate.user.lastName}`
                          : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>{" "}
                      <span className="font-medium">
                        {selectedUpdate.department
                          ? selectedUpdate.department.name
                          : "Unknown"}
                      </span>
                    </div>
                    {selectedUpdate.status === "submitted" && (
                      <div>
                        <span className="text-gray-500">Submitted At:</span>{" "}
                        <span className="font-medium">
                          {formatDate(selectedUpdate.submittedAt)}
                        </span>
                      </div>
                    )}
                    {selectedUpdate.status === "reviewed" && (
                      <>
                        <div>
                          <span className="text-gray-500">Submitted At:</span>{" "}
                          <span className="font-medium">
                            {formatDate(selectedUpdate.submittedAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reviewed At:</span>{" "}
                          <span className="font-medium">
                            {formatDate(selectedUpdate.reviewedAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Reviewed By:</span>{" "}
                          <span className="font-medium">
                            {selectedUpdate.reviewer
                              ? `${selectedUpdate.reviewer.firstName} ${selectedUpdate.reviewer.lastName}`
                              : "Unknown"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <hr className="my-4" />

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-semibold mb-2">Tasks Completed This Week</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedUpdate.tasksCompleted || "None" }}
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-2">Challenges Faced</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedUpdate.challengesFaced || "None" }}
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-2">Plans for Next Week</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedUpdate.nextWeekPlans || "None" }}
                      />
                    </div>

                    {selectedUpdate.additionalNotes && (
                      <div>
                        <h4 className="text-md font-semibold mb-2">Additional Notes</h4>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedUpdate.additionalNotes }}
                        />
                      </div>
                    )}

                    {selectedUpdate.status === "reviewed" && selectedUpdate.reviewerComments && (
                      <div className="bg-blue-50 p-4 rounded-md">
                        <h4 className="text-md font-semibold mb-2">Reviewer Comments</h4>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedUpdate.reviewerComments }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      onClick={() => setActiveTab("view")}
                    >
                      Back to List
                    </Button>

                    {canEditUpdate(selectedUpdate, user) && (
                      <Button
                        color="secondary"
                        onClick={() => setActiveTab("edit")}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}

                    {selectedUpdate.status === "draft" && selectedUpdate.user._id.toString() === user._id.toString() && (
                      <Form method="post">
                        <input type="hidden" name="updateId" value={selectedUpdate._id} />
                        <input type="hidden" name="_action" value="submit" />
                        <input type="hidden" name="tasksCompleted" value={selectedUpdate.tasksCompleted || ''} />
                        <input type="hidden" name="challengesFaced" value={selectedUpdate.challengesFaced || ''} />
                        <input type="hidden" name="nextWeekPlans" value={selectedUpdate.nextWeekPlans || ''} />
                        <input type="hidden" name="additionalNotes" value={selectedUpdate.additionalNotes || ''} />
                        <Button
                          color="success"
                          type="submit"
                          isLoading={isLoading}
                        >
                          Submit Update
                        </Button>
                      </Form>
                    )}

                    {canReviewUpdate(selectedUpdate, user) && (
                      <Button
                        color="success"
                        onClick={() => setActiveTab("review")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}

                    {canDeleteUpdate(selectedUpdate, user) && (
                      <Button
                        color="danger"
                        onClick={() => {
                          setUpdateToDelete(selectedUpdate);
                          onOpen();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Review tab - form to review a submitted update */}
          {activeTab === "review" && selectedUpdate && canReviewUpdate(selectedUpdate, user) && (
            <Card>
              <CardBody>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="_action" value="review" />
                  <input
                    type="hidden"
                    name="updateId"
                    value={selectedUpdate._id}
                  />

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Review Weekly Update
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Week {selectedUpdate.weekNumber}, {selectedUpdate.year} ({formatDate(selectedUpdate.startDate)} - {formatDate(selectedUpdate.endDate)})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Staff:</span>{" "}
                      <span className="font-medium">
                        {selectedUpdate.user
                          ? `${selectedUpdate.user.firstName} ${selectedUpdate.user.lastName}`
                          : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>{" "}
                      <span className="font-medium">
                        {selectedUpdate.department
                          ? selectedUpdate.department.name
                          : "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>{" "}
                      <span className="font-medium">
                        {formatDate(selectedUpdate.submittedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 mb-4">
                    <div>
                      <h4 className="text-md font-semibold mb-2">Tasks Completed This Week</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedUpdate.tasksCompleted || "None" }}
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-2">Challenges Faced</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedUpdate.challengesFaced || "None" }}
                      />
                    </div>

                    <div>
                      <h4 className="text-md font-semibold mb-2">Plans for Next Week</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedUpdate.nextWeekPlans || "None" }}
                      />
                    </div>

                    {selectedUpdate.additionalNotes && (
                      <div>
                        <h4 className="text-md font-semibold mb-2">Additional Notes</h4>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: selectedUpdate.additionalNotes }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Review Comments
                    </label>
                    <RichEditor name="reviewerComments" />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      onClick={() => setActiveTab("view-details")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="success"
                      isLoading={isLoading}
                    >
                      Complete Review
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          )}

          {/* Analytics tab - basic stats and charts */}
          {activeTab === "analytics" && (
            <Card>
              <CardBody>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Weekly Update Analytics</h3>
                  <p className="text-gray-500">
                    Analytics features will be implemented in a future update.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Delete confirmation modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              Confirm Delete
            </ModalHeader>
            <ModalBody>
              <p>
                Are you sure you want to delete this weekly update? This action cannot be undone.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" color="default" onClick={onClose}>
                Cancel
              </Button>
              <Form method="post">
                <input type="hidden" name="_action" value="delete" />
                <input
                  type="hidden"
                  name="updateId"
                  value={updateToDelete?._id || ""}
                />
                <Button color="danger" type="submit">
                  Delete
                </Button>
              </Form>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminLayout>
  );
}
